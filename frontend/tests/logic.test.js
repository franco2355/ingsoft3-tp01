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
  const expedientes = [{ protagonista: "Ana" }, { protagonista: "Bruno" }, {}];
  const resultado = filtrarExpedientes(expedientes, { protagonista: "ANA" });
  expect(resultado).toEqual([{ protagonista: "Ana" }]);
});

it("rechaza una lista inválida", () => {
  expect(() => filtrarExpedientes(null, {})).toThrow(TypeError); //verificar si es del tipo del typeError y como no es un arreglo te tira error
});

it("avisa cuando la API responde 401", async () => {
  const fetchFalso = vi.fn().mockResolvedValue({ status: 401 });
  const avisar = vi.fn();
  const api = createApiClient({ fetchImpl: fetchFalso, getToken: () => "abc", onUnauthorized: avisar }); // onUnauthorized: indica qué función ejecutar si recibe un error 401
  await api("/api/expedientes");
  const veces = avisar.mock.calls.length;
  if (veces !== 1) {
    throw new Error(`Tenía que avisar 1 vez, pero avisó ${veces}`);
  }
});
