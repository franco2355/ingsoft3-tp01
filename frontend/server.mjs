import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, request as requestBackend } from "node:http";
import { extname, resolve, sep } from "node:path";

const port = Number(process.env.PORT || 3000);
const backend = new URL(process.env.BACKEND_URL || "http://backend:8000");
const publicDirectory = resolve("public");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

function proxyToBackend(request, response) {
  const target = new URL(request.url, backend);
  const proxy = requestBackend(
    target,
    {
      method: request.method,
      headers: { ...request.headers, host: backend.host },
    },
    (backendResponse) => {
      response.writeHead(backendResponse.statusCode || 502, backendResponse.headers);
      backendResponse.pipe(response);
    },
  );

  proxy.on("error", () => {
    response.writeHead(502, { "Content-Type": "application/json" });
    response.end('{"error":"Backend no disponible"}');
  });

  request.pipe(proxy);
}

async function servePage(request, response) {
  const url = new URL(request.url, "http://localhost");
  const aliases = {
    "/": "/index.html",
    "/login": "/login.html",
  };
  const requestedPath = aliases[url.pathname] || url.pathname;
  let filePath = resolve(publicDirectory, `.${requestedPath}`);

  if (!filePath.startsWith(`${publicDirectory}${sep}`)) {
    response.writeHead(403);
    response.end("Acceso denegado");
    return;
  }

  try {
    const file = await stat(filePath);
    if (!file.isFile()) throw new Error("No es un archivo");
  } catch {
    filePath = resolve(publicDirectory, "index.html");
  }

  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
}

createServer((request, response) => {
  if (request.url.startsWith("/api/") || request.url === "/healthz") {
    proxyToBackend(request, response);
    return;
  }

  servePage(request, response).catch(() => {
    response.writeHead(500);
    response.end("Error interno");
  });
}).listen(port, "0.0.0.0", () => {
  console.log(`Frontend disponible en el puerto ${port}`);
});
