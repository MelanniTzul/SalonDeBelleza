package com.salondebellezafamiliar.salonapi.repository;

import com.salondebellezafamiliar.salonapi.entity.Categoria;
import com.salondebellezafamiliar.salonapi.entity.TipoCategoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findByTipoOrderByOrdenAscIdAsc(TipoCategoria tipo);

    Optional<Categoria> findByTipoAndSlug(TipoCategoria tipo, String slug);
}
