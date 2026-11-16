# Treino 6× — app de treino com animações

App de treino (PWA) com a rotina de segunda a sábado: divisão **Push / Pull / Legs 2× por semana**, focada em
**perda de gordura**, com ênfase em **peito, braços e abdômen** (sem deixar de treinar o corpo todo).

> Perfil: homem, 19 anos, 86 kg, 1,75 m, intermediário, academia completa, 60 min por treino, cardio misto.

## O app

- **Hoje** — o treino do dia, a semana (dias feitos) e a lista de exercícios.
- **Plano** — os 7 dias da semana, seu perfil e o guia (calorias, proteína, progressão, recuperação).
- **Exercícios** — os 39 movimentos animados, com busca e filtro por grupo muscular.
- **Progresso** — anel da semana, histórico de treinos, cargas anotadas e ajustes (som, vibração, tela ligada).

Cada exercício abre uma tela com a **animação do bonequinho** (músculo principal brilhando, trajetória do
movimento, fase atual, câmera lenta), o **mapa muscular** frente/costas e as dicas de posição, execução,
respiração e erros a evitar.

**Iniciar treino** abre o modo treino em tela cheia: cronômetro, "Concluir série" com **timer de descanso**
automático (−15s / +15s / pular, bipe e vibração), carga em kg salva por exercício, séries por tempo,
aquecimento e cardio com contagem regressiva (o HIIT avisa cada tiro). Dá para minimizar o treino e continuar
navegando — ele fica num mini player acima das abas. No fim, **Salvar na semana**.

Navegação de app: abas embaixo, telas que deslizam, gesto de arrastar da borda esquerda para voltar e
botão voltar do Android.

## Como instalar no celular (tela cheia, funciona offline)

O app precisa estar publicado em um endereço `https://`. O jeito mais simples é o GitHub Pages:

1. No GitHub, abra o repositório → **Settings → Pages**.
2. Em **Build and deployment**, escolha **Deploy from a branch**, selecione a branch (ex.: `main`) e a pasta `/ (root)` → **Save**.
3. Em 1–2 minutos o endereço aparece no topo da página (algo como `https://SEU-USUARIO.github.io/Planilha-treino/`).
4. Abra esse endereço no celular:
   - **iPhone (Safari):** Compartilhar → **Adicionar à Tela de Início**.
   - **Android (Chrome):** menu ⋮ → **Instalar app** (ou "Adicionar à tela inicial").

> Repositórios privados só podem usar o GitHub Pages em planos pagos. Se preferir, abra o `index.html`
> direto no navegador — tudo funciona, só não fica instalável.

## Seus dados ficam sempre salvos

- **Salvamento automático a cada série**, inclusive do treino em andamento: pode fechar o app no meio do
  treino — ao voltar, ele continua na mesma série, com o descanso e o timer da prancha/cardio no ponto certo.
- **Duas cópias no aparelho** (localStorage + IndexedDB) e uma cópia automática por dia (últimos 7 dias):
  se uma for apagada, o app recupera da outra. O app também pede ao navegador para proteger os dados contra limpeza.
- **Treino nunca se perde:** ao encerrar, ele já é gravado no histórico; um treino esquecido aberto
  por mais de 6 horas é salvo sozinho com o que foi feito.
- **Carga de cada série** e **recorde** por exercício (aparecem no exercício e em Progresso).
- **Backup em arquivo** (Progresso → Seus dados): gera um `.json` para guardar no Drive, iCloud ou WhatsApp,
  e **Restaurar backup** traz tudo de volta — útil para trocar de celular ou se o navegador for limpo.
  O app lembra de fazer backup quando há treinos novos há mais de 7 dias.
- **Desfazer** ao apagar os dados.

> Os dados ficam no navegador/endereço em que você usa o app. Se trocar de celular ou passar a abrir por
> outro endereço, use o backup para levar tudo junto.

## A rotina

| Dia | Treino | Cardio |
| --- | --- | --- |
| Segunda | Peito & Tríceps (Push A) + abdômen | Caminhada inclinada 15 min |
| Terça | Costas & Bíceps (Pull A) | HIIT na bike 12 min |
| Quarta | Pernas (quadríceps) + abdômen (Legs A) | Caminhada inclinada 12 min |
| Quinta | Peito superior, Ombros & Tríceps (Push B) + abdômen | Caminhada inclinada 15 min |
| Sexta | Costas & Braços (Pull B) | HIIT na bike 12 min |
| Sábado | Posterior, Glúteos & Abdômen (Legs B) | Caminhada inclinada 15 min |
| Domingo | Descanso / recuperação ativa | — |

## Estrutura do código

```
index.html            o app pronto (gerado — um arquivo só)
manifest.webmanifest  dados do app instalável (nome, ícones, tela cheia)
sw.js                 service worker (funciona offline)
icons/                ícones do app
src/rig.js            motor de animação 2D (esqueleto, IK/FK, músculos, equipamentos)
src/exercises.js      os 39 exercícios: poses-chave, equipamentos e instruções
src/program.js        a rotina (séries, repetições, descanso, cardio)
src/bodymap.js        mapa muscular frente/costas (SVG)
src/app.js            telas, navegação, modo treino, cronômetro e timers
src/styles.css        visual
src/index.html        casca do app
src/icon.svg          ícone
build.mjs             junta tudo em index.html (`node build.mjs`; `--icons` regera os ícones)
tools/                pré-visualização das animações e testes (e2e.js, persist-test.js)
```

> Plano de referência. Ajuste as cargas para terminar cada série com 1–2 repetições sobrando, pare se sentir dor
> articular e, se possível, valide com um profissional de educação física e um nutricionista.
