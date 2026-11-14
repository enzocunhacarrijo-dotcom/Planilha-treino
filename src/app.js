/* =====================================================================
   APP — navegação em telas, abas, modo treino, cronômetro e timers
   ===================================================================== */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const PROG = window.PROGRAM;
  const DAYS = PROG.dias;
  const MN = window.MUSCLES;
  const REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const APP = $('#app');

  /* ---------------- ícones ---------------- */
  const I = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.6v12.8c0 .8.9 1.3 1.6.9l10.2-6.4c.6-.4.6-1.4 0-1.8L9.6 4.7C8.9 4.3 8 4.8 8 5.6z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.2" height="14" rx="1.4"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.4"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    chevR: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    chevRp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    timer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.5M9.5 2.8h5"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.6 2.4c.3 2.7-1 4.4-2.4 6C8.6 10.2 7 12 7 14.8 7 18.2 9.3 21 12.3 21c3.2 0 5.7-2.6 5.7-6.1 0-2.2-.9-3.8-2-5.2-.2 1.3-.8 2.3-1.8 2.8.4-3.6-.7-7.1-1.6-9.1z"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.3 2.5L5 13.4h5.6l-1.1 8.1 8.5-11.2h-5.7l1-7.8z"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17l6-6 4 4 6-7"/><path d="M15 8h5v5"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.2 14.6A8.5 8.5 0 0 1 9.4 3.8a8.5 8.5 0 1 0 10.8 10.8z"/></svg>',
    pos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="4.5" r="2"/><path d="M12 7.5v7M8 22l4-7.5 4 7.5M6 10.5h12"/></svg>',
    move: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M12 3l-4 4M12 3l4 4M12 21l-4-4M12 21l4-4"/></svg>',
    wind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h7"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 3.5L2.8 19.5h18.4L12 3.5z" stroke-linejoin="round"/><path d="M12 10v4.2M12 17.2v.1"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18.3 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
    vibe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="7.5" y="3.5" width="9" height="17" rx="2.5"/><path d="M3.5 9v6M20.5 9v6"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="6.5" y="2.5" width="11" height="19" rx="3"/><path d="M12 7.5v7M9 11.5l3 3 3-3"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/></svg>',
    weight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 12h6M3 10v4M21 10v4"/><rect x="5" y="7" width="4" height="10" rx="1.4"/><rect x="15" y="7" width="4" height="10" rx="1.4"/></svg>'
  };

  /* ---------------- armazenamento ---------------- */
  const KEY = 'treino6x:v1';
  let DB;
  try { DB = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { DB = {}; }
  DB = Object.assign({ weights: {}, history: [], session: null }, DB);
  DB.settings = Object.assign({ sound: true, vibe: true, wake: true }, DB.settings || {});
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { /* modo privado */ } };

  /* ---------------- utilidades ---------------- */
  const todayIdx = () => (new Date().getDay() + 6) % 7; // 0 = segunda
  function weekStart() { const x = new Date(); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x.getTime(); }
  const weekHist = () => { const ws = weekStart(); return DB.history.filter(h => h.t >= ws); };
  function doneThisWeek() { const s = new Set(); weekHist().forEach(h => s.add(h.day)); return s; }
  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = (n, d = 1) => n.toLocaleString('pt-BR', { maximumFractionDigits: d });
  const workSec = e => e.tempo || (/cada/.test(e.nota || '') ? 75 : 40);
  function dayMinutes(day) {
    if (day.descanso) return 0;
    let s = day.aquecimento.min * 60 + day.cardio.min * 60;
    day.ex.forEach(e => { s += e.s * (workSec(e) + e.d); });
    return Math.round(s / 60);
  }
  const totalSets = day => day.ex.reduce((a, e) => a + e.s, 0);
  const repsLabel = e => (e.tempo ? e.tempo + 's' : e.r + ' reps');
  const prescLabel = e => `${e.s} × ${e.tempo ? e.tempo + 's' : e.r} · ${e.d}s`;
  function musLine(ex, max = 4) {
    const p = (ex.pri || []).map(m => `<span class="p">${MN[m]}</span>`);
    const s = (ex.sec || []).map(m => `<span class="s">${MN[m]}</span>`);
    return p.concat(s).slice(0, max).join('');
  }
  const dateLong = d => d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const dateShort = d => d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '');
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const startLabel = i => (DB.session && DB.session.day === DAYS[i].id ? 'Continuar treino' : (doneThisWeek().has(DAYS[i].id) ? 'Treinar de novo' : 'Iniciar treino'));

  /* ---------------- som + vibração ---------------- */
  const Sound = {
    ctx: null,
    unlock() {
      if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* sem áudio */ } }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    beep(f = 880, d = 0.12, v = 0.18, when = 0) {
      if (!this.ctx || !DB.settings.sound) return;
      const t = this.ctx.currentTime + when;
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(t); o.stop(t + d + 0.03);
    },
    tick() { this.beep(700, 0.09, 0.12); },
    done() { this.beep(880, 0.14, 0.2); this.beep(1320, 0.26, 0.2, 0.16); },
    go() { this.beep(988, 0.1, 0.18); this.beep(1480, 0.18, 0.18, 0.11); }
  };
  document.addEventListener('pointerdown', () => Sound.unlock(), { passive: true });
  const buzz = p => { if (!DB.settings.vibe) return; try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* ignore */ } };

  /* ---------------- contagem regressiva ---------------- */
  class Countdown {
    constructor(onTick, onDone) { this.onTick = onTick; this.onDone = onDone; this.active = false; this.paused = null; }
    start(sec) {
      this.total = sec; this.end = Date.now() + sec * 1000; this.paused = null; this.last = Math.ceil(sec); this.active = true;
      clearInterval(this.iv); this.iv = setInterval(() => this.step(), 100); this.step();
    }
    remaining() { if (!this.active) return 0; return this.paused != null ? this.paused : Math.max(0, (this.end - Date.now()) / 1000); }
    progress() { return this.total ? 1 - this.remaining() / this.total : 0; }
    add(sec) {
      if (!this.active) return;
      if (this.paused != null) this.paused = Math.max(0, this.paused + sec);
      else this.end = Math.max(Date.now(), this.end + sec * 1000);
      this.total = Math.max(1, this.total + sec);
      this.step();
    }
    pause() { if (this.active && this.paused == null) this.paused = this.remaining(); }
    resume() { if (this.active && this.paused != null) { this.end = Date.now() + this.paused * 1000; this.paused = null; } }
    stop() { this.active = false; clearInterval(this.iv); }
    step() {
      const r = this.remaining(), c = Math.ceil(r);
      if (c !== this.last) { if (c <= 3 && c > 0 && this.paused == null) Sound.tick(); this.last = c; }
      this.onTick(this);
      if (r <= 0 && this.paused == null && this.active) { this.stop(); this.onDone(this); }
    }
  }

  function ringSVG(r, sw) {
    const c = 2 * Math.PI * r, s = (r + sw / 2) * 2;
    return `<svg viewBox="0 0 ${s} ${s}"><circle class="bg" cx="${s / 2}" cy="${s / 2}" r="${r}"/><circle class="fg" cx="${s / 2}" cy="${s / 2}" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="0"/></svg>`;
  }
  function setRing(el, p) {
    const fg = el && el.querySelector('.fg');
    if (!fg) return;
    const c = parseFloat(fg.getAttribute('stroke-dasharray'));
    fg.setAttribute('stroke-dashoffset', String(c * Math.min(1, Math.max(0, p))));
  }
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toast.tm);
    toast.tm = setTimeout(() => t.classList.remove('on'), 2400);
  }

  /* =================================================================
     TELAS
     ================================================================= */
  function makeScreen({ title, kicker = '', sub = '', large = true, back = null, right = '' }) {
    const el = document.createElement('section');
    el.className = 'screen';
    el.innerHTML = `
      <header class="nb ${large ? '' : 'show-t'}">
        <div class="nb-l">${back ? `<button class="nb-back" data-back aria-label="Voltar para ${esc(back)}">${I.chevL}<span>${esc(back)}</span></button>` : ''}</div>
        <div class="nb-t">${esc(title)}</div>
        <div class="nb-r">${right}</div>
      </header>
      <div class="sc">${large ? `<div class="lt">${kicker ? `<div class="k">${kicker}</div>` : ''}<h1>${esc(title)}</h1>${sub ? `<p>${sub}</p>` : ''}</div>` : ''}<div class="body"></div></div>`;
    const scr = { el, sc: $('.sc', el), body: $('.body', el), nb: $('.nb', el), players: [] };
    scr.sc.addEventListener('scroll', () => { scr.nb.classList.toggle('solid', scr.sc.scrollTop > (large ? 44 : 2)); }, { passive: true });
    return scr;
  }
  const timerBtn = () => `<button class="nb-btn" data-timer aria-label="Timer de descanso">${I.timer}</button>`;

  function mountPlayers(scr) {
    $$('canvas[data-anim]', scr.body).forEach(c => {
      const hidden = scr.el.classList.contains('covered') || Session.isOpen();
      const p = new Rig.Player(c, c.dataset.anim, {
        autoplay: !REDUCED && !hidden, t: REDUCED ? 0.45 : Math.random() * 0.35, speed: +c.dataset.speed || 1
      });
      scr.players.push(p);
    });
  }
  function destroyPlayers(scr) { scr.players.forEach(p => p.destroy()); scr.players = []; }
  function setPlayers(scr, on) { scr.players.forEach(p => (on && !REDUCED ? p.play() : p.pause())); }

  /* =================================================================
     NAVEGAÇÃO (pilha por aba + gesto de voltar + botão voltar do sistema)
     ================================================================= */
  const Nav = (() => {
    const TABS = ['hoje', 'plano', 'exercicios', 'progresso'];
    const views = {}, stacks = {};
    TABS.forEach(t => { views[t] = $(`.view[data-tab="${t}"]`); stacks[t] = []; });
    let cur = 'hoje', skipPop = 0, hist = 0;
    const DUR = 460;

    const top = (tab = cur) => stacks[tab][stacks[tab].length - 1];
    function setRoot(tab, scr) { views[tab].appendChild(scr.el); stacks[tab] = [scr]; }

    function tr(el, x, anim = true) {
      el.style.transition = anim ? `transform ${DUR}ms var(--sheet)` : 'none';
      el.style.transform = x ? `translate3d(${x},0,0)` : '';
    }

    function show(tab) {
      if (tab === cur) {
        if (stacks[tab].length > 1) popToRoot();
        else top().sc.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
        return;
      }
      views[cur].hidden = true;
      cur = tab;
      views[tab].hidden = false;
      $$('#tabbar button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
      const t = top();
      if (t.onShow) t.onShow();
      buzz(6);
    }

    function push(scr) {
      const prev = top();
      scr.el.classList.add('pushed');
      tr(scr.el, '100%', false);
      views[cur].appendChild(scr.el);
      scr.el.getBoundingClientRect();
      tr(scr.el, '0');
      tr(prev.el, '-30%');
      prev.el.classList.add('dim');
      stacks[cur].push(scr);
      clearTimeout(prev._cov);
      prev._cov = setTimeout(() => { if (stacks[cur].includes(prev) && top() !== prev) { prev.el.classList.add('covered'); setPlayers(prev, false); } }, DUR + 40);
      history.pushState({ t6: ++hist }, '');
      setTimeout(() => { const b = $('[data-back]', scr.el); if (b && document.activeElement && document.activeElement !== document.body) b.focus({ preventScroll: true }); }, DUR);
    }

    function pop({ fromHistory = false, instant = false, tab = cur } = {}) {
      const st = stacks[tab];
      if (st.length < 2) return false;
      const leaving = st.pop(), prev = st[st.length - 1];
      clearTimeout(prev._cov);
      prev.el.classList.remove('covered');
      setPlayers(prev, !Session.isOpen());
      if (instant) {
        leaving.el.remove(); destroyPlayers(leaving);
        prev.el.classList.remove('dim'); tr(prev.el, '', false);
      } else {
        tr(leaving.el, '100%');
        tr(prev.el, '');
        prev.el.classList.remove('dim');
        setTimeout(() => { leaving.el.remove(); destroyPlayers(leaving); }, DUR + 40);
      }
      if (!fromHistory) { skipPop++; history.back(); }
      if (prev.onShow) prev.onShow();
      return true;
    }

    function popToRoot() {
      const st = stacks[cur], n = st.length - 1;
      if (n < 1) return;
      while (st.length > 2) { const s = st.splice(1, 1)[0]; s.el.remove(); destroyPlayers(s); }
      pop({ fromHistory: true });
      skipPop++; history.go(-n);
    }

    window.addEventListener('popstate', () => {
      if (skipPop > 0) { skipPop--; return; }
      if (Session.isOpen()) { Session.minimize(true); return; }
      if (pop({ fromHistory: true })) return;
      for (const t of TABS) if (stacks[t].length > 1) { pop({ fromHistory: true, instant: true, tab: t }); return; }
    });

    // arrastar da borda esquerda para voltar (acompanha o dedo, decide pela velocidade)
    TABS.forEach(tab => {
      const view = views[tab];
      let d = null;
      view.addEventListener('pointerdown', e => {
        if (stacks[tab].length < 2 || (e.pointerType === 'mouse' && e.button !== 0)) return;
        const r = view.getBoundingClientRect();
        if (e.clientX - r.left > 26) return;
        const st = stacks[tab];
        d = { x0: e.clientX, x: e.clientX, t: performance.now(), v: 0, w: r.width, a: st[st.length - 1], b: st[st.length - 2], id: e.pointerId, on: false };
      });
      view.addEventListener('pointermove', e => {
        if (!d || e.pointerId !== d.id) return;
        const dx = Math.max(0, e.clientX - d.x0);
        if (!d.on) {
          if (dx < 8) return;
          d.on = true;
          try { view.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
          clearTimeout(d.b._cov);
          d.b.el.classList.remove('covered');
          d.b.el.classList.add('dragging');
        }
        const now = performance.now();
        d.v = (e.clientX - d.x) / Math.max(1, now - d.t);
        d.x = e.clientX; d.t = now;
        tr(d.a.el, dx + 'px', false);
        tr(d.b.el, (-0.3 * d.w + 0.3 * dx) + 'px', false);
        d.b.el.style.setProperty('--dim', String(1 - dx / d.w));
      });
      const end = () => {
        if (!d) return;
        const g = d; d = null;
        if (!g.on) return;
        g.b.el.classList.remove('dragging');
        g.b.el.style.removeProperty('--dim');
        const dx = Math.max(0, g.x - g.x0);
        const projected = dx + g.v * 0.998 / (1 - 0.998); // projeção de momento (v em px/ms)
        if (projected > g.w * 0.5 && top(tab) === g.a) pop({ tab });
        else {
          tr(g.a.el, '0'); tr(g.b.el, '-30%');
          g.b._cov = setTimeout(() => { if (top(tab) !== g.b) { g.b.el.classList.add('covered'); setPlayers(g.b, false); } }, DUR + 40);
        }
      };
      view.addEventListener('pointerup', end);
      view.addEventListener('pointercancel', end);
    });

    $('#tabbar').addEventListener('click', e => {
      const b = e.target.closest('button[data-tab]');
      if (b) show(b.dataset.tab);
    });

    return {
      setRoot, push, pop, show, top, current: () => cur, skipNext() { skipPop++; },
      all: () => TABS.flatMap(t => stacks[t]),
      visibleTops: () => TABS.map(t => top(t)),
      pauseAll() { this.all().forEach(s => setPlayers(s, false)); },
      resumeTops() { this.visibleTops().forEach(s => setPlayers(s, true)); }
    };
  })();

  /* =================================================================
     COMPONENTES
     ================================================================= */
  function heroCard(i, { title = true } = {}) {
    const day = DAYS[i], ti = todayIdx(), done = doneThisWeek().has(day.id);
    return `
      <section class="hero-card">
        <div class="hc-eye">${i === ti ? '<span class="now">Hoje</span>' : ''}${done ? `<span class="ok">Feito ✓</span>` : ''}${day.nome} · ${day.tag}</div>
        ${title ? `<h2>${day.titulo}</h2>` : ''}
        <p class="hc-sub">${day.sub}</p>
        <div class="tags">${day.foco.map(f => `<span class="tag">${f}</span>`).join('')}<span class="tag">${day.cardio.tipo === 'HIIT' ? 'HIIT' : 'Cardio leve'}</span></div>
        <div class="hc-stage stage"><canvas data-anim="${day.ex[0].id}" aria-hidden="true"></canvas><span class="cap">${Rig.get(day.ex[0].id).name}</span></div>
        <div class="metrics">
          <div class="metric"><b class="tnum">${day.ex.length}</b><span>exercícios</span></div>
          <div class="metric"><b class="tnum">${totalSets(day)}</b><span>séries</span></div>
          <div class="metric"><b class="tnum">~${dayMinutes(day)}</b><span>minutos</span></div>
        </div>
        <button class="start-btn" data-start="${i}">${I.play}<span>${startLabel(i)}</span></button>
      </section>`;
  }

  function exRows(i, { big = false } = {}) {
    const day = DAYS[i];
    const th = big ? 'thumb lg' : 'thumb';
    const inset = big ? 132 : 102;
    const warm = `<button class="row" data-ex="aquecimento" data-day="${i}" data-k="w">
        <div class="${th} stage"><canvas data-anim="aquecimento" aria-hidden="true"></canvas></div>
        <div class="tx"><div class="t1">Aquecimento</div><div class="t2">${day.aquecimento.min} min · bike leve + mobilidade</div></div>${I.chevR}</button>`;
    const exs = day.ex.map((e, k) => {
      const ex = Rig.get(e.id);
      return `<button class="row" data-ex="${e.id}" data-day="${i}" data-k="${k}">
        <div class="${th} stage"><canvas data-anim="${e.id}" aria-hidden="true"></canvas></div>
        <div class="tx"><div class="t1">${ex.name}</div><div class="t2 tnum">${prescLabel(e)}${e.nota ? ' · ' + esc(e.nota) : ''}</div>${big ? `<div class="t3 mus">${musLine(ex, 3)}</div>` : ''}</div>${I.chevR}</button>`;
    }).join('');
    const c = day.cardio;
    const cardio = `<button class="row" data-ex="${c.id}" data-day="${i}" data-k="c">
        <div class="${th} stage"><canvas data-anim="${c.id}" data-speed="${c.tipo === 'HIIT' ? 1.4 : 1}" aria-hidden="true"></canvas></div>
        <div class="tx"><div class="t1">${c.titulo}</div><div class="t2">${c.tipo} · ${c.min} min</div>${big ? cardioBars(c) : ''}</div>${I.chevR}</button>`;
    return { warm, exs, cardio, inset };
  }

  function cardioBars(c) {
    const total = c.segs.reduce((a, s) => a + s.s, 0);
    if (c.segs.length < 2) return '';
    return `<div class="segs">${c.segs.map(s => `<i class="${s.hi ? 'hi' : ''}" style="--w:${s.s / total}"></i>`).join('')}</div>`;
  }

  function weekStrip() {
    const done = doneThisWeek(), ti = todayIdx(), ws = new Date(weekStart());
    return `<div class="wk" role="list">${DAYS.map((d, i) => {
      const dt = new Date(ws); dt.setDate(ws.getDate() + i);
      const cls = [done.has(d.id) ? 'done' : '', i === ti ? 'today' : '', d.descanso ? 'rest' : ''].join(' ');
      return `<button class="${cls}" data-day-open="${i}" role="listitem" aria-label="${d.nome}: ${d.titulo}${done.has(d.id) ? ', concluído' : ''}"><span class="l">${d.curto.slice(0, 3).toUpperCase()}</span><span class="c tnum">${done.has(d.id) ? I.check.replace('<svg', '<svg width="16" height="16"') : dt.getDate()}</span></button>`;
    }).join('')}</div>`;
  }

  function weekStats() {
    const h = weekHist();
    const n = new Set(h.map(x => x.day)).size;
    const min = Math.round(h.reduce((a, x) => a + x.dur, 0) / 60);
    const sets = h.reduce((a, x) => a + x.sets, 0);
    return { n, min, sets };
  }

  function ringCard() {
    const { n, min, sets } = weekStats();
    const c = 2 * Math.PI * 50;
    return `<div class="ring-card">
      <div class="ring"><svg viewBox="0 0 112 112"><circle class="bg" cx="56" cy="56" r="50"/><circle class="fg" cx="56" cy="56" r="50" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.min(1, n / 6))}"/></svg><div class="ctr tnum"><div>${n}/6<small>treinos</small></div></div></div>
      <div><div class="rc-k">Esta semana</div><div class="rc-big">${n === 6 ? 'Semana completa!' : n === 0 ? 'Bora começar?' : `Faltam ${6 - n} treinos`}</div><div class="rc-sub tnum">${min} min · ${sets} ${sets === 1 ? 'série' : 'séries'}</div></div>
    </div>`;
  }

  /* =================================================================
     ABA: HOJE
     ================================================================= */
  const Today = (() => {
    const scr = makeScreen({ title: 'Hoje', kicker: dateLong(new Date()), right: timerBtn() });
    scr.render = () => {
      destroyPlayers(scr);
      $('.lt .k', scr.el).textContent = dateLong(new Date());
      const ti = todayIdx(), day = DAYS[ti];
      let h = weekStrip();
      if (day.descanso) {
        const nx = 0;
        h += `<div class="rest-card"><div class="moon">${I.moon}</div><h2>Dia de descanso</h2>
          <p style="margin:0;color:var(--gray-2)">${day.sub}.</p>
          <ul><li><b>Caminhada leve</b> de 30–40 min (opcional).</li><li><b>Alongamento</b> de 10–15 min: quadril, posterior, peito e ombros.</li><li>Durma <b>7–9 horas</b> e mantenha a hidratação.</li></ul></div>
          <div class="sh"><h2>Próximo treino</h2></div>
          <div class="group"><button class="row" data-day-open="${nx}" style="--inset:74px"><span class="badge-day">${DAYS[nx].curto}</span><div class="tx"><div class="t1">${DAYS[nx].titulo}</div><div class="t2">${DAYS[nx].tag} · ${DAYS[nx].ex.length} exercícios · ~${dayMinutes(DAYS[nx])} min</div></div>${I.chevR}</button></div>`;
      } else {
        const r = exRows(ti);
        h += heroCard(ti);
        h += `<div class="sh"><h2>Treino de hoje</h2><span>${day.ex.length + 2} etapas</span></div>
          <div class="group" style="--inset:${r.inset}px">${r.warm}${r.exs}${r.cardio}</div>`;
      }
      const st = weekStats();
      h += `<div class="sh"><h2>Esta semana</h2></div>
        <div class="tiles">
          <div class="tile"><small>Treinos</small><b class="tnum">${st.n}<em>/ 6</em></b></div>
          <div class="tile"><small>Tempo treinando</small><b class="tnum">${st.min}<em>min</em></b></div>
        </div>`;
      scr.body.innerHTML = h;
      mountPlayers(scr);
    };
    return scr;
  })();

  /* =================================================================
     ABA: PLANO
     ================================================================= */
  const Plan = (() => {
    const scr = makeScreen({ title: 'Plano', kicker: 'Push / Pull / Legs · 2× por semana', right: timerBtn() });
    scr.render = () => {
      const pf = PROG.perfil, done = doneThisWeek(), ti = todayIdx();
      const imc = pf.peso / Math.pow(pf.altura / 100, 2);
      const tmb = 10 * pf.peso + 6.25 * pf.altura - 5 * pf.idade + 5;
      const gasto = Math.round(tmb * 1.6 / 50) * 50;
      const kcal = Math.round((gasto - 500) / 50) * 50;
      const prot = [Math.round(pf.peso * 1.8 / 5) * 5, Math.round(pf.peso * 2.0 / 5) * 5];
      scr.body.innerHTML = `
        <div class="chips">${[`<b>${pf.idade}</b> anos`, `<b>${pf.peso}</b> kg`, `<b>${num(pf.altura / 100, 2)}</b> m`, `IMC <b>${num(imc, 1)}</b>`, pf.nivel, pf.local].map(c => `<span class="chip">${c}</span>`).join('')}</div>
        <p class="note" style="margin-top:12px">Objetivo: perder gordura com ênfase em peito, braços e abdômen. Cada músculo é treinado 2× por semana e o cardio vem no fim de cada treino.</p>
        <div class="sh"><h2>Semana</h2><span>${done.size}/6 feitos</span></div>
        <div class="group" style="--inset:74px">${DAYS.map((d, i) => `
          <button class="row" data-day-open="${i}">
            <span class="badge-day ${i === ti ? 'today' : ''} ${d.descanso ? 'rest' : ''}">${d.curto}</span>
            <div class="tx"><div class="t1">${d.titulo}${i === ti ? '<span class="pill">Hoje</span>' : ''}</div>
              <div class="t2">${d.descanso ? 'Recuperação ativa' : `${d.tag} · ${d.ex.length} exercícios · ~${dayMinutes(d)} min`}</div></div>
            ${done.has(d.id) ? `<span class="done-ic" aria-label="concluído">${I.check}</span>` : ''}${I.chevR}
          </button>`).join('')}</div>
        <div class="sh"><h2>Para o resultado aparecer</h2></div>
        <div class="tiles">
          <div class="tile"><div class="ti">${I.flame}</div><small>Calorias / dia</small><b class="tnum">${num(kcal - 100, 0)}–${num(kcal + 100, 0)}</b><p>Gasto estimado ~${num(gasto, 0)} kcal. Déficit de ~500 kcal ≈ −0,5 kg/semana.</p></div>
          <div class="tile"><div class="ti">${I.bolt}</div><small>Proteína / dia</small><b class="tnum">${prot[0]}–${prot[1]}<em>g</em></b><p>1,8–2 g/kg em 4–5 refeições para manter os músculos.</p></div>
          <div class="tile"><div class="ti">${I.up}</div><small>Progressão</small><b>+2–5%</b><p>de carga quando bater o topo das repetições em todas as séries.</p></div>
          <div class="tile"><div class="ti">${I.moon}</div><small>Recuperação</small><b>7–9 h</b><p>de sono, ~3 L de água e 8–10 mil passos por dia.</p></div>
        </div>
        <p class="note">Termine cada série com 1–2 repetições "sobrando". Pare se sentir dor articular e, se possível, valide o plano com um profissional de educação física e um nutricionista.</p>`;
    };
    return scr;
  })();

  /* =================================================================
     TELA: DIA
     ================================================================= */
  function openDay(i, backLabel) {
    const day = DAYS[i];
    const scr = makeScreen({ title: day.titulo, kicker: `${day.nome} · ${day.tag}`, back: backLabel, right: timerBtn() });
    if (day.descanso) {
      scr.body.innerHTML = `<div class="rest-card" style="margin-top:6px"><div class="moon">${I.moon}</div><h2>Descanso & recuperação</h2>
        <p style="margin:0;color:var(--gray-2)">${day.sub}.</p>
        <ul><li><b>Caminhada leve</b> de 30–40 min ao ar livre (opcional).</li><li><b>Alongamento / mobilidade</b> de 10–15 min: quadril, posterior de coxa, peito e ombros.</li><li>Durma <b>7–9 horas</b> e mantenha alimentação e hidratação em dia.</li><li>Revise as cargas da semana e planeje a progressão.</li></ul></div>`;
    } else {
      const r = exRows(i, { big: true });
      scr.body.innerHTML = `${heroCard(i, { title: false })}
        <div class="sh"><h2>Aquecimento</h2><span>${day.aquecimento.min} min</span></div>
        <div class="group" style="--inset:${r.inset}px">${r.warm}</div>
        <div class="sh"><h2>Musculação</h2><span>${day.ex.length} exercícios · ${totalSets(day)} séries</span></div>
        <div class="group" style="--inset:${r.inset}px">${r.exs}</div>
        <div class="sh"><h2>Cardio</h2><span>${day.cardio.tipo} · ${day.cardio.min} min</span></div>
        <div class="group" style="--inset:${r.inset}px">${r.cardio}</div>
        <p class="note">${esc(day.cardio.desc)}</p>`;
    }
    scr.onShow = () => { $$('[data-start] span', scr.body).forEach(s => { s.textContent = startLabel(i); }); };
    Nav.push(scr);
    mountPlayers(scr);
  }

  /* =================================================================
     TELA: EXERCÍCIO
     ================================================================= */
  function planUses(id) {
    const out = [];
    DAYS.forEach((d, i) => {
      if (d.descanso) return;
      d.ex.forEach(e => { if (e.id === id) out.push({ i, e }); });
      if (d.cardio.id === id) out.push({ i, c: d.cardio });
    });
    return out;
  }

  function openExercise(id, ctx, backLabel) {
    const ex = Rig.get(id);
    const info = ex.info, pri = ex.pri || [], sec = ex.sec || [];
    const scr = makeScreen({ title: ex.name, large: false, back: backLabel });
    let presc = '', restBtn = '';
    if (ctx && ctx.entry) {
      const e = ctx.entry;
      presc = `<div class="presc"><div class="box"><b class="tnum">${e.s}</b><span>séries</span></div><div class="box"><b class="tnum">${esc(e.tempo ? e.tempo + 's' : e.r)}</b><span>${e.tempo ? 'por série' : 'reps'}</span></div><div class="box"><b class="tnum">${e.d}s</b><span>descanso</span></div>${e.nota ? `<div class="box wide"><b>${esc(e.nota)}</b></div>` : ''}</div>`;
      restBtn = `<button class="btn-sec" data-rest-start="${e.d}" data-name="${esc(ex.name)}">${I.timer}Iniciar timer de descanso · ${e.d}s</button>`;
    } else if (ctx && ctx.cardio) {
      const c = ctx.cardio;
      presc = `<div class="presc"><div class="box"><b class="tnum">${c.min} min</b><span>${c.tipo}</span></div><div class="box wide" style="grid-column:2/-1"><b>${esc(c.desc)}</b></div></div>`;
    } else {
      const uses = planUses(id);
      if (uses.length) presc = `<div class="presc">${uses.map(u => `<div class="box wide"><b>${DAYS[u.i].nome} · ${u.e ? prescLabel(u.e) + ' de descanso' : u.c.tipo + ' · ' + u.c.min + ' min'}</b><span>no seu plano</span></div>`).join('')}</div>`;
    }
    scr.body.innerHTML = `
      <div class="stage x-stage">
        <canvas aria-label="Animação: ${esc(ex.name)}" role="img"></canvas>
        <div class="stage-ui">
          <div class="phase" aria-live="polite"><span class="ph"></span></div>
          <button class="ctl" data-slow aria-pressed="false" title="Câmera lenta">0,5×</button>
          <button class="ctl" data-play aria-label="Pausar animação">${I.pause}</button>
        </div>
      </div>
      <div class="legend-row"><span><i class="lp"></i>Principal</span><span><i class="ls"></i>Auxiliar</span><span><i class="lt2"></i>Trajetória</span></div>
      <div class="x-head"><h1>${ex.name}</h1><div class="mus">${musLine(ex, 8)}</div></div>
      ${presc}${restBtn}
      <div class="seg" role="tablist"><i></i><button role="tab" aria-selected="true" data-seg="0">Como fazer</button><button role="tab" aria-selected="false" data-seg="1">Músculos</button></div>
      <div class="panel" data-panel="0">
        <div class="cues">
          <div class="cue"><h5>${I.pos}Posição</h5><ul>${info.setup.map(x => `<li>${x}</li>`).join('')}</ul></div>
          <div class="cue"><h5>${I.move}Execução</h5><ul>${info.exec.map(x => `<li>${x}</li>`).join('')}</ul></div>
          <div class="cue"><h5>${I.wind}Respiração</h5><p>${info.breath}</p></div>
          <div class="cue warn"><h5>${I.alert}Evite</h5><ul>${info.avoid.map(x => `<li>${x}</li>`).join('')}</ul></div>
        </div>
      </div>
      <div class="panel" data-panel="1" hidden>
        <div class="mus-panel">
          <h4>Músculos trabalhados</h4>
          ${window.bodyMap(pri, sec)}
          <div class="m-list">
            ${pri.length ? `<div><b>Principais</b><span>${pri.map(m => MN[m]).join(', ')}</span></div>` : ''}
            ${sec.length ? `<div><b>Auxiliares</b><span>${sec.map(m => MN[m]).join(', ')}</span></div>` : ''}
          </div>
        </div>
      </div>`;
    Nav.push(scr);
    const hiit = ctx && ctx.cardio && ctx.cardio.tipo === 'HIIT';
    const phEl = $('.ph', scr.body);
    const player = new Rig.Player($('canvas', scr.body), id, { autoplay: true, speed: hiit ? 1.4 : 1, onPhase: t => { phEl.textContent = t || ''; } });
    scr.players.push(player);
    scr.body.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-play')) {
        const on = player.toggle();
        b.innerHTML = on ? I.pause : I.play;
        b.setAttribute('aria-label', on ? 'Pausar animação' : 'Reproduzir animação');
      } else if (b.hasAttribute('data-slow')) {
        const slow = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', String(slow)); b.classList.toggle('on', slow);
        player.speed = (slow ? 0.5 : 1) * (hiit ? 1.4 : 1);
      } else if (b.dataset.seg != null) {
        const k = +b.dataset.seg;
        $('.seg', scr.body).classList.toggle('r', k === 1);
        $$('.seg button', scr.body).forEach(x => x.setAttribute('aria-selected', String(+x.dataset.seg === k)));
        $$('.panel', scr.body).forEach(p => { p.hidden = +p.dataset.panel !== k; });
        buzz(6);
      }
    });
  }

  /* =================================================================
     ABA: EXERCÍCIOS (biblioteca)
     ================================================================= */
  const GROUPS = [
    ['todos', 'Todos', null], ['peito', 'Peito', ['chest']], ['costas', 'Costas', ['lats', 'midback', 'traps', 'lowerback']],
    ['ombros', 'Ombros', ['delts_front', 'delts_side', 'delts_rear']], ['bracos', 'Braços', ['biceps', 'triceps', 'forearms']],
    ['pernas', 'Pernas', ['quads', 'hamstrings', 'glutes', 'calves']], ['abdomen', 'Abdômen', ['abs', 'obliques']], ['cardio', 'Cardio', 'cardio']
  ];
  const LIB_IDS = (() => {
    const s = [];
    DAYS.forEach(d => d.ex.forEach(e => { if (!s.includes(e.id)) s.push(e.id); }));
    ['esteira', 'bike'].forEach(id => s.push(id));
    return s;
  })();

  const Library = (() => {
    const scr = makeScreen({ title: 'Exercícios', kicker: `${LIB_IDS.length} movimentos animados`, right: timerBtn() });
    let filter = 'todos', query = '';
    scr.body.innerHTML = `
      <label class="search">${I.search}<input type="search" placeholder="Buscar exercício ou músculo" aria-label="Buscar exercício" enterkeyhint="search"></label>
      <div class="filters" role="toolbar" aria-label="Filtrar por grupo muscular">${GROUPS.map(g => `<button data-f="${g[0]}" aria-pressed="${g[0] === 'todos'}">${g[1]}</button>`).join('')}</div>
      <div class="sh" style="margin-top:16px"><h2 class="lib-t">Todos</h2><span class="lib-n"></span></div>
      <div class="grid2"></div>`;
    const grid = $('.grid2', scr.body);
    const dayNames = id => planUses(id).map(u => DAYS[u.i].curto).filter((v, k, a) => a.indexOf(v) === k).join(' · ');
    scr.render = () => {
      scr.players.forEach(p => p.destroy()); scr.players = [];
      const g = GROUPS.find(x => x[0] === filter);
      const q = norm(query.trim());
      const ids = LIB_IDS.filter(id => {
        const ex = Rig.get(id);
        if (g[2] === 'cardio' && !['esteira', 'bike'].includes(id)) return false;
        if (Array.isArray(g[2]) && !(ex.pri || []).some(m => g[2].includes(m))) return false;
        if (q && !norm(ex.name + ' ' + (ex.pri || []).concat(ex.sec || []).map(m => MN[m]).join(' ')).includes(q)) return false;
        return true;
      });
      $('.lib-t', scr.body).textContent = g[1];
      $('.lib-n', scr.body).textContent = ids.length + (ids.length === 1 ? ' exercício' : ' exercícios');
      grid.innerHTML = ids.length ? ids.map(id => {
        const ex = Rig.get(id);
        return `<button class="tile-ex" data-ex="${id}">
          <div class="stage"><canvas data-anim="${id}" aria-hidden="true"></canvas></div>
          <div class="tb"><h4>${ex.name}</h4><div class="mus">${musLine(ex, 2)}</div><div class="days">${dayNames(id)}</div></div>
        </button>`;
      }).join('') : '';
      const old = $('.empty', scr.body);
      if (old) old.remove();
      if (!ids.length) grid.insertAdjacentHTML('afterend', '<p class="empty">Nenhum exercício encontrado.</p>');
      mountPlayers(scr);
    };
    scr.body.addEventListener('click', e => {
      const b = e.target.closest('[data-f]');
      if (!b) return;
      filter = b.dataset.f;
      $$('[data-f]', scr.body).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      buzz(6);
      scr.render();
    });
    let tm;
    $('input', scr.body).addEventListener('input', e => { query = e.target.value; clearTimeout(tm); tm = setTimeout(scr.render, 160); });
    return scr;
  })();

  /* =================================================================
     ABA: PROGRESSO
     ================================================================= */
  let installEvt = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; });
  const isStandalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;

  const Progress = (() => {
    const scr = makeScreen({ title: 'Progresso', kicker: 'Seu histórico' });
    scr.render = () => {
      const H = DB.history.slice().reverse();
      const totMin = Math.round(DB.history.reduce((a, x) => a + x.dur, 0) / 60);
      const totSets = DB.history.reduce((a, x) => a + x.sets, 0);
      const loads = Object.entries(DB.weights).filter(([id, v]) => Rig.get(id) && v > 0);
      const set = DB.settings;
      scr.body.innerHTML = `
        ${ringCard()}
        <div class="sh"><h2>No total</h2></div>
        <div class="tiles t3">
          <div class="tile"><small>Treinos</small><b class="tnum">${DB.history.length}</b></div>
          <div class="tile"><small>Tempo</small><b class="tnum">${totMin < 60 ? totMin + '<em>min</em>' : num(totMin / 60, 1) + '<em>h</em>'}</b></div>
          <div class="tile"><small>Séries</small><b class="tnum">${totSets}</b></div>
        </div>
        <div class="sh"><h2>Histórico</h2>${H.length ? `<span>${H.length}</span>` : ''}</div>
        ${H.length ? `<div class="group" style="--inset:74px">${H.slice(0, 30).map(h => {
          const d = DAYS.find(x => x.id === h.day) || DAYS[0];
          return `<div class="row"><span class="badge-day">${d.curto}</span><div class="tx"><div class="t1">${d.titulo}</div><div class="t2 tnum">${dateShort(new Date(h.t))} · ${fmt(h.dur)} · ${h.sets} ${h.sets === 1 ? 'série' : 'séries'}</div></div></div>`;
        }).join('')}</div>` : '<p class="empty" style="margin:6px 24px">Nenhum treino salvo ainda. Termine um treino e toque em “Salvar na semana”.</p>'}
        <div class="sh"><h2>Minhas cargas</h2></div>
        ${loads.length ? `<div class="group" style="--inset:60px">${loads.map(([id, v]) => `<button class="row" data-ex="${id}"><span class="ic">${I.weight}</span><div class="tx"><div class="t1">${Rig.get(id).name}</div></div><span class="val tnum">${num(v, 1)} kg</span>${I.chevR}</button>`).join('')}</div>`
          : '<p class="empty" style="margin:6px 24px">As cargas que você anotar durante o treino aparecem aqui.</p>'}
        <div class="sh"><h2>Ajustes</h2></div>
        <div class="group" style="--inset:60px">
          <label class="row"><span class="ic">${I.sound}</span><div class="tx"><div class="t1">Sons do timer</div></div><span class="sw"><input type="checkbox" data-set="sound" ${set.sound ? 'checked' : ''}><span></span></span></label>
          <label class="row"><span class="ic">${I.vibe}</span><div class="tx"><div class="t1">Vibração</div></div><span class="sw"><input type="checkbox" data-set="vibe" ${set.vibe ? 'checked' : ''}><span></span></span></label>
          <label class="row"><span class="ic">${I.sun}</span><div class="tx"><div class="t1">Manter tela ligada no treino</div></div><span class="sw"><input type="checkbox" data-set="wake" ${set.wake ? 'checked' : ''}><span></span></span></label>
        </div>
        <div class="sh"><h2>App</h2></div>
        <div class="group" style="--inset:60px">
          <button class="row" data-install><span class="ic">${I.phone}</span><div class="tx"><div class="t1">${isStandalone() ? 'App instalado ✓' : 'Instalar na tela de início'}</div><div class="t2">Abre em tela cheia e funciona offline</div></div>${I.chevR}</button>
          <div class="install-help" hidden>
            <p style="margin:0 0 6px"><b>iPhone (Safari):</b> toque em Compartilhar <b>⎋</b> → <b>Adicionar à Tela de Início</b>.</p>
            <p style="margin:0 0 6px"><b>Android (Chrome):</b> menu <b>⋮</b> → <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</p>
            <p style="margin:0">Para instalar, o app precisa estar aberto pelo endereço onde foi publicado (ex.: GitHub Pages), não como arquivo baixado.</p>
          </div>
          <button class="row danger" data-reset><span class="ic">${I.trash}</span><div class="tx"><div class="t1">Apagar histórico e cargas</div></div></button>
        </div>
        <p class="note" style="text-align:center;margin-top:18px">Treino 6× · seus dados ficam só neste aparelho.</p>`;
    };
    scr.body.addEventListener('change', e => {
      const k = e.target.dataset.set;
      if (!k) return;
      DB.settings[k] = e.target.checked; save();
      buzz(8);
    });
    scr.body.addEventListener('click', async e => {
      if (e.target.closest('[data-install]')) {
        if (installEvt) { installEvt.prompt(); try { await installEvt.userChoice; } catch (err) { /* ignore */ } installEvt = null; scr.render(); return; }
        const h = $('.install-help', scr.body); h.hidden = !h.hidden;
      } else if (e.target.closest('[data-reset]')) {
        if (!confirm('Apagar todo o histórico de treinos e as cargas anotadas?')) return;
        DB.history = []; DB.weights = {}; save();
        refreshAll(); toast('Dados apagados');
      }
    });
    return scr;
  })();

  /* =================================================================
     TIMER DE DESCANSO AVULSO
     ================================================================= */
  const Dock = (() => {
    const el = $('#dock');
    const ring = $('.mini-ring', el);
    ring.innerHTML = ringSVG(23, 5);
    const tEl = $('#dock-time'), lab = $('#dock-label');
    let label = '';
    const cd = new Countdown(c => {
      tEl.textContent = fmt(c.remaining());
      setRing(ring, c.progress());
    }, () => {
      Sound.done(); buzz([200, 100, 200, 100, 300]);
      el.classList.add('done');
      lab.textContent = 'Descanso concluído · bora!';
      tEl.textContent = '0:00';
      setTimeout(() => { if (!cd.active) hide(); }, 4500);
    });
    function hide() { el.classList.remove('on', 'done'); el.setAttribute('aria-hidden', 'true'); cd.stop(); }
    function start(sec, name) {
      Sound.unlock();
      label = name || '';
      el.classList.remove('done');
      lab.textContent = 'Descanso' + (label ? ' · ' + label : '');
      $$('.presets button', el).forEach(b => b.classList.toggle('on', +b.dataset.s === sec));
      cd.start(sec);
      el.classList.add('on'); el.setAttribute('aria-hidden', 'false');
    }
    el.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.s) start(+b.dataset.s, label);
      else if (b.dataset.add) cd.add(+b.dataset.add);
      else if (b.dataset.act === 'close') hide();
    });
    return { start, hide, toggle() { if (!el.classList.contains('on')) start(60, ''); else hide(); }, isOn: () => el.classList.contains('on') };
  })();

  /* =================================================================
     MINI PLAYER (treino minimizado)
     ================================================================= */
  const Mini = (() => {
    const el = $('#mini');
    let player = null, iv = 0;
    function elapsedOf(s) { const now = Date.now(); return (now - s.start - s.pausedMs - (s.pausedAt ? now - s.pausedAt : 0)) / 1000; }
    function update() {
      const s = DB.session;
      const on = !!s && !Session.isOpen() && !s.finished;
      el.classList.toggle('on', on);
      APP.classList.toggle('has-mini', on);
      clearInterval(iv);
      if (!on) { if (player) player.pause(); return; }
      const day = DAYS.find(d => d.id === s.day);
      const steps = 2 + day.ex.length;
      const i = Math.min(s.i || 0, steps - 1);
      const id = i === 0 ? 'aquecimento' : (i === steps - 1 ? day.cardio.id : day.ex[i - 1].id);
      $('#mini-title').textContent = `${day.titulo} · ${Rig.get(id).name}`;
      if (!player) player = new Rig.Player($('#mini-canvas'), id, { autoplay: !REDUCED });
      else { if (player.id !== id) player.setExercise(id); if (!REDUCED) player.play(); }
      const tick = () => { $('#mini-time').textContent = fmt(elapsedOf(DB.session || s)); };
      tick(); iv = setInterval(tick, 1000);
    }
    el.addEventListener('click', () => {
      const s = DB.session; if (!s) return;
      const i = DAYS.findIndex(d => d.id === s.day);
      if (i >= 0) Session.open(i);
    });
    return { update };
  })();

  /* =================================================================
     MODO TREINO
     ================================================================= */
  const Session = (() => {
    const root = $('#session');
    let S = null, player = null, clockIv = 0, wake = null;

    function buildSteps(day) {
      const st = [{ kind: 'timed', id: day.aquecimento.id, title: 'Aquecimento', segs: day.aquecimento.segs }];
      day.ex.forEach(e => st.push({ kind: 'sets', id: e.id, e }));
      st.push({ kind: 'timed', id: day.cardio.id, title: day.cardio.titulo, segs: day.cardio.segs, hiit: day.cardio.tipo === 'HIIT', cardio: true });
      return st;
    }

    const restCd = new Countdown(c => {
      $('#rest-time').textContent = fmt(c.remaining());
      setRing($('#rest-ring'), c.progress());
    }, () => {
      Sound.done(); buzz([200, 100, 300]);
      hideRest();
      toast('Descanso concluído — próxima série!');
    });

    const timedCd = new Countdown(c => {
      const tr = $('#timed-ring');
      if (tr) { $('b', tr).textContent = fmt(c.remaining()); setRing(tr, c.progress()); }
      const tot = $('#timed-total');
      if (tot && S && S.steps[S.i].kind === 'timed') {
        const st = S.steps[S.i];
        const rest = c.remaining() + st.segs.slice(S.seg + 1).reduce((a, s) => a + s.s, 0);
        tot.textContent = 'Restam ' + fmt(rest) + ' no total';
      }
    }, () => onTimedDone());

    /* ---------- abrir / minimizar ---------- */
    function open(i) {
      const day = DAYS[i];
      Sound.unlock();
      if (DB.session && DB.session.day !== day.id) {
        const other = DAYS.find(d => d.id === DB.session.day);
        if (!confirm(`Você tem um treino de ${other ? other.titulo : 'outro dia'} em andamento. Descartar e começar ${day.titulo}?`)) return;
        DB.session = null;
      }
      if (!DB.session || DB.session.day !== day.id || Date.now() - DB.session.start > 6 * 3600e3) {
        DB.session = { day: day.id, start: Date.now(), pausedMs: 0, pausedAt: null, i: 0, done: {} };
        save();
      }
      S = Object.assign({ steps: buildSteps(day), dayObj: day, seg: 0, timedOn: false }, DB.session);
      if (S.pausedAt) { S.pausedMs += Date.now() - S.pausedAt; S.pausedAt = null; }
      syncPauseUI();
      persist();
      $('#ses-day').textContent = day.titulo;
      buildProgress();
      root.classList.add('on');
      root.setAttribute('aria-hidden', 'false');
      Nav.pauseAll();
      Mini.update();
      if (!player) player = new Rig.Player($('#ses-canvas'), S.steps[S.i].id, { onPhase: t => { $('#ses-phase').textContent = t || ''; } });
      else player.setExercise(S.steps[S.i].id);
      player.play();
      player.resize();
      clearInterval(clockIv);
      clockIv = setInterval(tickClock, 250);
      tickClock();
      render();
      requestWake();
      $('#summary').classList.remove('on');
      history.pushState({ t6s: 1 }, '');
      buzz(10);
    }

    function minimize(fromHistory) {
      if (!root.classList.contains('on')) return;
      root.classList.remove('on');
      root.setAttribute('aria-hidden', 'true');
      if (player) player.pause();
      clearInterval(clockIv);
      releaseWake();
      Nav.resumeTops();
      if (!fromHistory) { Nav.skipNext(); history.back(); }
      refreshAll();
    }

    function persist() {
      if (!S) return;
      DB.session = { day: S.day, start: S.start, pausedMs: S.pausedMs, pausedAt: S.pausedAt, i: S.i, done: S.done };
      save();
    }

    /* ---------- relógio ---------- */
    function elapsed() {
      if (!S) return 0;
      const now = Date.now();
      return (now - S.start - S.pausedMs - (S.pausedAt ? now - S.pausedAt : 0)) / 1000;
    }
    function tickClock() { $('#ses-clock').textContent = fmt(elapsed()); }
    function syncPauseUI() {
      const p = !!(S && S.pausedAt);
      $('#ses-clockwrap').classList.toggle('paused', p);
      $('#ses-pause').innerHTML = p ? I.play : I.pause;
      $('#ses-pause').setAttribute('aria-label', p ? 'Retomar treino' : 'Pausar treino');
      $('#ses-clocklabel').textContent = p ? 'Pausado' : 'Tempo de treino';
    }
    function togglePause() {
      if (!S) return;
      if (S.pausedAt) {
        S.pausedMs += Date.now() - S.pausedAt; S.pausedAt = null;
        restCd.resume(); timedCd.resume(); player.play();
      } else {
        S.pausedAt = Date.now();
        restCd.pause(); timedCd.pause(); player.pause();
      }
      persist(); syncPauseUI(); tickClock(); buzz(10);
    }

    /* ---------- tela sempre ligada ---------- */
    async function requestWake() {
      if (!DB.settings.wake) return;
      try { if ('wakeLock' in navigator) wake = await navigator.wakeLock.request('screen'); } catch (e) { wake = null; }
    }
    function releaseWake() { try { if (wake) wake.release(); } catch (e) { /* ignore */ } wake = null; }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && root.classList.contains('on')) requestWake();
    });

    /* ---------- progresso ---------- */
    function stepDone(i) {
      const st = S.steps[i], d = S.done[i] || 0;
      return st.kind === 'sets' ? d >= st.e.s : d >= 1;
    }
    function buildProgress() {
      $('#ses-prog').innerHTML = S.steps.map((st, i) => `<button data-i="${i}" aria-label="${i === 0 ? 'Aquecimento' : st.cardio ? 'Cardio' : 'Exercício ' + i}: ${esc(Rig.get(st.id).name)}"><i></i></button>`).join('');
    }
    function updateProgress() {
      $$('#ses-prog button').forEach((b, i) => {
        const st = S.steps[i];
        b.classList.toggle('done', stepDone(i));
        b.classList.toggle('cur', i === S.i && !stepDone(i));
        const frac = st.kind === 'sets' ? Math.min(1, (S.done[i] || 0) / st.e.s) : 0;
        b.querySelector('i').style.width = (stepDone(i) ? 0 : frac * 100) + '%';
      });
    }

    /* ---------- render ---------- */
    function render() {
      const st = S.steps[S.i];
      const ex = Rig.get(st.id);
      if (player.id !== st.id) player.setExercise(st.id);
      player.speed = 1;
      const nEx = S.steps.length - 2;
      let html = '';
      if (st.kind === 'sets') {
        const e = st.e, d = S.done[S.i] || 0, cur = Math.min(d + 1, e.s);
        const allDone = d >= e.s;
        html += `<div class="s-eyebrow">Exercício ${S.i} de ${nEx}${e.nota ? ' · ' + esc(e.nota) : ''}</div>
          <h2>${ex.name}</h2>
          <div class="s-target">${allDone ? 'Todas as séries concluídas' : `Série <b class="tnum">${cur}</b> de ${e.s} · <b>${esc(repsLabel(e))}</b>`} · descanso ${e.d}s</div>
          <div class="dots">${Array.from({ length: e.s }, (_, k) => `<i class="${k < d ? 'on' : (k === d ? 'cur' : '')}"></i>`).join('')}</div>`;
        if (e.peso !== false && !e.tempo) {
          const w = DB.weights[e.id];
          html += `<div class="load"><label for="ses-w">Carga</label><button class="ctl" data-w="-2.5" aria-label="Diminuir carga">−</button><input id="ses-w" type="number" inputmode="decimal" step="0.5" min="0" placeholder="—" value="${w != null ? w : ''}"><button class="ctl" data-w="2.5" aria-label="Aumentar carga">+</button><span>kg</span></div>`;
        }
        if (e.tempo) {
          html += `<div class="timed"><div class="big-ring" id="timed-ring">${ringSVG(50, 8)}<b class="tnum">${fmt(e.tempo)}</b></div><div class="timed-t"><small>Série por tempo</small><b>${S.timedOn ? 'Segure firme!' : 'Pronto?'}</b><span>${S.timedOn ? 'Respiração contínua' : 'O timer começa ao tocar em Iniciar'}</span></div></div>`;
        }
        html += '<div class="s-actions">';
        if (allDone) html += `<button class="main-btn" id="ses-main">Próximo exercício ${I.chevRp}</button>`;
        else if (e.tempo) html += `<button class="main-btn ${S.timedOn ? 'alt' : ''}" id="ses-main">${S.timedOn ? I.check + 'Concluir série agora' : I.play + `Iniciar série ${cur} · ${e.tempo}s`}</button>`;
        else html += `<button class="main-btn" id="ses-main">${I.check}Concluir série ${cur}</button>`;
      } else {
        const seg = st.segs[S.seg] || st.segs[0];
        const done = stepDone(S.i);
        const total = st.segs.reduce((a, s) => a + s.s, 0);
        const nextSeg = st.segs[S.seg + 1];
        html += `<div class="s-eyebrow">${st.cardio ? 'Cardio · ' + (st.hiit ? 'HIIT' : 'LISS') : 'Preparação'}</div>
          <h2>${st.title}</h2>
          <div class="s-target">${st.cardio ? esc(S.dayObj.cardio.desc) : 'Prepare articulações e coração antes da carga.'}</div>
          <div class="timed ${S.timedOn && seg.hi ? 'hi' : ''}"><div class="big-ring" id="timed-ring">${ringSVG(50, 8)}<b class="tnum">${fmt(S.timedOn ? timedCd.remaining() : seg.s)}</b></div>
            <div class="timed-t"><small>${done ? 'Concluído' : (S.timedOn ? 'Agora' : 'Primeira etapa')}</small><b>${esc(seg.n)}</b>
            <span>${nextSeg ? 'Depois: ' + esc(nextSeg.n) : 'Última etapa'}</span><span id="timed-total">${S.timedOn ? '' : 'Duração total ' + fmt(total)}</span></div></div>
          <div class="s-actions">`;
        if (done) html += `<button class="main-btn" id="ses-main">${S.i === S.steps.length - 1 ? I.flag + 'Finalizar treino' : 'Próximo ' + I.chevRp}</button>`;
        else if (S.timedOn) html += `<button class="main-btn alt" id="ses-main">Pular etapa ${I.chevRp}</button>`;
        else html += `<button class="main-btn" id="ses-main">${I.play}Iniciar · ${fmt(total)}</button>`;
        if (st.hiit && S.timedOn) player.speed = seg.hi ? 1.9 : 0.9;
      }
      html += `<div class="s-nav">
          <button id="ses-prev" ${S.i === 0 ? 'disabled' : ''}>${I.chevL}Anterior</button>
          <button id="ses-end">${I.flag}Encerrar</button>
          <button id="ses-next" ${S.i === S.steps.length - 1 ? 'disabled' : ''}>Próximo${I.chevRp}</button>
        </div></div>`;
      $('#ses-info').innerHTML = html;
      if (S.timedOn) timedCd.step();
      updateProgress();
    }

    /* ---------- ações ---------- */
    function go(i) {
      i = Math.max(0, Math.min(S.steps.length - 1, i));
      timedCd.stop(); S.timedOn = false; S.seg = 0;
      hideRest();
      S.i = i;
      persist();
      render();
    }

    function completeSet() {
      const st = S.steps[S.i];
      S.done[S.i] = (S.done[S.i] || 0) + 1;
      S.timedOn = false;
      timedCd.stop();
      Sound.go(); buzz(40);
      const d = S.done[S.i], e = st.e;
      if (d >= e.s) {
        S.i += 1;
        persist();
        render();
        const nst = S.steps[S.i];
        const nextName = Rig.get(nst.id).name;
        showRest(e.d, nst.kind === 'sets' ? `<b>${esc(nextName)}</b> · série 1 de ${nst.e.s}` : `<b>${esc(nextName)}</b>`);
      } else {
        persist();
        render();
        showRest(e.d, `<b>Série ${d + 1} de ${e.s}</b> · ${esc(repsLabel(e))}`);
      }
    }

    function startTimed() {
      const st = S.steps[S.i];
      S.timedOn = true;
      Sound.go();
      if (st.kind === 'sets') timedCd.start(st.e.tempo);
      else { S.seg = 0; timedCd.start(st.segs[0].s); }
      render();
    }

    function onTimedDone() {
      const st = S.steps[S.i];
      if (st.kind === 'sets') { Sound.done(); buzz([150, 80, 150]); completeSet(); return; }
      if (S.seg < st.segs.length - 1) {
        S.seg++;
        const seg = st.segs[S.seg];
        if (seg.hi) { Sound.go(); buzz([80, 60, 80]); } else { Sound.done(); buzz(120); }
        timedCd.start(seg.s);
        render();
      } else {
        Sound.done(); buzz([200, 100, 300]);
        S.timedOn = false;
        S.done[S.i] = 1;
        persist();
        if (S.i === S.steps.length - 1) { render(); finish(); } else { toast('Etapa concluída!'); go(S.i + 1); }
      }
    }

    function main() {
      const st = S.steps[S.i];
      if (S.pausedAt) togglePause();
      if (st.kind === 'sets') {
        if (stepDone(S.i)) { go(S.i + 1); return; }
        if (st.e.tempo) { if (S.timedOn) completeSet(); else startTimed(); return; }
        const w = $('#ses-w');
        if (w && w.value !== '') { DB.weights[st.id] = parseFloat(w.value); save(); }
        completeSet();
      } else {
        if (stepDone(S.i)) { if (S.i === S.steps.length - 1) finish(); else go(S.i + 1); return; }
        if (S.timedOn) {
          timedCd.stop(); S.timedOn = false; S.done[S.i] = 1; persist();
          if (S.i === S.steps.length - 1) { render(); finish(); } else go(S.i + 1);
        } else startTimed();
      }
    }

    function showRest(sec, nextHtml) {
      $('#rest-next').innerHTML = 'A seguir: ' + nextHtml;
      $('#rest').classList.add('on');
      $('#rest').setAttribute('aria-hidden', 'false');
      restCd.start(sec);
      if (S.pausedAt) restCd.pause();
    }
    function hideRest() {
      restCd.stop();
      $('#rest').classList.remove('on');
      $('#rest').setAttribute('aria-hidden', 'true');
    }

    function finish() {
      timedCd.stop(); hideRest();
      const sets = S.steps.reduce((a, st, i) => a + (st.kind === 'sets' ? Math.min(S.done[i] || 0, st.e.s) : 0), 0);
      const exDone = S.steps.filter((st, i) => st.kind === 'sets' && stepDone(i)).length;
      const nEx = S.steps.filter(st => st.kind === 'sets').length;
      $('#sum-stats').innerHTML = `<div><b class="tnum">${fmt(elapsed())}</b><span>duração</span></div><div><b class="tnum">${sets}</b><span>séries</span></div><div><b class="tnum">${exDone}/${nEx}</b><span>exercícios</span></div>`;
      $('#sum-title').textContent = exDone === nEx ? 'Treino concluído!' : 'Bom trabalho!';
      $('#sum-sub').textContent = `${S.dayObj.titulo} · ${S.dayObj.nome}`;
      S.final = { dur: Math.round(elapsed()), sets };
      if (!S.pausedAt) { S.pausedAt = Date.now(); persist(); }
      $('#summary').classList.add('on');
      Sound.done(); buzz([100, 60, 100, 60, 200]);
    }

    function close(record) {
      if (record) {
        DB.history.push({ t: Date.now(), day: S.day, dur: S.final.dur, sets: S.final.sets });
        DB.history = DB.history.slice(-300);
      }
      DB.session = null;
      save();
      $('#summary').classList.remove('on');
      timedCd.stop(); hideRest();
      S = null;
      minimize(false);
      toast(record ? 'Treino salvo na sua semana ✓' : 'Treino descartado');
    }

    /* ---------- eventos ---------- */
    root.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b || !S) return;
      if (b.id === 'ses-main') main();
      else if (b.id === 'ses-prev') go(S.i - 1);
      else if (b.id === 'ses-next') go(S.i + 1);
      else if (b.id === 'ses-end') { if (confirm('Encerrar o treino agora e ver o resumo?')) finish(); }
      else if (b.id === 'ses-pause') togglePause();
      else if (b.id === 'ses-close') minimize(false);
      else if (b.dataset.w) {
        const inp = $('#ses-w');
        const v = Math.max(0, (parseFloat(inp.value) || 0) + parseFloat(b.dataset.w));
        inp.value = v; DB.weights[S.steps[S.i].id] = v; save(); buzz(6);
      } else if (b.parentElement && b.parentElement.id === 'ses-prog') go(+b.dataset.i);
      else if (b.dataset.rest === 'skip') { hideRest(); Sound.go(); }
      else if (b.dataset.rest) restCd.add(+b.dataset.rest);
      else if (b.id === 'sum-save') close(true);
      else if (b.id === 'sum-discard') { if (confirm('Descartar este treino? Ele não será contado na semana.')) close(false); }
    });
    root.addEventListener('change', e => {
      if (e.target.id === 'ses-w' && S) { const v = parseFloat(e.target.value); if (!isNaN(v)) { DB.weights[S.steps[S.i].id] = v; save(); } }
    });
    $('#rest-ring').innerHTML = ringSVG(60, 9) + '<b class="tnum" id="rest-time">0:00</b>';

    return { open, minimize, isOpen: () => root.classList.contains('on') };
  })();

  /* =================================================================
     AÇÕES GLOBAIS (delegação)
     ================================================================= */
  APP.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-back]')) { Nav.pop(); return; }
    if (t.closest('[data-timer]')) { Dock.toggle(); return; }
    const rs = t.closest('[data-rest-start]');
    if (rs) { Dock.start(+rs.dataset.restStart, rs.dataset.name); return; }
    const st = t.closest('[data-start]');
    if (st) { Session.open(+st.dataset.start); return; }
    const dOpen = t.closest('[data-day-open]');
    if (dOpen) { openDay(+dOpen.dataset.dayOpen, backTitle()); return; }
    const ex = t.closest('[data-ex]');
    if (ex) {
      const id = ex.dataset.ex;
      let ctx = null;
      if (ex.dataset.day != null) {
        const day = DAYS[+ex.dataset.day], k = ex.dataset.k;
        if (k === 'c') ctx = { cardio: day.cardio };
        else if (k === 'w') ctx = { cardio: { min: day.aquecimento.min, tipo: 'Aquecimento', desc: '3 min de bike leve + 2 min de mobilidade. Depois, 1–2 séries leves do primeiro exercício.' } };
        else ctx = { entry: day.ex[+k] };
      }
      openExercise(id, ctx, backTitle());
    }
  });
  function backTitle() {
    const top = Nav.top();
    const t = $('.nb-t', top.el).textContent;
    return t.length > 12 ? 'Voltar' : t;
  }

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (Session.isOpen()) Session.minimize(false);
    else if (Dock.isOn()) Dock.hide();
    else Nav.pop();
  });

  function refreshAll() {
    Today.render();
    Plan.render();
    Progress.render();
    Nav.all().forEach(s => { if (s.onShow) s.onShow(); });
    Mini.update();
  }

  /* ---------------- início ---------------- */
  Nav.setRoot('hoje', Today);
  Nav.setRoot('plano', Plan);
  Nav.setRoot('exercicios', Library);
  Nav.setRoot('progresso', Progress);
  Progress.onShow = () => Progress.render();
  Today.render(); Plan.render(); Library.render(); Progress.render();
  Mini.update();

  // dia virou enquanto o app estava aberto
  let lastDay = todayIdx();
  setInterval(() => { if (todayIdx() !== lastDay) { lastDay = todayIdx(); refreshAll(); } }, 60000);

  // tela de abertura
  setTimeout(() => $('#launch').classList.add('out'), REDUCED ? 50 : 650);

  // PWA: instalável + offline quando publicado (http/https)
  if (/^https?:$/.test(location.protocol)) {
    const l = document.createElement('link');
    l.rel = 'manifest'; l.href = 'manifest.webmanifest';
    document.head.appendChild(l);
    if ('serviceWorker' in navigator) window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }

  window.__app = { Nav, Session, Dock, DB, refreshAll };
})();
