import { afterAll, beforeAll, expect, test } from "vitest";
import { spawn } from "node:child_process";
import { createServer, get } from "node:http";
import { once } from "node:events";
import { json } from "node:stream/consumers";

//datos falsos
const PUERTO_BACKEND = 4101;
const PUERTO_FRONTEND = 4102;
let backend;
let frontend;

beforeAll(async () => {
  // Backend falso: contesta a qué host y a qué ruta le llegó la petición.
  backend = createServer((pedido, respuesta) => {
    respuesta.setHeader("Content-Type", "application/json");
    respuesta.end(JSON.stringify({ host: pedido.headers.host, ruta: pedido.url }));
  }).listen(PUERTO_BACKEND, "127.0.0.1");
  await once(backend, "listening");

  frontend = spawn(process.execPath, ["server.mjs"], {
    env: {
      PORT: PUERTO_FRONTEND,
      BACKEND_URL: `http://127.0.0.1:${PUERTO_BACKEND}`,
      SENTRY_DSN_FRONTEND: "https://publico@example.invalid/1",
      SENTRY_DSN: "dsn-privado-del-backend",
    },
  });
  await once(frontend.stdout, "data");
});

afterAll(() => {
  frontend.kill();
  backend.close();
});

test("no expone el DSN privado del backend", async () => {
  const respuesta = await fetch(`http://127.0.0.1:${PUERTO_FRONTEND}/sentry-config.js`);
  const texto = await respuesta.text();
  expect(respuesta.headers.get("cache-control")).toBe("no-store");
  expect(texto).toContain("https://publico@example.invalid/1");
  expect(texto).not.toContain("dsn-privado-del-backend");
});

test("el proxy siempre reenvía a mi backend aunque la ruta sea tramposa", async () => {
  const pedido = get({ host: "127.0.0.1", port: PUERTO_FRONTEND, path: "/api/..//example.invalid/healthz" });
  const [respuesta] = await once(pedido, "response");
  const datos = await json(respuesta);
  expect(datos.host).toBe(`127.0.0.1:${PUERTO_BACKEND}`);
  expect(datos.ruta).toBe("//example.invalid/healthz");
});
