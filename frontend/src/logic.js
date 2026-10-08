export function fechaVisible(value) {
  if (!value) return "—";
  const partes = String(value).split("-");
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : String(value);
}

export function filtrarExpedientes(items, filtros) {
  if (!Array.isArray(items)) throw new TypeError("La lista de expedientes debe ser un arreglo.");
  const activos = Object.entries(filtros).filter(([, valor]) => valor.trim());
  return items.filter((item) => activos.every(([campo, buscado]) => (
    String(item[campo] ?? "").toLowerCase().includes(buscado.trim().toLowerCase())
  )));
}

export function createApiClient({ fetchImpl, getToken, onUnauthorized }) {
  return async function apiFetch(url, options = {}) {
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${getToken()}`);
    const response = await fetchImpl(url, { ...options, headers });
    if (response.status === 401) onUnauthorized();
    return response;
  };
}
