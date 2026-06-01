import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const MATERIA = "LPMO"
const TITULO = "Memento Completo — Legislação Policial Militar e Organizacional"

const MD = `# 1. Lei Orgânica Nacional (Lei nº 14.751/2023)

## Fundamento constitucional
- **Art. 22, XXI, da CF/88** (com redação da EC nº 103/2019): compete **privativamente à União** legislar sobre normas gerais de organização, efetivos, garantias, convocação, mobilização, inatividades e pensões das PM e CBM.
- A **Lei nº 14.751, de 12/12/2023** (Lei Orgânica Nacional das PM e CBM) padroniza, em nível nacional, a organização das corporações; tem **eficácia imediata** (salvo dispositivos que exijam regulamentação).

## Atribuições (art. 5º)
- Os membros das polícias militares são autoridades de **polícia (1) administrativa, (2) ostensiva, (3) de preservação da ordem pública e (4) judiciária militar**.
- **Polícia administrativa** (atua antes do delito — direito administrativo) × **polícia judiciária** (delito como fato central — direito processual penal); **preventiva** × **repressiva**.
- As funções constitucionais (art. 144 da CF) só podem ser exercidas pelos militares que integram as corporações.

## Estrutura básica dos órgãos (art. 10 — rol "preferencial")
- **Direção** (geral e setorial), **Assessoramento**, **Apoio** (atividades-meio), **Execução** (atividades-fim) e **Correição** (corregedoria-geral).

---

# 2. Hierarquia — Postos e Graduações (art. 12, taxativo)
| Categoria | Postos / Graduações |
|---|---|
| **Oficiais superiores** | Coronel, Tenente-Coronel, Major |
| **Oficial intermediário** | Capitão |
| **Oficiais subalternos** | 1º Tenente, 2º Tenente |
| **Praças especiais** | Aspirante a Oficial, Cadete, Aluno-Oficial |
| **Praças** | Subtenente, 1º/2º/3º Sargento, Aluno-Sargento, Cabo, Soldado, Aluno-Soldado |

- A todos se acresce a designação **"PM"** ou **"BM"**. O rol do art. 12 é **taxativo** (não se pode criar ou suprimir postos/graduações).
- Em PE, a **Lei de Organização Básica** é a **Lei nº 11.328/1996**.

---

# 3. Estatuto dos Militares de PE (Lei nº 6.783/1974) — Deveres
## Deveres policiais-militares (art. 30) — emanam de vínculos racionais e morais:
- **I** — dedicação integral ao serviço e fidelidade à instituição, **mesmo com o sacrifício da própria vida**;
- **II** — o culto aos símbolos nacionais;
- **III** — a probidade e a lealdade em todas as circunstâncias;
- **IV** — a disciplina e o respeito à hierarquia;
- **V** — o rigoroso cumprimento das obrigações e ordens;
- **VI** — tratar o subordinado dignamente e com urbanidade.

> 🔑 As **obrigações** ligam-se aos valores (seção I) e à ética (seção II); os **deveres** decorrem do vínculo individual de cada militar.

---

# 4. Direitos, Recursos e Elegibilidade
## Direitos (art. 49)
- Garantia da **patente** (oficial); **estabilidade** da praça com **10 anos** de efetivo serviço; uso das designações hierárquicas; ocupação de cargo; **promoção**; transferência para a reserva a pedido ou reforma; férias, afastamentos e licenças; pensão; **porte de arma** (oficial em atividade ou inatividade; praças com restrições do Comando-Geral).

## Recurso administrativo (art. 50)
- O militar que se julgar prejudicado pode interpor **pedido de reconsideração, queixa ou representação**. Prescreve em:
  - **15 dias** corridos — quota compulsória ou composição de Quadro de Acesso;
  - **120 dias** corridos — nos demais casos.
- Tais pedidos **não podem ser coletivos**.

## Elegibilidade (art. 51)
- Com **menos de 5 anos** de serviço, ao se candidatar → excluído do serviço ativo. Com **5 anos ou mais** → afastado e agregado; se eleito, transferido para a reserva na diplomação.

---

# 5. Prerrogativas (arts. 68–70)
- Uso de títulos, uniformes, distintivos e insígnias correspondentes ao posto/graduação; honras e sinais de respeito.
- **Cumprimento de prisão/detenção somente em organização policial-militar** cujo comandante tenha precedência hierárquica sobre o preso.
- **Julgamento em foro especial** nos crimes militares.
- **Prisão somente em flagrante delito** (a autoridade deve entregá-lo imediatamente à autoridade PM mais próxima).
- Dispensa do **serviço de júri** e do serviço na **justiça eleitoral** (no exercício de funções PM).

---

# 6. Sistema de Proteção Social (SPSMPE)
- Criado pela **LC nº 460/2021**: conjunto de direitos e serviços que asseguram remuneração, inatividade e pensão militar dos integrantes da PMPE/CBMPE e dependentes.
- Gerido, a partir de **01/01/2022**, pela **FUNAPE** (Fundação de Aposentadorias e Pensões dos Servidores do Estado).

---

# 7. Situações Especiais
- **Agregação (art. 75):** o militar da ativa permanece **sem número** na escala hierárquica. **Não abre vaga** (inclusive para promoção). Faz-se por ato do **Governador**. Ex.: nomeação para cargo civil, aguardar reserva ex-officio, licença prolongada, deserção.
- **Reversão (art. 78):** ato pelo qual o militar agregado **retorna ao quadro** assim que cessa o motivo da agregação.
- **Excedente (art. 80):** situação **transitória** — ex.: promovido **por bravura** sem haver vaga; ocupa a primeira vaga que surgir. É considerado em efetivo serviço.
- **Ausente (art. 81):** quem, por **mais de 24 horas** consecutivas, deixa de comparecer à OME sem comunicar. **Desertor:** esgotado o prazo que caracteriza a deserção no Código Penal Militar.

---

# 8. Desligamento do Serviço Ativo
## Reserva remunerada (Lei 6.783/74)
- **A pedido (art. 89)** ou **ex-officio (art. 90)**.
- **Ex-officio por idade:** **67 anos** (oficiais) e **63 anos** (praças). Há ainda a compulsória por tempo no posto/graduação (regras conforme a data de ingresso) e por decorrência de promoção requerida.

## Reforma (arts. 93–94)
- Fase da inatividade em que **inexiste definitivamente** a possibilidade de retorno ao serviço ativo; ocorre **sempre de ofício**.
- Hipóteses: **idade-limite de 70 anos**; incapacidade definitiva (ferimento/acidente/doença); agregado por mais de 2 anos por incapacidade temporária; condenação à pena de reforma (CPM); decisão do TJPE (oficial, via Conselho de Justificação).

## Demissão / perda do posto e patente
- Ao **oficial**, a perda do posto e patente conduz à **demissão ex-officio** (declaração de indignidade ou incompatibilidade com o oficialato, por decisão do TJPE).

---

# 9. Remuneração, Promoção e Afastamentos
## Remuneração
- **Soldo** (e quotas de soldo) + **gratificações** (ex.: GLE — Localidade Especial, GSE — Serviço Extraordinário, GAT, GOEPM, risco de plantão, perigo laboral, atividade de inteligência) + **indenizações** (vale-refeição, auxílio-uniforme, ajuda de custo, diárias).

## Promoção
- Ato administrativo formal de **ascensão na carreira**, baseado no **mérito** e na **antiguidade**. A SV nº 43 do STF veda provimento que permita investir-se, sem concurso, em cargo de carreira diversa.

## Afastamentos e licenças
- **Férias**, afastamentos temporários e **licenças** (para tratamento de saúde própria/de familiar, para tratar de interesse particular, **licença-maternidade e licença-paternidade**).`

type Card = { modulo: string; frente: string; verso: string }

const CARDS: Card[] = [
  // ── Módulo 1 — Lei Orgânica Nacional ──
  { modulo: "1", frente: "Lei Orgânica Nacional — Fundamento Constitucional", verso:
`• Fundamento: art. 22, XXI, da CF/88 (redação da EC 103/2019) — competência PRIVATIVA da União para normas gerais das PM e CBM.
• A Lei nº 14.751, de 12/12/2023, é a Lei Orgânica Nacional das PM e CBM; tem eficácia imediata (salvo dispositivos que exijam regulamentação).` },
  { modulo: "1", frente: "Atribuições da PM — As 4 polícias (art. 5º)", verso:
`• Os membros das PM são autoridades de polícia: (1) administrativa, (2) ostensiva, (3) de preservação da ordem pública e (4) judiciária militar.
• Polícia administrativa: atua ANTES do delito (direito administrativo). Polícia judiciária: tem o delito como fato central (direito processual penal).` },
  { modulo: "1", frente: "Estrutura Básica dos Órgãos (art. 10)", verso:
`• 5 tipos (rol preferencial, não taxativo): Direção, Assessoramento, Apoio (atividades-meio), Execução (atividades-fim) e Correição (corregedoria-geral).
• Em PE, a Lei de Organização Básica é a Lei nº 11.328/1996.` },

  // ── Módulo 2 — Hierarquia ──
  { modulo: "2", frente: "Hierarquia — Oficiais (art. 12)", verso:
`• Oficiais superiores: Coronel, Tenente-Coronel e Major.
• Oficial intermediário: Capitão.
• Oficiais subalternos: 1º Tenente e 2º Tenente.` },
  { modulo: "2", frente: "Hierarquia — Praças Especiais e Praças (art. 12)", verso:
`• Praças especiais: Aspirante a Oficial, Cadete e Aluno-Oficial.
• Praças: Subtenente, 1º/2º/3º Sargento, Aluno-Sargento, Cabo, Soldado e Aluno-Soldado.
• A todos acresce-se "PM" ou "BM". O rol do art. 12 é TAXATIVO.` },

  // ── Módulo 3 — Deveres ──
  { modulo: "3", frente: "Deveres Policiais-Militares (art. 30)", verso:
`I – dedicação integral ao serviço e fidelidade à instituição, mesmo com o sacrifício da própria vida;
II – o culto aos símbolos nacionais;
III – a probidade e a lealdade em todas as circunstâncias;
IV – a disciplina e o respeito à hierarquia;
V – o rigoroso cumprimento das obrigações e ordens;
VI – tratar o subordinado dignamente e com urbanidade.` },
  { modulo: "3", frente: "Obrigações × Deveres", verso:
`• Obrigações: ligadas aos valores (seção I) e à ética (seção II); transcendem a individualidade.
• Deveres: decorrem do vínculo racional e moral individual de cada policial militar ao envergar a farda.` },

  // ── Módulo 4 — Direitos / recursos / elegibilidade ──
  { modulo: "4", frente: "Direitos dos Policiais-Militares (art. 49)", verso:
`• Garantia da patente (oficial); estabilidade da praça com 10 anos de efetivo serviço; promoção; férias, afastamentos e licenças; pensão; porte de arma (oficial; praças com restrições do Comando-Geral); transferência para a reserva a pedido ou reforma.` },
  { modulo: "4", frente: "Recurso Administrativo — Prazos (art. 50)", verso:
`• Pedido de reconsideração, queixa ou representação.
• Prescreve em 15 dias corridos (quota compulsória ou composição de Quadro de Acesso) ou em 120 dias corridos (demais casos).
• Não podem ser feitos coletivamente.` },
  { modulo: "4", frente: "Elegibilidade do Militar (art. 51)", verso:
`• Com menos de 5 anos de serviço, ao se candidatar a cargo eletivo → excluído do serviço ativo (demissão/licenciamento ex-officio).
• Com 5 anos ou mais → afastado e agregado; se eleito, transferido para a reserva na diplomação.` },

  // ── Módulo 5 — Prerrogativas ──
  { modulo: "5", frente: "Prerrogativas — Prisão e Foro (arts. 68–69)", verso:
`• Cumprimento de prisão/detenção SOMENTE em organização policial-militar cujo comandante tenha precedência hierárquica sobre o preso.
• Julgamento em foro especial nos crimes militares.
• Prisão somente em flagrante delito — a autoridade deve entregá-lo de imediato à autoridade PM mais próxima.` },
  { modulo: "5", frente: "Prerrogativas — Júri e Justiça Eleitoral (art. 70)", verso:
`• Os policiais-militares da ativa, no exercício de funções policiais-militares, são dispensados do serviço de júri na justiça civil e do serviço na justiça eleitoral.` },

  // ── Módulo 6 — Proteção social ──
  { modulo: "6", frente: "Sistema de Proteção Social (SPSMPE)", verso:
`• Criado pela LC nº 460/2021: assegura remuneração, inatividade e pensão militar dos integrantes da PMPE/CBMPE e dependentes.
• Gerido, a partir de 01/01/2022, pela FUNAPE (Fundação de Aposentadorias e Pensões dos Servidores do Estado de PE).` },

  // ── Módulo 7 — Situações especiais ──
  { modulo: "7", frente: "Agregação (art. 75)", verso:
`• Situação em que o militar da ativa permanece SEM número na escala hierárquica.
• NÃO abre vaga (inclusive para efeito de promoção).
• Faz-se por ato do Governador. Ex.: nomeação para cargo civil, aguardar reserva ex-officio, licenças prolongadas, deserção.` },
  { modulo: "7", frente: "Reversão (art. 78)", verso:
`• Ato pelo qual o militar agregado RETORNA ao respectivo quadro, assim que cessa o motivo da agregação, voltando a ocupar seu lugar na escala numérica.` },
  { modulo: "7", frente: "Excedente (art. 80)", verso:
`• Situação TRANSITÓRIA — ex.: o militar promovido por bravura sem haver vaga.
• Ocupa a primeira vaga que surgir; é considerado em efetivo serviço para todos os efeitos.` },
  { modulo: "7", frente: "Ausente × Desertor (art. 81)", verso:
`• Ausente: quem, por mais de 24 horas consecutivas, deixa de comparecer à OME sem comunicar.
• Desertor: quando esgotado o prazo que caracteriza a deserção no Código Penal Militar.` },

  // ── Módulo 8 — Desligamento ──
  { modulo: "8", frente: "Reserva Remunerada — A Pedido × Ex-Officio", verso:
`• A pedido (art. 89) ou ex-officio (art. 90).
• Ex-officio por IDADE: 67 anos (oficiais) e 63 anos (praças).
• Há ainda a compulsória por tempo no posto/graduação e por decorrência de promoção requerida.` },
  { modulo: "8", frente: "Reforma (arts. 93–94)", verso:
`• Fase da inatividade em que inexiste definitivamente a possibilidade de retorno ao serviço ativo; ocorre SEMPRE de ofício.
• Hipóteses: idade-limite de 70 anos; incapacidade definitiva; agregado por +2 anos por incapacidade temporária; condenação à pena de reforma (CPM); decisão do TJPE (oficial).` },
  { modulo: "8", frente: "Demissão e Perda do Posto (Oficial)", verso:
`• A perda do posto e da patente conduz à demissão ex-officio do oficial.
• Decorre da declaração de indignidade ou incompatibilidade com o oficialato, por decisão do Tribunal de Justiça de Pernambuco.` },

  // ── Módulo 9 — Remuneração / promoção / afastamentos ──
  { modulo: "9", frente: "Remuneração do Militar", verso:
`• Composta por Soldo (e quotas de soldo) + gratificações (ex.: GLE – Localidade Especial, GSE – Serviço Extraordinário, GAT, GOEPM, risco de plantão, perigo laboral, inteligência) + indenizações (vale-refeição, auxílio-uniforme, ajuda de custo, diárias).` },
  { modulo: "9", frente: "Promoção", verso:
`• Ato administrativo formal de ascensão na carreira, baseado no mérito e na antiguidade.
• A Súmula Vinculante nº 43 do STF veda provimento que permita investir-se, sem concurso, em cargo de carreira diversa.` },
  { modulo: "9", frente: "Afastamentos e Licenças", verso:
`• Férias, afastamentos temporários e licenças: para tratamento de saúde própria ou de familiar, para tratar de interesse particular, e licença-maternidade e licença-paternidade.` },
]

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MATERIA } })
  if (!disc) throw new Error(`Disciplina ${MATERIA} não existe.`)

  await prisma.memento.upsert({
    where: { materia_modulo_titulo: { materia: MATERIA, modulo: "", titulo: TITULO } },
    update: { conteudoMd: MD, ordem: 0 },
    create: { materia: MATERIA, modulo: "", titulo: TITULO, conteudoMd: MD, ordem: 0 },
  })
  console.log(`✓ Memento de ${MATERIA} salvo (${MD.length} caracteres).`)

  let n = 0
  for (const c of CARDS) {
    const hash = createHash("sha1").update(`${MATERIA}|${c.modulo}|${c.frente}`).digest("hex")
    await prisma.flashcard.upsert({
      where: { hash },
      update: { verso: c.verso, ordem: n },
      create: { materia: MATERIA, modulo: c.modulo, frente: c.frente, verso: c.verso, ordem: n, hash },
    })
    n++
  }
  console.log(`✓ ${n} flashcards de ${MATERIA} importados/atualizados.`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
