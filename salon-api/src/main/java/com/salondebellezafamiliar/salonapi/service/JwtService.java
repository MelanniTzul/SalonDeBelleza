package com.salondebellezafamiliar.salonapi.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMinutes;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        // HS256 exige una clave de al menos 256 bits; si es más corta el token
        // sería trivial de falsificar, así que se corta el arranque.
        if (bytes.length < 32) {
            throw new IllegalStateException(
                    "app.jwt.secret debe tener al menos 32 caracteres (256 bits) para firmar tokens HS256");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
        this.expirationMinutes = expirationMinutes;
    }

    public String generarToken(String email, String rol) {
        Date ahora = new Date();
        Date expira = new Date(ahora.getTime() + expirationMinutes * 60_000);
        return Jwts.builder()
                .subject(email)
                .claim("rol", rol)
                .issuedAt(ahora)
                .expiration(expira)
                .signWith(key)
                .compact();
    }

    /** Lanza JwtException si el token está expirado, alterado o mal formado. */
    public Claims leerClaims(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public boolean esValido(String token) {
        try {
            leerClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public long getExpiracionSegundos() {
        return expirationMinutes * 60;
    }
}
