/* =====================================================================
   MAPA MUSCULAR — silhueta frente/costas em SVG
   ===================================================================== */
(function () {
  'use strict';
  let uid = 0;

  // silhueta (membros como traços arredondados)
  const SIL = `
    <ellipse cx="60" cy="19" rx="10.5" ry="12.5"/>
    <rect x="54" y="29" width="12" height="11" rx="4"/>
    <path d="M37 44 Q60 37 83 44 Q90 48 89 58 Q86 80 81 98 Q78 116 81 132 L39 132 Q42 116 39 98 Q34 80 31 58 Q30 48 37 44 Z"/>
    <path d="M39 126 L81 126 L84 148 Q60 158 36 148 Z"/>
    <g fill="none" stroke-linecap="round">
      <line x1="33" y1="53" x2="25.5" y2="97" stroke-width="12"/>
      <line x1="25.5" y1="97" x2="19.5" y2="139" stroke-width="9.5"/>
      <line x1="87" y1="53" x2="94.5" y2="97" stroke-width="12"/>
      <line x1="94.5" y1="97" x2="100.5" y2="139" stroke-width="9.5"/>
      <line x1="49" y1="140" x2="47.5" y2="192" stroke-width="18"/>
      <line x1="47.5" y1="192" x2="47.5" y2="236" stroke-width="11.5"/>
      <line x1="71" y1="140" x2="72.5" y2="192" stroke-width="18"/>
      <line x1="72.5" y1="192" x2="72.5" y2="236" stroke-width="11.5"/>
    </g>
    <circle cx="18.5" cy="147" r="5"/><circle cx="101.5" cy="147" r="5"/>
    <ellipse cx="46.5" cy="243" rx="6.5" ry="3.4"/><ellipse cx="73.5" cy="243" rx="6.5" ry="3.4"/>`;

  // regiões musculares (lado esquerdo; espelhadas com transform)
  const FRONT = {
    traps: ['<path d="M53 40 Q46 44 40 45.5 Q48 47.5 54.5 46 Z"/>', true],
    delts_front: ['<ellipse cx="35.5" cy="53" rx="7" ry="8.5" transform="rotate(14 35.5 53)"/>', true],
    delts_side: ['<ellipse cx="33.5" cy="54" rx="6" ry="8.5" transform="rotate(14 33.5 54)"/>', true],
    chest: ['<path d="M59 50 Q47 46.5 39.5 53.5 Q37.5 65 45 70.5 Q53 73.5 59 68.5 Z"/>', true],
    biceps: ['<ellipse cx="29" cy="76" rx="5" ry="12.5" transform="rotate(10 29 76)"/>', true],
    forearms: ['<ellipse cx="22.5" cy="118" rx="4.4" ry="15" transform="rotate(8 22.5 118)"/>', true],
    abs: ['<rect x="52.5" y="74" width="15" height="50" rx="6"/>', false],
    obliques: ['<path d="M50.5 78 Q43 80 41.5 92 Q41 110 44 124 L50.5 124 Z"/>', true],
    quads: ['<ellipse cx="48.5" cy="166" rx="8.6" ry="22.5" transform="rotate(2 48.5 166)"/>', true],
    calves: ['<ellipse cx="46" cy="214" rx="3.8" ry="12.5"/>', true]
  };
  const BACK = {
    traps: ['<path d="M60 33 L69 43 L84 49.5 L66 57 L60 88 L54 57 L36 49.5 L51 43 Z"/>', false],
    delts_rear: ['<ellipse cx="35.5" cy="53" rx="7" ry="8.5" transform="rotate(14 35.5 53)"/>', true],
    delts_side: ['<ellipse cx="33.5" cy="54" rx="6" ry="8.5" transform="rotate(14 33.5 54)"/>', true],
    midback: ['<path d="M58.5 59 L47 56.5 L46 73 L58.5 80 Z"/>', true],
    lats: ['<path d="M45.5 58 Q36 62 38 78 Q41.5 99 53 113 L57.5 106 L51 86 L47.5 66 Z"/>', true],
    triceps: ['<ellipse cx="28.5" cy="77" rx="5.2" ry="12.5" transform="rotate(10 28.5 77)"/>', true],
    forearms: ['<ellipse cx="22.5" cy="118" rx="4.4" ry="15" transform="rotate(8 22.5 118)"/>', true],
    lowerback: ['<rect x="53" y="98" width="5.6" height="28" rx="2.8"/>', true],
    glutes: ['<ellipse cx="49.5" cy="142" rx="10.5" ry="11.5"/>', true],
    hamstrings: ['<ellipse cx="48.5" cy="174" rx="8" ry="20"/>', true],
    calves: ['<ellipse cx="47.5" cy="212" rx="6" ry="14"/>', true]
  };
  const ABS_LINES = '<g stroke="rgba(5,15,35,.55)" stroke-width=".9" fill="none"><line x1="60" y1="76" x2="60" y2="122"/><line x1="53" y1="88" x2="67" y2="88"/><line x1="53" y1="100" x2="67" y2="100"/><line x1="53" y1="112" x2="67" y2="112"/></g>';

  function figure(map, pri, sec, fid) {
    let out = '';
    for (const id in map) {
      const [shape, mirror] = map[id];
      const lvl = pri.includes(id) ? 2 : (sec.includes(id) ? 1 : 0);
      // ombros: frente mostra anterior/lateral; costas posterior/lateral (pega o maior nível)
      const cls = lvl === 2 ? 'm-pri' : (lvl === 1 ? 'm-sec' : 'm-off');
      const filter = lvl === 2 ? ` filter="url(#${fid})"` : '';
      out += `<g class="${cls}"${filter}>${shape}${mirror ? `<g transform="translate(120 0) scale(-1 1)">${shape}</g>` : ''}</g>`;
      if (id === 'abs') out += ABS_LINES;
    }
    return out;
  }

  window.bodyMap = function (pri = [], sec = []) {
    const fid = 'glow' + (++uid);
    const defs = `<defs><filter id="${fid}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
    // ordena para que regiões com destaque fiquem por cima
    const order = (map) => {
      const o = {};
      const ids = Object.keys(map).sort((a, b) => (lv(a) - lv(b)));
      ids.forEach(i => { o[i] = map[i]; });
      return o;
    };
    const lv = id => (pri.includes(id) ? 2 : sec.includes(id) ? 1 : 0);
    const f = order(FRONT), b = order(BACK);
    return `
      <div class="bodymap">
        <figure>
          <svg viewBox="0 0 120 250" role="img" aria-label="Músculos — vista frontal">${defs}
            <g class="sil">${SIL}</g>${figure(f, pri, sec, fid)}
          </svg>
          <figcaption>Frente</figcaption>
        </figure>
        <figure>
          <svg viewBox="0 0 120 250" role="img" aria-label="Músculos — vista de costas">
            <g class="sil">${SIL}</g>${figure(b, pri, sec, fid)}
          </svg>
          <figcaption>Costas</figcaption>
        </figure>
      </div>`;
  };
})();
