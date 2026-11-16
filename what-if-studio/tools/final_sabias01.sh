#!/usr/bin/env bash
# ¿Sabías que…? #01: final render and the exports for every platform.
#   bash tools/final_sabias01.sh
# Outputs in out/sabias01/:
#   sabias01-final.mp4      1080x1920, 30 fps, crf 18 (YouTube Shorts takes this one as it is)
#   redes/tiktok-..., redes/instagram-reels-..., redes/facebook-reels-...   H.264 High, yuv420p, faststart, AAC 192k
set -euo pipefail
cd "$(dirname "$0")/.."
export EPISODE=sabias01
python3 tools/mkplan_sabias01.py > /dev/null
RULES=0 python3 tools/therac25_build.py | grep -E "Master|film length"
rm -rf out/sabias01/chunks
COMPOSITION=Sabias01 bash tools/therac25_render.sh | tail -1
OUT=out/sabias01/redes
mkdir -p "$OUT"
SRC=out/sabias01/sabias01-final.mp4
COMMON=(-pix_fmt yuv420p -c:v libx264 -profile:v high -preset slow -c:a aac -b:a 192k -ar 48000 -movflags +faststart)
ffmpeg -v error -y -i "$SRC" -vf "scale=1080:1920:flags=lanczos" "${COMMON[@]}" -b:v 12M -maxrate 14M -bufsize 24M "$OUT/tiktok-1080x1920-30fps.mp4"
ffmpeg -v error -y -i "$SRC" -vf "scale=1080:1920:flags=lanczos" "${COMMON[@]}" -b:v 10M -maxrate 12M -bufsize 20M "$OUT/instagram-reels-1080x1920-30fps.mp4"
ffmpeg -v error -y -i "$SRC" -vf "scale=1080:1920:flags=lanczos" "${COMMON[@]}" -b:v 10M -maxrate 12M -bufsize 20M "$OUT/facebook-reels-1080x1920-30fps.mp4"
cp "$SRC" "$OUT/youtube-shorts-1080x1920-30fps.mp4"
ls -la "$OUT" | awk 'NR>1{print $5, $9}'
echo ALL-DONE
