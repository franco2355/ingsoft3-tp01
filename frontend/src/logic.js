export function fechaVisible(value) {
  if (!value) return "—";
  const partes = String(value).split("-");
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : String(value);
}

export function filtrarExpedientes(expedientes, filtros) {
  if (!Array.isArray(expedientes)) throw new TypeError("La lista de expedientes debe ser un arreglo.");
  return expedientes.filter((expediente) => {
    for (const campo in filtros) {
      const buscado = filtros[campo].trim().toLowerCase(); //tolower hace minuscula y trim saca espacio
      const valor = String(expediente[campo] ?? "").toLowerCase();
      if (buscado && !valor.includes(buscado)) return false;
    }
    return true;
  });
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
