# Monta a linha do tempo final do Ep. 7 a partir do áudio: cada frase ocupa o trecho de animação dela, com a duração exata da fala.
# Saídas: tmap.js (tempo novo -> tempo da animação), subs.js (legendas no tempo novo), narr/mapa.json, narr/narr_pos.wav, out/render_list.txt
import json, re, subprocess, sys, wave
import numpy as np
sys.path.insert(0, '.')
from frases7 import F
FPS = 24
SEG = [('a01', 11.5), ('b01', 12.2), ('c01', 17.0), ('d01', 25.5), ('e01', 27.5), ('f01', 17.3), ('g01', 15.7), ('h01', 12.5), ('i01', 8.0)]
st = {}; acc = 0.0
for n, d in SEG: st[n] = acc; acc += d
OLD = acc
# (trecho, início, fim no tempo da animação, âncoras internas [(trecho de texto, tempo local)])
C = [('a01', .2, 3.5), ('a01', 3.8, 8.2), ('a01', 8.4, 11.3),
 ('b01', .2, 3.0), ('b01', 3.2, 4.8), ('b01', 5.0, 7.4), ('b01', 7.6, 8.8), ('b01', 9.0, 10.4),
 ('c01', .2, 2.5), ('c01', 2.7, 6.2), ('c01', 6.4, 10.3), ('c01', 10.5, 11.2), ('c01', 11.4, 15.2),
 ('d01', .2, 2.4), ('d01', 2.6, 8.6), ('d01', 8.7, 9.25), ('d01', 9.6, 11.6), ('d01', 11.8, 14.9), ('d01', 15.1, 19.8), ('d01', 20.0, 23.5),
 ('e01', .2, 2.0), ('e01', 2.2, 9.0), ('e01', 9.2, 13.9), ('e01', 14.1, 19.8), ('e01', 20.0, 21.9), ('e01', 22.1, 25.5),
 ('f01', .2, 4.6), ('f01', 4.8, 9.0), ('f01', 9.2, 10.5), ('f01', 10.7, 12.0), ('f01', 12.2, 15.4),
 ('g01', .2, 4.5), ('g01', 4.7, 6.2), ('g01', 6.4, 10.6), ('g01', 10.8, 13.8),
 ('h01', .2, 2.9), ('h01', 3.1, 8.4), ('h01', 8.6, 12.3),
 ('i01', .3, 1.0), ('i01', 1.2, 4.2)]
assert len(C) == len(F), (len(C), len(F))
A = json.load(open('narr/frases_audio.json'))['seg']
def wl(t): return len(re.sub(r'[^a-zA-ZÀ-ÿ0-9]', '', t)) + 2.0 * len(re.findall(r'[,;:]|\.\.\.', t))
LEAD = .08; TAILP = .10
bp = [[0.0, 0.0]]; new = 0.0; old = 0.0; starts = []; rows = []
for i, (c, t) in enumerate(zip(C, F)):
    va, vb = st[c[0]] + c[1], st[c[0]] + c[2]; a, e = A[i]; d = e - a
    assert va >= old - 1e-6, (i, va, old)
    new += va - old; bp.append([va, new]); s0 = new + LEAD; starts.append(s0)
    for ph, tl in (c[3] if len(c) > 3 else []):
        k = t.index(ph); fr = wl(t[:k]) / wl(t); bp.append([st[c[0]] + tl, s0 + fr * d - .15])
    new = s0 + d + TAILP; bp.append([vb, new]); old = vb
    rows.append((i, c[0], (vb - va) / (d + LEAD + TAILP)))
new += OLD - old; bp.append([OLD, new])
for a, b in zip(bp, bp[1:]): assert b[0] >= a[0] - 1e-6 and b[1] >= a[1] - 1e-6, (a, b)
o = np.array([b[0] for b in bp]); nw = np.array([b[1] for b in bp])
# fronteiras de cena em quadros inteiros
segn = []; cuts = [0.0]
for n, d in SEG: cuts.append(round(float(np.interp(st[n] + d, o, nw)) * FPS) / FPS)
allb = sorted(set([(round(a, 4), round(b, 4)) for a, b in bp if all(abs(a - (st[n] + d)) > 1e-6 for n, d in SEG)] + [(round(st[n] + d, 4), cuts[i + 1]) for i, (n, d) in enumerate(SEG)]))
bp = [list(x) for x in allb]; TOT = cuts[-1]
open('tmap.js', 'w').write('window.TMAP = ' + json.dumps(bp) + ';\n')
json.dump({'bp': bp, 'starts': starts, 'total': TOT, 'cuts': cuts}, open('narr/mapa.json', 'w'))
open('out/render_list.txt', 'w').write(' '.join(f'{n}:{cuts[i]:.5f}:{cuts[i+1]:.5f}' for i, (n, d) in enumerate(SEG)))
# legendas
def chunks(t, mx=40):
    out = ['']
    for x in t.split():
        c = (out[-1] + ' ' + x).strip()
        if len(c) > mx and out[-1]: out.append(x)
        elif out[-1].endswith((',', ':', ';')) and len(out[-1]) > mx * .55: out.append(x)
        else: out[-1] = c
    if len(out) > 1 and len(out[-1]) < 12: last = out.pop(); out[-1] += ' ' + last
    return out
subs = []
for i, t in enumerate(F):
    d = A[i][1] - A[i][0]; ch = chunks(t); tot = sum(wl(c) for c in ch); x = starts[i]
    for c in ch:
        dd = d * wl(c) / tot; end = x + dd + (.3 if c is ch[-1] else 0)
        if c is ch[-1] and i + 1 < len(F): end = min(end, starts[i + 1] - .02)
        subs.append({'a': round(x - .05, 2), 'b': round(end, 2), 'text': c}); x += dd
open('subs.js', 'w').write('window.SUBS = ' + json.dumps(subs, ensure_ascii=False) + ';\n')
# narração reposicionada
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'narr/narr.mp3', '-ac', '1', '-ar', '44100', 'narr/narr.wav'], check=True)
w = wave.open('narr/narr.wav'); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768; SR = 44100
y = np.zeros(int(TOT * SR) + SR)
for i, (a, e) in enumerate(A):
    a0 = max(0, a - .04); e0 = e + .08; clip = x[int(a0 * SR):int(e0 * SR)].copy(); f = int(.02 * SR); clip[:f] *= np.linspace(0, 1, f); clip[-f:] *= np.linspace(1, 0, f)
    p = int((starts[i] - .04) * SR); y[p:p + len(clip)] += clip
y = y[:int(TOT * SR)]; ww = wave.open('narr/narr_pos.wav', 'wb'); ww.setnchannels(1); ww.setsampwidth(2); ww.setframerate(SR); ww.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes()); ww.close()
print('total novo %.2f s (animação %.1f s), %d legendas' % (TOT, OLD, len(subs)))
for i, n, r in rows:
    if r > 1.6 or r < .6: print('  velocidade %.2fx frase %d (%s) %s' % (r, i, n, F[i][:40]))
