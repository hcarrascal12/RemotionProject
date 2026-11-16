#!/usr/bin/env python3
"""Writes src/curio01/plan.json for "¿Sabías que…? #01": the emergency number can go down (911, 9-10 April 2014).

  python3 tools/mkplan_curio01.py --scratch   # no recording yet: a guide voice (one soft pulse per syllable), public/curio01/voice.wav
  python3 tools/mkplan_curio01.py             # the real recording: src/curio01/takes.json (where each line sits in voice.wav)

Then:  EPISODE=curio01 python3 tools/therac25_build.py
       EPISODE=curio01 COMPOSITION=Curio01 DRAFT=1 bash tools/therac25_render.sh
"""
import json, os, re, struct, sys, wave
import numpy as np

SCRATCH = '--scratch' in sys.argv
ORDER = ['C1', 'C2', 'C3', 'C4', 'C5']
# pure curiosity: every line opens a question the next one answers with something stranger; the last opens a Fallo
SPOKEN = {
    'C1': '¿Sabías que el nueve uno uno se puede caer en un día normal, sin tormenta?',
    'C2': 'Pasó en dos mil catorce: seis horas, miles de llamadas sin respuesta.',
    'C3': '¿Lo más raro? Las de Washington se quedaban atascadas en una central de Colorado.',
    'C4': '¿Por qué? Un contador de llamadas llegó a su tope, cuarenta millones, y el sistema dejó de pasarlas.',
    'C5': '¿Y sabías que WhatsApp también se cayó en todo el mundo? Es el Fallo cero cuatro.'}
# token indexes (marks w:ID:n):
#   C1 SABÍAS0 QUE1 EL2 911(3) SE4 PUEDE5 CAER6 EN7 UN8 DÍA9 NORMAL10 SIN11 TORMENTA12
#   C2 PASÓ0 EN1 2014(2) SEIS3 HORAS4 MILES5 DE6 LLAMADAS7 SIN8 RESPUESTA9
#   C3 ¿LO0 MÁS1 RARO?2 LAS3 DE4 WASHINGTON5 SE6 QUEDABAN7 ATASCADAS8 EN9 UNA10 CENTRAL11 DE12 COLORADO13
#   C4 ¿POR0 QUÉ?1 UN2 CONTADOR3 DE4 LLAMADAS5 LLEGÓ6 A7 SU8 TOPE9 40(10) MILLONES11 Y12 EL13 SISTEMA14 DEJÓ15 DE16 PASARLAS17
#   C5 Y0 SABÍAS1 QUE2 WHATSAPP3 TAMBIÉN4 SE5 CAYÓ6 EN7 TODO8 EL9 MUNDO10 ES11 EL12 FALLO13 #04(14)
WORDS = {  # the series' kinetic captions: 2-3 word hits; 'WORD~' is timed with the voice but not shown
    'C1': 'SABÍAS~ QUE~ EL~ 911~ SE~ PUEDE~ CAER~ | EN UN DÍA NORMAL | SIN TORMENTA*',  # the hook's own title carries the first words
    'C2': 'PASÓ EN 2014* | SEIS* HORAS | MILES DE LLAMADAS | SIN RESPUESTA!',
    'C3': '¿LO MÁS RARO?* | LAS DE WASHINGTON | SE QUEDABAN | ATASCADAS! | EN UNA CENTRAL | DE COLORADO*',
    'C4': '¿POR QUÉ?* UN CONTADOR | DE LLAMADAS | LLEGÓ A SU TOPE! | 40* MILLONES | Y EL SISTEMA | DEJÓ DE PASARLAS!',
    'C5': 'Y~ SABÍAS~ QUE~ WHATSAPP~ TAMBIÉN~ SE~ CAYÓ~ EN~ TODO~ EL~ MUNDO~ ES~ EL~ FALLO~ #04~'}  # the close card carries it: the curiosity hands over to a Fallo
SAY = {'2014': 'dos mil catorce', '911': 'nueve uno uno', '40': 'cuarenta', '#04': 'cero cuatro', 'WHATSAPP': 'guasap', 'WASHINGTON': 'guáshinton', '¿LO': 'lo', 'RARO?': 'raro', '¿POR': 'por', 'QUÉ?': 'qué', '¿LO MÁS RARO?': 'lo más raro'}
BLOCKS = [(i + 'c', [i]) for i in ORDER]
GAPS = {'C2c': 0.3, 'C3c': 0.35, 'C4c': 0.35, 'C5c': 0.4}
OUTRO = float(os.environ.get('OUTRO', '1.9'))  # the door of the Fallo stays up long enough to read and tap


def syllables(text):
    return sum(max(1, len(re.findall(r'[aeiouáéíóúü]+', w))) for w in re.findall(r'[a-záéíóúüñ]+', text.lower()))


def scratch_voice(path):
    """The guide voice: one soft pulse per syllable, at the series' pace (about 0.195 s a syllable)."""
    SR = 48000
    cur, segs, pulses = 0.2, {}, []
    for i in ORDER:
        n = syllables(SPOKEN[i])
        d = n * 0.195 + 0.15
        segs[i] = [round(cur, 3), round(cur + d, 3)]
        pulses += [(cur + s * 0.195, 0.15) for s in range(n)]
        cur += d + 0.8
    x = np.zeros(int((cur + 0.5) * SR))
    rng = np.random.default_rng(11)
    for st, d in pulses:
        n0, ln = int(st * SR), int(d * SR)
        tt = np.arange(ln) / SR
        f0 = 110 + 25 * rng.random()
        w = sum(np.sin(2 * np.pi * f0 * k * tt + k) / k for k in range(1, 10))
        x[n0:n0 + ln] += 0.22 * w * np.minimum(1, tt / 0.015) * np.exp(-tt / 0.08)
    x = x / max(1e-9, np.abs(x).max()) * 0.5
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, 'wb') as wv:
        wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR)
        wv.writeframes(b''.join(struct.pack('<h', int(v * 32767)) for v in x))
    return segs


def main():
    if SCRATCH:
        src = scratch_voice('public/curio01/voice.wav')
        credit = {'service': 'voz guía (pulsos por sílaba), sin grabación todavía', 'credits': 0, 'note': 'reemplazar con la toma real'}
    else:
        src = json.load(open('src/curio01/takes.json'))
        credit = {'service': 'ElevenLabs (voz del canal), limpiada con tools/voice_clean.py y atempo 1.08', 'credits': None, 'note': 'guion final'}
    phrases = []
    for i in ORDER:
        d = {'id': i, 'src': src[i], 'words': WORDS[i]}
        phrases.append(d)
    chunks, prev = [], None
    for bid, ids in BLOCKS:
        chunks.append({'id': bid, 'gap': 0 if prev is None else GAPS.get(bid, 0.3), 'phrases': ids})
        prev = ids[-1]
    marks = {'normal': 'w:C1:10', 'tormenta': 'w:C1:12', 'anio': 'w:C2:2', 'seis': 'w:C2:3', 'horas': 'w:C2:4', 'miles': 'w:C2:5', 'nadie': 'w:C2:9',
             'raro': 'p:C3', 'wash': 'w:C3:5', 'atasc': 'w:C3:8', 'colorado': 'w:C3:13',
             'porque': 'p:C4', 'contador': 'w:C4:3', 'tope': 'w:C4:9', 'millones': 'w:C4:11', 'dejo': 'w:C4:15',
             'cierre': 'p:C5', 'apps': 'w:C5:3', 'vez': 'w:C5:10', 'fallo': 'w:C5:13',
             'beamOn': 'p:C2', 'presionar': 'w:C3:8', 'cutImpact': 'p:C4-0.05', 'burst': 'w:C4:9'}  # the last four: the build's music grid
    shots = [('S1', 'c1', None, 0, '¿EL 911 SE PUEDE CAER? Pip llama, en un día de sol: dos tonos, sin respuesta'),
             ('S2', 'c2', None, 'p:C2-0.1', '2014 · 6 HORAS: los teléfonos con X llenan la pantalla, 6.600 llamadas sin respuesta'),
             ('S3', 'c3', None, 'p:C3-0.1', 'El mapa: las llamadas salen de WASHINGTON y se amontonan en COLORADO, ATASCADAS'),
             ('S4', 'c4', None, 'p:C4-0.1', 'El contador rueda hasta 40.000.000 y se queda clavado: TOPE; el bichito encima; según la FCC'),
             ('S5', 'c6', None, 'p:C5-0.1', '¿Y SABÍAS QUE…? WhatsApp cae y sube la puerta oscura de los fallos: FALLO #04')]
    shot_list = [dict({'id': i, 'kind': k, 'at': at, 'note': note, 'lang': 'I'}, **({'variant': v} if v else {})) for i, k, v, at, note in shots]

    def e(at, kind, **k):
        return {'at': at, 'kind': kind, **k}
    sfx = [e(0, 'subdrop', dur=1.4, gain=-5), e(0, 'pop', gain=-8),
           # the call that goes nowhere: two rings, then a puzzled little blip
           e(0.45, 'blip', gain=-9), e(0.62, 'blip', gain=-9), e(1.25, 'blip', gain=-9), e(1.42, 'blip', gain=-9), e('m:tormenta', 'pop', gain=-9),
           e('m:anio', 'stamp', gain=-8), e('m:horas', 'impact', gain=-7), e('m:miles', 'tickramp', dur=1.0, gain=-14), e('m:nadie', 'buzzer', dur=0.3, gain=-11),
           e('m:raro', 'whoosh', dur=0.3, gain=-10), e('m:wash', 'blip', gain=-10), e('m:atasc', 'clank', gain=-8), e('m:atasc+0.2', 'pop', gain=-10), e('m:colorado', 'pop', gain=-9),
           e('m:contador', 'tickramp', dur=1.3, gain=-12), e('m:tope', 'clank', gain=-6), e('m:millones', 'impact', gain=-6), e('m:dejo', 'buzzer', dur=0.35, gain=-10),
           e('m:cierre', 'whoosh', dur=0.3, gain=-9), e('m:apps', 'pop', gain=-8), e('m:vez', 'buzzer', dur=0.3, gain=-11), e('m:fallo-0.1', 'subdrop', dur=1.0, gain=-6), e('m:fallo', 'impact', gain=-5)]
    for at in ['p:C2-0.2', 'p:C3-0.2', 'p:C4-0.2', 'p:C5-0.2']:
        sfx.append(e(at, 'whoosh', dur=0.35, gain=-14))
    sfx.append(e('D-1.2', 'riser', dur=1.2, gain=1, duck=False))
    sfx.append(e('D-0.3', 'whoosh', dur=0.35, gain=-4, duck=False))
    fx = [e(0, 'hit6'), e('m:horas', 'punch10'), e('m:atasc', 'punch'), e('m:millones', 'hit6'), e('m:millones', 'punch10'), e('m:fallo', 'hit6'), e('m:fallo', 'punch10')]
    plan = {'id': 'Curio01', 'title': '¿Sabías que…? #01, el número de emergencias se puede caer', 'fps': 30, 'width': 1080, 'height': 1920, 'voice': 'v1',
            'music': 'file', 'musicFile': 'pista_2.mp3', 'musicStart': 0, 'musicLoop': [4, 24], 'musicDb': 20.5, 'musicDuck': 0.75, 'musicFadeOut': 0.2,
            'musicPocket': True, 'voiceCredits': credit,
            'science': [
                {'claim': '"Un día normal, sin tormenta": the FCC called it a "sunny day" outage, one not caused by weather or a disaster.', 'source': 'IEEE Spectrum (Oct 2014), quoting FCC Chairman Wheeler.'},
                {'claim': 'Late on 9 April 2014, for about six hours, 911 calls from parts of seven states failed to reach 81 call centres; about 6,600 calls were not completed.', 'source': 'FCC report (Oct 2014) via Urgent Comm, Threatpost; FCC settlement (2015) via EMS1, Benton.'},
                {'claim': 'Calls from Washington state were stuck at a routing centre in Englewood, Colorado.', 'source': 'AP, "Report: Washington 911 calls got stuck in Colorado" (Apr 2014), via phys.org and Star Tribune.'},
                {'claim': 'The cause: the software gave each call a number from a counter capped at 40 million; when it hit the cap it stopped routing calls. An FCC official called the cap "arbitrary".', 'source': 'FCC report via IEEE Spectrum, HotHardware, Threatpost, the SystemSafety list (Oct 2014).'},
                {'claim': 'The hand-over: WhatsApp went down worldwide on 4 October 2021 (Fallo #04).', 'source': 'Engineering at Meta, 5 Oct 2021.'}],
            'chunks': chunks, 'phrases': phrases, 'say': SAY, 'lead': 0.12, 'marks': marks, 'shots': shot_list, 'fx': fx, 'sfx': sfx,
            'vacuum': 0.3, 'vacuums': ['m:atasc', 'm:millones'], 'questionAt': 'p:C5', 'outro': OUTRO,
            'visualLead': {'atasc': 0.05, 'millones': 0.05}, 'silences': [],
            'musicDips': [{'from': 'p:C1', 'to': 'e:C1', 'gain': 0.5}],
            'voices': {'v1': {'file': 'public/curio01/voice.wav', 'src': src, 'tail': {}}}}
    os.makedirs('src/curio01', exist_ok=True)
    json.dump(plan, open('src/curio01/plan.json', 'w'), ensure_ascii=False, indent=2)
    open('src/curio01/plan.json', 'a').write('\n')
    print('voice segments:', src)


main()
