# Monta as fichas de referência do Jack (fundo neutro, nomes numa faixa abaixo de cada imagem)
from PIL import Image, ImageDraw, ImageFont
F = '/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf'; R = 'st/ref/s_%d.00.jpg'
def sheet(items, crop, title, out, scale=1.0):
    ims = [Image.open(R % i).crop(crop) for i, _ in items]
    w, h = ims[0].size; w, h = int(w * scale), int(h * scale); ims = [im.resize((w, h), Image.LANCZOS) for im in ims]
    pad, lab, top = 24, 70, 110; W = len(ims) * w + (len(ims) + 1) * pad; H = top + h + lab + pad
    S = Image.new('RGB', (W, H), '#f6f7f9'); d = ImageDraw.Draw(S)
    ft = ImageFont.truetype(F, 52); fl = ImageFont.truetype(F, 34)
    d.text((W / 2, top / 2), title, font=ft, fill='#2b2f3a', anchor='mm')
    for k, (im, (_, name)) in enumerate(zip(ims, items)):
        x = pad + k * (w + pad); S.paste(im, (x, top)); d.text((x + w / 2, top + h + lab / 2), name, font=fl, fill='#4a5060', anchor='mm')
    S.save(out, quality=95); print(out, S.size)
sheet([(0, 'FRENTE'), (1, 'TRÊS QUARTOS'), (2, 'LADO'), (3, 'COSTAS')], (90, 40, 630, 1240), 'O CURIOSO JACK · VISTAS', 'out/ref/Jack_ficha_vistas.png')
sheet([(4, 'NEUTRO'), (5, 'FELIZ'), (6, 'SURPRESO'), (7, 'PENSANDO'), (8, 'TRISTE'), (9, 'DETALHE')], (0, 330, 720, 1280), 'O CURIOSO JACK · EXPRESSÕES', 'out/ref/Jack_ficha_expressoes.png', .7)
sheet([(10, 'ANDANDO'), (11, 'APONTANDO'), (12, 'JOINHA'), (13, 'ACENANDO')], (0, 40, 720, 1240), 'O CURIOSO JACK · POSES', 'out/ref/Jack_ficha_poses.png')
im = Image.open(R % 0).crop((40, 40, 680, 1240)); im.save('out/ref/Jack_frente_limpo.png'); print('limpo', im.size)
