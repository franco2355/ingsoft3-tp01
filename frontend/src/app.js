const $ = (selector) => document.querySelector(selector);
const cuerpoTabla = $("#cuerpoTabla");
const tabla = $("#tablaExpedientes");
const overlay = $("#overlay");
const authToken = sessionStorage.getItem("authToken");
let expedientes = [];
let visibles = [];

if (!authToken) {
  window.location.replace("/login");
}

async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (authToken) headers.set("Authorization", `Bearer ${authToken}`);
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    sessionStorage.clear();
    window.location.replace("/login");
  }
  return response;
}

function escapar(value) {
  const node = document.createElement("span");
  node.textContent = value ?? "";
  return node.innerHTML;
}

function fechaVisible(value) {
  if (!value) return "—";
  const partes = String(value).split("-");
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : value;
}

function filaVacia() {
  return `
    <tr class="fila-vacia">
      <td colspan="10">
        <div class="vacio">
          <div class="vacio-ilustracion" aria-hidden="true">
            <svg viewBox="0 0 156 128">
              <ellipse cx="78" cy="116" rx="52" ry="6" fill="#e9edf5"/>
              <path d="M46 41h27l8 10h31a8 8 0 0 1 8 8v40a8 8 0 0 1-8 8H44a8 8 0 0 1-8-8V49a8 8 0 0 1 10-8Z" fill="#d89231"/>
              <path d="M36 61h84l-8 43a8 8 0 0 1-8 6H43a8 8 0 0 1-8-7L28 70a8 8 0 0 1 8-9Z" fill="#f5a742"/>
              <path d="M49 37h39a5 5 0 0 1 5 5v45H49V37Z" fill="#fff" stroke="#cfd8e3" stroke-width="2"/>
              <path d="M58 52h24M58 63h29M58 74h22" stroke="#cfd8e3" stroke-width="3" stroke-linecap="round"/>
              <circle cx="94" cy="61" r="24" fill="rgba(255,255,255,.55)" stroke="#8d84a7" stroke-width="6"/>
              <path d="m111 78 20 20" stroke="#4b2c7a" stroke-width="9" stroke-linecap="round"/>
            </svg>
          </div>
          <h3>No hay expedientes para mostrar</h3>
          <p>Utilizá la barra de búsqueda o los filtros superiores, o registrá un expediente nuevo.</p>
        </div>
      </td>
    </tr>`;
}

function render(items) {
  visibles = items;
  tabla.classList.toggle("sin-filas", items.length === 0);
  cuerpoTabla.innerHTML = items.length ? items.map((item) => `
    <tr data-id="${item.id}">
      <td class="col-num" data-label="Expte"><span class="celda-contenido"><span class="badge-expte">${escapar(item.numero)}</span></span></td>
      <td class="col-num" data-label="Año"><span class="celda-contenido">${escapar(item.anio)}</span></td>
      <td data-label="Acta"><span class="celda-contenido">${escapar(item.acta || "—")}</span></td>
      <td class="col-num col-fecha" data-label="Fecha del hecho"><span class="celda-contenido">${escapar(fechaVisible(item.fecha))}</span></td>
      <td data-label="Protagonista"><span class="celda-contenido persona-cell">${escapar(item.protagonista)}</span></td>
      <td class="col-num" data-label="DNI Nº"><span class="celda-contenido">${escapar(item.dni || "—")}</span></td>
      <td data-label="Artículos"><span class="celda-contenido">${escapar(item.articulos || "—")}</span></td>
      <td class="col-detalle" data-label="Detalle"><span class="celda-contenido">${escapar(item.detalle || "—")}</span></td>
      <td class="col-mov" data-label="Movimiento"><span class="celda-contenido">${escapar(item.movimiento || "—")}</span></td>
      <td class="acciones-celda" data-label="Acciones">
        <span class="acciones-grupo">
          <button class="btn-icono" data-editar="${item.id}" title="Abrir o editar" aria-label="Abrir o editar expediente">
            <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"/></svg>
          </button>
          <button class="btn-icono eliminar" data-eliminar="${item.id}" title="Eliminar" aria-label="Eliminar expediente">
            <svg viewBox="0 0 24 24"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/></svg>
          </button>
        </span>
      </td>
    </tr>`).join("") : filaVacia();

  const texto = `${items.length} ${items.length === 1 ? "registro" : "registros"}`;
  $("#contador").textContent = texto;
  $("#paginaInfo").textContent = `Mostrando ${texto}`;
}

function aplicarFiltros() {
  const filtros = [...document.querySelectorAll(".column-filter")];
  render(expedientes.filter((item) => filtros.every((filtro) => {
    const buscado = filtro.value.trim().toLowerCase();
    return !buscado || String(item[filtro.dataset.filter] ?? "").toLowerCase().includes(buscado);
  })));
}

async function cargar() {
  const buscar = encodeURIComponent($("#busqueda").value.trim());
  const response = await apiFetch(`/api/expedientes?buscar=${buscar}`);
  if (!response.ok) throw new Error("No se pudo consultar el backend.");
  expedientes = await response.json();
  aplicarFiltros();
}

function abrirModal(item = null) {
  $("#formExpediente").reset();
  $("#id").value = item?.id ?? "";
  $("#numero").value = item?.numero ?? "";
  $("#anio").value = item?.anio ?? new Date().getFullYear();
  $("#acta").value = item?.acta ?? "";
  $("#fecha").value = item?.fecha ?? "";
  $("#protagonista").value = item?.protagonista ?? "";
  $("#dni").value = item?.dni ?? "";
  $("#articulos").value = item?.articulos ?? "";
  $("#detalle").value = item?.detalle ?? "";
  $("#movimiento").value = item?.movimiento ?? "";
  $("#tituloModal").textContent = item ? "Editar expediente" : "Nuevo expediente";
  $("#formError").textContent = "";
  overlay.classList.add("abierto");
  $("#numero").focus();
}

function cerrarModal() {
  overlay.classList.remove("abierto");
}

function mostrarToast(mensaje, error = false) {
  const toast = $("#toast");
  $("#toastTexto").textContent = mensaje;
  toast.classList.toggle("error", error);
  toast.classList.add("ver");
  window.setTimeout(() => toast.classList.remove("ver"), 2400);
}

async function guardar(event) {
  event.preventDefault();
  const id = $("#id").value;
  const payload = {
    numero: $("#numero").value,
    anio: Number($("#anio").value),
    acta: $("#acta").value,
    fecha: $("#fecha").value,
    protagonista: $("#protagonista").value,
    dni: $("#dni").value,
    articulos: $("#articulos").value,
    detalle: $("#detalle").value,
    movimiento: $("#movimiento").value,
  };
  const response = await apiFetch(id ? `/api/expedientes/${id}` : "/api/expedientes", {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    $("#formError").textContent = error.error || Object.values(error.errors || {}).join(" ");
    return;
  }
  cerrarModal();
  await cargar();
  mostrarToast(id ? "Expediente actualizado" : "Expediente guardado");
}

function limpiar() {
  $("#busqueda").value = "";
  document.querySelectorAll(".column-filter").forEach((filtro) => { filtro.value = ""; });
  $("#menuHerramientas").removeAttribute("open");
  cargar().catch((error) => mostrarToast(error.message, true));
}

function exportar() {
  const campos = ["numero", "anio", "acta", "fecha", "protagonista", "dni", "articulos", "detalle", "movimiento"];
  const cabecera = ["Expte", "Año", "Acta", "Fecha del hecho", "Protagonista", "DNI Nº", "Artículos", "Detalle", "Movimiento"];
  const csv = [cabecera, ...visibles.map((item) => campos.map((campo) => item[campo] ?? ""))]
    .map((fila) => fila.map((valor) => `"${String(valor).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  enlace.download = "expedientes.csv";
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}

cuerpoTabla.addEventListener("click", async (event) => {
  const editar = event.target.closest("[data-editar]");
  const eliminar = event.target.closest("[data-eliminar]");
  if (editar) {
    abrirModal(expedientes.find((item) => item.id === Number(editar.dataset.editar)));
  }
  if (eliminar && confirm("¿Eliminar este expediente?")) {
    const response = await apiFetch(`/api/expedientes/${eliminar.dataset.eliminar}`, { method: "DELETE" });
    if (!response.ok) return mostrarToast("No se pudo eliminar.", true);
    await cargar();
    mostrarToast("Expediente eliminado");
  }
});

$("#btnNuevo").addEventListener("click", () => abrirModal());
$("#btnCerrar").addEventListener("click", cerrarModal);
$("#btnCancelar").addEventListener("click", cerrarModal);
$("#formExpediente").addEventListener("submit", guardar);
$("#btnBuscar").addEventListener("click", () => cargar().catch((error) => mostrarToast(error.message, true)));
$("#busqueda").addEventListener("keydown", (event) => {
  if (event.key === "Enter") cargar().catch((error) => mostrarToast(error.message, true));
});
document.querySelectorAll(".column-filter").forEach((filtro) => filtro.addEventListener("input", aplicarFiltros));
document.querySelectorAll(".acta-desplegar").forEach((boton) => boton.addEventListener("click", () => {
  boton.parentElement.querySelector("input").focus();
}));
$("#btnLimpiar").addEventListener("click", limpiar);
$("#btnLimpiarHerramientas").addEventListener("click", limpiar);
$("#btnExportar").addEventListener("click", exportar);
$(".perfil-chip > span:last-child").textContent = sessionStorage.getItem("authUser") || "Usuario";
$(".btn-salir").addEventListener("click", async () => {
  await apiFetch("/api/logout", { method: "POST" });
  sessionStorage.clear();
  window.location.replace("/login");
});
overlay.addEventListener("click", (event) => { if (event.target === overlay) cerrarModal(); });

cargar().catch((error) => mostrarToast(error.message, true));
