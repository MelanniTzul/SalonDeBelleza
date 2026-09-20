package com.salondebellezafamiliar.salonapi.security;

import com.salondebellezafamiliar.salonapi.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Lee el token "Authorization: Bearer ..." de cada petición y, si es válido,
 * deja al usuario autenticado en el contexto de Spring Security con su rol.
 * Si no hay token o es inválido simplemente no autentica: la cadena de
 * seguridad decidirá después si la ruta necesitaba autenticación.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String PREFIJO = "Bearer ";

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith(PREFIJO)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(PREFIJO.length()).trim();
        try {
            Claims claims = jwtService.leerClaims(token);
            String email = claims.getSubject();
            String rol = claims.get("rol", String.class);

            if (email != null && rol != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Spring Security espera el prefijo ROLE_ para usar hasRole(...)
                var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + rol));
                var auth = new UsernamePasswordAuthenticationToken(email, null, authorities);
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (JwtException | IllegalArgumentException e) {
            // Token expirado, alterado o mal formado: se sigue sin autenticar.
            log.debug("Token JWT rechazado: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
