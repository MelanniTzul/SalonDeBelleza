package com.salondebellezafamiliar.salonapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Datos que el propio usuario puede editar. El correo y el rol no se cambian aqui.")
public record ActualizarPerfilRequest(

        @Schema(example = "Ana")
        @NotBlank @Size(max = 100) String nombre,

        @Schema(example = "Rodriguez")
        @NotBlank @Size(max = 100) String apellido,

        @Schema(example = "5555-2020")
        @Size(max = 20) String telefono,

        @Schema(description = "Solo se toma en cuenta si el usuario es ESTILISTA", example = "Corte y color")
        @Size(max = 150) String especialidad
) {
}
