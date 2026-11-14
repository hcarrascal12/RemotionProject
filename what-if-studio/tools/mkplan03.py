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
IDS = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'D', 'E1', 'E2', 'F1', 'F2', 'F3', 'G1', 'G2', 'G3']
# the spoken script (also what to record, one line per phrase; pauses of 0.3 s inside a block, 0.6 s between blocks)
SPOKEN = {
    'A1': 'Nueve meses viajando a Marte.', 'A2': 'Ciento veinticinco millones de dólares.', 'A3': 'Y todo se pierde por no convertir una unidad.',
    'B1': 'Septiembre de mil novecientos noventa y nueve.', 'B2': 'Estás en el control de la NASA.', 'B3': 'Tu sonda va a entrar en órbita.',
    'C1': 'Un software calcula el empuje en libras.', 'C2': 'Otro lo lee como si fueran newtons.',
    'D': 'Cada ajuste la empuja cuatro veces más fuerte de lo que crees.',
    'E1': 'Debía pasar a ciento cincuenta kilómetros.', 'E2': 'Pasa a cincuenta y siete.',
    'F1': 'Señal perdida.', 'F2': 'Nadie salió herido.', 'F3': 'Pero nueve meses de trabajo se perdieron.',
    'G1': '¿De quién fue la culpa?', 'G2': '¿Del contratista o de la NASA?', 'G3': 'Te leo en los comentarios.'}
# on-screen words: '|' splits the 2-3 word caption blocks, '*' a yellow key word, '!' a red one
WORDS = {
    'A1': 'NUEVE* MESES | VIAJANDO | A MARTE!', 'A2': '125* MILLONES | DE DÓLARES', 'A3': 'Y TODO SE | PIERDE!* | POR NO | CONVERTIR | UNA UNIDAD*',
    'B1': 'SEPTIEMBRE* | DE 1999*', 'B2': 'ESTÁS EN EL | CONTROL | DE LA NASA*', 'B3': 'TU SONDA* | VA A ENTRAR | EN ÓRBITA!',
    'C1': 'UN SOFTWARE | CALCULA EL | EMPUJE | EN LIBRAS*', 'C2': 'OTRO LO LEE | COMO SI FUERAN | NEWTONS*',
    'D': 'CADA AJUSTE | LA EMPUJA | CUATRO* VECES | MÁS FUERTE! | DE LO QUE | CREES',
    'E1': 'DEBÍA PASAR | A 150* | KILÓMETROS', 'E2': 'PASA A | 57!',
    'F1': 'SEÑAL | PERDIDA!', 'F2': 'NADIE SALIÓ | HERIDO*', 'F3': 'PERO NUEVE MESES | DE TRABAJO | SE PERDIERON!',
    'G1': '¿DE QUIÉN | FUE LA CULPA?', 'G2': '¿DEL CONTRATISTA?* | O DE | LA NASA?*', 'G3': 'TE LEO* EN | LOS COMENTARIOS'}
SAY = {'125': 'ciento veinticinco', '1999': 'mil novecientos noventa y nueve', '150': 'ciento cincuenta', '57': 'cincuenta y siete', 'NASA': 'nasa'}
BLOCKS = [('A', ['A1', 'A2', 'A3']), ('B', ['B1', 'B2', 'B3']), ('C', ['C1', 'C2']), ('D', ['D']), ('E', ['E1', 'E2']), ('F', ['F1', 'F2', 'F3']), ('G', ['G1', 'G2', 'G3'])]


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
    ap = argparse.ArgumentParser()
    ap.add_argument('--scratch', action='store_true')
    ap.add_argument('--sil')
    ap.add_argument('--voice', help='the cleaned recording (wav): silences are detected for you')
    ap.add_argument('--noise', default='-38dB')
    ap.add_argument('--d', default='0.18')
    a = ap.parse_args()
    if a.scratch:
        segs, total = scratch_voice('public/fallo03/voice.wav')
        src = {i: [segs[i][0], segs[i][1]] for i in IDS}
        credit = {'service': 'voz guía sintética (un zumbido por sílaba): sustituir por la grabación real', 'credits': None, 'note': 'ejecuta mkplan03.py --sil con tu voz'}
    else:
        if a.voice:
            import subprocess
            log = subprocess.run(['ffmpeg', '-hide_banner', '-i', a.voice, '-af', f'silencedetect=noise={a.noise}:d={a.d}', '-f', 'null', '-'], capture_output=True, text=True).stderr
            st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
            en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
            dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', a.voice], capture_output=True, text=True).stdout)
            sil = list(zip(st, en + [dur] * (len(st) - len(en))))
            if not sil or sil[0][0] > 0.02:
                sil.insert(0, (0.0, 0.0))
            if sil[-1][1] < dur - 0.02:
                sil.append((dur, dur))
        else:
            sil = [tuple(map(float, l.split())) for l in open(a.sil)]
        seg = [(sil[i][1], sil[i + 1][0]) for i in range(len(sil) - 1)]
        assert len(seg) == len(IDS), f'{len(seg)} speech segments found, {len(IDS)} expected'
        src = {i: [round(s, 3), round(e, 3)] for i, (s, e) in zip(IDS, seg)}
        credit = {'service': 'ElevenLabs (voz del canal), limpiada con tools/voice_clean.py', 'credits': None, 'note': 'guion final del #03'}
    phrases = []
    for i in IDS:
        d = {'id': i, 'src': src[i], 'words': WORDS[i]}
        if i in ('G1', 'G2', 'G3'):
            d['captions'] = False
        phrases.append(d)
    chunks, prev = [], None
    for bid, ids in BLOCKS:
        gap = 0 if prev is None else round(src[ids[0]][0] - src[prev][1], 2)
        chunks.append({'id': bid, 'gap': gap, 'phrases': ids})
        prev = ids[-1]
    marks = {'a1': 'p:A1', 'a1end': 'e:A1', 'millones': 'w:A2:1', 'unidad': 'w:A3:8', 'sept': 'p:B1', 'nasa': 'w:B2:6', 'orbita': 'w:B3:6',
             'libras': 'w:C1:6', 'newtons': 'w:C2:6', 'cuatro': 'w:D:4', 'fuerte': 'w:D:7', 'km150': 'w:E1:3', 'km57': 'w:E2:2',
             'perdida': 'p:F1', 'herido': 'w:F2:2', 'perdieron': 'w:F3:6', 'tag1': 'w:G2:1', 'tag2': 'w:G2:5', 'cta': 'w:G3:0',
             'climaxIn': 'p:D', 'climaxOut': 'p:G1-0.1',
             'burst': 'w:E2:2', 'beamOn': 'p:C1', 'presionar': 'p:D', 'cutImpact': 'p:F1-0.05'}  # burst, beamOn, presionar, cutImpact: the music grid of the build
    shots = [('S01', 'hook', 'count', 0, 'I', 'Frame 0 en movimiento: contadores de km y dólares, la sonda rumbo a Marte'),
             ('S02', 'hook', 'alert', 'p:A3-0.1', 'I', 'La sonda llega a Marte y salta la alerta de unidad'),
             ('S03', 'mission', 'room', 'p:B1-0.1', 'N', 'Control de misión, 23 de septiembre de 1999'),
             ('S04', 'mission', 'screen', 'p:B3-0.1', 'I', 'La pantalla grande: cuenta atrás hacia la órbita'),
             ('S05', 'units', 'split', 'p:C1-0.1', 'I', 'Libras contra newtons, el signo ≠'),
             ('S06', 'units', 'boost', 'p:D-0.1', 'N', 'El empuje real contra el calculado: x4,45'),
             ('S07', 'crash', 'dive', 'p:E1-0.1', 'I', '150 km contra 57 km, señal perdida'),
             ('S08', 'aftermath', None, 'p:F2-0.1', 'N', 'Pantalla sin señal, Pip con las manos en la cabeza'),
             ('S09', 'loop', None, 'p:G1-0.1', 'I', 'Balanza contratista contra NASA, CTA y bucle')]
    shot_list = []
    for i, k, v, at, lang, note in shots:
        d = {'id': i, 'kind': k, 'at': at, 'note': note, 'lang': lang}
        if v:
            d['variant'] = v
        shot_list.append(d)

    def e(at, kind, **k):
        return {'at': at, 'kind': kind, **k}
    sfx = [e(0, 'subdrop', dur=1.7, gain=-2), e(0, 'tickramp', dur=3.4, gain=-9), e(0, 'impact', gain=-3), e(0, 'sub', gain=-3)]
    sfx += [e(round(0.5 + 0.2 * i, 2), 'click', gain=-14 + 0.4 * i) for i in range(12)]
    sfx += [e('m:millones', 'impact', gain=-5), e('m:millones', 'coin', gain=-9),
            e('m:unidad', 'buzzer', dur=0.5, gain=-10), e('m:unidad', 'impact', gain=-4), e('m:unidad', 'glitch', dur=0.3, gain=-10),
            e('m:sept', 'stamp', gain=-6), e('m:nasa', 'blip', gain=-11), e('m:orbita', 'blip', gain=-10), e('m:orbita', 'tension', dur=2.0, gain=-14),
            e('m:libras', 'pop', gain=-9), e('m:newtons', 'pop', gain=-9),
            e('m:newtons+0.2', 'sub', gain=-3), e('m:newtons+0.2', 'zap', dur=0.8, gain=-10), e('m:newtons+0.2', 'impact', gain=-5), e('m:newtons+0.2', 'buzzer', dur=0.5, gain=-12),
            e('p:D', 'whoosh', dur=0.5, gain=-11), e('m:cuatro', 'charge', dur=0.8, gain=-13), e('m:cuatro', 'impact', gain=-6),
            e('m:fuerte', 'slam', gain=-7),
            e('m:km150', 'blip', gain=-10), e('p:E1', 'hum', dur=3.6, gain=-15), e('m:km57', 'impact', gain=-4), e('m:km57', 'buzzer', dur=0.6, gain=-10),
            e('m:km57', 'boom', dur=1.2, gain=-7), e('m:perdida-1.0', 'riser', dur=1.0, gain=-8, duck=False),
            e('m:perdida', 'crack', gain=-4), e('m:perdida', 'glitch', dur=0.5, gain=-8), e('m:perdida', 'crt', gain=-8), e('m:perdida+0.1', 'flatline', dur=1.0, gain=-14),
            e('m:herido', 'heartbeat', gain=-8), e('m:perdieron', 'heartbeat', gain=-7),
            e('p:G1', 'pop', gain=-10), e('m:tag1', 'stamp', gain=-8), e('m:tag2', 'stamp', gain=-8), e('m:cta', 'pop', gain=-11)]
    for at in ['p:A3-0.2', 'p:B1-0.2', 'p:B3-0.2', 'p:C1-0.2', 'p:D-0.2', 'p:E1-0.2', 'p:F2-0.2', 'p:G1-0.2']:
        sfx.append(e(at, 'whoosh', dur=0.4, gain=-15))
    fx = [e(0, 'softflash'), e(0, 'hit6'), e('m:millones', 'punch'), e('m:unidad', 'hit6'), e('m:unidad', 'punch10'), e('m:unidad', 'flash'),
          e('m:newtons+0.2', 'hit6'), e('m:newtons+0.2', 'punch10'), e('m:libras', 'punch'), e('m:cuatro', 'punch10'), e('m:fuerte', 'microshake'),
          e('m:km150', 'punch'), e('m:km57', 'punch10'), e('m:km57', 'shake'), e('m:perdida', 'flash'), e('m:perdida', 'hit6'), e('m:perdida', 'glitch'),
          e('m:herido', 'punch'), e('m:tag1', 'punch'), e('m:tag2', 'punch'), e('D-0.017', 'softflash'), e(0.1, 'glitch'), e(1.1, 'zoom'), e(2.4, 'zoom')]
    for at in ['p:A3', 'p:B1', 'p:B3', 'p:C1', 'p:D', 'p:E1', 'p:F2', 'p:G1']:
        fx.append(e(at + '-0.1', 'glitch'))
    plan = {'id': 'Fallo03', 'title': 'Fallo #03, Mars Climate Orbiter, 1999', 'fps': 30, 'width': 1080, 'height': 1920, 'outro': 1.5, 'voice': 'v1', 'music': 'file',
            'musicFile': 'pista_2.mp3', 'musicStart': 0, 'musicLoop': [4, 24], 'musicDb': 17.0, 'musicDuck': 0.6, 'musicPocket': True, 'voiceCredits': credit,
            'science': [
                {'claim': 'Mars Climate Orbiter was lost on 23 September 1999 as it was to enter orbit around Mars, after a ~9.5 month cruise. Mission cost: spacecraft about US$125 million.', 'source': 'NASA, Mars Climate Orbiter Mishap Investigation Board, Phase I Report, 10 Nov 1999.'},
                {'claim': 'Root cause: ground software supplied thruster impulse data in English units (pound-force seconds) where the navigation software expected metric units (newton-seconds); 1 lbf = 4.45 N, so the real impulse was 4.45 times what navigators assumed.', 'source': 'NASA MIB Phase I Report, 1999.'},
                {'claim': 'TO VERIFY BEFORE PUBLISHING: planned orbit-insertion altitude about 150 km vs about 57 km actual approach; distance travelled about 670 million km. Figures taken from public summaries; the report PDF could not be fetched from this session.', 'source': 'NASA MIB Phase I Report; NASA JPL mission pages.'},
                {'claim': 'Simplification: "Un software ... otro lo lee" compresses the contractor ground software (SM_FORCES) and the NASA navigation team. The probe is shown as vector art; what happened to it after the pass is not known (probably burned up or skipped off), the video only says the signal was lost.'}],
            'chunks': chunks, 'phrases': phrases, 'say': SAY, 'lead': 0.05, 'marks': marks, 'shots': shot_list, 'fx': fx, 'sfx': sfx, 'vacuum': 0.3,
            'vacuums': ['m:unidad', 'm:perdida'], 'questionAt': 'p:G1', 'visualLead': {'unidad': 0.25, 'newtons': 0.2, 'km57': 0.25, 'perdida': 0.25}, 'silences': [],
            'musicDips': [{'from': 2.0, 'to': 4.0, 'gain': 0.4}, {'from': 'p:G3', 'to': 'e:G3', 'gain': 0.4}],
            'voices': {'v1': {'file': 'public/fallo03/voice.wav', 'src': src, 'tail': {}}}}
    os.makedirs('src/fallo03', exist_ok=True)
    json.dump(plan, open('src/fallo03/plan.json', 'w'), ensure_ascii=False, indent=2)
    open('src/fallo03/plan.json', 'a').write('\n')
    print(json.dumps(chunks)); print('voice ends at', src['G3'][1])


main()
