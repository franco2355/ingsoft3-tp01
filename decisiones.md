# Decisiones — TP1

## Resolución del conflicto

Git no pudo resolver el conflicto solo porque las ramas A y B cambiaron la misma línea del `README.md` de formas diferentes. Elegí dejar el título de la versión B y borré los marcadores del conflicto.

No habría ocurrido si cada rama cambiaba una línea distinta o si la rama B se creaba después de mergear la A.

## Problemas encontrados y soluciones

- La protección pedía una aprobación y, como el TP es individual, la cambié a cero.
- El `.gitignore` tenía espacios al inicio y Git no reconocía las reglas, entonces los saqué mediante un PR.
- Cerré el PR #4 por error sin mergearlo, recuperé la rama, reabrí el PR y después lo integré correctamente.

## Uso de inteligencia artificial

Usé OpenAI Codex para entender los comandos, revisar si los pasos estaban bien y solucionar errores. Yo ejecuté los comandos principales, configuré GitHub, creé las ramas y los PR, resolví el conflicto y saqué las primeras tres capturas. Codex publicó la release y preparó los archivos finales.

Verifiqué la ayuda comprobando que GitHub rechazara el push directo, que el conflicto apareciera y se resolviera, y que el tag y la release quedaran publicados.

## TP2 — Contenedores

### Aplicación elegida

Elegí un Libro de Ingreso de Expedientes. Conservé el formato visual del inicio
de la aplicación tomada como referencia y construí una lógica propia y acotada.
La solución tiene las tres capas requeridas: un frontend web, una API backend y
una base de datos. Permite iniciar sesión, listar, buscar, crear, modificar y
eliminar expedientes.

La elegí porque se puede ejecutar y demostrar sin servicios pagos, tiene datos
persistentes y ofrece suficiente funcionalidad para continuarla en los TP4–TP9.
Al mismo tiempo, el dominio es pequeño y entendible para poder defender cada
parte de la implementación.

### Decisiones de contenerización

- El backend usa Python 3.12. La etapa `build` instala Flask, PyMySQL y Waitress;
  la etapa `runtime` parte de `python:3.12-slim` y recibe las dependencias y el
  código de la aplicación. Waitress expone la API en el puerto 8000.
- El frontend usa Node.js 22 Alpine en las dos etapas. La primera genera
  `dist`; la segunda copia solamente esos archivos y un servidor HTTP mínimo.
  No usé nginx porque este frontend necesita además redirigir `/api` al servicio
  `backend`, y el servidor Node incluido resuelve ambas tareas sin dependencias
  de npm ni un cuarto componente.
- Cada contexto de construcción tiene su propio `.dockerignore`. Se excluyen
  dependencias, resultados de compilación, cachés, pruebas y logs que no deben
  entrar en las imágenes de producción.
- Compose crea una red interna. El frontend se comunica con
  `http://backend:8000` y el backend con `db:3306`, usando nombres de servicio y
  no direcciones IP.
- MySQL es el único servicio con datos persistentes. El volumen nombrado
  `db_data` se monta en `/var/lib/mysql`, que es la ruta de datos dentro del
  contenedor oficial.
- Las credenciales y contraseñas llegan mediante variables de entorno. `.env`
  está ignorado por Git y `.env.example` sólo contiene valores para reemplazar.
- El backend espera el `healthcheck` de MySQL mediante `depends_on`, evitando
  intentar crear el esquema antes de que la base acepte conexiones.
- Las imágenes finales se publicaron en GHCR con el tag semántico `v0.1.0`. El
  archivo `docker-compose.registry.yml` usa esas imágenes y no contiene bloques
  `build`. Las dos son públicas y la variante se probó descargándolas sin una
  sesión iniciada en el registry.

### Problemas encontrados y soluciones

- El volumen `db_data` se utilizó antes de declararlo al final del archivo y
  Compose rechazó la configuración. Se agregó la declaración global
  `volumes: db_data:`.
- Al ejecutar `npm install` desde `backend`, npm no encontró `package.json`.
  Se volvió a la raíz y se ejecutó dentro de `frontend`.
- El login no aceptaba las credenciales esperadas porque los contenedores
  conservaban una configuración anterior. Se recrearon después de actualizar
  `.env`.
- El frontend original incluía integraciones ajenas al alcance del TP. Se dejó
  su presentación principal y se reemplazó la lógica por una API Flask pequeña
  e independiente.
- GHCR creó inicialmente los paquetes como privados. Se cambió la visibilidad
  de ambos a pública desde la configuración de GitHub y luego se repitió la
  descarga sin autenticación.

### Uso de inteligencia artificial

Usé OpenAI Codex como asistencia para explicar Docker paso a paso, preparar y
revisar Dockerfiles, Compose, la aplicación simplificada y la documentación del
TP2. También se utilizó para ejecutar las validaciones técnicas y preparar la
publicación. Verifiqué la solución mediante los tests, el `healthcheck`, el
flujo HTTP end-to-end, la persistencia de MySQL y un arranque descargando las
imágenes públicas mediante el compose de registry.
