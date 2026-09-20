package com.salondebellezafamiliar.salonapi.controller;

import com.salondebellezafamiliar.salonapi.dto.AuthResponse;
import com.salondebellezafamiliar.salonapi.dto.LoginRequest;
import com.salondebellezafamiliar.salonapi.dto.RegistroRequest;
import com.salondebellezafamiliar.salonapi.dto.UsuarioResponse;
import com.salondebellezafamiliar.salonapi.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Registro, inicio de sesión y perfil del usuario")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Registra un cliente nuevo y devuelve su token")
    public ResponseEntity<AuthResponse> registrar(@Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registrar(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Valida las credenciales y devuelve el token de sesión")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    @Operation(summary = "Devuelve el usuario dueño del token enviado")
    public UsuarioResponse perfil(@AuthenticationPrincipal String email) {
        return authService.perfil(email);
    }
}
