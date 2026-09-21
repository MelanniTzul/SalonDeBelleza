package com.salondebellezafamiliar.salonapi.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.LinkedHashMap;
import java.util.Map;

// Respuestas de error uniformes (application/problem+json) para toda la API.
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    // Validación de solicitudes: 400 con el detalle por campo
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpHeaders headers,
                                                                  HttpStatusCode status, WebRequest request) {
        Map<String, String> errores = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errores.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        ProblemDetail problema = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Hay datos que no son válidos");
        problema.setProperty("errores", errores);
        return ResponseEntity.badRequest().body(problema);
    }

    @Override
    protected ResponseEntity<Object> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex, HttpHeaders headers,
                                                                          HttpStatusCode status, WebRequest request) {
        ProblemDetail problema = ProblemDetail.forStatusAndDetail(HttpStatus.CONTENT_TOO_LARGE, "La imagen supera el tamaño permitido (5 MB)");
        return ResponseEntity.status(HttpStatus.CONTENT_TOO_LARGE).body(problema);
    }

    // Por ejemplo, un identificador duplicado que se coló entre dos solicitudes simultáneas
    @ExceptionHandler(DataIntegrityViolationException.class)
    ProblemDetail conflictoDeDatos() {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Los datos entran en conflicto con un registro existente");
    }
}
