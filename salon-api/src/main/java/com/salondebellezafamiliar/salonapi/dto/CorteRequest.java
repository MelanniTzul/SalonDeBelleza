package com.salondebellezafamiliar.salonapi.dto;

import com.salondebellezafamiliar.salonapi.entity.AcabadoCorte;
import com.salondebellezafamiliar.salonapi.entity.GrupoCortes;
import com.salondebellezafamiliar.salonapi.entity.LargoCorte;
import jakarta.validation.constraints.*;

public record CorteRequest(
        @NotBlank @Size(max = 100) @Pattern(regexp = Validaciones.SLUG, message = "Solo minúsculas, dígitos y guiones") String slug,
        @NotNull GrupoCortes grupo,
        // Slug del estilo dentro del grupo (opcional)
        @Size(max = 60) String estilo,
        @NotBlank @Size(max = 120) String nombre,
        @Size(max = 500) String descripcion,
        @NotBlank @Size(max = 255) @Pattern(regexp = Validaciones.RUTA_IMAGEN, message = "Ruta de imagen no válida") String imagen,
        LargoCorte largo,
        AcabadoCorte acabado,
        Boolean flequillo,
        Integer orden,
        Boolean activo
) {
}
