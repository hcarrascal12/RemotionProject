/**
 * No Presiones · Sin resolver · Caso Nº 03 · El oso polar de "Noviembre 2026" — miniatura vertical (1080x1920).
 * Misma fórmula que la de Satoshi (Caso Nº 02): es el gancho congelado. Imagen real arriba, sello de identidad,
 * titular de dos líneas (blanco + acento) y la línea de serie.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COL, HEAD, MONO } from './theme';
import { NightSky, Plate, StatusBar } from './ui';
import { BEAR } from './scenes';

export const Polar05Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: COL.bg }}>
    <NightSky />
    {/* el encuadre del gancho */}
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1300, overflow: 'hidden' }}>
      <Plate file="polar05/portada-kym.jpg" pos={BEAR.pos} origin={BEAR.origin} scale={1.6} x={-150} y={-20} bright={0.95} sat={0.85} tint="rgba(120,90,200,0.25)" />
      {/* el "2026" fantasma del gancho */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 400, textAlign: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 380, letterSpacing: '-0.05em', color: 'transparent', WebkitTextStroke: `2px ${COL.ice}`, opacity: 0.2 }}>2026</div>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(4,7,12,0.75) 0%, rgba(4,7,12,0) 28%, rgba(4,7,12,0) 80%, rgba(4,7,12,0.7) 91%, rgba(4,7,12,1) 100%)' }} />
    </div>
    <StatusBar />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center' }}>
      <div style={{ padding: '10px 22px', border: `2px solid ${COL.ice}`, borderRadius: 999, background: 'rgba(4,7,12,0.6)', fontFamily: MONO, fontWeight: 800, fontSize: 26, color: COL.ice, letterSpacing: 2, boxShadow: `0 0 20px ${COL.ice}55` }}>
        AUTOR: DESCONOCIDO
      </div>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1230, textAlign: 'center' }}>
      <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 104, lineHeight: 0.98, letterSpacing: '-0.03em', color: COL.white, textShadow: '0 10px 30px rgba(0,0,0,0.9)' }}>UN MEME DE 2023</div>
      <div style={{ marginTop: 24, fontFamily: HEAD, fontWeight: 900, fontSize: 88, lineHeight: 1, letterSpacing: '-0.03em', color: COL.red, textShadow: '0 8px 24px rgba(0,0,0,0.9)', filter: `drop-shadow(0 0 22px ${COL.red}80)` }}>HABLA DE ESTE MES</div>
      <div style={{ marginTop: 40, fontFamily: MONO, fontWeight: 800, fontSize: 30, color: COL.muted, letterSpacing: 1.5 }}>NOVIEMBRE 2026 · SIN RESOLVER</div>
    </div>
  </AbsoluteFill>
);
