package com.salondebellezafamiliar.salonapi.controller;

import com.salondebellezafamiliar.salonapi.dto.ActualizarPerfilRequest;
import com.salondebellezafamiliar.salonapi.dto.CambiarMiPasswordRequest;
import com.salondebellezafamiliar.salonapi.dto.UsuarioResponse;
import com.salondebellezafamiliar.salonapi.service.PerfilService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/perfil")
@RequiredArgsConstructor
@Tag(name = "Mi perfil", description = "Lo que cualquier usuario autenticado puede ver y editar de su propia cuenta")
@ApiResponse(responseCode = "401", description = "Falta el token o ya vencio", content = @Content())
public class PerfilController {

    private final PerfilService perfilService;

    @GetMapping
    @Operation(summary = "Devuelve mi perfil")
    public UsuarioResponse obtener(@AuthenticationPrincipal String email) {
        return perfilService.obtener(email);
    }

    @PutMapping
    @Operation(summary = "Edita mi nombre, apellido, telefono y especialidad",
               description = "El correo no se cambia desde aqui porque es la identidad del token.")
    public UsuarioResponse actualizar(@AuthenticationPrincipal String email,
                                      @Valid @RequestBody ActualizarPerfilRequest request) {
        return perfilService.actualizar(email, request);
    }

    @PutMapping("/password")
    @Operation(summary = "Cambia mi contrasena", description = "Pide la contrasena actual para confirmar.")
    @ApiResponse(responseCode = "204", description = "Contrasena actualizada")
    @ApiResponse(responseCode = "400", description = "La actual no coincide o la nueva es igual", content = @Content())
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cambiarPassword(@AuthenticationPrincipal String email,
                                @Valid @RequestBody CambiarMiPasswordRequest request) {
        perfilService.cambiarPassword(email, request);
    }

    @PostMapping(value = "/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Sube o reemplaza mi foto de perfil",
               description = "Campo multipart \"archivo\". JPG, PNG o WebP de hasta 5 MB. "
                           + "La foto queda disponible en /uploads/perfiles/... y la anterior se borra.")
    @ApiResponse(responseCode = "413", description = "La imagen supera los 5 MB", content = @Content())
    @ApiResponse(responseCode = "415", description = "No es JPG, PNG ni WebP", content = @Content())
    public UsuarioResponse subirFoto(@AuthenticationPrincipal String email,
                                     @RequestParam("archivo") MultipartFile archivo) {
        return perfilService.subirFoto(email, archivo);
    }

    @DeleteMapping("/foto")
    @Operation(summary = "Quita mi foto de perfil")
    public UsuarioResponse eliminarFoto(@AuthenticationPrincipal String email) {
        return perfilService.eliminarFoto(email);
    }
}
