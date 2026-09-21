package com.salondebellezafamiliar.salonapi.dto;

import com.salondebellezafamiliar.salonapi.entity.Usuario;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Datos publicos de un usuario")
public record UsuarioResponse(
        Long id,
        String nombre,
        String apellido,
        String email,
        String telefono,

        @Schema(description = "Ruta relativa de la foto, ej. uploads/perfiles/uuid.jpg. Null si no tiene.")
        String fotoUrl,

        String rol,
        boolean activo,

        @Schema(description = "Solo viene con dato si el usuario es ESTILISTA")
        String especialidad,

        LocalDateTime creadoEn
) {
    public static UsuarioResponse desde(Usuario usuario) {
        return desde(usuario, null);
    }

    public static UsuarioResponse desde(Usuario usuario, String especialidad) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getEmail(),
                usuario.getTelefono(),
                usuario.getFotoUrl(),
                usuario.getRol().name(),
                usuario.isActivo(),
                especialidad,
                usuario.getCreadoEn()
        );
    }
}
