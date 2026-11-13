# Ajusta o vídeo à narração: cada frase do vídeo (onde a legenda aparece) é esticada ou encolhida para durar o mesmo que a fala.
# As pausas entre frases ficam como foram animadas. Gera: mapa de tempo, faixa da narração reposicionada e o vídeo reamostrado.
import json, subprocess, numpy as np, wave, sys
FPS = 24; W, H = 1080, 1920
DUR = [8.8, 8.0, 7.2, 6.8, 7.4, 7.4, 8.0, 6.6, 5.2, 10.8, 7.6, 4.4, 5.4, 6.2, 3.7, 11.5, 10.0, 4.0, 9.0, 5.0, 12.2]
FR = [211, 192, 173, 163, 178, 178, 192, 158, 125, 259, 182, 106, 130, 149, 89, 276, 240, 96, 216, 120, 293]
nom = np.concatenate([[0], np.cumsum(DUR)]); act = np.concatenate([[0], np.cumsum(FR)]) / FPS; TOT = act[-1]
def n2a(t): k = max(0, min(len(DUR) - 1, int(np.searchsorted(nom, t, 'right') - 1))); return min(act[k + 1], act[k] + (t - nom[k]))
S = json.load(open('out/frases_tempos.json')); A = json.load(open('narr/frases_audio.json'))
bp = [(0.0, 0.0)]; starts = []; x = 0.0; prev = 0.0
for (a, d, _), (sa, se) in zip(S, A):
    va, ve = n2a(a), n2a(a + d); D = se - sa
    x += va - prev; bp.append((va, x)); starts.append(x); x += D; bp.append((ve, x)); prev = ve
x += TOT - prev; bp.append((TOT, x)); NEW = x
json.dump({'bp': bp, 'starts': starts, 'total': NEW}, open('narr/mapa.json', 'w'))
print('duração nova', round(NEW, 2), 'fatores de velocidade nas falas: min', round(min((S[i][1]) / (A[i][1] - A[i][0]) for i in range(len(S))), 2), 'max', round(max((S[i][1]) / (A[i][1] - A[i][0]) for i in range(len(S))), 2))
# narração: cada frase recortada e colocada no seu novo início
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'narr/narr.mp3', '-ac', '1', '-ar', '44100', 'narr/narr.wav'], check=True)
w = wave.open('narr/narr.wav'); SR = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768; w.close()
out = np.zeros(int(NEW * SR) + SR)
for (sa, se), st in zip(A, starts):
    i0, i1 = max(0, int((sa - .05) * SR)), min(len(x), int((se + .09) * SR)); c = x[i0:i1].copy(); f = int(.02 * SR); c[:f] *= np.linspace(0, 1, f); c[-f:] *= np.linspace(1, 0, f)
    o = int((st - .05) * SR); o = max(0, o); out[o:o + len(c)] += c
out = out[:int(NEW * SR)]; ww = wave.open('narr/narr_pos.wav', 'wb'); ww.setnchannels(1); ww.setsampwidth(2); ww.setframerate(SR); ww.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes()); ww.close()
if len(sys.argv) > 1 and sys.argv[1] == 'video':
    xs = np.array([b[1] for b in bp]); ys = np.array([b[0] for b in bp]); nout = int(round(NEW * FPS)); src = np.minimum(len_src := int(sum(FR)) - 1, np.floor(np.interp((np.arange(nout) + .5) / FPS, xs, ys) * FPS).astype(int))
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', 'out/v2_mudo.mp4', '-f', 'rawvideo', '-pix_fmt', 'yuv420p', '-'], stdout=subprocess.PIPE, bufsize=1 << 24)
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'yuv420p', '-s', f'{W}x{H}', '-framerate', str(FPS), '-i', '-', '-c:v', 'libx264', '-crf', '19', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', 'out/v3_mudo.part.mp4'], stdin=subprocess.PIPE)
    sz = W * H * 3 // 2; cur = -1; buf = None
    for j in range(nout):
        while cur < src[j]:
            buf = dec.stdout.read(sz); cur += 1
        enc.stdin.write(buf)
    enc.stdin.close(); dec.kill(); rc = enc.wait(); print('quadros', nout, 'saida', rc)
    if rc == 0: import os; os.replace('out/v3_mudo.part.mp4', 'out/v3_mudo.mp4')
