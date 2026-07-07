import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const MATERIA = "INTSISP" // Inteligência e Sistema de Informação de Seg. Pública
const TITULO = "Memento — Inteligência e Sistema de Informação de Segurança Pública (INTSISP)"

// Fonte: "Resumo INTSISP" (CFO PMPE). Flashcards descontinuados no portal — só memento.
const MD = `# 1. Fundamentos históricos da inteligência no Brasil
A evolução da atividade de inteligência no Brasil é dividida em **quatro fases**, marcadas pela criação e substituição de órgãos:

| Ano | Marco |
|---|---|
| **1927** | Criação do **Conselho de Defesa Nacional (CDN)** — precursor do SISBIN |
| **1944** | Serviço de Informações e Contrainformações (**SIC**) |
| **1946** | Serviço Federal de Informações e Contrainformações (**SFICI**) |
| **1964** | O SFICI é substituído pelo **Serviço Nacional de Informações (SNI)** |
| **1995** | Criação da **ABIN** e do **SISBIN** |
| **2016** | Aprovação da **Política Nacional de Inteligência (PNI)** |

**As quatro fases:**
- **Fase Embrionária** → 1927 a 1964.
- **Fase da Bipolaridade** → 1964 a 1990 (atuação do SNI).
- **Fase de Transição** → 1990 a 1999.
- **Fase Contemporânea** → 1999 até os dias atuais.

---

# 2. Sistema Brasileiro de Inteligência (SISBIN)
- **Lei nº 9.883/1999** → criou a **ABIN** e o **SISBIN**.
- **Objetivo do SISBIN:** integrar as ações de **planejamento e execução** das atividades de inteligência do país, fornecendo subsídios ao **Presidente** em assuntos de interesse nacional.
- **Inteligência** → obtenção, análise e disseminação de conhecimentos sobre fatos e situações relevantes ao processo decisório e à segurança do Estado.
- **Contrainteligência** → visa **neutralizar a inteligência adversa**.

## ABIN — órgão central do Sistema
- Responsável por **planejar, executar, coordenar, supervisionar e controlar** as atividades de inteligência do país.
- Também responde pela **proteção de conhecimentos sensíveis**, **avaliação de ameaças** à ordem institucional e **desenvolvimento de RH**.
- A execução da **PNI** é de responsabilidade da ABIN, **supervisionada pela Câmara de Relações Exteriores e Defesa Nacional do Conselho de Governo**.
- O **controle e a fiscalização externos** das atividades de inteligência cabem ao **Legislativo**.
- A ABIN pode firmar **convênios, acordos e contratos**.

> ⚠ A ABIN só pode se comunicar com outros órgãos da Administração Pública **com conhecimento prévio da autoridade superior** do órgão respectivo.

> 🔑 No **Subsistema de Inteligência de Segurança Pública**, o órgão central é a **SENASP**.

---

# 3. Sistema Estadual de Inteligência (SEINSP)
- **Lei nº 13.241/2007** → instituiu o **SEINSP**.
- **CIIDS** (Centro Integrado de Inteligência de Defesa Social) → órgão responsável pela **coordenação, planejamento e execução**.
- O **chefe do CIIDS** é um **Delegado da Polícia Civil**.
- O SEINSP é composto por diversos **subsistemas**: PM, PC, Sistema Prisional, CBM, Casa Militar etc.
- **Cada subsistema** possui uma **Agência Central de Inteligência** responsável pela coordenação das atividades de inteligência.

## Subsistema da PMPE (SIPOM)
- Coordena e executa atividades de inteligência e contrainteligência, visando à **coleta, análise e disseminação** de informações estratégicas para a **prevenção e repressão de crimes**.
- Atua de forma **integrada** com outros órgãos de segurança pública.

> 🔑 Órgãos **sem** unidades de inteligência podem integrar o SISBIN como **associados** (procedimentos definidos pela ABIN). O ingresso como **dedicado ou associado** promove a profissionalização e a segurança do SISBIN.

---

# 4. Fundamentos doutrinários e ética
- A atividade de inteligência busca **identificar oportunidades** para a realização dos objetivos das políticas públicas essenciais à segurança e ao bem-estar da sociedade.
- **Inteligência** → produção e disseminação de conhecimento sobre eventos e situações que possam influenciar o processo decisório e a ação governamental.
- **Eventos** → envolvem contextos, estruturas e atores; são interpretados com base nas experiências compartilhadas pela sociedade.
- **Fenômenos** → processos compostos pela evolução de fatos, eventos e situações ao longo do tempo.
- **Contrainteligência** → prevenir, detectar e neutralizar atividades de inteligência adversa.
- **Ação adversa** → ação **intencional** que busca **ilegitimamente** acessar informações sensíveis, ameaçando a segurança de pessoas e instituições do Brasil.

## Ética
- O comportamento ético permite o **controle interno**, exercido pelo **próprio profissional**, baseado em sua consciência.
- O profissional deve agir de forma ética **tanto na vida profissional quanto na pessoal**.

> ⚠ **Transparência:** a transparência ativa deve ser assegurada sempre que possível, mas a atividade — por lidar com informações sensíveis — mantém o **sigilo** quando a divulgação puder comprometer as ações de inteligência.

---

# 5. Princípios e valores
## Princípios
Aplicam-se à atividade como um todo: **Controle, Cooperação, Objetividade, Oportunidade, Rastreabilidade, Segurança, Simplicidade e Utilidade.**

| Princípio | Ideia-chave |
|---|---|
| **Controle** | Supervisão para garantir conformidade e finalidade correta |
| **Cooperação** | Trabalho em equipe e otimização de esforços |
| **Objetividade** | Atuação com objetivos claros, evitando desperdícios |
| **Oportunidade** | Resultados em prazo adequado |
| **Rastreabilidade** | Registros para auditoria |
| **Segurança** | Proteção de informações e ações |
| **Simplicidade** | Minimizar complexidade, custos e riscos desnecessários |
| **Utilidade** | Atender às necessidades do usuário (produto útil) |

Cada componente tem princípios orientadores: na **análise**, a **objetividade** (evitar vieses); nas **operações**, a **oportunidade** (tempo hábil); a **segurança** protege equipe e órgão nas ações sigilosas.

## Valores (são 4)
- **a) Formação contínua** dos profissionais (ensino, pesquisa e extensão).
- **b) Confiabilidade da segurança** (constrói reputação; dissuade ações adversas).
- **c) Pensamento crítico** (questiona o próprio ato de pensar; melhora o padrão mental).
- **d) Orientação a resultados** (ações direcionadas a objetivos claros; funções de **informar e executar**).

---

# 6. Ramo Inteligência e classificações
O **ramo de inteligência** é focado na **função informacional**: obtém, processa e difunde dados e conhecimentos, atuando no reconhecimento de **ameaças e oportunidades**.

## Por PROPÓSITO
- **Base** → compreensão e contextualização de temas acompanhados.
- **Estratégica** → analisa fenômenos com potencial para impactar objetivos do Estado.
- **Tática** → assessora decisões sobre políticas governamentais.
- **Operacional** → contextualização para ação pontual do Estado.

## Por RECORTE TEMPORAL
- **de Alerta** → antecipa eventos que possam impactar objetivos constitucionais, ordem nacional e segurança.
- **Corrente** → mantém as autoridades atualizadas sobre eventos em progresso.
- **Explanativa** → assessora o processo decisório sobre fatos, eventos, situações e fenômenos.
- **Prospectiva** → oferece cenários futuros para assessorar a ação estatal.

## Por FONTES (origem do dado)
- **Humanas (HUMINT)** → dados obtidos de pessoas; desafios: falhas de percepção e simplificações heurísticas.
- **Técnicas (TECHINT)** → dados por meios técnicos; subcategorias: **Sigint, Imint, Geoint e Masint**.
- **Abertas (OSINT)** → dados disponíveis; demandam muito tempo de pesquisa e atualização constante.

> 🔑 As classificações **não são excludentes** — um conhecimento pode combinar propósito, recorte temporal e fontes diversas.

**Áreas de atuação no Brasil:** externa, interna, transnacional e cibernética.

---

# 7. Ciclo de Inteligência
Consiste em **5 fases**: **Objetivar, Acompanhar, Informar, Decidir e Agir** — que se **retroalimentam**.
- **Objetivar** → determinação dos temas, recortes e abordagens; definição das áreas a serem cobertas.
- **Acompanhar** → **permanente**; planejamento, reunião e processamento de dados e conhecimentos.
- **Informar** → formatação e difusão do conhecimento produzido para assessorar as instâncias governamentais.
- **Decidir** → tomada de decisão de acordo com as informações obtidas.
- **Agir** → pôr em prática aquilo que fora decidido.

---

# 8. Contrainteligência
O ramo da contrainteligência se dedica a **prevenir, detectar e neutralizar ameaças**, atuando em **duas vertentes**: **preventiva** (salvaguarda de conhecimentos sensíveis e infraestruturas críticas) e **ativa** (contrapor ameaças).

## Preventiva
- Protege conhecimentos sensíveis e infraestruturas críticas; identifica alvos da inteligência adversa e propõe medidas.
- Busca garantir **disponibilidade, integridade, sigilo e autenticidade** dos conhecimentos.
- Critérios ao avaliar ações adversas: **abrangência, grau de influência, grau de violência e potencial de coerção**.

## Ativa (vertentes)
- **Contraespionagem** → detectar e neutralizar espionagem.
- **Contrainterferência** → neutralizar interferência externa.
- **Contrainsurgência** → neutralizar ações de grupos insurgentes.
- **Contraterrorismo** → neutralizar ações de grupos extremistas violentos.

> ⚠ **Contrainteligência ≠ segurança:** a segurança mantém o equilíbrio para ações cotidianas/extraordinárias; a CI previne e contrapõe ações de inteligência adversa.

> 🔑 **Segurança orgânica:** interna às organizações, implementa medidas de segurança e **incorpora as vertentes da contrainteligência**, promovendo a cultura de segurança institucional.

**Ciclo de Contrainteligência (6 fases):** **Acompanhar, Orientar, Detectar, Avaliar, Decidir e Agir**. Acompanhar e orientar são **permanentes**; as demais são acionadas quando uma **ação adversa** é percebida.

---

# 9. Elemento de análise — Dado × Informação × Conhecimento
O **elemento de análise** transforma dados e informações em produtos úteis ao processo decisório, fundamentando-se em princípios **lógico-racionais**.
- O conhecimento deriva de 3 elementos: **realidade, perspectiva do sujeito e intersubjetividade**.
- A busca da verdade depende de 3 concepções: **correspondência, coerência e consenso**.
- Estados da mente perante a verdade: **certeza, probabilidade, possibilidade e ignorância**.

| Conceito | Definição |
|---|---|
| **Dado** | Representação de aspecto da realidade com significado **descontextualizado**; menor unidade de representação |
| **Informação** | Significado **contextualizado** por processamento metódico; pode ser gerada por meios computacionais sem intervenção humana |
| **Conhecimento** | Significado contextualizado, **assumido como verdadeiro e validado**, útil ao processo decisório; justificadamente plausível |

## Conhecimento de inteligência
Deve ser **verdadeiro, oportuno e útil**. Tipos:
- **Narrativo-descritivo** → juízos sobre fatos passados ou presentes.
- **Interpretativo** → juízos e raciocínios sobre fatos passados ou presentes.
- **Interpretativo-prospectivo** → juízos e raciocínios sobre a evolução futura.

> 🔑 Trabalha com **4 situações temporais**: passado, presente, futuro imediato e futuro distante.

---

# 10. Ciclo de análise, MPC e técnicas de apoio
- O **ciclo de análise** transforma dados, informações e conhecimentos em **conhecimento de inteligência** e é efetivado pela **MPC**.
- **MPC (6 fases):** planejamento; reunião; avaliação; integração e interpretação; formalização e validação; difusão e resultados.
  - **Planejamento** → define assunto, usuário, finalidade, limites temporais, prazo de entrega e proposta de equipe.
  - **Reunião** → obtenção e preparo dos insumos (formulação e execução do plano de reunião).
  - **Avaliação** → valida pertinência/significância dos insumos, credibilidade e metadados; aplica a **TAD**.

## Técnicas de apoio à análise
- **TAE (Técnicas Analíticas Estruturadas)** → meios sistemáticos que submetem o trabalho analítico ao controle e escrutínio, reduzindo **vieses cognitivos**.
- **Consulta a especialistas** → ex.: método **Delphi** e **Inferência Bayesiana**.

> 🔑 **Linguagem de inteligência:** simplicidade, objetividade, concisão e neutralidade.

---

# 11. POI e Inteligência × Investigação policial
## Policiamento Orientado pela Inteligência (POI)
- Uso **sistemático** de informações e análises de inteligência para nortear decisões e otimizar recursos policiais; postura **proativa**, antecipando tendências criminosas.
- **3 pilares:** **Coleta de dados → Análise de dados → Disseminação da inteligência.**
- No Brasil: ex. **COPE** (Centro de Operações Policiais Especiais) e **SISP** (Sistema de Inteligência de Segurança Pública).

## Inteligência policial × Investigação policial
| Inteligência policial | Investigação policial |
|---|---|
| **Proativa** — prevenir crimes | **Reativa** — resolver crimes já ocorridos |
| Antecipa ações, entende padrões, apoia políticas | Reconstrói eventos passados e reúne provas |
`

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MATERIA } })
  if (!disc) throw new Error(`Disciplina ${MATERIA} não existe.`)

  await prisma.memento.upsert({
    where: { materia_modulo_titulo: { materia: MATERIA, modulo: "", titulo: TITULO } },
    update: { conteudoMd: MD, ordem: 0 },
    create: { materia: MATERIA, modulo: "", titulo: TITULO, conteudoMd: MD, ordem: 0 },
  })
  console.log(`✓ Memento de ${MATERIA} salvo (${MD.length} caracteres).`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
