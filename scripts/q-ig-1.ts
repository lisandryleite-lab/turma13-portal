import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "IG" // Instrução Geral — padrão: 22 questões/módulo (15 V/F + 5 MC + 2 dissertativas)

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
  { modulo: "1", tipo: "certo_errado", enunciado: "Todo militar, em serviço ativo ou na inatividade, deve retribuir a continência que lhe é prestada.", gabarito: "certo", explicacao: "Correto. A obrigação de retribuir alcança militares da ativa e da inatividade." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O militar uniformizado, em qualquer uniforme, é obrigado a prestar o gesto da continência.", gabarito: "certo", explicacao: "Correto. Uniformizado = obrigatório; em trajes civis pode responder com continência individual ou cumprimento verbal." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Com a arma longa a tiracolo ou em bandoleira, o militar presta a continência erguendo a mão direita à altura da cabeça.", gabarito: "errado", explicacao: "Errado. Nesse caso toma apenas a POSIÇÃO DE SENTIDO, com a frente voltada perpendicularmente à direção do deslocamento do superior." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Para o Comandante-Geral da PMPE, a continência individual de espada desembainhada é feita abatendo-se a espada (apresentar-arma).", gabarito: "certo", explicacao: "Correto. Por norma interna, os Cmt-Gerais de PM/CBM gozam de honras de Oficial-General; logo, abate-se a espada." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A continência individual é devida a qualquer hora do dia ou da noite.", gabarito: "certo", explicacao: "Correto, salvo dispensa em situação especial regulamentada pela instituição." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Por ocasião da cerimônia da Bandeira ou do Hino Nacional, estando o militar em viatura, apenas o passageiro salta do veículo para a continência.", gabarito: "errado", explicacao: "Errado. Tanto o CONDUTOR quanto o PASSAGEIRO saltam do veículo e fazem a continência individual, sempre que viável." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O aperto de mão é forma de cumprimento que o superior pode conceder ao mais moderno; este não deve tomar a iniciativa de estender a mão.", gabarito: "certo", explicacao: "Correto. Mas, se o superior estender a mão, o mais moderno não pode recusar o cumprimento." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Todo militar deve fazer alto para prestar continência à Bandeira Nacional.", gabarito: "certo", explicacao: "Correto. Para a Bandeira Nacional faz-se alto." },

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
  { modulo: "1", tipo: "multipla", enunciado: "O tratamento empregado a oficial-general, nas relações correntes de serviço, admite:", alternativas: A(
    "'Almirante', 'General' ou 'Brigadeiro', conforme o caso",
    "'Comando'",
    "'Chefia'",
    "apenas 'Excelentíssimo'",
    "'Camarada'"),
    gabarito: "A", explicacao: "Além de 'Vossa Excelência'/'Senhor Almirante/General/Brigadeiro', admite-se 'Almirante/General/Brigadeiro' nas relações de serviço." },
  { modulo: "1", tipo: "multipla", enunciado: "Sobre a continência em trajes civis, é correto afirmar que o militar:", alternativas: A(
    "pode prestar a continência individual ou assumir posição respeitosa em cerimônias oficiais, no hasteamento/arriação da Bandeira e na execução do Hino Nacional",
    "está sempre proibido de prestar continência",
    "é obrigado a prestar o gesto completo como se estivesse uniformizado",
    "deve apenas bater continência com a mão esquerda",
    "nunca descobre a cabeça"),
    gabarito: "A", explicacao: "Em trajes civis, presta a continência individual ou assume posição respeitosa nessas ocasiões; nas demais, se de cobertura, descobre-se." },

  { modulo: "1", tipo: "dissertativa", enunciado: "Diferencie 'sinais de respeito' de 'continência' quanto à obrigatoriedade e cite dois exemplos de sinais de respeito distintos da continência.", modelo: { estrutura: "Conceito → obrigatoriedade (sinais sempre × continência dispensável) → exemplos.", criterios: ["Sinais de respeito obrigatórios em todas as situações", "Continência pode ser dispensada", "Dois exemplos (ceder a direita/lado interno, franquear/abrir a porta, ceder o melhor lugar, tratamento 'Senhor')"], resposta: "Os sinais de respeito são obrigatórios em todas as situações (art. 4º, §3º); a continência é apenas uma de suas formas e pode ser dispensada conforme a situação. São exemplos de sinais de respeito diversos da continência: ceder a direita (ou o lado interno) ao superior no deslocamento; franquear e abrir a porta ao mais antigo; ceder-lhe o melhor lugar; e empregar sempre o tratamento 'Senhor'/'Senhora'." } },
  { modulo: "1", tipo: "dissertativa", enunciado: "Explique como deve ser prestada a continência individual conforme o armamento do militar (desarmado/pistola; espada desembainhada; arma longa em bandoleira).", modelo: { estrutura: "Desarmado/pistola → espada desembainhada → arma longa.", criterios: ["Desarmado/pistola/espada embainhada: gesto da mão (90° com a linha dos ombros)", "Espada desembainhada: sentido, ombro-arma e, para Of-Gen/incisos I-VIII/XII, abate a espada", "Arma longa a tiracolo/bandoleira: apenas posição de sentido, frente perpendicular ao deslocamento"], resposta: "Desarmado, armado de pistola/revólver ou com a espada embainhada, o militar executa o gesto da mão, com o braço sensivelmente horizontal formando 90° com a linha dos ombros. Com a espada desembainhada, toma sentido, perfila a espada (ombro-arma) e, para os oficiais-generais e autoridades dos incisos I a VIII e XII do art. 16, abate a espada (apresentar-arma). Com arma longa a tiracolo ou em bandoleira, não ergue a mão: toma apenas a posição de sentido, com a frente voltada perpendicularmente à direção do deslocamento do superior." } },

  // ════════════════════ MÓDULO 2 — Apresentação individual e continência da tropa ════════════════════
  { modulo: "2", tipo: "certo_errado", enunciado: "Na apresentação individual, o militar aproxima-se do superior até a distância do aperto de mão, toma sentido, faz a continência e diz seu grau hierárquico, nome de guerra e OM (ou função).", gabarito: "certo", explicacao: "Correto. É a sequência regulamentar da apresentação individual." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Para se retirar da presença de um superior, a praça, depois de fazer 'Meia Volta', rompe a marcha com o pé direito.", gabarito: "errado", explicacao: "Errado. A praça rompe a marcha com o pé ESQUERDO, após fazer 'Meia Volta'." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Para efeito de continência, considera-se tropa a reunião de dois ou mais militares devidamente comandados.", gabarito: "certo", explicacao: "Correto. Na prática, o efetivo mínimo é 3 (um comanda e dois compõem)." },
  { modulo: "2", tipo: "certo_errado", fonte: "1ª AE IG/2025", enunciado: "À passagem de outra tropa, quando os Comandantes forem do mesmo posto e a tropa que passa não conduz Bandeira, apenas os Comandantes fazem a continência.", gabarito: "certo", explicacao: "Correto. Mesmo posto e sem Bandeira na tropa que passa → só os Comandantes prestam continência." },
  { modulo: "2", tipo: "certo_errado", fonte: "1ª AE IG/2025", enunciado: "No caso de tropa desarmada, ao comando de 'Apresentar Arma!' todos os integrantes fazem continência individual e a desfazem ao comando de 'Descansar Arma!'.", gabarito: "certo", explicacao: "Correto. Regra da tropa desarmada." },
  { modulo: "2", tipo: "certo_errado", fonte: "1ª AE IG/2025 (adaptada)", enunciado: "Se o Comandante da tropa que passa for oficial-superior, a tropa em forma e parada presta continência executando apenas 'Sentido!'.", gabarito: "errado", explicacao: "Errado. Para oficial-superior o comando é 'Sentido! Ombro Arma!'. Apenas 'Sentido!' é para subalterno/intermediário." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Se apenas uma das duas tropas conduz a Bandeira Nacional, a continência é prestada à Bandeira, independentemente da hierarquia dos comandantes (art. 58).", gabarito: "certo", explicacao: "Correto. A presença da Bandeira torna a continência devida a ela." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Se as duas tropas não conduzem a Bandeira Nacional e os comandantes são de igual hierarquia, a continência é feita por ambas as tropas.", gabarito: "certo", explicacao: "Correto. Sem Bandeira e hierarquias iguais → ambas prestam continência (art. 58, I)." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Quando uma tropa estiver em instrução ou serviço de faxina, as continências de tropa são obrigatórias e prestadas por todos.", gabarito: "errado", explicacao: "Errado. Nessas situações as continências de tropa são DISPENSÁVEIS; cabe ao comandante/instrutor prestá-la ao superior que chega." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Na continência da tropa em deslocamento, os comandantes de pelotão (seção), à distância de dez passos da autoridade ou da Bandeira, comandam 'Pelotão (Seção) Sentido! Olhar à Direita (Esquerda)!'.", gabarito: "certo", explicacao: "Correto. Subunidades: 20 passos; pelotão/seção: 10 passos." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Durante a continência da tropa em deslocamento, a Bandeira é desfraldada, exceto para outra Bandeira.", gabarito: "errado", explicacao: "Errado. A Bandeira NÃO é desfraldada, EXCETO para outra Bandeira; e a Guarda-Bandeira não olha para a direita (esquerda)." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Desfile é a passagem da tropa diante da Bandeira Nacional ou da maior autoridade presente a uma cerimônia, a fim de lhe prestar homenagem.", gabarito: "certo", explicacao: "Correto. A tropa a pé desfila em 'Ombro Arma'." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A guarda em forma presta continência no momento da entrada e da saída da autoridade da OME.", gabarito: "certo", explicacao: "Correto. A continência da guarda ocorre tanto na entrada quanto na saída." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Quando um oficial entra em alojamento ou vestiário onde há tropas, o primeiro a avistá-lo comanda 'Alojamento (Vestiário) - Atenção! Comandante da Companhia!'.", gabarito: "certo", explicacao: "Correto. Todos suspendem conversas sem interromper atividades até o 'À vontade!'." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Nas Organizações Militares de ensino, o regulamento fixa rigidamente o procedimento dos alunos em sala, sem espaço para instruções internas.", gabarito: "errado", explicacao: "Errado. Em OM de ensino o procedimento fica em ABERTO para instruções internas específicas do ambiente acadêmico." },

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
  { modulo: "2", tipo: "multipla", enunciado: "Quando duas tropas conduzem a Bandeira Nacional, a continência:", alternativas: A(
    "é prestada por ambas, independentemente da hierarquia dos comandantes",
    "é prestada apenas pela de menor hierarquia",
    "é dispensada",
    "é prestada apenas pela de maior hierarquia",
    "depende de ordem do escalão superior"),
    gabarito: "A", explicacao: "Ambas conduzindo Bandeira → ambas prestam continência (art. 58, III)." },
  { modulo: "2", tipo: "multipla", enunciado: "São as quatro modalidades de continência da tropa:", alternativas: A(
    "a pé firme, em deslocamento, em desfile e da guarda",
    "individual, coletiva, mista e especial",
    "a pé firme, montada, embarcada e aérea",
    "ordinária, extraordinária, geral e parcial",
    "de recepção, de despedida, de revista e de honra"),
    gabarito: "A", explicacao: "As quatro: a pé firme, em deslocamento, em desfile e da guarda." },

  { modulo: "2", tipo: "dissertativa", enunciado: "Descreva os comandos de continência da tropa a pé firme à passagem de tropa que conduz a Bandeira, conforme o grau hierárquico da autoridade.", modelo: { estrutura: "Subalterno/intermediário → superior → Of-Gen/incisos I-VIII.", criterios: ["Subalterno/intermediário: 'Sentido!'", "Oficial-superior: 'Sentido! Ombro Arma!'", "Of-Gen / incisos I-VIII: 'Sentido! Ombro Arma! Apresentar Arma! Olhar à Direita!'", "Tropa desarmada: continência individual ao 'Apresentar Arma!'"], resposta: "A continência a oficial subalterno e intermediário é 'Sentido!'; a oficial-superior, 'Sentido! Ombro Arma!'; e aos símbolos e autoridades dos incisos I a VIII do art. 16, aos oficiais-generais ou equivalentes, 'Sentido! Ombro Arma! Apresentar Arma! Olhar à Direita (Esquerda)!'. No caso de tropa desarmada, ao comando 'Apresentar Arma!' todos fazem continência individual, desfazendo-a ao 'Descansar Arma!'." } },
  { modulo: "2", tipo: "dissertativa", enunciado: "Explique o procedimento quando uma tropa reunida para instrução recebe a chegada de autoridade de posto superior ao mais antigo presente.", modelo: { estrutura: "Comando ao chegar → levantar-se → correspondido → 'À vontade!' → idem na saída.", criterios: ["O mais antigo comanda 'Companhia... Sentido! Comandante da Companhia (ou função)!'", "Todos se levantam energicamente e tomam a posição ordenada", "Correspondido o sinal pelo superior, volta-se à posição anterior ao 'À vontade!'", "Aplica-se também à saída da autoridade"], resposta: "Quando a tropa estiver reunida para instrução, conferência ou preleção e chegar o comandante ou autoridade de posto superior ao mais antigo presente, este comanda 'Companhia (Escola, Turma etc.) - Sentido! Comandante da Companhia (ou a função de quem chega)!'. Todos se levantam energicamente e tomam a posição ordenada; correspondido o sinal de respeito pelo superior, a tropa volta à posição anterior ao comando 'À vontade!'. As mesmas formalidades aplicam-se por ocasião da saída da autoridade." } },

  // ════════════════════ MÓDULO 3 — Culto à Bandeira e hasteamento ════════════════════
  { modulo: "3", tipo: "certo_errado", enunciado: "No Dia da Bandeira (19 de novembro), o hasteamento da Bandeira Nacional ocorre em ato solene às doze horas.", gabarito: "certo", explicacao: "Correto. O cerimonial prevê o hasteamento às 12h." },
  { modulo: "3", tipo: "certo_errado", enunciado: "No culto à Bandeira, após o hasteamento, canta-se o Hino Nacional e, se for o caso, há incineração de Bandeiras.", gabarito: "errado", explicacao: "Errado. Canta-se o Hino À BANDEIRA (não o Hino Nacional); o desfile é em continência à Bandeira Nacional." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Na incineração de Bandeiras inservíveis, as cinzas são depositadas em caixa e enterradas em local apropriado, ou lançadas ao mar.", gabarito: "certo", explicacao: "Correto, conforme o parágrafo único do cerimonial de incineração." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Quem ateia fogo às Bandeiras inservíveis, embebidas em álcool, é, em princípio, uma praça antiga e de ótimo comportamento.", gabarito: "certo", explicacao: "Correto. A praça é antecipadamente escolhida, em princípio a mais antiga e de ótimo comportamento." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Na vigência de Luto Nacional, a tropa não canta hinos ou canções militares e a Bandeira Nacional é mantida a meio-mastro.", gabarito: "certo", explicacao: "Correto. Em luto, sem hinos/canções e Bandeira a meio-mastro; usa-se laço de crepe negro na lança quando transportada por tropa." },
  { modulo: "3", tipo: "certo_errado", enunciado: "No hasteamento em luto, a Bandeira sobe diretamente até o meio-mastro, sem ir ao topo.", gabarito: "errado", explicacao: "Errado. No hasteamento a Bandeira é conduzida ao TOPO e, em seguida, desce a meio-mastro." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Na arriação em luto, a Bandeira sobe novamente ao topo do mastro e, em seguida, é arriada.", gabarito: "certo", explicacao: "Correto. Arriação: sobe ao topo e depois desce." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Em luto, os símbolos e as insígnias de comando também permanecem a meio-mastro, como a Bandeira Nacional.", gabarito: "certo", explicacao: "Correto. Símbolos e insígnias acompanham a Bandeira a meio-mastro." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Durante o luto, as bandas de música permanecem em silêncio, exceto para marcação de cadência por tarol e bombo.", gabarito: "certo", explicacao: "Correto. Só se admite a marcação de cadência por tarol e bombo." },
  { modulo: "3", tipo: "certo_errado", enunciado: "São datas de hasteamento com maior gala, entre outras: 7 de setembro, 15 de novembro e 1º de maio.", gabarito: "certo", explicacao: "Correto. Também 1º/jan, 21/abr, 12/out, 25/dez e o aniversário da OM." },
  { modulo: "3", tipo: "certo_errado", enunciado: "No mastro em que está hasteada a Bandeira Nacional, pode-se posicionar uma bandeira-insígnia acima dela quando presente oficial-general.", gabarito: "errado", explicacao: "Errado. Nenhuma bandeira, insígnia ou distintivo fica acima da Bandeira Nacional." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Na incorporação, a tropa recebe a Bandeira Nacional e o Porta-Bandeira, com sua Guarda, vai buscá-la no local em que está guardada.", gabarito: "certo", explicacao: "Correto. A incorporação é o ato solene do recebimento da Bandeira pela tropa." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Na desincorporação, com a tropa em 'Ombro Arma', o Comandante comanda 'Bandeira fora de forma'.", gabarito: "certo", explicacao: "Correto. É a retirada solene da Bandeira da formatura." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O efetivo em forma para o culto à Bandeira inclui uma 'Guarda de Honra' a pé, sem Bandeira Nacional, posicionada no centro do dispositivo e em frente ao mastro.", gabarito: "certo", explicacao: "Correto. A Guarda de Honra fica no centro, em frente ao mastro." },
  { modulo: "3", tipo: "certo_errado", enunciado: "No culto à Bandeira, encerra-se com desfile em continência à maior autoridade militar presente.", gabarito: "errado", explicacao: "Errado. O desfile é em continência À BANDEIRA NACIONAL." },

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
  { modulo: "3", tipo: "multipla", enunciado: "Na incorporação da Bandeira, a Guarda-Bandeira posiciona-se a uma distância aproximada de:", alternativas: A(
    "trinta passos do lugar que vai ocupar na formatura", "dez passos", "vinte passos", "cinquenta passos", "cinco passos"),
    gabarito: "A", explicacao: "Cerca de 30 passos do lugar na formatura, quando se dá 'Em Continência à Bandeira - Apresentar Armas'." },
  { modulo: "3", tipo: "multipla", enunciado: "Em Luto Nacional, quando a Bandeira Nacional é transportada por tropa, o sinal de luto é:", alternativas: A(
    "um laço de crepe negro colocado na lança",
    "uma faixa branca na haste",
    "a inversão das cores",
    "o uso de bandeira menor",
    "a retirada do Estandarte"),
    gabarito: "A", explicacao: "Laço de crepe negro na lança; a tropa não canta hinos/canções e a Bandeira fica a meio-mastro." },

  { modulo: "3", tipo: "dissertativa", fonte: "1ª AE IG/2025", enunciado: "Descreva como deve ser realizado o cerimonial de incineração de Bandeiras Nacionais inservíveis (mín. 5 / máx. 10 linhas).", modelo: { estrutura: "Pira junto ao mastro → leitura da Ordem do Dia → praça antiga ateia fogo → Hino à Bandeira → destino das cinzas.", criterios: ["Pira/recipiente de metal próximo ao mastro", "Leitura da Ordem do Dia alusiva à data", "Praça antiga e de ótimo comportamento ateia fogo às Bandeiras embebidas em álcool", "Canto do Hino à Bandeira com a tropa em sentido", "Cinzas em caixa, enterradas ou lançadas ao mar"], resposta: "Numa pira ou recipiente de metal, colocado nas proximidades do mastro do hasteamento, são depositadas as Bandeiras a serem incineradas. O Comandante faz ler a Ordem do Dia alusiva à data. Terminada a leitura, uma praça antecipadamente escolhida — em princípio a mais antiga e de ótimo comportamento — ateia fogo às Bandeiras, previamente embebidas em álcool. Incineradas, prossegue o cerimonial com o canto do Hino à Bandeira, regido pelo mestre da Banda, com a tropa em 'Sentido'. As cinzas são depositadas em caixa e enterradas em local apropriado no interior da OM ou lançadas ao mar." } },
  { modulo: "3", tipo: "dissertativa", fonte: "2ª AE IG/2026", enunciado: "Decretado luto nacional, descreva como deve ocorrer o hasteamento e a arriação da Bandeira Nacional, da Bandeira de Pernambuco e da insígnia de comando (mín. 4 / máx. 8 linhas).", modelo: { estrutura: "Pavilhão acima das demais → hasteamento (topo→meio-mastro) → arriação (topo→arriada) → símbolos a meio-mastro.", criterios: ["Bandeiras sobem ao topo e descem a meio-mastro no hasteamento", "Na arriação sobem ao topo e depois são arriadas", "Símbolos e insígnias de comando também a meio-mastro", "Pavilhão Nacional acima das demais"], resposta: "Em luto, observa-se que o Pavilhão Nacional permanece acima das demais bandeiras. No hasteamento, a Bandeira Nacional é conduzida ao topo do mastro e, em seguida, desce à posição de meio-mastro; a Bandeira de Pernambuco e a insígnia de comando acompanham, também a meio-mastro. Na arriação, as bandeiras sobem novamente ao topo e só então são arriadas. Durante o luto, a tropa não canta hinos ou canções e as bandas permanecem em silêncio, exceto para marcação de cadência por tarol e bombo." } },

  // ════════════════════ MÓDULO 4 — Bandeiras-insígnias e honras de recepção/despedida ════════════════════
  { modulo: "4", tipo: "certo_errado", enunciado: "A bandeira-insígnia ou distintivo é hasteada quando a autoridade entra na OM e arriada logo após a sua saída.", gabarito: "certo", explicacao: "Correto. Indica a presença da autoridade na OM." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Por ocasião do hasteamento ou arriação da Bandeira Nacional, a bandeira-insígnia deve ser arriada, sendo re-hasteada após o término.", gabarito: "certo", explicacao: "Correto. A insígnia cede lugar à Bandeira Nacional durante a solenidade." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Havendo várias OM no mesmo edifício, hasteia-se no mastro a insígnia de todas as autoridades presentes.", gabarito: "errado", explicacao: "Errado. Hasteia-se apenas a insígnia da MAIS ALTA autoridade presente." },
  { modulo: "4", tipo: "certo_errado", fonte: "1ª AE IG/2025 (adaptada)", enunciado: "As Honras de Recepção e Despedida são prestadas apenas quando a autoridade chega à Organização Militar.", gabarito: "errado", explicacao: "Errado. São prestadas na chegada e na saída, e por ocasião de visitas e inspeções." },
  { modulo: "4", tipo: "certo_errado", fonte: "1ª AE IG/2025 (corrigida)", enunciado: "A guarda do quartel forma em uma fileira, no interior do quartel, logo após o portão, com efetivo igual ou maior que 6 (seis) soldados.", gabarito: "certo", explicacao: "Correto. O efetivo é igual ou maior que 6 soldados (e não 5)." },
  { modulo: "4", tipo: "certo_errado", fonte: "1ª AE IG/2025", enunciado: "As visitas ou inspeções sem aviso prévio obrigam à imediata interrupção da rotina da OM.", gabarito: "errado", explicacao: "Errado. Visita sem aviso NÃO altera a rotina; o Cmt/Ch/Dir vai ao encontro, apresenta-se e a acompanha." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Na despedida, a autoridade e sua comitiva despedem-se, normalmente, do oficial mais moderno para o mais antigo.", gabarito: "certo", explicacao: "Correto, conforme o Vade-Mécum EB10-VM-12.003." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Nas visitas programadas, a autoridade visitante indica a finalidade, o local e a hora de sua inspeção ou visita.", gabarito: "certo", explicacao: "Correto. É recebida pelo Cmt/Dir/Ch em conjunto com o oficial de serviço." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Ao ocupar o local de recebimento da continência, a autoridade comanda à guarda 'Guarda, Sentido! Ombro-Arma!' antes do toque do corneteiro.", gabarito: "errado", explicacao: "Errado. Quem comanda 'Guarda, Sentido! Ombro-Arma!' é o COMANDANTE DA GUARDA; o corneteiro toca o indicativo do posto/função sem comando à voz." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Caso a autoridade seja Of-Gen ou Comandante-Geral, após o toque indicativo o Cmt da guarda comanda 'Apresentar-Arma! Olhar à Direita!'.", gabarito: "certo", explicacao: "Correto. Para Of-Gen/Cmt-Geral executa-se o apresentar-arma e o exórdio/marcha batida." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O Cmt/Ch/Dir da OM posiciona-se a três passos do último soldado da guarda do quartel.", gabarito: "certo", explicacao: "Correto. O Of Dia fica a 1 passo à esquerda e 1 à retaguarda (ou à direita, havendo Adj Cmdo)." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Na apresentação à autoridade, o Of Dia deve sempre informar se o serviço está ou não com alteração.", gabarito: "errado", explicacao: "Errado. O Of Dia NÃO deve informar se o serviço está ou não com alteração na apresentação à autoridade visitante." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Honras de Recepção e Despedida são prestadas às autoridades definidas no art. 101 do regulamento.", gabarito: "certo", explicacao: "Correto. São as autoridades elencadas no art. 101." },
  { modulo: "4", tipo: "certo_errado", enunciado: "A revista à guarda do quartel é feita pela autoridade, que presta continência a cada soldado.", gabarito: "errado", explicacao: "Errado. A autoridade passa pela guarda silenciosamente e SEM prestar continência; a guarda a encara e a acompanha com a vista." },
  { modulo: "4", tipo: "certo_errado", enunciado: "A guarda do quartel só desfaz a continência depois que a autoridade a ultrapassar (e, em viatura, somente quando embarcar).", gabarito: "certo", explicacao: "Correto. A continência da guarda só é desfeita após a autoridade ultrapassá-la." },

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
  { modulo: "4", tipo: "multipla", enunciado: "O posicionamento do Of Dia na recepção, quando NÃO houver Adjunto de Comando, é:", alternativas: A(
    "a 1 passo à esquerda e 1 passo à retaguarda do Cmt/Ch/Dir",
    "à frente do Cmt",
    "a 3 passos à direita do Cmt",
    "atrás da guarda",
    "ao lado do corneteiro"),
    gabarito: "A", explicacao: "Sem Adj Cmdo: Of Dia a 1 passo à esquerda e 1 à retaguarda; havendo Adj Cmdo, à direita do Cmt." },
  { modulo: "4", tipo: "multipla", enunciado: "A referência normativa específica para as Honras de Recepção e Despedida de Autoridade é:", alternativas: A(
    "Vade-Mécum de Cerimonial Militar do Exército (EB10-VM-12.003), 2ª ed., 2022",
    "Portaria GM-MD nº 1.143/2022",
    "Lei nº 14.751/2023",
    "Estatuto dos Militares de PE",
    "SUNOR nº 20/2022"),
    gabarito: "A", explicacao: "Para recepção/despedida usa-se o EB10-VM-12.003; a Portaria 1.143/2022 rege as continências/sinais de respeito em geral." },

  { modulo: "4", tipo: "dissertativa", enunciado: "Descreva o procedimento da guarda do quartel na recepção de uma autoridade que seja oficial-general.", modelo: { estrutura: "Guarda forma → Cmt comanda Sentido/Ombro-Arma → corneteiro toca indicativo → Apresentar-Arma/Olhar à Direita → exórdio → autoridade responde.", criterios: ["Guarda em uma fileira, efetivo ≥ 6 soldados", "Cmt da guarda comanda 'Guarda, Sentido! Ombro-Arma!'", "Corneteiro/clarim toca o indicativo do posto/função sem comando à voz", "Para Of-Gen: 'Apresentar-Arma! Olhar à Direita!' e execução do exórdio/marcha batida", "Autoridade responde à continência no início do exórdio"], resposta: "A guarda do quartel forma em uma fileira, com efetivo igual ou maior que 6 soldados. Ao ocupar o local de recebimento, o Cmt da guarda comanda 'Guarda, Sentido! Ombro-Arma!'. O corneteiro ou clarim toca o indicativo do posto e função da autoridade, sem comando à voz. Sendo Of-Gen ou Cmt-Geral, após o toque o Cmt da guarda comanda 'Apresentar-Arma! Olhar à Direita!', executando os movimentos com a guarda, seguindo-se o exórdio (ou marcha batida). A autoridade responde à continência no início do exórdio; a guarda só desfaz a continência depois que ela a ultrapassar." } },
  { modulo: "4", tipo: "dissertativa", enunciado: "Diferencie visita/inspeção SEM aviso prévio de visita/inspeção PROGRAMADA quanto aos procedimentos da OM.", modelo: { estrutura: "Sem aviso → rotina mantida, Cmt acompanha. Programada → autoridade indica finalidade/local/hora; recepção formal.", criterios: ["Sem aviso: não altera a rotina; Cmt vai ao encontro, apresenta-se e acompanha", "Programada: autoridade indica finalidade, local e hora", "Recepção pelo Cmt/Dir/Ch com o oficial de serviço e continências devidas"], resposta: "Na visita ou inspeção sem aviso prévio, a rotina de trabalho da OM não é alterada; ao ser informado da presença da autoridade, o comandante, chefe ou diretor vai ao seu encontro, apresenta-se e a acompanha durante a permanência, prestando-se em cada local de serviço os esclarecimentos solicitados. Já na visita ou inspeção programada, a autoridade visitante indica previamente a finalidade, o local e a hora, especificando as disposições a serem tomadas, sendo recebida pelo comandante, diretor ou chefe em conjunto com o oficial de serviço, com as continências devidas." } },

  // ════════════════════ MÓDULO 5 — Guarda-Bandeira ════════════════════
  { modulo: "5", tipo: "certo_errado", enunciado: "A Guarda-Bandeira tem a missão de transportar e proteger o Pavilhão Nacional e os Estandartes.", gabarito: "certo", explicacao: "Correto. É a missão precípua da Guarda-Bandeira." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Em instruções e treinamentos deve-se utilizar a própria Bandeira Nacional.", gabarito: "errado", explicacao: "Errado. Em instruções/treinamentos usa-se o ESTANDARTE; a Bandeira Nacional não é empregada sem as formalidades legais." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Cada OM deve possuir, no mínimo, 2 (dois) exemplares da Bandeira Nacional.", gabarito: "certo", explicacao: "Correto. Uma é hasteada no mastro; a outra é usada em formaturas/desfiles, guardada em armário envidraçado no gabinete do Cmt." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A Guarda-Bandeira é constituída pelo Porta-Bandeira, pelo Porta-Estandarte (se houver) e por 5 ou 6 guardas, sendo 2 cabos e os demais soldados.", gabarito: "certo", explicacao: "Correto. Composição prevista no Vade-Mécum da Guarda-Bandeira (EB10-VM-12.004)." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A cadência oficial da Guarda-Bandeira, ao marchar, é de 116 passos por minuto.", gabarito: "errado", explicacao: "Errado. A cadência da Guarda-Bandeira é de 100 passos/min. (116 passos/min é a da revista na passagem de comando.)" },
  { modulo: "5", tipo: "certo_errado", enunciado: "Os oficiais Porta-Bandeira formam e desfilam de pistola e espada; os demais integrantes da Guarda, de fuzil com baioneta armada.", gabarito: "certo", explicacao: "Correto. Sargentos Porta-Estandarte: de pistola; demais: fuzil com baioneta." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A Bandeira Nacional é desfraldada quando a tropa faz 'Apresentar-Arma' e, em marcha, no 'Olhar à Direita'.", gabarito: "certo", explicacao: "Correto. E é sempre desfraldada na posição vertical." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Nas passagens de comando em recinto coberto, a Bandeira Nacional não é desfraldada.", gabarito: "certo", explicacao: "Correto. Em recinto coberto não se desfralda a Bandeira." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Toda a Guarda-Bandeira executa o movimento de 'Apresentar-Arma' durante as cerimônias.", gabarito: "errado", explicacao: "Errado. Apenas o Porta-Bandeira e o Porta-Estandarte executam 'Apresentar-Arma'; os demais fazem Sentido/Descansar/Ombro-Arma/Descansar-Arma/Ordinário-Marche." },
  { modulo: "5", tipo: "certo_errado", enunciado: "O Porta-Bandeira é selecionado entre os oficiais ou aspirantes a oficial mais modernos da OM.", gabarito: "certo", explicacao: "Correto. E as praças componentes são as mais distintas da OM." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Na incorporação, a banda executa a Alvorada de 'Lo Schiavo' (espera) e, em seguida, a 'Canção do Expedicionário', quando o Porta-Bandeira comanda 'Marcar-Passo'.", gabarito: "certo", explicacao: "Correto. Após forte batida de bumbo, a Guarda segue em frente na cadência de 100 passos/min." },
  { modulo: "5", tipo: "certo_errado", enunciado: "No desfile, a Guarda-Bandeira mantém distância de 10 passos da fração que a antecede e da que a sucede.", gabarito: "certo", explicacao: "Correto. Balizas: branca (30 m), azul (20 m) e vermelha (10 m)." },
  { modulo: "5", tipo: "certo_errado", enunciado: "É na terceira baliza (vermelha) que, ao comando do Porta-Bandeira, a Bandeira Nacional é desfraldada e os estandartes abatidos.", gabarito: "certo", explicacao: "Correto. A primeira baliza (branca, 30 m) é o início da continência do desfile." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Os cabos da Guarda-Bandeira posicionam-se na fileira de trás, afastados do Porta-Bandeira.", gabarito: "errado", explicacao: "Errado. Os cabos posicionam-se na FILEIRA DA FRENTE, ao lado do Porta-Bandeira e/ou Porta-Estandarte." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A Bandeira Nacional é sempre desfraldada na posição vertical.", gabarito: "certo", explicacao: "Correto." },

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
  { modulo: "5", tipo: "multipla", enunciado: "No desfile, as balizas auxiliares da continência aquém do homenageado têm as cores e distâncias:", alternativas: A(
    "branca a 30 m, azul a 20 m e vermelha a 10 m",
    "vermelha a 30 m, azul a 20 m e branca a 10 m",
    "azul a 30 m, branca a 20 m e vermelha a 10 m",
    "branca a 10 m, azul a 20 m e vermelha a 30 m",
    "todas brancas, a cada 10 m"),
    gabarito: "A", explicacao: "Aquém: branca (30 m, início da continência), azul (20 m) e vermelha (10 m, última antes do homenageado)." },
  { modulo: "5", tipo: "multipla", enunciado: "O armamento dos integrantes da Guarda-Bandeira é:", alternativas: A(
    "oficiais Porta-Bandeira: pistola e espada; sargentos Porta-Estandarte: pistola; demais: fuzil com baioneta",
    "todos de fuzil",
    "todos de pistola",
    "todos de espada",
    "oficiais desarmados; praças de fuzil"),
    gabarito: "A", explicacao: "Distribuição prevista no Vade-Mécum da Guarda-Bandeira." },

  { modulo: "5", tipo: "dissertativa", fonte: "1ª AE IG/2025", enunciado: "Descreva, em linhas gerais, o procedimento de incorporação da Guarda-Bandeira à tropa.", modelo: { estrutura: "Cmt verifica prontidão → Sentido/Ombro-Arma/Bandeira Avançar → deslocamento a 30 passos → Em Continência à Bandeira/Apresentar-Arma → Hino Nacional → ocupa lugar.", criterios: ["Cmt comanda 'Sentido', 'Ombro-Arma', 'Bandeira, Avançar'", "Guarda desloca-se a ~30 passos do lugar na formatura", "'Em Continência à Bandeira – Apresentar-Arma' e desfralde do Pavilhão", "Banda executa o Hino Nacional", "Encerra com Ombro-Arma/Descansar-Arma/Descansar"], resposta: "Verificando que a Guarda-Bandeira está pronta, o Cmt da tropa comanda, a toque de corneta/clarim, 'Sentido', 'Ombro-Arma' e 'Bandeira, Avançar'. Ao som da Alvorada de 'Lo Schiavo' e depois da 'Canção do Expedicionário', a Guarda desloca-se na cadência de 100 passos/min, posicionando-se a cerca de 30 passos do lugar que ocupará na formatura. O Cmt comanda 'Em Continência à Bandeira – Apresentar-Arma': o Porta-Bandeira desfralda o Pavilhão e a banda executa o Hino Nacional. Ao final, a Guarda ocupa seu lugar no dispositivo e o Cmt encerra com 'Ombro-Arma', 'Descansar-Arma' e 'Descansar'." } },
  { modulo: "5", tipo: "dissertativa", enunciado: "Explique por que, em instruções e treinamentos, deve-se utilizar o estandarte, e cite a quantidade mínima de Bandeiras Nacionais que cada OM deve possuir e sua guarda.", modelo: { estrutura: "Razão (dignidade/formalidades) → estandarte em treino → mínimo 2 exemplares → guarda.", criterios: ["Bandeira Nacional não é usada sem as formalidades legais", "Em treino/instrução usa-se o estandarte", "Mínimo de 2 exemplares por OM", "Uma no mastro; outra em formaturas/desfiles, guardada em armário envidraçado no gabinete do Cmt"], resposta: "Para dar à Bandeira Nacional o respeito e a dignidade que o símbolo possui, ela não deve ser empregada em atividades de treinamento nem sem as formalidades legais; por isso, em instruções e treinamentos utiliza-se o estandarte. Cada OM deve possuir, no mínimo, 2 exemplares da Bandeira Nacional: uma é hasteada no mastro principal e a outra é usada em formaturas e desfiles, sendo esta guardada com mastro e talabarte, na vertical, em armário envidraçado, em local visível e de destaque no gabinete do comandante, chefe ou diretor." } },

  // ════════════════════ MÓDULO 6 — Compromisso e promoção ao primeiro posto ════════════════════
  { modulo: "6", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "O Compromisso ao primeiro posto será prestado em solenidade especialmente programada, perante a Bandeira Nacional.", gabarito: "certo", explicacao: "Correto. É prestado em solenidade especial, perante a Bandeira Nacional." },
  { modulo: "6", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "Os comprometentes, com olhos fitos na Bandeira Nacional, depois de perfilarem espadas, prestam o compromisso em voz alta e pausada.", gabarito: "errado", explicacao: "Errado. Após ABATEREM as espadas (não perfilarem) é que prestam o compromisso, com olhos fitos na Bandeira." },
  { modulo: "6", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "Se o oficial promovido servir em Estabelecimento ou Repartição, o compromisso é prestado no gabinete do diretor ou chefe, assistido por todos os oficiais que ali servem.", gabarito: "certo", explicacao: "Correto (art. 182 do Estatuto)." },
  { modulo: "6", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "O compromisso de declaração a Guarda-Marinha e Aspirante-a-Oficial é prestado nas Escolas de Formação.", gabarito: "certo", explicacao: "Correto (art. 183). O cerimonial segue os regulamentos dos respectivos órgãos de ensino." },
  { modulo: "6", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "Todo militar nomeado ao primeiro posto prestará o compromisso de oficial, de acordo com o regulamento de cada Força.", gabarito: "certo", explicacao: "Correto. A cerimônia é presidida pelo Cmt da OM ou pela mais alta autoridade militar presente." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A cerimônia de compromisso ao primeiro posto pode ser presidida por qualquer oficial subalterno presente.", gabarito: "errado", explicacao: "Errado. É presidida pelo COMANDANTE DA OM ou pela MAIS ALTA autoridade militar presente." },
  { modulo: "6", tipo: "certo_errado", enunciado: "No cerimonial do compromisso, a Bandeira Nacional fica à frente, a vinte passos do centro da tropa.", gabarito: "certo", explicacao: "Correto. O comandante posta-se diante do dispositivo, a cinco passos da Bandeira." },
  { modulo: "6", tipo: "certo_errado", enunciado: "No cerimonial, a tropa, à ordem do comandante, toma a posição de 'Sentido' e os comprometentes desembainham e perfilam suas espadas.", gabarito: "certo", explicacao: "Correto. Em seguida a tropa apresenta arma e o comandante faz a continência individual." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Conforme o Estatuto dos Militares de PE, todo cidadão, após ingressar na PM, prestará compromisso de honra.", gabarito: "certo", explicacao: "Correto (art. 31). Afirma a aceitação consciente das obrigações e deveres policiais-militares." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O compromisso de honra (art. 31/32) tem caráter solene e é prestado na presença de tropa.", gabarito: "certo", explicacao: "Correto. Tão logo o policial-militar adquira grau de instrução compatível." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O compromisso do Aspirante-a-Oficial PM é prestado de acordo com o cerimonial do regulamento da Academia de Polícia Militar.", gabarito: "certo", explicacao: "Correto (§1º do art. 32)." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Os demais oficiais da OM, a dois passos atrás da Bandeira, em duas fileiras e com espadas perfiladas, assistem ao compromisso.", gabarito: "certo", explicacao: "Correto. Posicionam-se à retaguarda da Bandeira Nacional." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O compromisso ao primeiro posto pode ser prestado a qualquer tempo, sem necessidade de solenidade.", gabarito: "errado", explicacao: "Errado. É prestado em solenidade especialmente programada, na primeira oportunidade após a nomeação." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Antes de abaterem as espadas para o compromisso, a tropa apresenta arma e o comandante faz a continência individual.", gabarito: "certo", explicacao: "Correto. É a sequência do cerimonial do compromisso." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Os comprometentes posicionam-se a cinco passos da Bandeira Nacional, à esquerda e a dois passos do comandante.", gabarito: "certo", explicacao: "Correto, com a frente para a tropa e para a Bandeira Nacional." },

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
  { modulo: "6", tipo: "multipla", enunciado: "Imediatamente antes de os comprometentes prestarem o compromisso, ocorre:", alternativas: A(
    "a tropa apresenta arma, o comandante faz a continência individual e os comprometentes abatem espadas",
    "a tropa descansa arma",
    "o desfile da tropa",
    "a leitura do BI",
    "o hasteamento da Bandeira"),
    gabarito: "A", explicacao: "Apresentar arma → continência do comandante → comprometentes abatem espadas → compromisso em voz alta e pausada." },
  { modulo: "6", tipo: "multipla", enunciado: "Sobre o compromisso de honra do art. 31/32 do Estatuto de PE, é correto:", alternativas: A(
    "tem caráter solene e é prestado na presença de tropa, tão logo o militar adquira instrução compatível",
    "é dispensável para praças",
    "é prestado apenas por escrito",
    "só vale para oficiais",
    "não exige presença de tropa"),
    gabarito: "A", explicacao: "Caráter solene, na presença de tropa, com a aceitação consciente das obrigações e deveres." },

  { modulo: "6", tipo: "dissertativa", enunciado: "Descreva o cerimonial do compromisso ao primeiro posto, indicando o posicionamento da tropa, da Bandeira e dos comprometentes.", modelo: { estrutura: "Tropa armada/equipada → Bandeira à frente (20 passos) → comandante a 5 passos → comprometentes → sentido/desembainhar/perfilar → apresentar arma/continência → abater espadas/compromisso.", criterios: ["Tropa em linha de pelotões; Bandeira à frente a 20 passos do centro", "Comandante a 5 passos da Bandeira, voltado para ela", "Comprometentes a 5 passos da Bandeira, à esquerda e a 2 passos do comandante", "Sentido → desembainham e perfilam espadas; demais oficiais atrás da Bandeira", "Apresentar arma + continência do comandante; comprometentes abatem espadas e prestam o compromisso"], resposta: "A tropa forma armada e equipada, em linha de pelotões ou equivalentes, com a Bandeira Nacional à frente, a vinte passos do centro; o comandante posta-se diante do dispositivo, voltado para a Bandeira, a cinco passos desta. Os comprometentes, com a frente para a tropa e para a Bandeira, colocam-se a cinco passos desta, à esquerda e a dois passos do comandante. À ordem, a tropa toma 'Sentido' e os comprometentes desembainham e perfilam as espadas; os demais oficiais, a dois passos atrás da Bandeira, em duas fileiras e com espadas perfiladas, assistem. Em seguida, a tropa apresenta arma e o comandante faz a continência individual; os comprometentes, olhos fitos na Bandeira, abatem espadas e prestam, em voz alta e pausada, o compromisso." } },
  { modulo: "6", tipo: "dissertativa", enunciado: "Diferencie o compromisso de honra do ingresso (art. 31/32) do compromisso prestado ao ser promovido ao primeiro posto (§2º do art. 32).", modelo: { estrutura: "Ingresso → aceitação dos deveres, na presença de tropa. 1º posto → 'Perante a Bandeira do Brasil...'.", criterios: ["Compromisso de ingresso: aceitação consciente das obrigações/deveres, caráter solene, presença de tropa", "Compromisso ao 1º posto: em solenidade especial, perante a Bandeira", "Citar os dizeres do compromisso de oficial"], resposta: "O compromisso de honra do ingresso (arts. 31 e 32) é prestado por todo cidadão após ingressar na PM, afirmando a aceitação consciente das obrigações e deveres policiais-militares; tem caráter solene e é prestado na presença de tropa, tão logo o militar adquira grau de instrução compatível. Já o compromisso ao ser promovido ao primeiro posto (§2º do art. 32) é prestado pelo oficial em solenidade especialmente programada, perante a Bandeira Nacional, com os dizeres: 'Perante a Bandeira do Brasil e pela minha honra prometo cumprir os deveres de oficial da Polícia Militar do Estado de Pernambuco e dedicar-me ao seu serviço.'" } },

  // ════════════════════ MÓDULO 7 — Solenidades e passagem de comando ════════════════════
  { modulo: "7", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "A entrega de condecorações, homenagens e apresentações culturais podem fazer parte de uma solenidade militar.", gabarito: "certo", explicacao: "Correto. Constam do roteiro básico de 12 pontos (ponto VII)." },
  { modulo: "7", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "A chegada da autoridade é considerada fora do roteiro de uma solenidade.", gabarito: "errado", explicacao: "Errado. A 'Chegada da Autoridade' é o ponto I do roteiro." },
  { modulo: "7", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "As Honras Militares, na solenidade, serão prestadas somente à maior autoridade (civil ou militar) presente.", gabarito: "certo", explicacao: "Correto. Maior precedência não equivale a direito às honras militares." },
  { modulo: "7", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "Ao final da solenidade, há necessidade de solicitar autorização para o seu encerramento.", gabarito: "certo", explicacao: "Correto. A maior autoridade militar da ativa pede permissão para iniciar e encerrar à autoridade de maior precedência." },
  { modulo: "7", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "Em uma solenidade militar, as pessoas podem aplaudir após a execução do Hino Nacional em todas as hipóteses.", gabarito: "errado", explicacao: "Errado. A assertiva é falsa no contexto do gabarito: não é em todas as hipóteses." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Os pronunciamentos, no roteiro da solenidade, seguem da maior para a menor autoridade.", gabarito: "errado", explicacao: "Errado. Os pronunciamentos vão da MENOR para a MAIOR autoridade (ponto VIII)." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A execução do Hino Nacional só tem início depois que todas as autoridades da mesa de honra tiverem ocupado seus lugares.", gabarito: "certo", explicacao: "Correto (ponto V do roteiro)." },
  { modulo: "7", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "Durante as solenidades de passagem de comando de OME, o evento de transmissão do cargo será conduzido pela autoridade imediatamente superior na cadeia de comando.", gabarito: "certo", explicacao: "Correto." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A passagem de comando é apenas um dos eventos da cerimônia de transmissão do cargo.", gabarito: "errado", explicacao: "Errado. É o inverso: a TRANSMISSÃO DO CARGO é um dos eventos da PASSAGEM DE COMANDO (cerimônia mais ampla)." },
  { modulo: "7", tipo: "certo_errado", fonte: "2ª AE IG/2026", enunciado: "Na transmissão do cargo, o Cmt sucedido e o sucessor, voltando-se um para o outro, abatem as espadas; a autoridade que conduz permanece com a espada perfilada.", gabarito: "certo", explicacao: "Correto. Porta-Bandeira e Porta-Estandarte permanecem em 'Ombro-Arma'." },
  { modulo: "7", tipo: "certo_errado", fonte: "2ª AE IG/2026 (adaptada)", enunciado: "A voz 'Em Continência à Bandeira, Apresentar-Arma!' na transmissão do cargo é executada por toda a tropa.", gabarito: "errado", explicacao: "Errado. É executada SOMENTE pela autoridade que conduz e pelos Cmt sucedido e sucessor." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Na data da passagem de comando são confeccionados dois boletins: o normal (último do sucedido, com a exoneração) e um especial (primeiro do sucessor, com a nomeação).", gabarito: "certo", explicacao: "Correto. O normal traz as palavras de despedida; o especial, o ato de nomeação." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A revista da tropa na passagem de comando é realizada em todas as solenidades, inclusive nas de grandes comandos.", gabarito: "errado", explicacao: "Errado. A revista ocorre APENAS nas passagens de comando de unidade e subunidade isolada." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Na revista, o Cmt sucessor desloca-se com a espada perfilada e o sucedido vai à sua direita com a espada embainhada, simbolizando o cumprimento da missão.", gabarito: "certo", explicacao: "Correto. A cadência da revista é de 116 passos/min." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Após a revista, a tropa desfila em continência ao Comandante sucessor.", gabarito: "certo", explicacao: "Correto. O sucessor ocupa lugar de destaque para receber a continência do desfile." },

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
  { modulo: "7", tipo: "multipla", enunciado: "Sobre os dois boletins da data da passagem de comando, é correto:", alternativas: A(
    "o normal é o último assinado pelo sucedido (exoneração/despedida) e o especial é o primeiro do sucessor (nomeação)",
    "ambos são assinados pelo sucessor",
    "ambos trazem apenas a exoneração",
    "só há um boletim, o especial",
    "os boletins são assinados pela autoridade que conduz o evento"),
    gabarito: "A", explicacao: "Boletim normal: último do sucedido; boletim especial: primeiro do sucessor." },
  { modulo: "7", tipo: "multipla", enunciado: "Na transmissão do cargo, a autoridade que conduz o evento, ao abaterem as espadas os dois comandantes:", alternativas: A(
    "permanece com a espada perfilada",
    "abate também a espada",
    "embainha a espada",
    "entrega a espada ao sucessor",
    "faz meia-volta"),
    gabarito: "A", explicacao: "A autoridade que conduz permanece com a espada perfilada; Porta-Bandeira/Estandarte em 'Ombro-Arma'." },

  { modulo: "7", tipo: "dissertativa", enunciado: "Diferencie 'passagem de comando' de 'transmissão do cargo' e cite três eventos que compõem a solenidade de passagem de comando.", modelo: { estrutura: "Conceitos → relação (transmissão é parte) → eventos.", criterios: ["Passagem de comando = cerimônia ampla; transmissão do cargo = parte dela", "Citar 3 eventos (chegada/continência, apresentação da tropa, exoneração, nomeação, transmissão, revista, desfile)"], resposta: "A passagem de comando é a cerimônia militar completa, constituída de vários eventos, entre os quais se destaca a transmissão do cargo, que é parte enquadrante da primeira. São eventos da solenidade, por exemplo: a chegada das autoridades e a continência à maior autoridade; a apresentação da tropa; a leitura da finalidade; a exoneração do Cmt sucedido (com palavras de despedida) e a nomeação do sucessor; o evento de transmissão do cargo; a revista da tropa (em unidade/subunidade isolada); e o desfile em continência ao Cmt sucessor." } },
  { modulo: "7", tipo: "dissertativa", enunciado: "Descreva o momento da transmissão do cargo na passagem de comando, indicando a posição das espadas e quem executa o 'Apresentar-Arma'.", modelo: { estrutura: "Triângulo isósceles → palavras de entrega/assunção → abater espadas → autoridade perfilada → 'Apresentar-Arma' só pelos 3.", criterios: ["Cmt sucedido e sucessor + autoridade formam triângulo (3 m)", "Sucedido diz 'Entrego o comando...' e sucessor 'Assumo o comando...'", "Os dois comandantes abatem espadas; autoridade permanece com espada perfilada", "'Em Continência à Bandeira, Apresentar-Arma!' executado só pela autoridade e pelos dois comandantes"], resposta: "Ocupados os lugares, a autoridade que conduz o evento e os Cmt sucedido e sucessor desembainham as espadas e, voltados para a Bandeira, seguem 'Sentido' e 'Ombro-Arma'. O sucedido profere 'Entrego o comando...' e o sucessor 'Assumo o comando...'. Voltando-se um para o outro, os dois oficiais abatem as espadas, enquanto a autoridade que conduz permanece com a espada perfilada e o Porta-Bandeira e o Porta-Estandarte ficam em 'Ombro-Arma'. Após, perfilam as espadas e voltam-se para a Bandeira; a autoridade comanda 'Em Continência à Bandeira, Apresentar-Arma!', executado somente por ela e pelos Cmt sucedido e sucessor, enquanto o Porta-Bandeira desfralda a Bandeira." } },

  // ════════════════════ MÓDULO 8 — Honras fúnebres e condecorações ════════════════════
  { modulo: "8", tipo: "certo_errado", enunciado: "Honras Fúnebres são homenagens póstumas prestadas diretamente pela tropa aos despojos de alta autoridade ou de militar da ativa, conforme a posição hierárquica.", gabarito: "certo", explicacao: "Correto. Definição do Vade-Mécum de Honras Fúnebres (EB10-VM-12.009)." },
  { modulo: "8", tipo: "certo_errado", enunciado: "São três os tipos de Honras Fúnebres: Guarda Fúnebre, Escolta Fúnebre e Salvas Fúnebres.", gabarito: "certo", explicacao: "Correto. São os três tipos previstos." },
  { modulo: "8", tipo: "certo_errado", enunciado: "O ataúde, depois de fechado e até o início da inumação, é coberto com a Bandeira Nacional.", gabarito: "certo", explicacao: "Correto. Antes do sepultamento, a Bandeira é dobrada e entregue à família." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Por ocasião do sepultamento, ao descer o corpo à sepultura, executa-se o toque de silêncio por corneteiro ou clarim.", gabarito: "certo", explicacao: "Correto. É parte das homenagens póstumas no sepultamento." },
  { modulo: "8", tipo: "certo_errado", enunciado: "A composição da Guarda Fúnebre independe do posto ou graduação do falecido.", gabarito: "errado", explicacao: "Errado. A composição VARIA conforme o posto/graduação do falecido (de 1 batalhão para Of-Gen a 4 homens para cabos/soldados)." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Para um Oficial Superior, a Guarda Fúnebre é composta por duas companhias.", gabarito: "certo", explicacao: "Correto. Of-Gen/Cmt-Geral: 1 batalhão; Of. Superior: 2 companhias; Of. Intermediário: 1 companhia." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Para subtenentes e sargentos, a Guarda Fúnebre é composta por um grupo de combate (nove homens).", gabarito: "certo", explicacao: "Correto. Cabos/soldados: uma esquadra (quatro homens)." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Ao comando de 'PREPARAR!' na guarda fúnebre, os homens executam um giro de 90 graus à direita.", gabarito: "errado", explicacao: "Errado. O giro é de 45 GRAUS à direita, sobre a planta do pé esquerdo." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Na guarda fúnebre são executadas três descargas (salvas) de fuzil.", gabarito: "certo", explicacao: "Correto. As três descargas são comandadas por 'Carregar! Apontar! Fogo!', repetidas três vezes." },
  { modulo: "8", tipo: "certo_errado", enunciado: "A Guarda Fúnebre se posta no trajeto do cortejo, com a sua direita voltada para o lado de onde virá o cortejo.", gabarito: "certo", explicacao: "Correto. De preferência na vizinhança da casa mortuária ou da necrópole, sem interromper o trânsito." },
  { modulo: "8", tipo: "certo_errado", enunciado: "A entrega de condecorações é realizada, em princípio, na presença de tropa armada, sempre com a Bandeira Nacional presente.", gabarito: "certo", explicacao: "Correto. Em data festiva, feriado nacional ou dia designado pelo Comandante." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Na entrega de condecorações, quando oficiais, ao defrontarem os paraninfos, abatem as espadas; quando praças, fazem continência individual.", gabarito: "certo", explicacao: "Correto. Mantêm a posição até o paraninfo terminar de colocar a medalha." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Durante as três descargas de fuzil na guarda fúnebre, o restante da tropa permanece em 'Apresentar-Arma'.", gabarito: "errado", explicacao: "Errado. Durante as descargas, o restante da tropa permanece em 'Ombro-Arma'." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Para Oficial-General ou Comandante-Geral, a Guarda Fúnebre é composta por um batalhão.", gabarito: "certo", explicacao: "Correto. É o maior efetivo previsto na composição." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Quando o cortejo fúnebre estiver a cerca de 20 passos da tropa, é dado o comando 'EM FUNERAL! PREPARAR!'.", gabarito: "certo", explicacao: "Correto. O cortejo para ao alcançar a Guarda Fúnebre para receber as homenagens." },

  { modulo: "8", tipo: "multipla", fonte: "2ª AE IG/2026", enunciado: "Em quantos graus o militar realiza o giro após o comando de 'PREPARAR!' na guarda fúnebre?", alternativas: A("45°", "90°", "60°", "75°", "30°"), gabarito: "A", explicacao: "Giro de 45 graus à direita, sobre a planta do pé esquerdo." },
  { modulo: "8", tipo: "multipla", enunciado: "Na composição da Guarda Fúnebre, o efetivo previsto para um Oficial Superior é:", alternativas: A("2 (duas) companhias", "1 (um) batalhão", "1 (uma) companhia", "1 (um) pelotão", "1 (um) grupo de combate"), gabarito: "A", explicacao: "Of-Gen/Cmt-Geral: 1 batalhão; Of. Superior: 2 companhias; Of. Intermediário: 1 companhia; Of. Subalterno: 1 pelotão." },
  { modulo: "8", tipo: "multipla", enunciado: "São os três tipos de Honras Fúnebres:", alternativas: A(
    "Guarda Fúnebre, Escolta Fúnebre e Salvas Fúnebres",
    "Guarda de Honra, Escolta e Desfile",
    "Velório, Cortejo e Sepultamento",
    "Salvas, Toque de Silêncio e Dobrar de Bandeira",
    "Guarda Fúnebre, Revista e Continência"),
    gabarito: "A", explicacao: "Guarda Fúnebre, Escolta Fúnebre e Salvas Fúnebres." },
  { modulo: "8", tipo: "multipla", enunciado: "Para Aspirantes e Alunos de Academia de Formação de Oficiais, a Guarda Fúnebre é composta por:", alternativas: A(
    "dois grupos de combate (dezoito homens)", "um pelotão", "uma companhia", "um grupo de combate (nove homens)", "uma esquadra (quatro homens)"),
    gabarito: "A", explicacao: "Aspirantes/Alunos: 18 homens; subtenentes/sargentos: 9; cabos/soldados: 4." },
  { modulo: "8", tipo: "multipla", enunciado: "Na entrega de condecorações, o militar oficial, ao defrontar o paraninfo:", alternativas: A(
    "abate a espada e permanece assim até o paraninfo terminar de colocar a medalha",
    "faz continência individual",
    "permanece em sentido sem mover a espada",
    "embainha a espada",
    "executa meia-volta"),
    gabarito: "A", explicacao: "Oficiais abatem espadas; praças fazem continência individual." },

  { modulo: "8", tipo: "dissertativa", fonte: "2ª AE IG/2026", enunciado: "Defina Honras Fúnebres e cite seus tipos (mín. 4 / máx. 8 linhas).", modelo: { estrutura: "Definição → 3 tipos.", criterios: ["Homenagens póstumas prestadas diretamente pela tropa", "Aos despojos de alta autoridade ou militar da ativa, conforme a posição hierárquica", "Citar Guarda Fúnebre, Escolta Fúnebre e Salvas Fúnebres"], resposta: "Honras Fúnebres são homenagens póstumas prestadas diretamente pela tropa aos despojos mortais de alta autoridade ou de militar da ativa, de acordo com a posição hierárquica que ocupava. Consistem basicamente em três tipos distintos: 1) Guarda Fúnebre; 2) Escolta Fúnebre; e 3) Salvas Fúnebres." } },
  { modulo: "8", tipo: "dissertativa", enunciado: "Apresente a composição da Guarda Fúnebre conforme o posto/graduação do falecido.", modelo: { estrutura: "Tabela posto → efetivo.", criterios: ["Of-Gen/Cmt-Geral: 1 batalhão", "Of. Superior: 2 companhias; Of. Intermediário: 1 companhia; Of. Subalterno: 1 pelotão", "Aspirantes/Alunos: 18 homens; Subten/Sgt: 9 homens; Cabos/Sd: 4 homens"], resposta: "A composição da Guarda Fúnebre varia conforme o posto ou graduação do falecido: Oficial-General ou Comandante-Geral — um batalhão; Oficial Superior — duas companhias; Oficial Intermediário — uma companhia; Oficial Subalterno — um pelotão; Aspirantes e Alunos de Academia de Formação de Oficiais — dois grupos de combate (dezoito homens); Subtenentes e Sargentos — um grupo de combate (nove homens); e Cabos e Soldados — uma esquadra de grupo de combate (quatro homens)." } },

  // ════════════════════ MÓDULO 9 — Atribuições, serviço interno e BI ════════════════════
  { modulo: "9", tipo: "certo_errado", fonte: "2ª AE IG/2026 (adaptada)", enunciado: "É atribuição do Comandante de OME transferir o militar levando em consideração a localização geográfica de sua residência.", gabarito: "errado", explicacao: "Errado. Essa NÃO é atribuição do Cmt de OME (foi a alternativa incorreta da prova)." },
  { modulo: "9", tipo: "certo_errado", enunciado: "A ação de comando caracteriza-se pelos atos de planejar, orientar, coordenar, acompanhar, controlar, fiscalizar e apurar responsabilidades.", gabarito: "certo", explicacao: "Correto. O comando é função do grau hierárquico, da qualificação e das habilitações — prerrogativa impessoal." },
  { modulo: "9", tipo: "certo_errado", enunciado: "O Comandante deve dar suas ordens e instruções, sempre que possível, por intermédio do Subcomandante da Unidade.", gabarito: "certo", explicacao: "Correto (inciso LII). Quem as receber diretamente deve dar ciência ao SCmt na primeira oportunidade." },
  { modulo: "9", tipo: "certo_errado", enunciado: "O Comandante pode anular em BI, quando houver razões, qualquer ato seu ou de seus subordinados, dentro do prazo de cento e oitenta dias.", gabarito: "certo", explicacao: "Correto (inciso LIX)." },
  { modulo: "9", tipo: "certo_errado", enunciado: "O Subcomandante é o principal auxiliar e substituto imediato do Cmt U e o Chefe do Estado-Maior da OME.", gabarito: "certo", explicacao: "Correto. Intermediário na expedição de ordens relativas à disciplina, instrução e serviços gerais." },
  { modulo: "9", tipo: "certo_errado", enunciado: "O serviço de escala compreende, entre outros, a portaria e os serviços gerais.", gabarito: "errado", explicacao: "Errado. 'Portaria e serviços gerais' NÃO integra o serviço de escala (foi a alternativa de exceção da prova)." },
  { modulo: "9", tipo: "certo_errado", enunciado: "Não serão publicados no BI os assuntos transmitidos à unidade em caráter sigiloso ou quaisquer referências a eles.", gabarito: "certo", explicacao: "Correto. Assuntos sigilosos vão em boletim de acesso restrito, não no BI ostensivo." },
  { modulo: "9", tipo: "certo_errado", enunciado: "O BI conterá as ordens e decisões do Cmt U, mesmo que já tenham sido executadas.", gabarito: "certo", explicacao: "Correto. Também as determinações superiores, mesmo cumpridas, com citação da referência." },
  { modulo: "9", tipo: "certo_errado", enunciado: "O Boletim Interno é dividido em quatro partes: Serviços Diários; Instrução; Assuntos Gerais e Administrativos; e Justiça e Disciplina.", gabarito: "certo", explicacao: "Correto. São as quatro partes do BI." },
  { modulo: "9", tipo: "certo_errado", enunciado: "O desconhecimento do BI justifica a falta ou o não cumprimento de ordens.", gabarito: "errado", explicacao: "Errado. O desconhecimento do BI NÃO justifica a falta ou o descumprimento de ordens (inciso VI)." },
  { modulo: "9", tipo: "certo_errado", enunciado: "Entre dois serviços de escala, observa-se, para o mesmo indivíduo, no mínimo a folga de quarenta e oito horas, sempre que possível.", gabarito: "certo", explicacao: "Correto (regra V das escalas de serviço). As folgas são contadas separadamente para cada serviço." },
  { modulo: "9", tipo: "certo_errado", enunciado: "Durante a gravidez e até que a criança atinja seis meses, a militar não concorre aos serviços de escala.", gabarito: "certo", explicacao: "Correto (regra XIV). É medida de proteção à maternidade." },
  { modulo: "9", tipo: "certo_errado", enunciado: "O Oficial de Dia é, fora do expediente, o representante do Comandante da Unidade.", gabarito: "certo", explicacao: "Correto. Deve permanecer no quartel, pronto e uniformizado, para qualquer eventualidade." },
  { modulo: "9", tipo: "certo_errado", enunciado: "O Comandante da Guarda do Quartel fecha os portões do quartel às dezoito horas, deixando aberta apenas a passagem individual do portão principal.", gabarito: "certo", explicacao: "Correto (inciso XVI). As chaves são entregues ao Of Dia às 21h, exceto a do portão principal." },
  { modulo: "9", tipo: "certo_errado", enunciado: "Faxinas são todos os trabalhos de utilidade geral (limpeza, lavagem, capinação, arrumação, transporte, carga ou descarga de material) regulados pelas NGA/U.", gabarito: "certo", explicacao: "Correto. Definição de faxinas no regulamento." },

  { modulo: "9", tipo: "multipla", fonte: "2ª AE IG/2026", enunciado: "Quanto às atribuições do Comandante de OME, assinale a alternativa INCORRETA:", alternativas: A(
    "Transferir o militar, levando em consideração a localização geográfica de sua residência.",
    "Transcrever, a seu juízo, em BI, as recompensas concedidas pelos comandos subordinados.",
    "Conceder licenças de acordo com as instruções e normas específicas em vigor.",
    "Dar suas ordens e instruções, sempre que possível, por intermédio do Subcomandante.",
    "Atender às ponderações justas de seus subordinados, quando feitas em termos adequados e de sua competência."),
    gabarito: "A", explicacao: "A incorreta é 'A': transferir militar pela localização da residência não é atribuição do Cmt de OME." },
  { modulo: "9", tipo: "multipla", fonte: "2ª AE IG/2026", enunciado: "Sobre o serviço interno, o serviço de escala compreende, EXCETO:", alternativas: A(
    "Portaria e serviços gerais.",
    "Guarda do quartel.",
    "Sgt Dia SU.",
    "Guarda das SU (alojamentos, garagens, cavalariças, canis).",
    "Serviço-de-dia ao rancho (Sgt Dia, cozinheiro, cassineiro)."),
    gabarito: "A", explicacao: "A escala NÃO inclui 'portaria e serviços gerais'." },
  { modulo: "9", tipo: "multipla", fonte: "2ª AE IG/2026", enunciado: "O Boletim Interno (BI) conterá, especialmente, EXCETO:", alternativas: A(
    "Os assuntos transmitidos à unidade em caráter sigiloso.",
    "A discriminação do serviço a ser executado pela unidade.",
    "As ordens e decisões do Cmt U, mesmo já executadas.",
    "As determinações das autoridades superiores, mesmo já cumpridas, com a referência.",
    "As alterações ocorridas com o pessoal e o material da unidade."),
    gabarito: "A", explicacao: "Assuntos sigilosos não são publicados no BI ostensivo." },
  { modulo: "9", tipo: "multipla", enunciado: "Na designação para serviços de escala, em igualdade de folga designa-se primeiro:", alternativas: A(
    "o de menor posto ou graduação, ou mais moderno",
    "o de maior posto",
    "o mais antigo",
    "por sorteio",
    "o voluntário"),
    gabarito: "A", explicacao: "Regra III: em igualdade de folga, designa-se primeiro o mais moderno. O serviço externo é escalado antes do interno." },
  { modulo: "9", tipo: "multipla", enunciado: "O Oficial de Dia, fora do expediente, é:", alternativas: A(
    "o representante do Comandante da Unidade",
    "o substituto do Subcomandante apenas",
    "responsável apenas pela guarda",
    "o chefe da SEI",
    "o auxiliar do P4"),
    gabarito: "A", explicacao: "Representa o Cmt U fora do expediente; recebe autoridades de categoria igual ou superior à do Cmt." },

  { modulo: "9", tipo: "dissertativa", enunciado: "Cite o que o Boletim Interno (BI) conterá especialmente e o que NÃO será nele publicado.", modelo: { estrutura: "Conterá (discriminação do serviço, ordens do Cmt, determinações superiores, alterações de pessoal/material...) → Não publicará (sigilosos; assuntos estranhos ao serviço).", criterios: ["Conterá: discriminação do serviço; ordens/decisões do Cmt mesmo executadas; determinações superiores com referência; alterações de pessoal/material", "Não publicará: assuntos sigilosos e referências a eles", "Não publicará: ocorrências/assuntos não relacionados ao serviço (salvo se geraram ordem ou ligados a comemoração cívica)"], resposta: "O BI conterá, especialmente: a discriminação do serviço a ser executado; as ordens e decisões do Cmt U, mesmo já executadas; as determinações das autoridades superiores, mesmo já cumpridas, com a citação do documento de referência; e as alterações ocorridas com o pessoal e o material da unidade, entre outros. Não serão nele publicados: os assuntos transmitidos em caráter sigiloso (ou quaisquer referências a eles), que vão em boletim de acesso restrito; e as ocorrências ou assuntos não relacionados ao serviço, salvo se tiverem dado lugar à expedição de ordem ou se ligados a comemoração de caráter cívico." } },
  { modulo: "9", tipo: "dissertativa", enunciado: "Discorra sobre o conceito de 'serviço de escala' e três regras de sua designação.", modelo: { estrutura: "Conceito → regras (externo antes do interno; maior folga; igualdade→mais moderno; 48h; gravidez).", criterios: ["Conceito: serviço não atribuído permanentemente à mesma pessoa, sem delegação ou escolha", "Externo antes do interno; extraordinário antes do ordinário", "Designa-se quem tiver maior folga; em igualdade, o mais moderno", "Folga mínima de 48h entre serviços, sempre que possível"], resposta: "Serviço de escala é todo serviço não atribuído permanentemente à mesma pessoa ou fração de tropa e que não importe em delegação pessoal ou escolha, visando à distribuição equitativa dos serviços da OME. Entre suas regras: o serviço externo é escalado antes do interno e, em cada caso, o extraordinário antes do ordinário; a designação recai em quem tiver maior folga no mesmo serviço e, em igualdade de folga, no de menor posto/graduação ou mais moderno; e observa-se, para o mesmo indivíduo, no mínimo a folga de quarenta e oito horas entre serviços, sempre que possível. Durante a gravidez e até a criança completar seis meses, a militar não concorre à escala." } },

  // ════════════════════ MÓDULO 10 — Precedência hierárquica (PMPE) ════════════════════
  { modulo: "10", tipo: "certo_errado", enunciado: "Na precedência da PMPE (SUNOR 20/2022), a ordem inicia pelo Comandante-Geral, seguido do Subcomandante-Geral.", gabarito: "certo", explicacao: "Correto. 1º Cmt-Geral; 2º Subcmt-Geral; 3º Chefe do EMG; 4º Diretor Geral de Adm e Diretor de Planejamento Operacional." },
  { modulo: "10", tipo: "certo_errado", enunciado: "O Chefe do Estado-Maior Geral tem precedência sobre o Subcomandante-Geral.", gabarito: "errado", explicacao: "Errado. O Subcomandante-Geral antecede o Chefe do EMG." },
  { modulo: "10", tipo: "certo_errado", enunciado: "Aos Comandantes-Gerais das PM e CBM do Brasil são deferidos tratamento, honras e precedência compatíveis com oficial-general de 2 estrelas das Forças Armadas.", gabarito: "certo", explicacao: "Correto (SUNOR 20/2022)." },
  { modulo: "10", tipo: "certo_errado", enunciado: "Uma autoridade de maior precedência tem, automaticamente, direito às honras militares.", gabarito: "errado", explicacao: "Errado. Maior precedência NÃO significa direito a honras militares; estas são da maior autoridade militar da ativa." },
  { modulo: "10", tipo: "certo_errado", enunciado: "Cabe à maior autoridade militar da ativa presidir a solenidade e receber a apresentação da tropa.", gabarito: "certo", explicacao: "Correto. Ela pede permissão para iniciar e encerrar à autoridade de maior precedência." },
  { modulo: "10", tipo: "certo_errado", enunciado: "O Comandante-Geral da PM, o Chefe da Casa Militar do Governador e o Subcomandante-Geral têm, nesta ordem, precedência sobre os demais coronéis.", gabarito: "certo", explicacao: "Correto, conforme o SUNOR 20/2022." },
  { modulo: "10", tipo: "certo_errado", enunciado: "A precedência entre o Cmt-Geral da PM e o Cmt-Geral do CBM é estabelecida pela data de criação da corporação mais antiga no Estado.", gabarito: "certo", explicacao: "Correto. Critério de antiguidade da corporação." },
  { modulo: "10", tipo: "certo_errado", enunciado: "O Diretor Geral de Administração e o Diretor de Planejamento Operacional ocupam, na precedência, posição imediatamente após o Chefe do Estado-Maior Geral.", gabarito: "certo", explicacao: "Correto. São o 4º nível de precedência." },
  { modulo: "10", tipo: "certo_errado", enunciado: "Quando uma autoridade se faz representar, seu representante assume a precedência correspondente à autoridade ausente.", gabarito: "errado", explicacao: "Errado. O representante tem lugar de destaque, mas NÃO a precedência da autoridade ausente." },
  { modulo: "10", tipo: "certo_errado", enunciado: "Os Comandantes das Unidades Operacionais de Área e Especializadas têm precedência regida pela precedência hierárquica e antiguidade no posto.", gabarito: "certo", explicacao: "Correto (nível VIII)." },
  { modulo: "10", tipo: "certo_errado", enunciado: "A composição do Dispositivo de Honra segue a ordem da menor para a maior autoridade.", gabarito: "errado", explicacao: "Errado. A ordem é sempre da MAIOR para a MENOR autoridade." },
  { modulo: "10", tipo: "certo_errado", enunciado: "O Comandante-Geral presidirá todas as cerimônias militares no âmbito da PM a que comparecer, salvo quando presente o Secretário de Defesa Social, entre outras autoridades previstas.", gabarito: "certo", explicacao: "Correto (SUNOR 20/2022)." },
  { modulo: "10", tipo: "certo_errado", enunciado: "Os Ex-Comandantes-Gerais da PM, desde que não exerçam outra função pública, têm precedência logo após o Comandante-Geral em exercício.", gabarito: "certo", explicacao: "Correto. Os ex-Subcomandantes, após o Subcomandante-Geral." },
  { modulo: "10", tipo: "certo_errado", enunciado: "Na precedência, observa-se a precedência funcional e a antiguidade nos postos dos níveis com diversos setores.", gabarito: "certo", explicacao: "Correto. É a regra geral de ordenação." },
  { modulo: "10", tipo: "certo_errado", enunciado: "Autoridades retardatárias que cheguem após o início devem ser citadas e ter sua precedência reposicionada na mesa de honra.", gabarito: "errado", explicacao: "Errado. Não se citam autoridades retardatárias; as demais que não integram a mesa de honra são apenas citadas." },

  { modulo: "10", tipo: "multipla", fonte: "2ª AE IG/2026 (adaptada)", enunciado: "Segundo o SUNOR 20/2022, a autoridade de MAIOR precedência na PMPE é:", alternativas: A(
    "Comandante-Geral", "Subcomandante-Geral", "Chefe do Estado-Maior Geral", "Diretor Geral de Administração", "Comandante de Unidade Operacional"),
    gabarito: "A", explicacao: "Ordem: 1º Cmt-Geral; 2º Subcmt-Geral; 3º Chefe do EMG; 4º Diretor Geral de Adm e Diretor de Planejamento Operacional." },
  { modulo: "10", tipo: "multipla", enunciado: "Assinale a sequência CORRETA de precedência (do maior para o menor):", alternativas: A(
    "Comandante-Geral → Subcomandante-Geral → Chefe do EMG → Diretor Geral de Administração",
    "Comandante-Geral → Chefe do EMG → Subcomandante-Geral → Diretor Geral de Administração",
    "Subcomandante-Geral → Comandante-Geral → Chefe do EMG → Diretor Geral",
    "Chefe do EMG → Comandante-Geral → Subcomandante-Geral → Diretor Geral",
    "Comandante-Geral → Diretor Geral → Subcomandante-Geral → Chefe do EMG"),
    gabarito: "A", explicacao: "Cmt-Geral → Subcmt-Geral → Chefe do EMG → Diretor Geral de Adm/Planejamento Operacional." },
  { modulo: "10", tipo: "multipla", enunciado: "Sobre precedência e honras militares, é correto:", alternativas: A(
    "ter maior precedência não significa ter direito às honras militares",
    "a maior precedência sempre garante honras militares",
    "honras militares são da autoridade civil de maior precedência",
    "honras militares independem da presença de tropa",
    "honras militares são da autoridade mais moderna"),
    gabarito: "A", explicacao: "Honras militares cabem à maior autoridade militar da ativa, que preside a solenidade." },
  { modulo: "10", tipo: "multipla", enunciado: "Aos Comandantes-Gerais das PM e CBM do Brasil são deferidos tratamento, honras e precedência compatíveis com:", alternativas: A(
    "oficial-general de 2 estrelas das Forças Armadas",
    "oficial-general de 4 estrelas",
    "coronel",
    "oficial superior",
    "oficial intermediário"),
    gabarito: "A", explicacao: "Equivalência a oficial-general 2 estrelas (SUNOR 20/2022)." },
  { modulo: "10", tipo: "multipla", enunciado: "Quando uma autoridade se faz representar em solenidade, o seu representante:", alternativas: A(
    "tem lugar de destaque, mas não a precedência da autoridade ausente",
    "assume a precedência da autoridade ausente",
    "não pode participar",
    "preside a solenidade",
    "fica à margem, sem citação"),
    gabarito: "A", explicacao: "Lugar de destaque, sem a precedência correspondente ao ausente." },

  { modulo: "10", tipo: "dissertativa", enunciado: "Enumere a ordem de precedência hierárquica na PMPE (do 1º ao 4º nível) e explique a relação entre precedência e honras militares.", modelo: { estrutura: "1º-4º níveis → precedência ≠ honras.", criterios: ["1º Comandante-Geral; 2º Subcomandante-Geral; 3º Chefe do EMG; 4º Diretor Geral de Administração e Diretor de Planejamento Operacional", "Maior precedência não garante honras militares", "Honras cabem à maior autoridade militar da ativa, que preside e recebe a apresentação da tropa"], resposta: "A ordem de precedência inicia-se pelo Comandante-Geral (1º), seguido do Subcomandante-Geral (2º), do Chefe do Estado-Maior Geral (3º) e do Diretor Geral de Administração e Diretor de Planejamento Operacional (4º), prosseguindo com os demais níveis (EMG/diretorias, colégios/centros médicos, academias/centros de ensino, comandos operacionais etc.), regidos pela precedência hierárquica e antiguidade no posto. A precedência, contudo, não se confunde com as honras militares: uma autoridade de maior precedência não tem, por isso, direito às honras; estas cabem à maior autoridade militar da ativa, a quem compete presidir a solenidade e receber a apresentação da tropa, pedindo permissão para iniciá-la e encerrá-la à autoridade de maior precedência." } },
  { modulo: "10", tipo: "dissertativa", enunciado: "Explique as regras de composição do Dispositivo de Honra e o tratamento de autoridades representadas e retardatárias.", modelo: { estrutura: "Ordem maior→menor → representante (destaque, sem precedência) → demais (citadas) → retardatárias (não citadas).", criterios: ["Composição da maior para a menor autoridade", "Representante: lugar de destaque, sem a precedência do ausente", "Demais autoridades fora da mesa: apenas citadas", "Não citar autoridades retardatárias"], resposta: "A composição do Dispositivo de Honra segue sempre a ordem da maior para a menor autoridade, conforme a precedência. Quando uma autoridade se faz representar, o representante tem lugar de destaque, mas não assume a precedência correspondente à autoridade ausente. As demais autoridades que não integram a mesa de honra devem ser apenas citadas, não se citando as autoridades retardatárias que chegarem após o início." } },

  // ════════════════════ MÓDULO 11 — Postos e graduações das Forças Armadas ════════════════════
  { modulo: "11", tipo: "certo_errado", enunciado: "Na Marinha, o posto mais elevado é o de Almirante, equivalente a Marechal (Exército) e Marechal-do-Ar (Aeronáutica).", gabarito: "certo", explicacao: "Correto. São postos privativos de tempo de guerra." },
  { modulo: "11", tipo: "certo_errado", enunciado: "Almirante-de-Esquadra (Marinha) equivale a General de Exército (Exército) e a Tenente-Brigadeiro (Aeronáutica).", gabarito: "certo", explicacao: "Correto. São oficiais-generais de 4 estrelas." },
  { modulo: "11", tipo: "certo_errado", enunciado: "Vice-Almirante equivale a General de Divisão e a Major-Brigadeiro.", gabarito: "certo", explicacao: "Correto. Oficiais-generais de 3 estrelas." },
  { modulo: "11", tipo: "certo_errado", enunciado: "Contra-Almirante equivale a General de Brigada e a Brigadeiro.", gabarito: "certo", explicacao: "Correto. Oficiais-generais de 2 estrelas — o primeiro posto de oficial-general." },
  { modulo: "11", tipo: "certo_errado", enunciado: "Capitão-de-Mar-e-Guerra (Marinha) equivale a Coronel (Exército/Aeronáutica).", gabarito: "certo", explicacao: "Correto. É oficial superior." },
  { modulo: "11", tipo: "certo_errado", enunciado: "Capitão-de-Fragata equivale a Major.", gabarito: "errado", explicacao: "Errado. Capitão-de-Fragata equivale a TENENTE-CORONEL. O equivalente a Major é o Capitão-de-Corveta." },
  { modulo: "11", tipo: "certo_errado", enunciado: "Capitão-de-Corveta equivale a Major (Exército/Aeronáutica).", gabarito: "certo", explicacao: "Correto. É o último posto de oficial superior." },
  { modulo: "11", tipo: "certo_errado", enunciado: "O oficial intermediário na Marinha é o Capitão-Tenente, equivalente ao Capitão do Exército/Aeronáutica.", gabarito: "certo", explicacao: "Correto. É o oficial intermediário." },
  { modulo: "11", tipo: "certo_errado", enunciado: "São oficiais superiores: Coronel, Tenente-Coronel e Major.", gabarito: "certo", explicacao: "Correto (Ex/Aer). Na Marinha: Capitão-de-Mar-e-Guerra, Capitão-de-Fragata e Capitão-de-Corveta." },
  { modulo: "11", tipo: "certo_errado", enunciado: "São oficiais subalternos o Primeiro-Tenente e o Segundo-Tenente.", gabarito: "certo", explicacao: "Correto, em todas as Forças." },
  { modulo: "11", tipo: "certo_errado", enunciado: "O Capitão é classificado como oficial superior.", gabarito: "errado", explicacao: "Errado. O Capitão é oficial INTERMEDIÁRIO; superiores são Coronel, Ten-Cel e Major." },
  { modulo: "11", tipo: "certo_errado", enunciado: "Na Marinha, o equivalente ao Aspirante (Ex/Aer) é o Guarda-Marinha.", gabarito: "certo", explicacao: "Correto. Guarda-Marinha e Aspirante são praças especiais/oficiais em formação." },
  { modulo: "11", tipo: "certo_errado", enunciado: "General de Brigada é um oficial-general de 3 estrelas.", gabarito: "errado", explicacao: "Errado. General de Brigada tem 2 estrelas (1º posto de oficial-general); General de Divisão tem 3 estrelas." },
  { modulo: "11", tipo: "certo_errado", enunciado: "Tenente-Brigadeiro é o posto da Aeronáutica equivalente a General de Exército.", gabarito: "certo", explicacao: "Correto. Oficial-general de 4 estrelas." },
  { modulo: "11", tipo: "certo_errado", enunciado: "Todo militar deve saber identificar as insígnias dos postos e graduações das Forças Armadas.", gabarito: "certo", explicacao: "Correto. É dever previsto no regulamento (art. final do cap. de continência)." },

  { modulo: "11", tipo: "multipla", fonte: "1ª AE IG/2025 (adaptada)", enunciado: "Assinale a correspondência CORRETA (Marinha — Exército — Aeronáutica):", alternativas: A(
    "Almirante-de-Esquadra — General de Exército — Tenente-Brigadeiro",
    "Vice-Almirante — General de Brigada — Brigadeiro",
    "Contra-Almirante — General de Divisão — Major-Brigadeiro",
    "Capitão-de-Corveta — Coronel — Coronel",
    "Capitão-de-Fragata — Major — Major"),
    gabarito: "A", explicacao: "Almirante-de-Esquadra = General de Exército = Tenente-Brigadeiro." },
  { modulo: "11", tipo: "multipla", enunciado: "O oficial intermediário, na Marinha, equivalente ao Capitão (Ex/Aer), é o:", alternativas: A("Capitão-Tenente", "Capitão-de-Corveta", "Capitão-de-Fragata", "Primeiro-Tenente", "Guarda-Marinha"), gabarito: "A", explicacao: "Capitão-Tenente é o oficial intermediário da Marinha." },
  { modulo: "11", tipo: "multipla", enunciado: "São, respectivamente, os equivalentes na Marinha a Coronel, Tenente-Coronel e Major:", alternativas: A(
    "Capitão-de-Mar-e-Guerra, Capitão-de-Fragata e Capitão-de-Corveta",
    "Capitão-de-Fragata, Capitão-de-Corveta e Capitão-Tenente",
    "Almirante, Vice-Almirante e Contra-Almirante",
    "Capitão-de-Corveta, Capitão-Tenente e Primeiro-Tenente",
    "Capitão-de-Mar-e-Guerra, Capitão-de-Corveta e Capitão-Tenente"),
    gabarito: "A", explicacao: "Coronel = Cap-de-Mar-e-Guerra; Ten-Cel = Cap-de-Fragata; Major = Cap-de-Corveta." },
  { modulo: "11", tipo: "multipla", enunciado: "O primeiro posto de oficial-general (2 estrelas) corresponde, no Exército, a:", alternativas: A(
    "General de Brigada", "General de Divisão", "General de Exército", "Marechal", "Coronel"),
    gabarito: "A", explicacao: "General de Brigada (2 estrelas) = Contra-Almirante = Brigadeiro." },
  { modulo: "11", tipo: "multipla", enunciado: "Assinale a alternativa que apresenta apenas oficiais superiores (Exército):", alternativas: A(
    "Coronel, Tenente-Coronel e Major",
    "Coronel, Major e Capitão",
    "Tenente-Coronel, Capitão e 1º Tenente",
    "Major, Capitão e 2º Tenente",
    "General de Brigada, Coronel e Major"),
    gabarito: "A", explicacao: "Oficiais superiores: Coronel, Tenente-Coronel e Major." },

  { modulo: "11", tipo: "dissertativa", enunciado: "Apresente a equivalência dos oficiais-generais entre Marinha, Exército e Aeronáutica.", modelo: { estrutura: "Tabela de equivalência (4 níveis de Of-Gen).", criterios: ["Almirante = Marechal = Marechal-do-Ar", "Almirante-de-Esquadra = General de Exército = Tenente-Brigadeiro", "Vice-Almirante = General de Divisão = Major-Brigadeiro", "Contra-Almirante = General de Brigada = Brigadeiro"], resposta: "A equivalência dos oficiais-generais é: Almirante = Marechal = Marechal-do-Ar (postos de tempo de guerra); Almirante-de-Esquadra = General de Exército = Tenente-Brigadeiro (4 estrelas); Vice-Almirante = General de Divisão = Major-Brigadeiro (3 estrelas); e Contra-Almirante = General de Brigada = Brigadeiro (2 estrelas, primeiro posto de oficial-general)." } },
  { modulo: "11", tipo: "dissertativa", enunciado: "Classifique os oficiais em superiores, intermediário e subalternos (Exército) e indique os equivalentes da Marinha para os superiores.", modelo: { estrutura: "Superiores (3) → intermediário → subalternos (2) → equivalentes Marinha.", criterios: ["Superiores: Coronel, Tenente-Coronel, Major", "Intermediário: Capitão", "Subalternos: 1º e 2º Tenente", "Equivalentes Marinha: Cap-de-Mar-e-Guerra, Cap-de-Fragata, Cap-de-Corveta"], resposta: "No Exército, os oficiais superiores são o Coronel, o Tenente-Coronel e o Major; o oficial intermediário é o Capitão; e os oficiais subalternos são o Primeiro-Tenente e o Segundo-Tenente. Na Marinha, os equivalentes aos oficiais superiores são, respectivamente, o Capitão-de-Mar-e-Guerra (Coronel), o Capitão-de-Fragata (Tenente-Coronel) e o Capitão-de-Corveta (Major); o oficial intermediário é o Capitão-Tenente." } },
]

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MAT } })
  if (!disc) throw new Error(`Disciplina ${MAT} não existe.`)

  // Remove questões IG obsoletas (de versões anteriores) que não fazem parte do novo conjunto
  const novosHashes = QS.map(q => createHash("sha1").update(`${MAT}|${q.modulo}|${q.enunciado}`).digest("hex"))
  const del = await prisma.questao.deleteMany({ where: { materia: MAT, hash: { notIn: novosHashes } } })
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
