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
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const QS: Q[] = [
  // M1
  { modulo: "1", tipo: "certo_errado", enunciado: "Centralização refere-se à concentração do poder de decisão no topo da estrutura.", gabarito: "certo", explicacao: "Correto. Descentralização é a delegação desse poder a níveis inferiores." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Um processo pode ser eficiente (bom uso de recursos) sem ser eficaz (não atingir o objetivo).", gabarito: "certo", explicacao: "Correto. Eficiência e eficácia são dimensões independentes." },
  { modulo: "1", tipo: "multipla", enunciado: "A função administrativa de definir antecipadamente objetivos e meios é:", alternativas: A("planejar", "organizar", "dirigir", "controlar", "coordenar"), gabarito: "A", explicacao: "Planejar é a primeira função (define objetivos e como alcançá-los)." },
  { modulo: "1", tipo: "multipla", enunciado: "Medir resultados e corrigir desvios em relação ao planejado é a função de:", alternativas: A("controlar", "planejar", "organizar", "dirigir", "prever"), gabarito: "A", explicacao: "Controlar = acompanhar e corrigir em relação às metas." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Descentralizar decisões tende a torná-las mais rápidas e a aproximar a decisão de quem executa.", gabarito: "certo", explicacao: "Correto. É uma vantagem apontada da descentralização." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Efetividade considera os impactos e a manutenção dos resultados ao longo do tempo.", gabarito: "certo", explicacao: "Correto. Vai além de eficiência e eficácia isoladas." },
  { modulo: "1", tipo: "multipla", enunciado: "A função administrativa que envolve liderar, motivar e comunicar com as pessoas é:", alternativas: A("dirigir", "planejar", "organizar", "controlar", "prever"), gabarito: "A", explicacao: "Dirigir (direção) refere-se à condução das pessoas." },

  // M2
  { modulo: "2", tipo: "certo_errado", enunciado: "A administração só pode ser entendida como ciência, jamais como técnica ou arte.", gabarito: "errado", explicacao: "Errado. É ciência, técnica E arte, simultaneamente." },
  { modulo: "2", tipo: "multipla", enunciado: "Na visão do 'homo economicus', o trabalhador é motivado principalmente por:", alternativas: A("recompensas econômicas (salário)", "necessidades sociais", "autorrealização", "reconhecimento do grupo", "segurança psicológica"), gabarito: "A", explicacao: "O homo economicus age por racionalidade econômica (salário)." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Como técnica, a administração refere-se à aplicação prática dos conhecimentos administrativos.", gabarito: "certo", explicacao: "Correto. Técnica = aplicação; ciência = teoria; arte = habilidade." },
  { modulo: "2", tipo: "multipla", enunciado: "O estudo da administração como ciência ganhou impulso decisivo com:", alternativas: A("a Revolução Industrial", "o feudalismo", "a Antiguidade grega", "a Revolução Francesa", "a Guerra Fria"), gabarito: "A", explicacao: "A Revolução Industrial trouxe a necessidade de racionalizar a produção." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Toda decisão administrativa envolve, em alguma medida, a escolha sobre o uso de recursos.", gabarito: "certo", explicacao: "Correto. Administrar é decidir sobre recursos para atingir objetivos." },

  // M3
  { modulo: "3", tipo: "certo_errado", enunciado: "A Organização Racional do Trabalho (ORT) é um conceito central da Administração Científica.", gabarito: "certo", explicacao: "Correto. Busca o método ótimo de execução das tarefas." },
  { modulo: "3", tipo: "multipla", enunciado: "A crítica de que a Administração Científica vê o trabalhador como 'peça da engrenagem' refere-se à sua abordagem:", alternativas: A("mecanicista", "humanística", "sistêmica", "contingencial", "comportamental"), gabarito: "A", explicacao: "É a abordagem microscópica e mecanicista (homo economicus)." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Taylor propunha a seleção científica e o treinamento do trabalhador para a tarefa.", gabarito: "certo", explicacao: "Correto. Seleção, preparo e padronização são princípios tayloristas." },
  { modulo: "3", tipo: "multipla", enunciado: "O foco da Administração Científica, em uma palavra, é:", alternativas: A("a tarefa", "a estrutura", "o ambiente", "a cultura", "o cliente"), gabarito: "A", explicacao: "Taylor focava a tarefa e a eficiência do operário." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A Administração Científica surgiu já voltada para a motivação social e os grupos informais.", gabarito: "errado", explicacao: "Errado. Isso é a Teoria das Relações Humanas; Taylor focava tarefa/produtividade." },
  { modulo: "3", tipo: "multipla", enunciado: "A Administração Científica adota a visão de homem como:", alternativas: A("homo economicus", "homo social", "homo administrativo", "homo complexo", "homo digitalis"), gabarito: "A", explicacao: "Homo economicus — movido pelo ganho material." },

  // M4
  { modulo: "4", tipo: "certo_errado", enunciado: "A Teoria Clássica adota uma abordagem anatômica e estrutural da organização.", gabarito: "certo", explicacao: "Correto. Fayol foca a estrutura e a anatomia da organização." },
  { modulo: "4", tipo: "multipla", enunciado: "O princípio de Fayol segundo o qual cada subordinado deve receber ordens de apenas um superior é o da:", alternativas: A("unidade de comando", "divisão do trabalho", "centralização", "equidade", "iniciativa"), gabarito: "A", explicacao: "Unidade de comando: um único chefe por subordinado." },
  { modulo: "4", tipo: "multipla", enunciado: "O princípio que estabelece um só chefe e um só plano para um conjunto de atividades com o mesmo objetivo é:", alternativas: A("unidade de direção", "unidade de comando", "disciplina", "ordem", "hierarquia"), gabarito: "A", explicacao: "Unidade de direção: um chefe e um plano por grupo de atividades de mesmo fim." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Para Fayol, a função administrativa está presente em todos os níveis e coordena as demais funções da empresa.", gabarito: "certo", explicacao: "Correto. A função administrativa integra as técnicas, comerciais, financeiras, de segurança e contábeis." },
  { modulo: "4", tipo: "multipla", enunciado: "A sequência POCCC de Fayol significa:", alternativas: A("Prever, Organizar, Comandar, Coordenar e Controlar", "Planejar, Operar, Controlar, Corrigir e Concluir", "Prever, Ordenar, Cobrar, Coordenar e Concluir", "Planejar, Organizar, Dirigir e Controlar", "Produzir, Organizar, Comandar e Controlar"), gabarito: "A", explicacao: "POCCC = Prever, Organizar, Comandar, Coordenar, Controlar." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Fayol é considerado o pai da Administração Científica e do estudo de tempos e movimentos.", gabarito: "errado", explicacao: "Errado. Isso é Taylor; Fayol é o pai da Teoria Clássica (estrutura)." },

  // M5
  { modulo: "5", tipo: "certo_errado", enunciado: "A burocracia, para Weber, é a forma de organização baseada na dominação racional-legal.", gabarito: "certo", explicacao: "Correto. Distinta das dominações tradicional e carismática." },
  { modulo: "5", tipo: "multipla", enunciado: "São características da burocracia weberiana, EXCETO:", alternativas: A("informalidade e pessoalidade nas relações", "hierarquia de autoridade", "normas e regulamentos escritos", "impessoalidade", "meritocracia/competência técnica"), gabarito: "A", explicacao: "A burocracia é formal e impessoal — informalidade/pessoalidade não a caracterizam." },
  { modulo: "5", tipo: "certo_errado", enunciado: "O excesso de apego às normas, a ponto de o meio (regra) virar fim, é uma disfunção da burocracia.", gabarito: "certo", explicacao: "Correto. É o 'apego aos regulamentos' (Merton)." },
  { modulo: "5", tipo: "multipla", enunciado: "A Teoria Estruturalista distingue-se por:", alternativas: A("integrar a organização formal e informal e considerar o ambiente", "focar apenas a tarefa do operário", "negar a existência de hierarquia", "ignorar o ambiente externo", "estudar apenas a motivação"), gabarito: "A", explicacao: "O estruturalismo é uma síntese que considera formal+informal+ambiente." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A previsibilidade do comportamento é um dos objetivos da organização burocrática.", gabarito: "certo", explicacao: "Correto. As normas buscam previsibilidade e eficiência." },

  // M6
  { modulo: "6", tipo: "certo_errado", enunciado: "A Teoria das Relações Humanas surgiu como reação/oposição à ênfase mecanicista das teorias clássica e científica.", gabarito: "certo", explicacao: "Correto. Passou a focar o ser humano e os grupos." },
  { modulo: "6", tipo: "multipla", enunciado: "Entre as conclusões de Hawthorne está que:", alternativas: A("o nível de produção é influenciado por normas sociais e grupos informais", "a iluminação é o único fator de produtividade", "o salário é o único motivador", "os grupos informais são irrelevantes", "a supervisão rígida aumenta sempre a produção"), gabarito: "A", explicacao: "Hawthorne revelou o peso dos grupos informais e da integração social." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A Escola das Relações Humanas valoriza a motivação, a comunicação e a liderança.", gabarito: "certo", explicacao: "Correto. Temas humanos passam ao centro." },
  { modulo: "6", tipo: "multipla", enunciado: "A fábrica onde se realizou a famosa experiência conduzida por Mayo pertencia à:", alternativas: A("Western Electric Company", "Ford Motor Company", "General Motors", "Bethlehem Steel", "Midvale Steel"), gabarito: "A", explicacao: "Hawthorne era uma fábrica da Western Electric, em Chicago (1927)." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Para a Escola das Relações Humanas, o homem é um ser puramente econômico, indiferente ao grupo.", gabarito: "errado", explicacao: "Errado. Para essa escola o homem é social, influenciado pelo grupo." },

  // M7
  { modulo: "7", tipo: "certo_errado", enunciado: "A Teoria Neoclássica é eclética e pragmática, valorizando a prática e os resultados.", gabarito: "certo", explicacao: "Correto. Atualiza a clássica com foco em resultados." },
  { modulo: "7", tipo: "multipla", enunciado: "Na APO, os objetivos são, idealmente:", alternativas: A("definidos conjuntamente entre gestor e subordinado", "impostos unilateralmente pela cúpula", "irrelevantes para a avaliação", "definidos apenas pelo subordinado", "fixados pelo sindicato"), gabarito: "A", explicacao: "A APO pressupõe objetivos negociados/definidos em conjunto." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A Teoria Neoclássica enfatiza os objetivos e os resultados (administração por objetivos).", gabarito: "certo", explicacao: "Correto. Daí a APO de Drucker." },
  { modulo: "7", tipo: "multipla", enunciado: "O principal expoente da Teoria Neoclássica e da APO é:", alternativas: A("Peter Drucker", "Elton Mayo", "Max Weber", "Frederick Taylor", "Abraham Maslow"), gabarito: "A", explicacao: "Drucker é o grande nome da Neoclássica/APO." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Os neoclássicos sintetizaram o POCCC de Fayol no processo administrativo PODC.", gabarito: "certo", explicacao: "Correto. PODC: planejar, organizar, dirigir e controlar." },

  // M8
  { modulo: "8", tipo: "certo_errado", enunciado: "Na pirâmide de Maslow, as necessidades fisiológicas estão na base e a autorrealização no topo.", gabarito: "certo", explicacao: "Correto. Ordem: fisiológicas, segurança, sociais, estima, autorrealização." },
  { modulo: "8", tipo: "multipla", enunciado: "Necessidades de estima, em Maslow, referem-se a:", alternativas: A("reconhecimento, status e autoestima", "fome e sede", "segurança física", "pertencimento a grupos", "respiração"), gabarito: "A", explicacao: "Estima: reconhecimento, prestígio, autoestima." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Para Herzberg, melhorar somente fatores higiênicos é suficiente para motivar o trabalhador.", gabarito: "errado", explicacao: "Errado. Higiênicos só evitam insatisfação; a motivação vem dos fatores motivacionais." },
  { modulo: "8", tipo: "multipla", enunciado: "O administrador adepto da Teoria X de McGregor tende a adotar:", alternativas: A("controle rígido e supervisão cerrada", "delegação ampla e autonomia", "gestão participativa", "ausência de regras", "foco na autorrealização"), gabarito: "A", explicacao: "A Teoria X (pessimista) leva a controle e coerção." },
  { modulo: "8", tipo: "multipla", enunciado: "São necessidades de nível mais baixo (primárias) em Maslow:", alternativas: A("fisiológicas e de segurança", "estima e autorrealização", "sociais e de estima", "autorrealização apenas", "de reconhecimento profissional"), gabarito: "A", explicacao: "Fisiológicas e de segurança são primárias; as demais, secundárias." },
  { modulo: "8", tipo: "certo_errado", enunciado: "A abordagem comportamental aprofunda o estudo da motivação, da liderança e do processo decisório.", gabarito: "certo", explicacao: "Correto. Base na psicologia organizacional." },

  // M9
  { modulo: "9", tipo: "certo_errado", enunciado: "Um sistema aberto troca matéria, energia e informação com o ambiente.", gabarito: "certo", explicacao: "Correto. É a visão da Teoria Sistêmica." },
  { modulo: "9", tipo: "multipla", enunciado: "A retroalimentação (feedback), na abordagem sistêmica, serve para:", alternativas: A("ajustar o sistema a partir das saídas, controlando o processo", "eliminar o ambiente externo", "substituir o planejamento", "tornar o sistema fechado", "ignorar os resultados"), gabarito: "A", explicacao: "O feedback realimenta o sistema para correção/ajuste." },
  { modulo: "9", tipo: "certo_errado", enunciado: "A Teoria Contingencial sustenta que a melhor estrutura depende de variáveis como ambiente e tecnologia.", gabarito: "certo", explicacao: "Correto. Não há 'the best way' universal." },
  { modulo: "9", tipo: "multipla", enunciado: "A principal variável que, segundo a abordagem contingencial, condiciona a organização é:", alternativas: A("o ambiente (e a tecnologia)", "apenas o salário", "somente a hierarquia", "exclusivamente a tarefa", "apenas a cultura nacional"), gabarito: "A", explicacao: "Ambiente e tecnologia são as variáveis-chave da contingência." },
  { modulo: "9", tipo: "certo_errado", enunciado: "Na visão sistêmica, deve-se analisar a organização de forma fragmentada, ignorando o todo.", gabarito: "errado", explicacao: "Errado. A visão sistêmica é holística — enfatiza o todo e as interdependências." },

  // M10
  { modulo: "10", tipo: "certo_errado", enunciado: "A gestão estratégica trabalha com missão, visão e valores, alinhando a organização ao ambiente de longo prazo.", gabarito: "certo", explicacao: "Correto. Foco no longo prazo e na adaptação ao ambiente." },
  { modulo: "10", tipo: "multipla", enunciado: "A gestão com foco em resultados aproxima-se do conceito de:", alternativas: A("Gestão por Resultados (metas e indicadores)", "burocracia rígida", "taylorismo puro", "homo economicus", "gestão de tarefas manuais"), gabarito: "A", explicacao: "Foco em metas e indicadores de resultado (GpR)." },
  { modulo: "10", tipo: "certo_errado", enunciado: "As tendências da administração apontam para inovação, conhecimento, tecnologia e valorização das pessoas.", gabarito: "certo", explicacao: "Correto. São as tendências evolutivas da gestão." },
  { modulo: "10", tipo: "multipla", enunciado: "A gestão democrática/participativa caracteriza-se por:", alternativas: A("envolver os colaboradores nas decisões", "centralizar tudo no dirigente", "eliminar metas", "ignorar a opinião da equipe", "focar apenas a punição"), gabarito: "A", explicacao: "A participação dos colaboradores é a marca da gestão democrática." },
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
  console.log(`TGA complemento: ${c} criadas/${u} atualizadas. Total ${all.length} (~${(all.length/mods.size).toFixed(1)}/mod).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
