package com.salondebellezafamiliar.salonapi.dto;

import com.salondebellezafamiliar.salonapi.entity.NivelFijacion;
import com.salondebellezafamiliar.salonapi.entity.TipoAcabado;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record ProductoRequest(
        @NotBlank @Size(max = 100) @Pattern(regexp = Validaciones.SLUG, message = "Solo minúsculas, dígitos y guiones") String slug,
        @NotBlank @Size(max = 60) String categoria,
        @Size(max = 80) String marca,
        @NotBlank @Size(max = 150) String nombre,
        @Size(max = 5000) String descripcion,
        @DecimalMin("0.00") @Digits(integer = 8, fraction = 2) BigDecimal precio,
        @Size(max = 255) @Pattern(regexp = Validaciones.RUTA_IMAGEN, message = "Ruta de imagen no válida") String imagen,
        @Size(max = 255) @Pattern(regexp = Validaciones.RUTA_IMAGEN, message = "Ruta de imagen no válida") String imagenDetalle,
        @Pattern(regexp = Validaciones.POSICION_IMAGEN, message = "Encuadre no válido") String posicionImagen,
        @Size(max = 40) String fijacion,
        NivelFijacion nivelFijacion,
        @Size(max = 40) String acabado,
        TipoAcabado tipoAcabado,
        @Size(max = 12) List<@NotBlank @Size(max = 150) String> beneficios,
        Integer orden,
        Boolean activo
) {
}
