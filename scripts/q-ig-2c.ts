// IG — provas antigas: 1ª AE (11/07/2025) e 2ª AE (25/08/2025), APMP.
// Enunciados reproduzidos da transcrição das provas físicas; gabaritos definidos pela
// apostila Instrução Geral CFO (as marcações manuscritas das fotos são respostas do aluno).
export type Alt = { id: string; texto: string }
export type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string; fonte?: string; contexto?: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string; fonte?: string; contexto?: string }
  | { modulo: string; tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string }; fonte?: string; contexto?: string }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const F1 = "1ª AE de IG — APMP, 11/07/2025"
const F2 = "2ª AE de Instrução Geral — APMP, 25/08/2025"

const CTX_Q1 = "Texto-base: 'À passagem de outra tropa, a tropa em forma e parada volta-se para ela e toma a posição de sentido'. Com base nessa norma de procedimento, analise a assertiva e assinale V (VERDADEIRO) ou F (FALSO)."
const CTX_Q3 = "Quanto às generalidades relativas aos sinais de respeito contemplados na Portaria GM-MD nº 1.143, de 3 de março de 2022, marque V (VERDADEIRO) ou F (FALSO)."
const CTX_Q8 = "Texto-base: 'Uma das formas de culto solene ao Pavilhão Nacional é a comemoração que ocorre todos os anos no dia 19 de novembro, visto que a data em questão é consagrada à Bandeira Nacional, onde entre outros atos destaca-se a incineração das Bandeiras Nacionais inservíveis.'"
const CTX_AE2_Q1 = "Quanto às generalidades relativas à solenidade de passagem de comando, marque V (verdadeiro) ou F (falso)."
const CTX_AE2_Q2 = "Considerando os 12 (doze) pontos que integram o roteiro básico de uma solenidade, previstos no SUNOR nº 20, de 26 de abril de 2022 (Manual Básico de Comunicação Social da PMPE), marque V (verdadeiro) ou F (falso)."

export const QS: Q[] = [
  // ════════════════════ AE1-2025 — 1ª AE de IG (11/07/2025) ════════════════════

  // ─── 1º QUESITO (Valor 1,0 — cada assertiva 0,20): continência da tropa a pé firme ───
  {
    modulo: "AE1-2025", tipo: "certo_errado", contexto: CTX_Q1, fonte: F1,
    enunciado: "Quando os Comandantes forem do mesmo posto ou graduação e se a tropa que passa não conduz Bandeira Nacional, apenas os Comandantes fazem a continência. (Valor: 0,20)",
    gabarito: "certo",
    explicacao: "Correto. É a redação literal da regra da continência da tropa a pé firme: comandantes de mesmo posto ou graduação e tropa que passa sem Bandeira Nacional, a continência fica restrita aos Comandantes.",
  },
  {
    modulo: "AE1-2025", tipo: "certo_errado", contexto: CTX_Q1, fonte: F1,
    enunciado: "No caso de tropa desarmada, ao comando de 'Apresentar Arma!' todos os seus integrantes fazem continência individual e a desfazem ao comando de 'Descansar Arma!'. (Valor: 0,20)",
    gabarito: "certo",
    explicacao: "Correto. A apostila reproduz literalmente a regra: em tropa desarmada, ao comando de 'Apresentar Arma!' todos os integrantes fazem continência individual, desfazendo-a ao comando de 'Descansar Arma!'.",
  },
  {
    modulo: "AE1-2025", tipo: "certo_errado", contexto: CTX_Q1, fonte: F1,
    enunciado: "Se o Comandante da tropa que passa for de posto superior ao do Comandante da tropa em forma e parada, a continência será prestada executando-se o comando de 'Sentido!', caso o oficial de posto superior seja um Capitão. (Valor: 0,20)",
    gabarito: "certo",
    explicacao: "Correto. Na continência a oficial subalterno e intermediário executa-se apenas 'Sentido!' — e o Capitão é oficial intermediário.",
  },
  {
    modulo: "AE1-2025", tipo: "certo_errado", contexto: CTX_Q1, fonte: F1,
    enunciado: "Se o Comandante da tropa que passa for de posto superior ao do Comandante da tropa em forma e parada, a continência será prestada executando-se o comando de 'ombro-arma!', caso o oficial de posto superior seja oficial-superior. (Valor: 0,20)",
    gabarito: "certo",
    explicacao: "Correto. Na continência a oficial-superior a tropa executa 'Sentido! Ombro Arma!' — o ombro-arma é justamente o movimento que distingue essa continência da prestada a subalternos e intermediários (só 'Sentido!').",
  },
  {
    modulo: "AE1-2025", tipo: "certo_errado", contexto: CTX_Q1, fonte: F1,
    enunciado: "Na continência a Oficiais-Generais ou ao Comandante Geral da PMPE, serão executados os seguintes comandos: 'Sentido! Ombro Arma! Apresentar Arma!', desfazendo-se o movimento ao comando de 'Descansar Arma!'. (Valor: 0,20)",
    gabarito: "certo",
    explicacao: "Correto. Aos símbolos, às autoridades dos incisos I a VIII do art. 16 e a Oficiais-Generais a tropa executa 'Sentido! Ombro Arma! Apresentar Arma! Olhar à Direita (Esquerda)!', desfazendo-se ao 'Descansar Arma!'; a PMPE defere ao seu Comandante Geral as honras de Oficial General.",
  },

  // ─── 2º QUESITO (Valor 1,0 — cada assertiva 0,20): honras de recepção e despedida ───
  {
    modulo: "AE1-2025", tipo: "certo_errado", fonte: F1,
    enunciado: "No que se refere a honras de recepção e despedida: as Honras de Recepção e Despedida são prestadas apenas quando a autoridade chega à Organização Militar. (Valor: 0,20)",
    gabarito: "errado",
    explicacao: "Errado. São as honras prestadas às autoridades definidas no art. 101 ao chegarem OU ao saírem da organização militar, e também por ocasião de visitas e inspeções — não apenas na chegada.",
  },
  {
    modulo: "AE1-2025", tipo: "certo_errado", fonte: F1,
    enunciado: "No que se refere a honras de recepção e despedida: a guarda do quartel formará em uma fileira, no interior do quartel, logo após o portão das armas (ou principal), com um efetivo igual ou maior que 5 (cinco) soldados, dando a direita para a direção de onde vem a autoridade. (Valor: 0,20)",
    gabarito: "errado",
    explicacao: "Errado no efetivo. Conforme o Vade-Mécum EB10-VM-12.003 (2ª ed., 2022), reproduzido na apostila, a guarda forma em uma fileira, no interior do quartel, logo após o portão de entrada, com efetivo igual ou maior que 6 (seis) soldados, dando a direita para a direção de onde vem a autoridade.",
  },
  {
    modulo: "AE1-2025", tipo: "certo_errado", fonte: F1,
    enunciado: "No que se refere a honras de recepção e despedida: visitas ou inspeções sem aviso prévio obrigam a imediata interrupção da rotina da OM. (Valor: 0,20)",
    gabarito: "errado",
    explicacao: "Errado. As visitas ou inspeções sem aviso prévio da autoridade NÃO implicam a alteração da rotina de trabalho da Organização Militar; o comandante apenas vai ao seu encontro, apresenta-se e a acompanha durante a permanência.",
  },
  {
    modulo: "AE1-2025", tipo: "certo_errado", fonte: F1,
    enunciado: "No que se refere a honras de recepção e despedida: o comandante, chefe ou diretor não precisa acompanhar a autoridade até a saída da OM. (Valor: 0,20)",
    gabarito: "errado",
    explicacao: "Errado. Terminada a visita, a autoridade é acompanhada até a saída pelo comandante, chefe ou diretor e pelos oficiais integrantes da equipe visitante (cap. 4.2 — Das honras de recepção e despedida).",
  },
  {
    modulo: "AE1-2025", tipo: "certo_errado", fonte: F1,
    enunciado: "No que se refere a honras de recepção e despedida: a Guarda de Honra pode ser determinada pelo próprio visitante, desde que seja sua primeira visita à OM subordinada. (Valor: 0,20)",
    gabarito: "errado",
    explicacao: "Errado. As honras de recepção e despedida são prestadas pela OM visitada às autoridades relacionadas no art. 101, ao chegarem ou saírem e por ocasião de visitas e inspeções; a apostila não admite que o próprio visitante determine a sua Guarda de Honra, nem condiciona as honras a ser a primeira visita.",
  },

  // ─── 3º QUESITO (Valor 1,0 — cada assertiva 0,20): sinais de respeito ───
  {
    modulo: "AE1-2025", tipo: "certo_errado", contexto: CTX_Q3, fonte: F1,
    enunciado: "Todo militar, em decorrência de sua condição, obrigações, deveres, direitos e prerrogativas estabelecidos em toda a legislação militar, deve tratar sempre: com respeito e camaradagem os seus superiores hierárquicos, como tributo à autoridade de que se encontram investidos por lei; com afeição e consideração os seus pares; e com bondade, dignidade e urbanidade os seus subordinados. (Valor: 0,20)",
    gabarito: "errado",
    explicacao: "Errado. O art. 3º inverteu os termos: o militar trata com respeito e CONSIDERAÇÃO os superiores hierárquicos, e com afeição e CAMARADAGEM os seus pares. Só a parte relativa aos subordinados (bondade, dignidade e urbanidade) está correta.",
  },
  {
    modulo: "AE1-2025", tipo: "certo_errado", contexto: CTX_Q3, fonte: F1,
    enunciado: "O militar manifesta respeito e apreço aos seus superiores, pares e subordinados pela continência, dirigindo-se a eles ou atendendo-os, de modo disciplinado, observando a precedência hierárquica e por outras demonstrações de deferência. (Valor: 0,20)",
    gabarito: "certo",
    explicacao: "Correto. O regulamento esmiúça que o tratamento se reveste na prática pela continência, no dirigir-se ou atender aos demais de modo disciplinado, observada a precedência hierárquica, e por outras demonstrações de deferência.",
  },
  {
    modulo: "AE1-2025", tipo: "certo_errado", contexto: CTX_Q3, fonte: F1,
    enunciado: "Não há obrigatoriedade nos sinais de respeito entre membros das Forças Armadas e das Forças Auxiliares. (Valor: 0,20)",
    gabarito: "errado",
    explicacao: "Errado. Pelo § 2º do art. 3º, as demonstrações de respeito, cordialidade e consideração devidas entre membros das Forças Armadas também o são aos integrantes das Polícias Militares, dos Corpos de Bombeiros Militares e aos militares de nações estrangeiras — há reciprocidade obrigatória.",
  },
  {
    modulo: "AE1-2025", tipo: "certo_errado", contexto: CTX_Q3, fonte: F1,
    enunciado: "Os sinais de respeito e apreço são obrigatórios em todas as situações. (Valor: 0,20)",
    gabarito: "certo",
    explicacao: "Correto. Conforme o § 3º do art. 4º, os sinais de respeito são obrigatórios em todas as situações; o que pode não ser obrigatório, a depender da situação, é o gesto da continência em si.",
  },
  {
    modulo: "AE1-2025", tipo: "certo_errado", contexto: CTX_Q3, fonte: F1,
    enunciado: "Quando dois militares se deslocam juntos, o de menor antiguidade fica à direita do superior. (Valor: 0,20)",
    gabarito: "errado",
    explicacao: "Errado. O art. 5º diz que, quando dois militares se deslocam juntos, o de menor antiguidade DÁ a direita ao superior (portanto fica à esquerda). É no grupo de três ou mais que o mais antigo fica no centro, distribuindo-se os demais alternadamente à direita e à esquerda.",
  },

  // ─── 4º QUESITO (Valor 0,5): Culto à Bandeira ───
  {
    modulo: "AE1-2025", tipo: "multipla", fonte: F1,
    contexto: "'No dia 19 de novembro, data consagrada à Bandeira Nacional, as Organizações Militares prestam o Culto à Bandeira, cujo cerimonial consta de:'",
    enunciado: "Considere o texto acima e marque a alternativa que corresponde à resposta CORRETA. (Valor: 0,5)",
    alternativas: A(
      "Hasteamento da Bandeira Nacional, em ato solene às oito horas, de acordo com o cerimonial do Ministério da Defesa ou com os cerimoniais específicos de cada Força Armada, conforme o caso.",
      "Canto do Hino à Bandeira e, se for o caso, incineração de Bandeiras.",
      "Para a solenidade, a Bandeira Nacional da Organização Militar, sem guarda de destaque, em frente ao mastro em que é realizada a solenidade.",
      "Hasteamento da Bandeira Nacional, em ato solene às dez horas, de acordo com o cerimonial do Ministério da Defesa ou com os cerimoniais específicos de cada Força Armada, conforme o caso.",
      "Desfile em continência à maior autoridade militar presente.",
    ),
    gabarito: "B",
    explicacao: "Correta a letra B. O cerimonial do Culto à Bandeira é: I - hasteamento da Bandeira Nacional, em ato solene, às DOZE horas; II - canto do Hino à Bandeira e, se for o caso, incineração de Bandeiras; III - desfile em continência à Bandeira Nacional. Logo, A e D erram o horário, C nega a Guarda de Honra (que se posiciona no centro do dispositivo e em frente ao mastro) e E troca o objeto do desfile. Obs.: na prova impressa a letra B dizia 'Hino Nacional' e a letra A trazia 'oito horas' — como a apostila fixa DOZE horas, nenhuma alternativa ficaria correta; por isso a letra B foi ajustada para a redação literal da apostila.",
  },

  // (5º e 6º quesitos: páginas não fotografadas — não reproduzidos)

  // ─── 7º QUESITO (Valor 0,5): bandeiras-insígnias ───
  {
    modulo: "AE1-2025", tipo: "multipla", fonte: F1,
    enunciado: "No que se refere ao hasteamento e arriamento de Bandeiras-insígnias, marque a alternativa que corresponde à resposta CORRETA. (Valor: 0,5)",
    alternativas: A(
      "Deve sempre ocorrer com cerimônia militar.",
      "É realizado por civil autorizado pelo comandante da OM.",
      "A bandeira-insígnia deve ser hasteada ao final da solenidade da Bandeira Nacional.",
      "É executado por militar designado, sem cerimônia militar.",
      "Nunca pode ser arriada durante o dia, apenas à noite.",
    ),
    gabarito: "D",
    explicacao: "Correta a letra D. A bandeira-insígnia ou distintivo indica a presença da autoridade: é hasteada quando ela entra na Organização Militar e arriada logo após a sua saída, por militar designado e sem cerimônia militar. C está errada porque o hasteamento não se vincula ao fim da solenidade da Bandeira Nacional — o que ocorre é que, por ocasião do hasteamento ou da arriação da Bandeira Nacional, a bandeira-insígnia é arriada e hasteada novamente após o término daquelas solenidades.",
  },

  // ─── 8º QUESITO (Valor 1,5): discursiva — incineração de Bandeiras ───
  {
    modulo: "AE1-2025", tipo: "dissertativa", fonte: F1, contexto: CTX_Q8,
    enunciado: "Próximo à data mencionada no texto acima, o Comandante de sua Unidade determina que seja realizada a incineração de algumas Bandeiras Nacionais inservíveis, que estavam depositadas no almoxarifado. Descreva a forma como o cerimonial deverá ser realizado. (Mínimo 05 e máximo 10 linhas) (Valor: 1,5)",
    modelo: {
      estrutura: "Enquadrar a data (19 de novembro, hasteamento em ato solene às doze horas) e descrever, na ordem, os quatro atos da incineração — pira junto ao mastro, leitura da Ordem do Dia, aceso do fogo por praça escolhida, canto do Hino à Bandeira — encerrando com a destinação das cinzas.",
      criterios: [
        "Situar a incineração no cerimonial do dia 19 de novembro, com hasteamento em ato solene às doze horas e desfile em continência à Bandeira Nacional.",
        "Mencionar a pira ou receptáculo de metal colocado nas proximidades do mastro onde se realiza o hasteamento, onde são depositadas as Bandeiras a serem incineradas.",
        "Citar a leitura, determinada pelo Comandante, da Ordem do Dia alusiva à data, ressaltando com fé e patriotismo a alta significação das festividades.",
        "Indicar que uma praça antecipadamente escolhida, em princípio a mais antiga e de ótimo comportamento, ateia fogo às Bandeiras previamente embebidas em álcool.",
        "Concluir com o canto do Hino à Bandeira, regido pelo mestre da Banda de Música, com a tropa em 'Sentido', e com as cinzas depositadas em caixa e enterradas em local apropriado no interior da OM ou lançadas ao mar.",
      ],
      resposta: "No dia 19 de novembro, data consagrada à Bandeira Nacional, a Organização Militar realiza o Culto à Bandeira, cujo cerimonial consta do hasteamento da Bandeira Nacional em ato solene às doze horas, do canto do Hino à Bandeira e, se for o caso, da incineração de Bandeiras, e do desfile em continência à Bandeira Nacional, com a tropa em forma composta por uma 'Guarda de Honra' a pé, sem Bandeira Nacional, no centro do dispositivo e em frente ao mastro, por dois grupamentos do restante da tropa disponível, a pé e sem armas, e pela Guarda da Organização Militar. A incineração é realizada assim: numa pira ou receptáculo de metal, colocado nas proximidades do mastro onde se realiza a cerimônia de hasteamento, são depositadas as Bandeiras a serem incineradas; o Comandante faz ler a Ordem do Dia alusiva à data, na qual é ressaltada, com fé e patriotismo, a alta significação das festividades a que se está procedendo; terminada a leitura, uma praça antecipadamente escolhida da Organização Militar, em princípio a mais antiga e de ótimo comportamento, ateia fogo às Bandeiras previamente embebidas em álcool; e, incineradas as Bandeiras, prossegue o cerimonial com o canto do Hino à Bandeira, regido pelo mestre da Banda de Música, com a tropa na posição de 'Sentido'. As cinzas são depositadas em caixa e enterradas em local apropriado, no interior da própria Organização Militar, ou lançadas ao mar.",
    },
  },

  // ════════════════════ AE2-2025 — 2ª AE de Instrução Geral (25/08/2025) ════════════════════

  // ─── 1º QUESITO (Valor 1,0 — cada assertiva 0,20): passagem de comando ───
  {
    modulo: "AE2-2025", tipo: "certo_errado", contexto: CTX_AE2_Q1, fonte: F2,
    enunciado: "Na solenidade executa-se a leitura do ato oficial de exoneração do antigo Comandante. (Valor: 0,20)",
    gabarito: "certo",
    explicacao: "Correto. O 6º evento da solenidade é a exoneração do Cmt sucedido, contendo a leitura do ato oficial, as palavras de despedida e a referência elogiosa.",
  },
  {
    modulo: "AE2-2025", tipo: "certo_errado", contexto: CTX_AE2_Q1, fonte: F2,
    enunciado: "Na solenidade de passagem de comando a revista da tropa é realizada no início da solenidade. (Valor: 0,20)",
    gabarito: "errado",
    explicacao: "Errado. A revista da tropa é o 10º evento, ocorrendo já depois da transmissão do cargo e das apresentações, e antecedendo o desfile da tropa em continência ao Cmt sucessor. No início ocorrem a chegada das autoridades, a continência e o toque à maior autoridade e a apresentação da tropa.",
  },
  {
    modulo: "AE2-2025", tipo: "certo_errado", contexto: CTX_AE2_Q1, fonte: F2,
    enunciado: "O canto do Hino de Pernambuco ou da Canção da PMPE faz parte da solenidade. (Valor: 0,20)",
    gabarito: "errado",
    explicacao: "Errado. O 5º evento da solenidade de passagem de comando é o canto do HINO NACIONAL ou da Canção da PMPE — não do Hino de Pernambuco.",
  },
  {
    modulo: "AE2-2025", tipo: "certo_errado", contexto: CTX_AE2_Q1, fonte: F2,
    enunciado: "O evento de transmissão de cargo será conduzido pela autoridade imediatamente superior na cadeia de comando. (Valor: 0,20)",
    gabarito: "certo",
    explicacao: "Correto. A apostila é literal: durante as solenidades de passagem de comando de OME, o evento de transmissão do cargo será conduzido pela autoridade imediatamente superior na cadeia de comando.",
  },
  {
    modulo: "AE2-2025", tipo: "certo_errado", contexto: CTX_AE2_Q1, fonte: F2,
    enunciado: "Não há desfile da tropa na solenidade de transmissão de cargo. (Valor: 0,20)",
    gabarito: "errado",
    explicacao: "Errado. O 11º evento é justamente o desfile da tropa em continência ao Cmt sucessor.",
  },

  // ─── 2º QUESITO (Valor 1,0 — cada assertiva 0,20): roteiro básico da solenidade ───
  {
    modulo: "AE2-2025", tipo: "certo_errado", contexto: CTX_AE2_Q2, fonte: F2,
    enunciado: "A entrega de condecorações, homenagens e apresentações culturais não podem ser inseridas em uma solenidade militar. (Valor: 0,20)",
    gabarito: "errado",
    explicacao: "Errado. O ponto VII do roteiro básico é exatamente 'homenagens, apresentações culturais, condecorações, descerramento de placas', admitindo-se até a interrupção da mesa de honra para que as autoridades assistam às apresentações, sendo ela posteriormente refeita.",
  },
  {
    modulo: "AE2-2025", tipo: "certo_errado", contexto: CTX_AE2_Q2, fonte: F2,
    enunciado: "Chegada da Autoridade é um dos pontos de uma solenidade. (Valor: 0,20)",
    gabarito: "certo",
    explicacao: "Correto. A 'Chegada da Autoridade' é o ponto I do roteiro básico da solenidade, do mesmo modo que a saída da autoridade com honras militares regulamentares é o ponto XI.",
  },
  {
    modulo: "AE2-2025", tipo: "certo_errado", contexto: CTX_AE2_Q2, fonte: F2,
    enunciado: "Não há necessidade de solicitar autorização para encerramento da solenidade. (Valor: 0,20)",
    gabarito: "errado",
    explicacao: "Errado. O ponto X do roteiro é a 'autorização para encerrar a solenidade', e o ponto III (Formalidades Militares) determina que a maior autoridade militar da ativa que presidir a solenidade deve pedir permissão para iniciá-la e encerrá-la à autoridade de maior precedência.",
  },
  {
    modulo: "AE2-2025", tipo: "certo_errado", contexto: CTX_AE2_Q2, fonte: F2,
    enunciado: "Honras Militares: serão prestadas as Honras Militares à maior autoridade civil ou maior autoridade militar presente. (Valor: 0,20)",
    gabarito: "certo",
    explicacao: "Correto. É a redação do ponto II do roteiro básico. Registre-se que ter maior precedência não significa, por si, ter direito às honras militares, e que cabe à maior autoridade militar da ativa presidir a solenidade e receber a apresentação da tropa.",
  },
  {
    modulo: "AE2-2025", tipo: "certo_errado", contexto: CTX_AE2_Q2, fonte: F2,
    enunciado: "Em uma solenidade militar não se pode aplaudir após a execução do Hino Nacional em hipótese alguma. (Valor: 0,20)",
    gabarito: "errado",
    explicacao: "Errado. O roteiro básico da solenidade não traz qualquer vedação absoluta desse tipo; a única exigência quanto ao Hino, no ponto V, é que sua execução só tenha início depois que todas as autoridades da mesa de honra tiverem ocupado seus lugares.",
  },

  // ─── 3º QUESITO (Valor 1,0 — cada assertiva 0,20): atribuições do EM/U ───
  {
    modulo: "AE2-2025", tipo: "certo_errado", fonte: F2,
    enunciado: "É atribuição do P1 organizar e manter em dia uma relação nominal dos oficiais da unidade, com as respectivas residências e telefones, destinando uma via ao SCmt U. (Valor: 0,20)",
    gabarito: "certo",
    explicacao: "Correto. Consta expressamente entre as atribuições do P1 (inciso X do capítulo 'Das atribuições do P1').",
  },
  {
    modulo: "AE2-2025", tipo: "certo_errado", fonte: F2,
    enunciado: "O P3 é o chefe da 3ª seção do EM/U, responsável pelas atividades relativas às operações e estatística. (Valor: 0,20)",
    gabarito: "certo",
    explicacao: "Correto. É a definição literal do P3, a quem compete, entre outros encargos, organizar as cerimônias militares em coordenação com os demais oficiais do EM/U.",
  },
  {
    modulo: "AE2-2025", tipo: "certo_errado", fonte: F2,
    enunciado: "Em Companhias Independentes, a função de P1 pode ser exercida cumulativamente pelo SCmt U, caso não exista cargo específico. (Valor: 0,20)",
    gabarito: "certo",
    explicacao: "Correto. Conforme o art. 29 transcrito na apostila, nas Companhias Independentes, quando não houver cargo específico, a função de P1 poderá ser exercida cumulativamente pelo SCmt U.",
  },
  {
    modulo: "AE2-2025", tipo: "certo_errado", fonte: F2,
    enunciado: "O P4 é o chefe da 4ª seção do EM/U, podendo também acumular os encargos de Fisc Adm; como auxiliar imediato do Cmt U na administração da unidade, é o principal responsável pela perfeita observância de todas as disposições regulamentares relativas à administração. (Valor: 0,20)",
    gabarito: "certo",
    explicacao: "Correto. É a definição literal do P4 na apostila, que ainda registra que o P4 não participa dos serviços estranhos à sua função quando acumular os encargos de Fisc Adm.",
  },
  {
    modulo: "AE2-2025", tipo: "certo_errado", fonte: F2,
    enunciado: "O P3 é o responsável pelos encargos relativos à coordenação e ao controle das atividades relacionadas com pessoal, BI, justiça e disciplina. (Valor: 0,20)",
    gabarito: "errado",
    explicacao: "Errado. Esses encargos são do P1, chefe da 1ª seção do EM/U (pessoal, BI, justiça e disciplina, protocolo e arquivo da correspondência interna e pagamento do pessoal). O P3 responde por operações e estatística.",
  },

  // ─── 4º QUESITO (Valor 0,5): Boletim Interno ───
  {
    modulo: "AE2-2025", tipo: "multipla", fonte: F2,
    enunciado: "Analise as proposições abaixo, sobre o Boletim Interno, e marque a alternativa CORRETA. (Valor: 0,5)",
    alternativas: A(
      "O Boletim Interno possui apenas três partes.",
      "O Boletim Interno é dividido em quatro partes: Serviços Diários, Instrução, Assuntos Gerais e Administrativos, e Justiça e Disciplina.",
      "O Boletim Interno é dividido em cinco partes, incluindo 'Eventos e Cerimonial'.",
      "O Boletim Interno é composto apenas da parte de Justiça e Disciplina.",
      "É na parte destinada aos Assuntos Gerais e Administrativos que serão publicados os Elogios e Recompensas aos militares da OME.",
    ),
    gabarito: "B",
    explicacao: "Correta a letra B. O BI é o documento em que o Cmt U publica todas as suas ordens, as das autoridades superiores e os fatos de conhecimento de toda a unidade, e é dividido em quatro partes: 1ª Serviços Diários; 2ª Instrução; 3ª Assuntos Gerais e Administrativos; 4ª Justiça e Disciplina. A alternativa E erra porque elogios e recompensas são matéria da 4ª parte (Justiça e Disciplina).",
  },

  // ─── 5º QUESITO (Valor 0,5): Adjunto ao Oficial de Dia ───
  {
    modulo: "AE2-2025", tipo: "multipla", fonte: F2,
    enunciado: "Assinale a alternativa INCORRETA no que se refere à competência do Adjunto ao Oficial de Dia (Graduado de Operações). (Valor: 0,5)",
    alternativas: A(
      "Apresentar-se ao Of Dia após receber o serviço, executar e fazer executar todas as suas determinações.",
      "Transmitir as ordens que dele receber e inteirá-lo da execução.",
      "Participar ao Of Dia todas as ocorrências que verificar e as providências que a respeito tenha tomado.",
      "Responder pelo Of Dia em seus impedimentos eventuais.",
      "Quando o Adj responder eventualmente pelo Of Dia, não será necessário participar-lhe as ocorrências havidas durante o seu impedimento, desde que já as tenha comunicado à autoridade superior.",
    ),
    gabarito: "E",
    explicacao: "A alternativa E é a INCORRETA. A apostila determina o oposto: quando o Adj responder eventualmente pelo Of Dia, participar-lhe-á as ocorrências havidas durante o seu impedimento, MESMO QUE já as tenha comunicado à autoridade superior ou haja providenciado a respeito. As demais são atribuições literais do Sgt Adj (incisos I, II, V e XIV).",
  },

  // ─── 6º QUESITO (Valor 0,5): Guarda do quartel ───
  {
    modulo: "AE2-2025", tipo: "multipla", fonte: F2,
    enunciado: "Assinale a alternativa INCORRETA no que se refere a características e atribuições da Guarda do quartel. (Valor: 0,5)",
    alternativas: A(
      "À guarda compete manter a segurança do quartel.",
      "Não permitir a entrada de bebidas alcoólicas, inflamáveis, explosivos e outros artigos proibidos pelo Cmt U, exceto os que constituírem suprimento para a unidade.",
      "Dar conhecimento imediato ao Of Dia sobre a entrada de oficial estranho à unidade no recinto do quartel.",
      "Impedir a entrada de civis estranhos ao serviço da unidade sem prévio conhecimento e autorização do Of Dia.",
      "A guarda do quartel jamais será comandada por oficial, sendo, portanto, comandada por um 2º ou 3º Sgt e constituída dos cabos e soldados necessários ao serviço de sentinelas.",
    ),
    gabarito: "E",
    explicacao: "A alternativa E é a INCORRETA por causa do 'jamais'. A guarda do quartel é NORMALMENTE comandada por um 2º ou 3º Sgt, mas EXCEPCIONALMENTE será comandada por oficial — caso em que é acrescida de um corneteiro ou clarim e o sargento passa às funções de auxiliar do Cmt Gd. As demais reproduzem as finalidades da guarda (incisos I, V, X e XII).",
  },

  // ─── 7º QUESITO (Valor 0,5): atribuições do Comandante de OME — quesito reformulado ───
  {
    modulo: "AE2-2025", tipo: "multipla", fonte: F2,
    enunciado: "Quanto às atribuições do Comandante de OME, marque a alternativa que corresponde à resposta INCORRETA. (Valor: 0,5)",
    alternativas: A(
      "Conceder dispensa do serviço aos militares, nas condições estabelecidas na legislação vigente.",
      "Conceder férias aos seus subordinados, de acordo com as normas estabelecidas em Regulamento.",
      "Prestar honras fúnebres aos seus subordinados, quando a elas fizerem jus, obedecendo às prescrições regulamentares.",
      "Anular em BI, quando houver razões para isto, qualquer ato seu ou de seus subordinados, dentro do prazo de cento e oitenta dias.",
      "Autorizar, por ato próprio, a viagem de militar da unidade ao exterior, dispensada qualquer manifestação da autoridade superior.",
    ),
    gabarito: "E",
    explicacao: "A alternativa E é a INCORRETA: autorizar viagem de militar ao exterior por ato próprio não figura entre as atribuições e deveres do Cmt U no capítulo 'Das atribuições do Comandante de OME'; o que lhe compete é corresponder-se diretamente com autoridades civis ou militares apenas quando o assunto não exigir a intervenção da autoridade superior. As demais são atribuições expressas (incisos XV, XVIII, XIII e LIX).",
  },

  // ─── 8º QUESITO (Valor 2,0): discursiva — honras fúnebres ───
  {
    modulo: "AE2-2025", tipo: "dissertativa", fonte: F2,
    enunciado: "Descreva, de forma detalhada, o procedimento das HONRAS FÚNEBRES, abordando obrigatoriamente a GUARDA FÚNEBRE: conceito, dispositivo, composição conforme o posto ou graduação do falecido e execução das descargas de fuzil. (Em até 25 linhas) (Valor: 2,0)",
    modelo: {
      estrutura: "Conceituar honras fúnebres e seus três tipos; definir a Guarda Fúnebre e seu dispositivo; apresentar o quadro de composição por posto/graduação; descrever o comando 'EM FUNERAL! PREPARAR!' e a sequência das três descargas; encerrar com a Bandeira Nacional sobre o ataúde, a dobradura entregue à família e o toque de silêncio.",
      criterios: [
        "Definir honras fúnebres como homenagens póstumas prestadas diretamente pela tropa aos despojos mortais de alta autoridade ou de militar da ativa, conforme a posição hierárquica ocupada, e citar os três tipos: Guarda Fúnebre, Escolta Fúnebre e Salvas Fúnebres.",
        "Descrever o dispositivo da Guarda Fúnebre: tropa armada postada no trajeto do cortejo, de preferência na vizinhança da casa mortuária ou da necrópole, com a direita voltada para o lado de onde virá o cortejo, em local adequado à formatura e às salvas e que não interrompa o trânsito.",
        "Apresentar a composição por posto/graduação (Of Gen ou Cmt Geral, 1 batalhão; Of Superior, 2 companhias; Of Intermediário, 1 companhia; Of Subalterno, 1 pelotão; Aspirantes e Alunos de Academia, 2 grupos de combate/18 homens; Subtenentes e Sargentos, 1 grupo de combate/9 homens; Cabos e Soldados, 1 esquadra/4 homens) e a formação em uma fileira (grupo de combate ou esquadra) ou em três fileiras nas demais.",
        "Descrever o comando de 'EM FUNERAL! PREPARAR!' a cerca de 20 passos, a parada do cortejo para receber as homenagens e a sequência das três descargas: 'PREPARAR!' (em dois tempos), 'CARREGAR!', 'APONTAR!', 'FOGO!', repetida três vezes, seguida de 'DESCANSAR, ARMA!', 'OMBRO-ARMA' e 'APRESENTAR-ARMA', permanecendo o restante da tropa em 'Ombro-Arma'.",
        "Mencionar que o ataúde, depois de fechado e até o início da inumação, é coberto com a Bandeira Nacional; que antes do sepultamento a Bandeira é dobrada, mediante ordem, e entregue à família do falecido; e que ao descer o corpo à sepultura é executado o toque de silêncio por corneteiro ou clarim.",
      ],
      resposta: "Conforme o Vade-Mécum de Cerimonial Militar do Exército — Honras Fúnebres (EB10-VM-12.009, 2ª ed., 2016), honras fúnebres são as homenagens póstumas prestadas diretamente pela tropa aos despojos mortais de alta autoridade ou de militar da ativa, de acordo com a posição hierárquica que ocupava, e consistem basicamente em três tipos: Guarda Fúnebre, Escolta Fúnebre e Salvas Fúnebres. A Guarda Fúnebre é a tropa armada especialmente postada para render honras aos despojos mortais de militares da ativa e de altas autoridades; para tomar seu dispositivo, posta-se no trajeto a ser percorrido pelo cortejo, de preferência na vizinhança da casa mortuária ou da necrópole, com a sua direita voltada para o lado de onde virá o cortejo e em local que, adequado à formatura e à execução das salvas, não interrompa o trânsito do público. A composição varia conforme o posto ou graduação do falecido: Oficial-General ou Comandante Geral, um batalhão; Oficial Superior, duas companhias; Oficial Intermediário, uma companhia; Oficial Subalterno, um pelotão; Aspirantes e Alunos de Academia de Formação de Oficiais, dois grupos de combate (dezoito homens); Subtenentes e Sargentos, um grupo de combate (nove homens); Cabos e Soldados, uma esquadra de grupo de combate (quatro homens). A tropa é colocada em linha em uma fileira quando o efetivo corresponder a um grupo de combate ou a uma esquadra, e em linha de três fileiras nas demais composições. Quando o cortejo estiver a cerca de vinte passos, comanda-se 'EM FUNERAL! PREPARAR!': ao 'EM FUNERAL', os homens da 2ª fileira fazem 'Arma Suspensa', dão um passo oblíquo à frente e à direita, ficando nos intervalos dos homens da primeira fileira, e em seguida fazem 'DESCANSAR-ARMA'. O cortejo para ao alcançar a Guarda Fúnebre, para receber as homenagens, e o comandante do grupamento executa as três descargas de fuzil: ao 'PREPARAR' o movimento é feito em dois tempos (1º tempo do 'APRESENTAR-ARMA' e giro de quarenta e cinco graus à direita, com a arma girada sobre a mão esquerda e o cano inclinado para o solo); seguem-se 'CARREGAR!', 'APONTAR!' e 'FOGO!', repetidos até completar as três descargas regulamentares. Terminadas as descargas, comanda-se 'DESCANSAR, ARMA!', em dois tempos, e em seguida 'OMBRO-ARMA', comandando o Cmt do Destacamento da Guarda Fúnebre 'APRESENTAR-ARMA'; durante as descargas, o restante da tropa permanece em 'Ombro-Arma'. Como minúcias essenciais, o ataúde, depois de fechado e até o início da inumação, é coberto com a Bandeira Nacional; antes do sepultamento a Bandeira é dobrada, mediante ordem e conforme a dobradura regulamentar, e entregue à família do falecido; e, por ocasião do sepultamento, executa-se o toque de silêncio, por corneteiro ou clarim, ao descer o corpo à sepultura.",
    },
  },

  // ─── 9º QUESITO (Valor 1,5): discursiva — atribuições do P1 ───
  {
    modulo: "AE2-2025", tipo: "dissertativa", fonte: F2,
    enunciado: "Descreva as principais atribuições do P1 da Unidade, mencionando, obrigatoriamente, pelo menos três atribuições previstas em sua competência. (Mínimo 03 e máximo 08 linhas) (Valor: 1,5)",
    modelo: {
      estrutura: "Definir o P1 como chefe da 1ª seção do EM/U e seus encargos gerais, e em seguida enumerar, no mínimo, três atribuições expressas do capítulo 'Das atribuições do P1'.",
      criterios: [
        "Identificar o P1 como chefe da 1ª seção do EM/U, responsável pelos encargos relativos à coordenação e ao controle das atividades de pessoal, BI, justiça e disciplina, protocolo e arquivo da correspondência interna e pagamento do pessoal da unidade.",
        "Enumerar no mínimo três atribuições expressas, tais como organizar e manter em dia as relações de oficiais e praças para efeito das escalas de serviço; escalar as praças para os serviços normais e extraordinários; organizar os boletins ostensivos da unidade conforme determinação do Cmt U.",
        "Citar ao menos uma atribuição de controle documental: organizar os fichários, mapas e relações referentes ao efetivo; manter a relação nominal dos oficiais com residências e telefones, com via ao SCmt U; manter o livro de ordens do serviço sob orientação do SCmt U.",
        "Mencionar ao menos um encargo ligado ao pessoal em sentido material: preparar a documentação dos processos de promoção, transferência para a reserva, reforma e concessão de medalhas, ou zelar pelo moral da tropa e estar em condições de informar ao Cmt U sobre o estado moral e disciplinar.",
        "Registrar que, nas Companhias Independentes, não havendo cargo específico, a função de P1 poderá ser exercida cumulativamente pelo SCmt U (art. 29).",
      ],
      resposta: "O P1 é o chefe da 1ª seção do EM/U, responsável pelos encargos relativos à coordenação e ao controle das atividades relacionadas com pessoal, BI, justiça e disciplina, protocolo e arquivo da correspondência interna e pagamento do pessoal da unidade. Entre suas atribuições, competem-lhe organizar e manter em dia as relações de oficiais e praças para efeito das escalas de serviço e escalar as praças para os serviços normais e extraordinários da unidade; receber a documentação diária interna, mandar protocolá-la e levá-la ao SCmt U; organizar os fichários, os mapas, as relações e outros documentos referentes ao efetivo; organizar e manter em dia uma relação nominal dos oficiais da unidade, com as respectivas residências e telefones, destinando uma via ao SCmt U; manter, sob a orientação do SCmt U, o livro de ordens do serviço; organizar os boletins ostensivos da unidade conforme as determinações do Cmt U; preparar a documentação necessária para instruir os processos de promoção, transferência para a reserva, reforma e concessão de medalhas; controlar a escrituração referente à correspondência, ao arquivo e ao registro das alterações dos subtenentes e sargentos; e zelar diligentemente pelo moral da tropa, estando em condições de informar ao Cmt U sobre o estado moral e o disciplinar. Nas Companhias Independentes, quando não houver cargo específico, a função de P1 poderá ser exercida cumulativamente pelo SCmt U (art. 29).",
    },
  },

  // ─── 10º QUESITO (Valor 1,5): discursiva — atribuições do Oficial de Dia ───
  {
    modulo: "AE2-2025", tipo: "dissertativa", fonte: F2,
    enunciado: "Descreva de forma objetiva CINCO atribuições do Oficial de Dia (de Operações). (Mínimo 04 e máximo 08 linhas) (Valor: 1,5)",
    modelo: {
      estrutura: "Situar o Of Dia como representante do Cmt U fora do expediente e listar, de forma objetiva, cinco atribuições previstas no capítulo 'Do Oficial de Dia (de Operações)'.",
      criterios: [
        "Registrar que o Of Dia é, fora do expediente, o representante do Cmt U.",
        "Apresentar cinco atribuições distintas, sem repetição de conteúdo.",
        "Incluir ao menos uma atribuição de fiscalização/verificação: assegurar o exato cumprimento das ordens da unidade e das disposições regulamentares do serviço diário, ou verificar, ao assumir o serviço e em companhia do antecessor, se todas as dependências do quartel estão em ordem.",
        "Incluir ao menos uma atribuição de comunicação: participar ao SCmt U todas as ocorrências extraordinárias havidas depois do último encontro, mencionando-as no relatório diário, e prestar as mesmas informações ao Cmt U se o encontrar antes.",
        "Incluir ao menos uma atribuição de controle de acesso ou de permanência: receber autoridade civil ou militar de categoria igual ou superior à do Cmt U e acompanhá-la à presença deste; estar ciente da entrada, permanência e saída de pessoas estranhas à unidade; impedir a abertura de dependências fora do expediente sem ordem escrita do respectivo chefe; ou permanecer no quartel durante as horas determinadas, pronto e uniformizado.",
      ],
      resposta: "O Of Dia é, fora do expediente, o representante do Cmt U, competindo-lhe, entre outras atribuições: 1) assegurar, durante o seu serviço, o exato cumprimento das ordens da unidade e das disposições regulamentares relativas ao serviço diário; 2) estar inteiramente familiarizado com os planos de segurança do aquartelamento, de combate a incêndio e de chamada e com os respectivos sinais de alarme, bem como com as Ordens de Serviço em vigência; 3) verificar, ao assumir o serviço e em companhia de seu antecessor, se todas as dependências do quartel estão em ordem; 4) participar ao SCmt U todas as ocorrências extraordinárias havidas depois do seu último encontro com essa autoridade, mencionando-as ainda no relatório diário e, se antes disso encontrar o Cmt U, prestar-lhe as mesmas informações, sem que isso o dispense de fazê-lo ao SCmt U; e 5) receber qualquer autoridade civil ou militar de categoria igual ou superior à do Cmt U e acompanhá-la à presença deste ou do oficial de maior posto que se achar no quartel. Compete-lhe também estar ciente da entrada, permanência e saída de pessoas estranhas à unidade, impedir a abertura de qualquer dependência fora das horas de expediente sem ser pelo respectivo chefe ou mediante ordem escrita deste, e permanecer no quartel durante as horas determinadas no Regulamento, sempre pronto e uniformizado para atender a qualquer eventualidade.",
    },
  },
]
