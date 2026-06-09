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
  { modulo: "1", tipo: "multipla", enunciado: "Organizar, como função administrativa, significa:", alternativas: A("estruturar e alocar recursos para executar o que foi planejado", "definir os objetivos", "liderar pessoas", "medir resultados", "prever cenários"), gabarito: "A", explicacao: "Organizar = dispor recursos/estrutura; planejar define objetivos; controlar mede." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Concentração é o movimento inverso da desconcentração.", gabarito: "certo", explicacao: "Correto. Concentração reúne competências; desconcentração as distribui (na mesma PJ)." },
  { modulo: "1", tipo: "multipla", enunciado: "Atingir os objetivos pretendidos refere-se à:", alternativas: A("eficácia", "eficiência", "economicidade", "produtividade bruta", "padronização"), gabarito: "A", explicacao: "Eficácia = alcance dos objetivos (fins)." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Descentralizar tende a aproximar a decisão de quem executa e agilizá-la.", gabarito: "certo", explicacao: "Correto. É vantagem da descentralização." },
  // M2
  { modulo: "2", tipo: "multipla", enunciado: "A dimensão da administração como 'ciência' refere-se a:", alternativas: A("seu corpo de conhecimentos e teorias", "à habilidade pessoal do gestor", "à aplicação prática isolada", "ao improviso", "à intuição apenas"), gabarito: "A", explicacao: "Ciência = teorias; técnica = aplicação; arte = habilidade." },
  { modulo: "2", tipo: "certo_errado", enunciado: "O 'homo economicus' é a concepção de homem das escolas clássica e científica.", gabarito: "certo", explicacao: "Correto. Movido pela racionalidade econômica (salário)." },
  { modulo: "2", tipo: "multipla", enunciado: "A administração como 'arte' está ligada a:", alternativas: A("habilidade e sensibilidade do gestor", "fórmulas matemáticas rígidas", "leis imutáveis", "ausência de prática", "negação da teoria"), gabarito: "A", explicacao: "Arte = saber aplicar com sensibilidade." },
  // M3
  { modulo: "3", tipo: "multipla", enunciado: "O estudo de tempos e movimentos é uma contribuição típica da:", alternativas: A("Administração Científica (Taylor)", "Teoria Clássica (Fayol)", "Burocracia (Weber)", "Relações Humanas (Mayo)", "Teoria Sistêmica"), gabarito: "A", explicacao: "É a base da ORT taylorista." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A Administração Científica enfatiza a tarefa e adota visão de baixo para cima (do operário).", gabarito: "certo", explicacao: "Correto. Em oposição à visão de cima para baixo de Fayol." },
  { modulo: "3", tipo: "multipla", enunciado: "A ORT (Organização Racional do Trabalho) busca:", alternativas: A("o método ótimo de execução das tarefas e a máxima eficiência", "a motivação pelos grupos informais", "a estrutura da cúpula", "a relação com o ambiente", "a participação democrática"), gabarito: "A", explicacao: "Racionaliza o trabalho para maximizar a produtividade." },
  // M4
  { modulo: "4", tipo: "multipla", enunciado: "A ênfase da Teoria Clássica de Fayol é:", alternativas: A("a estrutura organizacional", "a tarefa do operário", "as emoções dos grupos", "o ambiente externo", "a tecnologia"), gabarito: "A", explicacao: "Fayol foca a estrutura (anatomia da organização)." },
  { modulo: "4", tipo: "certo_errado", enunciado: "As funções básicas da empresa, segundo Fayol, incluem as técnicas, comerciais, financeiras, de segurança, contábeis e administrativas.", gabarito: "certo", explicacao: "Correto. A administrativa coordena as demais." },
  { modulo: "4", tipo: "multipla", enunciado: "O princípio fayoliano da divisão do trabalho visa:", alternativas: A("a especialização e o aumento da eficiência", "a rotatividade total de funções", "a ausência de hierarquia", "a centralização absoluta", "o improviso"), gabarito: "A", explicacao: "A especialização eleva a eficiência." },
  // M5
  { modulo: "5", tipo: "multipla", enunciado: "A dominação racional-legal é a base da:", alternativas: A("burocracia weberiana", "administração científica", "teoria das relações humanas", "teoria contingencial", "APO"), gabarito: "A", explicacao: "Weber funda a burocracia na autoridade racional-legal." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A impessoalidade é uma característica da burocracia de Weber.", gabarito: "certo", explicacao: "Correto. Ao lado de normas, hierarquia e meritocracia." },
  { modulo: "5", tipo: "multipla", enunciado: "Quando a regra (meio) se torna um fim em si mesma, ocorre uma:", alternativas: A("disfunção da burocracia", "vantagem da burocracia", "função sistêmica", "contingência", "motivação intrínseca"), gabarito: "A", explicacao: "É o apego excessivo às normas (disfunção de Merton)." },
  // M6
  { modulo: "6", tipo: "multipla", enunciado: "A concepção de 'homo social' é própria da:", alternativas: A("Teoria das Relações Humanas", "Administração Científica", "Teoria Clássica", "Burocracia", "Teoria Contingencial"), gabarito: "A", explicacao: "Mayo: o homem é motivado por fatores sociais e pelo grupo." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A Experiência de Hawthorne revelou a importância dos grupos informais na produtividade.", gabarito: "certo", explicacao: "Correto. A integração social pesa mais que fatores físicos." },
  { modulo: "6", tipo: "multipla", enunciado: "A Escola das Relações Humanas trouxe ao centro temas como:", alternativas: A("motivação, liderança e comunicação", "tempos e movimentos", "estrutura e hierarquia", "normas e formalismo", "ambiente e tecnologia"), gabarito: "A", explicacao: "Temas humanos passam a ser centrais." },
  // M7
  { modulo: "7", tipo: "multipla", enunciado: "A APO (Administração por Objetivos) é associada principalmente a:", alternativas: A("Peter Drucker", "Elton Mayo", "Max Weber", "Frederick Taylor", "Henri Fayol"), gabarito: "A", explicacao: "Drucker sistematiza a APO na Teoria Neoclássica." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A Teoria Neoclássica é uma derivação que retoma e atualiza a Teoria Clássica.", gabarito: "certo", explicacao: "Correto. Reforça as boas práticas clássicas com foco em resultados." },
  { modulo: "7", tipo: "multipla", enunciado: "O processo administrativo PODC significa:", alternativas: A("Planejar, Organizar, Dirigir e Controlar", "Prever, Operar, Decidir, Concluir", "Produzir, Organizar, Dividir, Cobrar", "Planejar, Ordenar, Dirigir, Coordenar", "Prever, Organizar, Comandar, Coordenar"), gabarito: "A", explicacao: "PODC é a síntese neoclássica (POCCC era de Fayol)." },
  // M8
  { modulo: "8", tipo: "multipla", enunciado: "As necessidades sociais, na pirâmide de Maslow, situam-se:", alternativas: A("acima da segurança e abaixo da estima", "no topo", "na base", "acima da autorrealização", "fora da pirâmide"), gabarito: "A", explicacao: "Ordem: fisiológicas, segurança, sociais, estima, autorrealização." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Para Herzberg, fatores motivacionais (intrínsecos) são os que geram satisfação e motivam.", gabarito: "certo", explicacao: "Correto. Higiênicos só evitam insatisfação." },
  { modulo: "8", tipo: "multipla", enunciado: "Um gestor que pressupõe que o trabalhador é responsável e busca realização adota a:", alternativas: A("Teoria Y (McGregor)", "Teoria X (McGregor)", "Burocracia", "ORT", "APO"), gabarito: "A", explicacao: "Teoria Y = visão otimista do ser humano." },
  { modulo: "8", tipo: "certo_errado", enunciado: "A abordagem comportamental fundamenta-se na psicologia organizacional.", gabarito: "certo", explicacao: "Correto. Estuda motivação, liderança e decisão." },
  // M9
  { modulo: "9", tipo: "multipla", enunciado: "A visão holística (do todo), com a organização como sistema aberto, é própria da Teoria:", alternativas: A("Sistêmica", "Científica", "Clássica", "Burocrática", "Neoclássica"), gabarito: "A", explicacao: "A Teoria Sistêmica adota a visão do todo." },
  { modulo: "9", tipo: "certo_errado", enunciado: "Para a abordagem contingencial, existe uma única melhor forma de administrar, válida sempre.", gabarito: "errado", explicacao: "Errado. Não há 'the best way' — tudo depende do contexto (ambiente, tecnologia)." },
  { modulo: "9", tipo: "multipla", enunciado: "As variáveis-chave da Teoria Contingencial são:", alternativas: A("ambiente e tecnologia", "salário e jornada", "hierarquia e norma", "tarefa e tempo", "cultura e clima apenas"), gabarito: "A", explicacao: "A estrutura/gestão dependem do ambiente e da tecnologia." },
  // M10
  { modulo: "10", tipo: "multipla", enunciado: "A gestão por processos foca:", alternativas: A("o mapeamento e a melhoria dos fluxos de trabalho", "apenas metas financeiras", "a punição de erros", "a centralização total", "a redução de pessoal"), gabarito: "A", explicacao: "Foco nos processos/fluxos." },
  { modulo: "10", tipo: "certo_errado", enunciado: "A gestão estratégica trabalha missão, visão e valores, com horizonte de longo prazo.", gabarito: "certo", explicacao: "Correto. Alinha a organização ao ambiente." },
  { modulo: "10", tipo: "multipla", enunciado: "A gestão que envolve os colaboradores nas decisões é a gestão:", alternativas: A("democrática/participativa", "autocrática", "por tarefas", "burocrática rígida", "científica"), gabarito: "A", explicacao: "A participação é a marca da gestão democrática." },
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
  console.log(`TGA reforco: ${c} criadas/${u} atualizadas. Total ${all.length} (~${(all.length/mods.size).toFixed(1)}/mod).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
