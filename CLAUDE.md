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

### Grupo autenticado — `app/(logado)/` — **exclusivo da Turma 13**

O layout de `app/(logado)/layout.tsx` barra quem tem `turma13 === false` (mostra "Área
restrita" e manda de volta para `/inicio`). **A plataforma tem alunos do CFO de outras
turmas**: eles logam normalmente e usam o hub `/inicio` (questões, mementos, ranking,
documentos), mas nada do 1º Pelotão. Ao cadastrar aluno novo, a primeira pergunta é
**se ele é da Turma 13** — se não for, `turma13: false` e ele fica fora de
`MEMBROS_PLANTAO`, `MATRICULAS_ORDEM`, grupos de faxina e cotas financeiras.
Exemplo: `scripts/add-214-damascena.ts` (214 DAMASCENA, outra turma).

Cuidado com os mapas da 1ª CIA: eles são da **companhia inteira**, não da Turma 13 —
aparecer no mapa de equipes de plantão não significa ser do 1º Pelotão.

| Rota | Arquivo | Função |
|------|---------|--------|
| `/dashboard` | `dashboard/page.tsx` | Visão geral: progresso do curso, últimas notas, xerife, missão da semana, links rápidos |
| `/aulas` | `aulas/page.tsx` + `aulas-client.tsx` | Lista de disciplinas com carga horária e status (Server + Client) |
| `/faltas` | `faltas/page.tsx` + `faltas-client.tsx` | Limite de faltas por disciplina — 25% da carga total (Decreto 57.694/2024, frequência mínima de 75%). O contador "Faltei" é anotação pessoal em `localStorage` (`t13:faltas:v1`), nunca no banco — o portal não tem frequência oficial |
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
| `/psicologia` | Conteúdo de psicologia |
| `/documentos` | Links institucionais (SEI, ACIDES, Decreto 57.694/2024) + modelos de documentos (.docx/.pdf/.xlsx) em `public/modelos/`, com instruções (prazo, destinatário, base legal). Server component, `<details>` nativo — sem `"use client"` |
| `/ajuda-senha`, `/trocar-senha` | Suporte de senha |

### Área legada — `app/turma13cfo2026/`

Subconjunto antigo (`/ranking`, `/notas`, `/escalas`, `/avisos`, `/links`, `/admin/*`). **Hoje exige login** — não está em `PUBLIC_PATHS` do middleware. Candidata a remoção.

### Rotas públicas (sem login)

`/login`, `/forgot-password`, `/reset-password`, `/pagar/[token]` (pagamento por link único)

## Schema Prisma — modelos principais

### `User`
Aluno ou admin. `matricula` é o identificador humano (Int, único). `isAdmin` controla acesso a rotas restritas. Campos de escala: `grupoPlantao` (ALPHA/BRAVO/CHARLIE/DELTA), `grupoFaxina` (G1–G8), `canga` (nome da canga), `cangaPar` (matrícula do par, Int).

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
Plantão externo por dia. Admin insere mensalmente. Campo `grupoPlantao`: ALPHA | BRAVO | CHARLIE | DELTA (escala 3X1, ago/2026 em diante). Tabela hoje vazia — o grupo do dia sai de `grupoPlantaoPorData()`.

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
- **Permutas (DESATIVADO)**: `MilitarPlantao`, `PermutaOferta`, `PermutaSolicitacao`, `PermutaParticipante` — o módulo `/permutas` e as rotas `/api/permutas/*` foram **removidos do site** em ago/2026 a pedido da turma. Os modelos e os dados continuam no banco (nada foi apagado); se voltar, o roster em `MilitarPlantao` está com os grupos ANTIGOS da 7x1 e precisa ser refeito pelo mapa 3X1. O modelo de documento "Permuta de serviço" segue disponível em `/documentos`
- **Faxina**: `FaxinaGrupoMembro` (composição viva dos grupos G1–G8)
- **Outros**: `OPM`/`PreferenciaOPM` (batalhões RMR), `MissaoConcluida`, `LogAcesso`

## Dados operacionais da Turma — referências estáticas

### Semana atual (`lib/utils.ts`)
`DATA_INICIO = new Date("2026-01-12")` (primeira segunda-feira do curso) → semana 20 = 25/05 a 31/05/2026. Consistente com a referência das escalas (`REF_SEMANA = 20` em `lib/escalas.ts`).

### Término do curso (`lib/utils.ts`)
`DATA_FIM_CFO = 05/01/2027` (previsão da turma, ago/2026) e `diasParaFimCFO()`. A contagem
regressiva aparece no topo do `/dashboard` (`components/contagem-cfo.tsx`). `DATA_INICIO` e
`DATA_FIM_CFO` são meia-noite **UTC**, então todo cálculo com elas usa acessores UTC.

### Fuso horário — regra absoluta (`lib/utils.ts`)

As funções da Vercel rodam em **UTC**; a turma vive em **America/Recife** (UTC−3, sem horário
de verão). No **servidor**, `new Date().getDate()` vira o dia às **21h** — foi assim que o
portal passou a mostrar o plantão e a faxina de amanhã, as funções do dia errado, a contagem
regressiva um dia a menos e a semana pulando no domingo à noite.

- Todo "que dia é hoje" no servidor passa por **`partesEmRecife()`** (→ `{ano, mes, dia}`) ou
  **`hojeEmRecife()`** (→ `Date` de meia-noite, para repassar a `grupoPlantaoPorData()` /
  `grupoFaxinaPorData()`, que leem `getDate()`/`getDay()`).
- **Componentes client não precisam** — o navegador do aluno já está no fuso certo.
- **`new Date()` como carimbo de instante** (`dataPagamento`, `expires`) continua correto:
  não trocar.

### Região das funções (`vercel.json`)
`"regions": ["gru1"]` — o Neon está em `sa-east-1` (São Paulo). Rodando no padrão `iad1`
(Washington), cada consulta atravessava o continente: ~250 ms por roundtrip. Não remover.

### Turma
34 alunos ativos. Matrículas **206 e 207 removidas** da turma em maio/2026.
**1 (Hellton Fernandes) e 54 (Elder Carvalho) saíram** da Turma 13 em jun/2026; **213 (R Silva) entrou** em jun/2026 — ver `scripts/update-roster-213.ts` e `scripts/update-roster-julho.ts`. **211 (Dário)** e **212 (Camila Buonora) entraram** em jul/2026 — ver `scripts/add-dario.ts`, `scripts/add-212-camila.ts` e `scripts/integra-novatos-escalas.ts`. Lista oficial de antiguidade em `lib/escalas.ts` (`MATRICULAS_ORDEM`).

### Grupos de faxina — fonte viva no banco
A composição exibida em `/escalas` vem da tabela **`FaxinaGrupoMembro`** quando não vazia; `COMPOSICAO_FAXINA` em `lib/escalas.ts` é só fallback (mantida em sincronia). `User.grupoFaxina` (dashboard) deve espelhar a tabela — `scripts/integra-novatos-escalas.ts` sincroniza. Em jul/2026: G7 = Thais, Gabriele, Cleyton, 211 Dário, 213 R Silva; G8 = Aldo, Rodolfo, André, Pablo, 212 Camila (grupos com 5).

### Grupos de plantão — ESCALA 3X1, 4 grupos (a partir de ago/2026)
Ciclo **diário** (todos os dias, incluindo fins de semana): ALPHA → BRAVO → CHARLIE → DELTA → (repete).
Referência: **25/08/2026 (Ter) = BRAVO**, conferida contra os 12 dias de 20 a 31/08 da
escala diária da 1ª CIA — bate em todos.

Substituiu a escala **7x1 de 8 grupos** (GOLF → HOTEL → INDIA → JULIETT → KILO → LIMA →
MIKE → NOVEMBER, referência 26/05/2026 = GOLF), que valeu até julho/2026.
Migração dos dados: `scripts/migra-plantao-3x1.ts`.

| Grupo   | Mats                                          | Membros                                                                                                        |
|---------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| ALPHA   | 41, 60, 94, 108, 116, 153                     | Alan Silva, João Nunes, André Cardoso, Lisandry, Bertipalha, Hugo                                              |
| BRAVO   | 26, 37, 65, 98, 114, 131, 167, 174, 186, 212  | André, Pablo Torres, Kauhanni, José Menezes, Josiane Farias, José Inácio, Gustavo Neto, Alexandre, Samuel Silva, Camila Buonora |
| CHARLIE | 45, 55, 71, 76, 81, 106, 165                  | Gabriele Costa, Shirlayne, Leimig, Araújo Jr, Fernando Rocha, Rafael Ribeiro, Kevin Gomes                       |
| DELTA   | 7, 13, 19, 23, 57, 105, 143, 144, 191         | Aldo Silva, Jonas, Thais Figueiredo, Rodolfo Moura, Cleyton, Lucas Eduardo, Vidal, Samuel Santos, Gomes Nascimento |

**O mapa da 1ª CIA lista só 31 dos 34 alunos.** Busca no texto do PDF por "108", "LISANDRY",
"DÁRIO" e "R SILVA" não acha nada — é omissão do documento, não outro grupo.
**108 LISANDRY está em ALPHA** (informado pelo próprio em 25/08/2026, e a tabela acima já
reflete isso). **211 DÁRIO e 213 R SILVA seguem sem equipe** (`SEM_EQUIPE_PLANTAO` em
`lib/escalas.ts`, e `User.grupoPlantao` nulo) — não chutar: esperar a 1ª CIA publicar.

## Autenticação — padrão de uso

```ts
// Server Component / Route Handler
import { auth } from "@/lib/auth"

const session = await auth()
if (!session) redirect("/login")           // ou retornar 401

const { matricula, isAdmin, nomeGuerra } = session.user  // tipado — sem as any
```

Middleware em `auth.config.ts` protege todas as rotas fora de `PUBLIC_PATHS`.

## Rotas de API — padrão obrigatório (`lib/api.ts`)

Toda rota é envolvida por `rotaApi()` e todo corpo é lido com `lerCorpo()`.
Nunca chamar `req.json()` direto: corpo malformado estoura sem catch e vira 500.

```ts
import { rotaApi, lerCorpo, proibido, naoEncontrado, ErroHttp, z, zId } from "@/lib/api"

const Corpo = z.object({ id: zId, titulo: z.string().trim().min(1, "obrigatório") })

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()      // 403
  const { id, titulo } = await lerCorpo(req, Corpo)  // 400 se inválido
  ...
})
```

- **Erro se comunica com `throw`**, não com `return NextResponse.json(...)`:
  `proibido()` 403, `naoAutorizado()` 401, `naoEncontrado(x)` 404,
  `new ErroHttp(status, msg)` para o resto.
- **Mapeamento automático:** P2025 → 404, P2002/P2003 → 409,
  `PrismaClientValidationError` → 400, inesperado → 500 com `console.error`.
- **Nunca espalhar o corpo no Prisma** (`data: { ...body }`): o schema zod é a
  lista fechada de campos graváveis. Foi assim que `PUT /api/admin/alunos/[id]`
  deixava a requisição escrever `isAdmin` e `turma13`.
- **Escrita em mais de uma tabela vai em `$transaction`** (nota + histórico,
  xerife atual + novo xerife). Laço de upsert também: uma transação em vez de
  um roundtrip por item.
- `/api/*` sem sessão responde **401 JSON** (`lib/auth.config.ts`); só as
  páginas redirecionam para `/login`.
- Peças de schema prontas: `zMatricula`, `zId`, `zData`, `zSemana`.

## Prisma — padrão de importação

```ts
import { prisma } from "@/lib/prisma"
// Cliente gerado em lib/generated/prisma — não importar de @prisma/client diretamente
```

**Índices:** o Prisma **não** cria índice automático em FK no PostgreSQL. Ao adicionar
uma coluna `userId`/`xxxId` nova, declarar o `@@index` na mão.

**Migração:** `prisma db push` aplica direto no banco de produção (não há pasta
`migrations/`). Antes de rodar, conferir o SQL com
`npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`
e guardar o script + o rollback em `prisma/sql/`.

## Comandos úteis

```bash
npm run db:generate   # prisma generate (rodar após alterar schema)
npm run db:push       # prisma db push (sincronizar schema com banco)
npm run db:seed       # seed inicial de alunos, disciplinas e escalas
npm run dev           # Next.js dev server
npm run build         # build de produção

npx tsx scripts/load-qts-semana<N>.ts   # carrega o QTS da semana N e ajusta a carga das disciplinas
powershell -File scripts/gerar-bi.ps1 -Semana <N>   # gera "BI SEMANA N.html" + .pdf (Chrome headless)
```

## QTS e carga horária — como sincronizar

O QTS oficial da Divisão de Ensino traz, a partir da **semana 32**, o **contador de tempos**
por disciplina em cada aula (`POE 7/60`). Esse contador é a fonte da verdade: `load-qts-semana32.ts`
grava `cargaMinistrada` de forma **absoluta** (o último `X/Y` da semana), em vez de somar as horas
da grade como faziam os carregadores anteriores. Somar incrementalmente acumula erro quando uma
aula é cancelada ou remarcada — foi assim que POE e EASE ficaram 4h à frente e AP e TCEM 2h.
Ao carregar uma nova semana, prefira sempre transcrever os contadores oficiais.

No bloco da noite (17h30 e 18h20), a extração de texto do PDF do QTS sai desalinhada e não dá para
confiar em qual dia cada aula caiu — resolva pela **ordem crescente dos contadores** (um `TPE 9/40`
só pode vir depois do `TPE 8/40`).

## BI da Semana

`scripts/gerar-bi.ts` monta o "BI DA SEMANA" em HTML lendo tudo do banco e de `lib/escalas.ts`
(QTS, progresso do curso, xerife, aniversariantes, P1/P3/P4, faxina, plantão, funções de destaque)
— nada é digitado à mão, para o BI nunca divergir do portal. `scripts/gerar-bi.ps1` converte para
PDF A4 com Chrome headless. O BI tem que caber em **uma página**: o único ajuste é o `zoom`
(3º argumento do script, padrão `0.82`) — se sair uma página em branco no fim, baixe um pouco.
