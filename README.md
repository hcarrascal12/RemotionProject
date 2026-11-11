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
