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
    'A1': 'Nueve meses viajando a Marte.', 'A2': 'Ciento veinticinco millones de dólares.', 'A3': 'Se perdió por una unidad.',
    'B1': 'Septiembre de mil novecientos noventa y nueve.', 'B2': 'Estás en el control de la NASA.',
    'C1': 'Un software calcula el empuje en libras.', 'C2': 'Otro lo lee en newtons.',
    'D1': 'Una libra son casi cuatro y medio newtons.', 'D2': 'Cada ajuste empuja la nave cuatro veces más fuerte de lo que crees.',
    'E1': 'A menos de ochenta kilómetros, la nave no resiste.', 'E2': 'Pasa a cincuenta y siete.',
    'F1': 'Señal perdida.', 'F2': 'Nadie salió herido.', 'F3': 'Nueve meses de trabajo, desaparecidos.',
    'G1': '¿De quién fue la culpa?', 'G2': '¿Del software o de quien no lo revisó?',
    # the four re-recorded lines (public/fallo03/voice.wav after tools/add_takes03.py)
    'H1': 'La NASA perdió ciento veinticinco millones de dólares, por un error de primaria.',
    'H2': 'Un software manda libras. El otro lee newtons. Y cada ajuste empuja la nave, cuatro veces más fuerte.',
    'H3': 'Las reglas de la misión pedían newtons. El software entregó libras, y nadie lo comprobó.',
    'H4': '¿Fue culpa del software, o de los ingenieros que no lo revisaron?'}
# on-screen words, display tokens: '|' splits the 2-3 word caption blocks, '*' a yellow key word, '!' a red one
WORDS = {
    'A1': 'NUEVE* MESES | VIAJANDO | A MARTE!', 'A2': '125* MILLONES | DE DÓLARES', 'A3': 'SE PERDIÓ! | POR UNA | UNIDAD*',
    'B1': 'SEPTIEMBRE* | DE 1999*', 'B2': 'ESTÁS EN EL | CONTROL | DE LA NASA*',
    'C1': 'UN SOFTWARE | CALCULA EL | EMPUJE | EN LIBRAS*', 'C2': 'OTRO LO LEE | EN NEWTONS*',
    'D1': 'UNA LIBRA | SON CASI | 4,5* NEWTONS', 'D2': 'CADA AJUSTE | EMPUJA LA NAVE | CUATRO* VECES | MÁS FUERTE! | DE LO QUE CREES',
    'E1': 'A MENOS DE | 80* KM | LA NAVE | NO RESISTE!', 'E2': 'PASA A | 57!',
    'F1': 'SEÑAL | PERDIDA!', 'F2': 'NADIE SALIÓ | HERIDO*', 'F3': 'NUEVE MESES | DE TRABAJO | DESAPARECIDOS!',
    'G1': '¿DE QUIÉN | FUE LA CULPA?', 'G2': '¿DEL SOFTWARE?* | O DE QUIEN | NO LO REVISÓ?*',
    # token indexes (marks w:ID:n): H1 LA0 NASA1 PERDIÓ2 125(3) MILLONES4 DE5 DÓLARES6 POR7 UN8 ERROR9 DE10 PRIMARIA11
    'H1': 'LA NASA | PERDIÓ! | 125* MILLONES | DE DÓLARES | POR UN | ERROR* | DE PRIMARIA!',
    # H2 UN0 SOFTWARE1 MANDA2 LIBRAS3 EL4 OTRO5 LEE6 NEWTONS7 Y8 CADA9 AJUSTE10 EMPUJA11 LA12 NAVE13 CUATRO14 VECES15 MÁS16 FUERTE17
    'H2': 'UN SOFTWARE | MANDA LIBRAS* | EL OTRO | LEE NEWTONS* | Y CADA AJUSTE | EMPUJA LA NAVE | CUATRO* VECES | MÁS FUERTE!',
    'H3': 'LAS REGLAS | PEDÍAN NEWTONS* | EL SOFTWARE | ENTREGÓ LIBRAS* | Y NADIE | LO COMPROBÓ!',
    # H4 ¿FUE0 CULPA1 DEL2 SOFTWARE?3 O4 DE5 LOS6 INGENIEROS7 QUE8 NO9 LO10 REVISARON?11
    'H4': '¿FUE CULPA | DEL SOFTWARE?* | O DE LOS | INGENIEROS* | QUE NO LO | REVISARON?'}
SAY = {'125': 'ciento veinticinco', '1999': 'mil novecientos noventa y nueve', '80': 'ochenta', '57': 'cincuenta y siete', '4,5': 'cuatro y medio',
       'NASA': 'nasa', 'KM': 'kilómetros'}
# every phrase is its own block, so the pauses between sentences are set here one by one: short and tight (a faster cut),
# a little longer only where a beat has to land (after "unidad", after "señal perdida", before the question)
# the order of the film (B1 'Septiembre de 1999' and F2 'Nadie salió herido' are left out, the date stays on screen):
# the number first (the first spoken word is the cost, as in #02), the unit as the gap, the question and then the share ask
# at the close, which loops back into the cost
# The film now runs on the four re-recorded lines: H1 hook, H2 explanation (one go), H3 who failed, H4 the question.
ORDER = ['H1', 'A1', 'B2', 'H2', 'E1', 'E2', 'F1', 'F3', 'H3', 'H4']
BLOCKS = [(i + 'c', [i]) for i in ORDER]
# where every phrase sits in the take at atempo 1.04 (found with the silences of the take); public/fallo03/voice.wav is now the
# same take at 1.08 (public/fallo03/voice-104.wav, re-timed with atempo 1.0385), so every time is divided by TEMPO
TEMPO = 1.08 / 1.04
SRC104 = {'A1': [0.015, 1.68], 'A2': [2.03, 4.31], 'A3': [4.93, 6.35], 'B1': [6.73, 8.97], 'B2': [9.46, 10.97], 'C1': [11.34, 13.44], 'C2': [13.98, 15.32],
          'D1': [15.78, 18.08], 'D2': [18.61, 22.10], 'E1': [22.60, 25.46], 'E2': [25.96, 27.17], 'F1': [27.59, 28.43], 'F2': [28.98, 30.02],
          'F3': [30.45, 32.78], 'G1': [33.15, 34.11], 'G2': [34.61, 36.79]}
SRC = {k: [round(a / TEMPO, 3), round(b / TEMPO, 3)] for k, (a, b) in SRC104.items()}
SRC.update(json.load(open('src/fallo03/takes.json')))  # H1..H4: where the new takes sit in voice.wav (tools/add_takes03.py)
BLOCK_GAP = 0.22
GAPS = {'A1c': 0.2, 'B2c': 0.22, 'H2c': 0.25, 'E1c': 0.3, 'E2c': 0.2, 'F1c': 0.2, 'F3c': 0.35, 'H3c': 0.3, 'H4c': 0.4}


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
    credit = {'service': 'ElevenLabs (voz del canal, v4 estabilidad 50 similitud 75), limpiada con tools/voice_clean.py y atempo 1.08', 'credits': None, 'note': 'guion final del #03'}
    phrases = []
    for i in ORDER:
        d = {'id': i, 'src': src[i], 'words': WORDS[i]}
        if i in ('G1', 'G2', 'H4'):
            d['captions'] = False
        phrases.append(d)
    chunks, prev = [], None
    for bid, ids in BLOCKS:
        gap = 0 if prev is None else GAPS.get(bid, BLOCK_GAP)
        chunks.append({'id': bid, 'gap': gap, 'phrases': ids})
        prev = ids[-1]
    marks = {'a1': 'p:A1', 'a1end': 'e:A1', 'millones': 'w:H1:4', 'a2': 'p:H1', 'a2end': 'e:H1', 'd2': 'w:H2:8', 'd2end': 'e:H2', 'perdio': 'w:H1:7', 'unidad': 'w:H1:9', 'sept': 'p:B2', 'nasa': 'w:B2:6',
             'libras': 'w:H2:3', 'otro': 'w:H2:4', 'newtons': 'w:H2:7', 'cuatro': 'w:H2:13', 'cuatro2': 'w:H2:14', 'fuerte': 'w:H2:16', 'shareEnd': 'e:H2+0.15', 'ctaIn': 'e:H4+0.15', 'ctaOut': 'D-0.4',
             'km80': 'w:E1:3', 'km57': 'w:E2:2', 'perdida': 'p:F1', 'perdieron': 'w:F3:4',
             'newtons3': 'w:H3:3', 'entrego': 'w:H3:7', 'nadie': 'w:H3:9', 'ajuste': 'w:H2:10', 'empuja': 'w:H2:11', 'tag1': 'w:H4:3', 'tag2': 'w:H4:7', 'cta': 'e:H4', 'climaxIn': 'w:H2:8', 'climaxOut': 'p:H4-0.1',
             'burst': 'w:E2:2', 'beamOn': 'p:H2', 'presionar': 'w:H2:8', 'cutImpact': 'p:F1-0.05'}  # burst, beamOn, presionar, cutImpact: the music grid of the build
    # the hook is three cuts (the cost, the trip, the unit); the explanation is cut into 1-2 s shots, one picture per idea, with
    # only one comparison card (× 4,45) and the consequence (the probe dropping) right after it
    shots = [('S01', 'hook', 'loss', 0, 'I', 'Frame 0: $125,000,000 + 9 MESES DE VIAJE + 1 LIBRA ≠ 1 NEWTON sobre la sonda en llamas'),
             ('S02', 'hook', 'unit', 'w:H1:7-0.1', 'I', 'Por un error de primaria: 1 LIBRA ≠ 1 NEWTON grande; en "error" se congela en gris, solo el ≠ en color'),
             ('S03', 'hook', 'count', 'p:A1-0.1', 'N', 'Nueve meses viajando a Marte: el viaje'),
             ('S04', 'mission', 'room', 'p:B2-0.1', 'N', 'Estás en el control de la NASA; sello 23 SEPT 1999'),
             ('S05a', 'units', 'ground', 'p:H2-0.1', 'I', 'Un software manda libras: la tarjeta amarilla y el propulsor'),
             ('S05b', 'units', 'nasa', 'w:H2:4-0.1', 'I', 'El otro lee newtons: la tarjeta azul recibe los datos'),
             ('S07a', 'nudge', 'wide', 'w:H2:8-0.1', 'I', 'Y cada ajuste empuja la nave: la sonda baja con cada ajuste'),
             ('S07b', 'nudge', 'close', 'm:cuatro2-0.1', 'I', 'Cuatro veces más fuerte: de cerca, la sonda cayendo escalón a escalón'),
             ('S08', 'crash', 'dive', 'p:E1-0.1', 'I', '80 km contra 57 km, señal perdida'),
             ('S09', 'aftermath', None, 'p:F3-0.1', 'N', 'Nueve meses de trabajo, desaparecidos'),
             ('S09b', 'rules', None, 'p:H3-0.1', 'I', 'Las reglas pedían newtons, el software entregó libras, nadie lo comprobó'),
             ('S10', 'debate', None, 'p:H4-0.1', 'I', '¿Fue culpa del software o de los ingenieros? Balanza'),
             ('S11', 'loop', None, 'e:H4+0.05', 'I', 'El cierre: SIN SEÑAL en glitch + MÁNDASELO A ALGUIEN QUE REVISA TODO DOS VECES; la sonda vuelve al fotograma 0')]
    shot_list = []
    for i, k, v, at, lang, note in shots:
        d = {'id': i, 'kind': k, 'at': at, 'note': note, 'lang': lang}
        if v:
            d['variant'] = v
        shot_list.append(d)

    def e(at, kind, **k):
        return {'at': at, 'kind': kind, **k}
    sfx = [e(0, 'subdrop', dur=1.7, gain=-2), e(0, 'tension', dur=2.6, gain=-11), e(0, 'impact', gain=-6), e(0, 'sub', gain=-5), e(0, 'alarm', dur=0.9, gain=-17), e('m:perdio+0.25', 'crack', gain=-12), e('m:perdio+0.25', 'boom', dur=1.0, gain=-13)]
    sfx += [e(round(0.3 + 0.2 * i, 2), 'click', gain=-14 + 0.4 * i) for i in range(0)]
    sfx += [e('m:millones', 'impact', gain=-5), e('m:millones', 'coin', gain=-9),
            e('m:unidad', 'buzzer', dur=0.5, gain=-10), e('m:unidad', 'impact', gain=-4), e('m:unidad', 'glitch', dur=0.3, gain=-10), e('m:unidad', 'zap', dur=0.5, gain=-12),

            e('m:ajuste', 'pop', gain=-9), e('m:empuja', 'pop', gain=-8), e('m:cuatro2', 'impact', gain=-9),
            e('m:sept', 'stamp', gain=-6), e('m:nasa', 'blip', gain=-11), e('p:B2', 'tension', dur=1.6, gain=-14),
            e('m:libras', 'pop', gain=-9), e('m:newtons', 'pop', gain=-9),
            e('m:newtons+0.2', 'sub', gain=-3), e('m:newtons+0.2', 'zap', dur=0.8, gain=-11), e('m:newtons+0.2', 'impact', gain=-6),
            e('m:cuatro', 'charge', dur=0.8, gain=-13), e('m:cuatro', 'impact', gain=-6), e('m:cuatro2', 'whoosh', dur=0.5, gain=-11),
            e('m:fuerte', 'slam', gain=-7),
            e('m:km80', 'blip', gain=-10), e('p:E1', 'hum', dur=3.2, gain=-15), e('m:km57', 'impact', gain=-4), e('m:km57', 'buzzer', dur=0.6, gain=-10),
            e('m:km57', 'boom', dur=1.2, gain=-7), e('m:perdida-1.0', 'riser', dur=1.0, gain=-8, duck=False),
            e('m:perdida', 'crack', gain=-5), e('m:perdida', 'glitch', dur=0.5, gain=-9), e('m:perdida', 'crt', gain=-9), e('m:perdida+0.1', 'flatline', dur=1.0, gain=-15),
            e('m:perdieron', 'heartbeat', gain=-7),
            e('p:H4', 'pop', gain=-10), e('m:tag1', 'stamp', gain=-8), e('m:tag2', 'stamp', gain=-8), e('m:cta', 'pop', gain=-11)]
    for at in ['w:H1:7-0.2', 'p:A1-0.2', 'p:B2-0.2', 'p:H2-0.2', 'w:H2:4-0.2', 'w:H2:8-0.2', 'p:E1-0.2', 'p:F3-0.2', 'p:H3-0.2', 'p:H4-0.2', 'e:H4-0.1']:
        sfx.append(e(at, 'whoosh', dur=0.4, gain=-15))
    # the loop in sound: a riser through the last 1.8 s that lands on the impact of frame 0, and a music tail that is not faded out
    sfx.append(e('D-1.8', 'riser', dur=1.8, gain=2, duck=False))
    sfx.append(e('D-0.3', 'whoosh', dur=0.35, gain=-3, duck=False))
    fx = [e(0, 'hit6'), e('m:millones', 'punch'), e('m:perdio', 'hit6'), e('m:perdio', 'flash'),
          e('m:newtons+0.2', 'hit6'), e('m:newtons+0.2', 'punch10'), e('m:libras', 'punch'), e('m:cuatro', 'punch10'), e('m:fuerte', 'microshake'),
          e('m:km80', 'punch'), e('m:km57', 'punch10'), e('m:km57', 'shake'), e('m:perdida', 'flash'), e('m:perdida', 'hit6'), e('m:perdida', 'glitch'),
          e('m:tag1', 'punch'), e('m:tag2', 'punch'), e('e:H4+0.05', 'glitch'), e('e:H4+0.05', 'hit6'), e('m:ajuste', 'hit6'), e('m:empuja', 'hit6'), e('m:cuatro2', 'hit6')]
    for at in ['w:H1:7', 'p:A1', 'p:B2', 'p:H2', 'w:H2:4', 'w:H2:8', 'w:H2:14', 'p:E1', 'p:F3', 'p:H3', 'p:H4']:
        fx.append(e(at + '-0.1', 'glitch'))
    plan = {'id': 'Fallo03', 'title': 'Fallo #03, Mars Climate Orbiter, 1999', 'fps': 30, 'width': 1080, 'height': 1920, 'voice': 'v1', 'music': 'file',
            'musicFile': 'pista_2.mp3', 'musicStart': 0, 'musicLoop': [4, 24], 'musicDb': 17.0, 'musicDuck': 0.6, 'musicFadeOut': 0.2, 'musicPocket': True, 'voiceCredits': credit,
            'science': [
                {'claim': 'Mars Climate Orbiter was lost on 23 September 1999 as it was to enter orbit around Mars, after a ~9.5 month cruise. Mission cost: spacecraft about US$125 million.', 'source': 'NASA, Mars Climate Orbiter Mishap Investigation Board, Phase I Report, 10 Nov 1999.'},
                {'claim': 'Root cause: ground software supplied thruster impulse data in English units (pound-force seconds) where the navigation software expected metric units (newton-seconds); 1 lbf = 4.45 N, so the real impulse was 4.45 times what navigators assumed.', 'source': 'NASA MIB Phase I Report, 1999.'},
                {'claim': 'TO VERIFY BEFORE PUBLISHING: approach altitude about 57 km against a minimum survivable altitude of about 80 km; spacecraft cost about US$125 million. Figures from public summaries; the report PDF could not be fetched from this session. The planned altitude (the brief said 150 km; the report may say about 226 km) is NOT used in the film.', 'source': 'NASA MIB Phase I Report; NASA JPL mission pages.'},
                {'claim': 'Simplification: "Un software ... otro lo lee" compresses the contractor ground software (SM_FORCES) and the NASA navigation team. The probe is shown as vector art; what happened to it after the pass is not known (probably burned up or skipped off), the video only says the signal was lost.'}],
            'chunks': chunks, 'phrases': phrases, 'say': SAY, 'lead': 0.12, 'marks': marks, 'shots': shot_list, 'fx': fx, 'sfx': sfx, 'vacuum': 0.3,
            'vacuums': ['m:unidad', 'm:perdida'], 'questionAt': 'p:H4', 'outro': 2.7, 'visualLead': {'unidad': 0.08, 'newtons': 0.2, 'km57': 0.25, 'perdida': 0.25}, 'silences': [],
            'musicDips': [{'from': 'p:H1', 'to': 'e:H1', 'gain': 0.5}, {'from': 'p:H4', 'to': 'e:H4', 'gain': 0.4}],
            'voices': {'v1': {'file': 'public/fallo03/voice.wav', 'src': src, 'tail': {}}}}
    os.makedirs('src/fallo03', exist_ok=True)
    json.dump(plan, open('src/fallo03/plan.json', 'w'), ensure_ascii=False, indent=2)
    open('src/fallo03/plan.json', 'a').write('\n')
    print(json.dumps(chunks)); print('voice ends at', src['H4'][1])


main()
