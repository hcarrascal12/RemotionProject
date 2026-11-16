#!/usr/bin/env python3
"""Fallo #04: turns the one-file recording (the 9 lines read in order, a pause between them) into the episode's voice.

  python3 tools/add_takes04.py take.mp3

The take is cleaned with the series chain (tools/voice_clean.py, then atempo 1.08 as in #03), its loudness set to -14.2 LUFS,
and written to public/fallo04/voice.wav. Its speech is split at the pauses; the pauses inside a line (after "2021", "rutina",
"entrar", "cero cuatro") are rejoined by LINE_PARTS, so each of the 9 lines gets the start and end of its speech in
src/fallo04/takes.json, which tools/mkplan04.py reads. Run mkplan04 (without --scratch), the build and the render after it.
"""
import json, os, re, subprocess, sys
import numpy as np

SR = 48000
TARGET = -14.2
ORDER = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L6b', 'L7', 'L8']
# how many pause-separated pieces each line was read in
LINE_PARTS = {'L1': 1, 'L2': 2, 'L3': 1, 'L4': 2, 'L5': 1, 'L6': 2, 'L6b': 1, 'L7': 1, 'L8': 2}
MIN_PAUSE = 0.28  # seconds of quiet (after the 1.08 tempo) that separate two pieces
work = 'out/fallo04/takes'
os.makedirs(work, exist_ok=True)


def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def lufs(p):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True)
    return float(re.findall(r'I:\s+(-?\d+\.\d+) LUFS', r.stderr)[-1])


src = sys.argv[1]
c, t = f'{work}/take-clean.wav', f'{work}/take-tempo.wav'
subprocess.run([sys.executable, 'tools/voice_clean.py', src, c], check=True, capture_output=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', c, '-af', 'atempo=1.08', '-ar', str(SR), '-ac', '1', t], check=True)
gain = TARGET - lufs(t)
x = load(t) * (10 ** (gain / 20))

# speech pieces: 10 ms energy frames over -45 dBFS, joined across gaps shorter than MIN_PAUSE
hop = int(0.01 * SR)
e = np.array([20 * np.log10(np.sqrt((x[i:i + hop] ** 2).mean()) + 1e-9) for i in range(0, len(x) - hop, hop)])
on = e > -45
pieces, start, quiet = [], None, 0
for i, v in enumerate(on):
    if v:
        if start is None:
            start = i
        quiet, last = 0, i
    elif start is not None:
        quiet += 1
        if quiet * 0.01 >= MIN_PAUSE:
            pieces.append((start * 0.01, (last + 1) * 0.01))
            start = None
if start is not None:
    pieces.append((start * 0.01, (last + 1) * 0.01))
pieces = [p for p in pieces if p[1] - p[0] > 0.12]  # drop clicks and breaths
need = sum(LINE_PARTS.values())
print('pieces:', ' '.join(f'{a:.2f}-{b:.2f}' for a, b in pieces))
if len(pieces) != need:
    sys.exit(f'found {len(pieces)} speech pieces, expected {need}: check the pauses (MIN_PAUSE) or LINE_PARTS')

takes, k = {}, 0
for name in ORDER:
    grp = pieces[k:k + LINE_PARTS[name]]
    k += LINE_PARTS[name]
    takes[name] = [round(max(0.0, grp[0][0] - 0.02), 3), round(grp[-1][1] + 0.03, 3)]
    print(name, takes[name], round(takes[name][1] - takes[name][0], 2), 's')
out = np.concatenate([x, np.zeros(int(0.3 * SR))]).astype(np.float32)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s24le', 'public/fallo04/voice.wav'], input=out.tobytes(), check=True)
json.dump(takes, open('src/fallo04/takes.json', 'w'))
print('gain %+.1f dB; voice.wav' % gain, round(len(out) / SR, 2), 's; speech total', round(sum(b - a for a, b in takes.values()), 2), 's')
