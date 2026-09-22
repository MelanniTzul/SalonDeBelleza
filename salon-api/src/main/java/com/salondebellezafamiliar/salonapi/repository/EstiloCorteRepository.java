package com.salondebellezafamiliar.salonapi.repository;

import com.salondebellezafamiliar.salonapi.entity.EstiloCorte;
import com.salondebellezafamiliar.salonapi.entity.GrupoCortes;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EstiloCorteRepository extends JpaRepository<EstiloCorte, Long> {

    List<EstiloCorte> findAllByOrderByOrdenAscIdAsc();

    Optional<EstiloCorte> findByGrupoAndSlug(GrupoCortes grupo, String slug);
}
