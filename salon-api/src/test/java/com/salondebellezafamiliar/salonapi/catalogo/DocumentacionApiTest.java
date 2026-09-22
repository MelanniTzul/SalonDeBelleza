package com.salondebellezafamiliar.salonapi.catalogo;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.hasKey;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class DocumentacionApiTest extends BaseApiTest {

    // Swagger lee la definición de /v3/api-docs. Si springdoc no es compatible con la versión de Spring
    // (por ejemplo, choca con nuestro @RestControllerAdvice) esa ruta responde 500 y Swagger UI no carga.
    @Test
    @DisplayName("La definición OpenAPI que lee Swagger se genera y describe el catálogo")
    void generaLaDefinicionOpenApi() throws Exception {
        mvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths", hasKey("/api/servicios")))
                .andExpect(jsonPath("$.paths", hasKey("/api/admin/imagenes")))
                .andExpect(jsonPath("$.paths", hasKey("/api/auth/login")))
                // Permite pegar el token en Swagger UI para probar /api/admin
                .andExpect(jsonPath("$.components.securitySchemes", hasKey("bearerAuth")));
    }

    @Test
    @DisplayName("La página de Swagger UI es accesible")
    void swaggerUiCarga() throws Exception {
        mvc.perform(get("/swagger-ui/index.html")).andExpect(status().isOk());
    }
}
