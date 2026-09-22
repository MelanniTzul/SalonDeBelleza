package com.salondebellezafamiliar.salonapi.dto;

import com.salondebellezafamiliar.salonapi.entity.AcabadoCorte;
import com.salondebellezafamiliar.salonapi.entity.GrupoCortes;
import com.salondebellezafamiliar.salonapi.entity.LargoCorte;

public record CorteDto(
        Long id,
        String slug,
        GrupoCortes grupo,
        String estilo,
        String nombre,
        String descripcion,
        String imagen,
        LargoCorte largo,
        AcabadoCorte acabado,
        Boolean flequillo,
        boolean activo
) {
}
