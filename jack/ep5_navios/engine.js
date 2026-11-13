// Motor 3D do Curioso Jack (WebGL2). Cada quadro é função pura do tempo.
const W = 720, H = 1280;
const canvas = document.getElementById('gl');
const gl = canvas.getContext('webgl2', { antialias: true, preserveDrawingBuffer: true, alpha: false });
const out = document.getElementById('out'); const ctx = out.getContext('2d');

// ---------- matemática ----------
const Mx = {
  I: () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  mul(a, b) { const r = new Array(16); for (let c = 0; c < 4; c++) for (let w = 0; w < 4; w++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + w] * b[c * 4 + k]; r[c * 4 + w] = s; } return r; },
  T: (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1],
  S: (x, y, z) => { if (y === undefined) { y = x; z = x; } return [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]; },
  Rx(a) { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]; },
  Ry(a) { const c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; },
  Rz(a) { const c = Math.cos(a), s = Math.sin(a); return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; },
  chain(...m) { return m.reduce((a, b) => Mx.mul(a, b)); },
  pt(m, p) { return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]]; },
  persp(f, a, n, fa) { const t = 1 / Math.tan(f / 2); return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (fa + n) / (n - fa), -1, 0, 0, 2 * fa * n / (n - fa), 0]; },
  ortho(r, n, f) { return [1 / r, 0, 0, 0, 0, 1 / r, 0, 0, 0, 0, -2 / (f - n), 0, 0, 0, -(f + n) / (f - n), 1]; },
  look(e, c, u) { const z = V.norm(V.sub(e, c)), x = V.norm(V.cross(u, z)), y = V.cross(z, x); return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -V.dot(x, e), -V.dot(y, e), -V.dot(z, e), 1]; },
  nrm(m) { // inversa transposta 3x3
    const a = m[0], b = m[1], c = m[2], d = m[4], e = m[5], f = m[6], g = m[8], h = m[9], i = m[10];
    const A = e * i - f * h, B = f * g - d * i, C = d * h - e * g, det = a * A + b * B + c * C || 1e-9;
    return [A / det, B / det, C / det, (c * h - b * i) / det, (a * i - c * g) / det, (b * g - a * h) / det, (b * f - c * e) / det, (c * d - a * f) / det, (a * e - b * d) / det];
  }
};
const V = {
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s], dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm(a) { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  mix: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
};
const E = {
  c01: x => Math.max(0, Math.min(1, x)),
  seg: (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a))),
  ss: x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); },
  sseg: (t, a, b) => E.ss((t - a) / (b - a)),
  mix: (a, b, t) => a + (b - a) * t,
  inq: x => x * x, outq: x => 1 - (1 - x) * (1 - x),
  back: x => { const c = 1.70158; x = E.c01(x); return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); },
};
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- geometria ----------
function mkGeo(P, N, I) {
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  const b = (d, loc) => { const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(d), gl.STATIC_DRAW); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0); };
  b(P, 0); b(N, 1);
  const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(I), gl.STATIC_DRAW);
  gl.bindVertexArray(null); return { vao, n: I.length };
}
// superfície de revolução: perfil [[r,y],...] de cima para baixo
function lathe(prof, seg = 24, smooth = false) {
  const P = [], N = [], I = []; const n = prof.length;
  const sn = []; for (let i = 0; i < n - 1; i++) { const dr = prof[i + 1][0] - prof[i][0], dy = prof[i + 1][1] - prof[i][1], l = Math.hypot(dr, dy) || 1; sn.push([-dy / l, dr / l]); }
  const ring = (r, y, nr, ny) => { for (let j = 0; j <= seg; j++) { const a = j / seg * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); P.push(r * c, y, r * s); N.push(nr * c, ny, nr * s); } };
  if (smooth) {
    for (let i = 0; i < n; i++) { const a = sn[Math.max(0, i - 1)], b = sn[Math.min(n - 2, i)]; let nr = a[0] + b[0], ny = a[1] + b[1]; const l = Math.hypot(nr, ny) || 1; ring(prof[i][0], prof[i][1], nr / l, ny / l); }
    for (let i = 0; i < n - 1; i++) for (let j = 0; j < seg; j++) { const a = i * (seg + 1) + j, b = a + seg + 1; I.push(a, b, a + 1, a + 1, b, b + 1); }
  } else {
    for (let i = 0; i < n - 1; i++) { ring(prof[i][0], prof[i][1], sn[i][0], sn[i][1]); ring(prof[i + 1][0], prof[i + 1][1], sn[i][0], sn[i][1]); const o = i * 2 * (seg + 1); for (let j = 0; j < seg; j++) { const a = o + j, b = a + seg + 1; I.push(a, b, a + 1, a + 1, b, b + 1); } }
  }
  return mkGeo(P, N, I);
}
function arcProf(r, y0, a0, a1, k) { const p = []; for (let i = 0; i <= k; i++) { const a = a0 + (a1 - a0) * i / k; p.push([Math.max(0, r * Math.sin(a)), y0 + r * Math.cos(a)]); } return p; }
const SPH = lathe(arcProf(1, 0, 0, Math.PI, 18), 28, true);                 // raio 1
const CYL = lathe([[0, .5], [1, .5], [1, -.5], [0, -.5]], 28);               // raio 1, altura 1 centrada
const CONE = lathe([[0, 1], [1, 0], [0, 0]], 24);                            // base em y=0, ponta em y=1
const DISC = lathe([[0, 0], [1, 0]], 28);
const _caps = {};
function CAP(r, len) { const k = r + '_' + len; if (!_caps[k]) _caps[k] = lathe(arcProf(r, 0, 0, Math.PI / 2, 7).concat(arcProf(r, -len, Math.PI / 2, Math.PI, 7)), 18, true); return _caps[k]; }
const _tor = {};
function TORUS(r) { if (_tor[r]) return _tor[r]; const P = [], N = [], I = [], S1 = 40, S2 = 10; for (let i = 0; i <= S1; i++) { const a = i / S1 * Math.PI * 2; for (let j = 0; j <= S2; j++) { const b = j / S2 * Math.PI * 2; const cx = Math.cos(a), cz = Math.sin(a); P.push((1 + r * Math.cos(b)) * cx, r * Math.sin(b), (1 + r * Math.cos(b)) * cz); N.push(Math.cos(b) * cx, Math.sin(b), Math.cos(b) * cz); } } for (let i = 0; i < S1; i++) for (let j = 0; j < S2; j++) { const a = i * (S2 + 1) + j, b = a + S2 + 1; I.push(a, b, a + 1, a + 1, b, b + 1); } return _tor[r] = mkGeo(P, N, I); }
const BOX = (() => { const P = [], N = [], I = []; const f = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]; f.forEach((n, k) => { const u = [n[1], n[2], n[0]], v = V.cross(n, u); [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => { P.push(...[0, 1, 2].map(i => (n[i] + u[i] * a + v[i] * b) * .5)); N.push(...n); }); I.push(k * 4, k * 4 + 1, k * 4 + 2, k * 4, k * 4 + 2, k * 4 + 3); }); return mkGeo(P, N, I); })();
function PLANE(n) { const P = [], N = [], I = []; for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) { P.push(j / n - .5, 0, i / n - .5); N.push(0, 1, 0); } for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const a = i * (n + 1) + j, b = a + n + 1; I.push(a, b, a + 1, a + 1, b, b + 1); } return mkGeo(P, N, I); }
const PL1 = PLANE(1), PLW = PLANE(220);

// ---------- shaders ----------
const WAVE = `float wav(vec2 p,float t){ float a=smoothstep(0.5,6.,p.y); return a*(0.09*sin(0.55*p.y-1.3*t+0.25*p.x)+0.045*sin(1.2*p.x+0.8*p.y-1.9*t))+0.012*sin(3.*p.y-2.5*t); }`;
function waveH(x, z, t) { const a = E.ss((z - .5) / 5.5); return a * (0.09 * Math.sin(0.55 * z - 1.3 * t + 0.25 * x) + 0.045 * Math.sin(1.2 * x + 0.8 * z - 1.9 * t)) + 0.012 * Math.sin(3 * z - 2.5 * t); }
const VS = `#version 300 es
layout(location=0) in vec3 aP; layout(location=1) in vec3 aN;
uniform mat4 uM,uVP,uLVP; uniform mat3 uNm; uniform float uWater,uT;
out vec3 vW,vN,vO; out vec4 vL;
${WAVE}
void main(){ vec4 w=uM*vec4(aP,1.); vec3 n=uNm*aN;
 if(uWater>.5&&uWater<1.5){ float fd=smoothstep(.5,.42,max(abs(aP.x),abs(aP.z))); float e=.15; float h=wav(w.xz,uT)*fd; w.y+=h; float hx=wav(w.xz+vec2(e,0.),uT)*fd, hz=wav(w.xz+vec2(0.,e),uT)*fd; n=vec3(-(hx-h)/e,1.,-(hz-h)/e); }
 vW=w.xyz; vN=n; vO=aP; vL=uLVP*w; gl_Position=uVP*w; }`;
const FS = `#version 300 es
precision highp float; precision highp sampler2DShadow;
in vec3 vW,vN,vO; in vec4 vL; out vec4 o;
uniform vec3 uC,uE,uSun,uSunC,uSky,uGnd,uEye,uFog; uniform vec4 uPat;
uniform float uSpec,uGloss,uUnlit,uA,uWater,uT,uFogD,uRim,uShOn; uniform sampler2DShadow uSh; uniform vec2 uRes;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float shadow(){ if(uShOn<.5) return 1.; vec3 q=vL.xyz/vL.w*.5+.5; if(q.x<0.||q.x>1.||q.y<0.||q.y>1.||q.z>1.) return 1.; float s=0.; float tx=1.5/2048.; for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++) s+=texture(uSh,vec3(q.xy+vec2(x,y)*tx,q.z-0.0022)); return s/9.; }
void main(){
 vec3 n=normalize(vN); vec3 c=uC; float a=uA; int pt=int(uPat.x+.5);
 if(pt==1){ float g=noise(vec2(vO.y*uPat.y*7.,atan(vO.x,vO.z)*4.)); c*=mix(1.,.62,g*uPat.z); }
 else if(pt==2){ c*=.9+.2*noise(vW.xz*14.); c*=mix(.7,1.,smoothstep(-0.02,0.12,vW.y)); c=mix(c*vec3(.75,.85,.9),c,smoothstep(-.7,-.05,vW.y)); }
 else if(pt==3){ float r=length(vO.xz); c*=.82+.18*sin(r*uPat.y); }
 else if(pt==4){ float s=step(.5,fract(vO.y*uPat.y+.25)); c*=mix(1.,uPat.z,s); }
 else if(pt==5){ float s=step(.5,fract(vO.x*uPat.y)); c*=mix(1.,uPat.z,s); }
 vec3 Vv=normalize(uEye-vW);
 if(uWater>.5){
   float depth=0.12*vW.z;
   c=mix(vec3(.05,.62,.64),vec3(.008,.17,.42),smoothstep(0.,2.6,depth));
   float fr=pow(1.-max(dot(n,Vv),0.),3.); c=mix(c,uSky,fr*.55);
   float sp=pow(max(dot(reflect(-uSun,n),Vv),0.),160.);
   float foam=smoothstep(.06,.0,depth+0.02*sin(vW.x*2.+uT*1.5)+0.025*sin(uT*.9));
   foam+=smoothstep(.72,1.,noise(vW.xz*2.5+vec2(uT*.25,-uT*.4)))*.22*smoothstep(0.2,1.5,depth);
   float sh=mix(.55,1.,shadow());
   c=c*(uSunC*.6*max(dot(n,uSun),0.)*sh+uSky*.55)+sp*uSunC*1.6*sh; c=mix(c,vec3(1.1),clamp(foam,0.,1.));
   a=max(mix(.45,.95,smoothstep(0.,.9,depth)),clamp(foam,0.,1.));
 } else if(uUnlit<.5){
   float sh=shadow(); float d=max(dot(n,uSun),0.);
   vec3 amb=mix(uGnd,uSky,n.y*.5+.5);
   float sp=pow(max(dot(reflect(-uSun,n),Vv),0.),uGloss)*uSpec*sh;
   float rim=pow(1.-max(dot(n,Vv),0.),3.)*uRim;
   c=c*(amb+uSunC*d*sh)+sp*uSunC+rim*uSky*.5+uE;
 } else c=c+uE;
 float f=1.-exp(-length(uEye-vW)*uFogD); c=mix(c,uFog,f);
 c=1.-exp(-c*1.25); c=pow(c,vec3(1./2.2));
 vec2 uv=gl_FragCoord.xy/uRes-.5; c*=1.-dot(uv,uv)*.3;
 o=vec4(c,a); }`;
const VSS = `#version 300 es
layout(location=0) in vec3 aP; uniform mat4 uM,uLVP; void main(){ gl_Position=uLVP*uM*vec4(aP,1.); }`;
const FSS = `#version 300 es
precision highp float; void main(){}`;
const VSK = `#version 300 es
out vec2 uv; void main(){ vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2)); uv=p*2.-1.; gl_Position=vec4(uv,0.9999,1.); }`;
const FSK = `#version 300 es
precision highp float; in vec2 uv; out vec4 o; uniform vec3 uR,uU,uF,uSun,uZen,uHor,uFog; uniform float uTan,uAsp;
void main(){ vec3 d=normalize(uF+uR*uv.x*uTan*uAsp+uU*uv.y*uTan); float h=max(d.y,0.);
 vec3 c=mix(uHor,uZen,pow(h,.55)); c=mix(c,uFog,smoothstep(0.02,-0.05,d.y));
 float s=max(dot(d,uSun),0.); c+=vec3(1.,.85,.6)*(pow(s,600.)*4.+pow(s,24.)*.25);
 c=1.-exp(-c*1.25); c=pow(c,vec3(1./2.2)); vec2 q=uv*.5; c*=1.-dot(q,q)*.3; o=vec4(c,1.); }`;
function prog(vs, fs) { const p = gl.createProgram(); for (const [t, s] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); gl.attachShader(p, sh); } gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const nm = gl.getActiveUniform(p, i).name; u[nm] = gl.getUniformLocation(p, nm); } return { p, u }; }
const PM = prog(VS, FS), PS = prog(VSS, FSS), PK = prog(VSK, FSK);
// mapa de sombras
const SM = 2048; const shTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, shTex);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, SM, SM, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
const shFB = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, shFB); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shTex, 0); gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE); gl.bindFramebuffer(gl.FRAMEBUFFER, null);

// ---------- materiais e lista de desenho ----------
function lin(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) / 255, (n >> 8 & 255) / 255, (n & 255) / 255].map(v => Math.pow(v, 2.2)); }
const _mc = {};
function M(hex, o) { if (!o) { return _mc[hex] || (_mc[hex] = { c: lin(hex) }); } return Object.assign({ c: lin(hex) }, o); }
const R = { list: [], t: 0, sun: V.norm([-.45, .75, -.4]), sunC: [1.25, 1.12, .95], sky: [.55, .68, .9], gnd: [.42, .36, .28], zen: [.18, .42, .85], hor: [.72, .86, .98], fog: [.72, .84, .95], fogD: .0045, shC: [0, 0, 0], shR: 6, overlay: null };
function beginFrame(t) { R.list = []; R.t = t; R.overlay = null; }
function camera(eye, tgt, fov = .8) { R.eye = eye; R.tgt = tgt; R.fov = fov; }
function draw(geo, mat, m) { R.list.push({ geo, mat, m }); }
function flush() {
  const f = V.norm(V.sub(R.tgt, R.eye)), r = V.norm(V.cross(f, [0, 1, 0])), u = V.cross(r, f);
  const VP = Mx.mul(Mx.persp(R.fov, W / H, .08, 600), Mx.look(R.eye, R.tgt, [0, 1, 0]));
  R.VP = VP;
  const le = V.add(R.shC, V.mul(R.sun, 40)); const LVP = Mx.mul(Mx.ortho(R.shR, 1, 90), Mx.look(le, R.shC, [0, 1, 0]));
  gl.enable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
  // sombras
  gl.bindFramebuffer(gl.FRAMEBUFFER, shFB); gl.viewport(0, 0, SM, SM); gl.clear(gl.DEPTH_BUFFER_BIT); gl.useProgram(PS.p); gl.uniformMatrix4fv(PS.u.uLVP, false, LVP);
  gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(2, 4);
  for (const d of R.list) { if (d.mat.water || d.mat.nosh || d.mat.mask || (d.mat.a !== undefined && d.mat.a < .99)) continue; gl.uniformMatrix4fv(PS.u.uM, false, d.m); gl.bindVertexArray(d.geo.vao); gl.drawElements(gl.TRIANGLES, d.geo.n, gl.UNSIGNED_INT, 0); }
  gl.disable(gl.POLYGON_OFFSET_FILL);
  // céu
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(PK.p); gl.depthMask(false); gl.disable(gl.BLEND);
  gl.uniform3fv(PK.u.uR, r); gl.uniform3fv(PK.u.uU, u); gl.uniform3fv(PK.u.uF, f); gl.uniform3fv(PK.u.uSun, R.sun); gl.uniform3fv(PK.u.uZen, R.zen); gl.uniform3fv(PK.u.uHor, R.hor); gl.uniform3fv(PK.u.uFog, R.fog);
  gl.uniform1f(PK.u.uTan, Math.tan(R.fov / 2)); gl.uniform1f(PK.u.uAsp, W / H); gl.bindVertexArray(null); gl.drawArrays(gl.TRIANGLES, 0, 3); gl.depthMask(true);
  // cena
  const U = PM.u; gl.useProgram(PM.p);
  gl.uniformMatrix4fv(U.uVP, false, VP); gl.uniformMatrix4fv(U.uLVP, false, LVP); gl.uniform3fv(U.uSun, R.sun); gl.uniform3fv(U.uSunC, R.sunC); gl.uniform3fv(U.uSky, R.sky); gl.uniform3fv(U.uGnd, R.gnd);
  gl.uniform3fv(U.uEye, R.eye); gl.uniform3fv(U.uFog, R.fog); gl.uniform1f(U.uFogD, R.fogD); gl.uniform1f(U.uT, R.t); gl.uniform2f(U.uRes, W, H);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, shTex); gl.uniform1i(U.uSh, 0);
  const one = d => { const m = d.mat; gl.uniformMatrix4fv(U.uM, false, d.m); gl.uniformMatrix3fv(U.uNm, false, Mx.nrm(d.m)); gl.uniform3fv(U.uC, m.c); gl.uniform3fv(U.uE, m.e || [0, 0, 0]); gl.uniform4fv(U.uPat, m.pat || [0, 0, 0, 0]);
    gl.uniform1f(U.uSpec, m.spec || 0); gl.uniform1f(U.uGloss, m.gloss || 30); gl.uniform1f(U.uUnlit, m.unlit ? 1 : 0); gl.uniform1f(U.uA, m.a === undefined ? 1 : m.a); gl.uniform1f(U.uWater, m.water || 0); gl.uniform1f(U.uRim, m.rim === undefined ? .25 : m.rim); gl.uniform1f(U.uShOn, m.norecv ? 0 : 1);
    gl.bindVertexArray(d.geo.vao); gl.drawElements(gl.TRIANGLES, d.geo.n, gl.UNSIGNED_INT, 0); };
  const tr = d => d.mat.water || (d.mat.a !== undefined && d.mat.a < .99);
  gl.disable(gl.BLEND); for (const d of R.list) if (!tr(d) && !d.mat.mask) one(d);
  gl.colorMask(false, false, false, false); for (const d of R.list) if (d.mat.mask) one(d); gl.colorMask(true, true, true, true);
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  const T = R.list.filter(tr).map(d => ({ d, z: -V.dot(V.sub([d.m[12], d.m[13], d.m[14]], R.eye), f) - (d.mat.water ? 1e6 : 0) })).sort((a, b) => a.z - b.z);
  for (const x of T) { gl.depthMask(!!x.d.mat.water); one(x.d); } gl.depthMask(true); gl.disable(gl.BLEND);
  gl.finish();
}
function renderFrame(t) {
  window.scene(t); flush();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.drawImage(canvas, 0, 0); if (R.overlay) R.overlay(ctx);
  return out.toDataURL('image/jpeg', .92);
}
function proj(p) { const m = R.VP, x = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], y = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15]; return [(x / w * .5 + .5) * W, (1 - (y / w * .5 + .5)) * H, w]; }
window.READY = true;
