import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "IG" // Instrução Geral

type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string; fonte?: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string; fonte?: string }
  | { modulo: string; tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string }; fonte?: string }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const QS: Q[] = [
  // ════════ MÓDULO 1 — Continência individual e sinais de respeito ════════
  { modulo: "1", tipo: "certo_errado", fonte: "1ª AE IG/2025 (adaptada)", enunciado: "Todo militar, em decorrência de sua condição, deve tratar com respeito e camaradagem os seus superiores hierárquicos; com afeição e consideração os seus pares; e com bondade, dignidade e urbanidade os seus subordinados.", gabarito: "errado", explicacao: "Errado. Inverte os termos do art. 3º: aos superiores devem-se RESPEITO e CONSIDERAÇÃO; aos pares, AFEIÇÃO e CAMARADAGEM; aos subordinados, bondade, dignidade e urbanidade." },
  { modulo: "1", tipo: "certo_errado", fonte: "1ª AE IG/2025", enunciado: "O militar manifesta respeito e apreço aos seus superiores, pares e subordinados pela continência, observando a precedência hierárquica e outras demonstrações de deferência.", gabarito: "certo", explicacao: "Correto. É a forma prática de manifestar respeito prevista no regulamento." },
  { modulo: "1", tipo: "certo_errado", fonte: "1ª AE IG/2025 (adaptada)", enunciado: "Não há obrigatoriedade nos sinais de respeito entre membros das Forças Armadas e das Forças Auxiliares (PM e CBM).", gabarito: "errado", explicacao: "Errado. O art. 3º, §2º estabelece reciprocidade OBRIGATÓRIA: o respeito devido entre as FFAA também se aplica a PM, CBM e militares estrangeiros." },
  { modulo: "1", tipo: "certo_errado", fonte: "1ª AE IG/2025", enunciado: "Os sinais de respeito e apreço são obrigatórios em todas as situações.", gabarito: "certo", explicacao: "Correto (art. 4º, §3º). Atenção: a CONTINÊNCIA, porém, pode ser dispensada conforme a situação — ela é só uma das formas de sinal de respeito." },
  { modulo: "1", tipo: "certo_errado", fonte: "1ª AE IG/2025 (adaptada)", enunciado: "Quando dois militares se deslocam juntos, o de menor antiguidade fica à direita do superior.", gabarito: "errado", explicacao: "Errado. O de menor antiguidade DÁ a direita ao superior (art. 5º), ou seja, o superior é quem fica à direita." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Quando os militares se deslocam em grupo (três ou mais), o mais antigo fica no centro, distribuindo-se os demais alternadamente à direita e à esquerda.", gabarito: "certo", explicacao: "Correto (art. 6º)." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Para se dirigir a um superior, é sinal de respeito empregar o termo 'Comando'.", gabarito: "errado", explicacao: "Errado. O art. 9º determina o uso de 'Senhor'/'Senhora'. 'Comando' é gíria, não é tratamento regulamentar." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A continência tornou-se um gesto impessoal, que homenageia a autoridade investida na função, e não a pessoa; por isso todo militar, mesmo na inatividade, deve retribuí-la.", gabarito: "certo", explicacao: "Correto. A continência é saudação impessoal e deve ser retribuída por militares da ativa e da inatividade." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O militar uniformizado (em qualquer uniforme) é obrigado a prestar o gesto da continência; em trajes civis, pode respondê-la prestando a continência individual.", gabarito: "certo", explicacao: "Correto. Uniformizado = obrigatório; em trajes civis = facultativo (continência individual ou cumprimento verbal)." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Portando arma longa em bandoleira ou a tiracolo, o militar presta a continência erguendo a mão direita, como se estivesse desarmado.", gabarito: "errado", explicacao: "Errado. Com arma a tiracolo/bandoleira, toma apenas a POSIÇÃO DE SENTIDO, com a frente voltada perpendicularmente à direção do deslocamento do superior." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A continência individual é devida a qualquer hora do dia ou da noite, só podendo ser dispensada em situação especial regulamentada pela instituição.", gabarito: "certo", explicacao: "Correto." },

  { modulo: "1", tipo: "multipla", fonte: "1ª AE IG/2025 (adaptada)", enunciado: "Quanto ao procedimento da continência individual, assinale a alternativa INCORRETA:", alternativas: A(
    "A continência é feita quando o superior atinge a distância de três passos do mais moderno e desfeita quando o superior ultrapassa um passo.",
    "Posição de sentido, com a frente voltada para a direção perpendicular à do deslocamento do superior.",
    "Olhar franco e naturalmente voltado para o superior; para desfazer, baixa a mão em movimento enérgico.",
    "Com a arma a tiracolo ou em bandoleira, ergue-se a mão direita ao lado da cabeça em continência individual.",
    "Com cobertura, leva a mão direita ao lado da cobertura, tocando a falangeta do indicador à borda da pala."),
    gabarito: "D", explicacao: "A incorreta é a 'D': com arma a tiracolo/bandoleira NÃO se ergue a mão — toma-se apenas a posição de sentido." },
  { modulo: "1", tipo: "multipla", enunciado: "São elementos essenciais da continência individual:", alternativas: A(
    "atitude, gesto e duração", "postura, saudação e voz", "garbo, gesto e cobertura", "atitude, voz e marcialidade", "gesto, deslocamento e duração"),
    gabarito: "A", explicacao: "Atitude (postura marcial), gesto (movimento de corpo/braços/mãos) e duração (tempo)." },
  { modulo: "1", tipo: "multipla", enunciado: "Para o Comandante-Geral da PMPE, a continência individual com espada desembainhada é prestada:", alternativas: A(
    "abatendo a espada (apresentar-arma), por gozar de honras de Oficial-General",
    "apenas perfilando a espada (ombro-arma)",
    "mantendo a espada embainhada",
    "apenas com a posição de sentido",
    "erguendo a mão esquerda"),
    gabarito: "A", explicacao: "Por norma interna, os Cmt-Gerais de PM/CBM têm honras de Of-General; logo, abate-se a espada (apresentar-arma)." },

  { modulo: "1", tipo: "dissertativa", enunciado: "Diferencie 'sinais de respeito' de 'continência' quanto à obrigatoriedade e dê dois exemplos de sinais de respeito distintos da continência.", modelo: { estrutura: "Conceito → obrigatoriedade (sinais sempre × continência dispensável) → exemplos.", criterios: ["Apontar que os sinais de respeito são obrigatórios em todas as situações", "Apontar que a continência pode ser dispensada", "Citar 2 exemplos (ceder a direita/lado interno ao superior, franquear/abrir a porta, ceder o melhor lugar, tratamento 'Senhor')"], resposta: "Os sinais de respeito são obrigatórios em todas as situações (art. 4º, §3º), ao passo que a continência é apenas uma de suas formas e pode ser dispensada conforme a situação. São exemplos de sinais de respeito diversos da continência: ceder a direita (ou o lado interno) ao superior no deslocamento; franquear e abrir a porta, dando passagem ao mais antigo; ceder o melhor lugar; e empregar sempre o tratamento 'Senhor'/'Senhora'." } },

  // ════════ MÓDULO 2 — Continência da tropa ════════
  { modulo: "2", tipo: "certo_errado", fonte: "1ª AE IG/2025 (adaptada)", enunciado: "À passagem de outra tropa, quando os Comandantes forem do mesmo posto e a tropa que passa não conduz Bandeira Nacional, apenas os Comandantes fazem a continência.", gabarito: "certo", explicacao: "Correto. Mesmo posto e sem Bandeira na tropa que passa → só os Comandantes prestam continência." },
  { modulo: "2", tipo: "certo_errado", fonte: "1ª AE IG/2025", enunciado: "No caso de tropa desarmada, ao comando de 'Apresentar Arma!' todos os seus integrantes fazem continência individual e a desfazem ao comando de 'Descansar Arma!'.", gabarito: "certo", explicacao: "Correto. É a regra para tropa desarmada." },
  { modulo: "2", tipo: "certo_errado", fonte: "1ª AE IG/2025 (adaptada)", enunciado: "Se o Comandante da tropa que passa for oficial-superior, a tropa em forma e parada presta a continência executando o comando de 'Sentido!', apenas.", gabarito: "errado", explicacao: "Errado. Para oficial-superior o comando é 'Sentido! Ombro Arma!'. Só 'Sentido!' é para subalterno/intermediário." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Para efeito de continência, considera-se tropa a reunião de dois ou mais militares devidamente comandados.", gabarito: "certo", explicacao: "Correto. Na prática, o efetivo mínimo é 3 (um comanda e dois compõem)." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Quando apenas uma das duas tropas conduz a Bandeira Nacional, a continência é prestada à Bandeira, independentemente da hierarquia dos comandantes (art. 58).", gabarito: "certo", explicacao: "Correto. A presença da Bandeira em uma das tropas torna a continência devida à Bandeira." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Quando uma tropa estiver em instrução ou serviço de faxina, as continências de tropa são obrigatórias e prestadas por todos os integrantes.", gabarito: "errado", explicacao: "Errado. Nessas situações as continências de tropa são DISPENSÁVEIS; cabe ao comandante/instrutor prestá-la ao superior que chega." },

  { modulo: "2", tipo: "multipla", enunciado: "À passagem de uma tropa que conduz a Bandeira Nacional, na continência aos oficiais-generais (incisos I a VIII do art. 16), a tropa em forma executa:", alternativas: A(
    "Sentido! Ombro Arma! Apresentar Arma! Olhar à Direita (Esquerda)!",
    "Sentido!",
    "Sentido! Ombro Arma!",
    "Apresentar Arma! Descansar Arma!",
    "Sentido! Olhar à Direita!"),
    gabarito: "A", explicacao: "Para Of-Gen e autoridades dos incisos I a VIII, a sequência completa: Sentido! Ombro Arma! Apresentar Arma! Olhar à Direita!" },

  // ════════ MÓDULO 3 — Culto à Bandeira e hasteamento ════════
  { modulo: "3", tipo: "multipla", fonte: "1ª AE IG/2025 (corrigida)", enunciado: "No dia 19 de novembro, consagrado à Bandeira Nacional, as Organizações Militares prestam o 'Culto à Bandeira'. Sobre o cerimonial, assinale a alternativa CORRETA:", alternativas: A(
    "Para a solenidade, a Bandeira Nacional da OM, sem guarda, deve ser postada em local de destaque, em frente ao mastro onde se realiza a solenidade.",
    "Hasteamento da Bandeira Nacional, em ato solene às oito horas.",
    "Hasteamento da Bandeira Nacional, em ato solene às dez horas.",
    "Canto do Hino Nacional e, se for o caso, incineração de Bandeiras.",
    "Desfile em continência à maior autoridade militar presente."),
    gabarito: "A", explicacao: "O hasteamento é ÀS 12 HORAS (não 8h nem 10h). Canta-se o Hino À BANDEIRA (não o Hino Nacional) e o desfile é em continência À BANDEIRA. A alternativa correta é a 'A'." },
  { modulo: "3", tipo: "certo_errado", enunciado: "No Dia da Bandeira, o hasteamento da Bandeira Nacional ocorre em ato solene às doze horas.", gabarito: "certo", explicacao: "Correto. O cerimonial prevê o hasteamento às 12h." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Na incineração de Bandeiras inservíveis, as cinzas são depositadas em caixa e enterradas em local apropriado, no interior da OM, ou lançadas ao mar.", gabarito: "certo", explicacao: "Correto, conforme o parágrafo único do cerimonial de incineração." },
  { modulo: "3", tipo: "dissertativa", fonte: "1ª AE IG/2025", enunciado: "Próximo ao 19 de novembro, o Comandante determina a incineração de Bandeiras Nacionais inservíveis depositadas no almoxarifado. Descreva como o cerimonial deve ser realizado (mín. 5 / máx. 10 linhas).", modelo: { estrutura: "Pira junto ao mastro → leitura da Ordem do Dia → praça antiga ateia fogo → Hino à Bandeira → destino das cinzas.", criterios: ["Pira/recipiente de metal próximo ao mastro do hasteamento", "Leitura da Ordem do Dia alusiva à data", "Praça antiga e de ótimo comportamento ateia fogo às Bandeiras embebidas em álcool", "Canto do Hino à Bandeira com a tropa em sentido", "Cinzas em caixa, enterradas em local apropriado ou lançadas ao mar"], resposta: "Numa pira ou recipiente de metal, colocado nas proximidades do mastro onde se realiza o hasteamento, são depositadas as Bandeiras a serem incineradas. O Comandante faz ler a Ordem do Dia alusiva à data, ressaltando a significação das festividades. Terminada a leitura, uma praça antecipadamente escolhida — em princípio a mais antiga e de ótimo comportamento — ateia fogo às Bandeiras, previamente embebidas em álcool. Incineradas as Bandeiras, prossegue o cerimonial com o canto do Hino à Bandeira, regido pelo mestre da Banda de Música, com a tropa na posição de 'Sentido'. As cinzas são depositadas em caixa e enterradas em local apropriado no interior da OM ou lançadas ao mar." } },
  { modulo: "3", tipo: "dissertativa", fonte: "2ª AE IG/2026", enunciado: "Considerando que o Presidente da República decretou luto nacional, descreva como deve ocorrer o hasteamento e a arriação da Bandeira Nacional, da Bandeira de Pernambuco e da insígnia de comando (mín. 4 / máx. 8 linhas).", modelo: { estrutura: "Pavilhão acima das demais → hasteamento (sobe ao topo, desce a meio-mastro) → arriação (sobe ao topo, depois desce).", criterios: ["Informar que o Pavilhão Nacional fica acima de todas as demais bandeiras", "Hasteamento em luto: as bandeiras sobem ao topo do mastro e depois descem a meio-mastro", "Arriação: as bandeiras sobem novamente ao topo e depois descem"], resposta: "Em luto oficial, observa-se que o Pavilhão Nacional permanece acima de todas as demais bandeiras. No hasteamento, as bandeiras (Nacional, de Pernambuco e a insígnia de comando) sobem primeiro ao topo do mastro e, em seguida, descem a meio-mastro, onde permanecem durante o luto. Na arriação, as bandeiras sobem novamente ao topo do mastro e, somente depois, descem definitivamente." } },

  // ════════ MÓDULO 4 — Honras de recepção e despedida ════════
  { modulo: "4", tipo: "certo_errado", fonte: "1ª AE IG/2025 (adaptada)", enunciado: "As Honras de Recepção e Despedida são prestadas apenas quando a autoridade chega à Organização Militar.", gabarito: "errado", explicacao: "Errado. São prestadas tanto na CHEGADA quanto na SAÍDA, e por ocasião de visitas e inspeções." },
  { modulo: "4", tipo: "certo_errado", fonte: "1ª AE IG/2025 (corrigida)", enunciado: "A guarda do quartel formará em uma fileira, no interior do quartel, logo após o portão, com efetivo igual ou maior que 6 (seis) soldados, dando a direita para a direção de onde vem a autoridade.", gabarito: "certo", explicacao: "Correto. O efetivo é igual ou maior que 6 soldados (e não 5)." },
  { modulo: "4", tipo: "certo_errado", fonte: "1ª AE IG/2025", enunciado: "As visitas ou inspeções sem aviso prévio obrigam à imediata interrupção da rotina da OM.", gabarito: "errado", explicacao: "Errado. Visita sem aviso NÃO altera a rotina; o Cmt/Ch/Dir vai ao encontro da autoridade, apresenta-se e a acompanha." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Na despedida, a autoridade e sua comitiva despedem-se, normalmente, do oficial mais moderno para o mais antigo.", gabarito: "certo", explicacao: "Correto, conforme o Vade-Mécum EB10-VM-12.003." },
  { modulo: "4", tipo: "certo_errado", enunciado: "No mastro em que está hasteada a Bandeira Nacional, pode-se posicionar uma bandeira-insígnia acima dela quando a autoridade for oficial-general.", gabarito: "errado", explicacao: "Errado. Nenhuma bandeira, insígnia ou distintivo pode ficar acima da Bandeira Nacional." },

  // ════════ MÓDULO 5 — Guarda-Bandeira ════════
  { modulo: "5", tipo: "multipla", fonte: "1ª AE IG/2025 (adaptada)", enunciado: "Sobre os movimentos e o cerimonial da Guarda-Bandeira, assinale a alternativa CORRETA:", alternativas: A(
    "A cadência da Guarda-Bandeira, ao marchar, é de 100 passos por minuto.",
    "Toda a Guarda-Bandeira realiza o movimento de 'Apresentar-Arma' durante as cerimônias.",
    "A Bandeira é desfraldada no momento em que a tropa executa 'Ombro-Arma'.",
    "Em passagens de comando ao ar livre, a bandeira não é desfraldada.",
    "O Porta-Bandeira comanda 'Marcar-Passo' durante a execução da Canção do Expedicionário, na cadência de 120 passos por minuto."),
    gabarito: "A", explicacao: "A cadência é de 100 passos/min. Só o Porta-Bandeira e o Porta-Estandarte fazem 'Apresentar-Arma'; a Bandeira é desfraldada no 'Apresentar-Arma' (não no 'Ombro-Arma'); em recinto COBERTO é que a Bandeira não é desfraldada." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Nas passagens de comando em recinto coberto, a Bandeira Nacional não é desfraldada.", gabarito: "certo", explicacao: "Correto. Em recinto coberto não se desfralda a Bandeira." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A Guarda-Bandeira é constituída pelo Porta-Bandeira, pelo Porta-Estandarte (se houver) e por 5 (cinco) ou 6 (seis) guardas, sendo 2 (dois) cabos e os demais soldados.", gabarito: "certo", explicacao: "Correto. Composição prevista no Vade-Mécum da Guarda-Bandeira." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Em instruções e treinamentos deve-se utilizar a própria Bandeira Nacional, e não o estandarte.", gabarito: "errado", explicacao: "Errado. Em instruções/treinamentos usa-se o ESTANDARTE; a Bandeira Nacional não é empregada sem as formalidades legais." },
  { modulo: "5", tipo: "dissertativa", fonte: "1ª AE IG/2025", enunciado: "Descreva, em linhas gerais, o procedimento de incorporação da Guarda-Bandeira à tropa nas solenidades militares.", modelo: { estrutura: "Cmt verifica prontidão → Sentido/Ombro-Arma/Bandeira Avançar → deslocamento a 30 passos → Em Continência à Bandeira/Apresentar-Arma → Hino Nacional → ocupa lugar em forma.", criterios: ["Cmt comanda 'Sentido', 'Ombro-Arma', 'Bandeira, Avançar'", "Guarda desloca-se a ~30 passos do lugar na formatura", "'Em Continência à Bandeira – Apresentar-Arma' e desfralde do Pavilhão", "Banda executa o Hino Nacional", "Guarda ocupa seu lugar; encerra com Ombro-Arma/Descansar-Arma/Descansar"], resposta: "Verificando que a Guarda-Bandeira está pronta, o Cmt da tropa comanda, a toque de corneta/clarim, 'Sentido', 'Ombro-Arma' e 'Bandeira, Avançar'. A Guarda desloca-se para a frente da tropa, posicionando-se a cerca de 30 passos do lugar que ocupará na formatura. Em seguida, o Cmt comanda 'Em Continência à Bandeira – Apresentar-Arma': o Porta-Bandeira desfralda o Pavilhão Nacional e a banda executa o Hino Nacional para continência. Ao final, mantendo a Bandeira desfraldada, a Guarda marca passo e segue para ocupar seu lugar no dispositivo; o Cmt encerra o ato com 'Ombro-Arma', 'Descansar-Arma' e 'Descansar'." } },

  // ════════ MÓDULO 6 — Compromisso ao primeiro posto ════════
  { modulo: "6", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "O Compromisso ao primeiro posto será prestado em solenidade especialmente programada, sendo o compromisso realizado perante a Bandeira Nacional.", gabarito: "certo", explicacao: "Correto. O compromisso ao 1º posto é prestado em solenidade especial, perante a Bandeira Nacional." },
  { modulo: "6", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "Os comprometentes, com olhos fitos na Bandeira Nacional, depois de perfilarem espadas, prestam, em voz alta e pausada, o compromisso.", gabarito: "errado", explicacao: "Errado. Depois de ABATEREM as espadas (não perfilarem) é que prestam o compromisso, com olhos fitos na Bandeira." },
  { modulo: "6", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "Se o oficial promovido servir em Estabelecimento ou Repartição, o compromisso é prestado no gabinete do diretor ou chefe e assistido por todos os oficiais que ali servem.", gabarito: "certo", explicacao: "Correto (art. 182 do Estatuto)." },
  { modulo: "6", tipo: "multipla", enunciado: "Os dizeres do compromisso prestado pelo oficial ao ser promovido ao primeiro posto são:", alternativas: A(
    "'Perante a Bandeira do Brasil e pela minha honra prometo cumprir os deveres de oficial da Polícia Militar do Estado de Pernambuco e dedicar-me ao seu serviço.'",
    "'Prometo regular minha conduta pelos preceitos da moral e cumprir as ordens das autoridades.'",
    "'Ao ser declarado Aspirante-a-Oficial, assumo o compromisso de cumprir as ordens das autoridades.'",
    "'Juro defender a Constituição e as leis do Estado de Pernambuco.'",
    "'Comprometo-me a servir à comunidade, mesmo com o risco da própria vida.'"),
    gabarito: "A", explicacao: "É o texto do §2º do art. 32 do Estatuto dos Militares de PE (compromisso de oficial ao 1º posto)." },

  // ════════ MÓDULO 7 — Solenidades e passagem de comando ════════
  { modulo: "7", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "A entrega de condecorações, homenagens e apresentações culturais podem fazer parte de uma solenidade militar.", gabarito: "certo", explicacao: "Correto. Constam do roteiro básico (ponto VII)." },
  { modulo: "7", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "A chegada da autoridade é considerada fora do roteiro de uma solenidade.", gabarito: "errado", explicacao: "Errado. A 'Chegada da Autoridade' é o ponto I do roteiro de 12 pontos." },
  { modulo: "7", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "As Honras Militares, na solenidade, serão prestadas somente à maior autoridade (civil ou militar) presente.", gabarito: "certo", explicacao: "Correto. Honras militares só à maior autoridade presente — maior precedência não é o mesmo que direito a honras." },
  { modulo: "7", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "Durante as solenidades de passagem de comando de OME, o evento de transmissão do cargo será conduzido pela autoridade imediatamente superior na cadeia de comando.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "7", tipo: "certo_errado", fonte: "2ª AE IG/2026 (adaptada)", enunciado: "Na transmissão do cargo, após a continência, os dois oficiais perfilam as espadas e voltam-se para a Bandeira Nacional; a voz 'Em Continência à Bandeira, Apresentar-Arma!' é executada por toda a tropa.", gabarito: "errado", explicacao: "Errado. Esse comando é executado SOMENTE pela autoridade que conduz o evento e pelos Cmt sucedido e sucessor — não por toda a tropa." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A passagem de comando é apenas um dos eventos da cerimônia de transmissão do cargo.", gabarito: "errado", explicacao: "Errado. É o inverso: a TRANSMISSÃO DO CARGO é um dos eventos da PASSAGEM DE COMANDO (cerimônia mais ampla)." },
  { modulo: "7", tipo: "multipla", enunciado: "Na revista à tropa durante a passagem de comando, o Comandante sucedido desloca-se:", alternativas: A(
    "à direita do sucessor, com a espada embainhada, simbolizando o cumprimento de sua missão",
    "à esquerda do sucessor, com a espada desembainhada",
    "à frente do sucessor, conduzindo a Bandeira",
    "atrás da autoridade que conduz o evento",
    "à direita do sucessor, com a espada perfilada"),
    gabarito: "A", explicacao: "O sucedido vai à direita do sucessor com a espada EMBAINHADA, simbolizando a missão cumprida; a cadência é de 116 passos/min." },
  { modulo: "7", tipo: "multipla", enunciado: "Sobre a ordem dos pronunciamentos no roteiro da solenidade, é correto afirmar que se dá:", alternativas: A(
    "da menor para a maior autoridade", "da maior para a menor autoridade", "em ordem alfabética", "por sorteio", "somente a maior autoridade se pronuncia"),
    gabarito: "A", explicacao: "Os pronunciamentos seguem da menor para a maior autoridade (ponto VIII)." },

  // ════════ MÓDULO 8 — Honras fúnebres ════════
  { modulo: "8", tipo: "multipla", fonte: "2ª AE IG/2026", enunciado: "Em quantos graus o militar realiza o giro após o comando de 'PREPARAR!' na guarda fúnebre?", alternativas: A("45°", "90°", "60°", "75°", "30°"), gabarito: "A", explicacao: "Ao comando 'PREPARAR!', o giro é de 45 graus à direita, sobre a planta do pé esquerdo." },
  { modulo: "8", tipo: "dissertativa", fonte: "2ª AE IG/2026", enunciado: "Defina Honras Fúnebres e cite seus tipos (mín. 4 / máx. 8 linhas).", modelo: { estrutura: "Definição → 3 tipos.", criterios: ["Definir como homenagens póstumas prestadas diretamente pela tropa", "Aos despojos de alta autoridade ou militar da ativa, conforme a posição hierárquica", "Citar os 3 tipos: Guarda Fúnebre, Escolta Fúnebre e Salvas Fúnebres"], resposta: "Honras Fúnebres são homenagens póstumas prestadas diretamente pela tropa aos despojos mortais de alta autoridade ou de militar da ativa, de acordo com a posição hierárquica que ocupava. Consistem basicamente em três tipos distintos de honras: 1) Guarda Fúnebre; 2) Escolta Fúnebre; e 3) Salvas Fúnebres." } },
  { modulo: "8", tipo: "certo_errado", enunciado: "O ataúde, depois de fechado e até o início da inumação, é coberto com a Bandeira Nacional, que depois é dobrada e entregue à família do falecido.", gabarito: "certo", explicacao: "Correto, conforme o Vade-Mécum de Honras Fúnebres." },
  { modulo: "8", tipo: "multipla", enunciado: "Na composição da Guarda Fúnebre, o efetivo previsto para um Oficial Superior é de:", alternativas: A("2 (duas) companhias", "1 (um) batalhão", "1 (uma) companhia", "1 (um) pelotão", "1 (um) grupo de combate"), gabarito: "A", explicacao: "Of-Gen/Cmt-Geral: 1 batalhão; Of. Superior: 2 companhias; Of. Intermediário: 1 companhia; Of. Subalterno: 1 pelotão." },

  // ════════ MÓDULO 9 — Atribuições e serviço interno ════════
  { modulo: "9", tipo: "multipla", fonte: "2ª AE IG/2026", enunciado: "Quanto às atribuições do Comandante de OME, assinale a alternativa INCORRETA:", alternativas: A(
    "Transferir o militar, levando em consideração a localização geográfica de sua residência.",
    "Transcrever, a seu juízo, em BI, as recompensas concedidas pelos comandos subordinados.",
    "Conceder licenças de acordo com as instruções e normas específicas em vigor.",
    "Dar suas ordens e instruções, sempre que possível, por intermédio do Subcomandante.",
    "Atender às ponderações justas de seus subordinados, quando feitas em termos adequados e de sua competência."),
    gabarito: "A", explicacao: "A incorreta é a 'A': transferir militar considerando a localização da residência NÃO é atribuição do Cmt de OME." },
  { modulo: "9", tipo: "multipla", fonte: "2ª AE IG/2026", enunciado: "Sobre o serviço interno, o serviço de escala compreende, EXCETO:", alternativas: A(
    "Portaria e serviços gerais.",
    "Guarda do quartel.",
    "Sgt Dia SU.",
    "Guarda das SU (alojamentos, garagens, cavalariças, canis, quando for o caso).",
    "Serviço-de-dia ao rancho (Sgt Dia, cozinheiro, cassineiro etc.)."),
    gabarito: "A", explicacao: "A escala NÃO inclui 'portaria e serviços gerais'." },
  { modulo: "9", tipo: "multipla", fonte: "2ª AE IG/2026", enunciado: "O Boletim Interno (BI) conterá, especialmente, EXCETO:", alternativas: A(
    "Os assuntos transmitidos à unidade em caráter sigiloso ou quaisquer referências a esses assuntos.",
    "A discriminação do serviço a ser executado pela unidade.",
    "As ordens e decisões do Cmt U, mesmo que já tenham sido executadas.",
    "As determinações das autoridades superiores, mesmo que já cumpridas, com a citação do documento da referência.",
    "As alterações ocorridas com o pessoal e o material da unidade."),
    gabarito: "A", explicacao: "Assuntos sigilosos NÃO são publicados no BI." },

  // ════════ MÓDULO 10 — Precedência hierárquica ════════
  { modulo: "10", tipo: "multipla", fonte: "2ª AE IG/2026 (adaptada)", enunciado: "Segundo o SUNOR nº 20/2022, qual a autoridade de MAIOR precedência hierárquica na PMPE?", alternativas: A(
    "Comandante-Geral", "Subcomandante-Geral", "Chefe do Estado-Maior Geral", "Diretor Geral de Administração", "Comandante de Unidade Operacional"),
    gabarito: "A", explicacao: "Ordem: 1º Comandante-Geral; 2º Subcomandante-Geral; 3º Chefe do EMG; 4º Diretor Geral de Administração e Diretor de Planejamento Operacional." },
  { modulo: "10", tipo: "certo_errado", enunciado: "Na precedência da PMPE, o Subcomandante-Geral antecede o Chefe do Estado-Maior Geral.", gabarito: "certo", explicacao: "Correto. A ordem é Cmt-Geral → Subcmt-Geral → Chefe do EMG → Diretor Geral de Adm/Planejamento Operacional." },
  { modulo: "10", tipo: "certo_errado", enunciado: "Aos Comandantes-Gerais das PM e CBM de todo o Brasil são deferidos tratamento, honras e precedência compatíveis com posto de Oficial-General de 2 estrelas das Forças Armadas.", gabarito: "certo", explicacao: "Correto, conforme o SUNOR nº 20/2022." },

  // ════════ MÓDULO 11 — Postos e graduações ════════
  { modulo: "11", tipo: "multipla", fonte: "1ª AE IG/2025 (adaptada)", enunciado: "Assinale a correspondência CORRETA de postos entre as Forças (Marinha — Exército — Aeronáutica):", alternativas: A(
    "Almirante-de-Esquadra — General de Exército — Tenente-Brigadeiro",
    "Vice-Almirante — General de Brigada — Brigadeiro",
    "Contra-Almirante — General de Divisão — Major-Brigadeiro",
    "Capitão-de-Corveta — Coronel — Coronel",
    "Capitão-de-Fragata — Major — Major"),
    gabarito: "A", explicacao: "Almirante-de-Esquadra = General de Exército = Tenente-Brigadeiro. (Vice-Alm = Gen Divisão = Maj-Brig; Contra-Alm = Gen Brigada = Brigadeiro; Cap-Corveta = Major; Cap-Fragata = Ten-Cel.)" },
  { modulo: "11", tipo: "multipla", enunciado: "Na Marinha, o oficial intermediário corresponde, no Exército, ao posto de Capitão. Trata-se do(a):", alternativas: A("Capitão-Tenente", "Capitão-de-Corveta", "Capitão-de-Fragata", "Primeiro-Tenente", "Guarda-Marinha"), gabarito: "A", explicacao: "O Capitão-Tenente (Marinha) é o oficial intermediário, equivalente ao Capitão (Ex/Aer)." },
  { modulo: "11", tipo: "certo_errado", enunciado: "O posto mais elevado da Marinha é o de Almirante, equivalente a Marechal (Exército) e Marechal-do-Ar (Aeronáutica).", gabarito: "certo", explicacao: "Correto. Almirante = Marechal = Marechal-do-Ar (postos privativos de tempo de guerra)." },
]

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MAT } })
  if (!disc) throw new Error(`Disciplina ${MAT} não existe.`)
  let n = 0
  for (const q of QS) {
    const hash = createHash("sha1").update(`${MAT}|${q.modulo}|${q.enunciado}`).digest("hex")
    const base = {
      materia: MAT, modulo: q.modulo, tipo: q.tipo, enunciado: q.enunciado,
      fonte: ("fonte" in q && q.fonte) ? q.fonte : "Apostila IG + provas antigas (CFO PMPE)",
    }
    const data = q.tipo === "multipla"
      ? { ...base, alternativas: q.alternativas, gabarito: q.gabarito, explicacao: q.explicacao, modelo: undefined }
      : q.tipo === "certo_errado"
      ? { ...base, alternativas: [], gabarito: q.gabarito, explicacao: q.explicacao, modelo: undefined }
      : { ...base, alternativas: [], gabarito: "", explicacao: undefined, modelo: q.modelo }
    await prisma.questao.upsert({
      where: { hash },
      update: { ...data, hash },
      create: { ...data, hash },
    })
    n++
  }
  console.log(`✓ ${n} questões de ${MAT} importadas/atualizadas.`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
