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
