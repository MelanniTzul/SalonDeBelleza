package com.salondebellezafamiliar.salonapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Reinicio de contrasena hecho por el administrador")
public record CambiarPasswordRequest(

        @Schema(description = "Minimo 8 caracteres")
        @NotBlank @Size(min = 8, max = 72) String password
) {
}
