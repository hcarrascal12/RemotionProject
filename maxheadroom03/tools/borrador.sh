#!/usr/bin/env bash
# Borrador rápido: 540x960, sin motion blur, con sello de tiempo. Uso: tools/borrador.sh [desde-hasta]
# Ej.: tools/borrador.sh 300-539   (solo la escena 3)
set -euo pipefail
cd "$(dirname "$0")/.."
FRAMES=${1:-0-1158}
CH=${CHROME:-/opt/pw-browsers/chromium-1243/chrome-linux64/chrome}
BROWSER=(); [ -x "$CH" ] && BROWSER=(--browser-executable="$CH")
npx remotion render MaxHeadroom1987 "out/borrador-${FRAMES}.mp4" "${BROWSER[@]}" \
  --props='{"draft":true}' --scale=0.5 --jpeg-quality=70 --crf=30 --concurrency=4 \
  --timeout=120000 --frames="$FRAMES"
echo "→ out/borrador-${FRAMES}.mp4"
