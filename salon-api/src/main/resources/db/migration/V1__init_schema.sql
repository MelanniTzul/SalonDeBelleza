-- =====================================================
-- V1__init_schema.sql — Salón de Belleza Familiar
-- MySQL 8 / InnoDB / utf8mb4
-- =====================================================

CREATE TABLE usuarios (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    apellido            VARCHAR(100) NOT NULL,
    email               VARCHAR(150) NOT NULL UNIQUE,
    telefono            VARCHAR(20),
    password_hash       VARCHAR(100) NOT NULL,
    rol                 ENUM('CLIENTE','ESTILISTA','ADMINISTRADOR') NOT NULL DEFAULT 'CLIENTE',
    doble_factor_activo BOOLEAN NOT NULL DEFAULT TRUE,
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE codigos_verificacion (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id  BIGINT NOT NULL,
    codigo      VARCHAR(10) NOT NULL,
    tipo        ENUM('DOBLE_FACTOR','RECUPERACION') NOT NULL,
    expira_en   DATETIME NOT NULL,
    usado       BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_codigos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_codigos_usuario_tipo (usuario_id, tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE estilistas (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id    BIGINT NOT NULL UNIQUE,
    especialidad  VARCHAR(150),
    activo        BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_estilistas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE horarios_estilista (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    estilista_id BIGINT NOT NULL,
    dia_semana   TINYINT NOT NULL,           -- 1 = lunes ... 7 = domingo
    hora_inicio  TIME NOT NULL,
    hora_fin     TIME NOT NULL,
    CONSTRAINT fk_horarios_estilista FOREIGN KEY (estilista_id) REFERENCES estilistas(id) ON DELETE CASCADE,
    CONSTRAINT chk_dia_semana CHECK (dia_semana BETWEEN 1 AND 7),
    CONSTRAINT chk_horas CHECK (hora_fin > hora_inicio),
    INDEX idx_horarios_estilista_dia (estilista_id, dia_semana)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE categorias (
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre  VARCHAR(100) NOT NULL,
    tipo    ENUM('SERVICIO','PRODUCTO') NOT NULL,
    UNIQUE KEY uk_categoria_nombre_tipo (nombre, tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE servicios (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    categoria_id          BIGINT NOT NULL,
    nombre                VARCHAR(150) NOT NULL,
    descripcion           TEXT,
    precio                DECIMAL(10,2) NOT NULL,
    duracion_minutos      INT NOT NULL,
    disponible_domicilio  BOOLEAN NOT NULL DEFAULT FALSE,
    activo                BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_servicios_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    CONSTRAINT chk_servicio_precio CHECK (precio >= 0),
    CONSTRAINT chk_servicio_duracion CHECK (duracion_minutos > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Productos: solo exhibición, sin compra en línea
CREATE TABLE productos (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    categoria_id  BIGINT NOT NULL,
    nombre        VARCHAR(150) NOT NULL,
    descripcion   TEXT,
    precio        DECIMAL(10,2),
    imagen_url    VARCHAR(255),
    activo        BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE zonas_cobertura (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre   VARCHAR(100) NOT NULL UNIQUE,
    recargo  DECIMAL(10,2) NOT NULL DEFAULT 0,
    activa   BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE citas (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo_ticket  VARCHAR(20) NOT NULL UNIQUE,
    cliente_id     BIGINT NOT NULL,
    estilista_id   BIGINT NOT NULL,
    fecha          DATE NOT NULL,
    hora_inicio    TIME NOT NULL,
    hora_fin       TIME NOT NULL,
    modalidad      ENUM('PRESENCIAL','DOMICILIO') NOT NULL DEFAULT 'PRESENCIAL',
    zona_id        BIGINT NULL,
    direccion      VARCHAR(255) NULL,
    estado         ENUM('CONFIRMADA','CANCELADA','REPROGRAMADA','COMPLETADA','NO_ASISTIO') NOT NULL DEFAULT 'CONFIRMADA',
    total          DECIMAL(10,2) NOT NULL DEFAULT 0,
    notas          VARCHAR(500),
    creado_en      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_citas_cliente FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    CONSTRAINT fk_citas_estilista FOREIGN KEY (estilista_id) REFERENCES estilistas(id),
    CONSTRAINT fk_citas_zona FOREIGN KEY (zona_id) REFERENCES zonas_cobertura(id),
    CONSTRAINT chk_cita_horas CHECK (hora_fin > hora_inicio),
    INDEX idx_citas_estilista_fecha (estilista_id, fecha),
    INDEX idx_citas_cliente (cliente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- N:M cita <-> servicio, con el precio congelado al momento de agendar
CREATE TABLE cita_servicios (
    cita_id          BIGINT NOT NULL,
    servicio_id      BIGINT NOT NULL,
    precio_aplicado  DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (cita_id, servicio_id),
    CONSTRAINT fk_cs_cita FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE CASCADE,
    CONSTRAINT fk_cs_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Auditoría de cambios de estado y cierres de cita
CREATE TABLE bitacora_citas (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    cita_id          BIGINT NOT NULL,
    usuario_id       BIGINT NOT NULL,
    estado_anterior  VARCHAR(20),
    estado_nuevo     VARCHAR(20) NOT NULL,
    observacion      VARCHAR(500),
    creado_en        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bitacora_cita FOREIGN KEY (cita_id) REFERENCES citas(id),
    CONSTRAINT fk_bitacora_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_bitacora_cita (cita_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notificaciones_log (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id  BIGINT NULL,
    cita_id     BIGINT NULL,
    tipo        VARCHAR(50) NOT NULL,
    asunto      VARCHAR(200),
    estado      ENUM('ENVIADO','FALLIDO') NOT NULL,
    error       VARCHAR(500),
    creado_en   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT fk_notif_cita FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- DATOS SEMILLA
-- =====================================================

INSERT INTO categorias (nombre, tipo) VALUES
    ('Cabello', 'SERVICIO'),
    ('Uñas', 'SERVICIO'),
    ('Maquillaje', 'SERVICIO'),
    ('Tratamientos faciales', 'SERVICIO'),
    ('Cuidado capilar', 'PRODUCTO'),
    ('Maquillaje', 'PRODUCTO'),
    ('Cuidado de uñas', 'PRODUCTO');

-- Ajustar nombres y recargos a las zonas reales que atienda el salón
INSERT INTO zonas_cobertura (nombre, recargo) VALUES
    ('Zona 1', 15.00),
    ('Zona 3', 20.00),
    ('Zona 5', 25.00);

-- Admin de prueba: admin@salondebellezafamiliar.com / Admin1234!
-- Cambiar la contraseña antes de cualquier despliegue real.
INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol, doble_factor_activo)
VALUES ('Administrador', 'Salón', 'admin@salondebellezafamiliar.com', NULL,
        '$2a$10$7.iX44g/4tEJ6cyCw/8wTOwCpfWbf2ONUvfy5/kcYLPP.8NeOiYXK',
        'ADMINISTRADOR', FALSE);
