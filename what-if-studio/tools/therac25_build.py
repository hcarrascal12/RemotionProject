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
import os
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 48000
ROOT = Path.cwd()
EP = os.environ.get('EPISODE', 'therac25')  # the episode folder under src/, public/ and out/ (EPISODE=fallo02 for Fallo #02)
PLAN = ROOT / f'src/{EP}/plan.json'
TIMELINE = ROOT / f'src/{EP}/timeline.json'
PUBLIC = ROOT / f'public/{EP}'
OUT = ROOT / f'out/{EP}'

if not PLAN.exists():
    raise SystemExit(f'Run this from the studio folder (the one with src/{EP}/plan.json).')

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


# Voice takes: plan['voices'] holds, for each take, its file and where every phrase sits in it; plan['voice'] picks one.
if 'voices' in plan:
    _take = plan['voices'][plan['voice']]
    plan['voice'] = _take['file']
    for _p in plan['phrases']:
        _p['src'] = _take['src'][_p['id']]
        if _p['id'] in _take.get('tail', {}):
            _p['tail'] = _take['tail'][_p['id']]
        else:
            _p.pop('tail', None)
print(f"Voice take: {plan['voice']}")
phrases: dict[str, dict] = {p['id']: dict(p) for p in plan['phrases']}
# Place the sentences one after another with a breathing pause (the chunk's `gap`, 0.3-0.5 s) between them. Inside a
# chunk the take's own silences are kept, so a comma still sounds like a comma. The first chunk starts where its
# phrase starts in the take, so the hook lands on frame 0.
cursor = None
for ch in plan['chunks']:
    first = phrases[ch['phrases'][0]]
    dst = (plan.get('lead', first['src'][0]) if cursor is None else cursor + ch['gap'])  # plan 'lead': where the first word lands (0.05 s: the voice starts on the first frames)
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

# Snap word boundaries to the take: the syllable estimate puts each boundary within a syllable or so; the real gap
# between two words is usually a dip in the voice's energy. Look for the quietest 10 ms within +-0.11 s of each
# estimated boundary and move the boundary there when the dip is clearly quieter than the phrase around it.
def _envelope(path: Path, sr: int = 16000, hop: float = 0.01):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'],
                         check=True, capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    n = int(sr * hop)
    frames = len(x) // n
    rms = np.sqrt(np.mean(x[: frames * n].reshape(frames, n) ** 2, axis=1) + 1e-12)
    return 20 * np.log10(rms), hop


_db, _hop = _envelope(ROOT / plan['voice'])


_FUNCTION_WORDS = {'de', 'en', 'y', 'e', 'o', 'a', 'la', 'el', 'los', 'las', 'un', 'una', 'por', 'su', 'se', 'que', 'con', 'al', 'del', 'lo', 'le', 'me', 'mi', 'tu', 'es'}


def _word_dips(p):
    """Short gaps (20-70 ms) in the voice inside a phrase, where one word ends and the next begins: (onset time, depth in dB).
    The onset is where the voice comes back up. Longer gaps are pauses and are handled as speech-stretch edges."""
    a, b = int(p['src'][0] / _hop), int(p['src'][1] / _hop)
    if b <= a:
        return []
    body = float(np.median(_db[a:b]))
    off = p['dst'][0] - p['src'][0]
    m = _db[a:b] < body - 8
    out, i = [], 0
    while i < len(m):
        if m[i]:
            j = i
            while j < len(m) and m[j]:
                j += 1
            if 0.02 <= (j - i) * _hop < 0.07:
                out.append((round((a + j) * _hop + off - 0.01, 3), float(body - _db[a + i:a + j].min())))
            i = j
        else:
            i += 1
    return out


def _speech_segments(p, min_gap=0.07, floor=30.0):
    """The stretches of a phrase where the voice is really sounding, in film time: the pauses inside the phrase (a comma, a
    breath) are cut out, so words are spread over speech only. Silence in a take is about -70 dB against -12 dB speech."""
    a, b = int(p['src'][0] / _hop), int(p['src'][1] / _hop)
    if b <= a:
        return [tuple(p['dst'])]
    body = float(np.median(_db[a:b]))
    on = _db[a:b] > body - floor
    runs, start = [], None
    for i, v in enumerate(on):
        if v and start is None:
            start = i
        elif not v and start is not None:
            runs.append([start, i])
            start = None
    if start is not None:
        runs.append([start, len(on)])
    merged = []
    for r in runs:
        if merged and (r[0] - merged[-1][1]) * _hop < min_gap:
            merged[-1][1] = r[1]
        else:
            merged.append(r)
    off = p['dst'][0] - p['src'][0]
    segs = [((a + r0) * _hop + off, (a + r1) * _hop + off) for r0, r1 in merged if (r1 - r0) * _hop > 0.08]
    return segs or [tuple(p['dst'])]


for p in phrases.values():
    words = []
    for gi, group in enumerate(p['words'].split('|')):  # '|' separates the 2-3 word caption groups
        for tok in group.split():
            key = None
            anchor = None
            if '@' in tok:  # 'WORD@1.45': the word starts exactly 1.45 s after the phrase's first sound (a hand-checked time)
                tok, _a = tok.split('@', 1)
                anchor = float(_a)
            pause = tok.endswith('^')  # 'WORD^': the voice pauses after this word (anchors the words to the take's speech stretches)
            if pause:
                tok = tok[:-1]
            hidden = tok.endswith('~')  # 'WORD~': timed with the voice like any word, but not shown in the captions
            if hidden:
                tok = tok[:-1]
            if tok.endswith('*'):
                key, tok = 'yellow', tok[:-1]
            elif tok.endswith('!'):
                key, tok = 'red', tok[:-1]
            weight = sum(syllables(s) for s in spoken(tok).split()) + 0.4
            if plan.get('speechWarp') and tok.lower().strip('¿¡') in _FUNCTION_WORDS:
                weight = 0.55 * sum(syllables(s) for s in spoken(tok).split()) + 0.2  # unstressed little words go by quickly
            words.append({'text': tok, 'key': key, 'w': weight, 'group': gi, 'hidden': hidden, 'pause': pause, 'anchor': anchor})
    total = sum(w['w'] for w in words)
    t0, t1 = p['dst']
    segs = _speech_segments(p) if plan.get('speechWarp') else [(t0, t1)]  # plan 'speechWarp': skip the pauses inside a phrase
    breaks = [i + 1 for i, w in enumerate(words[:-1]) if w['pause']]
    if os.environ.get('DEBUG_SEGS') and plan.get('speechWarp'):
        print(f"[segs] {p['id']}: " + ' '.join(f'{a:.2f}-{b:.2f}' for a, b in segs) + f"  markers after word idx {[b - 1 for b in breaks]}  words={len(words)}")
    if os.environ.get('DEBUG_SEGS') and plan.get('speechWarp') and len(segs) > 1:
        import itertools
        durs = [b - a for a, b in segs]
        dt = sum(durs)
        wt = sum(w['w'] for w in words)
        cands = []
        for combo in itertools.combinations(range(1, len(words)), len(segs) - 1):
            edges = [0] + list(combo) + [len(words)]
            fr = [sum(w['w'] for w in words[edges[k]:edges[k + 1]]) / wt for k in range(len(segs))]
            cost = sum(abs(fr[k] - durs[k] / dt) for k in range(len(segs)))
            cands.append((cost, combo))
        for cost, combo in sorted(cands)[:int(os.environ.get("DEBUG_TOP", "3"))]:
            print(f"    cost {cost:.3f}: " + ' | '.join(' '.join(w['text'] for w in words[e0:e1]) for e0, e1 in zip([0] + list(combo), list(combo) + [len(words)])))
    if plan.get('speechWarp') and breaks and len(segs) == len(breaks) + 1:
        # anchored: the words between two markers share one speech stretch (spread by syllable weight inside it)
        edges = [0] + breaks + [len(words)]
        for k in range(len(segs)):
            grp = words[edges[k]:edges[k + 1]]
            tot = sum(w['w'] for w in grp)
            a0, b0 = segs[k]
            acc = 0.0
            for w in grp:
                w['start'] = round(a0 + (b0 - a0) * acc / tot, 3)
                acc += w['w']
                w['end'] = round(a0 + (b0 - a0) * acc / tot, 3)
        p['wordList'] = words
        p['segs'] = segs
        continue
    if plan.get('speechWarp') and breaks:
        print(f"WARNING {p['id']}: {len(segs)} speech stretches but {len(breaks)} pause markers; using the plain warp")
    speech = sum(b - a for a, b in segs)

    def at(frac, end=False):
        d = frac * speech
        for a, b in segs:
            if d < (b - a) - 1e-6 or (end and d <= (b - a) + 1e-6):
                return a + d
            d -= b - a
        return segs[-1][1]
    acc = 0.0
    for w in words:
        w['start'] = round(at(acc / total), 3)
        acc += w['w']
        w['end'] = round(at(acc / total, end=True), 3)
    p['wordList'] = words


_snapped = 0
for p in phrases.values():
    ws = p['wordList']
    if len(ws) < 2:
        continue
    off = p['dst'][0] - p['src'][0]
    a, b = int(p['src'][0] / _hop), int(p['src'][1] / _hop)
    body = np.median(_db[a:b]) if b > a else -30.0
    bounds = [w['start'] for w in ws[1:]]
    seg_starts = [a for a, _ in p.get('segs', [])]
    dips = _word_dips(p) if plan.get('speechWarp') else []
    for i, est in enumerate(bounds):
        if any(abs(est - a) < 0.002 for a in seg_starts):
            continue  # a word that opens a speech stretch (after a pause) already sits on its onset
        if plan.get('speechWarp'):
            # the clearest word gap near the estimate (deeper and closer is better); no clear gap: keep the estimate
            prev = bounds[i - 1] if i > 0 else ws[0]['start']
            best = None
            for tt, depth in dips:
                if abs(tt - est) <= 0.2 and tt > prev + 0.06:
                    sc = min(depth, 16.0) - 6 - 40 * abs(tt - est)  # depth counts up to 16 dB: a deep consonant closure must not beat a nearer word gap
                    if sc > 0 and (best is None or sc > best[0]):
                        best = (sc, tt)
            if os.environ.get('DEBUG_SEGS') and p['id'] in os.environ['DEBUG_SEGS'].split(','):
                print(f"  [snap] {p['id']} {ws[i + 1]['text']}: est {est:.3f} -> {best[1] if best else est:.3f}  (dips near: " + ', '.join(f'{tt:.2f}/{d:.0f}dB' for tt, d in dips if abs(tt - est) <= 0.3) + ')')
            if best:
                bounds[i] = best[1]
                _snapped += 1
            continue
        lo = max(est - 0.11, (ws[i]['start'] + est) / 2)
        hi = min(est + 0.11, (est + ws[i + 1]['end']) / 2)
        i0, i1 = int((lo - off) / _hop), int((hi - off) / _hop)
        if i1 <= i0 + 1:
            continue
        j = i0 + int(np.argmin(_db[i0:i1]))
        if _db[j] < body - 9:
            bounds[i] = round(j * _hop + off + _hop / 2, 3)
            _snapped += 1
    for i, w in enumerate(ws):
        w['start'] = ws[0]['start'] if i == 0 else bounds[i - 1]
        w['end'] = bounds[i] if i < len(bounds) else ws[-1]['end']
if os.environ.get('DEBUG_SEGS'):
    for _p in phrases.values():
        if _p['id'] in os.environ['DEBUG_SEGS'].split(','):
            print('  words ' + _p['id'] + ': ' + ' '.join(f"{w['text']}@{w['start']:.2f}" for w in _p['wordList']))
# hand-checked anchors ('WORD@seconds') override whatever the estimate and the snapping decided
for _p in phrases.values():
    _ws = _p['wordList']
    if not any(w.get('anchor') is not None for w in _ws):
        continue
    for i, w in enumerate(_ws):
        if w.get('anchor') is not None:
            w['start'] = round(_p['dst'][0] + w['anchor'], 3)
            if i > 0:
                _ws[i - 1]['end'] = w['start']
    for i in range(1, len(_ws)):  # keep the words in order
        if _ws[i]['start'] < _ws[i - 1]['start'] + 0.04:
            _ws[i]['start'] = round(_ws[i - 1]['start'] + 0.04, 3)
            _ws[i - 1]['end'] = _ws[i]['start']
print(f'Word boundaries snapped to dips in the take: {_snapped}')

CUE =re.compile(r'^(p|e|w|m):([A-Za-z0-9]+)(?::(\d+))?([+-]\d+(?:\.\d+)?)?$')
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
    if p.get('captions') is False:
        continue
    groups: dict[int, list] = {}
    for w in p['wordList']:
        groups.setdefault(w['group'], []).append(w)
    glist = [groups[k] for k in sorted(groups)]
    nxt = ordered[pi + 1]['dst'][0] if pi + 1 < len(ordered) else DUR
    for gi, g in enumerate(glist):
        lag = plan.get('captionLag', 0.0)  # per-episode nudge (seconds) for captions that come in early against the voice
        start = max(0.0, g[0]['start'] - 0.03 + lag)
        end = glist[gi + 1][0]['start'] - 0.03 + lag if gi + 1 < len(glist) else min(p['dst'][1] + 0.3, nxt - 0.05)
        shown = [{'text': w['text'], 'key': w['key']} for w in g if not w.get('hidden')]
        if shown:
            subs.append({'start': round(start, 3), 'end': round(end, 3), 'words': shown})
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
    'visualLead': plan.get('visualLead', {}),
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
    s1 = min(len(take) / SR, ps[-1]['src'][1] + ps[-1].get('tail', 0.16))
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

# Automatic transition sound: only at scene changes (a riser into it and a soft sub hit). Ordinary cuts carry no
# riser and no whoosh, which takes about a fifth of the effects out and leaves the voice in charge.
for prev, s_ in zip(shots, shots[1:]):
    plen = s_['start'] - prev['start']
    if s_.get('scene'):
        r = min(1.2, 0.6 * plen)
        events.append({'t': s_['start'] - r, 'kind': 'riser', 'dur': r, 'gain': -12})
        events.append({'t': s_['start'], 'kind': 'sub', 'gain': -9})

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
T_QUESTION = resolve(plan.get('questionAt', 'p:K1'))  # the spoken question: the card is on screen from here

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


# ---------------------------------------------------------------------------------------------------------------
# Casual music: the same 100 BPM grid (a downbeat on the 100x burst) but a light, warm groove in C major
# (C - Am - F - G, one bar each): electric-piano comping on the off-beats, a soft round bass, a kick on 1 and 3,
# finger snaps on 2 and 4, swung hats, and a small pentatonic pluck tune from the first disparo on. The 100x burst keeps
# its beat of silence and a bright stab (no boom), the quiet after it is just the pad and a soft pulse.
# ---------------------------------------------------------------------------------------------------------------

MYSTERY = [  # A minor: Am9 - Fmaj7 - Dm9 - E7 (the dominant, so every loop leans forward)
    (55.0, [220.0, 261.63, 329.63, 392.0, 493.88], {0: 659.25, 5: 523.25}),
    (87.31, [174.61, 220.0, 261.63, 329.63, 392.0], {0: 523.25, 3: 440.0, 6: 523.25}),
    (73.42, [146.83, 174.61, 220.0, 261.63, 329.63], {0: 587.33, 5: 440.0}),
    (82.41, [164.81, 207.65, 246.94, 293.66, 329.63], {0: 493.88, 3: 415.3, 6: 493.88}),
]
CASUAL = [  # (bass, comp notes, tune notes by position in a bar of eight 8ths)
    (65.41, [130.81, 164.81, 196.0, 246.94, 329.63], {0: 659.25, 3: 783.99, 5: 659.25}),         # Cmaj7
    (55.0, [130.81, 164.81, 196.0, 220.0, 329.63], {0: 659.25, 3: 880.0, 5: 783.99}),            # Am7
    (87.31, [174.61, 220.0, 261.63, 329.63, 392.0], {0: 523.25, 3: 880.0, 5: 783.99}),           # Fmaj7
    (98.0, [146.83, 196.0, 246.94, 293.66, 349.23], {0: 587.33, 3: 783.99, 4: 659.25, 6: 587.33}),  # G7
]
STYLES = {
    # chords, comp stabs on the off-beats, finger snaps, hats every N 8ths, kick on 3 too, stab notes at the burst, boom gain
    'casual': dict(chords=CASUAL, stabs=True, snaps=True, hat_every=1, kick3=True, burst=[196.0, 246.94, 293.66, 392.0, 587.33], boom=0.0, bassv=1.0),
    'mystery': dict(chords=MYSTERY, stabs=False, snaps=False, hat_every=2, kick3=False, burst=[220.0, 261.63, 329.63, 392.0, 493.88], boom=0.45, bassv=0.9),
}


def compose_music_casual(style: str = 'casual'):
    ST = STYLES[style]
    CH = ST['chords']
    t = np.arange(N) / SR
    L = np.zeros(N + SR * 2)
    R = np.zeros(N + SR * 2)
    n8 = int((DUR - GRID0) / (BEAT / 2)) + 2

    def rhodes(f, d=1.2):
        tp = np.arange(int(d * SR)) / SR
        tone = (np.sin(2 * np.pi * f * tp) + 0.45 * np.sin(2 * np.pi * 2 * f * tp) * np.exp(-tp / 0.35)
                + 0.12 * np.sin(2 * np.pi * 4.01 * f * tp) * np.exp(-tp / 0.08))
        return tone * np.exp(-tp / 0.7) * np.clip(tp / 0.004, 0, 1) * np.clip((d - tp) / 0.08, 0, 1)

    def bass_note(f, d=0.5):
        tp = np.arange(int(d * SR)) / SR
        w = np.sin(2 * np.pi * f * tp) + 0.35 * np.sin(4 * np.pi * f * tp) + 0.1 * np.sin(6 * np.pi * f * tp)
        return w * np.exp(-tp / 0.28) * np.clip(tp / 0.006, 0, 1)

    def soft_kick():
        d = 0.28
        tk = np.arange(int(d * SR)) / SR
        ph = 2 * np.pi * np.cumsum(95 * (50 / 95) ** (tk / d)) / SR
        return np.sin(ph) * np.exp(-tk / 0.09) + hp(noise(len(tk)), 8) * np.exp(-tk / 0.003) * 0.12

    def snap():
        d = 0.12
        ts = np.arange(int(d * SR)) / SR
        return hp(noise(len(ts)), 5) * np.exp(-ts / 0.025) * 0.8 + 0.4 * np.sin(2 * np.pi * 1800 * ts) * np.exp(-ts / 0.012)

    def hat():
        d = 0.05
        th = np.arange(int(d * SR)) / SR
        return hp(noise(len(th)), 4) * np.exp(-th / 0.012)

    def pluck(f):
        d = 0.45
        tp = np.arange(int(d * SR)) / SR
        w = np.sin(2 * np.pi * f * tp) + 0.3 * np.sin(4 * np.pi * f * tp)
        return w * np.exp(-tp / 0.14) * np.clip(tp / 0.003, 0, 1)

    K, SN, HT = soft_kick(), snap(), hat()
    last_t = T_BURST - 0.25
    for k in range(-8, n8):
        tn = GRID0 + k * BEAT / 2
        if tn < 0 or tn > DUR:
            continue
        bar = int(np.floor((tn - GRID0) / BAR))
        ci = bar % 4
        bass, comp, tune = CH[ci]
        pos = k % 8  # position of this 8th within the bar
        pre_burst = tn < last_t
        # electric-piano comping: a long chord on beat 1, then off-beat stabs on the "and" of 2 and of 4
        if pre_burst or tn >= T_BURST:
            if pos == 0:
                for fq in comp:
                    add_clip(L, R, rhodes(fq, 1.6), tn, 0.16, -0.2)
            elif ST['stabs'] and pos in (3, 7) and tn >= 2.5:
                for fq in comp[1:4]:
                    add_clip(L, R, rhodes(fq, 0.6), tn, 0.1, 0.25)
        if not pre_burst:
            continue
        # soft round bass: root on 1, fifth on the "and" of 2, root again on 3, a walk-up into the next bar
        if tn >= 2.0:
            if pos == 0:
                add_clip(L, R, bass_note(bass), tn, 0.42)
            elif pos == 3:
                add_clip(L, R, bass_note(bass * 1.5, 0.35), tn, 0.3)
            elif pos == 4:
                add_clip(L, R, bass_note(bass), tn, 0.34)
            elif pos == 7:
                add_clip(L, R, bass_note(CH[(ci + 1) % 4][0] * 2, 0.3), tn, 0.22)
        # drums: kick on 1 and 3, snaps on 2 and 4, swung hats on every 8th (the off-beats pushed late)
        if tn >= 3.0:
            if pos == 0 or (pos == 4 and ST['kick3']):
                add_clip(L, R, K, tn, 0.5)
            if ST['snaps'] and pos in (2, 6):
                add_clip(L, R, SN, tn, 0.2, 0.1)
            if pos % ST['hat_every'] == 0:
                swing = 0.035 if pos % 2 else 0.0
                add_clip(L, R, HT, tn + swing, (0.09 if pos % 2 == 0 else 0.06) * (0.7 if not ST['snaps'] else 1.0), 0.3 if pos % 2 else -0.3)
        # the little tune, from the first disparo (T_E) on, with an echo; slightly louder through the build
        if tn >= T_E and pos in tune:
            vel = 0.7 + 0.3 * smooth((tn - T_E) / (T_BURST - T_E))
            c = pluck(tune[pos])
            add_clip(L, R, c, tn, 0.2 * vel, -0.4)
            add_clip(L, R, c, tn + BEAT * 0.75, 0.2 * vel * 0.4, 0.4)
            add_clip(L, R, c, tn + BEAT * 1.5, 0.2 * vel * 0.18, -0.2)

    # a soft sweep into the burst, much gentler than the dark riser (longer and a little louder in the mystery style)
    rl = 1.5 if ST['snaps'] else 3.0
    add_clip(L, R, k_riser({'dur': rl}), T_BURST - 0.2 - rl, 0.22 if ST['snaps'] else 0.3)
    if not ST['snaps']:
        # a quiet detuned pad bed with a slow tremolo: the mystery under the groove
        for n in range(-1, int((DUR - GRID0) // BAR) + 2):
            a0 = GRID0 + n * BAR
            i0, i1 = max(0, int((a0 - 0.6) * SR)), min(N, int((a0 + BAR + 0.6) * SR))
            if i1 <= i0:
                continue
            tt_ = t[i0:i1]
            win = smooth((tt_ - a0) / 0.6) * smooth((a0 + BAR - tt_) / 0.6)
            for fq in CH[n % 4][1][:3]:
                L[i0:i1] += 0.05 * win * np.sin(2 * np.pi * fq * 0.997 * tt_) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.2 * tt_))
                R[i0:i1] += 0.05 * win * np.sin(2 * np.pi * fq * 1.003 * tt_ + 1.0) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.2 * tt_ + 1.0))

    # the burst: a beat of silence, then a bright major stab and a soft low note (no boom)
    gap = (t > T_BURST - 0.2) & (t < T_BURST)
    L[:N][gap] *= 0.0
    R[:N][gap] *= 0.0
    for fq in ST['burst']:
        add_clip(L, R, rhodes(fq, 2.6), T_BURST, 0.2, 0.0)
    add_clip(L, R, bass_note(CH[3][0], 1.2), T_BURST, 0.5)
    add_clip(L, R, k_sub({}), T_BURST, 0.25)
    if ST['boom'] > 0:
        add_clip(L, R, k_boom({'dur': 1.8}), T_BURST, ST['boom'])

    # the quiet after: a sustained C chord pad and a soft pulse on every beat, fading with the end
    for n, a in enumerate(np.arange(T_BURST + 0.9, DUR - 0.5, BEAT * 4)):
        for fq in CH[(n + 2) % 4][1][:4]:
            add_clip(L, R, rhodes(fq, 2.6), float(a), 0.1, 0.0)
    tb = T_BURST + 1.2
    while tb < DUR - 1.0:
        add_clip(L, R, K, tb, 0.22 * (1 - smooth((tb - (DUR - 2.2)) / 1.0)))
        tb += BEAT * 2

    env_ = smooth(t / 0.6) * smooth((DUR - t) / 0.7)
    return L[:N] * env_, R[:N] * env_


# ---------------------------------------------------------------------------------------------------------------
# Ambient music: no drums at all. A slow bed of detuned pads (A minor: Am9 - Fmaj7 - Dm9 - E7sus4, two bars each, with
# long crossfades), a deep drone with a slow wobble, a breath of filtered air that swells and recedes, and rare glassy
# bell tones with a long echo. It opens up toward the 100x burst (more air, a slow swell), leaves one beat of
# silence, then blooms: a wide chord and a deep sub that ring out. After it only the drone and the air remain.
# ---------------------------------------------------------------------------------------------------------------

AMBIENT = [  # (bass, pad notes, bell notes)
    (55.0, [110.0, 164.81, 196.0, 246.94, 329.63, 392.0], [659.25, 783.99, 987.77, 1318.5]),    # Am9
    (87.31, [87.31, 174.61, 220.0, 261.63, 329.63, 392.0], [523.25, 659.25, 880.0, 1046.5]),     # Fmaj7
    (73.42, [73.42, 146.83, 220.0, 261.63, 329.63, 440.0], [587.33, 698.46, 880.0, 1174.7]),     # Dm9
    (82.41, [82.41, 164.81, 220.0, 246.94, 293.66, 329.63], [493.88, 587.33, 659.25, 987.77]),   # E7sus4
]


def compose_music_ambient():
    t = np.arange(N) / SR
    L = np.zeros(N + SR * 2)
    R = np.zeros(N + SR * 2)
    bright = 0.25 + 0.75 * smooth((t - 4.0) / (T_BURST - 4.0))  # the pads open up as the story builds

    # --- pads: one chord per two bars, long crossfades, a gentle swell inside each chord ---
    nchords = int((DUR - GRID0) // CHORD_LEN) + 2
    for n in range(-1, nchords):
        a = GRID0 + n * CHORD_LEN
        b = a + CHORD_LEN
        i0, i1 = max(0, int((a - 1.6) * SR)), min(N, int((b + 1.6) * SR))
        if i1 <= i0:
            continue
        tt_ = t[i0:i1]
        win = smooth((tt_ - a) / 1.6) * smooth((b - tt_) / 1.6)
        pad = AMBIENT[chord_at(a + 0.01)][1]
        br = bright[i0:i1]
        pl = np.zeros_like(tt_)
        pr = np.zeros_like(tt_)
        for fq in pad:
            for k in range(1, 5):
                w = 1.0 / k ** 1.6 * (1 if k <= 2 else br)
                pl += w * np.sin(2 * np.pi * k * fq * 0.9972 * tt_ + 0.4 * k)
                pr += w * np.sin(2 * np.pi * k * fq * 1.0028 * tt_ + 1.1 * k)
        swell = 0.8 + 0.2 * np.sin(2 * np.pi * (tt_ - a) / CHORD_LEN * 0.5 * 2)
        g = win * swell * 0.26 / len(pad)
        L[i0:i1] += pl * g
        R[i0:i1] += pr * g

    # --- the drone: A1 and A2 with a slow wobble, always there, deeper through the build ---
    drone_env = 0.5 + 0.5 * smooth((t - 1.0) / 6.0)
    wob = 1 + 0.01 * np.sin(2 * np.pi * 0.11 * t)
    drone = (np.sin(2 * np.pi * 55.0 * wob * t) + 0.45 * np.sin(2 * np.pi * 110.0 * wob * t + 0.7) + 0.15 * np.sin(2 * np.pi * 165.0 * t + 1.9)) * drone_env
    L[:N] += 0.24 * drone
    R[:N] += 0.24 * drone

    # --- air: filtered noise that breathes in and out, wider and louder toward the burst ---
    air_l = lp(hp(noise(N), 24), 18) * 3.0
    air_r = lp(hp(noise(N), 24), 18) * 3.0
    breath = 0.35 + 0.65 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.09 * t - 1.0))
    air_amp = breath * (0.5 + 0.5 * smooth((t - 6.0) / (T_BURST - 6.0)))
    L[:N] += air_l * air_amp * 0.9
    R[:N] += air_r * air_amp * 0.9

    # --- bells: a rare glassy tone, one every two beats or so, with a long ping-pong echo ---
    def bell(f):
        d = 1.8
        tb_ = np.arange(int(d * SR)) / SR
        w = np.sin(2 * np.pi * f * tb_) + 0.35 * np.sin(2 * np.pi * 2.76 * f * tb_) * np.exp(-tb_ / 0.5) + 0.12 * np.sin(2 * np.pi * 5.4 * f * tb_) * np.exp(-tb_ / 0.15)
        return w * np.exp(-tb_ / 0.6) * np.clip(tb_ / 0.004, 0, 1)

    pat = [0, 2, 1, 3, 2, 0, 3, 1]
    nb = int((DUR - GRID0) / (BEAT * 2)) + 1
    for k in range(nb):
        tn = GRID0 + k * BEAT * 2
        if tn < 5.0 or tn > T_BURST - 0.6 or (tn > T_BURST + 0.4 and tn < T_BURST + 3.0):
            continue
        if k % 3 == 2:  # leave air
            continue
        note = AMBIENT[chord_at(tn)][2][pat[k % 8]]
        c = bell(note)
        pan = -0.5 if k % 2 == 0 else 0.5
        vel = 0.5 + 0.3 * smooth((tn - 5.0) / (T_BURST - 5.0))
        add_clip(L, R, c, tn, 0.14 * vel, pan)
        for dly, g_, pn in [(0.75, 0.5, -pan), (1.5, 0.26, pan), (2.25, 0.12, -pan)]:
            add_clip(L, R, c, tn + dly, 0.14 * vel * g_, pn)

    # --- a barely-there pulse, felt more than heard, in the second half ---
    def thump():
        d = 0.5
        tk = np.arange(int(d * SR)) / SR
        ph = 2 * np.pi * np.cumsum(70 * (40 / 70) ** (tk / d)) / SR
        return np.sin(ph) * np.exp(-tk / 0.14)

    TH = thump()
    tp = T_E
    while tp < T_BURST - 0.6:
        add_clip(L, R, TH, tp, 0.22 + 0.2 * smooth((tp - T_E) / (T_BURST - T_E)))
        tp += BEAT * 2

    # --- the swell into the burst, the silence, then the bloom ---
    add_clip(L, R, k_riser({'dur': 3.5}), T_BURST - 0.2 - 3.5, 0.28)
    gap = (t > T_BURST - 0.2) & (t < T_BURST)
    L[:N][gap] *= 0.0
    R[:N][gap] *= 0.0
    bloom = smooth((t - T_BURST) / 0.08) * np.exp(-np.maximum(t - T_BURST, 0) / 3.2) * (t >= T_BURST)
    for fq in [110.0, 164.81, 196.0, 246.94, 329.63, 392.0, 493.88]:
        tone = np.sin(2 * np.pi * fq * 0.998 * t) + 0.4 * np.sin(4 * np.pi * fq * t)
        L[:N] += 0.15 * tone * bloom
        R[:N] += 0.15 * np.sin(2 * np.pi * fq * 1.002 * t + 0.8) * bloom + 0.06 * tone * bloom
    add_clip(L, R, k_sub({}), T_BURST, 0.5)
    add_clip(L, R, k_boom({'dur': 2.4}), T_BURST, 0.35)

    env_ = smooth(t / 1.2) * smooth((DUR - t) / 1.4)
    return L[:N] * env_, R[:N] * env_


# ---------------------------------------------------------------------------------------------------------------
# Piano music: a casual, friendly piano on the same 100 BPM grid (a downbeat on the burst). One chord a bar, Am - F - C - G:
# the left hand plays a loose broken chord in swung eighths, the right hand a small melody that enters at the first explanation
# (T_E) and thickens through the build. The burst keeps its beat of silence, then lets a low chord ring; after it, only slow
# chords and the odd melody note, fading out so the loop restarts clean. No drums at all.
# ---------------------------------------------------------------------------------------------------------------

PIANO = [  # (bass, chord tones, melody motif by position in a bar of eight 8ths)
    (110.0, [220.0, 261.63, 329.63], {2: 659.25, 4: 587.33, 6: 523.25}),     # Am
    (87.31, [174.61, 220.0, 261.63], {2: 523.25, 4: 440.0, 7: 523.25}),       # F
    (130.81, [261.63, 329.63, 392.0], {2: 659.25, 4: 523.25, 6: 392.0}),      # C
    (98.0, [196.0, 246.94, 293.66], {2: 587.33, 4: 493.88, 6: 587.33}),       # G
]


def piano_note(f: float, d: float = 2.4) -> np.ndarray:
    tp = np.arange(int(d * SR)) / SR
    tau = 2.4 * (220.0 / f) ** 0.35
    w = np.zeros_like(tp)
    for k in range(1, 9):
        fk = f * k * math.sqrt(1 + 0.0004 * k * k)
        if fk > 9000:
            break
        a = 1.0 / k ** 1.25
        w += a * (np.sin(2 * np.pi * fk * tp) + 0.6 * np.sin(2 * np.pi * fk * 1.0009 * tp + 0.7)) * np.exp(-tp / (tau / (1 + 0.55 * (k - 1))))
    w += hp(noise(len(tp)), 8) * np.exp(-tp / 0.012) * 0.05
    return w * np.clip(tp / 0.003, 0, 1) * np.clip((d - tp) / 0.12, 0, 1)


def compose_music_piano():
    t = np.arange(N) / SR
    L = np.zeros(N + SR * 3)
    R = np.zeros(N + SR * 3)
    n8 = int((DUR - GRID0) / (BEAT / 2)) + 2
    cache: dict = {}

    def note(f, d=2.4):
        key = (round(f, 2), round(d, 1))
        if key not in cache:
            cache[key] = piano_note(f, d)
        return cache[key]

    for k in range(-8, n8):
        tn = GRID0 + k * BEAT / 2
        if tn < 0.15 or tn > DUR - 0.5:
            continue
        bar = int(np.floor((tn - GRID0) / BAR))
        bass, chord, tune = PIANO[bar % 4]
        pos = k % 8
        pre = tn < T_BURST - 0.25
        post = tn >= T_BURST + 0.6
        if not (pre or post):
            continue
        swing = 0.03 if pos % 2 else 0.0
        build = smooth((tn - T_E) / (T_BURST - T_E)) if pre else 0.0
        # left hand: bass on 1, a broken chord through the rest of the bar (sparser after the burst)
        if pre or pos in (0, 4):
            if pos == 0:
                add_clip(L, R, note(bass, 2.6), tn, 0.5, -0.25)
            elif pos in (1, 2, 3, 5, 6, 7) and pre:
                ci = {1: 0, 2: 1, 3: 2, 5: 1, 6: 2, 7: 1}[pos]
                add_clip(L, R, note(chord[ci], 1.4), tn + swing, 0.2 + 0.06 * build, -0.1)
            elif pos == 4:
                add_clip(L, R, note(bass * 2, 2.0), tn, 0.3, -0.2)
        # right hand: the little melody, from the first explanation on, a touch louder through the build
        if pos in tune and ((pre and tn >= T_E) or (post and bar % 2 == 0)):
            vel = 0.55 + 0.35 * build if pre else 0.4
            add_clip(L, R, note(tune[pos], 2.0), tn + swing, 0.32 * vel, 0.3)
    # the burst: a beat of silence, then a low chord that rings, and a soft low octave
    gap = (t > T_BURST - 0.2) & (t < T_BURST)
    L[:N][gap] *= 0.0
    R[:N][gap] *= 0.0
    for f_, g_ in [(55.0, 0.7), (110.0, 0.6), (220.0, 0.45), (261.63, 0.4), (329.63, 0.4), (440.0, 0.3)]:
        add_clip(L, R, note(f_, 3.2), T_BURST, g_ * 0.8, 0.0)
    env_ = smooth(t / 0.5) * smooth((DUR - t) / 1.2)
    return L[:N] * env_, R[:N] * env_


# ---------------------------------------------------------------------------------------------------------------
# Driving piano: not casual. It scores the video's shape. A ticking high note keeps time under a syncopated 3-3-2 left hand
# (bass octaves and short chord stabs); from the first explanation (T_E) it adds 16th arpeggios that crescendo; at the
# climax cut (cutImpact) the piano stops dead and then slams a low cluster; from there to the burst it is a low 16th rumble with
# accented stabs; the burst gets a beat of silence and a wide Am chord left to ring; the aftermath is slow low pulses (one a
# bar-half) and a lone high E, unresolved, fading so the loop restarts on the hook's ticking.
# ---------------------------------------------------------------------------------------------------------------

DRIVE = [  # (bass, chord tones, the arpeggio): Am - F - Dm - E
    (110.0, [220.0, 261.63, 329.63], [220.0, 261.63, 329.63, 440.0]),
    (87.31, [174.61, 220.0, 261.63], [174.61, 220.0, 261.63, 349.23]),
    (73.42, [146.83, 174.61, 220.0], [146.83, 174.61, 220.0, 293.66]),
    (82.41, [164.81, 207.65, 246.94], [164.81, 207.65, 246.94, 329.63]),
]


def compose_music_drive():
    t = np.arange(N) / SR
    L = np.zeros(N + SR * 3)
    R = np.zeros(N + SR * 3)
    T_CUT = marks.get('cutImpact', T_E + 3.0)
    cache: dict = {}

    def note(f, d=0.5):
        key = (round(f, 2), round(d, 2))
        if key not in cache:
            cache[key] = piano_note(f, d)
        return cache[key]

    n16 = int((DUR - GRID0) / (BEAT / 4)) + 2
    for n in range(-16, n16):
        tn = GRID0 + n * BEAT / 4
        if tn < 0.1 or tn > DUR - 0.4:
            continue
        bar = int(np.floor((tn - GRID0) / BAR))
        bass, chord, arp = DRIVE[bar % 4]
        q = n % 16  # sixteenth within the bar
        pre_cut = tn < T_CUT - 0.12
        rumble = T_CUT + 0.35 <= tn < T_BURST - 0.25
        post = tn >= T_BURST + 0.7
        if not (pre_cut or rumble or post):
            continue
        ramp = smooth((tn - 0.1) / max(1.0, T_E - 0.1))             # 0 -> 1 up to the first explanation
        build = smooth((tn - T_E) / max(1.0, T_CUT - T_E))          # 0 -> 1 from the explanation to the cut
        if pre_cut:
            # the clock: a high note on every eighth, a little louder as the story builds
            if q % 2 == 0:
                add_clip(L, R, note(659.25, 0.22), tn, 0.12 + 0.12 * ramp + 0.08 * build, 0.3)
            # the 3-3-2 left hand: bass octaves on 0, 6, 12 and short chord stabs on 3 and 9
            if q in (0, 6, 12):
                add_clip(L, R, note(bass, 0.7), tn, 0.5, -0.25)
                add_clip(L, R, note(bass * 2, 0.5), tn, 0.3, -0.2)
            elif q in (3, 9) and tn > 1.8:
                for fq in chord:
                    add_clip(L, R, note(fq, 0.3), tn, 0.16, -0.05)
            # from the first explanation: rising 16th arpeggios, a crescendo
            if tn >= T_E and q % 2 == 1:
                fq = arp[(q // 2) % 4] * 2
                add_clip(L, R, note(fq, 0.25), tn, 0.1 + 0.3 * build, 0.35)
        elif rumble:
            # the climax: a low rumble in 16ths and accented stabs on the beats
            lvl = 0.3 + 0.3 * smooth((tn - T_CUT) / max(1.0, T_BURST - T_CUT))
            add_clip(L, R, note(bass if q % 2 == 0 else bass * 2, 0.3), tn, lvl, -0.15)
            if q % 4 == 0:
                for fq in chord:
                    add_clip(L, R, note(fq * 2, 0.3), tn, 0.22, 0.0)
            if q % 2 == 0:
                add_clip(L, R, note(659.25, 0.2), tn, 0.18, 0.3)
        else:
            # after the burst: slow, low and sparse, then a lone high E
            if q in (0, 8):
                add_clip(L, R, note(bass, 1.8), tn, 0.38 * (1 - 0.5 * smooth((tn - T_BURST) / 10.0)), -0.2)
            if q == 8 and bar % 2 == 1:
                add_clip(L, R, note(659.25, 2.4), tn, 0.16, 0.35)
    # the climax cut: silence, then a low cluster
    cut_gap = (t > T_CUT - 0.12) & (t < T_CUT)
    L[:N][cut_gap] *= 0.0
    R[:N][cut_gap] *= 0.0
    for f_, g_ in [(55.0, 0.9), (82.41, 0.7), (110.0, 0.8), (164.81, 0.6), (220.0, 0.55), (261.63, 0.5), (329.63, 0.5)]:
        add_clip(L, R, note(f_, 1.8), T_CUT, g_ * 0.9, 0.0)
    add_clip(L, R, k_sub({}), T_CUT, 0.35)
    # the burst: a beat of silence, then a wide Am chord left to ring
    gap = (t > T_BURST - 0.2) & (t < T_BURST)
    L[:N][gap] *= 0.0
    R[:N][gap] *= 0.0
    for f_, g_ in [(55.0, 0.85), (110.0, 0.7), (220.0, 0.55), (261.63, 0.5), (329.63, 0.5), (440.0, 0.35), (659.25, 0.25)]:
        add_clip(L, R, note(f_, 3.4), T_BURST, g_ * 0.9, 0.0)
    env_ = smooth(t / 0.4) * smooth((DUR - t) / 1.3)
    return L[:N] * env_, R[:N] * env_


# ---------------------------------------------------------------------------------------------------------------
# Bright piano: an informative, human tone (not dark, not mysterious): C major, C - G - Am - F, a light pulse of eighth-note
# arpeggios in the middle register, a warm bass on beats 1 and 3, and a few high bell-like notes that sparkle above the voice.
# It builds gently from the first explanation (T_E), has a clean bright stab at the climax cut (silence, then a Csus2 chord)
# and a wide open C chord at the burst (a beat of silence first), and after it settles to slow arpeggios that finally RESOLVE
# on a C major chord, so the story ends on something warm. Used with plan "musicPocket": the voice's band (300 Hz to 3 kHz)
# is dipped in the music, and the arrangement stays thin while words play.
# ---------------------------------------------------------------------------------------------------------------

BRIGHT = [  # (bass, arpeggio tones: low to high, sparkle notes)
    (130.81, [261.63, 329.63, 392.0, 523.25], [1318.5, 1568.0]),   # C
    (98.0, [246.94, 293.66, 392.0, 493.88], [1174.7, 1568.0]),     # G
    (110.0, [261.63, 329.63, 440.0, 523.25], [1318.5, 1760.0]),    # Am
    (87.31, [261.63, 349.23, 440.0, 523.25], [1396.9, 1760.0]),    # F
]


def compose_music_bright():
    t = np.arange(N) / SR
    L = np.zeros(N + SR * 3)
    R = np.zeros(N + SR * 3)
    T_CUT = marks.get('cutImpact', T_E + 3.0)
    cache: dict = {}

    def note(f, d=0.6):
        key = (round(f, 2), round(d, 2))
        if key not in cache:
            cache[key] = piano_note(f, d)
        return cache[key]

    n8 = int((DUR - GRID0) / (BEAT / 2)) + 2
    for k in range(-8, n8):
        tn = GRID0 + k * BEAT / 2
        if tn < 0.12 or tn > DUR - 0.4:
            continue
        bar = int(np.floor((tn - GRID0) / BAR))
        bass, arp, spark = BRIGHT[bar % 4]
        pos = k % 8
        pre = tn < T_BURST - 0.25
        cut_gap = T_CUT - 0.12 <= tn < T_CUT + 0.05
        post = tn >= T_BURST + 0.7
        if cut_gap or not (pre or post):
            continue
        swing = 0.02 if pos % 2 else 0.0
        build = smooth((tn - T_E) / max(1.0, T_BURST - T_E)) if pre else 0.0
        ramp = smooth((tn - 0.1) / max(1.0, T_E - 0.1)) if pre else 0.0
        if pre:
            # the light pulse: up-and-down arpeggio, accented on the beats
            idx = [0, 1, 2, 3, 2, 1, 2, 1][pos]
            accent = 1.0 if pos % 2 == 0 else 0.7
            add_clip(L, R, note(arp[idx], 0.42), tn + swing, (0.16 + 0.1 * ramp + 0.22 * build) * accent, 0.15)
            # a warm bass on 1 and 3, an octave on the climb
            if pos in (0, 4):
                add_clip(L, R, note(bass, 0.9), tn, 0.4 + 0.15 * build, -0.2)
            if pos == 0 and tn >= T_E:
                add_clip(L, R, note(bass * 2, 0.7), tn, 0.22 * build, -0.15)
            # bell-like sparkle above the voice, on the "and" of 2 every other bar
            if pos == 3 and bar % 2 == 0:
                add_clip(L, R, note(spark[0], 0.9), tn, 0.2, 0.4)
            if pos == 7 and bar % 2 == 1:
                add_clip(L, R, note(spark[1], 0.9), tn, 0.16, -0.4)
        else:
            # after the burst: slow, open and sparse
            if pos == 0:
                add_clip(L, R, note(bass, 1.8), tn, 0.34 * (1 - 0.4 * smooth((tn - T_BURST) / 10.0)), -0.2)
                add_clip(L, R, note(arp[1], 1.4), tn + 0.02, 0.18, 0.1)
            if pos in (3, 6):
                add_clip(L, R, note(arp[[0, 1, 2, 3][(pos // 3) % 4] if pos == 3 else 3], 1.2), tn + swing, 0.16, 0.25)
    # the climax cut: silence (already skipped above), then a bright Csus2 stab with a sparkle on top
    for f_, g_ in [(65.41, 0.8), (130.81, 0.7), (196.0, 0.5), (261.63, 0.5), (293.66, 0.45), (392.0, 0.4), (523.25, 0.35)]:
        add_clip(L, R, note(f_, 1.6), T_CUT, g_ * 0.9, 0.0)
    add_clip(L, R, note(1568.0, 1.2), T_CUT + 0.02, 0.22, 0.3)
    # the burst: a beat of silence, then a wide open C chord left to ring
    gap = (t > T_BURST - 0.2) & (t < T_BURST)
    L[:N][gap] *= 0.0
    R[:N][gap] *= 0.0
    for f_, g_ in [(65.41, 0.85), (130.81, 0.7), (196.0, 0.5), (261.63, 0.5), (329.63, 0.5), (392.0, 0.4), (523.25, 0.35), (1318.5, 0.18)]:
        add_clip(L, R, note(f_, 3.4), T_BURST, g_ * 0.9, 0.0)
    # the ending resolves: a last C major chord a little before the end
    t_end = DUR - 2.2
    for f_, g_ in [(65.41, 0.6), (130.81, 0.5), (261.63, 0.4), (329.63, 0.4), (392.0, 0.35), (523.25, 0.3)]:
        add_clip(L, R, note(f_, 2.4), t_end, g_ * 0.8, 0.0)
    env_ = smooth(t / 0.4) * smooth((DUR - t) / 1.3)
    return L[:N] * env_, R[:N] * env_


def voice_pocket(x: np.ndarray) -> np.ndarray:
    """Dip the music in the voice's band so words stay clear: about -7 dB from 300 Hz to 3 kHz, easing back by 150 Hz and 4.5 kHz."""
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(fr)
    dip = 10 ** (-7 / 20)
    lo = np.clip((fr - 150) / 150, 0, 1)
    hi = np.clip((4500 - fr) / 1500, 0, 1)
    shape = np.minimum(lo, hi)
    g = 1 - (1 - dip) * shape
    return np.fft.irfft(X * g, n=len(x))


# ---------------------------------------------------------------------------------------------------------------
# Curiosity-short music: the bouncy, bright bed those "did you know" shorts use. 100 BPM, C major (C - Am - F - G, a bar each):
# a soft kick, a snap on 2 and 4, swung hats, a plucky bass, offbeat chord stabs and a marimba-like four-note riff that
# repeats and grows. Voice first: the arrangement ducks under every word, the band of the voice is dipped (plan "musicPocket")
# and the drums stay soft. Shape: a groove from the first second, the riff fully in after T_E, a snare roll into the climax
# cut (a beat of silence, then a drop), a riser and a beat of silence before the burst, a thinner groove after it, and a
# last chord that resolves.
# ---------------------------------------------------------------------------------------------------------------

CURIO = [  # (bass, chord tones for the stabs, the riff by position in a bar of eight 8ths)
    (65.41, [261.63, 329.63, 392.0], {0: 659.25, 1: 783.99, 3: 880.0, 4: 783.99, 6: 659.25}),     # C
    (55.0, [261.63, 329.63, 440.0], {0: 523.25, 1: 659.25, 3: 783.99, 4: 659.25, 6: 523.25}),      # Am
    (43.65 * 2, [261.63, 349.23, 440.0], {0: 440.0, 1: 523.25, 3: 698.46, 4: 523.25, 6: 440.0}),   # F
    (49.0 * 2, [246.94, 293.66, 392.0], {0: 493.88, 1: 587.33, 3: 783.99, 4: 587.33, 7: 493.88}),  # G
]


def compose_music_curio():
    t = np.arange(N) / SR
    L = np.zeros(N + SR * 3)
    R = np.zeros(N + SR * 3)
    T_CUT = marks.get('cutImpact', T_E + 3.0)

    def kick():
        d = 0.26
        tk = np.arange(int(d * SR)) / SR
        ph = 2 * np.pi * np.cumsum(100 * (48 / 100) ** (tk / d)) / SR
        return np.sin(ph) * np.exp(-tk / 0.09) + hp(noise(len(tk)), 8) * np.exp(-tk / 0.003) * 0.1

    def snap():
        d = 0.14
        ts = np.arange(int(d * SR)) / SR
        return hp(noise(len(ts)), 5) * np.exp(-ts / 0.03) * 0.9 + 0.4 * np.sin(2 * np.pi * 1700 * ts) * np.exp(-ts / 0.014)

    def hat():
        th = np.arange(int(0.05 * SR)) / SR
        return hp(noise(len(th)), 4) * np.exp(-th / 0.012)

    def bass_note(f, d=0.34):
        tp = np.arange(int(d * SR)) / SR
        w = np.sin(2 * np.pi * f * tp) + 0.4 * np.sin(4 * np.pi * f * tp) + 0.12 * np.sin(6 * np.pi * f * tp)
        return w * np.exp(-tp / 0.16) * np.clip(tp / 0.004, 0, 1)

    def stab(f, d=0.22):
        tp = np.arange(int(d * SR)) / SR
        w = np.sin(2 * np.pi * f * tp) + 0.4 * np.sin(4 * np.pi * f * tp) * np.exp(-tp / 0.08) + 0.15 * np.sin(2 * np.pi * 4.01 * f * tp) * np.exp(-tp / 0.04)
        return w * np.exp(-tp / 0.09) * np.clip(tp / 0.003, 0, 1)

    def marimba(f, d=0.34):
        tp = np.arange(int(d * SR)) / SR
        w = np.sin(2 * np.pi * f * tp) * np.exp(-tp / 0.16) + 0.35 * np.sin(2 * np.pi * 4.0 * f * tp) * np.exp(-tp / 0.04) + 0.1 * np.sin(2 * np.pi * 10.0 * f * tp) * np.exp(-tp / 0.02)
        return w * np.clip(tp / 0.002, 0, 1)

    K, SN, HT = kick(), snap(), hat()
    n8 = int((DUR - GRID0) / (BEAT / 2)) + 2
    for k in range(-8, n8):
        tn = GRID0 + k * BEAT / 2
        if tn < 0.1 or tn > DUR - 0.5:
            continue
        bar = int(np.floor((tn - GRID0) / BAR))
        bass, chord, riff = CURIO[bar % 4]
        pos = k % 8
        pre = tn < T_BURST - 0.3
        cut_gap = T_CUT - 0.12 <= tn < T_CUT + 0.04
        post = tn >= T_BURST + 0.5
        if cut_gap or not (pre or post):
            continue
        swing = 0.025 if pos % 2 else 0.0
        energy = 0.55 + 0.25 * smooth((tn - T_E) / max(1.0, T_BURST - T_E)) if pre else 0.4
        # drums: a soft kick on 1 and a ghost kick on the "and" of 2, a snap on 2 and 4, swung hats
        if pre or pos in (0, 4):
            if pos in (0, 3, 4) and (pos != 3 or bar % 2 == 1 or tn > T_E):
                add_clip(L, R, K, tn, 0.36 * energy, 0.0)
            if pos in (2, 6):
                add_clip(L, R, SN, tn, 0.22 * energy, 0.1)
            if pre or pos == 0:
                add_clip(L, R, HT, tn + swing, 0.08 * energy if pos % 2 == 0 else 0.055 * energy, 0.3 if pos % 2 else -0.3)
        # the bouncy bass: root on 1, a hop on the "and" of 2, the fifth on 3, a pickup on 4
        bp = {0: (bass, 0.5), 3: (bass * 2, 0.3), 4: (bass * 1.5, 0.34), 6: (bass, 0.3)}
        if pos in bp and (pre or pos in (0, 4)):
            add_clip(L, R, bass_note(bp[pos][0]), tn, bp[pos][1] * (0.9 + 0.1 * energy), -0.2)
        # offbeat chord stabs
        if pos in (3, 7) and pre and tn > 2.6:
            for fq in chord:
                add_clip(L, R, stab(fq), tn + swing, 0.11 * energy, -0.1)
        # the riff: sparse before the first explanation, fully in after it, thinner after the burst
        if pos in riff:
            on = (pre and tn >= T_E) or (pre and tn > 3.0 and bar % 2 == 0 and pos in (0, 4)) or (post and bar % 2 == 0)
            if on:
                vel = 0.22 + 0.16 * smooth((tn - T_E) / max(1.0, T_BURST - T_E)) if pre else 0.18
                add_clip(L, R, marimba(riff[pos]), tn + swing, vel, 0.3)
    # the snare roll into the climax cut, then the drop: silence (skipped above), a kick, a snap and a bright chord
    for i in range(8):
        tr = T_CUT - 0.12 - (8 - i) * BEAT / 4
        if tr > 0.5:
            add_clip(L, R, SN, tr, 0.1 + 0.03 * i, 0.0)
    add_clip(L, R, K, T_CUT, 0.7, 0.0)
    add_clip(L, R, SN, T_CUT, 0.4, 0.0)
    for fq in [261.63, 329.63, 392.0, 523.25]:
        add_clip(L, R, stab(fq, 0.5), T_CUT, 0.2, 0.0)
    # a short riser, a beat of silence and the burst hit
    add_clip(L, R, k_riser({'dur': 1.0}), T_BURST - 0.2 - 1.0, 0.18)
    gap = (t > T_BURST - 0.2) & (t < T_BURST)
    L[:N][gap] *= 0.0
    R[:N][gap] *= 0.0
    add_clip(L, R, K, T_BURST, 0.9, 0.0)
    add_clip(L, R, SN, T_BURST, 0.45, 0.0)
    add_clip(L, R, bass_note(65.41, 0.9), T_BURST, 0.7, 0.0)
    for fq in [261.63, 329.63, 392.0, 523.25, 659.25]:
        add_clip(L, R, stab(fq, 0.9), T_BURST, 0.2, 0.0)
    # the ending resolves on C
    t_end = DUR - 1.8
    add_clip(L, R, bass_note(65.41, 1.2), t_end, 0.6, 0.0)
    for fq in [261.63, 329.63, 392.0, 523.25]:
        add_clip(L, R, stab(fq, 1.0), t_end, 0.2, 0.0)
    env_ = smooth(t / 0.3) * smooth((DUR - t) / 1.0)
    return L[:N] * env_, R[:N] * env_


def compose_music_soft():
    """A quiet accompaniment: a warm major pad, a slow soft-piano arpeggio, no drums, nothing dark. It swells a little at
    the climax cut and the burst, then settles and resolves on C. It stays in the background so the picture can be watched."""
    t = np.arange(N) / SR
    L = np.zeros(N + SR * 3)
    R = np.zeros(N + SR * 3)
    T_CUT = marks.get('cutImpact', T_E + 3.0)
    CH = [  # pad voicing, arpeggio tones: C - Am - F - G, two bars each
        ([130.81, 196.0, 261.63, 329.63], [261.63, 329.63, 392.0, 523.25]),
        ([110.0, 164.81, 261.63, 329.63], [220.0, 329.63, 392.0, 523.25]),
        ([87.31, 130.81, 261.63, 349.23], [261.63, 349.23, 440.0, 523.25]),
        ([98.0, 146.83, 246.94, 293.66], [246.94, 293.66, 392.0, 587.33]),
    ]
    lift = 1.0 + 0.5 * np.exp(-((t - T_CUT) / 1.2) ** 2) + 0.6 * np.exp(-((t - T_BURST) / 1.5) ** 2)
    clen = 2 * BAR
    nch = int((DUR - GRID0) // clen) + 2
    for n in range(-1, nch):
        a = GRID0 + n * clen
        b = a + clen
        i0, i1 = max(0, int((a - 1.2) * SR)), min(N, int((b + 1.2) * SR))
        if i1 <= i0:
            continue
        tt_ = t[i0:i1]
        win = smooth((tt_ - a) / 1.2) * smooth((b - tt_) / 1.2)
        pad, _arp = CH[n % 4]
        pl = np.zeros_like(tt_)
        pr = np.zeros_like(tt_)
        for fq in pad:
            for k in (1, 2, 3):
                w = 1.0 / k ** 2.0
                pl += w * np.sin(2 * np.pi * k * fq * 0.9985 * tt_ + 0.4 * k)
                pr += w * np.sin(2 * np.pi * k * fq * 1.0015 * tt_ + 1.1 * k)
        g = win * 0.30 / len(pad) * lift[i0:i1]
        L[i0:i1] += pl * g
        R[i0:i1] += pr * g
    # slow soft-piano arpeggio: one note every half beat's worth of two beats, rising and falling through the chord
    step = BEAT
    k = 0
    tn = GRID0
    while tn < DUR - 1.5:
        if tn > 0.3 and not (T_BURST - 0.3 < tn < T_BURST + 0.1):
            n = int(np.floor((tn - GRID0) / clen))
            arp = CH[n % 4][1]
            idx = [0, 1, 2, 3, 2, 1][k % 6]
            vel = 0.09 + 0.05 * smooth((tn - T_E) / max(1.0, T_BURST - T_E))
            add_clip(L, R, piano_note(arp[idx], 1.8), tn, vel * (1.0 if k % 2 == 0 else 0.7), -0.25 + 0.5 * ((k % 4) / 3))
        tn += step
        k += 1
    # a soft low C to land on
    t_end = DUR - 2.2
    for fq in [130.81, 261.63, 329.63, 392.0, 523.25]:
        add_clip(L, R, piano_note(fq, 2.2), t_end, 0.12, 0.0)
    env_ = smooth(t / 0.8) * smooth((DUR - t) / 1.4)
    return L[:N] * env_, R[:N] * env_


def compose_music_file():
    """The user's own track (src/<ep>/pista_1.mp3): seconds 2-47 of it, high-passed at 80 Hz, with a fade in and out."""
    src = ROOT / 'src' / EP / plan.get('musicFile', 'pista_1.mp3')
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(plan.get('musicStart', 2)), '-t', f'{DUR + 0.1:.2f}', '-i', str(src), '-af', 'highpass=f=80,highpass=f=80',
                          '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)
    lp_ = plan.get('musicLoop')  # [from, to] seconds of the take to loop (skips a break or drop in the track), 1.5 s crossfade
    if lp_:
        a0, a1 = int(lp_[0] * SR), int(lp_[1] * SR)
        xf = int(1.5 * SR)
        ramp = np.linspace(0, 1, xf)[:, None]
        out = a[:a1]
        while len(out) < N:
            nxt = a[a0:a1]
            out = np.concatenate([out[:-xf], out[-xf:] * (1 - ramp) + nxt[:xf] * ramp, nxt[xf:]])
        a = out
    a = np.pad(a, ((0, max(0, N - len(a))), (0, 0)))[:N]
    t = np.arange(N) / SR
    env_ = smooth(t / 0.8) * smooth((DUR - t) / plan.get('musicFadeOut', 1.4))
    return a[:, 0] * env_, a[:, 1] * env_


_style = plan.get('music', 'ambient')
music_l, music_r = ((np.zeros(N), np.zeros(N)) if _style == 'none' else compose_music() if _style == 'dark' else compose_music_ambient() if _style == 'ambient' else compose_music_piano() if _style == 'piano' else compose_music_drive() if _style == 'pianodrive' else compose_music_bright() if _style == 'pianobright' else compose_music_curio() if _style == 'curio' else compose_music_soft() if _style == 'soft' else compose_music_file() if _style == 'file' else compose_music_casual(_style))
music_l /= max(1e-9, np.abs(music_l).max())
music_r /= max(1e-9, np.abs(music_r).max())

# Level the music: its average level sits 9 dB under the voice, then it ducks another 6 dB while words play.
if plan.get('musicPocket'):
    music_l = voice_pocket(music_l)
    music_r = voice_pocket(music_r)
voice_rms = np.sqrt(np.mean(voice[np.abs(voice) > 1e-3] ** 2))
music_rms = np.sqrt(np.mean(0.5 * (music_l ** 2 + music_r ** 2)))
MUSIC_UNDER_VOICE_DB = plan.get('musicDb', 9.0)
music_gain = voice_rms * 10 ** (-MUSIC_UNDER_VOICE_DB / 20) / max(music_rms, 1e-9)
vduck = np.clip(venv[:N] if len(venv) >= N else np.pad(venv, (0, N - len(venv))), 0, 1)
music_duck = 1 - plan.get('musicDuck', 0.50) * vduck
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
for sil in plan.get('silences', []):
    # total silence: nothing but the voice (and here the voice is silent too) between the two cues
    t0, t1 = resolve(sil['from']), resolve(sil['to'])
    vac[int(max(0.0, t0 + 0.02) * SR):int(max(0.0, t1 - 0.02) * SR)] = 0.0
    print(f'Total silence {t0:.2f}-{t1:.2f} s ({t1 - t0:.2f} s)')
vac = lp(vac, int(0.02 * SR))
sfx_l, sfx_r = sfx_l * vac, sfx_r * vac
music_l, music_r = music_l * vac, music_r * vac
# music dips: the hook's breath and the last line, so the voice is heard clean
mdip = np.ones(N)
for d in plan.get('musicDips', []):
    mdip[int(resolve(d['from']) * SR):int(resolve(d['to']) * SR)] = float(d['gain'])
mdip = lp(mdip, int(0.15 * SR))
music_l, music_r = music_l * mdip, music_r * mdip
print('Vacuums before reveals at ' + ', '.join(f"{resolve(c):.2f} s" for c in plan.get('vacuums', [])))

if _style == 'none':  # no music bed: keep sound-effect peaks near the voice's own peaks so the voice can carry the loudness
    cap = 0.9 * np.abs(voice).max()
    sfx_l, sfx_r = cap * np.tanh(sfx_l * SFX_BUS / cap) / SFX_BUS, cap * np.tanh(sfx_r * SFX_BUS / cap) / SFX_BUS
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
