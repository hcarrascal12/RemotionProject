/**
 * No Presiones · portada de Facebook (1640x624) con la identidad "tablero de investigación": casos reales de internet.
 * Lo importante va en el centro (x 300–1340): en móvil Facebook recorta los lados. Abajo a la izquierda queda libre
 * para la foto de perfil.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COL, MONO } from './theme';
import { Card, Finish, Headline } from './kit';

const Board: React.FC = () => (
  <AbsoluteFill style={{ background: COL.red }}>
    {/* rojo de la foto de perfil, con una viñeta suave para que no se vea plano */}
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.22) 100%)' }} />
  </AbsoluteFill>
);

export const FbCover: React.FC = () => (
  <AbsoluteFill>
    <Board />
    <AbsoluteFill style={{ perspective: 2000 }}>
      <Card src="cicada01/s2-face2.jpg" x={175} y={300} w={250} h={310} rz={-7} pos="45% 25%" filter="grayscale(1) contrast(1.3) brightness(0.9)" caption="SATOSHI" />
      <Card src="polar05/oso-sin-texto-2023.jpg" x={1475} y={168} w={235} h={260} rz={5} pos="72% 70%" caption="EL OSO POLAR" />
      <Card src="gato06/hook.jpg" x={1490} y={452} w={225} h={270} rz={-4} pos="50% 30%" caption="EL GATO" />
    </AbsoluteFill>
    <Headline text="CASOS REALES|DE INTERNET" at={0} y={110} size={112} maxW={900} still />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center' }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 27, letterSpacing: 4, color: COL.ink, background: '#F4F1EA', padding: '10px 22px', boxShadow: '0 10px 24px rgba(0,0,0,0.25)' }}>
        CONTADOS EN MENOS DE 1 MIN · <span style={{ color: COL.red }}>NO PRESIONES</span>
      </div>
    </div>
    <Finish />
  </AbsoluteFill>
);
