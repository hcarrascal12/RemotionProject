import React from 'react';
import { AbsoluteFill } from 'remotion';
import { LOOKS } from '../engine';
import { blink, COLOR, ease, HARD, HEAVY, lin, MONO, rand, ShotProps, springAt } from './motion';

const OP = LOOKS.mo;

// Keys hammered at full speed with digital sparks, the X-to-E correction typed in under 8 seconds, and the single
// giant key of "un solo clic".

type KeyDef = { x: number; y: number; w: number; label: string };

const ROWS = ['QWERTYUI', 'ASDFGHJK', 'ZXCVBNM↑'];

const KEYS: KeyDef[] = ROWS.flatMap((row, r) =>
  row.split('').map((label, c) => ({ x: 70 + c * 120 + r * 30, y: 980 + r * 150, w: 104, label })),
);

const Key3D: React.FC<{ k: KeyDef; press: number; hot?: string }> = ({ k, press, hot }) => {
  const d = 26;
  const down = press * 18;
  return (
    <g transform={`translate(${k.x} ${k.y + down})`}>
      <path d={`M 0 ${d} L ${k.w} ${d} L ${k.w + 16} ${d + 34 - down} L 16 ${d + 34 - down} Z`} fill="#0D0D12" />
      <rect x={0} y={0} width={k.w} height={k.w} rx={16} fill={hot ?? (press > 0.3 ? '#4B4B5C' : '#2E2E3A')} stroke={press > 0.3 ? COLOR.cyan : '#4A4A58'} strokeWidth={4} />
      <rect x={10} y={8} width={k.w - 20} height={k.w - 26} rx={12} fill="#FFFFFF10" />
      <text x={k.w / 2} y={k.w / 2 + 16} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={44} fill={press > 0.3 ? COLOR.cyan : '#DADAE4'}>
        {k.label}
      </text>
    </g>
  );
};

const Sparks: React.FC<{ t: number; x: number; y: number; seed: number; color: string }> = ({ t, x, y, seed, color }) => {
  if (t < 0 || t > 0.35) return null;
  return (
    <g>
      {Array.from({ length: 9 }, (_, i) => {
        const a = -Math.PI / 2 + (rand(seed + i) - 0.5) * 2.4;
        const v = 600 + rand(seed + i * 3) * 900;
        const px = x + Math.cos(a) * v * t;
        const py = y + Math.sin(a) * v * t + 1600 * t * t;
        return <line key={i} x1={px} y1={py} x2={px - Math.cos(a) * 30} y2={py - Math.sin(a) * 30} stroke={i % 3 ? color : '#FFF'} strokeWidth={6} strokeLinecap="round" opacity={1 - t / 0.35} />;
      })}
    </g>
  );
};

const Monitor: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => (
  <g>
    <rect x={80} y={250} width={920} height={560} rx={44} fill="#C9C2B0" stroke="#8D8673" strokeWidth={8} />
    <rect x={130} y={295} width={820} height={470} rx={36} fill="#031208" />
    <g opacity={0.92 + 0.08 * Math.sin(t * 50)}>{children}</g>
  </g>
);

export const KeyboardFast: React.FC<ShotProps> = ({ t, f, fps, variant = 'fast', mark }) => {
  if (variant === 'edit') {
    const fixAt = mark('letra');
    const typedX = t < fixAt - 0.55;
    const deleting = !typedX && t < fixAt;
    const kE = springAt(f, fps, fixAt, HARD);
    const timer = Math.max(0, 8 - t * 5.2);
    const upPress = deleting && blink(t, 0.3, 0.12) ? 1 : 0;
    const ePress = t >= fixAt && t < fixAt + 0.15 ? 1 : 0;
    return (
      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <rect width={1080} height={1920} fill="#07070C" />
          <Monitor t={t}>
            <text x={170} y={380} fontFamily={MONO} fontSize={38} fill={COLOR.green}>
              MODO DE TRATAMIENTO:
            </text>
            <rect x={170} y={420} width={260} height={220} rx={14} fill="none" stroke={COLOR.green} strokeWidth={6} />
            {typedX ? (
              <text x={300} y={590} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={180} fill={COLOR.green}>
                X
              </text>
            ) : null}
            {deleting && blink(t, 0.4, 0.25) ? <rect x={250} y={600} width={100} height={18} fill={COLOR.green} /> : null}
            {t >= fixAt ? (
              <text x={300} y={590} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={180} fill={COLOR.yellow} transform={`translate(300 520) scale(${0.4 + 0.6 * kE}) translate(-300 -520)`}>
                E
              </text>
            ) : null}
            <text x={480} y={500} fontFamily={MONO} fontSize={36} fill={COLOR.green}>
              X = RAYOS X
            </text>
            <text x={480} y={560} fontFamily={MONO} fontSize={36} fill={COLOR.green}>
              E = ELECTRONES
            </text>
            <g transform="translate(700 690)">
              <rect x={-150} y={-50} width={300} height={80} rx={40} fill={COLOR.red} />
              <text x={0} y={8} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={44} fill="#FFF">
                {`< ${timer.toFixed(1)} SEG`}
              </text>
            </g>
          </Monitor>
          {[
            { k: { x: 300, y: 960, w: 190, label: '↑' }, p: upPress },
            { k: { x: 590, y: 960, w: 190, label: 'E' }, p: ePress },
          ].map(({ k, p }, i) => (
            <g key={i} transform={`translate(${k.x + k.w / 2} ${k.y}) scale(1.6) translate(${-k.x - k.w / 2} ${-k.y})`}>
              <Key3D k={k} press={p} hot={p ? '#5A4B00' : undefined} />
            </g>
          ))}
          <Sparks t={t - fixAt} x={685} y={1000} seed={7} color={COLOR.yellow} />
          {(() => {
            // the operator's hand, from below: the olive sleeve and the rig's pointing mitten, scaled up
            const hx = t < fixAt - 0.1 ? 395 : 685;
            const hy = 1110 + (upPress || ePress ? 26 : 0);
            return (
              <g>
                <path d={`M ${hx + 20} ${hy + 160} Q ${hx + 80} ${hy + 420} ${hx + 260} 2100`} stroke={OP.line} strokeWidth={190} fill="none" strokeLinecap="round" />
                <path d={`M ${hx + 20} ${hy + 160} Q ${hx + 80} ${hy + 420} ${hx + 260} 2100`} stroke={OP.jacket} strokeWidth={168} fill="none" strokeLinecap="round" />
                <g transform={`translate(${hx} ${hy + 120}) rotate(180) scale(6.4)`}>
                  <rect x={-4} y={10} width={8} height={24} rx={4} fill={OP.hand} stroke={OP.line} strokeWidth={2.2} />
                  <path d="M -11 -2 Q -14 14 -6 18 L 7 18 Q 14 14 11 -2 Z" fill={OP.hand} stroke={OP.line} strokeWidth={2.4} strokeLinejoin="round" />
                  <ellipse cx={10} cy={6} rx={4.5} ry={7} fill={OP.hand} stroke={OP.line} strokeWidth={2.2} />
                </g>
              </g>
            );
          })()}
          <text x={540} y={1215} textAnchor="middle" fontFamily={MONO} fontSize={36} fill="#8A8AA0" opacity={ease(t, 0, 0.3)}>
            EL OPERADOR CORRIGE UNA LETRA
          </text>
        </svg>
      </AbsoluteFill>
    );
  }

  // fast: the whole board hammered, two or three keys at a time
  const rate = 16;
  const step = Math.floor(t * rate);
  const phase = t * rate - step;
  const pressed = new Set([Math.floor(rand(step) * KEYS.length), Math.floor(rand(step + 0.5) * KEYS.length), Math.floor(rand(step + 0.25) * KEYS.length)]);
  const tilt = -10 + 6 * Math.sin(t * 2.2);
  const flying = Array.from({ length: 10 }, (_, i) => {
    const born = i * 0.17;
    const age = t - born;
    if (age < 0 || age > 0.8) return null;
    const x = 140 + rand(i * 11) * 800 + age * (rand(i) - 0.5) * 600;
    const y = 960 - age * 900 + age * age * 500;
    return (
      <text key={i} x={x} y={y} fontFamily={HEAVY} fontWeight={900} fontSize={90 + rand(i * 5) * 70} fill={i % 2 ? COLOR.cyan : COLOR.yellow} opacity={1 - age / 0.8} transform={`rotate(${(rand(i * 7) - 0.5) * 60} ${x} ${y})`}>
        {['X', 'E', '↑', 'X', 'E', 'P', '↵', 'X', 'E', '↑'][i]}
      </text>
    );
  });
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <rect width={1080} height={1920} fill="#06060B" />
        <circle cx={540} cy={1150} r={700} fill={COLOR.cyan} opacity={0.08 + 0.03 * Math.sin(t * 6)} />
        <g transform={`translate(540 1150) rotate(${tilt}) scale(1.15) translate(-540 -1150)`}>
          <rect x={40} y={940} width={1050} height={520} rx={40} fill="#141420" stroke="#2A2A3A" strokeWidth={6} />
          {KEYS.map((k, i) => {
            const p = pressed.has(i) ? Math.sin(Math.PI * Math.min(1, phase * 1.4)) : 0;
            return <Key3D key={i} k={k} press={p} />;
          })}
        </g>
        {[...pressed].map((i) => (
          <Sparks key={`${step}-${i}`} t={phase / rate} x={KEYS[i].x + 70} y={KEYS[i].y + 140} seed={step * 31 + i} color={COLOR.cyan} />
        ))}
        {flying}
        <text x={540} y={640} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={120} fill="#FFF" stroke="#000" strokeWidth={10} paintOrder="stroke" opacity={lin(t, 0, 0.1)}>
          TECLEO RÁPIDO
        </text>
        <text x={540} y={720} textAnchor="middle" fontFamily={MONO} fontSize={38} fill={COLOR.cyan}>
          {`EDITANDO${'.'.repeat(1 + (Math.floor(t * 8) % 3))}`}
        </text>
      </svg>
    </AbsoluteFill>
  );
};
