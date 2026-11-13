# Setup

```bash
# 1. Node 20+ and ffmpeg
node -v && ffmpeg -version

# 2. Headless browser for rendering
npm install
npx playwright install chromium     # skip in Claude Code cloud sessions: Chromium is pre-installed

# 3. Framework skills (optional, route B)
npx skills add remotion-dev/skills          # /remotion-create, /remotion-render
npx skills add heygen-com/hyperframes       # /hyperframes router + GSAP skills

# 4. Hand-drawn look (optional): node-canvas rough pens, synthesized sound
claude plugin marketplace add buildwithhanif/claude-animation-skill
claude plugin install claude-animation@claude-animation-skill

# 5. Start Claude Code on Opus 5.5
npm install -g @anthropic-ai/claude-code
claude --model claude-opus-5-5
# /model -> Opus 5.5; effort xhigh for one-shots, max for flagship pieces
```

Fonts: install Inter Display and JetBrains Mono system-wide (both are free) so renders match across machines.

Then: `node render.mjs prova-intro --contact`, look at `films/prova-intro/out/contact.png`, then `node render.mjs prova-intro`.
