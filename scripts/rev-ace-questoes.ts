import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// id -> justificativa fundamentada na APOSTILA - ACE.pdf
const EXPL: Record<string, string> = {
  // ── Módulo 1 — História da Análise Criminal ──
  cmptqovk4000104l4q6stn60s: "Correto. Henry Fielding (1707-1754), magistrado inglês, é apontado como precursor do uso estruturado da análise criminal, ao sistematizar informações sobre crimes e empregá-las com seus 'Bow Street Runners'.",
  cmptqovqp000204l4dael14qv: "Correto. O policiamento moderno, profissional e estruturado começou com a criação da Polícia Metropolitana de Londres, em 1829, por Robert Peel.",
  cmptqovxa000304l4d9cd75t9: "Correto. Em 1840 as estatísticas criminais tornaram-se acessíveis à população londrina e, em 1846, a Polícia Metropolitana já mantinha dois detetives por divisão.",
  cmptqowal000504l4gtuhosbd: "Correto. August Vollmer chefiou o Departamento de Polícia de Berkeley por 27 anos e é conhecido como o 'pai da polícia americana'.",
  cmptqowh5000604l4p6k322ec: "Correto. O termo 'análise de crime' foi formalizado por O.W. Wilson na 2ª edição de 'Administração Policial' (1963).",
  cmptqowu6000804l4ep3vfvxm: "Correto. A IALEIA foi fundada em 1980 (primeira organização de analistas criminais dos EUA e Canadá) e a IACA, em 1990.",
  cmptqox0q000904l448ilkwtz: "Correto. O CompStat foi desenvolvido no Departamento de Polícia de Nova Iorque a partir de 1994, fortemente baseado em mapeamento e análise criminal.",
  cmptqoxxc000e04l4l3ggqs0z: "Correto. A partir de 2007, Pernambuco passou a publicar o Boletim Trimestral da Conjuntura Criminal e um informe mensal pela CONDEPE-FIDEM, com apoio da GACE.",
  cmptqox78000a04l4i18dkhp1: "Correto. Os anos 1990 foram a 'Era de Ouro' dos analistas norte-americanos, impulsionados pelo CompStat, pela fundação da IACA, por novos fundos federais e por tecnologias acessíveis de mapeamento.",
  cmptqoxkb000c04l4z6qr9tuv: "Correto. No Brasil, o DEACE foi criado em 2001 e hoje é a GACE (Gerência de Análise Criminal e Estatística), da Secretaria de Defesa Social de Pernambuco.",
  cmptqovda000004l4kq5g8b58: "Correto. A análise criminal tem raízes na atividade de Inteligência, que remonta às estratégias chinesas de guerra e às batalhas narradas na Bíblia.",

  // ── Módulo 2 — Fundamentos ──
  cmptqp17z000v04l4tynilaxt: "Correto. A alocação eficiente dos gastos em segurança exige superar a ação reativa a incidentes e adotar uma perspectiva preventiva orientada a resultados.",
  cmptqp1ei000w04l4vuvo1j7t: "Correto. A nova perspectiva requer examinar detalhadamente cada problema, considerar um leque amplo de opções de intervenção e escolher a opção pela relação custo-benefício.",
  cmptqozkr000m04l41ghluue0: "Correto. A análise criminal é um conjunto de processos sistemáticos voltados a prover informação oportuna e pertinente sobre os padrões do crime e suas correlações de tendências.",
  cmptqozxt000o04l47tm8lj1d: "Correto. A Análise Criminal Estratégica (ACE) produz conhecimento de longo prazo, voltado à formulação de políticas públicas, às tendências criminais e ao planejamento orçamentário.",
  cmptqp04c000p04l40rvjsvuo: "Correto. A Análise Criminal Tática (ACT) subsidia os operadores que atuam nas ruas, identificando padrões de médio prazo, como hot spots e correlações de dia/hora.",
  cmptqp0hi000r04l4c390c6vw: "Correto. O fluxo da análise estatística criminal segue quatro etapas sequenciais: Coleta → Crítica → Apresentação → Análise dos dados.",
  cmptqp0uz000t04l4tzvqmkd6: "Correto. O bom analista criminal age proativamente — não espera demanda — para identificar problemas, avaliar causas e propor soluções.",
  cmptqp1rj000y04l4v15d1a9o: "Correto. A dinâmica do analista divide-se em quatro etapas: sistematizar dados → identificar causas → identificar formas de intervenção → avaliar o impacto das intervenções.",
  cmptqp24j001004l469voy0p8: "Correto. O PRONASCI (2007) reuniu 94 ações, combinando ações típicas de polícia e ações sociais, na perspectiva do policiamento orientado a problemas.",

  // ── Módulo 3 — Teorias ──
  cmptqp518001f04l4nipd3vn5: "Correto. Em 2003, John Eck ampliou o Triângulo do Crime acrescentando os controladores externos: cuidador (handler), gerente/administrador e guardião.",
  cmptqp3r6001804l4oc1ee8tr: "Correto. Para a Teoria da Escolha Racional (Cornish & Clarke), o comportamento criminal decorre de uma decisão racional que pondera benefícios e custos de cometer o crime.",
  cmptqp447001a04l4d75l4tlw: "Correto. No 'modelo de envolvimento inicial', o indivíduo decide se entrará no crime considerando experiências prévias, código moral próprio e a avaliação de alternativas legítimas e ilegítimas.",
  cmptqp4b4001b04l4mxnpern7: "Correto. O 'modelo do evento criminal' trata de qual crime cometer e qual alvo escolher, uma vez já tomada a decisão de agir criminalmente.",
  cmptqp4hn001c04l4s691jm28: "Correto. A Teoria da Atividade de Rotina foi apresentada por Cohen e Felson (1979) para explicar o aumento das taxas de crime nos EUA nos anos 1960-70.",
  cmptqp5eh001h04l480a798pm: "Correto. A Teoria do Padrão Criminal trabalha com nós (nodes), caminhos (paths) e fronteiras (edges), estando intimamente ligada à Teoria da Atividade de Rotina.",
  cmptqp5ri001j04l4dt6nki40: "Correto. A Criminologia Ambiental é a convergência das perspectivas da Escolha Racional, da Atividade de Rotina e do Padrão Criminal — as 'Novas Teorias da Oportunidade'.",
  cmptqp64j001l04l4160qykey: "Correto. Segundo Felson e Clarke (1998), a distribuição do crime no tempo e no espaço não é aleatória, sendo influenciada pelas condições criminogênicas do ambiente.",
  cmptqp6b2001m04l4ix2j4stg: "Correto. As fronteiras (edges) são os limites entre áreas onde grupos de diferentes comunidades se encontram — zonas mais propensas a certos crimes.",
  cmptqp4uo001e04l4jd1n97c1: "Correto. No Triângulo do Crime original, o guardião pode ser qualquer pessoa cuja presença desencoraje a ação criminosa, não necessariamente um policial ou vigilante.",

  // ── Módulo 4 — Coleta de informação ──
  cmptqp9r4002404l4hthgd7vg: "Correto. A pulseira de identificação de cadáver foi criada em PE para combater a hiper-notificação dos registros de CVLI, atribuindo a cada morte violenta uma identificação numérica única.",
  cmptqp7xx001u04l4btoc2n0p: "Correto. O dado é a informação ainda desprovida de significado — fatos, imagens ou sons que podem ou não ser úteis a determinada tarefa.",
  cmptqp84g001v04l4lk0thuuz: "Correto. A informação é o dado contextualizado, ao qual foram atribuídos valores, tornando-o útil à tomada de decisão.",
  cmptqp8hg001x04l4v8w3x6uu: "Correto. Um sistema de informação reúne componentes inter-relacionados que coletam, processam, armazenam e distribuem informação, num ciclo de entrada → processamento → saída.",
  cmptqp8nz001y04l4n2s5oxn9: "Correto. A fonte é primária quando o pesquisador coleta os dados diretamente, e secundária quando utiliza dados coletados por outra pessoa.",
  cmptqp8ui001z04l4cmtshzdt: "Correto. Em Pernambuco, a base estatística é coletada pela Polícia Civil por meio dos Registros de Ocorrência (RO), categorizados conforme o Código Penal e o sistema INFOPOL.",
  cmptqp97k002104l4d4cqpvkv: "Correto. O SIM classifica as mortes violentas como 'Causas Externas' pela CID-10 desde 1996 (a CID-9 vigorou de 1979 a 1995).",
  cmptqp9kl002304l43oys7j3n: "Correto. As pesquisas de vitimização captam a experiência das pessoas com o crime, inclusive casos não registrados (cifra oculta), e avaliam a propensão a registrar queixa e as atitudes frente à polícia.",
  cmptqpa45002604l4c9yjjqeg: "Correto. O controle da informação é fator crítico de sucesso: dispor da informação correta no momento certo permite decisões ágeis e eficientes.",
  cmptqpaao002704l4x236v8lq: "Correto. A avaliação de políticas de segurança tem caráter estratégico: é o processo sistemático de análise das ações e resultados, a partir de critérios definidos, para aferir mérito e efetividade.",

  // ── Módulo 5 — Análise estatística ──
  cmptqpcae002h04l4cc472ysz: "Correto. A amostra é utilizada quando é impossível ou custoso coletar dados de todos os elementos da população.",
  cmptqpcnm002j04l4bsp4um0u: "Correto. A proporção é a relação entre parte e total (valor entre 0 e 1); a porcentagem é a proporção multiplicada por 100.",
  cmptqpcu8002k04l4ens1wt2e: "Correto. A razão difere da proporção por relacionar quantidades de itens diferentes (ex.: policiais por viatura), e não partes de um mesmo conjunto.",
  cmptqpdds002n04l4ibzlixvq: "Correto. Média = soma dos valores ÷ nº de casos; moda = valor mais frequente; mediana = valor que divide a amostra ao meio após a ordenação.",
  cmptqpdqt002p04l4llmuvs44: "Correto. Em um conjunto com número PAR de observações, a mediana é a média aritmética dos dois valores centrais (X(n/2) e X(n/2+1)) após a ordenação.",
  cmptqpe3u002r04l4w9nn9q4w: "Correto. O desvio padrão é a raiz quadrada da variância e mantém a mesma unidade de medida dos dados originais.",
  cmptqpeae002s04l42xhkhtrm: "Correto. O coeficiente de correlação r varia de -1 a +1: r = 0 indica ausência de correlação; quanto mais próximo de ±1, mais forte a correlação.",
  cmptqpenf002u04l4wo2aw92r: "Correto. O histograma tem barras justapostas (sem espaço), com área proporcional à frequência absoluta — diferindo do gráfico de barras comum, que tem espaço entre as barras.",
  cmptqpc3v002g04l4osgqsusv: "Correto. População é o conjunto com pelo menos uma característica em comum; censo é a coleta de dados de todos os seus elementos.",

  // ── Módulo 6 — Mapeamento / SIG ──
  cmptqpi3o003c04l4hcztiofd: "Correto. A latitude mede a distância de um ponto à Linha do Equador (N/S); a longitude, a distância ao Meridiano de Greenwich (L/O).",
  cmptqpia8003d04l4zs2ustpy: "Correto. Arquivos KML baseiam-se em XML e servem para compartilhar pontos no Google Earth; o KMZ é a versão compactada do KML.",
  cmptqpgaf003204l4g0s6tee9: "Correto. Geoprocessamento é o conjunto de tecnologias para coletar e tratar informação espacial; cada aplicação é executada por um SIG (Sistema de Informações Geográficas).",
  cmptqpggy003304l4jzzrfk31: "Correto. A diferença do SIG para um sistema de informação convencional é armazenar tanto os atributos descritivos quanto as geometrias dos dados geográficos.",
  cmptqpgu1003504l48b0vtfph: "Correto. A 1ª geração de SIGs ('CAD Cartográfico') herdava a tradição da Cartografia, tinha suporte de banco de dados limitado e o mapa como paradigma.",
  cmptqph0j003604l4qvkp29tl: "Correto. A 2ª geração de SIGs surgiu no início dos anos 1990, concebida para ambientes cliente-servidor e acoplada a gerenciadores de bancos de dados relacionais.",
  cmptqph72003704l4b7opgba0: "Correto. A 3ª geração ('Bibliotecas Geográficas Digitais') administra enormes bases de dados, com acesso por redes locais e remotas via web.",
  cmptqphk4003904l4qcy0gm2j: "Correto. A análise de proximidade identifica, a partir de um ponto ou área definida, todos os objetos que se encontram dentro de um raio determinado.",
  cmptqphqm003a04l4nb6wy2dl: "Correto. A superposição de camadas agrupa diferentes tipos de objetos em camadas para visualização e análise conjunta (ex.: rede de drenagem + tipo de solo + curvas de nível).",
  cmptqpin9003f04l47gliee6c: "Correto. No Google Earth é possível localizar pontos por nome de cidade ou por coordenadas (graus/minutos/segundos ou graus decimais).",
  cmptqpits003g04l4twoqpmhh: "Correto. A ferramenta Régua do Google Earth mede distâncias entre dois ou mais pontos, com unidades como metros, quilômetros, milhas e polegadas.",

  // ── Módulo 7 — Ferramentas ──
  cmptqplwk003w04l4wrzh2z8e: "Correto. O SACE disponibiliza indicadores de resultado (MVI, crimes violentos contra o patrimônio, violência doméstica, tráfico, porte/posse de armas) e de processo (armas apreendidas, veículos recuperados).",
  cmptqpkge003o04l4f3pyyslv: "Correto. O Microsoft Excel é amplamente utilizado na análise criminal para o tratamento e o cruzamento de dados na produção de relatórios operacionais.",
  cmptqpkmx003p04l4uzw9475o: "Correto. O Calc (BrOffice/OpenOffice) é uma planilha eletrônica de código aberto, com conceitos e aplicações muito semelhantes aos do Excel.",
  cmptqpkte003q04l4qe7w2mc4: "Correto. A tabela dinâmica é criada pela guia 'Inserir', no grupo Tabelas, clicando em 'Tabela Dinâmica'.",
  cmptqpkzx003r04l4sov80jwi: "Correto. Ao criar a tabela dinâmica, o campo 'Tabela/Intervalo' é preenchido automaticamente com os dados selecionados, e o destino padrão é uma nova planilha.",
  cmptqplcy003t04l4cu60ln6q: "Correto. Para ordenar de forma decrescente, clica-se com o botão direito em uma célula do campo, aponta-se para Classificar e escolhe-se 'Classificar do Maior para o Menor'.",
  cmptqpljg003u04l4erzcr8si: "Correto. O SACE (Sistema de Análise Criminal e Estatística) foi desenvolvido pela Gerência Geral de Análise Criminal e Estatística (GGACE) da SDS-PE.",
  cmptqpmg4003z04l46wqh6ylj: "Correto. O INFOPOL possui duas visões: a de ocorrências (todas as registradas pela Polícia Civil) e a de homicídio (diversas modalidades de morte violenta).",
  cmptqpmt5004104l4vcxeo5h3: "Correto. O INFOPOL é administrado pela GGTI da SDS junto à ATI, com acesso pela URL https://security.sds.pe.gov.br/pernambuco/.",
  cmptqpmzn004204l42lqzkmi6: "Correto. A apostila descreve o ArcGIS Online como a principal ferramenta de geoprocessamento do mundo, cujos painéis (dashboards) exibem múltiplas visualizações geográficas para o monitoramento de eventos criminais.",
}

async function main() {
  let ok = 0, miss = 0
  for (const [id, explicacao] of Object.entries(EXPL)) {
    const r = await prisma.questao.updateMany({ where: { id, materia: "ACE" }, data: { explicacao } })
    if (r.count) ok++; else { miss++; console.log("não encontrada:", id) }
  }
  console.log(`\nACE: ${ok} justificativas atualizadas, ${miss} não encontradas (de ${Object.keys(EXPL).length}).`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
