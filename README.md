# Libro de Ingreso de Expedientes

Aplicación elegida para los trabajos prácticos de Ingeniería del Software 3. El
sistema tiene un frontend web, una API Flask y una base de datos MySQL.

## Requisitos

- Git.
- Docker con Docker Compose.

## Arranque desde cero

```bash
git clone https://github.com/franco2355/ingsoft3-tp01.git
cd ingsoft3-tp01
cp .env.example .env
```

Antes de iniciar, editá `.env` y reemplazá todos los valores `cambiar`. Esos
valores son locales y el archivo `.env` no se guarda en Git.

Construí e iniciá los tres servicios:

```bash
docker compose up -d --build
```

Comprobá el estado:

```bash
docker compose ps
```

Abrí <http://localhost:3000> e ingresá con los valores `APP_USER` y
`APP_PASSWORD` configurados en `.env`. La API queda disponible a través del
frontend y también directamente en <http://localhost:8000/healthz>.

## Arranque con imágenes del registry

Esta variante descarga las imágenes públicas `v0.1.0` desde GitHub Container
Registry:

```bash
cp .env.example .env
docker compose -f docker-compose.registry.yml up -d
```

También requiere reemplazar previamente los valores `cambiar` del archivo
`.env`.

## Detener el sistema

Para detener los contenedores conservando la base de datos:

```bash
docker compose down
```

Para eliminar también los datos persistidos:

```bash
docker compose down -v
```

Si levantaste la variante del registry, agregá
`-f docker-compose.registry.yml` a esos comandos.

## Pruebas

```bash
docker run --rm -v "$PWD/backend:/app" -w /app python:3.12 \
  sh -c "pip install -r requirements.txt && python -m unittest discover -s tests"
docker run --rm -v "$PWD/frontend:/app" -w /app node:22-alpine \
  npm run check
```

## Servicios

| Servicio | Tecnología | Puerto local |
|---|---|---:|
| `frontend` | Node.js 22 | `3000` |
| `backend` | Flask + Waitress | `8000` |
| `db` | MySQL 8.4 | sólo red interna |
