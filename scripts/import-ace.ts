import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const MATERIA = "ACE"
const TITULO = "Memento Completo — Análise Criminal e Estatística"

const MD = `# Capítulo 1 — História e Conceito da Análise Criminal

## Conceito
- **Análise criminal** é, genericamente, a coleta e análise de informação pertinente ao fenômeno da criminalidade.
- Permite **detectar padrões criminais**, estabelecer correlações entre delitos e autores, determinar perfis de alvos e de delinquentes habituais e até prever o cometimento de crimes.
- Subsidia o **dimensionamento e o posicionamento de recursos** e a gestão do patrulhamento e da investigação.
- A prática moderna é fundamentada no uso intensivo da **Tecnologia da Informação (TI)**: estatística computadorizada, Sistemas de Informação Geográfica (SIG) e inteligência artificial.

## Raízes históricas
- Tem raízes na atividade de **Inteligência** (estratégias de batalhas **chinesas**, Sun Tzu).
- **Henry Fielding (1707–1754)**, magistrado inglês, e seus *"Bow Street Runners"*: primeiros traços do uso estruturado de rudimentos da análise criminal.
- **Robert Peel**: marco da **polícia moderna** (Polícia Metropolitana de Londres) e dos princípios do policiamento.
- **Século XIX**: surge o conceito de **Modus Operandi** (padrão de atuação do criminoso).
- A partir de **1800** as taxas de crime na Europa aumentaram fortemente, impulsionando o desenvolvimento da área (e o imaginário de Sherlock Holmes).
- **August Vollmer** — *pai da polícia americana*: introduziu o **serviço de chamada de emergência** e o **mapa de pinos** (alfinetes).
- **Orlando W. Wilson**: o **termo "análise de crime"** (análise criminal) surgiu **formalmente** com ele.

## Consolidação e era de ouro (EUA)
- **Consolidação — anos 1960:** grandes departamentos passam a criar **unidades de análise criminal** (identificar MOs, padrões e relação entre criminosos e crimes). O livro **"Administração Policial" (O. W. Wilson)** vira o 1º livro-texto para executivos policiais. A **explosão** vem nos **anos 70** (financiamento da LEAA).
- **Era de ouro — anos 1990 (Bruce, 2004).** Características/eventos marcantes:
  - 1990: livro **"Policiamento Orientado para a Solução de Problemas"** (Herman Goldstein).
  - 1990/91: criação da **IACA** (Associação Internacional de Analistas de Crime) e 1ª conferência.
  - 1992: programa de **certificação** em Análise Criminal (Depto. de Justiça da Califórnia).
  - Novos **fundos** federais para policiamento comunitário e orientado a problemas.
  - **Tecnologias acessíveis** (mapeamento de crimes, bancos de dados relacionais).
  - 1994: sistema **CompStat** (gestão por resultados, NYPD) baseado em mapeamento.
> 🔑 Não inverter: **consolidação = anos 60**; **era de ouro = anos 90**.

## Linha do tempo — marcos da análise criminal (EUA)
- **Período feudal (Inglaterra):** em vilas pequenas todos se conheciam; o policial local já formava opinião sobre autor provável (Gottlieb, 1998).
- **1707–1754 — Henry Fielding:** "Bow Street Runners"; sistematizava denúncias e descrições de criminosos.
- **1829 — Robert Peel:** Polícia Metropolitana de Londres → modelo emulado pelo mundo.
- **Anos 1920 (EUA):** reformadores oficializam a análise criminal. **Vollmer** importa da Inglaterra a classificação por **modus operandi (MO)**, analisa **chamadas de emergência** e cria o **mapa de pinos**.
- **Anos 1920–30 — "Nova vertente":** polícia passa a coletar dados sobre anarquistas e **crime organizado**; a partir de 1950 as audiências do senador **Kefauver** popularizam o termo "Máfia".
- **1922 — IACP** (Assoc. Internacional de Chefes de Polícia): inicia a discussão de um sistema nacional de registro de crimes.
- **~1930 — UCR** (ver abaixo).
- **1963 — O. W. Wilson:** o termo **"análise de crime"** aparece formalmente na 2ª edição de "Administração Policial".

## UCR — Programa Padronizado de Registro de Crimes
- **Uniform Crime Reporting Program (UCR)**, criado por volta de **1930**, administrado pelo **FBI** — até hoje o **indicador líder** das estatísticas criminais nos EUA.
- Vollmer (membro da IACP) foi um dos instrumentalizadores.
- **Mudança de paradigma:** tirou a polícia do raciocínio **jurídico** (cada tipo penal isolado) para **categorias amplas** ("roubo", "arrombamento"), permitindo **comparação** entre jurisdições — essencial para a análise criminal.
> 🔑 No Brasil, paralelo ao UCR: a **SENASP** lançou em **2003** o **SINESPJC** (Sistema Nacional de Estatística de Segurança Pública e Justiça Criminal), buscando padronizar a categorização dos registros.

## Wilson — "fórmulas de risco"
- Wilson incluiu nas técnicas de Vollmer as **"fórmulas de risco"**: atribuía **pesos** a categorias de crimes e chamadas para alocar recursos de forma sistemática.
- Base dos atuais **centros de despacho** (CIODS/COPOM): a classificação da chamada define tipo/quantidade de recurso enviado.

## Outras vertentes (anos 60–70)
- Além da análise tática/estratégica, surgiram linhas paralelas voltadas à investigação:
  - **Análise Criminal Investigativa** (apoio à elucidação de crimes).
  - **Análise Criminal de Inteligência** (crime organizado, terrorismo).

## Novas abordagens em prevenção (Goldstein, 1990)
- O **Policiamento Orientado para a Solução de Problemas (POP)** redescobre o papel da análise criminal.
- Incidentes são **sintomas** de problemas profundos; a polícia deve atacar o **problema** (e suas causas), não só o **evento**.
- Para solucionar, primeiro **identificar** e depois **analisar** os problemas — esse é o trabalho do analista criminal.

---

# Capítulo 2 — Fundamentos Teóricos

## Para que servem os dados na segurança pública?
1. Orientar a Administração no **planejamento, execução e redirecionamento** das ações policiais.
2. Permitir que a **população** conheça o que acontece ao seu redor.
3. Permitir que sociedade civil e demais setores **objetivem demandas** por providências e contribuam com a participação comunitária.

## Definição e dimensões
- A análise criminal é um **conjunto de processos sistemáticos** voltados a prover informação oportuna e pertinente sobre os padrões do crime e suas tendências, apoiando as áreas **operacional** e **administrativa** na distribuição de recursos para prevenção e supressão.
- É uma atividade **multidisciplinar** (envolve várias áreas do conhecimento).
- **Duas dimensões: tática e estratégica.** A tática melhora investigação/patrulhamento; a estratégica permite projetar cenários e tendências.
- Em PE: o **DEACE (2001)**, hoje **GACE (Gerência de Análise Criminal e Estatística)**, da SDS, coleta dados e produz relatórios.

## Problemática no Brasil
- Principal entrave: a **ausência de cultura técnica** no uso dos dados.

## Os 3 tipos de análise criminal (Magalhães, 2007)
São as três grandes vertentes do conhecimento produzido para a gestão da segurança pública:
| Tipo | Prazo | Foco / objetivo |
|---|---|---|
| **ACE — Estratégica** | **Longo prazo** | Identificar **tendências** da criminalidade; formular **políticas públicas**, indicadores de desempenho, plano orçamentário e direcionamento de investimentos |
| **ACT — Tática** | **Médio prazo** | Identificar **padrões** das atividades criminais; subsidiar a polícia **ostensiva** (pontos quentes, dia/horário crítico) e a **investigativa** (autoria e materialidade) |
| **ACA — Administrativa** | — | **Estatística descritiva** e **divulgação** de informações sumarizadas ao público-alvo (cidadãos, gestores, ONGs), com comparações entre períodos e cidades |
> 🔑 A própria sigla da disciplina (**ACE**) é a análise criminal **Estratégica** (tendências/longo prazo). Não confundir: **ACT** = padrões/médio prazo (rua); **ACA** = descritiva/divulgação (público).

## Fluxo da execução da análise estatística (4 etapas)
- **(1) Coleta** dos dados (após definir o problema e o projeto de pesquisa) → **(2) Crítica** dos dados (suprime valores estranhos e erros de preenchimento/digitação) → **(3) Apresentação** (organiza em **tabelas, gráficos e mapas**) → **(4) Análise** (lê os resultados e sistematiza as conclusões em **relatório**).
> ⚠ Decore a ordem: **Coleta → Crítica → Apresentação → Análise**. A apresentação e a análise são **interligadas** (a análise pode exigir novas tabelas/mapas).

## Por que fazer análise criminal? (nova perspectiva)
- Sair da ação **reativa** (cadeia sem fim de incidentes) para a **preventiva** (criar ambiente seguro).
- A nova lógica exige: (1) examinar cada problema e suas causas; (2) considerar um leque amplo de opções; (3) escolher pela relação **custo × benefício**, orientada a resultados.

## Quadro da efetividade das estratégias de policiamento (EUA, 2003) — DECORAR
| Estratégia | Evidência de redução da criminalidade |
|---|---|
| **Orientada a Problemas** (investigação científica de problemas + gestão por resultados) | **Forte** ou moderada |
| **Comunitário** (polícia a pé, contato com a comunidade, legitimidade) | Fraca ou moderada |
| **Focado** (patrulhamento em áreas de concentração + crimes específicos) | Fraca ou moderada |
| **Tradicional** (mais efetivo, menor tempo de atendimento, mais prisões) | **Falta** evidência |
> 🔑 A única com **forte** evidência é a **orientada a problemas**. A tradicional **não tem** evidência.

> ⚠ Cerqueira e Lobão (2003): aumentar o gasto em segurança não reduz, por si, os homicídios — a **redução da desigualdade social** foi o único fator diretamente relacionado à queda.

## Papel do analista criminal
- Mais que fonte de informação, deve atuar como **conselheiro** e **pesquisador**.
- Características de um bom analista: **proativo**, **pesquisador**, **bom avaliador** e **olhar investigativo**.
- Não espera demanda: antecipa problemas, avalia causas, busca as respostas mais efetivas e aprende com os resultados (positivos ou negativos).

## As 4 etapas do trabalho do analista criminal
1. **Sistematizar e analisar** os dados.
2. **Submeter** esses dados para identificar os **padrões** criminais.
3. **Identificar formas de intervir** sobre os problemas detectados.
4. **Avaliar o impacto** das intervenções (realimenta o ciclo).
> ⚠ Cai de certeza. Não confundir com o fluxo da análise **estatística** (Coleta → Crítica → Apresentação → Análise).

## Focalização e pirâmide
- **Focalização:** importância de **olhar o crime de forma separada** (focada), direcionando a ação aos pontos/problemas específicos.
- **Pirâmide:** representa a concentração — poucos alvos/locais/ofensores respondem pela maior parte dos crimes (a base larga afunila no topo prioritário da intervenção).

---

# Capítulo 3 — Principais Teorias Sociológicas sobre o Crime

## Teoria da Escolha Racional (Cornish & Clarke)
- O crime é, em grande medida, uma **escolha racional**: o indivíduo pondera **custos e benefícios**, buscando maximizar benefícios e minimizar custos.
- Fatores: acesso fácil ao alvo, baixa probabilidade de ser descoberto, utilidade do bem e sensação de anonimato.
- Duas fases: **modelo de envolvimento inicial** (decidir se entra no crime) e **modelo do evento criminal** (decidir qual crime e qual alvo).
- Aplicação prática: **Prevenção Situacional de Crimes**.

## Teoria da Atividade de Rotina (Cohen & Felson, 1979)
- Complementar à Escolha Racional; explica o encontro entre criminoso e alvo no **tempo e no espaço**, durante as atividades rotineiras.

### Triângulo do Crime (ou do Problema)
- Para o crime ocorrer, deve haver convergência de **3 elementos**: **ofensor motivado** + **alvo/vítima atraente** + **ausência de guardião capaz**.
- O **guardião** não é necessariamente policial: qualquer presença que desencoraje (vizinho, porteiro, câmera, alarme).

### Triângulo ampliado (Eck, 2003) — controladores externos
- **Cuidador (handler):** controla o ofensor (pais, cônjuge, professores).
- **Gerente/Administrador:** zela pelo local (síndico, gerente, diretor).
- **Guardião:** protege o alvo/vítima.

## A oportunidade como facilitadora — 10 princípios (Felson & Clarke, 1998)
- A oportunidade (a) tem papel causal; (b) é altamente específica; (c) concentra-se no tempo e no espaço; (d) depende das rotinas diárias; (e) um crime gera oportunidades para outros; (f) alguns produtos são mais tentadores; (g) mudanças sociais/tecnológicas criam novas oportunidades; (h) reduzir oportunidades previne crimes; (i) geralmente não há deslocamento; (j) pode reduzir as taxas de crime.

## Teoria do Padrão Criminal — nós, caminhos e fronteiras
- O crime ocorre na **interseção** entre a área de atividade do ofensor e a da vítima/alvo.
- **Nós (nodes):** lugares de origem/destino (casa, trabalho, lazer).
- **Caminhos (paths):** ligam os nós (eixos de ação criminal).
- **Fronteiras (edges):** limites entre áreas; estranhos tendem a cometer crimes nas bordas e retornar à sua comunidade.

## Criminologia Ambiental
- Vertente que introduz a **dimensão espacial** no fenômeno criminal; foco no **evento criminal** e nas circunstâncias imediatas (não no criminoso).
- É a convergência de **3 perspectivas**: Escolha Racional + Atividade de Rotina + Padrão Criminal.
- **Objetivo: prevenir o crime, não curar o criminoso.**
- 3 premissas: (1) o comportamento criminal é influenciado pelo ambiente imediato; (2) a distribuição do crime no tempo/espaço **não é aleatória**; (3) entender o papel criminogênico do ambiente é poderoso instrumento de prevenção.

---

# Capítulo 4 — Coleta de Informação

- A **informação** é um ativo de grande valor e deve ser protegida (Segurança da Informação / Política de Segurança).
- **Fonte primária:** você mesmo coleta. **Fonte secundária:** usa dados coletados por outro.

## As 3 fontes de dados de violência/criminalidade
1. **Polícia Civil** — Registros de Ocorrência (RO); base das estatísticas criminais em PE.
2. **SIM** (Sistema de Informação sobre Mortalidade — Ministério da Saúde).
3. **Pesquisas de vitimização** — levantamento na população sobre a experiência com o crime.

## Identificação cadavérica (pág. 49)
- **Pulseira de identificação de cadáver:** mecanismo **criado em Pernambuco** que atribui a cada **morte violenta** uma **identificação numérica**, permitindo registro **rápido e preciso** das ocorrências e evitando a **hiper notificação** (duplicidade).

## SIM × Polícia (comparação importante)
- **SIM:** classifica mortes como "Causas Externas" pela **CID** (CID-9 até 1995; **CID-10 desde 1996**); registra pelo **local do óbito**.
- **Polícia:** classifica pelo **Código Penal**; registra pelo **local do fato**.
- Por isso as taxas de homicídio da **saúde (SIM) são sempre maiores** que as das polícias e as fontes **não são diretamente comparáveis**.

## Registro de Ocorrência (RO) e sub-registro (pág. 52)
- O **RO** é o documento produzido pela **Polícia Civil** que pode **iniciar o inquérito policial** quando há indício de crime.
- **Sub-registro** (Roberto Kant de Lima, 1995): o RO muitas vezes só é efetivado "quando a polícia deseja" — problema reconhecido.
- O RO dá ênfase ao **modus operandi**, gerando mais títulos de ocorrência do que as classificações penais.

## Qualidade da informação
- Distorções da estatística vêm de: **amostras pequenas**, **distorções deliberadas**, **perguntas tendenciosas**, **gráficos enganosos** e **pressões políticas**.
- A categorização criminal segue o **Código Penal** e o **Sistema INFOPOL**, principal base de ocorrências em PE.

## Panorama das bases de dados
- O Banco Mundial alerta: na América Latina os **dados são grosseiramente inadequados** (sub-registro, falta de levantamentos sistemáticos). A 1ª prioridade é **construir sistemas** que permitam saber o que está ocorrendo.
- Por isso usa-se muito a **taxa de homicídio** (da saúde) como indicador comparativo — é o crime com **menor sub-registro**.
- **Críticas (BID) ao uso do homicídio como medida única:** (a) ainda há sub-registro e inconsistência entre fontes; (b) muitas violências graves não terminam em morte (ex.: violência doméstica); (c) subestima outras formas (agressão, intimidação).
- **Taxas iguais podem ocultar realidades diferentes:** em 1996, RJ (59,4) e SP (55,6) tinham taxas parecidas, mas composições distintas (mais jovens e armas de fogo no RJ).
- Em PE há projeto de **integração dos bancos de dados da PC e da PM** para cruzar informações.

---

# Capítulo 5 — Análise Estatística Criminal

## Conceitos básicos
- **População:** conjunto de indivíduos/objetos com ao menos uma característica em comum.
- **Censo:** dados de **todos** os elementos da população.
- **Amostra:** dados de uma **parte** representativa da população.
- **Variáveis:** guardam as informações (idade, gênero, nº de crimes, etc.).
- **Estatística descritiva:** técnicas para resumir e apresentar os dados.

## Séries estatísticas (3 tipos)
- Fatores: **época** (tempo), **local** (espaço) e **fenômeno**.
- **Temporal** (cronológica): varia a época.
- **Geográfica** (territorial): varia o local.
- **Específica** (categórica): varia o fenômeno.

## Apresentação dos dados
- **Tabela/gráfico — elementos:** título (o quê? quando? onde?), corpo e rodapé (fonte, notas, chamadas).
- **Tipos de gráfico:** colunas (verticais), barras (horizontais), setores (proporção do total), linhas/curvas (séries temporais), **histograma** (barras justapostas, área ∝ frequência) e **polígono de frequência**.

## Parâmetros para comparação relativa
- **Proporção:** parte ÷ total.
- **Porcentagem:** proporção × 100.
- **Razão:** A ÷ B (relaciona quantidades diferentes; ex.: policiais por viatura).

## Distribuição de frequência
- **Frequência absoluta:** nº de vezes que o valor é observado.
- **Frequência absoluta acumulada:** soma das absolutas até o valor.
- **Frequência relativa:** absoluta ÷ total de observações.
- **Frequência relativa acumulada:** soma das relativas até o valor.

## Medidas de tendência central
- **Média:** soma dos valores ÷ nº de casos.
- **Moda:** valor que ocorre com maior frequência.
- **Mediana:** valor que ocupa a posição central (divide a amostra ao meio).
- **Taxa bruta:** (vítimas ÷ população de risco) × 100.000.
- **Quartis** (4 partes iguais) e **decis** (10 partes iguais).

> ⚠ Taxa de uma região: **somar** as vítimas e as populações de todas as UFs e calcular — **nunca** fazer a média das taxas das UFs.

## Medidas de dispersão
- **Amplitude:** maior valor − menor valor.
- **Variância (s²):** grau de dispersão dos dados em torno da média.
- **Desvio padrão (σ):** raiz quadrada da variância.

## Coeficiente de correlação (r)
- Mede a **intensidade da associação linear** entre duas variáveis; varia entre **−1 e +1**.
- **r = 0:** não há correlação. **r > 0:** positiva (sobem juntas). **r < 0:** negativa (uma sobe, a outra desce). Quanto mais próximo de ±1, mais forte.

> ⚠ A correlação **não permite inferência** (não diz qual variável causa a outra) — para isso é necessária a **análise de regressão**.

---

# Capítulo 6 — Mapeamento de Crimes

## Geoprocessamento e SIG
- **Geoprocessamento:** conjunto de tecnologias para coletar e tratar **informações espaciais** (cartografia, sensoriamento remoto, GPS, banco de dados, etc.).
- **SIG (Sistema de Informações Geográficas):** processa dados gráficos e não-gráficos, com ênfase em **análise espacial**. Diferencial em relação a um SI comum: armazena **atributos descritivos + geometrias**.

## Componentes e funções
- **Componentes (Lazzarotto):** software, hardware, dados, metodologias e **recursos humanos**.
- **Funções principais:** captura, análise, armazenamento, visualização/consulta e saída das informações.

## Representação dos dados
- **Vetorial:** pontos, linhas e polígonos (sistema de coordenadas).
- **Matricial (raster):** grade regular de elementos (células/pixels).
> ⚠ **Vetorial = feições discretas** (ponto/linha/polígono); **matricial = superfície contínua** (imagem/pixels).

## Arquitetura do SIG em 3 camadas (Câmara, 2005)
- **Interface:** comunicação com o usuário — define como o sistema é operado e controlado.
- **Camada intermediária:** (1) **entrada e integração** de dados (captação e conversão); (2) **consulta e análise espacial** (operações topológicas, visualização e plotagem); (3) **armazenamento/gerência** dos dados geográficos.
- **Banco de dados geográfico:** guarda as **geometrias + atributos descritivos**.

## Gerações dos SIG (Câmara)
- **1ª — "CAD Cartográfico":** herdeira da cartografia; banco de dados limitado; paradigma = o **mapa**.
- **2ª — "Banco de dados geográfico"** (início dos anos 1990): ambiente **cliente-servidor**, acoplado a bancos relacionais e a processamento de imagens.
- **3ª — "Bibliotecas Geográficas Digitais"** (fim dos anos 1990): enormes bases, acesso por **redes e web**.

## Mapas criminais e pontos quentes
- **"Mapa de pinos" (alfinetes):** forma histórica de marcar a localização dos crimes no mapa.
- **Pontos quentes (hot spots):** **concentrações espaciais** de crime — orientam o **policiamento direcionado**; é a ferramenta típica da **ACT** (correlaciona local com dia e horário críticos).
- **Camadas (layers):** o SIG sobrepõe planos de informação (ruas, distritos, ocorrências) ligados a um **SGBD**.

---

# Capítulo 7 — Operacionalização: Ferramentas

- **Excel / Calc:** planilhas eletrônicas para tratamento e cruzamento de dados; a **tabela dinâmica** é muito usada na produção do relatório operacional. **Diferença:** o **Excel** é da **Microsoft** (suíte Office, proprietário/pago); o **Calc** integra suítes **livres/gratuitas** (LibreOffice/OpenOffice) — funções semelhantes (cálculo, gráficos, tabela dinâmica).
- **SACE (Power BI):** Sistema de Análise Criminal e Estatística (desenvolvido pela GGACE); usa o **Power BI** — coleção de serviços, apps e conectores — para transformar dados em **insights** interativos.
- **QlikView:** solução de BI usada nas reuniões do **Juntos pela Segurança** para monitorar indicadores; dashboards por "arrastar e soltar".
- **Sistema INFOPOL:** ferramenta de **coleta e análise de ocorrências policiais**, administrada pela GGTI/SDS. Possui **visão de ocorrências** (todas as da Polícia Civil) e **visão de homicídio** (homicídio doloso, latrocínio, lesão seguida de morte, feminicídio, suicídio, acidentes de trânsito com vítima fatal, etc.).`

type Card = { modulo: string; frente: string; verso: string }

const CARDS: Card[] = [
  // ── Cap. 1 — História ──
  { modulo: "1", frente: "Análise Criminal — Conceito", verso:
`• Coleta e análise de informação pertinente ao fenômeno da criminalidade.
• Permite detectar padrões, correlacionar delitos e autores, traçar perfis de alvos e delinquentes e até prever crimes.
• Subsidia o dimensionamento/posicionamento de recursos e a gestão do patrulhamento e da investigação.
• Prática moderna fundamentada em TI: estatística computadorizada, SIG e inteligência artificial.` },

  { modulo: "1", frente: "Análise Criminal — Raízes Históricas", verso:
`• Raízes na atividade de Inteligência (estratégias de batalhas chinesas, Sun Tzu).
• Henry Fielding (1707–1754) e os "Bow Street Runners": primeiros traços do uso estruturado.
• Robert Peel: marco da polícia moderna e dos princípios do policiamento.
• Século XIX: surge o conceito de Modus Operandi.
• A partir de 1800, forte aumento das taxas de crime na Europa impulsiona a área.` },

  { modulo: "1", frente: "Vollmer × Wilson × Consolidação/Era de ouro", verso:
`• August Vollmer: pai da polícia AMERICANA — chamada de emergência e mapa de pinos.
• Orlando W. Wilson: o TERMO "análise de crime" surgiu formalmente com ele.
• Consolidação = década de 60.
• Era de ouro = década de 90.` },

  // ── Cap. 2 — Fundamentos ──
  { modulo: "2", frente: "Para que servem os dados na segurança pública?", verso:
`1. Orientar a Administração no planejamento, execução e redirecionamento das ações.
2. Permitir que a população conheça o que acontece ao seu redor.
3. Permitir que a sociedade civil objetive demandas e contribua com a participação comunitária.` },

  { modulo: "2", frente: "Análise Criminal — Definição e Dimensões", verso:
`• Conjunto de processos sistemáticos que provê informação oportuna sobre padrões e tendências do crime, apoiando as áreas operacional e administrativa na distribuição de recursos.
• Dimensão TÁTICA: melhora investigações e patrulhamento.
• Dimensão ESTRATÉGICA: permite projetar cenários.
• Em PE: DEACE (2001) → hoje GACE, da SDS.` },

  { modulo: "2", frente: "Por que fazer análise criminal? (nova perspectiva)", verso:
`• Sair da ação reativa para a preventiva (criar ambiente seguro).
• (1) Examinar cada problema e suas causas; (2) considerar leque amplo de opções; (3) escolher por custo × benefício, orientada a resultados.` },

  { modulo: "2", frente: "Quadro Efetividade das Estratégias de Policiamento (EUA, 2003)", verso:
`• Orientada a Problemas: evidência FORTE/moderada (única forte!).
• Comunitário: fraca/moderada.
• Focado: fraca/moderada.
• Tradicional: FALTA evidência.
⚠ Cerqueira e Lobão (2003): mais gasto não reduz homicídio; a redução da desigualdade social foi o único fator diretamente ligado à queda.` },

  { modulo: "1", frente: "Era de Ouro (anos 90) — características", verso:
`• 1990: livro "Policiamento Orientado para a Solução de Problemas" (Goldstein).
• 1990/91: criação da IACA + 1ª conferência.
• 1992: certificação em Análise Criminal (Califórnia).
• Fundos federais + tecnologias acessíveis (mapeamento, BD relacionais).
• 1994: CompStat (NYPD), gestão por resultados.` },

  { modulo: "1", frente: "UCR — Programa Padronizado de Registro de Crimes", verso:
`• Criado ~1930, administrado pelo FBI; indicador líder das estatísticas criminais nos EUA.
• IACP (1922) iniciou a discussão; Vollmer foi um dos instrumentalizadores.
• Mudou o paradigma JURÍDICO (tipo penal isolado) para CATEGORIAS AMPLAS (roubo), permitindo comparação.
• Paralelo no Brasil: SINESPJC (SENASP, 2003).` },

  { modulo: "1", frente: "Wilson — 'fórmulas de risco' e outras vertentes", verso:
`• Fórmulas de risco: pesos a crimes/chamadas para alocar recursos (base dos centros de despacho).
• Vertentes paralelas (anos 60–70): Análise Criminal Investigativa e Análise Criminal de Inteligência.` },

  { modulo: "1", frente: "Novas abordagens em prevenção (Goldstein, 1990)", verso:
`• Policiamento Orientado para a Solução de Problemas (POP).
• Incidentes são sintomas de problemas profundos: atacar o PROBLEMA e as causas, não só o evento.
• Para solucionar: 1º identificar, depois analisar — trabalho do analista criminal.` },

  { modulo: "2", frente: "Papel do Analista Criminal", verso:
`• Mais que fonte de informação: deve atuar como conselheiro e pesquisador.
• Bom analista: proativo, pesquisador, bom avaliador e olhar investigativo.
• Não espera demanda: antecipa problemas, avalia causas, busca respostas efetivas e aprende com os resultados.` },

  { modulo: "2", frente: "As 4 Etapas do Analista Criminal", verso:
`1. Sistematizar e analisar os dados.
2. Submeter os dados → identificar os padrões.
3. Identificar formas de intervir.
4. Avaliar o impacto das intervenções (realimenta o ciclo).
⚠ Não confundir com o fluxo estatístico (Coleta → Crítica → Apresentação → Análise).` },

  { modulo: "2", frente: "Focalização e Pirâmide", verso:
`• Focalização: olhar o crime de forma SEPARADA (focada), direcionando a ação.
• Pirâmide: poucos alvos/locais/ofensores respondem pela maior parte dos crimes (base larga → topo prioritário).` },

  { modulo: "2", frente: "Análise Criminal — multidisciplinar e suas dimensões", verso:
`• É multidisciplinar (várias áreas do conhecimento).
• Duas dimensões: TÁTICA e ESTRATÉGICA.
• Problemática no Brasil: ausência de cultura técnica.` },

  // ── Cap. 3 — Teorias ──
  { modulo: "3", frente: "Teoria da Escolha Racional (Cornish & Clarke)", verso:
`• O crime é, em boa medida, escolha racional: pondera custos × benefícios (maximiza benefícios, minimiza custos).
• Fatores: acesso fácil ao alvo, baixa chance de ser descoberto, utilidade do bem e sensação de anonimato.
• Duas fases: modelo de envolvimento inicial e modelo do evento criminal.
• Aplicação: Prevenção Situacional de Crimes.` },

  { modulo: "3", frente: "Teoria da Atividade de Rotina (Cohen & Felson, 1979)", verso:
`• Complementar à Escolha Racional.
• Explica o encontro entre criminoso e alvo no tempo e no espaço, durante as atividades rotineiras diárias.` },

  { modulo: "3", frente: "Triângulo do Crime (ou do Problema)", verso:
`• Para o crime ocorrer, convergência de 3 elementos: ofensor motivado + alvo/vítima atraente + ausência de guardião capaz.
• O guardião não é necessariamente policial — qualquer presença que desencoraje (vizinho, porteiro, câmera, alarme).` },

  { modulo: "3", frente: "Triângulo Ampliado (Eck, 2003) — Controladores", verso:
`• Cuidador (handler): controla o OFENSOR (pais, cônjuge, professores).
• Gerente/Administrador: zela pelo LOCAL (síndico, gerente, diretor).
• Guardião: protege o ALVO/VÍTIMA.` },

  { modulo: "3", frente: "Oportunidade como Facilitadora — 10 Princípios (Felson & Clarke, 1998)", verso:
`(a) tem papel causal; (b) é altamente específica; (c) concentra-se no tempo/espaço; (d) depende das rotinas diárias; (e) um crime gera oportunidades para outros; (f) alguns produtos são mais tentadores; (g) mudanças sociais/tecnológicas criam novas oportunidades; (h) reduzir oportunidades previne crimes; (i) geralmente não há deslocamento; (j) pode reduzir as taxas de crime.` },

  { modulo: "3", frente: "Teoria do Padrão Criminal — Nós, Caminhos e Fronteiras", verso:
`• O crime ocorre na interseção entre a área de atividade do ofensor e a da vítima/alvo.
• Nós (nodes): lugares de origem/destino (casa, trabalho, lazer).
• Caminhos (paths): ligam os nós (eixos de ação criminal).
• Fronteiras (edges): limites entre áreas — estranhos tendem a delinquir nas bordas e retornar à própria comunidade.` },

  { modulo: "3", frente: "Criminologia Ambiental", verso:
`• Introduz a dimensão espacial no fenômeno criminal; foco no EVENTO criminal e nas circunstâncias imediatas (não no criminoso).
• Convergência de 3 perspectivas: Escolha Racional + Atividade de Rotina + Padrão Criminal.
• Objetivo: PREVENIR o crime, não curar o criminoso.
• 3 premissas: ambiente imediato influencia; distribuição no tempo/espaço não é aleatória; entender o ambiente é poderoso instrumento de prevenção.` },

  // ── Cap. 4 — Coleta ──
  { modulo: "4", frente: "Coleta de Informação — Sistemas, Fontes e Qualidade", verso:
`• A informação é ativo de grande valor e deve ser protegida (Segurança da Informação).
• Qualidade depende de veracidade e precisão; o sub-registro de crimes pelas polícias é um problema reconhecido.
• A categorização segue o Código Penal e o Sistema INFOPOL (principal base de ocorrências em PE).` },

  { modulo: "4", frente: "As 3 Fontes de Dados de Criminalidade", verso:
`1. Polícia Civil — Registros de Ocorrência (RO); base em PE.
2. SIM — Sistema de Informação sobre Mortalidade (Min. Saúde).
3. Pesquisas de vitimização — experiência da população com o crime.
• Fonte primária: você coleta. Secundária: usa dados de outro.` },

  { modulo: "4", frente: "Identificação Cadavérica (pulseira)", verso:
`• Pulseira de identificação de cadáver: mecanismo criado em PERNAMBUCO.
• Atribui a cada morte violenta uma identificação numérica.
• Permite registro rápido e preciso e evita a hiper notificação (duplicidade).` },

  { modulo: "4", frente: "SIM × Polícia", verso:
`• SIM: classifica por CID (CID-10 desde 1996); registra pelo LOCAL DO ÓBITO.
• Polícia: classifica pelo Código Penal; registra pelo LOCAL DO FATO.
• Taxas da saúde (SIM) são sempre MAIORES; fontes não são diretamente comparáveis.` },

  { modulo: "4", frente: "Registro de Ocorrência (RO) e Sub-registro", verso:
`• RO: documento da Polícia Civil que pode iniciar o inquérito policial.
• Sub-registro (Kant de Lima, 1995): RO só efetivado "quando a polícia deseja".
• Ênfase no modus operandi → mais títulos de ocorrência que classificações penais.` },

  { modulo: "4", frente: "Panorama das bases de dados", verso:
`• Dados na América Latina são grosseiramente inadequados (Banco Mundial): sub-registro.
• Usa-se a taxa de homicídio (saúde) como indicador (menor sub-registro).
• Críticas (BID): (a) ainda há sub-registro; (b) violências graves não viram morte; (c) subestima outras formas.
• Taxas iguais ocultam composições diferentes (ex.: RJ x SP, 1996).` },

  // ── Cap. 5 — Estatística ──
  { modulo: "5", frente: "Conceitos Básicos de Estatística", verso:
`• População: conjunto com ao menos uma característica em comum.
• Censo: dados de TODOS os elementos da população.
• Amostra: dados de uma PARTE representativa.
• Variáveis: guardam as informações (idade, gênero, nº de crimes...).
• Estatística descritiva: técnicas para resumir e apresentar os dados.` },

  { modulo: "5", frente: "Séries Estatísticas (3 tipos)", verso:
`• Fatores: época (tempo), local (espaço) e fenômeno.
• Temporal (cronológica): varia a época.
• Geográfica (territorial): varia o local.
• Específica (categórica): varia o fenômeno.` },

  { modulo: "5", frente: "Apresentação de Dados — Tabelas e Gráficos", verso:
`• Elementos (tabela/gráfico): título (o quê? quando? onde?), corpo e rodapé (fonte, notas, chamadas).
• Tipos de gráfico: colunas (verticais), barras (horizontais), setores (proporção do total), linhas/curvas (séries temporais), histograma (barras justapostas) e polígono de frequência.` },

  { modulo: "5", frente: "Parâmetros para Comparação Relativa", verso:
`• Proporção: parte ÷ total.
• Porcentagem: proporção × 100.
• Razão: A ÷ B (relaciona quantidades diferentes; ex.: policiais por viatura).` },

  { modulo: "5", frente: "Distribuição de Frequência", verso:
`• Frequência absoluta: nº de vezes que o valor é observado.
• Absoluta acumulada: soma das absolutas até o valor.
• Relativa: absoluta ÷ total de observações.
• Relativa acumulada: soma das relativas até o valor.` },

  { modulo: "5", frente: "Medidas de Tendência Central", verso:
`• Média: soma dos valores ÷ nº de casos.
• Moda: valor mais frequente.
• Mediana: valor central (divide a amostra ao meio).
• Taxa bruta: (vítimas ÷ população de risco) × 100.000.
• Quartis (4 partes iguais) e decis (10 partes iguais).
⚠ Taxa de uma região: somar vítimas e populações das UFs e calcular — nunca a média das taxas.` },

  { modulo: "5", frente: "Medidas de Dispersão", verso:
`• Amplitude: maior valor − menor valor.
• Variância (s²): grau de dispersão em torno da média.
• Desvio padrão (σ): raiz quadrada da variância.` },

  { modulo: "5", frente: "Coeficiente de Correlação (r)", verso:
`• Mede a intensidade da associação linear entre 2 variáveis; varia de −1 a +1.
• r = 0: sem correlação. r > 0: positiva (sobem juntas). r < 0: negativa (uma sobe, outra desce). Quanto mais perto de ±1, mais forte.
⚠ A correlação NÃO permite inferência (não diz qual causa qual) — para isso usa-se a análise de regressão.` },

  // ── Cap. 6 — Mapeamento ──
  { modulo: "6", frente: "Geoprocessamento e SIG", verso:
`• Geoprocessamento: tecnologias para coletar e tratar informações espaciais (cartografia, sensoriamento remoto, GPS, banco de dados...).
• SIG (Sistema de Informações Geográficas): processa dados gráficos e não-gráficos, com ênfase em análise espacial.
• Diferencial frente a um SI comum: armazena atributos descritivos + geometrias.` },

  { modulo: "6", frente: "SIG — Componentes e Funções", verso:
`• Componentes (Lazzarotto): software, hardware, dados, metodologias e recursos humanos.
• Funções principais: captura, análise, armazenamento, visualização/consulta e saída das informações.` },

  { modulo: "6", frente: "SIG — Representação: Vetorial × Matricial", verso:
`• Vetorial: pontos, linhas e polígonos (sistema de coordenadas).
• Matricial (raster): grade regular de elementos — células/pixels.` },

  // ── Cap. 7 — Ferramentas ──
  { modulo: "7", frente: "Ferramentas — Excel / Calc e Tabela Dinâmica", verso:
`• Excel e Calc: planilhas eletrônicas para tratamento e cruzamento de dados.
• Diferença: Excel = Microsoft (Office, pago); Calc = suíte livre (LibreOffice/OpenOffice).
• A tabela dinâmica é muito usada na produção do relatório operacional.` },

  { modulo: "7", frente: "SACE (Power BI)", verso:
`• Sistema de Análise Criminal e Estatística, desenvolvido pela GGACE.
• Usa o Power BI (coleção de serviços, apps e conectores) para transformar dados em insights interativos e monitorar indicadores criminais.` },

  { modulo: "7", frente: "QlikView", verso:
`• Solução de BI usada nas reuniões do Juntos pela Segurança para monitorar indicadores.
• Dashboards por "arrastar e soltar"; funcionalidades semelhantes às do Power BI.` },

  { modulo: "7", frente: "Sistema INFOPOL", verso:
`• Ferramenta de coleta e análise de ocorrências policiais, administrada pela GGTI/SDS.
• Visão de ocorrências: todas as registradas pela Polícia Civil.
• Visão de homicídio: homicídio doloso, latrocínio, lesão seguida de morte, feminicídio, suicídio, acidentes de trânsito com vítima fatal, etc.` },
]

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MATERIA } })
  if (!disc) throw new Error(`Disciplina ${MATERIA} não existe.`)

  await prisma.memento.upsert({
    where: { materia_modulo_titulo: { materia: MATERIA, modulo: "", titulo: TITULO } },
    update: { conteudoMd: MD, ordem: 0 },
    create: { materia: MATERIA, modulo: "", titulo: TITULO, conteudoMd: MD, ordem: 0 },
  })
  console.log(`✓ Memento de ${MATERIA} salvo (${MD.length} caracteres).`)

  let n = 0
  for (const c of CARDS) {
    const hash = createHash("sha1").update(`${MATERIA}|${c.modulo}|${c.frente}`).digest("hex")
    await prisma.flashcard.upsert({
      where: { hash },
      update: { verso: c.verso, ordem: n },
      create: { materia: MATERIA, modulo: c.modulo, frente: c.frente, verso: c.verso, ordem: n, hash },
    })
    n++
  }
  console.log(`✓ ${n} flashcards de ${MATERIA} importados/atualizados.`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
