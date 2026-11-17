# ¿Sabías que…? #01: la hacker de la pala

Dato curioso, unos 36 s con voz real. De día, colores cálidos, todo en movimiento. Lleva al **Fallo #03** (la nave que la NASA perdió por una unidad).
Gancho: en el fotograma 0 ya se ve todo (la abuela con la pala clavada en el cable que echa chispas) y el texto **ESTA ABUELA APAGÓ EL INTERNET DE UN PAÍS**.

## Guion para grabar
```
¿Sabías que una abuela de setenta y cinco años dejó sin internet a casi toda Armenia… con una pala?

Marzo de dos mil once, en Georgia: buscaba cobre para vender como chatarra.

Cavó y cavó, y en vez de cobre, cortó un cable de fibra óptica.

Ese cable llevaba internet a Armenia. El país se quedó desconectado durante horas, y parte de Georgia también.

La detuvieron, y la soltaron por su edad. La prensa la llamó: la hacker de la pala.

¿Algo tan pequeño puede tumbarlo todo? Pregúntale a la NASA: Fallo cero tres.

Sígueme: cada semana, un fallo nuevo.
```

## Versión ElevenLabs (pocas etiquetas)
```
[curious] ¿Sabías que una abuela de setenta y cinco años dejó sin internet a casi toda Armenia... con una pala?

Marzo de dos mil once, en Georgia: buscaba cobre para vender como chatarra.

[surprised] Cavó y cavó, y en vez de cobre, cortó un cable de fibra óptica.

Ese cable llevaba internet a Armenia. El país se quedó desconectado durante horas, y parte de Georgia también.

La detuvieron, y la soltaron por su edad. [laughs] La prensa la llamó: la hacker de la pala.

[mischievously] ¿Algo tan pequeño puede tumbarlo todo? Pregúntale a la NASA: Fallo cero tres.

Sígueme: cada semana, un fallo nuevo.
```

## Planos (dirección What If: atardecer, luz desde el sol bajo, un tamaño de plano distinto en cada corte)
1. Gran plano + título: la abuela a contraluz, la pala clavada, chispas bajo tierra. ¿SABÍAS QUE… UNA ABUELA APAGÓ UN PAÍS ENTERO?
2. Primer plano: su cara contra el sol, bokeh; 75 AÑOS.
3. Picado sobre Armenia: las pantallas de los celulares pasan de azul a gris (la luz eléctrica sigue: fue internet, no la luz).
4. Contrapicado: levanta la pala contra el sol.
5. Macro: la hoja muerde la tierra.
6. Gran plano: camina con la pala al hombro, sombra larga; 28·03·2011 · GEORGIA.
7. Cenital macro: cobre brillando en la tierra; COBRE = DINERO.
8. Plano medio: cava, dos paladas.
9. Cenital al hoyo: la hoja se eleva y cae sobre el cable: destello y chispas.
10. Plano detalle: las fibras de vidrio, su luz se apaga; FIBRA ÓPTICA.
11. Esquema: la línea de Georgia a Armenia se rompe; SIN CONEXIÓN.
12. Por encima del hombro de Mo: Pip en la azotea sin conexión; DURANTE HORAS.
13. Primer plano de Mo iluminado por el celular; Y PARTE DE GEORGIA.
14. Contrapicado: llega la patrulla, luces rojas y azules.
15. Primer plano: sonríe y saluda; LIBERADA.
16. Cenital: el periódico se asienta: LA HACKER DE LA PALA.
17. Cierre: ¿ALGO TAN PEQUEÑO PUEDE TUMBARLO TODO? y la puerta oscura del FALLO #03 (Marte, la sonda, LIBRAS ≠ NEWTONS). En "sígueme" el botón pasa a + SEGUIR, una mano lo pulsa: SIGUIENDO ✓ · UN FALLO NUEVO CADA SEMANA.

## Fuentes
- NPR (7 abr. 2011, "Little old lady with shovel disrupts internet in 2 nations"), IEEE Spectrum, Foreign Policy (6 abr. 2011), The Moscow Times (10 abr. 2011), The World/PRI ("hacker de la pala"), iTnews ("Granny takes down web in two countries").
- Duración: de "unas horas" (proveedores de Armenia: la mitad de sus clientes) a 12 horas según la fuente; por eso "durante horas" y "casi toda Armenia".
- El periódico de la animación es genérico ("LA NOTICIA"); no imita a ningún medio real.

## Cierre nuevo (pendiente de grabar la línea A6)
Problemas del cierre anterior: cuatro estímulos a la vez (marca, "Fallo #03", botón y texto) y un puente a la NASA sin hilo con la historia.

- **Línea nueva A6 (la única que se regraba, unos 4 s):**
  `Ese cable lo cortó una pala. El fallo número tres no necesitó ni eso.`
  Hilo: de un corte físico a un fallo que no necesitó herramienta (el #03 fue una unidad de medida mal puesta, sin nada físico).
- **En pantalla:** la palita cae sobre una ciudad iluminada y las luces se apagan en "pala"; "FALLO #03" como texto pequeño arriba (sin caja); un solo botón grande + SEGUIR que se pulsa al final. Sin marca, sin Marte, sin texto de suscriptores.
- **Cómo se integra:** `python3 tools/add_a6_sabias01.py nueva-a6.mp3`, luego `python3 tools/mkplan_sabias01.py`, el build y el render del tramo final.
