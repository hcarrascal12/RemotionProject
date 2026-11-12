import React from 'react';
import { AbsoluteFill } from 'remotion';
import { LOOKS, basePose, Pose, Expr, TreatmentRoom, TreatHead, EcgCart, TREAT, TREAT_APERTURE, lyingAt, Glow } from '../engine';
import { CineCamera, edgeFg, ef } from './CineCamera';
import { CharacterRig } from './CharacterRig';
import { COLOR, HARD, HEAVY, MONO, lin, rand, ShotProps, springAt } from './motion';
import { Rim } from '../design/devArtificial';

// You, on the table in the 1985 bunker. Variants (all Pip, all in the room, never on an empty background):
//   hookbg   close and red under the hook: the alarm going, sweat, eyes on the key
//   wide     the room, the machine over you; the 1985 stamp slams in and a key cap clicks on "clic"
//   journey  one continuous camera: your face and the heart monitor (flat on "vida"), then your chest under the
//            machine with the danger circle, then up at the machine head. Two whip moves, no cuts.
//   hit      the first beam lands on you, without the shield
//   hit2     the second beam lands on you

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

const smooth = (x: number) => {
  const c = Math.max(0, Math.min(1, x));
  return c * c * (3 - 2 * c);
};
const mix = (a: number, b: number, u: number) => a + (b - a) * u;

const Danger: React.FC<{ t: number; x: number; y: number; s?: number }> = ({ t, x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} style={{ mixBlendMode: 'screen' }}>
    {[0, 1, 2].map((i) => {
      const ph = (t * 1.6 + i / 3) % 1;
      return <ellipse key={i} rx={20 + ph * 110} ry={(20 + ph * 110) * 0.35} fill="none" stroke={COLOR.red} strokeWidth={6 * (1 - ph)} opacity={1 - ph} />;
    })}
    <ellipse rx={26} ry={9} fill={COLOR.red} opacity={0.6 + 0.2 * Math.sin(t * 5)} />
  </g>
);

const Pill: React.FC<{ y?: number; k: number; label: string; color: string; ink?: string; w?: number }> = ({ y = 330, k, label, color, ink = '#000', w = 660 }) =>
  k > 0.01 ? (
    <g transform={`translate(540 ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
      <rect x={-w / 2} y={-62} width={w} height={124} rx={62} fill={color} stroke="#000" strokeWidth={8} />
      <text y={22} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={label.length > 14 ? 62 : 74} fill={ink}>
        {label}
      </text>
    </g>
  ) : null;

export const TreatmentScene: React.FC<ShotProps> = ({ t, f, fps, dur, variant = 'wide', mark }) => {
  const e = ef(t);
  const p = t / Math.max(0.01, dur);

  if (variant === 'hookbg') {
    const pose = lying({ expr: 'shock', armR: { a: 40 + 8 * Math.sin(t * 9), b: 50 }, armL: { a: 30, b: 40 } });
    const cx = PIP_HEAD.x + 70;
    const cy = PIP_HEAD.y + 20;
    const zoom = 3.1 - 0.4 * p;
    return (
      <AbsoluteFill>
        <CineCamera cx={cx} cy={cy} zoom={zoom} tint="red" vignette={0.75} light={{ x: PIP_HEAD.x + 40, y: PIP_HEAD.y - 30, r: 330, color: COLOR.red, o: 0.5 }} fg={edgeFg(cx, cy, zoom)}>
          <TreatmentRoom t={e} id="th" red={1} alarm veil={0.3} />
          <CharacterRig castShadow={0.7} look={PIP} pose={pose} t={t} rim="red" gaze={0.9} sweat={1} seed={3} />
          <TreatHead t={e} glow={1} red={1} />
        </CineCamera>
      </AbsoluteFill>
    );
  }

  if (variant === 'journey') {
    // t=0 is the start of "te costaría la vida"; the first whip lands where the sentence about the machine starts,
    // the second where "radioterapia" begins.
    const tA = mark('bStart') - 0.1;
    const tB = mark('radio') - 0.1;
    const u1 = smooth((t - (tA - 0.22)) / 0.46);
    const u2 = smooth((t - (tB - 0.22)) / 0.46);
    const flatAt = mark('vida');
    const flat = t >= flatAt;
    const H = { cx: 690, cy: PIP_HEAD.y + 90, zoom: 3.2, rot: 0 };
    const C = { cx: PIP_CHEST.x - 40, cy: PIP_CHEST.y + 70, zoom: 2.6, rot: -2 };
    const M = { cx: TREAT_APERTURE.x + 10, cy: TREAT_APERTURE.y + 90, zoom: 3.9, rot: -7 };
    const pick = (k: 'cx' | 'cy' | 'zoom' | 'rot') => mix(mix(H[k], C[k], u1), M[k], u2);
    const zoom = pick('zoom') + 0.28 * p;
    const cx = pick('cx');
    const cy = pick('cy');
    const rot = pick('rot') + 2.2 * p;
    const seg: 'head' | 'close' | 'machine' = t < tA ? 'head' : t < tB ? 'close' : 'machine';
    const expr: Expr = seg === 'head' ? (flat ? 'shock' : 'worried') : seg === 'close' ? 'worried' : 'shock';
    const pose = lying({
      expr,
      headTilt: mix(mix(62, 58, u1), 40, u2),
      blink: flat && seg === 'head' ? 1 : 0,
    });
    const gaze = seg === 'head' ? (flat ? 0 : -0.8) : seg === 'close' ? -0.2 : 0.9;
    const rim: Rim = seg === 'head' ? (flat ? 'red' : 'green') : seg === 'close' ? 'red' : 'blue';
    const cart = TREAT.P(0.18, 1, 0.5);
    const bpm = flat ? 0 : Math.round(150 + 40 * Math.min(1, t / Math.max(0.1, flatAt)));
    const redLvl = flat ? 0.75 * (1 - u1) + 0.15 : 0.15 + 0.1 * u1;
    const lights = [
      { x: cart.x, y: cart.y - 150, r: 300, color: flat ? COLOR.red : COLOR.green, o: 0.5 * (1 - u1) },
      { x: PIP_CHEST.x + 10, y: PIP_CHEST.y - 20, r: 260, color: COLOR.red, o: 0.4 * u1 * (1 - u2) },
      { x: TREAT_APERTURE.x, y: TREAT_APERTURE.y + 40, r: 240, color: COLOR.cyan, o: 0.5 * u2 },
    ];
    const glow = 0.5 + 0.5 * Math.sin(t * 4);
    return (
      <AbsoluteFill>
        <CineCamera cx={cx} cy={cy} zoom={zoom} rot={rot} tint={seg === 'head' ? (flat ? 'red' : 'green') : seg === 'close' ? 'red' : 'blue'} vignette={0.7} light={lights} fg={edgeFg(cx, cy, zoom)}>
          <TreatmentRoom t={e} id="tjr" red={redLvl} veil={0.4} />
          <EcgCart x={cart.x} y={cart.y} s={1.25} flat={flat} trace={(x) => (flat ? 0 : beat(x * 2.6 + t * 3.1))} />
          <CharacterRig castShadow={0.7} look={PIP} pose={pose} t={t} rim={rim} gaze={gaze} sweat={0.85} seed={5} />
          <TreatHead t={e} glow={seg === 'machine' ? glow : 0.4} />
          {u1 > 0.4 && u2 < 0.6 ? <Danger t={t} x={PIP_CHEST.x + 10} y={PIP_CHEST.y - 26} s={1.3} /> : null}
          {u2 > 0.2 ? <rect x={TREAT_APERTURE.x - 14} y={TREAT_APERTURE.y + 10} width={28} height={PIP_CHEST.y - TREAT_APERTURE.y - 30} fill={COLOR.cyan} opacity={(0.1 + 0.1 * glow) * u2} /> : null}
          <Glow x={TREAT_APERTURE.x} y={PIP_CHEST.y - 40} r={140} kind="red" o={(0.35 + 0.15 * Math.sin(t * 5)) * u1 * (1 - u2)} />
        </CineCamera>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <g opacity={1 - smooth((t - tA) / 0.25)} transform="translate(540 330)">
            <rect x={-260} y={-90} width={520} height={150} rx={24} fill="#000000B0" stroke={flat ? COLOR.red : COLOR.green} strokeWidth={6} />
            <text y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={110} fill={flat ? COLOR.red : COLOR.green}>
              {`${bpm} BPM`}
            </text>
          </g>
          <text x={540} y={300} textAnchor="middle" fontFamily={MONO} fontSize={44} fill={COLOR.red} opacity={smooth((t - tA) / 0.25) * (1 - smooth((t - tB) / 0.25)) * (0.75 + 0.25 * Math.sin(t * 3))}>
            ◉ ZONA DE TRATAMIENTO
          </text>
          <g transform="translate(540 300)" opacity={smooth((t - tB) / 0.25)}>
            <rect x={-330} y={-70} width={660} height={110} rx={55} fill="#000000B0" stroke={COLOR.cyan} strokeWidth={5} />
            <text y={8} textAnchor="middle" fontFamily={MONO} fontSize={40} fill={COLOR.cyan}>
              ACELERADOR · 25 MeV
            </text>
          </g>
        </svg>
      </AbsoluteFill>
    );
  }

  if (variant === 'hit' || variant === 'hit2') {
    const second = variant === 'hit2';
    const hitAt = mark(second ? 'descarga' : 'escudo');
    const beamIn = lin(t, hitAt - 0.28, hitAt - 0.04);
    const after = t - hitAt;
    const beamOn = beamIn > 0 && after < 0.9;
    const struck = after >= 0;
    const recoil = struck ? Math.exp(-after / 0.25) : 0;
    const pose = lying({
      expr: struck ? (after > 0.55 ? 'dizzy' : 'shock') : 'worried',
      headTilt: 58 - 14 * recoil,
      armL: { a: 4 + 70 * recoil, b: 30 * recoil },
      armR: { a: 4 + 62 * recoil, b: 26 * recoil },
      squash: -0.04 * recoil,
      spin: -90 + 3 * recoil * Math.sin(after * 40),
    });
    const cx = PIP_CHEST.x - 20;
    const cy = PIP_CHEST.y - 30;
    const zoom = 2.3 + 0.3 * p;
    const fade = struck ? Math.max(0, 1 - Math.max(0, after - 0.6) / 0.3) : 1;
    const bx = TREAT_APERTURE.x;
    const by0 = TREAT_APERTURE.y + 10;
    const by1 = by0 + (PIP_CHEST.y - 30 - by0) * beamIn;
    const k = springAt(f, fps, Math.max(0, hitAt - 0.3), HARD);
    return (
      <AbsoluteFill>
        <CineCamera
          cx={cx}
          cy={cy}
          zoom={zoom}
          tint="red"
          vignette={0.8}
          light={{ x: PIP_CHEST.x, y: PIP_CHEST.y - 30, r: 340, color: COLOR.red, o: (struck ? 0.6 : 0.3) * fade }}
          fg={edgeFg(cx, cy, zoom)}
        >
          <TreatmentRoom t={e} id={second ? 'th2' : 'th1'} red={struck ? 0.7 * fade + 0.15 : 0.15 + 0.4 * beamIn} alarm={second} veil={0.4} />
          <CharacterRig castShadow={0.7} look={PIP} pose={pose} t={t} rim="red" gaze={struck ? 0.2 : -0.3} sweat={1} seed={second ? 9 : 7} />
          <TreatHead t={e} glow={0.6 + 0.4 * beamIn} red={1} />
          {beamOn ? (
            <g opacity={fade} style={{ mixBlendMode: 'screen' }}>
              <rect x={bx - 36} y={by0} width={72} height={Math.max(0, by1 - by0)} fill={COLOR.red} opacity={0.55} />
              <rect x={bx - 18} y={by0} width={36} height={Math.max(0, by1 - by0)} fill={COLOR.red} />
              <rect x={bx - 6} y={by0} width={12} height={Math.max(0, by1 - by0)} fill="#FFFFFF" />
              {struck ? <circle cx={bx} cy={PIP_CHEST.y - 30} r={40 + 50 * Math.min(1, after / 0.15)} fill="#FFE0E0" opacity={Math.max(0, 0.55 - after / 0.45)} /> : null}
            </g>
          ) : null}
        </CineCamera>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <Pill k={k} label={second ? 'SEGUNDA DESCARGA' : 'SIN ESCUDO'} color={COLOR.red} ink="#FFF" w={second ? 780 : 560} />
        </svg>
      </AbsoluteFill>
    );
  }

  // wide
  const stampK = springAt(f, fps, mark('num1985') + 0.45, HARD);
  const clicAt = mark('clic');
  const clic = t - clicAt;
  const clicK = clic >= 0 ? springAt(f, fps, clicAt, HARD) : 0;
  const pose = lying({ expr: 'neutral', look: -0.5, blink: 0 });
  return (
    <AbsoluteFill>
      <CineCamera
        cx={930}
        cy={560 - 20 * p}
        zoom={1.85 + 0.2 * p}
        tint="blue"
        vignette={0.65}
        light={{ x: 1010, y: 520, r: 360, color: COLOR.cyan, o: 0.25 }}
        fg={edgeFg(930, 560, 1.95)}
      >
        <TreatmentRoom t={e} id="twd" veil={0.4} />
        <CharacterRig castShadow={0.7} look={PIP} pose={pose} t={t} rim="blue" gaze={-0.5} sweat={0.35} seed={2} />
        <TreatHead t={e} glow={0.3} />
      </CineCamera>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        {stampK > 0.01 ? (
          <g transform={`translate(540 380) rotate(-11) scale(${2.6 - 1.6 * stampK})`} opacity={Math.min(1, stampK * 1.5)}>
            <rect x={-330} y={-130} width={660} height={240} rx={18} fill="#00000080" stroke={COLOR.red} strokeWidth={16} />
            <text x={0} y={70} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={210} fill={COLOR.red}>
              1985
            </text>
            <text x={0} y={-80} textAnchor="middle" fontFamily={MONO} fontSize={34} fill={COLOR.red}>
              HOSPITAL · RADIOTERAPIA
            </text>
          </g>
        ) : null}
        {/* "un solo clic": a key cap slams down in the middle of the frame, with a burst */}
        {clic >= 0 && clic < 0.8 ? (
          <g opacity={Math.max(0, 1 - Math.max(0, clic - 0.45) / 0.35)}>
            {clic < 0.5
              ? Array.from({ length: 14 }, (_, i) => {
                  const a = (i / 14) * Math.PI * 2 + rand(i) * 0.2;
                  const r0 = 150 + clic * 900;
                  return <line key={i} x1={540 + Math.cos(a) * r0} y1={760 + Math.sin(a) * r0} x2={540 + Math.cos(a) * (r0 + 120)} y2={760 + Math.sin(a) * (r0 + 120)} stroke={i % 2 ? COLOR.red : COLOR.yellow} strokeWidth={12} strokeLinecap="round" opacity={1 - clic / 0.5} />;
                })
              : null}
            <g transform={`translate(540 ${760 + (1 - clicK) * -80}) scale(${0.6 + 0.4 * clicK})`}>
              <rect x={-150} y={-60} width={300} height={290} rx={44} fill="#12060A" />
              <rect x={-150} y={-90} width={300} height={290} rx={44} fill="#2C2C38" stroke={COLOR.red} strokeWidth={10} />
              <text y={80} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={200} fill={COLOR.white}>
                ↵
              </text>
            </g>
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
