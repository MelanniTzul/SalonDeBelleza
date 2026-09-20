package com.salondebellezafamiliar.salonapi.controller;

import com.salondebellezafamiliar.salonapi.dto.ActualizarUsuarioRequest;
import com.salondebellezafamiliar.salonapi.dto.CambiarPasswordRequest;
import com.salondebellezafamiliar.salonapi.dto.CrearUsuarioRequest;
import com.salondebellezafamiliar.salonapi.dto.PaginaResponse;
import com.salondebellezafamiliar.salonapi.dto.UsuarioResponse;
import com.salondebellezafamiliar.salonapi.entity.Rol;
import com.salondebellezafamiliar.salonapi.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuarios (admin)",
     description = "CRUD de usuarios. Solo el administrador entra aqui, y es el unico que puede dar de alta estilistas.")
@ApiResponses({
        @ApiResponse(responseCode = "401", description = "Falta el token o ya vencio", content = @Content()),
        @ApiResponse(responseCode = "403", description = "El token no es de un administrador", content = @Content())
})
public class UsuarioAdminController {

    private final UsuarioService usuarioService;

    @GetMapping
    @Operation(summary = "Lista usuarios con filtros y paginacion")
    public PaginaResponse<UsuarioResponse> listar(
            @Parameter(description = "Filtra por rol") @RequestParam(required = false) Rol rol,
            @Parameter(description = "true solo activos, false solo desactivados") @RequestParam(required = false) Boolean activo,
            @Parameter(description = "Busca en nombre, apellido y correo") @RequestParam(required = false) String busqueda,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        return usuarioService.listar(rol, activo, busqueda, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Devuelve un usuario por id")
    @ApiResponse(responseCode = "404", description = "No existe ese usuario", content = @Content())
    public UsuarioResponse obtener(@PathVariable Long id) {
        return usuarioService.obtener(id);
    }

    @PostMapping
    @Operation(summary = "Crea un usuario con cualquier rol",
               description = "Es la unica via para dar de alta estilistas y administradores. "
                           + "Si el rol es ESTILISTA tambien se crea su ficha con la especialidad.")
    @ApiResponse(responseCode = "201", description = "Usuario creado")
    @ApiResponse(responseCode = "409", description = "Ese correo ya esta registrado", content = @Content())
    public ResponseEntity<UsuarioResponse> crear(@Valid @RequestBody CrearUsuarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.crear(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Edita los datos de un usuario",
               description = "No cambia el rol ni la contrasena. Para la contrasena usar el endpoint aparte.")
    @ApiResponse(responseCode = "409", description = "Ese correo ya lo usa otro usuario", content = @Content())
    public UsuarioResponse actualizar(@PathVariable Long id, @Valid @RequestBody ActualizarUsuarioRequest request) {
        return usuarioService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactiva un usuario",
               description = "No borra nada: deja activo en false. El historial de citas necesita que el usuario siga existiendo.")
    @ApiResponse(responseCode = "409", description = "Un admin no puede desactivarse a si mismo", content = @Content())
    public UsuarioResponse desactivar(@PathVariable Long id, @AuthenticationPrincipal String emailDelQuePide) {
        return usuarioService.cambiarEstado(id, false, emailDelQuePide);
    }

    @PatchMapping("/{id}/activar")
    @Operation(summary = "Vuelve a activar un usuario desactivado")
    public UsuarioResponse activar(@PathVariable Long id, @AuthenticationPrincipal String emailDelQuePide) {
        return usuarioService.cambiarEstado(id, true, emailDelQuePide);
    }

    @PatchMapping("/{id}/password")
    @Operation(summary = "Reinicia la contrasena de un usuario")
    @ApiResponse(responseCode = "204", description = "Contrasena actualizada")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cambiarPassword(@PathVariable Long id, @Valid @RequestBody CambiarPasswordRequest request) {
        usuarioService.cambiarPassword(id, request);
    }
}
