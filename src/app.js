/* =====================================================================
   APP — interface, modo treino, cronômetro e timer de descanso
   ===================================================================== */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const PROG = window.PROGRAM;
  const DAYS = PROG.dias;
  const MN = window.MUSCLES;
  const REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- ícones ---------------- */
  const I = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.6v12.8c0 .8.9 1.3 1.6.9l10.2-6.4c.6-.4.6-1.4 0-1.8L9.6 4.7C8.9 4.3 8 4.8 8 5.6z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.2" height="14" rx="1.4"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.4"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    timer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.5M9.5 2.8h5"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.6 2.4c.3 2.7-1 4.4-2.4 6C8.6 10.2 7 12 7 14.8 7 18.2 9.3 21 12.3 21c3.2 0 5.7-2.6 5.7-6.1 0-2.2-.9-3.8-2-5.2-.2 1.3-.8 2.3-1.8 2.8.4-3.6-.7-7.1-1.6-9.1z"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.3 2.5L5 13.4h5.6l-1.1 8.1 8.5-11.2h-5.7l1-7.8z"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17l6-6 4 4 6-7"/><path d="M15 8h5v5"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.2 14.6A8.5 8.5 0 0 1 9.4 3.8a8.5 8.5 0 1 0 10.8 10.8z"/></svg>',
    pos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="4.5" r="2"/><path d="M12 7.5v7M8 22l4-7.5 4 7.5M6 10.5h12"/></svg>',
    move: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M12 3l-4 4M12 3l4 4M12 21l-4-4M12 21l4-4"/></svg>',
    wind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h7"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 3.5L2.8 19.5h18.4L12 3.5z" stroke-linejoin="round"/><path d="M12 10v4.2M12 17.2v.1"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>'
  };

  /* ---------------- armazenamento ---------------- */
  const KEY = 'treino6x:v1';
  let DB;
  try { DB = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { DB = {}; }
  DB = Object.assign({ weights: {}, history: [], session: null }, DB);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { /* modo privado */ } };

  /* ---------------- utilidades ---------------- */
  const todayIdx = () => (new Date().getDay() + 6) % 7; // 0 = segunda
  function weekStart() { const x = new Date(); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x.getTime(); }
  function doneThisWeek() { const ws = weekStart(); const s = new Set(); DB.history.forEach(h => { if (h.t >= ws) s.add(h.day); }); return s; }
  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = (n, d = 1) => n.toLocaleString('pt-BR', { maximumFractionDigits: d });
  const workSec = e => e.tempo || (/cada/.test(e.nota || '') ? 75 : 40);
  function dayMinutes(day) {
    let s = 0;
    if (day.aquecimento) s += day.aquecimento.min * 60;
    day.ex.forEach(e => { s += e.s * (workSec(e) + e.d); });
    if (day.cardio) s += day.cardio.min * 60;
    return Math.round(s / 60);
  }
  const totalSets = day => day.ex.reduce((a, e) => a + e.s, 0);
  const repsLabel = e => (e.tempo ? e.tempo + 's' : e.r + ' reps');
  function musLine(ex, max = 4) {
    const p = (ex.pri || []).map(m => `<span class="p">${MN[m]}</span>`);
    const s = (ex.sec || []).map(m => `<span class="s">${MN[m]}</span>`);
    return p.concat(s).slice(0, max).join('');
  }

  /* ---------------- som + vibração ---------------- */
  const Sound = {
    ctx: null,
    unlock() {
      if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* sem áudio */ } }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    beep(f = 880, d = 0.12, v = 0.18, when = 0) {
      if (!this.ctx) return;
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
  const buzz = p => { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* ignore */ } };

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
    const fg = el.querySelector('.fg');
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

  /* ---------------- players da lista ---------------- */
  let listPlayers = [];
  function mountPlayer(canvas, id, opt = {}) {
    const p = new Rig.Player(canvas, id, Object.assign({ autoplay: !REDUCED, t: REDUCED ? 0.45 : Math.random() * 0.3 }, opt));
    return p;
  }

  /* =================================================================
     HERO + SEMANA
     ================================================================= */
  function renderHero() {
    const pf = PROG.perfil;
    const imc = pf.peso / Math.pow(pf.altura / 100, 2);
    $('#hero-chips').innerHTML = [
      `<b>${pf.idade}</b> anos`, `<b>${pf.peso}</b> kg`, `<b>${num(pf.altura / 100, 2)}</b> m`, `IMC <b>${num(imc, 1)}</b>`,
      `<b>6</b> dias / semana`, `<b>~60</b> min / treino`
    ].map(c => `<span class="chip">${c}</span>`).join('');
    renderWeek();
  }

  function renderWeek() {
    const done = doneThisWeek();
    const n = DAYS.filter(d => !d.descanso && done.has(d.id)).length;
    const c = 2 * Math.PI * 32;
    $('#week-ring').innerHTML = `<svg class="ring" viewBox="0 0 76 76" style="transform:rotate(-90deg)"><circle class="bg" cx="38" cy="38" r="32"/><circle class="fg" cx="38" cy="38" r="32" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - n / 6)}"/></svg><div class="ring-num tnum"><div>${n}/6<small>treinos</small></div></div>`;
    const ti = todayIdx();
    $('#week-dots').innerHTML = DAYS.slice(0, 6).map((d, i) => `<i class="${done.has(d.id) ? 'on' : ''} ${i === ti ? 'today' : ''}" title="${d.nome}"></i>`).join('');
    const next = DAYS[ti];
    $('#week-txt').innerHTML = next.descanso ? 'Hoje é dia de <b>descanso</b>. Recupere bem.' : `Hoje: <b>${next.titulo}</b> · ~${dayMinutes(next)} min`;
  }

  /* =================================================================
     ABAS DOS DIAS
     ================================================================= */
  let curDay = todayIdx();
  function renderTabs() {
    const done = doneThisWeek(), ti = todayIdx();
    $('#days').innerHTML = DAYS.map((d, i) => `
      <button class="day-tab" role="tab" id="tab-${d.id}" aria-controls="day" aria-selected="${i === curDay}" data-i="${i}">
        ${done.has(d.id) ? `<span class="done" aria-label="concluído">${I.check}</span>` : ''}
        ${i === ti ? '<span class="today-dot" aria-label="hoje"></span>' : ''}
        <span class="d">${d.curto}</span><span class="t">${d.descanso ? 'Descanso' : d.titulo.split(/[ ,&]/)[0]}</span>
      </button>`).join('');
  }
  $('#days').addEventListener('click', e => {
    const b = e.target.closest('.day-tab');
    if (!b) return;
    const i = +b.dataset.i;
    if (i === curDay) return;
    curDay = i;
    $$('.day-tab').forEach(t => t.setAttribute('aria-selected', String(+t.dataset.i === i)));
    renderDay();
    const top = $('#day').getBoundingClientRect().top + window.scrollY - 140;
    if (window.scrollY > top) window.scrollTo({ top, behavior: REDUCED ? 'auto' : 'smooth' });
  });
  $('#days').addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = (curDay + (e.key === 'ArrowRight' ? 1 : 6)) % 7;
    $(`.day-tab[data-i="${n}"]`).click();
    $(`.day-tab[data-i="${n}"]`).focus();
  });

  /* =================================================================
     DIA
     ================================================================= */
  function renderDay() {
    listPlayers.forEach(p => p.destroy());
    listPlayers = [];
    const day = DAYS[curDay], ti = todayIdx();
    const el = $('#day');
    el.setAttribute('aria-labelledby', 'tab-' + day.id);
    el.classList.remove('day'); void el.offsetWidth; el.classList.add('day');

    if (day.descanso) {
      el.innerHTML = `
        <div class="rest-day">
          <div class="eyebrow">${day.nome}${curDay === ti ? ' · hoje' : ''}</div>
          <h2>Descanso & recuperação</h2>
          <p style="margin:0;color:var(--gray-2)">${day.sub}.</p>
          <ul>
            <li><b>Caminhada leve</b> de 30–40 min ao ar livre (opcional).</li>
            <li><b>Alongamento / mobilidade</b> de 10–15 min: quadril, posterior de coxa, peito e ombros.</li>
            <li>Durma <b>7–9 horas</b> e mantenha a alimentação e a hidratação em dia.</li>
            <li>Revise as cargas da semana e planeje a progressão da próxima.</li>
          </ul>
        </div>`;
      return;
    }

    const session = DB.session && DB.session.day === day.id;
    const nEx = day.ex.length;
    el.innerHTML = `
      <section class="day-hero">
        <div class="dh-info">
          <div class="dh-eyebrow">${curDay === ti ? '<span class="now">Hoje</span>' : ''}${day.nome} · ${day.tag}</div>
          <h2>${day.titulo}</h2>
          <p class="sub">${day.sub}</p>
          <div class="tags">${day.foco.map(f => `<span class="tag">${f}</span>`).join('')}<span class="tag">${day.cardio.tipo === 'HIIT' ? 'HIIT' : 'Cardio leve'}</span></div>
          <div class="metrics">
            <div class="metric"><b class="tnum">${nEx}</b><span>exercícios</span></div>
            <div class="metric"><b class="tnum">${totalSets(day)}</b><span>séries</span></div>
            <div class="metric"><b class="tnum">~${dayMinutes(day)}</b><span>minutos</span></div>
          </div>
          <button class="start-btn" id="start">${I.play}<span>${session ? 'Voltar ao treino' : 'Iniciar treino'}</span></button>
        </div>
        <div class="dh-stage stage"><canvas aria-hidden="true"></canvas><span class="cap">${Rig.get(day.ex[0].id).name}</span></div>
      </section>

      <div class="sec-h"><h3>Aquecimento</h3><span>${day.aquecimento.min} min</span></div>
      <button class="mini-card" data-open="aquecimento">
        <div class="stage"><canvas aria-hidden="true"></canvas></div>
        <div class="ex-body">
          <h4>Bike leve + mobilidade</h4>
          <p>3 min pedalando leve + 2 min de mobilidade de ombros e quadril. Depois faça 1–2 séries leves do primeiro exercício.</p>
          <div class="ex-foot"><span class="note">Prepara articulações e coração</span><span>Ver ${I.chevR}</span></div>
        </div>
      </button>

      <div class="sec-h"><h3>Musculação</h3><span>${nEx} exercícios · ${totalSets(day)} séries</span></div>
      <div class="ex-list">
        ${day.ex.map((e, i) => {
          const ex = Rig.get(e.id);
          return `
          <button class="ex" data-open="${e.id}" data-i="${i}">
            <div class="stage"><canvas aria-hidden="true"></canvas><span class="num">${String(i + 1).padStart(2, '0')}</span></div>
            <div class="ex-body">
              <h4>${ex.name}</h4>
              <div class="presc"><span>${e.s} séries</span><span>${repsLabel(e)}</span><span class="rest">${e.d}s descanso</span></div>
              <div class="mus">${musLine(ex)}</div>
              <div class="ex-foot"><span class="note">${e.nota ? esc(e.nota) : ''}</span><span>Como fazer ${I.chevR}</span></div>
            </div>
          </button>`;
        }).join('')}
      </div>

      <div class="sec-h"><h3>Cardio</h3><span>${day.cardio.tipo} · ${day.cardio.min} min</span></div>
      <button class="mini-card" data-open="${day.cardio.id}" data-cardio="1">
        <div class="stage"><canvas aria-hidden="true"></canvas></div>
        <div class="ex-body">
          <h4>${day.cardio.titulo} · ${day.cardio.min} min</h4>
          <p>${day.cardio.desc}</p>
          ${cardioBars(day.cardio)}
          <div class="ex-foot"><span class="note">Sempre depois da musculação</span><span>Ver ${I.chevR}</span></div>
        </div>
      </button>`;

    const stages = $$('canvas', el);
    listPlayers.push(mountPlayer(stages[0], day.ex[0].id));
    listPlayers.push(mountPlayer(stages[1], 'aquecimento'));
    day.ex.forEach((e, i) => listPlayers.push(mountPlayer(stages[2 + i], e.id)));
    listPlayers.push(mountPlayer(stages[stages.length - 1], day.cardio.id, { speed: day.cardio.tipo === 'HIIT' ? 1.4 : 1 }));
    $('#start').addEventListener('click', () => Session.open(day));
  }

  function cardioBars(c) {
    const total = c.segs.reduce((a, s) => a + s.s, 0);
    if (c.segs.length < 2) return `<div class="segs"><i style="--w:1"></i></div><div class="segs-legend"><span>0</span><span>${c.min} min</span></div>`;
    return `<div class="segs">${c.segs.map(s => `<i class="${s.hi ? 'hi' : ''}" style="--w:${s.s / total}"></i>`).join('')}</div><div class="segs-legend"><span>Leve</span><span>8 tiros de 20s</span><span>${c.min} min</span></div>`;
  }

  $('#day').addEventListener('click', e => {
    const b = e.target.closest('[data-open]');
    if (!b) return;
    const id = b.dataset.open;
    const day = DAYS[curDay];
    const entry = day.ex.find(x => x.id === id) || null;
    Sheet.open(id, entry, b.dataset.cardio ? day.cardio : null);
  });

  /* =================================================================
     GUIA
     ================================================================= */
  function renderGuide() {
    const pf = PROG.perfil;
    const tmb = 10 * pf.peso + 6.25 * pf.altura - 5 * pf.idade + 5;
    const gasto = Math.round(tmb * 1.6 / 50) * 50;
    const kcal = Math.round((gasto - 500) / 50) * 50;
    const prot = [Math.round(pf.peso * 1.8 / 5) * 5, Math.round(pf.peso * 2.0 / 5) * 5];
    $('#guide').innerHTML = `
      <div class="g-card"><div class="ic">${I.flame}</div><h4>Calorias</h4><div class="big tnum">~${num(kcal - 100, 0)}–${num(kcal + 100, 0)}</div><p>kcal/dia. Gasto estimado ~${num(gasto, 0)} kcal; um déficit de ~500 kcal leva a ~0,5 kg/semana de perda.</p></div>
      <div class="g-card"><div class="ic">${I.bolt}</div><h4>Proteína</h4><div class="big tnum">${prot[0]}–${prot[1]} g</div><p>por dia (1,8–2 g/kg), divididos em 4–5 refeições. Segura a massa muscular durante o déficit.</p></div>
      <div class="g-card"><div class="ic">${I.up}</div><h4>Progressão</h4><div class="big">+2–5%</div><p>de carga quando fizer o topo da faixa de repetições em todas as séries. Termine cada série com 1–2 reps "sobrando".</p></div>
      <div class="g-card"><div class="ic">${I.moon}</div><h4>Recuperação</h4><div class="big">7–9 h</div><p>de sono, ~3 L de água e 8–10 mil passos por dia. A cada 6–8 semanas, faça uma semana mais leve.</p></div>`;
  }

  /* =================================================================
     SHEET DE DETALHES
     ================================================================= */
  const Sheet = (() => {
    const sheet = $('#sheet'), scrim = $('#scrim'), body = $('#sheet-body');
    let player = null, lastFocus = null, current = null;

    function open(id, entry, cardio) {
      const ex = Rig.get(id);
      current = { id, entry, cardio };
      lastFocus = document.activeElement;
      $('#sheet-title').textContent = ex.name;
      const info = ex.info;
      const pri = ex.pri || [], sec = ex.sec || [];
      let presc = '';
      if (entry) {
        presc = `<div class="box"><b class="tnum">${entry.s}</b><span>séries</span></div><div class="box"><b class="tnum">${esc(entry.tempo ? entry.tempo + 's' : entry.r)}</b><span>${entry.tempo ? 'por série' : 'repetições'}</span></div><div class="box"><b class="tnum">${entry.d}s</b><span>descanso</span></div>
          <span class="sp"></span><button class="pill-btn" id="sheet-rest">${I.timer}Timer de descanso · ${entry.d}s</button>`;
      } else if (cardio) {
        presc = `<div class="box"><b class="tnum">${cardio.min} min</b><span>${cardio.tipo}</span></div><div class="box" style="flex:1;min-width:220px"><b style="font-size:.95rem">${esc(cardio.desc)}</b><span>protocolo</span></div>`;
      }
      body.innerHTML = `
        <div class="stage big-stage">
          <canvas aria-label="Animação: ${esc(ex.name)}" role="img"></canvas>
          <div class="stage-ui">
            <div class="phase" aria-live="polite"><span id="sheet-phase">…</span></div>
            <button class="ctl" id="sp-slow" aria-pressed="false" title="Câmera lenta">0,5×</button>
            <button class="ctl" id="sp-play" aria-label="Pausar animação">${I.pause}</button>
          </div>
        </div>
        <div class="legend-row"><span><i class="lp"></i>Músculo principal</span><span><i class="ls"></i>Músculo auxiliar</span><span><i class="lt"></i>Trajetória do movimento</span></div>
        <div class="d-presc">${presc}</div>
        <div class="d-grid">
          <div class="mus-panel">
            <div>
              <h4>Músculos trabalhados</h4>
              ${window.bodyMap(pri, sec)}
            </div>
            <div class="m-list">
              ${pri.length ? `<div><b>Principais</b><span>${pri.map(m => MN[m]).join(', ')}</span></div>` : ''}
              ${sec.length ? `<div><b>Auxiliares</b><span>${sec.map(m => MN[m]).join(', ')}</span></div>` : ''}
            </div>
          </div>
          <div class="cues">
            <div class="cue"><h5>${I.pos}Posição</h5><ul>${info.setup.map(x => `<li>${x}</li>`).join('')}</ul></div>
            <div class="cue"><h5>${I.move}Execução</h5><ul>${info.exec.map(x => `<li>${x}</li>`).join('')}</ul></div>
            <div class="cue"><h5>${I.wind}Respiração</h5><p>${info.breath}</p></div>
            <div class="cue warn"><h5>${I.alert}Evite</h5><ul>${info.avoid.map(x => `<li>${x}</li>`).join('')}</ul></div>
          </div>
        </div>`;
      body.scrollTop = 0;
      const cv = $('canvas', body);
      const phaseEl = $('#sheet-phase');
      player = new Rig.Player(cv, id, {
        autoplay: true, speed: cardio && cardio.tipo === 'HIIT' ? 1.4 : 1,
        onPhase: t => { phaseEl.textContent = t || ex.name; }
      });
      $('#sp-play').addEventListener('click', () => {
        const on = player.toggle();
        $('#sp-play').innerHTML = on ? I.pause : I.play;
        $('#sp-play').setAttribute('aria-label', on ? 'Pausar animação' : 'Reproduzir animação');
      });
      $('#sp-slow').addEventListener('click', e => {
        const b = e.currentTarget, slow = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', String(slow)); b.classList.toggle('on', slow);
        player.speed = (slow ? 0.5 : 1) * (cardio && cardio.tipo === 'HIIT' ? 1.4 : 1);
      });
      const rb = $('#sheet-rest');
      if (rb) rb.addEventListener('click', () => { Dock.start(entry.d, ex.name); });
      sheet.style.transform = '';
      scrim.classList.add('on');
      sheet.classList.add('on');
      sheet.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lock');
      listPlayers.forEach(p => p.pause());
      setTimeout(() => $('#sheet-close').focus({ preventScroll: true }), 60);
    }

    function close() {
      if (!sheet.classList.contains('on')) return;
      sheet.classList.remove('on');
      sheet.style.transform = '';
      scrim.classList.remove('on');
      sheet.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lock');
      if (!REDUCED) listPlayers.forEach(p => p.play());
      const p = player; player = null;
      setTimeout(() => { if (p) p.destroy(); if (!sheet.classList.contains('on')) body.innerHTML = ''; }, 520);
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }

    // arrastar para fechar (acompanha o dedo 1:1, decide pela velocidade)
    const top = $('#sheet-top');
    let drag = null;
    top.addEventListener('pointerdown', e => {
      if (e.target.closest('button')) return;
      drag = { y0: e.clientY, y: e.clientY, t: performance.now(), v: 0, id: e.pointerId };
      top.setPointerCapture(e.pointerId);
      sheet.classList.add('drag');
    });
    top.addEventListener('pointermove', e => {
      if (!drag) return;
      const now = performance.now();
      drag.v = (e.clientY - drag.y) / Math.max(1, now - drag.t);
      drag.y = e.clientY; drag.t = now;
      let dy = e.clientY - drag.y0;
      if (dy < 0) dy = -Math.pow(-dy, 0.7); // resistência elástica para cima
      sheet.style.transform = `translate(-50%, ${dy}px)`;
    });
    const end = () => {
      if (!drag) return;
      const dy = drag.y - drag.y0, v = drag.v;
      sheet.classList.remove('drag');
      const projected = dy + v * 0.998 / (1 - 0.998); // projeção de momento (v em px/ms)
      if (projected > 160 || v > 0.7) close();
      else sheet.style.transform = '';
      drag = null;
    };
    top.addEventListener('pointerup', end);
    top.addEventListener('pointercancel', end);
    scrim.addEventListener('click', close);
    $('#sheet-close').addEventListener('click', close);
    return { open, close, isOpen: () => sheet.classList.contains('on') };
  })();

  /* =================================================================
     TIMER DE DESCANSO FLUTUANTE
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
    function show() { el.classList.add('on'); el.setAttribute('aria-hidden', 'false'); }
    function hide() { el.classList.remove('on', 'done'); el.setAttribute('aria-hidden', 'true'); cd.stop(); }
    function start(sec, name) {
      Sound.unlock();
      label = name || '';
      el.classList.remove('done');
      lab.textContent = 'Descanso' + (label ? ' · ' + label : '');
      $$('.presets button', el).forEach(b => b.classList.toggle('on', +b.dataset.s === sec));
      cd.start(sec);
      show();
    }
    el.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.s) start(+b.dataset.s, label);
      else if (b.dataset.add) { cd.add(+b.dataset.add); }
      else if (b.dataset.act === 'close') hide();
    });
    return { start, hide, open() { if (!el.classList.contains('on')) start(60, ''); else hide(); } };
  })();

  /* =================================================================
     MODO TREINO
     ================================================================= */
  const Session = (() => {
    const root = $('#session');
    let S = null; // estado da sessão
    let player = null, clockIv = 0, wake = null;

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
      toastIn('Descanso concluído — próxima série!');
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

    function toastIn(msg) { toast(msg); }

    /* ---------- abrir / fechar ---------- */
    function open(day) {
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
      $('#ses-clockwrap').classList.remove('paused');
      $('#ses-pause').innerHTML = I.pause;
      $('#ses-pause').setAttribute('aria-label', 'Pausar treino');
      $('#ses-clocklabel').textContent = 'Tempo de treino';
      persist();
      $('#ses-day').textContent = day.titulo;
      buildProgress();
      root.classList.add('on');
      root.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lock');
      listPlayers.forEach(p => p.pause());
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
    }

    function minimize() {
      root.classList.remove('on');
      root.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lock');
      if (player) player.pause();
      if (!REDUCED) listPlayers.forEach(p => p.play());
      clearInterval(clockIv);
      releaseWake();
      renderDay();
      if (S && !S.finished) toast('Treino salvo — toque em "Voltar ao treino" para continuar');
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
    function tickClock() {
      $('#ses-clock').textContent = fmt(elapsed());
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
      persist();
      const p = !!S.pausedAt;
      $('#ses-clockwrap').classList.toggle('paused', p);
      $('#ses-pause').innerHTML = p ? I.play : I.pause;
      $('#ses-pause').setAttribute('aria-label', p ? 'Retomar treino' : 'Pausar treino');
      $('#ses-clocklabel').textContent = p ? 'Pausado' : 'Tempo de treino';
      tickClock();
    }

    /* ---------- wake lock ---------- */
    async function requestWake() {
      try { if ('wakeLock' in navigator) { wake = await navigator.wakeLock.request('screen'); } } catch (e) { wake = null; }
    }
    function releaseWake() { try { if (wake) wake.release(); } catch (e) { /* ignore */ } wake = null; }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && root.classList.contains('on')) requestWake();
    });

    /* ---------- progresso ---------- */
    function stepDone(i) {
      const st = S.steps[i];
      const d = S.done[i] || 0;
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
      const info = $('#ses-info');
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
          html += `<div class="timed"><div class="big-ring" id="timed-ring">${ringSVG(54, 8)}<b class="tnum">${fmt(e.tempo)}</b></div><div class="timed-t"><small>Série por tempo</small><b>${S.timedOn ? 'Segure firme!' : 'Pronto?'}</b><span>${S.timedOn ? 'Mantenha a respiração contínua' : 'O timer começa ao tocar em Iniciar'}</span></div></div>`;
        }
        html += `<div class="s-actions">`;
        if (allDone) html += `<button class="main-btn" id="ses-main">Próximo exercício ${I.chevR}</button>`;
        else if (e.tempo) html += `<button class="main-btn ${S.timedOn ? 'alt' : ''}" id="ses-main">${S.timedOn ? I.check + 'Concluir série agora' : I.play + `Iniciar série ${cur} · ${e.tempo}s`}</button>`;
        else html += `<button class="main-btn" id="ses-main">${I.check}Concluir série ${cur}</button>`;
      } else {
        const seg = st.segs[S.seg] || st.segs[0];
        const done = stepDone(S.i);
        const total = st.segs.reduce((a, s) => a + s.s, 0);
        const nextSeg = st.segs[S.seg + 1];
        html += `<div class="s-eyebrow">${st.cardio ? 'Cardio · ' + (st.hiit ? 'HIIT' : 'LISS') : 'Etapa 1 · Preparação'}</div>
          <h2>${st.title}</h2>
          <div class="s-target">${st.cardio ? esc(S.dayObj.cardio.desc) : 'Prepare o corpo antes da carga.'}</div>
          <div class="timed ${S.timedOn && seg.hi ? 'hi' : ''}"><div class="big-ring" id="timed-ring">${ringSVG(54, 8)}<b class="tnum">${fmt(S.timedOn ? timedCd.remaining() : seg.s)}</b></div>
            <div class="timed-t"><small>${done ? 'Concluído' : (S.timedOn ? 'Agora' : 'Primeira etapa')}</small><b>${esc(seg.n)}</b>
            <span>${nextSeg ? 'Depois: ' + esc(nextSeg.n) : 'Última etapa'}</span><span id="timed-total">${S.timedOn ? '' : 'Duração total ' + fmt(total)}</span></div></div>
          <div class="s-actions">`;
        if (done) html += `<button class="main-btn" id="ses-main">${S.i === S.steps.length - 1 ? I.flag + 'Finalizar treino' : 'Próximo ' + I.chevR}</button>`;
        else if (S.timedOn) html += `<button class="main-btn alt" id="ses-main">Pular etapa ${I.chevR}</button>`;
        else html += `<button class="main-btn" id="ses-main">${I.play}Iniciar · ${fmt(total)}</button>`;
        if (st.hiit && S.timedOn) player.speed = seg.hi ? 1.9 : 0.9;
      }
      html += `<div class="s-nav">
          <button id="ses-prev" ${S.i === 0 ? 'disabled' : ''}>${I.chevL}Anterior</button>
          <button id="ses-end">${I.flag}Encerrar</button>
          <button id="ses-next" ${S.i === S.steps.length - 1 ? 'disabled' : ''}>Próximo${I.chevR}</button>
        </div></div>`;
      info.innerHTML = html;
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
      const d = S.done[S.i];
      const e = st.e;
      if (d >= e.s) {
        const nextI = S.i + 1;
        S.i = nextI;
        persist();
        render();
        const nst = S.steps[nextI];
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
        if (S.i === S.steps.length - 1) { render(); finish(); }
        else { toast('Etapa concluída!'); go(S.i + 1); }
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
        if (S.timedOn) { timedCd.stop(); S.timedOn = false; S.done[S.i] = 1; persist(); if (S.i === S.steps.length - 1) { render(); finish(); } else go(S.i + 1); }
        else startTimed();
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
      if (!S.pausedAt) S.pausedAt = Date.now();
      $('#summary').classList.add('on');
      Sound.done();
    }

    function saveAndClose() {
      DB.history.push({ t: Date.now(), day: S.day, dur: S.final.dur, sets: S.final.sets });
      DB.history = DB.history.slice(-200);
      DB.session = null;
      save();
      S.finished = true;
      $('#summary').classList.remove('on');
      minimize();
      S = null;
      renderTabs(); renderWeek(); renderDay();
      toast('Treino salvo na sua semana ✓');
    }
    function discard() {
      if (!confirm('Descartar este treino? Ele não será contado na semana.')) return;
      DB.session = null; save();
      S.finished = true;
      $('#summary').classList.remove('on');
      timedCd.stop(); hideRest();
      minimize();
      S = null;
      renderDay();
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
      else if (b.id === 'ses-close') minimize();
      else if (b.dataset.w) {
        const inp = $('#ses-w');
        const v = Math.max(0, (parseFloat(inp.value) || 0) + parseFloat(b.dataset.w));
        inp.value = v; DB.weights[S.steps[S.i].id] = v; save();
      } else if (b.parentElement && b.parentElement.id === 'ses-prog') go(+b.dataset.i);
      else if (b.dataset.rest === 'skip') { hideRest(); Sound.go(); }
      else if (b.dataset.rest) restCd.add(+b.dataset.rest);
      else if (b.id === 'sum-save') saveAndClose();
      else if (b.id === 'sum-discard') discard();
    });
    root.addEventListener('change', e => {
      if (e.target.id === 'ses-w' && S) { const v = parseFloat(e.target.value); if (!isNaN(v)) { DB.weights[S.steps[S.i].id] = v; save(); } }
    });
    $('#rest-ring').innerHTML = ringSVG(68, 9) + '<b class="tnum" id="rest-time">0:00</b>';

    return { open, minimize, isOpen: () => root.classList.contains('on') };
  })();

  /* ---------------- teclado ---------------- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (Sheet.isOpen()) Sheet.close();
      else if (Session.isOpen()) Session.minimize();
      else Dock.hide();
    }
  });
  $('#nav-timer').addEventListener('click', () => Dock.open());

  /* ---------------- início ---------------- */
  renderHero();
  renderTabs();
  renderDay();
  renderGuide();
  window.__app = { Session, Sheet, Dock, DB };
})();
