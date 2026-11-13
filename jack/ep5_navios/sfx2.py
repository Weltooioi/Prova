# Efeitos sonoros da versão 2. Eventos = (trecho, tempo local, som, volume), com os mesmos tempos da animação.
# Saída: <prefixo>_fx.wav (efeitos) e <prefixo>_amb.wav (ambiente), separados para poder abaixar o ambiente sob a narração.
import numpy as np, wave, sys, json
from scipy.signal import butter, lfilter
SR = 44100; FPS = 24
DUR = [('n01', 8.8), ('n02', 8.0), ('n03', 7.2), ('n04', 6.8), ('n05', 7.4), ('n06', 7.4), ('n07', 8.0), ('n08', 6.6), ('n09', 5.2), ('n10', 10.8), ('n11', 7.6), ('n12', 4.4), ('n13', 5.4), ('n14', 6.2), ('n15', 3.7), ('n16', 11.5), ('n17', 10.0), ('n18', 4.0), ('n19', 9.0), ('n20', 5.0), ('n21', 12.2)]
SEG = {}; acc = 0.0; nom = 0.0
for n, d in DUR:
    fr = round(d * FPS); SEG[n] = (acc, fr / FPS); acc += fr / FPS; nom += d     # duração real em quadros (igual ao render)
TOT = acc
MAPJ = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else None
def MAP(t):
    if not MAPJ: return t
    return float(np.interp(t, [b[0] for b in MAPJ['bp']], [b[1] for b in MAPJ['bp']]))
TOT = MAP(TOT); N = int(SR * TOT) + 1; rs = np.random.RandomState(5); fx = np.zeros(N); amb = np.zeros(N)
def filt(x, lo=None, hi=None):
    if lo and hi: b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band')
    elif hi: b, a = butter(2, hi / (SR / 2), 'low')
    else: b, a = butter(2, lo / (SR / 2), 'high')
    return lfilter(b, a, x)
def put(buf, t, x, g=1.0):
    i = int(t * SR)
    if 0 <= i < N: x = x[:N - i]; buf[i:i + len(x)] += x * g
def env(n, a=.005, d=.2): t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def noise(sec): return rs.randn(max(1, int(sec * SR)))
def tone(f, sec): return np.sin(2 * np.pi * f * np.arange(int(sec * SR)) / SR)
def step(): return filt(noise(.16), 120, 900) * env(int(.16 * SR), .003, .035)
def tap(): n = int(.1 * SR); return (tone(190, .1) * .7 + filt(noise(.1), 400, 2500) * .5) * env(n, .002, .02)
def thud(f=75, d=.12): n = int(.4 * SR); return (tone(f, .4) + filt(noise(.4), 60, 500) * .6) * env(n, .003, d)
def chop(): n = int(.22 * SR); return (filt(noise(.22), 500, 3500) * .9 + tone(160, .22) * .6) * env(n, .001, .035)
def clang(f=1250): n = int(.5 * SR); return (tone(f, .5) + .6 * tone(f * 1.52, .5) + .4 * tone(f * 2.31, .5) + filt(noise(.5), 2000, 8000) * .3) * env(n, .001, .09)
def tick(f=2400): n = int(.07 * SR); return (tone(f, .07) + filt(noise(.07), 3000, 9000) * .5) * env(n, .001, .012)
def splash(sec, big):
    n = int(sec * SR); t = np.arange(n) / SR
    return filt(noise(sec), 250, 5500 if big else 4000)[:n] * np.minimum(1, t / .012) * np.exp(-t / (sec * .28)) + np.sin(2 * np.pi * (90 - 40 * t) * t) * np.exp(-t / .09) * (1.0 if big else .3)
def plop(): n = int(.25 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(300 + 900 * t / .25) / SR) * env(n, .002, .05)
def ding(f=1320): n = int(.9 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 1.5 * t) + .25 * np.sin(2 * np.pi * f * 2 * t)) * env(n, .002, .22)
def chime(): return ding(988) * .6 + np.pad(ding(1319), (int(.09 * SR), 0))[:int(.9 * SR)] * .6          # destaque "o que mudou"
def bell(f=660): n = int(2.6 * SR); t = np.arange(n) / SR; return sum(a * np.sin(2 * np.pi * f * m * t) for m, a in ((1, 1), (2.01, .6), (2.99, .35), (4.2, .2))) * env(n, .003, .8)
def whoosh(sec, lo=500, hi=3000): n = int(sec * SR); t = np.arange(n) / SR; return filt(noise(sec), lo, hi)[:n] * np.sin(np.pi * t / sec) ** 2
def rumble(sec, lo=40, hi=260): n = int(sec * SR); t = np.arange(n) / SR; return filt(noise(sec), lo, hi)[:n] * np.sin(np.pi * t / sec) ** 1.2
def creak(sec=.5): n = int(sec * SR); t = np.arange(n) / SR; return np.sign(np.sin(2 * np.pi * np.cumsum(55 + 25 * np.sin(2 * np.pi * 3 * t)) / SR)) * filt(noise(sec), 300, 1800)[:n] * np.sin(np.pi * t / sec)
def slide(f0, f1, sec): n = int(sec * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(f0 + (f1 - f0) * t / sec) / SR) * np.sin(np.pi * t / sec) ** .5
def rewind(sec): n = int(sec * SR); t = np.arange(n) / SR; r = np.sin(2 * np.pi * np.cumsum(500 + 2600 * t / sec + 220 * np.sin(2 * np.pi * 24 * t)) / SR) * .5 + filt(noise(sec), 1500, 7000)[:n] * .4 * (.5 + .5 * np.sign(np.sin(2 * np.pi * 18 * t))); return r * np.minimum(1, t / .05) * np.minimum(1, (sec - t) / .05)
def horn(sec=1.4, f=110): n = int(sec * SR); t = np.arange(n) / SR; return (np.sign(np.sin(2 * np.pi * f * t)) * .5 + np.sin(2 * np.pi * f * 1.5 * t) * .5) * np.minimum(1, t / .08) * np.minimum(1, (sec - t) / .25)
def buzz(sec): n = int(sec * SR); t = np.arange(n) / SR; return (filt(noise(sec), 2500, 9000)[:n] * (.6 + .4 * np.sign(np.sin(2 * np.pi * 47 * t))) + .25 * np.sign(np.sin(2 * np.pi * 100 * t))) * np.minimum(1, t / .03) * np.minimum(1, (sec - t) / .05)
def chug(sec): n = int(sec * SR); t = np.arange(n) / SR; return filt(noise(sec), 50, 400)[:n] * (.3 + .7 * (np.sin(2 * np.pi * 5.5 * t) > .3)) * np.minimum(1, t / .3) * np.minimum(1, (sec - t) / .3)
def hum(sec): n = int(sec * SR); t = np.arange(n) / SR; return (tone(55, sec)[:n] * .6 + tone(110, sec)[:n] * .25) * np.minimum(1, t / .4) * np.minimum(1, (sec - t) / .4)
def fire(sec): n = int(sec * SR); t = np.arange(n) / SR; cr = (rs.rand(n) > .9992).astype(float); cr = lfilter([1], [1, -.97], cr); return (filt(noise(sec), 300, 2500)[:n] * .5 + filt(cr, 1500, 8000) * 3) * np.minimum(1, t / .4) * np.minimum(1, (sec - t) / .3)
def beep(f=1800): return tone(f, .09) * env(int(.09 * SR), .002, .03)
EV = []          # registro de eventos (para conferência)
def E(seg, t, x, g, what=''): put(fx, MAP(SEG[seg][0] + t), x, g); EV.append((round(MAP(SEG[seg][0] + t), 2), what))
def RW(seg, a, b, c): E(seg, a, tap(), .5, 'congela'); E(seg, b, rewind(MAP(SEG[seg][0] + c) - MAP(SEG[seg][0] + b)), .26, 'tempo reverso'); E(seg, c, tap(), .5, 'volta')
def treefall(seg, t0):
    for h in (.45, .95, 1.45): E(seg, t0 + h, chop(), .55, 'machadada na palmeira')
    E(seg, t0 + 1.55, creak(.8), .3, 'árvore caindo'); E(seg, t0 + 2.35, thud(60, .16), .7, 'árvore no chão'); E(seg, t0 + 2.36, whoosh(.5, 800, 5000), .2, 'folhas')
# ---- ambiente: mar baixo (a narração vai por cima); some no tempo reverso e no raio-x ----
t = np.arange(N) / SR
sea = filt(rs.randn(N), 150, 1800) * (.55 + .45 * np.sin(2 * np.pi * t / 5.2 - 1) ** 2) + filt(rs.randn(N), 2000, 6000) * .25 * (np.sin(2 * np.pi * t / 5.2 - .2) ** 8)
gain = np.full(N, .065)
def amb_gain(seg, a, b, g, ramp=.25):
    i0, i1 = int(MAP(SEG[seg][0] + a) * SR), min(N, int(MAP(SEG[seg][0] + b) * SR)); r = int(ramp * SR); w = np.ones(i1 - i0); k = min(r, len(w) // 2)
    if k > 0: w[:k] = np.linspace(0, 1, k); w[-k:] = np.linspace(1, 0, k)
    gain[i0:i1] = gain[i0:i1] * (1 - w) + g * w
for seg, a, b in (('n02', 3.6, 4.75), ('n06', 5.6, 7.0), ('n09', 3.2, 4.4), ('n14', 4.6, 6.0), ('n16', 2.3, 3.0)): amb_gain(seg, a, b, .003, .08)
for seg in ('n04', 'n05', 'n06', 'n08', 'n13'): amb_gain(seg, 0, SEG[seg][1], .09)
amb_gain('n19', 3.0, 6.6, 0, .3); amb_gain('n20', 0, 2.3, 0, .3); amb_gain('n21', 9.4, 12.2, 0, .6)
amb += sea * gain
# ---- eventos ----
E('n01', .96, whoosh(.7), .09, 'braço aponta'); treefall('n01', 3.0); E('n01', 7.06, rumble(1.35), .7, 'tronco rolando'); E('n01', 7.65, splash(.9, False), .42, 'tronco na água')
n = int(2.2 * SR); tt = np.arange(n) / SR; E('n02', 0, filt(noise(2.2), 300, 2200)[:n] * (tt / 2.2) ** 1.5 * (.6 + .4 * np.sin(2 * np.pi * (1.4 * tt * tt))), .17, 'tronco girando')
for T in (.77, 1.09, 1.34, 1.55, 1.73, 1.90, 2.05, 2.18): E('n02', T, tap(), .3, 'pés no tronco')
E('n02', 2.2, slide(1500, 250, .52), .14, 'queda'); E('n02', 2.72, splash(1.5, True), .5, 'mergulho'); E('n02', 3.18, splash(.8, False), .26, 'Jack levanta'); RW('n02', 3.6, 3.85, 4.75); E('n02', 4.95, chime(), .16, 'destaque')
treefall('n03', 0)
for T in (4.37, 4.79, 5.21, 5.63, 6.05): E('n03', T, thud(95, .08), .45, 'tronco encaixa')
for T in (6.2, 6.6): E('n03', T, creak(.35), .16, 'corda apertando')
for T in (.75, 1.5): E('n04', T, thud(120, .06), .38, 'pulo na jangada'); E('n04', T + .02, splash(.5, False), .16, 'respingo')
E('n04', 1.7, chime(), .16, 'destaque'); E('n04', 4.95, slide(500, 900, .35), .1, 'dúvida')
for T in (.4, .85): E('n05', T, chop(), .55, 'machadada no remo')
E('n05', 1.25, ding(1568), .12, 'remos prontos')
for T in (2.5, 3.76, 5.0, 6.3): E('n05', T, splash(.45, False), .2, 'remada')
E('n05', 4.4, chime(), .16, 'destaque')
for T in (.3, 1.7, 3.3, 5.0): E('n06', T, splash(.45, False), .16, 'remada cansada')
for i in range(6): E('n06', .6 + .8 * i, splash(.4, False), .14, 'água na borda')
RW('n06', 5.6, 5.9, 7.0)
E('n07', .95, ding(), .18, 'ideia')
for T in (3.22, 3.95, 4.68, 5.4, 6.13, 6.86, 7.58): E('n07', T, chop(), .52, 'escavando a canoa')
for T in (.4, 1.9, 3.4, 4.9, 6.2): E('n08', T, splash(.4, False), .15, 'remada')
E('n08', 1.9, chime(), .16, 'destaque')
E('n09', 1.3, thud(110, .07), .45, 'caixa na canoa'); E('n09', 1.5, creak(.6), .25, 'canoa virando'); E('n09', 2.12, splash(1.2, True), .7, 'caixa na água'); RW('n09', 3.2, 3.45, 4.4); E('n09', 4.75, ding(), .18, 'ideia')
E('n10', 1.0, rumble(2.4), .6, 'quilha arrastando'); E('n10', 3.4, thud(70, .14), .5, 'quilha no lugar')
for T in (7.2, 8.5): E('n10', T, thud(90, .1), .38, 'roda de proa e popa')
for i in range(9): E('n11', .4 + .333 * i, thud(140, .05), .2, 'caverna')
for i in range(14): E('n11', .6 + .5 * i, tap(), .32, 'martelo')
for i in range(6): E('n11', 3.8 + .57 * i, whoosh(.4, 400, 2200), .13, 'tábua')
E('n12', .5, thud(100, .08), .32, 'convés'); E('n12', 2.0, thud(85, .1), .35, 'mastro'); E('n12', 2.2, whoosh(1.1, 300, 1800), .24, 'vela abrindo'); E('n12', 3.5, ding(1568), .12, 'pronto')
E('n13', .9, chime(), .16, 'destaque')
for T in (1.2, 3.6): E('n13', T, creak(.6), .1, 'madeira rangendo')
for T in (.6, 2.0, 3.4): E('n14', T, beep(520), .14, 'problema')
E('n14', 1.7, fire(2.9), .16, 'fogo')
for i in range(4): E('n14', 3.3 + .4 * i, splash(.6, False), .28, 'vazamento')
RW('n14', 4.6, 4.9, 6.0)
for T in (.5, 1.1, 1.7, 2.3, 2.9): E('n15', T, clang(), .28, 'martelo no ferro')
E('n15', 0, fire(3.7), .05, 'forja')
E('n16', .9, plop(), .38, 'bloco na água'); E('n16', .92, splash(.4, False), .2, 'respingo'); E('n16', 1.75, thud(160, .04), .22, 'bloco no fundo'); E('n16', 1.85, slide(500, 180, .4), .11, 'não deu')
E('n16', 2.3, tap(), .42, 'congela'); E('n16', 2.45, rewind(.55), .22, 'tempo reverso'); E('n16', 3.0, tap(), .42, 'volta')
for T in (3.35, 3.85): E('n16', T, clang(1050), .28, 'moldando o casco')
E('n16', 5.15, plop(), .28, 'casco na água'); E('n16', 5.17, splash(.35, False), .14, 'respingo'); E('n16', 7.4, chime(), .16, 'destaque')
for i in range(24): E('n17', .42 + .183 * i, clang(700 + 40 * (i % 4)), .08, 'chapa')
for T in (5.65, 5.94, 6.23, 6.52, 6.80, 7.09): E('n17', T, tick(), .28, 'rebite')
E('n17', 7.55, buzz(2.4), .11, 'solda'); E('n17', 8.0, chime(), .14, 'destaque')
for T in (.5, 1.3, 2.1): E('n18', T, creak(.5), .22, 'corda esticando')
for i in range(6): E('n18', .3 + .4 * i, step(), .3, 'pés escorregando')
E('n18', 3.0, slide(500, 900, .35), .1, 'dúvida')
E('n19', .2, chug(1.8), .18, 'guindaste'); E('n19', 1.92, thud(60, .16), .55, 'motor no lugar'); E('n19', 2.85, thud(80, .1), .4, 'chaminé')
E('n19', 3.0, hum(3.6), .14, 'raio-x')
for T in (3.3, 4.3, 5.3): E('n19', 3.0 + (T - 3.0), beep(1500), .15, 'rótulo')
E('n19', 5.3, whoosh(1.3, 200, 1200), .16, 'hélice'); E('n19', 6.6, chug(2.4), .28, 'motor'); E('n19', 6.8, horn(1.2, 147), .12, 'apito'); E('n19', 6.9, chime(), .14, 'destaque')
E('n20', 0, hum(2.3), .14, 'raio-x'); E('n20', .3, beep(1500), .15, 'rótulo')
for i in range(4): E('n20', 2.5 + .62 * i, beep(1900), .08, 'radar')
E('n20', 3.2, chime(), .14, 'destaque')
E('n21', .3, horn(1.4, 98), .14, 'buzina do cargueiro'); E('n21', 2.9, ding(), .18, 'pronto')
for i, f in enumerate((523, 587, 659, 784, 880, 1047)): E('n21', 5.0 + .62 * i, ding(f), .09, 'fila de embarcações')
E('n21', 9.8, bell(), .28, 'título')
for name, buf in (('fx', fx), ('amb', amb)):
    b = np.tanh(buf * 1.1) * .8; st = np.stack([b, b], 1); w = wave.open(sys.argv[1] + '_' + name + '.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes()); w.close()
json.dump({'total': TOT, 'seg': SEG, 'eventos': sorted(EV)}, open(sys.argv[1] + '_eventos.json', 'w'), ensure_ascii=False)
print('total', round(TOT, 3), 'eventos', len(EV), 'pico fx', round(float(np.abs(fx).max()), 2))
