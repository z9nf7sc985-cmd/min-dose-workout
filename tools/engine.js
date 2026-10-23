// MinDose stick-figure engine: poses (with 2-bone IK) -> animated SVG (SMIL) + static frames.
const L = { torso: 40, head: 13, hr: 8, ua: 22, fa: 20, th: 27, sh: 26, foot: 8 };
const R = Math.PI / 180, dir = a => [Math.cos(a * R), Math.sin(a * R)];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
const C = { near: '#eef3ff', far: '#7f8ca3', ghost: '#7cf29a', arrow: '#7cf29a', force: '#ffb547', prop: '#222a3a', propS: '#3d4860', txt: '#aab4c8' };
const VB = [0, -14, 220, 150], F = 128;

function ik(p, q, l1, l2, b) {
  const dx = q[0] - p[0], dy = q[1] - p[1];
  let d = Math.hypot(dx, dy); d = Math.min(Math.max(d, Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01);
  const th = Math.atan2(dy, dx), a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  const a1 = th - (b || 1) * a, j = [p[0] + l1 * Math.cos(a1), p[1] + l1 * Math.sin(a1)];
  const a2 = Math.atan2(q[1] - j[1], q[0] - j[0]);
  return [j, [j[0] + l2 * Math.cos(a2), j[1] + l2 * Math.sin(a2)]];
}
function solve(P) {
  const front = P.view === 'front' || P.view === 'top';
  const so = P.so != null ? P.so : (front ? 12 : 0), ho = P.ho != null ? P.ho : (front ? 7 : 0);
  const hip = P.hip, shC = add(hip, mul(dir(P.t), L.torso * (P.tk || 1))), perp = dir(P.t + 90);
  const pts = { hip, shoulder: shC };
  pts.head = add(shC, mul(dir(P.hd != null ? P.hd : P.t), L.head * (P.hk != null ? P.hk : 1)));
  const roots = { ln: add(hip, mul(perp, ho)), lf: add(hip, mul(perp, -ho)), an: add(shC, mul(perp, so)), af: add(shC, mul(perp, -so)) };
  pts.hipN = roots.ln; pts.hipF = roots.lf; pts.shN = roots.an; pts.shF = roots.af;
  const ref = v => Array.isArray(v) ? v : add(pts[v.ref], v.d || [0, 0]);
  const names = { ln: ['knee', 'ankle'], lf: ['kneef', 'anklef'], an: ['elbow', 'hand'], af: ['elbowf', 'handf'] };
  const out = {};
  for (const k of (P.order || ['ln', 'lf', 'an', 'af'])) {
    const s = P[k]; if (!s) continue;
    const leg = k[0] === 'l', k1 = (s.k || [1, 1])[0], k2 = (s.k || [1, 1])[1];
    const l1 = (leg ? L.th : L.ua) * k1, l2 = (leg ? L.sh : L.fa) * k2, r = roots[k];
    let j, e;
    if (s.a) { j = add(r, mul(dir(s.a[0]), l1)); e = add(j, mul(dir(s.a[1]), l2)); }
    else [j, e] = ik(r, ref(s.to), l1, l2, s.b);
    pts[names[k][0]] = j; pts[names[k][1]] = e;
    const seg = [r, j, e];
    if (leg && s.f != null) { const toe = add(e, mul(dir(s.f), (s.fl || L.foot))); seg.push(toe); pts[k === 'ln' ? 'toe' : 'toef'] = toe; }
    out[k] = seg;
  }
  const face = P.face != null ? P.face : 1;
  const nose = (P.n != null ? P.n : (P.hd != null ? P.hd : P.t) + 90 * face);
  return { P, pts, out, shC, roots, front, nose, noShow: P.view === 'front' || P.view === 'top' || face === 0 };
}
const f1 = n => Math.round(n * 10) / 10;
const pd = seg => 'M' + seg.map(p => f1(p[0]) + ' ' + f1(p[1])).join(' L');
function frameData(P) {
  const s = solve(P), o = {};
  o.af = s.out.af ? pd(s.out.af) : null; o.lf = s.out.lf ? pd(s.out.lf) : null;
  o.ln = s.out.ln ? pd(s.out.ln) : null; o.an = s.out.an ? pd(s.out.an) : null;
  o.torso = s.front ? `${pd([s.roots.lf, s.roots.ln])} ${pd([s.pts.hip, s.shC])} ${pd([s.roots.af, s.roots.an])}` : pd([s.pts.hip, s.shC]);
  o.hx = f1(s.pts.head[0]); o.hy = f1(s.pts.head[1]);
  const nd = dir(s.nose); o.nose = s.noShow ? null : pd([add(s.pts.head, mul(nd, L.hr - 1)), add(s.pts.head, mul(nd, L.hr + 3.5))]);
  if (P.belly != null) {
    const pp = dir(P.t + 90 * (P.face || 1)), a = add(add(s.pts.hip, mul(dir(P.t), 6)), mul(pp, 4)), b = add(add(s.pts.hip, mul(dir(P.t), 30)), mul(pp, 4));
    const m = add(mul(add(a, b), 0.5), mul(pp, P.belly * 2));
    o.belly = `M${f1(a[0])} ${f1(a[1])} Q${f1(m[0])} ${f1(m[1])} ${f1(b[0])} ${f1(b[1])}`;
  }
  return { o, s };
}
function lerp(a, b, u) {
  if (typeof a === 'number') return typeof b === 'number' ? a + (b - a) * u : a;
  if (Array.isArray(a)) return a.map((x, i) => lerp(x, b ? b[i] : x, u));
  if (a && typeof a === 'object') { const r = {}; for (const k of Object.keys(a)) r[k] = lerp(a[k], b && k in b ? b[k] : a[k], u); return r; }
  return a;
}
const ease = u => u * u * (3 - 2 * u);
function timeline(spec) {
  const P = spec.poses, n = P.length, hold = spec.hold != null ? spec.hold : 0.6, move = spec.move != null ? spec.move : 1.3, steps = spec.steps || 8;
  const holds = spec.holds || P.map(() => hold), moves = spec.moves || P.map(() => move);
  const fr = []; let t = 0;
  for (let i = 0; i < n; i++) {
    const a = P[i], b = P[(i + 1) % n];
    fr.push({ t, p: a, i }); t += holds[i]; fr.push({ t, p: a, i });
    if (n === 1) continue;
    for (let k = 1; k < steps; k++) fr.push({ t: t + moves[i] * k / steps, p: lerp(a, b, ease(k / steps)), i: -1 });
    t += moves[i];
  }
  fr.push({ t, p: P[0], i: 0 });
  return { fr, total: t };
}
// ---------- props ----------
const rect = (x, y, w, h, rx = 3) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${C.prop}" stroke="${C.propS}" stroke-width="1.5"/>`;
const PROPS = {
  floor: (o = {}) => `<line x1="0" y1="${o.y || F}" x2="220" y2="${o.y || F}" stroke="${C.propS}" stroke-width="2"/>`,
  couch: (o) => { const top = o.top, x = o.x, w = o.w, h = F - top; let s = '';
    if (o.back === 'l') s += rect(x - 4, top - 30, 12, h + 30, 4); if (o.back === 'r') s += rect(x + w - 8, top - 30, 12, h + 30, 4);
    if (o.gap) { s += rect(x, top, w, h - 12, 4); s += `<rect x="${x + 3}" y="${F - 12}" width="4" height="12" fill="${C.propS}"/><rect x="${x + w - 7}" y="${F - 12}" width="4" height="12" fill="${C.propS}"/>`; }
    else s += rect(x, top, w, h, 4); return s; },
  wall: (o) => `<rect x="${o.x}" y="-14" width="${o.w || 7}" height="${F + 14}" fill="${C.prop}" stroke="${C.propS}" stroke-width="1.5"/>`,
  step: (o) => rect(o.x, o.top, o.w, F - o.top, 2),
  cushion: (o) => rect(o.x, F - 5, o.w, 5, 2.5),
  stool: (o = {}) => rect(o.x || 50, o.top || 98, o.w || 42, F - (o.top || 98), 3),
  mat: () => `<rect x="4" y="6" width="212" height="118" rx="10" fill="#161c29" stroke="${C.propS}" stroke-width="1.5" stroke-dasharray="4 4"/>`,
  seatFront: (o = {}) => `${rect(86, 16, 48, 80, 8)}${rect(78, 92, 64, 10, 4)}${PROPS.floor()}${o.car ? `<text x="216" y="134" fill="${C.force}" font-size="8" font-family="system-ui,sans-serif" text-anchor="end" font-weight="700">PARKED · ENGINE OFF</text>` : ''}`,
  car: () => `<line x1="40" y1="${F - 4}" x2="220" y2="${F - 4}" stroke="${C.propS}" stroke-width="2"/>
<path d="M0 -6 Q90 -14 220 2" fill="none" stroke="${C.propS}" stroke-width="2"/>
<path d="M42 98 L104 92 L106 102 L48 108 Z" fill="${C.prop}" stroke="${C.propS}" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M42 100 L28 28 Q30 20 40 22 L56 96 Z" fill="${C.prop}" stroke="${C.propS}" stroke-width="1.5" stroke-linejoin="round"/>
<line x1="134" y1="40" x2="144" y2="76" stroke="${C.propS}" stroke-width="5" stroke-linecap="round"/>
<line x1="140" y1="60" x2="176" y2="66" stroke="${C.propS}" stroke-width="4" stroke-linecap="round"/>
<path d="M164 34 L220 30 L220 80 L172 72 Z" fill="${C.prop}" stroke="${C.propS}" stroke-width="1.5"/>
<line x1="150" y1="${F - 4}" x2="160" y2="${F - 18}" stroke="${C.propS}" stroke-width="3" stroke-linecap="round"/>
<text x="216" y="134" fill="${C.force}" font-size="8" font-family="system-ui,sans-serif" text-anchor="end" font-weight="700">PARKED · ENGINE OFF</text>`,
};
function propsSvg(list) { return (list || []).map(p => typeof p === 'string' ? PROPS[p]() : PROPS[p[0]](p[1])).join(''); }
function arrowSvg(A, B, o = {}) {
  const off = o.off || [0, 0], a = add(A, off), b = add(B, off), dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
  if (d < 5) return '';
  const u = [dx / d, dy / d], sh = Math.min(4, d * 0.15), a2 = add(a, mul(u, sh)), b2 = add(b, mul(u, -sh));
  const c = o.c || 0, m = add(mul(add(a2, b2), 0.5), mul([-u[1], u[0]], c));
  const ang = Math.atan2(b2[1] - m[1], b2[0] - m[0]), angA = Math.atan2(a2[1] - m[1], a2[0] - m[0]);
  const col = o.color || C.arrow;
  const head = (p, an) => { const p1 = add(p, mul(dir(an / R + 150), 6)), p2 = add(p, mul(dir(an / R - 150), 6)); return `<path d="M${f1(p1[0])} ${f1(p1[1])} L${f1(p[0])} ${f1(p[1])} L${f1(p2[0])} ${f1(p2[1])}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`; };
  return `<path d="M${f1(a2[0])} ${f1(a2[1])} Q${f1(m[0])} ${f1(m[1])} ${f1(b2[0])} ${f1(b2[1])}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round"/>` + head(b2, ang) + (o.both ? head(a2, angA) : '');
}
function figStatic(o, opts = {}) {
  const col = opts.ghost ? C.ghost : null, op = opts.ghost ? ' opacity="0.22"' : '';
  const ln = (d, c, w) => d ? `<path d="${d}" fill="none" stroke="${col || c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>` : '';
  const fc = opts.front ? C.near : C.far;
  return `<g${op}>${ln(o.af, fc, 5)}${ln(o.lf, fc, 5.5)}${ln(o.torso, C.near, 6.5)}${o.belly ? ln(o.belly, C.near, 2.5) : ''}<circle cx="${o.hx}" cy="${o.hy}" r="${L.hr}" fill="${col || C.near}"/>${o.nose && !opts.ghost ? ln(o.nose, '#0b0d12', 2.5) : ''}${ln(o.ln, C.near, 5.5)}${ln(o.an, C.near, 5)}</g>`;
}
function forceSvg(spec, s0) {
  return (spec.force || []).map(fz => { const p = Array.isArray(fz.at) ? fz.at : add(s0.pts[fz.at], fz.d || [0, 0]), e = add(p, mul(dir(fz.ang), fz.len || 13));
    return arrowSvg(p, e, { color: C.force }); }).join('');
}
const txt = (t, x, y, color, anchor = 'start', size = 10) => `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="800" font-family="system-ui,-apple-system,sans-serif" text-anchor="${anchor}" letter-spacing="0.4">${t}</text>`;
const arrowsFor = spec => (spec.arrows || []).map(a => { const A = frameData(spec.poses[a.from || 0]).s.pts[a.j], B = frameData(spec.poses[a.to != null ? a.to : 1]).s.pts[a.j]; return arrowSvg(A, B, a); }).join('');
const isoTag = spec => spec.iso ? `<rect x="160" y="-12" width="56" height="15" rx="7.5" fill="#3a2e12" stroke="${C.force}" stroke-width="1"/>${txt(spec.isoLabel || 'HOLD', 188, -1.2, C.force, 'middle', 9)}` : '';
const isFront = spec => spec.poses[0].view === 'front' || spec.poses[0].view === 'top';
function animated(spec) {
  const { fr, total } = timeline(spec);
  const data = fr.map(f => frameData(f.p).o), kt = fr.map(f => Math.round(f.t / total * 1000) / 1000);
  for (let i = 1; i < kt.length; i++) if (kt[i] <= kt[i - 1]) kt[i] = +(kt[i - 1] + 0.001).toFixed(3);
  kt[0] = 0; kt[kt.length - 1] = 1;
  const KT = kt.join(';'), dur = f1(total) + 's';
  const an = (attr, vals) => `<animate attributeName="${attr}" dur="${dur}" repeatCount="indefinite" calcMode="linear" keyTimes="${KT}" values="${vals.join(';')}"/>`;
  const s0 = frameData(spec.poses[0]).s, d0 = data[0], front = isFront(spec), fc = front ? C.near : C.far;
  const pathA = (k, c, w) => d0[k] ? `<path d="${d0[k]}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${an('d', data.map(x => x[k]))}</path>` : '';
  const ghost = (spec.poses.length > 1 && !spec.iso && spec.ghost !== false) ? spec.poses.slice(1).map(p => figStatic(frameData(p).o, { ghost: true })).join('') : '';
  const fz = spec.force ? `<g>${forceSvg(spec, s0)}<animate attributeName="opacity" dur="1.2s" repeatCount="indefinite" values="1;0.3;1"/></g>` : '';
  const labels = spec.poseLabels ? spec.poseLabels.map((t, i) => { const vals = fr.map(f => (f.i === i ? 1 : 0)); return `<g opacity="${vals[0]}">${txt(t, 214, -1, C.arrow, 'end', 12)}${an('opacity', vals)}</g>`; }).join('') : '';
  const fig = `${pathA('af', fc, 5)}${pathA('lf', fc, 5.5)}${pathA('torso', C.near, 6.5)}${pathA('belly', C.near, 2.5)}<circle cx="${d0.hx}" cy="${d0.hy}" r="${L.hr}" fill="${C.near}">${an('cx', data.map(x => x.hx))}${an('cy', data.map(x => x.hy))}</circle>${d0.nose ? `<path d="${d0.nose}" stroke="#0b0d12" stroke-width="2.5" stroke-linecap="round">${an('d', data.map(x => x.nose))}</path>` : ''}${pathA('ln', C.near, 5.5)}${pathA('an', C.near, 5)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB.join(' ')}" width="220" height="150" role="img" aria-label="${spec.title || ''}"><title>${spec.title || ''}</title>${propsSvg(spec.props)}${ghost}${arrowsFor(spec)}${fig}${fz}${labels}${isoTag(spec)}${spec.viewLabel ? txt(spec.viewLabel, 6, -1, C.txt, 'start', 9) : ''}</svg>`;
}
function staticPanel(spec, i) {
  const fd = frameData(spec.poses[i]);
  const arrows = (i === spec.poses.length - 1 || spec.iso) ? arrowsFor(spec) : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB.join(' ')}" width="220" height="150">${propsSvg(spec.props)}${arrows}${figStatic(fd.o, { front: isFront(spec) })}${spec.force ? forceSvg(spec, fd.s) : ''}${spec.poseLabels ? txt(spec.poseLabels[i], 214, -1, C.arrow, 'end', 12) : ''}${isoTag(spec)}${spec.viewLabel ? txt(spec.viewLabel, 6, -1, C.txt, 'start', 9) : ''}</svg>`;
}
module.exports = { animated, staticPanel, frameData, F, L };
