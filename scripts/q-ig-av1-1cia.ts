import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const MAT = "IG"
const MOD = "AV1 2026 · 1ª CIA" // 1ª Avaliação Escrita de Instrução Geral — CFO PMPE 2026, 1ª Companhia (10/02/2026)
const FONTE = "1ª AE de Instrução Geral — CFO PMPE 2026 (1ª CIA)"
const REF = ` (${FONTE})`

type Alt = { id: string; texto: string }
type Q =
  | { tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string }
  | { tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string }
  | { tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string } }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const QS: Q[] = [
  // ───── 1º QUESITO (V/F — 1,0 pt · 0,20 cada) — Generalidades dos sinais de respeito (Portaria GM-MD nº 1.143/2022) ─────
  { tipo: "certo_errado", enunciado: "Ainda quanto às generalidades relativas aos sinais de respeito (Portaria GM-MD nº 1.143/2022): para falar a um superior, o militar nem sempre emprega o tratamento 'Senhor' ou 'Senhora'.", gabarito: "errado", explicacao: "FALSO. Para falar a um superior o militar emprega SEMPRE o tratamento 'Senhor' ou 'Senhora' — não há hipótese de dispensa. O termo 'Comando' é gíria e não constitui tratamento regulamentar." + REF },
  { tipo: "certo_errado", enunciado: "Quando os militares se deslocam em grupo, o mais antigo fica no centro, distribuindo-se os demais, segundo suas precedências, alternadamente à esquerda e à direita do mais antigo.", gabarito: "errado", explicacao: "FALSO. A ordem está invertida: os demais distribuem-se alternadamente à DIREITA e à ESQUERDA do mais antigo — a direita é o lugar de honra e cabe ao mais antigo dos que ladeiam." + REF },
  { tipo: "certo_errado", enunciado: "Se o deslocamento se fizer em via que tenha lado interno e lado externo, o menor antiguidade dá o lado externo ao superior.", gabarito: "errado", explicacao: "FALSO. Em via com lado interno e externo, o mais moderno dá ao superior o lado INTERNO (o mais protegido), ficando ele próprio pelo lado externo." + REF },
  { tipo: "certo_errado", enunciado: "Sempre que um militar precisar sentar-se ao lado de um superior basta sentar de forma silenciosa.", gabarito: "errado", explicacao: "FALSO. Não basta o silêncio: o militar deve solicitar licença/autorização ao superior antes de sentar-se ao seu lado." + REF },
  { tipo: "certo_errado", enunciado: "Todo militar, quando for chamado por um superior, deve atendê-lo o mais rápido possível, apressando o passo quando em deslocamento.", gabarito: "certo", explicacao: "VERDADEIRO. O atendimento ao chamado do superior é imediato, apressando-se o passo quando o militar estiver em deslocamento." + REF },

  // ───── 2º QUESITO (V/F — 1,0 pt · 0,20 cada) — Apresentação individual e continência de tropa ─────
  { tipo: "certo_errado", enunciado: "A continência de uma tropa para outra está relacionada à situação de conduzirem ou não a Bandeira Nacional ou ao grau hierárquico dos respectivos Comandantes.", gabarito: "certo", explicacao: "VERDADEIRO. São exatamente esses os dois critérios: a presença da Bandeira Nacional em uma das tropas e, na ausência dela, o grau hierárquico dos comandantes." + REF },
  { tipo: "certo_errado", enunciado: "Em locais cobertos, o militar armado para se apresentar ao superior toma a posição de 'Ombro-Arma'.", gabarito: "certo", explicacao: "VERDADEIRO. Em local coberto o militar armado apresenta-se na posição de 'Ombro-Arma'." + REF },
  { tipo: "certo_errado", enunciado: "O militar na apresentação individual toma a posição de sentido, faz a continência individual e diz, em voz claramente audível, o seu grau hierárquico, seu nome de guerra, desfaz a continência e diz a sua função ou Unidade a que pertence, bem como o motivo da apresentação.", gabarito: "errado", explicacao: "FALSO. A continência não é desfeita no meio da apresentação: o militar toma sentido, faz a continência e declara o grau hierárquico, o nome de guerra e a OM (ou função) — desfazendo a continência somente depois de retribuída pelo superior, quando então expõe o motivo da apresentação." + REF },
  { tipo: "certo_errado", enunciado: "Na continência de Tropa em Desfile, os Comandantes de Pelotão a dez passos aquém do homenageado, comanda em continência à direita.", gabarito: "errado", explicacao: "FALSO. No DESFILE a continência não é comandada por contagem de passos, e sim nas BALIZAS previamente fixadas no percurso (branca, azul e vermelha). A distância de dez passos (pelotão/seção) e de vinte passos (subunidade) é a regra da continência da tropa em deslocamento comum, não do desfile." + REF },
  { tipo: "certo_errado", enunciado: "Os comandantes de Unidade e Subunidade perfilam espada dez passos depois do homenageado.", gabarito: "certo", explicacao: "VERDADEIRO. Após ultrapassar o palanque, os comandantes de Unidade e de Subunidade desfazem a continência perfilando a espada dez passos além do homenageado." + REF },

  // ───── 3º QUESITO (V/F — 1,0 pt · 0,20 cada) — Continência: restrições noturnas, tropa a pé firme e em deslocamento ─────
  { tipo: "certo_errado", enunciado: "No período compreendido entre o arriar da Bandeira e o toque de alvorada no dia seguinte, a tropa apenas presta continência à Bandeira Nacional, ao Hino Nacional, ao Presidente da República, às bandeiras e hinos de outras nações e a outra tropa.", gabarito: "certo", explicacao: "VERDADEIRO. Entre o arriar da Bandeira e a alvorada do dia seguinte a continência da tropa fica restrita a esse rol." + REF },
  { tipo: "certo_errado", enunciado: "As guardas de honra prestam continência à autoridade a que a homenagem se destina, ainda que compreendido entre o arriar da Bandeira e o toque de alvorada no dia seguinte.", gabarito: "certo", explicacao: "VERDADEIRO. A guarda de honra é exceção à restrição noturna: presta a continência à autoridade homenageada em qualquer horário, pois a homenagem é o próprio motivo de sua formatura." + REF },
  { tipo: "certo_errado", enunciado: "Uma tropa a pé firme presta continência aos símbolos, às autoridades e a outra tropa formada. A continência a oficial subalterno e intermediário é dada apenas com o comando de 'Sentido!'.", gabarito: "certo", explicacao: "VERDADEIRO. Tropa a pé firme: a oficial subalterno e intermediário — 'Sentido!'; a oficial-superior — 'Sentido! Ombro-Arma!'; aos símbolos, oficiais-generais e autoridades dos incisos I a VIII do art. 16 — 'Sentido! Ombro-Arma! Apresentar-Arma! Olhar à Direita (Esquerda)!'." + REF },
  { tipo: "certo_errado", enunciado: "A tropa em deslocamento no passo acelerado ou sem cadência faz continência a outra tropa formada, ao comando de 'Batalhão (Companhia, Pelotão, Seção) Sentido!', dado pelos respectivos comandantes.", gabarito: "errado", explicacao: "FALSO. Em deslocamento no passo acelerado ou sem cadência a tropa não presta a continência coletiva a outra tropa formada nesses termos — a saudação é trocada entre os comandantes, que prestam a continência individual. O comando 'Sentido!' é próprio da tropa a pé firme." + REF },
  { tipo: "certo_errado", enunciado: "Quando um oficial entra em um alojamento ou vestiário ocupado por tropa, o militar de serviço ou o que primeiro avistar aquela autoridade comanda 'Alojamento (Vestiário) — Atenção! Comandante da Companhia (ou função de quem chega)!'. As praças, sem interromperem suas atividades, no mesmo local em que se encontram, suspendem toda a conversação e assim se conservam até ser comandado 'À vontade!'.", gabarito: "certo", explicacao: "VERDADEIRO. Em alojamento/vestiário não se interrompe a atividade nem se forma: apenas cessa a conversação, no mesmo local, até o comando 'À vontade!'." + REF },

  // ───── 4º QUESITO (0,5 pt) — Elementos essenciais da continência individual ─────
  { tipo: "multipla", enunciado: "Marque a alternativa que corresponde à resposta CORRETA quanto aos elementos essenciais da continência individual.", alternativas: A(
    "Movimento, duração e postura.",
    "Gesto, marcialidade e duração.",
    "Postura, gesto e duração.",
    "Atitude, duração e gesto.",
    "Tempo, movimento e atitude."),
    gabarito: "D", explicacao: "Gabarito 'D'. São três os elementos essenciais: ATITUDE (a postura marcial do militar), GESTO (o movimento do corpo, dos braços e das mãos) e DURAÇÃO (o tempo em que a continência é mantida). 'Marcialidade', 'movimento' e 'postura' isolados são distratores." + REF },

  // ───── 5º QUESITO (0,5 pt) — Estudos da Instrução Geral ─────
  { tipo: "multipla", enunciado: "Sobre os estudos da Instrução Geral, marque a alternativa CORRETA.", alternativas: A(
    "O Oficial que exerce função do posto superior ao seu não tem direito à continência desse posto em outras Organizações Militares, apenas onde exerce suas atividades e nas que lhe são subordinadas.",
    "Durante os desfiles, a Bandeira Nacional é desfraldada ao comando 'abater estandartes'.",
    "Os oficiais da reserva têm direito à continência da tropa quando estiverem uniformizados ou não.",
    "A Bandeira que invoque especialmente um fato notável da história de uma Organização Militar, que forem julgadas inservíveis, devem ser guardadas para proceder-se, no dia 19 de novembro, perante a tropa, à cerimônia cívica de sua incineração.",
    "De acordo com a Portaria GM-MD nº 1.143, de 3 de março de 2022, todo militar, em decorrência de sua condição, obrigações, deveres, direitos e prerrogativas, estabelecidos em toda a legislação militar, deve tratar sempre com respeito e consideração os seus superiores hierárquicos, como tributo à pessoa que se encontra investido por lei; com afeição e camaradagem os seus pares; e com bondade, dignidade e urbanidade os seus subordinados."),
    gabarito: "A", explicacao: "Gabarito 'A'. A continência do posto cuja função exerce é devida apenas na OM em que exerce a função e nas que lhe são subordinadas. Erros das demais: (B) nos desfiles a Bandeira é desfraldada no 'Apresentar-Arma'/'Olhar à Direita', e não ao 'abater estandartes'; (C) o oficial da reserva só tem direito à continência quando UNIFORMIZADO; (D) a Bandeira que invoca fato notável da história da OM é conservada como relíquia — não vai à incineração; (E) o tributo é prestado à AUTORIDADE de que o superior se encontra investido por lei, e não 'à pessoa'." + REF },

  // ───── 6º QUESITO (0,5 pt) — Todas corretas, EXCETO ─────
  { tipo: "multipla", enunciado: "Todas as afirmativas estão corretas, EXCETO:", alternativas: A(
    "Se várias Organizações Militares tiverem sede em um mesmo edifício, no mastro desse edifício só é hasteada a bandeira-insígnia ou distintivo da mais alta autoridade presente.",
    "O militar armado de espada desembainhada faz a continência individual tomando a posição de sentido e, em seguida, perfilando a espada.",
    "As demonstrações de respeito, cordialidade e consideração, devidas entre os membros das Forças Armadas, também o são aos integrantes das Polícias Militares, dos Corpos de Bombeiros Militares e aos Militares das Nações Estrangeiras.",
    "O aperto de mão é uma forma de cumprimento que o superior pode conceder ao mais moderno.",
    "O militar isolado, com cobertura, armado de metralhadora de mão, fuzil ou arma semelhante faz continência individual com movimento enérgico, leva a mão direita ao lado da cobertura, tocando com a falangeta do indicador a borda da pala, com a mão no prolongamento do antebraço, com a palma voltada para o rosto e com os dedos unidos e distendidos; o braço sensivelmente horizontal, formando um ângulo de 45° com a linha dos ombros; e olhar franco e naturalmente voltado para o superior e, para desfazer a continência, baixa a mão em movimento enérgico, voltando à posição de sentido."),
    gabarito: "E", explicacao: "A INCORRETA é a 'E'. O militar armado de metralhadora de mão, fuzil ou arma semelhante (arma a tiracolo/bandoleira) NÃO leva a mão à cobertura: presta a continência tomando apenas a posição de sentido, com o olhar voltado para o superior. A descrição da alternativa é a da continência do militar com cobertura e DESARMADO." + REF },

  // ───── 7º QUESITO (0,5 pt) — Destino das cinzas na incineração de Bandeiras ─────
  { tipo: "multipla", enunciado: "Após o cerimonial da incineração de Bandeiras, como são guardadas as cinzas?", alternativas: A(
    "As cinzas são depositadas em caixa e enterradas em local apropriado, no interior das respectivas Organizações Militares ou lançadas ao mar.",
    "As cinzas são depositadas em jarro de louça e enterradas em local apropriado, fora das respectivas Organizações Militares ou lançadas ao mar.",
    "As cinzas são lançadas em local próprio no interior das respectivas Organizações Militares ou ao mar.",
    "As cinzas são depositadas em um jarro de louça e enterradas em local apropriado, no inferior das respectivas Organizações Militares ou lançadas ao mar.",
    "As cinzas são depositadas em caixa de louça e enterradas em local apropriado, no fora das respectivas Organizações Militares ou lançadas ao mar."),
    gabarito: "A", explicacao: "Gabarito 'A'. As cinzas são depositadas em CAIXA e enterradas em local apropriado NO INTERIOR da OM, ou lançadas ao mar. As demais trocam a caixa por 'jarro de louça', ou deslocam o local para fora da OM." + REF },

  // ───── 8º QUESITO (1,5 pt) — Postos das Forças Armadas (círculo hierárquico) ─────
  { tipo: "dissertativa", enunciado: "Complete os postos das Forças Armadas que estão faltando no quadro de insígnias (Marinha, Exército e Aeronáutica), correspondentes aos seus respectivos números de 1 a 10.", modelo: {
    estrutura: "Identificar o círculo hierárquico (oficiais-generais, superiores, intermediários e subalternos) e, em cada Força, completar o posto na sequência decrescente de antiguidade.",
    criterios: [
      "Oficiais-generais da Marinha: Almirante → Almirante-de-Esquadra (10) → Vice-Almirante → Contra-Almirante (7)",
      "Oficiais-generais do Exército: Marechal → General-de-Exército → General-de-Divisão (8) → General-de-Brigada (6)",
      "Oficiais-generais da Aeronáutica: Marechal-do-Ar → Tenente-Brigadeiro (9) → Major-Brigadeiro → Brigadeiro",
      "Oficiais superiores: Capitão-de-Mar-e-Guerra (5) na Marinha e Coronel (4) na Aeronáutica",
      "Oficial intermediário da Marinha: Capitão-Tenente (3)",
      "Oficiais subalternos: Guarda-Marinha (1) na Marinha e Primeiro-Tenente (2) na Aeronáutica",
    ],
    resposta: "(1) Guarda-Marinha; (2) Primeiro-Tenente; (3) Capitão-Tenente; (4) Coronel; (5) Capitão-de-Mar-e-Guerra; (6) General-de-Brigada; (7) Contra-Almirante; (8) General-de-Divisão; (9) Tenente-Brigadeiro; (10) Almirante-de-Esquadra.",
  } },

  // ───── 9º QUESITO (1,5 pt) — Visita a OME em que não serve ─────
  { tipo: "dissertativa", enunciado: "Considere que você é oficial subalterno em pleno gozo de férias na cidade do Rio de Janeiro e que escolheu visitar a sede do 37º BPM. Qual deve ser a sua conduta quando chegar naquela OME? (mín. 5 / máx. 10 linhas)", modelo: {
    estrutura: "Apresentação ao chegar → condução ao Cmt/Ch/Dir ou à autoridade designada → declaração dos motivos da visita → mesmo procedimento na saída.",
    criterios: [
      "Apresentar-se ao chegar à OME (apresentação individual: sentido, continência, grau hierárquico, nome de guerra e OM a que pertence)",
      "Ser conduzido, em princípio, ao Comandante, Chefe ou Diretor da OME, ou a outra autoridade designada para esse fim",
      "Informar os motivos que o levaram àquela OME",
      "Proceder da mesma forma por ocasião da sua saída",
      "Fundamento: art. 33 da Portaria GM-MD nº 1.143/2022 (slide 51 — Aulas 02 e 03)",
    ],
    resposta: "Ao chegar ao 37º BPM devo apresentar-me, fazendo a apresentação individual: tomar a posição de sentido, prestar a continência e declarar, em voz clara e audível, o meu grau hierárquico, o nome de guerra e a Organização Militar a que pertenço. Em princípio, serei conduzido ao Comandante, Chefe ou Diretor daquela OME — ou a outra autoridade designada para esse fim — a quem informarei os motivos que me levaram até ali, ainda que se trate de simples visita em período de férias. Por ocasião da saída devo proceder da mesma forma, apresentando-me novamente àquela autoridade para me despedir. É o que determina o art. 33 da Portaria GM-MD nº 1.143/2022, aplicável a todo militar que entra em OME na qual não serve.",
  } },

  // ───── 10º QUESITO (2,0 pt) — Comandos nas balizas do desfile ─────
  { tipo: "dissertativa", enunciado: "Considere que você é um oficial subalterno, armado com espada desembainhada, e está comandando um pelotão durante um desfile militar. Quais devem ser os comandos nas balizas fixadas no percurso do desfile, indicando ainda como você deverá proceder ao passar em frente ao palanque onde se encontra a autoridade homenageada? (mín. 5 / máx. 10 linhas)", modelo: {
    estrutura: "1ª baliza (branca) → 2ª baliza (azul) → 3ª baliza (vermelha) → passagem em frente ao palanque → balizas dos movimentos reversos.",
    criterios: [
      "Descrever a 1ª baliza (branca): comando de alerta/preparação da tropa — 'Pelotão — Sentido!'",
      "Descrever a 2ª baliza (azul): 'Ombro — Arma!', perfilando o comandante a espada",
      "Descrever a 3ª baliza (vermelha): 'Em continência à autoridade — Olhar à Direita!', abatendo o comandante a espada e voltando o olhar para o palanque",
      "Explicar a conduta do Cmt de Pelotão em frente ao palanque: mantém a continência (espada abatida) e o olhar na autoridade, conservando a cadência e o alinhamento da tropa",
      "Relatar as balizas dos movimentos reversos, após ultrapassar o palanque: 'Olhar à Frente!' (perfila a espada) e, em seguida, 'Descansar — Arma!'",
      "Fundamento: art. 61 e seguintes da Portaria GM-MD nº 1.143/2022 (slide 28 em diante — Aulas 04 e 05)",
    ],
    resposta: "No desfile os comandos são dados nas balizas previamente fixadas no percurso. Na 1ª baliza (branca) comando 'Pelotão — Sentido!', alertando e enquadrando a tropa. Na 2ª baliza (azul) comando 'Ombro — Arma!', executando o movimento correspondente e perfilando a minha espada. Na 3ª baliza (vermelha) comando 'Em continência à autoridade — Olhar à Direita!': a tropa volta a cabeça para o palanque e eu, como comandante armado de espada desembainhada, abato a espada e volto o olhar para a autoridade homenageada, mantendo essa posição durante toda a passagem em frente ao palanque, sem alterar a cadência nem o alinhamento. Ultrapassado o palanque, nas balizas dos movimentos reversos comando 'Olhar à Frente!', perfilando novamente a espada, e, na baliza seguinte, 'Descansar — Arma!', restabelecendo a marcha normal da tropa.",
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
