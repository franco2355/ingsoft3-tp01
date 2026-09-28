#!/usr/bin/env bash

set -euo pipefail

: "${URL_API:?Definir URL_API}"
: "${URL_FRONT:?Definir URL_FRONT}"

attempts="${SMOKE_ATTEMPTS:-30}"
wait_seconds="${SMOKE_WAIT_SECONDS:-10}"

for attempt in $(seq 1 "$attempts"); do
  if curl -fsS --max-time 10 "${URL_API}/healthz" >/dev/null \
    && curl -fsS --max-time 10 "${URL_FRONT}/" >/dev/null; then
    echo "Smoke test correcto: API, base de datos y frontend responden."
    exit 0
  fi

  echo "Intento ${attempt}/${attempts}: el entorno todavía no responde."
  sleep "$wait_seconds"
done

echo "El entorno no respondió después de ${attempts} intentos." >&2
exit 1
