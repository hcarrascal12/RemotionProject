import json
S='/tmp/claude-0/-home-user-RemotionProject/2e08932a-aede-5232-b173-eba7ffa8821b/scratchpad/sil02.txt'
sil=[tuple(map(float,l.split())) for l in open(S)]
segs=[(sil[i][1], sil[i+1][0]) for i in range(len(sil)-1)]
assert len(segs)==23, len(segs)
ids=['A1','A2','A3','B1','B2','C','D','E1','E2','F1','F2','G1','G2','H1','H2','I','J','K1','K2','L','M1','M2','N']
src={i:[round(a,3),round(b,3)] for i,(a,b) in zip(ids,segs)}
import os
if os.path.exists('src/fallo02/m2.json'):
    src['M2']=json.load(open('src/fallo02/m2.json'))['M2']
src['A1b']=[src['A1'][0],1.55]   # 'Imagina despertar un viernes' (the take has a natural gap at 1.55 s)
src['A1']=[2.325,src['A1'][1]]    # 'un error pequeño apagó millones de computadoras' (cut in the dip between 'que' and 'un')
words={
'A1':'UN ERROR* | PEQUEÑO APAGÓ! | MILLONES DE | COMPUTADORAS*','A1b':'IMAGINA DESPERTAR* | UN VIERNES',
'A2':'ES 19* DE | JULIO DE 2024*','A3':'PRENDES TU | COMPUTADORA Y | LA PANTALLA | SE PONE AZUL!',
'B1':'TU VUELO* | NO SALE!','B2':'TU BANCO* | NO ABRE!',
'C':'UNA EMPRESA | DE SEGURIDAD* | ENVÍA UNA | ACTUALIZACIÓN*','D':'NO ES UN | CIBERATAQUE!',
'E1':'SU ERROR*','E2':'PIDE EL DATO* | 21* DE UNA | LISTA DE 20!',
'F1':'TU COMPUTADORA | NO SABE! | QUÉ HACER','F2':'Y SE BLOQUEA!',
'G1':'REINICIAS*','G2':'OTRA VEZ | AZUL!','H1':'COMO TÚ*','H2':'OCHO MILLONES! | Y MEDIO DE | EQUIPOS',
'I':'A LOS 78* | MINUTOS | LA RETIRAN*','J':'PERO NO* | DESBLOQUEA | LA TUYA!',
'K1':'HAY QUE | ARREGLARLA | A MANO*','K2':'UNA POR UNA!','L':'TODO PORQUE | NADIE! PENSÓ | QUÉ PASARÍA!',
'M1':'¿DE QUIÉN | FUE LA CULPA?','M2':'DE LA EMPRESA* | QUE LA ENVIÓ | O DE UN | SISTEMA* | DONDE UN SOLO | ERROR PUDO | TUMBAR MILLONES | DE EQUIPOS','N':'TE LEO* EN | LOS COMENTARIOS'}
phrases=[]
for i in ['A1','A1b']+[x for x in ids[1:] if x not in ('N','G1','G2','H1','H2')]:
    d={'id':i,'src':src[i],'words':words[i]}
    if i in ('M1','M2','N'): d['captions']=False
    phrases.append(d)
members=[('A0',['A1']),('Ab',['A1b']),('A',['A2','A3']),('B',['B1','B2']),('C',['C','D']),('E',['E1','E2']),('F',['F1','F2']),('I',['I']),('J',['J']),('K',['K1','K2']),('L',['L']),('M',['M1','M2'])]
chunks=[]; prev=None
for cid,ps in members:
    gap=0 if prev is None else {'Ab':0.3,'A':0.42,'F':0.75,'H':0.3,'I':0.26,'J':0.32,'K':0.26,'L':0.3}.get(cid, round(src[ps[0]][0]-src[prev][1],2))
    chunks.append({'id':cid,'gap':gap,'phrases':ps}); prev=ps[-1]
marks={'a1':'p:A1','apago':'w:A1:3','millones':'w:A1:4','fecha':'w:A2:1','azul':'w:A3:8','vuelo':'w:B1:1','banco':'w:B2:1','envia':'w:C:4','update':'w:C:6','ciberataque':'w:D:3',
'dato':'w:E2:2','veintiuno':'w:E2:3','veinte':'w:E2:8','bloquea':'w:F2:2','burst':'p:I','min78':'w:I:2','retiran':'w:I:5','tuya':'w:J:4',
'mano':'w:K1:4','unaporuna':'p:K2','nadie':'w:L:2','pasaria':'w:L:5','tag1':'w:M2:2','tag2':'w:M2:9','cta':'e:M2','cutImpact':'p:F1-0.1','beamOn':'p:E1','presionar':'p:F2','climaxIn':'p:F1-0.12','climaxOut':'p:M1-0.1'}
shots=[('S01','hook',None,0,'I','Frame 0: CRT, strobe azul, zoom 1.25 a 1.0 sobre ENVIAR, contador de PCs caídos, NO PRESIONES / ENVIAR'),
('S02','rec','wake','p:A1b-0.1','N','Pip despierta en su escritorio'),
('S02b','rec','calendar','p:A2-0.1','I','Calendario: viernes 19 de julio de 2024'),
('S03','rec','bsod','p:A3-0.1','I','La pantalla se pone azul'),
('S04a','rec','terminal','p:B1-0.1','N','Aeropuerto: vuelos cancelados'),
('S04b','rec','atm','p:B2-0.15','N','Cajero fuera de servicio'),
('S05','rec','office','p:C-0.1','I','El traje pulsa ENVIAR'),
('S06','rec','hacker','p:D-0.1','N','No es un ciberataque'),
('S07','rec','class','p:E1-0.1','I','Lista de 20 en la pizarra'),
('S07b','rec','classpoint','w:E2:3-0.25','I','Mo señala el 21: no existe'),
('S08','rec','crash','p:F1-0.1','N','El PC no sabe qué hacer y se bloquea'),
('S11','rec','ops','p:I-0.1','N','78 minutos hasta retirarla'),
('S12','rec','locked','p:J-0.1','I','Retirarla no desbloquea la tuya'),
('S13','rec','fix','p:K1-0.1','N','A mano, una por una'),
('S14','rec','alone','p:L-0.1','N','Nadie pensó qué pasaría'),
('S15','loop',None,'p:M1-0.1','I','Pregunta binaria, balanza, CTA y bucle')]
shot_list=[]
for i,k,v,at,lang,note in shots:
    d={'id':i,'kind':k,'at':at,'note':note,'lang':lang}
    if v: d['variant']=v
    shot_list.append(d)
def e(at,kind,**k): return {'at':at,'kind':kind,**k}
sfx=[e(0,'subdrop',dur=1.7,gain=-1),e(0,'tension',dur=2.8,gain=-12)]
sfx+=[e(0,'tickramp',dur=2.6,gain=-9),e(0,'crt',gain=-8),e(0.1,'glitch',dur=0.3,gain=-9),e(0.35,'glitch',dur=0.3,gain=-9),e(0.6,'glitch',dur=0.3,gain=-10)]
for tt,g in [(0.9,-12),(1.2,-11),(1.5,-10),(1.8,-9),(2.1,-8)]: sfx.append(e(tt,'blip',gain=g))
for i in range(12): sfx.append(e(round(0.45+0.15*i,2),'click',gain=-14+0.3*i))
sfx.append(e('m:millones','impact',gain=-4))
sfx+=[e(0,'impact',gain=0),e(0,'sub',gain=-2),e(0.5,'slam',gain=-4),e(0,'drone',gain=-21,duck=False),
 e('m:millones','crack',gain=-8),e('m:fecha','stamp',gain=-5),e('m:apago','glitch',dur=0.3,gain=-12),
 e('m:azul','crt',gain=-9),e('m:azul','impact',gain=-4),e('m:azul','glitch',dur=0.3,gain=-11),
 e('m:vuelo','buzzer',dur=0.4,gain=-12),e('m:banco','clank',gain=-8),
 e('m:envia','charge',dur=0.8,gain=-16.0),e('m:envia','whoosh',dur=0.6,gain=-14.0),e('m:update','pop',gain=-9),
 e('m:ciberataque','slam',gain=-6),e('m:ciberataque','impact',gain=-8),
 e('p:E2','typing',dur=1.6,gain=-11),e('m:veintiuno','buzzer',dur=0.6,gain=-12.5),e('m:veintiuno','zap',dur=0.9,gain=-11.5),e('m:cutImpact','crack',gain=-7.0),e('m:cutImpact','impact',gain=-6.0),e('m:veintiuno','impact',gain=-8.5),e('m:veinte','crack',gain=-9.5),
 e('m:bloquea','impact',gain=-3),e('m:bloquea','boom',dur=1.4,gain=-6),e('m:bloquea','glitch',dur=0.4,gain=-10),e('m:bloquea','crt',gain=-9),
 
 e('m:min78','tickramp',dur=0.75,gain=-10),e('m:retiran','pop',gain=-9),e('m:tuya','clank',gain=-7),e('m:tuya','buzzer',dur=0.4,gain=-12),
 e('m:mano','click',gain=-8),e('m:unaporuna','click',gain=-8),e('m:unaporuna+0.3','click',gain=-10),
 e('m:nadie','heartbeat',gain=-6),e('p:L+1.0','heartbeat',gain=-6),
 e('p:M1','pop',gain=-10),e('m:tag1','pop',gain=-11),e('m:tag2','pop',gain=-11),e('m:cta','pop',gain=-11)]
# whooshes on cuts, in the same places as Fallo #01
for sid,at in [('S02','p:A1b-0.2'),('S02b','p:A2-0.2'),('S04b','p:B2-0.25'),('S07b','w:E2:3-0.35'),('S03','p:A3-0.2'),('S04','p:B1-0.2'),('S05','p:C-0.2'),('S07','p:E1-0.2'),('S11','p:I-0.2'),('S12','p:J-0.2'),('S13','p:K1-0.2'),('S14','p:L-0.2'),('S15','p:M1-0.2')]:
    sfx.append(e(at,'whoosh',dur=0.4,gain=-15))
# build-up under the error explanation and the reboot loop
sfx+=[e('e:E2','tension',dur=1.0,gain=-11),e('e:E2','tickramp',dur=0.75,gain=-10),e('e:E2+0.05','riser',dur=0.7,gain=-12,duck=False),e('p:E1-0.1','hum',dur=3.0,gain=-17),e('p:F2','tension',dur=2.0,gain=-14)]
fx=[e(0,'softflash'),e(0,'hit6'),e('m:millones','hit6'),e('m:millones','punch10'),e('m:veintiuno','punch10'),e('m:veinte','punch10'),e('D-0.017','softflash'),e(0.5,'shake'),e(0.3,'invert'),e(0.36,'invert'),e(0.1,'glitch'),e(0.6,'glitch'),e(1.1,'zoom'),e(2.0,'zoom'),e('m:bloquea','microshake'),e('m:ciberataque','microshake')]
for sid_at in ['p:A1b','p:A2','p:A3','p:B1','p:B2','p:C','p:D','p:E1','w:E2:3','p:F1','p:I','p:J','p:K1','p:L']:
    fx.append(e(sid_at+'-0.1','glitch'))
for m in ['apago','azul','vuelo','banco','update','veintiuno','bloquea','retiran','tuya','mano','nadie','tag1','tag2']:
    fx.append(e(f'm:{m}','punch'))
plan={'id':'Fallo02','title':'Fallo #02, CrowdStrike, 2024','fps':60,'width':1080,'height':1920,'outro':1.8,'musicFadeOut':0.5,'voice':'v1','music':'file',
'voiceCredits':{'service':'ElevenLabs (voz diseñada), limpiada con tools/voice_clean.py, atempo 1.04','credits':None,'note':'guion final del #02'},
'science':[
 {'claim':'On 19 July 2024 a faulty Falcon content update (Channel File 291) crashed Windows hosts. Published 04:09 UTC, reverted 05:27 UTC (78 minutes).','source':'CrowdStrike, Statement on Falcon Content Update for Windows Hosts (2024); Channel File 291 Incident Root Cause Analysis, 6 Aug 2024.'},
 {'claim':'Root cause: the IPC Template Type defined 21 input fields but the sensor integration code supplied only 20 values; the Content Interpreter read the 21st (out-of-bounds read).','source':'CrowdStrike, Channel File 291 Incident Root Cause Analysis, 6 Aug 2024.'},
 {'claim':'About 8.5 million Windows devices were affected (Microsoft estimate, under 1% of Windows machines). Not a cyberattack; the bug was judged not exploitable.','source':'Microsoft estimate as reported by SecurityWeek (July 2024); CrowdStrike RCA.'},
 {'claim':'Remediation was manual for many machines: boot into Safe Mode or Recovery and delete the faulty file; machines with disk encryption could ask for a recovery key. Some recovered after repeated reboots.','source':'CrowdStrike remediation guidance; Microsoft KB5042429 recovery tool.'},
 {'claim':'Simplification: the red key ENVIAR is a symbol for the company pushing the update (no such physical key existed). Hospital/airport/bank scenes are illustrative of the documented disruption.'}],
'chunks':chunks,'phrases':phrases,'say':{'19':'diecinueve','2024':'dos mil veinticuatro','21':'veintiuno','20':'veinte','78':'setenta y ocho'},
'lead':0.05,'marks':marks,'shots':shot_list,'fx':fx,'sfx':sfx,'vacuum':0.3,'vacuums':['m:bloquea'],
'visualLead':{'azul':0.25,'bloquea':0.25,'veintiuno':0.2},'silences':[],
'musicDips':[{'from':2.0,'to':4.0,'gain':0.4},{'from':'p:L','to':'e:L','gain':0.4}],
'voices':{'v1':{'file':'public/fallo02/voice.wav','src':src,'tail':{'A1b':0.0}}}}
json.dump(plan,open('src/fallo02/plan.json','w'),ensure_ascii=False,indent=2); open('src/fallo02/plan.json','a').write('\n')
print(json.dumps(chunks)); print(src['A1'],src['N'])
