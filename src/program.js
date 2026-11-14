/* =====================================================================
   PROGRAMA — rotina de 6 dias (Push / Pull / Legs × 2)
   Objetivo: perda de gordura com ênfase em peito, braços e abdômen
   s = séries · r = repetições · d = descanso (s) · tempo = série por tempo (s)
   ===================================================================== */
(function () {
  'use strict';

  const WARMUP = { id: 'aquecimento', min: 5, segs: [{ n: 'Bike leve', s: 180 }, { n: 'Mobilidade: ombros, quadril e agachamento sem peso', s: 120 }] };

  const LISS = (min) => ({
    id: 'esteira', tipo: 'LISS', min, titulo: 'Caminhada inclinada',
    desc: 'Inclinação 8–12% · 5–6 km/h · ritmo em que dá para falar frases curtas (FC ~120–140 bpm).',
    segs: [{ n: 'Caminhada inclinada contínua', s: min * 60 }]
  });

  const HIIT = () => {
    const segs = [{ n: 'Aquecimento leve', s: 120 }];
    for (let i = 1; i <= 8; i++) {
      segs.push({ n: 'Tiro forte ' + i + '/8', s: 20, hi: true });
      segs.push({ n: 'Recuperação leve', s: 40 });
    }
    segs.push({ n: 'Desaquecimento', s: 120 });
    return {
      id: 'bike', tipo: 'HIIT', min: 12, titulo: 'HIIT na bike',
      desc: '2 min leve → 8 tiros de 20s no máximo + 40s leve → 2 min leve.',
      segs
    };
  };

  window.PROGRAM = {
    perfil: { idade: 19, peso: 86, altura: 175, sexo: 'Masculino', nivel: 'Intermediário', local: 'Academia completa' },
    dias: [
      {
        id: 'seg', nome: 'Segunda-feira', curto: 'Seg', titulo: 'Peito & Tríceps', tag: 'Push A',
        sub: 'Ênfase no peitoral com tríceps e abdômen', foco: ['Peito', 'Tríceps', 'Abdômen'],
        aquecimento: WARMUP,
        ex: [
          { id: 'supino_reto', s: 4, r: '8–10', d: 90 },
          { id: 'supino_inclinado_halteres', s: 3, r: '10–12', d: 75 },
          { id: 'crossover', s: 3, r: '12–15', d: 60 },
          { id: 'triceps_corda', s: 3, r: '12–15', d: 60 },
          { id: 'triceps_frances', s: 3, r: '10–12', d: 60 },
          { id: 'abdominal_polia', s: 3, r: '12–15', d: 45 },
          { id: 'prancha', s: 3, tempo: 45, d: 30, peso: false }
        ],
        cardio: LISS(15)
      },
      {
        id: 'ter', nome: 'Terça-feira', curto: 'Ter', titulo: 'Costas & Bíceps', tag: 'Pull A',
        sub: 'Largura e espessura das costas com bíceps', foco: ['Costas', 'Bíceps', 'Ombro posterior'],
        aquecimento: WARMUP,
        ex: [
          { id: 'puxada_frontal', s: 4, r: '8–10', d: 90 },
          { id: 'remada_curvada', s: 4, r: '8–10', d: 90 },
          { id: 'remada_sentada', s: 3, r: '10–12', d: 75 },
          { id: 'face_pull', s: 3, r: '12–15', d: 60 },
          { id: 'rosca_direta', s: 3, r: '8–12', d: 60 },
          { id: 'rosca_martelo', s: 3, r: '10–12', d: 60, nota: 'cada braço' }
        ],
        cardio: HIIT()
      },
      {
        id: 'qua', nome: 'Quarta-feira', curto: 'Qua', titulo: 'Pernas & Abdômen', tag: 'Legs A',
        sub: 'Foco em quadríceps, com posterior, panturrilha e abdômen', foco: ['Quadríceps', 'Glúteos', 'Abdômen'],
        aquecimento: WARMUP,
        ex: [
          { id: 'agachamento', s: 4, r: '8–10', d: 120 },
          { id: 'leg_press', s: 3, r: '10–12', d: 90 },
          { id: 'cadeira_extensora', s: 3, r: '12–15', d: 60 },
          { id: 'mesa_flexora', s: 3, r: '10–12', d: 60 },
          { id: 'panturrilha_em_pe', s: 4, r: '12–15', d: 45 },
          { id: 'elevacao_pernas', s: 3, r: '12–15', d: 45, peso: false }
        ],
        cardio: LISS(12)
      },
      {
        id: 'qui', nome: 'Quinta-feira', curto: 'Qui', titulo: 'Peito, Ombros & Tríceps', tag: 'Push B',
        sub: 'Peitoral superior, deltoides e tríceps', foco: ['Peito superior', 'Ombros', 'Tríceps'],
        aquecimento: WARMUP,
        ex: [
          { id: 'supino_inclinado_barra', s: 4, r: '8–10', d: 90 },
          { id: 'desenvolvimento_halteres', s: 3, r: '8–12', d: 90 },
          { id: 'elevacao_lateral', s: 4, r: '12–15', d: 45 },
          { id: 'voador', s: 3, r: '12–15', d: 60 },
          { id: 'triceps_testa', s: 3, r: '10–12', d: 60 },
          { id: 'abdominal_bicicleta', s: 3, r: '20 (10 cada lado)', d: 45, peso: false }
        ],
        cardio: LISS(15)
      },
      {
        id: 'sex', nome: 'Sexta-feira', curto: 'Sex', titulo: 'Costas & Braços', tag: 'Pull B',
        sub: 'Dia de braço: bíceps e tríceps com costas', foco: ['Bíceps', 'Tríceps', 'Costas'],
        aquecimento: WARMUP,
        ex: [
          { id: 'barra_fixa', s: 4, r: '6–10', d: 90, peso: false, nota: 'use graviton se precisar' },
          { id: 'remada_unilateral', s: 3, r: '10–12', d: 60, nota: 'cada lado' },
          { id: 'pulldown_braco_estendido', s: 3, r: '12–15', d: 60 },
          { id: 'rosca_scott', s: 3, r: '10–12', d: 60 },
          { id: 'paralelas', s: 3, r: '8–12', d: 75, peso: false },
          { id: 'rosca_inclinada', s: 3, r: '10–12', d: 60 }
        ],
        cardio: HIIT()
      },
      {
        id: 'sab', nome: 'Sábado', curto: 'Sáb', titulo: 'Posterior, Glúteos & Abdômen', tag: 'Legs B',
        sub: 'Cadeia posterior, glúteos, panturrilha e abdômen', foco: ['Posterior', 'Glúteos', 'Abdômen'],
        aquecimento: WARMUP,
        ex: [
          { id: 'stiff', s: 4, r: '8–10', d: 90 },
          { id: 'bulgaro', s: 3, r: '10', d: 75, nota: 'cada perna' },
          { id: 'elevacao_pelvica', s: 3, r: '10–12', d: 75 },
          { id: 'panturrilha_sentado', s: 3, r: '15', d: 45 },
          { id: 'elevacao_joelhos_barra', s: 3, r: '10–12', d: 60, peso: false },
          { id: 'abdominal_supra', s: 3, r: '15–20', d: 45, peso: false }
        ],
        cardio: LISS(15)
      },
      {
        id: 'dom', nome: 'Domingo', curto: 'Dom', titulo: 'Descanso', tag: 'Recuperação', descanso: true,
        sub: 'Recuperação ativa: o músculo cresce e se recupera no descanso', foco: ['Recuperação'],
        ex: []
      }
    ]
  };
})();
