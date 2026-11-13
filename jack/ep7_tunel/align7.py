# Alinha as frases ao áudio pelas pausas (sem reconhecimento de voz). Custo: duração de cada frase perto de letras/ritmo, preferindo pausas longas.
import json, subprocess, re, sys
sys.path.insert(0, '.')
from frases7 import F as txt
out = subprocess.run(['ffmpeg', '-i', 'narr/narr.mp3', '-af', 'silencedetect=n=-35dB:d=0.10', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', out)]; en = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', out)]
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', 'narr/narr.mp3'], capture_output=True, text=True).stdout)
sil = list(zip(st, en[:len(st)])); t0 = sil[0][1] if sil and sil[0][0] < .05 else 0.0; t1 = sil[-1][0] if sil and sil[-1][1] > dur - .1 else dur
cand = [s for s in sil if s[0] > t0 + .2 and s[1] < t1 - .2]
import unicodedata
def L(t): return len(re.sub(r'[^a-zA-ZÀ-ÿ0-9]', '', t)) + 2.0 * len(re.findall(r'[,;:]|\.\.\.', t[:-1]))     # letras + peso das pausas internas
w = [L(t) for t in txt]; n = len(txt) - 1; m = len(cand)
speech = (t1 - t0) - sum(e - s for s, e in cand if e - s > .3) ; rate = sum(w) / speech
INF = 1e9; cost = [[INF] * m for _ in range(n)]; back = [[-1] * m for _ in range(n)]
def segc(i, a, e): d = e - a; x = w[i] / rate; return abs(d - x) / (x ** .5) * 3.0 if d > .15 else INF
def pb(k): return -2.2 * min(.55, cand[k][1] - cand[k][0])
for k in range(m): cost[0][k] = segc(0, t0, cand[k][0]) + pb(k)
for j in range(1, n):
    for k in range(j, m):
        best, bk = INF, -1
        for q in range(j - 1, k):
            if cost[j - 1][q] >= INF: continue
            c = cost[j - 1][q] + segc(j, cand[q][1], cand[k][0])
            if c < best: best, bk = c, q
        if bk >= 0: cost[j][k] = best + pb(k); back[j][k] = bk
k = min(range(m), key=lambda q: cost[n - 1][q] + segc(n, cand[q][1], t1)); pick = [k]
for j in range(n - 1, 0, -1): k = back[j][k]; pick.append(k)
pick.reverse(); b = [cand[k] for k in pick]; seg = []; a = t0
for i, t in enumerate(txt):
    e = b[i][0] if i < n else t1; seg.append((round(a, 3), round(e, 3))); a = b[i][1] if i < n else None
for i, ((a, e), t) in enumerate(zip(seg, txt)): print(f'{i:2d} {a:7.2f}-{e:7.2f}  {e-a:5.2f}s  {w[i]/(e-a):5.1f}/s  pausa {(seg[i+1][0]-e if i < n else 0):.2f}  {t[:50]}')
json.dump({'seg': seg, 'sil': sil}, open('narr/frases_audio.json', 'w'))
