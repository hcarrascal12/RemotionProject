import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Hero, basePose, LOOKS, KitDefs, SetDefs, Pose } from '../../engine';
import { HARD, HEAVY, rand, ShotProps, springAt } from '../motion';
import { AppGlyph, Bubble, C4, clamp, num, OutText, PendingClock, PhoneBody } from './parts';

// The hook of Fallo #04:
//   loss  Frame 0 (the closing card hands over to this exact frame): 6 HORAS, huge; the three apps greyed out and struck
//         through; and the viewer's own chat list, every chat stuck on the not-sent clock under "Conectando...". The clock
//         itself is the series pill, which runs as a timer through the whole film (Fallo04.tsx).
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

/** The viewer's own chat list, every chat stuck on the clock and "Conectando..." at the top: the screen everyone saw that day. */
export const ChatListPOV: React.FC<{ t: number; y?: number }> = ({ t, y = 660 }) => {
  const rows = [
    { n: 'Mamá', c: '#FCA5A5', m: '¿Ya llegaste?' },
    { n: 'Familia', c: '#FDE68A', m: 'Abuela: ¿y?' },
    { n: 'Trabajo', c: '#93C5FD', m: 'Reunión a las 5' },
    { n: 'Mi amor', c: '#F9A8D4', m: 'Avísame cuando...' },
  ];
  return (
    <g transform={`translate(0 ${y})`}>
      <rect x={50} y={0} width={980} height={650} rx={40} fill="#0B1220" stroke="#334155" strokeWidth={6} />
      <text x={100} y={74} fontFamily={HEAVY} fontWeight={900} fontSize={50} fill="#F8FAFC">
        Chats
      </text>
      <circle cx={690} cy={58} r={16} fill="none" stroke="#94A3B8" strokeWidth={5} strokeDasharray="30 70" transform={`rotate(${t * 420} 690 58)`} />
      <text x={720} y={70} fontFamily={HEAVY} fontWeight={700} fontSize={34} fill="#94A3B8">
        {`Conectando${'.'.repeat(1 + (Math.floor(t * 4) % 3))}`}
      </text>
      {rows.map((r, i) => (
        <g key={r.n} transform={`translate(0 ${170 + i * 130})`}>
          <circle cx={140} cy={0} r={44} fill={r.c} />
          <text x={140} y={16} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={42} fill="#0B1220">
            {r.n[0]}
          </text>
          <text x={212} y={-8} fontFamily={HEAVY} fontWeight={900} fontSize={40} fill="#F1F5F9">
            {r.n}
          </text>
          <text x={212} y={36} fontFamily={HEAVY} fontWeight={600} fontSize={30} fill="#64748B">
            {r.m}
          </text>
          <PendingClock x={960} y={0} r={20} t={t + i * 0.4} color={C4.red} />
        </g>
      ))}
    </g>
  );
};

const Opener: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const horas = num(mark('horas'), 0.3);
  // the hit on the first word, the cost of the outage in hours
  const hit = t > horas ? Math.exp(-(t - horas) / 0.25) : 0;
  const amp = 9 * Math.exp(-t / 0.5) + 2.5 + 8 * hit;
  const sx = (rand(f * 2 + 1) - 0.5) * 2 * amp;
  const sy = (rand(f * 2 + 2) - 0.5) * 2 * amp;
  const pulse = 1 + 0.1 * hit;
  const glow = 0.5 + 0.5 * Math.sin(t * 8);
  void fps;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <NightRoom t={t} id="op4" />
        <g transform={`translate(${sx} ${sy})`}>
          {/* the viewer's own phone: the chat list, all stuck */}
          <g transform={`rotate(${0.4 * Math.sin(t * 1.4)} 540 980)`}>
            <ChatListPOV t={t} />
          </g>
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

/** "Seis horas. Las tres apps a la vez.": the clock races to 6:00 and the three apps fall, one after the other, and go grey. */
const FallScene: React.FC<ShotProps> = ({ t, f, mark }) => {
  const horas = num(mark('horas'), 0.4);
  const vez = num(mark('vez'), 1.6);
  const p = clamp(t / Math.max(0.3, horas));
  const hours = 6 * p * p;
  const hh = Math.floor(hours + 1e-6);
  const mm = Math.min(59, Math.floor((hours - hh) * 60));
  const hit = t > horas ? Math.exp(-(t - horas) / 0.25) : 0;
  const amp = 3 + 10 * hit;
  const sx = (rand(f * 2 + 71) - 0.5) * 2 * amp;
  const sy = (rand(f * 2 + 72) - 0.5) * 2 * amp;
  const dropAt = [horas + 0.25, horas + 0.45, Math.max(horas + 0.65, vez - 0.1)];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <NightRoom t={t} id="fl4" />
        <g transform={`translate(${sx} ${sy})`}>
          <g transform={`translate(540 470) scale(${1 + 0.12 * hit})`}>
            <rect x={-260} y={-90} width={520} height={180} rx={90} fill="#05070C" stroke={t > horas ? C4.red : '#475569'} strokeWidth={8} />
            <PendingClock x={-160} y={0} r={42} t={t * 3} color={t > horas ? C4.red : '#CBD5E1'} />
            <text x={50} y={40} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={118} fill={t > horas ? C4.red : '#F8FAFC'} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {`${hh}:${String(mm).padStart(2, '0')}`}
            </text>
          </g>
          <OutText x={540} y={700} size={150} fill={C4.yellow} text="6 HORAS" stroke={16} opacity={clamp((t - horas + 0.05) / 0.1)} />
          {(['wa', 'ig', 'fb'] as const).map((k, i) => {
            const d = t - dropAt[i];
            const fall = d > 0 ? 900 * d * d : 0;
            const rot = d > 0 ? (i - 1) * 60 * d : 0;
            return (
              <g key={k} transform={`translate(${250 + i * 290} ${980 + fall}) rotate(${rot})`} opacity={clamp(1 - (fall - 300) / 300)}>
                <AppGlyph kind={k} x={0} y={0} r={105} on={d > 0 ? 0 : 1} label labelColor={d > 0 ? '#64748B' : '#F1F5F9'} />
              </g>
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const HookScene: React.FC<ShotProps> = (p) => (p.variant === 'msg' ? <MessageScene {...p} /> : p.variant === 'fall' ? <FallScene {...p} /> : <Opener {...p} />);
