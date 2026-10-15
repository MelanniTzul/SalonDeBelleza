-- Las categorías ahora se pueden desactivar desde el panel de administración,
-- igual que servicios, productos y cortes: nunca se borran, solo se ocultan.
ALTER TABLE categorias
    ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE;
