// Linha do tempo: cada etapa é um trecho independente (um arquivo por etapa no render).
const SEGS = [['n01', N01, 8.8], ['n02', N02, 8.0], ['n03', N03, 7.2], ['n04', N04, 6.8], ['n05', N05, 7.4], ['n06', N06, 7.4], ['n07', N07, 8.0], ['n08', N08, 6.6], ['n09', N09, 5.2], ['n10', N10, 10.8], ['n11', N11, 7.6], ['n12', N12, 4.4], ['n13', N13, 5.4], ['n14', N14, 6.2], ['n15', N15, 3.7], ['n16', N16, 11.5], ['n17', N17, 10.0], ['n18', N18, 4.0], ['n19', N19, 9.0], ['n20', N20, 5.0], ['n21', N21, 12.2]];
{ let acc = 0; for (const s of SEGS) { s.push(acc); acc += s[2]; } window.DUR = acc; window.SEGINFO = SEGS.map(s => ({ name: s[0], start: s[3], dur: s[2] })); }
function drawTitle(c, k) { c.save(); c.globalAlpha = k; c.textAlign = 'center'; c.fillStyle = '#fff'; c.shadowColor = 'rgba(120,200,255,.9)'; c.shadowBlur = 18; c.font = '600 30px "DejaVu Sans", Arial, sans-serif'; c.fillText('O CURIOSO', 360, 600); c.font = '800 96px "DejaVu Sans", Arial, sans-serif'; c.fillText('JACK', 360, 700); c.fillRect(250, 728, 220, 4); c.restore(); }
function drawLeader(c, L) { const p = proj(L.p); c.save(); c.globalAlpha = L.k; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(L.x, L.y + 22); c.lineTo(p[0], p[1]); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(p[0], p[1], 6, 0, 7); c.fill();
  c.font = '800 24px "DejaVu Sans", Arial, sans-serif'; c.textAlign = 'center'; const w = c.measureText(L.txt).width + 34; c.fillStyle = L.col || 'rgba(12,22,38,.85)'; c.beginPath(); c.roundRect(L.x - w / 2, L.y - 24, w, 48, 24); c.fill(); c.fillStyle = '#fff'; c.fillText(L.txt, L.x, L.y + 9); c.restore(); }
window.scene = function (T) {
  beginFrame(T); setDay(); R.fx = 0; R.chip = null; R.leaders = []; R.fade = 0; R.title = 0; R.ov2 = null; R.recap = null;
  const sg = SEGS.find(s => T < s[3] + s[2] - 1e-6) || SEGS[SEGS.length - 1]; sg[1](T - sg[3], sg[3]); const frame = Math.round(T * 24);
  R.overlay = c => { if (R.fx > 0) rewindFX(c, R.fx, frame); else { if (R.chip) chip(c, R.chip[0], R.chip[1]); for (const L of R.leaders) if (L.k > 0) drawLeader(c, L); if (R.ov2) R.ov2(c); if (R.recap) drawRecap(c, R.recap, frame); }
    drawSub(c, T);
    if (R.fade > 0) { c.fillStyle = `rgba(4,6,10,${R.fade})`; c.fillRect(0, 0, 720, 1280); } if (R.title > 0) drawTitle(c, R.title); };
};
