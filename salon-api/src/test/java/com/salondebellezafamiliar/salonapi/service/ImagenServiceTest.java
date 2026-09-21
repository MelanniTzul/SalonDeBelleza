package com.salondebellezafamiliar.salonapi.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImagenServiceTest {

    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0};

    @TempDir
    Path carpeta;

    @Test
    void guardaEnPerfilesYDevuelveRutaRelativa() throws Exception {
        ImagenService servicio = new ImagenService(carpeta.toString());

        String ruta = servicio.guardar(new MockMultipartFile("archivo", "yo.png", "image/png", PNG), "perfiles");

        assertThat(ruta).startsWith("uploads/perfiles/").endsWith(".png");
        assertThat(Files.exists(carpeta.resolve(ruta.substring("uploads/".length())))).isTrue();
    }

    @Test
    void eliminarBorraElArchivoQueGuardo() throws Exception {
        ImagenService servicio = new ImagenService(carpeta.toString());
        String ruta = servicio.guardar(new MockMultipartFile("archivo", "yo.png", "image/png", PNG), "perfiles");
        Path archivo = carpeta.resolve(ruta.substring("uploads/".length()));
        assertThat(Files.exists(archivo)).isTrue();

        servicio.eliminar(ruta);

        assertThat(Files.exists(archivo)).isFalse();
    }

    @Test
    void eliminarIgnoraNullYRutasQueNoSonDeUploads() throws Exception {
        ImagenService servicio = new ImagenService(carpeta.toString());
        Path ajeno = carpeta.resolve("ajeno.txt");
        Files.writeString(ajeno, "no me borres");

        servicio.eliminar(null);
        servicio.eliminar("img/salon.jpeg");
        servicio.eliminar("uploads/../ajeno.txt");

        assertThat(Files.exists(ajeno)).isTrue();
    }

    @Test
    void eliminarNoRevientaSiElArchivoYaNoExiste() {
        ImagenService servicio = new ImagenService(carpeta.toString());

        servicio.eliminar("uploads/perfiles/no-existe.jpg");
    }

    @Test
    void rechazaArchivosQueNoSonImagen() {
        ImagenService servicio = new ImagenService(carpeta.toString());
        MockMultipartFile texto = new MockMultipartFile("archivo", "virus.exe", "image/png", "MZ hola".getBytes());

        assertThatThrownBy(() -> servicio.guardar(texto, "perfiles"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    }
}
