# Decisiones — TP1

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
