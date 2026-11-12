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

Composición `Therac25`: 1080x1920, 60 fps, unos 47.5 s (la duración sale de la voz más 3 s de cierre), narrado en segunda persona.

- `what-if-studio/src/therac25/plan.json`: guion, frases de voz, cortes, efectos visuales, efectos de sonido y fuentes de los datos. Es la única fuente de tiempos.
- `what-if-studio/tools/therac25_build.py`: calcula los tiempos por palabra y escribe `timeline.json`, coloca la voz en las escenas, sintetiza todos los efectos de sonido con numpy y masteriza la mezcla a -14 LUFS (`public/therac25/mix.wav`, que no se sube al repositorio).
- `what-if-studio/src/components/`: `ScrollStopperHook`, `DynamicSubtitles`, `KeyboardFast`, `ShieldJam`, `GlitchScreen`, `DangerGauge`, más las escenas con personajes (`TreatmentScene`, `ConsoleScene`, `OfficeScene`), `FingerPress`, `Interlock` y `Fx`.

Ritmo (revisión 2): flashes y sacudida de cámara solo en el gancho y al llegar a 100x; pausas de 0.4 s entre frases (`gap` de cada tramo en `plan.json`) con la cámara en un empuje suave; subtítulos de 2 a 3 palabras (los grupos se escriben en `plan.json` separados por `|`, y `*` / `!` marcan la palabra clave en amarillo / rojo). El único personaje en la sala de control es el operador (Mo). Música (revisión 3): compuesta en código en `tools/therac25_build.py` (`compose_music`), La menor (Am - F - Dm - E) a 100 BPM con la cuadrícula desplazada para que un tiempo fuerte caiga en el 100x: cama de pad y bajo, bombo, arpegio con eco desde el escudo, caja y barrido en la subida, un hueco antes del golpe y fundido final para el bucle. Va 11 dB bajo la voz y se agacha 8 dB mientras hay palabras. Zonas seguras: nada importante en los 250 px superiores ni en los 340 inferiores (la barra de progreso va a 250 px). El plano `S14` y el `S17` son del operador para cortar la racha de pantallas.

Los últimos 3 s muestran "¿DE QUIÉN FUE LA CULPA?" con dos etiquetas y luego un zoom a ENTER que enlaza con el primer fotograma.
- Sets nuevos del motor: `engine/sets/treatment.tsx` (búnker de radioterapia) y `engine/sets/control.tsx` (sala de control). Look nuevo: `doc` (médico).

```
cd what-if-studio
python3 tools/therac25_build.py          # timeline + audio
node tools/therac25_stills.mjs           # storyboard en out/therac25/storyboard.jpg
npx remotion render src/index.ts Therac25 out/therac25/therac25-final.mp4 \
  --browser-executable=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome --concurrency=4 --crf=18
```

La voz (`public/therac25/voice-raw.mp3`) se generó con el voiceover de vidIQ (voz Adam, 28 créditos por toma; la revisión 2 usó una toma nueva). Para renderizar, `bash tools/therac25_render.sh` (por tramos con reintentos; borra `out/therac25/chunks` si cambias imagen o tiempos).
