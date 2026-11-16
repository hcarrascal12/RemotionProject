# Facebook: página de No Presiones (red principal)

Objetivo: **ganar seguidores** para llegar a la monetización. Hecho con la skill `fb-page-optimizer`.
Nada se publica solo: cada campo lo cambias tú en la app.

## Auditoría de la página real (16 nov 2026)
Leída con Apify desde https://www.facebook.com/share/1J8QPJybQV/ (página creada el 13 nov).
Estado: 1 seguidor, 0 me gusta, 12 personas hablando de esto, sin anuncios.

| # | Parte | Estado | Lo que hay |
|---|---|---|---|
| 1 | Botón de acción | **Falla** | Sin Messenger ni botón; solo "Seguir" |
| 2 | Intro | **Cambiar** | "Fallos tecnológicos reales en menos de 1 min, sin tecnicismos. ¿Cuál cuento? 🔴": habla de la tecnología, no de la gente |
| 3 | Categoría | Bien | Creador digital |
| 4 | Nombre | **Cambiar** | No Presiones - Fallos Tech: "Tech" suena a página para programadores |
| 5 | Usuario / URL | **Falla** | Sin @ propio: la página se comparte con un enlace /share/ |
| 6 | Publicación fijada | Sin comprobar | Revisa que haya una |
| 7 | Portada | Bien | 1640x624, la de `portada-facebook-1640x624.png` |
| 8 | Foto de perfil | Bien | 800x800 (el avatar del canal) |
| 9 | Contacto y enlaces | Mejorable | Correo, Instagram (@no.presiones) y YouTube (@nopresiones): los @ no coinciden |

## Arreglos por orden

### 1. Botón "Enviar mensaje" (lo primero)
Página → Editar botón de acción → **Enviar mensaje**. Activa una respuesta automática:
```
¡Gracias por escribir! ¿Qué fallo de tecnología te gustaría ver animado? Lo apunto para los próximos vídeos.
```
Encaja con tu Intro ("¿Cuál cuento?"): quien quiera responder ya tiene dónde.

### 2. Reclama el usuario
Configuración → Información de la página → Usuario: **nopresiones** (igual que YouTube).
Así tu enlace es facebook.com/nopresiones y no un /share/ que parece una página sin terminar.
Si está ocupado: **no.presiones**, igual que Instagram.

### 3. Publicación fijada
Fija el **Fallo #04** (la caída de WhatsApp, Instagram y Facebook) en cuanto esté publicado. Mientras tanto, fija el #03.
```
¿Te acuerdas del día en que se cayeron WhatsApp, Instagram y Facebook a la vez? Esto fue lo que pasó por dentro. Cada semana un fallo nuevo.
```

### 4. Segunda categoría (opcional)
Añade **Creador de vídeos** junto a Creador digital.

### 5. Nombre e Intro: centrados en las personas
Tu promesa es cómo la tecnología afecta a la gente, para todo el mundo. "Fallos Tech" suena a página para programadores.
- **Nombre:** `No Presiones - Cuando la tecnología falla` (41 caracteres). Cámbialo **ya, una sola vez**: la página tiene 3 días y Facebook revisa cada cambio.
- **Intro** (elegida por ti, 16 nov 2026; 56 de 101 caracteres):
```
Fallos y curiosidades tecnológicas en menos de 1 minuto
```
  Variante con pregunta (74 caracteres): `Fallos y curiosidades tecnológicas en menos de 1 minuto. ¿Cuál cuento? 🔴`
- **Hashtags**: de la historia y de la gente, no de la marca técnica. Sí: #historiasreales #curiosidades #tecnologia #WhatsApp. No: #CrowdStrike #Microsoft #Windows.

### 6. Vincula Instagram
Centro de cuentas → conecta @no.presiones, para que los Reels se compartan también en Facebook (súbelos igualmente como nativos).

## Prueba de los 2 segundos
"No Presiones - Cuando la tecnología falla · Lo que le pasa a la gente cuando la tecnología falla. Historias reales, animadas en 30 segundos. 🔴 · Seguir / Enviar mensaje". Cualquiera, sepa o no de tecnología, entiende qué es y qué gana siguiéndola.
