# Salón de Belleza Familiar

Sistema de agendamiento de citas. Backend en Spring Boot (`salon-api`) y frontend en Angular (`salon-client`).

## Requisitos

- Docker y Docker Compose
- Java 21 y Node 20 (solo para el modo desarrollo)

## 1. Configuración

```bash
cp .env.example .env
```

Rellenar en `.env`:

| Variable | Qué poner |
|---|---|
| `DB_NAME` | `salondebellezafamiliar` |
| `DB_USER` | `root` — el contenedor de MySQL solo crea ese usuario |
| `DB_PASSWORD` | Cualquier contraseña local, ej. `salon_local_2026` |
| `DB_HOST` | `localhost` |
| `DB_PORT` | `3307` — puerto en tu máquina; dentro de Docker el backend usa el 3306 interno |
| `JWT_SECRET` | **Mínimo 32 caracteres** o la API no arranca. Generar con `openssl rand -base64 48` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:4200` |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | Opcionales; sin ellos no se envían correos |

## 2. Levantar todo con Docker

```bash
docker compose up -d --build
```

Arranca MySQL y la API en `http://localhost:8080`. Flyway crea el esquema y los usuarios de prueba en el primer arranque.

El frontend se levanta aparte:

```bash
npm --prefix salon-client install && npm --prefix salon-client start
```

Queda en `http://localhost:4200`.

## 3. Modo desarrollo (recargar cambios de Java sin reconstruir la imagen)

Levantar solo la base de datos:

```bash
docker compose up -d mysql
```

Y correr la API desde el código, cargando el `.env` (Gradle no lo lee solo):

```bash
set -a && . ./.env && set +a && cd salon-api && ./gradlew bootRun
```

## Usuarios de prueba

Creados por la migración `V3__usuarios_demo.sql`. **Cambiarlos antes de cualquier despliegue real.**

| Rol | Correo | Contraseña | Pantalla tras iniciar sesión |
|---|---|---|---|
| Administrador | `admin@salondebellezafamiliar.com` | `Admin1234!` | `/admin` |
| Estilista | `marisol@salondebellezafamiliar.com` | `Estilista1234!` | `/estilista` |
| Cliente | `cliente@correo.com` | `Cliente1234!` | `/mi-cuenta` |

Quien se registre desde `/registro` siempre queda como `CLIENTE`.

## Pruebas

```bash
npm --prefix salon-client test
```

```bash
cd salon-api && ./gradlew test --tests '*AuthServiceTest' --tests '*JwtServiceTest'
```

`./gradlew test` completo incluye `SalonApiApplicationTests`, que necesita la base de datos levantada.

## API

Documentación interactiva en **`http://localhost:8080/docs`** con la API corriendo.

Para probar endpoints protegidos desde Swagger: hacer `POST /api/auth/login`, copiar el `token` de la respuesta y pegarlo en el botón **Authorize** de arriba a la derecha (solo el token, sin escribir `Bearer`).

### Autenticación

| Método | Ruta | Acceso |
|---|---|---|
| `POST` | `/api/auth/register` | Público — **siempre crea CLIENTE** |
| `POST` | `/api/auth/login` | Público |
| `GET` | `/api/auth/me` | Requiere token |

### Usuarios — solo administrador

Es la única vía para dar de alta estilistas.

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/admin/usuarios` | Lista con filtros `rol`, `activo`, `busqueda` y paginación |
| `GET` | `/api/admin/usuarios/{id}` | Trae uno |
| `POST` | `/api/admin/usuarios` | Crea con cualquier rol; si es `ESTILISTA` también crea su ficha |
| `PUT` | `/api/admin/usuarios/{id}` | Edita datos (no toca rol ni contraseña) |
| `DELETE` | `/api/admin/usuarios/{id}` | **Desactiva** — pone `activo=false`, no borra |
| `PATCH` | `/api/admin/usuarios/{id}/activar` | Reactiva |
| `PATCH` | `/api/admin/usuarios/{id}/password` | Reinicia la contraseña |

Reglas que aplica el backend:

- Quien se registra desde la página principal siempre queda como `CLIENTE`, aunque mande otro rol en el JSON.
- Un usuario desactivado no puede iniciar sesión.
- Un administrador no puede desactivarse a sí mismo.
- Desactivar una estilista también desactiva su ficha en `estilistas`.

El token se manda en `Authorization: Bearer <token>` y dura 60 minutos.

## Notas

- `/actuator/health` responde `DOWN` si `MAIL_USERNAME` y `MAIL_PASSWORD` están vacíos: es el chequeo de correo, la API funciona igual.
- `docker compose down -v` borra también la base de datos; sin `-v` conserva los datos.
