import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "GPGA"
const MOD = "Prova 2025" // Prova antiga — Avaliação Escrita GPGA, CFO PM 2025 (APM Cel. José Maria Cavalcanti de Oliveira)

type Alt = { id: string; texto: string }
type Q =
  | { tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string }
  | { tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string }
  | { tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string } }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))
const FONTE = " (Prova AE — GPGA · CFO PM 2025)"

const QS: Q[] = [
  // ───── 1ª QUESTÃO (V/F) — Evolução Histórica da Administração Pública ─────
  { tipo: "certo_errado", enunciado: "O patrimonialismo caracteriza-se pela apropriação privada daquilo que era público.", gabarito: "certo", explicacao: "Verdadeiro. No patrimonialismo não há separação entre o público e o privado." + FONTE },
  { tipo: "certo_errado", enunciado: "Com a República, houve uma certa evolução para uma gestão mais técnica.", gabarito: "certo", explicacao: "Verdadeiro. Iniciou-se a racionalização/burocratização da Administração Pública." + FONTE },
  { tipo: "certo_errado", enunciado: "Os paradigmas da gestão pública no Brasil sempre foram uniformes e estáveis ao longo da história.", gabarito: "errado", explicacao: "Falso. Houve transformações (patrimonialismo → burocracia → gerencialismo), sem uniformidade." + FONTE },
  { tipo: "certo_errado", enunciado: "O patrimonialismo era representado pela frase 'O Estado sou eu'.", gabarito: "certo", explicacao: "Verdadeiro. A frase simboliza a confusão entre a pessoa do governante e o Estado." + FONTE },
  { tipo: "certo_errado", enunciado: "Mesmo atualmente, podem existir práticas patrimonialistas em casos pontuais.", gabarito: "certo", explicacao: "Verdadeiro. Resquícios patrimonialistas ainda surgem na prática da gestão." + FONTE },

  // ───── 2ª QUESTÃO (V/F) — Ciclo de Gestão (PPA, LDO, LOA) ─────
  { tipo: "certo_errado", enunciado: "No âmbito público, os atos de planejar, organizar, dirigir e controlar devem orbitar apenas em face de dois instrumentos: o PPA e a LOA.", gabarito: "errado", explicacao: "Falso. São TRÊS instrumentos do ciclo orçamentário: PPA, LDO e LOA — a LDO foi omitida." + FONTE },
  { tipo: "certo_errado", enunciado: "O Plano Plurianual (PPA) estabelece objetivos, diretrizes e metas de cada ente federativo para um período de 02 (dois) anos.", gabarito: "errado", explicacao: "Falso. O PPA tem vigência de 04 (quatro) anos (art. 165 da CF)." + FONTE },
  { tipo: "certo_errado", enunciado: "Uma das características do PPA é fomentar a continuidade administrativa.", gabarito: "certo", explicacao: "Verdadeiro. Por abranger 4 anos, dá continuidade aos programas entre gestões." + FONTE },
  { tipo: "certo_errado", enunciado: "A Lei Orçamentária Anual (LOA), obedecendo ao planejamento da LDO e do PPA, estima as receitas e fixa as despesas da administração pública para o ano subsequente.", gabarito: "certo", explicacao: "Verdadeiro. A LOA estima a receita e fixa a despesa do exercício seguinte (art. 165, §8º, CF)." + FONTE },
  { tipo: "certo_errado", enunciado: "O orçamento é um mecanismo que indica a alocação de recursos em face dos diversos programas estabelecidos nos planejamentos do governo.", gabarito: "certo", explicacao: "Verdadeiro. O orçamento materializa a alocação de recursos aos programas." + FONTE },

  // ───── 3ª QUESTÃO (V/F) — Ferramentas Gerenciais ─────
  { tipo: "certo_errado", enunciado: "A ferramenta Kaizen (melhoria contínua) insere na organização o princípio permanente de envolvimento das pessoas para evoluir as tarefas no dia a dia.", gabarito: "certo", explicacao: "Verdadeiro. Kaizen = melhoria contínua com participação das pessoas." + FONTE },
  { tipo: "certo_errado", enunciado: "A técnica de orçamento participativo NÃO visa distribuir responsabilidades na decisão de alocação de recursos.", gabarito: "errado", explicacao: "Falso. O orçamento participativo justamente DISTRIBUI a responsabilidade da alocação de recursos com os stakeholders." + FONTE },
  { tipo: "certo_errado", enunciado: "O aprimoramento constante NÃO é um dever do gestor público que busca a excelência.", gabarito: "errado", explicacao: "Falso. A busca pela excelência exige aprimoramento constante (melhoria contínua)." + FONTE },
  { tipo: "certo_errado", enunciado: "Planejamento Estratégico e a implementação de novas tecnologias podem, cada um, ser tema de seminários e treinamentos bastante duradouros.", gabarito: "certo", explicacao: "Verdadeiro. São temas amplos de capacitação gerencial." + FONTE },
  { tipo: "certo_errado", enunciado: "São ferramentas aplicadas à Gestão Pública, entre outras: Brainstorming, Ishikawa e Downsizing (enxugamento).", gabarito: "certo", explicacao: "Verdadeiro. Todas são ferramentas/técnicas gerenciais." + FONTE },

  // ───── 4ª QUESTÃO (múltipla) — Gestão de excelência / qualidade (assinale a ERRADA) ─────
  { tipo: "multipla", enunciado: "Quanto à Gestão Pública de excelência e à busca pela qualidade, assinale a alternativa ERRADA:", alternativas: A(
      "O conceito de qualidade não evolui para a visão da satisfação do cliente.",
      "O conceito de qualidade (originário das organizações privadas) varia bastante ao longo da literatura.",
      "Foi tido inicialmente como um conjunto de procedimentos para detectar desvios de especificações técnicas — um produto 'sem defeitos' era um produto de qualidade.",
      "O tema qualidade materializa-se por meio de ações e procedimentos em sintonia com a reestruturação do universo produtivo.",
      "Qualidade é a totalidade de características de um ente (organização, produto, processo) que lhe confere capacidade de satisfazer necessidades explícitas e implícitas dos cidadãos."),
    gabarito: "A", explicacao: "A alternativa ERRADA é a 'A': o conceito de qualidade EVOLUI, sim, para a visão da satisfação do cliente/cidadão." + FONTE },

  // ───── 5ª QUESTÃO (múltipla) — Licitações e Contratos (assinale a INCORRETA) ─────
  { tipo: "multipla", enunciado: "Sobre as Noções Gerais de Licitações e Contratos, assinale a alternativa INCORRETA:", alternativas: A(
      "Uma das novidades trazidas pela Lei nº 14.133/2021, em relação às modalidades da Lei 8.666/1993, foi o Pregão.",
      "A Lei nº 14.133, de 1º/04/2021, estabelece normas gerais de licitação e contratação para as Administrações Públicas diretas, autárquicas e fundacionais da União, Estados, DF e Municípios.",
      "Licitação é o procedimento legal para selecionar propostas de possíveis contratos com a gestão pública para a execução de um serviço ou a entrega de produtos.",
      "Em casos especiais, a licitação pode ser dispensada ou ser passível de inexigibilidade.",
      "Os contratos estabelecem, com clareza e precisão, as condições de execução, em cláusulas que definem direitos, obrigações e responsabilidades, conforme a licitação e a proposta."),
    gabarito: "A", explicacao: "INCORRETA é a 'A': o Pregão NÃO é novidade da Lei 14.133 — já existia (Lei 10.520/2002). A novidade da 14.133 foi o DIÁLOGO COMPETITIVO." + FONTE },

  // ───── 6ª QUESTÃO (múltipla) — Gestão pública × privada (assinale a CORRETA) ─────
  { tipo: "multipla", enunciado: "Sobre as principais diferenças entre gestão pública e gestão privada, assinale a alternativa CORRETA:", alternativas: A(
      "A gestão pública deve obedecer a princípios constitucionais e visar ao bem-estar social.",
      "A gestão pública busca o lucro, enquanto a privada busca o bem-estar coletivo.",
      "Na gestão pública, o cidadão paga apenas se utilizar o serviço.",
      "A gestão privada deve obedecer aos princípios do art. 37 da CF da mesma forma que a pública.",
      "A gestão pública não se sujeita a nenhuma forma de controle social."),
    gabarito: "A", explicacao: "CORRETA é a 'A'. A pública visa ao bem-estar social e submete-se ao art. 37 da CF; a privada visa ao lucro. O cidadão paga via impostos (mesmo sem usar o serviço)." + FONTE },

  // ───── 7ª QUESTÃO (múltipla) — Controles da Administração Pública (assinale a CORRETA) ─────
  { tipo: "multipla", enunciado: "Sobre os Instrumentos de Controle da Administração Pública, assinale a única alternativa CORRETA:", alternativas: A(
      "Quanto à amplitude, há dois tipos: hierárquico (órgãos superiores fiscalizam inferiores) e finalístico (a administração direta fiscaliza a indireta).",
      "Quanto à origem, o controle é caracterizado como prévio ou preventivo.",
      "Quanto ao aspecto, o controle é sempre posterior/corretivo.",
      "Quanto ao mérito, busca-se conferir a conformidade do ato com as legislações vigentes (legalidade).",
      "Quanto à legalidade, busca-se a análise de conveniência, eficiência e oportunidade do ato (mérito)."),
    gabarito: "A", explicacao: "CORRETA é a 'A'. Quanto à origem: interno/externo (não prévio). Quanto ao momento: prévio, concomitante e posterior. Mérito = conveniência/oportunidade; legalidade = conformidade — as alternativas D e E invertem esses conceitos." + FONTE },

  // ───── 8ª QUESTÃO (dissertativa) — Contratos públicos e o Oficial ─────
  { tipo: "dissertativa", enunciado: "Os contratos definem, em cláusulas, os direitos, as obrigações e as responsabilidades das partes, em conformidade com a licitação e a proposta. Nesta perspectiva, disserte sobre a importância de o Oficial da PMPE possuir conhecimentos básicos sobre contratos públicos. (mín. 7 / máx. 15 linhas)", modelo: { estrutura: "Conceito de contrato público → papel do oficial como gestor → riscos da falta de conhecimento → conclusão.", criterios: ["Conceituar contrato administrativo (cláusulas, direitos/obrigações)", "Relacionar com a função do oficial como gestor/fiscal de contratos", "Apontar legalidade, responsabilização e uso eficiente dos recursos públicos", "Concluir sobre a importância do conhecimento técnico"], resposta: "O contrato público é o ajuste firmado entre a Administração e particulares, no qual se definem, com clareza e precisão, os direitos, as obrigações e as responsabilidades das partes, em conformidade com a licitação e a proposta vinculante. O Oficial da PMPE atua frequentemente como gestor ou fiscal de contratos (aquisições, serviços, manutenção), de modo que conhecer seus fundamentos é essencial para garantir a legalidade, a economicidade e a correta execução do objeto. O desconhecimento expõe o oficial a responsabilização administrativa, civil e até penal, além de prejudicar o interesse público. Assim, o domínio básico de contratos e da Lei nº 14.133/2021 qualifica a gestão, previne irregularidades e assegura o uso eficiente e probo dos recursos públicos." } },

  // ───── 9ª QUESTÃO (dissertativa) — Patrimonialismo ─────
  { tipo: "dissertativa", enunciado: "Analise como o patrimonialismo marcou a evolução da administração pública no Brasil e como ele ainda pode aparecer em práticas atuais. (mín. 7 / máx. 15 linhas)", modelo: { estrutura: "Conceito de patrimonialismo → marca histórica no Brasil → evolução (burocracia/gerencial) → resquícios atuais → conclusão.", criterios: ["Definir patrimonialismo (confusão público/privado)", "Situar historicamente (colônia/império)", "Mencionar a evolução para a burocracia e o gerencialismo", "Citar práticas atuais (nepotismo, clientelismo, uso privado do público)"], resposta: "O patrimonialismo marcou grande parte da história brasileira (colônia e império), caracterizando-se pela ausência de separação entre o público e o privado — o governante tratava o Estado como propriedade pessoal ('O Estado sou eu'). Com a República e, sobretudo, a partir dos anos 1930, iniciou-se a racionalização da gestão, com a burocracia (impessoalidade, mérito, formalismo) e, mais tarde, com o modelo gerencial (foco em resultados). Apesar disso, resquícios patrimonialistas ainda aparecem em práticas atuais, como o nepotismo, o clientelismo, o uso de bens e cargos públicos para fins privados e o favorecimento pessoal. Combatê-los exige fortalecer os princípios do art. 37 da CF (legalidade, impessoalidade, moralidade), a transparência e o controle." } },

  // ───── 10ª QUESTÃO (dissertativa) — Controle externo e interno ─────
  { tipo: "dissertativa", enunciado: "A fiscalização contábil, financeira, orçamentária, operacional e patrimonial será exercida pelo Congresso Nacional, mediante controle externo, e pelo sistema de controle interno de cada Poder. Defina os tipos de controle enfatizados e explique seu objetivo na visão do Oficial da PMPE como gestor público. (mín. 10 / máx. 15 linhas)", modelo: { estrutura: "Base (art. 70 CF) → controle externo → controle interno → objetivo → visão do oficial → conclusão.", criterios: ["Citar o art. 70 da CF", "Definir controle externo (TCU/Congresso; fora do poder controlado)", "Definir controle interno (dentro do próprio poder)", "Relacionar com a atuação do oficial-gestor (legalidade, prestação de contas)"], resposta: "O enunciado reproduz o art. 70 da CF, que prevê duas formas de controle. O controle EXTERNO é exercido por órgão alheio ao poder fiscalizado — no plano federal, o Congresso Nacional com auxílio do TCU (nos Estados, o respectivo Tribunal de Contas) — abrangendo legalidade, legitimidade e economicidade. O controle INTERNO é mantido por cada Poder sobre seus próprios atos, fiscalizando a aplicação dos recursos e apoiando o controle externo. O objetivo de ambos é assegurar a regularidade, a probidade e a eficiência na gestão dos recursos públicos. Para o Oficial da PMPE, enquanto gestor público, isso significa zelar pela legalidade e pela correta prestação de contas dos bens e recursos sob sua responsabilidade, sujeitando-se a ambos os controles e contribuindo para a transparência e a boa aplicação do dinheiro público." } },
]

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MAT } })
  if (!disc) throw new Error(`Disciplina ${MAT} não existe.`)
  let c = 0, u = 0
  for (const q of QS) {
    const hash = createHash("sha1").update(`${MAT}|${MOD}|${q.enunciado}`).digest("hex")
    const base: any = { materia: MAT, modulo: MOD, tipo: q.tipo, enunciado: q.enunciado, hash }
    if (q.tipo === "multipla") { base.alternativas = q.alternativas; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else if (q.tipo === "certo_errado") { base.alternativas = []; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else { base.alternativas = []; base.gabarito = ""; base.modelo = q.modelo }
    const exists = await prisma.questao.findUnique({ where: { hash } })
    await prisma.questao.upsert({ where: { hash }, update: base, create: base })
    exists ? u++ : c++
  }
  const tot = await prisma.questao.count({ where: { materia: MAT, modulo: MOD } })
  console.log(`GPGA Prova 2025: ${c} criadas/${u} atualizadas. Módulo "${MOD}": ${tot} questões.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
