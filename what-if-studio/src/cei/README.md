# Reel C.E.I. (Fundación Transformando Mi Realidad)

Composición `CeiFull` (vertical 1080x1920, 30 fps, 73,5 s). Los archivos de `public/cei/` no están en git
(contienen imágenes de menores y audio generado):

- `public/cei/src.mp4`: video original (480x864).
- `public/cei/mix_v2.wav`: música + voz en off ya mezcladas (música: `timeline.json`; voz: vidIQ, voz "Andrea", ritmo x1,08).

```
npx remotion render src/cei/index.ts CeiFull out/cei/parte1.mp4 --gl=angle --browser-executable=<chromium>
```

`timeline.json` es la única fuente de tiempos (escenas, zooms, tarjetas 3D, efectos y voz).
