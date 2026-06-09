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
  | { modulo: string; tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string } }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const QS: Q[] = [
  { modulo: "1", tipo: "certo_errado", enunciado: "A Psicologia é a ciência que estuda o comportamento e os processos mentais, auxiliando o policial na regulação emocional e na tomada de decisão sob pressão.", gabarito: "certo", explicacao: "Correto. É o objeto da Psicologia, com aplicação direta na atividade policial." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A socialização e a identidade militar referem-se ao processo pelo qual o indivíduo internaliza os valores, normas e a identidade da corporação.", gabarito: "certo", explicacao: "Correto. A socialização militar molda a conduta profissional segundo hierarquia e disciplina." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Assertividade e agressividade são equivalentes, pois ambas envolvem impor a própria vontade sem considerar o outro.", gabarito: "errado", explicacao: "Errado. Assertividade é expressar-se com firmeza E respeito; a agressividade desrespeita o outro; a passividade anula-se." },
  { modulo: "2", tipo: "multipla", enunciado: "São exemplos de processos psicológicos básicos, EXCETO:", alternativas: A("Hierarquia funcional", "Percepção", "Memória", "Atenção", "Motivação"), gabarito: "A", explicacao: "Processos psicológicos básicos: sensação/percepção, atenção, memória, aprendizagem, motivação, emoção e pensamento. Hierarquia é conceito organizacional." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A Síndrome de Burnout caracteriza-se por exaustão emocional, despersonalização e redução da realização/desempenho profissional.", gabarito: "certo", explicacao: "Correto. São as três dimensões do burnout (Maslach), reconhecidas pela OMS." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O burnout instala-se de forma súbita, do dia para a noite, sem progressão.", gabarito: "errado", explicacao: "Errado. O burnout instala-se gradualmente; a apostila apresenta os '12 degraus da exaustão' como progressão." },
  { modulo: "3", tipo: "multipla", enunciado: "A diferença essencial entre a Síndrome de Burnout e o estresse comum é que o burnout:", alternativas: A("está especificamente ligado ao trabalho e à relação com colegas/usuários/organização", "não tem relação alguma com o trabalho", "é sempre passageiro e sem consequências", "afeta apenas a vida familiar, não a profissional", "ocorre exclusivamente fora do ambiente laboral"), gabarito: "A", explicacao: "O burnout é específico do trabalho; o estresse tradicional afeta o indivíduo, mas não diretamente sua relação com o trabalho." },
  { modulo: "3", tipo: "multipla", enunciado: "Sobre as reações ao estresse, é correto afirmar:", alternativas: A("o estresse agudo é uma resposta imediata, e o crônico é prolongado e adoecedor", "o estresse agudo é sempre mais grave que o crônico", "o estresse crônico desaparece sozinho em horas", "apenas civis sofrem estresse ocupacional", "estresse e burnout são exatamente o mesmo fenômeno"), gabarito: "A", explicacao: "Estresse agudo = resposta imediata (luta/fuga); crônico = prolongado, com maior potencial adoecedor." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Para Gustave Le Bon, o indivíduo na multidão tende a perder o senso de identidade individual, ficando suscetível a sugestão, contágio e impulsos irracionais.", gabarito: "certo", explicacao: "Correto. É a 'mente de multidão' de Le Bon, ligada ao anonimato." },
  { modulo: "4", tipo: "multipla", enunciado: "A teoria que explica o comportamento de multidão como produto de interações sociais e da definição da situação (e não por perda de racionalidade) é de:", alternativas: A("Herbert Blumer", "Gustave Le Bon", "Tajfel e Turner", "Marshall Rosenberg", "Christina Maslach"), gabarito: "A", explicacao: "Blumer (interacionismo simbólico): o comportamento coletivo nasce da interpretação e da definição da situação." },
  { modulo: "4", tipo: "multipla", enunciado: "A Teoria da Identidade Social (Tajfel e Turner) explica que, em grupo, as pessoas:", alternativas: A("desenvolvem uma identidade coletiva e podem intensificar o sentimento de 'nós contra eles'", "sempre agem de modo mais racional do que sozinhas", "perdem qualquer noção de pertencimento", "ignoram normas e valores do grupo", "deixam de sofrer contágio emocional"), gabarito: "A", explicacao: "Tajfel e Turner: a identidade social do grupo orienta a conduta e pode acentuar o 'nós contra eles'." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A Comunicação Não Violenta (CNV) foi desenvolvida por Marshall B. Rosenberg e estrutura-se em quatro componentes: observação, sentimento, necessidade e pedido.", gabarito: "certo", explicacao: "Correto. Modelo OSNP de Rosenberg." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Na CNV, o primeiro componente é a observação, que deve incluir avaliações e julgamentos sobre o comportamento do outro.", gabarito: "errado", explicacao: "Errado. A observação na CNV deve ser SEM julgamento — separa-se o fato concreto da avaliação." },
  { modulo: "5", tipo: "multipla", enunciado: "Na CNV, a diferença entre um pedido e uma exigência está em que, na exigência:", alternativas: A("o solicitante culpa ou pune quando não é atendido", "há sempre uma ação concreta e positiva", "o outro tem total liberdade para recusar", "não há expectativa de resposta", "ocorre apenas em comunicação escrita"), gabarito: "A", explicacao: "É exigência quando o não-atendimento gera culpa/punição; o pedido respeita o 'não'." },
  { modulo: "5", tipo: "multipla", enunciado: "Os três estágios da responsabilidade emocional descritos na CNV são, na ordem:", alternativas: A("escravidão emocional → estágio ranzinza → libertação emocional", "negação → raiva → aceitação", "observação → sentimento → pedido", "alarme → resistência → exaustão", "passividade → agressividade → assertividade"), gabarito: "A", explicacao: "Rosenberg: escravidão emocional (responsável pelos sentimentos alheios) → ranzinza → libertação emocional." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Os Primeiros Socorros Psicológicos (PSP) são uma forma de psicoterapia prolongada conduzida pelo policial no local da ocorrência.", gabarito: "errado", explicacao: "Errado. O PSP é apoio inicial, humano e pontual — NÃO é psicoterapia; casos persistentes são encaminhados a profissional." },
  { modulo: "6", tipo: "certo_errado", enunciado: "No PSP, frases como 'Calma, não foi nada' ou 'Eu sei como você se sente' devem ser evitadas por invalidarem o sofrimento da pessoa.", gabarito: "certo", explicacao: "Correto. Essas frases minimizam/invalidam a dor; prefere-se acolher e validar as emoções." },
  { modulo: "6", tipo: "multipla", enunciado: "São objetivos dos Primeiros Socorros Psicológicos, EXCETO:", alternativas: A("substituir o tratamento psiquiátrico e prescrever medicação", "reduzir o sofrimento agudo", "promover segurança e acolhimento", "validar as emoções da pessoa", "encaminhar à rede de apoio quando necessário"), gabarito: "A", explicacao: "O PSP não substitui tratamento nem prescreve medicação — é apoio inicial e encaminhamento." },
  { modulo: "5", tipo: "dissertativa", enunciado: "Descreva os quatro componentes da Comunicação Não Violenta (CNV) de Marshall Rosenberg e explique a distinção entre pedido e exigência.", modelo: { estrutura: "Conceito → 4 componentes (OSNP) → pedido × exigência → conclusão.", criterios: ["Citar os 4 componentes: observação, sentimento, necessidade e pedido", "Explicar observação sem julgamento e sentimento (não juízo de valor)", "Distinguir pedido (respeita o não) de exigência (culpa/pune)"], resposta: "A CNV, de Marshall Rosenberg, estrutura-se em quatro componentes: (1) observação sem julgamento — descrever fatos concretos; (2) sentimento — nomear a emoção real, e não um juízo de valor; (3) necessidade — reconhecer a necessidade por trás do sentimento; e (4) pedido — formular uma ação concreta, clara e positiva. A distinção entre pedido e exigência está na reação ao 'não': no pedido, respeita-se a recusa; na exigência, o solicitante tende a culpar ou punir quem não o atende." } },
  { modulo: "3", tipo: "dissertativa", enunciado: "Conceitue a Síndrome de Burnout, apontando suas dimensões e a diferença em relação ao estresse comum.", modelo: { estrutura: "Conceito → dimensões → diferença do estresse → conclusão.", criterios: ["Definir burnout como esgotamento por estresse crônico ligado ao trabalho", "Citar exaustão emocional, despersonalização e redução da realização", "Diferenciar do estresse comum (relação direta com o trabalho)"], resposta: "A Síndrome de Burnout (esgotamento profissional) é um estado de tensão emocional e estresse crônicos provocado por condições de trabalho desgastantes, que se instala gradualmente. Caracteriza-se por três dimensões: exaustão emocional, despersonalização (atitudes negativas para com colegas e público) e redução da realização/desempenho profissional. Diferencia-se do estresse comum por estar especificamente ligado ao trabalho e à relação com colegas, usuários e organização, ao passo que o estresse tradicional afeta a vida do indivíduo sem incidir diretamente sobre sua relação laboral." } },
]

type Card = { modulo: string; frente: string; verso: string }
const CARDS: Card[] = [
  { modulo: "1", frente: "Psicologia e perfil do policial", verso: `• Psicologia: ciência do comportamento e dos processos mentais.\n• Perfil: equilíbrio emocional, autocontrole, resiliência para lidar com risco, conflito e pressão.\n• Socialização militar: internalização dos valores e da identidade da corporação.` },
  { modulo: "2", frente: "Assertividade × agressividade × passividade", verso: `• Assertivo: firmeza + respeito (defende direitos sem agredir).\n• Agressivo: desrespeita o outro.\n• Passivo: anula-se.` },
  { modulo: "3", frente: "Síndrome de Burnout — 3 dimensões", verso: `• Exaustão emocional; despersonalização (cinismo com colegas/público); redução da realização/desempenho.\n• Instala-se gradualmente; OMS fixa 3 pontos para caracterizá-la.` },
  { modulo: "3", frente: "Burnout × estresse comum", verso: `• Burnout: específico do TRABALHO (relação com colegas/usuários/organização).\n• Estresse comum: afeta o indivíduo, mas não diretamente sua relação com o trabalho.\n• "12 degraus da exaustão": progressão até o colapso.` },
  { modulo: "4", frente: "Psicologia das massas — 3 teorias", verso: `• Le Bon: "mente de multidão" — perda da identidade, sugestão/contágio/irracionalidade (anonimato).\n• Blumer: interação/interpretação — definição da situação.\n• Tajfel e Turner: identidade social — "nós contra eles".` },
  { modulo: "4", frente: "Contágio emocional e redes sociais", verso: `• Emoções intensas (medo, raiva) se espalham rápido na multidão.\n• Redes sociais amplificam a viralização e a mobilização.` },
  { modulo: "5", frente: "CNV (Rosenberg) — 4 componentes (OSNP)", verso: `• Observação sem julgamento; Sentimento (emoção real, não juízo); Necessidade (por trás do sentimento); Pedido (ação concreta e positiva).` },
  { modulo: "5", frente: "CNV — pedido × exigência e 3 estágios", verso: `• Exigência: culpa/pune se não atendido. Pedido: respeita o "não".\n• Responsabilidade emocional: escravidão emocional → ranzinza → libertação emocional.` },
  { modulo: "6", frente: "Primeiros Socorros Psicológicos (PSP)", verso: `• Apoio inicial, humano e pontual (NÃO é psicoterapia).\n• Objetivos: reduzir sofrimento agudo, dar segurança/acolhimento e encaminhar à rede.\n• Evitar frases que invalidam ("não foi nada", "sei como se sente").` },
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
  console.log(`PA: questoes ${c} criadas/${u} atualizadas (total ${tq}); flashcards ${fc} (total ${tc}).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
