package com.salondebellezafamiliar.salonapi.service;

import com.salondebellezafamiliar.salonapi.dto.*;
import com.salondebellezafamiliar.salonapi.entity.*;
import com.salondebellezafamiliar.salonapi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

// Alta, edición y baja (lógica) del catálogo. Nada se borra de la base: "eliminar" desactiva,
// así las citas ya agendadas conservan su servicio y el administrador puede reactivarlo.
@Service
@RequiredArgsConstructor
@Transactional
public class CatalogoAdminService {

    private final CategoriaRepository categoriaRepository;
    private final ServicioRepository servicioRepository;
    private final ProductoRepository productoRepository;
    private final EstiloCorteRepository estiloCorteRepository;
    private final CorteRepository corteRepository;

    // ---------- Servicios ----------

    public ServicioDto crearServicio(ServicioRequest r) {
        if (servicioRepository.existsBySlug(r.slug())) throw slugEnUso(r.slug());
        Servicio s = new Servicio();
        aplicar(s, r);
        return CatalogoMapper.aDto(servicioRepository.save(s));
    }

    public ServicioDto actualizarServicio(Long id, ServicioRequest r) {
        Servicio s = servicioRepository.findById(id).orElseThrow(() -> noEncontrado("Servicio"));
        if (!s.getSlug().equals(r.slug()) && servicioRepository.existsBySlug(r.slug())) throw slugEnUso(r.slug());
        aplicar(s, r);
        return CatalogoMapper.aDto(s);
    }

    public void desactivarServicio(Long id) {
        servicioRepository.findById(id).orElseThrow(() -> noEncontrado("Servicio")).setActivo(false);
    }

    private void aplicar(Servicio s, ServicioRequest r) {
        s.setSlug(r.slug());
        s.setCategoria(categoria(TipoCategoria.SERVICIO, r.categoria()));
        s.setNombre(r.nombre().trim());
        s.setDescripcion(limpiar(r.descripcion()));
        s.setPrecio(r.precio());
        s.setDuracionMinutos(r.duracionMinutos());
        s.setDisponibleDomicilio(r.aDomicilio());
        s.setImagenUrl(r.imagen());
        s.setGrupoCortes(r.grupoCortes());
        s.setOrden(r.orden() != null ? r.orden() : s.getOrden());
        s.setActivo(r.activo() == null || r.activo());
        reemplazar(s.getVariantes(), r.variantes());
    }

    // ---------- Productos ----------

    public ProductoDto crearProducto(ProductoRequest r) {
        if (productoRepository.existsBySlug(r.slug())) throw slugEnUso(r.slug());
        Producto p = new Producto();
        aplicar(p, r);
        return CatalogoMapper.aDto(productoRepository.save(p));
    }

    public ProductoDto actualizarProducto(Long id, ProductoRequest r) {
        Producto p = productoRepository.findById(id).orElseThrow(() -> noEncontrado("Producto"));
        if (!p.getSlug().equals(r.slug()) && productoRepository.existsBySlug(r.slug())) throw slugEnUso(r.slug());
        aplicar(p, r);
        return CatalogoMapper.aDto(p);
    }

    public void desactivarProducto(Long id) {
        productoRepository.findById(id).orElseThrow(() -> noEncontrado("Producto")).setActivo(false);
    }

    private void aplicar(Producto p, ProductoRequest r) {
        p.setSlug(r.slug());
        p.setCategoria(categoria(TipoCategoria.PRODUCTO, r.categoria()));
        p.setMarca(limpiar(r.marca()));
        p.setNombre(r.nombre().trim());
        p.setDescripcion(limpiar(r.descripcion()));
        p.setPrecio(r.precio());
        p.setImagenUrl(r.imagen());
        p.setImagenDetalleUrl(r.imagenDetalle());
        p.setPosicionImagen(r.posicionImagen());
        p.setFijacionTexto(limpiar(r.fijacion()));
        p.setNivelFijacion(r.nivelFijacion());
        p.setAcabadoTexto(limpiar(r.acabado()));
        p.setTipoAcabado(r.tipoAcabado());
        p.setOrden(r.orden() != null ? r.orden() : p.getOrden());
        p.setActivo(r.activo() == null || r.activo());
        reemplazar(p.getBeneficios(), r.beneficios());
    }

    // ---------- Cortes ----------

    public CorteDto crearCorte(CorteRequest r) {
        if (corteRepository.existsBySlug(r.slug())) throw slugEnUso(r.slug());
        Corte c = new Corte();
        aplicar(c, r);
        return CatalogoMapper.aDto(corteRepository.save(c));
    }

    public CorteDto actualizarCorte(Long id, CorteRequest r) {
        Corte c = corteRepository.findById(id).orElseThrow(() -> noEncontrado("Corte"));
        if (!c.getSlug().equals(r.slug()) && corteRepository.existsBySlug(r.slug())) throw slugEnUso(r.slug());
        aplicar(c, r);
        return CatalogoMapper.aDto(c);
    }

    public void desactivarCorte(Long id) {
        corteRepository.findById(id).orElseThrow(() -> noEncontrado("Corte")).setActivo(false);
    }

    private void aplicar(Corte c, CorteRequest r) {
        c.setSlug(r.slug());
        c.setGrupo(r.grupo());
        c.setEstilo(r.estilo() == null || r.estilo().isBlank() ? null : estiloCorteRepository.findByGrupoAndSlug(r.grupo(), r.estilo())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "El estilo no existe en el grupo " + r.grupo())));
        c.setNombre(r.nombre().trim());
        c.setDescripcion(limpiar(r.descripcion()));
        c.setImagenUrl(r.imagen());
        c.setLargo(r.largo());
        c.setAcabado(r.acabado());
        c.setFlequillo(r.flequillo());
        c.setOrden(r.orden() != null ? r.orden() : c.getOrden());
        c.setActivo(r.activo() == null || r.activo());
    }

    // ---------- Utilidades ----------

    private Categoria categoria(TipoCategoria tipo, String slug) {
        return categoriaRepository.findByTipoAndSlug(tipo, slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "La categoría '" + slug + "' no existe para " + tipo.name().toLowerCase() + "s"));
    }

    private static void reemplazar(List<String> destino, List<String> origen) {
        destino.clear();
        if (origen != null) origen.stream().map(String::trim).forEach(destino::add);
    }

    private static String limpiar(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }

    private static ResponseStatusException noEncontrado(String que) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, que + " no encontrado");
    }

    private static ResponseStatusException slugEnUso(String slug) {
        return new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un registro con el identificador '" + slug + "'");
    }
}
