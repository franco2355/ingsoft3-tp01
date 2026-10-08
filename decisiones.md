# Decisiones — TP1

## Enlaces de este TP (TP6)

- Paquete backend: <https://github.com/users/franco2355/packages/container/package/ingsoft3-tp01-backend>
- Paquete frontend: <https://github.com/users/franco2355/packages/container/package/ingsoft3-tp01-frontend>
- QA y PROD corren en mi VPS (209.126.4.187) y sólo escuchan en su `127.0.0.1`.
  Se abren con un túnel SSH:
  `ssh -L 3100:localhost:3100 -L 3001:localhost:3001 lopez@209.126.4.187`
  - QA: <http://localhost:3100>
  - PROD: <http://localhost:3001>
- Corrida de PR con «Entrar al registry» salteado: pendiente hasta publicar esta rama.
- Corrida de `main` con «Publicar la imagen» como último paso: pendiente hasta
  publicar esta rama.

## Resolución del conflicto

Git no pudo resolver el conflicto solo porque las ramas A y B cambiaron la misma línea del `README.md` de formas diferentes. Elegí dejar el título de la versión B y borré los marcadores del conflicto.

No habría ocurrido si cada rama cambiaba una línea distinta o si la rama B se creaba después de mergear la A.

## Problemas encontrados y soluciones

- La protección pedía una aprobación y, como el TP es individual, la cambié a cero.
- El `.gitignore` tenía espacios al inicio y Git no reconocía las reglas, entonces los saqué mediante un PR.
- Cerré el PR #4 por error sin mergearlo, recuperé la rama, reabrí el PR y después lo integré correctamente.

## Uso de inteligencia artificial

Usé OpenAI Codex para entender los comandos, revisar si los pasos estaban bien y solucionar errores. Yo ejecuté los comandos principales, configuré GitHub, creé las ramas y los PR y resolví el conflicto.

## TP2 — Contenedores

### Aplicación elegida

Elegi una pagina que era un borrador de una pagina que podria ayudar a una comisaria sin embargo al no tener finacimiento para servidores se dieron de baja, entonces para darle un uso se presentara en la materia, lo cual lo unico que se pulio fue el frontend y le pedi a codex que me ayude hacer el backend que estaba incompleto

La elegí porque:

- Se puede construir y ejecutar localmente con Docker Compose.
- Tiene tests en el backend y una verificación de sintaxis en el frontend para continuar con el TP5.
- Entiendo el código de Flask, HTML y JavaScript y puedo modificarlo.
- Su tamaño es suficiente para la materia porque tiene login, búsqueda y gestión de expedientes, sin ser demasiado grande.

### Decisiones de contenerización

- El backend usa Python 3.12, instala Flask, PyMySQL y Waitress, mientras que la
  API funciona por el puerto 8000.
- El frontend usa Node.js 22 Alpine, donde una etapa genera los archivos finales
  y la otra los utiliza para ejecutar la aplicación. Además, no usé nginx porque
  Node también se encarga de enviar las solicitudes de `/api` al backend.
- Cada parte del proyecto tiene su propio `.dockerignore`, para evitar copiar
  archivos innecesarios dentro de las imágenes.
- Docker Compose crea una red interna, por lo que los servicios se comunican
  usando nombres como `backend` y `db` en lugar de direcciones IP.
- MySQL guarda los datos en el volumen `db_data`. De esta manera, la información
  no se pierde cuando se reinician los contenedores.
- Las contraseñas y credenciales se manejan mediante variables de entorno,
  mientras que el archivo `.env` no se sube a Git y `.env.example` sirve como
  ejemplo.
- El backend espera a que MySQL esté listo mediante el `healthcheck` antes de
  intentar conectarse.
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
- El login no tomaba las nuevas credenciales porque los contenedores tenían la
  configuración anterior, entonces actualicé el `.env` y los recreé.
- El frontend original tenía funciones que no necesitaba para el TP, entonces
  mantuve el diseño principal y simplifiqué la lógica usando una API Flask.
- GHCR creó inicialmente los paquetes como privados. Se cambió la visibilidad
  de ambos a pública desde la configuración de GitHub y luego se repitió la
  descarga sin autenticación.
- Codex me ayudo a entender algunos comandos como por ejemplo:

  ```yml
  healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
  ```

  que no sabia para que lo usaba y a entender el formato de lo `.yml`.

### Uso de inteligencia artificial

Usé OpenAI Codex como ayuda para entender Docker, preparar y revisar los
Dockerfiles, Compose, la aplicación y la documentación del TP2, además lo
utilicé para hacer algunas validaciones y preparar la publicación, mientras que
yo comprobé que todo funcionara con los tests.

## TP3 — Planificación y trazabilidad

### Duración del sprint

Elegí una duración de una semana porque coincide con el ritmo de los trabajos
prácticos de la materia y permite revisar el avance cada semana

### Límite de trabajo en progreso

Elegi el limite de trabajo acorde a mi ritmo o tiempo para darle mas dedicacion a cada punto 

### Diagnóstico de la historia mal escrita

Al principio creamos la historia “Inicio de sesión de usuarios”, donde el usuario debía poder ingresar con su usuario y contraseña para acceder al sistema, pero después vimos que esa historia no correspondía con lo que pedía la consigna, ya que tenía que estar relacionada con CI y las pruebas automáticas, por lo que fue necesario modificarla para adaptarla al objetivo del TP

### Problemas encontrados y soluciones

-Al principio creé una historia y dos tareas relacionadas con el inicio de sesión, pero después vimos que la consigna pedía que estuvieran relacionadas con CI, por lo que hubo que corregirlas para que cumplieran con lo solicitado
-Al crear el Sprint primero entré por error a la parte de etiquetas, después lo configuré correctamente dentro del Project como un campo de tipo Iteration con una duración de una semana
-El límite WIP de 2 lo configuré primero en la columna Todo, por lo que aparecía 3/2 en rojo, entonces eliminé ese límite y lo configuré correctamente en In Progress
-También tuve dificultad para encontrar la automatización Item closed, ya que primero estaba buscando desde el repositorio, después entré al Project y desde Workflows comprobé que al cerrar un Issue su estado cambiara automáticamente a Done

### Uso de inteligencia artificial

Usé Codex para revisar la consigna y la documentación, principalmente se uso chatgpt de la web para guiarme y decidir donde tengo que ir, le adjunte fotos maso menos porque a veces me pierdo y me ayudo bastante 

## TP4 — Integración continua

### Estructura del pipeline

Usé dos jobs, uno para el backend y otro para el frontend ya que los dos se ejecutan en paralelo porque uno no necesita esperar al otro

### Caché de capas

El pipeline guarda las capas de Docker en el caché de GitHub Actions, el backend y el frontend tienen un `scope` diferente para no mezclar sus
capas. Si no cambian las dependencias se reutilizan las capas de `pip install` y `npm ci` y si cambia el código se vuelven a construir las capas
que dependen de ese código. Si el caché desaparece, el pipeline sigue funcionando, pero tarda más porque construye todo nuevamente.

### Uso de los Dockerfiles

El pipeline construye las imágenes usando los mismos Dockerfiles del TP2, de esta manera el proceso de GitHub es el mismo que se usa localmente
y se evita tener dos formas diferentes de construir la aplicación.

### Problemas encontrados y soluciones

- El archivo `ci.yml` tenía espacios incorrectos al comienzo, entonces corregí la sangría
- El enlace del badge quedó dividido en dos líneas, entonces lo corregí para que al hacer clic abra el historial del workflow.
- Agregué una dependencia inexistente para comprobar el gate. El backend quedó rojo y el merge fue bloqueado. Después eliminé esa dependencia y
los dos jobs terminaron en verde.

### Uso de inteligencia artificial

Usé Codex para entender el workflow, el caché de capas y los checks obligatorios, además quise que revise el archivo YAML y que verifique si hice bien o no las cosas. Yo ejecuté los comandos, configuré GitHub y comprobé el funcionamiento con los builds y la secuencia rojo a verde.

## TP5 — Testing y calidad

Estado: implementación de TP5 preparada; evidencias de los PRs rojo/verde pendientes.
Alcance: tests unitarios, umbrales, reportes de cobertura y builds en CI.
Fuente de verdad: `backend/pyproject.toml`, `backend/scripts/check_coverage.py`,
`frontend/vitest.config.js`, las suites y `.github/workflows/ci.yml` de esta rama.


### Lógica elegida

En el backend probé la validación de número, año, protagonista y longitudes de
los campos opcionales. Son reglas que protegen los datos antes de escribirlos
en MySQL; un cambio incorrecto en un borde permitiría guardar expedientes
inválidos. También separé el caso de uso `crear_expediente_validado` para
inyectarle la persistencia. El test con `unittest.mock.Mock` comprueba que un
expediente válido se guarda una sola vez y que uno inválido nunca llega a la
base.

En el frontend extraje a `src/logic.js` el formato de fechas, el filtrado y el
cliente HTTP. Los tests usan `it.each`, incluyen entradas
inválidas y reemplazan `fetch` con `vi.fn()`. Así se comprueba el encabezado de
autorización y la reacción ante un `401` sin salir a la red.

### Mi stack frente al de la cátedra

| Lo que pide la consigna | Backend (Python) | Frontend (JavaScript) |
|---|---|---|
| Test parametrizado | `@pytest.mark.parametrize` | `it.each` |
| Doble de prueba | `unittest.mock.Mock` | `vi.fn()` |
| Medidor de cobertura | `pytest-cov` (coverage.py, con ramas) | `@vitest/coverage-v8` |
| Umbral que frena el build | `scripts/check_coverage.py` | `thresholds` en `vitest.config.js` |
| Qué entra en la cuenta | `omit` en `pyproject.toml` | `include` en `vitest.config.js` |

### Cobertura y umbrales

- Backend: umbral de 90% de líneas y 85% de ramas. Medición local actual: 100%
  de líneas y 100% de ramas.
- Frontend: el mismo umbral, 90% de líneas y 85% de ramas. Medición local
  actual: 100% de líneas y 90,9% de ramas.

Elegí umbrales algo menores que la medición actual para permitir refactors
pequeños, pero suficientemente altos para que agregar lógica sin tests rompa el
build. Para subirlos debería cubrir primero las ramas opcionales que no pueden
ocurrir desde la interfaz normal y después sostener ese nivel en cada cambio.

El backend deja fuera del cálculo el arranque, la configuración, la conexión y
el repositorio SQL, y las rutas Flask. Son cableado o infraestructura; la cuenta
se concentra en `domain.py` y `services.py`, donde están las reglas y casos de
uso. El frontend incluye `src/logic.js`; deja fuera `app.js`, `login.js`, el
servidor y el script de build porque contienen integración con DOM, HTTP o
empaquetado y corresponden a pruebas de integración o end-to-end.

### Camino sin cubrir observado

El reporte de ramas señaló el `if (response.status === 401)` de
`src/logic.js:20`: ningún test recorre el camino en el que la API responde
otra cosa, por ejemplo un `200`. La entrada concreta que lo recorrería es un
`fetchImpl` simulado que devuelva `{ status: 200 }`, comprobando que
`onUnauthorized` no se llama. Decidí no agregarla: es el camino normal, lo
ejercita cada pantalla de la app, y con la cobertura actual (90,9% de ramas)
el umbral se cumple. Sí dejé el caso de un expediente sin el campo filtrado,
porque puede aparecer al leer datos históricos incompletos.

### Por qué coverage alto no garantiza calidad

Me pasó en este TP: al extraer `crear_expediente_validado` borré un import que
usaba la edición de expedientes (`PUT`), y la app respondía 500 al editar. La
cobertura seguía en 100% porque `routes.py` está fuera de la cuenta y ningún
test lo ejecuta. El número mide lo que ejecutan los tests sobre lo que decidí
contar, no si la aplicación funciona. Lo mismo pasaría con un test que llame a
`validar_expediente` sin ningún `assert`: sube la cobertura sin verificar nada.

### Gate y evidencias remotas pendientes

El workflow escribe en el resumen del run las líneas y ramas de cada lado y
publica el reporte HTML de backend y frontend como artefacto descargable. Los umbrales terminan cada job con error antes del build si bajan.
La secuencia de dos Pull Requests exigida por la consigna —uno rojo que después
se corrige y otro abierto en rojo— y sus enlaces sólo pueden producirse cuando
se creen esos PRs de demostración. Los checks `build-backend` y
`build-frontend` ya son obligatorios en GitHub.

### Problemas encontrados y soluciones

- Ejecutar `pytest` directamente no encontraba el paquete `app`. Lo cambié por
  `python -m pytest`, que agrega el directorio de trabajo al path de módulos.
- Al extraer `crear_expediente_validado` borré el import de
  `validar_expediente` que todavía usaba la edición (`PUT`), que pasó a
  responder 500. Ningún test lo detectó porque `routes.py` está fuera de la
  cuenta y no tiene tests: la cobertura seguía en 100%. Repuse el import y
  comprobé la edición contra la app levantada.
- El primer script de umbral leía el porcentaje total de coverage.py como si
  fuera el de líneas, pero con ramas activadas ese total mezcla las dos
  métricas. Ahora calcula líneas y ramas por separado.
- La versión anterior de Vitest tenía avisos de seguridad. Actualicé Vitest y su
  proveedor de cobertura a 5.0.2; `npm audit` quedó sin vulnerabilidades.

### Uso de inteligencia artificial

Usé OpenAI Codex para adaptar la consigna a Python y JavaScript, separar la
lógica testeable, escribir y revisar las suites y preparar el workflow. Verifiqué
el resultado corriendo las suites en contenedores de Python 3.12 y Node 22:
pasaron 8 métodos backend (21 casos parametrizados) y 4 métodos frontend
(6 casos parametrizados), el mínimo que pide la consigna. Agregar código sin tests hizo
fallar el umbral de los dos lados. Después usé Claude Code para simplificar la
configuración (un solo comando de tests por lado y menos scripts) y repetí esas
verificaciones.

## TP6 — CD y environments

Estado: código de TP6 preparado; validación remota de QA/PROD y evidencias pendientes.
Alcance: publicación en GHCR y despliegues con smoke a QA y production.
Fuente de verdad: `.github/workflows/ci.yml`, `compose.deploy.yml` y
`scripts/smoke-test.sh` de esta rama. Las comprobaciones locales descritas abajo
provienen de la documentación existente; no acreditan un despliegue actual en el VPS.


### Artefacto verificado

El job `build` es una matriz que corre una vez para el backend y otra para el
frontend (`build-backend` y `build-frontend`, los checks obligatorios). Cada una
ejecuta sus tests y umbrales antes de entrar a GHCR. El login y el `push` sólo
se ejecutan en un evento `push`, y el workflow sólo escucha pushes a `main`; un Pull
Request verde construye la imagen pero deja esos pasos salteados. La publicación
es el último paso propio del job y etiqueta la imagen con `sha-<commit>`. Si se
publicara aun con verificaciones rojas, el registry dejaría de significar
«artefactos que pasaron el quality gate» y sería sólo un depósito de builds.

### Continuous Delivery y cadena de promoción

Implementé Continuous Delivery: QA se despliega automáticamente después de un
merge verde, mientras que producción exige una decisión humana. No es
Continuous Deployment porque no todo cambio aprobado por las máquinas llega a
PROD sin intervención.

`deploy-qa` declara `needs: build`, que espera las dos corridas de la matriz;
por eso sólo recibe una imagen cuando backend y frontend terminaron bien. `deploy-production` necesita
a QA y usa el environment `production`, donde debe vivir el required reviewer.
Los dos deploys usan la etiqueta `sha-<commit>` de esa corrida, por lo que promueven exactamente
el commit verificado y no vuelven a construir la aplicación.

Los secrets `DB_PASSWORD`, `APP_USER` y `APP_PASSWORD` se leen desde cada
environment; la contraseña de root de MySQL la genera el contenedor al azar
porque la app no la usa.
Los valores de PROD deben vivir sólo en `production`; así un job de PR o QA no
puede leerlos. `GITHUB_TOKEN` se usa únicamente para publicar paquetes desde
los jobs autorizados y nunca se guarda en archivos.

### Configuración por entorno

La imagen del frontend contiene el servidor y los archivos estáticos, pero no
la dirección de una API. `BACKEND_URL` se lee cuando arranca el contenedor. En
QA y PROD vale `http://backend:8000`, pero cada proyecto Compose tiene su propia
red y resuelve a su backend correspondiente. Las credenciales y el tag de imagen
también llegan por variables; no quedan dentro de las imágenes. QA y PROD usan el
mismo `compose.deploy.yml`: el job le pasa otro nombre de proyecto (`-p`) y otro
`PUERTO`. El nombre de la base y su usuario quedan fijos porque no son secretos: el
aislamiento lo dan el proyecto y el volumen distintos.
La separación de datos se verificó insertando `AISLAMIENTO-PROD` sólo en MySQL
de PROD: la consulta devolvió 1 en PROD y 0 en QA.

### Aprobación, VPS y letra chica

Antes de aprobar PROD revisaría que ambos jobs de calidad estén verdes, que el
smoke de QA responda, que el SHA sea el del merge esperado y que el cambio no
incluya una migración destructiva. También comprobaría manualmente el flujo
afectado en QA; el botón de aprobación no reemplaza esa revisión.

Usé mi VPS como nube: el runner self-hosted está instalado ahí y despliega QA
y PROD con Docker Compose. Lo elegí para no depender de una tarjeta, de un free
tier ni de tener mi notebook prendida. Los puertos de QA y PROD escuchan sólo en
`127.0.0.1` del VPS: sin esa aclaración, Docker los publica en todas las
interfaces y salta el firewall. Para verlos abro un túnel SSH; el smoke no lo
necesita porque corre en el mismo VPS. El costo es que las URLs no son
públicas, que QA y PROD comparten servidor (si se cae, se caen los dos) y que
se sirve por HTTP, sin HTTPS.

El runner del VPS ejecuta lo que diga el workflow y el repositorio es público,
así que la mitigación es exigir «Require approval for all external contributors»
en la configuración de Actions y correr el runner con un usuario propio. Ese
usuario queda en el grupo `docker`, que equivale a ser root en el servidor: por
eso no acepto Pull Requests de desconocidos.

Letra chica: no hay cold start ni sleep, porque el VPS está siempre encendido y
los contenedores no se apagan por inactividad. Los jobs de deploy corren en mi
runner y no consumen minutos de GitHub; los de build corren en runners de
GitHub, que son gratis en repositorios públicos. Tampoco aplica la pérdida de
garantía de Render al reconstruir desde Git: el VPS descarga de GHCR el SHA
exacto que pasó CI.

### Smoke test

El script pide `/healthz` al frontend, hasta 30 veces cada 10 segundos. El frontend reenvía `/healthz` al backend que indica `BACKEND_URL` y
el backend ejecuta `SELECT 1`, así que una respuesta comprueba frontend, su
conexión con la API y la base. No demuestra que todas las operaciones funcionen, que el
contenido sea correcto ni que un usuario pueda completar el flujo de login y
CRUD; esas comprobaciones necesitan pruebas end-to-end. Tampoco identifica por
sí solo la versión: esa trazabilidad viene de la etiqueta `sha-<commit>` y del deployment.

### Patrón y rollback

En una producción real elegiría blue-green. Esta aplicación es pequeña y el
cambio de tráfico permitiría volver rápido a la versión anterior sin mezclar
instancias de dos versiones. Cuesta mantener dos stacks simultáneos y no
resuelve una migración de datos incompatible; antes de usarlo faltarían métricas
de errores, latencia y salud por versión.

El rollback actual consiste en abrir en Actions la corrida de `main` del último
deployment sano y usar «Re-run» sobre el job `deploy-qa`: GitHub vuelve a correr
ese job y el de PROD con el SHA de esa corrida, así que se espera el smoke de QA,
se aprueba production y se confirma su smoke. GitHub sólo deja re-ejecutar
corridas de los últimos 30 días; para volver más atrás habría que mergear un
revert. La imagen no se recompila: se vuelve a
desplegar el artefacto ya verificado. El tiempo todavía no está consignado porque
la consigna pide medir una corrida real del pipeline y esta implementación no se
publicó; inventar un número o medir un `compose up` manual no sería evidencia.
El rollback de código tampoco revierte datos: para eso harían falta migraciones
compatibles hacia atrás y un procedimiento probado de restauración de backup.

### Problemas encontrados y soluciones

- Para evitar que PROD reemplazara a QA, cada deploy usa otro proyecto de
  Compose (`expedientes-qa` / `expedientes-prod`, en `COMPOSE_PROJECT_NAME`). Compose antepone ese
  nombre a la red y al volumen, así que cada entorno tiene su propia base.
- El healthcheck original hacía `mysqladmin ping` contra `localhost`, que usa el
  socket y queda verde mientras MySQL todavía se está inicializando. Lo cambié a
  `-h 127.0.0.1`, que va por TCP como la app, y repetí el arranque con volúmenes
  vacíos.
- Dejé de publicar el puerto del backend: el smoke llega a la API por el
  proxy del frontend, y así QA y PROD no chocan con el backend de desarrollo.
- Otro proceso local ya usaba el puerto 3000. No lo detuve: asigné el 3100 al
  frontend de QA y mantuve 3001 para PROD.
- Evité reconstruir durante el deploy: los jobs descargan las imágenes con el
  SHA producido por CI y Compose levanta ese tag.
- La imagen del frontend ya leía `BACKEND_URL` al arrancar; mantuve esa
  configuración y comprobé que no se hornee una dirección de QA o PROD.
- Añadí reintentos al smoke porque MySQL y la aplicación pueden tardar en quedar
  listos aun cuando el comando de despliegue ya terminó.

### Uso de inteligencia artificial

Usé OpenAI Codex para adaptar el fallback de la consigna a los puertos y stack
de esta aplicación, escribir los Compose, el smoke test, el workflow y revisar
la separación de secrets. Verifiqué localmente la sintaxis, el aislamiento de
los proyectos, la construcción de las imágenes y el funcionamiento de ambos
entornos. Después usé Claude Code para simplificar los Compose, el smoke test y
el workflow, y repetí el despliegue de prueba de QA y PROD con su smoke. La
aprobación, el rechazo y la evidencia de Actions siguen pendientes porque
requieren operar GitHub.
