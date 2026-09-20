package com.salondebellezafamiliar.salonapi.dto;

import com.salondebellezafamiliar.salonapi.entity.Usuario;

/** Datos del usuario autenticado que consume el frontend. */
public record UsuarioResponse(
        Long id,
        String nombre,
        String apellido,
        String email,
        String telefono,
        String rol
) {
    public static UsuarioResponse desde(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getEmail(),
                usuario.getTelefono(),
                usuario.getRol().name()
        );
    }
}
