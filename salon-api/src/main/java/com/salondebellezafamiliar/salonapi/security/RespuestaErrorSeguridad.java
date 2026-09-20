package com.salondebellezafamiliar.salonapi.security;

import tools.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

// Devuelve 401 y 403 como JSON, no como la pagina HTML de Spring Security.
// Ojo: el ObjectMapper es el de Jackson 3 (tools.jackson), Boot 4 ya no trae el otro.
@Component
@RequiredArgsConstructor
public class RespuestaErrorSeguridad implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        escribir(request, response, HttpStatus.UNAUTHORIZED, "Debes iniciar sesión para acceder a este recurso");
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        escribir(request, response, HttpStatus.FORBIDDEN, "No tienes permisos para acceder a este recurso");
    }

    private void escribir(HttpServletRequest request, HttpServletResponse response,
                          HttpStatus estado, String mensaje) throws IOException {
        response.setStatus(estado.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status", estado.value(),
                "error", estado.getReasonPhrase(),
                "mensaje", mensaje,
                "path", request.getRequestURI()
        ));
    }
}
