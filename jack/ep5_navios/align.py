# Alinha as 29 frases do texto ao áudio da narração usando as pausas detectadas (sem reconhecimento de voz).
import json, subprocess, re, sys
S = json.load(open('out/frases_tempos.json'))            # [início no vídeo, duração estimada, frase]
txt = [s[2] for s in S]
out = subprocess.run(['ffmpeg', '-i', 'narr/narr.mp3', '-af', 'silencedetect=n=-35dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', out)]; en = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', out)]
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', 'narr/narr.mp3'], capture_output=True, text=True).stdout)
sil = list(zip(st, en[:len(st)])); t0 = sil[0][1] if sil and sil[0][0] < .05 else 0.0; t1 = sil[-1][0] if sil and sil[-1][1] > dur - .1 else dur
cand = [s for s in sil if s[0] > t0 + .3 and s[1] < t1 - .3]
w = [len(t) + 6 for t in txt]; tot = sum(w); cum = 0; pred = []
for x in w[:-1]: cum += x; pred.append(t0 + (t1 - t0) * cum / tot)
# programação dinâmica: escolhe uma pausa por fronteira, em ordem, perto do previsto e preferindo pausas longas
n, m = len(pred), len(cand); INF = 1e9; cost = [[INF] * m for _ in range(n)]; back = [[-1] * m for _ in range(n)]
c = lambda j, k: abs((cand[k][0] + cand[k][1]) / 2 - pred[j]) - 6.0 * min(.6, cand[k][1] - cand[k][0])
for k in range(m): cost[0][k] = c(0, k)
for j in range(1, n):
    best, bk = INF, -1
    for k in range(m):
        if k > 0 and cost[j - 1][k - 1] < best: best, bk = cost[j - 1][k - 1], k - 1
        if bk >= 0: cost[j][k] = best + c(j, k); back[j][k] = bk
k = min(range(m), key=lambda q: cost[n - 1][q]); pick = [k]
for j in range(n - 1, 0, -1): k = back[j][k]; pick.append(k)
pick.reverse(); b = [cand[k] for k in pick]; seg = []; a = t0
for i, t in enumerate(txt):
    e = b[i][0] if i < n else t1; seg.append((round(a, 3), round(e, 3))); a = b[i][1] if i < n else None
for (a, e), t in zip(seg, txt): print(f'{a:7.2f}-{e:7.2f}  {e-a:5.2f}s  {len(t)/(e-a):5.1f} c/s  {t[:58]}')
json.dump(seg, open('narr/frases_audio.json', 'w'))
