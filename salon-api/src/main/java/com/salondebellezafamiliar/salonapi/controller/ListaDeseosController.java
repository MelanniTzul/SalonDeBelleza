package com.salondebellezafamiliar.salonapi.controller;

import com.salondebellezafamiliar.salonapi.dto.ListaDeseosDto;
import com.salondebellezafamiliar.salonapi.service.ListaDeseosService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cliente/deseos")
@RequiredArgsConstructor
@Tag(name = "Lista de deseos", description = "Servicios y productos que el cliente guarda para verlos despues")
@ApiResponse(responseCode = "401", description = "Falta el token o ya vencio", content = @Content())
@ApiResponse(responseCode = "403", description = "Solo clientes", content = @Content())
public class ListaDeseosController {

    private final ListaDeseosService listaDeseosService;

    @GetMapping
    @Operation(summary = "Mi lista de deseos", description = "Devuelve los items completos, listos para pintar las tarjetas.")
    public ListaDeseosDto listar(@AuthenticationPrincipal String email) {
        return listaDeseosService.listar(email);
    }

    @PutMapping("/servicios/{slug}")
    @Operation(summary = "Guarda un servicio en mi lista", description = "Si ya estaba, no hace nada.")
    @ApiResponse(responseCode = "204", description = "Guardado")
    @ApiResponse(responseCode = "404", description = "No existe o esta inactivo", content = @Content())
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void agregarServicio(@AuthenticationPrincipal String email, @PathVariable String slug) {
        listaDeseosService.agregarServicio(email, slug);
    }

    @DeleteMapping("/servicios/{slug}")
    @Operation(summary = "Quita un servicio de mi lista")
    @ApiResponse(responseCode = "204", description = "Quitado (o no estaba)")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void quitarServicio(@AuthenticationPrincipal String email, @PathVariable String slug) {
        listaDeseosService.quitarServicio(email, slug);
    }

    @PutMapping("/productos/{slug}")
    @Operation(summary = "Guarda un producto en mi lista", description = "Si ya estaba, no hace nada.")
    @ApiResponse(responseCode = "204", description = "Guardado")
    @ApiResponse(responseCode = "404", description = "No existe o esta inactivo", content = @Content())
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void agregarProducto(@AuthenticationPrincipal String email, @PathVariable String slug) {
        listaDeseosService.agregarProducto(email, slug);
    }

    @DeleteMapping("/productos/{slug}")
    @Operation(summary = "Quita un producto de mi lista")
    @ApiResponse(responseCode = "204", description = "Quitado (o no estaba)")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void quitarProducto(@AuthenticationPrincipal String email, @PathVariable String slug) {
        listaDeseosService.quitarProducto(email, slug);
    }
}
