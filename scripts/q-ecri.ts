import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "ECRI"

type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string }
  | { modulo: string; tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string } }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const QS: Q[] = [
  // M1 — Ética/Moral histórica
  { modulo: "1", tipo: "certo_errado", enunciado: "Para Sócrates, a virtude é uma forma de conhecimento, de modo que ninguém erra (age mal) voluntariamente.", gabarito: "certo", explicacao: "Correto. Tese socrática: 'virtude é conhecimento e o vício é ignorância'; ninguém erra voluntariamente." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O método socrático da maiêutica consiste em impor verdades prontas ao interlocutor por meio de discursos longos.", gabarito: "errado", explicacao: "Errado. A maiêutica conduz o interlocutor, por perguntas, a 'dar à luz' as ideias por si mesmo — não impõe verdades." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Aristóteles defende a doutrina do meio-termo, segundo a qual a virtude está entre dois extremos (excesso e falta).", gabarito: "certo", explicacao: "Correto. Ex.: a coragem é o meio-termo entre a temeridade (excesso) e a covardia (falta)." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Para Kant, a moralidade de uma ação depende fundamentalmente de suas consequências e dos sentimentos do agente.", gabarito: "errado", explicacao: "Errado. A ética kantiana é deontológica: baseia-se na razão e no dever (imperativo categórico), não nas consequências nem nos sentimentos — esta é a posição de Hume." },
  { modulo: "1", tipo: "multipla", enunciado: "As quatro virtudes cardinais identificadas por Platão são:", alternativas: A("Sabedoria, Coragem, Temperança e Justiça", "Fé, Esperança, Caridade e Prudência", "Legalidade, Moralidade, Eficiência e Justiça", "Honestidade, Lealdade, Disciplina e Hierarquia", "Razão, Emoção, Desejo e Vontade"), gabarito: "A", explicacao: "Platão: Sabedoria (racional), Coragem (irascível), Temperança (apetitiva) e Justiça (harmoniza as três partes da alma)." },
  { modulo: "1", tipo: "multipla", enunciado: "A formulação 'Age apenas segundo uma máxima tal que possas querer que ela se torne lei universal' é o núcleo do(a):", alternativas: A("Imperativo categórico de Kant", "Maiêutica de Sócrates", "Ética do discurso de Habermas", "Doutrina do meio-termo de Aristóteles", "Contrato social de Rousseau"), gabarito: "A", explicacao: "É o imperativo categórico de Kant; outra formulação trata a humanidade sempre como fim, nunca apenas como meio." },
  { modulo: "1", tipo: "multipla", enunciado: "A 'ética do discurso', que fundamenta a validade das normas no consenso obtido por diálogo racional livre de coerção, é de:", alternativas: A("Jürgen Habermas", "Michel Foucault", "David Hume", "Santo Agostinho", "Immanuel Kant"), gabarito: "A", explicacao: "Habermas (Escola de Frankfurt) desenvolveu a ética do discurso." },

  // M2 — Conceitos / autonomia
  { modulo: "2", tipo: "certo_errado", enunciado: "Moral é o conjunto de regras concretas praticadas por uma sociedade, enquanto ética é a reflexão filosófica e crítica sobre essas regras.", gabarito: "certo", explicacao: "Correto. Moral = costumes/regras praticadas; ética = teoria/reflexão sobre a moral." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Deontologia é a ética aplicada ao dever no exercício de uma profissão.", gabarito: "certo", explicacao: "Correto. Do grego 'déon' (dever): é a ética profissional, dos deveres do ofício." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A autonomia moral é a incapacidade de decidir por si, levando o indivíduo a depender sempre de ordens externas (heteronomia).", gabarito: "errado", explicacao: "Errado. Autonomia moral é justamente a capacidade de decidir por si, com liberdade e responsabilidade; a heteronomia é o oposto." },
  { modulo: "2", tipo: "multipla", enunciado: "Assinale a associação correta:", alternativas: A("Ética = reflexão crítica sobre a moral; Deontologia = ética do dever profissional", "Moral = teoria filosófica; Ética = costumes praticados", "Deontologia = estudo do ser; Moral = estudo do dever", "Ética e moral são conceitos idênticos e intercambiáveis", "Valores = obrigações legais; Deveres = preferências pessoais"), gabarito: "A", explicacao: "Ética é a reflexão sobre a moral; deontologia é a ética aplicada ao dever profissional." },

  // M3 — Cidadania / ética profissional
  { modulo: "3", tipo: "certo_errado", enunciado: "Em um Estado Democrático de Direito, a Polícia Militar atua como garantidora de direitos, e não como instrumento de repressão arbitrária.", gabarito: "certo", explicacao: "Correto. A ética policial militar em uma democracia funda-se na garantia de direitos e na relação de confiança com a comunidade." },
  { modulo: "3", tipo: "multipla", enunciado: "Segundo a clássica divisão de T. H. Marshall, a cidadania compreende direitos:", alternativas: A("civis, políticos e sociais", "naturais, divinos e positivos", "individuais, coletivos e difusos", "absolutos, relativos e mistos", "penais, civis e administrativos"), gabarito: "A", explicacao: "Marshall divide a cidadania em direitos civis, políticos e sociais." },

  // M4 — Código ONU / normas
  { modulo: "4", tipo: "certo_errado", enunciado: "O Código de Conduta para os Funcionários Responsáveis pela Aplicação da Lei foi adotado pela ONU por meio da Resolução nº 34/169, de 17 de dezembro de 1979, e possui oito artigos.", gabarito: "certo", explicacao: "Correto. Resolução 34/169/1979, 8 artigos, referência para as polícias do mundo." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Conforme o Código de Conduta da ONU, a tortura pode ser admitida excepcionalmente em estado de guerra ou diante de ameaça à segurança nacional.", gabarito: "errado", explicacao: "Errado. O art. 5º torna a proibição da tortura ABSOLUTA: nenhuma circunstância excepcional a justifica." },
  { modulo: "4", tipo: "certo_errado", enunciado: "A Declaração Universal dos Direitos Humanos é de 1948 e a ONU foi criada em 1945.", gabarito: "certo", explicacao: "Correto. ONU criada em 1945; DUDH em 1948; Código de Conduta (Res. 34/169) em 1979." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O Estatuto dos Policiais Militares de Pernambuco é a Lei Estadual nº 6.783/1974.", gabarito: "certo", explicacao: "Correto. A Lei 6.783/1974 regula situação, obrigações, deveres, direitos e prerrogativas dos PM de PE." },
  { modulo: "4", tipo: "multipla", enunciado: "Sobre o uso da força no Código de Conduta da ONU (Res. 34/169), é correto afirmar que:", alternativas: A("só pode ser empregada quando estritamente necessário e na medida exigida pelo cumprimento do dever", "é livre, a critério do agente, em qualquer abordagem", "é proibida em todas as circunstâncias", "depende apenas de ordem verbal do superior", "só é permitida contra estrangeiros"), gabarito: "A", explicacao: "Art. 3º: a força só pode ser empregada quando estritamente necessário e na medida exigida para o cumprimento do dever." },

  // M5 — Questões éticas
  { modulo: "5", tipo: "certo_errado", enunciado: "Violência policial, corrupção e disfunção são tratadas como desvios éticos que deslegitimam a instituição e geram responsabilização.", gabarito: "certo", explicacao: "Correto. São as três grandes patologias éticas estudadas, combatidas pelo Código da ONU e pelos normativos da PMPE." },
  { modulo: "5", tipo: "certo_errado", enunciado: "O Código de Conduta da ONU autoriza o policial a cometer atos de corrupção desde que não haja prejuízo financeiro direto.", gabarito: "errado", explicacao: "Errado. O art. 7º proíbe qualquer ato de corrupção e impõe combatê-los rigorosamente." },

  // M6 — Relações interpessoais
  { modulo: "6", tipo: "certo_errado", enunciado: "A inteligência emocional, segundo Daniel Goleman, compreende autoconhecimento, autocontrole, automotivação, empatia e habilidades sociais.", gabarito: "certo", explicacao: "Correto. São os cinco pilares da inteligência emocional de Goleman." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Assertividade e agressividade são sinônimas, pois ambas consistem em desrespeitar o interlocutor para impor a própria opinião.", gabarito: "errado", explicacao: "Errado. Assertividade é afirmar-se com firmeza E respeito; a agressividade desrespeita o outro." },
  { modulo: "6", tipo: "multipla", enunciado: "No estilo de gestão de conflitos conhecido como colaboração (ganha-ganha), busca-se:", alternativas: A("uma solução que atenda aos interesses de ambas as partes", "a imposição da vontade do mais forte", "a fuga do conflito a qualquer custo", "a renúncia integral dos próprios interesses", "o sorteio aleatório da decisão"), gabarito: "A", explicacao: "A colaboração (ganha-ganha) procura satisfazer os interesses de ambas as partes, ao contrário da competição, acomodação ou evitação." },
  { modulo: "6", tipo: "dissertativa", enunciado: "Explique a importância da inteligência emocional para o desempenho profissional do oficial da PMPE, citando seus pilares.", modelo: { estrutura: "Conceito → pilares (Goleman) → aplicação policial → conclusão.", criterios: ["Definir IE como reconhecer/gerir emoções próprias e alheias", "Citar os cinco pilares de Goleman", "Relacionar com decisões sob estresse, mediação e uso da força"], resposta: "A inteligência emocional (Daniel Goleman) é a capacidade de reconhecer e gerir as próprias emoções e as dos outros, apoiando-se em cinco pilares: autoconhecimento, autocontrole, automotivação, empatia e habilidades sociais. Para o oficial da PMPE, é decisiva: permite tomar decisões equilibradas sob estresse, mediar conflitos, reduzir o uso desnecessário da força e fortalecer a relação de confiança com a comunidade, contribuindo para uma atuação ética e eficaz." } },

  // Dissertativa M4
  { modulo: "4", tipo: "dissertativa", enunciado: "Disserte sobre o Código de Conduta da ONU para os Funcionários Responsáveis pela Aplicação da Lei (Res. 34/169), destacando seus princípios e a vedação à tortura.", modelo: { estrutura: "Origem/número → princípios → vedação absoluta da tortura → conclusão.", criterios: ["Citar a Resolução 34/169 (1979) e os 8 artigos", "Indicar princípios: força mínima, dignidade, imparcialidade, legalidade, anticorrupção", "Destacar o caráter absoluto da proibição da tortura (art. 5º)"], resposta: "O Código de Conduta foi adotado pela Assembleia Geral da ONU pela Resolução nº 34/169, de 17/12/1979, com oito artigos que orientam todas as polícias do mundo. Seus princípios incluem o uso da força apenas quando estritamente necessário e proporcional, o respeito à dignidade humana, a imparcialidade, a legalidade, o sigilo de informações, a proteção da saúde dos detidos e o combate à corrupção. Destaca-se a proibição ABSOLUTA da tortura (art. 5º): nenhuma circunstância excepcional — estado de guerra, ameaça à segurança nacional ou ordem superior — pode justificá-la." } },
]

type Card = { modulo: string; frente: string; verso: string }
const CARDS: Card[] = [
  { modulo: "1", frente: "Sócrates — virada ética e maiêutica", verso: `• Desloca o foco do cosmos para o ser humano e a virtude.\n• Maiêutica: por perguntas, "dá à luz" as ideias do interlocutor.\n• "Virtude é conhecimento; o vício é ignorância" — ninguém erra voluntariamente.` },
  { modulo: "1", frente: "Platão — 4 virtudes cardinais", verso: `• Sabedoria (parte racional), Coragem (irascível), Temperança (apetitiva) e Justiça (harmoniza as três).\n• Alma dividida em 3 partes; felicidade = harmonia com a razão governando.` },
  { modulo: "1", frente: "Aristóteles — eudaimonia e meio-termo", verso: `• Fim último = felicidade (eudaimonia); virtude é hábito adquirido pela prática.\n• Doutrina do meio-termo: virtude entre dois extremos (coragem = entre temeridade e covardia).\n• Virtudes intelectuais × morais.` },
  { modulo: "1", frente: "Kant — imperativo categórico", verso: `• Moral baseada na razão pura e no DEVER (não nas consequências).\n• "Age só segundo máxima que possas querer como lei universal."\n• "Trata a humanidade sempre como FIM, nunca apenas como MEIO."` },
  { modulo: "1", frente: "Hume × Rousseau × Habermas", verso: `• Hume: moral sentimentalista (a razão sozinha não move; agem os sentimentos).\n• Rousseau: bondade natural corrompida pela sociedade; contrato social.\n• Habermas: ética do discurso — validade da norma pelo consenso no diálogo racional.` },
  { modulo: "2", frente: "Moral × Ética × Deontologia", verso: `• Moral: regras concretas praticadas (costumes), variam no tempo/espaço.\n• Ética: reflexão filosófica/crítica sobre a moral.\n• Deontologia: ética aplicada ao DEVER profissional (déon = dever).` },
  { modulo: "2", frente: "Autonomia Moral", verso: `• Capacidade de decidir por si, com liberdade + responsabilidade (oposto: heteronomia).\n• Influenciada por família, cultura, educação, religião e experiência.` },
  { modulo: "3", frente: "Cidadania (Marshall) e ética policial", verso: `• Direitos civis, políticos e sociais.\n• PM na democracia: garantidora de direitos, base da relação polícia-comunidade.` },
  { modulo: "4", frente: "Código de Conduta da ONU (Res. 34/169)", verso: `• Adotado pela ONU em 17/12/1979; 8 artigos; referência mundial.\n• Princípios: força mínima/proporcional, proibição absoluta da tortura, dignidade, imparcialidade, legalidade, anticorrupção.\n• ONU criada em 1945; DUDH em 1948.` },
  { modulo: "4", frente: "Proibição da tortura (art. 5º)", verso: `• Absoluta: nenhuma circunstância (guerra, ameaça à segurança, ordem superior) justifica tortura ou tratamento cruel/desumano/degradante.` },
  { modulo: "4", frente: "Normas internas — Estatuto e Regulamento de Ética", verso: `• Estatuto dos PM de PE: Lei nº 6.783/1974 (obrigações, deveres, direitos, prerrogativas).\n• Regulamento de Ética dos Militares de PE: deontologia militar, valores/princípios, deveres éticos e suas violações.` },
  { modulo: "5", frente: "Patologias éticas: violência, corrupção, disfunção", verso: `• Violência policial: uso excessivo/ilegal da força.\n• Corrupção: vantagem indevida pelo cargo (Código ONU art. 7º proíbe e impõe combater).\n• Disfunção: desvios que afastam a polícia de sua finalidade.` },
  { modulo: "6", frente: "Inteligência Emocional (Goleman) — 5 pilares", verso: `• Autoconhecimento, autocontrole, automotivação, empatia e habilidades sociais.\n• No policial: decisão sob estresse, mediação, menos uso da força.` },
  { modulo: "6", frente: "Comunicação, assertividade e conflitos", verso: `• Comunicação eficaz: escuta ativa, empatia, feedback.\n• Assertividade (firmeza + respeito) ≠ agressividade.\n• Gestão de conflitos: competição, acomodação, evitação, compromisso e colaboração (ganha-ganha).` },
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
  const [tq, tc] = await Promise.all([prisma.questao.count({ where: { materia: MAT } }), prisma.flashcard.count({ where: { materia: MAT } })])
  console.log(`ECRI: questoes ${c} criadas/${u} atualizadas (total ${tq}); flashcards ${fc} (total ${tc}).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
