package com.salondebellezafamiliar.salonapi.repository;

import com.salondebellezafamiliar.salonapi.entity.Rol;
import com.salondebellezafamiliar.salonapi.entity.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    // Los tres filtros son opcionales: si llegan en null no recortan nada.
    @Query("""
            SELECT u FROM Usuario u
            WHERE (:rol IS NULL OR u.rol = :rol)
              AND (:activo IS NULL OR u.activo = :activo)
              AND (:texto IS NULL
                   OR LOWER(u.nombre) LIKE LOWER(CONCAT('%', :texto, '%'))
                   OR LOWER(u.apellido) LIKE LOWER(CONCAT('%', :texto, '%'))
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :texto, '%')))
            """)
    Page<Usuario> buscar(@Param("rol") Rol rol,
                         @Param("activo") Boolean activo,
                         @Param("texto") String texto,
                         Pageable pageable);
}
