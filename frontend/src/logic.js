export function fechaVisible(value) {
  if (!value) return "—";
  const partes = String(value).split("-");
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : String(value);
}

export function filtrarExpedientes(items, filtros) {
  if (!Array.isArray(items)) {
    throw new TypeError("La lista de expedientes debe ser un arreglo.");
  }

  const activos = Object.entries(filtros)
    .map(([campo, valor]) => [campo, String(valor ?? "").trim().toLowerCase()])
    .filter(([, valor]) => valor);

  return items.filter((item) => activos.every(([campo, buscado]) => (
    String(item[campo] ?? "").toLowerCase().includes(buscado)
  )));
}

export function crearCsv(items) {
  const campos = [
    "numero",
    "anio",
    "acta",
    "fecha",
    "protagonista",
    "dni",
    "articulos",
    "detalle",
    "movimiento",
  ];
  const cabecera = [
    "Expte",
    "Año",
    "Acta",
    "Fecha del hecho",
    "Protagonista",
    "DNI Nº",
    "Artículos",
    "Detalle",
    "Movimiento",
  ];

  return [cabecera, ...items.map((item) => campos.map((campo) => item[campo] ?? ""))]
    .map((fila) => fila.map((valor) => `"${String(valor).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

export function createApiClient({ fetchImpl, getToken, onUnauthorized }) {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("Se necesita una función para realizar solicitudes.");
  }

  return async function apiFetch(url, options = {}) {
    const headers = new Headers(options.headers || {});
    const token = getToken?.();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const response = await fetchImpl(url, { ...options, headers });
    if (response.status === 401) onUnauthorized?.();
    return response;
  };
}
