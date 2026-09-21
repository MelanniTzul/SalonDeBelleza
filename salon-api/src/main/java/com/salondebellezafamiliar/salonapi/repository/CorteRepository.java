package com.salondebellezafamiliar.salonapi.repository;

import com.salondebellezafamiliar.salonapi.entity.Corte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CorteRepository extends JpaRepository<Corte, Long> {

    @Query("""
            select c from Corte c left join fetch c.estilo
            where :incluirInactivos = true or c.activo = true
            order by c.orden, c.id
            """)
    List<Corte> buscar(@Param("incluirInactivos") boolean incluirInactivos);

    boolean existsBySlug(String slug);
}
