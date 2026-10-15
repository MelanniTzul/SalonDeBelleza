package com.salondebellezafamiliar.salonapi.dto;

import com.salondebellezafamiliar.salonapi.entity.TipoCategoria;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoriaRequest(
        @NotBlank @Size(max = 60) @Pattern(regexp = Validaciones.SLUG, message = "Solo minúsculas, dígitos y guiones") String slug,
        @NotBlank @Size(max = 100) String nombre,
        @NotNull TipoCategoria tipo,
        Integer orden,
        Boolean activo
) {
}
