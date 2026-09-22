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

## Notas

- `/actuator/health` responde `DOWN` si `MAIL_USERNAME` y `MAIL_PASSWORD` están vacíos: es el chequeo de correo, la API funciona igual.
- `docker compose down -v` borra también la base de datos; sin `-v` conserva los datos.
