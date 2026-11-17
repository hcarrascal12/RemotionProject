# Carrusel 02: Llevas el celular en el bolsillo… y esto hace sin que lo notes

8 láminas, 1080x1350 (4:5). Archivos en `carrusel2/`. Código: `what-if-studio/src/carrusel01/Carrusel02.tsx` (frame n = lámina n+1):
`npx remotion still src/index.ts Carrusel02 out/carrusel02/slide-N.png --frame=N-1`

## Texto de la publicación (Facebook)
Llevas el celular en el bolsillo… y esto hace sin que lo notes.
Desliza: terremotos, Einstein, emergencias y vibraciones que no existen.
Fallos y curiosidades tecnológicas en menos de 1 minuto. Sigue la página.

Primer comentario: las fuentes de abajo.

## Datos por lámina y fuente
| Lámina | Dato | Fuente |
|---|---|---|
| 2 | El acelerómetro de teléfonos Android detecta la primera onda de un terremoto y avisa a otros usuarios (solo Android, cobertura desigual) | https://www.research.google/blog/android-earthquake-alerts-a-global-system-for-early-warning/ · https://www.livescience.com/technology/communications/google-has-turned-2-billion-smartphones-into-a-global-earthquake-warning-system-its-as-effective-as-seismometers-tests-show |
| 3 | Los relojes de los satélites GPS avanzan ~38 millonésimas de segundo al día (45 por gravedad − 7 por velocidad) y se corrigen antes del lanzamiento | https://www.astronomy.ohio-state.edu/pogge.1/Ast162/Unit5/gps · https://courses.ems.psu.edu/geog862/node/1714 |
| 4 | Crash Detection: iPhone 14 o más nuevo y Apple Watch; en Pixel desde el Pixel 3. Puede contactar a emergencias si no respondes. No detecta todos los choques (prueba del WSJ y aviso de Apple) | https://techcrunch.com/2022/09/07/apple-watch-series-8-has-new-sensors-that-can-detect-when-youre-in-a-car-crash · https://9to5google.com/2022/09/07/google-pixel-car-crash-detection/ · https://appleinsider.com/articles/22/09/30/iphone-14-wont-always-detect-when-youre-in-a-crash |
| 5 | El 112 está en el estándar GSM; los teléfonos GSM pueden marcarlo bloqueados y la red lo redirige al número local. Depende del país (algunos bloquean llamadas sin SIM) y de la cobertura | https://www.scienceabc.com/innovation/how-can-mobile-phones-make-emergency-calls-when-theres-no-network-coverage · https://www.southernphone.com.au/help/mobile/using-your-device/how-to-dial-emergency-number-when-you-are-overseas · https://3gpp.org/FTP/tsg_sa/TSG_SA/TSGS_23/Docs/PDF/SP-040083.pdf |
| 6 | AML: al llamar a emergencias el teléfono activa la ubicación y la envía a los servicios. Android (Emergency Location Service, puede requerir activarlo); iPhone desde iOS 11.3. Varía por país | https://eena.org/advanced-mobile-location/ · https://9to5mac.com/2017/08/10/advanced-mobile-location-iphone-emergency-services/ · https://triplezero.gov.au/triple-zero/How-to-Call-000/advanced-mobile-location |
| 7 | Vibración fantasma: 68 % (115 de 169) del personal médico en un estudio de 2010; otros estudios, de ~30 % a 95 % | https://www.bmj.com/content/341/bmj.c6914.long |

## Cuidado
- No hay confirmación actual del estado del AML en el 911 de EE. UU. ni en iPhone allí: la lámina dice "varía por país".
- El 112 sin SIM no está garantizado en todos los países.
- Crash Detection no es infalible; la lámina lo dice.
- La cifra "kilómetros al día" del GPS sin corrección viene de una fuente menos académica; la lámina dice "kilómetros" sin número.
