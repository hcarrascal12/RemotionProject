#!/usr/bin/env bash
# Render the Therac-25 short in chunks, retrying a chunk if Chromium stalls, then join the chunks and mux the
# mastered mix. Run from the studio folder:  bash tools/therac25_render.sh
# DRAFT=1 renders a half-size, high-compression preview (out/therac25/therac25-draft.mp4) in a fraction of the time,
# to check an edit before the full render.
# Chunks already rendered are kept, so a rerun picks up where it stopped (delete out/therac25/chunks after any
# change to the picture or the timeline).
set -u
EP=${EPISODE:-therac25}        # EPISODE=fallo02 COMPOSITION=Fallo02 bash tools/therac25_render.sh
COMP=${COMPOSITION:-Therac25}
OUT=out/$EP
CH=$OUT/chunks
FINAL=$OUT/$EP-final.mp4
EXTRA="--crf=18"
SIZE=300
if [[ "${DRAFT:-0}" == 1 ]]; then
  CH=$OUT/chunks-draft
  FINAL=$OUT/$EP-draft.mp4
  EXTRA="--scale=0.5 --image-format=jpeg --jpeg-quality=70 --crf=30"
  SIZE=600
fi
BROWSER=${BROWSER_EXECUTABLE:-/opt/pw-browsers/chromium-1243/chrome-linux64/chrome}
TOTAL=$(python3 -c "import json;d=json.load(open('src/$EP/timeline.json'));print(round(d['duration']*d['fps']))")
mkdir -p "$CH"

npx remotion bundle src/index.ts --out-dir "$OUT/bundle" > "$OUT/bundle.log" 2>&1 || { echo "bundle failed"; exit 1; }

# Two chunks at a time, two render threads each: measured about 18 % faster than one chunk with three threads on a
# 4-core machine. A chunk that fails is retried up to 3 times; chunks already rendered are kept.
render_chunk() {
  local a=$1 b=$2 f=$3
  for try in 1 2 3; do
    [[ -s "$f" ]] && return 0
    echo "chunk $a-$b try $try"
    npx remotion render "$OUT/bundle" "$COMP" "$f.tmp.mp4" --frames="$a-$b" --muted $EXTRA \
      --concurrency=2 --timeout=120000 --browser-executable="$BROWSER" > "$CH/log-$a.txt" 2>&1 \
      && mv "$f.tmp.mp4" "$f" || { rm -f "$f.tmp.mp4"; grep -m1 -E "Error" "$CH/log-$a.txt"; }
  done
  [[ -s "$f" ]]
}

: > "$CH/list.txt"
files=()
for ((a = 0; a < TOTAL; a += SIZE)); do
  b=$((a + SIZE - 1)); ((b >= TOTAL)) && b=$((TOTAL - 1))
  f=$(printf "%s/c%04d.mp4" "$CH" "$a")
  files+=("$f")
  while (( $(jobs -rp | wc -l) >= 2 )); do wait -n; done
  render_chunk "$a" "$b" "$f" &
done
wait
for f in "${files[@]}"; do
  [[ -s "$f" ]] || { echo "chunk $(basename "$f") failed 3 times"; exit 1; }
  echo "file '$(basename "$f")'" >> "$CH/list.txt"
done

ffmpeg -v error -y -f concat -safe 0 -i "$CH/list.txt" -i public/$EP/mix.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart \
  "$FINAL" && echo "done: $FINAL"
