#!/usr/bin/env python3
"""Prepara las imágenes del Caso Nº 04 para que no se vean borrosas en 1080x1920:
recortes de las capturas reales de Snapchat, reescalado Lanczos de las pequeñas y nitidez (unsharp mask)."""
import os
from PIL import Image, ImageFilter, ImageEnhance
os.chdir(os.path.join(os.path.dirname(__file__), '..', 'public', 'gato06'))

def sharp(im, radius=1.6, percent=120, threshold=2):
    return im.filter(ImageFilter.UnsharpMask(radius=radius, percent=percent, threshold=threshold))

def up(im, min_h):
    if im.height >= min_h: return im
    k = min_h / im.height
    return im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)

# 1 · la foto del gancho (la misma que la Garda publicó con el sello): 1400x1400 → 1920 de alto
im = Image.open('stanced.jpg').convert('RGB')
sharp(up(im, 2000), 1.2, 80).save('hook.jpg', quality=93)
# 2 · capturas reales de Snapchat: alerta (izquierda) y el aviso falso tipo periódico (derecha)
s = Image.open('snapchat.jpg').convert('RGB'); w, h = s.size
sharp(up(s.crop((0, int(h * 0.03), int(w * 0.5), int(h * 0.60))), 1500), 1.4, 90).save('snap-alerta.jpg', quality=93)
sharp(up(s.crop((int(w * 0.5), int(h * 0.06), w, int(h * 0.66))), 1800), 1.4, 90).save('snap-aviso.jpg', quality=93)  # sin el texto grosero de abajo
# 3 · las pequeñas: 2x Lanczos + nitidez
for src, dst in [('coche-orig.jpg', 'coche-hd.jpg'), ('sheffield.jpg', 'sheffield-hd.jpg'), ('kym-dark.jpg', 'dark-hd.jpg')]:
    im = Image.open(src).convert('RGB')
    sharp(up(im, 1600), 2.0, 140).save(dst, quality=92)
for f in ['hook.jpg', 'snap-alerta.jpg', 'snap-aviso.jpg', 'coche-hd.jpg', 'sheffield-hd.jpg', 'dark-hd.jpg']:
    print(f, Image.open(f).size)
