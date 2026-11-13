// Score for prova-3d. 120 BPM, 4 bars of 4/4. Every hit sits on an on-screen event.
import { place, voices } from '../../lib/synth.mjs';

export default function score({ mix, grid, spb }) {
  const B = (i) => grid[0] + i * spb;   // beat i in seconds
  const E = spb / 2;                     // an 8th
  const roots = [33, 29, 36, 33];        // A F C A
  const chords = [[57, 60, 64], [53, 57, 60], [55, 60, 64], [57, 64, 69]];

  // S1: a low thud per letter landing on the 8ths, pitched up the word.
  [0, 1, 2, 3, 4].forEach((i) => {
    place(mix, B(0) + i * E, 0.5, voices.kick({ f0: 120 + i * 12, f1: 40, decay: 0.22 }), { gain: 0.85, pan: -0.5 + i * 0.25 });
    place(mix, B(0) + i * E, 0.2, voices.blip({ note: [57, 60, 64, 67, 69][i] + 12, decay: 0.07, shape: 0.5 }), { gain: 0.35, pan: -0.5 + i * 0.25 });
  });
  place(mix, B(0), 1.2, voices.impact({ seed: 3, decay: 0.45 }), { gain: 0.5 });

  // Groove from S2 on: four on the floor, 8th-note bass.
  for (let i = 4; i < 12; i++) place(mix, B(i), 0.5, voices.kick(), { gain: i % 4 === 0 ? 0.9 : 0.75 });
  for (let bar = 1; bar < 3; bar++)
    for (let e = 0; e < 8; e++)
      place(mix, B(bar * 4) + e * E, E, voices.bass({ note: roots[bar] + (e === 7 ? 12 : 0), len: E - 0.01 }), { gain: 0.5 });
  for (let i = 4; i < 12; i++) place(mix, B(i) + E, 0.1, voices.hat({ seed: i * 3, decay: 0.04 }), { gain: 0.45, pan: 0.3 });

  // S2: a rising blip on each flip's take-off (every 3/4 beat), a snap on each landing.
  for (let i = 0; i < 5; i++) {
    const f0 = B(4) + i * spb * 0.75;
    place(mix, f0, 0.3, voices.blip({ note: 76 + i * 2, decay: 0.1, shape: 0.7 }), { gain: 0.45, pan: -0.5 + i * 0.25 });
    place(mix, f0 + 0.42, 0.3, voices.snap({ seed: 20 + i }), { gain: 0.55, pan: -0.5 + i * 0.25 });
  }
  place(mix, B(4), 4 * spb, voices.pad({ notes: chords[1], len: 4 * spb }), { gain: 0.3 });

  // S3: the O rises, the rest drop away, then the riser into the fly-through.
  place(mix, B(8), 0.8, voices.impact({ seed: 6, decay: 0.3 }), { gain: 0.55 });
  place(mix, B(8), 4 * spb, voices.pad({ notes: chords[2], len: 4 * spb }), { gain: 0.3 });
  place(mix, B(9.8), 2.2 * spb, voices.riser({ seed: 9, len: 2.2 * spb }), { gain: 0.6 });

  // S4: the tower. A thud per letter, low to high, on the 8ths; a big hit when P lands on top.
  [0, 1, 2, 3, 4].forEach((i) => {
    const land = B(12) + i * E;
    place(mix, land, 0.5, voices.kick({ f0: 170 - i * 8, f1: 45, decay: 0.2 }), { gain: 0.85 });
    place(mix, land, 0.25, voices.hat({ seed: 50 + i, decay: 0.03 }), { gain: 0.35, pan: i % 2 ? 0.4 : -0.4 });
  });
  place(mix, B(12) + 4 * E, 2.2, voices.impact({ seed: 11, decay: 0.9 }), { gain: 0.95 });
  place(mix, B(12) + 4 * E, 3 * spb, voices.pad({ notes: chords[3], len: 3 * spb }), { gain: 0.4 });
  // Caption types on over beat 14-15: fast ticks.
  for (let k = 0; k < 18; k++) place(mix, B(14) + k * (spb / 18), 0.03, voices.hat({ seed: 80 + k, decay: 0.006 }), { gain: 0.45, pan: 0.2 });
}
