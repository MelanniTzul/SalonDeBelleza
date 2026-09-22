package com.salondebellezafamiliar.salonapi.repository;

import com.salondebellezafamiliar.salonapi.entity.ListaDeseo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ListaDeseoRepository extends JpaRepository<ListaDeseo, Long> {

    // Trae de una vez el item y su categoria para no disparar una consulta por fila.
    @Query("""
            select d from ListaDeseo d
            left join fetch d.servicio s left join fetch s.categoria
            left join fetch d.producto p left join fetch p.categoria
            where d.usuarioId = :usuarioId
            order by d.creadoEn desc, d.id desc
            """)
    List<ListaDeseo> listarDeUsuario(@Param("usuarioId") Long usuarioId);

    boolean existsByUsuarioIdAndServicioId(Long usuarioId, Long servicioId);

    boolean existsByUsuarioIdAndProductoId(Long usuarioId, Long productoId);

    long deleteByUsuarioIdAndServicioId(Long usuarioId, Long servicioId);

    long deleteByUsuarioIdAndProductoId(Long usuarioId, Long productoId);
}
