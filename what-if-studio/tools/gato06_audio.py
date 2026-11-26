#!/usr/bin/env python3
"""Sonido del Caso Nº 04 · El Gato con Sombrero (sin voz todavía): la pista de Suno de Satoshi + efectos sintetizados.

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


S = SCENES = dict(hook=0, auction=170, ireland=330, viral=425, police=575, spread=755, fear=865, loop=955)
CUES = [
    # 1 · gancho (5,7 s): la foto sola con un golpe grave, cae al tablero, frases con aire, ráfaga y policía
    (0, sub_bass_impact(), 0.9), (0, static_burst(0.12), 0.3),
    (29, slam(), 0.85), (29, sub_bass_impact(), 0.8),                       # la foto cae al tablero
    (32, scratch(), 0.8), (36, scratch(), 0.6),                             # marcador rodea la cara
    (70, slam(), 0.7), (70, tick(), 0.5),                                   # …POR UNA FOTO DE INTERNET
    (105, slam(), 0.75), (105, tick(), 0.5), (111, slam(), 0.75), (111, tick(), 0.5), (117, slam(), 0.8), (117, tick(), 0.5),  # ráfaga
    (135, sub_bass_impact(), 0.95), (135, alarm(), 0.45), (135, swipe(), 0.5),  # policía: luces y sirena
    (165, glitch_whoosh(), 0.6),
    # 2 · subasta
    (S['auction'] + 4, slam(), 0.5), (S['auction'] + 2, spin(36), 0.55),
    (S['auction'] + 52, sub_bass_impact(), 0.85), (S['auction'] + 52, slam(), 0.55),   # el disfraz real
    (S['auction'] + 72, counter_roll(36), 0.55), (S['auction'] + 108, clack(), 0.7),   # precio
    (S['auction'] + 112, sub_bass_impact(), 0.9), (S['auction'] + 114, error_buzz(), 0.35),  # «PESADILLA»
    # 3 · Irlanda
    (S['ireland'] - 4, glitch_whoosh(), 0.5), (S['ireland'] + 4, slam(), 0.5),
    (S['ireland'] + 14, stamp(), 0.7), (S['ireland'] + 14, ping(), 0.35), (S['ireland'] + 8, slam(), 0.45),
    (S['ireland'] + 30, stamp(), 0.75), (S['ireland'] + 30, ping(), 0.35), (S['ireland'] + 24, slam(), 0.45),
    (S['ireland'] + 44, tick(), 0.5),
] + [(S['viral'] + 3 + k * 9, tone(1400 + 140 * k, 0.12, 0.05), 0.35) for k in range(4)] + [
    # 4 · viral
    (S['viral'] + 4, slam(), 0.5),
    (S['viral'] + 52, counter_roll(34), 0.6), (S['viral'] + 86, sub_bass_impact(), 0.95), (S['viral'] + 86, clack(), 0.6),
    (S['viral'] + 114, swipe(), 0.5), (S['viral'] + 114, slam(), 0.6),
    # 5 · policía: silencio, barrido y golpe
    (S['police'] + 26, riser(22), 0.6),
    (S['police'] + 48, sub_bass_impact(), 1.0), (S['police'] + 48, slam(), 0.85), (S['police'] + 50, alarm(), 0.35),
    (S['police'] + 92, glitch_whoosh(), 0.5), (S['police'] + 92, slam(), 0.5),
    (S['police'] + 110, stamp(), 0.85), (S['police'] + 110, sub_bass_impact(), 0.7),     # FALSO
    (S['police'] + 126, tick(), 0.4),
    # 6 · no se detuvo
    (S['spread'] + 4, sub_bass_impact(), 0.85), (S['spread'] + 4, slam(), 0.6),
    (S['spread'] + 26, error_buzz(), 0.55), (S['spread'] + 27, stamp(), 0.6),
    (S['spread'] + 48, error_buzz(), 0.55), (S['spread'] + 49, stamp(), 0.65),
    (S['spread'] + 70, error_buzz(), 0.6), (S['spread'] + 71, stamp(), 0.7), (S['spread'] + 71, sub_bass_impact(), 0.8),
    # 7 · el miedo
    (S['fear'] + 2, static_burst(0.3), 0.5),
    (S['fear'] + 40, sub_bass_impact(), 1.0), (S['fear'] + 40, slam(), 0.8),
] + [(S['fear'] + 40 + 22 * k, heartbeat(), 0.8) for k in range(2)] + [
    # 8 · cierre
    (S['loop'] + 6, sub_bass_impact(), 0.85), (S['loop'] + 58, sub_bass_impact(), 0.95), (S['loop'] + 58, slam(), 0.7),
    (S['loop'] + 104, slam(), 0.7), (S['loop'] + 105, ping(), 0.4),
    (S['loop'] + 58, stamp(), 0.6), (S['loop'] + 168, glitch_whoosh(), 0.45),
]

# firmas: la rotuladora en cada titular y el sombrero que cae en las transiciones
HEADS = [29, 60, 70, 105, 135, S['auction'] + 4, S['auction'] + 52, S['auction'] + 112, S['ireland'] + 4, S['viral'] + 4, S['viral'] + 114,
         S['police'] + 48, S['police'] + 126, S['spread'] + 4, S['fear'] + 2, S['fear'] + 40, S['loop'] + 6, S['loop'] + 58, S['loop'] + 104]
CUES += [(h + 1, dymo(), 0.35) for h in HEADS if h > 0]
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
# silencios dramáticos: antes de la revelación de la policía y antes de "el miedo fue real"
mus *= curve([(0, 1), (sec(S['police'] + 20), 1), (sec(S['police'] + 26), 0.15), (sec(S['police'] + 48), 0.15), (sec(S['police'] + 50), 1),
               (sec(S['fear'] + 32), 1), (sec(S['fear'] + 36), 0.05), (sec(S['fear'] + 40), 0.05), (sec(S['fear'] + 42), 1), (D - 0.3, 1), (D, 0.6)])
mus *= 1 - 0.45 * lp(hits, 8)  # la música se aparta en cada golpe
mx = mus * 0.55 + fx * 0.8
mx = np.tanh(mx * 1.2) / np.tanh(1.2)
mx /= np.abs(mx).max() * 1.05
os.makedirs('out/gato06', exist_ok=True)
with wave.open('out/gato06/mix-raw.wav', 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((mx.T * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/gato06/mix-raw.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', 'public/gato06/mix.wav'], check=True)
print('escrito public/gato06/mix.wav', round(D, 2), 's')
