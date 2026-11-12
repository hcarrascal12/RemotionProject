import React from 'react';
import { AbsoluteFill } from 'remotion';
import { DepthBackdrop } from './Backdrop';
import { blink, COLOR, ease, HARD, HEAVY, lin, MONO, rand, ShotProps, springAt } from './motion';

// The broken shield, as a high-contrast schematic. Wide: a bright blue beam drops from the head, the protective
// plate slides in to soften it, hits a stop, rattles and sticks; on "potencia" the beam turns red with glitch.
// Close: the red beam hits the centre of the target.

const Blueprint: React.FC<{ f: number }> = ({ f }) => {
  const off = (f * 2) % 60;
  return (
    <>
      <defs>
        <pattern id="bp" width={60} height={60} patternUnits="userSpaceOnUse" patternTransform={`translate(${off * 0.3} ${off})`}>
          <rect width={60} height={60} fill="#030B1C" />
          <path d="M 60 0 L 0 0 0 60" stroke="#0C2448" strokeWidth={2} fill="none" />
        </pattern>
        <filter id="glow" x="-50%" y="-10%" width="200%" height="120%">
          <feGaussianBlur stdDeviation={14} />
        </filter>
      </defs>
      <rect x={-100} y={-100} width={1280} height={2120} fill="url(#bp)" />
      <DepthBackdrop t={f / 60} color={COLOR.cyan} glow={0.14} cy={1000} overlayOnly />
    </>
  );
};

const mix = (a: [number, number, number], b: [number, number, number], p: number) =>
  `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * p)).join(',')})`;

const Beam: React.FC<{ x: number; y0: number; y1: number; w: number; color: string; f: number; glitch: boolean }> = ({ x, y0, y1, w, color, f, glitch }) => {
  const dx = glitch ? (rand(f) - 0.5) * 30 : 0;
  return (
    <g>
      <rect x={x - w * 1.4} y={y0} width={w * 2.8} height={y1 - y0} fill={color} opacity={0.5} filter="url(#glow)" />
      {glitch ? (
        <>
          <rect x={x - w / 2 + dx - 14} y={y0} width={w} height={y1 - y0} fill={COLOR.cyan} opacity={0.45} />
          <rect x={x - w / 2 - dx + 14} y={y0} width={w} height={y1 - y0} fill="#FF00AA" opacity={0.45} />
        </>
      ) : null}
      <rect x={x - w / 2 + dx} y={y0} width={w} height={y1 - y0} fill={color} />
      <rect x={x - w / 6 + dx} y={y0} width={w / 3} height={y1 - y0} fill="#FFF" opacity={0.85} />
    </g>
  );
};

export const ShieldJam: React.FC<ShotProps> = ({ t, f, fps, variant = 'wide', mark }) => {
  const again = variant === 'again';
  const redAt = mark('potencia');
  const redP = again ? 1 : lin(t, redAt, redAt + 0.15);
  const color = mix([63, 216, 255], [255, 42, 42], redP);
  const glitch = redP > 0 && t - redAt < 0.4; // one short glitch as the beam turns red, then a clean red beam
  const width = 46 + 50 * redP + (redP > 0 ? Math.sin(t * 9) * 4 : 0);

  if (variant === 'close' || again) {
    const hitAt = mark(again ? 'descarga' : 'escudo');
    const hit = t - hitAt;
    const beamDrop = again ? ease(t, hitAt - 0.3, hitAt - 0.05, 0, 1) : ease(t, 0, 0.18, 0, 1);
    return (
      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <Blueprint f={f} />
          {/* target: you, seen as concentric rings */}
          {[420, 320, 220, 120].map((r, i) => (
            <circle key={r} cx={540} cy={1180} r={r} fill="none" stroke={i % 2 ? COLOR.red : '#FFFFFF'} strokeWidth={10} opacity={0.75} />
          ))}
          <Beam x={540} y0={-50} y1={-50 + 1230 * beamDrop} w={width + 30} color={color} f={f} glitch={glitch} />
          {hit >= 0 ? (
            <g>
              {[0, 0.12, 0.24].map((d, i) => {
                const a = hit - d;
                if (a < 0 || a > 0.7) return null;
                return <circle key={i} cx={540} cy={1180} r={80 + a * 1200} fill="none" stroke={i === 1 ? COLOR.yellow : COLOR.red} strokeWidth={30 * (1 - a / 0.7)} />;
              })}
              <circle cx={540} cy={1180} r={140 + 40 * Math.sin(t * 8)} fill="#FFF" opacity={Math.max(0, 1 - hit / 0.5)} />
              {Array.from({ length: 12 }, (_, i) => {
                const a = (i / 12) * Math.PI * 2 + rand(i) * 0.3;
                const len = Math.min(1, hit / 0.12) * (220 + rand(i * 3) * 300);
                return <line key={i} x1={540} y1={1180} x2={540 + Math.cos(a) * len} y2={1180 + Math.sin(a) * len} stroke="#FFF" strokeWidth={8} />;
              })}
            </g>
          ) : null}
          <g transform={`translate(540 400) scale(${springAt(f, fps, 0.05, HARD)})`}>
            <rect x={-360} y={-80} width={720} height={130} rx={18} fill={COLOR.red} stroke="#FFF" strokeWidth={6} />
            <text y={12} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={80} fill="#FFF" textLength={640} lengthAdjust="spacingAndGlyphs">
              {again ? 'SEGUNDA DESCARGA' : 'POTENCIA MÁXIMA'}
            </text>
          </g>
        </svg>
      </AbsoluteFill>
    );
  }

  // wide schematic
  const beamOn = mark('beamOn');
  const slideAt = mark('slide');
  const jamAt = mark('jam');
  const beamLen = ease(t, beamOn, beamOn + 0.25, 0, 1);
  const headY = 330;
  const targetY = 1180;
  // The plate rides a rail from the left toward the beam path, and stops short of it.
  const stopX = 110;
  const plateX = t < slideAt ? -420 : t < jamAt ? lin(t, slideAt, jamAt, -420, stopX) : stopX;
  const since = t - jamAt;
  const rattle = since >= 0 ? Math.sin(since * 2 * Math.PI * 26) * 16 * Math.exp(-since / 0.35) : 0;
  const plateW = 340;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <Blueprint f={f} />
        {/* machine head */}
        <path d={`M 300 120 L 780 120 L 700 ${headY} L 380 ${headY} Z`} fill="none" stroke="#9FE8FF" strokeWidth={8} />
        <rect x={500} y={headY - 20} width={80} height={30} fill="#9FE8FF" />
        {mono('CABEZAL', 820, 220)}
        {/* beam */}
        {beamLen > 0 ? <Beam x={540} y0={headY + 10} y1={headY + 10 + (targetY - headY - 10) * beamLen} w={width} color={color} f={f} glitch={glitch} /> : null}
        {/* rail and stop */}
        <line x1={0} y1={700} x2={1080} y2={700} stroke="#9FE8FF" strokeWidth={4} strokeDasharray="18 12" />
        <g transform={`translate(${stopX + plateW + 8} 650)`}>
          <rect x={0} y={0} width={34} height={100} fill="#FF9A1F" />
          <path d="M 0 0 L 34 0 L 0 34 Z M 0 66 L 34 100 L 0 100 Z" fill="#000" opacity={0.5} />
        </g>
        {mono('TOPE ATASCADO', stopX + plateW - 120, 800, COLOR.yellow, since >= 0 ? 1 : 0)}
        {/* where the plate should have stopped: over the beam */}
        <rect x={540 - plateW / 2} y={660} width={plateW} height={80} rx={6} fill="none" stroke="#9FE8FF" strokeWidth={4} strokeDasharray="14 10" opacity={0.6} />
        {/* the plate */}
        <g transform={`translate(${plateX + rattle} 660)`}>
          <rect x={0} y={0} width={plateW} height={80} rx={6} fill="#D7E6F0" stroke="#FFF" strokeWidth={4} />
          {Array.from({ length: 7 }, (_, i) => (
            <line key={i} x1={20 + i * 48} y1={6} x2={0 + i * 48} y2={74} stroke="#7FA3BC" strokeWidth={4} />
          ))}
          <text x={plateW / 2} y={55} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill="#0A2236">
            ESCUDO
          </text>
        </g>
        {since >= 0 && since < 0.5
          ? Array.from({ length: 6 }, (_, i) => {
              const a = -Math.PI / 2 + (rand(i) - 0.5) * 2.6;
              const r = since * 600;
              return <circle key={i} cx={stopX + plateW + Math.cos(a) * r} cy={700 + Math.sin(a) * r} r={8} fill={COLOR.yellow} opacity={1 - since / 0.5} />;
            })
          : null}
        {/* target */}
        <ellipse cx={540} cy={targetY + 40} rx={300} ry={90} fill="none" stroke="#FFF" strokeWidth={6} />
        <circle cx={540} cy={targetY} r={60} fill={redP > 0 ? COLOR.red : '#FFF'} opacity={0.85} />
        {mono('TÚ', 600, targetY + 110, '#FFF')}
        {mono(redP > 0 ? 'RAYO: MÁXIMO' : 'RAYO', 590, 520, redP > 0 ? COLOR.red : COLOR.cyan)}
      </svg>
    </AbsoluteFill>
  );
};

function mono(text: string, x: number, y: number, fill: string = '#9FE8FF', opacity = 1) {
  return (
    <text x={x} y={y} fontFamily={MONO} fontSize={38} fill={fill} opacity={opacity}>
      {text}
    </text>
  );
}
