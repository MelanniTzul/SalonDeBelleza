package com.salondebellezafamiliar.salonapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Datos editables de un usuario. El rol y la contrasena no se tocan aqui.")
public record ActualizarUsuarioRequest(

        @NotBlank @Size(max = 100) String nombre,

        @NotBlank @Size(max = 100) String apellido,

        @NotBlank @Email @Size(max = 150) String email,

        @Size(max = 20) String telefono,

        @Schema(description = "Solo aplica si el usuario es ESTILISTA")
        @Size(max = 150) String especialidad
) {
}
