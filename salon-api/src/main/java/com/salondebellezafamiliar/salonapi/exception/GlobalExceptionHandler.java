package com.salondebellezafamiliar.salonapi.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

// Todos los errores salen igual, con un campo "mensaje" que el front muestra tal cual.
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validacion(MethodArgumentNotValidException ex,
                                                          HttpServletRequest request) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            campos.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        Map<String, Object> cuerpo = base(HttpStatus.BAD_REQUEST, "Revisa los datos enviados", request);
        cuerpo.put("campos", campos);
        return ResponseEntity.badRequest().body(cuerpo);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> estado(ResponseStatusException ex, HttpServletRequest request) {
        HttpStatus estado = HttpStatus.valueOf(ex.getStatusCode().value());
        String mensaje = ex.getReason() != null ? ex.getReason() : estado.getReasonPhrase();
        return ResponseEntity.status(estado).body(base(estado, mensaje, request));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> general(Exception ex, HttpServletRequest request) {
        // La traza va al log, no al cliente.
        log.error("Error no controlado en {}", request.getRequestURI(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(base(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error inesperado", request));
    }

    private Map<String, Object> base(HttpStatus estado, String mensaje, HttpServletRequest request) {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("timestamp", LocalDateTime.now().toString());
        cuerpo.put("status", estado.value());
        cuerpo.put("error", estado.getReasonPhrase());
        cuerpo.put("mensaje", mensaje);
        cuerpo.put("path", request.getRequestURI());
        return cuerpo;
    }
}
