# Trilha de fundo original e leve (sintetizada): acordes C - Am - F - G, 92 bpm, com almofada, baixo, marimba e chocalho.
import numpy as np, wave, sys, json
from scipy.signal import butter, lfilter
SR = 44100; TOT = json.load(open('narr/mapa.json'))['total']; N = int(SR * TOT); BPM = 92; beat = 60 / BPM; bar = 4 * beat
L = np.zeros(N); Rr = np.zeros(N); rs = np.random.RandomState(3)
def lp(x, f): b, a = butter(2, f / (SR / 2), 'low'); return lfilter(b, a, x)
def put(t, x, g, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    x = x[:N - i]; L[i:i + len(x)] += x * g * (1 - max(0, pan)); Rr[i:i + len(x)] += x * g * (1 + min(0, pan))
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def pad(notes, sec):
    n = int(sec * SR); t = np.arange(n) / SR; x = sum(np.sin(2 * np.pi * hz(m) * t) + .35 * np.sin(2 * np.pi * hz(m) * 2 * t + .3) + .3 * np.sin(2 * np.pi * hz(m) * 1.003 * t) for m in notes)
    return lp(x, 1400) * np.minimum(1, t / .5) * np.minimum(1, (sec - t) / .6) / len(notes)
def pluck(m, sec=.7):
    n = int(sec * SR); t = np.arange(n) / SR; f = hz(m); return (np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / .05) + .2 * np.sin(2 * np.pi * f * 2 * t)) * np.minimum(1, t / .004) * np.exp(-t / .22)
def bass(m, sec):
    n = int(sec * SR); t = np.arange(n) / SR; f = hz(m); return (np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * f * 2 * t)) * np.minimum(1, t / .01) * np.exp(-t / (sec * .6))
def shaker(): n = int(.07 * SR); t = np.arange(n) / SR; b, a = butter(2, 5000 / (SR / 2), 'high'); return lfilter(b, a, rs.randn(n)) * np.exp(-t / .018)
def kick(): n = int(.22 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(95 * np.exp(-t / .05) + 45) / SR) * np.exp(-t / .08)
CH = [([60, 64, 67, 72], 36), ([57, 60, 64, 69], 33), ([53, 57, 60, 65], 29), ([55, 59, 62, 67], 31)]    # C, Am, F, G
ARP = [0, 2, 1, 3, 2, 1, 3, 2]; nb = int(TOT / bar) + 1
for b in range(nb):
    t0 = b * bar; notes, root = CH[b % 4]; last = t0 + bar > TOT - 6
    if t0 >= TOT - 1: break
    put(t0, pad(notes[:3], bar + .4), .22)
    if b >= 2 and not last:
        for k in (0, 2): put(t0 + k * beat, bass(root, beat * 1.6), .38)
        put(t0 + 3.5 * beat, bass(root + 7, beat * .5), .2)
        for k in range(8):
            if (b % 8 == 7 and k > 5): continue
            m = notes[ARP[(k + (b // 4) * 3) % 8]] + (12 if (k % 4 == 3 and b % 2) else 0); put(t0 + k * beat / 2 + (.012 if k % 2 else 0), pluck(m), .16 if k % 2 else .2, pan=.35 if k % 2 else -.35)
        for k in range(8): put(t0 + k * beat / 2, shaker(), .035 if k % 2 == 0 else .06, pan=.2)
        if b >= 4:
            for k in (0, 2): put(t0 + k * beat, kick(), .16)
end = TOT - 3.2; put(end, pad([60, 64, 67, 72], 3.1), .3); put(end, pluck(72, 1.4), .22); put(end + .25, pluck(76, 1.4), .2); put(end + .5, pluck(79, 1.6), .2); put(end, bass(36, 2.2), .35)
fade = np.ones(N); k = int(1.2 * SR); fade[:k] = np.linspace(0, 1, k); k2 = int(.8 * SR); fade[-k2:] = np.linspace(1, 0, k2)
st = np.stack([L * fade, Rr * fade], 1); st = st / np.abs(st).max() * .5
w = wave.open(sys.argv[1], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes()); w.close(); print('trilha', round(TOT, 2), 's,', nb, 'compassos')
