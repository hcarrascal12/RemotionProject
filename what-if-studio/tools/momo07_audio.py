#!/usr/bin/env python3
"""Sonido del Caso Nº 05 · Momo (estándar del Caso Nº 04) · El Gato con Sombrero (con voz): la pista de Suno de Satoshi + efectos sintetizados.

  python3 tools/momo07_audio.py   # escribe public/momo07/mix.wav, masterizado a -14 LUFS

Los efectos (golpes, whooshes, contador, sellos…) se reutilizan de tools/polar05_audio.py y van en los mismos
frames que las escenas de src/momo07/theme.ts.
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


S = SCENES = dict(hook=0, chat=156, rumor=296, panic=414, hoax=591, sculpt=762, trash=965, loop=1051)
def buzz():
    """Vibración de móvil: zumbido grave entrecortado."""
    n = int(0.5 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * 150 * tt) * (np.sin(2 * np.pi * 18 * tt) > 0) * np.exp(-tt / 0.6)
def notif():
    """Aviso de mensaje: dos notas rápidas."""
    return np.concatenate([tone(1320, 0.08, 0.03), np.zeros(int(0.03 * SR)), tone(1760, 0.12, 0.05)])
CUES = [
    # 1 · gancho: tono de videollamada + vibración, se contesta sola, corte con golpe
] + [(i * 12, notif(), 0.5) for i in range(3)] + [(0, buzz(), 0.7), (12, buzz(), 0.6), (24, buzz(), 0.5),
    (0, sub_bass_impact(), 0.7), (2, slam(), 0.6),
    (38, swipe(), 0.5), (46, sub_bass_impact(), 1.0), (46, slam(), 0.95), (46, static_burst(0.25), 0.55), (47, glitch_whoosh(), 0.5),
    (54, slam(), 0.55), (119, sub_bass_impact(), 0.85), (119, slam(), 0.6),
    # 2 · chat
    (S['chat'] + 3, slam(), 0.5), (S['chat'] + 76, stamp(), 0.6), (S['chat'] + 101, stamp(), 0.65),
    (S['chat'] + 118, stamp(), 0.85), (S['chat'] + 118, sub_bass_impact(), 0.75),
    # 3 · rumor
] + [(S['rumor'] + 8 + i * 13, notif(), 0.4) for i in range(4)] + [(S['rumor'] + 58, slam(), 0.5),
    (S['rumor'] + 6, static_burst(0.3), 0.35), (S['rumor'] + 8, sub_bass_impact(), 0.65),
    # 4 · pánico: mapa con alertas, Kim, pregunta en silencio
    (S['panic'] + 2, sub_bass_impact(), 0.85), (S['panic'] + 2, slam(), 0.65), (S['panic'] + 2, swipe(), 0.4),
] + [(S['panic'] + t, error_buzz(), 0.35) for t in (6, 11, 16, 22, 34, 40, 45, 50, 58)] + [
    (S['panic'] + 95, slam(), 0.6), (S['panic'] + 95, ping(), 0.35),
    # 5 · bulo: interferencia, golpe con el cero, pista
    (S['hoax'], glitch_whoosh(), 0.55), (S['hoax'] + 4, stamp(), 0.5), (S['hoax'] + 14, stamp(), 0.5), (S['hoax'] + 24, stamp(), 0.5), (S['hoax'] + 34, stamp(), 0.55), (S['hoax'] + 52, sub_bass_impact(), 1.0), (S['hoax'] + 52, slam(), 0.9), (S['hoax'] + 52, static_burst(0.2), 0.45),
    (S['hoax'] + 108, swipe(), 0.5), (S['hoax'] + 118, glitch_whoosh(), 0.4), (S['hoax'] + 118, slam(), 0.5),
    # 6 · escultura → la banda FALSO
    (S['sculpt'] + 4, slam(), 0.5), (S['sculpt'] + 4, sub_bass_impact(), 0.75), (S['sculpt'] + 82, slam(), 0.7), (S['sculpt'] + 82, sub_bass_impact(), 0.8), (S['sculpt'] + 82, swipe(), 0.4),
    (S['sculpt'] + 162, swipe(), 0.6), (S['sculpt'] + 164, stamp(), 1.0), (S['sculpt'] + 164, sub_bass_impact(), 1.0), (S['sculpt'] + 170, slam(), 0.8),
    # 7 · basura
    (S['trash'] + 3, slam(), 0.5), (S['trash'] + 52, slam(), 0.55), (S['trash'] + 52, sub_bass_impact(), 0.6), (S['trash'] + 70, glitch_whoosh(), 0.45),
    # 8 · cierre
    (S['loop'] + 2, sub_bass_impact(), 0.8), (S['loop'] + 2, slam(), 0.6),
]
HEADS = [2, 54, 119, S['chat'] + 3, S['rumor'] + 14, S['rumor'] + 58, S['panic'] + 2, S['panic'] + 95, S['hoax'] + 2, S['hoax'] + 54, S['hoax'] + 118, S['sculpt'] + 4, S['sculpt'] + 112, S['trash'] + 3, S['trash'] + 52]
CUES += [(h + 1, dymo(), 0.3) for h in HEADS]
CUES += [(S[k] - 8, hat_drop(), 0.85) for k in ('chat', 'sculpt')]

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
# silencio antes del golpe de "nadie confirmó un solo caso" y antes de la escultura
mus *= curve([(0, 1), (sec(S['hoax']) - 0.5, 1), (sec(S['hoax']) - 0.2, 0.25), (sec(S['hoax']), 0.0), (sec(S['hoax'] + 12), 0.0), (sec(S['hoax'] + 13), 1),
               (sec(S['sculpt'] + 156), 1), (sec(S['sculpt'] + 160), 0.1), (sec(S['sculpt'] + 164), 0.1), (sec(S['sculpt'] + 166), 1), (sec(S['loop']) - 0.2, 1), (sec(S['loop']) + 0.2, 0.0), (D, 0.0)])
# voz (tools/gato06_voz.py): la música y los efectos se apartan cuando habla
voice = np.zeros((2, N)); venv = np.zeros(N)
if os.path.exists('public/momo07/voz.wav'):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'public/momo07/voz.wav', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    vo = np.frombuffer(raw, dtype=np.float32).astype(np.float64).reshape(-1, 2).T[:, :N]
    voice[:, :vo.shape[1]] = vo / (np.abs(vo).max() + 1e-9)
    venv = lp(np.abs(voice).mean(0), 6); venv /= venv.max() + 1e-9
print('voz:', 'public/momo07/voz.wav' if venv.any() else 'ninguna')
# tramo denso (subasta → avistamientos → 14 M): la música 3 dB más baja para que la voz no compita
# (sin tramo denso hasta que haya voz)
mus *= (1 - 0.45 * lp(hits, 8)) * (1 - 0.65 * venv)
mx = mus * 0.4 + fx * 0.7 * (1 - 0.25 * venv) + voice * 1.0
mx = np.tanh(mx * 1.2) / np.tanh(1.2)
mx /= np.abs(mx).max() * 1.05
os.makedirs('out/momo07', exist_ok=True)
with wave.open('out/momo07/mix-raw.wav', 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((mx.T * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/momo07/mix-raw.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', 'public/momo07/mix.wav'], check=True)
print('escrito public/momo07/mix.wav', round(D, 2), 's')
