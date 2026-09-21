package com.salondebellezafamiliar.salonapi.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Servicios y productos que el cliente guardo, del mas reciente al mas viejo")
public record ListaDeseosDto(
        List<ServicioDto> servicios,
        List<ProductoDto> productos
) {
}
