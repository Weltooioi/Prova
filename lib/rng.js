// Seeded randomness. The only randomness allowed anywhere in a film.
// Works in the browser (ES module) and in Node.

/** mulberry32: tiny, fast, good-enough 32-bit PRNG. Returns () => [0,1). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stateless hash of integers -> [0,1). Use this inside seek(t): same inputs, same output. */
export function hash(...ints) {
  let h = 0x811c9dc5;
  for (const n of ints) {
    h = Math.imul(h ^ (n | 0), 0x01000193);
    h ^= h >>> 13;
  }
  return mulberry32(h)();
}

/** 1D value noise, smooth, stateless. */
export function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(seed, i) * (1 - u) + hash(seed, i + 1) * u;
}

/** 2D value noise, smooth, stateless. */
export function noise2(x, y, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(seed, xi, yi), b = hash(seed, xi + 1, yi);
  const c = hash(seed, xi, yi + 1), d = hash(seed, xi + 1, yi + 1);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}
