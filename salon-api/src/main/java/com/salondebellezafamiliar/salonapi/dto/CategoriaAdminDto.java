package com.salondebellezafamiliar.salonapi.dto;

import com.salondebellezafamiliar.salonapi.entity.TipoCategoria;

public record CategoriaAdminDto(Long id, String slug, String nombre, TipoCategoria tipo, int orden, boolean activo) {
}
