# Treino 6× — rotina semanal com animações

App em **um único arquivo** (`index.html`) com a rotina de treino de segunda a sábado: divisão
**Push / Pull / Legs 2× por semana**, focada em **perda de gordura**, com ênfase em **peito, braços e abdômen**
(sem deixar de treinar o corpo todo).

> Perfil: homem, 19 anos, 86 kg, 1,75 m, intermediário, academia completa, 60 min por treino, cardio misto.

## Como usar

1. Abra o `index.html` no navegador (celular ou computador). Não precisa de internet nem de instalação.
2. Escolha o dia na barra de dias (o dia de hoje já vem selecionado).
3. Toque em um exercício para ver a **animação grande**, os **músculos trabalhados** (frente e costas),
   a posição, a execução, a respiração e os erros a evitar. Tem câmera lenta (0,5×) e pausa.
4. Toque em **Iniciar treino** para entrar no modo treino:
   - **cronômetro** do treino inteiro (com pausa);
   - botão **Concluir série** → inicia sozinho o **timer de descanso** (com −15s / +15s / pular, bipe e vibração);
   - registro de **carga (kg)** por exercício, salvo para a próxima vez;
   - séries por tempo (prancha), aquecimento e cardio com contagem regressiva (o HIIT avisa cada tiro);
   - no fim, **Salvar na semana** marca o dia como feito.
5. O botão **Timer de descanso** (no topo) abre um timer avulso a qualquer momento.

O progresso fica salvo no próprio navegador (localStorage).

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
src/rig.js         motor de animação 2D (esqueleto, IK/FK, músculos, equipamentos)
src/exercises.js   os 39 exercícios: poses-chave, equipamentos e instruções
src/program.js     a rotina (séries, repetições, descanso, cardio)
src/bodymap.js     mapa muscular frente/costas (SVG)
src/app.js         interface, modo treino, cronômetro e timer
src/styles.css     visual
build.mjs          junta tudo em index.html
tools/             pré-visualização das animações e testes automatizados
```

Para gerar o `index.html` depois de editar algo em `src/`: `node build.mjs`.

> Plano de referência. Ajuste as cargas para terminar cada série com 1–2 repetições sobrando, pare se sentir dor
> articular e, se possível, valide com um profissional de educação física e um nutricionista.
