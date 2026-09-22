package com.salondebellezafamiliar.salonapi.dto;

import com.salondebellezafamiliar.salonapi.entity.GrupoCortes;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record ServicioRequest(
        @NotBlank @Size(max = 100) @Pattern(regexp = Validaciones.SLUG, message = "Solo minúsculas, dígitos y guiones") String slug,
        @NotBlank @Size(max = 60) String categoria,
        @NotBlank @Size(max = 150) String nombre,
        @Size(max = 5000) String descripcion,
        @DecimalMin("0.00") @Digits(integer = 8, fraction = 2) BigDecimal precio,
        @Positive Integer duracionMinutos,
        boolean aDomicilio,
        @Size(max = 10) List<@NotBlank @Size(max = 80) String> variantes,
        GrupoCortes grupoCortes,
        @Size(max = 255) @Pattern(regexp = Validaciones.RUTA_IMAGEN, message = "Ruta de imagen no válida") String imagen,
        Integer orden,
        Boolean activo
) {
}
