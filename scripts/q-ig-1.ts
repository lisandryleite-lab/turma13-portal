import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "IG" // Instrução Geral — 28 módulos (1:1 com o sumário da apostila CFO 2024). Padrão: 11 questões/módulo (7 V/F + 3 MC + 1 dissertativa).

type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string; fonte?: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string; fonte?: string }
  | { modulo: string; tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string }; fonte?: string }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const QS: Q[] = [
  // ════════════════════ MÓDULO 1 — Continência individual e sinais de respeito ════════════════════
  { modulo: "1", tipo: "certo_errado", fonte: "1ª AE IG/2025 (adaptada)", enunciado: "Todo militar deve tratar com respeito e camaradagem os seus superiores; com afeição e consideração os seus pares; e com bondade, dignidade e urbanidade os seus subordinados.", gabarito: "errado", explicacao: "Errado. O art. 3º inverte os termos: aos SUPERIORES → respeito e consideração; aos PARES → afeição e camaradagem; aos SUBORDINADOS → bondade, dignidade e urbanidade." },
  { modulo: "1", tipo: "certo_errado", enunciado: "As demonstrações de respeito devidas entre membros das Forças Armadas também o são aos integrantes das PM, dos CBM e aos militares de Nações Estrangeiras.", gabarito: "certo", explicacao: "Correto (art. 3º, §2º). Há reciprocidade obrigatória de tratamento e sinais de respeito entre militares federais, estaduais e estrangeiros." },
  { modulo: "1", tipo: "certo_errado", fonte: "1ª AE IG/2025", enunciado: "Os sinais de respeito e apreço são obrigatórios em todas as situações.", gabarito: "certo", explicacao: "Correto (art. 4º, §3º). A continência, porém, é apenas uma das formas e PODE ser dispensada conforme a situação." },
  { modulo: "1", tipo: "certo_errado", fonte: "1ª AE IG/2025 (adaptada)", enunciado: "Quando dois militares se deslocam juntos, o de menor antiguidade fica à direita do superior.", gabarito: "errado", explicacao: "Errado. O de menor antiguidade DÁ a direita ao superior (art. 5º); em via com lado interno/externo, dá o lado interno." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Quando os militares se deslocam em grupo (três ou mais), o mais antigo fica no centro, distribuindo-se os demais alternadamente à direita e à esquerda.", gabarito: "certo", explicacao: "Correto (art. 6º)." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Para falar a um superior, o militar emprega sempre o tratamento 'Senhor' ou 'Senhora'; o termo 'Comando' não é tratamento regulamentar.", gabarito: "certo", explicacao: "Correto (art. 9º). 'Comando' é gíria e não constitui sinal de respeito." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A continência é uma saudação pessoal, dirigida à pessoa do superior, e não à autoridade investida na função.", gabarito: "errado", explicacao: "Errado. A continência tornou-se um gesto IMPESSOAL: homenageia a autoridade/função, e não a pessoa." },
  { modulo: "1", tipo: "multipla", fonte: "1ª AE IG/2025 (adaptada)", enunciado: "Quanto ao procedimento da continência individual, assinale a alternativa INCORRETA:", alternativas: A(
    "Com a arma a tiracolo ou em bandoleira, ergue-se a mão direita ao lado da cabeça em continência.",
    "A continência é feita quando o superior atinge três passos do mais moderno e desfeita quando o ultrapassa um passo.",
    "Posição de sentido, com a frente voltada para a direção perpendicular à do deslocamento do superior.",
    "Olhar franco e naturalmente voltado para o superior; ao desfazer, baixa a mão em movimento enérgico.",
    "Com cobertura, leva a mão direita ao lado da cobertura, tocando a falangeta do indicador à borda da pala."),
    gabarito: "A", explicacao: "A INCORRETA é 'A': com arma a tiracolo/bandoleira NÃO se ergue a mão — toma-se apenas a posição de sentido." },
  { modulo: "1", tipo: "multipla", enunciado: "São elementos essenciais da continência individual:", alternativas: A(
    "atitude, gesto e duração", "postura, saudação e voz", "garbo, gesto e cobertura", "atitude, voz e marcialidade", "gesto, deslocamento e duração"),
    gabarito: "A", explicacao: "Atitude (postura marcial), gesto (movimento de corpo, braços e mãos) e duração (tempo)." },
  { modulo: "1", tipo: "multipla", enunciado: "Com a espada desembainhada, para prestar continência a oficiais-generais o militar:", alternativas: A(
    "toma sentido, perfila a espada (ombro-arma) e abate a espada (apresentar-arma)",
    "apenas perfila a espada (ombro-arma)",
    "mantém a espada embainhada",
    "ergue a mão esquerda",
    "executa meia-volta"),
    gabarito: "A", explicacao: "Sentido → ombro-arma → abate a espada (apresentar-arma) para Of-Gen e autoridades dos incisos I a VIII e XII do art. 16." },
  { modulo: "1", tipo: "dissertativa", enunciado: "Diferencie 'sinais de respeito' de 'continência' quanto à obrigatoriedade e cite dois exemplos de sinais de respeito distintos da continência.", modelo: { estrutura: "Conceito → obrigatoriedade (sinais sempre × continência dispensável) → exemplos.", criterios: ["Sinais de respeito obrigatórios em todas as situações", "Continência pode ser dispensada", "Dois exemplos (ceder a direita/lado interno, franquear/abrir a porta, ceder o melhor lugar, tratamento 'Senhor')"], resposta: "Os sinais de respeito são obrigatórios em todas as situações (art. 4º, §3º); a continência é apenas uma de suas formas e pode ser dispensada conforme a situação. São exemplos de sinais de respeito diversos da continência: ceder a direita (ou o lado interno) ao superior no deslocamento; franquear e abrir a porta ao mais antigo; ceder-lhe o melhor lugar; e empregar sempre o tratamento 'Senhor'/'Senhora'." } },

  // ════════════════════ MÓDULO 2 — Apresentação individual e continência da tropa ════════════════════
  { modulo: "2", tipo: "certo_errado", enunciado: "Na apresentação individual, o militar aproxima-se do superior até a distância do aperto de mão, toma sentido, faz a continência e diz seu grau hierárquico, nome de guerra e OM (ou função).", gabarito: "certo", explicacao: "Correto. É a sequência regulamentar da apresentação individual." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Para se retirar da presença de um superior, a praça, depois de fazer 'Meia Volta', rompe a marcha com o pé direito.", gabarito: "errado", explicacao: "Errado. A praça rompe a marcha com o pé ESQUERDO, após fazer 'Meia Volta'." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Para efeito de continência, considera-se tropa a reunião de dois ou mais militares devidamente comandados.", gabarito: "certo", explicacao: "Correto. Na prática, o efetivo mínimo é 3 (um comanda e dois compõem)." },
  { modulo: "2", tipo: "certo_errado", fonte: "1ª AE IG/2025", enunciado: "À passagem de outra tropa, quando os Comandantes forem do mesmo posto e a tropa que passa não conduz Bandeira, apenas os Comandantes fazem a continência.", gabarito: "certo", explicacao: "Correto. Mesmo posto e sem Bandeira na tropa que passa → só os Comandantes prestam continência." },
  { modulo: "2", tipo: "certo_errado", fonte: "1ª AE IG/2025", enunciado: "No caso de tropa desarmada, ao comando de 'Apresentar Arma!' todos os integrantes fazem continência individual e a desfazem ao comando de 'Descansar Arma!'.", gabarito: "certo", explicacao: "Correto. Regra da tropa desarmada." },
  { modulo: "2", tipo: "certo_errado", fonte: "1ª AE IG/2025 (adaptada)", enunciado: "Se o Comandante da tropa que passa for oficial-superior, a tropa em forma e parada presta continência executando apenas 'Sentido!'.", gabarito: "errado", explicacao: "Errado. Para oficial-superior o comando é 'Sentido! Ombro Arma!'. Apenas 'Sentido!' é para subalterno/intermediário." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Se apenas uma das duas tropas conduz a Bandeira Nacional, a continência é prestada à Bandeira, independentemente da hierarquia dos comandantes (art. 58).", gabarito: "certo", explicacao: "Correto. A presença da Bandeira torna a continência devida a ela." },
  { modulo: "2", tipo: "multipla", enunciado: "À passagem de tropa que conduz a Bandeira, na continência aos oficiais-generais (incisos I a VIII do art. 16), a tropa em forma executa:", alternativas: A(
    "Sentido! Ombro Arma! Apresentar Arma! Olhar à Direita (Esquerda)!",
    "Sentido!",
    "Sentido! Ombro Arma!",
    "Apresentar Arma! Descansar Arma!",
    "Sentido! Olhar à Direita!"),
    gabarito: "A", explicacao: "Sequência completa para Of-Gen e incisos I a VIII: Sentido! Ombro Arma! Apresentar Arma! Olhar à Direita!" },
  { modulo: "2", tipo: "multipla", enunciado: "Na continência da tropa em deslocamento, os comandantes de subunidade dão a voz de continência ao atingirem a distância de:", alternativas: A(
    "vinte passos da autoridade ou da Bandeira", "dez passos", "cinco passos", "trinta passos", "cinquenta passos"),
    gabarito: "A", explicacao: "Subunidades: 20 passos; pelotão/seção: 10 passos." },
  { modulo: "2", tipo: "multipla", enunciado: "Na apresentação individual, após dizer grau, nome de guerra e OM, o militar:", alternativas: A(
    "desfaz a continência e diz o motivo, permanecendo em sentido até autorização de 'Descansar' ou 'À Vontade'",
    "assume imediatamente a posição de descansar",
    "retira-se sem pedir permissão",
    "permanece com a mão na cobertura durante toda a conversa",
    "senta-se ao lado do superior"),
    gabarito: "A", explicacao: "Mantém a posição de sentido até ser autorizado a 'Descansar'/'À Vontade'." },
  { modulo: "2", tipo: "dissertativa", enunciado: "Descreva os comandos de continência da tropa a pé firme à passagem de tropa que conduz a Bandeira, conforme o grau hierárquico da autoridade.", modelo: { estrutura: "Subalterno/intermediário → superior → Of-Gen/incisos I-VIII.", criterios: ["Subalterno/intermediário: 'Sentido!'", "Oficial-superior: 'Sentido! Ombro Arma!'", "Of-Gen / incisos I-VIII: 'Sentido! Ombro Arma! Apresentar Arma! Olhar à Direita!'", "Tropa desarmada: continência individual ao 'Apresentar Arma!'"], resposta: "A continência a oficial subalterno e intermediário é 'Sentido!'; a oficial-superior, 'Sentido! Ombro Arma!'; e aos símbolos e autoridades dos incisos I a VIII do art. 16, aos oficiais-generais ou equivalentes, 'Sentido! Ombro Arma! Apresentar Arma! Olhar à Direita (Esquerda)!'. No caso de tropa desarmada, ao comando 'Apresentar Arma!' todos fazem continência individual, desfazendo-a ao 'Descansar Arma!'." } },

  // ════════════════════ MÓDULO 3 — Culto à Bandeira e hasteamento ════════════════════
  { modulo: "3", tipo: "certo_errado", enunciado: "No Dia da Bandeira (19 de novembro), o hasteamento da Bandeira Nacional ocorre em ato solene às doze horas.", gabarito: "certo", explicacao: "Correto. O cerimonial prevê o hasteamento às 12h." },
  { modulo: "3", tipo: "certo_errado", enunciado: "No culto à Bandeira, após o hasteamento, canta-se o Hino Nacional e, se for o caso, há incineração de Bandeiras.", gabarito: "errado", explicacao: "Errado. Canta-se o Hino À BANDEIRA (não o Hino Nacional); o desfile é em continência à Bandeira Nacional." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Na incineração de Bandeiras inservíveis, as cinzas são depositadas em caixa e enterradas em local apropriado, ou lançadas ao mar.", gabarito: "certo", explicacao: "Correto, conforme o parágrafo único do cerimonial de incineração." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Quem ateia fogo às Bandeiras inservíveis, embebidas em álcool, é, em princípio, uma praça antiga e de ótimo comportamento.", gabarito: "certo", explicacao: "Correto. A praça é antecipadamente escolhida, em princípio a mais antiga e de ótimo comportamento." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Na vigência de Luto Nacional, a tropa não canta hinos ou canções militares e a Bandeira Nacional é mantida a meio-mastro.", gabarito: "certo", explicacao: "Correto. Em luto, sem hinos/canções e Bandeira a meio-mastro; usa-se laço de crepe negro na lança quando transportada por tropa." },
  { modulo: "3", tipo: "certo_errado", enunciado: "No hasteamento em luto, a Bandeira sobe diretamente até o meio-mastro, sem ir ao topo.", gabarito: "errado", explicacao: "Errado. No hasteamento a Bandeira é conduzida ao TOPO e, em seguida, desce a meio-mastro." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Na arriação em luto, a Bandeira sobe novamente ao topo do mastro e, em seguida, é arriada.", gabarito: "certo", explicacao: "Correto. Arriação: sobe ao topo e depois desce." },
  { modulo: "3", tipo: "multipla", fonte: "1ª AE IG/2025 (corrigida)", enunciado: "Sobre o 'Culto à Bandeira' (19 de novembro), assinale a alternativa CORRETA:", alternativas: A(
    "A Bandeira Nacional da OM, sem guarda, deve ser postada em local de destaque, em frente ao mastro onde se realiza a solenidade.",
    "Hasteamento da Bandeira Nacional, em ato solene às oito horas.",
    "Hasteamento da Bandeira Nacional, em ato solene às dez horas.",
    "Canto do Hino Nacional e, se for o caso, incineração de Bandeiras.",
    "Desfile em continência à maior autoridade militar presente."),
    gabarito: "A", explicacao: "O hasteamento é às 12h (não 8h nem 10h); canta-se o Hino à Bandeira (não o Nacional); e o desfile é em continência à Bandeira. Correta: 'A'." },
  { modulo: "3", tipo: "multipla", enunciado: "No hasteamento em luto, a sequência correta é:", alternativas: A(
    "sobe ao topo e depois desce a meio-mastro",
    "sobe direto a meio-mastro",
    "permanece sempre no topo",
    "desce ao solo e depois sobe a meio-mastro",
    "não é hasteada durante o luto"),
    gabarito: "A", explicacao: "Hasteamento em luto: topo → meio-mastro. Na arriação: topo → arriada." },
  { modulo: "3", tipo: "multipla", enunciado: "O cerimonial do Dia da Bandeira (19/nov) compreende, em ordem:", alternativas: A(
    "hasteamento às 12h; canto do Hino à Bandeira e, se for o caso, incineração; desfile em continência à Bandeira",
    "missa campal; desfile; hasteamento",
    "hasteamento às 8h; Hino Nacional; revista da tropa",
    "incineração; arriação; pronunciamentos",
    "desfile; hasteamento; canto do Hino Nacional"),
    gabarito: "A", explicacao: "É a sequência regulamentar do culto à Bandeira." },
  { modulo: "3", tipo: "dissertativa", fonte: "1ª AE IG/2025", enunciado: "Descreva como deve ser realizado o cerimonial de incineração de Bandeiras Nacionais inservíveis (mín. 5 / máx. 10 linhas).", modelo: { estrutura: "Pira junto ao mastro → leitura da Ordem do Dia → praça antiga ateia fogo → Hino à Bandeira → destino das cinzas.", criterios: ["Pira/recipiente de metal próximo ao mastro", "Leitura da Ordem do Dia alusiva à data", "Praça antiga e de ótimo comportamento ateia fogo às Bandeiras embebidas em álcool", "Canto do Hino à Bandeira com a tropa em sentido", "Cinzas em caixa, enterradas ou lançadas ao mar"], resposta: "Numa pira ou recipiente de metal, colocado nas proximidades do mastro do hasteamento, são depositadas as Bandeiras a serem incineradas. O Comandante faz ler a Ordem do Dia alusiva à data. Terminada a leitura, uma praça antecipadamente escolhida — em princípio a mais antiga e de ótimo comportamento — ateia fogo às Bandeiras, previamente embebidas em álcool. Incineradas, prossegue o cerimonial com o canto do Hino à Bandeira, regido pelo mestre da Banda, com a tropa em 'Sentido'. As cinzas são depositadas em caixa e enterradas em local apropriado no interior da OM ou lançadas ao mar." } },

  // ════════════════════ MÓDULO 4 — Bandeiras-insígnias e honras de recepção/despedida ════════════════════
  { modulo: "4", tipo: "certo_errado", enunciado: "A bandeira-insígnia ou distintivo é hasteada quando a autoridade entra na OM e arriada logo após a sua saída.", gabarito: "certo", explicacao: "Correto. Indica a presença da autoridade na OM." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Por ocasião do hasteamento ou arriação da Bandeira Nacional, a bandeira-insígnia deve ser arriada, sendo re-hasteada após o término.", gabarito: "certo", explicacao: "Correto. A insígnia cede lugar à Bandeira Nacional durante a solenidade." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Havendo várias OM no mesmo edifício, hasteia-se no mastro a insígnia de todas as autoridades presentes.", gabarito: "errado", explicacao: "Errado. Hasteia-se apenas a insígnia da MAIS ALTA autoridade presente." },
  { modulo: "4", tipo: "certo_errado", fonte: "1ª AE IG/2025 (adaptada)", enunciado: "As Honras de Recepção e Despedida são prestadas apenas quando a autoridade chega à Organização Militar.", gabarito: "errado", explicacao: "Errado. São prestadas na chegada e na saída, e por ocasião de visitas e inspeções." },
  { modulo: "4", tipo: "certo_errado", fonte: "1ª AE IG/2025 (corrigida)", enunciado: "A guarda do quartel forma em uma fileira, no interior do quartel, logo após o portão, com efetivo igual ou maior que 6 (seis) soldados.", gabarito: "certo", explicacao: "Correto. O efetivo é igual ou maior que 6 soldados (e não 5)." },
  { modulo: "4", tipo: "certo_errado", fonte: "1ª AE IG/2025", enunciado: "As visitas ou inspeções sem aviso prévio obrigam à imediata interrupção da rotina da OM.", gabarito: "errado", explicacao: "Errado. Visita sem aviso NÃO altera a rotina; o Cmt/Ch/Dir vai ao encontro, apresenta-se e a acompanha." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Na despedida, a autoridade e sua comitiva despedem-se, normalmente, do oficial mais moderno para o mais antigo.", gabarito: "certo", explicacao: "Correto, conforme o Vade-Mécum EB10-VM-12.003." },
  { modulo: "4", tipo: "multipla", enunciado: "A guarda do quartel, nas honras de recepção, forma com efetivo:", alternativas: A(
    "igual ou maior que 6 (seis) soldados, em uma fileira", "de exatamente 5 soldados", "de no mínimo 10 soldados", "de 3 soldados", "livre, a critério do Cmt da guarda"),
    gabarito: "A", explicacao: "Efetivo igual ou maior que 6 soldados, em uma fileira, no interior do quartel após o portão." },
  { modulo: "4", tipo: "multipla", enunciado: "Quando a visita à OM é sem aviso prévio, o correto é:", alternativas: A(
    "não alterar a rotina; o Cmt/Ch/Dir vai ao encontro da autoridade, apresenta-se e a acompanha",
    "interromper imediatamente toda a rotina e formar a tropa",
    "negar a entrada até autorização superior",
    "encaminhar a autoridade ao P4",
    "suspender o expediente do dia"),
    gabarito: "A", explicacao: "Visita sem aviso não altera a rotina de trabalho da OM." },
  { modulo: "4", tipo: "multipla", enunciado: "Sobre a bandeira-insígnia/distintivo, é correto afirmar:", alternativas: A(
    "é hasteada quando a autoridade entra e arriada após a sua saída; nunca acima da Bandeira Nacional",
    "fica permanentemente hasteada acima da Bandeira Nacional",
    "só é hasteada à noite",
    "é exclusiva de autoridades civis",
    "substitui a Bandeira Nacional no mastro principal"),
    gabarito: "A", explicacao: "Indica a presença da autoridade; nenhuma insígnia fica acima da Bandeira Nacional." },
  { modulo: "4", tipo: "dissertativa", enunciado: "Descreva o procedimento da guarda do quartel na recepção de uma autoridade que seja oficial-general.", modelo: { estrutura: "Guarda forma → Cmt comanda Sentido/Ombro-Arma → corneteiro toca indicativo → Apresentar-Arma/Olhar à Direita → exórdio → autoridade responde.", criterios: ["Guarda em uma fileira, efetivo ≥ 6 soldados", "Cmt da guarda comanda 'Guarda, Sentido! Ombro-Arma!'", "Corneteiro/clarim toca o indicativo do posto/função sem comando à voz", "Para Of-Gen: 'Apresentar-Arma! Olhar à Direita!' e execução do exórdio/marcha batida", "Autoridade responde à continência no início do exórdio"], resposta: "A guarda do quartel forma em uma fileira, com efetivo igual ou maior que 6 soldados. Ao ocupar o local de recebimento, o Cmt da guarda comanda 'Guarda, Sentido! Ombro-Arma!'. O corneteiro ou clarim toca o indicativo do posto e função da autoridade, sem comando à voz. Sendo Of-Gen ou Cmt-Geral, após o toque o Cmt da guarda comanda 'Apresentar-Arma! Olhar à Direita!', executando os movimentos com a guarda, seguindo-se o exórdio (ou marcha batida). A autoridade responde à continência no início do exórdio; a guarda só desfaz a continência depois que ela a ultrapassar." } },

  // ════════════════════ MÓDULO 5 — Guarda-Bandeira ════════════════════
  { modulo: "5", tipo: "certo_errado", enunciado: "A Guarda-Bandeira tem a missão de transportar e proteger o Pavilhão Nacional e os Estandartes.", gabarito: "certo", explicacao: "Correto. É a missão precípua da Guarda-Bandeira." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Em instruções e treinamentos deve-se utilizar a própria Bandeira Nacional.", gabarito: "errado", explicacao: "Errado. Em instruções/treinamentos usa-se o ESTANDARTE; a Bandeira Nacional não é empregada sem as formalidades legais." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Cada OM deve possuir, no mínimo, 2 (dois) exemplares da Bandeira Nacional.", gabarito: "certo", explicacao: "Correto. Uma é hasteada no mastro; a outra é usada em formaturas/desfiles, guardada em armário envidraçado no gabinete do Cmt." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A Guarda-Bandeira é constituída pelo Porta-Bandeira, pelo Porta-Estandarte (se houver) e por 5 ou 6 guardas, sendo 2 cabos e os demais soldados.", gabarito: "certo", explicacao: "Correto. Composição prevista no Vade-Mécum da Guarda-Bandeira (EB10-VM-12.004)." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A cadência oficial da Guarda-Bandeira, ao marchar, é de 116 passos por minuto.", gabarito: "errado", explicacao: "Errado. A cadência da Guarda-Bandeira é de 100 passos/min. (116 passos/min é a da revista na passagem de comando.)" },
  { modulo: "5", tipo: "certo_errado", enunciado: "Os oficiais Porta-Bandeira formam e desfilam de pistola e espada; os demais integrantes da Guarda, de fuzil com baioneta armada.", gabarito: "certo", explicacao: "Correto. Sargentos Porta-Estandarte: de pistola; demais: fuzil com baioneta." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A Bandeira Nacional é desfraldada quando a tropa faz 'Apresentar-Arma' e, em marcha, no 'Olhar à Direita'.", gabarito: "certo", explicacao: "Correto. E é sempre desfraldada na posição vertical." },
  { modulo: "5", tipo: "multipla", fonte: "1ª AE IG/2025 (adaptada)", enunciado: "Sobre os movimentos e o cerimonial da Guarda-Bandeira, assinale a alternativa CORRETA:", alternativas: A(
    "A cadência da Guarda-Bandeira, ao marchar, é de 100 passos por minuto.",
    "Toda a Guarda-Bandeira realiza o movimento de 'Apresentar-Arma' durante as cerimônias.",
    "A Bandeira é desfraldada no momento em que a tropa executa 'Ombro-Arma'.",
    "Em passagens de comando ao ar livre, a bandeira não é desfraldada.",
    "O Porta-Bandeira comanda 'Marcar-Passo' na cadência de 120 passos por minuto."),
    gabarito: "A", explicacao: "Cadência: 100 passos/min. Só Porta-Bandeira/Estandarte fazem 'Apresentar-Arma'; a Bandeira é desfraldada no 'Apresentar-Arma'; e é em recinto COBERTO que não se desfralda." },
  { modulo: "5", tipo: "multipla", enunciado: "A Guarda-Bandeira é constituída por:", alternativas: A(
    "Porta-Bandeira, Porta-Estandarte (se houver) e 5 ou 6 guardas (2 cabos e demais soldados)",
    "apenas o Porta-Bandeira e 2 soldados",
    "10 guardas, todos cabos",
    "Porta-Bandeira e toda a 1ª companhia",
    "3 oficiais e 3 sargentos"),
    gabarito: "A", explicacao: "Composição: Porta-Bandeira + Porta-Estandarte (se houver) + 5 ou 6 guardas, 2 cabos e os demais soldados." },
  { modulo: "5", tipo: "multipla", enunciado: "Os movimentos que a Guarda-Bandeira (exceto Porta-Bandeira/Estandarte) executa quando incorporada são:", alternativas: A(
    "Sentido, Descansar, Ombro-Arma, Descansar-Arma e Ordinário, Marche",
    "apenas Apresentar-Arma",
    "Sentido e Apresentar-Arma somente",
    "Meia-Volta e Apresentar-Arma",
    "todos os movimentos da tropa, inclusive Apresentar-Arma"),
    gabarito: "A", explicacao: "Apenas o Porta-Bandeira e o Porta-Estandarte executam também 'Apresentar-Arma'." },
  { modulo: "5", tipo: "dissertativa", fonte: "1ª AE IG/2025", enunciado: "Descreva, em linhas gerais, o procedimento de incorporação da Guarda-Bandeira à tropa.", modelo: { estrutura: "Cmt verifica prontidão → Sentido/Ombro-Arma/Bandeira Avançar → deslocamento a 30 passos → Em Continência à Bandeira/Apresentar-Arma → Hino Nacional → ocupa lugar.", criterios: ["Cmt comanda 'Sentido', 'Ombro-Arma', 'Bandeira, Avançar'", "Guarda desloca-se a ~30 passos do lugar na formatura", "'Em Continência à Bandeira – Apresentar-Arma' e desfralde do Pavilhão", "Banda executa o Hino Nacional", "Encerra com Ombro-Arma/Descansar-Arma/Descansar"], resposta: "Verificando que a Guarda-Bandeira está pronta, o Cmt da tropa comanda, a toque de corneta/clarim, 'Sentido', 'Ombro-Arma' e 'Bandeira, Avançar'. Ao som da Alvorada de 'Lo Schiavo' e depois da 'Canção do Expedicionário', a Guarda desloca-se na cadência de 100 passos/min, posicionando-se a cerca de 30 passos do lugar que ocupará na formatura. O Cmt comanda 'Em Continência à Bandeira – Apresentar-Arma': o Porta-Bandeira desfralda o Pavilhão e a banda executa o Hino Nacional. Ao final, a Guarda ocupa seu lugar no dispositivo e o Cmt encerra com 'Ombro-Arma', 'Descansar-Arma' e 'Descansar'." } },

  // ════════════════════ MÓDULO 6 — Compromisso e promoção ao primeiro posto ════════════════════
  { modulo: "6", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "O Compromisso ao primeiro posto será prestado em solenidade especialmente programada, perante a Bandeira Nacional.", gabarito: "certo", explicacao: "Correto. É prestado em solenidade especial, perante a Bandeira Nacional." },
  { modulo: "6", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "Os comprometentes, com olhos fitos na Bandeira Nacional, depois de perfilarem espadas, prestam o compromisso em voz alta e pausada.", gabarito: "errado", explicacao: "Errado. Após ABATEREM as espadas (não perfilarem) é que prestam o compromisso, com olhos fitos na Bandeira." },
  { modulo: "6", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "Se o oficial promovido servir em Estabelecimento ou Repartição, o compromisso é prestado no gabinete do diretor ou chefe, assistido por todos os oficiais que ali servem.", gabarito: "certo", explicacao: "Correto (art. 182 do Estatuto)." },
  { modulo: "6", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "O compromisso de declaração a Guarda-Marinha e Aspirante-a-Oficial é prestado nas Escolas de Formação.", gabarito: "certo", explicacao: "Correto (art. 183). O cerimonial segue os regulamentos dos respectivos órgãos de ensino." },
  { modulo: "6", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "Todo militar nomeado ao primeiro posto prestará o compromisso de oficial, de acordo com o regulamento de cada Força.", gabarito: "certo", explicacao: "Correto. A cerimônia é presidida pelo Cmt da OM ou pela mais alta autoridade militar presente." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A cerimônia de compromisso ao primeiro posto pode ser presidida por qualquer oficial subalterno presente.", gabarito: "errado", explicacao: "Errado. É presidida pelo COMANDANTE DA OM ou pela MAIS ALTA autoridade militar presente." },
  { modulo: "6", tipo: "certo_errado", enunciado: "No cerimonial do compromisso, a Bandeira Nacional fica à frente, a vinte passos do centro da tropa.", gabarito: "certo", explicacao: "Correto. O comandante posta-se diante do dispositivo, a cinco passos da Bandeira." },
  { modulo: "6", tipo: "multipla", enunciado: "Os dizeres do compromisso prestado pelo oficial ao ser promovido ao primeiro posto são:", alternativas: A(
    "'Perante a Bandeira do Brasil e pela minha honra prometo cumprir os deveres de oficial da Polícia Militar do Estado de Pernambuco e dedicar-me ao seu serviço.'",
    "'Prometo regular minha conduta pelos preceitos da moral e cumprir as ordens das autoridades.'",
    "'Ao ser declarado Aspirante-a-Oficial, assumo o compromisso de cumprir as ordens.'",
    "'Juro defender a Constituição e as leis do Estado de Pernambuco.'",
    "'Comprometo-me a servir à comunidade, mesmo com risco da própria vida.'"),
    gabarito: "A", explicacao: "É o texto do §2º do art. 32 do Estatuto dos Militares de PE (compromisso de oficial ao 1º posto)." },
  { modulo: "6", tipo: "multipla", enunciado: "A cerimônia de compromisso ao primeiro posto é presidida:", alternativas: A(
    "pelo Comandante da OM ou pela mais alta autoridade militar presente",
    "pelo oficial mais moderno",
    "pelo P1",
    "pelo Subcomandante, obrigatoriamente",
    "por autoridade civil convidada"),
    gabarito: "A", explicacao: "Cmt da OM ou a mais alta autoridade militar presente." },
  { modulo: "6", tipo: "multipla", enunciado: "No cerimonial do compromisso, a Bandeira Nacional posiciona-se:", alternativas: A(
    "à frente, a vinte passos do centro da tropa",
    "à retaguarda da tropa",
    "ao lado do comandante",
    "a cinco passos atrás dos comprometentes",
    "fora do dispositivo"),
    gabarito: "A", explicacao: "Bandeira à frente, a 20 passos do centro; o comandante a 5 passos dela." },
  { modulo: "6", tipo: "dissertativa", enunciado: "Descreva o cerimonial do compromisso ao primeiro posto, indicando o posicionamento da tropa, da Bandeira e dos comprometentes.", modelo: { estrutura: "Tropa armada/equipada → Bandeira à frente (20 passos) → comandante a 5 passos → comprometentes → sentido/desembainhar/perfilar → apresentar arma/continência → abater espadas/compromisso.", criterios: ["Tropa em linha de pelotões; Bandeira à frente a 20 passos do centro", "Comandante a 5 passos da Bandeira, voltado para ela", "Comprometentes a 5 passos da Bandeira, à esquerda e a 2 passos do comandante", "Sentido → desembainham e perfilam espadas; demais oficiais atrás da Bandeira", "Apresentar arma + continência do comandante; comprometentes abatem espadas e prestam o compromisso"], resposta: "A tropa forma armada e equipada, em linha de pelotões ou equivalentes, com a Bandeira Nacional à frente, a vinte passos do centro; o comandante posta-se diante do dispositivo, voltado para a Bandeira, a cinco passos desta. Os comprometentes, com a frente para a tropa e para a Bandeira, colocam-se a cinco passos desta, à esquerda e a dois passos do comandante. À ordem, a tropa toma 'Sentido' e os comprometentes desembainham e perfilam as espadas; os demais oficiais, a dois passos atrás da Bandeira, em duas fileiras e com espadas perfiladas, assistem. Em seguida, a tropa apresenta arma e o comandante faz a continência individual; os comprometentes, olhos fitos na Bandeira, abatem espadas e prestam, em voz alta e pausada, o compromisso." } },

  // ════════════════════ MÓDULO 7 — Solenidades e passagem de comando ════════════════════
  { modulo: "7", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "A entrega de condecorações, homenagens e apresentações culturais podem fazer parte de uma solenidade militar.", gabarito: "certo", explicacao: "Correto. Constam do roteiro básico de 12 pontos (ponto VII)." },
  { modulo: "7", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "A chegada da autoridade é considerada fora do roteiro de uma solenidade.", gabarito: "errado", explicacao: "Errado. A 'Chegada da Autoridade' é o ponto I do roteiro." },
  { modulo: "7", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "As Honras Militares, na solenidade, serão prestadas somente à maior autoridade (civil ou militar) presente.", gabarito: "certo", explicacao: "Correto. Maior precedência não equivale a direito às honras militares." },
  { modulo: "7", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "Ao final da solenidade, há necessidade de solicitar autorização para o seu encerramento.", gabarito: "certo", explicacao: "Correto. A maior autoridade militar da ativa pede permissão para iniciar e encerrar à autoridade de maior precedência." },
  { modulo: "7", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "Em uma solenidade militar, as pessoas podem aplaudir após a execução do Hino Nacional em todas as hipóteses.", gabarito: "errado", explicacao: "Errado. A assertiva é falsa no contexto do gabarito: não é em todas as hipóteses." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Os pronunciamentos, no roteiro da solenidade, seguem da maior para a menor autoridade.", gabarito: "errado", explicacao: "Errado. Os pronunciamentos vão da MENOR para a MAIOR autoridade (ponto VIII)." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A execução do Hino Nacional só tem início depois que todas as autoridades da mesa de honra tiverem ocupado seus lugares.", gabarito: "certo", explicacao: "Correto (ponto V do roteiro)." },
  { modulo: "7", tipo: "multipla", enunciado: "No roteiro básico da solenidade (SUNOR 20/2022), a ordem dos pronunciamentos é:", alternativas: A(
    "da menor para a maior autoridade", "da maior para a menor autoridade", "em ordem alfabética", "por sorteio", "somente a maior autoridade se pronuncia"),
    gabarito: "A", explicacao: "Pronunciamentos: da menor para a maior autoridade (ponto VIII)." },
  { modulo: "7", tipo: "multipla", enunciado: "Na revista à tropa durante a passagem de comando, o Comandante sucedido desloca-se:", alternativas: A(
    "à direita do sucessor, com a espada embainhada, simbolizando a missão cumprida",
    "à esquerda do sucessor, com a espada desembainhada",
    "à frente do sucessor, conduzindo a Bandeira",
    "atrás da autoridade que conduz o evento",
    "à direita do sucessor, com a espada perfilada"),
    gabarito: "A", explicacao: "Sucedido à direita do sucessor, espada embainhada; cadência de 116 passos/min." },
  { modulo: "7", tipo: "multipla", enunciado: "A revista à tropa, na passagem de comando, ocorre:", alternativas: A(
    "apenas nas passagens de comando de unidade e subunidade isolada",
    "em todas as passagens de comando",
    "somente nos grandes comandos",
    "apenas quando há banda de música",
    "nunca"),
    gabarito: "A", explicacao: "Restrita às passagens de comando de unidade e subunidade isolada." },
  { modulo: "7", tipo: "dissertativa", enunciado: "Diferencie 'passagem de comando' de 'transmissão do cargo' e cite três eventos que compõem a solenidade de passagem de comando.", modelo: { estrutura: "Conceitos → relação (transmissão é parte) → eventos.", criterios: ["Passagem de comando = cerimônia ampla; transmissão do cargo = parte dela", "Citar 3 eventos (chegada/continência, apresentação da tropa, exoneração, nomeação, transmissão, revista, desfile)"], resposta: "A passagem de comando é a cerimônia militar completa, constituída de vários eventos, entre os quais se destaca a transmissão do cargo, que é parte enquadrante da primeira. São eventos da solenidade, por exemplo: a chegada das autoridades e a continência à maior autoridade; a apresentação da tropa; a leitura da finalidade; a exoneração do Cmt sucedido (com palavras de despedida) e a nomeação do sucessor; o evento de transmissão do cargo; a revista da tropa (em unidade/subunidade isolada); e o desfile em continência ao Cmt sucessor." } },

  // ════════════════════ MÓDULO 8 — Honras fúnebres e condecorações ════════════════════
  { modulo: "8", tipo: "certo_errado", enunciado: "Honras Fúnebres são homenagens póstumas prestadas diretamente pela tropa aos despojos de alta autoridade ou de militar da ativa, conforme a posição hierárquica.", gabarito: "certo", explicacao: "Correto. Definição do Vade-Mécum de Honras Fúnebres (EB10-VM-12.009)." },
  { modulo: "8", tipo: "certo_errado", enunciado: "São três os tipos de Honras Fúnebres: Guarda Fúnebre, Escolta Fúnebre e Salvas Fúnebres.", gabarito: "certo", explicacao: "Correto. São os três tipos previstos." },
  { modulo: "8", tipo: "certo_errado", enunciado: "O ataúde, depois de fechado e até o início da inumação, é coberto com a Bandeira Nacional.", gabarito: "certo", explicacao: "Correto. Antes do sepultamento, a Bandeira é dobrada e entregue à família." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Por ocasião do sepultamento, ao descer o corpo à sepultura, executa-se o toque de silêncio por corneteiro ou clarim.", gabarito: "certo", explicacao: "Correto. É parte das homenagens póstumas no sepultamento." },
  { modulo: "8", tipo: "certo_errado", enunciado: "A composição da Guarda Fúnebre independe do posto ou graduação do falecido.", gabarito: "errado", explicacao: "Errado. A composição VARIA conforme o posto/graduação do falecido (de 1 batalhão para Of-Gen a 4 homens para cabos/soldados)." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Para um Oficial Superior, a Guarda Fúnebre é composta por duas companhias.", gabarito: "certo", explicacao: "Correto. Of-Gen/Cmt-Geral: 1 batalhão; Of. Superior: 2 companhias; Of. Intermediário: 1 companhia." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Para subtenentes e sargentos, a Guarda Fúnebre é composta por um grupo de combate (nove homens).", gabarito: "certo", explicacao: "Correto. Cabos/soldados: uma esquadra (quatro homens)." },
  { modulo: "8", tipo: "multipla", fonte: "2ª AE IG/2026", enunciado: "Em quantos graus o militar realiza o giro após o comando de 'PREPARAR!' na guarda fúnebre?", alternativas: A("45°", "90°", "60°", "75°", "30°"), gabarito: "A", explicacao: "Giro de 45 graus à direita, sobre a planta do pé esquerdo." },
  { modulo: "8", tipo: "multipla", enunciado: "Na composição da Guarda Fúnebre, o efetivo previsto para um Oficial Superior é:", alternativas: A("2 (duas) companhias", "1 (um) batalhão", "1 (uma) companhia", "1 (um) pelotão", "1 (um) grupo de combate"), gabarito: "A", explicacao: "Of-Gen/Cmt-Geral: 1 batalhão; Of. Superior: 2 companhias; Of. Intermediário: 1 companhia; Of. Subalterno: 1 pelotão." },
  { modulo: "8", tipo: "multipla", enunciado: "São os três tipos de Honras Fúnebres:", alternativas: A(
    "Guarda Fúnebre, Escolta Fúnebre e Salvas Fúnebres",
    "Guarda de Honra, Escolta e Desfile",
    "Velório, Cortejo e Sepultamento",
    "Salvas, Toque de Silêncio e Dobrar de Bandeira",
    "Guarda Fúnebre, Revista e Continência"),
    gabarito: "A", explicacao: "Guarda Fúnebre, Escolta Fúnebre e Salvas Fúnebres." },
  { modulo: "8", tipo: "dissertativa", fonte: "2ª AE IG/2026", enunciado: "Defina Honras Fúnebres e cite seus tipos (mín. 4 / máx. 8 linhas).", modelo: { estrutura: "Definição → 3 tipos.", criterios: ["Homenagens póstumas prestadas diretamente pela tropa", "Aos despojos de alta autoridade ou militar da ativa, conforme a posição hierárquica", "Citar Guarda Fúnebre, Escolta Fúnebre e Salvas Fúnebres"], resposta: "Honras Fúnebres são homenagens póstumas prestadas diretamente pela tropa aos despojos mortais de alta autoridade ou de militar da ativa, de acordo com a posição hierárquica que ocupava. Consistem basicamente em três tipos distintos: 1) Guarda Fúnebre; 2) Escolta Fúnebre; e 3) Salvas Fúnebres." } },

  // ════════════════════ MÓDULO 9 — Atribuições do Comandante de OME ════════════════════
  { modulo: "9", tipo: "certo_errado", enunciado: "A ação de comando caracteriza-se pelos atos de planejar, orientar, coordenar, acompanhar, controlar, fiscalizar e apurar responsabilidades.", gabarito: "certo", explicacao: "Correto. O comando é função do grau hierárquico, da qualificação e das habilitações — prerrogativa impessoal com atribuições e deveres." },
  { modulo: "9", tipo: "certo_errado", enunciado: "As atribuições do Comandante aplicam-se também aos militares que exercem função de Chefe (Ch) ou de Diretor (Dir).", gabarito: "certo", explicacao: "Correto. O RISG estende ao Ch e ao Dir as atribuições do Cmt." },
  { modulo: "9", tipo: "certo_errado", enunciado: "O Comandante deve dar suas ordens e instruções, sempre que possível, por intermédio do Subcomandante da Unidade.", gabarito: "certo", explicacao: "Correto (inciso LII). Quem as receber diretamente deve dar ciência ao SCmt na primeira oportunidade." },
  { modulo: "9", tipo: "certo_errado", enunciado: "O Comandante pode anular em BI, quando houver razões, qualquer ato seu ou de seus subordinados, dentro do prazo de cento e oitenta dias.", gabarito: "certo", explicacao: "Correto (inciso LIX)." },
  { modulo: "9", tipo: "certo_errado", enunciado: "Ao designar oficiais para os cargos da unidade, observa-se que nenhum oficial seja, em princípio, mantido no mesmo cargo por mais de três anos consecutivos.", gabarito: "errado", explicacao: "Errado. O prazo é de DOIS anos consecutivos, em princípio (inciso XLIX)." },
  { modulo: "9", tipo: "certo_errado", enunciado: "Compete ao Comandante estabelecer as NGA/U (Normas Gerais de Ação da Unidade).", gabarito: "certo", explicacao: "Correto (inciso LXIII)." },
  { modulo: "9", tipo: "certo_errado", fonte: "2ª AE IG/2026 (adaptada)", enunciado: "É atribuição do Comandante de OME transferir o militar levando em consideração a localização geográfica de sua residência.", gabarito: "errado", explicacao: "Errado. Essa NÃO é atribuição do Cmt de OME (foi a alternativa incorreta da prova)." },
  { modulo: "9", tipo: "multipla", fonte: "2ª AE IG/2026", enunciado: "Quanto às atribuições do Comandante de OME, assinale a alternativa INCORRETA:", alternativas: A(
    "Transferir o militar, levando em consideração a localização geográfica de sua residência.",
    "Transcrever, a seu juízo, em BI, as recompensas concedidas pelos comandos subordinados.",
    "Conceder licenças de acordo com as instruções e normas específicas em vigor.",
    "Dar suas ordens e instruções, sempre que possível, por intermédio do Subcomandante.",
    "Atender às ponderações justas de seus subordinados, quando feitas em termos adequados e de sua competência."),
    gabarito: "A", explicacao: "A incorreta é 'A': transferir militar pela localização da residência não é atribuição do Cmt de OME." },
  { modulo: "9", tipo: "multipla", enunciado: "A ação de comando é caracterizada, principalmente, pelos atos de:", alternativas: A(
    "planejar, orientar, coordenar, acompanhar, controlar, fiscalizar e apurar responsabilidades",
    "instruir, fardar, alimentar e alojar a tropa",
    "escriturar, arquivar e autenticar documentos",
    "escalar, revistar e recolher o pessoal",
    "hastear, arriar e incinerar bandeiras"),
    gabarito: "A", explicacao: "São os atos típicos da ação de comando, exercida em todos os setores da unidade." },
  { modulo: "9", tipo: "multipla", enunciado: "O prazo dentro do qual o Comandante pode anular em BI ato seu ou de seus subordinados é de:", alternativas: A(
    "cento e oitenta dias", "noventa dias", "trinta dias", "sessenta dias", "um ano"),
    gabarito: "A", explicacao: "Inciso LIX: 180 dias." },
  { modulo: "9", tipo: "dissertativa", enunciado: "Defina a ação de comando e cite quatro outras atribuições do Comandante de OME previstas no RISG.", modelo: { estrutura: "Ação de comando (7 atos) → 4 atribuições.", criterios: ["Ação de comando: planejar, orientar, coordenar, acompanhar, controlar, fiscalizar e apurar responsabilidades", "Citar 4 atribuições (organizar o horário da unidade; conceder férias/dispensa/trânsito; estabelecer as NGA/U; dar ordens pelo SCmt; anular ato em BI em até 180 dias; designar para cargos, sem manter oficial mais de 2 anos no mesmo cargo)"], resposta: "A ação de comando é a principal atribuição do Comandante e caracteriza-se pelos atos de planejar, orientar, coordenar, acompanhar, controlar, fiscalizar e apurar responsabilidades, devendo ser exercida em todos os setores da unidade, com a iniciativa necessária e sob sua inteira responsabilidade. Entre outras atribuições do Cmt destacam-se: organizar o horário da unidade; conceder dispensa, trânsito e férias aos subordinados na forma da legislação; estabelecer as NGA/U; dar suas ordens, sempre que possível, por intermédio do Subcomandante; anular em BI qualquer ato seu ou de subordinado dentro de 180 dias; e designar oficiais e praças para os cargos da unidade, observando que nenhum oficial seja, em princípio, mantido no mesmo cargo por mais de dois anos consecutivos." } },

  // ════════════════════ MÓDULO 10 — Atribuições do Subcomandante de OME ════════════════════
  { modulo: "10", tipo: "certo_errado", enunciado: "O Subcomandante é o principal auxiliar e substituto imediato do Cmt U e o Chefe do Estado-Maior da OME.", gabarito: "certo", explicacao: "Correto. É o intermediário na expedição de todas as ordens relativas à disciplina, à instrução e aos serviços gerais." },
  { modulo: "10", tipo: "certo_errado", enunciado: "O Subcomandante é o intermediário do Comandante na expedição das ordens relativas à disciplina, à instrução e aos serviços gerais, cuja execução lhe cumpre fiscalizar.", gabarito: "certo", explicacao: "Correto. É da essência da função do SCmt." },
  { modulo: "10", tipo: "certo_errado", enunciado: "Compete ao Subcomandante escalar os oficiais e a SU (ou subunidades) que fornecerão pessoal para os serviços gerais e extraordinários da unidade.", gabarito: "certo", explicacao: "Correto (inciso VI)." },
  { modulo: "10", tipo: "certo_errado", enunciado: "Na ausência ou impedimento ocasional do Comandante, o Subcomandante pode assinar documentos ou tomar providências de caráter urgente, dando-lhe conhecimento na primeira oportunidade.", gabarito: "certo", explicacao: "Correto (inciso IV)." },
  { modulo: "10", tipo: "certo_errado", enunciado: "Compete ao Subcomandante exercer rigorosa supervisão das normas de controle do armamento, realizando inclusive inspeções inopinadas.", gabarito: "certo", explicacao: "Correto (inciso X)." },
  { modulo: "10", tipo: "certo_errado", enunciado: "Em Companhias independentes, é vedado ao Subcomandante acumular suas funções com quaisquer outros encargos.", gabarito: "errado", explicacao: "Errado. Em Companhias independentes o SCmt PODE acumular funções com outros encargos (p. ex., a de P1)." },
  { modulo: "10", tipo: "certo_errado", enunciado: "Cabe ao Subcomandante encaminhar ao Cmt U, com as informações necessárias, todos os documentos que dependam da decisão deste.", gabarito: "certo", explicacao: "Correto (inciso I)." },
  { modulo: "10", tipo: "multipla", enunciado: "Sobre o Subcomandante de OME, assinale a alternativa CORRETA:", alternativas: A(
    "É o principal auxiliar e substituto imediato do Cmt U e o Chefe do Estado-Maior da OME.",
    "É o chefe da 1ª seção do EM/U, responsável por pessoal e BI.",
    "É o representante do Cmt U fora do expediente.",
    "É o responsável pela seção de ensino e instrução.",
    "É o auxiliar imediato do Oficial de Dia."),
    gabarito: "A", explicacao: "O SCmt é o principal auxiliar e substituto imediato do Cmt e Chefe do EM da OME." },
  { modulo: "10", tipo: "multipla", enunciado: "É atribuição do Subcomandante de OME:", alternativas: A(
    "escalar os oficiais e a SU que fornecerão pessoal para os serviços gerais e extraordinários",
    "manter em dia o histórico da unidade",
    "organizar as cerimônias militares",
    "planejar toda a instrução da unidade",
    "revistar as Companhias por determinação do Of Dia"),
    gabarito: "A", explicacao: "Escalar oficiais e SU para os serviços gerais/extraordinários é do SCmt (inciso VI)." },
  { modulo: "10", tipo: "multipla", enunciado: "Assinale a alternativa que NÃO corresponde a atribuição do Subcomandante:", alternativas: A(
    "Manter em dia o histórico da unidade.",
    "Encaminhar ao Cmt U documentos que dependam de sua decisão.",
    "Zelar pela conduta civil e militar dos oficiais e praças.",
    "Assinar documentos urgentes na ausência do Comandante.",
    "Supervisionar as normas de controle do armamento."),
    gabarito: "A", explicacao: "Manter o histórico da unidade é atribuição do ajudante-secretário, não do SCmt." },
  { modulo: "10", tipo: "dissertativa", enunciado: "Defina a função de Subcomandante de OME e cite quatro de suas atribuições.", modelo: { estrutura: "Definição → 4 atribuições.", criterios: ["Principal auxiliar e substituto imediato do Cmt; Chefe do EM da OME", "Intermediário na expedição das ordens de disciplina, instrução e serviços gerais", "Citar 4 atribuições (encaminhar documentos ao Cmt; assinar documentos urgentes na ausência do Cmt; zelar pela conduta dos militares; escalar oficiais/SU; supervisionar o controle do armamento)"], resposta: "O Subcomandante é o principal auxiliar e substituto imediato do Cmt U, seu intermediário na expedição de todas as ordens relativas à disciplina, à instrução e aos serviços gerais, cuja execução lhe cumpre fiscalizar, sendo ainda o Chefe do Estado-Maior da OME. Entre suas atribuições estão: encaminhar ao Cmt U, com as informações necessárias, os documentos que dependam de sua decisão; assinar documentos ou tomar providências urgentes na ausência ou impedimento ocasional do Comandante, dando-lhe conhecimento na primeira oportunidade; zelar assiduamente pela conduta civil e militar dos oficiais e praças; escalar os oficiais e a SU que fornecerão pessoal para os serviços gerais e extraordinários; e exercer rigorosa supervisão das normas de controle do armamento, realizando inspeções inopinadas." } },

  // ════════════════════ MÓDULO 11 — Atribuições do Ajudante-Secretário ════════════════════
  { modulo: "11", tipo: "certo_errado", enunciado: "O ajudante-secretário é um auxiliar imediato do Cmt U.", gabarito: "certo", explicacao: "Correto. Competem-lhe a escrituração, a correspondência e o arquivo da unidade." },
  { modulo: "11", tipo: "certo_errado", enunciado: "Compete ao ajudante-secretário manter em dia o histórico da unidade.", gabarito: "certo", explicacao: "Correto (inciso IV)." },
  { modulo: "11", tipo: "certo_errado", enunciado: "Compete ao ajudante-secretário subscrever certidões e papéis análogos.", gabarito: "certo", explicacao: "Correto (inciso III)." },
  { modulo: "11", tipo: "certo_errado", enunciado: "Cabe ao ajudante-secretário receber toda a correspondência externa destinada à unidade.", gabarito: "certo", explicacao: "Correto (inciso VIII)." },
  { modulo: "11", tipo: "certo_errado", enunciado: "Quando não houver cargo específico, a função do ajudante-secretário será exercida cumulativamente pelo P1.", gabarito: "certo", explicacao: "Correto (Art. 27)." },
  { modulo: "11", tipo: "certo_errado", enunciado: "Compete ao ajudante-secretário escalar as praças para os serviços normais e extraordinários da unidade.", gabarito: "errado", explicacao: "Errado. Escalar as praças é atribuição do P1, não do ajudante-secretário." },
  { modulo: "11", tipo: "certo_errado", enunciado: "Cópias autenticadas do BI, ou de partes dele, somente podem ser emitidas pelo ajudante-secretário, conforme determinação do Cmt U.", gabarito: "certo", explicacao: "Correto (Portaria nº 795-C/2014)." },
  { modulo: "11", tipo: "multipla", enunciado: "É atribuição do ajudante-secretário:", alternativas: A(
    "manter em dia o histórico da unidade",
    "escalar as praças para os serviços",
    "planejar a instrução da unidade",
    "organizar as cerimônias militares",
    "fiscalizar o controle do armamento"),
    gabarito: "A", explicacao: "Manter em dia o histórico da unidade é do ajudante-secretário (inciso IV)." },
  { modulo: "11", tipo: "multipla", enunciado: "Quando não houver cargo específico, a função do ajudante-secretário será exercida cumulativamente pelo:", alternativas: A(
    "P1", "P3", "P4", "SEI", "Subcomandante"),
    gabarito: "A", explicacao: "Art. 27: a função é exercida cumulativamente pelo P1." },
  { modulo: "11", tipo: "multipla", enunciado: "Assinale a alternativa que NÃO é atribuição do ajudante-secretário:", alternativas: A(
    "Escalar as praças para os serviços normais e extraordinários.",
    "Redigir a correspondência cuja natureza assim o exigir.",
    "Conferir e autenticar cópias de documentos do arquivo.",
    "Manter em dia e em ordem o arquivo da documentação da unidade.",
    "Responder pela carga do material do gabinete do Cmt U e da Secretaria."),
    gabarito: "A", explicacao: "Escalar as praças é atribuição do P1." },
  { modulo: "11", tipo: "dissertativa", enunciado: "Apresente a função do ajudante-secretário e cite quatro de suas atribuições.", modelo: { estrutura: "Definição → 4 atribuições → suplência pelo P1.", criterios: ["Auxiliar imediato do Cmt U", "Citar 4 atribuições (dirigir a escrituração da correspondência/arquivo/alterações dos oficiais; redigir correspondência; subscrever certidões; manter o histórico; conferir/autenticar cópias; manter o arquivo; responder pela carga do material; receber a correspondência externa)", "Sem cargo específico, a função é exercida pelo P1"], resposta: "O ajudante-secretário é um auxiliar imediato do Cmt U, competindo-lhe, entre outras: dirigir a escrituração referente à correspondência, ao arquivo e ao registro das alterações dos oficiais; redigir a correspondência cuja natureza assim o exigir; subscrever certidões e papéis análogos; manter em dia o histórico da unidade; conferir e autenticar as cópias de documentos do arquivo; manter em dia e em ordem o arquivo da documentação; responder pela carga do material distribuído ao gabinete do Cmt U, do SCmt e da Secretaria; e receber toda a correspondência externa destinada à unidade. Quando não houver cargo específico, a função é exercida cumulativamente pelo P1." } },

  // ════════════════════ MÓDULO 12 — Atribuições do P1 ════════════════════
  { modulo: "12", tipo: "certo_errado", enunciado: "O P1 é o chefe da 1ª seção do EM/U, responsável pelos encargos relativos a pessoal, BI, justiça e disciplina, protocolo e arquivo da correspondência interna e pagamento do pessoal.", gabarito: "certo", explicacao: "Correto. É a definição do P1 no RISG." },
  { modulo: "12", tipo: "certo_errado", enunciado: "Compete ao P1 organizar e manter em dia as relações de oficiais e praças para efeito das escalas de serviço.", gabarito: "certo", explicacao: "Correto (inciso II)." },
  { modulo: "12", tipo: "certo_errado", enunciado: "Compete ao P1 escalar as praças para os serviços normais e extraordinários da unidade.", gabarito: "certo", explicacao: "Correto (inciso III)." },
  { modulo: "12", tipo: "certo_errado", enunciado: "Compete ao P1 organizar os boletins ostensivos da unidade, conforme as determinações do Cmt U.", gabarito: "certo", explicacao: "Correto (inciso XII)." },
  { modulo: "12", tipo: "certo_errado", enunciado: "Compete ao P1 preparar a documentação necessária para instruir os processos de promoção, transferência para a reserva, reforma e concessão de medalhas.", gabarito: "certo", explicacao: "Correto (inciso XVIII)." },
  { modulo: "12", tipo: "certo_errado", enunciado: "Compete ao P1 controlar a escrituração referente ao registro das alterações dos oficiais da unidade.", gabarito: "errado", explicacao: "Errado. O P1 controla a escrituração das alterações dos SUBTENENTES E SARGENTOS; as alterações dos oficiais cabem ao ajudante-secretário." },
  { modulo: "12", tipo: "certo_errado", enunciado: "Nas Companhias Independentes, quando não houver cargo específico, a função de P1 poderá ser exercida cumulativamente pelo SCmt U.", gabarito: "certo", explicacao: "Correto (Art. 29)." },
  { modulo: "12", tipo: "multipla", enunciado: "O P1 é o chefe de qual seção do Estado-Maior da Unidade?", alternativas: A(
    "1ª seção (pessoal, BI, justiça e disciplina)",
    "2ª seção (inteligência)",
    "3ª seção (operações)",
    "4ª seção (logística)",
    "5ª seção (comunicação social)"),
    gabarito: "A", explicacao: "O P1 chefia a 1ª seção do EM/U." },
  { modulo: "12", tipo: "multipla", enunciado: "É atribuição do P1:", alternativas: A(
    "escalar as praças para os serviços normais e extraordinários",
    "organizar as cerimônias militares",
    "planejar a instrução da unidade",
    "fiscalizar o controle do armamento",
    "coordenar o apoio material aos planos de emprego"),
    gabarito: "A", explicacao: "Escalar as praças é do P1 (inciso III)." },
  { modulo: "12", tipo: "multipla", enunciado: "Nas Companhias Independentes, sem cargo específico, a função de P1 poderá ser exercida cumulativamente pelo:", alternativas: A(
    "Subcomandante (SCmt U)", "P3", "P4", "SEI", "Of Dia"),
    gabarito: "A", explicacao: "Art. 29: pelo SCmt U." },
  { modulo: "12", tipo: "dissertativa", enunciado: "Indique a seção e os encargos do P1 e cite quatro de suas atribuições.", modelo: { estrutura: "1ª seção / encargos → 4 atribuições.", criterios: ["Chefe da 1ª seção do EM/U: pessoal, BI, justiça e disciplina, protocolo, arquivo da correspondência interna e pagamento", "Citar 4 atribuições (relações p/ escalas; escalar praças; organizar fichários/mapas; organizar boletins ostensivos; preparar documentação de promoção/reserva/reforma/medalhas; escriturar alterações de subtenentes e sargentos)"], resposta: "O P1 é o chefe da 1ª seção do EM/U, responsável pelos encargos relativos à coordenação e ao controle das atividades de pessoal, BI, justiça e disciplina, protocolo e arquivo da correspondência interna e pagamento do pessoal da unidade. Entre suas atribuições: organizar e manter em dia as relações de oficiais e praças para as escalas de serviço; escalar as praças para os serviços normais e extraordinários; organizar os fichários, mapas e relações do efetivo; organizar os boletins ostensivos conforme as determinações do Cmt U; preparar a documentação para os processos de promoção, transferência para a reserva, reforma e concessão de medalhas; e controlar a escrituração das alterações dos subtenentes e sargentos da unidade." } },

  // ════════════════════ MÓDULO 13 — Atribuições do P3 ════════════════════
  { modulo: "13", tipo: "certo_errado", enunciado: "O P3 é o chefe da 3ª seção do EM/U, responsável pelas atividades relativas às operações e à estatística.", gabarito: "certo", explicacao: "Correto. É a definição do P3 no RISG." },
  { modulo: "13", tipo: "certo_errado", enunciado: "Compete ao P3 organizar as cerimônias militares, em coordenação com outros oficiais do EM/U.", gabarito: "certo", explicacao: "Correto (inciso VI)." },
  { modulo: "13", tipo: "certo_errado", enunciado: "Compete ao P3 preparar a documentação de operações e coordenar a elaboração daquela que não for de sua responsabilidade direta.", gabarito: "certo", explicacao: "Correto (inciso XVII)." },
  { modulo: "13", tipo: "certo_errado", enunciado: "Na formatura geral da unidade, é o P3 quem avisa o Cmt U de que a tropa se encontra pronta para recebê-lo.", gabarito: "certo", explicacao: "Correto. O Cmt U só se aproxima do local após o aviso do P3." },
  { modulo: "13", tipo: "certo_errado", enunciado: "O P3 é o responsável pelo planejamento e execução de toda a instrução da unidade.", gabarito: "errado", explicacao: "Errado. A instrução é responsabilidade do SEI (Seção de Ensino e Instrução)." },
  { modulo: "13", tipo: "certo_errado", enunciado: "O P3 é o chefe da 4ª seção do EM/U.", gabarito: "errado", explicacao: "Errado. O P3 chefia a 3ª seção; a 4ª é do P4." },
  { modulo: "13", tipo: "certo_errado", enunciado: "As cerimônias militares são organizadas exclusivamente pelo P1, sem participação do P3.", gabarito: "errado", explicacao: "Errado. Organizar as cerimônias militares é atribuição do P3, em coordenação com os demais oficiais do EM/U." },
  { modulo: "13", tipo: "multipla", enunciado: "O P3 é o chefe de qual seção do EM/U e por quais atividades responde?", alternativas: A(
    "3ª seção — operações e estatística",
    "1ª seção — pessoal e BI",
    "2ª seção — inteligência",
    "4ª seção — logística",
    "5ª seção — comunicação social"),
    gabarito: "A", explicacao: "P3 = 3ª seção (operações e estatística)." },
  { modulo: "13", tipo: "multipla", enunciado: "A organização das cerimônias militares, em coordenação com outros oficiais do EM/U, compete ao:", alternativas: A(
    "P3", "P1", "P4", "ajudante-secretário", "Cmt da Guarda"),
    gabarito: "A", explicacao: "Inciso VI das atribuições do P3." },
  { modulo: "13", tipo: "multipla", enunciado: "Assinale a alternativa que NÃO é atribuição do P3:", alternativas: A(
    "Planejar e executar toda a instrução da unidade.",
    "Organizar as cerimônias militares.",
    "Preparar a documentação de operações.",
    "Coordenar a documentação de operações de outros setores.",
    "Avisar o Cmt U de que a tropa está pronta para a formatura."),
    gabarito: "A", explicacao: "A instrução é do SEI, não do P3." },
  { modulo: "13", tipo: "dissertativa", enunciado: "Indique a seção e a área de responsabilidade do P3 e cite suas principais atribuições.", modelo: { estrutura: "3ª seção / operações e estatística → atribuições.", criterios: ["Chefe da 3ª seção do EM/U; operações e estatística", "Organizar as cerimônias militares com o EM/U", "Preparar e coordenar a documentação de operações", "Avisar o Cmt de que a tropa está pronta (formaturas)"], resposta: "O P3 é o chefe da 3ª seção do EM/U, responsável pelas atividades relativas às operações e à estatística. Compete-lhe, entre outras: organizar as cerimônias militares, em coordenação com os demais oficiais do EM/U; preparar a documentação de operações e coordenar a elaboração daquela que não for de sua responsabilidade direta; e, nas formaturas gerais, avisar o Cmt U de que a tropa se encontra pronta para recebê-lo." } },

  // ════════════════════ MÓDULO 14 — Atribuições do SEI (Ensino e Instrução) ════════════════════
  { modulo: "14", tipo: "certo_errado", enunciado: "O SEI é o chefe da seção de ensino e instrução do EM/U, responsável pelas atividades relativas à instrução.", gabarito: "certo", explicacao: "Correto. É a definição do SEI no RISG." },
  { modulo: "14", tipo: "certo_errado", enunciado: "Compete ao SEI planejar, organizar e coordenar, mediante determinação do Cmt U e segundo as diretrizes do escalão superior, toda a instrução da unidade.", gabarito: "certo", explicacao: "Correto (inciso I)." },
  { modulo: "14", tipo: "certo_errado", enunciado: "Compete ao SEI planejar e realizar a seleção das praças a serem matriculadas nos diversos cursos, em colaboração com o P1.", gabarito: "certo", explicacao: "Correto (inciso V)." },
  { modulo: "14", tipo: "certo_errado", enunciado: "A instrução apresenta-se em duas vertentes: a Instrução Geral (IG), elaborada pela DEIP, e a Instrução Particular (IP).", gabarito: "certo", explicacao: "Correto (SUNOR 034/2020)." },
  { modulo: "14", tipo: "certo_errado", enunciado: "O Programa de Instrução (PgI) é o documento básico de planejamento, elaborado pelas OMEs e encaminhado à DEIP para apreciação e aprovação.", gabarito: "certo", explicacao: "Correto. A DEIP exerce a função de supervisão e aprovação." },
  { modulo: "14", tipo: "certo_errado", enunciado: "A direção da instrução na Corporação estrutura-se em dois níveis: Geral e Execução.", gabarito: "errado", explicacao: "Errado. São TRÊS níveis: Geral, Setorial e Execução. A execução é realizada pelas OMEs (SEIs) e Campi." },
  { modulo: "14", tipo: "certo_errado", enunciado: "A Instrução Geral (IG) é elaborada por cada OME, por meio de suas Seções de Ensino e Instrução.", gabarito: "errado", explicacao: "Errado. A IG é elaborada pela DEIP; a Instrução Particular (IP) é que é desenvolvida pelas OMEs." },
  { modulo: "14", tipo: "multipla", enunciado: "O SEI é o chefe de qual seção e responde por quais atividades?", alternativas: A(
    "Seção de ensino e instrução — atividades de instrução",
    "1ª seção — pessoal",
    "3ª seção — operações",
    "4ª seção — logística",
    "5ª seção — comunicação social"),
    gabarito: "A", explicacao: "SEI = seção de ensino e instrução do EM/U." },
  { modulo: "14", tipo: "multipla", enunciado: "As duas vertentes da instrução, segundo o SUNOR 034/2020, são:", alternativas: A(
    "Instrução Geral (IG), elaborada pela DEIP, e Instrução Particular (IP)",
    "Instrução Básica e Instrução Avançada",
    "Instrução Teórica e Instrução Prática",
    "Instrução Inicial e Instrução Continuada",
    "Instrução Coletiva e Instrução Individual"),
    gabarito: "A", explicacao: "IG (DEIP) e IP (OMEs)." },
  { modulo: "14", tipo: "multipla", enunciado: "A direção da instrução na Corporação estrutura-se nos níveis:", alternativas: A(
    "Geral, Setorial e Execução",
    "Estratégico, Tático e Operacional",
    "Federal, Estadual e Municipal",
    "Inicial, Intermediário e Final",
    "Planejamento, Coordenação e Controle"),
    gabarito: "A", explicacao: "Geral, Setorial e Execução — a execução cabe às OMEs (SEIs) e Campi." },
  { modulo: "14", tipo: "dissertativa", enunciado: "Apresente as atribuições do SEI e diferencie a Instrução Geral (IG) da Instrução Particular (IP).", modelo: { estrutura: "Atribuições do SEI → IG (DEIP) × IP (OMEs) → PgI.", criterios: ["SEI: planejar, organizar e coordenar a instrução; selecionar praças p/ cursos com o P1; fiscalizar a instrução", "IG elaborada pela DEIP", "IP desenvolvida pelas OMEs, formalizada no Programa de Instrução (PgI), aprovado pela DEIP"], resposta: "O SEI é o chefe da seção de ensino e instrução do EM/U, competindo-lhe planejar, organizar e coordenar toda a instrução da unidade, mediante determinação do Cmt U e segundo as diretrizes do escalão superior; selecionar as praças a serem matriculadas nos cursos, em colaboração com o P1; reunir dados para o Cmt acompanhar e avaliar a instrução; e fiscalizá-la. A instrução apresenta-se em duas vertentes: a Instrução Geral (IG), elaborada pela DEIP, e a Instrução Particular (IP), desenvolvida por todas as OMEs por meio de suas seções de ensino e instrução, formalizada no Programa de Instrução (PgI) — documento básico de planejamento encaminhado à DEIP para apreciação e aprovação." } },

  // ════════════════════ MÓDULO 15 — Atribuições do P4 ════════════════════
  { modulo: "15", tipo: "certo_errado", enunciado: "O P4 é o chefe da 4ª seção do EM/U, podendo também acumular os encargos de Fiscal Administrativo (Fisc Adm).", gabarito: "certo", explicacao: "Correto. É o principal responsável pela observância das disposições regulamentares relativas à administração." },
  { modulo: "15", tipo: "certo_errado", enunciado: "O P4 é o principal responsável pela perfeita observância de todas as disposições regulamentares relativas à administração da unidade.", gabarito: "certo", explicacao: "Correto, como auxiliar imediato do Cmt U na administração." },
  { modulo: "15", tipo: "certo_errado", enunciado: "Compete ao P4 manter estreita ligação com o P3 e com o Chefe da SEI para providenciar o apoio material à execução dos programas de instrução e aos planos de emprego.", gabarito: "certo", explicacao: "Correto (inciso II)." },
  { modulo: "15", tipo: "certo_errado", enunciado: "Quando acumular os encargos de Fiscal Administrativo, o P4 não participa dos serviços estranhos à sua função.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "15", tipo: "certo_errado", enunciado: "O Fiscal Administrativo assessora o Cmt U nas providências referentes ao controle ambiental.", gabarito: "certo", explicacao: "Correto. Responsabiliza-se pela elaboração, atualização e difusão das normas de controle ambiental." },
  { modulo: "15", tipo: "certo_errado", enunciado: "O P4 é o chefe da 2ª seção do EM/U.", gabarito: "errado", explicacao: "Errado. O P4 chefia a 4ª seção (logística/administração)." },
  { modulo: "15", tipo: "certo_errado", enunciado: "Compete ao P4 planejar e ministrar a instrução da unidade.", gabarito: "errado", explicacao: "Errado. A instrução é do SEI; o P4 apenas provê o apoio material à instrução." },
  { modulo: "15", tipo: "multipla", enunciado: "O P4 é o chefe de qual seção do EM/U?", alternativas: A(
    "4ª seção (logística/administração)",
    "1ª seção (pessoal)",
    "2ª seção (inteligência)",
    "3ª seção (operações)",
    "5ª seção (comunicação social)"),
    gabarito: "A", explicacao: "P4 = 4ª seção; pode acumular Fisc Adm." },
  { modulo: "15", tipo: "multipla", enunciado: "Para providenciar o apoio material à execução dos programas de instrução, o P4 mantém estreita ligação com:", alternativas: A(
    "o P3 e o Chefe da SEI",
    "o P1 e o ajudante-secretário",
    "o Of Dia e o Cmt da Guarda",
    "o Subcomandante e o plantão",
    "a ASCOM e o P/5"),
    gabarito: "A", explicacao: "Inciso II das atribuições do P4." },
  { modulo: "15", tipo: "multipla", enunciado: "Sobre o Fiscal Administrativo (Fisc Adm), assinale a alternativa CORRETA:", alternativas: A(
    "assessora o Cmt U no controle ambiental, elaborando e difundindo as normas correspondentes",
    "é o representante do Cmt fora do expediente",
    "chefia a seção de ensino e instrução",
    "comanda a guarda do quartel",
    "mantém o histórico da unidade"),
    gabarito: "A", explicacao: "O Fisc Adm assessora o Cmt no controle ambiental (normas federais, estaduais e municipais)." },
  { modulo: "15", tipo: "dissertativa", enunciado: "Indique a seção e as responsabilidades do P4 e a relação entre o P4 e o Fiscal Administrativo.", modelo: { estrutura: "4ª seção / administração → atribuições → Fisc Adm (controle ambiental).", criterios: ["Chefe da 4ª seção; principal responsável pela administração", "Ligação com P3 e SEI para apoio material", "Pode acumular Fisc Adm; quando acumula, não participa de serviços estranhos", "Fisc Adm assessora o Cmt no controle ambiental"], resposta: "O P4 é o chefe da 4ª seção do EM/U e, como auxiliar imediato do Cmt U na administração, é o principal responsável pela perfeita observância de todas as disposições regulamentares relativas à administração da unidade, podendo acumular os encargos de Fiscal Administrativo. Compete-lhe coordenar e fiscalizar os serviços de seus elementos de execução, manter estreita ligação com o P3 e o Chefe da SEI para o apoio material aos programas de instrução e planos de emprego, e zelar pela prevenção de acidentes. Quando acumula os encargos de Fisc Adm, não participa dos serviços estranhos à sua função e assessora o Cmt nas providências de controle ambiental, responsabilizando-se pela elaboração, atualização e difusão das normas correspondentes." } },

  // ════════════════════ MÓDULO 16 — Do Boletim Interno (BI) ════════════════════
  { modulo: "16", tipo: "certo_errado", enunciado: "O Boletim Interno (BI) é dividido em quatro partes: Serviços Diários; Instrução; Assuntos Gerais e Administrativos; e Justiça e Disciplina.", gabarito: "certo", explicacao: "Correto. São as quatro partes do BI." },
  { modulo: "16", tipo: "certo_errado", enunciado: "O desconhecimento do BI não justifica a falta ou o descumprimento de ordens.", gabarito: "certo", explicacao: "Correto. O BI deve ser conhecido por todos no mesmo dia de sua publicação." },
  { modulo: "16", tipo: "certo_errado", enunciado: "Os assuntos sob restrição de acesso são publicados no BI ostensivo, junto aos demais.", gabarito: "errado", explicacao: "Errado. Assuntos sigilosos vão em boletim de acesso restrito, organizado pela inteligência da OM, não no BI ostensivo." },
  { modulo: "16", tipo: "certo_errado", enunciado: "Cópias autenticadas do BI somente podem ser emitidas pelo ajudante-secretário, conforme determinação do Cmt U.", gabarito: "certo", explicacao: "Correto (Portaria nº 795-C/2014)." },
  { modulo: "16", tipo: "certo_errado", enunciado: "As cópias do BI são autenticadas pelo Subcomandante da Unidade.", gabarito: "certo", explicacao: "Correto. Do original extraem-se cópias autenticadas pelo SCmt U." },
  { modulo: "16", tipo: "certo_errado", enunciado: "O Boletim Interno é, obrigatoriamente, publicado todos os dias do ano.", gabarito: "errado", explicacao: "Errado. O BI será publicado diariamente ou não, conforme as necessidades e o vulto das matérias." },
  { modulo: "16", tipo: "certo_errado", enunciado: "Normalmente, o BI estará pronto meia hora antes do fim do último tempo de instrução e será distribuído antes do término desse tempo.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "16", tipo: "multipla", enunciado: "As quatro partes do Boletim Interno são:", alternativas: A(
    "Serviços Diários; Instrução; Assuntos Gerais e Administrativos; Justiça e Disciplina",
    "Pessoal; Operações; Logística; Inteligência",
    "Ordens; Avisos; Escalas; Punições",
    "Ostensiva; Restrita; Reservada; Secreta",
    "Cmt; SCmt; P1; P4"),
    gabarito: "A", explicacao: "São as quatro partes regulamentares do BI." },
  { modulo: "16", tipo: "multipla", enunciado: "O Boletim Interno conterá, especialmente, EXCETO:", alternativas: A(
    "Os assuntos transmitidos à unidade em caráter sigiloso.",
    "A discriminação do serviço a ser executado pela unidade.",
    "As ordens e decisões do Cmt U, mesmo já executadas.",
    "As determinações das autoridades superiores, mesmo já cumpridas, com a referência.",
    "As alterações ocorridas com o pessoal e o material da unidade."),
    gabarito: "A", explicacao: "Assuntos sigilosos não são publicados no BI ostensivo." },
  { modulo: "16", tipo: "multipla", enunciado: "Sobre a autenticação do BI, é correto afirmar:", alternativas: A(
    "as cópias são autenticadas pelo SCmt U e as cópias autenticadas só podem ser emitidas pelo ajudante-secretário",
    "as cópias são autenticadas pelo P3",
    "qualquer praça da unidade pode autenticar o BI",
    "o BI dispensa autenticação quando informatizado",
    "as cópias são autenticadas pelo Of Dia"),
    gabarito: "A", explicacao: "Cópias autenticadas pelo SCmt; emissão de cópias autenticadas pelo ajudante-secretário." },
  { modulo: "16", tipo: "dissertativa", enunciado: "Conceitue o Boletim Interno, indique suas quatro partes e cite o que ele conterá especialmente e o que NÃO será nele publicado.", modelo: { estrutura: "Conceito → 4 partes → conterá → não publicará.", criterios: ["Documento em que o Cmt publica ordens, ordens superiores e fatos do conhecimento da unidade", "4 partes: Serviços Diários; Instrução; Assuntos Gerais e Administrativos; Justiça e Disciplina", "Conterá: discriminação do serviço; ordens do Cmt; determinações superiores; alterações de pessoal/material", "Não publicará: assuntos sigilosos e referências a eles; assuntos não relacionados ao serviço (salvo ordem ou comemoração cívica)"], resposta: "O Boletim Interno (BI) é o documento em que o Cmt U publica todas as suas ordens, as ordens das autoridades superiores e os fatos que devam ser do conhecimento de toda a unidade. Divide-se em quatro partes: 1ª Serviços Diários; 2ª Instrução; 3ª Assuntos Gerais e Administrativos; e 4ª Justiça e Disciplina. Conterá, especialmente: a discriminação do serviço a ser executado; as ordens e decisões do Cmt U, mesmo já executadas; as determinações das autoridades superiores, com a referência; e as alterações de pessoal e material. Não serão nele publicados: os assuntos sigilosos (ou referências a eles), que vão em boletim de acesso restrito; e as ocorrências ou assuntos não relacionados com o serviço, salvo se tiverem dado lugar a ordem ou se ligados a comemoração de caráter cívico." } },

  // ════════════════════ MÓDULO 17 — Trabalhos diários, instrução e faxinas ════════════════════
  { modulo: "17", tipo: "certo_errado", enunciado: "O horário da vida diária da unidade é estabelecido pelo Cmt U, por períodos que podem variar com as estações do ano, os interesses da instrução e as determinações superiores.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "17", tipo: "certo_errado", enunciado: "O horário de cada período será publicado em BI, sempre que possível com antecedência de uma semana.", gabarito: "certo", explicacao: "Correto. Alterações também são publicadas com a devida antecedência." },
  { modulo: "17", tipo: "certo_errado", enunciado: "A instrução é o objeto principal da vida da unidade e não deve ser prejudicada pelos demais trabalhos, salvo o serviço de justiça e as atividades decorrentes de situações anormais.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "17", tipo: "certo_errado", enunciado: "Faxinas são todos os trabalhos de utilidade geral executados no quartel ou fora dele — limpeza, lavagem, capinação, arrumação, transporte, carga ou descarga de material — regulados pelas NGA/U.", gabarito: "certo", explicacao: "Correto. É a definição regulamentar de faxinas." },
  { modulo: "17", tipo: "certo_errado", enunciado: "A militar gestante, salvo dispensa por recomendação médica, participa de todas as atividades militares, exceto as que envolvam esforços físicos e jornadas ou exercícios em campanha.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "17", tipo: "certo_errado", enunciado: "O horário da vida diária da unidade é fixo e imutável durante todo o ano.", gabarito: "errado", explicacao: "Errado. É estabelecido por períodos que variam com as estações, a instrução e as determinações superiores." },
  { modulo: "17", tipo: "certo_errado", enunciado: "A instrução pode ser livremente prejudicada pelos serviços normais ou extraordinários da unidade.", gabarito: "errado", explicacao: "Errado. A instrução não deve ser prejudicada, salvo o serviço de justiça e as situações anormais." },
  { modulo: "17", tipo: "multipla", enunciado: "Quem estabelece o horário da vida diária da unidade?", alternativas: A(
    "o Cmt U, por períodos que variam com estações, instrução e determinações superiores",
    "o P1, mensalmente",
    "o Of Dia, diariamente",
    "o SEI, por semestre",
    "o Cmt da Guarda, a cada turno"),
    gabarito: "A", explicacao: "O horário é estabelecido pelo Cmt U e publicado em BI." },
  { modulo: "17", tipo: "multipla", enunciado: "Assinale a definição CORRETA de faxinas:", alternativas: A(
    "trabalhos de utilidade geral (limpeza, lavagem, capinação, arrumação, transporte, carga/descarga) regulados pelas NGA/U",
    "as revistas normais do pessoal ao rancho",
    "os serviços de escala externos",
    "as cerimônias militares internas",
    "as instruções de ordem unida"),
    gabarito: "A", explicacao: "Faxinas = trabalhos de utilidade geral regulados pelas NGA/U." },
  { modulo: "17", tipo: "multipla", enunciado: "Sobre a militar gestante, é correto afirmar que, salvo recomendação médica, ela participa de todas as atividades, EXCETO:", alternativas: A(
    "as que envolvam esforços físicos e jornadas ou exercícios em campanha",
    "as formaturas gerais",
    "a leitura do BI",
    "as instruções teóricas",
    "as revistas de uniforme"),
    gabarito: "A", explicacao: "A gestante é excetuada dos esforços físicos e das jornadas/exercícios em campanha." },
  { modulo: "17", tipo: "dissertativa", enunciado: "Explique a importância da instrução na vida da unidade e conceitue faxinas.", modelo: { estrutura: "Instrução (objeto principal, não prejudicada) → faxinas (definição).", criterios: ["Instrução é o objeto principal da vida da unidade", "Não deve ser prejudicada pelos demais trabalhos, salvo justiça e situações anormais", "Faxinas: trabalhos de utilidade geral (limpeza, lavagem, capinação, transporte etc.) regulados pelas NGA/U"], resposta: "A instrução, como objeto principal da vida da unidade, desenvolve-se nas fases mais importantes da jornada e não deve ser prejudicada pelos demais trabalhos, serviços normais ou extraordinários, salvo o serviço de justiça e as atividades decorrentes de situações anormais. Já as faxinas são todos os trabalhos de utilidade geral executados no quartel ou fora dele, compreendendo limpeza, lavagem, capinação, arrumação, transporte, carga ou descarga de material e outros semelhantes, regulados pelas NGA/U." } },

  // ════════════════════ MÓDULO 18 — Do Adjunto de Comando ════════════════════
  { modulo: "18", tipo: "certo_errado", enunciado: "O cargo de Adjunto de Comando foi criado no Exército Brasileiro, em caráter experimental, em 22 de maio de 2015.", gabarito: "certo", explicacao: "Correto. Visa valorizar a carreira do graduado e fortalecer a dimensão humana." },
  { modulo: "18", tipo: "certo_errado", enunciado: "Na PMPE, o encargo de Adjunto de Comando foi instituído em janeiro de 2022.", gabarito: "certo", explicacao: "Correto (SUNOR 002/2022 / instrução normativa CG nº 483, de 07 JAN 2022)." },
  { modulo: "18", tipo: "certo_errado", enunciado: "Diferentemente do Exército, a PMPE instituiu o encargo de Adjunto de Comando apenas no âmbito do Comando Geral.", gabarito: "certo", explicacao: "Correto. Na PMPE: Comando Geral, DGA e DPO." },
  { modulo: "18", tipo: "certo_errado", enunciado: "O Adjunto de Comando distingue o subtenente ou o primeiro sargento que apresente destacada liderança, reconhecida competência profissional e ilibada conduta pessoal.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "18", tipo: "certo_errado", enunciado: "É atribuição do Adjunto de Comando facilitar a comunicação entre o comando e as praças.", gabarito: "certo", explicacao: "Correto (Art. 2º, III)." },
  { modulo: "18", tipo: "certo_errado", enunciado: "Na PMPE, o encargo de Adjunto de Comando foi instituído em todas as OMEs, tal como no Exército.", gabarito: "errado", explicacao: "Errado. Na PMPE foi instituído apenas no Comando Geral, na DGA e na DPO." },
  { modulo: "18", tipo: "certo_errado", enunciado: "O Adjunto de Comando pode ser qualquer soldado da Corporação.", gabarito: "errado", explicacao: "Errado. Recai sobre subtenente ou primeiro sargento de destacada liderança e conduta ilibada." },
  { modulo: "18", tipo: "multipla", enunciado: "Sobre a instituição do Adjunto de Comando na PMPE, é correto afirmar:", alternativas: A(
    "foi instituído em janeiro de 2022, apenas no âmbito do Comando Geral (Comando Geral, DGA e DPO)",
    "foi instituído em 2015, em todas as OMEs",
    "foi instituído pelo Exército, sem norma própria da PMPE",
    "foi instituído apenas nos batalhões operacionais",
    "foi instituído para oficiais subalternos"),
    gabarito: "A", explicacao: "PMPE: janeiro de 2022, no âmbito do Comando Geral, DGA e DPO." },
  { modulo: "18", tipo: "multipla", enunciado: "Assinale uma atribuição do Adjunto de Comando:", alternativas: A(
    "facilitar a comunicação entre o comando e as praças",
    "comandar a guarda do quartel",
    "chefiar a 1ª seção do EM/U",
    "autenticar as cópias do BI",
    "organizar as escalas de serviço"),
    gabarito: "A", explicacao: "Facilitar a comunicação entre o comando e as praças é atribuição do Adjunto (Art. 2º, III)." },
  { modulo: "18", tipo: "multipla", enunciado: "O encargo de Adjunto de Comando recai sobre:", alternativas: A(
    "subtenente ou primeiro sargento de destacada liderança e conduta ilibada",
    "qualquer soldado da unidade",
    "oficial subalterno mais moderno",
    "o Subcomandante da Unidade",
    "o cabo da faxina"),
    gabarito: "A", explicacao: "Subtenente ou 1º sargento com liderança, competência e conduta ilibada." },
  { modulo: "18", tipo: "dissertativa", enunciado: "Apresente a origem do Adjunto de Comando, sua instituição na PMPE e duas de suas atribuições.", modelo: { estrutura: "Origem (EB, 2015) → PMPE (2022, Comando Geral/DGA/DPO) → atribuições.", criterios: ["Criado no EB em caráter experimental (2015)", "Na PMPE instituído em janeiro de 2022, apenas no Comando Geral, DGA e DPO", "Recai sobre subtenente ou 1º sargento de destacada liderança", "Citar 2 atribuições (propagar valores éticos/militares; fortalecer o comportamento militar; facilitar a comunicação comando-praças; difundir missão/visão; assessorar o comando em assuntos das praças)"], resposta: "O cargo de Adjunto de Comando foi criado no Exército Brasileiro, em caráter experimental, em 22 de maio de 2015, com o objetivo de valorizar a carreira do graduado e fortalecer a dimensão humana da Força, distinguindo o subtenente ou o primeiro sargento de destacada liderança, reconhecida competência profissional e ilibada conduta pessoal. Na PMPE, o encargo foi instituído em janeiro de 2022 e, diferentemente do Exército, apenas no âmbito do Comando Geral, da DGA e da DPO. São atribuições do Adjunto, entre outras: exercitar e propagar os valores éticos e militares; fortalecer os padrões do comportamento militar; facilitar a comunicação entre o comando e as praças; difundir a missão e a visão da Corporação; e assessorar o comando em assuntos disciplinares, de instrução e de bem-estar das praças." } },

  // ════════════════════ MÓDULO 19 — Manual Básico de Comunicação Social da PMPE ════════════════════
  { modulo: "19", tipo: "certo_errado", enunciado: "Todos os integrantes da PMPE, em qualquer situação, são elementos fundamentais da Comunicação Social na preservação e manutenção da imagem institucional.", gabarito: "certo", explicacao: "Correto. São difusores, por excelência, dos valores organizacionais." },
  { modulo: "19", tipo: "certo_errado", enunciado: "A Assessoria de Comunicação da PMPE (ASCOM) é a 5ª Seção do Estado-Maior Geral.", gabarito: "certo", explicacao: "Correto. Responsável pela imagem da instituição." },
  { modulo: "19", tipo: "certo_errado", enunciado: "O Oficial de Comunicação Social (P/5) recai sobre o Oficial Secretário da Organização Militar Estadual ou seu equivalente.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "19", tipo: "certo_errado", enunciado: "Os comandantes das OMEs podem fornecer informações jornalísticas sobre ocorrências policiais positivas e neutras, designando um policial militar, desde que não haja orientação em contrário.", gabarito: "certo", explicacao: "Correto. Havendo orientação em contrário, a Ascom/5ª EMG assume o repasse." },
  { modulo: "19", tipo: "certo_errado", enunciado: "É vedada a criação de perfis funcionais nas redes sociais.", gabarito: "certo", explicacao: "Correto. Veda-se também compartilhar/seguir perfis pessoais nas mídias institucionais." },
  { modulo: "19", tipo: "certo_errado", enunciado: "É permitido divulgar livremente imagens de suspeitos em ocorrências policiais.", gabarito: "errado", explicacao: "Errado. Veda-se a divulgação de imagens de suspeitos, salvo nos casos de notório interesse público." },
  { modulo: "19", tipo: "certo_errado", enunciado: "As entrevistas e esclarecimentos jornalísticos independem de orientação da Ascom/5ª EMG.", gabarito: "errado", explicacao: "Errado. Devem ocorrer sob orientação e designação da Ascom/5ª EMG, salvo casos autorizados pelo Comando Geral." },
  { modulo: "19", tipo: "multipla", enunciado: "A ASCOM corresponde a qual seção do Estado-Maior Geral, e sobre quem recai o encargo de Oficial de Comunicação Social (P/5)?", alternativas: A(
    "5ª Seção do EMG; recai sobre o Oficial Secretário da OME",
    "1ª Seção do EMG; recai sobre o P1",
    "3ª Seção do EMG; recai sobre o P3",
    "2ª Seção do EMG; recai sobre o oficial de inteligência",
    "4ª Seção do EMG; recai sobre o P4"),
    gabarito: "A", explicacao: "ASCOM = 5ª Seção do EMG; P/5 recai sobre o Oficial Secretário." },
  { modulo: "19", tipo: "multipla", enunciado: "Sobre o uso de redes sociais pelo policial militar, assinale a alternativa CORRETA:", alternativas: A(
    "é vedada a criação de perfis funcionais e a exposição fardada em circunstância negativa",
    "é livre divulgar imagens de suspeitos em qualquer caso",
    "é permitido o engajamento em conteúdo político nas mídias institucionais",
    "a resenha de ocorrências deve ser repassada à imprensa",
    "imagens de PM em situações vexatórias podem ser divulgadas"),
    gabarito: "A", explicacao: "Veda-se a criação de perfis funcionais e a exposição fardada em circunstância negativa." },
  { modulo: "19", tipo: "multipla", enunciado: "Dependem de prévia autorização da 5ª EMG, EXCETO:", alternativas: A(
    "a apresentação pessoal e a postura diária do policial em serviço",
    "a produção de vídeos e áudios institucionais",
    "a resposta a ocorrências negativas",
    "a concessão de entrevistas nos meios de comunicação",
    "a cessão de imagens coletadas nas operações"),
    gabarito: "A", explicacao: "A apresentação/postura diária não é ação pendente de autorização; as demais são." },
  { modulo: "19", tipo: "dissertativa", enunciado: "Discorra sobre o papel da Comunicação Social na PMPE e cite vedações ao policial militar no uso das mídias e redes sociais.", modelo: { estrutura: "Papel (todos são difusores; ASCOM=5ª EMG; P/5) → vedações.", criterios: ["Todos os integrantes são elementos da Comunicação Social", "ASCOM é a 5ª Seção do EMG; P/5 recai sobre o Oficial Secretário", "Vedações: imagens de suspeitos (salvo notório interesse público); imagens de PM em situações vexatórias; criar perfis funcionais; conteúdo político; exposição fardada em circunstância negativa"], resposta: "Na PMPE, todos os integrantes, em qualquer situação, são elementos fundamentais da Comunicação Social, atuando como difusores dos valores organizacionais e responsáveis pela preservação da imagem institucional. A ASCOM é a 5ª Seção do Estado-Maior Geral, responsável pela imagem da instituição, e o Oficial de Comunicação Social (P/5) recai sobre o Oficial Secretário da OME. Quanto às mídias e redes sociais, vedam-se, entre outras condutas: a divulgação de imagens de suspeitos (salvo notório interesse público); a divulgação de imagens de policiais em situações vexatórias ou degradantes; a criação de perfis funcionais; o engajamento em conteúdo político nas mídias institucionais; e qualquer exposição fardada em circunstância negativa que comprometa a honra pessoal e a imagem da Corporação, sob pena de responsabilização nos termos do Código de Ética e do Código Disciplinar dos Militares de Pernambuco." } },

  // ════════════════════ MÓDULO 20 — Do Expediente ════════════════════
  { modulo: "20", tipo: "certo_errado", enunciado: "O expediente é a fase da jornada destinada à preparação e execução dos trabalhos normais da administração da unidade e ao funcionamento das repartições e dependências internas.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "20", tipo: "certo_errado", enunciado: "O expediente começa normalmente com a formatura geral, da unidade ou de companhia, e termina depois da leitura do BI do dia, com o toque ou sinal de fim do expediente.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "20", tipo: "certo_errado", enunciado: "A formatura geral da unidade corresponde a um tempo de instrução.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "20", tipo: "certo_errado", enunciado: "Os serviços de escala e outros de natureza permanente independem do horário do expediente da unidade.", gabarito: "certo", explicacao: "Correto, assim como os trabalhos em situações anormais." },
  { modulo: "20", tipo: "certo_errado", enunciado: "O toque de 'ordem' (fim do expediente) só será executado após o SCmt U receber todos os mapas diários do armamento emitidos pelos respectivos Cmt SU.", gabarito: "certo", explicacao: "Correto. É condição para o toque de ordem." },
  { modulo: "20", tipo: "certo_errado", enunciado: "O expediente termina com a formatura geral da unidade.", gabarito: "errado", explicacao: "Errado. O expediente COMEÇA com a formatura geral; termina após a leitura do BI, com o toque de fim do expediente." },
  { modulo: "20", tipo: "certo_errado", enunciado: "As praças podem afastar-se do quartel durante o expediente independentemente de qualquer autorização.", gabarito: "errado", explicacao: "Errado. As praças só se afastam com autorização do Cmt de companhia ou do chefe de repartição interna." },
  { modulo: "20", tipo: "multipla", enunciado: "Sobre o início e o término do expediente, assinale a alternativa CORRETA:", alternativas: A(
    "começa com a formatura geral e termina após a leitura do BI, com o toque de fim do expediente",
    "começa com a leitura do BI e termina com a formatura geral",
    "começa e termina com o toque de alvorada",
    "começa ao meio-dia e termina à meia-noite",
    "começa com a revista do recolher e termina ao silêncio"),
    gabarito: "A", explicacao: "Formatura geral (início) → leitura do BI e toque de fim (término)." },
  { modulo: "20", tipo: "multipla", enunciado: "O toque de 'ordem' (fim do expediente) será executado somente após:", alternativas: A(
    "o SCmt U receber todos os mapas diários do armamento dos Cmt SU",
    "a chegada do Of Dia",
    "o fechamento dos portões às 18h",
    "a leitura do silêncio",
    "a revista do recolher"),
    gabarito: "A", explicacao: "Condição: recebimento de todos os mapas diários do armamento pelo SCmt U." },
  { modulo: "20", tipo: "multipla", enunciado: "Durante o expediente, os oficiais só podem afastar-se do quartel mediante permissão do:", alternativas: A(
    "Cmt U, que poderá delegá-la ao SCmt",
    "Of Dia",
    "Cmt da Guarda",
    "plantão da hora",
    "P3"),
    gabarito: "A", explicacao: "Permissão do Cmt U (delegável ao SCmt); as praças, com autorização do Cmt de companhia/chefe de repartição." },
  { modulo: "20", tipo: "dissertativa", enunciado: "Conceitue o expediente e descreva seu início e término, bem como a condição para o toque de 'ordem'.", modelo: { estrutura: "Conceito → início (formatura geral) → término (leitura do BI) → toque de ordem (mapas do armamento).", criterios: ["Fase da jornada destinada aos trabalhos normais de administração e funcionamento das repartições", "Começa com a formatura geral", "Termina após a leitura do BI, com o toque de fim do expediente", "Toque de 'ordem' só após o SCmt receber todos os mapas diários do armamento"], resposta: "O expediente é a fase da jornada destinada à preparação e execução dos trabalhos normais da administração da unidade e ao funcionamento das repartições e dependências internas. Começa normalmente com a formatura geral, da unidade ou de companhia — que corresponde a um tempo de instrução — e termina depois da leitura do BI do dia, com o toque ou sinal de fim do expediente. O toque de 'ordem' (fim do expediente) só será executado, por ordem do Cmt U, após o recebimento, pelo SCmt U, de todos os mapas diários do armamento emitidos pelos respectivos Cmt SU. Os serviços de escala e os de natureza permanente independem do horário do expediente." } },

  // ════════════════════ MÓDULO 21 — Das Escalas de Serviço ════════════════════
  { modulo: "21", tipo: "certo_errado", enunciado: "A escala de serviço tem por finalidade principal a distribuição equitativa de todos os serviços de uma OME.", gabarito: "certo", explicacao: "Correto. É a relação do pessoal ou frações que concorrem a determinado serviço." },
  { modulo: "21", tipo: "certo_errado", enunciado: "O serviço externo é escalado antes do interno e, em cada caso, o extraordinário antes do ordinário.", gabarito: "certo", explicacao: "Correto (regra I)." },
  { modulo: "21", tipo: "certo_errado", enunciado: "Entre dois serviços, de mesma natureza ou de natureza diferente, observa-se, para o mesmo indivíduo, no mínimo a folga de quarenta e oito horas, sempre que possível.", gabarito: "certo", explicacao: "Correto (regra V)." },
  { modulo: "21", tipo: "certo_errado", enunciado: "Só depois de apresentado pronto à unidade poderá o militar ser escalado para qualquer serviço.", gabarito: "certo", explicacao: "Correto (regra X)." },
  { modulo: "21", tipo: "certo_errado", enunciado: "Durante o período de gravidez e até que a criança atinja a idade de seis meses, a militar não concorre aos serviços de escala.", gabarito: "certo", explicacao: "Correto (regra XIV)." },
  { modulo: "21", tipo: "certo_errado", enunciado: "Em igualdade de folga, designa-se primeiro o militar de maior posto ou graduação, ou mais antigo.", gabarito: "errado", explicacao: "Errado. Em igualdade de folga, designa-se o de MENOR posto ou graduação, ou mais MODERNO (regra III)." },
  { modulo: "21", tipo: "certo_errado", enunciado: "As folgas são contadas em conjunto para todos os serviços.", gabarito: "errado", explicacao: "Errado. As folgas são contadas SEPARADAMENTE para cada serviço (regra IV)." },
  { modulo: "21", tipo: "multipla", enunciado: "Sobre a ordem de escalação, assinale a alternativa CORRETA:", alternativas: A(
    "o serviço externo é escalado antes do interno e o extraordinário antes do ordinário",
    "o serviço interno é escalado antes do externo",
    "o ordinário é escalado antes do extraordinário",
    "a ordem é livre, a critério do P1",
    "o serviço recai sempre no mais antigo"),
    gabarito: "A", explicacao: "Externo antes do interno; extraordinário antes do ordinário (regra I)." },
  { modulo: "21", tipo: "multipla", enunciado: "A folga mínima a observar, sempre que possível, entre dois serviços para o mesmo militar é de:", alternativas: A(
    "quarenta e oito horas", "vinte e quatro horas", "doze horas", "setenta e duas horas", "trinta e seis horas"),
    gabarito: "A", explicacao: "No mínimo 48 horas, sempre que possível (regra V)." },
  { modulo: "21", tipo: "multipla", enunciado: "Em igualdade de folga, a designação para o serviço recairá, primeiro, no militar:", alternativas: A(
    "de menor posto ou graduação, ou mais moderno",
    "de maior posto ou graduação, ou mais antigo",
    "que tiver menor folga",
    "escolhido pelo Cmt da Guarda",
    "que estiver de licença"),
    gabarito: "A", explicacao: "Regra III: menor posto/graduação ou mais moderno." },
  { modulo: "21", tipo: "dissertativa", enunciado: "Conceitue escala de serviço e enuncie quatro de suas regras.", modelo: { estrutura: "Conceito → 4 regras.", criterios: ["Relação do pessoal/frações que concorrem a determinado serviço; finalidade: distribuição equitativa", "Externo antes do interno; extraordinário antes do ordinário", "Designação recai em quem maior folga tiver; em igualdade, o de menor posto/mais moderno", "Folga mínima de 48h; só escalado depois de pronto; folgas contadas separadamente; gestante não concorre até 6 meses"], resposta: "A escala de serviço é a relação do pessoal ou das frações de tropa que concorrem na execução de determinado serviço, tendo por finalidade principal a distribuição equitativa de todos os serviços da OME. Entre suas regras: o serviço externo é escalado antes do interno e o extraordinário antes do ordinário; a designação recai em quem, no mesmo serviço, maior folga tiver, e, em igualdade de folga, no de menor posto ou graduação, ou mais moderno; as folgas são contadas separadamente para cada serviço e observa-se, no mínimo, folga de 48 horas entre dois serviços, sempre que possível; só depois de apresentado pronto à unidade o militar pode ser escalado; e a militar não concorre à escala durante a gravidez e até a criança completar seis meses." } },

  // ════════════════════ MÓDULO 22 — Do Serviço Interno ════════════════════
  { modulo: "22", tipo: "certo_errado", enunciado: "O serviço interno abrange todos os trabalhos necessários ao funcionamento da unidade.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "22", tipo: "certo_errado", enunciado: "O serviço interno compreende o serviço permanente e o serviço de escala.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "22", tipo: "certo_errado", enunciado: "A fiscalização dos serviços de escala compete ao SCmt U, ao Of de Operações e ao Graduado de Operações.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "22", tipo: "certo_errado", enunciado: "O serviço será determinado, quando possível, à mesma fração de tropa, em sua totalidade, visando o necessário entrosamento.", gabarito: "certo", explicacao: "Correto. Estende-se às menores frações." },
  { modulo: "22", tipo: "certo_errado", enunciado: "O serviço interno compreende apenas o serviço de escala.", gabarito: "errado", explicacao: "Errado. Compreende o serviço permanente E o serviço de escala." },
  { modulo: "22", tipo: "certo_errado", enunciado: "A fiscalização dos serviços de escala compete exclusivamente ao Cmt U.", gabarito: "errado", explicacao: "Errado. Compete ao SCmt U, ao Of de Operações e ao Graduado de Operações." },
  { modulo: "22", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "O serviço de escala inclui a portaria e os serviços gerais.", gabarito: "errado", explicacao: "Errado. 'Portaria e serviços gerais' NÃO integra o serviço de escala (foi a alternativa de exceção da prova)." },
  { modulo: "22", tipo: "multipla", enunciado: "O serviço interno compreende:", alternativas: A(
    "o serviço permanente e o serviço de escala",
    "apenas o serviço de escala",
    "apenas o serviço permanente",
    "somente os serviços extraordinários",
    "apenas as faxinas"),
    gabarito: "A", explicacao: "Serviço permanente + serviço de escala." },
  { modulo: "22", tipo: "multipla", enunciado: "A fiscalização dos serviços de escala compete:", alternativas: A(
    "ao SCmt U, ao Of de Operações e ao Graduado de Operações",
    "apenas ao Cmt U",
    "ao P1 e ao ajudante-secretário",
    "ao Cmt da Guarda e ao plantão",
    "ao SEI e ao P4"),
    gabarito: "A", explicacao: "SCmt U, Of de Operações e Graduado de Operações." },
  { modulo: "22", tipo: "multipla", fonte: "2ª AE IG/2026", enunciado: "Sobre o serviço interno, o serviço de escala compreende, EXCETO:", alternativas: A(
    "Portaria e serviços gerais.",
    "Guarda do quartel.",
    "Sgt Dia SU.",
    "Guarda das SU (alojamentos, garagens, cavalariças, canis).",
    "Serviço-de-dia ao rancho (Sgt Dia, cozinheiro, cassineiro)."),
    gabarito: "A", explicacao: "A escala NÃO inclui 'portaria e serviços gerais'." },
  { modulo: "22", tipo: "dissertativa", enunciado: "Conceitue serviço interno, indique o que ele compreende e a quem cabe a fiscalização dos serviços de escala.", modelo: { estrutura: "Conceito → composição (permanente + escala) → fiscalização.", criterios: ["Abrange todos os trabalhos necessários ao funcionamento da unidade", "Compreende o serviço permanente e o serviço de escala", "Determinado, quando possível, à mesma fração de tropa", "Fiscalização: SCmt U, Of de Operações e Graduado de Operações"], resposta: "O serviço interno abrange todos os trabalhos necessários ao funcionamento da unidade e compreende o serviço permanente e o serviço de escala. O serviço será determinado, quando possível, à mesma fração de tropa, em sua totalidade, estendendo-se esse princípio às menores frações, de modo que os homens reunidos em um mesmo serviço tenham o necessário entrosamento decorrente do convívio diário. A fiscalização dos serviços de escala compete ao SCmt U, ao Of de Operações e ao Graduado de Operações." } },

  // ════════════════════ MÓDULO 23 — Do Oficial de Dia (de Operações) ════════════════════
  { modulo: "23", tipo: "certo_errado", enunciado: "Fora do expediente, o Oficial de Dia é o representante do Cmt U.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "23", tipo: "certo_errado", enunciado: "Compete ao Of Dia assegurar, durante o seu serviço, o exato cumprimento das ordens da unidade e das disposições regulamentares relativas ao serviço diário.", gabarito: "certo", explicacao: "Correto (inciso I)." },
  { modulo: "23", tipo: "certo_errado", enunciado: "Ao assumir o serviço, o Of Dia deve verificar, em companhia de seu antecessor, se todas as dependências do quartel estão em ordem.", gabarito: "certo", explicacao: "Correto (inciso IV)." },
  { modulo: "23", tipo: "certo_errado", enunciado: "Compete ao Of Dia receber qualquer autoridade civil ou militar de categoria igual ou superior à do Cmt U e acompanhá-la à presença deste.", gabarito: "certo", explicacao: "Correto (inciso VIII)." },
  { modulo: "23", tipo: "certo_errado", enunciado: "O Of Dia deve permanecer no quartel durante as horas determinadas, sempre pronto e uniformizado para atender a qualquer eventualidade.", gabarito: "certo", explicacao: "Correto (inciso XXIV)." },
  { modulo: "23", tipo: "certo_errado", enunciado: "Durante o expediente, o Oficial de Dia é o representante do Cmt U.", gabarito: "errado", explicacao: "Errado. É FORA do expediente que o Of Dia representa o Cmt U." },
  { modulo: "23", tipo: "certo_errado", enunciado: "O Of Dia deve estar familiarizado com os planos de segurança do aquartelamento, de combate a incêndio e de chamada.", gabarito: "certo", explicacao: "Correto (inciso II)." },
  { modulo: "23", tipo: "multipla", enunciado: "O Oficial de Dia é o representante do Cmt U:", alternativas: A(
    "fora do expediente", "durante o expediente", "apenas nas formaturas", "somente à noite", "apenas em situações anormais"),
    gabarito: "A", explicacao: "Fora do expediente, o Of Dia representa o Cmt U." },
  { modulo: "23", tipo: "multipla", enunciado: "É atribuição do Of Dia:", alternativas: A(
    "receber autoridade de categoria igual ou superior à do Cmt e acompanhá-la à presença deste",
    "organizar as cerimônias militares",
    "manter o histórico da unidade",
    "planejar a instrução",
    "autenticar as cópias do BI"),
    gabarito: "A", explicacao: "Inciso VIII das atribuições do Of Dia." },
  { modulo: "23", tipo: "multipla", enunciado: "Assinale a alternativa que NÃO é atribuição do Of Dia:", alternativas: A(
    "Organizar as cerimônias militares da unidade.",
    "Assegurar o cumprimento das ordens e disposições do serviço diário.",
    "Verificar, ao assumir, se as dependências estão em ordem.",
    "Participar ao SCmt as ocorrências extraordinárias.",
    "Permanecer no quartel, pronto e uniformizado."),
    gabarito: "A", explicacao: "Organizar as cerimônias militares é do P3, não do Of Dia." },
  { modulo: "23", tipo: "dissertativa", enunciado: "Defina o papel do Oficial de Dia e cite quatro de suas atribuições.", modelo: { estrutura: "Papel (representante do Cmt fora do expediente) → 4 atribuições.", criterios: ["Fora do expediente é o representante do Cmt U", "Assegurar o cumprimento das ordens do serviço diário", "Familiarizar-se com os planos de segurança/incêndio/chamada", "Verificar as dependências ao assumir; receber autoridade igual/superior; participar ocorrências ao SCmt; permanecer pronto e uniformizado"], resposta: "O Oficial de Dia é, fora do expediente, o representante do Cmt U, competindo-lhe: assegurar, durante o seu serviço, o exato cumprimento das ordens da unidade e das disposições regulamentares relativas ao serviço diário; estar familiarizado com os planos de segurança do aquartelamento, de combate a incêndio e de chamada; verificar, ao assumir, em companhia do antecessor, se as dependências estão em ordem; receber qualquer autoridade de categoria igual ou superior à do Cmt e acompanhá-la; participar ao SCmt todas as ocorrências extraordinárias; e permanecer no quartel, sempre pronto e uniformizado, para atender a qualquer eventualidade." } },

  // ════════════════════ MÓDULO 24 — Do Adjunto ao Oficial de Dia (Graduado de Operações) ════════════════════
  { modulo: "24", tipo: "certo_errado", enunciado: "O Sgt Adjunto é o auxiliar imediato do Oficial de Dia.", gabarito: "certo", explicacao: "Correto. Executa e faz executar as determinações do Of Dia." },
  { modulo: "24", tipo: "certo_errado", enunciado: "Compete ao Sgt Adjunto responder, perante o Of Dia, pela perfeita execução da limpeza do quartel a cargo do cabo da faxina.", gabarito: "certo", explicacao: "Correto (inciso IV)." },
  { modulo: "24", tipo: "certo_errado", enunciado: "O Sgt Adjunto acompanha o Of Dia nas suas visitas às dependências do quartel, salvo quando dispensado ou na execução de outro serviço.", gabarito: "certo", explicacao: "Correto (inciso VI)." },
  { modulo: "24", tipo: "certo_errado", enunciado: "O Sgt Adjunto responde pelo Of Dia em seus impedimentos eventuais.", gabarito: "certo", explicacao: "Correto (inciso XIV)." },
  { modulo: "24", tipo: "certo_errado", enunciado: "Compete ao Sgt Adjunto passar revista às Companhias, quando determinado pelo Of Dia.", gabarito: "certo", explicacao: "Correto (inciso VII)." },
  { modulo: "24", tipo: "certo_errado", enunciado: "O Sgt Adjunto é o representante do Cmt U fora do expediente.", gabarito: "errado", explicacao: "Errado. Esse é o papel do Of Dia; o Sgt Adj é seu auxiliar imediato." },
  { modulo: "24", tipo: "certo_errado", enunciado: "Compete ao Sgt Adjunto providenciar para que as chaves das dependências do quartel estejam no claviculário, logo após o toque de ordem.", gabarito: "certo", explicacao: "Correto (inciso XIII), informando ao Of Dia qualquer falta." },
  { modulo: "24", tipo: "multipla", enunciado: "O Sgt Adjunto (Graduado de Operações) é o auxiliar imediato do:", alternativas: A(
    "Oficial de Dia", "Comandante da Guarda", "P1", "Subcomandante", "plantão da hora"),
    gabarito: "A", explicacao: "É o auxiliar imediato do Of Dia." },
  { modulo: "24", tipo: "multipla", enunciado: "É atribuição do Sgt Adjunto:", alternativas: A(
    "responder pela limpeza do quartel a cargo do cabo da faxina",
    "organizar as cerimônias militares",
    "autenticar as cópias do BI",
    "estabelecer as NGA/U",
    "conceder férias aos subordinados"),
    gabarito: "A", explicacao: "Inciso IV das atribuições do Sgt Adj." },
  { modulo: "24", tipo: "multipla", enunciado: "Quando o Adjunto responder eventualmente pelo Of Dia, deverá:", alternativas: A(
    "participar-lhe as ocorrências havidas durante o impedimento, mesmo já comunicadas ou providenciadas",
    "omitir as ocorrências já providenciadas",
    "assumir definitivamente a função",
    "comunicar diretamente ao Cmt-Geral",
    "encerrar o serviço da unidade"),
    gabarito: "A", explicacao: "Deve participar as ocorrências ao Of Dia, mesmo que já as tenha comunicado ou providenciado." },
  { modulo: "24", tipo: "dissertativa", enunciado: "Apresente a função do Sgt Adjunto ao Oficial de Dia e cite quatro de suas atribuições.", modelo: { estrutura: "Auxiliar imediato do Of Dia → 4 atribuições.", criterios: ["Auxiliar imediato do Of Dia", "Transmitir e fazer executar as ordens; responder pela limpeza a cargo do cabo da faxina", "Acompanhar nas visitas; passar revista às Companhias quando determinado", "Providenciar as chaves no claviculário; responder pelo Of Dia em impedimentos eventuais"], resposta: "O Sgt Adjunto é o auxiliar imediato do Of Dia, competindo-lhe: apresentar-se ao Of Dia e executar e fazer executar todas as suas determinações; transmitir as ordens recebidas e inteirá-lo da execução; responder, perante o Of Dia, pela perfeita execução da limpeza do quartel a cargo do cabo da faxina; acompanhar o Of Dia nas visitas às dependências; passar revista às Companhias quando determinado; providenciar para que as chaves das dependências estejam no claviculário logo após o toque de ordem; e responder pelo Of Dia em seus impedimentos eventuais." } },

  // ════════════════════ MÓDULO 25 — Do Serviço de Guarda do Quartel ════════════════════
  { modulo: "25", tipo: "certo_errado", enunciado: "A guarda do quartel é normalmente comandada por um 2º ou 3º Sargento e constituída dos cabos e soldados necessários ao serviço de sentinelas.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "25", tipo: "certo_errado", enunciado: "Excepcionalmente, a guarda do quartel será comandada por oficial, caso em que será acrescida de um corneteiro ou clarim, passando o sargento às funções de auxiliar do Cmt Gd.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "25", tipo: "certo_errado", enunciado: "A guarda do quartel tem por uma de suas finalidades manter a segurança do quartel.", gabarito: "certo", explicacao: "Correto (finalidade I)." },
  { modulo: "25", tipo: "certo_errado", enunciado: "À guarda do quartel cabe não permitir a entrada de bebidas alcoólicas, inflamáveis, explosivos e outros artigos proibidos, exceto os que constituírem suprimento para a unidade.", gabarito: "certo", explicacao: "Correto (finalidade V)." },
  { modulo: "25", tipo: "certo_errado", enunciado: "No corpo da guarda é proibida a permanência de civis ou de praças estranhas à guarda do quartel.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "25", tipo: "certo_errado", enunciado: "A guarda do quartel é, normalmente, comandada por um oficial.", gabarito: "errado", explicacao: "Errado. É normalmente comandada por 2º ou 3º Sgt; o comando por oficial é excepcional." },
  { modulo: "25", tipo: "certo_errado", enunciado: "Cabe à guarda impedir a saída de praças que não estejam convenientemente fardadas, salvo as autorizadas a trajar civil e adequadamente trajadas.", gabarito: "certo", explicacao: "Correto (finalidade III)." },
  { modulo: "25", tipo: "multipla", enunciado: "A guarda do quartel é normalmente comandada por:", alternativas: A(
    "um 2º ou 3º Sargento", "um oficial", "um cabo", "um soldado mais antigo", "o Subtenente"),
    gabarito: "A", explicacao: "Normalmente 2º ou 3º Sgt; excepcionalmente, oficial." },
  { modulo: "25", tipo: "multipla", enunciado: "É finalidade da guarda do quartel:", alternativas: A(
    "manter a segurança do quartel e impedir a entrada de bebidas alcoólicas, inflamáveis e explosivos",
    "organizar as cerimônias militares",
    "planejar a instrução da unidade",
    "manter o histórico da unidade",
    "autenticar o BI"),
    gabarito: "A", explicacao: "Segurança do quartel e controle de entrada de artigos proibidos." },
  { modulo: "25", tipo: "multipla", enunciado: "Quando comandada excepcionalmente por oficial, a guarda do quartel será acrescida de:", alternativas: A(
    "um corneteiro ou clarim", "mais dois sargentos", "um pelotão de reserva", "um Porta-Bandeira", "uma banda de música"),
    gabarito: "A", explicacao: "Acrescida de corneteiro/clarim; o sargento passa a auxiliar do Cmt Gd." },
  { modulo: "25", tipo: "dissertativa", enunciado: "Descreva a composição e as principais finalidades do serviço de guarda do quartel.", modelo: { estrutura: "Composição (2º/3º Sgt + cabos/soldados; excepcional por oficial) → finalidades.", criterios: ["Normalmente comandada por 2º ou 3º Sgt; cabos e soldados (sentinelas)", "Excepcionalmente por oficial, acrescida de corneteiro/clarim", "Finalidades: segurança do quartel; impedir entrada de artigos proibidos; controlar entrada/saída de pessoas, viaturas e material; prestar continências"], resposta: "A guarda do quartel é normalmente comandada por um 2º ou 3º Sargento e constituída pelos cabos e soldados necessários ao serviço de sentinelas; excepcionalmente, é comandada por oficial, sendo então acrescida de um corneteiro ou clarim, passando o sargento à função de auxiliar do Cmt Gd. Todo o pessoal mantém-se uniformizado, equipado e armado, pronto para entrar em forma. Suas principais finalidades são: manter a segurança do quartel; impedir a saída de praças mal fardadas; não permitir a entrada de bebidas alcoólicas, inflamáveis e explosivos (salvo suprimento da unidade); impedir a entrada de força estranha sem ordem do Of Dia; controlar a entrada e saída de pessoas, viaturas e material; e prestar as continências regulamentares. No corpo da guarda é proibida a permanência de civis ou de praças estranhas à guarda." } },

  // ════════════════════ MÓDULO 26 — Do Comandante da Guarda do Quartel ════════════════════
  { modulo: "26", tipo: "certo_errado", enunciado: "O Cmt da Guarda é o responsável pela execução de todas as ordens referentes ao serviço da guarda e é subordinado, para esse efeito, diretamente ao Oficial de Dia.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "26", tipo: "certo_errado", enunciado: "Compete ao Cmt da Guarda formar a guarda rapidamente ao sinal de alarme dado pelas sentinelas, reconhecer o motivo e agir por iniciativa própria, se for o caso.", gabarito: "certo", explicacao: "Correto (inciso I)." },
  { modulo: "26", tipo: "certo_errado", enunciado: "Compete ao Cmt da Guarda fechar os portões do quartel às dezoito horas, deixando aberta apenas a passagem individual do portão principal.", gabarito: "certo", explicacao: "Correto (inciso XVI)." },
  { modulo: "26", tipo: "certo_errado", enunciado: "O Cmt da Guarda conserva em seu poder, durante o dia, as chaves das diferentes entradas do quartel, entregando-as ao Of Dia às vinte e uma horas, exceto a do portão principal.", gabarito: "certo", explicacao: "Correto (inciso XVII)." },
  { modulo: "26", tipo: "certo_errado", enunciado: "Compete ao Cmt da Guarda revistar as viaturas estranhas, militares e civis, à entrada e à saída do quartel.", gabarito: "certo", explicacao: "Correto (inciso XXV)." },
  { modulo: "26", tipo: "certo_errado", enunciado: "O Cmt da Guarda é subordinado diretamente ao Cmt U.", gabarito: "errado", explicacao: "Errado. É subordinado diretamente ao Oficial de Dia." },
  { modulo: "26", tipo: "certo_errado", enunciado: "Compete ao Cmt da Guarda entregar ao Of Dia, após substituído, a parte da guarda, com a relação nominal das praças, os roteiros das sentinelas e as ocorrências do serviço.", gabarito: "certo", explicacao: "Correto (inciso XIX)." },
  { modulo: "26", tipo: "multipla", enunciado: "O Comandante da Guarda do Quartel é subordinado diretamente ao:", alternativas: A(
    "Oficial de Dia", "Comandante da Unidade", "Subcomandante", "P1", "Cmt de Companhia"),
    gabarito: "A", explicacao: "Subordinado diretamente ao Of Dia." },
  { modulo: "26", tipo: "multipla", enunciado: "Sobre os horários a cargo do Cmt da Guarda, assinale a alternativa CORRETA:", alternativas: A(
    "fecha os portões às 18h (deixando a passagem individual do portão principal) e entrega as chaves ao Of Dia às 21h, exceto a do portão principal",
    "fecha os portões às 21h e entrega as chaves às 18h",
    "mantém todos os portões abertos durante a noite",
    "entrega todas as chaves, inclusive a do portão principal, às 18h",
    "não tem responsabilidade sobre as chaves do quartel"),
    gabarito: "A", explicacao: "Portões às 18h; chaves ao Of Dia às 21h, exceto a do portão principal." },
  { modulo: "26", tipo: "multipla", enunciado: "Assinale a alternativa que NÃO é atribuição do Cmt da Guarda:", alternativas: A(
    "Estabelecer as NGA/U da unidade.",
    "Formar a guarda ao sinal de alarme.",
    "Conferir o material do corpo da guarda ao assumir.",
    "Revistar as viaturas estranhas à entrada e à saída.",
    "Entregar a parte da guarda ao Of Dia após substituído."),
    gabarito: "A", explicacao: "Estabelecer as NGA/U é atribuição do Comandante da Unidade, não do Cmt da Guarda." },
  { modulo: "26", tipo: "dissertativa", enunciado: "Apresente a subordinação do Cmt da Guarda e quatro de suas atribuições.", modelo: { estrutura: "Subordinação (Of Dia) → 4 atribuições.", criterios: ["Responsável pela execução das ordens do serviço da guarda; subordinado ao Of Dia", "Formar a guarda ao sinal de alarme; conferir o material ao assumir", "Fechar os portões às 18h; conservar as chaves e entregá-las ao Of Dia às 21h (exceto portão principal)", "Revistar viaturas estranhas; entregar a parte da guarda ao Of Dia"], resposta: "O Cmt da Guarda é o responsável pela execução de todas as ordens referentes ao serviço da guarda e subordina-se, para esse efeito, diretamente ao Oficial de Dia. Compete-lhe, entre outras: formar a guarda rapidamente ao sinal de alarme dado pelas sentinelas; conferir, ao assumir, o material distribuído ao corpo da guarda; fechar os portões do quartel às 18 horas, deixando aberta apenas a passagem individual do portão principal; conservar durante o dia as chaves das entradas, entregando-as ao Of Dia às 21 horas, exceto a do portão principal; revistar as viaturas estranhas, militares e civis, à entrada e à saída; e entregar ao Of Dia, após substituído, a parte da guarda, com a relação nominal das praças, os roteiros das sentinelas e as ocorrências do serviço." } },

  // ════════════════════ MÓDULO 27 — Do Plantão ════════════════════
  { modulo: "27", tipo: "certo_errado", enunciado: "O plantão de serviço (plantão da hora) é a sentinela da Subunidade (SU).", gabarito: "certo", explicacao: "Correto." },
  { modulo: "27", tipo: "certo_errado", enunciado: "Compete ao plantão estar atento a tudo o que ocorrer no alojamento, participando imediatamente ao Cabo Dia qualquer alteração que verificar.", gabarito: "certo", explicacao: "Correto (inciso I)." },
  { modulo: "27", tipo: "certo_errado", enunciado: "Compete ao plantão fazer levantar, nos dias com expediente, as praças ao findar o toque de alvorada, coadjuvando a ação do Cabo Dia.", gabarito: "certo", explicacao: "Correto (inciso VII)." },
  { modulo: "27", tipo: "certo_errado", enunciado: "O plantão não deve consentir a entrada de civis no alojamento sem que estejam acompanhados por um oficial ou sargento.", gabarito: "certo", explicacao: "Correto (inciso VIII)." },
  { modulo: "27", tipo: "certo_errado", enunciado: "O posto do plantão da hora localiza-se, normalmente, na entrada do alojamento, devendo o plantão percorrê-lo algumas vezes.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "27", tipo: "certo_errado", enunciado: "O plantão pode permitir conversa em voz alta no alojamento após o toque de silêncio.", gabarito: "errado", explicacao: "Errado. Deve impedir conversa em voz alta e qualquer perturbação do silêncio após o respectivo toque (inciso XIII)." },
  { modulo: "27", tipo: "certo_errado", enunciado: "Os plantões são substituídos, ordinariamente, às mesmas horas que as sentinelas da guarda do quartel.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "27", tipo: "multipla", enunciado: "O plantão da hora é a sentinela:", alternativas: A(
    "da Subunidade (SU)", "do portão principal", "do paiol de munição", "da guarda do quartel", "do gabinete do Cmt"),
    gabarito: "A", explicacao: "É a sentinela da SU, com posto na entrada do alojamento." },
  { modulo: "27", tipo: "multipla", enunciado: "É atribuição do plantão da hora:", alternativas: A(
    "fazer levantar as praças, nos dias com expediente, ao findar o toque de alvorada",
    "comandar a guarda do quartel",
    "autenticar o BI",
    "organizar as escalas de serviço",
    "estabelecer as NGA/U"),
    gabarito: "A", explicacao: "Inciso VII: fazer levantar as praças à alvorada, coadjuvando o Cabo Dia." },
  { modulo: "27", tipo: "multipla", enunciado: "Caso o plantão da hora não se aperceba da entrada de um oficial no alojamento:", alternativas: A(
    "qualquer praça dará o sinal ou a voz que àquele compete",
    "ninguém deve avisar a entrada do oficial",
    "o oficial deve aguardar do lado de fora",
    "o Cmt da Guarda assume o alojamento",
    "o expediente é encerrado"),
    gabarito: "A", explicacao: "Qualquer praça dá o sinal/voz que compete ao plantão." },
  { modulo: "27", tipo: "dissertativa", enunciado: "Conceitue o plantão da hora e cite quatro de seus deveres.", modelo: { estrutura: "Conceito (sentinela da SU) → 4 deveres.", criterios: ["Sentinela da SU; posto na entrada do alojamento", "Atento ao alojamento; participa ao Cabo Dia qualquer alteração", "Faz levantar as praças à alvorada; não consente civis sem oficial/sargento", "Impede conversa em voz alta após o silêncio; dá o sinal de silêncio; acende/apaga as luzes"], resposta: "O plantão de serviço (plantão da hora) é a sentinela da Subunidade, com posto normalmente na entrada do alojamento, que deve percorrer algumas vezes. Entre seus deveres: estar atento a tudo o que ocorrer no alojamento, participando imediatamente ao Cabo Dia qualquer alteração; fazer levantar as praças, nos dias com expediente, ao findar o toque de alvorada; não consentir a entrada de civis no alojamento sem que estejam acompanhados por oficial ou sargento; impedir conversa em voz alta e qualquer perturbação do silêncio após o respectivo toque; dar o sinal de 'silêncio' após a última nota do toque; e acender e apagar as luzes do alojamento nas horas determinadas. Os plantões são substituídos às mesmas horas que as sentinelas da guarda." } },

  // ════════════════════ MÓDULO 28 — Das Formaturas ════════════════════
  { modulo: "28", tipo: "certo_errado", enunciado: "Formatura é toda reunião do pessoal em forma, armado ou desarmado.", gabarito: "certo", explicacao: "Correto. Pode ser geral ou parcial; ordinária ou extraordinária." },
  { modulo: "28", tipo: "certo_errado", enunciado: "A formatura pode ser geral ou parcial, da unidade ou da Companhia, e ordinária ou extraordinária.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "28", tipo: "certo_errado", enunciado: "As formaturas extraordinárias podem ser previstas ou inopinadas.", gabarito: "certo", explicacao: "Correto. As previstas constam dos programas/BI; as inopinadas são impostas pelas circunstâncias." },
  { modulo: "28", tipo: "certo_errado", enunciado: "Reunidas as Companhias no local e à hora marcados para a formatura da unidade, o SCmt U assume o comando de toda a tropa até a chegada do Cmt U.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "28", tipo: "certo_errado", enunciado: "O Cmt U só se aproximará do local da formatura depois de avisado, pelo P3, de que a tropa se encontra pronta para recebê-lo.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "28", tipo: "certo_errado", enunciado: "Toda formatura tem origem, em regra, no Estado-Maior da unidade.", gabarito: "errado", explicacao: "Errado. Toda formatura tem origem, em regra, na companhia, pela reunião dos que dela devam participar." },
  { modulo: "28", tipo: "certo_errado", enunciado: "São formaturas ordinárias as destinadas às revistas normais do pessoal, ao rancho, à Parada, à leitura do BI e à instrução.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "28", tipo: "multipla", enunciado: "Quanto à classificação, a formatura pode ser:", alternativas: A(
    "geral ou parcial; ordinária ou extraordinária",
    "diurna ou noturna; armada ou desarmada",
    "interna ou externa; cívica ou militar",
    "individual ou coletiva; simples ou solene",
    "permanente ou eventual; fixa ou móvel"),
    gabarito: "A", explicacao: "Geral/parcial (unidade ou Cia) e ordinária/extraordinária." },
  { modulo: "28", tipo: "multipla", enunciado: "Reunidas as Companhias para a formatura da unidade, quem assume o comando da tropa até a chegada do Cmt U?", alternativas: A(
    "o Subcomandante (SCmt U)", "o P3", "o oficial mais moderno", "o Cmt da Guarda", "o Of Dia"),
    gabarito: "A", explicacao: "O SCmt U assume até a chegada do Cmt U; o P3 avisa que a tropa está pronta." },
  { modulo: "28", tipo: "multipla", enunciado: "São formaturas ordinárias, EXCETO:", alternativas: A(
    "as destinadas a solenidades externas determinadas em BI",
    "as revistas normais do pessoal",
    "a formatura ao rancho",
    "a formatura à leitura do BI",
    "a formatura à instrução"),
    gabarito: "A", explicacao: "Solenidades determinadas em BI são formaturas EXTRAORDINÁRIAS previstas." },
  { modulo: "28", tipo: "dissertativa", enunciado: "Conceitue formatura, apresente sua classificação e descreva como se dá a reunião da tropa para a formatura geral da unidade.", modelo: { estrutura: "Conceito → classificação → reunião (origem na Cia; SCmt assume; P3 avisa).", criterios: ["Reunião do pessoal em forma, armado ou desarmado", "Geral/parcial; ordinária/extraordinária (previstas ou inopinadas)", "Origem na companhia; subalternos revistam as frações; mais antigo apresenta ao Cmt SU", "SCmt assume até a chegada do Cmt; o Cmt só se aproxima após aviso do P3"], resposta: "Formatura é toda reunião do pessoal em forma, armado ou desarmado, podendo ser geral ou parcial, da unidade ou da Companhia, e ordinária ou extraordinária — estas últimas previstas ou inopinadas. Toda formatura tem origem, em regra, na companhia, pela reunião dos oficiais e praças que dela devam participar: os subalternos passam revista às suas frações e o mais antigo apresenta a tropa ao Cmt SU, que a conduz ao local da reunião da unidade. Reunidas as Companhias no local e à hora marcados, o SCmt U assume o comando de toda a tropa até a chegada do Cmt U, que só se aproximará do local depois de avisado, pelo P3, de que a tropa se encontra pronta para recebê-lo." } },
]

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MAT } })
  if (!disc) throw new Error(`Disciplina ${MAT} não existe.`)

  // Remove questões IG obsoletas (de versões anteriores) que não fazem parte do novo conjunto.
  // Restrito aos módulos da apostila (1–28) — os módulos de provas (ex.: "AV1 2026 · 1ª CIA") são preservados.
  const novosHashes = QS.map(q => createHash("sha1").update(`${MAT}|${q.modulo}|${q.enunciado}`).digest("hex"))
  const modulosApostila = [...new Set(QS.map(q => q.modulo))]
  const del = await prisma.questao.deleteMany({ where: { materia: MAT, modulo: { in: modulosApostila }, hash: { notIn: novosHashes } } })
  if (del.count > 0) console.log(`Removidas ${del.count} questões IG obsoletas.`)

  let c = 0, u = 0
  for (const q of QS) {
    const hash = createHash("sha1").update(`${MAT}|${q.modulo}|${q.enunciado}`).digest("hex")
    const base: any = {
      materia: MAT, modulo: q.modulo, tipo: q.tipo, enunciado: q.enunciado, hash,
      fonte: ("fonte" in q && q.fonte) ? q.fonte : "Apostila IG + provas antigas (CFO PMPE)",
    }
    if (q.tipo === "multipla") { base.alternativas = q.alternativas; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else if (q.tipo === "certo_errado") { base.alternativas = []; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else { base.alternativas = []; base.gabarito = ""; base.modelo = q.modelo }
    const exists = await prisma.questao.findUnique({ where: { hash } })
    await prisma.questao.upsert({ where: { hash }, update: base, create: base })
    exists ? u++ : c++
  }
  const tot = await prisma.questao.count({ where: { materia: MAT } })
  console.log(`IG: ${c} criadas, ${u} atualizadas. Total ${MAT}: ${tot}.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
