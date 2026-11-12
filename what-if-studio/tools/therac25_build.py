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
# Place the sentences one after another with a breathing pause (the chunk's `gap`, 0.3-0.5 s) between them. Inside a
# chunk the take's own silences are kept, so a comma still sounds like a comma. The first chunk starts where its
# phrase starts in the take, so the hook lands on frame 0.
cursor = None
for ch in plan['chunks']:
    first = phrases[ch['phrases'][0]]
    dst = first['src'][0] if cursor is None else cursor + ch['gap']
    offset = dst - first['src'][0]
    ch['offset'] = offset
    for pid in ch['phrases']:
        p = phrases[pid]
        p['chunk'] = ch['id']
        p['dst'] = [p['src'][0] + offset, p['src'][1] + offset]
    cursor = phrases[ch['phrases'][-1]]['dst'][1]

# The film ends `outro` seconds after the last word: the question card and the rush into ENTER.
DUR = round(math.ceil((cursor + plan['outro']) * 20) / 20, 2)
N = int(round(DUR * SR))
print(f'Voice ends at {cursor:.2f} s; film length {DUR:.2f} s')

for p in phrases.values():
    words = []
    for gi, group in enumerate(p['words'].split('|')):  # '|' separates the 2-3 word caption groups
        for tok in group.split():
            key = None
            if tok.endswith('*'):
                key, tok = 'yellow', tok[:-1]
            elif tok.endswith('!'):
                key, tok = 'red', tok[:-1]
            weight = sum(syllables(s) for s in spoken(tok).split()) + 0.4
            words.append({'text': tok, 'key': key, 'w': weight, 'group': gi})
    total = sum(w['w'] for w in words)
    t0, t1 = p['dst']
    acc = 0.0
    for w in words:
        w['start'] = round(t0 + (t1 - t0) * acc / total, 3)
        acc += w['w']
        w['end'] = round(t0 + (t1 - t0) * acc / total, 3)
    p['wordList'] = words

CUE = re.compile(r'^(p|e|w|m):([A-Za-z0-9]+)(?::(\d+))?([+-]\d+(?:\.\d+)?)?$')
FROM_END = re.compile(r'^D([+-]\d+(?:\.\d+)?)$')  # D-3.0: three seconds before the end of the film
marks: dict[str, float] = {}


def resolve(cue) -> float:
    if isinstance(cue, (int, float)):
        return float(cue)
    m = FROM_END.match(cue)
    if m:
        return round(DUR + float(m.group(1)), 3)
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

# Subtitle hits: the caption groups written in plan.json (2-3 words each, separated by '|'). A group changes on its
# first word and holds until the next group starts; the last group of a phrase lingers a moment into the pause.
subs = []
ordered = sorted(phrases.values(), key=lambda p: p['dst'][0])
for pi, p in enumerate(ordered):
    groups: dict[int, list] = {}
    for w in p['wordList']:
        groups.setdefault(w['group'], []).append(w)
    glist = [groups[k] for k in sorted(groups)]
    nxt = ordered[pi + 1]['dst'][0] if pi + 1 < len(ordered) else DUR
    for gi, g in enumerate(glist):
        start = max(0.0, g[0]['start'] - 0.03)
        end = glist[gi + 1][0]['start'] - 0.03 if gi + 1 < len(glist) else min(p['dst'][1] + 0.3, nxt - 0.05)
        subs.append({
            'start': round(start, 3),
            'end': round(end, 3),
            'words': [{'text': w['text'], 'key': w['key']} for w in g],
        })
sizes = [len(x['words']) for x in subs]
print(f'Caption groups: {len(subs)}  words per group: min {min(sizes)} max {max(sizes)}  mean {sum(sizes) / len(sizes):.1f}')

# Pace check: a visible change (cut or fx) at least every 2 s.
# Visual-language audit (El Dev Artificial): narrative (N) and impact (I) shots must alternate, never more than two
# of the same kind in a row, and a change every 2.5-4 s on average.
langs = [s.get('lang', '?') for s in shots]
run, worst_run = 1, 1
for a_, b_ in zip(langs, langs[1:]):
    run = run + 1 if a_ == b_ else 1
    worst_run = max(worst_run, run)
print('Languages: ' + ' '.join(f"{s['id']}{s.get('lang', '?')}" for s in shots))
print(f'Longest run of the same language: {worst_run}' + ('  WARN: more than 2 in a row' if worst_run > 2 else ''))
cuts = [s['start'] for s in shots] + [DUR]
lens = [b - a for a, b in zip(cuts, cuts[1:])]
print(f'Shots: {len(shots)}  hard fx: {len(fx)} (flash/shake only on the hook and at 100x)')
print(f'Shot length: min {min(lens):.2f} s  mean {sum(lens) / len(lens):.2f} s  max {max(lens):.2f} s')
for s_, l_ in zip(shots, lens):
    if l_ < 1.2 or l_ > 4.8:
        print(f"  WARN: {s_['id']} lasts {l_:.2f} s")
print(f'First cut at {shots[1]["start"]:.2f} s (target about 3 s)')
pauses = [b['dst'][0] - a['dst'][1] for a, b in zip(ordered, ordered[1:])]
print(f"Pauses between phrases: min {min(pauses):.2f} s  max {max(pauses):.2f} s")
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


def k_subdrop(e):
    """A dry low impact: a sine that falls from 85 Hz to 26 Hz, a soft transient on top, no high siren."""
    d = e.get('dur', 1.7)
    t = tt(d)
    ph = 2 * np.pi * np.cumsum(85 * (26 / 85) ** (t / d)) / SR
    body = np.sin(ph) * np.exp(-t / 0.55) * np.clip(t / 0.004, 0, 1)
    thump = lp(noise(len(t)), 60) * np.exp(-t / 0.035) * 2.5
    # a dry knock in the mid range (about 300-3000 Hz, 8 ms), so the hit also reads on a phone speaker
    knock = (lp(noise(len(t)), 8) - lp(noise(len(t)), 80)) * np.exp(-t / 0.008) * 2.2
    return fades(np.tanh(1.5 * (body * 1.2 + thump + knock)), 0.001, 0.12)


def k_tension(e):
    """A low electronic tone that creeps up a few semitones, with a slow beat and a dark rumble: tension without a siren."""
    d = e.get('dur', 2.8)
    t = tt(d)
    f = 49 + 9 * (t / d) ** 2
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph) + 0.5 * np.sin(2 * np.pi * np.cumsum(f * 1.012) / SR)
    rumble = lp(noise(len(t)), 120) * 6
    swell = smooth_env(t, d)
    return fades((tone + rumble * 0.4) * swell * (0.8 + 0.2 * np.sin(2 * np.pi * 4.5 * t)), 0.02, 0.3)


def smooth_env(t: np.ndarray, d: float) -> np.ndarray:
    return np.clip(t / 0.25, 0, 1) * np.clip((d - t) / 0.5, 0, 1)


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
CENTER = {'impact', 'slam', 'sub', 'boom', 'drone', 'heartbeat', 'riser', 'subdrop', 'tension'}

events = [dict(e) for e in plan['sfx']]
for e in events:
    e['t'] = resolve(e['at'])

# Automatic transition sound at every cut: a riser into it and a whoosh on it; scene cuts add a sub hit.
for prev, s in zip(shots, shots[1:]):
    plen = s['start'] - prev['start']
    if s.get('scene'):
        r = min(1.2, 0.6 * plen)
        events.append({'t': s['start'] - r, 'kind': 'riser', 'dur': r, 'gain': -12})
        events.append({'t': s['start'], 'kind': 'sub', 'gain': -9})
    else:
        r = min(0.7, 0.5 * plen)
        events.append({'t': s['start'] - r, 'kind': 'riser', 'dur': r, 'gain': -19})
    events.append({'t': max(0.0, s['start'] - 0.1), 'kind': 'whoosh', 'dur': 0.3, 'gain': -15})

sfx_l = np.zeros(N + SR * 3)
sfx_r = np.zeros(N + SR * 3)
duck_mask_l = np.zeros_like(sfx_l)  # the part of the stem that ducks lightly
duck_mask_r = np.zeros_like(sfx_r)
light_l = np.zeros_like(sfx_l)
light_r = np.zeros_like(sfx_r)
free_l = np.zeros_like(sfx_l)
free_r = np.zeros_like(sfx_r)

BED_LIFT_DB = {'tension': 2, 'hum': 5, 'drone': 4, 'crt': 4, 'charge': 3, 'ecg': 4, 'flatline': 3, 'heartbeat': 2, 'scrape': 2}

for e in sorted(events, key=lambda e: e['t']):
    clip = KINDS[e['kind']](e)
    peak = np.abs(clip).max()
    if peak < 1e-9:
        continue
    clip = clip / peak * 10 ** ((e.get('gain', -6) + BED_LIFT_DB.get(e['kind'], 0)) / 20)
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
duck = 1 - 0.8 * venv
duck_light = 1 - 0.55 * venv
sfx_l = duck_mask_l * duck + light_l * duck_light + free_l
sfx_r = duck_mask_r * duck + light_r * duck_light + free_r
sfx_l, sfx_r = sfx_l[:N], sfx_r[:N]

# ---------------------------------------------------------------------------------------------------------------
# Music: a dark pulse composed in code (A minor: Am - F - Dm - E, two bars each at 100 BPM), built in sections that
# follow the story, with the beat grid shifted so a downbeat lands on the 100x burst.
#   0-3 s       pad swell under the hook
#   3 s - E1    pad, bass and a kick on every beat
#   E1 - H1     plucked arpeggio with an echo, hats: the tension climbs
#   H1 - burst  snare on 2 and 4, a noise riser, hats on 16ths: the build
#   burst       one beat of silence, then the chord hits
#   after       pad and a heartbeat; fades out so the loop restarts on the hook's impact
# ---------------------------------------------------------------------------------------------------------------

BPM = 100
BEAT = 60 / BPM
GRID0 = marks['burst'] % BEAT
T_E = marks['beamOn'] - 0.12
T_H = marks['presionar'] - 0.9
T_BURST = marks['burst']
T_QUESTION = DUR - plan['outro']

CHORDS = [  # (bass, pad notes, arpeggio notes)
    (55.0, [110.0, 130.81, 164.81, 220.0], [220.0, 261.63, 329.63, 440.0]),          # Am
    (43.65, [87.31, 130.81, 174.61, 220.0], [174.61, 261.63, 349.23, 440.0]),         # F
    (36.71, [146.83, 174.61, 220.0, 293.66], [293.66, 349.23, 440.0, 587.33]),        # Dm
    (41.2, [123.47, 164.81, 207.65, 246.94], [246.94, 329.63, 415.3, 493.88]),        # E
]
BAR = 4 * BEAT
CHORD_LEN = 2 * BAR


def chord_at(t: float) -> int:
    return int(((t - GRID0) // CHORD_LEN) % 4)


def smooth(x: np.ndarray) -> np.ndarray:
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def add_clip(buf_l, buf_r, clip, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i < 0 or i >= len(buf_l):
        return
    j = min(len(buf_l), i + len(clip))
    c = clip[:j - i] * gain
    gl, gr = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
    buf_l[i:j] += c * gl
    buf_r[i:j] += c * gr


def section_gain(t: np.ndarray, t0: float, t1: float, fade: float = 0.8) -> np.ndarray:
    """1 between t0 and t1, ramping in and out over `fade` seconds."""
    return smooth((t - t0) / fade) * smooth((t1 - t) / fade)


def compose_music():
    t = np.arange(N) / SR
    L = np.zeros(N + SR * 2)
    R = np.zeros(N + SR * 2)

    # --- pad and bass, one chord at a time with soft crossfades; the cutoff opens as the story builds ---
    nchords = int((DUR - GRID0) // CHORD_LEN) + 2
    for n in range(-1, nchords):
        a = GRID0 + n * CHORD_LEN
        b = a + CHORD_LEN
        i0, i1 = max(0, int((a - 1.0) * SR)), min(N, int((b + 1.0) * SR))
        if i1 <= i0:
            continue
        tt_ = t[i0:i1]
        win = smooth((tt_ - a) / 1.0) * smooth((b - tt_) / 1.0)
        bass, pad, _ = CHORDS[chord_at(a + 0.01)]
        bright = 0.25 + 0.75 * smooth((tt_ - 3.0) / (T_BURST - 3.0))
        pad_l = np.zeros_like(tt_)
        pad_r = np.zeros_like(tt_)
        for f in pad:
            for k in range(1, 7):
                w = 1.0 / k ** 1.3 * (1 if k <= 2 else bright)
                pad_l += w * np.sin(2 * np.pi * k * f * 0.9965 * tt_ + 0.3 * k)
                pad_r += w * np.sin(2 * np.pi * k * f * 1.0035 * tt_ + 0.9 * k)
        trem = 0.88 + 0.12 * np.sin(2 * np.pi * 0.17 * tt_)
        padv = win * trem / len(pad)
        L[i0:i1] += pad_l * padv * 0.55
        R[i0:i1] += pad_r * padv * 0.55
        sub_ = (np.sin(2 * np.pi * bass * tt_) + 0.3 * np.sin(4 * np.pi * bass * tt_)) * win
        L[i0:i1] += sub_ * 0.5
        R[i0:i1] += sub_ * 0.5

    # section envelopes (applied to the pad and bass bed built above, so each section is a lift in level)
    bed = 0.35 + 0.65 * smooth((t - 0.2) / 2.8) + 0.15 * smooth((t - T_H) / 5.0)
    # the question card is a long hold: keep the tension bed at about 60 % through it and let the end fade finish it
    bed = bed * (1 - 0.4 * (t > T_QUESTION) * smooth((t - T_QUESTION) / 1.0))
    L[:N] *= bed
    R[:N] *= bed

    # --- kicks on every beat from 3 s, stronger as it builds; none after the burst ---
    def kick():
        d = 0.32
        tk = np.arange(int(d * SR)) / SR
        ph = 2 * np.pi * np.cumsum(110 * (48 / 110) ** (tk / d)) / SR
        return np.sin(ph) * np.exp(-tk / 0.1) + hp(noise(len(tk)), 8) * np.exp(-tk / 0.004) * 0.25

    K = kick()
    nbeat = int((DUR - GRID0) / BEAT) + 1
    for b in range(nbeat):
        tb = GRID0 + b * BEAT
        if tb < 3.0 or tb > T_BURST - 0.2:
            continue
        lvl = 0.45 if tb < T_E else 0.6 if tb < T_H else 0.8
        add_clip(L, R, K, tb, lvl)
        # the build adds a ghost kick on the "and" of 4
        if tb >= T_H and b % 4 == 3:
            add_clip(L, R, K, tb + BEAT / 2, 0.4)

    # --- plucked arpeggio with a ping-pong echo, from E1 to the burst ---
    def pluck(f):
        d = 0.5
        tp = np.arange(int(d * SR)) / SR
        w = np.sin(2 * np.pi * f * tp) + 0.4 * np.sin(4 * np.pi * f * tp) + 0.2 * np.sin(6 * np.pi * f * tp)
        return w * np.exp(-tp / 0.16) * np.clip(tp / 0.003, 0, 1)

    pat = [0, 1, 2, 3, 2, 1, 2, 1]
    n8 = int((DUR - GRID0) / (BEAT / 2)) + 1
    for k in range(n8):
        tn = GRID0 + k * BEAT / 2
        if tn < T_E or tn > T_BURST - 0.25:
            continue
        arp = CHORDS[chord_at(tn)][2]
        f = arp[pat[k % 8]]
        vel = 0.5 + 0.35 * smooth((tn - T_E) / (T_BURST - T_E))
        c = pluck(f)
        pan = -0.35 if k % 2 == 0 else 0.35
        add_clip(L, R, c, tn, 0.26 * vel, pan)
        for ti, (dly, g) in enumerate([(0.45, 0.45), (0.9, 0.22), (1.35, 0.1)]):
            add_clip(L, R, c, tn + dly, 0.26 * vel * g, -pan if ti % 2 == 0 else pan)

    # --- hats on 8ths from 8 s, on 16ths in the build ---
    def hat(open_=False):
        d = 0.09 if open_ else 0.04
        th = np.arange(int(d * SR)) / SR
        return hp(noise(len(th)), 3) * np.exp(-th / (0.03 if open_ else 0.01))

    H, HO = hat(), hat(True)
    n16 = int((DUR - GRID0) / (BEAT / 4)) + 1
    for k in range(n16):
        tn = GRID0 + k * BEAT / 4
        if tn < 8.0 or tn > T_BURST - 0.25:
            continue
        on8 = k % 2 == 0
        if tn < T_H and not on8:
            continue
        if tn < T_E and k % 4 != 0:
            continue
        lvl = 0.12 if tn < T_E else 0.2
        add_clip(L, R, HO if k % 8 == 4 else H, tn, lvl * (0.6 if not on8 else 1.0), 0.25 if on8 else -0.25)

    # --- snare on 2 and 4 in the build, with a noise riser into the burst ---
    def snare():
        d = 0.25
        ts = np.arange(int(d * SR)) / SR
        return (hp(noise(len(ts)), 4) * np.exp(-ts / 0.07) + 0.6 * np.sin(2 * np.pi * 190 * ts) * np.exp(-ts / 0.05))

    S = snare()
    for b in range(nbeat):
        tb = GRID0 + b * BEAT
        if tb < T_H or tb > T_BURST - 0.25 or b % 2 == 0:
            continue
        add_clip(L, R, S, tb, 0.35 + 0.35 * smooth((tb - T_H) / (T_BURST - T_H)))
    rise = k_riser({'dur': T_BURST - 0.2 - T_H})
    add_clip(L, R, rise, T_H, 0.55)

    # --- the drop: a beat of silence, then the chord and a low hit ---
    gap = (t > T_BURST - 0.2) & (t < T_BURST)
    L[:N][gap] *= 0.0
    R[:N][gap] *= 0.0
    hit = k_boom({'dur': 2.2})
    add_clip(L, R, hit, T_BURST, 0.9)
    add_clip(L, R, k_sub({}), T_BURST, 0.7)
    drop_pad = smooth((t - T_BURST) / 0.05) * (t < T_BURST + 3.0) * np.exp(-np.maximum(t - T_BURST, 0) / 1.6)
    for f in CHORDS[3][1] + [41.2, 82.41]:
        tone = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(4 * np.pi * f * t)
        L[:N] += 0.22 * tone * drop_pad
        R[:N] += 0.22 * tone * drop_pad

    # --- heartbeat pulse in the quiet after the burst, one low thump per 1.2 beats ---
    thump = k_heartbeat({})
    tb = T_BURST + 1.4
    while tb < DUR - 0.8:
        add_clip(L, R, thump, tb, 0.42 * (1 - smooth((tb - (DUR - 1.6)) / 1.0)))
        tb += BEAT * 1.4

    # --- fade in at the start, fade out at the end, so the loop restarts clean on the hook's impact ---
    env_ = smooth(t / 0.6) * smooth((DUR - t) / 0.7)
    return L[:N] * env_, R[:N] * env_


music_l, music_r = compose_music()
music_l /= max(1e-9, np.abs(music_l).max())
music_r /= max(1e-9, np.abs(music_r).max())

# Level the music: its average level sits 11 dB under the voice, then it ducks another 8 dB while words play.
voice_rms = np.sqrt(np.mean(voice[np.abs(voice) > 1e-3] ** 2))
music_rms = np.sqrt(np.mean(0.5 * (music_l ** 2 + music_r ** 2)))
MUSIC_UNDER_VOICE_DB = 11.0
music_gain = voice_rms * 10 ** (-MUSIC_UNDER_VOICE_DB / 20) / music_rms
vduck = np.clip(venv[:N] if len(venv) >= N else np.pad(venv, (0, N - len(venv))), 0, 1)
music_duck = 1 - 0.62 * vduck
music_l = music_l * music_gain * music_duck
music_r = music_r * music_gain * music_duck

SFX_BUS = 0.7

# Strategic silence: for 0.3 s before each reveal everything but the voice drops out, then the hit lands. The mask
# ends 20 ms early so the first sample of the reveal's own sound passes at full level.
VAC = float(plan.get('vacuum', 0.3))
vac = np.ones(N)
for cue in plan.get('vacuums', []):
    t1 = resolve(cue)
    vac[int(max(0.0, t1 - VAC - 0.02) * SR):int(max(0.0, t1 - 0.02) * SR)] = 0.0
vac = lp(vac, int(0.02 * SR))
sfx_l, sfx_r = sfx_l * vac, sfx_r * vac
music_l, music_r = music_l * vac, music_r * vac
print('Vacuums before reveals at ' + ', '.join(f"{resolve(c):.2f} s" for c in plan.get('vacuums', [])))

mix_l = voice + SFX_BUS * sfx_l + music_l
mix_r = voice + SFX_BUS * sfx_r + music_r

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
mp = max(np.abs(music_l).max(), np.abs(music_r).max())
write_wav(OUT / 'music.wav', [music_l / mp * 0.9, music_r / mp * 0.9])
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
