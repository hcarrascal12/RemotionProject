#!/usr/bin/env bash
# Borrador del Caso Nº 06 (Polybius): 540x960, sin voz, con los clips de recreación. Uso: tools/polybius08_borrador.sh [desde-hasta]
set -euo pipefail
cd "$(dirname "$0")/.."
FRAMES=${1:-0-1499}
CH=${CHROME:-/opt/pw-browsers/chromium}
BROWSER=(); [ -x "$CH" ] && BROWSER=(--browser-executable="$CH" --chrome-mode=chrome-for-testing --gl=swangle)
mkdir -p out/polybius08
npx remotion render src/index.ts Caso06Polybius "out/polybius08/borrador-${FRAMES}.mp4" "${BROWSER[@]}" \
  --props='{"clips":true}' --scale=${SCALE:-0.5} --jpeg-quality=${JPEG:-75} --crf=${CRF:-28} --concurrency=4 --timeout=180000 --frames="$FRAMES"
echo "→ out/polybius08/borrador-${FRAMES}.mp4"
