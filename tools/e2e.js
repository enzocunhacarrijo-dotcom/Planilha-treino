// Teste ponta a ponta do app: node tools/e2e.js <pasta-de-saida> [mobile|desktop]
const { chromium, devices } = require('playwright');
const path = require('path');
(async () => {
  const out = process.argv[2] || '.';
  const mobile = process.argv[3] !== 'desktop';
  const browser = await chromium.launch();
  const ctx = mobile
    ? await browser.newContext({ ...devices['iPhone 13'] })
    : await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.addInitScript(() => { window.confirm = () => true; });
  await page.goto(process.argv[4] || 'file://' + path.resolve('index.html'));
  await page.waitForTimeout(1300);
  const pre = mobile ? 'm-' : 'd-';
  const shot = async n => { await page.screenshot({ path: path.join(out, pre + n + '.png') }); };
  const tap = async sel => { await page.locator(sel).first().click(); };
  const wait = ms => page.waitForTimeout(ms);
  const scrollTop = async (y) => page.evaluate(y => { const s = window.__app.Nav.top().sc; s.scrollTop = y; }, y);

  await shot('01-hoje');
  await scrollTop(520); await wait(300);
  await shot('02-hoje-lista');

  // detalhe de exercício (tela empilhada)
  await tap('.view[data-tab="hoje"] .row[data-k="0"]');
  await wait(700);
  await shot('03-exercicio');
  await tap('.seg button[data-seg="1"]');
  await wait(400);
  await scrollTop(300); await wait(200);
  await shot('04-musculos');
  await tap('[data-rest-start]');
  await wait(1200);
  await shot('05-timer');
  await tap('#dock [data-act="close"]');
  // gesto de voltar arrastando da borda
  const box = await page.locator('#app').boundingBox();
  await page.mouse.move(box.x + 6, box.y + 300);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) { await page.mouse.move(box.x + 6 + i * 30, box.y + 300); await wait(16); }
  await shot('06-arrastando');
  await page.mouse.up();
  await wait(700);
  const depth1 = await page.evaluate(() => document.querySelectorAll('.view[data-tab="hoje"] .screen').length);

  // aba plano → dia → treino
  await tap('#tabbar [data-tab="plano"]');
  await wait(300);
  await shot('07-plano');
  await tap('.view[data-tab="plano"] [data-day-open="0"]');
  await wait(700);
  await shot('08-dia');
  // botão voltar do sistema
  await page.goBack(); await wait(700);
  const depth2 = await page.evaluate(() => document.querySelectorAll('.view[data-tab="plano"] .screen').length);
  await tap('.view[data-tab="plano"] [data-day-open="0"]');
  await wait(700);
  await tap('.view[data-tab="plano"] .screen:last-child [data-start]');
  await wait(900);
  await shot('09-treino-aquecimento');
  await tap('#ses-main'); await wait(1200);
  await tap('#ses-main'); await wait(600);
  await tap('[data-w="2.5"]'); await tap('[data-w="2.5"]');
  await shot('10-treino-serie');
  await tap('#ses-main'); await wait(1100);
  await shot('11-descanso');
  await tap('[data-rest="skip"]'); await wait(500);
  await tap('#ses-close'); await wait(800);
  await shot('12-mini-player');
  await tap('#mini'); await wait(800);
  await tap('#ses-prog button[data-i="8"]'); await wait(400);
  await tap('#ses-main'); await wait(900);
  await shot('13-cardio');
  await tap('#ses-end'); await wait(900);
  await shot('14-resumo');
  await tap('#sum-save'); await wait(900);

  // biblioteca
  await tap('#tabbar [data-tab="exercicios"]'); await wait(500);
  await shot('15-biblioteca');
  await tap('[data-f="bracos"]'); await wait(500);
  await shot('16-bracos');
  await page.fill('.search input', 'agach'); await wait(500);
  const nLib = await page.evaluate(() => document.querySelectorAll('.grid2 .tile-ex').length);

  // progresso
  await tap('#tabbar [data-tab="progresso"]'); await wait(500);
  await shot('17-progresso');
  await scrollTop(700); await wait(300);
  await shot('18-progresso-ajustes');
  await tap('#tabbar [data-tab="hoje"]'); await wait(400);
  await scrollTop(0); await wait(200);
  await shot('19-hoje-depois');

  const hist = await page.evaluate(() => JSON.parse(localStorage.getItem('treino6x:v1')).history.length);
  console.log('telas após gesto de voltar (esperado 1):', depth1);
  console.log('telas após voltar do sistema (esperado 1):', depth2);
  console.log('busca "agach" →', nLib, 'resultado(s)');
  console.log('histórico salvo:', hist);
  console.log(errors.length ? 'ERROS:\n' + errors.join('\n') : 'sem erros de JS');
  await browser.close();
})();
