package com.salondebellezafamiliar.salonapi.catalogo;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CatalogoPublicoTest extends BaseApiTest {

    @Test
    @DisplayName("El catálogo de servicios es público y trae los datos iniciales")
    void listaServiciosSinSesion() throws Exception {
        mvc.perform(get("/api/servicios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(14)))
                .andExpect(jsonPath("$[0].slug", is("corte-cabello")))
                .andExpect(jsonPath("$[0].categoria", is("cortes")))
                .andExpect(jsonPath("$[0].precio", is(150.00)))
                .andExpect(jsonPath("$[0].duracionMinutos", is(45)))
                .andExpect(jsonPath("$[0].grupoCortes", is("MUJERES")))
                .andExpect(jsonPath("$[1].precio", nullValue()))
                .andExpect(jsonPath("$[1].variantes", contains("Clásico", "Degradado", "A máquina")));
    }

    @Test
    @DisplayName("Los servicios se pueden filtrar por categoría")
    void filtraServiciosPorCategoria() throws Exception {
        mvc.perform(get("/api/servicios").param("categoria", "cejas-pestanas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].slug", containsInAnyOrder("planchado-cejas", "rizado-pestanas")));
    }

    @Test
    @DisplayName("Un servicio se consulta por su slug y uno inexistente da 404")
    void servicioPorSlug() throws Exception {
        mvc.perform(get("/api/servicios/tintes-cabello"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre", is("Tintes de cabello")))
                .andExpect(jsonPath("$.categoria", is("color")));
        mvc.perform(get("/api/servicios/no-existe"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Los productos traen marca, fijación, acabado y beneficios")
    void listaProductos() throws Exception {
        mvc.perform(get("/api/productos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(10)));
        mvc.perform(get("/api/productos/johnny-b-control"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.marca", is("Johnny B.")))
                .andExpect(jsonPath("$.nivelFijacion", is("MUY_FUERTE")))
                .andExpect(jsonPath("$.tipoAcabado", is("BRILLANTE")))
                .andExpect(jsonPath("$.imagen", is("img/productos/johnny-b-control.jpg")))
                .andExpect(jsonPath("$.beneficios", hasSize(3)));
        mvc.perform(get("/api/productos").param("categoria", "rizos"))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].posicionImagen", is("68% 58%")));
        mvc.perform(get("/api/productos/no-existe")).andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Las categorías se piden por tipo y vienen ordenadas")
    void categorias() throws Exception {
        mvc.perform(get("/api/categorias").param("tipo", "SERVICIO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].slug", contains("cortes", "color", "peinados", "cejas-pestanas", "maquillaje")));
        mvc.perform(get("/api/categorias").param("tipo", "PRODUCTO"))
                .andExpect(jsonPath("$[*].slug", contains("geles", "rizos")));
        mvc.perform(get("/api/categorias")).andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("El catálogo de cortes trae los cuatro grupos, con estilos y cortes")
    void catalogoDeCortes() throws Exception {
        mvc.perform(get("/api/cortes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].grupo", contains("MUJERES", "HOMBRES", "NINOS", "ABUELOS")))
                .andExpect(jsonPath("$[0].cortes", hasSize(12)))
                .andExpect(jsonPath("$[0].cortes[0].largo", is("LARGO")))
                .andExpect(jsonPath("$[0].estilos", hasSize(0)))
                .andExpect(jsonPath("$[1].cortes", hasSize(40)))
                .andExpect(jsonPath("$[1].estilos", hasSize(6)))
                .andExpect(jsonPath("$[1].cortes[0].estilo", is("rizos-y-ondas")))
                .andExpect(jsonPath("$[2].estilos[*].slug", contains("ninos", "ninas")))
                .andExpect(jsonPath("$[2].cortes", hasSize(40)))
                .andExpect(jsonPath("$[3].cortes", hasSize(0)));
    }

    @Test
    @DisplayName("Las escrituras no están permitidas en las rutas públicas")
    void noSePuedeEscribirSinSesion() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/servicios")
                        .contentType("application/json").content("{}"))
                .andExpect(status().isUnauthorized());
    }
}
