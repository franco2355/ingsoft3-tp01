import { expect, it, vi } from "vitest";

import { createApiClient, fechaVisible, filtrarExpedientes } from "../src/logic.js";

it.each([
  ["2026-09-28", "28/09/2026"],
  ["", "—"],
  ["sin-formato", "sin-formato"],
])("fechaVisible convierte %s en %s", (entrada, esperado) => {
  expect(fechaVisible(entrada)).toBe(esperado);
});

it("filtra sin distinguir mayúsculas", () => {
  const items = [{ protagonista: "Ana" }, { protagonista: "Bruno" }, {}];

  expect(filtrarExpedientes(items, { protagonista: "ANA" })).toEqual([items[0]]);
});

it("rechaza una lista inválida", () => {
  expect(() => filtrarExpedientes(null, {})).toThrow(TypeError);
});

it("manda el token y avisa cuando la API responde 401", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ status: 401 });
  const onUnauthorized = vi.fn();

  await createApiClient({ fetchImpl: fetchMock, getToken: () => "abc", onUnauthorized })("/api/expedientes");

  expect(fetchMock.mock.calls[0][1].headers.get("Authorization")).toBe("Bearer abc");
  expect(onUnauthorized).toHaveBeenCalledOnce();
});
