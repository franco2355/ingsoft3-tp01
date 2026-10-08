import { expect, test } from "@playwright/test";

// e2e: un navegador real usa la app de QA completa (front + API + MySQL), sin mocks.

async function ingresar(page) {
  await page.goto("/login");
  await page.fill("#usuario", process.env.APP_USER);
  await page.fill("#clave", process.env.APP_PASSWORD);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.locator("#btnNuevo")).toBeVisible();
}

async function buscar(page, texto) {
  await page.fill("#busqueda", texto);
  await page.click("#btnBuscar");
}

test("crear un expediente, verlo y borrarlo", async ({ page }) => {
  const numero = `E2E-${Date.now()}`;
  await ingresar(page);

  await page.click("#btnNuevo");
  await page.fill("#numero", numero);
  await page.fill("#protagonista", "Prueba e2e");
  await page.getByRole("button", { name: "Guardar" }).click();
  const fila = page.locator("tr", { hasText: numero });
  await expect(fila).toBeVisible();

  page.once("dialog", (confirmacion) => confirmacion.accept());
  await fila.getByRole("button", { name: "Eliminar expediente" }).click();
  await expect(fila).toHaveCount(0);
});

test("un año inválido muestra el error y no guarda nada", async ({ page }) => {
  const numero = `E2E-${Date.now()}`;
  await ingresar(page);

  await page.click("#btnNuevo");
  await page.fill("#numero", numero);
  await page.fill("#anio", "3000");
  await page.fill("#protagonista", "Prueba e2e");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.locator("#formError")).toContainText("año");

  await page.click("#btnCancelar");
  await buscar(page, numero);
  await expect(page.getByText("No hay expedientes para mostrar")).toBeVisible();
});

test("buscar un expediente por su número", async ({ page, request }) => {
  const numero = `E2E-${Date.now()}`;
  const login = await request.post("/api/login", {
    data: { user: process.env.APP_USER, password: process.env.APP_PASSWORD },
  });
  const headers = { Authorization: `Bearer ${(await login.json()).token}` };
  const alta = await request.post("/api/expedientes", { headers, data: { numero, anio: 2026, protagonista: "Prueba e2e" } });
  await ingresar(page);

  await buscar(page, numero);
  await expect(page.locator("tr", { hasText: numero })).toHaveCount(1);

  await request.delete(`/api/expedientes/${(await alta.json()).id}`, { headers });
  await buscar(page, numero);
  await expect(page.locator("tr", { hasText: numero })).toHaveCount(0);
});
