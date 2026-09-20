package com.salondebellezafamiliar.salonapi.dto;

public record AuthResponse(
        String token,
        String tipo,
        long expiraEnSegundos,
        UsuarioResponse usuario
) {
}
