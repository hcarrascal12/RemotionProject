#!/usr/bin/env python3
"""Sonido de Fallo #05 · El oso polar de "Noviembre 2026": música original helada + efectos (+ voz si existe).

  python3 tools/polar05_audio.py   # escribe public/polar05/mix.wav, masterizado a -14 LUFS

Va sincronizado con los frames del vídeo (30 fps). Si existe public/polar05/voz.wav (o .mp3) la mezcla con ducking.
La música y los efectos se sintetizan aquí, así que no hay muestras de terceros ni licencias que gestionar.
"""
import os, subprocess, wave
import numpy as np
from scipy.signal import lfilter

SR = 48000
FPS = 30
D = 1223 / FPS  # duración del vídeo (sincronizado con la voz grabada)
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
    """Curva de ganancia a partir de puntos (segundo, ganancia), interpolada linealmente."""
    xs, ys = zip(*points)
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


def counter_roll(frames):
    """Contador digital: tics rápidos que se aceleran y suben de tono."""
    sec = frames / FPS; y = np.zeros(int(sec * SR) + SR // 10)
    tm, k = 0.0, 0
    while tm < sec:
        x = tone(2400 + 900 * (tm / sec), 0.018, 0.005) + hp(noise(0.018), 4000) * env(int(0.018 * SR), 0.0005, 0.003) * 0.3
        i = int(tm * SR); y[i:i + len(x)] += x[: len(y) - i]
        tm += 0.045 - 0.03 * (tm / sec); k += 1
    return y


def scratch():
    """Rotulador tachando: un trazo corto de ruido filtrado."""
    sec = 0.09; n = int(sec * SR); tt = np.arange(n) / SR
    return lp(hp(noise(sec), 1800), 6500) * np.sin(np.pi * tt / sec) * (0.7 + 0.3 * np.sin(2 * np.pi * 90 * tt))


def error_buzz():
    sec = 0.45; n = int(sec * SR); tt = np.arange(n) / SR
    sq = (np.sign(np.sin(2 * np.pi * 98 * tt)) + np.sign(np.sin(2 * np.pi * 103.8 * tt))) * 0.25
    return lp(sq, 2200) * np.minimum(1, (sec - tt) / 0.04)


# (frame global, sonido, ganancia). Mismos frames que las escenas (src/polar05/theme.ts).
CUES = [
    (2, glitch_whoosh(), 0.7), (2, static_burst(0.2), 0.4),                           # glitch…
    (8, sub_bass_impact(), 1.0), (8, slam(), 0.75),                                   # …y boom: "UN MEME DE 2023"
    (44, slam(), 0.7), (44, sub_bass_impact(), 0.6),                                  # "HABLA DE ESTE MES"
    (84, static_burst(0.2), 0.45), (89, swipe(), 0.6), (91, tone(880, 0.25, 0.12), 0.3),  # corte → el móvil
    (145, scratch(), 0.8), (147, tick(), 0.5),                                        # recuadro rojo: "y una frase en ruso"
    (205, sub_bass_impact(), 0.9), (205, slam(), 0.6),                                # «ESTE ES UN MEME DE NOVIEMBRE DE 2026»
    (341, glitch_whoosh(), 0.45), (347, counter_roll(42), 0.6), (389, clack(), 0.8),   # contador digital → 3,1 M
    (411, sub_bass_impact(), 0.85),                                                   # "NADIE SABE QUIÉN LA CREÓ"
    (455, tone(1200, 0.3, 0.2), 0.35), (461, slam(), 0.5),                            # agosto 2026: "ping" de vídeo nuevo
    (603, glitch_whoosh(), 0.55),                                                     # corte → las fechas
    (609, sub_bass_impact(), 0.7), (617, slam(), 0.55), (625, sub_bass_impact(), 0.7), (633, slam(), 0.55),  # 29.9.26 · #… · 18.9.26 · #…
    (622, riser(28), 0.55), (650, sub_bass_impact(), 0.9), (650, slam(), 0.6),         # SEPTIEMBRE
    (677, sub_bass_impact(), 0.8), (677, slam(), 0.6),                                # OCTUBRE
    (710, scratch(), 0.9), (714, scratch(), 0.7),                                     # "fueron pasando": se tachan
    (722, sub_bass_impact(), 0.85), (723, alarm(), 0.25),                             # "SIN QUE PASARA NADA"
] + [(647 + k, static_burst(0.1), 0.3) for k in range(0, 75, 15)] + [                 # cortes del montaje
    (756, glitch_whoosh(), 0.5),                                                      # corte → calendario
] + [(762 + round(k * 36 / 29), scratch(), 0.55) for k in range(29)] + [              # tachando los días del mes
    (774, slam(), 0.5), (800, sub_bass_impact(), 1.0), (800, slam(), 0.8), (802, alarm(), 0.3),  # "NOVIEMBRE SE ACABA"
    (841, sub_bass_impact(), 0.95), (841, error_buzz(), 0.6), (842, stamp(), 0.7),     # ✕ ningún anuncio
    (874, sub_bass_impact(), 0.95), (874, error_buzz(), 0.6), (875, stamp(), 0.7),     # ✕ ningún evento
    (909, sub_bass_impact(), 1.0), (909, error_buzz(), 0.65), (910, stamp(), 0.75),    # ✕ ningún autor
    (917, glitch_whoosh(), 0.55),                                                     # corte → el oso
    (973, slam(), 0.6), (1039, sub_bass_impact(), 0.85), (1096, sub_bass_impact(), 0.95),  # noviembre 2026 · ¿broma? · ¿sabía algo?
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

# ---------------------------------------------------------------- música original (La menor, 96 BPM)
BPM = 100
BEAT = 60 / BPM
BAR = 4 * BEAT
CHORDS = [(38, [62, 65, 69]), (46, [62, 65, 70]), (41, [60, 65, 69]), (45, [61, 64, 69])]  # Dm · Bb · F · A (más frío)


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
g_pad = curve([(0, 0.7), (20.2, 0.8), (25.3, 1.0), (27.15, 1.0), (27.65, 0.5), (30.7, 0.8), (D, 0.7)])
g_bass = curve([(0, 0.8), (11.5, 0.9), (20.2, 1.0), (27.15, 1.0), (27.65, 0.7), (30.7, 0.6), (D, 0.8)])
g_kick = curve([(0, 0.9), (3.1, 0.9), (11.5, 1.0), (27.15, 1.0), (27.65, 1.0), (30.7, 0.5), (D, 0.9)])
g_hat8 = curve([(0, 0), (3.0, 0), (3.1, 0.7), (27.15, 0.8), (27.65, 0), (30.7, 0), (30.8, 0.5), (D, 0)])
g_hat16 = curve([(0, 0), (20.1, 0), (20.2, 0.8), (25.3, 1.0), (27.15, 1.0), (27.65, 0), (D, 0)])
g_arp = curve([(0, 0), (11.4, 0), (11.5, 0.5), (20.2, 0.8), (25.3, 0.9), (27.15, 0.9), (27.65, 0), (30.7, 0), (30.8, 0.6), (D, 0.4)])
g_drone = curve([(0, 0), (27.65, 0), (27.7, 0.9), (30.7, 0.4), (D, 0)])


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


mono = (norm(bass) * 0.75 * g_bass + norm(kick) * 0.8 * g_kick + norm(hat8) * 0.18 * g_hat8 + norm(hat16) * 0.22 * g_hat16
        + norm(drone) * 0.35 * g_drone)
mus = np.stack([mono, mono]) + norm(pad) * 0.35 * g_pad + np.stack([norm(arp) * 0.22 * g_arp * 0.8, norm(arp) * 0.22 * g_arp])
# bombeo: la música respira con el bombo (sidechain)
pump = 1 - 0.35 * lp(np.abs(kick) * g_kick, 12) / (np.abs(kick).max() + 1e-9)
mus *= pump
# progresión: la música crece desde el gancho hasta el segundo 26 (riser incluido) …
mus *= curve([(0, 0.85), (11.5, 0.95), (20.2, 1.05), (25.3, 1.35), (27.15, 1.35), (27.65, 1.0), (D, 0.9)])
rise = np.zeros(N); r = riser(int(4.5 * FPS)); i0 = int(21.0 * SR); rise[i0:i0 + len(r)] = r[: N - i0]
mus += np.stack([rise, rise]) * 0.18
# … y corte seco de medio segundo justo antes de revelar los resultados (29,2 s)
mus *= curve([(0, 1), (27.13, 1), (27.15, 0), (27.63, 0), (27.65, 1), (D, 1)])
# la música se aparta un instante en cada corte para que mande el whoosh
for cut in (3.1, 11.5, 15.3, 20.23, 25.33, 30.7):
    mus *= 1 - 0.6 * np.exp(-((t - cut) / 0.12) ** 2)
mus *= np.clip(t / 0.02, 0, 1)

# ---------------------------------------------------------------- voz y mezcla
VOICE = next((p for p in ('public/polar05/voz.wav', 'public/polar05/voz.mp3') if os.path.exists(p)), None)
voice = np.zeros((2, N)); venv = np.zeros(N)
if VOICE:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', VOICE, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    vo = np.frombuffer(raw, dtype=np.float32).astype(np.float64).reshape(-1, 2).T[:, :N]
    voice[:, :vo.shape[1]] = vo
    voice = norm(voice)
    venv = lp(np.abs(voice).mean(0), 6); venv /= venv.max() + 1e-9
print('voz:', VOICE or 'ninguna (solo música y efectos)')
SONG = next((p for p in ('public/polar05/oso-canta.wav', 'public/polar05/oso-canta.mp3') if os.path.exists(p)), None)
song = np.zeros((2, N))
if SONG:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', SONG, '-t', '3.0', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    so = np.frombuffer(raw, dtype=np.float32).astype(np.float64).reshape(-1, 2).T
    i0 = int(17.4 * SR); n = min(so.shape[1], N - i0); song[:, i0:i0 + n] = norm(so)[:, :n]
print('canción del oso:', SONG or 'no hay (pon public/polar05/oso-canta.mp3)')
# la música baja un 50 % mientras canta el oso (23,4–26,1 s); solo si hay clip
if SONG:
    mus *= curve([(0, 1), (17.2, 1), (17.4, 0.5), (20.0, 0.5), (20.3, 1), (D, 1)])

duck_v = 1 - 0.5 * venv            # música y ambiente bajan cuando habla
duck_h = 1 - 0.4 * lp(hits, 8)     # y se apartan en los golpes
mx = norm(mus) * 0.34 * duck_v * duck_h + norm(fx) * 0.75 * (1 - 0.2 * venv) + voice * 1.0 + song * 0.85
# el corte seco es de TODO (música, efectos y colas): medio segundo de vacío antes de los resultados
mx *= curve([(0, 1), (27.11, 1), (27.15, 0), (27.63, 0), (27.65, 1), (D, 1)])
mx = np.tanh(mx * 1.25) / np.tanh(1.25)
mx /= np.abs(mx).max() * 1.05
os.makedirs('out/polar05', exist_ok=True)
with wave.open('out/polar05/mix-raw.wav', 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((mx.T * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/polar05/mix-raw.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', 'public/polar05/mix.wav'], check=True)
print('escrito public/polar05/mix.wav', round(D, 2), 's')
