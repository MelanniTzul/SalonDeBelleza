package com.salondebellezafamiliar.salonapi.controller;

import com.salondebellezafamiliar.salonapi.dto.AuthResponse;
import com.salondebellezafamiliar.salonapi.dto.LoginRequest;
import com.salondebellezafamiliar.salonapi.dto.RegistroRequest;
import com.salondebellezafamiliar.salonapi.dto.UsuarioResponse;
import com.salondebellezafamiliar.salonapi.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
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
@Tag(name = "Autenticacion", description = "Registro publico, inicio de sesion y perfil")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @SecurityRequirements
    @Operation(summary = "Registro publico de clientes",
               description = "Abierto a cualquiera desde la pagina principal. El usuario siempre queda como CLIENTE; "
                           + "estilistas y administradores los da de alta el admin en /api/admin/usuarios.")
    @ApiResponse(responseCode = "201", description = "Cuenta creada, ya viene con token")
    @ApiResponse(responseCode = "409", description = "Ese correo ya esta registrado", content = @Content())
    public ResponseEntity<AuthResponse> registrar(@Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registrar(request));
    }

    @PostMapping("/login")
    @SecurityRequirements
    @Operation(summary = "Inicia sesion y devuelve el token")
    @ApiResponse(responseCode = "200", description = "Token listo para usar en el boton Authorize")
    @ApiResponse(responseCode = "401", description = "Correo o contrasena incorrectos", content = @Content())
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Devuelve el usuario dueno del token")
    @ApiResponse(responseCode = "401", description = "Falta el token o ya vencio", content = @Content())
    public UsuarioResponse perfil(@AuthenticationPrincipal String email) {
        return authService.perfil(email);
    }
}
