"""Comprueba umbrales separados de líneas y ramas desde coverage.json."""

import argparse
import json
import os
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("report", type=Path)
    parser.add_argument("--lines", type=float, required=True)
    parser.add_argument("--branches", type=float, required=True)
    return parser.parse_args()


def main():
    args = parse_args()
    totals = json.loads(args.report.read_text(encoding="utf-8"))["totals"]
    lines = float(totals["percent_covered_display"])
    branches = 100.0
    if totals["num_branches"]:
        branches = totals["covered_branches"] * 100 / totals["num_branches"]

    summary = (
        "## Cobertura del backend\n\n"
        "| Métrica | Resultado | Umbral |\n"
        "|---|---:|---:|\n"
        f"| Líneas | {lines:.2f}% | {args.lines:.2f}% |\n"
        f"| Ramas | {branches:.2f}% | {args.branches:.2f}% |\n"
    )
    print(summary)

    summary_path = os.getenv("GITHUB_STEP_SUMMARY")
    if summary_path:
        with open(summary_path, "a", encoding="utf-8") as output:
            output.write(summary)

    failures = []
    if lines < args.lines:
        failures.append(f"líneas: {lines:.2f}% < {args.lines:.2f}%")
    if branches < args.branches:
        failures.append(f"ramas: {branches:.2f}% < {args.branches:.2f}%")
    if failures:
        raise SystemExit("Umbral de cobertura incumplido: " + ", ".join(failures))


if __name__ == "__main__":
    main()
