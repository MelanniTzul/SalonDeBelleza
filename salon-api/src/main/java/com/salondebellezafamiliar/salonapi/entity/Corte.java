package com.salondebellezafamiliar.salonapi.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cortes")
@Getter
@Setter
@NoArgsConstructor
public class Corte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GrupoCortes grupo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estilo_id")
    private EstiloCorte estilo;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(name = "imagen_url", nullable = false, length = 255)
    private String imagenUrl;

    // Características para la guía "Encuentra tu corte ideal" (solo grupo MUJERES)
    @Enumerated(EnumType.STRING)
    private LargoCorte largo;

    @Enumerated(EnumType.STRING)
    private AcabadoCorte acabado;

    private Boolean flequillo;

    @Column(nullable = false)
    private int orden;

    @Column(nullable = false)
    private boolean activo = true;
}
