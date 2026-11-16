import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Hero, basePose, LOOKS, KitDefs, SetDefs, Pose } from '../../engine';
import { HARD, HEAVY, rand, ShotProps, springAt } from '../motion';
import { AppGlyph, Bubble, C4, clamp, num, OutText, PendingClock, PhoneBody } from './parts';

// The hook of Fallo #04:
//   loss  Frame 0 (the closing card hands over to this exact frame): 6 HORAS, huge; the three apps greyed out and struck
//         through; a phone with three empty grey bubbles; a clock racing from 0:00 to 6:00 in 1.5 s and landing with a hit.
//   msg   "...y nadie pudo avisar que llegó bien": Pip at night with his phone, "Ya llegué" stuck on the not-sent clock.

/** The room at night: a dark blue-black with a red alarm pulse at the edges. */
export const NightRoom: React.FC<{ t: number; alarm?: number; id: string }> = ({ t, alarm = 1, id }) => (
  <g>
    <defs>
      <radialGradient id={`${id}-bg`} cx="50%" cy="45%" r="75%">
        <stop offset="0%" stopColor="#16203A" />
        <stop offset="100%" stopColor="#05070C" />
      </radialGradient>
      <radialGradient id={`${id}-al`} cx="50%" cy="50%" r="72%">
        <stop offset="55%" stopColor="#EF4444" stopOpacity={0} />
        <stop offset="100%" stopColor="#EF4444" stopOpacity={0.55} />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill={`url(#${id}-bg)`} />
    {Array.from({ length: 26 }, (_, i) => (
      <circle key={i} cx={(i * 211) % 1080} cy={(i * 347) % 1920} r={2 + (i % 3)} fill="#93C5FD" opacity={0.06 + 0.05 * Math.abs(Math.sin(t * 0.9 + i))} />
    ))}
    {alarm > 0 ? <rect width={1080} height={1920} fill={`url(#${id}-al)`} opacity={alarm * (0.4 + 0.6 * (0.5 + 0.5 * Math.cos(t * Math.PI * 3)))} /> : null}
  </g>
);

/** The three grey empty bubbles of a dead chat, in phone-screen space. */
export const DeadChat: React.FC<{ t: number; offs?: number[] }> = ({ t, offs = [1, 1, 1] }) => {
  const rows = [
    { x: 50, y: -170, w: 380, side: 'out' as const },
    { x: -60, y: -10, w: 320, side: 'in' as const },
    { x: 40, y: 150, w: 420, side: 'out' as const },
  ];
  return (
    <g>
      {rows.map((r, i) => (
        <Bubble key={i} x={r.x} y={r.y + 3 * Math.sin(t * 2 + i)} w={r.w} h={104} side={r.side} fill={offs[i] ? C4.bubble : C4.bubbleOff} stroke={offs[i] ? '#475569' : '#1F2937'}>
          {i === 2 ? (
            <g>
              {[0, 1, 2].map((d) => (
                <circle key={d} cx={-140 + d * 34} cy={0} r={10} fill="#94A3B8" opacity={0.3 + 0.7 * Math.max(0, Math.sin(t * 7 - d * 0.9))} />
              ))}
              <PendingClock x={170} y={22} r={15} t={t} />
            </g>
          ) : null}
        </Bubble>
      ))}
    </g>
  );
};

const Opener: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const horas = num(mark('horas'), 0.3);
  // the clock: 0:00 to 6:00 in 1.5 s, speeding up into the hit
  const p = clamp(t / 1.5);
  const hours = 6 * p * p * p;
  const hh = Math.floor(hours + 1e-6);
  const mm = Math.min(59, Math.floor((hours - hh) * 60));
  const landed = t >= 1.5;
  const hit = landed ? Math.exp(-(t - 1.5) / 0.25) : 0;
  const amp = 9 * Math.exp(-t / 0.5) + 2.5 + 12 * hit;
  const sx = (rand(f * 2 + 1) - 0.5) * 2 * amp;
  const sy = (rand(f * 2 + 2) - 0.5) * 2 * amp;
  const pulse = 1 + 0.08 * hit + (t > horas ? 0.06 * Math.exp(-(t - horas) / 0.2) : 0);
  const glow = 0.5 + 0.5 * Math.sin(t * 8);
  void fps;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <NightRoom t={t} id="op4" />
        <g transform={`translate(${sx} ${sy})`}>
          {/* the phone with the dead chat */}
          <PhoneBody x={540} y={1035} s={0.52} rot={-3 + 0.6 * Math.sin(t * 1.4)} glow={0.12 + 0.08 * glow}>
            <DeadChat t={t} />
          </PhoneBody>
          {/* the clock racing to 6:00 */}
          <g transform={`translate(540 712) scale(${1 + 0.18 * hit})`}>
            <rect x={-150} y={-46} width={300} height={92} rx={46} fill="#05070C" stroke={landed ? C4.red : '#475569'} strokeWidth={6} />
            <PendingClock x={-92} y={0} r={22} t={t * 3} color={landed ? C4.red : '#CBD5E1'} />
            <text x={30} y={22} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={64} fill={landed ? C4.red : '#F8FAFC'} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {`${hh}:${String(mm).padStart(2, '0')}`}
            </text>
          </g>
          {hit > 0.02 ? <circle cx={540} cy={712} r={150 + 380 * (1 - hit)} fill="none" stroke={C4.red} strokeWidth={10 * hit} opacity={hit} /> : null}
        </g>
        <g transform={`translate(${sx * 0.5} ${sy * 0.5})`}>
          {/* 6 HORAS, on screen from frame 0 */}
          <g transform={`translate(540 455) scale(${pulse})`}>
            <OutText x={0} y={0} size={178} fill={C4.yellow} text="6 HORAS" stroke={18} />
          </g>
          {/* the three apps, dead and struck through */}
          {(['wa', 'ig', 'fb'] as const).map((k, i) => (
            <g key={k} transform={`translate(${330 + i * 210} 572) scale(${1 + 0.05 * Math.sin(t * 6 + i)})`}>
              <AppGlyph kind={k} x={0} y={0} r={48} on={0} />
              <line x1={-52} y1={52} x2={52} y2={-52} stroke="#000" strokeWidth={20} strokeLinecap="round" />
              <line x1={-52} y1={52} x2={52} y2={-52} stroke={C4.red} strokeWidth={12} strokeLinecap="round" />
            </g>
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** "...y nadie pudo avisar que llegó bien": Pip and the message that never leaves. */
const MessageScene: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const llego = num(mark('llego'), 1.4);
  const sent = springAt(f, fps, 0.15, HARD);
  const fail = t >= llego;
  const failK = fail ? springAt(f, fps, llego, HARD) : 0;
  const shake = fail ? 10 * Math.exp(-(t - llego) / 0.25) * Math.sin((t - llego) * 60) : 0;
  const pose: Pose = { ...basePose, x: 300, y: 1330, scale: 2.05, yaw: 0.25, look: 0.7, expr: t < llego ? 'worried' : 'shock', armL: { a: 18, b: 14 }, armR: { a: 14, b: 10 }, headTilt: 4 + 2 * Math.sin(t * 1.3) };
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <SetDefs />
        <NightRoom t={t} id="msg4" alarm={0.5} />
        {/* the phone's light on Pip */}
        <circle cx={600} cy={860} r={520} fill="#38BDF8" opacity={0.08 + 0.02 * Math.sin(t * 5)} />
        <Hero look={LOOKS.pip} pose={pose} shadow={0} />
        <PhoneBody x={700} y={820} s={0.62} rot={7 + 1.2 * Math.sin(t * 1.7)} glow={0.2}>
          <text x={-220} y={-330} fontFamily={HEAVY} fontWeight={900} fontSize={40} fill="#E2E8F0">
            Mamá
          </text>
          <text x={-220} y={-290} fontFamily={HEAVY} fontWeight={700} fontSize={26} fill={C4.red} opacity={0.6 + 0.4 * Math.abs(Math.sin(t * 4))}>
            sin conexión
          </text>
          <g transform={`translate(${shake} ${80 - 140 * Math.min(1, sent)})`} opacity={Math.min(1, sent * 2)}>
            <Bubble x={40} y={0} w={400} h={120} side="out" fill={C4.bubble}>
              <text x={-150} y={14} fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#F8FAFC">
                Ya llegué
              </text>
              <PendingClock x={160} y={30} r={16} t={t} color={fail ? C4.red : '#94A3B8'} />
            </Bubble>
            {fail ? (
              <g transform={`translate(-210 0) scale(${Math.min(1.15, failK)})`}>
                <circle r={30} fill={C4.red} />
                <text y={16} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={44} fill="#FFF">
                  !
                </text>
              </g>
            ) : null}
            {fail ? <OutText x={40} y={110} size={26} fill={C4.red} text="NO ENVIADO" mono opacity={Math.min(1, failK)} /> : null}
          </g>
        </PhoneBody>
      </svg>
    </AbsoluteFill>
  );
};

export const HookScene: React.FC<ShotProps> = (p) => (p.variant === 'msg' ? <MessageScene {...p} /> : <Opener {...p} />);
