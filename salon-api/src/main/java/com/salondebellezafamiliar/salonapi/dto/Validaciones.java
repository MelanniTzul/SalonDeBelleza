package com.salondebellezafamiliar.salonapi.dto;

// Expresiones reutilizadas en la validación de las solicitudes del catálogo
public final class Validaciones {

    // Identificador para URLs: minúsculas, dígitos y guiones ("corte-en-v")
    public static final String SLUG = "^[a-z0-9]+(-[a-z0-9]+)*$";

    // Ruta relativa de imagen: "img/..." (imágenes del sitio) o "uploads/..." (subidas por el administrador).
    // No admite URLs externas, "javascript:" ni ".." para evitar contenido remoto o salidas de carpeta.
    public static final String RUTA_IMAGEN = "^(?!.*\\.\\.)(img|uploads)/[A-Za-z0-9_./-]{1,200}$";

    // Encuadre de una foto, ej. "68% 58%" o "center 20%"
    public static final String POSICION_IMAGEN = "^[a-z0-9% ]{1,40}$";

    private Validaciones() {
    }
}
