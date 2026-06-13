import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "ACE"

type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string }
  | { modulo: string; tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string } }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

// Questões focadas nas "Gaivotas" ACE — tópicos destacados para prova
const QS: Q[] = [

  // ── Cap. 1 — História ──
  {
    modulo: "1", tipo: "certo_errado",
    enunciado: "A análise criminal tem raízes na atividade de Inteligência, remontando às estratégias chinesas de guerra e às batalhas descritas na Bíblia.",
    gabarito: "certo",
    explicacao: "Correto. Antes mesmo de qualquer organização policial formal, a coleta e análise de informações era praticada em contextos militares (Sun Tzu) e bíblicos.",
  },
  {
    modulo: "1", tipo: "certo_errado",
    enunciado: "Henry Fielding (1707–1754), magistrado inglês, é apontado como precursor do uso estruturado da análise criminal ao criar os 'Bow Street Runners' e sistematizar informações sobre crimes.",
    gabarito: "certo",
    explicacao: "Correto. Fielding foi pioneiro ao coletar e utilizar informações criminais de forma sistemática, sendo considerado um dos precursores da análise criminal.",
  },
  {
    modulo: "1", tipo: "certo_errado",
    enunciado: "Robert Peel fundou a Polícia Metropolitana de Londres em 1829, sendo este um marco do policiamento moderno e profissional.",
    gabarito: "certo",
    explicacao: "Correto. Robert Peel criou a Scotland Yard em 1829 com base em princípios que enfatizavam a prevenção do crime e o relacionamento com a comunidade — pilares do policiamento moderno.",
  },
  {
    modulo: "1", tipo: "certo_errado",
    enunciado: "O conceito de Modus Operandi (MO) surgiu no século XX, após a criação das primeiras organizações de análise criminal nos EUA.",
    gabarito: "errado",
    explicacao: "Errado. O conceito de Modus Operandi surgiu no século XIX como instrumento de análise para identificar padrões e autores reincidentes pelo modo de agir do criminoso.",
  },
  {
    modulo: "1", tipo: "certo_errado",
    enunciado: "August Vollmer, conhecido como o 'pai da polícia americana', utilizou pioneiramente o mapa de pinos para registrar a localização geográfica dos crimes e organizou o primeiro serviço de chamada de emergência.",
    gabarito: "certo",
    explicacao: "Correto. Vollmer chefiou o Dep. de Polícia de Berkeley por 27 anos e é creditado pelo uso do pin map, pelo precursor do 911 e pela profissionalização científica da polícia americana.",
  },
  {
    modulo: "1", tipo: "multipla",
    enunciado: "O termo 'análise de crime' foi formalizado por:",
    alternativas: A(
      "O.W. Wilson, na 2ª edição de 'Administração Policial' (1963)",
      "August Vollmer, em seu manual de Berkeley (1920)",
      "Henry Fielding, ao criar os Bow Street Runners (1750)",
      "Robert Peel, ao fundar a Polícia Metropolitana (1829)",
      "August Vollmer, na fundação da IALEIA (1980)",
    ),
    gabarito: "A",
    explicacao: "Correto. O.W. Wilson formalizou o termo 'análise de crime' na 2ª edição de 'Police Administration' (1963), marco conceitual da disciplina.",
  },
  {
    modulo: "1", tipo: "multipla",
    enunciado: "A consolidação da análise criminal nos EUA e a chamada 'Era de Ouro' dos analistas ocorreram, respectivamente, nas décadas de:",
    alternativas: A(
      "1960 e 1990",
      "1970 e 1980",
      "1950 e 1970",
      "1980 e 2000",
      "1960 e 1980",
    ),
    gabarito: "A",
    explicacao: "Correto. A consolidação ocorreu na década de 1960 e a Era de Ouro foi a década de 1990 — impulsionada pelo CompStat (NYPD, 1994), pela IACA (1990), por fundos federais e pelo mapeamento acessível.",
  },
  {
    modulo: "1", tipo: "certo_errado",
    enunciado: "A 'Era de Ouro' da análise criminal norte-americana foi marcada pelo CompStat (NYPD, 1994), pela fundação da IACA, por novos fundos federais e por tecnologias de mapeamento acessíveis.",
    gabarito: "certo",
    explicacao: "Correto. Todos esses fatores convergiram na década de 1990 para impulsionar a profissionalização e o reconhecimento da análise criminal nos EUA.",
  },
  {
    modulo: "1", tipo: "dissertativa",
    enunciado: "Descreva a linha do tempo histórica da análise criminal, citando os principais personagens e marcos até a consolidação nos EUA.",
    modelo: {
      estrutura: "Raízes → Fielding → Peel → Século XIX (MO) → Vollmer → Wilson → Consolidação (1960) → Era de Ouro (1990).",
      criterios: [
        "Mencionar raízes na Inteligência (estratégias chinesas)",
        "Citar Henry Fielding e os Bow Street Runners",
        "Citar Robert Peel e a Polícia Metropolitana de 1829",
        "Mencionar Modus Operandi no século XIX",
        "Citar August Vollmer (pai da polícia americana, pin map, emergência)",
        "Citar O.W. Wilson (1963) e a formalização do termo",
        "Consolidação na década de 60 e Era de Ouro nos anos 90",
      ],
      resposta: "A análise criminal tem raízes na Inteligência militar (Sun Tzu, estratégias chinesas). Henry Fielding (1707–1754) pioneirizou o uso sistemático de informações criminais com os Bow Street Runners. Robert Peel fundou a Polícia Metropolitana de Londres em 1829, inaugurando o policiamento moderno. No século XIX surgiu o conceito de Modus Operandi. August Vollmer ('pai da polícia americana') introduziu o mapa de pinos e o serviço de emergência. Em 1963, O.W. Wilson formalizou o termo 'análise de crime'. A consolidação institucional ocorreu na década de 1960 e a Era de Ouro foi a década de 1990 (CompStat/NYPD 1994, IACA 1990, fundos federais, mapeamento acessível).",
    },
  },

  // ── Cap. 2 — Fundamentos ──
  {
    modulo: "2", tipo: "certo_errado",
    enunciado: "O objetivo do policiamento orientado a problemas (POP) é tratar a causa do problema, em detrimento do evento pontual.",
    gabarito: "certo",
    explicacao: "Correto. O POP visa atacar as causas subjacentes dos problemas de segurança, e não apenas responder reativamente a cada incidente isolado.",
  },
  {
    modulo: "2", tipo: "certo_errado",
    enunciado: "A principal problemática do Brasil no campo da análise criminal é a ausência de cultura técnica nas organizações policiais.",
    gabarito: "certo",
    explicacao: "Correto. A apostila aponta a falta de cultura técnica — dependência da intuição em vez de dados sistematizados — como o grande obstáculo à implementação da análise criminal no Brasil.",
  },
  {
    modulo: "2", tipo: "certo_errado",
    enunciado: "Os dados de segurança pública servem, segundo a apostila, para orientar, formar e permitir.",
    gabarito: "certo",
    explicacao: "Correto. Os dados orientam a Administração nas ações policiais, permitem que a população conheça o que acontece ao seu redor e permitem que a sociedade civil objetive demandas e participe.",
  },
  {
    modulo: "2", tipo: "multipla",
    enunciado: "As duas dimensões da análise criminal são:",
    alternativas: A(
      "Tática e estratégica",
      "Operacional e administrativa",
      "Preventiva e repressiva",
      "Quantitativa e qualitativa",
      "Descritiva e inferencial",
    ),
    gabarito: "A",
    explicacao: "Correto. A análise criminal possui dimensão TÁTICA (melhora investigações e patrulhamento — padrões de médio prazo) e ESTRATÉGICA (projeção de cenários — tendências de longo prazo).",
  },
  {
    modulo: "2", tipo: "certo_errado",
    enunciado: "A análise criminal é uma ciência isolada, restrita à estatística, sem interface com outras disciplinas do conhecimento.",
    gabarito: "errado",
    explicacao: "Errado. A análise criminal é MULTIDISCIPLINAR: integra estatística, geografia, ciências sociais, direito, TI, psicologia e outras áreas para compreender o fenômeno criminal.",
  },
  {
    modulo: "2", tipo: "multipla",
    enunciado: "São características esperadas de um bom analista criminal, EXCETO:",
    alternativas: A(
      "Reativo: aguarda as demandas para então iniciar suas análises",
      "Proativo: antecipa problemas sem esperar demanda",
      "Pesquisador: busca e fundamenta análises em dados",
      "Bom avaliador: interpreta resultados com rigor crítico",
      "Olhar investigativo: questiona, correlaciona e aprofunda",
    ),
    gabarito: "A",
    explicacao: "O analista deve ser proativo, e não reativo. As demais características (pesquisador, bom avaliador, olhar investigativo) são perfis esperados segundo a apostila (pág. 21).",
  },
  {
    modulo: "2", tipo: "multipla",
    enunciado: "As 4 etapas do trabalho do analista criminal, na ordem correta, são:",
    alternativas: A(
      "Sistematizar e analisar dados → Submeter os padrões → Identificar formas de intervir → Avaliar o impacto",
      "Coleta → Crítica → Apresentação → Análise dos dados",
      "Identificar o problema → Coletar dados → Intervir → Relatar",
      "Avaliar → Sistematizar → Submeter → Identificar",
      "Análise → Intervenção → Avaliação → Sistematização",
    ),
    gabarito: "A",
    explicacao: "Correto (pág. 25). As 4 etapas são: (1) Sistematizar e analisar dados; (2) Submeter os padrões aos decisores; (3) Identificar formas de intervir; (4) Avaliar o impacto das intervenções. Atenção: não confundir com o fluxo estatístico (Coleta → Crítica → Apresentação → Análise).",
  },
  {
    modulo: "2", tipo: "dissertativa",
    enunciado: "Explique o conceito de focalização na análise criminal e descreva o que representa a pirâmide da focalização.",
    modelo: {
      estrutura: "Conceito de focalização → importância → pirâmide (3 estratos) → aplicação prática.",
      criterios: [
        "Definir focalização como olhar o crime de forma separada",
        "Mencionar análise individualizada de tipo, local, horário e perfil",
        "Descrever a pirâmide (base: incidentes; meio: padrões; topo: prioridades)",
        "Relacionar à concentração do crime (Pareto) e ao policiamento focalizado",
      ],
      resposta: "A focalização consiste em olhar o crime de forma separada — analisar cada tipo de crime, local, horário e perfil de vítima/autor de modo individualizado, sem agregar tudo em conjunto. Isso permite direcionar recursos com precisão, evitando ações genéricas. A pirâmide da focalização (pág. 27) representa a concentração do crime segundo o princípio de Pareto: poucos locais, ofensores e vítimas respondem pela maioria das ocorrências. A base da pirâmide são os incidentes pontuais e difusos; o meio, os padrões táticos (hot spots, séries criminais); o topo (minoria, mas maior impacto) são os criminosos, vítimas e locais prioritários. A pirâmide orienta o policiamento focalizado — concentrar esforços onde o retorno é maior.",
    },
  },
  {
    modulo: "2", tipo: "dissertativa",
    enunciado: "Por que fazer análise criminal? Explique a nova perspectiva que justifica seu uso.",
    modelo: {
      estrutura: "Crítica à ação reativa → proposta preventiva → vantagens → efetividade.",
      criterios: [
        "Contrapor ação reativa (cadeia sem fim de incidentes) à ação preventiva",
        "Mencionar examinar causas, leque amplo de opções e custo × benefício",
        "Associar ao policiamento orientado a problemas",
        "Citar eficiência: mais preventivo = mais eficiente",
      ],
      resposta: "A análise criminal justifica-se pela necessidade de sair da ação reativa — que produz uma cadeia interminável de resposta a incidentes — para a ação preventiva, que cria ambientes seguros de forma sustentável. A nova perspectiva exige: (1) examinar cada problema e suas causas profundas; (2) considerar um leque amplo de opções de intervenção; (3) escolher pela relação custo × benefício, orientada a resultados mensuráveis. Quanto mais preventiva for a atuação policial, maior sua eficiência. O policiamento orientado a problemas (POP) tem fortes evidências de redução da criminalidade (Skogan e Frydl, 2004).",
    },
  },
  {
    modulo: "2", tipo: "dissertativa",
    enunciado: "Fale sobre a análise criminal: conceito, objetivo e por que ela é considerada multidisciplinar.",
    modelo: {
      estrutura: "Conceito → objetivo → multidisciplinaridade → dimensões (tática e estratégica).",
      criterios: [
        "Definir análise criminal como coleta e análise de informação sobre criminalidade",
        "Mencionar subsídio ao dimensionamento de recursos e gestão do patrulhamento",
        "Explicar a natureza multidisciplinar (diversas ciências envolvidas)",
        "Citar as duas dimensões: tática e estratégica",
      ],
      resposta: "A análise criminal é, genericamente, a coleta e análise de informação pertinente ao fenômeno da criminalidade. Permite detectar padrões criminais, correlacionar delitos e autores, traçar perfis de alvos e delinquentes e até prever crimes. Subsidia o dimensionamento e posicionamento de recursos e a gestão do patrulhamento e da investigação. É multidisciplinar porque integra estatística, geografia, ciências sociais, direito, tecnologia da informação e psicologia. Possui duas dimensões: a tática (padrões de médio prazo, subsídio às operações de rua) e a estratégica (tendências de longo prazo, formulação de políticas públicas).",
    },
  },

  // ── Cap. 4 — Coleta ──
  {
    modulo: "4", tipo: "certo_errado",
    enunciado: "A pulseira de identificação cadavérica foi criada em Pernambuco para combater a hiper-notificação dos registros de CVLI, atribuindo a cada morte violenta uma identificação numérica única.",
    gabarito: "certo",
    explicacao: "Correto. A pulseira evita a duplicidade de registros entre diferentes bases de dados (polícia, IML, SAMU), garantindo a integridade das estatísticas de CVLI.",
  },
  {
    modulo: "4", tipo: "certo_errado",
    enunciado: "Em Pernambuco, a base estatística criminal é coletada pela Polícia Civil por meio dos Registros de Ocorrência (RO), categorizados conforme o Código Penal e o Sistema INFOPOL.",
    gabarito: "certo",
    explicacao: "Correto. Os ROs são a principal fonte de dados estatísticos criminais em PE, alimentando o INFOPOL e servindo de base para a análise pela GACE/SDS.",
  },

  // ── Cap. 5 — Estatística ──
  {
    modulo: "5", tipo: "multipla",
    enunciado: "O tipo de gráfico mais indicado para representar séries temporais e identificar tendências, sazonalidade e anomalias nas séries criminais é:",
    alternativas: A(
      "Gráfico de linhas/curvas",
      "Gráfico de barras horizontais",
      "Gráfico de setores (pizza)",
      "Histograma",
      "Polígono de frequência",
    ),
    gabarito: "A",
    explicacao: "Correto. O gráfico de linhas/curvas (pág. 68/69) representa séries temporais — cada ponto equivale a um período — e é o mais adequado para identificar tendências, sazonalidade e anomalias ao longo do tempo.",
  },

  // ── Cap. 6 — Mapeamento ──
  {
    modulo: "6", tipo: "multipla",
    enunciado: "A diferença entre geoprocessamento e Sistema de Informações Geográficas (SIG) é que:",
    alternativas: A(
      "Geoprocessamento é o conjunto de tecnologias; o SIG é a aplicação específica que executa cada função",
      "SIG e geoprocessamento são termos completamente sinônimos e intercambiáveis",
      "O SIG é mais amplo que o geoprocessamento, que é apenas um módulo do SIG",
      "Geoprocessamento refere-se somente ao GPS; o SIG abrange todas as tecnologias espaciais",
      "O SIG trata dados estatísticos; o geoprocessamento, dados geográficos",
    ),
    gabarito: "A",
    explicacao: "Correto. Geoprocessamento é o conjunto de tecnologias para coletar e tratar informações espaciais (cartografia, sensoriamento remoto, GPS, BD). O SIG é a aplicação que executa essas funções com ênfase em análise espacial — armazena atributos descritivos + geometrias.",
  },
  {
    modulo: "6", tipo: "multipla",
    enunciado: "As 3 gerações de SIG, na ordem cronológica, são:",
    alternativas: A(
      "CAD Cartográfico → Banco de Dados Geográfico → Bibliotecas Geográficas Digitais",
      "Bibliotecas Digitais → CAD Cartográfico → Banco de Dados Geográfico",
      "Banco de Dados Geográfico → CAD Cartográfico → Bibliotecas Digitais",
      "CAD Cartográfico → Bibliotecas Digitais → Banco de Dados Geográfico",
      "SIG Web → CAD Cartográfico → Banco de Dados Geográfico",
    ),
    gabarito: "A",
    explicacao: "Correto (pág. 82/83 da apostila). 1ª geração: CAD Cartográfico (herança da cartografia, mapa como paradigma). 2ª geração: Banco de Dados Geográfico (início dos anos 1990, cliente-servidor). 3ª geração: Bibliotecas Geográficas Digitais (fim dos anos 1990, enormes bases, acesso via web).",
  },
  {
    modulo: "6", tipo: "certo_errado",
    enunciado: "O mapeamento criminal por 'mapa de pinos' é a forma histórica de marcar a localização dos crimes, tendo sido utilizado pioneiramente por August Vollmer.",
    gabarito: "certo",
    explicacao: "Correto. O pin map (mapa de alfinetes/pinos) foi introduzido por Vollmer no Dep. de Polícia de Berkeley, sendo uma das primeiras formas de visualização geográfica do crime — precursor dos modernos mapas de pontos quentes.",
  },
  {
    modulo: "6", tipo: "certo_errado",
    enunciado: "O mapeamento de crimes nas páginas 77–79 da apostila aborda como os SIGs permitem a superposição de camadas (layers) de informação para análise espacial de ocorrências criminais.",
    gabarito: "certo",
    explicacao: "Correto. O SIG permite sobrepor planos de informação (ruas, distritos, ocorrências, variáveis socioeconômicas) ligados a um SGBD, possibilitando análise espacial integrada do fenômeno criminal.",
  },

  // ── Cap. 3 — Teorias Sociológicas ──
  {
    modulo: "3", tipo: "multipla",
    enunciado: "Sobre as teorias sociológicas do crime, associe corretamente: (I) Escolha Racional; (II) Atividade de Rotina; (III) Padrão Criminal.",
    alternativas: A(
      "I = pondera custos × benefícios; II = encontro no tempo/espaço; III = nós, caminhos e fronteiras",
      "I = nós, caminhos e fronteiras; II = pondera custos × benefícios; III = encontro no tempo/espaço",
      "I = encontro no tempo/espaço; II = nós, caminhos e fronteiras; III = pondera custos × benefícios",
      "I = pondera custos × benefícios; II = nós, caminhos e fronteiras; III = encontro no tempo/espaço",
      "I = fronteiras; II = escolha; III = rotina",
    ),
    gabarito: "A",
    explicacao: "Correto. (I) Escolha Racional (Cornish & Clarke): crime é decisão que pondera benefícios × custos. (II) Atividade de Rotina (Cohen & Felson, 1979): encontro entre ofensor, vítima e ausência de guardião no tempo/espaço. (III) Padrão Criminal: nós (nodes), caminhos (paths) e fronteiras (edges) na área de atividade do ofensor.",
  },

  // ── Cap. 7 — Ferramentas ──
  {
    modulo: "7", tipo: "multipla",
    enunciado: "A diferença principal entre o Microsoft Excel e o LibreOffice Calc é que:",
    alternativas: A(
      "Excel é proprietário e pago; Calc é código aberto e gratuito — funcionalidades essenciais são muito similares",
      "Excel é gratuito e de código aberto; Calc é proprietário e pago",
      "O Calc não possui tabela dinâmica, ao contrário do Excel",
      "O Excel não lê arquivos .ods, que é o formato nativo do Calc",
      "O Calc é exclusivo para macOS; o Excel, para Windows",
    ),
    gabarito: "A",
    explicacao: "Correto. Excel (Microsoft) é proprietário/pago; Calc (LibreOffice/BrOffice) é código aberto/gratuito. As funcionalidades essenciais para análise criminal — fórmulas, gráficos, tabela dinâmica — são muito similares em ambos.",
  },
  {
    modulo: "7", tipo: "certo_errado",
    enunciado: "O QlikView é a ferramenta utilizada nas reuniões do programa 'Juntos pela Segurança' para monitorar indicadores, com dashboards por 'arrastar e soltar'.",
    gabarito: "certo",
    explicacao: "Correto. O QlikView é a solução de BI utilizada nessas reuniões; funciona de modo similar ao Power BI, com dashboards interativos construídos por arrastar e soltar.",
  },
  {
    modulo: "7", tipo: "certo_errado",
    enunciado: "O Sistema INFOPOL possui visão de ocorrências (todas as registradas pela Polícia Civil) e visão de homicídio (que inclui homicídio doloso, latrocínio, lesão seguida de morte, feminicídio, suicídio e acidentes fatais).",
    gabarito: "certo",
    explicacao: "Correto. O INFOPOL é administrado pela GGTI/SDS e é a principal ferramenta de coleta e análise de ocorrências policiais em PE, com essas duas visões distintas.",
  },
  {
    modulo: "7", tipo: "certo_errado",
    enunciado: "O SACE (Sistema de Análise Criminal e Estatística) foi desenvolvido pela GGACE e utiliza o Power BI para transformar dados criminais em insights interativos.",
    gabarito: "certo",
    explicacao: "Correto. O SACE usa o Power BI (coleção de serviços, apps e conectores da Microsoft) para monitorar indicadores de resultado e de processo da segurança pública em PE.",
  },
]

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MAT } })
  if (!disc) throw new Error(`Disciplina ${MAT} não existe.`)
  let c = 0, u = 0
  for (const q of QS) {
    const hash = createHash("sha1").update(`${MAT}|${q.modulo}|${q.enunciado}`).digest("hex")
    const base: any = { materia: MAT, modulo: q.modulo, tipo: q.tipo, enunciado: q.enunciado, hash }
    if (q.tipo === "multipla") { base.alternativas = q.alternativas; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else if (q.tipo === "certo_errado") { base.alternativas = []; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else { base.alternativas = []; base.gabarito = ""; base.modelo = q.modelo }
    const exists = await prisma.questao.findUnique({ where: { hash } })
    await prisma.questao.upsert({ where: { hash }, update: base, create: base })
    exists ? u++ : c++
  }
  const tq = await prisma.questao.count({ where: { materia: MAT } })
  console.log(`ACE Gaivotas: questoes ${c} criadas / ${u} atualizadas (total ACE: ${tq}).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
