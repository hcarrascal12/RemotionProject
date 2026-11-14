#!/usr/bin/env python3
"""Operación Corazón: builds the audio mix and the timeline of the children's video.

  python3 tools/kids_build.py

Reads the 16 voice files in public/kids/voz (01.mp3 .. 16.mp3) and the script in kids-data/script_lines.py. Each audio is a block of
consecutive script lines (GROUPS below; the first ten are one line each, the last ones hold several turns). Inside a block the lines
are placed by their share of the syllables and snapped to the nearest silence. The mix is: the voices (each levelled to the same
loudness), a music bed per scene (synthesized, ducked under the voices), sound effects (phone, siren, engine, chimes, fanfare) and
the 3 s pause for the children to answer. It writes
  public/kids/mix.wav            the master (-16 LUFS), muxed into the video by tools/therac25_render.sh
  out/kids/audio-operacion-corazon.mp3
  src/kids/timeline.json         duration, fps, scenes, lines (speaker, start, end), events (signs, truck, Bible) and the voice envelope
"""
import json, math, os, re, subprocess, sys
import numpy as np

ROOT = os.getcwd()
sys.path.insert(0, os.path.join(ROOT, 'kids-data'))
from script_lines import L  # noqa: E402
from acting import A as ACT  # noqa: E402

SR = 44100
FPS = 15
VOZ = os.path.join(ROOT, 'public/kids/voz')
# audio number (1-based) -> the script lines it holds (0-based, half open)
GROUPS = [(0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 6), (6, 7), (7, 8), (8, 9), (9, 10), (10, 11), (11, 12), (12, 15), (15, 25), (25, 51), (51, 57)]
TARGET_LUFS = -18.0
rng = np.random.default_rng(11)


def syl(t):
    return sum(max(1, len(re.findall(r'[aeiouáéíóúü]+', w))) for w in re.findall(r"[a-záéíóúüñ]+", t.lower()))


def decode(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def lufs(path):
    out = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1])


def silences(x, thr_db=-38.0, win=0.02):
    """Silent stretches (start, end) in seconds."""
    h = int(win * SR)
    n = len(x) // h
    e = 20 * np.log10(np.sqrt(np.mean(x[:n * h].reshape(n, h) ** 2, axis=1)) + 1e-9)
    quiet = e < thr_db
    res, i = [], 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            res.append((i * win, j * win))
            i = j
        else:
            i += 1
    return res


def split_block(x, lines):
    """Cut times (seconds) between the lines of one block: by syllable share, snapped to the longest silence nearby."""
    if len(lines) == 1:
        return []
    sil = [(a, b) for a, b in silences(x) if b - a >= 0.12]
    nz = np.where(np.abs(x) > 0.02 * np.abs(x).max())[0]
    t0, t1 = nz[0] / SR, nz[-1] / SR
    w = [syl(l[2]) + 2 for l in lines]
    cum = np.cumsum(w) / sum(w)
    cuts = []
    for c in cum[:-1]:
        est = t0 + c * (t1 - t0)
        near = [(b - a, (a + b) / 2) for a, b in sil if abs((a + b) / 2 - est) < 2.2 and (a + b) / 2 > (cuts[-1] if cuts else 0) + 0.3]
        cuts.append(max(near)[1] if near else est)
    return cuts


# ---------------------------------------------------------------------------------------------------------------
# sound effects and music (synthesized)
# ---------------------------------------------------------------------------------------------------------------
def tt(d):
    return np.arange(int(d * SR)) / SR


def env(d, a=0.01, r=0.1):
    t = tt(d)
    return np.minimum(1, t / a) * np.minimum(1, (d - t) / r)


def phone_ring():
    out = np.zeros(int(3.7 * SR))
    for k in range(3):
        base = k * 1.2
        for off in (0.0, 0.55):
            t = tt(0.4)
            s = (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t)) * (0.6 + 0.4 * np.sin(2 * np.pi * 20 * t)) * env(0.4, 0.01, 0.03)
            i = int((base + off) * SR)
            out[i:i + len(s)] += 0.35 * s
    return out


def siren(d):
    t = tt(d)
    f = 950 + 350 * np.sin(2 * np.pi * t / 1.1)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return 0.3 * (np.sin(ph) + 0.3 * np.sin(2 * ph)) * env(d, 0.15, 0.4)


def engine(d):
    t = tt(d)
    n = rng.standard_normal(len(t))
    k = 400
    lowp = np.convolve(n, np.ones(k) / k, mode='same')
    rumble = 12 * lowp * (0.7 + 0.3 * np.sin(2 * np.pi * 7 * t))
    saw = ((55 * t * (1 + 0.1 * np.sin(2 * np.pi * 1.5 * t))) % 1) * 2 - 1
    return 0.35 * (rumble + 0.18 * saw) * env(d, 0.4, 0.8)


def chime(freqs=(660, 880, 1320), gap=0.12):
    out = np.zeros(int(1.6 * SR))
    for i, f in enumerate(freqs):
        t = tt(1.2)
        s = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t / 0.35)
        j = int(i * gap * SR)
        out[j:j + len(s)] += 0.3 * s
    return out


def page_turn():
    n = rng.standard_normal(int(0.5 * SR))
    k = 30
    hp = n - np.convolve(n, np.ones(k) / k, mode='same')
    return 0.25 * hp * np.exp(-tt(0.5) / 0.12)


def drumroll(d=1.1):
    out = np.zeros(int((d + 0.3) * SR))
    n = int(d * 14)
    for i in range(n):
        st = i / 14
        h = rng.standard_normal(int(0.07 * SR)) * np.exp(-tt(0.07) / 0.03) * (0.1 + 0.5 * (i / n))
        k0 = int(st * SR)
        out[k0:k0 + len(h)] += h
    return out


def ticks(d):
    out = np.zeros(int((d + 0.2) * SR))
    for i in range(int(d / 0.5)):
        f = 1500 if i % 2 == 0 else 1100
        s = np.sin(2 * np.pi * f * tt(0.06)) * np.exp(-tt(0.06) / 0.012) * 0.6
        k0 = int(i * 0.5 * SR)
        out[k0:k0 + len(s)] += s
    return out


def fanfare():
    out = np.zeros(int(3.2 * SR))
    seq = [(392, 0.0, 0.25), (392, 0.28, 0.25), (392, 0.56, 0.25), (523, 0.84, 0.7), (440, 1.6, 0.25), (523, 1.9, 1.1)]
    for f, st, d in seq:
        t = tt(d + 0.2)
        s = (np.sign(np.sin(2 * np.pi * f * t)) * 0.2 + np.sin(2 * np.pi * f * t) * 0.5 + np.sin(4 * np.pi * f * t) * 0.15) * env(d + 0.2, 0.02, 0.2)
        i = int(st * SR)
        out[i:i + len(s)] += 0.4 * s
    return out


def pluck(f, d=0.5, bright=1.0):
    t = tt(d)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.18) + 0.3 * bright * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.05)) * np.clip(t / 0.003, 0, 1)


def pad(f, d):
    t = tt(d)
    return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.004 * t) + 0.2 * np.sin(4 * np.pi * f * t)) * env(d, 0.6, 0.8)


NOTE = {'C': 261.63, 'D': 293.66, 'E': 329.63, 'F': 349.23, 'G': 392.0, 'A': 440.0, 'B': 493.88}
BEDS = {  # name: (bpm, chords as (root, [triad degrees in Hz]), style)
    'aventura': (112, [('C', [0, 4, 7]), ('G', [0, 4, 7]), ('A', [0, 3, 7]), ('F', [0, 4, 7])], 'bounce'),
    'divertida': (100, [('F', [0, 4, 7]), ('C', [0, 4, 7]), ('D', [0, 3, 7]), ('G', [0, 4, 7])], 'bounce'),
    'suave': (76, [('C', [0, 4, 7]), ('A', [0, 3, 7]), ('F', [0, 4, 7]), ('G', [0, 4, 7])], 'soft'),
    'cristiana': (84, [('G', [0, 4, 7]), ('E', [0, 3, 7]), ('C', [0, 4, 7]), ('D', [0, 4, 7])], 'soft'),
    'victoria': (120, [('C', [0, 4, 7]), ('F', [0, 4, 7]), ('G', [0, 4, 7]), ('C', [0, 4, 7])], 'bounce'),
    'emotiva': (66, [('A', [0, 3, 7]), ('F', [0, 4, 7]), ('C', [0, 4, 7]), ('G', [0, 4, 7])], 'soft'),
}


def bed(kind, d):
    bpm, chords, style = BEDS[kind]
    beat = 60 / bpm
    out = np.zeros(int((d + 8) * SR))
    t, k = 0.0, 0
    while t < d + 0.5:
        root, ints = chords[(k // 4) % 4]
        f0 = NOTE[root] / 2 * 2 ** (ints[0] / 12)
        tones = [NOTE[root] * 2 ** (i / 12) for i in ints]
        if style == 'bounce':
            # bass on 1 and 3, chord stabs off-beat, a marimba line on the 8ths, a shaker
            if k % 2 == 0:
                s = pluck(NOTE[root] / 2, 0.45, 0.4) * 0.55
                i = int(t * SR); out[i:i + len(s)] += s
            # the leitmotif of the film: the same rhythm in every bounce bed, on the notes of the chord of the moment
            for off, idx in ((0.0, 2), (1.0, 1), (1.5, 0), (2.0, 1), (3.0, 2), (3.5, 1)):
                if k % 4 * 1.0 == off or (off - k % 4 * 1.0 == 0.5 and False):
                    pass
            bar_pos = k % 4
            for off, idx in ((0.0, 2), (1.0, 1), (2.0, 1), (3.0, 2)):
                if bar_pos == off:
                    s = pluck(tones[idx] * 2, 0.5, 1.0) * 0.34
                    i = int(t * SR); out[i:i + len(s)] += s
            for off, idx in ((1.5, 0), (3.5, 1)):
                if bar_pos == int(off):
                    s = pluck(tones[idx] * 2, 0.35, 1.0) * 0.3
                    i = int((t + beat / 2) * SR); out[i:i + len(s)] += s
            if k % 2 == 1:
                for f in tones:
                    s = pluck(f, 0.25, 0.5) * 0.18
                    i = int((t + beat / 2) * SR); out[i:i + len(s)] += s
            sh = rng.standard_normal(int(0.04 * SR)) * np.exp(-tt(0.04) / 0.012) * 0.06
            i = int((t + beat / 2) * SR); out[i:i + len(sh)] += sh
        else:
            if k % 4 == 0:
                for f in tones:
                    s = pad(f / 2 * 2, 4 * beat + 0.8) * 0.12
                    i = int(t * SR); out[i:i + len(s)] += s
                s = pad(NOTE[root] / 2, 4 * beat + 0.8) * 0.12
                i = int(t * SR); out[i:i + len(s)] += s
            f = tones[k % 3] * 2
            s = pluck(f, 0.9, 0.6) * 0.14
            i = int(t * SR); out[i:i + len(s)] += s
            for off, idx in ((0, 2), (2, 1), (3, 0)):
                if k % 4 == off:
                    s = pluck(tones[idx] * 4, 1.2, 0.5) * 0.26
                    i = int(t * SR); out[i:i + len(s)] += s
        t += beat
        k += 1
    return out[:int(d * SR)] * env(d, 0.8, 1.2)


# ---------------------------------------------------------------------------------------------------------------
# the voices: levelled, then split into lines
# ---------------------------------------------------------------------------------------------------------------
CUTS_FILE = os.path.join(ROOT, 'kids-data', 'cuts.json')
MANUAL = json.load(open(CUTS_FILE)) if os.path.exists(CUTS_FILE) else {}
voices = []  # (audio number, samples, [line indices], cuts)
for n, (a, b) in enumerate(GROUPS, start=1):
    p = os.path.join(VOZ, f'{n:02d}.mp3')
    x = decode(p)
    g = 10 ** ((TARGET_LUFS - lufs(p)) / 20)
    x = x * g
    nz = np.where(np.abs(x) > 0.004)[0]
    trim0 = max(0, nz[0] - int(0.03 * SR))
    x = x[trim0:nz[-1] + int(0.05 * SR)]  # trim the silence at both ends
    cuts = split_block(x, L[a:b])
    # manual cut points: {"14": {"21": seconds in the original file where script line 21 ENDS}}
    for ln, sec in MANUAL.get(str(n), {}).items():
        k = int(ln) - a
        if 0 <= k < len(cuts) + 1 and k < len(cuts):
            cuts[k] = sec - trim0 / SR
    print(f'audio {n}: cuts at', [round(c + trim0 / SR, 2) for c in cuts])
    voices.append((n, x, list(range(a, b)), cuts))

# ---------------------------------------------------------------------------------------------------------------
# the timeline: (kind, ...) in order; every voice block can be broken at a line boundary to insert an event
# ---------------------------------------------------------------------------------------------------------------
def line_index(text_start):
    return next(i for i, l in enumerate(L) if l[2].startswith(text_start))


I_ASK = line_index('¡Niños! ¿Ustedes saben')       # then 3 s of silence for the children
I_MATEO = line_index('¡Por supuesto! Vamos a abrir')  # the Bible opens after this line
I_S4 = line_index('La misión continuaba')             # scene 4 starts
I_ST1 = line_index('Primera estación: la oración')
I_ST2 = line_index('Segunda estación: la Palabra')
I_ST3 = line_index('Tercera estación: la adoración')
I_S5 = line_index('¡Ahora sí entendí')
I_S6 = line_index('Y así, después de recorrer')
I_WIN = line_index('¡MISIÓN CUMPLIDA')
SCENE_OF = {i: l[0] for i, l in enumerate(L)}

# insertions BEFORE a given line (index): (seconds of gap, effect name)
BEFORE = {
    I_ASK + 1: (3.0, 'pause3'),
    I_MATEO + 1: (1.2, 'bible'),
    I_S4: (1.4, 'scene4'),
    I_ST1: (0.5, 'sign1'),
    I_ST2: (0.5, 'sign2'),
    I_ST3: (0.5, 'sign3'),
    I_S5: (1.2, 'scene5'),
    I_S6: (1.4, 'scene6'),
    I_WIN: (0.3, 'win'),
}
# whole-audio insertions before an audio number
BEFORE_AUDIO = {2: (3.9, 'phone'), 9: (2.6, 'siren'), 10: (3.6, 'truck'), 14: (1.4, 'scene3'), 1: (4.2, 'start')}
GAP = 0.32

voice = []      # (start, samples)
lines_tl = []   # dicts: line, speaker, start, end
events = []     # dicts: t, kind
scene_at = []   # (t, scene number)
t = 0.0
mix_len = 0
sfx = []        # (t, samples)
bed_changes = []  # (t, bed name)
bed_changes.append((0.0, 'aventura'))
pause_spans = []

for n, x, idxs, cuts in voices:
    if n in BEFORE_AUDIO:
        gap, name = BEFORE_AUDIO[n]
        if name == 'phone':
            sfx.append((t + 0.1, phone_ring())); events.append({'t': t + 0.1, 'kind': 'phone', 'd': 3.5})
        elif name == 'siren':
            sfx.append((t + 0.1, siren(gap))); events.append({'t': t + 0.1, 'kind': 'siren', 'd': gap})
        elif name == 'truck':
            sfx.append((t + 0.1, engine(gap))); sfx.append((t + 0.6, siren(gap - 1.0)))
            events.append({'t': t + 0.1, 'kind': 'truck', 'd': gap})
            bed_changes.append((t + gap - 0.3, 'divertida'))
        elif name == 'scene3':
            sfx.append((t + 0.1, chime())); events.append({'t': t + 0.1, 'kind': 'scene3', 'd': gap})
            bed_changes.append((t, 'suave'))
        if name == 'start':
            events.append({'t': 0.0, 'kind': 'title', 'd': 4.0})
        t += gap
    # break the audio at the cut points where an event goes
    bounds = [0.0] + cuts + [len(x) / SR]
    seg_start = t
    for k, li in enumerate(idxs):
        a, b = bounds[k], bounds[k + 1]
        if li in BEFORE and k > 0:
            gap, name = BEFORE[li]
            if name == 'pause3':
                events.append({'t': t, 'kind': 'pause3', 'd': gap}); pause_spans.append((t, t + gap)); sfx.append((t, ticks(gap))); sfx.append((t + gap - 0.15, chime((988, 1319))))
            elif name == 'bible':
                sfx.append((t + 0.1, page_turn())); events.append({'t': t + 0.1, 'kind': 'bible', 'd': gap + 3})
            elif name == 'scene4':
                sfx.append((t + 0.1, chime((523, 659, 784)))); sfx.append((t, engine(gap + 1.0)))
                events.append({'t': t, 'kind': 'scene4', 'd': gap}); bed_changes.append((t, 'aventura'))
            elif name.startswith('sign'):
                sfx.append((t, chime((784, 988, 1175)))); events.append({'t': t, 'kind': name, 'd': 6})
                if name == 'sign3':
                    bed_changes.append((t, 'cristiana'))
            elif name == 'scene5':
                sfx.append((t, chime())); events.append({'t': t, 'kind': 'scene5', 'd': gap}); bed_changes.append((t, 'suave'))
            elif name == 'scene6':
                sfx.append((t, engine(gap + 1.2))); events.append({'t': t, 'kind': 'scene6', 'd': gap}); bed_changes.append((t, 'victoria'))
            elif name == 'win':
                sfx.append((t, drumroll(1.1))); sfx.append((t + 1.1, fanfare())); events.append({'t': t, 'kind': 'roll', 'd': 1.1}); events.append({'t': t + 1.1, 'kind': 'win', 'd': 3.0}); t += 3.3
            t += gap if name != 'win' else gap
        elif li in BEFORE and k == 0 and BEFORE[li][1] in ('sign1', 'sign2', 'sign3', 'scene4', 'scene5', 'scene6', 'win'):
            gap, name = BEFORE[li]
            if name.startswith('sign'):
                sfx.append((t, chime((784, 988, 1175)))); events.append({'t': t, 'kind': name, 'd': 6})
                if name == 'sign3':
                    bed_changes.append((t, 'cristiana'))
            elif name == 'scene5':
                sfx.append((t, chime())); events.append({'t': t, 'kind': 'scene5', 'd': gap}); bed_changes.append((t, 'suave'))
            elif name == 'scene6':
                sfx.append((t, engine(gap + 1.2))); events.append({'t': t, 'kind': 'scene6', 'd': gap}); bed_changes.append((t, 'victoria'))
            elif name == 'win':
                sfx.append((t, drumroll(1.1))); sfx.append((t + 1.1, fanfare())); events.append({'t': t, 'kind': 'roll', 'd': 1.1}); events.append({'t': t + 1.1, 'kind': 'win', 'd': 3.0}); t += 3.3
            elif name == 'scene4':
                sfx.append((t, chime((523, 659, 784)))); events.append({'t': t, 'kind': 'scene4', 'd': gap}); bed_changes.append((t, 'aventura'))
            t += gap
        seg = x[int(a * SR):int(b * SR)].copy()
        f = int(0.006 * SR)
        seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        voice.append((t, seg))
        lines_tl.append({'line': li, 'speaker': L[li][1], 'scene': L[li][0], 'start': round(t, 3), 'end': round(t + len(seg) / SR, 3), 'expr': ACT[li][0], 'react': ACT[li][1], 'icon': ACT[li][2]})
        t += len(seg) / SR + (0.05 if k < len(idxs) - 1 else GAP)
    if n == 16:
        pass

# the end: a short siren, music and a fade
END_AT = t
sfx.append((t + 0.2, siren(1.4)))
events.append({'t': t + 0.2, 'kind': 'end', 'd': 2.0})
DUR = t + 4.2

N = int(DUR * SR) + SR
V = np.zeros(N)
for st, s in voice:
    i = int(st * SR)
    V[i:i + len(s)] += s

# the music: one bed per stretch, crossfaded
M = np.zeros(N)
bc = sorted(bed_changes)
for k, (st, name) in enumerate(bc):
    en = bc[k + 1][0] + 1.2 if k + 1 < len(bc) else DUR
    seg = bed(name, en - st)
    i = int(st * SR)
    M[i:i + len(seg)] += seg
# ducking: the music falls under the voices
h = int(0.05 * SR)
nfr = len(V) // h
venv = np.sqrt(np.mean(V[:nfr * h].reshape(nfr, h) ** 2, axis=1))
venv = np.convolve(venv / (venv.max() + 1e-9), np.ones(12) / 12, mode='same')
duck = np.repeat(1 - 0.88 * np.clip(venv * 6, 0, 1), h)
duck = np.pad(duck, (0, N - len(duck)), constant_values=1.0)
# the music gets a pocket where the voice lives (-7 dB between 300 Hz and 3.4 kHz), is ducked hard under speech and sits low
FM = np.fft.rfft(M)
fr = np.fft.rfftfreq(len(M), 1 / SR)
FM *= np.where((fr > 300) & (fr < 3400), 10 ** (-7 / 20), 1.0)
M = np.fft.irfft(FM, len(M))
M *= duck * 0.42
for a0, b0 in pause_spans:
    M[int(a0 * SR):int(b0 * SR)] *= 0.45
S = np.zeros(N)
for st, s in sfx:
    i = int(st * SR)
    S[i:i + len(s)] += s[:max(0, N - i)]
mix = V * 1.25 + M * 0.9 + S * 0.6
act = np.abs(V) > 0.01
print('voice vs music while speaking: %.1f dB' % (20 * np.log10(np.sqrt(np.mean((V * 1.25)[act] ** 2)) / (np.sqrt(np.mean((M * 0.9)[act] ** 2)) + 1e-9))))
peak = np.abs(mix).max()
mix = mix / peak * 0.9

os.makedirs('out/kids', exist_ok=True)
os.makedirs('public/kids', exist_ok=True)
pre = 'out/kids/mix-pre.wav'
data = (np.stack([mix[:int(DUR * SR)]] * 2, axis=1)).astype(np.float32)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', pre], input=data.tobytes(), check=True)
probe = subprocess.run(['ffmpeg', '-hide_banner', '-i', pre, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
meas = json.loads(probe[probe.rindex('{'):probe.rindex('}') + 1])
flt = f"loudnorm=I=-16:TP=-1.5:LRA=11:linear=true:measured_I={meas['input_i']}:measured_TP={meas['input_tp']}:measured_LRA={meas['input_lra']}:measured_thresh={meas['input_thresh']}:offset={meas['target_offset']}"
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', pre, '-af', flt, '-ar', '48000', '-c:a', 'pcm_s16le', 'public/kids/mix.wav'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'public/kids/mix.wav', '-c:a', 'libmp3lame', '-b:a', '160k', 'out/kids/audio-operacion-corazon.mp3'], check=True)

# the voice envelope per frame, for the mouths
fh = int(SR / FPS)
nf = int(DUR * FPS)
spk_env = {}
for sp in set(l['speaker'] for l in lines_tl):
    spk_env[sp] = np.zeros(nf)
for ln in lines_tl:
    for st, s in voice:
        if abs(st - ln['start']) < 1e-6:
            e = np.sqrt(np.mean(np.pad(s, (0, fh))[:(len(s) // fh) * fh].reshape(-1, fh) ** 2, axis=1))
            e = np.clip(e / 0.08, 0, 1)
            f0 = int(ln['start'] * FPS)
            arr = spk_env[ln['speaker']]
            arr[f0:f0 + len(e)] = np.maximum(arr[f0:f0 + len(e)], e[:max(0, nf - f0)])
tl = {'fps': FPS, 'duration': round(DUR, 2), 'lines': lines_tl, 'events': events, 'beds': [{'t': round(a, 2), 'name': b, 'bpm': BEDS[b][0]} for a, b in sorted(bed_changes)],
      'env': {k: [round(float(v), 2) for v in arr] for k, arr in spk_env.items()}}
json.dump(tl, open('src/kids/timeline.json', 'w'), ensure_ascii=False)
print(f'duration {DUR:.1f} s ({DUR / 60:.1f} min), {len(lines_tl)} lines, {len(events)} events, {len(bed_changes)} music changes')
print('pause for the children:', [(round(a, 1), round(b, 1)) for a, b in pause_spans])
