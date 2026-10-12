import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
// Uso Diferenciado da Força (UDF/UDFIT) — 8 módulos (11 questões cada: 7 V/F + 3 MC +
// 1 dissertativa) + módulo SIM (simulado, 22 questões, 10,0 pontos) = 110.
// Fontes: apostila "Uso Diferenciado da Força — CFO 2024" (public/apostilas/UDF.pdf) e
// memento UDFIT (atualizado com a Portaria MJSP nº 855/2025, que revogou a Portaria
// Interministerial nº 4.226/2010 — "a Portaria 855 será cobrada"). Onde apostila e
// memento divergem, vale o memento (mais recente). O número do decreto estadual de
// ética de 13/03/2000 diverge entre as fontes (22.114 × 22.214) e não é cobrado.
// Gabaritos das múltiplas distribuídos entre A–E; explicações sem citar letra.
const MAT = "UDF"
const FONTE_PADRAO = "Apostila UDF (CFO 2024) e memento UDFIT"

type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string; fonte?: string; contexto?: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string; fonte?: string; contexto?: string }
  | { modulo: string; tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string }; fonte?: string; contexto?: string }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const BLOCO_VF = "BLOCO I — Julgue os itens a seguir, assinalando VERDADEIRO ou FALSO. Cada assertiva vale 0,20 ponto."
const BLOCO_MC = "BLOCO II — Questões de múltipla escolha. Cada questão vale 0,50 ponto."

const QS: Q[] = [
  // ════════════════════ MÓDULO 1 — Conceitos e Código de Conduta (CCEAL, ONU 1979) ════════════════════
  { modulo: "1", tipo: "certo_errado", enunciado: "Força é a intervenção coercitiva imposta à pessoa ou grupo pelo agente de segurança pública com a finalidade de preservar a ordem pública e a lei, reduzindo ou eliminando sua capacidade de autodecisão.", gabarito: "certo", explicacao: "Correto. É o conceito de força apresentado na disciplina." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Níveis de uso da força são a intensidade da força escolhida pelo agente em resposta a uma ameaça real ou potencial, divididos em graus que só admitem progressão.", gabarito: "errado", explicacao: "Errado. A divisão em níveis é gradual tanto PROGRESSIVA quanto REGRESSIVA: a força pode subir ou descer conforme a ameaça." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O Uso Diferenciado da Força consiste na perfeita correlação entre a ação criminosa e a reação policial.", gabarito: "certo", explicacao: "Correto. É a observação destacada no memento." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O Código de Conduta para os Funcionários Responsáveis pela Aplicação da Lei foi adotado pela Assembleia Geral da ONU em 1990.", gabarito: "errado", explicacao: "Errado. O Código de Conduta é de 1979. Em 1990 vieram os Princípios Básicos sobre o Uso da Força e Armas de Fogo." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Pelo art. 3º do Código de Conduta, os funcionários responsáveis pela aplicação da lei só podem empregar a força quando estritamente necessária e na medida exigida para o cumprimento do seu dever.", gabarito: "certo", explicacao: "Correto. É a redação do art. 3º." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O estado de guerra ou a ameaça à segurança nacional podem ser invocados para justificar tratamento cruel, desde que haja ordem superior expressa.", gabarito: "errado", explicacao: "Errado. Pelo art. 5º, nenhum funcionário pode infligir, instigar ou tolerar tortura ou tratamento cruel, nem invocar ordens superiores ou circunstâncias excepcionais." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O art. 6º do Código de Conduta impõe aos funcionários responsáveis pela aplicação da lei garantir a proteção da saúde das pessoas sob sua guarda, adotando medidas imediatas para assegurar-lhes cuidados médicos sempre que necessário.", gabarito: "certo", explicacao: "Correto. É a redação do art. 6º." },
  { modulo: "1", tipo: "multipla", enunciado: "A ferramenta (conjunto de instrumentos e técnicas) que determina as técnicas ou níveis de força a serem empregados para solucionar o conflito entre o elemento volitivo individual e a 'vontade' do Estado denomina-se:", alternativas: A(
    "força letal",
    "presença policial",
    "uso diferenciado da força",
    "legítima defesa",
    "gerenciamento de crises"),
    gabarito: "C", explicacao: "É o conceito de Uso Diferenciado da Força." },
  { modulo: "1", tipo: "multipla", enunciado: "Sobre o Código de Conduta para os Funcionários Responsáveis pela Aplicação da Lei (CCEAL), assinale a alternativa INCORRETA:", alternativas: A(
    "Foi adotado pela Assembleia Geral da ONU em 1979.",
    "Determina que os funcionários sirvam à comunidade e protejam todas as pessoas contra atos ilegais.",
    "Proíbe invocar ordens superiores para justificar tortura.",
    "Autoriza o uso da força sempre que conveniente à administração, independentemente de necessidade.",
    "Objetiva sensibilizar os agentes para a enorme responsabilidade que o Estado lhes outorga."),
    gabarito: "D", explicacao: "O CCEAL só admite a força quando ESTRITAMENTE NECESSÁRIA e na medida exigida para o cumprimento do dever (art. 3º)." },
  { modulo: "1", tipo: "multipla", enunciado: "O decreto estadual de 13 de março de 2000, que trata da ética profissional dos militares de Pernambuco, estabelece que:", alternativas: A(
    "o emprego da força só será permitido ao militar estadual quando estritamente necessário e na medida exigida para o cumprimento do seu dever",
    "o militar pode invocar instabilidade política para justificar tratamento degradante",
    "a observância do CCEAL é facultativa para o militar estadual",
    "o militar só deve proteger a saúde de pessoas sob sua guarda quando houver ordem judicial",
    "o militar pode tratar o cidadão de forma diferente conforme a posição social"),
    gabarito: "A", explicacao: "O decreto manda observar o CCEAL e repete suas vedações: força só quando estritamente necessária (art. 12), proibição de tortura mesmo invocando ordens ou emergências, proteção da saúde e não discriminação." },
  { modulo: "1", tipo: "dissertativa", enunciado: "Conceitue força, níveis de uso da força e uso diferenciado da força e cite três deveres impostos pelo Código de Conduta para os Funcionários Responsáveis pela Aplicação da Lei (ONU, 1979). (Mínimo 05 e máximo 10 linhas)", modelo: { estrutura: "Três conceitos → deveres do CCEAL.", criterios: ["Força: intervenção coercitiva para preservar a ordem e a lei, reduzindo a autodecisão", "Níveis: intensidade escolhida em resposta a ameaça real ou potencial; gradual, progressiva ou regressiva", "UDF: ferramenta de técnicas e instrumentos que define o nível adequado; correlação entre ação criminosa e reação policial", "Deveres (três): servir à comunidade e proteger contra atos ilegais (art. 1º); força só quando estritamente necessária (art. 3º); não praticar nem tolerar tortura (art. 5º); proteger a saúde dos custodiados (art. 6º)"], resposta: "Força é a intervenção coercitiva imposta a uma pessoa ou grupo pelo agente de segurança pública com a finalidade de preservar a ordem pública e a lei, reduzindo ou eliminando sua capacidade de autodecisão. Níveis de uso da força são a intensidade da força escolhida pelo agente em resposta a uma ameaça real ou potencial, divididos de forma gradual, progressiva ou regressiva. Uso diferenciado da força é a ferramenta, composta de instrumentos e técnicas, que determina o nível de força adequado para solucionar o conflito entre a vontade individual e a do Estado, buscando a perfeita correlação entre a ação criminosa e a reação policial. O Código de Conduta da ONU (1979) impõe, entre outros deveres: cumprir o dever legal, servindo à comunidade e protegendo todas as pessoas contra atos ilegais (art. 1º); empregar a força somente quando estritamente necessária e na medida exigida (art. 3º); e jamais infligir, instigar ou tolerar tortura, sem invocar ordens superiores ou circunstâncias excepcionais (art. 5º)." } },

  // ════════════════════ MÓDULO 2 — Princípios Básicos sobre o Uso da Força e Armas de Fogo (ONU, 1990) ════════════════════
  { modulo: "2", tipo: "certo_errado", enunciado: "Os Princípios Básicos sobre o Uso da Força e Armas de Fogo (ONU, 1990) não constituem um tratado, mas um documento de orientação aos Estados.", gabarito: "certo", explicacao: "Correto. São o segundo instrumento internacional mais importante sobre o tema, de caráter orientador." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Pelos Princípios Básicos, os responsáveis pela aplicação da lei devem, na medida do possível, aplicar meios não violentos antes de recorrer ao uso da força e de armas de fogo.", gabarito: "certo", explicacao: "Correto. A força só é aceitável quando os outros meios se revelarem ineficazes." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A instabilidade política interna é circunstância excepcional aceitável para afastar a aplicação dos Princípios Básicos.", gabarito: "errado", explicacao: "Errado. Não é aceitável invocar circunstâncias excepcionais, como instabilidade política interna, para abandonar os Princípios Básicos." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Sempre que o uso da força e de armas de fogo causar ferimento ou morte, os responsáveis deverão comunicar imediatamente o fato aos seus superiores.", gabarito: "certo", explicacao: "Correto. É disposição expressa dos Princípios Básicos." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Ao dispersar grupos ilegais, mas não violentos, os responsáveis pela aplicação da lei podem usar armas de fogo, desde que precedidas de aviso.", gabarito: "errado", explicacao: "Errado. Diante de grupos ilegais e NÃO violentos, deve-se evitar a força ou restringi-la ao mínimo necessário. Arma de fogo só cabe contra grupos violentos, quando não houver meio menos perigoso." },
  { modulo: "2", tipo: "certo_errado", enunciado: "O cumprimento de ordem superior não justifica o uso de força que resulte em morte ou ferimento grave quando o agente sabia que a ordem era manifestamente ilegítima e teve oportunidade razoável de recusá-la.", gabarito: "certo", explicacao: "Correto. Os oficiais superiores também respondem se sabiam ou deviam saber do uso ilegítimo e não agiram." },
  { modulo: "2", tipo: "certo_errado", enunciado: "O uso letal intencional de arma de fogo é admitido sempre que necessário para impedir a fuga de qualquer pessoa presa.", gabarito: "errado", explicacao: "Errado. O uso letal intencional só é admitido quando ESTRITAMENTE INEVITÁVEL à proteção da vida; a arma contra fuga só cabe se o indivíduo representar ameaça iminente de morte ou ferimento grave e outros meios forem insuficientes." },
  { modulo: "2", tipo: "multipla", enunciado: "Pelos Princípios Básicos da ONU (1990), os responsáveis pela aplicação da lei NÃO usarão armas de fogo contra pessoas, EXCETO:", alternativas: A(
    "para dispersar manifestação pacífica que bloqueie via pública",
    "para impedir a fuga de autor de furto simples desarmado",
    "como disparo de advertência em abordagens rotineiras",
    "em legítima defesa própria ou de outrem contra ameaça iminente de morte ou ferimento grave, quando meios menos extremos forem insuficientes",
    "para garantir o respeito a ordem de parada em blitz de trânsito"),
    gabarito: "D", explicacao: "As exceções são legítima defesa contra ameaça iminente de morte ou ferimento grave, prisão ou impedimento de fuga de quem represente tal risco e resista — sempre que meios menos extremos forem insuficientes." },
  { modulo: "2", tipo: "multipla", enunciado: "Sempre que o uso legítimo da força for inevitável, os Princípios Básicos determinam, EXCETO:", alternativas: A(
    "exercer moderação e agir na proporção da gravidade da infração",
    "minimizar danos e ferimentos e preservar a vida humana",
    "assegurar assistência e cuidados médicos aos feridos o mais rápido possível",
    "notificar familiares ou amigos íntimos do ferido o mais depressa possível",
    "aguardar autorização judicial antes de prestar socorro ao ferido"),
    gabarito: "E", explicacao: "Não se aguarda autorização judicial para socorrer: a assistência médica deve ser assegurada o mais rápido possível." },
  { modulo: "2", tipo: "multipla", enunciado: "Na formação dos responsáveis pela aplicação da lei, os Princípios Básicos recomendam atenção especial a:", alternativas: A(
    "ética policial, direitos humanos e alternativas ao uso da força, como solução pacífica de conflitos, persuasão, negociação e mediação",
    "exclusivamente o tiro de precisão",
    "técnicas de interrogatório sob pressão física",
    "uso de armas letais em grandes eventos",
    "táticas militares de combate convencional"),
    gabarito: "A", explicacao: "A formação deve priorizar ética policial e direitos humanos, alternativas à força, compreensão do comportamento das multidões, persuasão, negociação e mediação." },
  { modulo: "2", tipo: "dissertativa", enunciado: "Segundo os Princípios Básicos sobre o Uso da Força e Armas de Fogo (ONU, 1990), em que hipóteses é admitido o uso de arma de fogo contra pessoas e quais as condutas exigidas quando o uso legítimo da força for inevitável? (Mínimo 05 e máximo 12 linhas)", modelo: { estrutura: "Regra (não usar) → exceções → aviso prévio → condutas no uso inevitável.", criterios: ["Exceções: legítima defesa contra ameaça iminente de morte ou ferimento grave; prisão ou impedimento de fuga de quem represente tal risco e resista; só se meios menos extremos forem insuficientes", "Uso letal intencional só quando estritamente inevitável à proteção da vida", "Identificar-se e avisar previamente, salvo risco indevido ou inutilidade", "Uso inevitável: moderação e proporcionalidade, minimizar danos, socorro médico, notificar familiares, comunicar superiores"], resposta: "Os Princípios Básicos estabelecem que os responsáveis pela aplicação da lei não usarão armas de fogo contra pessoas, exceto em legítima defesa própria ou de outrem contra ameaça iminente de morte ou ferimento grave, para prender quem represente tal risco e resista à autoridade ou para impedir sua fuga — e somente quando meios menos extremos forem insuficientes. O uso letal intencional só é admitido quando estritamente inevitável à proteção da vida. O agente deve identificar-se e avisar previamente sua intenção, com tempo suficiente, salvo quando isso represente risco indevido ou seja inútil. Quando o uso legítimo da força for inevitável, deve-se exercer moderação e agir na proporção da gravidade da infração e do objetivo legítimo, minimizar danos e preservar a vida, assegurar assistência médica aos feridos o mais rápido possível, notificar familiares ou amigos íntimos e comunicar imediatamente o fato aos superiores." } },

  // ════════════════════ MÓDULO 3 — Legislação nacional: CPP, CPPM, Lei 13.060/2014 e Decreto 12.341/2024 ════════════════════
  { modulo: "3", tipo: "certo_errado", enunciado: "Pelo art. 284 do CPP, não será permitido o emprego de força, salvo a indispensável no caso de resistência ou tentativa de fuga do preso.", gabarito: "certo", explicacao: "Correto. É a redação do art. 284 do CPP." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Pelo CPP, sendo noite e não atendida a intimação do morador para entregar o réu, o executor do mandado deve arrombar imediatamente a porta e efetuar a prisão.", gabarito: "errado", explicacao: "Errado. À NOITE, o executor faz guardar todas as saídas, torna a casa incomunicável e, logo que amanheça, arromba as portas e efetua a prisão (art. 293)." },
  { modulo: "3", tipo: "certo_errado", enunciado: "Pelo art. 234 do CPPM, o emprego da força só é permitido quando indispensável, no caso de desobediência, resistência ou tentativa de fuga, lavrando-se auto subscrito pelo executor e por duas testemunhas.", gabarito: "certo", explicacao: "Correto. Havendo resistência de terceiros, podem ser usados os meios necessários, inclusive a prisão do defensor." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A Lei nº 13.060/2014 disciplina o uso dos instrumentos de menor potencial ofensivo pelos agentes de segurança pública em todo o território nacional.", gabarito: "certo", explicacao: "Correto. É o objeto da lei." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A Lei nº 13.060/2014 manda priorizar os instrumentos de menor potencial ofensivo em qualquer situação, ainda que seu uso coloque em risco a integridade física dos policiais.", gabarito: "errado", explicacao: "Errado. A priorização vale DESDE QUE o uso não coloque em risco a integridade física ou psíquica dos policiais." },
  { modulo: "3", tipo: "certo_errado", enunciado: "São princípios previstos na Lei nº 13.060/2014: legalidade, necessidade, razoabilidade e proporcionalidade.", gabarito: "certo", explicacao: "Correto. Mnemônico L.N.R.P." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O Decreto nº 12.341/2024 regulamentou a Lei nº 13.060/2014 e acrescentou aos princípios legais a precaução, a responsabilização e a não discriminação.", gabarito: "certo", explicacao: "Correto. São 7 princípios: os 4 da lei + precaução, responsabilização e não discriminação." },
  { modulo: "3", tipo: "multipla", enunciado: "Segundo a Lei nº 13.060/2014, NÃO é legítimo o uso de arma de fogo:", alternativas: A(
    "contra agressor armado que dispara contra a guarnição",
    "em legítima defesa de terceiro sob ameaça de morte",
    "contra pessoa em fuga que esteja desarmada ou que não represente risco imediato de morte ou lesão aos agentes ou a terceiros",
    "contra quem mantém refém sob mira de arma",
    "contra veículo cujo condutor atropela intencionalmente os policiais do bloqueio"),
    gabarito: "C", explicacao: "O parágrafo único veda arma de fogo contra pessoa em fuga desarmada ou sem risco imediato e contra veículo que desrespeite bloqueio, salvo se o ato representar risco de morte ou lesão." },
  { modulo: "3", tipo: "multipla", enunciado: "Para a Lei nº 13.060/2014, instrumentos de menor potencial ofensivo são aqueles projetados especificamente para:", alternativas: A(
    "causar a morte do agressor com o menor ruído possível",
    "substituir integralmente a arma de fogo no serviço policial",
    "uso exclusivo de unidades especializadas",
    "punir o infrator pela resistência",
    "com baixa probabilidade de causar mortes ou lesões permanentes, conter, debilitar ou incapacitar temporariamente pessoas"),
    gabarito: "E", explicacao: "É a definição legal de IMPO." },
  { modulo: "3", tipo: "multipla", enunciado: "Pelo Decreto nº 12.341/2024, na capacitação dos profissionais sobre o uso da força, os órgãos de segurança pública deverão observar:", alternativas: A(
    "capacitação facultativa, a critério do profissional",
    "obrigatoriedade e periodicidade anual da capacitação, realizada no horário de serviço",
    "capacitação a cada cinco anos, fora do horário de serviço",
    "capacitação apenas para unidades especializadas",
    "capacitação somente sobre armas de fogo, sem conteúdo sobre IMPO"),
    gabarito: "B", explicacao: "O art. 4º prevê obrigatoriedade e periodicidade anual, realização no horário de serviço e conteúdo sobre armas de fogo e IMPO." },
  { modulo: "3", tipo: "dissertativa", enunciado: "Explique o que dispõem a Lei nº 13.060/2014 e o Decreto nº 12.341/2024 sobre os princípios do uso da força, a priorização dos instrumentos de menor potencial ofensivo e as hipóteses em que não é legítimo o uso de arma de fogo. (Mínimo 06 e máximo 12 linhas)", modelo: { estrutura: "Objeto da lei → priorização dos IMPO → princípios (4 + 3) → vedações → disposições do decreto.", criterios: ["Lei 13.060/2014: disciplina o uso de IMPO em todo o país", "Priorizar IMPO desde que não arrisque a integridade dos policiais", "Princípios: legalidade, necessidade, razoabilidade e proporcionalidade; o decreto acrescenta precaução, responsabilização e não discriminação", "Ilegítimo: arma contra pessoa em fuga desarmada ou sem risco; contra veículo que fura bloqueio, salvo risco de morte ou lesão", "Decreto: arma de fogo como último recurso; só profissionais habilitados; relatório circunstanciado em caso de ferimento ou morte"], resposta: "A Lei nº 13.060/2014 disciplina o uso dos instrumentos de menor potencial ofensivo (IMPO) pelos agentes de segurança pública em todo o território nacional, determinando que os órgãos priorizem sua utilização, desde que isso não coloque em risco a integridade física ou psíquica dos policiais, e obedeçam aos princípios da legalidade, da necessidade, da razoabilidade e da proporcionalidade. A lei declara não legítimo o uso de arma de fogo contra pessoa em fuga desarmada ou que não represente risco imediato de morte ou lesão, e contra veículo que desrespeite bloqueio policial, salvo quando o ato represente risco de morte ou lesão aos agentes ou a terceiros. O Decreto nº 12.341/2024, que a regulamenta, acrescenta os princípios da precaução, da responsabilização e da não discriminação, totalizando sete; estabelece que a arma de fogo é medida de último recurso; restringe arma de fogo e IMPO a profissionais habilitados; e exige relatório circunstanciado sempre que o uso da força resultar em ferimento ou morte." } },

  // ════════════════════ MÓDULO 4 — Portaria MJSP nº 855/2025: alcance, conceitos e princípios ════════════════════
  { modulo: "4", tipo: "certo_errado", enunciado: "A Portaria do Ministro da Justiça nº 855/2025 estabelece diretrizes sobre o uso da força pelos profissionais de segurança pública e revogou a Portaria Interministerial nº 4.226/2010.", gabarito: "certo", explicacao: "Correto. É o objeto da Portaria 855/2025." },
  { modulo: "4", tipo: "certo_errado", enunciado: "A Portaria nº 855/2025 aplica-se exclusivamente aos órgãos federais, não alcançando as polícias militares em nenhuma hipótese.", gabarito: "errado", explicacao: "Errado. Além de PF, PRF, Polícia Penal Federal, Força Nacional e Força Penal Nacional, deve ser observada pelos órgãos estaduais, distritais e municipais nas iniciativas com recursos do FNSP e do FUNPEN — por isso a PMPE a normatizou." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Para a Portaria nº 855/2025, instrumentos de menor potencial ofensivo de incapacitação são artefatos que atuam diretamente no sistema nervoso, causando reações involuntárias que fazem a pessoa perder o controle sobre seus atos.", gabarito: "certo", explicacao: "Correto. É o conceito do art. 5º, V." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Os instrumentos de debilitação são artefatos que atuam no sistema nervoso e provocam perda total do controle dos atos.", gabarito: "errado", explicacao: "Errado. Esse é o conceito de INCAPACITAÇÃO. Debilitação é reduzir temporariamente a capacidade de reação, diminuindo energia, vigor ou firmeza." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Pelo princípio da precaução, as ações devem ser planejadas com todas as medidas necessárias para prevenir ou minimizar o uso da força e mitigar a gravidade de qualquer dano, direto ou indireto.", gabarito: "certo", explicacao: "Correto. A precaução foi acrescentada aos princípios pela Portaria e pelo Decreto 12.341/2024." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Os princípios da moderação e da conveniência estão expressos entre os sete princípios gerais da Portaria nº 855/2025.", gabarito: "errado", explicacao: "Errado. Moderação e conveniência vinham da Portaria 4.226/2010 e NÃO estão entre os sete da Portaria 855/2025 e do Decreto 12.341/2024." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Técnicas de desescalonamento são procedimentos, táticas ou estratégias usados para reduzir a intensidade de um confronto ou de situação com potencial de gerar violência, minimizando o uso da força.", gabarito: "certo", explicacao: "Correto. A Portaria manda priorizar a comunicação, a negociação e técnicas que impeçam a escalada da violência." },
  { modulo: "4", tipo: "multipla", enunciado: "São os sete princípios gerais do uso da força na Portaria MJSP nº 855/2025:", alternativas: A(
    "legalidade, conveniência, moderação, necessidade, proporcionalidade, eficiência e publicidade",
    "legalidade, precaução, necessidade, proporcionalidade, razoabilidade, responsabilização e não discriminação",
    "legalidade, impessoalidade, moralidade, publicidade, eficiência, razoabilidade e proporcionalidade",
    "necessidade, conveniência, moderação, oportunidade, precaução, transparência e não discriminação",
    "legalidade, hierarquia, disciplina, necessidade, proporcionalidade, moderação e responsabilização"),
    gabarito: "B", explicacao: "Os sete são: Legalidade, Precaução, Necessidade, Proporcionalidade, Razoabilidade, Responsabilização e Não Discriminação." },
  { modulo: "4", tipo: "multipla", enunciado: "O princípio segundo o qual a força deve ser empregada com bom senso, prudência e equilíbrio, de acordo com as circunstâncias do caso concreto, é o da:", alternativas: A(
    "legalidade",
    "necessidade",
    "proporcionalidade",
    "responsabilização",
    "razoabilidade"),
    gabarito: "E", explicacao: "É a razoabilidade. Proporcionalidade é a compatibilidade do nível de força com a gravidade da ameaça; necessidade é usar um recurso só quando os de menor intensidade forem insuficientes." },
  { modulo: "4", tipo: "multipla", enunciado: "Conforme a Portaria nº 855/2025, uso diferenciado da força é:", alternativas: A(
    "a seleção apropriada do nível de força a ser empregado, em resposta a uma ameaça real ou potencial, para minimizar o uso de meios que possam causar ofensas, ferimentos ou mortes",
    "o emprego obrigatório da força letal antes de qualquer outro meio",
    "a substituição da verbalização por instrumentos de menor potencial ofensivo",
    "a utilização da força apenas por unidades especializadas",
    "o uso progressivo da força, vedado o retorno a níveis inferiores"),
    gabarito: "A", explicacao: "É a definição da Portaria. A força deve ser usada de forma diferenciada, priorizando comunicação e negociação." },
  { modulo: "4", tipo: "dissertativa", enunciado: "Enumere e explique os sete princípios gerais do uso da força previstos na Portaria MJSP nº 855/2025, indicando quais deles foram acrescentados em relação à Lei nº 13.060/2014. (Mínimo 07 e máximo 15 linhas)", modelo: { estrutura: "Sete princípios com conceito → acrescentados.", criterios: ["Legalidade: objetivo legal, nos estritos limites da lei", "Precaução: planejar para prevenir ou minimizar a força e mitigar danos", "Necessidade: só quando recursos de menor intensidade forem insuficientes", "Proporcionalidade: compatível com a gravidade da ameaça e os objetivos legítimos", "Razoabilidade: bom senso, prudência e equilíbrio", "Responsabilização: responder pelo uso inadequado, após investigação com devido processo", "Não discriminação: atuar sem preconceitos", "Acrescentados: precaução, responsabilização e não discriminação"], resposta: "A Portaria nº 855/2025 prevê sete princípios gerais. Pela legalidade, a força e os IMPO somente podem ser usados para alcançar um objetivo legal e nos estritos limites da lei. Pela precaução, as ações devem ser planejadas com todas as medidas necessárias para prevenir ou minimizar o uso da força e mitigar a gravidade de qualquer dano. Pela necessidade, um recurso de força só pode ser empregado quando os de menor intensidade não forem suficientes. Pela proporcionalidade, o nível de força deve ser compatível com a gravidade da ameaça e com os objetivos legítimos da ação. Pela razoabilidade, a força deve ser empregada com bom senso, prudência e equilíbrio, conforme as circunstâncias. Pela responsabilização, órgãos e profissionais assumem a responsabilidade pelo uso inadequado da força, após investigação com devido processo legal, ampla defesa e contraditório. Pela não discriminação, os profissionais devem atuar sem preconceitos de qualquer natureza. Em relação à Lei nº 13.060/2014 (legalidade, necessidade, razoabilidade e proporcionalidade), foram acrescentados a precaução, a responsabilização e a não discriminação." } },

  // ════════════════════ MÓDULO 5 — Portaria nº 855/2025: arma de fogo, IMPO, lesão ou morte e capacitação ════════════════════
  { modulo: "5", tipo: "certo_errado", enunciado: "Pela Portaria nº 855/2025, o emprego de arma de fogo é medida de último recurso.", gabarito: "certo", explicacao: "Correto. O emprego de arma de fogo é restrito, também, a profissionais devidamente habilitados." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A Portaria nº 855/2025 manteve a renovação anual da habilitação para uso de arma de fogo em serviço prevista na Portaria nº 4.226/2010.", gabarito: "errado", explicacao: "Errado. A renovação passou a ser a cada 2 ANOS, após aprovação nos exames técnicos e psicológicos. A Portaria 4.226/2010 previa renovação anual." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Os profissionais de segurança pública não devem disparar a esmo ou a título de advertência, nem apontar arma de fogo para pessoas durante abordagem como prática rotineira e indiscriminada.", gabarito: "certo", explicacao: "Correto. São vedações expressas da Portaria." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Pela Portaria nº 855/2025, os órgãos devem disponibilizar a cada profissional em serviço, no mínimo, dois instrumentos de menor potencial ofensivo quaisquer, à escolha do órgão.", gabarito: "errado", explicacao: "Errado. A Portaria 855 exige, no mínimo, UM IMPO específico de DEBILITAÇÃO, UM específico de INCAPACITAÇÃO e os EPI necessários. A exigência genérica de 'dois IMPO' era da Portaria 4.226/2010." },
  { modulo: "5", tipo: "certo_errado", enunciado: "No gerenciamento de crises, a negociação é considerada a principal alternativa tática.", gabarito: "certo", explicacao: "Correto. Considera-se também a necessidade e a mensuração do risco das medidas de uso diferenciado da força." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Ocorrências relacionadas ao uso da força que resultem em morte ou lesão corporal serão imediatamente comunicadas ao Ministério Público.", gabarito: "certo", explicacao: "Correto. Também devem ser formalmente registradas." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Em ambientes prisionais, só devem ser documentadas as situações de emprego de arma de fogo ou IMPO que resultem em lesão ou morte.", gabarito: "errado", explicacao: "Errado. TODAS as situações com arma de fogo ou IMPO em ambientes prisionais devem ser documentadas, INDEPENDENTEMENTE do resultado." },
  { modulo: "5", tipo: "multipla", enunciado: "Quando o uso da força resultar em lesão ou morte, a Portaria nº 855/2025 determina aos profissionais, EXCETO:", alternativas: A(
    "facilitar a prestação de socorro ou assistência médica aos feridos",
    "garantir a preservação do local dos fatos",
    "solicitar a presença da polícia judiciária e de peritos criminais",
    "comunicar a ocorrência aos familiares, amigos ou conhecidos da pessoa ferida ou morta",
    "remover o corpo e os vestígios do local para agilizar a liberação da via"),
    gabarito: "E", explicacao: "Deve-se PRESERVAR o local. Os deveres são: socorro, preservação do local, polícia judiciária e peritos, comunicação a familiares, relatório circunstanciado (art. 26) e relato fiel às corregedorias." },
  { modulo: "5", tipo: "multipla", enunciado: "Segundo a Portaria nº 855/2025, o uso de armas de fogo por profissionais embarcados em aeronave:", alternativas: A(
    "é livre para dissuadir fugas em vias públicas",
    "é vedado em qualquer hipótese",
    "somente será permitido em casos de estrita necessidade para legítima defesa dos tripulantes, das equipes terrestres e da população civil",
    "depende apenas de autorização do piloto",
    "só pode ser usado como disparo de advertência"),
    gabarito: "C", explicacao: "É a regra da Portaria para profissionais embarcados em aeronave." },
  { modulo: "5", tipo: "multipla", enunciado: "O registro das ocorrências de uso da força com lesão ou morte (art. 26 da Portaria nº 855/2025) deve conter, no mínimo, EXCETO:", alternativas: A(
    "data, hora e local do evento",
    "descrição dos equipamentos utilizados, com tipo, modelo e número de série",
    "opinião pessoal do profissional sobre a culpa da vítima",
    "medidas adotadas antes dos disparos ou do emprego de IMPO",
    "tipo de arma e munição, quantidade e distância aproximada dos disparos"),
    gabarito: "C", explicacao: "O art. 26 exige dados objetivos (data, local, envolvidos, equipamentos, características das vítimas, medidas prévias, circunstâncias, armas e disparos, vitimados, assistência médica e preservação do local) — não opinião pessoal sobre culpa." },
  { modulo: "5", tipo: "dissertativa", enunciado: "Com base na Portaria MJSP nº 855/2025, descreva as condutas exigidas dos profissionais de segurança pública quando o uso da força resultar em lesão ou morte, e as regras sobre a dotação mínima de IMPO e a renovação da habilitação para arma de fogo. (Mínimo 06 e máximo 12 linhas)", modelo: { estrutura: "Deveres após lesão ou morte → comunicação ao MP e registro → dotação mínima de IMPO → renovação da habilitação.", criterios: ["Socorro aos feridos; preservação do local; polícia judiciária e peritos; comunicação a familiares; relatório circunstanciado (art. 26); relato às corregedorias", "Comunicação imediata ao MP; registro formal", "Dotação mínima individual: 1 IMPO de debilitação + 1 de incapacitação + EPI, válidos e em condições de uso", "Renovação a cada 2 anos após exames técnicos e psicológicos (antes, anual)"], resposta: "Quando o uso da força resultar em lesão ou morte, os profissionais devem facilitar o socorro ou a assistência médica aos feridos, garantir a preservação do local, solicitar a presença da polícia judiciária e de peritos criminais, comunicar a ocorrência aos familiares, amigos ou conhecidos da pessoa ferida ou morta, elaborar relatório circunstanciado com as informações do art. 26 e relatar os fatos de modo fiel e detalhado às corregedorias. Essas ocorrências são imediatamente comunicadas ao Ministério Público e formalmente registradas. Os órgãos devem disponibilizar a cada profissional em serviço, no mínimo, um IMPO específico de debilitação, um IMPO específico de incapacitação e os equipamentos de proteção individual necessários, em plenas condições de uso e dentro da validade, independentemente de portar arma de fogo. A habilitação para uso de arma de fogo em serviço deve ser renovada a cada dois anos, após aprovação nos exames técnicos e psicológicos, ao passo que a Portaria 4.226/2010 previa renovação anual." } },

  // ════════════════════ MÓDULO 6 — Modelos de uso da força ════════════════════
  { modulo: "6", tipo: "certo_errado", enunciado: "O modelo FLETC é gráfico em degraus, com cinco camadas e três painéis: atitude do suspeito, percepção de risco para o policial e respostas de força possíveis.", gabarito: "certo", explicacao: "Correto. É a descrição do FLETC (Federal Law Enforcement Training Center)." },
  { modulo: "6", tipo: "certo_errado", enunciado: "No modelo FLETC original, a presença policial é considerada o primeiro nível de força.", gabarito: "errado", explicacao: "Errado. O FLETC original NÃO considera a presença policial nível de força, vinculando o primeiro nível aos comandos verbais. O modelo brasileiro, inspirado no FLETC, é que inclui a presença." },
  { modulo: "6", tipo: "certo_errado", enunciado: "No modelo Giliespie, a verbalização é graduação de força que interage com os demais níveis, iniciando-se no segundo nível e prosseguindo até o penúltimo, antes da força letal.", gabarito: "certo", explicacao: "Correto. É um modelo complexo, porém completo, adaptável à polícia brasileira com treinamento." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O modelo Remsberg, em forma de degrau sem elevação, correlaciona o nível de força com a ação do suspeito e com a percepção de risco do policial.", gabarito: "errado", explicacao: "Errado. O Remsberg NÃO faz essas correlações: apenas escalona a força. É simples e de fácil assimilação, mas incompleto." },
  { modulo: "6", tipo: "certo_errado", enunciado: "No modelo Canadense, composto por círculos sobrepostos, o círculo interno representa o comportamento do suspeito e o externo a resposta do policial, graduada em sete níveis.", gabarito: "certo", explicacao: "Correto. O círculo interno tem cinco subdivisões (do branco ao preto) e a mudança entre níveis não é estanque." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O modelo de Nashville, em forma de eixo de coordenadas, apresenta a avaliação de risco policial como parte integrante do gráfico.", gabarito: "errado", explicacao: "Errado. O detalhe do Nashville é justamente NÃO apresentar a avaliação de risco policial. O eixo X traz cinco níveis de atitude do suspeito e o eixo Y, quatro níveis de força." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O modelo Phoenix é o mais simples: uma tabela de duas colunas que divide os níveis de força e de atitude em sete graduações, a começar pela ausência de força e de resistência.", gabarito: "certo", explicacao: "Correto. É a descrição do modelo Phoenix." },
  { modulo: "6", tipo: "multipla", enunciado: "Dos modelos estudados, são apontados como interessantes para a polícia brasileira, por terem conteúdo mais completo e reproduzirem bem a realidade operacional:", alternativas: A(
    "Remsberg, Nashville e Phoenix",
    "FLETC, Remsberg e Phoenix",
    "Nashville, Canadense e Phoenix",
    "FLETC, Giliespie e Canadense",
    "Giliespie, Remsberg e Nashville"),
    gabarito: "D", explicacao: "FLETC, Giliespie e Canadense. O Canadense é o mais completo; o Brasil adotou modelo inspirado no FLETC." },
  { modulo: "6", tipo: "multipla", enunciado: "Os modelos que colocam a avaliação de risco como parte integrante do gráfico são:", alternativas: A(
    "FLETC e Giliespie",
    "Remsberg e Phoenix",
    "Nashville e Remsberg",
    "Phoenix e Nashville",
    "Canadense e Remsberg"),
    gabarito: "A", explicacao: "FLETC (painel de percepção de risco) e Giliespie (correlaciona atitude, avaliação de risco e condição mental do policial)." },
  { modulo: "6", tipo: "multipla", enunciado: "O modelo de uso da força adotado pelas polícias brasileiras é representado por:", alternativas: A(
    "círculos sobrepostos com sete cores",
    "tabela de duas colunas com sete graduações",
    "eixo de coordenadas com análise severa e branda",
    "degrau sem elevação, sem correlação com o suspeito",
    "gráfico em forma de trapézio com degraus em seis níveis, com a percepção do policial de um lado e as reações do outro"),
    gabarito: "E", explicacao: "O modelo brasileiro é um trapézio em seis níveis; da base ao topo, a força vai das opções mais reversíveis às menos reversíveis." },
  { modulo: "6", tipo: "dissertativa", enunciado: "Compare os modelos de uso da força FLETC, Canadense, Remsberg e Nashville quanto ao formato e à correlação com a atitude do suspeito e a avaliação de risco, e indique quais são recomendados para a polícia brasileira. (Mínimo 06 e máximo 12 linhas)", modelo: { estrutura: "Quatro modelos → recomendação.", criterios: ["FLETC: degraus, 5 camadas e 3 painéis; avaliação de risco; presença não é nível (no Brasil, é)", "Canadense: círculos sobrepostos; interno 5 subdivisões, externo 7 níveis; mudança não estanque; o mais completo", "Remsberg: degrau sem elevação; não correlaciona; simples e incompleto", "Nashville: eixo de coordenadas (X 5 atitudes, Y 4 níveis de força); sem avaliação de risco", "Recomendados: FLETC, Giliespie e Canadense"], resposta: "O modelo FLETC é um gráfico em degraus com cinco camadas e três painéis — atitude do suspeito, percepção de risco e respostas de força —, correlacionando todos esses elementos; não considera a presença policial nível de força, ao contrário do modelo brasileiro nele inspirado. O modelo Canadense é formado por círculos sobrepostos: o interno, com cinco subdivisões, representa o comportamento do suspeito, e o externo, com sete níveis e cores, a resposta do policial, em mudança não estanque; é o mais completo. O Remsberg tem forma de degrau sem elevação e apenas escalona a força em cinco níveis, sem correlacioná-la à ação do suspeito ou ao risco; é simples, mas incompleto. O Nashville usa um eixo de coordenadas, com cinco níveis de atitude do suspeito no eixo X e quatro níveis de força no eixo Y, mas não apresenta a avaliação de risco policial. Dos modelos estudados, FLETC, Giliespie e Canadense são os recomendados para a polícia brasileira, por serem mais completos e reproduzirem bem a realidade operacional." } },

  // ════════════════════ MÓDULO 7 — Níveis de submissão, níveis de força e técnicas de menor potencial ofensivo ════════════════════
  { modulo: "7", tipo: "certo_errado", enunciado: "Os níveis de submissão do suspeito são: normalidade, cooperativo, resistente passivo, resistente ativo, agressão não letal e agressão letal.", gabarito: "certo", explicacao: "Correto. São os seis níveis, em ordem crescente." },
  { modulo: "7", tipo: "certo_errado", enunciado: "No nível resistente passivo, o suspeito empurra o policial e tenta fugir, desafiando fisicamente o controle.", gabarito: "errado", explicacao: "Errado. Isso é o RESISTENTE ATIVO. O resistente passivo não acata as determinações e fica parado, sem reagir nem agredir." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A verbalização pode e deve ser utilizada em conjunto com qualquer outro nível de força, sempre que possível.", gabarito: "certo", explicacao: "Correto. No nível primário das TMPO, a verbalização deve ser empregada em TODOS os níveis." },
  { modulo: "7", tipo: "certo_errado", enunciado: "O controle de contato consiste no emprego de bastões e agentes químicos para superar a resistência ativa do suspeito.", gabarito: "errado", explicacao: "Errado. Bastões e espargidores caracterizam o CONTROLE FÍSICO. O controle de contato usa técnicas de mãos livres (imobilizações, chaves de articulação)." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Para ser eficaz, a verbalização deve ser clara e precisa e, visando à resolução pacífica de conflitos, firme, justa e cortês.", gabarito: "certo", explicacao: "Correto. Postura, voz, dicção, gesto e coerência influenciam a comunicação." },
  { modulo: "7", tipo: "certo_errado", enunciado: "O uso dissuasivo da arma de fogo — localizar, empunhar e apontar sem disparar — integra o nível secundário das técnicas de menor potencial ofensivo.", gabarito: "certo", explicacao: "Correto. É o quarto estágio do nível secundário." },
  { modulo: "7", tipo: "certo_errado", enunciado: "O nível terciário das técnicas de menor potencial ofensivo corresponde à verbalização com entonação firme.", gabarito: "errado", explicacao: "Errado. Verbalização é o nível PRIMÁRIO. O terciário é a força potencialmente letal: disparo de arma de fogo ou técnicas dirigidas a regiões vitais, só diante de risco iminente de morte ou lesão grave." },
  { modulo: "7", tipo: "multipla", enunciado: "São os níveis de força (resposta policial) do modelo brasileiro, em ordem crescente:", alternativas: A(
    "verbalização, presença física, controle físico, controle de contato, força letal e táticas defensivas",
    "presença física, verbalização, controle de contato, controle físico, táticas defensivas não letais e força letal",
    "presença física, controle físico, verbalização, força letal, controle de contato e táticas defensivas",
    "táticas defensivas, verbalização, presença física, controle de contato, controle físico e força letal",
    "controle de contato, presença física, verbalização, táticas defensivas, controle físico e força letal"),
    gabarito: "B", explicacao: "Presença física → verbalização → controle de contato → controle físico → táticas defensivas não letais → força letal." },
  { modulo: "7", tipo: "multipla", enunciado: "Diante de suspeito em nível de RESISTÊNCIA ATIVA, a resposta policial adequada, segundo o modelo de uso diferenciado da força, é:", alternativas: A(
    "apenas a presença física",
    "força letal imediata",
    "disparo de advertência",
    "controle físico, com técnicas de defesa pessoal e, se necessário, instrumentos como bastão e espargidores",
    "liberação do suspeito sem intervenção"),
    gabarito: "D", explicacao: "O controle físico emprega a força suficiente para superar a resistência ativa. Disparo de advertência é vedado." },
  { modulo: "7", tipo: "multipla", enunciado: "No nível SECUNDÁRIO das técnicas de menor potencial ofensivo, o estágio aplicado ao abordado resistente PASSIVO, com técnicas de mãos livres, é o:", alternativas: A(
    "controle com IMPO",
    "uso dissuasivo de arma de fogo",
    "controle de contato",
    "controle físico",
    "força potencialmente letal"),
    gabarito: "C", explicacao: "O controle de contato é para o resistente passivo; o controle físico e o controle com IMPO, para o resistente ativo." },
  { modulo: "7", tipo: "dissertativa", enunciado: "Descreva os três níveis das técnicas de menor potencial ofensivo (primário, secundário e terciário), detalhando os quatro estágios do nível secundário. (Mínimo 06 e máximo 12 linhas)", modelo: { estrutura: "Conceito de TMPO → primário → secundário (4 estágios) → terciário.", criterios: ["TMPO: procedimentos com IMPO para preservar vidas e minimizar danos", "Primário: verbalização, em todos os níveis; clara, firme, justa e cortês", "Secundário: controle de contato (resistente passivo, mãos livres); controle físico (resistente ativo, sem instrumentos); controle com IMPO (tonfa, químicos, algemas, elastômeros, armas de impulso elétrico); uso dissuasivo da arma de fogo", "Terciário: força potencialmente letal, só diante de risco iminente de morte ou lesão grave"], resposta: "As técnicas de menor potencial ofensivo são procedimentos empregados com instrumentos de menor potencial ofensivo para preservar vidas e minimizar danos, organizados em três níveis. O nível primário é a verbalização: comunicação oral com entonação e termos adequados, empregada em todos os níveis de força e que deve ser clara, firme, justa e cortês. O nível secundário tem quatro estágios: o controle de contato, com técnicas de mãos livres aplicadas ao resistente passivo; o controle físico, com técnicas de defesa pessoal de maior potencial de submissão, sem instrumentos, para o resistente ativo; o controle com IMPO, que recorre a bastão tonfa, agentes químicos, algemas, munições de impacto controlado e armas de impulso elétrico; e o uso dissuasivo da arma de fogo, em que o policial localiza, empunha ou aponta a arma para intimidar, sem dispará-la. O nível terciário é a força potencialmente letal — disparo de arma de fogo ou técnicas dirigidas a regiões vitais —, admitida somente em situações extremas de risco iminente de morte ou lesão grave, para fazer cessar a ameaça." } },

  // ════════════════════ MÓDULO 8 — Instrumentos de menor potencial ofensivo, espargidores e descontaminação ════════════════════
  { modulo: "8", tipo: "certo_errado", enunciado: "Quanto ao alvo, as armas de menor potencial ofensivo classificam-se em antipessoais e antimateriais.", gabarito: "certo", explicacao: "Correto. As antimateriais são usadas contra veículos e instalações para paralisar sua atividade." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Quanto ao emprego tático, os instrumentos debilitantes atuam diretamente no sistema nervoso, provocando confusão mental e desordem muscular.", gabarito: "errado", explicacao: "Errado. Isso descreve os INCAPACITANTES. Os debilitantes se baseiam na dor, no desconforto ou na inquietação, reduzindo a capacidade combativa." },
  { modulo: "8", tipo: "certo_errado", enunciado: "O agente pimenta (OC) tem como componente a oleorresina de capsaicina e ação imediata, provocando fechamento involuntário dos olhos e intensa sensação de queimadura.", gabarito: "certo", explicacao: "Correto. Bastam um ou dois jatos de 0,5 a 1 segundo contra a face do agressor." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Os efeitos do agente lacrimogênio (CS) duram, em geral, cerca de 40 minutos, mais que os do agente pimenta (OC).", gabarito: "errado", explicacao: "Errado. É o contrário: os efeitos do OC duram cerca de 40 minutos e os do CS, cerca de 10 minutos." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Os sprays de pimenta têm validade de cinco anos, se armazenados na embalagem original, em local fresco, seco, arejado e ao abrigo da luz solar.", gabarito: "certo", explicacao: "Correto. É a informação da apostila." },
  { modulo: "8", tipo: "certo_errado", enunciado: "A versão em espuma do spray de pimenta concentra os efeitos na pessoa visada e reduz a irritação das vias respiratórias, permitindo seu uso em ambientes fechados.", gabarito: "certo", explicacao: "Correto. O espargimento direcionado evita contaminar o ambiente e terceiros." },
  { modulo: "8", tipo: "certo_errado", enunciado: "Na descontaminação da pessoa atingida por agente químico, deve-se orientá-la a esfregar bem os olhos e mantê-los fechados, de costas para o vento.", gabarito: "errado", explicacao: "Errado. Deve-se orientar a NÃO esfregar os olhos e direcioná-la CONTRA o vento, mantendo os olhos abertos." },
  { modulo: "8", tipo: "multipla", enunciado: "Quanto à tecnologia, as armas de menor potencial ofensivo que funcionam pela aplicação de energia eletromagnética ou acústica são as:", alternativas: A(
    "físicas",
    "químicas",
    "biológicas",
    "de impacto psicológico",
    "de energia dirigida"),
    gabarito: "E", explicacao: "Energia dirigida: eletromagnética ou acústica. Físicas: impacto cinético ou restrição; químicas: reação química; biológicas: sistemas vivos; impacto psicológico: influenciam o raciocínio." },
  { modulo: "8", tipo: "multipla", enunciado: "São erros na descontaminação de pessoa atingida por agente químico, EXCETO:", alternativas: A(
    "colocar o contaminado em contato com pessoas não contaminadas",
    "conduzi-lo em viatura fechada sem prévia descontaminação",
    "deixá-lo em posição que impeça a abertura das vias aéreas, provocando asfixia postural",
    "lavar a região contaminada com água corrente fria em abundância",
    "deixar de prestar socorro médico quando necessário"),
    gabarito: "D", explicacao: "Lavar com água corrente fria em abundância é o sexto PASSO correto da descontaminação. As demais condutas são erros." },
  { modulo: "8", tipo: "multipla", enunciado: "Na descontaminação de ÁREA atingida por agente químico, recomenda-se:", alternativas: A(
    "fechar portas e janelas para conter o agente",
    "usar proteção respiratória (ou meio de fortuna), abrir portas e janelas para circular o ar e, em superfícies, aplicar solução de bicarbonato de sódio a 10%",
    "aplicar água quente sob pressão nas paredes",
    "aguardar 24 horas antes de qualquer providência, mesmo com OC",
    "usar álcool em gel para neutralizar o agente"),
    gabarito: "B", explicacao: "Proteger as vias respiratórias, ventilar o ambiente e usar bicarbonato de sódio a 10% nas superfícies. O OC se dissipa em minutos." },
  { modulo: "8", tipo: "dissertativa", enunciado: "Descreva os sete passos da descontaminação de pessoa atingida por agente químico e cite três erros a serem evitados nesse procedimento. (Mínimo 05 e máximo 12 linhas)", modelo: { estrutura: "Sete passos em ordem → erros.", criterios: ["1 afastar do local; 2 acalmar verbalmente; 3 não esfregar os olhos; 4 contra o vento, olhos abertos; 5 cabeça elevada; 6 água corrente fria em abundância; 7 pronto-socorro se persistirem os sintomas", "Erros (três): contato com não contaminados; viatura fechada sem descontaminar; asfixia postural; não remover gel ou espuma do rosto; não prestar socorro"], resposta: "A descontaminação da pessoa segue sete passos: primeiro, afastá-la do local onde foi aplicado o agente químico; segundo, acalmá-la por meio de orientação verbal; terceiro, orientá-la a não esfregar com as mãos os olhos ou as regiões com ardência; quarto, direcioná-la contra o vento para aliviar o ardor, mantendo os olhos abertos; quinto, elevar sua cabeça para que as vias aéreas permaneçam abertas, auxiliando a respiração; sexto, lavar a região contaminada com água corrente fria em abundância; e sétimo, se os sintomas persistirem, conduzi-la imediatamente ao pronto-socorro. Devem ser evitados erros como colocar o contaminado em contato com pessoas não contaminadas, conduzi-lo em viatura fechada sem prévia descontaminação, deixá-lo em posição que provoque asfixia postural, não remover mecanicamente o agente do tipo gel ou espuma do rosto e deixar de prestar socorro médico quando necessário." } },

  // ════════════════════ SIMULADO — formato da prova (10,0 pontos) ════════════════════
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "A divisão da força em níveis é gradual e admite tanto a progressão quanto a regressão, conforme a ameaça. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "O Código de Conduta para os Funcionários Responsáveis pela Aplicação da Lei é um tratado internacional de 1990. (Valor: 0,20)", gabarito: "errado", explicacao: "Errado. O Código de Conduta é de 1979. O documento de 1990 são os Princípios Básicos, que também não são um tratado, mas orientação aos Estados." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Pelos Princípios Básicos da ONU, ao lidar com pessoas sob custódia, a força só será usada quando estritamente necessária para manter a segurança e a ordem na instituição ou diante de ameaça à segurança pessoal. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Pelo CPP, à noite e não atendida a intimação do morador, o executor do mandado de prisão arromba de imediato a porta da casa. (Valor: 0,20)", gabarito: "errado", explicacao: "Errado. À noite, guardam-se as saídas, torna-se a casa incomunicável e só se arromba ao amanhecer." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Pela Lei nº 13.060/2014, não é legítimo o uso de arma de fogo contra veículo que desrespeite bloqueio policial, salvo quando o ato represente risco de morte ou lesão aos agentes ou a terceiros. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "A Portaria MJSP nº 855/2025 revogou a Portaria Interministerial nº 4.226/2010. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "A moderação e a conveniência figuram entre os sete princípios gerais da Portaria nº 855/2025. (Valor: 0,20)", gabarito: "errado", explicacao: "Errado. Os sete são legalidade, precaução, necessidade, proporcionalidade, razoabilidade, responsabilização e não discriminação." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Pela Portaria nº 855/2025, a renovação da habilitação para uso de arma de fogo em serviço deve ocorrer a cada dois anos. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto. Antes, pela Portaria 4.226/2010, era anual." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Os chamados disparos de advertência são prática aceitável quando o suspeito desobedece à ordem de parada. (Valor: 0,20)", gabarito: "errado", explicacao: "Errado. Disparar a esmo ou a título de advertência é vedado." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "No gerenciamento de crises, a negociação é a principal alternativa tática. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "O modelo Phoenix é o mais completo dos modelos de uso da força estudados. (Valor: 0,20)", gabarito: "errado", explicacao: "Errado. O Phoenix é o MAIS SIMPLES; o mais completo é o Canadense." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "No modelo brasileiro, diferentemente do FLETC original, a presença policial é considerada nível de força. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "O suspeito que não acata as determinações e permanece parado, sem reagir nem agredir, enquadra-se como resistente ativo. (Valor: 0,20)", gabarito: "errado", explicacao: "Errado. É o resistente PASSIVO." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Os instrumentos incapacitantes atuam diretamente no sistema nervoso, causando reações involuntárias no organismo. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto." },
  { modulo: "SIM", tipo: "certo_errado", contexto: BLOCO_VF, enunciado: "Os efeitos do agente pimenta (OC) costumam durar cerca de 40 minutos, e os do lacrimogênio (CS), cerca de 10 minutos. (Valor: 0,20)", gabarito: "certo", explicacao: "Correto." },
  { modulo: "SIM", tipo: "multipla", contexto: BLOCO_MC, enunciado: "Sobre a Portaria MJSP nº 855/2025, assinale a alternativa CORRETA: (Valor: 0,50)", alternativas: A(
    "Cada profissional em serviço deve receber, no mínimo, um IMPO de debilitação, um de incapacitação e os EPI necessários.",
    "Aplica-se exclusivamente à Polícia Federal.",
    "Mantém a renovação anual da habilitação para arma de fogo.",
    "Admite o disparo de advertência em abordagens.",
    "Dispensa a comunicação ao Ministério Público em ocorrências com morte."),
    gabarito: "A", explicacao: "A Portaria exige dotação mínima de 1 IMPO de debilitação, 1 de incapacitação e EPI; aplica-se também a estados que recebem recursos do FNSP/FUNPEN; renovação a cada 2 anos; veda disparo de advertência; morte e lesão são comunicadas imediatamente ao MP." },
  { modulo: "SIM", tipo: "multipla", contexto: BLOCO_MC, enunciado: "O princípio segundo o qual um recurso de força só pode ser empregado quando outros de menor intensidade não forem suficientes para atingir os objetivos legais é o da: (Valor: 0,50)", alternativas: A(
    "razoabilidade",
    "precaução",
    "proporcionalidade",
    "necessidade",
    "legalidade"),
    gabarito: "D", explicacao: "É o princípio da necessidade." },
  { modulo: "SIM", tipo: "multipla", contexto: BLOCO_MC, enunciado: "O modelo de uso da força em forma de eixo de coordenadas, com cinco níveis de atitude do suspeito no eixo X, quatro níveis de força no eixo Y e sem avaliação de risco policial, é o: (Valor: 0,50)", alternativas: A(
    "FLETC",
    "Canadense",
    "Nashville",
    "Remsberg",
    "Giliespie"),
    gabarito: "C", explicacao: "É o modelo de Nashville." },
  { modulo: "SIM", tipo: "multipla", contexto: BLOCO_MC, enunciado: "Quanto ao agente lacrimogênio (CS), assinale a alternativa CORRETA: (Valor: 0,50)", alternativas: A(
    "Tem como componente a oleorresina de capsaicina.",
    "Seus efeitos duram, em geral, cerca de 40 minutos.",
    "Deve ser acionado contra o tórax do agressor, nunca contra a face.",
    "Age em poucos segundos, provocando lacrimejamento intenso, espirros e irritação da pele, das mucosas e do sistema respiratório.",
    "É o agente indicado para ambientes fechados por não contaminar terceiros."),
    gabarito: "D", explicacao: "O CS (ortoclorobenzilmalononitrila) age em segundos e seus efeitos duram cerca de 10 minutos; aciona-se contra a face. A oleorresina de capsaicina é o OC, e a versão indicada para ambientes fechados é a espuma de pimenta." },
  { modulo: "SIM", tipo: "dissertativa", enunciado: "Diferencie o Código de Conduta para os Funcionários Responsáveis pela Aplicação da Lei (ONU, 1979) dos Princípios Básicos sobre o Uso da Força e Armas de Fogo (ONU, 1990), indicando as regras centrais de cada um sobre o uso da força. (Mínimo 05 e máximo 12 linhas) (Valor: 1,50)", modelo: { estrutura: "CCEAL (1979) → Princípios Básicos (1990) → regras centrais.", criterios: ["CCEAL: AG/ONU 1979; servir e proteger (art. 1º); força só estritamente necessária (art. 3º); vedação de tortura sem justificativas (art. 5º); proteção da saúde (art. 6º)", "Princípios Básicos: 1990; não é tratado, é orientação; segundo instrumento mais importante", "Regras: meios não violentos antes; moderação, proporção, socorro e notificação; arma só em legítima defesa ou ameaça iminente; letal só se inevitável; aviso prévio; comunicar superiores"], resposta: "O Código de Conduta para os Funcionários Responsáveis pela Aplicação da Lei foi adotado pela Assembleia Geral da ONU em 1979 e busca sensibilizar os agentes para a responsabilidade que o Estado lhes confere: devem cumprir o dever legal servindo à comunidade e protegendo todos contra atos ilegais (art. 1º), só empregar a força quando estritamente necessária e na medida exigida (art. 3º), jamais infligir ou tolerar tortura, sem invocar ordens superiores ou circunstâncias excepcionais (art. 5º), e proteger a saúde das pessoas sob sua guarda (art. 6º). Os Princípios Básicos sobre o Uso da Força e Armas de Fogo, de 1990, são o segundo instrumento internacional mais importante sobre o tema e, embora não sejam tratado, orientam os Estados. Eles determinam o uso de meios não violentos antes da força; quando esta for inevitável, moderação, proporção, preservação da vida, socorro aos feridos, notificação a familiares e comunicação imediata aos superiores; e só admitem arma de fogo contra pessoas em legítima defesa ou diante de ameaça iminente de morte ou ferimento grave, com uso letal intencional apenas quando estritamente inevitável e, em regra, com aviso prévio." } },
  { modulo: "SIM", tipo: "dissertativa", enunciado: "Relacione os níveis de submissão do suspeito com os níveis de força (resposta policial) do modelo brasileiro de uso diferenciado da força, explicando cada correspondência. (Mínimo 06 e máximo 12 linhas) (Valor: 1,50)", modelo: { estrutura: "Seis pares: submissão → resposta.", criterios: ["Normalidade → presença física", "Cooperativo → verbalização", "Resistente passivo → controle de contato (mãos livres)", "Resistente ativo → controle físico (defesa pessoal, bastão, espargidores)", "Agressão não letal → táticas defensivas não letais (IMPO; uso dissuasivo da arma)", "Agressão letal → força letal, último recurso em legítima defesa"], resposta: "No modelo brasileiro, cada nível de submissão do suspeito corresponde a uma resposta policial. Na normalidade, situação rotineira, basta a presença física do policial, bem fardado e atento, que por si só previne o crime. Diante do suspeito cooperativo, que acata as ordens e pode ser abordado e revistado facilmente, emprega-se a verbalização, que acompanha todos os demais níveis. O resistente passivo, que não acata as determinações e fica parado sem agredir, exige o controle de contato, com técnicas de mãos livres como imobilizações e chaves de articulação. O resistente ativo, que tenta fugir ou empurra o policial, exige o controle físico, com técnicas de defesa pessoal e equipamentos como bastões e espargidores. A agressão não letal, ataque físico ao policial ou a terceiros, é respondida com táticas defensivas não letais, com instrumentos de menor potencial ofensivo e até o uso dissuasivo da arma de fogo. A agressão letal, ameaça séria à vida, autoriza a força letal, nível máximo reservado à legítima defesa da vida do policial ou de terceiros quando os demais meios se mostrarem ineficazes." } },
  { modulo: "SIM", tipo: "dissertativa", enunciado: "Durante abordagem, um policial disparou contra um suspeito que reagiu armado, ferindo-o gravemente. Com base na Portaria MJSP nº 855/2025, descreva os princípios que devem ter orientado a ação, as hipóteses em que o uso de arma de fogo não seria legítimo e as providências obrigatórias após o fato. (Mínimo 08 e máximo 15 linhas) (Valor: 2,00)", modelo: { estrutura: "Princípios → arma como último recurso e vedações → providências pós-fato → registro e comunicação.", criterios: ["Princípios: legalidade, precaução, necessidade, proporcionalidade, razoabilidade, responsabilização e não discriminação; priorizar comunicação e desescalonamento", "Arma de fogo como último recurso, só por profissional habilitado", "Não legítimo: pessoa em fuga desarmada ou sem risco; veículo que fura bloqueio sem risco; disparo a esmo ou de advertência; apontar arma como rotina", "Providências: socorro; preservar o local; polícia judiciária e peritos; comunicar familiares; relatório circunstanciado (art. 26); relato às corregedorias", "Comunicação imediata ao MP e registro formal"], resposta: "A ação deveria observar os sete princípios da Portaria nº 855/2025: legalidade (objetivo legal, nos limites da lei), precaução (planejamento para prevenir ou minimizar a força e mitigar danos), necessidade (só após a insuficiência de meios menos intensos), proporcionalidade (força compatível com a gravidade da ameaça), razoabilidade (bom senso, prudência e equilíbrio), responsabilização e não discriminação, priorizando a comunicação, a negociação e as técnicas de desescalonamento. A arma de fogo é medida de último recurso, restrita a profissionais habilitados; diante de suspeito que reage armado, colocando a vida em risco iminente, seu uso pode ser legítimo. Não seria legítimo, porém, disparar contra pessoa em fuga desarmada ou que não representasse risco imediato de morte ou lesão, contra veículo que apenas desrespeitasse bloqueio, a esmo ou a título de advertência, nem apontar a arma como prática rotineira. Após o fato, o policial deve facilitar o socorro ao ferido, preservar o local, solicitar a polícia judiciária e os peritos criminais, comunicar a ocorrência aos familiares do ferido, elaborar relatório circunstanciado com as informações do art. 26 — data, local, envolvidos, equipamentos, medidas prévias, circunstâncias, arma, munição e disparos, assistência médica e preservação do local — e relatar fielmente os fatos à corregedoria. A ocorrência deve ser formalmente registrada e imediatamente comunicada ao Ministério Público." } },
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
