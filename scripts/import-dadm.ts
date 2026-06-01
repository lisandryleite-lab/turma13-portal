import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const MATERIA = "DADM"
const TITULO = "Memento Completo — Direito Administrativo Disciplinar Militar"

const MD = `# 1. Introdução e Princípios
- O **Direito Administrativo Disciplinar Militar (DADM)** regula as relações jurídicas entre o Estado e seus servidores militares (transgressões disciplinares).
- **Norma principal em PE:** **Lei nº 11.817, de 24/07/2000 — Código Disciplinar dos Militares do Estado de Pernambuco (CDMEPE)**.
- Princípios aplicáveis: legalidade, impessoalidade, moralidade, publicidade, finalidade, motivação, eficiência e interesse público (art. 37 da CF/88), além do devido processo legal, contraditório e ampla defesa.

> ⚠ A doutrina da **"verdade sabida"** foi superada pelos princípios do devido processo legal, contraditório, ampla defesa e possibilidade recursal.

## DADM × Direito Penal Militar
- **DADM:** regula as relações entre o Estado e seus administrados/servidores — trata das **transgressões disciplinares**.
- **Direito Penal Militar:** campo especial que **capitula os crimes militares**.

---

# 2. Transgressão Disciplinar e Submissão ao Regime
## Transgressão disciplinar (art. 13 do CDMEPE)
- É toda **ação ou omissão** do militar estadual que viole os preceitos da ética e os valores militares, ou contrarie deveres e obrigações — em manifestações **elementares e simples que NÃO possam ser tipificadas como crime ou contravenção**.
- A aplicação deve ser **necessariamente motivada**, considerando a natureza e a gravidade da infração.

## Submissão ao regime disciplinar (art. 8º)
- Sujeitam-se ao CDMEPE os militares da **ativa, da reserva remunerada e os reformados**.
- Os **alunos** de cursos militares também se submetem às normas da OME em que estejam matriculados.

> 🔑 A apuração disciplinar dos **inativos** compete ao Comandante-Geral (art. 73), podendo ser delegada (ver Corregedoria).

---

# 3. Processo, Procedimento e Espécies de PADM
- **Processo:** concatenação de atos voltada a alterar a natureza/forma de algo. **Procedimento:** a maneira de organizar os atos dentro do processo (ou o ato unitário). Um processo é composto de vários procedimentos.

## Espécies de PADM
**A) Caráter apuratório**
- **Sindicância Administrativa Disciplinar (SAD):** transgressões simples que **necessitam de instrução probatória** (IN nº 002/2017 Cor.Ger.).
- **Processo Apuratório Disciplinar Sumário (PADS):** transgressões simples que **não necessitam de instrução probatória** (Provimento Correicional nº 14/2019).

**B) Caráter demissório** (processamento exclusivo na Corregedoria-Geral da SDS)
- **Conselho de Disciplina:** praças com e sem estabilidade (Decreto nº 3.639/1975).
- **Conselho de Justificação:** oficiais (Lei Federal nº 5.836/1972 e Lei Estadual nº 6.957/1975).

> ⚠ A **Investigação Preliminar** enfrenta dúvidas de autoria/materialidade. O **Inquérito Policial Militar (IPM)** NÃO é peça do DADM — é procedimento de **polícia judiciária militar**.

---

# 4. Poder Disciplinar e Competência
## Competência para aplicar penas (art. 10)
- A competência é **inerente ao cargo ou função ocupada, e não ao grau hierárquico**.
- Autoridades competentes: o Governador e o Secretário de Defesa Social (todos os integrantes); os Comandantes-Gerais; o Chefe da Casa Militar; Chefes de Estado-Maior/Subcomandantes; Corregedores; Comandantes de OME; e outros que recebam delegação específica.

## Teoria dos poderes implícitos
- Quando a Constituição concede uma função a um órgão, confere-lhe **implicitamente os meios necessários** para executá-la — fundamenta a competência para instaurar o PADM (RE 593.727/MG).

---

# 5. Corregedoria, Inativos e Apreciação Judicial
## Corregedoria-Geral da SDS (Lei nº 11.929/2001)
- **Órgão superior de controle disciplinar interno.** Instaura e acompanha sindicâncias e PADs, requisita a instauração de Conselhos de Disciplina e de Justificação e expede provimentos correicionais.
- Suas requisições devem ser atendidas no **prazo máximo de 15 dias**.

## Apuração dos inativos
- Compete ao **Comandante-Geral** (art. 73); por delegação (Portaria CG nº 399/2022), foi atribuída ao **Diretor de Polícia Judiciária Militar (DPJM)** e ao **Diretor de Inativos e Pensionistas (DIP)** — ambos criados pela LC nº 483/2022.

## Apreciação pelo Poder Judiciário (art. 125, §4º, da CF)
- Compete à **Justiça Militar estadual** processar e julgar as ações contra atos disciplinares militares; o **juiz julga de forma singular** (sem formação de Conselho de Justiça).
- O ato disciplinar militar goza de **presunção de legitimidade e veracidade**.

---

# 6. Penas Disciplinares
## Objetivo (art. 27)
- Sanção administrativa que visa **fortalecer a disciplina**, reeducando o transgressor e a coletividade, para evitar novas transgressões.

## As penas (art. 28)
| Inciso | Pena | Observação |
|---|---|---|
| I | Repreensão | **Inaplicável** atualmente (vazio legal) |
| II | Detenção | Transgressões simples — privação **relativa** da liberdade |
| III | Prisão | Transgressões simples — privação **absoluta** (confinamento) |
| IV | Licenciamento a bem da disciplina | Praças **sem estabilidade** (< 10 anos de serviço) |
| V | Exclusão a bem da disciplina | Aspirante a Oficial e praças **com estabilidade** |

- **Oficial:** a pena de caráter demissório é a **demissão ex-officio** (Lei Estadual nº 6.783/1974).
- **Prisão e detenção:** não podem ultrapassar **30 dias**. Detenção → recolhimento em dependência da OME; prisão → confinamento em local específico da OME ou estabelecimento prisional militar.

## Medidas administrativas (§1º do art. 28)
- Aplicáveis alternativa ou cumulativamente às penas: cancelamento de matrícula; afastamento do cargo/função; movimentação de OME; suspensão de folga; suspensão de pagamento dos dias faltados injustificadamente.

> ⚠ A **advertência** (§3º) é orientação verbal, **sem registro** na ficha disciplinar, e pode substituir a pena na **primeira penalidade**. NÃO é pena nem recurso em sentido estrito.

---

# 7. Recursos e Medidas Cautelares
## Recursos disciplinares (arts. 50–51)
- São quatro: **Reconsideração de Ato, Queixa, Representação e Revisão Disciplinar**.
- Todos têm **efeito suspensivo** (sobresta o recolhimento até o julgamento). A tramitação não pode exceder **15 dias**.

- **Reconsideração de Ato (art. 52):** dirigida à **própria autoridade** que praticou o ato; prazo de **2 dias úteis** para apresentar; a autoridade despacha em até **4 dias úteis**.
- **Queixa (art. 53):** dirigida ao **superior imediato** da autoridade; cabível **só após** a publicação da solução da reconsideração; prazo de **5 dias úteis**.

## Medida cautelar — afastamento preventivo (art. 14 da Lei nº 11.929/01)
- Determinado pelo **Secretário de Defesa Social, ouvido o Corregedor-Geral**, por portaria, **sem prejuízo da remuneração**.
- Prazo de **até 120 dias, prorrogável uma única vez por igual período**.

---

# 8. Prazos das Espécies de PADM
*(Provimento Correicional nº 003/2018)*

| Espécie | Conclusão | Prorrogação |
|---|---|---|
| Conselho de Justificação (CJ) | 30 dias (da nomeação) | + 20 dias |
| Conselho de Disciplina (CD) | 30 dias (da nomeação) | + 20 dias |
| Processo de Licenciamento (PL) | 40 dias corridos | máx. 90 dias |
| Sindicância Administrativa Disciplinar (SAD) | 30 dias | + igual período |
| PAD / PAD Especial (PADE) | 60 dias | + igual período |
| Sindicância | 20 dias | + igual período |

> ⚠ Esses prazos são **meramente referenciais/impróprios**: o descumprimento **não gera perempção, prescrição ou decadência** — ou seja, não extingue o processo por excesso de prazo.`

type Card = { modulo: string; frente: string; verso: string }

const CARDS: Card[] = [
  { modulo: "1", frente: "DADM — Conceito e Norma Principal", verso:
`• O Direito Administrativo Disciplinar Militar regula as relações jurídicas entre o Estado e seus servidores militares (transgressões disciplinares).
• Norma principal em PE: Lei nº 11.817/2000 — Código Disciplinar dos Militares do Estado de Pernambuco (CDMEPE).` },
  { modulo: "1", frente: "DADM × Direito Penal Militar", verso:
`• DADM: regula relações entre o Estado e seus administrados/servidores — trata das transgressões disciplinares.
• Direito Penal Militar: campo especial que capitula os crimes militares.
⚠ A doutrina da "verdade sabida" foi superada pelo devido processo legal, contraditório e ampla defesa.` },

  { modulo: "2", frente: "Transgressão Disciplinar (art. 13 do CDMEPE)", verso:
`• Ação ou omissão do militar que viole os preceitos da ética e os valores militares, ou contrarie deveres/obrigações.
• Em manifestações elementares e simples que NÃO possam ser tipificadas como crime ou contravenção.
• A aplicação deve ser necessariamente motivada, considerando a natureza e a gravidade.` },
  { modulo: "2", frente: "Submissão ao Regime Disciplinar (art. 8º)", verso:
`• Sujeitam-se ao CDMEPE: militares da ativa, da reserva remunerada e os reformados.
• Os alunos de cursos militares também se submetem às normas da OME em que estão matriculados.
• A apuração dos inativos compete ao Comandante-Geral (art. 73).` },

  { modulo: "3", frente: "Processo × Procedimento", verso:
`• Processo: concatenação de atos voltada a alterar a natureza/forma de algo.
• Procedimento: a maneira de organizar os atos dentro do processo (ou o ato unitário).
• Um processo é composto de vários procedimentos.` },
  { modulo: "3", frente: "PADM de Caráter Apuratório (SAD × PADS)", verso:
`• Sindicância Administrativa Disciplinar (SAD): transgressões simples que NECESSITAM de instrução probatória (IN 002/2017).
• Processo Apuratório Disciplinar Sumário (PADS): transgressões simples que NÃO necessitam de instrução probatória (Prov. Correicional 14/2019).` },
  { modulo: "3", frente: "PADM de Caráter Demissório (Conselhos)", verso:
`• Conselho de Disciplina: praças com e sem estabilidade (Decreto nº 3.639/1975).
• Conselho de Justificação: oficiais (Lei Federal nº 5.836/1972 e Lei Estadual nº 6.957/1975).
• Processamento exclusivo na Corregedoria-Geral da SDS.` },
  { modulo: "3", frente: "Investigação Preliminar × IPM", verso:
`• Investigação Preliminar: enfrenta dúvidas de autoria ou materialidade.
• Inquérito Policial Militar (IPM): procedimento de polícia judiciária militar — NÃO é peça do Direito Administrativo Disciplinar Militar.` },

  { modulo: "4", frente: "Poder Disciplinar — Competência (art. 10)", verso:
`• A competência para aplicar penas é inerente ao CARGO ou FUNÇÃO ocupada, NÃO ao grau hierárquico.
• Autoridades: Governador e Secretário de Defesa Social (todos os integrantes), Comandantes-Gerais, Chefe da Casa Militar, Corregedores, Comandantes de OME e quem receber delegação específica.` },
  { modulo: "4", frente: "Teoria dos Poderes Implícitos", verso:
`• Quando a Constituição concede uma função a um órgão, confere-lhe implicitamente os meios necessários para executá-la.
• Fundamenta a competência para instaurar o PADM (origem norte-americana; RE 593.727/MG).` },

  { modulo: "5", frente: "Corregedoria-Geral da SDS (Lei 11.929/2001)", verso:
`• Órgão superior de controle disciplinar interno.
• Instaura e acompanha sindicâncias e PADs; requisita a instauração de Conselhos de Disciplina e de Justificação; expede provimentos correicionais.
• Suas requisições devem ser atendidas em até 15 dias.` },
  { modulo: "5", frente: "Apuração Disciplinar dos Inativos", verso:
`• Compete ao Comandante-Geral (art. 73 do CDMEPE).
• Por delegação (Portaria CG 399/2022), foi atribuída ao Diretor de Polícia Judiciária Militar (DPJM) e ao Diretor de Inativos e Pensionistas (DIP), criados pela LC 483/2022.` },
  { modulo: "5", frente: "Apreciação do Ato Disciplinar pela Justiça (art. 125, §4º, CF)", verso:
`• Compete à Justiça Militar estadual processar e julgar as ações contra atos disciplinares militares.
• O juiz julga de forma SINGULAR (sem formação de Conselho de Justiça).
• O ato disciplinar militar goza de presunção de legitimidade e veracidade.` },

  { modulo: "6", frente: "Pena Disciplinar — Objetivo (art. 27)", verso:
`• Sanção administrativa que visa fortalecer a disciplina, reeducando o transgressor e a coletividade, para evitar novas transgressões.` },
  { modulo: "6", frente: "Penas Disciplinares (art. 28)", verso:
`I – Repreensão; II – Detenção; III – Prisão; IV – Licenciamento a bem da disciplina; V – Exclusão a bem da disciplina.` },
  { modulo: "6", frente: "Aplicabilidade das Penas", verso:
`• Repreensão: NÃO é aplicável atualmente (vazio legal).
• Detenção e prisão: transgressões simples.
• Licenciamento a bem da disciplina: praças SEM estabilidade (< 10 anos de serviço).
• Exclusão a bem da disciplina: Aspirante a Oficial e praças COM estabilidade.
• Oficial: demissão ex-officio (Lei 6.783/1974).` },
  { modulo: "6", frente: "Prisão × Detenção (§4º do art. 28)", verso:
`• Não podem ultrapassar 30 dias.
• Prisão = privação ABSOLUTA da liberdade (confinamento em local específico da OME ou estabelecimento prisional militar).
• Detenção = privação RELATIVA (recolhimento em dependência da OME).` },
  { modulo: "6", frente: "Medidas Administrativas (§1º do art. 28)", verso:
`• Aplicáveis alternativa ou cumulativamente às penas: cancelamento de matrícula; afastamento do cargo/função; movimentação de OME; suspensão de folga; suspensão de pagamento dos dias faltados injustificadamente.` },
  { modulo: "6", frente: "Advertência (§3º do art. 28)", verso:
`• Orientação verbal ao transgressor, SEM registro na ficha disciplinar.
• Pode substituir a pena na primeira penalidade (ou quando os antecedentes recomendarem).
• NÃO é pena nem recurso em sentido estrito.` },

  { modulo: "7", frente: "Recursos Disciplinares (arts. 50–51)", verso:
`• São quatro: Reconsideração de Ato, Queixa, Representação e Revisão Disciplinar.
• Todos têm efeito suspensivo (sobresta o recolhimento até o julgamento).
• A tramitação não pode exceder 15 dias.` },
  { modulo: "7", frente: "Reconsideração de Ato (art. 52)", verso:
`• Dirigida à PRÓPRIA autoridade que praticou o ato, para que reexamine a decisão.
• Prazo de 2 dias úteis para apresentar.
• A autoridade deve despachar em até 4 dias úteis.` },
  { modulo: "7", frente: "Queixa (art. 53)", verso:
`• Dirigida ao SUPERIOR IMEDIATO da autoridade contra quem se queixa.
• Cabível só APÓS a publicação da solução do pedido de reconsideração.
• Prazo de 5 dias úteis.` },
  { modulo: "7", frente: "Medida Cautelar — Afastamento Preventivo (art. 14 da Lei 11.929/01)", verso:
`• Determinado pelo Secretário de Defesa Social, ouvido o Corregedor-Geral, por portaria, SEM prejuízo da remuneração.
• Prazo de até 120 dias, prorrogável uma única vez por igual período.` },

  { modulo: "8", frente: "Prazos — Conselhos de Justificação e de Disciplina", verso:
`• Conselho de Justificação (CJ): 30 dias para conclusão (da nomeação) + prorrogação de 20 dias (Lei 5.836/1972).
• Conselho de Disciplina (CD): 30 dias (da nomeação) + 20 dias (Decreto 3.639/1975).` },
  { modulo: "8", frente: "Prazos — SAD e Sindicância", verso:
`• Sindicância Administrativa Disciplinar (SAD): 30 dias, prorrogável por igual período.
• Sindicância: 20 dias, prorrogável por igual período.` },
  { modulo: "8", frente: "Prazos — Licenciamento e PAD/PADE", verso:
`• Processo de Licenciamento a Bem da Disciplina (PL): 40 dias corridos (máx. 90 dias com prorrogação).
• PAD e PAD Especial (PADE): 60 dias, prorrogáveis por igual período.` },
  { modulo: "8", frente: "Natureza dos Prazos do PADM", verso:
`• São meramente referenciais/impróprios.
⚠ O descumprimento NÃO gera perempção, prescrição nem decadência — ou seja, não extingue o processo por excesso de prazo.` },
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
