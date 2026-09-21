package com.salondebellezafamiliar.salonapi.repository;

import com.salondebellezafamiliar.salonapi.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    @Query("""
            select p from Producto p join fetch p.categoria c
            where (:categoria is null or c.slug = :categoria)
              and (:incluirInactivos = true or p.activo = true)
            order by p.orden, p.id
            """)
    List<Producto> buscar(@Param("categoria") String categoria, @Param("incluirInactivos") boolean incluirInactivos);

    @Query("select p from Producto p join fetch p.categoria where p.slug = :slug and p.activo = true")
    Optional<Producto> buscarActivoPorSlug(@Param("slug") String slug);

    boolean existsBySlug(String slug);
}
