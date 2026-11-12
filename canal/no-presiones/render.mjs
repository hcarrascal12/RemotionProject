// Renders the SVG identity assets to PNG with the Chromium already in the environment.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
import { readFileSync } from 'node:fs';
const jobs = [['avatar.svg', 'avatar.png', 800, 800], ['banner.svg', 'banner-2560x1440.png', 2560, 1440]];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--no-sandbox'] });
for (const [src, out, w, h] of jobs) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const svg = readFileSync(src, 'utf8');
  await page.setContent(`<html><body style="margin:0;background:#000">${svg}</body></html>`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: w, height: h } });
  console.log('wrote', out);
  await page.close();
}
await browser.close();
