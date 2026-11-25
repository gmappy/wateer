/* AETHERIA shared store: schema, defaults, localStorage persistence, procedural art.
   Loaded as a classic script by index.html and admin.html -> window.Aetheria */
(function (g) {
  'use strict';
  const KEY = 'aetheria_exhibition_v1';
  const WINGS = ['South', 'East', 'North', 'West'];

  // 16 wall slots: 4 gallery rooms x (near/far row) x (left/right wall). Ids: S1..S4, E1..E4, N1..N4, W1..W4
  const SLOTS = [];
  WINGS.forEach((w, k) => {
    for (let n = 1; n <= 4; n++) {
      SLOTS.push({ id: w[0] + n, kind: 'wall', wing: k, row: (n - 1) >> 1, side: n % 2 ? -1 : 1,
        label: w + ' Gallery, ' + (n <= 2 ? 'near' : 'far') + ' ' + (n % 2 ? 'left' : 'right') });
    }
  });
  // 9 pedestal slots for 3D works: one in the rotunda centre, two per wing (near/far)
  SLOTS.push({ id: 'CP', kind: 'ped', wing: -1, dist: 0, lat: 0, label: 'Central hall pedestal' });
  WINGS.forEach((w, k) => [['P1', 14.8, -2.2, 'near'], ['P2', 18, 2.2, 'far']].forEach(p =>
    SLOTS.push({ id: w[0] + p[0], kind: 'ped', wing: k, dist: p[1], lat: p[2], label: w + ' Gallery, ' + p[3] + ' pedestal' })));
  const slot = id => SLOTS.find(s => s.id === id) || null;

  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- Procedural artwork so the gallery works with zero external assets ---------- */
  const PAL = [
    ['#1b2a49', '#e8b4a0', '#f2d0a4', '#c8553d', '#588b8b'], ['#2d1e2f', '#f4a261', '#e76f51', '#2a9d8f', '#e9c46a'],
    ['#0b3954', '#bfd7ea', '#ff5a5f', '#c81d25', '#f6f1d1'], ['#3d405b', '#f4f1de', '#e07a5f', '#81b29a', '#f2cc8f'],
    ['#10002b', '#c77dff', '#ff9e00', '#7b2cbf', '#e0aaff'], ['#264653', '#e9d8a6', '#ee9b00', '#ca6702', '#94d2bd']
  ];
  function genArt(seed) {
    seed = typeof seed === 'number' ? seed : hash(String(seed));
    const land = seed % 3 === 0, w = land ? 640 : 480, h = land ? 480 : 600;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'), r = rng(seed * 7919 + 13), P = PAL[seed % PAL.length];
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, P[0]); gr.addColorStop(1, P[1]);
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
    const st = seed % 4;
    if (st === 0) { for (let i = 0; i < 14; i++) { x.globalAlpha = .5 + r() * .4; x.fillStyle = P[2 + i % 3]; x.beginPath(); x.arc(r() * w, r() * h, 20 + r() * 110, 0, 6.283); x.fill(); } }
    else if (st === 1) { x.fillStyle = P[4]; x.beginPath(); x.arc(w * (.3 + r() * .4), h * .38, h * .16, 0, 6.283); x.fill();
      for (let i = 0; i < 7; i++) { x.globalAlpha = .85; x.fillStyle = P[2 + i % 3]; x.fillRect(0, h * .5 + i * h * .075, w, h * .075 + 1); } }
    else if (st === 2) { x.lineWidth = 3; for (let i = 0; i < 44; i++) { x.globalAlpha = .7; x.strokeStyle = P[2 + i % 3]; x.beginPath(); x.moveTo(0, r() * h); x.bezierCurveTo(w * .3, r() * h, w * .7, r() * h, w, r() * h); x.stroke(); } }
    else { for (let i = 0; i < 9; i++) { x.globalAlpha = .9; x.fillStyle = P[1 + i % 4]; x.fillRect(r() * w * .8, r() * h * .8, 40 + r() * 170, 40 + r() * 170); }
      x.globalAlpha = 1; x.fillStyle = '#111'; for (let i = 0; i < 5; i++) { x.fillRect(r() * w, 0, 5, h); x.fillRect(0, r() * h, w, 5); } }
    x.globalAlpha = 1; return c;
  }
  const cache = {};
  /** Image source usable in <img>: 'gen:N' -> procedural data URL, otherwise the URL itself. */
  function src(item) {
    const im = item.image || '';
    if (item.kind === 'model') { const c = /^#[0-9a-f]{6}$/i.test(item.color || '') ? item.color : '#c8553d';
      return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#2a1d17"/><path d="M48 14 78 30v36L48 82 18 66V30z" fill="' + c + '"/><path d="M48 14 78 30 48 46 18 30z" fill="#fff" opacity=".35"/><path d="M48 46v36" stroke="#000" opacity=".3" stroke-width="2"/></svg>'); }
    if (!im || im.indexOf('gen:') === 0) { const k = im || 'gen:' + hash(item.id); return cache[k] || (cache[k] = genArt(+k.slice(4) || hash(k)).toDataURL('image/jpeg', .85)); }
    return im;
  }

  /* ---------- Defaults ---------- */
  const T = [
    ['Dawn Over Quiet Water', 'Mara Veldt', '2019', 'Soft light spreads across a still lake; the horizon is barely a suggestion.'],
    ['Seven Hours of Ochre', 'Tomas Ilves', '2021', 'Banded colour fields that track a single day from noon to dusk.'],
    ['Lines of Weather', 'Ines Okafor', '2018', 'Forty ink strokes, each one a recorded gust, layered until they braid.'],
    ['Study in Rectangles', 'Pieter Hahn', '2016', 'A homage to rigorous grids, loosened by one stubborn blue block.'],
    ['Orbits for a Small Town', 'Lucía Brandt', '2022', 'Overlapping discs mapping the routes of everyone who left and returned.'],
    ['Low Sun, Long Shadows', 'Kenji Aoyama', '2020', 'A sun held just above the horizon, stretched into stripes of afternoon.'],
    ['Wind Archive No. 3', 'Ines Okafor', '2023', 'The third in a series translating air pressure into calligraphy.'],
    ['Quiet Grid at Night', 'Pieter Hahn', '2024', 'The same grid, now after dark, where only a few windows stay lit.']
  ];
  const DS = ['S1', 'S2', 'E1', 'E2', 'N1', 'N2', 'W1', 'W2'];
  const T3 = [['Trefoil Study', 'Mara Veldt', '2025', 'A single continuous knot, turning slowly so every angle gets its moment.', 'prim:knot', '#c8553d', 'CP'],
    ['Crystal Garden', 'Tomas Ilves', '2025', 'One faceted stone that throws the gallery light back in pieces.', 'prim:crystal', '#4aa3a2', 'SP1'],
    ['Helix of Small Hours', 'Ines Okafor', '2024', 'Forty-eight beads climbing and shrinking, one for every hour of a long weekend.', 'prim:spiral', '#e0a458', 'NP1']];
  function defaults() {
    const items = T.map((t, i) => ({ id: 'art-' + (i + 1), kind: 'image', title: t[0], creator: t[1], year: t[2], description: t[3], image: 'gen:' + (i + 1), model: '', modelData: '', color: '#c8553d', slot: DS[i], tour: i + 1 }));
    T3.forEach((t, i) => items.push({ id: 'art-3d-' + (i + 1), kind: 'model', title: t[0], creator: t[1], year: t[2], description: t[3], image: '', model: t[4], modelData: '', color: t[5], slot: t[6], tour: 9 + i }));
    return { version: 1, items };
  }

  /* ---------- Validation / persistence ---------- */
  function validate(o) {
    if (!o || !Array.isArray(o.items)) throw new Error('Expected an object with an "items" array.');
    const used = {}, seen = {};
    const items = o.items.map((it, i) => {
      let id = String(it.id || 'art-' + Date.now().toString(36) + i); while (seen[id]) id += '_'; seen[id] = 1;
      const kind = it.kind === 'model' ? 'model' : 'image', sd = slot(it.slot);
      let sl = sd && sd.kind === (kind === 'model' ? 'ped' : 'wall') && !used[it.slot] ? it.slot : ''; if (sl) used[sl] = 1;
      const md = typeof it.modelData === 'string' && it.modelData.indexOf('data:') === 0 && it.modelData.length < 4.2e6 ? it.modelData : '';
      return { id, kind, model: String(it.model || '').slice(0, 500), modelData: md, color: /^#[0-9a-f]{6}$/i.test(it.color || '') ? it.color : '#c8553d', title: String(it.title || 'Untitled').slice(0, 120), creator: String(it.creator || '').slice(0, 120), year: String(it.year || '').slice(0, 20),
        description: String(it.description || '').slice(0, 1200), image: String(it.image || ''), slot: sl, tour: Math.max(0, parseInt(it.tour, 10) || 0) };
    });
    return { version: 1, items };
  }
  let mem = null; // fallback when localStorage is blocked
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) return validate(JSON.parse(raw)); } catch (e) { if (mem) return mem; }
    const d = defaults(); save(d); return d;
  }
  function save(state) { mem = state; try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { return false; } }
  function hasDraft() { try { return !!localStorage.getItem(KEY); } catch (e) { return !!mem; } }
  /** What visitors see: the published exhibition.json shipped with the site (falls back to the sample show). */
  function published() {
    return fetch('exhibition.json', { cache: 'no-store' }).then(r => { if (!r.ok) throw 0; return r.json(); }).then(validate).catch(() => defaults());
  }
  function reset() { const d = defaults(); save(d); return d; }
  /** State for exhibition.json: drops draft-only uploaded model data and points those items at models/<id>.glb */
  function publishState(state) {
    return { version: 1, items: state.items.map(i => { const o = Object.assign({}, i); if (o.modelData) o.model = 'models/' + o.id + '.glb'; delete o.modelData; return o; }) };
  }
  /** Items that appear on the guided tour: placed on a wall AND given a tour number, sorted. */
  function tourList(state) { return state.items.filter(i => i.slot && i.tour > 0).sort((a, b) => a.tour - b.tour); }

  g.Aetheria = { publishState, hasDraft, published, KEY, WINGS, SLOTS, slot, hash, genArt, src, defaults, validate, load, save, reset, tourList };
})(window);
