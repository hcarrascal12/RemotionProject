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

type Line = { line: number; speaker: string; scene: number; start: number; end: number };
type Ev = { t: number; kind: string; d: number };
type Timeline = { fps: number; duration: number; lines: Line[]; events: Ev[]; env: Record<string, number[]> };
export const KIDS = timelineJson as unknown as Timeline;

const SIGNS: Record<string, string> = { sign1: 'ORACIÓN', sign2: 'LA PALABRA DE DIOS', sign3: 'ADORACIÓN' };
const lerp = (a: number, b: number, k: number) => a + (b - a) * Math.min(1, Math.max(0, k));
const sm = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
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

export const Kids: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const T = KIDS;
  const ev = (kind: string) => T.events.filter((e) => e.kind === kind);
  // scene: the one of the latest line that has started, moved earlier by the scene-change events
  let scene = 1;
  for (const e of T.events) {
    if (t >= e.t && ['scene3', 'scene4', 'scene5', 'scene6'].includes(e.kind)) scene = Number(e.kind.slice(5));
  }
  if (t >= (ev('truck')[0]?.t ?? 1e9) + 0.5 && scene === 1) scene = 2;
  const cur = [...T.lines].reverse().find((l) => l.start <= t + 0.02);
  const talking = cur && t < cur.end + 0.05 ? cur.speaker : '';
  const level = (sp: string) => (T.env[sp] ? T.env[sp][Math.min(T.env[sp].length - 1, f)] ?? 0 : 0);
  const sp = (s: string) => (talking === s ? level(s) : 0);
  const open = (s: string) => (sp(s) > 0.28 ? 'happy' : 'neutral');
  const truckEv = ev('truck')[0];
  const phone = ev('phone')[0];
  const siren = ev('siren')[0];
  const sirenOn = (siren && t >= siren.t && t < siren.t + siren.d) || (truckEv && t >= truckEv.t + 0.5 && t < truckEv.t + truckEv.d) || scene === 6 && t > (ev('end')[0]?.t ?? 1e9);
  const ring = phone && t >= phone.t && t < phone.t + phone.d ? 1 : 0;
  // the truck
  let truckX = 1450;
  let showTruck = true;
  if (scene === 1) {
    truckX = 1450;
    if (truckEv && t >= truckEv.t) truckX = lerp(1450, 2500, sm((t - truckEv.t) / truckEv.d));
  } else if (scene === 2 || scene === 3) {
    truckX = truckEv ? lerp(-500, 1560, sm((t - (truckEv.t + truckEv.d - 1.2)) / 1.4)) : 1560;
    if (scene === 3) truckX = 1600;
  } else {
    truckX = 1600;
  }
  if (scene >= 2 && t < (truckEv?.t ?? 0) + (truckEv?.d ?? 0) - 1.2) showTruck = false;
  // characters
  const bounce = (s: string) => -16 * sp(s);
  const titoPose = stand({ x: 560, y: 840 + bounce('T'), scale: 1.25, yaw: 0.1, ...faceAt(f, [[0, open('T')]]), armR: talking === 'T' ? { a: 50 + 40 * Math.sin(t * 7), b: 30 } : { a: 15, b: 10 }, armL: { a: 15, b: 10 } });
  const pepPose = stand({ x: 1000, y: 850 + bounce('P') * 1.4, scale: 1.0, yaw: -0.1, ...faceAt(f, [[0, open('P')]]), armL: talking === 'P' ? { a: 90 + 30 * Math.sin(t * 9), b: 40 } : { a: 20, b: 10 }, armR: talking === 'P' ? { a: 90 - 30 * Math.sin(t * 9), b: 40 } : { a: 20, b: 10 } });
  const samK = scene >= 3 ? sm((t - (ev('scene3')[0]?.t ?? 0)) / 1.2) : 0;
  const samPose = stand({ x: lerp(2300, 1400, samK), y: 840 + bounce('S'), scale: 1.2, yaw: -0.15, ...faceAt(f, [[0, open('S')]]), armL: talking === 'S' ? { a: 60 + 25 * Math.sin(t * 6), b: 30 } : { a: 15, b: 10 } });
  const scroll = scene === 4 && !(ev('sign1')[0] && t >= ev('sign1')[0].t && t < ev('sign1')[0].t + 1.5) ? t * 120 : scene === 2 || scene === 3 ? 0 : t * 30;
  // signs, bible, banner
  const sign = ['sign1', 'sign2', 'sign3'].map((k) => ev(k)[0]).find((e) => e && t >= e.t && t < e.t + e.d);
  const signKey = ['sign1', 'sign2', 'sign3'].find((k) => ev(k)[0] && t >= ev(k)[0].t && t < ev(k)[0].t + ev(k)[0].d);
  const bib = ev('bible')[0];
  const bibK = bib && t >= bib.t && t < bib.t + bib.d ? sm((t - bib.t) / 0.4) * (1 - sm((t - bib.t - bib.d + 0.5) / 0.5)) : 0;
  const win = ev('win')[0];
  const winK = win && t >= win.t ? sm((t - win.t) / 0.4) * (t < win.t + 6 ? 1 : 0) : 0;
  const pause = ev('pause3')[0];
  const inPause = pause && t >= pause.t && t < pause.t + pause.d;
  return (
    <AbsoluteFill style={{ background: '#fff' }}>
      <Audio src={staticFile('kids/mix.wav')} />
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <KitDefs />
        <SetDefs />
        {scene === 1 ? (
          <Station t={t} truckX={truckX} siren={sirenOn ? Math.round(t * 4) % 2 : 0} phoneRing={ring ? Math.sin(t * 40) * 0.5 + 0.5 : 0} showTruck />
        ) : (
          <g>
            <Street t={t} scroll={scroll} evening={scene === 5} />
            {showTruck ? <Truck x={truckX} y={880} s={1.15} siren={sirenOn ? Math.round(t * 4) % 2 : 0} /> : null}
          </g>
        )}
        {scene === 1 || t >= (truckEv?.t ?? 0) + (truckEv?.d ?? 0) - 1.2 ? (
          <g>
            <Tito pose={titoPose} t={t} />
            {scene === 1 && !(talking === 'P' || talking === 'T') ? null : null}
            {scene === 1 ? (
              <g transform="translate(1500 330)" opacity={talking === 'P' || scene === 1 ? 1 : 0}>
                <circle r={170} fill="#FDE68A" stroke="#F59E0B" strokeWidth={10} />
                <clipPath id="kids-bubble"><circle r={160} /></clipPath>
                <g clipPath="url(#kids-bubble)">
                  <rect x={-170} y={-170} width={340} height={340} fill="#A7F3D0" />
                  <Pepito pose={stand({ x: 0, y: 170, scale: 0.9, ...faceAt(f, [[0, open('P')]]), armL: { a: 100, b: 60 }, armR: { a: 100, b: 60 } })} t={t} />
                </g>
              </g>
            ) : (
              <Pepito pose={pepPose} t={t} />
            )}
            {scene >= 3 ? <Samuel pose={samPose} t={t} /> : null}
          </g>
        ) : null}
        {/* the narrator */}
        {talking === 'N' ? (
          <g transform="translate(960 150)">
            <rect x={-250} y={-48} width={500} height={96} rx={48} fill="#FEF3C7" stroke="#B45309" strokeWidth={8} />
            <text textAnchor="middle" y={22} fontFamily="Therac Heavy" fontWeight={900} fontSize={60} fill="#B45309">NARRADOR</text>
          </g>
        ) : null}
        {/* the stations */}
        {signKey && sign ? (
          <g transform={`translate(960 ${lerp(-300, 330, sm((t - sign.t) / 0.5))})`}>
            <rect x={-18} y={0} width={36} height={420} fill="#92400E" />
            <rect x={-520} y={-120} width={1040} height={190} rx={30} fill="#FACC15" stroke="#7C2D12" strokeWidth={10} />
            <text textAnchor="middle" y={22} fontFamily="Therac Heavy" fontWeight={900} fontSize={signKey === 'sign2' ? 84 : 110} fill="#7C2D12">{SIGNS[signKey]}</text>
          </g>
        ) : null}
        <Bible k={bibK} />
        {inPause ? (
          <g transform="translate(960 300)">
            <circle r={110} fill="#FFFFFF" stroke="#F59E0B" strokeWidth={10} />
            <text textAnchor="middle" y={28} fontFamily="Therac Heavy" fontWeight={900} fontSize={100} fill="#F59E0B">{Math.max(1, Math.ceil(pause.t + pause.d - t))}</text>
          </g>
        ) : null}
        <Banner text="¡MISIÓN CUMPLIDA!" k={winK} />
        {scene === 6 && winK > 0
          ? Array.from({ length: 50 }, (_, i) => (
              <rect key={i} x={((i * 97) % 1920)} y={(((i * 61) % 400) + (t - (win?.t ?? 0)) * 140) % 1080} width={14} height={24} rx={3} fill={['#EF4444', '#FACC15', '#3B82F6', '#22C55E', '#A855F7'][i % 5]} transform={`rotate(${(t * 90 + i * 40) % 360} ${(i * 97) % 1920} 0)`} />
            ))
          : null}
      </svg>
    </AbsoluteFill>
  );
};
