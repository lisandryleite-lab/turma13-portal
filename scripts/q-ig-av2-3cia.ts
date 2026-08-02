import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const MAT = "IG"
const MOD = "AV2 2026 · 3ª CIA" // 2ª Avaliação Escrita de Instrução Geral — CFO PMPE 2026, 3ª Companhia (25/03/2026)
const FONTE = "2ª AE de Instrução Geral — CFO PMPE 2026 (3ª CIA) · espelho de gabarito"
const REF = ` (${FONTE})`

type Alt = { id: string; texto: string }
type Q =
  | { tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string }
  | { tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string }
  | { tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string } }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const QS: Q[] = [
  // ───── 1º QUESITO (V/F — 1,0 pt · 0,20 cada) — Os 12 pontos do roteiro básico de uma solenidade ─────
  { tipo: "certo_errado", enunciado: "Considerando os 12 pontos que integram o roteiro básico de uma solenidade: a entrega de condecorações, homenagens e apresentações culturais podem fazer parte de uma solenidade militar.", gabarito: "certo", explicacao: "VERDADEIRO. Condecorações, homenagens e apresentações culturais constam do roteiro básico da solenidade (ponto VII)." + REF },
  { tipo: "certo_errado", enunciado: "A chegada da Autoridade é considerada fora do roteiro de uma solenidade.", gabarito: "errado", explicacao: "FALSO. A 'Chegada da Autoridade' é justamente o ponto I do roteiro básico — está dentro dele, e não fora." + REF },
  { tipo: "certo_errado", enunciado: "Ao final da solenidade, há necessidade de solicitar autorização para o seu encerramento.", gabarito: "certo", explicacao: "VERDADEIRO. A maior autoridade militar da ativa presente solicita permissão à autoridade de maior precedência tanto para iniciar quanto para encerrar a solenidade." + REF },
  { tipo: "certo_errado", enunciado: "Serão prestadas as Honras Militares somente à maior autoridade militar presente.", gabarito: "errado", explicacao: "FALSO. As Honras Militares são prestadas à autoridade de maior precedência que a elas tenha direito — que pode ser autoridade CIVIL. Restringi-las 'à maior autoridade militar presente' torna a assertiva falsa." + REF },
  { tipo: "certo_errado", enunciado: "Em uma solenidade militar as pessoas podem aplaudir após a execução do Hino Nacional em todas as hipóteses.", gabarito: "errado", explicacao: "FALSO. Não é em todas as hipóteses — o aplauso após o Hino Nacional depende da natureza da solenidade (não cabe, por exemplo, em cerimônias fúnebres ou de luto)." + REF },

  // ───── 2º QUESITO (V/F — 1,0 pt · 0,20 cada) — Compromisso ao primeiro posto ─────
  { tipo: "certo_errado", enunciado: "Sobre o compromisso ao primeiro posto: o Compromisso será prestado em solenidade especialmente programada para esse Ato, sendo o compromisso realizado perante a Bandeira Nacional.", gabarito: "certo", explicacao: "VERDADEIRO. O compromisso ao primeiro posto é prestado em solenidade especialmente programada, perante a Bandeira Nacional." + REF },
  { tipo: "certo_errado", enunciado: "Os compromitentes, com olhos fitos na Bandeira Nacional, depois de perfilarem espadas, prestam, em voz alta e pausada, o compromisso (conforme Estatuto dos Militares do Estado de Pernambuco).", gabarito: "errado", explicacao: "FALSO. O compromisso é prestado depois de ABATEREM as espadas (movimento de 'apresentar-arma' com a espada), e não depois de perfilarem." + REF },
  { tipo: "certo_errado", enunciado: "Se o oficial promovido servir em Estabelecimento ou Repartição, este compromisso é prestado no gabinete do diretor ou chefe e assistido por todos os oficiais que ali servem, revestindo-se a solenidade das mesmas formalidades previstas.", gabarito: "certo", explicacao: "VERDADEIRO. É o que dispõe o art. 182 do Estatuto: em Estabelecimento ou Repartição, o compromisso ocorre no gabinete do diretor ou chefe, com as mesmas formalidades." + REF },
  { tipo: "certo_errado", enunciado: "O compromisso de declaração a Guarda-Marinha e Aspirante-a-Oficial é prestado nas Escolas de Formação, sendo o cerimonial realizado de acordo com os regulamentos dos respectivos órgãos de ensino.", gabarito: "certo", explicacao: "VERDADEIRO (art. 183 do Estatuto). O cerimonial segue os regulamentos dos respectivos órgãos de ensino." + REF },
  { tipo: "certo_errado", enunciado: "Todo militar nomeado ao primeiro posto prestará o compromisso de oficial, de acordo com o determinado no regulamento de cada Força Armada.", gabarito: "certo", explicacao: "VERDADEIRO. A cerimônia é presidida pelo Comandante da OM ou pela mais alta autoridade militar presente." + REF },

  // ───── 3º QUESITO (V/F — 1,0 pt · 0,20 cada) — Solenidade de passagem de comando ─────
  { tipo: "certo_errado", enunciado: "Sobre a solenidade de passagem de comando: durante as solenidades de passagem de comando de OME, o evento de transmissão do cargo será conduzido pela autoridade imediatamente superior na cadeia de comando.", gabarito: "certo", explicacao: "VERDADEIRO. Quem conduz a transmissão do cargo é a autoridade imediatamente superior na cadeia de comando." + REF },
  { tipo: "certo_errado", enunciado: "O desfile da tropa em continência à autoridade que conduz o evento é um dos Atos previstos para a solenidade de Passagem de Comando.", gabarito: "errado", explicacao: "FALSO. O desfile final é realizado em continência ao Comandante SUCESSOR — que passa a comandar a OM — e não à autoridade que conduz o evento." + REF },
  { tipo: "certo_errado", enunciado: "O Cmt sucedido e o Cmt sucessor, voltando-se um para o outro, abaterão as espadas; a autoridade que conduz o evento permanecerá com a espada perfilada; o Porta-Bandeira e o Porta-Estandarte (esse, se houver) permanecerão em 'OMBRO-ARMA'.", gabarito: "certo", explicacao: "VERDADEIRO. É exatamente o posicionamento previsto no cerimonial da transmissão do cargo." + REF },
  { tipo: "certo_errado", enunciado: "Após a continência, os 2 (dois) oficiais perfilam as espadas e voltam-se para a Bandeira Nacional. A autoridade que conduz o evento comandará à voz 'EM CONTINÊNCIA À BANDEIRA, APRESENTAR-ARMA!', que será executado somente pelos Cmt's sucedido e sucessor.", gabarito: "errado", explicacao: "FALSO. O comando 'EM CONTINÊNCIA À BANDEIRA, APRESENTAR-ARMA!' é executado por TODA a tropa formada, e não apenas pelos comandantes sucedido e sucessor." + REF },
  { tipo: "certo_errado", enunciado: "Quanto à revista à tropa, o Cmt sucessor, com sua espada perfilada, deslocar-se-á pela frente da tropa acompanhado do oficial sucedido, esse à sua direita com a espada perfilada.", gabarito: "errado", explicacao: "FALSO. O Comandante sucedido acompanha o sucessor à direita, porém com a espada EMBAINHADA — simbolizando a missão já cumprida. A revista é feita na cadência de 116 passos por minuto e restringe-se às passagens de comando de unidade e subunidade isolada." + REF },

  // ───── 4º QUESITO (0,5 pt) — Atribuições do Comandante de OME ─────
  { tipo: "multipla", enunciado: "Quanto às atribuições do Comandante de OME, marque a alternativa que corresponde à resposta INCORRETA.", alternativas: A(
    "Transcrever, a seu juízo, em BI, as recompensas concedidas pelos comandos subordinados.",
    "Transferir o militar, levando em consideração a localização geográfica de sua residência.",
    "Conceder licenças de acordo com as instruções e normas específicas em vigor.",
    "Dar suas ordens e instruções, sempre que possível, por intermédio do Subcomandante da Unidade, devendo aqueles que as receberem diretamente dar ciência ao SCmt na primeira oportunidade.",
    "Atender às ponderações justas de seus subordinados, quando feitas em termos adequados e desde que sejam de sua competência."),
    gabarito: "B", explicacao: "A INCORRETA é a 'B'. Transferir militar em razão da localização geográfica de sua residência não é atribuição do Comandante de OME — a movimentação de pessoal obedece a normas próprias e à necessidade do serviço. As demais alternativas reproduzem atribuições previstas no RISG." + REF },

  // ───── 5º QUESITO (0,5 pt) — Serviço interno / serviço de escala ─────
  { tipo: "multipla", enunciado: "Sobre o serviço interno, o serviço de escala compreende, EXCETO:", alternativas: A(
    "Guarda do quartel.",
    "Sgt Dia SU.",
    "Guarda das SU (alojamentos, garagens, cavalariças, canis, quando for o caso).",
    "Serviço-de-dia ao rancho (Sgt Dia, cozinheiro, cassineiro etc.).",
    "Portaria e serviços gerais."),
    gabarito: "E", explicacao: "A exceção é a 'E'. Portaria e serviços gerais não integram o serviço de ESCALA: são encargos permanentes/de rotina da unidade. O serviço de escala compreende a guarda do quartel, o Sgt Dia SU, as guardas das SU e o serviço-de-dia ao rancho." + REF },

  // ───── 6º QUESITO (0,5 pt) — Conteúdo do Boletim Interno ─────
  { tipo: "multipla", enunciado: "O BI conterá, especialmente, EXCETO:", alternativas: A(
    "A discriminação do serviço a ser executado pela unidade.",
    "Os assuntos que tenham sido transmitidos à unidade em caráter sigiloso ou quaisquer referências a esses mesmos assuntos.",
    "As ordens e decisões do Cmt U, mesmo que já tenham sido executadas.",
    "As determinações das autoridades superiores, mesmo que já cumpridas, com a citação do documento da referência.",
    "As alterações ocorridas com o pessoal e o material da unidade."),
    gabarito: "B", explicacao: "A exceção é a 'B'. O Boletim Interno é documento ostensivo: NÃO pode conter assuntos transmitidos em caráter sigiloso, nem qualquer referência a eles. Assuntos sigilosos são tratados em boletim reservado ou documento próprio." + REF },

  // ───── 7º QUESITO (0,5 pt) — Guarda fúnebre: giro após o comando 'PREPARAR!' ─────
  { tipo: "multipla", enunciado: "Em quantos graus o militar realiza o giro após o comando de 'PREPARAR!' na guarda fúnebre?", alternativas: A(
    "90°", "60°", "45°", "75°", "30°"),
    gabarito: "C", explicacao: "Gabarito 'C'. Ao comando de 'PREPARAR!' o militar gira 45° à direita, sobre a planta do pé esquerdo, na execução das salvas/guarda fúnebre." + REF },

  // ───── 8º QUESITO (1,5 pt) — Hasteamento e arriação em luto nacional ─────
  { tipo: "dissertativa", enunciado: "Considerando que o Presidente da República decretou luto nacional, descreva como deve ocorrer o hasteamento e a arriação da Bandeira Nacional, da bandeira de Pernambuco e da insígnia de comando. (mín. 4 / máx. 8 linhas)", modelo: {
    estrutura: "Precedência do Pavilhão Nacional → hasteamento em luto (sobe ao topo e desce a meio-mastro) → arriação em luto (sobe ao topo e depois desce) → aplicação às três bandeiras.",
    criterios: [
      "Informar que o Pavilhão Nacional fica acima de todas as demais bandeiras (0,75 — hasteamento)",
      "No HASTEAMENTO: as bandeiras sobem ao topo do mastro e, em seguida, descem ao meio-mastro",
      "Na ARRIAÇÃO: as bandeiras sobem novamente ao topo do mastro e, depois, são arriadas (0,75)",
      "Estender o procedimento à Bandeira Nacional, à bandeira de Pernambuco e à insígnia de comando",
      "Fundamento: Aula 11 — slide 24",
    ],
    resposta: "Decretado o luto nacional, observa-se em primeiro lugar a precedência: o Pavilhão Nacional fica sempre acima de todas as demais bandeiras, seguindo-se a bandeira de Pernambuco e a insígnia de comando. No HASTEAMENTO, as bandeiras são conduzidas até o TOPO do mastro e, em seguida, descem até o MEIO-MASTRO, onde permanecem durante todo o período de luto. Na ARRIAÇÃO, faz-se o movimento inverso: as bandeiras sobem novamente ao TOPO do mastro e, só depois, são arriadas. O mesmo procedimento aplica-se à Bandeira Nacional, à bandeira do Estado de Pernambuco e à insígnia de comando. Durante o luto, a tropa não canta hinos nem canções militares.",
  } },

  // ───── 9º QUESITO (1,5 pt) — Honras Fúnebres ─────
  { tipo: "dissertativa", enunciado: "Defina Honras Fúnebres e cite seus tipos. (mín. 4 / máx. 8 linhas)", modelo: {
    estrutura: "Definição (0,60) → citação de cada um dos três tipos (0,30 cada).",
    criterios: [
      "Homenagens póstumas prestadas DIRETAMENTE PELA TROPA",
      "Aos despojos mortais de uma alta autoridade ou de um militar da ativa",
      "De acordo com a posição hierárquica que ocupava",
      "Citar os três tipos: Guarda Fúnebre, Escolta Fúnebre e Salvas Fúnebres",
      "Fundamento: Aula 11 — slide 6",
    ],
    resposta: "Honras Fúnebres são homenagens póstumas prestadas diretamente pela tropa aos despojos mortais de uma alta autoridade ou de um militar da ativa, de acordo com a posição hierárquica que ocupava. Consistem basicamente em três tipos distintos: 1) Guarda Fúnebre; 2) Escolta Fúnebre; e 3) Salvas Fúnebres.",
  } },

  // ───── 10º QUESITO (2,0 pt) — Precedência hierárquica das autoridades da PMPE ─────
  { tipo: "dissertativa", enunciado: "Qual a ordem de precedência hierárquica entre as autoridades abaixo? Enumere de 1 a 9, sendo da maior para a menor precedência: ( ) 1ª EMG a 8ª EMG, DIM, DIRESP, DINTER I e II, DF, DEIP, DASDH, DAL, DGP, DS, DTec, DASIS, AG — regido pela precedência hierárquica e antiguidade no posto; ( ) Diretor Geral de Administração e Diretor de Planejamento Operacional; ( ) Chefe do Estado-Maior Geral; ( ) Comandantes das Unidades Operacionais de Área e Especializadas — regido pela precedência hierárquica e antiguidade no posto; ( ) CSM/Int, CSM/MB, CSM/Moto, CRESEP, CReed, CTT, CIMus, CEFD — regido pela precedência hierárquica e antiguidade no posto; ( ) Comandante-Geral; ( ) DEAJA, ACG, CPA, CPL, CPO, CPP — regido pela precedência hierárquica e antiguidade no posto; ( ) APMP, CAS, CMH, CPM, COdonto, CFarm — regido pela precedência hierárquica e antiguidade no posto; ( ) Subcomandante-Geral.", modelo: {
    estrutura: "Cúpula do Comando (Cmt-Geral → SCmt-Geral → Ch EMG) → diretorias gerais → seções do EMG e diretorias → estabelecimentos de ensino/saúde → assessorias e corregedoria → unidades operacionais → centros e serviços.",
    criterios: [
      "1 — Comandante-Geral",
      "2 — Subcomandante-Geral",
      "3 — Chefe do Estado-Maior Geral",
      "4 — Diretor Geral de Administração e Diretor de Planejamento Operacional",
      "5 — 1ª EMG a 8ª EMG, DIM, DIRESP, DINTER I e II, DF, DEIP, DASDH, DAL, DGP, DS, DTec, DASIS, AG",
      "6 — APMP, CAS, CMH, CPM, COdonto, CFarm",
      "7 — DEAJA, ACG, CPA, CPL, CPO, CPP",
      "8 — Comandantes das Unidades Operacionais de Área e Especializadas",
      "9 — CSM/Int, CSM/MB, CSM/Moto, CRESEP, CReed, CTT, CIMus, CEFD",
    ],
    resposta: "A ordem de precedência, da maior para a menor, é: (1) Comandante-Geral; (2) Subcomandante-Geral; (3) Chefe do Estado-Maior Geral; (4) Diretor Geral de Administração e Diretor de Planejamento Operacional; (5) 1ª EMG a 8ª EMG, DIM, DIRESP, DINTER I e II, DF, DEIP, DASDH, DAL, DGP, DS, DTec, DASIS e AG; (6) APMP, CAS, CMH, CPM, COdonto e CFarm; (7) DEAJA, ACG, CPA, CPL, CPO e CPP; (8) Comandantes das Unidades Operacionais de Área e Especializadas; e (9) CSM/Int, CSM/MB, CSM/Moto, CRESEP, CReed, CTT, CIMus e CEFD. Nos grupos indicados, a ordem interna é regida pela precedência hierárquica e pela antiguidade no posto.",
  } },
]

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MAT } })
  if (!disc) throw new Error(`Disciplina ${MAT} não existe.`)

  let c = 0, u = 0
  for (const q of QS) {
    const hash = createHash("sha1").update(`${MAT}|${MOD}|${q.enunciado}`).digest("hex")
    const base: any = { materia: MAT, modulo: MOD, tipo: q.tipo, enunciado: q.enunciado, hash, fonte: FONTE }
    if (q.tipo === "multipla") { base.alternativas = q.alternativas; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else if (q.tipo === "certo_errado") { base.alternativas = []; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else { base.alternativas = []; base.gabarito = ""; base.modelo = q.modelo }
    const exists = await prisma.questao.findUnique({ where: { hash } })
    await prisma.questao.upsert({ where: { hash }, update: base, create: base })
    exists ? u++ : c++
  }
  const tot = await prisma.questao.count({ where: { materia: MAT, modulo: MOD } })
  console.log(`IG ${MOD}: ${c} criadas, ${u} atualizadas. Módulo "${MOD}": ${tot} questões.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
