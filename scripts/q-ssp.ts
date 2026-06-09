import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "SSP"

type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string }
  | { modulo: string; tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string } }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const QS: Q[] = [
  { modulo: "1", tipo: "certo_errado", enunciado: "A ordem pública é a situação de tranquilidade e normalidade que o Estado deve assegurar às instituições e a todos, conforme as normas jurídicas.", gabarito: "certo", explicacao: "Correto. Inclui a garantia dos direitos individuais, a estabilidade das instituições e o regular funcionamento dos serviços públicos." },
  { modulo: "1", tipo: "multipla", enunciado: "A tríade que compõe a ordem pública é formada por:", alternativas: A("segurança pública, tranquilidade pública e salubridade pública", "polícia, justiça e prisão", "União, Estados e Municípios", "prevenção, repressão e investigação", "ordem, progresso e disciplina"), gabarito: "A", explicacao: "Ordem pública = segurança pública + tranquilidade pública + salubridade pública." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Segundo o art. 144 da CF, a segurança pública é dever do Estado, direito e responsabilidade de todos.", gabarito: "certo", explicacao: "Correto. É o caput do art. 144, exercida para a preservação da ordem pública e da incolumidade das pessoas e do patrimônio." },
  { modulo: "2", tipo: "certo_errado", enunciado: "As guardas municipais constam expressamente entre os órgãos de segurança pública dos incisos I a VI do art. 144 da CF.", gabarito: "errado", explicacao: "Errado. As guardas municipais estão no §8º do art. 144, e não entre os seis órgãos dos incisos I a VI (rol taxativo)." },
  { modulo: "2", tipo: "multipla", enunciado: "São órgãos de segurança pública previstos nos incisos do art. 144 da CF, EXCETO:", alternativas: A("Guarda Municipal", "Polícia Federal", "Polícia Rodoviária Federal", "Polícias Penais", "Polícias Militares e Corpos de Bombeiros Militares"), gabarito: "A", explicacao: "Os incisos I a VI: PF, PRF, PFF, polícias civis, PM/CBM e polícias penais. A guarda municipal está no §8º, não nos incisos." },
  { modulo: "2", tipo: "certo_errado", enunciado: "As polícias penais foram incluídas no art. 144 da CF pela Emenda Constitucional nº 104/2019.", gabarito: "certo", explicacao: "Correto. A EC 104/2019 criou as polícias penais (inciso VI e §5º-A), responsáveis pela segurança dos estabelecimentos penais." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Às polícias militares cabem a polícia ostensiva e a preservação da ordem pública.", gabarito: "certo", explicacao: "Correto. É o §5º do art. 144; aos corpos de bombeiros militares incumbe a defesa civil." },
  { modulo: "3", tipo: "multipla", enunciado: "A função de polícia judiciária da União, com exclusividade, cabe à:", alternativas: A("Polícia Federal", "Polícia Rodoviária Federal", "Polícia Civil", "Polícia Militar", "Guarda Municipal"), gabarito: "A", explicacao: "Art. 144, §1º, IV: à Polícia Federal cabe, com exclusividade, a polícia judiciária da União." },
  { modulo: "3", tipo: "multipla", enunciado: "Às polícias civis, dirigidas por delegados de carreira, incumbem:", alternativas: A("as funções de polícia judiciária e a apuração de infrações penais, exceto as militares", "o patrulhamento ostensivo das rodovias federais", "a polícia ostensiva e a preservação da ordem pública", "a segurança dos estabelecimentos penais", "a defesa civil"), gabarito: "A", explicacao: "Art. 144, §4º: polícia judiciária e apuração de infrações penais, exceto as militares." },
  { modulo: "3", tipo: "certo_errado", enunciado: "As polícias militares e os corpos de bombeiros militares são forças auxiliares e reserva do Exército e subordinam-se aos Governadores.", gabarito: "certo", explicacao: "Correto. É o §6º do art. 144 (com redação da EC 104/2019)." },
  { modulo: "4", tipo: "certo_errado", enunciado: "As guardas municipais, previstas no §8º do art. 144, destinam-se à proteção dos bens, serviços e instalações dos Municípios, conforme a Lei nº 13.022/2014.", gabarito: "certo", explicacao: "Correto. A Lei 13.022/2014 é o Estatuto Geral das Guardas Municipais." },
  { modulo: "4", tipo: "multipla", enunciado: "A atuação das Forças Armadas na segurança pública interna ocorre:", alternativas: A("de modo excepcional, em operações de Garantia da Lei e da Ordem (GLO)", "de forma ordinária e cotidiana, substituindo as polícias", "apenas em rodovias federais", "como polícia judiciária estadual", "na fiscalização de trânsito urbano"), gabarito: "A", explicacao: "As Forças Armadas atuam excepcionalmente (GLO), em grave perturbação da ordem." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A Lei nº 13.675/2018 instituiu o Sistema Único de Segurança Pública (SUSP) e criou a Política Nacional de Segurança Pública e Defesa Social (PNSPDS).", gabarito: "certo", explicacao: "Correto. A Lei 13.675/2018 regulamenta o art. 144, §7º, integrando os órgãos em torno da PNSPDS." },
  { modulo: "5", tipo: "certo_errado", enunciado: "O SUSP e o SUS (Sistema Único de Saúde) são o mesmo sistema, com idêntica base legal.", gabarito: "errado", explicacao: "Errado. O SUSP é o Sistema Único de Segurança Pública (Lei 13.675/2018); o SUS é da saúde — sistemas distintos." },
  { modulo: "5", tipo: "multipla", enunciado: "Sobre o SUSP (Lei 13.675/2018), é correto afirmar que:", alternativas: A("integra e coordena os órgãos de segurança das três esferas, com governança baseada em planejamento, metas e avaliação", "extingue as polícias estaduais", "transfere a segurança pública exclusivamente à União", "é um órgão único que substitui PF, PC e PM", "trata apenas do sistema penitenciário"), gabarito: "A", explicacao: "O SUSP integra os órgãos (federalismo cooperativo) e estrutura a governança em ciclo de planejamento, execução, monitoramento e avaliação." },
  { modulo: "5", tipo: "multipla", enunciado: "Integram operacionalmente o SUSP, além dos órgãos do art. 144:", alternativas: A("as guardas municipais e os agentes de trânsito, nos limites de suas competências", "somente as Forças Armadas", "apenas o Ministério Público", "exclusivamente a Polícia Federal", "nenhum outro órgão além dos seis do art. 144"), gabarito: "A", explicacao: "O art. 9º da Lei 13.675/2018 inclui guardas municipais e agentes de trânsito como integrantes operacionais, nos limites de suas atribuições." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A segurança pública, no modelo constitucional, baseia-se em responsabilidade compartilhada entre União, Estados e Municípios, exercida de forma cooperada.", gabarito: "certo", explicacao: "Correto. Há atribuições próprias e conexas, num modelo de federalismo cooperativo." },
  { modulo: "6", tipo: "multipla", enunciado: "No sistema de justiça criminal, a titularidade da ação penal pública cabe ao:", alternativas: A("Ministério Público", "Poder Judiciário", "Delegado de Polícia", "Tribunal de Contas", "Conselho Nacional de Justiça"), gabarito: "A", explicacao: "O Ministério Público é o titular da ação penal pública; o Judiciário julga; a polícia investiga." },
  { modulo: "3", tipo: "dissertativa", enunciado: "Diferencie polícia ostensiva (polícia militar) de polícia judiciária (polícias civil e federal) no contexto do art. 144 da CF.", modelo: { estrutura: "Polícia ostensiva → polícia judiciária → contraste → conclusão.", criterios: ["Definir polícia ostensiva (PM): prevenção e preservação da ordem, fardada", "Definir polícia judiciária (PC/PF): investigação após o delito", "Apontar o momento de atuação (antes × depois do crime)"], resposta: "A polícia ostensiva, atribuída às polícias militares (art. 144, §5º), caracteriza-se pela atuação preventiva e visível (fardada), voltada à preservação da ordem pública e à dissuasão de delitos. A polícia judiciária, exercida pelas polícias civis (§4º) e, no âmbito da União, pela Polícia Federal (§1º, IV), atua após o crime, investigando e apurando a autoria e a materialidade para subsidiar a ação penal. Em síntese, a ostensiva atua antes/durante (prevenção), e a judiciária, depois (investigação)." } },
  { modulo: "5", tipo: "dissertativa", enunciado: "Explique o que é o SUSP e a PNSPDS instituídos pela Lei nº 13.675/2018 e sua importância para a integração da segurança pública.", modelo: { estrutura: "Base legal → SUSP → PNSPDS → integração → conclusão.", criterios: ["Citar a Lei 13.675/2018 e a regulamentação do art. 144, §7º", "Definir o SUSP como sistema integrador dos órgãos das três esferas", "Mencionar a PNSPDS, princípios e governança por metas"], resposta: "A Lei nº 13.675/2018 instituiu o Sistema Único de Segurança Pública (SUSP) e criou a Política Nacional de Segurança Pública e Defesa Social (PNSPDS), regulamentando o art. 144, §7º, da CF. O SUSP integra e coordena os órgãos de segurança pública das três esferas (federalismo cooperativo), incluindo, no plano operacional, guardas municipais e agentes de trânsito. A PNSPDS fixa princípios (respeito ao Estado Democrático de Direito e aos direitos humanos, eficiência, transparência, uso proporcional da força) e estrutura a governança em planejamento, execução, monitoramento e avaliação, alinhando planos nacionais, estaduais e municipais — o que confere unidade e eficiência ao sistema." } },
]

type Card = { modulo: string; frente: string; verso: string }
const CARDS: Card[] = [
  { modulo: "1", frente: "Ordem pública e sua tríade", verso: `• Ordem pública: tranquilidade e normalidade asseguradas pelo Estado conforme as normas jurídicas.\n• Tríade: segurança pública + tranquilidade pública + salubridade pública.` },
  { modulo: "2", frente: "Art. 144 — os 6 órgãos", verso: `I – Polícia Federal; II – PRF; III – PFF; IV – Polícias Civis; V – PM e CBM; VI – Polícias Penais (EC 104/2019).\n• Caput: segurança pública = dever do Estado, direito e responsabilidade de todos.` },
  { modulo: "2", frente: "Guarda Municipal e segurança viária", verso: `• Guarda Municipal: §8º (NÃO está nos incisos I-VI) — Lei 13.022/2014.\n• Segurança viária: §10 (EC 82/2014) — agentes de trânsito.\n⚠ Rol dos incisos é TAXATIVO.` },
  { modulo: "3", frente: "Competências — PF, PRF, PFF", verso: `• PF (§1º): infrações contra a União, tráfico internacional, fronteiras, e polícia judiciária da União (exclusiva).\n• PRF (§2º): rodovias federais (ostensivo). PFF (§3º): ferrovias federais.` },
  { modulo: "3", frente: "Competências — PC, PM, CBM, Penal", verso: `• Polícia Civil (§4º): polícia judiciária + apuração penal (exceto militares).\n• PM (§5º): polícia ostensiva + ordem pública. CBM: defesa civil.\n• Polícia Penal (§5º-A): segurança dos estabelecimentos penais.\n• §6º: PM/CBM = forças auxiliares e reserva do Exército, subordinadas aos Governadores.` },
  { modulo: "4", frente: "Forças Armadas e penitenciário", verso: `• FFAA: atuação excepcional na segurança interna (GLO).\n• Sistema penitenciário: executa penas; desafios = superlotação e ressocialização.` },
  { modulo: "5", frente: "SUSP e PNSPDS (Lei 13.675/2018)", verso: `• Institui o SUSP e cria a PNSPDS (regulamenta art. 144, §7º).\n• Integra órgãos das 3 esferas (federalismo cooperativo); integrantes operacionais incluem guardas municipais e agentes de trânsito.\n• Princípios: ED de Direito, DH, eficiência, transparência, uso proporcional da força.` },
  { modulo: "6", frente: "Sistema de Justiça Criminal", verso: `• Judiciário: julga. Ministério Público: titular da ação penal. Polícia: investiga/previne.\n• Responsabilidade compartilhada e cooperada entre União, Estados e Municípios.` },
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
  console.log(`SSP: questoes ${c} criadas/${u} atualizadas (total ${tq}); flashcards ${fc} (total ${tc}).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
