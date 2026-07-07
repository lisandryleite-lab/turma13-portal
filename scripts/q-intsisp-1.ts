import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "INTSISP" // Inteligência e Sistema de Informação de Seg. Pública — 11 módulos (7 V/F + 3 MC + 1 dissertativa cada = 121 questões).

type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string; fonte?: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string; fonte?: string }
  | { modulo: string; tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string }; fonte?: string }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const QS: Q[] = [
  // ════════════════════ MÓDULO 1 — Fundamentos históricos da inteligência no Brasil ════════════════════
  { modulo: "1", tipo: "certo_errado", enunciado: "O Conselho de Defesa Nacional (CDN), criado em 1927, é apontado como precursor do Sistema Brasileiro de Inteligência (SISBIN).", gabarito: "certo", explicacao: "Correto. O CDN (1927) é o marco inicial e precursor do SISBIN." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O Serviço Federal de Informações e Contrainformações (SFICI) foi implementado em 1946.", gabarito: "certo", explicacao: "Correto. 1944 = SIC; 1946 = SFICI." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Em 1964, o SFICI foi substituído pelo Serviço Nacional de Informações (SNI).", gabarito: "certo", explicacao: "Correto. O SNI passou a exercer as funções de inteligência a partir de 1964." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O período de 1927 a 1964 é conhecido como Fase da Bipolaridade.", gabarito: "errado", explicacao: "Errado. 1927–1964 é a Fase EMBRIONÁRIA; a Bipolaridade vai de 1964 a 1990 (atuação do SNI)." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A atuação do SNI, de 1964 a 1990, corresponde à chamada Fase da Bipolaridade.", gabarito: "certo", explicacao: "Correto. O SNI atuou de 1964 a 1990, período da Fase da Bipolaridade." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A Política Nacional de Inteligência (PNI) foi aprovada em 2016, estabelecendo diretrizes e objetivos para a atividade de inteligência no país.", gabarito: "certo", explicacao: "Correto. A PNI foi aprovada em 2016." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A Fase Contemporânea da inteligência no Brasil compreende o período de 1990 a 1999.", gabarito: "errado", explicacao: "Errado. 1990–1999 é a Fase de TRANSIÇÃO; a Fase Contemporânea vai de 1999 até os dias atuais." },
  { modulo: "1", tipo: "multipla", enunciado: "Assinale a alternativa que associa CORRETAMENTE o período à respectiva fase da inteligência no Brasil:", alternativas: A(
    "1927–1964: Fase Embrionária",
    "1964–1990: Fase de Transição",
    "1990–1999: Fase da Bipolaridade",
    "1999–atual: Fase Embrionária",
    "1946–1964: Fase Contemporânea"),
    gabarito: "A", explicacao: "Embrionária (1927–1964), Bipolaridade (1964–1990), Transição (1990–1999) e Contemporânea (1999–atual)." },
  { modulo: "1", tipo: "multipla", enunciado: "O órgão de informações criado em 1944 foi o:", alternativas: A(
    "Serviço de Informações e Contrainformações (SIC)",
    "Serviço Federal de Informações e Contrainformações (SFICI)",
    "Serviço Nacional de Informações (SNI)",
    "Conselho de Defesa Nacional (CDN)",
    "Agência Brasileira de Inteligência (ABIN)"),
    gabarito: "A", explicacao: "1944 = SIC. O SFICI é de 1946; o SNI, de 1964; o CDN, de 1927." },
  { modulo: "1", tipo: "multipla", enunciado: "Sobre os marcos históricos, assinale a alternativa INCORRETA:", alternativas: A(
    "O SNI foi criado em 1946.",
    "O CDN foi criado em 1927.",
    "O SFICI foi substituído pelo SNI em 1964.",
    "A PNI foi aprovada em 2016.",
    "A Fase Embrionária vai de 1927 a 1964."),
    gabarito: "A", explicacao: "A INCORRETA é 'A': o SNI foi criado em 1964 (não 1946). Em 1946 surgiu o SFICI." },
  { modulo: "1", tipo: "dissertativa", enunciado: "Apresente as quatro fases históricas da atividade de inteligência no Brasil, indicando seus períodos e um marco de cada uma.", modelo: { estrutura: "Embrionária → Bipolaridade → Transição → Contemporânea.", criterios: ["Embrionária: 1927–1964 (CDN/SIC/SFICI)", "Bipolaridade: 1964–1990 (SNI)", "Transição: 1990–1999", "Contemporânea: 1999–atual (PNI em 2016)"], resposta: "A atividade de inteligência no Brasil divide-se em quatro fases: (1) Fase Embrionária (1927–1964), marcada pela criação do CDN (1927), do SIC (1944) e do SFICI (1946); (2) Fase da Bipolaridade (1964–1990), correspondente à atuação do Serviço Nacional de Informações (SNI), que substituiu o SFICI; (3) Fase de Transição (1990–1999); e (4) Fase Contemporânea (1999 até os dias atuais), em que se destaca a aprovação da Política Nacional de Inteligência (PNI) em 2016." } },

  // ════════════════════ MÓDULO 2 — Sistema Brasileiro de Inteligência (SISBIN / ABIN) ════════════════════
  { modulo: "2", tipo: "certo_errado", enunciado: "A Lei nº 9.883/1999 criou a Agência Brasileira de Inteligência (ABIN) e o Sistema Brasileiro de Inteligência (SISBIN).", gabarito: "certo", explicacao: "Correto. A Lei nº 9.883/1999 instituiu o SISBIN e criou a ABIN." },
  { modulo: "2", tipo: "certo_errado", enunciado: "O objetivo do SISBIN é integrar as ações de planejamento e execução das atividades de inteligência do país, fornecendo subsídios ao Presidente da República em assuntos de interesse nacional.", gabarito: "certo", explicacao: "Correto. É exatamente o objetivo legal do SISBIN." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A ABIN é o órgão central do Sistema, responsável por planejar, executar, coordenar, supervisionar e controlar as atividades de inteligência do país.", gabarito: "certo", explicacao: "Correto. A ABIN é o órgão central do SISBIN." },
  { modulo: "2", tipo: "certo_errado", enunciado: "O controle e a fiscalização externos das atividades de inteligência são realizados pelo Poder Judiciário.", gabarito: "errado", explicacao: "Errado. O controle e a fiscalização externos cabem ao Poder LEGISLATIVO." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A execução da Política Nacional de Inteligência é de responsabilidade da ABIN, supervisionada pela Câmara de Relações Exteriores e Defesa Nacional do Conselho de Governo.", gabarito: "certo", explicacao: "Correto. A ABIN executa a PNI sob supervisão da referida Câmara do Conselho de Governo." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A ABIN pode se comunicar livremente com qualquer órgão da Administração Pública, independentemente de conhecimento prévio da autoridade superior do órgão respectivo.", gabarito: "errado", explicacao: "Errado. A comunicação exige o CONHECIMENTO PRÉVIO da autoridade superior do órgão respectivo." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Além das atividades de inteligência, a ABIN é responsável pela proteção de conhecimentos sensíveis, pela avaliação de ameaças à ordem institucional e pelo desenvolvimento de recursos humanos.", gabarito: "certo", explicacao: "Correto. São atribuições da ABIN como órgão central." },
  { modulo: "2", tipo: "multipla", enunciado: "Nos termos da Lei nº 9.883/1999, o SISBIN tem como objetivo integrar as ações de planejamento e execução da inteligência, fornecendo subsídios a quem, em assuntos de interesse nacional?", alternativas: A(
    "ao Presidente da República",
    "ao Congresso Nacional",
    "ao Supremo Tribunal Federal",
    "aos Governadores dos Estados",
    "ao Ministério Público"),
    gabarito: "A", explicacao: "Os subsídios são fornecidos ao Presidente da República." },
  { modulo: "2", tipo: "multipla", enunciado: "Assinale a alternativa que NÃO corresponde a uma atribuição da ABIN como órgão central do SISBIN:", alternativas: A(
    "Realizar o controle e a fiscalização externos das atividades de inteligência.",
    "Planejar e executar as atividades de inteligência do país.",
    "Proteger conhecimentos sensíveis relativos aos interesses do Estado e da Sociedade.",
    "Avaliar ameaças à ordem institucional.",
    "Coordenar, supervisionar e controlar as atividades de inteligência."),
    gabarito: "A", explicacao: "O controle e a fiscalização EXTERNOS cabem ao Legislativo, não à ABIN. As demais são atribuições da ABIN." },
  { modulo: "2", tipo: "multipla", enunciado: "No Subsistema de Inteligência de Segurança Pública, o órgão central é a:", alternativas: A(
    "SENASP",
    "ABIN",
    "Polícia Federal",
    "Casa Civil",
    "Câmara de Relações Exteriores e Defesa Nacional"),
    gabarito: "A", explicacao: "A SENASP é o órgão central do Subsistema de Inteligência de Segurança Pública." },
  { modulo: "2", tipo: "dissertativa", enunciado: "Explique o papel da ABIN no SISBIN e diferencie, no âmbito da Lei nº 9.883/1999, a supervisão da execução da PNI do controle externo das atividades de inteligência.", modelo: { estrutura: "ABIN órgão central → PNI supervisionada pela Câmara → controle externo pelo Legislativo.", criterios: ["ABIN é o órgão central (planeja/executa/coordena/supervisiona/controla)", "Executa a PNI sob supervisão da Câmara de Rel. Ext. e Def. Nacional do Conselho de Governo", "Controle e fiscalização EXTERNOS = Legislativo", "Comunicação com órgãos exige conhecimento prévio da autoridade superior"], resposta: "A ABIN é o órgão central do SISBIN, responsável por planejar, executar, coordenar, supervisionar e controlar as atividades de inteligência do país, além de proteger conhecimentos sensíveis, avaliar ameaças à ordem institucional e desenvolver recursos humanos. A execução da Política Nacional de Inteligência (PNI) é de sua responsabilidade e é supervisionada pela Câmara de Relações Exteriores e Defesa Nacional do Conselho de Governo. Isso não se confunde com o controle e a fiscalização EXTERNOS das atividades de inteligência, que são realizados pelo Poder Legislativo. Registre-se, ainda, que a ABIN só se comunica com outros órgãos da Administração Pública com o conhecimento prévio da autoridade superior do órgão respectivo." } },

  // ════════════════════ MÓDULO 3 — Sistema Estadual de Inteligência (SEINSP / CIIDS / SIPOM) ════════════════════
  { modulo: "3", tipo: "certo_errado", enunciado: "O Sistema Estadual de Inteligência (SEINSP) foi instituído pela Lei nº 13.241, de 2007.", gabarito: "certo", explicacao: "Correto. A Lei nº 13.241/2007 instituiu o SEINSP em Pernambuco." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O Centro Integrado de Inteligência de Defesa Social (CIIDS) é o órgão responsável pela coordenação, planejamento e execução no âmbito do SEINSP.", gabarito: "certo", explicacao: "Correto. O CIIDS coordena, planeja e executa no SEINSP." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O chefe do CIIDS é, por definição, um oficial da Polícia Militar.", gabarito: "errado", explicacao: "Errado. O chefe do CIIDS é um Delegado da Polícia Civil." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Cada subsistema do SEINSP possui uma Agência Central de Inteligência responsável pela coordenação das atividades de inteligência daquele órgão.", gabarito: "certo", explicacao: "Correto. Cada subsistema (PM, PC, Sistema Prisional, CBM etc.) tem sua Agência Central de Inteligência." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O SIPOM é o subsistema de inteligência da PMPE, com a função de coordenar e executar atividades de inteligência e contrainteligência voltadas à prevenção e repressão de crimes.", gabarito: "certo", explicacao: "Correto. O SIPOM é o subsistema da PMPE." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Órgãos sem unidades de inteligência estão impedidos de integrar o SISBIN em qualquer hipótese.", gabarito: "errado", explicacao: "Errado. Podem integrar o SISBIN como ASSOCIADOS, seguindo procedimentos estabelecidos pela ABIN." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O ingresso de um órgão como dedicado ou associado promove a profissionalização e a segurança no SISBIN, permitindo a incorporação de órgãos estaduais.", gabarito: "certo", explicacao: "Correto. Dedicado ou associado promove profissionalização e segurança." },
  { modulo: "3", tipo: "multipla", enunciado: "Sobre o SEINSP, assinale a alternativa CORRETA:", alternativas: A(
    "O CIIDS é o órgão responsável pela coordenação, planejamento e execução, sendo seu chefe um Delegado da Polícia Civil.",
    "O SEINSP foi instituído pela Lei nº 9.883/1999.",
    "O chefe do CIIDS é sempre um oficial do Corpo de Bombeiros.",
    "Cada subsistema é coordenado diretamente pela ABIN.",
    "O SEINSP é composto por um único subsistema, o da Polícia Militar."),
    gabarito: "A", explicacao: "O CIIDS coordena/planeja/executa e é chefiado por Delegado PC. O SEINSP é da Lei 13.241/2007 e é composto por vários subsistemas." },
  { modulo: "3", tipo: "multipla", enunciado: "São exemplos de subsistemas que compõem o SEINSP, EXCETO:", alternativas: A(
    "Agência Brasileira de Inteligência (ABIN)",
    "Polícia Militar",
    "Polícia Civil",
    "Sistema Prisional",
    "Corpo de Bombeiros Militar"),
    gabarito: "A", explicacao: "A ABIN é federal (órgão central do SISBIN), não um subsistema do SEINSP estadual." },
  { modulo: "3", tipo: "multipla", enunciado: "A função do SIPOM, subsistema da PMPE, é:", alternativas: A(
    "coordenar e executar atividades de inteligência e contrainteligência para prevenção e repressão de crimes, de forma integrada",
    "julgar transgressões disciplinares dos policiais militares",
    "substituir a ABIN nos assuntos de interesse nacional",
    "executar exclusivamente a investigação criminal reativa",
    "fiscalizar externamente as atividades de inteligência do Estado"),
    gabarito: "A", explicacao: "O SIPOM coordena e executa inteligência e contrainteligência, atuando de forma integrada para prevenção e repressão de crimes." },
  { modulo: "3", tipo: "dissertativa", enunciado: "Caracterize o SEINSP, indicando a lei que o instituiu, o órgão responsável pela coordenação/planejamento/execução e a estrutura em subsistemas.", modelo: { estrutura: "Lei 13.241/2007 → CIIDS (chefe Delegado PC) → subsistemas com Agências Centrais → SIPOM na PMPE.", criterios: ["Lei nº 13.241/2007", "CIIDS coordena/planeja/executa; chefe = Delegado PC", "Composto por subsistemas (PM, PC, Prisional, CBM, Casa Militar etc.)", "Cada subsistema tem Agência Central de Inteligência; PMPE = SIPOM"], resposta: "O Sistema Estadual de Inteligência (SEINSP) foi instituído pela Lei nº 13.241/2007. O órgão responsável pela coordenação, planejamento e execução é o Centro Integrado de Inteligência de Defesa Social (CIIDS), cujo chefe é um Delegado da Polícia Civil. O SEINSP é composto por diversos subsistemas — Polícia Militar, Polícia Civil, Sistema Prisional, Corpo de Bombeiros Militar, Casa Militar, entre outros —, e cada subsistema possui uma Agência Central de Inteligência responsável pela coordenação de suas atividades. Na PMPE, esse subsistema é o SIPOM." } },

  // ════════════════════ MÓDULO 4 — Fundamentos doutrinários e ética ════════════════════
  { modulo: "4", tipo: "certo_errado", enunciado: "A inteligência é responsável pela produção e disseminação de conhecimento sobre eventos e situações que possam influenciar o processo decisório e a ação governamental.", gabarito: "certo", explicacao: "Correto. É a definição doutrinária do ramo inteligência." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Eventos são processos compostos pela evolução de fatos, eventos e situações ao longo do tempo.", gabarito: "errado", explicacao: "Errado. Essa é a definição de FENÔMENOS. Eventos envolvem contextos, estruturas e atores, interpretados a partir das experiências compartilhadas pela sociedade." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Fenômenos são processos compostos pela evolução de fatos, eventos e situações ao longo do tempo.", gabarito: "certo", explicacao: "Correto. Fenômenos = evolução de fatos, eventos e situações no tempo." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Ação adversa é a ação intencional que busca, ilegitimamente, acessar informações sensíveis, ameaçando a segurança de pessoas e instituições.", gabarito: "certo", explicacao: "Correto. É a definição de ação adversa." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Na atividade de inteligência, o comportamento ético permite o controle interno, exercido pelo próprio profissional, com base em sua consciência.", gabarito: "certo", explicacao: "Correto. A ética viabiliza o controle interno individual, baseado na consciência." },
  { modulo: "4", tipo: "certo_errado", enunciado: "A exigência de conduta ética limita-se à vida profissional do agente de inteligência, não alcançando sua vida pessoal.", gabarito: "errado", explicacao: "Errado. O profissional deve agir eticamente tanto na vida profissional quanto na pessoal." },
  { modulo: "4", tipo: "certo_errado", enunciado: "A transparência ativa, embora limitada por questões de segurança, deve ser assegurada sempre que possível, mantendo-se o sigilo quando sua divulgação puder comprometer as ações de inteligência.", gabarito: "certo", explicacao: "Correto. Transparência sempre que possível; sigilo quando comprometer as ações." },
  { modulo: "4", tipo: "multipla", enunciado: "Assinale a alternativa que conceitua corretamente EVENTOS na doutrina de inteligência:", alternativas: A(
    "Envolvem contextos, estruturas e atores, interpretados com base nas experiências compartilhadas pela sociedade.",
    "São processos compostos pela evolução de fatos ao longo do tempo.",
    "São ações intencionais que buscam acessar informações sensíveis.",
    "São medidas de salvaguarda de conhecimentos sensíveis.",
    "São a menor unidade de representação da realidade."),
    gabarito: "A", explicacao: "Eventos = contextos, estruturas e atores. A alternativa B define fenômenos; C, ação adversa; E, dado." },
  { modulo: "4", tipo: "multipla", enunciado: "Sobre a ética na atividade de inteligência, é CORRETO afirmar que:", alternativas: A(
    "permite o controle interno exercido pelo próprio profissional, com base em sua consciência, aplicando-se à vida profissional e pessoal",
    "dispensa a conduta ética na vida pessoal do agente",
    "autoriza o uso pessoal de ferramentas e sistemas institucionais",
    "permite o atendimento de demandas externas às missões institucionais",
    "substitui integralmente o controle externo pelo Legislativo"),
    gabarito: "A", explicacao: "A ética viabiliza o controle interno pela consciência do próprio profissional, na vida profissional e pessoal; veda uso pessoal de ferramentas e demandas externas às missões." },
  { modulo: "4", tipo: "multipla", enunciado: "A atividade de inteligência lida, entre outros, com:", alternativas: A(
    "obtenção de dados, proteção de informações sensíveis e prevenção de ações de inteligência adversa",
    "apenas a repressão a crimes já consumados",
    "exclusivamente a produção estatística criminal",
    "somente a fiscalização externa do Legislativo",
    "apenas a formação acadêmica de servidores"),
    gabarito: "A", explicacao: "A inteligência lida com obtenção de dados, proteção de informações sensíveis e prevenção de ações de inteligência adversa." },
  { modulo: "4", tipo: "dissertativa", enunciado: "Diferencie 'eventos' de 'fenômenos' na doutrina de inteligência e explique o papel da ética como forma de controle interno.", modelo: { estrutura: "Eventos × fenômenos → ética/controle interno.", criterios: ["Eventos: contextos, estruturas e atores interpretados por experiências compartilhadas", "Fenômenos: processos compostos pela evolução de fatos, eventos e situações no tempo", "Ética permite controle interno pelo próprio profissional (consciência)", "Vale para a vida profissional e pessoal"], resposta: "Eventos envolvem contextos, estruturas e atores e são interpretados com base nas experiências compartilhadas pela sociedade; fenômenos, por sua vez, são processos compostos pela evolução de fatos, eventos e situações ao longo do tempo. Quanto à ética, ela é fundamental na atividade de inteligência porque permite o controle interno, exercido pelo próprio profissional a partir de sua consciência. Esse dever ético alcança tanto a vida profissional quanto a pessoal do agente, e impõe regras como a vedação ao uso pessoal de ferramentas e sistemas e ao atendimento de demandas externas às missões institucionais." } },

  // ════════════════════ MÓDULO 5 — Princípios e valores ════════════════════
  { modulo: "5", tipo: "certo_errado", enunciado: "O princípio da Rastreabilidade exige registros que permitam a auditoria da atividade de inteligência.", gabarito: "certo", explicacao: "Correto. Rastreabilidade → registros para auditoria." },
  { modulo: "5", tipo: "certo_errado", enunciado: "O princípio da Oportunidade determina a produção de resultados em prazo adequado.", gabarito: "certo", explicacao: "Correto. Oportunidade = resultados em tempo/prazo adequado." },
  { modulo: "5", tipo: "certo_errado", enunciado: "O princípio da Simplicidade orienta a atuação com objetivos claros a fim de evitar desperdícios.", gabarito: "errado", explicacao: "Errado. Objetivos claros para evitar desperdícios é a OBJETIVIDADE. Simplicidade = minimizar complexidade, custos e riscos desnecessários." },
  { modulo: "5", tipo: "certo_errado", enunciado: "O princípio do Controle exige supervisão para garantir a conformidade e a finalidade correta da atividade.", gabarito: "certo", explicacao: "Correto. Controle → supervisão, conformidade e finalidade correta." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A Formação Contínua dos profissionais é um dos valores da atividade de inteligência.", gabarito: "certo", explicacao: "Correto. É um dos 4 valores (junto de confiabilidade da segurança, pensamento crítico e orientação a resultados)." },
  { modulo: "5", tipo: "certo_errado", enunciado: "No elemento de análise, o princípio orientador de maior relevância é a Segurança, para evitar vieses na produção.", gabarito: "errado", explicacao: "Errado. Na análise, o princípio relevante é a OBJETIVIDADE (evitar vieses). A segurança é destacada na execução de ações sigilosas; a oportunidade, nas operações." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A orientação a resultados envolve as duas funções do profissional de inteligência: informar e executar.", gabarito: "certo", explicacao: "Correto. As duas funções são informar e executar, assessorando o processo decisório." },
  { modulo: "5", tipo: "multipla", enunciado: "Relacione corretamente o princípio da atividade de inteligência à sua ideia-chave:", alternativas: A(
    "Cooperação → trabalho em equipe e otimização de esforços",
    "Utilidade → registros para auditoria",
    "Segurança → resultados em prazo adequado",
    "Controle → minimizar complexidade e custos",
    "Objetividade → proteção de informações e ações"),
    gabarito: "A", explicacao: "Cooperação = trabalho em equipe/otimização de esforços. Utilidade = atender ao usuário; Oportunidade = prazo; Simplicidade = minimizar custos; Segurança = proteger informações." },
  { modulo: "5", tipo: "multipla", enunciado: "São VALORES da atividade de inteligência, EXCETO:", alternativas: A(
    "Rastreabilidade",
    "Formação contínua",
    "Confiabilidade da segurança",
    "Pensamento crítico",
    "Orientação a resultados"),
    gabarito: "A", explicacao: "Rastreabilidade é PRINCÍPIO, não valor. Os 4 valores são formação contínua, confiabilidade da segurança, pensamento crítico e orientação a resultados." },
  { modulo: "5", tipo: "multipla", enunciado: "O valor que consiste na forma de pensar em que o sujeito questiona constantemente o próprio ato de pensar, aumentando a qualidade da resposta racional, é:", alternativas: A(
    "pensamento crítico",
    "formação contínua",
    "orientação a resultados",
    "confiabilidade da segurança",
    "rastreabilidade"),
    gabarito: "A", explicacao: "O pensamento crítico é o questionamento constante do próprio ato de pensar, tornando o profissional consciente do modelo mental que compromete a imparcialidade." },
  { modulo: "5", tipo: "dissertativa", enunciado: "Cite os princípios gerais da atividade de inteligência e explique três deles: Objetividade, Rastreabilidade e Segurança.", modelo: { estrutura: "Lista dos princípios → conceito de Objetividade, Rastreabilidade e Segurança.", criterios: ["Citar princípios: Controle, Cooperação, Objetividade, Oportunidade, Rastreabilidade, Segurança, Simplicidade e Utilidade", "Objetividade: objetivos claros, evitar desperdícios/vieses", "Rastreabilidade: registros para auditoria", "Segurança: proteger informações e ações"], resposta: "São princípios gerais da atividade de inteligência: Controle, Cooperação, Objetividade, Oportunidade, Rastreabilidade, Segurança, Simplicidade e Utilidade. A Objetividade orienta a atuação com objetivos claros, evitando desperdícios e vieses na produção. A Rastreabilidade exige o registro dos procedimentos, de modo a permitir a auditoria da atividade. A Segurança impõe a proteção das informações e das ações, sendo especialmente relevante na execução de ações sigilosas, para resguardar a equipe e o órgão de inteligência." } },

  // ════════════════════ MÓDULO 6 — Ramo Inteligência e classificações ════════════════════
  { modulo: "6", tipo: "certo_errado", enunciado: "O ramo da inteligência é focado na função informacional: seus profissionais obtêm, processam e difundem dados e conhecimentos.", gabarito: "certo", explicacao: "Correto. O ramo inteligência é informacional." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A Inteligência Estratégica analisa fenômenos com potencial para impactar objetivos do Estado.", gabarito: "certo", explicacao: "Correto. É a classificação por propósito 'Estratégica'." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A Inteligência de Alerta, classificada por recorte temporal, mantém as autoridades atualizadas sobre eventos em progresso e sua evolução.", gabarito: "errado", explicacao: "Errado. Manter autoridades atualizadas sobre eventos em progresso é a Inteligência CORRENTE. A de Alerta visa ANTECIPAR eventos." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A Inteligência Prospectiva oferece cenários futuros para assessorar a ação estatal.", gabarito: "certo", explicacao: "Correto. Prospectiva = cenários futuros." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A Inteligência de Fontes Humanas tem entre seus desafios tratar as falhas de percepção e as simplificações heurísticas.", gabarito: "certo", explicacao: "Correto. HUMINT enfrenta falhas de percepção e simplificações heurísticas." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Os diversos tipos de classificação da inteligência são excludentes entre si, não sendo possível combinar propósito, recorte temporal e fontes num mesmo conhecimento.", gabarito: "errado", explicacao: "Errado. As classificações NÃO são excludentes — permitem combinações (ex.: variar em propósito e recorte temporal e conter dados de origens diversas)." },
  { modulo: "6", tipo: "certo_errado", enunciado: "As áreas de atuação da inteligência no Brasil são: externa, interna, transnacional e cibernética.", gabarito: "certo", explicacao: "Correto. São as quatro áreas de atuação." },
  { modulo: "6", tipo: "multipla", enunciado: "Assinale a alternativa que associa CORRETAMENTE o tipo de inteligência por propósito à sua descrição:", alternativas: A(
    "Operacional → oferece contextualização para ação pontual do Estado",
    "Base → analisa fenômenos com potencial de impactar objetivos do Estado",
    "Tática → visa a compreensão e contextualização de temas acompanhados",
    "Estratégica → oferece contextualização para ação pontual do Estado",
    "Base → assessora decisões sobre políticas governamentais"),
    gabarito: "A", explicacao: "Operacional = ação pontual. Base = compreensão/contextualização; Estratégica = fenômenos que impactam objetivos; Tática = assessora decisões sobre políticas." },
  { modulo: "6", tipo: "multipla", enunciado: "São subcategorias da Inteligência de Fontes Técnicas:", alternativas: A(
    "Sigint, Imint, Geoint e Masint",
    "HUMINT, OSINT e TECHINT",
    "Base, Tática, Estratégica e Operacional",
    "Alerta, Corrente, Explanativa e Prospectiva",
    "Correspondência, coerência e consenso"),
    gabarito: "A", explicacao: "As subcategorias das fontes técnicas são Sigint, Imint, Geoint e Masint." },
  { modulo: "6", tipo: "multipla", enunciado: "A Inteligência de Fontes Abertas (OSINT) caracteriza-se por:", alternativas: A(
    "basear-se em dados disponíveis, demandando muito tempo de pesquisa e constante atualização",
    "basear-se exclusivamente em dados obtidos de pessoas",
    "utilizar apenas meios técnicos de coleta",
    "dispensar qualquer atualização após a coleta inicial",
    "ser incompatível com as demais fontes"),
    gabarito: "A", explicacao: "A OSINT usa dados disponíveis (abertos), demandando muito tempo de pesquisa e atualização constante." },
  { modulo: "6", tipo: "dissertativa", enunciado: "Explique a classificação da inteligência por RECORTE TEMPORAL, apresentando os tipos de Alerta, Corrente, Explanativa e Prospectiva.", modelo: { estrutura: "Alerta → Corrente → Explanativa → Prospectiva.", criterios: ["Alerta: antecipar eventos que impactem objetivos constitucionais, ordem e segurança", "Corrente: mantém autoridades atualizadas sobre eventos em progresso", "Explanativa: assessora o processo decisório sobre fatos/eventos/situações/fenômenos", "Prospectiva: oferece cenários futuros para assessorar a ação estatal"], resposta: "Na classificação por recorte temporal, a Inteligência de Alerta visa antecipar eventos que possam impactar objetivos constitucionais, a ordem nacional e a segurança. A Inteligência Corrente mantém as autoridades atualizadas sobre eventos em progresso e sua evolução. A Inteligência Explanativa assessora o processo decisório sobre fatos, eventos, situações e fenômenos. Por fim, a Inteligência Prospectiva oferece cenários futuros para assessorar a ação estatal." } },

  // ════════════════════ MÓDULO 7 — Ciclo de Inteligência ════════════════════
  { modulo: "7", tipo: "certo_errado", enunciado: "O Ciclo de Inteligência é composto por cinco fases: Objetivar, Acompanhar, Informar, Decidir e Agir.", gabarito: "certo", explicacao: "Correto. São 5 fases que se retroalimentam." },
  { modulo: "7", tipo: "certo_errado", enunciado: "As fases do Ciclo de Inteligência se retroalimentam, cada uma desempenhando papel fundamental na assessoria ao processo decisório.", gabarito: "certo", explicacao: "Correto. O ciclo é retroalimentado." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A fase Objetivar consiste em pôr em prática aquilo que foi decidido.", gabarito: "errado", explicacao: "Errado. Pôr em prática o que foi decidido é a fase AGIR. Objetivar = determinar temas, recortes, abordagens e áreas a serem cobertas." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A fase Acompanhar ocorre de forma permanente e envolve o planejamento, a reunião e o processamento de dados e conhecimentos.", gabarito: "certo", explicacao: "Correto. Acompanhar é permanente e envolve planejamento, reunião e processamento." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A fase Informar consiste na formatação e difusão do conhecimento produzido, para assessorar as instâncias governamentais.", gabarito: "certo", explicacao: "Correto. Informar = formatar e difundir o conhecimento." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Na fase Decidir, ocorre a determinação dos temas e recortes a serem trabalhados pela inteligência.", gabarito: "errado", explicacao: "Errado. Determinar temas e recortes é a fase OBJETIVAR. Decidir = tomada de decisão conforme as informações obtidas." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A fase Agir corresponde a pôr em prática aquilo que fora decidido.", gabarito: "certo", explicacao: "Correto. Agir = executar o que foi decidido." },
  { modulo: "7", tipo: "multipla", enunciado: "Assinale a sequência CORRETA das fases do Ciclo de Inteligência:", alternativas: A(
    "Objetivar → Acompanhar → Informar → Decidir → Agir",
    "Acompanhar → Orientar → Detectar → Avaliar → Decidir → Agir",
    "Planejamento → Reunião → Avaliação → Difusão",
    "Objetivar → Informar → Acompanhar → Agir → Decidir",
    "Coleta → Análise → Disseminação"),
    gabarito: "A", explicacao: "A ordem é Objetivar, Acompanhar, Informar, Decidir e Agir. A opção B é o ciclo de contrainteligência." },
  { modulo: "7", tipo: "multipla", enunciado: "A fase do Ciclo de Inteligência que envolve a determinação dos temas, recortes e abordagens, além da definição das áreas a serem cobertas, é:", alternativas: A(
    "Objetivar",
    "Acompanhar",
    "Informar",
    "Decidir",
    "Agir"),
    gabarito: "A", explicacao: "Objetivar define temas, recortes, abordagens e áreas de cobertura." },
  { modulo: "7", tipo: "multipla", enunciado: "Assinale a alternativa que descreve corretamente a fase INFORMAR:", alternativas: A(
    "formatação e difusão do conhecimento produzido para assessorar as instâncias governamentais",
    "tomada de decisão de acordo com as informações obtidas",
    "planejamento, reunião e processamento permanente de dados",
    "execução prática daquilo que foi decidido",
    "definição das áreas a serem cobertas pela inteligência"),
    gabarito: "A", explicacao: "Informar = formatar e difundir o conhecimento para assessorar as instâncias governamentais." },
  { modulo: "7", tipo: "dissertativa", enunciado: "Descreva as cinco fases do Ciclo de Inteligência, destacando qual delas ocorre de forma permanente.", modelo: { estrutura: "Objetivar → Acompanhar (permanente) → Informar → Decidir → Agir.", criterios: ["Objetivar: temas, recortes, abordagens e áreas", "Acompanhar: PERMANENTE — planejamento, reunião e processamento", "Informar: formatação e difusão do conhecimento", "Decidir: decisão conforme informações; Agir: executar o decidido"], resposta: "O Ciclo de Inteligência compreende cinco fases que se retroalimentam: (1) Objetivar — determinação dos temas, recortes e abordagens, bem como a definição das áreas a serem cobertas; (2) Acompanhar — que ocorre de forma PERMANENTE e envolve o planejamento, a reunião e o processamento de dados e conhecimentos; (3) Informar — formatação e difusão do conhecimento produzido para assessorar as instâncias governamentais; (4) Decidir — tomada de decisão de acordo com as informações obtidas; e (5) Agir — pôr em prática aquilo que foi decidido." } },

  // ════════════════════ MÓDULO 8 — Contrainteligência ════════════════════
  { modulo: "8", tipo: "certo_errado", enunciado: "O ramo da contrainteligência dedica-se a prevenir, detectar e neutralizar ameaças à segurança do Estado e da sociedade, atuando nas vertentes preventiva e ativa.", gabarito: "certo", explicacao: "Correto. CI = prevenir, detectar e neutralizar; vertentes preventiva e ativa." },
  { modulo: "8", tipo: "certo_errado", enunciado: "A contrainteligência preventiva busca garantir a disponibilidade, a integridade, o sigilo e a autenticidade dos conhecimentos.", gabarito: "certo", explicacao: "Correto. São os atributos protegidos pela CI preventiva." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Ao avaliar potenciais ações adversas, devem ser considerados os critérios: abrangência, grau de influência, grau de violência e potencial de coerção.", gabarito: "certo", explicacao: "Correto. São os quatro critérios de avaliação das ações adversas." },
  { modulo: "8", tipo: "certo_errado", enunciado: "A contrainsurgência é a vertente da contrainteligência ativa destinada a neutralizar ações de espionagem.", gabarito: "errado", explicacao: "Errado. Neutralizar espionagem é a CONTRAESPIONAGEM. A contrainsurgência neutraliza ações de pessoas e grupos insurgentes." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Contrainteligência e segurança se confundem, pois ambas visam prevenir e contrapor-se a ações de inteligência adversa.", gabarito: "errado", explicacao: "Errado. Não se confundem: a segurança mantém o equilíbrio para ações cotidianas/extraordinárias; a CI previne e contrapõe ações de inteligência adversa." },
  { modulo: "8", tipo: "certo_errado", enunciado: "A segurança orgânica é interna às organizações e incorpora as vertentes da contrainteligência, coordenando a gestão da segurança institucional.", gabarito: "certo", explicacao: "Correto. Segurança orgânica é interna e incorpora as vertentes da CI." },
  { modulo: "8", tipo: "certo_errado", enunciado: "O Ciclo de Contrainteligência é composto por seis fases: Acompanhar, Orientar, Detectar, Avaliar, Decidir e Agir.", gabarito: "certo", explicacao: "Correto. São 6 fases; acompanhar e orientar são permanentes." },
  { modulo: "8", tipo: "multipla", enunciado: "No Ciclo de Contrainteligência, quais fases são PERMANENTES?", alternativas: A(
    "Acompanhar e Orientar",
    "Detectar e Avaliar",
    "Decidir e Agir",
    "Objetivar e Informar",
    "Avaliar e Agir"),
    gabarito: "A", explicacao: "Acompanhar e Orientar são permanentes; as demais fases são acionadas quando uma ação adversa é percebida." },
  { modulo: "8", tipo: "multipla", enunciado: "Assinale a alternativa que associa CORRETAMENTE a vertente da contrainteligência ativa à sua finalidade:", alternativas: A(
    "Contraterrorismo → neutralizar ações de pessoas e grupos extremistas violentos",
    "Contraespionagem → neutralizar ações de interferência externa",
    "Contrainterferência → neutralizar ações de grupos insurgentes",
    "Contrainsurgência → detectar e neutralizar ações de espionagem",
    "Contraterrorismo → salvaguardar conhecimentos sensíveis"),
    gabarito: "A", explicacao: "Contraterrorismo = grupos extremistas violentos. Contraespionagem = espionagem; contrainterferência = interferência externa; contrainsurgência = grupos insurgentes." },
  { modulo: "8", tipo: "multipla", enunciado: "A contrainteligência PREVENTIVA tem por objeto:", alternativas: A(
    "proteger conhecimentos sensíveis e infraestruturas críticas e prevenir ações de interferência sobre a decisão",
    "detectar o agente adverso e neutralizar sua atuação por meio da contraespionagem",
    "manter o equilíbrio para a realização das ações cotidianas da organização",
    "difundir o conhecimento de inteligência às instâncias governamentais",
    "reconstruir eventos passados para responsabilizar autores de crimes"),
    gabarito: "A", explicacao: "A CI preventiva protege conhecimentos sensíveis e infraestruturas críticas e previne ações de interferência sobre a decisão. A opção B é da CI ativa." },
  { modulo: "8", tipo: "dissertativa", enunciado: "Diferencie a contrainteligência preventiva da ativa e explique por que a contrainteligência não se confunde com a segurança.", modelo: { estrutura: "Preventiva × Ativa → CI ≠ segurança.", criterios: ["Preventiva: salvaguarda de conhecimentos sensíveis e infraestruturas críticas; disponibilidade, integridade, sigilo, autenticidade", "Ativa: contraespionagem, contrainterferência, contrainsurgência e contraterrorismo (detectar/obstruir/neutralizar)", "Segurança: mantém o equilíbrio para ações cotidianas/extraordinárias", "CI: previne e contrapõe ações de inteligência adversa"], resposta: "A contrainteligência preventiva visa proteger conhecimentos sensíveis e infraestruturas críticas e prevenir ações de interferência sobre a decisão, buscando garantir a disponibilidade, a integridade, o sigilo e a autenticidade dos conhecimentos. Já a contrainteligência ativa compreende ações de contraespionagem, contrainterferência, contrainsurgência e contraterrorismo, destinadas a detectar a ação adversa, identificar o agente e avaliar, obstruir e neutralizar a atuação da inteligência adversa. A contrainteligência não se confunde com a segurança: enquanto a segurança se concentra na manutenção do equilíbrio para a realização de ações cotidianas ou extraordinárias, a contrainteligência visa especificamente prevenir e contrapor-se às ações de inteligência adversa." } },

  // ════════════════════ MÓDULO 9 — Elemento de análise: dado × informação × conhecimento ════════════════════
  { modulo: "9", tipo: "certo_errado", enunciado: "O elemento de análise é responsável por transformar dados e informações em produtos úteis ao processo decisório nacional.", gabarito: "certo", explicacao: "Correto. É a função do elemento de análise." },
  { modulo: "9", tipo: "certo_errado", enunciado: "O conhecimento é derivado da combinação de três elementos: realidade, perspectiva do sujeito e intersubjetividade.", gabarito: "certo", explicacao: "Correto. São os três elementos que originam o conhecimento." },
  { modulo: "9", tipo: "certo_errado", enunciado: "A busca da verdade depende de três concepções: correspondência, coerência e consenso.", gabarito: "certo", explicacao: "Correto. Correspondência, coerência e consenso." },
  { modulo: "9", tipo: "certo_errado", enunciado: "Dado é a representação de aspecto da realidade com significado contextualizado, obtido por processamento metódico, racional e objetivo.", gabarito: "errado", explicacao: "Errado. Essa é a definição de INFORMAÇÃO. Dado tem significado DESCONTEXTUALIZADO e é a menor unidade de representação." },
  { modulo: "9", tipo: "certo_errado", enunciado: "A informação pode ser gerada por pessoas ou por meios computacionais, sem intervenção humana.", gabarito: "certo", explicacao: "Correto. A informação pode ser gerada por meios computacionais sem intervenção humana." },
  { modulo: "9", tipo: "certo_errado", enunciado: "O conhecimento de inteligência deve ser verdadeiro, oportuno e útil.", gabarito: "certo", explicacao: "Correto. São os três atributos do conhecimento de inteligência." },
  { modulo: "9", tipo: "certo_errado", enunciado: "O conhecimento interpretativo-prospectivo é fruto de juízos sobre fatos exclusivamente passados.", gabarito: "errado", explicacao: "Errado. O interpretativo-prospectivo trata da EVOLUÇÃO FUTURA de fatos, eventos, situações ou fenômenos. Juízos sobre fatos passados/presentes = narrativo-descritivo/interpretativo." },
  { modulo: "9", tipo: "multipla", enunciado: "Assinale a alternativa que conceitua corretamente CONHECIMENTO:", alternativas: A(
    "Representação de aspecto da realidade com significado contextualizado, assumido como verdadeiro e validado, útil ao processo decisório e justificadamente plausível.",
    "Representação de aspecto da realidade com significado descontextualizado.",
    "Menor unidade de representação qualitativa ou quantitativa da realidade.",
    "Ação intencional que busca acessar ilegitimamente informações sensíveis.",
    "Processo composto pela evolução de fatos ao longo do tempo."),
    gabarito: "A", explicacao: "Conhecimento = significado contextualizado, assumido como verdadeiro e validado, útil e justificadamente plausível. B e C definem dado; D é ação adversa; E é fenômeno." },
  { modulo: "9", tipo: "multipla", enunciado: "São os tipos de conhecimento de inteligência:", alternativas: A(
    "narrativo-descritivo, interpretativo e interpretativo-prospectivo",
    "de base, tática e estratégica",
    "de alerta, corrente e prospectiva",
    "humana, técnica e aberta",
    "preventiva, ativa e orgânica"),
    gabarito: "A", explicacao: "Os tipos são narrativo-descritivo, interpretativo e interpretativo-prospectivo." },
  { modulo: "9", tipo: "multipla", enunciado: "A atividade de inteligência trabalha com quantas situações temporais, e quais?", alternativas: A(
    "Quatro: passado, presente, futuro imediato e futuro distante",
    "Três: passado, presente e futuro",
    "Duas: presente e futuro",
    "Cinco: passado, presente, futuro imediato, futuro distante e futuro incerto",
    "Uma: apenas o presente"),
    gabarito: "A", explicacao: "São quatro situações temporais: passado, presente, futuro imediato e futuro distante." },
  { modulo: "9", tipo: "dissertativa", enunciado: "Diferencie dado, informação e conhecimento na doutrina de inteligência.", modelo: { estrutura: "Dado → Informação → Conhecimento.", criterios: ["Dado: significado descontextualizado; menor unidade de representação", "Informação: significado contextualizado por processamento metódico; pode ser gerada por meios computacionais sem intervenção humana", "Conhecimento: significado contextualizado assumido como verdadeiro e validado, útil ao processo decisório e justificadamente plausível"], resposta: "Dado é a representação, registrada ou não, de aspecto da realidade com significado DESCONTEXTUALIZADO, sendo a menor unidade de representação qualitativa ou quantitativa da realidade. Informação é a representação de aspecto da realidade com significado CONTEXTUALIZADO, conforme processamento metódico, racional e objetivo, podendo ser gerada por pessoas ou por meios computacionais sem intervenção humana. Conhecimento é a representação de aspecto da realidade com significado contextualizado ASSUMIDO COMO VERDADEIRO E VALIDADO, conforme procedimentos metódicos da atividade de inteligência, útil ao processo decisório e justificadamente plausível." } },

  // ════════════════════ MÓDULO 10 — Ciclo de análise, MPC e técnicas de apoio ════════════════════
  { modulo: "10", tipo: "certo_errado", enunciado: "O ciclo de análise transforma dados, informações e conhecimentos em conhecimento de inteligência, sendo efetivado pela Metodologia de Produção do Conhecimento de Inteligência (MPC).", gabarito: "certo", explicacao: "Correto. O ciclo de análise é efetivado pela MPC." },
  { modulo: "10", tipo: "certo_errado", enunciado: "A MPC é composta por seis fases: planejamento, reunião, avaliação, integração e interpretação, formalização e validação, e difusão e resultados.", gabarito: "certo", explicacao: "Correto. São as 6 fases da MPC." },
  { modulo: "10", tipo: "certo_errado", enunciado: "A fase de Planejamento da MPC envolve a proposição e aprovação de definições como assunto, usuário, finalidade, limites temporais de estudo, prazo de entrega e proposta de equipe.", gabarito: "certo", explicacao: "Correto. É o conteúdo da fase de planejamento." },
  { modulo: "10", tipo: "certo_errado", enunciado: "A fase de Reunião da MPC compreende a validação da pertinência dos insumos e a aplicação da Técnica de Avaliação de Dados (TAD).", gabarito: "errado", explicacao: "Errado. Validar pertinência e aplicar a TAD é a fase de AVALIAÇÃO. A Reunião é a obtenção e o preparo dos insumos (formulação e execução do plano de reunião)." },
  { modulo: "10", tipo: "certo_errado", enunciado: "As Técnicas Analíticas Estruturadas (TAE) proporcionam meios sistemáticos que tornam o trabalho analítico mais transparente e menos exposto a vieses cognitivos.", gabarito: "certo", explicacao: "Correto. As TAE reduzem a exposição a vieses cognitivos." },
  { modulo: "10", tipo: "certo_errado", enunciado: "O método Delphi e a Inferência Bayesiana são exemplos de consulta a especialistas na análise de inteligência.", gabarito: "certo", explicacao: "Correto. Delphi e Inferência Bayesiana são exemplos de consulta a especialistas." },
  { modulo: "10", tipo: "certo_errado", enunciado: "A linguagem de inteligência caracteriza-se pela simplicidade, objetividade, concisão e neutralidade.", gabarito: "certo", explicacao: "Correto. São as características da linguagem de inteligência." },
  { modulo: "10", tipo: "multipla", enunciado: "Assinale a alternativa que descreve corretamente a fase de AVALIAÇÃO da MPC:", alternativas: A(
    "validação da pertinência e significância dos insumos, verificação da credibilidade, validação de metadados e aplicação da TAD",
    "proposição e aprovação de assunto, usuário, finalidade e prazo de entrega",
    "obtenção e preparo dos insumos, com formulação e execução do plano de reunião",
    "formatação e difusão do conhecimento às instâncias governamentais",
    "determinação dos temas, recortes e abordagens a serem trabalhados"),
    gabarito: "A", explicacao: "A avaliação valida pertinência/significância, credibilidade e metadados e aplica a TAD. B é planejamento; C é reunião." },
  { modulo: "10", tipo: "multipla", enunciado: "As Técnicas Analíticas Estruturadas (TAE) têm como principal finalidade:", alternativas: A(
    "submeter o trabalho analítico ao controle e escrutínio, reduzindo a exposição a vieses cognitivos",
    "substituir o analista humano por meios computacionais",
    "dispensar a fase de avaliação dos insumos",
    "garantir o sigilo absoluto das fontes humanas",
    "acelerar a difusão do conhecimento a qualquer custo"),
    gabarito: "A", explicacao: "As TAE tornam o processo mais transparente e menos exposto a vieses cognitivos, submetendo o trabalho ao controle e escrutínio." },
  { modulo: "10", tipo: "multipla", enunciado: "Assinale a alternativa que apresenta corretamente fases da MPC:", alternativas: A(
    "planejamento, reunião e avaliação",
    "objetivar, acompanhar e informar",
    "coleta, análise e disseminação",
    "acompanhar, orientar e detectar",
    "correspondência, coerência e consenso"),
    gabarito: "A", explicacao: "Planejamento, reunião e avaliação são fases da MPC. As demais são de outros ciclos/classificações." },
  { modulo: "10", tipo: "dissertativa", enunciado: "Apresente as seis fases da MPC e detalhe as três primeiras (planejamento, reunião e avaliação).", modelo: { estrutura: "6 fases → detalhar planejamento, reunião e avaliação.", criterios: ["Citar as 6 fases da MPC", "Planejamento: assunto, usuário, finalidade, limites temporais, prazo e equipe", "Reunião: obtenção/preparo dos insumos (formulação e execução do plano de reunião)", "Avaliação: pertinência/significância, credibilidade, metadados e TAD"], resposta: "A MPC compõe-se de seis fases: planejamento; reunião; avaliação; integração e interpretação; formalização e validação; e difusão e resultados. A fase de Planejamento envolve a proposição e aprovação de definições como assunto, usuário, finalidade, limites temporais de estudo, prazo de entrega e proposta de equipe. A fase de Reunião consiste na obtenção e no preparo dos insumos para responder às perguntas do planejamento, dividindo-se em formulação e execução do plano de reunião. A fase de Avaliação compreende a validação da pertinência e da significância dos insumos, a verificação da credibilidade, a validação dos metadados e a aplicação da Técnica de Avaliação de Dados, Informações e Conhecimentos (TAD)." } },

  // ════════════════════ MÓDULO 11 — POI e Inteligência × Investigação policial ════════════════════
  { modulo: "11", tipo: "certo_errado", enunciado: "O Policiamento Orientado pela Inteligência (POI) baseia-se no uso sistemático de informações e análises de inteligência para nortear a tomada de decisões e otimizar o emprego dos recursos policiais.", gabarito: "certo", explicacao: "Correto. É o conceito de POI." },
  { modulo: "11", tipo: "certo_errado", enunciado: "Diferentemente do policiamento tradicional, majoritariamente reativo, o POI adota postura proativa, antecipando tendências criminosas.", gabarito: "certo", explicacao: "Correto. O POI é proativo; o tradicional é predominantemente reativo." },
  { modulo: "11", tipo: "certo_errado", enunciado: "O POI se sustenta em três pilares: coleta de dados, análise de dados e disseminação da inteligência.", gabarito: "certo", explicacao: "Correto. São os três pilares do POI." },
  { modulo: "11", tipo: "certo_errado", enunciado: "A inteligência policial é voltada à resolução de crimes já ocorridos, atuando de forma reativa.", gabarito: "errado", explicacao: "Errado. A inteligência policial é PROATIVA (prevenir). Resolver crimes já ocorridos, de forma reativa, é a INVESTIGAÇÃO policial." },
  { modulo: "11", tipo: "certo_errado", enunciado: "A investigação policial foca na reconstrução de eventos passados e na obtenção de provas que levem à responsabilização dos autores.", gabarito: "certo", explicacao: "Correto. A investigação é reativa: reconstrói eventos e reúne provas." },
  { modulo: "11", tipo: "certo_errado", enunciado: "O COPE (Centro de Operações Policiais Especiais) e o SISP (Sistema de Inteligência de Segurança Pública) são exemplos de iniciativas de POI no cenário brasileiro.", gabarito: "certo", explicacao: "Correto. COPE e SISP são exemplos citados de POI no Brasil." },
  { modulo: "11", tipo: "certo_errado", enunciado: "A coleta de dados no POI vale-se de fontes como denúncias anônimas, monitoramento de redes sociais, estatísticas criminais e informações de campo.", gabarito: "certo", explicacao: "Correto. São exemplos de fontes do pilar de coleta de dados." },
  { modulo: "11", tipo: "multipla", enunciado: "Assinale a alternativa que apresenta corretamente os três pilares do POI:", alternativas: A(
    "Coleta de dados, análise de dados e disseminação de inteligência",
    "Objetivar, acompanhar e informar",
    "Planejamento, reunião e avaliação",
    "Prevenção, repressão e investigação",
    "Externa, interna e cibernética"),
    gabarito: "A", explicacao: "Os pilares do POI são coleta de dados, análise de dados e disseminação de inteligência." },
  { modulo: "11", tipo: "multipla", enunciado: "Sobre a distinção entre inteligência policial e investigação policial, assinale a CORRETA:", alternativas: A(
    "A inteligência policial é proativa, voltada à prevenção; a investigação policial é reativa, voltada à resolução de crimes já ocorridos.",
    "Ambas são exclusivamente reativas.",
    "A inteligência policial busca provas para condenar autores de crimes consumados.",
    "A investigação policial antecipa tendências criminosas antes que os crimes ocorram.",
    "A inteligência policial e a investigação policial têm objetivos idênticos."),
    gabarito: "A", explicacao: "Inteligência policial = proativa (prevenir); investigação policial = reativa (resolver crimes já ocorridos e reunir provas)." },
  { modulo: "11", tipo: "multipla", enunciado: "No pilar de ANÁLISE DE DADOS do POI, as informações coletadas são analisadas para:", alternativas: A(
    "identificar padrões de comportamento criminoso, locais de maior incidência e perfis de criminosos",
    "somente arquivar denúncias anônimas",
    "difundir o conhecimento diretamente ao Presidente da República",
    "reconstruir provas de crimes já julgados",
    "substituir a coleta de dados de campo"),
    gabarito: "A", explicacao: "A análise de dados identifica padrões de comportamento criminoso, locais de maior incidência de crimes e perfis de criminosos ou grupos." },
  { modulo: "11", tipo: "dissertativa", enunciado: "Conceitue o Policiamento Orientado pela Inteligência (POI), apresente seus três pilares e diferencie inteligência policial de investigação policial.", modelo: { estrutura: "Conceito de POI → 3 pilares → inteligência (proativa) × investigação (reativa).", criterios: ["POI: uso sistemático de inteligência para nortear decisões e otimizar recursos; postura proativa", "Pilares: coleta de dados, análise de dados e disseminação de inteligência", "Inteligência policial: proativa, prevenir, antecipar padrões", "Investigação policial: reativa, reconstruir eventos e reunir provas"], resposta: "O Policiamento Orientado pela Inteligência (POI) é o modelo baseado no uso sistemático de informações e análises de inteligência para nortear a tomada de decisões e otimizar o emprego dos recursos policiais, adotando postura proativa ao antecipar tendências criminosas. Sustenta-se em três pilares: a coleta de dados (de fontes como denúncias, redes sociais, estatísticas criminais e informações de campo); a análise de dados (identificação de padrões, locais de maior incidência e perfis de criminosos); e a disseminação da inteligência aos órgãos e agentes responsáveis. Distingue-se da investigação policial porque a inteligência policial é PROATIVA, voltada a prevenir crimes e antecipar padrões, ao passo que a investigação policial é REATIVA, voltada à resolução de crimes já ocorridos, reconstruindo eventos passados e reunindo provas para responsabilizar os autores." } },
]

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MAT } })
  if (!disc) throw new Error(`Disciplina ${MAT} não existe.`)

  // Remove questões INTSISP obsoletas (de versões anteriores) que não fazem parte deste conjunto
  const novosHashes = QS.map(q => createHash("sha1").update(`${MAT}|${q.modulo}|${q.enunciado}`).digest("hex"))
  const del = await prisma.questao.deleteMany({ where: { materia: MAT, hash: { notIn: novosHashes } } })
  if (del.count > 0) console.log(`Removidas ${del.count} questões INTSISP obsoletas.`)

  let c = 0, u = 0
  for (const q of QS) {
    const hash = createHash("sha1").update(`${MAT}|${q.modulo}|${q.enunciado}`).digest("hex")
    const base: any = {
      materia: MAT, modulo: q.modulo, tipo: q.tipo, enunciado: q.enunciado, hash,
      fonte: ("fonte" in q && q.fonte) ? q.fonte : "Resumo INTSISP (CFO PMPE)",
    }
    if (q.tipo === "multipla") { base.alternativas = q.alternativas; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else if (q.tipo === "certo_errado") { base.alternativas = []; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else { base.alternativas = []; base.gabarito = ""; base.modelo = q.modelo }
    const exists = await prisma.questao.findUnique({ where: { hash } })
    await prisma.questao.upsert({ where: { hash }, update: base, create: base })
    exists ? u++ : c++
  }
  const tot = await prisma.questao.count({ where: { materia: MAT } })
  console.log(`INTSISP: ${c} criadas, ${u} atualizadas. Total ${MAT}: ${tot}.`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
