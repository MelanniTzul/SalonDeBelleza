package com.salondebellezafamiliar.salonapi.controller;

import com.salondebellezafamiliar.salonapi.dto.*;
import com.salondebellezafamiliar.salonapi.entity.TipoCategoria;
import com.salondebellezafamiliar.salonapi.service.CatalogoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Catálogo público: no requiere sesión.
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CatalogoController {

    private final CatalogoService catalogoService;

    @GetMapping("/categorias")
    public List<CategoriaDto> categorias(@RequestParam TipoCategoria tipo) {
        return catalogoService.categorias(tipo);
    }

    @GetMapping("/servicios")
    public List<ServicioDto> servicios(@RequestParam(required = false) String categoria) {
        return catalogoService.servicios(categoria, false);
    }

    @GetMapping("/servicios/{slug}")
    public ServicioDto servicio(@PathVariable String slug) {
        return catalogoService.servicio(slug);
    }

    @GetMapping("/productos")
    public List<ProductoDto> productos(@RequestParam(required = false) String categoria) {
        return catalogoService.productos(categoria, false);
    }

    @GetMapping("/productos/{slug}")
    public ProductoDto producto(@PathVariable String slug) {
        return catalogoService.producto(slug);
    }

    @GetMapping("/cortes")
    public List<GrupoCortesDto> cortes() {
        return catalogoService.catalogoCortes();
    }
}
