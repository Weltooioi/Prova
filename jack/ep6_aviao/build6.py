# Monta a linha do tempo final do Ep. 6 a partir do áudio: cada frase ocupa o trecho de animação dela, com a duração exata da fala.
# Saídas: tmap.js (tempo novo -> tempo da animação), subs.js (legendas no tempo novo), narr/mapa.json, narr/narr_pos.wav, out/render_list.txt
import json, re, subprocess, sys, wave
import numpy as np
sys.path.insert(0, '.')
from frases6 import F
FPS = 24
SEG = [('a01', 8.0), ('a02', 7.0), ('a03', 3.0), ('b01', 10.9), ('b02', 6.6), ('c01', 8.6), ('c02', 6.4), ('c03', 3.4), ('d01', 10.6), ('e01', 7.6), ('f01', 8.4), ('g01', 9.2), ('h01', 12.6), ('i01', 11.2), ('j01', 15.2), ('k01', 10.2), ('l01', 9.6), ('m01', 12.6), ('n01', 17.4), ('o01', 11.0)]
st = {}; acc = 0.0
for n, d in SEG: st[n] = acc; acc += d
OLD = acc
# (trecho, início, fim no tempo da animação, âncoras internas [(trecho de texto, tempo local)])
C = [('a01', .2, 3.2), ('a01', 3.3, 7.7), ('a02', .2, 4.3), ('a03', .5, 2.6),
 ('b01', .2, 4.6), ('b01', 6.4, 10.7), ('b02', .2, 2.1), ('b02', 2.3, 5.0),
 ('c01', .2, 6.6), ('c01', 6.8, 8.5), ('c02', .2, 1.7), ('c02', 1.8, 3.6), ('c02', 3.7, 4.7),
 ('c03', .3, 1.3), ('c03', 1.65, 2.6), ('d01', .2, 4.5), ('d01', 4.7, 6.3), ('d01', 6.4, 7.6), ('d01', 7.7, 9.3),
 ('e01', .2, 2.5), ('e01', 2.6, 3.3), ('e01', 3.4, 4.5), ('e01', 4.6, 6.0),
 ('f01', .2, 2.4), ('f01', 2.5, 3.3), ('f01', 3.4, 7.0),
 ('g01', .2, 3.0), ('g01', 3.0, 5.9), ('g01', 5.9, 6.5), ('g01', 6.6, 9.0),
 ('h01', .2, 2.9), ('h01', 3.0, 8.7), ('h01', 8.9, 12.5),
 ('i01', .2, 5.4), ('i01', 5.45, 5.85), ('i01', 5.9, 6.9), ('i01', 7.1, 9.8),
 ('j01', .2, 8.5, [('o leme', 1.4), ('o profundor', 3.15), ('e os ailerons', 5.75)]), ('j01', 8.7, 11.1), ('j01', 11.3, 14.0),
 ('k01', .2, 4.7), ('k01', 5.2, 6.3), ('k01', 6.3, 8.3), ('k01', 8.3, 10.1),
 ('l01', .2, 1.4), ('l01', 1.4, 2.9), ('l01', 2.9, 4.7), ('l01', 5.0, 6.0), ('l01', 7.0, 9.4),
 ('m01', .2, 8.2, [('ele suga', 2.7), ('espreme', 3.6), ('queima', 4.3), ('e solta', 5.6)]), ('m01', 8.3, 10.5), ('m01', 10.6, 12.5),
 ('n01', .2, 4.7), ('n01', 5.0, 17.2, [('poltronas', 6.7), ('janelas', 9.3), ('bagageiros', 9.95), ('banheiros', 10.75), ('uma cozinha', 11.8), ('o porão', 13.7), ('e as saídas', 15.5)]),
 ('o01', .3, 1.2), ('o01', 1.5, 4.3)]
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
