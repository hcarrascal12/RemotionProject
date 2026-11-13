import React from 'react';
import { AbsoluteFill } from 'remotion';
import { DepthBackdrop } from '../Backdrop';
import { COLOR, ease, HARD, HEAVY, lin, MONO, rand, ShotProps, springAt } from '../motion';
import { Bsod, BLUE, BLUE_DEEP, Monitor, PcTile, Stamp, Strip } from './parts';

// The flat vector scenes of Fallo #02. Every scene gets its own clock (t, f), its length (dur) and the plan's marks on
// that clock, exactly like the Therac-25 scenes. Elements stay between y 250 and 1560 (the apps cover the rest).

const num = (v: number, fallback: number) => (Number.isFinite(v) ? v : fallback);
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

const Frame: React.FC<{ t: number; color?: string; glow?: number; children: React.ReactNode }> = ({ t, color = COLOR.cyan, glow = 0.16, children }) => (
  <AbsoluteFill>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <rect width={1080} height={1920} fill={BLUE_DEEP} />
      <DepthBackdrop t={t} color={color} glow={glow} cy={960} />
      {children}
    </svg>
  </AbsoluteFill>
);

// ---------- 3. "Prendes tu computadora y la pantalla se pone azul" ----------
export const BsodScene: React.FC<ShotProps> = ({ t, f, fps, dur, mark }) => {
  const azul = num(mark('azul'), 0.9);
  const k = springAt(f, fps, azul - 0.05, HARD);
  const on = t >= azul - 0.12;
  const flick = on && t < azul + 0.35 ? (rand(Math.floor(t * 30)) > 0.5 ? 1 : 0.3) : 1;
  const w = 880;
  const h = 560;
  const pct = Math.min(100, 8 + 30 * lin(t, azul, azul + 2.2));
  return (
    <Frame t={t}>
      <g transform={`translate(540 960) scale(${0.6 + 0.4 * Math.min(1, k)}) translate(-540 -960)`}>
        <Monitor x={100} y={640} w={w}>
          {on ? <g opacity={flick}><Bsod x={0} y={0} w={w} h={h} t={t} pct={pct} /></g> : <rect width={w} height={h} fill="#E9EEF5" />}
        </Monitor>
      </g>
      <Stamp k={springAt(f, fps, azul + 0.2, HARD)} x={540} y={400} label="PANTALLA AZUL" color={COLOR.cyan} w={860} size={118} />
    </Frame>
  );
};

// ---------- 4/5. "Tu vuelo no sale. Tu banco no abre." ----------
export const TravelScene: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const vuelo = num(mark('vuelo'), 0.1);
  const banco = num(mark('banco'), 1.2);
  const kb = springAt(f, fps, banco - 0.1, HARD);
  const rows = [
    ['AV 204', 'BOGOTÁ', '08:15'],
    ['LA 551', 'MIAMI', '08:40'],
    ['IB 6302', 'MADRID', '09:05'],
    ['CM 118', 'PANAMÁ', '09:30'],
  ];
  return (
    <Frame t={t} color={COLOR.red} glow={0.12}>
      <g transform="translate(90 300)">
        <rect width={900} height={520} rx={24} fill="#0B1220" stroke="#27405F" strokeWidth={6} />
        <text x={36} y={64} fontFamily={MONO} fontSize={38} fill={COLOR.yellow}>
          SALIDAS
        </text>
        {rows.map(([code, city, hour], i) => {
          const cancelled = t > vuelo + 0.12 * i;
          return (
            <g key={code} transform={`translate(0 ${110 + i * 100})`}>
              <text x={36} y={0} fontFamily={MONO} fontSize={34} fill="#DCEBFF">{code}</text>
              <text x={230} y={0} fontFamily={MONO} fontSize={34} fill="#DCEBFF">{city}</text>
              <text x={560} y={0} fontFamily={MONO} fontSize={34} fill="#9FB4C7">{hour}</text>
              <rect x={680} y={-36} width={190} height={50} rx={8} fill={cancelled ? COLOR.red : '#1B2A40'} />
              <text x={775} y={0} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={30} fill="#FFF">
                {cancelled ? 'CANCELADO' : 'A TIEMPO'}
              </text>
            </g>
          );
        })}
      </g>
      <g transform={`translate(540 1010) scale(${0.5 + 0.5 * Math.min(1, kb)})`} opacity={Math.min(1, kb * 1.4)}>
        <rect x={-400} y={-150} width={800} height={300} rx={24} fill="#0B1220" stroke="#27405F" strokeWidth={6} />
        <path d="M -90 -20 L 0 -90 L 90 -20 Z" fill="#9FB4C7" />
        {[-60, -20, 20, 60].map((cx) => (
          <rect key={cx} x={cx - 9} y={-14} width={18} height={56} fill="#9FB4C7" />
        ))}
        <rect x={-110} y={42} width={220} height={14} fill="#9FB4C7" />
        <rect x={-330} y={72} width={660} height={56} rx={10} fill={COLOR.red} />
        <text y={114} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={42} fill="#FFF">
          FUERA DE SERVICIO
        </text>
      </g>
    </Frame>
  );
};

// ---------- 6. "Una empresa de seguridad envía una actualización" ----------
export const UpdateScene: React.FC<ShotProps> = ({ t, f, fps, dur, mark }) => {
  const envia = num(mark('envia'), 0.8);
  const upd = num(mark('update'), 1.2);
  const k = springAt(f, fps, 0.05, HARD);
  const sent = ease(t, envia - 0.1, envia + 1.0);
  const cols = 6;
  const rowsN = 4;
  return (
    <Frame t={t} color={COLOR.cyan} glow={0.14}>
      <g transform={`translate(540 460) scale(${0.7 + 0.3 * Math.min(1, k)})`}>
        <rect x={-130} y={-150} width={260} height={300} rx={22} fill="#1B2A40" stroke="#3FD8FF" strokeWidth={6} />
        <path d="M 0 -110 L 80 -75 L 80 5 Q 80 60 0 100 Q -80 60 -80 5 L -80 -75 Z" fill="#0A6BD6" stroke="#FFF" strokeWidth={6} />
        <path d="M -30 0 L -8 24 L 36 -28" stroke="#FFF" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text y={-186} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={44} fill="#FFF">
          EMPRESA DE SEGURIDAD
        </text>
      </g>
      {/* the update file leaves and spreads over the grid of computers */}
      <g transform={`translate(${540 + 0 * sent} ${640 + 120 * sent})`} opacity={Math.min(1, sent * 4) * (1 - lin(sent, 0.9, 1))}>
        <rect x={-70} y={-48} width={140} height={96} rx={10} fill="#FFF" stroke={COLOR.cyan} strokeWidth={6} />
        <text y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={34} fill="#0A6BD6">
          .sys
        </text>
      </g>
      {Array.from({ length: cols * rowsN }, (_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const lit = t > upd + 0.1 + r * 0.14 + c * 0.04;
        return <PcTile key={i} x={94 + c * 150} y={740 + r * 120} s={1.0} state={lit ? 'ok' : 'off'} />;
      })}
    </Frame>
  );
};

// ---------- 7. "No es un ciberataque." ----------
export const NotAttackScene: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const cy = num(mark('ciberataque'), 0.9);
  const k = springAt(f, fps, 0.05, HARD);
  const x = springAt(f, fps, cy, HARD);
  return (
    <Frame t={t} color={COLOR.red} glow={0.14}>
      <g transform={`translate(540 760) scale(${0.7 + 0.3 * Math.min(1, k)})`} opacity={0.9}>
        {/* a hooded figure at a laptop, the cliché the viewer expects */}
        <path d="M -190 330 Q -200 40 0 -30 Q 200 40 190 330 Z" fill="#161C2A" stroke="#3A4560" strokeWidth={6} />
        <ellipse cx={0} cy={-90} rx={95} ry={110} fill="#161C2A" stroke="#3A4560" strokeWidth={6} />
        <ellipse cx={0} cy={-80} rx={62} ry={74} fill="#05070A" />
        <circle cx={-24} cy={-86} r={9} fill="#FF2A2A" />
        <circle cx={24} cy={-86} r={9} fill="#FF2A2A" />
        <rect x={-210} y={280} width={420} height={40} rx={8} fill="#2B3547" />
        <text y={430} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={84} fill="#9FB4C7" textLength={720} lengthAdjust="spacingAndGlyphs">
          CIBERATAQUE
        </text>
      </g>
      {x > 0.01 ? (
        <g transform={`translate(540 800) rotate(${-14 * (1 - Math.min(1, x))}) scale(${3 - 2 * x})`} opacity={Math.min(1, x * 1.5)}>
          <line x1={-380} y1={-330} x2={380} y2={430} stroke={COLOR.red} strokeWidth={36} strokeLinecap="round" />
          <line x1={380} y1={-330} x2={-380} y2={430} stroke={COLOR.red} strokeWidth={36} strokeLinecap="round" />
        </g>
      ) : null}
      <Stamp k={springAt(f, fps, cy + 0.25, HARD)} x={540} y={380} label="NO ES UN ATAQUE" color={COLOR.yellow} w={880} size={100} rot={-3} />
    </Frame>
  );
};

// ---------- 8. "Su error: pide el dato veintiuno de una lista de veinte." ----------
export const ListBug: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const start = 0.05;
  const dato = num(mark('dato'), 1.3);
  const v21 = num(mark('veintiuno'), 1.9);
  const v20 = num(mark('veinte'), 2.9);
  const crash = springAt(f, fps, v20 + 0.15, HARD);
  const filled = Math.min(20, Math.floor(lin(t, start, dato + 0.9, 0, 21)));
  const ptr = ease(t, dato - 0.1, v21 + 0.1);
  const bad = t > v21 + 0.1;
  const slotX = (i: number) => 110 + (i % 7) * 125;
  const slotY = (i: number) => 470 + Math.floor(i / 7) * 140;
  return (
    <Frame t={t} color={COLOR.green} glow={0.12}>
      <text x={540} y={350} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={96} fill="#FFF" textLength={900} lengthAdjust="spacingAndGlyphs">
        UNA LISTA DE 20
      </text>
      {Array.from({ length: 21 }, (_, i) => {
        const is21 = i === 20;
        const isFilled = i < filled;
        return (
          <g key={i} transform={`translate(${slotX(i)} ${slotY(i)})`}>
            <rect width={108} height={118} rx={14} fill={is21 ? (bad ? COLOR.red : '#1B2A40') : isFilled ? '#18C964' : '#1B2A40'} stroke={is21 && bad ? '#FFF' : '#3A4560'} strokeWidth={5} opacity={is21 && bad ? (Math.floor(t * 8) % 2 ? 1 : 0.5) : 1} />
            <text x={54} y={78} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill={isFilled || (is21 && bad) ? '#FFF' : '#52617E'}>
              {is21 ? (bad ? '?' : '21') : i + 1}
            </text>
          </g>
        );
      })}
      {/* the pointer that asks for the 21st */}
      <g transform={`translate(${slotX(20) + 54} ${slotY(20) + 118 + 80 - 70 * ptr})`} opacity={Math.min(1, ptr * 3)}>
        <path d="M 0 -20 L 40 40 L 12 40 L 12 110 L -12 110 L -12 40 L -40 40 Z" fill={COLOR.yellow} stroke="#000" strokeWidth={5} />
      </g>
      <Stamp k={crash} x={540} y={1130} label="NO EXISTE" sub="LA LISTA TIENE 20" color={COLOR.red} w={780} size={120} />
    </Frame>
  );
};

// ---------- 9. "Tu computadora no sabe qué hacer. Y se bloquea." ----------
export const CrashScene: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const bloquea = num(mark('bloquea'), 1.6);
  const crashed = t >= bloquea;
  const k = springAt(f, fps, bloquea, HARD);
  const w = 760;
  const h = w * 0.62;
  return (
    <Frame t={t} color={crashed ? COLOR.red : COLOR.cyan} glow={crashed ? 0.3 : 0.14}>
      <Monitor x={160} y={640} w={w}>
        {crashed ? (
          <Bsod x={0} y={0} w={w} h={h} t={t} pct={Math.min(100, 12 * (t - bloquea))} glitch={Math.max(0, 1 - (t - bloquea) / 0.8)} />
        ) : (
          <g>
            <rect width={w} height={h} fill="#E9EEF5" />
            <circle cx={w / 2} cy={h / 2} r={60} fill="none" stroke="#0A6BD6" strokeWidth={14} strokeDasharray="120 260" transform={`rotate(${t * 360} ${w / 2} ${h / 2})`} />
          </g>
        )}
      </Monitor>
      {/* question marks rise while the computer does not know what to do */}
      {!crashed
        ? Array.from({ length: 6 }, (_, i) => {
            const age = (t * 0.9 + i * 0.28) % 1.4;
            return (
              <text key={i} x={300 + i * 100} y={560 - age * 220} fontFamily={HEAVY} fontWeight={900} fontSize={110} fill={COLOR.yellow} stroke="#000" strokeWidth={8} paintOrder="stroke" opacity={1 - age / 1.4}>
                ?
              </text>
            );
          })
        : null}
      <Stamp k={k} x={540} y={420} label="SE BLOQUEA" color={COLOR.red} w={760} size={120} />
    </Frame>
  );
};

// ---------- 10. "Reinicias. Otra vez azul." ----------
export const RebootScene: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const re = num(mark('reinicias'), 0.1);
  const otra = num(mark('otraVez'), 1.5);
  const w = 760;
  const h = w * 0.62;
  const cycle = 1.1;
  const ph = ((t - re + cycle) % cycle) / cycle;
  const second = t >= otra - 0.15;
  const showBsod = second || ph > 0.62;
  const attempts = 1 + Math.floor(Math.max(0, t - re) / cycle) + (second ? 1 : 0);
  return (
    <Frame t={t} color={COLOR.cyan} glow={0.16}>
      <Monitor x={160} y={540} w={w}>
        {showBsod ? (
          <Bsod x={0} y={0} w={w} h={h} t={t} pct={Math.min(100, (ph / 0.38) * 100)} glitch={second && t < otra + 0.5 ? 0.8 : 0} />
        ) : (
          <g>
            <rect width={w} height={h} fill="#000" />
            <text x={w / 2} y={h / 2 - 20} textAnchor="middle" fontFamily={MONO} fontSize={44} fill="#FFF">
              REINICIANDO
            </text>
            <circle cx={w / 2} cy={h / 2 + 60} r={30} fill="none" stroke="#FFF" strokeWidth={8} strokeDasharray="70 130" transform={`rotate(${t * 540} ${w / 2} ${h / 2 + 60})`} />
          </g>
        )}
      </Monitor>
      <g transform="translate(540 380)">
        <rect x={-300} y={-70} width={600} height={140} rx={24} fill="#000000B0" stroke={COLOR.yellow} strokeWidth={8} />
        <text y={34} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={92} fill={COLOR.yellow}>
          {`INTENTO ${attempts}`}
        </text>
      </g>
    </Frame>
  );
};

// ---------- 11. "Como tú, ocho millones y medio de equipos." ----------
export const CountScene: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const ocho = num(mark('burst'), 0.5);
  const p = Math.min(1, Math.max(0, (t - (ocho - 0.2)) / 1.3));
  const value = 8500000 * Math.pow(p, 2);
  const cols = 8;
  const rowsN = 6;
  const total = cols * rowsN;
  const blueN = Math.floor(total * p);
  const k = springAt(f, fps, ocho - 0.1, HARD);
  return (
    <Frame t={t} color={COLOR.cyan} glow={0.18}>
      {Array.from({ length: total }, (_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const order = (r * 7 + c * 13) % total;
        return <PcTile key={i} x={70 + c * 118} y={690 + r * 82} s={0.82} state={order < blueN ? 'blue' : 'ok'} />;
      })}
      <g transform={`translate(540 480) scale(${0.8 + 0.2 * Math.min(1, k)})`}>
        <rect x={-440} y={-120} width={880} height={240} rx={28} fill="#000" stroke={COLOR.cyan} strokeWidth={10} />
        <text x={0} y={52} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={150} fill={p >= 1 ? COLOR.red : COLOR.yellow}>
          {fmt(value)}
        </text>
        <text x={0} y={-62} textAnchor="middle" fontFamily={MONO} fontSize={38} fill="#FFF">
          EQUIPOS BLOQUEADOS
        </text>
      </g>
      <text x={540} y={1190} textAnchor="middle" fontFamily={MONO} fontSize={30} fill="#9FB4C7">
        ESTIMACIÓN DE MICROSOFT
      </text>
    </Frame>
  );
};

// ---------- 12. "A los setenta y ocho minutos la retiran." ----------
export const ClockScene: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const min78 = num(mark('min78'), 0.6);
  const ret = num(mark('retiran'), 1.4);
  const p = Math.min(1, Math.max(0, (t - 0.1) / Math.max(0.5, ret - 0.1 + 0.1)));
  const mins = Math.round(78 * p);
  const k = springAt(f, fps, min78 - 0.1, HARD);
  const k2 = springAt(f, fps, ret, HARD);
  return (
    <Frame t={t} color={COLOR.yellow} glow={0.12}>
      <g transform={`translate(540 520) scale(${0.72 + 0.2 * Math.min(1, k)})`}>
        <circle r={230} fill="#0B1220" stroke={COLOR.yellow} strokeWidth={14} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={0} y1={-200} x2={0} y2={-182} stroke="#9FB4C7" strokeWidth={8} transform={`rotate(${i * 30})`} />
        ))}
        <line x1={0} y1={0} x2={0} y2={-190} stroke={COLOR.red} strokeWidth={14} strokeLinecap="round" transform={`rotate(${p * 468})`} />
        <circle r={18} fill={COLOR.red} />
      </g>
      <text x={540} y={900} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={190} fill="#FFF" stroke="#000" strokeWidth={12} paintOrder="stroke">
        {`${mins} MIN`}
      </text>
      <g transform="translate(90 960)">
        <rect width={900} height={36} rx={18} fill="#1B2A40" />
        <rect width={900 * p} height={36} rx={18} fill={COLOR.yellow} />
        <text x={0} y={90} fontFamily={MONO} fontSize={36} fill="#9FB4C7">04:09 UTC SE ENVÍA</text>
        <text x={900} y={90} textAnchor="end" fontFamily={MONO} fontSize={36} fill="#9FB4C7">05:27 UTC SE RETIRA</text>
      </g>
    </Frame>
  );
};

// ---------- 13. "Pero no desbloquea la tuya." ----------
export const LockedScene: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const tuya = num(mark('tuya'), 0.9);
  const w = 700;
  const h = w * 0.62;
  const bounce = Math.abs(Math.sin(t * 5)) * 60;
  const k = springAt(f, fps, tuya - 0.1, HARD);
  return (
    <Frame t={t} color={COLOR.red} glow={0.16}>
      <Monitor x={190} y={600} w={w}>
        <Bsod x={0} y={0} w={w} h={h} t={t} pct={Math.min(100, 20)} />
      </Monitor>
      {/* the fix tries to reach the computer and bounces off */}
      <g transform={`translate(${540 + 20 * Math.sin(t * 9)} ${400 - bounce * 0.4})`}>
        <rect x={-110} y={-60} width={220} height={120} rx={14} fill="#FFF" stroke="#18C964" strokeWidth={8} />
        <path d="M -40 0 L -12 28 L 44 -30" stroke="#18C964" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text y={100} textAnchor="middle" fontFamily={MONO} fontSize={32} fill="#FFF">LA SOLUCIÓN</text>
      </g>
      <g transform={`translate(540 880) scale(${0.8 + 0.5 * Math.min(1, k)})`} opacity={Math.min(1, k * 1.4)}>
        <rect x={-70} y={-40} width={140} height={110} rx={14} fill={COLOR.red} stroke="#FFF" strokeWidth={8} />
        <path d="M -38 -40 L -38 -90 Q -38 -140 0 -140 Q 38 -140 38 -90 L 38 -40" fill="none" stroke="#FFF" strokeWidth={16} />
        <circle cy={12} r={14} fill="#FFF" />
      </g>
      <Stamp k={springAt(f, fps, tuya + 0.1, HARD)} x={540} y={1180} label="NO LLEGA" color={COLOR.red} w={720} size={100} />
    </Frame>
  );
};

// ---------- 14. "Hay que arreglarla a mano, una por una." ----------
export const FixScene: React.FC<ShotProps> = ({ t, f, fps, mark }) => {
  const mano = num(mark('mano'), 0.9);
  const una = num(mark('unaporuna'), 1.5);
  const cols = 3;
  const rowsN = 3;
  const total = cols * rowsN;
  const fixed = Math.min(total, Math.floor(Math.max(0, t - (mano - 0.3)) / 0.22));
  const k = springAt(f, fps, mano - 0.1, HARD);
  const cur = Math.min(total - 1, fixed);
  const hx = 150 + (cur % cols) * 300 + 96;
  const hy = 600 + Math.floor(cur / cols) * 200 + 20;
  return (
    <Frame t={t} color={COLOR.green} glow={0.1}>
      {Array.from({ length: total }, (_, i) => (
        <PcTile key={i} x={150 + (i % cols) * 300} y={600 + Math.floor(i / cols) * 200} s={1.4} state={i < fixed ? 'fixed' : 'blue'} />
      ))}
      {/* a hand with a USB stick moves from one computer to the next */}
      <g transform={`translate(${hx} ${hy})`} opacity={fixed >= total ? 0 : Math.min(1, k * 2)}>
        <rect x={-14} y={-10} width={60} height={26} rx={4} fill="#DDE3EA" stroke="#000" strokeWidth={4} />
        <rect x={46} y={-4} width={26} height={14} fill="#FFD600" />
        <path d="M -14 3 L -84 40 Q -96 70 -60 78 L 0 48 Z" fill="#E8C9A8" stroke="#000" strokeWidth={4} />
      </g>
      <Stamp k={k} x={540} y={420} label="A MANO" color={COLOR.yellow} w={640} size={130} />
    </Frame>
  );
};
