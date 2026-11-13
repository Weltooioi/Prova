// Import this before 'three' in a film. Three.js draws object UUIDs from Math.random and arms an idle
// animation loop with requestAnimationFrame; neither touches the pixels. The render guard bans both, so:
// UUIDs come from a seeded generator (same ids every run), and in render mode the loop is made inert.
import { RENDER } from './runtime.js';
import { mulberry32 } from './rng.js';

Math.random = mulberry32(0x3d3d);
if (RENDER) {
  window.requestAnimationFrame = () => 0;
  window.cancelAnimationFrame = () => {};
}
