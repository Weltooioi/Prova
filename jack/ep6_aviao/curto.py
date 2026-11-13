# Versão de 3 minutos: fala 5% mais rápida e pausas sem narração encurtadas. Reaproveita os quadros já renderizados.
import json, subprocess, sys, wave
import numpy as np
S = 1.05; FPS = 24; SR = 44100
m = json.load(open('narr/mapa.json')); A = json.load(open('narr/frases_audio.json'))['seg']; st = m['starts']; T1 = m['total']
iv = [(s - .08, s + (e - a) + .10) for s, (a, e) in zip(st, A)]
def gapf(g, last=False): return g * .68 if last else (g * .5 if g >= .9 else g * .6)
bp = [[0.0, 0.0]]; x = 0.0; t = 0.0
for i, (a, b) in enumerate(iv):
    t += gapf(a - x); bp.append([a, t]); t += (b - a) / S; bp.append([b, t]); x = b
t += gapf(T1 - x, True); T2 = round(t * FPS) / FPS; bp.append([T1, T2])
b1 = np.array([p[0] for p in bp]); b2 = np.array([p[1] for p in bp]); f = lambda v: np.interp(v, b1, b2)
starts2 = [float(f(s)) for s in st]
# mapa composto: tempo da animação -> tempo final curto (para os efeitos sonoros)
o = np.array([p[0] for p in m['bp']]); n1 = np.array([p[1] for p in m['bp']])
pts = sorted(set([round(float(v), 5) for v in n1] + [round(float(v), 5) for v in b1]))
bpc = []
for v in pts:
    ov = float(np.interp(v, n1, o))
    if not bpc or ov > bpc[-1][0] + 1e-6: bpc.append([ov, float(f(v))])
bpc[-1] = [float(o[-1]), T2]
json.dump({'bp': bpc, 'starts': starts2, 'total': T2}, open('narr/mapa2.json', 'w'))
# vídeo: escolhe para cada quadro novo o quadro de origem
N2 = int(round(T2 * FPS)); src = np.minimum(np.round(np.interp(np.arange(N2) / FPS, b2, b1) * FPS).astype(int), int(round(T1 * FPS)) - 1); src = np.maximum.accumulate(src)
W, H = 1080, 1920; fs = W * H * 3 // 2
dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', 'out/mudoN.mp4', '-f', 'rawvideo', '-pix_fmt', 'yuv420p', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'yuv420p', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-crf', '19', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', 'out/mudo3.mp4'], stdin=subprocess.PIPE)
cur = -1; buf = None
for k in src:
    while cur < k: buf = dec.stdout.read(fs); cur += 1
    enc.stdin.write(buf)
enc.stdin.close(); enc.wait(); dec.kill()
# narração acelerada e reposicionada
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'narr/narr.mp3', '-af', f'atempo={S}', '-ac', '1', '-ar', str(SR), 'narr/narr_s.wav'], check=True)
w = wave.open('narr/narr_s.wav'); xw = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768; y = np.zeros(int(T2 * SR) + SR)
for i, (a, e) in enumerate(A):
    a0 = max(0, a - .04) / S; e0 = (e + .08) / S; c = xw[int(a0 * SR):int(e0 * SR)].copy(); k = int(.02 * SR); c[:k] *= np.linspace(0, 1, k); c[-k:] *= np.linspace(1, 0, k); p = int((starts2[i] - .04 / S) * SR); y[p:p + len(c)] += c
y = y[:int(T2 * SR)]; ww = wave.open('narr/narr_pos3.wav', 'wb'); ww.setnchannels(1); ww.setsampwidth(2); ww.setframerate(SR); ww.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes()); ww.close()
print('total %.3f s, %d quadros' % (T2, N2))
