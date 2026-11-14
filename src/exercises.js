/* =====================================================================
   EXERCÍCIOS — poses (keyframes), equipamentos e instruções
   Coordenadas: palco 320×240, chão em y = 212, boneco olhando para a direita.
   ===================================================================== */
(function () {
  'use strict';
  const { Dr, GROUND: G, COL, math: M } = Rig;
  const D = Math.PI / 180;
  const K = (t, P, ph, ease) => ({ t, P: P || {}, ph, ease });
  const def = Rig.define;

  /* ---------------- equipamentos reutilizáveis ---------------- */
  function rackPost(g, x, top, hookY) {
    Dr.tube(g, [x, top], [x, G - 3], 4.5);
    Dr.tube(g, [x - 10, G - 2], [x + 10, G - 2], 3);
    Dr.line(g, [x, hookY], [x + 9, hookY], 3, COL.metalHi);
    Dr.line(g, [x + 9, hookY], [x + 9, hookY - 5], 2.4, COL.metalHi);
  }
  function inclineBench(g, hip, th, o = {}) {
    const d = M.dirT(th), n = M.nrmT(th);
    const off = o.off || 13.2;
    const a = M.add(M.add(hip, d, -5), n, -off);
    const b = M.add(M.add(hip, d, o.len || 76), n, -off);
    const seatY = hip[1] + 13.6;
    const pm = M.add(a, M.sub(b, a), 0.42);
    Dr.tube(g, M.add(pm, n, -3), [pm[0] - 6, G - 3], 4);
    Dr.tube(g, [hip[0] + 8, seatY + 3], [hip[0] + 12, G - 3], 4);
    Dr.tube(g, [Math.min(a[0], pm[0]) - 14, G - 2], [hip[0] + 34, G - 2], 3);
    Dr.pad(g, [hip[0] - 12, seatY], [hip[0] + 28, seatY], 7);
    Dr.pad(g, a, b, 7.4);
  }
  function columnStack(g, x, top, lift, w = 16) {
    Dr.column(g, x, top, w);
    Dr.stack(g, x, w, Math.max(0, Math.min(lift, 60)));
  }
  function cableLift(a, b, base, k = 0.35) { return Math.max(0, (M.len(M.sub(a, b)) - base) * k); }
  function seatBlock(g, x1, x2, top) {
    Dr.tube(g, [(x1 + x2) / 2, top + 6], [(x1 + x2) / 2, G - 3], 5);
    Dr.tube(g, [x1 - 4, G - 2], [x2 + 4, G - 2], 3);
    Dr.pad(g, [x1, top + 3.5], [x2, top + 3.5], 7);
  }
  function guideLine(g, a, b, txt, at) {
    Dr.dashed(g, a, b, 'rgba(90,200,250,0.6)', 0.9);
    if (txt) Dr.label(g, at || [b[0] + 4, b[1] + 2], txt);
  }

  const INFO = (setup, exec, breath, avoid) => ({ setup, exec, breath, avoid });

  /* =================================================================
     SEGUNDA — PEITO & TRÍCEPS
     ================================================================= */
  def('supino_reto', {
    name: 'Supino reto com barra', view: 'side', dur: 3.6, cam: [150, 132, 1.05],
    imp: { type: 'bb', r: 17 }, pri: ['chest'], sec: ['triceps', 'delts_front'], trace: 'hn',
    keys: [
      K(0, { hip: [170, 142], th: -90, hd: 0, a: [125, 88], l: { p: [196, 208], fa: 2 }, e: 0.35 }, 'Barra travada sobre os ombros'),
      K(0.1, {}, 'Desça controlando · 2s'),
      K(0.56, { a: [137, 127], e: 0.75 }, 'Toque leve no peito'),
      K(0.64, { e: 0.85 }, 'Empurre para cima · 1s'),
      K(0.9, { a: [125, 88], e: 1 }, 'Trave sem estalar o cotovelo')
    ],
    back: g => rackPost(g, 108, 76, 90),
    mid: g => Dr.bench(g, 60, 206, 150),
    info: INFO(
      ['Deite com os olhos logo abaixo da barra e os pés firmes no chão.', 'Junte as escápulas (ombros para trás e para baixo) e mantenha uma leve curva na lombar.', 'Pegada um pouco mais aberta que os ombros, punhos retos.'],
      ['Desça a barra até a parte baixa do peito, cotovelos a ~45° do tronco.', 'Empurre para cima e levemente na direção dos ombros, sem tirar o glúteo do banco.'],
      'Puxe o ar na descida e solte ao empurrar.',
      ['Quicar a barra no peito', 'Abrir os cotovelos a 90° (sobrecarrega o ombro)', 'Tirar o quadril do banco']
    )
  });

  def('supino_inclinado_halteres', {
    name: 'Supino inclinado com halteres', view: 'side', dur: 3.6, cam: [152, 132, 1.05],
    imp: { type: 'db', grip: 'end', r: 8 }, pri: ['chest'], sec: ['delts_front', 'triceps'], trace: 'hn',
    keys: [
      K(0, { hip: [168, 150], th: -50, hd: 4, a: [134, 66], l: { p: [214, 208], fa: 0 }, e: 0.35 }, 'Halteres alinhados acima do peito'),
      K(0.1, {}, 'Desça abrindo o peito · 2s'),
      K(0.56, { a: [149, 106], e: 0.75 }, 'Alongue sem soltar as escápulas'),
      K(0.64, { e: 0.85 }, 'Empurre e aproxime os halteres · 1s'),
      K(0.9, { a: [134, 66], e: 1 }, 'Contraia o peitoral em cima')
    ],
    mid: g => inclineBench(g, [168, 150], -50),
    info: INFO(
      ['Banco entre 30° e 45°.', 'Escápulas encaixadas e peito estufado; pés firmes no chão.', 'Halteres na linha do peito superior, palmas para a frente.'],
      ['Desça até sentir o peito alongar, cotovelos levemente abaixo do banco.', 'Empurre para cima fazendo um leve arco, aproximando os halteres no topo.'],
      'Inspire na descida, expire na subida.',
      ['Banco muito inclinado (vira exercício de ombro)', 'Bater os halteres no topo', 'Perder o controle na descida']
    )
  });

  def('crossover', {
    name: 'Crucifixo no cross-over (polia alta)', view: 'front', dur: 3.4, cam: [160, 120, 1],
    pri: ['chest'], sec: ['delts_front'], trace: 'hR',
    bend: { a: 1, l: -1 },
    keys: [
      K(0, { hip: [160, 127], a: [228, 68], l: [174, 208], b: { a: 0.75 }, e: 0.35 }, 'Braços abertos, cotovelos levemente flexionados'),
      K(0.08, {}, 'Feche em arco, como num abraço · 1s'),
      K(0.42, { a: [163, 128], b: { a: -1 }, e: 1 }, 'Aperte o peitoral no centro'),
      K(0.54, { e: 0.9 }, 'Volte devagar · 2s'),
      K(0.95, { a: [228, 68], b: { a: 0.75 }, e: 0.4 })
    ],
    back: (g, S) => {
      const lift = cableLift(S.arm.R.e, [286, 40], 62, 0.16);
      for (const x of [30, 290]) columnStack(g, x, 26, lift);
      Dr.tube(g, [30, 26], [290, 26], 3.5);
    },
    front: (g, S) => {
      for (const [side, x] of [['R', 284], ['L', 36]]) {
        const p = [x, 40];
        Dr.pulley(g, p);
        Dr.cable(g, p, S.arm[side].e);
        Dr.handle(g, S.arm[side].e, M.ang(M.sub(p, S.arm[side].e)) + Math.PI / 2);
      }
    },
    info: INFO(
      ['Polias no alto, um passo à frente da máquina com um pé à frente do outro.', 'Tronco levemente inclinado, peito aberto e abdômen firme.'],
      ['Traga as mãos para a frente e para baixo em arco, até se encontrarem na altura do umbigo.', 'Mantenha o mesmo ângulo de cotovelo do começo ao fim.'],
      'Solte o ar ao fechar, inspire ao abrir.',
      ['Transformar em supino dobrando os cotovelos', 'Deixar os ombros subirem', 'Voltar rápido demais']
    )
  });

  def('triceps_corda', {
    name: 'Tríceps na polia com corda', view: 'side', dur: 3, cam: [172, 120, 1],
    pri: ['triceps'], sec: ['forearms'], trace: 'hn',
    keys: [
      K(0, { hip: [148, 127], th: 12, hd: -4, a: { k: [-6, 108] }, l: [151, 208], e: 0.4 }, 'Cotovelos colados ao corpo'),
      K(0.1, {}, 'Estenda até o fim · 1s'),
      K(0.42, { a: { k: [-6, 6] }, e: 1 }, 'Abra a corda e contraia'),
      K(0.52, { e: 0.95 }, 'Volte devagar até ~90° · 2s'),
      K(0.94, { a: { k: [-6, 108] }, e: 0.45 })
    ],
    back: (g, S) => {
      const p = [218, 22];
      columnStack(g, 234, 12, cableLift(S.arm.n.e, p, 82, 0.3));
      Dr.tube(g, [226, 16], [234, 16], 3);
      Dr.pulley(g, p);
      Dr.cable(g, p, S.arm.n.e);
    },
    front: (g, S) => Dr.rope(g, S.arm.n.e, [218, 22]),
    info: INFO(
      ['Fique de frente para a polia alta, pés na largura do quadril.', 'Tronco levemente inclinado à frente e cotovelos grudados nas laterais.'],
      ['Empurre a corda para baixo até estender totalmente os cotovelos.', 'No final, afaste as pontas da corda para os lados.', 'Só o antebraço se move.'],
      'Solte o ar ao estender, inspire na volta.',
      ['Afastar os cotovelos do corpo', 'Usar o peso do tronco para empurrar', 'Subir as mãos acima do peito']
    )
  });

  def('triceps_frances', {
    name: 'Tríceps francês com halter', view: 'side', dur: 3.2, cam: [156, 116, 1],
    imp: { type: 'db', grip: 'vert', r: 7, only: 'n' }, pri: ['triceps'], sec: [], trace: 'hn',
    keys: [
      K(0, { hip: [152, 127], th: 2, a: { k: [172, 4] }, l: [154, 208], e: 0.45 }, 'Braços estendidos acima da cabeça'),
      K(0.1, {}, 'Desça o halter atrás da cabeça · 2s'),
      K(0.52, { a: { k: [172, 140] }, e: 0.8 }, 'Alongue o tríceps'),
      K(0.6, { e: 0.85 }, 'Estenda os cotovelos · 1s'),
      K(0.88, { a: { k: [172, 4] }, e: 1 })
    ],
    info: INFO(
      ['Em pé (ou sentado com encosto), segure um halter com as duas mãos pela anilha de cima.', 'Abdômen contraído para a lombar não arquear.'],
      ['Desça o halter atrás da cabeça dobrando só os cotovelos.', 'Cotovelos apontando para cima e próximos da cabeça.', 'Estenda os braços de volta sem travar com força.'],
      'Inspire ao descer, expire ao estender.',
      ['Abrir os cotovelos para os lados', 'Arquear a lombar', 'Descer rápido demais']
    )
  });

  def('abdominal_polia', {
    name: 'Abdominal na polia (ajoelhado)', view: 'side', dur: 3.2, cam: [176, 128, 1],
    pri: ['abs'], sec: ['obliques'], trace: 'head',
    bend: { a: 1, l: -1 },
    keys: [
      K(0, { hip: [150, 164], th: 12, cu: 4, hd: 8, a: { t: [13, 6] }, l: { p: [109, 207], fa: 180 }, e: 0.35 }, 'Quadril parado, corda ao lado da cabeça'),
      K(0.08, {}, 'Enrole a coluna levando os cotovelos aos joelhos · 1s'),
      K(0.42, { th: 38, cu: 54, hd: 22, e: 1 }, 'Contraia forte o abdômen'),
      K(0.52, { e: 0.9 }, 'Volte devagar · 2s'),
      K(0.94, { th: 12, cu: 4, hd: 8, e: 0.4 })
    ],
    back: (g, S) => {
      const p = [238, 20];
      columnStack(g, 254, 10, cableLift(S.arm.n.e, p, 90, 0.3));
      Dr.tube(g, [246, 14], [254, 14], 3);
      Dr.pulley(g, p);
      Dr.cable(g, p, S.arm.n.e);
      Dr.mat(g, 70, 200);
    },
    front: (g, S) => Dr.rope(g, S.arm.n.e, [238, 20]),
    info: INFO(
      ['Ajoelhe de frente para a polia alta segurando a corda ao lado da cabeça.', 'Quadril alto e parado durante todo o movimento.'],
      ['Enrole a coluna (como se fosse encostar a testa nos joelhos), levando os cotovelos em direção às coxas.', 'Segure 1s contraindo e volte devagar.'],
      'Solte todo o ar ao descer.',
      ['Sentar nos calcanhares (vira movimento de quadril)', 'Puxar com os braços', 'Coluna reta, sem enrolar']
    )
  });

  def('prancha', {
    name: 'Prancha frontal', view: 'side', dur: 4, cam: [146, 172, 1.2],
    pri: ['abs'], sec: ['obliques', 'delts_front', 'glutes'],
    bend: { a: 1, l: -1 },
    keys: [
      K(0, { hip: [149.5, 185], th: 82, hd: 0, a: [223, 207.5], l: { p: [68, 196.5], fa: 75 }, e: 0.75 }, 'Corpo em linha reta da cabeça aos calcanhares'),
      K(0.5, { hip: [149.5, 184.2], e: 1 }, 'Contraia abdômen e glúteos, respire'),
      K(1, { hip: [149.5, 185], e: 0.75 })
    ],
    back: g => Dr.mat(g, 50, 250),
    front: (g, S) => guideLine(g, M.add(S.leg.n.e, [-6, -3]), M.add(S.head, [10, -1.5]), 'linha reta', [S.head[0] - 30, S.head[1] - 18]),
    info: INFO(
      ['Antebraços no chão, cotovelos alinhados embaixo dos ombros.', 'Pés juntos, apoiado na ponta dos pés.'],
      ['Contraia abdômen e glúteos e "empurre" o chão com os antebraços.', 'Mantenha cabeça, quadril e calcanhares na mesma linha.'],
      'Respire curto e contínuo — não prenda o ar.',
      ['Quadril caído (sobrecarrega a lombar)', 'Quadril muito alto', 'Olhar para a frente (pescoço tenso)']
    )
  });

  /* =================================================================
     TERÇA — COSTAS & BÍCEPS
     ================================================================= */
  def('puxada_frontal', {
    name: 'Puxada frontal (pulldown)', view: 'back', dur: 3.4, cam: [160, 116, 1],
    pri: ['lats'], sec: ['midback', 'delts_rear', 'biceps'], trace: 'hR',
    bend: { a: 1, l: -1 },
    keys: [
      K(0, { hip: [160, 152], a: [195, 54], l: { p: [173, 200], s: [0.25, 1] }, e: 0.35 }, 'Braços estendidos, peito aberto'),
      K(0.08, {}, 'Puxe a barra até o peito · 1s'),
      K(0.4, { a: [198, 99], e: 1 }, 'Cotovelos para baixo, aperte as costas'),
      K(0.5, { e: 0.9 }, 'Suba controlando · 2s'),
      K(0.94, { a: [195, 54], e: 0.4 })
    ],
    back: (g, S) => {
      Dr.column(g, 160, 4, 24);
      Dr.tube(g, [110, 6], [210, 6], 4);
      Dr.pulley(g, [160, 10], 5);
      const hy = (S.arm.R.e[1] + S.arm.L.e[1]) / 2;
      Dr.cable(g, [160, 10], [160, hy]);
      const l = S.arm.L.e, r = S.arm.R.e;
      g.beginPath();
      g.moveTo(l[0] - 16, l[1] + 4); g.quadraticCurveTo(l[0] - 6, l[1], 160, hy); g.quadraticCurveTo(r[0] + 6, r[1], r[0] + 16, r[1] + 4);
      g.lineWidth = 4.2; g.strokeStyle = COL.metalDk; g.lineCap = 'round'; g.stroke();
      g.lineWidth = 2.6; g.strokeStyle = COL.metalHi; g.stroke();
    },
    mid: g => seatBlock(g, 132, 188, 158),
    info: INFO(
      ['Sente com as coxas travadas sob o apoio e pegada um pouco mais aberta que os ombros.', 'Incline o tronco levemente para trás (~10°) e estufe o peito.'],
      ['Puxe a barra até a parte de cima do peito levando os cotovelos para baixo e para trás.', 'Pense em "colocar os cotovelos no bolso".', 'Suba devagar até esticar os braços.'],
      'Solte o ar ao puxar, inspire ao subir.',
      ['Puxar atrás da nuca', 'Balançar o tronco para ajudar', 'Encolher os ombros perto das orelhas']
    )
  });

  def('remada_curvada', {
    name: 'Remada curvada com barra', view: 'side', dur: 3.2, cam: [152, 130, 1],
    imp: { type: 'bb', r: 17 }, pri: ['lats', 'midback'], sec: ['biceps', 'delts_rear', 'lowerback'], trace: 'hn',
    keys: [
      K(0, { hip: [128, 136], th: 62, hd: -16, a: [171, 168], l: [156, 208], e: 0.45 }, 'Tronco inclinado, coluna neutra'),
      K(0.08, {}, 'Puxe a barra até o umbigo · 1s'),
      K(0.4, { a: [154, 137], e: 1 }, 'Esmague as escápulas'),
      K(0.5, { e: 0.9 }, 'Desça controlando · 2s'),
      K(0.94, { a: [171, 168], e: 0.45 })
    ],
    info: INFO(
      ['Pés na largura do quadril, joelhos levemente flexionados.', 'Incline o tronco à frente (entre 30° e 45° acima do chão) com a coluna reta.', 'Pegada pronada um pouco mais aberta que os ombros.'],
      ['Puxe a barra em direção ao umbigo levando os cotovelos para trás.', 'Junte as escápulas no topo e desça devagar.'],
      'Solte o ar ao puxar.',
      ['Arredondar as costas', 'Levantar o tronco a cada repetição', 'Puxar com o pescoço/trapézio']
    )
  });

  def('remada_sentada', {
    name: 'Remada sentada na polia (triângulo)', view: 'side', dur: 3.4, cam: [162, 140, 1],
    pri: ['midback', 'lats'], sec: ['biceps', 'delts_rear'], trace: 'hn',
    keys: [
      K(0, { hip: [110, 170], th: 20, hd: -4, a: [181, 131], l: { p: [186, 163], fa: -80 }, e: 0.4 }, 'Braços estendidos, coluna alta'),
      K(0.08, {}, 'Puxe o triângulo até o abdômen · 1s'),
      K(0.42, { th: -4, a: [121, 148], e: 1 }, 'Peito para fora, cotovelos para trás'),
      K(0.52, { e: 0.9 }, 'Estenda os braços devagar · 2s'),
      K(0.94, { th: 20, a: [181, 131], e: 0.45 })
    ],
    back: (g, S) => {
      const p = [202, 166];
      columnStack(g, 250, 104, cableLift(S.arm.n.e, p, 30, 0.35));
      Dr.tube(g, [194, 186], [250, 186], 3.5);
      Dr.pulley(g, p);
      Dr.cable(g, p, S.arm.n.e);
    },
    mid: g => {
      Dr.bench(g, 66, 146, 176, { legs: [80, 132] });
      Dr.tube(g, [193, 150], [196, G - 3], 3.5);
      Dr.pad(g, [195, 183], [190, 146], 6);
    },
    front: (g, S) => {
      const h = S.arm.n.e, p = [202, 166];
      const u = M.norm(M.sub(p, h)), pr = [-u[1], u[0]];
      Dr.poly(g, [M.add(h, pr, 4), M.add(h, pr, -4), M.add(h, u, 8)], null, COL.metalHi, 1.6);
    },
    info: INFO(
      ['Sente com os pés no apoio e joelhos levemente dobrados.', 'Coluna ereta, peito aberto, ombros relaxados.'],
      ['Puxe o triângulo até a altura do umbigo, levando os cotovelos para trás e rente ao corpo.', 'Aperte as escápulas e volte estendendo os braços, deixando os ombros irem à frente sem curvar a lombar.'],
      'Solte o ar na puxada.',
      ['Jogar o tronco para trás para puxar', 'Arredondar a lombar na volta', 'Encolher os ombros']
    )
  });

  def('face_pull', {
    name: 'Face pull na polia', view: 'side', dur: 3, cam: [178, 116, 1],
    pri: ['delts_rear', 'midback'], sec: ['traps'], trace: 'hn',
    bend: { a: -1 },
    keys: [
      K(0, { hip: [140, 127], th: -3, hd: 0, a: { p: [190, 74], s: [1, 1] }, l: [142, 208], b: { a: -0.25 }, e: 0.4 }, 'Braços estendidos na altura do rosto'),
      K(0.08, {}, 'Puxe a corda em direção à testa · 1s'),
      K(0.42, { a: { p: [153, 62], s: [0.48, 0.86] }, b: { a: -1 }, e: 1 }, 'Cotovelos altos, abra a corda'),
      K(0.52, { e: 0.9 }, 'Volte controlando · 2s'),
      K(0.94, { a: { p: [190, 74], s: [1, 1] }, b: { a: -0.25 }, e: 0.4 })
    ],
    back: (g, S) => {
      const p = [240, 66];
      columnStack(g, 256, 20, cableLift(S.arm.n.e, p, 50, 0.4));
      Dr.tube(g, [248, 66], [256, 66], 3);
      Dr.pulley(g, p);
      Dr.cable(g, p, S.arm.n.e);
    },
    front: (g, S) => Dr.rope(g, S.arm.n.e, [240, 66]),
    info: INFO(
      ['Polia na altura do rosto, pegada na corda com as palmas para baixo.', 'Dê um passo para trás, peito aberto e abdômen firme.'],
      ['Puxe a corda em direção à testa abrindo as mãos para os lados das orelhas.', 'Cotovelos altos, na linha dos ombros, e gire os braços para trás no final.'],
      'Solte o ar ao puxar.',
      ['Cotovelos baixos (vira remada)', 'Jogar o corpo para trás', 'Usar carga pesada demais']
    )
  });

  def('rosca_direta', {
    name: 'Rosca direta com barra', view: 'side', dur: 3, cam: [160, 120, 1],
    imp: { type: 'bb', r: 15 }, pri: ['biceps'], sec: ['forearms'], trace: 'hn',
    keys: [
      K(0, { hip: [152, 127], th: 1, a: { k: [-3, 6] }, l: [154, 208], e: 0.4 }, 'Cotovelos colados, braços estendidos'),
      K(0.08, {}, 'Suba a barra sem balançar · 1s'),
      K(0.4, { a: { k: [7, 135] }, e: 1 }, 'Contraia o bíceps no topo'),
      K(0.5, { e: 0.9 }, 'Desça devagar · 2s'),
      K(0.94, { a: { k: [-3, 6] }, e: 0.4 })
    ],
    info: INFO(
      ['Em pé, pés na largura do quadril, pegada supinada na largura dos ombros.', 'Cotovelos ao lado do tronco, abdômen firme.'],
      ['Suba a barra dobrando só os cotovelos até perto dos ombros.', 'Desça devagar até quase estender os braços.'],
      'Solte o ar ao subir.',
      ['Balançar o tronco (roubar)', 'Levar os cotovelos para a frente', 'Soltar a barra na descida']
    )
  });

  def('rosca_martelo', {
    name: 'Rosca martelo com halteres', view: 'side', dur: 5, cam: [160, 120, 1],
    imp: { type: 'db', grip: 'side', r: 6.5 }, pri: ['biceps', 'forearms'], sec: [], trace: 'hn',
    farPhase: 0.5,
    keys: [
      K(0, { hip: [152, 127], th: 1, an: { k: [-2, 4] }, l: [154, 208], e: 0.4 }, 'Pegada neutra (palmas para dentro)'),
      K(0.04, {}, 'Suba um braço · 1s'),
      K(0.2, { an: { k: [6, 130] }, e: 1 }, 'Aperte no topo'),
      K(0.26, {}, 'Desça controlando · 1,5s'),
      K(0.48, { an: { k: [-2, 4] }, e: 0.45 }, 'Alterne para o outro braço')
    ],
    info: INFO(
      ['Em pé com um halter em cada mão, palmas voltadas para o corpo.', 'Cotovelos colados ao tronco.'],
      ['Suba o halter mantendo a pegada neutra (como um martelo).', 'Alterne os braços, sempre descendo devagar.'],
      'Solte o ar ao subir.',
      ['Girar o punho', 'Balançar o corpo', 'Levantar o cotovelo à frente']
    )
  });

  /* =================================================================
     QUARTA — PERNAS (QUADRÍCEPS)
     ================================================================= */
  const barOnBack = S => M.add(M.add(S.end, S.n, -8), S.d, -3);
  def('agachamento', {
    name: 'Agachamento livre com barra', view: 'side', dur: 3.8, cam: [150, 130, 1],
    imp: { type: 'bb', r: 18, at: barOnBack }, pri: ['quads', 'glutes'], sec: ['hamstrings', 'lowerback', 'abs'], trace: barOnBack,
    bend: { a: -1, l: -1 },
    keys: [
      K(0, { hip: [156, 126], th: 3, hd: -4, a: { t: [1, -6] }, l: { p: [148, 208], fa: 0 }, e: 0.35 }, 'Pés na largura dos ombros, abdômen firme'),
      K(0.08, {}, 'Desça sentando para trás · 2s'),
      K(0.5, { hip: [129, 174], th: 42, hd: -20, e: 0.85 }, 'Coxas paralelas ao chão'),
      K(0.58, { e: 0.9 }, 'Suba empurrando o chão · 1s'),
      K(0.88, { hip: [156, 126], th: 3, hd: -4, e: 1 })
    ],
    back: g => guideLine(g, [152, 46], [152, G], 'barra alinhada ao meio do pé', [184, 200]),
    info: INFO(
      ['Barra apoiada no trapézio (não no pescoço), pés na largura dos ombros e pontas levemente para fora.', 'Respire fundo e trave o abdômen antes de descer.'],
      ['Desça empurrando o quadril para trás e os joelhos para fora, na direção dos pés.', 'Vá até as coxas ficarem paralelas ao chão, mantendo o calcanhar no chão.', 'Suba empurrando o chão, sem deixar os joelhos entrarem.'],
      'Inspire e segure em cima; solte o ar passando o ponto mais difícil da subida.',
      ['Joelhos para dentro', 'Tirar o calcanhar do chão', 'Arredondar a lombar no fundo']
    )
  });

  const LP_U = M.norm([0.77, -0.64]);
  def('leg_press', {
    name: 'Leg press 45°', view: 'side', dur: 3.6, cam: [156, 136, 1],
    pri: ['quads', 'glutes'], sec: ['hamstrings'], trace: 'an',
    keys: [
      K(0, { hip: [118, 178], th: -60, hd: 12, a: [126, 174], l: { p: [173, 122], fa: -130 }, e: 0.4 }, 'Lombar e quadril colados no encosto'),
      K(0.08, {}, 'Desça até ~90° nos joelhos · 2s'),
      K(0.52, { l: { p: [152, 140], fa: -130 }, e: 0.85 }, 'Não deixe o quadril descolar'),
      K(0.6, { e: 0.9 }, 'Empurre com o pé inteiro · 1s'),
      K(0.9, { l: { p: [173, 122], fa: -130 }, e: 1 })
    ],
    back: g => {
      const r0 = [144, 176], r1 = M.add(r0, LP_U, 150);
      Dr.tube(g, r0, r1, 5);
      Dr.tube(g, M.add(r0, LP_U, 20), [M.add(r0, LP_U, 20)[0], G - 3], 4);
      Dr.tube(g, M.add(r1, LP_U, -8), [M.add(r1, LP_U, -8)[0], G - 3], 4);
      Dr.tube(g, [60, G - 2], [r1[0] + 4, G - 2], 3.5);
    },
    mid: (g, S) => {
      // assento + encosto
      const hip = [118, 178], th = -60, d = M.dirT(th), n = M.nrmT(th);
      const a = M.add(M.add(hip, d, -4), n, -13), b = M.add(M.add(hip, d, 74), n, -13);
      Dr.tube(g, M.add(a, [10, 4]), [a[0] + 8, G - 3], 4);
      Dr.pad(g, a, b, 7.5);
      Dr.pad(g, [104, 190], [146, 181], 7);
      // plataforma (trenó)
      const ak = S.leg.n.e;
      const v = [Math.cos(-130 * D), Math.sin(-130 * D)];
      const c = M.add(M.add(ak, LP_U, 6.6), v, 3);
      Dr.pad(g, M.add(c, v, -22), M.add(c, v, 20), 6, '#1E2E52');
      const back1 = M.add(M.add(c, LP_U, 4), v, -20), back2 = M.add(M.add(c, LP_U, 4), v, 18);
      const sled1 = M.add(back1, LP_U, 16), sled2 = M.add(back2, LP_U, 16);
      Dr.poly(g, [back1, back2, sled2, sled1], '#142038', 'rgba(120,150,200,0.45)', 1);
      Dr.plate(g, M.add(M.add(c, LP_U, 22), v, -10), 11, 0.9);
    },
    betweenLimbs: (g, S) => Dr.line(g, [120, 170], [132, 170], 3, COL.metalHi),
    info: INFO(
      ['Costas e quadril bem apoiados no encosto.', 'Pés no meio da plataforma, na largura dos ombros.'],
      ['Destrave e desça a plataforma dobrando os joelhos até cerca de 90°.', 'Empurre com o pé inteiro (força no calcanhar) até quase estender, sem travar os joelhos.'],
      'Inspire na descida, expire ao empurrar.',
      ['Descer tanto que o quadril sai do encosto', 'Travar os joelhos no final', 'Joelhos fechando para dentro']
    )
  });

  def('cadeira_extensora', {
    name: 'Cadeira extensora', view: 'side', dur: 3, cam: [168, 140, 1],
    pri: ['quads'], sec: [], trace: 'an',
    keys: [
      K(0, { hip: [138, 146], th: -12, hd: 6, a: [140, 152], l: { k: [88, -88] }, e: 0.4 }, 'Joelho alinhado ao eixo da máquina'),
      K(0.08, {}, 'Estenda as pernas · 1s'),
      K(0.36, { l: { k: [88, -4] }, e: 1 }, 'Segure 1s contraindo o quadríceps'),
      K(0.5, { e: 0.95 }, 'Desça devagar · 2s'),
      K(0.94, { l: { k: [88, -88] }, e: 0.4 })
    ],
    back: (g, S) => {
      const kn = S.leg.n.j, an = S.leg.n.e;
      const u = M.norm(M.sub(an, kn)), ant = M.antL(u);
      const roll = M.add(an, ant, 7);
      Dr.tube(g, kn, M.add(roll, u, 2), 4);
      Dr.circ(g, kn, 6, COL.metalDk, COL.metalHi, 1.2);
      // encosto + assento + base
      const hip = [138, 146], d = M.dirT(-12), n = M.nrmT(-12);
      Dr.tube(g, [146, 158], [146, G - 3], 6);
      Dr.tube(g, [108, G - 2], [196, G - 2], 3.5);
      Dr.tube(g, [176, 156], [186, G - 3], 4);
      Dr.pad(g, M.add(M.add(hip, d, -2), n, -13), M.add(M.add(hip, d, 62), n, -13), 7.5);
      Dr.pad(g, [106, 157], [178, 157], 7.5);
    },
    front: (g, S) => {
      const kn = S.leg.n.j, an = S.leg.n.e;
      const u = M.norm(M.sub(an, kn)), ant = M.antL(u);
      Dr.circ(g, M.add(an, ant, 7), 6, 'rgba(26,40,70,0.85)', COL.padHi, 1.3);
    },
    info: INFO(
      ['Ajuste o encosto para o joelho ficar alinhado ao eixo da máquina.', 'Rolo apoiado logo acima do tornozelo; segure as alças laterais.'],
      ['Estenda os joelhos até as pernas ficarem retas e segure 1s.', 'Desça devagar, sem deixar o peso bater.'],
      'Solte o ar ao estender.',
      ['Tirar o quadril do banco', 'Chutar o peso com impulso', 'Descer rápido']
    )
  });

  def('mesa_flexora', {
    name: 'Mesa flexora', view: 'side', dur: 3, cam: [142, 140, 1],
    pri: ['hamstrings'], sec: ['calves'], trace: 'an',
    bend: { a: 1 },
    keys: [
      K(0, { hip: [128, 157], th: 92, hd: -12, a: [206, 177], l: { k: [-88, 0] }, e: 0.4 }, 'Deitado de bruços, quadril colado no banco'),
      K(0.08, {}, 'Flexione os joelhos · 1s'),
      K(0.42, { l: { k: [-88, -105] }, e: 1 }, 'Traga o rolo perto do glúteo'),
      K(0.52, { e: 0.95 }, 'Estenda devagar · 2s'),
      K(0.94, { l: { k: [-88, 0] }, e: 0.4 })
    ],
    back: (g, S) => {
      const kn = S.leg.n.j, an = S.leg.n.e;
      const u = M.norm(M.sub(an, kn)), post = M.antL(u).map(v => -v);
      Dr.tube(g, kn, M.add(an, post, 7), 4);
      Dr.circ(g, kn, 6, COL.metalDk, COL.metalHi, 1.2);
      Dr.bench(g, 92, 232, 164, { legs: [112, 214] });
      Dr.tube(g, [206, 172], [206, 186], 3);
      Dr.line(g, [200, 186], [212, 186], 3, COL.metalHi);
    },
    front: (g, S) => {
      const kn = S.leg.n.j, an = S.leg.n.e;
      const u = M.norm(M.sub(an, kn)), post = M.antL(u).map(v => -v);
      Dr.circ(g, M.add(an, post, 7), 6, 'rgba(26,40,70,0.85)', COL.padHi, 1.3);
    },
    info: INFO(
      ['Deite de bruços com os joelhos logo fora do banco e o rolo acima dos calcanhares.', 'Quadril pressionado contra o banco.'],
      ['Flexione os joelhos trazendo o rolo em direção ao glúteo.', 'Volte devagar até quase estender as pernas.'],
      'Solte o ar ao flexionar.',
      ['Levantar o quadril do banco', 'Usar impulso', 'Descer o peso sem controle']
    )
  });

  def('panturrilha_em_pe', {
    name: 'Panturrilha em pé (máquina)', view: 'side', dur: 2.6, cam: [166, 120, 1],
    pri: ['calves'], sec: [], trace: 'an',
    bend: { a: 1, l: -1 },
    keys: [
      K(0, { hip: [166, 116], th: 2, hd: -2, a: { t: [-12, 20] }, l: { p: [168.2, 196.5], fa: -25 }, e: 0.5 }, 'Ponta dos pés na borda, calcanhar para baixo'),
      K(0.1, {}, 'Suba o máximo que puder · 1s'),
      K(0.42, { hip: [167.8, 102.6], l: { p: [169.8, 183], fa: 38 }, e: 1 }, 'Segure 1s no topo'),
      K(0.54, { e: 0.95 }, 'Desça alongando · 1,5s'),
      K(0.92, { hip: [166, 116], l: { p: [168.2, 196.5], fa: -25 }, e: 0.5 })
    ],
    back: (g, S) => {
      Dr.column(g, 120, 30, 16);
      const pad = M.add(S.end, S.d, 3);
      Dr.tube(g, [120, pad[1] - 2], [pad[0] - 6, pad[1] - 2], 4);
      Dr.rr(g, 174, 193.5, 58, G - 193.5, 2, '#17233D', 'rgba(120,150,200,0.5)', 1);
    },
    afterTorso: (g, S) => {
      const pad = M.add(S.end, S.d, 3);
      Dr.pad(g, [pad[0] - 9, pad[1] - 2], [pad[0] + 12, pad[1] - 2], 7, '#1E2E52');
    },
    info: INFO(
      ['Ombros sob as almofadas e só a ponta dos pés na plataforma.', 'Joelhos estendidos, mas sem travar.'],
      ['Desça o calcanhar o máximo possível para alongar.', 'Suba na ponta dos pés o mais alto que puder e segure 1s.'],
      'Respire de forma contínua.',
      ['Movimento curto (só "quicar")', 'Dobrar os joelhos para ajudar', 'Rodar os tornozelos para fora']
    )
  });

  def('elevacao_pernas', {
    name: 'Elevação de pernas deitado', view: 'side', dur: 3.2, cam: [168, 168, 1.15],
    pri: ['abs'], sec: ['obliques'], trace: 'an',
    bend: { a: -1 },
    keys: [
      K(0, { hip: [165, 204], th: -90, hd: 6, a: [170, 206], l: { k: [96, -3] }, e: 0.5 }, 'Lombar colada no chão, pernas quase estendidas'),
      K(0.08, {}, 'Suba as pernas até 90° · 1s'),
      K(0.42, { hip: [165, 202.5], l: { k: [172, -6] }, e: 1 }, 'Tire levemente o quadril do chão'),
      K(0.5, { e: 0.9 }, 'Desça devagar sem encostar · 2s'),
      K(0.94, { hip: [165, 204], l: { k: [96, -3] }, e: 0.5 })
    ],
    back: g => Dr.mat(g, 70, 270),
    info: INFO(
      ['Deitado de barriga para cima, mãos ao lado do corpo ou sob o glúteo.', 'Pressione a lombar contra o chão.'],
      ['Suba as pernas juntas até ficarem na vertical, enrolando um pouco o quadril no final.', 'Desça devagar até quase tocar o chão e repita.'],
      'Solte o ar ao subir as pernas.',
      ['Arquear a lombar na descida', 'Usar impulso', 'Bater os pés no chão']
    )
  });

  /* =================================================================
     QUINTA — PEITO SUPERIOR, OMBROS & TRÍCEPS
     ================================================================= */
  def('supino_inclinado_barra', {
    name: 'Supino inclinado com barra', view: 'side', dur: 3.6, cam: [150, 130, 1.05],
    imp: { type: 'bb', r: 17 }, pri: ['chest'], sec: ['delts_front', 'triceps'], trace: 'hn',
    keys: [
      K(0, { hip: [168, 150], th: -50, hd: 4, a: [134, 66], l: { p: [214, 208], fa: 0 }, e: 0.35 }, 'Barra travada acima do peito superior'),
      K(0.1, {}, 'Desça até a parte alta do peito · 2s'),
      K(0.56, { a: [147, 112], e: 0.75 }, 'Toque leve, sem quicar'),
      K(0.64, { e: 0.85 }, 'Empurre para cima · 1s'),
      K(0.9, { a: [134, 66], e: 1 })
    ],
    back: g => rackPost(g, 104, 50, 62),
    mid: g => inclineBench(g, [168, 150], -50),
    info: INFO(
      ['Banco a 30°–45°, olhos abaixo da barra.', 'Escápulas encaixadas, pés firmes, pegada um pouco mais aberta que os ombros.'],
      ['Desça a barra até a parte alta do peito (abaixo da clavícula).', 'Empurre na vertical até estender os braços.'],
      'Inspire na descida, expire na subida.',
      ['Descer a barra no pescoço', 'Tirar o quadril do banco', 'Cotovelos totalmente abertos']
    )
  });

  def('desenvolvimento_halteres', {
    name: 'Desenvolvimento com halteres (sentado)', view: 'front', dur: 3.4, cam: [160, 114, 1],
    imp: { type: 'db', grip: 'h', r: 6.5 }, pri: ['delts_front', 'delts_side'], sec: ['triceps', 'traps'], trace: 'hR',
    bend: { a: 1, l: -1 },
    keys: [
      K(0, { hip: [160, 160], a: [193, 92], l: { p: [184, 206], s: [0.32, 1] }, e: 0.45 }, 'Halteres na altura das orelhas'),
      K(0.08, {}, 'Empurre para cima · 1s'),
      K(0.42, { a: [185, 58], e: 1 }, 'Quase encostando os halteres no topo'),
      K(0.52, { e: 0.9 }, 'Desça controlando · 2s'),
      K(0.94, { a: [193, 92], e: 0.45 })
    ],
    back: g => {
      Dr.rr(g, 141, 58, 38, 110, 6, '#15223F', 'rgba(120,160,230,0.45)', 1.1);
      Dr.tube(g, [160, 168], [160, G - 3], 5);
      Dr.tube(g, [130, G - 2], [190, G - 2], 3.5);
    },
    mid: g => Dr.pad(g, [130, 166], [190, 166], 8),
    info: INFO(
      ['Banco com encosto a 80°–90°, costas apoiadas.', 'Halteres na altura das orelhas, cotovelos levemente à frente do corpo.'],
      ['Empurre os halteres para cima até quase estender os braços, aproximando-os no topo.', 'Desça devagar até a altura das orelhas.'],
      'Solte o ar ao empurrar.',
      ['Arquear a lombar', 'Descer pouco (meia repetição)', 'Bater os halteres']
    )
  });

  def('elevacao_lateral', {
    name: 'Elevação lateral com halteres', view: 'front', dur: 3, cam: [160, 114, 1],
    imp: { type: 'db', grip: 'end', r: 6.5 }, pri: ['delts_side'], sec: ['traps', 'delts_front'], trace: 'hR',
    keys: [
      K(0, { hip: [160, 127], a: { k: [10, -8] }, l: [172, 208], e: 0.4 }, 'Cotovelos semiflexionados, ombros baixos'),
      K(0.08, {}, 'Eleve os braços pelas laterais · 1s'),
      K(0.42, { a: { k: [86, -10] }, e: 1 }, 'Até a altura dos ombros'),
      K(0.52, { e: 0.9 }, 'Desça devagar · 2s'),
      K(0.94, { a: { k: [10, -8] }, e: 0.4 })
    ],
    info: INFO(
      ['Em pé, halteres ao lado do corpo, leve inclinação do tronco à frente.', 'Cotovelos levemente dobrados e fixos.'],
      ['Eleve os braços pelas laterais até a altura dos ombros, "puxando com os cotovelos".', 'Desça devagar resistindo ao peso.'],
      'Solte o ar ao subir.',
      ['Subir acima dos ombros', 'Encolher o trapézio', 'Balançar o tronco']
    )
  });

  def('voador', {
    name: 'Voador (peck deck)', view: 'front', dur: 3.2, cam: [160, 114, 1],
    pri: ['chest'], sec: ['delts_front'], trace: 'hR',
    keys: [
      K(0, { hip: [160, 160], a: { k: [90, 90], s: [1, 1] }, l: { p: [184, 206], s: [0.32, 1] }, e: 0.4 }, 'Cotovelos na altura dos ombros'),
      K(0.08, {}, 'Feche os braços à frente · 1s'),
      K(0.42, { a: { k: [90, 90], s: [-0.38, 1] }, e: 1 }, 'Aperte o peito no centro'),
      K(0.52, { e: 0.9 }, 'Abra devagar · 2s'),
      K(0.94, { a: { k: [90, 90], s: [1, 1] }, e: 0.4 })
    ],
    back: g => {
      Dr.rr(g, 141, 60, 38, 108, 6, '#15223F', 'rgba(120,160,230,0.45)', 1.1);
      Dr.tube(g, [160, 30], [160, 60], 5);
      Dr.tube(g, [118, 30], [202, 30], 4);
      Dr.tube(g, [160, 168], [160, G - 3], 5);
      Dr.tube(g, [130, G - 2], [190, G - 2], 3.5);
    },
    mid: g => Dr.pad(g, [130, 166], [190, 166], 8),
    front: (g, S) => {
      for (const sd of ['L', 'R']) {
        const A = S.arm[sd];
        g.save(); g.globalAlpha = 0.82;
        Dr.pad(g, M.add(A.j, [0, 5]), M.add(A.e, [0, -6]), 9, '#1E2E52');
        g.restore();
        Dr.tube(g, M.add(A.e, [0, -6]), [A.e[0] + (sd === 'R' ? 8 : -8), 30], 2.6);
      }
    },
    info: INFO(
      ['Ajuste o banco para os cotovelos ficarem na altura dos ombros.', 'Antebraços apoiados nas almofadas, costas coladas no encosto.'],
      ['Feche os braços à frente do peito, apertando o peitoral no centro.', 'Abra devagar até sentir o peito alongar, sem passar da linha do corpo.'],
      'Solte o ar ao fechar.',
      ['Afastar as costas do encosto', 'Abrir demais os braços', 'Usar impulso']
    )
  });

  def('triceps_testa', {
    name: 'Tríceps testa com barra W', view: 'side', dur: 3.2, cam: [150, 128, 1.05],
    imp: { type: 'bb', r: 13 }, pri: ['triceps'], sec: [], trace: 'hn',
    keys: [
      K(0, { hip: [170, 142], th: -90, a: { k: [192, 0] }, l: { p: [196, 208], fa: 2 }, e: 0.4 }, 'Braços estendidos, levemente inclinados para trás'),
      K(0.08, {}, 'Flexione só os cotovelos · 2s'),
      K(0.5, { a: { k: [192, 106] }, e: 0.8 }, 'Barra perto da testa'),
      K(0.58, { e: 0.85 }, 'Estenda os cotovelos · 1s'),
      K(0.9, { a: { k: [192, 0] }, e: 1 })
    ],
    mid: g => Dr.bench(g, 60, 206, 150),
    info: INFO(
      ['Deitado no banco reto, barra W com pegada fechada.', 'Braços estendidos acima da testa, levemente inclinados para trás.'],
      ['Dobre os cotovelos descendo a barra em direção à testa/topo da cabeça.', 'Estenda de volta mantendo os cotovelos apontando para cima.'],
      'Inspire na descida, expire ao estender.',
      ['Abrir os cotovelos', 'Mover os ombros junto', 'Descer rápido perto do rosto']
    )
  });

  def('abdominal_bicicleta', {
    name: 'Abdominal bicicleta', view: 'side', dur: 2.6, cam: [158, 174, 1.2],
    pri: ['abs', 'obliques'], sec: [], farPhase: 0.5, trace: 'an',
    bend: { a: 1 },
    keys: [
      K(0, { hip: [165, 204], th: -88, cu: 38, hd: 10, a: { t: [15, -7], s: [0.62, 0.72] }, ln: { k: [205, -95] }, e: 1 }, 'Ombros fora do chão, mãos atrás da cabeça'),
      K(0.12, {}, 'Leve o cotovelo ao joelho oposto'),
      K(0.5, { ln: { k: [100, -5] }, e: 0.75 }, 'Alterne os lados, como pedalando'),
      K(0.62, {})
    ],
    back: g => Dr.mat(g, 70, 270),
    info: INFO(
      ['Deitado, mãos atrás da cabeça sem puxar o pescoço.', 'Tire os ombros do chão e mantenha a lombar apoiada.'],
      ['Leve um joelho ao peito enquanto estende a outra perna.', 'Gire o tronco levando o cotovelo em direção ao joelho que sobe e alterne.'],
      'Solte o ar a cada giro.',
      ['Puxar a cabeça com as mãos', 'Fazer rápido sem girar o tronco', 'Encostar os ombros no chão']
    )
  });

  /* =================================================================
     SEXTA — COSTAS & BRAÇOS
     ================================================================= */
  def('barra_fixa', {
    name: 'Barra fixa (pegada aberta)', view: 'back', dur: 3.4, cam: [160, 116, 1],
    pri: ['lats'], sec: ['biceps', 'midback', 'delts_rear'], trace: 'head',
    keys: [
      K(0, { hip: [160, 121], a: [200, 24], l: { p: [166, 195], s: [1, 0.85] }, e: 0.45 }, 'Pendurado, braços estendidos, ombros ativos'),
      K(0.08, {}, 'Puxe o peito em direção à barra · 1s'),
      K(0.42, { hip: [160, 80], l: { p: [166, 154], s: [1, 0.85] }, e: 1 }, 'Queixo acima da barra'),
      K(0.5, { e: 0.9 }, 'Desça controlando · 2s'),
      K(0.94, { hip: [160, 121], l: { p: [166, 195], s: [1, 0.85] }, e: 0.45 })
    ],
    back: g => {
      for (const x of [58, 262]) { Dr.tube(g, [x, 16], [x, G - 3], 5); Dr.tube(g, [x - 12, G - 2], [x + 12, G - 2], 3.5); }
      Dr.tube(g, [58, 22], [262, 22], 4);
    },
    info: INFO(
      ['Pegada pronada um pouco mais aberta que os ombros.', 'Comece pendurado com os ombros "encaixados" (puxe-os levemente para baixo). Se não completar as repetições, use a máquina graviton ou elástico.'],
      ['Puxe levando o peito em direção à barra e os cotovelos para baixo.', 'Passe o queixo da barra e desça devagar até estender os braços.'],
      'Solte o ar ao subir.',
      ['Balançar o corpo (kipping)', 'Meia repetição', 'Encolher os ombros']
    )
  });

  def('remada_unilateral', {
    name: 'Remada unilateral com halter (serrote)', view: 'side', dur: 3.2, cam: [148, 138, 1],
    imp: { type: 'db', grip: 'side', r: 7, only: 'n' }, pri: ['lats', 'midback'], sec: ['biceps', 'delts_rear'], trace: 'hn',
    bend: { a: 1 },
    keys: [
      K(0, { hip: [125, 126], th: 78.5, hd: -12, an: [172, 170], af: [178, 167], ln: [136, 207], lf: { k: [-18, -72], fa: 165 }, e: 0.45 }, 'Joelho e mão apoiados, costas retas'),
      K(0.08, {}, 'Puxe o halter em direção ao quadril · 1s'),
      K(0.42, { an: [140, 130], e: 1 }, 'Cotovelo passa da linha das costas'),
      K(0.52, { e: 0.9 }, 'Desça alongando · 2s'),
      K(0.94, { an: [172, 170], e: 0.45 })
    ],
    back: g => Dr.bench(g, 64, 204, 170, { legs: [84, 186] }),
    info: INFO(
      ['Apoie o joelho e a mão do mesmo lado no banco; a outra perna fica no chão.', 'Costas retas, paralelas ao chão, olhar para baixo.'],
      ['Puxe o halter em direção ao quadril, levando o cotovelo para trás e rente ao corpo.', 'Desça até estender o braço e sentir a dorsal alongar.'],
      'Solte o ar ao puxar.',
      ['Girar o tronco para subir o peso', 'Puxar com o bíceps (cotovelo aberto)', 'Arredondar as costas']
    )
  });

  def('pulldown_braco_estendido', {
    name: 'Pulldown com braços estendidos', view: 'side', dur: 3, cam: [172, 116, 1],
    pri: ['lats'], sec: ['triceps', 'delts_rear'], trace: 'hn',
    keys: [
      K(0, { hip: [135, 128], th: 28, hd: -10, a: { k: [145, 10] }, l: [148, 208], e: 0.4 }, 'Tronco inclinado, braços quase retos'),
      K(0.08, {}, 'Leve a barra até as coxas em arco · 1s'),
      K(0.42, { a: { k: [14, 8] }, e: 1 }, 'Contraia as dorsais'),
      K(0.52, { e: 0.9 }, 'Volte devagar · 2s'),
      K(0.94, { a: { k: [145, 10] }, e: 0.4 })
    ],
    back: (g, S) => {
      const p = [230, 22];
      columnStack(g, 246, 12, cableLift(S.arm.n.e, p, 50, 0.3));
      Dr.tube(g, [238, 16], [246, 16], 3);
      Dr.pulley(g, p);
      Dr.cable(g, p, S.arm.n.e);
    },
    front: (g, S) => { Dr.circ(g, S.arm.n.e, 3, COL.metalHi, COL.metalDk, 1); },
    info: INFO(
      ['De frente para a polia alta, barra reta, pegada na largura dos ombros.', 'Dê um passo para trás e incline o tronco ~30° à frente.'],
      ['Com os braços quase retos, traga a barra em arco até as coxas.', 'Volte devagar até sentir as dorsais alongarem.'],
      'Solte o ar ao descer a barra.',
      ['Dobrar os cotovelos (vira tríceps)', 'Mover o tronco', 'Encolher os ombros']
    )
  });

  def('rosca_scott', {
    name: 'Rosca Scott com barra W', view: 'side', dur: 3, cam: [150, 134, 1],
    imp: { type: 'bb', r: 13 }, pri: ['biceps'], sec: ['forearms'], trace: 'hn',
    keys: [
      K(0, { hip: [112, 160], th: 18, hd: 8, a: { k: [42, 22] }, l: { p: [156, 208], fa: 0 }, e: 0.45 }, 'Axilas apoiadas no topo do banco'),
      K(0.08, {}, 'Suba a barra · 1s'),
      K(0.42, { a: { k: [42, 125] }, e: 1 }, 'Contraia sem tirar o braço do apoio'),
      K(0.52, { e: 0.9 }, 'Desça até quase estender · 2s'),
      K(0.94, { a: { k: [42, 22] }, e: 0.45 })
    ],
    afterTorso: g => {
      const sj = [126.5, 115.3], u = M.dirK(42), post = [-u[1], u[0]];
      const A = M.add(M.add(sj, u, 1), post, 10.2), B = M.add(M.add(sj, u, 38), post, 10.2);
      Dr.tube(g, M.add(A, M.sub(B, A), 0.55), [150, G - 3], 5);
      Dr.tube(g, [110, G - 2], [176, G - 2], 3.5);
      Dr.pad(g, A, B, 9);
      seatBlock(g, 92, 130, 167);
    },
    info: INFO(
      ['Sente com as axilas encostadas no topo do apoio e a parte de trás dos braços no banco.', 'Pegada supinada na barra W.'],
      ['Suba a barra dobrando os cotovelos, sem tirar os braços do apoio.', 'Desça devagar até quase estender (sem travar).'],
      'Solte o ar ao subir.',
      ['Estender totalmente e "pendurar" no cotovelo', 'Levantar os ombros', 'Descer rápido']
    )
  });

  def('paralelas', {
    name: 'Paralelas (mergulho)', view: 'side', dur: 3.2, cam: [162, 118, 1],
    pri: ['triceps', 'chest'], sec: ['delts_front'], trace: 'head',
    keys: [
      K(0, { sh: [156.4, 51], th: 8, hd: 0, a: [156, 108], l: { k: [12, -95] }, e: 0.45 }, 'Braços estendidos, ombros longe das orelhas'),
      K(0.08, {}, 'Desça flexionando os cotovelos · 2s'),
      K(0.5, { sh: [182.2, 83.3], th: 24, l: { k: [2, -95] }, e: 0.85 }, 'Braço paralelo ao chão'),
      K(0.58, { e: 0.9 }, 'Empurre para subir · 1s'),
      K(0.9, { sh: [156.4, 51], th: 8, l: { k: [12, -95] }, e: 1 })
    ],
    back: g => {
      Dr.tube(g, [104, 109], [214, 109], 4);
      for (const x of [118, 200]) Dr.tube(g, [x - 3, 110], [x - 3, G - 3], 4);
    },
    mid: g => {
      for (const x of [120, 202]) Dr.tube(g, [x, 113], [x, G - 3], 4.5);
      Dr.tube(g, [106, G - 2], [216, G - 2], 3.5);
      Dr.tube(g, [106, 113], [214, 113], 4.6);
    },
    info: INFO(
      ['Apoie as mãos nas barras com os braços estendidos e os ombros longe das orelhas.', 'Dobre os joelhos e cruze os pés atrás.'],
      ['Desça dobrando os cotovelos (apontando para trás) até o braço ficar paralelo ao chão.', 'Empurre de volta até estender. Tronco mais reto = mais tríceps; mais inclinado = mais peito.', 'Se for pesado, use a máquina graviton.'],
      'Inspire na descida, expire na subida.',
      ['Descer demais (estressa o ombro)', 'Abrir os cotovelos', 'Encolher os ombros']
    )
  });

  def('rosca_inclinada', {
    name: 'Rosca inclinada com halteres', view: 'side', dur: 3, cam: [150, 136, 1],
    imp: { type: 'db', grip: 'end', r: 6.5 }, pri: ['biceps'], sec: ['forearms'], trace: 'hn',
    keys: [
      K(0, { hip: [150, 158], th: -30, hd: 8, a: { k: [-8, 5] }, l: { p: [204, 208], fa: 0 }, e: 0.45 }, 'Braços pendurados atrás da linha do tronco'),
      K(0.08, {}, 'Suba sem mover os cotovelos · 1s'),
      K(0.42, { a: { k: [-8, 125] }, e: 1 }, 'Aperte o bíceps'),
      K(0.52, { e: 0.9 }, 'Desça até alongar · 2s'),
      K(0.94, { a: { k: [-8, 5] }, e: 0.45 })
    ],
    mid: g => inclineBench(g, [150, 158], -30, { len: 80 }),
    info: INFO(
      ['Banco inclinado a ~60°, costas e cabeça apoiadas.', 'Braços pendurados, palmas para a frente.'],
      ['Suba os halteres dobrando só os cotovelos (eles ficam apontando para o chão).', 'Desça até estender e sentir o bíceps alongar.'],
      'Solte o ar ao subir.',
      ['Levar os cotovelos à frente', 'Tirar as costas do banco', 'Usar impulso']
    )
  });

  /* =================================================================
     SÁBADO — POSTERIOR, GLÚTEOS & ABDÔMEN
     ================================================================= */
  def('stiff', {
    name: 'Levantamento terra romeno (stiff)', view: 'side', dur: 3.8, cam: [150, 130, 1],
    imp: { type: 'bb', r: 17 }, pri: ['hamstrings', 'glutes'], sec: ['lowerback', 'forearms'], trace: 'hn',
    keys: [
      K(0, { hip: [153, 127], th: 1, hd: -2, a: { k: [7, 0] }, l: { p: [155, 208], fa: 0 }, e: 0.4 }, 'Joelhos destravados, barra junto às coxas'),
      K(0.08, {}, 'Empurre o quadril para trás · 2s'),
      K(0.5, { hip: [120, 136], th: 78, hd: -24, a: { k: [0, 0] }, e: 0.9 }, 'Alongue os posteriores, coluna reta'),
      K(0.58, { e: 0.95 }, 'Suba levando o quadril à frente · 1s'),
      K(0.88, { hip: [153, 127], th: 1, hd: -2, a: { k: [7, 0] }, e: 1 })
    ],
    info: INFO(
      ['Em pé com a barra na frente das coxas, pés na largura do quadril.', 'Joelhos levemente dobrados (fixos durante todo o movimento).'],
      ['Leve o quadril para trás descendo a barra rente às pernas até o meio da canela.', 'Mantenha a coluna neutra e suba contraindo glúteos e posteriores.'],
      'Inspire e trave o abdômen antes de descer; solte o ar ao subir.',
      ['Arredondar as costas', 'Afastar a barra das pernas', 'Agachar em vez de levar o quadril para trás']
    )
  });

  def('bulgaro', {
    name: 'Agachamento búlgaro com halteres', view: 'side', dur: 3.6, cam: [140, 130, 1],
    imp: { type: 'db', grip: 'side', r: 6.5 }, pri: ['quads', 'glutes'], sec: ['hamstrings'], trace: 'hip',
    keys: [
      K(0, { hip: [146, 133], th: 8, hd: -4, a: { k: [0, 0] }, ln: { p: [176, 208], fa: 0 }, lf: { p: [86, 166], fa: 172 }, e: 0.4 }, 'Pé de trás apoiado no banco'),
      K(0.08, {}, 'Desça o quadril na vertical · 2s'),
      K(0.5, { hip: [134, 166], th: 14, e: 0.9 }, 'Joelho de trás quase no chão'),
      K(0.58, { e: 0.95 }, 'Suba empurrando com o pé da frente · 1s'),
      K(0.88, { hip: [146, 133], th: 8, e: 1 })
    ],
    back: g => Dr.bench(g, 30, 102, 168, { legs: [44, 88] }),
    info: INFO(
      ['De costas para um banco, apoie o peito do pé de trás nele.', 'Pé da frente afastado o suficiente para o joelho não passar muito da ponta do pé.'],
      ['Desça o quadril na vertical até o joelho de trás quase tocar o chão.', 'Suba empurrando com o calcanhar da perna da frente. Faça todas de um lado e depois troque.'],
      'Inspire na descida, expire ao subir.',
      ['Joelho da frente entrando para dentro', 'Tronco muito inclinado', 'Base estreita (perde o equilíbrio)']
    )
  });

  const hipBar = S => M.add(S.hip, M.nrmT(S.baseA), 13);
  def('elevacao_pelvica', {
    name: 'Elevação pélvica (hip thrust)', view: 'side', dur: 3.2, cam: [140, 162, 1.1],
    imp: { type: 'bb', r: 17, at: hipBar }, pri: ['glutes'], sec: ['hamstrings', 'quads'], trace: hipBar,
    bend: { a: -1 },
    keys: [
      K(0, { sh: [100, 167], th: -55, hd: 22, a: { t: [-44, 12] }, l: { p: [194, 208], fa: 0 }, e: 0.45 }, 'Escápulas apoiadas na borda do banco'),
      K(0.08, {}, 'Suba o quadril empurrando os calcanhares · 1s'),
      K(0.42, { th: -90, e: 1 }, 'Tronco alinhado às coxas, aperte o glúteo'),
      K(0.54, { e: 0.95 }, 'Desça controlando · 2s'),
      K(0.94, { th: -55, e: 0.45 })
    ],
    back: g => Dr.bench(g, 24, 100, 174, { legs: [40, 84] }),
    info: INFO(
      ['Apoie a parte de baixo das escápulas na borda do banco, barra sobre o quadril (use uma proteção).', 'Pés firmes, na largura do quadril, joelhos a ~90° no topo.'],
      ['Empurre o chão com os calcanhares subindo o quadril até o tronco ficar alinhado às coxas.', 'Segure 1s apertando os glúteos e desça controlando.'],
      'Solte o ar na subida.',
      ['Arquear a lombar no topo', 'Olhar para cima (mantenha o queixo levemente baixo)', 'Pés muito longe ou muito perto']
    )
  });

  def('panturrilha_sentado', {
    name: 'Panturrilha sentado', view: 'side', dur: 2.6, cam: [162, 150, 1.05],
    pri: ['calves'], sec: [], trace: 'an',
    bend: { a: 1 },
    keys: [
      K(0, { hip: [125, 144], th: 4, hd: 2, a: [158, 134], l: { p: [167.9, 198.9], fa: -22 }, e: 0.5 }, 'Joelhos sob a almofada, ponta dos pés no apoio'),
      K(0.1, {}, 'Suba os calcanhares · 1s'),
      K(0.42, { a: [158, 130], l: { p: [168.7, 187.5], fa: 30 }, e: 1 }, 'Segure 1s no topo'),
      K(0.54, { e: 0.95 }, 'Desça alongando · 1,5s'),
      K(0.92, { a: [158, 134], l: { p: [167.9, 198.9], fa: -22 }, e: 0.5 })
    ],
    back: (g, S) => {
      seatBlock(g, 96, 150, 151);
      Dr.rr(g, 174, 196.5, 46, G - 196.5, 2, '#17233D', 'rgba(120,150,200,0.5)', 1);
      const kn = S.leg.n.j;
      Dr.tube(g, [kn[0] + 2, kn[1] - 12], [214, kn[1] - 12], 4);
      Dr.tube(g, [214, kn[1] - 12], [214, 196], 4);
    },
    front: (g, S) => {
      const kn = S.leg.n.j;
      g.save(); g.globalAlpha = 0.9;
      Dr.pad(g, [kn[0] - 20, kn[1] - 10.5], [kn[0] + 6, kn[1] - 10.5], 7, '#1E2E52');
      g.restore();
    },
    info: INFO(
      ['Sente com a almofada sobre a parte de baixo das coxas, perto dos joelhos.', 'Apoie só a ponta dos pés na plataforma.'],
      ['Desça os calcanhares o máximo possível.', 'Suba o mais alto que conseguir e segure 1s no topo.'],
      'Respire de forma contínua.',
      ['Amplitude curta', 'Quicar no fundo', 'Empurrar com as mãos']
    )
  });

  def('elevacao_joelhos_barra', {
    name: 'Elevação de joelhos na barra', view: 'side', dur: 3, cam: [160, 116, 1],
    pri: ['abs'], sec: ['obliques', 'forearms'], trace: 'an',
    bend: { a: 1, l: -1 },
    keys: [
      K(0, { sh: [152, 68], th: 0, cu: 0, hd: 0, a: [160, 17], l: { k: [8, -22] }, e: 0.45 }, 'Pendurado, ombros ativos, sem balançar'),
      K(0.08, {}, 'Suba os joelhos enrolando o quadril · 1s'),
      K(0.42, { th: -20, cu: 26, l: { k: [118, -104] }, e: 1 }, 'Joelhos acima do quadril'),
      K(0.52, { e: 0.9 }, 'Desça controlando · 2s'),
      K(0.94, { th: 0, cu: 0, l: { k: [8, -22] }, e: 0.45 })
    ],
    back: g => {
      Dr.tube(g, [100, 15], [160, 15], 4);
      Dr.tube(g, [100, 10], [100, G - 3], 5);
      Dr.tube(g, [86, G - 2], [114, G - 2], 3.5);
    },
    front: g => Dr.circ(g, [160, 15], 3.2, COL.metalHi, COL.metalDk, 1.2),
    info: INFO(
      ['Pendure-se na barra com pegada na largura dos ombros e ombros "encaixados".', 'Corpo parado, sem balanço.'],
      ['Suba os joelhos em direção ao peito, enrolando o quadril para a frente no final.', 'Desça devagar até estender as pernas. Quando ficar fácil, faça com as pernas estendidas.'],
      'Solte o ar ao subir os joelhos.',
      ['Balançar o corpo', 'Só levantar as coxas sem enrolar o quadril', 'Descer de uma vez']
    )
  });

  def('abdominal_supra', {
    name: 'Abdominal supra (crunch)', view: 'side', dur: 2.6, cam: [160, 176, 1.2],
    pri: ['abs'], sec: ['obliques'], trace: 'head',
    bend: { a: 1, l: -1 },
    keys: [
      K(0, { hip: [165, 204], th: -90, cu: 0, hd: 6, a: { t: [-12, 11] }, l: { p: [203, 207], fa: 0 }, e: 0.45 }, 'Joelhos flexionados, braços cruzados no peito'),
      K(0.08, {}, 'Tire as escápulas do chão · 1s'),
      K(0.4, { th: -86, cu: 36, hd: 14, e: 1 }, 'Contraia e solte o ar'),
      K(0.5, { e: 0.9 }, 'Desça devagar · 1,5s'),
      K(0.9, { th: -90, cu: 0, hd: 6, e: 0.45 })
    ],
    back: g => Dr.mat(g, 70, 250),
    info: INFO(
      ['Deitado com os joelhos dobrados e os pés no chão.', 'Braços cruzados no peito (ou mãos ao lado da cabeça, sem puxar).'],
      ['Enrole o tronco tirando as escápulas do chão, aproximando as costelas do quadril.', 'Desça devagar sem relaxar totalmente.'],
      'Solte o ar ao subir.',
      ['Puxar o pescoço', 'Subir com impulso', 'Tirar a lombar do chão (vira flexão de quadril)']
    )
  });

  /* =================================================================
     CARDIO
     ================================================================= */
  const SLOPE = 0.12;
  const beltY = x => 200 - (x - 150) * SLOPE;
  const per = (t, c) => { let d = Math.abs(t - c) % 1; return Math.min(d, 1 - d); };
  const bump = (t, c, w) => Math.exp(-Math.pow(per(t, c), 2) / (2 * w * w));
  function gaitLeg(t) {
    const a1 = 5 + 19 * Math.cos(2 * Math.PI * t);
    const a2 = -4 - 58 * bump(t, 0.76, 0.1) - 10 * bump(t, 0.16, 0.07);
    const f = -12 * bump(t, 0.02, 0.07) + 30 * bump(t, 0.63, 0.06);
    return { a1, a2, f };
  }
  function legLow(a1, a2, f) {
    const kn = M.dirK(a1).map(v => v * Rig.L.th);
    const an = M.add(kn, M.dirK(a1 + a2), Rig.L.sh);
    const u = M.norm(M.sub(an, kn));
    let fd = M.antL(u);
    const ag = M.ang(fd) + f * D;
    fd = [Math.cos(ag), Math.sin(ag)];
    return [M.add(an, fd, Rig.L.foot), M.add(an, fd, -Rig.L.heel)];
  }
  def('esteira', {
    name: 'Caminhada inclinada na esteira', view: 'side', dur: 1.15, cam: [160, 124, 1],
    pri: ['glutes', 'calves'], sec: ['quads', 'hamstrings'], label: 'Passadas firmes, sem segurar no apoio',
    shadowX: 150,
    fn: t => {
      const n = gaitLeg(t), f = gaitLeg(t + 0.5);
      let hy = 1e9;
      for (const L of [n, f]) {
        for (const p of legLow(L.a1, L.a2, L.f)) {
          const x = 150 + p[0];
          hy = Math.min(hy, beltY(x) - 3 - p[1]);
        }
      }
      const arm = a => ({ k: [-17 * Math.cos(2 * Math.PI * a), 34 + 8 * Math.cos(2 * Math.PI * a)] });
      return {
        hip: [150, hy], th: 7, hd: -4,
        an: arm(t), af: arm(t + 0.5),
        ln: { k: [n.a1, n.a2], f: n.f }, lf: { k: [f.a1, f.a2], f: f.f },
        e: 0.6 + 0.3 * bump(t, 0.3, 0.15), _ef: 0.6 + 0.3 * bump(t, 0.8, 0.15)
      };
    },
    back: (g, S, P, t) => {
      // base + coluna + console
      const x1 = 58, x2 = 252;
      Dr.poly(g, [[x1, beltY(x1)], [x2, beltY(x2)], [x2, beltY(x2) + 9], [x1, beltY(x1) + 8]], '#111B30', 'rgba(120,150,200,0.45)', 1);
      Dr.tube(g, [x1 + 8, beltY(x1) + 8], [x1 + 8, G - 2], 3);
      Dr.tube(g, [x2 - 10, beltY(x2) + 8], [x2 - 10, G - 2], 4);
      Dr.tube(g, [x2 - 8, beltY(x2)], [x2 + 2, 96], 5);
      Dr.tube(g, [x2 - 2, 104], [196, 112], 3.5);
      g.save(); g.translate(x2 + 3, 92); g.rotate(-0.35);
      Dr.rr(g, -16, -8, 30, 15, 3, '#0D1528', 'rgba(90,200,250,0.6)', 1.1);
      g.fillStyle = 'rgba(90,200,250,0.85)'; g.font = '700 6px -apple-system, system-ui, sans-serif'; g.fillText('5.5', -11, 2);
      g.fillStyle = 'rgba(90,200,250,0.5)'; g.fillRect(4, -3, 6, 1.4); g.fillRect(4, 0, 6, 1.4);
      g.restore();
      // faixas móveis da lona
      g.save();
      g.strokeStyle = 'rgba(90,200,250,0.35)'; g.lineWidth = 1;
      const off = (t * 26) % 26;
      for (let x = x2 - off; x > x1; x -= 26) {
        g.beginPath(); g.moveTo(x, beltY(x) + 0.6); g.lineTo(x - 8, beltY(x - 8) + 0.6); g.stroke();
      }
      g.restore();
      Dr.line(g, [x1, beltY(x1)], [x2, beltY(x2)], 1.6, 'rgba(160,190,230,0.75)');
    },
    info: INFO(
      ['Inclinação entre 8% e 12%, velocidade de 5 a 6 km/h.', 'Postura ereta, olhar à frente.'],
      ['Caminhe com passadas firmes, apoiando primeiro o calcanhar.', 'Balance os braços naturalmente — evite segurar no apoio.', 'Mantenha um ritmo em que dá para falar frases curtas (60–70% da FC máx. ≈ 120–140 bpm).'],
      'Respiração ritmada pelo nariz e boca.',
      ['Segurar no corrimão (reduz o gasto calórico)', 'Inclinar o tronco demais para a frente', 'Passadas muito longas']
    )
  });

  const bikeFn = t => {
    const C = [168, 186], R = 14;
    const ph = 2 * Math.PI * t;
    const leg = a => {
      const p = [C[0] + R * Math.cos(a), C[1] + R * Math.sin(a)];
      const fa = 16 + 12 * Math.sin(a);
      const f = fa * D;
      return { p: [p[0] - 9 * Math.cos(f), p[1] - 9 * Math.sin(f)], fa };
    };
    return {
      hip: [128, 127], th: 32, hd: -14, a: [204, 95], ln: leg(ph), lf: leg(ph + Math.PI),
      e: 0.55 + 0.45 * Math.max(0, Math.cos(ph)), _ef: 0.55 + 0.45 * Math.max(0, Math.cos(ph + Math.PI)), _ph: null
    };
  };
  const bikeBack = (g, S, P, t) => {
    const C = [168, 186], R = 14, a = 2 * Math.PI * t + Math.PI;
    Dr.tube(g, C, [C[0] + R * Math.cos(a), C[1] + R * Math.sin(a)], 3);
    Dr.rr(g, C[0] + R * Math.cos(a) - 5, C[1] + R * Math.sin(a) - 1.5, 10, 3, 1.5, COL.metalHi);
  };
  const bikeMid = (g, S, P, t) => {
    const C = [168, 186];
    // volante (flywheel) futurista
    const W = [226, 168];
    Dr.circ(g, W, 27, '#0E1730', 'rgba(90,200,250,0.55)', 1.6);
    Dr.circ(g, W, 20, null, 'rgba(90,200,250,0.18)', 1);
    g.save(); g.translate(W[0], W[1]); g.rotate(t * Math.PI * 4);
    g.strokeStyle = 'rgba(90,200,250,0.35)'; g.lineWidth = 1;
    for (let i = 0; i < 6; i++) { g.rotate(Math.PI / 3); g.beginPath(); g.moveTo(4, 0); g.lineTo(19, 0); g.stroke(); }
    g.restore();
    Dr.circ(g, W, 4, COL.metal, COL.metalHi, 1);
    // quadro
    Dr.tube(g, [122, 140], C, 6);
    Dr.tube(g, C, W, 5);
    Dr.tube(g, W, [204, 104], 5);
    Dr.tube(g, [196, 98], [212, 94], 4);
    Dr.tube(g, [92, G - 3], [252, G - 3], 4);
    Dr.tube(g, [122, 150], [110, G - 3], 4);
    Dr.tube(g, [W[0], W[1] + 20], [W[0] + 4, G - 3], 4);
    Dr.rr(g, 110, 133, 32, 6, 3, '#1E2E52', COL.padHi, 1);
    Dr.circ(g, C, 7, COL.metalDk, COL.metalHi, 1.2);
  };
  const bikeFront = (g, S, P, t) => {
    const C = [168, 186], R = 14, a = 2 * Math.PI * t;
    Dr.tube(g, C, [C[0] + R * Math.cos(a), C[1] + R * Math.sin(a)], 3.4);
    Dr.rr(g, C[0] + R * Math.cos(a) - 5.5, C[1] + R * Math.sin(a) - 1.6, 11, 3.2, 1.6, COL.metalHi);
  };
  const bikeInfo = INFO(
    ['Banco na altura do quadril: com o pedal embaixo, o joelho fica levemente dobrado.', 'Mãos leves no guidão, tronco levemente inclinado.'],
    ['Pedale em círculos, empurrando e puxando o pedal.', 'Nos tiros (HIIT) aumente carga e cadência ao máximo; na recuperação, pedale leve.'],
    'Respiração contínua; nos tiros ela vai ficar ofegante — é normal.',
    ['Banco muito baixo (força o joelho)', 'Balançar o quadril no banco', 'Pular o aquecimento antes dos tiros']
  );
  def('bike', {
    name: 'Bike ergométrica', view: 'side', dur: 0.85, cam: [168, 126, 1],
    pri: ['quads', 'glutes'], sec: ['hamstrings', 'calves'], label: 'Pedalada constante',
    shadowX: 175, shadowW: 70,
    fn: bikeFn, back: bikeBack, mid: bikeMid, front: bikeFront, info: bikeInfo
  });
  def('aquecimento', {
    name: 'Aquecimento na bike', view: 'side', dur: 1.25, cam: [168, 126, 1],
    pri: [], sec: ['quads', 'glutes', 'hamstrings', 'calves'], label: 'Ritmo leve, sem carga',
    shadowX: 175, shadowW: 70,
    fn: bikeFn, back: bikeBack, mid: bikeMid, front: bikeFront,
    info: INFO(
      ['Bike com carga leve.', 'Depois faça 1–2 séries leves do primeiro exercício do dia.'],
      ['3 min pedalando leve, aumentando aos poucos.', '2 min de mobilidade: círculos de ombro, rotação de quadril e agachamentos sem peso.'],
      'Respiração tranquila.',
      ['Pular o aquecimento', 'Começar já com carga pesada']
    )
  });

  /* ---------------- nomes dos músculos ---------------- */
  window.MUSCLES = {
    chest: 'Peitoral', abs: 'Reto abdominal', obliques: 'Oblíquos', lats: 'Grande dorsal',
    midback: 'Meio das costas (romboides)', traps: 'Trapézio', lowerback: 'Lombar',
    delts_front: 'Deltoide anterior', delts_side: 'Deltoide lateral', delts_rear: 'Deltoide posterior',
    biceps: 'Bíceps', triceps: 'Tríceps', forearms: 'Antebraço', glutes: 'Glúteos',
    quads: 'Quadríceps', hamstrings: 'Posteriores da coxa', calves: 'Panturrilha'
  };
})();
