package com.salondebellezafamiliar.salonapi.repository;

import com.salondebellezafamiliar.salonapi.entity.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ServicioRepository extends JpaRepository<Servicio, Long> {

    // categoria nula = todas; incluirInactivos = true solo para el panel de administración
    @Query("""
            select s from Servicio s join fetch s.categoria c
            where (:categoria is null or c.slug = :categoria)
              and (:incluirInactivos = true or s.activo = true)
            order by s.orden, s.id
            """)
    List<Servicio> buscar(@Param("categoria") String categoria, @Param("incluirInactivos") boolean incluirInactivos);

    @Query("select s from Servicio s join fetch s.categoria where s.slug = :slug and s.activo = true")
    Optional<Servicio> buscarActivoPorSlug(@Param("slug") String slug);

    boolean existsBySlug(String slug);
}
