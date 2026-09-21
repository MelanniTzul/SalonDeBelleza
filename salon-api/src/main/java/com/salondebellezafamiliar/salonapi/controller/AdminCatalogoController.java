package com.salondebellezafamiliar.salonapi.controller;

import com.salondebellezafamiliar.salonapi.dto.*;
import com.salondebellezafamiliar.salonapi.service.CatalogoAdminService;
import com.salondebellezafamiliar.salonapi.service.CatalogoService;
import com.salondebellezafamiliar.salonapi.service.ImagenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

// Administración del catálogo. Solo el rol ADMINISTRADOR (ver SecurityConfig).
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminCatalogoController {

    private final CatalogoService catalogoService;
    private final CatalogoAdminService adminService;
    private final ImagenService imagenService;

    // ---------- Servicios ----------

    @GetMapping("/servicios")
    public List<ServicioDto> servicios() {
        return catalogoService.servicios(null, true);
    }

    @PostMapping("/servicios")
    @ResponseStatus(HttpStatus.CREATED)
    public ServicioDto crearServicio(@Valid @RequestBody ServicioRequest request) {
        return adminService.crearServicio(request);
    }

    @PutMapping("/servicios/{id}")
    public ServicioDto actualizarServicio(@PathVariable Long id, @Valid @RequestBody ServicioRequest request) {
        return adminService.actualizarServicio(id, request);
    }

    @DeleteMapping("/servicios/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desactivarServicio(@PathVariable Long id) {
        adminService.desactivarServicio(id);
    }

    // ---------- Productos ----------

    @GetMapping("/productos")
    public List<ProductoDto> productos() {
        return catalogoService.productos(null, true);
    }

    @PostMapping("/productos")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductoDto crearProducto(@Valid @RequestBody ProductoRequest request) {
        return adminService.crearProducto(request);
    }

    @PutMapping("/productos/{id}")
    public ProductoDto actualizarProducto(@PathVariable Long id, @Valid @RequestBody ProductoRequest request) {
        return adminService.actualizarProducto(id, request);
    }

    @DeleteMapping("/productos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desactivarProducto(@PathVariable Long id) {
        adminService.desactivarProducto(id);
    }

    // ---------- Cortes ----------

    @GetMapping("/cortes")
    public List<CorteDto> cortes() {
        return catalogoService.cortesAdmin();
    }

    @PostMapping("/cortes")
    @ResponseStatus(HttpStatus.CREATED)
    public CorteDto crearCorte(@Valid @RequestBody CorteRequest request) {
        return adminService.crearCorte(request);
    }

    @PutMapping("/cortes/{id}")
    public CorteDto actualizarCorte(@PathVariable Long id, @Valid @RequestBody CorteRequest request) {
        return adminService.actualizarCorte(id, request);
    }

    @DeleteMapping("/cortes/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desactivarCorte(@PathVariable Long id) {
        adminService.desactivarCorte(id);
    }

    // ---------- Imágenes ----------

    @PostMapping(value = "/imagenes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ImagenSubidaDto subirImagen(@RequestParam String carpeta, @RequestParam("archivo") MultipartFile archivo) {
        return new ImagenSubidaDto(imagenService.guardar(archivo, carpeta));
    }
}
