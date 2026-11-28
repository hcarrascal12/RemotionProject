# Caso Nº 06 · Polybius — clips de vídeo (b-roll): estado, fuentes y prompts

La composición `Caso06Polybius` ya tiene cuatro huecos para vídeo. Sin clips usa fotos, capturas y animaciones. Con clips, se activan con `--props='{"clips":true}'` y se ven a pantalla completa, atenuados, detrás de los titulares y las tarjetas.

## Estado (28-nov-2026): no hay vídeo de archivo real de Polybius, y no puede haberlo
- Polybius nunca existió (Skeptoid, Inverse, Wikipedia), así que no hay grabaciones reales del juego ni de «máquinas Polybius». Cualquier vídeo que lo muestre es una recreación o un juego distinto, y hay que rotularlo así.
- No encontré con las herramientas de esta sesión vídeo libre de salas de arcade de Portland en 1981.
- Bloqueos de esta sesión: Wikimedia Commons responde 429 (límite de peticiones) a la IP del contenedor, `archive.org` no se puede descargar (el proxy lo bloquea) y Apify no devuelve archivos binarios grandes. Por eso no descargué ningún clip real. Si más tarde se levanta el límite, se puede reintentar.

## Huecos en la composición
| Archivo (en `what-if-studio/public/polybius08/clips/`) | Plano | Duración que se ve | Qué debe mostrar |
|---|---|---|---|
| `01-sala-arcade-1981.mp4` | Leyenda · «AMNESIA» | 1,3 s | Sala de arcade oscura, años 80, luces de neón, sin gente reconocible |
| `02-cabinete-crt-brillando.mp4` | Leyenda · «PORTLAND» | 1,2 s | Cabinete negro con la pantalla CRT encendida parpadeando |
| `03-pantalla-vector-parpadeo.mp4` | Piezas reales · «MIGRAÑA» | 1,5 s | Primer plano de una pantalla vectorial de arcade con destellos |
| `04-hombres-de-negro-silueta.mp4` | Piezas reales · «APUESTAS» | 2,4 s | Siluetas de dos hombres con abrigos oscuros junto a una máquina (el «hombre de negro» de la leyenda) |

Formato: MP4 H.264, vertical 9:16 (idealmente 1080×1920), sin audio, de 4 a 5 s cada uno (el clip arranca al empezar el plano).

## Opción A · Clips reales de licencia libre (de otros juegos; hay que rotularlos)
Ninguno muestra Polybius. Sirven como «arcade de la época» con un rótulo claro.
- **Atari Battlezone (1980) repair, part 1 y part 2**, de Robert Baruch, CC BY 3.0, en Wikimedia Commons:
  https://commons.wikimedia.org/wiki/File:Atari_Battlezone_arcade_(1980)_repair,_part_2.webm
  Son archivos enormes (1,3 y 2,5 GB). Hay que descargar el original y cortar 4–5 s de pantalla vectorial encendida. Rótulo en pantalla: «BATTLEZONE (ATARI, 1980) · NO ES POLYBIUS · VÍDEO: ROBERT BARUCH · CC BY 3.0».
- **Grabaciones de juegos de arcade** (Internet Archive, licencia CC BY 4.0 en cada ficha; verificar la licencia y el autor antes de usar): por ejemplo `vanguard-ii-snk-arcade-pal-gameplay-full-game-longplay-recorded-by-archive` (1984) o `green-beret-konami-arcade-pal-gameplay-full-game-longplay-recorded-by-zeusdaz` (1985). Son grabaciones modernas de juegos de los 80, no vídeo de 1981. Rótulo: «JUEGO DE LA ÉPOCA · NO ES POLYBIUS · <autor> · CC BY 4.0».
- Los créditos van en pantalla y en la descripción de YouTube.

## Opción B · Recreaciones generadas con IA (como hacen los ganadores analizados)
Rotular siempre «RECREACIÓN». Reglas del canal: sin niños en situaciones de daño, sin logotipos ni marcas, sin personas reconocibles, sin cifras ni textos inventados dentro de la imagen.

Prompts (en inglés, para Veo, Gemini, Runway u otra herramienta; ajustar a lo que acepte cada una):
1. `Vertical 9:16, cinematic, 1981 video arcade at night, dark room, glowing neon signs and a row of black upright arcade cabinets, soft smoke, slow dolly forward, 35mm film grain, no people, no readable text, no logos.`
2. `Vertical 9:16, close-up of a black 1980s upright arcade cabinet in a dark room, its green-tinted CRT screen flickering with abstract geometric shapes, scanlines, subtle camera push-in, film grain, no people, no readable text, no logos.`
3. `Vertical 9:16, extreme close-up of a vector-graphics arcade monitor, glowing green and red wireframe lines flashing and rotating, phosphor glow, slight screen curvature, no readable text, no logos.`
4. `Vertical 9:16, two silhouetted men in long dark coats standing beside an arcade cabinet in a dim room, backlit by the cabinet's glow, slow camera move, noir mood, faces not visible, no readable text, no logos.`

El repo ya usa imágenes de Gemini (`canal/no-presiones/fuentes-gemini/`), así que se puede seguir ese flujo.

## Cómo integrarlos
1. Poner los cuatro MP4 en `what-if-studio/public/polybius08/clips/` con esos nombres exactos.
2. Vista previa: `npx remotion still src/index.ts Caso06Polybius out.png --frame=170 --props='{"clips":true}'`.
3. Render final: añadir `"clips":true` (y `"audio":true` cuando exista la voz) a `--props`.
4. Si falta algún archivo, ese plano mostrará un error de Remotion; entonces hay que quitar `"clips":true` o crear el archivo.
5. Si se usa la opción A, añadir el rótulo y el crédito al plano correspondiente (lo hago yo cuando me digan qué clips usan).
