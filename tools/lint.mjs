// node tools/lint.mjs <film>  — static check of the render contract on a film's own source.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { filmDir, args } from './common.mjs';

const RULES = [
  [/Math\.random\s*\(/, 'Math.random — use mulberry32 / hash from lib/rng.js'],
  [/\bsetTimeout\s*\(|\bsetInterval\s*\(/, 'timers — derive everything from t'],
  [/requestAnimationFrame\s*\(/, 'requestAnimationFrame — the renderer drives seek(t)'],
  [/\btransition\s*:/, 'CSS transition — compute the value from t instead'],
  [/@keyframes|\banimation\s*:/, 'CSS animation — compute the value from t instead'],
  [/Date\.now\s*\(|performance\.now\s*\(|new Date\s*\(/, 'wall clock — the only clock is t'],
  [/\.animate\s*\(/, 'Web Animations API — compute the value from t instead'],
];

export function lint(dir) {
  const problems = [];
  for (const f of fs.readdirSync(dir)) {
    if (!/\.(m?js|html|css)$/.test(f) || f === 'score.mjs') continue;
    fs.readFileSync(path.join(dir, f), 'utf8').split('\n').forEach((line, i) => {
      if (/^\s*(\/\/|\*)/.test(line)) return;
      for (const [re, msg] of RULES) if (re.test(line)) problems.push(`${f}:${i + 1}  ${msg}\n    ${line.trim()}`);
    });
  }
  if (problems.length) {
    console.error(`lint: ${problems.length} render-contract violation(s) in ${path.basename(dir)}\n` + problems.join('\n'));
    return false;
  }
  console.log(`lint: ${path.basename(dir)} clean`);
  return true;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(lint(filmDir(args()._[0])) ? 0 : 1);
