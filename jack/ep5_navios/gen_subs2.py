# Legendas da versão 2: (início global, duração estimada, frase). Com o áudio, basta trocar os tempos.
import json, re, sys
S = [(0.3,2.45,"Primeiro, você precisa atravessar o mar."),(3.3,4.5,"Então encontra um tronco de árvore e decide utilizá-lo como transporte."),
 (9.0,3.3,"Mas ele é instável e difícil de controlar."),(13.2,3.3,"Essa primeira embarcação é chamada de tronco flutuante."),
 (17.1,6.1,"Para melhorar, você junta vários troncos e amarra todos lado a lado, formando uma jangada."),
 (24.3,4.5,"Os troncos sustentam o peso, enquanto as amarras mantêm a estrutura unida."),(29.1,1.3,"Mas como movimentá-la?"),
 (31.0,6.9,"Você utiliza dois pedaços de madeira como remos, empurrando a água para trás e fazendo a jangada avançar."),
 (38.4,6.9,"O problema é que remar exige muito esforço e a jangada não permite transportar tantas pessoas com conforto."),
 (45.8,2.45,"Então você decide construir uma canoa."),(48.5,4.9,"Para isso, escava o interior de um tronco, criando um espaço para passageiros."),
 (53.8,6.1,"Essa embarcação é chamada de canoa escavada, e seu formato estreito facilita o deslocamento na água."),
 (60.3,4.9,"Mas, para transportar mais pessoas e cargas, você precisa de algo maior."),
 (65.6,3.3,"Então começa a construir um barco de madeira."),(69.2,6.9,"Primeiro, instala a quilha, uma estrutura que percorre a parte inferior e serve de base para o casco."),
 (76.4,7.3,"Depois, coloca as cavernas, peças curvas que formam a estrutura interna, e encaixa as tábuas que revestem o casco."),
 (83.9,4.1,"Para aproveitar o vento, instala um mastro e prende uma vela."),
 (88.4,4.9,"Agora você tem uma embarcação maior, capaz de transportar mais pessoas e mercadorias."),
 (93.8,4.9,"Mas a madeira possui limitações: pode apodrecer, pegar fogo e exigir muita manutenção."),
 (100.0,3.3,"Então você experimenta construir um casco de ferro."),
 (103.7,8.6,"Primeiro, uma peça maciça afunda, mas você descobre que um casco oco, com o formato adequado, consegue flutuar ao deslocar água suficiente."),
 (112.6,2.1,"Assim surgem os navios metálicos."),
 (115.2,5.3,"Depois, você utiliza aço, um material resistente que permite construir embarcações ainda maiores."),
 (120.7,4.1,"As chapas são unidas por rebites e soldagem, formando o casco."),
 (125.1,3.7,"Mas ainda falta uma maneira eficiente de movimentar tudo isso."),
 (129.2,8.6,"Então você instala um motor, conectado a um eixo que movimenta a hélice, responsável por empurrar a água e impulsionar o navio."),
 (138.2,4.5,"Por último, adiciona compartimentos estanques, equipamentos de navegação, radar e GPS."),
 (143.2,0.9,"E pronto!"),(144.9,3.0,"Dessa forma, você construiu um navio moderno!")]
def chunks(t, mx=42):
    w = t.split(); out = ['']
    for x in w:
        c = (out[-1] + ' ' + x).strip()
        if len(c) > mx and out[-1]: out.append(x)
        elif out[-1].endswith(',') and len(out[-1]) > mx * .55: out.append(x)
        else: out[-1] = c
    if len(out) > 1 and len(out[-1]) < 12: last = out.pop(); out[-1] += ' ' + last
    return out
subs = []
for a, d, t in S:
    ch = chunks(t); tot = sum(len(c) for c in ch); x = a
    for c in ch:
        dd = d * len(c) / tot; subs.append({'a': round(x, 2), 'b': round(x + dd + (.25 if c is ch[-1] else 0), 2), 'text': c}); x += dd
open('subs.js', 'w').write('window.SUBS = ' + json.dumps(subs, ensure_ascii=False) + ';\n'); json.dump(S, open('out/frases_tempos.json', 'w'), ensure_ascii=False); print(len(subs), 'legendas')
