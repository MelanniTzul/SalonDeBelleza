package com.salondebellezafamiliar.salonapi.service;

import com.salondebellezafamiliar.salonapi.dto.*;
import com.salondebellezafamiliar.salonapi.entity.EstiloCorte;
import com.salondebellezafamiliar.salonapi.entity.GrupoCortes;
import com.salondebellezafamiliar.salonapi.entity.TipoCategoria;
import com.salondebellezafamiliar.salonapi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;

// Consultas del catálogo. Las públicas solo devuelven elementos activos;
// las de administración (incluirInactivos = true) devuelven todo para poder reactivarlo.
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CatalogoService {

    private final CategoriaRepository categoriaRepository;
    private final ServicioRepository servicioRepository;
    private final ProductoRepository productoRepository;
    private final EstiloCorteRepository estiloCorteRepository;
    private final CorteRepository corteRepository;

    public List<CategoriaDto> categorias(TipoCategoria tipo) {
        return categoriaRepository.findByTipoOrderByOrdenAscIdAsc(tipo).stream().map(CatalogoMapper::aDto).toList();
    }

    public List<ServicioDto> servicios(String categoria, boolean incluirInactivos) {
        return servicioRepository.buscar(vacioANulo(categoria), incluirInactivos).stream().map(CatalogoMapper::aDto).toList();
    }

    public ServicioDto servicio(String slug) {
        return servicioRepository.buscarActivoPorSlug(slug)
                .map(CatalogoMapper::aDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Servicio no encontrado"));
    }

    public List<ProductoDto> productos(String categoria, boolean incluirInactivos) {
        return productoRepository.buscar(vacioANulo(categoria), incluirInactivos).stream().map(CatalogoMapper::aDto).toList();
    }

    public ProductoDto producto(String slug) {
        return productoRepository.buscarActivoPorSlug(slug)
                .map(CatalogoMapper::aDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    // Todos los grupos (también los vacíos) con sus estilos y sus cortes
    public List<GrupoCortesDto> catalogoCortes() {
        List<EstiloCorte> estilos = estiloCorteRepository.findAllByOrderByOrdenAscIdAsc();
        List<CorteDto> cortes = corteRepository.buscar(false).stream().map(CatalogoMapper::aDto).toList();
        return Arrays.stream(GrupoCortes.values())
                .map(grupo -> new GrupoCortesDto(
                        grupo,
                        estilos.stream().filter(e -> e.getGrupo() == grupo).map(CatalogoMapper::aDto).toList(),
                        cortes.stream().filter(c -> c.grupo() == grupo).toList()))
                .toList();
    }

    public List<CorteDto> cortesAdmin() {
        return corteRepository.buscar(true).stream().map(CatalogoMapper::aDto).toList();
    }

    private static String vacioANulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
