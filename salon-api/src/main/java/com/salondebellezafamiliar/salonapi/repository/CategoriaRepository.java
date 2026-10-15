package com.salondebellezafamiliar.salonapi.repository;

import com.salondebellezafamiliar.salonapi.entity.Categoria;
import com.salondebellezafamiliar.salonapi.entity.TipoCategoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    // Para el panel de administración: incluye las desactivadas.
    List<Categoria> findByTipoOrderByOrdenAscIdAsc(TipoCategoria tipo);

    List<Categoria> findAllByOrderByTipoAscOrdenAscIdAsc();

    // Para el catálogo público y los selects de los formularios: solo activas.
    List<Categoria> findByTipoAndActivoTrueOrderByOrdenAscIdAsc(TipoCategoria tipo);

    Optional<Categoria> findByTipoAndSlug(TipoCategoria tipo, String slug);

    boolean existsByTipoAndSlug(TipoCategoria tipo, String slug);

    boolean existsByTipoAndNombre(TipoCategoria tipo, String nombre);
}
