package com.salondebellezafamiliar.salonapi.repository;

import com.salondebellezafamiliar.salonapi.entity.Estilista;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EstilistaRepository extends JpaRepository<Estilista, Long> {

    Optional<Estilista> findByUsuarioId(Long usuarioId);
}
