/* =====================================================================
   RIG — motor 2D de animação dos bonequinhos (Canvas)
   - Esqueleto paramétrico (vista lateral, frontal e de costas)
   - Cinemática inversa (IK) de 2 ossos + cinemática direta (FK)
   - Tronco com curvatura (flexão da coluna)
   - Músculos destacados com brilho proporcional ao esforço
   - Trajetória do movimento, sombra, chão e equipamentos
   ===================================================================== */
(function (root) {
  'use strict';

  const D = Math.PI / 180;
  const GROUND = 212;
  const L = { torso: 50, neck: 5, head: 10.5, ua: 29, fa: 27, th: 42, sh: 41, foot: 13, heel: 4 };
  const RAD = { ua: [5.5, 4.4], fa: [4.4, 3.5], th: [7.8, 5.4], sh: [5.4, 3.8], foot: [3.2, 2.4], neck: 4, hand: 4.3 };
  const DEPTH = [-3.4, -2.4];
  const COL = {
    line: '#050912',
    lit: '#FFFFFF', mid: '#E6EBF2', shade: '#B9C3D2',
    farLit: '#8F9BB2', farShade: '#5D6880',
    acc: '#5AC8FA',
    metal: '#5A6780', metalHi: '#B4C0D2', metalDk: '#262F42',
    pad: '#15223F', padHi: '#3D5488',
    plate: 'rgba(150,172,204,0.16)', plateEdge: 'rgba(200,214,232,0.92)',
    cable: 'rgba(220,230,242,0.85)'
  };
  const LIGHT = [-0.42, -0.91];

  /* ---------------- matemática ---------------- */
  const add = (p, v, s = 1) => [p[0] + v[0] * s, p[1] + v[1] * s];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const len = v => Math.hypot(v[0], v[1]);
  const norm = v => { const l = len(v) || 1; return [v[0] / l, v[1] / l]; };
  const lerp = (a, b, t) => a + (b - a) * t;
  const dirT = a => [Math.sin(a * D), -Math.cos(a * D)];          // direção do tronco (quadril → ombro)
  const nrmT = a => [Math.cos(a * D), Math.sin(a * D)];           // normal anterior do tronco
  const dirK = (a, side = 1) => [side * Math.sin(a * D), Math.cos(a * D)]; // FK: 0 = para baixo, 90 = para frente
  const antL = u => [u[1], -u[0]];                                // anterior de um membro
  const ang = v => Math.atan2(v[1], v[0]);

  const EASE = {
    io: t => 0.5 - 0.5 * Math.cos(Math.PI * t),
    lin: t => t,
    out: t => 1 - (1 - t) * (1 - t),
    in: t => t * t,
    io3: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
  };

  function lerpV(a, b, t) {
    if (typeof a === 'number') return typeof b === 'number' ? a + (b - a) * t : a;
    if (Array.isArray(a)) return Array.isArray(b) ? a.map((v, i) => lerpV(v, b[i], t)) : a;
    if (a && typeof a === 'object') {
      if (!b || typeof b !== 'object' || Array.isArray(b)) return a;
      const o = {};
      for (const k in a) o[k] = (k in b) ? lerpV(a[k], b[k], t) : a[k];
      for (const k in b) if (!(k in a)) o[k] = b[k];
      return o;
    }
    return a;
  }

  /* ---------------- IK de dois ossos ---------------- */
  function ik(r, tgt, a, b, sign) {
    const v = sub(tgt, r);
    let d = len(v);
    const base = ang(v);
    const maxD = a + b - 0.02, minD = Math.abs(a - b) + 0.02;
    d = Math.min(Math.max(d, minD), maxD);
    const c = (a * a + d * d - b * b) / (2 * a * d);
    const off = Math.acos(Math.max(-1, Math.min(1, c)));
    const an = base + sign * off;
    return [[r[0] + a * Math.cos(an), r[1] + a * Math.sin(an)], [r[0] + d * Math.cos(base), r[1] + d * Math.sin(base)]];
  }

  /* ---------------- eixo do tronco (com curvatura) ---------------- */
  function buildAxis(P) {
    const th = P.th || 0, cu = P.cu || 0, n = 8, st = L.torso / n;
    const pts = [{ p: [0, 0], a: th }];
    let p = [0, 0];
    for (let i = 0; i < n; i++) {
      p = add(p, dirT(th + cu * (i + 0.5) / n), st);
      pts.push({ p, a: th + cu * (i + 1) / n });
    }
    const o = P.sh ? sub(P.sh, pts[n].p) : (P.hip || [160, 127]);
    for (const q of pts) q.p = add(q.p, o);
    return pts;
  }
  function axAt(pts, s) {
    const f = s * (pts.length - 1);
    const i = Math.min(pts.length - 2, Math.max(0, Math.floor(f)));
    const t = f - i, A = pts[i], B = pts[i + 1];
    return { p: [lerp(A.p[0], B.p[0], t), lerp(A.p[1], B.p[1], t)], a: lerp(A.a, B.a, t) };
  }

  // perfil do tronco: [s, frente, costas]
  const PROF_SIDE = [[-0.1, 5.8, 8.6], [0.06, 7.4, 9.6], [0.3, 7.2, 7.0], [0.52, 8.2, 7.2], [0.74, 10.4, 8.4], [0.92, 9.4, 8.2], [1.04, 6.2, 6.6]];
  const PROF_FRONT = [[-0.13, 12.8, 12.8], [0.04, 13.6, 13.6], [0.3, 11.8, 11.8], [0.54, 13.2, 13.2], [0.78, 16.6, 16.6], [0.95, 17.6, 17.6], [1.05, 11.5, 11.5]];
  function profAt(prof, s, side) {
    const k = side > 0 ? 1 : 2;
    if (s <= prof[0][0]) return prof[0][k];
    for (let i = 0; i < prof.length - 1; i++) {
      const A = prof[i], B = prof[i + 1];
      if (s <= B[0]) return lerp(A[k], B[k], (s - A[0]) / (B[0] - A[0]));
    }
    return prof[prof.length - 1][k];
  }

  /* ---------------- solução do esqueleto ---------------- */
  function pickB(B, k1, k2, def) { return B[k1] != null ? B[k1] : (B[k2] != null ? B[k2] : def); }

  function solveLimb(S, r, spec, l1, l2, sign, side, kind) {
    if (spec == null) spec = { k: [0, 0] };
    let s1 = 1, s2 = 1;
    if (!Array.isArray(spec) && spec.s) { s1 = spec.s[0]; s2 = spec.s[1]; }
    const a = l1 * s1, b = l2 * s2;
    const cx = S.cx;
    const mirror = p => (side < 0 ? [2 * cx - p[0], p[1]] : p);
    let j, e;
    if (Array.isArray(spec) || spec.p) {
      const t = mirror(Array.isArray(spec) ? spec : spec.p);
      [j, e] = ik(r, t, Math.abs(a), Math.abs(b), sign * side);
    } else if (spec.t) {
      const nn = [S.n[0] * side, S.n[1] * side];
      const t = add(add(r, S.d, spec.t[0]), nn, spec.t[1]);
      [j, e] = ik(r, t, Math.abs(a), Math.abs(b), sign * side);
    } else {
      let [a1, a2] = spec.k || spec.kt;
      if (spec.kt) a1 += kind === 'arm' ? -S.endA : -S.baseA;
      j = add(r, dirK(a1, side), a);
      e = add(j, dirK(a1 + a2, side), b);
    }
    const o = { r, j, e, spec };
    if (kind === 'leg') {
      const u = norm(sub(e, j));
      let f = antL(u);
      if (side < 0) f = [-f[0], f[1]];
      if (!Array.isArray(spec)) {
        if (spec.fa != null) f = [Math.cos(spec.fa * D), Math.sin(spec.fa * D)];
        else if (spec.f) { const an = ang(f) + spec.f * D; f = [Math.cos(an), Math.sin(an)]; }
      }
      o.fd = f; o.toe = add(e, f, L.foot); o.heel = add(e, f, -L.heel);
    }
    return o;
  }

  function solve(ex, P) {
    const view = ex.view || 'side';
    const S = { view, P };
    const ax = buildAxis(P);
    S.ax = ax;
    const top = ax[ax.length - 1];
    S.hip = ax[0].p; S.end = top.p; S.endA = top.a; S.baseA = ax[0].a;
    S.d = dirT(top.a); S.n = nrmT(top.a);
    S.headA = top.a + (P.hd || 0);
    S.head = add(S.end, dirT(S.headA), L.neck + L.head);
    S.cx = P.cx != null ? P.cx : S.hip[0];
    const B = Object.assign({}, ex.bend || {}, P.b || {});
    S.sj = add(S.end, S.d, -3);
    if (view === 'side') {
      S.hj = add(S.hip, nrmT(S.baseA), 1.2);
      const aN = P.an || P.a, aF = P.af || P.a, lN = P.ln || P.l, lF = P.lf || P.l;
      S.arm = {
        n: solveLimb(S, S.sj, aN, L.ua, L.fa, pickB(B, 'an', 'a', 1), 1, 'arm'),
        f: solveLimb(S, S.sj, aF, L.ua, L.fa, pickB(B, 'af', 'a', 1), 1, 'arm')
      };
      S.leg = {
        n: solveLimb(S, S.hj, lN, L.th, L.sh, pickB(B, 'ln', 'l', -1), 1, 'leg'),
        f: solveLimb(S, S.hj, lF, L.th, L.sh, pickB(B, 'lf', 'l', -1), 1, 'leg')
      };
    } else {
      const base = add(S.end, S.d, -3);
      const hn = nrmT(S.baseA);
      S.sjR = add(base, S.n, 17); S.sjL = add(base, S.n, -17);
      S.hjR = add(S.hip, hn, 8.5); S.hjL = add(S.hip, hn, -8.5);
      const aR = P.aR || P.a, aL = P.aL || P.a, lR = P.lR || P.l, lL = P.lL || P.l;
      S.arm = {
        R: solveLimb(S, S.sjR, aR, L.ua, L.fa, pickB(B, 'aR', 'a', 1), 1, 'arm'),
        L: solveLimb(S, S.sjL, aL, L.ua, L.fa, pickB(B, 'aL', 'a', 1), -1, 'arm')
      };
      S.leg = {
        R: solveLimb(S, S.hjR, lR, L.th, L.sh, pickB(B, 'lR', 'l', -1), 1, 'leg'),
        L: solveLimb(S, S.hjL, lL, L.th, L.sh, pickB(B, 'lL', 'l', -1), -1, 'leg')
      };
    }
    return S;
  }

  /* ---------------- keyframes ---------------- */
  function prep(ex) {
    if (ex._ok) return ex;
    if (ex.keys) {
      let prev = {};
      ex._k = ex.keys.map(k => {
        const P = Object.assign({}, prev, k.P);
        prev = P;
        return { t: k.t, P, ph: k.ph, ease: k.ease };
      });
      if (ex._k[ex._k.length - 1].t < 1) ex._k.push({ t: 1, P: ex._k[0].P });
    }
    ex._lvl = {};
    (ex.sec || []).forEach(m => { ex._lvl[m] = 1; });
    (ex.pri || []).forEach(m => { ex._lvl[m] = 2; });
    if (ex.trace) {
      const pts = [];
      for (let i = 0; i <= 72; i++) {
        const S = solve(ex, getPose(ex, i / 72));
        const p = tracePoint(ex, S);
        if (p) pts.push(p);
      }
      ex._trace = pts;
    }
    ex._ok = true;
    return ex;
  }
  function tracePoint(ex, S) {
    const k = ex.trace;
    if (k === 'hn') return S.arm.n.e;
    if (k === 'hR') return S.arm.R.e;
    if (k === 'hip') return S.hip;
    if (k === 'an') return S.leg.n.e;
    if (k === 'aR') return S.leg.R.e;
    if (k === 'head') return S.head;
    if (typeof k === 'function') return k(S);
    return null;
  }
  function poseAt(ex, t) {
    if (ex.fn) {
      const P = ex.fn(((t % 1) + 1) % 1);
      if (P._ph == null) P._ph = ex.label || null;
      return P;
    }
    const K = ex._k;
    t = ((t % 1) + 1) % 1;
    let i = 0;
    while (i < K.length - 2 && t >= K[i + 1].t) i++;
    const A = K[i], B = K[i + 1];
    const u = Math.min(1, Math.max(0, (t - A.t) / ((B.t - A.t) || 1)));
    const e = (EASE[A.ease || ex.ease || 'io'] || EASE.io)(u);
    const P = lerpV(A.P, B.P, e);
    let ph = null;
    for (let j = i; j >= 0; j--) if (K[j].ph) { ph = K[j].ph; break; }
    P._ph = ph;
    return P;
  }
  function getPose(ex, t) {
    const P = poseAt(ex, t);
    if (ex.farPhase) {
      const Q = poseAt(ex, t + ex.farPhase);
      if (Q.an || Q.a) P.af = Q.an || Q.a;
      if (Q.ln || Q.l) P.lf = Q.ln || Q.l;
      P._ef = Q.e;
    }
    return P;
  }

  /* ---------------- desenho base ---------------- */
  let UNIT = 1; // pixels de dispositivo por unidade do mundo (para sombras)

  function capsulePath(g, p1, r1, p2, r2) {
    const dx = p2[0] - p1[0], dy = p2[1] - p1[1], d = Math.hypot(dx, dy);
    if (d <= Math.abs(r1 - r2) + 0.01) {
      const big = r1 > r2 ? p1 : p2;
      g.moveTo(big[0] + Math.max(r1, r2), big[1]);
      g.arc(big[0], big[1], Math.max(r1, r2), 0, Math.PI * 2);
      return;
    }
    const a = Math.atan2(dy, dx), off = Math.acos((r1 - r2) / d);
    g.arc(p1[0], p1[1], r1, a + off, a - off + Math.PI * 2, false);
    g.arc(p2[0], p2[1], r2, a - off, a + off, false);
    g.closePath();
  }

  function segFill(g, p1, p2, r, far) {
    const u = norm(sub(p2, p1));
    let pr = [-u[1], u[0]];
    if (pr[0] * LIGHT[0] + pr[1] * LIGHT[1] < 0) pr = [-pr[0], -pr[1]];
    const m = mid(p1, p2);
    const gr = g.createLinearGradient(m[0] + pr[0] * r, m[1] + pr[1] * r, m[0] - pr[0] * r, m[1] - pr[1] * r);
    if (far) { gr.addColorStop(0, COL.farLit); gr.addColorStop(1, COL.farShade); }
    else { gr.addColorStop(0, COL.lit); gr.addColorStop(0.45, COL.mid); gr.addColorStop(1, COL.shade); }
    return gr;
  }

  function chain(g, pts, radii, far) {
    g.fillStyle = COL.line;
    for (let i = 0; i < pts.length - 1; i++) {
      g.beginPath(); capsulePath(g, pts[i], radii[i] + 1.5, pts[i + 1], radii[i + 1] + 1.5); g.fill();
    }
    for (let i = 0; i < pts.length - 1; i++) {
      g.fillStyle = segFill(g, pts[i], pts[i + 1], Math.max(radii[i], radii[i + 1]), far);
      g.beginPath(); capsulePath(g, pts[i], radii[i], pts[i + 1], radii[i + 1]); g.fill();
    }
  }

  function smoothClosed(g, pts) {
    const n = pts.length;
    const s = mid(pts[n - 1], pts[0]);
    g.moveTo(s[0], s[1]);
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = mid(pts[i], pts[(i + 1) % n]);
      g.quadraticCurveTo(p[0], p[1], q[0], q[1]);
    }
    g.closePath();
  }

  /* ---------------- músculos ---------------- */
  // vista lateral: T=tronco [s, fração da largura (+frente/-costas), rx, ry]; S=ombro [desloc., raio]
  // membros: [seg, s, deslocamento anterior, rx (fração do comprimento), ry]
  const MUS_SIDE = {
    chest: [['T', 0.72, 0.48, 11, 5.2]],
    abs: [['T', 0.34, 0.5, 10.5, 3.5]],
    obliques: [['T', 0.37, 0.0, 9.5, 3.8]],
    lats: [['T', 0.6, -0.42, 11.5, 4.3]],
    midback: [['T', 0.8, -0.58, 7.5, 3.6]],
    traps: [['T', 0.99, -0.4, 6.5, 3.3]],
    lowerback: [['T', 0.22, -0.55, 8.5, 3.3]],
    delts_front: [['S', 2.4, 5.6]],
    delts_side: [['S', 0, 6]],
    delts_rear: [['S', -2.4, 5.6]],
    biceps: [['ua', 0.52, 2.2, 0.34, 3.6]],
    triceps: [['ua', 0.48, -2.2, 0.36, 3.6]],
    forearms: [['fa', 0.3, 0.9, 0.3, 3.1]],
    glutes: [['th', 0.05, -4.3, 0.2, 6.4]],
    quads: [['th', 0.52, 2.8, 0.38, 5]],
    hamstrings: [['th', 0.5, -2.8, 0.36, 4.6]],
    calves: [['sh', 0.3, -2.2, 0.27, 4.1]]
  };
  // vista frontal/costas: T2 = par simétrico no tronco [s, deslocamento lateral, rx, ry, rot]
  const MUS_FRONT = {
    chest: [['TP', [[0.93, 2.2], [0.955, 11.5], [0.89, 16.4], [0.75, 16.2], [0.64, 11], [0.61, 4], [0.69, 1.8]], true]],
    abs: [['TP', [[0.62, -5.6], [0.635, 0], [0.62, 5.6], [0.36, 6.3], [0.1, 5.2], [0.03, 0], [0.1, -5.2], [0.36, -6.3]], false, 'abs']],
    obliques: [['TP', [[0.55, 7.6], [0.6, 12.6], [0.36, 12.3], [0.12, 11.4], [0.1, 7.2], [0.32, 7.4]], true]],
    traps: [['TP', [[1.07, 4.2], [1.0, 13.5], [0.955, 11], [0.99, 5.4]], true]],
    delts_front: [['S2', 6.2]],
    delts_side: [['S2', 6.4]],
    biceps: [['ua', 0.5, 0, 0.34, 3.7]],
    forearms: [['fa', 0.32, 0, 0.3, 3.2]],
    quads: [['th', 0.5, 0, 0.38, 5.8]]
  };
  const MUS_BACK = {
    traps: [['TP', [[1.07, 0], [1.01, 6], [0.96, 14.5], [0.89, 9], [0.64, 2.2], [0.56, 0], [0.64, -2.2], [0.89, -9], [0.96, -14.5], [1.01, -6]], false]],
    midback: [['TP', [[0.86, 3.2], [0.86, 9.5], [0.71, 8.4], [0.63, 3.4]], true]],
    lats: [['TP', [[0.85, 12.8], [0.8, 16.8], [0.62, 15.2], [0.42, 12.8], [0.22, 7.2], [0.17, 3.2], [0.4, 4.2], [0.62, 8.8], [0.75, 11.2]], true]],
    lowerback: [['TP', [[0.4, 1.5], [0.4, 5.2], [0.08, 5.8], [0.02, 1.5]], true]],
    delts_rear: [['S2', 6.2]],
    delts_side: [['S2', 6.4]],
    triceps: [['ua', 0.5, 0, 0.36, 3.8]],
    forearms: [['fa', 0.32, 0, 0.3, 3.2]],
    glutes: [['TP', [[0.05, 1], [0.03, 11.5], [-0.12, 14], [-0.25, 10.5], [-0.27, 2.2], [-0.12, 0.8]], true]],
    hamstrings: [['th', 0.5, 0, 0.36, 5.4]],
    calves: [['sh', 0.28, 0, 0.27, 4.3]]
  };

  function musPaint(g, lvl, k, dim, cx, cy, R) {
    if (lvl === 2) {
      const gr = g.createRadialGradient(cx - R * 0.3, cy - R * 0.35, 0, cx, cy, R);
      if (dim) {
        gr.addColorStop(0, 'rgba(190,236,255,0.6)');
        gr.addColorStop(1, 'rgba(60,150,230,0.5)');
      } else {
        gr.addColorStop(0, '#ECFAFF');
        gr.addColorStop(0.5, 'rgba(90,200,250,0.98)');
        gr.addColorStop(1, 'rgba(26,110,226,0.95)');
        g.shadowColor = 'rgba(90,200,250,' + (0.5 + 0.45 * k).toFixed(2) + ')';
        g.shadowBlur = (4 + 10 * k) * UNIT;
      }
      g.fillStyle = gr;
    } else {
      g.fillStyle = dim ? 'rgba(90,200,250,0.22)' : 'rgba(90,200,250,0.46)';
    }
  }

  function musPoly(g, pts, lvl, k) {
    let cx = 0, cy = 0;
    for (const p of pts) { cx += p[0]; cy += p[1]; }
    cx /= pts.length; cy /= pts.length;
    let R = 0;
    for (const p of pts) R = Math.max(R, Math.hypot(p[0] - cx, p[1] - cy));
    const bul = lvl === 2 ? 1 + 0.07 * k : 1;
    const sp = pts.map(p => [cx + (p[0] - cx) * bul, cy + (p[1] - cy) * bul]);
    g.save();
    musPaint(g, lvl, k, false, cx, cy, R);
    g.beginPath(); smoothClosed(g, sp); g.fill();
    g.restore();
  }

  function musShape(g, c, rx, ry, rot, lvl, k, dim) {
    g.save();
    g.translate(c[0], c[1]);
    g.rotate(rot);
    const bul = lvl === 2 ? 1 + 0.13 * k : 1;
    const RX = rx * bul, RY = ry * bul;
    g.beginPath();
    g.ellipse(0, 0, RX, RY, 0, 0, Math.PI * 2);
    musPaint(g, lvl, k, dim, 0, 0, Math.max(RX, RY));
    g.fill();
    g.restore();
  }

  function musForLimb(g, ex, S, limb, kind, side, dim, k) {
    const table = S.view === 'side' ? MUS_SIDE : (S.view === 'back' ? MUS_BACK : MUS_FRONT);
    const segs = kind === 'arm' ? { ua: [limb.r, limb.j], fa: [limb.j, limb.e] } : { th: [limb.r, limb.j], sh: [limb.j, limb.e] };
    for (const id in ex._lvl) {
      const defs = table[id];
      if (!defs) continue;
      for (const d of defs) {
        const sg = segs[d[0]];
        if (!sg) continue;
        const v = sub(sg[1], sg[0]), l = len(v);
        if (l < 2) continue;
        const u = [v[0] / l, v[1] / l];
        let an = antL(u);
        if (side < 0) an = [-an[0], -an[1]];
        const c = add(add(sg[0], v, d[1]), an, d[2]);
        musShape(g, c, Math.max(2.4, d[3] * l), d[4], ang(u), ex._lvl[id], k, dim);
      }
    }
  }

  function musForTorso(g, ex, S, k) {
    const view = S.view;
    const table = view === 'side' ? MUS_SIDE : (view === 'back' ? MUS_BACK : MUS_FRONT);
    for (const id in ex._lvl) {
      const defs = table[id];
      if (!defs) continue;
      for (const d of defs) {
        if (d[0] === 'T') {
          const q = axAt(S.ax, d[1]);
          const n = nrmT(q.a);
          let off;
          if (view === 'side') off = d[2] * profAt(PROF_SIDE, d[1], d[2] >= 0 ? 1 : -1);
          else off = d[2];
          const c = add(q.p, n, off);
          musShape(g, c, d[3], d[4], (q.a + (view === 'side' ? -90 : 0)) * D + (d[5] || 0) * D, ex._lvl[id], k, false);
          if (id === 'abs' && view === 'front') absLines(g, c, d[3], d[4], q.a);
        } else if (d[0] === 'T2') {
          const q = axAt(S.ax, d[1]);
          const n = nrmT(q.a);
          for (const sd of [1, -1]) {
            const c = add(q.p, n, d[2] * sd);
            musShape(g, c, d[3], d[4], (q.a + sd * (d[5] || 0)) * D, ex._lvl[id], k, false);
          }
        } else if (d[0] === 'TP') {
          for (const sd of (d[2] ? [1, -1] : [1])) {
            const pts = d[1].map(([ss, lat]) => { const q = axAt(S.ax, ss); return add(q.p, nrmT(q.a), lat * sd); });
            musPoly(g, pts, ex._lvl[id], k);
            if (d[3] === 'abs') { const q = axAt(S.ax, 0.34); absLines(g, q.p, 5.4, 12.5, q.a); }
          }
        }
      }
    }
  }

  function musShoulders(g, ex, S, k) {
    const table = S.view === 'side' ? MUS_SIDE : (S.view === 'back' ? MUS_BACK : MUS_FRONT);
    let best = 0;
    for (const id in ex._lvl) {
      const defs = table[id];
      if (!defs) continue;
      for (const d of defs) {
        if (d[0] === 'S') {
          const c = add(add(S.sj, S.n, d[1]), S.d, -1.5);
          musShape(g, c, d[2], d[2] * 0.9, (S.endA - 90) * D, ex._lvl[id], k, false);
        } else if (d[0] === 'S2' && ex._lvl[id] > best) best = ex._lvl[id];
      }
    }
    if (best) {
      for (const [sj, A, sd] of [[S.sjR, S.arm.R, 1], [S.sjL, S.arm.L, -1]]) {
        const u = norm(sub(A.j, A.r));
        const c = add(sj, u, 4.5);
        musShape(g, c, 6.6, 5.4, ang(u), best, k, false);
      }
    }
  }

  function absLines(g, c, rx, ry, a) {
    g.save();
    g.translate(c[0], c[1]);
    g.rotate(a * D);
    g.strokeStyle = 'rgba(5,20,45,0.55)';
    g.lineWidth = 0.8;
    g.beginPath();
    g.moveTo(0, -ry + 1); g.lineTo(0, ry - 1);
    for (const y of [-ry * 0.36, ry * 0.2]) { g.moveTo(-rx + 0.8, y); g.lineTo(rx - 0.8, y); }
    g.stroke();
    g.restore();
  }

  /* ---------------- corpo ---------------- */
  function drawTorso(g, S) {
    const prof = S.view === 'side' ? PROF_SIDE : PROF_FRONT;
    const F = [], Bk = [];
    for (const row of prof) {
      const q = axAt(S.ax, row[0]);
      const n = nrmT(q.a);
      F.push(add(q.p, n, row[1]));
      Bk.push(add(q.p, n, -row[2]));
    }
    const pts = F.concat(Bk.reverse());
    g.beginPath(); smoothClosed(g, pts);
    g.lineWidth = 3; g.strokeStyle = COL.line; g.lineJoin = 'round'; g.stroke();
    const c = axAt(S.ax, 0.55);
    let pr = nrmT(c.a);
    if (pr[0] * LIGHT[0] + pr[1] * LIGHT[1] < 0) pr = [-pr[0], -pr[1]];
    const gr = g.createLinearGradient(c.p[0] + pr[0] * 14, c.p[1] + pr[1] * 14, c.p[0] - pr[0] * 14, c.p[1] - pr[1] * 14);
    gr.addColorStop(0, COL.lit); gr.addColorStop(0.5, COL.mid); gr.addColorStop(1, COL.shade);
    g.fillStyle = gr; g.fill();
    if (S.view !== 'side') {
      // linha central sutil e cintura
      const a = axAt(S.ax, 0.12).p, b = axAt(S.ax, 0.92).p;
      g.strokeStyle = 'rgba(40,60,95,0.14)'; g.lineWidth = 0.9;
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    }
  }

  function drawHead(g, S) {
    const nk = add(S.end, dirT(S.headA), 8);
    chain(g, [add(S.end, dirT(S.headA), -2), nk], [RAD.neck, RAD.neck * 0.92], false);
    const c = S.head, r = L.head;
    g.beginPath(); g.arc(c[0], c[1], r + 1.5, 0, Math.PI * 2); g.fillStyle = COL.line; g.fill();
    const gr = g.createRadialGradient(c[0] - r * 0.4, c[1] - r * 0.45, r * 0.1, c[0], c[1], r * 1.05);
    gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(0.6, COL.mid); gr.addColorStop(1, COL.shade);
    g.beginPath(); g.arc(c[0], c[1], r, 0, Math.PI * 2); g.fillStyle = gr; g.fill();
    g.save();
    g.lineCap = 'round';
    g.shadowColor = 'rgba(90,200,250,0.9)'; g.shadowBlur = 6 * UNIT;
    g.strokeStyle = COL.acc; g.lineWidth = 2.8;
    if (S.view === 'side') {
      const a0 = ang(nrmT(S.headA));
      g.beginPath(); g.arc(c[0], c[1], r - 2.7, a0 - 0.7, a0 + 0.28); g.stroke();
    } else if (S.view === 'front') {
      const u = nrmT(S.headA), up = dirT(S.headA);
      const m0 = add(c, up, 1.6);
      g.beginPath(); g.moveTo(...add(m0, u, -5.6)); g.lineTo(...add(m0, u, 5.6)); g.stroke();
    } else {
      g.shadowBlur = 0; g.strokeStyle = 'rgba(40,60,95,0.25)'; g.lineWidth = 1;
      const up = dirT(S.headA);
      g.beginPath(); g.arc(c[0], c[1], r - 2.5, ang(up) + 0.9, ang(up) + Math.PI - 0.9); g.stroke();
    }
    g.restore();
  }

  function drawArm(g, ex, S, limb, side, far, k) {
    const ra = [RAD.ua[0], RAD.ua[1], RAD.fa[1]];
    chain(g, [limb.r, limb.j, limb.e], ra, far);
    // mão
    g.beginPath(); g.arc(limb.e[0], limb.e[1], RAD.hand + 1.4, 0, Math.PI * 2); g.fillStyle = COL.line; g.fill();
    g.beginPath(); g.arc(limb.e[0], limb.e[1], RAD.hand, 0, Math.PI * 2);
    g.fillStyle = far ? COL.farLit : COL.mid; g.fill();
    musForLimb(g, ex, S, limb, 'arm', side, far, k);
  }

  function drawLeg(g, ex, S, limb, side, far, k) {
    if (S.view === 'side') {
      chain(g, [limb.heel, limb.toe], RAD.foot, far);
      chain(g, [limb.r, limb.j, limb.e], [RAD.th[0], RAD.th[1], RAD.sh[1]], far);
    } else {
      chain(g, [limb.r, limb.j, limb.e], [RAD.th[0], RAD.th[1], RAD.sh[1]], far);
      const f = add(limb.e, [side * 1.5, 4]);
      g.beginPath(); g.ellipse(f[0], f[1], 6.4, 4.4, 0, 0, Math.PI * 2); g.fillStyle = COL.line; g.fill();
      g.beginPath(); g.ellipse(f[0], f[1], 5, 3.1, 0, 0, Math.PI * 2); g.fillStyle = COL.shade; g.fill();
    }
    musForLimb(g, ex, S, limb, 'leg', side, far, k);
  }

  /* ---------------- equipamentos (biblioteca) ---------------- */
  const Dr = {
    rr(g, x, y, w, h, r, fill, stroke, lw = 1) {
      g.beginPath();
      if (g.roundRect) g.roundRect(x, y, w, h, r);
      else { g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
      if (fill) { g.fillStyle = fill; g.fill(); }
      if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
    },
    line(g, a, b, w, col, cap = 'round') {
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]);
      g.lineWidth = w; g.strokeStyle = col; g.lineCap = cap; g.stroke();
    },
    poly(g, pts, fill, stroke, lw = 1) {
      g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
      g.closePath();
      if (fill) { g.fillStyle = fill; g.fill(); }
      if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
    },
    circ(g, c, r, fill, stroke, lw = 1) {
      g.beginPath(); g.arc(c[0], c[1], r, 0, Math.PI * 2);
      if (fill) { g.fillStyle = fill; g.fill(); }
      if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
    },
    tube(g, a, b, w = 4) {
      Dr.line(g, a, b, w + 2, COL.metalDk);
      Dr.line(g, a, b, w, COL.metal);
      const u = norm(sub(b, a));
      let pr = [-u[1], u[0]];
      if (pr[0] * LIGHT[0] + pr[1] * LIGHT[1] < 0) pr = [-pr[0], -pr[1]];
      Dr.line(g, add(a, pr, w * 0.22), add(b, pr, w * 0.22), Math.max(0.7, w * 0.28), 'rgba(205,215,230,0.55)');
    },
    pad(g, a, b, t, fill = COL.pad) {
      const v = sub(b, a), l = len(v);
      g.save(); g.translate(a[0], a[1]); g.rotate(ang(v));
      Dr.rr(g, 0, -t / 2, l, t, Math.min(4, t / 2), fill, COL.padHi, 1.1);
      g.beginPath(); g.moveTo(3, -t / 2 + 1.2); g.lineTo(l - 3, -t / 2 + 1.2);
      g.strokeStyle = 'rgba(120,160,230,0.35)'; g.lineWidth = 0.9; g.stroke();
      g.restore();
    },
    bench(g, x1, x2, top, opt = {}) {
      const h = opt.h || 7;
      const legs = opt.legs || [x1 + 16, x2 - 16];
      for (const x of legs) {
        Dr.tube(g, [x, top + h], [x, GROUND - 3], 4);
        Dr.tube(g, [x - 9, GROUND - 2], [x + 9, GROUND - 2], 3);
      }
      Dr.tube(g, [legs[0], top + h + 3], [legs[legs.length - 1], top + h + 3], 3.2);
      Dr.pad(g, [x1, top + h / 2], [x2, top + h / 2], h);
    },
    plate(g, c, r, alpha = 1) {
      g.save(); g.globalAlpha = alpha;
      const gr = g.createRadialGradient(c[0] - r * 0.3, c[1] - r * 0.35, r * 0.1, c[0], c[1], r);
      gr.addColorStop(0, 'rgba(210,225,245,0.30)'); gr.addColorStop(1, 'rgba(100,125,165,0.18)');
      Dr.circ(g, c, r, gr, COL.plateEdge, 1.6);
      Dr.circ(g, c, r * 0.72, null, 'rgba(200,214,232,0.35)', 1);
      Dr.circ(g, c, 3, COL.metalHi, COL.metalDk, 1);
      g.restore();
    },
    db(g, c, an, grip, r = 7, alpha = 1) {
      g.save(); g.globalAlpha = alpha;
      if (grip === 'end') {
        const gr = g.createRadialGradient(c[0] - r * 0.3, c[1] - r * 0.35, 0.5, c[0], c[1], r);
        gr.addColorStop(0, '#C8D3E3'); gr.addColorStop(1, '#4A566D');
        Dr.circ(g, c, r + 1, COL.line);
        Dr.circ(g, c, r, gr, 'rgba(220,230,245,0.8)', 1);
        Dr.circ(g, c, r * 0.4, null, 'rgba(255,255,255,0.35)', 0.8);
      } else {
        g.translate(c[0], c[1]); g.rotate(an);
        Dr.line(g, [-8, 0], [8, 0], 3.4, COL.line);
        Dr.line(g, [-8, 0], [8, 0], 2.2, COL.metalHi);
        for (const x of [-10.5, 10.5]) {
          Dr.rr(g, x - 3.2, -r * 0.85, 6.4, r * 1.7, 2, '#58647C', 'rgba(220,230,245,0.75)', 1);
        }
      }
      g.restore();
    },
    cable(g, a, b) { Dr.line(g, a, b, 1.1, COL.cable); },
    pulley(g, c, r = 4.5) {
      Dr.circ(g, c, r + 1.5, COL.metalDk);
      Dr.circ(g, c, r, COL.metal, COL.metalHi, 1);
      Dr.circ(g, c, 1.4, COL.metalHi);
    },
    column(g, x, y1, w = 14) {
      Dr.rr(g, x - w / 2, y1, w, GROUND - y1, 3, '#111A2E', 'rgba(120,150,200,0.35)', 1);
      Dr.line(g, [x - w / 2 + 2.5, y1 + 4], [x - w / 2 + 2.5, GROUND - 4], 0.8, 'rgba(160,190,240,0.25)');
    },
    stack(g, x, w, lift) {
      const base = GROUND - 8;
      for (let i = 0; i < 6; i++) {
        const up = i < 3 ? lift : 0;
        Dr.rr(g, x - w / 2 + 1.5, base - (i + 1) * 5.2 - up, w - 3, 4.4, 1, i < 3 ? '#3C4A66' : '#26324A', 'rgba(170,190,220,0.4)', 0.7);
      }
    },
    mat(g, x1, x2) {
      Dr.rr(g, x1, GROUND - 3, x2 - x1, 3, 1.5, '#13203A', 'rgba(90,200,250,0.35)', 0.8);
    },
    handle(g, c, an) {
      g.save(); g.translate(c[0], c[1]); g.rotate(an);
      Dr.rr(g, -2.5, -6, 5, 12, 2.4, null, COL.metalHi, 1.6);
      g.restore();
    },
    rope(g, c, toward) {
      const u = norm(sub(toward, c));
      const pr = [-u[1], u[0]];
      const k = add(c, u, 5);
      Dr.line(g, k, add(add(c, pr, 3), u, -4), 2.4, '#2E3B55');
      Dr.line(g, k, add(add(c, pr, -3), u, -4), 2.4, '#3E4E6E');
      Dr.circ(g, add(add(c, pr, 3), u, -5), 1.9, '#1B2438', COL.metalHi, 0.7);
      Dr.circ(g, add(add(c, pr, -3), u, -5), 1.9, '#1B2438', COL.metalHi, 0.7);
    },
    dashed(g, a, b, col = 'rgba(90,200,250,0.55)', w = 1) {
      g.save(); g.setLineDash([3, 3.5]); Dr.line(g, a, b, w, col, 'butt'); g.restore();
    },
    label(g, p, txt, align = 'left') {
      g.save();
      g.font = '600 7px -apple-system, "SF Pro Text", "Inter", system-ui, sans-serif';
      g.textAlign = align; g.fillStyle = 'rgba(160,220,255,0.9)';
      g.fillText(txt, p[0], p[1]);
      g.restore();
    }
  };

  /* ---------------- implementos automáticos ---------------- */
  function forearmAngle(limb) { return ang(sub(limb.e, limb.j)); }
  function drawImp(g, ex, S, which, far) {
    const im = ex.imp;
    if (!im) return;
    if (im.only && im.only !== which) return;
    const limb = S.arm[which];
    if (!limb) return;
    const c = limb.e;
    if (im.type === 'db') {
      let an = forearmAngle(limb) + Math.PI / 2;
      let cc = c;
      if (im.grip === 'vert') { an = Math.PI / 2; cc = add(c, [0, 6]); }
      if (im.grip === 'h') an = 0;
      Dr.db(g, cc, an, im.grip === 'end' ? 'end' : 'side', im.r || 7, far ? 0.55 : 1);
    }
  }
  function drawBarbellSide(g, ex, S, layer) {
    const im = ex.imp;
    if (!im || (im.type !== 'bb')) return;
    const c = im.at ? im.at(S) : S.arm.n.e;
    if (layer === 'back') {
      Dr.plate(g, add(c, DEPTH, 2.4), im.r || 17, 0.45);
    } else {
      Dr.line(g, add(c, DEPTH, 2.4), c, 3, COL.metalHi);
      Dr.plate(g, c, im.r || 17, 1);
    }
  }

  /* ---------------- chão e sombra ---------------- */
  function drawFloor(g, ex, S) {
    const gr = g.createLinearGradient(-80, 0, 400, 0);
    gr.addColorStop(0, 'rgba(90,200,250,0)');
    gr.addColorStop(0.22, 'rgba(90,200,250,0.45)');
    gr.addColorStop(0.78, 'rgba(90,200,250,0.45)');
    gr.addColorStop(1, 'rgba(90,200,250,0)');
    g.fillStyle = gr; g.fillRect(-80, GROUND, 480, 1.1);
    const g2 = g.createLinearGradient(0, GROUND, 0, GROUND + 30);
    g2.addColorStop(0, 'rgba(90,200,250,0.08)'); g2.addColorStop(1, 'rgba(90,200,250,0)');
    g.fillStyle = g2; g.fillRect(-80, GROUND + 1, 480, 30);
    // grade em perspectiva
    g.strokeStyle = 'rgba(90,200,250,0.06)'; g.lineWidth = 0.6;
    g.beginPath();
    for (let i = -8; i <= 8; i++) { g.moveTo(160 + i * 22, GROUND + 1); g.lineTo(160 + i * 46, GROUND + 34); }
    g.stroke();
    // sombra
    let sx = ex.shadowX != null ? ex.shadowX : S.hip[0];
    if (S.view === 'side' && ex.shadowX == null) sx = (S.hip[0] + S.leg.n.e[0]) / 2;
    const sw = ex.shadowW || 46;
    const sg = g.createRadialGradient(sx, GROUND, 1, sx, GROUND, sw);
    sg.addColorStop(0, 'rgba(0,0,0,0.55)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
    g.save(); g.translate(sx, GROUND); g.scale(1, 0.12); g.translate(-sx, -GROUND);
    g.fillStyle = sg; g.beginPath(); g.arc(sx, GROUND, sw, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  function drawTrace(g, ex) {
    const pts = ex._trace;
    if (!pts || pts.length < 2) return;
    g.save();
    g.setLineDash([2.5, 3.5]);
    g.lineWidth = 1.1;
    g.strokeStyle = 'rgba(90,200,250,0.42)';
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.stroke();
    g.restore();
  }

  /* ---------------- cena ---------------- */
  function drawScene(g, ex, t) {
    const P = getPose(ex, t);
    const S = solve(ex, P);
    const k = P.e != null ? P.e : 0.6;
    const kf = P._ef != null ? P._ef : k;
    drawFloor(g, ex, S);
    if (ex.back) ex.back(g, S, P, t);
    drawTrace(g, ex);
    if (S.view === 'side') {
      drawBarbellSide(g, ex, S, 'back');
      g.save(); g.translate(DEPTH[0], DEPTH[1]);
      drawLeg(g, ex, S, S.leg.f, 1, true, kf);
      drawArm(g, ex, S, S.arm.f, 1, true, kf);
      drawImp(g, ex, S, 'f', true);
      g.restore();
      if (ex.mid) ex.mid(g, S, P, t);
      drawTorso(g, S);
      musForTorso(g, ex, S, k);
      drawHead(g, S);
      if (ex.afterTorso) ex.afterTorso(g, S, P, t);
      drawLeg(g, ex, S, S.leg.n, 1, false, k);
      if (ex.betweenLimbs) ex.betweenLimbs(g, S, P, t);
      drawArm(g, ex, S, S.arm.n, 1, false, k);
      musShoulders(g, ex, S, k);
      drawImp(g, ex, S, 'n', false);
      drawBarbellSide(g, ex, S, 'front');
    } else {
      drawLeg(g, ex, S, S.leg.L, -1, false, k);
      drawLeg(g, ex, S, S.leg.R, 1, false, k);
      if (ex.mid) ex.mid(g, S, P, t);
      drawTorso(g, S);
      musForTorso(g, ex, S, k);
      drawHead(g, S);
      if (ex.afterTorso) ex.afterTorso(g, S, P, t);
      drawArm(g, ex, S, S.arm.L, -1, false, k);
      drawArm(g, ex, S, S.arm.R, 1, false, k);
      musShoulders(g, ex, S, k);
      drawImp(g, ex, S, 'L', false);
      drawImp(g, ex, S, 'R', false);
    }
    if (ex.front) ex.front(g, S, P, t);
    return P;
  }

  /* ---------------- player + loop global ---------------- */
  const LIB = {};
  const registry = new Set();
  let raf = 0, lastTs = 0;
  function frame(ts) {
    const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0;
    lastTs = ts;
    let any = false;
    for (const p of registry) {
      if (p.playing && p.visible) { any = true; p.advance(dt); p.render(); }
    }
    if (any) raf = requestAnimationFrame(frame);
    else { raf = 0; lastTs = 0; }
  }
  function kick() { if (!raf) { lastTs = 0; raf = requestAnimationFrame(frame); } }

  class Player {
    constructor(canvas, id, opt = {}) {
      this.c = canvas;
      this.g = canvas.getContext('2d');
      this.speed = opt.speed || 1;
      this.playing = opt.autoplay !== false;
      this.visible = true;
      this.onPhase = opt.onPhase || null;
      this.phase = null;
      this.setExercise(id, opt.t || 0, true);
      if (typeof ResizeObserver !== 'undefined') {
        this.ro = new ResizeObserver(() => { this.resize(); this.render(); });
        this.ro.observe(canvas);
      }
      if (typeof IntersectionObserver !== 'undefined') {
        this.io = new IntersectionObserver(es => {
          this.visible = es[es.length - 1].isIntersecting;
          if (this.visible) { this.render(); kick(); }
        }, { rootMargin: '120px' });
        this.io.observe(canvas);
      }
      registry.add(this);
      this.resize(); this.render(); kick();
    }
    setExercise(id, t = 0, silent) {
      const ex = LIB[id];
      if (!ex) throw new Error('Exercício desconhecido: ' + id);
      this.id = id;
      this.ex = prep(ex);
      this.t = t;
      this.phase = null;
      if (!silent) this.render();
    }
    resize() {
      const r = this.c.getBoundingClientRect();
      const dpr = Math.min(2.5, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
      if (this.c.width !== w || this.c.height !== h) { this.c.width = w; this.c.height = h; }
      this.cw = r.width; this.ch = r.height; this.dpr = dpr;
    }
    advance(dt) { this.t = (this.t + dt * this.speed * (this.ex.speed || 1) / this.ex.dur) % 1; }
    render() {
      const g = this.g, c = this.c;
      if (!this.cw) this.resize();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, c.width, c.height);
      const ex = this.ex;
      const cam = ex.cam || [160, 124, 1];
      const s = Math.min(this.cw / 320, this.ch / 240) * this.dpr;
      const ox = (c.width - 320 * s) / 2, oy = (c.height - 240 * s) / 2;
      const cs = cam[2];
      g.setTransform(s * cs, 0, 0, s * cs, ox + s * (160 - cam[0] * cs), oy + s * (120 - cam[1] * cs));
      UNIT = s * cs;
      g.lineJoin = 'round';
      const P = drawScene(g, ex, this.t);
      if (this.onPhase && P._ph !== this.phase) { this.phase = P._ph; this.onPhase(P._ph || ''); }
    }
    play() { this.playing = true; kick(); }
    pause() { this.playing = false; }
    toggle() { this.playing ? this.pause() : this.play(); return this.playing; }
    seek(t) { this.t = t; this.render(); }
    destroy() {
      registry.delete(this);
      if (this.ro) this.ro.disconnect();
      if (this.io) this.io.disconnect();
    }
  }

  /* ---------------- render estático (preview / testes) ---------------- */
  function renderAt(canvas, id, t, scale = 2) {
    const ex = prep(LIB[id]);
    canvas.width = 320 * scale; canvas.height = 240 * scale;
    const g = canvas.getContext('2d');
    const cam = ex.cam || [160, 124, 1];
    const cs = cam[2];
    g.setTransform(scale * cs, 0, 0, scale * cs, scale * (160 - cam[0] * cs), scale * (120 - cam[1] * cs));
    UNIT = scale * cs;
    g.lineJoin = 'round';
    return drawScene(g, ex, t);
  }

  root.Rig = {
    GROUND, L, COL, DEPTH, Dr, D,
    math: { add, sub, mid, len, norm, lerp, dirT, nrmT, dirK, antL, ang },
    define(id, ex) { LIB[id] = ex; ex.id = id; },
    get(id) { return LIB[id]; },
    all() { return Object.keys(LIB); },
    Player, renderAt, solve, getPose, prep
  };
})(typeof window !== 'undefined' ? window : globalThis);
