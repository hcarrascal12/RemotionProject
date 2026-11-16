import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../components/fonts';
import timelineJson from './timeline.json';
import { LOOKS, basePose, Pose, BEDROOM, stand } from '../engine';
import { CineCamera } from '../components/CineCamera';
import { CharacterRig } from '../components/CharacterRig';
import { HARD, HEAVY, lin, ShotProps, springAt } from '../components/motion';
import { AlertOverlay, camera, Finish, FxEvent } from '../components/Fx';
import { KineticCaptions, SubChunk } from '../components/DynamicSubtitles';
import { C4, clamp, num, OutText, PhoneBody } from '../components/fallo04/parts';
import { CU, CurioPill, Day, NoSeal, Over, Pop } from '../curio01/Curio01Board';

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
    <ellipse cx={ME.x + 260} cy={FLOOR - 470} rx={90} ry={30} fill="#FFFFFF" opacity={0.9} />
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
  const pose: Pose = { ...basePose, x: ME.x, y: ME.y, scale: ME.scale, yaw: 0.3, look: 0.4, headTilt: 4, armR: { a: 28, b: 8 }, armL: { a: 40, b: 30 }, expr: close ? (t > pala ? 'oops' : 'neutral') : 'smug' };
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
          </g>
        )}
      </Over>
    </AbsoluteFill>
  );
};

/** 2. Underground: she was after copper, the spade comes down, and it was not copper: fibre optic. The light stops. */
const H2: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const cobre = num(mark('cobre'), 0.2);
  const corto = num(mark('corto'), 1.4);
  const fibra = num(mark('fibra'), 2.4);
  const down = clamp((t - corto + 0.3) / 0.3);
  const cut = t >= corto ? 1 : 0;
  const spark = t >= corto ? Math.max(0, 1 - (t - corto) / 0.5) : 0;
  return (
    <AbsoluteFill>
      <Day t={t} />
      <Over>
        <CurioPill />
        <Underground t={t} y0={560} h={760} cut={cut} spark={spark} />
        {/* the spade comes down from the top */}
        <g transform={`translate(540 ${300 + 520 * down})`}>
          <rect x={-14} y={-420} width={28} height={420} rx={14} fill="#B07A58" stroke="#3B2A20" strokeWidth={5} />
          <path d="M -70 0 L 70 0 L 56 140 Q 0 180 -56 140 Z" fill="#9CA3AF" stroke="#374151" strokeWidth={6} />
        </g>
        <Pop f={f} fps={fps} at={cobre - 0.1} x={240} y={420} rot={-6}>
          <circle r={60} fill="#D97706" stroke={CU.ink} strokeWidth={6} />
          <text y={16} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={44} fill="#FFF7ED">
            Cu
          </text>
          <text x={110} y={-40} fontFamily={HEAVY} fontWeight={900} fontSize={46} fill={CU.ink}>
            ¿COBRE?
          </text>
        </Pop>
        <Pop f={f} fps={fps} at={fibra - 0.1} x={760} y={1120} rot={5}>
          <rect x={-240} y={-50} width={480} height={100} rx={22} fill={CU.coral} stroke={CU.ink} strokeWidth={5} />
          <text y={16} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={44} fill="#FFF">
            NO: FIBRA ÓPTICA
          </text>
        </Pop>
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

const H3: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const desco = num(mark('desco'), 1.2);
  const horas = num(mark('horas'), desco + 1.2);
  const spots = Array.from({ length: 24 }, (_, i) => ({ x: 280 + (i % 6) * 104 + ((i * 37) % 30) - 15, y: 700 + Math.floor(i / 6) * 100 + ((i * 53) % 30) - 15, at: desco - 0.4 + ((i * 7) % 24) * 0.035 }));
  const spin = Math.max(0, t - horas + 0.3) * 720; // the clock's hand runs: "for hours" (the sources disagree on how many)
  return (
    <AbsoluteFill>
      <Day t={t} />
      <Over>
        <CurioPill />
        <Pop f={f} fps={fps} at={0.05} x={540} y={330}>
          <OutText x={0} y={0} size={96} fill={CU.sun} text="ARMENIA" stroke={14} />
        </Pop>
        <text x={540} y={420} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={42} fill={CU.ink}>
          28 DE MARZO DE 2011
        </text>
        <path d="M 200 640 Q 330 560 520 600 Q 700 560 880 640 Q 930 800 860 960 Q 760 1120 560 1100 Q 330 1110 220 980 Q 150 820 200 640 Z" fill={t >= desco ? '#E2E8F0' : '#CCFBF1'} stroke={CU.ink} strokeWidth={6} />
        {spots.map((p, i) => (
          <Wifi key={i} x={p.x} y={p.y} on={t < p.at} />
        ))}
        {t > horas - 0.3 ? (
          <Pop f={f} fps={fps} at={horas - 0.3} x={540} y={1200}>
            <rect x={-250} y={-46} width={500} height={92} rx={46} fill={CU.card} stroke={CU.coral} strokeWidth={6} />
            <circle cx={-190} cy={0} r={28} fill="#FFF" stroke={CU.ink} strokeWidth={5} />
            <line x1={-190} y1={0} x2={-190} y2={-20} stroke={CU.ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${spin} -190 0)`} />
            <text x={40} y={16} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={46} fill={CU.ink}>
              DURANTE HORAS
            </text>
          </Pop>
        ) : null}
      </Over>
    </AbsoluteFill>
  );
};

/** 4. The hand-over: a whole country without internet… and the dark door of the Fallos rises on Fallo #04. */
const H4: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const fallo = num(mark('fallo'), 1.6);
  const door = springAt(f, fps, Math.max(0.5, fallo - 0.6), { stiffness: 140, damping: 18, mass: 0.8 });
  const doorY = 1920 - 1240 * Math.min(1, door);
  const tap = t > fallo + 0.6;
  return (
    <AbsoluteFill>
      <Day t={t} />
      <Over>
        <CurioPill />
        <Pop f={f} fps={fps} at={0.05} x={540} y={330}>
          <OutText x={0} y={0} size={78} fill={CU.ink} text="UN PAÍS ENTERO" stroke={0} />
        </Pop>
        <Pop f={f} fps={fps} at={0.3} x={540} y={430}>
          <OutText x={0} y={0} size={78} fill={CU.coral} text="SIN INTERNET…" stroke={12} />
        </Pop>
        <g transform={`translate(0 ${doorY})`}>
          <rect x={40} y={0} width={1000} height={1300} rx={60} fill="#050A14" stroke={C4.red} strokeWidth={10} />
          <NoSeal x={210} y={120} s={0.42} />
          <OutText x={630} y={150} size={80} fill="#FF2A2A" text="NO PRESIONES" stroke={12} />
          <OutText x={540} y={330} size={130} fill="#FACC15" text="FALLO #04" stroke={16} />
          <PhoneBody x={540} y={640} s={0.36} glow={0.4}>
            <text x={0} y={-60} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={70} fill="#F8FAFC">
              Ya llegué
            </text>
            <text x={0} y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={54} fill="#FCA5A5">
              No se pudo enviar
            </text>
          </PhoneBody>
          <g transform={`translate(540 940) scale(${tap ? 0.94 : 1 + 0.04 * Math.sin(t * 7)})`}>
            <rect x={-330} y={-58} width={660} height={116} rx={58} fill={tap ? '#FFFFFF' : '#FACC15'} stroke="#000" strokeWidth={8} />
            <text y={20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill="#000">
              VER EL FALLO #04 ▶
            </text>
          </g>
        </g>
      </Over>
    </AbsoluteFill>
  );
};

const SHOTS: Record<string, React.FC<ShotProps>> = { h1: H1, h2: H2, h3: H3, h4: H4 };

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
  const cam0 = camera(t, f, fps, shot.start, shot.end, T.fx, 0, idx, 0.6);
  const w = last ? lin(t, T.duration - 0.32, T.duration - 1 / fps) : 0;
  const lt = t - shot.start;
  const kb = idx === 0 ? 0 : Math.min(1, lt / Math.max(0.5, shot.end - shot.start)) * (1 - w);
  const side = idx % 2 ? 1 : -1;
  const swipe = idx > 0 ? Math.exp(-lt / 0.07) : 0;
  const cam = { x: cam0.x * (1 - w) + side * 22 * kb + side * 260 * swipe, y: cam0.y * (1 - w) - 12 * kb, scale: (1 + (cam0.scale - 1) * (1 - w)) * (1 + 0.05 * kb), rot: cam0.rot * (1 - w) };
  return (
    <AbsoluteFill style={{ background: CU.cream }}>
      <Audio src={staticFile('sabias01/mix.wav')} />
      <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale}) rotate(${cam.rot}deg)`, filter: swipe > 0.03 ? `blur(${(12 * swipe).toFixed(1)}px)` : undefined }}>
        <View {...props} />
      </AbsoluteFill>
      {w > 0 ? (
        <AbsoluteFill style={{ opacity: w }}>
          <H1 t={0} f={0} fps={fps} dur={2} mark={() => Number.NaN} />
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
  const list: [React.FC<ShotProps>, string | undefined, number, Record<string, number>][] = [
    [H1, undefined, 0, {}],
    [H1, 'pala', 1.2, { pala: 0.6 }],
    [H2, undefined, 3, { cobre: 0.2, corto: 1.2, fibra: 2 }],
    [H3, undefined, 3, { desco: 0.6, horas: 1.6 }],
    [H4, undefined, 3, { fallo: 1.0 }],
  ];
  const [Shot, variant, t, m] = list[Math.min(list.length - 1, f)];
  return (
    <AbsoluteFill style={{ background: CU.cream }}>
      <Shot t={t} f={Math.round(t * 30)} fps={30} dur={8} variant={variant} mark={(n) => m[n] ?? Number.NaN} />
    </AbsoluteFill>
  );
};
