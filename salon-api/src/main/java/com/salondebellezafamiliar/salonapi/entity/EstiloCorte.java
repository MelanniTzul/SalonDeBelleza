package com.salondebellezafamiliar.salonapi.entity;

import jakarta.persistence.*;
import lombok.*;

// Estilo dentro de un grupo del catálogo de cortes (ej. "Degradado" en HOMBRES): alimenta los chips de filtro.
@Entity
@Table(name = "estilos_corte")
@Getter
@Setter
@NoArgsConstructor
public class EstiloCorte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GrupoCortes grupo;

    @Column(nullable = false, length = 60)
    private String slug;

    @Column(nullable = false, length = 80)
    private String etiqueta;

    @Column(nullable = false)
    private int orden;
}
