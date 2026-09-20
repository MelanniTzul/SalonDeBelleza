package com.salondebellezafamiliar.salonapi.dto;

import com.salondebellezafamiliar.salonapi.entity.Rol;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Alta de usuario hecha por el administrador")
public record CrearUsuarioRequest(

        @Schema(example = "Andrea")
        @NotBlank @Size(max = 100) String nombre,

        @Schema(example = "Lopez")
        @NotBlank @Size(max = 100) String apellido,

        @Schema(example = "andrea@salondebellezafamiliar.com")
        @NotBlank @Email @Size(max = 150) String email,

        @Schema(example = "5555-4040")
        @Size(max = 20) String telefono,

        @Schema(description = "Minimo 8 caracteres", example = "Estilista1234!")
        @NotBlank @Size(min = 8, max = 72) String password,

        @Schema(description = "Rol del usuario nuevo")
        @NotNull Rol rol,

        @Schema(description = "Solo aplica si el rol es ESTILISTA", example = "Corte y color")
        @Size(max = 150) String especialidad
) {
}
