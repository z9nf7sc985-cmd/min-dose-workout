/* MinDose v3 — zero-equipment, minimum-effective-dose full-body trainer. All data stays in localStorage. */
(function () {
  'use strict';
  const KEY = 'mindose.v1'; // storage key kept so existing data carries over; schema version in S.v
  const VERSION = 3;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MLABEL = Object.fromEntries(MUSCLES);
  const MODE_LABEL = Object.assign({ gym: 'Gym (old)', db: 'Dumbbells (old)', bw: 'Bodyweight (old)' }, MODES);
  const DEF = { v: VERSION, settings: { mode: 'home', rotation: 'ABC', days: 3, sound: true, vibrate: true, ramp: true }, history: [], active: null, swaps: {}, pick: null, onboarded: false, rampStart: null,
    meals: { goal: 'maintain', bw: '', gbw: '', unit: 'lb', got: {} }, notes: { private: '' } };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const XE = (id) => EX[id] || (window.LEGACY_EX || {})[id] || null; // exercise incl. legacy (v1) ids

  // ---------- load + migrate ----------
  function migrate(d) {
    const S = Object.assign(clone(DEF), d || {});
    S.settings = Object.assign(clone(DEF.settings), (d && d.settings) || {});
    if (!Array.isArray(S.history)) S.history = [];
    S.history = S.history.filter(h => h && Array.isArray(h.exercises) && h.date);
    if (!MODES[S.settings.mode]) S.settings.mode = 'home';
    const fromV = (d && d.v) || 1;
    if (fromV < 2) {
      S.swaps = {}; // v1 swap keys referenced gym/db/bw exercises
      // An unfinished v1 workout can't be resumed in the new program: keep any logged sets in history.
      const a = S.active;
      if (a && Array.isArray(a.slots)) {
        const exercises = a.slots.map(sl => ({ exId: sl.exId, name: (XE(sl.exId) || {}).name || sl.exId, sets: (sl.sets || []).filter(s => s.done && +s.r > 0).map(s => ({ w: +s.w || 0, r: +s.r })) })).filter(e => e.sets.length);
        if (exercises.length) S.history.unshift({ id: 'm' + Date.now().toString(36), date: a.start || Date.now(), start: a.start, wid: a.wid, mode: a.mode, min: 0, exercises });
      }
      S.active = null; S.pick = null; delete S.settings.unit;
    }
    if (fromV < 3) {
      // v3: beginner ramp only for people who are just starting; existing trainees keep the full program.
      S.settings.ramp = S.history.length < 3;
      S.rampStart = S.settings.ramp && S.history.length ? S.history[S.history.length - 1].date : null;
    }
    S.meals = Object.assign(clone(DEF.meals), (d && d.meals) || {});
    if (!S.meals.got || typeof S.meals.got !== 'object') S.meals.got = {};
    if (!['lose', 'maintain', 'build'].includes(S.meals.goal)) S.meals.goal = 'maintain';
    S.notes = Object.assign(clone(DEF.notes), (d && d.notes) || {});
    if (S.active && (!MODES[S.active.mode] || !WORKOUTS[S.active.mode][S.active.wid] || S.active.slots.length !== WORKOUTS[S.active.mode][S.active.wid].slots.length)) S.active = null;
    if (typeof S.swaps !== 'object' || !S.swaps) S.swaps = {};
    S.v = VERSION;
    return S;
  }
  let S;
  try { S = migrate(JSON.parse(localStorage.getItem(KEY) || 'null')); } catch (e) { S = clone(DEF); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Storage full or blocked'); } };
  save();

  let tab = 'today', fuelSeg = 'plan';

  // ---------- helpers ----------
  const WK = (mode) => WORKOUTS[mode];
  const rotation = () => S.settings.rotation === 'AB' ? ['A', 'B'] : ['A', 'B', 'C'];
  function nextWid(mode = S.settings.mode) {
    const rot = rotation();
    if (S.pick && rot.includes(S.pick)) return S.pick;
    const lastH = S.history.find(h => h.mode === mode);
    const i = lastH ? rot.indexOf(lastH.wid) : -1;
    return i < 0 ? rot[0] : rot[(i + 1) % rot.length];
  }
  const swapKey = (mode, wid, i) => `${mode}.${wid}.${i}`;
  const exIdFor = (mode, wid, i) => { const id = S.swaps[swapKey(mode, wid, i)]; return id && EX[id] && EX[id].modes.includes(mode) ? id : WK(mode)[wid].slots[i].ex; };
  const unitOf = (ex) => ex.unit === 'sec' ? 'sec' : 'reps';
  // ---- beginner ramp: weeks 1-2 = one fewer set + low end of the rep range; weeks 3-4 = full program ----
  function rampWeek() { if (!S.settings.ramp) return 0; if (!S.rampStart) return 1; const w = Math.floor((Date.now() - S.rampStart) / (7 * 864e5)) + 1; return w > 4 ? 0 : w; }
  const rampLight = () => { const w = rampWeek(); return w > 0 && w <= 2; };
  const effSets = (sl) => rampLight() ? Math.max(1, sl.sets - 1) : sl.sets;
  function estMinutes(wid, mode) {
    let s = 0; WK(mode)[wid].slots.forEach((sl, i) => { const ex = EX[exIdFor(mode, wid, i)], work = (ex.unit === 'sec' ? sl.reps[1] + 10 : 40) * (ex.perSide ? 2 : 1); s += effSets(sl) * ((sl.ss ? sl.rest * 0.6 : sl.rest) + work); });
    return Math.round(s / 60 + (mode === 'car' ? 2 : 4) + (mode === 'car' ? 1 : 3)); // + warm-up + cooldown
  }
  // ---- recommended weekly schedule (0 = Sun) ----
  const SCHED = { 3: [1, 3, 5], 2: [1, 4] };
  const DAYN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
  function todayPlan() {
    const dow = new Date().getDay(), days = SCHED[S.settings.days] || SCHED[3], idx = days.indexOf(dow);
    const trained = S.history.some(h => sameDay(h.date, Date.now()));
    let wid;
    if (S.pick && rotation().includes(S.pick)) wid = S.pick;
    else if (idx >= 0 && S.settings.days === 3 && S.settings.rotation === 'ABC') wid = 'ABC'[idx];
    else wid = nextWid();
    return { wid, rest: idx < 0, trained, days };
  }
  // ---- guide helpers ----
  const LVL = ['', 'Beginner', 'Intermediate', 'Advanced'];
  const gd = (id) => (window.GUIDE || {})[id] || { lv: 1, st: [], steps: (EX[id] || {}).cues || [], mistakes: [], easier: '' };
  const lvlBadge = (lv) => `<span class="lvl l${lv}" title="Difficulty: ${LVL[lv]}"><i></i><i></i><i></i>${LVL[lv]}</span>`;
  function setTypes(id, slot) {
    const g = gd(id), ex = EX[id], t = [];
    t.push(slot && slot.ss ? 'superset' : 'straight');
    if (ex.unit === 'sec' && !t.includes('hold')) t.push('hold');
    (g.st || []).forEach(x => { if (!t.includes(x)) t.push(x); });
    if (ex.perSide && !t.includes('side')) t.push('side');
    return t;
  }
  const typeChips = (id, slot) => setTypes(id, slot).map(k => `<span class="st" title="${esc((SET_TYPES[k] || [])[1] || '')}">${esc((SET_TYPES[k] || [k])[0])}</span>`).join('');
  const fig = (id, cls = '') => `<div class="fig ${cls}"><img src="ex/${id}.svg" width="220" height="150" alt="Animated stick figure showing how to do ${esc(EX[id].name)}"></div>`;
  function ladderHtml(id) {
    const L = (window.LADDERS || []).find(l => l.includes(id));
    const items = L || [{ t: gd(id).easier || 'Easier version' }, id, { t: EX[id].harder || 'Slower tempo + pauses' }];
    return `<div class="ladder"><b>Easier</b>${items.map(x => typeof x === 'string' ? `<span class="${x === id ? 'cur' : ''}">${esc((EX[x] || {}).name || x)}</span>` : `<span>${esc(x.t)}</span>`).join('<b>→</b>')}<b>Harder</b></div>`;
  }
  function howTo(id, open) {
    const g = gd(id), ex = EX[id], q = encodeURIComponent(ex.name.replace(/\(.*?\)/g, '') + (ex.modes.includes('car') && !ex.modes.includes('home') ? ' seated exercise' : ' exercise') + ' how to');
    return `<details class="howto" ${open ? 'open' : ''}><summary>📖 How to do it</summary>
      <ol>${g.steps.map(t => `<li>${esc(t)}</li>`).join('')}</ol>
      ${g.mistakes.length ? `<div class="hl bad">Common mistakes</div><ul>${g.mistakes.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
      ${g.easier ? `<div class="hl ok">Easier version</div><p class="sub">${esc(g.easier)}</p>` : ''}
      ${ex.cues && ex.cues.length ? `<div class="hl">Form cues</div><ul class="cues">${ex.cues.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
      <div class="hl">Progression ladder</div>${ladderHtml(id)}
      <a class="vid" href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener">▶ Watch a video (YouTube search)</a>
    </details>`;
  }
  function workoutLevel(mode, wid) { const ls = WK(mode)[wid].slots.map((sl, i) => gd(exIdFor(mode, wid, i)).lv); return Math.max(1, Math.min(3, Math.round(ls.reduce((a, b) => a + b, 0) / ls.length))); }
  function weekStart(d = new Date()) { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return x; }
  const fmtDate = (t) => new Date(t).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const fmtClock = (s) => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const tagsHtml = (ex) => `<div class="tags">${ex.p.map(m => `<span class="tag p">${MLABEL[m]}</span>`).join('')}${ex.s.map(m => `<span class="tag">${MLABEL[m]}</span>`).join('')}${ex.bonus ? `<span class="tag">${esc(ex.bonus)}</span>` : ''}</div>`;
  const repTxt = (sl, ex, n = sl.sets) => `${n} × ${sl.reps[0] === sl.reps[1] ? sl.reps[0] : sl.reps[0] + '-' + sl.reps[1]} ${ex.unit === 'sec' ? 'sec' : 'reps'}${ex.perSide ? ' / side' : ''}`;

  function lastPerf(exId) {
    for (const h of S.history) { const e = h.exercises.find(x => x.exId === exId); if (e && e.sets.length) return { sets: e.sets, date: h.date }; }
    return null;
  }
  function suggestion(exId, slot) {
    const r = suggestion0(exId, slot), w = rampWeek();
    if (rampLight() && r.cls !== 'up') { const u = EX[exId].unit === 'sec' ? ' s' : ' slow reps'; r.text = /^First time/.test(r.text) ? `🌱 Ramp week ${w}, first time: aim for the low end (${slot.reps[0]}${u}) and stop with ~3 left in the tank while you learn the move. Too hard or too easy? Use Swap.` : `🌱 Ramp week ${w}: stay near the low end (${slot.reps[0]}${u}) with ~3 left in the tank. ` + r.text; }
    return r;
  }
  function suggestion0(exId, slot) {
    const ex = EX[exId], [lo, hi] = slot.reps, lp = lastPerf(exId), sec = ex.unit === 'sec';
    if (!lp) return { cls: '', text: sec
      ? `First time: hold ${lo}-${hi} s at near-max effort. If you could easily go past ${hi} s, push harder.`
      : `First time: aim for ${lo}-${hi} slow reps (2-3 s lowering), stopping with 1-3 reps left in the tank. Out of range? Use Swap for an easier/harder version.` };
    const reps = lp.sets.map(s => +s.r || 0), allTop = lp.sets.length >= slot.sets && reps.every(r => r >= hi);
    const lastTxt = reps.join(', ') + (sec ? ' s' : '');
    if (allTop) return { cls: 'up', text: sec
      ? `↑ You held ${hi}+ s every set (${lastTxt}). Level up: push harder for the same time, or move to the harder variation.`
      : `↑ You hit ${hi}+ on every set (${lastTxt}). Level up: ${ex.harder || 'slow the lowering to 4-5 s and add a 2 s pause'} Expect fewer reps - that's progress.` };
    return { cls: '', text: `Beat last time (${lastTxt}): +1 ${sec ? '5 s' : 'rep'} on at least one set, same clean, slow form.` };
  }

  // ---------- coverage ----------
  const zero = () => Object.fromEntries(MUSCLES.map(([k]) => [k, 0]));
  function coverage(since) {
    const t = zero();
    const add = (exId, n) => { const ex = XE(exId); if (!ex || !n) return; ex.p.forEach(m => { if (m in t) t[m] += n; }); ex.s.forEach(m => { if (m in t) t[m] += n / 2; }); };
    S.history.filter(h => h.date >= since).forEach(h => h.exercises.forEach(e => add(e.exId, e.sets.length)));
    if (S.active) S.active.slots.forEach((sl) => add(sl.exId, sl.sets.filter(s => s.done).length));
    return t;
  }
  function plannedCoverage(mode) {
    const t = zero(), rot = rotation(), per = S.settings.days / rot.length;
    rot.forEach(wid => WK(mode)[wid].slots.forEach((sl, i) => { const ex = EX[exIdFor(mode, wid, i)]; ex.p.forEach(m => t[m] += sl.sets * per); ex.s.forEach(m => t[m] += sl.sets * per / 2); }));
    return t;
  }
  const lvl = (v) => v >= TARGET.max + 0.01 ? 'hi' : v >= TARGET.min ? 'ok' : v >= 2 ? 'mid' : '';
  const COL = { '': '#3a2230', mid: '#ffb547', ok: '#7cf29a', hi: '#4cc9f0' };
  function bars(t) {
    const max = 14;
    return MUSCLES.map(([k, label]) => {
      const v = Math.round(t[k] * 2) / 2, pct = Math.min(100, v / max * 100);
      return `<div class="bar"><span>${label}</span><div class="track"><div class="zone" style="left:${TARGET.min / max * 100}%;width:${(TARGET.max - TARGET.min) / max * 100}%"></div><div class="fill ${lvl(v)}" style="width:${pct}%"></div></div><span class="num">${v}</span></div>`;
    }).join('') + `<div class="legend"><span><i class="dot" style="background:#ff6b6b"></i>&lt;2</span><span><i class="dot" style="background:#ffb547"></i>2-4</span><span><i class="dot" style="background:#7cf29a"></i>4-10 sweet spot</span><span><i class="dot" style="background:#4cc9f0"></i>10+ (plenty)</span></div>`;
  }
  function bodyMap(t) {
    const c = (k) => COL[lvl(t[k])] || COL[''];
    const f = (k, shape) => shape.replace('/>', ` fill="${c(k)}" class="m"><title>${MLABEL[k]}: ${Math.round(t[k] * 2) / 2} sets</title></${shape.match(/^<(\w+)/)[1]}>`);
    const base = '<circle cx="60" cy="16" r="11" fill="#2a3042"/><rect x="54" y="26" width="12" height="8" fill="#2a3042"/>';
    const front = `<svg viewBox="0 0 120 250" aria-label="Front">${base}
      ${f('frontDelts', '<ellipse cx="34" cy="44" rx="10" ry="9"/>')}${f('frontDelts', '<ellipse cx="86" cy="44" rx="10" ry="9"/>')}
      ${f('sideDelts', '<ellipse cx="25" cy="47" rx="5" ry="9"/>')}${f('sideDelts', '<ellipse cx="95" cy="47" rx="5" ry="9"/>')}
      ${f('chest', '<rect x="40" y="36" width="40" height="26" rx="8"/>')}
      ${f('biceps', '<rect x="22" y="56" width="12" height="30" rx="6"/>')}${f('biceps', '<rect x="86" y="56" width="12" height="30" rx="6"/>')}
      ${f('forearms', '<rect x="18" y="90" width="11" height="34" rx="5"/>')}${f('forearms', '<rect x="91" y="90" width="11" height="34" rx="5"/>')}
      ${f('core', '<rect x="44" y="64" width="32" height="48" rx="8"/>')}
      ${f('quads', '<rect x="39" y="122" width="19" height="58" rx="9"/>')}${f('quads', '<rect x="62" y="122" width="19" height="58" rx="9"/>')}
      ${f('calves', '<rect x="41" y="188" width="14" height="48" rx="7"/>')}${f('calves', '<rect x="65" y="188" width="14" height="48" rx="7"/>')}
      <text x="60" y="248" fill="#8d95a8" font-size="9" text-anchor="middle">FRONT</text></svg>`;
    const back = `<svg viewBox="0 0 120 250" aria-label="Back">${base}
      ${f('upperBack', '<rect x="40" y="32" width="40" height="22" rx="8"/>')}
      ${f('rearDelts', '<ellipse cx="32" cy="45" rx="10" ry="9"/>')}${f('rearDelts', '<ellipse cx="88" cy="45" rx="10" ry="9"/>')}
      ${f('lats', '<path d="M40 56 L80 56 L74 96 L46 96 Z"/>')}
      ${f('triceps', '<rect x="22" y="56" width="12" height="30" rx="6"/>')}${f('triceps', '<rect x="86" y="56" width="12" height="30" rx="6"/>')}
      ${f('forearms', '<rect x="18" y="90" width="11" height="34" rx="5"/>')}${f('forearms', '<rect x="91" y="90" width="11" height="34" rx="5"/>')}
      ${f('glutes', '<rect x="40" y="100" width="40" height="26" rx="10"/>')}
      ${f('hamstrings', '<rect x="39" y="130" width="19" height="50" rx="9"/>')}${f('hamstrings', '<rect x="62" y="130" width="19" height="50" rx="9"/>')}
      ${f('calves', '<rect x="41" y="188" width="14" height="48" rx="7"/>')}${f('calves', '<rect x="65" y="188" width="14" height="48" rx="7"/>')}
      <text x="60" y="248" fill="#8d95a8" font-size="9" text-anchor="middle">BACK</text></svg>`;
    return `<div class="bodymap">${front}${back}</div>`;
  }

  // ---------- streak ----------
  function streak() {
    const m = {}; S.history.forEach(h => { const k = +weekStart(new Date(h.date)); m[k] = (m[k] || 0) + 1; });
    const goal = 2; let w = weekStart(), n = 0;
    if ((m[+w] || 0) >= goal) n++;
    w = new Date(w); w.setDate(w.getDate() - 7);
    while ((m[+w] || 0) >= goal) { n++; w.setDate(w.getDate() - 7); }
    return n;
  }

  // ---------- UI primitives ----------
  let toastT;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.add('hidden'), 2600); }
  function sheet(html) { $('#sheetCard').innerHTML = html; $('#sheet').classList.remove('hidden'); }
  function closeSheet() { $('#sheet').classList.add('hidden'); }
  $('#sheet').addEventListener('click', (e) => { if (e.target.id === 'sheet' || e.target.closest('[data-close]')) closeSheet(); });

  // ---------- audio / haptics ----------
  let actx;
  function unlockAudio() { try { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) { } }
  function beep() {
    if (!S.settings.sound || !actx) return;
    [0, 0.25, 0.5].forEach((d, i) => { const o = actx.createOscillator(), g = actx.createGain(); o.type = 'sine'; o.frequency.value = i === 2 ? 1320 : 880; o.connect(g); g.connect(actx.destination);
      const t0 = actx.currentTime + d; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.4, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2); o.start(t0); o.stop(t0 + 0.22); });
  }
  const buzz = (p) => { if (S.settings.vibrate && navigator.vibrate) try { navigator.vibrate(p); } catch (e) { } };

  // ---------- rest timer ----------
  const T = { end: 0, total: 0, iv: null };
  function startTimer(sec) {
    T.total = sec; T.end = Date.now() + sec * 1000; $('#timer').classList.remove('hidden', 'done'); document.body.classList.add('timer-on');
    clearInterval(T.iv); T.iv = setInterval(tick, 250); tick();
  }
  function tick() {
    const left = (T.end - Date.now()) / 1000;
    $('#timerTime').textContent = left > 0 ? fmtClock(left) : 'Go!';
    $('#timerBar').style.width = Math.max(0, left / T.total * 100) + '%';
    if (left <= 0 && !$('#timer').classList.contains('done')) {
      $('#timer').classList.add('done'); beep(); buzz([250, 120, 250, 120, 400]);
      setTimeout(() => { if (Date.now() >= T.end) stopTimer(); }, 4000);
    }
  }
  function stopTimer() { clearInterval(T.iv); $('#timer').classList.add('hidden'); document.body.classList.remove('timer-on'); }
  $('#timer').addEventListener('click', (e) => {
    const b = e.target.closest('[data-t]'); if (!b) return; const v = b.dataset.t;
    if (v === 'skip') return stopTimer();
    T.end += (+v) * 1000; T.total = Math.max(T.total, (T.end - Date.now()) / 1000); $('#timer').classList.remove('done'); tick();
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !$('#timer').classList.contains('hidden')) tick(); });

  // ---------- wake lock ----------
  let wl;
  async function keepAwake(on) { try { if (on && 'wakeLock' in navigator && !wl) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => wl = null); } else if (!on && wl) { wl.release(); wl = null; } } catch (e) { } }

  // ---------- session ----------
  const CAR_NOTE = '🚗 Car mode is ONLY for when you are parked with the engine off. Never exercise while driving.';
  function startSession(wid) {
    const mode = S.settings.mode;
    if (mode === 'car' && !confirm('Safety check: are you PARKED with the engine OFF?\n\nNever do these while driving.')) return;
    if (S.settings.ramp && !S.rampStart) S.rampStart = Date.now();
    S.active = { wid, mode, start: Date.now(), warm: [], ramp: rampWeek(), slots: WK(mode)[wid].slots.map((sl, i) => ({ exId: exIdFor(mode, wid, i), sets: Array.from({ length: effSets(sl) }, () => ({ w: '', r: '', done: false })) })) };
    S.pick = null; save(); render(); keepAwake(true); window.scrollTo(0, 0);
  }
  function finishSession() {
    const a = S.active; if (!a) return;
    const exercises = a.slots.map((sl, i) => ({ exId: sl.exId, name: EX[sl.exId].name, slot: i, sets: sl.sets.filter(s => s.done && +s.r > 0).map(s => ({ w: 0, r: +s.r })) })).filter(e => e.sets.length);
    if (!exercises.length) { if (confirm('No sets logged. Discard this workout?')) { S.active = null; save(); render(); keepAwake(false); } return; }
    const rec = { id: Date.now().toString(36), date: Date.now(), start: a.start, wid: a.wid, mode: a.mode, min: Math.max(1, Math.round((Date.now() - a.start) / 60000)), exercises };
    S.history.unshift(rec); S.active = null; save(); stopTimer(); keepAwake(false);
    const sets = exercises.reduce((n, e) => n + e.sets.length, 0);
    tab = 'progress'; render(); window.scrollTo(0, 0);
    sheet(`<h2 style="margin-top:0">💪 ${esc(WK(rec.mode)[rec.wid].title)} done</h2><p>${sets} hard sets in ${rec.min} min. Streak: <b>${streak()} week${streak() === 1 ? '' : 's'}</b>.</p><p class="sub">Check your weekly muscle coverage below - aim to get every bar into the green by the end of the week.</p><button class="btn block" data-close>Nice</button>`);
  }

  // ---------- views ----------
  const segHtml = (name, opts, val) => `<div class="seg" data-seg="${name}">${Object.entries(opts).map(([k, l]) => `<button data-v="${k}" class="${k === val ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  function weekDots() {
    const ws = weekStart(), today = new Date(); today.setHours(0, 0, 0, 0);
    const days = new Set(S.history.map(h => { const d = new Date(h.date); d.setHours(0, 0, 0, 0); return +d; }));
    return `<div class="weekdots">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((l, i) => { const d = new Date(ws); d.setDate(d.getDate() + i);
      return `<div class="wd"><i class="${days.has(+d) ? 'on' : ''} ${+d === +today ? 'today' : ''}">${days.has(+d) ? '✓' : ''}</i>${l}</div>`; }).join('')}</div>`;
  }
  const thisWeekCount = () => { const ws = +weekStart(); return S.history.filter(h => h.date >= ws).length; };
  const modeIcon = { home: '🛋️ Living room', car: '🚗 Car' };

  function startHere(open) {
    return `<details class="card guide" ${open ? 'open' : ''}><summary>🌱 New here? Start here</summary>
      <ul class="plain">
        <li><b>How hard to push:</b> each set should feel hard by the end - the last 2-3 reps are slow and a real effort, but your form is still clean. Not "easy", not "can't breathe".</li>
        <li><b>RIR in plain words:</b> "reps in reserve" = how many more you <i>could</i> have done. "1-3 RIR" means stop when you honestly have 1-3 reps left in the tank.</li>
        <li><b>Breathing during holds:</b> never hold your breath. Take short breaths - in through the nose, out through the mouth - every couple of seconds. Hold the effort, not your breath.</li>
        <li><b>First 2 weeks:</b> use the <b>lower end</b> of each rep range and stop with ~3 reps left while you learn the moves. The beginner ramp (on by default) also gives you one fewer set per exercise in weeks 1-2, then the full program in weeks 3-4.</li>
        <li><b>Visuals:</b> the green ghost shows where the move ends; arrows show the direction. Amber = push or squeeze without moving (a hold).</li>
        <li><b>Soreness</b> for 1-3 days early on is normal. Sharp or joint pain is not - stop and swap to the easier version.</li>
      </ul>
      <div class="hl">Set types, in plain words</div>
      <ul class="plain">${Object.values(SET_TYPES).map(([n, d]) => `<li><b>${esc(n)}:</b> ${esc(d)}</li>`).join('')}</ul>
      <div class="hl">Why the exercises are in this order</div>
      <ol class="plain">${ORDER.map(t => `<li>${t}</li>`).join('')}</ol>
    </details>`;
  }
  const ORDER = ['<b>Warm-up</b> (3-4 min) - gets joints and muscles ready.', '<b>Biggest / hardest moves first</b> (legs, push-ups) while you are fresh, so they get your best effort.', '<b>Smaller muscles & supersets</b> next (back, shoulders, arms) - pairing them saves time.', '<b>Core & holds</b> near the end - your core has helped all workout, so it goes last.', '<b>Short cooldown</b> (2-3 min) - easy stretches and slow breathing.'];

  function viewToday() {
    if (S.active) return viewActive();
    const mode = S.settings.mode, tp = todayPlan(), wid = tp.wid, w = WK(mode)[wid], done = thisWeekCount(), rw = rampWeek(), wl = workoutLevel(mode, wid);
    const picks = Object.fromEntries(rotation().map(k => [k, WK(mode)[k].title]));
    const schedTxt = tp.days.map(d => DAYN[d]).join(' / ');
    const status = tp.trained ? '<span class="pill acc">✓ Done today</span>' : tp.rest && !S.pick ? '<span class="pill warn">Rest day</span>' : `<span class="pill acc">Today · ${DAYN[new Date().getDay()]}</span>`;
    const restNote = tp.trained ? `<p class="sub mt">Nice work today. Recovery is where muscle is built: walk, eat protein, sleep 7-9 h.</p>`
      : tp.rest && !S.pick ? `<div class="restnote mt"><b>Rest day</b> in your ${schedTxt} plan. 🚶 Walk 20-30+ min (or ~7,000+ steps). Optional: a few minutes of Car or Living-room "movement snacks" (e.g. 1-2 holds). Want to train anyway? Tap below.</div>` : '';
    return `
      ${startHere(!S.onboarded)}
      ${!S.onboarded ? `<div class="row"><button class="btn small ghost" data-act="onboard">Got it - collapse the guide</button></div>` : ''}
      <div class="card hero">
        <div class="row between">${status}<span class="pill">${done}/${S.settings.days} this week</span></div>
        <h1>${esc(w.title)}</h1>
        <div class="sub">${esc(w.focus)}</div>
        <div class="row wrap mt"><span class="pill blue">⏱ ~${estMinutes(wid, mode)} min</span>${lvlBadge(wl)}<span class="pill">${w.slots.reduce((n, s) => n + effSets(s), 0)} hard sets</span><span class="pill">No equipment</span></div>
        ${rw ? `<div class="ramp mt">🌱 Beginner ramp: week ${rw} of 4 - ${rw <= 2 ? 'one fewer set per exercise, low end of the reps' : 'full program now'}.</div>` : ''}
        ${restNote}
        ${weekDots()}
        <div class="mt">${segHtml('mode', modeIcon, mode)}</div>
        <div class="mt">${segHtml('pick', picks, wid)}</div>
        ${mode === 'car' ? `<p class="carnote">${CAR_NOTE}</p>` : ''}
        <button class="btn block mt ${tp.trained || (tp.rest && !S.pick) ? 'ghost' : ''}" data-act="start">${tp.rest && !S.pick && !tp.trained ? 'Train anyway: ' : tp.trained ? 'Another session: ' : 'Start '}${esc(w.title)}</button>
      </div>
      <h2>What's in it</h2>
      <div class="sub">In order: hardest moves first, smaller muscles next, core last. Tap "How to do it" for steps.</div>
      ${w.slots.map((sl, i) => { const id = exIdFor(mode, wid, i), ex = EX[id];
        return `<div class="card ex"><div class="ex-head"><div><div class="ex-name">${i + 1}. ${esc(ex.name)}</div><div class="ex-meta">${repTxt(sl, ex, effSets(sl))} · rest ${fmtClock(sl.rest)}${sl.ss ? ` · <span class="ss">superset ${sl.ss}</span>` : ''}</div></div>${swapOpts(mode, wid, i).length > 1 ? `<button class="btn small ghost" data-swap="${wid}.${i}">Swap</button>` : ''}</div>
          <div class="ex-row">${fig(id, 'thumb')}<div class="ex-body"><div class="chips">${lvlBadge(gd(id).lv)}${typeChips(id, sl)}</div>${tagsHtml(ex)}</div></div>
          ${howTo(id, false)}</div>`; }).join('')}
      <p class="disclaimer mt">Not medical advice. Talk to a doctor first if you have heart, joint, blood-pressure or other health conditions, are pregnant, or are new to exercise. Stop any exercise that causes sharp or joint pain.${mode === 'car' ? ' Car mode: parked, engine off, never while driving.' : ''}</p>`;
  }

  function viewActive() {
    const a = S.active, w = WK(a.mode)[a.wid], warm = WARMUP[a.mode];
    const doneSets = a.slots.reduce((n, s) => n + s.sets.filter(x => x.done).length, 0), total = a.slots.reduce((n, s) => n + s.sets.length, 0);
    return `
      <div><h1>${esc(w.title)}</h1><div class="sub">${MODE_LABEL[a.mode]} · started ${new Date(a.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · <b id="prog">${doneSets}/${total}</b> sets</div></div>
      ${a.mode === 'car' ? `<p class="carnote">${CAR_NOTE}</p>` : ''}
      <details class="card" ${a.warm.length < warm.length ? 'open' : ''}><summary>🔥 Warm-up (~${a.mode === 'car' ? 2 : 4} min) ${a.warm.length >= warm.length ? '✓' : ''}</summary>
        ${warm.map((t, i) => `<label class="check"><input type="checkbox" data-warm="${i}" ${a.warm.includes(i) ? 'checked' : ''}><span>${esc(t)}</span></label>`).join('')}
      </details>
      ${a.ramp && a.ramp <= 2 ? `<div class="ramp">🌱 Beginner ramp week ${a.ramp}: fewer sets, low end of the reps, ~3 left in the tank.</div>` : ''}
      <div class="sub" style="margin:6px 2px">${a.mode === 'car' ? 'Holds: push/pull at <b>near-max effort</b> the whole time and breathe. Reps: slow and hard.' : 'Take every set to <b>1-3 reps short of failure</b> with slow 2-3 s lowerings.'} Tap ✓ to log a set and start the rest timer.</div>
      ${a.slots.map((sl, i) => {
        const slot = w.slots[i], ex = EX[sl.exId], [lo, hi] = slot.reps, sg = suggestion(sl.exId, slot), un = unitOf(ex);
        return `<div class="card ex" id="ex${i}">
          <div class="ex-head"><div><div class="ex-name">${i + 1}. ${esc(ex.name)}</div>
            <div class="ex-meta">${repTxt(slot, ex, sl.sets.length)} · rest ${fmtClock(slot.rest)}${slot.ss ? ` · <span class="ss">superset ${slot.ss}: alternate with the ${slot.ss === (w.slots[i - 1] || {}).ss ? 'previous' : 'next'} exercise</span>` : ''}</div></div>
            ${swapOpts(a.mode, a.wid, i).length > 1 ? `<button class="btn small ghost" data-swap="${a.wid}.${i}">Swap</button>` : ''}</div>
          ${fig(sl.exId, 'big')}
          <div class="chips">${lvlBadge(gd(sl.exId).lv)}${typeChips(sl.exId, slot)}</div>
          ${tagsHtml(ex)}
          ${ex.note ? `<div class="sub mt">ℹ️ ${esc(ex.note)}</div>` : ''}
          <div class="sugg ${sg.cls}">${esc(sg.text)}</div>
          ${howTo(sl.exId, false)}
          <div class="set-h"><span>Set</span><span>${un === 'sec' ? 'Seconds held' : 'Reps' + (ex.perSide ? ' (per side)' : '')}</span><span>Done</span></div>
          <div class="sets">${sl.sets.map((s, j) => `<div class="set ${s.done ? 'done' : ''}" data-i="${i}" data-j="${j}">
            <span class="n">${j + 1}</span>
            <input type="number" inputmode="numeric" min="0" step="1" placeholder="${lo === hi ? lo : lo + '-' + hi}${un === 'sec' ? ' s' : ''}" value="${esc(s.r)}" data-f="r" aria-label="${un} set ${j + 1}">
            <button class="chk" data-done aria-label="Mark set done">✓</button></div>`).join('')}</div>
          <div class="row between"><button class="linkbtn" data-addset="${i}">+ Add set</button>${sl.sets.length > 1 ? `<button class="linkbtn" style="color:var(--muted)" data-rmset="${i}">− Remove set</button>` : ''}</div>
        </div>`; }).join('')}
      <details class="card"><summary>🧘 Cooldown (2-3 min)</summary><ul class="plain">${(window.COOLDOWN || {})[a.mode].map(t => `<li>${esc(t)}</li>`).join('')}</ul></details>
      <button class="btn block" data-act="finish">Finish workout</button>
      <button class="btn block ghost mt" data-act="cancel">Discard workout</button>`;
  }

  function viewProgress() {
    const ws = weekStart(), t = coverage(+ws), missing = MUSCLES.filter(([k]) => t[k] < TARGET.min).map(([, l]) => l);
    const totalSets = S.history.reduce((n, h) => n + h.exercises.reduce((m, e) => m + e.sets.length, 0), 0);
    return `<h1>Muscle coverage</h1><div class="sub">Hard sets this week (since ${fmtDate(ws)}), Living room + Car combined. Primary muscle = 1 set, assisting muscle = ½.</div>
      <div class="card">${bodyMap(t)}</div>
      <div class="card">${bars(t)}</div>
      <div class="card">${missing.length === 0 ? '<b>✅ Every muscle is in the 4+ set zone this week.</b> Great work - anything more is a bonus.' :
        `<b>Still below 4 sets:</b> ${missing.join(', ')}.<div class="sub mt">${thisWeekCount() < S.settings.days ? `Your next session (${esc(WK(S.settings.mode)[todayPlan().wid].title)}) will help - the rotation is built so a full week covers everything.` : 'Totally fine on a light week - consistency over months matters more than any single week.'}</div>`}</div>
      <h2>Consistency</h2>
      <div class="stats"><div class="stat"><b>🔥 ${streak()}</b><span>week streak (2+ sessions)</span></div><div class="stat"><b>${S.history.length}</b><span>workouts</span></div><div class="stat"><b>${totalSets}</b><span>hard sets</span></div></div>
      <div class="card">${weekDots()}</div>`;
  }

  function viewHistory() {
    if (!S.history.length) return `<h1>History</h1><div class="card center"><p>No workouts yet.</p><p class="sub">Finish your first session and it will show up here.</p></div>`;
    return `<h1>History</h1><div class="sub">${S.history.length} workouts logged</div>` + S.history.map(h => {
      const sets = h.exercises.reduce((n, e) => n + e.sets.length, 0), title = (WORKOUTS[h.mode] && WORKOUTS[h.mode][h.wid]) ? WORKOUTS[h.mode][h.wid].title : 'Workout ' + h.wid;
      return `<details class="card"><summary class="hist-item" style="color:var(--text)"><div><b>${fmtDate(h.date)} · ${esc(title)}</b><div class="sub">${sets} sets${h.min ? ' · ' + h.min + ' min' : ''} · ${esc(MODE_LABEL[h.mode] || '')}</div></div><span class="sub">▾</span></summary>
        ${h.exercises.map(e => { const ex = XE(e.exId), sec = ex && ex.unit === 'sec'; return `<div style="margin:10px 0"><b>${esc(e.name)}</b><div class="sub">${e.sets.map(s => (s.w ? esc(s.w) + '×' : '') + esc(s.r) + (sec ? 's' : '')).join(' · ')}</div></div>`; }).join('')}
        <button class="btn small danger" data-del="${esc(h.id)}">Delete</button></details>`;
    }).join('');
  }

  function planCard(mode) {
    return rotation().map(wid => `<div class="card"><h3>${esc(WK(mode)[wid].title)} <span class="sub">· ~${estMinutes(wid, mode)} min</span></h3><div class="mt">${lvlBadge(workoutLevel(mode, wid))}</div><div class="sub">${esc(WK(mode)[wid].focus)}</div><ul class="plain">${WK(mode)[wid].slots.map((sl, i) => { const ex = EX[exIdFor(mode, wid, i)]; return `<li>${esc(ex.name)} — ${repTxt(sl, ex, effSets(sl))}, rest ${fmtClock(sl.rest)} <span class="sub">(${LVL[gd(exIdFor(mode, wid, i)).lv]})</span></li>`; }).join('')}</ul></div>`).join('');
  }

  function viewProgram() {
    const st = S.settings, mode = st.mode;
    return `<h1>The program</h1><div class="sub">Zero equipment. Minimum effective dose. Full body.</div>
      <div class="card"><h3>Settings</h3>
        <div class="field"><span>Where</span><select data-set="mode">${Object.entries(MODES).map(([k, l]) => `<option value="${k}" ${k === mode ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="field"><span>Sessions / week</span><select data-set="days">${[2, 3].map(d => `<option ${d === st.days ? 'selected' : ''}>${d}</option>`).join('')}</select></div>
        <div class="field"><span>Rotation</span><select data-set="rotation"><option value="ABC" ${st.rotation === 'ABC' ? 'selected' : ''}>A / B / C</option><option value="AB" ${st.rotation === 'AB' ? 'selected' : ''}>A / B</option></select></div>
        <div class="field"><span>Beginner ramp (4 weeks)</span><select data-set="ramp"><option value="1" ${st.ramp ? 'selected' : ''}>On${rampWeek() ? ' · week ' + rampWeek() : ''}</option><option value="0" ${!st.ramp ? 'selected' : ''}>Off</option></select></div>
        <div class="field"><span>Rest-timer sound</span><select data-set="sound"><option value="1" ${st.sound ? 'selected' : ''}>On</option><option value="0" ${!st.sound ? 'selected' : ''}>Off</option></select></div>
        <div class="field"><span>Vibration*</span><select data-set="vibrate"><option value="1" ${st.vibrate ? 'selected' : ''}>On</option><option value="0" ${!st.vibrate ? 'selected' : ''}>Off</option></select></div>
        <div class="sub">*iPhone Safari doesn't let web apps vibrate; you'll get the sound + on-screen alert instead (turn off silent mode).</div>
      </div>
      <div class="card"><h3>🛋️ Living room vs 🚗 Car</h3><ul class="plain">
        <li><b>Living room</b> (default) is the full program: floor + bodyweight. A sturdy couch or chair is optional for a few moves; socks on a smooth floor for sliding leg curls.</li>
        <li><b>Car</b> is a seated routine of self-resisted presses/pulls and isometric holds. Use it on busy days; it's a solid "keep the streak alive" session, but the Living room routine builds more muscle.</li>
        <li>Mix freely - both count toward the same weekly muscle coverage.</li></ul>
        <p class="carnote">${CAR_NOTE}</p></div>
      <div class="card"><h3>Why this works ("least work, most output")</h3><ul class="plain">
        <li><b>Full body, 2-3× a week.</b> Each muscle is trained 2-3 times weekly in short sessions.</li>
        <li><b>~4-10 hard sets per muscle per week.</b> Most of the benefit comes from the first handful of hard sets; returns diminish beyond that. The Muscles tab tracks it.</li>
        <li><b>Effort replaces weights.</b> Muscles respond to sets taken close to failure, even with light loads. Slow 2-4 s lowerings, pauses and harder variations make bodyweight hard enough.</li>
        <li><b>Self-resistance & isometrics</b> fill the gaps (back, biceps, side/rear delts) where you'd normally need a bar or dumbbells: you supply the resistance with your other arm, your leg, a wall or the floor. They only work if you push hard.</li>
        <li><b>Progression without weights:</b> when you hit the top of the rep/second range on every set, move up a level - slower tempo, pauses, single-leg, or the harder swap (e.g. incline → floor → feet-elevated → archer push-up). The app tells you when.</li></ul></div>
      <div class="card"><h3>How hard is "1-3 reps in reserve"?</h3><p class="sub">The last rep is slow and hard, form is still clean, and you honestly could only do 1-3 more. For holds: you're pushing at near-max effort and it's getting shaky by the end. If it feels easy, it doesn't count - level up.</p></div>
      ${startHere(false)}
      <div class="card"><h3>🌱 Your first 4 weeks</h3><ul class="plain">
        <li><b>Weeks 1-2:</b> one fewer set per exercise and the <b>low end</b> of each rep range. Use the easier swaps if needed (incline push-ups, tempo squats, glute bridges). Stop with ~3 reps left.</li>
        <li><b>Weeks 3-4:</b> the full program - all sets, and work toward the top of the ranges with 1-3 reps left.</li>
        <li><b>Week 5+:</b> keep beating last time; level up when you hit the top of the range on every set.</li>
        <li>Soreness is normal early and fades. The app does this automatically while "Beginner ramp" is on.</li></ul></div>
      <h2>Your weekly plan · ${MODES[mode]}</h2>
      ${planCard(mode)}
      <div class="card"><h3>Planned weekly sets (${st.days}×/week, ${MODES[mode]})</h3>${bars(plannedCoverage(mode))}</div>
      <div class="card"><h3>Warm-up (${MODES[mode]})</h3><ul class="plain">${WARMUP[mode].map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
      <div class="card"><h3>📅 Recommended week</h3>${weekTable()}
        <ul class="plain mt"><li><b>Walk daily:</b> 20-30+ min, or roughly 7,000+ steps. More is fine.</li><li><b>Car workouts:</b> optional extra on busy days, or a few minutes of "movement snacks" on rest days (parked, engine off).</li><li><b>Rest days</b> are when you recover and grow - don't skip them.</li><li><b>Sleep 7-9 h.</b> It matters as much as the workout.</li><li>Missed a day? The Today tab offers "Train anyway"; the plan picks up where you are.</li></ul></div>
      <div class="card"><h3>🔢 In-session order (and why)</h3><ol class="plain">${ORDER.map(t => `<li>${t}</li>`).join('')}</ol></div>
      <div class="card"><h3>🧘 Cooldown (${MODES[mode]})</h3><ul class="plain">${COOLDOWN[mode].map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
      <div class="card"><h3>⚠️ Safety</h3><p class="disclaimer">General fitness information, not medical advice. Check with a doctor before starting if you have any heart, lung, blood-pressure, joint or other medical condition, are pregnant, recovering from injury, or haven't exercised in a long time. Hard isometric holds can raise blood pressure - breathe steadily and never hold your breath. Stop immediately if you feel sharp pain, chest pain, dizziness or unusual shortness of breath. <b>Car mode: only when parked with the engine off - never while driving.</b></p></div>
      <div class="card"><h3>📲 Install on iPhone</h3><p class="sub">In Safari: tap Share → <b>Add to Home Screen</b>. It opens full-screen and works offline. Your data stays on this phone only.</p></div>
      <div class="card"><h3>Backup</h3><p class="sub">Data is stored only on this device. Export occasionally to keep a copy.</p>
        <div class="row wrap"><button class="btn small ghost" data-act="export">Export data</button><label class="btn small ghost" style="display:inline-flex;align-items:center">Import<input type="file" accept="application/json" id="importFile" hidden></label><button class="btn small danger" data-act="reset">Reset all</button></div></div>
      <p class="sub center">MinDose v3 · zero equipment · open source</p>`;
  }

  function weekTable() {
    const days = SCHED[S.settings.days] || SCHED[3], rot = rotation(), abc = S.settings.days === 3 && S.settings.rotation === 'ABC';
    let k = 0;
    return `<div class="week">${[1, 2, 3, 4, 5, 6, 0].map(d => { const on = days.includes(d), lab = on ? (abc ? WK('home')['ABC'[days.indexOf(d)]].title : 'Workout (next in rotation)') : d === 0 ? 'Rest + restock car pantry' : d === 6 ? 'Rest / long walk' : 'Rest · walk · optional Car snack';
      if (on) k++; return `<div class="wk ${on ? 'on' : ''} ${d === new Date().getDay() ? 'today' : ''}"><b>${DAYN[d]}</b><span>${esc(lab)}</span></div>`; }).join('')}</div><p class="sub">${S.settings.days}×/week in the Living room (${days.map(d => DAYN[d]).join(' / ')}). Change sessions/week above.</p>`;
  }

  // ---------- Meals & supplements ----------
  const toLb = (v) => S.meals.unit === 'kg' ? v * 2.2046 : v;
  function proteinOut() {
    const g = parseFloat(S.meals.gbw) || parseFloat(S.meals.bw);
    if (!(g > 0)) return '<span class="sub">Enter your goal bodyweight to see your daily protein target.</span>';
    const lb = toLb(g), lo = Math.round(lb * 0.7 / 5) * 5, hi = Math.round(lb * 1.0 / 5) * 5;
    return `<div class="pbig">${lo}-${hi} g protein / day</div><div class="sub">≈ ${Math.round(lo / 4)}-${Math.round(hi / 4)} g per meal over 4 meals/snacks. Based on 0.7-1 g per lb of goal bodyweight (${Math.round(lb)} lb). Hitting the lower end consistently is a great start.</div>`;
  }
  const tierHtml = (tiers) => tiers.map(t => `<div class="card tier ${t.c}"><h3>${esc(t.t)}</h3>${t.items.map(([n, d]) => `<div class="sitem"><b>${esc(n)}</b><span>${esc(d)}</span></div>`).join('')}</div>`).join('');
  function viewFuel() {
    const F = FUEL, m = S.meals, G = F.goals[m.goal], dow = new Date().getDay();
    const head = `<h1>Meals</h1><div class="sub">Cheap, shelf-stable, no-cook food that can live in your car - nothing to keep cold, nothing to cook.</div><div class="mt">${segHtml('fuel', { plan: '🍽️ Meal plan', supp: '💊 Supplements' }, fuelSeg)}</div>`;
    if (fuelSeg === 'supp') {
      const SU = F.supplements, H = F.herbal, K = F.kratom;
      return head + `
        <h2>Natural & simple</h2>
        <div class="card faith"><p class="verse">"${esc(SU.faith.text)}"</p><div class="sub">— ${esc(SU.faith.ref)}</div><p class="sub mt">${esc(SU.faith.note)}</p></div>
        <div class="card"><p>${esc(SU.intro)}</p><p class="carnote">🌡️ ${esc(SU.heat)}</p></div>
        ${tierHtml(SU.tiers)}
        <h2>🌿 Natural & herbal</h2>
        <div class="card"><p class="sub">${esc(H.intro)}</p></div>
        ${tierHtml(H.tiers)}
        <p class="disclaimer">${esc(H.warn)}</p>
        <div class="card kratom" id="kratom"><h3>🤝 ${esc(K.title)}</h3><p class="sub">${esc(K.intro)}</p>
          ${K.sections.map(([h, items]) => `<div class="hl">${esc(h)}</div><ul class="plain">${items.map(t => `<li>${esc(t).replace('1-800-662-4357', '<a href="tel:18006624357">1-800-662-4357</a>')}</li>`).join('')}</ul>`).join('')}
          <p class="sub mt"><i>${esc(K.faith)}</i></p>
          <div class="hl">🔒 Private note (only on this phone)</div>
          <textarea id="privNote" rows="3" placeholder="Optional: anything you want to track for yourself or to show your doctor. Saved only on this device - never uploaded.">${esc(S.notes.private)}</textarea>
          <div class="sub">Stored in this browser only (it is included if you use Export backup). Clear it any time.</div>
        </div>
        <p class="disclaimer">${esc(F.disclaimer)}</p>`;
    }
    return head + `
      <div class="card hero"><div class="row wrap">${(F.headPills || []).map((t, i) => `<span class="pill ${i ? '' : 'acc'}">${esc(t)}</span>`).join('')}</div>
        <h3 class="mt">Your goal</h3><div class="mt">${segHtml('goal', { lose: 'Lose fat', maintain: 'Maintain', build: 'Build muscle' }, m.goal)}</div>
        <ul class="plain mt"><li><b>Protein:</b> a pouch or can of tuna/chicken/salmon, chili or beans (or a protein shake) every meal - see your target below.</li><li><b>Carbs:</b> ${esc(G.carbs)}.</li><li><b>Fats:</b> ${esc(G.fats)}.</li><li>${esc(G.extra)}</li></ul>
        <div class="sub">*Rough estimate - prices vary by store, region and season.</div></div>
      <div class="card"><h3>🥫 Protein calculator</h3>
        <div class="field"><span>Units</span><select data-meal="unit"><option value="lb" ${m.unit === 'lb' ? 'selected' : ''}>lb</option><option value="kg" ${m.unit === 'kg' ? 'selected' : ''}>kg</option></select></div>
        <div class="field"><span>Current bodyweight</span><input class="num-in" type="number" inputmode="decimal" data-meal="bw" value="${esc(m.bw)}" placeholder="${m.unit}"></div>
        <div class="field"><span>Goal bodyweight</span><input class="num-in" type="number" inputmode="decimal" data-meal="gbw" value="${esc(m.gbw)}" placeholder="${m.unit}"></div>
        <div id="protOut" class="mt">${proteinOut()}</div>
        <div class="hl">Cheap protein (approximate - check labels)</div>
        <div class="pfoods">${F.proteinFoods.map(([n, g]) => `<span>${esc(n)} <b>~${esc(g)} g</b></span>`).join('')}</div></div>
      <h2>7-day plan</h2>
      <div class="sub">Built around ${MODES[S.settings.mode]} workouts on Mon / Wed / Fri. ${S.settings.days === 2 ? 'On a 2×/week plan, use the workout-day meals on your training days.' : ''}</div>
      ${F.plan.map((d, i) => { const isToday = DAYN[dow] === d.d; return `<details class="card day ${d.type} ${isToday ? 'today' : ''}" ${isToday ? 'open' : ''}><summary><span class="dname">${d.d}${isToday ? ' · today' : ''}</span><span class="pill ${d.type === 'workout' ? 'acc' : d.type === 'restock' ? 'blue' : ''}">${d.type === 'workout' ? '🏋️ ' + esc(WK(S.settings.mode)[d.w].title) : d.type === 'restock' ? '🔄 Rest + restock' : '😴 Rest'}</span></summary>
        <div class="sub">${esc(F.dayNotes[d.type])}</div>
        ${d.meals.map(([w, t]) => `<div class="meal"><b>${esc(w)}</b><span>${esc(t)}</span></div>`).join('')}</details>`; }).join('')}
      <h2>🛒 Weekly grocery list</h2>
      ${F.grocery.map(g => `<div class="card"><div class="row between"><h3>${esc(g.s)}</h3><span class="pill">${esc(g.cost)}*</span></div>${g.items.map((t, j) => { const k = g.s + j; return `<label class="check"><input type="checkbox" data-got="${esc(k)}" ${m.got[k] ? 'checked' : ''}><span>${esc(t)}</span></label>`; }).join('')}</div>`).join('')}
      <div class="card"><b>Total:</b> <span class="sub">${esc(F.groceryTotal)}</span><div class="row mt"><button class="btn small ghost" data-act="clearGot">Clear checkmarks</button></div></div>
      <h2>🚗 Car-pantry checklist</h2>
      <div class="card">${(F.pantry || []).map((t, j) => { const k = 'pantry' + j; return `<label class="check"><input type="checkbox" data-got="${k}" ${m.got[k] ? 'checked' : ''}><span>${esc(t)}</span></label>`; }).join('')}</div>
      <h2>🌡️ Heat, storage & rotation</h2>
      <div class="card"><ul class="plain">${(F.storage || []).map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
      <h2>${esc(F.recipesTitle || 'Recipes')}</h2>
      ${F.recipes.map(r => `<details class="card"><summary>${esc(r.n)} <span class="sub" style="margin-left:6px">· ${esc(r.y)}</span></summary><ol class="plain">${r.steps.map(t => `<li>${esc(t)}</li>`).join('')}</ol></details>`).join('')}
      <h2>🚗 Work & car snacks</h2>
      <div class="card"><ul class="plain">${F.snacks.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
      <p class="disclaimer">${esc(F.allergy)}</p>`;
  }

  function swapOpts(mode, wid, i) {
    const def = WK(mode)[wid].slots[i].ex, cur = (S.active && S.active.wid === wid && S.active.mode === mode) ? S.active.slots[i].exId : exIdFor(mode, wid, i);
    return [...new Set([def, ...EX[def].swaps, ...EX[cur].swaps, cur])].filter(id => EX[id] && EX[id].modes.includes(mode));
  }

  // ---------- render ----------
  function render() {
    $('#view').innerHTML = { today: viewToday, progress: viewProgress, history: viewHistory, fuel: viewFuel, program: viewProgram }[tab]();
    document.querySelectorAll('.tabbar button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    $('#streakChip').textContent = `🔥 ${streak()} wk`;
  }

  // ---------- events ----------
  document.querySelector('.tabbar').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; tab = b.dataset.tab; render(); window.scrollTo(0, 0); });

  $('#view').addEventListener('input', (e) => {
    const inp = e.target, row = inp.closest('.set');
    if (row && S.active) { S.active.slots[+row.dataset.i].sets[+row.dataset.j][inp.dataset.f] = inp.value; save(); }
    if (inp.dataset.meal === 'bw' || inp.dataset.meal === 'gbw') { S.meals[inp.dataset.meal] = inp.value; save(); const o = $('#protOut'); if (o) o.innerHTML = proteinOut(); }
    if (inp.id === 'privNote') { S.notes.private = inp.value; save(); }
  });
  $('#view').addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.warm != null && S.active) { const i = +el.dataset.warm, w = S.active.warm; el.checked ? (w.includes(i) || w.push(i)) : w.splice(w.indexOf(i), 1); save(); }
    if (el.dataset.meal === 'unit') { S.meals.unit = el.value; save(); render(); }
    if (el.dataset.got != null) { if (el.checked) S.meals.got[el.dataset.got] = 1; else delete S.meals.got[el.dataset.got]; save(); }
    if (el.dataset.set) { const k = el.dataset.set; let val = el.value; if (k === 'days') val = +val; if (k === 'sound' || k === 'vibrate' || k === 'ramp') val = val === '1'; if (k === 'ramp' && val && !S.settings.ramp) S.rampStart = null; S.settings[k] = val; if (k === 'rotation' || k === 'mode') S.pick = null; save(); render(); toast('Saved'); }
    if (el.id === 'importFile' && el.files[0]) {
      const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(r.result); if (!Array.isArray(d.history)) throw 0; S = migrate(d); save(); render(); toast('Imported ' + S.history.length + ' workouts'); } catch (x) { toast('That file isn\'t a MinDose backup'); } }; r.readAsText(el.files[0]);
    }
  });

  $('#view').addEventListener('click', (e) => {
    unlockAudio();
    const t = e.target;
    const seg = t.closest('[data-seg] button');
    if (seg) { const name = seg.parentElement.dataset.seg; if (name === 'mode') { S.settings.mode = seg.dataset.v; S.pick = null; } if (name === 'pick') S.pick = seg.dataset.v; if (name === 'goal') S.meals.goal = seg.dataset.v; if (name === 'fuel') { fuelSeg = seg.dataset.v; save(); render(); window.scrollTo(0, 0); return; } save(); render(); return; }
    const done = t.closest('[data-done]');
    if (done && S.active) {
      const row = done.closest('.set'), i = +row.dataset.i, j = +row.dataset.j, sl = S.active.slots[i], s = sl.sets[j], slot = WK(S.active.mode)[S.active.wid].slots[i];
      if (!s.done && !(+s.r > 0)) { s.r = String(slot.reps[0]); row.querySelector('[data-f=r]').value = s.r; toast(`Logged ${slot.reps[0]} - edit if you did more`); }
      s.done = !s.done; row.classList.toggle('done', s.done); save();
      const allDone = S.active.slots.reduce((n, x) => n + x.sets.filter(y => y.done).length, 0), total = S.active.slots.reduce((n, x) => n + x.sets.length, 0);
      const pg = $('#prog'); if (pg) pg.textContent = allDone + '/' + total;
      if (s.done) { buzz(30); if (allDone === total) { stopTimer(); toast('All sets done - tap Finish 🎉'); } else startTimer(slot.rest); }
      return;
    }
    const sw = t.closest('[data-swap]');
    if (sw) {
      const [wid, i] = sw.dataset.swap.split('.'), mode = S.active ? S.active.mode : S.settings.mode;
      const def = WK(mode)[wid].slots[+i].ex, cur = S.active ? S.active.slots[+i].exId : exIdFor(mode, wid, +i);
      sheet(`<h2 style="margin-top:0">Swap exercise</h2><div class="sub">Same muscles, easier or harder. No equipment.</div>${swapOpts(mode, wid, +i).map(id => `<button class="opt" data-pickex="${id}" data-wid="${wid}" data-i="${i}">${id === cur ? '✓ ' : ''}<b>${esc(EX[id].name)}</b>${id === def ? ' <span class="pill">default</span>' : ''}<small>${EX[id].p.map(m => MLABEL[m]).join(', ')}${EX[id].s.length ? ' · also ' + EX[id].s.map(m => MLABEL[m]).join(', ') : ''}</small></button>`).join('')}<button class="btn block ghost" data-close>Cancel</button>`);
      return;
    }
    const add = t.closest('[data-addset]'); if (add) { S.active.slots[+add.dataset.addset].sets.push({ w: '', r: '', done: false }); save(); render(); return; }
    const rm = t.closest('[data-rmset]'); if (rm) { const sl = S.active.slots[+rm.dataset.rmset]; if (sl.sets.length > 1) sl.sets.pop(); save(); render(); return; }
    const del = t.closest('[data-del]'); if (del) { if (confirm('Delete this workout from history?')) { S.history = S.history.filter(h => h.id !== del.dataset.del); save(); render(); } return; }
    const act = t.closest('[data-act]'); if (!act) return;
    switch (act.dataset.act) {
      case 'start': startSession(todayPlan().wid); break;
      case 'clearGot': S.meals.got = {}; save(); render(); break;
      case 'finish': finishSession(); break;
      case 'cancel': if (confirm('Discard this workout? Logged sets will be lost.')) { S.active = null; save(); stopTimer(); keepAwake(false); render(); } break;
      case 'onboard': S.onboarded = true; save(); render(); break;
      case 'export': { const blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mindose-backup-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); a.remove(); break; }
      case 'reset': if (confirm('Erase ALL workouts and settings on this device?')) { S = clone(DEF); save(); render(); } break;
    }
  });

  $('#sheet').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pickex]'); if (!b) return;
    const wid = b.dataset.wid, i = +b.dataset.i, id = b.dataset.pickex, mode = S.active ? S.active.mode : S.settings.mode;
    if (id === WK(mode)[wid].slots[i].ex) delete S.swaps[swapKey(mode, wid, i)]; else S.swaps[swapKey(mode, wid, i)] = id;
    if (S.active && S.active.wid === wid) S.active.slots[i] = { exId: id, sets: S.active.slots[i].sets.map(s => s.done ? s : { w: '', r: '', done: false }) };
    save(); closeSheet(); render(); toast('Swapped to ' + EX[id].name);
  });

  document.addEventListener('visibilitychange', () => { if (!document.hidden && S.active) keepAwake(true); });

  render();
  if (S.active) keepAwake(true);

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      const hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.register('sw.js').then(r => r.update()).catch(() => { });
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController && !reloaded && !S.active) { reloaded = true; location.reload(); } });
    });
  }
  window.__mindose = { state: () => S, go: (t, seg) => { tab = t; if (seg) fuelSeg = seg; render(); } };
})();
