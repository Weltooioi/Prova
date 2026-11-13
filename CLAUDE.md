# Motion studio rules

## Render contract
- Every film is a pure function of time: `window.seek(t)` paints frame t.
- No CSS transitions, no setTimeout, no requestAnimationFrame in render mode, no state carried between frames.
- Seeded noise only (mulberry32), never Math.random.
- Render with `node render.mjs`, encode H.264 yuv420p, CRF 16.

## Look
- Banned defaults: centered title on gradient, everything fading in, corner labels and frame borders, glow on UI chrome, generic particle bursts.
- One display face, one UI face. One accent color unless the brief says otherwise.
- Every 2 to 4 seconds something new must happen on screen.

## Sound
- Score and SFX are synthesized in code unless a track is supplied.
- Place hits on the measured beat grid (beats.json).
- Loudness -14 LUFS.

## Loop before you show me anything
1. Render one frame per beat as a contact sheet and LOOK at it.
2. Score it 1-10 on: hook in first 2s, readability at phone size, motion quality, variety, brand accuracy, sound.
3. Fix the 3 worst problems. Repeat until every score is 8+.
4. Only then do the full render.

---

# How this repo implements the rules

## Layout
```
render.mjs            entry point: lint -> sound -> beats -> frames -> mp4
lib/runtime.js        defineFilm({ fonts, setup, frame }) -> window.seek(t); preview scrubber when not ?render
lib/time.js           clamp, lerp, prog, ease.*, tween, lastBeat, beatPulse (all pure)
lib/rng.js            mulberry32, hash(...ints), noise1, noise2 (stateless, seeded)
lib/synth.mjs         offline synth: kick, hat, snap, blip, bass, pad, riser, impact, master
tools/sound.mjs       film score.mjs -> score.wav (skipped when film.json has "track")
tools/beats.mjs       MEASURES the beat grid from the audio -> beats.json {bpm, beats, downbeats}
tools/contact.mjs     one frame per beat -> out/contact.png (270px tiles = phone-size check)
tools/lint.mjs        static check for banned APIs in a film's source
tools/serve.mjs       preview server
films/<name>/         film.json, index.html, film.js, score.mjs
```

## Commands
```
node render.mjs <film> --contact     # step 1 of the loop: contact sheet, then Read the PNG
node render.mjs <film> --still 3.5   # one full-size frame
node tools/contact.mjs <film> --times 2.0,2.1,2.2   # zoom in on a transition
node render.mjs <film>               # full render -> films/<film>/out/<film>.mp4
node tools/serve.mjs                 # preview at http://127.0.0.1:5173/films/<film>/index.html
```

## Enforcement
- `render.mjs` refuses to run if `tools/lint.mjs` finds Math.random, timers, rAF, CSS transitions/animations,
  wall-clock reads or `.animate()` in a film's source.
- In render mode an init script replaces Math.random, setTimeout, setInterval and requestAnimationFrame with
  functions that throw, and forces `transition/animation: none` on every element.
- Beat-driven visuals read `film.beats` / `film.downbeats` (measured), never a hard-coded BPM.
- Audio: two-pass `loudnorm` to I=-14 LUFS, TP=-1 dBTP; the render prints the measured integrated loudness.

## New film
Copy `films/prova-intro`, edit `film.json` (width, height, fps, duration, bpm; or `"track": "music.wav"` to use a
supplied track, whose beats are then measured), write `frame(t, film)` in film.js and the score in score.mjs.
Fonts: the studio pair is Inter Display (display) + JetBrains Mono (UI); list them in `fonts` so they load before frame 0.

---

# O Curioso Jack (series rules override the studio defaults above)

The series method, script format, mandatory character rules and sound rules live in the `curioso-jack-animacao` skill;
load it for any Jack episode. In this repo:

- **The character and engine are the originals**, not a reconstruction: `lib/jack-engine/engine.js` (WebGL2 engine,
  no libraries) and `lib/jack-engine/jack.js` (`drawJack(P)`), extracted from `reference/jack/Jack_modelo_3D.html`.
  Load them as classic scripts before the film module; the page needs `<canvas id="gl">` (see `films/jack-original`).
  Each frame: `beginFrame(t)`, set `R`, `camera(...)`, `draw(...)` / `drawJack(...)`, `flush()`, then
  `film.ctx.drawImage(gl canvas)`.
- Blinking flattens the eye itself (`blink`); there is no skin eyelid. Do not add one.
- References: `reference/jack/ficha_*.png` (views, expressions, poses) and `como_e_feito_30s.mp4`.
  `films/jack-original` renders the same shots for side-by-side checks (`--still 0.5` … `13.5`).
- Differences from the studio defaults: 24 fps; the series look (low-poly, flat colours, warm sun, blue sky) instead of
  "one accent colour"; narration first, with effects and music at least 15 dB under the voice, not -14 LUFS music.
- Known gap: the original `drawJack` has no thumbs-up hand; the "joinha" pose shows a fist until one is added.
