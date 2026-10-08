# Decisiones — TP1

## Enlaces del TP7

- Paquetes: los dos del TP6 (abajo). PROD corre la etiqueta
  `sha-7e74c5393b12667a8fdb95c82dc779f47d5333cf`, la misma que la release
  [`v7.0.0`](https://github.com/franco2355/ingsoft3-tp01/releases/tag/v7.0.0).
- Commit que rompió la app (botón «Guardar» → «Grabar»): <https://github.com/franco2355/ingsoft3-tp01/commit/1415f4c7c83fb6ede30518b91fe836abcbda5a26>
- Corrida con la integración VERDE y la e2e ROJA, sin deploy a PROD: <https://github.com/franco2355/ingsoft3-tp01/actions/runs/37804468902>
  - `playwright-report-integracion` (verde): <https://github.com/franco2355/ingsoft3-tp01/actions/runs/37804468902/artifacts/11562241461>
  - `playwright-report-e2e` (rojo, con capturas y trazas): <https://github.com/franco2355/ingsoft3-tp01/actions/runs/37804468902/artifacts/11563370016>
- Corrida completa en verde hasta PROD, con aprobación: <https://github.com/franco2355/ingsoft3-tp01/actions/runs/37805257316>
- QA y PROD: las mismas URLs del TP6, por túnel SSH al VPS.

## Enlaces de este TP (TP6)

- Paquete backend: <https://github.com/users/franco2355/packages/container/package/ingsoft3-tp01-backend>
- Paquete frontend: <https://github.com/users/franco2355/packages/container/package/ingsoft3-tp01-frontend>
- QA y PROD corren en mi VPS (209.126.4.187) y sólo escuchan en su `127.0.0.1`.
  Se abren con un túnel SSH:
  `ssh -L 3100:localhost:3100 -L 3001:localhost:3001 lopez@209.126.4.187`
  - QA: <http://localhost:3100>
  - PROD: <http://localhost:3001>
- Corrida de PR con «Entrar al registry» salteado: <https://github.com/franco2355/ingsoft3-tp01/actions/runs/37800252791/job/113390216010>
- Corrida de `main` con «Publicar la imagen» como último paso: <https://github.com/franco2355/ingsoft3-tp01/actions/runs/37805257316/job/113407754399>

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

### El Pull Request bloqueado

Los checks `build-backend` y `build-frontend` son obligatorios en `main`. En el
[PR #25](https://github.com/franco2355/ingsoft3-tp01/pull/25) agregué `antiguedad()` en `domain.py` sin tests: compilaba
y los 21 tests pasaban, pero
[`build-backend` quedó rojo](https://github.com/franco2355/ingsoft3-tp01/actions/runs/37800081554) por
«Umbral de cobertura incumplido»: líneas 83,33% (umbral 90%) y ramas 77,78%
(umbral 85%). Las tres ramas de la función no las recorría ningún test. Lo
arreglé con un test parametrizado con 0, 1, 5 y 6 años, que cubre los dos
bordes de cada `if`; [la corrida quedó verde](https://github.com/franco2355/ingsoft3-tp01/actions/runs/37800252791) y
lo mergeé. El [PR #26](https://github.com/franco2355/ingsoft3-tp01/pull/26) agrega `plazo_en_dias()` sin tests y queda
abierto y [en rojo](https://github.com/franco2355/ingsoft3-tp01/actions/runs/37802356403) (líneas 86,05%, ramas
81,82%): es el freno vigente.

Este freno es distinto del del TP4: aquel sólo se ponía rojo si el código no
compilaba; éste se pone rojo con código que compila y pasa todos sus tests.
Lo que sigue dejando pasar es un test que ejecute el código sin verificar
nada: la cobertura sube igual.

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
pasaron 9 métodos backend (25 casos parametrizados) y 4 métodos frontend
(6 casos parametrizados), el mínimo que pide la consigna. Agregar código sin tests hizo
fallar el umbral de los dos lados. Después usé Claude Code para simplificar la
configuración (un solo comando de tests por lado y menos scripts) y repetí esas
verificaciones.

## TP6 — CD y environments


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

### Aprobación y rechazo

Aprobé las llegadas a PROD revisando que build, QA, integración y e2e
estuvieran en verde y que QA respondiera. Rechacé el deploy a PROD del merge
que completa este archivo, con este motivo: «sólo cambia decisiones.md; PROD
ya corre v7.0.0 (7e74c53) verificado y redesplegarlo no aporta nada». La
corrida queda en Actions sin llegar a PROD.

El tag `v6.0.0` apuntaba al principio a un commit que nunca llegó a PROD. Lo
moví a `471e6b4`, la primera llegada a PROD, antes de entregar. Después de
entregar, un tag no se mueve: deja de nombrar una versión fija.

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
desplegar el artefacto ya verificado.

Lo hice una vez de verdad, de `1ef3a9f` a `471e6b4`
([corrida, intento 3](https://github.com/franco2355/ingsoft3-tp01/actions/runs/37789365120)):

| Tramo | Hora | Duración |
|---|---|---|
| «Re-run» de `deploy-qa` | 12:40:59 | — |
| QA + smoke, integración y e2e | 12:41:06 → 12:43:11 | 2 min 5 s |
| Esperando mi aprobación | 12:43:11 → 12:50:22 | 7 min 11 s |
| Deploy de PROD + smoke | 12:50:22 → 12:50:55 | 33 s |
| **Total** | **12:40:59 → 12:50:55** | **9 min 56 s** |

Sin la espera de la aprobación, la máquina tardó 2 min 45 s; casi todo el
tiempo fue la decisión humana.
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
configuración de GitHub, las aprobaciones, el rechazo y el rollback los hice yo.

## TP7 — Contenedores en el pipeline + integración y e2e


### Build once, deploy many

La imagen se construye una sola vez, en el job `build`, y se publica como
`sha-<commit>`. QA y PROD no construyen nada: `compose.deploy.yml` no tiene
`build:`, sólo `image:` con esa etiqueta, así que hacen `pull` del mismo binario
que pasó los tests. Si cada entorno reconstruyera, una dependencia que cambió
entre un build y otro haría que QA y PROD corran cosas distintas con el mismo
código, que es el problema del escenario.

### Etiquetas y release

- `sha-<commit>` identifica la imagen de un commit; es la que se promueve.
- `v7.0.0` es un tag de git sobre el commit que está en PROD (el que muestra
  *Deployments*, no el último de `main`). Del tag a la imagen hay un paso:
  `git rev-list -n1 v7.0.0` da el commit, y la imagen es `…:sha-<ese commit>`.
- El pipeline no publica `latest`: es una etiqueta que se mueve sola, así que no
  dice qué versión corre y un rollback con ella no es reproducible.
- Una etiqueta se puede mover a mano con un `docker push`; lo único inmutable es
  el digest. Por eso sólo publica el pipeline, con el `GITHUB_TOKEN` de la
  corrida, y en el YAML no hay ningún token mío.

### Cómo se comprueba qué imagen corre

Los jobs de deploy ejecutan `docker compose images` después del `up`: el log de
`deploy-qa` y el de `deploy-production` muestran la misma etiqueta
`sha-<commit>`. En el VPS, el mismo comando lo dice en vivo. El smoke no
alcanza: sólo prueba que el entorno responde, no qué versión es ni que la app
funcione.

### Qué prueba cada suite

- **Integración** (`frontend/e2e/api.spec.js`, sin navegador): alta, búsqueda y
  baja; alta sin número → 400 sin guardar nada; y un número repetido en el mismo
  año → 409. Elegí la tercera porque esa regla la aplica la base (clave única),
  no el código Python: un unitario con un doble del repositorio nunca la vería.
- **e2e** (`frontend/e2e/flujos.spec.js`, con Chromium): crear un expediente,
  verlo y borrarlo; un año inválido muestra el error y no se guarda; y buscar
  un expediente por su número, que es lo que hacen todos los días los que
  usan la app y que pasa por la base.
- Cada prueba crea datos con un número que incluye la hora, así no choca con
  otra corrida, y los borra comprobando que ya no están.
- Qué dejé afuera: los bordes de cada campo quedan en los unitarios, que son
  rápidos y baratos; filtros por columna, exportar CSV y editar no tienen e2e
  porque cada e2e es lenta y frágil, y elegí sólo los flujos críticos (pirámide).

### El par verde/rojo

En el [commit que rompió la app](https://github.com/franco2355/ingsoft3-tp01/commit/1415f4c7c83fb6ede30518b91fe836abcbda5a26)
cambié el texto del botón «Guardar» por «Grabar», sin tocar `e2e/`. Ningún
unitario mira ese botón, así que el build pasó. En
[la corrida](https://github.com/franco2355/ingsoft3-tp01/actions/runs/37804468902) el smoke quedó verde, la
integración verde (3 de 3: la API y la base estaban sanas) y la e2e roja: los
dos flujos que guardan no encontraron el botón y vencieron a los 30 s, con
captura y traza en el reporte; la búsqueda, que no lo usa, pasó.
`deploy-production` no arrancó. Ese par dice quién se rompió sin abrir el
código: el front. Si se rompe la API, la integración queda roja y la e2e ni
corre, por su `needs`. Lo arreglé volviendo a «Guardar» y
[la cadena completa quedó verde](https://github.com/franco2355/ingsoft3-tp01/actions/runs/37805257316) hasta PROD.

### Integración amplia

Le hablo a la API de QA ya desplegada, con su MySQL de verdad, en vez de
levantar una base en el job. Gana que prueba la misma imagen, configuración y
base que después va a PROD. Pierde que necesita QA en pie, es más lenta y
comparte la base con otras corridas. `QA_URL` apunta al frontend de QA, que
reenvía `/api/*` sin tocarlo al backend del mismo entorno.

### Timeouts y tests flaky

En el VPS no hay cold start. Playwright espera cada elemento hasta su timeout
(30 s por test), así que no hay `sleep`. Un test flaky pasa y falla con el mismo
código; es peor que no tenerlo porque enseña a ignorar el rojo. Por eso no
configuré reintentos: un fallo se ve como fallo.

### La misma imagen del front en QA y PROD

La imagen del front no sabe dónde está la API: `BACKEND_URL` llega por
variable al arrancar el contenedor. En cada proyecto de Compose vale
`http://backend:8000`, que resuelve al backend de su propia red.

### Límite conocido: dos merges seguidos

QA es uno solo. Si la corrida B despliega QA mientras la integración o la e2e
de la corrida A siguen corriendo, A prueba en parte la imagen de B. Se reconoce
comparando la hora del `deploy-qa` de B con la de las suites de A en *Actions*.
En ese caso rechazo la aprobación de A con ese motivo y vale la de B. La regla
es mergear de a uno mientras la cadena corre.

### Problemas encontrados y soluciones

- Vitest tomaba los archivos de `e2e/` como tests unitarios: limité su
  `include` a `tests/`.
- La imagen oficial de Playwright 1.64.0 todavía no estaba publicada: fijé la
  versión 1.63.0, igual en `package.json` y en `scripts/playwright.sh`.
- En un runner propio, los archivos que crea un contenedor como root traban el
  `checkout` de la corrida siguiente: Playwright corre con mi usuario
  (`--user`).
- `npm audit` marcó una vulnerabilidad en `source-map-js`, que trae Vitest; la
  resolví con `npm audit fix`.

### Uso de inteligencia artificial

Usé Claude Code para escribir las dos suites, el script de Playwright y los
jobs nuevos del workflow. Lo verifiqué levantando un QA de prueba con las
imágenes `sha-…`: las dos suites pasaron 3 de 3, y al romper el botón
«Guardar» la integración siguió verde y la e2e se puso roja con captura y
traza. Puedo explicar qué verifica cada prueba, contra qué entorno corre y qué
pasa si falla.
