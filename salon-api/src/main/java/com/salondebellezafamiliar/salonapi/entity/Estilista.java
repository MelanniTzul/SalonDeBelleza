package com.salondebellezafamiliar.salonapi.entity;

import jakarta.persistence.*;
import lombok.*;

// Ficha de trabajo. Va aparte de usuarios porque la agenda cuelga de aqui.
@Entity
@Table(name = "estilistas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Estilista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false, unique = true)
    private Long usuarioId;

    @Column(length = 150)
    private String especialidad;

    @Builder.Default
    @Column(nullable = false)
    private boolean activo = true;
}
