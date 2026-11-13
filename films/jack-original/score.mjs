// Model sheet: no score, just a quiet bed so the pipeline has audio.
import { place, voices } from '../../lib/synth.mjs';
export default function score({ mix, grid, spb }) {
  place(mix, grid[0], 14, voices.pad({ notes: [57, 60, 64], len: 14 }), { gain: 0.05 });
}
