package com.salondebellezafamiliar.salonapi.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

// Documentación de la API (Swagger UI en /docs). El botón "Authorize" recibe el token que devuelve
// POST /api/auth/login; con él se pueden probar las rutas de /api/admin.
@Configuration
@OpenAPIDefinition(
        info = @Info(title = "Salón de Belleza Familiar — API", version = "1.0"),
        security = @SecurityRequirement(name = "bearerAuth"))
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT")
public class OpenApiConfig {
}
