#!/usr/bin/env bash
# Render final del Fallo #05 a 1080x1920: por bloques de 300 frames (con reintentos), concatenado y con la mezcla.
set -euo pipefail
cd "$(dirname "$0")/.."
TOTAL=1150; STEP=300; OUT=out/polar05/final
CH=${CHROME:-/opt/pw-browsers/chromium-1243/chrome-linux64/chrome}
BROWSER=(); [ -x "$CH" ] && BROWSER=(--browser-executable="$CH")
mkdir -p "$OUT"; : > "$OUT/list.txt"
for ((a=0; a<TOTAL; a+=STEP)); do
  b=$((a+STEP-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  f="$OUT/part-$a.mp4"
  for try in 1 2 3; do
    [ -s "$f" ] && break
    npx remotion render src/index.ts Fallo05OsoPolar "$f" "${BROWSER[@]}" --muted --crf=17 --concurrency=4 --timeout=120000 \
      --props='{"noAudio":true}' --frames="$a-$b" >/dev/null 2>&1 || { echo "bloque $a-$b falló (intento $try)"; rm -f "$f"; }
  done
  [ -s "$f" ] || { echo "ERROR bloque $a-$b"; exit 1; }
  echo "bloque $a-$b listo"; echo "file 'part-$a.mp4'" >> "$OUT/list.txt"
done
ffmpeg -v error -y -f concat -safe 0 -i "$OUT/list.txt" -c copy "$OUT/video.mp4"
ffmpeg -v error -y -i "$OUT/video.mp4" -i public/polar05/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -movflags +faststart out/polar05/Fallo05-OsoPolar-FINAL.mp4
echo "→ out/polar05/Fallo05-OsoPolar-FINAL.mp4"
