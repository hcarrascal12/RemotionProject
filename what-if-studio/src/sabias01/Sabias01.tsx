import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../components/fonts';
import timelineJson from './timeline.json';
import { LOOKS, basePose, Pose, BEDROOM, stand } from '../engine';
import { CineCamera } from '../components/CineCamera';
import { CharacterRig } from '../components/CharacterRig';
import { HARD, HEAVY, lin, rand, ShotProps, springAt } from '../components/motion';
import { AlertOverlay, camera, Finish, FxEvent } from '../components/Fx';
import { KineticCaptions, SubChunk } from '../components/DynamicSubtitles';
import { C4, clamp, num, OutText, PhoneBody } from '../components/fallo04/parts';
import { CU, CurioPill, Day, NoSeal, Over, Pop } from '../curio01/Curio01Board';
import { BOARD, TitleWide, WHATIF_SHOTS } from './WhatIfShots';

// "¿Sabías que…? #01": a 75-year-old woman with a spade cut off the internet in most of Armenia (28 March 2011). The curiosity
// series' daylight look; the hook is the picture itself (the grandma, the spade, the cut cable sparking underground) with the
// line ESTA ABUELA APAGÓ EL INTERNET DE UN PAÍS. Times come from timeline.json (tools/mkplan_sabias01.py, then the build).

type Shot = { id: string; kind: string; variant?: string; start: number; end: number };
type Timeline = { fps: number; width: number; height: number; duration: number; shots: Shot[]; fx: FxEvent[]; marks: Record<string, number>; visualLead?: Record<string, number>; subs: SubChunk[] };
export const SABIAS01: Timeline = timelineJson as Timeline;

// the grandma: the mum's rig with grey hair and a lilac cardigan
const GRANNY = { ...LOOKS.mom, hair: '#E5E7EB', jacket: '#8B6BA8', jacketShade: '#715590', accent: '#F2C14E' };
const ME = stand(BEDROOM, 0.42, 0.72, 0.6);
const FLOOR = BEDROOM.P(0.42, 1, 0.72).y;

/** An outdoor day in world space: sky, hills, a fence, grass. */
const Field: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={ME.x - 900} y={FLOOR - 900} width={1800} height={900} fill="#BFE6F6" />
    <circle cx={ME.x - 330} cy={FLOOR - 560} r={46 + 3 * Math.sin(t * 2)} fill="#FCD34D" />
    <ellipse cx={ME.x + 260 - 40 * Math.sin(t * 0.4)} cy={FLOOR - 470} rx={90} ry={30} fill="#FFFFFF" opacity={0.9} />
    <ellipse cx={ME.x - 120 + 30 * Math.sin(t * 0.3)} cy={FLOOR - 620} rx={70} ry={24} fill="#FFFFFF" opacity={0.8} />
    <path d={`M ${ME.x - 900} ${FLOOR - 120} Q ${ME.x - 500} ${FLOOR - 300} ${ME.x - 100} ${FLOOR - 140} T ${ME.x + 900} ${FLOOR - 160} L ${ME.x + 900} ${FLOOR} L ${ME.x - 900} ${FLOOR} Z`} fill="#9BD18B" />
    {[-1, 0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={ME.x + 160 + i * 90} y={FLOOR - 110} width={14} height={110} fill="#B07A58" />
      </g>
    ))}
    <rect x={ME.x + 150} y={FLOOR - 90} width={300} height={10} fill="#B07A58" />
    <rect x={ME.x + 150} y={FLOOR - 50} width={300} height={10} fill="#B07A58" />
    <rect x={ME.x - 900} y={FLOOR} width={1800} height={40} fill="#7CC36E" />
  </g>
);

/** The soil under the field, in world space: the cable runs through it; cut at the spade. */
const Soil: React.FC<{ t: number; cut: number; spark: number; cutX: number }> = ({ t, cut, spark, cutX }) => {
  const y0 = FLOOR + 40;
  const cy = y0 + 110;
  return (
    <g>
      <rect x={ME.x - 900} y={y0} width={1800} height={1500} fill="#8B5E3C" />
      {Array.from({ length: 30 }, (_, i) => (
        <ellipse key={i} cx={ME.x - 880 + ((i * 173) % 1760)} cy={y0 + 20 + ((i * 97) % 300)} rx={8 + (i % 4) * 4} ry={5 + (i % 3) * 2} fill="#6E4A2F" />
      ))}
      <rect x={ME.x - 900} y={cy - 9} width={cutX - (ME.x - 900) - 14 * cut} height={18} rx={9} fill="#F97316" stroke="#7C2D12" strokeWidth={3} />
      <rect x={cutX + 14 * cut} y={cy - 9} width={ME.x + 900 - cutX} height={18} rx={9} fill="#F97316" stroke="#7C2D12" strokeWidth={3} />
      {Array.from({ length: 12 }, (_, i) => {
        const x = ME.x - 900 + ((i * 150 + t * 300) % 1800);
        if (cut > 0.5 && x > cutX - 10) return null;
        return <circle key={i} cx={x} cy={cy} r={4} fill="#FFF7AE" />;
      })}
      {spark > 0.02
        ? Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            const l = 24 + 70 * (1 - spark);
            return <line key={i} x1={cutX} y1={cy} x2={cutX + Math.cos(a) * l} y2={cy + Math.sin(a) * l} stroke={i % 2 ? '#FDE047' : '#FFFFFF'} strokeWidth={6} strokeLinecap="round" opacity={spark} />;
          })
        : null}
      {spark > 0.02 ? <circle cx={cutX} cy={cy} r={18 + 30 * (1 - spark)} fill="#FEF08A" opacity={0.7 * spark} /> : null}
    </g>
  );
};

/** The spade, in world space: handle from (x, y) down to the blade. */
// (kept for the close shots of later curiosities)
export const Spade: React.FC<{ x: number; y: number; ang: number; s: number }> = ({ x, y, ang, s }) => (
  <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${s})`}>
    <rect x={-6} y={-150} width={12} height={150} rx={6} fill="#B07A58" stroke="#3B2A20" strokeWidth={3} />
    <rect x={-22} y={-160} width={44} height={14} rx={7} fill="#B07A58" stroke="#3B2A20" strokeWidth={3} />
    <path d="M -26 0 L 26 0 L 20 52 Q 0 66 -20 52 Z" fill="#9CA3AF" stroke="#374151" strokeWidth={4} />
  </g>
);

/** The ground in cross-section (screen space): soil, the orange fibre cable with light running through it, and the cut. */
const Underground: React.FC<{ t: number; y0: number; h: number; cut: number; spark: number; light?: boolean }> = ({ t, y0, h, cut, spark, light = true }) => {
  const cy = y0 + h * 0.55;
  return (
    <g>
      <rect x={0} y={y0} width={1080} height={h} fill="#8B5E3C" />
      <rect x={0} y={y0} width={1080} height={26} fill="#6FAE5F" />
      {Array.from({ length: 22 }, (_, i) => (
        <ellipse key={i} cx={(i * 173) % 1080} cy={y0 + 50 + ((i * 97) % (h - 70))} rx={10 + (i % 4) * 5} ry={7 + (i % 3) * 3} fill="#6E4A2F" />
      ))}
      {/* the cable: two halves once it is cut */}
      <rect x={0} y={cy - 16} width={540 - 30 * cut} height={32} rx={16} fill="#F97316" stroke="#7C2D12" strokeWidth={4} />
      <rect x={540 + 30 * cut} y={cy - 16} width={540} height={32} rx={16} fill="#F97316" stroke="#7C2D12" strokeWidth={4} />
      {/* the light inside the fibre, which stops at the cut */}
      {light
        ? Array.from({ length: 9 }, (_, i) => {
            const x = ((i * 120 + t * 520) % 1200) - 60;
            if (cut > 0.5 && x > 520) return null;
            return <circle key={i} cx={x} cy={cy} r={7} fill="#FFF7AE" opacity={0.95} />;
          })
        : null}
      {spark > 0.02
        ? Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const l = 30 + 90 * (1 - spark);
            return <line key={i} x1={540} y1={cy} x2={540 + Math.cos(a) * l} y2={cy + Math.sin(a) * l} stroke={i % 2 ? '#FDE047' : '#FFFFFF'} strokeWidth={6} strokeLinecap="round" opacity={spark} />;
          })
        : null}
    </g>
  );
};

/** 1. The hook (frame 0 is the thumbnail and the loop): the grandma holding the spade, its blade down in the soil, the cable cut and sparking. */
const H1: React.FC<ShotProps> = ({ t, f, fps, variant, mark }) => {
  const close = variant === 'pala';
  const pala = num(mark('pala'), 0.4);
  // the close shot: the spade lifts and comes down on "pala"; the wide one starts with it already in the cable
  const strike = close ? clamp((t - pala + 0.25) / 0.25) : 1;
  const sparkAt = close ? pala : 0;
  const spark = t >= sparkAt ? Math.max(0, 1 - ((t - sparkAt) % 0.9) / 0.5) : 0;
  const pose: Pose = { ...basePose, x: ME.x, y: ME.y, scale: ME.scale, yaw: 0.3, look: 0.4, headTilt: 4 + 4 * Math.sin(t * 2.2), armR: { a: 28, b: 8 }, armL: { a: 40 + 12 * Math.sin(t * 3), b: 30 }, expr: close ? (t > pala ? 'oops' : 'neutral') : 'smug' };
  const handX = ME.x + 62 * ME.scale;
  const handY = ME.y + 8 * ME.scale - 40 * (1 - strike) * ME.scale;
  const tipY = FLOOR + 150 - 60 * (1 - strike);
  const len = tipY - handY;
  return (
    <AbsoluteFill>
      <CineCamera cx={ME.x + (close ? 60 : 20)} cy={close ? FLOOR : FLOOR - 143} zoom={close ? 2.0 : 1.23 + 0.03 * clamp(t / 4)} tint="amber" vignette={0.1} bg={CU.cream}>
        <Field t={t} />
        <Soil t={t} cut={close ? strike : 1} spark={spark} cutX={handX} />
        <CharacterRig look={GRANNY} pose={pose} t={0.4 + t} rim="amber" seed={8} />
        {close ? <Dirt t={t} at={pala} x={handX} y={FLOOR + 20} n={16} s={0.6} /> : null}
        {/* the spade: handle from her hand down to the blade in the cable */}
        <g>
          <rect x={handX - 5} y={handY} width={10} height={len - 26} rx={5} fill="#B07A58" stroke="#3B2A20" strokeWidth={2} />
          <rect x={handX - 16} y={handY - 6} width={32} height={10} rx={5} fill="#B07A58" stroke="#3B2A20" strokeWidth={2} />
          <path d={`M ${handX - 20} ${tipY - 30} L ${handX + 20} ${tipY - 30} L ${handX + 15} ${tipY + 4} Q ${handX} ${tipY + 14} ${handX - 15} ${tipY + 4} Z`} fill="#9CA3AF" stroke="#374151" strokeWidth={3} />
        </g>
      </CineCamera>
      <Over>
        <CurioPill />
        {close ? (
          <Pop f={f} fps={fps} at={pala - 0.15} x={540} y={360}>
            <OutText x={0} y={0} size={120} fill={CU.coral} text="¡CON UNA PALA!" stroke={16} />
          </Pop>
        ) : (
          <g>
            <OutText x={540} y={318} size={84} fill="#FFFFFF" text="ESTA ABUELA" stroke={13} />
            <OutText x={540} y={418} size={84} fill={CU.coral} text="APAGÓ EL INTERNET" stroke={13} />
            <OutText x={540} y={518} size={84} fill="#FFFFFF" text="DE UN PAÍS" stroke={13} />
            <g transform="translate(860 640) rotate(6)">
              <rect x={-110} y={-30} width={220} height={60} rx={30} fill={CU.card} stroke={CU.ink} strokeWidth={4} />
              <text y={12} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill={CU.ink}>
                75 AÑOS
              </text>
            </g>
            {/* it really happened: the stamp that makes the claim believable, pulsing */}
            <g transform={`translate(215 650) rotate(-10) scale(${1 + 0.05 * Math.sin(t * 6)})`}>
              <rect x={-130} y={-40} width={260} height={80} rx={14} fill="none" stroke={CU.teal} strokeWidth={7} />
              <text y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill={CU.teal}>
                100% REAL
              </text>
            </g>
            {/* the circle and the arrow on the cut cable, drawn on */}
            {(() => {
              const z = 1.23 + 0.03 * clamp(t / 4);
              const cx = 540 + (handX - (ME.x + 20)) * z;
              const cy = 960 + 293 * z;
              const draw = clamp((t - 0.9) / 0.4);
              if (draw <= 0) return null;
              return (
                <g>
                  <ellipse cx={cx} cy={cy} rx={95} ry={60} fill="none" stroke="#EF4444" strokeWidth={9} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} transform={`rotate(-8 ${cx} ${cy})`} />
                  <g opacity={clamp((t - 1.2) / 0.2)} transform={`translate(${cx + 150 + 8 * Math.sin(t * 8)} ${cy - 170})`}>
                    <path d="M 0 0 L -90 110" stroke="#EF4444" strokeWidth={12} strokeLinecap="round" />
                    <path d="M -90 110 L -86 66 M -90 110 L -50 98" stroke="#EF4444" strokeWidth={12} strokeLinecap="round" />
                    <text x={10} y={-10} fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#EF4444" stroke="#FFF" strokeWidth={8} paintOrder="stroke">
                      AQUÍ
                    </text>
                  </g>
                </g>
              );
            })()}
            {/* the open loop: the payoff comes at the end ("la hacker de la pala"); in the caption band, before the captions start */}
            {t > 0.8 && t < 4.4 ? (
              <g transform={`translate(540 1470) scale(${0.8 + 0.2 * Math.min(1, springAt(f, fps, 0.8, HARD))})`} opacity={Math.min(1, (t - 0.8) / 0.15, (4.4 - t) / 0.15)}>
                <rect x={-430} y={-48} width={860} height={96} rx={48} fill={CU.ink} />
                <text y={16} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={42} fill="#FDE047">
                  ESPERA EL APODO QUE LE PUSIERON…
                </text>
              </g>
            ) : null}
          </g>
        )}
      </Over>
    </AbsoluteFill>
  );
};

/** 3. The country goes dark: Armenia, 2011, the wifi signs going out one by one, for hours. */
const Wifi: React.FC<{ x: number; y: number; on: boolean }> = ({ x, y, on }) => (
  <g transform={`translate(${x} ${y})`} stroke={on ? CU.teal : '#CBD5E1'} strokeWidth={6} fill="none" strokeLinecap="round">
    <path d="M -26 -6 Q 0 -30 26 -6" />
    <path d="M -15 4 Q 0 -10 15 4" />
    <circle cx={0} cy={14} r={5} fill={on ? CU.teal : '#CBD5E1'} stroke="none" />
    {!on ? <line x1={-24} y1={-24} x2={24} y2={24} stroke={CU.coral} strokeWidth={6} /> : null}
  </g>
);

/** 4. The close: the nickname is already on the newspaper. First ONE question that invites a comment, big, over a city whose windows
 *  (lit blue by phones) go grey: "¿Cuánto tiempo aguantarías sin internet?". Then, one step later, the question dims and ONE big
 *  follow button comes in and is tapped. Never two asks at once; no bridge, no brand card. */
const H4: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const c0 = num(mark('cierre'), 0.1);
  const q2 = num(mark('q2'), c0 + 0.3);
  const q3 = num(mark('q3'), c0 + 0.65);
  const sigue = num(mark('sigue'), c0 + 2.0);
  const tapAt = num(mark('tap'), sigue + 1.2);
  const fade = clamp((t - (sigue - 0.1)) / 0.3);
  const btn = springAt(f, fps, Math.max(0.5, sigue - 0.05), { stiffness: 180, damping: 14, mass: 0.7 });
  const tap = t >= tapAt;
  const hand = clamp((t - tapAt + 0.45) / 0.35);
  const press = tap && t < tapAt + 0.15;
  const dim = clamp((t - (c0 + 0.2)) / 1.4);
  const k1 = springAt(f, fps, Math.max(0.05, c0 - 0.05), HARD);
  const k2 = springAt(f, fps, q2 - 0.05, HARD);
  const k3 = springAt(f, fps, q3 - 0.05, HARD);
  const pop = (k: number) => `scale(${0.7 + 0.3 * Math.min(1.08, k)})`;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="h4dusk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2A1B45" />
            <stop offset="60%" stopColor="#7A3A5A" />
            <stop offset="100%" stopColor="#E0864A" />
          </linearGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#h4dusk)" />
        <circle cx={540} cy={1500} r={260 + 10 * Math.sin(t * 2)} fill="#FDBA74" opacity={0.5 * (1 - 0.6 * dim)} />
        {(() => {
          const out: React.ReactNode[] = [];
          let x = -20;
          let i = 0;
          while (x < 1100) {
            const bw = 96 + rand(i * 7 + 1) * 70;
            const bh = 260 + rand(i * 7 + 2) * 330;
            const top = 1560 - bh;
            out.push(<rect key={`b${i}`} x={x} y={top} width={bw + 1} height={bh + 400} fill="#1E1230" />);
            const cols = Math.floor((bw - 16) / 24);
            const rows = Math.floor((bh - 24) / 34);
            for (let c = 0; c < cols; c++)
              for (let rr = 0; rr < rows; rr++) {
                const q = rand(i * 131 + c * 17 + rr);
                const wx = x + 12 + c * 24;
                if (q > 0.34) {
                  const dead = wx / 1080 < dim * 1.15 - rand(i * 53 + c * 7 + rr) * 0.15;
                  out.push(<rect key={`w${i}-${c}-${rr}`} x={wx} y={top + 16 + rr * 34} width={11} height={16} fill={dead ? '#3B4558' : q > 0.82 ? '#FFD59A' : '#7DD3FC'} opacity={dead ? 0.55 : 0.6 + q * 0.4} />);
                }
              }
            x += bw + 3;
            i++;
          }
          return <g>{out}</g>;
        })()}
      </svg>
      <Over>
        <CurioPill />
        {/* the wifi that fails: arcs, and the slash once the windows go grey */}
        <g transform={`translate(540 440) ${pop(k1)}`} opacity={Math.min(1, k1 * 1.6) * (1 - 0.6 * fade)}>
          <g fill="none" stroke="#FDE7C8" strokeWidth={16} strokeLinecap="round">
            <path d="M -110 -34 Q 0 -128 110 -34" opacity={1 - 0.5 * dim} />
            <path d="M -70 4 Q 0 -60 70 4" opacity={1 - 0.5 * dim} />
            <path d="M -30 40 Q 0 14 30 40" />
          </g>
          <circle cy={64} r={12} fill="#FDE7C8" />
          <line x1={-120} y1={-90} x2={120} y2={90} stroke="#EF4444" strokeWidth={18} strokeLinecap="round" opacity={clamp((dim - 0.15) / 0.3)} />
        </g>
        {/* the question, one line at a time */}
        <g transform={`translate(540 640) ${pop(k1)}`} opacity={Math.min(1, k1 * 1.6) * (1 - 0.6 * fade)}>
          <OutText x={0} y={0} size={104} fill="#FFFFFF" text="¿CUÁNTO TIEMPO" stroke={14} />
        </g>
        <g transform={`translate(540 790) ${pop(k2)}`} opacity={Math.min(1, k2 * 1.6) * (1 - 0.6 * fade)}>
          <OutText x={0} y={0} size={128} fill="#FDBA74" text="AGUANTARÍAS" stroke={16} />
        </g>
        <g transform={`translate(540 940) ${pop(k3)}`} opacity={Math.min(1, k3 * 1.6) * (1 - 0.6 * fade)}>
          <OutText x={0} y={0} size={112} fill="#FFFFFF" text="SIN INTERNET?" stroke={14} />
        </g>
        {/* the one ask that follows the question: follow */}
        {btn > 0.01 ? (
          <g transform={`translate(540 1180) scale(${press ? 0.94 : (0.7 + 0.3 * Math.min(1.06, btn)) * (tap ? 1 : 1 + 0.03 * Math.sin(t * 7))})`} opacity={Math.min(1, btn * 1.6)}>
            {tap && t < tapAt + 0.5 ? <rect x={-430 - 100 * (t - tapAt)} y={-95 - 50 * (t - tapAt)} width={860 + 200 * (t - tapAt)} height={190 + 100 * (t - tapAt)} rx={110} fill="none" stroke="#FACC15" strokeWidth={10} opacity={1 - (t - tapAt) / 0.5} /> : null}
            <rect x={-430} y={-95} width={860} height={190} rx={95} fill={tap ? '#FFFFFF' : '#F25F5C'} stroke="#000" strokeWidth={10} />
            <text y={32} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={96} fill={tap ? '#000' : '#FFFFFF'}>
              {tap ? 'SIGUIENDO ✓' : '+ SEGUIR'}
            </text>
          </g>
        ) : null}
        {hand > 0 ? (
          <g transform={`translate(${760 - 150 * hand} ${1500 - 240 * hand + (press ? 14 : 0)}) rotate(-25)`}>
            <rect x={-44} y={0} width={88} height={260} rx={44} fill="#F2D3B5" stroke="#111" strokeWidth={6} />
            <rect x={-60} y={200} width={120} height={160} rx={40} fill="#8B6BA8" stroke="#111" strokeWidth={6} />
          </g>
        ) : null}
      </Over>
    </AbsoluteFill>
  );
};

/** Dirt flying from a strike at time `at` (any space: x, y in that space's units, s scales the spray). */
const Dirt: React.FC<{ t: number; at: number; x: number; y: number; n?: number; s?: number }> = ({ t, at, x, y, n = 14, s = 1 }) => {
  const k = t - at;
  if (k < 0 || k > 0.9) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const vx = (((i * 53) % 21) - 10) * 22 * s;
        const vy = (-260 - ((i * 37) % 9) * 40) * s;
        return <circle key={i} cx={x + vx * k} cy={y + vy * k + 900 * s * k * k} r={(5 + (i % 4) * 3) * s} fill={i % 3 ? '#8B5E3C' : '#6E4A2F'} opacity={1 - k / 0.9} />;
      })}
    </g>
  );
};

/** 2. March 28, 2011, Georgia: she walks the field with the spade on her shoulder, looking for copper to sell as scrap. */
const Walk: React.FC<ShotProps> = ({ t, f, fps, dur, mark }) => {
  const fecha = num(mark('fecha'), 0.3);
  const cobre = num(mark('cobre'), 2.5);
  const p = clamp(t / Math.max(1, dur));
  const x = ME.x - 260 + 380 * p;
  const step = Math.sin(t * 9);
  const pose: Pose = { ...basePose, x, y: ME.y - 6 * Math.abs(step), scale: ME.scale, yaw: 0.55, look: 0.6, headTilt: 3 * step, armR: { a: 150, b: 140 }, armL: { a: 15 - 18 * step, b: 10 }, legL: { a: 22 * step, b: 0 }, legR: { a: -22 * step, b: 0 }, expr: t > cobre ? 'happy' : 'neutral' };
  const coin = springAt(f, fps, cobre - 0.2, HARD);
  return (
    <AbsoluteFill>
      <CineCamera cx={x + 40} cy={FLOOR - 250} zoom={1.4} tint="amber" vignette={0.1} bg={CU.cream}>
        <Field t={t + 3} />
        <rect x={ME.x - 900} y={FLOOR + 40} width={1800} height={1500} fill="#8B5E3C" />
        <CharacterRig look={GRANNY} pose={pose} t={0.4 + t} rim="amber" seed={8} />
        {/* the spade on her shoulder */}
        <g transform={`translate(${x + 10 * ME.scale} ${ME.y - 70 * ME.scale}) rotate(${-38 + 3 * step})`}>
          <rect x={-5} y={-10} width={10} height={130 * ME.scale} rx={5} fill="#B07A58" stroke="#3B2A20" strokeWidth={2} />
          <path d={`M -18 ${130 * ME.scale} L 18 ${130 * ME.scale} L 14 ${130 * ME.scale + 30} Q 0 ${130 * ME.scale + 40} -14 ${130 * ME.scale + 30} Z`} fill="#9CA3AF" stroke="#374151" strokeWidth={3} />
        </g>
      </CineCamera>
      <Over>
        <CurioPill />
        <Pop f={f} fps={fps} at={fecha - 0.1} x={540} y={330} rot={-3}>
          <rect x={-300} y={-60} width={600} height={120} rx={24} fill={CU.card} stroke={CU.ink} strokeWidth={6} />
          <rect x={-300} y={-60} width={600} height={34} rx={14} fill={CU.coral} />
          <text y={42} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={50} fill={CU.ink}>
            28 MAR 2011
          </text>
        </Pop>
        <Pop f={f} fps={fps} at={fecha + 0.8} x={540} y={440}>
          <rect x={-150} y={-34} width={300} height={68} rx={34} fill={CU.teal} stroke={CU.ink} strokeWidth={4} />
          <text y={13} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={38} fill="#FFF">
            GEORGIA
          </text>
        </Pop>
        {coin > 0.01 ? (
          <g transform={`translate(800 ${640 - 10 * Math.sin(t * 3)}) scale(${0.6 + 0.4 * Math.min(1.08, coin)})`} opacity={Math.min(1, coin * 1.6)}>
            <ellipse cx={0} cy={0} rx={170} ry={110} fill={CU.card} stroke={CU.ink} strokeWidth={5} />
            <circle cx={-120} cy={120} r={18} fill={CU.card} stroke={CU.ink} strokeWidth={4} />
            <circle cx={-150} cy={160} r={10} fill={CU.card} stroke={CU.ink} strokeWidth={4} />
            <g transform={`translate(-85 0) scale(${Math.cos(t * 6)} 1)`}>
              <circle r={50} fill="#D97706" stroke={CU.ink} strokeWidth={5} />
              <text y={15} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={38} fill="#FFF7ED">
                Cu
              </text>
            </g>
            <text x={75} y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={40} fill={CU.ink}>
              ¿COBRE?
            </text>
          </g>
        ) : null}
      </Over>
    </AbsoluteFill>
  );
};

/** 3. Underground: two spadefuls, dirt flying; the third cuts the cable. It was not copper: fibre optic, and the light stops. */
const Dig: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const cavo1 = num(mark('cavo1'), 0.2);
  const cavo2 = num(mark('cavo2'), 0.7);
  const corto = num(mark('corto'), 1.6);
  const fibra = num(mark('fibra'), 2.4);
  const hits = [cavo1, cavo2, corto];
  // the blade's depth: up, down onto each hit, deeper every time
  const depth = (k: number) => [0.35, 0.6, 1][k];
  let blade = 0;
  hits.forEach((a, k) => {
    const d = t - a;
    if (d > -0.25 && d < 0.35) blade = Math.max(blade, depth(k) * (d < 0 ? 1 + d / 0.25 : 1 - Math.max(0, d - 0.15) / 0.2 * (k < 2 ? 1 : 0)));
  });
  if (t > corto) blade = 1;
  const cut = t >= corto ? 1 : 0;
  const spark = t >= corto ? Math.max(0, 1 - (t - corto) / 0.6) : 0;
  const cy = 560 + 760 * 0.55;
  return (
    <AbsoluteFill>
      <Day t={t} />
      <Over>
        <CurioPill />
        <g>
          <rect x={0} y={560} width={1080} height={760} fill="#8B5E3C" />
          <rect x={0} y={560} width={1080} height={26} fill="#6FAE5F" />
          {Array.from({ length: 22 }, (_, i) => (
            <ellipse key={i} cx={(i * 173) % 1080} cy={610 + ((i * 97) % 690)} rx={10 + (i % 4) * 5} ry={7 + (i % 3) * 3} fill="#6E4A2F" />
          ))}
          <rect x={0} y={cy - 16} width={540 - 30 * cut} height={32} rx={16} fill="#F97316" stroke="#7C2D12" strokeWidth={4} />
          <rect x={540 + 30 * cut} y={cy - 16} width={540} height={32} rx={16} fill="#F97316" stroke="#7C2D12" strokeWidth={4} />
          {Array.from({ length: 9 }, (_, i) => {
            const x = ((i * 120 + t * 520) % 1200) - 60;
            if (cut && x > 520) return null;
            return <circle key={i} cx={x} cy={cy} r={7} fill="#FFF7AE" />;
          })}
          {spark > 0.02 ? <circle cx={540} cy={cy} r={40 + 120 * (1 - spark)} fill="#FEF08A" opacity={0.6 * spark} /> : null}
          {spark > 0.02
            ? Array.from({ length: 14 }, (_, i) => {
                const a = (i / 14) * Math.PI * 2;
                const l = 40 + 160 * (1 - spark);
                return <line key={i} x1={540} y1={cy} x2={540 + Math.cos(a) * l} y2={cy + Math.sin(a) * l} stroke={i % 2 ? '#FDE047' : '#FFFFFF'} strokeWidth={8} strokeLinecap="round" opacity={spark} />;
              })
            : null}
        </g>
        {hits.map((a, k) => (
          <Dirt key={k} t={t} at={a} x={540} y={560 + 120 + 200 * depth(k)} n={18} s={1.3} />
        ))}
        {/* the spade, coming down deeper each time */}
        <g transform={`translate(540 ${300 + 520 * blade}) rotate(${4 * Math.sin(t * 5)})`}>
          <rect x={-14} y={-420} width={28} height={420} rx={14} fill="#B07A58" stroke="#3B2A20" strokeWidth={5} />
          <path d="M -70 0 L 70 0 L 56 140 Q 0 180 -56 140 Z" fill="#9CA3AF" stroke="#374151" strokeWidth={6} />
        </g>
        <Pop f={f} fps={fps} at={fibra - 0.1} x={540} y={1210} rot={-3}>
          <rect x={-380} y={-56} width={760} height={112} rx={24} fill={CU.coral} stroke={CU.ink} strokeWidth={6} />
          <text y={18} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={50} fill="#FFF">
            NO ERA COBRE: FIBRA ÓPTICA
          </text>
        </Pop>
      </Over>
    </AbsoluteFill>
  );
};

/** 4. The map: light runs along the cable from Georgia to Armenia, then stops; Armenia goes grey, its wifi signs go out. */
const MapShot: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const armenia2 = num(mark('armenia2'), 1.2);
  const desco = num(mark('desco'), 99);
  const dark = t >= desco;
  const pathD = 'M 470 700 C 520 820 560 900 600 1060';
  const pulses = dark ? [] : Array.from({ length: 6 }, (_, i) => ((t * 0.9 + i / 6) % 1));
  const pt = (q: number) => {
    const a = { x: 470, y: 700 }, b = { x: 520, y: 820 }, c = { x: 560, y: 900 }, d = { x: 600, y: 1060 };
    const u = 1 - q;
    return { x: u * u * u * a.x + 3 * u * u * q * b.x + 3 * u * q * q * c.x + q * q * q * d.x, y: u * u * u * a.y + 3 * u * u * q * b.y + 3 * u * q * q * c.y + q * q * q * d.y };
  };
  return (
    <AbsoluteFill>
      <Day t={t} />
      <Over>
        <CurioPill />
        <Pop f={f} fps={fps} at={0.05} x={540} y={330}>
          <OutText x={0} y={0} size={70} fill={CU.ink} text="ESE CABLE LLEVABA" stroke={0} />
        </Pop>
        <Pop f={f} fps={fps} at={armenia2 - 0.15} x={540} y={420}>
          <OutText x={0} y={0} size={86} fill={CU.sun} text="INTERNET A ARMENIA" stroke={13} />
        </Pop>
        {/* Georgia above, Armenia below */}
        <path d="M 160 520 Q 420 470 700 540 Q 900 560 940 640 Q 860 720 640 730 Q 400 760 220 700 Q 140 620 160 520 Z" fill="#DCFCE7" stroke={CU.ink} strokeWidth={5} />
        <text x={260} y={620} fontFamily={HEAVY} fontWeight={900} fontSize={40} fill={CU.ink}>
          GEORGIA
        </text>
        <path d="M 400 900 Q 560 850 760 920 Q 820 1050 740 1180 Q 600 1240 460 1170 Q 360 1060 400 900 Z" fill={dark ? '#E2E8F0' : '#CCFBF1'} stroke={CU.ink} strokeWidth={5} />
        <text x={480} y={1110} fontFamily={HEAVY} fontWeight={900} fontSize={44} fill={dark ? CU.soft : CU.ink}>
          ARMENIA
        </text>
        <path d={pathD} fill="none" stroke="#F97316" strokeWidth={12} strokeLinecap="round" />
        {pulses.map((q, i) => {
          const p = pt(q);
          return <circle key={i} cx={p.x} cy={p.y} r={10} fill="#FFF7AE" stroke="#F59E0B" strokeWidth={3} />;
        })}
        {/* the cut, with the spade */}
        <g transform={`translate(470 700) rotate(${10 * Math.sin(t * 4)})`}>
          <circle r={26} fill={CU.coral} stroke={CU.ink} strokeWidth={4} />
          <path d="M -10 -10 L 10 10 M 10 -10 L -10 10" stroke="#FFF" strokeWidth={5} strokeLinecap="round" />
        </g>
        {[0, 1, 2, 3, 4].map((i) => (
          <Wifi key={i} x={470 + i * 60} y={980 + (i % 2) * 70} on={!dark || t < desco + i * 0.08} />
        ))}
      </Over>
    </AbsoluteFill>
  );
};

/** A city in world space for the people shot: sky, buildings with windows, the street. */
const City: React.FC<{ t: number; lights: number }> = ({ t, lights }) => (
  <g>
    <rect x={ME.x - 900} y={FLOOR - 900} width={1800} height={900} fill="#BFE6F6" />
    {Array.from({ length: 9 }, (_, i) => {
      const w = 150 + (i % 3) * 30;
      const h = 260 + ((i * 97) % 220);
      const x = ME.x - 820 + i * 190;
      return (
        <g key={i}>
          <rect x={x} y={FLOOR - h} width={w} height={h} fill={i % 2 ? '#F5D0A9' : '#FDE7C8'} stroke={CU.ink} strokeWidth={4} />
          {Array.from({ length: 6 }, (_, j) => (
            <rect key={j} x={x + 20 + (j % 2) * 60} y={FLOOR - h + 30 + Math.floor(j / 2) * 70} width={36} height={40} fill={lights > 0.5 ? '#94A3B8' : '#FEF08A'} />
          ))}
        </g>
      );
    })}
    <rect x={ME.x - 900} y={FLOOR} width={1800} height={600} fill="#CBD5E1" />
    <rect x={ME.x - 900 + ((t * 80) % 200)} y={FLOOR + 60} width={2000} height={8} fill="#FFF" opacity={0.5} />
  </g>
);

/** 4b. In Armenia: Pip and Mo, phones up, no connection; the clock runs "for hours"; parts of Georgia too. */
const People: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const horas = num(mark('horas'), 1.2);
  const georgia2 = num(mark('georgia2'), 2.4);
  const shake = Math.sin(t * 14);
  const left: Pose = { ...basePose, x: ME.x - 170, y: ME.y, scale: ME.scale, yaw: 0.2, look: 0.2, headTilt: -6, armR: { a: 125 + 10 * shake, b: 70 }, armL: { a: 20, b: 15 }, expr: 'worried' };
  const right: Pose = { ...basePose, x: ME.x + 170, y: ME.y, scale: ME.scale, yaw: -0.2, look: -0.2, headTilt: 6, armL: { a: 150 + 8 * Math.sin(t * 9), b: 20 }, armR: { a: 20, b: 15 }, expr: 'shock' };
  const spin = t * 400;
  return (
    <AbsoluteFill>
      <CineCamera cx={ME.x} cy={FLOOR - 270} zoom={1.45 + 0.06 * clamp(t / 3)} tint="amber" vignette={0.1} bg={CU.cream}>
        <City t={t} lights={1} />
        <CharacterRig look={LOOKS.pip} pose={left} t={0.4 + t} rim="amber" seed={3} />
        <CharacterRig look={LOOKS.mo} pose={right} t={0.6 + t} rim="amber" seed={4} />
      </CineCamera>
      <Over>
        <CurioPill />
        {[{ x: 290, y: 600 }, { x: 790, y: 570 }].map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y + 8 * Math.sin(t * 3 + i)})`}>
            <rect x={-150} y={-56} width={300} height={112} rx={24} fill={CU.card} stroke={CU.coral} strokeWidth={5} />
            <circle cx={-100} cy={0} r={22} fill="none" stroke="#E2E8F0" strokeWidth={7} />
            <path d="M -100 -22 A 22 22 0 0 1 -78 0" fill="none" stroke={CU.coral} strokeWidth={7} strokeLinecap="round" transform={`rotate(${spin + i * 90} -100 0)`} />
            <text x={30} y={12} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill={CU.ink}>
              Sin conexión
            </text>
          </g>
        ))}
        <Pop f={f} fps={fps} at={horas - 0.3} x={540} y={330}>
          <rect x={-260} y={-50} width={520} height={100} rx={50} fill={CU.card} stroke={CU.coral} strokeWidth={6} />
          <circle cx={-195} cy={0} r={30} fill="#FFF" stroke={CU.ink} strokeWidth={5} />
          <line x1={-195} y1={0} x2={-195} y2={-22} stroke={CU.ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${t * 720} -195 0)`} />
          <text x={40} y={17} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={48} fill={CU.ink}>
            DURANTE HORAS
          </text>
        </Pop>
        <Pop f={f} fps={fps} at={georgia2 - 0.25} x={540} y={440} rot={-3}>
          <rect x={-260} y={-38} width={520} height={76} rx={38} fill={CU.coral} stroke={CU.ink} strokeWidth={4} />
          <text y={13} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={36} fill="#FFF">
            Y PARTE DE GEORGIA
          </text>
        </Pop>
      </Over>
    </AbsoluteFill>
  );
};

/** 5. The police car arrives, lights flashing; she is released because of her age. */
const Police: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const solto = num(mark('solto'), 1.4);
  const arrive = clamp(t / 0.7);
  const carX = 1500 - 760 * (1 - Math.pow(1 - arrive, 3));
  const flash = Math.floor(t * 8) % 2 === 0;
  const free = t >= solto;
  const pose: Pose = { ...basePose, x: ME.x - 120, y: ME.y, scale: ME.scale, yaw: 0.4, look: 0.5, headTilt: free ? 6 * Math.sin(t * 6) : 0, armR: { a: free ? 40 : 160, b: free ? 20 : 30 }, armL: { a: free ? 40 : 160, b: free ? 20 : 30 }, expr: free ? 'happy' : 'shock' };
  return (
    <AbsoluteFill>
      <CineCamera cx={ME.x} cy={FLOOR - 260} zoom={1.4} tint="amber" vignette={0.1} bg={CU.cream}>
        <Field t={t + 6} />
        <rect x={ME.x - 900} y={FLOOR + 40} width={1800} height={1500} fill="#8B5E3C" />
        <CharacterRig look={GRANNY} pose={pose} t={0.4 + t} rim="amber" seed={8} />
      </CineCamera>
      <Over>
        <CurioPill />
        {/* the police car, sliding in from the right */}
        <g transform={`translate(${carX} 1220)`}>
          <ellipse cx={0} cy={110} rx={240} ry={22} fill="#000" opacity={0.15} />
          <rect x={-230} y={-20} width={460} height={120} rx={36} fill="#F8FAFC" stroke={CU.ink} strokeWidth={6} />
          <path d="M -130 -20 L -90 -90 L 110 -90 L 150 -20 Z" fill="#E2E8F0" stroke={CU.ink} strokeWidth={6} />
          <rect x={-230} y={30} width={460} height={30} fill="#1D4ED8" />
          <text x={0} y={52} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={26} fill="#FFF">
            POLICÍA
          </text>
          <rect x={-50} y={-116} width={100} height={26} rx={8} fill={flash ? '#EF4444' : '#3B82F6'} stroke={CU.ink} strokeWidth={4} />
          <circle cx={0} cy={-103} r={70} fill={flash ? '#EF4444' : '#3B82F6'} opacity={0.18} />
          {[-140, 140].map((wx) => (
            <g key={wx} transform={`translate(${wx} 100) rotate(${-t * 400 * (1 - arrive)})`}>
              <circle r={42} fill="#1E293B" />
              <circle r={16} fill="#94A3B8" />
              <rect x={-3} y={-40} width={6} height={22} fill="#94A3B8" />
            </g>
          ))}
        </g>
        <Pop f={f} fps={fps} at={solto - 0.05} x={560} y={380} rot={-6}>
          <rect x={-320} y={-70} width={640} height={140} rx={18} fill={CU.card} stroke={CU.teal} strokeWidth={10} />
          <text y={-5} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={66} fill={CU.teal}>
            LIBERADA
          </text>
          <text y={50} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={38} fill={CU.ink}>
            TIENE 75 AÑOS
          </text>
        </Pop>
      </Over>
    </AbsoluteFill>
  );
};

/** 5b. The newspaper spins in and lands: LA HACKER DE LA PALA. */
const Press: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const hacker = num(mark('hacker'), 1.2);
  const k = springAt(f, fps, 0.05, { stiffness: 120, damping: 14, mass: 0.7 });
  const kk = Math.min(1.05, k);
  const head = springAt(f, fps, hacker - 0.1, HARD);
  return (
    <AbsoluteFill>
      <Day t={t} />
      <Over>
        <CurioPill />
        <g transform={`translate(540 860) rotate(${(1 - kk) * 720 - 4 + 2 * Math.sin(t * 2)}) scale(${0.15 + 0.85 * kk})`}>
          <rect x={-420} y={-520} width={840} height={1040} rx={10} fill="#FDFBF5" stroke={CU.ink} strokeWidth={8} />
          <text y={-420} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={80} fill={CU.ink}>
            LA NOTICIA
          </text>
          <line x1={-380} y1={-385} x2={380} y2={-385} stroke={CU.ink} strokeWidth={5} />
          <text y={-345} textAnchor="middle" fontFamily={HEAVY} fontSize={28} fill={CU.soft}>
            ABRIL DE 2011
          </text>
          <g transform={`scale(${0.7 + 0.3 * Math.min(1.08, head)})`} opacity={Math.min(1, head * 1.6)}>
            <text y={-230} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={92} fill={CU.coral}>
              LA HACKER
            </text>
            <text y={-130} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={92} fill={CU.coral}>
              DE LA PALA
            </text>
          </g>
          {/* the photo: the grandma and her spade */}
          <rect x={-300} y={-60} width={600} height={420} fill="#E2E8F0" stroke={CU.ink} strokeWidth={5} />
          <circle cx={-40} cy={90} r={70} fill="#F6EFE3" stroke={CU.ink} strokeWidth={5} />
          <path d="M -110 60 Q -40 -10 30 60" fill="#E5E7EB" stroke={CU.ink} strokeWidth={5} />
          <rect x={-110} y={160} width={140} height={200} rx={30} fill="#8B6BA8" stroke={CU.ink} strokeWidth={5} />
          <rect x={90} y={20} width={14} height={300} rx={7} fill="#B07A58" stroke={CU.ink} strokeWidth={3} />
          <path d="M 70 310 L 124 310 L 116 350 Q 97 362 78 350 Z" fill="#9CA3AF" stroke={CU.ink} strokeWidth={3} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-300} y={390 + i * 28} width={600 - (i % 2) * 120} height={12} rx={6} fill="#CBD5E1" />
          ))}
        </g>
      </Over>
    </AbsoluteFill>
  );
};

/** The edit's own layer over every shot: comic bursts on the hits, stickers, and question cards that open each part. */
const BURSTS = ['pala', 'cobre', 'corto', 'desco', 'solto', 'hacker', 'fallo'];
const STICKERS: { mark: string; text: string; x: number; y: number; rot: number; bg: string; ink: string; dur: number }[] = [
  { mark: 'corto', text: '¡ZAS!', x: 830, y: 860, rot: 12, bg: '#FDE047', ink: '#1E293B', dur: 1.0 },
  { mark: 'desco', text: '¡NOOO!', x: 820, y: 1080, rot: -10, bg: '#F25F5C', ink: '#FFFFFF', dur: 1.1 },
  { mark: 'solto', text: '¡LIBRE!', x: 230, y: 960, rot: -8, bg: '#14B8A6', ink: '#FFFFFF', dur: 1.2 },
  { mark: 'hacker', text: '¡JA!', x: 850, y: 1300, rot: 10, bg: '#FDE047', ink: '#1E293B', dur: 1.3 },
];
const QUESTIONS: { at: string; text: string; dur: number }[] = [
  { at: 'cavo1', text: '¿QUÉ ENCONTRÓ?', dur: 1.2 },
  { at: 'policia', text: '¿Y A ELLA QUÉ LE PASÓ?', dur: 1.3 },
];
const Edits: React.FC<{ t: number; f: number; fps: number; M: (n: string) => number }> = ({ t, f, fps, M }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      {BURSTS.map((n) => {
        const k = (t - M(n)) / 0.35;
        if (k < 0 || k > 1) return null;
        return (
          <g key={n} opacity={1 - k}>
            {Array.from({ length: 24 }, (_, i) => {
              const a = (i / 24) * Math.PI * 2 + i;
              const r0 = 380 + 300 * k;
              return <line key={i} x1={540 + Math.cos(a) * r0} y1={900 + Math.sin(a) * r0} x2={540 + Math.cos(a) * (r0 + 260)} y2={900 + Math.sin(a) * (r0 + 260)} stroke={i % 2 ? '#FDE047' : '#FFFFFF'} strokeWidth={10} strokeLinecap="round" />;
            })}
          </g>
        );
      })}
      {STICKERS.map((st) => {
        const at = M(st.mark);
        if (t < at || t > at + st.dur) return null;
        const k = springAt(f, fps, at, { stiffness: 260, damping: 11, mass: 0.6 });
        const out = Math.min(1, (at + st.dur - t) / 0.15);
        return (
          <g key={st.mark} transform={`translate(${st.x} ${st.y}) rotate(${st.rot + 4 * Math.sin(t * 9)}) scale(${(0.3 + 0.7 * Math.min(1.15, k)) * out})`}>
            <rect x={-150} y={-58} width={300} height={116} rx={24} fill={st.bg} stroke="#1E293B" strokeWidth={7} />
            <text y={22} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={66} fill={st.ink}>
              {st.text}
            </text>
          </g>
        );
      })}
      {QUESTIONS.map((q) => {
        const at = M(q.at) - 0.05;
        if (t < at || t > at + q.dur) return null;
        const k = springAt(f, fps, at, HARD);
        const out = Math.min(1, (at + q.dur - t) / 0.15);
        return (
          <g key={q.at} transform={`translate(540 ${300 - 40 * (1 - Math.min(1, k))})`} opacity={Math.min(1, k * 1.6) * out}>
            <rect x={-440} y={-56} width={880} height={112} rx={56} fill="#1E293B" />
            <text y={20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={56} fill="#FDE047">
              {q.text}
            </text>
          </g>
        );
      })}
    </svg>
  </AbsoluteFill>
);

const SHOTS: Record<string, React.FC<ShotProps>> = { ...WHATIF_SHOTS, door: H4 };

export const Sabias01: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const T = SABIAS01;
  let idx = 0;
  for (let i = 0; i < T.shots.length; i++) if (T.shots[i].start <= t + 1e-6) idx = i;
  const shot = T.shots[idx];
  const View = SHOTS[shot.kind];
  const props: ShotProps = {
    t: t - shot.start,
    f: f - Math.round(shot.start * fps),
    fps,
    dur: shot.end - shot.start,
    variant: shot.variant,
    mark: (name: string) => (T.marks[name] ?? Number.NaN) - (T.visualLead?.[name] ?? 0) - shot.start,
  };
  const last = idx === T.shots.length - 1;
  const cam0 = camera(t, f, fps, shot.start, shot.end, T.fx, 0, idx, 0.95);
  const w = last ? lin(t, T.duration - 0.32, T.duration - 1 / fps) : 0;
  const lt = t - shot.start;
  const kb = idx === 0 ? 0 : Math.min(1, lt / Math.max(0.5, shot.end - shot.start)) * (1 - w);
  const side = idx % 2 ? 1 : -1;
  const swipe = idx > 0 ? Math.exp(-lt / 0.07) : 0;
  const cam = { x: cam0.x * (1 - w) + side * 22 * kb + side * 260 * swipe, y: cam0.y * (1 - w) - 12 * kb, scale: (1 + (cam0.scale - 1) * (1 - w)) * (1 + 0.05 * kb), rot: cam0.rot * (1 - w) };
  const M = (n: string) => T.marks[n] ?? Infinity;
  // glitch: the colours split for a moment on the cut and on the blackout
  const glitch = ['corto', 'desco'].some((n) => t >= M(n) - 0.02 && t < M(n) + 0.22);
  const filters = [swipe > 0.03 ? `blur(${(12 * swipe).toFixed(1)}px)` : '', glitch ? `drop-shadow(${(8 + 6 * Math.sin(f)).toFixed(0)}px 0 0 rgba(255,0,60,0.65)) drop-shadow(-8px 0 0 rgba(0,220,255,0.65))` : ''].join(' ').trim();
  return (
    <AbsoluteFill style={{ background: '#1B1224' }}>
      <Audio src={staticFile('sabias01/mix.wav')} />
      <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale}) rotate(${cam.rot}deg)`, filter: filters || undefined }}>
        <View {...props} />
      </AbsoluteFill>
      {w > 0 ? (
        <AbsoluteFill style={{ opacity: w }}>
          <TitleWide t={0} f={0} fps={fps} dur={2} mark={() => Number.NaN} />
        </AbsoluteFill>
      ) : null}
      <Finish f={f} />
      {w > 0.5 ? null : <KineticCaptions subs={T.subs} f={f} fps={fps} top={1380} />}
      <AlertOverlay f={f} fps={fps} fx={T.fx} />
    </AbsoluteFill>
  );
};

/** The storyboard: frame n is shot n, at a moment where everything in it is on screen. */
export const Sabias01Board: React.FC = () => {
  const f = useCurrentFrame();
  const list: [React.FC<ShotProps>, string | undefined, number, Record<string, number>][] = [...BOARD, [H4, undefined, 2.4, { cierre: 0.1, q2: 0.45, q3: 0.8, sigue: 1.5, tap: 3.0 }]];
  const [Shot, variant, t, m] = list[Math.min(list.length - 1, f)];
  return (
    <AbsoluteFill style={{ background: '#1B1224' }}>
      <Shot t={t} f={Math.round(t * 30)} fps={30} dur={8} variant={variant} mark={(n) => m[n] ?? Number.NaN} />
    </AbsoluteFill>
  );
};
