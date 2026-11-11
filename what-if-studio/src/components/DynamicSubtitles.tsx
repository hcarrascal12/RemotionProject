import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLOR, HARD, HEAVY, SNAP, springAt } from './motion';

// Viral-style captions: centre-low, huge, extra-heavy capitals with a black outline and a hard shadow, short two-to-three word
// phrases that hold for about a second. The key word of each line jumps to 1.2x and turns neon yellow or danger red.

export type SubWord = { text: string; key: 'yellow' | 'red' | null };
export type SubChunk = { start: number; end: number; words: SubWord[] };

const KEY_COLOR = { yellow: COLOR.yellow, red: COLOR.red } as const;

export const DynamicSubtitles: React.FC<{ subs: SubChunk[]; f: number; fps: number; top?: number }> = ({ subs, f, fps, top = 1320 }) => {
  const t = f / fps;
  const chunk = subs.find((c) => t >= c.start && t < c.end);
  if (!chunk) return null;
  // Size: huge for short phrases, smaller when the phrase is long enough to wrap onto two lines. A key word is drawn
  // at 1.2x, so it counts for more, and no single word may be wider than the safe width.
  const chars = chunk.words.reduce((n, w) => n + w.text.length * (w.key ? 1.2 : 1), 0) + (chunk.words.length - 1);
  const longest = Math.max(...chunk.words.map((w) => w.text.length * (w.key ? 1.2 : 1)));
  const byLength = chars <= 11 ? 150 : chars <= 18 ? 128 : 112;
  const size = Math.min(byLength, 900 / (longest * 0.68));
  const k = springAt(f, fps, chunk.start, SNAP);
  const kKey = springAt(f, fps, chunk.start + 0.08, HARD);
  const float = Math.sin(t * 3) * 4;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top,
          left: 50,
          right: 50,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          columnGap: size * 0.26,
          rowGap: size * 0.08,
          transform: `translateY(${(1 - k) * 40 + float}px) scale(${0.7 + 0.3 * k})`,
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
                margin: isKey ? `0 ${Math.round(size * 0.06 * w.text.length * 0.5)}px` : 0,
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
