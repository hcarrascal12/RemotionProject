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
# VARIANT=redes: the Instagram/TikTok cut. The voice opens on the fact ("Una abuela de 75 años…"), not on the spoken "¿Sabías que" (the card
# on screen keeps it), and the close is tighter. Facebook's published cut stays as it is. Output: src/sabias01r/plan.json (EPISODE=sabias01r).
REDES = os.environ.get('VARIANT') == 'redes'
SKIP = 2 if REDES else 0  # caption/mark tokens dropped from the start of A1
OUT_DIR = 'src/sabias01r' if REDES else 'src/sabias01'
A1_START = 0.55  # the valley between "que" and "una" (-44 dB at 0.555 s)


def W1(n):
    return f'w:A1:{n - SKIP}'
ORDER = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']
SPOKEN = {
    'A1': '¿Sabías que una abuela de setenta y cinco años dejó sin internet a casi toda Armenia, con una pala?',
    'A2': 'Era el veintiocho de marzo de dos mil once, en Georgia. Ella buscaba cobre para vender como chatarra.',
    'A3': 'Cavó y cavó, y en vez de cobre, cortó un cable de fibra óptica.',
    'A4': 'Ese cable llevaba internet a Armenia. El país se quedó desconectado durante horas, y parte de Georgia también.',
    'A5': 'La policía la detuvo, y la soltó por su edad. La prensa la llamó, la hacker de la pala.',
    'A6': '¿Cuánto tiempo aguantarías sin internet?',  # OPTIONAL: the closing question; without a take it is on screen only
    'A7': 'Síguenos para más fallos y curiosidades.'}  # OPTIONAL: the follow line; without a take the button carries the ask alone
# token indexes (marks w:ID:n):
#   A1 SABÍAS0 QUE1 UNA2 ABUELA3 DE4 75(5) AÑOS6 DEJÓ7 SIN8 INTERNET9 A10 CASI11 TODA12 ARMENIA13 CON14 UNA15 PALA16
#   A2 ERA0 EL1 28(2) DE3 MARZO4 DE5 2011(6) EN7 GEORGIA8 ELLA9 BUSCABA10 COBRE11 PARA12 VENDER13 COMO14 CHATARRA15
#   A3 CAVÓ0 Y1 CAVÓ2 Y3 EN4 VEZ5 DE6 COBRE7 CORTÓ8 UN9 CABLE10 DE11 FIBRA12 ÓPTICA13
#   A4 ESE0 CABLE1 LLEVABA2 INTERNET3 A4 ARMENIA5 EL6 PAÍS7 SE8 QUEDÓ9 DESCONECTADO10 DURANTE11 HORAS12 Y13 PARTE14 DE15 GEORGIA16 TAMBIÉN17
#   A5 LA0 POLICÍA1 LA2 DETUVO3 Y4 LA5 SOLTÓ6 POR7 SU8 EDAD9 LA10 PRENSA11 LA12 LLAMÓ13 LA14 HACKER15 DE16 LA17 PALA18
#   A6 CUÁNTO0 TIEMPO1 AGUANTARÍAS2 SIN3 INTERNET4
#   A7 SÍGUENOS0 PARA1 MÁS2 FALLOS3 Y4 CURIOSIDADES5
WORDS = {  # 'WORD~' is timed with the voice but not shown
    # 'WORD^' marks a real pause in the take after that word (anchors the words to the speech stretches between pauses)
    'A1': 'UNA ABUELA | DE 75* AÑOS | DEJÓ SIN INTERNET! | A CASI TODA ARMENIA* | CON UNA PALA!' if REDES else '¿SABÍAS QUE UNA ABUELA | DE 75* AÑOS | DEJÓ SIN INTERNET! | A CASI TODA ARMENIA* | CON UNA PALA!',  # captions from the first word
    # EN@1.45: "once" ends at 7.62 s (the valley at 7.5 s is the /s/ of "on-ce", its final vowel follows), so "en" starts 1.45 s into the phrase
    'A2': 'ERA EL 28* DE MARZO | DE 2011* | EN GEORGIA | ELLA BUSCABA | COBRE* PARA VENDER | COMO CHATARRA',
    'A3': 'CAVÓ Y CAVÓ | Y EN VEZ DE COBRE | CORTÓ UN CABLE! | DE FIBRA ÓPTICA*',
    'A4': 'ESE CABLE LLEVABA | INTERNET A ARMENIA* | EL PAÍS SE QUEDÓ | DESCONECTADO! | DURANTE HORAS | Y PARTE DE GEORGIA | TAMBIÉN',
    'A5': 'LA POLICÍA LA DETUVO! | Y LA SOLTÓ | POR SU EDAD* | LA PRENSA LA LLAMÓ | LA HACKER DE LA PALA!',
    'A6': 'CUÁNTO~ TIEMPO~ AGUANTARÍAS~ SIN~ INTERNET~',  # the question card carries it (big, on screen)
    'A7': 'SÍGUENOS~ PARA~ MÁS~ FALLOS~ Y~ CURIOSIDADES~'}  # the follow button carries it
SAY = {'75': 'setenta y cinco', '28': 'veintiocho', '2011': 'dos mil once', '3': 'tres'}
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


def _norm(s):
    import unicodedata
    s = unicodedata.normalize('NFD', s.lower())
    return re.sub(r'[^a-z0-9]', '', ''.join(c for c in s if unicodedata.category(c) != 'Mn'))


def whisper_word_times(order, src):
    """Per phrase, the start and end (seconds in the take) of every caption token, from Whisper's word timestamps of the take
    (src/sabias01/whisper_words.json: the transcription is the truth about what is said and when). Each token of WORDS has to
    be one spoken word, in order; a mismatch stops the plan so the captions can never drift from the voice."""
    path = 'src/sabias01/whisper_words.json'
    if SCRATCH or not os.path.exists(path):
        return {}
    ww = json.load(open(path))
    out = {}
    for pid in order:
        if pid not in WORDS or pid not in src:
            continue
        toks = [t.rstrip('^~*!') for g in WORDS[pid].split('|') for t in g.split()]
        a, b = src[pid]
        lead = 0.0 if (REDES and pid == 'A1') else 0.15
        mine = [w for w in ww if a - lead <= (w['s'] + w['e']) / 2 <= b + 0.15]
        if len(toks) != len(mine):
            raise SystemExit(f'{pid}: {len(toks)} caption words but Whisper heard {len(mine)}: ' + ' '.join(w['w'] for w in mine))
        for t, w in zip(toks, mine):
            if _norm(t) != _norm(w['w']) and _norm(t)[:3] != _norm(w['w'])[:3]:
                print(f"  note {pid}: caption '{t}' sits on Whisper's '{w['w']}' at {w['s']:.2f} s")
        out[pid] = [[w['s'], w['e']] for w in mine]
    return out


def main():
    if SCRATCH:
        src = scratch_voice('public/sabias01/voice.wav')
        credit = {'service': 'voz guía (pulsos por sílaba), sin grabación todavía', 'credits': 0, 'note': 'reemplazar con la toma real'}
    else:
        src = json.load(open('src/sabias01/takes.json'))
        if REDES:
            src['A1'][0] = A1_START
        credit = {'service': 'ElevenLabs (voz del canal), limpiada con tools/voice_clean.py y atempo 1.08', 'credits': None, 'note': 'guion final'}
    # a take without the follow line (A7): the follow ask then lives on screen only, right after the hand-over
    order = [i for i in ORDER if i in src]
    has_q = 'A6' in order
    has_follow = 'A7' in order
    word_times = whisper_word_times(order, src)
    phrases = []
    for i in order:
        d = {'id': i, 'src': src[i], 'words': WORDS[i]}
        phrases.append(d)
    chunks, prev = [], None
    for bid, ids in [b for b in BLOCKS if b[1][0] in order]:
        chunks.append({'id': bid, 'gap': 0 if prev is None else GAPS.get(bid, 0.3), 'phrases': ids})
        prev = ids[-1]
    marks = {'armenia': W1(13), 'pala': W1(16),
             'fecha': 'w:A2:2', 'georgia1': 'w:A2:8', 'cobre': 'w:A2:11', 'chatarra': 'w:A2:15',
             'cavo1': 'p:A3', 'cavo2': 'w:A3:2', 'corto': 'w:A3:8', 'fibra': 'w:A3:12',
             'llevaba': 'w:A4:2', 'armenia2': 'w:A4:5', 'desco': 'w:A4:10', 'horas': 'w:A4:12', 'georgia2': 'w:A4:16',
             'policia': 'w:A5:1', 'detuvo': 'w:A5:3', 'solto': 'w:A5:6', 'edad': 'w:A5:9', 'prensa': 'w:A5:11', 'hacker': 'w:A5:15',
             # the close: the nickname, then ONE question that invites a comment (voiced if A6 was recorded, on screen only if not)
             'cierre': 'p:A6' if has_q else 'e:A5+0.15', 'q2': 'w:A6:2' if has_q else 'e:A5+0.45', 'q3': 'w:A6:3' if has_q else 'e:A5+0.8',
             # then, one step later, the follow ask: its own line if recorded, else the button alone
             'sigue': 'p:A7' if has_follow else ('e:A6+0.4' if has_q else 'e:A5+1.9'), 'tap': 'w:A7:5' if has_follow else ('e:A6+1.5' if has_q else 'e:A5+3.1'),
             'beamOn': 'p:A2', 'presionar': 'w:A3:8', 'cutImpact': 'p:A5-0.05', 'burst': 'w:A4:10'}  # the last four: the build's music grid
    # the What If direction: a new size or angle on every cut, cut on the word
    shots = [('S1', 'title', None, 0, 'Título sobre el gran plano al atardecer: la abuela a contraluz, la pala clavada, chispas bajo tierra'),
             ('S2', 'face', None, (W1(6) + '-0.05') if REDES else (W1(5) + '-0.1'), 'Primer plano: su cara contra el sol bajo, bokeh; 75 AÑOS'),
             ('S3', 'city', None, W1(8) + '-0.1', 'Picado sobre Armenia al atardecer: las pantallas de los celulares pasan de azul a gris'),
             ('S4', 'strike', None, W1(14) + '-0.1', 'Contrapicado: levanta la pala contra el sol'),
             ('S5', 'blade', None, W1(16) + '-0.08', 'Macro: la hoja muerde la tierra, saltan terrones'),
             ('S6', 'walk', None, 'p:A2-0.1', 'Gran plano: camina por el campo con la pala al hombro, sombra larga; 28·03·2011 · GEORGIA'),
             ('S7', 'copper', None, 'w:A2:10-0.1', 'Cenital macro: cobre brillando en la tierra, su mano entra por la derecha'),
             ('S8', 'dig', None, 'p:A3-0.1', 'Plano medio: cava, dos paladas, terrones al aire'),
             ('S9', 'cut', None, 'w:A3:3-0.1', 'Cenital al hoyo: el cable naranja con luz; la hoja baja y lo corta: destello, chispas'),
             ('S10', 'fiber', None, 'w:A3:12-0.1', 'Plano detalle: las fibras de vidrio abiertas, su luz se apaga; FIBRA ÓPTICA'),
             ('S11', 'schem', None, 'p:A4-0.1', 'Esquema: la línea de Georgia a Armenia, la luz baja por ella y se rompe: SIN CONEXIÓN'),
             ('S12', 'ots', None, 'w:A4:11-0.1', 'Por encima del hombro de Mo: Pip en la azotea, el celular sin conexión; DURANTE HORAS'),
             ('S13', 'mo', None, 'w:A4:13-0.1', 'Primer plano de Mo iluminado por su celular muerto; Y PARTE DE GEORGIA'),
             ('S14', 'police', None, 'p:A5-0.1', 'Contrapicado: llega la patrulla, luces rojas y azules barren el campo'),
             ('S15', 'face', 'free', 'w:A5:4-0.1', 'Primer plano: sonríe y saluda; LIBERADA'),
             ('S16', 'paper', None, 'w:A5:10-0.1', 'Cenital: el periódico entra y se asienta: LA HACKER DE LA PALA'),
             ('S17', 'door', None, 'p:A6-0.1' if has_q else 'e:A5+0.1', 'CIERRE: ¿CUÁNTO TIEMPO AGUANTARÍAS SIN INTERNET? en grande sobre la ciudad; las ventanas pasan del azul del celular al gris; luego la pregunta se atenúa y aparece UN botón grande + SEGUIR que una mano pulsa (SIGUIENDO)')]
    shot_list = [dict({'id': i, 'kind': k, 'at': at, 'note': note, 'lang': 'I'}, **({'variant': v} if v else {})) for i, k, v, at, note in shots]

    def e(at, kind, **k):
        return {'at': at, 'kind': kind, **k}
    sfx = [e(0, 'subdrop', dur=1.4, gain=-4), e(0, 'crack', gain=-7), e(0.05, 'glitch', dur=0.3, gain=-11),
           e('m:pala', 'clank', gain=-6), e('m:pala+0.1', 'crack', gain=-9),
           e('m:fecha', 'stamp', gain=-9), e('m:cobre', 'coin', gain=-8), e('m:chatarra', 'pop', gain=-10),
           e('m:cavo1', 'clank', gain=-8), e('m:cavo2', 'clank', gain=-7), e('m:corto-0.15', 'whoosh', dur=0.2, gain=-9), e('m:corto', 'clank', gain=-5), e('m:corto', 'crack', gain=-6), e('m:fibra', 'buzzer', dur=0.3, gain=-11),
           e('m:llevaba', 'tickramp', dur=1.0, gain=-14), e('m:desco', 'buzzer', dur=0.35, gain=-9), e('m:horas', 'impact', gain=-7), e('m:georgia2', 'pop', gain=-9),
           e('m:policia', 'alarm', dur=1.4, gain=-15), e('m:solto', 'stamp', gain=-7), e('m:solto+0.05', 'pop', gain=-8), e('m:desco+0.05', 'glitch', dur=0.25, gain=-10), e('m:corto+0.1', 'pop', gain=-8), e('m:hacker+0.1', 'pop', gain=-8), e('m:cavo1-0.05', 'whoosh', dur=0.25, gain=-11), e('m:policia-0.05', 'whoosh', dur=0.25, gain=-11), e(0.9, 'whoosh', dur=0.25, gain=-12), e(1.2, 'pop', gain=-10), e('m:prensa-0.15', 'whoosh', dur=0.3, gain=-8), e('m:hacker', 'impact', gain=-6),
           e('m:cierre', 'whoosh', dur=0.3, gain=-9), e('m:cierre+0.05', 'subdrop', dur=1.0, gain=-8), e('m:q2', 'pop', gain=-9), e('m:q3', 'pop', gain=-9), e('m:q3+0.1', 'impact', gain=-7), e('m:cierre+0.5', 'glitch', dur=0.3, gain=-11), e('m:sigue-0.05', 'whoosh', dur=0.25, gain=-11), e('m:sigue', 'pop', gain=-9), e('m:tap', 'click', gain=-6), e('m:tap+0.05', 'coin', gain=-9)]

    for at in [(W1(6) + '-0.15') if REDES else (W1(5) + '-0.2'), W1(8) + '-0.2', W1(14) + '-0.2', 'p:A2-0.2', 'w:A2:10-0.2', 'p:A3-0.2', 'w:A3:3-0.2', 'w:A3:12-0.2', 'p:A4-0.2', 'w:A4:11-0.2', 'w:A4:13-0.2', 'p:A5-0.2', 'w:A5:4-0.2', 'w:A5:10-0.2', 'p:A6-0.2' if has_q else 'e:A5-0.1']:
        sfx.append(e(at, 'whoosh', dur=0.3, gain=-16))
    sfx.append(e('D-1.2', 'riser', dur=1.2, gain=1, duck=False))
    sfx.append(e('D-0.3', 'whoosh', dur=0.35, gain=-4, duck=False))
    fx = [e(0, 'hit6'), e('m:pala', 'punch10'), e('m:cobre', 'punch'), e('m:cavo1', 'punch'), e('m:cavo2', 'punch'), e('m:corto', 'hit6'), e('m:corto', 'punch10'), e('m:fibra', 'punch'), e('m:armenia2', 'punch'), e('m:policia', 'punch'), e('m:prensa', 'punch'), e('m:q3', 'punch10'),
          e('m:desco', 'hit6'), e('m:solto', 'punch'), e('m:hacker', 'hit6'), e('m:hacker', 'punch10'), e('m:q3', 'hit6')]
    plan = {'id': 'Sabias01R' if REDES else 'Sabias01', 'title': '¿Sabías que…? #01, la abuela que apagó el internet de un país' + (' (Instagram y TikTok)' if REDES else ''), 'fps': 30, 'width': 1080, 'height': 1920, 'voice': 'v1',
            'music': 'file', 'musicFile': 'pista_2.mp3', 'musicStart': 0, 'musicLoop': [4, 24], 'musicDb': 20.5, 'musicDuck': 0.75, 'musicFadeOut': 0.2,
            'musicPocket': True, 'speechWarp': True, 'captionLag': 0.06, 'wordTimes': word_times, 'voiceCredits': credit,
            'science': [
                {'claim': 'On 28 March 2011 a 75-year-old woman in Georgia, digging for scrap copper, cut a fibre-optic cable with a spade; most of Armenia (and parts of Georgia) lost internet access for hours.', 'source': 'NPR (7 Apr 2011), IEEE Spectrum, Foreign Policy (6 Apr 2011), The Moscow Times (10 Apr 2011), iTnews.'},
                {'claim': 'How long: reports range from a few hours (Armenian providers: about half their customers, for a few hours) to up to 12 hours, so the film says "durante horas" and "casi toda Armenia".', 'source': 'NPR; The Moscow Times; IEEE Spectrum.'},
                {'claim': 'She was arrested and released because of her age; local media called her the "spade hacker".', 'source': 'The World / PRI; NPR.'},
                {'claim': 'Parts of Georgia lost internet too; she was digging for copper to sell as scrap.', 'source': 'NPR ("disrupts internet in 2 nations"); iTnews ("Granny takes down web in two countries"); Foreign Policy.'},
                {'claim': 'No bridge to another Fallo any more: the film ends on the nickname and one open question for the comments ("¿Cuánto tiempo aguantarías sin internet?"), which asserts nothing.', 'source': 'Editorial decision, 17 Nov 2026.'}],
            'chunks': chunks, 'phrases': phrases, 'say': SAY, 'lead': 0.12, 'marks': marks, 'shots': shot_list, 'fx': fx, 'sfx': sfx,
            'vacuum': 0.3, 'vacuums': ['m:corto', 'm:hacker'], 'questionAt': 'p:A3', 'outro': (0.9 if REDES else 1.5) if has_follow else (2.8 if has_q else 4.6),
            'visualLead': {'corto': 0.05, 'hacker': 0.05}, 'silences': [],
            'musicDips': [{'from': 'p:A1', 'to': 'e:A1', 'gain': 0.6}],
            'voices': {'v1': {'file': 'public/sabias01/voice.wav', 'src': src, 'tail': {}}}}
    os.makedirs(OUT_DIR, exist_ok=True)
    json.dump(plan, open(f'{OUT_DIR}/plan.json', 'w'), ensure_ascii=False, indent=2)
    open(f'{OUT_DIR}/plan.json', 'a').write('\n')
    print('voice segments:', src)


main()
