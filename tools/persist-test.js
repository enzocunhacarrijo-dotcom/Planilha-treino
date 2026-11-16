// Testa se os dados nunca se perdem: node tools/persist-test.js [url]
const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const url = process.argv[2] || 'http://localhost:8765/index.html';
  const out = process.argv[3] || '.';
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'], acceptDownloads: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(() => { window.confirm = () => true; });
  const wait = ms => p.waitForTimeout(ms);
  const db = () => p.evaluate(() => window.__app.db());
  const ok = (c, msg) => console.log((c ? '✔ ' : '✘ ') + msg);
  const load = async () => { await p.goto(url); await wait(1500); };

  await load();
  // começa o treino de segunda e faz 2 séries com carga
  await p.click('#tabbar [data-tab="plano"]');
  await p.click('.view[data-tab="plano"] [data-day-open="0"]'); await wait(600);
  await p.click('.view[data-tab="plano"] .screen:last-child [data-start]'); await wait(700);
  await p.click('#ses-main'); await wait(300); await p.click('#ses-main'); await wait(400);
  await p.fill('#ses-w', '40'); await p.dispatchEvent('#ses-w', 'change');
  await p.click('#ses-main'); await wait(400); await p.click('[data-rest="skip"]'); await wait(300);
  await p.fill('#ses-w', '42.5'); await p.dispatchEvent('#ses-w', 'change');
  await p.click('#ses-main'); await wait(1500);
  const restBefore = await p.textContent('#rest-time');

  // fecha o app no meio do descanso
  await load();
  ok(await p.isVisible('#mini'), 'treino em andamento aparece depois de fechar o app');
  await p.click('#mini'); await wait(900);
  const restAfter = await p.textContent('#rest-time');
  const restOn = await p.evaluate(() => document.querySelector('#rest').classList.contains('on'));
  ok(restOn, `descanso continua de onde parou (${restBefore} → ${restAfter})`);
  const dots = await p.$$eval('.dots i.on', e => e.length);
  ok(dots === 2, 'as 2 séries feitas continuam marcadas');
  await p.screenshot({ path: path.join(out, 'p-01-retomado.png') });

  // prancha (série por tempo) sobrevive ao fechar
  await p.click('[data-rest="skip"]');
  await p.click('#ses-prog button[data-i="7"]'); await wait(300);
  await p.click('#ses-main'); await wait(1200);
  await load();
  await p.click('#mini'); await wait(800);
  const plank = await p.textContent('#timed-ring b');
  ok(/0:4\d/.test(plank), `timer da prancha continuou (${plank})`);

  // encerra: já salva sozinho; voltar e encerrar de novo não duplica
  await p.click('#ses-end'); await wait(800);
  ok((await db()).history.length === 1, 'ao encerrar, o treino já é salvo no histórico');
  await p.screenshot({ path: path.join(out, 'p-02-resumo.png') });
  await p.click('#sum-back'); await wait(500);
  await p.click('#ses-end'); await wait(800);
  ok((await db()).history.length === 1, 'voltar ao treino e encerrar de novo não duplica');
  await p.click('#sum-save'); await wait(800);
  const d1 = await db();
  ok(JSON.stringify(d1.history[0].log.supino_reto) === '[40,42.5]', 'cargas de cada série salvas: ' + JSON.stringify(d1.history[0].log.supino_reto));
  ok(d1.best.supino_reto === 42.5, 'recorde registrado: ' + d1.best.supino_reto + ' kg');

  // carga aparece no detalhe do exercício
  await p.click('#tabbar [data-tab="exercicios"]'); await wait(300);
  await p.click('.tile-ex[data-ex="supino_reto"]'); await wait(700);
  await p.evaluate(() => { const s = window.__app.Nav.top().sc; s.scrollTop = 420; });
  await wait(300);
  await p.screenshot({ path: path.join(out, 'p-03-cargas.png') });
  ok(/40 · 42,5 kg/.test(await p.textContent('.view[data-tab="exercicios"] .screen:last-child')), 'histórico de cargas aparece no exercício');

  // navegador apaga o localStorage → recupera do IndexedDB
  await p.evaluate(() => localStorage.clear());
  await load();
  ok((await db()).history.length === 1, 'localStorage apagado: dados recuperados da segunda cópia');

  // backup
  await p.click('#tabbar [data-tab="progresso"]'); await wait(400);
  await p.screenshot({ path: path.join(out, 'p-04-progresso.png') });
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('.row[data-backup]')]);
  const file = path.join(out, 'backup.json');
  await dl.saveAs(file);
  const bk = JSON.parse(fs.readFileSync(file, 'utf8'));
  ok(bk.app === 'treino6x' && bk.data.history.length === 1, 'backup exportado (' + dl.suggestedFilename() + ')');
  await wait(400);
  await p.evaluate(() => { const s = window.__app.Nav.top().sc; s.scrollTop = 520; });
  await wait(300);
  await p.screenshot({ path: path.join(out, 'p-05-seus-dados.png') });

  // apagar → desfazer
  await p.click('[data-reset]'); await wait(400);
  ok((await db()).history.length === 0, 'apagar dados funciona');
  await p.click('.toast-act'); await wait(400);
  ok((await db()).history.length === 1, '"Desfazer" traz tudo de volta');

  // apagar → restaurar pelo arquivo
  await p.click('[data-reset]'); await wait(300);
  await p.setInputFiles('[data-restore]', file); await wait(700);
  const d2 = await db();
  ok(d2.history.length === 1 && d2.best.supino_reto === 42.5, 'backup restaurado a partir do arquivo');

  // treino abandonado há mais de 6 h é salvo automaticamente
  await p.click('#tabbar [data-tab="hoje"]'); await wait(300);
  await p.evaluate(() => window.__app.Session.open(2)); await wait(500);
  await p.click('#ses-main'); await wait(200); await p.click('#ses-main'); await wait(300);
  await p.click('#ses-main'); await wait(300);
  // simula: app fechado e esquecido por 7 horas
  await p.evaluate(() => { const d = window.__app.db(); d.session.last -= 7 * 3600e3; d.session.start -= 7.5 * 3600e3; });
  await load();
  const d3 = await db();
  ok(d3.history.length === 2 && d3.history.some(h => h.partial) && !d3.session, 'treino abandonado foi salvo sozinho (não se perdeu)');

  console.log(errs.length ? 'ERROS: ' + errs.join(' | ') : 'sem erros de JS');
  await b.close();
})();
