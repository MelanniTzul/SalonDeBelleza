package com.salondebellezafamiliar.salonapi.catalogo;

import com.salondebellezafamiliar.salonapi.entity.Rol;
import com.salondebellezafamiliar.salonapi.entity.Usuario;
import com.salondebellezafamiliar.salonapi.repository.UsuarioRepository;
import com.salondebellezafamiliar.salonapi.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

// Pruebas de integración con la API completa y una base MySQL real (Flyway aplica V1 y V2 al iniciar).
// Cada prueba corre en una transacción que se revierte, así la base queda intacta.
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
abstract class BaseApiTest {

    // Las imágenes subidas por las pruebas van a una carpeta temporal
    static final Path CARPETA_SUBIDAS = crearCarpetaTemporal();

    @DynamicPropertySource
    static void propiedades(DynamicPropertyRegistry registro) {
        registro.add("app.uploads.dir", CARPETA_SUBIDAS::toString);
    }

    @Autowired
    protected MockMvc mvc;
    @Autowired
    protected JwtService jwtService;
    @Autowired
    protected UsuarioRepository usuarioRepository;

    private static Path crearCarpetaTemporal() {
        try {
            return Files.createTempDirectory("salon-uploads-test");
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }

    protected String tokenAdmin() {
        return "Bearer " + jwtService.generarToken(crearUsuario(Rol.ADMINISTRADOR, true).getEmail(), "ADMINISTRADOR");
    }

    protected String tokenCliente() {
        return "Bearer " + jwtService.generarToken(crearUsuario(Rol.CLIENTE, true).getEmail(), "CLIENTE");
    }

    protected Usuario crearUsuario(Rol rol, boolean activo) {
        Usuario usuario = Usuario.builder()
                .nombre("Prueba").apellido("Api")
                .email(UUID.randomUUID() + "@prueba.test")
                .passwordHash("no-se-usa")
                .rol(rol)
                .dobleFactorActivo(false)
                .activo(activo)
                .build();
        return usuarioRepository.saveAndFlush(usuario);
    }
}
