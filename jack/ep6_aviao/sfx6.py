# Efeitos sonoros do Ep. 6 (A evolução do avião). Eventos = (trecho, tempo local, som, volume), com os mesmos tempos da animação.
# Saída: <prefixo>_fx.wav (efeitos) e <prefixo>_amb.wav (ambiente), separados para poder abaixar o ambiente sob a narração.
import numpy as np, wave, sys, json
from scipy.signal import butter, lfilter
SR = 44100; FPS = 24
DUR = [('a01', 8.0), ('a02', 7.0), ('a03', 3.0), ('b01', 10.9), ('b02', 6.6), ('c01', 8.6), ('c02', 6.4), ('c03', 3.4), ('d01', 10.6), ('e01', 7.6), ('f01', 8.4), ('g01', 9.2), ('h01', 12.6), ('i01', 11.2), ('j01', 15.2), ('k01', 10.2), ('l01', 9.6), ('m01', 12.6), ('n01', 17.4), ('o01', 11.0)]
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
def D(seg, a, b): return max(.3, MAP(SEG[seg][0] + b) - MAP(SEG[seg][0] + a))    # duração de um som contínuo no tempo final
def RW(seg, a, b, c): E(seg, a, tap(), .5, 'congela'); E(seg, b, rewind(MAP(SEG[seg][0] + c) - MAP(SEG[seg][0] + b)), .26, 'tempo reverso'); E(seg, c, tap(), .5, 'volta')
def treefall(seg, t0):
    for h in (.45, .95, 1.45): E(seg, t0 + h, chop(), .55, 'machadada na palmeira')
    E(seg, t0 + 1.55, creak(.8), .3, 'árvore caindo'); E(seg, t0 + 2.35, thud(60, .16), .7, 'árvore no chão'); E(seg, t0 + 2.36, whoosh(.5, 800, 5000), .2, 'folhas')

# ---- sons próprios deste episódio ----
def engine(sec, f0=38, f1=None, rough=.6):          # motor a pistão: pulsos graves com ruído
    f1 = f1 or f0; n = int(sec * SR); t = np.arange(n) / SR; ph = np.cumsum(f0 + (f1 - f0) * t / sec) / SR
    x = np.sign(np.sin(2 * np.pi * ph)) * .5 + np.sin(2 * np.pi * ph * 2) * .3 + filt(noise(sec), 80, 900)[:n] * rough * (.5 + .5 * (np.sin(2 * np.pi * ph) > 0))
    return filt(x, None, 1800) * np.minimum(1, t / .15) * np.minimum(1, (sec - t) / .2)
def jet(sec, a=.4, b=1.0):                           # motor a jato: chiado agudo com sopro
    n = int(sec * SR); t = np.arange(n) / SR; k = a + (b - a) * t / sec
    return (filt(noise(sec), 900, 7000)[:n] * .7 + np.sin(2 * np.pi * np.cumsum(1400 + 900 * k) / SR) * .12 + filt(noise(sec), 60, 300)[:n] * .5) * k * np.minimum(1, t / .3) * np.minimum(1, (sec - t) / .3)
def hiss(sec): n = int(sec * SR); t = np.arange(n) / SR; return filt(noise(sec), 2500, 9000)[:n] * (.6 + .4 * (np.sin(2 * np.pi * 2.6 * t) > .2)) * np.minimum(1, t / .2) * np.minimum(1, (sec - t) / .4)
def rip(): n = int(.28 * SR); t = np.arange(n) / SR; return filt(noise(.28), 1500, 8000)[:n] * (rs.rand(n) > .35) * np.exp(-t / .12)
def rustle(sec=.7): n = int(sec * SR); t = np.arange(n) / SR; return filt(noise(sec), 1200, 7000)[:n] * (.5 + .5 * rs.rand(n)) * np.minimum(1, t / .01) * np.exp(-t / (sec * .35))
def chirp(f=3200): n = int(.12 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(f + 900 * np.sin(2 * np.pi * 14 * t)) / SR) * env(n, .005, .04)
def gust(sec): n = int(sec * SR); t = np.arange(n) / SR; return filt(noise(sec), 250, 1300)[:n] * np.sin(np.pi * t / sec) ** 2
def crash(big=1.0): return np.concatenate([thud(60, .18) * big, np.zeros(1)])[:int(.4 * SR)] + np.pad(filt(noise(.35), 300, 4000) * env(int(.35 * SR), .002, .07) * .6 * big, (0, int(.4 * SR) - int(.35 * SR)))
def flap(): return whoosh(.16, 300, 1600)
def fail(seg, a, b, c): RW(seg, a, b, c)
# ---- eventos por cena (tempos locais iguais aos da animação). Sem vento ou ambiente contínuo. ----
for T in (.6, 1.5, 2.3): E('a01', T, chirp(3000 + 300 * int(T * 3 % 3)), .08, 'pássaros')
E('a01', 3.4, whoosh(1.1, 300, 1500), .16, 'asas de pano abrindo')
for i in range(6): E('a01', 5.3 + .22 * i, step(), .4, 'corrida')
E('a01', 6.6, whoosh(.5, 400, 2500), .2, 'salto')
for i in range(8): E('a01', 6.75 + .16 * i, flap(), .22, 'batendo as asas')
for i in range(6): E('a02', .05 + .16 * i, flap(), .22, 'batendo as asas')
E('a02', .35, slide(1400, 300, .75), .13, 'queda'); E('a02', 1.12, crash(1.0), .8, 'batida no chão'); E('a02', 1.6, ding(1760), .07, 'tonto'); fail('a02', 5.3, 5.6, 6.7)
for i in range(5): E('b01', .8 + .5 * i, tap(), .34, 'martelo')
for i in range(8): E('b01', 1.5 + .2 * i, tick(900), .1, 'ripas da asa')
E('b01', 3.3, whoosh(2.0, 300, 1400), .14, 'tecido cobrindo a asa'); E('b01', 5.6, ding(1568), .1, 'asa pronta'); E('b01', 6.9, gust(2.6), .07, 'ar passando pela asa'); E('b01', 8.9, ding(1320), .12, 'força para cima')
E('b02', .5, chime(), .14, 'destaque'); E('b02', .2, gust(1.6), .06, 'planando')
for T in (2.5, 3.0): E('b02', T, creak(.4), .2, 'asa balançando')
E('b02', 3.35, slide(1300, 300, .85), .13, 'queda'); E('b02', 4.25, crash(1.0), .8, 'batida no chão'); fail('b02', 5.0, 5.3, 6.3)
E('c01', .6, whoosh(1.3, 300, 1500), .12, 'vara da cauda')
for T in (2.1, 2.8, 3.5, 4.2): E('c01', T, tap(), .32, 'martelo')
for T in (2.4, 3.8): E('c01', T, thud(140, .05), .25, 'peça da cauda'); 
E('c01', 5.5, ding(1320), .1, 'nariz para a frente'); E('c01', 7.0, chime(), .14, 'destaque')
E('c02', .2, chime(), .14, 'destaque'); E('c02', .3, gust(1.8), .05, 'planando'); E('c02', 4.15, rustle(.9), .5, 'entra na árvore'); E('c02', 4.17, thud(90, .1), .5, 'batida'); fail('c02', 4.7, 5.0, 6.0)
E('d01', 1.2, chime(), .14, 'destaque'); E('d01', 1.2, creak(.5), .14, 'planador inclinando'); E('d01', 6.2, thud(120, .06), .3, 'pouso')
for i in range(4): E('d01', 6.25 + .2 * i, step(), .38, 'passos no pouso')
E('d01', 7.6, slide(500, 900, .35), .1, 'dúvida')
E('e01', .3, chime(), .14, 'destaque')
tt = 0.0
while tt < 4.6: E('e01', tt, tick(1500), .12, 'corrente dos pedais'); tt += .13 + .07 * max(0, tt - 2.6)
for i in range(10): E('e01', .1 + .25 * i * (1 + .08 * i), flap(), .1, 'hélice girando')
E('e01', 2.6, thud(110, .07), .4, 'pulinho e volta ao chão'); fail('e01', 6.0, 6.3, 7.2)
E('f01', .9, crash(1.1), .7, 'caldeira no lugar'); E('f01', .92, clang(520), .25, 'ferro'); E('f01', 1.15, hiss(D('f01', 1.15, 6.75)), .1, 'vapor')
for i in range(18): E('f01', 1.3 + .3 * i, thud(180, .03), .12, 'pistão a vapor')
E('f01', 2.7, creak(.9), .25, 'afundando no chão'); E('f01', 3.2, chime(), .14, 'destaque'); fail('f01', 7.0, 7.3, 8.1)
E('g01', 1.0, thud(90, .1), .5, 'motor no lugar')
for T in (1.4, 1.55): E('g01', T, thud(200, .03), .35, 'motor tossindo')
E('g01', 1.65, engine(D('g01', 1.65, 9.15), 34, 36), .13, 'motor a gasolina'); E('g01', 2.8, chime(), .14, 'destaque'); E('g01', 6.25, slide(500, 900, .35), .1, 'dúvida')
for T in (.5, 1.0, 1.5): E('h01', T, chop(), .5, 'esculpindo a hélice')
E('h01', 1.65, ding(1568), .1, 'hélice pronta'); E('h01', 2.9, engine(D('h01', 2.9, 8.9), 30, 30), .09, 'motor em marcha lenta')
for i in range(5): E('h01', 3.2 + 1.15 * i, whoosh(.5, 200, 1100), .13, 'pá da hélice passando')
E('h01', 6.5, chime(), .14, 'destaque'); E('h01', 8.9, engine(D('h01', 8.9, 12.6), 44, 46), .22, 'motor acelerado'); E('h01', 9.0, rumble(D('h01', 9.0, 12.4), 60, 400), .35, 'esquis arrastando no chão')
for T in (.9, 1.4): E('i01', T, tick(1200), .3, 'rodas encaixando')
E('i01', 0, engine(D('i01', 0, 1.8), 30, 30), .1, 'motor'); E('i01', 1.8, engine(D('i01', 1.8, 9.4), 34, 62), .2, 'motor acelerando'); E('i01', 1.8, rumble(D('i01', 1.8, 5.9), 50, 300), .3, 'rodas na pista'); E('i01', 3.3, chime(), .14, 'destaque'); E('i01', 5.9, ding(1568), .16, 'decolou')
E('i01', 9.42, rustle(1.0), .55, 'entra na árvore'); E('i01', 9.44, crash(.9), .6, 'batida'); fail('i01', 9.8, 10.1, 10.9)
E('j01', 0, engine(D('j01', 0, 11.2), 52, 52), .1, 'motor em voo')
for T in (1.3, 2.3, 3.6, 4.7, 6.2, 7.3): E('j01', T, creak(.3), .12, 'superfície de comando')
for T in (.9, 3.2, 5.8, 8.8, 9.6): E('j01', T, beep(1500), .1, 'rótulo')
E('j01', 11.2, engine(D('j01', 11.2, 14.1), 56, 74), .17, 'motor a toda'); E('j01', 11.4, gust(1.8), .08, 'velocidade')
for i in range(8): E('j01', 11.8 + .17 * i, rip(), .32, 'tecido rasgando')
E('j01', 13.2, slide(1500, 300, .8), .14, 'mergulho'); fail('j01', 14.0, 14.25, 15.0)
for i in range(6): E('k01', .9 + .36 * i, clang(760 + 50 * (i % 3)), .13, 'chapa de alumínio')
for i in range(8): E('k01', 1.0 + .4 * i, tick(), .22, 'rebite')
E('k01', 3.9, thud(100, .08), .4, 'asas e motor'); E('k01', 2.7, chime(), .14, 'destaque'); E('k01', 5.4, engine(D('k01', 5.4, 10.2), 60, 60, .4), .1, 'motor em voo'); E('k01', 5.6, gust(2.6), .1, 'vento gelado')
E('k01', 8.4, whoosh(.8, 400, 2000), .16, 'cabine fechando'); E('k01', 9.2, thud(160, .04), .35, 'cabine travada'); E('k01', 8.8, chime(), .14, 'destaque')
E('l01', 0, engine(D('l01', 0, 9.6), 40, 82, .5), .16, 'motor'); E('l01', 0, rumble(D('l01', 0, 2.3), 50, 300), .28, 'rodas na pista'); E('l01', 2.9, buzz(1.4), .05, 'trem recolhendo'); E('l01', 4.3, thud(140, .05), .35, 'trem travado'); E('l01', 3.9, chime(), .14, 'destaque')
for T in (7.4, 7.9, 8.4, 8.9): E('l01', T, beep(900), .16, 'limite')
E('m01', 0, jet(D('m01', 0, 2.6), .5, .9), .16, 'avião a jato passando'); E('m01', .5, chime(), .14, 'destaque'); E('m01', 2.6, hum(D('m01', 2.6, 8.3)), .1, 'diagrama')
for T in (2.8, 3.7, 4.4, 5.7): E('m01', T, beep(1500), .14, 'rótulo')
E('m01', 2.9, whoosh(.9, 300, 1500), .14, 'suga o ar'); E('m01', 4.5, fire(1.2), .14, 'queima'); E('m01', 5.8, jet(D('m01', 5.8, 8.1), .5, 1.0), .16, 'gases para trás'); E('m01', 8.3, jet(D('m01', 8.3, 10.6), .7, 1.0), .16, 'subindo'); E('m01', 10.6, hum(D('m01', 10.6, 12.6)), .08, 'cabine')
for T in (10.9, 11.7): E('m01', T, beep(600), .14, 'alerta de oxigênio')
E('n01', 0, hum(D('n01', 0, 17.4)), .05, 'cabine'); E('n01', .3, hiss(1.7), .07, 'ar entrando'); E('n01', 2.0, ding(1320), .16, 'ar respirável'); E('n01', 2.05, chime(), .12, 'destaque')
for T in (6.8, 9.4, 10.0, 10.8, 11.9, 13.8, 15.6): E('n01', T, beep(1700), .1, 'item do interior')
E('n01', 12.3, tick(900), .15, 'cozinha'); E('n01', 14.1, thud(150, .04), .15, 'malas')
E('o01', 0, jet(1.6, 1.0, .5), .16, 'pouso'); E('o01', 1.25, tick(700), .3, 'pneus na pista'); E('o01', 2.3, ding(), .18, 'pronto')
for i, f in enumerate((523, 659, 784, 880, 1047)): E('o01', 4.9 + .62 * i, ding(f), .09, 'fila de aeronaves')
E('o01', 8.7, bell(), .28, 'título')
E('a03', .95, slide(620, 330, .5), .1, 'desânimo'); E('c03', .3, slide(500, 900, .35), .1, 'dúvida'); E('c03', 1.65, ding(1568), .16, 'ideia')
for T in (2.65, 3.05): E('c03', T, whoosh(.4, 300, 1500), .1, 'imita a curva')
for name, buf in (('fx', fx), ('amb', amb)):
    b = np.tanh(buf * 1.1) * .8; st = np.stack([b, b], 1); w = wave.open(sys.argv[1] + '_' + name + '.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes()); w.close()
json.dump({'total': TOT, 'seg': SEG, 'eventos': sorted(EV)}, open(sys.argv[1] + '_eventos.json', 'w'), ensure_ascii=False)
print('total', round(TOT, 3), 'eventos', len(EV), 'pico fx', round(float(np.abs(fx).max()), 2))
