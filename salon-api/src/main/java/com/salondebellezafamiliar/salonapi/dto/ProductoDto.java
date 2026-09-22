package com.salondebellezafamiliar.salonapi.dto;

import com.salondebellezafamiliar.salonapi.entity.NivelFijacion;
import com.salondebellezafamiliar.salonapi.entity.TipoAcabado;

import java.math.BigDecimal;
import java.util.List;

public record ProductoDto(
        Long id,
        String slug,
        String marca,
        String nombre,
        String descripcion,
        String categoria,
        String categoriaNombre,
        String imagen,
        String imagenDetalle,
        String posicionImagen,
        String fijacion,
        NivelFijacion nivelFijacion,
        String acabado,
        TipoAcabado tipoAcabado,
        BigDecimal precio,
        List<String> beneficios,
        boolean activo
) {
}
