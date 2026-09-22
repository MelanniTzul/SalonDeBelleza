# Diagramas BPMN — Salón de Belleza Familiar

37 procesos, cada uno con un único propósito, con carriles por actor (Cliente, Estilista, Administrador, Usuario, Sistema). Cada uno tiene su archivo `.bpmn` (para abrir y editar con la extensión **BPMN.io Editor** de VS Code) y su imagen `.png` ya lista para pegar en el Word.

## Acceso y cuenta

| Archivo | Proceso |
|---|---|
| `01-registro-cliente` | Registro de un nuevo cliente |
| `02-inicio-sesion` | Inicio de sesión |
| `03-verificacion-dos-pasos` | Verificación en dos pasos (2FA) |
| `04-solicitar-codigo-recuperacion` | Solicitar código de recuperación de contraseña |
| `05-restablecer-contrasena` | Restablecer contraseña con el código |

## Agendar y gestionar una cita (cliente)

| Archivo | Proceso |
|---|---|
| `06-elegir-servicios-modalidad` | Elegir servicios y modalidad de la cita |
| `07-elegir-zona-cobertura` | Elegir zona de cobertura a domicilio |
| `08-elegir-estilista-fecha-hora` | Elegir estilista, fecha y hora |
| `09-confirmar-cita-ticket` | Confirmar la cita y generar el ticket |
| `10-notificar-nueva-cita` | Notificar la nueva cita |
| `11-cancelar-cita` | Cancelar una cita |
| `12-reprogramar-cita` | Reprogramar una cita |

## Estilista

| Archivo | Proceso |
|---|---|
| `13-definir-horario-estilista` | Definir horario laboral de la estilista |
| `14-bloquear-horas-estilista` | Bloquear horas de la estilista |
| `15-cerrar-cita` | Cerrar una cita (completada o no asistió) |

## Catálogo (administrador)

| Archivo | Proceso |
|---|---|
| `16-crear-servicio-producto` | Crear un servicio o producto |
| `17-editar-servicio-producto` | Editar un servicio o producto |
| `18-gestionar-catalogo-cortes` | Gestionar el catálogo de cortes |
| `19-subir-imagen-catalogo` | Subir una imagen al catálogo |
| `20-desactivar-elemento-catalogo` | Desactivar un elemento del catálogo |

## Usuarios (administrador)

| Archivo | Proceso |
|---|---|
| `21-crear-usuario` | Crear un usuario |
| `22-editar-usuario` | Editar un usuario |
| `23-desactivar-usuario` | Desactivar un usuario |
| `24-restablecer-password-usuario` | Restablecer la contraseña de un usuario |

## Cliente — otros

| Archivo | Proceso |
|---|---|
| `25-lista-deseos` | Guardar y quitar de la lista de deseos |

## Perfil (los tres roles)

| Archivo | Proceso |
|---|---|
| `26-editar-mi-perfil` | Editar mi perfil |
| `27-cambiar-mi-contrasena` | Cambiar mi contraseña |
| `28-cambiar-foto-perfil` | Subir o cambiar mi foto de perfil |

## Pago de la cita

| Archivo | Proceso |
|---|---|
| `29-elegir-forma-pago` | Elegir la forma de pago (efectivo o transferencia) |
| `30-verificar-comprobante-pago` | Verificar un comprobante de pago (administrador) |

## Reportes y estilistas (administrador)

| Archivo | Proceso |
|---|---|
| `31-generar-exportar-reportes` | Generar y exportar reportes (.xlsx / PDF) |
| `32-asignar-servicios-estilista` | Asignar los servicios que ofrece una estilista |
| `34-gestionar-zonas-cobertura` | Gestionar las zonas de cobertura a domicilio |

## Estilista — otros

| Archivo | Proceso |
|---|---|
| `33-ver-detalle-cita-estilista` | Ver el detalle de una cita |

## Acceso y cuenta — otros

| Archivo | Proceso |
|---|---|
| `35-ver-notificaciones-app` | Ver avisos dentro de la app |
| `36-reenviar-codigo-verificacion` | Reenviar un código de verificación (2FA o recuperación) |
| `37-cerrar-sesion` | Cerrar sesión |

## Cómo se hicieron

Los generé por código a partir del comportamiento real del sistema (rutas, entidades y reglas descritas en `docs/historias-de-usuario.md` y en las migraciones de la base de datos), no a mano en el editor. Cada `.bpmn` es un XML válido de BPMN 2.0 con su diagrama (DI) ya definido, así que al abrirlo en VS Code con la extensión BPMN.io se ve directamente con este mismo diseño, y desde ahí puedes mover, editar o corregir cualquier cosa.

Son la versión desglosada de un primer set de 8 diagramas más grandes: cada proceso amplio (por ejemplo, "agendar una cita") quedó dividido en varios diagramas pequeños de un solo propósito (elegir servicios, elegir zona, elegir horario, confirmar, notificar...), que es como se ve mejor en un documento.

## Procesos pendientes de construir

Estos diagramas modelan el proceso **completo**, incluyendo partes que hoy todavía no están programadas (ver `docs/historias-de-usuario.md`). Cada uno lo señala con una nota (anotación de texto) en el propio diagrama:

- **02 y 03 — Inicio de sesión / 2FA**: la verificación en dos pasos no está implementada; hoy siempre sigue la rama "No" de "¿Tiene el doble factor activado?".
- **04 y 05 — Recuperar contraseña**: no existe todavía ni el endpoint ni la pantalla.
- **06 a 12 — Todo lo de agendar, cancelar y reprogramar citas**: hoy no existen ni la pantalla `/agendar` ni los endpoints de citas.
- **13 a 15 — Horario y cierre de la estilista**: depende de que exista el módulo de citas.
- **16 a 20 — Gestión del catálogo**: la API ya existe; falta la pantalla de administración.
- **21 a 24 — Gestión de usuarios**: ya funciona por completo.
- **25 — Lista de deseos**: ya funciona por completo.
- **26 a 28 — Editar mi perfil, cambiar mi contraseña y mi foto**: ya funcionan por completo.
- **29 y 30 — Pago de la cita (efectivo / transferencia) y su verificación**: no existen todavía; la base de datos tampoco guarda forma ni estado de pago (no hay ese campo en la tabla `citas`). Si se agrega, hay que sumarlo a las migraciones.
- **31 — Generar y exportar reportes**: el panel `/admin` ya muestra indicadores, pero son de muestra y no se pueden exportar.
- **32 — Asignar los servicios que ofrece una estilista**: no existe todavía (tabla `estilista_servicios` ya creada, sin API ni pantalla).
- **33 — Ver el detalle de una cita (estilista)**: no existe todavía; depende de que exista el módulo de citas.
- **34 — Gestionar las zonas de cobertura**: no existe todavía (tabla `zonas_cobertura` ya creada, con 3 zonas de ejemplo, sin pantalla de administración).
- **35 — Ver avisos dentro de la app**: no existe todavía (tabla `notificaciones` ya creada, sin pantalla).
- **36 — Reenviar un código de verificación**: depende de que existan el 2FA (32) y la recuperación de contraseña (04/05).
- **37 — Cerrar sesión**: ya funciona por completo.

## Notas sobre el alcance

Algunas pantallas de tu mockup son solo de **navegación o consulta** (ver la lista de "Mis citas", ver la agenda semanal, buscar en la lista de usuarios, examinar el catálogo). No tienen un diagrama propio porque un BPMN modela pasos y decisiones de un proceso, y abrir una lista no tiene ninguna: es la misma acción de "consultar" en todos los casos.

## Para exportar otra imagen desde VS Code

Si editas un `.bpmn` y quieres una imagen nueva:

1. Abre el archivo (se abre automáticamente con la extensión BPMN.io Editor).
2. Clic derecho sobre el lienzo → **Export as SVG/PNG** (o desde la paleta de comandos, `Ctrl+Shift+P` → "BPMN: Export").
3. Guarda la imagen en esta misma carpeta, sobre el `.png` existente.
