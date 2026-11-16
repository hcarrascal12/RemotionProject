#!/usr/bin/env python3
"""Writes src/fallo04/plan.json for Fallo #04 (the Facebook, Instagram and WhatsApp outage, 4 October 2021).

  python3 tools/mkplan04.py --scratch     # no recording yet: a guide voice (one soft pulse per syllable) so the film can be
                                           # timed and previewed; it is written to public/fallo04/voice.wav
  python3 tools/mkplan04.py               # the real recording: tools/add_takes04.py wrote public/fallo04/voice.wav and
                                           # src/fallo04/takes.json (where each line sits in it)

Then:  EPISODE=fallo04 python3 tools/therac25_build.py   (timeline.json and the mix, -14 LUFS)
       EPISODE=fallo04 COMPOSITION=Fallo04 DRAFT=1 bash tools/therac25_render.sh
"""
import json, os, re, struct, sys, wave
import numpy as np

SCRATCH = '--scratch' in sys.argv
ORDER = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8']
SPOKEN = {
    'L1': 'Nadie pudo avisar que llegó bien.',
    'L2': 'Cuatro de octubre de 2021. Seis horas sin WhatsApp, Instagram ni Facebook.',
    'L3': 'Todos pensaron que era un hackeo.',
    'L4': 'Fue un comando de rutina. Y apagó los tres.',
    'L5': 'Negocios parados. Sin pedidos. Sin poder avisar.',
    'L6': 'Los ingenieros que podían arreglarlo, ni siquiera podían entrar: sus tarjetas ya no abrían la puerta.',
    'L7': 'Mándaselo a quien siempre te pregunta si ya llegaste.',
    'L8': 'Fallo cero cuatro. El siguiente te va a doler más.'}
# The order of a short built for the feed: the feeling first (nobody could say they got home), the date and the number as the
# re-hook, the twist (everyone thought hack; it was a routine command), the consequence, the most talked-about detail as the
# story's last punch (the engineers' badges stopped opening the doors), the share ask in the voice, and the series close.
# Every line is true or attributed: 4 October 2021, about six hours; not an attack; a routine maintenance command; businesses
# that sell through WhatsApp lost their orders; Facebook said getting people onsite took extra time, and the badges detail was
# reported by KrebsOnSecurity and a New York Times reporter (shown on screen as "según ...").
# on-screen words: '|' splits the 2-3 word caption blocks, '*' a yellow key word, '!' a red one. Token indexes (marks w:ID:n):
#   L1 NADIE0 PUDO1 AVISAR2 QUE3 LLEGÓ4 BIEN5
#   L2 4(0) DE1 OCTUBRE2 DE3 2021(4) SEIS5 HORAS6 SIN7 WHATSAPP8 INSTAGRAM9 NI10 FACEBOOK11
#   L3 TODOS0 PENSARON1 QUE2 ERA3 UN4 HACKEO5
#   L4 FUE0 UN1 COMANDO2 DE3 RUTINA4 Y5 APAGÓ6 LOS7 TRES8
#   L5 NEGOCIOS0 PARADOS1 SIN2 PEDIDOS3 SIN4 PODER5 AVISAR6
#   L6 LOS0 INGENIEROS1 QUE2 PODÍAN3 ARREGLARLO4 NI5 SIQUIERA6 PODÍAN7 ENTRAR8 SUS9 TARJETAS10 YA11 NO12 ABRÍAN13 LA14 PUERTA15
WORDS = {
    'L1': 'NADIE PUDO | AVISAR | QUE LLEGÓ BIEN!',
    'L2': '4 DE OCTUBRE | DE 2021* | SEIS* HORAS | SIN WHATSAPP | INSTAGRAM | NI FACEBOOK!',
    'L3': 'TODOS PENSARON | QUE ERA | UN HACKEO!',
    'L4': 'FUE UN | COMANDO* | DE RUTINA | Y APAGÓ | LOS TRES!',
    'L5': 'NEGOCIOS | PARADOS! | SIN PEDIDOS | SIN PODER | AVISAR!',
    'L6': 'LOS INGENIEROS | QUE PODÍAN | ARREGLARLO | NI SIQUIERA | PODÍAN ENTRAR! | SUS TARJETAS* | YA NO ABRÍAN | LA PUERTA!',
    'L7': 'MÁNDASELO | A QUIEN SIEMPRE | TE PREGUNTA | SI YA LLEGASTE*',
    'L8': 'FALLO #04* | EL SIGUIENTE | TE VA A | DOLER MÁS!'}
SAY = {'#04': 'cero cuatro', '4': 'cuatro', '2021': 'dos mil veintiuno', 'WHATSAPP': 'guasap', 'FACEBOOK': 'feisbuk'}
BLOCKS = [(i + 'c', [i]) for i in ORDER]
BLOCK_GAP = 0.25
GAPS = {'L2c': 0.25, 'L3c': 0.25, 'L4c': 0.3, 'L5c': 0.3, 'L6c': 0.3, 'L7c': 0.4, 'L8c': 0.35}  # no pause over 0.4 s
OUTRO = float(os.environ.get('OUTRO', '1.3'))  # music, the share ask and the loop after the last word; tune it so the film is 29-30 s


def syllables(text):
    return sum(max(1, len(re.findall(r'[aeiouáéíóúü]+', w))) for w in re.findall(r'[a-záéíóúüñ]+', text.lower()))


def scratch_voice(path):
    """A guide voice: one soft pulse per syllable, at the speed of the series takes (about 0.2 s a syllable at 1.08x, measured on the #03 hook)."""
    SR = 48000
    cur, segs, pulses = 0.2, {}, []
    for i in ORDER:
        n = syllables(SPOKEN[i])
        d = n * 0.195 + 0.15
        segs[i] = [round(cur, 3), round(cur + d, 3)]
        pulses += [(cur + s * 0.195, 0.15) for s in range(n)]
        cur += d + 0.8
    x = np.zeros(int((cur + 0.5) * SR))
    rng = np.random.default_rng(4)
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
        src = scratch_voice('public/fallo04/voice.wav')
        credit = {'service': 'voz guía (pulsos por sílaba), sin grabación todavía', 'credits': 0, 'note': 'reemplazar con la toma real'}
    else:
        src = json.load(open('src/fallo04/takes.json'))
        credit = {'service': 'ElevenLabs (voz del canal, estabilidad 50 similitud 75), limpiada con tools/voice_clean.py y atempo 1.08', 'credits': None, 'note': 'guion final del #04'}
    phrases = []
    for i in ORDER:
        d = {'id': i, 'src': src[i], 'words': WORDS[i]}
        if i in ('L7', 'L8'):
            d['captions'] = False  # the share ask and the series card carry their own words
        phrases.append(d)
    chunks, prev = [], None
    for bid, ids in BLOCKS:
        chunks.append({'id': bid, 'gap': 0 if prev is None else GAPS.get(bid, BLOCK_GAP), 'phrases': ids})
        prev = ids[-1]
    marks = {'avisar': 'w:L1:2', 'llego': 'w:L1:4', 'fecha': 'p:L2', 'seis': 'w:L2:5', 'horas': 'w:L2:6', 'vez': 'e:L2',
             'hackeo': 'w:L3:5', 'fue': 'p:L4', 'comando': 'w:L4:2', 'apago': 'w:L4:6', 'tres': 'w:L4:8',
             'negocios': 'p:L5', 'pedidos': 'w:L5:3', 'avisar5': 'w:L5:6',
             'arreglar': 'w:L6:4', 'siquiera': 'w:L6:5', 'entrar': 'w:L6:8', 'tarjetas': 'w:L6:10', 'abrian': 'w:L6:13', 'puerta': 'w:L6:15',
             'share': 'p:L7', 'llegaste': 'w:L7:8', 'serie': 'p:L8', 'siguiente': 'w:L8:3', 'doler': 'w:L8:7',
             'restored': 'p:L7', 'ctaIn': 'p:L7+0.35', 'ctaOut': 'e:L7+0.25',
             'climaxIn': 'p:L4', 'climaxOut': 'p:L7-0.1',
             'burst': 'w:L6:10', 'beamOn': 'p:L4', 'presionar': 'w:L4:2', 'cutImpact': 'p:L6-0.05'}  # the last four: the build's music grid
    # a story: every line is a scene with people in a real place, a cut every 1.5-2.5 s
    shots = [('S01', 'story', 'panic', 0, 'Frame 0: Pip at the terminal, panicking, his phone red: NO SE PUDO ENVIAR; NADIE PUDO ESCRIBIR "YA LLEGUÉ"'),
             ('S02', 'hook', 'date', 'p:L2-0.1', '4 de octubre de 2021: the calendar page, the 4 circled in red marker'),
             ('S02b', 'hook', 'fall', 'w:L2:5-0.1', 'Seis horas sin...: the clock races to 6:00, the three apps fall and go grey'),
             ('S03', 'story', 'hacker', 'p:L3-0.1', 'Todos pensaron que era un hackeo: the hooded hacker everybody imagined; the cross lands on "Fue"'),
             ('S04', 'story', 'office', 'w:L4:2-0.12', 'Un comando de rutina: the engineer in the suit presses ENTER; the one card UN COMANDO DE RUTINA'),
             ('S05', 'story', 'control', 'm:apago-0.15', 'Y apagó los tres: the three apps go dark on the control room wall'),
             ('S06', 'story', 'shop', 'p:L5-0.1', 'Negocios parados, sin pedidos: Mo in his shop, PEDIDOS POR WHATSAPP, PEDIDOS: 0'),
             ('S07', 'story', 'mom', 'w:L5:4-0.1', 'Sin poder avisar: mum in the kitchen, "¿Ya llegaste?" stuck'),
             ('S08', 'door', 'suit', 'p:L6-0.1', 'The punch: the engineers cannot even get in; ACCESO DENEGADO'),
             ('S08b', 'door', 'badge', 'w:L6:9-0.1', 'Sus tarjetas ya no abrían la puerta: close on the reader, the badge refused again; según KrebsOnSecurity y The New York Times'),
             ('S09', 'story', 'friends', 'p:L7-0.1', 'Mándaselo a quien...: Pip, Mo and his sister, phones in hand, the messages arrive at last; the share card'),
             ('S10', 'loop', 'series', 'p:L8-0.1', 'The series close: FALLO #04, EL SIGUIENTE TE VA A DOLER MÁS, SÍGUEME PARA EL #05; back into frame 0')]
    shot_list = [dict({'id': i, 'kind': k, 'at': at, 'note': note, 'lang': 'I'}, **({'variant': v} if v else {})) for i, k, v, at, note in shots]

    def e(at, kind, **k):
        return {'at': at, 'kind': kind, **k}
    sfx = [e(0, 'subdrop', dur=1.7, gain=-2), e(0, 'impact', gain=-6), e(0, 'buzzer', dur=0.5, gain=-12), e('m:llego', 'buzzer', dur=0.4, gain=-12),
           e('m:fecha', 'stamp', gain=-8), e('m:seis', 'tickramp', dur=1.0, gain=-13), e('m:horas', 'impact', gain=-6),
           e('m:horas+0.25', 'pop', gain=-10), e('m:horas+0.45', 'pop', gain=-10), e('m:vez-0.1', 'pop', gain=-9),
           e('m:hackeo', 'blip', gain=-12), e('m:fue', 'stamp', gain=-6), e('m:comando-0.1', 'click', gain=-6), e('m:apago', 'clank', gain=-6),
           e('m:apago+0.14', 'pop', gain=-10), e('m:tres', 'pop', gain=-10), e('p:L4', 'hum', dur=2.2, gain=-17),
           e('m:pedidos', 'blip', gain=-12), e('m:avisar5', 'buzzer', dur=0.3, gain=-13),
           # the climax: running steps, two badge beeps, the banging on the door, the alarm and the slam of ACCESO DENEGADO
           e('p:L6', 'clatter', gain=-12), e('m:siquiera-0.39', 'buzzer', dur=0.25, gain=-11), e('m:siquiera+0.26', 'buzzer', dur=0.25, gain=-11),
           e('m:entrar-0.6', 'rattle', gain=-9), e('m:entrar', 'slam', gain=-6), e('m:entrar', 'alarm', dur=1.2, gain=-14),
           # the close-up: a refusal on each beat, the last one a crash
           e('m:tarjetas-0.05', 'buzzer', dur=0.3, gain=-8), e('m:abrian-0.05', 'buzzer', dur=0.3, gain=-8), e('m:puerta-0.08', 'buzzer', dur=0.45, gain=-7),
           e('m:puerta-0.08', 'crack', gain=-7), e('m:puerta', 'boom', dur=1.0, gain=-8),
           # the end: the messages pour in, the share card lands, the series card slams, the tap on follow
           e('p:L7', 'coin', gain=-8)] + [e(f'p:L7+{0.1 + 0.16 * i:.2f}', 'blip', gain=-12 + (i % 2)) for i in range(8)] + [
           e('m:ctaIn', 'whoosh', dur=0.4, gain=-10), e('m:serie', 'impact', gain=-5), e('m:serie', 'subdrop', dur=1.0, gain=-8),
           e('m:doler', 'glitch', dur=0.4, gain=-10), e('m:doler', 'boom', dur=0.8, gain=-9), e('m:doler+0.45', 'click', gain=-6), e('m:doler+0.45', 'pop', gain=-8)]
    # every cut is a swipe, like changing apps
    for at in ['p:L2-0.2', 'w:L2:5-0.2', 'p:L3-0.2', 'w:L6:9-0.2', 'w:L4:1-0.2', 'm:apago-0.25', 'p:L5-0.2', 'w:L5:4-0.2', 'p:L6-0.2', 'p:L7-0.2', 'p:L8-0.2']:
        sfx.append(e(at, 'whoosh', dur=0.35, gain=-14))
    sfx.append(e('D-1.2', 'riser', dur=1.2, gain=2, duck=False))  # the loop in sound: a riser into the impact of frame 0
    sfx.append(e('D-0.3', 'whoosh', dur=0.35, gain=-3, duck=False))
    fx = [e(0, 'hit6'), e('m:horas', 'punch10'), e('m:fue', 'hit6'), e('m:fue', 'punch10'), e('m:apago', 'hit6'), e('m:apago', 'punch'),
          e('m:pedidos', 'punch'), e('m:entrar', 'hit6'), e('m:tarjetas', 'punch10'), e('m:puerta', 'hit6'), e('m:puerta', 'flash'), e('m:serie', 'hit6'), e('m:doler', 'punch10'), e('p:L7', 'punch')]
    plan = {'id': 'Fallo04', 'title': 'Fallo #04, la caída de Facebook, Instagram y WhatsApp, 2021', 'fps': 30, 'width': 1080, 'height': 1920, 'voice': 'v1',
            'music': 'file', 'musicFile': 'pista_2.mp3', 'musicStart': 0, 'musicLoop': [4, 24], 'musicDb': 17.0, 'musicDuck': 0.6, 'musicFadeOut': 0.2,
            'musicPocket': True, 'voiceCredits': credit,
            'science': [
                {'claim': 'On 4 October 2021 Facebook, Instagram, WhatsApp and Messenger were unreachable worldwide for about six hours: from about 15:40 UTC; BGP routes came back about 21:50 UTC, DNS about 22:05, service generally restored by about 22:50 UTC.', 'source': 'NetBlocks; The Register (4 Oct 2021); Wikipedia "2021 Facebook outage" (timeline, citing Cloudflare and Facebook).'},
                {'claim': 'Not an attack: Facebook said the cause was not malicious activity and that no user data was compromised.', 'source': 'Facebook statement, 4 Oct 2021; TechRadar.'},
                {'claim': 'Cause ("un solo comando de rutina"; "como si sus edificios se quedaran sin calles, e internet ya no los encontrara"): during routine maintenance, a command meant to assess the capacity of the global backbone unintentionally took down all the backbone connections between Facebook\'s data centres (the streets between the buildings); its DNS servers then withdrew their BGP advertisements, so the rest of the internet could not find Facebook, Instagram or WhatsApp (the maps search that finds nothing). The audit tool that should have stopped the command had a bug; the film leaves that detail out to stay simple.', 'source': 'Santosh Janardhan, "More details about the October 4 outage", Engineering at Meta, 5 Oct 2021 (read through search results: engineering.fb.com is not reachable from this session).'},
                {'claim': '"Tiendas sin pedidos. Familias sin noticias.": a general description of the impact (small businesses that take orders by WhatsApp, families and groups cut off), widely reported that day; no number is given.', 'source': 'General press coverage of the outage, 4-5 Oct 2021.'},
                {'claim': 'TO WORD CAREFULLY: Facebook said its internal tools went down too and that getting people onsite to the data centres took extra time because of the physical security; reports that employee badges did not work come from KrebsOnSecurity\'s sources, not from Facebook. The film only says the people who could fix it could not even get in.', 'source': 'Engineering at Meta (5 Oct 2021); KrebsOnSecurity (4 Oct 2021).'},
                {'claim': 'The film deliberately does not give a number of affected users.'}],
            'chunks': chunks, 'phrases': phrases, 'say': SAY, 'lead': 0.12, 'marks': marks, 'shots': shot_list, 'fx': fx, 'sfx': sfx,
            'vacuum': 0.3, 'vacuums': ['m:fue', 'm:tarjetas'], 'questionAt': 'p:L7', 'outro': OUTRO,
            'visualLead': {'fue': 0.05, 'apago': 0.05, 'entrar': 0.05, 'tarjetas': 0.05}, 'silences': [],
            'musicDips': [{'from': 'p:L1', 'to': 'e:L1', 'gain': 0.5}, {'from': 'p:L7', 'to': 'e:L7', 'gain': 0.5}],
            'voices': {'v1': {'file': 'public/fallo04/voice.wav', 'src': src, 'tail': {}}}}
    os.makedirs('src/fallo04', exist_ok=True)
    json.dump(plan, open('src/fallo04/plan.json', 'w'), ensure_ascii=False, indent=2)
    open('src/fallo04/plan.json', 'a').write('\n')
    print('voice segments:', {k: v for k, v in src.items()})


main()
