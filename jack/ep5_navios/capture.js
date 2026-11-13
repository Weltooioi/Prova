// uso: node capture.js stills t1,t2,... outdir   |   node capture.js clip t0 t1 out.mp4
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const { spawn } = require('child_process');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || [ '/usr/bin/google-chrome', '/opt/pw-browsers/chromium' ].find(f => fs.existsSync(f)), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files', '--no-sandbox', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 720, height: 1280 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await p.goto('file://' + path.resolve(__dirname, process.env.PAGE || 'index.html')); await p.waitForFunction('window.READY===true && window.scene', null, { timeout: 30000 });
  const mode = process.argv[2]; const t0 = Date.now();
  if (mode === 'stills') {
    const ts = process.argv[3].split(',').map(Number), dir = process.argv[4]; fs.mkdirSync(dir, { recursive: true });
    for (const t of ts) { const d = await p.evaluate(t => renderFrame(t), t); fs.writeFileSync(`${dir}/s_${t.toFixed(2)}.jpg`, Buffer.from(d.split(',')[1], 'base64')); }
    console.log('stills', ts.length, 'sec/frame', ((Date.now() - t0) / 1000 / ts.length).toFixed(2));
  } else {
    const a = +process.argv[3], z = +process.argv[4], outf = process.argv[5], fps = 24; const tmp = outf.replace(/\.mp4$/, '.part.mp4');
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-vf', 'scale=1080:1920:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '19', '-preset', 'veryfast', '-movflags', '+faststart', tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round((z - a) * fps);
    for (let i = 0; i < n; i++) { const d = await p.evaluate(t => renderFrame(t), a + i / fps); if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); if (i % 48 === 0) console.log('frame', i, '/', n); }
    ff.stdin.end(); const code = await new Promise(r => ff.on('close', r)); if (code === 0) fs.renameSync(tmp, outf);
    console.log('clip', n, 'frames, sec/frame', ((Date.now() - t0) / 1000 / n).toFixed(2), 'exit', code);
  }
  await b.close();
})();
