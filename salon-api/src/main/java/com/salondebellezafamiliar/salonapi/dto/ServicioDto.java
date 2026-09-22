package com.salondebellezafamiliar.salonapi.dto;

import com.salondebellezafamiliar.salonapi.entity.GrupoCortes;

import java.math.BigDecimal;
import java.util.List;

public record ServicioDto(
        Long id,
        String slug,
        String nombre,
        String descripcion,
        String categoria,
        String categoriaNombre,
        String imagen,
        BigDecimal precio,
        Integer duracionMinutos,
        boolean aDomicilio,
        List<String> variantes,
        GrupoCortes grupoCortes,
        boolean activo
) {
}
