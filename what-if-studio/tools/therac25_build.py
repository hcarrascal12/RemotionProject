"""Build the Therac-25 short: timing, voice placement, synthesized sound and the mastered mix.

Run from the studio folder:

    python3 tools/therac25_build.py

Reads   src/therac25/plan.json and public/therac25/voice-raw.mp3
Writes  src/therac25/timeline.json   (shots, fx, marks, subtitle chunks; read by the Remotion composition)
        public/therac25/mix.wav      (voice + sound design, mastered to -14 LUFS, peaks under -1 dBTP)
        out/therac25/voice.wav, out/therac25/sfx.wav (stems, for checking)

Every sound is synthesized here with numpy (no sample library, no API), cued from the same plan as the picture,
so a retimed cue moves the image and its sound together.
"""
from __future__ import annotations

import json
import math
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 48000
ROOT = Path.cwd()
PLAN = ROOT / 'src/therac25/plan.json'
TIMELINE = ROOT / 'src/therac25/timeline.json'
PUBLIC = ROOT / 'public/therac25'
OUT = ROOT / 'out/therac25'

if not PLAN.exists():
    raise SystemExit('Run this from the studio folder (the one with src/therac25/plan.json).')

plan = json.loads(PLAN.read_text(encoding='utf-8'))
DUR = float(plan['duration'])
N = int(round(DUR * SR))
rng = np.random.default_rng(1985)

# ---------------------------------------------------------------------------------------------------------------
# Timing: phrases, words, marks, cues
# ---------------------------------------------------------------------------------------------------------------

STRONG = set('aeoáéó')
ACCENT_WEAK = set('íú')
VOWELS = set('aeiouáéíóúü')


def syllables(word: str) -> int:
    """Rough Spanish syllable count: vowel groups, split on hiatus (two strong vowels, or an accented i/u)."""
    w = word.lower()
    count, prev = 0, ''
    for ch in w:
        if ch in VOWELS:
            if prev not in VOWELS:
                count += 1
            elif (prev in STRONG and ch in STRONG) or ch in ACCENT_WEAK or prev in ACCENT_WEAK:
                count += 1
        prev = ch
    return max(1, count)


def spoken(text: str) -> str:
    bare = text.strip('.,:;!?¿¡')
    return plan['say'].get(bare, bare)


phrases: dict[str, dict] = {p['id']: dict(p) for p in plan['phrases']}
for ch in plan['chunks']:
    first = phrases[ch['phrases'][0]]
    offset = ch['dst'] - first['src'][0]
    ch['offset'] = offset
    for pid in ch['phrases']:
        p = phrases[pid]
        p['chunk'] = ch['id']
        p['dst'] = [p['src'][0] + offset, p['src'][1] + offset]

for p in phrases.values():
    words = []
    for tok in p['words'].split():
        key = None
        if tok.endswith('*'):
            key, tok = 'yellow', tok[:-1]
        elif tok.endswith('!'):
            key, tok = 'red', tok[:-1]
        weight = sum(syllables(s) for s in spoken(tok).split()) + 0.4
        words.append({'text': tok, 'key': key, 'w': weight})
    total = sum(w['w'] for w in words)
    t0, t1 = p['dst']
    acc = 0.0
    for w in words:
        w['start'] = round(t0 + (t1 - t0) * acc / total, 3)
        acc += w['w']
        w['end'] = round(t0 + (t1 - t0) * acc / total, 3)
    p['wordList'] = words

CUE = re.compile(r'^(p|e|w|m):([A-Za-z0-9]+)(?::(\d+))?([+-]\d+(?:\.\d+)?)?$')
marks: dict[str, float] = {}


def resolve(cue) -> float:
    if isinstance(cue, (int, float)):
        return float(cue)
    m = CUE.match(cue)
    if not m:
        raise SystemExit(f'Bad cue: {cue!r}')
    kind, ident, idx, off = m.groups()
    off = float(off) if off else 0.0
    if kind == 'm':
        base = marks[ident]
    elif kind == 'p':
        base = phrases[ident]['dst'][0]
    elif kind == 'e':
        base = phrases[ident]['dst'][1]
    else:
        base = phrases[ident]['wordList'][int(idx)]['start']
    return round(base + off, 3)


for name, cue in plan['marks'].items():
    marks[name] = resolve(cue)

shots = []
for s in plan['shots']:
    shots.append({k: v for k, v in s.items() if k != 'at'} | {'start': resolve(s['at'])})
shots.sort(key=lambda s: s['start'])
for i, s in enumerate(shots):
    s['end'] = shots[i + 1]['start'] if i + 1 < len(shots) else DUR

fx = sorted(({'t': resolve(e['at']), 'kind': e['kind']} for e in plan['fx']), key=lambda e: e['t'])

# Subtitle chunks: at most two words per hit; a long word stands alone so it can be set huge.
subs = []
ordered = sorted(phrases.values(), key=lambda p: p['dst'][0])
for pi, p in enumerate(ordered):
    groups, cur = [], []
    for w in p['wordList']:
        if cur and (len(cur) == 2 or len(w['text']) >= 9 or len(cur[0]['text']) >= 9):
            groups.append(cur)
            cur = []
        cur.append(w)
    if cur:
        groups.append(cur)
    nxt = ordered[pi + 1]['dst'][0] if pi + 1 < len(ordered) else DUR
    for gi, g in enumerate(groups):
        start = max(0.0, g[0]['start'] - 0.03)
        end = groups[gi + 1][0]['start'] - 0.03 if gi + 1 < len(groups) else min(p['dst'][1] + 0.3, nxt - 0.05)
        subs.append({
            'start': round(start, 3),
            'end': round(end, 3),
            'words': [{'text': w['text'], 'key': w['key']} for w in g],
        })

# Pace check: a visible change (cut or fx) at least every 2 s.
changes = sorted({round(s['start'], 3) for s in shots} | {round(e['t'], 3) for e in fx} | {DUR})
gaps = [(b - a, a) for a, b in zip(changes, changes[1:])]
worst = max(gaps)
print(f'Shots: {len(shots)}  fx: {len(fx)}  subtitle hits: {len(subs)}')
print(f'Longest stretch without a visual change: {worst[0]:.2f} s (from {worst[1]:.2f} s)')
for g, a in gaps:
    if g > 2.0:
        print(f'  WARN: {g:.2f} s without a change from {a:.2f} s')
for s in shots:
    print(f"  {s['id']} {s['kind']:<8} {s.get('variant', ''):<9} {s['start']:6.2f}-{s['end']:6.2f}  ({s['end'] - s['start']:.2f} s)")

timeline = {
    'id': plan['id'],
    'fps': plan['fps'],
    'width': plan['width'],
    'height': plan['height'],
    'duration': DUR,
    'shots': shots,
    'fx': fx,
    'marks': marks,
    'subs': subs,
    'phrases': [{'id': p['id'], 'start': round(p['dst'][0], 3), 'end': round(p['dst'][1], 3)} for p in ordered],
}
TIMELINE.write_text(json.dumps(timeline, ensure_ascii=False, indent=1), encoding='utf-8')
print(f'Wrote {TIMELINE.relative_to(ROOT)}')

if '--timing-only' in sys.argv:
    raise SystemExit(0)

# ---------------------------------------------------------------------------------------------------------------
# Voice: cut each chunk from the take and place it on the scene clock
# ---------------------------------------------------------------------------------------------------------------


def decode(path: Path) -> np.ndarray:
    raw = subprocess.run(
        ['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


take = decode(ROOT / plan['voice'])
voice = np.zeros(N)
for ch in plan['chunks']:
    ps = [phrases[pid] for pid in ch['phrases']]
    s0 = max(0.0, ps[0]['src'][0] - 0.04)
    s1 = min(len(take) / SR, ps[-1]['src'][1] + 0.16)
    seg = take[int(s0 * SR):int(s1 * SR)].copy()
    fade = int(0.008 * SR)
    seg[:fade] *= np.linspace(0, 1, fade)
    seg[-fade:] *= np.linspace(1, 0, fade)
    d0 = int(round((s0 + ch['offset']) * SR))
    if d0 < 0:
        seg, d0 = seg[-d0:], 0
    d1 = min(N, d0 + len(seg))
    voice[d0:d1] += seg[:d1 - d0]
voice *= 0.95 / max(1e-9, np.abs(voice).max())

# ---------------------------------------------------------------------------------------------------------------
# Sound design: every clip synthesized
# ---------------------------------------------------------------------------------------------------------------


def tt(dur: float) -> np.ndarray:
    return np.arange(int(dur * SR)) / SR


def noise(n: int) -> np.ndarray:
    return rng.standard_normal(n)


def lp(x: np.ndarray, k: int) -> np.ndarray:
    """Moving-average low-pass (k samples)."""
    if k <= 1:
        return x
    c = np.cumsum(np.concatenate([np.zeros(k), x]))
    return (c[k:] - c[:-k]) / k


def hp(x: np.ndarray, k: int) -> np.ndarray:
    return x - lp(x, k)


def sweep(f0: float, f1: float, dur: float, curve: str = 'exp') -> np.ndarray:
    t = tt(dur)
    p = t / dur
    f = f0 * (f1 / f0) ** p if curve == 'exp' else f0 + (f1 - f0) * p
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def env(dur: float, tau: float, attack: float = 0.002) -> np.ndarray:
    t = tt(dur)
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-t / tau)


def fades(x: np.ndarray, fin: float = 0.003, fout: float = 0.01) -> np.ndarray:
    x = x.copy()
    a, b = int(fin * SR), int(fout * SR)
    if a:
        x[:a] *= np.linspace(0, 1, a)
    if b:
        x[-b:] *= np.linspace(1, 0, b)
    return x


def partials(freqs, taus, dur: float) -> np.ndarray:
    t = tt(dur)
    return sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28)) * np.exp(-t / tau) for f, tau in zip(freqs, taus))


def ping(f: float, tau: float, dur: float = 0.06) -> np.ndarray:
    t = tt(dur)
    return np.sin(2 * np.pi * f * t) * np.exp(-t / tau)


def click_clip(pitch: float = 3500, body: float = 220) -> np.ndarray:
    d = 0.07
    n = int(d * SR)
    out = ping(pitch, 0.004, d) * 0.8
    out += hp(noise(n), 3) * np.exp(-tt(d) / 0.003) * 0.6
    out += ping(body, 0.025, d) * 0.9
    return out


def place_many(times, clip_fn, dur: float) -> np.ndarray:
    out = np.zeros(int(dur * SR) + SR // 4)
    for t in times:
        c = clip_fn()
        i = int(t * SR)
        j = min(len(out), i + len(c))
        out[i:j] += c[:j - i]
    return out


def k_impact(e):
    d = 1.1
    t = tt(d)
    body = sweep(120, 38, d) * np.exp(-t / 0.3)
    thump = lp(noise(len(t)), 40) * np.exp(-t / 0.05) * 3
    snap = hp(noise(len(t)), 5) * np.exp(-t / 0.006) * 0.7
    return np.tanh(1.8 * (body + thump + snap))


def k_slam(e):
    d = 0.6
    t = tt(d)
    body = sweep(170, 50, d) * np.exp(-t / 0.13)
    thump = lp(noise(len(t)), 25) * np.exp(-t / 0.04) * 3
    return np.tanh(2.2 * (body + thump))


def k_sub(e):
    d = 1.5
    return sweep(54, 30, d) * env(d, 0.55, 0.006)


def k_alarm(e):
    d = e.get('dur', 2.0)
    t = tt(d)
    period = 0.18
    on = (t % period) < 0.11
    idx = (t // period).astype(int)
    f = np.where(idx % 2 == 0, 988.0, 1319.0)
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + 0.3 * np.sin(3 * ph)
    gate = lp(on.astype(float), int(0.003 * SR))
    return fades(tone * gate * np.linspace(1, 0.55, len(t)))


def k_tickramp(e):
    d = e.get('dur', 0.8)
    times, x, iv = [], 0.0, 0.09
    while x < d:
        times.append(x)
        x += iv
        iv = max(0.018, iv * 0.86)
    return place_many(times, lambda: ping(rng.uniform(2900, 3600), 0.006, 0.03) + hp(noise(int(0.03 * SR)), 2) * np.exp(-tt(0.03) / 0.002) * 0.5, d)


def k_glitch(e):
    d = e.get('dur', 0.3)
    n = int(d * SR)
    out = np.zeros(n)
    i = 0
    while i < n:
        seg = int(rng.uniform(0.018, 0.045) * SR)
        j = min(n, i + seg)
        tseg = np.arange(j - i) / SR
        choice = rng.integers(0, 3)
        if choice == 0:
            out[i:j] = np.sign(np.sin(2 * np.pi * rng.uniform(80, 1800) * tseg))
        elif choice == 1:
            out[i:j] = noise(j - i)
        i = j
    hold = 8
    out = np.repeat(out[::hold], hold)[:n]
    out = np.round(out * 4) / 4
    return fades(out * 0.7)


def k_pop(e):
    d = 0.09
    return sweep(500, 1300, d) * env(d, 0.025)


def k_drone(e):
    d = e.get('dur', DUR)
    t = tt(d)
    swell = 0.55 + 0.45 * (t / d) ** 1.5
    tone = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 55.4 * t) + 0.45 * np.sin(2 * np.pi * 82.4 * t)
            + 0.2 * np.sin(2 * np.pi * 110.3 * t))
    air = lp(noise(len(t)), 300) * 6
    am = 0.8 + 0.2 * np.sin(2 * np.pi * 0.23 * t)
    return fades((tone + air) * swell * am, 0.02, 0.4)


def k_stamp(e):
    d = 0.4
    t = tt(d)
    return np.tanh(2.5 * (np.sin(2 * np.pi * 85 * t) * np.exp(-t / 0.08) + lp(noise(len(t)), 12) * np.exp(-t / 0.02) * 2))


def k_click(e):
    return click_clip()


def k_ecg(e):
    until = resolve(e['until'])
    d = max(0.1, until - resolve(e['at']))
    times = list(np.arange(0, d - 0.05, 0.32))
    return place_many(times, lambda: fades(np.sin(2 * np.pi * 1000 * tt(0.075)), 0.003, 0.02), d)


def k_flatline(e):
    d = e.get('dur', 1.2)
    return fades(np.sin(2 * np.pi * 1000 * tt(d)), 0.004, 0.25)


def k_hum(e):
    d = e.get('dur', 2.0)
    t = tt(d)
    tone = sum(np.sin(2 * np.pi * 60 * k * t) / k for k in range(1, 9))
    trem = 0.75 + 0.25 * np.sin(2 * np.pi * 7 * t)
    return fades(tone * trem, 0.08, 0.2)


def k_charge(e):
    d = e.get('dur', 1.0)
    t = tt(d)
    s = sweep(200, 2400, d) + 0.4 * sweep(400, 4800, d)
    return fades(s * (t / d) ** 1.6, 0.01, 0.02)


def k_clatter(e):
    d = e.get('dur', 1.5)
    times, x = [], 0.0
    while x < d:
        times.append(x)
        x += rng.uniform(0.03, 0.065)
    return place_many(times, lambda: click_clip(rng.uniform(2600, 4200), rng.uniform(170, 280)) * rng.uniform(0.5, 1.0), d)


def k_spark(e):
    d = 0.28
    n = int(d * SR)
    out = np.zeros(n)
    for _ in range(40):
        i = int(rng.uniform(0, 1) ** 2 * (n - 100))
        out[i:i + 40] += hp(noise(40), 2) * rng.uniform(0.3, 1.0)
    out += np.sin(2 * np.pi * 6200 * tt(d)) * np.exp(-tt(d) / 0.05) * 0.3
    return out


def k_typing(e):
    d = e.get('dur', 1.2)
    times = list(np.arange(0, d, 0.11) + rng.uniform(-0.015, 0.015, len(np.arange(0, d, 0.11))).clip(0))
    return place_many(times, lambda: click_clip(rng.uniform(3000, 3800), 200), d)


def k_blip(e):
    a = fades(np.sin(2 * np.pi * 1500 * tt(0.08)))
    b = fades(np.sin(2 * np.pi * 900 * tt(0.1)))
    return np.concatenate([a, np.zeros(int(0.02 * SR)), b])


def k_coin(e):
    d = 0.6
    hit = partials([2093, 2793, 4310, 5400], [0.35, 0.25, 0.15, 0.1], d)
    out = np.concatenate([hit, np.zeros(int(0.15 * SR))])
    i = int(0.12 * SR)
    out[i:i + len(hit)] += hit * 0.5
    return out


def k_clank(e):
    d = 0.8
    t = tt(d)
    ring = partials([310, 870, 1460, 2210, 3120], [0.35, 0.22, 0.15, 0.1, 0.07], d)
    snap = hp(noise(len(t)), 4) * np.exp(-t / 0.008) * 2
    return np.tanh(1.5 * (ring + snap))


def k_rattle(e):
    d = e.get('dur', 0.8)
    times = list(np.arange(0, d, 1 / 24))
    hits = [partials([520, 1340, 2600], [0.03, 0.02, 0.012], 0.05) for _ in times]
    out = np.zeros(int(d * SR) + SR // 10)
    for k, (t0, h) in enumerate(zip(times, hits)):
        i = int(t0 * SR)
        out[i:i + len(h)] += h * (1 - k / len(times)) ** 1.5
    return out


def k_scrape(e):
    d = e.get('dur', 0.5)
    n = int(d * SR)
    band = lp(noise(n), 4) - lp(noise(n), 40)
    rough = 0.5 + 0.5 * np.abs(lp(noise(n), 400)) * 8
    return fades(band * rough, 0.03, 0.05)


def k_zap(e):
    d = e.get('dur', 1.2)
    t = tt(d)
    saw = 2 * ((70 * t) % 1) - 1 + 0.6 * (2 * ((140.7 * t) % 1) - 1)
    buzz = np.tanh(4 * (saw + lp(noise(len(t)), 3) * 0.6))
    stutter = 0.6 + 0.4 * (np.sin(2 * np.pi * 16 * t) > 0)
    whine = np.sin(2 * np.pi * 3000 * t) * np.exp(-t / 0.4) * 0.3
    return fades((buzz * stutter + whine) * np.exp(-t / (d * 0.7)), 0.005, 0.1)


def k_crt(e):
    d = 0.9
    t = tt(d)
    thump = np.sin(2 * np.pi * 60 * t) * np.exp(-t / 0.15) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t))
    whine = np.sin(2 * np.pi * 7800 * t) * np.exp(-t / 0.5) * 0.15
    return fades(thump + whine)


def k_buzzer(e):
    d = e.get('dur', 0.7)
    t = tt(d)
    tone = np.sign(np.sin(2 * np.pi * 196 * t)) + np.sign(np.sin(2 * np.pi * 233 * t))
    gate = lp(((t % 0.25) < 0.19).astype(float), int(0.004 * SR))
    return fades(lp(tone, 3) * gate * 0.5)


def k_boom(e):
    d = e.get('dur', 1.4)
    t = tt(d)
    rumble = lp(noise(len(t)), 60) * 8 * np.exp(-t / (d * 0.35))
    sub = sweep(72, 28, d) * np.exp(-t / (d * 0.45))
    return np.tanh(1.6 * (rumble + sub))


def k_crack(e):
    d = 0.35
    n = int(d * SR)
    out = np.zeros(n)
    for k in range(7):
        i = int(rng.uniform(0, 0.12) * SR)
        c = hp(noise(int(0.03 * SR)), 2) * np.exp(-tt(0.03) / 0.004)
        c += ping(rng.uniform(2300, 4200), 0.01, 0.03)
        out[i:i + len(c)] += c
    return out


def k_heartbeat(e):
    def beat(f):
        d = 0.22
        t = tt(d)
        return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t)) * env(d, 0.07, 0.008)
    out = np.zeros(int(0.6 * SR))
    a = beat(55)
    b = beat(50) * 0.75
    out[:len(a)] += a
    i = int(0.28 * SR)
    out[i:i + len(b)] += b
    return out


def k_riser(e):
    d = e.get('dur', 1.0)
    t = tt(d)
    p = t / d
    n = len(t)
    nz = (1 - p) * lp(noise(n), 30) * 4 + p * hp(noise(n), 4)
    tone = sweep(180, 1500, d) + 0.5 * sweep(360, 3000, d)
    return fades((nz * 0.7 + tone * 0.5) * p ** 2.2, 0.01, 0.004)


def k_whoosh(e):
    d = e.get('dur', 0.35)
    t = tt(d)
    p = t / d
    n = len(t)
    nz = (1 - p) * hp(noise(n), 3) + p * lp(noise(n), 25) * 3
    shape = np.sin(np.pi * p) ** 2 * (1 - 0.4 * p)
    return fades(nz * shape, 0.005, 0.01)


KINDS = {name[2:]: fn for name, fn in globals().items() if name.startswith('k_')}
LIGHT_DUCK = {'impact', 'slam', 'sub', 'boom', 'click', 'stamp', 'clank'}
CENTER = {'impact', 'slam', 'sub', 'boom', 'drone', 'heartbeat', 'riser'}

events = [dict(e) for e in plan['sfx']]
for e in events:
    e['t'] = resolve(e['at'])

# Automatic transition sound at every cut: a riser into it and a whoosh on it; scene cuts add a sub hit.
for prev, s in zip(shots, shots[1:]):
    plen = s['start'] - prev['start']
    if s.get('scene'):
        r = min(1.2, 0.6 * plen)
        events.append({'t': s['start'] - r, 'kind': 'riser', 'dur': r, 'gain': -9})
        events.append({'t': s['start'], 'kind': 'sub', 'gain': -7})
    else:
        r = min(0.7, 0.5 * plen)
        events.append({'t': s['start'] - r, 'kind': 'riser', 'dur': r, 'gain': -15})
    events.append({'t': max(0.0, s['start'] - 0.1), 'kind': 'whoosh', 'dur': 0.3, 'gain': -10})

sfx_l = np.zeros(N + SR * 3)
sfx_r = np.zeros(N + SR * 3)
duck_mask_l = np.zeros_like(sfx_l)  # the part of the stem that ducks lightly
duck_mask_r = np.zeros_like(sfx_r)
light_l = np.zeros_like(sfx_l)
light_r = np.zeros_like(sfx_r)
free_l = np.zeros_like(sfx_l)
free_r = np.zeros_like(sfx_r)

for e in sorted(events, key=lambda e: e['t']):
    clip = KINDS[e['kind']](e)
    peak = np.abs(clip).max()
    if peak < 1e-9:
        continue
    clip = clip / peak * 10 ** (e.get('gain', -6) / 20)
    pan = 0.0 if e['kind'] in CENTER else float(rng.uniform(-0.45, 0.45))
    gl, gr = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
    i = int(round(e['t'] * SR))
    j = min(len(sfx_l), i + len(clip))
    c = clip[:j - i]
    if e.get('duck', True) is False:
        free_l[i:j] += c * gl
        free_r[i:j] += c * gr
    elif e['kind'] in LIGHT_DUCK:
        light_l[i:j] += c * gl
        light_r[i:j] += c * gr
    else:
        duck_mask_l[i:j] += c * gl
        duck_mask_r[i:j] += c * gr

# Duck under the voice: a smoothed envelope of the placed voice.
venv = lp(np.abs(voice), int(0.04 * SR))
venv = np.clip(venv / (0.22 * venv.max()), 0, 1)
venv = np.concatenate([venv, np.zeros(len(sfx_l) - N)])
duck = 1 - 0.62 * venv
duck_light = 1 - 0.3 * venv
sfx_l = duck_mask_l * duck + light_l * duck_light + free_l
sfx_r = duck_mask_r * duck + light_r * duck_light + free_r
sfx_l, sfx_r = sfx_l[:N], sfx_r[:N]

SFX_BUS = 0.45
mix_l = voice + SFX_BUS * sfx_l
mix_r = voice + SFX_BUS * sfx_r

# Mix check: moments while a word is spoken where the effects come within 3 dB of the voice.
win = int(0.05 * SR)
crowded = []
for p in ordered:
    a, b = int(p['dst'][0] * SR), int(p['dst'][1] * SR)
    for k in range(a, b - win, win):
        v = np.sqrt(np.mean(voice[k:k + win] ** 2))
        s = np.sqrt(np.mean((SFX_BUS * 0.5 * (sfx_l[k:k + win] + sfx_r[k:k + win])) ** 2))
        if v > 1e-4 and s > v * 10 ** (-3 / 20):
            crowded.append(k / SR)
merged = []
for t0 in crowded:
    if merged and t0 - merged[-1][1] <= 0.06:
        merged[-1][1] = t0 + 0.05
    else:
        merged.append([t0, t0 + 0.05])
print(f'Mix check: {len(merged)} moments where effects come within 3 dB of the voice')
for a, b in merged:
    print(f'  {a:6.2f}-{b:6.2f} s')

OUT.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(parents=True, exist_ok=True)


def write_wav(path: Path, chans) -> None:
    data = np.stack(chans, axis=1).astype(np.float32)
    subprocess.run(
        ['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', str(len(chans)), '-i', '-',
         '-c:a', 'pcm_s24le', str(path)],
        input=data.tobytes(), check=True,
    )


pre = OUT / 'mix-pre.wav'
peak = max(np.abs(mix_l).max(), np.abs(mix_r).max())
write_wav(pre, [mix_l / peak * 0.9, mix_r / peak * 0.9])
write_wav(OUT / 'voice.wav', [voice])
sp = max(np.abs(sfx_l).max(), np.abs(sfx_r).max())
write_wav(OUT / 'sfx.wav', [sfx_l / sp * 0.9, sfx_r / sp * 0.9])

# Master: two-pass loudnorm to -14 LUFS integrated, -1 dBTP.
probe = subprocess.run(
    ['ffmpeg', '-hide_banner', '-i', str(pre), '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'],
    capture_output=True, text=True, check=True,
).stderr
meas = json.loads(probe[probe.rindex('{'):probe.rindex('}') + 1])
flt = (
    'loudnorm=I=-14:TP=-1:LRA=11:linear=true'
    f":measured_I={meas['input_i']}:measured_TP={meas['input_tp']}:measured_LRA={meas['input_lra']}"
    f":measured_thresh={meas['input_thresh']}:offset={meas['target_offset']}"
)
final = PUBLIC / 'mix.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(pre), '-af', flt, '-ar', str(SR), '-c:a', 'pcm_s24le', str(final)],
               check=True)
check = subprocess.run(
    ['ffmpeg', '-hide_banner', '-i', str(final), '-af', 'loudnorm=I=-14:TP=-1:print_format=json', '-f', 'null', '-'],
    capture_output=True, text=True, check=True,
).stderr
res = json.loads(check[check.rindex('{'):check.rindex('}') + 1])
print(f"Master: {res['input_i']} LUFS integrated, {res['input_tp']} dBTP true peak  ->  {final.relative_to(ROOT)}")
print(f'SFX events: {len(events)}')
