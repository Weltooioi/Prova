# O Curioso Jack: código de produção

Tudo nos episódios é gerado por código: personagem, cenários, animação, legendas, efeitos sonoros e trilha. Não há arquivos 3D, imagens ou sons baixados. Só a narração vem de fora (ElevenLabs, voz "Jack John - Conversational and Upbeat").

## Pastas

- `modelo_personagem/Jack_modelo_3D.html`: o Jack sozinho num arquivo, com botões de vista e expressão. Abra num navegador de computador.
- `ep5_navios/`: episódio 5, "A evolução dos navios".
- `ep6_aviao/`: episódio 6, "A evolução do avião" (versão mais recente do método).
- `sons_exemplo/`: um WAV curto de cada som da biblioteca, só para ouvir. No episódio, eles são gerados na hora pelo `sfx6.py`.

## Estilo visual

- Vídeo vertical 1080x1920, 24 quadros por segundo.
- 3D low-poly: formas simples (esfera, cilindro, cone, caixa, toro, cápsula), cores chapadas, sombra suave, luz de sol quente, céu em degradê.
- O Jack faz em cena o que a narração descreve. Rostos sem pálpebra de pele (piscar achata o próprio olho), mãos que não atravessam nada, pés sempre no chão.

## Estrutura do roteiro

Tentativa, falha, solução. Cada tentativa muda uma coisa só, falha de um jeito visível, o tempo volta (efeito "◀◀ VOLTANDO") e a próxima resolve exatamente aquela falha. No fim de cada tentativa aparece o cartão "O QUE MUDOU", com o nome da peça e um círculo marcando onde ela está. Narração em segunda pessoa ("você..."), tom leve, terminando com "E pronto! Dessa forma, você construiu...".

## Arquivos do episódio 6

**Motor e personagem**
- `engine.js`: motor 3D em WebGL2. `scene(t)` monta a cena e `renderFrame(t)` desenha um quadro. Cada quadro é função pura do tempo.
- `jack.js`: `drawJack(P)`, o personagem articulado. Os parâmetros estão explicados no topo do `Jack_modelo_3D.html`.

**Cenários e objetos**
- `world.js`: praia, mar, palmeiras, troncos, respingos, chip de título e efeito de tempo reverso (do episódio 5).
- `boats.js`: cascos, ferramentas (machado, martelo, remo, tocha), faíscas, lascas, fumaça, vento e esteira.
- `extra.js`: árvore sendo cortada, cartão "O QUE MUDOU" e legendas.
- `air.js`: campo com morro, árvores, céu, pássaros, poeira e bancada; todos os aviões (asas de pano, planador, avião de madeira a pedal, vapor e gasolina, avião de alumínio, avião a jato com corte do motor e cabine de passageiros).

**Animação (cenas)**
- `ep6a.js`, `ep6b.js`: as 18 cenas originais (A01 a O01), cada uma uma função `(t local, t global)`.
- `ep6c.js`: as cenas de reação do Jack (A03, C03), a foto de perfil e as fichas de referência.
- `main6.js`: a ordem e a duração das cenas, a camada de textos (chip, rótulos, cartão, legenda, título) e a troca de tempo para encaixar na narração.

**Narração e sincronia**
- `frases6.py`: as frases da narração, na ordem.
- `align6.py`: acha cada frase no MP3 pelas pausas (sem reconhecimento de voz).
- `build6.py`: diz qual trecho da animação acompanha cada frase e gera `tmap.js` (tempo do vídeo para tempo da animação), `subs.js` (legendas) e a narração reposicionada.

**Som**
- `sfx6.py`: biblioteca de sons sintetizados (passos, batidas, motor a pistão, motor a jato, vapor, tecido rasgando, tempo reverso, sinos...) e a lista de eventos por cena, no quadro exato de cada acontecimento. Sem vento contínuo.
- `music6.py`: trilha original (C, Am, F, G, 96 bpm, pad, baixo, dedilhado e chocalho).
- `mix6.sh`: mixagem. A voz é normalizada em -16 LUFS, o fundo abaixa sozinho quando a voz fala, e o script mede se o fundo fica pelo menos 15 dB abaixo da voz em cada frase.

**Render e revisão**
- `capture.js`: abre a página no Chrome sem tela (playwright), desenha quadro a quadro e manda para o ffmpeg.
- `render.sh "nome:início:fim ..."`: renderiza cada cena num MP4 separado em `out/seg/`.
- `sheet.sh`, `rev.sh`, `grid.sh`: folhas de quadros para revisar.
- `curto.py`: versão de até 3 minutos (fala 5% mais rápida e pausas encurtadas).
- `ficha.py`, `explica.py`: fichas de referência e vídeo explicativo.

## Como rodar

Precisa de Node com playwright, Google Chrome, ffmpeg e Python 3 com numpy e scipy.

1. `python3 align6.py` (com a narração em `narr/narr.mp3`)
2. `python3 build6.py`
3. `./render.sh "$(cat out/render_list.txt)"`
4. `python3 sfx6.py out/sfxN narr/mapa.json` e `python3 music6.py out/musicN.wav <duração>`
5. `./mix6.sh`, depois junte as cenas com ffmpeg (concat) e coloque o áudio `out/mixN.wav`.

O render leva cerca de 1 segundo por quadro (um episódio de 3 minutos dá mais ou menos 1 hora com dois processos em paralelo).
