package com.salondebellezafamiliar.salonapi.dto;

import com.salondebellezafamiliar.salonapi.entity.GrupoCortes;

import java.util.List;

public record GrupoCortesDto(GrupoCortes grupo, List<EstiloCorteDto> estilos, List<CorteDto> cortes) {
}
