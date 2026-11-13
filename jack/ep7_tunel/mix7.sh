#!/bin/bash
# mixa narração + efeitos + ambiente + trilha (fundo abaixa sob a voz) -> out/mixN.wav
cd "$(dirname "$0")"
ffmpeg -v error -y -i narr/narr_pos.wav -i out/sfxN_fx.wav -i out/sfxN_amb.wav -i out/musicN.wav -filter_complex "[0:a]highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100,asplit=4[v][k1][k2][k3];[1:a]volume=${FXV:-0.9}[f0];[f0][k1]sidechaincompress=threshold=0.014:ratio=7:attack=8:release=300[f];[2:a]volume=1.0[a0];[a0][k2]sidechaincompress=threshold=0.012:ratio=12:attack=20:release=500[a];[3:a]volume=${MUV:-0.26}[m0];[m0][k3]sidechaincompress=threshold=0.02:ratio=3:attack=30:release=600[m];[f][a][m]amix=inputs=3:normalize=0[bed];[bed]asplit[b1][b2];[v]asplit[v1][v2];[v1][b1]amix=inputs=2:normalize=0,alimiter=limit=0.84[o]" -map "[o]" -ar 44100 -ac 2 out/mixN.wav -map "[v2]" -ar 44100 -ac 1 out/voz.wav -map "[b2]" -ar 44100 -ac 1 out/fundo.wav
python3 - <<'PY'
import wave, numpy as np, json
def rd(f):
    w = wave.open(f); return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
v = rd('out/voz.wav'); b = rd('out/fundo.wav'); m = json.load(open('narr/mapa.json')); A = json.load(open('narr/frases_audio.json'))['seg']; SR = 44100; res = []
for i, s in enumerate(m['starts']):
    a = int(s * SR); e = a + int((A[i][1] - A[i][0]) * SR); db = lambda x: 10 * np.log10(np.mean(x ** 2) + 1e-12); res.append((db(v[a:e]) - db(b[a:e]), i))
res.sort(); print('voz - fundo: pior %.1f dB (frase %d), média %.1f dB' % (res[0][0], res[0][1], np.mean([r[0] for r in res]))); print('abaixo de 15 dB:', [(round(r[0], 1), r[1]) for r in res if r[0] < 15])
PY
