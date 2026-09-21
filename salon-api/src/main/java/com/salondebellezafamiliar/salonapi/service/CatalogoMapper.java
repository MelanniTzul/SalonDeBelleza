package com.salondebellezafamiliar.salonapi.service;

import com.salondebellezafamiliar.salonapi.dto.*;
import com.salondebellezafamiliar.salonapi.entity.*;

import java.util.List;

// Conversión de entidades a DTOs. Los métodos se usan dentro de una transacción (las colecciones son perezosas).
final class CatalogoMapper {

    private CatalogoMapper() {
    }

    static CategoriaDto aDto(Categoria c) {
        return new CategoriaDto(c.getSlug(), c.getNombre());
    }

    static ServicioDto aDto(Servicio s) {
        return new ServicioDto(
                s.getId(), s.getSlug(), s.getNombre(), s.getDescripcion(),
                s.getCategoria().getSlug(), s.getCategoria().getNombre(),
                s.getImagenUrl(), s.getPrecio(), s.getDuracionMinutos(), s.isDisponibleDomicilio(),
                List.copyOf(s.getVariantes()), s.getGrupoCortes(), s.isActivo());
    }

    static ProductoDto aDto(Producto p) {
        return new ProductoDto(
                p.getId(), p.getSlug(), p.getMarca(), p.getNombre(), p.getDescripcion(),
                p.getCategoria().getSlug(), p.getCategoria().getNombre(),
                p.getImagenUrl(), p.getImagenDetalleUrl(), p.getPosicionImagen(),
                p.getFijacionTexto(), p.getNivelFijacion(), p.getAcabadoTexto(), p.getTipoAcabado(),
                p.getPrecio(), List.copyOf(p.getBeneficios()), p.isActivo());
    }

    static EstiloCorteDto aDto(EstiloCorte e) {
        return new EstiloCorteDto(e.getSlug(), e.getEtiqueta());
    }

    static CorteDto aDto(Corte c) {
        return new CorteDto(
                c.getId(), c.getSlug(), c.getGrupo(), c.getEstilo() != null ? c.getEstilo().getSlug() : null,
                c.getNombre(), c.getDescripcion(), c.getImagenUrl(),
                c.getLargo(), c.getAcabado(), c.getFlequillo(), c.isActivo());
    }
}
