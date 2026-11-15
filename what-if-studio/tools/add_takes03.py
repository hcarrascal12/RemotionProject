#!/usr/bin/env python3
"""Fallo #03: appends the four re-recorded lines (hook, explanation, rules, question) to the voice take.

  python3 tools/add_takes03.py gancho.mp3 explica.mp3 reglas.mp3 pregunta.mp3

Each new take is cleaned with the same chain as the rest of the voice (tools/voice_clean.py, then atempo 1.08, which is where
the first take sits: 1.04 and then 1.0385), its loudness is matched to the old take, and it is appended to public/fallo03/voice.wav
after the old take (kept as public/fallo03/voice-v1.wav; the script always starts from that copy, so it can be rerun). The start and
end of the speech of every new phrase goes to src/fallo03/takes.json, which tools/mkplan03.py reads: H1 hook, H2 explanation,
H3 rules, H4 question. Run mkplan03, the build and the render after it.
"""
import json, os, re, subprocess, sys
import numpy as np

SR = 48000
NAMES = ['H1', 'H2', 'H3', 'H4']
TARGET = -14.2  # LUFS of the old take
work = 'out/fallo03/takes'
os.makedirs(work, exist_ok=True)


def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def lufs(p):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True)
    return float(re.findall(r'I:\s+(-?\d+\.\d+) LUFS', r.stderr)[-1])


if not os.path.exists('public/fallo03/voice-v1.wav'):
    subprocess.run(['cp', 'public/fallo03/voice.wav', 'public/fallo03/voice-v1.wav'], check=True)
base = load('public/fallo03/voice-v1.wav')
parts, takes, cursor = [base], {}, len(base)
for name, src in zip(NAMES, sys.argv[1:5]):
    c = f'{work}/{name}-clean.wav'
    t = f'{work}/{name}-tempo.wav'
    subprocess.run([sys.executable, 'tools/voice_clean.py', src, c], check=True, capture_output=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', c, '-af', 'atempo=1.08', '-ar', str(SR), '-ac', '1', t], check=True)
    gain = TARGET - lufs(t)
    x = load(t) * (10 ** (gain / 20))
    hop = int(0.01 * SR)
    e = np.array([20 * np.log10(np.sqrt((x[i:i + hop] ** 2).mean()) + 1e-9) for i in range(0, len(x) - hop, hop)])
    on = np.where(e > -45)[0]
    a, b = on[0] * 0.01, (on[-1] + 1) * 0.01
    gap = np.zeros(int(1.0 * SR))
    off = cursor + len(gap)
    parts += [gap, x]
    cursor = off + len(x)
    takes[name] = [round(off / SR + a - 0.02, 3), round(off / SR + b + 0.03, 3)]
    print(name, 'gain %+.1f dB' % gain, 'speech', round(a, 2), '-', round(b, 2), '->', takes[name])
parts.append(np.zeros(int(0.3 * SR)))
out = np.concatenate(parts).astype(np.float32)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s24le', 'public/fallo03/voice.wav'], input=out.tobytes(), check=True)
json.dump(takes, open('src/fallo03/takes.json', 'w'))
print('voice.wav is now', round(len(out) / SR, 1), 's')
