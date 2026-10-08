#!/usr/bin/env bash
# /healthz atraviesa todo: frontend -> backend -> SELECT 1 en MySQL. 30 intentos, cada 10 s.
for intento in $(seq 1 30); do
  curl -fsS --max-time 10 "$1/healthz" && exit 0
  sleep 10
done
exit 1
