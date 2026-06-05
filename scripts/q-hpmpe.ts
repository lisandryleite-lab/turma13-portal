import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "HPMPE"

type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string }
  | { modulo: string; tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string } }

const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const QS: Q[] = [
  // ── MÓDULO 1 — Criação do Corpo de Polícia ──
  { modulo: "1", tipo: "certo_errado", enunciado: "O Corpo de Polícia de Pernambuco foi criado em 11 de junho de 1825, sendo essa a data formal de criação da instituição.", gabarito: "certo", explicacao: "Correto. 11/06/1825 é a data formal de criação do Corpo de Polícia de Pernambuco." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A origem da futura Polícia Militar liga-se à vinda da Família Real ao Brasil, em 1808, com a criação da Intendência Geral de Polícia no Rio de Janeiro.", gabarito: "certo", explicacao: "Correto. A Intendência Geral de Polícia (1808) tinha por função principal a manutenção do sossego público." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Nos primeiros anos, tornar-se militar do Corpo de Polícia elevava significativamente o status social do indivíduo, em razão dos altos soldos pagos.", gabarito: "errado", explicacao: "Errado. O soldo era muito baixo; ser militar NÃO mudava o status social, e muitos eram vítimas de recrutamento forçado." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O primeiro Comandante-Geral do Corpo de Polícia Provisório (1825) foi o Coronel Antônio Maria da Silva Torres.", gabarito: "certo", explicacao: "Correto. Silva Torres foi o 1º Cmt-Geral em 1825, quando havia apenas 6 oficiais, 35 soldados e 11 recrutas, sem quartel." },
  { modulo: "1", tipo: "multipla", enunciado: "Sobre o efetivo inicial do Corpo de Polícia de Pernambuco, é correto afirmar que:", alternativas: A("era ínfimo — cerca de 259 soldados para uma cidade de mais de 25.000 habitantes", "superava 2.000 homens já em 1825", "era composto exclusivamente por cavalaria", "dispensava recrutamento por excesso de voluntários", "contava com quartéis modelo em toda a província"), gabarito: "A", explicacao: "O efetivo era ínfimo: 259 soldados (182 infantaria + 77 cavalaria) para o Recife de +25.000 habitantes." },
  { modulo: "1", tipo: "multipla", enunciado: "Não se deve confundir o 1º Comandante-Geral (1825) com a autoridade cujo nome foi definido em janeiro de 1832. Quem foi este último?", alternativas: A("TC Manuel Cavalcante de Albuquerque", "CEL Antônio Maria da Silva Torres", "Francisco Jacinto Pereira", "Delmiro Gouveia", "Sérgio Loreto"), gabarito: "A", explicacao: "Em jan/1832 definiu-se o nome do Cmt-Geral: TC Manuel Cavalcante de Albuquerque (≠ Silva Torres, de 1825)." },

  // ── MÓDULO 2 — Século XIX ──
  { modulo: "2", tipo: "certo_errado", enunciado: "Pela Lei nº 473, de 28 de junho de 1900, a corporação passou a denominar-se Brigada Militar de Pernambuco.", gabarito: "certo", explicacao: "Correto. A Lei 473/1900 criou a Brigada Militar de Pernambuco, com cerca de 1.000 praças." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Entre 1825 e 1900, a corporação manteve sempre a mesma denominação, sem alterações de nome.", gabarito: "errado", explicacao: "Errado. Entre 1825 e 1900 a corporação mudou de nome SETE vezes, culminando na Brigada Militar (1900)." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Os rios Beberibe e Capibaribe funcionavam como verdadeiras 'estradas' do Recife e dificultavam a fiscalização policial.", gabarito: "certo", explicacao: "Correto. A geografia fluvial do Recife dificultava o trabalho policial; havia vigilância constante nos pontos de água." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Historicamente, a PMPE esteve mais ligada ao combate à criminalidade do que à manutenção da ordem pública e à administração.", gabarito: "errado", explicacao: "Errado (pegadinha). A ênfase histórica é a ordem pública e a administração; só no século XX o foco estreitou-se da ordem para o combate ao crime." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Durante o Estado Novo, sob a interventoria de Agamenon Magalhães, terreiros de umbanda e maracatus foram vigiados e combatidos pela polícia.", gabarito: "certo", explicacao: "Correto. Em 1938, militares chegaram a ser excluídos por dançar maracatu dentro do quartel." },
  { modulo: "2", tipo: "multipla", enunciado: "As crises da Setembrada e da Novembrada (1831), no Recife, caracterizaram-se por:", alternativas: A("forte sentimento anti-lusitano e um levante de praças quase acéfalo, com prevalência do grupo legalista", "uma rebelião liderada por oficiais-generais vitoriosos", "a adesão integral do Corpo de Polícia ao movimento separatista", "um conflito exclusivamente entre civis, sem participação policial", "a proclamação imediata da República em Pernambuco"), gabarito: "A", explicacao: "Foram crises do período regencial, anti-lusitanas; o levante das praças foi quase sem oficiais (acéfalo), e o grupo legalista prevaleceu." },
  { modulo: "2", tipo: "multipla", enunciado: "Assinale a alternativa que NÃO consta entre os principais problemas de segurança do Recife na 1ª metade do século XIX:", alternativas: A("Tráfico internacional de drogas sintéticas", "Abastecimento de água", "Fluxo de marinheiros", "Escravos fugidos", "Dinheiro falso em circulação"), gabarito: "A", explicacao: "Os problemas eram: água, quarentena de escravos, marinheiros, chafarizes, escravos fugidos, enchentes e dinheiro falso. Drogas sintéticas é anacronismo." },

  // ── MÓDULO 3 — Mercado Coelho Cintra / Derby ──
  { modulo: "3", tipo: "certo_errado", enunciado: "Delmiro Gouveia inaugurou, em 1898, o Mercado Coelho Cintra, considerado precursor dos shopping centers no Brasil e única edificação com luz elétrica no fim do século XIX.", gabarito: "certo", explicacao: "Correto. Inspirado na Exposição Mundial de Chicago (1893), o mercado tinha +200 boxes e luz elétrica." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O Mercado Coelho Cintra foi incendiado por policiais, a mando do governo, na madrugada de 1º para 2 de janeiro de 1900, em meio à perseguição política a Delmiro Gouveia.", gabarito: "certo", explicacao: "Correto. O conflito político (Delmiro × grupo de Rosa e Silva) culminou no incêndio e na prisão de Delmiro, que partiu para a Europa." },
  { modulo: "3", tipo: "multipla", enunciado: "O Quartel do Derby, edificação secular representativa da PMPE, foi parcialmente inaugurado em 18/10/1924. Sobre ele, é correto afirmar:", alternativas: A("foi erguido sobre as bases do antigo Mercado Coelho Cintra, para o 2º Batalhão da Força Pública, no governo Sérgio Loreto", "foi construído por Delmiro Gouveia como sede comercial", "substituiu a Intendência Geral de Polícia do Rio de Janeiro", "foi inaugurado em 1825, junto com a criação do Corpo de Polícia", "nunca teve relação com o Mercado Coelho Cintra"), gabarito: "A", explicacao: "Pelo Ato nº 376/1923 (Gov. Sérgio Loreto), os terrenos do Derby foram cedidos e o quartel do 2º Batalhão foi erguido sobre as bases do antigo mercado." },

  // ── MÓDULO 4 — Tropas Volantes e Cangaço ──
  { modulo: "4", tipo: "certo_errado", enunciado: "As Tropas Volantes representaram a incorporação de saberes regionais a uma instituição de hierarquia e disciplina, sendo a solução possível encontrada pelo Estado para enfrentar o cangaço.", gabarito: "certo", explicacao: "Correto. As volantes uniram saberes do sertão à estrutura militar para combater o cangaço." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O único detalhe que diferenciava, na prática, as volantes dos cangaceiros era que a volante agia em nome das autoridades e das leis.", gabarito: "certo", explicacao: "Correto. Indumentária, armas e táticas eram quase idênticas — daí a ideia de 'inimigos fraternos'; a diferença essencial era a legitimidade legal." },
  { modulo: "4", tipo: "certo_errado", enunciado: "A 'negaça' praticada por Lampião — evitar o combate direto e preferir emboscadas — era vista pelos próprios cangaceiros como sinal de covardia.", gabarito: "errado", explicacao: "Errado. A negaça era tida como prudência ('arte da guerra no mundo sertanejo'), não covardia: só se atacava com vitória provável." },
  { modulo: "4", tipo: "multipla", enunciado: "Os 'três olhares' do rastejador, fundamentais para localizar o adversário no sertão, eram:", alternativas: A("para baixo (pegadas/restos), para cima (urubus e carcarás) e 'com o nariz' (cheiro de café e perfume)", "para o norte, para o sul e para o leste", "o do guia, o do coiteiro e o do soldado", "a vista, o tato e a audição", "o do dia, o da noite e o da madrugada"), gabarito: "A", explicacao: "Os três olhares: (1) pegadas e restos no chão; (2) aves de rapina sobre acampamentos; (3) odor de café e perfume (o cangaceiro usava muito perfume)." },
  { modulo: "4", tipo: "multipla", enunciado: "Sobre o 'coiteiro' no contexto do cangaço, é correto afirmar:", alternativas: A("era o sertanejo que dava asilo e proteção aos cangaceiros, por simpatia ou por coação", "era o policial mais antigo da tropa volante", "era a arma típica usada por Lampião", "era o nome dado às emboscadas em serras", "era o contrato de três anos das volantes"), gabarito: "A", explicacao: "O coiteiro abrigava os cangaceiros; a rede de apoio (1922–1926) chegou a ser maior que a da Força Pública, dificultando as volantes." },

  // ── MÓDULO 5 — História Militar: conceitos ──
  { modulo: "5", tipo: "certo_errado", enunciado: "A 'Nova História Militar' supera a abordagem meramente factual e heroica, passando a estudar a instituição em sua relação com a sociedade, a cultura e a administração pública.", gabarito: "certo", explicacao: "Correto. A Nova História Militar (e a História Policial Militar) trata a corporação como ator social, não apenas militar." },
  { modulo: "5", tipo: "multipla", enunciado: "A máxima de que 'a guerra é a continuação da política por outros meios' é atribuída a:", alternativas: A("Karl von Clausewitz", "Sun Tzu", "Delmiro Gouveia", "Winston Churchill", "André Carneiro de Albuquerque"), gabarito: "A", explicacao: "É de Clausewitz (Da Guerra), referência na apostila ao lado de conceitos como a 'derrota clausewitziana' e o atrito bélico." },

  // ── Dissertativas ──
  { modulo: "2", tipo: "dissertativa", enunciado: "Explique a tese de que a PMPE, ao longo de sua história, esteve mais ligada à manutenção da ordem pública do que ao combate à criminalidade.", modelo: { estrutura: "Tese → exemplos históricos → virada do séc. XX → conclusão.", criterios: ["Afirmar a ligação histórica com a ordem pública e a administração", "Citar exemplos (controle da escravaria, vigilância de mocambos/terreiros/maracatus)", "Apontar que só no séc. XX o foco estreitou-se para o combate ao crime"], resposta: "Desde a criação (1825), a corporação esteve voltada à manutenção do sossego e da ordem pública e ao apoio à administração — vigilância de pontos de água, controle da escravaria urbana, repressão a mocambos, terreiros de umbanda e maracatus. O combate à criminalidade, como o entendemos hoje, não era o eixo central. Somente no século XX as instituições policiais estreitaram seu campo de ação, deslocando o foco da ordem pública para o combate ao crime." } },
  { modulo: "4", tipo: "dissertativa", enunciado: "Disserte sobre a contradição identitária entre as Tropas Volantes e os cangaceiros, explicando a expressão 'inimigos fraternos'.", modelo: { estrutura: "Origem comum → semelhanças → diferença essencial → conclusão.", criterios: ["Apontar que ambos nasceram no mesmo ambiente sociocultural sertanejo", "Destacar a semelhança de indumentária, armas e táticas", "Indicar que a diferença essencial era a legitimidade legal da volante"], resposta: "Volantes e cangaceiros foram gerados no mesmo ambiente sociocultural do sertão e, para combater o cangaço, a polícia incorporou seus saberes, indumentárias, armas e táticas — tornando-se quase idêntica ao adversário ('para exterminar o inimigo foi necessário se tornar muito parecido com ele'). O único detalhe que verdadeiramente os separava era que a volante agia em nome das autoridades e das leis, enquanto o cangaceiro não. Daí a expressão 'inimigos fraternos': adversários irmãos, nascidos do mesmo meio." } },
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
  const tot = await prisma.questao.count({ where: { materia: MAT } })
  console.log(`HPMPE: ${c} criadas, ${u} atualizadas. Total ${MAT}: ${tot}.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
