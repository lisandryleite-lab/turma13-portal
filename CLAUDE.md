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
| Deploy | Vercel — subdiretório `turma13/` do repo `lisandryleite-lab/agendamento-apmp` |

## Regras absolutas

- **`matricula` é sempre `Int`/`number`, nunca `string`.** Ao receber do corpo da requisição, converter com `Number()` e validar com `isNaN()`.
- **Componentes server por padrão.** Só adicionar `"use client"` em componentes que usam hooks, eventos ou estado interativo.
- **Gráficos com SVG inline puro.** Sem `chart.js`, `recharts` ou qualquer lib de gráfico. Barras de progresso são `<div>` com `style={{ width: "X%" }}`.
- **Sem sidebar.** Navegação é top nav horizontal fixo (`<nav>` no topo). Componente: `components/nav.tsx` (área logada) e `components/app-nav.tsx` (turma13cfo2026).
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
NEXTAUTH_URL          # URL base da aplicação (ex: https://turma13-apmp.vercel.app)
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
| `/admin` | `admin/page.tsx` + `admin-client.tsx` | Painel admin: gerenciar alunos (CRUD) |

### Área pública legada — `app/turma13cfo2026/`

Rota pública (sem autenticação obrigatória) com subconjunto de funcionalidades:
`/ranking`, `/notas`, `/escalas`, `/avisos`, `/links`, `/admin/alunos`, `/admin/historico`

### Autenticação pública

`/login`, `/forgot-password`, `/reset-password`

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
Plantão externo da 2ª CIA por dia. Admin insere mensalmente. Campo `grupoPlantao`: LIMA | GOLF | HOTEL | INDIA | JULIETT | KILO.

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
