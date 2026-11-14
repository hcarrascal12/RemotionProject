import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../components/fonts';
import { KitDefs, SetDefs, faceAt } from '../engine';
import timelineJson from './timeline.json';
import { Pepito, Samuel, Tito, stand } from './cast';
import { Station, Truck } from './Station';

// "Operación Corazón": the children's video in a low-quality render (the audio is what matters). Everything comes from
// timeline.json, which tools/kids_build.py writes together with the audio mix: who speaks when (and how loud, for the mouths),
// the scene changes and the events (phone, siren, truck, signs, Bible, fanfare).

type Line = { line: number; speaker: string; scene: number; start: number; end: number; expr: string; react: string; icon: string | null };
type Bed = { t: number; name: string; bpm: number };
type Ev = { t: number; kind: string; d: number };
type Timeline = { fps: number; duration: number; lines: Line[]; events: Ev[]; beds: Bed[]; env: Record<string, number[]> };
export const KIDS = timelineJson as unknown as Timeline;

const SIGNS: Record<string, string> = { sign1: 'ORACIÓN', sign2: 'LA PALABRA DE DIOS', sign3: 'ADORACIÓN' };
const lerp = (a: number, b: number, k: number) => a + (b - a) * Math.min(1, Math.max(0, k));
const sm = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};


type IconKind = string;
const Icon: React.FC<{ kind: IconKind; x: number; y: number; k: number; t: number }> = ({ kind, x, y, k, t }) => {
  if (k <= 0.01) return null;
  const bob = 8 * Math.sin(t * 5);
  const body = (() => {
    switch (kind) {
      case 'heart':
        return <path d="M 0 40 C -70 -10 -40 -60 0 -25 C 40 -60 70 -10 0 40 Z" fill="#EF4444" stroke="#7F1D1D" strokeWidth={6} />;
      case 'star':
        return <path d="M 0 -50 L 15 -16 L 52 -14 L 23 9 L 33 45 L 0 24 L -33 45 L -23 9 L -52 -14 L -15 -16 Z" fill="#FACC15" stroke="#B45309" strokeWidth={6} strokeLinejoin="round" />;
      case 'eye':
        return (
          <g>
            <path d="M -62 0 Q 0 -56 62 0 Q 0 56 -62 0 Z" fill="#fff" stroke="#1E3A8A" strokeWidth={7} />
            <circle r={22} fill="#2563EB" />
            <circle r={9} fill="#0B1220" />
          </g>
        );
      case 'book':
        return (
          <g>
            <rect x={-48} y={-36} width={96} height={72} rx={8} fill="#92400E" stroke="#451A03" strokeWidth={6} />
            <rect x={-38} y={-26} width={76} height={52} rx={4} fill="#FFFBEB" />
            <path d="M 0 -26 L 0 26" stroke="#92400E" strokeWidth={4} />
          </g>
        );
      case 'notes':
        return (
          <g fill="#7C3AED" stroke="#4C1D95" strokeWidth={4}>
            <circle cx={-26} cy={26} r={16} />
            <circle cx={26} cy={16} r={16} />
            <path d="M -12 26 L -12 -34 L 38 -46 L 38 16" fill="none" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      case 'hands':
        return (
          <g fill="#F2C9A0" stroke="#8A5A2E" strokeWidth={6} strokeLinejoin="round">
            <path d="M -4 40 L -4 -44 Q -26 -50 -34 -22 L -34 40 Z" />
            <path d="M 4 40 L 4 -44 Q 26 -50 34 -22 L 34 40 Z" />
          </g>
        );
      case 'question':
        return <text textAnchor="middle" y={34} fontFamily="Therac Heavy" fontWeight={900} fontSize={110} fill="#F59E0B" stroke="#7C2D12" strokeWidth={6} paintOrder="stroke">?</text>;
      case 'alarm':
        return (
          <g>
            <circle r={46} fill="#EF4444" stroke="#7F1D1D" strokeWidth={6} />
            <text textAnchor="middle" y={30} fontFamily="Therac Heavy" fontWeight={900} fontSize={80} fill="#fff">!</text>
          </g>
        );
      case 'fridge':
        return (
          <g>
            <rect x={-34} y={-52} width={68} height={104} rx={10} fill="#E2E8F0" stroke="#475569" strokeWidth={6} />
            <line x1={-34} y1={-8} x2={34} y2={-8} stroke="#475569" strokeWidth={5} />
            <rect x={14} y={-40} width={6} height={22} rx={3} fill="#475569" />
            <g transform="translate(40 30)">
              <rect x={-16} y={-4} width={32} height={26} rx={5} fill="#FACC15" stroke="#B45309" strokeWidth={4} />
              <path d="M -9 -4 L -9 -16 Q 0 -28 9 -16 L 9 -4" fill="none" stroke="#B45309" strokeWidth={5} />
            </g>
          </g>
        );
      case 'food':
        return (
          <g>
            <circle r={38} fill="#EF4444" stroke="#7F1D1D" strokeWidth={6} />
            <path d="M 0 -36 Q 6 -58 24 -54 Q 18 -38 0 -36 Z" fill="#22C55E" stroke="#166534" strokeWidth={4} />
          </g>
        );
      case 'hungry':
        return (
          <g>
            <circle r={44} fill="#fff" stroke="#94A3B8" strokeWidth={6} />
            <circle r={26} fill="#F1F5F9" stroke="#CBD5E1" strokeWidth={4} />
          </g>
        );
      case 'bulb':
        return (
          <g>
            <circle cy={-8} r={36} fill="#FDE047" stroke="#B45309" strokeWidth={6} />
            <rect x={-16} y={26} width={32} height={22} rx={6} fill="#94A3B8" stroke="#475569" strokeWidth={4} />
          </g>
        );
      case 'no':
        return (
          <g>
            <circle r={46} fill="none" stroke="#EF4444" strokeWidth={10} />
            <line x1={-33} y1={33} x2={33} y2={-33} stroke="#EF4444" strokeWidth={10} strokeLinecap="round" />
          </g>
        );
      case 'laugh':
        return <text textAnchor="middle" y={26} fontFamily="Therac Heavy" fontWeight={900} fontSize={64} fill="#F97316" stroke="#7C2D12" strokeWidth={5} paintOrder="stroke">JA JA JA</text>;
      case 'ear':
        return <path d="M -10 -50 Q 40 -50 40 0 Q 40 30 10 40 Q 0 60 -22 48 L -22 30 Q 0 20 0 0 Q 0 -20 -20 -22 Z" fill="#F2C9A0" stroke="#8A5A2E" strokeWidth={6} />;
      case 'siren':
        return (
          <g>
            <rect x={-30} y={10} width={60} height={22} rx={6} fill="#475569" />
            <path d="M -26 10 Q -26 -40 0 -40 Q 26 -40 26 10 Z" fill={Math.floor(t * 6) % 2 ? '#EF4444' : '#3B82F6'} stroke="#1E293B" strokeWidth={5} />
          </g>
        );
      case 'phone':
        return (
          <g>
            <rect x={-26} y={-46} width={52} height={92} rx={12} fill="#EF4444" stroke="#7F1D1D" strokeWidth={5} />
            <text textAnchor="middle" y={12} fontFamily="Therac Heavy" fontWeight={900} fontSize={34} fill="#fff">ring</text>
          </g>
        );
      case 'wave':
        return <text textAnchor="middle" y={26} fontFamily="Therac Heavy" fontWeight={900} fontSize={60} fill="#22C55E" stroke="#14532D" strokeWidth={5} paintOrder="stroke">¡HOLA!</text>;
      default:
        return null;
    }
  })();
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${0.5 + 0.5 * Math.min(1.15, k)})`} opacity={Math.min(1, k * 2)}>
      <circle r={78} fill="#FFFFFF" opacity={0.92} stroke="#FDE68A" strokeWidth={8} />
      <g transform="scale(1.0)">{body}</g>
    </g>
  );
};

const Street: React.FC<{ t: number; scroll: number; evening: boolean }> = ({ t, scroll, evening }) => (
  <g>
    <defs>
      <linearGradient id="k-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={evening ? '#FDBA74' : '#7DD3FC'} />
        <stop offset="100%" stopColor={evening ? '#FEF3C7' : '#E0F7FF'} />
      </linearGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#k-sky)" />
    <circle cx={1500} cy={190} r={70} fill={evening ? '#FB923C' : '#FDE047'} />
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${((i * 700 + 200 - t * 20) % 2300) - 200} ${120 + i * 70})`} opacity={0.9}>
        <ellipse rx={110} ry={34} fill="#FFFFFF" />
        <ellipse cx={-60} cy={10} rx={70} ry={26} fill="#FFFFFF" />
        <ellipse cx={70} cy={12} rx={80} ry={28} fill="#FFFFFF" />
      </g>
    ))}
    {[0, 1, 2, 3].map((i) => (
      <path key={i} transform={`translate(${((i * 700 - scroll * 0.3) % 2800) - 400} 0)`} d="M 0 640 Q 200 440 420 640 Z" fill={i % 2 ? '#86EFAC' : '#4ADE80'} />
    ))}
    <rect y={620} width={1920} height={460} fill="#4ADE80" />
    <rect y={760} width={1920} height={240} fill="#6B7280" />
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={((i * 260 - scroll) % 2600) - 100} y={872} width={150} height={12} rx={6} fill="#F8FAFC" />)}
    {Array.from({ length: 6 }, (_, i) => (
      <g key={i} transform={`translate(${((i * 520 - scroll * 0.8) % 3100) - 200} 690)`}>
        <rect x={-8} y={-10} width={16} height={70} fill="#92400E" />
        <circle cy={-40} r={50} fill="#16A34A" />
      </g>
    ))}
  </g>
);

const Banner: React.FC<{ text: string; k: number; color?: string; y?: number }> = ({ text, k, color = '#FACC15', y = 250 }) => {
  if (k <= 0.01) return null;
  return (
    <g transform={`translate(960 ${y}) scale(${0.6 + 0.4 * Math.min(1.1, k)})`} opacity={Math.min(1, k * 1.5)}>
      <rect x={-560} y={-80} width={1120} height={160} rx={36} fill={color} stroke="#7C2D12" strokeWidth={10} />
      <text textAnchor="middle" y={30} fontFamily="Therac Heavy" fontWeight={900} fontSize={96} fill="#7C2D12">
        {text}
      </text>
    </g>
  );
};

const Bible: React.FC<{ k: number }> = ({ k }) => {
  if (k <= 0.01) return null;
  return (
    <g transform={`translate(960 600) scale(${0.5 + 0.5 * Math.min(1, k)})`} opacity={Math.min(1, k * 2)}>
      <rect x={-430} y={-270} width={860} height={540} rx={26} fill="#78350F" stroke="#451A03" strokeWidth={10} />
      <rect x={-410} y={-250} width={400} height={500} rx={14} fill="#FFFBEB" />
      <rect x={10} y={-250} width={400} height={500} rx={14} fill="#FFFBEB" />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <rect x={-370} y={-190 + i * 40} width={320} height={8} rx={4} fill="#D6C7A1" />
          <rect x={50} y={-190 + i * 40} width={320} height={8} rx={4} fill="#D6C7A1" />
        </g>
      ))}
      <text x={-210} y={-210} textAnchor="middle" fontFamily="Therac Heavy" fontWeight={900} fontSize={46} fill="#7C2D12">MATEO 6</text>
      <text x={210} y={-210} textAnchor="middle" fontFamily="Therac Heavy" fontWeight={900} fontSize={46} fill="#7C2D12">16-18</text>
    </g>
  );
};

const SPOT: Record<string, number> = { T: 560, P: 1000, S: 1400 };
const CAST_EXPR = ['neutral', 'happy', 'smug', 'shock', 'worried', 'oops', 'cool', 'dizzy', 'tired'] as const;

export const Kids: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const T = KIDS;
  const ev = (kind: string) => T.events.filter((e) => e.kind === kind);
  let scene = 1;
  for (const e of T.events) {
    if (t >= e.t && ['scene3', 'scene4', 'scene5', 'scene6'].includes(e.kind)) scene = Number(e.kind.slice(5));
  }
  if (t >= (ev('truck')[0]?.t ?? 1e9) + 0.5 && scene === 1) scene = 2;
  const curIdx = T.lines.reduce((acc, l, i) => (l.start <= t + 0.02 ? i : acc), -1);
  const cur = curIdx >= 0 ? T.lines[curIdx] : undefined;
  const speaking = cur && t < cur.end + 0.05;
  const talking = speaking ? cur!.speaker : '';
  const level = (sp: string) => (T.env[sp] ? T.env[sp][Math.min(T.env[sp].length - 1, f)] ?? 0 : 0);
  const sp = (s2: string) => (talking === s2 ? level(s2) : 0);
  // faces: the speaker shows the line's emotion (a neutral or happy face flaps with the voice); the others react
  const face = (who: string) => {
    if (!cur) return 'happy';
    if (talking === who) {
      const base = cur.expr;
      if (base === 'happy' || base === 'neutral') return sp(who) > 0.28 ? 'happy' : 'neutral';
      return base;
    }
    if (talking === 'A' || talking === 'N') return cur.react;
    return cur.react;
  };
  // the beat: everybody bobs to the music of the moment
  const bed = [...T.beds].reverse().find((b) => b.t <= t) ?? T.beds[0];
  const phase = ((t - bed.t) * bed.bpm) / 60;
  const bob = 9 * Math.abs(Math.sin(Math.PI * phase));
  const hop = (who: string) => (talking === who ? -18 * sp(who) - 0.4 * bob : -bob * 0.9);
  const jump = talking === 'A' ? -40 * Math.abs(Math.sin(t * 9)) : 0;
  const truckEv = ev('truck')[0];
  const phone = ev('phone')[0];
  const siren = ev('siren')[0];
  const sirenOn = (siren && t >= siren.t && t < siren.t + siren.d) || (truckEv && t >= truckEv.t + 0.5 && t < truckEv.t + truckEv.d) || (scene === 6 && t > (ev('end')[0]?.t ?? 1e9));
  const ring = phone && t >= phone.t && t < phone.t + phone.d ? 1 : 0;
  let truckX = 1450;
  let showTruck = true;
  if (scene === 1) {
    if (truckEv && t >= truckEv.t) truckX = lerp(1450, 2500, sm((t - truckEv.t) / truckEv.d));
  } else if (scene === 2 || scene === 3) {
    truckX = truckEv ? lerp(-500, 1560, sm((t - (truckEv.t + truckEv.d - 1.2)) / 1.4)) : 1560;
    if (scene === 3) truckX = 1600;
  } else {
    truckX = 1600;
  }
  if (scene >= 2 && t < (truckEv?.t ?? 0) + (truckEv?.d ?? 0) - 1.2) showTruck = false;
  const truckBounce = scene === 4 || (truckEv && t >= truckEv.t && t < truckEv.t + truckEv.d) ? 5 * Math.abs(Math.sin(t * 14)) : 0;
  const laughing = cur?.icon === 'laugh' && talking === 'T';
  const shake = laughing ? 7 * Math.sin(t * 38) : 0;
  const arms = (who: string, side: 'L' | 'R') => {
    if (talking !== who) return { a: 15 + (side === 'L' ? 4 : -4) * Math.sin(t * 2), b: 10 };
    const e = cur!.expr;
    const w = 0.5 + 0.5 * Math.sin(t * 7 + (side === 'L' ? 0 : 1.6));
    if (e === 'shock') return { a: 110 + 25 * w, b: 50 };
    if (e === 'cool') return { a: 40 + 70 * w, b: 20 };
    if (e === 'smug') return side === 'R' ? { a: 55 + 35 * w, b: 25 } : { a: 20, b: 12 };
    if (e === 'worried') return { a: 70 + 10 * w, b: 70 };
    return { a: 40 + 55 * w, b: 30 };
  };
  const titoPose = stand({ x: 560, y: 840 + hop('T') + jump, scale: 1.25, yaw: 0.1, tilt: shake, ...faceAt(f, [[0, face('T') as never]]), armR: arms('T', 'R'), armL: arms('T', 'L'), headTilt: talking === 'T' ? 3 * Math.sin(t * 5) : -2 });
  const pepPose = stand({ x: 1000, y: 850 + hop('P') * 1.4 + jump, scale: 1.0, yaw: -0.1, ...faceAt(f, [[0, face('P') as never]]), armL: arms('P', 'L'), armR: arms('P', 'R'), headTilt: talking === 'P' ? 4 * Math.sin(t * 6) : 2 });
  const samK = scene >= 3 ? sm((t - (ev('scene3')[0]?.t ?? 0)) / 1.2) : 0;
  const samPose = stand({ x: lerp(2300, 1400, samK), y: 840 + hop('S') + jump, scale: 1.2, yaw: -0.15, ...faceAt(f, [[0, face('S') as never]]), armL: arms('S', 'L'), armR: arms('S', 'R'), headTilt: talking === 'S' ? 3 * Math.sin(t * 5) : 0 });
  const signEv = ['sign1', 'sign2', 'sign3'].map((k) => ({ k, e: ev(k)[0] })).find((o) => o.e && t >= o.e.t && t < o.e.t + o.e.d);
  const scroll = scene === 4 && !(signEv && t < signEv.e!.t + 1.5) ? t * 120 : scene === 2 || scene === 3 ? 0 : t * 30;
  const bib = ev('bible')[0];
  const bibK = bib && t >= bib.t && t < bib.t + bib.d ? sm((t - bib.t) / 0.4) * (1 - sm((t - bib.t - bib.d + 0.5) / 0.5)) : 0;
  const win = ev('win')[0];
  const winK = win && t >= win.t ? sm((t - win.t) / 0.4) * (t < win.t + 6 ? 1 : 0) : 0;
  const roll = ev('roll')[0];
  const rolling = roll && t >= roll.t && t < roll.t + roll.d;
  const pause = ev('pause3')[0];
  const inPause = pause && t >= pause.t && t < pause.t + pause.d;
  const title = ev('title')[0];
  const titleK = title && t < title.d ? 1 - sm((t - title.d + 0.6) / 0.6) : 0;
  // the camera follows the speaker with a gentle push-in
  const targetOf = (l?: Line) => (!l ? 960 : l.speaker === 'N' || l.speaker === 'A' ? 960 : l.speaker === 'P' && scene === 1 ? 1300 : SPOT[l.speaker] ?? 960);
  const prev = curIdx > 0 ? T.lines[curIdx - 1] : undefined;
  const kcam = cur ? sm((t - cur.start) / 0.6) : 1;
  const fx = lerp(targetOf(prev), targetOf(cur), kcam);
  const zoom = 1.0 + (talking && talking !== 'N' && talking !== 'A' ? 0.1 : 0.02) + 0.02 * Math.sin(t * 0.6) + (rolling ? 0.06 * ((t - roll!.t) / roll!.d) : 0);
  const camX = Math.max(960 / zoom, Math.min(1920 - 960 / zoom, 960 + (fx - 960) * 0.55));
  // an icon pops over the speaker for the first two seconds of the line
  const iconK = cur && cur.icon && t >= cur.start + 0.25 && t < cur.start + 2.6 ? sm((t - cur.start - 0.25) / 0.3) * (1 - sm((t - cur.start - 2.2) / 0.4)) : 0;
  const iconX = cur ? (cur.speaker === 'P' && scene === 1 ? 1500 : SPOT[cur.speaker] ?? 960) : 960;
  const iconY = cur && cur.speaker === 'P' && scene === 1 ? 560 : 330;
  const kk = Math.min(1, iconK);
  return (
    <AbsoluteFill style={{ background: '#fff' }}>
      <Audio src={staticFile('kids/mix.wav')} />
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <KitDefs />
        <SetDefs />
        <g transform={`translate(960 540) scale(${zoom}) translate(${-camX} -540)`}>
          {scene === 1 ? (
            <Station t={t} truckX={truckX} siren={sirenOn ? Math.round(t * 4) % 2 : 0} phoneRing={ring ? Math.sin(t * 40) * 0.5 + 0.5 : 0} showTruck />
          ) : (
            <g>
              <Street t={t} scroll={scroll} evening={scene === 5} />
              {showTruck ? <Truck x={truckX} y={880 - truckBounce} s={1.15} siren={sirenOn ? Math.round(t * 4) % 2 : 0} /> : null}
            </g>
          )}
          {scene === 1 || t >= (truckEv?.t ?? 0) + (truckEv?.d ?? 0) - 1.2 ? (
            <g>
              <Tito pose={titoPose} t={t} />
              {scene === 1 ? (
                <g transform="translate(1500 330)">
                  <circle r={170} fill="#FDE68A" stroke="#F59E0B" strokeWidth={10} />
                  <clipPath id="kids-bubble"><circle r={160} /></clipPath>
                  <g clipPath="url(#kids-bubble)">
                    <rect x={-170} y={-170} width={340} height={340} fill="#A7F3D0" />
                    <Pepito pose={stand({ x: 0, y: 170 - bob, scale: 0.9, ...faceAt(f, [[0, face('P') as never]]), armL: arms('P', 'L'), armR: arms('P', 'R') })} t={t} />
                  </g>
                </g>
              ) : (
                <Pepito pose={pepPose} t={t} />
              )}
              {scene >= 3 ? <Samuel pose={samPose} t={t} /> : null}
            </g>
          ) : null}
          {cur && cur.icon && talking !== 'N' ? <Icon kind={cur.icon} x={iconX} y={iconY} k={kk} t={t} /> : null}
          {signEv ? (
            <g transform={`translate(960 ${lerp(-300, 330, sm((t - signEv.e!.t) / 0.5))})`}>
              <rect x={-18} y={0} width={36} height={420} fill="#92400E" />
              <rect x={-520} y={-120} width={1040} height={190} rx={30} fill="#FACC15" stroke="#7C2D12" strokeWidth={10} />
              <text textAnchor="middle" y={22} fontFamily="Therac Heavy" fontWeight={900} fontSize={signEv.k === 'sign2' ? 84 : 110} fill="#7C2D12">{SIGNS[signEv.k]}</text>
            </g>
          ) : null}
        </g>
        {/* the narrator */}
        {talking === 'N' ? (
          <g transform="translate(960 150)">
            <rect x={-250} y={-48} width={500} height={96} rx={48} fill="#FEF3C7" stroke="#B45309" strokeWidth={8} />
            <text textAnchor="middle" y={22} fontFamily="Therac Heavy" fontWeight={900} fontSize={60} fill="#B45309">NARRADOR</text>
          </g>
        ) : null}
        <Bible k={bibK} />
        {inPause ? (
          <g transform="translate(960 300)">
            <circle r={110} fill="#FFFFFF" stroke="#F59E0B" strokeWidth={10} />
            <text textAnchor="middle" y={28} fontFamily="Therac Heavy" fontWeight={900} fontSize={100} fill="#F59E0B">{Math.max(1, Math.ceil(pause.t + pause.d - t))}</text>
          </g>
        ) : null}
        {rolling ? <rect width={1920} height={1080} fill="#000" opacity={0.18 * Math.abs(Math.sin(t * 20))} /> : null}
        <Banner text="¡MISIÓN CUMPLIDA!" k={winK} />
        {scene === 6 && winK > 0
          ? Array.from({ length: 50 }, (_, i) => (
              <rect key={i} x={(i * 97) % 1920} y={(((i * 61) % 400) + (t - (win?.t ?? 0)) * 140) % 1080} width={14} height={24} rx={3} fill={['#EF4444', '#FACC15', '#3B82F6', '#22C55E', '#A855F7'][i % 5]} transform={`rotate(${(t * 90 + i * 40) % 360} ${(i * 97) % 1920} 0)`} />
            ))
          : null}
        {/* the title card */}
        {titleK > 0.01 ? (
          <g opacity={titleK}>
            <rect width={1920} height={1080} fill="#7C2D12" opacity={0.0} />
            <g transform={`translate(960 ${lerp(-100, 330, sm(t / 0.7))})`}>
              <rect x={-760} y={-110} width={1520} height={220} rx={48} fill="#DC2626" stroke="#7F1D1D" strokeWidth={12} />
              <text textAnchor="middle" y={34} fontFamily="Therac Heavy" fontWeight={900} fontSize={140} fill="#FFFFFF" stroke="#7F1D1D" strokeWidth={8} paintOrder="stroke">OPERACIÓN CORAZÓN</text>
            </g>
            <text x={960} y={560} textAnchor="middle" fontFamily="Therac Heavy" fontWeight={900} fontSize={52} fill="#7F1D1D" stroke="#FFFFFF" strokeWidth={9} paintOrder="stroke" opacity={sm((t - 0.9) / 0.5)}>Una aventura para descubrir el verdadero significado del ayuno</text>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
