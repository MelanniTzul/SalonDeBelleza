package com.salondebellezafamiliar.salonapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Cambio de contrasena hecho por el propio usuario")
public record CambiarMiPasswordRequest(

        @Schema(description = "La contrasena con la que entro")
        @NotBlank String passwordActual,

        @Schema(description = "Minimo 8 caracteres")
        @NotBlank @Size(min = 8, max = 72) String passwordNueva
) {
}
