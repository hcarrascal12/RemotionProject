#!/usr/bin/env python3
"""Sound for "Sin resolver, Caso Nº 02: Satoshi Nakamoto" (composition Satoshi02 in src/cicada01/Cicada01.tsx), no voice yet.

  python3 tools/satoshi02_audio.py      # writes public/cicada01/mix-s2.wav, mastered to -14 LUFS

Bed: the Suno track (public/cicada01/musica-suno.m4a) from 101 s: its quiet stretch lands on "y desapareció", its hit on the coins. On top, the effects on the
picture's clock: hits on the cuts, typewriter keys on every typed line, static, the tiles going dark, the "FOR NOW." hit,
a bell on the card. Black cuts drop to near silence for two frames.
"""
import os, subprocess, wave
import numpy as np
from scipy.signal import lfilter

SR = 48000
D = 40.0
N = int(D * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(2008)
L = np.zeros(N)
R = np.zeros(N)
MUSIC = 'public/cicada01/musica-suno.m4a'
MUSIC_FROM = 101.0


def add(x, at, gain=1.0, pan=0.0):
    i0 = int(at * SR)
    if i0 >= N or i0 < 0:
        return
    x = x[: N - i0]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i0:i0 + len(x)] += x * gain * l * 1.414
    R[i0:i0 + len(x)] += x * gain * r * 1.414


def lp(x, cut):
    a = np.exp(-2 * np.pi * cut / SR)
    return lfilter([1 - a], [1, -a], lfilter([1 - a], [1, -a], x))


def hit(sec=1.8, f0=55, f1=26):
    n = int(sec * SR); tt = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-tt / 0.2)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.7)
    crack = lp(rng.standard_normal(n), 1800) * np.exp(-tt / 0.04)
    tail = lp(rng.standard_normal(n), 300) * np.exp(-tt / 0.9) * 0.4
    return (body + crack + tail) * np.minimum(1, tt / 0.002)


def reverse_swell(sec=0.9):
    n = int(sec * SR); tt = np.arange(n) / SR
    return (lp(rng.standard_normal(n), 1400) * 0.6 + np.sin(2 * np.pi * 155.6 * tt) * 0.3) * (tt / sec) ** 3


def static(sec=0.12):
    n = int(sec * SR)
    return rng.standard_normal(n) * 0.8 * (rng.random(n // 200 + 1).repeat(200)[:n] > 0.3)


def scrape(sec=1.2, f=430):
    n = int(sec * SR); tt = np.arange(n) / SR
    y = rng.standard_normal(n) * 0.3
    d = int(SR / f)
    y = lfilter([1], np.r_[1, np.zeros(d - 1), -0.93], y)
    y /= np.abs(y).max() + 1e-9
    return y * np.sin(np.pi * tt / sec) ** 2 * 0.5


def shriek(sec=0.14):
    n = int(sec * SR); tt = np.arange(n) / SR
    f = 3200 - 1800 * tt / sec
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5 + rng.standard_normal(n) * 0.3) * np.sin(np.pi * tt / sec)


def key():
    n = int(0.05 * SR); tt = np.arange(n) / SR
    return (rng.standard_normal(n) * np.exp(-tt / 0.004) + 0.4 * np.sin(2 * np.pi * 900 * tt) * np.exp(-tt / 0.01)) * 0.6


def thud(f=140):
    n = int(0.4 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * f * tt * np.exp(-tt / 0.2)) * np.exp(-tt / 0.08)


def whoosh(sec=0.45):
    n = int(sec * SR); tt = np.arange(n) / SR
    return lp(rng.standard_normal(n), 900) * np.sin(np.pi * tt / sec) ** 2 * 0.8


def riser(sec=1.0):
    n = int(sec * SR); tt = np.arange(n) / SR
    f = 110 * (2 ** (3 * tt / sec))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 + lp(rng.standard_normal(n), 2000) * 0.5) * (tt / sec) ** 2


def pulse(f=330, sec=0.12):
    n = int(sec * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * f * tt) * np.minimum(1, tt / 0.004) * np.exp(-tt / 0.06) * 0.6


def bell(f=196, sec=4.0):
    n = int(sec * SR); tt = np.arange(n) / SR
    parts = [(1, 1), (2.76, 0.5), (5.4, 0.3), (8.93, 0.15), (1.5, 0.25)]
    return sum(a * np.sin(2 * np.pi * f * k * tt) * np.exp(-tt / (1.6 / k ** 0.5)) for k, a in parts) * 0.35


def typing(start, lines, cps, gain=0.38):
    """One key per typed character, at the picture's typing speed (two characters of pause between lines)."""
    pos = 0
    for l in lines:
        for ch in l:
            if ch != ' ':
                add(key(), start + pos / cps, gain + 0.08 * rng.random(), rng.uniform(-0.3, 0.3))
            pos += 1
        pos += 2


# hook: a fortune never touched
add(hit(2.0), 0.0, 1.0)
add(scrape(1.4, 410), 0.25, 0.3, -0.3)
# the paper
add(whoosh(), 3.25, 0.4)
typing(3.55, ['Bitcoin: A Peer-to-Peer'], 36, 0.3)
typing(4.25, ['Electronic Cash System'], 36, 0.3)
typing(5.0, ['Satoshi Nakamoto'], 30, 0.3)
add(hit(1.2, 80, 40), 5.6, 0.55)
add(thud(), 5.9, 0.45)
add(thud(), 6.4, 0.5)
# the genesis block
add(static(0.12), 7.6, 0.45)
add(hit(1.2, 60, 30), 7.6, 0.55)
typing(7.7, ['BLOQUE 0 · 03/01/2009'], 36, 0.25)
add(scrape(1.2, 620), 9.2, 0.35, 0.2)
add(reverse_swell(0.6), 9.4, 0.45)
add(hit(1.4, 58, 28), 10.0, 0.7)
add(thud(100), 10.3, 0.45)
typing(10.8, ['THE TIMES · 3 DE ENERO DE 2009'], 40, 0.2)
add(shriek(), 11.8, 0.3, 0.2)
# the e-mail, erased, and silence
typing(12.9, ['CORREO · 2011'], 40, 0.22)
typing(13.0, ['De: Satoshi Nakamoto'], 40, 0.3)
typing(13.3, ['Para: Mike Hearn'], 40, 0.3)
typing(13.6, ["I've moved on to other things."], 26, 0.4)
add(thud(), 14.4, 0.45)
for i in range(30):  # backspace
    add(key(), 15.3 + i / 40, 0.28)
add(reverse_swell(0.8), 15.6, 0.5)
add(hit(2.4, 46, 22), 16.4, 1.1)
# the coins
for i in range(26):  # the counter rolling up, accelerating
    add(key(), 17.8 + 1.8 * (i / 26) ** 0.6, 0.22, 0.2)
add(thud(90), 19.7, 0.5)
add(reverse_swell(0.6), 20.0, 0.45)
add(hit(1.8, 50, 24), 20.6, 0.9)
# the claims and the court
add(hit(1.2, 60, 30), 22.4, 0.55)
add(thud(), 22.6, 0.45)
add(hit(2.0, 48, 24), 25.0, 1.0)
add(scrape(1.6, 300), 25.1, 0.3, 0.3)
typing(25.4, ['TRIBUNAL SUPERIOR · LONDRES · 2024'], 36, 0.25)
add(thud(100), 26.2, 0.45)
add(shriek(), 27.6, 0.3, -0.2)
# the proof nobody gave
typing(28.2, ['> mover 1 BTC'], 30, 0.32)
typing(28.8, ['  desde la dirección de Satoshi'], 40, 0.25)
typing(29.5, ['> firma requerida…'], 30, 0.32)
add(thud(), 28.4, 0.45)
add(thud(), 29.0, 0.45)
for at in (29.8, 30.13, 30.47, 30.8, 31.13):
    add(pulse(330), at, 0.45)
add(riser(0.8), 30.8, 0.55)
add(hit(2.8, 48, 22), 31.6, 1.25)
# who is Satoshi?
add(hit(1.6, 55, 28), 33.7, 0.8)
add(hit(2.0, 48, 24), 34.2, 0.95)
typing(34.8, ['DIME TU TEORÍA ↓'], 30, 0.3)
add(bell(196), 35.6, 0.55)
add(thud(70), 35.6, 0.6)
add(riser(1.0), 39.0, 0.45)

# --- the animated pass: whips, face scan, marker, scan line, TV-off, coin spin and rain, padlock, cards, progress ---
def zap(sec=0.35):
    n = int(sec * SR); tt = np.arange(n) / SR
    f = 2400 * np.exp(-tt / 0.08) + 60
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.12) * 0.6


def ting(f=2600):
    n = int(0.25 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 2.76 * tt)) * np.exp(-tt / 0.06) * 0.25


for w_ in (3.4, 12.8, 17.6, 22.4, 28.0, 33.6):
    add(whoosh(0.32), w_ - 0.08, 0.5, -0.4 if w_ % 2 else 0.4)
for k_ in range(6):  # face scan beeps, then the verdict
    add(pulse(880, 0.06), 0.2 + k_ * 0.22, 0.35)
    add(pulse(880, 0.06), 33.9 + k_ * 0.22, 0.3)
add(pulse(220, 0.35), 1.55, 0.55)
add(pulse(220, 0.35), 35.15, 0.5)
add(paper(0.4) if 'paper' in dir() else whoosh(0.4), 5.15, 0.3)
add(scrape(1.3, 700), 7.8, 0.25)
add(whoosh(0.45), 9.6, 0.35)
for k_ in range(5):
    add(pulse(1320, 0.05), 10.0 + k_ * 0.16, 0.3)
add(zap(), 15.9, 0.6)
add(static(0.2), 16.4, 0.35)
for k_ in range(14):  # the coin spinning down
    add(key(), 17.65 + 1.1 * (k_ / 14) ** 0.5, 0.25, 0.3)
for i in range(16):
    add(ting(2200 + 400 * rng.random()), 17.75 + i * 0.12, 0.25, rng.uniform(-0.6, 0.6))
add(pulse(1800, 0.05), 20.45, 0.6)
add(thud(160), 20.47, 0.6)
for at in (22.8, 23.2, 23.6):
    add(whoosh(0.3), at - 0.05, 0.35, 0.5)
for at in (24.2, 24.5):
    add(thud(110), at, 0.5)
for k_ in range(6):
    add(pulse(660, 0.07), 29.8 + k_ * 0.3, 0.3)

# the 3D block: a rising hum while it turns, a hit on the flash
add(riser(1.5), 7.7, 0.5)
add(hit(1.6, 52, 26), 9.2, 0.8)
add(static(0.08), 9.2, 0.3)

fx = np.stack([L, R])
fx /= np.abs(fx).max() + 1e-9
raw_m = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(MUSIC_FROM), '-t', f'{D:.2f}', '-i', MUSIC, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                       capture_output=True, check=True).stdout
mu = np.frombuffer(raw_m, dtype=np.float32).astype(np.float64).reshape(-1, 2).T[:, :N]
mu = np.pad(mu, ((0, 0), (0, N - mu.shape[1])))
mu *= np.clip(t / 0.25, 0, 1) * np.clip((D - t) / 1.0, 0, 1)
mu /= np.abs(mu).max() + 1e-9
mx = mu * 0.85 + fx * 0.6
for at in ():  # no black cuts: the scenes change with whip pans
    i0, i1 = int(at * SR), int((at + 2 / 30) * SR)
    mx[:, i0:i1] *= 0.08
mx = np.tanh(mx * 1.4) / np.tanh(1.4)
mx /= np.abs(mx).max() * 1.05
os.makedirs('out/cicada01', exist_ok=True)
raw = 'out/cicada01/raw-s2.wav'
with wave.open(raw, 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((mx.T * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', 'public/cicada01/mix-s2.wav'], check=True)
print('wrote public/cicada01/mix-s2.wav')
