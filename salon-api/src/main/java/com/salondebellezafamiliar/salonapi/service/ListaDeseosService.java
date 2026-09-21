package com.salondebellezafamiliar.salonapi.service;

import com.salondebellezafamiliar.salonapi.dto.ListaDeseosDto;
import com.salondebellezafamiliar.salonapi.dto.ProductoDto;
import com.salondebellezafamiliar.salonapi.dto.ServicioDto;
import com.salondebellezafamiliar.salonapi.entity.ListaDeseo;
import com.salondebellezafamiliar.salonapi.entity.Producto;
import com.salondebellezafamiliar.salonapi.entity.Servicio;
import com.salondebellezafamiliar.salonapi.entity.Usuario;
import com.salondebellezafamiliar.salonapi.repository.ListaDeseoRepository;
import com.salondebellezafamiliar.salonapi.repository.ProductoRepository;
import com.salondebellezafamiliar.salonapi.repository.ServicioRepository;
import com.salondebellezafamiliar.salonapi.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

// Lista de deseos del cliente. Se trabaja con slugs porque es lo que maneja el front,
// igual que el resto del catalogo.
@Service
@RequiredArgsConstructor
public class ListaDeseosService {

    private final ListaDeseoRepository listaDeseoRepository;
    private final ServicioRepository servicioRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public ListaDeseosDto listar(String email) {
        Long usuarioId = idDe(email);
        List<ListaDeseo> deseos = listaDeseoRepository.listarDeUsuario(usuarioId);

        // Lo que el admin desactivo despues de guardarse ya no se muestra: no se puede agendar ni comprar.
        List<ServicioDto> servicios = deseos.stream()
                .map(ListaDeseo::getServicio)
                .filter(s -> s != null && s.isActivo())
                .map(CatalogoMapper::aDto)
                .toList();
        List<ProductoDto> productos = deseos.stream()
                .map(ListaDeseo::getProducto)
                .filter(p -> p != null && p.isActivo())
                .map(CatalogoMapper::aDto)
                .toList();
        return new ListaDeseosDto(servicios, productos);
    }

    // Agregar es idempotente: si ya estaba, no pasa nada.
    @Transactional
    public void agregarServicio(String email, String slug) {
        Long usuarioId = idDe(email);
        Servicio servicio = servicioRepository.buscarActivoPorSlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Servicio no encontrado"));
        if (!listaDeseoRepository.existsByUsuarioIdAndServicioId(usuarioId, servicio.getId())) {
            listaDeseoRepository.save(ListaDeseo.builder().usuarioId(usuarioId).servicio(servicio).build());
        }
    }

    @Transactional
    public void agregarProducto(String email, String slug) {
        Long usuarioId = idDe(email);
        Producto producto = productoRepository.buscarActivoPorSlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        if (!listaDeseoRepository.existsByUsuarioIdAndProductoId(usuarioId, producto.getId())) {
            listaDeseoRepository.save(ListaDeseo.builder().usuarioId(usuarioId).producto(producto).build());
        }
    }

    // Quitar tambien es idempotente, y funciona aunque el item ya este inactivo.
    @Transactional
    public void quitarServicio(String email, String slug) {
        Long usuarioId = idDe(email);
        servicioRepository.findBySlug(slug)
                .ifPresent(s -> listaDeseoRepository.deleteByUsuarioIdAndServicioId(usuarioId, s.getId()));
    }

    @Transactional
    public void quitarProducto(String email, String slug) {
        Long usuarioId = idDe(email);
        productoRepository.findBySlug(slug)
                .ifPresent(p -> listaDeseoRepository.deleteByUsuarioIdAndProductoId(usuarioId, p.getId()));
    }

    private Long idDe(String email) {
        return usuarioRepository.findByEmail(email.trim().toLowerCase())
                .filter(Usuario::isActivo)
                .map(Usuario::getId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La sesion ya no es valida"));
    }
}
