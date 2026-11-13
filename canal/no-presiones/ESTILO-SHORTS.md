# Estilo de los Shorts de No Presiones (receta del Fallo #01, para repetir desde el #02)

Todo lo que sigue se aplicó al Fallo #01 y se mide o se comprueba en el borrador. Cada Short nuevo debe pasar esta lista.

## 1. Los primeros 3 segundos (detener el scroll)
- Frame 0 ya se mueve: encendido de CRT (0,2 s) y zoom de 1,25 a 1,0 con muelle hacia el objeto clave (en el #01, la tecla ENTER).
- Un contador sube con la primera frase de la voz y llega a su cifra justo en la palabra clave (el año).
- Cartel de alerta + título de dos golpes ("NO PRESIONES / ESA TECLA") con muelle rígido y rebote.
- Sonido de gancho en el segundo 0 (golpe grave + latidos); la música baja cuando entra la voz.
- Primer corte hacia el segundo 3. El sello del canal (botón NO) entra 1,4 s y sale; nunca más de 1,5 s.
- Por si el feed usa el frame 0 como portada: que se lea completo y no esté en blanco.

## 2. Ritmo y cámara
- Cero pantallas estáticas: cada plano alterna acercamiento (1,04 a 1,12) y alejamiento, con un paneo lento de dirección distinta.
- Acercamientos del 5 % sobre palabras clave (entran con muelle, vuelven en 1 s).
- Un cambio visual cada 2 a 3 s; planos entre 1,3 y 4,8 s; menos de 17 planos en 45 s.
- Alternar planos narrativos (N) e impactantes (I); nunca más de dos iguales seguidos.
- Muelles con ligero rebote en tarjetas, iconos y textos. Nada entra de forma lineal.

## 3. Texto y tiempos de lectura
- Subtítulos de 2 a 3 palabras, enormes, con contorno negro y sombra dura; palabra clave amarilla o roja.
- Los límites de cada grupo se ajustan a las pausas reales de la voz, no a una estimación.
- Ningún cartel o sello clave dura menos de 1,2 s; de 8 a 12 frames de respiro antes de cortar.
- Nunca un cartel o frase clave sin sonido: el silencio total se rellena con tensión (música, latidos, subida).

## 4. Clímax
- En el momento del error/fallo, el clima cambia: fondo más oscuro, viñeta roja que late, temblor suave de cámara y
  desdoble de color con desgarro lateral en el texto del terminal.
- El sello del impacto ("MORTAL") se queda al menos 1,3 s con golpe de escala y micro-temblor.
- Un dato nuevo en pantalla cuando la voz lo dice (en el #01: "DOSE DELIVERED: 6 RAD").

## 5. Cierre
- Sin subtítulos debajo durante la pregunta final.
- Pregunta binaria dicha en voz y en pantalla, con las dos respuestas en una balanza que se inclina al decir cada una.
- "TE LEO EN LOS COMENTARIOS" + "NO PRESIONES / FALLO #0N" (visible, por encima de los 340 px inferiores).
- El último fotograma enlaza con el primero (bucle).

## 6. Voz y sonido
- Siempre la misma voz. Pausas entre frases = las del audio original (no recortarlas).
- 105 a 115 palabras para unos 45 s; ritmo de narrador cercano, sin dramatismo; firma: "Nadie pensó qué pasaría".
- Mezcla a -14 LUFS, música unos 9 dB bajo la voz (bajando 6 dB al hablar), unos 100 efectos de sonido en 45 s
  (silbidos en los cambios de plano, latidos, subidas, clics), todos bajos para no tapar la voz.

## 7. Zonas seguras (TikTok, Reels, Shorts)
- Arriba 250 px y abajo 340 px los cubre la interfaz; los botones de la derecha, desde unos 940 px de ancho.
- Subtítulos y carteles entre 250 y 1560. Sello del canal y firma de cierre por encima de los 340 px inferiores.

## 8. Contenido y verdad
- Cada cifra con su fuente primaria y su autoría en pantalla si es una estimación (ej. "estimación de Parametrix").
- Nada de motivos no confirmados. Lo simbólico se aclara en la descripción.
- Sin tecnicismos: se entiende con saber qué es un botón y una pantalla.

## 9. Producción (para no perder horas)
- Cerrar la imagen antes del render final; el audio se mezcla aparte y se cambia en segundos.
- Evitar capas a pantalla completa con mezcla `screen`/desenfoque (multiplican el tiempo de render por 3 a 7).
- Render final a 1080x1920 y 60 fps en trozos de 300 fotogramas, dos a la vez con 2 hilos cada uno.
- Exportar TikTok (60 fps) e Instagram (30 fps) con `tools/export_redes.sh`.

## 10. Miniatura y portadas
- Dos o tres palabras que no repiten el título, con un número o un nombre; una cara o un objeto con emoción.
- Texto en el tercio superior, personaje debajo, "FALLO #0N" arriba a la izquierda, tecla ENTER a la izquierda.
- Minimalista: sin carteles ni textos extra de fondo.
- Versión para Instagram con todo dentro de la franja central 3:4.
