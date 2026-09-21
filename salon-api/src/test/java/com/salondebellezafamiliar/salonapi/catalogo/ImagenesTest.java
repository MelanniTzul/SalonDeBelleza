package com.salondebellezafamiliar.salonapi.catalogo;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ImagenesTest extends BaseApiTest {

    // Cabeceras mínimas de cada formato
    private static byte[] jpeg() {
        byte[] b = new byte[64];
        b[0] = (byte) 0xFF; b[1] = (byte) 0xD8; b[2] = (byte) 0xFF; b[3] = (byte) 0xE0;
        return b;
    }

    private static byte[] png() {
        byte[] b = new byte[64];
        b[0] = (byte) 0x89; b[1] = 'P'; b[2] = 'N'; b[3] = 'G';
        return b;
    }

    private static byte[] webp() {
        byte[] b = new byte[64];
        System.arraycopy("RIFF".getBytes(StandardCharsets.US_ASCII), 0, b, 0, 4);
        System.arraycopy("WEBP".getBytes(StandardCharsets.US_ASCII), 0, b, 8, 4);
        return b;
    }

    @Test
    @DisplayName("Sube una imagen válida y luego se puede ver sin iniciar sesión")
    void subeYSirveLaImagen() throws Exception {
        var archivo = new MockMultipartFile("archivo", "foto.jpg", "image/jpeg", jpeg());
        String respuesta = mvc.perform(multipart("/api/admin/imagenes").file(archivo).param("carpeta", "productos").header("Authorization", tokenAdmin()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.url", matchesPattern("uploads/productos/[0-9a-f-]{36}\\.jpg")))
                .andReturn().getResponse().getContentAsString();
        String url = respuesta.replaceAll(".*\"url\":\"([^\"]+)\".*", "$1");

        mvc.perform(get("/" + url))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/jpeg"))
                .andExpect(header().string("Cache-Control", containsString("immutable")));
    }

    @Test
    @DisplayName("Acepta PNG y WebP")
    void aceptaOtrosFormatos() throws Exception {
        for (var caso : new Object[][]{{png(), "png"}, {webp(), "webp"}}) {
            var archivo = new MockMultipartFile("archivo", "x." + caso[1], "application/octet-stream", (byte[]) caso[0]);
            mvc.perform(multipart("/api/admin/imagenes").file(archivo).param("carpeta", "cortes").header("Authorization", tokenAdmin()))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.url", endsWith("." + caso[1])));
        }
    }

    @Test
    @DisplayName("Rechaza un archivo que no es imagen aunque se llame .jpg (415)")
    void rechazaContenidoFalso() throws Exception {
        var falso = new MockMultipartFile("archivo", "foto.jpg", "image/jpeg", "<script>alert(1)</script>".getBytes(StandardCharsets.UTF_8));
        mvc.perform(multipart("/api/admin/imagenes").file(falso).param("carpeta", "productos").header("Authorization", tokenAdmin()))
                .andExpect(status().isUnsupportedMediaType());
    }

    @Test
    @DisplayName("Rechaza imágenes de más de 5 MB (413) y archivos vacíos (400)")
    void rechazaTamanos() throws Exception {
        byte[] grande = Arrays.copyOf(jpeg(), 5 * 1024 * 1024 + 1);
        mvc.perform(multipart("/api/admin/imagenes").file(new MockMultipartFile("archivo", "g.jpg", "image/jpeg", grande))
                        .param("carpeta", "productos").header("Authorization", tokenAdmin()))
                .andExpect(status().isContentTooLarge());
        mvc.perform(multipart("/api/admin/imagenes").file(new MockMultipartFile("archivo", "v.jpg", "image/jpeg", new byte[0]))
                        .param("carpeta", "productos").header("Authorization", tokenAdmin()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("La carpeta destino solo puede ser servicios, productos o cortes")
    void carpetaNoValida() throws Exception {
        var archivo = new MockMultipartFile("archivo", "foto.jpg", "image/jpeg", jpeg());
        for (String carpeta : new String[]{"../fuera", "otra", "productos/../../x", ""}) {
            mvc.perform(multipart("/api/admin/imagenes").file(archivo).param("carpeta", carpeta).header("Authorization", tokenAdmin()))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    @DisplayName("Subir imágenes exige ser administrador")
    void exigeAdministrador() throws Exception {
        var archivo = new MockMultipartFile("archivo", "foto.jpg", "image/jpeg", jpeg());
        mvc.perform(multipart("/api/admin/imagenes").file(archivo).param("carpeta", "productos")).andExpect(status().isUnauthorized());
        mvc.perform(multipart("/api/admin/imagenes").file(archivo).param("carpeta", "productos").header("Authorization", tokenCliente()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("No se pueden leer archivos fuera de la carpeta de subidas")
    void noSalePorRutas() throws Exception {
        for (String ruta : new String[]{"/uploads/../application.yaml", "/uploads/%2e%2e/application.yaml", "/uploads/..%2f..%2fetc/passwd"}) {
            mvc.perform(get(ruta)).andExpect(status().is4xxClientError());
        }
    }
}
