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
  const zoom = interpolate(f, [0, 120], [1.15, 1.6], { extrapolateRight: 'clamp' }) * punch(f, [8, 60, 96], 0.05);
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
  const ry = -8 + 6 * Math.sin(f / 40);
  const rx = 4 + 2 * Math.cos(f / 33);
  const MARK = 70; // recuadro rojo sobre la frase (cuando la voz dice "con una frase en ruso")
  const TITLE = 110; // la traducción, única línea de texto del plano
  const shrink = ci(f, TITLE - 8, TITLE + 4, 0.88, 0.66);
  const box = spring({ frame: f - MARK, fps: FPS, config: { damping: 10, stiffness: 220 } });
  // pantalla del móvil 724x1264: la publicación entera (1044x1166) cabe a 724x808, centrada a 228 px del borde superior
  const SCR = { w: 724, h: 1264, imgH: 808, imgTop: 228 };
  const PHR = { x: 0.13 * SCR.w, y: SCR.imgTop + 0.825 * SCR.imgH, w: 0.74 * SCR.w, h: 0.15 * SCR.imgH };
  return (
    <AbsoluteFill style={{ transform: `scale(${punch(f, [2, MARK + 2, TITLE], 0.045)})` }}>
      <Plate file="polar05/aurora-toklat.jpg" scale={interpolate(f, [0, 240], [1.3, 1.1])} bright={0.45} opacity={0.6} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 310, height: 1320, perspective: 1500 }}>
        <div style={{ position: 'absolute', left: (W - 760) / 2, top: 0, width: 760, height: 1300, transformOrigin: '50% 0%', transform: `translateY(${(1 - enter) * 700}px) scale(${shrink}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${(1 - enter) * -8}deg)`, borderRadius: 64, background: 'linear-gradient(160deg, #2a3038, #0b0e12)', border: '3px solid #3b434d', boxShadow: `0 60px 120px rgba(0,0,0,0.9), 0 0 80px ${COL.ice}22`, padding: 18 }}>
          <div style={{ position: 'relative', width: SCR.w, height: SCR.h, borderRadius: 48, overflow: 'hidden', background: '#000' }}>
            <Img src={staticFile('polar05/meme-original-2023.png')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(26px) brightness(0.55)', transform: 'scale(1.2)' }} />
            <div style={{ position: 'absolute', inset: 0, transformOrigin: `50% ${PHR.y}px`, transform: `scale(${1 + 0.18 * ci(f, MARK, TITLE - 6, 0, 1)})` }}>
              <Img src={staticFile('polar05/meme-original-2023.png')} style={{ position: 'absolute', left: 0, top: SCR.imgTop, width: SCR.w, height: SCR.imgH }} />
              {/* recuadro y flecha rojos sobre la frase en ruso */}
              {f >= MARK ? (
                <>
                  <div style={{ position: 'absolute', left: PHR.x - 10, top: PHR.y - 10, width: PHR.w + 20, height: PHR.h + 20, border: `6px solid ${COL.red}`, borderRadius: 16, transform: `scale(${1.4 - 0.4 * box})`, opacity: Math.min(1, box * 1.5), boxShadow: `0 0 ${20 + 10 * Math.sin(f / 4)}px ${COL.red}` }} />
                  <svg width={160} height={120} viewBox="0 0 160 120" style={{ position: 'absolute', left: PHR.x + PHR.w / 2 - 80, top: PHR.y - 150 - 14 * Math.abs(Math.sin(f / 5)), opacity: Math.min(1, box * 1.5) }}>
                    <path d="M80 6 V96 M40 62 L80 106 L120 62" fill="none" stroke={COL.red} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${COL.red})` }} />
                  </svg>
                </>
              ) : null}
            </div>
            <div style={{ position: 'absolute', left: 26, top: 30, fontFamily: MONO, fontWeight: 800, fontSize: 24, color: '#fff', textShadow: '0 2px 6px #000' }}>@gmd_arahis · 27/03/2023</div>
          </div>
        </div>
      </div>
      <Impact at={[TITLE]} y={1310} color={COL.red} />
      <Punch text="«ESTE ES UN MEME DE|*NOVIEMBRE DE 2026*»" at={TITLE} y={1200} size={96} accent={COL.red} />
      <Credit text="TIKTOK @gmd_arahis · VÍA KNOW YOUR MEME" />
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
  const UNKNOWN = 66; // "Nadie sabe quién creó la imagen": el número se va y queda una sola idea
  const numOut = ci(f, UNKNOWN - 6, UNKNOWN, 1, 0);
  return (
    <AbsoluteFill style={{ transform: `scale(${punch(f, [0, 44, UNKNOWN, 110], 0.05)})` }}>
      <Plate file="polar05/oso-sin-texto-2023.jpg" scale={interpolate(f, [0, 138], [1.15, 1.45])} pos="60% 60%" bright={0.7} sat={0.6} opacity={0.75} />
      {/* iconos de reproducción que suben sin parar mientras cuenta */}
      {Array.from({ length: 14 }, (_, i) => {
        const life = (f * 1.4 + i * 11) % 60;
        const x = 160 + rnd(i * 3.1) * 760;
        return <div key={i} style={{ position: 'absolute', left: x, top: 1000 - life * 9, fontSize: 38, color: COL.ice, opacity: (1 - life / 60) * 0.6 * ci(f, 0, 8, 0, 1) * numOut, fontFamily: MONO, fontWeight: 800 }}>▶</div>;
      })}
      {numOut > 0 ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: numOut, transform: `scale(${1 + 0.3 * (1 - numOut)})` }}>
          <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 300, letterSpacing: '-0.05em', color: landed ? COL.ice : COL.white, WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', textShadow: landed && f % 23 < 2 ? `-8px 0 ${COL.red}, 8px 0 ${COL.ice}` : `0 0 40px ${COL.ice}66, 0 8px 30px #000`, transform: `scale(${landed ? (1 + 0.12 * (1 - pop)) * (1 + 0.03 * Math.sin(f / 5)) : 1})` }}>{v.toFixed(1).replace('.', ',')}M</div>
          <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 64, letterSpacing: '-0.01em', color: COL.white, WebkitTextStroke: '6px #000', paintOrder: 'stroke fill', marginTop: -20 }}>DE VISUALIZACIONES</div>
        </div>
      ) : null}
      <Impact at={[UNKNOWN + 4]} y={1000} color={COL.red} />
      <Punch text="NADIE SABE|QUIÉN *LA CREÓ*" at={UNKNOWN + 2} y={880} size={130} />
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
  { t: '29.9.26', y: 560, at: 4, out: 33, red: true, size: 170 },
  { t: '18.9.26', y: 800, at: 18, out: 33, red: true, size: 170 },
  { t: 'НОЯБРЬ 2026', y: 660, at: 36, out: 64, red: true, size: 118 },
  { t: '= NOVIEMBRE 2026', y: 850, at: 50, out: 64, red: false, size: 76 },
];
export const Lore: React.FC = () => {
  const f = useCurrentFrame();
  const idx = Math.min(MONTAGE.length - 1, Math.floor(f / 11));
  const m = f < 66 ? MONTAGE[idx] : MONTAGE[2];
  const cut = f % 11 === 0 && f < 66;
  const HITS = [4, 18, 36, 50, 66]; // golpe de zoom con cada fecha (cada ~0,5 s) y con el titular
  return (
    <AbsoluteFill style={{ transform: `scale(${punch(f, HITS, 0.07)})` }}>
      <RGBGlitch active={cut || (f >= 64 && f < 69)} amp={20}>
        <Plate file={m.file} pos={m.pos} scale={1.25 + (f % 11) * 0.012} bright={0.62} sat={0.5} tint={m.red ? 'rgba(255,51,85,0.45)' : undefined} />
      </RGBGlitch>
      {DATES.map((d) => {
        if (f < d.at || f >= d.out) return null;
        const k = spring({ frame: f - d.at, fps: FPS, config: { damping: 11, stiffness: 220 } });
        const o = ci(f, d.out - 4, d.out, 1, 0);
        return (
          <div key={d.t} style={{ position: 'absolute', left: 0, right: 0, top: d.y, textAlign: 'center', transform: `scale(${2.2 - 1.2 * k}) rotate(${(rnd(d.at) - 0.5) * 6}deg)`, opacity: Math.min(1, k * 1.6) * o, fontFamily: HEAD, fontWeight: 900, fontSize: d.size, letterSpacing: '-0.03em', color: d.red ? COL.red : COL.white, WebkitTextStroke: `${d.red ? 12 : 7}px #000`, paintOrder: 'stroke fill', textShadow: d.red ? `0 0 40px ${COL.red}88` : '0 6px 20px #000', whiteSpace: 'nowrap' }}>
            {d.t}
          </div>
        );
      })}
      <Impact at={[68]} y={1180} />
      <Punch text="UN MEME ENVIADO|DESDE *EL FUTURO*" at={66} y={1060} size={120} />
      <Flash at={[0, 11, 22, 33, 44, 55]} amp={0.22} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 5 · EL REGRESO (21,2–26,2 s): agosto de 2026, el oso canta          */
/* ================================================================== */
const LYRIC = ['REMEMBER,', 'NOVEMBER', '|', '2026', 'IS', 'COMING'];
const LYRIC_AT = [70, 84, 0, 98, 114, 120];
export const Back: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 150], [1.05, 1.3]) * punch(f, LYRIC_AT.filter((x) => x > 0), 0.03);
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
      <Impact at={[2]} y={360} size={0.6} />
      {/* barras de canto */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1062, display: 'flex', justifyContent: 'center', gap: 6, opacity: ci(f, 60, 66, 0, 1) }}>
        {Array.from({ length: 36 }, (_, i) => {
          const h = singing ? 8 + 50 * Math.abs(Math.sin(f * 0.7 + i * 0.5)) * (0.4 + 0.6 * rnd(Math.floor(f / 2) * 13 + i)) : 6;
          return <div key={i} style={{ width: 10, height: h, borderRadius: 4, background: i % 6 === 2 ? COL.red : COL.ice, alignSelf: 'center' }} />;
        })}
      </div>
      <div style={{ position: 'absolute', left: SAFE.x - 30, right: SAFE.x - 30, top: 1130, textAlign: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 80, lineHeight: 1.08, letterSpacing: '-0.03em' }}>
        {[[0, 1], [3, 4, 5]].map((idxs, row) => (
          <div key={row} style={{ whiteSpace: 'nowrap' }}>
            {idxs.map((i) => {
              const w = LYRIC[i];
              const k = ci(f, LYRIC_AT[i], LYRIC_AT[i] + 5, 0, 1);
              const red = w === '2026' || w === 'NOVEMBER';
              return (
                <span key={w} style={{ display: 'inline-block', margin: '0 12px', opacity: k, transform: `translateY(${(1 - k) * 30}px) scale(${0.8 + 0.2 * k})`, color: red ? COL.red : COL.white, WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', textShadow: red ? `0 0 26px ${COL.red}88, 0 6px 30px #000` : '0 6px 30px #000' }}>
                  {w}
                </span>
              );
            })}
          </div>
        ))}
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
  const crossed = Math.floor(ci(f, 4, 30, 0, TODAY - 1, (x) => x));
  const hot = f >= 36;
  const s = shake(f, 36, 12, 8);
  return (
    <AbsoluteFill style={{ transform: `translate(${s.x}px, ${s.y}px) scale(${punch(f, [36], 0.08)})` }}>
      <Plate file="polar05/polar-darkness.jpg" scale={1.2} bright={0.45} sat={0.3} opacity={0.6} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, perspective: 1300 }}>
        <div style={{ margin: '0 auto', width: 760, transformOrigin: '72% 78%', transform: `translateY(${(1 - enter) * 400}px) rotateX(${14 - 8 * enter}deg) rotateY(${-8 + 4 * Math.sin(f / 20)}deg) scale(${1 + 0.16 * ci(f, 38, 90, 0, 1)})`, borderRadius: 26, overflow: 'hidden', background: '#0C121A', border: `2px solid ${COL.border}`, boxShadow: '0 50px 110px rgba(0,0,0,0.85)' }}>
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
      <Flash at={[36]} color="#FFD6DD" amp={0.35} />
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
    <AbsoluteFill style={{ transform: `translate(${s.x}px, ${s.y}px) scale(${punch(f, hits, 0.06)})` }}>
      <Plate file="polar05/aurora-healy.jpg" scale={interpolate(f, [0, 126], [1.1, 1.3])} bright={0.45} sat={0.4} opacity={0.7} />
      <Mono text="NOVIEMBRE 2026 · RESULTADO" at={0} y={330} size={30} color={COL.ice} weight={800} />
      {ROWS.map((r, i) => {
        if (f < r.at) return null;
        const k = spring({ frame: f - r.at, fps: FPS, config: { damping: 14, stiffness: 170 } });
        const stamp = ci(f, r.at + 8, r.at + 13, 0, 1);
        return (
          <div key={r.label} style={{ position: 'absolute', left: 110, right: 110, top: 470 + i * 190, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px', borderRadius: 18, background: COL.card, border: `1px solid ${COL.border}`, borderLeft: `6px solid ${COL.red}`, transform: `translateX(${(1 - k) * -700 + (i === 2 && f > r.at + 14 && f % 17 < 3 ? (f % 2 ? 12 : -12) : 0)}px) translateY(${Math.sin(f / 14 + i * 1.3) * 7}px) rotate(${Math.sin(f / 23 + i) * 0.8}deg)`, opacity: Math.min(1, k * 1.5), boxShadow: '0 30px 70px rgba(0,0,0,0.6)' }}>
            <span style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 54, color: COL.white, letterSpacing: '-0.02em' }}>{r.label}</span>
            <span style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 110, color: COL.red, opacity: stamp, transform: `scale(${2.4 - 1.4 * stamp}) rotate(-8deg)`, textShadow: `0 0 30px ${COL.red}` }}>✕</span>
          </div>
        );
      })}
      <Impact at={hits} y={1000} color={COL.red} size={0.7} />
      <Flash at={hits} color={COL.red} amp={0.22} />
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
  const zoom = interpolate(f, [0, END - 20, END - 1], [1.4, 1.2, 1.15], { extrapolateRight: 'clamp' });
  const textOut = ci(f, END - 22, END - 10, 1, 0);
  const Q2 = 50;
  return (
    <AbsoluteFill>
      <BearShot zoom={zoom} />
      <AbsoluteFill style={{ opacity: textOut }}>
        <Impact at={[8, Q2]} y={980} color={COL.red} />
        <Punch text="¿ERA SOLO|UNA *BROMA*?" at={8} y={850} size={150} out={Q2} />
        <Punch text="¿O TODAVÍA|*FALTA ALGO*?" at={Q2} y={850} size={150} accent={COL.red} />
        <Mono text="TU TEORÍA EN COMENTARIOS ↓" at={Q2 + 16} y={1150} size={34} color="#C3CED9" weight={800} pill />
      </AbsoluteFill>
      {f < END - 12 ? <Credit text={KYM} /> : null}
      <Flash at={[0]} amp={0.3} />
    </AbsoluteFill>
  );
};

export const SCENE_H = H;
