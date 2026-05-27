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
| Deploy | Vercel — repo `lisandryleite-lab/turma13-portal` · https://turma13-portal.vercel.app |

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
NEXTAUTH_URL          # URL base da aplicação — produção: https://turma13-portal.vercel.app
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

## Dados operacionais da Turma — referências estáticas

### Semana atual (`lib/utils.ts`)
`DATA_INICIO = new Date("2026-01-06")` → semana 20 = semana de 26/05/2026.
⚠️ O código atual usa Jan 05 (gera semana 21). Ajuste pendente: mudar para Jan 06.

### Turma
33 alunos ativos. Matrículas **206 e 207 removidas** da turma em maio/2026.

### Grupos de plantão — 8 grupos (atualizado maio/2026)
Ciclo **diário** (todos os dias, incluindo fins de semana).
Ordem: GOLF → HOTEL → INDIA → JULIETT → KILO → LIMA → MIKE → NOVEMBER → (repete).
Referência confirmada: **26/05/2026 = GOLF**. Verificação: 02/06/2026 = NOVEMBER.

| Grupo    | Mats                           | Membros                                                                          |
|----------|--------------------------------|----------------------------------------------------------------------------------|
| GOLF     | 1, 7, 19, 57, 143, 191         | Hellton Fernandes, Aldo Silva, Thais Figueiredo, Cleyton, Vidal, Gomes Nascimento |
| HOTEL    | 13, 23, 105, 144               | Jonas, Rodolfo Moura, Lucas Eduardo, Samuel Santos                               |
| INDIA    | 41, 60, 116                    | Alan Silva, João Nunes, Bertipalha                                               |
| JULIETT  | 94                             | André Cardoso                                                                    |
| KILO     | 26, 37, 65, 98                 | André, Pablo Torres, Kauhanni, José Menezes                                      |
| LIMA     | 114, 131, 167, 174, 186        | Josiane Farias, José Inácio, Gustavo Neto, Alexandre, Samuel Silva               |
| MIKE     | 45, 54, 81, 106, 108, 153, 165 | Gabriele Costa, Elder Carvalho, Fernando Rocha, Rafael Ribeiro, Lisandry, Hugo, Kevin Gomes |
| NOVEMBER | 55, 71, 76                     | Shirlayne, Leimig, Araújo Junior                                                 |

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
