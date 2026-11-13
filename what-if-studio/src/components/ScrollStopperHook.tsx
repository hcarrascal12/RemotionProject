import React from 'react';
import { AbsoluteFill } from 'remotion';
import { blink, COLOR, ease, fmtThousands, HARD, HEAVY, lin, MONO, rand, ShotProps, springAt } from './motion';
import { Trefoil } from './Fx';
import { TreatmentScene } from './TreatmentScene';
import { KineticTitle } from './KineticTitle';
import { DepthBackdrop } from './Backdrop';
import { BrandSeal } from './BrandSeal';

// Frame 0 is already moving: the CRT switches on (the picture opens from a bright band in 0.2 s) while the whole
// alert springs from 1.25x down to 1x onto a glowing red ENTER key, and the dose counter climbs from the first word of
// the voice to "1986". The hook line is slammed in two hits with a stiff spring.

const COUNT_TO = 25000;
const SEAL_AT = 0.9;
// beside the dose counter, left of the apps' right-hand buttons and above their bottom block (the apps cover the bottom 340 px)
const SEAL_X = 868;
const SEAL_Y = 1172;
/** Where the hook zooms onto: the ENTER key. */
const KEY_X = 540;
const KEY_Y = 1000;
/** The opening zoom: 1.25x on frame 0, landing on 1x with a small overshoot. */
const ZOOM_SPRING = { stiffness: 170, damping: 13, mass: 0.6 };
const CRT_TIME = 0.2;

/** The red alert panel and background; shared with the loop-out so the last frame cuts cleanly into the first. */
/** The alert's zoom on frame 0, and on the last frame of the loop, so the loop cuts on an identical picture. */
export const HOOK_ZOOM0 = 1.1;

export const AlertField: React.FC<{ t: number; f: number; zoom: number; bg?: number; banner?: boolean }> = ({ t, f, zoom, bg = 1, banner = false }) => {
    const panelOn = blink(t, 0.25, 0.17);
  return (
    <>
      <rect width={1080} height={1920} fill="#0C0A0B" opacity={bg} />
      <circle cx={540} cy={1000} r={700} fill="url(#alertGlow)" opacity={0.12} />
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
  const { t, f, fps, mark } = props;
  const zk = springAt(f, fps, 0, ZOOM_SPRING);
  const zoom = 1.25 - 0.25 * zk;
  // the counter runs with the first sentence: from its first word to "1986"
  const c0 = Number.isFinite(mark('a1')) ? mark('a1') : 0.1;
  const c1 = Number.isFinite(mark('num1985')) ? Math.max(c0 + 0.4, mark('num1985')) : 1.5;
  const p = Math.max(0, Math.min(1, (t - c0) / (c1 - c0)));
  const value = COUNT_TO * Math.pow(p, 2.4);
  const peaked = t >= c1;
  const k1 = springAt(f, fps, -0.14, HARD); // pre-rolled: frame 0 already shows the warning, which is what the feed shows
  const k2 = springAt(f, fps, 0.5, HARD);
  const counterShake = peaked ? Math.exp(-(t - c1) / 0.15) * 14 : 0;
  const iconK = springAt(f, fps, c1 + 0.3, HARD);
  const pulse = 1 + 0.05 * Math.sin(t * 18);
  const keyGlow = 0.5 + 0.5 * Math.sin(t * 7);
  const keyPress = springAt(f, fps, Math.max(0.05, mark('clic') - 0.05), HARD); // the key dips as "clic" is said, if still on screen
  const crt = Math.min(1, t / CRT_TIME);
  const open = 0.5 + 0.5 * (1 - Math.pow(1 - crt, 3));
  const band = 960 * (1 - open);
  return (
    <AbsoluteFill>
      {/* you, on the table, the alarm going: the ground the hook slams onto */}
      <TreatmentScene {...props} variant="hookbg" />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <AlertDefs />
        <g transform={`translate(${KEY_X} ${KEY_Y}) scale(${zoom}) translate(${-KEY_X} ${-KEY_Y})`}>
          <AlertField t={t} f={f} zoom={1} bg={1} />
          <KineticTitle text="NO PRESIONES" y={620} size={150} k={k1} tilt={0} shadow="#00000000" />
          <KineticTitle text="ESA TECLA" y={820} size={210} k={k2} tilt={0} shadow="#00000000" />
          {/* the key itself, lit red */}
          <g transform={`translate(${KEY_X} ${KEY_Y + 8 * (keyPress > 0.01 && keyPress < 1.2 ? Math.sin(Math.PI * Math.min(1, keyPress)) : 0)})`}>
            <rect x={-150} y={-62} width={300} height={140} rx={24} fill="#000" opacity={0.6} />
            <rect x={-150} y={-80} width={300} height={140} rx={24} fill="#1A1517" stroke={COLOR.red} strokeWidth={5} opacity={0.85 + 0.15 * keyGlow} />
            <text y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={66} fill="#FFF">
              ENTER
            </text>
          </g>
          {/* the dose counter: just the number, under the key */}
          <g transform={`translate(${540 + (rand(f) - 0.5) * counterShake} ${1230 + (rand(f + 9) - 0.5) * counterShake})`}>
            <text x={-20} y={0} textAnchor="end" fontFamily={HEAVY} fontWeight={900} fontSize={100} fill={peaked ? '#E5484D' : '#F2F0EA'}>
              {fmtThousands(value)}
            </text>
            <text x={0} y={-4} fontFamily={MONO} fontWeight={700} fontSize={44} fill="#FFF">
              RAD
            </text>
          </g>
        </g>
        {/* the channel's seal, slammed in for 1.4 s and gone */}
        <BrandSeal t={t} f={f} fps={fps} at={SEAL_AT} x={SEAL_X} y={SEAL_Y} size={170} />
        {/* CRT switch-on: the picture opens from a bright band; frame 0 already shows the middle half */}
        {crt < 1 ? (
          <g>
            <rect x={0} y={960 - (960 - band) - 0} width={1080} height={1920 - 2 * band} fill="#FFFFFF" opacity={0.3 * (1 - crt)} />
            <rect x={0} y={0} width={1080} height={band} fill="#000" />
            <rect x={0} y={1920 - band} width={1080} height={band} fill="#000" />
            <rect x={0} y={band - 4} width={1080} height={8} fill="#FFFFFF" opacity={0.9 * (1 - crt)} />
            <rect x={0} y={1920 - band - 4} width={1080} height={8} fill="#FFFFFF" opacity={0.9 * (1 - crt)} />
          </g>
        ) : null}
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
          <g opacity={0.12 + 0.88 * lin(pr, 0, 0.2)}>
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
          {/* the two answers on a balance: each pan drops as its side is said, then the beam swings level for the CTA */}
          {(() => {
            const theta = -9 * tag1 + 18 * tag2 - 9 * cta; // degrees; negative: the operator's side is down
            const r = (theta * Math.PI) / 180;
            const PX = 540;
            const PY = 840;
            const L = 265;
            const ends = [
              { x: PX - L * Math.cos(r), y: PY - L * Math.sin(r) },
              { x: PX + L * Math.cos(r), y: PY + L * Math.sin(r) },
            ];
            const both = cta > 0.5;
            const cards = [
              { k: tag1, lines: ['¿EL', 'OPERADOR?'], fill: COLOR.yellow, ink: '#000', on: both || tag2 < 0.5 },
              { k: tag2, lines: ['¿LOS', 'CREADORES?'], fill: COLOR.red, ink: '#FFF', on: true },
            ];
            return (
              <g opacity={Math.min(1, qIn * 1.5)}>
                <path d={`M ${PX - 46} ${PY + 120} L ${PX} ${PY} L ${PX + 46} ${PY + 120} Z`} fill="#DDE3EA" stroke="#000" strokeWidth={8} strokeLinejoin="round" />
                <g transform={`rotate(${theta} ${PX} ${PY})`}>
                  <rect x={PX - L - 20} y={PY - 12} width={2 * L + 40} height={24} rx={12} fill="#DDE3EA" stroke="#000" strokeWidth={7} />
                </g>
                <circle cx={PX} cy={PY} r={20} fill={COLOR.red} stroke="#000" strokeWidth={7} />
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
                          <text key={ln} y={-14 + j * 74} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={j ? 60 : 54} fill={ink} textLength={j ? 310 : undefined} lengthAdjust="spacingAndGlyphs">
                            {ln}
                          </text>
                        ))}
                      </g>
                    </g>
                  );
                })}
              </g>
            );
          })()}
        </g>
        {/* the call to action, last on screen, inside the safe area */}
        <g opacity={Math.max(0, qOut) * Math.min(1, cta * 1.5)} transform={`translate(540 1250) scale(${0.8 + 0.2 * cta})`}>
          <text textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill="#000" stroke="#000" strokeWidth={14} strokeLinejoin="round" textLength={900} lengthAdjust="spacingAndGlyphs" transform="translate(4 5)">
            TE LEO EN LOS COMENTARIOS
          </text>
          <text textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill={COLOR.white} stroke="#000" strokeWidth={9} strokeLinejoin="round" paintOrder="stroke" textLength={900} lengthAdjust="spacingAndGlyphs">
            TE LEO EN LOS COMENTARIOS
          </text>
        </g>
        {/* the channel's name, memorable at the very end: it comes in with the call to action and leaves with the question */}
        <g opacity={Math.max(0, qOut) * Math.min(1, cta * 1.5)} transform={`translate(540 1400) scale(${0.85 + 0.15 * cta})`}>
          <text textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={104} fill="#000" stroke="#000" strokeWidth={22} strokeLinejoin="round" transform="translate(5 7)">
            NO PRESIONES
          </text>
          <text textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={104} fill={COLOR.red} stroke="#FFF" strokeWidth={14} strokeLinejoin="round" paintOrder="stroke">
            NO PRESIONES
          </text>
          <text y={64} textAnchor="middle" fontFamily={MONO} fontSize={38} fill="#FFF" letterSpacing={6}>
            FALLO #01
          </text>
        </g>
        <g opacity={handoff}>
          <AlertField t={t} f={f} zoom={HOOK_ZOOM0} banner={false} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
