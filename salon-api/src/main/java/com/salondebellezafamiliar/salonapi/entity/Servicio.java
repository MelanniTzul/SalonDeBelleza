package com.salondebellezafamiliar.salonapi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "servicios")
@Getter
@Setter
@NoArgsConstructor
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Identificador estable para URLs (ej. "ondas-bucles")
    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(nullable = false, length = 150)
    private String nombre;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    // Sin precio o sin duración se muestra "Consultar"
    @Column(precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(name = "duracion_minutos")
    private Integer duracionMinutos;

    @Column(name = "disponible_domicilio", nullable = false)
    private boolean disponibleDomicilio;

    @Column(name = "imagen_url", length = 500)
    private String imagenUrl;

    // Catálogo de cortes que se muestra en la página de este servicio
    @Enumerated(EnumType.STRING)
    @Column(name = "grupo_cortes")
    private GrupoCortes grupoCortes;

    @Column(nullable = false)
    private int orden;

    @Column(nullable = false)
    private boolean activo = true;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "servicio_variantes", joinColumns = @JoinColumn(name = "servicio_id"))
    @OrderColumn(name = "orden")
    @Column(name = "texto", nullable = false, length = 80)
    @BatchSize(size = 50)
    private List<String> variantes = new ArrayList<>();
}
