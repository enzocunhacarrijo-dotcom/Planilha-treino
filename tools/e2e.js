// Teste ponta a ponta: node tools/e2e.js <pasta-de-saida> [mobile]
const { chromium, devices } = require('playwright');
const path = require('path');
(async () => {
  const out = process.argv[2] || '.';
  const mobile = process.argv[3] === 'mobile';
  const browser = await chromium.launch();
  const ctx = mobile
    ? await browser.newContext({ ...devices['iPhone 13'] })
    : await browser.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.addInitScript(() => { window.confirm = () => true; });
  await page.goto('file://' + path.resolve('index.html'));
  await page.waitForTimeout(700);
  const pre = mobile ? 'm-' : 'd-';
  const shot = async n => { await page.screenshot({ path: path.join(out, pre + n + '.png') }); };

  await shot('01-top');
  // seleciona segunda-feira
  await page.click('.day-tab[data-i="0"]');
  await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector('#day').scrollIntoView());
  await page.waitForTimeout(400);
  await shot('02-day');
  await page.evaluate(() => document.querySelector('.ex-list').scrollIntoView());
  await page.waitForTimeout(400);
  await shot('03-list');
  // abre detalhes
  await page.click('.ex[data-i="0"]');
  await page.waitForTimeout(900);
  await shot('04-sheet');
  await page.evaluate(() => document.querySelector('#sheet-body').scrollTo(0, 600));
  await page.waitForTimeout(300);
  await shot('05-sheet-scroll');
  await page.click('#sheet-rest');
  await page.waitForTimeout(1300);
  await shot('06-dock');
  await page.click('#sheet-close');
  await page.click('#dock [data-act="close"]');
  await page.waitForTimeout(600);
  // inicia treino
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('#start');
  await page.waitForTimeout(900);
  await shot('07-session-warmup');
  await page.click('#ses-main'); // inicia aquecimento
  await page.waitForTimeout(1500);
  await shot('08-session-warmup-running');
  await page.click('#ses-main'); // pula etapa
  await page.waitForTimeout(700);
  await shot('09-session-ex1');
  await page.click('[data-w="2.5"]');
  await page.click('[data-w="2.5"]');
  await page.click('#ses-main'); // conclui série 1
  await page.waitForTimeout(1200);
  await shot('10-session-rest');
  await page.click('[data-rest="skip"]');
  await page.waitForTimeout(600);
  // vai para a prancha (último exercício) e testa série por tempo
  await page.click('#ses-prog button[data-i="7"]');
  await page.waitForTimeout(500);
  await page.click('#ses-main');
  await page.waitForTimeout(1600);
  await shot('11-session-plank');
  // cardio
  await page.click('#ses-prog button[data-i="8"]');
  await page.waitForTimeout(500);
  await page.click('#ses-main');
  await page.waitForTimeout(1000);
  await shot('12-session-cardio');
  await page.click('#ses-pause');
  await page.waitForTimeout(400);
  await shot('13-session-paused');
  await page.click('#ses-end');
  await page.waitForTimeout(900);
  await shot('14-summary');
  await page.click('#sum-save');
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await shot('15-after-save');
  // terça (HIIT) e domingo
  await page.click('.day-tab[data-i="1"]');
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelectorAll('.sec-h')[2].scrollIntoView());
  await page.waitForTimeout(400);
  await shot('16-tuesday-cardio');
  await page.click('.day-tab[data-i="6"]');
  await page.waitForTimeout(500);
  await shot('17-sunday');
  const hist = await page.evaluate(() => JSON.parse(localStorage.getItem('treino6x:v1')).history.length);
  console.log('histórico salvo:', hist);
  console.log(errors.length ? 'ERROS:\n' + errors.join('\n') : 'sem erros de JS');
  await browser.close();
})();
