package com.salondebellezafamiliar.salonapi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

// Productos de exhibición: se muestran en el sitio, sin compra en línea.
@Entity
@Table(name = "productos")
@Getter
@Setter
@NoArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(length = 80)
    private String marca;

    @Column(nullable = false, length = 150)
    private String nombre;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(name = "imagen_url", length = 255)
    private String imagenUrl;

    @Column(name = "imagen_detalle_url", length = 255)
    private String imagenDetalleUrl;

    // Encuadre de la foto (object-position), ej. "68% 58%"
    @Column(name = "posicion_imagen", length = 40)
    private String posicionImagen;

    // Texto tal como se muestra ("Media a fuerte") y su nivel normalizado para filtrar
    @Column(name = "fijacion_texto", length = 40)
    private String fijacionTexto;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_fijacion")
    private NivelFijacion nivelFijacion;

    @Column(name = "acabado_texto", length = 40)
    private String acabadoTexto;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_acabado")
    private TipoAcabado tipoAcabado;

    @Column(nullable = false)
    private int orden;

    @Column(nullable = false)
    private boolean activo = true;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "producto_beneficios", joinColumns = @JoinColumn(name = "producto_id"))
    @OrderColumn(name = "orden")
    @Column(name = "texto", nullable = false, length = 150)
    @BatchSize(size = 50)
    private List<String> beneficios = new ArrayList<>();
}
