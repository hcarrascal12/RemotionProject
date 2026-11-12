# Kit del canal: No Presiones

Todo lo que necesitas para abrir el canal, en esta carpeta. Cada archivo con su medida y dónde se sube.

## Archivos
| Archivo | Medida | Dónde va |
|---|---|---|
| `avatar.png` | 800 × 800 px | Imagen de perfil |
| `banner-2560x1440.png` | 2560 × 1440 px (mínimo 2048 × 1152, máx. 6 MB) | Banner del canal |
| `watermark-150x150.png` | 150 × 150 px, fondo transparente | Marca de agua en los vídeos |
| `short-cover-therac25-1080x1920.png` | 1080 × 1920 px | Portada del vídeo piloto |
| `avatar-circle-preview.png` | 800 × 800 px | Solo para ver cómo queda recortado en círculo |
| `TEXTOS-PARA-PEGAR.md` | | Descripción, palabras clave, textos del piloto y de otras redes |
| `IDENTIDAD.md` | | Guía de marca completa (pilares, tono, plantillas) |
| `voice.md` | | Perfil de voz que leen las skills de YouTube |
| `*.svg` y `render.mjs` | | Fuentes editables de las imágenes y el script que las genera |

## Colores
| Uso | Nombre | HEX | RGB |
|---|---|---|---|
| Fondo | Negro profundo | `#05070A` | 5, 7, 10 |
| Fondo secundario | Azul noche | `#0B0F17` | 11, 15, 23 |
| Marca (alerta, botón) | Rojo | `#FF2A2A` | 255, 42, 42 |
| Subtítulos y acentos | Amarillo | `#FFE600` | 255, 230, 0 |
| Terminal | Verde | `#00FF66` | 0, 255, 102 |
| Advertencia | Ámbar | `#FFB800` | 255, 184, 0 |
| Texto | Blanco | `#F8FAFC` | 248, 250, 252 |

Regla: el rojo es la marca; los demás colores acompañan y nunca compiten con él. Fondo siempre oscuro.

## Tipografía
- **Inter Black (900)** para el nombre, los títulos y las miniaturas, con borde negro. Gratuita en Google Fonts.
- **Fragment Mono** para etiquetas y datos. Gratuita en Google Fonts.

## Cómo subirlo (YouTube Studio)
1. Abre **studio.youtube.com** con la cuenta del canal.
2. **Personalización > Branding**:
   - Imagen: sube `avatar.png`.
   - Banner: sube `banner-2560x1440.png`. YouTube te muestra cómo se ve en móvil, ordenador y televisión; el título debe verse completo en las tres.
   - Marca de agua: sube `watermark-150x150.png` y elige que aparezca **en todo el vídeo**.
3. **Personalización > Información básica**:
   - Nombre: No Presiones. Handle: @nopresiones.
   - Descripción y correo de contacto: pega desde `TEXTOS-PARA-PEGAR.md`.
4. **Configuración > Canal > Configuración avanzada**: público "No es contenido para niños".
5. **Configuración > Canal > Configuración básica**: pega las palabras clave del canal.
6. **Contenido > Listas de reproducción**: crea las cuatro listas de la guía.
7. Sube el vídeo piloto con el título, la descripción, las etiquetas y la portada del documento de textos; fija el comentario.

## Antes de publicar
- [ ] El handle @nopresiones coincide en YouTube, TikTok e Instagram.
- [ ] Comprobado en el móvil: el avatar se lee a 40 px y el banner no se corta.
- [ ] Marcado el contenido sintético en el piloto si la voz clona a una persona real.
- [ ] Correo de contacto elegido.
- [ ] Corregidos los pendientes de `voice.md`: "Para ahorrar dinero" y la nota de la tecla P.
