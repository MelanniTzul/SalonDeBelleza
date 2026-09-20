-- =====================================================
-- V2__foto_perfil_y_mejoras.sql — Salón de Belleza Familiar
-- Foto de perfil, imagen de servicios y mejoras al modelo de datos
-- =====================================================

-- 1) FOTOS
-- Solo se guarda la URL (o la ruta del archivo en S3). La imagen NO va dentro de la base de datos.
ALTER TABLE usuarios
    ADD COLUMN foto_url VARCHAR(500) NULL AFTER telefono;

ALTER TABLE servicios
    ADD COLUMN imagen_url VARCHAR(500) NULL AFTER descripcion;

-- 2) QUÉ SERVICIOS REALIZA CADA ESTILISTA (relación N:M)
-- No todas las estilistas hacen todos los servicios; el motor de disponibilidad lo necesita.
CREATE TABLE estilista_servicios (
    estilista_id  BIGINT NOT NULL,
    servicio_id   BIGINT NOT NULL,
    PRIMARY KEY (estilista_id, servicio_id),
    CONSTRAINT fk_es_estilista FOREIGN KEY (estilista_id) REFERENCES estilistas(id) ON DELETE CASCADE,
    CONSTRAINT fk_es_servicio  FOREIGN KEY (servicio_id)  REFERENCES servicios(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) BLOQUEOS PUNTUALES DE AGENDA (vacaciones, permisos, descansos)
-- horarios_estilista define el horario semanal fijo; esto cubre las excepciones por fecha.
CREATE TABLE bloqueos_estilista (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    estilista_id  BIGINT NOT NULL,
    fecha         DATE NOT NULL,
    hora_inicio   TIME NOT NULL,
    hora_fin      TIME NOT NULL,
    motivo        VARCHAR(200),
    creado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bloqueos_estilista FOREIGN KEY (estilista_id) REFERENCES estilistas(id) ON DELETE CASCADE,
    CONSTRAINT chk_bloqueo_horas CHECK (hora_fin > hora_inicio),
    INDEX idx_bloqueos_estilista_fecha (estilista_id, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4) NOTIFICACIONES DENTRO DE LA APLICACIÓN
-- notificaciones_log solo registra correos enviados. Esta tabla es la bandeja que ve el usuario en el sistema.
CREATE TABLE notificaciones (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id  BIGINT NOT NULL,
    cita_id     BIGINT NULL,
    tipo        VARCHAR(50) NOT NULL,
    titulo      VARCHAR(150) NOT NULL,
    mensaje     VARCHAR(500) NOT NULL,
    leida       BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notificaciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_notificaciones_cita    FOREIGN KEY (cita_id)    REFERENCES citas(id)    ON DELETE SET NULL,
    INDEX idx_notificaciones_usuario (usuario_id, leida, creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5) CITAS
-- El recargo de la zona se congela al agendar, igual que el precio de cada servicio.
ALTER TABLE citas
    ADD COLUMN recargo_zona DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER direccion;

-- Una cita a domicilio necesita zona y dirección; una presencial no debe llevarlas.
ALTER TABLE citas
    ADD CONSTRAINT chk_cita_modalidad CHECK (
        (modalidad = 'PRESENCIAL' AND zona_id IS NULL AND direccion IS NULL)
        OR
        (modalidad = 'DOMICILIO' AND zona_id IS NOT NULL AND direccion IS NOT NULL)
    );

-- Acelera los reportes por rango de fechas y estado.
CREATE INDEX idx_citas_fecha_estado ON citas (fecha, estado);

-- 6) CÓDIGOS DE VERIFICACIÓN (2FA y recuperación)
-- El código se guarda cifrado (hash), por eso la columna es más ancha.
-- 'intentos' permite bloquear un código tras varios intentos fallidos.
ALTER TABLE codigos_verificacion
    MODIFY COLUMN codigo VARCHAR(100) NOT NULL,
    ADD COLUMN intentos TINYINT NOT NULL DEFAULT 0 AFTER usado;