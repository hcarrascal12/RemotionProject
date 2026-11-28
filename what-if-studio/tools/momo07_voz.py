#!/usr/bin/env python3
"""Voz del Caso Nº 05 (Momo): ajusta los silencios de la toma de ElevenLabs para que encaje en 38 s.

  python3 tools/gato06_voz.py   # public/momo07/voz-raw.mp3 → public/momo07/voz.wav + out/momo07/voz-words.json

Solo toca silencios (nunca la voz): acorta huecos largos y alarga las dos pausas dramáticas
(después de "artificial" y antes de "Todo era falso"). Imprime dónde cae cada palabra en el vídeo.
"""
import json, os, subprocess, wave
import numpy as np

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
SR = 48000; LEAD = 0.3; D = 38.8
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'public/momo07/voz-raw.mp3', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).T.astype(np.float64)
words = json.load(open('out/momo07/voz-raw-words.json'))
# cierre nuevo (public/momo07/cierre-raw.mp3): «¿Te llamó Momo o solo lo viste en las noticias?» sustituye al cierre de la toma larga
cw = json.load(open('out/momo07/cierre-words.json'))
cl = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', 'public/momo07/cierre-raw.mp3', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, dtype=np.float32).reshape(-1, 2).T.astype(np.float64)
i_te = max(i for i, w in enumerate(words) if w['w'].startswith('¿Te'))
def _rms(a):
    m = np.abs(a).mean(0); return np.sqrt((a[:, m > 0.02] ** 2).mean())
cl = cl * (_rms(x[:, :int(words[i_te]['s'] * SR)]) / _rms(cl))  # mismo nivel que el resto de la voz
cut = (words[i_te - 1]['e'] + words[i_te]['s']) / 2
GAP = 0.8  # luego TARGET['podrido.'] lo ajusta
t0 = cut + GAP
x = np.concatenate([x[:, :int(cut * SR)], np.zeros((2, int(GAP * SR))), cl], 1)
words = words[:i_te] + [dict(w=w['w'], s=round(t0 + w['s'], 3), e=round(t0 + w['e'], 3)) for w in cw]
# «No contestes» sonaba atropellado: se dice un 10 % más lento (solo esa frase; el corte cae en el silencio que la sigue)
T0, TEMPO = 1.1, 0.9
head = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', f'atempo={TEMPO}', '-f', 'f32le', '-'],
                      input=x[:, :int(T0 * SR)].T.astype(np.float32).tobytes(), capture_output=True, check=True).stdout
head = np.frombuffer(head, dtype=np.float32).reshape(-1, 2).T.astype(np.float64)
x = np.concatenate([head, x[:, int(T0 * SR):]], 1)
ST = head.shape[1] / SR - T0
for w in words:
    for k in ('s', 'e'):
        w[k] = w[k] / TEMPO if w[k] <= T0 else w[k] + ST
mono = np.abs(x).mean(0)

def quiet(a, b):
    """Tramo realmente silencioso dentro de [a, b] (-50 dB en ventanas de 10 ms)."""
    n = 480; i0, i1 = int(a * SR), int(b * SR)
    q = [i for i in range(i0, i1 - n, n) if 20 * np.log10(np.sqrt((x[:, i:i + n] ** 2).mean()) + 1e-9) < -55]
    return (q[0] / SR, (q[-1] + n) / SR) if q else None

# hueco objetivo (s) después de la palabra que empieza así; None = dejarlo como está
TARGET = {'contestes,': 0.5, 'mundo.': 0.45, 'Momo?': 0.3, 'WhatsApp,': 0.3, 'Japón,': 0.28, 'Colombia.': 0.35, 'ti.': 0.28,
          'mundial.': 0.32, 'borrara.': 0.42, 'real.': 0.3, 'cara?': 0.3, 'Motherbird,': 0.22, 'ave.': 0.42, 'falso.': 0.35, 'podrido.': 0.22}
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
    d = TARGET[w['w']] - gap
    if d >= 0:
        cut = (q[0] + q[1]) / 2; segs.append((pos, cut, d)); pos = cut
    else:
        # se quita un trozo CENTRADO dentro del silencio, con 60 ms de margen a cada lado: nunca toca una palabra
        d = max(d, -(q[1] - q[0] - 0.12))
        if d >= 0:
            continue
        c0 = q[0] + ((q[1] - q[0]) + d) / 2
        segs.append((pos, c0, d)); pos = c0 - d
segs.append((pos, x.shape[1] / SR, 0))
FADE = int(0.005 * SR)
def piece(a, b):
    z = x[:, int(a * SR):int(b * SR)].copy()
    r = np.linspace(0, 1, FADE); z[:, :FADE] *= r; z[:, -FADE:] *= r[::-1]  # sin clics en las uniones
    return z
out = [np.zeros((2, int(LEAD * SR)))]
for a, b, d in segs:
    out.append(piece(a, b))
    if d > 0:
        out.append(np.zeros((2, int(d * SR))))
y = np.concatenate(out, 1)
print('duración voz', round(y.shape[1] / SR, 2))
y = np.pad(y, ((0, 0), (0, max(0, int(D * SR) - y.shape[1]))))[:, :int(D * SR)]
with wave.open('public/momo07/voz.wav', 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((np.clip(y, -1, 1).T * 32767).astype('<i2').tobytes())

def m(t):  # tiempo crudo → tiempo en el vídeo
    o = LEAD
    for a, b, d in segs:
        if t >= b: o += d
    return t + o
FIX = {'Motherbird,': 'Mother Bird,'}
res = [dict(w=FIX.get(w['w'], w['w']), s=round(m(w['s']), 2), e=round(m(w['e']), 2), f=round(m(w['s']) * 30)) for w in words]
json.dump(res, open('out/momo07/voz-words.json', 'w'), ensure_ascii=False)
print(' '.join(f"{r['w']}@{r['f']}" for r in res))
