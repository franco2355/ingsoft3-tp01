import { appendFile, readFile } from "node:fs/promises";


const report = JSON.parse(await readFile("coverage/coverage-summary.json", "utf8"));
const { lines, branches, functions, statements } = report.total;
const summary = [
  "## Cobertura del frontend",
  "",
  "| Métrica | Resultado | Umbral |",
  "|---|---:|---:|",
  `| Líneas | ${lines.pct}% | 90% |`,
  `| Ramas | ${branches.pct}% | 85% |`,
  `| Funciones | ${functions.pct}% | 90% |`,
  `| Sentencias | ${statements.pct}% | 90% |`,
  "",
].join("\n");

console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, summary, "utf8");
}
