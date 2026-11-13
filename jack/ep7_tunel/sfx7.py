# Efeitos sonoros do Ep. 7 (A evolução do túnel de rodovia). Eventos = (trecho, tempo local, som, volume), com os mesmos tempos da animação.
# Saída: <prefixo>_fx.wav (efeitos) e <prefixo>_amb.wav (ambiente), separados para poder abaixar o ambiente sob a narração.
import numpy as np, wave, sys, json
from scipy.signal import butter, lfilter
SR = 44100; FPS = 24
DUR = [('a01', 11.5), ('b01', 12.2), ('c01', 17.0), ('d01', 25.5), ('e01', 27.5), ('f01', 17.3), ('g01', 15.7), ('h01', 12.5), ('i01', 8.0)]
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

# ---- sons novos do Ep. 7 ----
def cough(): n = int(.24 * SR); t = np.arange(n) / SR; return (filt(noise(.24), 250, 2600)[:n] + .5 * tone(170, .24)[:n]) * np.minimum(1, t / .006) * np.exp(-t / .07)
def scrape(sec): n = int(sec * SR); t = np.arange(n) / SR; return filt(noise(sec), 1500, 7500)[:n] * (.55 + .45 * np.sin(2 * np.pi * 31 * t)) * np.minimum(1, t / .05) * np.minimum(1, (sec - t) / .1)
def flow(sec): n = int(sec * SR); t = np.arange(n) / SR; return filt(noise(sec), 300, 1600)[:n] * (.7 + .3 * np.sin(2 * np.pi * .7 * t)) * np.minimum(1, t / .6) * np.minimum(1, (sec - t) / .6)
def fanhum(sec): n = int(sec * SR); t = np.arange(n) / SR; return (filt(noise(sec), 120, 900)[:n] * .8 + tone(92, sec)[:n] * .3) * np.minimum(1, t / 1.2) * np.minimum(1, (sec - t) / .6)
def grind(sec): n = int(sec * SR); t = np.arange(n) / SR; return (filt(noise(sec), 80, 700)[:n] * (.6 + .4 * np.sin(2 * np.pi * 9 * t)) + filt(noise(sec), 1800, 5000)[:n] * .25 * (rs.rand(n) > .6)) * np.minimum(1, t / .3) * np.minimum(1, (sec - t) / .3)
def mixa(*xs): n = max(len(x) for x in xs); return sum(np.pad(x, (0, n - len(x))) for x in xs)
def pick(): return mixa(clang(2300) * .7, tick(3200) * .6)
def bonk(): return mixa(thud(320, .05) * .8, tick(1500) * .5)
def A(seg, a, b, x_fn, g, what=''):   # som contínuo na faixa de ambiente (abaixa sob a voz na mixagem)
    put(amb, MAP(SEG[seg][0] + a), x_fn(D(seg, a, b)), g); EV.append((round(MAP(SEG[seg][0] + a), 2), what))
# ---- eventos por cena (tempos locais iguais aos da animação) ----
# abertura
for k in range(9): E('a01', .2 + .4 * k, step(), .32, 'passos na estrada')
for T in (.5, 1.4): E('a01', T, chirp(3000), .07, 'pássaros')
for T in (4.0, 6.1, 9.2): E('a01', T, whoosh(.5, 400, 2200), .12, 'seta desenhando')
# 1. picareta
for k in range(5): E('b01', .8 + .44 * k, step(), .3, 'passos')
E('b01', 1.0, chime(), .18, 'destaque o que mudou'); E('b01', 3.5, beep(1500), .1, 'rótulo')
for T in (3.9, 5.3, 6.0, 6.7): E('b01', T, pick(), .28, 'picareta na rocha')
E('b01', 7.8, slide(620, 330, .5), .12, 'só um pozinho')
E('b01', 9.6, pick(), .45, 'picareta na rocha'); E('b01', 9.6, chop(), .5, 'cabo quebrando'); E('b01', 9.65, whoosh(.4, 600, 2600), .2, 'cabeça voando'); E('b01', 10.39, thud(200, .05), .4, 'cabeça caindo no chão')
RW('b01', 10.6, 10.85, 12.0)
# 2. fogo e água
E('c01', 1.3, whoosh(.6, 200, 1500), .25, 'fogo pegando'); A('c01', 1.3, 5.5, fire, .55, 'fogueira')
E('c01', 4.3, tick(900), .2, 'pega o balde'); E('c01', 5.1, whoosh(.4, 300, 1800), .25, 'joga a água'); E('c01', 5.45, splash(.6, False), .45, 'água na pedra quente')
E('c01', 5.5, hiss(1.6), .3, 'vapor')
for k in range(9): E('c01', 6.4 + .16 * k, tick(700 + 120 * (k % 4)), .2, 'pedra rachando')
E('c01', 7.6, creak(.4), .2, 'pedra rachando'); E('c01', 8.0, crash(1.0), .6, 'pedaços caindo'); E('c01', 8.35, thud(110, .06), .4, 'pedaço no chão')
E('c01', 8.5, chime(), .18, 'destaque o que mudou'); E('c01', 10.45, ding(1320), .16, 'funciona'); E('c01', 11.2, step(), .4, 'pouso do pulo')
A('c01', 11.3, 15.4, fire, .28, 'fogueira na caverna')
for T in (12.4, 12.8, 13.5, 14.1, 14.5): E('c01', T, cough(), .18, 'tosse')
RW('c01', 15.4, 15.65, 16.7)
# 3. pólvora
for k in range(5): E('d01', .4 + .42 * k, step(), .3, 'passos')
for T in (2.9, 3.4, 3.9, 4.4, 4.9, 5.4): E('d01', T, clang(1600), .32, 'marreta na talhadeira')
E('d01', 6.0, rustle(.7), .2, 'pólvora nos furos'); E('d01', 7.0, rip(), .3, 'riscando o fósforo'); A('d01', 7.3, 9.3, hiss, .1, 'pavio queimando')
for k in range(6): E('d01', 7.65 + .15 * k, step(), .2, 'correndo')
E('d01', 9.3, crash(2.0), .9, 'explosão'); E('d01', 9.3, rumble(2.4), .9, 'estrondo'); E('d01', 9.3, thud(42, .3), .9, 'explosão grave')
for T in (9.75, 10.0, 10.25): E('d01', T, thud(160, .05), .3, 'pedras caindo')
E('d01', 9.9, chime(), .18, 'destaque o que mudou')
for k in range(4): E('d01', 9.8 + .32 * k, step(), .3, 'voltando')
for k in range(7): E('d01', 11.85 + .42 * k, step(), .3, 'passos no túnel')
for T in (15.15, 17.45, 20.05): E('d01', T, beep(1500), .1, 'rótulo')
E('d01', 17.8, step(), .4, 'tropeço'); E('d01', 18.05, step(), .3, 'tropeço')
E('d01', 21.18, bonk(), .55, 'pedra na cabeça'); E('d01', 21.3, ding(1900), .08, 'estrelinhas')
for T in (22.63, 23.23): E('d01', T, thud(150, .05), .25, 'pedra no chão')
RW('d01', 23.7, 23.95, 25.1)
# 4. tatuzão
A('e01', 0, 1.9, rumble, .45, 'tatuzão chegando'); A('e01', 2.2, 9.0, hum, .35, 'motor do tatuzão'); A('e01', 7.0, 9.0, grind, .5, 'roda moendo a rocha')
for T in (2.5, 5.0): E('e01', T, beep(1500), .1, 'rótulo')
A('e01', 9.0, 25.6, hum, .2, 'tatuzão lá no fundo')
E('e01', 11.4, chime(), .18, 'destaque o que mudou')
for k in range(6): E('e01', 14.15 + .9 * k, hiss(.3), .12, 'braço hidráulico'); E('e01', 14.15 + .9 * k + .85, thud(90, .06), .35, 'segmento encaixando')
for T in (14.25, 16.65, 20.15, 22.45): E('e01', T, beep(1500), .1, 'rótulo')
for k in range(12): E('e01', 20.0 + .47 * k, plop(), .14, 'gota pingando')
E('e01', 23.4, splash(.4, False), .35, 'pisa na poça')
RW('e01', 25.7, 25.95, 27.1)
# 5. dreno
E('f01', .6, creak(.6), .15, 'pista inclinando'); A('f01', 2.4, 3.4, grind, .3, 'abrindo as canaletas')
for T in (.85, 2.95): E('f01', T, beep(1500), .1, 'rótulo')
A('f01', 4.6, 10.4, flow, .35, 'água escorrendo'); E('f01', 6.6, chime(), .18, 'destaque o que mudou'); E('f01', 9.25, ding(1320), .14, 'tudo seco')
A('f01', 10.6, 15.6, lambda s: engine(s, 34), .25, 'carro chegando'); A('f01', 13.5, 15.3, scrape, .2, 'raspando na parede')
RW('f01', 15.6, 15.85, 16.9)
# 6. iluminação
E('g01', .85, tick(1100), .35, 'interruptor')
for k in range(26): E('g01', 1.0 + .115 * k, tick(1800), .07, 'lâmpada acendendo')
A('g01', 1.0, 15.6, buzz, .03, 'zumbido das lâmpadas'); A('g01', 4.6, 15.6, lambda s: engine(s, 34), .2, 'carro'); E('g01', 4.8, chime(), .18, 'destaque o que mudou')
for T in (6.6, 7.6, 8.7, 9.6): E('g01', T, whoosh(.9, 150, 900), .14, 'carro passando')
A('g01', 6.4, 13.8, lambda s: rumble(s, 40, 200), .15, 'trânsito')
for T in (11.0, 11.4, 12.2, 12.9, 13.3): E('g01', T, cough(), .18, 'tosse')
RW('g01', 14.0, 14.25, 15.3)
# 7. exaustores
A('h01', 0, 12.5, lambda s: engine(s, 34), .15, 'carro parado')
for i in range(4): E('h01', .4 + 2.2 * (1 + i * .6) / 4, thud(120, .05), .25, 'exaustor encaixando no teto')
E('h01', .4, creak(.8), .12, 'exaustores descendo'); E('h01', 3.0, slide(80, 260, 1.4), .2, 'exaustores ligando'); A('h01', 3.0, 12.5, fanhum, .14, 'exaustores girando')
for T in (.3, 1.2, 2.4, 3.6): E('h01', T, cough(), .3, 'tosse')
for T in (3.4, 5.4): E('h01', T, beep(1500), .1, 'seta'); E('h01', 6.2, chime(), .18, 'destaque o que mudou')
for T in (8.8, 9.9, 11.0): E('h01', T, whoosh(.9, 150, 900), .22, 'carro passando')
# final
E('i01', .3, ding(1320), .14, 'e pronto')
for T in (1.0, 2.6, 4.0): E('i01', T, whoosh(1.0, 150, 900), .2, 'carro passando')
for T in (1.5, 3.2): E('i01', T, chirp(3200), .07, 'pássaros')
E('i01', 5.6, bell(), .3, 'sino do título')

for name, buf in (('fx', fx), ('amb', amb)):
    b = np.tanh(buf * 1.1) * .8; st = np.stack([b, b], 1); w = wave.open(sys.argv[1] + '_' + name + '.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes()); w.close()
json.dump({'total': TOT, 'seg': SEG, 'eventos': sorted(EV)}, open(sys.argv[1] + '_eventos.json', 'w'), ensure_ascii=False)
print('total', round(TOT, 3), 'eventos', len(EV), 'pico fx', round(float(np.abs(fx).max()), 2))

