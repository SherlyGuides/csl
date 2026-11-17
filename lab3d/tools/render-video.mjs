// Render a raw, label-free, people-free looping walkthrough of the lab: smooth closed camera path through the
// reference shots (tools/shots.json order), slower inside the room and faster on the climb to the bird's eye.
// usage: node tools/render-video.mjs [seconds=30] [fps=30] [--preview]   -> renders/walkthrough-30s.mp4
import { createRequire } from 'module'; import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
const require = createRequire(path.join(process.env.HOME, 'Desktop/walkable/pipeline/package.json'));
const puppeteer = require('puppeteer-core');
const args = process.argv.slice(2), preview = args.includes('--preview'), nums = args.filter(a => !a.startsWith('--')).map(Number);
const SECS = nums[0] || 30, FPS = nums[1] || 30, N = SECS * FPS, W = preview ? 640 : 1920, H = preview ? 360 : 1080;
const here = path.dirname(new URL(import.meta.url).pathname), root = path.join(here, '..');
const frames = path.join(root, 'renders', preview ? 'frames-preview' : 'frames'); fs.rmSync(frames, { recursive: true, force: true }); fs.mkdirSync(frames, { recursive: true });
const shots = JSON.parse(fs.readFileSync(path.join(here, 'shots.json'), 'utf8'));
// extra waypoint after the kitchen: lift up and back while still facing the kitchen, then turn slowly on the climb to the bird's eye (clears the fans)
const way = [...shots, { name: 'rise', pos: [0.2, 4.5, 1.4], tgt: [-1.4, 0.5, 3.4], fov: 55 }];

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage(); await page.setViewport({ width: 1280, height: 800 });
page.on('pageerror', e => console.log('pageerror', e.message));
await page.goto('http://localhost:8080/lab3d/', { waitUntil: 'networkidle0', timeout: 120000 });
await page.waitForFunction(() => window.__lab && document.body.classList.contains('loaded'), { timeout: 120000 });
await new Promise(r => setTimeout(r, 8000));
await page.evaluate(async (way, N) => {
  const THREE = await import('three'), V = a => new THREE.Vector3(...a);
  const P = new THREE.CatmullRomCurve3(way.map(w => V(w.pos)), true, 'centripetal');
  const T = new THREE.CatmullRomCurve3(way.map(w => V(w.tgt)), true, 'centripetal');
  const F = new THREE.CatmullRomCurve3(way.map(w => new THREE.Vector3(w.fov, 0, 0)), true, 'catmullrom');
  // time warp: equal screen-motion per frame; move ~3x faster while high above the room
  const M = 6000, cost = [0]; let prev = P.getPoint(0), prevT = T.getPoint(0);
  for (let i = 1; i <= M; i++) { const u = i / M, p = P.getPoint(u), q = T.getPoint(u);
    const sp = 1 + 0.8 * THREE.MathUtils.smoothstep(Math.min(p.y, prev.y), 3.0, 8);
    cost.push(cost[i - 1] + (p.distanceTo(prev) + 0.35 * q.distanceTo(prevT)) / sp); prev = p; prevT = q; }
  const total = cost[M];
  window.__cam = (f) => { const c = (f / N) * total; let lo = 0, hi = M; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cost[m] <= c) lo = m; else hi = m; }
    const u = (lo + (c - cost[lo]) / Math.max(1e-9, cost[hi] - cost[lo])) / M; return { pos: P.getPoint(u).toArray(), tgt: T.getPoint(u).toArray(), fov: F.getPoint(u).x }; };
}, way, N);
const t0 = Date.now();
for (let f = 0; f < N; f++) {
  // the line-follower does exactly 3 laps in 30 s so the loop point matches
  const url = await page.evaluate((f, N, W, H, SECS) => { const c = window.__cam(f); return window.__lab.shot(c.pos, c.tgt, { w: W, h: H, fov: c.fov, time: (f / N) * (3 / 0.09) * (SECS / 30) }); }, f, N, W, H, SECS);
  fs.writeFileSync(path.join(frames, String(f).padStart(4, '0') + '.jpg'), Buffer.from(url.split(',')[1], 'base64'));
  if (f % 60 === 0) console.log(`frame ${f}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
await browser.close();
const out = path.join(root, 'renders', preview ? 'walkthrough-preview.mp4' : `walkthrough-${SECS}s.mp4`);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', String(FPS), '-i', path.join(frames, '%04d.jpg'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
console.log('wrote', out);
