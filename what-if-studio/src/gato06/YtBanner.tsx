/**
 * No Presiones · banner de YouTube (2560x1440), a juego con la foto de perfil roja y la portada de Facebook.
 * Zona segura (se ve en todos los dispositivos): 1546x423 en el centro, x 507–2053, y 508–931. Ahí va todo el texto.
 * Las fotos quedan en la franja de escritorio (y 508–931), fuera de la zona segura: decoran, no informan.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COL, MONO } from './theme';
import { Card, Finish, Headline } from './kit';

export const YtBanner: React.FC = () => (
  <AbsoluteFill style={{ background: COL.red }}>
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.25) 100%)' }} />
    <AbsoluteFill style={{ perspective: 2600 }}>
      <Card src="cicada01/s2-face2.jpg" x={330} y={722} w={290} h={370} rz={-6} pos="45% 25%" filter="grayscale(1) contrast(1.3) brightness(0.9)" caption="SATOSHI" />
      <Card src="polar05/oso-sin-texto-2023.jpg" x={2160} y={712} w={255} h={350} rz={5} pos="72% 70%" caption="EL OSO POLAR" />
      <Card src="gato06/hook.jpg" x={2425} y={728} w={235} h={350} rz={-4} pos="50% 30%" caption="EL GATO" />
    </AbsoluteFill>
    <div style={{ position: 'absolute', left: 507, width: 1546, top: 0, height: 1440 }}>
      <Headline text="CASOS REALES|DE INTERNET" at={0} y={512} size={118} maxW={1300} still />
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 846, display: 'flex', justifyContent: 'center' }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 36, letterSpacing: 5, color: COL.ink, background: '#F4F1EA', padding: '12px 26px', boxShadow: '0 10px 24px rgba(0,0,0,0.25)' }}>
        CONTADOS EN MENOS DE 1 MIN · <span style={{ color: COL.red }}>NO PRESIONES</span>
      </div>
    </div>
    <Finish />
  </AbsoluteFill>
);
