package com.salondebellezafamiliar.salonapi.catalogo;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CatalogoAdminTest extends BaseApiTest {

    private static final String SERVICIO = """
            {"slug":"alisado-keratina","categoria":"cortes","nombre":"Alisado con keratina",
             "descripcion":"Cabello liso por más tiempo.","precio":350.00,"duracionMinutos":120,
             "aDomicilio":false,"variantes":["Corto","Largo"],"imagen":"img/salon-037.jpeg"}
            """;

    private ResultActions enviar(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder peticion, String token, String cuerpo) throws Exception {
        var p = peticion.contentType(MediaType.APPLICATION_JSON).content(cuerpo);
        return mvc.perform(token == null ? p : p.header("Authorization", token));
    }

    @Test
    @DisplayName("Sin sesión no se puede administrar el catálogo (401)")
    void sinSesion() throws Exception {
        enviar(post("/api/admin/servicios"), null, SERVICIO).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/servicios")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Un cliente no puede administrar el catálogo (403)")
    void clienteNoPuede() throws Exception {
        enviar(post("/api/admin/servicios"), tokenCliente(), SERVICIO).andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/productos").header("Authorization", tokenCliente())).andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Un token falso o alterado no da acceso y la respuesta es JSON con \"mensaje\"")
    void tokensInvalidos() throws Exception {
        mvc.perform(get("/api/admin/servicios").header("Authorization", "Bearer esto.no.es.un.jwt")).andExpect(status().isUnauthorized());
        String valido = tokenAdmin();
        mvc.perform(get("/api/admin/servicios").header("Authorization", valido.substring(0, valido.length() - 3) + "abc")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/servicios")).andExpect(status().isUnauthorized()).andExpect(jsonPath("$.mensaje", notNullValue()));
    }

    @Test
    @DisplayName("El administrador crea un servicio y aparece en el catálogo público")
    void creaServicio() throws Exception {
        String token = tokenAdmin();
        enviar(post("/api/admin/servicios"), token, SERVICIO)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.slug", is("alisado-keratina")))
                .andExpect(jsonPath("$.categoriaNombre", is("Cortes")))
                .andExpect(jsonPath("$.variantes", contains("Corto", "Largo")));

        mvc.perform(get("/api/servicios/alisado-keratina"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.precio", is(350.00)));
        mvc.perform(get("/api/servicios")).andExpect(jsonPath("$", hasSize(15)));

        // Mismo identificador otra vez: conflicto
        enviar(post("/api/admin/servicios"), token, SERVICIO).andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Los datos no válidos se rechazan con el detalle por campo (400)")
    void validaDatos() throws Exception {
        String malo = """
                {"slug":"Slug Malo","categoria":"cortes","nombre":"","precio":-5,
                 "aDomicilio":false,"imagen":"https://sitio-externo.com/foto.jpg"}
                """;
        enviar(post("/api/admin/servicios"), tokenAdmin(), malo)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.slug", notNullValue()))
                .andExpect(jsonPath("$.campos.nombre", notNullValue()))
                .andExpect(jsonPath("$.campos.precio", notNullValue()))
                .andExpect(jsonPath("$.campos.imagen", notNullValue()));
    }

    @Test
    @DisplayName("Las rutas de imagen con '..' o esquemas raros se rechazan")
    void rutasDeImagenPeligrosas() throws Exception {
        for (String ruta : new String[]{"img/../../etc/passwd", "javascript:alert(1)", "/etc/passwd", "uploads/../x.jpg"}) {
            String cuerpo = SERVICIO.replace("img/salon-037.jpeg", ruta);
            enviar(post("/api/admin/servicios"), tokenAdmin(), cuerpo).andExpect(status().isBadRequest());
        }
    }

    @Test
    @DisplayName("Una categoría inexistente o de otro tipo da 400")
    void categoriaInvalida() throws Exception {
        enviar(post("/api/admin/servicios"), tokenAdmin(), SERVICIO.replace("\"cortes\"", "\"geles\"")).andExpect(status().isBadRequest());
        enviar(post("/api/admin/servicios"), tokenAdmin(), SERVICIO.replace("\"cortes\"", "\"no-existe\"")).andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Editar y desactivar: el servicio sale del sitio pero se conserva y se puede reactivar")
    void editaDesactivaYReactiva() throws Exception {
        String token = tokenAdmin();
        String id = extraerId(enviar(post("/api/admin/servicios"), token, SERVICIO).andReturn().getResponse().getContentAsString());

        enviar(put("/api/admin/servicios/" + id), token, SERVICIO.replace("350.00", "400.00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.precio", is(400.00)));

        mvc.perform(delete("/api/admin/servicios/" + id).header("Authorization", token)).andExpect(status().isNoContent());
        mvc.perform(get("/api/servicios/alisado-keratina")).andExpect(status().isNotFound());
        mvc.perform(get("/api/servicios")).andExpect(jsonPath("$", hasSize(14)));
        mvc.perform(get("/api/admin/servicios").header("Authorization", token))
                .andExpect(jsonPath("$", hasSize(15)))
                .andExpect(jsonPath("$[?(@.slug == 'alisado-keratina')].activo", contains(false)));

        enviar(put("/api/admin/servicios/" + id), token, SERVICIO.replace("\"aDomicilio\"", "\"activo\":true,\"aDomicilio\""))
                .andExpect(status().isOk());
        mvc.perform(get("/api/servicios/alisado-keratina")).andExpect(status().isOk());

        mvc.perform(delete("/api/admin/servicios/99999").header("Authorization", token)).andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Crear un producto con beneficios y nivel de fijación")
    void creaProducto() throws Exception {
        String producto = """
                {"slug":"gel-prueba","categoria":"geles","marca":"Marca X","nombre":"Gel de prueba",
                 "descripcion":"Gel fuerte.","precio":45.50,"imagen":"img/productos/johnny-b-control.jpg",
                 "posicionImagen":"50% 50%","fijacion":"Fuerte","nivelFijacion":"FUERTE",
                 "acabado":"Mate","tipoAcabado":"MATE","beneficios":["Dura todo el día","Sin residuos"]}
                """;
        enviar(post("/api/admin/productos"), tokenAdmin(), producto)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.beneficios", contains("Dura todo el día", "Sin residuos")))
                .andExpect(jsonPath("$.nivelFijacion", is("FUERTE")));
        mvc.perform(get("/api/productos/gel-prueba")).andExpect(status().isOk());
        // La categoría debe ser de tipo producto
        enviar(post("/api/admin/productos"), tokenAdmin(), producto.replace("gel-prueba", "otro").replace("\"geles\"", "\"cortes\""))
                .andExpect(status().isBadRequest());
        // El encuadre solo admite valores seguros
        enviar(post("/api/admin/productos"), tokenAdmin(), producto.replace("gel-prueba", "otro2").replace("50% 50%", "50%;background:url(x)"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Crear un corte con estilo válido; con un estilo de otro grupo da 400")
    void creaCorte() throws Exception {
        String corte = """
                {"slug":"degradado-prueba","grupo":"HOMBRES","estilo":"degradado","nombre":"Degradado de prueba",
                 "descripcion":"Prueba.","imagen":"img/cortes-hombre/degradado/degradado-01.jpeg"}
                """;
        enviar(post("/api/admin/cortes"), tokenAdmin(), corte)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estilo", is("degradado")));
        mvc.perform(get("/api/cortes")).andExpect(jsonPath("$[1].cortes", hasSize(41)));
        enviar(post("/api/admin/cortes"), tokenAdmin(), corte.replace("degradado-prueba", "otro").replace("\"degradado\"", "\"ninas\""))
                .andExpect(status().isBadRequest());
        // Un grupo sin fotos (ABUELOS) se puede empezar a llenar
        enviar(post("/api/admin/cortes"), tokenAdmin(), corte.replace("degradado-prueba", "abuelo-1").replace("HOMBRES", "ABUELOS").replace("\"estilo\":\"degradado\",", ""))
                .andExpect(status().isCreated());
        mvc.perform(get("/api/cortes")).andExpect(jsonPath("$[3].cortes", hasSize(1)));
    }

    private static String extraerId(String json) {
        var m = java.util.regex.Pattern.compile("\"id\":(\\d+)").matcher(json);
        if (!m.find()) throw new IllegalStateException("Sin id en: " + json);
        return m.group(1);
    }
}
