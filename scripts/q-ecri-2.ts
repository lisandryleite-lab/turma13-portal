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
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const QS: Q[] = [
  // ── M1 — Ética/Moral histórica ──
  { modulo: "1", tipo: "certo_errado", enunciado: "Os pré-socráticos buscavam a 'arché', o princípio fundamental de todas as coisas, voltando-se inicialmente para a natureza (cosmos).", gabarito: "certo", explicacao: "Correto. Tales (água) e Anaximandro (ápeiron) buscavam a arché." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Sócrates deslocou o foco da filosofia do cosmos para o ser humano e a virtude.", gabarito: "certo", explicacao: "Correto. Inaugura a filosofia moral, com a maiêutica." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Para Platão, a alma humana divide-se em três partes: racional, irascível e apetitiva.", gabarito: "certo", explicacao: "Correto. A felicidade é a harmonia entre elas, com a razão governando." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Aristóteles entendia a virtude como um dom inato, independente da prática e do hábito.", gabarito: "errado", explicacao: "Errado. Para Aristóteles a virtude é um hábito adquirido pela prática e pelo exercício." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Santo Agostinho sofreu forte influência de Platão, enquanto São Tomás de Aquino se inspirou em Aristóteles.", gabarito: "certo", explicacao: "Correto. Agostinho (platônico) e Aquino (aristotélico) são os marcos da ética medieval." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Para Hume, a razão, sozinha, é suficiente para motivar a ação moral.", gabarito: "errado", explicacao: "Errado. Hume é sentimentalista: a razão sozinha não move; agem os sentimentos (simpatia, benevolência)." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Rousseau defendia que o ser humano é naturalmente bom, sendo corrompido pela sociedade.", gabarito: "certo", explicacao: "Correto. Daí sua defesa do contrato social e da liberdade." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Habermas fundamenta a moralidade no consenso obtido por um discurso racional livre de coerção (ética do discurso).", gabarito: "certo", explicacao: "Correto. É a ética do discurso, ligada à Escola de Frankfurt." },
  { modulo: "1", tipo: "multipla", enunciado: "O método socrático que conduz o interlocutor, por perguntas, a 'dar à luz' as próprias ideias chama-se:", alternativas: A("maiêutica", "dialética hegeliana", "imperativo categórico", "doutrina do meio-termo", "ceticismo"), gabarito: "A", explicacao: "Maiêutica: a 'arte de partejar' ideias por meio do diálogo." },
  { modulo: "1", tipo: "multipla", enunciado: "A 'doutrina do meio-termo', segundo a qual a virtude está entre dois extremos, é de:", alternativas: A("Aristóteles", "Platão", "Kant", "Hume", "Foucault"), gabarito: "A", explicacao: "Aristóteles: a coragem é o meio-termo entre temeridade e covardia." },
  { modulo: "1", tipo: "multipla", enunciado: "Para Sócrates, a virtude é ________ e o vício é ________:", alternativas: A("conhecimento; ignorância", "prazer; dor", "força; fraqueza", "fé; razão", "hábito; instinto"), gabarito: "A", explicacao: "Tese intelectualista socrática: virtude é conhecimento; vício é ignorância." },
  { modulo: "1", tipo: "multipla", enunciado: "A obra 'Vigiar e Punir' (1975), sobre poder, controle social e punição, é de:", alternativas: A("Michel Foucault", "Jürgen Habermas", "Immanuel Kant", "David Hume", "Jean-Jacques Rousseau"), gabarito: "A", explicacao: "Foucault, pensador pós-moderno, escreveu 'Vigiar e Punir'." },
  { modulo: "1", tipo: "multipla", enunciado: "A felicidade como fim último da vida humana, alcançada pela virtude, era chamada pelos gregos de:", alternativas: A("eudaimonia", "ataraxia", "hybris", "logos", "physis"), gabarito: "A", explicacao: "Eudaimonia é a felicidade/realização plena buscada por Platão e Aristóteles." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A bioética é um campo interdisciplinar que trata de dilemas éticos ligados à vida e à saúde (eutanásia, aborto, clonagem).", gabarito: "certo", explicacao: "Correto. Integra ciência, filosofia e religião sob a dignidade humana." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Kant pertence ao período do Iluminismo e fundamenta a moral na razão e no dever.", gabarito: "certo", explicacao: "Correto. Kant (1724-1804) é o grande nome da ética iluminista." },

  // ── M2 — Conceitos ──
  { modulo: "2", tipo: "certo_errado", enunciado: "Valores são princípios que orientam as escolhas, ações e julgamentos, funcionando como 'bússola interna'.", gabarito: "certo", explicacao: "Correto. Indicam o que é importante, desejável e correto." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Moral é a reflexão filosófica e crítica sobre as regras de conduta, enquanto ética é o conjunto de regras praticadas.", gabarito: "errado", explicacao: "Errado. É o inverso: MORAL = regras/costumes praticados; ÉTICA = reflexão crítica sobre a moral." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Deontologia é a ética aplicada ao dever no exercício de uma profissão.", gabarito: "certo", explicacao: "Correto. Do grego 'déon' (dever)." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A autonomia moral pressupõe liberdade e responsabilidade na tomada de decisões.", gabarito: "certo", explicacao: "Correto. É a capacidade de decidir por si, oposta à heteronomia." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A heteronomia é a capacidade de o indivíduo dar a si mesmo a própria lei moral.", gabarito: "errado", explicacao: "Errado. Isso é autonomia; heteronomia é a dependência de leis/ordens externas." },
  { modulo: "2", tipo: "multipla", enunciado: "Assinale a associação correta:", alternativas: A("Moral: costumes praticados; Ética: reflexão sobre a moral; Deontologia: ética profissional", "Moral: teoria; Ética: prática; Deontologia: filosofia da ciência", "Moral: dever profissional; Ética: lei; Deontologia: costume", "Moral e ética são idênticas; deontologia é sua negação", "Valores: leis; Deveres: hábitos; Moral: opinião"), gabarito: "A", explicacao: "Moral = costumes; Ética = reflexão; Deontologia = ética do dever profissional." },
  { modulo: "2", tipo: "multipla", enunciado: "Honestidade, justiça, respeito e solidariedade são exemplos de:", alternativas: A("valores morais", "deveres legais", "normas processuais", "sanções administrativas", "prerrogativas funcionais"), gabarito: "A", explicacao: "São valores morais — princípios que regem a conduta humana." },
  { modulo: "2", tipo: "multipla", enunciado: "Fatores que influenciam a autonomia moral incluem:", alternativas: A("família, cultura, educação, religião e experiência", "apenas a genética", "somente a legislação penal", "exclusivamente a hierarquia militar", "apenas a situação econômica"), gabarito: "A", explicacao: "A autonomia é construída por múltiplos fatores sociais e individuais." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Na PMPE, a autonomia moral implica conciliar a obediência hierárquica com a consciência ética.", gabarito: "certo", explicacao: "Correto. Agir com retidão mesmo sob pressão, dentro da legalidade." },
  { modulo: "2", tipo: "multipla", enunciado: "O termo 'deontologia' deriva do grego 'déon', que significa:", alternativas: A("dever", "virtude", "felicidade", "poder", "verdade"), gabarito: "A", explicacao: "Déon = dever; deontologia é a 'ciência do dever' profissional." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Valores funcionam como referências que influenciam atitudes e a forma de interagir com o mundo.", gabarito: "certo", explicacao: "Correto. São princípios orientadores das escolhas." },

  // ── M3 — Cidadania / ética profissional ──
  { modulo: "3", tipo: "certo_errado", enunciado: "Cidadania é o conjunto de direitos e deveres do indivíduo perante o Estado e a sociedade.", gabarito: "certo", explicacao: "Correto. Envolve dimensões civis, políticas e sociais." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Em uma democracia, a Polícia Militar deve atuar como instrumento de repressão arbitrária, acima dos direitos do cidadão.", gabarito: "errado", explicacao: "Errado. Em uma democracia a PM é garantidora de direitos, sob a lei." },
  { modulo: "3", tipo: "multipla", enunciado: "A clássica divisão da cidadania em direitos civis, políticos e sociais é atribuída a:", alternativas: A("T. H. Marshall", "Karl Marx", "Max Weber", "Émile Durkheim", "John Rawls"), gabarito: "A", explicacao: "T. H. Marshall propôs as três dimensões (civil, política e social) da cidadania." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A ética profissional é o padrão de conduta exigido no exercício da função (legalidade, impessoalidade, urbanidade, lealdade).", gabarito: "certo", explicacao: "Correto. Orienta o comportamento esperado do profissional." },
  { modulo: "3", tipo: "multipla", enunciado: "A relação polícia-comunidade, na perspectiva da ética policial militar, deve basear-se em:", alternativas: A("confiança, legitimidade e respeito mútuo", "medo e imposição", "distanciamento total", "favorecimento de aliados", "neutralidade quanto aos direitos humanos"), gabarito: "A", explicacao: "A legitimidade da polícia democrática repousa na confiança e no respeito mútuo." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A cidadania institucional refere-se ao papel da corporação como agente de garantia de direitos.", gabarito: "certo", explicacao: "Correto. A instituição também é sujeito de promoção da cidadania." },
  { modulo: "3", tipo: "multipla", enunciado: "São deveres associados à ética profissional do policial militar, EXCETO:", alternativas: A("favorecer pessoalmente amigos e aliados", "legalidade", "impessoalidade", "urbanidade", "lealdade institucional"), gabarito: "A", explicacao: "O favorecimento pessoal viola a impessoalidade — não é dever ético." },

  // ── M4 — Código ONU / normas ──
  { modulo: "4", tipo: "certo_errado", enunciado: "O Código de Conduta para os Funcionários Responsáveis pela Aplicação da Lei foi adotado pela ONU pela Resolução 34/169, de 1979.", gabarito: "certo", explicacao: "Correto. 17/12/1979, com 8 artigos." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O Código de Conduta da ONU possui dez artigos.", gabarito: "errado", explicacao: "Errado. Possui OITO (8) artigos." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Pelo Código da ONU, a força só pode ser empregada quando estritamente necessário e na medida exigida para o cumprimento do dever.", gabarito: "certo", explicacao: "Correto. É o art. 3º do Código." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Segundo o Código da ONU, ordens superiores ou o estado de guerra justificam a prática de tortura em casos excepcionais.", gabarito: "errado", explicacao: "Errado. O art. 5º proíbe a tortura de forma absoluta — nenhuma circunstância a justifica." },
  { modulo: "4", tipo: "certo_errado", enunciado: "A ONU foi criada em 1945 e a Declaração Universal dos Direitos Humanos data de 1948.", gabarito: "certo", explicacao: "Correto. O Código de Conduta (Res. 34/169) é de 1979." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O Estatuto dos Policiais Militares de Pernambuco é a Lei Estadual nº 6.783/1974.", gabarito: "certo", explicacao: "Correto. Regula obrigações, deveres, direitos e prerrogativas." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O Regulamento de Ética dos Militares de Pernambuco trata da deontologia militar, valores, princípios e deveres éticos.", gabarito: "certo", explicacao: "Correto. Inclui ainda a violação dos deveres e os direitos humanos." },
  { modulo: "4", tipo: "multipla", enunciado: "Pelo Código da ONU, as informações confidenciais em poder do agente:", alternativas: A("devem ser mantidas em segredo, salvo exigência do dever ou da justiça", "podem ser divulgadas livremente", "pertencem à imprensa", "devem ser destruídas imediatamente", "são públicas por padrão"), gabarito: "A", explicacao: "Art. 4º: sigilo, salvo quando o dever ou a justiça exigirem outro comportamento." },
  { modulo: "4", tipo: "multipla", enunciado: "Considera-se 'funcionário responsável pela aplicação da lei', no Código da ONU:", alternativas: A("todos os agentes com poderes policiais, inclusive autoridades militares", "apenas policiais civis", "somente juízes", "apenas guardas municipais", "exclusivamente delegados"), gabarito: "A", explicacao: "Abrange agentes nomeados ou eleitos com poderes policiais, inclusive autoridades militares." },
  { modulo: "4", tipo: "multipla", enunciado: "O art. 7º do Código de Conduta da ONU trata especificamente:", alternativas: A("do combate à corrupção", "da liberdade de imprensa", "do direito de greve", "da pena de morte", "do serviço militar obrigatório"), gabarito: "A", explicacao: "Art. 7º: os agentes não devem cometer corrupção e devem combatê-la." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O Código da ONU determina que os agentes devem assegurar a proteção da saúde das pessoas sob sua guarda.", gabarito: "certo", explicacao: "Correto. É o art. 6º do Código." },

  // ── M5 — Questões éticas ──
  { modulo: "5", tipo: "certo_errado", enunciado: "Violência policial é o uso excessivo ou ilegal da força, que viola direitos humanos e deslegitima a instituição.", gabarito: "certo", explicacao: "Correto. Gera responsabilização penal, civil e administrativa." },
  { modulo: "5", tipo: "certo_errado", enunciado: "O uso legítimo da força é monopólio do Estado, balizado por legalidade, necessidade, proporcionalidade e moderação.", gabarito: "certo", explicacao: "Correto. É a deontologia do uso da força." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Corrupção é o uso do cargo para obtenção de vantagem indevida.", gabarito: "certo", explicacao: "Correto. O Código da ONU (art. 7º) proíbe e impõe combatê-la." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Disfunção policial designa os desvios de conduta que afastam a polícia de sua finalidade institucional.", gabarito: "certo", explicacao: "Correto. Ex.: abuso de autoridade, prevaricação, descumprimento de protocolos." },
  { modulo: "5", tipo: "multipla", enunciado: "As três grandes patologias éticas tratadas na disciplina são:", alternativas: A("violência, corrupção e disfunção", "preguiça, vaidade e inveja", "ilegalidade, ineficiência e impessoalidade", "desídia, deserção e insubordinação", "abuso, furto e calúnia"), gabarito: "A", explicacao: "Violência policial, corrupção e disfunção." },
  { modulo: "5", tipo: "multipla", enunciado: "Quanto ao uso de redes sociais (normas da SDS), é vedado ao policial:", alternativas: A("expor imagens vexatórias, dados sigilosos ou usar a farda em circunstância negativa", "ter conta pessoal em qualquer rede", "acessar a internet fora de serviço", "ler notícias sobre a corporação", "seguir perfis institucionais oficiais"), gabarito: "A", explicacao: "As vedações alcançam exposição vexatória, sigilo e uso indevido da imagem/farda." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A deontologia da polícia admite o uso da força como primeiro recurso, independentemente da necessidade.", gabarito: "errado", explicacao: "Errado. A força é balizada por necessidade, proporcionalidade e moderação — não é primeiro recurso." },

  // ── M6 — Relações interpessoais ──
  { modulo: "6", tipo: "certo_errado", enunciado: "A inteligência emocional (Goleman) compreende autoconhecimento, autocontrole, automotivação, empatia e habilidades sociais.", gabarito: "certo", explicacao: "Correto. São os cinco pilares de Goleman." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Assertividade é a mesma coisa que agressividade.", gabarito: "errado", explicacao: "Errado. Assertividade é firmeza COM respeito; agressividade desrespeita o outro." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A escuta ativa e o feedback são elementos de uma comunicação eficaz.", gabarito: "certo", explicacao: "Correto. Reduzem ruídos e conflitos." },
  { modulo: "6", tipo: "multipla", enunciado: "O estilo de gestão de conflitos 'ganha-ganha', que busca atender aos interesses de ambas as partes, é a:", alternativas: A("colaboração", "competição", "acomodação", "evitação", "imposição"), gabarito: "A", explicacao: "A colaboração busca solução que satisfaça ambos os lados." },
  { modulo: "6", tipo: "multipla", enunciado: "São estilos de liderança citados, EXCETO:", alternativas: A("liderança hereditária", "autocrático", "democrático", "liberal (laissez-faire)", "situacional"), gabarito: "A", explicacao: "Os estilos citados são autocrático, democrático, liberal e situacional; 'hereditária' não é um deles." },
  { modulo: "6", tipo: "multipla", enunciado: "A inteligência emocional beneficia o policial principalmente por:", alternativas: A("melhorar decisões sob estresse, mediação de conflitos e relação com a comunidade", "aumentar a força física", "dispensar o cumprimento da lei", "substituir o treinamento técnico", "garantir promoções automáticas"), gabarito: "A", explicacao: "A IE favorece autocontrole, empatia e decisões equilibradas em situações críticas." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O trabalho em equipe pressupõe objetivos comuns, cooperação, complementaridade e confiança.", gabarito: "certo", explicacao: "Correto. É essencial na atividade operacional." },
  { modulo: "6", tipo: "multipla", enunciado: "São estilos de gestão de conflitos, além da colaboração:", alternativas: A("competição, acomodação, evitação e compromisso", "alvará, mandado e ofício", "sensação, percepção e memória", "soldo, gratificação e indenização", "civil, político e social"), gabarito: "A", explicacao: "Competição, acomodação, evitação, compromisso e colaboração são os cinco estilos." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Gestão de pessoas inclui valorização, motivação, desenvolvimento e avaliação de desempenho.", gabarito: "certo", explicacao: "Correto. São dimensões da gestão de pessoas." },
]

async function main() {
  let c = 0, u = 0
  for (const q of QS) {
    const hash = createHash("sha1").update(`${MAT}|${q.modulo}|${q.enunciado}`).digest("hex")
    const base: any = { materia: MAT, modulo: q.modulo, tipo: q.tipo, enunciado: q.enunciado, hash }
    if (q.tipo === "multipla") { base.alternativas = q.alternativas; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else { base.alternativas = []; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    const exists = await prisma.questao.findUnique({ where: { hash } })
    await prisma.questao.upsert({ where: { hash }, update: base, create: base })
    exists ? u++ : c++
  }
  const all = await prisma.questao.findMany({ where: { materia: MAT }, select: { modulo: true } })
  const mods = new Set(all.map(x => x.modulo))
  console.log(`ECRI complemento: ${c} criadas/${u} atualizadas. Total ${all.length} (~${(all.length/mods.size).toFixed(1)}/modulo).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
