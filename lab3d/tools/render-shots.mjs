// Render clean 1920x1080 reference stills of the lab (no UI, pins, labels or students).
// usage: node tools/render-shots.mjs [only-name-substring]   (needs the local server on :8080)
import { createRequire } from 'module'; import fs from 'fs'; import path from 'path';
const require = createRequire(path.join(process.env.HOME, 'Desktop/walkable/pipeline/package.json'));
const puppeteer = require('puppeteer-core');
const here = path.dirname(new URL(import.meta.url).pathname), out = path.join(here, '..', 'renders', 'reference');
fs.mkdirSync(out, { recursive: true });
const shots = JSON.parse(fs.readFileSync(path.join(here, 'shots.json'), 'utf8')).filter(s => !process.argv[2] || s.name.includes(process.argv[2]));
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--window-size=1280,800'] });
const page = await browser.newPage(); await page.setViewport({ width: 1280, height: 800 });
page.on('pageerror', e => console.log('pageerror', e.message));
await page.goto('http://localhost:8080/lab3d/', { waitUntil: 'networkidle0', timeout: 120000 });
await page.waitForFunction(() => window.__lab && document.body.classList.contains('loaded'), { timeout: 120000 });
await new Promise(r => setTimeout(r, 8000));   // hi-fi swaps + fixups
for (const s of shots) {
  const url = await page.evaluate((s) => window.__lab.shot(s.pos, s.tgt, { fov: s.fov, people: !!s.people }), s);
  const f = path.join(out, s.name + '.jpg'); fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); console.log('wrote', f);
}
await browser.close();
