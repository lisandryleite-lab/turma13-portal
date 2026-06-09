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
  // M2 reforço
  { modulo: "2", tipo: "certo_errado", enunciado: "Os valores podem ser classificados em categorias, entre elas os valores morais, que definem o certo e o errado.", gabarito: "certo", explicacao: "Correto. Valores morais regem a conduta (honestidade, justiça, respeito)." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A ética, por ser reflexão crítica, é mais ampla e fundamenta a moral praticada.", gabarito: "certo", explicacao: "Correto. A ética reflete sobre as regras morais concretas." },
  { modulo: "2", tipo: "multipla", enunciado: "A moral caracteriza-se por:", alternativas: A("variar conforme o tempo e o espaço, refletindo costumes de um grupo", "ser universal e imutável em qualquer época", "coincidir exatamente com a deontologia", "ser independente de qualquer sociedade", "dispensar valores"), gabarito: "A", explicacao: "A moral (costumes praticados) varia no tempo e no espaço." },
  { modulo: "2", tipo: "multipla", enunciado: "Deveres, em sentido ético, são:", alternativas: A("obrigações que decorrem dos valores e das normas", "meras preferências pessoais", "sanções penais", "prerrogativas funcionais", "opiniões mutáveis"), gabarito: "A", explicacao: "Deveres derivam de valores e normas e orientam a conduta." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A deontologia militar é um exemplo de ética aplicada a uma categoria profissional específica.", gabarito: "certo", explicacao: "Correto. É a ética do dever no exercício da profissão militar." },

  // M3 reforço
  { modulo: "3", tipo: "certo_errado", enunciado: "Os direitos civis dizem respeito às liberdades individuais (ir e vir, propriedade, expressão).", gabarito: "certo", explicacao: "Correto. São a primeira dimensão da cidadania (Marshall)." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Os direitos políticos referem-se à participação no poder (votar e ser votado).", gabarito: "certo", explicacao: "Correto. São a segunda dimensão da cidadania." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Os direitos sociais abrangem educação, saúde, trabalho e seguridade.", gabarito: "certo", explicacao: "Correto. São a terceira dimensão (cidadania social)." },
  { modulo: "3", tipo: "multipla", enunciado: "A ética profissional do policial militar exige, entre outros:", alternativas: A("legalidade, impessoalidade, urbanidade e lealdade", "favorecimento de amigos", "uso arbitrário da força", "sigilo sobre crimes próprios", "discriminação de minorias"), gabarito: "A", explicacao: "São padrões de conduta exigidos no exercício da função." },
  { modulo: "3", tipo: "multipla", enunciado: "A legitimidade da polícia em uma democracia decorre, sobretudo:", alternativas: A("da confiança da comunidade e do respeito aos direitos", "do uso da força como regra", "do distanciamento da população", "da autonomia frente à lei", "da repressão indiscriminada"), gabarito: "A", explicacao: "A polícia democrática se legitima pela confiança e respeito aos direitos." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A cidadania compreende apenas direitos, não envolvendo deveres do indivíduo.", gabarito: "errado", explicacao: "Errado. A cidadania envolve direitos E deveres perante o Estado e a sociedade." },

  // M5 reforço
  { modulo: "5", tipo: "certo_errado", enunciado: "O uso da força pelo policial deve observar a legalidade, a necessidade, a proporcionalidade e a moderação.", gabarito: "certo", explicacao: "Correto. São os critérios do uso legítimo da força." },
  { modulo: "5", tipo: "multipla", enunciado: "A prática de exigir vantagem indevida em razão do cargo configura:", alternativas: A("corrupção", "disfunção administrativa neutra", "uso proporcional da força", "exercício regular de direito", "ato de cidadania"), gabarito: "A", explicacao: "É corrupção, vedada e combatida pelo Código da ONU (art. 7º)." },
  { modulo: "5", tipo: "multipla", enunciado: "Abuso de autoridade, prevaricação e descumprimento de protocolos são exemplos de:", alternativas: A("disfunção", "virtude cardinal", "habilidade social", "direito político", "valor moral"), gabarito: "A", explicacao: "São desvios que caracterizam a disfunção policial." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A violência policial fortalece a legitimidade institucional perante a sociedade.", gabarito: "errado", explicacao: "Errado. A violência (uso excessivo/ilegal da força) deslegitima a instituição e viola direitos." },
  { modulo: "5", tipo: "certo_errado", enunciado: "É vedado ao policial divulgar, em redes sociais, dados sigilosos ou imagens vexatórias.", gabarito: "certo", explicacao: "Correto. As normas da SDS estabelecem essas vedações." },

  // M6 reforço
  { modulo: "6", tipo: "certo_errado", enunciado: "A empatia é um dos pilares da inteligência emocional segundo Goleman.", gabarito: "certo", explicacao: "Correto. Ao lado de autoconhecimento, autocontrole, automotivação e habilidades sociais." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A comunicação eficaz dispensa a escuta ativa, bastando transmitir a mensagem.", gabarito: "errado", explicacao: "Errado. A escuta ativa é parte essencial da comunicação eficaz." },
  { modulo: "6", tipo: "multipla", enunciado: "A postura de afirmar-se com firmeza e respeito, sem agredir nem se anular, é a:", alternativas: A("assertividade", "agressividade", "passividade", "apatia", "submissão"), gabarito: "A", explicacao: "Assertividade = firmeza + respeito." },
  { modulo: "6", tipo: "multipla", enunciado: "No estilo de conflito 'evitação', a pessoa tende a:", alternativas: A("fugir do conflito, sem enfrentá-lo", "impor sua vontade a qualquer custo", "ceder totalmente", "buscar solução ganha-ganha", "negociar um meio-termo"), gabarito: "A", explicacao: "A evitação é a fuga do conflito; difere de competição, acomodação, compromisso e colaboração." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A avaliação de desempenho integra a gestão de pessoas.", gabarito: "certo", explicacao: "Correto. Junto com valorização, motivação e desenvolvimento." },
  { modulo: "6", tipo: "multipla", enunciado: "Autoconhecimento, na inteligência emocional, significa:", alternativas: A("reconhecer as próprias emoções", "controlar as emoções alheias", "ignorar os sentimentos", "evitar qualquer emoção", "delegar decisões"), gabarito: "A", explicacao: "É a base da IE: perceber e reconhecer as próprias emoções." },

  // M4 reforço leve
  { modulo: "4", tipo: "certo_errado", enunciado: "O art. 1º do Código da ONU determina que os agentes sirvam à comunidade e protejam as pessoas contra atos ilegais.", gabarito: "certo", explicacao: "Correto. É o dever geral previsto no art. 1º." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O art. 8º do Código da ONU determina que os agentes respeitem a lei e o próprio Código, opondo-se a violações.", gabarito: "certo", explicacao: "Correto. Inclui o dever de comunicar violações aos superiores/autoridades." },
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
  console.log(`ECRI 2o complemento: ${c} criadas/${u} atualizadas. Total ${all.length} (~${(all.length/mods.size).toFixed(1)}/modulo).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
