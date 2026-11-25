import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame } from 'remotion';
import { COL, FPS, H, HEAD, MONO, SAFE, SCENES, W, ci, punch, rnd, shake } from './theme';
import { Credit, Flash, Impact, Mono, Plate, Punch, RGBGlitch } from './ui';

const KYM = 'IMAGEN VIRAL · TIKTOK 2023 · AUTOR DESCONOCIDO · VÍA KNOW YOUR MEME';
const BEAR = { pos: '64% 50%', origin: '50% 70%' }; // el oso de portada-kym.jpg queda en x≈50%, y≈70% del encuadre vertical

/** El encuadre del oso que abre y cierra el vídeo: el último frame es igual al primero para que el loop enganche. */
export const BearShot: React.FC<{ zoom: number; y?: number }> = ({ zoom, y = -260 }) => (
  <Plate file="polar05/portada-kym.jpg" pos={BEAR.pos} origin={BEAR.origin} scale={zoom} y={y} bright={0.95} sat={0.85} tint="rgba(120,90,200,0.25)" />
);

/* ================================================================== */
/* 1 · GANCHO (0–6 s): la imagen real, empujando hacia el oso          */
/* ================================================================== */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 180], [1.55, 1.12], { extrapolateRight: 'clamp' }) * punch(f, [6, 96], 0.05);
  const glitch = (f >= 2 && f < 6) || (f >= 94 && f < 99);
  const s = shake(f, 6, 8, 6);
  return (
    <AbsoluteFill style={{ transform: `translate(${s.x}px, ${s.y}px)` }}>
      <RGBGlitch active={glitch}>
        <BearShot zoom={zoom} />
      </RGBGlitch>
      {/* un "2026" gigante y casi transparente detrás de todo, como una marca de agua del futuro */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 380, letterSpacing: '-0.05em', color: 'transparent', WebkitTextStroke: `2px ${COL.ice}`, opacity: ci(f, 10, 40, 0, 0.18) * (0.8 + 0.2 * Math.sin(f / 7)), transform: `translateY(${-f * 0.4}px)` }}>2026</div>
      <Impact at={[8]} y={1180} />
      <Punch text="UN MEME|*DEL FUTURO*" at={8} y={1040} size={150} />
      <Mono text="TIKTOK · 27 · MAR · 2023" at={22} y={1350} size={28} color={COL.ice} weight={800} pill />
      {f >= 8 ? <Credit text={KYM} /> : null}
      <Flash at={[96]} amp={0.35} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 2 · LA FRASE (6–12 s): la publicación original en un móvil 3D       */
/* ================================================================== */
const Icon: React.FC<{ d: string; label: string; y: number; hit?: boolean }> = ({ d, label, y, hit }) => (
  <div style={{ position: 'absolute', right: 18, top: y, width: 80, textAlign: 'center' }}>
    <svg width={56} height={56} viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 2px 6px #000)' }}>
      <path d={d} fill={hit ? '#FE2C55' : '#fff'} />
    </svg>
    <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 18, color: '#fff', textShadow: '0 2px 6px #000' }}>{label}</div>
  </div>
);
const HEART = 'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2 0 3.6 1.1 5.2 3 1.6-1.9 3.2-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z';
const BUBBLE = 'M12 3C6.5 3 2 6.9 2 11.6c0 2.6 1.4 4.9 3.6 6.5L5 21.5l4.1-2.1c.9.2 1.9.3 2.9.3 5.5 0 10-3.9 10-8.6S17.5 3 12 3z';
const SHARE = 'M14 4l8 7-8 7v-4.2C8.5 13.8 5 15.6 2 20c.9-5.6 4.1-10.5 12-11.6V4z';

export const Caption: React.FC = () => {
  const f = useCurrentFrame();
  const enter = spring({ frame: f, fps: FPS, config: { damping: 15, stiffness: 110 } });
  const ry = -14 + 10 * Math.sin(f / 40);
  const rx = 8 + 3 * Math.cos(f / 33);
  const liked = f >= 40;
  const glow = ci(f, 26, 40, 0, 1); // barrido sobre el texto ruso
  return (
    <AbsoluteFill style={{ transform: `scale(${punch(f, [2, 70], 0.04)})` }}>
      <Plate file="polar05/aurora-toklat.jpg" scale={interpolate(f, [0, 180], [1.3, 1.1])} bright={0.5} opacity={0.6} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230, height: 820, perspective: 1300 }}>
        <div style={{ position: 'absolute', left: (W - 600) / 2, top: 0, width: 600, height: 800, transform: `translateY(${(1 - enter) * 500}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${(1 - enter) * -10}deg)`, borderRadius: 54, background: 'linear-gradient(160deg, #2a3038, #0b0e12)', border: '3px solid #3b434d', boxShadow: `0 60px 120px rgba(0,0,0,0.9), 0 0 80px ${COL.ice}22`, padding: 18 }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 40, overflow: 'hidden', background: '#000' }}>
            <Img src={staticFile('polar05/meme-original-2023.png')} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '55% 50%', transform: `scale(${interpolate(f, [0, 180], [1.0, 1.12])})` }} />
            {/* barrido de luz sobre la frase en ruso */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: '80%', height: '14%', background: `linear-gradient(90deg, transparent ${glow * 100 - 30}%, ${COL.ice}55 ${glow * 100}%, transparent ${glow * 100 + 10}%)`, mixBlendMode: 'screen' }} />
            <Icon d={HEART} label={liked ? '371,8K' : '0'} y={250} hit={liked} />
            <Icon d={BUBBLE} label="ruso" y={360} />
            <Icon d={SHARE} label="2023" y={470} />
            <div style={{ position: 'absolute', left: 22, top: 22, fontFamily: MONO, fontWeight: 800, fontSize: 20, color: '#fff', textShadow: '0 2px 6px #000' }}>@gmd_arahis · 27/03/2023</div>
          </div>
        </div>
      </div>
      <Impact at={[70]} y={1200} color={COL.red} />
      <Punch text="«ESTE ES UN MEME DE|*NOVIEMBRE DE 2026*»" at={70} y={1090} size={96} accent={COL.red} />
      <Mono text="«TODAVÍA NO LO VAIS A ENTENDER»" at={112} y={1330} size={32} color={COL.frost} weight={800} />
      <Credit text="TIKTOK @gmd_arahis · VÍA KNOW YOUR MEME" />
      <Flash at={[40]} color="#FE2C55" amp={0.18} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 3 · LAS VISTAS (12–16,6 s): 3,1 millones… y nadie sabe quién la hizo */
/* ================================================================== */
export const Views: React.FC = () => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [2, 44], [0, 3.1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 4) }) * 10) / 10;
  const landed = f >= 44;
  const pop = spring({ frame: f - 44, fps: FPS, config: { damping: 9, stiffness: 240 } });
  const UNKNOWN = 66; // "Nadie sabe quién creó la imagen"
  const shrink = ci(f, UNKNOWN - 6, UNKNOWN + 4, 1, 0.55);
  return (
    <AbsoluteFill style={{ transform: `scale(${punch(f, [44, UNKNOWN], 0.05)})` }}>
      <Plate file="polar05/oso-sin-texto-2023.jpg" scale={interpolate(f, [0, 138], [1.15, 1.35])} pos="60% 60%" bright={0.7} sat={0.6} opacity={0.75} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: interpolate(shrink, [0.55, 1], [300, 560]), textAlign: 'center', transform: `scale(${shrink})`, transformOrigin: '50% 0%' }}>
        <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 260, letterSpacing: '-0.05em', color: landed ? COL.ice : COL.white, textShadow: `0 0 40px ${COL.ice}66, 0 8px 30px #000`, transform: `scale(${landed ? 1 + 0.12 * (1 - pop) : 1})` }}>{v.toFixed(1).replace('.', ',')} M</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, letterSpacing: 6, color: COL.frost, marginTop: -10 }}>REPRODUCCIONES · 6 MESES</div>
      </div>
      {f >= UNKNOWN ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 760, display: 'flex', justifyContent: 'center' }}>
          <div style={{ padding: '14px 34px', border: `6px solid ${COL.red}`, borderRadius: 14, fontFamily: HEAD, fontWeight: 900, fontSize: 64, color: COL.red, transform: `rotate(-6deg) scale(${interpolate(ci(f, UNKNOWN, UNKNOWN + 6, 0, 1), [0, 1], [2.6, 1])})`, opacity: ci(f, UNKNOWN, UNKNOWN + 3, 0, 1), background: 'rgba(4,7,12,0.85)', boxShadow: `0 0 40px ${COL.red}55` }}>AUTOR: ¿?</div>
        </div>
      ) : null}
      <Impact at={[UNKNOWN + 6]} y={830} color={COL.red} size={0.8} />
      <Punch text="NADIE SABE|QUIÉN *LA CREÓ*" at={UNKNOWN + 4} y={1040} size={130} />
      <Credit text={KYM} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 4 · LA LEYENDA (16,6–21,2 s): fechas, canciones, teorías            */
/* ================================================================== */
const MONTAGE: { file: string; pos?: string; red?: boolean }[] = [
  { file: 'polar05/bear-stroll.jpg' },
  { file: 'polar05/bear-snow.jpg' },
  { file: 'polar05/bear-churchill.jpg', pos: '50% 40%', red: true },
  { file: 'polar05/oso-sin-texto-2023.jpg', pos: '60% 60%' },
  { file: 'polar05/bear-pair.jpg' },
  { file: 'polar05/bear-churchill.jpg', pos: '50% 40%', red: true },
];
const DATES = [
  { t: '29.9.26', x: 230, y: 470, at: 6 },
  { t: '18.9.26', x: 800, y: 600, at: 16 },
  { t: 'НОЯБРЬ 2026', x: 300, y: 760, at: 26 },
  { t: '«YOYOYOYO»', x: 780, y: 880, at: 36 },
  { t: 'ЗИМА 2026', x: 520, y: 400, at: 46 },
];
export const Lore: React.FC = () => {
  const f = useCurrentFrame();
  const idx = Math.min(MONTAGE.length - 1, Math.floor(f / 11));
  const m = f < 66 ? MONTAGE[idx] : MONTAGE[2];
  const cut = f % 11 === 0 && f < 66;
  return (
    <AbsoluteFill style={{ transform: `scale(${punch(f, [0, 11, 22, 33, 44, 55, 66], 0.035)})` }}>
      <RGBGlitch active={cut || (f >= 64 && f < 69)} amp={20}>
        <Plate file={m.file} pos={m.pos} scale={1.25 + (f % 11) * 0.01} bright={0.7} sat={0.5} tint={m.red ? 'rgba(255,51,85,0.45)' : undefined} />
      </RGBGlitch>
      {DATES.map((d) => {
        if (f < d.at) return null;
        const k = spring({ frame: f - d.at, fps: FPS, config: { damping: 11, stiffness: 200 } });
        return (
          <div key={d.t} style={{ position: 'absolute', left: d.x, top: d.y, transform: `translate(-50%, -50%) scale(${k}) rotate(${(rnd(d.at) - 0.5) * 10}deg)`, opacity: Math.min(1, k * 1.5) * ci(f, 64, 70, 1, 0.25), padding: '10px 22px', borderRadius: 10, background: 'rgba(4,7,12,0.85)', border: `2px solid ${d.t.includes('YO') ? COL.ice : COL.red}`, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: d.t.includes('YO') ? COL.ice : COL.red, whiteSpace: 'nowrap', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>
            {d.t}
          </div>
        );
      })}
      <Impact at={[68]} y={1200} />
      <Punch text="UN MEME ENVIADO|DESDE *EL FUTURO*" at={66} y={1080} size={120} />
      <Flash at={[0, 11, 22, 33, 44, 55]} amp={0.22} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 5 · EL REGRESO (21,2–26,2 s): agosto de 2026, el oso canta          */
/* ================================================================== */
const LYRIC = ['REMEMBER,', 'NOVEMBER', '2026', 'IS', 'COMING'];
const LYRIC_AT = [70, 84, 98, 114, 120];
export const Back: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 150], [1.05, 1.3]) * punch(f, LYRIC_AT, 0.03);
  const singing = f >= 66 && f < 140;
  return (
    <AbsoluteFill>
      {/* fondo: la misma imagen, desenfocada; delante, el fotograma entero en su formato horizontal */}
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <Img src={staticFile('polar05/oso-cantando-2026.jpg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(30px) brightness(0.45) saturate(0.7)', transform: 'scale(1.2)' }} />
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 40, right: 40, top: 470, height: 563, borderRadius: 22, overflow: 'hidden', border: `3px solid ${COL.ice}`, boxShadow: `0 40px 100px rgba(0,0,0,0.8), 0 0 50px ${COL.ice}44`, transform: `rotate(${-1.5 + Math.sin(f / 18)}deg) scale(${interpolate(spring({ frame: f, fps: FPS, config: { damping: 12, stiffness: 150 } }), [0, 1], [1.3, 1])})` }}>
        <Img src={staticFile('polar05/oso-cantando-2026.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, filter: 'contrast(1.1) saturate(0.85)' }} />
        <div style={{ position: 'absolute', left: 16, top: 14, padding: '4px 10px', borderRadius: 6, background: COL.red, fontFamily: MONO, fontWeight: 800, fontSize: 18, color: '#fff', opacity: Math.floor(f / 10) % 2 ? 1 : 0.6 }}>● IA</div>
      </div>
      <Mono text="AGOSTO · 2026" at={4} y={330} size={34} color={COL.ice} weight={800} pill />
      <Mono text="VÍDEO HECHO CON IA · TIKTOK" at={14} y={392} size={22} color={COL.frost} />
      <Impact at={[2]} y={360} size={0.6} />
      {/* barras de canto */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1062, display: 'flex', justifyContent: 'center', gap: 6, opacity: ci(f, 60, 66, 0, 1) }}>
        {Array.from({ length: 36 }, (_, i) => {
          const h = singing ? 8 + 50 * Math.abs(Math.sin(f * 0.7 + i * 0.5)) * (0.4 + 0.6 * rnd(Math.floor(f / 2) * 13 + i)) : 6;
          return <div key={i} style={{ width: 10, height: h, borderRadius: 4, background: i % 6 === 2 ? COL.red : COL.ice, alignSelf: 'center' }} />;
        })}
      </div>
      <div style={{ position: 'absolute', left: SAFE.x - 20, right: SAFE.x - 20, top: 1130, textAlign: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 104, lineHeight: 1.02, letterSpacing: '-0.03em' }}>
        {LYRIC.map((w, i) => {
          const k = ci(f, LYRIC_AT[i], LYRIC_AT[i] + 5, 0, 1);
          const red = w === '2026' || w === 'NOVEMBER';
          return (
            <span key={w} style={{ display: 'inline-block', margin: '0 14px', opacity: k, transform: `translateY(${(1 - k) * 30}px) scale(${0.8 + 0.2 * k})`, color: red ? COL.red : COL.white, textShadow: red ? `0 0 26px ${COL.red}88, 0 6px 30px #000` : '0 6px 30px #000' }}>
              {w}
            </span>
          );
        })}
      </div>
      <Credit text="FOTOGRAMA DEL VÍDEO VIRAL (IA) · VÍA KNOW YOUR MEME" />
      <Flash at={[0]} amp={0.3} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 6 · YA ES NOVIEMBRE (26,2–29,2 s): el calendario llega al día de hoy */
/* ================================================================== */
const TODAY = 25;
export const Now: React.FC = () => {
  const f = useCurrentFrame();
  const enter = spring({ frame: f, fps: FPS, config: { damping: 13, stiffness: 140 } });
  const crossed = Math.floor(ci(f, 6, 40, 0, TODAY - 1, (x) => x));
  const hot = f >= 40;
  const s = shake(f, 40, 10, 8);
  return (
    <AbsoluteFill style={{ transform: `translate(${s.x}px, ${s.y}px) scale(${punch(f, [40], 0.06)})` }}>
      <Plate file="polar05/polar-darkness.jpg" scale={1.2} bright={0.45} sat={0.3} opacity={0.6} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, perspective: 1300 }}>
        <div style={{ margin: '0 auto', width: 760, transform: `translateY(${(1 - enter) * 400}px) rotateX(${14 - 8 * enter}deg) rotateY(${-8 + 4 * Math.sin(f / 20)}deg)`, borderRadius: 26, overflow: 'hidden', background: '#0C121A', border: `2px solid ${COL.border}`, boxShadow: '0 50px 110px rgba(0,0,0,0.85)' }}>
          <div style={{ padding: '22px 30px', background: COL.red, fontFamily: HEAD, fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: '-0.02em' }}>NOVIEMBRE 2026</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, padding: 22 }}>
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
              <div key={d} style={{ textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 22, color: COL.muted }}>{d}</div>
            ))}
            {Array.from({ length: 6 }, (_, i) => <div key={`b${i}`} />)}
            {Array.from({ length: 30 }, (_, i) => {
              const day = i + 1;
              const isToday = day === TODAY;
              const x = day <= crossed;
              return (
                <div key={day} style={{ position: 'relative', height: 66, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 32, color: isToday && hot ? '#fff' : x ? '#3a4654' : COL.white, background: isToday && hot ? COL.red : 'rgba(255,255,255,0.04)', boxShadow: isToday && hot ? `0 0 ${20 + 14 * Math.abs(Math.sin(f / 4))}px ${COL.red}` : undefined }}>
                  {day}
                  {x ? <div style={{ position: 'absolute', left: 8, right: 8, top: '50%', height: 4, background: COL.red, transform: 'rotate(-30deg)', opacity: 0.8 }} /> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Punch text="YA ES|*NOVIEMBRE DE 2026*" at={36} y={1130} size={130} accent={COL.red} />
      <Flash at={[40]} color="#FFD6DD" amp={0.25} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 7 · NO PASÓ NADA (29,2–33,4 s): anuncio ✕ · evento ✕ · autor ✕      */
/* ================================================================== */
const ROWS = [
  { label: 'ANUNCIO OFICIAL', at: 3 },
  { label: 'EVENTO', at: 36 },
  { label: 'AUTOR DE LA IMAGEN', at: 70 },
];
export const Nothing: React.FC = () => {
  const f = useCurrentFrame();
  const hits = ROWS.map((r) => r.at + 8);
  const s = hits.reduce((acc, h) => (acc.x || acc.y ? acc : shake(f, h, 9, 6)), { x: 0, y: 0 });
  return (
    <AbsoluteFill style={{ transform: `translate(${s.x}px, ${s.y}px) scale(${punch(f, hits, 0.04)})` }}>
      <Plate file="polar05/aurora-healy.jpg" scale={interpolate(f, [0, 126], [1.1, 1.3])} bright={0.45} sat={0.4} opacity={0.7} />
      <Mono text="NOVIEMBRE 2026 · RESULTADO" at={0} y={330} size={30} color={COL.ice} weight={800} />
      {ROWS.map((r, i) => {
        if (f < r.at) return null;
        const k = spring({ frame: f - r.at, fps: FPS, config: { damping: 14, stiffness: 170 } });
        const stamp = ci(f, r.at + 8, r.at + 13, 0, 1);
        return (
          <div key={r.label} style={{ position: 'absolute', left: 110, right: 110, top: 470 + i * 190, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px', borderRadius: 18, background: COL.card, border: `1px solid ${COL.border}`, borderLeft: `6px solid ${COL.red}`, transform: `translateX(${(1 - k) * -700}px)`, opacity: Math.min(1, k * 1.5), boxShadow: '0 30px 70px rgba(0,0,0,0.6)' }}>
            <span style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 54, color: COL.white, letterSpacing: '-0.02em' }}>{r.label}</span>
            <span style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 110, color: COL.red, opacity: stamp, transform: `scale(${2.4 - 1.4 * stamp}) rotate(-8deg)`, textShadow: `0 0 30px ${COL.red}` }}>✕</span>
          </div>
        );
      })}
      <Impact at={hits} y={1000} color={COL.red} size={0.7} />
      <Credit text="AURORA · NPS / DENALI · DOMINIO PÚBLICO" />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 8 · CIERRE (33,4–38 s): la pregunta y vuelta al oso (loop)          */
/* ================================================================== */
export const Loop: React.FC = () => {
  const f = useCurrentFrame();
  const END = SCENES.loop.len;
  // vuelve al encuadre exacto del frame 0 en los últimos frames
  const zoom = interpolate(f, [0, END - 20, END - 1], [1.08, 1.35, 1.55], { extrapolateRight: 'clamp' });
  const textOut = ci(f, END - 22, END - 10, 1, 0);
  const Q2 = 50;
  return (
    <AbsoluteFill>
      <BearShot zoom={zoom} />
      <AbsoluteFill style={{ opacity: textOut }}>
        <Impact at={[8, Q2]} y={1180} color={COL.red} />
        <Punch text="¿ERA SOLO|UNA *BROMA*?" at={8} y={1040} size={150} out={Q2} />
        <Punch text="¿O TODAVÍA|*FALTA ALGO*?" at={Q2} y={1040} size={150} accent={COL.red} />
        <Mono text="TU TEORÍA EN COMENTARIOS ↓" at={Q2 + 16} y={1350} size={30} color="#C3CED9" weight={800} />
      </AbsoluteFill>
      {f < END - 12 ? <Credit text={KYM} /> : null}
      <Flash at={[0]} amp={0.3} />
    </AbsoluteFill>
  );
};

export const SCENE_H = H;
