import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
// Ações Básicas de Apoio Aéreo — 6 módulos (11 questões cada: 7 V/F + 3 MC +
// 1 dissertativa) + módulo SIM (simulado, 22 questões, 10,0 pontos) = 88.
// Fonte: apostila "Ações Básicas de Apoio Aéreo" (GTA-SDS/PE, public/apostilas/ABAA.pdf)
// e memento ABAA. Fatos em que apostila e memento divergem (quantidade de aviões
// da frota, prefixo do 1º helicóptero) foram deixados de fora de propósito.
// Gabaritos das múltiplas distribuídos entre A–E; explicações sem citar letra.
const MAT = "ABAA"
const FONTE_PADRAO = "Apostila ABAA (GTA-SDS/PE)"

type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string; fonte?: string; contexto?: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string; fonte?: string; contexto?: string }
  | { modulo: string; tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string }; fonte?: string; contexto?: string }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const BLOCO_VF = "BLOCO I — Julgue os itens a seguir, assinalando VERDADEIRO ou FALSO. Cada assertiva vale 0,20 ponto."
const BLOCO_MC = "BLOCO II — Questões de múltipla escolha. Cada questão vale 0,50 ponto."

const QS: Q[] = [
  // ════════════════════ MÓDULO 1 — Histórico, estrutura, missão e acionamento do GTA ════════════════════
  { modulo: "1", tipo: "certo_errado", enunciado: "A aviação de segurança pública em Pernambuco iniciou-se na década de 1980, com aviões usados em traslados de autoridades e missões aeromédicas e helicópteros contratados em missões policiais.", gabarito: "certo", explicacao: "Correto. É a origem descrita no item 1.1." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O Grupamento de Radiopatrulhamento Aéreo (GRAer) foi regulamentado por Portaria do Gabinete da SDS em 2001, subordinado à SDS e integrado por servidores oriundos das operativas.", gabarito: "certo", explicacao: "Correto. Portaria do Gabinete da SDS/PE nº 182, de 5 de junho de 2001." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A Companhia Independente Tático Aérea (CITAer), criada em 2004 após a extinção do GRAer, era subordinada diretamente à Secretaria de Defesa Social.", gabarito: "errado", explicacao: "Errado. A CITAer (Lei nº 12.544/2004) era organização militar estadual subordinada diretamente à POLÍCIA MILITAR de Pernambuco." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O Decreto nº 31.214/2007 transferiu a CITAer da PMPE para a SDS, passando a unidade a denominar-se Grupamento Tático Aéreo (GTA), vinculado ao Gabinete do Secretário de Defesa Social.", gabarito: "certo", explicacao: "Correto. O decreto foi modificado pelo Decreto nº 33.321/2009." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O Seneca II, incorporado em setembro de 2023, foi a primeira aeronave de asa fixa do GTA-SDS/PE.", gabarito: "certo", explicacao: "Correto. Chegou em 4 de setembro de 2023." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O Curso de Formação de Piloto de Aeronaves (CFPAer) habilita o servidor a exercer a função de Comandante de aeronave.", gabarito: "errado", explicacao: "Errado. O CFPAer habilita a pilotar como SEGUNDO PILOTO em comando; a ascensão a Comandante é pelo CHCAer (Curso de Habilitação a Comandante de Aeronave)." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Pelo Decreto nº 33.321/2009, o Governador, o Secretário de Defesa Social e o Secretário Executivo de Defesa Social podem acionar as aeronaves em qualquer hipótese, dentro e fora do Estado.", gabarito: "certo", explicacao: "Correto. É o art. 3º do decreto." },
  { modulo: "1", tipo: "multipla", enunciado: "Segundo o art. 3º do Decreto nº 33.321/2009, o acionamento das aeronaves em missões IMEDIATAS de radiopatrulhamento preventivo e repressivo e de salvamento compete:", alternativas: A(
    "ao Comandante-Geral da PMPE",
    "ao responsável pelas Operações Aéreas, mediante ordem de serviço",
    "ao Chefe do GTA",
    "ao CIODS, exclusivamente",
    "ao Comandante do batalhão da área"),
    gabarito: "C", explicacao: "Missões imediatas: Chefe do GTA. Missões planejadas: responsável pelas Operações Aéreas, por ordem de serviço em plano de ação. Em qualquer hipótese: Governador, Secretário e Secretário Executivo de Defesa Social." },
  { modulo: "1", tipo: "multipla", enunciado: "Assinale a sequência CORRETA da evolução da aviação de segurança pública em Pernambuco:", alternativas: A(
    "GTA (2000) → CITAer (2004) → GRAer (2007)",
    "CITAer (2000) → GRAer (2004) → GTA (2007)",
    "GRAer (2000/2001) → CITAer (2004) → GTA (2007)",
    "GRAer (2004) → GTA (2007) → CITAer (2009)",
    "GTA (2004) → GRAer (2007) → CITAer (2009)"),
    gabarito: "C", explicacao: "Primeiro helicóptero em dezembro de 2000 e GRAer regulamentado em 2001; CITAer em 2004 (Lei nº 12.544); GTA em 2007 (Decreto nº 31.214)." },
  { modulo: "1", tipo: "multipla", enunciado: "Constitui missão do GTA, segundo a apostila:", alternativas: A(
    "executar atividades policiais preventivas e repressivas, realizar operações de salvamento e defesa civil, atender às determinações do Governador e apoiar operações de órgãos federais",
    "fiscalizar o espaço aéreo brasileiro em substituição à FAB",
    "homologar helipontos e heliportos em Pernambuco",
    "investigar acidentes aeronáuticos como órgão central do SIPAER",
    "formar pilotos da aviação civil para empresas privadas"),
    gabarito: "A", explicacao: "É a missão do GTA. Homologação cabe à ANAC; o órgão central do SIPAER é o CENIPA." },
  { modulo: "1", tipo: "dissertativa", enunciado: "Descreva a evolução histórica da aviação de segurança pública em Pernambuco até a criação do GTA e explique como se dá o acionamento das aeronaves segundo o Decreto nº 33.321/2009. (Mínimo 05 e máximo 12 linhas)", modelo: { estrutura: "Origem (anos 1980) → GRAer → CITAer → GTA → acionamento (art. 3º).", criterios: ["Anos 1980: aviões em traslados e aeromédico; helicópteros contratados; pilotos próprios a partir de 1997", "GRAer: 1º helicóptero em 2000, Portaria SDS nº 182/2001, subordinado à SDS", "CITAer: Lei nº 12.544/2004, subordinada à PMPE", "GTA: Decreto nº 31.214/2007 (alterado pelo 33.321/2009), vinculado ao Gabinete do Secretário", "Acionamento: Chefe do GTA (imediatas), Operações Aéreas (planejadas), Governador/Secretários (qualquer hipótese)"], resposta: "A aviação de segurança pública em Pernambuco começou na década de 1980, com aviões em traslados de autoridades e missões aeromédicas e helicópteros contratados em missões policiais; a partir de 1997 o Estado passou a formar pilotos próprios (PMPE, CBMPE e PCPE). Em dezembro de 2000 chegou o primeiro helicóptero da SDS, e a Portaria nº 182/2001 regulamentou o Grupamento de Radiopatrulhamento Aéreo (GRAer), subordinado à SDS. Extinto o GRAer, a Lei nº 12.544/2004 criou a CITAer, subordinada à PMPE. Em 2007, o Decreto nº 31.214, alterado pelo Decreto nº 33.321/2009, transferiu a CITAer para a SDS, surgindo o Grupamento Tático Aéreo (GTA), vinculado ao Gabinete do Secretário. Pelo art. 3º do Decreto nº 33.321/2009, as aeronaves são acionadas pelo Chefe do GTA nas missões imediatas de radiopatrulhamento e salvamento; pelo responsável pelas Operações Aéreas nas missões planejadas, mediante ordem de serviço; e pelo Governador, pelo Secretário de Defesa Social e pelo Secretário Executivo em qualquer hipótese, dentro e fora do Estado." } },

  // ════════════════════ MÓDULO 2 — Segurança de voo e SIPAER ════════════════════
  { modulo: "2", tipo: "certo_errado", enunciado: "Segundo a NSCA 3-3, a segurança de voo é a segurança operacional aplicada especificamente à atividade aérea e tem como objetivo prevenir ocorrências aeronáuticas.", gabarito: "certo", explicacao: "Correto. É a definição da NSCA 3-3 citada no item 1.2." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Segurança operacional é o estado no qual os riscos associados às atividades da aviação são completamente eliminados.", gabarito: "errado", explicacao: "Errado. Os riscos são CONTROLADOS E REDUZIDOS A UM NÍVEL ACEITÁVEL, não eliminados." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Pelo Código Brasileiro de Aeronáutica, a prevenção de acidentes aeronáuticos é responsabilidade de todas as pessoas, naturais ou jurídicas, envolvidas com a fabricação, manutenção, operação e circulação de aeronaves e com as atividades de apoio.", gabarito: "certo", explicacao: "Correto. É o art. 87 do CBA (Lei nº 7.565/86)." },
  { modulo: "2", tipo: "certo_errado", enunciado: "O CENIPA é o órgão central do SIPAER, responsável pela orientação normativa do sistema.", gabarito: "certo", explicacao: "Correto. O SERIPA é o serviço regional, parte do COMAER." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Na região Nordeste, o SERIPA é representado pelo SERIPA II, com sede em Fortaleza-CE.", gabarito: "errado", explicacao: "Errado. O SERIPA II tem sede em RECIFE-PE." },
  { modulo: "2", tipo: "certo_errado", enunciado: "O Elo-SIPAER é subordinado diretamente ao detentor do mais elevado cargo executivo da organização, independentemente do título a ele atribuído.", gabarito: "certo", explicacao: "Correto. É a definição normativa citada na apostila." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Entre os princípios do SIPAER está o de que todo acidente resulta de uma causa principal isolada, que deve ser identificada e punida.", gabarito: "errado", explicacao: "Errado. Todo acidente resulta de VÁRIOS eventos e nunca de uma causa isolada; e acusações e punições de erros humanos agem contra a prevenção." },
  { modulo: "2", tipo: "multipla", enunciado: "NÃO é princípio fundamental da filosofia SIPAER:", alternativas: A(
    "todo acidente pode ser evitado",
    "todo acidente aeronáutico tem um precedente",
    "a alta direção é a principal responsável pela prevenção de acidentes",
    "o propósito da prevenção é restringir a atividade aérea para reduzir a exposição ao risco",
    "na prevenção de acidentes não há segredos nem bandeiras"),
    gabarito: "D", explicacao: "O propósito da prevenção NÃO é restringir a atividade aérea, mas estimular o seu desenvolvimento com segurança." },
  { modulo: "2", tipo: "multipla", enunciado: "O órgão, setor ou cargo responsável pelos assuntos de segurança operacional dentro de uma organização é denominado:", alternativas: A(
    "CENIPA",
    "SERIPA",
    "COMAER",
    "CBA",
    "Elo-SIPAER"),
    gabarito: "E", explicacao: "É o Elo-SIPAER. Os Elos de diferentes instituições devem comunicar-se sobre todas as atividades de segurança operacional." },
  { modulo: "2", tipo: "multipla", enunciado: "Segundo o Decreto nº 87.249/82, as atividades de investigação e prevenção de acidentes aeronáuticos são definidas como tarefas realizadas com a finalidade de:", alternativas: A(
    "apurar responsabilidades e aplicar punições aos culpados",
    "evitar perdas de vidas e de material decorrentes de acidentes aeronáuticos",
    "homologar áreas de pouso e decolagem",
    "fiscalizar o cumprimento das normas da ANAC pelas empresas",
    "reduzir os custos operacionais das aeronaves"),
    gabarito: "B", explicacao: "É a definição do decreto que regulamenta o SIPAER, integrante da infraestrutura aeronáutica (art. 25 do CBA)." },
  { modulo: "2", tipo: "dissertativa", enunciado: "Conceitue segurança de voo e segurança operacional e cite ao menos quatro dos oito princípios fundamentais da filosofia SIPAER. (Mínimo 05 e máximo 10 linhas)", modelo: { estrutura: "Conceitos (NSCA 3-3) → princípios.", criterios: ["Segurança de voo: segurança operacional aplicada à atividade aérea para prevenir ocorrências", "Segurança operacional: riscos controlados e reduzidos a nível aceitável", "Ao menos 4 princípios: todo acidente pode ser evitado; resulta de vários eventos; tem precedente; mobilização geral; prevenção estimula a atividade; alta direção responsável; sem segredos nem bandeiras; punições agem contra a prevenção"], resposta: "Segundo a NSCA 3-3, segurança de voo é a segurança operacional aplicada especificamente à atividade aérea, com o objetivo de prevenir ocorrências aeronáuticas. Segurança operacional é o estado no qual os riscos associados às atividades da aviação, diretamente ligados à operação de aeronaves ou ao seu apoio, são controlados e reduzidos a um nível aceitável. A filosofia SIPAER baseia-se em oito princípios: todo acidente pode ser evitado; todo acidente resulta de vários eventos e nunca de uma causa isolada; todo acidente aeronáutico tem um precedente; a prevenção requer mobilização geral; o propósito da prevenção não é restringir a atividade aérea, mas estimular seu desenvolvimento com segurança; a alta direção é a principal responsável pela prevenção; na prevenção não há segredos nem bandeiras; e acusações e punições de erros humanos agem contra os interesses da prevenção." } },

  // ════════════════════ MÓDULO 3 — Briefing de passageiros: aproximação, embarque e desembarque ════════════════════
  { modulo: "3", tipo: "certo_errado", enunciado: "Na aproximação do helicóptero, deve-se utilizar a proa (frente), ficando no ângulo de visão do piloto, e só se aproximar quando autorizado.", gabarito: "certo", explicacao: "Correto. Nunca se aproxime por trás da aeronave." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Se a única maneira de se aproximar for pela cauda, o passageiro pode fazê-lo sozinho, desde que caminhe agachado.", gabarito: "errado", explicacao: "Errado. Se a única maneira for pela cauda, deve-se AGUARDAR a presença do tripulante operacional." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Havendo inclinação no terreno, a aproximação do helicóptero deve ser feita sempre pelo lado mais baixo.", gabarito: "certo", explicacao: "Correto. Em terreno inclinado, o plano do rotor fica mais baixo do lado mais alto; por isso a aproximação é sempre pelo lado mais baixo." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Durante a aproximação com equipamentos, objetos grandes como escudos e armamentos longos devem ser mantidos na horizontal.", gabarito: "certo", explicacao: "Correto. E nunca jogá-los de qualquer jeito: uma manobra errada é acidente certo." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Para o embarque, a arma do policial deverá sempre estar fria e assim permanecer até o desembarque.", gabarito: "certo", explicacao: "Correto. É a observação destacada no briefing de embarque." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Dentro da aeronave, além do cinto de segurança, o passageiro pode apoiar-se nas portas para se estabilizar durante as manobras.", gabarito: "errado", explicacao: "Errado. Fora o cinto, não se toca em nada: apoiar-se numa porta, no cinto do piloto ou esbarrar num comando pode ocasionar a queda da aeronave." },
  { modulo: "3", tipo: "certo_errado", enunciado: "No desembarque, deve-se aguardar autorização e afastar-se utilizando o ângulo de 45º, sem tirar a atenção da aeronave.", gabarito: "certo", explicacao: "Correto. Nunca andar em direção à retaguarda nem passar por baixo da cauda." },
  { modulo: "3", tipo: "multipla", enunciado: "Sobre as recomendações de segurança na APROXIMAÇÃO da aeronave, assinale a alternativa INCORRETA:", alternativas: A(
    "Nunca embarcar com cobertura.",
    "Nunca se esticar ou correr para apanhar objeto levado pelo deslocamento de ar.",
    "Caminhar agachado, reduzindo a silhueta, devido ao rotor principal.",
    "Presença de animais, crianças e pessoas é sinal de perigo constante, pois o rotor de cauda é um ímã para elas.",
    "Correr em direção à aeronave assim que ela tocar o solo, para agilizar o embarque."),
    gabarito: "E", explicacao: "A aproximação só ocorre quando autorizada, caminhando agachado e olhando para o objetivo; correr para a aeronave ao tocar o solo contraria o briefing." },
  { modulo: "3", tipo: "multipla", enunciado: "Se o passageiro for atingido nos olhos por corpo estranho ou poeira durante a aproximação, deve:", alternativas: A(
    "proteger os olhos com as mãos, parar e abaixar-se ou sentar-se até que alguém venha em seu auxílio",
    "correr para longe da aeronave em qualquer direção",
    "retirar o capacete e esfregar os olhos",
    "continuar a aproximação de olhos fechados",
    "acenar para o piloto desligar o rotor"),
    gabarito: "A", explicacao: "É a orientação do briefing: proteger os olhos, parar e abaixar-se ou sentar-se até receber auxílio." },
  { modulo: "3", tipo: "multipla", enunciado: "Sobre o uso do aparelho celular a bordo, segundo o briefing do GTA:", alternativas: A(
    "é livre durante todo o voo",
    "é proibido em qualquer circunstância",
    "é permitido apenas no modo avião, sem autorização",
    "está condicionado à autorização do Comandante da aeronave",
    "depende de autorização do tripulante operacional em solo"),
    gabarito: "D", explicacao: "O uso do celular está condicionado à autorização do Cmt da aeronave." },
  { modulo: "3", tipo: "dissertativa", enunciado: "Descreva as principais recomendações de segurança do briefing de passageiros do GTA para a aproximação, o embarque e o desembarque do helicóptero. (Mínimo 06 e máximo 12 linhas)", modelo: { estrutura: "Aproximação → embarque → desembarque.", criterios: ["Aproximação: pela proa, autorizado; nunca por trás (cauda só com tripulante); agachado; sem cobertura; objetos longos na horizontal; terreno inclinado pelo lado mais baixo; atenção a pessoas e animais", "Embarque: cinto afivelado e saber liberá-lo; não tocar em nada; nenhum objeto solto; celular só com autorização; arma fria", "Desembarque: aguardar autorização; afastar-se a 45º para a frente com silhueta reduzida; não tirar a atenção da aeronave; nunca ir para a cauda"], resposta: "Na aproximação, nunca se deve chegar por trás da aeronave: usa-se a proa, ficando no ângulo de visão do piloto, e só se avança quando autorizado; se a única via for pela cauda, aguarda-se o tripulante operacional. Caminha-se agachado, reduzindo a silhueta por causa do rotor principal, sem cobertura, olhando para o objetivo e com objetos longos na horizontal; em terreno inclinado, aproxima-se pelo lado mais baixo, atentando para pessoas, crianças e animais, pois o rotor de cauda é um ímã para elas. No embarque, o cinto deve permanecer afivelado e ajustado, sabendo-se como liberá-lo; fora o cinto, não se toca em nada, nenhum objeto pode ficar solto, o celular depende de autorização do Comandante e a arma deve estar fria até o desembarque. No desembarque, aguarda-se autorização e afasta-se no ângulo de 45º para a frente, com silhueta reduzida, sem tirar a atenção da aeronave e nunca seguindo em direção à cauda." } },

  // ════════════════════ MÓDULO 4 — Locais de pouso, ZPH, balizamento e isolamento ════════════════════
  { modulo: "4", tipo: "certo_errado", enunciado: "Na aviação de segurança pública, aeronaves de asas rotativas têm a prerrogativa de pousar e decolar em áreas não regulamentadas, sob a responsabilidade do piloto em comando.", gabarito: "certo", explicacao: "Correto. Por isso é importante a participação do efetivo em solo na seleção e isolamento da área." },
  { modulo: "4", tipo: "certo_errado", enunciado: "A área não homologada selecionada para pouso e decolagem de helicóptero (ZPH) deve possuir dimensões mínimas de 10 m x 10 m.", gabarito: "errado", explicacao: "Errado. As dimensões mínimas são de 20 m x 20 m." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Brownout é a perda de visibilidade causada pela suspensão de partículas soltas, como poeira e cinzas, levantadas pelo deslocamento de ar do rotor.", gabarito: "certo", explicacao: "Correto. Por isso a ZPH deve estar livre de partículas soltas." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O balizador deve posicionar-se em local seguro e visível, sem cobertura, com óculos de proteção e abafador, mantendo o vento pelas costas e os braços elevados a 45 graus em relação ao corpo.", gabarito: "certo", explicacao: "Correto. É a orientação de balizamento do item 2.1.2." },
  { modulo: "4", tipo: "certo_errado", enunciado: "As operações de pouso e decolagem devem ser preferencialmente realizadas a favor do vento, o que dá maior sustentação às aeronaves.", gabarito: "errado", explicacao: "Errado. Devem ser preferencialmente realizadas CONTRA o vento, o que proporciona maior sustentação e estabilidade." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Para minimizar riscos com os rotores girando, a aproximação de viaturas e de pessoas que não estejam embarcando deve ser limitada a 20 metros do helicóptero.", gabarito: "certo", explicacao: "Correto. O rotor principal tem cerca de 5,35 m de raio e 3,34 m de altura e é de difícil visualização." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O pouso de helicóptero em rodovia exige interrupção do trânsito em pelo menos um dos sentidos da via, com afastamento mínimo de 20 metros.", gabarito: "errado", explicacao: "Errado. Exige a interrupção TOTAL do trânsito nos DOIS sentidos, com afastamento mínimo de 50 metros em cada sentido." },
  { modulo: "4", tipo: "multipla", enunciado: "São características exigidas da ZPH (área não homologada para pouso de helicóptero), EXCETO:", alternativas: A(
    "dimensões mínimas de 20 m x 20 m",
    "estar livre de obstáculos elevados nas trajetórias de aproximação e decolagem",
    "estar coberta por cascalho solto, para melhor aderência dos esquis",
    "ser plana ou quase plana",
    "estar livre de partículas soltas que possam causar brownout"),
    gabarito: "C", explicacao: "Partículas soltas, como pedras, poeira e cinzas, devem ser EVITADAS: causam brownout ou são arremessadas pelo rotor." },
  { modulo: "4", tipo: "multipla", enunciado: "Nas aeronaves de asa fixa (aviões) com motores funcionando, a aproximação deve ocorrer:", alternativas: A(
    "pela frente, no ângulo de visão do piloto",
    "a 45 graus da proa",
    "por qualquer direção, desde que agachado",
    "somente pela parte inferior da fuselagem",
    "pela lateral ou pela parte traseira, pois o ponto crítico é a hélice dianteira"),
    gabarito: "E", explicacao: "Nos aviões, o ponto crítico é a hélice do motor, na frente; a aproximação com motores funcionando deve ser pela lateral ou pela traseira." },
  { modulo: "4", tipo: "multipla", enunciado: "Para sinalizar o local de pouso em área não homologada durante o período NOTURNO, a apostila orienta o uso de:", alternativas: A(
    "fogueiras em volta da área",
    "sinalizadores de emergência das viaturas",
    "lanternas apontadas para a cabine do piloto",
    "laser de longo alcance",
    "nenhuma sinalização, pois o piloto usa óculos de visão noturna"),
    gabarito: "B", explicacao: "À noite, a sinalização deve ser feita com os sinalizadores de emergência das viaturas, devido à restrição de visibilidade. Apontar laser contra aeronave é crime (art. 261 do CP)." },
  { modulo: "4", tipo: "dissertativa", enunciado: "Explique os cuidados que o efetivo em solo deve adotar na seleção, no balizamento e no isolamento de uma Zona de Pouso de Helicóptero (ZPH). (Mínimo 06 e máximo 12 linhas)", modelo: { estrutura: "Seleção → balizamento → isolamento → rodovia.", criterios: ["Seleção: mínimo 20x20 m, plana, sem obstáculos elevados (fios, antenas, edificações), sem partículas soltas (brownout)", "Balizamento: local seguro e visível, sem cobertura, óculos e abafador, vento pelas costas, braços a 45º; pouso contra o vento; à noite, sinalizadores das viaturas", "Isolamento: rotor de cauda e principal; aproximação a 45º da proa, autorizada; viaturas e pessoas a 20 m", "Rodovia: interrupção total nos dois sentidos, mínimo 50 m"], resposta: "Na seleção da ZPH, o efetivo deve buscar área de no mínimo 20 m x 20 m, plana ou quase plana, livre de obstáculos elevados nas trajetórias de aproximação e decolagem, como fios, antenas e edificações, e livre de partículas soltas que possam provocar brownout ou ser arremessadas pelo rotor. No balizamento, o balizador posiciona-se em local seguro e visível pela tripulação, sem cobertura, com óculos de proteção e abafador, deixando a área livre, de costas para o vento e com os braços elevados a 45 graus, já que o pouso deve ser preferencialmente contra o vento; à noite, usam-se os sinalizadores de emergência das viaturas. No isolamento, deve-se impedir a aproximação de curiosos, atentando para o rotor de cauda e para o rotor principal, de difícil visualização: a aproximação é feita a 45 graus da proa, somente com autorização do tripulante, e viaturas e pessoas que não vão embarcar ficam a 20 metros. Em rodovias, o pouso só ocorre com o trânsito totalmente interrompido nos dois sentidos, com afastamento mínimo de 50 metros em cada um." } },

  // ════════════════════ MÓDULO 5 — Equipamentos especiais, orientação, fraseologia e coordenadas ════════════════════
  { modulo: "5", tipo: "certo_errado", enunciado: "O Bambi Bucket (helibalde) é uma bolsa conectada ao gancho de carga do helicóptero, usada no combate a incêndios florestais, com capacidade máxima de 794 litros no Esquilo B3 e 540 litros no Esquilo B2.", gabarito: "certo", explicacao: "Correto. São as capacidades informadas no item 2.2." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A técnica do sling permite o salvamento de várias vítimas simultaneamente em uma única operação.", gabarito: "errado", explicacao: "Errado. O sling permite o salvamento de UMA vítima por vez; havendo mais, repete-se a operação ou usa-se outro equipamento." },
  { modulo: "5", tipo: "certo_errado", enunciado: "O cesto tem capacidade para 3 adultos ou 500 kg e não permite retirar vítimas na posição horizontal.", gabarito: "certo", explicacao: "Correto. É adequado para vítimas em pé ou sentadas, sem traumas graves." },
  { modulo: "5", tipo: "certo_errado", enunciado: "O puçá é projetado especialmente para atividades aquáticas, com aro superior flutuante que facilita o embarque das vítimas na água.", gabarito: "certo", explicacao: "Correto. Também resgata até 3 pessoas ou 500 kg." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Na orientação do helicóptero, usa-se o referencial de um relógio analógico, com a proa da aeronave sempre apontada para as 6 horas.", gabarito: "errado", explicacao: "Errado. A proa do helicóptero fica sempre apontada para as 12 HORAS." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Endereços urbanos, por serem visíveis do alto, dispensam o uso de pontos de referência visuais na orientação da tripulação.", gabarito: "errado", explicacao: "Errado. Endereços NÃO são visíveis do alto; só ajudam se a tripulação conhecer a área. Pontos de referência visuais são sempre essenciais." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Expor a perigo aeronave, por exemplo apontando laser de longo alcance contra ela, configura crime previsto no art. 261 do Código Penal.", gabarito: "certo", explicacao: "Correto. Atentado contra a segurança de transporte aéreo: reclusão de 2 a 5 anos." },
  { modulo: "5", tipo: "multipla", enunciado: "O equipamento de carga externa composto por redes e fitas tubulares, preso ao gancho por cinta de 10 metros, que permite retirar várias vítimas sem amarrações e em uso consecutivo, é o:", alternativas: A(
    "sling",
    "Bambi Bucket",
    "farol de busca",
    "cesto",
    "maca rígida"),
    gabarito: "D", explicacao: "É o cesto: capacidade de 3 adultos ou 500 kg, uso simples e rápido, apenas para vítimas em pé ou sentadas e sem traumas graves." },
  { modulo: "5", tipo: "multipla", enunciado: "São referenciais úteis para orientar o piloto a partir do solo, EXCETO:", alternativas: A(
    "estádios e ginásios",
    "torres de telefonia e linhas de transmissão",
    "rios, lagoas e pontes",
    "número da residência na fachada",
    "linhas de trem e serras"),
    gabarito: "D", explicacao: "Números e endereços não são visíveis do alto. Grandes construções, torres, pontes, rios, linhas de transmissão e de trem e serras se destacam no ângulo de observação do piloto." },
  { modulo: "5", tipo: "multipla", enunciado: "Segundo a apostila, para enviar a posição às aeronaves usando o Google Maps em um smartphone, deve-se:", alternativas: A(
    "tocar e manter pressionada uma área não identificada do mapa, inserindo um alfinete vermelho, e ler as coordenadas na caixa de pesquisa",
    "enviar apenas o nome do bairro",
    "compartilhar a rota de trânsito até o local",
    "fotografar a tela e enviar ao piloto",
    "informar o CEP do endereço mais próximo"),
    gabarito: "A", explicacao: "A posição é enviada por latitude e longitude, obtidas ao inserir um alfinete vermelho no mapa." },
  { modulo: "5", tipo: "dissertativa", enunciado: "Descreva os equipamentos de carga externa utilizados pelo GTA em salvamentos (sling, cesto e puçá), indicando a aplicação e as limitações de cada um. (Mínimo 05 e máximo 10 linhas)", modelo: { estrutura: "Sling → cesto → puçá.", criterios: ["Sling: cinto de resgate; águas, altura, precipícios, áreas confinadas; uma vítima por vez", "Cesto: gaiola de redes e fitas, cinta de 10 m; 3 adultos ou 500 kg; sem amarrações, uso consecutivo; vítimas sem trauma grave, em pé ou sentadas", "Puçá: similar ao cesto, para meio aquático; aro flutuante; até 3 pessoas ou 500 kg"], resposta: "O sling é a modalidade de carga externa em que um cinto de resgate suspende a vítima; é usado em resgates em águas agitadas ou paradas, salvamentos em altura, retiradas de precipícios e áreas confinadas, mas permite salvar apenas uma vítima por vez. O cesto é uma gaiola de redes e fitas tubulares, presa ao gancho por cinta de 10 metros, com capacidade para 3 adultos ou 500 kg; dispensa amarrações, pode ser usado várias vezes seguidas em incêndios, inundações e naufrágios, mas só serve a vítimas sem traumas graves, em pé ou sentadas, pois não permite a posição horizontal. O puçá é semelhante ao cesto, projetado para atividades aquáticas, com aro superior flutuante que facilita o embarque das vítimas na água, e resgata até 3 pessoas ou 500 kg." } },

  // ════════════════════ MÓDULO 6 — Operações aerotransportadas e resgate aeromédico ════════════════════
  { modulo: "6", tipo: "certo_errado", enunciado: "Estudo do Grupamento de Radiopatrulhamento Aéreo da PMESP concluiu que um helicóptero patrulha área equivalente à cobertura de 15 viaturas e 150 policiais, 555 vezes maior que a de um único policial.", gabarito: "certo", explicacao: "Correto. É o dado citado no item 2.6." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O resgate aéreo deve ser priorizado quando a escolha pelo socorro terrestre puder causar prejuízo à vítima ou à equipe de socorro.", gabarito: "certo", explicacao: "Correto. É o primeiro critério para o serviço aeromédico." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Antes do transporte aeromédico, é dispensável confirmar a vaga no hospital de destino, pois a aeronave tem prioridade de atendimento.", gabarito: "errado", explicacao: "Errado. É ESSENCIAL confirmar a vaga com a central de regulação e com o hospital, para não levar a vítima a unidade que não possa recebê-la." },
  { modulo: "6", tipo: "certo_errado", enunciado: "As aeronaves do GTA podem ser acionadas não apenas para casos de suporte avançado, mas também para ocorrências de suporte básico, quando necessário.", gabarito: "certo", explicacao: "Correto. As autoridades podem decidir pelo acionamento se contribuir para a excelência do serviço." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Em relação aos helicópteros, os aviões têm maior espaço interno, maior velocidade, menos vibração e maior autonomia.", gabarito: "certo", explicacao: "Correto. São vantagens das aeronaves de asa fixa." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Os helicópteros são menos restritivos quanto às condições meteorológicas do que os aviões.", gabarito: "errado", explicacao: "Errado. São os AVIÕES que são menos restritivos quanto às condições climáticas. Os helicópteros têm como vantagem a versatilidade de pouso e decolagem." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O Royal Flying Doctor Service, fundado em 1928 na Austrália, é o serviço de resgate aeromédico mais antigo do mundo.", gabarito: "certo", explicacao: "Correto. É o marco do resgate aeromédico civil citado na apostila." },
  { modulo: "6", tipo: "multipla", enunciado: "São critérios a considerar para o acionamento do serviço aeromédico do GTA, EXCETO:", alternativas: A(
    "confirmação de vaga na central de regulação e no hospital de destino",
    "condições climáticas favoráveis ao voo",
    "autonomia da aeronave suficiente para a missão",
    "compatibilidade da patologia e do estado clínico com o resgate aéreo",
    "solicitação formal da família da vítima, por escrito"),
    gabarito: "E", explicacao: "Os critérios são: prioridade para resgate aéreo, confirmação de vaga, condições climáticas, segurança da operação, autonomia da aeronave e compatibilidade clínica." },
  { modulo: "6", tipo: "multipla", enunciado: "São consideradas atividades críticas que podem comprometer ou inviabilizar o uso das aeronaves no resgate e transporte aeromédico, EXCETO:", alternativas: A(
    "chuva, névoa ou ventos fortes",
    "pouso em área não homologada e desconhecida",
    "presença de fiações e árvores nas rampas de aproximação",
    "zona de pouso com 30 m x 30 m, plana e isolada",
    "solo de baixa granulometria, sujeito a brownout"),
    gabarito: "D", explicacao: "Área de 30 m x 30 m, plana e isolada, ATENDE ao mínimo de 20 m x 20 m e não é atividade crítica. As demais situações comprometem a operação." },
  { modulo: "6", tipo: "multipla", enunciado: "Sobre as limitações dos HELICÓPTEROS em relação aos aviões, assinale a alternativa CORRETA:", alternativas: A(
    "produzem mais ruído e vibração, têm menor autonomia e menor espaço interno",
    "dependem sempre de aeródromos homologados",
    "são mais rápidos e têm maior autonomia",
    "não podem transportar vítimas de rodovias",
    "operam melhor em condições meteorológicas adversas"),
    gabarito: "A", explicacao: "As limitações dos helicópteros são ruído e vibração maiores, menor autonomia e menor espaço interno. Sua vantagem é pousar praticamente em qualquer lugar, sendo excelentes em acidentes rodoviários." },
  { modulo: "6", tipo: "dissertativa", enunciado: "Compare as vantagens e limitações das aeronaves de asa fixa e de asa rotativa no resgate aeromédico e cite os critérios a observar no acionamento desse serviço. (Mínimo 06 e máximo 12 linhas)", modelo: { estrutura: "Aviões (vantagens/limitações) → helicópteros (vantagens/limitações) → critérios de acionamento.", criterios: ["Aviões: mais espaço, velocidade, menos vibração, maior autonomia, menos restritivos ao clima; limitações: desgaste em voos longos, dependência de aeródromos", "Helicópteros: pouso em quase qualquer lugar, ótimos em rodovias; limitações: ruído e vibração, menor autonomia, menor espaço", "Critérios: prioridade quando o terrestre prejudicar, vaga confirmada, clima, segurança, autonomia, compatibilidade clínica"], resposta: "Os aviões têm mais espaço interno, maior velocidade, menos vibração, maior autonomia e são menos restritivos quanto às condições climáticas; como limitações, impõem desgaste à tripulação em voos longos e dependem de aeródromos, nem sempre disponíveis. Os helicópteros podem pousar e decolar praticamente em qualquer lugar e são excelentes no transporte de vítimas de acidentes em rodovias, reduzindo drasticamente o tempo de resposta; em contrapartida, produzem mais ruído e vibração, têm menor autonomia e cabine menor. No acionamento do serviço aeromédico devem ser observados: a prioridade do resgate aéreo quando o socorro terrestre puder prejudicar a vítima ou a equipe; a confirmação de vaga com a central de regulação e o hospital de destino; condições climáticas favoráveis; a segurança da operação; a autonomia suficiente da aeronave; e a compatibilidade do estado clínico da vítima com o transporte aéreo." } },

  // ════════════════════ SIMULADO — formato da prova (10,0 pontos) ════════════════════
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "A CITAer, criada em 2004, era subordinada diretamente à Polícia Militar de Pernambuco. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto. Lei nº 12.544/2004." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "O GTA é vinculado ao Comando-Geral da Polícia Militar de Pernambuco. (Valor: 0,20)", gabarito: "errado", explicacao: "Errado. O GTA é vinculado ao Gabinete do Secretário de Defesa Social (SDS)." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Missões planejadas do GTA são acionadas pelo responsável pelas Operações Aéreas, mediante ordem de serviço definida em plano de ação. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto. Art. 3º do Decreto nº 33.321/2009." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "O CHCAer tem por objetivo ascender o piloto de aeronave à função de Comandante de aeronave. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto. O CFPAer forma o segundo piloto em comando." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Segundo a filosofia SIPAER, acusações e punições de erros humanos são instrumentos essenciais da prevenção de acidentes. (Valor: 0,20)", gabarito: "errado", explicacao: "Errado. Acusações e punições de erros humanos agem CONTRA os interesses da prevenção." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "O SERIPA II, representante do SERIPA na região Nordeste, tem sede em Recife-PE. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "No embarque em helicóptero, o policial deve manter a arma alimentada e pronta, para reagir a eventual ameaça durante o voo. (Valor: 0,20)", gabarito: "errado", explicacao: "Errado. A arma deve SEMPRE estar fria para embarcar e assim permanecer até o desembarque." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "No desembarque, deve-se afastar da aeronave no ângulo de 45º, sem tirar a atenção dela e nunca seguindo em direção à cauda. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "A ZPH deve ter dimensões mínimas de 20 m x 20 m e estar livre de obstáculos elevados e de partículas soltas. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto. Item 2.1.1." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "O pouso e a decolagem devem ser feitos preferencialmente a favor do vento. (Valor: 0,20)", gabarito: "errado", explicacao: "Errado. Preferencialmente CONTRA o vento, para maior sustentação e estabilidade." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "O pouso de helicóptero em rodovia exige a interrupção total do trânsito nos dois sentidos, com afastamento mínimo de 50 metros em cada sentido. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "O sling permite o resgate de até três vítimas simultaneamente. (Valor: 0,20)", gabarito: "errado", explicacao: "Errado. O sling resgata UMA vítima por vez; até 3 pessoas é a capacidade do cesto e do puçá." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Na orientação da aeronave pelo referencial horário, a proa do helicóptero fica sempre apontada para as 12 horas. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Um helicóptero patrulha área equivalente à de 15 viaturas e 150 policiais. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto. Estudo do GRPAe da PMESP." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Os helicópteros têm maior autonomia de voo e geram menos vibração do que os aviões. (Valor: 0,20)", gabarito: "errado", explicacao: "Errado. São os AVIÕES que têm maior autonomia e menos vibração." },
  { modulo: "SIM", tipo: "multipla", contexto: BLOCO_MC, enunciado: "Sobre o histórico e a estrutura do GTA, assinale a alternativa INCORRETA: (Valor: 0,50)", alternativas: A(
    "O GRAer foi regulamentado por portaria do Gabinete da SDS em 2001.",
    "A CITAer foi criada pela Lei nº 12.544/2004.",
    "O GTA surgiu com o Decreto nº 31.214/2007, modificado pelo Decreto nº 33.321/2009.",
    "O Seneca II foi a primeira aeronave de asa fixa do GTA.",
    "O GTA foi transferido da SDS para a PMPE em 2007."),
    gabarito: "E", explicacao: "Em 2007 ocorreu o contrário: a CITAer foi transferida da PMPE para a SDS, passando a chamar-se GTA." },
  { modulo: "SIM", tipo: "multipla", contexto: BLOCO_MC, enunciado: "É princípio fundamental da filosofia SIPAER: (Valor: 0,50)", alternativas: A(
    "todo acidente decorre de uma única causa",
    "a prevenção cabe exclusivamente aos pilotos",
    "todo acidente aeronáutico tem um precedente",
    "a prevenção deve restringir a atividade aérea",
    "a punição do erro humano estimula a prevenção"),
    gabarito: "C", explicacao: "Todo acidente aeronáutico tem um precedente. Os demais contrariam os princípios: vários eventos, mobilização geral, estímulo à atividade e não punição." },
  { modulo: "SIM", tipo: "multipla", contexto: BLOCO_MC, enunciado: "Sobre o balizamento e o isolamento da área de pouso, assinale a alternativa CORRETA: (Valor: 0,50)", alternativas: A(
    "O balizador deve ficar de frente para o vento, com boné para proteger dos raios solares.",
    "O balizador fica em local seguro e visível, sem cobertura, de costas para o vento, com óculos e abafador.",
    "Viaturas podem se aproximar até 5 metros do helicóptero com rotores girando.",
    "À noite, a área deve ser iluminada com laser de longo alcance.",
    "O rotor de cauda é facilmente visível com a aeronave em funcionamento."),
    gabarito: "B", explicacao: "Balizador sem cobertura, com óculos e abafador, vento pelas costas e braços a 45º; viaturas a 20 metros; à noite, sinalizadores das viaturas; o rotor de cauda é de difícil visualização." },
  { modulo: "SIM", tipo: "multipla", contexto: BLOCO_MC, enunciado: "O equipamento adequado para resgatar, de forma rápida e sem amarrações, até três vítimas conscientes e sem traumas graves em uma inundação, podendo ser usado várias vezes seguidas, é: (Valor: 0,50)", alternativas: A(
    "o cesto",
    "o sling",
    "o Bambi Bucket",
    "o farol de busca",
    "o gancho de carga sem acessórios"),
    gabarito: "A", explicacao: "O cesto leva 3 adultos ou 500 kg, dispensa amarrações e pode ser usado consecutivamente; o sling é para uma vítima por vez." },
  { modulo: "SIM", tipo: "dissertativa", enunciado: "Descreva a evolução da aviação de segurança pública em Pernambuco (GRAer, CITAer e GTA) e as hipóteses de acionamento das aeronaves previstas no art. 3º do Decreto nº 33.321/2009. (Mínimo 05 e máximo 12 linhas) (Valor: 1,50)", modelo: { estrutura: "GRAer → CITAer → GTA → acionamento.", criterios: ["GRAer: helicóptero em 2000; Portaria SDS nº 182/2001; subordinado à SDS", "CITAer: Lei nº 12.544/2004; subordinada à PMPE", "GTA: Decreto nº 31.214/2007 (alterado em 2009); vinculado ao Gabinete do Secretário da SDS", "Acionamento: Chefe do GTA (imediatas), Operações Aéreas (planejadas), Governador/Secretários (qualquer hipótese)"], resposta: "Com a chegada do primeiro helicóptero da SDS, em dezembro de 2000, a Portaria do Gabinete da SDS nº 182/2001 regulamentou o Grupamento de Radiopatrulhamento Aéreo (GRAer), subordinado à SDS. Extinto o GRAer, a Lei nº 12.544/2004 criou a Companhia Independente Tático Aérea (CITAer), organização militar subordinada à PMPE. Em 2007, o Decreto nº 31.214, modificado pelo Decreto nº 33.321/2009, transferiu a CITAer para a SDS, que passou a denominar-se Grupamento Tático Aéreo (GTA), vinculado ao Gabinete do Secretário. Pelo art. 3º do Decreto nº 33.321/2009, o acionamento das aeronaves é feito pelo Chefe do GTA nas missões imediatas de radiopatrulhamento preventivo e repressivo e de salvamento; pelo responsável pelas Operações Aéreas nas missões planejadas, mediante ordem de serviço em plano de ação; e pelo Governador, pelo Secretário de Defesa Social e pelo Secretário Executivo de Defesa Social em qualquer hipótese, dentro e fora do Estado." } },
  { modulo: "SIM", tipo: "dissertativa", enunciado: "Conceitue segurança de voo e explique a filosofia SIPAER, citando seus órgãos de destaque (CENIPA, SERIPA e Elo-SIPAER) e ao menos quatro de seus princípios fundamentais. (Mínimo 05 e máximo 12 linhas) (Valor: 1,50)", modelo: { estrutura: "Conceito → SIPAER e órgãos → princípios.", criterios: ["Segurança de voo (NSCA 3-3) e segurança operacional (riscos controlados a nível aceitável)", "SIPAER: investigação e prevenção para evitar perdas de vidas e material", "CENIPA: órgão central normativo; SERIPA: regional, no COMAER (SERIPA II em Recife); Elo-SIPAER: subordinado ao mais alto cargo executivo", "Ao menos 4 princípios"], resposta: "Segurança de voo é a segurança operacional aplicada especificamente à atividade aérea, com o objetivo de prevenir ocorrências aeronáuticas (NSCA 3-3); segurança operacional é o estado em que os riscos da aviação são controlados e reduzidos a um nível aceitável. O SIPAER integra a infraestrutura aeronáutica e realiza a investigação e a prevenção de acidentes, tarefas destinadas a evitar perdas de vidas e de material. Seu órgão central é o CENIPA, responsável pela orientação normativa; o SERIPA é o serviço regional, parte do COMAER, representado no Nordeste pelo SERIPA II, em Recife; e o Elo-SIPAER é o órgão, setor ou cargo de segurança operacional de cada organização, subordinado ao seu mais alto cargo executivo. Entre seus princípios estão: todo acidente pode ser evitado; todo acidente resulta de vários eventos, nunca de causa isolada; todo acidente tem um precedente; e a alta direção é a principal responsável pela prevenção." } },
  { modulo: "SIM", tipo: "dissertativa", enunciado: "Uma guarnição deve preparar, em área urbana não homologada e à noite, a recepção de um helicóptero do GTA para resgate aeromédico de vítima grave. Descreva os procedimentos de seleção, balizamento e isolamento da ZPH, as recomendações de segurança na aproximação e embarque da equipe e os critérios que justificam o acionamento do resgate aéreo. (Mínimo 08 e máximo 15 linhas) (Valor: 2,00)", modelo: { estrutura: "Critérios de acionamento → seleção da ZPH → balizamento noturno → isolamento → aproximação e embarque.", criterios: ["Acionamento: terrestre prejudicial, vaga confirmada, clima, segurança, autonomia, compatibilidade clínica", "ZPH: 20x20 m, plana, sem obstáculos elevados e sem partículas soltas (brownout)", "Balizamento: local seguro e visível, sem cobertura, óculos e abafador, vento pelas costas, braços a 45º; pouso contra o vento; à noite, sinalizadores das viaturas", "Isolamento: curiosos afastados; viaturas e pessoas a 20 m; atenção aos rotores", "Aproximação e embarque: pela proa, autorizado, a 45º, agachado, sem cobertura, maca com cuidados redobrados; cinto; não tocar em nada; arma fria"], resposta: "O resgate aéreo se justifica quando o socorro terrestre puder prejudicar a vítima ou a equipe, desde que confirmada a vaga com a central de regulação e o hospital de destino, que o clima seja favorável, a operação segura, a autonomia da aeronave suficiente e o estado clínico compatível com o transporte aéreo. Para a ZPH, a guarnição escolhe área de no mínimo 20 m x 20 m, plana, livre de fios, antenas e edificações nas trajetórias e sem partículas soltas que causem brownout. O balizador se posiciona em local seguro e visível pela tripulação, sem cobertura, com óculos de proteção e abafador, de costas para o vento e com os braços elevados a 45 graus, já que o pouso deve ser contra o vento; por ser à noite, a área é sinalizada com os sinalizadores de emergência das viaturas. No isolamento, afastam-se curiosos e mantêm-se viaturas e pessoas que não vão embarcar a 20 metros, atentando para os rotores principal e de cauda, de difícil visualização. A equipe só se aproxima quando autorizada pelo tripulante, pela proa, a 45 graus, caminhando agachada, sem cobertura e com cuidados redobrados no transporte da maca; a bordo, mantém o cinto afivelado, não toca em nada além dele e conserva a arma fria até o desembarque." } },
]

// ── Validação antes de gravar ─────────────────────────────────────────────
function validar() {
  const erros: string[] = []
  const porMod = new Map<string, Q[]>()
  for (const q of QS) (porMod.get(q.modulo) ?? porMod.set(q.modulo, []).get(q.modulo)!).push(q)
  for (const [m, qs] of porMod) {
    const n = (t: string) => qs.filter(q => q.tipo === t).length
    const esperado = m === "SIM" ? [15, 4, 3] : [7, 3, 1]
    const real = [n("certo_errado"), n("multipla"), n("dissertativa")]
    if (real.join() !== esperado.join()) erros.push(`módulo ${m}: ${real.join("/")} (esperado ${esperado.join("/")})`)
    const vistos = new Set<string>()
    for (const q of qs) { if (vistos.has(q.enunciado)) erros.push(`módulo ${m}: enunciado repetido`); vistos.add(q.enunciado) }
  }
  for (const q of QS) {
    if (q.tipo === "multipla" && !q.alternativas.some(a => a.id === q.gabarito)) erros.push(`gabarito inválido: ${q.enunciado.slice(0, 50)}`)
    if (q.tipo !== "dissertativa" && !q.explicacao) erros.push(`sem explicação: ${q.enunciado.slice(0, 50)}`)
    if (q.tipo === "dissertativa" && !q.modelo.resposta) erros.push(`sem resposta-modelo: ${q.enunciado.slice(0, 50)}`)
  }
  if (erros.length) throw new Error("Validação falhou:\n" + erros.join("\n"))
  const dist: Record<string, number> = {}
  for (const q of QS) if (q.tipo === "multipla") dist[q.gabarito] = (dist[q.gabarito] ?? 0) + 1
  const vf = QS.filter(q => q.tipo === "certo_errado")
  console.log(`✓ ${QS.length} questões em ${porMod.size} módulos · múltiplas por letra ${JSON.stringify(dist)} · V/F: ${vf.filter(q => q.gabarito === "certo").length} certo / ${vf.filter(q => q.gabarito === "errado").length} errado`)
}

async function main() {
  validar()
  if (process.argv.includes("--dry-run")) return
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MAT } })
  if (!disc) throw new Error(`Disciplina ${MAT} não existe.`)

  let c = 0, u = 0
  for (const q of QS) {
    const hash = createHash("sha1").update(`${MAT}|${q.modulo}|${q.enunciado}`).digest("hex")
    const base: any = {
      materia: MAT, modulo: q.modulo, tipo: q.tipo, enunciado: q.enunciado, hash,
      contexto: ("contexto" in q && q.contexto) ? q.contexto : null,
      fonte: ("fonte" in q && q.fonte) ? q.fonte : FONTE_PADRAO,
    }
    if (q.tipo === "multipla") { base.alternativas = q.alternativas; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else if (q.tipo === "certo_errado") { base.alternativas = []; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else { base.alternativas = []; base.gabarito = ""; base.modelo = q.modelo }
    const exists = await prisma.questao.findUnique({ where: { hash } })
    await prisma.questao.upsert({ where: { hash }, update: base, create: base })
    exists ? u++ : c++
  }
  const tot = await prisma.questao.count({ where: { materia: MAT } })
  console.log(`${MAT}: ${c} criadas, ${u} atualizadas. Total ${MAT}: ${tot}.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
