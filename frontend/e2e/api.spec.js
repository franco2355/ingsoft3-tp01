import { expect, test } from "@playwright/test";

// Integración: le habla a la API de QA y a su MySQL de verdad, sin navegador y sin dobles.

async function iniciarSesion(request) {
  const login = await request.post("/api/login", {
    data: { user: process.env.APP_USER, password: process.env.APP_PASSWORD },
  });
  expect(login.ok()).toBeTruthy();
  return { Authorization: `Bearer ${(await login.json()).token}` };
}

async function buscar(request, headers, texto) {
  const respuesta = await request.get(`/api/expedientes?buscar=${texto}`, { headers });
  return respuesta.json();
}

test("crea, encuentra y borra un expediente", async ({ request }) => {
  const headers = await iniciarSesion(request);
  const numero = `IT-${Date.now()}`;

  const alta = await request.post("/api/expedientes", { headers, data: { numero, anio: 2026, protagonista: "Prueba" } });
  expect(alta.status()).toBe(201);
  expect(await buscar(request, headers, numero)).toHaveLength(1);

  const baja = await request.delete(`/api/expedientes/${(await alta.json()).id}`, { headers });
  expect(baja.status()).toBe(204);
  expect(await buscar(request, headers, numero)).toHaveLength(0);
});

test("rechaza un expediente sin número y no guarda nada", async ({ request }) => {
  const headers = await iniciarSesion(request);
  const protagonista = `IT-${Date.now()}`;

  const alta = await request.post("/api/expedientes", { headers, data: { numero: "", anio: 2026, protagonista } });

  expect(alta.status()).toBe(400);
  expect(await buscar(request, headers, protagonista)).toHaveLength(0);
});

test("la base rechaza el mismo número dos veces en el mismo año", async ({ request }) => {
  const headers = await iniciarSesion(request);
  const datos = { numero: `IT-${Date.now()}`, anio: 2026, protagonista: "Prueba" };

  const primera = await request.post("/api/expedientes", { headers, data: datos });
  const segunda = await request.post("/api/expedientes", { headers, data: datos });
  expect(segunda.status()).toBe(409);

  await request.delete(`/api/expedientes/${(await primera.json()).id}`, { headers });
  expect(await buscar(request, headers, datos.numero)).toHaveLength(0);
});
