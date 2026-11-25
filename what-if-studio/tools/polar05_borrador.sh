#!/usr/bin/env bash
# Borrador rápido del Fallo #05 (oso polar): 540x960. Uso: tools/polar05_borrador.sh [desde-hasta]
set -euo pipefail
cd "$(dirname "$0")/.."
FRAMES=${1:-0-1105}
CH=${CHROME:-/opt/pw-browsers/chromium-1243/chrome-linux64/chrome}
BROWSER=(); [ -x "$CH" ] && BROWSER=(--browser-executable="$CH")
npx remotion render src/index.ts Fallo05OsoPolar "out/polar05/borrador-${FRAMES}.mp4" "${BROWSER[@]}" \
  --scale=0.5 --jpeg-quality=70 --crf=30 --concurrency=4 --timeout=120000 --frames="$FRAMES"
echo "→ out/polar05/borrador-${FRAMES}.mp4"
