import { afterAll, beforeAll, expect, test } from "vitest";
import { spawn } from "node:child_process";
import { createServer, request } from "node:http";
import { once } from "node:events";

let backend;
let frontend;
let port;

beforeAll(async () => {
  backend = createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ path: req.url, host: req.headers.host }));
  }).listen(0, "127.0.0.1");
  await once(backend, "listening");
  frontend = spawn(process.execPath, ["server.mjs"], {
    env: {
      ...process.env,
      PORT: "0",
      BACKEND_URL: `http://127.0.0.1:${backend.address().port}`,
      SENTRY_DSN_FRONTEND: "https://public@example.invalid/1",
      SENTRY_DSN: "no-exponer-el-dsn-del-backend",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const [output] = await once(frontend.stdout, "data");
  port = Number(output.toString().match(/puerto (\d+)/)[1]);
});

afterAll(async () => {
  if (frontend && frontend.exitCode === null) {
    const exited = once(frontend, "exit");
    frontend.kill();
    await exited;
  }
  if (backend) await new Promise((resolve) => backend.close(resolve));
});

test("la configuración pública del navegador no expone el DSN del backend", async () => {
  const response = await fetch(`http://127.0.0.1:${port}/sentry-config.js`);
  const text = await response.text();
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(text).toContain("https://public@example.invalid/1");
  expect(text).not.toContain("no-exponer-el-dsn-del-backend");
});

test("el proxy conserva el host del backend aunque la ruta normalizada empiece con //", async () => {
  const body = await new Promise((resolve, reject) => {
    request({ hostname: "127.0.0.1", port, path: "/api/..//example.invalid/healthz" }, (res) => {
      let text = "";
      res.on("data", (chunk) => { text += chunk; });
      res.on("end", () => resolve(JSON.parse(text)));
    }).on("error", reject).end();
  });
  expect(body.host).toBe(`127.0.0.1:${backend.address().port}`);
  expect(body.path).toBe("//example.invalid/healthz");
});
