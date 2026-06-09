import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "TGA"

type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string }
  | { modulo: string; tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string } }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const QS: Q[] = [
  // ── M1 — Conceitos ──
  { modulo: "1", tipo: "certo_errado", enunciado: "Eficiência relaciona-se ao uso adequado dos recursos (meios), enquanto eficácia diz respeito ao alcance dos objetivos (fins).", gabarito: "certo", explicacao: "Correto. Eficiência = meios; eficácia = fins." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Efetividade é sinônimo perfeito de eficiência, sem qualquer relação com resultados.", gabarito: "errado", explicacao: "Errado. Efetividade une eficiência ao alcance de resultados (impacto duradouro)." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A administração pode ser definida como o processo de planejar, organizar, dirigir e controlar recursos para alcançar objetivos.", gabarito: "certo", explicacao: "Correto. É o conceito-base (funções PODC)." },
  { modulo: "1", tipo: "multipla", enunciado: "Um gestor que atinge a meta, mas com grande desperdício de recursos, foi:", alternativas: A("eficaz, porém não eficiente", "eficiente, porém não eficaz", "efetivo em tudo", "nem eficaz nem eficiente", "apenas eficiente"), gabarito: "A", explicacao: "Atingiu o objetivo (eficaz), mas desperdiçou recursos (não eficiente)." },
  { modulo: "1", tipo: "multipla", enunciado: "A distribuição de competências dentro da mesma pessoa jurídica, mantendo a hierarquia, é a:", alternativas: A("desconcentração", "descentralização", "centralização", "concentração", "delegação externa"), gabarito: "A", explicacao: "Desconcentração ocorre dentro da mesma PJ; descentralização cria/atribui a outra PJ." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A Teoria Geral da Administração (TGA) é o campo do conhecimento que estuda a administração das organizações.", gabarito: "certo", explicacao: "Correto (Chiavenato)." },

  // ── M2 — Ciência/técnica/arte ──
  { modulo: "2", tipo: "certo_errado", enunciado: "A administração pode ser entendida simultaneamente como ciência, técnica e arte.", gabarito: "certo", explicacao: "Correto. Ciência (teorias), técnica (aplicação) e arte (habilidade do gestor)." },
  { modulo: "2", tipo: "certo_errado", enunciado: "O 'homo economicus' representa a visão de um homem movido por fatores sociais e afetivos, não pelo salário.", gabarito: "errado", explicacao: "Errado. O homo economicus é movido pela racionalidade e pelo interesse econômico (salário); o homo social é o das relações humanas." },
  { modulo: "2", tipo: "multipla", enunciado: "A consolidação da administração como ciência está ligada, sobretudo, à:", alternativas: A("Revolução Industrial e à necessidade de racionalizar o trabalho", "Idade Média feudal", "Revolução Francesa", "Antiguidade clássica", "era digital do século XXI"), gabarito: "A", explicacao: "A Revolução Industrial impulsionou a administração científica." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Como 'arte', a administração envolve a habilidade e a sensibilidade do gestor na aplicação dos conhecimentos.", gabarito: "certo", explicacao: "Correto. A dimensão 'arte' refere-se à prática habilidosa." },

  // ── M3 — Científica (Taylor) ──
  { modulo: "3", tipo: "certo_errado", enunciado: "A Administração Científica, de Taylor, enfatiza a tarefa e a eficiência do operário no chão de fábrica.", gabarito: "certo", explicacao: "Correto. Ênfase nas tarefas (visão de baixo para cima)." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O estudo de tempos e movimentos busca padronizar o trabalho para maximizar a produtividade.", gabarito: "certo", explicacao: "Correto. É a base da Organização Racional do Trabalho (ORT)." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A Administração Científica é classificada como abordagem humanística e social do trabalho.", gabarito: "errado", explicacao: "Errado. É abordagem microscópica e MECANICISTA (homo economicus), não humanística." },
  { modulo: "3", tipo: "multipla", enunciado: "O principal nome da Administração Científica é:", alternativas: A("Frederick W. Taylor", "Henri Fayol", "Max Weber", "Elton Mayo", "Peter Drucker"), gabarito: "A", explicacao: "Taylor é o pai da Administração Científica." },
  { modulo: "3", tipo: "multipla", enunciado: "A Administração Científica caracteriza-se pela ênfase:", alternativas: A("nas tarefas", "na estrutura", "nas pessoas", "no ambiente", "na tecnologia"), gabarito: "A", explicacao: "Taylor enfatiza as tarefas; Fayol, a estrutura; Mayo, as pessoas." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A Administração Científica é considerada a 'célula-máter' da gestão moderna.", gabarito: "certo", explicacao: "Correto. Iniciou o estudo sistemático da administração." },

  // ── M4 — Clássica (Fayol) ──
  { modulo: "4", tipo: "certo_errado", enunciado: "A Teoria Clássica, de Fayol, enfatiza a estrutura organizacional, com visão de cima para baixo (da cúpula).", gabarito: "certo", explicacao: "Correto. Em contraste com Taylor (tarefas, de baixo para cima)." },
  { modulo: "4", tipo: "certo_errado", enunciado: "As funções do administrador segundo Fayol (POCCC) são: prever, organizar, comandar, coordenar e controlar.", gabarito: "certo", explicacao: "Correto. Depois sintetizadas em PODC pelos neoclássicos." },
  { modulo: "4", tipo: "certo_errado", enunciado: "A sigla PODC (planejar, organizar, dirigir e controlar) foi criada originalmente por Taylor.", gabarito: "errado", explicacao: "Errado. O POCCC é de Fayol; o PODC é consolidação posterior (Neoclássica)." },
  { modulo: "4", tipo: "multipla", enunciado: "A obra de Fayol que sistematiza a Teoria Clássica é:", alternativas: A("Administração Industrial e Geral (AIG)", "Princípios de Administração Científica", "A Riqueza das Nações", "O Príncipe", "Ética a Nicômaco"), gabarito: "A", explicacao: "Fayol escreveu 'Administração Industrial e Geral'." },
  { modulo: "4", tipo: "multipla", enunciado: "Entre as funções básicas da empresa de Fayol, a que coordena as demais é a função:", alternativas: A("administrativa", "técnica", "comercial", "financeira", "contábil"), gabarito: "A", explicacao: "A função administrativa (POCCC) integra as funções técnicas, comerciais, financeiras, de segurança e contábeis." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Taylor e Fayol pertencem à abordagem clássica (mecanicista), mas com focos distintos: tarefas e estrutura, respectivamente.", gabarito: "certo", explicacao: "Correto. Mesma escola/abordagem, focos opostos." },

  // ── M5 — Burocrática/Estruturalista ──
  { modulo: "5", tipo: "certo_errado", enunciado: "A Teoria da Burocracia, de Max Weber, baseia-se na racionalidade legal, em normas, hierarquia, impessoalidade e meritocracia.", gabarito: "certo", explicacao: "Correto. Visa máxima eficiência e previsibilidade." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Para Weber, a burocracia ideal é informal, baseada em relações pessoais e afetivas.", gabarito: "errado", explicacao: "Errado. A burocracia weberiana é formal e impessoal, baseada em normas." },
  { modulo: "5", tipo: "multipla", enunciado: "São disfunções da burocracia (Merton), EXCETO:", alternativas: A("flexibilidade e informalidade plenas", "excesso de formalismo e papelório", "apego exagerado às regras", "resistência a mudanças", "despersonalização do relacionamento"), gabarito: "A", explicacao: "As disfunções são justamente o excesso de rigidez/formalismo — não a flexibilidade." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A Teoria Estruturalista integra a organização formal e a informal e considera a relação com o ambiente.", gabarito: "certo", explicacao: "Correto. Faz a transição para as teorias sistêmica e contingencial." },
  { modulo: "5", tipo: "multipla", enunciado: "A ênfase da Teoria da Burocracia recai sobre:", alternativas: A("a estrutura e as normas (racional-legal)", "as tarefas do operário", "as emoções dos grupos", "o ambiente externo apenas", "a tecnologia da informação"), gabarito: "A", explicacao: "Weber enfatiza a estrutura normativa racional-legal." },

  // ── M6 — Relações Humanas (Mayo) ──
  { modulo: "6", tipo: "certo_errado", enunciado: "A Teoria das Relações Humanas, de Elton Mayo, desloca o foco para o ser humano e os grupos.", gabarito: "certo", explicacao: "Correto. Surge o 'homo social'." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A Experiência de Hawthorne foi realizada em 1927, na fábrica da Western Electric, em Chicago.", gabarito: "certo", explicacao: "Correto. Estudou condições de trabalho e produtividade." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Hawthorne concluiu que a produtividade depende exclusivamente das condições físicas e da iluminação.", gabarito: "errado", explicacao: "Errado. Concluiu que a integração social e os grupos informais pesam mais que os fatores físicos." },
  { modulo: "6", tipo: "multipla", enunciado: "A concepção de homem que emerge da Teoria das Relações Humanas é o:", alternativas: A("homo social", "homo economicus", "homo burocraticus", "homo digitalis", "homo faber"), gabarito: "A", explicacao: "Homo social — motivado por fatores sociais e pelo grupo." },
  { modulo: "6", tipo: "multipla", enunciado: "A Experiência de Hawthorne é associada a:", alternativas: A("Elton Mayo", "Taylor", "Fayol", "Weber", "Maslow"), gabarito: "A", explicacao: "Mayo conduziu os estudos de Hawthorne." },

  // ── M7 — Neoclássica/APO ──
  { modulo: "7", tipo: "certo_errado", enunciado: "A Teoria Neoclássica retoma e atualiza a clássica, com ênfase na prática e nos resultados.", gabarito: "certo", explicacao: "Correto. É eclética e pragmática; consolida o PODC." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A APO (Administração por Objetivos) é associada a Peter Drucker.", gabarito: "certo", explicacao: "Correto. Drucker sistematiza a APO." },
  { modulo: "7", tipo: "multipla", enunciado: "A APO caracteriza-se por:", alternativas: A("definição conjunta de objetivos/metas e avaliação por resultados", "controle exclusivo das tarefas do operário", "ênfase nas emoções do grupo", "rigidez burocrática absoluta", "ausência de metas"), gabarito: "A", explicacao: "APO: objetivos negociados gestor-subordinado e controle por resultados." },
  { modulo: "7", tipo: "multipla", enunciado: "A sigla das funções administrativas consolidada pela Neoclássica é:", alternativas: A("PODC (Planejar, Organizar, Dirigir, Controlar)", "POCCC", "ORT", "APO", "PDCA"), gabarito: "A", explicacao: "PODC é a síntese neoclássica do POCCC de Fayol." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A Teoria Neoclássica rejeita totalmente as ideias da Teoria Clássica.", gabarito: "errado", explicacao: "Errado. Ela reforça e atualiza as boas práticas da clássica (derivação)." },

  // ── M8 — Comportamental ──
  { modulo: "8", tipo: "certo_errado", enunciado: "Maslow propôs a hierarquia das necessidades, do nível fisiológico até a autorrealização.", gabarito: "certo", explicacao: "Correto: fisiológicas → segurança → sociais → estima → autorrealização." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Na Teoria dos Dois Fatores de Herzberg, os fatores higiênicos são os que efetivamente motivam o trabalhador.", gabarito: "errado", explicacao: "Errado. Os higiênicos apenas EVITAM a insatisfação; quem motiva são os fatores motivacionais (intrínsecos)." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Na Teoria X e Y de McGregor, a Teoria X tem visão pessimista do trabalhador (avesso ao trabalho, precisa de controle).", gabarito: "certo", explicacao: "Correto. A Teoria Y é a visão otimista (busca responsabilidade)." },
  { modulo: "8", tipo: "multipla", enunciado: "A hierarquia das necessidades, no topo, apresenta a necessidade de:", alternativas: A("autorrealização", "segurança", "fisiológica", "estima", "social"), gabarito: "A", explicacao: "A autorrealização está no topo da pirâmide de Maslow." },
  { modulo: "8", tipo: "multipla", enunciado: "Salário e condições de trabalho, em Herzberg, são fatores:", alternativas: A("higiênicos (extrínsecos)", "motivacionais (intrínsecos)", "de autorrealização", "de liderança", "contingenciais"), gabarito: "A", explicacao: "São higiênicos — evitam insatisfação, mas não motivam." },
  { modulo: "8", tipo: "multipla", enunciado: "A Teoria Y de McGregor pressupõe que o trabalhador:", alternativas: A("busca responsabilidade e realização", "é naturalmente preguiçoso e precisa ser coagido", "só responde a punições", "não tem qualquer motivação", "deve ser tratado como máquina"), gabarito: "A", explicacao: "A Teoria Y é a visão otimista/positiva do ser humano no trabalho." },

  // ── M9 — Sistêmica/Contingencial ──
  { modulo: "9", tipo: "certo_errado", enunciado: "Na Teoria Sistêmica, a organização é vista como um sistema aberto que interage com o ambiente.", gabarito: "certo", explicacao: "Correto. Entradas → processamento → saídas → retroalimentação (visão holística)." },
  { modulo: "9", tipo: "certo_errado", enunciado: "A Teoria Contingencial afirma que existe uma única melhor maneira de administrar, válida em qualquer situação.", gabarito: "errado", explicacao: "Errado. A contingencial sustenta que NÃO há 'the best way' — tudo depende do contexto (ambiente, tecnologia)." },
  { modulo: "9", tipo: "multipla", enunciado: "A máxima 'tudo é relativo, tudo depende' resume a Teoria:", alternativas: A("Contingencial", "Científica", "Clássica", "Burocrática", "das Relações Humanas"), gabarito: "A", explicacao: "É o núcleo da abordagem contingencial." },
  { modulo: "9", tipo: "multipla", enunciado: "A abordagem que vê a organização de forma holística (o todo), como sistema aberto, é a:", alternativas: A("sistêmica", "científica", "clássica", "burocrática", "estruturalista"), gabarito: "A", explicacao: "A Teoria Sistêmica adota a visão do todo e do sistema aberto." },
  { modulo: "9", tipo: "certo_errado", enunciado: "A Teoria Contingencial é considerada um passo à frente da Teoria Sistêmica.", gabarito: "certo", explicacao: "Correto. Aprofunda a relação com variáveis situacionais (ambiente e tecnologia)." },

  // ── M10 — Tendências/Modelos ──
  { modulo: "10", tipo: "certo_errado", enunciado: "A gestão com foco em resultados prioriza metas e indicadores (gestão por resultados).", gabarito: "certo", explicacao: "Correto. É um dos modelos de gestão." },
  { modulo: "10", tipo: "certo_errado", enunciado: "A gestão democrática/participativa exclui os colaboradores das decisões.", gabarito: "errado", explicacao: "Errado. A gestão democrática justamente ENVOLVE os colaboradores na decisão." },
  { modulo: "10", tipo: "multipla", enunciado: "O modelo de gestão que mapeia e melhora os fluxos de trabalho é a gestão com foco em:", alternativas: A("processos", "resultados", "pessoas", "patrimônio", "documentos"), gabarito: "A", explicacao: "A gestão por processos foca o mapeamento e a melhoria dos fluxos." },
  { modulo: "10", tipo: "multipla", enunciado: "A gestão estratégica caracteriza-se por:", alternativas: A("alinhar objetivos de longo prazo ao ambiente (missão, visão, valores)", "focar apenas tarefas operacionais", "ignorar o ambiente externo", "eliminar o planejamento", "concentrar-se só no curto prazo"), gabarito: "A", explicacao: "A gestão estratégica trabalha o longo prazo e o alinhamento ao ambiente." },

  // ── Dissertativas ──
  { modulo: "3", tipo: "dissertativa", enunciado: "Compare a Administração Científica (Taylor) e a Teoria Clássica (Fayol) quanto ao foco e à abordagem.", modelo: { estrutura: "Taylor → Fayol → contraste → conclusão.", criterios: ["Taylor: ênfase nas tarefas, de baixo para cima, ORT", "Fayol: ênfase na estrutura, de cima para baixo, POCCC", "Apontar que ambos integram a abordagem clássica/mecanicista"], resposta: "Taylor, na Administração Científica, enfatiza as tarefas e a eficiência do operário no chão de fábrica, com estudo de tempos e movimentos e a Organização Racional do Trabalho (visão de baixo para cima). Fayol, na Teoria Clássica, enfatiza a estrutura organizacional e a direção, definindo as funções do administrador (POCCC: prever, organizar, comandar, coordenar e controlar) e princípios gerais (visão de cima para baixo). Ambos integram a abordagem clássica/mecanicista, com a concepção de homo economicus, diferindo no foco: tarefas (Taylor) × estrutura (Fayol)." } },
  { modulo: "8", tipo: "dissertativa", enunciado: "Explique a Teoria dos Dois Fatores de Herzberg, diferenciando fatores higiênicos e motivacionais.", modelo: { estrutura: "Conceito → higiênicos → motivacionais → conclusão.", criterios: ["Definir os dois fatores", "Higiênicos: extrínsecos, evitam insatisfação", "Motivacionais: intrínsecos, geram satisfação/motivação"], resposta: "A Teoria dos Dois Fatores de Herzberg distingue duas categorias que afetam o trabalho. Os fatores higiênicos são extrínsecos (salário, condições físicas, segurança, relações, políticas da empresa): quando ausentes, geram insatisfação; quando presentes, apenas evitam a insatisfação, mas não motivam. Os fatores motivacionais são intrínsecos (reconhecimento, realização, responsabilidade, crescimento): são eles que efetivamente geram satisfação e motivação. Logo, melhorar apenas os higiênicos não motiva — é preciso atuar nos motivacionais." } },
]

type Card = { modulo: string; frente: string; verso: string }
const CARDS: Card[] = [
  { modulo: "1", frente: "Eficiência × Eficácia × Efetividade", verso: `• Eficiência: meios (uso dos recursos, sem desperdício).\n• Eficácia: fins (alcance dos objetivos).\n• Efetividade: eficiência + resultados (impacto duradouro).` },
  { modulo: "2", frente: "Administração: ciência, técnica e arte; homo economicus", verso: `• Ciência (teorias), técnica (aplicação), arte (habilidade).\n• Homo economicus: homem movido por racionalidade e salário (escolas iniciais).` },
  { modulo: "3", frente: "Administração Científica (Taylor)", verso: `• Ênfase nas TAREFAS (de baixo p/ cima); eficiência do operário.\n• Estudo de tempos e movimentos; ORT; abordagem mecanicista.\n• "Célula-máter" da gestão.` },
  { modulo: "4", frente: "Teoria Clássica (Fayol)", verso: `• Ênfase na ESTRUTURA (de cima p/ baixo). Obra: AIG.\n• Funções do administrador: POCCC (Prever, Organizar, Comandar, Coordenar, Controlar).\n• 14 princípios; função administrativa coordena as demais.` },
  { modulo: "5", frente: "Burocracia (Weber) e Estruturalista", verso: `• Burocracia: racional-legal — normas, hierarquia, impessoalidade, meritocracia.\n• Disfunções (Merton): formalismo, apego às regras, resistência a mudança.\n• Estruturalista: formal + informal + ambiente.` },
  { modulo: "6", frente: "Relações Humanas (Mayo / Hawthorne)", verso: `• Foco no ser humano e nos grupos → homo social.\n• Hawthorne (1927, Western Electric, Chicago): integração social pesa mais que fatores físicos.` },
  { modulo: "7", frente: "Neoclássica e APO (Drucker)", verso: `• Retoma a clássica com foco na prática e nos resultados; consolida PODC.\n• APO (Drucker): objetivos definidos em conjunto e avaliação por resultados.` },
  { modulo: "8", frente: "Comportamental: Maslow, Herzberg, McGregor", verso: `• Maslow: fisiológicas → segurança → sociais → estima → autorrealização.\n• Herzberg: higiênicos (evitam insatisfação) × motivacionais (motivam).\n• McGregor: Teoria X (pessimista) × Y (otimista).` },
  { modulo: "9", frente: "Sistêmica × Contingencial", verso: `• Sistêmica: organização = sistema aberto (visão do todo, interage com o ambiente).\n• Contingencial: "tudo depende" — não há the best way; depende de ambiente e tecnologia.` },
  { modulo: "10", frente: "Modelos de gestão", verso: `• Foco em resultados (metas/indicadores); foco em processos (fluxos); estratégica (longo prazo, missão/visão); democrática/participativa (envolve colaboradores).` },
]

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MAT } })
  if (!disc) throw new Error(`Disciplina ${MAT} não existe.`)
  let c = 0, u = 0
  for (const q of QS) {
    const hash = createHash("sha1").update(`${MAT}|${q.modulo}|${q.enunciado}`).digest("hex")
    const base: any = { materia: MAT, modulo: q.modulo, tipo: q.tipo, enunciado: q.enunciado, hash }
    if (q.tipo === "multipla") { base.alternativas = q.alternativas; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else if (q.tipo === "certo_errado") { base.alternativas = []; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else { base.alternativas = []; base.gabarito = ""; base.modelo = q.modelo }
    const exists = await prisma.questao.findUnique({ where: { hash } })
    await prisma.questao.upsert({ where: { hash }, update: base, create: base })
    exists ? u++ : c++
  }
  let fc = 0
  for (const card of CARDS) {
    const hash = createHash("sha1").update(`${MAT}|${card.modulo}|${card.frente}`).digest("hex")
    await prisma.flashcard.upsert({ where: { hash }, update: { verso: card.verso, ordem: fc }, create: { materia: MAT, modulo: card.modulo, frente: card.frente, verso: card.verso, ordem: fc, hash } })
    fc++
  }
  const all = await prisma.questao.findMany({ where: { materia: MAT }, select: { modulo: true } })
  const mods = new Set(all.map(x => x.modulo))
  const tc = await prisma.flashcard.count({ where: { materia: MAT } })
  console.log(`TGA: ${c} criadas/${u} atualizadas. Total Q ${all.length} (~${(all.length/mods.size).toFixed(1)}/mod); flashcards ${tc}.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
