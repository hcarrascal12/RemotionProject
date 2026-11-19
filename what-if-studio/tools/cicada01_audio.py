#!/usr/bin/env python3
"""Sound for the Cicada 3301 real-images cut (Cicada01), on the same clock as src/cicada01/Cicada01.tsx.

  python3 tools/cicada01_audio.py      # writes public/cicada01/mix.wav, mastered to -14 LUFS

Dark and unsettling: a tritone drone (A1 + D#2) over a sub rumble, a heartbeat that speeds up, reversed swells into
the hits, metallic scrapes, radio static on the static cuts, dropouts to silence on the black cuts, a shriek on the
subliminal frames, a bell at the end. Room is left for a voice (the drone stays low and thin in 300 Hz - 3 kHz).
"""
import os, subprocess, wave
import numpy as np

SR = 48000
PART1 = os.environ.get('PART') == '1'  # PART=1: the 50 s Part 1 (cliffhanger after the hidden message)
import json
# Part 1 runs on the recorded voice: every event time (written on the 50 s plan clock) goes through the same time
# map as the picture (src/cicada01/warp-p1.json), and the voice is mixed in with the music ducked under it.
WARP = json.load(open('src/cicada01/warp-p1.json')) if PART1 else None
VOICE = 'public/cicada01/voz-parte1-final.wav' if PART1 else None  # v1 up to 46.62 s + the verified ending (v2)
D = WARP['duration'] if PART1 else 35.0
MUTE_AFTER = 99.0


def warp(x):
    if not WARP:
        return x
    A = WARP['anchors']
    if x <= A[0][0]:
        return x
    for (a0, a1), (b0, b1) in zip(A, A[1:]):
        if x <= b0:
            return a1 + (x - a0) / (b0 - a0) * (b1 - a1)
    return A[-1][1] + (x - A[-1][0])
N = int(D * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(3301)
L = np.zeros(N)
R = np.zeros(N)


def add(x, at, gain=1.0, pan=0.0, force=False):
    if at >= MUTE_AFTER and not force:
        return
    at = warp(at)
    i0 = int(at * SR)
    if i0 >= N or i0 < 0:
        return
    x = x[: N - i0]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i0:i0 + len(x)] += x * gain * l * 1.414
    R[i0:i0 + len(x)] += x * gain * r * 1.414


def lp(x, cut):
    a = np.exp(-2 * np.pi * cut / SR)
    from scipy.signal import lfilter  # noqa
    return lfilter([1 - a], [1, -a], lfilter([1 - a], [1, -a], x))


try:
    import scipy  # noqa
except ImportError:  # pure numpy fallback (slower)
    def lp(x, cut):  # type: ignore[no-redef]
        a = np.exp(-2 * np.pi * cut / SR)
        for _ in range(2):
            y = np.empty_like(x); acc = 0.0
            for i, v in enumerate(x):
                acc = (1 - a) * v + a * acc; y[i] = acc
            x = y
        return x


def noise(sec):
    return rng.standard_normal(int(sec * SR))


# --- bed: tritone drone, sub rumble, wind --------------------------------------------------------------------------
fade = np.clip(t / 0.3, 0, 1) * np.clip((D - t) / 0.35, 0, 1)
swell = 0.6 + 0.4 * np.sin(2 * np.pi * t / 7.0 - 1.0)
grow = np.clip((t - 14.0) / 8.0, 0, 1)
drone = (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 55.3 * t + 1)
         + 0.45 * np.sin(2 * np.pi * 77.78 * t + 2)            # D#2: the tritone over A
         + 0.25 * np.sin(2 * np.pi * 116.5 * t) * (0.3 + 0.7 * grow)  # A#2: a minor second that rubs
         + 0.10 * np.sin(2 * np.pi * 155.6 * t + 0.4) * grow)
drone *= swell * fade * 0.15
rumble = np.sin(2 * np.pi * 31 * t + 0.6 * np.sin(2 * np.pi * 0.11 * t)) * 0.12 * fade
wind = lp(noise(D)[:N], 500) * (0.5 + 0.5 * np.sin(2 * np.pi * t / 5.3)) * 0.07 * fade
L += drone + rumble + wind
R += drone * 0.96 + rumble + np.roll(wind, 2400)
# a far, detuned, high whine that comes and goes (unease)
whine = 0.018 * np.sin(2 * np.pi * (2093 + 9 * np.sin(2 * np.pi * 0.23 * t)) * t) * np.clip(np.sin(2 * np.pi * t / 11.0 + 0.5), 0, 1) ** 3
L += whine
R += np.roll(whine, 700) * 0.8


# --- sounds ----------------------------------------------------------------------------------------------------------
def hit(sec=1.8, f0=55, f1=26):
    n = int(sec * SR); tt = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-tt / 0.2)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.7)
    crack = lp(rng.standard_normal(n), 1800) * np.exp(-tt / 0.04)
    tail = lp(rng.standard_normal(n), 300) * np.exp(-tt / 0.9) * 0.4
    return (body + crack + tail) * np.minimum(1, tt / 0.002)


def reverse_swell(sec=0.9):
    n = int(sec * SR); tt = np.arange(n) / SR
    x = lp(rng.standard_normal(n), 1400) * 0.6 + np.sin(2 * np.pi * 77.78 * 2 * tt) * 0.3
    return x * (tt / sec) ** 3


def heartbeat():
    n = int(0.6 * SR); tt = np.arange(n) / SR
    def beat(d):
        u = np.clip(tt - d, 0, None)
        return np.sin(2 * np.pi * (42 + 28 * np.exp(-u / 0.03)) * u) * np.exp(-u / 0.1) * (tt >= d)
    return beat(0) + 0.7 * beat(0.24)


def static(sec=0.12):
    n = int(sec * SR)
    x = rng.standard_normal(n) * 0.8
    x *= (rng.random(n // 200 + 1).repeat(200)[:n] > 0.3)  # crackle
    return x


def scrape(sec=1.2, f=430):
    # metallic: noise through a comb (resonance at f and harmonics), with a slow pitch bend
    n = int(sec * SR); tt = np.arange(n) / SR
    x = rng.standard_normal(n) * 0.3
    d = int(SR / f)
    y = x.copy()
    for i in range(d, n):
        y[i] += 0.93 * y[i - d]
    y = y / (np.abs(y).max() + 1e-9)
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


def bell(f=220, sec=4.0):
    n = int(sec * SR); tt = np.arange(n) / SR
    parts = [(1, 1), (2.76, 0.5), (5.4, 0.3), (8.93, 0.15), (1.5, 0.25)]  # inharmonic: a cracked bell
    return sum(a * np.sin(2 * np.pi * f * k * tt) * np.exp(-tt / (1.6 / k ** 0.5)) for k, a in parts) * 0.35


if not PART1:
    # hook
    add(hit(2.2), 0.0, 1.0)
    add(scrape(1.4, 410), 0.3, 0.35, -0.4)
    # heartbeat, slow, then faster into 3301
    for k in np.arange(0.5, 10.4, 60 / 58):
        add(heartbeat(), k, 0.55)
    for k in np.arange(12.6, 16.0, 60 / 118):
        add(heartbeat(), k, 0.6)
    # the stake
    for at in (3.3, 3.95, 4.55):
        add(thud(), at, 0.5)
    # the date
    add(reverse_swell(0.9), 4.7, 0.6)
    add(hit(1.4, 60, 30), 5.6, 0.75)
    add(thud(90), 6.2, 0.6)
    # the forum
    add(whoosh(), 7.45, 0.4, 0.3)
    add(thud(), 7.9, 0.4)
    add(thud(), 8.6, 0.4)
    # subliminal frames
    for at in (9.9, 24.9, 31.9):
        add(shriek(), at, 0.35, 0.2)
    # typewriter
    pos = 0
    for l in ['HELLO.', 'WE ARE LOOKING FOR', 'HIGHLY INTELLIGENT', 'INDIVIDUALS.']:
        for ch in l:
            if ch != ' ':
                add(key(), 10.6 + pos / 22, 0.38 + 0.08 * rng.random(), rng.uniform(-0.3, 0.3))
            pos += 1
        pos += 2
    # into 3301
    add(riser(1.0), 13.0, 0.6)
    add(reverse_swell(1.1), 12.9, 0.6)
    add(hit(2.8, 50, 22), 14.0, 1.25)
    add(scrape(1.8, 300), 14.1, 0.4, 0.4)
    add(thud(110), 14.6, 0.4)
    add(thud(110), 15.05, 0.4)
    # the scan
    add(scrape(1.7, 620), 16.0, 0.45, -0.2)
    add(thud(), 16.7, 0.45)
    # leads
    add(thud(80), 18.9, 0.6)
    for at in (20.3, 20.45, 20.6):
        add(pulse(330), at, 0.6)
    add(pulse(247, 0.4), 20.8, 0.8)
    add(thud(80), 20.5, 0.5)
    for k in range(4):
        add(whoosh(0.3), 21.6 + 0.85 * k - 0.05, 0.4, -0.5 + 0.33 * k)
    add(thud(), 21.8, 0.4)
    add(thud(), 22.45, 0.4)
    # rounds
    add(hit(1.6, 55, 28), 25.0, 0.8)
    for at in (25.3, 25.9, 26.5):
        add(thud(70), at, 0.6)
    add(reverse_swell(0.9), 26.1, 0.5)
    add(hit(2.0, 48, 24), 27.0, 0.95)
    # theories
    add(hit(1.2, 60, 30), 29.0, 0.7)
    add(hit(1.2, 64, 32), 30.5, 0.7)
    add(scrape(1.4, 520), 30.6, 0.35, 0.4)
    # end
    add(hit(1.6, 55, 28), 32.0, 0.8)
    add(bell(220), 32.35, 0.5)
    add(thud(70), 33.3, 0.7)
    add(riser(1.0), 34.0, 0.45)

# Part 1 (50 s): its own clock, matching Cicada01P1 in src/cicada01/Cicada01.tsx
def typing(start, lines, cps, gain=0.38):
    pos = 0
    for l in lines:
        for ch in l:
            if ch != ' ':
                add(key(), start + pos / cps, gain + 0.08 * rng.random(), rng.uniform(-0.3, 0.3))
            pos += 1
        pos += 2
    return start + pos / cps + 0.05  # the Spanish meaning lands here (0.2 s offset is in start)


if PART1:
    LA = ['HELLO.', 'WE ARE LOOKING FOR', 'HIGHLY INTELLIGENT', 'INDIVIDUALS.']
    LB = ['TO FIND THEM, WE HAVE', 'DEVISED A TEST.', 'THERE IS A MESSAGE', 'HIDDEN IN THIS IMAGE.']
    LC = ['WE LOOK FORWARD TO', 'MEETING THE FEW THAT', 'WILL MAKE IT ALL', 'THE WAY THROUGH.']
    add(hit(2.2), 0.0, 1.0)
    add(scrape(1.4, 410), 0.3, 0.35, -0.4)
    for k_ in np.arange(0.5, 14.8, 60 / 58):
        add(heartbeat(), k_, 0.55)
    for at in (3.3, 3.95, 4.55):
        add(thud(), at, 0.5)
    # nobody knows who
    add(hit(1.2, 60, 30), 6.25, 0.6)
    typing(6.3, ['AUTOR: DESCONOCIDO'], 30, 0.3)
    add(thud(), 6.6, 0.45)
    add(thud(), 7.0, 0.45)
    add(hit(1.4, 52, 26), 7.7, 0.7)
    # the date, the forum
    add(reverse_swell(0.9), 8.1, 0.6)
    add(hit(1.4, 60, 30), 9.0, 0.75)
    add(thud(90), 9.6, 0.6)
    add(whoosh(), 11.25, 0.4, 0.3)
    add(thud(), 11.7, 0.4)
    add(thud(), 12.4, 0.4)
    # the whole message, typed
    for st, lines, cps in ((14.8, LA, 22), (18.8, LB, 32), (23.4, LC, 32)):
        add(whoosh(0.4), st - 0.15, 0.35)
        es = typing(st + 0.2, lines, cps) + 0.2
        add(thud(100), es, 0.5)
        add(thud(100), es + 0.2, 0.45)
    for k_ in np.arange(25.5, 30.6, 60 / 118):
        add(heartbeat(), k_, 0.6)
    # 3301
    add(riser(1.0), 27.0, 0.6)
    add(reverse_swell(1.1), 26.9, 0.6)
    add(hit(2.8, 50, 22), 28.0, 1.25)
    add(scrape(1.8, 300), 28.1, 0.4, 0.4)
    typing(28.05, ['GOOD LUCK. · «BUENA SUERTE»'], 40, 0.25)
    add(thud(110), 28.6, 0.4)
    add(thud(110), 29.05, 0.4)
    # it was true: the scan
    add(scrape(1.8, 620), 30.6, 0.45, -0.2)
    add(thud(), 30.8, 0.45)
    add(hit(1.2, 58, 30), 31.4, 0.6)
    # the search
    add(whoosh(), 33.65, 0.4)
    for k_ in np.arange(34.0, 40.8, 60 / 76):
        add(heartbeat(), k_, 0.45)
    add(thud(), 34.0, 0.45)
    add(hit(1.2, 60, 30), 34.5, 0.6)
    typing(35.2, ['DÍA Y NOCHE'], 20, 0.3)
    # what they found
    add(hit(1.4, 55, 28), 37.6, 0.7)
    add(thud(), 37.8, 0.45)
    add(reverse_swell(0.7), 38.35, 0.5)
    add(hit(1.8, 48, 24), 39.0, 0.85)
    # the verified ending (plan clock; the warp adds 5.82 s): book code, coordinates, "algo real", the three cities,
    # the QR and the cicada, then "¿quién los pegó?"
    add(static(0.08), 40.8, 0.45)
    add(thud(80), 40.8, 0.6)
    for k_ in range(12):
        add(key(), 40.85 + k_ * 0.09, 0.3)
    add(thud(80), 41.96, 0.6)
    for at in (42.05, 42.2, 42.35):
        add(pulse(330), at, 0.6)
    add(pulse(247, 0.4), 42.55, 0.7)
    add(reverse_swell(0.8), 44.35, 0.5)
    add(hit(1.8, 50, 24), 45.14, 1.0)
    add(thud(), 46.4, 0.45)
    add(thud(), 46.95, 0.45)
    for at in (47.86, 48.52, 49.46):  # París, Varsovia, Miami
        add(hit(0.7, 90, 50), at, 0.55)
        add(static(0.05), at, 0.3)
    add(thud(100), 50.4, 0.6)
    add(thud(), 51.5, 0.5)
    add(scrape(1.4, 380), 52.2, 0.3, -0.3)
    add(hit(1.4, 55, 28), 53.0, 0.75)
    add(shriek(), 40.5, 0.35, 0.2)
    for at in (13.9, 33.5):
        add(shriek(), at, 0.35, 0.2)
    add(reverse_swell(0.6), 54.3, 0.4)
    add(hit(1.6, 55, 28), 54.55, 0.8)
    add(hit(2.4, 48, 22), 54.86, 1.1)
    add(scrape(1.6, 300), 54.9, 0.35, 0.3)
    for k_ in range(9):
        add(key(), 56.12 + k_ / 20, 0.4)
    add(bell(196), 57.22, 0.55)
    add(thud(70), 57.22, 0.7)
    for k_ in np.arange(58.2, 60.5, 60 / 50):
        add(heartbeat(), k_, 0.4)
    add(riser(1.0), 59.5, 0.45)

# static bursts on the static cuts (3 frames) and dropouts on the black cuts (2 frames of near silence)
for at in ((9.0, 28.0, 37.6, 43.36) if PART1 else (5.6, 14.0, 25.0, 29.0, 30.5)):
    add(static(0.12), at, 0.5)
mx = np.stack([L, R])
for at in ((3.2, 6.2, 11.4, 14.8, 30.6, 33.8, 40.8, 50.36, 54.5) if PART1 else (3.2, 7.6, 10.4, 16.0, 18.6, 20.2, 21.6, 32.0)):
    i0, i1 = int(warp(at) * SR), int((warp(at) + 2 / 30) * SR)
    ramp = np.ones(N)
    ramp[i0:i1] = 0.08
    mx *= ramp

if VOICE:
    raw_v = subprocess.run(['ffmpeg', '-v', 'error', '-i', VOICE, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    v = np.frombuffer(raw_v, dtype=np.float32).astype(np.float64)[:N]
    v = np.pad(v, (0, N - len(v)))
    v = v / (np.abs(v).max() + 1e-9) * 0.9
    # sidechain: the bed and effects dip about 9 dB while the voice speaks (20 ms attack, 250 ms release)
    e = np.abs(v)
    k = int(0.05 * SR)
    e = np.convolve(e, np.ones(k) / k, mode='same')
    e = np.clip(e / (np.percentile(e[e > 1e-4], 90) + 1e-9), 0, 1)
    rel = np.exp(-1 / (0.25 * SR))
    env = np.empty_like(e); acc = 0.0
    for i in range(0, N, 48):  # control rate: 1 ms
        x = e[i:i + 48].max()
        acc = x if x > acc else acc * rel ** 48
        env[i:i + 48] = acc
    rest = np.tanh(mx * 1.5) / np.tanh(1.5)
    rest = rest / (np.abs(rest).max() + 1e-9) * 0.55
    rest *= 1 - 0.65 * env
    mx = rest + np.stack([v, v])
mx = np.tanh(mx * 1.5) / np.tanh(1.5)
mx /= np.abs(mx).max() * 1.05
os.makedirs('out/cicada01', exist_ok=True)
raw = 'out/cicada01/raw.wav'
OUT = 'public/cicada01/mix-p1.wav' if PART1 else 'public/cicada01/mix.wav'
with wave.open(raw, 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((mx.T * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', OUT], check=True)
print('wrote', OUT)
