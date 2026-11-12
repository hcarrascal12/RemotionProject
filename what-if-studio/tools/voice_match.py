"""Clean a narration take and, optionally, pull it toward a reference take (pitch, tonal balance, level).

    python3 tools/voice_match.py SOURCE OUT.wav                       clean only
    python3 tools/voice_match.py SOURCE OUT.wav --ref REFERENCE.mp3   clean, then match the reference

What it does (ffmpeg only, no model, no network):
  clean    high-pass 70 Hz, a light spectral denoise, a noise gate for the pauses, a cut of the 6-10 kHz hiss band, a dynamic de-esser, a lift where
           consonants live (1.5-4 kHz), compressor + speech normaliser.
  match    pitch moved toward the reference (formant-preserving, at most +-3 semitones), then a smoothed third-octave EQ
           (at most +-6 dB) that bends the source's average speech spectrum toward the reference's, and finally the same
           median speech level as the reference.
It cannot change who is speaking: timbre identity, accent and phrasing stay the source's.
"""
from __future__ import annotations

import argparse
import subprocess
import tempfile
from pathlib import Path

import numpy as np

SR = 48000


def decode(path: str, sr: int = SR) -> np.ndarray:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(float)


def median_f0(path: str) -> float:
    s16 = 16000
    x = decode(path, s16)
    w, hop = int(0.04 * s16), int(0.02 * s16)
    lo, hi = int(s16 / 320), int(s16 / 70)
    out = []
    for i in range(0, len(x) - w, hop):
        s = x[i:i + w]
        if np.sqrt(np.mean(s ** 2)) < 0.02:
            continue
        s = s - s.mean()
        ac = np.correlate(s, s, 'full')[w - 1:]
        ac /= ac[0] + 1e-9
        k = lo + int(np.argmax(ac[lo:hi]))
        if ac[k] > 0.5:
            out.append(s16 / k)
    return float(np.median(out))


def speech_level_db(path: str) -> tuple[float, float]:
    x = decode(path)
    fr = int(0.05 * SR)
    rms = np.array([np.sqrt(np.mean(x[i:i + fr] ** 2)) for i in range(0, len(x) - fr, fr)])
    db = 20 * np.log10(np.maximum(rms[rms > 10 ** (-45 / 20)], 1e-9))
    return float(np.percentile(db, 50)), float(np.percentile(db, 10))


CENTERS = [100 * 2 ** (i / 3) for i in range(0, 21)]  # 100 Hz .. about 12.7 kHz, third-octave


def band_db(path: str) -> np.ndarray:
    x = decode(path)
    w = 4096
    P = np.zeros(w // 2 + 1)
    for i in range(0, len(x) - w, w // 2):
        if np.sqrt(np.mean(x[i:i + w] ** 2)) > 10 ** (-40 / 20):
            P += np.abs(np.fft.rfft(x[i:i + w] * np.hanning(w))) ** 2
    f = np.fft.rfftfreq(w, 1 / SR)
    out = []
    for c in CENTERS:
        m = (f >= c / 2 ** (1 / 6)) & (f < c * 2 ** (1 / 6))
        out.append(10 * np.log10(P[m].mean() + 1e-12))
    return np.array(out)


def run(args: list[str]) -> None:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *args], check=True)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('source')
    ap.add_argument('out')
    ap.add_argument('--ref')
    ap.add_argument('--max-semitones', type=float, default=3.0)
    a = ap.parse_args()
    tmp = Path(tempfile.mkdtemp(prefix='vmatch-'))

    # ---- stage 1: clean, and move the pitch toward the reference ----
    chain = ['aresample=48000', 'highpass=f=70:poles=2', 'afftdn=nr=10:nf=-58']
    semis = 0.0
    if a.ref:
        semis = float(np.clip(12 * np.log2(median_f0(a.ref) / median_f0(a.source)), -a.max_semitones, a.max_semitones))
        if abs(semis) > 0.15:
            chain.append(f'rubberband=pitch={2 ** (semis / 12):.5f}:formant=preserved:pitchq=quality:transients=smooth')
    stage1 = tmp / 'stage1.wav'
    run(['-i', a.source, '-af', ','.join(chain), '-ac', '1', '-ar', str(SR), '-c:a', 'pcm_f32le', str(stage1)])

    # ---- stage 2: tone ----
    tone = [
        'equalizer=f=8000:t=h:w=1:g=-5',        # the 6-10 kHz hiss and hard "s" band comes down
        'equalizer=f=2600:t=q:w=0.9:g=3',       # presence, where consonants live
        'equalizer=f=1500:t=q:w=0.9:g=2',
    ]
    if a.ref:
        src_b, ref_b = band_db(str(stage1)), band_db(a.ref)
        sel = [i for i, c in enumerate(CENTERS) if 300 <= c <= 3000]
        diff = (ref_b - ref_b[sel].mean()) - (src_b - src_b[sel].mean())
        diff = np.clip(diff, -6, 6)
        diff = np.convolve(np.pad(diff, 1, mode='edge'), [0.25, 0.5, 0.25], mode='valid')
        entries = ';'.join(f'entry({c:.0f},{g:.2f})' for c, g in zip(CENTERS, diff) if c <= 10000)
        tone = ['highpass=f=70:poles=2', f"firequalizer=gain_entry='{entries}'"]
        print('EQ pulled toward the reference (dB per third-octave band):')
        print('  ' + '  '.join(f'{c:.0f}:{g:+.1f}' for c, g in zip(CENTERS, diff) if c <= 10000))
    # a noise gate first, so the compressor and the speech normaliser below do not lift the room noise in the pauses
    dyn = ['agate=threshold=0.008:ratio=6:attack=4:release=150:range=0.03:detection=rms',
           'acompressor=threshold=0.05:ratio=3:attack=6:release=90:makeup=2', 'speechnorm=e=6:r=0.0004:l=1',
           'deesser=i=0.3:m=0.5:f=0.5', 'afftdn=nr=14:nf=-50']  # the compressor lifts the noise in pauses: denoise again, last
    stage2 = tmp / 'stage2.wav'
    run(['-i', str(stage1), '-af', ','.join(tone + dyn), '-ac', '1', '-c:a', 'pcm_f32le', str(stage2)])

    # ---- stage 3: level (the reference's median speech level, or -17 dBFS) and a limiter ----
    target = speech_level_db(a.ref)[0] if a.ref else -17.0
    gain = target - speech_level_db(str(stage2))[0]
    run(['-i', str(stage2), '-af', f'volume={gain:.2f}dB,alimiter=limit=0.85:attack=3:release=40:level=0', '-ac', '1', '-ar', str(SR),
         '-c:a', 'pcm_s24le', a.out])
    print(f'pitch shift {semis:+.2f} semitones | level gain {gain:+.1f} dB (target median {target:.1f} dBFS)')


if __name__ == '__main__':
    main()
