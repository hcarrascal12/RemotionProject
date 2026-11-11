// Storyboard stills for the Therac-25 short: one bundle, one still per requested time, then a contact sheet.
//   node tools/therac25_stills.mjs                 one still at the middle of every shot
//   node tools/therac25_stills.mjs 0.1 21.6 34.6   stills at these times (seconds)
// Writes out/therac25/board/*.png and out/therac25/storyboard.jpg.
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const timeline = JSON.parse(readFileSync(path.join(root, 'src/therac25/timeline.json'), 'utf8'));
const browserExecutable = process.env.BROWSER_EXECUTABLE || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const args = process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n));
const times = args.length
  ? args.map((t) => ({ label: `t${t.toFixed(2)}`, t }))
  : timeline.shots.map((s) => ({ label: s.id, t: s.start + (s.end - s.start) * 0.6 }));

const outDir = path.join(root, 'out/therac25/board');
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts') });
const composition = await selectComposition({ serveUrl, id: 'Therac25', browserExecutable });
for (const { label, t } of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps));
  const output = path.join(outDir, `${label}.png`);
  await renderStill({ composition, serveUrl, output, frame, browserExecutable, scale: Number(process.env.STILL_SCALE || 0.5), timeoutInMilliseconds: 240000 });
  console.log(`${label}  t=${t.toFixed(2)}s  frame ${frame}`);
}

const files = readdirSync(outDir).filter((f) => f.endsWith('.png')).sort();
const cols = Math.min(6, files.length);
execFileSync('ffmpeg', [
  '-v', 'error', '-y',
  ...files.flatMap((f) => ['-i', path.join(outDir, f)]),
  '-filter_complex',
  `${files.map((_, i) => `[${i}:v]scale=270:480,drawtext=text='${files[i].replace('.png', '')}':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6[v${i}]`).join(';')};${files.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${files.length}:layout=${files.map((_, i) => `${(i % cols) * 270}_${Math.floor(i / cols) * 480}`).join('|')}:fill=black`,
  '-frames:v', '1',
  path.join(root, 'out/therac25/storyboard.jpg'),
]);
console.log('Wrote out/therac25/storyboard.jpg');
