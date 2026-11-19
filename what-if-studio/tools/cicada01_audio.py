#!/usr/bin/env python3
"""Sound for the Cicada 3301 real-images cut (Cicada01), on the same clock as src/cicada01/Cicada01.tsx.

  python3 tools/cicada01_audio.py      # writes public/cicada01/mix.wav, mastered to -14 LUFS

A dark drone (low A with a detuned fifth and a slow swell), a heartbeat, digital glitches on the cuts, typewriter
clicks on the message, a riser and a deep hit on 3301, sweeps on the city pans and a riser into the loop. No voice yet:
there is room for one (the drone sits low and thin in the 300 Hz - 3 kHz band).
"""
import os, subprocess, wave
import numpy as np

SR = 48000
D = 35.0
N = int(D * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(3301)
L = np.zeros(N)
R = np.zeros(N)


def add(x, at, gain=1.0, pan=0.0):
    i0 = int(at * SR)
    if i0 >= N:
        return
    x = x[: N - i0]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i0:i0 + len(x)] += x * gain * l * 1.414
    R[i0:i0 + len(x)] += x * gain * r * 1.414


def env(n, a=0.005, d=0.2):
    tt = np.arange(n) / SR
    return np.minimum(1, tt / a) * np.exp(-tt / d)


def lowpass(x, cut):
    # one-pole low-pass, applied twice
    a = np.exp(-2 * np.pi * cut / SR)
    y = np.zeros_like(x)
    for _ in range(2):
        acc = 0.0
        out = np.empty_like(x)
        for i, v in enumerate(x):
            acc = (1 - a) * v + a * acc
            out[i] = acc
        x = out
    return x


def noise(sec):
    return rng.standard_normal(int(sec * SR))


# --- drone: A1 + E2 detuned, a sub, slow swell; brighter after the 3301 hit -------------------------------------
swell = 0.55 + 0.45 * np.sin(2 * np.pi * t / 9.0 - 1.2)
grow = np.clip((t - 14.0) / 6.0, 0, 1)
fade_in = np.clip(t / 0.4, 0, 1)
fade_out = np.clip((D - t) / 0.35, 0, 1)
drone = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 55.4 * t + 1)
         + 0.45 * np.sin(2 * np.pi * 82.4 * t + 2) + 0.3 * np.sin(2 * np.pi * 110.3 * t) * (0.4 + 0.6 * grow)
         + 0.12 * np.sin(2 * np.pi * 164.8 * t + 0.5) * grow)
drone *= swell * fade_in * fade_out * 0.16
L += drone
R += drone * 0.97
# a thin, high, eerie whistle that comes and goes (out of the voice band's centre)
whistle = 0.025 * np.sin(2 * np.pi * (1760 + 6 * np.sin(2 * np.pi * 0.3 * t)) * t) * np.clip(np.sin(2 * np.pi * t / 13.0), 0, 1) ** 2
L += whistle
R += whistle * 0.6
# air: soft filtered noise bed
air = lowpass(noise(D)[:N], 700) * 0.05 * fade_in * fade_out
L += air
R += np.roll(air, 1200)


# --- sound effects -----------------------------------------------------------------------------------------------
def hit(sec=1.6, f0=60, f1=32):
    n = int(sec * SR)
    tt = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-tt / 0.18)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-tt / 0.55)
    click = lowpass(rng.standard_normal(n), 2500) * np.exp(-tt / 0.03) * 0.8
    return (body + click) * np.minimum(1, tt / 0.002)


def heartbeat():
    n = int(0.55 * SR)
    tt = np.arange(n) / SR
    beat = lambda d: np.sin(2 * np.pi * (48 + 30 * np.exp(-(tt - d) / 0.03)) * np.clip(tt - d, 0, None)) * np.exp(-np.clip(tt - d, 0, None) / 0.09) * (tt >= d)
    return beat(0) + 0.7 * beat(0.22)


def glitch(sec=0.25):
    n = int(sec * SR)
    x = np.zeros(n)
    i = 0
    while i < n:
        ln = int(rng.uniform(0.006, 0.03) * SR)
        kind = rng.random()
        tt = np.arange(min(ln, n - i)) / SR
        if kind < 0.4:
            seg = np.sign(np.sin(2 * np.pi * rng.uniform(300, 2400) * tt)) * 0.5
        elif kind < 0.75:
            seg = rng.standard_normal(len(tt)) * 0.6
        else:
            seg = np.zeros(len(tt))
        x[i:i + len(tt)] = seg
        i += ln
    return x * np.exp(-np.arange(n) / SR / (sec * 0.8))


def click():
    n = int(0.03 * SR)
    tt = np.arange(n) / SR
    return (rng.standard_normal(n) * np.exp(-tt / 0.004) + 0.5 * np.sin(2 * np.pi * 2200 * tt) * np.exp(-tt / 0.006)) * 0.6


def whoosh(sec=0.45, up=True):
    n = int(sec * SR)
    tt = np.arange(n) / SR
    x = rng.standard_normal(n)
    shape = np.sin(np.pi * tt / sec) ** 2
    cut = (lambda k: 400 + 3000 * k) if up else (lambda k: 3400 - 3000 * k)
    lo = lowpass(x, 900) if up else lowpass(x, 1500)
    return lo * shape * 0.8 + 0.2 * x * shape * (tt / sec if up else 1 - tt / sec)


def riser(sec=1.0):
    n = int(sec * SR)
    tt = np.arange(n) / SR
    f = 200 * (2 ** (3 * tt / sec))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    return (tone + lowpass(rng.standard_normal(n), 2500) * 0.5) * (tt / sec) ** 2


def beep(freq=1250, sec=0.09):
    n = int(sec * SR)
    tt = np.arange(n) / SR
    return np.sin(2 * np.pi * freq * tt) * np.minimum(1, tt / 0.003) * np.minimum(1, (sec - tt) / 0.01) * 0.35


def sweep(sec=1.7):
    n = int(sec * SR)
    tt = np.arange(n) / SR
    f = 300 + 2500 * (tt / sec)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.12 * np.sin(np.pi * tt / sec) + lowpass(rng.standard_normal(n), 3000) * 0.08


# hook
add(hit(1.8), 0.0, 0.9)
add(glitch(0.22), 0.0, 0.35)
add(glitch(0.16), 1.55, 0.3, 0.3)
# heartbeat, slow, until the message; faster around 3301
for k in np.arange(0.4, 10.4, 60 / 64):
    add(heartbeat(), k, 0.5)
for k in np.arange(13.2, 16.0, 60 / 110):
    add(heartbeat(), k, 0.55)
# the stake
add(whoosh(0.4), 3.05, 0.5, -0.3)
for at in (3.25, 3.95, 4.55):
    add(click(), at, 0.5)
# the date
add(glitch(0.3), 5.6, 0.5)
add(hit(1.2, 70, 40), 5.6, 0.6)
add(hit(0.6, 110, 70), 6.1, 0.35)
# the forum
add(whoosh(0.45), 7.45, 0.5, 0.3)
add(click(), 7.9, 0.4)
add(click(), 8.6, 0.4)
# typewriter: one click per character as in the picture (22 chars/s from 10.6 s)
lines = ['HELLO.', 'WE ARE LOOKING FOR', 'HIGHLY INTELLIGENT', 'INDIVIDUALS.']
pos = 0
for l in lines:
    for ch in l:
        if ch != ' ':
            add(click(), 10.6 + pos / 22, 0.32 + 0.08 * rng.random(), rng.uniform(-0.3, 0.3))
        pos += 1
    pos += 2
add(whoosh(0.4), 10.25, 0.4, -0.2)
# riser into 3301, the big hit
add(riser(1.0), 13.0, 0.7)
add(hit(2.4, 55, 28), 14.0, 1.1)
add(glitch(0.35), 14.0, 0.4)
add(hit(0.5, 120, 80), 14.6, 0.3)
add(hit(0.5, 120, 80), 15.05, 0.3)
# the scan
add(sweep(1.7), 16.0, 0.8)
add(click(), 16.15, 0.4)
add(hit(0.8, 90, 50), 16.7, 0.4)
# the book
add(whoosh(0.5, False), 18.5, 0.5)
add(hit(0.6, 120, 70), 18.85, 0.4)
# coordinates: lock-on beeps
for at in (20.3, 20.45, 20.6):
    add(beep(1250), at, 0.8)
add(beep(1650, 0.25), 20.8, 0.8)
# the cities: a whoosh per snap pan
for k in range(4):
    add(whoosh(0.3), 21.6 + 0.85 * k - 0.05, 0.45, -0.5 + 0.33 * k)
add(click(), 21.75, 0.4)
add(click(), 22.4, 0.4)
# three rounds
add(hit(1.4, 60, 34), 25.0, 0.7)
for at in (25.3, 25.9, 26.5):
    add(hit(0.4, 140, 90), at, 0.35)
    add(click(), at, 0.4)
add(hit(1.6, 50, 28), 27.0, 0.8)
add(glitch(0.25), 27.0, 0.3)
# the theories
add(glitch(0.25), 29.0, 0.5)
add(hit(1.0, 70, 40), 29.0, 0.6)
add(glitch(0.25), 30.5, 0.5)
add(hit(1.0, 80, 45), 30.5, 0.6)
# the question, the card, the riser into the loop
add(hit(1.2, 60, 35), 32.0, 0.7)
add(click(), 32.35, 0.4)
add(hit(1.6, 55, 30), 33.2, 0.8)
add(riser(1.0), 34.0, 0.55)

# --- master --------------------------------------------------------------------------------------------------------
mx = np.stack([L, R])
mx = np.tanh(mx * 1.4) / np.tanh(1.4)  # gentle saturation, keeps peaks round
mx /= np.abs(mx).max() * 1.05
os.makedirs('public/cicada01', exist_ok=True)
raw = 'out/cicada01/raw.wav'
os.makedirs('out/cicada01', exist_ok=True)
with wave.open(raw, 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((mx.T * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', 'public/cicada01/mix.wav'], check=True)
print('wrote public/cicada01/mix.wav')
