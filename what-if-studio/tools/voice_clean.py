"""Clean a narration take so it reads clearly on a phone speaker.

    python3 tools/voice_clean.py public/therac25/voice-v4-raw.mp3 public/therac25/voice-v4.wav

The take is processed with one ffmpeg filter chain (no model, no network) and measured before and after. Written for a
take that is dull and uneven: little energy above 2 kHz, a boomy 250-500 Hz band, quiet word endings. The chain:

  1. high-pass 70 Hz            rumble and plosive thumps
  2. EQ                         -3 dB at 300 Hz (boxy), -2 dB at 160 Hz, +2.5 dB at 1.8 kHz and +3 dB at 3.2 kHz
                                (where consonants live), +2 dB high shelf from 4.5 kHz, a touch of 'air' with an exciter
  3. compressor + speech normaliser   evens the level so word endings are not lost
  4. de-esser                   keeps the boosted highs from getting harsh
  5. limiter at -1 dBFS
"""
from __future__ import annotations

import subprocess
import sys

import numpy as np

SR = 48000

CHAIN = ','.join([
    'aresample=48000',                       # resample first so the limiter sees the final sample rate
    'highpass=f=70:poles=2',
    'equalizer=f=160:t=q:w=1.0:g=-2',
    'equalizer=f=300:t=q:w=1.0:g=-3',
    'equalizer=f=1800:t=q:w=0.7:g=2.5',
    'equalizer=f=3200:t=q:w=0.9:g=3',
    'treble=g=2:f=4500:t=s:w=0.8',
    'aexciter=level_in=1:level_out=1:amount=0.8:drive=7:blend=0:freq=4500:ceil=12000:listen=0',
    'acompressor=threshold=0.05:ratio=3:attack=6:release=90:makeup=2',
    'speechnorm=e=6:r=0.0004:l=1',
    'deesser=i=0.3:m=0.5:f=0.45',
    'alimiter=limit=0.85:attack=3:release=40:level=0',
])


def decode(path: str) -> np.ndarray:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(float)


def metrics(path: str) -> dict:
    x = decode(path)
    fr = int(0.05 * SR)
    rms = np.array([np.sqrt(np.mean(x[i:i + fr] ** 2)) for i in range(0, len(x) - fr, fr)])
    sp = rms > 10 ** (-45 / 20)
    w = 2048
    P = np.zeros(w // 2 + 1)
    for i in range(0, len(x) - w, w // 2):
        if np.sqrt(np.mean(x[i:i + w] ** 2)) > 10 ** (-40 / 20):
            P += np.abs(np.fft.rfft(x[i:i + w] * np.hanning(w))) ** 2
    f = np.fft.rfftfreq(w, 1 / SR)
    band = lambda lo, hi: P[(f >= lo) & (f < hi)].sum()
    lufs = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                          capture_output=True, text=True).stderr
    integrated = [l for l in lufs.splitlines() if l.strip().startswith('I:')][-1].split()[1]
    p10, p50, p90 = np.percentile(20 * np.log10(rms[sp]), [10, 50, 90])
    return {
        'centroid_hz': float((f * P).sum() / P.sum()),
        'presence_db': float(10 * np.log10(band(2000, 5000) / band(200, 1000))),
        'share_above_2k_pct': float(100 * band(2000, 16000) / P.sum()),
        'sibilance_pct': float(100 * band(5000, 10000) / P.sum()),
        'level_p10_db': float(p10), 'level_p50_db': float(p50), 'level_p90_db': float(p90),
        'spread_db': float(p90 - p10),
        'peak_db': float(20 * np.log10(np.abs(x).max())),
        'lufs': float(integrated),
        'clipped': int((np.abs(x) > 0.999).sum()),
    }


def main() -> None:
    src, dst = sys.argv[1], sys.argv[2]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', CHAIN, '-ar', str(SR), '-ac', '1', '-c:a', 'pcm_s24le', dst], check=True)
    a, b = metrics(src), metrics(dst)
    print(f'{"":28s}{"before":>10s}{"after":>10s}')
    for k, label in [('centroid_hz', 'spectral centroid (Hz)'), ('presence_db', 'presence 2-5k vs body (dB)'),
                     ('share_above_2k_pct', 'energy above 2 kHz (%)'), ('sibilance_pct', 'sibilance band 5-10 kHz (%)'), ('level_p50_db', 'speech level, median (dBFS)'),
                     ('level_p10_db', 'speech level, quiet 10% (dBFS)'), ('spread_db', 'level spread p90-p10 (dB)'),
                     ('lufs', 'integrated loudness (LUFS)'), ('peak_db', 'peak (dBFS)'), ('clipped', 'clipped samples')]:
        print(f'{label:28s}{a[k]:10.1f}{b[k]:10.1f}')


if __name__ == '__main__':
    main()
