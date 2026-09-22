-- =====================================================
-- V3__usuarios_demo.sql — Salón de Belleza Familiar
-- Usuarios de prueba para validar el login por rol.
-- Las contraseñas están hasheadas con BCrypt (coste 10).
-- CAMBIAR O ELIMINAR estos usuarios antes de un despliegue real.
-- =====================================================

-- Estilista de prueba: marisol@salondebellezafamiliar.com / Estilista1234!
INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol, doble_factor_activo)
VALUES ('Marisol', 'Gómez', 'marisol@salondebellezafamiliar.com', '5555-1010',
        '$2a$10$3BMzJ4UdY1SbJhYuyRDDKusJhAjj80IZGaWJI0O9eekDDz1jC2n3W',
        'ESTILISTA', FALSE);

-- Cliente de prueba: cliente@correo.com / Cliente1234!
INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol, doble_factor_activo)
VALUES ('Ana', 'Rodríguez', 'cliente@correo.com', '5555-2020',
        '$2a$10$ReiBuLsPqEzgUCXRE2lufuvtO1uYq9xaztDHDzUqZwbrwqVyI5gsu',
        'CLIENTE', FALSE);

-- La estilista necesita su ficha en la tabla estilistas para poder tener agenda.
INSERT INTO estilistas (usuario_id, especialidad)
SELECT id, 'Corte, color y peinado'
FROM usuarios
WHERE email = 'marisol@salondebellezafamiliar.com';

-- Horario semanal base de la estilista: lunes a viernes 09:00-18:00 y sábado 09:00-14:00.
INSERT INTO horarios_estilista (estilista_id, dia_semana, hora_inicio, hora_fin)
SELECT e.id, d.dia, d.inicio, d.fin
FROM estilistas e
JOIN usuarios u ON u.id = e.usuario_id
JOIN (
    SELECT 1 AS dia, '09:00:00' AS inicio, '18:00:00' AS fin
    UNION ALL SELECT 2, '09:00:00', '18:00:00'
    UNION ALL SELECT 3, '09:00:00', '18:00:00'
    UNION ALL SELECT 4, '09:00:00', '18:00:00'
    UNION ALL SELECT 5, '09:00:00', '18:00:00'
    UNION ALL SELECT 6, '09:00:00', '14:00:00'
) d
WHERE u.email = 'marisol@salondebellezafamiliar.com';
