# Caso Nº 06 · Polybius (mito de internet, con la fórmula de los ganadores) — guion, hechos y fuentes

Estado: guion y hechos listos y composición `Caso06Polybius` creada, sin voz (28-nov-2026). Código en `what-if-studio/src/polybius08/` (`theme.ts` con los tiempos estimados por escena, `scenes.tsx`, `Polybius08.tsx`); registrada en `src/Root.tsx`. Para añadir la voz: `public/polybius08/mix.wav` y render con `--props='{"audio":true}'`; reajustar `SCENES` en `theme.ts` a `words.json`. Vista previa: `npx remotion still src/index.ts Caso06Polybius out.png --frame=N` (en esta sesión hay que añadir `--browser-executable=/opt/pw-browsers/chromium --chrome-mode=chrome-for-testing --gl=swangle`). Falta: voz en ElevenLabs (la graba el usuario), imágenes con licencia y la composición `polybius08` (se construye después de la voz, igual que Momo, para ajustar los tiempos a `words.json`).

Duración objetivo: 40 s (v4; el borrador de 50 s «iba muy rápido», así que se recortó contenido y se alargaron los planos). Un solo cambio frente a Momo: la estructura. No cambiar otras cosas a la vez.

## Fórmula aplicada (de los Shorts ganadores analizados)
1. Gancho de "imposible" con el material ya en pantalla (0–3 s).
2. Pruebas visibles, una por plano: sin revistas, sin archivo, sin empresa, la primera página.
3. Giro después de desmontar: el mito se armó con piezas reales.
4. Lista de 3 preguntas para dudar de un mito (razón para guardar el video).
5. Una sola pregunta final, que enlaza con el primer frame (bucle).

## Guion para ElevenLabs (v4, ~108 palabras, ~40 s; medir con la voz real y recortar pausas si pasa de 42 s)
```
[serious] Hay gente que jura haber jugado un videojuego de 1981… pero nadie ha encontrado una sola máquina. [pause] Se llamaba Polybius. Decían que enfermaba a los niños, en Portland. [pause] Las revistas de la época no lo mencionan. Ni un archivo del juego. De su empresa, ni rastro. [pause] La primera página es de coinop.org. En 2003 seguía pidiendo: «necesitamos información». [pause] Pero había piezas reales. En 1981, dos jugadores se sintieron mal el mismo día, en la misma sala. Diez días después, allanaron salas por apuestas ilegales. [pause] Inverse concluyó que se inventó casi seguro para promocionar esa web. [pause] ¿Fuente de la época? ¿Existe el objeto? ¿Quién lo contó primero? [pause] ¿Lo conocías… o te lo creíste?
```
Cambios frente a la v3 (a petición del usuario, «va muy rápido, déjalo en 40 s»): se recortó contenido en vez de acelerar. Se quitó «fecha 1998 dudosa», «Para dudar de un mito:» (queda como titular en pantalla) y detalles de las salas. Menos planos y más largos.
- Sin etiquetas de susurro. Voz grabada por el usuario con ElevenLabs.
- Si la voz lee mal "Polybius", escribirlo «Polibius» solo en el texto para la voz; en pantalla va "POLYBIUS".

## Plano a plano (composición `Caso06Polybius`, 1200 frames = 40 s)
| Frames | Voz | Pantalla |
|---|---|---|
| 0–160 | «Hay gente que jura haber jugado un videojuego de 1981… nadie ha encontrado una sola máquina.» | Cabinete (maqueta) con glitch y el contador «MÁQUINAS ENCONTRADAS: 0» desde el frame 0 |
| 160–270 | «Se llamaba Polybius. Decían que enfermaba a los niños, en Portland.» | 2 planos: pantalla de título real en un CRT → clip de sala de arcade con «PORTLAND · AMNESIA · CONVULSIONES · ALUCINACIONES» |
| 270–450 | «Las revistas no lo mencionan. Ni un archivo. De su empresa, ni rastro.» | 2 planos: rejilla de portadas tachadas (0 menciones) → terminal «0 resultados» ×2 y sello «SIN PRUEBAS» |
| 450–590 | «La primera página es de coinop.org. En 2003 seguía pidiendo: necesitamos información.» | Captura real (Wayback, abr-2003) con zoom a «We need information.» y a la última línea |
| 590–890 | «Pero había piezas reales… dos jugadores… diez días después, allanaron salas por apuestas ilegales.» | 4 planos: año que rueda a 1981 → clip vectorial «MIGRAÑA» → foto de Asteroids «28 HORAS» → clip de hombres de negro «+10 DÍAS · APUESTAS ILEGALES» |
| 890–1010 | «Inverse concluyó que se inventó casi seguro para promocionar esa web.» | Cita literal de Inverse que se escribe y se resalta |
| 1010–1130 | «¿Fuente de la época? ¿Existe el objeto? ¿Quién lo contó primero?» | 3 tarjetas numeradas sobre el clip del cabinete encendiéndose |
| 1130–1200 | «¿Lo conocías… o te lo creíste?» | Pregunta sobre el cabinete; el último frame es idéntico al frame 0 (bucle) |

Datos de pantalla añadidos que la voz no dice (de Skeptoid #362): un jugador con migraña tras jugar a Tempest; otro con malestar tras 28 horas jugando a Asteroids. No se nombran ni se da la edad de los jugadores.

## Verificación de hechos (28-nov-2026, contra las fuentes citadas por Wikipedia)
Fuentes leídas completas: Skeptoid #362, Brian Dunning (14-may-2013, https://skeptoid.com/episodes/362) e Inverse, Ryan Houlihan (31-oct-2020, https://www.inverse.com/input/gaming/polybius-is-real-video-game-urban-legend). Además, el artículo de Wikipedia «Polybius (urban legend)». No pude abrir el libro de Dunning (2018), la nota de Snopes ni los periódicos de 1981.

| Afirmación del guion | Resultado | Fuente |
|---|---|---|
| 1981, Portland, juego que enfermaba a niños (según la leyenda) | Confirmado como leyenda | Skeptoid, Inverse, Wikipedia |
| Nadie ha encontrado una máquina; no hay ROM | Confirmado | Wikipedia; Skeptoid (nadie en la comunidad de arcades dice tener una) |
| Las revistas de la época no lo mencionan | Confirmado | Skeptoid: revisó todos los números de Electronic Games de 1981 a 1984 y no hay mención; no halló referencias impresas antes de 2003 |
| Sin rastro de la empresa Sinneslöschen | Confirmado | Inverse: sin evidencia en Alemania, EE. UU. ni Japón. Skeptoid: alemán «no del todo idiomático» |
| Primera página: coinop.org, fecha 1998 que algunos creen falsa | Confirmado con matiz | Skeptoid: entrada del 3-ago-1998, pero «algunos investigadores creen que es una fecha por defecto y que se creó el 6-feb-2000». Inverse: apareció el 6-feb-2000. Wikipedia: una copia de 2000 dice «anyone heard of this game?» |
| En 2003 la misma página seguía diciendo «We need information.» | Confirmado | Copia de Wayback del 29-abr-2003 (captura real del usuario y texto leído con Apify) |
| Dos jugadores se sintieron mal el mismo día, en la misma sala, en 1981 | Confirmado | Skeptoid (basado en Eugene Register-Guard, 29-nov-1981, y Retrocade, abr-2012): un adolescente con migraña jugando Tempest y otro con malestar tras 28 h de Asteroids |
| Diez días después, allanamientos por apuestas ilegales | Confirmado, con corrección | Skeptoid: allanaron «agentes estatales, locales y federales», no solo el FBI. Por eso el guion dice «las autoridades» |
| (Ya NO está en el guion) La copia de 2000 «solo pregunta: ¿alguien conoce este juego?» | Confirmado | Wayback Machine, copia del 3-mar-2000 de `clickto.com/coinop/GamePage/Polybius.html` (la cita 10 de Wikipedia): «Last Modification of this game: 2/6/2000 10:23:41 AM · Reason for modification: New addition - anyone heard of this game?». Esa copia no muestra ninguna fecha de 1998. Ojo: la copia más antigua de la URL `coinop.org/g.aspx/103223/Polybius.html` es del 29-abr-2003 |
| Inverse concluyó que se inventó casi seguro para promocionar la web | Confirmado, es opinión de Inverse | Inverse: «almost certainly invented by Kurt Koller to promote his website». Antes dice que el autor del post es alguien «believed» (no confirmado). No nombrar a Koller en el video |

Discrepancias y cosas que NO se dicen en el video:
- La propia página de coinop.org (copias de 2000 y 2003) dice «Until the ROM showed up» y que el juego trae «(C) 1981 Sinneslöschen», pero nunca se ha publicado ese ROM. No lo usamos como prueba, solo como dato de contexto.
- GamePro «Secrets & Lies»: Wikipedia dice septiembre de 2003; Skeptoid lo cita como octubre de 2003. Solo decir «2003» si se vuelve a usar.
- El «Steven Roach» de 2006: Inverse cuenta que Stuart Brown (Ahoy) afirma que su relato es inventado. No usarlo como hecho.
- Fallecimientos en arcades (Berzerk) y los nombres de los jugadores: no se mencionan (regla del canal: sin casos concretos de menores).
- Hay datos contradictorios sobre el origen exacto del nombre; el video no afirma de dónde salió «Polybius».
- Sí es cierto y útil como giro: la leyenda se armó con piezas reales (los dos jugadores, los allanamientos). Dunning: «cuanto más cerca de la verdad, más larga vida tiene una leyenda urbana».

## Imágenes (descargadas en `what-if-studio/public/polybius08/`)
| Archivo | Qué es | Licencia | Cómo acreditar |
|---|---|---|---|
| `cabinete-DocAtRS-CC-BY-SA-3.0.jpg` (446×1002) | Foto de una **maqueta** de cabinete «Polybius» de la colección Rogue Synapse (2007) | CC BY-SA 3.0 | En pantalla: «Maqueta · foto: DocAtRS (Rogue Synapse) · CC BY-SA 3.0» y repetir en la descripción con el enlace a https://creativecommons.org/licenses/by-sa/3.0. Rotular siempre «MAQUETA», nunca como máquina original. Si se modifica, indicarlo |
| `asteroids-Joho345-CC-BY-4.0.jpg` (1280×1707) | Foto de un cabinete real de Asteroids, **actual** (no de 1981), en una sala de evento. Se usa solo en el plano «28 HORAS» | CC BY 4.0 | En pantalla: «FOTO: JOHO345 · CC BY 4.0 · CABINETE ACTUAL, NO DE 1981». Repetir en la descripción con el enlace https://commons.wikimedia.org/wiki/File:Asteroids_cabinet.jpg y la licencia https://creativecommons.org/licenses/by/4.0/ |
| `coinop-titulo.jpeg` (255×302) | Pantalla de título supuesta («© 1981 Sinneslöschen Inc.», «Credits 0») tal como aparece en coinop.org | Commons: dominio público por ser solo texto/formas simples, con etiqueta de marca registrada | Rotular «CAPTURA DE COINOP.ORG». Es muy pequeña: usarla a tamaño reducido o ampliada con aspecto de pantalla antigua, sin presentarla como foto real de una máquina |

Ambas se bajaron de upload.wikimedia.org. Intenté descargarlas con Apify (`apify/web-fetch`, formato `raw`): devuelve los bytes como texto en base64 y la respuesta de la foto de 225 KB se corta a ~256 KB, así que quedó incompleta. Por eso las descargué directamente con `curl` desde las mismas URLs. Con Apify sí leí las páginas de licencia de Commons, Skeptoid e Inverse.

Pendiente de imágenes:
- Captura REAL recibida del usuario: `coinop-wayback-2003-real.png` (1920 px de ancho). Es la copia de la Wayback Machine del 29-abr-2003 (`web.archive.org/web/20030429175240/http://coinop.org:80/g.aspx/103223/Polybius.html`; coincide con el texto que leí: comentario de Lady_Eboshi del 2-mar-2003, «Until the ROM showed up», «(C) 1981 Sinneslöschen»). La imagen no muestra la barra de Wayback, así que en pantalla hay que rotular «COPIA ARCHIVADA · ABR 2003 · WAYBACK MACHINE». NO contiene la línea «anyone heard of this game?» (esa solo está en la copia de 2000); sí contiene «If anyone has heard any additional information about this game, we'd appreciate hearing about it.» y «We need information.». El guion v2 cita «We need information.», que sí está en esta captura.
- La recreación de la copia de 2000 se descartó y se borró del repo: el video usa solo la captura real de 2003.
- Mapa de Portland: reutilizar el estilo de `momo07/mapa.png`.
- Todo lo recreado va rotulado «RECREACIÓN».

## Publicación
- Título: sin revelar el giro. Ejemplo: «Polybius: el videojuego que enfermaba a los niños (¿o no?)».
- Pregunta final en el comentario fijado, no en el caption (regla del canal): «¿Lo conocías o te lo creíste?».
- Medir a las 10 h y 24 h: «se quedaron viendo» (Momo: 56%), % visto, vistas, comentarios. Meta: superar 2K vistas.
