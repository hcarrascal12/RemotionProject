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
ORDER = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']
SPOKEN = {
    'A1': '¿Sabías que una abuela de setenta y cinco años dejó sin internet a casi toda Armenia, con una pala?',
    'A2': 'Marzo de dos mil once, en Georgia: buscaba cobre para vender como chatarra.',
    'A3': 'Cavó y cavó, y en vez de cobre, cortó un cable de fibra óptica.',
    'A4': 'Ese cable llevaba internet a Armenia. El país se quedó desconectado durante horas, y parte de Georgia también.',
    'A5': 'La detuvieron, y la soltaron por su edad. La prensa la llamó: la hacker de la pala.',
    'A6': '¿Algo tan pequeño puede tumbarlo todo? Pregúntale a la NASA: Fallo cero tres.',
    'A7': 'Sígueme: cada semana, un fallo nuevo.'}
# token indexes (marks w:ID:n):
#   A1 SABÍAS0 QUE1 UNA2 ABUELA3 DE4 75(5) AÑOS6 DEJÓ7 SIN8 INTERNET9 A10 CASI11 TODA12 ARMENIA13 CON14 UNA15 PALA16
#   A2 MARZO0 DE1 2011(2) EN3 GEORGIA4 BUSCABA5 COBRE6 PARA7 VENDER8 COMO9 CHATARRA10
#   A3 CAVÓ0 Y1 CAVÓ2 Y3 EN4 VEZ5 DE6 COBRE7 CORTÓ8 UN9 CABLE10 DE11 FIBRA12 ÓPTICA13
#   A4 ESE0 CABLE1 LLEVABA2 INTERNET3 A4 ARMENIA5 EL6 PAÍS7 SE8 QUEDÓ9 DESCONECTADO10 DURANTE11 HORAS12 Y13 PARTE14 DE15 GEORGIA16 TAMBIÉN17
#   A5 LA0 DETUVIERON1 Y2 LA3 SOLTARON4 POR5 SU6 EDAD7 LA8 PRENSA9 LA10 LLAMÓ11 LA12 HACKER13 DE14 LA15 PALA16
#   A6 ALGO0 TAN1 PEQUEÑO2 PUEDE3 TUMBARLO4 TODO5 PREGÚNTALE6 A7 LA8 NASA9 FALLO10 #03(11)
#   A7 SÍGUEME0 CADA1 SEMANA2 UN3 FALLO4 NUEVO5
WORDS = {  # 'WORD~' is timed with the voice but not shown
    'A1': '¿SABÍAS QUE | UNA ABUELA | DE 75* AÑOS | DEJÓ SIN INTERNET! | A CASI TODA ARMENIA* | CON UNA PALA!',  # captions from the first word
    'A2': 'MARZO DE 2011* | EN GEORGIA | BUSCABA COBRE* | PARA VENDER | COMO CHATARRA',
    'A3': 'CAVÓ Y CAVÓ | Y EN VEZ DE COBRE | CORTÓ UN CABLE! | DE FIBRA ÓPTICA*',
    'A4': 'ESE CABLE | LLEVABA INTERNET A ARMENIA* | EL PAÍS SE QUEDÓ | DESCONECTADO! | DURANTE HORAS | Y PARTE DE GEORGIA | TAMBIÉN',
    'A5': 'LA DETUVIERON! | Y LA SOLTARON | POR SU EDAD* | LA PRENSA | LA LLAMÓ | LA HACKER | DE LA PALA!',
    'A6': 'ALGO~ TAN~ PEQUEÑO~ PUEDE~ TUMBARLO~ TODO~ PREGÚNTALE~ A~ LA~ NASA~ FALLO~ #03~',  # the close card carries it: the hand-over to Fallo #03
    'A7': 'SÍGUEME~ CADA~ SEMANA~ UN~ FALLO~ NUEVO~'}  # the follow button carries it
SAY = {'75': 'setenta y cinco', '2011': 'dos mil once', '#03': 'cero tres'}
BLOCKS = [(i + 'c', [i]) for i in ORDER]
GAPS = {'A2c': 0.35, 'A3c': 0.3, 'A4c': 0.3, 'A5c': 0.35, 'A6c': 0.4, 'A7c': 0.3}
OUTRO = float(os.environ.get('OUTRO', '1.5'))  # the door of the Fallo stays up long enough to read and tap


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
    # a take without the follow line (A7): the follow ask then lives on screen only, right after the hand-over
    order = [i for i in ORDER if i in src]
    has_follow = 'A7' in order
    phrases = []
    for i in order:
        d = {'id': i, 'src': src[i], 'words': WORDS[i]}
        phrases.append(d)
    chunks, prev = [], None
    for bid, ids in [b for b in BLOCKS if b[1][0] in order]:
        chunks.append({'id': bid, 'gap': 0 if prev is None else GAPS.get(bid, 0.3), 'phrases': ids})
        prev = ids[-1]
    marks = {'armenia': 'w:A1:13', 'pala': 'w:A1:16',
             'fecha': 'w:A2:2', 'georgia1': 'w:A2:4', 'cobre': 'w:A2:6', 'chatarra': 'w:A2:10',
             'cavo1': 'p:A3', 'cavo2': 'w:A3:2', 'corto': 'w:A3:8', 'fibra': 'w:A3:12',
             'llevaba': 'w:A4:2', 'armenia2': 'w:A4:5', 'desco': 'w:A4:10', 'horas': 'w:A4:12', 'georgia2': 'w:A4:16',
             'policia': 'p:A5', 'detuvo': 'w:A5:1', 'solto': 'w:A5:4', 'edad': 'w:A5:7', 'prensa': 'w:A5:9', 'hacker': 'w:A5:13',
             'cierre': 'p:A6', 'nasa': 'w:A6:9', 'fallo': 'w:A6:10', 'sigue': 'p:A7' if has_follow else 'e:A6+0.35', 'tap': 'w:A7:5' if has_follow else 'e:A6+1.45',
             'beamOn': 'p:A2', 'presionar': 'w:A3:8', 'cutImpact': 'p:A5-0.05', 'burst': 'w:A4:10'}  # the last four: the build's music grid
    # the What If direction: a new size or angle on every cut, cut on the word
    shots = [('S1', 'title', None, 0, 'Título sobre el gran plano al atardecer: la abuela a contraluz, la pala clavada, chispas bajo tierra'),
             ('S2', 'face', None, 'w:A1:5-0.1', 'Primer plano: su cara contra el sol bajo, bokeh; 75 AÑOS'),
             ('S3', 'city', None, 'w:A1:8-0.1', 'Picado sobre Armenia al atardecer: las pantallas de los celulares pasan de azul a gris'),
             ('S4', 'strike', None, 'w:A1:14-0.1', 'Contrapicado: levanta la pala contra el sol'),
             ('S5', 'blade', None, 'w:A1:16-0.08', 'Macro: la hoja muerde la tierra, saltan terrones'),
             ('S6', 'walk', None, 'p:A2-0.1', 'Gran plano: camina por el campo con la pala al hombro, sombra larga; 28·03·2011 · GEORGIA'),
             ('S7', 'copper', None, 'w:A2:5-0.1', 'Cenital macro: cobre brillando en la tierra, su mano entra por la derecha'),
             ('S8', 'dig', None, 'p:A3-0.1', 'Plano medio: cava, dos paladas, terrones al aire'),
             ('S9', 'cut', None, 'w:A3:3-0.1', 'Cenital al hoyo: el cable naranja con luz; la hoja baja y lo corta: destello, chispas'),
             ('S10', 'fiber', None, 'w:A3:12-0.1', 'Plano detalle: las fibras de vidrio abiertas, su luz se apaga; FIBRA ÓPTICA'),
             ('S11', 'schem', None, 'p:A4-0.1', 'Esquema: la línea de Georgia a Armenia, la luz baja por ella y se rompe: SIN CONEXIÓN'),
             ('S12', 'ots', None, 'w:A4:11-0.1', 'Por encima del hombro de Mo: Pip en la azotea, el celular sin conexión; DURANTE HORAS'),
             ('S13', 'mo', None, 'w:A4:13-0.1', 'Primer plano de Mo iluminado por su celular muerto; Y PARTE DE GEORGIA'),
             ('S14', 'police', None, 'p:A5-0.1', 'Contrapicado: llega la patrulla, luces rojas y azules barren el campo'),
             ('S15', 'face', 'free', 'w:A5:2-0.1', 'Primer plano: sonríe y saluda; LIBERADA'),
             ('S16', 'paper', None, 'w:A5:8-0.1', 'Cenital: el periódico entra y se asienta: LA HACKER DE LA PALA'),
             ('S17', 'door', None, 'p:A6-0.1', '¿ALGO TAN PEQUEÑO PUEDE TUMBARLO TODO? sube la puerta del FALLO #03; en "sígueme" el botón pasa a + SEGUIR y una mano lo pulsa: SIGUIENDO')]
    shot_list = [dict({'id': i, 'kind': k, 'at': at, 'note': note, 'lang': 'I'}, **({'variant': v} if v else {})) for i, k, v, at, note in shots]

    def e(at, kind, **k):
        return {'at': at, 'kind': kind, **k}
    sfx = [e(0, 'subdrop', dur=1.4, gain=-4), e(0, 'crack', gain=-7), e(0.05, 'glitch', dur=0.3, gain=-11),
           e('m:pala', 'clank', gain=-6), e('m:pala+0.1', 'crack', gain=-9),
           e('m:fecha', 'stamp', gain=-9), e('m:cobre', 'coin', gain=-8), e('m:chatarra', 'pop', gain=-10),
           e('m:cavo1', 'clank', gain=-8), e('m:cavo2', 'clank', gain=-7), e('m:corto-0.15', 'whoosh', dur=0.2, gain=-9), e('m:corto', 'clank', gain=-5), e('m:corto', 'crack', gain=-6), e('m:fibra', 'buzzer', dur=0.3, gain=-11),
           e('m:llevaba', 'tickramp', dur=1.0, gain=-14), e('m:desco', 'buzzer', dur=0.35, gain=-9), e('m:horas', 'impact', gain=-7), e('m:georgia2', 'pop', gain=-9),
           e('m:policia', 'alarm', dur=1.4, gain=-15), e('m:solto', 'stamp', gain=-7), e('m:solto+0.05', 'pop', gain=-8), e('m:desco+0.05', 'glitch', dur=0.25, gain=-10), e('m:corto+0.1', 'pop', gain=-8), e('m:hacker+0.1', 'pop', gain=-8), e('m:cavo1-0.05', 'whoosh', dur=0.25, gain=-11), e('m:policia-0.05', 'whoosh', dur=0.25, gain=-11), e(0.9, 'whoosh', dur=0.25, gain=-12), e(1.2, 'pop', gain=-10), e('m:prensa-0.15', 'whoosh', dur=0.3, gain=-8), e('m:hacker', 'impact', gain=-6),
           e('m:cierre', 'whoosh', dur=0.3, gain=-9), e('m:fallo-0.1', 'subdrop', dur=1.0, gain=-6), e('m:fallo', 'impact', gain=-5),
           e('m:sigue-0.05', 'whoosh', dur=0.25, gain=-11), e('m:sigue', 'pop', gain=-9), e('m:tap', 'click', gain=-6), e('m:tap+0.05', 'coin', gain=-9)]
    for at in ['w:A1:5-0.2', 'w:A1:8-0.2', 'w:A1:14-0.2', 'p:A2-0.2', 'w:A2:5-0.2', 'p:A3-0.2', 'w:A3:3-0.2', 'w:A3:12-0.2', 'p:A4-0.2', 'w:A4:11-0.2', 'w:A4:13-0.2', 'p:A5-0.2', 'w:A5:2-0.2', 'w:A5:8-0.2', 'p:A6-0.2']:
        sfx.append(e(at, 'whoosh', dur=0.3, gain=-16))
    sfx.append(e('D-1.2', 'riser', dur=1.2, gain=1, duck=False))
    sfx.append(e('D-0.3', 'whoosh', dur=0.35, gain=-4, duck=False))
    fx = [e(0, 'hit6'), e('m:pala', 'punch10'), e('m:cobre', 'punch'), e('m:cavo1', 'punch'), e('m:cavo2', 'punch'), e('m:corto', 'hit6'), e('m:corto', 'punch10'), e('m:fibra', 'punch'), e('m:armenia2', 'punch'), e('m:policia', 'punch'), e('m:prensa', 'punch'),
          e('m:desco', 'hit6'), e('m:solto', 'punch'), e('m:hacker', 'hit6'), e('m:hacker', 'punch10'), e('m:fallo', 'hit6'), e('m:fallo', 'punch10'), e('m:tap', 'punch')]
    plan = {'id': 'Sabias01', 'title': '¿Sabías que…? #01, la abuela que apagó el internet de un país', 'fps': 30, 'width': 1080, 'height': 1920, 'voice': 'v1',
            'music': 'file', 'musicFile': 'pista_2.mp3', 'musicStart': 0, 'musicLoop': [4, 24], 'musicDb': 20.5, 'musicDuck': 0.75, 'musicFadeOut': 0.2,
            'musicPocket': True, 'voiceCredits': credit,
            'science': [
                {'claim': 'On 28 March 2011 a 75-year-old woman in Georgia, digging for scrap copper, cut a fibre-optic cable with a spade; most of Armenia (and parts of Georgia) lost internet access for hours.', 'source': 'NPR (7 Apr 2011), IEEE Spectrum, Foreign Policy (6 Apr 2011), The Moscow Times (10 Apr 2011), iTnews.'},
                {'claim': 'How long: reports range from a few hours (Armenian providers: about half their customers, for a few hours) to up to 12 hours, so the film says "durante horas" and "casi toda Armenia".', 'source': 'NPR; The Moscow Times; IEEE Spectrum.'},
                {'claim': 'She was arrested and released because of her age; local media called her the "spade hacker".', 'source': 'The World / PRI; NPR.'},
                {'claim': 'Parts of Georgia lost internet too; she was digging for copper to sell as scrap.', 'source': 'NPR ("disrupts internet in 2 nations"); iTnews ("Granny takes down web in two countries"); Foreign Policy.'},
                {'claim': 'The hand-over: Fallo #03, NASA lost the Mars Climate Orbiter (1999) because one team\'s software gave impulse in pound-force seconds and the other read newton-seconds.', 'source': 'NASA Mars Climate Orbiter Mishap Investigation Board, Phase I report (10 Nov 1999).'}],
            'chunks': chunks, 'phrases': phrases, 'say': SAY, 'lead': 0.12, 'marks': marks, 'shots': shot_list, 'fx': fx, 'sfx': sfx,
            'vacuum': 0.3, 'vacuums': ['m:corto', 'm:hacker'], 'questionAt': 'p:A3', 'outro': OUTRO if has_follow else max(OUTRO, 2.4),
            'visualLead': {'corto': 0.05, 'hacker': 0.05}, 'silences': [],
            'musicDips': [{'from': 'p:A1', 'to': 'e:A1', 'gain': 0.6}],
            'voices': {'v1': {'file': 'public/sabias01/voice.wav', 'src': src, 'tail': {}}}}
    os.makedirs('src/sabias01', exist_ok=True)
    json.dump(plan, open('src/sabias01/plan.json', 'w'), ensure_ascii=False, indent=2)
    open('src/sabias01/plan.json', 'a').write('\n')
    print('voice segments:', src)


main()
