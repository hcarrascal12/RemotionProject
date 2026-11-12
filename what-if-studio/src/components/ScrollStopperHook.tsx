import React from 'react';
import { AbsoluteFill } from 'remotion';
import { blink, COLOR, ease, fmtThousands, HARD, HEAVY, lin, MONO, rand, ShotProps, springAt } from './motion';
import { Trefoil } from './Fx';
import { TreatmentScene } from './TreatmentScene';
import { KineticTitle } from './KineticTitle';
import { DepthBackdrop } from './Backdrop';
import { BrandSeal } from './BrandSeal';

// Frame 0 is already at full action: a blinking red alert zooming out from 1.1x (the whole banner is readable on
// the very first frame, which is what a feed shows as the cover), a dose counter firing from 0 to
// 25,000 in 0.8 s, and the hook line slammed in two hits with a stiff spring.

const COUNT_TO = 25000;
const COUNT_TIME = 0.8;
const SEAL_AT = 0.9;
const SEAL_X = 540;
const SEAL_Y = 1650;

/** The red alert panel and background; shared with the loop-out so the last frame cuts cleanly into the first. */
/** The alert's zoom on frame 0, and on the last frame of the loop, so the loop cuts on an identical picture. */
export const HOOK_ZOOM0 = 1.1;

export const AlertField: React.FC<{ t: number; f: number; zoom: number; bg?: number; banner?: boolean }> = ({ t, f, zoom, bg = 1, banner = true }) => {
  const strobe = blink(t, 1 / 6);
  const panelOn = blink(t, 0.25, 0.17);
  return (
    <>
      <rect width={1080} height={1920} fill={strobe ? '#3A0004' : '#150003'} opacity={bg} />
      <circle cx={540} cy={420} r={900} fill="url(#alertGlow)" opacity={strobe ? 0.9 : 0.55} />
      {/* speed lines bursting out of the centre */}
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2 + rand(i) * 0.2;
        const r0 = 160 + ((f * 38 + i * 70) % 900);
        return (
          <line
            key={i}
            x1={540 + Math.cos(a) * r0}
            y1={960 + Math.sin(a) * r0}
            x2={540 + Math.cos(a) * (r0 + 220)}
            y2={960 + Math.sin(a) * (r0 + 220)}
            stroke={COLOR.red}
            strokeWidth={6}
            opacity={0.45}
          />
        );
      })}
      {banner ? (
      <g transform={`translate(540 360) scale(${zoom}) translate(-540 -360)`}>
        <rect x={70} y={280} width={940} height={170} rx={30} fill={panelOn ? COLOR.red : '#8A0710'} stroke="#FFF" strokeWidth={8} />
        <g transform="translate(170 365) scale(0.85)">
          <path d="M 0 -62 L 66 52 L -66 52 Z" fill={panelOn ? '#FFF' : COLOR.yellow} stroke="#000" strokeWidth={6} strokeLinejoin="round" />
          <rect x={-7} y={-28} width={14} height={46} fill="#000" />
          <circle cx={0} cy={34} r={8} fill="#000" />
        </g>
        <text x={600} y={392} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={78} fill="#FFF" textLength={720} lengthAdjust="spacingAndGlyphs">
          ALERTA: RADIACIÓN
        </text>
      </g>
      ) : null}
    </>
  );
};

export const AlertDefs: React.FC = () => (
  <defs>
    <radialGradient id="alertGlow">
      <stop offset="0%" stopColor={COLOR.red} stopOpacity={0.85} />
      <stop offset="100%" stopColor={COLOR.red} stopOpacity={0} />
    </radialGradient>
  </defs>
);

export const ScrollStopperHook: React.FC<ShotProps> = (props) => {
  const { t, f, fps } = props;
  const zoom = ease(t, 0, 0.45, HOOK_ZOOM0, 1) * (1 + 0.02 * Math.sin(t * 9));
  const p = Math.min(1, t / COUNT_TIME);
  const value = COUNT_TO * Math.pow(p, 2.4);
  const peaked = t >= COUNT_TIME;
  const k1 = springAt(f, fps, -0.14, HARD); // pre-rolled: frame 0 already shows the warning, which is what the feed shows
  const k2 = springAt(f, fps, 0.5, HARD);
  const counterShake = peaked ? Math.exp(-(t - COUNT_TIME) / 0.15) * 14 : 0;
  const iconK = springAt(f, fps, 1.9, HARD);
  const pulse = 1 + 0.05 * Math.sin(t * 18);
  return (
    <AbsoluteFill>
      {/* you, on the table, the alarm going: the ground the hook slams onto */}
      <TreatmentScene {...props} variant="hookbg" />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <AlertDefs />
        <AlertField t={t} f={f} zoom={zoom} bg={0.6} />
        <KineticTitle text="NO PRESIONES" y={620} size={150} k={k1} tilt={-8} />
        <KineticTitle text="ESA TECLA" y={820} size={210} k={k2} tilt={7} />
        {/* the dose counter */}
        <g transform={`translate(${540 + (rand(f) - 0.5) * counterShake} ${1050 + (rand(f + 9) - 0.5) * counterShake}) scale(${pulse})`}>
          <rect x={-420} y={-130} width={840} height={230} rx={24} fill="#000" stroke={peaked && blink(t, 0.2) ? COLOR.red : COLOR.yellow} strokeWidth={8} />
          <text x={-380} y={-72} fontFamily={MONO} fontSize={40} fill={COLOR.yellow}>
            DOSIS
          </text>
          <text x={150} y={62} textAnchor="end" fontFamily={HEAVY} fontWeight={900} fontSize={150} fill={peaked ? COLOR.red : COLOR.yellow}>
            {fmtThousands(value)}
          </text>
          <text x={175} y={60} fontFamily={HEAVY} fontWeight={900} fontSize={64} fill="#FFF">
            RAD
          </text>
          <rect x={-380} y={78} width={760} height={12} fill="#330000" />
          <rect x={-380} y={78} width={760 * p} height={12} fill={COLOR.red} />
          {iconK > 0.01 ? (
            <g transform={`translate(330 -50) scale(${iconK})`}>
              <Trefoil r={44} fill="#000" bg={COLOR.yellow} rot={t * 180} />
            </g>
          ) : null}
        </g>
        {/* the channel's seal, slammed in for 1.4 s and gone */}
        <BrandSeal t={t} f={f} fps={fps} at={SEAL_AT} x={SEAL_X} y={SEAL_Y} />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * The spoken question and call to action. First the question that gets people commenting, with two quick tags, over the dimmed ENTER
 * key; then, for the final second, a rush into the glowing key that ends on the alert field, so the loop cuts
 * straight into frame 0.
 */
export const LoopOut: React.FC<ShotProps> = ({ t, f, fps, dur, mark }) => {
  const rushStart = dur - 1.0;
  const pr = Math.max(0, Math.min(1, (t - rushStart) / 1.0));
  const rush = 1 + 2.4 * Math.pow(pr, 3);
  const push = 1 + 0.07 * Math.min(1, t / rushStart);
  const glow = 0.5 + 0.5 * Math.sin(t * 6);
  const handoff = lin(t, dur - 0.3, dur - 0.05);
  const qIn = springAt(f, fps, 0.05, HARD);
  const tag1 = springAt(f, fps, mark('tag1') - 0.15, HARD); // pops as "operador" is said
  const tag2 = springAt(f, fps, mark('tag2') - 0.15, HARD); // and as "creadores" is said
  const qOut = 1 - lin(t, rushStart - 0.1, rushStart + 0.2);
  const cta = springAt(f, fps, mark('cta') - 0.1, HARD); // "te leo en los comentarios"
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <AlertDefs />
        <DepthBackdrop t={t} color={COLOR.red} glow={0.2} cy={1000} />
        {/* a slow red breath behind the question while it holds */}
        <circle cx={540} cy={1000} r={760 + 40 * Math.sin(t * 1.6)} fill="url(#alertGlow)" opacity={0.16 + 0.07 * Math.sin(t * 1.6)} />
        <g transform={`translate(540 1000) scale(${rush * push}) translate(-540 -1000)`}>
          <g opacity={0.35 + 0.65 * lin(pr, 0, 0.2)}>
            {Array.from({ length: 12 }, (_, i) => {
              const col = i % 4;
              const row = Math.floor(i / 4);
              const x = 150 + col * 200;
              const y = 720 + row * 200;
              const isEnter = col === 2 && row === 1;
              if (isEnter) return null;
              return (
                <g key={i}>
                  <rect x={x} y={y + 18} width={170} height={170} rx={22} fill="#1A1A22" />
                  <rect x={x} y={y} width={170} height={160} rx={22} fill="#2C2C38" stroke="#444" strokeWidth={3} />
                </g>
              );
            })}
            <g>
              <rect x={540} y={938} width={210} height={180} rx={24} fill="#3A0004" />
              <rect x={540} y={920} width={210} height={170} rx={24} fill={COLOR.red} opacity={0.55 + 0.45 * glow} stroke="#FFF" strokeWidth={5} />
              <text x={645} y={1020} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#FFF">
                ENTER
              </text>
              <circle cx={645} cy={1005} r={160 + 40 * glow} fill="none" stroke={COLOR.red} strokeWidth={8} opacity={0.4 * glow} />
            </g>
          </g>
        </g>
        {/* the question and its two tags */}
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
          {[
            { k: tag1, y: 800, label: '¿EL OPERADOR?', fill: COLOR.yellow, ink: '#000' },
            { k: tag2, y: 1010, label: '¿LOS CREADORES?', fill: COLOR.red, ink: '#FFF' },
          ].map(({ k, y, label, fill, ink }) => (
            <g key={label} transform={`translate(540 ${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
              <rect x={-410} y={-80} width={820} height={160} rx={80} fill={fill} stroke="#000" strokeWidth={10} />
              <text y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={label.length > 14 ? 84 : 92} fill={ink}>
                {label}
              </text>
            </g>
          ))}
        </g>
        {/* the call to action, last on screen, inside the safe area */}
        <g opacity={Math.max(0, qOut) * Math.min(1, cta * 1.5)} transform={`translate(540 1190) scale(${0.8 + 0.2 * cta})`}>
          <text textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill="#000" stroke="#000" strokeWidth={14} strokeLinejoin="round" textLength={900} lengthAdjust="spacingAndGlyphs" transform="translate(4 5)">
            TE LEO EN LOS COMENTARIOS
          </text>
          <text textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill={COLOR.white} stroke="#000" strokeWidth={9} strokeLinejoin="round" paintOrder="stroke" textLength={900} lengthAdjust="spacingAndGlyphs">
            TE LEO EN LOS COMENTARIOS
          </text>
        </g>
        <g opacity={handoff}>
          <AlertField t={t} f={f} zoom={HOOK_ZOOM0} banner={false} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
