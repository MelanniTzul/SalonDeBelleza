package com.salondebellezafamiliar.salonapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// Un item guardado por un cliente: o servicio o producto (lo valida la base con un CHECK).
@Entity
@Table(name = "lista_deseos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListaDeseo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servicio_id")
    private Servicio servicio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @Column(name = "creado_en", insertable = false, updatable = false)
    private LocalDateTime creadoEn;
}
