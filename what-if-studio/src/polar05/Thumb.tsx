/**
 * Miniatura vertical del Fallo #05 (1080x1920): la imagen real del meme de 2023, la pregunta del vídeo y la fecha.
 * Todo lo importante dentro de la zona segura y centrado (las rejillas de Shorts/Reels recortan los bordes).
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COL, HEAD, MONO } from './theme';
import { BearShot } from './scenes';

const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill' as const });

export const Polar05Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: COL.bg }}>
    <BearShot zoom={1.32} y={-230} />
    {/* viñeta: arriba oscuro para el titular, abajo oscuro para la fecha */}
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(4,7,12,0.92) 0%, rgba(4,7,12,0.35) 34%, rgba(4,7,12,0) 50%, rgba(4,7,12,0.55) 72%, rgba(4,7,12,0.95) 100%)' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 62%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)' }} />

    {/* sello de la serie */}
    <div style={{ position: 'absolute', top: 250, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 22px', borderRadius: 10, background: 'rgba(4,7,12,0.85)', border: `2px solid ${COL.ice}`, fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 3, color: COL.ice }}>
        <span style={{ width: 14, height: 14, borderRadius: 7, background: COL.red, boxShadow: `0 0 14px ${COL.red}` }} />
        FALLO #05 · SIN RESOLVER
      </div>
    </div>

    {/* la pregunta */}
    <div style={{ position: 'absolute', top: 350, left: 50, right: 50, textAlign: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 150, lineHeight: 0.98, letterSpacing: '-0.04em', color: COL.white, textShadow: '0 14px 50px rgba(0,0,0,0.9)', ...stroke(14) }}>
      ¿ESTE MEME
      <br />
      <span style={{ color: COL.ice }}>SABÍA ALGO?</span>
    </div>

    {/* la frase real en ruso, como etiqueta pegada a la imagen */}
    <div style={{ position: 'absolute', top: 1150, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
      <div style={{ transform: 'rotate(-2.5deg)', padding: '14px 26px', borderRadius: 12, background: '#fff', border: `5px solid ${COL.red}`, boxShadow: `0 20px 50px rgba(0,0,0,0.7), 0 0 40px ${COL.red}66`, fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 36, color: '#111', textAlign: 'center', lineHeight: 1.15 }}>
        это ноябрьский мем из 2026,
        <br />
        вы пока не поймете
      </div>
    </div>

    {/* la fecha */}
    <div style={{ position: 'absolute', top: 1300, left: 0, right: 0, textAlign: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 170, lineHeight: 1, letterSpacing: '-0.04em', color: COL.red, textShadow: `0 0 60px ${COL.red}aa, 0 12px 40px #000`, ...stroke(14) }}>
      NOV 2026
    </div>
    <div style={{ position: 'absolute', top: 1488, left: 80, right: 80, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 2, color: '#C3CED9', textShadow: '0 4px 14px #000' }}>
      UN MEME DE 2023 · NADIE SABE QUIÉN LO CREÓ
    </div>
  </AbsoluteFill>
);
