// node tools/serve.mjs [port]  — preview server. Open /films/<film>/index.html for scrub + play.
import { serve } from './common.mjs';
const { url } = await serve(Number(process.argv[2] || 5173));
console.log(`preview: ${url}/films/`);
