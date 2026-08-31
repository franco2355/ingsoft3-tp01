# Evidencias — TP1

## 1. Push directo a `main` rechazado

![Push directo a main rechazado por GitHub](img/push-rechazado.png)

GitHub rechazó el push porque `main` está protegida y los cambios deben entrar mediante un Pull Request.

## 2. Conflicto detectado en el Pull Request

![Pull Request de la rama B en conflicto](img/pr-conflicto.png)

El PR #4 quedó en conflicto después de mergear la versión A, porque las dos ramas cambiaron la misma línea.

PR: <https://github.com/franco2355/ingsoft3-tp01/pull/4>

## 3. Marcadores del conflicto

![Marcadores del conflicto en README.md](img/marcadores-conflicto.png)

GitHub mostró los marcadores del conflicto entre las versiones A y B. Elegí conservar la versión B.

## 4. Release `v1.0.0` publicada

![Release v1.0.0 publicada en GitHub](img/release-v1.0.0.png)

La primera versión estable quedó publicada con el tag `v1.0.0`.

Release: <https://github.com/franco2355/ingsoft3-tp01/releases/tag/v1.0.0>

## TP2 — Contenedores

### Estado y alcance

Las pruebas se ejecutaron el 30 de agosto de 2026 en un proyecto Compose aislado
llamado `tp2-evidence`. De esa forma, la prueba destructiva del volumen no afectó
la base del entorno habitual.

### 1. Tests de la aplicación

El backend ejecutó sus tests en un contenedor Python limpio:

```text
......
----------------------------------------------------------------------
Ran 6 tests in 0.000s

OK
```

El chequeo sintáctico del frontend también finalizó correctamente:

```text
> expedientes-frontend@0.1.0 check
> node --check src/app.js
```

### 2. Sistema completo funcionando

Después de `docker compose -p tp2-evidence up -d --build`, los tres servicios
quedaron activos y MySQL alcanzó el estado saludable:

```text
NAME                      SERVICE    STATUS
tp2-evidence-backend-1    backend    Up
tp2-evidence-db-1         db         Up (healthy)
tp2-evidence-frontend-1   frontend   Up
```

La solicitud se hizo al puerto del frontend, pasó por su proxy y respondió desde
Flask, comprobando el recorrido end-to-end:

```json
{
  "ok": true,
  "service": "backend"
}
```

### 3. Persistencia del volumen

Se creó el expediente temporal `TP2-EVIDENCIA`, se reinició el proyecto y se
buscó nuevamente. Después se eliminó únicamente el volumen aislado:

```text
Expediente de prueba creado: id=4
Registros antes de reiniciar: 4
Registro encontrado después de down/up: 1
Registro encontrado después de down -v/up: 0
```

El resultado `1` demuestra que `down/up` conservó el registro. El resultado `0`
demuestra que `down -v/up` creó una base nueva.

### 4. Tamaño de imágenes

Comparación obtenida mediante `docker image inspect`:

| Imagen | Tamaño |
|---|---:|
| `python:3.12` (construcción) | 392 MiB |
| `ingsoft3-tp01-backend:v0.1.0` (final) | 76 MiB |
| `node:22-alpine` (construcción) | 56 MiB |
| `ingsoft3-tp01-frontend:v0.1.0` (final) | 56 MiB |

El backend reduce claramente su tamaño al usar `python:3.12-slim` en runtime.
El frontend conserva un tamaño similar porque las etapas de construcción y
runtime usan la misma base Alpine, pero la imagen final no contiene el código
fuente ni los archivos intermedios de compilación.

### 5. Imágenes del registry

Las dos imágenes quedaron construidas localmente con los nombres que consume
`docker-compose.registry.yml`:

```text
ghcr.io/franco2355/ingsoft3-tp01-backend:v0.1.0
ghcr.io/franco2355/ingsoft3-tp01-frontend:v0.1.0
```

El compose alternativo también se validó con esas etiquetas locales:

```text
tp2-registry-local-backend-1    backend    Up
tp2-registry-local-db-1         db         Up (healthy)
tp2-registry-local-frontend-1   frontend   Up
```

La publicación en GHCR y la prueba de descarga desde una máquina limpia quedan
pendientes. No se realizó esa modificación remota por indicación del propietario
del repositorio.

### 6. Arranque desde un clon limpio

Se clonó localmente el commit del TP2 en una carpeta temporal, se ejecutó
`cp .env.example .env` y luego `docker compose up -d --build`. La respuesta fue:

```json
{
  "ok": true,
  "service": "backend"
}
```

Los tres servicios quedaron activos, MySQL saludable y `git status --short` no
mostró archivos generados ni cambios dentro del clon.
