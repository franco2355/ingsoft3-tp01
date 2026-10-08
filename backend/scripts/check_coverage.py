"""Falla si la cobertura de líneas o de ramas queda bajo su umbral."""

import json

MINIMO_LINEAS = 90
MINIMO_RAMAS = 85

with open("coverage.json", encoding="utf-8") as archivo:
    totales = json.load(archivo)["totals"]

lineas = totales["covered_lines"] * 100 / totales["num_statements"]
ramas = totales["covered_branches"] * 100 / totales["num_branches"]
resumen = (
    f"Líneas: {lineas:.2f}% (umbral {MINIMO_LINEAS}%)\n"
    f"Ramas:  {ramas:.2f}% (umbral {MINIMO_RAMAS}%)\n"
)

print(resumen, end="")
with open("coverage/summary.txt", "w", encoding="utf-8") as archivo:
    archivo.write(resumen)

if lineas < MINIMO_LINEAS or ramas < MINIMO_RAMAS:
    raise SystemExit("Umbral de cobertura incumplido.")
