#!/usr/bin/env python3
"""Sound for El Dev Artificial · Archivo 02 · Satoshi (composition ElDev02Satoshi).

  python3 tools/eldev02_audio.py   # writes public/eldev02/mix.wav, mastered to -14 LUFS

Every cue comes from src/eldev02/sfx.json (the same frames as the // SFX: comments in the scenes). Each named SFX is
synthesized here; to swap one for a real sample, drop a WAV at public/eldev02/sfx/<name>.wav and it is used instead.
Bed: the Suno track (public/cicada01/musica-suno.m4a) from 101 s, ducked under the hits, faded so the end meets the start.
"""
import json, os, subprocess, wave
import numpy as np
from scipy.signal import lfilter

SR = 48000
spec = json.load(open('src/eldev02/sfx.json'))
FPS, D = spec['fps'], spec['duration']
N = int(D * SR)
rng = np.random.default_rng(2008)
L = np.zeros(N); R = np.zeros(N)


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


def sub_bass_impact(**_):
    n = int(1.6 * SR); tt = np.arange(n) / SR
    f = 30 + 70 * np.exp(-tt / 0.08)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.6)
    click = lp(noise(1.6), 2500) * np.exp(-tt / 0.012) * 0.8
    return body + click


def digital_glitch_whoosh(**_):
    sec = 0.35; n = int(sec * SR); tt = np.arange(n) / SR
    w = hp(lp(noise(sec), 5000), 400) * np.sin(np.pi * tt / sec) ** 2
    gate = np.repeat(rng.random(n // 480 + 1) > 0.35, 480)[:n]
    bits = np.sign(np.sin(2 * np.pi * np.repeat(rng.uniform(300, 2400, n // 960 + 1), 960)[:n] * tt)) * 0.15
    return w * (0.5 + 0.5 * gate) + bits * gate * np.sin(np.pi * tt / sec)


def censor_slam(**_):
    n = int(0.5 * SR); tt = np.arange(n) / SR
    thump = np.sin(2 * np.pi * 70 * tt) * np.exp(-tt / 0.07)
    slap = hp(noise(0.5), 800) * np.exp(-tt / 0.02)
    swish = sweep(4000, 300, 0.5) * 0.0
    return thump + slap * 0.9 + swish


def counter_tick_roll(frames=18, **_):
    sec = frames / FPS + 0.05; y = np.zeros(int(sec * SR))
    k, t = 0, 0.0
    while t < frames / FPS:
        x = tone(2200 + 600 * (k % 3), 0.02, 0.006)
        i = int(t * SR); y[i:i + len(x)] += x[: len(y) - i]
        t += 0.012 + 0.03 * (t / (frames / FPS)) ** 2; k += 1
    return y


def highlighter_swipe(**_):
    sec = 0.3; n = int(sec * SR); tt = np.arange(n) / SR
    return lp(hp(noise(sec), 1500), 7000) * np.sin(np.pi * tt / sec) * 0.7


def badge_pop(**_):
    y = tone(1400, 0.2, 0.08) * 0.4
    y[: int(0.09 * SR)] += sweep(500, 1400, 0.09) * env(int(0.09 * SR), 0.001, 0.05)
    return y


def cube_spin(frames=40, **_):
    sec = frames / FPS; n = int(sec * SR); tt = np.arange(n) / SR
    f = 90 + 40 * np.exp(-tt / 0.4)
    am = 0.6 + 0.4 * np.sin(2 * np.pi * (14 * np.exp(-tt / 0.5) + 2) * tt)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * am * np.exp(-tt / (sec * 0.7)) * 0.6 + lp(noise(sec), 600) * 0.2 * np.exp(-tt / 0.3)


def data_tick(**_):
    return tone(rng.choice([1800, 2400, 3000]), 0.03, 0.008) + hp(noise(0.03), 3000) * env(int(0.03 * SR), 0.001, 0.004) * 0.4


def decode_hit(**_):
    y = sub_bass_impact() * 0.6
    y[: int(0.25 * SR)] += sweep(300, 2400, 0.25) * 0.25 * env(int(0.25 * SR), 0.01, 0.2)
    return y


def key_click(**_):
    n = int(0.04 * SR)
    return hp(noise(0.04), 1200) * env(n, 0.0005, 0.005) + tone(rng.uniform(700, 1100), 0.04, 0.01) * 0.3


def pixel_disintegrate(**_):
    sec = 0.9; n = int(sec * SR); tt = np.arange(n) / SR
    grains = np.zeros(n)
    for _ in range(140):
        i = int(rng.random() * (n - 600)); g = tone(rng.uniform(800, 5000), 0.01, 0.003)
        grains[i:i + len(g)] += g * (1 - i / n)
    return grains * 0.8 + lp(noise(sec), 3000) * np.exp(-tt / 0.3) * 0.3 + sweep(1200, 80, sec) * np.exp(-tt / 0.4) * 0.3


def lock_slam(**_):
    n = int(1.4 * SR); tt = np.arange(n) / SR
    metal = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) for f, d in ((523, 0.25), (1187, 0.12), (2093, 0.06))) * 0.35
    clack = hp(noise(1.4), 1500) * np.exp(-tt / 0.008)
    return metal + clack + sub_bass_impact()[:n] * 0.9


def slot_tick(**_):
    return tone(1600, 0.05, 0.015) + hp(noise(0.05), 2000) * env(int(0.05 * SR), 0.0005, 0.006) * 0.5


def reject_buzz(**_):
    sec = 0.18; n = int(sec * SR); tt = np.arange(n) / SR
    return np.sign(np.sin(2 * np.pi * 110 * tt)) * 0.4 * np.minimum(1, (sec - tt) / 0.02) * np.minimum(1, tt / 0.003)


def gavel(**_):
    n = int(1.0 * SR); tt = np.arange(n) / SR
    wood = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) for f, d in ((180, 0.12), (410, 0.06), (950, 0.03)))
    return wood + hp(noise(1.0), 900) * np.exp(-tt / 0.01) + np.sin(2 * np.pi * 45 * tt) * np.exp(-tt / 0.4) * 0.8


def progress_tick(**_):
    return tone(3200, 0.02, 0.005) * 0.8


def error_buzz(**_):
    sec = 0.7; n = int(sec * SR); tt = np.arange(n) / SR
    s = (np.sign(np.sin(2 * np.pi * 98 * tt)) + np.sign(np.sin(2 * np.pi * 103.8 * tt))) * 0.25
    return lp(s, 2500) * np.minimum(1, (sec - tt) / 0.05)


def riser(frames=45, **_):
    sec = frames / FPS; n = int(sec * SR); tt = np.arange(n) / SR
    return (sweep(120, 1800, sec) * 0.3 + hp(noise(sec), 2000) * 0.5) * (tt / sec) ** 2.5


def reverse_swell(frames=13, **_):
    sec = frames / FPS; n = int(sec * SR); tt = np.arange(n) / SR
    return (lp(noise(sec), 1800) * 0.6 + np.sin(2 * np.pi * 55 * tt) * 0.6) * (tt / sec) ** 3


SYNTH = {k.replace('_', '-'): v for k, v in globals().items() if callable(v) and k in {
    'sub_bass_impact', 'digital_glitch_whoosh', 'censor_slam', 'counter_tick_roll', 'highlighter_swipe', 'badge_pop', 'cube_spin',
    'data_tick', 'decode_hit', 'key_click', 'pixel_disintegrate', 'lock_slam', 'slot_tick', 'reject_buzz', 'gavel', 'progress_tick',
    'error_buzz', 'riser', 'reverse_swell'}}


def sample(name):
    p = f'public/eldev02/sfx/{name}.wav'
    if not os.path.exists(p):
        return None
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


hits = np.zeros(N)
for c in spec['cues']:
    x = sample(c['sfx'])
    if x is None:
        x = SYNTH[c['sfx']](**{k: v for k, v in c.items() if k == 'frames'})
    x = x / (np.abs(x).max() + 1e-9) * c['gain']
    i0 = int(c['frame'] / FPS * SR)
    x = x[: N - i0]
    pan = rng.uniform(-0.25, 0.25)
    L[i0:i0 + len(x)] += x * np.cos((pan + 1) * np.pi / 4) * 1.414
    R[i0:i0 + len(x)] += x * np.sin((pan + 1) * np.pi / 4) * 1.414
    if c['sfx'] in ('sub-bass-impact', 'lock-slam', 'gavel', 'decode-hit', 'censor-slam'):
        hits[i0:i0 + int(0.4 * SR)] = np.maximum(hits[i0:i0 + int(0.4 * SR)], c['gain'])

fx = np.stack([L, R]); fx /= np.abs(fx).max() + 1e-9
raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', '101', '-t', f'{D:.2f}', '-i', 'public/cicada01/musica-suno.m4a', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                     capture_output=True, check=True).stdout
mu = np.frombuffer(raw, dtype=np.float32).astype(np.float64).reshape(-1, 2).T[:, :N]
mu = np.pad(mu, ((0, 0), (0, N - mu.shape[1])))
t = np.arange(N) / SR
mu *= np.clip(t / 0.05, 0, 1) * np.clip((D - t) / 0.4, 0, 1)  # starts at once, dips into the loop
mu /= np.abs(mu).max() + 1e-9
duck = 1 - 0.45 * lp(hits, 8)

# Voice (public/eldev02/voz-raw.mp3): the recorded take, panned center. The music bed and the ambient SFX duck
# under it while it speaks; the hit SFX (impacts, slams) still punch through.
VOICE = 'public/eldev02/voz-raw.mp3'
voice = np.zeros((2, N))
voice_env = np.zeros(N)
if os.path.exists(VOICE):
    rawv = subprocess.run(['ffmpeg', '-v', 'error', '-i', VOICE, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    vo = np.frombuffer(rawv, dtype=np.float32).astype(np.float64).reshape(-1, 2).T
    vo = vo[:, :N]
    voice[:, :vo.shape[1]] = vo
    voice /= np.abs(voice).max() + 1e-9
    voice_env = lp(np.abs(voice).mean(0), 6)
    voice_env /= voice_env.max() + 1e-9
voice_duck = 1 - 0.55 * voice_env  # music and ambient fx duck under the voice
mx = mu * 0.55 * duck * voice_duck + fx * 0.8 * (1 - 0.25 * voice_env) + voice * 1.05
mx = np.tanh(mx * 1.3) / np.tanh(1.3)
mx /= np.abs(mx).max() * 1.05
os.makedirs('public/eldev02', exist_ok=True); os.makedirs('out/eldev02', exist_ok=True)
with wave.open('out/eldev02/raw.wav', 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((mx.T * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/eldev02/raw.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', 'public/eldev02/mix.wav'], check=True)
print('wrote public/eldev02/mix.wav')
