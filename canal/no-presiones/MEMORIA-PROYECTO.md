# Memoria del proyecto · No Presiones / «Casos reales de internet»

Resumen estructurado de lo trabajado en la conversación (hasta el 28-nov-2026). No es una transcripción literal.

## Identidad del canal
- Nombre: «No Presiones», reposicionado como **«Casos reales de internet»** (bio, portada, banner). El usuario NO quiere «sin resolver» en bio/portada.
- Formato: vídeos verticales 1080x1920, ~38 s, estilo del Caso Nº 04 (gato) = **estándar del canal**: tablero de papel, fotos 3D, cinta de rotuladora (Dymo) con acento rojo, bucle final.
- Canal pequeño (19 suscriptores, ~8-9 vídeos en YouTube al 27-nov). Redes: YouTube Shorts, Instagram, TikTok, Facebook.

## Reglas y preferencias del usuario (importante)
- Solo se empuja a la rama `ccr-6a76366f-0cl05x`. Commits terminan con las líneas Co-Authored-By y Claude-Session. Sin identificadores de modelo en commits/artefactos. Email del usuario: privado.
- Nunca inventar hechos ni citas; usar solo datos verificados (ver CASO-05-MOMO.md).
- Los titulares en pantalla deben decir lo que dice la voz; subtítulos «inteligentes» solo donde la pantalla no lo dice, con **la misma cinta que los titulares** (un solo estilo).
- Una sola pregunta que pida comentarios; va **al final** y, en los captions, el usuario prefiere la pregunta **en el comentario fijado, no en el caption** (hecho en TikTok y Facebook; pendiente confirmar en Instagram y YouTube).
- Sin flechas en los stickers de «ve a verlo». Sin «etiqueta a…», «comenta SÍ», «comparte si» (cebo).
- CTA con redacción natural, no de IA; «Comenta antes del final» fue rechazado. No prometer «el próximo caso» en respuestas a comentarios.
- No etiquetar susurros en la voz. Voz grabada por el usuario con ElevenLabs.
- Zona segura vertical de **1440** (Instagram): subtítulos desde y=1340, titulares terminan en 1316. Lado derecho (230 px) no ajustado.
- Facebook: el usuario quiere caption **largo y 3 hashtags** (decisión del canal, por encima de la guía de 0-2).

## Estado de los casos
- **Caso Nº 04 · Gato con Sombrero**: terminado y publicado (YouTube: ~1.373 vistas a las 10 h; «se quedaron viendo» 61 %, 74 % visto). Miniatura, portada/banner, historias de Facebook (12 frames) hechos.
- **Caso Nº 05 · Momo**: terminado. Render final `what-if-studio/out/momo07/Caso05-Momo-FINAL.mp4` (1080x1920, 38,8 s, −14,4 LUFS, zona segura 1440). Versión previa: `...-v1-zona1504.mp4`. Publicado en YouTube Shorts con un título distinto al propuesto: «La verdad detrás de Momo: ¿Miedo real o mentira? 😱 #momo #miedo». A las 10 h: 1.195 vistas, 56,2 % se quedaron viendo, 67,4 % visto, 18 me gusta, ~1 comentario. Meta del usuario: **≥2K vistas** y llegar a más gente en los siguientes vídeos.
- **Satoshi (largo, 1920x1080, ~5 min)**: composición `satoshi07` hecha sin voz; falta guion de voz y sincronía cuando el usuario quiera.
- Otros: `canal/no-presiones/caso-05-economist/INVESTIGACION.md` (The Economist 2027).

## Dónde está cada cosa (repo `RemotionProject`, carpeta `what-if-studio`)
- Momo: `src/momo07/` (Momo07.tsx, scenes.tsx, kit.tsx, theme.ts, captions.tsx, words.json, Thumb.tsx, Stories.tsx). Composiciones en `src/Root.tsx`: `Caso05Momo` (1164 fr), `Caso05MomoThumb`, `Caso05Stories` (5 frames).
- Herramientas: `tools/momo07_voz.py` (ajusta la voz; empalma el cierre nuevo `public/momo07/cierre-raw.mp3`), `tools/momo07_audio.py` (mezcla), `tools/momo07_borrador.sh` (borrador 0.5x), `tools/momo07_final.sh` (render final por bloques), `tools/whisper_words.py`.
- Salidas (en `out/`, solo se guardaron en git la miniatura y las historias): `out/momo07/Caso05-miniatura.png|jpg`, `out/momo07/stories/historia-1..5.png`. Los MP4 no están en el repo (tamaño).
- Textos de publicación: `canal/no-presiones/caso-05-momo/PUBLICACION.md` (captions, hashtags verificados, fijados, respuestas). Expediente de hechos: `CASO-05-MOMO.md`.

## Decisiones técnicas de Momo (resumen)
- Duración 38,8 s: voz ajustada recortando pausas; «No contestes» a −10 % de velocidad; cierre «¿Te llamó Momo o lo viste en las noticias?» con ~1,4 s de respiro y disolución a la pantalla de llamada (el último frame = el primero).
- Escena del «0»: fuentes (BBC, Samaritans, NSPCC, UK Safer Internet Centre) → «NI UN SOLO CASO REAL». Sello único «TODO ERA FALSO». Distintivo «MÁS CASOS REALES DE INTERNET» a 0:28-0:30 (izquierda, bajo la barra de caso).
- Mapa de alertas con sacudida + glitch por cada país.

## Datos de audiencia/hashtags (Apify, vidIQ)
- YouTube (vidIQ): «momo» ≈3,3 M búsquedas/mes; «momo challenge» ≈16 k/mes en descenso.
- Instagram (publicaciones): momo 10,2 M · creepypasta 2,1 M · misterio 1,5 M · casosreales 54 k · leyendaurbana 13 k · momochallenge 7 k · retomomo/misteriosdeinternet sin datos.
- TikTok (vistas/vídeo): casosreales ~81 k · misterio ~73 k · terror ~53 k · creepypasta ~26 k · momo ~17 k · #momochallenge no existe.
- Sets elegidos: IG `#momo #momochallenge #creepypasta #leyendaurbana #casosreales`; TikTok `#momo #casosreales #misterio #creepypasta #misteriosdeinternet`; FB `#casosreales #momo #misterio`.

## Skills externas usadas como referencia (solo lectura)
`sergebulaev/facebook-skills`, `sergebulaev/tiktok-skills`, `Jakeschincariol/instagram-agent-skill` (validadores caption.py/hookscore.py). Sus cifras son heurísticas de comunidad; el límite de 5 hashtags de Instagram no se pudo verificar.

## Pendientes / ideas
1. Elegir el comentario fijado final (propuesta: encuesta A/B/C/D «¿Cómo te llegó Momo en 2018?») y confirmar si en Instagram y YouTube la pregunta también va solo en el fijado.
2. Título de YouTube Shorts: el propuesto revelaba la escultura; unificar «vídeo» → «video».
3. Cross-promoción: fijado en el Short del gato apuntando a Momo; enlazar «vídeo relacionado» entre Shorts; lista «Casos reales de internet».
4. Próximos casos: gancho con la imagen impactante antes de 1 s (hipótesis; la cara de Momo entra a 1,5 s); un solo cambio por vídeo; elegir tema con vidIQ; apuntar métricas a 10 h y 24 h (se quedaron viendo, % visto, vistas, comentarios).
5. Opcional: versión del gancho B (cara primero), historias de «gracias»/«detrás de cámaras», voz del vídeo largo de Satoshi.
