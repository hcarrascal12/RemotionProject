# RemotionProject

Estudio de vídeo "What If" con Remotion, más la skill de Claude Code que genera los episodios.

## Estructura

- `.claude/skills/what-if-animation/`: la skill (pipeline, guiones, scripts). Fuente: https://github.com/kelano86/what-if-animation (MIT).
- `what-if-studio/`: el proyecto de Remotion (motor, escenas y episodios `Rewind` y `CopyPaste`).

## Puesta en marcha

```
cd what-if-studio
npm ci
npx tsc --noEmit
```

Para renderizar sin depender de la descarga de Chromium de Remotion, usa el navegador del entorno:

```
npx remotion render src/index.ts Rewind out/rewind.mp4 --browser-executable=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
```

La voz y los efectos de sonido usan ElevenLabs. Pon la clave en `ELEVENLABS_API_KEY` o en un `.env` dentro del repositorio. Nunca la subas al repositorio.

## Short vertical: Therac-25, 1985

Composición `Therac25`: 1080x1920, 60 fps, unos 49 s (la duración sale de la voz más 4.5 s de cierre; `Root.tsx` la lee de `timeline.json`, así que no hay que tocar nada a mano), narrado en segunda persona.

- `what-if-studio/src/therac25/plan.json`: guion, frases de voz, cortes, efectos visuales, efectos de sonido y fuentes de los datos. Es la única fuente de tiempos.
- `what-if-studio/tools/therac25_build.py`: calcula los tiempos por palabra y escribe `timeline.json`, coloca la voz en las escenas, sintetiza todos los efectos de sonido con numpy y masteriza la mezcla a -14 LUFS (`public/therac25/mix.wav`, que no se sube al repositorio).
- `what-if-studio/src/components/`: `ScrollStopperHook`, `DynamicSubtitles`, `KeyboardFast`, `ShieldJam`, `GlitchScreen`, `DangerGauge`, más las escenas con personajes (`TreatmentScene`, `ConsoleScene`, `OfficeScene`), `FingerPress`, `Interlock` y `Fx`.

Ritmo (revisión 2): flashes y sacudida de cámara solo en el gancho y al llegar a 100x; pausas de 0.4 s entre frases (`gap` de cada tramo en `plan.json`) con la cámara en un empuje suave; subtítulos de 2 a 3 palabras (los grupos se escriben en `plan.json` separados por `|`, y `*` / `!` marcan la palabra clave en amarillo / rojo). El único personaje en la sala de control es el operador (Mo). Música (revisión 3): compuesta en código en `tools/therac25_build.py` (`compose_music`), La menor (Am - F - Dm - E) a 100 BPM con la cuadrícula desplazada para que un tiempo fuerte caiga en el 100x: cama de pad y bajo, bombo, arpegio con eco desde el escudo, caja y barrido en la subida, un hueco antes del golpe y fundido final para el bucle. Va 11 dB bajo la voz y se agacha 8 dB mientras hay palabras. Zonas seguras: nada importante en los 250 px superiores ni en los 340 inferiores (la barra de progreso va a 250 px). El plano `S14` y el `S17` son del operador para cortar la racha de pantallas.

Los últimos 4.5 s muestran "¿DE QUIÉN FUE LA CULPA?" con dos etiquetas y luego un zoom a ENTER que enlaza con el primer fotograma.
- Sets nuevos del motor: `engine/sets/treatment.tsx` (búnker de radioterapia) y `engine/sets/control.tsx` (sala de control). Look nuevo: `doc` (médico).

```
cd what-if-studio
python3 tools/therac25_build.py          # timeline + audio
node tools/therac25_stills.mjs           # storyboard en out/therac25/storyboard.jpg
npx remotion render src/index.ts Therac25 out/therac25/therac25-final.mp4 \
  --browser-executable=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome --concurrency=4 --crf=18
```

La voz (`public/therac25/voice-raw.mp3`) se generó con el voiceover de vidIQ (voz Adam, 28 créditos por toma; la revisión 2 usó una toma nueva). Para renderizar, `bash tools/therac25_render.sh` (por tramos con reintentos; borra `out/therac25/chunks` si cambias imagen o tiempos).

Pulido final (revisión 4): el gancho suena con un golpe grave seco (`subdrop`), un pulso cardiaco que se acelera y un tono grave de tensión, sin sirena; el bloque NO PRESIONES ESA TECLA y el contador suben 80 px para no rozar los subtítulos; la pregunta final entra 0.3 s antes y se mantiene unos 2.8 s antes del zoom a ENTER; los últimos frames son un fondo rojo sin el cartel de ALERTA, para que el bucle reinicie limpio.

## El Dev Artificial: sistema de diseño (revisión 5)

Dirección audiovisual para vídeos verticales 9:16. Regla #1: todo se subordina a frenar el scroll en los primeros 1.5–3 s y sostener la retención.

- `what-if-studio/src/design/devArtificial.ts`: la fuente única de la paleta (`#05070A`, `#0B0F17`, rojo `#FF2A2A`, verde `#00FF66`, ámbar `#FFB800`, blanco `#F8FAFC`), las zonas seguras (250 px arriba, 340 abajo, sujeto sobre y=1250), los tiempos (primer corte ~3 s, un cambio cada 2.5–4 s, vacío de 0.3 s antes de revelaciones) y los muelles. `motion.ts` los re-exporta.
- `CineCamera`: cámara vertical sobre el motor, con gradación de paleta, viñeta, luz emitida por un monitor o lámpara y bordes desenfocados de primer plano. Solo usa degradados con transparencia: los modos de mezcla y los filtros de desenfoque a pantalla completa multiplican por 7 el tiempo de render.
- `CharacterRig`: envuelve al `Hero` con parpadeo natural cada 2.5–4.5 s, mirada que se mueve, respiración, sudor, borde de luz del color de la escena (`warm`, `red`, `green`, `amber`, `blue`) y sombra suave.
- `TechTerminal`: la consola CRT que ilumina su entorno; `DepthBackdrop`: fondo con cuadrícula, resplandor y viñeta en vez de un color plano.
- `AlertOverlay` (flash y glitch), `KineticTitle` (golpe de texto con muelle rígido) y `KineticCaptions` (subtítulos de 2–3 palabras).
- `plan.json`: cada plano lleva `lang` (`N` narrativo o `I` impacto); el build avisa si hay más de 2 seguidos del mismo tipo, o planos de menos de 1.2 s o más de 4.8 s. `vacuums` lista las revelaciones que llevan 0.3 s de silencio previo.

Therac-25 con este sistema: 20 planos (media 2.45 s), recorrido continuo de Pip (cara y monitor, pecho, máquina), planos de Pip recibiendo cada descarga, medidor que sube y revienta en un solo plano, y la advertencia ya visible en el frame 0.

### Pase de dinámica (revisión 6)

- Se corta "qué significa ese código" y "y parece que el tratamiento se pausó": queda "El manual no explica" (corte limpio a los 32.12 s del take, entre "explica" y "qué"). `ERROR 54` aguanta en pantalla durante una pausa de 0.8 s.
- Un silencio total de 1 s (sin voz, música ni efectos, `silences` en `plan.json`) antes del segundo ENTER, con el texto SEGUNDO ENTER.
- Un plano de respiro de 1.5 s sin narración (la sala y la máquina) antes del primer disparo.
- La música baja un 60 % entre 2 y 4 s y en la última frase (`musicDips`). Sin riser ni whoosh en los cortes normales (un 26 % menos de efectos).
- Los gráficos clave (`error`, `seguridad`, `dinero`, `cien`) llegan 0.4 s antes de la palabra (`visualLead`); el sonido se queda en la palabra. Se quitaron siete textos que duplicaban los subtítulos.
- Última pantalla: "¿SOFTWARE O EMPRESA? TE LEO" bajo la pregunta.
- Borrador rápido: `DRAFT=1 bash tools/therac25_render.sh` (media resolución, JPEG) escribe `out/therac25/therac25-draft.mp4`.
