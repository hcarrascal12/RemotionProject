# Fallo #02: cierre nuevo (opción A)

Reemplaza "¿De quién fue la culpa? ¿De CrowdStrike o de Microsoft?" por:

> ¿De quién fue la culpa?                         <- ya está en tu grabación, se reutiliza
> **¿De la empresa que la envió… o de un sistema donde un solo error pudo tumbar millones de equipos?**   <- LA FRASE A GRABAR

Tarjetas de la balanza: `¿LA EMPRESA? / LA ENVIÓ` y `¿EL SISTEMA? / UN SOLO ERROR`.

## Grabación
- Una sola toma, la frase completa, con la misma voz y ajustes de ElevenLabs que el resto de #02.
- Ritmo del resto (unas 130-140 palabras por minuto); pausa corta en los "…" (0,3 a 0,4 s) y subida de tono en "empresa" y en "sistema".
- Unos 6 a 7 segundos. Si sale más larga, el video sube unos 2 s.

## Después
```bash
python3 tools/add_m2.py nueva-toma.mp3          # limpia, la pega al final de la voz y apunta M2 a ella
python3 tools/mkplan02.py                       # reconstruye el plan  (hay que fusionar con el plan anterior, ver abajo)
EPISODE=fallo02 python3 tools/therac25_build.py # tiempos y mezcla
rm -rf out/fallo02/chunks; EPISODE=fallo02 COMPOSITION=Fallo02 bash tools/therac25_render.sh
```
