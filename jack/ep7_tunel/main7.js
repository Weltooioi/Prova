// Linha do tempo do Ep. 7 (túnel de rodovia): um trecho por tentativa (um arquivo por trecho no render).
const SEGS = [['a01', A01, 11.5], ['b01', B01, 12.2], ['c01', C01, 17.0], ['d01', D01, 25.5], ['e01', E01, 27.5], ['f01', F01, 17.3], ['g01', G01, 15.7], ['h01', H01, 12.5], ['i01', I01, 8.0]];
{ let acc = 0; for (const s of SEGS) { s.push(acc); acc += s[2]; } window.DUR = acc; window.SEGINFO = SEGS.map(s => ({ name: s[0], start: s[3], dur: s[2] })); }
function drawTitle(c, k) { c.save(); c.globalAlpha = k; c.textAlign = 'center'; c.fillStyle = '#fff'; c.shadowColor = 'rgba(120,200,255,.9)'; c.shadowBlur = 18; c.font = '600 30px "DejaVu Sans", Arial, sans-serif'; c.fillText('O CURIOSO', 360, 600); c.font = '800 96px "DejaVu Sans", Arial, sans-serif'; c.fillText('JACK', 360, 700); c.fillRect(250, 728, 220, 4); c.restore(); }
function drawLeader(c, L) { const p = proj(L.p); c.save(); c.globalAlpha = L.k; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(L.x, L.y + 22); c.lineTo(p[0], p[1]); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(p[0], p[1], 6, 0, 7); c.fill();
  c.font = '800 24px "DejaVu Sans", Arial, sans-serif'; c.textAlign = 'center'; const w = c.measureText(L.txt).width + 34; c.fillStyle = L.col || 'rgba(12,22,38,.85)'; c.beginPath(); c.roundRect(L.x - w / 2, L.y - 24, w, 48, 24); c.fill(); c.fillStyle = '#fff'; c.fillText(L.txt, L.x, L.y + 9); c.restore(); }
function warp(T) { const M = window.TMAP; if (!M) return T; let i = 1; while (i < M.length - 1 && M[i][1] < T) i++; const a = M[i - 1], b = M[i]; return a[0] + (b[0] - a[0]) * Math.min(1, Math.max(0, (T - a[1]) / Math.max(1e-6, b[1] - a[1]))); }
window.scene = function (TN) {
  const T = warp(TN); beginFrame(T); setSky(0); R.fx = 0; R.chip = null; R.leaders = []; R.fade = 0; R.title = 0; R.ov2 = null; R.recap = null;
  const sg = SEGS.find(s => T < s[3] + s[2] - 1e-6) || SEGS[SEGS.length - 1]; sg[1](T - sg[3], sg[3]); const frame = Math.round(TN * 24);
  R.overlay = c => { if (R.fx > 0) rewindFX(c, R.fx, frame); else { if (R.chip) chip(c, R.chip[0], R.chip[1]); for (const L of R.leaders) if (L.k > 0) drawLeader(c, L); if (R.ov2) R.ov2(c); if (R.recap) drawRecap(c, R.recap, frame); }
    drawSub(c, TN); if (R.fade > 0) { c.fillStyle = `rgba(4,6,10,${R.fade})`; c.fillRect(0, 0, 720, 1280); } if (R.title > 0) drawTitle(c, R.title); };
};
