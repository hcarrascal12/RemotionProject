# Sin resolver #01: Cicada 3301

Serie nueva de prueba (ver conversación de análisis): misterios sin resolver con ángulo digital, mismo formato de Short vertical (1080x1920) que los Fallos. **Es un experimento**: se mide contra el tope de ~1.200 vistas que tienen hoy los Shorts del canal.

- Duración con la voz guía: ~42 s (la voz real puede acortarla; objetivo 35 a 40 s).
- Regla de oro adaptada: la primera frase es la consecuencia humana ("miles de personas pasaron años…"); los hechos vienen después; el cierre abre la pregunta y pide la teoría (los misterios invitan a comentar).
- Visual: sin personajes. Terminal verde, texto cinético, glitch, paleta de "El Dev Artificial".
- Serie propuesta (4 Shorts): #01 el mensaje de 2012, #02 las rondas 2013 y 2014, #03 las teorías, #04 qué se sabe hoy.

## Guion para grabar
```
Miles de personas pasaron años resolviendo un acertijo sin saber quién lo escribió.

Todo empezó el cuatro de enero de dos mil doce, con una imagen anónima en un foro.

Decía: buscamos personas muy inteligentes. Y la firmaba un número: tres mil trescientos uno.

Dentro de la imagen había un mensaje oculto. Llevaba a un libro, a coordenadas y a carteles con códigos QR en varias ciudades.

Hubo tres rondas: dos mil doce, trece y catorce. Nadie ha confirmado quién estaba detrás.

¿Una agencia de espionaje? ¿Un experimento? Dime tu teoría. Es Sin resolver, número cero uno.
```

## Planos
| Plano | Qué se ve |
|---|---|
| S1 | 3301 con glitch sobre lluvia hexadecimal: EL ACERTIJO QUE NADIE PUDO CERRAR (fotograma 0 = miniatura y bucle) |
| S2 | Signo ? gigante: ¿QUIÉN LO ESCRIBIÓ? |
| S3 | La imagen anónima en el foro ("Anonymous 01/04/12 (Wed)") |
| S4 | Sellos: 4 · ENE, 2012, ANÓNIMO |
| S5 | Mensaje tecleado en terminal (el original en inglés) |
| S6 | FIRMADO: 3301 a pantalla completa |
| S7 | Un escáner revela el mensaje oculto |
| S8 | Tres pistas: libro, coordenadas, QR; pines en varias ciudades |
| S9 | Línea de tiempo 2012, 2013, 2014 |
| S10 | Línea de puntos con ? y sello SIN CONFIRMAR |
| S11 | ¿AGENCIA? ¿EXPERIMENTO? TU TEORÍA |
| S12 | DIME TU TEORÍA + tarjeta SIN RESOLVER #01 (el último fotograma enlaza con el primero) |

## Datos y fuentes (POR VERIFICAR antes de publicar)
- 4 de enero de 2012: imagen anónima en 4chan con "Hello. We are looking for highly intelligent individuals…", firmada 3301. Fuentes: Wikipedia "Cicada 3301"; The Why Files, "Solving Cicada 3301" (2023).
- La imagen escondía un mensaje que llevaba a un cifrado de libro, coordenadas y carteles con códigos QR en varias ciudades. Fuentes: Wikipedia; Rolling Stone, "Cicada: Solving the Web's Deepest Mystery" (2014).
- Tres rondas (enero de 2012, 2013 y 2014); nadie ha confirmado el origen. Ojo: puzzles posteriores a 2014 se consideran falsos; confirma el estado actual.
- El nombre del caso en tu serie: "Sin resolver #01". No afirmar teorías (NSA, CIA…) como hechos.

## Cómo se regenera
```
cd what-if-studio
python3 tools/mkplan_sin01.py --scratch          # voz guía (sin grabación); public/sin01/voice.wav
EPISODE=sin01 RULES=0 python3 tools/therac25_build.py        # timeline.json + mix.wav (-14 LUFS)
EPISODE=sin01 COMPOSITION=Sin01 DRAFT=1 bash tools/therac25_render.sh   # borrador a media resolución
```
Con la voz real: guarda `public/sin01/voice.wav` y `src/sin01/takes.json` (dónde cae cada frase Z1..Z6), y corre `python3 tools/mkplan_sin01.py` sin `--scratch`.
