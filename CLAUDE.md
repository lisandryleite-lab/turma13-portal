# Portal CFO PM 2026 — Turma 13 · Contexto para Agentes

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript 5 (strict mode) |
| Estilo | Tailwind CSS v4 + CSS variables inline |
| ORM | Prisma 7 com adapter Neon (PostgreSQL serverless) |
| Autenticação | NextAuth v5 beta (next-auth@5.0.0-beta.31), estratégia JWT |
| E-mail | Resend |
| Deploy | Vercel — repo `lisandryleite-lab/turma13-portal` · produção **https://portalcfo2026.com.br** (deploy MANUAL: `vercel --prod`; sem auto-deploy do GitHub) |

## Regras absolutas

- **`matricula` é sempre `Int`/`number`, nunca `string`.** Ao receber do corpo da requisição, converter com `Number()` e validar com `isNaN()`.
- **Componentes server por padrão.** Só adicionar `"use client"` em componentes que usam hooks, eventos ou estado interativo.
- **Gráficos com SVG inline puro.** Sem `chart.js`, `recharts` ou qualquer lib de gráfico. Barras de progresso são `<div>` com `style={{ width: "X%" }}`.
- **Navegação:** sidebar vertical colapsada no desktop — 64px com ícones SVG inline, expande para 220px no hover (`components/nav.tsx`). Bottom nav fixo no mobile com 5 ícones principais (`components/bottom-nav.tsx`). Item Admin só aparece para `isAdmin === true`. Sem biblioteca de ícones — SVG inline (Lucide paths).
- **Paleta de cores via CSS variables** (definidas em `app/globals.css`):
  - `--azul-profundo: #0B2D5E`
  - `--azul-medio: #1A52A8`
  - `--dourado: #B8924A`
  - `--creme: #F4F7FC`
- **Tipagem da sessão:** campos customizados estão declarados em `types/next-auth.d.ts`. Nunca usar `(session.user as any)`. Acessar diretamente: `session.user.matricula`, `session.user.isAdmin`, `session.user.nomeGuerra`.

## Variáveis de ambiente necessárias

```
DATABASE_URL          # Neon PostgreSQL connection string
AUTH_SECRET           # Segredo NextAuth (openssl rand -base64 32)
RESEND_API_KEY        # API key do Resend para e-mails
NEXTAUTH_URL          # URL base da aplicação — produção: https://portalcfo2026.com.br
```

## Estrutura de páginas

### Grupo autenticado — `app/(logado)/`

| Rota | Arquivo | Função |
|------|---------|--------|
| `/dashboard` | `dashboard/page.tsx` | Visão geral: progresso do curso, últimas notas, xerife, missão da semana, links rápidos |
| `/aulas` | `aulas/page.tsx` + `aulas-client.tsx` | Lista de disciplinas com carga horária e status (Server + Client) |
| `/escalas` | `escalas/page.tsx` + `escalas-client.tsx` | Escalas de serviço, faxina, plantão — semana atual e visualização mensal |
| `/avisos` | `avisos/page.tsx` + `avisos-client.tsx` | Quadro de avisos com fixação e destaque; admin pode criar/editar |
| `/missao` | `missao/page.tsx` + `missao-admin.tsx` | Missão da semana; admin pode editar |
| `/qts` | `qts/page.tsx` + `qts-admin.tsx` | Quadro de trabalho semanal (JSON estruturado) |
| `/turma` | `turma/page.tsx` + `turma-client.tsx` | Diretório da turma: alunos, hierarquia, funções fixas, cangas |
| `/xerifancia` | `xerifancia/page.tsx` + `xerifancia-admin.tsx` | Histórico e xerife atual |
| `/aniversarios` | `aniversarios/page.tsx` | Aniversariantes do mês |
| `/links` | `links/page.tsx` | Links úteis (cards estáticos) |
| `/financeiro` | `financeiro/` | Cotas mensal/extra + lanche coletivo; pagamento em 2 níveis (aluno declara, tesoureiro confirma); gate por `ehGestorFinanceiro` (`lib/financeiro.ts`) |
| `/comunicados` | `comunicados/` | Comunicados da turma |
| `/alterar-senha` | `alterar-senha/` | Troca de senha do próprio usuário |
| `/admin` | `admin/page.tsx` + `admin-client.tsx` | Painel admin: gerenciar alunos (CRUD) |

### Grupo CFO — `app/(cfo)/` (autenticado, layout próprio sem sidebar)

| Rota | Função |
|------|--------|
| `/inicio`, `/painel` | Hub de estudo / painel geral |
| `/mementos` | Mementos resumidos por disciplina + flashcards |
| `/questoes` | Banco de questões por disciplina/bateria |
| `/ranking` | Ranking da turma |
| `/permutas` | Permuta de plantões (cadeia direta/triangular, SEI opcional; cada aluno vê só as permutas de que participa) — usa `MilitarPlantao` |
| `/psicologia` | Conteúdo de psicologia |
| `/documentos` | Links institucionais (SEI, ACIDES, Decreto 57.694/2024) + modelos de documentos (.docx/.pdf/.xlsx) em `public/modelos/`, com instruções (prazo, destinatário, base legal). Server component, `<details>` nativo — sem `"use client"` |
| `/ajuda-senha`, `/trocar-senha` | Suporte de senha |

### Área legada — `app/turma13cfo2026/`

Subconjunto antigo (`/ranking`, `/notas`, `/escalas`, `/avisos`, `/links`, `/admin/*`). **Hoje exige login** — não está em `PUBLIC_PATHS` do middleware. Candidata a remoção.

### Rotas públicas (sem login)

`/login`, `/forgot-password`, `/reset-password`, `/pagar/[token]` (pagamento por link único)

## Schema Prisma — modelos principais

### `User`
Aluno ou admin. `matricula` é o identificador humano (Int, único). `isAdmin` controla acesso a rotas restritas. Campos de escala: `grupoPlantao` (LIMA/GOLF/…), `grupoFaxina` (G1–G8), `canga` (nome da canga), `cangaPar` (matrícula do par, Int).

### `Nota`
Nota de avaliação de um aluno em uma disciplina. Campos: `disciplina` (sigla), `avaliacao` (ex: "P1"), `nota` (Float), `peso` (Float, padrão 1), `ehAF` (se é 2ª chamada), `apto` (aprovado sem nota numérica). Toda criação/edição/exclusão gera um `HistoricoNota`.

### `Disciplina`
Registro de disciplina do curso. Campos: `sigla` (único), `nome`, `modulo`, `cargaTotal` (horas), `cargaMinistrada`, `status` (Início/Em andamento/Encerrada).

### `EscalaServico` / `EscalaFaxina` / `EscalaPlantao`
Escalas semanais da turma: serviço (xerife, P1, P3, P4), faxina (grupo + local) e plantão (grupo + tipo). Chave: `semana` (número inteiro 1–52).

### `EscalaTurmaFaxina` / `EscalaTurmaServico`
Escalas nominais da turma com data exata, posição e userId.

### `EscalaAluno`
Escala individual de um aluno (plantão externo, faxina de alojamento, etc.) com data, hora e função.

### `PlantaoDia`
Plantão externo da 2ª CIA por dia. Admin insere mensalmente. Campo `grupoPlantao`: GOLF | HOTEL | INDIA | JULIETT | KILO | LIMA | MIKE | NOVEMBER (8 grupos).

### `FuncaoDestaqueDia`
Funções de destaque diárias (Mestre, Leitor, Discurso, Comandante) com matrícula do responsável.

### `Missao`
Missão da semana (semana Int único, titulo, corpo).

### `QTS`
Quadro de trabalho semanal. Campo `dados` é JSON livre estruturado pelo frontend.

### `Xerife`
Histórico de xerifes. Campo `atual: Boolean` marca o xerife vigente.

### `FaxinaRef`
Data de referência para cálculo automático da rotação de faxina.

### `Aviso`
Avisos gerais. `fixado` mantém no topo; `destaque` aplica estilo especial.

### Demais modelos (schema tem 43 no total)
- **Estudo**: `Memento`, `Flashcard`, `Questao`, `Resposta`, `Gaivota` (dúvidas), `NotaCFO`/`HistoricoNotaCFO`/`NotaHistorica` (notas oficiais do CFO)
- **Financeiro**: `CotaFinanceira`, `PagamentoCota` (token público de pagamento), `PedidoLanche`, `ItemLanche`, `PedidoLancheAluno`, `LinhaPedidoLanche`
- **Permutas**: `MilitarPlantao` (roster completo da CIA), `PermutaOferta`, `PermutaSolicitacao`, `PermutaParticipante`
- **Faxina**: `FaxinaGrupoMembro` (composição viva dos grupos G1–G8)
- **Outros**: `OPM`/`PreferenciaOPM` (batalhões RMR), `MissaoConcluida`, `LogAcesso`

## Dados operacionais da Turma — referências estáticas

### Semana atual (`lib/utils.ts`)
`DATA_INICIO = new Date("2026-01-12")` (primeira segunda-feira do curso) → semana 20 = 25/05 a 31/05/2026. Consistente com a referência das escalas (`REF_SEMANA = 20` em `lib/escalas.ts`).

### Turma
34 alunos ativos. Matrículas **206 e 207 removidas** da turma em maio/2026.
**1 (Hellton Fernandes) e 54 (Elder Carvalho) saíram** da Turma 13 em jun/2026; **213 (R Silva) entrou** em jun/2026 — ver `scripts/update-roster-213.ts` e `scripts/update-roster-julho.ts`. **211 (Dário)** e **212 (Camila Buonora) entraram** em jul/2026 — ver `scripts/add-dario.ts`, `scripts/add-212-camila.ts` e `scripts/integra-novatos-escalas.ts`. Lista oficial de antiguidade em `lib/escalas.ts` (`MATRICULAS_ORDEM`).

### Usuários fora da Turma 13 (`turma13: false`)
O portal também hospeda alunos de outros pelotões do CFO 2026. Eles têm `turma13: false` e por isso só acessam a **área CFO** (`app/(cfo)/`: `/inicio`, `/mementos`, `/questoes`, `/ranking`, `/permutas`, `/documentos`, `/trocar-senha`) — o grupo `(logado)` é bloqueado pelo próprio `app/(logado)/layout.tsx`. Com `turma: 3` contam no `turmaSize` do `/ranking` e do `/painel`.
**Turma 19** (set/2026, `scripts/add-turma19.ts`): 199 BARROS, 203 J LUIZ, 217 SALUSTIANO, 218 COELHO, 219 BRENER, 220 RATIS. Senha inicial = a própria matrícula.

### Grupos de faxina — fonte viva no banco
A composição exibida em `/escalas` vem da tabela **`FaxinaGrupoMembro`** quando não vazia; `COMPOSICAO_FAXINA` em `lib/escalas.ts` é só fallback (mantida em sincronia). `User.grupoFaxina` (dashboard) deve espelhar a tabela — `scripts/integra-novatos-escalas.ts` sincroniza. Em jul/2026: G7 = Thais, Gabriele, Cleyton, 211 Dário, 213 R Silva; G8 = Aldo, Rodolfo, André, Pablo, 212 Camila (grupos com 5).

### Grupos de plantão — 8 grupos (atualizado jul/2026 — Mapa de Equipes, escala 7x1)
Ciclo **diário** (todos os dias, incluindo fins de semana).
Ordem: GOLF → HOTEL → INDIA → JULIETT → KILO → LIMA → MIKE → NOVEMBER → (repete).
Referência confirmada: **26/05/2026 = GOLF**. Verificação: 02/06/2026 = NOVEMBER.

| Grupo    | Mats                      | Membros                                                                          |
|----------|---------------------------|----------------------------------------------------------------------------------|
| GOLF     | 7, 19, 57, 143, 191       | Aldo Silva, Thais Figueiredo, Cleyton, Vidal, Gomes Nascimento                   |
| HOTEL    | 13, 23, 105, 144, 211     | Jonas, Rodolfo Moura, Lucas Eduardo, Samuel Santos, Dário                        |
| INDIA    | 41, 60, 116               | Alan Silva, João Nunes, Bertipalha                                               |
| JULIETT  | 94, 213                   | André Cardoso, R Silva                                                          |
| KILO     | 26, 37, 65, 98, 212       | André, Pablo Torres, Kauhanni, José Menezes, Camila Buonora                      |
| LIMA     | 114, 131, 167, 174, 186   | Josiane Farias, José Inácio, Gustavo Neto, Alexandre, Samuel Silva               |
| MIKE     | 45, 81, 106, 108, 153, 165| Gabriele Costa, Fernando Rocha, Rafael Ribeiro, Lisandry, Hugo, Kevin Gomes      |
| NOVEMBER | 55, 71, 76                | Shirlayne, Leimig, Araújo Junior                                                 |

## Autenticação — padrão de uso

```ts
// Server Component / Route Handler
import { auth } from "@/lib/auth"

const session = await auth()
if (!session) redirect("/login")           // ou retornar 401

const { matricula, isAdmin, nomeGuerra } = session.user  // tipado — sem as any
```

Middleware em `auth.config.ts` protege todas as rotas fora de `PUBLIC_PATHS`.

## Prisma — padrão de importação

```ts
import { prisma } from "@/lib/prisma"
// Cliente gerado em lib/generated/prisma — não importar de @prisma/client diretamente
```

## Comandos úteis

```bash
npm run db:generate   # prisma generate (rodar após alterar schema)
npm run db:push       # prisma db push (sincronizar schema com banco)
npm run db:seed       # seed inicial de alunos, disciplinas e escalas
npm run dev           # Next.js dev server
npm run build         # build de produção
```
