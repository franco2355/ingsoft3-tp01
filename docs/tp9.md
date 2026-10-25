# TP9 — Seguridad y observación

Estado: integración preparada; faltan las cuentas de Sentry y del monitor externo,
los datos reales en sus paneles y el cierre `v9.0.0`.
Alcance: la aplicación sigue alojada en el VPS; los servicios externos la observan.
Fuente de verdad: GitHub Security, el workflow `CI`, el código y los paneles de observación.

## Lo que ya está preparado

- Dependabot para Python, npm y GitHub Actions, con frecuencia semanal.
- PR de Dependabot [#32](https://github.com/franco2355/ingsoft3-tp01/pull/32)
  revisado y mergeado con CI verde: pytest 8.4.2 → 9.0.3.
- CodeQL por defecto y push protection activos en GitHub.
- Sentry en Flask y en el navegador. Sin DSN, queda apagado.
- El mismo frontend sirve para QA y PROD: el DSN llega al iniciar el contenedor.
- Errores y tiempos se filtran para quitar cuerpos, búsquedas, tokens y consultas SQL.
- QA y PROD reinician sus contenedores automáticamente después de reiniciar el VPS.

## Conectar Sentry

1. Crear una cuenta gratuita en <https://sentry.io> y dos proyectos: Flask y JavaScript.
2. En GitHub, environment `production`, agregar los secrets `SENTRY_DSN` (Flask)
   y `SENTRY_DSN_FRONTEND` (JavaScript), con los DSN de esos proyectos.
3. Ejecutar el pipeline y aprobar la promoción a PROD. Usar la aplicación para generar tiempos.
4. En la consola del navegador de PROD, ejecutar `throw new Error("Prueba TP9")`.
   Comprobar el error en Issues y las operaciones en el panel de rendimiento.

El DSN del navegador es público; el del backend se lee del entorno. No hacen falta
tokens de administración de Sentry dentro de la aplicación.

## Monitor externo

La salud real es `/healthz`: atraviesa el frontend, la API y MySQL, y acepta GET/HEAD.
Para hacerla alcanzable desde afuera está preparado `ops/monitor-nginx.conf`.
Con permisos sudo, instalarlo en el VPS y validar antes de recargar Nginx:

```bash
cd ~/ingsoft3-preprod
sudo install -m 644 ops/monitor-nginx.conf /etc/nginx/conf.d/expedientes-monitor.conf
sudo nginx -t && sudo systemctl reload nginx
curl -I http://209.126.4.187/healthz
```

Crear en UptimeRobot o Better Stack un monitor HTTP de
`http://209.126.4.187/healthz`. Provocar una caída controlada del frontend de PROD,
esperar DOWN, restaurarlo y esperar UP. Registrar el tiempo y pausar el monitor al terminar.
La configuración publica solamente el health; las otras rutas devuelven 404.

## Cerrar la entrega

- Abrir una tarjeta en el tablero TP3 basada en un dato real de Sentry, con la medición.
- Completar en `decisiones.md` el update elegido, el tiempo de detección, la operación
  más usada y la más lenta, los problemas y el uso de IA.
- Publicar `v9.0.0` cuando todo lo anterior esté comprobado.
