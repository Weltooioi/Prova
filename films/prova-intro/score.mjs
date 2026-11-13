// Score for prova-intro. 120 BPM, 6 bars of 4/4. Pure function of the beat grid.
import { place, voices } from '../../lib/synth.mjs';

export default function score({ mix, grid, spb }) {
  const B = (i) => grid[0] + i * spb;            // beat i in seconds
  const roots = [33, 29, 36, 31, 33, 33];          // A F C G A A
  const chords = [[57, 60, 64], [53, 57, 60], [55, 60, 64], [55, 59, 62], [57, 60, 64], [57, 64, 71]];

  // Kick: four on the floor, dropping out under the S2 lines, last hit on beat 23.
  for (let i = 0; i < 24; i++) {
    if (i >= 4 && i < 8 && i % 2 === 1) continue;
    place(mix, B(i), 0.5, voices.kick(), { gain: i % 4 === 0 ? 0.95 : 0.8 });
  }
  // Bass, one root per bar, pumping on the 8ths after each kick.
  for (let bar = 0; bar < 6; bar++)
    for (let e = 0; e < 8; e++) {
      if (bar === 5 && e > 1) break;
      const t = B(bar * 4) + e * spb / 2 + spb * 0.25 * (e % 2 === 0 ? 0.3 : 0);
      place(mix, t, spb / 2, voices.bass({ note: roots[bar] + (e === 7 ? 12 : 0), len: spb / 2 - 0.01 }), { gain: 0.55 });
    }
  // Pads under S2 and S6.
  place(mix, B(4), 4 * spb, voices.pad({ notes: chords[1], len: 4 * spb }), { gain: 0.35 });
  place(mix, B(20), 6 * spb, voices.pad({ notes: chords[5], len: 6 * spb }), { gain: 0.45 });

  // S1: a blip per letter on the 8ths, rising.
  [69, 72, 74, 76, 81].forEach((n, i) => place(mix, B(0) + i * spb / 2, 0.3, voices.blip({ note: n + 12, decay: 0.09 }), { gain: 0.5, pan: -0.6 + i * 0.3 }));
  place(mix, B(0), 1.2, voices.impact({ decay: 0.5 }), { gain: 0.8 });
  place(mix, B(3), 0.3, voices.snap(), { gain: 0.7 });
  place(mix, B(2), 2 * spb, voices.riser({ len: 2 * spb }), { gain: 0.5 });

  // S2: a blip per line, then the code line ticks.
  [76, 79, 84].forEach((n, i) => place(mix, B(4 + i), 0.4, voices.blip({ note: n, decay: 0.14, shape: 0.6 }), { gain: 0.55 }));
  for (let k = 0; k < 14; k++) place(mix, B(7) + k * 0.03, 0.03, voices.hat({ seed: 40 + k, decay: 0.008 }), { gain: 0.5, pan: 0.4 });

  // Hats from S3 on: 16ths in S3/S4, 8ths after.
  for (let i = 8; i < 22; i++) {
    const subs = i < 16 ? 4 : 2;
    for (let s = 0; s < subs; s++) {
      if (s === 0) continue;
      place(mix, B(i) + (s * spb) / subs, 0.1, voices.hat({ seed: i * 7 + s, decay: s === subs / 2 ? 0.05 : 0.025 }), { gain: s === subs / 2 ? 0.55 : 0.3, pan: s % 2 ? 0.3 : -0.3 });
    }
  }
  // S3: curve swaps on beats 10 and 11.
  place(mix, B(10), 0.3, voices.blip({ note: 88, decay: 0.06 }), { gain: 0.4 });
  place(mix, B(11), 0.3, voices.blip({ note: 91, decay: 0.06 }), { gain: 0.4 });
  // S4/S5: backbeat snaps.
  for (let i = 13; i < 20; i += 2) place(mix, B(i), 0.3, voices.snap({ seed: i }), { gain: 0.6 });
  // Section hits.
  place(mix, B(4), 0.8, voices.impact({ seed: 5, decay: 0.25 }), { gain: 0.5 });
  place(mix, B(8), 0.8, voices.impact({ seed: 6, decay: 0.3 }), { gain: 0.6 });
  place(mix, B(12), 0.8, voices.impact({ seed: 7, decay: 0.3 }), { gain: 0.6 });
  place(mix, B(14), 2 * spb, voices.riser({ seed: 8, len: 2 * spb }), { gain: 0.45 });
  place(mix, B(16), 1.0, voices.impact({ seed: 9, decay: 0.45 }), { gain: 0.8 });
  place(mix, B(18), 2 * spb, voices.riser({ seed: 10, len: 2 * spb }), { gain: 0.5 });
  place(mix, B(20), 1.8, voices.impact({ seed: 11, decay: 0.8 }), { gain: 0.95 });
  place(mix, B(21), 0.5, voices.blip({ note: 81, decay: 0.2, shape: 0.8 }), { gain: 0.45 });
  place(mix, B(23), 0.6, voices.blip({ note: 76, decay: 0.3, shape: 0.8 }), { gain: 0.4 });
}
