#!/usr/bin/env bash
# Export the finished Therac-25 render for TikTok and Instagram Reels (YouTube Shorts takes the final render as it is).
#   bash tools/export_redes.sh [input.mp4]        default input: out/therac25/therac25-final.mp4
# TikTok:     1080x1920, 60 fps kept, H.264 High, about 12 Mbps, AAC 192k
# Instagram:  1080x1920, 30 fps (Reels are processed at 30), H.264 High, about 10 Mbps, AAC 192k
# Both: yuv420p, faststart, audio left at the mix's -14 LUFS.
set -euo pipefail
IN=${1:-out/therac25/therac25-final.mp4}
OUT=out/therac25/redes
mkdir -p "$OUT"
COMMON=(-pix_fmt yuv420p -c:v libx264 -profile:v high -preset slow -c:a aac -b:a 192k -ar 48000 -movflags +faststart)
ffmpeg -v error -y -i "$IN" -vf "scale=1080:1920:flags=lanczos" "${COMMON[@]}" -b:v 12M -maxrate 14M -bufsize 24M "$OUT/tiktok-1080x1920-60fps.mp4"
ffmpeg -v error -y -i "$IN" -vf "scale=1080:1920:flags=lanczos,fps=30" "${COMMON[@]}" -b:v 10M -maxrate 12M -bufsize 20M "$OUT/instagram-reels-1080x1920-30fps.mp4"
ls -la "$OUT" | awk 'NR>1{print $5, $9}'
