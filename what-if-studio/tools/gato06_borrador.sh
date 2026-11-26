#!/usr/bin/env bash
# Borrador rápido del Caso Nº 04 (Gato con Sombrero): 540x960. Uso: tools/gato06_borrador.sh [desde-hasta]
set -euo pipefail
cd "$(dirname "$0")/.."
FRAMES=${1:-0-1139}
CH=${CHROME:-/opt/pw-browsers/chromium-1243/chrome-linux64/chrome}
BROWSER=(); [ -x "$CH" ] && BROWSER=(--browser-executable="$CH")
npx remotion render src/index.ts Caso04Gato "out/gato06/borrador-${FRAMES}.mp4" "${BROWSER[@]}" \
  --scale=${SCALE:-0.5} --jpeg-quality=${JPEG:-70} --crf=${CRF:-30} --concurrency=4 --timeout=120000 --frames="$FRAMES"
echo "→ out/gato06/borrador-${FRAMES}.mp4"
