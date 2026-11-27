#!/usr/bin/env bash
# Borrador rápido del video largo de Satoshi (16:9, 5 min): 960x540. Uso: tools/satoshi07_borrador.sh [desde-hasta]
set -euo pipefail
cd "$(dirname "$0")/.."
FRAMES=${1:-0-8999}
CH=${CHROME:-/opt/pw-browsers/chromium-1243/chrome-linux64/chrome}
BROWSER=(); [ -x "$CH" ] && BROWSER=(--browser-executable="$CH")
npx remotion render src/index.ts SatoshiLargo "out/satoshi07/borrador-${FRAMES}.mp4" "${BROWSER[@]}" \
  --scale=${SCALE:-0.5} --jpeg-quality=${JPEG:-70} --crf=${CRF:-28} --concurrency=${CONC:-6} --timeout=120000 --frames="$FRAMES"
echo "→ out/satoshi07/borrador-${FRAMES}.mp4"
