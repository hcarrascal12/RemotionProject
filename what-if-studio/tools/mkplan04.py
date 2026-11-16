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
ORDER = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7']
SPOKEN = {
    'L1': 'Seis horas sin WhatsApp, Instagram ni Facebook, y nadie pudo avisar que llegó bien.',
    'L2': 'Tiendas sin pedidos. Familias sin noticias. Todo, en silencio.',
    'L3': 'Y no fue un hackeo, ni tu internet.',
    'L4': 'Un solo comando de rutina apagó los tres a la vez.',
    'L5': 'Como si sus edificios se quedaran sin calles, e internet ya no los encontrara.',
    'L6': 'Y los que podían arreglarlo, ni siquiera podían entrar.',
    'L7': '¿Qué fue lo primero que intentaste abrir?'}
# The script is written for everyone, not for engineers: the consequences first (the shop, the family), the cause as one
# everyday picture (one command; buildings left without streets; a map that cannot find them). Every line is still true:
# a maintenance command cut the backbone links between Facebook's data centres, and its DNS servers withdrew their routes.
# on-screen words: '|' splits the 2-3 word caption blocks, '*' a yellow key word, '!' a red one. Token indexes (marks w:ID:n):
#   L1 SEIS0 HORAS1 SIN2 WHATSAPP3 INSTAGRAM4 NI5 FACEBOOK6 Y7 NADIE8 PUDO9 AVISAR10 QUE11 LLEGÓ12 BIEN13
#   L2 TIENDAS0 SIN1 PEDIDOS2 FAMILIAS3 SIN4 NOTICIAS5 TODO6 EN7 SILENCIO8
#   L3 Y0 NO1 FUE2 UN3 HACKEO4 NI5 TU6 INTERNET7
#   L4 UN0 SOLO1 COMANDO2 DE3 RUTINA4 APAGÓ5 LOS6 TRES7 A8 LA9 VEZ10
#   L5 COMO0 SI1 SUS2 EDIFICIOS3 SE4 QUEDARAN5 SIN6 CALLES7 E8 INTERNET9 YA10 NO11 LOS12 ENCONTRARA13
#   L6 Y0 LOS1 QUE2 PODÍAN3 ARREGLARLO4 NI5 SIQUIERA6 PODÍAN7 ENTRAR8
#   L7 ¿QUÉ0 FUE1 LO2 PRIMERO3 QUE4 INTENTASTE5 ABRIR?6
WORDS = {
    'L1': 'SEIS* HORAS | SIN WHATSAPP | INSTAGRAM | NI FACEBOOK | Y NADIE | PUDO AVISAR | QUE LLEGÓ BIEN!',
    'L2': 'TIENDAS | SIN PEDIDOS! | FAMILIAS | SIN NOTICIAS! | TODO | EN SILENCIO*',
    'L3': 'Y NO FUE | UN HACKEO! | NI TU | INTERNET*',
    'L4': 'UN SOLO | COMANDO* | DE RUTINA | APAGÓ LOS TRES! | A LA VEZ',
    'L5': 'COMO SI | SUS EDIFICIOS | SE QUEDARAN | SIN CALLES! | E INTERNET | YA NO | LOS ENCONTRARA!',
    'L6': 'Y LOS QUE | PODÍAN ARREGLARLO | NI SIQUIERA | PODÍAN ENTRAR!',
    'L7': '¿QUÉ FUE | LO PRIMERO | QUE INTENTASTE | ABRIR?*'}
SAY = {'WHATSAPP': 'guasap', 'INSTAGRAM': 'instagram', 'FACEBOOK': 'feisbuk'}
BLOCKS = [(i + 'c', [i]) for i in ORDER]
BLOCK_GAP = 0.25
GAPS = {'L2c': 0.25, 'L3c': 0.3, 'L4c': 0.22, 'L5c': 0.25, 'L6c': 0.25, 'L7c': 0.35}
OUTRO = float(os.environ.get('OUTRO', '1.9'))  # music, the share ask and the loop after the last word; tune it so the film is 29-30 s


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
        if i == 'L7':
            d['captions'] = False  # the question is on the card
        phrases.append(d)
    chunks, prev = [], None
    for bid, ids in BLOCKS:
        chunks.append({'id': bid, 'gap': 0 if prev is None else GAPS.get(bid, BLOCK_GAP), 'phrases': ids})
        prev = ids[-1]
    marks = {'horas': 'w:L1:1', 'apps': 'w:L1:3', 'nadie': 'w:L1:8', 'llego': 'w:L1:12', 'l1end': 'e:L1',
             'tiendas': 'p:L2', 'familias': 'w:L2:3', 'todo': 'w:L2:6', 'silencio': 'w:L2:8',
             'hackeo': 'w:L3:4', 'tuinternet': 'w:L3:5', 'internet': 'w:L3:7',
             'comando': 'w:L4:2', 'apago': 'w:L4:5', 'tres': 'w:L4:7', 'l4end': 'e:L4',
             'edificios': 'w:L5:3', 'calles': 'w:L5:7', 'einternet': 'w:L5:8', 'encontrara': 'w:L5:13',
             'arreglar': 'w:L6:4', 'siquiera': 'w:L6:5', 'entrar': 'w:L6:8',
             'pregunta': 'p:L7', 'abrir': 'w:L7:6', 'cta': 'e:L7', 'restored': 'w:L7:6+0.25',
             'followIn': 'e:L6+0.25', 'followOut': 'p:L7-0.15', 'ctaIn': 'e:L7+0.1', 'ctaOut': 'D-0.4',
             'climaxIn': 'p:L4', 'climaxOut': 'p:L7-0.1',
             'burst': 'w:L5:7', 'beamOn': 'p:L4', 'presionar': 'w:L4:5', 'cutImpact': 'p:L6-0.05'}  # the last four: the build's music grid
    # about 16 shots for about 30 s: a cut every 1.5-2 s; the middle of L2 is a three-shot montage
    # a story: every line is a scene with people in a real place (14 shots, a cut every 1.5-2.5 s)
    shots = [('S01', 'story', 'arrive', 0, 'Frame 0: Pip lands at the bus terminal, his phone over the shoulder stuck on the clock; 6 HORAS, the three apps struck'),
             ('S02', 'story', 'mom', 'w:L1:7-0.1', 'Y nadie pudo avisar: mum in the kitchen, "¿Ya llegaste?" stuck on the clock'),
             ('S03', 'story', 'shop', 'p:L2-0.1', 'Tiendas sin pedidos: Mo in his shop, PEDIDOS POR WHATSAPP, PEDIDOS: 0'),
             ('S04', 'story', 'family', 'w:L2:3-0.1', 'Familias sin noticias: Pip\'s sister in her room, the family group stuck'),
             ('S05', 'story', 'roof', 'w:L2:6-0.1', 'Todo en silencio: Pip on the rooftop, phone up to the sky; the city goes quiet'),
             ('S06', 'story', 'hacker', 'p:L3-0.1', 'No fue un hackeo: the hooded hacker everybody imagines, crossed out'),
             ('S07', 'story', 'router', 'w:L3:5-0.1', 'Ni tu internet: Pip checks his router, it is fine: TU WIFI: OK'),
             ('S08', 'story', 'office', 'p:L4-0.1', 'Un solo comando de rutina: the engineer in the suit presses ENTER, REVISIÓN DE RUTINA'),
             ('S09', 'story', 'control', 'm:apago-0.15', 'Apagó los tres: the control room, the three apps go dark on the wall, the engineer turns round'),
             ('S10', 'town', 'streets', 'p:L5-0.1', 'Sus edificios sin calles: the three app buildings lose the streets between them'),
             ('S11', 'story', 'search', 'w:L5:8-0.1', 'E internet ya no los encontrara: mum searches whatsapp.com: NO SE ENCUENTRA'),
             ('S12', 'door', 'suit', 'p:L6-0.1', 'Ni siquiera podían entrar: the engineer at the data centre door, the badge, ACCESO DENEGADO'),
             ('S13', 'cta', 'story', 'p:L7-0.1', '¿Qué abriste primero? Mum in the kitchen, happy at last; the three apps as answer bubbles, WhatsApp goes green'),
             ('S14', 'loop', None, 'e:L7+0.05', 'Close: the dead chat list, the share ask, and back into frame 0 (the terminal)')]
    shot_list = [dict({'id': i, 'kind': k, 'at': at, 'note': note, 'lang': 'I'}, **({'variant': v} if v else {})) for i, k, v, at, note in shots]

    def e(at, kind, **k):
        return {'at': at, 'kind': kind, **k}
    sfx = [e(0, 'subdrop', dur=1.7, gain=-2), e(0, 'impact', gain=-6), e(0, 'sub', gain=-5), e(0, 'tickramp', dur=1.5, gain=-13),
           e('m:horas+0.25', 'boom', dur=1.0, gain=-14), e('m:llego', 'buzzer', dur=0.4, gain=-14),
           e('m:tiendas', 'blip', gain=-12), e('m:familias', 'blip', gain=-12), e('m:silencio', 'subdrop', dur=1.0, gain=-10),
           e('m:hackeo', 'stamp', gain=-7), e('m:internet', 'blip', gain=-11),
           e('m:comando-0.1', 'click', gain=-6), e('m:apago', 'clank', gain=-6), e('m:apago+0.14', 'pop', gain=-10), e('m:apago+0.3', 'pop', gain=-10),
           e('m:tres', 'pop', gain=-10), e('p:L4', 'hum', dur=2.2, gain=-17),
           e('m:calles', 'zap', dur=0.5, gain=-11), e('m:calles', 'glitch', dur=0.3, gain=-11), e('m:encontrara', 'buzzer', dur=0.4, gain=-12),
           e('m:entrar', 'buzzer', dur=0.6, gain=-10), e('m:entrar', 'slam', gain=-8),
           e('m:restored', 'coin', gain=-9), e('m:cta', 'pop', gain=-11)]
    # every cut is a swipe, like changing apps
    for at in ['w:L1:7-0.2', 'p:L2-0.2', 'w:L2:3-0.2', 'w:L2:6-0.2', 'p:L3-0.2', 'w:L3:5-0.2', 'p:L4-0.2', 'm:apago-0.25', 'p:L5-0.2', 'w:L5:8-0.2', 'p:L6-0.2', 'p:L7-0.2', 'e:L7-0.1']:
        sfx.append(e(at, 'whoosh', dur=0.35, gain=-14))
    sfx.append(e('D-1.8', 'riser', dur=1.8, gain=2, duck=False))  # the loop in sound: a riser into the impact of frame 0
    sfx.append(e('D-0.3', 'whoosh', dur=0.35, gain=-3, duck=False))
    fx = [e(0, 'hit6'), e('m:horas', 'punch'), e('m:hackeo', 'hit6'), e('m:hackeo', 'punch10'), e('m:apago', 'hit6'), e('m:apago', 'punch10'),
          e('m:tres', 'punch'), e('m:calles', 'glitch'), e('m:calles', 'hit6'), e('m:encontrara', 'punch'),
          e('m:entrar', 'hit6'), e('m:entrar', 'punch10'), e('m:abrir', 'punch'), e('e:L7+0.05', 'glitch'), e('e:L7+0.05', 'hit6')]
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
            'vacuum': 0.3, 'vacuums': ['m:silencio', 'm:hackeo'], 'questionAt': 'p:L7', 'outro': OUTRO,
            'visualLead': {'hackeo': 0.05, 'apago': 0.05, 'calles': 0.06, 'entrar': 0.05}, 'silences': [],
            'musicDips': [{'from': 'p:L1', 'to': 'e:L1', 'gain': 0.5}, {'from': 'p:L7', 'to': 'e:L7', 'gain': 0.4}],
            'voices': {'v1': {'file': 'public/fallo04/voice.wav', 'src': src, 'tail': {}}}}
    os.makedirs('src/fallo04', exist_ok=True)
    json.dump(plan, open('src/fallo04/plan.json', 'w'), ensure_ascii=False, indent=2)
    open('src/fallo04/plan.json', 'a').write('\n')
    print('voice segments:', {k: v for k, v in src.items()})


main()
