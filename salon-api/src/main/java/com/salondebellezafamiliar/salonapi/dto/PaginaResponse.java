package com.salondebellezafamiliar.salonapi.dto;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

// Envoltorio propio para no serializar el Page de Spring, que cambia entre versiones.
public record PaginaResponse<T>(
        List<T> contenido,
        int pagina,
        int tamanio,
        long totalElementos,
        int totalPaginas,
        boolean ultima
) {
    public static <E, T> PaginaResponse<T> desde(Page<E> page, Function<E, T> mapper) {
        return new PaginaResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }
}
