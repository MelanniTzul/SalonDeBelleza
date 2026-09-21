package com.salondebellezafamiliar.salonapi.config;

import com.salondebellezafamiliar.salonapi.entity.Usuario;
import com.salondebellezafamiliar.salonapi.repository.UsuarioRepository;
import com.salondebellezafamiliar.salonapi.service.JwtService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

// Lee el token "Authorization: Bearer ..." y autentica la solicitud. El rol se toma de la base de datos
// (no del token) para que un cambio de rol o una cuenta desactivada surta efecto de inmediato.
// Si el token falta o no es válido, la solicitud sigue sin autenticar y SecurityConfig decide qué hacer.
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String PREFIJO = "Bearer ";

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String cabecera = request.getHeader("Authorization");
        if (cabecera != null && cabecera.startsWith(PREFIJO)) {
            try {
                String email = jwtService.leerClaims(cabecera.substring(PREFIJO.length())).getSubject();
                usuarioRepository.findByEmail(email).filter(Usuario::isActivo).ifPresent(usuario -> {
                    var autenticacion = new UsernamePasswordAuthenticationToken(
                            usuario.getEmail(), null, List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name())));
                    SecurityContextHolder.getContext().setAuthentication(autenticacion);
                });
            } catch (JwtException | IllegalArgumentException e) {
                log.debug("Token rechazado: {}", e.getMessage());
            }
        }
        chain.doFilter(request, response);
    }
}
