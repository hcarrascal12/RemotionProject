#!/usr/bin/env python3
"""Writes src/sabias01/plan.json for "¿Sabías que…? #01": a 75-year-old woman with a spade cut off the internet in most of Armenia (28 March 2011).

  python3 tools/mkplan_sabias01.py --scratch   # no recording yet: a guide voice (one soft pulse per syllable), public/sabias01/voice.wav
  python3 tools/mkplan_sabias01.py             # the real recording: src/sabias01/takes.json (where each line sits in voice.wav)

Then:  EPISODE=sabias01 python3 tools/therac25_build.py
       EPISODE=sabias01 COMPOSITION=Curio01 DRAFT=1 bash tools/therac25_render.sh
"""
import json, os, re, struct, sys, wave
import numpy as np

SCRATCH = '--scratch' in sys.argv
ORDER = ['A1', 'A2', 'A3']
SPOKEN = {
    'A1': '¿Sabías que una abuela de setenta y cinco años dejó sin internet a casi toda Armenia, con una pala?',
    'A2': 'Buscaba cobre para vender, cortó un cable de fibra óptica, y el país se quedó desconectado durante horas.',
    'A3': 'Un país entero sin internet, como el día del Fallo cero cuatro.'}
# token indexes (marks w:ID:n):
#   A1 SABÍAS0 QUE1 UNA2 ABUELA3 DE4 75(5) AÑOS6 DEJÓ7 SIN8 INTERNET9 A10 CASI11 TODA12 ARMENIA13 CON14 UNA15 PALA16
#   A2 BUSCABA0 COBRE1 PARA2 VENDER3 CORTÓ4 UN5 CABLE6 DE7 FIBRA8 ÓPTICA9 Y10 EL11 PAÍS12 SE13 QUEDÓ14 DESCONECTADO15 DURANTE16 HORAS17
#   A3 UN0 PAÍS1 ENTERO2 SIN3 INTERNET4 COMO5 EL6 DÍA7 DEL8 FALLO9 #04(10)
WORDS = {  # 'WORD~' is timed with the voice but not shown
    'A1': 'SABÍAS~ QUE~ UNA~ ABUELA~ DE~ 75~ AÑOS~ DEJÓ~ SIN~ INTERNET~ | A CASI TODA ARMENIA* | CON UNA PALA!',  # the hook's title carries the start
    'A2': 'BUSCABA COBRE* | PARA VENDER | CORTÓ UN CABLE! | DE FIBRA ÓPTICA | Y EL PAÍS | SE QUEDÓ | DESCONECTADO! | DURANTE HORAS',
    'A3': 'UN~ PAÍS~ ENTERO~ SIN~ INTERNET~ COMO~ EL~ DÍA~ DEL~ FALLO~ #04~'}  # the close card carries it
SAY = {'75': 'setenta y cinco', '#04': 'cero cuatro'}
BLOCKS = [(i + 'c', [i]) for i in ORDER]
GAPS = {'A2c': 0.3, 'A3c': 0.35}
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
        src = scratch_voice('public/sabias01/voice.wav')
        credit = {'service': 'voz guía (pulsos por sílaba), sin grabación todavía', 'credits': 0, 'note': 'reemplazar con la toma real'}
    else:
        src = json.load(open('src/sabias01/takes.json'))
        credit = {'service': 'ElevenLabs (voz del canal), limpiada con tools/voice_clean.py y atempo 1.08', 'credits': None, 'note': 'guion final'}
    phrases = []
    for i in ORDER:
        d = {'id': i, 'src': src[i], 'words': WORDS[i]}
        phrases.append(d)
    chunks, prev = [], None
    for bid, ids in BLOCKS:
        chunks.append({'id': bid, 'gap': 0 if prev is None else GAPS.get(bid, 0.3), 'phrases': ids})
        prev = ids[-1]
    marks = {'armenia': 'w:A1:13', 'pala': 'w:A1:16', 'cobre': 'w:A2:1', 'corto': 'w:A2:4', 'fibra': 'w:A2:8', 'pais': 'w:A2:12', 'desco': 'w:A2:15', 'horas': 'w:A2:17',
             'cierre': 'p:A3', 'fallo': 'w:A3:9',
             'beamOn': 'p:A2', 'presionar': 'w:A2:4', 'cutImpact': 'p:A3-0.05', 'burst': 'w:A2:15'}  # the last four: the build's music grid
    shots = [('S1', 'h1', None, 0, 'ESTA ABUELA APAGÓ EL INTERNET DE UN PAÍS: la abuela con la pala; bajo tierra el cable cortado echa chispas'),
             ('S1b', 'h1', 'pala', 'w:A1:14-0.1', '¡CON UNA PALA!: más cerca, la pala baja y el cable echa chispas'),
             ('S2', 'h2', None, 'p:A2-0.1', 'Bajo tierra: ¿COBRE?; la pala baja y corta el cable; NO ERA COBRE: FIBRA ÓPTICA; la luz deja de pasar'),
             ('S3', 'h3', None, 'w:A2:10-0.1', 'ARMENIA · 2011: los wifis del país se apagan uno a uno; ⏱ HORAS'),
             ('S4', 'h4', None, 'p:A3-0.1', 'UN PAÍS ENTERO SIN INTERNET… y sube la puerta oscura de los fallos: FALLO #04')]
    shot_list = [dict({'id': i, 'kind': k, 'at': at, 'note': note, 'lang': 'I'}, **({'variant': v} if v else {})) for i, k, v, at, note in shots]

    def e(at, kind, **k):
        return {'at': at, 'kind': kind, **k}
    sfx = [e(0, 'subdrop', dur=1.4, gain=-4), e(0, 'crack', gain=-7), e(0.05, 'glitch', dur=0.3, gain=-11),
           e('m:pala', 'clank', gain=-6), e('m:pala+0.1', 'pop', gain=-9),
           e('m:cobre', 'coin', gain=-9), e('m:corto-0.15', 'whoosh', dur=0.2, gain=-9), e('m:corto', 'clank', gain=-5), e('m:corto', 'crack', gain=-7),
           e('m:fibra', 'buzzer', dur=0.3, gain=-11), e('m:desco', 'tickramp', dur=0.9, gain=-13), e('m:horas', 'impact', gain=-7),
           e('m:cierre', 'whoosh', dur=0.3, gain=-9), e('m:fallo-0.1', 'subdrop', dur=1.0, gain=-6), e('m:fallo', 'impact', gain=-5)]
    for at in ['p:A2-0.2', 'w:A2:10-0.2', 'p:A3-0.2']:
        sfx.append(e(at, 'whoosh', dur=0.35, gain=-14))
    sfx.append(e('D-1.2', 'riser', dur=1.2, gain=1, duck=False))
    sfx.append(e('D-0.3', 'whoosh', dur=0.35, gain=-4, duck=False))
    fx = [e(0, 'hit6'), e('m:pala', 'punch10'), e('m:corto', 'hit6'), e('m:corto', 'punch10'), e('m:horas', 'punch'), e('m:fallo', 'hit6'), e('m:fallo', 'punch10')]
    plan = {'id': 'Sabias01', 'title': '¿Sabías que…? #01, la abuela que apagó el internet de un país', 'fps': 30, 'width': 1080, 'height': 1920, 'voice': 'v1',
            'music': 'file', 'musicFile': 'pista_2.mp3', 'musicStart': 0, 'musicLoop': [4, 24], 'musicDb': 20.5, 'musicDuck': 0.75, 'musicFadeOut': 0.2,
            'musicPocket': True, 'voiceCredits': credit,
            'science': [
                {'claim': 'On 28 March 2011 a 75-year-old woman in Georgia, digging for scrap copper, cut a fibre-optic cable with a spade; most of Armenia (and parts of Georgia) lost internet access for hours.', 'source': 'NPR (7 Apr 2011), IEEE Spectrum, Foreign Policy (6 Apr 2011), The Moscow Times (10 Apr 2011), iTnews.'},
                {'claim': 'How long: reports range from a few hours (Armenian providers: about half their customers, for a few hours) to up to 12 hours, so the film says "durante horas" and "casi toda Armenia".', 'source': 'NPR; The Moscow Times; IEEE Spectrum.'},
                {'claim': 'She was arrested and released because of her age; local media called her the "spade hacker".', 'source': 'The World / PRI; NPR.'},
                {'claim': 'The hand-over: Fallo #04, 4 October 2021, WhatsApp, Instagram and Facebook down worldwide for about six hours.', 'source': 'Engineering at Meta, 5 Oct 2021.'}],
            'chunks': chunks, 'phrases': phrases, 'say': SAY, 'lead': 0.12, 'marks': marks, 'shots': shot_list, 'fx': fx, 'sfx': sfx,
            'vacuum': 0.3, 'vacuums': ['m:corto'], 'questionAt': 'p:A3', 'outro': OUTRO,
            'visualLead': {'corto': 0.05}, 'silences': [],
            'musicDips': [{'from': 'p:A1', 'to': 'e:A1', 'gain': 0.6}],
            'voices': {'v1': {'file': 'public/sabias01/voice.wav', 'src': src, 'tail': {}}}}
    os.makedirs('src/sabias01', exist_ok=True)
    json.dump(plan, open('src/sabias01/plan.json', 'w'), ensure_ascii=False, indent=2)
    open('src/sabias01/plan.json', 'a').write('\n')
    print('voice segments:', src)


main()
