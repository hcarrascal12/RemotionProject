import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HARD, HEAVY, lin, rand, ShotProps, springAt } from '../motion';
import { AppGlyph, Bubble, C4, num, OutText } from './parts';
import { ChatListPOV, NightRoom } from './HookScene';
import { Recreate04, ReunionBg } from './Recreate04';

// The close of Fallo #04:
//   cta   "¿Qué fue lo primero que intentaste abrir?": the question on a card, and the three apps as three answer bubbles.
//         The first one (WhatsApp) lights up green with the double check, and keeps a soft pulse to invite the comment.
//   loop  no voice: the chat goes dark again (sin conexión) under the share ask, and the last 0.32 s hand over to the hook's
//         frame 0, so the loop joins.

export const CtaScene: React.FC<ShotProps> = (props) => {
  const { t, f, fps, mark, variant } = props;
  const story = variant === 'story';
  const abrir = num(mark('abrir'), 1.6);
  const q = springAt(f, fps, 0.05, HARD);
  const green = t >= abrir + 0.25;
  const gk = green ? springAt(f, fps, abrir + 0.25, { stiffness: 220, damping: 12, mass: 0.6 }) : 0;
  const rows = [
    { k: 'wa' as const, name: 'WhatsApp', x: 600, y: 820, side: 'out' as const },
    { k: 'ig' as const, name: 'Instagram', x: 480, y: 1010, side: 'in' as const },
    { k: 'fb' as const, name: 'Facebook', x: 600, y: 1200, side: 'out' as const },
  ];
  return (
    <AbsoluteFill>
      {story ? <ReunionBg {...props} /> : null}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        {story ? null : <NightRoom t={t} id="ct4" alarm={0} />}
        {/* the question (the voice line has no captions: this card is the caption) */}
        <g transform={`translate(540 ${430 + 20 * (1 - Math.min(1, q))}) scale(${0.75 + 0.25 * Math.min(1.06, q)})`} opacity={Math.min(1, q * 1.6)}>
          <OutText x={0} y={0} size={104} fill="#FFFFFF" text="¿QUÉ ABRISTE" stroke={14} />
          <OutText x={0} y={118} size={104} fill={C4.yellow} text="PRIMERO?" stroke={14} />
        </g>
        {rows.map((r, i) => {
          const inK = springAt(f, fps, 0.15 + i * 0.12, HARD);
          const lit = i === 0 && green;
          const fill = lit ? C4.wa : C4.bubble;
          return (
            <g key={r.k} opacity={Math.min(1, inK * 1.6)} transform={`translate(0 ${40 * (1 - Math.min(1, inK))})`}>
              {lit
                ? [0, 1].map((j) => {
                    const ph = ((t - abrir - 0.25) * 0.9 + j * 0.5) % 1;
                    return <rect key={j} x={r.x - 280 - 40 * ph} y={r.y - 70 - 20 * ph} width={560 + 80 * ph} height={140 + 40 * ph} rx={60} fill="none" stroke={C4.wa} strokeWidth={6} opacity={(1 - ph) * 0.7} />;
                  })
                : null}
              <Bubble x={r.x} y={r.y + 3 * Math.sin(t * 2 + i)} w={560} h={140} side={r.side} fill={fill} stroke={lit ? '#14532D' : '#475569'} strokeW={6} s={lit ? 1 + 0.05 * Math.max(0, 1 - gk) + 0.012 * Math.sin(t * 6) : 1}>
                <AppGlyph kind={r.k} x={-200} y={0} r={42} on={1} />
                <text x={-130} y={16} fontFamily={HEAVY} fontWeight={900} fontSize={50} fill="#F8FAFC">
                  {r.name}
                </text>
                {lit ? (
                  <g transform="translate(220 34)">
                    <path d="M -26 0 L -16 10 L 4 -12" stroke="#FFFFFF" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, gk * 2)} />
                    <path d="M -8 0 L 2 10 L 22 -12" stroke="#FFFFFF" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, Math.min(1, gk * 2 - 1))} />
                  </g>
                ) : null}
              </Bubble>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const CloseScene: React.FC<ShotProps> = ({ t, f, fps, dur }) => {
  const hard = Math.max(0, 1 - t / 0.35);
  const bands = Array.from({ length: 9 }, (_, i) => {
    const seed = i * 13 + Math.floor(t * 12);
    return { y: rand(seed) * 1920, h: 6 + rand(seed + 1) * (30 + 90 * hard), o: (0.08 + 0.25 * rand(seed + 2)) * (0.4 + hard), c: i % 3 === 0 ? C4.red : i % 3 === 1 ? '#38BDF8' : '#E2E8F0' };
  });
  const amp = 14 * hard + 1.5;
  const sx = (rand(f * 2 + 61) - 0.5) * 2 * amp;
  const sy = (rand(f * 2 + 62) - 0.5) * 2 * amp;
  const handoff = lin(t, dur - 0.32, dur - 0.04);
  const blinkOn = Math.floor(t * 4) % 2 === 0;
  void fps;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <NightRoom t={t} id="cl4" alarm={1} />
        <g transform={`translate(${sx} ${sy})`}>
          <ChatListPOV t={t} />
          <g transform="translate(540 430)">
            <rect x={-300} y={-60} width={600} height={120} rx={28} fill="#1A0306" stroke={C4.red} strokeWidth={6} />
            <circle cx={-240} cy={0} r={16} fill={blinkOn ? C4.red : '#5A1010'} />
            <OutText x={20} y={18} size={52} fill="#FCA5A5" text="SIN CONEXIÓN" stroke={6} />
          </g>
        </g>
        {bands.map((b, i) => (
          <rect key={i} x={0} y={b.y} width={1080} height={b.h} fill={b.c} opacity={b.o} />
        ))}
      </svg>
      {/* the last frame IS frame 0 of the hook, so the loop cuts invisibly */}
      {handoff > 0.001 ? (
        <AbsoluteFill style={{ opacity: handoff }}>
          <Recreate04 t={0} f={0} fps={30} dur={2.5} variant="arrive" mark={() => Number.NaN} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
