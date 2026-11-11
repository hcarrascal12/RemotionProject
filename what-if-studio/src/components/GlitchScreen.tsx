import React from 'react';
import { AbsoluteFill } from 'remotion';
import { blink, COLOR, ease, HARD, HEAVY, lin, MONO, rand, ShotProps, springAt } from './motion';

// The 1985 console: green phosphor on a beige CRT. Variants:
//   confused  the screen says E, the machine is set for X
//   text      the treatment screen typing out
//   zoom      closer on a garbled line
//   malf      brusque zoom into MALFUNCTION 54
//   nada      TREATMENT PAUSE, dose 6: it looks as if nothing happened

const GLYPHS = '#%&@$?!<>/\\|=+*0123456789ABCDEFX';

const garble = (s: string, f: number, amount: number) =>
  s
    .split('')
    .map((c, i) => (c !== ' ' && rand(f * 0.37 + i * 3.3) < amount ? GLYPHS[Math.floor(rand(f + i) * GLYPHS.length)] : c))
    .join('');

const Crt: React.FC<{ t: number; f: number; scale?: number; ox?: number; oy?: number; tint?: string; children: React.ReactNode }> = ({
  t,
  f,
  scale = 1,
  ox = 540,
  oy = 860,
  tint = COLOR.green,
  children,
}) => {
  const flicker = 0.9 + 0.1 * rand(f * 1.7);
  const roll = (t * 260) % 700;
  return (
    <g transform={`translate(${ox} ${oy}) scale(${scale}) translate(-540 -860)`}>
      <rect x={20} y={330} width={1040} height={1060} rx={70} fill="#CFC7B2" stroke="#8D8673" strokeWidth={10} />
      <rect x={70} y={380} width={940} height={850} rx={90} fill="#021006" />
      <g opacity={flicker} style={{ filter: `drop-shadow(0 0 10px ${tint})` }}>
        {children}
      </g>
      <rect x={70} y={380 + roll} width={940} height={60} fill={tint} opacity={0.06} />
      <rect x={70} y={380} width={940} height={850} rx={90} fill="url(#crtGlass)" />
      <rect x={440} y={1270} width={200} height={60} rx={12} fill="#9C947F" />
      <circle cx={930} cy={1300} r={18} fill={COLOR.green} opacity={0.6 + 0.4 * Math.sin(t * 3)} />
    </g>
  );
};

const Defs: React.FC = () => (
  <defs>
    <radialGradient id="crtGlass" cx="35%" cy="25%" r="90%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.14} />
      <stop offset="60%" stopColor="#FFFFFF" stopOpacity={0} />
      <stop offset="100%" stopColor="#000" stopOpacity={0.55} />
    </radialGradient>
  </defs>
);

const LINES = [
  'PATIENT NAME  : ------',
  'TREATMENT MODE: FIX',
  'BEAM TYPE     : E',
  'ENERGY (MeV)  : 25',
  'UNIT RATE/MIN : 200',
  'MONITOR UNITS : 200',
];

export const GlitchScreen: React.FC<ShotProps> = ({ t, f, fps, variant = 'text', mark, dur }) => {
  const bg = <rect width={1080} height={1920} fill="#050806" />;
  const mono = (x: number, y: number, s: string, size = 40, fill: string = COLOR.green, extra: React.SVGProps<SVGTextElement> = {}) => (
    <text x={x} y={y} fontFamily={MONO} fontSize={size} fill={fill} {...extra}>
      {s}
    </text>
  );

  if (variant === 'confused') {
    const k = springAt(f, fps, 0, HARD);
    const q = 1 + 0.05 * Math.sin(t * 5);
    const split = (rand(Math.floor(f / 3)) - 0.5) * 26;
    return (
      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <Defs />
          {bg}
          <Crt t={t} f={f}>
            <line x1={540} y1={420} x2={540} y2={1190} stroke={COLOR.green} strokeWidth={4} strokeDasharray="20 16" />
            {mono(120, 480, 'PANTALLA', 46)}
            <text x={300} y={760} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={300} fill={COLOR.green} transform={`translate(${split} 0)`}>
              E
            </text>
            {mono(150, 880, '✓ CORREGIDO', 40)}
            {mono(600, 480, 'MÁQUINA', 46, COLOR.red)}
            <text x={780} y={760} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={300} fill={COLOR.red} transform={`translate(${-split} 0)`}>
              X
            </text>
            {mono(600, 880, '✗ SIN CAMBIAR', 40, COLOR.red)}
            {mono(150, 1080, garble('CONFIG ≠ PANTALLA', f, 0.25), 44, COLOR.yellow)}
          </Crt>
          <g transform={`translate(540 1730) scale(${k * q})`}>
            <circle r={130} fill={COLOR.yellow} stroke="#000" strokeWidth={10} />
            <text y={70} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={200} fill="#000">
              ?
            </text>
          </g>
        </svg>
      </AbsoluteFill>
    );
  }

  if (variant === 'malf') {
    const errAt = mark('error');
    const zoom = t < errAt ? lin(t, 0, errAt, 1, 1.15) : ease(t, errAt, errAt + 0.15, 1.15, 1.32);
    const show = t >= errAt - 0.05;
    const jitter = show ? (rand(f) - 0.5) * 10 : 0;
    const onText = true;
    return (
      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <Defs />
          {bg}
          <Crt t={t} f={f} scale={zoom} oy={760}>
            {LINES.slice(0, 4).map((l, i) => (
              <React.Fragment key={i}>{mono(130, 480 + i * 62, l, 38, COLOR.green, { opacity: show ? 0.35 : 1 })}</React.Fragment>
            ))}
            {show ? (
              <g transform={`translate(${540 + jitter} 820)`}>
                <rect x={-370} y={-90} width={740} height={140} fill={onText ? COLOR.green : '#021006'} />
                <text x={0} y={15} textAnchor="middle" fontFamily={MONO} fontSize={72} fontWeight={700} fill={onText ? '#021006' : COLOR.green}>
                  MALFUNCTION 54
                </text>
              </g>
            ) : null}
          </Crt>
        </svg>
      </AbsoluteFill>
    );
  }

  if (variant === 'manual') {
    // the equipment manual, open on the error codes: 54 has no explanation
    const open = springAt(f, fps, 0, HARD);
    const hl = springAt(f, fps, mark('codigo'), HARD);
    const rows = [
      ['51', 'BEAM TYPE INVALID'],
      ['52', 'ENERGY OUT OF RANGE'],
      ['53', 'TABLE NOT IN POSITION'],
      ['54', ''],
      ['55', 'DOSE RATE HIGH'],
    ];
    return (
      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <Defs />
          {bg}
          <g transform={`translate(540 800) scale(${0.6 + 0.4 * open}) rotate(${(1 - open) * -6}) translate(-540 -800)`}>
            <rect x={90} y={400} width={900} height={800} rx={20} fill="#E7DFC9" stroke="#8D8673" strokeWidth={10} />
            <rect x={528} y={400} width={24} height={800} fill="#B9B09A" />
            <text x={140} y={490} fontFamily={MONO} fontSize={38} fill="#3A352A">
              MANUAL · CÓDIGOS DE ERROR
            </text>
            {rows.map(([code, text], i) => {
              const y = 590 + i * 100;
              const is54 = code === '54';
              return (
                <g key={code}>
                  {is54 ? <rect x={120} y={y - 56} width={840} height={84} rx={10} fill={COLOR.yellow} opacity={0.35 + 0.65 * hl} /> : null}
                  <text x={140} y={y} fontFamily={HEAVY} fontWeight={900} fontSize={56} fill={is54 ? '#B01E1E' : '#3A352A'}>
                    {code}
                  </text>
                  <text x={260} y={y - 4} fontFamily={MONO} fontSize={34} fill="#3A352A">
                    {text}
                  </text>
                  {is54 ? (
                    <text x={260} y={y - 4} fontFamily={MONO} fontSize={34} fill="#B01E1E">
                      {'sin explicación'.toUpperCase()}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>
          <g transform={`translate(540 1500) scale(${hl})`} opacity={Math.min(1, hl * 1.4)}>
            <rect x={-330} y={-90} width={660} height={150} rx={75} fill={COLOR.yellow} stroke="#000" strokeWidth={10} />
            <text y={22} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={84} fill="#000">
              54 = ¿?
            </text>
          </g>
        </svg>
      </AbsoluteFill>
    );
  }

  if (variant === 'nada') {
    const k = springAt(f, fps, mark('pausa'), HARD);
    return (
      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <Defs />
          {bg}
          <Crt t={t} f={f} scale={1 + 0.05 * t}>
            {mono(130, 490, 'TREATMENT PAUSE', 52)}
            {mono(130, 580, 'MALFUNCTION 54', 40, COLOR.green, { opacity: 0.5 })}
            {mono(130, 700, 'DOSE DELIVERED:', 46)}
            <text x={760} y={760} fontFamily={HEAVY} fontWeight={900} fontSize={170} fill={COLOR.green}>
              6
            </text>
            {mono(130, 960, '> PRESS TO PROCEED', 50, COLOR.yellow, { opacity: 0.7 + 0.3 * Math.sin(t * 3) })}
          </Crt>
          <g transform={`translate(540 1730) scale(${k})`} opacity={Math.min(1, k * 1.4)}>
            <rect x={-300} y={-100} width={600} height={170} rx={85} fill={COLOR.green} stroke="#000" strokeWidth={10} />
            <text x={0} y={25} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={88} fill="#000">
              ¿PAUSADO?
            </text>
          </g>
        </svg>
      </AbsoluteFill>
    );
  }

  // text and zoom: the treatment screen, typed out and then garbled
  const isZoom = variant === 'zoom';
  const typed = Math.floor(t * 70);
  const zoom = isZoom ? 1.65 + 0.25 * (t / dur) : 1 + 0.06 * t;
  let budget = isZoom ? 999 : typed;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <Defs />
        {bg}
        <Crt t={t} f={f} scale={zoom} oy={isZoom ? 980 : 860} ox={isZoom ? 470 : 540}>
          {LINES.map((l, i) => {
            const shown = l.slice(0, Math.max(0, budget));
            budget -= l.length;
            return <React.Fragment key={i}>{mono(130, 480 + i * 64, shown, 40)}</React.Fragment>;
          })}
          {isZoom
            ? mono(130, 950, garble('ERROR DE SISTEMA  ???', f, 0.55), 46, COLOR.yellow)
            : blink(t, 1.0, 0.6)
              ? <rect x={130 + (typed % 22) * 24} y={900} width={24} height={44} fill={COLOR.green} />
              : null}
          {isZoom ? mono(130, 1030, garble('MENSAJE: ?? ?? ??', f, 0.4), 46, COLOR.green) : null}
        </Crt>
      </svg>
    </AbsoluteFill>
  );
};
