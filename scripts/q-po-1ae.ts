import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient, Prisma } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "PO"
const FONTE = "1ª AE — PO — CFO 2025"

type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; contexto?: string; enunciado: string; gabarito: "certo" | "errado"; explicacao: string }
  | { modulo: string; tipo: "multipla"; contexto?: string; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string }
  | { modulo: string; tipo: "dissertativa"; contexto?: string; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string } }

const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))
const CTX1 = "1º Quesito (1ª AE — PO — CFO 2025) — Dentro do conteúdo ministrado sobre as funcionalidades do Boletim de Ocorrência eletrônico Policial Militar - Geração 2, marque verdadeiro (V) ou falso (F) para as assertivas."
const CTX2 = "2º Quesito (1ª AE — PO — CFO 2025) — No que diz respeito às imunidades, assinale com (V) as sentenças verdadeiras e com (F) as sentenças falsas."
const CTX3 = "3º Quesito (1ª AE — PO — CFO 2025) — Considerando as instruções ministradas sobre GRUPOS VULNERÁVEIS, marque (V) verdadeiro ou (F) falso."

const QS: Q[] = [
  // ════════ 1º QUESITO — BOEPM Geração 2 (V/F) ════════
  {
    modulo: "1AE", tipo: "certo_errado", contexto: CTX1,
    enunciado: "O aplicativo BOEPM Geração 2 foi desenvolvido exclusivamente por empresas privadas, sem a participação de policiais da ativa.",
    gabarito: "errado",
    explicacao: "Errado. O aplicativo foi desenvolvido pela área de tecnologia da SDS (GTI/SDS), com o processo conduzido por policiais da ativa e a execução técnica realizada por empresa privada de software.",
  },
  {
    modulo: "1AE", tipo: "certo_errado", contexto: CTX1,
    enunciado: "O aplicativo BOEPM Geração 2, em relação ao boletim de papel, tem a vantagem da velocidade e da integração ao sistema.",
    gabarito: "certo",
    explicacao: "Correto. A geração eletrônica do BO proporciona velocidade de preenchimento, integração direta ao sistema e padronização das informações.",
  },
  {
    modulo: "1AE", tipo: "certo_errado", contexto: CTX1,
    enunciado: "O aplicativo BOEPM Geração 2 requer smartphones de alta tecnologia para funcionar.",
    gabarito: "errado",
    explicacao: "Errado. O aplicativo foi concebido para funcionar em smartphones comuns, sem dependência de equipamentos especiais ou de alta tecnologia.",
  },
  {
    modulo: "1AE", tipo: "certo_errado", contexto: CTX1,
    enunciado: "O login no BOEPM Geração 2 não é feito com usuário e senha do Expresso/SEI, sendo necessário um cadastramento específico realizado pela empresa privada desenvolvedora do aplicativo.",
    gabarito: "errado",
    explicacao: "Errado. O acesso ao sistema é feito com o usuário e senha do Expresso/SEI, aproveitando as credenciais já conhecidas pelos policiais.",
  },
  {
    modulo: "1AE", tipo: "certo_errado", contexto: CTX1,
    enunciado: "O BOEPM Geração 2 simplifica o acesso utilizando informações de fácil memorização.",
    gabarito: "certo",
    explicacao: "Correto. O login com credenciais do Expresso/SEI (já conhecidas) simplifica o acesso e elimina a necessidade de novo cadastro.",
  },

  // ════════ 2º QUESITO — Imunidades / Autoridades (V/F) ════════
  {
    modulo: "1AE", tipo: "certo_errado", contexto: CTX2,
    enunciado: "Nas ocorrências com autoridades diplomáticas na condição de acusados, a Polícia Militar não poderá prendê-los, ainda que em flagrante delito, exceto nos crimes hediondos.",
    gabarito: "errado",
    explicacao: "Errado. Autoridades diplomáticas gozam de imunidade absoluta (Convenção de Viena); a PM não pode prendê-las nem mesmo em flagrante de crime hediondo. A exceção (crimes hediondos) não existe para diplomatas — a regra é a imunidade total.",
  },
  {
    modulo: "1AE", tipo: "certo_errado", contexto: CTX2,
    enunciado: "Deputados e Senadores gozam de imunidade absoluta decorrente do exercício do cargo eletivo, e a prisão só poderá ocorrer em flagrante de crime inafiançável, como racismo, tortura, tráfico de drogas, terrorismo e crimes hediondos.",
    gabarito: "errado",
    explicacao: "Errado. A imunidade parlamentar NÃO é absoluta; é formal (de prisão), e permite prisão apenas em flagrante de crime inafiançável. Contudo, o enunciado erra ao chamá-la de 'imunidade absoluta' e ao listar os crimes inafiançáveis de forma incompleta/imprecisa.",
  },
  {
    modulo: "1AE", tipo: "certo_errado", contexto: CTX2,
    enunciado: "Magistrados e membros do Ministério Público só poderão ser presos no caso de flagrantes de crime inafiançável, e devem ser conduzidos para Delegacias Especializadas, sendo vedada a apresentação em Delegacia Comum.",
    gabarito: "errado",
    explicacao: "Errado. Membros do MP presos em flagrante de crime inafiançável devem ser apresentados ao Procurador-Geral de Justiça; magistrados, ao Presidente do respectivo Tribunal. Não há vedação absoluta à delegacia comum — o POP 0020 orienta a comunicação ao órgão competente, não necessariamente a 'Delegacia Especializada'.",
  },
  {
    modulo: "1AE", tipo: "certo_errado", contexto: CTX2,
    enunciado: "Oficiais das Forças Armadas, Polícias e Bombeiros Militares, bem como Delegados de Polícia Federal e Civil gozam da Imunidade Relativa.",
    gabarito: "errado",
    explicacao: "Errado. Esses profissionais não gozam de 'imunidade relativa' enquanto categoria — possuem prerrogativas de foro e procedimentos específicos previstos em seus estatutos, mas não a imunidade (relativa ou absoluta) como instituto processual.",
  },
  {
    modulo: "1AE", tipo: "certo_errado", contexto: CTX2,
    enunciado: "O repasse de informações para a Imprensa, acerca de ocorrências que envolvam autoridades, deverá ser centralizado na Assessoria de Comunicação Social da Corporação.",
    gabarito: "certo",
    explicacao: "Correto. O POP nº 0020 da PMPE determina que as informações à imprensa em ocorrências com autoridades sejam centralizadas na Assessoria de Comunicação Social (5ª EMG), evitando declarações individuais e exposição indevida.",
  },

  // ════════ 3º QUESITO — Grupos Vulneráveis (V/F) ════════
  {
    modulo: "1AE", tipo: "certo_errado", contexto: CTX3,
    enunciado: "A conduta descrita como crime ou contravenção penal não é considerada ato infracional quando praticada por criança ou adolescente.",
    gabarito: "errado",
    explicacao: "Errado. O ECA (Lei nº 8.069/1990) estabelece que a conduta descrita como crime ou contravenção penal, quando praticada por criança ou adolescente, É considerada ato infracional (art. 103 do ECA).",
  },
  {
    modulo: "1AE", tipo: "certo_errado", contexto: CTX3,
    enunciado: "Pessoas com deficiência devem ser abordadas de forma rápida e direta, sem considerar suas limitações físicas e cognitivas.",
    gabarito: "errado",
    explicacao: "Errado. A abordagem a pessoas com deficiência exige sensibilidade e adaptação às suas limitações físicas e cognitivas. O policial deve comunicar-se de forma acessível, respeitar o tempo de resposta e buscar apoio especializado quando necessário.",
  },
  {
    modulo: "1AE", tipo: "certo_errado", contexto: CTX3,
    enunciado: "O atendimento de ocorrências com idosos deve ser prioritário, sendo que, em alguns casos, o mais importante é garantir a segurança do policiamento em detrimento das necessidades específicas dos idosos.",
    gabarito: "errado",
    explicacao: "Errado. O atendimento a idosos deve considerar suas necessidades específicas e limitações. A segurança do policiamento é importante, mas a abordagem deve ser adaptada às vulnerabilidades do idoso, não colocando-o em segundo plano.",
  },
  {
    modulo: "1AE", tipo: "certo_errado", contexto: CTX3,
    enunciado: "A escuta ativa e respeitosa é um dos pilares do atendimento a ocorrências envolvendo mulheres. Confirmada a situação de violência, o protocolo determina que a vítima e o agressor sejam conduzidos à Delegacia da Mulher, ou, na ausência desta, à delegacia comum mais próxima.",
    gabarito: "certo",
    explicacao: "Correto. A escuta ativa, empatia e compromisso com a verdade dos fatos são pilares do atendimento (POP 0016). A Lei Maria da Penha e o POP determinam o encaminhamento à Delegacia da Mulher, ou à delegacia mais próxima na sua ausência.",
  },
  {
    modulo: "1AE", tipo: "certo_errado", contexto: CTX3,
    enunciado: "Para os homens transexuais, a recomendação é para que a abordagem seja realizada por policiais femininas. Caso o homem transexual manifeste explicitamente sua identidade de gênero, solicitando ser abordado por policial masculino, essa preferência deve ser atendida em sua plenitude.",
    gabarito: "errado",
    explicacao: "Errado. O POP nº 0005 da PMPE orienta que a busca pessoal em homem transexual seja realizada por policial masculino (identidade de gênero masculina). Se o homem transexual solicitar policial masculino, a preferência deve ser respeitada, mas a premissa do enunciado (indicar policial feminino como padrão) é incorreta.",
  },

  // ════════ 4º QUESITO — BOEPM (múltipla, única VERDADEIRA) ════════
  {
    modulo: "1AE", tipo: "multipla",
    contexto: "4º Quesito (1ª AE — PO — CFO 2025) — No que concerne ao Preenchimento do BOEPM, assinale a única alternativa VERDADEIRA.",
    enunciado: "Assinale a única alternativa VERDADEIRA sobre o preenchimento do BOEPM.",
    alternativas: A(
      "O BOEPM é um documento importante para registrar apenas a ocorrência de crimes.",
      "Em face de sua fragilidade, e por conter apenas a versão do Policial Militar, o BOEPM não pode ser considerado como prova em processo judicial.",
      "Considerando que para cada natureza demanda o preenchimento de um BOEPM, a nova versão do aplicativo permite vincular vários BOEPM para uma mesma ocorrência.",
      "Não será possível a geração de um novo BOEPM no aplicativo caso haja BOEPM ainda com preenchimento em andamento.",
      "O BOEPM foi totalmente desenvolvido por Policiais Militares da Ativa, integrantes da Diretoria de Tecnologia e Inovação da Corporação.",
    ),
    gabarito: "D",
    explicacao: "D é a única verdadeira. O sistema impede a criação de novo BO enquanto houver um em andamento — o usuário deve concluir, continuar ou excluir o registro pendente. (A) Errado: registra qualquer ocorrência, não só crimes. (B) Errado: o BO pode ser prova judicial. (C) Errado: a nova versão permite vincular NATUREZAS, não múltiplos BOEPM, a uma mesma ocorrência. (E) Errado: foi desenvolvido pela GTI/SDS com empresa privada.",
  },

  // ════════ 5º QUESITO — Local de sinistro de trânsito (múltipla, única INCORRETA) ════════
  {
    modulo: "1AE", tipo: "multipla",
    contexto: "5º Quesito (1ª AE — PO — CFO 2025) — Dentro do conteúdo ministrado em relação à preservação de local de sinistro de trânsito com vítima ou sem vítima, foi verificado que é essencial a preservação da vida e da integridade física, bem como a fluidez viária. Face às providências a serem adotadas em local de acidente de trânsito, marque a alternativa INCORRETA.",
    enunciado: "Assinale a alternativa INCORRETA sobre as providências em local de acidente de trânsito.",
    alternativas: A(
      "A legislação autoriza a remoção de veículos do leito da via pública quando sua permanência comprometer o tráfego, independentemente de exame pericial já ter sido realizado.",
      "O uso de luvas e materiais descartáveis, por parte dos policiais responsáveis pelo atendimento da ocorrência, não é obrigatório.",
      "A identificação de produtos perigosos nos veículos envolvidos em acidentes de trânsito é feita por meio dos painéis de segurança e rótulos de risco.",
      "A confecção do Boletim de Ocorrência de Acidente de Trânsito (BOAT) é exclusiva dos agentes da autoridade de trânsito.",
      "Caso a viatura envolvida seja de patrimônio público ou locada, aplica-se a Portaria Normativa nº 018/2013 do Comando Geral da PMPE, que determina a abertura de processo sumário ou inquérito técnico, conforme o caso.",
    ),
    gabarito: "B",
    explicacao: "B é a incorreta. O uso de luvas e materiais descartáveis É obrigatório nos procedimentos de atendimento a locais de acidente de trânsito para proteger a integridade física dos policiais e preservar vestígios. (A) Correto: a Lei nº 5.970/1973 autoriza a remoção quando comprometer o tráfego. (C) Correto: painéis de segurança e rótulos de risco identificam produtos perigosos. (D) Correto: o BOAT é de competência da autoridade de trânsito. (E) Correto: a Portaria 018/2013 aplica-se a viaturas da corporação envolvidas.",
  },

  // ════════ 6º QUESITO — Morte de integrante (múltipla, única ERRADA) ════════
  {
    modulo: "1AE", tipo: "multipla",
    contexto: "6º Quesito (1ª AE — PO — CFO 2025) — Considere as afirmações abaixo, tendo em vista a morte de um integrante da Corporação numa ocorrência, e assinale a única alternativa ERRADA.",
    enunciado: "Assinale a única alternativa ERRADA sobre os procedimentos em ocorrência de morte de policial militar.",
    alternativas: A(
      "Sendo um Policial Militar de uma Unidade Especializada, o Diretor Integrado Especializado, via de regra, designará um Oficial da mesma Unidade da vítima para acompanhar as diligências na área do Batalhão onde se deram os fatos.",
      "Caso os fatos tenham ocorrido na Capital ou RMR, o Diretor de Planejamento Operacional determinará a instalação de um Gabinete de Controle de Crise (GCC/DPO).",
      "Caso o Oficial responsável pelas ações no terreno identifique, visualmente, a participação de Policiais Militares de folga nas diligências, deverá imediatamente identificá-los formalmente e relacionar seus dados, buscando manter o total controle do efetivo participante, conforme POP específico.",
      "A instalação do GCC será sempre de responsabilidade do Batalhão responsável pela área dos fatos.",
      "Cabe ao Despachante da área, onde se deram os fatos, permitir que apenas as viaturas e guarnições autorizadas pelo COPOM se desloquem ou permaneçam no local da ocorrência.",
    ),
    gabarito: "D",
    explicacao: "D é a errada. A instalação do GCC/DPO é determinada pelo Diretor de Planejamento Operacional (DPO) — não é de responsabilidade exclusiva do Batalhão da área. (A) Correto: o Diretor Integrado Especializado designa oficial da mesma unidade. (B) Correto: o DPO determina a instalação do GCC na Capital/RMR. (C) Correto: PM de folga identificado deve ser registrado e autorizado formalmente. (E) Correto: o despachante controla o acesso de viaturas no local conforme COPOM.",
  },

  // ════════ 7º QUESITO — Isolamento de Locais de Crime (múltipla, única VERDADEIRA) ════════
  {
    modulo: "1AE", tipo: "multipla",
    contexto: "7º Quesito (1ª AE — PO — CFO 2025) — Quanto ao Isolamento de Locais de Crime, marque a única afirmativa VERDADEIRA.",
    enunciado: "Assinale a única afirmativa VERDADEIRA sobre o isolamento de locais de crime.",
    alternativas: A(
      "Nada pode ser removido ou retirado do local de crime, exceto após o registro do Policial Militar encarregado do isolamento.",
      "Em um isolamento de local de crime, a equipe policial deve delimitar a área, controlar o acesso, estabelecer a vigilância e realizar o registro das ações.",
      "Em acidentes de trânsito com vítima, nada substitui o BOAT.",
      "Os materiais destinados ao isolamento de locais de crime são específicos, como cones, cavaletes e fitas, sendo descartada a utilização de outros meios de improviso.",
      "No caso de acidentes de trânsito, ainda que com vítimas, o acordo entre os condutores isenta o policiamento de efetuar o encaminhamento para a Delegacia.",
    ),
    gabarito: "B",
    explicacao: "B é a verdadeira. O isolamento correto exige delimitar a área, controlar o acesso, estabelecer vigilância e registrar as ações — procedimentos que preservam a integridade dos vestígios. (A) Errado: remoções podem ser necessárias para socorro — o que importa é registrar e justificar. (C) Errado: o BOAT não é obrigatório em todos os acidentes, podendo ser substituído pelo BOEPM convencional. (D) Errado: materiais de improviso são admitidos quando os específicos não estiverem disponíveis. (E) Errado: o acordo entre condutores não isenta o policiamento do dever de registrar e encaminhar.",
  },

  // ════════ 8º QUESITO — Dissertativa: Local de homicídio ════════
  {
    modulo: "1AE", tipo: "dissertativa",
    contexto: "8º Quesito (1ª AE — PO — CFO 2025) — Dissertativa (mínimo 10 e máximo 15 linhas).",
    enunciado: "Discorra sobre os procedimentos básicos que uma guarnição deve adotar em local de um crime de homicídio.",
    modelo: {
      estrutura: "Chegada e segurança → socorro às vítimas → isolamento → preservação de vestígios → comunicação → registro e encaminhamento.",
      criterios: [
        "Garantir a segurança da equipe e do local antes de adentrar",
        "Verificar e prestar socorro a vítimas com sinais vitais",
        "Isolar e delimitar a área, controlando o acesso de curiosos e imprensa",
        "Preservar vestígios (posição de cadáveres, armas, shell casings, pegadas, etc.)",
        "Comunicar ao COPOM/CIODS, acionar a perícia e a DPC",
        "Identificar e colher dados de testemunhas e envolvidos",
        "Registrar alterações realizadas (socorro, remoção) com justificativa e horário",
        "Confeccionar o BOEPM com informações precisas e imparciais",
      ],
      resposta: "Ao chegar ao local, a guarnição deve, antes de tudo, garantir sua própria segurança, verificando se há risco residual (atirador ativo, multidão hostil). Constatada alguma vítima com sinais vitais, prioriza-se o socorro imediato, acionando o SAMU. Em seguida, a equipe procede ao isolamento da área — utilizando fitas, viaturas ou quaisquer meios disponíveis —, controlando o acesso e impedindo a entrada de curiosos, imprensa ou pessoas não autorizadas. A preservação dos vestígios é fundamental: os policiais evitam tocar, mover ou pisar sobre evidências (posição de corpos, armas, cápsulas, rastros), salvo para o socorro. Toda remoção ou alteração deve ser registrada, com horário e justificativa. A guarnição comunica imediatamente ao COPOM/CIODS, acionando a perícia criminal e a Polícia Civil. Testemunhas são identificadas e, se possível, mantidas no local até a chegada da investigação. Ao final, o BOEPM é preenchido com informações precisas, imparciais e detalhadas sobre o local, as vítimas, os envolvidos e as providências adotadas.",
    },
  },

  // ════════ 9º QUESITO — Dissertativa: LGBTQIAPN+ e POP 005 ════════
  {
    modulo: "1AE", tipo: "dissertativa",
    contexto: "9º Quesito (1ª AE — PO — CFO 2025) — A abordagem a grupos vulneráveis requer sensibilidade, respeito e conhecimento das necessidades específicas de cada grupo. Para o caso das Pessoas LGBTQIAPN+, a Polícia Militar de Pernambuco editou e publicou o Procedimento Operacional Padrão (POP) de n.º 005. Estando você no comando do Policiamento Externo do Classic Hall, onde ocorre o Show de um artista nacional, na condição de Oficial de Operações do 1º BPM, dispondo de Patrulhas integradas por Policiais Militares Masculinos e Femininos, informe quais seriam as medidas a serem adotadas durante a realização de buscas pessoais (não minuciosa), baseadas em fundadas suspeitas, nas seguintes situações: a) Pessoa identificada como GAY; b) Pessoa identificada como TRAVESTI que se apresenta como mulher de nome social Sônia; c) Transexual que se utiliza de vestes masculinas, mas exige ser abordada por uma policial feminina; d) Pessoa identificada como TRAVESTI que se apresenta como mulher de nome social Sônia, contudo, todas as Policiais Femininas presentes alegam constrangimento e não desejam efetuar a abordagem pessoal. (Mínimo 07 e máximo 15 linhas.)",
    enunciado: "Com base no POP nº 005 da PMPE, discorra sobre os procedimentos de busca pessoal (não minuciosa) nas quatro situações descritas envolvendo pessoas LGBTQIAPN+.",
    modelo: {
      estrutura: "Premissa geral (POP 005) → caso a) gay → caso b) travesti/nome social → caso c) transexual masculino pedindo PM feminina → caso d) travesti sem PM feminina disponível.",
      criterios: [
        "a) Pessoa gay: busca realizada por policial do mesmo sexo biológico (masculino), com respeito e sem discriminação",
        "b) Travesti com nome social feminino: busca realizada por policial feminina, respeitando nome social e identidade de gênero",
        "c) Transexual masculino (vestes masc.) que solicita PM feminina: a preferência deve ser atendida — PM feminina realiza a busca",
        "d) Travesti/nome social Sônia sem PM feminina disponível: PM masculino realiza a busca acompanhado de testemunha não policial (civil), registrando a situação",
        "Tratamento respeitoso, uso do nome social e ausência de constrangimento público em todos os casos",
      ],
      resposta: "O POP nº 005 da PMPE orienta que a abordagem e busca pessoal em pessoas LGBTQIAPN+ seja conduzida com respeito, sigilo e uso do nome social quando aplicável. a) Pessoa identificada como GAY: a busca pessoal segue o critério do sexo biológico — policial masculino realiza a abordagem, com postura respeitosa e sem discriminação. b) TRAVESTI (nome social Sônia): a busca deve ser realizada por policial feminina, respeitando a identidade de gênero e o nome social, conforme o POP 005. c) Transexual masculino que solicita PM feminina: a preferência deve ser atendida, sendo a busca realizada por policial feminina — o POP garante que a identidade de gênero declarada oriente o procedimento. d) TRAVESTI (nome social Sônia) sem PM feminina disponível: nesse caso, o PM masculino realiza a busca acompanhado de testemunha civil (não policial), registrando a situação no BOEPM para garantir a rastreabilidade do procedimento e afastar alegações de arbitrariedade.",
    },
  },

  // ════════ 10º QUESITO — Dissertativa: Violência doméstica / Maria da Penha ════════
  {
    modulo: "1AE", tipo: "dissertativa",
    contexto: "10º Quesito (1ª AE — PO — CFO 2025) — Durante o evento Galo da Madrugada, ocorrido no dia 14 de fevereiro de 2026, por volta das 14h00, o efetivo do BPChoque, escalado na Operação Galo da Madrugada, foi acionado por populares que informaram sobre uma agressão acontecendo em uma embarcação atracada em frente à plataforma 3, na Rua do Sol. O imputado, Sr. R.P.O.F., mordeu e agrediu fisicamente a sua esposa, a Sra. V.M.O., deixando-a com uma lesão no lábio inferior e no supercílio esquerdo. Para o atendimento da ocorrência o efetivo teve, inclusive, que usar uma embarcação de um popular para chegar ao local do fato. A Sra. V.M.O. não quis prestar queixa-crime formal contra o seu marido (agressor), uma vez que a vontade da vítima era não prosseguir com a denúncia.",
    enunciado: "Discorra sobre as diretrizes voltadas para o atendimento da ocorrência descrita, que envolve mulher em situação de vulnerabilidade no âmbito familiar. Aborde as providências a serem adotadas pelo policiamento, a atuação da PMPE em relação à rede de apoio à mulher em situação de violência, a questão da escuta ativa e da ação penal relativa à ocorrência. (Mínimo 10 e máximo 15 linhas.)",
    modelo: {
      estrutura: "Atendimento humanizado → providências imediatas → Lei Maria da Penha e ação penal incondicionada → rede de apoio → encaminhamento.",
      criterios: [
        "Atendimento com escuta ativa, empatia e sem revitimização",
        "Registro do BOEPM com descrição das lesões e das circunstâncias",
        "Condução do agressor (prisão em flagrante — lesão corporal doméstica)",
        "Esclarecimento à vítima sobre a ação penal pública incondicionada (Lei 11.340/2006 — não depende de representação da vítima)",
        "Encaminhamento à Delegacia da Mulher (ou delegacia mais próxima)",
        "Informação sobre medidas protetivas de urgência",
        "Acionamento da rede de apoio: CREAS, CRAM, abrigos, serviços de saúde",
        "Encaminhamento para atendimento médico (lesões físicas visíveis)",
      ],
      resposta: "O atendimento à Sra. V.M.O. deve ser conduzido com escuta ativa, empatia e respeito, sem culpabilizar a vítima ou minimizar a violência. A guarnição deve registrar as lesões (lábio inferior e supercílio esquerdo) no BOEPM com o máximo de detalhes, garantindo a preservação da prova. A vítima deve ser encaminhada para atendimento médico. Quanto ao agressor, configura-se lesão corporal no âmbito de violência doméstica (art. 129, §9º, do CP, com agravante da Lei Maria da Penha), crime de ação penal pública incondicionada — ou seja, a vontade da vítima de não representar NÃO impede a prisão em flagrante nem o prosseguimento da ação penal. O efetivo deve prender o agressor em flagrante e conduzi-lo à Delegacia da Mulher. Deve-se informar à vítima sobre a possibilidade de requerer medidas protetivas de urgência (afastamento do lar, proibição de aproximação e contato). A PMPE deve acionar a rede de apoio: CREAS, CRAM (Centro de Referência de Atendimento à Mulher), abrigos e serviços de saúde. A escuta ativa e a abordagem humanizada são pilares do atendimento, garantindo que a vítima se sinta segura para relatar os fatos sem pressão.",
    },
  },
]

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MAT } })
  if (!disc) throw new Error(`Disciplina ${MAT} não existe.`)

  let n = 0, upd = 0
  for (const q of QS) {
    const hash = createHash("sha1").update(`${MAT}|${q.modulo}|${q.enunciado}`).digest("hex")
    const base = {
      materia: MAT,
      modulo: q.modulo,
      tipo: q.tipo,
      contexto: q.contexto ?? null,
      enunciado: q.enunciado,
      alternativas: q.tipo === "multipla" ? (q as { alternativas: Alt[] }).alternativas : [],
      gabarito: q.tipo !== "dissertativa" ? (q as { gabarito: string }).gabarito : "",
      explicacao: q.tipo !== "dissertativa" ? (q as { explicacao: string }).explicacao : null,
      modelo: q.tipo === "dissertativa" ? (q as { modelo: object }).modelo : Prisma.DbNull,
      fonte: FONTE,
      hash,
    }
    const r = await prisma.questao.upsert({
      where: { hash },
      update: { ...base },
      create: { ...base },
    })
    if (r) { n++; if (r.updatedAt > r.createdAt) upd++ }
  }
  console.log(`✓ ${n} questões de PO (1ª AE) importadas/atualizadas (${upd} atualizadas).`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
