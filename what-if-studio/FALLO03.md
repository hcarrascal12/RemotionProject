# Fallo #03, Mars Climate Orbiter (23 de septiembre de 1999)

Vertical 1080x1920, **30 fps**, unos 44 s. Mismo motor que #01 y #02: `plan.json` (tiempos) + `tools/therac25_build.py` (audio y
`timeline.json`) + Remotion (imagen).

## Estructura de archivos

```
what-if-studio/
  tools/mkplan03.py                  guion, palabras de subtítulos, marcas, planos, SFX y fx -> src/fallo03/plan.json
  src/fallo03/
    plan.json                        generado por mkplan03.py
    timeline.json                    generado por la build (tiempos y subtítulos)
    pista_2.mp3                      música de fondo (la misma pista de #01 y #02)
    Fallo03.tsx                      la composición (cámara, subtítulos, etiqueta FALLO #03, audio)
    Cover.tsx                        la portada (Fallo03Cover)
  src/components/fallo03/
    parts.tsx                        paleta, estrellas, Marte, la sonda, texto con contorno
    MissionRoom.tsx                  sala de control en el mundo del motor What If (Pip, mesa, pantalla grande)
    HookScene.tsx                    gancho: contadores km y dólares, sonda hacia Marte, alerta de unidad  (variantes count, alert)
    MissionControlScene.tsx          control de misión, 23 SEPT 1999 (variantes room, screen)
    UnitsMismatchScene.tsx           libras ≠ newtons y el empuje x4,45                                   (variantes split, boost)
    AtmosphereCrashScene.tsx         150 km contra 57 km, señal perdida
    AftermathScene.tsx               sala sin señal, Pip con las manos en la cabeza, $125M -> $0
    DebateLoopScene.tsx              balanza contratista / NASA, CTA y bucle al fotograma 0
  public/fallo03/                    voice.wav y mix.wav (la build los escribe)
  out/fallo03/                       renders
```

## Guion (grábalo, una frase por línea; pausa de 0,3 s dentro de un bloque y 0,6 s entre bloques)

```
A  Nueve meses viajando a Marte.
   Ciento veinticinco millones de dólares.
   Y todo se pierde por no convertir una unidad.
B  Septiembre de mil novecientos noventa y nueve.
   Estás en el control de la NASA.
   Tu sonda va a entrar en órbita.
C  Un software calcula el empuje en libras.
   Otro lo lee como si fueran newtons.
D  Cada ajuste la empuja cuatro veces más fuerte de lo que crees.
E  Debía pasar a ciento cincuenta kilómetros.
   Pasa a cincuenta y siete.
F  Señal perdida.
   Nadie salió herido.
   Pero nueve meses de trabajo se perdieron.
G  ¿De quién fue la culpa?
   ¿Del contratista o de la NASA?
   Te leo en los comentarios.
```
17 frases, unas 95 palabras: caben en 44 s. (La versión larga del brief traía unas 136 palabras: a ritmo normal salían unos 55 s.)

## Pasos

1. **Con la voz real.** Graba, límpiala (`tools/voice_clean.py`) y guárdala en `public/fallo03/voice.wav`.
   Detecta los silencios y reconstruye el plan (debe haber 17 tramos de voz; si no salen, ajusta `--noise` y `--d`, la herramienta avisa):
   ```bash
   python3 tools/mkplan03.py --voice public/fallo03/voice.wav
   ```
   **Sin voz todavía:** `python3 tools/mkplan03.py --scratch` genera una voz guía (un zumbido por sílaba) y todos los tiempos estimados.
2. **Audio y tiempos:** `EPISODE=fallo03 python3 tools/therac25_build.py` (escribe `public/fallo03/mix.wav` a -14 LUFS y `src/fallo03/timeline.json`).
3. **Borrador** (mitad de tamaño, unos minutos): `rm -r out/fallo03/chunks-draft; EPISODE=fallo03 COMPOSITION=Fallo03 DRAFT=1 bash tools/therac25_render.sh`
4. **Render final** (1080x1920, 30 fps): `rm -r out/fallo03/chunks; EPISODE=fallo03 COMPOSITION=Fallo03 bash tools/therac25_render.sh`
   -> `out/fallo03/fallo03-final.mp4`. Borra siempre los trozos antes de volver a renderizar tras un cambio.
5. **Redes:** `bash tools/export_redes.sh out/fallo03/fallo03-final.mp4` (hay que cambiar la carpeta de salida dentro del script; escribe TikTok a 60 y 30 fps).
6. **Portada:** `npx remotion still src/index.ts Fallo03Cover out/fallo03/portada-fallo03.png`
   ("FALLO #03 / LIBRAS ≠ NEWTONS / $125 MILLONES PERDIDOS", todo dentro del cuadrado central).
7. **Estudio para ver y ajustar:** `npx remotion studio src/index.ts` y elige `Fallo03`.

## Datos y cautelas (verifica antes de publicar)

Fuente: NASA, Mars Climate Orbiter Mishap Investigation Board, Phase I Report (10 de noviembre de 1999).
- Causa raíz: el software de tierra entregaba el impulso de los motores en libras-fuerza por segundo y la navegación de la NASA lo leía como newtons por segundo (1 lbf = 4,45 N).
  El brief decía que la computadora de la nave esperaba newtons; el informe habla del software de navegación en tierra, por eso el guion dice "otro lo lee".
- **Por comprobar contra el PDF** (no pude descargarlo desde esta sesión): 150 km previstos frente a 57 km reales, y los 670 millones de km recorridos.
- El video no afirma qué le pasó a la sonda después del paso: dice solo que se perdió la señal.
- El "contratista" de la balanza es el equipo que escribió el software de tierra; la pregunta del cierre es deliberadamente abierta.
