import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Hero, basePose, LOOKS, KitDefs, SetDefs, Pose } from '../../engine';
import { HARD, HEAVY, rand, ShotProps, springAt } from '../motion';
import { Stamp } from '../fallo02/parts';
import { AppGlyph, Bubble, C4, clamp, num, OutText, PendingClock, sm, Wifi } from './parts';
import { NightRoom } from './HookScene';

// The universal half of Fallo #04: what the outage looked like in everyday life, and the cause told with everyday pictures.
//   life   shop:   the corner shop, PEDIDOS POR WHATSAPP, 0 pedidos      family: the family group, everyone on the clock
//          city:   the city at night: every window a phone, no message gets through (and the sound drops out)
//   blame  hack:   the hooded hacker, crossed out                      wifi: the home wifi at full bars, OK
//   key    one finger, one key: ENTER (the routine command)
//   town   streets: three buildings (the three apps) and the streets between them vanish
//          search:  a maps search for them: NO SE ENCUENTRA

const Row: React.FC<{ y: number; name: string; color: string; preview: string; t: number; i: number; dead?: boolean }> = ({ y, name, color, preview, t, i, dead = true }) => (
  <g transform={`translate(0 ${y})`}>
    <circle cx={150} cy={0} r={46} fill={color} />
    <text x={150} y={17} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={44} fill="#0B1220">
      {name[0]}
    </text>
    <text x={226} y={-10} fontFamily={HEAVY} fontWeight={900} fontSize={40} fill="#F1F5F9">
      {name}
    </text>
    <text x={226} y={36} fontFamily={HEAVY} fontWeight={600} fontSize={30} fill="#64748B">
      {preview}
    </text>
    {dead ? <PendingClock x={930} y={0} r={20} t={t + i * 0.3} color={C4.red} /> : null}
    <line x1={226} y1={66} x2={980} y2={66} stroke="#1E293B" strokeWidth={3} />
  </g>
);

export const LifeScene: React.FC<ShotProps> = ({ t, f, fps, variant, mark }) => {
  if (variant === 'family') {
    const people = [
      { n: 'Abuela', c: '#FCA5A5', m: '¿Ya llegaron?' },
      { n: 'Papá', c: '#93C5FD', m: '¿Están bien?' },
      { n: 'Tía Rosa', c: '#FDE68A', m: 'Contesten porfa' },
      { n: 'Tú', c: '#86EFAC', m: 'Todo bien!' },
    ];
    return (
      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <NightRoom t={t} id="fm4" alarm={0.3} />
          <g transform={`translate(540 ${430})`}>
            <rect x={-440} y={-60} width={880} height={120} rx={30} fill="#111827" stroke="#334155" strokeWidth={5} />
            <text x={-380} y={14} fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#F8FAFC">
              Familia
            </text>
            <text x={380} y={12} textAnchor="end" fontFamily={HEAVY} fontWeight={700} fontSize={30} fill={C4.red} opacity={0.6 + 0.4 * Math.abs(Math.sin(t * 5))}>
              sin conexión
            </text>
          </g>
          {people.map((p, i) => {
            const inK = springAt(f, fps, 0.05 + i * 0.12, HARD);
            const out = p.n === 'Tú';
            const y = 610 + i * 170;
            return (
              <g key={p.n} opacity={Math.min(1, inK * 1.6)} transform={`translate(${(out ? 1 : -1) * 60 * (1 - Math.min(1, inK))} 0)`}>
                <Bubble x={out ? 650 : 440} y={y} w={520} h={130} side={out ? 'out' : 'in'} fill={out ? '#14532D' : C4.bubble}>
                  <text x={-220} y={-14} fontFamily={HEAVY} fontWeight={900} fontSize={28} fill={p.c}>
                    {p.n}
                  </text>
                  <text x={-220} y={34} fontFamily={HEAVY} fontWeight={800} fontSize={40} fill="#F8FAFC">
                    {p.m}
                  </text>
                  <PendingClock x={220} y={36} r={16} t={t + i} color={C4.red} />
                </Bubble>
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
    );
  }
  if (variant === 'city') {
    // the city at night: every window a phone with the clock; the camera pulls back and it all goes quiet
    const silencio = num(mark('silencio'), 1.0);
    const quiet = clamp((t - silencio + 0.2) / 0.6);
    const zoom = 1.25 - 0.25 * sm(clamp(t / 1.5));
    return (
      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <NightRoom t={t} id="ci4" alarm={0} />
          <g transform={`translate(540 960) scale(${zoom}) translate(-540 -960)`}>
            {[
              { x: 40, w: 300, h: 900 },
              { x: 370, w: 340, h: 1150 },
              { x: 740, w: 300, h: 980 },
            ].map((b, i) => (
              <g key={i}>
                <rect x={b.x} y={1480 - b.h} width={b.w} height={b.h} fill="#0F172A" stroke="#1E293B" strokeWidth={6} />
                {Array.from({ length: Math.floor(b.h / 110) }, (_, r) =>
                  [0, 1, 2].map((c) => {
                    const k = i * 31 + r * 3 + c;
                    const lit = rand(k) > 0.25;
                    const wx = b.x + 30 + c * ((b.w - 60) / 3);
                    const wy = 1480 - b.h + 40 + r * 110;
                    return (
                      <g key={`${r}-${c}`}>
                        <rect x={wx} y={wy} width={(b.w - 90) / 3} height={70} rx={6} fill={lit ? '#1E3A5F' : '#0B1220'} opacity={lit ? 1 - 0.6 * quiet : 1} />
                        {lit ? <PendingClock x={wx + (b.w - 90) / 6} y={wy + 35} r={13} t={t + k} color={quiet > 0.5 ? '#475569' : '#93C5FD'} /> : null}
                      </g>
                    );
                  }),
                )}
              </g>
            ))}
            <rect x={0} y={1480} width={1080} height={440} fill="#05070C" />
          </g>
          {quiet > 0.05 ? <OutText x={540} y={1240} size={44} fill="#94A3B8" text="SIN MENSAJES" mono opacity={quiet} /> : null}
        </svg>
      </AbsoluteFill>
    );
  }
  // shop: the corner shop that takes its orders by phone
  const k = springAt(f, fps, 0.05, HARD);
  const pose: Pose = { ...basePose, x: 760, y: 1330, scale: 1.7, yaw: -0.3, look: -0.4, expr: 'worried', armL: { a: 12, b: 10 }, armR: { a: 12, b: 10 }, headTilt: -4 + 2 * Math.sin(t * 2) };
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <SetDefs />
        <NightRoom t={t} id="sh4" alarm={0.2} />
        {/* the awning and the sign */}
        <g transform="translate(540 380)">
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M ${-480 + i * 120} 0 L ${-360 + i * 120} 0 L ${-360 + i * 120} 90 Q ${-420 + i * 120} 130 ${-480 + i * 120} 90 Z`} fill={i % 2 ? '#F8FAFC' : C4.red} />
          ))}
        </g>
        <g transform={`translate(330 ${640}) rotate(-4) scale(${0.7 + 0.3 * Math.min(1.08, k)})`} opacity={Math.min(1, k * 1.6)}>
          <rect x={-250} y={-90} width={500} height={180} rx={20} fill="#F8FAFC" stroke="#0B0B0B" strokeWidth={7} />
          <text y={-20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={46} fill="#0B1220">
            PEDIDOS POR
          </text>
          <g transform="translate(-150 40)">
            <AppGlyph kind="wa" x={0} y={0} r={34} on={1} />
          </g>
          <text x={36} y={56} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={50} fill={C4.wa}>
            WHATSAPP
          </text>
        </g>
        {/* the counter, the phone on it: 0 orders */}
        <rect x={0} y={1080} width={1080} height={60} fill="#7C2D12" />
        <rect x={0} y={1140} width={1080} height={260} fill="#431407" />
        <g transform={`translate(300 ${980}) rotate(-8)`}>
          <rect x={-90} y={-160} width={180} height={320} rx={26} fill="#111827" stroke="#334155" strokeWidth={6} />
          <rect x={-74} y={-140} width={148} height={280} rx={14} fill="#0B1220" />
          <text y={-40} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={28} fill="#94A3B8">
            PEDIDOS
          </text>
          <text y={50} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={110} fill={C4.red} opacity={0.75 + 0.25 * Math.sin(t * 6)}>
            0
          </text>
        </g>
        <Hero look={LOOKS.pip} pose={pose} shadow={0} />
      </svg>
    </AbsoluteFill>
  );
};

export const BlameScene: React.FC<ShotProps> = ({ t, f, fps, variant, mark }) => {
  if (variant === 'wifi') {
    const ok = springAt(f, fps, 0.12, HARD);
    return (
      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <NightRoom t={t} id="bw4" alarm={0} />
          <circle cx={540} cy={760} r={430} fill="#4ADE80" opacity={0.06} />
          <g transform={`translate(0 ${6 * Math.sin(t * 3)})`}>
            <Wifi x={540} y={740} s={2.3} bars={3} color="#E2E8F0" />
          </g>
          <g transform={`translate(540 1080) scale(${0.6 + 0.4 * Math.min(1.1, ok)})`} opacity={Math.min(1, ok * 1.6)}>
            <rect x={-260} y={-56} width={520} height={112} rx={56} fill="#052E16" stroke="#4ADE80" strokeWidth={7} />
            <path d="M -200 0 L -176 24 L -136 -22" stroke="#4ADE80" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <text x={36} y={19} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={54} fill="#4ADE80">
              TU WIFI: OK
            </text>
          </g>
        </svg>
      </AbsoluteFill>
    );
  }
  // hack: the hooded hacker of every stock photo, and the big red cross on "hackeo"
  const hackeo = num(mark('hackeo'), 0.6);
  const xk = springAt(f, fps, hackeo - 0.05, HARD);
  const glow = 0.5 + 0.5 * Math.sin(t * 9);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <NightRoom t={t} id="bh4" alarm={0.4} />
        <g transform={`translate(540 ${820 + 6 * Math.sin(t * 2)})`}>
          {/* the hood */}
          <path d="M -260 360 Q -270 -40 0 -230 Q 270 -40 260 360 Z" fill="#0F172A" stroke="#334155" strokeWidth={8} />
          <ellipse cx={0} cy={20} rx={150} ry={170} fill="#020617" />
          <circle cx={-55} cy={10} r={14} fill="#4ADE80" opacity={0.6 + 0.4 * glow} />
          <circle cx={55} cy={10} r={14} fill="#4ADE80" opacity={0.6 + 0.4 * glow} />
          {/* the laptop */}
          <rect x={-220} y={250} width={440} height={170} rx={16} fill="#1E293B" stroke="#475569" strokeWidth={6} />
          <text y={350} textAnchor="middle" fontFamily="'DejaVu Sans Mono', monospace" fontWeight={700} fontSize={34} fill="#4ADE80">
            {'> hack.exe'}
          </text>
        </g>
        {xk > 0.01 ? (
          <g transform={`translate(540 860) scale(${(1.5 - 0.5 * Math.min(1.1, xk)) * 1})`} opacity={Math.min(1, xk * 2)}>
            <path d="M -300 -300 L 300 300 M 300 -300 L -300 300" stroke="#000" strokeWidth={84} strokeLinecap="round" />
            <path d="M -300 -300 L 300 300 M 300 -300 L -300 300" stroke={C4.red} strokeWidth={58} strokeLinecap="round" />
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

/** "Un solo comando de rutina": one finger presses one key, ENTER. */
export const KeyScene: React.FC<ShotProps> = ({ t, mark }) => {
  const comando = num(mark('comando'), 0.5);
  const press = t >= comando - 0.12 ? sm(clamp((t - comando + 0.12) / 0.12)) * (t < comando + 0.25 ? 1 : 1 - sm(clamp((t - comando - 0.25) / 0.2))) : 0;
  const hit = t >= comando ? Math.exp(-(t - comando) / 0.3) : 0;
  const zoom = 1 + 0.1 * sm(clamp(t / 1.8));
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <NightRoom t={t} id="ky4" alarm={0} />
        <OutText x={540} y={420} size={32} fill={C4.yellow} text="REVISIÓN DE RUTINA" mono />
        <g transform={`translate(540 900) scale(${zoom})`}>
          {/* the keyboard around the key */}
          {Array.from({ length: 3 }, (_, r) =>
            Array.from({ length: 5 }, (_, c) => (r === 1 && c === 2 ? null : <rect key={`${r}${c}`} x={-560 + c * 230} y={-330 + r * 230} width={200} height={200} rx={28} fill="#111827" stroke="#1F2937" strokeWidth={6} />)),
          )}
          {/* the key */}
          <g transform={`translate(0 ${18 * press})`}>
            <rect x={-110} y={-100} width={220} height={200} rx={30} fill={hit > 0.05 ? '#FDE68A' : '#E2E8F0'} stroke="#0B0B0B" strokeWidth={8} />
            <text y={18} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill="#0B1220">
              ENTER
            </text>
          </g>
          {hit > 0.02 ? <circle r={160 + 300 * (1 - hit)} fill="none" stroke={C4.yellow} strokeWidth={12 * hit} opacity={hit} /> : null}
          {/* the finger */}
          <g transform={`translate(30 ${-420 + 300 * press + 240 * (1 - sm(clamp(t / 0.4)))})`}>
            <rect x={-60} y={-420} width={120} height={420} rx={60} fill="#FCD9B6" stroke="#0B0B0B" strokeWidth={8} />
            <path d="M -40 -40 Q 0 -10 40 -40" stroke="#E5B48F" strokeWidth={6} fill="none" />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const BUILD = [
  { k: 'wa' as const, x: 230, y: 760, h: 380, c: C4.wa },
  { k: 'ig' as const, x: 540, y: 640, h: 500, c: C4.ig },
  { k: 'fb' as const, x: 850, y: 760, h: 380, c: C4.fb },
];

/** The three apps as three buildings on a street map: the streets between them vanish, then a maps search cannot find them. */
export const TownScene: React.FC<ShotProps> = ({ t, f, fps, variant, mark }) => {
  if (variant === 'search') {
    const enc = num(mark('encontrara'), 1.6);
    const typed = 'whatsapp.com';
    const n = Math.floor(clamp((t - 0.1) / 0.7) * typed.length);
    const nf = springAt(f, fps, enc - 0.1, HARD);
    const spin = t < enc - 0.1;
    return (
      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <NightRoom t={t} id="sr4" alarm={nf > 0.5 ? 0.6 : 0} />
          {/* the map: an empty grid of streets */}
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i}>
              <line x1={0} y1={520 + i * 130} x2={1080} y2={520 + i * 130} stroke="#1E293B" strokeWidth={10} />
              <line x1={60 + i * 140} y1={480} x2={60 + i * 140} y2={1460} stroke="#1E293B" strokeWidth={10} />
            </g>
          ))}
          {/* the empty plots where the buildings stood */}
          {BUILD.map((b) => (
            <rect key={b.k} x={b.x - 90} y={b.y + 120} width={180} height={180} rx={14} fill="none" stroke={C4.red} strokeWidth={5} strokeDasharray="12 12" opacity={nf} />
          ))}
          {/* the search bar */}
          <g transform="translate(540 420)">
            <rect x={-440} y={-60} width={880} height={120} rx={60} fill="#F8FAFC" stroke="#0B0B0B" strokeWidth={6} />
            <circle cx={-370} cy={-6} r={22} fill="none" stroke="#64748B" strokeWidth={7} />
            <line x1={-354} y1={10} x2={-336} y2={28} stroke="#64748B" strokeWidth={7} strokeLinecap="round" />
            <text x={-310} y={16} fontFamily={HEAVY} fontWeight={800} fontSize={46} fill="#0B1220">
              {typed.slice(0, n)}
              {Math.floor(t * 3) % 2 === 0 ? '|' : ''}
            </text>
            {spin ? <circle cx={380} cy={0} r={22} fill="none" stroke="#64748B" strokeWidth={6} strokeDasharray="40 100" transform={`rotate(${t * 500} 380 0)`} /> : null}
          </g>
          {nf > 0.01 ? (
            <g transform={`translate(540 ${960 + 20 * (1 - Math.min(1, nf))}) scale(${0.7 + 0.3 * Math.min(1.08, nf)})`} opacity={Math.min(1, nf * 1.6)}>
              <path d="M 0 140 C -110 20 -110 -120 0 -120 C 110 -120 110 20 0 140 Z" fill={C4.red} stroke="#0B0B0B" strokeWidth={8} />
              <text y={-6} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={120} fill="#FFFFFF">
                ?
              </text>
              <OutText x={0} y={250} size={60} fill="#FCA5A5" text="NO SE ENCUENTRA" stroke={9} />
            </g>
          ) : null}
        </svg>
      </AbsoluteFill>
    );
  }
  // streets: the three buildings joined by glowing streets; on "calles" the streets go dark and break
  const calles = num(mark('calles'), 1.6);
  const cut = t >= calles;
  const ck = cut ? clamp((t - calles) / 0.3) : 0;
  const spark = cut ? Math.max(0, 1 - (t - calles) / 0.35) : 0;
  const streets: [number, number][] = [
    [0, 1],
    [1, 2],
    [0, 2],
  ];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <NightRoom t={t} id="st4" alarm={cut ? 0.7 : 0} />
        {streets.map(([a, b], i) => {
          const A = BUILD[a];
          const B = BUILD[b];
          const y = i === 2 ? 1230 : 1110;
          const d = i === 2 ? `M ${A.x} ${A.y + 220} L ${A.x} ${y} L ${B.x} ${y} L ${B.x} ${B.y + 220}` : `M ${A.x} ${A.y + 220} L ${A.x} ${y} L ${B.x} ${y} L ${B.x} ${B.y + 220}`;
          return (
            <g key={i}>
              <path d={d} stroke={cut ? '#1E293B' : '#334155'} strokeWidth={34} fill="none" strokeLinejoin="round" opacity={1 - 0.7 * ck} />
              {!cut ? <path d={d} stroke={C4.yellow} strokeWidth={8} fill="none" pathLength={1} strokeDasharray="0.03 0.05" strokeDashoffset={-t * 0.8} /> : null}
              {spark > 0 ? (
                <g>
                  {Array.from({ length: 8 }, (_, j) => {
                    const mx = (A.x + B.x) / 2;
                    const a2 = (j / 8) * Math.PI * 2;
                    return <line key={j} x1={mx} y1={y} x2={mx + Math.cos(a2) * 70 * (1.4 - spark)} y2={y + Math.sin(a2) * 70 * (1.4 - spark)} stroke={j % 2 ? C4.yellow : '#FFF'} strokeWidth={6} opacity={spark} strokeLinecap="round" />;
                  })}
                </g>
              ) : null}
              {cut ? <line x1={(A.x + B.x) / 2 - 40} y1={y - 40} x2={(A.x + B.x) / 2 + 40} y2={y + 40} stroke={C4.red} strokeWidth={14} strokeLinecap="round" opacity={ck} /> : null}
            </g>
          );
        })}
        {BUILD.map((b, i) => (
          <g key={b.k} transform={`translate(0 ${3 * Math.sin(t * 2 + i)})`}>
            <rect x={b.x - 110} y={b.y + 220 - b.h} width={220} height={b.h} rx={10} fill="#0F172A" stroke={cut ? '#475569' : b.c} strokeWidth={8} />
            {Array.from({ length: Math.floor((b.h - 160) / 70) }, (_, r) => (
              <g key={r}>
                <rect x={b.x - 80} y={b.y + 220 - b.h + 140 + r * 70} width={60} height={40} rx={6} fill={cut ? '#111827' : '#FDE68A'} opacity={cut ? 1 : 0.85} />
                <rect x={b.x + 20} y={b.y + 220 - b.h + 140 + r * 70} width={60} height={40} rx={6} fill={cut ? '#111827' : '#FDE68A'} opacity={cut ? 1 : 0.85} />
              </g>
            ))}
            <AppGlyph kind={b.k} x={b.x} y={b.y + 220 - b.h + 60} r={52} on={cut ? 0 : 1} />
          </g>
        ))}
        {cut ? <Stamp k={springAt(f, fps, calles + 0.1, HARD)} x={540} y={430} label="SIN CALLES" color={C4.red} w={600} size={84} rot={-4} /> : null}
      </svg>
    </AbsoluteFill>
  );
};
