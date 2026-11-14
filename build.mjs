// Gera o index.html autossuficiente a partir de src/ (e os ícones do app com --icons)
// Uso: node build.mjs            → index.html
//      node build.mjs --icons    → também gera icons/*.png (precisa do Playwright)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const read = f => readFileSync(new URL('./src/' + f, import.meta.url), 'utf8');
const icon = read('icon.svg');
const js = ['rig.js', 'exercises.js', 'program.js', 'bodymap.js', 'app.js'].map(read).join('\n;\n');
const html = read('index.html')
  .replace('/*__CSS__*/', () => read('styles.css'))
  .replace('<!--__ICON__-->', () => icon)
  .replace('//__JS__', () => js.replace(/<\/script/gi, '<\\/script'));

writeFileSync(new URL('./index.html', import.meta.url), html);
console.log('index.html gerado (' + (html.length / 1024).toFixed(1) + ' KB)');

if (process.argv.includes('--icons')) {
  const require = createRequire(import.meta.url);
  const { chromium } = require('playwright');
  mkdirSync(new URL('./icons/', import.meta.url), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // [arquivo, tamanho, escala do desenho (maskable precisa de margem de segurança)]
  const out = [['icon-192.png', 192, 1], ['icon-512.png', 512, 1], ['icon-maskable-512.png', 512, 0.82], ['apple-touch-icon.png', 180, 1]];
  for (const [name, size, k] of out) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><body style="margin:0;background:#05070C"><div style="width:${size}px;height:${size}px;display:grid;place-items:center;background:radial-gradient(100% 100% at 72% 12%,#2A5BA8,#11284F 42%,#05070C)"><div style="width:${size * k}px;height:${size * k}px">${icon.replace('<svg ', '<svg width="100%" height="100%" ')}</div></div></body></html>`);
    await page.screenshot({ path: new URL('./icons/' + name, import.meta.url).pathname, omitBackground: false });
    console.log('icons/' + name);
  }
  await browser.close();
}
