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
ORDER = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']
SPOKEN = {
    'C1': '¿Sabías que el número de emergencias se puede caer?',
    'C2': 'En dos mil catorce, en parte de Estados Unidos, el nueve uno uno dejó de funcionar seis horas.',
    'C3': 'Unas seis mil seiscientas personas llamaron, y nadie contestó.',
    'C4': 'La causa: un error de programación que se podía evitar.',
    'C5': 'Por si acaso, anota el número directo de la policía y los bomberos.',
    'C6': 'Y si lo que se cae es WhatsApp, mira el Fallo cero cuatro.'}
# token indexes (marks w:ID:n):
#   C1 SABÍAS0 QUE1 EL2 NÚMERO3 DE4 EMERGENCIAS5 SE6 PUEDE7 CAER8
#   C2 EN0 2014(1) EN2 PARTE3 DE4 ESTADOS5 UNIDOS6 EL7 911(8) DEJÓ9 DE10 FUNCIONAR11 SEIS12 HORAS13
#   C3 UNAS0 6.600(1) PERSONAS2 LLAMARON3 Y4 NADIE5 CONTESTÓ6
#   C4 LA0 CAUSA1 UN2 ERROR3 DE4 PROGRAMACIÓN5 QUE6 SE7 PODÍA8 EVITAR9
#   C5 POR0 SI1 ACASO2 ANOTA3 EL4 NÚMERO5 DIRECTO6 DE7 LA8 POLICÍA9 Y10 LOS11 BOMBEROS12
#   C6 Y0 SI1 LO2 QUE3 SE4 CAE5 ES6 WHATSAPP7 MIRA8 EL9 FALLO10 #04(11)
WORDS = {  # the series' kinetic captions: 2-3 word hits; 'WORD~' is timed with the voice but not shown
    'C1': 'SABÍAS~ QUE~ EL~ NÚMERO~ DE~ EMERGENCIAS~ | SE PUEDE CAER!',  # the hook's own title carries the first words
    'C2': 'EN 2014* | EN PARTE DE | ESTADOS UNIDOS | EL 911* DEJÓ | DE FUNCIONAR! | SEIS* HORAS',
    'C3': 'UNAS 6.600* | PERSONAS LLAMARON | Y NADIE CONTESTÓ!',
    'C4': 'LA CAUSA | UN ERROR! | DE PROGRAMACIÓN | QUE SE PODÍA EVITAR*',
    'C5': 'POR SI ACASO* | ANOTA EL NÚMERO | DIRECTO DE | LA POLICÍA | Y LOS BOMBEROS*',
    'C6': 'Y~ SI~ LO~ QUE~ SE~ CAE~ ES~ WHATSAPP~ MIRA~ EL~ FALLO~ #04~'}  # the close card carries it
SAY = {'2014': 'dos mil catorce', '911': 'nueve uno uno', '6.600': 'seis mil seiscientas', '#04': 'cero cuatro', 'WHATSAPP': 'guasap'}
BLOCKS = [(i + 'c', [i]) for i in ORDER]
GAPS = {'C2c': 0.3, 'C3c': 0.35, 'C4c': 0.35, 'C5c': 0.35, 'C6c': 0.3}
OUTRO = float(os.environ.get('OUTRO', '1.3'))


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
    marks = {'caer': 'w:C1:8', 'abril': 'p:C2', 'anio': 'w:C2:1', 'eeuu': 'w:C2:5', 'n911': 'w:C2:8', 'llamadas': 'w:C2:11', 'seis': 'w:C2:12', 'horas': 'w:C2:13',
             'unas': 'p:C3', 'cifra': 'w:C3:1', 'nadie': 'w:C3:5', 'contesto': 'w:C3:6',
             'causa': 'p:C4', 'error': 'w:C4:3', 'evitado': 'w:C4:9',
             'acaso': 'p:C5', 'policia': 'w:C5:9', 'bomberos': 'w:C5:12',
             'cierre': 'p:C6', 'whatsapp': 'w:C6:7', 'fallo': 'w:C6:10',
             'beamOn': 'p:C2', 'presionar': 'w:C3:5', 'cutImpact': 'p:C4-0.05', 'burst': 'w:C3:6'}  # the last four: the build's music grid
    shots = [('S1', 'c1', None, 0, 'Pip de noche llama al 911: Llamando… sin respuesta. MARCAS AL 911… Y NADIE CONTESTA'),
             ('S2', 'c2', None, 'p:C2-0.1', 'ABRIL DE 2014, parte de EE. UU.: los 81 centros de emergencia se apagan; 6 HORAS'),
             ('S3', 'c3', None, 'p:C3-0.1', 'El contador sube a 6.600 llamadas sin respuesta; Y NADIE CONTESTÓ'),
             ('S4', 'c4', None, 'p:C4-0.1', 'Código ilustrativo, la línea del error tachada, sello EVITABLE, según la FCC'),
             ('S5', 'c5', None, 'p:C5-0.1', 'Pip pega en la nevera la nota POLICÍA / BOMBEROS'),
             ('S6', 'c6', None, 'p:C6-0.1', 'Firma NO PRESIONES, ¿SABÍAS QUE…? #01, MIRA EL FALLO #04; vuelve al primer fotograma')]
    shot_list = [dict({'id': i, 'kind': k, 'at': at, 'note': note, 'lang': 'I'}, **({'variant': v} if v else {})) for i, k, v, at, note in shots]

    def e(at, kind, **k):
        return {'at': at, 'kind': kind, **k}
    sfx = [e(0, 'subdrop', dur=1.6, gain=-3), e(0, 'impact', gain=-6),
           # the call that goes nowhere: two rings, then nothing
           e(0.45, 'blip', gain=-9), e(0.62, 'blip', gain=-9), e(1.25, 'blip', gain=-9), e(1.42, 'blip', gain=-9), e('m:caer', 'buzzer', dur=0.35, gain=-11),
           e('m:anio', 'stamp', gain=-7), e('m:n911', 'pop', gain=-10), e('m:llamadas', 'tickramp', dur=1.2, gain=-14), e('m:horas', 'impact', gain=-6),
           e('m:cifra', 'tickramp', dur=1.0, gain=-13), e('m:contesto', 'boom', dur=0.9, gain=-8),
           e('m:error', 'glitch', dur=0.35, gain=-9), e('m:evitado', 'stamp', gain=-6),
           e('m:acaso+0.3', 'pop', gain=-9), e('m:bomberos', 'coin', gain=-10),
           e('m:cierre', 'impact', gain=-6), e('m:fallo', 'click', gain=-6), e('m:fallo', 'pop', gain=-8)]
    for at in ['p:C2-0.2', 'p:C3-0.2', 'p:C4-0.2', 'p:C5-0.2', 'p:C6-0.2']:
        sfx.append(e(at, 'whoosh', dur=0.35, gain=-14))
    sfx.append(e('D-1.2', 'riser', dur=1.2, gain=1, duck=False))
    sfx.append(e('D-0.3', 'whoosh', dur=0.35, gain=-4, duck=False))
    fx = [e(0, 'hit6'), e('m:horas', 'punch10'), e('m:contesto', 'hit6'), e('m:contesto', 'punch10'), e('m:evitado', 'hit6'), e('m:cierre', 'hit6'), e('m:fallo', 'punch')]
    plan = {'id': 'Curio01', 'title': '¿Sabías que…? #01, el número de emergencias se puede caer', 'fps': 30, 'width': 1080, 'height': 1920, 'voice': 'v1',
            'music': 'file', 'musicFile': 'pista_2.mp3', 'musicStart': 0, 'musicLoop': [4, 24], 'musicDb': 20.5, 'musicDuck': 0.75, 'musicFadeOut': 0.2,
            'musicPocket': True, 'voiceCredits': credit,
            'science': [
                {'claim': 'Late on 9 April 2014 a call-routing facility in Englewood, Colorado stopped delivering 911 calls to 81 call centres (PSAPs) in several states, for about six hours.', 'source': 'FCC Public Safety and Homeland Security Bureau report (Oct 2014), via Urgent Comm and Threatpost.'},
                {'claim': 'About 6,600 911 calls were not completed.', 'source': 'FCC settlement with CenturyLink and Intrado (2015), via EMS1 and Benton.'},
                {'claim': 'The cause was a preventable software coding error in Intrado\'s system.', 'source': 'FCC report, via HotHardware.'},
                {'claim': 'NOT USED (unconfirmed): that the error was a call counter reaching its maximum. The code on screen is labelled illustrative and implies no cause.'},
                {'claim': 'The advice (keep the direct numbers of the police and fire service) is general prevention advice, not a fact.'}],
            'chunks': chunks, 'phrases': phrases, 'say': SAY, 'lead': 0.12, 'marks': marks, 'shots': shot_list, 'fx': fx, 'sfx': sfx,
            'vacuum': 0.3, 'vacuums': ['m:nadie', 'm:evitado'], 'questionAt': 'p:C6', 'outro': OUTRO,
            'visualLead': {'contesto': 0.05, 'evitado': 0.05}, 'silences': [],
            'musicDips': [{'from': 'p:C1', 'to': 'e:C1', 'gain': 0.5}, {'from': 'p:C5', 'to': 'e:C5', 'gain': 0.7}],
            'voices': {'v1': {'file': 'public/curio01/voice.wav', 'src': src, 'tail': {}}}}
    os.makedirs('src/curio01', exist_ok=True)
    json.dump(plan, open('src/curio01/plan.json', 'w'), ensure_ascii=False, indent=2)
    open('src/curio01/plan.json', 'a').write('\n')
    print('voice segments:', src)


main()
