/* MinDose — minimum-effective-dose full-body workout tracker. All data stays in localStorage. */
(function () {
  'use strict';
  const KEY = 'mindose.v1';
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MLABEL = Object.fromEntries(MUSCLES);
  const DEF = { settings: { mode: 'gym', rotation: 'ABC', days: 3, unit: 'lb', sound: true, vibrate: true }, history: [], active: null, swaps: {}, pick: null, onboarded: false };

  let S;
  try { S = Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); S.settings = Object.assign({}, DEF.settings, S.settings); }
  catch (e) { S = JSON.parse(JSON.stringify(DEF)); }
  if (!Array.isArray(S.history)) S.history = [];
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Storage full or blocked'); } };

  let tab = 'today';
  const MODES = { gym: 'Gym', db: 'Dumbbells', bw: 'Bodyweight' };

  // ---------- helpers ----------
  const rotation = () => S.settings.rotation === 'AB' ? ['A', 'B'] : ['A', 'B', 'C'];
  function nextWid() {
    const rot = rotation();
    if (S.pick && rot.includes(S.pick)) return S.pick;
    const last = S.history[0] && S.history[0].wid;
    const i = rot.indexOf(last);
    return i < 0 ? rot[0] : rot[(i + 1) % rot.length];
  }
  const swapKey = (wid, i, mode) => `${wid}.${i}.${mode}`;
  const exIdFor = (wid, i, mode) => S.swaps[swapKey(wid, i, mode)] || WORKOUTS[wid].slots[i].v[mode];
  const repsFor = (slot, mode) => (mode === 'bw' && slot.bwReps) || (mode === 'db' && slot.dbReps) || slot.reps;
  const unitOf = (ex) => ex.unit === 'sec' ? 'sec' : 'reps';
  function estMinutes(wid, mode) {
    let s = 0; WORKOUTS[wid].slots.forEach(sl => { s += sl.sets * ((sl.ss ? sl.rest * 0.6 : sl.rest) + 45); });
    return Math.round(s / 60 + 5);
  }
  function weekStart(d = new Date()) { const x = new Date(d); x.setHours(0, 0, 0, 0); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); return x; }
  const fmtDate = (t) => new Date(t).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const fmtClock = (s) => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  function lastPerf(exId) {
    for (const h of S.history) { const e = h.exercises.find(x => x.exId === exId); if (e && e.sets.length) return { sets: e.sets, date: h.date }; }
    return null;
  }
  function suggestion(exId, slot, mode) {
    const ex = EX[exId], [lo, hi] = repsFor(slot, mode), u = S.settings.unit, lp = lastPerf(exId);
    if (!lp) return { cls: '', text: `First time: choose a load you can do for ~${lo + 2}-${hi} reps with good form. Stop each set with 1-3 reps left in the tank.`, w: '' };
    const reps = lp.sets.map(s => +s.r || 0), ws = lp.sets.map(s => +s.w || 0), w = Math.max(...ws);
    const allTop = lp.sets.length >= slot.sets && reps.every(r => r >= hi);
    const lastTxt = lp.sets.map(s => (s.w ? s.w + '×' : '') + s.r).join(', ');
    if (!w || ex.unit === 'sec') {
      if (allTop) return { cls: 'up', text: `↑ You hit ${hi}+ on every set (${lastTxt}). Make it harder: add load (backpack/heavier), slow the lowering to 3-4 s, or pick the harder swap.`, w: w || '' };
      return { cls: '', text: `Beat last time (${lastTxt}): aim for +1 ${unitOf(ex) === 'sec' ? '5 sec' : 'rep'} on at least one set.`, w: w || '' };
    }
    const big = ex.load === 'big', inc = u === 'kg' ? (big ? 5 : 2) : (big ? 10 : 5);
    if (allTop) return { cls: 'up', text: `↑ Increase to ${w + inc} ${u} — you hit the top of the range (${hi}) on all sets last time. Expect fewer reps; that's normal.`, w: w + inc };
    return { cls: '', text: `Keep ${w} ${u} and beat last time (${lastTxt}). When every set reaches ${hi} reps, add weight.`, w };
  }

  // ---------- coverage ----------
  function coverage(since) {
    const t = Object.fromEntries(MUSCLES.map(([k]) => [k, 0]));
    const add = (exId, n) => { const ex = EX[exId]; if (!ex || !n) return; ex.p.forEach(m => t[m] += n); ex.s.forEach(m => t[m] += n / 2); };
    S.history.filter(h => h.date >= since).forEach(h => h.exercises.forEach(e => add(e.exId, e.sets.length)));
    if (S.active) S.active.slots.forEach((sl) => add(sl.exId, sl.sets.filter(s => s.done).length));
    return t;
  }
  function plannedCoverage(mode) {
    const t = Object.fromEntries(MUSCLES.map(([k]) => [k, 0])), rot = rotation(), per = S.settings.days / rot.length;
    rot.forEach(wid => WORKOUTS[wid].slots.forEach((sl, i) => { const ex = EX[exIdFor(wid, i, mode)]; ex.p.forEach(m => t[m] += sl.sets * per); ex.s.forEach(m => t[m] += sl.sets * per / 2); }));
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
  function weekCounts() {
    const m = {}; S.history.forEach(h => { const k = +weekStart(new Date(h.date)); m[k] = (m[k] || 0) + 1; }); return m;
  }
  function streak() {
    const m = weekCounts(), goal = 2; let w = weekStart(), n = 0;
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
  let T = { end: 0, total: 0, iv: null };
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
  function startSession(wid) {
    const mode = S.settings.mode;
    S.active = { wid, mode, start: Date.now(), warm: [], slots: WORKOUTS[wid].slots.map((sl, i) => {
      const exId = exIdFor(wid, i, mode), sg = suggestion(exId, sl, mode);
      return { exId, sets: Array.from({ length: sl.sets }, () => ({ w: sg.w, r: '', done: false })) };
    }) };
    S.pick = null; save(); render(); keepAwake(true); window.scrollTo(0, 0);
  }
  function finishSession() {
    const a = S.active; if (!a) return;
    const exercises = a.slots.map((sl, i) => ({ exId: sl.exId, name: EX[sl.exId].name, slot: i, sets: sl.sets.filter(s => s.done && +s.r > 0).map(s => ({ w: +s.w || 0, r: +s.r })) })).filter(e => e.sets.length);
    if (!exercises.length) { if (confirm('No sets logged. Discard this workout?')) { S.active = null; save(); render(); keepAwake(false); } return; }
    const rec = { id: Date.now().toString(36), date: Date.now(), start: a.start, wid: a.wid, mode: a.mode, min: Math.max(1, Math.round((Date.now() - a.start) / 60000)), exercises };
    S.history.unshift(rec); S.active = null; save(); stopTimer(); keepAwake(false);
    const sets = exercises.reduce((n, e) => n + e.sets.length, 0);
    tab = 'progress'; render(); window.scrollTo(0, 0);
    sheet(`<h2 style="margin-top:0">💪 Workout ${rec.wid} done</h2><p>${sets} hard sets in ${rec.min} min. Streak: <b>${streak()} week${streak() === 1 ? '' : 's'}</b>.</p><p class="sub">Check your weekly muscle coverage below — aim to get every bar into the green by the end of the week.</p><button class="btn block" data-close>Nice</button>`);
  }

  // ---------- views ----------
  const segHtml = (name, opts, val) => `<div class="seg" data-seg="${name}">${Object.entries(opts).map(([k, l]) => `<button data-v="${k}" class="${k === val ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  function weekDots() {
    const ws = weekStart(), today = new Date(); today.setHours(0, 0, 0, 0);
    const days = new Set(S.history.map(h => { const d = new Date(h.date); d.setHours(0, 0, 0, 0); return +d; }));
    return `<div class="weekdots">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((l, i) => { const d = new Date(ws); d.setDate(d.getDate() + i);
      return `<div class="wd"><i class="${days.has(+d) ? 'on' : ''} ${+d === +today ? 'today' : ''}">${days.has(+d) ? '✓' : ''}</i>${l}</div>`; }).join('')}</div>`;
  }
  function thisWeekCount() { const ws = +weekStart(); return S.history.filter(h => h.date >= ws).length; }

  function viewToday() {
    if (S.active) return viewActive();
    const wid = nextWid(), w = WORKOUTS[wid], mode = S.settings.mode, done = thisWeekCount();
    const picks = Object.fromEntries(rotation().map(k => [k, 'Workout ' + k]));
    return `
      ${!S.onboarded ? `<div class="card"><h3>👋 Welcome</h3><p class="sub">Full-body, 2-3× a week, ~35-45 min. Every muscle gets 4-10 hard sets a week — the evidence-based sweet spot for "least work, most output". Pick your equipment below and hit Start.</p><button class="btn small ghost" data-act="onboard">Got it</button></div>` : ''}
      <div class="card hero">
        <div class="row between"><span class="pill acc">Next up</span><span class="pill">${done}/${S.settings.days} this week</span></div>
        <h1>${w.title}</h1>
        <div class="sub">${w.focus}</div>
        <div class="row wrap mt"><span class="pill blue">⏱ ~${estMinutes(wid, mode)} min</span><span class="pill">${w.slots.reduce((n, s) => n + s.sets, 0)} hard sets</span><span class="pill">${MODES[mode]}</span></div>
        ${weekDots()}
        <div class="mt">${segHtml('mode', MODES, mode)}</div>
        <div class="mt">${segHtml('pick', picks, wid)}</div>
        <button class="btn block mt" data-act="start">Start ${w.title}</button>
      </div>
      <h2>What's in it</h2>
      ${w.slots.map((sl, i) => { const id = exIdFor(wid, i, mode), ex = EX[id], [lo, hi] = repsFor(sl, mode);
        return `<div class="card ex"><div class="ex-head"><div><div class="ex-name">${esc(ex.name)}</div><div class="ex-meta">${sl.sets} × ${lo}-${hi} ${unitOf(ex)}${ex.perSide ? ' / side' : ''} · rest ${fmtClock(sl.rest)}${sl.ss ? ` · <span class="ss">superset ${sl.ss}</span>` : ''}</div></div><button class="btn small ghost" data-swap="${wid}.${i}">Swap</button></div>
        <div class="tags">${ex.p.map(m => `<span class="tag p">${MLABEL[m]}</span>`).join('')}${ex.s.map(m => `<span class="tag">${MLABEL[m]}</span>`).join('')}</div></div>`; }).join('')}
      <p class="disclaimer mt">Not medical advice. Talk to a doctor first if you have heart, joint, blood-pressure or other health conditions, are pregnant, or are new to exercise. Stop any exercise that causes sharp or joint pain.</p>`;
  }

  function viewActive() {
    const a = S.active, w = WORKOUTS[a.wid], mode = a.mode, u = S.settings.unit;
    const doneSets = a.slots.reduce((n, s) => n + s.sets.filter(x => x.done).length, 0), total = a.slots.reduce((n, s) => n + s.sets.length, 0);
    return `
      <div class="row between"><div><h1>${w.title}</h1><div class="sub">${MODES[mode]} · started ${new Date(a.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · <b id="prog">${doneSets}/${total}</b> sets</div></div></div>
      <details class="card" ${a.warm.length < WARMUP.length ? 'open' : ''}><summary>🔥 Warm-up (~5 min) ${a.warm.length >= WARMUP.length ? '✓' : ''}</summary>
        ${WARMUP.map((t, i) => `<label class="check"><input type="checkbox" data-warm="${i}" ${a.warm.includes(i) ? 'checked' : ''}><span>${esc(t)}</span></label>`).join('')}
      </details>
      <div class="sub" style="margin:6px 2px">Take every set to <b>1-3 reps short of failure</b> (form still clean). Tap ✓ to log a set and start the rest timer.</div>
      ${a.slots.map((sl, i) => {
        const slot = w.slots[i], ex = EX[sl.exId], [lo, hi] = repsFor(slot, mode), sg = suggestion(sl.exId, slot, mode), un = unitOf(ex);
        return `<div class="card ex" id="ex${i}">
          <div class="ex-head"><div><div class="ex-name">${i + 1}. ${esc(ex.name)}</div>
            <div class="ex-meta">${slot.sets} × ${lo}-${hi} ${un}${ex.perSide ? ' / side' : ''} · rest ${fmtClock(slot.rest)}${slot.ss ? ` · <span class="ss">superset ${slot.ss}: alternate with the ${slot.ss === (w.slots[i - 1] || {}).ss ? 'previous' : 'next'} exercise</span>` : ''}</div></div>
            <button class="btn small ghost" data-swap="${a.wid}.${i}">Swap</button></div>
          <div class="tags">${ex.p.map(m => `<span class="tag p">${MLABEL[m]}</span>`).join('')}${ex.s.map(m => `<span class="tag">${MLABEL[m]}</span>`).join('')}</div>
          <div class="sugg ${sg.cls}">${esc(sg.text)}</div>
          <details><summary>Form cues</summary><ul class="cues">${ex.cues.map(c => `<li>${esc(c)}</li>`).join('')}</ul></details>
          <div class="set-h"><span>Set</span><span>${ex.unit === 'sec' || mode === 'bw' ? 'Load (opt.)' : u}</span><span>${un}</span><span>Done</span></div>
          <div class="sets">${sl.sets.map((s, j) => `<div class="set ${s.done ? 'done' : ''}" data-i="${i}" data-j="${j}">
            <span class="n">${j + 1}</span>
            <input type="number" inputmode="decimal" min="0" step="any" placeholder="${mode === 'bw' ? 'BW' : '—'}" value="${esc(s.w)}" data-f="w" aria-label="Weight set ${j + 1}">
            <input type="number" inputmode="numeric" min="0" step="1" placeholder="${lo}-${hi}" value="${esc(s.r)}" data-f="r" aria-label="Reps set ${j + 1}">
            <button class="chk" data-done aria-label="Mark set done">✓</button></div>`).join('')}</div>
          <div class="row between"><button class="linkbtn" data-addset="${i}">+ Add set</button>${sl.sets.length > 1 ? `<button class="linkbtn" style="color:var(--muted)" data-rmset="${i}">− Remove set</button>` : ''}</div>
        </div>`; }).join('')}
      <button class="btn block" data-act="finish">Finish workout</button>
      <button class="btn block ghost mt" data-act="cancel">Discard workout</button>`;
  }

  function viewProgress() {
    const ws = weekStart(), t = coverage(+ws), missing = MUSCLES.filter(([k]) => t[k] < TARGET.min).map(([, l]) => l);
    const totalSets = S.history.reduce((n, h) => n + h.exercises.reduce((m, e) => m + e.sets.length, 0), 0);
    return `<h1>Muscle coverage</h1><div class="sub">Hard sets this week (since ${fmtDate(ws)}). Primary muscle = 1 set, assisting muscle = ½.</div>
      <div class="card">${bodyMap(t)}</div>
      <div class="card">${bars(t)}</div>
      <div class="card">${missing.length === 0 ? '<b>✅ Every muscle is in the 4+ set zone this week.</b> Great work — anything more is a bonus.' :
        `<b>Still below 4 sets:</b> ${missing.join(', ')}.<div class="sub mt">${thisWeekCount() < S.settings.days ? `Your next session (${WORKOUTS[nextWid()].title}) will help — the rotation is built so a full week covers everything.` : 'Totally fine on a light week — consistency over months matters more than any single week.'}</div>`}</div>
      <h2>Consistency</h2>
      <div class="stats"><div class="stat"><b>🔥 ${streak()}</b><span>week streak (2+ sessions)</span></div><div class="stat"><b>${S.history.length}</b><span>workouts</span></div><div class="stat"><b>${totalSets}</b><span>hard sets</span></div></div>
      <div class="card">${weekDots()}</div>`;
  }

  function viewHistory() {
    if (!S.history.length) return `<h1>History</h1><div class="card center"><p>No workouts yet.</p><p class="sub">Finish your first session and it will show up here.</p></div>`;
    const u = S.settings.unit;
    return `<h1>History</h1><div class="sub">${S.history.length} workouts logged</div>` + S.history.map(h => {
      const sets = h.exercises.reduce((n, e) => n + e.sets.length, 0), vol = h.exercises.reduce((n, e) => n + e.sets.reduce((m, s) => m + s.w * s.r, 0), 0);
      return `<details class="card"><summary class="hist-item" style="color:var(--text)"><div><b>${fmtDate(h.date)} · Workout ${esc(h.wid)}</b><div class="sub">${sets} sets · ${h.min} min · ${MODES[h.mode] || ''}${vol ? ` · ${Math.round(vol).toLocaleString()} ${u} volume` : ''}</div></div><span class="sub">▾</span></summary>
        ${h.exercises.map(e => `<div style="margin:10px 0"><b>${esc(e.name)}</b><div class="sub">${e.sets.map(s => (s.w ? esc(s.w) + '×' : '') + esc(s.r)).join(' · ')}</div></div>`).join('')}
        <button class="btn small danger" data-del="${esc(h.id)}">Delete</button></details>`;
    }).join('');
  }

  function viewProgram() {
    const st = S.settings, mode = st.mode;
    return `<h1>The program</h1><div class="sub">Minimum effective dose, full body.</div>
      <div class="card"><h3>Settings</h3>
        <div class="field"><span>Equipment</span><select data-set="mode">${Object.entries(MODES).map(([k, l]) => `<option value="${k}" ${k === mode ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="field"><span>Sessions / week</span><select data-set="days">${[2, 3].map(d => `<option ${d === st.days ? 'selected' : ''}>${d}</option>`).join('')}</select></div>
        <div class="field"><span>Rotation</span><select data-set="rotation"><option value="ABC" ${st.rotation === 'ABC' ? 'selected' : ''}>A / B / C</option><option value="AB" ${st.rotation === 'AB' ? 'selected' : ''}>A / B</option></select></div>
        <div class="field"><span>Units</span><select data-set="unit"><option ${st.unit === 'lb' ? 'selected' : ''}>lb</option><option ${st.unit === 'kg' ? 'selected' : ''}>kg</option></select></div>
        <div class="field"><span>Rest-timer sound</span><select data-set="sound"><option value="1" ${st.sound ? 'selected' : ''}>On</option><option value="0" ${!st.sound ? 'selected' : ''}>Off</option></select></div>
        <div class="field"><span>Vibration*</span><select data-set="vibrate"><option value="1" ${st.vibrate ? 'selected' : ''}>On</option><option value="0" ${!st.vibrate ? 'selected' : ''}>Off</option></select></div>
        <div class="sub">*iPhone Safari doesn't allow web apps to vibrate; you'll get the sound + on-screen alert instead (turn off silent mode).</div>
      </div>
      <div class="card"><h3>Why this works ("least work, most output")</h3><ul class="plain">
        <li><b>Full body, 2-3× a week.</b> Each muscle gets trained 2-3 times weekly, which spreads the work into short sessions instead of long "body-part days".</li>
        <li><b>~4-10 hard sets per muscle per week.</b> Research on training volume shows most of the gains come from the first handful of hard sets; returns diminish beyond that, especially for beginners. The Muscles tab tracks this for you.</li>
        <li><b>Sets close to failure (1-3 reps in reserve).</b> Effort is what makes a set count. Easy sets are mostly wasted time; going all the way to failure on every set adds fatigue for little extra benefit.</li>
        <li><b>Big compound lifts first.</b> Squats, hinges, presses and rows hit several muscles at once — grip, forearms and core get worked "for free".</li>
        <li><b>Progressive overload.</b> Use double progression: stay at a weight until you hit the top of the rep range on every set, then add weight. The app suggests this automatically.</li>
        <li><b>Supersets for small muscles</b> (arms, delts, calves) save time: alternate them with short rests.</li></ul></div>
      <div class="card"><h3>How hard is "1-3 reps in reserve"?</h3><p class="sub">The last rep is slow and hard, form is still clean, and you honestly could only do 1-3 more. If you could do 5+ more, add reps or weight.</p></div>
      <div class="card"><h3>🌱 Beginner note</h3><p class="sub">First 2 weeks: start lighter than you think, and stop sets with ~3 reps left while you learn the movements. You'll progress fast early on. Soreness is normal at first and fades. Sleep 7-9 h and eat enough protein (a palm-sized portion with each meal is a simple rule) — they matter as much as the workout. Walking most days is great for health and recovery.</p></div>
      <h2>Your weekly plan · ${MODES[mode]}</h2>
      ${rotation().map(wid => `<div class="card"><h3>${WORKOUTS[wid].title} <span class="sub">· ~${estMinutes(wid, mode)} min</span></h3><div class="sub">${WORKOUTS[wid].focus}</div><ul class="plain">${WORKOUTS[wid].slots.map((sl, i) => { const ex = EX[exIdFor(wid, i, mode)], [lo, hi] = repsFor(sl, mode); return `<li>${esc(ex.name)} — ${sl.sets}×${lo}-${hi}${ex.unit === 'sec' ? ' s' : ''}${ex.perSide ? '/side' : ''}, rest ${fmtClock(sl.rest)}</li>`; }).join('')}</ul></div>`).join('')}
      <div class="card"><h3>Planned weekly sets (${st.days}×/week)</h3>${bars(plannedCoverage(mode))}</div>
      <div class="card"><h3>Warm-up (every session)</h3><ul class="plain">${WARMUP.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
      <div class="card"><h3>Schedule</h3><p class="sub">3×/week: e.g. Mon/Wed/Fri. 2×/week: e.g. Mon/Thu — the rotation simply continues where you left off, so a missed day never breaks the plan. Leave at least one rest day between sessions when you can.</p></div>
      <div class="card"><h3>⚠️ Safety</h3><p class="disclaimer">This app is general fitness information, not medical advice. Check with a doctor before starting if you have any heart, lung, blood-pressure, joint or other medical condition, are pregnant, recovering from injury, or haven't exercised in a long time. Stop immediately if you feel sharp pain, chest pain, dizziness or unusual shortness of breath. Muscle burn and effort are expected; joint pain is not — swap the exercise.</p></div>
      <div class="card"><h3>📲 Install on iPhone</h3><p class="sub">In Safari: tap the Share button → <b>Add to Home Screen</b>. It then opens full-screen and works offline. Your data stays on this phone only.</p></div>
      <div class="card"><h3>Backup</h3><p class="sub">Data is stored only on this device. Export occasionally to keep a copy.</p>
        <div class="row wrap"><button class="btn small ghost" data-act="export">Export data</button><label class="btn small ghost" style="display:inline-flex;align-items:center">Import<input type="file" accept="application/json" id="importFile" hidden></label><button class="btn small danger" data-act="reset">Reset all</button></div></div>
      <p class="sub center">MinDose v1 · open source</p>`;
  }

  // ---------- render ----------
  function render() {
    const v = { today: viewToday, progress: viewProgress, history: viewHistory, program: viewProgram }[tab]();
    $('#view').innerHTML = v;
    document.querySelectorAll('.tabbar button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    const s = streak(); $('#streakChip').textContent = `🔥 ${s} wk`;
  }

  // ---------- events ----------
  document.querySelector('.tabbar').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; tab = b.dataset.tab; render(); window.scrollTo(0, 0); });

  $('#view').addEventListener('input', (e) => {
    const inp = e.target, row = inp.closest('.set');
    if (row && S.active) { const s = S.active.slots[+row.dataset.i].sets[+row.dataset.j]; s[inp.dataset.f] = inp.value; save(); }
  });
  $('#view').addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.warm != null && S.active) { const i = +el.dataset.warm, w = S.active.warm; el.checked ? (w.includes(i) || w.push(i)) : w.splice(w.indexOf(i), 1); save(); }
    if (el.dataset.set) { const k = el.dataset.set; let val = el.value; if (k === 'days') val = +val; if (k === 'sound' || k === 'vibrate') val = val === '1'; S.settings[k] = val; if (k === 'rotation') S.pick = null; save(); render(); toast('Saved'); }
    if (el.id === 'importFile' && el.files[0]) {
      const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(r.result); if (!Array.isArray(d.history)) throw 0; S = Object.assign({}, DEF, d); S.settings = Object.assign({}, DEF.settings, d.settings); save(); render(); toast('Imported ' + S.history.length + ' workouts'); } catch (x) { toast('That file isn\'t a MinDose backup'); } }; r.readAsText(el.files[0]);
    }
  });

  $('#view').addEventListener('click', (e) => {
    unlockAudio();
    const t = e.target;
    const seg = t.closest('[data-seg] button');
    if (seg) { const name = seg.parentElement.dataset.seg; if (name === 'mode') S.settings.mode = seg.dataset.v; if (name === 'pick') S.pick = seg.dataset.v; save(); render(); return; }
    const done = t.closest('[data-done]');
    if (done) {
      const row = done.closest('.set'), i = +row.dataset.i, j = +row.dataset.j, sl = S.active.slots[i], s = sl.sets[j];
      if (!s.done && !(+s.r > 0)) { const [lo, hi] = repsFor(WORKOUTS[S.active.wid].slots[i], S.active.mode); s.r = String(lo); row.querySelector('[data-f=r]').value = s.r; toast(`Logged ${lo} — edit if you did more`); }
      s.done = !s.done; row.classList.toggle('done', s.done); save();
      const allDone = S.active.slots.reduce((n, x) => n + x.sets.filter(y => y.done).length, 0), total = S.active.slots.reduce((n, x) => n + x.sets.length, 0);
      const pg = $('#prog'); if (pg) pg.textContent = allDone + '/' + total;
      if (s.done) {
        buzz(30);
        const nj = sl.sets[j + 1]; if (nj && !nj.w && s.w) { nj.w = s.w; const nr = row.nextElementSibling; if (nr) nr.querySelector('[data-f=w]').value = s.w; save(); }
        if (allDone === total) { stopTimer(); toast('All sets done — tap Finish 🎉'); }
        else startTimer(WORKOUTS[S.active.wid].slots[i].rest);
      }
      return;
    }
    const sw = t.closest('[data-swap]');
    if (sw) {
      const [wid, i] = sw.dataset.swap.split('.'), mode = S.active ? S.active.mode : S.settings.mode, slot = WORKOUTS[wid].slots[+i];
      const cur = S.active ? S.active.slots[+i].exId : exIdFor(wid, +i, mode), def = slot.v[mode];
      const opts = [...new Set([def, ...EX[def].swaps, ...EX[cur].swaps, cur])];
      sheet(`<h2 style="margin-top:0">Swap exercise</h2><div class="sub">Same muscles, different tool or difficulty.</div>${opts.map(id => `<button class="opt" data-pickex="${id}" data-wid="${wid}" data-i="${i}">${id === cur ? '✓ ' : ''}<b>${esc(EX[id].name)}</b>${id === def ? ' <span class="pill">default</span>' : ''}<small>${EX[id].p.map(m => MLABEL[m]).join(', ')}${EX[id].s.length ? ' · also ' + EX[id].s.map(m => MLABEL[m]).join(', ') : ''}</small></button>`).join('')}<button class="btn block ghost" data-close>Cancel</button>`);
      return;
    }
    const add = t.closest('[data-addset]'); if (add) { const sl = S.active.slots[+add.dataset.addset]; const last = sl.sets[sl.sets.length - 1]; sl.sets.push({ w: last ? last.w : '', r: '', done: false }); save(); render(); return; }
    const rm = t.closest('[data-rmset]'); if (rm) { const sl = S.active.slots[+rm.dataset.rmset]; if (sl.sets.length > 1) sl.sets.pop(); save(); render(); return; }
    const del = t.closest('[data-del]'); if (del) { if (confirm('Delete this workout from history?')) { S.history = S.history.filter(h => h.id !== del.dataset.del); save(); render(); } return; }
    const act = t.closest('[data-act]'); if (!act) return;
    switch (act.dataset.act) {
      case 'start': startSession(nextWid()); break;
      case 'finish': finishSession(); break;
      case 'cancel': if (confirm('Discard this workout? Logged sets will be lost.')) { S.active = null; save(); stopTimer(); keepAwake(false); render(); } break;
      case 'onboard': S.onboarded = true; save(); render(); break;
      case 'export': { const blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mindose-backup-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); a.remove(); break; }
      case 'reset': if (confirm('Erase ALL workouts and settings on this device?')) { S = JSON.parse(JSON.stringify(DEF)); save(); render(); } break;
    }
  });

  $('#sheet').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pickex]'); if (!b) return;
    const wid = b.dataset.wid, i = +b.dataset.i, id = b.dataset.pickex, mode = S.active ? S.active.mode : S.settings.mode;
    if (id === WORKOUTS[wid].slots[i].v[mode]) delete S.swaps[swapKey(wid, i, mode)]; else S.swaps[swapKey(wid, i, mode)] = id;
    if (S.active && S.active.wid === wid) { const slot = WORKOUTS[wid].slots[i], sg = suggestion(id, slot, mode); S.active.slots[i] = { exId: id, sets: S.active.slots[i].sets.map(s => s.done ? s : { w: sg.w, r: '', done: false }) }; }
    save(); closeSheet(); render(); toast('Swapped to ' + EX[id].name);
  });

  document.addEventListener('visibilitychange', () => { if (!document.hidden && S.active) keepAwake(true); });

  render();
  if (S.active) keepAwake(true);

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
  }
  window.__mindose = { state: () => S };
})();
