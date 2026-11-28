#!/usr/bin/env python3
"""Sonido de Fallo #04 · Max Headroom: música original de sintetizador (estilo 1987) + efectos + voz.

  python3 tools/audio.py      # escribe public/audio/mix.wav, masterizado a -14 LUFS

Todo va sincronizado con la voz (public/audio/voz.mp3, 34,9 s) y con los frames del vídeo (30 fps).
La música y los efectos se sintetizan aquí, así que no hay muestras de terceros ni licencias que gestionar.
"""
import os, subprocess, wave
import numpy as np
from scipy.signal import lfilter

SR = 48000
FPS = 30
D = 1159 / FPS  # duración del vídeo
SHIFT_F = 34  # la cita del personaje alarga la escena 4: todo lo que viene después se corre 34 frames
SHIFT_S = SHIFT_F / FPS
N = int(D * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(1987)
os.chdir(os.path.join(os.path.dirname(__file__), '..'))


# ---------------------------------------------------------------- utilidades
def lp(x, cut):
    a = np.exp(-2 * np.pi * cut / SR)
    return lfilter([1 - a], [1, -a], lfilter([1 - a], [1, -a], x))


def hp(x, cut):
    return x - lp(x, cut)


def env(n, att=0.002, dec=0.2):
    tt = np.arange(n) / SR
    return np.minimum(1, tt / att) * np.exp(-tt / dec)


def tone(f, sec, dec=0.1):
    n = int(sec * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * f * tt) * env(n, 0.002, dec)


def sweep(f0, f1, sec):
    n = int(sec * SR); tt = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (tt / sec)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def noise(sec):
    return rng.standard_normal(int(sec * SR))


def curve(points):
    """Curva de ganancia a partir de puntos (segundo, ganancia), interpolada linealmente.
    Los puntos se escriben con los tiempos de la voz original; los posteriores a la cita se corren SHIFT_S."""
    pts = [(x + SHIFT_S if 25.3 <= x < 37.4 else (D if x >= 37.4 else x), y) for x, y in points]
    xs, ys = zip(*pts)
    return np.interp(t, xs, ys)


def saw(freq, sec_or_n):
    n = sec_or_n if isinstance(sec_or_n, int) else int(sec_or_n * SR)
    ph = (np.arange(n) / SR * freq) % 1.0
    return 2 * ph - 1


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------------------------------------------------------------- efectos
def sub_bass_impact():
    n = int(1.6 * SR); tt = np.arange(n) / SR
    f = 30 + 70 * np.exp(-tt / 0.08)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.6) + lp(noise(1.6), 2500) * np.exp(-tt / 0.012) * 0.8


def glitch_whoosh():
    sec = 0.4; n = int(sec * SR); tt = np.arange(n) / SR
    w = hp(lp(noise(sec), 5000), 400) * np.sin(np.pi * tt / sec) ** 2
    gate = np.repeat(rng.random(n // 480 + 1) > 0.35, 480)[:n]
    bits = np.sign(np.sin(2 * np.pi * np.repeat(rng.uniform(300, 2400, n // 960 + 1), 960)[:n] * tt)) * 0.15
    return w * (0.5 + 0.5 * gate) + bits * gate * np.sin(np.pi * tt / sec)


def slam():
    n = int(0.5 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * 70 * tt) * np.exp(-tt / 0.07) + hp(noise(0.5), 800) * np.exp(-tt / 0.02) * 0.9


def static_burst(sec=0.35):
    n = int(sec * SR); tt = np.arange(n) / SR
    s = hp(noise(sec), 300)
    crackle = (rng.random(n) > 0.997) * rng.uniform(-3, 3, n)
    gate = np.repeat(rng.random(n // 240 + 1) > 0.25, 240)[:n]
    return (s * (0.6 + 0.4 * gate) + crackle) * np.minimum(1, tt / 0.005) * np.minimum(1, (sec - tt) / 0.04)


def tv_hum(sec):
    n = int(sec * SR); tt = np.arange(n) / SR
    h = sum(np.sin(2 * np.pi * 60 * k * tt) / k for k in (1, 2, 3, 5)) * 0.5 + np.sin(2 * np.pi * 15734 / 4 * tt) * 0.05
    return h * np.minimum(1, tt / 0.3) * np.minimum(1, (sec - tt) / 0.3)


def crt_off():
    sec = 0.7; n = int(sec * SR); tt = np.arange(n) / SR
    whine = sweep(9000, 600, sec) * np.exp(-tt / 0.25) * 0.35
    pop = np.sin(2 * np.pi * 90 * tt) * np.exp(-tt / 0.05) + hp(noise(sec), 1000) * np.exp(-tt / 0.01) * 0.6
    return whine + pop


def crt_on():
    sec = 0.6; n = int(sec * SR); tt = np.arange(n) / SR
    thunk = np.sin(2 * np.pi * 55 * tt) * np.exp(-tt / 0.12)
    whine = sweep(2000, 15000, sec) * np.minimum(1, tt / 0.2) * np.exp(-tt / 0.4) * 0.15
    return thunk + whine + hp(noise(sec), 2000) * np.exp(-tt / 0.03) * 0.3


def flip_roll(frames):
    sec = frames / FPS + 0.05; y = np.zeros(int(sec * SR))
    k, tm = 0, 0.0
    while tm < frames / FPS:
        x = tone(1800 + 500 * (k % 3), 0.025, 0.007) + hp(noise(0.025), 2500) * env(int(0.025 * SR), 0.0005, 0.004) * 0.4
        i = int(tm * SR); y[i:i + len(x)] += x[: len(y) - i]
        tm += 0.025 + 0.05 * (tm / (frames / FPS)) ** 2; k += 1
    return y


def clack():
    n = int(0.25 * SR); tt = np.arange(n) / SR
    return hp(noise(0.25), 1500) * np.exp(-tt / 0.01) + np.sin(2 * np.pi * 300 * tt) * np.exp(-tt / 0.03) * 0.6


def tick():
    return tone(1600, 0.05, 0.015) + hp(noise(0.05), 2000) * env(int(0.05 * SR), 0.0005, 0.006) * 0.5


def swipe():
    sec = 0.3; n = int(sec * SR); tt = np.arange(n) / SR
    return lp(hp(noise(sec), 1500), 7000) * np.sin(np.pi * tt / sec) * 0.7


def spin(frames=24):
    sec = frames / FPS; n = int(sec * SR); tt = np.arange(n) / SR
    w = lp(hp(noise(sec), 300), 3000) * (0.5 + 0.5 * np.sin(2 * np.pi * (4 + 10 * tt / sec) * tt))
    return w * np.sin(np.pi * tt / sec) ** 1.5


def alarm():
    sec = 0.6; n = int(sec * SR); tt = np.arange(n) / SR
    s = (np.sign(np.sin(2 * np.pi * 880 * tt)) * 0.3 + np.sin(2 * np.pi * 440 * tt) * 0.4) * (np.sin(2 * np.pi * 8 * tt) > 0)
    return lp(s, 3000) * np.minimum(1, (sec - tt) / 0.05)


def ping():
    n = int(0.9 * SR); tt = np.arange(n) / SR
    p = np.sin(2 * np.pi * 1320 * tt) * np.exp(-tt / 0.12)
    return p + np.roll(p, int(0.18 * SR)) * 0.35 + np.roll(p, int(0.36 * SR)) * 0.12


def riser(frames):
    sec = frames / FPS; n = int(sec * SR); tt = np.arange(n) / SR
    return (sweep(150, 2400, sec) * 0.35 + hp(noise(sec), 2000) * 0.5) * (tt / sec) ** 2.5


def stamp():
    n = int(1.0 * SR); tt = np.arange(n) / SR
    wood = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) for f, d in ((160, 0.12), (390, 0.06), (900, 0.03)))
    return wood + hp(noise(1.0), 900) * np.exp(-tt / 0.012) + np.sin(2 * np.pi * 45 * tt) * np.exp(-tt / 0.4) * 0.9


def decode():
    y = sub_bass_impact() * 0.5
    y[: int(0.25 * SR)] += sweep(300, 2400, 0.25) * 0.25 * env(int(0.25 * SR), 0.01, 0.2)
    return y


# (frame global, sonido, ganancia). Los frames coinciden con el vídeo y con la voz.
CUES = [
    (4, sub_bass_impact(), 1.0), (4, static_burst(0.25), 0.35),                    # "Un hombre con una máscara…"
    (97, slam(), 0.75),                                                             # "Su voz…"
    (148, sub_bass_impact(), 0.85), (150, alarm(), 0.35),                           # "Su cara, jamás"
    (198, glitch_whoosh(), 0.5), (206, decode(), 0.6),                              # 22 de noviembre de 1987
    (290, tick(), 0.55), (292, swipe(), 0.45),                                      # tarjeta WGN-TV · 9 PM
    (380, crt_off(), 0.75), (382, static_burst(0.3), 0.5),                          # "se va a negro"
    (400, static_burst(0.45), 0.85), (404, sub_bass_impact(), 0.8),                 # "y aparece él"
    (404, tv_hum(218 / FPS), 0.18), (410, spin(24), 0.45),                          # la tele con la máscara, giro 360º
    (492, static_burst(0.2), 0.6), (498, flip_roll(46), 0.5), (546, clack(), 0.7),  # +2 horas, reloj 21:14 → 23:15
    (558, static_burst(0.2), 0.6), (564, flip_roll(14), 0.45),                      # "esta vez 90 segundos"
    (604, static_burst(0.15), 0.5),
    (618, glitch_whoosh(), 0.5), (622, slam(), 0.7),                                # Tribune Tower
    (770, crt_on(), 0.5), (772, crt_off(), 0.7), (792, tone(1000, 0.4, 0.25), 0.25),  # la intrusión se corta, vuelve la emisión
    (834, glitch_whoosh(), 0.4), (854, slam(), 0.7), (878, slam(), 0.7),            # FBI / FCC
    (902, ping(), 0.35), (912, ping(), 0.3), (922, ping(), 0.3), (902, riser(28), 0.55),  # rastreo
    (930, sub_bass_impact(), 1.0), (931, alarm(), 0.35), (932, static_burst(0.3), 0.5),  # "Nunca lo encontraron"
    (951, stamp(), 1.0),                                                            # sello CASO ABIERTO
    (968, glitch_whoosh(), 0.7), (972, static_burst(0.5), 0.55), (980, decode(), 0.55),  # glitch final + pregunta
]
CUES = [(fr + SHIFT_F if fr >= 760 else fr, x, g) for fr, x, g in CUES]
# la cita del personaje suena "a través de la tele": zumbido de tubo y estática al entrar y salir (frames finales)
CUES += [(690, tv_hum(3.7), 0.22), (689, static_burst(0.18), 0.45), (800, static_burst(0.25), 0.45)]

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

# ---------------------------------------------------------------- música original (La menor, 96 BPM)
BPM = 96
BEAT = 60 / BPM
BAR = 4 * BEAT
CHORDS = [(45, [57, 60, 64]), (41, [57, 60, 65]), (38, [57, 62, 65]), (40, [56, 59, 64])]  # Am · F · Dm · E


def chord_at(sec):
    return CHORDS[int(sec // (2 * BAR)) % len(CHORDS)]


# pad: sierras desafinadas por acorde, filtradas y con fundido entre acordes
pad = np.zeros((2, N))
seg = int(2 * BAR * SR)
for s0 in range(0, N, seg):
    n = min(seg, N - s0)
    _, notes = chord_at(s0 / SR)
    tt = np.arange(n) / SR
    fade = np.minimum(1, tt / 0.6) * np.minimum(1, (n / SR - tt) / 0.4)
    for side, det in ((0, -0.12), (1, 0.12)):
        v = sum(saw(mtof(m + det), n) + saw(mtof(m - 12 + det * 0.5), n) * 0.6 for m in notes)
        pad[side, s0:s0 + n] += lp(v, 900) * fade
# bajo: corcheas pulsantes sobre la raíz
bass = np.zeros(N)
step = BEAT / 2
for k in range(int(D / step) + 1):
    s = k * step; i0 = int(s * SR)
    root, _ = chord_at(s)
    n = int(step * SR); tt = np.arange(n) / SR
    note = (np.sin(2 * np.pi * mtof(root - 12) * tt) * 0.9 + lp(saw(mtof(root), n), 400) * 0.6) * np.exp(-tt / 0.22) * np.minimum(1, tt / 0.004)
    bass[i0:i0 + n] += note[: N - i0]
# arpegio: semicorcheas por las notas del acorde, con eco
arp = np.zeros(N)
step = BEAT / 4
for k in range(int(D / step) + 1):
    s = k * step; i0 = int(s * SR)
    _, notes = chord_at(s)
    m = notes[k % 3] + 12 * (1 + (k // 3) % 2)
    n = int(0.12 * SR); tt = np.arange(n) / SR
    v = lp(np.sign(np.sin(2 * np.pi * mtof(m) * tt)), 2600) * np.exp(-tt / 0.06)
    arp[i0:i0 + n] += v[: N - i0]
arp = arp + np.roll(arp, int(0.75 * BEAT * SR)) * 0.4 + np.roll(arp, int(1.5 * BEAT * SR)) * 0.15
# batería: bombo en cada pulso, charles en corcheas y semicorcheas
kick = np.zeros(N); hat8 = np.zeros(N); hat16 = np.zeros(N)
kn = int(0.35 * SR); kt = np.arange(kn) / SR
K = np.sin(2 * np.pi * np.cumsum(45 + 90 * np.exp(-kt / 0.04)) / SR) * np.exp(-kt / 0.18)
H = hp(noise(0.05), 7000) * np.exp(-np.arange(int(0.05 * SR)) / SR / 0.012)
for k in range(int(D / BEAT) + 1):
    i0 = int(k * BEAT * SR); kick[i0:i0 + kn] += K[: N - i0]
for k in range(int(D / (BEAT / 4)) + 1):
    i0 = int(k * BEAT / 4 * SR)
    if k % 2 == 1:
        hat8[i0:i0 + len(H)] += H[: N - i0]
    hat16[i0:i0 + len(H)] += H[: N - i0] * (0.5 + 0.5 * (k % 2))
# dron grave para después del "nunca"
drone = np.sin(2 * np.pi * 55 * t) * 0.8 + lp(noise(D)[:N], 200) * 0.6

# arreglo: qué suena en cada tramo de la voz
g_pad = curve([(0, 0.85), (12.5, 0.85), (12.7, 0), (13.5, 0), (13.6, 0.75), (31.0, 0.75), (31.05, 0), (32.3, 0), (32.6, 0.7), (D, 0.85)])
g_bass = curve([(0, 1), (6.8, 1), (6.85, 0.9), (12.6, 0.9), (12.7, 0), (13.5, 0), (13.55, 1), (23.0, 1), (23.3, 0.25), (25.8, 0.25), (26.3, 1), (31.0, 1), (31.05, 0), (32.4, 0), (32.6, 0.5), (D, 0.5)])
g_kick = curve([(0, 1), (6.8, 1), (6.85, 0.9), (12.6, 0.9), (12.7, 0), (13.5, 0), (13.55, 1), (23.0, 1), (23.2, 0), (26.3, 0), (26.4, 1), (31.0, 1), (31.05, 0), (D, 0)])
g_hat8 = curve([(0, 0.8), (6.8, 0.8), (6.85, 0.6), (12.6, 0.6), (12.7, 0), (13.5, 0), (13.55, 0.8), (23.0, 0.8), (23.2, 0), (26.4, 0), (26.5, 0.8), (27.9, 0.8), (28.0, 0), (D, 0)])
g_hat16 = curve([(0, 0.6), (6.8, 0.6), (6.85, 0), (27.9, 0), (28.0, 1), (31.0, 1), (31.05, 0), (D, 0)])
g_arp = curve([(0, 0.75), (6.8, 0.75), (6.85, 0.5), (12.6, 0.5), (12.7, 0), (13.5, 0), (13.55, 0.7), (20.7, 0.7), (23.0, 0.35), (25.8, 0.35), (26.3, 0.7), (31.0, 0.7), (31.05, 0), (32.5, 0), (32.7, 0.45), (D, 0.45)])
g_drone = curve([(0, 0), (31.0, 0), (31.05, 1), (32.5, 0.6), (D, 0.25)])


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


mono = (norm(bass) * 0.75 * g_bass + norm(kick) * 0.8 * g_kick + norm(hat8) * 0.18 * g_hat8 + norm(hat16) * 0.22 * g_hat16
        + norm(drone) * 0.35 * g_drone)
mus = np.stack([mono, mono]) + norm(pad) * 0.35 * g_pad + np.stack([norm(arp) * 0.22 * g_arp * 0.8, norm(arp) * 0.22 * g_arp])
# bombeo: la música respira con el bombo (sidechain)
pump = 1 - 0.35 * lp(np.abs(kick) * g_kick, 12) / (np.abs(kick).max() + 1e-9)
mus *= pump
mus *= curve([(0, 1.4), (6.6, 1.4), (6.9, 1.0), (D, 1.0)])  # gancho intenso desde el primer segundo
mus *= np.clip(t / 0.02, 0, 1)

# ---------------------------------------------------------------- voz y mezcla
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'public/audio/voz-final.wav', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(raw, dtype=np.float32).astype(np.float64).reshape(-1, 2).T[:, :N]
voice = np.zeros((2, N)); voice[:, :vo.shape[1]] = vo
voice = norm(voice)
venv = lp(np.abs(voice).mean(0), 6); venv /= venv.max() + 1e-9

duck_v = 1 - 0.5 * venv            # música y ambiente bajan cuando habla
duck_h = 1 - 0.4 * lp(hits, 8)     # y se apartan en los golpes
mx = norm(mus) * 0.42 * duck_v * duck_h + norm(fx) * 0.75 * (1 - 0.2 * venv) + voice * 1.0
mx = np.tanh(mx * 1.25) / np.tanh(1.25)
mx /= np.abs(mx).max() * 1.05
os.makedirs('out', exist_ok=True)
with wave.open('out/mix-raw.wav', 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((mx.T * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/mix-raw.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', 'public/audio/mix.wav'], check=True)
print('escrito public/audio/mix.wav', round(D, 2), 's')
