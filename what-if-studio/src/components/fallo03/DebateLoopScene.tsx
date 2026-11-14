import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HARD, HEAVY, lin, MONO, ShotProps, springAt } from '../motion';
import { DepthBackdrop } from '../Backdrop';
import { HookScene } from './HookScene';
import { num, P3, Stars } from './parts';

// DebateLoopScene: the closing card. The question, the two answers on a balance (each pan drops as its side is said: the
// contractor, then NASA), the call to action and the channel name, then a rush toward the red key and a cut back into frame 0.

export const DebateLoopScene: React.FC<ShotProps> = ({ t, f, fps, dur, mark }) => {
  const rushStart = dur - 1.5;
  const pr = Math.max(0, Math.min(1, (t - rushStart) / 1.5));
  const rush = 1 + 2.4 * Math.pow(pr, 3);
  const push = 1 + 0.12 * Math.min(1, t / rushStart) + 0.025 * Math.sin(Math.min(1, Math.max(0, (t - num(mark('tag2'), 2.5)) / 0.5)) * Math.PI);
  const glow = 0.5 + 0.5 * Math.sin(t * 6);
  const handoff = lin(t, dur - 0.32, dur - 0.04);
  const qIn = springAt(f, fps, 0.05, HARD);
  const tag1 = springAt(f, fps, num(mark('tag1'), 1.5) - 0.15, HARD);
  const tag2 = springAt(f, fps, num(mark('tag2'), 2.5) - 0.15, HARD);
  const qOut = 1 - lin(t, rushStart - 0.1, rushStart + 0.2);
  const cta = springAt(f, fps, num(mark('cta'), 4) - 0.1, HARD);
  const theta = -9 * tag1 + 18 * tag2 - 9 * cta;
  const r = (theta * Math.PI) / 180;
  const PX = 540;
  const PY = 840;
  const L = 265;
  const ends = [
    { x: PX - L * Math.cos(r), y: PY - L * Math.sin(r) },
    { x: PX + L * Math.cos(r), y: PY + L * Math.sin(r) },
  ];
  const cards = [
    { k: tag1, lines: ['¿EL SOFTWARE?', 'EN LIBRAS'], fill: P3.yellow, ink: '#000', on: cta > 0.5 || tag2 < 0.5 },
    { k: tag2, lines: ['¿LA REVISIÓN?', 'NO LO VIO'], fill: P3.blue, ink: '#000', on: true },
  ];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <rect width={1080} height={1920} fill={P3.bg} />
        <DepthBackdrop t={t} color={P3.blue} glow={0.2} cy={1000} />
        <Stars t={t} n={60} />
        <g transform={`translate(540 1000) scale(${rush * push}) translate(-540 -1000)`}>
          <g opacity={t >= rushStart ? lin(pr, 0, 0.2) : 0}>
            <rect x={370} y={938} width={340} height={150} rx={24} fill="#3A0004" />
            <rect x={370} y={920} width={340} height={150} rx={24} fill={P3.red} opacity={0.55 + 0.45 * glow} stroke="#FFF" strokeWidth={5} />
            <text x={540} y={1010} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={60} fill="#FFF">
              ENVIAR
            </text>
          </g>
        </g>
        <g opacity={Math.max(0, qOut)}>
          <g transform={`translate(540 430) scale(${0.6 + 0.4 * qIn})`} opacity={Math.min(1, qIn * 1.5)}>
            {['¿DE QUIÉN', 'FUE LA CULPA?'].map((line, i) => (
              <g key={line}>
                <text y={i * 150} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={i ? 118 : 128} fill="#000" stroke="#000" strokeWidth={26} strokeLinejoin="round" transform="translate(7 9)">
                  {line}
                </text>
                <text y={i * 150} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={i ? 118 : 128} fill="#FFF" stroke="#000" strokeWidth={18} strokeLinejoin="round" paintOrder="stroke">
                  {line}
                </text>
              </g>
            ))}
          </g>
          <g opacity={Math.min(1, qIn * 1.5)}>
            <path d={`M ${PX - 46} ${PY + 120} L ${PX} ${PY} L ${PX + 46} ${PY + 120} Z`} fill="#DDE3EA" stroke="#000" strokeWidth={8} strokeLinejoin="round" />
            <g transform={`rotate(${theta} ${PX} ${PY})`}>
              <rect x={PX - L - 20} y={PY - 12} width={2 * L + 40} height={24} rx={12} fill="#DDE3EA" stroke="#000" strokeWidth={7} />
            </g>
            <circle cx={PX} cy={PY} r={20} fill={P3.red} stroke="#000" strokeWidth={7} />
            {cards.map(({ k, lines, fill, ink, on }, i) => {
              const e = ends[i];
              const cy = e.y + 170;
              return (
                <g key={lines[1]} opacity={k > 0.01 ? (on ? 1 : 0.45) : 0}>
                  <line x1={e.x - 110} y1={cy - 92} x2={e.x} y2={e.y} stroke="#DDE3EA" strokeWidth={5} />
                  <line x1={e.x + 110} y1={cy - 92} x2={e.x} y2={e.y} stroke="#DDE3EA" strokeWidth={5} />
                  <g transform={`translate(${e.x} ${cy}) scale(${k}) rotate(${(1 - Math.min(1, k)) * (i ? 12 : -12)})`}>
                    <rect x={-180} y={-95} width={360} height={190} rx={34} fill={fill} stroke="#000" strokeWidth={10} />
                    {lines.map((ln, j) => (
                      <text key={ln} y={-14 + j * 74} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={j ? 58 : 46} fill={ink} textLength={310} lengthAdjust="spacingAndGlyphs">
                        {ln}
                      </text>
                    ))}
                  </g>
                </g>
              );
            })}
          </g>
        </g>
        <g opacity={Math.max(0, qOut) * Math.min(1, cta * 1.5)} transform={`translate(540 1400) scale(${0.85 + 0.15 * cta})`}>
          <text textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={104} fill="#000" stroke="#000" strokeWidth={22} strokeLinejoin="round" transform="translate(5 7)">
            NO PRESIONES
          </text>
          <text textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={104} fill={P3.red} stroke="#FFF" strokeWidth={14} strokeLinejoin="round" paintOrder="stroke">
            NO PRESIONES
          </text>
          <text y={64} textAnchor="middle" fontFamily={MONO} fontSize={38} fill="#FFF" letterSpacing={6}>
            FALLO #03
          </text>
        </g>
      </svg>
      {/* the last frame IS frame 0 of the hook, so the loop cuts invisibly */}
      {handoff > 0.001 ? (
        <AbsoluteFill style={{ opacity: handoff }}>
          <HookScene t={0} f={0} fps={fps} dur={1} variant="loss" mark={() => Number.NaN} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
