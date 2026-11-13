# TikTok e Instagram: Fallo #01 (Therac-25)

El mismo vídeo sirve en las tres plataformas, pero cada una lo lee distinto. En YouTube hay título y descripción; en
TikTok e Instagram **la descripción es el título**, y solo se ven las primeras líneas.

## Archivos
| Para | Archivo | Nota |
|---|---|---|
| YouTube Shorts | `therac25-final.mp4` (1080×1920, 60 fps) | tal cual sale del render |
| TikTok | `redes/tiktok-1080x1920-60fps.mp4` | 60 fps, unos 12 Mbps |
| Instagram Reels | `redes/instagram-reels-1080x1920-30fps.mp4` | 30 fps, unos 10 Mbps |
| Portada TikTok / YouTube | `miniatura/miniatura-9x16-1080x1920.png` | ERROR 54, tecla ENTER, FALLO #01 |
| Portada Instagram | `miniatura/miniatura-instagram-portada-1080x1920.png` | todo lo importante dentro de la franja central 3:4 (cuadrícula del perfil) |
| Miniatura YouTube 16:9 | `miniatura/miniatura-16x9-1280x720.png` | solo para vídeos largos o la búsqueda de escritorio |

Los dos archivos de `redes/` se generan con `bash tools/export_redes.sh` cuando termina el render final.

## Zonas seguras (ya aplicadas en el vídeo)
Las apps cubren la parte de arriba (unos 250 px) y de abajo (unos 340 px) de los 1920, y los botones de la derecha
(desde unos 940 px de ancho). Los subtítulos y los carteles clave están entre 250 y 1560. El sello del canal sale junto
al contador del gancho y "NO PRESIONES / FALLO #01" del cierre queda por encima de los 340 px inferiores.

## TikTok
**Descripción** (las dos primeras líneas son las que se ven; límite 4000 caracteres):
```
1986. Un solo clic. Una máquina de radioterapia que falló y el manual no explicaba por qué. 👇
¿De quién fue la culpa: del operador o de los creadores? Te leo.
Fuente: Leveson y Turner (1993).
#Therac25 #FallosTecnologicos #HistoriaDeLaTecnologia #Fallo01
```
- **Hashtags:** 3 a 5. Más no ayudan y ensucian el texto.
- **Comentario fijado:** `¿Operador o creadores? Cuéntamelo y te leo. 👇`
- **Portada:** sube `miniatura-9x16-1080x1920.png` o elige el fotograma de "ERROR 54" (hacia el segundo 23).
- **Etiqueta de contenido generado por IA:** actívala. La voz y las ilustraciones son sintéticas y TikTok pide declararlo
  en contenido realista. Comprueba el nombre exacto de la opción en tu versión de la app.
- **Sonido:** deja el audio original del vídeo (voz, música y efectos ya mezclados a -14 LUFS).

## Instagram Reels
**Descripción** (se ven unos 125 caracteres antes de "más"; límite 2200):
```
1986. Un solo clic y una máquina que falló. ¿De quién fue la culpa? 👇

El manual no explicaba el "Error 54". El operador pulsó continuar y la máquina volvió a disparar.
¿Del operador o de los creadores? Te leo en los comentarios.

Fuente: Leveson y Turner (1993), "An Investigation of the Therac-25 Accidents", IEEE Computer.

#Therac25 #FallosTecnologicos #HistoriaDeLaTecnologia
```
- **Hashtags:** 3 a 5; Instagram recomienda pocos.
- **Portada:** sube `miniatura-instagram-portada-1080x1920.png`. Está pensada para que el recorte de la cuadrícula del
  perfil (franja central 3:4) no corte "ERROR 54" ni la tecla ENTER.
- **Texto alternativo:** `Dibujo animado de un paciente tumbado bajo una máquina de radioterapia, con el texto Error 54.`
- **Compartir en el feed:** actívalo, para que aparezca en la cuadrícula del perfil.
- **Etiqueta de IA:** si la app ofrece la opción de indicar contenido generado con IA, actívala.
- **Fotogramas:** Instagram procesa los Reels a 30 fps; por eso el archivo de Instagram sale a 30 fps.

## Biografías (ya redactadas en `TEXTOS-PARA-PEGAR.md`)
- **TikTok** (67 de 80 caracteres): `Errores reales de tecnología. Una historia por vídeo. ¿Cuál cuento?`
- **Instagram** (122 de 150 caracteres): ver `TEXTOS-PARA-PEGAR.md`.
- **Handle:** el mismo en las tres plataformas, `@nopresiones`. Compruébalo antes de publicar; en TikTok e Instagram no lo
  he verificado.

## Orden de publicación sugerido
1. YouTube Shorts primero (es donde está el canal y la serie).
2. TikTok e Instagram el mismo día, con el archivo y la descripción de cada uno.
3. Responde a los comentarios de las dos primeras horas: es cuando más pesa para el alcance.
