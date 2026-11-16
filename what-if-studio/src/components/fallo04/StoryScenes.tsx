import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Hero, basePose, LOOKS, KitDefs, SetDefs, Pose } from '../../engine';
import { HARD, HEAVY, rand, ShotProps, springAt } from '../motion';
import { Stamp } from '../fallo02/parts';
import { AppGlyph, Bubble, C4, clamp, num, OutText, PendingClock, ServerNode, sm, Wifi } from './parts';
import { NightRoom } from './HookScene';

// The middle of Fallo #04, one component per idea:
//   offline  bubbles: the three bubbles go dark one by one, "Sin conexión" drops, NO ERA UN HACKEO lands
//            wifi:    "no fue tu internet": the home wifi at full bars, with its OK
//   command  type:    the maintenance console, the one command typing itself
//            cascade: the master switch flips OFF and the three apps die one after the other
//   audit    the audit barrier that should have stopped the command opens by itself and breaks
//   map      cut:     the three server nodes lose the lines between them, with sparks
//            gone:    the three apps vanish from the map of the internet
//   door     the engineer, the badge, ACCESO DENEGADO

const SPARKS = Array.from({ length: 10 }, (_, i) => ({ a: (i / 10) * Math.PI * 2 + rand(i + 3) * 0.5, l: 30 + rand(i + 9) * 50 }));

export const OfflineScene: React.FC<ShotProps> = ({ t, f, fps, variant, mark }) => {
  if (variant === 'wifi') {
    const ok = springAt(f, fps, 0.2, HARD);
    const bars = 1 + Math.floor((t * 6) % 3);
    return (
      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <NightRoom t={t} id="wf4" alarm={0} />
          <circle cx={540} cy={760} r={430} fill="#38BDF8" opacity={0.07} />
          <Wifi x={540} y={720} s={2.1} bars={t < 0.2 ? bars : 3} color="#E2E8F0" />
          {/* the router, lights blinking happily */}
          <g transform="translate(540 1010)">
            <rect x={-230} y={-50} width={460} height={100} rx={26} fill="#1E293B" stroke="#475569" strokeWidth={6} />
            {[0, 1, 2, 3, 4].map((i) => (
              <circle key={i} cx={-150 + i * 75} cy={0} r={11} fill={Math.floor(t * 10 + i * 2) % 3 === 0 ? '#1F2937' : '#4ADE80'} />
            ))}
            <line x1={-170} y1={-50} x2={-200} y2={-150} stroke="#475569" strokeWidth={10} strokeLinecap="round" />
            <line x1={170} y1={-50} x2={200} y2={-150} stroke="#475569" strokeWidth={10} strokeLinecap="round" />
          </g>
          <g transform={`translate(540 1180) scale(${0.6 + 0.4 * Math.min(1.1, ok)})`} opacity={Math.min(1, ok * 1.6)}>
            <rect x={-230} y={-46} width={460} height={92} rx={46} fill="#052E16" stroke="#4ADE80" strokeWidth={6} />
            <text x={30} y={16} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={42} fill="#4ADE80">
              TU WIFI: OK
            </text>
            <path d="M -186 0 L -166 20 L -134 -18" stroke="#4ADE80" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </AbsoluteFill>
    );
  }
  // bubbles: big, full-width chat; they go dark one by one
  const hackeo = num(mark('hackeo'), 0.9);
  const offAt = [0.12, 0.34, 0.56];
  const rows = [
    { x: 600, y: 640, w: 640, side: 'out' as const },
    { x: 460, y: 840, w: 560, side: 'in' as const },
    { x: 580, y: 1040, w: 680, side: 'out' as const },
  ];
  const pillK = springAt(f, fps, 0.18, HARD);
  const stampK = springAt(f, fps, hackeo - 0.05, HARD);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <NightRoom t={t} id="ob4" alarm={0.6} />
        {rows.map((r, i) => {
          const off = t >= offAt[i];
          const ft = t - offAt[i];
          const flick = off && ft < 0.25 ? [1, 0.2, 0.9, 0.1, 0.7, 0, 0.4, 0][Math.floor(ft * 30) % 8] : 0;
          return (
            <Bubble key={i} x={r.x} y={r.y + 4 * Math.sin(t * 2 + i)} w={r.w} h={140} side={r.side} fill={off ? C4.bubbleOff : C4.bubble} stroke={flick > 0.05 ? C4.red : off ? '#1F2937' : '#475569'} strokeW={6} s={off && ft < 0.2 ? 0.97 : 1}>
              {i === 2 && off ? <PendingClock x={250} y={36} r={22} t={t} color={C4.red} /> : null}
            </Bubble>
          );
        })}
        {/* Sin conexión */}
        <g transform={`translate(540 ${430 - 90 * (1 - Math.min(1, pillK))})`} opacity={Math.min(1, pillK * 1.6)}>
          <rect x={-220} y={-44} width={440} height={88} rx={44} fill="#1A0306" stroke={C4.red} strokeWidth={5} />
          <circle cx={-170} cy={0} r={13} fill={C4.red} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 6))} />
          <text x={22} y={15} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={44} fill="#FCA5A5">
            Sin conexión
          </text>
        </g>
        <Stamp k={stampK} x={540} y={1230} label="NO ERA UN HACKEO" color={C4.red} w={860} size={84} rot={-4} />
      </svg>
    </AbsoluteFill>
  );
};

const NODE_X = [250, 540, 830];

export const CommandScene: React.FC<ShotProps> = ({ t, f, fps, variant, mark }) => {
  if (variant !== 'cascade') {
    // the console: the one command typing itself
    const cmd = '$ medir_capacidad --red-troncal';
    const n = Math.floor(clamp((t - 0.15) / 0.9) * cmd.length);
    const comando = num(mark('comando'), 0.5);
    const hl = springAt(f, fps, comando, HARD);
    const run = t > 1.15;
    return (
      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <NightRoom t={t} id="cm4" alarm={0} />
          <OutText x={540} y={420} size={34} fill={C4.yellow} text="MANTENIMIENTO DE RUTINA" mono />
          <g transform={`translate(540 ${800 + 4 * Math.sin(t * 2)})`}>
            <rect x={-470} y={-300} width={940} height={600} rx={30} fill="#05070C" stroke="#334155" strokeWidth={6} />
            <rect x={-470} y={-300} width={940} height={70} rx={30} fill="#111827" />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={-420 + i * 40} cy={-265} r={11} fill={['#EF4444', '#FACC15', '#4ADE80'][i]} />
            ))}
            <text x={-420} y={-140} fontFamily="'DejaVu Sans Mono', monospace" fontWeight={700} fontSize={44} fill="#4ADE80">
              {cmd.slice(0, n)}
              {Math.floor(t * 3) % 2 === 0 || n < cmd.length ? '▌' : ''}
            </text>
            {hl > 0.01 ? <rect x={-436} y={-196} width={872 * Math.min(1, hl)} height={76} rx={10} fill="none" stroke={C4.yellow} strokeWidth={6} /> : null}
            {run ? (
              <text x={-420} y={-40} fontFamily="'DejaVu Sans Mono', monospace" fontWeight={700} fontSize={40} fill="#94A3B8">
                {`▸ ejecutando${'.'.repeat(1 + (Math.floor(t * 5) % 3))}`}
              </text>
            ) : null}
            <OutText x={0} y={200} size={30} fill="#64748B" text="RED TRONCAL: 3 APPS" mono />
          </g>
        </svg>
      </AbsoluteFill>
    );
  }
  // the cascade: the master switch flips off and the apps die one by one
  const apago = num(mark('apago'), 0.15);
  const tres = num(mark('tres'), 0.7);
  const off = clamp((t - apago) / 0.12);
  const nodeOff = [apago + 0.14, apago + 0.3, Math.max(apago + 0.46, tres - 0.05)];
  const SW = { x: 540, y: 520 };
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <NightRoom t={t} id="cs4" alarm={off} />
        {/* the lines */}
        {NODE_X.map((x, i) => {
          const dead = t >= nodeOff[i];
          const d = `M ${SW.x} ${SW.y + 80} C ${SW.x} ${SW.y + 260}, ${x} ${SW.y + 260}, ${x} 950`;
          return (
            <g key={i}>
              <path d={d} stroke={dead ? '#1F2937' : '#64748B'} strokeWidth={14} fill="none" strokeLinecap="round" />
              {!dead ? <path d={d} stroke={C4.yellow} strokeWidth={8} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="0.05 0.08" strokeDashoffset={-t * 1.2} opacity={0.9} /> : null}
            </g>
          );
        })}
        {/* the master switch */}
        <g transform={`translate(${SW.x} ${SW.y})`}>
          <OutText x={0} y={-120} size={30} fill="#94A3B8" text="RED TRONCAL" mono />
          <rect x={-150} y={-70} width={300} height={140} rx={70} fill={off > 0.5 ? '#1F2937' : '#FACC15'} stroke="#0B0B0B" strokeWidth={8} />
          <circle cx={-80 + 160 * (1 - off)} cy={0} r={56} fill="#F8FAFC" stroke="#0B0B0B" strokeWidth={6} />
          <OutText x={0} y={130} size={40} fill={off > 0.5 ? C4.red : '#4ADE80'} text={off > 0.5 ? 'OFF' : 'ON'} stroke={6} />
        </g>
        {(['wa', 'ig', 'fb'] as const).map((k, i) => {
          const dead = t >= nodeOff[i];
          const hit = dead ? Math.exp(-(t - nodeOff[i]) / 0.15) : 0;
          return (
            <g key={k} transform={`translate(0 ${-12 * hit})`}>
              <AppGlyph kind={k} x={NODE_X[i]} y={1050} r={95} on={dead ? 0 : 1} label labelColor={dead ? '#4B5563' : '#E2E8F0'} />
              {hit > 0.05 ? <circle cx={NODE_X[i]} cy={1050} r={100 + 80 * (1 - hit)} fill="none" stroke={C4.red} strokeWidth={8 * hit} /> : null}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const AuditScene: React.FC<ShotProps> = ({ t, f, fps, dur, mark }) => {
  const frenar = num(mark('frenar'), 1.0);
  const fallo = num(mark('fallo'), 2.0);
  // the command card travels; the boom that should stop it lifts by itself on "frenarlo"
  const px = -200 + 1500 * sm(clamp(t / Math.max(1, dur - 0.3)));
  const lift = sm(clamp((t - frenar + 0.15) / 0.35));
  const broken = t >= fallo;
  const bk = broken ? springAt(f, fps, fallo, HARD) : 0;
  const amp = broken ? 10 * Math.exp(-(t - fallo) / 0.3) : 0;
  const sx = (rand(f * 2 + 41) - 0.5) * 2 * amp;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <NightRoom t={t} id="au4" alarm={broken ? 1 : 0.2} />
        <g transform={`translate(${sx} 0)`}>
          <OutText x={540} y={430} size={34} fill="#94A3B8" text="HERRAMIENTA DE AUDITORÍA" mono />
          <g transform="translate(540 900) scale(1.3) translate(-540 -900)">
          {/* the road */}
          <rect x={0} y={1000} width={1080} height={16} fill="#1F2937" />
          {/* the post, its panel and the boom */}
          <g transform="translate(560 1000)">
            <rect x={-30} y={-330} width={60} height={330} rx={10} fill="#334155" stroke="#0B0B0B" strokeWidth={6} />
            <g transform="translate(0 -360)">
              <rect x={-120} y={-70} width={240} height={110} rx={18} fill="#05070C" stroke={broken ? C4.red : '#475569'} strokeWidth={6} />
              {broken ? (
                <g>
                  <text y={8} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={50} fill={C4.red} transform={`translate(${(rand(f + 5) - 0.5) * 10 * Math.exp(-(t - fallo) / 0.4)} 0)`}>
                    ERROR
                  </text>
                  <path d="M -70 -60 L -20 -10 L -40 10 L 10 40" stroke="#F8FAFC" strokeWidth={5} fill="none" opacity={Math.min(1, bk)} />
                </g>
              ) : (
                <g>
                  <circle cx={0} cy={-14} r={26} fill={lift > 0.1 ? '#4ADE80' : C4.red} />
                  <text y={30} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={26} fill="#94A3B8">
                    {lift > 0.1 ? 'OK' : 'ALTO'}
                  </text>
                </g>
              )}
            </g>
            <g transform={`rotate(${-82 * lift} 0 -170)`}>
              <rect x={-20} y={-190} width={480} height={40} rx={20} fill="#F8FAFC" stroke="#0B0B0B" strokeWidth={6} />
              {[0, 1, 2, 3].map((i) => (
                <rect key={i} x={40 + i * 105} y={-188} width={50} height={36} fill={C4.red} />
              ))}
            </g>
          </g>
          {/* the command card */}
          <g transform={`translate(${px} ${840 + 6 * Math.sin(t * 9)})`}>
            <rect x={-150} y={-60} width={300} height={120} rx={22} fill="#05070C" stroke={C4.yellow} strokeWidth={6} />
            <text y={14} textAnchor="middle" fontFamily="'DejaVu Sans Mono', monospace" fontWeight={700} fontSize={36} fill={C4.yellow}>
              $ COMANDO
            </text>
          </g>
          </g>
          {broken ? <Stamp k={bk} x={540} y={1210} label="TAMBIÉN FALLÓ" color={C4.red} w={760} size={84} rot={4} /> : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const TRI = [
  { x: 540, y: 560 },
  { x: 260, y: 1020 },
  { x: 820, y: 1020 },
];

export const MapScene: React.FC<ShotProps> = ({ t, f, fps, variant, mark }) => {
  if (variant !== 'gone') {
    // the three server nodes lose the lines between them
    const entre = num(mark('entre'), 0.8);
    const cut = t >= entre;
    const ck = cut ? clamp((t - entre) / 0.35) : 0;
    const spark = cut ? Math.max(0, 1 - (t - entre) / 0.35) : 0;
    const pairs: [number, number][] = [
      [0, 1],
      [1, 2],
      [2, 0],
    ];
    return (
      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <NightRoom t={t} id="mc4" alarm={cut ? 0.8 : 0} />
          <OutText x={540} y={400} size={32} fill="#94A3B8" text="SUS PROPIOS SERVIDORES" mono />
          {pairs.map(([a, b], i) => {
            const A = TRI[a];
            const B = TRI[b];
            const mx = (A.x + B.x) / 2;
            const my = (A.y + B.y) / 2;
            const gap = 0.5 - 0.42 * ck; // each half pulls back from the middle
            const p = (q: number) => ({ x: A.x + (B.x - A.x) * q, y: A.y + (B.y - A.y) * q });
            const h1 = p(gap);
            const h2 = p(1 - gap);
            return (
              <g key={i}>
                <line x1={A.x} y1={A.y} x2={cut ? h1.x : B.x} y2={cut ? h1.y : B.y} stroke={cut ? '#475569' : '#38BDF8'} strokeWidth={12} strokeLinecap="round" />
                {cut ? <line x1={h2.x} y1={h2.y} x2={B.x} y2={B.y} stroke="#475569" strokeWidth={12} strokeLinecap="round" /> : null}
                {!cut ? <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#E0F2FE" strokeWidth={6} pathLength={1} strokeDasharray="0.04 0.07" strokeDashoffset={-t * 1.5} /> : null}
                {spark > 0
                  ? SPARKS.map((s, j) => (
                      <line key={j} x1={mx} y1={my} x2={mx + Math.cos(s.a) * s.l * (1.5 - spark)} y2={my + Math.sin(s.a) * s.l * (1.5 - spark)} stroke={j % 2 ? C4.yellow : '#FFFFFF'} strokeWidth={5} opacity={spark} strokeLinecap="round" />
                    ))
                  : null}
              </g>
            );
          })}
          {TRI.map((n, i) => (
            <g key={i}>
              <ServerNode x={n.x} y={n.y} r={110} on={1} t={t + i} color={cut ? C4.red : '#38BDF8'} />
              {cut ? <circle cx={n.x} cy={n.y} r={165} fill="none" stroke={C4.red} strokeWidth={6} strokeDasharray="10 16" transform={`rotate(${t * 40} ${n.x} ${n.y})`} opacity={ck} /> : null}
            </g>
          ))}
        </svg>
      </AbsoluteFill>
    );
  }
  // gone: the map of the internet, and the three apps vanish from it
  const borro = num(mark('borro'), 0.5);
  const gone = t >= borro;
  const gk = gone ? clamp((t - borro) / 0.3) : 0;
  const dots: { x: number; y: number }[] = [];
  for (let i = 0; i < 26; i++) for (let j = 0; j < 26; j++) {
    const x = -1 + (2 * i) / 25;
    const y = -1 + (2 * j) / 25;
    if (x * x + y * y < 1) dots.push({ x: 540 + x * 380, y: 820 + y * 380 });
  }
  const pins = [
    { k: 'wa' as const, x: 400, y: 700 },
    { k: 'ig' as const, x: 660, y: 640 },
    { k: 'fb' as const, x: 580, y: 940 },
  ];
  const nf = springAt(f, fps, borro + 0.15, HARD);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <NightRoom t={t} id="mg4" alarm={gone ? 0.8 : 0} />
        <OutText x={540} y={380} size={32} fill="#94A3B8" text="EL MAPA DE INTERNET" mono />
        <g transform={`rotate(${t * 4} 540 820)`}>
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={5} fill="#38BDF8" opacity={0.22 + 0.2 * Math.abs(Math.sin(t * 2 + i * 0.3))} />
          ))}
        </g>
        <circle cx={540} cy={820} r={392} fill="none" stroke="#1E3A5F" strokeWidth={4} />
        {pins.map((p, i) => {
          const s = gone ? 1 - gk : 1;
          return (
            <g key={p.k}>
              {s > 0.02 ? (
                <g transform={`translate(${p.x} ${p.y + 4 * Math.sin(t * 3 + i)}) scale(${s * (1 + 0.15 * gk)})`}>
                  <AppGlyph kind={p.k} x={0} y={0} r={62} on={1} />
                </g>
              ) : null}
              {gone ? (
                <g opacity={Math.min(1, gk * 1.5)}>
                  <circle cx={p.x} cy={p.y} r={46} fill="none" stroke={C4.red} strokeWidth={5} strokeDasharray="8 10" />
                  <text x={p.x} y={p.y + 20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={56} fill={C4.red}>
                    ?
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
        {nf > 0.01 ? (
          <g transform={`translate(540 1250) scale(${0.7 + 0.3 * Math.min(1.08, nf)})`} opacity={Math.min(1, nf * 1.6)}>
            <rect x={-400} y={-50} width={800} height={100} rx={22} fill="#05070C" stroke={C4.red} strokeWidth={5} />
            <text y={16} textAnchor="middle" fontFamily="'DejaVu Sans Mono', monospace" fontWeight={700} fontSize={40} fill="#FCA5A5">
              facebook.com: NO ENCONTRADO
            </text>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

export const DoorScene: React.FC<ShotProps> = ({ t, f, fps, mark, variant }) => {
  if (variant === 'badge') return <BadgeCloseUp t={t} f={f} fps={fps} dur={0} mark={mark} variant={variant} />;
  // "Los ingenieros que podían arreglarlo... ni siquiera podían entrar": the climax as action. Two engineers run in, the man in
  // the suit swipes his badge twice, Mo fights the handle and bangs on the door, a red beacon turns, and on "entrar"
  // ACCESO DENEGADO slams in with a flash and a shake.
  // the slam lands on 'denegado' (early enough that ACCESO DENEGADO stays over a second before the cut), else on "entrar"
  const entrar = num(mark('denegado'), num(mark('entrar'), 2.4));
  const run1 = sm(clamp(t / 0.6));
  const run2 = sm(clamp((t - 0.1) / 0.7));
  const swipeAt = [entrar - 0.85, entrar - 0.42];
  const swipe = Math.max(...swipeAt.map((a) => (t > a ? Math.sin(clamp((t - a) / 0.32) * Math.PI) : 0)));
  const beep = Math.max(...swipeAt.map((a) => (t > a + 0.16 ? Math.exp(-(t - a - 0.16) / 0.12) : 0)));
  const bang = t > entrar - 0.3 && t < entrar ? Math.abs(Math.sin((t - entrar + 0.3) * 22)) : 0;
  const denied = t >= entrar - 0.05;
  const dk = denied ? springAt(f, fps, entrar - 0.05, { stiffness: 320, damping: 11, mass: 0.6 }) : 0;
  const flash = denied ? Math.max(0, 1 - (t - entrar + 0.05) / 0.2) : 0;
  const amp = (denied ? 16 * Math.exp(-(t - entrar) / 0.3) : 0) + 4 * bang + 1.5;
  const sx = (rand(f * 2 + 81) - 0.5) * 2 * amp;
  const sy = (rand(f * 2 + 82) - 0.5) * 2 * amp;
  const step = (k: number, ph: number) => (k < 1 ? 28 * Math.sin(t * 16 + ph) : 0);
  const suit: Pose = { ...basePose, x: -260 + 590 * run1, y: 1360 - (run1 < 1 ? 14 * Math.abs(Math.sin(t * 16)) : 0), scale: 1.95, yaw: 0.35, look: 0.8, expr: denied ? 'shock' : 'worried', armL: { a: 30 + 75 * swipe, b: 40 + 20 * swipe }, armR: { a: 15 + step(run1, 1), b: 10 }, legL: { a: step(run1, 0), b: 0 }, legR: { a: -step(run1, 0), b: 0 }, headTilt: 3 };
  const mo: Pose = { ...basePose, x: -420 + 560 * run2, y: 1330 - (run2 < 1 ? 14 * Math.abs(Math.sin(t * 16 + 1)) : 0), scale: 1.75, yaw: 0.4, look: 0.8, expr: denied ? 'shock' : 'worried', armL: { a: 60 + 70 * bang, b: 30 }, armR: { a: 50 + 50 * bang, b: 30 }, legL: { a: step(run2, 2), b: 0 }, legR: { a: -step(run2, 2), b: 0 }, headTilt: -3 };
  const beacon = t * 7;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <SetDefs />
        <NightRoom t={t} id="dr4" alarm={denied ? 1 : 0.4} />
        <g transform={`translate(${sx} ${sy})`}>
          {/* the beacon over the door, sweeping red light */}
          <g transform="translate(720 410)">
            <path d={`M 0 0 L ${Math.cos(beacon) * 900} ${Math.sin(beacon) * 300 + 500} L ${Math.cos(beacon + 0.35) * 900} ${Math.sin(beacon + 0.35) * 300 + 500} Z`} fill={C4.red} opacity={0.14} />
            <rect x={-40} y={-30} width={80} height={50} rx={20} fill={Math.sin(beacon) > 0 ? C4.red : '#7F1D1D'} stroke="#0B0B0B" strokeWidth={5} />
          </g>
          <OutText x={720} y={360} size={28} fill="#94A3B8" text="CENTRO DE DATOS" mono />
          {/* the door, shaking under the blows */}
          <g transform={`translate(${720 + 6 * bang} 830)`}>
            <rect x={-230} y={-360} width={460} height={720} rx={14} fill="#1E293B" stroke="#0B0B0B" strokeWidth={8} />
            <rect x={-200} y={-330} width={400} height={660} rx={8} fill="#273449" />
            {[-200, -60, 80, 220].map((y) => (
              <rect key={y} x={-200} y={y} width={400} height={8} fill="#1E293B" />
            ))}
            <g transform={`rotate(${18 * bang} -150 20)`}>
              <rect x={-180} y={10} width={90} height={22} rx={11} fill="#94A3B8" />
            </g>
          </g>
          {/* the reader */}
          <g transform="translate(990 820)">
            <rect x={-46} y={-80} width={92} height={160} rx={16} fill="#0B1220" stroke="#475569" strokeWidth={5} />
            <circle cx={0} cy={-46} r={16} fill={beep > 0.1 || denied ? C4.red : '#334155'} />
            {beep > 0.05 ? <circle cx={0} cy={-46} r={16 + 40 * (1 - beep)} fill="none" stroke={C4.red} strokeWidth={5} opacity={beep} /> : null}
            <rect x={-28} y={-10} width={56} height={70} rx={8} fill="#111827" />
          </g>
          {/* the badge in the suit's hand, swiped at the reader */}
          <g transform={`translate(${330 + 560 * swipe} ${980 - 160 * swipe}) rotate(${-10 + 10 * swipe})`} opacity={run1 > 0.6 ? 1 : 0}>
            <rect x={-50} y={-72} width={100} height={144} rx={12} fill="#F8FAFC" stroke="#0B0B0B" strokeWidth={5} />
            <circle cx={0} cy={-22} r={20} fill="#CBD5E1" />
            <rect x={-32} y={16} width={64} height={10} rx={5} fill="#94A3B8" />
          </g>
          <Hero look={LOOKS.mo} pose={mo} shadow={0} />
          <Hero look={LOOKS.suit} pose={suit} shadow={0} />
        </g>
        {denied ? (
          <g transform={`translate(640 ${600}) rotate(${-4 * (1 - Math.min(1, dk))}) scale(${2 - Math.min(1.08, dk)})`} opacity={Math.min(1, dk * 2)}>
            <rect x={-310} y={-60} width={620} height={120} rx={26} fill="#1A0306" stroke={C4.red} strokeWidth={8} />
            <text y={21} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={58} fill={Math.floor(t * 6) % 2 ? '#FCA5A5' : C4.red}>
              ACCESO DENEGADO
            </text>
          </g>
        ) : null}
        <rect width={1080} height={1920} fill={C4.red} opacity={0.45 * flash} />
      </svg>
    </AbsoluteFill>
  );
};

/** "...sus tarjetas ya no abrían la puerta": the reader in close-up, three swipes on the three beats, the last one a slam. */
const BadgeCloseUp: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const tarjetas = num(mark('tarjetas'), 0.15);
  const abrian = num(mark('abrian'), tarjetas + 0.55);
  const puerta = num(mark('puerta'), abrian + 0.6);
  const hits = [tarjetas - 0.05, abrian - 0.05, puerta - 0.08];
  const swipe = Math.max(...hits.map((a) => (t > a - 0.18 && t < a + 0.22 ? Math.sin(clamp((t - a + 0.18) / 0.4) * Math.PI) : 0)));
  const last = hits.filter((a) => t >= a).length; // how many refusals so far
  const since = last ? t - hits[last - 1] : 9;
  const kick = last ? Math.exp(-since / (last === 3 ? 0.35 : 0.18)) : 0;
  const amp = kick * (last === 3 ? 26 : 10) + 1.5;
  const sx = (rand(f * 2 + 91) - 0.5) * 2 * amp;
  const sy = (rand(f * 2 + 92) - 0.5) * 2 * amp;
  const srcK = springAt(f, fps, 0.3, HARD);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <NightRoom t={t} id="bd4" alarm={1} />
        <g transform={`translate(${sx} ${sy}) translate(540 860) scale(${1 + 0.06 * Math.min(1, t / 2)}) translate(-540 -860)`}>
          {/* the wall and the reader, big */}
          <rect x={0} y={420} width={1080} height={900} fill="#1E293B" />
          <rect x={0} y={420} width={260} height={900} fill="#273449" />
          <g transform="translate(640 860)">
            <rect x={-150} y={-300} width={300} height={560} rx={46} fill="#0B1220" stroke="#475569" strokeWidth={10} />
            <circle cx={0} cy={-200} r={50} fill={kick > 0.2 || last === 3 ? C4.red : '#334155'} />
            {kick > 0.05 ? <circle cx={0} cy={-200} r={50 + 160 * (1 - kick)} fill="none" stroke={C4.red} strokeWidth={10} opacity={kick} /> : null}
            <rect x={-100} y={-110} width={200} height={130} rx={18} fill={kick > 0.2 ? '#450A0A' : '#111827'} />
            {last ? (
              <g transform="translate(0 -45)" stroke={C4.red} strokeWidth={14} strokeLinecap="round">
                <line x1={-34} y1={-34} x2={34} y2={34} />
                <line x1={34} y1={-34} x2={-34} y2={34} />
              </g>
            ) : null}
            <rect x={-90} y={70} width={180} height={150} rx={20} fill="#111827" stroke="#334155" strokeWidth={6} />
            {/* sparks on every refusal */}
            {kick > 0.1
              ? Array.from({ length: 10 }, (_, i) => {
                  const a2 = (i / 10) * Math.PI * 2 + last;
                  const r0 = 60 + 160 * (1 - kick);
                  return <line key={i} x1={Math.cos(a2) * 40} y1={-200 + Math.sin(a2) * 40} x2={Math.cos(a2) * r0} y2={-200 + Math.sin(a2) * r0} stroke={i % 2 ? C4.yellow : '#FFF'} strokeWidth={8} strokeLinecap="round" opacity={kick} />;
                })
              : null}
          </g>
          {/* the hand and the badge, swiping */}
          <g transform={`translate(${120 + 420 * swipe} ${980 - 40 * swipe}) rotate(${-14 + 14 * swipe})`}>
            <rect x={-90} y={-130} width={180} height={260} rx={16} fill="#F8FAFC" stroke="#0B0B0B" strokeWidth={7} />
            <circle cx={0} cy={-40} r={40} fill="#CBD5E1" />
            <rect x={-56} y={30} width={112} height={16} rx={8} fill="#94A3B8" />
            <rect x={-56} y={62} width={80} height={16} rx={8} fill="#CBD5E1" />
            <ellipse cx={-90} cy={30} rx={70} ry={60} fill="#D9C6AE" stroke="#0B0B0B" strokeWidth={6} />
          </g>
          {/* DENEGADO, stacking up with every refusal */}
          {hits.slice(0, last).map((a, i) => (
            <Stamp key={i} k={springAt(f, fps, a, HARD)} x={540 + (i - 1) * 40} y={470 + i * 90} label="DENEGADO" color={C4.red} w={560} size={i === 2 ? 92 : 72} rot={(i % 2 ? 6 : -6) - i * 2} />
          ))}
        </g>
        {last === 3 ? <rect width={1080} height={1920} fill={C4.red} opacity={0.5 * Math.max(0, 1 - since / 0.25)} /> : null}
        <text x={540} y={1300} textAnchor="middle" fontFamily={HEAVY} fontWeight={700} fontSize={26} fill="#CBD5E1" opacity={0.85 * Math.min(1, srcK)}>
          Según KrebsOnSecurity y The New York Times
        </text>
      </svg>
    </AbsoluteFill>
  );
};
