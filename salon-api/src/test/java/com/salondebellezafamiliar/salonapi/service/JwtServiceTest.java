package com.salondebellezafamiliar.salonapi.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRETO = "clave-de-pruebas-suficientemente-larga-1234567890";

    private final JwtService jwtService = new JwtService(SECRETO, 60);

    @Test
    void generaUnTokenQueContieneElCorreoYElRol() {
        String token = jwtService.generarToken("ana@correo.com", "CLIENTE");

        Claims claims = jwtService.leerClaims(token);

        assertThat(claims.getSubject()).isEqualTo("ana@correo.com");
        assertThat(claims.get("rol", String.class)).isEqualTo("CLIENTE");
        assertThat(claims.getExpiration()).isAfter(claims.getIssuedAt());
    }

    @Test
    void rechazaUnTokenAlterado() {
        String token = jwtService.generarToken("ana@correo.com", "CLIENTE") + "alterado";

        assertThat(jwtService.esValido(token)).isFalse();
        assertThatThrownBy(() -> jwtService.leerClaims(token)).isInstanceOf(JwtException.class);
    }

    @Test
    void rechazaUnTokenFirmadoConOtraClave() {
        String token = new JwtService("otra-clave-distinta-igual-de-larga-0987654321", 60)
                .generarToken("ana@correo.com", "CLIENTE");

        assertThat(jwtService.esValido(token)).isFalse();
    }

    @Test
    void rechazaUnTokenYaExpirado() throws InterruptedException {
        // Expiración de 0 minutos: el token nace vencido.
        String token = new JwtService(SECRETO, 0).generarToken("ana@correo.com", "CLIENTE");
        Thread.sleep(1_100);

        assertThat(jwtService.esValido(token)).isFalse();
    }

    @Test
    void noArrancaConUnSecretoDemasiadoCorto() {
        assertThatThrownBy(() -> new JwtService("corto", 60))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("32 caracteres");
    }
}
