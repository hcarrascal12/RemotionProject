#!/usr/bin/env python3
"""Sonido del Caso Nº 04 · El Gato con Sombrero (con voz): la pista de Suno de Satoshi + efectos sintetizados.

  python3 tools/gato06_audio.py   # escribe public/gato06/mix.wav, masterizado a -14 LUFS

Los efectos (golpes, whooshes, contador, sellos…) se reutilizan de tools/polar05_audio.py y van en los mismos
frames que las escenas de src/gato06/theme.ts.
"""
import os, subprocess, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(os.path.join(HERE, '..'))

# funciones de síntesis del Caso Nº 03 (todo lo que hay antes de su lista de efectos)
_src = open(os.path.join(HERE, 'polar05_audio.py'), encoding='utf-8').read()
exec(_src[: _src.index('# (frame global, sonido, ganancia)')])

SR = 48000
FPS = 30
D = 1140 / FPS
N = int(D * SR)
t = np.arange(N) / SR
MUSIC = 'public/cicada01/musica-suno.m4a'
MUSIC_FROM = 38.0  # golpe de la pista al segundo 1 del vídeo


def heartbeat():
    n = int(0.6 * SR); tt = np.arange(n) / SR
    beat = lambda d: np.sin(2 * np.pi * 50 * (tt - d)) * np.exp(-np.clip(tt - d, 0, None) / 0.07) * (tt >= d)
    return beat(0) + 0.7 * beat(0.22)


def dymo(n=6):
    """Rotuladora: clics mecánicos rápidos (una letra impresa por clic)."""
    sec = 0.06 * n + 0.1; y = np.zeros(int(sec * SR))
    for k in range(n):
        x = clack() * (0.6 + 0.4 * rng.random()); i = int(k * 0.06 * SR); y[i:i + len(x)] += x[: len(y) - i]
    return y


def hat_drop():
    """El sombrero cae sobre la cámara: whoosh grave + golpe de tela."""
    n = int(0.7 * SR); tt = np.arange(n) / SR
    w = lp(noise(0.7), 900) * np.sin(np.pi * np.clip(tt / 0.3, 0, 1)) * np.exp(-np.clip(tt - 0.3, 0, None) / 0.15)
    thump = np.zeros(n); i = int(0.26 * SR); th = np.sin(2 * np.pi * 60 * tt[: n - i]) * np.exp(-tt[: n - i] / 0.12)
    thump[i:] = th
    return w * 0.8 + thump


S = SCENES = dict(hook=0, auction=262, ireland=410, viral=494, police=611, spread=731, fear=874, loop=977)
LOT, COUNT, SCAN, BLACK, HIT, DOC, REAL = 37, 24, 12, 42, 53, 88, 55   # mismos valores que src/gato06/scenes.tsx
CLIPS = (16, 43, 85)
CUES = [
    # 1 · gancho (8,9 s): la foto sola, «cierren sus puertas», cae al tablero, la ráfaga y la policía
    (0, sub_bass_impact(), 0.9), (0, static_burst(0.12), 0.3), (6, slam(), 0.55),
    (29, slam(), 0.85), (29, sub_bass_impact(), 0.8),                       # la foto cae al tablero
    (32, scratch(), 0.8), (36, scratch(), 0.6),                             # marcador rodea la cara
    (49, slam(), 0.6), (49, tick(), 0.5), (88, slam(), 0.7), (88, tick(), 0.5),
    (121, slam(), 0.75), (121, tick(), 0.5), (127, slam(), 0.75), (127, tick(), 0.5), (133, slam(), 0.8), (133, tick(), 0.5),  # ráfaga
    (140, tick(), 0.5),
    (195, sub_bass_impact(), 0.95), (195, alarm(), 0.4), (195, swipe(), 0.5),  # policía: luces y sirena
    (252, glitch_whoosh(), 0.6),
    # 2 · subasta
    (S['auction'] + 4, slam(), 0.5), (S['auction'] + 2, spin(36), 0.55),
    (S['auction'] + LOT, sub_bass_impact(), 0.85), (S['auction'] + LOT, slam(), 0.55),   # el disfraz real
    (S['auction'] + LOT + 20, counter_roll(36), 0.55), (S['auction'] + LOT + 56, clack(), 0.7),   # precio
    (S['auction'] + 102, sub_bass_impact(), 0.9), (S['auction'] + 104, error_buzz(), 0.3),  # 10 M · «PESADILLA»
    # 3 · Irlanda
    (S['ireland'] - 4, glitch_whoosh(), 0.5), (S['ireland'] + 7, slam(), 0.8), (S['ireland'] + 7, sub_bass_impact(), 0.6),
    (S['ireland'] + 24, stamp(), 0.7), (S['ireland'] + 24, ping(), 0.35), (S['ireland'] + 18, slam(), 0.45),
    (S['ireland'] + 42, stamp(), 0.75), (S['ireland'] + 42, ping(), 0.35), (S['ireland'] + 36, slam(), 0.45),
    (S['ireland'] + 50, tick(), 0.5),
    (S['ireland'] + 16, clack(), 0.45), (S['ireland'] + 17, tone(1760, 0.09, 0.04), 0.3), (S['ireland'] + 21, tone(2350, 0.09, 0.04), 0.25),  # cámara y notificación
    (195, clack(), 0.55),                                                    # el comunicado cae sobre el tablero
    (S['police'] + SCAN + 6, glitch_whoosh(), 0.45),                         # el escáner rompe la imagen
    (S['spread'] + 10, lp(np.concatenate([alarm()] * 3), 700), 0.16),         # sirena lejana
    (S['spread'] + 38, static_burst(1.6), 0.1),                              # estática de noticiero
    (S['loop'] + 147, riser(16), 0.5),                                       # el loop remata en el golpe del frame 0
] + [(S['viral'] + 3 + k * 9, tone(1400 + 140 * k, 0.12, 0.05), 0.35) for k in range(4)] + [
    # 4 · viral
    (S['viral'] + 4, slam(), 0.5),
    (S['viral'] + COUNT, counter_roll(34), 0.6), (S['viral'] + COUNT + 34, sub_bass_impact(), 0.95), (S['viral'] + COUNT + 34, clack(), 0.6),
    (S['viral'] + 68, swipe(), 0.5), (S['viral'] + 68, slam(), 0.6),
    # 5 · policía: silencio, barrido y golpe
    (S['police'] + SCAN, swipe(), 0.4), (S['police'] + BLACK - 24, riser(24), 0.65),   # el riser muere en el negro
    (S['police'] + HIT, sub_bass_impact(), 1.0), (S['police'] + HIT, slam(), 1.0), (S['police'] + HIT, static_burst(0.25), 0.55),
    (S['police'] + HIT + 1, sub_bass_impact(), 0.9), (S['police'] + HIT + 3, alarm(), 0.35),
    (S['police'] + DOC, glitch_whoosh(), 0.5), (S['police'] + DOC, slam(), 0.5),
    (S['police'] + DOC + 18, stamp(), 0.85), (S['police'] + DOC + 18, sub_bass_impact(), 0.7),     # FALSO
    # 6 · ni así paró
    (S['spread'] + 4, sub_bass_impact(), 0.85), (S['spread'] + 4, slam(), 0.6),
] + [x for i, c in enumerate(CLIPS) for x in ((S['spread'] + c, error_buzz(), 0.5 + 0.05 * i), (S['spread'] + c + 1, stamp(), 0.6 + 0.05 * i))] + [
    (S['spread'] + CLIPS[-1] + 1, sub_bass_impact(), 0.8),
    # 7 · el miedo
    (S['fear'] + 2, static_burst(0.3), 0.5),
    (S['fear'] + REAL, sub_bass_impact(), 1.0), (S['fear'] + REAL, slam(), 0.8),
] + [(S['fear'] + REAL + 22 * k, heartbeat(), 0.8) for k in range(2)] + [
    # 8 · cierre
    (S['loop'] + 6, sub_bass_impact(), 0.85), (S['loop'] + 54, sub_bass_impact(), 0.95), (S['loop'] + 54, slam(), 0.7),
    (S['loop'] + 90, slam(), 0.7), (S['loop'] + 91, ping(), 0.4),
    (S['loop'] + 54, stamp(), 0.6),
]

# firmas: la rotuladora en cada titular y el sombrero que cae en las transiciones
HEADS = [6, 49, 60, 88, 140, 195, S['auction'] + 4, S['auction'] + LOT, S['auction'] + 102, S['ireland'] + 4, S['viral'] + 4, S['viral'] + 68,
         S['police'] + HIT, S['spread'] + 4, S['fear'] + 2, S['fear'] + REAL, S['loop'] + 6, S['loop'] + 54, S['loop'] + 90]
CUES += [(h + 1, dymo(), 0.3) for h in HEADS if h > 0]
CUES += [(S[k] - 8, hat_drop(), 0.85) for k in ('auction', 'police', 'fear')]

L = np.zeros(N); R = np.zeros(N); hits = np.zeros(N)
for frame, x, gain in CUES:
    x = x / (np.abs(x).max() + 1e-9) * gain
    i0 = int(frame / FPS * SR); x = x[: N - i0]
    pan = rng.uniform(-0.2, 0.2)
    L[i0:i0 + len(x)] += x * np.cos((pan + 1) * np.pi / 4) * 1.414
    R[i0:i0 + len(x)] += x * np.sin((pan + 1) * np.pi / 4) * 1.414
    if gain >= 0.7:
        hits[i0:i0 + int(0.35 * SR)] = np.maximum(hits[i0:i0 + int(0.35 * SR)], gain)
fx = np.stack([L, R])

raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(MUSIC_FROM), '-t', str(D), '-i', MUSIC, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                     capture_output=True, check=True).stdout
so = np.frombuffer(raw, dtype=np.float32).astype(np.float64).reshape(-1, 2).T
mus = np.zeros((2, N)); mus[:, :min(N, so.shape[1])] = so[:, :N]
mus /= np.abs(mus).max() + 1e-9
sec = lambda fr: fr / FPS
# silencios dramáticos: antes de "era IA" y antes de "el miedo, no"
mus *= curve([(0, 1), (sec(S['police'] + BLACK - 8), 1), (sec(S['police'] + BLACK), 0.0), (sec(S['police'] + HIT), 0.0), (sec(S['police'] + HIT + 1), 1),
               (sec(S['fear'] + 18), 1), (sec(S['fear'] + 22), 0.0), (sec(S['fear'] + REAL), 0.0), (sec(S['fear'] + REAL + 1), 1), (D - 0.3, 1), (D, 0.6)])
# voz (tools/gato06_voz.py): la música y los efectos se apartan cuando habla
voice = np.zeros((2, N)); venv = np.zeros(N)
if os.path.exists('public/gato06/voz.wav'):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'public/gato06/voz.wav', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    vo = np.frombuffer(raw, dtype=np.float32).astype(np.float64).reshape(-1, 2).T[:, :N]
    voice[:, :vo.shape[1]] = vo / (np.abs(vo).max() + 1e-9)
    venv = lp(np.abs(voice).mean(0), 6); venv /= venv.max() + 1e-9
print('voz:', 'public/gato06/voz.wav' if venv.any() else 'ninguna')
# tramo denso (subasta → avistamientos → 14 M): la música 3 dB más baja para que la voz no compita
mus *= curve([(0, 1), (sec(S['auction']) - 0.4, 1), (sec(S['auction']), 0.7), (sec(S['police']), 0.7), (sec(S['police']) + 0.4, 1), (D, 1)])
mus *= (1 - 0.45 * lp(hits, 8)) * (1 - 0.65 * venv)
fx *= curve([(0, 1), (sec(S['police'] + BLACK), 1), (sec(S['police'] + BLACK) + 0.04, 0), (sec(S['police'] + HIT) - 0.01, 0), (sec(S['police'] + HIT), 1), (D, 1)])
mx = mus * 0.4 + fx * 0.7 * (1 - 0.25 * venv) + voice * 1.0
mx = np.tanh(mx * 1.2) / np.tanh(1.2)
mx /= np.abs(mx).max() * 1.05
os.makedirs('out/gato06', exist_ok=True)
with wave.open('out/gato06/mix-raw.wav', 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((mx.T * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/gato06/mix-raw.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', 'public/gato06/mix.wav'], check=True)
print('escrito public/gato06/mix.wav', round(D, 2), 's')
