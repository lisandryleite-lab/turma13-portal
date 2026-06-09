import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "SMQV"
type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))
const QS: Q[] = [
  // M1
  { modulo: "1", tipo: "certo_errado", enunciado: "A saúde mental influencia a forma como pensamos, sentimos, agimos e enfrentamos o estresse.", gabarito: "certo", explicacao: "Correto. Afeta também os relacionamentos e a tomada de decisão (OMS)." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A qualidade de vida é um conceito estático e idêntico para todas as pessoas.", gabarito: "errado", explicacao: "Errado. É dinâmica e contingencial — varia conforme motivações, necessidades e circunstâncias de cada um." },
  { modulo: "1", tipo: "multipla", enunciado: "A QVT, atualmente, abrange:", alternativas: A("aspectos físicos/ambientais e psicológicos do trabalho", "apenas o salário", "somente a jornada de trabalho", "exclusivamente a segurança física", "apenas o lazer fora do trabalho"), gabarito: "A", explicacao: "Integra condições físicas/ambientais e o bem-estar psicológico." },
  { modulo: "1", tipo: "multipla", enunciado: "A QVT assimila duas posições: de um lado o bem-estar do colaborador, de outro:", alternativas: A("o interesse da organização na produtividade e qualidade", "o lucro dos acionistas apenas", "a redução de pessoal", "o aumento da jornada", "a terceirização total"), gabarito: "A", explicacao: "A QVT concilia satisfação do colaborador e efeitos positivos sobre a produtividade." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Problemas de saúde mental podem reduzir a qualidade de vida, afetando o trabalho, as relações e a satisfação geral.", gabarito: "certo", explicacao: "Correto. Saúde mental e QV são interligadas." },
  { modulo: "1", tipo: "multipla", enunciado: "A qualidade de vida é estudada por diversas ciências porque é um conceito:", alternativas: A("abrangente e multidisciplinar", "estritamente médico", "puramente jurídico", "exclusivamente econômico", "apenas religioso"), gabarito: "A", explicacao: "Engloba todas as esferas da vida humana — interesse de várias áreas." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Para a OMS, ter saúde mental inclui ser capaz de contribuir para a própria comunidade.", gabarito: "certo", explicacao: "Correto. Faz parte da definição de bem-estar da OMS." },
  // M2
  { modulo: "2", tipo: "certo_errado", enunciado: "A falta de apoio social no trabalho é um fator que pode prejudicar a saúde mental do colaborador.", gabarito: "certo", explicacao: "Correto. Ao lado de estresse, pressão e condições físicas." },
  { modulo: "2", tipo: "multipla", enunciado: "Entre os fatores ocupacionais que impactam a saúde mental do policial, destaca-se:", alternativas: A("a exposição contínua a risco e violência", "o excesso de folgas", "a ausência de hierarquia", "a falta de qualquer cobrança", "o trabalho exclusivamente remoto"), gabarito: "A", explicacao: "Risco, violência, escala e cobrança elevam a vulnerabilidade." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A saúde mental no trabalho tem implicações diretas na produtividade da organização.", gabarito: "certo", explicacao: "Correto. Colaborador saudável → maior produtividade." },
  { modulo: "2", tipo: "multipla", enunciado: "A promoção da saúde mental no ambiente de trabalho passa por:", alternativas: A("comunicação clara, reconhecimento e ambiente positivo", "aumento da pressão por metas", "redução do apoio social", "ocultar problemas", "isolar os colaboradores"), gabarito: "A", explicacao: "São estratégias de promoção citadas na apostila." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Tanto fatores individuais quanto sociais e organizacionais influenciam a saúde mental.", gabarito: "certo", explicacao: "Correto. Há interação entre o individual e o coletivo." },
  { modulo: "2", tipo: "multipla", enunciado: "Um ambiente de trabalho positivo, na perspectiva da saúde mental, contribui para:", alternativas: A("reduzir o adoecimento e aumentar o bem-estar", "elevar o estresse crônico", "aumentar o absenteísmo", "piorar o clima organizacional", "estimular conflitos"), gabarito: "A", explicacao: "Ambientes positivos protegem a saúde mental." },
  // M3
  { modulo: "3", tipo: "multipla", enunciado: "A primeira fase do estresse, no modelo de Lipp, é a fase de:", alternativas: A("alerta", "resistência", "quase-exaustão", "exaustão", "recuperação"), gabarito: "A", explicacao: "Ordem: alerta → resistência → quase-exaustão → exaustão." },
  { modulo: "3", tipo: "multipla", enunciado: "A homeostase, citada por Lipp, refere-se a:", alternativas: A("equilíbrio interno do organismo", "excesso de adrenalina", "ausência de emoções", "estado de euforia", "resposta imune"), gabarito: "A", explicacao: "Estresse é a reação à ameaça à homeostase (equilíbrio interno)." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O Transtorno de Ansiedade Generalizada (TAG) é uma das formas de transtorno de ansiedade.", gabarito: "certo", explicacao: "Correto. Ao lado de pânico, fobia social, agorafobia e TEPT." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A depressão é um problema raro e de baixa prevalência na população em geral.", gabarito: "errado", explicacao: "Errado. É altamente prevalente (~15,5% ao longo da vida no Brasil)." },
  { modulo: "3", tipo: "multipla", enunciado: "O transtorno do humor caracterizado por oscilação entre euforia e depressão é:", alternativas: A("transtorno bipolar", "TAG", "agorafobia", "fobia social", "TOC"), gabarito: "A", explicacao: "Bipolar = alternância mania/euforia ↔ depressão." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O burnout pode surgir quando o profissional é pautado para objetivos de trabalho muito difíceis, achando não ter capacidade de cumpri-los.", gabarito: "certo", explicacao: "Correto. A apostila aponta essa origem, além do excesso de trabalho." },
  { modulo: "3", tipo: "multipla", enunciado: "São sintomas físicos associados ao burnout citados na apostila:", alternativas: A("dor de barriga, cansaço excessivo e tonturas", "febre alta e tosse", "perda de visão súbita", "fraturas ósseas", "manchas na pele"), gabarito: "A", explicacao: "Envolve nervosismo, sofrimento psicológico e sintomas físicos como esses." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A ansiedade não patológica tem sua raiz no medo e desempenha função adaptativa.", gabarito: "certo", explicacao: "Correto. É reação normal a ameaça/estresse; torna-se transtorno quando excessiva." },
  { modulo: "3", tipo: "multipla", enunciado: "O estresse que persiste por longo tempo e prejudica a saúde física é o estresse:", alternativas: A("crônico", "agudo pontual", "fisiológico normal", "positivo", "momentâneo"), gabarito: "A", explicacao: "O estresse crônico sobrecarrega o enfrentamento e adoece." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A agorafobia e a fobia social são exemplos de transtornos de ansiedade.", gabarito: "certo", explicacao: "Correto. Constam entre os tipos listados." },
  { modulo: "3", tipo: "multipla", enunciado: "Doenças físicas frequentemente associadas ao estresse crônico incluem:", alternativas: A("doenças cardíacas e hipertensão", "miopia e astigmatismo", "cárie dentária", "fraturas", "alergias sazonais"), gabarito: "A", explicacao: "O estresse crônico relaciona-se a doenças cardíacas e hipertensão." },
  // M4
  { modulo: "4", tipo: "certo_errado", enunciado: "O medo de ser afastado ou de 'perder a farda' contribui para que o policial esconda o sofrimento mental.", gabarito: "certo", explicacao: "Correto. É efeito do estigma sobre a busca de ajuda." },
  { modulo: "4", tipo: "multipla", enunciado: "Para reduzir o estigma em saúde mental na corporação, recomenda-se:", alternativas: A("normalizar a busca por ajuda e garantir sigilo", "punir quem adoece", "expor publicamente os casos", "proibir o tema", "ignorar os sinais"), gabarito: "A", explicacao: "Normalizar e proteger (sigilo) incentiva a procura por apoio." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Reconhecer a necessidade de ajuda e procurá-la é uma atitude de autocuidado.", gabarito: "certo", explicacao: "Correto. Buscar ajuda é sinal de força, não de fraqueza." },
  { modulo: "4", tipo: "multipla", enunciado: "O estigma em saúde mental atua como:", alternativas: A("barreira que retarda ou impede a busca por ajuda", "incentivo ao tratamento", "fator de proteção", "garantia de cura", "elemento neutro"), gabarito: "A", explicacao: "É a principal barreira à procura de apoio." },
  // M5
  { modulo: "5", tipo: "certo_errado", enunciado: "A revitimização é outro nome para a vitimização secundária.", gabarito: "certo", explicacao: "Correto. Decorre da resposta inadequada das instituições/sistema." },
  { modulo: "5", tipo: "multipla", enunciado: "O sofrimento do policial agravado pelo descaso e pela burocracia institucional é exemplo de vitimização:", alternativas: A("secundária", "primária", "terciária", "coletiva", "nenhuma"), gabarito: "A", explicacao: "Secundária = resposta inadequada das instituições." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A vitimização pode ser física ou psicológica.", gabarito: "certo", explicacao: "Correto. Decorre da atividade policial em ambas as dimensões." },
  { modulo: "5", tipo: "multipla", enunciado: "Os efeitos prolongados da vitimização que alcançam a família e os colegas do policial caracterizam a vitimização:", alternativas: A("terciária", "primária", "secundária", "direta", "imediata"), gabarito: "A", explicacao: "Terciária = efeitos prolongados sobre o policial e seu entorno." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A vitimização primária decorre do dano direto causado pelo evento criminoso ou violento.", gabarito: "certo", explicacao: "Correto. É o dano imediato do fato." },
  // M6
  { modulo: "6", tipo: "certo_errado", enunciado: "A atuação em saúde mental na PMPE deve ser preventiva, e não apenas curativa.", gabarito: "certo", explicacao: "Correto. Inclui promoção, prevenção e encaminhamento." },
  { modulo: "6", tipo: "multipla", enunciado: "Diante de sinais de sofrimento em um subordinado, o oficial deve:", alternativas: A("acolher, orientar e encaminhar aos serviços de apoio", "diagnosticar o transtorno", "prescrever medicação", "afastar punitivamente", "ignorar"), gabarito: "A", explicacao: "O papel é identificar e encaminhar, não tratar." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O Projeto Escuta SUSP é um recurso ligado ao Ministério da Justiça e Segurança Pública voltado aos profissionais de segurança.", gabarito: "certo", explicacao: "Correto. Canal de escuta/apoio psicológico." },
  { modulo: "6", tipo: "multipla", enunciado: "Rodas de conversa, programas de QVT e capacitação de líderes são ações de natureza:", alternativas: A("preventiva e de promoção da saúde mental", "exclusivamente curativa", "punitiva", "burocrática sem efeito", "meramente protocolar"), gabarito: "A", explicacao: "Atuam na prevenção e promoção." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O Núcleo de Saúde Mental da PMPE oferece acolhimento e atendimento psicológico aos militares.", gabarito: "certo", explicacao: "Correto. É um dos recursos internos de apoio." },
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
  console.log(`SMQV reforco: ${c} criadas/${u} atualizadas. Total ${all.length} (~${(all.length/mods.size).toFixed(1)}/mod).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
