#!/usr/bin/env python3
"""Fallo #02: replaces the last question ("¿...de CrowdStrike o de Microsoft?") with a new recording.

  python3 tools/add_m2.py new-take.mp3

The new take is cleaned with the same chain as the rest of the voice (tools/voice_clean.py, then atempo 1.04), its speech is trimmed
and appended to public/fallo02/voice.wav after the current end; the position goes to kids-data-like file src/fallo02/m2.json,
which tools/mkplan02.py (the plan builder) reads: M2 then points at the new segment. Run the build and the render after it.
"""
import json, subprocess, sys, os
import numpy as np

SR = 48000
src = sys.argv[1]
tmp = 'out/fallo02/m2-clean.wav'
os.makedirs('out/fallo02', exist_ok=True)
subprocess.run([sys.executable, 'tools/voice_clean.py', src, tmp], check=True)
tmp2 = 'out/fallo02/m2-tempo.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', 'atempo=1.04', '-ar', str(SR), '-ac', '1', tmp2], check=True)


def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


base = load('public/fallo02/voice.wav')
if not os.path.exists('out/fallo02/voice-before-m2.wav'):
    subprocess.run(['cp', 'public/fallo02/voice.wav', 'out/fallo02/voice-before-m2.wav'])
else:
    base = load('out/fallo02/voice-before-m2.wav')  # always append to the original take, never to a previous attempt
new = load(tmp2)
nz = np.where(np.abs(new) > 0.01 * np.abs(new).max())[0]
new = new[max(0, nz[0] - int(0.05 * SR)):nz[-1] + int(0.1 * SR)]
gap = int(1.0 * SR)
out = np.concatenate([base, np.zeros(gap), new, np.zeros(int(0.3 * SR))])
data = out.astype(np.float32)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s24le', 'public/fallo02/voice.wav'], input=data.tobytes(), check=True)
start = (len(base) + gap) / SR + 0.05
end = start + (len(new) - int(0.15 * SR)) / SR
json.dump({'M2': [round(start, 3), round(end, 3)]}, open('src/fallo02/m2.json', 'w'))
print('M2 now at', round(start, 2), '-', round(end, 2), 's of the voice file;', round(len(new) / SR, 1), 's of new speech')
