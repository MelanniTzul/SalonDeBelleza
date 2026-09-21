package com.salondebellezafamiliar.salonapi.config;

<<<<<<< HEAD
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String ESQUEMA_JWT = "bearerAuth";

    @Bean
    public OpenAPI salonOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Salon de Belleza Familiar")
                        .version("v1")
                        .description("""
                                Agendamiento de citas del salon.

                                Para probar los endpoints protegidos: hacer login, copiar el token
                                y pegarlo en el boton Authorize de arriba (sin escribir "Bearer").

                                Usuarios de prueba:
                                - admin@salondebellezafamiliar.com / Admin1234!
                                - marisol@salondebellezafamiliar.com / Estilista1234!
                                - cliente@correo.com / Cliente1234!
                                """)
                        .contact(new Contact().name("Salon de Belleza Familiar")))
                .addSecurityItem(new SecurityRequirement().addList(ESQUEMA_JWT))
                .components(new Components().addSecuritySchemes(ESQUEMA_JWT,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Token que devuelve /api/auth/login")));
    }
=======
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
>>>>>>> feature/Servicios
}
