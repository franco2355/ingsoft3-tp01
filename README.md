# Libro de Ingreso de Expedientes

[![CI](https://github.com/franco2355/ingsoft3-tp01/actions/workflows/ci.yml/badge.svg)](https://github.com/franco2355/ingsoft3-tp01/actions/workflows/ci.yml)


Aplicación elegida para los trabajos prácticos de Ingeniería del Software 3. El
sistema permite iniciar sesión y gestionar expedientes desde una interfaz web.

Está compuesto por:

- Frontend: HTML, CSS y JavaScript servido con Node.js 22.
- Backend: API Flask ejecutada con Python 3.12 y Waitress.
- Base de datos: MySQL 8.4.

## Requisitos

- Git.
- Docker con Docker Compose.

Podés comprobar las versiones instaladas con:

```bash
docker --version
docker compose version
```

## Clonar el proyecto

```bash
git clone https://github.com/franco2355/ingsoft3-tp01.git
cd ingsoft3-tp01
```

Todos los comandos siguientes deben ejecutarse desde la raíz
`ingsoft3-tp01`.

## Configurar las variables de entorno

No necesitás instalar MySQL en tu computadora: Docker descarga la imagen y
configura la base automáticamente.

El repositorio incluye `.env.example`, que sirve como plantilla. Copialo antes
de levantar la aplicación:

```bash
cp .env.example .env
```

Abrí el archivo con Visual Studio Code o desde la terminal:

```bash
nano .env
```

Vas a encontrar estas variables:

```env
DB_NAME=expedientes
DB_USER=expedientes
DB_PASSWORD=cambiar
DB_ROOT_PASSWORD=cambiar
APP_USER=cambiar
APP_PASSWORD=cambiar
```

Reemplazá todos los valores `cambiar`. `APP_USER` y `APP_PASSWORD` serán los
datos para iniciar sesión en la página. Para guardar en `nano`, presioná
`Ctrl+O`, `Enter` y `Ctrl+X`.

El archivo `.env` contiene datos locales y está excluido de Git.

## Levantar la aplicación construyendo las imágenes

Esta opción construye el frontend y el backend desde sus Dockerfiles:

```bash
docker compose up -d --build
```

Docker inicia los servicios `frontend`, `backend` y `db`. Comprobá su estado
con:

```bash
docker compose ps
```

## Levantar la aplicación desde el registry

Esta variante descarga las imágenes públicas `v0.1.0` desde GitHub Container
Registry en lugar de construirlas localmente.

Primero descargá las imágenes:

```bash
docker compose -f docker-compose.registry.yml pull
```

Después iniciá los servicios:

```bash
docker compose -f docker-compose.registry.yml up -d
```

Comprobá su estado:

```bash
docker compose -f docker-compose.registry.yml ps
```

Las imágenes publicadas son:

- [Backend v0.1.0](https://github.com/users/franco2355/packages/container/package/ingsoft3-tp01-backend)
- [Frontend v0.1.0](https://github.com/users/franco2355/packages/container/package/ingsoft3-tp01-frontend)

## Acceder a la aplicación

Abrí <http://localhost:3000> e ingresá con `APP_USER` y `APP_PASSWORD` definidos
en `.env`.

La comprobación del backend está disponible directamente en
<http://localhost:8000/healthz>.

## Detener el sistema

Si construiste las imágenes localmente, detené los servicios con:

```bash
docker compose down
```

Este comando elimina los contenedores, pero conserva el volumen de MySQL. Para
eliminar también los datos guardados:

```bash
docker compose down -v
```

Si usaste las imágenes del registry, los comandos son:

```bash
docker compose -f docker-compose.registry.yml down
docker compose -f docker-compose.registry.yml down -v
```

Usá `down -v` solamente cuando realmente quieras borrar la base de datos.

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
