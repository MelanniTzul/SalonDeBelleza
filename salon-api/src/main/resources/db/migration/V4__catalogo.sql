-- =====================================================
-- V4__catalogo.sql — Catálogo público: servicios, productos y cortes
-- Los datos iniciales replican el catálogo que antes vivía en el frontend.
-- Las rutas de imagen son relativas: "img/..." son imágenes del frontend y
-- "uploads/..." son imágenes subidas por el administrador (servidas por la API).
-- =====================================================

-- ---------- Categorías ----------
-- Las semillas de V1 no estaban referenciadas por ningún servicio ni producto, se reemplazan.
ALTER TABLE categorias
    ADD COLUMN slug  VARCHAR(60) NULL AFTER id,
    ADD COLUMN orden INT NOT NULL DEFAULT 0;

DELETE FROM categorias
 WHERE id NOT IN (SELECT categoria_id FROM servicios)
   AND id NOT IN (SELECT categoria_id FROM productos);

INSERT INTO categorias (slug, nombre, tipo, orden) VALUES
    ('cortes', 'Cortes', 'SERVICIO', 0),
    ('color', 'Color', 'SERVICIO', 10),
    ('peinados', 'Peinados', 'SERVICIO', 20),
    ('cejas-pestanas', 'Cejas y pestañas', 'SERVICIO', 30),
    ('maquillaje', 'Maquillaje', 'SERVICIO', 40),
    ('geles', 'Geles', 'PRODUCTO', 50),
    ('rizos', 'Rizos y ondas', 'PRODUCTO', 60);

UPDATE categorias SET slug = LOWER(REPLACE(nombre, ' ', '-')) WHERE slug IS NULL;

ALTER TABLE categorias
    MODIFY slug VARCHAR(60) NOT NULL,
    ADD UNIQUE KEY uk_categoria_slug_tipo (slug, tipo);

-- ---------- Servicios ----------
-- La columna imagen_url ya la creó V2.
-- Precio y duración quedan opcionales: sin valor se muestra "Consultar".
ALTER TABLE servicios
    ADD COLUMN slug          VARCHAR(100) NULL AFTER id,
    ADD COLUMN grupo_cortes  ENUM('MUJERES','HOMBRES','NINOS','ABUELOS') NULL,
    ADD COLUMN orden         INT NOT NULL DEFAULT 0,
    MODIFY precio            DECIMAL(10,2) NULL,
    MODIFY duracion_minutos  INT NULL;

-- Variantes o modalidades que se muestran como etiquetas (ej. "Clásico", "Degradado")
CREATE TABLE servicio_variantes (
    servicio_id  BIGINT NOT NULL,
    orden        INT NOT NULL,
    texto        VARCHAR(80) NOT NULL,
    PRIMARY KEY (servicio_id, orden),
    CONSTRAINT fk_variante_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Productos ----------
ALTER TABLE productos
    ADD COLUMN slug                VARCHAR(100) NULL AFTER id,
    ADD COLUMN marca               VARCHAR(80) NULL,
    ADD COLUMN fijacion_texto      VARCHAR(40) NULL,
    ADD COLUMN nivel_fijacion      ENUM('MEDIA','FUERTE','MUY_FUERTE') NULL,
    ADD COLUMN acabado_texto       VARCHAR(40) NULL,
    ADD COLUMN tipo_acabado        ENUM('BRILLANTE','NATURAL','MATE') NULL,
    ADD COLUMN imagen_detalle_url  VARCHAR(255) NULL,
    ADD COLUMN posicion_imagen     VARCHAR(40) NULL,
    ADD COLUMN orden               INT NOT NULL DEFAULT 0;

CREATE TABLE producto_beneficios (
    producto_id  BIGINT NOT NULL,
    orden        INT NOT NULL,
    texto        VARCHAR(150) NOT NULL,
    PRIMARY KEY (producto_id, orden),
    CONSTRAINT fk_beneficio_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Catálogo de cortes ----------
CREATE TABLE estilos_corte (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    grupo     ENUM('MUJERES','HOMBRES','NINOS','ABUELOS') NOT NULL,
    slug      VARCHAR(60) NOT NULL,
    etiqueta  VARCHAR(80) NOT NULL,
    orden     INT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_estilo_grupo_slug (grupo, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cortes (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    slug         VARCHAR(100) NOT NULL UNIQUE,
    grupo        ENUM('MUJERES','HOMBRES','NINOS','ABUELOS') NOT NULL,
    estilo_id    BIGINT NULL,
    nombre       VARCHAR(120) NOT NULL,
    descripcion  VARCHAR(500),
    imagen_url   VARCHAR(255) NOT NULL,
    -- Características que usa la guía "Encuentra tu corte ideal" (solo grupo MUJERES)
    largo        ENUM('LARGO','MEDIO','CORTO') NULL,
    acabado      ENUM('VOLUMEN','LIGERO','PULIDO') NULL,
    flequillo    BOOLEAN NULL,
    orden        INT NOT NULL DEFAULT 0,
    activo       BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_corte_estilo FOREIGN KEY (estilo_id) REFERENCES estilos_corte(id),
    INDEX idx_cortes_grupo (grupo, activo, orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

INSERT INTO servicios (slug, categoria_id, nombre, descripcion, precio, duracion_minutos, disponible_domicilio, imagen_url, grupo_cortes, orden) VALUES
    ('corte-cabello', (SELECT id FROM categorias WHERE tipo = 'SERVICIO' AND slug = 'cortes'), 'Corte de cabello', 'Corte a tu medida entre más de 10 estilos: capas, mariposa, bob, flequillo y más.', 150, 45, TRUE, 'img/cortes/corte-mariposa.jpg', 'MUJERES', 0),
    ('corte-caballero', (SELECT id FROM categorias WHERE tipo = 'SERVICIO' AND slug = 'cortes'), 'Corte de cabello para caballero', 'Corte clásico o moderno, con acabado limpio y a tu estilo.', NULL, NULL, FALSE, NULL, 'HOMBRES', 10),
    ('corte-ninos-adultos', (SELECT id FROM categorias WHERE tipo = 'SERVICIO' AND slug = 'cortes'), 'Corte de cabello para niños y adultos', 'Cortes cómodos y prácticos para toda la familia.', NULL, NULL, FALSE, 'img/salon-068.jpeg', 'NINOS', 20),
    ('tintes-cabello', (SELECT id FROM categorias WHERE tipo = 'SERVICIO' AND slug = 'color'), 'Tintes de cabello', 'Color completo, mechas y retoque de raíz para renovar tu look.', NULL, NULL, FALSE, 'img/salon-069.jpeg', NULL, 30),
    ('ondas-bucles', (SELECT id FROM categorias WHERE tipo = 'SERVICIO' AND slug = 'peinados'), 'Ondas y bucles', 'Ondas suaves o bucles marcados, con brillo y movimiento.', NULL, NULL, FALSE, 'img/salon-019.jpeg', NULL, 40),
    ('recogidos', (SELECT id FROM categorias WHERE tipo = 'SERVICIO' AND slug = 'peinados'), 'Recogidos elegantes', 'Moños y recogidos pulidos para toda ocasión.', NULL, NULL, FALSE, 'img/salon-046.jpeg', NULL, 50),
    ('trenzas', (SELECT id FROM categorias WHERE tipo = 'SERVICIO' AND slug = 'peinados'), 'Trenzas', 'Trenzas de todo tipo, solas o combinadas con recogidos.', NULL, NULL, FALSE, 'img/salon-095.jpeg', NULL, 60),
    ('peinados-infantiles', (SELECT id FROM categorias WHERE tipo = 'SERVICIO' AND slug = 'peinados'), 'Peinados infantiles', 'Peinados cómodos y bonitos para las más pequeñas de la casa.', NULL, NULL, FALSE, 'img/salon-064.jpeg', NULL, 70),
    ('lacio-brillo', (SELECT id FROM categorias WHERE tipo = 'SERVICIO' AND slug = 'peinados'), 'Lacio y brillo', 'Cabello liso, sedoso y con acabado brillante.', NULL, NULL, FALSE, 'img/salon-037.jpeg', NULL, 80),
    ('rizos-definidos', (SELECT id FROM categorias WHERE tipo = 'SERVICIO' AND slug = 'peinados'), 'Rizos definidos', 'Definición y volumen para tus rizos naturales.', NULL, NULL, FALSE, 'img/salon-092.jpeg', NULL, 90),
    ('novias-eventos', (SELECT id FROM categorias WHERE tipo = 'SERVICIO' AND slug = 'peinados'), 'Novias y eventos', 'Peinados de gala para bodas, quinceañeras y celebraciones.', NULL, NULL, FALSE, 'img/salon-051.jpeg', NULL, 100),
    ('planchado-cejas', (SELECT id FROM categorias WHERE tipo = 'SERVICIO' AND slug = 'cejas-pestanas'), 'Planchado de cejas', 'Cejas peinadas, definidas y con forma por más tiempo.', NULL, NULL, FALSE, 'img/servicios/planchado-de-cejas.jpg', NULL, 110),
    ('rizado-pestanas', (SELECT id FROM categorias WHERE tipo = 'SERVICIO' AND slug = 'cejas-pestanas'), 'Rizado de pestañas', 'Pestañas con curvatura natural y una mirada más abierta, sin extensiones.', NULL, NULL, FALSE, 'img/servicios/rizado-de-pestanas.jpg', NULL, 120),
    ('maquillaje-social', (SELECT id FROM categorias WHERE tipo = 'SERVICIO' AND slug = 'maquillaje'), 'Maquillaje social', 'Maquillaje para reuniones, fiestas y ocasiones especiales.', 250, 60, TRUE, 'img/salon-044.jpeg', NULL, 130);

INSERT INTO servicio_variantes (servicio_id, orden, texto) VALUES
    ((SELECT id FROM servicios WHERE slug = 'corte-caballero'), 0, 'Clásico'),
    ((SELECT id FROM servicios WHERE slug = 'corte-caballero'), 1, 'Degradado'),
    ((SELECT id FROM servicios WHERE slug = 'corte-caballero'), 2, 'A máquina'),
    ((SELECT id FROM servicios WHERE slug = 'corte-ninos-adultos'), 0, 'Niñas'),
    ((SELECT id FROM servicios WHERE slug = 'corte-ninos-adultos'), 1, 'Niños'),
    ((SELECT id FROM servicios WHERE slug = 'corte-ninos-adultos'), 2, 'Adultos'),
    ((SELECT id FROM servicios WHERE slug = 'tintes-cabello'), 0, 'Tinte completo'),
    ((SELECT id FROM servicios WHERE slug = 'tintes-cabello'), 1, 'Mechas y balayage'),
    ((SELECT id FROM servicios WHERE slug = 'tintes-cabello'), 2, 'Retoque de raíz');

INSERT INTO productos (slug, categoria_id, marca, nombre, descripcion, precio, imagen_url, imagen_detalle_url, posicion_imagen, fijacion_texto, nivel_fijacion, acabado_texto, tipo_acabado, orden) VALUES
    ('johnny-b-mode-morado', (SELECT id FROM categorias WHERE tipo = 'PRODUCTO' AND slug = 'geles'), 'Johnny B.', 'Mode Morado', 'Gel de fijación fuerte para peinados estructurados y de larga duración. No deja residuos blancos, da brillo y resiste el sudor.', NULL, 'img/productos/johnny-b-mode-morado.jpg', 'img/productos/detalle/johnny-b-mode-morado.jpg', NULL, 'Fuerte', 'FUERTE', 'Brillante', 'BRILLANTE', 0),
    ('johnny-b-mode-lucky-boy', (SELECT id FROM categorias WHERE tipo = 'PRODUCTO' AND slug = 'geles'), 'Johnny B.', 'Mode Lucky Boy', 'Fijación media a fuerte con acabado natural. No apelmaza el cabello y permite un estilo flexible.', NULL, 'img/productos/johnny-b-mode-lucky-boy.jpg', 'img/productos/detalle/johnny-b-mode-lucky-boy.jpg', NULL, 'Media a fuerte', 'MEDIA', 'Natural', 'NATURAL', 10),
    ('johnny-b-mode-azul', (SELECT id FROM categorias WHERE tipo = 'PRODUCTO' AND slug = 'geles'), 'Johnny B.', 'Mode Azul', 'Mantiene el peinado por horas sin escamas. Ideal para estilos definidos y estructurados.', NULL, 'img/productos/johnny-b-mode-azul.jpg', 'img/productos/detalle/johnny-b-mode-azul.jpg', NULL, 'Fuerte', 'FUERTE', 'Brillante', 'BRILLANTE', 20),
    ('johnny-b-control', (SELECT id FROM categorias WHERE tipo = 'PRODUCTO' AND slug = 'geles'), 'Johnny B.', 'Control', 'Máxima durabilidad para mantener el peinado en su lugar. Ideal para cabello grueso o estilos exigentes.', NULL, 'img/productos/johnny-b-control.jpg', 'img/productos/detalle/johnny-b-control.jpg', NULL, 'Muy fuerte', 'MUY_FUERTE', 'Brillante', 'BRILLANTE', 30),
    ('johnny-b-king-mode', (SELECT id FROM categorias WHERE tipo = 'PRODUCTO' AND slug = 'geles'), 'Johnny B.', 'King Mode', 'Mantiene el peinado todo el día con menos brillo que otros geles de la marca.', NULL, 'img/productos/johnny-b-king-mode.jpg', 'img/productos/detalle/johnny-b-king-mode.jpg', NULL, 'Extra fuerte', 'MUY_FUERTE', 'Semi-mate', 'MATE', 40),
    ('level-3-cream-gel', (SELECT id FROM categorias WHERE tipo = 'PRODUCTO' AND slug = 'geles'), 'Level 3', 'Cream Gel', 'Infundido con vitaminas para cuidar el cabello. Más cremoso que los geles tradicionales, evita la rigidez.', NULL, 'img/productos/level-3-cream-gel.jpg', 'img/productos/detalle/level-3-cream-gel.jpg', NULL, 'Media', 'MEDIA', 'Mate', 'MATE', 50),
    ('level-3-hair-gel', (SELECT id FROM categorias WHERE tipo = 'PRODUCTO' AND slug = 'geles'), 'Level 3', 'Hair Gel', 'Control y definición sin dejar residuos blancos.', NULL, 'img/productos/level-3-hair-gel.jpg', 'img/productos/detalle/level-3-hair-gel.jpg', NULL, 'Fuerte', 'FUERTE', 'Brillante', 'BRILLANTE', 60),
    ('gel-roman-reigns', (SELECT id FROM categorias WHERE tipo = 'PRODUCTO' AND slug = 'geles'), 'WWE', 'Gel Roman Reigns', 'Diseñado para un look duradero y resistente.', NULL, 'img/productos/gel-roman-reigns.jpg', 'img/productos/detalle/gel-roman-reigns.jpg', NULL, 'Fuerte', 'FUERTE', 'Brillante', 'BRILLANTE', 70),
    ('eco-styler-olive-oil', (SELECT id FROM categorias WHERE tipo = 'PRODUCTO' AND slug = 'geles'), 'Eco Styler', 'Olive Oil', 'Hidratante gracias al aceite de oliva. No contiene alcohol, lo que evita la resequedad y el frizz.', NULL, 'img/productos/eco-styler-olive-oil.jpg', 'img/productos/detalle/eco-styler-olive-oil.jpg', NULL, 'Media', 'MEDIA', 'Natural', 'NATURAL', 80),
    ('cantu-wave-whip', (SELECT id FROM categorias WHERE tipo = 'PRODUCTO' AND slug = 'rizos'), 'Cantu', 'Wave Whip Curling Mousse', 'Mousse ligero para definir rizos y ondas, con manteca de karité.', NULL, 'img/productos/cantu-wave-whip.jpg', 'img/productos/detalle/cantu-wave-whip.jpg', '68% 58%', NULL, NULL, NULL, NULL, 90);

INSERT INTO producto_beneficios (producto_id, orden, texto) VALUES
    ((SELECT id FROM productos WHERE slug = 'johnny-b-mode-morado'), 0, 'Fijación fuerte de larga duración'),
    ((SELECT id FROM productos WHERE slug = 'johnny-b-mode-morado'), 1, 'No deja residuos blancos'),
    ((SELECT id FROM productos WHERE slug = 'johnny-b-mode-morado'), 2, 'Da brillo'),
    ((SELECT id FROM productos WHERE slug = 'johnny-b-mode-morado'), 3, 'Resiste el sudor'),
    ((SELECT id FROM productos WHERE slug = 'johnny-b-mode-lucky-boy'), 0, 'Acabado natural'),
    ((SELECT id FROM productos WHERE slug = 'johnny-b-mode-lucky-boy'), 1, 'No apelmaza el cabello'),
    ((SELECT id FROM productos WHERE slug = 'johnny-b-mode-lucky-boy'), 2, 'Permite un estilo flexible'),
    ((SELECT id FROM productos WHERE slug = 'johnny-b-mode-azul'), 0, 'Mantiene el peinado por horas'),
    ((SELECT id FROM productos WHERE slug = 'johnny-b-mode-azul'), 1, 'Sin escamas'),
    ((SELECT id FROM productos WHERE slug = 'johnny-b-mode-azul'), 2, 'Ideal para estilos definidos'),
    ((SELECT id FROM productos WHERE slug = 'johnny-b-control'), 0, 'Máxima durabilidad'),
    ((SELECT id FROM productos WHERE slug = 'johnny-b-control'), 1, 'Ideal para cabello grueso'),
    ((SELECT id FROM productos WHERE slug = 'johnny-b-control'), 2, 'Para estilos exigentes'),
    ((SELECT id FROM productos WHERE slug = 'johnny-b-king-mode'), 0, 'Dura todo el día'),
    ((SELECT id FROM productos WHERE slug = 'johnny-b-king-mode'), 1, 'Menos brillo'),
    ((SELECT id FROM productos WHERE slug = 'johnny-b-king-mode'), 2, 'Acabado semi-mate'),
    ((SELECT id FROM productos WHERE slug = 'level-3-cream-gel'), 0, 'Infundido con vitaminas'),
    ((SELECT id FROM productos WHERE slug = 'level-3-cream-gel'), 1, 'Textura cremosa'),
    ((SELECT id FROM productos WHERE slug = 'level-3-cream-gel'), 2, 'Evita la rigidez'),
    ((SELECT id FROM productos WHERE slug = 'level-3-hair-gel'), 0, 'Control y definición'),
    ((SELECT id FROM productos WHERE slug = 'level-3-hair-gel'), 1, 'Sin residuos blancos'),
    ((SELECT id FROM productos WHERE slug = 'gel-roman-reigns'), 0, 'Look duradero'),
    ((SELECT id FROM productos WHERE slug = 'gel-roman-reigns'), 1, 'Resistente'),
    ((SELECT id FROM productos WHERE slug = 'eco-styler-olive-oil'), 0, 'Hidrata con aceite de oliva'),
    ((SELECT id FROM productos WHERE slug = 'eco-styler-olive-oil'), 1, 'Sin alcohol'),
    ((SELECT id FROM productos WHERE slug = 'eco-styler-olive-oil'), 2, 'Evita la resequedad y el frizz'),
    ((SELECT id FROM productos WHERE slug = 'cantu-wave-whip'), 0, 'Define rizos y ondas'),
    ((SELECT id FROM productos WHERE slug = 'cantu-wave-whip'), 1, 'Con manteca de karité'),
    ((SELECT id FROM productos WHERE slug = 'cantu-wave-whip'), 2, 'Textura de mousse ligera');

INSERT INTO estilos_corte (grupo, slug, etiqueta, orden) VALUES
    ('HOMBRES', 'rizos-y-ondas', 'Rizos y ondas', 0),
    ('HOMBRES', 'degradado', 'Degradado', 10),
    ('HOMBRES', 'clasico-raya-lateral', 'Clásico con raya', 20),
    ('HOMBRES', 'flequillo-y-tazon', 'Flequillo y tazón', 30),
    ('HOMBRES', 'trenzas', 'Trenzas pegadas', 40),
    ('HOMBRES', 'disenos-y-lineas', 'Diseños y líneas', 50),
    ('NINOS', 'ninos', 'Niños', 0),
    ('NINOS', 'ninas', 'Niñas', 10);

INSERT INTO cortes (slug, grupo, estilo_id, nombre, descripcion, imagen_url, largo, acabado, flequillo, orden) VALUES
    ('mariposa', 'MUJERES', NULL, 'Corte mariposa', 'Capas cortas en la parte superior que dan volumen y movimiento, conservando el largo.', 'img/cortes/corte-mariposa.jpg', 'LARGO', 'VOLUMEN', FALSE, 0),
    ('en-v', 'MUJERES', NULL, 'Corte en V', 'Puntas en forma de V que estilizan y alargan la espalda.', 'img/cortes/corte-en-v.jpg', 'LARGO', 'PULIDO', FALSE, 10),
    ('en-u', 'MUJERES', NULL, 'Corte en U', 'Caída redondeada y suave, con las puntas parejas y con forma.', 'img/cortes/corte-en-u.jpg', 'LARGO', 'PULIDO', FALSE, 20),
    ('capas-largas', 'MUJERES', NULL, 'Capas largas', 'Ligereza y movimiento sin perder largo.', 'img/cortes/capas-largas.jpg', 'LARGO', 'LIGERO', FALSE, 30),
    ('pluma', 'MUJERES', NULL, 'Corte pluma', 'Capas finas y desfiladas para un acabado ligero y natural.', 'img/cortes/corte-pluma.jpg', 'LARGO', 'LIGERO', FALSE, 40),
    ('escalonado', 'MUJERES', NULL, 'Corte escalonado', 'Capas marcadas a distintas alturas para dar más volumen.', 'img/cortes/corte-escalonado.jpg', 'LARGO', 'VOLUMEN', FALSE, 50),
    ('capas-clasicas', 'MUJERES', NULL, 'Capas clásicas', 'Capas a media altura, fáciles de peinar y de mantener.', 'img/cortes/capas-clasicas.jpg', 'MEDIO', 'VOLUMEN', FALSE, 60),
    ('capas-suaves', 'MUJERES', NULL, 'Capas suaves', 'Capas ligeras que favorecen las ondas naturales.', 'img/cortes/capas-suaves.jpg', 'MEDIO', 'LIGERO', FALSE, 70),
    ('bob-capas', 'MUJERES', NULL, 'Bob en capas', 'Corte corto a la altura del cuello, con capas que le dan forma.', 'img/cortes/bob-en-capas.jpg', 'CORTO', 'VOLUMEN', FALSE, 80),
    ('flequillo-lateral', 'MUJERES', NULL, 'Capas con flequillo lateral', 'Capas largas con flequillo de lado que enmarca el rostro.', 'img/cortes/capas-flequillo-lateral.jpg', 'LARGO', 'LIGERO', TRUE, 90),
    ('flequillo-recto', 'MUJERES', NULL, 'Flequillo recto', 'Flequillo completo combinado con capas a media altura.', 'img/cortes/flequillo-recto.jpg', 'MEDIO', 'PULIDO', TRUE, 100),
    ('recto', 'MUJERES', NULL, 'Corte recto', 'Largo parejo con las puntas rectas y un acabado impecable.', 'img/cortes/corte-recto.jpg', 'LARGO', 'PULIDO', FALSE, 110),
    ('h-rizos-y-ondas-01', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'rizos-y-ondas'), 'Rizos y ondas 1', 'Rizos definidos u ondas con textura, con o sin degradado a los lados.', 'img/cortes-hombre/rizos-y-ondas/rizos-y-ondas-01.jpeg', NULL, NULL, NULL, 0),
    ('h-rizos-y-ondas-02', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'rizos-y-ondas'), 'Rizos y ondas 2', 'Rizos definidos u ondas con textura, con o sin degradado a los lados.', 'img/cortes-hombre/rizos-y-ondas/rizos-y-ondas-02.jpeg', NULL, NULL, NULL, 10),
    ('h-rizos-y-ondas-03', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'rizos-y-ondas'), 'Rizos y ondas 3', 'Rizos definidos u ondas con textura, con o sin degradado a los lados.', 'img/cortes-hombre/rizos-y-ondas/rizos-y-ondas-03.jpeg', NULL, NULL, NULL, 20),
    ('h-rizos-y-ondas-04', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'rizos-y-ondas'), 'Rizos y ondas 4', 'Rizos definidos u ondas con textura, con o sin degradado a los lados.', 'img/cortes-hombre/rizos-y-ondas/rizos-y-ondas-04.jpeg', NULL, NULL, NULL, 30),
    ('h-rizos-y-ondas-05', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'rizos-y-ondas'), 'Rizos y ondas 5', 'Rizos definidos u ondas con textura, con o sin degradado a los lados.', 'img/cortes-hombre/rizos-y-ondas/rizos-y-ondas-06.jpeg', NULL, NULL, NULL, 40),
    ('h-rizos-y-ondas-06', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'rizos-y-ondas'), 'Rizos y ondas 6', 'Rizos definidos u ondas con textura, con o sin degradado a los lados.', 'img/cortes-hombre/rizos-y-ondas/rizos-y-ondas-08.jpeg', NULL, NULL, NULL, 50),
    ('h-flequillo-y-tazon-01', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'flequillo-y-tazon'), 'Flequillo y tazón 1', 'Flequillo o corte tazón, cómodo y con mucho estilo.', 'img/cortes-hombre/flequillo-y-tazon/flequillo-y-tazon-02.jpeg', NULL, NULL, NULL, 60),
    ('h-rizos-y-ondas-07', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'rizos-y-ondas'), 'Rizos y ondas 7', 'Rizos definidos u ondas con textura, con o sin degradado a los lados.', 'img/cortes-hombre/rizos-y-ondas/rizos-y-ondas-09.jpeg', NULL, NULL, NULL, 70),
    ('h-rizos-y-ondas-08', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'rizos-y-ondas'), 'Rizos y ondas 8', 'Rizos definidos u ondas con textura, con o sin degradado a los lados.', 'img/cortes-hombre/rizos-y-ondas/rizos-y-ondas-10.jpeg', NULL, NULL, NULL, 80),
    ('h-rizos-y-ondas-09', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'rizos-y-ondas'), 'Rizos y ondas 9', 'Rizos definidos u ondas con textura, con o sin degradado a los lados.', 'img/cortes-hombre/rizos-y-ondas/rizos-y-ondas-11.jpeg', NULL, NULL, NULL, 90),
    ('h-rizos-y-ondas-10', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'rizos-y-ondas'), 'Rizos y ondas 10', 'Rizos definidos u ondas con textura, con o sin degradado a los lados.', 'img/cortes-hombre/rizos-y-ondas/rizos-y-ondas-13.jpeg', NULL, NULL, NULL, 100),
    ('h-rizos-y-ondas-11', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'rizos-y-ondas'), 'Rizos y ondas 11', 'Rizos definidos u ondas con textura, con o sin degradado a los lados.', 'img/cortes-hombre/rizos-y-ondas/rizos-y-ondas-14.jpeg', NULL, NULL, NULL, 110),
    ('h-rizos-y-ondas-12', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'rizos-y-ondas'), 'Rizos y ondas 12', 'Rizos definidos u ondas con textura, con o sin degradado a los lados.', 'img/cortes-hombre/rizos-y-ondas/rizos-y-ondas-15.jpeg', NULL, NULL, NULL, 120),
    ('h-rizos-y-ondas-13', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'rizos-y-ondas'), 'Rizos y ondas 13', 'Rizos definidos u ondas con textura, con o sin degradado a los lados.', 'img/cortes-hombre/rizos-y-ondas/rizos-y-ondas-16.jpeg', NULL, NULL, NULL, 130),
    ('h-disenos-y-lineas-01', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'disenos-y-lineas'), 'Diseños y líneas 1', 'Líneas y detalles marcados para un corte con personalidad.', 'img/cortes-hombre/disenos-y-lineas/disenos-y-lineas-01.jpeg', NULL, NULL, NULL, 140),
    ('h-rizos-y-ondas-14', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'rizos-y-ondas'), 'Rizos y ondas 14', 'Rizos definidos u ondas con textura, con o sin degradado a los lados.', 'img/cortes-hombre/rizos-y-ondas/rizos-y-ondas-21.jpeg', NULL, NULL, NULL, 150),
    ('h-rizos-y-ondas-15', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'rizos-y-ondas'), 'Rizos y ondas 15', 'Rizos definidos u ondas con textura, con o sin degradado a los lados.', 'img/cortes-hombre/rizos-y-ondas/rizos-y-ondas-22.jpeg', NULL, NULL, NULL, 160),
    ('h-degradado-01', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'degradado'), 'Degradado 1', 'Laterales y nuca degradados, con un acabado limpio y prolijo.', 'img/cortes-hombre/degradado/degradado-01.jpeg', NULL, NULL, NULL, 170),
    ('h-rizos-y-ondas-16', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'rizos-y-ondas'), 'Rizos y ondas 16', 'Rizos definidos u ondas con textura, con o sin degradado a los lados.', 'img/cortes-hombre/rizos-y-ondas/rizos-y-ondas-23.jpeg', NULL, NULL, NULL, 180),
    ('h-trenzas-01', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'trenzas'), 'Trenzas pegadas 1', 'Trenzas pegadas al cuero cabelludo, prácticas y duraderas.', 'img/cortes-hombre/trenzas/trenzas-01.jpeg', NULL, NULL, NULL, 190),
    ('h-degradado-02', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'degradado'), 'Degradado 2', 'Laterales y nuca degradados, con un acabado limpio y prolijo.', 'img/cortes-hombre/degradado/degradado-02.jpeg', NULL, NULL, NULL, 200),
    ('h-trenzas-02', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'trenzas'), 'Trenzas pegadas 2', 'Trenzas pegadas al cuero cabelludo, prácticas y duraderas.', 'img/cortes-hombre/trenzas/trenzas-06.jpeg', NULL, NULL, NULL, 210),
    ('h-flequillo-y-tazon-02', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'flequillo-y-tazon'), 'Flequillo y tazón 2', 'Flequillo o corte tazón, cómodo y con mucho estilo.', 'img/cortes-hombre/flequillo-y-tazon/flequillo-y-tazon-05.jpeg', NULL, NULL, NULL, 220),
    ('h-clasico-raya-lateral-01', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'clasico-raya-lateral'), 'Clásico con raya 1', 'Peinado hacia el lado o hacia atrás: elegante y fácil de mantener.', 'img/cortes-hombre/clasico-raya-lateral/clasico-raya-lateral-01.jpeg', NULL, NULL, NULL, 230),
    ('h-flequillo-y-tazon-03', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'flequillo-y-tazon'), 'Flequillo y tazón 3', 'Flequillo o corte tazón, cómodo y con mucho estilo.', 'img/cortes-hombre/flequillo-y-tazon/flequillo-y-tazon-10.jpeg', NULL, NULL, NULL, 240),
    ('h-degradado-03', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'degradado'), 'Degradado 3', 'Laterales y nuca degradados, con un acabado limpio y prolijo.', 'img/cortes-hombre/degradado/degradado-03.jpeg', NULL, NULL, NULL, 250),
    ('h-clasico-raya-lateral-02', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'clasico-raya-lateral'), 'Clásico con raya 2', 'Peinado hacia el lado o hacia atrás: elegante y fácil de mantener.', 'img/cortes-hombre/clasico-raya-lateral/clasico-raya-lateral-09.jpeg', NULL, NULL, NULL, 260),
    ('h-clasico-raya-lateral-03', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'clasico-raya-lateral'), 'Clásico con raya 3', 'Peinado hacia el lado o hacia atrás: elegante y fácil de mantener.', 'img/cortes-hombre/clasico-raya-lateral/clasico-raya-lateral-14.jpeg', NULL, NULL, NULL, 270),
    ('h-degradado-04', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'degradado'), 'Degradado 4', 'Laterales y nuca degradados, con un acabado limpio y prolijo.', 'img/cortes-hombre/degradado/degradado-05.jpeg', NULL, NULL, NULL, 280),
    ('h-degradado-05', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'degradado'), 'Degradado 5', 'Laterales y nuca degradados, con un acabado limpio y prolijo.', 'img/cortes-hombre/degradado/degradado-06.jpeg', NULL, NULL, NULL, 290),
    ('h-degradado-06', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'degradado'), 'Degradado 6', 'Laterales y nuca degradados, con un acabado limpio y prolijo.', 'img/cortes-hombre/degradado/degradado-07.jpeg', NULL, NULL, NULL, 300),
    ('h-disenos-y-lineas-02', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'disenos-y-lineas'), 'Diseños y líneas 2', 'Líneas y detalles marcados para un corte con personalidad.', 'img/cortes-hombre/disenos-y-lineas/disenos-y-lineas-03.jpeg', NULL, NULL, NULL, 310),
    ('h-degradado-07', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'degradado'), 'Degradado 7', 'Laterales y nuca degradados, con un acabado limpio y prolijo.', 'img/cortes-hombre/degradado/degradado-09.jpeg', NULL, NULL, NULL, 320),
    ('h-disenos-y-lineas-03', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'disenos-y-lineas'), 'Diseños y líneas 3', 'Líneas y detalles marcados para un corte con personalidad.', 'img/cortes-hombre/disenos-y-lineas/disenos-y-lineas-04.jpeg', NULL, NULL, NULL, 330),
    ('h-clasico-raya-lateral-04', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'clasico-raya-lateral'), 'Clásico con raya 4', 'Peinado hacia el lado o hacia atrás: elegante y fácil de mantener.', 'img/cortes-hombre/clasico-raya-lateral/clasico-raya-lateral-15.jpeg', NULL, NULL, NULL, 340),
    ('h-clasico-raya-lateral-05', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'clasico-raya-lateral'), 'Clásico con raya 5', 'Peinado hacia el lado o hacia atrás: elegante y fácil de mantener.', 'img/cortes-hombre/clasico-raya-lateral/clasico-raya-lateral-16.jpeg', NULL, NULL, NULL, 350),
    ('h-clasico-raya-lateral-06', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'clasico-raya-lateral'), 'Clásico con raya 6', 'Peinado hacia el lado o hacia atrás: elegante y fácil de mantener.', 'img/cortes-hombre/clasico-raya-lateral/clasico-raya-lateral-17.jpeg', NULL, NULL, NULL, 360),
    ('h-degradado-08', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'degradado'), 'Degradado 8', 'Laterales y nuca degradados, con un acabado limpio y prolijo.', 'img/cortes-hombre/degradado/degradado-10.jpeg', NULL, NULL, NULL, 370),
    ('h-flequillo-y-tazon-04', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'flequillo-y-tazon'), 'Flequillo y tazón 4', 'Flequillo o corte tazón, cómodo y con mucho estilo.', 'img/cortes-hombre/flequillo-y-tazon/flequillo-y-tazon-13.jpeg', NULL, NULL, NULL, 380),
    ('h-flequillo-y-tazon-05', 'HOMBRES', (SELECT id FROM estilos_corte WHERE grupo = 'HOMBRES' AND slug = 'flequillo-y-tazon'), 'Flequillo y tazón 5', 'Flequillo o corte tazón, cómodo y con mucho estilo.', 'img/cortes-hombre/flequillo-y-tazon/flequillo-y-tazon-14.jpeg', NULL, NULL, NULL, 390),
    ('n-rizos-y-ondas-01', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Rizos y ondas 1', 'Rizos definidos u ondas con textura, con o sin degradado a los lados.', 'img/cortes-hombre/rizos-y-ondas/rizos-y-ondas-18.jpeg', NULL, NULL, NULL, 0),
    ('n-rizos-y-ondas-02', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Rizos y ondas 2', 'Rizos definidos u ondas con textura, con o sin degradado a los lados.', 'img/cortes-hombre/rizos-y-ondas/rizos-y-ondas-19.jpeg', NULL, NULL, NULL, 10),
    ('n-rizos-y-ondas-03', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Rizos y ondas 3', 'Rizos definidos u ondas con textura, con o sin degradado a los lados.', 'img/cortes-hombre/rizos-y-ondas/rizos-y-ondas-20.jpeg', NULL, NULL, NULL, 20),
    ('n-disenos-y-lineas-01', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Diseños y líneas 1', 'Líneas y detalles marcados para un corte con personalidad.', 'img/cortes-hombre/disenos-y-lineas/disenos-y-lineas-02.jpeg', NULL, NULL, NULL, 30),
    ('n-afro-y-rizos-cerrados-01', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Afro y rizos cerrados 1', 'Rizo cerrado con forma y un degradado limpio.', 'img/cortes-hombre/afro-y-rizos-cerrados/afro-y-rizos-cerrados-02.jpeg', NULL, NULL, NULL, 40),
    ('n-afro-y-rizos-cerrados-02', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Afro y rizos cerrados 2', 'Rizo cerrado con forma y un degradado limpio.', 'img/cortes-hombre/afro-y-rizos-cerrados/afro-y-rizos-cerrados-03.jpeg', NULL, NULL, NULL, 50),
    ('n-afro-y-rizos-cerrados-03', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Afro y rizos cerrados 3', 'Rizo cerrado con forma y un degradado limpio.', 'img/cortes-hombre/afro-y-rizos-cerrados/afro-y-rizos-cerrados-04.jpeg', NULL, NULL, NULL, 60),
    ('n-trenzas-01', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Trenzas pegadas 1', 'Trenzas pegadas al cuero cabelludo, prácticas y duraderas.', 'img/cortes-hombre/trenzas/trenzas-02.jpeg', NULL, NULL, NULL, 70),
    ('n-trenzas-02', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Trenzas pegadas 2', 'Trenzas pegadas al cuero cabelludo, prácticas y duraderas.', 'img/cortes-hombre/trenzas/trenzas-03.jpeg', NULL, NULL, NULL, 80),
    ('n-trenzas-03', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Trenzas pegadas 3', 'Trenzas pegadas al cuero cabelludo, prácticas y duraderas.', 'img/cortes-hombre/trenzas/trenzas-04.jpeg', NULL, NULL, NULL, 90),
    ('n-flequillo-y-tazon-01', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Flequillo y tazón 1', 'Flequillo o corte tazón, cómodo y con mucho estilo.', 'img/cortes-hombre/flequillo-y-tazon/flequillo-y-tazon-06.jpeg', NULL, NULL, NULL, 100),
    ('n-flequillo-y-tazon-02', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Flequillo y tazón 2', 'Flequillo o corte tazón, cómodo y con mucho estilo.', 'img/cortes-hombre/flequillo-y-tazon/flequillo-y-tazon-07.jpeg', NULL, NULL, NULL, 110),
    ('n-flequillo-y-tazon-03', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Flequillo y tazón 3', 'Flequillo o corte tazón, cómodo y con mucho estilo.', 'img/cortes-hombre/flequillo-y-tazon/flequillo-y-tazon-08.jpeg', NULL, NULL, NULL, 120),
    ('n-flequillo-y-tazon-04', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Flequillo y tazón 4', 'Flequillo o corte tazón, cómodo y con mucho estilo.', 'img/cortes-hombre/flequillo-y-tazon/flequillo-y-tazon-09.jpeg', NULL, NULL, NULL, 130),
    ('n-flequillo-y-tazon-05', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Flequillo y tazón 5', 'Flequillo o corte tazón, cómodo y con mucho estilo.', 'img/cortes-hombre/flequillo-y-tazon/flequillo-y-tazon-11.jpeg', NULL, NULL, NULL, 140),
    ('n-clasico-raya-lateral-01', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Clásico con raya 1', 'Peinado hacia el lado o hacia atrás: elegante y fácil de mantener.', 'img/cortes-hombre/clasico-raya-lateral/clasico-raya-lateral-02.jpeg', NULL, NULL, NULL, 150),
    ('n-clasico-raya-lateral-02', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Clásico con raya 2', 'Peinado hacia el lado o hacia atrás: elegante y fácil de mantener.', 'img/cortes-hombre/clasico-raya-lateral/clasico-raya-lateral-03.jpeg', NULL, NULL, NULL, 160),
    ('n-clasico-raya-lateral-03', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Clásico con raya 3', 'Peinado hacia el lado o hacia atrás: elegante y fácil de mantener.', 'img/cortes-hombre/clasico-raya-lateral/clasico-raya-lateral-04.jpeg', NULL, NULL, NULL, 170),
    ('n-clasico-raya-lateral-04', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Clásico con raya 4', 'Peinado hacia el lado o hacia atrás: elegante y fácil de mantener.', 'img/cortes-hombre/clasico-raya-lateral/clasico-raya-lateral-05.jpeg', NULL, NULL, NULL, 180),
    ('n-clasico-raya-lateral-05', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Clásico con raya 5', 'Peinado hacia el lado o hacia atrás: elegante y fácil de mantener.', 'img/cortes-hombre/clasico-raya-lateral/clasico-raya-lateral-06.jpeg', NULL, NULL, NULL, 190),
    ('n-clasico-raya-lateral-06', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Clásico con raya 6', 'Peinado hacia el lado o hacia atrás: elegante y fácil de mantener.', 'img/cortes-hombre/clasico-raya-lateral/clasico-raya-lateral-08.jpeg', NULL, NULL, NULL, 200),
    ('n-degradado-01', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Degradado 1', 'Laterales y nuca degradados, con un acabado limpio y prolijo.', 'img/cortes-hombre/degradado/degradado-04.jpeg', NULL, NULL, NULL, 210),
    ('n-clasico-raya-lateral-07', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Clásico con raya 7', 'Peinado hacia el lado o hacia atrás: elegante y fácil de mantener.', 'img/cortes-hombre/clasico-raya-lateral/clasico-raya-lateral-10.jpeg', NULL, NULL, NULL, 220),
    ('n-clasico-raya-lateral-08', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Clásico con raya 8', 'Peinado hacia el lado o hacia atrás: elegante y fácil de mantener.', 'img/cortes-hombre/clasico-raya-lateral/clasico-raya-lateral-12.jpeg', NULL, NULL, NULL, 230),
    ('n-clasico-raya-lateral-09', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Clásico con raya 9', 'Peinado hacia el lado o hacia atrás: elegante y fácil de mantener.', 'img/cortes-hombre/clasico-raya-lateral/clasico-raya-lateral-13.jpeg', NULL, NULL, NULL, 240),
    ('n-degradado-02', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninos'), 'Degradado 2', 'Laterales y nuca degradados, con un acabado limpio y prolijo.', 'img/cortes-hombre/degradado/degradado-08.jpeg', NULL, NULL, NULL, 250),
    ('ninas-01', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninas'), 'Flequillo con rizos', 'Peinado para niñas, cómodo y con detalles para sus momentos especiales.', 'img/salon-057.jpeg', NULL, NULL, NULL, 260),
    ('ninas-02', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninas'), 'Flequillo y recogido con tiara', 'Peinado para niñas, cómodo y con detalles para sus momentos especiales.', 'img/salon-062.jpeg', NULL, NULL, NULL, 270),
    ('ninas-03', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninas'), 'Rizos largos sueltos', 'Peinado para niñas, cómodo y con detalles para sus momentos especiales.', 'img/salon-064.jpeg', NULL, NULL, NULL, 280),
    ('ninas-04', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninas'), 'Recogido desenfadado', 'Peinado para niñas, cómodo y con detalles para sus momentos especiales.', 'img/salon-066.jpeg', NULL, NULL, NULL, 290),
    ('ninas-05', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninas'), 'Corona de flores', 'Peinado para niñas, cómodo y con detalles para sus momentos especiales.', 'img/salon-067.jpeg', NULL, NULL, NULL, 300),
    ('ninas-06', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninas'), 'Ondas largas con diadema', 'Peinado para niñas, cómodo y con detalles para sus momentos especiales.', 'img/salon-068.jpeg', NULL, NULL, NULL, 310),
    ('ninas-07', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninas'), 'Ondas con trenza corona', 'Peinado para niñas, cómodo y con detalles para sus momentos especiales.', 'img/salon-069.jpeg', NULL, NULL, NULL, 320),
    ('ninas-08', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninas'), 'Ondas con trenza', 'Peinado para niñas, cómodo y con detalles para sus momentos especiales.', 'img/salon-026.jpeg', NULL, NULL, NULL, 330),
    ('ninas-09', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninas'), 'Rizos con diadema', 'Peinado para niñas, cómodo y con detalles para sus momentos especiales.', 'img/salon-029.jpeg', NULL, NULL, NULL, 340),
    ('ninas-10', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninas'), 'Ondas largas con trenza', 'Peinado para niñas, cómodo y con detalles para sus momentos especiales.', 'img/salon-032.jpeg', NULL, NULL, NULL, 350),
    ('ninas-11', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninas'), 'Moño con tiara dorada', 'Peinado para niñas, cómodo y con detalles para sus momentos especiales.', 'img/salon-065.jpeg', NULL, NULL, NULL, 360),
    ('ninas-12', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninas'), 'Moño con tiara', 'Peinado para niñas, cómodo y con detalles para sus momentos especiales.', 'img/salon-058.jpeg', NULL, NULL, NULL, 370),
    ('ninas-13', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninas'), 'Recogido con perlas', 'Peinado para niñas, cómodo y con detalles para sus momentos especiales.', 'img/salon-060.jpeg', NULL, NULL, NULL, 380),
    ('ninas-14', 'NINOS', (SELECT id FROM estilos_corte WHERE grupo = 'NINOS' AND slug = 'ninas'), 'Recogido con encaje', 'Peinado para niñas, cómodo y con detalles para sus momentos especiales.', 'img/salon-081.jpeg', NULL, NULL, NULL, 390);

-- Slug obligatorio y único una vez cargados los datos
ALTER TABLE servicios MODIFY slug VARCHAR(100) NOT NULL, ADD UNIQUE KEY uk_servicios_slug (slug);
ALTER TABLE productos MODIFY slug VARCHAR(100) NOT NULL, ADD UNIQUE KEY uk_productos_slug (slug);
