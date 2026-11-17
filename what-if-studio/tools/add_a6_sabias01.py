#!/usr/bin/env python3
"""¿Sabías que…? #01: swaps the closing line (A6) of the episode's voice for a new one, leaving A1-A5 exactly as they are.

  python3 tools/add_a6_sabias01.py new-a6.mp3

The new take ("Ese cable lo cortó una pala. El fallo número tres no necesitó ni eso.") is cleaned with the series chain
(tools/voice_clean.py, then atempo 1.08), set to -14.2 LUFS, trimmed to its speech and appended to public/sabias01/voice.wav after A5.
src/sabias01/takes.json gets the new A6 span, and src/sabias01/whisper_words.json gets Whisper's word times for the new line
(the captions and the sound marks are timed from them). Then: python3 tools/mkplan_sabias01.py, the build, the render.
Whisper: faster-whisper (pip install faster-whisper); WHISPER_PY=/path/to/python if it lives in another environment.
"""
import json, os, re, subprocess, sys
import numpy as np

SR = 48000
TARGET = -14.2
EXPECT = 14  # ESE CABLE LO CORTÓ UNA PALA EL FALLO NÚMERO TRES NO NECESITÓ NI ESO
GAP = 0.42  # seconds between A5 and the new line, as between the other lines
work = 'out/sabias01/takes'
os.makedirs(work, exist_ok=True)


def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def lufs(p):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True)
    return float(re.findall(r'I:\s+(-?\d+\.\d+) LUFS', r.stderr)[-1])


def write_wav(x, path):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s24le', path], input=x.astype(np.float32).tobytes(), check=True)


src = sys.argv[1]
c, t = f'{work}/a6-clean.wav', f'{work}/a6-tempo.wav'
subprocess.run([sys.executable, 'tools/voice_clean.py', src, c], check=True, capture_output=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', c, '-af', 'atempo=1.08', '-ar', str(SR), '-ac', '1', t], check=True)
gain = TARGET - lufs(t)
x = load(t) * (10 ** (gain / 20))

# the speech: from the first to the last 10 ms frame over -45 dBFS
hop = int(0.01 * SR)
e = np.array([20 * np.log10(np.sqrt((x[i:i + hop] ** 2).mean()) + 1e-9) for i in range(0, len(x) - hop, hop)])
idx = np.where(e > -45)[0]
if len(idx) == 0:
    sys.exit('no speech found in the take')
a, b = max(0, idx[0] * 0.01 - 0.03), (idx[-1] + 1) * 0.01 + 0.04
clip = x[int(a * SR):int(b * SR)]
dur = len(clip) / SR
print(f'new A6: {dur:.2f} s of speech, gain {gain:+.1f} dB')

takes = json.load(open('src/sabias01/takes.json'))
voice = load('public/sabias01/voice.wav')
a5_end = takes['A5'][1]
keep = voice[:int((a5_end + 0.3) * SR)]
off = len(keep) / SR + GAP
out = np.concatenate([keep, np.zeros(int(GAP * SR)), clip, np.zeros(int(0.4 * SR))])
write_wav(out, 'public/sabias01/voice.wav')
takes['A6'] = [round(off, 3), round(off + dur, 3)]
takes.pop('A7', None)
json.dump(takes, open('src/sabias01/takes.json', 'w'))

# Whisper on the new line alone; its times are moved to where the line sits in voice.wav
clip_path = f'{work}/a6-clip.wav'
write_wav(clip, clip_path)
py = os.environ.get('WHISPER_PY', sys.executable)
subprocess.run([py, 'tools/whisper_words.py', clip_path, f'{work}/a6_words.json', 'small'], check=True)
new = json.load(open(f'{work}/a6_words.json'))
ww = [w for w in json.load(open('src/sabias01/whisper_words.json')) if (w['s'] + w['e']) / 2 <= a5_end + 0.15]
ww += [{'w': w['w'], 's': round(w['s'] + off, 3), 'e': round(w['e'] + off, 3)} for w in new]
json.dump(ww, open('src/sabias01/whisper_words.json', 'w'), ensure_ascii=False)
print('A6', takes['A6'], '| words:', ' '.join(w['w'] for w in new))
if len(new) != EXPECT:
    print(f'WARNING: Whisper heard {len(new)} words, the captions expect {EXPECT}: check the take or WORDS["A6"] in tools/mkplan_sabias01.py')
print('voice.wav', round(len(out) / SR, 2), 's')
