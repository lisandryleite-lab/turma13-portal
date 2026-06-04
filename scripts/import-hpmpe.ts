import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

const MATERIA = "HPMPE"

type Card = { modulo: string; frente: string; verso: string }

const CARDS: Card[] = [
  // ───────────── MÓDULO 1 — Criação do Corpo de Polícia ─────────────
  { modulo: "1", frente: "Origem da instituição (1808)", verso:
`• A origem da futura Polícia Militar liga-se à vinda da Família Real em 1808.
• O príncipe regente cria no RJ a Intendência Geral de Polícia.
• Função principal: manutenção do sossego público (+ obras, abastecimento, iluminação, higiene, repressão a delitos).` },

  { modulo: "1", frente: "Criação do Corpo de Polícia de Pernambuco", verso:
`• Data: 11 de junho de 1825.
• Finalidade: manter a segurança no Recife e montar sistema para prevenir levantes e insurreições.
• Primeiros militares: muitos vítimas de recrutamento forçado.
• Ser militar NÃO mudava o status social (soldo muito baixo).
⚠ 11/06/1825 = data formal de criação.` },

  { modulo: "1", frente: "Recrutamento e efetivo inicial", verso:
`• A partir de 1830: recrutamento voluntário, contrato de 2 anos (renovável).
• Nunca se conseguiu preencher as vagas para o policiamento do Recife (resistência à profissão + deserção).
• Efetivo ínfimo: 259 soldados (182 infantaria + 77 cavalaria) para uma cidade de +25.000 habitantes.` },

  { modulo: "1", frente: "Dificuldades internas e uniforme (1825)", verso:
`• Armamento e uniformes deficitários, despreparo do efetivo, péssimas cadeias.
• Dez/1825: Governo da Província uniformiza e arma o efetivo — jaqueta azul + 2 calças (azul e branca) + capote + sapatos.
• Policiais vendiam armas e peças (sobretudo capotes).
⚠ Códigos disciplinares de 1845 e 1853: prisão disciplinar para quem vendesse peças ou usasse uniforme em desalinho.` },

  { modulo: "1", frente: "Comandantes e quadros iniciais", verso:
`• 11/06/1825 (Corpo de Polícia Provisório): 1º CMT Geral = CEL Antônio Maria da Silva Torres. Previsto 320; existente: 6 oficiais, 35 soldados, 11 recrutas; sem quartel.
• 1827 (organização mais regular): CMT Francisco Jacinto Pereira; 320 praças em 3 companhias; 1ªs instruções (CEL Antero José Ferreira).
• 1831: 500 soldados em 6 companhias (4 volantes e 2 de cavalaria).
⚠ Não confundir o 1º CMT Geral (Silva Torres, 1825) com o que recebeu o nome definido só em jan/1832: TC Manuel Cavalcante de Albuquerque.` },

  // ───────────── MÓDULO 2 — Século XIX: crises, geografia, ordem ─────────────
  { modulo: "2", frente: "Guarda Nacional e Guardas Municipais (1831)", verso:
`• Ago/1831: criação da Guarda Nacional.
• Out/1831: criação das Guardas Municipais Permanentes nas províncias (voluntários a pé e a cavalo).
• Jan/1832: definido o nome do CMT Geral → TC Manuel Cavalcante de Albuquerque.` },

  { modulo: "2", frente: "Crises do período regencial (Setembrada e Novembrada, 1831)", verso:
`• Forte sentimento anti-lusitano; em torno da abdicação de D. Pedro I.
• No Recife: levante das praças, praticamente sem apoio dos oficiais — movimento quase acéfalo (sem liderança).
• O Corpo de Polícia rachou, mas o grupo legalista prevaleceu.
• Melhorias de 1850: reforma remunerada melhorou a condição do policial, aproximando o efetivo do previsto em lei.` },

  { modulo: "2", frente: "Geografia do Recife e o trabalho policial", verso:
`• Rios Beberibe e Capibaribe eram "as estradas" — dificultavam a fiscalização.
• Malha urbana: 3 bairros — Recife, Santo Amaro e Boa Vista.
• Vigilância constante nos pontos de água (dique do Varadouro, Porto das Canoas, cacimbas, chafarizes).
• Atuação contra escravizados e negros ("cantorias e algazarras") para "tranquilizar as elites".` },

  { modulo: "2", frente: "\"Polícia de moleque\" e violência no séc. XIX", verso:
`• Alvo determinado: quem não podia resistir — escravos e "pobres sem patrão".
• Origem na dupla situação: fraqueza real/institucional + missão difusa de controle da escravaria urbana.
• Registros raros → difícil comprovação.
• 1870: Forças usadas como polícia de choque (gestão Henrique de Lucena × liberal José Mariano).` },

  { modulo: "2", frente: "Sete mudanças de nome e a Brigada Militar (1900)", verso:
`• Entre 1825 e 1900 a corporação mudou de nome SETE vezes.
• Lei nº 473, de 28/06/1900: passa a Brigada Militar de Pernambuco.
• Efetivo de quase 1.000 praças (Corpo de Polícia Volante + Guarda Cívica).
⚠ Brigada Militar de PE = Lei 473/1900.` },

  { modulo: "2", frente: "Principais problemas de segurança (1ª metade do séc. XIX)", verso:
`1. Abastecimento de água; 2. Quarentena de escravos desrespeitada; 3. Fluxo de marinheiros; 4. Inquietações nos chafarizes; 5. Escravos fugidos; 6. Enchentes; 7. Dinheiro falso em circulação.` },

  { modulo: "2", frente: "Repressão no séc. XX: mocambos, umbanda e maracatu", verso:
`• 1913: preocupação com a notoriedade política do proletariado urbano (mocambos).
• Surgem as "batidas" — a repressão policial vira característica inerente.
• Estado Novo / Interventoria de Agamenon Magalhães: terreiros de umbanda e maracatus vigiados e combatidos.
• 1938: militares excluídos por dançar maracatu dentro do quartel.` },

  { modulo: "2", frente: "Polícia e Ordem Pública (tese central)", verso:
`• A PMPE, ao longo da história, está mais ligada à ADMINISTRAÇÃO PÚBLICA e à MANUTENÇÃO DA ORDEM do que ao combate à criminalidade.
• Só no século XX as instituições policiais estreitaram o campo de ação: da ordem pública para o combate ao crime.
⚠ Pegadinha: a ênfase histórica é a ordem pública, não a criminalidade.` },

  // ───────────── MÓDULO 3 — Mercado Coelho Cintra → Quartel do Derby ─────────────
  { modulo: "3", frente: "Mercado Coelho Cintra — Delmiro Gouveia", verso:
`• Inspirado na Exposição Mundial de Chicago (1893), Delmiro Gouveia idealizou um grande centro comercial.
• 1897: adquire em leilão as instalações do Prado da Estância.
• 1898: inaugura o Mercado Coelho Cintra — centro comercial e de lazer; única edificação com luz elétrica no fim do séc. XIX; precursor dos shoppings no Brasil (+200 boxes).` },

  { modulo: "3", frente: "Perseguição a Delmiro e incêndio do mercado (1900)", verso:
`• Conflito político: Delmiro × grupo de Rosa e Silva (prefeito Esmeraldino Bandeira incentivava a repressão).
• 1899: após desavença, Delmiro agride Rosa e Silva a bengaladas no RJ (rua do Ouvidor).
• Madrugada de 1º→2 de janeiro de 1900: a mando do governo, policiais incendeiam parcialmente o mercado; Delmiro e o sócio Napoleão Duarte são presos.
• Delmiro arrenda o Derby e segue para a Europa.` },

  { modulo: "3", frente: "Do mercado ao Quartel do Derby (1923–1924)", verso:
`• Até 1909 o prédio ficou abandonado; depois abrigou a Escola de Aprendizes de Artífices.
• Gov. Sérgio Loreto: ato nº 376, de 04/07/1923 — cessão dos terrenos do Derby por quinhentos réis.
• Construído novo prédio para o 2º Batalhão da Força Pública (sobre as bases do antigo mercado).
• 18/10/1924: quartel do Derby parcialmente inaugurado (2º ano do governo Loreto + centenário da Confederação do Equador). Ganhou ares renascentistas e virou a edificação secular representativa da PMPE.` },

  // ───────────── MÓDULO 4 — Tropas Volantes e Cangaço ─────────────
  { modulo: "4", frente: "Tropas Volantes — conceito e origem", verso:
`• Representam a incorporação de saberes da região a uma instituição de hierarquia e disciplina.
• Foi a solução possível que o Estado encontrou para lidar com o cangaço.
• "Policial volante" = aquele que rondava; entre 1878–1888 o corpo volante da Força Pública tinha 850 policiais.
• Com a República, o Corpo foi dividido em 6 companhias de infantaria e o termo "volante" caiu em desuso (o trabalho seguiu).` },

  { modulo: "4", frente: "Lampião e a reestruturação da força no interior", verso:
`• O modus operandi de Lampião (extorsão, incêndios, sequestros, deslocamento rápido) expôs um aparato incapaz.
• O efetivo das cidades permanece, mas inserem-se tropas de deslocamento (20 a 40 homens) nas regiões do cangaço.
• Mobilidade vira característica central; civis contratados atuam como rastejadores e guias.
⚠ No interior, "volante" = milícia criada para reprimir bandoleiros.` },

  { modulo: "4", frente: "Contradição identitária: volantes × cangaceiros", verso:
`• Único detalhe que os diferenciava: a volante agia em nome das autoridades e das leis; o cangaceiro, não.
• Indumentária, armas, táticas, guias e formas de matar tornaram-se quase idênticas — confundindo as populações.
• "Para exterminar o inimigo foi necessário se tornar muito parecido com ele."
• "Inimigos fraternos" — gerados no mesmo ambiente sociocultural.` },

  { modulo: "4", frente: "Estratégias do cangaço (negaça, chocalho, desaparecimento)", verso:
`• Negaça (não enfrentamento): Lampião evitava combate; só atacava com vitória provável; preferia emboscadas em serras/serrotes. NÃO era visto como covardia, e sim prudência ("arte da guerra no mundo sertanejo").
• Chocalho: bando se divide em rumos diferentes e se reagrupa adiante por som de chocalho de bode.
• Desaparecimento: fuga por terreno pedregoso (pedras/lajes) sem deixar pegadas.
• Permanecer em combate não convinha: + baixas, + gasto bélico, sem butim.` },

  { modulo: "4", frente: "O rastejador e os \"três olhares\"", verso:
`• Localizar o adversário em vasta área era a 1ª dificuldade — daí a importância do rastejador (sertanejo, em geral contratado).
• Três olhares: (1) para baixo — pegadas e restos; (2) para cima — urubus/carcarás sobre acampamentos; (3) "com o nariz" — cheiro de café e perfume (o cangaceiro usava muito perfume).` },

  { modulo: "4", frente: "Coiteiros, apoio logístico e os Nazarenos", verso:
`• Coiteiro: sertanejo que dava asilo/protegia cangaceiros — por simpatia/admiração OU coagido (para não perder vida ou propriedade).
• Rede de apoio ao cangaço (1922–1926) era maior que a da Força Pública; o silêncio do sertanejo dificultava a volante.
• Nazarenos (Nazaré, entre Floresta e Vila Bela): marco de resistência ao cangaço; "a inimizade local vestiu a farda".
• Contratos das volantes: 3 anos, salários baixos pagos a cada 2 meses.` },
]

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MATERIA } })
  if (!disc) throw new Error(`Disciplina ${MATERIA} não existe.`)

  const del = await prisma.flashcard.deleteMany({ where: { materia: MATERIA } })
  console.log(`Flashcards HPMPE antigos removidos: ${del.count}`)

  let n = 0
  for (const c of CARDS) {
    const hash = createHash("sha1").update(`${MATERIA}|${c.modulo}|${c.frente}`).digest("hex")
    await prisma.flashcard.upsert({
      where: { hash },
      update: { verso: c.verso, ordem: n },
      create: { materia: MATERIA, modulo: c.modulo, frente: c.frente, verso: c.verso, ordem: n, hash },
    })
    n++
    console.log(`✓ [MÓD ${c.modulo}] ${c.frente}`)
  }
  console.log(`\n${n} flashcards de ${MATERIA} importados/atualizados.`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
