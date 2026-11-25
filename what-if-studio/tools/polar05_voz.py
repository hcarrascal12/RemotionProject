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
TAIL = 1150 / 30  # duración total del vídeo

# (inicio, fin) en segundos de la toma original; None = hueco del canto; ('pausa', s) = silencio
# Fuera "fueron pasando una por una": tras "octubre." hay silencio (18,14-18,50) y antes de "sin" también (20,00-20,04),
# así que los dos cortes caen en silencio. Queda: "septiembre, octubre. … Sin que pasara nada."
# + medio segundo de silencio dramático antes del canto del oso y antes de "¿Era la broma…?"
SEGS = [(0, 15.07), (21.26, 23.66), ('pausa', 0.5), None, (15.07, 18.35), ('pausa', 0.15), (20.01, 21.26), (23.76, 30.60), ('pausa', 0.5), (32.80, RAWLEN)]
FADES = {(15.07, 18.35): (0.08, 0.08), (20.01, 21.26): (0.01, 0.08), (23.76, 30.60): (0.05, 0.08)}
# Whisper pone "sin" en 19,92, pero el análisis espectral lo sitúa en 20,04
FIX = {('sin', 19.92): 20.04}


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
    if s[0] == 'pausa':
        out = np.concatenate([out, np.zeros(int(s[1] * SR))]); continue
    a, b = s
    seg = fade(x[int(a * SR):int(b * SR)].copy(), *FADES.get(s, (0.08 if i else 0, 0.08)))
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
    wd = dict(wd); wd['s'] = FIX.get((wd['w'], wd['s']), wd['s'])
    for a, b, o in maps:
        if a <= wd['s'] < b - 0.05:
            res.append({'w': wd['w'], 's': round(wd['s'] - a + o, 2), 'e': round(min(wd['e'], b) - a + o, 2)}); break
res.sort(key=lambda w: w['s'])
json.dump(res, open('src/polar05/words.json', 'w'), ensure_ascii=False, indent=0)
print('voz fin', round(speech_end, 2), 's · palabras', len(res))
print(' '.join(f"{w['w']}@{w['s']}" for w in res))
