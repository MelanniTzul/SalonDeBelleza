package com.salondebellezafamiliar.salonapi.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

// Todos los errores salen igual, con un campo "mensaje" que el front muestra tal cual.
// Extiende ResponseEntityExceptionHandler para que los errores propios de Spring MVC (JSON mal formado,
// parámetro faltante o inválido, ruta inexistente, método no permitido...) conserven su código 4xx en lugar de
// caer en el "error inesperado" (500), y salgan con este mismo formato.
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpHeaders headers,
                                                                  HttpStatusCode status, WebRequest request) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            campos.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        Map<String, Object> cuerpo = base(HttpStatus.BAD_REQUEST, "Revisa los datos enviados", ruta(request));
        cuerpo.put("campos", campos);
        return ResponseEntity.badRequest().body(cuerpo);
    }

    @Override
    protected ResponseEntity<Object> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex, HttpHeaders headers,
                                                                          HttpStatusCode status, WebRequest request) {
        return respuesta(HttpStatus.CONTENT_TOO_LARGE, "La imagen supera el tamaño permitido (5 MB)", ruta(request));
    }

    // Resto de errores de Spring MVC: mismo código de estado, con el cuerpo en español
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body, HttpHeaders headers,
                                                             HttpStatusCode statusCode, WebRequest request) {
        HttpStatus estado = HttpStatus.valueOf(statusCode.value());
        return respuesta(estado, mensajeGeneral(estado), ruta(request));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> estado(ResponseStatusException ex, HttpServletRequest request) {
        HttpStatus estado = HttpStatus.valueOf(ex.getStatusCode().value());
        String mensaje = ex.getReason() != null ? ex.getReason() : estado.getReasonPhrase();
        return ResponseEntity.status(estado).body(base(estado, mensaje, request.getRequestURI()));
    }

    // Por ejemplo, un identificador duplicado que se coló entre dos solicitudes simultáneas
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> integridad(DataIntegrityViolationException ex, HttpServletRequest request) {
        log.warn("Conflicto de datos en {}: {}", request.getRequestURI(), ex.getMostSpecificCause().getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(base(HttpStatus.CONFLICT, "Los datos entran en conflicto con un registro existente", request.getRequestURI()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> general(Exception ex, HttpServletRequest request) {
        // La traza va al log, no al cliente.
        log.error("Error no controlado en {}", request.getRequestURI(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(base(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error inesperado", request.getRequestURI()));
    }

    private static String mensajeGeneral(HttpStatus estado) {
        return switch (estado) {
            case BAD_REQUEST -> "La solicitud no es válida";
            case NOT_FOUND -> "No se encontró lo que buscas";
            case METHOD_NOT_ALLOWED -> "Método no permitido para esta ruta";
            case NOT_ACCEPTABLE -> "Formato de respuesta no disponible";
            case UNSUPPORTED_MEDIA_TYPE -> "Formato de datos no admitido";
            case CONTENT_TOO_LARGE -> "El archivo es demasiado grande";
            default -> estado.is5xxServerError() ? "Ocurrió un error inesperado" : estado.getReasonPhrase();
        };
    }

    private static String ruta(WebRequest request) {
        return request instanceof ServletWebRequest web ? web.getRequest().getRequestURI() : "";
    }

    private static ResponseEntity<Object> respuesta(HttpStatus estado, String mensaje, String ruta) {
        return ResponseEntity.status(estado).body(base(estado, mensaje, ruta));
    }

    private static Map<String, Object> base(HttpStatus estado, String mensaje, String ruta) {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("timestamp", LocalDateTime.now().toString());
        cuerpo.put("status", estado.value());
        cuerpo.put("error", estado.getReasonPhrase());
        cuerpo.put("mensaje", mensaje);
        cuerpo.put("path", ruta);
        return cuerpo;
    }
}
