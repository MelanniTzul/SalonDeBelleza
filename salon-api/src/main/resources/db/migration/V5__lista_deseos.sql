-- =====================================================
-- V5__lista_deseos.sql - Salon de Belleza Familiar
-- Lista de deseos del cliente: servicios y productos guardados para despues.
-- =====================================================

CREATE TABLE lista_deseos (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id   BIGINT NOT NULL,
    -- Cada fila guarda un servicio O un producto, nunca los dos ni ninguno.
    servicio_id  BIGINT NULL,
    producto_id  BIGINT NULL,
    creado_en    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_deseos_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE CASCADE,
    CONSTRAINT fk_deseos_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE CASCADE,
    CONSTRAINT fk_deseos_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    CONSTRAINT chk_deseo_un_item CHECK ((servicio_id IS NULL) <> (producto_id IS NULL)),
    -- Un mismo item no se repite en la lista de un usuario.
    UNIQUE KEY uk_deseo_servicio (usuario_id, servicio_id),
    UNIQUE KEY uk_deseo_producto (usuario_id, producto_id),
    INDEX idx_deseos_usuario (usuario_id, creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
