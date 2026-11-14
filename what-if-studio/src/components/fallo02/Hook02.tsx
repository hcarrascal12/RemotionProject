import React from 'react';
import { AbsoluteFill } from 'remotion';
import { blink, COLOR, ease, HARD, HEAVY, lin, MONO, rand, ShotProps, springAt } from '../motion';
import { DepthBackdrop } from '../Backdrop';
import { BrandSeal } from '../BrandSeal';
import { BLUE_DEEP, PcTile } from './parts';
import { Recreation } from './Recreate';

// Fallo #02's hook is its own: instead of an alarm and a key, the FRAME ITSELF CRASHES. Frame 0: the CRT switches on and the
// picture springs from 1.25x to 1x onto a wall of 48 computers; a blue wave sweeps across it, tile by tile, as the voice says
// "un error pequeño apagó millones de computadoras"; the PC counter races to 8,500,000 on "millones"; and the title is typed
// into a blue-screen panel (NO PRESIONES, then ENVIAR) with a blinking cursor. The channel seal stamps in at 0.9 s.

/** The opening zoom: 1.3x on frame 0 landing on 1x with a visible bounce (damping 10, stiffness 150). */
const ZOOM_SPRING = { stiffness: 150, damping: 10, mass: 1 };
const CRT_TIME = 0.08; // the switch-on is quick: on Facebook (muted autoplay) the viewers who leave do it in the first second
const SEAL_AT = 1.5; // after the first second and a half, so the opening carries only the title and the captions
const COUNTER_IN = 0.55; // the PC counter fades in once the title has started typing
const COUNT_TO = 8500000;
const COLS = 8;
const ROWS = 6;
const num = (v: number, fallback: number) => (Number.isFinite(v) ? v : fallback);

/** The field behind the loop-out's handoff: the same deep blue and the sad face, so the last frame cuts into the hook. */
export const HookField: React.FC<{ t: number; f: number; banner?: boolean; bgOpacity?: number }> = ({ t, bgOpacity = 0.9 }) => (
  <>
    <rect width={1080} height={1920} fill={blink(t, 1 / 6) ? '#0B2A55' : BLUE_DEEP} opacity={bgOpacity} />
    <text x={540} y={1010} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={980} fill="#0A6BD6" opacity={0.1 + 0.05 * Math.sin(t * 9)}>
      :(
    </text>
  </>
);

export const Hook02: React.FC<ShotProps> = (props) => {
  const { t, f, fps, mark } = props;
  const zk = springAt(f, fps, 0, ZOOM_SPRING);
  const zoom = 1.3 - 0.3 * zk;
  const c0 = num(mark('a1'), 0.1);
  const c1 = Math.max(c0 + 0.8, num(mark('millones'), 2.6));
  const p = Math.max(0, Math.min(1, (t - c0) / (c1 - c0)));
  const value = COUNT_TO * Math.pow(p, 2.4);
  const peaked = t >= c1;
  const shake = peaked ? Math.exp(-(t - c1) / 0.15) * 10 : 0;
  const crt = Math.min(1, 0.55 + (0.45 * t) / CRT_TIME); // frame 0 is already mostly open
  const open = 0.5 + 0.5 * (1 - Math.pow(1 - crt, 3));
  const band = 960 * (1 - open);
  const n1 = Math.floor(lin(t, 0.2, 0.75, 0, 12.99));
  const n2 = Math.floor(lin(t, 0.85, 1.25, 0, 6.99));
  const cur = blink(t, 0.5, 0.3);
  return (
    <AbsoluteFill>
      {/* you, at your desk, the blue light going: the ground the wall of computers sits on */}
      <Recreation {...props} variant="hookbg" />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <DepthBackdrop t={t} color={COLOR.cyan} glow={0.12} cy={960} overlayOnly />
        <g transform={`translate(540 900) scale(${zoom}) translate(-540 -900)`}>
          {/* the blue-screen panel with the typed title */}
          <g transform={`translate(${60 + (rand(f) - 0.5) * shake} ${290 + (rand(f + 5) - 0.5) * shake})`}>
            <rect width={960} height={230} fill="#0A6BD6" stroke="#FFF" strokeWidth={6} />
            <text x={34} y={170} fontFamily={HEAVY} fontWeight={900} fontSize={190} fill="#FFF">
              :(
            </text>
            <text x={250} y={104} fontFamily={MONO} fontSize={68} fontWeight={700} fill="#FFF" letterSpacing={2}>
              {'NO PRESIONES'.slice(0, n1)}
              {n2 === 0 && cur ? '_' : ''}
            </text>
            <text x={250} y={196} fontFamily={MONO} fontSize={92} fontWeight={700} fill={COLOR.yellow} letterSpacing={2}>
              {'ENVIAR'.slice(0, n2)}
              {n2 > 0 && cur ? '_' : ''}
            </text>
          </g>
          {/* the counter */}
          <g transform={`translate(60 ${590 + (rand(f + 9) - 0.5) * shake})`} opacity={lin(t, COUNTER_IN, COUNTER_IN + 0.25)}>
            <text x={0} y={0} fontFamily={MONO} fontSize={36} fill={COLOR.cyan}>
              PCs CAÍDOS
            </text>
            <text x={900} y={4} textAnchor="end" fontFamily={HEAVY} fontWeight={900} fontSize={80} fill={peaked ? COLOR.red : '#FFFFFF'} stroke="#000" strokeWidth={8} paintOrder="stroke">
              {`${(value / 1e6).toFixed(1).replace('.', ',')} MILLONES`}
            </text>
            <rect x={0} y={20} width={900} height={10} fill="#10253F" />
            <rect x={0} y={20} width={900 * p} height={10} fill={COLOR.red} />
          </g>
          {/* the wall of computers: the blue wave sweeps from the left, each tile popping as it turns */}
          {Array.from({ length: COLS * ROWS }, (_, i) => {
            const c = i % COLS;
            const r = Math.floor(i / COLS);
            const flipAt = c0 + ((c / (COLS - 1)) * 0.72 + rand(i * 3 + 1) * 0.28) * (c1 - c0) * 0.95;
            const blue = t >= flipAt;
            const pop = blue ? Math.min(1, springAt(f, fps, flipAt, HARD)) : 1;
            const sc = blue ? 1 + 0.38 * (1 - pop) : 1;
            return (
              <g key={i} transform={`translate(${52 + c * 122 + 53} ${650 + r * 92 + 40}) scale(${sc}) translate(-53 -40)`}>
                <PcTile x={0} y={0} s={1.1} state={blue ? 'blue' : 'ok'} />
              </g>
            );
          })}
        </g>
        <BrandSeal t={t} f={f} fps={fps} at={SEAL_AT} x={905} y={1105} size={150} />
        {/* the series tag, from frame 0: fixed (outside the zoom) and inside the 3:4 grid crop */}
        <g transform="translate(540 1415)">
          <rect x={-200} y={-50} width={400} height={92} rx={46} fill="#050A14" stroke={COLOR.red} strokeWidth={6} />
          <text y={18} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={50} fill={COLOR.yellow} letterSpacing={5}>
            FALLO #02
          </text>
        </g>
        {crt < 1 ? (
          <g>
            <rect x={0} y={band} width={1080} height={1920 - 2 * band} fill="#FFFFFF" opacity={0.1 * (1 - crt)} />
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
 * The closing card: the question, the two answers on a balance (each pan drops as its side is said), the call to action and
 * the channel name, then a rush toward the red key that ends on the hook's field so the loop cuts back into frame 0.
 */
export const LoopOut02: React.FC<ShotProps> = ({ t, f, fps, dur, mark }) => {
  const RUSH = 0.8; // the last 0.8 s: the zoom toward the key and the cut back into frame 0 (no dark tail after the CTA)
  const rushStart = dur - RUSH;
  const pr = Math.max(0, Math.min(1, (t - rushStart) / RUSH));
  const rush = 1 + 2.4 * Math.pow(pr, 3);
  const push = 1 + 0.07 * Math.min(1, t / rushStart);
  const glow = 0.5 + 0.5 * Math.sin(t * 6);
  const handoff = lin(t, dur - 0.32, dur - 0.04);
  const qIn = springAt(f, fps, 0.05, HARD);
  const tag1 = springAt(f, fps, num(mark('tag1'), 1.5) - 0.15, HARD);
  const tag2 = springAt(f, fps, num(mark('tag2'), 2.5) - 0.15, HARD);
  const qOut = 1 - lin(t, rushStart - 0.1, rushStart + 0.2);
  const cta = springAt(f, fps, num(mark('cta'), 4) - 0.1, HARD);
  const theta = -9 * tag1 + 18 * tag2 - 9 * cta;
  const r = (theta * Math.PI) / 180;
  const PX = 540;
  const PY = 840;
  const L = 265;
  const ends = [
    { x: PX - L * Math.cos(r), y: PY - L * Math.sin(r) },
    { x: PX + L * Math.cos(r), y: PY + L * Math.sin(r) },
  ];
  const cards = [
    { k: tag1, lines: ['¿LA EMPRESA?', 'CROWDSTRIKE'], fill: COLOR.yellow, ink: '#000', on: cta > 0.5 || tag2 < 0.5 },
    { k: tag2, lines: ['¿EL SISTEMA?', 'MICROSOFT'], fill: '#0A6BD6', ink: '#FFF', on: true },
  ];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <rect width={1080} height={1920} fill={BLUE_DEEP} />
        <DepthBackdrop t={t} color={COLOR.red} glow={0.2} cy={1000} />
        <g transform={`translate(540 1000) scale(${rush * push}) translate(-540 -1000)`}>
          <g opacity={t >= rushStart ? lin(pr, 0, 0.2) : 0}>
            <rect x={370} y={938} width={340} height={150} rx={24} fill="#3A0004" />
            <rect x={370} y={920} width={340} height={150} rx={24} fill={COLOR.red} opacity={0.55 + 0.45 * glow} stroke="#FFF" strokeWidth={5} />
            <text x={540} y={1010} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={60} fill="#FFF">
              ENVIAR
            </text>
          </g>
        </g>
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
                      <text key={ln} y={-14 + j * 74} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={j ? 58 : 50} fill={ink} textLength={310} lengthAdjust="spacingAndGlyphs">
                        {ln}
                      </text>
                    ))}
                  </g>
                </g>
              );
            })}
          </g>
        </g>
        <g opacity={Math.max(0, qOut) * Math.min(1, cta * 1.5)} transform={`translate(540 1400) scale(${0.85 + 0.15 * cta})`}>
          <text textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={104} fill="#000" stroke="#000" strokeWidth={22} strokeLinejoin="round" transform="translate(5 7)">
            NO PRESIONES
          </text>
          <text textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={104} fill={COLOR.red} stroke="#FFF" strokeWidth={14} strokeLinejoin="round" paintOrder="stroke">
            NO PRESIONES
          </text>
          <text y={64} textAnchor="middle" fontFamily={MONO} fontSize={38} fill="#FFF" letterSpacing={6}>
            FALLO #02
          </text>
        </g>
      </svg>
      {/* the last frame IS frame 0 of the hook: the same picture, scale and colours, so the loop cuts invisibly */}
      {handoff > 0.001 ? (
        <AbsoluteFill style={{ opacity: handoff }}>
          <Hook02 t={0} f={0} fps={fps} dur={1} mark={() => Number.NaN} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
