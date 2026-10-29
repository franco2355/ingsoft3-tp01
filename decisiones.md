# Decisiones — TP1

## Enlaces del TP7

- Paquetes: los dos del TP6 (abajo). Al cerrar el TP7, PROD corría la etiqueta
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
  `ssh -L 3100:localhost:3100 -L 3001:localhost:3001`
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
- Las imágenes finales se publicaron en GitHub Container Registry con el tag semántico `v0.1.0`. El
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
- GitHub Container Registry creó inicialmente los paquetes como privados. Se cambió la visibilidad
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

### Qué probé

En el backend probé las validaciones del número, el año, el protagonista y el largo de los campos opcionales, porque son las que evitan que se guarden expedientes con datos incorrectos en MySQL

Separé `crear_expediente_validado` para probarlo con un `Mock` que simula el acceso a la base de datos, y así comprobé que un expediente válido se intenta guardar una sola vez y que uno inválido se rechaza antes de llegar a la base

En el frontend separé en `src/logic.js` las funciones de fechas, filtros y peticiones, y usé `vi.fn()` para simular las respuestas de la API, incluyendo el error 401 cuando el usuario no está autorizado

### Herramientas

Como el proyecto usa Python y JavaScript, adapté las herramientas de la consigna a cada parte

En el backend usé `@pytest.mark.parametrize`, `Mock` y `pytest-cov`, mientras que el mínimo de cobertura lo controla `scripts/check_coverage.py` y los archivos que no se cuentan están en la lista `omit` de `pyproject.toml`

En el frontend usé `it.each`, `vi.fn()` y `@vitest/coverage-v8`, y tanto los mínimos como los archivos que entran en la cobertura están configurados en `vitest.config.js`

### Cuánto código prueban los tests

La cobertura muestra qué líneas ejecutaron los tests y cuántos caminos recorrieron, por ejemplo cuando una condición se cumple y cuando no

Configuré el pipeline para que falle si la cobertura baja del 90% de líneas o del 85% de caminos, porque esos mínimos detectan una función agregada sin pruebas sin exigir el 100% en todos los casos

En el backend llegué al 100% de líneas y caminos, mientras que en el frontend llegué al 100% de líneas y a 14 de los 15 caminos, que es el 93,33%

Estos porcentajes corresponden solamente a `domain.py` y `services.py` en el backend y a `src/logic.js` en el frontend, ya que las rutas, la conexión real con MySQL y la interfaz quedan fuera de las pruebas unitarias y las compruebo con la integración y las e2e

### Camino sin cubrir

En `src/logic.js:24` quedó sin cubrir el caso en que `response.status === 401` da falso, es decir cuando la respuesta tiene otro código

Para probarlo podría simular una respuesta con otro código, por ejemplo un error 500, y comprobar que no se ejecute `onUnauthorized`, ya que ese callback corresponde sólo al 401, pero no lo agregué en esta entrega y quedó como prueba pendiente porque la cobertura sigue por encima del mínimo

En cambio, sí probé que el filtro funcione cuando un expediente no tiene el dato buscado, agregando un expediente vacío y comprobando que el filtro lo deje afuera sin producir un error

### Por qué una cobertura alta no garantiza calidad

Al separar `crear_expediente_validado` borré por error un import que también usaba la edición, por lo que editar un expediente daba error 500 aunque los tests pasaban y la cobertura del backend seguía en 100%

Esto pasó porque `routes.py` no estaba incluido en la cobertura y ninguna prueba unitaria recorría esa operación, así que la cobertura solamente indica qué código se ejecutó y no que todo funcione, e incluso un test sin comprobaciones puede aumentarla

### Pull Requests bloqueados

En el [PR #25](https://github.com/franco2355/ingsoft3-tp01/pull/25) agregué `antiguedad()` sin tests, y aunque el código compilaba y los 21 tests pasaban, [`build-backend` quedó en rojo](https://github.com/franco2355/ingsoft3-tp01/actions/runs/37800081554) porque la cobertura bajó al 83,33% de líneas y al 77,78% de caminos

Después agregué un test parametrizado con 0, 1, 5 y 6 años para comprobar los valores límite, y [el pipeline quedó en verde](https://github.com/franco2355/ingsoft3-tp01/actions/runs/37800252791), con el resumen de cobertura y los reportes para descargar, así que pude hacer el merge

En el [PR #26](https://github.com/franco2355/ingsoft3-tp01/pull/26) agregué `plazo_en_dias()` sin tests y lo dejé abierto y [en rojo](https://github.com/franco2355/ingsoft3-tp01/actions/runs/37802356403) hasta la defensa, con 86,05% de líneas y 81,82% de caminos

A diferencia del TP4, el pipeline ahora también rechaza cambios que compilan y pasan los tests existentes pero no cumplen los mínimos de cobertura

### Problemas encontrados y soluciones

- `pytest` no encontraba el paquete `app`, entonces ejecuté los tests con `python -m pytest`
- Al separar la lógica borré un import y la edición daba error 500, así que lo restauré y comprobé la edición desde la aplicación
- El primer script de cobertura mezclaba líneas y caminos, por lo que lo corregí para calcular cada porcentaje por separado
- Vitest tenía avisos de seguridad, entonces lo actualicé a la versión 5.0.2 y comprobé el resultado con `npm audit`

### Uso de inteligencia artificial

Usé OpenAI Codex para adaptar la consigna a Python y JavaScript, separar funciones y preparar los tests y el workflow, y Claude Code para simplificar la configuración

Comprobé el funcionamiento ejecutando las pruebas con Python 3.12 y Node 22, y agregué funciones sin tests para verificar que el pipeline fallara cuando la cobertura bajaba del mínimo

## TP6 — CD y environments

### Artefacto verificado

Los jobs `build-backend` y `build-frontend` ejecutan los tests unitarios y comprueban la cobertura antes de publicar las imágenes en GitHub Container Registry con la etiqueta `sha-<commit>`

En los PR las imágenes se construyen para comprobar que funcionan pero no se publican, ya que la publicación sólo ocurre con un push a `main` y después de que las comprobaciones terminan bien

Así evito publicar imágenes que no pasaron los tests y la cobertura, mientras que la integración y las e2e se ejecutan después sobre QA, antes de permitir el despliegue a producción

### Continuous Delivery

Elegí Continuous Delivery y no Continuous Deployment porque, después de un merge, QA se despliega automáticamente pero producción necesita mi aprobación

El pipeline sigue el orden `build → deploy-qa → integracion → e2e → deploy-production`, y el último job usa el environment `production`, que pide aprobación y sólo acepta despliegues desde `main`

Además QA y producción usan las imágenes del mismo commit, por lo que no se reconstruyen en cada despliegue

### Entornos en el VPS

En lugar de Render usé un VPS propio, que es el fallback local de la consigna, es decir un servidor alquilado en Contabo, porque ya tenía el servidor funcionando con Docker, así que QA y producción corren con Docker Compose y los despliegues los hace un runner self-hosted, que es el programa de GitHub Actions instalado en el VPS que ejecuta los jobs ahí

Los dos entornos usan `compose.deploy.yml`, pero cada uno tiene su propio nombre de proyecto, puerto, variables y base de datos

El frontend de cada entorno escucha solamente en `127.0.0.1`, por lo que no se pueden abrir desde internet y entro con un túnel SSH, que lleva esos puertos del VPS a mi computadora, y aunque la aplicación usa HTTP, el túnel cifra la conexión entre mi computadora y el VPS

Como el VPS está siempre encendido, los servicios no se suspenden por inactividad ni tengo el límite de horas de una plataforma gratuita, y además el servidor descarga las imágenes del registry en lugar de construirlas

La desventaja es que los dos entornos dependen del mismo servidor, entonces si el VPS falla QA y producción se caen al mismo tiempo

Las credenciales `DB_PASSWORD`, `APP_USER` y `APP_PASSWORD` son secrets de cada environment y los valores de producción sólo están en `production`, mientras que la contraseña root de MySQL se genera automáticamente y `GITHUB_TOKEN` publica las imágenes

El frontend recibe `BACKEND_URL` al arrancar y en ambos entornos vale `http://backend:8000`, pero como cada uno tiene su propia red de Docker, cada frontend se comunica con su backend

Para comprobar que las bases estaban separadas inserté `AISLAMIENTO-PROD` únicamente en producción, y la consulta devolvió un resultado en PROD y ninguno en QA

### Seguridad del runner

El runner self-hosted ejecuta los comandos de los workflows y tiene acceso al servidor, y como el repositorio es público configuré la aprobación de contribuciones externas y le di un usuario propio, aunque ese usuario está en el grupo `docker`, que tiene muchos permisos sobre el servidor

Por eso los tests de los PR corren en las máquinas de GitHub y el runner del VPS sólo ejecuta los despliegues, que se disparan con un push a `main`

### Aprobación y rechazo

Antes de aprobar producción reviso que los builds, el smoke test, la integración y las e2e estén en verde y que el SHA sea el del commit que quiero desplegar, y además revisaría con cuidado los cambios en la base de datos, porque una migración incorrecta puede afectar producción aunque los tests pasen

En los merges `a57273d` y `af5b979` quise rechazar el despliegue pero los aprobé por error, por lo que producción recibió cambios que solamente modificaban documentación

Para corregirlo volví a `v7.0.0` con un rollback y después rechacé el siguiente despliegue, porque únicamente corregía `decisiones.md` y no hacía falta llevarlo a producción

También moví el tag `v6.0.0` al commit `471e6b4`, que sí había llegado a producción, aunque mover un tag ya publicado no es una buena práctica porque se pierde trazabilidad, así que en adelante conviene crear una versión nueva

### Smoke test

El script `scripts/smoke-test.sh` consulta `/healthz` hasta 30 veces, esperando 10 segundos entre intentos, y como la petición pasa por el frontend y el backend hace un `SELECT 1` en MySQL, comprueba que las tres partes se comunican

Sin embargo no comprueba el login, la creación ni la edición de expedientes, ni dice qué versión quedó desplegada, por eso ejecuto `docker compose images` en el log del despliegue y las operaciones completas las prueban la integración y las e2e del TP7

### Rollback

Para una aplicación real elegiría blue-green, porque mantiene la versión anterior disponible y permite volver a ella rápido, aunque necesita más recursos y no resuelve una migración de base de datos incompatible

En mi proyecto el rollback es volver a ejecutar desde GitHub Actions el job `deploy-qa` de una corrida anterior, y como no se vuelve a ejecutar `build`, se despliega la misma imagen `sha-<commit>` que ya estaba publicada

Probé volver del commit `1ef3a9f` al `471e6b4` ([corrida](https://github.com/franco2355/ingsoft3-tp01/actions/runs/37789365120)), y QA con sus pruebas tardó 2 minutos y 5 segundos, la aprobación esperó 7 minutos y 11 segundos y el despliegue a producción tardó 33 segundos, así que sin la espera fueron unos 2 minutos y 45 segundos

Este rollback recupera la versión de la aplicación pero no los datos de MySQL, para lo que necesitaría backups, y como GitHub sólo deja volver a ejecutar corridas de los últimos 30 días, para una versión más vieja tendría que hacer un revert

### Problemas encontrados y soluciones

- QA y producción se pisaban entre sí, entonces les asigné proyectos de Compose distintos, `expedientes-qa` y `expedientes-prod`
- El healthcheck de MySQL con `localhost` daba listo antes de tiempo, así que lo cambié por `127.0.0.1`
- El puerto 3000 estaba ocupado, por lo que usé 3100 para QA y 3001 para producción
- Dejé de publicar el puerto del backend porque el frontend reenvía las peticiones a la API por la red interna
- El despliegue podía reconstruir las imágenes, entonces hice que descargue las publicadas por CI
- MySQL tardaba en arrancar, por eso agregué reintentos al smoke test

### Uso de inteligencia artificial

Usé OpenAI Codex para adaptar la consigna al VPS y preparar los archivos de Compose, el workflow y el smoke test, y Claude Code para simplificar algunos archivos

Comprobé las imágenes publicadas, el aislamiento entre QA y producción y el funcionamiento de los dos entornos, mientras que las aprobaciones, el rechazo y la prueba de rollback los hice yo

## TP7 — Contenedores en el pipeline, integración y e2e

### Build once, deploy many

Las imágenes del backend y del frontend se construyen una sola vez en el job `build`, y después QA y producción las descargan con `compose.deploy.yml`, que usa `image:` en lugar de `build:`

Así cada entorno no reconstruye la aplicación ni puede terminar con dependencias diferentes, por lo que producción usa el mismo artefacto que se probó en QA, aunque para asegurar que es exactamente la misma imagen la referencia más precisa es el digest, porque una etiqueta se puede mover

### Etiquetas y versiones

Cada imagen tiene la etiqueta `sha-<commit>`, que la relaciona con el commit desde el que se construyó, y el tag de git `v7.0.0` marca la versión que estaba en producción, así que con `git rev-list -n1 v7.0.0` obtengo ese commit y busco su imagen

No uso `latest` porque esa etiqueta cambia y no permite saber qué versión está corriendo, y después de cada despliegue ejecuto `docker compose images` para dejar registrado qué imágenes usa el entorno

### Pruebas de integración

Las pruebas están en `frontend/e2e/api.spec.js` y le hacen peticiones a la API de QA, con su backend y su MySQL reales, sin abrir un navegador

Comprueban que se pueda crear, buscar y borrar un expediente, que uno sin número devuelva 400 y que repetir el número y el año devuelva 409

Elegí el 409 porque depende de la restricción de unicidad de MySQL, y eso no se puede verificar cuando la base está simulada con un `Mock`

Las ejecuto contra QA ya desplegado porque así pruebo las mismas imágenes y la misma configuración que después van a producción, aunque dependen de que QA esté disponible y comparten su base, por lo que cada prueba borra lo que crea

### Pruebas e2e

Las pruebas están en `frontend/e2e/flujos.spec.js` y usan Playwright con Chromium para recorrer la aplicación como un usuario: crear un expediente, verlo y borrarlo, comprobar que un año incorrecto muestre el error y buscar un expediente por número, porque son las operaciones del uso diario

Los expedientes de prueba llevan la hora en el número para no repetirse entre corridas y se eliminan al terminar

No incluí todos los filtros, la exportación CSV ni la edición porque las e2e son más lentas y necesitan más mantenimiento, y parte de esa lógica ya la comprueban los tests unitarios, aunque la edición completa podría agregarse más adelante

Como el VPS está siempre prendido no hay cold start, y Playwright espera a que aparezcan los elementos con un límite de 30 segundos por prueba, pero no le puse reintentos automáticos porque prefiero ver las pruebas inestables en vez de ocultar sus fallos

### Verde y rojo

Para comprobar que las e2e podían bloquear producción cambié el texto del botón `Guardar` por `Grabar`, sin modificar los tests ([commit](https://github.com/franco2355/ingsoft3-tp01/commit/1415f4c7c83fb6ede30518b91fe836abcbda5a26))

El build, el smoke test y la integración quedaron en verde porque el backend y la base seguían funcionando, pero las dos e2e que usan el botón `Guardar` no lo encontraron y quedaron en rojo, por lo que el pipeline no desplegó esa versión en producción

Las capturas y trazas de Playwright mostraron el problema, y tener la integración verde con las e2e rojas me indicó que la API funcionaba y lo roto era la interfaz

Después volví a poner `Guardar` y el pipeline quedó en verde hasta producción

### Misma imagen en QA y producción

La imagen del frontend no tiene una dirección fija de la API, sino que recibe `BACKEND_URL` al iniciar el contenedor, y aunque en los dos entornos vale `http://backend:8000`, cada uno tiene su propia red y su frontend llega a su propio backend, así que uso la misma imagen sin reconstruirla

### Dos merges seguidos

Tengo un solo QA, por lo que si hago dos merges seguidos la segunda corrida puede actualizar QA mientras la primera todavía ejecuta sus pruebas

Para evitarlo hago los merges de a uno, y si hay dos corridas superpuestas reviso los horarios de despliegue y rechazo la más vieja, aunque este control es manual y como mejora debería configurar `concurrency` en GitHub Actions para que dos corridas no usen QA al mismo tiempo

### Problemas encontrados y soluciones

- Vitest ejecutaba los archivos e2e como unitarios, así que limité su búsqueda a `tests/`
- La imagen de Playwright 1.64.0 todavía no estaba publicada, por eso usé la 1.63.0
- Los contenedores dejaban archivos de root y el siguiente checkout fallaba, entonces ejecuto Playwright con mi usuario mediante `--user`
- `npm audit` encontró una vulnerabilidad en `source-map-js`, que corregí con `npm audit fix`

### Uso de inteligencia artificial

Usé Claude Code para preparar las pruebas de integración y e2e, el script de Playwright y los nuevos jobs del pipeline

Lo comprobé levantando un QA de prueba con las imágenes del registry, después rompí el botón para provocar una e2e roja con la integración en verde, y finalmente lo corregí para dejar el pipeline funcionando

## TP8 — Infraestructura como código

### Herramienta elegida

Elegí Terraform con el provider de Docker para crear un entorno preprod en mi VPS, y no usé Neon ni Render porque QA y producción ya funcionan con Docker en ese servidor y mi aplicación usa MySQL, mientras que Neon es PostgreSQL

Trabajé con Terraform 1.17.0 y fijé el provider `kreuzwerker/docker` en la versión 4.6.0, y además subí `.terraform.lock.hcl`, que guarda la versión y los hashes del provider, mientras que la versión del programa Terraform la limita `required_version` en `main.tf`

### Preprod

Preprod tiene su propia red, volumen, MySQL, backend y frontend, por lo que se puede levantar y eliminar sin tocar los contenedores de QA y producción

Usa las imágenes `sha-7e74c53` del TP7, así que Terraform descarga imágenes ya construidas en lugar de generar otras, y el frontend usa el puerto 3200 y escucha solamente en `127.0.0.1`, igual que los otros entornos

Los contenedores se comunican por sus nombres dentro de la red de Docker, sin direcciones IP fijas, y las contraseñas no están en los archivos del proyecto porque Terraform las recibe desde un archivo de variables que dejé fuera del repositorio

### Estado de Terraform

El estado de Terraform queda guardado en el VPS, dentro de `~/.local/state/`, con permisos 600 para que sólo lo lea mi usuario, y no lo subí al repositorio porque contiene las contraseñas y otros datos sensibles

Es importante porque Terraform lo usa para relacionar lo que está en el código con lo que existe en Docker, así que si lo pierdo los contenedores siguen funcionando pero Terraform deja de saber que son suyos, y tendría que recuperar el estado o importarlos

### Comprobaciones

Primero ejecuté `terraform apply` para crear preprod y después `terraform plan` dio `No changes`, lo que indica que no había diferencias entre la configuración y lo creado

Luego ejecuté `terraform destroy` y volví a ejecutar `terraform apply`, y comprobé que preprod se volvía a crear igual mientras QA y producción seguían funcionando, aunque los datos de MySQL que se borran con el destroy no vuelven, porque para eso tendría que conservar el volumen o restaurar un backup

### Problemas encontrados y soluciones

- El backend intentaba conectarse cuando MySQL todavía no estaba listo, entonces agregué un healthcheck y que el backend espere a la base
- Terraform podía borrar imágenes que también usan los otros entornos, así que puse `keep_locally = true` en los recursos de imagen, que hace que el destroy no borre la imagen del servidor
- Los puertos de QA y producción ya estaban ocupados, por eso le asigné el 3200 a preprod

### Uso de inteligencia artificial

Usé OpenAI Codex para entender cómo usar Terraform con Docker, preparar los archivos y revisar los errores que aparecieron en el VPS, mientras que los comandos `apply`, `plan` y `destroy` los ejecuté yo para comprobar que preprod se creara, se eliminara y volviera a levantarse sin afectar QA ni producción

## TP9 — DevSecOps y observabilidad

### Dependabot

Activé Dependabot, que revisa si las librerías que usa el proyecto tienen versiones nuevas o vulnerabilidades y abre PRs para actualizarlas, para las dependencias de Python, npm y GitHub Actions, junto con las alertas y las actualizaciones de seguridad

Mergeé el PR #32, que actualizaba pytest de la versión 8.4.2 a la 9.0.3 e incluía una corrección de seguridad en el uso de directorios temporales, y me animé porque pytest sólo se usa para correr los tests y no llega a producción, y porque el pipeline del PR quedó en verde con los tests y los mínimos de cobertura

### CodeQL y push protection

Activé CodeQL con la configuración por defecto, que analiza el código buscando errores de seguridad sin ejecutarlo, y el análisis encontró un posible SSRF (Server-Side Request Forgery, cuando un usuario logra que el servidor mande peticiones a una dirección elegida por él) en las peticiones que el frontend reenviaba al backend, así que lo corregí usando `BACKEND_URL` como destino fijo del proxy para que el usuario no pueda elegir a qué servidor se envía la petición

También comprobé que push protection estuviera activo, que bloquea las credenciales que GitHub reconoce antes de que lleguen al repositorio, aunque no detecta todos los tipos de secretos, por eso las contraseñas siguen fuera del código

### Monitor

Como producción no está expuesta públicamente, usé Healthchecks.io, un servicio que espera recibir una señal cada cierto tiempo y avisa por correo si deja de llegar, junto con un cron en el VPS, que es una tarea programada que cada minuto consulta `/healthz` y, si responde, le envía una señal a Healthchecks.io

Si las señales dejan de llegar durante el tiempo permitido, Healthchecks.io manda un correo de caída, y cuando vuelven manda otro de recuperación, así que compruebo la disponibilidad sin abrir ningún puerto público

Para probarlo detuve el frontend de producción a las 13:58:45 y la alerta DOWN llegó a las 14:01:02, es decir 2 minutos y 17 segundos después, y cuando lo volví a levantar la alerta UP llegó a las 14:03:02

Al terminar comenté la línea del cron y pausé el monitor, por lo que quedó probado pero no está avisando mientras siga pausado

### Sentry

Agregué Sentry al backend y al frontend para registrar errores y ver el rendimiento de la aplicación, y como los DSN, que son las direcciones a donde la aplicación manda esos datos, están sólo en el environment `production`, QA no envía datos

Durante el período observado la operación más usada fue el login, con unas 0,3 peticiones por minuto, y la más lenta fue editar un expediente, con 33 ms contra 11 ms del listado

Aunque los dos tiempos son bajos, la edición fue la más lenta, por eso abrí la tarjeta [#45](https://github.com/franco2355/ingsoft3-tp01/issues/45) en mi tablero para revisar qué parte genera esa diferencia, aunque estos datos son de poco tiempo y no alcanzan para asegurar que haya un problema de rendimiento

### Problemas encontrados y soluciones

- El bloqueador de anuncios impedía que el frontend enviara datos a Sentry, entonces generé el error desde una ventana de incógnito
- Las credenciales de producción no coincidían con las de QA, así que corregí los secrets de los environments y volví a desplegar
- Publicar `/healthz` por el puerto 80 podía afectar a otras aplicaciones del VPS, por eso usé un cron local sin abrir puertos nuevos

### Uso de inteligencia artificial

Usé OpenAI Codex para configurar Dependabot, CodeQL y Sentry y revisar las alertas encontradas, y Claude Code para simplificar el monitor y ayudarme con Healthchecks.io y Sentry

Hice yo la prueba de caída de producción, revisé las alertas recibidas y abrí la tarjeta de seguimiento
