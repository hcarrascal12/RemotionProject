#!/usr/bin/env python3
"""Voz del Caso Nº 04: ajusta los silencios de la toma de ElevenLabs para que encaje en 38 s.

  python3 tools/gato06_voz.py   # public/gato06/voz-raw.mp3 → public/gato06/voz.wav + out/gato06/voz-words.json

Solo toca silencios (nunca la voz): acorta huecos largos y alarga las dos pausas dramáticas
(después de "artificial" y antes de "Todo era falso"). Imprime dónde cae cada palabra en el vídeo.
"""
import json, os, subprocess, wave
import numpy as np

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
SR = 48000; LEAD = 0.15; D = 38.0
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'public/gato06/voz-raw.mp3', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).T.astype(np.float64)
words = json.load(open('out/gato06/voz-raw-words.json'))
mono = np.abs(x).mean(0)

def quiet(a, b):
    """Tramo realmente silencioso dentro de [a, b] (-50 dB en ventanas de 10 ms)."""
    n = 480; i0, i1 = int(a * SR), int(b * SR)
    q = [i for i in range(i0, i1 - n, n) if 20 * np.log10(np.sqrt((x[:, i:i + n] ** 2).mean()) + 1e-9) < -50]
    return (q[0] / SR, (q[-1] + n) / SR) if q else None

# hueco objetivo (s) después de la palabra que empieza así; None = dejarlo como está
TARGET = {'puertas.': 0.55, 'comunicado.': 0.45, 'vieron.': 0.5, 'avistamientos.': 0.45, 'creyó.': 0.45,
          'artificial.': 1.1, 'arrestados.': 0.98, 'falso.': 0.5, 'no.': 0.45, 'foto?': 0.45, 'sabe.': 0.45}
segs = []; pos = 0.0; shift = []  # (t_raw, delta acumulado)
delta = LEAD
for i, w in enumerate(words[:-1]):
    nxt = words[i + 1]
    if w['w'] not in TARGET:
        continue
    q = quiet(w['e'] - 0.1, nxt['s'] + 0.1)
    gap = nxt['s'] - w['e']
    if not q:
        print('sin silencio tras', w['w']); continue
    mid = (q[0] + q[1]) / 2; d = TARGET[w['w']] - gap
    if d < 0:
        d = max(d, -(q[1] - q[0] - 0.06))  # nunca recorto voz
    segs.append((pos, mid, d)); pos = mid
segs.append((pos, x.shape[1] / SR, 0))
out = [np.zeros((2, int(LEAD * SR)))]
for a, b, d in segs:
    out.append(x[:, int(a * SR):int(b * SR)])
    if d > 0:
        out.append(np.zeros((2, int(d * SR))))
    elif d < 0:
        out[-1] = out[-1][:, :int(d * SR)]  # el corte cae en el centro del silencio
y = np.concatenate(out, 1)
print('duración voz', round(y.shape[1] / SR, 2))
y = np.pad(y, ((0, 0), (0, max(0, int(D * SR) - y.shape[1]))))[:, :int(D * SR)]
with wave.open('public/gato06/voz.wav', 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((np.clip(y, -1, 1).T * 32767).astype('<i2').tobytes())

def m(t):  # tiempo crudo → tiempo en el vídeo
    o = LEAD
    for a, b, d in segs:
        if t >= b: o += d
    return t + o
res = [dict(w=w['w'], s=round(m(w['s']), 2), e=round(m(w['e']), 2), f=round(m(w['s']) * 30)) for w in words]
json.dump(res, open('out/gato06/voz-words.json', 'w'), ensure_ascii=False)
print(' '.join(f"{r['w']}@{r['f']}" for r in res))
