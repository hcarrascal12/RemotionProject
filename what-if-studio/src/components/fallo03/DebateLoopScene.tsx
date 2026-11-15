import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HARD, HEAVY, lin, MONO, ShotProps, springAt } from '../motion';
import { DepthBackdrop } from '../Backdrop';
import { BurningProbe, HookScene, MarsLimb, U0, USPEED } from './HookScene';
import { num, OutText, P3, Stars } from './parts';

// DebateLoopScene: the closing card.
//   1. The question lands with an impulse: the balance swings in on the first frame and wobbles until the first answer.
//   2. Each pan drops onto the beam on its own word ("¿Del SOFTWARE…", "…o de QUIEN no lo revisó?") and the beam tips.
//   3. The last 1.6 s: a NASA telemetry panel, PERDIDA A 57 KM · FALLO #03, while the burning probe streaks down the hook's line
//      over the same Martian limb and reaches, on the last frame, the spot it holds on frame 0: the loop joins in mid-flight.

const TELE = 1.6; // seconds of the telemetry ending

export const DebateLoopScene: React.FC<ShotProps> = ({ t, f, fps, dur, mark, variant }) => {
  // the question is its own shot now ("debate", at 0:20); the cost, the telemetry and the loop are CloseScene. With variant 'loop'
  // it still plays the old ending.
  const endStart = variant === 'loop' ? dur - TELE : dur + 10;
  const pe = Math.max(0, Math.min(1, (t - endStart) / TELE));
  const handoff = variant === 'loop' ? lin(t, dur - 0.32, dur - 0.04) : 0;
  const push = 1 + 0.04 * Math.min(1, t / Math.max(0.5, Math.min(dur, endStart)));
  const t1 = num(mark('tag1'), 1.5);
  const t2 = num(mark('tag2'), 2.5);
  const qIn = springAt(f, fps, 0, HARD);
  const tag1 = springAt(f, fps, t1 - 0.1, HARD);
  const tag2 = springAt(f, fps, t2 - 0.1, HARD);
  const qOut = 1 - lin(t, endStart - 0.1, endStart + 0.2);
  // the balance: a damped swing from the first frame, then it tips to each answer as it lands
  const wobble = 16 * Math.exp(-t / 0.45) * Math.cos(t * 13) + (t < t1 ? 3 * Math.sin(t * 4) : 0);
  const kick = (at: number) => (t > at ? 5 * Math.exp(-(t - at) / 0.25) * Math.sin((t - at) * 22) : 0);
  const theta = wobble - 10 * tag1 + 18 * tag2 + kick(t1) - kick(t2);
  const r = (theta * Math.PI) / 180;
  const PX = 540;
  const PY = 860;
  const L = 265;
  const ends = [
    { x: PX - L * Math.cos(r), y: PY - L * Math.sin(r) },
    { x: PX + L * Math.cos(r), y: PY + L * Math.sin(r) },
  ];
  const cards = [
    { k: tag1, lines: ['¿EL SOFTWARE?', 'EN LIBRAS'], fill: P3.yellow, ink: '#000' },
    { k: tag2, lines: ['¿LA REVISIÓN?', 'NO LO VIO'], fill: P3.blue, ink: '#000' },
  ];
  // the ending: the burning probe streaks down the hook's line and reaches, on the last frame, exactly where it is on frame 0
  const u = U0 - USPEED * Math.max(0, dur - t);
  const panelK = springAt(f, fps, endStart + 0.05, HARD);
  const blinkOn = Math.floor(t * 4) % 2 === 0;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <rect width={1080} height={1920} fill={P3.bg} />
        <DepthBackdrop t={t} color={pe > 0 ? P3.red : P3.blue} glow={0.2} cy={1000} />
        <Stars t={t} n={60} />
        {/* the question and the balance */}
        <g opacity={Math.max(0, qOut)} transform={`translate(540 960) scale(${push}) translate(-540 -960)`}>
          <g transform={`translate(540 ${480 + 6 * Math.sin(t * 2.4)}) scale(${(0.6 + 0.4 * qIn) * (1 + 0.015 * Math.sin(t * 3.1))}) rotate(${1.2 * Math.sin(t * 1.7)})`} opacity={Math.min(1, qIn * 1.5)}>
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
          <g transform={`translate(0 ${-(1 - Math.min(1, qIn)) * 220})`} opacity={Math.min(1, qIn * 1.5)}>
            <path d={`M ${PX - 46} ${PY + 120} L ${PX} ${PY} L ${PX + 46} ${PY + 120} Z`} fill="#DDE3EA" stroke="#000" strokeWidth={8} strokeLinejoin="round" />
            <g transform={`rotate(${theta} ${PX} ${PY})`}>
              <rect x={PX - L - 20} y={PY - 12} width={2 * L + 40} height={24} rx={12} fill="#DDE3EA" stroke="#000" strokeWidth={7} />
            </g>
            <circle cx={PX} cy={PY} r={20} fill={P3.red} stroke="#000" strokeWidth={7} />
            {cards.map(({ k, lines, fill, ink }, i) => {
              const e = ends[i];
              const cy = e.y + 170;
              const drop = (1 - Math.min(1, k)) * -320;
              return (
                <g key={lines[1]} opacity={Math.min(1, k * 2.5)}>
                  <line x1={e.x - 110} y1={cy - 92} x2={e.x} y2={e.y} stroke="#DDE3EA" strokeWidth={5} />
                  <line x1={e.x + 110} y1={cy - 92} x2={e.x} y2={e.y} stroke="#DDE3EA" strokeWidth={5} />
                  <g transform={`translate(${e.x} ${cy + drop}) rotate(${(1 - Math.min(1, k)) * (i ? 14 : -14)})`}>
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
        {/* the telemetry ending */}
        {pe > 0 ? (
          <g opacity={Math.min(1, pe / 0.12)}>
            <MarsLimb t={t} />
            <g transform={`translate(540 560) scale(${0.7 + 0.3 * Math.min(1.08, panelK)})`} opacity={Math.min(1, panelK * 1.6)}>
              <rect x={-470} y={-170} width={940} height={340} rx={28} fill="#06101F" stroke={P3.blue} strokeWidth={6} />
              <OutText x={-420} y={-110} size={30} fill={P3.blue} text="TELEMETRÍA · MARS CLIMATE ORBITER" anchor="start" mono />
              <circle cx={-410} cy={-40} r={13} fill={blinkOn ? P3.red : '#5A1010'} />
              <OutText x={-385} y={-29} size={30} fill={blinkOn ? P3.red : '#9B2A2A'} text="SIN SEÑAL" anchor="start" mono />
              <OutText x={0} y={70} size={92} fill={P3.red} text="PERDIDA A 57 KM" stroke={12} />
              <OutText x={0} y={138} size={40} fill={P3.yellow} text="FALLO #03" mono spacing={8} />
            </g>
            <BurningProbe u={u} t={t} heat={0.4 + 0.6 * pe} id="end" />
          </g>
        ) : null}
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
