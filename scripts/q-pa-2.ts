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
  // ── M1 — Fundamentos / perfil ──
  { modulo: "1", tipo: "certo_errado", enunciado: "A Psicologia é a ciência que estuda o comportamento e os processos mentais.", gabarito: "certo", explicacao: "Correto. É o objeto central da Psicologia." },
  { modulo: "1", tipo: "certo_errado", enunciado: "No contexto policial, a Psicologia auxilia na regulação emocional, na empatia e na tomada de decisão sob pressão.", gabarito: "certo", explicacao: "Correto. São aplicações diretas na atividade policial." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A socialização militar é o processo pelo qual o indivíduo internaliza valores, normas e a identidade da corporação.", gabarito: "certo", explicacao: "Correto. Molda a conduta profissional (hierarquia e disciplina)." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Equilíbrio emocional, autocontrole e resiliência não fazem parte do perfil psicológico desejado do policial.", gabarito: "errado", explicacao: "Errado. São justamente traços centrais do perfil do policial para lidar com risco, conflito e pressão." },
  { modulo: "1", tipo: "multipla", enunciado: "O perfil psicológico desejável do policial inclui, sobretudo:", alternativas: A("equilíbrio emocional, autocontrole e resiliência", "impulsividade e agressividade", "passividade e apatia", "indiferença ao risco", "isolamento social"), gabarito: "A", explicacao: "São características para atuação em risco, conflito e pressão." },
  { modulo: "1", tipo: "multipla", enunciado: "A internalização dos valores e da identidade da corporação pelo indivíduo é chamada de:", alternativas: A("socialização (identidade militar)", "despersonalização", "burnout", "contágio emocional", "maiêutica"), gabarito: "A", explicacao: "É o processo de socialização e construção da identidade militar." },
  { modulo: "1", tipo: "multipla", enunciado: "A Psicologia Aplicada à atividade policial enfatiza, entre outros, o estudo do comportamento humano em situações de:", alternativas: A("risco, conflito e pressão", "lazer e descanso apenas", "rotina administrativa exclusivamente", "ensino infantil", "atividades esportivas recreativas"), gabarito: "A", explicacao: "O foco é o comportamento humano sob risco, conflito e pressão." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O desenvolvimento de competências socioemocionais contribui para uma comunicação mais eficaz do policial.", gabarito: "certo", explicacao: "Correto. As competências socioemocionais sustentam a regulação emocional e a comunicação." },

  // ── M2 — Comportamento / relações ──
  { modulo: "2", tipo: "certo_errado", enunciado: "Percepção, atenção, memória, motivação e emoção são exemplos de processos psicológicos básicos.", gabarito: "certo", explicacao: "Correto. São processos básicos do comportamento humano." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A passividade, na comunicação, caracteriza-se por afirmar os próprios direitos com firmeza e respeito.", gabarito: "errado", explicacao: "Errado. Isso é assertividade; a passividade é a anulação dos próprios direitos." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A assertividade permite defender direitos e opiniões sem agredir nem se submeter.", gabarito: "certo", explicacao: "Correto. É a postura equilibrada entre passividade e agressividade." },
  { modulo: "2", tipo: "multipla", enunciado: "Na comunicação interpessoal, o estilo que desrespeita o interlocutor para impor a própria vontade é:", alternativas: A("agressividade", "assertividade", "passividade", "empatia", "escuta ativa"), gabarito: "A", explicacao: "A agressividade desrespeita o outro; a assertividade combina firmeza e respeito." },
  { modulo: "2", tipo: "multipla", enunciado: "A hierarquia e a disciplina, nas organizações militares:", alternativas: A("estruturam a instituição, mas exigem comunicação saudável para evitar tensões", "dispensam qualquer comunicação", "são incompatíveis com relações interpessoais", "eliminam a necessidade de liderança", "impedem o trabalho em equipe"), gabarito: "A", explicacao: "Estruturam a instituição, exigindo comunicação saudável." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A escuta ativa é um componente da comunicação interpessoal eficaz.", gabarito: "certo", explicacao: "Correto. Junto com clareza, empatia e feedback." },
  { modulo: "2", tipo: "multipla", enunciado: "Entre passividade, assertividade e agressividade, a postura desejável no relacionamento profissional é a:", alternativas: A("assertividade", "passividade", "agressividade", "indiferença", "submissão"), gabarito: "A", explicacao: "A assertividade equilibra firmeza e respeito." },

  // ── M3 — Estresse / burnout ──
  { modulo: "3", tipo: "certo_errado", enunciado: "Estresse agudo é a resposta imediata do organismo (luta ou fuga); estresse crônico é o prolongado e adoecedor.", gabarito: "certo", explicacao: "Correto. Distinção entre as reações ao estresse." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A Síndrome de Burnout caracteriza-se por exaustão emocional, despersonalização e redução da realização profissional.", gabarito: "certo", explicacao: "Correto. São as três dimensões (Maslach), reconhecidas pela OMS." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O burnout instala-se de forma imediata, sem qualquer progressão.", gabarito: "errado", explicacao: "Errado. Instala-se gradualmente; a apostila apresenta os '12 degraus da exaustão'." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A despersonalização, no burnout, manifesta-se por atitudes negativas e cínicas em relação a colegas e ao público.", gabarito: "certo", explicacao: "Correto. É uma das três dimensões do burnout." },
  { modulo: "3", tipo: "multipla", enunciado: "A diferença essencial entre burnout e estresse comum é que o burnout:", alternativas: A("está especificamente ligado ao trabalho e à relação com colegas/usuários/organização", "é sempre passageiro", "não afeta o desempenho", "ocorre apenas fora do trabalho", "é idêntico ao estresse comum"), gabarito: "A", explicacao: "O burnout é específico do trabalho; o estresse comum afeta o indivíduo sem incidir diretamente na relação laboral." },
  { modulo: "3", tipo: "multipla", enunciado: "São exemplos de estressores ocupacionais na atividade policial, EXCETO:", alternativas: A("ausência total de risco no trabalho", "risco de vida", "exposição à violência", "escala/plantão", "pressão hierárquica"), gabarito: "A", explicacao: "O risco é justamente um estressor; sua ausência não é estressor." },
  { modulo: "3", tipo: "multipla", enunciado: "Os '12 degraus da exaustão', citados na apostila, descrevem:", alternativas: A("a progressão, passo a passo, da instalação do burnout até o colapso", "as fases do luto", "os estágios da CNV", "os níveis hierárquicos da PMPE", "as etapas de uma abordagem policial"), gabarito: "A", explicacao: "É um modelo progressivo que mapeia como a exaustão se instala." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A Organização Mundial da Saúde (OMS) estabelece pontos fundamentais para a caracterização da Síndrome de Burnout.", gabarito: "certo", explicacao: "Correto. A OMS fixa critérios para caracterizar o burnout como fenômeno ocupacional." },
  { modulo: "3", tipo: "multipla", enunciado: "A resposta imediata de 'luta ou fuga' diante de uma ameaça corresponde ao:", alternativas: A("estresse agudo", "estresse crônico", "burnout consolidado", "transtorno de personalidade", "contágio emocional"), gabarito: "A", explicacao: "É a reação aguda ao estresse." },

  // ── M4 — Massas ──
  { modulo: "4", tipo: "certo_errado", enunciado: "Para Gustave Le Bon, o indivíduo na multidão perde a identidade individual e fica suscetível a sugestão e impulsos irracionais.", gabarito: "certo", explicacao: "Correto. É a 'mente de multidão', ligada ao anonimato." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Herbert Blumer explica o comportamento coletivo como produto de interações sociais e da definição da situação.", gabarito: "certo", explicacao: "Correto. É a perspectiva interacionista, distinta da 'perda de razão' de Le Bon." },
  { modulo: "4", tipo: "certo_errado", enunciado: "A Teoria da Identidade Social (Tajfel e Turner) afirma que o grupo cria uma identidade coletiva que pode intensificar o 'nós contra eles'.", gabarito: "certo", explicacao: "Correto. A identidade social orienta a conduta no grupo." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O contágio emocional não se aplica às redes sociais, que apenas informam friamente.", gabarito: "errado", explicacao: "Errado. As redes sociais AMPLIFICAM o contágio emocional e a viralização." },
  { modulo: "4", tipo: "multipla", enunciado: "A 'mente de multidão', segundo a qual o indivíduo se torna sugestionável e irracional na massa, é de:", alternativas: A("Gustave Le Bon", "Herbert Blumer", "Tajfel e Turner", "Daniel Goleman", "Marshall Rosenberg"), gabarito: "A", explicacao: "Le Bon formulou a teoria da mente de multidão." },
  { modulo: "4", tipo: "multipla", enunciado: "O pânico coletivo, citado entre os comportamentos de massa, caracteriza-se por:", alternativas: A("comportamentos irracionais em que cada um prioriza a própria segurança", "decisões frias e calculadas em grupo", "ausência de qualquer emoção", "cooperação plena e ordenada", "indiferença ao perigo"), gabarito: "A", explicacao: "No pânico coletivo prevalece a busca individual de segurança, com irracionalidade." },
  { modulo: "4", tipo: "multipla", enunciado: "A inversão clássica de prova em psicologia das massas opõe:", alternativas: A("Le Bon (perda de razão/anonimato) a Blumer (interação/interpretação)", "Goleman a Maslach", "Kant a Hume", "Platão a Aristóteles", "Rosenberg a Tajfel"), gabarito: "A", explicacao: "Le Bon (irracionalidade) × Blumer (interacionismo) é a distinção cobrada." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Emoções intensas como medo e raiva favorecem o contágio emocional nas multidões.", gabarito: "certo", explicacao: "Correto. O contágio é mais intenso com emoções fortes." },

  // ── M5 — CNV ──
  { modulo: "5", tipo: "certo_errado", enunciado: "A CNV foi desenvolvida por Marshall B. Rosenberg e fundamenta-se na empatia.", gabarito: "certo", explicacao: "Correto. Separa observação de avaliação e foca em necessidades." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Os quatro componentes da CNV são observação, sentimento, necessidade e pedido.", gabarito: "certo", explicacao: "Correto. Modelo OSNP." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Na CNV, a observação deve vir acompanhada de avaliações e julgamentos sobre o outro.", gabarito: "errado", explicacao: "Errado. A observação deve ser SEM julgamento — separa-se o fato da avaliação." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Na CNV, 'sinto que você deveria falar mais baixo' é a expressão correta de um sentimento.", gabarito: "errado", explicacao: "Errado. Isso é uma opinião/avaliação, não um sentimento. Sentimento seria, p.ex., 'estou incomodado'." },
  { modulo: "5", tipo: "multipla", enunciado: "Na CNV, o terceiro componente, que reconhece o que está por trás dos sentimentos, é:", alternativas: A("a necessidade", "a observação", "o pedido", "a exigência", "a punição"), gabarito: "A", explicacao: "A necessidade está por trás do sentimento; o outro é estímulo, não causa." },
  { modulo: "5", tipo: "multipla", enunciado: "A diferença entre pedido e exigência, na CNV, está em que, na exigência:", alternativas: A("o solicitante culpa ou pune quem não atende", "há sempre ação concreta e positiva", "respeita-se a recusa", "não há expectativa de resposta", "usa-se linguagem vaga"), gabarito: "A", explicacao: "Exigência: culpa/pune o não-atendimento. Pedido: respeita o 'não'." },
  { modulo: "5", tipo: "multipla", enunciado: "Os três estágios da responsabilidade emocional na CNV são, na ordem:", alternativas: A("escravidão emocional, estágio ranzinza e libertação emocional", "negação, raiva e aceitação", "observação, sentimento e pedido", "alarme, resistência e exaustão", "passividade, agressividade e assertividade"), gabarito: "A", explicacao: "Rosenberg: escravidão emocional → ranzinza → libertação emocional." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Na CNV, o pedido deve ser formulado em linguagem clara, positiva e de ações concretas.", gabarito: "certo", explicacao: "Correto. Diz-se o que se quer, e não o que não se quer." },

  // ── M6 — PSP ──
  { modulo: "6", tipo: "certo_errado", enunciado: "Os Primeiros Socorros Psicológicos (PSP) são uma forma de psicoterapia prolongada.", gabarito: "errado", explicacao: "Errado. O PSP é apoio inicial, humano e pontual — NÃO é psicoterapia." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O PSP visa reduzir o sofrimento agudo, promover segurança e acolhimento e encaminhar à rede de apoio.", gabarito: "certo", explicacao: "Correto. São os objetivos do PSP." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Frases como 'eu sei como você se sente' e 'podia ter sido pior' são recomendadas no PSP.", gabarito: "errado", explicacao: "Errado. Devem ser EVITADAS, pois invalidam o sofrimento." },
  { modulo: "6", tipo: "certo_errado", enunciado: "No PSP, recomenda-se escuta ativa, presença calma e validação das emoções.", gabarito: "certo", explicacao: "Correto. São posturas adequadas no apoio inicial." },
  { modulo: "6", tipo: "multipla", enunciado: "São frases que costumam auxiliar no PSP:", alternativas: A("'Estou aqui com você' e 'Você está seguro agora'", "'Calma, não foi nada'", "'Eu sei exatamente como você se sente'", "'Para de chorar'", "'Podia ter sido pior'"), gabarito: "A", explicacao: "Frases que acolhem e dão segurança são adequadas; as demais invalidam o sofrimento." },
  { modulo: "6", tipo: "multipla", enunciado: "Quando o sofrimento persiste, o PSP recomenda:", alternativas: A("encaminhar a pessoa a profissional especializado", "ignorar o caso", "aplicar medicação no local", "iniciar psicoterapia imediata pelo policial", "registrar como ocorrência criminal"), gabarito: "A", explicacao: "O PSP é apoio pontual; casos persistentes são encaminhados a especialista." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O PSP pode ser prestado a vítimas, familiares e também a colegas de trabalho em sofrimento.", gabarito: "certo", explicacao: "Correto. É um apoio humano que alcança todos os envolvidos numa crise." },
  { modulo: "6", tipo: "multipla", enunciado: "O objetivo central do PSP é:", alternativas: A("oferecer apoio humano e prático imediato, reduzindo o sofrimento agudo", "diagnosticar transtornos mentais", "prescrever tratamento psiquiátrico", "substituir a rede de saúde", "investigar a causa do trauma"), gabarito: "A", explicacao: "É apoio inicial para reduzir o sofrimento e estabilizar, com encaminhamento." },
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
  console.log(`PA complemento: ${c} criadas/${u} atualizadas. Total ${all.length} (~${(all.length/mods.size).toFixed(1)}/modulo).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
