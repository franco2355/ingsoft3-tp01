import { describe, expect, it, vi } from "vitest";

import {
  createApiClient,
  crearCsv,
  fechaVisible,
  filtrarExpedientes,
} from "../src/logic.js";


describe("fechaVisible", () => {
  it.each([
    ["2026-09-28", "28/09/2026"],
    ["", "—"],
    [null, "—"],
    ["sin-formato", "sin-formato"],
  ])("convierte %s en %s", (entrada, esperado) => {
    expect(fechaVisible(entrada)).toBe(esperado);
  });
});


describe("filtrarExpedientes", () => {
  const items = [
    { numero: "EXP-1", anio: 2026, protagonista: "Ana Pérez" },
    { numero: "EXP-2", anio: 2025, protagonista: "Bruno Díaz" },
  ];

  it("combina filtros activos sin distinguir mayúsculas", () => {
    expect(filtrarExpedientes(items, { anio: "2026", protagonista: "ANA" }))
      .toEqual([items[0]]);
  });

  it("rechaza una colección inválida", () => {
    expect(() => filtrarExpedientes(null, {})).toThrow(TypeError);
  });

  it("trata un campo ausente como texto vacío", () => {
    expect(filtrarExpedientes([{ numero: "EXP-1" }], { dni: "123" })).toEqual([]);
  });
});


describe("crearCsv", () => {
  it("escapa comillas para producir un CSV válido", () => {
    const csv = crearCsv([{ numero: "EXP-1", protagonista: 'Ana "A"' }]);

    expect(csv).toContain('"Ana ""A"""');
    expect(csv.split("\n")).toHaveLength(2);
  });
});


describe("createApiClient", () => {
  it("inyecta el token usando un cliente HTTP simulado", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ status: 200, ok: true });
    const apiFetch = createApiClient({
      fetchImpl: fetchMock,
      getToken: () => "token-de-prueba",
    });

    await apiFetch("/api/expedientes");

    expect(fetchMock).toHaveBeenCalledOnce();
    const options = fetchMock.mock.calls[0][1];
    expect(options.headers.get("Authorization")).toBe("Bearer token-de-prueba");
  });

  it("notifica una respuesta no autorizada", async () => {
    const onUnauthorized = vi.fn();
    const apiFetch = createApiClient({
      fetchImpl: vi.fn().mockResolvedValue({ status: 401, ok: false }),
      getToken: () => "token-vencido",
      onUnauthorized,
    });

    await apiFetch("/api/expedientes");

    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it("no agrega autorización cuando no hay una sesión", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ status: 200, ok: true });
    const apiFetch = createApiClient({
      fetchImpl: fetchMock,
      getToken: () => "",
    });

    await apiFetch("/healthz");

    const options = fetchMock.mock.calls[0][1];
    expect(options.headers.has("Authorization")).toBe(false);
  });

  it("falla temprano cuando no recibe un cliente HTTP", () => {
    expect(() => createApiClient({})).toThrow("Se necesita una función");
  });
});
