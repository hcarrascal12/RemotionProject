import React from 'react';
import { AbsoluteFill } from 'remotion';
import { blink, COLOR, ease, HARD, HEAVY, lin, MONO, rand, ShotProps, springAt } from '../motion';
import { DepthBackdrop } from '../Backdrop';
import { KineticTitle } from '../KineticTitle';
import { BrandSeal } from '../BrandSeal';
import { BLUE_DEEP, Strip } from './parts';

// Fallo #02's frame 0 follows the Fallo #01 recipe: the CRT switches on in 0.2 s while the picture springs from 1.25x
// to 1x onto a red key (ENVIAR: the key the company pressed), the PC counter races up with the first sentence and lands on
// 8,500,000 at "millones", the title lands in two hits, and the channel seal stamps in for 1.4 s.

const KEY_X = 540;
const KEY_Y = 1000;
const ZOOM_SPRING = { stiffness: 170, damping: 13, mass: 0.6 };
const CRT_TIME = 0.2;
const SEAL_AT = 0.9;
const COUNT_TO = 8500000;
const num = (v: number, fallback: number) => (Number.isFinite(v) ? v : fallback);

/** The field behind the hook, shared with the loop-out so the last frame cuts cleanly into the first. */
export const HookField: React.FC<{ t: number; f: number; banner?: boolean }> = ({ t, f, banner = true }) => {
  const strobe = blink(t, 1 / 6);
  return (
    <>
      <rect width={1080} height={1920} fill={strobe ? '#0B2A55' : BLUE_DEEP} />
      <text x={540} y={1010} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={980} fill="#0A6BD6" opacity={0.1 + 0.05 * Math.sin(t * 9)}>
        :(
      </text>
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2 + rand(i) * 0.2;
        const r0 = 160 + ((f * 38 + i * 70) % 900);
        return <line key={i} x1={540 + Math.cos(a) * r0} y1={960 + Math.sin(a) * r0} x2={540 + Math.cos(a) * (r0 + 220)} y2={960 + Math.sin(a) * (r0 + 220)} stroke={COLOR.red} strokeWidth={6} opacity={0.38} />;
      })}
      {banner ? <Strip x={70} y={280} w={940} text="ALERTA GLOBAL" t={t} size={78} /> : null}
    </>
  );
};

export const Hook02: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const zk = springAt(f, fps, 0, ZOOM_SPRING);
  const zoom = 1.25 - 0.25 * zk;
  const c0 = num(mark('a1'), 0.1);
  const c1 = Math.max(c0 + 0.6, num(mark('millones'), 2.6));
  const p = Math.max(0, Math.min(1, (t - c0) / (c1 - c0)));
  const value = COUNT_TO * Math.pow(p, 2.4);
  const peaked = t >= c1;
  const k1 = springAt(f, fps, -0.14, HARD);
  const k2 = springAt(f, fps, 0.5, HARD);
  const shake = peaked ? Math.exp(-(t - c1) / 0.15) * 12 : 0;
  const glow = 0.5 + 0.5 * Math.sin(t * 7);
  const crt = Math.min(1, t / CRT_TIME);
  const open = 0.5 + 0.5 * (1 - Math.pow(1 - crt, 3));
  const band = 960 * (1 - open);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <DepthBackdrop t={t} color={COLOR.red} glow={0.12} cy={960} overlayOnly />
        <g transform={`translate(${KEY_X} ${KEY_Y}) scale(${zoom}) translate(${-KEY_X} ${-KEY_Y})`}>
          <HookField t={t} f={f} />
          <KineticTitle text="NO PRESIONES" y={620} size={150} k={k1} tilt={-8} />
          <KineticTitle text="ENVIAR" y={820} size={210} k={k2} tilt={7} />
          {/* the key the company pressed */}
          <g transform={`translate(${KEY_X} ${KEY_Y})`}>
            <circle r={170 + 30 * glow} fill={COLOR.red} opacity={0.14 + 0.1 * glow} />
            <rect x={-170} y={-62} width={340} height={140} rx={24} fill="#3A0004" />
            <rect x={-170} y={-80} width={340} height={140} rx={24} fill={COLOR.red} stroke="#FFF" strokeWidth={7} opacity={0.75 + 0.25 * glow} />
            <text y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={66} fill="#FFF" stroke="#000" strokeWidth={6} paintOrder="stroke">
              ENVIAR
            </text>
          </g>
          {/* the PC counter, left of the seal */}
          <g transform={`translate(${70 + (rand(f) - 0.5) * shake} ${1180 + (rand(f + 9) - 0.5) * shake})`}>
            <text x={0} y={-92} fontFamily={MONO} fontSize={40} fill={COLOR.yellow}>
              PCs CAÍDOS
            </text>
            <text x={0} y={0} fontFamily={HEAVY} fontWeight={900} fontSize={112} fill={peaked ? COLOR.red : COLOR.yellow} stroke="#000" strokeWidth={8} paintOrder="stroke">
              {Math.round(value).toLocaleString('en-US')}
            </text>
            <rect x={0} y={26} width={690} height={12} fill="#33121A" />
            <rect x={0} y={26} width={690 * p} height={12} fill={COLOR.red} />
          </g>
        </g>
        <BrandSeal t={t} f={f} fps={fps} at={SEAL_AT} x={868} y={1172} size={170} />
        {crt < 1 ? (
          <g>
            <rect x={0} y={band} width={1080} height={1920 - 2 * band} fill="#FFFFFF" opacity={0.3 * (1 - crt)} />
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
  const rushStart = dur - 1.0;
  const pr = Math.max(0, Math.min(1, (t - rushStart) / 1.0));
  const rush = 1 + 2.4 * Math.pow(pr, 3);
  const push = 1 + 0.07 * Math.min(1, t / rushStart);
  const glow = 0.5 + 0.5 * Math.sin(t * 6);
  const handoff = lin(t, dur - 0.3, dur - 0.05);
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
          <g opacity={0.12 + 0.88 * lin(pr, 0, 0.2)}>
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
        <g opacity={Math.max(0, qOut) * Math.min(1, cta * 1.5)} transform={`translate(540 1250) scale(${0.8 + 0.2 * cta})`}>
          <text textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill="#000" stroke="#000" strokeWidth={14} strokeLinejoin="round" textLength={900} lengthAdjust="spacingAndGlyphs" transform="translate(4 5)">
            TE LEO EN LOS COMENTARIOS
          </text>
          <text textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill={COLOR.white} stroke="#000" strokeWidth={9} strokeLinejoin="round" paintOrder="stroke" textLength={900} lengthAdjust="spacingAndGlyphs">
            TE LEO EN LOS COMENTARIOS
          </text>
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
        <g opacity={handoff}>
          <rect width={1080} height={1920} fill={BLUE_DEEP} />
          <g transform={`translate(${KEY_X} ${KEY_Y}) scale(1.25) translate(${-KEY_X} ${-KEY_Y})`}>
            <HookField t={t} f={f} banner={false} />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
