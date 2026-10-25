import { init, browserTracingIntegration } from "@sentry/browser";

function quitarConsultas(valor) {
  if (typeof valor === "string" && /^https?:\/\//.test(valor)) return valor.split(/[?#]/)[0];
  if (Array.isArray(valor)) return valor.map(quitarConsultas);
  if (valor && typeof valor === "object") {
    return Object.fromEntries(Object.entries(valor)
      .filter(([clave]) => !["query_string", "url.query", "url.fragment"].includes(clave))
      .map(([clave, dato]) => [clave, quitarConsultas(dato)]));
  }
  return valor;
}

// El DSN del navegador es público y llega al arrancar el contenedor.
function filtrarEvento(event) {
  // Las mediciones conservan duración y ruta, sin datos de expedientes.
  delete event.breadcrumbs;
  delete event.spans;
  if (event.request) {
    delete event.request.headers;
    delete event.request.cookies;
    delete event.request.data;
    if (event.request.url) event.request.url = event.request.url.split("?")[0];
  }
  return quitarConsultas(event);
}

if (window.sentryConfig?.dsn) {
  init({
    ...window.sentryConfig,
    integrations: [browserTracingIntegration()],
    tracesSampleRate: 1.0,
    traceLifecycle: "static",
    sendDefaultPii: false,
    beforeSend: filtrarEvento,
    beforeSendTransaction: filtrarEvento,
  });
}
