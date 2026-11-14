#!/usr/bin/env python3
"""Writes src/fallo03/plan.json for Fallo #03 (Mars Climate Orbiter, 1999).

  python3 tools/mkplan03.py --scratch          # no recorded voice yet: builds a guide voice (a hum, one pulse per syllable)
                                               # and the phrase times from an estimate, so the whole film can be previewed
  python3 tools/mkplan03.py --voice public/fallo03/voice.wav   # the real recording (cleaned wav): the silences are detected
                                               # for you, 17 speech segments between them (--noise -38dB --d 0.18 to tune)
  python3 tools/mkplan03.py --sil sil.txt      # the same from a file with one "start end" line per silence

Then:  EPISODE=fallo03 python3 tools/therac25_build.py   (timeline.json and the mix)
       EPISODE=fallo03 COMPOSITION=Fallo03 bash tools/therac25_render.sh
"""
import argparse, json, math, os, re, struct, wave
import numpy as np

ROOT = os.getcwd()
IDS = ['A1', 'A2', 'A3', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2', 'F1', 'F2', 'F3', 'G1', 'G2']
# the spoken script (the recording, one phrase per line)
SPOKEN = {
    'A1': 'Nueve meses viajando a Marte.', 'A2': 'Ciento veinticinco millones de dólares.', 'A3': 'Y se perdió por una unidad.',
    'B1': 'Septiembre de mil novecientos noventa y nueve.', 'B2': 'Estás en el control de la NASA.',
    'C1': 'Un software calcula el empuje en libras.', 'C2': 'Otro lo lee en newtons.',
    'D1': 'Una libra son casi cuatro y medio newtons.', 'D2': 'Cada ajuste empuja la nave cuatro veces más fuerte de lo que crees.',
    'E1': 'A menos de ochenta kilómetros, la nave no resiste.', 'E2': 'Pasa a cincuenta y siete.',
    'F1': 'Señal perdida.', 'F2': 'Nadie salió herido.', 'F3': 'Nueve meses de trabajo, desaparecidos.',
    'G1': '¿De quién fue la culpa?', 'G2': '¿Del software o de quien no lo revisó?'}
# on-screen words, display tokens: '|' splits the 2-3 word caption blocks, '*' a yellow key word, '!' a red one
WORDS = {
    'A1': 'NUEVE* MESES | VIAJANDO | A MARTE!', 'A2': '125* MILLONES | DE DÓLARES', 'A3': 'Y SE PERDIÓ! | POR UNA | UNIDAD*',
    'B1': 'SEPTIEMBRE* | DE 1999*', 'B2': 'ESTÁS EN EL | CONTROL | DE LA NASA*',
    'C1': 'UN SOFTWARE | CALCULA EL | EMPUJE | EN LIBRAS*', 'C2': 'OTRO LO LEE | EN NEWTONS*',
    'D1': 'UNA LIBRA | SON CASI | 4,5* NEWTONS', 'D2': 'CADA AJUSTE | EMPUJA LA NAVE | CUATRO* VECES | MÁS FUERTE! | DE LO QUE CREES',
    'E1': 'A MENOS DE | 80* KM | LA NAVE | NO RESISTE!', 'E2': 'PASA A | 57!',
    'F1': 'SEÑAL | PERDIDA!', 'F2': 'NADIE SALIÓ | HERIDO*', 'F3': 'NUEVE MESES | DE TRABAJO | DESAPARECIDOS!',
    'G1': '¿DE QUIÉN | FUE LA CULPA?', 'G2': '¿DEL SOFTWARE?* | O DE QUIEN | NO LO REVISÓ?*'}
SAY = {'125': 'ciento veinticinco', '1999': 'mil novecientos noventa y nueve', '80': 'ochenta', '57': 'cincuenta y siete', '4,5': 'cuatro y medio',
       'NASA': 'nasa', 'KM': 'kilómetros'}
BLOCKS = [('A2c', ['A2']), ('A3c', ['A3']), ('A1c', ['A1']), ('B', ['B1', 'B2']), ('C', ['C1', 'C2']), ('D', ['D1', 'D2']), ('E', ['E1', 'E2']), ('F', ['F1', 'F2', 'F3']), ('G', ['G1', 'G2'])]
# where every phrase sits in public/fallo03/voice.wav (the cleaned take, atempo 1.04): found with the silences of the take
SRC = {'A1': [0.03, 1.66], 'A2': [2.06, 4.30], 'A3': [4.95, 6.32], 'B1': [6.73, 8.97], 'B2': [9.46, 10.97], 'C1': [11.34, 13.44], 'C2': [13.98, 15.32],
       'D1': [15.78, 18.08], 'D2': [18.61, 22.10], 'E1': [22.60, 25.46], 'E2': [25.96, 27.17], 'F1': [27.59, 28.43], 'F2': [28.98, 30.02],
       'F3': [30.45, 32.78], 'G1': [33.15, 34.11], 'G2': [34.61, 36.79]}
BLOCK_GAP = 0.45
GAPS = {'A3c': 0.28, 'A1c': 0.5, 'B': 0.5}  # the loss first (2 then 3 of the take, one breath), then the trip as context


def syllables(text):
    n = 0
    for w in re.findall(r"[a-záéíóúüñ]+", text.lower()):
        n += max(1, len(re.findall(r"[aeiouáéíóúü]+", w)))
    return n


def scratch_voice(path):
    """A guide voice: one soft pulse per syllable (a hum, nothing like speech) so the film can be timed and previewed."""
    SR = 48000
    t0, segs, out = 0.2, {}, []
    cur = t0
    prev_block = None
    for bid, ids in BLOCKS:
        for k, i in enumerate(ids):
            gap = 0.0 if (bid, k) == ('A', 0) else (0.62 if k == 0 else 0.32)
            cur += gap
            n = syllables(SPOKEN[i])
            d = n * 0.168 + 0.18
            segs[i] = (round(cur, 3), round(cur + d, 3))
            for s in range(n):
                out.append((cur + s * 0.168, 0.15))
            cur += d
    total = cur + 0.4
    x = np.zeros(int(total * SR))
    rng = np.random.default_rng(3)
    for st, d in out:
        n0, ln = int(st * SR), int(d * SR)
        tt = np.arange(ln) / SR
        f0 = 105 + 22 * rng.random()
        w = sum(np.sin(2 * np.pi * f0 * k * tt + k) / k for k in range(1, 12))
        env = np.minimum(1, tt / 0.018) * np.exp(-tt / 0.09)
        x[n0:n0 + ln] += 0.22 * w * env
    x = x / max(1e-9, np.abs(x).max()) * 0.5
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, 'wb') as wv:
        wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR)
        wv.writeframes(b''.join(struct.pack('<h', int(v * 32767)) for v in x))
    return segs, total


def main():
    src = SRC
    credit = {'service': 'ElevenLabs (voz del canal, v4 estabilidad 50 similitud 75), limpiada con tools/voice_clean.py y atempo 1.04', 'credits': None, 'note': 'guion final del #03'}
    phrases = []
    for i in IDS:
        d = {'id': i, 'src': src[i], 'words': WORDS[i]}
        if i in ('G1', 'G2'):
            d['captions'] = False
        phrases.append(d)
    chunks, prev = [], None
    for bid, ids in BLOCKS:
        gap = 0 if prev is None else GAPS.get(bid, BLOCK_GAP)
        chunks.append({'id': bid, 'gap': gap, 'phrases': ids})
        prev = ids[-1]
    marks = {'a1': 'p:A1', 'a1end': 'e:A1', 'millones': 'w:A2:1', 'perdio': 'w:A3:2', 'unidad': 'w:A3:5', 'sept': 'p:B1', 'nasa': 'w:B2:6',
             'libras': 'w:C1:6', 'otro': 'p:C2', 'newtons': 'w:C2:4', 'cuatro': 'w:D1:4', 'cuatro2': 'w:D2:5', 'fuerte': 'w:D2:8', 'shareEnd': 'e:D2+0.15',
             'km80': 'w:E1:3', 'km57': 'w:E2:2', 'perdida': 'p:F1', 'herido': 'w:F2:2', 'perdieron': 'w:F3:4',
             'tag1': 'w:G2:1', 'tag2': 'w:G2:4', 'cta': 'e:G2', 'climaxIn': 'p:D2', 'climaxOut': 'p:G1-0.1',
             'burst': 'w:E2:2', 'beamOn': 'p:C1', 'presionar': 'p:D2', 'cutImpact': 'p:F1-0.05'}  # burst, beamOn, presionar, cutImpact: the music grid of the build
    shots = [('S01', 'hook', 'loss', 0, 'I', 'Frame 0: la sonda girando fuera de rumbo, $125,000,000 que pasa a $0, alerta de unidad'),
             ('S02', 'hook', 'count', 'p:A1-0.1', 'N', 'Nueve meses viajando a Marte: el viaje como contexto'),
             ('S03', 'mission', 'room', 'p:B1-0.1', 'N', 'Control de misión, 23 de septiembre de 1999'),
             ('S04', 'units', 'split', 'p:C1-0.1', 'I', 'Libras contra newtons, el signo ≠'),
             ('S05', 'units', 'boost', 'p:D1-0.1', 'N', 'El empuje real contra el calculado: x4,45'),
             ('S06', 'crash', 'dive', 'p:E1-0.1', 'I', '80 km contra 57 km, señal perdida'),
             ('S07', 'aftermath', None, 'p:F2-0.1', 'N', 'Pantalla sin señal, Pip con las manos en la cabeza'),
             ('S08', 'loop', None, 'p:G1-0.1', 'I', 'Balanza software contra revisión y bucle')]
    shot_list = []
    for i, k, v, at, lang, note in shots:
        d = {'id': i, 'kind': k, 'at': at, 'note': note, 'lang': lang}
        if v:
            d['variant'] = v
        shot_list.append(d)

    def e(at, kind, **k):
        return {'at': at, 'kind': kind, **k}
    sfx = [e(0, 'subdrop', dur=1.7, gain=-2), e(0, 'tension', dur=2.6, gain=-11), e(0, 'impact', gain=-4), e(0, 'sub', gain=-4), e('m:perdio', 'crack', gain=-6), e('m:perdio', 'boom', dur=1.0, gain=-8)]
    sfx += [e(round(0.3 + 0.2 * i, 2), 'click', gain=-14 + 0.4 * i) for i in range(0)]
    sfx += [e('m:millones', 'impact', gain=-5), e('m:millones', 'coin', gain=-9),
            e('m:unidad', 'buzzer', dur=0.5, gain=-10), e('m:unidad', 'impact', gain=-4), e('m:unidad', 'glitch', dur=0.3, gain=-10),
            e('m:sept', 'stamp', gain=-6), e('m:nasa', 'blip', gain=-11), e('p:B2', 'tension', dur=1.6, gain=-14),
            e('m:libras', 'pop', gain=-9), e('m:newtons', 'pop', gain=-9),
            e('m:newtons+0.2', 'sub', gain=-3), e('m:newtons+0.2', 'zap', dur=0.8, gain=-11), e('m:newtons+0.2', 'impact', gain=-6),
            e('m:cuatro', 'charge', dur=0.8, gain=-13), e('m:cuatro', 'impact', gain=-6), e('m:cuatro2', 'whoosh', dur=0.5, gain=-11),
            e('m:fuerte', 'slam', gain=-7),
            e('m:km80', 'blip', gain=-10), e('p:E1', 'hum', dur=3.2, gain=-15), e('m:km57', 'impact', gain=-4), e('m:km57', 'buzzer', dur=0.6, gain=-10),
            e('m:km57', 'boom', dur=1.2, gain=-7), e('m:perdida-1.0', 'riser', dur=1.0, gain=-8, duck=False),
            e('m:perdida', 'crack', gain=-5), e('m:perdida', 'glitch', dur=0.5, gain=-9), e('m:perdida', 'crt', gain=-9), e('m:perdida+0.1', 'flatline', dur=1.0, gain=-15),
            e('m:herido', 'heartbeat', gain=-8), e('m:perdieron', 'heartbeat', gain=-7),
            e('p:G1', 'pop', gain=-10), e('m:tag1', 'stamp', gain=-8), e('m:tag2', 'stamp', gain=-8), e('m:cta', 'pop', gain=-11)]
    for at in ['p:A1-0.2', 'p:B1-0.2', 'p:C1-0.2', 'p:D1-0.2', 'p:E1-0.2', 'p:F2-0.2', 'p:G1-0.2']:
        sfx.append(e(at, 'whoosh', dur=0.4, gain=-15))
    fx = [e(0, 'softflash'), e(0, 'hit6'), e('m:millones', 'punch'), e('m:perdio', 'hit6'), e('m:perdio', 'flash'), e('m:unidad', 'hit6'), e('m:unidad', 'punch10'),
          e('m:newtons+0.2', 'hit6'), e('m:newtons+0.2', 'punch10'), e('m:libras', 'punch'), e('m:cuatro', 'punch10'), e('m:fuerte', 'microshake'),
          e('m:km80', 'punch'), e('m:km57', 'punch10'), e('m:km57', 'shake'), e('m:perdida', 'flash'), e('m:perdida', 'hit6'), e('m:perdida', 'glitch'),
          e('m:herido', 'punch'), e('m:tag1', 'punch'), e('m:tag2', 'punch'), e('D-0.017', 'softflash'), e(1.1, 'zoom'), e(2.4, 'zoom')]
    for at in ['p:A1', 'p:B1', 'p:C1', 'p:D1', 'p:E1', 'p:F2', 'p:G1']:
        fx.append(e(at + '-0.1', 'glitch'))
    plan = {'id': 'Fallo03', 'title': 'Fallo #03, Mars Climate Orbiter, 1999', 'fps': 30, 'width': 1080, 'height': 1920, 'voice': 'v1', 'music': 'file',
            'musicFile': 'pista_2.mp3', 'musicStart': 0, 'musicLoop': [4, 24], 'musicDb': 17.0, 'musicDuck': 0.6, 'musicPocket': True, 'voiceCredits': credit,
            'science': [
                {'claim': 'Mars Climate Orbiter was lost on 23 September 1999 as it was to enter orbit around Mars, after a ~9.5 month cruise. Mission cost: spacecraft about US$125 million.', 'source': 'NASA, Mars Climate Orbiter Mishap Investigation Board, Phase I Report, 10 Nov 1999.'},
                {'claim': 'Root cause: ground software supplied thruster impulse data in English units (pound-force seconds) where the navigation software expected metric units (newton-seconds); 1 lbf = 4.45 N, so the real impulse was 4.45 times what navigators assumed.', 'source': 'NASA MIB Phase I Report, 1999.'},
                {'claim': 'TO VERIFY BEFORE PUBLISHING: approach altitude about 57 km against a minimum survivable altitude of about 80 km; spacecraft cost about US$125 million. Figures from public summaries; the report PDF could not be fetched from this session. The planned altitude (the brief said 150 km; the report may say about 226 km) is NOT used in the film.', 'source': 'NASA MIB Phase I Report; NASA JPL mission pages.'},
                {'claim': 'Simplification: "Un software ... otro lo lee" compresses the contractor ground software (SM_FORCES) and the NASA navigation team. The probe is shown as vector art; what happened to it after the pass is not known (probably burned up or skipped off), the video only says the signal was lost.'}],
            'chunks': chunks, 'phrases': phrases, 'say': SAY, 'lead': 0.05, 'marks': marks, 'shots': shot_list, 'fx': fx, 'sfx': sfx, 'vacuum': 0.3,
            'vacuums': ['m:unidad', 'm:perdida'], 'questionAt': 'p:G1', 'outro': 1.8, 'visualLead': {'unidad': 0.25, 'newtons': 0.2, 'km57': 0.25, 'perdida': 0.25}, 'silences': [],
            'musicDips': [{'from': 2.0, 'to': 3.5, 'gain': 0.4}, {'from': 'p:G2', 'to': 'e:G2', 'gain': 0.4}],
            'voices': {'v1': {'file': 'public/fallo03/voice.wav', 'src': src, 'tail': {}}}}
    os.makedirs('src/fallo03', exist_ok=True)
    json.dump(plan, open('src/fallo03/plan.json', 'w'), ensure_ascii=False, indent=2)
    open('src/fallo03/plan.json', 'a').write('\n')
    print(json.dumps(chunks)); print('voice ends at', src['G2'][1])


main()
