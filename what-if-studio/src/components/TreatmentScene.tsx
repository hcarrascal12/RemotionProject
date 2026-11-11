import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Hero, LOOKS, basePose, Pose, Expr, TreatmentRoom, TreatHead, EcgCart, TREAT, TREAT_APERTURE, lyingAt, Glow } from '../engine';
import { World, ef } from './World';
import { blink, COLOR, HARD, HEAVY, MONO, ShotProps, springAt } from './motion';

// You, on the table in the 1985 bunker. Variants:
//   hookbg   close and red, the alarm going: the ground under the hook
//   wide     the room, the machine over you; a 1985 stamp slams in
//   head     close on your face beside the heart monitor; the trace goes flat on "vida"
//   close    your chest under the machine, a danger circle pulsing where the beam will land
//   machine  up at the machine head from your face, the aperture glowing

const PIP = LOOKS.pipHood;
const CHEST_U = 0.44;
const LIE = lyingAt(CHEST_U);

/** Pip lying on his back along the table, head to the left, face turned to camera. */
const lying = (o: Partial<Pose> = {}): Pose => ({
  ...basePose,
  x: LIE.x,
  y: LIE.y,
  scale: LIE.scale,
  spin: -90,
  yaw: 0.15,
  headTilt: 62,
  armL: { a: 4, b: -4 },
  armR: { a: 4, b: -4 },
  legL: { a: 2, b: 0 },
  legR: { a: -2, b: 0 },
  ...o,
});

/** World position of the chest and the head of the lying pose. */
export const PIP_CHEST = { x: LIE.x, y: LIE.y - 90 * LIE.scale };
export const PIP_HEAD = { x: LIE.x - 92 * LIE.scale, y: LIE.y - 110 * LIE.scale };

const beat = (x: number) => {
  const p = ((x % 1) + 1) % 1;
  if (p < 0.1) return Math.sin((p / 0.1) * Math.PI) * 0.15;
  if (p < 0.14) return -0.2;
  if (p < 0.18) return 1;
  if (p < 0.22) return -0.4;
  if (p < 0.36) return Math.sin(((p - 0.22) / 0.14) * Math.PI) * 0.25;
  return 0;
};

const Danger: React.FC<{ t: number; x: number; y: number; s?: number }> = ({ t, x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} style={{ mixBlendMode: 'screen' }}>
    {[0, 1, 2].map((i) => {
      const ph = (t * 1.6 + i / 3) % 1;
      return <ellipse key={i} rx={20 + ph * 110} ry={(20 + ph * 110) * 0.35} fill="none" stroke={COLOR.red} strokeWidth={6 * (1 - ph)} opacity={1 - ph} />;
    })}
    <ellipse rx={26} ry={9} fill={COLOR.red} opacity={0.6 + 0.2 * Math.sin(t * 5)} />
  </g>
);

export const TreatmentScene: React.FC<ShotProps> = ({ t, f, fps, dur, variant = 'wide', mark }) => {
  const e = ef(t);
  const p = t / Math.max(0.01, dur);

  if (variant === 'hookbg') {
    const pose = lying({ expr: 'shock', look: -0.3, armR: { a: 40 + 8 * Math.sin(t * 9), b: 50 }, armL: { a: 30, b: 40 } });
    return (
      <AbsoluteFill>
        <World cx={PIP_HEAD.x + 70} cy={PIP_HEAD.y + 20} zoom={3.1 - 0.4 * p}>
          <TreatmentRoom t={e} id="th" red={1} alarm veil={0.3} />
          <Hero look={PIP} pose={pose} rimId="rimRed" shadow={0} />
          <TreatHead t={e} glow={1} red={1} />
        </World>
      </AbsoluteFill>
    );
  }

  if (variant === 'head') {
    const flatAt = mark('vida');
    const flat = t >= flatAt;
    const expr: Expr = t < flatAt - 0.6 ? 'worried' : 'shock';
    const pose = lying({ expr, blink: flat ? 1 : 0, look: flat ? 0 : -0.8 });
    const cart = TREAT.P(0.18, 1, 0.5);
    const bpm = flat ? 0 : Math.round(150 + 40 * Math.min(1, t / Math.max(0.1, flatAt)));
    return (
      <AbsoluteFill>
        <World cx={690} cy={PIP_HEAD.y + 90} zoom={3.2 + 0.3 * p}>
          <TreatmentRoom t={e} id="thd" red={flat ? 0.8 : 0.15} veil={0.38} />
          <EcgCart x={cart.x} y={cart.y} s={1.25} flat={flat} trace={(x) => (flat ? 0 : beat(x * 2.6 + t * 3.1))} />
          <Hero look={PIP} pose={pose} rimId={flat ? 'rimRed' : 'rimR'} shadow={0} />
          <TreatHead t={e} glow={0.4} />
        </World>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <g transform="translate(540 330)">
            <rect x={-260} y={-90} width={520} height={150} rx={24} fill="#000000B0" stroke={flat ? COLOR.red : COLOR.green} strokeWidth={6} />
            <text y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={110} fill={flat ? COLOR.red : COLOR.green}>
              {`${bpm} BPM`}
            </text>
          </g>
        </svg>
      </AbsoluteFill>
    );
  }

  if (variant === 'close') {
    const pose = lying({ expr: 'worried', look: -0.2 + 0.4 * Math.sin(t * 2.5), headTilt: 58 });
    return (
      <AbsoluteFill>
        <World cx={PIP_CHEST.x - 40} cy={PIP_CHEST.y + 70} zoom={2.6 + 0.35 * p} rot={-2 + 3 * p}>
          <TreatmentRoom t={e} id="tcl" veil={0.45} />
          <Hero look={PIP} pose={pose} rimId="rimR" shadow={0} />
          <Danger t={t} x={PIP_CHEST.x + 10} y={PIP_CHEST.y - 26} s={1.3} />
          <TreatHead t={e} glow={0.5 + 0.5 * Math.sin(t * 4)} />
          <Glow x={TREAT_APERTURE.x} y={PIP_CHEST.y - 40} r={140} kind="red" o={0.4 + 0.2 * Math.sin(t * 5)} />
        </World>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <text x={540} y={300} textAnchor="middle" fontFamily={MONO} fontSize={44} fill={COLOR.red} opacity={0.75 + 0.25 * Math.sin(t * 3)}>
            ◉ ZONA DE TRATAMIENTO
          </text>
        </svg>
      </AbsoluteFill>
    );
  }

  if (variant === 'machine') {
    const glow = 0.5 + 0.5 * Math.sin(t * 4);
    const pose = lying({ expr: 'shock', look: 0.9, headTilt: 40 });
    return (
      <AbsoluteFill>
        <World cx={TREAT_APERTURE.x + 10} cy={TREAT_APERTURE.y + 90} zoom={3.9 + 0.6 * p} rot={-8 + 6 * p}>
          <TreatmentRoom t={e} id="tmc" veil={0.5} />
          <Hero look={PIP} pose={pose} rimId="rimBlue" shadow={0} />
          <TreatHead t={e} glow={glow} />
          {/* the beam path, faint, before it fires */}
          <rect x={TREAT_APERTURE.x - 14} y={TREAT_APERTURE.y + 10} width={28} height={PIP_CHEST.y - TREAT_APERTURE.y - 30} fill={COLOR.cyan} opacity={0.12 + 0.12 * glow} />
        </World>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <g transform={`translate(540 300) scale(${springAt(f, fps, 0.05, HARD)})`}>
            <rect x={-330} y={-70} width={660} height={110} rx={55} fill="#000000B0" stroke={COLOR.cyan} strokeWidth={5} />
            <text y={8} textAnchor="middle" fontFamily={MONO} fontSize={40} fill={COLOR.cyan}>
              ACELERADOR · 25 MeV
            </text>
          </g>
        </svg>
      </AbsoluteFill>
    );
  }

  // wide
  const stampK = springAt(f, fps, mark('num1985') + 0.45, HARD);
  const pose = lying({ expr: 'neutral', look: -0.5 + 0.3 * Math.sin(t * 2), blink: blink(t + 0.3, 1.4, 0.08) ? 1 : 0 });
  return (
    <AbsoluteFill>
      <World cx={930} cy={560 - 20 * p} zoom={1.85 + 0.2 * p}>
        <TreatmentRoom t={e} id="twd" veil={0.4} />
        <Hero look={PIP} pose={pose} rimId="rimR" shadow={0} />
        <TreatHead t={e} glow={0.3} />
      </World>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        {stampK > 0.01 ? (
          <g transform={`translate(540 330) rotate(-11) scale(${2.6 - 1.6 * stampK})`} opacity={Math.min(1, stampK * 1.5)}>
            <rect x={-330} y={-130} width={660} height={240} rx={18} fill="#00000080" stroke={COLOR.red} strokeWidth={16} />
            <text x={0} y={70} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={210} fill={COLOR.red}>
              1985
            </text>
            <text x={0} y={-80} textAnchor="middle" fontFamily={MONO} fontSize={34} fill={COLOR.red}>
              HOSPITAL · RADIOTERAPIA
            </text>
          </g>
        ) : null}
        <g transform="translate(700 1180)">
          <rect x={-60} y={-40} width={120} height={64} rx={32} fill={COLOR.yellow} stroke="#000" strokeWidth={5} />
          <text y={8} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill="#000">
            TÚ
          </text>
          <path d="M -10 24 L 0 56 L 10 24 Z" fill={COLOR.yellow} stroke="#000" strokeWidth={4} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
