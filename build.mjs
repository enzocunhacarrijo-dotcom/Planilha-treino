// Gera o index.html autossuficiente (um único arquivo) a partir de src/
// Uso: node build.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const read = f => readFileSync(new URL('./src/' + f, import.meta.url), 'utf8');
const js = ['rig.js', 'exercises.js', 'program.js', 'bodymap.js', 'app.js'].map(read).join('\n;\n');
const html = read('index.html')
  .replace('/*__CSS__*/', () => read('styles.css'))
  .replace('//__JS__', () => js.replace(/<\/script/gi, '<\\/script'));

writeFileSync(new URL('./index.html', import.meta.url), html);
console.log('index.html gerado (' + (html.length / 1024).toFixed(1) + ' KB)');
