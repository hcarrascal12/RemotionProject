#!/usr/bin/env python3
"""Monta public/polar05/voz.wav a partir de voz-raw.mp3 (ElevenLabs) y reescribe src/polar05/words.json.

Orden: gancho/cita/vistas → "En agosto volvió, cantando." → hueco del canto del oso → fechas → cierre.
Cortes: fuera "una por una" (fundido cruzado en los valles de energía) y "noviembre de 2026" del cierre
(cortes en silencio). Cada empalme lleva fundidos cortos para que no se oiga el clic.
"""
import json, os, subprocess, wave
import numpy as np

os.chdir(os.path.join(os.path.dirname(__file__), '..'))
SR = 48000
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'public/polar05/voz-raw.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
RAWLEN = len(x) / SR
SONG_GAP = 2.75
TAIL = 38.0  # duración total del vídeo

# (inicio, fin) en segundos de la toma original; None = hueco del canto
SEGS = [(0, 15.07), (21.26, 23.66), None, (15.07, 18.89), (19.89, 21.26), (23.66, 30.60), (32.80, RAWLEN)]
XF = 0.03  # fundido cruzado en el corte de "una por una"


def fade(seg, a, b):
    n = len(seg)
    ia, ib = int(a * SR), int(b * SR)
    if ia: seg[:ia] *= np.linspace(0, 1, ia)
    if ib: seg[n - ib:] *= np.linspace(1, 0, ib)
    return seg


out = np.zeros(0)
maps = []  # (raw_a, raw_b, out_a)
for i, s in enumerate(SEGS):
    if s is None:
        out = np.concatenate([out, np.zeros(int(SONG_GAP * SR))]); continue
    a, b = s
    seg = x[int(a * SR):int(b * SR)].copy()
    # empalme de "una por una": se solapan XF segundos con fundido de potencia constante
    if s == (19.89, 21.26):
        seg = fade(seg, 0, 0.02)
        n = int(XF * SR)
        head = seg[:n] * np.sin(np.linspace(0, np.pi / 2, n))
        out[-n:] = out[-n:] * np.cos(np.linspace(0, np.pi / 2, n)) + head
        maps.append((a, b, len(out) / SR - XF))
        out = np.concatenate([out, seg[n:]]); continue
    seg = fade(seg, 0.08 if i else 0, 0.0 if s == (15.07, 18.89) else 0.08)
    maps.append((a, b, len(out) / SR))
    out = np.concatenate([out, seg])
speech_end = len(out) / SR
out = np.concatenate([out, np.zeros(max(0, int(TAIL * SR) - len(out)))])[: int(TAIL * SR)]
with wave.open('public/polar05/voz.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype('<i2').tobytes())

words = json.load(open('out/polar05/voz-raw-words.json'))
res = []
for wd in words:
    for a, b, o in maps:
        if a <= wd['s'] < b:
            res.append({'w': wd['w'], 's': round(wd['s'] - a + o, 2), 'e': round(min(wd['e'], b) - a + o, 2)}); break
res.sort(key=lambda w: w['s'])
json.dump(res, open('src/polar05/words.json', 'w'), ensure_ascii=False, indent=0)
print('voz fin', round(speech_end, 2), 's · palabras', len(res))
print(' '.join(f"{w['w']}@{w['s']}" for w in res))
