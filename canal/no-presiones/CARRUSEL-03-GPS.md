# Carrusel 03: El GPS no te dice dónde estás, te dice qué hora es

8 láminas, 1080x1350 (4:5). Archivos en `carrusel3/`. Código: `what-if-studio/src/carrusel01/Carrusel03.tsx` (frame n = lámina n+1):
`npx remotion still src/index.ts Carrusel03 out/carrusel03/slide-N.png --frame=N-1`

## Texto de la publicación (Facebook)
¿Sabías que el GPS no te dice dónde estás? Calcula dónde estás midiendo el tiempo.
El satélite solo emite su posición y la hora exacta. Tu teléfono mide cuánto tardó la señal y hace el resto.
Desliza: la fórmula, por qué hacen falta 4 señales y qué pasa si el reloj se desvía.
Fallos y curiosidades tecnológicas en menos de 1 minuto. Sigue la página.

## Ajustes tras la revisión
- Lámina 2: el giro ("Tu teléfono solo escucha / no le envía nada") pasa a título grande; posición y hora exacta quedan como detalle pequeño.
- Lámina 6: título "Un reloj desviado = kilómetros de error".
- Láminas 5 y 6: texto pequeño acortado (una línea cada una) para que la escalada ns → cm y µs → km se lea rápido.
- Lámina 8: el recap incluye el matiz: "El GPS no te vigila, tus apps pueden".

## Cambios respecto a la idea original
- Se añadió una lámina de matiz (7): el GPS en sí solo recibe, pero las apps con permiso de ubicación sí pueden compartirla. Evita el mensaje "nadie te vigila" sin más.
- El cierre "¿Creías que te estaban viendo? 👇" se cambió por "Tu mapa no te ve. Calcula." para no pedir comentarios.
- La lámina de los 4 satélites dice "tres fijan la posición; la cuarta corrige el reloj del teléfono" (con 3 hay una posición aproximada y con advertencia).

## Datos por lámina y fuente
| Lámina | Dato | Fuente |
|---|---|---|
| 2 | Los satélites emiten radioseñales con su posición, estado y hora precisa de relojes atómicos; el receptor no envía nada, solo escucha | https://www.gps.gov/multimedia/poster/poster-web.pdf · https://www.foxnews.com/tech/how-does-gps-work |
| 3 | El receptor anota la hora de llegada y calcula la distancia: distancia = velocidad × tiempo | https://www.gps.gov/multimedia/poster/poster-web.pdf |
| 4 | Tres satélites fijan latitud, longitud y altura; el cuarto resuelve el error del reloj del receptor | https://en.wikipedia.org/wiki/Pseudorange · https://www.livescience.com/33783-gps-work-llmmp.html · https://www.gim-international.com/content/article/gps-position-time-and-distance |
| 5 | 1 ns de error de tiempo ≈ 30 cm de error de distancia; satélites con relojes atómicos, receptores con cuarzo que se reajusta con la señal | https://www.gim-international.com/content/article/gps-position-time-and-distance · https://www.esa.int/articles/what-about-errors |
| 6 | Los relojes de los satélites ganarían ~38 µs al día por relatividad y se corrigen a propósito; 38 µs × 299.792 km/s ≈ 11 km (cálculo propio) | https://www.astronomy.ohio-state.edu/pogge.1/Ast162/Unit5/gps · https://courses.ems.psu.edu/geog862/node/1714 |
| 7 | GPS = sistema de solo recepción (gps.gov, FHWA). Que las apps pueden usar tu ubicación con permiso es consejo general, sin fuente específica | https://gps.gov/systems/gps |

## Cuidado
- Para la lámina 4: algunas fuentes dicen que con tres satélites hay un fix aproximado; la lámina usa la formulación estándar.
- Los 11 km de la lámina 6 son un cálculo (tiempo × velocidad de la luz), no una cifra citada; la lámina lo indica.
- El teléfono también usa Wi-Fi y antenas móviles para ubicarse más rápido; no se menciona para no complicar.
