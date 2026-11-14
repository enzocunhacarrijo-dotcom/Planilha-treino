// Uso: node tools/shot.js <url-ou-arquivo> <saida.png> [largura] [altura] [fullPage]
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [, , target, out, w = '1100', h = '900', full = '1'] = process.argv;
  const url = /^https?:|^file:/.test(target) ? target : 'file://' + path.resolve(target.split('?')[0]) + (target.includes('?') ? '?' + target.split('?')[1] : '');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  const logs = [];
  page.on('console', m => logs.push(m.type() + ': ' + m.text()));
  page.on('pageerror', e => logs.push('pageerror: ' + e.message));
  await page.goto(url);
  await page.waitForTimeout(600);
  const errs = await page.evaluate(() => window.__errors || []);
  await page.screenshot({ path: out, fullPage: full === '1' });
  await browser.close();
  if (logs.length) console.log(logs.join('\n'));
  if (errs.length) console.log('ERROS:', errs.join('\n'));
  console.log('ok', out);
})();
