#!/usr/bin/env python3
"""Writes src/sin01/plan.json for "Sin resolver #01": Cicada 3301 (an anonymous puzzle posted on 4 January 2012; origin never confirmed).

  python3 tools/mkplan_sin01.py --scratch   # no recording yet: a guide voice (one soft pulse per syllable), public/sin01/voice.wav
  python3 tools/mkplan_sin01.py             # the real recording: src/sin01/takes.json (where each line sits in voice.wav)

Then:  EPISODE=sin01 python3 tools/therac25_build.py
       EPISODE=sin01 COMPOSITION=Sin01 DRAFT=1 bash tools/therac25_render.sh
"""
import json, os, re, struct, sys, wave
import numpy as np

SCRATCH = '--scratch' in sys.argv
ORDER = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6']
# The series' rule: the first line is the human consequence ("miles de personas…"), the facts come after, the last line opens the
# question and asks for the viewer's theory (mysteries invite comments).
SPOKEN = {
    'Z1': 'Miles de personas pasaron años resolviendo un acertijo sin saber quién lo escribió.',
    'Z2': 'Todo empezó el cuatro de enero de dos mil doce, con una imagen anónima en un foro.',
    'Z3': 'Decía: buscamos personas muy inteligentes. Y la firmaba un número: tres mil trescientos uno.',
    'Z4': 'Dentro de la imagen había un mensaje oculto. Llevaba a un libro, a coordenadas y a carteles con códigos QR en varias ciudades.',
    'Z5': 'Hubo tres rondas: dos mil doce, trece y catorce. Nadie ha confirmado quién estaba detrás.',
    'Z6': '¿Una agencia de espionaje? ¿Un experimento? Dime tu teoría. Es Sin resolver, número cero uno.'}
# token indexes (marks w:ID:n), counting the words in WORDS:
#   Z1 MILES0 DE1 PERSONAS2 PASARON3 AÑOS4 RESOLVIENDO5 UN6 ACERTIJO7 SIN8 SABER9 QUIÉN10 LO11 ESCRIBIÓ12
#   Z2 TODO0 EMPEZÓ1 EL2 4(3) DE4 ENERO5 DE6 2012(7) CON8 UNA9 IMAGEN10 ANÓNIMA11 EN12 UN13 FORO14
#   Z3 DECÍA0 BUSCAMOS1 PERSONAS2 MUY3 INTELIGENTES4 Y5 LA6 FIRMABA7 UN8 NÚMERO9 3301(10)
#   Z4 DENTRO0 DE1 LA2 IMAGEN3 HABÍA4 UN5 MENSAJE6 OCULTO7 LLEVABA8 A9 UN10 LIBRO11 A12 COORDENADAS13 Y14 A15 CARTELES16 CON17 CÓDIGOS18 QR19 EN20 VARIAS21 CIUDADES22
#   Z5 HUBO0 TRES1 RONDAS2 2012(3) 13(4) Y5 14(6) NADIE7 HA8 CONFIRMADO9 QUIÉN10 ESTABA11 DETRÁS12
#   Z6 ¿UNA0 AGENCIA1 DE2 ESPIONAJE?3 ¿UN4 EXPERIMENTO?5 DIME6 TU7 TEORÍA8 ES9 SIN10 RESOLVER11 NÚMERO12 CERO13 UNO14
WORDS = {  # the series' kinetic captions: 2-3 word hits; 'WORD~' is timed with the voice but not shown
    'Z1': 'MILES* DE PERSONAS | PASARON AÑOS | RESOLVIENDO | UN ACERTIJO* | SIN SABER QUIÉN | LO ESCRIBIÓ!',
    'Z2': 'TODO EMPEZÓ | EL 4 DE ENERO* | DE 2012* | CON UNA IMAGEN | ANÓNIMA! | EN UN FORO',
    'Z3': 'DECÍA: BUSCAMOS | PERSONAS MUY | INTELIGENTES* | Y LA FIRMABA | UN NÚMERO | 3301!',
    'Z4': 'DENTRO DE LA IMAGEN | HABÍA UN MENSAJE | OCULTO* | LLEVABA A UN LIBRO | A COORDENADAS | Y A CARTELES | CON CÓDIGOS QR* | EN VARIAS CIUDADES',
    'Z5': 'HUBO TRES* RONDAS | 2012 | 13 Y 14 | NADIE HA CONFIRMADO | QUIÉN ESTABA | DETRÁS!',
    'Z6': '¿UNA AGENCIA | DE ESPIONAJE?* | ¿UN EXPERIMENTO?* | DIME TU TEORÍA! | ES~ SIN~ RESOLVER~ NÚMERO~ CERO~ UNO~'}  # the series card carries the last words
SAY = {'4': 'cuatro', '2012': 'dos mil doce', '3301': 'tres mil trescientos uno', '13': 'trece', '14': 'catorce', 'QR': 'cu erre'}
BLOCKS = [(i + 'c', [i]) for i in ORDER]
GAPS = {'Z2c': 0.3, 'Z3c': 0.3, 'Z4c': 0.35, 'Z5c': 0.35, 'Z6c': 0.4}
OUTRO = float(os.environ.get('OUTRO', '1.9'))


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
        src = scratch_voice('public/sin01/voice.wav')
        credit = {'service': 'voz guía (pulsos por sílaba), sin grabación todavía', 'credits': 0, 'note': 'reemplazar con la toma real'}
    else:
        src = json.load(open('src/sin01/takes.json'))
        credit = {'service': 'voz real del canal', 'credits': None, 'note': 'guion final'}
    phrases = [{'id': i, 'src': src[i], 'words': WORDS[i]} for i in ORDER]
    chunks, prev = [], None
    for bid, ids in BLOCKS:
        chunks.append({'id': bid, 'gap': 0 if prev is None else GAPS.get(bid, 0.3), 'phrases': ids})
        prev = ids[-1]
    marks = {'fecha': 'w:Z2:5', 'anio': 'w:Z2:7', 'foro': 'w:Z2:14', 'firma': 'w:Z3:10',
             'oculto': 'w:Z4:7', 'libro': 'w:Z4:11', 'coord': 'w:Z4:13', 'qr': 'w:Z4:19', 'ciudades': 'w:Z4:22',
             'r12': 'w:Z5:3', 'r13': 'w:Z5:4', 'r14': 'w:Z5:6', 'nadie': 'w:Z5:7', 'detras': 'w:Z5:12',
             'espia': 'w:Z6:3', 'exper': 'w:Z6:5', 'teoria': 'w:Z6:8', 'serie': 'w:Z6:12',
             # the build's music grid (required by the build, whatever the music style)
             'beamOn': 'p:Z2', 'presionar': 'w:Z4:7', 'cutImpact': 'p:Z5-0.05', 'burst': 'w:Z3:10'}
    shots = [('S1', 'z1', None, 0, 'I', '3301 glitch sobre lluvia hexadecimal: EL ACERTIJO QUE NADIE PUDO CERRAR'),
             ('S2', 'z1', 'b', 'w:Z1:8-0.1', 'N', 'el ? gigante: ¿QUIÉN LO ESCRIBIÓ?'),
             ('S3', 'z2', 'a', 'p:Z2-0.1', 'I', 'la imagen anónima en el foro (Anonymous 01/04/12)'),
             ('S4', 'z2', 'b', 'w:Z2:5-0.2', 'N', 'sellos: 4 · ENE, 2012, ANÓNIMO'),
             ('S5', 'z3', 'a', 'p:Z3-0.1', 'I', 'el mensaje tecleado en la terminal'),
             ('S6', 'z3', 'b', 'w:Z3:9-0.1', 'N', 'FIRMADO: 3301 a pantalla completa'),
             ('S7', 'z4', 'a', 'p:Z4-0.1', 'I', 'un escáner revela el mensaje oculto en la imagen'),
             ('S8', 'z4', 'b', 'm:libro-0.35', 'N', 'tres pistas: libro, coordenadas, QR; pines en varias ciudades'),
             ('S9', 'z5', 'a', 'p:Z5-0.1', 'I', 'línea de tiempo 2012, 2013, 2014'),
             ('S10', 'z5', 'b', 'm:nadie-0.1', 'N', 'la raya de puntos con ? y el sello SIN CONFIRMAR'),
             ('S11', 'z6', 'a', 'p:Z6-0.1', 'I', '¿AGENCIA? ¿EXPERIMENTO? ¿TU TEORÍA?'),
             ('S12', 'z6', 'b', 'w:Z6:9-0.1', 'N', 'DIME TU TEORÍA + tarjeta SIN RESOLVER #01')]
    shot_list = [dict({'id': i, 'kind': k, 'at': at, 'note': note, 'lang': lang}, **({'variant': v} if v else {})) for i, k, v, at, lang, note in shots]

    def e(at, kind, **k):
        return {'at': at, 'kind': kind, **k}
    sfx = [e(0, 'subdrop', dur=1.4, gain=-5), e(0, 'pop', gain=-8), e(0.7, 'blip', gain=-10), e(1.4, 'blip', gain=-10),
           e('m:fecha', 'stamp', gain=-8), e('m:anio', 'impact', gain=-8), e('m:foro', 'pop', gain=-10),
           e('m:firma-0.1', 'subdrop', dur=1.0, gain=-6), e('m:firma', 'impact', gain=-5),
           e('m:oculto', 'tickramp', dur=1.4, gain=-12), e('m:libro', 'pop', gain=-9), e('m:coord', 'pop', gain=-9), e('m:qr', 'pop', gain=-9), e('m:ciudades', 'tickramp', dur=1.0, gain=-13),
           e('m:r12', 'stamp', gain=-9), e('m:r13', 'stamp', gain=-9), e('m:r14', 'stamp', gain=-9), e('m:nadie', 'buzzer', dur=0.35, gain=-10), e('m:detras', 'impact', gain=-6),
           e('m:espia', 'pop', gain=-9), e('m:exper', 'pop', gain=-9), e('m:teoria', 'blip', gain=-9), e('m:serie-0.1', 'subdrop', dur=1.0, gain=-6), e('m:serie', 'impact', gain=-5)]
    for at in ['p:Z2-0.2', 'p:Z3-0.2', 'p:Z4-0.2', 'p:Z5-0.2', 'p:Z6-0.2']:
        sfx.append(e(at, 'whoosh', dur=0.35, gain=-14))
    sfx.append(e('D-1.2', 'riser', dur=1.2, gain=1, duck=False))
    sfx.append(e('D-0.3', 'whoosh', dur=0.35, gain=-4, duck=False))
    fx = [e(0, 'hit6'), e('m:firma', 'punch10'), e('m:detras', 'punch'), e('m:serie', 'hit6'), e('m:serie', 'punch10')]
    plan = {'id': 'Sin01', 'title': 'Sin resolver #01: Cicada 3301', 'fps': 30, 'width': 1080, 'height': 1920, 'voice': 'v1',
            'music': 'ambient', 'musicFadeOut': 0.6, 'voiceCredits': credit,
            'science': [
                {'claim': 'On 4 January 2012 an anonymous image appeared on 4chan: "Hello. We are looking for highly intelligent individuals. To find them, we have devised a test." Signed 3301.', 'source': 'Wikipedia "Cicada 3301"; The Why Files, "Solving Cicada 3301" (2023). POR VERIFICAR antes de publicar.'},
                {'claim': 'The image hid a message (steganography) that led to a book cipher, geographic coordinates and posters with QR codes in several cities.', 'source': 'Wikipedia "Cicada 3301"; Rolling Stone, "Cicada: Solving the Web\'s Deepest Mystery" (2014). POR VERIFICAR.'},
                {'claim': 'Three rounds of puzzles: January 2012, January 2013 and January 2014; nobody has confirmed who was behind them or why.', 'source': 'Wikipedia "Cicada 3301". POR VERIFICAR: estado actual (algunos puzzles posteriores se consideran falsos).'}],
            'chunks': chunks, 'phrases': phrases, 'say': SAY, 'lead': 0.12, 'marks': marks, 'shots': shot_list, 'fx': fx, 'sfx': sfx,
            'vacuum': 0.3, 'vacuums': ['m:firma', 'm:detras'], 'questionAt': 'p:Z6', 'outro': OUTRO,
            'visualLead': {}, 'silences': [], 'musicDips': [{'from': 'p:Z1', 'to': 'e:Z1', 'gain': 0.5}],
            'voices': {'v1': {'file': 'public/sin01/voice.wav', 'src': src, 'tail': {}}}}
    os.makedirs('src/sin01', exist_ok=True)
    json.dump(plan, open('src/sin01/plan.json', 'w'), ensure_ascii=False, indent=2)
    open('src/sin01/plan.json', 'a').write('\n')
    print('voice segments:', src)


main()
