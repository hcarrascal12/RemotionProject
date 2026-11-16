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
    'L2': 'No fue un hackeo. No fue tu internet.',
    'L3': 'Un solo comando de mantenimiento apagó los tres a la vez.',
    'L4': 'La herramienta que debía frenarlo, también falló.',
    'L5': 'Desconectó sus servidores entre sí, y los borró del mapa de internet.',
    'L6': 'Y los que podían arreglarlo, ni siquiera podían entrar.',
    'L7': '¿Qué fue lo primero que intentaste abrir?'}
# on-screen words: '|' splits the 2-3 word caption blocks, '*' a yellow key word, '!' a red one. Token indexes (marks w:ID:n):
#   L1 SEIS0 HORAS1 SIN2 WHATSAPP3 INSTAGRAM4 NI5 FACEBOOK6 Y7 NADIE8 PUDO9 AVISAR10 QUE11 LLEGÓ12 BIEN13
#   L2 NO0 FUE1 UN2 HACKEO3 NO4 FUE5 TU6 INTERNET7
#   L3 UN0 SOLO1 COMANDO2 DE3 MANTENIMIENTO4 APAGÓ5 LOS6 TRES7 A8 LA9 VEZ10
#   L4 LA0 HERRAMIENTA1 QUE2 DEBÍA3 FRENARLO4 TAMBIÉN5 FALLÓ6
#   L5 DESCONECTÓ0 SUS1 SERVIDORES2 ENTRE3 SÍ4 Y5 LOS6 BORRÓ7 DEL8 MAPA9 DE10 INTERNET11
#   L6 Y0 LOS1 QUE2 PODÍAN3 ARREGLARLO4 NI5 SIQUIERA6 PODÍAN7 ENTRAR8
#   L7 ¿QUÉ0 FUE1 LO2 PRIMERO3 QUE4 INTENTASTE5 ABRIR?6
WORDS = {
    'L1': 'SEIS* HORAS | SIN WHATSAPP | INSTAGRAM | NI FACEBOOK | Y NADIE | PUDO AVISAR | QUE LLEGÓ BIEN!',
    'L2': 'NO FUE | UN HACKEO! | NO FUE | TU INTERNET*',
    'L3': 'UN SOLO | COMANDO* | DE MANTENIMIENTO | APAGÓ LOS TRES! | A LA VEZ',
    'L4': 'LA HERRAMIENTA | QUE DEBÍA | FRENARLO | TAMBIÉN FALLÓ!',
    'L5': 'DESCONECTÓ | SUS SERVIDORES | ENTRE SÍ | Y LOS BORRÓ! | DEL MAPA | DE INTERNET*',
    'L6': 'Y LOS QUE | PODÍAN ARREGLARLO | NI SIQUIERA | PODÍAN ENTRAR!',
    'L7': '¿QUÉ FUE | LO PRIMERO | QUE INTENTASTE | ABRIR?*'}
SAY = {'WHATSAPP': 'guasap', 'INSTAGRAM': 'instagram', 'FACEBOOK': 'feisbuk'}
BLOCKS = [(i + 'c', [i]) for i in ORDER]
BLOCK_GAP = 0.25
GAPS = {'L2c': 0.3, 'L3c': 0.3, 'L4c': 0.22, 'L5c': 0.3, 'L6c': 0.3, 'L7c': 0.4}
OUTRO = float(os.environ.get('OUTRO', '2.4'))  # music, the share ask and the loop after the last word; tune it so the film is 29-30 s


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
             'hackeo': 'w:L2:3', 'tuinternet': 'w:L2:4', 'internet': 'w:L2:7',
             'comando': 'w:L3:2', 'apago': 'w:L3:5', 'tres': 'w:L3:7', 'l3end': 'e:L3',
             'herramienta': 'w:L4:1', 'frenar': 'w:L4:4', 'fallo': 'w:L4:6',
             'desconecto': 'p:L5', 'entre': 'w:L5:3', 'yborro': 'w:L5:5', 'borro': 'w:L5:7', 'mapa': 'w:L5:9',
             'arreglar': 'w:L6:4', 'siquiera': 'w:L6:5', 'entrar': 'w:L6:8',
             'pregunta': 'p:L7', 'abrir': 'w:L7:6', 'cta': 'e:L7',
             'followIn': 'e:L6+0.25', 'followOut': 'p:L7-0.15', 'ctaIn': 'e:L7+0.12', 'ctaOut': 'D-0.4',
             'climaxIn': 'p:L3', 'climaxOut': 'p:L7-0.1',
             'burst': 'w:L5:7', 'beamOn': 'p:L3', 'presionar': 'p:L4', 'cutImpact': 'p:L6-0.05'}  # the last four: the build's music grid
    shots = [('S01', 'hook', 'loss', 0, 'Frame 0: 6 HORAS, el móvil con tres burbujas grises y el reloj que corre hasta 6:00'),
             ('S02', 'hook', 'msg', 'w:L1:7-0.1', 'Y nadie pudo avisar: Pip con el móvil, "Ya llegué" con el relojito que no se envía'),
             ('S03', 'offline', 'bubbles', 'p:L2-0.1', 'No fue un hackeo: las burbujas se apagan una a una, cae Sin conexión, sello NO ERA UN HACKEO'),
             ('S04', 'offline', 'wifi', 'w:L2:4-0.1', 'No fue tu internet: el wifi de casa a tope, con su visto bueno'),
             ('S05', 'command', 'type', 'p:L3-0.1', 'Un solo comando de mantenimiento: la consola, la orden escribiéndose'),
             ('S06', 'command', 'cascade', 'm:apago-0.15', 'Apagó los tres: el interruptor maestro a OFF y los tres nodos en cascada'),
             ('S07', 'audit', None, 'p:L4-0.1', 'La herramienta que debía frenarlo: la barrera de auditoría se abre sola y se rompe'),
             ('S08', 'map', 'cut', 'p:L5-0.1', 'Desconectó sus servidores entre sí: el cable vuelve hacia su propio nodo y se corta'),
             ('S09', 'map', 'gone', 'w:L5:5-0.1', 'Y los borró del mapa: los tres puntos desaparecen del mapa de internet'),
             ('S10', 'door', None, 'p:L6-0.1', 'Ni siquiera podían entrar: un ingeniero, la tarjeta, ACCESO DENEGADO'),
             ('S11', 'cta', None, 'p:L7-0.1', '¿Qué abriste primero? Vuelven las burbujas, la primera se pone verde con doble check'),
             ('S12', 'loop', None, 'e:L7+0.05', 'Cierre: sin señal, el pedido de compartir, y vuelta al fotograma 0')]
    shot_list = [dict({'id': i, 'kind': k, 'at': at, 'note': note, 'lang': 'I'}, **({'variant': v} if v else {})) for i, k, v, at, note in shots]

    def e(at, kind, **k):
        return {'at': at, 'kind': kind, **k}
    sfx = [e(0, 'subdrop', dur=1.7, gain=-2), e(0, 'impact', gain=-6), e(0, 'sub', gain=-5), e(0, 'tickramp', dur=1.5, gain=-12),
           e('m:horas+0.25', 'boom', dur=1.0, gain=-14),
           e('m:llego', 'buzzer', dur=0.4, gain=-14),
           e('m:hackeo-0.35', 'pop', gain=-10), e('m:hackeo-0.1', 'pop', gain=-10), e('m:hackeo+0.15', 'pop', gain=-10), e('m:hackeo+0.35', 'stamp', gain=-7),
           e('m:internet', 'blip', gain=-11),
           e('m:comando', 'typing', dur=1.0, gain=-14), e('m:apago', 'clank', gain=-6), e('m:apago+0.12', 'pop', gain=-10), e('m:apago+0.3', 'pop', gain=-10),
           e('m:tres', 'pop', gain=-10), e('p:L3', 'hum', dur=2.4, gain=-17),
           e('m:frenar', 'charge', dur=0.5, gain=-14), e('m:fallo', 'glitch', dur=0.4, gain=-9), e('m:fallo', 'crack', gain=-9),
           e('m:entre', 'zap', dur=0.5, gain=-11), e('m:entre', 'glitch', dur=0.3, gain=-11), e('m:borro', 'crt', gain=-9), e('m:borro', 'impact', gain=-7),
           e('m:entrar', 'buzzer', dur=0.6, gain=-10), e('m:entrar', 'slam', gain=-8),
           e('m:abrir+0.3', 'blip', gain=-9), e('m:cta', 'pop', gain=-11)]
    for at in ['w:L1:7-0.2', 'p:L2-0.2', 'w:L2:4-0.2', 'p:L3-0.2', 'm:apago-0.25', 'p:L4-0.2', 'p:L5-0.2', 'w:L5:5-0.2', 'p:L6-0.2', 'p:L7-0.2', 'e:L7-0.1']:
        sfx.append(e(at, 'whoosh', dur=0.4, gain=-15))
    sfx.append(e('D-1.8', 'riser', dur=1.8, gain=2, duck=False))  # the loop in sound: a riser into the impact of frame 0
    sfx.append(e('D-0.3', 'whoosh', dur=0.35, gain=-3, duck=False))
    fx = [e(0, 'hit6'), e('m:horas', 'punch'), e('m:hackeo+0.35', 'hit6'), e('m:hackeo+0.35', 'punch10'), e('m:apago', 'hit6'), e('m:apago', 'punch10'),
          e('m:tres', 'punch'), e('m:fallo', 'glitch'), e('m:fallo', 'hit6'), e('m:entre', 'glitch'), e('m:borro', 'flash'), e('m:borro', 'shake'),
          e('m:entrar', 'hit6'), e('m:entrar', 'punch10'), e('m:abrir', 'punch'), e('e:L7+0.05', 'glitch'), e('e:L7+0.05', 'hit6')]
    for at in ['w:L1:7', 'p:L2', 'w:L2:4', 'p:L3', 'p:L4', 'p:L5', 'w:L5:5', 'p:L6', 'p:L7']:
        fx.append(e(at + '-0.1', 'glitch'))
    plan = {'id': 'Fallo04', 'title': 'Fallo #04, la caída de Facebook, Instagram y WhatsApp, 2021', 'fps': 30, 'width': 1080, 'height': 1920, 'voice': 'v1',
            'music': 'file', 'musicFile': 'pista_2.mp3', 'musicStart': 0, 'musicLoop': [4, 24], 'musicDb': 17.0, 'musicDuck': 0.6, 'musicFadeOut': 0.2,
            'musicPocket': True, 'voiceCredits': credit,
            'science': [
                {'claim': 'On 4 October 2021 Facebook, Instagram, WhatsApp and Messenger were unreachable worldwide for about six hours: from about 15:40 UTC; BGP routes came back about 21:50 UTC, DNS about 22:05, service generally restored by about 22:50 UTC.', 'source': 'NetBlocks; The Register (4 Oct 2021); Wikipedia "2021 Facebook outage" (timeline, citing Cloudflare and Facebook).'},
                {'claim': 'Not an attack: Facebook said the cause was not malicious activity and that no user data was compromised.', 'source': 'Facebook statement, 4 Oct 2021; TechRadar.'},
                {'claim': 'Cause: during routine maintenance, a command meant to assess the capacity of the global backbone unintentionally took down all the backbone connections, disconnecting Facebook\'s data centres; the audit tool meant to stop such commands had a bug and let it through. Facebook\'s DNS servers then withdrew their BGP advertisements, so the rest of the internet could not find Facebook ("borrados del mapa").', 'source': 'Santosh Janardhan, "More details about the October 4 outage", Engineering at Meta, 5 Oct 2021 (read through search results: engineering.fb.com is not reachable from this session).'},
                {'claim': 'TO WORD CAREFULLY: Facebook said its internal tools went down too and that getting people onsite to the data centres took extra time because of the physical security; reports that employee badges did not work come from KrebsOnSecurity\'s sources, not from Facebook. The film only says the people who could fix it could not even get in.', 'source': 'Engineering at Meta (5 Oct 2021); KrebsOnSecurity (4 Oct 2021).'},
                {'claim': 'The film deliberately does not give a number of affected users.'}],
            'chunks': chunks, 'phrases': phrases, 'say': SAY, 'lead': 0.12, 'marks': marks, 'shots': shot_list, 'fx': fx, 'sfx': sfx,
            'vacuum': 0.3, 'vacuums': ['m:hackeo', 'm:borro'], 'questionAt': 'p:L7', 'outro': OUTRO,
            'visualLead': {'hackeo': 0.05, 'apago': 0.05, 'fallo': 0.08, 'borro': 0.08, 'entrar': 0.05}, 'silences': [],
            'musicDips': [{'from': 'p:L1', 'to': 'e:L1', 'gain': 0.5}, {'from': 'p:L7', 'to': 'e:L7', 'gain': 0.4}],
            'voices': {'v1': {'file': 'public/fallo04/voice.wav', 'src': src, 'tail': {}}}}
    os.makedirs('src/fallo04', exist_ok=True)
    json.dump(plan, open('src/fallo04/plan.json', 'w'), ensure_ascii=False, indent=2)
    open('src/fallo04/plan.json', 'a').write('\n')
    print('voice segments:', {k: v for k, v in src.items()})


main()
