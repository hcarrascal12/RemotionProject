# Sin resolver · Caso Nº 01 · Cicada 3301 · Parte 2 (≈36 s, sin voz todavía)

Composición `Cicada01P2` en `what-if-studio/src/cicada01/Cicada01.tsx`; sonido `tools/cicada02_audio.py` (tu pista de Suno desde 1:06 + efectos).

## Escenas
| Tiempo | Escena | En pantalla |
|---|---|---|
| 0:00–0:03 | Gancho | Cartel con QR (recreación) en la calle + "¿A DÓNDE LLEVABA ESTE QR?" |
| 0:03–0:07 | La imagen | "everywhere" (recreación) → «EN TODAS PARTES» |
| 0:07–0:12 | El mensaje oculto | Transcripción: "You've shared too much… We want the best, not the followers." → «HAN COMPARTIDO DEMASIADO. QUEREMOS A LOS MEJORES» |
| 0:12–0:15 | Solo los primeros | Muro de pantallas que se apagan hasta quedar 3 → "SOLO LOS PRIMEROS TENDRÍAN PREMIO" |
| 0:15–0:19 | El sitio en Tor | `sq6wmgv2zcsrix6t.onion`, mensaje único cifrado → «NO COLABOREN» |
| 0:19–0:24 | La invitación | "LOS QUE LLEGARON AL FINAL RECIBIERON UNA INVITACIÓN" + "Lo que pasó después nunca se confirmó" |
| 0:24–0:29 | El último mensaje | Transcripción: "We have now found the individuals we sought. Thus our month-long journey ends." |
| 0:29–0:31 | "FOR NOW." | Golpe: «POR AHORA» |
| 0:31–0:36 | Cierre | "UN AÑO DESPUÉS… VOLVIERON." + PARTE 3 |

## Guion para ElevenLabs (Eleven v3, estabilidad Natural, sin susurros)
```
[serious] ¿A dónde llevaba este código?

A una imagen con una sola palabra: [short pause] «en todas partes».

Y dentro, otro mensaje oculto: [short pause] «Han compartido demasiado. Queremos a los mejores, no a los seguidores».

Solo los primeros tendrían premio.

Los que llegaron entraron a un sitio oculto en la red Tor. [short pause] Cada uno recibió un mensaje cifrado distinto, [short pause] y una orden: [short pause] «no colaboren».

A los que llegaron al final les llegó una invitación. [short pause] Lo que pasó después nunca se confirmó.

Un mes después, 3301 se despidió: [short pause] «Ya encontramos a quienes buscábamos». [long pause] [mysterious] «Por ahora».

[serious] Un año después... [short pause] volvieron.
```
(Si el número 3301 lo lee mal, escríbelo "tres mil trescientos uno".)

## Datos y fuentes (verificados)
- Cada QR llevaba a una imagen en 845145127.com con el logo de la cigarra y la palabra "everywhere"; dentro, con OutGuess, un mensaje firmado con PGP con códigos de libro y el aviso "You've shared too much to this point. We want the best, not the followers. Thus, the first few there will receive the prize." (Uncovering Cicada Wiki, "What Happened (2012)", con enlaces a pastebin).
- Los primeros recibieron por correo un número para entrar a `sq6wmgv2zcsrix6t.onion/NUMERO`, con un mensaje cifrado con RSA distinto para cada uno: "You are not to collaborate." (misma fuente).
- Hacia el 6 de febrero de 2012, quienes completaron la prueba recibieron un correo: no habría más acertijos y los invitaban a un servicio oculto de Tor con usuario y contraseña. Lo que pasó después no está documentado (misma fuente).
- Mensaje final en Reddit ("Valēte!"): "We have now found the individuals we sought. Thus our month-long journey ends. For now." (misma fuente).
- La segunda ronda empezó el 4 de enero de 2013 (Wikipedia, "Cicada 3301").
- "everywhere" y el QR son recreaciones; están rotuladas en pantalla.
