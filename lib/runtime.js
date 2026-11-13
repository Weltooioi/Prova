// Browser runtime. A film calls defineFilm({ setup, frame }).
// Contract: window.seek(t) paints frame t, synchronously, with no state carried between frames.
// In render mode (?render) nothing animates on its own; the renderer calls seek() per frame.
// In preview mode a scrubber + play button drive seek() and play score.wav alongside.

const params = new URLSearchParams(location.search);
export const RENDER = params.has('render');

export async function defineFilm({ setup, frame, fonts = [] }) {
  const base = new URL('.', location.href);
  const meta = await (await fetch(new URL('film.json', base))).json();
  let beats = { bpm: meta.bpm, beats: [], downbeats: [] };
  try {
    const r = await fetch(new URL('beats.json', base));
    if (r.ok) beats = await r.json();
  } catch {}
  await Promise.all(fonts.map((f) => document.fonts.load(f)));
  await document.fonts.ready;

  const canvas = document.createElement('canvas');
  canvas.width = meta.width;
  canvas.height = meta.height;
  canvas.id = 'film';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const film = { meta, beats: beats.beats, downbeats: beats.downbeats || [], bpm: beats.bpm, canvas, ctx };
  const env = (await setup?.(film)) || {};

  window.FILM = meta;
  window.seek = (t) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    frame(t, film, env);
  };
  window.seek(Number(params.get('t') || 0));
  if (!RENDER) mountPreview(meta);
  window.__ready = true;
}

function mountPreview(meta) {
  const style = document.createElement('style');
  style.textContent = `
    body{margin:0;background:#111;display:grid;place-items:center;min-height:100vh;font:12px "JetBrains Mono",monospace;color:#ddd}
    #film{max-height:calc(100vh - 60px);max-width:100vw;height:auto;width:auto}
    #bar{position:fixed;left:0;right:0;bottom:0;display:flex;gap:10px;align-items:center;padding:10px 16px;background:#000}
    #bar input{flex:1} #bar button{font:inherit;padding:4px 10px}`;
  document.head.appendChild(style);
  const bar = document.createElement('div');
  bar.id = 'bar';
  bar.innerHTML = `<button id=pp>play</button><input id=sc type=range min=0 max=${meta.duration} step=${1 / meta.fps} value=0><span id=tc>0.000</span>`;
  document.body.appendChild(bar);
  const audio = new Audio('score.wav');
  const sc = bar.querySelector('#sc'), tc = bar.querySelector('#tc'), pp = bar.querySelector('#pp');
  const show = (t) => { window.seek(t); sc.value = t; tc.textContent = t.toFixed(3); };
  sc.oninput = () => { audio.currentTime = +sc.value; show(+sc.value); };
  pp.onclick = () => {
    if (audio.paused) { audio.currentTime = +sc.value; audio.play(); pp.textContent = 'pause'; tick(); }
    else { audio.pause(); pp.textContent = 'play'; }
  };
  // Preview-only clock. Never used in render mode.
  function tick() {
    if (audio.paused) return;
    const t = Math.min(audio.currentTime, meta.duration);
    show(t);
    if (t < meta.duration) requestAnimationFrame(tick);
  }
}
