package com.salondebellezafamiliar.salonapi.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

// Guarda las imágenes que sube el administrador. El formato se detecta por el contenido del archivo
// (no por el nombre ni el Content-Type que envía el cliente) y el nombre final lo genera el servidor.
@Service
public class ImagenService {

    private static final Set<String> CARPETAS = Set.of("servicios", "productos", "cortes");
    private static final long TAMANO_MAXIMO = 5L * 1024 * 1024;

    private final Path raiz;

    public ImagenService(@Value("${app.uploads.dir}") String directorio) {
        this.raiz = Path.of(directorio).toAbsolutePath().normalize();
    }

    /** Devuelve la ruta relativa que se guarda en la base, ej. "uploads/productos/3f2a....jpg". */
    public String guardar(MultipartFile archivo, String carpeta) {
        if (!CARPETAS.contains(carpeta)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Carpeta no válida. Usa: servicios, productos o cortes");
        }
        if (archivo == null || archivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se recibió ninguna imagen");
        }
        if (archivo.getSize() > TAMANO_MAXIMO) {
            throw new ResponseStatusException(HttpStatus.CONTENT_TOO_LARGE, "La imagen supera los 5 MB");
        }
        try {
            String extension = detectarExtension(archivo);
            String nombre = UUID.randomUUID() + "." + extension;
            Path destino = raiz.resolve(carpeta).resolve(nombre).normalize();
            if (!destino.startsWith(raiz)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ruta no válida");
            }
            Files.createDirectories(destino.getParent());
            try (InputStream in = archivo.getInputStream()) {
                Files.copy(in, destino, StandardCopyOption.REPLACE_EXISTING);
            }
            return "uploads/" + carpeta + "/" + nombre;
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo guardar la imagen", e);
        }
    }

    // JPEG (FF D8 FF), PNG (89 50 4E 47) y WebP (RIFF....WEBP)
    private static String detectarExtension(MultipartFile archivo) throws IOException {
        byte[] b;
        try (InputStream in = archivo.getInputStream()) {
            b = in.readNBytes(12);
        }
        if (b.length >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) return "jpg";
        if (b.length >= 4 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') return "png";
        if (b.length >= 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F' && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') return "webp";
        throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Formato no admitido. Usa JPG, PNG o WebP");
    }
}
