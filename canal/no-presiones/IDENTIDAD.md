# No Presiones: identidad del canal

## 1. Núcleo
- **Nombre del canal:** No Presiones
- **Handle:** @nopresiones (según tu comprobación, no existe en YouTube; cuando lo crees, confirma que quedó con ese handle)
- **Frase de posicionamiento:** Historias reales de tecnología que salieron mal. Cada episodio cuenta un error de software o de diseño que costó vidas, dinero o datos.
- **Promesa:** en 45 segundos entiendes qué falló, por qué y qué pudo evitarlo.
- **Tono:** directo, tenso, sin morbo gratuito. Segunda persona ("tú estás ahí"). Frases cortas. Cifras y fuentes.

## 2. Pilares de contenido
1. **Errores que matan:** Therac-25, aviación, medicina.
2. **Un clic de más:** interfaces y decisiones de diseño que fallaron.
3. **Lo que nadie revisó:** software que nadie pensó que podía fallar.
4. **Después del error:** cómo se corrigió y qué cambió la industria.

## 3. Identidad visual
Basada en la dirección audiovisual "El Dev Artificial" (ver `what-if-studio/src/design/devArtificial.ts`).

**Paleta**
| Uso | Color | Hex |
|---|---|---|
| Fondo | Negro profundo | #05070A |
| Fondo secundario | Azul noche | #0B0F17 |
| Alerta (marca principal) | Rojo | #FF2A2A |
| Acento de subtítulos | Amarillo | #FFE600 |
| Terminal | Verde | #00FF66 |
| Advertencia | Ámbar | #FFB800 |
| Texto | Blanco | #F8FAFC |

**Tipografía**
- Títulos y miniaturas: Inter Black (900), con borde negro.
- Etiquetas y datos: Fragment Mono (o DejaVu Sans Mono si no está instalada).

**Logotipo / avatar:** un botón rojo con "NO" y una línea de dosis debajo. Archivo: `avatar.png` (800x800). Cuando se vea en 40 px, el "NO" sigue legible.

**Banner:** `banner-2560x1440.png`. El texto está en el centro, dentro de la zona segura de 1546x423 px que TV y escritorio no recortan. En móvil se ve la franja central.

**Mejoras pendientes en el banner:** subir el subtítulo amarillo de 52 a 64 px para que se lea en el móvil.

## 4. Miniaturas (plantilla)
- Fondo oscuro con halo rojo, misma gama que el banner.
- Una sola cifra o palabra grande, máximo 3 palabras.
- Un único objeto: el botón, una pantalla o el personaje.
- Título en el vídeo distinto al de la miniatura, para que el clic tenga motivo.

## 5. Intro y cierre (sonido y vídeo)
- **Sello de 1,5 s:** el botón rojo se hunde con un golpe grave y luego aparece el nombre del canal. Sonido: golpe grave + pulso cardiaco, igual que el gancho.
- **Cierre:** la frase de la CTA ("¿Software o empresa? Te leo") y el zoom a ENTER que enlaza con el primer fotograma.

## 6. Descripción del canal (About)
> No Presiones cuenta errores reales de tecnología que costaron vidas, dinero o datos. Cada vídeo dura menos de un minuto y la historia está sustentada con fuentes en la descripción. Empezamos con el Therac-25, la máquina de radioterapia que mató por un fallo de software. Escríbenos qué fallo te gustaría que contáramos.

**Palabras clave del canal:** errores de software, fallos tecnológicos, Therac-25, historia de la computación, seguridad informática, ingeniería, desastres tecnológicos.

## 7. Plantilla de vídeo
- **Título:** [Qué falló] + [consecuencia]. Ej.: "Una tecla. Dos descargas. El Therac-25."
- **Descripción:** primera línea con la idea principal; luego fuentes (Leveson y Turner, 1993, para el Therac-25); luego "Te leo: ¿software o empresa?".
- **Etiquetas:** 5 a 8, en español, sobre el tema del vídeo.
- **Comentario fijado:** la pregunta del cierre del vídeo.
- **Aviso de contenido sensible:** marcar "contiene escenas que pueden afectar" cuando se hable de muertes.

## 8. Redes y enlaces
- TikTok, Instagram y Shorts con el mismo handle (@nopresiones) cuando estén libres. Confírmalo antes de publicar.
- Dominio: revisa disponibilidad de nopresiones.com; si no está libre, usa un nombre de contacto.

## 9. Lista para lanzar
- [ ] Crear el canal con el handle @nopresiones
- [ ] Subir avatar.png y banner-2560x1440.png
- [ ] Pegar la descripción y las palabras clave
- [ ] Publicar el vídeo piloto (Therac-25) con plantilla de título y descripción
- [ ] Fijar el comentario de la pregunta
- [ ] Revisar en móvil cómo se ve el banner y el avatar
