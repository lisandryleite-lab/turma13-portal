import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "PA"
type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))
const QS: Q[] = [
  // M1
  { modulo: "1", tipo: "multipla", enunciado: "A Psicologia Aplicada à atividade policial tem por foco o estudo do comportamento humano em situações de:", alternativas: A("risco, conflito e pressão", "lazer e ócio", "rotina burocrática apenas", "ensino infantil", "competição esportiva"), gabarito: "A", explicacao: "Foco em cenários de risco, conflito e pressão." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A resiliência é a capacidade de enfrentar adversidades e se recuperar delas, sendo desejável no perfil do policial.", gabarito: "certo", explicacao: "Correto. Integra o perfil psicológico desejável." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Competências socioemocionais não têm relação com a comunicação eficaz do policial.", gabarito: "errado", explicacao: "Errado. Sustentam a regulação emocional e a comunicação eficaz." },
  { modulo: "1", tipo: "multipla", enunciado: "A identidade militar é construída por meio do processo de:", alternativas: A("socialização", "individualização isolada", "despersonalização", "regressão", "negação"), gabarito: "A", explicacao: "A socialização internaliza valores e identidade da corporação." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O autocontrole emocional é uma característica relevante para o policial atuar sob pressão.", gabarito: "certo", explicacao: "Correto. Compõe o perfil psicológico desejável." },
  { modulo: "1", tipo: "multipla", enunciado: "A Psicologia, como ciência, estuda:", alternativas: A("o comportamento e os processos mentais", "apenas doenças físicas", "somente o sistema nervoso", "exclusivamente a hereditariedade", "apenas grupos sociais"), gabarito: "A", explicacao: "Comportamento + processos mentais é o objeto da Psicologia." },
  // M2
  { modulo: "2", tipo: "certo_errado", enunciado: "A memória e a atenção são exemplos de processos psicológicos básicos.", gabarito: "certo", explicacao: "Correto. Ao lado de percepção, motivação, emoção, etc." },
  { modulo: "2", tipo: "multipla", enunciado: "A pessoa que se anula, não defende seus direitos e evita o confronto adota postura:", alternativas: A("passiva", "assertiva", "agressiva", "empática", "resiliente"), gabarito: "A", explicacao: "Passividade = anulação dos próprios direitos." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A comunicação eficaz exige clareza, escuta ativa, empatia e feedback.", gabarito: "certo", explicacao: "Correto. Reduz ruídos e conflitos." },
  { modulo: "2", tipo: "multipla", enunciado: "Em uma organização militar, a comunicação saudável serve para:", alternativas: A("evitar tensões e abusos dentro da hierarquia", "eliminar a hierarquia", "substituir a disciplina", "impedir o trabalho em equipe", "aumentar conflitos"), gabarito: "A", explicacao: "A hierarquia exige comunicação saudável para funcionar bem." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A assertividade é incompatível com o respeito ao interlocutor.", gabarito: "errado", explicacao: "Errado. Assertividade combina firmeza COM respeito." },
  { modulo: "2", tipo: "multipla", enunciado: "O trabalho em equipe pressupõe:", alternativas: A("objetivos comuns, cooperação e confiança", "competição interna destrutiva", "isolamento dos membros", "ausência de comunicação", "hierarquia sem coordenação"), gabarito: "A", explicacao: "Equipe se baseia em objetivos comuns e cooperação." },
  // M3
  { modulo: "3", tipo: "certo_errado", enunciado: "O estresse agudo corresponde à resposta imediata de 'luta ou fuga' diante de uma ameaça.", gabarito: "certo", explicacao: "Correto. É a reação rápida; o crônico é prolongado." },
  { modulo: "3", tipo: "multipla", enunciado: "A despersonalização, no burnout, refere-se a:", alternativas: A("atitudes negativas/cínicas com colegas e público", "exaustão física apenas", "aumento da realização profissional", "melhora do desempenho", "euforia"), gabarito: "A", explicacao: "É uma das três dimensões do burnout (Maslach)." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O burnout é específico do contexto de trabalho, diferentemente do estresse comum.", gabarito: "certo", explicacao: "Correto. Liga-se à relação com colegas/usuários/organização." },
  { modulo: "3", tipo: "multipla", enunciado: "São estressores ocupacionais típicos da atividade policial:", alternativas: A("risco de vida, escala/plantão e exposição à violência", "férias prolongadas", "ausência de cobrança", "trabalho remoto tranquilo", "rotina sem imprevistos"), gabarito: "A", explicacao: "São fatores que elevam o estresse no policial." },
  { modulo: "3", tipo: "certo_errado", enunciado: "As três dimensões do burnout são exaustão emocional, despersonalização e redução da realização profissional.", gabarito: "certo", explicacao: "Correto (Maslach)." },
  { modulo: "3", tipo: "multipla", enunciado: "Os '12 degraus da exaustão' representam:", alternativas: A("a progressão gradual do burnout até o colapso", "as etapas da CNV", "os níveis de Maslow", "as fases do luto", "os estilos de liderança"), gabarito: "A", explicacao: "Modelo progressivo da instalação do burnout." },
  // M4
  { modulo: "4", tipo: "certo_errado", enunciado: "Para Le Bon, na multidão o indivíduo mantém plena identidade e racionalidade individual.", gabarito: "errado", explicacao: "Errado. Para Le Bon o indivíduo perde a identidade e fica sugestionável (mente de multidão)." },
  { modulo: "4", tipo: "multipla", enunciado: "A teoria que enfatiza a 'definição da situação' e a interação social no comportamento de massa é de:", alternativas: A("Herbert Blumer", "Le Bon", "Tajfel e Turner", "Goleman", "Maslach"), gabarito: "A", explicacao: "Blumer: interacionismo (definição da situação)." },
  { modulo: "4", tipo: "certo_errado", enunciado: "As redes sociais amplificam o contágio emocional e a mobilização.", gabarito: "certo", explicacao: "Correto. Favorecem a viralização rápida de emoções." },
  { modulo: "4", tipo: "multipla", enunciado: "O sentimento de 'nós contra eles', intensificado pela identidade coletiva, é explicado por:", alternativas: A("Tajfel e Turner (Identidade Social)", "Le Bon", "Blumer", "Rosenberg", "Lipp"), gabarito: "A", explicacao: "Teoria da Identidade Social de Tajfel e Turner." },
  { modulo: "4", tipo: "certo_errado", enunciado: "No pânico coletivo, as pessoas tendem a priorizar a própria segurança, com comportamentos irracionais.", gabarito: "certo", explicacao: "Correto. É um tipo de comportamento coletivo." },
  { modulo: "4", tipo: "multipla", enunciado: "A 'mente de multidão', com perda da identidade individual, é conceito de:", alternativas: A("Gustave Le Bon", "Herbert Blumer", "Henri Tajfel", "Daniel Goleman", "Marilda Lipp"), gabarito: "A", explicacao: "Le Bon — teoria da mente de multidão." },
  // M5
  { modulo: "5", tipo: "multipla", enunciado: "O primeiro componente da CNV é:", alternativas: A("observação (sem julgamento)", "pedido", "necessidade", "sentimento", "exigência"), gabarito: "A", explicacao: "Ordem OSNP: observação, sentimento, necessidade, pedido." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Na CNV, 'estou triste com o que aconteceu' é uma expressão adequada de sentimento.", gabarito: "certo", explicacao: "Correto. Nomeia a emoção, em vez de emitir juízo de valor." },
  { modulo: "5", tipo: "multipla", enunciado: "Na CNV, reconhecer o que está por trás do sentimento corresponde ao componente:", alternativas: A("necessidade", "observação", "pedido", "exigência", "punição"), gabarito: "A", explicacao: "A necessidade está por trás do sentimento." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Na CNV, o outro é considerado a causa direta dos nossos sentimentos.", gabarito: "errado", explicacao: "Errado. O outro é estímulo, não causa; a responsabilidade pelos sentimentos é própria." },
  { modulo: "5", tipo: "multipla", enunciado: "O estágio da responsabilidade emocional em que a pessoa se sente responsável pelos sentimentos dos outros é:", alternativas: A("escravidão emocional", "estágio ranzinza", "libertação emocional", "autorrealização", "negação"), gabarito: "A", explicacao: "Escravidão emocional é o primeiro estágio." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Na CNV, o pedido deve ser formulado de forma vaga para dar liberdade ao outro.", gabarito: "errado", explicacao: "Errado. O pedido deve ser claro, positivo e de ações concretas." },
  // M6
  { modulo: "6", tipo: "multipla", enunciado: "O PSP destina-se a:", alternativas: A("apoio inicial e pontual a quem está em sofrimento/crise", "tratamento psiquiátrico prolongado", "diagnóstico de transtornos", "prescrição de medicamentos", "internação compulsória"), gabarito: "A", explicacao: "PSP é apoio inicial, não psicoterapia nem tratamento." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Validar as emoções da pessoa é uma postura adequada nos Primeiros Socorros Psicológicos.", gabarito: "certo", explicacao: "Correto. Junto com escuta ativa e presença calma." },
  { modulo: "6", tipo: "multipla", enunciado: "São frases a EVITAR no PSP:", alternativas: A("'Calma, não foi nada' e 'Podia ter sido pior'", "'Estou aqui com você'", "'Você está seguro agora'", "'Faz sentido se sentir assim'", "'Vamos cuidar de você'"), gabarito: "A", explicacao: "Frases que minimizam/invalidam o sofrimento devem ser evitadas." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Casos de sofrimento persistente devem ser encaminhados a profissional especializado.", gabarito: "certo", explicacao: "Correto. O PSP é pontual; o encaminhamento é essencial." },
  { modulo: "6", tipo: "multipla", enunciado: "O PSP pode ser oferecido a:", alternativas: A("vítimas, familiares e colegas em sofrimento", "apenas a presos", "somente a oficiais", "exclusivamente a civis", "apenas a crianças"), gabarito: "A", explicacao: "Alcança todos os envolvidos numa crise." },
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
  console.log(`PA reforco: ${c} criadas/${u} atualizadas. Total ${all.length} (~${(all.length/mods.size).toFixed(1)}/mod).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
