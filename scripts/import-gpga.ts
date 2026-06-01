import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const MATERIA = "GPGA"
const TITULO = "Memento Completo — Gestão Pública Geral Aplicada"

const MD = `# 1. Conceitos Gerais da Gestão Pública

## Estado, Governo e Administração
- **Estado:** organização político-jurídica de uma nação — **permanente** e intangível (ente moral). Detém o poder extroverso.
- **Governo:** parte política que conduz a coisa pública — **transitório** e tangível; define os objetivos nacionais e exerce o poder de forma soberana.
- **Administração:** todo o aparato (estrutura, órgãos, agentes, serviços) à disposição do Governo para realizar os fins do Estado (bem comum).

## Administração × Gestão
- São **sinônimas**; "gestão" é a denominação mais moderna, que foge do tecnicismo e incorpora medidas gerenciais mais efetivas.

## Gestão Pública × Gestão Privada
- **Pública:** objetivo é o **bem-estar coletivo**; sujeita aos princípios do art. 37 da CF; em regra monopolista; o cidadão paga via **impostos** (mesmo sem usar); menos autonomia.
- **Privada:** objetivo é o **lucro**; livre concorrência; paga-se só pelo que se usa; mais flexível e autônoma.

## Eficiência, Eficácia e Efetividade
- **Eficácia:** alcance dos objetivos (o que se pretendia × o que se conseguiu).
- **Eficiência:** relação entre resultados e recursos empregados (uso econômico/produtivo).
- **Efetividade:** une ações eficientes ao alcance de máximos resultados.

## Centralização/Descentralização e Concentração/Desconcentração
- **Centralização:** decisões concentradas no topo. **Descentralização:** decisões delegadas aos níveis mais baixos.
- **Desconcentração:** distribuição de competências **dentro da mesma pessoa jurídica** (mantém a hierarquia; usada na Administração direta). **Concentração:** sentido inverso.

## Governança, Governabilidade, Accountability e Compliance
- **Governabilidade:** capacidade **política** de governar (legitimidade e apoio da sociedade/representantes).
- **Governança:** capacidade **financeira e administrativa** de implementar políticas públicas.
- **Accountability:** obrigação de **prestar contas** das responsabilidades outorgadas.
- **Compliance:** **conformidade** — governança baseada no cumprimento de padrões normativos e legais (ética, transparência).

## Cargo × Função (PMPE)
- **Cargo:** posição que a pessoa ocupa na estrutura organizacional.
- **Função:** conjunto de tarefas e responsabilidades do cargo (definidas em regimentos internos).

---

# 2. Evolução Histórica e Princípios

## Evolução histórica da AP no Brasil
- A maior parte da história do Brasil (colônia e império) foi marcada pelo **patrimonialismo**: a governança se confunde com a pessoalidade do governante ("O Estado sou eu") — não há separação entre o público e o privado. Com a República, iniciou-se uma gestão mais técnica.

## Princípios da Administração Pública (art. 37 da CF — "LIMPE")
- **Legalidade:** só fazer o previsto em lei (sob pena de invalidade do ato e responsabilização).
- **Impessoalidade:** atuação dirigida a todos, sem discriminação ou favorecimento.
- **Moralidade:** atuação conforme os princípios morais e o bom administrador.
- **Publicidade:** divulgação obrigatória dos atos (em regra, no Diário Oficial).
- **Eficiência:** presteza, racionalidade e qualidade do serviço público.

---

# 3. Organização da Administração Pública

## Administração Direta
- Órgãos ligados **diretamente** ao ente central de cada poder/esfera. **Não possuem personalidade jurídica própria** — são centros de competências despersonalizados.

## Administração Indireta
- Pessoas jurídicas criadas para um fim, **descentralizadas e autônomas**, vinculadas à Administração direta:
  - **Serviços públicos:** **autarquias** e **fundações**.
  - **Atividade econômica:** **empresas públicas** e **sociedades de economia mista**.

## Terceiro Setor
- Figura **híbrida/paraestatal**: entes privados em atividades de interesse público, **sem fins lucrativos** (serviços sociais autônomos, organizações sociais, OSCIP, ONGs).

---

# 4. Ciclos de Gestão: PPA, LDO e LOA

| Instrumento | O que faz | Prazo (envio → devolução) |
|---|---|---|
| **PPA** (Plano Plurianual) | Objetivos, diretrizes e metas por **4 anos** (art. 165 CF) | até **31/ago** do 1º ano → **22/dez** |
| **LDO** (Lei de Diretrizes Orçamentárias) | Anual; detalha metas/prioridades e **orienta a LOA** | até **15/abr** → **17/jul** |
| **LOA** (Lei Orçamentária Anual) | **Estima receitas e fixa despesas** do ano seguinte | até **31/ago** → **22/dez** |

---

# 5. Licitações e Contratos (Lei nº 14.133/2021)
- A **Lei nº 14.133/2021** estabelece as normas gerais de licitação e contratos.
- **Contrato público:** ajuste entre a Administração e particulares para serviços/produtos, com cláusulas que vinculam as partes.
- **Licitação:** procedimento legal para selecionar a proposta mais vantajosa.
- **5 modalidades:** **concorrência, concurso, leilão, pregão e diálogo competitivo**.
- Em casos especiais, a contratação pode ocorrer por **dispensa** ou **inexigibilidade** de licitação.

---

# 6. Políticas Públicas
- **Política pública:** fluxo de decisões públicas voltado a manter o equilíbrio social ou a modificar a realidade.
- **Características:** **institucional** (instituída em programas de governo), **decisória**, **comportamental** ("vontade de fazer") e **causal** (gera impactos sociais).
- **Ciclo:** 1) construção da agenda → 2) formulação da política → 3) processo decisório → 4) implementação → 5) avaliação.

---

# 7. Instrumentos de Controle da Administração Pública
- Fundamento: **art. 70 da CF** — fiscalização contábil, financeira, orçamentária, operacional e patrimonial por **controle externo** (Congresso) e **controle interno** de cada Poder. O cerne é a **legalidade** dos atos.

**Classificações do controle:**
- **Quanto à origem:** **interno** (dentro do próprio poder — ex.: CGU) e **externo** (fora do poder controlado — ex.: TCU/Congresso, MP, controle social).
- **Quanto ao momento:** **prévio/preventivo**, **concomitante** e **posterior/corretivo**.
- **Quanto ao aspecto:** **legalidade** (conformidade) e **mérito** (conveniência, eficiência e oportunidade).
- **Quanto à amplitude:** **hierárquico** (superior fiscaliza inferior) e **finalístico** (Adm. direta fiscaliza a indireta).
- **Quanto aos órgãos:** administrativos, legislativos ou judiciais.

---

# 8. Ferramentas Gerenciais
- **Benchmarking:** comparar a própria atividade/produto com uma referência/concorrente, buscando boas práticas e melhoria contínua.
- **PDCA (Ciclo Deming):** **Plan, Do, Check, Action** — ciclo contínuo de melhoria da efetividade (origem nos anos 1950).
- **Diagrama de Pareto (80/20):** 80% dos problemas decorrem de 20% das causas — estratifica e foca nos prioritários.
- **Kaizen:** melhoria contínua, com envolvimento permanente das pessoas.
- **Orçamento participativo:** distribui a responsabilidade da alocação de recursos com os stakeholders.
- Outras: Brainstorming, Ishikawa, Downsizing, BSC, 5S, TQC, Planejamento Estratégico.

---

# 9. Estrutura Organizacional e Gestão de Excelência
- A **estrutura organizacional** é o modo pelo qual a autoridade é distribuída, as atividades são divididas e a comunicação é estabelecida — representada graficamente pelo **organograma**.
- A **gestão pública de excelência** busca a **qualidade contínua**, medindo eficiência e eficácia pelo cumprimento da missão e pelo atendimento, com qualidade, das necessidades do cidadão.`

type Card = { modulo: string; frente: string; verso: string }

const CARDS: Card[] = [
  // ── Módulo 1 — Conceitos gerais ──
  { modulo: "1", frente: "Estado, Governo e Administração", verso:
`• Estado: organização político-jurídica PERMANENTE e intangível (ente moral); detém o poder extroverso.
• Governo: parte política TRANSITÓRIA e tangível que conduz a coisa pública e define os objetivos nacionais.
• Administração: o aparato (estrutura, órgãos, agentes, serviços) para realizar os fins do Estado.` },
  { modulo: "1", frente: "Administração × Gestão", verso:
`• São termos sinônimos.
• "Gestão" é a denominação mais moderna — foge do tecnicismo da administração e incorpora medidas gerenciais mais efetivas.` },
  { modulo: "1", frente: "Gestão Pública × Gestão Privada", verso:
`• Pública: objetivo é o bem-estar coletivo; sujeita aos princípios do art. 37 da CF; em regra monopolista; o cidadão paga via impostos (mesmo sem usar).
• Privada: objetivo é o lucro; livre concorrência; paga-se só pelo que se usa; mais flexível e autônoma.` },
  { modulo: "1", frente: "Eficiência, Eficácia e Efetividade", verso:
`• Eficácia: alcance dos OBJETIVOS (o que se pretendia × o que se conseguiu).
• Eficiência: relação entre RESULTADOS e RECURSOS (uso econômico/produtivo).
• Efetividade: une ações eficientes ao alcance de máximos resultados.` },
  { modulo: "1", frente: "Centralização × Descentralização", verso:
`• Centralização: decisões concentradas no topo da estrutura.
• Descentralização: decisões delegadas aos níveis mais baixos (decisões mais rápidas e melhor uso dos recursos humanos).` },
  { modulo: "1", frente: "Concentração × Desconcentração", verso:
`• Desconcentração: distribuição de competências DENTRO da mesma pessoa jurídica (mantém a hierarquia; usada na Administração direta).
• Concentração: o sentido inverso da desconcentração.` },
  { modulo: "1", frente: "Governabilidade × Governança", verso:
`• Governabilidade: capacidade POLÍTICA de governar (legitimidade e apoio da sociedade e dos representantes).
• Governança: capacidade FINANCEIRA e ADMINISTRATIVA de implementar políticas públicas.` },
  { modulo: "1", frente: "Accountability e Compliance", verso:
`• Accountability: obrigação de PRESTAR CONTAS das responsabilidades outorgadas.
• Compliance: CONFORMIDADE — governança baseada no cumprimento de padrões normativos e legais (ética e transparência).` },
  { modulo: "1", frente: "Cargo × Função (PMPE)", verso:
`• Cargo: posição que a pessoa ocupa na estrutura organizacional.
• Função: conjunto de tarefas e responsabilidades que correspondem ao cargo (definidas em regimentos internos).` },

  // ── Módulo 2 — Evolução e princípios ──
  { modulo: "2", frente: "Evolução da AP no Brasil — Patrimonialismo", verso:
`• Característica predominante na colônia e no império.
• A governança se confunde com a pessoalidade do governante ("O Estado sou eu") — não há separação entre o público e o privado.
• Com a República, iniciou-se uma gestão mais técnica.` },
  { modulo: "2", frente: "Princípios da Administração Pública (art. 37 CF — LIMPE)", verso:
`• Legalidade: só fazer o previsto em lei.
• Impessoalidade: sem discriminação ou favorecimento.
• Moralidade: conforme os princípios morais / bom administrador.
• Publicidade: divulgação obrigatória dos atos (Diário Oficial).
• Eficiência: presteza, racionalidade e qualidade do serviço.` },

  // ── Módulo 3 — Organização da AP ──
  { modulo: "3", frente: "Administração Direta", verso:
`• Órgãos ligados DIRETAMENTE ao ente central de cada poder e esfera.
• NÃO possuem personalidade jurídica própria — são centros de competências despersonalizados, pertencentes ao ente (União, Estados, Municípios).` },
  { modulo: "3", frente: "Administração Indireta", verso:
`• Pessoas jurídicas criadas para um fim, descentralizadas e autônomas, vinculadas à Adm. direta.
• Serviços públicos: autarquias e fundações.
• Atividade econômica: empresas públicas e sociedades de economia mista.` },
  { modulo: "3", frente: "Terceiro Setor", verso:
`• Figura híbrida/paraestatal: entes privados que atuam em atividades de interesse público, SEM fins lucrativos.
• Ex.: serviços sociais autônomos, organizações sociais (OS), OSCIP e ONGs.` },

  // ── Módulo 4 — PPA/LDO/LOA ──
  { modulo: "4", frente: "PPA — Plano Plurianual", verso:
`• Estabelece objetivos, diretrizes e metas por 4 anos (art. 165 da CF).
• Envio ao Legislativo até 31/ago do 1º ano do mandato; devolução até 22/dez.
• Dá transparência, define a execução dos programas e fomenta a continuidade administrativa.` },
  { modulo: "4", frente: "LDO — Lei de Diretrizes Orçamentárias", verso:
`• Anual; detalha as metas e prioridades e orienta a confecção da LOA.
• Envio até 15/abr; devolução até 17/jul.` },
  { modulo: "4", frente: "LOA — Lei Orçamentária Anual", verso:
`• Estima as receitas e fixa as despesas do ano subsequente, conforme o PPA e a LDO.
• Envio até 31/ago; devolução até 22/dez.` },

  // ── Módulo 5 — Licitações ──
  { modulo: "5", frente: "Licitações e Contratos (Lei 14.133/2021)", verso:
`• A Lei nº 14.133/2021 estabelece as normas gerais de licitação e contratos.
• Contrato: ajuste entre a Administração e particulares. Licitação: procedimento para selecionar a proposta mais vantajosa.` },
  { modulo: "5", frente: "Modalidades de Licitação (Lei 14.133/2021)", verso:
`• 5 modalidades: concorrência, concurso, leilão, pregão e diálogo competitivo.
• Em casos especiais, a contratação pode ocorrer por dispensa ou inexigibilidade de licitação.` },

  // ── Módulo 6 — Políticas públicas ──
  { modulo: "6", frente: "Políticas Públicas — Características", verso:
`• Institucional (instituída nos programas de governo); Decisória (cadeia de decisões); Comportamental ("vontade de fazer"); Causal (gera impactos sociais, positivos ou negativos).` },
  { modulo: "6", frente: "Políticas Públicas — Ciclo", verso:
`1) Construção da agenda → 2) Formulação da política → 3) Processo decisório → 4) Implementação → 5) Avaliação.` },

  // ── Módulo 7 — Controle ──
  { modulo: "7", frente: "Controle da AP — Quanto à Origem", verso:
`• Interno: exercido DENTRO do próprio poder (ex.: CGU).
• Externo: exercido FORA do poder controlado (ex.: TCU/Congresso; também MP e controle social).
• Fundamento: art. 70 da CF (controle externo + controle interno de cada poder).` },
  { modulo: "7", frente: "Controle da AP — Momento e Aspecto", verso:
`• Momento: prévio/preventivo, concomitante e posterior/corretivo.
• Aspecto: legalidade (conformidade) e mérito (conveniência, eficiência e oportunidade).` },
  { modulo: "7", frente: "Controle da AP — Amplitude", verso:
`• Hierárquico: órgãos superiores fiscalizam os inferiores.
• Finalístico: a Administração direta fiscaliza a indireta (limitado pela autonomia desta).` },

  // ── Módulo 8 — Ferramentas gerenciais ──
  { modulo: "8", frente: "Ferramenta — Benchmarking", verso:
`• De "benchmark" (referência): comparar a própria atividade/produto com um concorrente ou referência, buscando boas práticas e melhoria contínua.` },
  { modulo: "8", frente: "Ferramenta — PDCA (Ciclo Deming)", verso:
`• Plan (planejar), Do (executar), Check (verificar), Action (agir).
• Ciclo contínuo de melhoria da efetividade; origem nos anos 1950.` },
  { modulo: "8", frente: "Ferramenta — Diagrama de Pareto (80/20)", verso:
`• 80% do volume de problemas decorre de 20% das causas.
• Estratifica os problemas/causas em um histograma e foca nos prioritários.` },
  { modulo: "8", frente: "Ferramentas — Kaizen e Orçamento Participativo", verso:
`• Kaizen: melhoria contínua, com envolvimento permanente das pessoas na evolução das tarefas.
• Orçamento participativo: distribui a responsabilidade da alocação de recursos com os stakeholders.` },

  // ── Módulo 9 — Estrutura / excelência ──
  { modulo: "9", frente: "Estrutura Organizacional e Gestão de Excelência", verso:
`• Estrutura organizacional: modo de distribuir a autoridade, dividir as atividades e estabelecer a comunicação — representada pelo organograma.
• Gestão de excelência: busca a qualidade contínua; mede eficiência/eficácia pelo cumprimento da missão e pelo atendimento de qualidade ao cidadão.` },
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
