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

Arranca MySQL y la API en `http://localhost:8080`. Flyway crea el esquema, los usuarios de prueba y el catálogo inicial en el primer arranque. Swagger: <http://localhost:8080/docs>.

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

## Catálogo: servicios, productos y cortes

Todo el catálogo vive en la base de datos y el sitio lo consume por la API. Las tablas las crea Flyway
(`V4__catalogo.sql` también carga los datos iniciales). Swagger: <http://localhost:8080/docs>.

**Público (sin sesión, solo lectura)**

| Ruta | Devuelve |
|---|---|
| `GET /api/servicios?categoria=slug` | Servicios activos |
| `GET /api/servicios/{slug}` | Un servicio |
| `GET /api/productos?categoria=slug` | Productos activos |
| `GET /api/productos/{slug}` | Un producto |
| `GET /api/categorias?tipo=SERVICIO\|PRODUCTO` | Categorías |
| `GET /api/cortes` | Catálogo de cortes por grupo (mujeres, hombres, niños, abuelos), con sus estilos |

**Administración (requiere token de `ADMINISTRADOR`)**

| Ruta | Acción |
|---|---|
| `GET /api/admin/{servicios,productos,cortes}` | Lista todo, también lo desactivado |
| `POST /api/admin/{servicios,productos,cortes}` | Crea |
| `PUT /api/admin/{servicios,productos,cortes}/{id}` | Edita (con `"activo": true` reactiva) |
| `DELETE /api/admin/{servicios,productos,cortes}/{id}` | Desactiva (baja lógica: no se borra nada) |
| `POST /api/admin/imagenes` | Sube una imagen (`carpeta` = servicios, productos o cortes; `archivo`) |

El token se obtiene con `POST /api/auth/login` y se envía como `Authorization: Bearer <token>`.

### Imágenes

La base solo guarda la **ruta** de la imagen, nunca el archivo:

- `img/...` — imágenes que vienen con el frontend (`salon-client/public/img`).
- `uploads/...` — imágenes que sube el administrador. Se guardan en `UPLOADS_DIR` (volumen `uploads_data` en Docker)
  y la API las sirve en `/uploads/...`.

Al subir se valida por contenido (JPG, PNG o WebP), máximo 5 MB, y el servidor asigna un nombre aleatorio.
Las rutas que se guardan en servicios, productos y cortes solo pueden empezar por `img/` o `uploads/`.

### Producción

- La dirección de la API se define en `salon-client/src/environments/environment.ts` (`apiUrl`), la misma que usa el login.
  El dominio del frontend debe estar en `CORS_ALLOWED_ORIGINS` del backend.
- Cambiar las contraseñas de los usuarios de prueba y `JWT_SECRET`.

## Usuarios de prueba

Creados por la migración `V3__usuarios_demo.sql` (el administrador de prueba viene de `V1`). **Cambiarlos antes de cualquier despliegue real.**

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
cd salon-api && ./gradlew test --tests '*ServiceTest'
```

`./gradlew test` completo incluye pruebas de integración (`SalonApiApplicationTests` y las de `catalogo/`) que usan una base MySQL real:
Flyway aplica todas las migraciones al iniciar. Conviene apuntarlas a una base **distinta** a la de trabajo:

```bash
DB_HOST=localhost DB_PORT=3307 DB_NAME=salon_test DB_USER=root DB_PASSWORD=... ./gradlew test
```

## Notas

- `/actuator/health` responde `DOWN` si `MAIL_USERNAME` y `MAIL_PASSWORD` están vacíos: es el chequeo de correo, la API funciona igual.
- `docker compose down -v` borra también la base de datos; sin `-v` conserva los datos.
