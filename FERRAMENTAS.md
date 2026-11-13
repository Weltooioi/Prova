# Ferramentas de vídeo

| Ferramenta | Uso rápido |
|---|---|
| **FFmpeg** | `ffmpeg -i entrada.mov saida.mp4` |
| **yt-dlp** | `yt-dlp URL` · só áudio: `yt-dlp -x --audio-format mp3 URL` |
| **Whisper** | `whisper audio.mp3 --model small --language pt --fp16 False --output_format srt` |
| **Remotion** | `cd remotion-app && npm install && npx remotion render HelloWorld out/video.mp4` |
| **HyperFrames** | `cd hyperframes-app && npx hyperframes render -o renders/video.mp4` |

Observações:
- Whisper roda em CPU (sem GPU): modelos `tiny`/`base`/`small` são rápidos; `medium`/`large` são lentos.
- O YouTube bloqueia downloads vindos de servidores na nuvem (erro 403). Outros sites funcionam.
- yt-dlp está configurado em `~/.config/yt-dlp/config` para usar o Node como runtime JS.

## Estúdio de motion (motor próprio)

Regras de qualidade em `CLAUDE.md`, instalação em `SETUP.md`.

```
npm install                              # só fora da nuvem; nas sessões na nuvem o Playwright já vem instalado
node render.mjs prova-intro --contact    # folha de contato: um quadro por batida
node render.mjs prova-intro              # vídeo final em films/prova-intro/out/
```

Cada filme fica em `films/<nome>/` (`film.js` desenha, `score.mjs` gera o som).

### 3D (Three.js)

`films/prova-3d/` mostra como fazer: a cena 3D é posicionada a partir de `t` e desenhada no quadro.
Three.js, opentype.js e a fonte Inter Display Black ficam em `lib/vendor/` e `assets/fonts/` (funciona sem instalar nada).
Importe `lib/three-shim.js` antes de `three` para manter o render determinístico.
