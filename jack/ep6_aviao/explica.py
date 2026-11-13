# Vídeo de 30 s explicando o estilo e o método de O Curioso Jack (trechos do Ep. 6 + painel de texto)
import subprocess, os
F = '/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf'; SRC = 'out/mudoN.mp4'
P = [([(188.9, 5.0)], 'O CURIOSO JACK', ['Como a animação é feita', 'Vídeo vertical em 3D low-poly,', 'feito 100% por código']),
     ([(16.9, 5.0)], '1 · VISUAL', ['Formas simples e cores chapadas.', 'O Jack faz em cena', 'o que a narração descreve.']),
     ([(7.5, 2.5), (11.5, 2.5)], '2 · ROTEIRO', ['Tentativa, falha, solução.', 'A cada erro, o tempo volta', 'e vem a próxima ideia.']),
     ([(96.5, 5.0)], '3 · O QUE MUDOU', ['No fim de cada tentativa, um cartão', 'com o nome da peça nova', 'e um círculo marcando onde ela está.']),
     ([(162.0, 5.0)], '4 · EXPLICAÇÃO', ['Diagramas com rótulos, legenda embaixo', 'e narração em 2ª pessoa ("você..."),', 'em tom leve e coloquial.']),
     ([(195.3, 5.0)], '5 · PRODUÇÃO', ['Cada quadro é desenhado por um programa', '(WebGL, 24 quadros por segundo).', 'Sons e trilha também vêm do código.'])]
parts = []
for i, (clips, head, lines) in enumerate(P):
    ins = []; fc = ''
    for k, (s, d) in enumerate(clips): ins += ['-ss', str(s), '-t', str(d), '-i', SRC]; fc += f'[{k}:v]'
    fc += f'concat=n={len(clips)}:v=1:a=0,scale=792:1408,pad=800:1416:4:4:color=0x3a4160[v];color=c=0x12141c:s=1080x1920:r=24:d=5[bg];[bg][v]overlay=140:448:shortest=1'
    open(f'out/exp/h{i}.txt', 'w').write(head); fc += f",drawtext=fontfile={F}:textfile=out/exp/h{i}.txt:fontsize=58:fontcolor=0xffd23f:x=(w-text_w)/2:y=84"
    for j, l in enumerate(lines):
        open(f'out/exp/l{i}_{j}.txt', 'w').write(l); fc += f",drawtext=fontfile={F}:textfile=out/exp/l{i}_{j}.txt:expansion=none:fontsize=41:fontcolor=white:x=(w-text_w)/2:y={190 + j * 66}"
    fc += ',fade=t=in:st=0:d=0.25,fade=t=out:st=4.75:d=0.25[o]'
    out = f'out/exp/p{i}.mp4'; subprocess.run(['ffmpeg', '-v', 'error', '-y'] + ins + ['-filter_complex', fc, '-map', '[o]', '-t', '5', '-r', '24', '-c:v', 'libx264', '-crf', '19', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', out], check=True); parts.append(out)
open('out/exp/lista.txt', 'w').write(''.join(f"file '{os.path.basename(p)}'\n" for p in parts))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'out/exp/lista.txt', '-c', 'copy', 'out/exp/mudo.mp4'], check=True)
