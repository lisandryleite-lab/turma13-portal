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
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

// 2º complemento — fecha ~22 questões/módulo.
const QS: Q[] = [
  // M1
  { modulo: "1", tipo: "certo_errado", enunciado: "A moralidade pública é um dos elementos cuja preservação caracteriza a existência da ordem pública.", gabarito: "certo", explicacao: "Correto. A ordem pública pressupõe, entre outros, a moralidade pública." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Salubridade pública diz respeito às condições de saúde e higiene do meio que afetam a coletividade.", gabarito: "certo", explicacao: "Correto. É um dos componentes da tríade da ordem pública." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O conceito de segurança pública é estático e não admite dimensão preventiva.", gabarito: "errado", explicacao: "Errado. A segurança pública tem forte dimensão preventiva, além da repressiva." },
  { modulo: "1", tipo: "multipla", enunciado: "A relação entre ordem pública e segurança pública é de:", alternativas: A("gênero (ordem pública) e espécie (segurança pública)", "sinonímia perfeita", "oposição", "espécie e gênero, respectivamente", "total independência"), gabarito: "A", explicacao: "Ordem pública é o gênero; segurança pública, uma de suas espécies." },
  { modulo: "1", tipo: "multipla", enunciado: "Assinale o elemento que NÃO compõe a tríade da ordem pública:", alternativas: A("ordem econômica", "segurança pública", "tranquilidade pública", "salubridade pública", "nenhuma das anteriores compõe"), gabarito: "A", explicacao: "A tríade é segurança + tranquilidade + salubridade. Ordem econômica não a integra." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Incolumidade significa o estado daquilo que está livre de dano ou perigo.", gabarito: "certo", explicacao: "Correto. Daí 'incolumidade das pessoas e do patrimônio' no art. 144." },
  { modulo: "1", tipo: "multipla", enunciado: "A finalidade da segurança pública, conforme o art. 144, é:", alternativas: A("a preservação da ordem pública e da incolumidade das pessoas e do patrimônio", "apenas a punição de criminosos", "a arrecadação de tributos", "a defesa externa do território", "a prestação de serviços de saúde"), gabarito: "A", explicacao: "É a finalidade expressa no caput do art. 144." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A segurança pública envolve tanto a atuação repressiva quanto a preventiva, articulando diversos órgãos.", gabarito: "certo", explicacao: "Correto. É um aparato institucional descentralizado, porém coordenado." },

  // M2
  { modulo: "2", tipo: "certo_errado", enunciado: "A Polícia Federal é órgão permanente, organizado e mantido pela União e estruturado em carreira.", gabarito: "certo", explicacao: "Correto. É a definição do §1º do art. 144 (EC 19/1998)." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Os corpos de bombeiros militares NÃO integram o rol de órgãos do art. 144 da CF.", gabarito: "errado", explicacao: "Errado. CBM integram o inciso V, junto com as polícias militares." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A Emenda Constitucional nº 19/1998 deu nova redação à definição da Polícia Federal e da PRF.", gabarito: "certo", explicacao: "Correto. A EC 19/1998 atualizou as redações dos §§ do art. 144." },
  { modulo: "2", tipo: "multipla", enunciado: "Quantos órgãos de segurança pública estão arrolados nos incisos do art. 144 da CF?", alternativas: A("Seis", "Cinco", "Quatro", "Sete", "Oito"), gabarito: "A", explicacao: "São seis órgãos (incisos I a VI), após a EC 104/2019 (polícias penais)." },
  { modulo: "2", tipo: "multipla", enunciado: "É órgão de segurança pública de competência exclusivamente FEDERAL:", alternativas: A("Polícia Rodoviária Federal", "Polícia Civil", "Polícia Militar", "Corpo de Bombeiros Militar", "Polícia Penal estadual"), gabarito: "A", explicacao: "A PRF (como a PF e a PFF) é órgão federal; PC, PM, CBM e polícia penal estadual são estaduais." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A Constituição admite que cada Estado crie um órgão policial próprio não previsto no art. 144, desde que por lei estadual.", gabarito: "errado", explicacao: "Errado. O rol é taxativo; é vedada a criação de órgãos policiais fora do art. 144." },
  { modulo: "2", tipo: "multipla", enunciado: "Sobre o caput do art. 144, é correto afirmar que a segurança pública é exercida para:", alternativas: A("preservação da ordem pública e da incolumidade das pessoas e do patrimônio", "fiscalização de tributos federais", "defesa do território contra agressão estrangeira", "regulação da atividade econômica", "organização do sistema eleitoral"), gabarito: "A", explicacao: "É a finalidade constitucional da segurança pública." },

  // M3
  { modulo: "3", tipo: "certo_errado", enunciado: "Compete à Polícia Federal apurar infrações penais cuja prática tenha repercussão interestadual ou internacional e exija repressão uniforme.", gabarito: "certo", explicacao: "Correto. Art. 144, §1º, I." },
  { modulo: "3", tipo: "certo_errado", enunciado: "À Polícia Ferroviária Federal cabe o patrulhamento ostensivo das ferrovias federais.", gabarito: "certo", explicacao: "Correto. Art. 144, §3º." },
  { modulo: "3", tipo: "multipla", enunciado: "A apuração de infrações penais comuns (não militares) no âmbito estadual cabe:", alternativas: A("às polícias civis", "às polícias militares", "à Polícia Federal", "às guardas municipais", "aos corpos de bombeiros"), gabarito: "A", explicacao: "Art. 144, §4º: às polícias civis cabe a polícia judiciária e a apuração penal, exceto as militares." },
  { modulo: "3", tipo: "multipla", enunciado: "A função de defesa civil é atribuição típica:", alternativas: A("dos corpos de bombeiros militares", "das polícias civis", "da Polícia Federal", "das guardas municipais", "da Polícia Rodoviária Federal"), gabarito: "A", explicacao: "Art. 144, §5º: aos CBM incumbe a execução de atividades de defesa civil." },
  { modulo: "3", tipo: "certo_errado", enunciado: "As polícias penais estaduais subordinam-se aos Governadores, conforme o §6º do art. 144 (EC 104/2019).", gabarito: "certo", explicacao: "Correto. PM, CBM, polícias civis e penais estaduais/distritais subordinam-se aos Governadores." },
  { modulo: "3", tipo: "multipla", enunciado: "O combate ao contrabando e ao descaminho, sem prejuízo da ação fazendária, é atribuição da:", alternativas: A("Polícia Federal", "Polícia Militar", "Guarda Municipal", "Polícia Penal", "Polícia Civil estadual"), gabarito: "A", explicacao: "Art. 144, §1º, II: previne e reprime tráfico, contrabando e descaminho." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A polícia ostensiva caracteriza-se pela atuação preventiva e visível (fardada), própria das polícias militares.", gabarito: "certo", explicacao: "Correto. É a marca da polícia ostensiva (PM)." },
  { modulo: "3", tipo: "certo_errado", enunciado: "As polícias civis exercem, com exclusividade, a polícia judiciária da União.", gabarito: "errado", explicacao: "Errado. A polícia judiciária da União é exclusiva da Polícia Federal; as polícias civis exercem a polícia judiciária estadual." },

  // M4
  { modulo: "4", tipo: "certo_errado", enunciado: "As guardas municipais podem atuar de forma conjunta com as demais forças de segurança pública.", gabarito: "certo", explicacao: "Correto. A cooperação entre guardas municipais e demais forças é prevista e estimulada." },
  { modulo: "4", tipo: "multipla", enunciado: "A Emenda Constitucional nº 82/2014 tratou:", alternativas: A("da segurança viária (§10 do art. 144)", "das polícias penais", "da criação da Polícia Federal", "do Estatuto das Guardas Municipais", "do SUSP"), gabarito: "A", explicacao: "A EC 82/2014 inseriu o §10, sobre segurança viária e agentes de trânsito." },
  { modulo: "4", tipo: "certo_errado", enunciado: "A segurança viária assegura ao cidadão o direito à mobilidade urbana eficiente.", gabarito: "certo", explicacao: "Correto. É objetivo expresso do §10, I, do art. 144." },
  { modulo: "4", tipo: "multipla", enunciado: "A competência da segurança viária, no âmbito dos Estados, DF e Municípios, é exercida por:", alternativas: A("órgãos ou entidades executivos de trânsito e seus agentes, estruturados em carreira", "Polícia Federal", "Forças Armadas", "Ministério Público", "guardas municipais exclusivamente"), gabarito: "A", explicacao: "§10, II: cabe aos órgãos executivos de trânsito e agentes estruturados em carreira." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O sistema penitenciário enfrenta como desafios recorrentes a superlotação carcerária e as condições de reclusão.", gabarito: "certo", explicacao: "Correto. São problemas que comprometem a ressocialização, segundo a apostila." },
  { modulo: "4", tipo: "multipla", enunciado: "Sobre a atuação das Forças Armadas na ordem interna, é correto afirmar:", alternativas: A("é excepcional, em apoio às polícias, mediante operações de GLO", "substitui as polícias estaduais de modo permanente", "é vedada em qualquer hipótese", "depende de autorização do prefeito", "é exercida como polícia judiciária"), gabarito: "A", explicacao: "A atuação é excepcional (GLO), em grave perturbação da ordem." },
  { modulo: "4", tipo: "certo_errado", enunciado: "A criação de guarda municipal é obrigatória para todos os Municípios brasileiros.", gabarito: "errado", explicacao: "Errado. O §8º estabelece faculdade ('poderão'), não obrigação." },

  // M5
  { modulo: "5", tipo: "certo_errado", enunciado: "A Lei nº 13.675/2018 foi sancionada em 11 de junho de 2018 e institui o SUSP.", gabarito: "certo", explicacao: "Correto. A Lei 13.675, de 11/06/2018, institui o SUSP e cria a PNSPDS." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A integração dos órgãos de segurança pública é uma das finalidades centrais do SUSP.", gabarito: "certo", explicacao: "Correto. O SUSP visa integrar e coordenar a atuação dos órgãos das três esferas." },
  { modulo: "5", tipo: "multipla", enunciado: "O SUSP foi instituído com fundamento, sobretudo, em qual dispositivo constitucional?", alternativas: A("art. 144, §7º", "art. 5º, caput", "art. 37, XXI", "art. 142", "art. 1º, III"), gabarito: "A", explicacao: "O §7º do art. 144 remete à lei que organiza os órgãos de segurança — a Lei 13.675/2018." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A PNSPDS prevê o uso comedido e proporcional da força como princípio.", gabarito: "certo", explicacao: "Correto. É um dos princípios da Política Nacional." },
  { modulo: "5", tipo: "multipla", enunciado: "São diretrizes/finalidades do SUSP, EXCETO:", alternativas: A("centralizar todas as polícias sob comando único da União", "atuação integrada dos órgãos", "planejamento e governança", "metas e indicadores", "monitoramento e avaliação"), gabarito: "A", explicacao: "O SUSP integra sem centralizar/comandar unificadamente as polícias; preserva as competências dos entes." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Os planos de segurança pública estaduais e municipais devem estar alinhados à PNSPDS.", gabarito: "certo", explicacao: "Correto. O alinhamento dos planos à Política Nacional é exigência do SUSP." },
  { modulo: "5", tipo: "multipla", enunciado: "Participação social, transparência e respeito aos direitos humanos são, no SUSP/PNSPDS:", alternativas: A("princípios da política", "vedações expressas", "competências exclusivas da União", "atribuições do Judiciário", "matérias estranhas à lei"), gabarito: "A", explicacao: "Constam entre os princípios da PNSPDS (Lei 13.675/2018)." },

  // M6
  { modulo: "6", tipo: "certo_errado", enunciado: "O Ministério Público é o titular da ação penal pública, atuando no sistema de justiça criminal.", gabarito: "certo", explicacao: "Correto. Art. 129, I, da CF." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Os Poderes da União (Legislativo, Executivo e Judiciário) são independentes, mas devem atuar de forma harmônica.", gabarito: "certo", explicacao: "Correto. Art. 2º da CF: independentes e harmônicos." },
  { modulo: "6", tipo: "multipla", enunciado: "A ENASP foi firmada em 2010 entre o CNJ, o CNMP e:", alternativas: A("o Ministério da Justiça", "as Forças Armadas", "o Tribunal de Contas da União", "a Defensoria Pública da União", "o Banco Central"), gabarito: "A", explicacao: "Estratégia Nacional de Justiça e Segurança Pública (CNJ + CNMP + MJ)." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A morosidade da Justiça Criminal e a superlotação prisional são apontadas como gargalos do sistema de segurança pública.", gabarito: "certo", explicacao: "Correto. A apostila destaca a necessidade de celeridade e reestruturação do sistema prisional." },
  { modulo: "6", tipo: "multipla", enunciado: "No sistema de justiça criminal, quem aplica o direito ao caso concreto, julgando, é:", alternativas: A("o Poder Judiciário", "o Ministério Público", "a polícia judiciária", "o Poder Legislativo", "o Tribunal de Contas"), gabarito: "A", explicacao: "O Judiciário julga; o MP acusa; a polícia investiga." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A relação entre cidadania e direito penal é fonte de tensões, especialmente quanto ao respeito aos direitos do cidadão na atuação policial.", gabarito: "certo", explicacao: "Correto. É um dos eixos críticos abordados na apostila." },
  { modulo: "6", tipo: "multipla", enunciado: "O FUNPEN é gerido no âmbito de qual órgão?", alternativas: A("Ministério da Justiça", "Ministério da Defesa", "Conselho Nacional de Justiça", "Supremo Tribunal Federal", "Ministério da Economia"), gabarito: "A", explicacao: "O Fundo Penitenciário Nacional é gerido pelo Ministério da Justiça." },
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
  const tot = await prisma.questao.count({ where: { materia: MAT } })
  const mods = new Set((await prisma.questao.findMany({ where: { materia: MAT }, select: { modulo: true } })).map(x => x.modulo))
  console.log(`SSP 2o complemento: ${c} criadas/${u} atualizadas. Total ${tot} (~${(tot/mods.size).toFixed(1)}/modulo).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
