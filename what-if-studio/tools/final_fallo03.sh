#!/usr/bin/env bash
# Fallo #03, the short cut: final renders (general and Facebook) and the exports for every platform.
#   bash tools/final_fallo03.sh
# Outputs in out/fallo03/:
#   fallo03-final-general.mp4    1080x1920, 30 fps, crf 18 (YouTube Shorts takes this one as it is)
#   fallo03-final-facebook.mp4   the Facebook cut (share ask on the peak, no follow chip)
#   redes/tiktok-..., redes/instagram-reels-..., redes/facebook-reels-...   H.264 High, yuv420p, faststart, AAC 192k
set -euo pipefail
cd "$(dirname "$0")/.."
export EPISODE=fallo03
RULES=0 python3 tools/mkplan03.py > /dev/null
RULES=0 python3 tools/therac25_build.py | grep -E "Master|film length"

render() { # $1 composition, $2 output name
  rm -rf out/fallo03/chunks
  COMPOSITION="$1" bash tools/therac25_render.sh | tail -1
  cp out/fallo03/fallo03-final.mp4 "out/fallo03/$2"
}
render Fallo03 fallo03-final-general.mp4
render Fallo03FB fallo03-final-facebook.mp4

OUT=out/fallo03/redes
mkdir -p "$OUT"
COMMON=(-pix_fmt yuv420p -c:v libx264 -profile:v high -preset slow -c:a aac -b:a 192k -ar 48000 -movflags +faststart)
ffmpeg -v error -y -i out/fallo03/fallo03-final-general.mp4 -vf "scale=1080:1920:flags=lanczos" "${COMMON[@]}" -b:v 12M -maxrate 14M -bufsize 24M "$OUT/tiktok-1080x1920-30fps.mp4"
ffmpeg -v error -y -i out/fallo03/fallo03-final-general.mp4 -vf "scale=1080:1920:flags=lanczos" "${COMMON[@]}" -b:v 10M -maxrate 12M -bufsize 20M "$OUT/instagram-reels-1080x1920-30fps.mp4"
ffmpeg -v error -y -i out/fallo03/fallo03-final-facebook.mp4 -vf "scale=1080:1920:flags=lanczos" "${COMMON[@]}" -b:v 10M -maxrate 12M -bufsize 20M "$OUT/facebook-reels-1080x1920-30fps.mp4"
cp out/fallo03/fallo03-final-general.mp4 "$OUT/youtube-shorts-1080x1920-30fps.mp4"
ls -la "$OUT" | awk 'NR>1{print $5, $9}'
echo ALL-DONE
