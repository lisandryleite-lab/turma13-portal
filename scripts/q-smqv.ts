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
  | { modulo: string; tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string } }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const QS: Q[] = [
  // ── M1 — Conceitos ──
  { modulo: "1", tipo: "certo_errado", enunciado: "Para a OMS, saúde mental é apenas a ausência de doenças mentais.", gabarito: "errado", explicacao: "Errado. É um estado de bem-estar (equilíbrio emocional, psicológico e social), não só a ausência de doença." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Saúde mental, segundo a OMS, é um estado de bem-estar em que o indivíduo lida com o estresse normal da vida e trabalha produtivamente.", gabarito: "certo", explicacao: "Correto. É a definição da OMS." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A qualidade de vida, para a OMS, é a percepção do indivíduo sobre sua posição na vida, no contexto da cultura e dos valores em que vive.", gabarito: "certo", explicacao: "Correto. É a definição da OMS — conceito dinâmico e multidisciplinar." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A expressão 'qualidade de vida no trabalho (QVT)' foi cunhada por Louis Davis, na década de 1970.", gabarito: "certo", explicacao: "Correto. Em um projeto sobre desenho de cargos." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A QVT preocupa-se apenas com aspectos físicos e ambientais, ignorando o bem-estar psicológico.", gabarito: "errado", explicacao: "Errado. A QVT integra aspectos físicos/ambientais E psicológicos do trabalho." },
  { modulo: "1", tipo: "multipla", enunciado: "Segundo a OMS, a saúde mental envolve equilíbrio:", alternativas: A("emocional, psicológico e social", "apenas físico", "somente financeiro", "exclusivamente espiritual", "apenas cognitivo"), gabarito: "A", explicacao: "Equilíbrio emocional, psicológico e social." },
  { modulo: "1", tipo: "multipla", enunciado: "A QVT, segundo Chiavenato, busca conciliar:", alternativas: A("o bem-estar do colaborador e a produtividade da organização", "apenas o lucro da empresa", "somente a reivindicação sindical", "exclusivamente a higiene física", "apenas a redução de custos"), gabarito: "A", explicacao: "A QVT assimila o bem-estar/satisfação do colaborador e o interesse produtivo da organização." },
  { modulo: "1", tipo: "multipla", enunciado: "A qualidade de vida é descrita como um conceito:", alternativas: A("dinâmico, contingencial e multidisciplinar", "estático e universal", "exclusivamente médico", "puramente econômico", "imutável no tempo"), gabarito: "A", explicacao: "Modifica-se conforme as circunstâncias (contingencial) e é estudada por várias ciências." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Indivíduos com boa saúde mental tendem a ter uma percepção mais positiva de sua qualidade de vida.", gabarito: "certo", explicacao: "Correto. Saúde mental e QV estão intrinsecamente ligadas." },

  // ── M2 — Fatores ──
  { modulo: "2", tipo: "certo_errado", enunciado: "Estresse, pressão por resultados e falta de apoio social são fatores do ambiente de trabalho que impactam a saúde mental.", gabarito: "certo", explicacao: "Correto. Afetam o colaborador e a produtividade da organização." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A profissão policial, por sua exposição a risco e violência, eleva a vulnerabilidade à saúde mental.", gabarito: "certo", explicacao: "Correto. Risco, escala, cobrança social e hierárquica são fatores de impacto." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Apenas fatores individuais influenciam a saúde mental, sem qualquer papel dos fatores sociais e organizacionais.", gabarito: "errado", explicacao: "Errado. Fatores individuais e coletivos/sociais/organizacionais interagem." },
  { modulo: "2", tipo: "multipla", enunciado: "São estratégias de promoção da saúde mental no trabalho:", alternativas: A("ambiente positivo, comunicação clara, reconhecimento e programas de apoio", "aumento da pressão e da cobrança", "isolamento dos colaboradores", "supressão das pausas", "ocultação dos problemas"), gabarito: "A", explicacao: "São medidas promotoras de saúde mental e QVT." },
  { modulo: "2", tipo: "multipla", enunciado: "O impacto da saúde mental no ambiente de trabalho reflete-se diretamente:", alternativas: A("na produtividade da organização", "apenas no salário", "somente no clima externo", "exclusivamente na frota", "apenas na arrecadação"), gabarito: "A", explicacao: "Saúde mental no trabalho influencia a QV do colaborador e a produtividade." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Reconhecimento e valorização dos colaboradores contribuem para um ambiente de trabalho positivo.", gabarito: "certo", explicacao: "Correto. São estratégias citadas para melhorar saúde mental e QV." },

  // ── M3 — Transtornos ──
  { modulo: "3", tipo: "certo_errado", enunciado: "Para Marilda Lipp, o estresse é uma reação psicofisiológica diante de algo que ameaça a homeostase (equilíbrio interno).", gabarito: "certo", explicacao: "Correto. É a definição de Lipp (2003)." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O estresse crônico (persistente) pode aumentar a vulnerabilidade a doenças como as cardíacas e a hipertensão.", gabarito: "certo", explicacao: "Correto. Sobrecarrega os recursos de enfrentamento e prejudica a saúde física." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A principal causa da Síndrome de Burnout é o excesso de trabalho.", gabarito: "certo", explicacao: "Correto. É um esgotamento profissional ligado ao trabalho desgastante." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A Síndrome de Burnout não tem qualquer relação com a depressão.", gabarito: "errado", explicacao: "Errado. O burnout pode evoluir para um estado de depressão profunda." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A depressão caracteriza-se por tristeza constante e prolongada, sendo classificada como doença psiquiátrica crônica.", gabarito: "certo", explicacao: "Correto. Pode ser recorrente e atinge adultos, adolescentes e crianças." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O transtorno bipolar caracteriza-se por oscilações de humor entre euforia (mania) e depressão.", gabarito: "certo", explicacao: "Correto. A hipomania pode ser um sinal precoce." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A ansiedade é sempre patológica e nunca constitui uma reação normal do ser humano.", gabarito: "errado", explicacao: "Errado. A ansiedade é uma reação normal a ameaças; torna-se transtorno quando intensa, frequente e incapacitante." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Pelo DSM-5, o Transtorno Obsessivo Compulsivo (TOC) deixou de ser classificado dentro dos transtornos de ansiedade.", gabarito: "certo", explicacao: "Correto. O DSM-5 colocou o TOC em categoria própria ('TOC e transtornos relacionados')." },
  { modulo: "3", tipo: "multipla", enunciado: "Segundo Marilda Lipp, as fases do estresse são:", alternativas: A("alerta, resistência, quase-exaustão e exaustão", "leve, moderado e grave", "agudo e crônico apenas", "início, meio e fim", "físico, mental e social"), gabarito: "A", explicacao: "Modelo quadrifásico de Lipp: alerta → resistência → quase-exaustão → exaustão." },
  { modulo: "3", tipo: "multipla", enunciado: "São transtornos de ansiedade, EXCETO:", alternativas: A("Transtorno Bipolar", "Transtorno de Ansiedade Generalizada (TAG)", "Transtorno de Pânico", "Agorafobia", "TEPT"), gabarito: "A", explicacao: "O transtorno bipolar é um transtorno do humor, não de ansiedade." },
  { modulo: "3", tipo: "multipla", enunciado: "A Síndrome de Burnout é comum em profissionais que atuam sob pressão constante, tais como:", alternativas: A("policiais, médicos, enfermeiros, professores e jornalistas", "apenas atletas", "somente artistas", "exclusivamente agricultores", "apenas aposentados"), gabarito: "A", explicacao: "Atinge categorias submetidas a alta responsabilidade e pressão." },
  { modulo: "3", tipo: "multipla", enunciado: "Segundo a OMS, a depressão situa-se entre as principais causas de ônus por doenças, ocupando:", alternativas: A("o 4º lugar (e 1º em tempo vivido com incapacidade)", "o último lugar", "posição irrelevante", "1º lugar em mortalidade infantil", "nenhuma posição relevante"), gabarito: "A", explicacao: "A apostila cita a depressão em 4º lugar entre as causas de ônus." },
  { modulo: "3", tipo: "multipla", enunciado: "O TEPT (Transtorno de Estresse Pós-Traumático) está associado a:", alternativas: A("exposição a evento traumático", "excesso de sono", "alimentação inadequada", "uso de tecnologia", "atividade física leve"), gabarito: "A", explicacao: "O TEPT decorre de evento traumático/estressante intenso." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A prevalência de depressão ao longo da vida no Brasil, citada na apostila, gira em torno de 15,5%, e é maior entre profissionais de segurança.", gabarito: "certo", explicacao: "Correto. Os números se apresentam aumentados entre profissionais de segurança pública." },
  { modulo: "3", tipo: "multipla", enunciado: "A hipomania, no transtorno bipolar, é:", alternativas: A("uma mania/euforia de intensidade leve, podendo ser sinal precoce", "uma fase de depressão profunda", "um tipo de fobia", "sinônimo de ansiedade generalizada", "um sintoma exclusivo do TOC"), gabarito: "A", explicacao: "Hipomania = euforia leve; pode indicar precocemente a doença." },

  // ── M4 — Estigmas ──
  { modulo: "4", tipo: "certo_errado", enunciado: "O estigma associado aos transtornos mentais é uma das principais barreiras à busca de ajuda entre policiais.", gabarito: "certo", explicacao: "Correto. O preconceito leva a esconder o sofrimento e adiar a ajuda." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Buscar ajuda em saúde mental deve ser entendido como sinal de fraqueza do policial.", gabarito: "errado", explicacao: "Errado. Buscar ajuda é sinal de força e autocuidado; o estigma é que deve ser combatido." },
  { modulo: "4", tipo: "certo_errado", enunciado: "A cultura policial de força e controle pode reforçar o estigma em torno da saúde mental.", gabarito: "certo", explicacao: "Correto. Por isso a importância de normalizar a procura por apoio." },
  { modulo: "4", tipo: "multipla", enunciado: "O principal efeito do estigma sobre a saúde mental do policial é:", alternativas: A("levar a esconder o sofrimento e adiar a busca por ajuda", "acelerar o tratamento", "eliminar os sintomas", "aumentar a procura por apoio", "garantir o sigilo automático"), gabarito: "A", explicacao: "O estigma retarda/impede a procura por ajuda." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O sigilo profissional é um elemento que protege e incentiva quem procura apoio em saúde mental.", gabarito: "certo", explicacao: "Correto. A confidencialidade ajuda a reduzir o medo de retaliação." },

  // ── M5 — Vitimização ──
  { modulo: "5", tipo: "certo_errado", enunciado: "A vitimização policial é o processo pelo qual o policial se torna vítima, física ou psicologicamente, em razão da atividade.", gabarito: "certo", explicacao: "Correto. É um conceito central do módulo." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A vitimização secundária decorre do próprio evento criminoso, e não da resposta das instituições.", gabarito: "errado", explicacao: "Errado. A secundária (revitimização) decorre da resposta inadequada das instituições/sistema, não do crime em si (essa é a primária)." },
  { modulo: "5", tipo: "multipla", enunciado: "A vitimização PRIMÁRIA corresponde a:", alternativas: A("ao dano direto causado pelo evento criminoso/violento", "ao sofrimento causado pela burocracia institucional", "aos efeitos sobre a família do policial", "à ausência de qualquer dano", "ao estigma social"), gabarito: "A", explicacao: "Primária = dano direto do fato (lesão, trauma da ocorrência)." },
  { modulo: "5", tipo: "multipla", enunciado: "A vitimização SECUNDÁRIA (revitimização) caracteriza-se por:", alternativas: A("sofrimento gerado pela resposta inadequada das instituições e da sociedade", "lesão física no momento do crime", "ausência de impacto psicológico", "apoio integral da corporação", "indenização automática"), gabarito: "A", explicacao: "É o dano agravado pelo descaso/exposição/burocracia institucional." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A vitimização terciária refere-se aos efeitos prolongados sobre o policial e seu entorno (família e colegas).", gabarito: "certo", explicacao: "Correto. Alcança o círculo de convivência do policial." },

  // ── M6 — Recursos PMPE ──
  { modulo: "6", tipo: "certo_errado", enunciado: "O Núcleo de Saúde Mental 'Ten Cel PM Aline Maria Lopes dos Prazeres' presta acolhimento e atendimento psicológico aos militares da PMPE.", gabarito: "certo", explicacao: "Correto. É um dos recursos de apoio da corporação." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O Projeto Escuta SUSP é um canal de escuta e apoio psicológico ligado ao Ministério da Justiça e Segurança Pública.", gabarito: "certo", explicacao: "Correto. Voltado aos profissionais de segurança pública." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O papel do oficial-líder inclui diagnosticar e tratar os transtornos mentais de seus subordinados.", gabarito: "errado", explicacao: "Errado. Cabe ao líder identificar sinais precoces e ENCAMINHAR aos serviços — não diagnosticar nem tratar." },
  { modulo: "6", tipo: "multipla", enunciado: "A sigla FCAS, entre os recursos de apoio, refere-se à:", alternativas: A("Fundação de Apoio ao CAS (Centro de Apoio Social)", "Federação de Clubes de Atletismo e Saúde", "Fundo de Custeio de Assistência Suplementar", "Força Conjunta de Apoio Social", "Fundação Cearense de Atenção à Saúde"), gabarito: "A", explicacao: "FCAS = Fundação de Apoio ao CAS, apoio assistencial/psicossocial." },
  { modulo: "6", tipo: "multipla", enunciado: "Em relação à saúde mental, a atuação do oficial deve ser principalmente:", alternativas: A("preventiva: identificar sinais e encaminhar aos serviços", "curativa: prescrever medicação", "punitiva: afastar quem adoece", "omissa: ignorar os sinais", "diagnóstica: classificar o transtorno"), gabarito: "A", explicacao: "O foco é prevenção, identificação precoce e encaminhamento." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Programas de QVT, rodas de conversa e capacitação de líderes são medidas de promoção e prevenção em saúde mental.", gabarito: "certo", explicacao: "Correto. Atuam na prevenção, não apenas no tratamento." },

  // ── Dissertativas ──
  { modulo: "3", tipo: "dissertativa", enunciado: "Diferencie estresse e Síndrome de Burnout, indicando a causa principal do burnout e seu risco de evolução.", modelo: { estrutura: "Estresse → burnout → causa → risco → conclusão.", criterios: ["Definir estresse (reação à ameaça à homeostase, com fases)", "Definir burnout como esgotamento profissional ligado ao trabalho", "Apontar o excesso de trabalho como causa e a evolução para depressão"], resposta: "O estresse é uma reação psicofisiológica diante de algo que ameaça a homeostase (equilíbrio interno), podendo ser pontual ou crônico e evoluindo em fases (alerta, resistência, quase-exaustão e exaustão, segundo Lipp). A Síndrome de Burnout, por sua vez, é um esgotamento profissional especificamente ligado ao trabalho desgastante, tendo como causa principal o excesso de trabalho; é comum em categorias sob pressão, como os policiais. O burnout, se não tratado, pode evoluir para um quadro de depressão profunda, daí a importância de buscar apoio aos primeiros sintomas." } },
  { modulo: "4", tipo: "dissertativa", enunciado: "Explique como o estigma afeta a busca por ajuda em saúde mental entre policiais e o papel do oficial nesse contexto.", modelo: { estrutura: "Estigma → efeito na busca de ajuda → cultura policial → papel do líder → conclusão.", criterios: ["Definir estigma e seu efeito (esconder o sofrimento)", "Relacionar com a cultura policial de força/controle", "Indicar o papel do oficial: normalizar a ajuda, identificar e encaminhar"], resposta: "O estigma associa o transtorno mental à fraqueza ou incapacidade, levando o policial a esconder o sofrimento e a adiar a busca por ajuda, por medo de retaliação ou de ser afastado. A cultura policial, centrada em força e controle, tende a reforçar esse estigma. Cabe ao oficial-líder combatê-lo, normalizando a procura por apoio como sinal de autocuidado, garantindo o sigilo, identificando sinais precoces nos subordinados e encaminhando-os aos serviços especializados — sem assumir o papel de diagnosticar ou tratar." } },
]

type Card = { modulo: string; frente: string; verso: string }
const CARDS: Card[] = [
  { modulo: "1", frente: "Saúde mental e QV (OMS)", verso: `• Saúde mental: estado de bem-estar (equilíbrio emocional, psicológico e social); NÃO é só ausência de doença.\n• QV: percepção do indivíduo sobre sua posição na vida (cultura/valores); dinâmica e multidisciplinar.` },
  { modulo: "1", frente: "QVT — Louis Davis", verso: `• Termo cunhado por Louis Davis (década de 1970), em desenho de cargos.\n• Integra aspectos físicos/ambientais + psicológicos; concilia bem-estar do colaborador e produtividade (Chiavenato).` },
  { modulo: "2", frente: "Fatores que impactam a saúde mental", verso: `• Trabalho: estresse, pressão por resultados, falta de apoio, condições físicas.\n• Profissão policial: risco, violência, escala, cobrança.\n• Promoção: ambiente positivo, comunicação, reconhecimento, programas de apoio.` },
  { modulo: "3", frente: "Estresse (Lipp) — 4 fases", verso: `• Reação psicofisiológica à ameaça à homeostase.\n• Fases: alerta → resistência → quase-exaustão → exaustão.\n• Crônico → doenças cardíacas, hipertensão.` },
  { modulo: "3", frente: "Burnout × Depressão", verso: `• Burnout: esgotamento profissional; causa = excesso de trabalho; comum em policiais; pode evoluir p/ depressão.\n• Depressão: tristeza prolongada; crônica; ~15,5% no Brasil; OMS 4º lugar em ônus; maior entre profissionais de segurança.` },
  { modulo: "3", frente: "Transtornos de ansiedade e bipolar", verso: `• Ansiedade: reação normal; transtorno quando intensa/incapacitante. Tipos: TAG, Pânico, fobia social, agorafobia, TEPT.\n• DSM-5: TOC saiu da categoria ansiedade.\n• Bipolar: oscila euforia(mania)↔depressão; hipomania = sinal precoce.` },
  { modulo: "4", frente: "Estigma e busca de ajuda", verso: `• Estigma = associar transtorno a fraqueza → esconder sofrimento e adiar ajuda (principal barreira).\n• Cultura de força reforça o estigma; buscar ajuda é autocuidado; sigilo protege.` },
  { modulo: "5", frente: "Vitimização policial", verso: `• Primária: dano direto do evento criminoso.\n• Secundária (revitimização): sofrimento causado pela resposta inadequada das instituições.\n• Terciária: efeitos prolongados sobre o policial e o entorno.` },
  { modulo: "6", frente: "Recursos de apoio na PMPE", verso: `• Núcleo de Saúde Mental "Ten Cel Aline" (acolhimento/psicologia).\n• FCAS (Fundação de Apoio ao CAS). Projeto Escuta SUSP (MJSP).\n• Oficial: identificar sinais e ENCAMINHAR (não diagnosticar/tratar).` },
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
  console.log(`SMQV: ${c} criadas/${u} atualizadas. Total Q ${all.length} (~${(all.length/mods.size).toFixed(1)}/mod); flashcards ${tc}.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
