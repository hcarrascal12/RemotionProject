#!/usr/bin/env python3
"""Sound for "Sin resolver #01, Parte 2" (composition Cicada01P2 in src/cicada01/Cicada01.tsx), no voice yet.

  python3 tools/cicada02_audio.py      # writes public/cicada01/mix-p2.wav, mastered to -14 LUFS

Bed: the Suno track (public/cicada01/musica-suno.m4a) from 66 s, where Part 1's bed ends. On top, the effects on the
picture's clock: hits on the cuts, typewriter keys on every typed line, static, the tiles going dark, the "FOR NOW." hit,
a bell on the card. Black cuts drop to near silence for two frames.
"""
import os, subprocess, wave
import numpy as np
from scipy.signal import lfilter

SR = 48000
D = 36.0
N = int(D * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(2012)
L = np.zeros(N)
R = np.zeros(N)
MUSIC = 'public/cicada01/musica-suno.m4a'
MUSIC_FROM = 66.0


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


# hook: where did this QR lead?
add(hit(2.0), 0.0, 1.0)
add(scrape(1.4, 410), 0.25, 0.3, -0.3)
# "everywhere"
add(whoosh(), 2.85, 0.4)
typing(3.05, ['EL QR LLEVABA A UNA IMAGEN:'], 40, 0.25)
add(hit(1.4, 70, 35), 3.2, 0.55)
add(thud(), 4.6, 0.45)
add(thud(), 4.8, 0.45)
# the hidden message: "you've shared too much"
add(static(0.12), 6.6, 0.45)
add(hit(1.2, 60, 30), 6.6, 0.6)
LH = ["YOU'VE SHARED TOO", 'MUCH TO THIS POINT.', 'WE WANT THE BEST,', 'NOT THE FOLLOWERS.']
typing(6.8, LH, 30)
es = 6.6 + 0.2 + sum(len(l) + 2 for l in LH) / 30 + 0.25
add(thud(100), es, 0.5)
add(thud(100), es + 0.2, 0.45)
add(shriek(), 10.9, 0.3, 0.2)
# only the first few: the wall goes dark tile by tile
typing(11.7, ['«THE FIRST FEW… WILL RECEIVE THE PRIZE»'], 45, 0.2)
for i in range(12):
    add(static(0.03), 11.9 + i * 0.13, 0.25, -0.6 + 0.1 * i)
    add(thud(220), 11.9 + i * 0.13, 0.18)
add(thud(), 12.0, 0.45)
add(hit(1.4, 58, 28), 12.6, 0.65)
add(reverse_swell(0.8), 12.6, 0.4)
add(hit(1.0, 80, 45), 13.4, 0.4)
# the Tor site
add(static(0.12), 15.2, 0.45)
add(hit(1.2, 60, 30), 15.2, 0.55)
typing(15.35, ['> conectando a tor…'], 40, 0.3)
typing(15.9, ['> sq6wmgv2zcsrix6t.onion'], 40, 0.3)
typing(16.6, ['> mensaje único · cifrado RSA'], 40, 0.3)
typing(17.2, ['> «you are not to collaborate»'], 40, 0.3)
for at in (16.0, 16.15, 16.3):
    add(pulse(330), at, 0.5)
add(thud(), 16.9, 0.45)
add(reverse_swell(0.7), 17.2, 0.5)
add(hit(2.0, 50, 24), 17.9, 0.95)
# the invitation
add(thud(), 19.6, 0.45)
add(thud(), 19.9, 0.45)
add(hit(1.6, 55, 28), 20.8, 0.7)
add(scrape(1.6, 300), 21.0, 0.3, 0.3)
typing(22.0, ['LO QUE PASÓ DESPUÉS NUNCA SE CONFIRMÓ'], 32, 0.25)
add(shriek(), 23.5, 0.3, -0.2)
# the last message
add(static(0.12), 24.0, 0.45)
add(hit(1.2, 60, 30), 24.0, 0.55)
LL = ['WE HAVE NOW FOUND THE', 'INDIVIDUALS WE SOUGHT.', 'THUS OUR MONTH-LONG', 'JOURNEY ENDS.']
typing(24.2, LL, 32)
es = 24.0 + 0.2 + sum(len(l) + 2 for l in LL) / 32 + 0.25
add(thud(100), es, 0.5)
add(thud(100), es + 0.2, 0.45)
# "FOR NOW."
typing(28.65, ['Y AL FINAL, DOS PALABRAS:'], 40, 0.25)
add(riser(0.7), 28.6, 0.6)
add(reverse_swell(0.7), 28.6, 0.6)
add(hit(2.8, 48, 22), 29.3, 1.25)
add(static(0.1), 29.3, 0.3)
add(scrape(1.8, 300), 29.4, 0.4, 0.4)
add(thud(90), 29.9, 0.6)
# a year later, they came back
add(hit(1.6, 55, 28), 31.15, 0.8)
add(reverse_swell(0.6), 31.3, 0.45)
add(hit(2.2, 48, 22), 31.9, 1.05)
typing(32.8, ['CONTINUARÁ…'], 20, 0.4)
add(bell(196), 33.4, 0.55)
add(thud(70), 33.4, 0.7)
typing(33.9, ['SÍGUEME PARA NO PERDÉRTELA'], 34, 0.22)
add(riser(1.0), 35.0, 0.45)

fx = np.stack([L, R])
fx /= np.abs(fx).max() + 1e-9
raw_m = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(MUSIC_FROM), '-t', f'{D:.2f}', '-i', MUSIC, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                       capture_output=True, check=True).stdout
mu = np.frombuffer(raw_m, dtype=np.float32).astype(np.float64).reshape(-1, 2).T[:, :N]
mu = np.pad(mu, ((0, 0), (0, N - mu.shape[1])))
mu *= np.clip(t / 0.25, 0, 1) * np.clip((D - t) / 1.0, 0, 1)
mu /= np.abs(mu).max() + 1e-9
mx = mu * 0.85 + fx * 0.6
for at in (3.0, 11.6, 19.4, 28.6, 31.0):  # black cuts: two frames of near silence
    i0, i1 = int(at * SR), int((at + 2 / 30) * SR)
    mx[:, i0:i1] *= 0.08
mx = np.tanh(mx * 1.4) / np.tanh(1.4)
mx /= np.abs(mx).max() * 1.05
os.makedirs('out/cicada01', exist_ok=True)
raw = 'out/cicada01/raw-p2.wav'
with wave.open(raw, 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((mx.T * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', 'public/cicada01/mix-p2.wav'], check=True)
print('wrote public/cicada01/mix-p2.wav')
