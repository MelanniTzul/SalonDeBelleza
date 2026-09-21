# Salón de Belleza Familiar

<<<<<<< HEAD
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
cd salon-api && ./gradlew test --tests '*ServiceTest'
```

`./gradlew test` completo incluye `SalonApiApplicationTests`, que necesita la base de datos levantada.

## Notas

- `/actuator/health` responde `DOWN` si `MAIL_USERNAME` y `MAIL_PASSWORD` están vacíos: es el chequeo de correo, la API funciona igual.
- `docker compose down -v` borra también la base de datos; sin `-v` conserva los datos.
=======
Sitio web y sistema de agendamiento del salón. Monorepo con:

- `salon-api/` — backend (Spring Boot 4, Java 21, MySQL 8, Flyway).
- `salon-client/` — frontend (Angular 21, Tailwind 4, PrimeNG).

## Cómo ejecutarlo

```bash
cp .env.example .env            # completar DB_NAME, DB_PASSWORD, JWT_SECRET
docker compose up -d --build    # MySQL + backend en http://localhost:8080

cd salon-client
npm install
npm start                       # http://localhost:4200
```

En desarrollo, `npm start` reenvía `/api` y `/uploads` al backend (`proxy.conf.mjs`), así no hay problemas de CORS.
Para usar otro backend: `API_URL=http://localhost:8090 npm start`.

## Catálogo: servicios, productos y cortes

Todo el catálogo vive en la base de datos y el sitio lo consume por la API. Las tablas las crea Flyway
(`V3__catalogo.sql` también carga los datos iniciales). Swagger: <http://localhost:8080/docs>.

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

- El frontend y la API deben quedar bajo el mismo dominio (el servidor web reenvía `/api` y `/uploads` al backend),
  o bien definir `API_URL` en `salon-client/src/app/core/config/api.config.ts` y agregar el dominio del frontend a
  `CORS_ALLOWED_ORIGINS`.
- Cambiar la contraseña del administrador de prueba (`V1__init_schema.sql`) y `JWT_SECRET`.

## Pruebas del backend

Son de integración y usan una base MySQL real (Flyway aplica todas las migraciones al iniciar):

```bash
cd salon-api
DB_HOST=localhost DB_PORT=3307 DB_NAME=salon_test DB_USER=root DB_PASSWORD=... ./gradlew test
```

Usa una base **distinta** a la de trabajo: cada prueba revierte lo que escribe, pero Flyway sí crea el esquema.
>>>>>>> feature/Servicios
