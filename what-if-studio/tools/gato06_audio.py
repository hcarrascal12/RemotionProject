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


S = SCENES = dict(hook=0, auction=105, ireland=255, viral=390, police=525, spread=690, fear=840, loop=960)
CUES = [
    # 1 · gancho: golpe en el frame 0 + zoom de choque, sello, ráfaga de pruebas y la policía
    (0, sub_bass_impact(), 1.0), (0, glitch_whoosh(), 0.7), (0, static_burst(0.18), 0.45),
    (12, stamp(), 0.95), (12, slam(), 0.8), (12, sub_bass_impact(), 0.8),   # sello FALSO re-estampado
    (14, scratch(), 0.8), (18, scratch(), 0.6),                             # marcador rodea la cara
    (30, slam(), 0.75), (30, tick(), 0.5), (36, slam(), 0.75), (36, tick(), 0.5), (42, slam(), 0.8), (42, tick(), 0.5),  # ráfaga
    (70, sub_bass_impact(), 0.95), (70, alarm(), 0.45), (70, swipe(), 0.5),  # policía: luces y sirena
    (100, glitch_whoosh(), 0.6),
    # 2 · subasta
    (S['auction'] + 4, slam(), 0.5), (S['auction'] + 2, spin(36), 0.55),
    (S['auction'] + 40, sub_bass_impact(), 0.85), (S['auction'] + 40, slam(), 0.55),   # el disfraz real
    (S['auction'] + 60, counter_roll(40), 0.55), (S['auction'] + 100, clack(), 0.7),   # precio
    (S['auction'] + 108, sub_bass_impact(), 0.9), (S['auction'] + 110, error_buzz(), 0.35),  # «PESADILLA»
    # 3 · Irlanda
    (S['ireland'] - 4, glitch_whoosh(), 0.5), (S['ireland'] + 4, slam(), 0.5),
    (S['ireland'] + 34, stamp(), 0.7), (S['ireland'] + 34, ping(), 0.35),
    (S['ireland'] + 58, stamp(), 0.75), (S['ireland'] + 58, ping(), 0.35),
    (S['ireland'] + 80, tick(), 0.5),
] + [(S['viral'] + 3 + k * 9, tone(1400 + 140 * k, 0.12, 0.05), 0.35) for k in range(4)] + [
    # 4 · viral
    (S['viral'] + 4, slam(), 0.5),
    (S['viral'] + 52, counter_roll(34), 0.6), (S['viral'] + 86, sub_bass_impact(), 0.95), (S['viral'] + 86, clack(), 0.6),
    (S['viral'] + 100, swipe(), 0.5), (S['viral'] + 100, slam(), 0.6),
    # 5 · policía: silencio, barrido y golpe
    (S['police'] + 26, riser(22), 0.6),
    (S['police'] + 48, sub_bass_impact(), 1.0), (S['police'] + 48, slam(), 0.85), (S['police'] + 50, alarm(), 0.35),
    (S['police'] + 92, glitch_whoosh(), 0.5), (S['police'] + 92, slam(), 0.5),
    (S['police'] + 110, stamp(), 0.85), (S['police'] + 110, sub_bass_impact(), 0.7),     # FALSO
    (S['police'] + 126, tick(), 0.4),
    # 6 · no se detuvo
    (S['spread'] + 4, sub_bass_impact(), 0.85), (S['spread'] + 4, slam(), 0.6),
    (S['spread'] + 36, error_buzz(), 0.55), (S['spread'] + 37, stamp(), 0.6),
    (S['spread'] + 66, error_buzz(), 0.55), (S['spread'] + 67, stamp(), 0.65),
    (S['spread'] + 96, error_buzz(), 0.6), (S['spread'] + 97, stamp(), 0.7), (S['spread'] + 97, sub_bass_impact(), 0.8),
    # 7 · el miedo
    (S['fear'] + 2, static_burst(0.3), 0.5),
    (S['fear'] + 52, sub_bass_impact(), 1.0), (S['fear'] + 52, slam(), 0.8),
] + [(S['fear'] + 52 + 22 * k, heartbeat(), 0.8) for k in range(3)] + [
    # 8 · cierre
    (S['loop'] + 6, sub_bass_impact(), 0.85), (S['loop'] + 66, sub_bass_impact(), 0.95), (S['loop'] + 66, slam(), 0.7),
    (S['loop'] + 116, slam(), 0.7), (S['loop'] + 117, ping(), 0.4),
    (S['loop'] + 66, stamp(), 0.6), (S['loop'] + 162, glitch_whoosh(), 0.45),
]

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
               (sec(S['fear'] + 44), 1), (sec(S['fear'] + 48), 0.05), (sec(S['fear'] + 52), 0.05), (sec(S['fear'] + 54), 1), (D - 0.3, 1), (D, 0.6)])
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
