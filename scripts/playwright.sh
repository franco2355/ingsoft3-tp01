#!/usr/bin/env bash
# Corre una suite de Playwright en su imagen oficial, en la red del VPS: QA escucha en su localhost.
docker run --rm --network host --user "$(id -u):$(id -g)" -e HOME=/tmp -e QA_URL -e APP_USER -e APP_PASSWORD \
  -v "$PWD/frontend:/app" -w /app mcr.microsoft.com/playwright:v1.63.0-noble \
  sh -c "npm ci && npx playwright test $1"
