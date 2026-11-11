import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLOR, HARD, HEAVY, springAt } from './motion';

// Viral-style captions: centre-low, huge, extra-heavy capitals with a black outline and a hard shadow, at most two
// words per hit. The key word of each line jumps to 1.2x and turns neon yellow or danger red.

export type SubWord = { text: string; key: 'yellow' | 'red' | null };
export type SubChunk = { start: number; end: number; words: SubWord[] };

const KEY_COLOR = { yellow: COLOR.yellow, red: COLOR.red } as const;

export const DynamicSubtitles: React.FC<{ subs: SubChunk[]; f: number; fps: number; top?: number }> = ({ subs, f, fps, top = 1330 }) => {
  const t = f / fps;
  const chunk = subs.find((c) => t >= c.start && t < c.end);
  if (!chunk) return null;
  // width budget: key words are drawn at 1.2x, so they count for more
  const chars = chunk.words.reduce((n, w) => n + w.text.length * (w.key ? 1.25 : 1), 0) + (chunk.words.length - 1) * 0.6;
  const size = Math.min(150, 940 / (chars * 0.7));
  const pair = chunk.words.length > 1;
  const k = springAt(f, fps, chunk.start, HARD);
  const kKey = springAt(f, fps, chunk.start + 0.05, HARD);
  const float = Math.sin(t * 5) * 5;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top,
          left: 40,
          right: 40,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: size * 0.3,
          transform: `translateY(${(1 - k) * 60 + float}px) scale(${0.55 + 0.45 * k}) rotate(${(1 - k) * -5}deg)`,
        }}
      >
        {chunk.words.map((w, i) => {
          const isKey = w.key !== null;
          const s = isKey ? 1 + 0.2 * kKey : 1;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                fontFamily: HEAVY,
                fontWeight: 900,
                fontSize: size,
                lineHeight: 1,
                letterSpacing: -1,
                textTransform: 'uppercase',
                color: isKey ? KEY_COLOR[w.key as 'yellow' | 'red'] : '#FFFFFF',
                WebkitTextStroke: `${Math.round(size * 0.1)}px #000`,
                paintOrder: 'stroke fill',
                textShadow: `${Math.round(size * 0.06)}px ${Math.round(size * 0.08)}px 0 #000`,
                transform: `scale(${s})`,
                transformOrigin: '50% 60%',
                margin: isKey && pair ? `0 ${Math.round(size * 0.07 * w.text.length)}px` : 0,
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
