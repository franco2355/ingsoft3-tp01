# TP6 — Despliegue local con runner propio

**Estado:** infraestructura local preparada y validable; falta registrar el
runner y configurar los environments de GitHub para generar evidencia remota.

**Alcance:** fallback local de QA y PROD, publicación por SHA, smoke tests y
rollback por redeploy de una imagen anterior.

**Fuente de verdad:** `.github/workflows/ci.yml`, `compose.qa.yml`,
`compose.prod.yml` y `scripts/smoke-test.sh`.

## Diseño

El workflow construye y prueba backend y frontend. Sólo en un `push` a `main`
entra a GHCR y publica ambas imágenes con `${{ github.sha }}`. Los jobs de
despliegue dependen de esos builds: QA se actualiza automáticamente y PROD usa
el environment `production`, donde debe configurarse la aprobación requerida.

Los dos Compose son proyectos distintos, publican puertos diferentes y usan
volúmenes diferentes:

| Entorno | Frontend | Backend | Volumen |
|---|---|---|---|
| QA | `http://localhost:3100` | `http://localhost:8000` | `db_data_qa` |
| PROD | `http://localhost:3001` | `http://localhost:8001` | `db_data_prod` |

La misma imagen de frontend se usa en ambos. `BACKEND_URL` se lee al arrancar
el contenedor y apunta al servicio `backend` de la red de cada proyecto; no se
hornea una URL de entorno dentro de la imagen.

## Configuración remota pendiente

1. Crear los environments `qa` y `production` en GitHub.
2. Definir en cada environment los secrets `DB_NAME`, `DB_USER`, `DB_PASSWORD`,
   `DB_ROOT_PASSWORD`, `APP_USER` y `APP_PASSWORD`. No copiar sus valores a
   este documento ni al repositorio.
3. En `production`, agregar el required reviewer y dejar desactivado
   `Prevent self-review` para la defensa individual.
4. Registrar un runner Linux propio y mantenerlo apagado fuera de las pruebas.
   En un repositorio público se debe exigir aprobación para todo colaborador
   externo antes de ejecutar sus workflows.
5. Después de la primera publicación, confirmar que los dos paquetes GHCR sean
   públicos y que `docker pull` funcione sin iniciar sesión.

## Validación manual de los archivos

La ejecución manual sirve para verificar la configuración, pero no reemplaza la
evidencia exigida: en la entrega, `docker compose up` debe aparecer dentro de
los jobs del runner propio.

Con imágenes ya publicadas bajo el mismo SHA:

```bash
export IMAGE_TAG=<sha-publicado>
docker compose -f compose.qa.yml config --quiet
docker compose -f compose.prod.yml config --quiet
docker compose -f compose.qa.yml up -d
docker compose -f compose.prod.yml up -d

URL_API=http://localhost:8000 URL_FRONT=http://localhost:3100 \
  scripts/smoke-test.sh
URL_API=http://localhost:8001 URL_FRONT=http://localhost:3001 \
  scripts/smoke-test.sh
```

Para detenerlos sin borrar las bases:

```bash
docker compose -f compose.qa.yml down
docker compose -f compose.prod.yml down
```

## Rollback

El workflow admite ejecución manual con `image_tag`. Para volver atrás se elige
el SHA de una imagen que ya pasó CI, se ejecuta el workflow, se espera el smoke
de QA y se aprueba PROD. El tiempo debe medirse en esa corrida real y registrarse
en `decisiones.md`; una medición manual local no cuenta como evidencia del TP.
