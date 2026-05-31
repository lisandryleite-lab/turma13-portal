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
- Tem raízes na atividade de **Inteligência** (estratégias chinesas, Sun Tzu).
- **Henry Fielding (1707–1754)**, magistrado inglês, e seus *"Bow Street Runners"*: primeiros traços do uso estruturado de rudimentos da análise criminal.
- A partir de **1800** as taxas de crime na Europa aumentaram fortemente, impulsionando o desenvolvimento da área (e o imaginário de Sherlock Holmes).

---

# Capítulo 2 — Fundamentos Teóricos

## Para que servem os dados na segurança pública?
1. Orientar a Administração no **planejamento, execução e redirecionamento** das ações policiais.
2. Permitir que a **população** conheça o que acontece ao seu redor.
3. Permitir que sociedade civil e demais setores **objetivem demandas** por providências e contribuam com a participação comunitária.

## Definição e dimensões
- A análise criminal é um **conjunto de processos sistemáticos** voltados a prover informação oportuna e pertinente sobre os padrões do crime e suas tendências, apoiando as áreas **operacional** e **administrativa** na distribuição de recursos para prevenção e supressão.
- **Dimensão tática:** melhora investigações e patrulhamento.
- **Dimensão estratégica:** permite aos gestores projetar cenários.
- Em PE: o **DEACE (2001)**, hoje **GACE (Gerência de Análise Criminal e Estatística)**, da SDS, coleta dados e produz relatórios.

## Por que fazer análise criminal? (nova perspectiva)
- Sair da ação **reativa** (cadeia sem fim de incidentes) para a **preventiva** (criar ambiente seguro).
- A nova lógica exige: (1) examinar cada problema e suas causas; (2) considerar um leque amplo de opções; (3) escolher pela relação **custo × benefício**, orientada a resultados.

## Efetividade das estratégias de policiamento (Skogan e Frydl, 2004)
- **Tradicional** (sem foco, só reforço da lei): falta de evidência de redução da criminalidade.
- **Comunitário** e **orientado a problemas**: o orientado a problemas (foco + estratégias diversas) tem **fortes evidências** de redução.

> ⚠ Cerqueira e Lobão (2003): aumentar o gasto em segurança não reduz, por si, os homicídios — a **redução da desigualdade social** foi o único fator diretamente relacionado à queda.

## Papel do analista criminal
- Mais que fonte de informação, deve atuar como **conselheiro** e **pesquisador**.
- Não espera demanda: antecipa problemas, avalia causas, busca as respostas mais efetivas e aprende com os resultados (positivos ou negativos).

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
- **Fontes de segurança pública** e a **qualidade da informação** (veracidade, precisão) são essenciais; o **sub-registro** de crimes pelas polícias é um problema reconhecido.
- A categorização criminal segue o **Código Penal** e o **Sistema INFOPOL**, principal base de ocorrências em PE.

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

---

# Capítulo 7 — Operacionalização: Ferramentas

- **Excel / Calc:** planilhas eletrônicas para tratamento e cruzamento de dados; a **tabela dinâmica** é muito usada na produção do relatório operacional.
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
`• Raízes na atividade de Inteligência (estratégias chinesas, Sun Tzu).
• Henry Fielding (1707–1754) e os "Bow Street Runners": primeiros traços do uso estruturado.
• A partir de 1800, forte aumento das taxas de crime na Europa impulsiona a área.` },

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

  { modulo: "2", frente: "Efetividade das Estratégias de Policiamento (Skogan e Frydl, 2004)", verso:
`• Tradicional (sem foco, só reforço da lei): sem evidência de redução da criminalidade.
• Orientado a problemas (foco + estratégias diversas): fortes evidências de redução.
⚠ Cerqueira e Lobão (2003): mais gasto não reduz homicídio; a redução da desigualdade social foi o único fator diretamente ligado à queda.` },

  { modulo: "2", frente: "Papel do Analista Criminal", verso:
`• Mais que fonte de informação: deve atuar como conselheiro e pesquisador.
• Não espera demanda: antecipa problemas, avalia causas, busca respostas efetivas e aprende com os resultados.` },

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
