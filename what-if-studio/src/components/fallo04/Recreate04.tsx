import React from 'react';
import { AbsoluteFill } from 'remotion';
import { LOOKS, basePose, Pose, Study, Desk, faceAt, LaptopBack, Terminal, TERMINAL, Kitchen, KITCHEN, KitchenIsland, Bedroom, BEDROOM, Rooftop, ControlRoom, ConsoleDesk, CTRL, stand, Glow } from '../../engine';
import { CineCamera, edgeFg, ef } from '../CineCamera';
import { CharacterRig } from '../CharacterRig';
import { HARD, HEAVY, rand, ShotProps, springAt } from '../motion';
import { Stamp } from '../fallo02/parts';
import { AppGlyph, Bubble, C4, clamp, num, OutText, PendingClock, PhoneBody, sm } from './parts';
import { DeadChat } from './HookScene';

// Fallo #04 as a STORY, in the What If style: every line of the voice is a scene with people in a real place.
//   Pip lands in the bus terminal and cannot tell his mum; mum waits in the kitchen; Mo's shop takes no orders; Pip's sister
//   cannot reach the family; Pip on the rooftop holding his phone up to the sky; not a hacker; not your wifi; at the company,
//   an engineer presses ENTER on a routine command and the three apps go dark on the wall; the buildings lose their streets;
//   mum searches and nothing is found; the engineers cannot even get in; and the message finally arrives.
// Variants (the shot's `variant` in plan.json): arrive, mom, shop, family, roof, hacker, router, office, control, search, door,
// reunion. The graphics only ever sit on top of the scene.

const PIP = LOOKS.pip;
const HOOD = LOOKS.pipHood;
const MO = LOOKS.mo;
const SIS = LOOKS.sis;
const MOM = LOOKS.mom;
const SUIT = LOOKS.suit;

const deskPose = (o: Partial<Pose> = {}): Pose => ({ ...basePose, x: 960, y: 712, scale: 1, yaw: 0.1, armL: { a: 30, b: 20 }, armR: { a: 30, b: 20 }, ...o });

/** The overlay layer: screen space, 1080 x 1920. */
const Over: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    {children}
  </svg>
);

/** A chat bubble floating over the scene, like a phone's screen in close-up. */
const FloatBubble: React.FC<{ x: number; y: number; k: number; text: string; from?: string; t: number; fail?: boolean; ok?: number; side?: 'in' | 'out'; w?: number }> = ({ x, y, k, text, from, t, fail = false, ok = 0, side = 'out', w = 560 }) => (
  <g transform={`translate(0 ${30 * (1 - Math.min(1, k))})`} opacity={Math.min(1, k * 1.6)}>
    <Bubble x={x} y={y} w={w} h={from ? 150 : 120} side={side} fill={ok > 0.5 ? '#14532D' : C4.bubble} stroke={ok > 0.5 ? C4.wa : '#475569'} strokeW={6}>
      {from ? (
        <text x={-w / 2 + 34} y={-26} fontFamily={HEAVY} fontWeight={900} fontSize={30} fill="#FDE68A">
          {from}
        </text>
      ) : null}
      <text x={-w / 2 + 34} y={from ? 30 : 16} fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#F8FAFC">
        {text}
      </text>
      {ok > 0 ? (
        <g transform={`translate(${w / 2 - 60} ${from ? 40 : 30})`} fill="none" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M -26 0 L -16 10 L 4 -12" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, ok * 2)} />
          <path d="M -8 0 L 2 10 L 22 -12" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, Math.min(1, ok * 2 - 1))} />
        </g>
      ) : (
        <PendingClock x={w / 2 - 50} y={from ? 40 : 30} r={18} t={t} color={fail ? C4.red : '#94A3B8'} />
      )}
    </Bubble>
  </g>
);

export const Recreate04: React.FC<ShotProps> = (props) => {
  const { t, f, fps, dur, variant, mark } = props;
  const e = ef(t);
  const p = clamp(t / Math.max(0.01, dur));

  // ----- Pip lands at the bus terminal: frame 0 of the film -----
  if (variant === 'arrive' || variant === 'panic') {
    const panic = variant === 'panic';
    const horas = num(mark('horas'), 0.3);
    const hit = t > horas ? Math.exp(-(t - horas) / 0.25) : 0;
    const amp = 9 * Math.exp(-t / 0.5) + 2 + 8 * hit;
    const sx = (rand(f * 2 + 1) - 0.5) * 2 * amp;
    const sy = (rand(f * 2 + 2) - 0.5) * 2 * amp;
    const me = stand(TERMINAL, 0.42, 0.42);
    const pose: Pose = { ...basePose, x: me.x, y: me.y, scale: me.scale, yaw: 0.35, look: 0.7, headTilt: 9, armR: { a: 64, b: 70 }, armL: panic ? { a: 120, b: 60 } : { a: 14, b: 8 }, ...faceAt(e, [[0, panic ? 'shock' : 'worried']]) };
    return (
      <AbsoluteFill>
        <div style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)` }}>
          <CineCamera cx={me.x + 40} cy={me.y - 230} zoom={2.15 + 0.05 * p} tint="blue" vignette={0.75} light={{ x: me.x + 80, y: me.y - 60, r: 260, color: '#38BDF8', o: 0.45 }} fg={edgeFg(me.x + 40, me.y - 230, 2.15)}>
            <Terminal t={e + 300} id="t4a" cancelled={0} />
            {/* the suitcase */}
            <g transform={`translate(${me.x - 120 * me.scale} ${me.y + 230 * me.scale})`}>
              <rect x={-36 * me.scale} y={-110 * me.scale} width={72 * me.scale} height={110 * me.scale} rx={10} fill="#2F6E69" stroke="#000" strokeWidth={3} />
              <rect x={-6 * me.scale} y={-150 * me.scale} width={12 * me.scale} height={42 * me.scale} fill="#2A2A30" />
            </g>
            <CharacterRig look={PIP} pose={pose} t={t} rim="blue" seed={4} />
          </CineCamera>
          {/* his phone, over the shoulder: the chat that does not move */}
          <Over>
            <PhoneBody x={760} y={1110} s={0.5} rot={9 + 0.6 * Math.sin(t * 1.5)} glow={panic ? 0.35 : 0.18}>
              {panic ? (
                <g>
                  <rect x={-262} y={-482} width={524} height={964} rx={56} fill={C4.red} opacity={0.22 + 0.12 * Math.sin(t * 10)} />
                  <Bubble x={40} y={-60} w={420} h={130} side="out" fill={C4.bubble}>
                    <text x={-170} y={16} fontFamily={HEAVY} fontWeight={900} fontSize={54} fill="#F8FAFC">
                      Ya llegué
                    </text>
                  </Bubble>
                  <g transform="translate(-205 -60)">
                    <circle r={34} fill={C4.red} />
                    <text y={18} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={50} fill="#FFF">
                      !
                    </text>
                  </g>
                  <text x={0} y={110} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#FCA5A5">
                    No se pudo enviar
                  </text>
                </g>
              ) : (
                <DeadChat t={t} />
              )}
            </PhoneBody>
          </Over>
        </div>
        <Over>
          {panic ? (
            <g transform={`translate(${540 + sx * 0.5} ${400 + sy * 0.5}) scale(${1 + 0.06 * hit})`}>
              <OutText x={0} y={0} size={78} fill="#FFFFFF" text="NADIE PUDO ESCRIBIR" stroke={12} />
              <OutText x={0} y={118} size={128} fill={C4.yellow} text="“YA LLEGUÉ”" stroke={15} />
            </g>
          ) : (
            <g transform={`translate(${540 + sx * 0.5} ${450 + sy * 0.5}) scale(${1 + 0.1 * hit})`}>
              <OutText x={0} y={0} size={178} fill={C4.yellow} text="6 HORAS" stroke={18} />
            </g>
          )}
          {(panic ? [] : (['wa', 'ig', 'fb'] as const)).map((k, i) => (
            <g key={k} transform={`translate(${330 + i * 210 + sx * 0.5} ${572 + sy * 0.5}) scale(${1 + 0.05 * Math.sin(t * 6 + i)})`}>
              <AppGlyph kind={k} x={0} y={0} r={48} on={0} />
              <line x1={-52} y1={52} x2={52} y2={-52} stroke="#000" strokeWidth={20} strokeLinecap="round" />
              <line x1={-52} y1={52} x2={52} y2={-52} stroke={C4.red} strokeWidth={12} strokeLinecap="round" />
            </g>
          ))}
        </Over>
      </AbsoluteFill>
    );
  }

  // ----- mum in the kitchen, waiting; or searching for them (search) -----
  if (variant === 'mom' || variant === 'search' || variant === 'reunion') {
    const me = stand(KITCHEN, 0.5, 0.42);
    const happy = variant === 'reunion';
    const pose: Pose = { ...basePose, x: me.x, y: me.y, scale: me.scale, yaw: 0.2, look: 0.5, headTilt: happy ? -4 : 8 + 2 * Math.sin(t * 1.2), armR: { a: 60, b: 74 }, armL: happy ? { a: 120, b: 40 } : { a: 22, b: 18 }, ...faceAt(e, [[0, happy ? 'happy' : 'worried']]) };
    const k = springAt(f, fps, 0.15, HARD);
    const enc = num(mark('encontrara'), 1.4);
    const nf = variant === 'search' ? springAt(f, fps, enc - 0.1, HARD) : 0;
    const typed = 'whatsapp.com';
    const n = Math.floor(clamp((t - 0.1) / 0.6) * typed.length);
    return (
      <AbsoluteFill>
        <CineCamera cx={me.x + 30} cy={me.y - 70} zoom={2.25 + 0.08 * p} tint={happy ? 'amber' : 'blue'} vignette={0.7} light={{ x: me.x + 60, y: me.y - 40, r: 300, color: happy ? '#FDE68A' : '#38BDF8', o: 0.4 }} fg={edgeFg(me.x + 30, me.y - 70, 2.25)}>
          <Kitchen t={e + 120} id="k4" veil={0.55} />
          <CharacterRig look={MOM} pose={pose} t={t} rim={happy ? 'amber' : 'blue'} seed={6} />
          <KitchenIsland stools={false} />
        </CineCamera>
        <Over>
          {variant === 'mom' ? <FloatBubble x={540} y={540} k={k} from="Mamá" text="¿Ya llegaste?" t={t} fail /> : null}
          {variant === 'search' ? (
            <g>
              <g transform="translate(540 430)">
                <rect x={-440} y={-60} width={880} height={120} rx={60} fill="#F8FAFC" stroke="#0B0B0B" strokeWidth={6} />
                <circle cx={-370} cy={-6} r={22} fill="none" stroke="#64748B" strokeWidth={7} />
                <line x1={-354} y1={10} x2={-336} y2={28} stroke="#64748B" strokeWidth={7} strokeLinecap="round" />
                <text x={-310} y={16} fontFamily={HEAVY} fontWeight={800} fontSize={46} fill="#0B1220">
                  {typed.slice(0, n)}
                  {Math.floor(t * 3) % 2 === 0 ? '|' : ''}
                </text>
              </g>
              {nf > 0.01 ? (
                <g transform={`translate(540 ${640 + 20 * (1 - Math.min(1, nf))}) scale(${0.7 + 0.3 * Math.min(1.08, nf)})`} opacity={Math.min(1, nf * 1.6)}>
                  <rect x={-330} y={-60} width={660} height={120} rx={26} fill="#1A0306" stroke={C4.red} strokeWidth={7} />
                  <text y={20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={60} fill="#FCA5A5">
                    NO SE ENCUENTRA
                  </text>
                </g>
              ) : null}
            </g>
          ) : null}
        </Over>
      </AbsoluteFill>
    );
  }

  // ----- Mo's shop: PEDIDOS POR WHATSAPP, and nothing comes in -----
  if (variant === 'shop') {
    const me = stand(KITCHEN, 0.63, 0.42);
    const pose: Pose = { ...basePose, x: me.x, y: me.y, scale: me.scale, yaw: -0.25, look: -0.5, headTilt: -6 + 2 * Math.sin(t * 2), armR: { a: 30, b: 60 }, armL: { a: 30, b: 60 }, ...faceAt(e, [[0, 'worried']]) };
    const k = springAt(f, fps, 0.05, HARD);
    const sign = KITCHEN.P(0.44, 0.3, 0.02);
    return (
      <AbsoluteFill>
        <CineCamera cx={me.x - 120} cy={me.y - 80} zoom={2.0 + 0.08 * p} tint="amber" vignette={0.7} fg={edgeFg(me.x - 120, me.y - 80, 2.0)}>
          <Kitchen t={e + 40} id="s4" veil={0.4} />
          {/* the shop's sign on the back wall */}
          <g transform={`translate(${sign.x} ${sign.y}) rotate(-3)`}>
            <rect x={-150} y={-56} width={300} height={112} rx={12} fill="#F8FAFC" stroke="#0B0B0B" strokeWidth={5} />
            <text y={-12} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill="#0B1220">
              PEDIDOS POR
            </text>
            <text x={22} y={36} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill={C4.wa}>
              WHATSAPP
            </text>
            <g transform="translate(-104 24)">
              <AppGlyph kind="wa" x={0} y={0} r={20} on={1} />
            </g>
          </g>
          <CharacterRig look={MO} pose={pose} t={t} rim="amber" seed={7} />
          <KitchenIsland stools={false} />
        </CineCamera>
        <Over>
          <g transform={`translate(540 ${1170}) scale(${0.7 + 0.3 * Math.min(1.08, k)})`} opacity={Math.min(1, k * 1.6)}>
            <rect x={-250} y={-70} width={500} height={140} rx={30} fill="#0B1220" stroke={C4.red} strokeWidth={6} />
            <text x={-170} y={22} fontFamily={HEAVY} fontWeight={900} fontSize={54} fill="#E2E8F0">
              PEDIDOS:
            </text>
            <text x={170} y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={100} fill={C4.red} opacity={0.75 + 0.25 * Math.sin(t * 6)}>
              0
            </text>
          </g>
        </Over>
      </AbsoluteFill>
    );
  }

  // ----- the sister in her room, the family group stuck -----
  if (variant === 'family') {
    const me = stand(BEDROOM, 0.62, 0.5);
    const pose: Pose = { ...basePose, x: me.x, y: me.y, scale: me.scale * 0.8, yaw: -0.2, look: -0.4, headTilt: 10, armR: { a: 60, b: 74 }, armL: { a: 60, b: 74 }, ...faceAt(e, [[0, 'worried']]) };
    const msgs = [
      { from: 'Abuela', text: '¿Están bien?' },
      { from: 'Papá', text: 'Contesten' },
    ];
    return (
      <AbsoluteFill>
        <CineCamera cx={me.x - 20} cy={me.y - 210} zoom={2.0 + 0.08 * p} tint="blue" vignette={0.75} light={{ x: me.x, y: me.y - 60, r: 240, color: '#38BDF8', o: 0.5 }} fg={edgeFg(me.x - 20, me.y - 210, 2.0)}>
          <Bedroom t={e + 80} id="b4" clock="16:05" />
          <CharacterRig look={SIS} pose={pose} t={t} rim="blue" seed={9} />
        </CineCamera>
        <Over>
          <g transform="translate(540 470)">
            <rect x={-300} y={-44} width={600} height={88} rx={44} fill="#0B1220" stroke="#334155" strokeWidth={5} />
            <text x={-250} y={15} fontFamily={HEAVY} fontWeight={900} fontSize={40} fill="#F8FAFC">
              Familia
            </text>
            <text x={250} y={13} textAnchor="end" fontFamily={HEAVY} fontWeight={700} fontSize={28} fill={C4.red}>
              sin conexión
            </text>
          </g>
          {msgs.map((m, i) => (
            <FloatBubble key={m.from} x={i ? 600 : 470} y={630 + i * 190} k={springAt(f, fps, 0.05 + i * 0.15, HARD)} from={m.from} text={m.text} t={t + i} fail side={i ? 'out' : 'in'} w={500} />
          ))}
        </Over>
      </AbsoluteFill>
    );
  }

  // ----- Pip on the rooftop, phone up to the sky; the whole city in silence -----
  if (variant === 'roof') {
    const silencio = num(mark('silencio'), 1.0);
    const quiet = clamp((t - silencio + 0.2) / 0.6);
    const pose: Pose = { ...basePose, x: 960, y: 650, scale: 0.95, yaw: 0.1, look: 0.2, headTilt: -14, armR: { a: 168, b: 6 }, armL: { a: 14, b: 8 }, ...faceAt(e, [[0, 'worried']]) };
    return (
      <AbsoluteFill>
        <CineCamera cx={960} cy={520 - 30 * p} zoom={1.6 + 0.12 * p} tint="amber" vignette={0.7}>
          <Rooftop t={e + 500} sunX={1300} sunY={720} cityLit={1 - 0.7 * quiet} blackout={0.25 * quiet} />
          <CharacterRig look={PIP} pose={pose} t={t} rim="amber" seed={10} />
        </CineCamera>
        <Over>
          {quiet > 0.05 ? <OutText x={540} y={430} size={44} fill="#E2E8F0" text="SIN SEÑAL" mono opacity={quiet} /> : null}
        </Over>
      </AbsoluteFill>
    );
  }

  // ----- the hooded hacker everybody imagines, crossed out -----
  if (variant === 'hacker') {
    const hackeo = num(mark('hackeo'), 0.6);
    const x = springAt(f, fps, hackeo - 0.05, HARD);
    const pose = deskPose({ headTilt: 4, armL: { a: 38, b: 34 }, armR: { a: 38, b: 34 }, ...faceAt(e, [[0, 'smug']]) });
    return (
      <AbsoluteFill>
        <CineCamera cx={900} cy={560} zoom={2.1} tint="red" vignette={0.75} light={{ x: 990, y: 600, r: 380, color: C4.red, o: 0.45 }} fg={edgeFg(900, 560, 2.1)}>
          <Study t={e + 200} id="h4" night />
          <CharacterRig look={HOOD} pose={pose} t={t} rim="red" seed={5} />
          <Desk x0={520} x1={1360} y={700} laptop={false} />
          <LaptopBack x={1060} y={700} w={250} glow={0.9 + 0.1 * Math.sin(t * 9)} />
        </CineCamera>
        <Over>
          {x > 0.01 ? (
            <g transform={`translate(540 880) rotate(${-14 * (1 - Math.min(1, x))}) scale(${3 - 2 * x})`} opacity={Math.min(1, x * 1.5)}>
              <line x1={-360} y1={-300} x2={360} y2={400} stroke="#000" strokeWidth={56} strokeLinecap="round" />
              <line x1={360} y1={-300} x2={-360} y2={400} stroke="#000" strokeWidth={56} strokeLinecap="round" />
              <line x1={-360} y1={-300} x2={360} y2={400} stroke={C4.red} strokeWidth={36} strokeLinecap="round" />
              <line x1={360} y1={-300} x2={-360} y2={400} stroke={C4.red} strokeWidth={36} strokeLinecap="round" />
            </g>
          ) : null}
        </Over>
      </AbsoluteFill>
    );
  }

  // ----- Pip checks his router: it is fine -----
  if (variant === 'router') {
    const ok = springAt(f, fps, 0.15, HARD);
    const pose = deskPose({ x: 860, yaw: 0.3, look: 0.6, armR: { a: 58 + 6 * Math.sin(t * 8), b: 14 }, handR: 'point', headTilt: 6, ...faceAt(e, [[0, 'oops']]) });
    return (
      <AbsoluteFill>
        <CineCamera cx={960} cy={570} zoom={2.15} tint="green" vignette={0.7} light={{ x: 1110, y: 640, r: 260, color: '#4ADE80', o: 0.4 }} fg={edgeFg(960, 570, 2.15)}>
          <Study t={e + 200} id="r4" night />
          <CharacterRig look={PIP} pose={pose} t={t} rim="blue" seed={5} />
          <Desk x0={520} x1={1360} y={700} laptop={false} />
          {/* the router on the desk */}
          <g transform="translate(1110 690)">
            <rect x={-80} y={-34} width={160} height={40} rx={10} fill="#1E293B" stroke="#000" strokeWidth={3} />
            {[0, 1, 2, 3].map((i) => (
              <circle key={i} cx={-48 + i * 32} cy={-14} r={6} fill={Math.floor(t * 10 + i * 2) % 3 === 0 ? '#14532D' : '#4ADE80'} />
            ))}
            <line x1={-56} y1={-34} x2={-70} y2={-90} stroke="#334155" strokeWidth={6} strokeLinecap="round" />
            <line x1={56} y1={-34} x2={70} y2={-90} stroke="#334155" strokeWidth={6} strokeLinecap="round" />
          </g>
        </CineCamera>
        <Over>
          <g transform={`translate(540 540) scale(${0.6 + 0.4 * Math.min(1.1, ok)})`} opacity={Math.min(1, ok * 1.6)}>
            <rect x={-260} y={-56} width={520} height={112} rx={56} fill="#052E16" stroke="#4ADE80" strokeWidth={7} />
            <path d="M -200 0 L -176 24 L -136 -22" stroke="#4ADE80" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <text x={36} y={19} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={54} fill="#4ADE80">
              TU WIFI: OK
            </text>
          </g>
        </Over>
      </AbsoluteFill>
    );
  }

  // ----- the engineer presses ENTER on a routine command -----
  if (variant === 'office') {
    const comando = num(mark('comando'), 0.6);
    const press = t >= comando - 0.1 ? Math.max(0, 1 - Math.max(0, t - comando) / 0.3) : 0;
    const k = springAt(f, fps, 0.1, HARD);
    const pose = deskPose({ yaw: 0.1, armR: { a: 40 + 40 * press, b: 24 }, handR: 'point', headTilt: -2, ...faceAt(e, [[0, 'neutral']]) });
    return (
      <AbsoluteFill>
        <CineCamera cx={1060} cy={590} zoom={2.1 + 0.1 * p} tint="amber" vignette={0.65} light={{ x: 1165, y: 680, r: 240, color: '#FDE68A', o: 0.45 }} fg={edgeFg(1060, 590, 2.1)}>
          <Study t={e + 200} id="o4" />
          <CharacterRig look={SUIT} pose={pose} t={t} rim="amber" seed={11} />
          <Desk x0={520} x1={1360} y={700} laptop={false} />
          <g>
            <rect x={1090} y={684 + 6 * press} width={150} height={30} rx={8} fill="#78350F" />
            <rect x={1090} y={666 + 8 * press} width={150} height={34} rx={8} fill={press > 0.1 ? '#FDE68A' : '#E2E8F0'} stroke="#000" strokeWidth={3} />
            <text x={1165} y={691 + 8 * press} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={24} fill="#0B1220">
              ENTER
            </text>
          </g>
        </CineCamera>
        <Over>
          <Stamp k={k} x={540} y={420} label="UN COMANDO DE RUTINA" color={C4.yellow} w={900} size={78} rot={-3} />
        </Over>
      </AbsoluteFill>
    );
  }

  // ----- the control room: the three apps go dark on the wall, one after the other -----
  if (variant === 'control') {
    const apago = num(mark('apago'), 0.15);
    const tres = num(mark('tres'), 0.7);
    const offAt = [apago + 0.12, apago + 0.28, Math.max(apago + 0.44, tres - 0.05)];
    const me = stand(CTRL, 0.6, 0.8, 0.62);
    const pose: Pose = { ...basePose, x: me.x, y: me.y, scale: me.scale, yaw: -0.5, look: -0.8, headTilt: -8, armL: { a: 30, b: 20 }, armR: { a: 30, b: 20 }, ...faceAt(e, [[0, 'neutral'], [Math.round((apago + 0.1) * 30), 'shock']]) };
    const screens = [CTRL.P(0.25, 0.32, 0), CTRL.P(0.5, 0.32, 0), CTRL.P(0.75, 0.32, 0)];
    return (
      <AbsoluteFill>
        <CineCamera cx={960} cy={500} zoom={1.75 + 0.1 * p} tint="red" vignette={0.75} fg={edgeFg(960, 500, 1.75)}>
          <ControlRoom t={e + 200} id="c4" alarm={t >= apago} />
          {screens.map((s, i) => {
            const dead = t >= offAt[i];
            const hit = dead ? Math.exp(-(t - offAt[i]) / 0.15) : 0;
            return (
              <g key={i} transform={`translate(${s.x} ${s.y})`}>
                <rect x={-120} y={-80} width={240} height={160} rx={12} fill={dead ? '#05070C' : '#0B1220'} stroke={dead ? '#334155' : '#94A3B8'} strokeWidth={6} />
                <AppGlyph kind={(['wa', 'ig', 'fb'] as const)[i]} x={0} y={0} r={52} on={dead ? 0 : 1} />
                {hit > 0.05 ? <rect x={-120} y={-80} width={240} height={160} rx={12} fill="#FFFFFF" opacity={0.6 * hit} /> : null}
              </g>
            );
          })}
          <ConsoleDesk t={e} screen={t >= apago ? '#EF4444' : '#39FF88'} />
          <CharacterRig look={SUIT} pose={pose} t={t} rim="red" seed={12} />
        </CineCamera>
      </AbsoluteFill>
    );
  }

  // ----- Pip, Mo and the sister on the rooftop, phones in hand: the messages arrive at last -----
  if (variant === 'friends') {
    const cast = [
      { look: MO, x: 760, s: 0.86, a: 0.3, seed: 21 },
      { look: PIP, x: 960, s: 0.95, a: 0, seed: 22 },
      { look: SIS, x: 1150, s: 0.7, a: -0.3, seed: 23 },
    ];
    return (
      <AbsoluteFill>
        <CineCamera cx={960} cy={500} zoom={1.7 + 0.08 * p} tint="amber" vignette={0.65}>
          <Rooftop t={e + 600} sunX={1320} sunY={700} cityLit={1} />
          {cast.map((c, i) => (
            <CharacterRig key={i} look={c.look} pose={{ ...basePose, x: c.x, y: 690 - (1 - c.s) * 140, scale: c.s, yaw: c.a, look: 0.2, headTilt: 6 + 2 * Math.sin(t * 2 + i), armR: { a: 64, b: 72 }, armL: { a: 20, b: 14 }, ...faceAt(e, [[0, 'happy']]) }} t={t} rim="amber" seed={c.seed} />
          ))}
        </CineCamera>
        <Over>
          {[
            { x: 300, y: 470, d: 0.1 },
            { x: 600, y: 600, d: 0.3 },
            { x: 840, y: 470, d: 0.5 },
          ].map((b, i) => (
            <FloatBubble key={i} x={b.x} y={b.y} k={springAt(f, fps, b.d, HARD)} text="Ya llegué" t={t} ok={springAt(f, fps, b.d + 0.15, HARD)} side={i % 2 ? 'in' : 'out'} w={340} />
          ))}
        </Over>
      </AbsoluteFill>
    );
  }

  // ----- the engineers at the data centre door: the badge does not work -----
  // (door: drawn by DoorScene with the man in the suit, see StoryScenes)
  return null;
};

/** Mum receives the message at last (the reunion behind the question). */
export const ReunionBg: React.FC<ShotProps> = (props) => {
  const { t, f, fps, mark } = props;
  const abrir = num(mark('abrir'), 1.6);
  const ok = t >= abrir + 0.25 ? springAt(f, fps, abrir + 0.25, HARD) : 0;
  return (
    <AbsoluteFill>
      <Recreate04 {...props} variant="reunion" />
      <Over>
        <rect width={1080} height={1920} fill="#05070C" opacity={0.25 + 0.15 * (1 - ok)} />
      </Over>
    </AbsoluteFill>
  );
};

export { sm };
