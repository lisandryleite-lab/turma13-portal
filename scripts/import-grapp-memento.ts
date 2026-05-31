import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const MATERIA = "GRAPP"
const TITULO = "Memento Completo — Gestão por Resultados & Políticas Públicas"

const MD = `# Módulo 1 — Políticas Públicas

## Conceito
- **Howlett, Ramesh e Perl (2013):** política pública é "tudo o que um governo decide fazer ou deixar de fazer".
- **Jenkins (1978):** conjunto de decisões inter-relacionadas tomadas por ator ou grupo de atores políticos referentes à seleção de objetivos e meios para alcançá-los.
- **Definição geral:** conjunto de decisões, planos, metas e ações governamentais voltados à resolução de problemas de interesse público.

## Classificação — Lowi (1966)
- **Distributivas:** fácil desagregação; recursos aplicados a unidades atomizadas sem critérios universalistas; associadas a clientelismo; pouca oposição social. *Ex.: doação de cadeiras de rodas.*
- **Redistributivas:** padrão soma-zero (para um ganhar, outro perde); redistribuem renda das camadas mais altas para beneficiários de baixa renda. *Ex.: tributos, previdência.*
- **Regulatórias:** prescrevem comportamentos com penalidades pelo descumprimento; trabalham com ordens, proibições, decretos e portarias; incidem de forma diferente em cada segmento social.

> ⚠ As redistributivas exigem balanceamento complexo de interesses conflitantes — nunca haverá mais de dois lados.

## Atores políticos
- **Estatais/públicos:** provenientes do Governo; exercem funções públicas e controlam recursos — inclui políticos e servidores públicos.
- **Privados:** provenientes da sociedade civil — sindicatos, empresários, grupos de pressão, centros de pesquisa, mídia.

## Ciclo de políticas públicas (4 fases)
1. **Formação de agenda:** priorização dos problemas. Para Kingdon, a probabilidade aumenta quando *problema + propostas + receptividade política* se alinham.
2. **Formulação:** criação de opções para solucionar problemas. Métodos: Racional (H. Simon — lista todas as variáveis), Incremental (Lindblom — passo a passo), Sondagem Mista (Etzioni — combina os dois).
3. **Implementação:** tradução de decisões em ações. Modelos: *top-down* (centralizado, governo→sociedade) e *bottom-up* (descentralizado, sociedade→governo).
4. **Avaliação:** análise de impacto, eficiência, eficácia e sustentabilidade. Abordagens: positivista (objetiva, quantitativa) e pós-positiva (inerentemente política, qualitativa). Tipos (Howlett et al.): administrativa, judicial e política.

> ⚠ A avaliação pode e deve ser feita em TODO o processo, não apenas ao final.

---

# Módulo 2 — Gestão por Resultados: Conceitos

## Conceito central
- **GpR** é abordagem gerencial focada na **criação de valor** — privado (lucro) ou público (bem-estar social).
- Coloca objetivos, metas e resultados como principais referências da organização.
- As tarefas não se esgotam com a execução do orçamento ou cumprimento de normas; a gestão deve direcionar processos ao alcance dos objetivos.

## Conceitos auxiliares
- **Objetivos:** alvos que a organização quer atingir em determinado período.
- **Metas:** objetivos quantificados — valor esperado de um indicador em dado tempo.
- **Resultados:** dimensão da eficácia (atingimento do objetivo), medida por indicadores.
- **Acompanhamento:** monitoramento dos indicadores + avaliação das ações planejadas.
- **Indicadores:** medida que informa sobre determinado fenômeno social.
- **Responsabilização:** atribuição de responsabilidades — inclui cobrança e premiação.

> ⚠ Diferença-chave: objetivo é qualitativo/orientativo; meta é quantificada com valor e tempo definidos.

## Ferramentas — Serra (2008)
- **(a) Instrumentos de gestão:** técnicas e tecnologias disponíveis para realizar a GpR.
- **(b) Informação:** "coração da GpR" — dados transformados por recortes de interesse; permite conhecer a realidade e confrontar expectativas.
- **(c) Função gerencial:** pessoas que organizam informações, responsabilização, recompensa e gestão do conhecimento conforme os instrumentos disponíveis.

---

# Módulo 3 — GpR na Administração Pública

## Histórico
- **Até os anos 1930:** Administração Pública dominada pelo patrimonialismo e clientelismo.
- **Anos 1930:** reformas iniciam racionalização com foco na burocracia e controle de processos (influência do Taylorismo/Fordismo).
- **2ª metade do séc. XX:** ascensão do modelo gerencial com foco em resultados, influenciado por Peter Drucker (Plano Diretor da Reforma do Estado, 1995).

## Características da GpR pública
- Desloca a criação de valor privado (lucro) para valor público (bem-estar social).
- Mantém a obrigatoriedade da legalidade (fazer apenas o previsto em lei).
- Exige prestação de contas sobre recursos públicos, seguindo regras próprias.
- Necessidade de licitação para compras e contratações.
- Beneficiários tratados como cidadãos, não como clientes.
- Estruturas de GpR convivem com imperativos burocráticos e cultura organizacional rígida.

> ⚠ A GpR pública NÃO elimina a burocracia — ela coexiste com os controles normativos legais.

## Valor público — Moore/Serra
- Sejam politicamente desejáveis (legitimação democrática); de propriedade coletiva; requeiram geração de mudanças sociais que modifiquem aspectos da sociedade.

---

# Módulo 4 — GpR em Pernambuco e os NGR

## Histórico e estrutura
- **2007:** início do **Pacto Pela Vida (PPV)** — primeira experiência de GpR com escopo considerável gerenciada pela própria Adm. Pública.
- **2009:** **Lei Complementar 141** — normatiza o Modelo Integrado de Gestão do Poder Executivo de PE.
- **2013:** **Decreto 39.336** — estabelece o **Valor Público** como objetivo dos Programas de Estado.
- Abrangência inicial: Educação, Saúde e Defesa Social (maiores orçamentos e pessoal).
- **NGR** (Núcleos de Gestão por Resultados): geridos por servidores da SEPLAG dentro das secretarias.

## LC 141/2009 — deveres da SEPLAG
- Estruturar atividades de planejamento, desenvolvimento e acompanhamento de ações.
- Coordenar a gestão estratégica do Governo e sistematizar o gerenciamento dos projetos estratégicos.
- Conciliar elaboração/revisão anuais dos instrumentos de planejamento com monitoramento mensal da execução e avaliação quadrimestral dos resultados.
- Definir parâmetros, conteúdos e cláusulas dos Pactos de Resultados.

## Decreto 39.336/2013
- **Valor Público:** I – eficiência dos recursos públicos; II – qualidade dos serviços à sociedade; III – geração de bem-estar social.
- **Indicador principal:** Taxa de Crimes Violentos Letais Intencionais — **CVLI**.
- **Requisitos do Pacto:** meta mobilizadora (EFICÁCIA) + metas intermediárias (EFICIÊNCIA) + sistemática de monitoramento + protocolos meritocráticos.

> ⚠ Cabe à SEPLAG definir os parâmetros dos Pactos — a implantação é das Secretarias Executoras.

## NGR — papéis distintos
- **NGR / SEPLAG:** exerce a **função gerencial** da GpR — produz dados, diagnósticos e análises; apoia o planejamento e monitora indicadores. **NÃO implementa políticas.**
- **Gerências das Secretarias:** responsáveis pelo gerenciamento da criação de valor em si — coordenam ações que geram resultados.
- **Técnicos:** responsáveis diretos pela criação do valor público — policiais, delegados, bombeiros que executam as ações.

> ⚠ Os três papéis NÃO devem ser confundidos: função gerencial ≠ gerência operacional ≠ execução técnica.

## NGR — atribuições (Decreto 39.336/2013)
- Desenvolver, em parceria com a Secretaria Executora, o modelo de monitoramento e avaliação dos resultados.
- Apoiar a Secretaria Executora no planejamento, monitoramento e avaliação das ações.
- Produzir dados, diagnósticos e análises sobre resultados da Secretaria Executora e seus órgãos.
- Realizar o monitoramento das metas de investimento constantes no Plano Plurianual.

---

# Módulo 5 — Juntos pela Segurança (JPS)

## Histórico
- **PPV (Pacto Pela Vida):** política de segurança de PE de 2007 a 2022; espinha dorsal = redução dos homicídios dolosos.
- **PESP** consolidado em **08/05/2007** com diagnóstico da criminalidade, linhas de ação e meta estruturante.
- Entre **2000–2012:** estados nordestinos com aumento de renda per capita acima da média nacional, mas com crescimento das mortes violentas.
- **JPS:** política transversal atual que busca promover a paz, prevenir a violência e combater a desigualdade em TODAS as regiões.
- **Plano Estadual 2023–2030:** formulado em 2023 via workshops, oficinas e escuta popular; lançado em **27/11/2023**.

## Os 5 pilares (Plano 2023–2030)
- **(a) Prevenção da Violência e Redução da Desigualdade:** atua em violência doméstica e dependência química para criar cultura de paz duradoura.
- **(b) Atuação Conjunta com Municípios e Instituições:** recupera espaços públicos degradados e oferta serviços em áreas dominadas pelo crime organizado.
- **(c) Enfrentamento ao Crime Organizado e Tráfico:** poder público e sociedade civil como parceiras; valoriza profissionais de segurança.
- **(d) Articulação com o Sistema de Justiça:** reduz impunidade, acelera processos e garante acesso à justiça nas comunidades mais vitimizadas.
- **(e) Ampliação e Requalificação dos Sistemas Prisional e Socioeducativo:** reintegração como estratégia de redução da reincidência.

## 6 eixos estratégicos
- **(a) Prevenção à Violência** (infância, juventude, drogas, grupos vulneráveis, VCM)
- **(b) Cidades Seguras e Articulação com Municípios** (espaços públicos, iluminação, participação comunitária)
- **(c) Polícia e Defesa Social** (crime organizado, valorização profissional, modernização)
- **(d) Articulação com o Sistema de Justiça** (impunidade, celeridade, mediação de conflito)
- **(e) Administração dos Sistemas Prisional e Socioeducativo**
- **(f) Ressocialização** (reintegração de presos e adolescentes em medidas socioeducativas)

## 5 diretrizes do plano
- **Territorialidade:** adaptar ações às particularidades de cada território, identificando os prioritários.
- **Transversalidade:** considerar a segurança pública em várias áreas (educação, saúde, emprego, etc.).
- **Participação:** envolvimento ativo dos servidores da SDS e de diversas secretarias e atores.
- **Integração/Liderança:** colaboração entre atores em todos os eixos; liderança comprometida nos níveis estratégico e operacional.
- **Resultados:** busca por resultados efetivos e mensuráveis na promoção da segurança.

## Estrutura territorial — AIS
- PE dividido em **26 AIS** que integram PM e PC dentro da mesma extensão territorial.
- Cada AIS agrupa, via de regra, **1 BPM (ou CIPM) + 1 Delegacia Seccional**.
- Na RMR e em algumas cidades do interior, também responde pela AIS o Delegado de Homicídios.
- **Total:** 51 Organizações Militares Estaduais + 26 Delegacias Seccionais.

| Diretoria | AIS | Municípios | Área | População |
|---|---|---|---|---|
| DIM (Metropolitana) | 10 | 14 | 2.767 km² | ~3,96 mi |
| DINTER 1 (Mata/Agreste) | 8 | 109 | 28.449 km² | ~3,6 mi |
| DINTER 2 (Sertão) | 8 | 61 | 63.299 km² | ~1,98 mi |
| DIRESP (Especializadas) | — | — | sem área | atuação temática |

> ⚠ A DIRESP NÃO tem área territorial definida — sua atuação é temática (narcotráfico, trânsito, meio ambiente, turismo), não geográfica.

## Normas legais
- **Plano Estadual de Segurança Pública e Defesa Social 2023–2030:** documento principal, construído a partir de escuta popular, oficinas e seminários.
- **Lei nº 16.170/2017:** disciplina a **GPPV** (Gratificação Pacto pela Vida) — premia metas intermediárias/eficiência (armas, mandados, crack).
- **Lei nº 16.171/2017:** disciplina o **PDS** (Prêmio de Defesa Social) — premia por resultados conforme nível de alcance da meta e lotação do servidor.
- O JPS propôs alterações nas legislações do PPV; enquanto aguardam publicação, as leis citadas continuam vigentes.

> ⚠ A GPPV tem natureza de premiação meritória — NÃO integra a remuneração do servidor. Seu pagamento é condicionado ao alcance das metas do PDS.

---

# Módulo 6 — Indicadores e Sistema de Bonificação

## Tipos de indicadores
- **Indicadores de Resultado:** orientam ONDE o Estado pretende chegar.
- **Indicadores de Processo:** orientam as atividades operacionais (também chamados Protocolos).

## Indicadores de resultado
- **MVI — Morte Violenta Intencional (principal):** homicídios dolosos + lesões corporais seguidas de morte + latrocínios + excludentes de ilicitude. Expresso em contagem e taxa/100 mil hab.
- **CVP — Crime Violento Patrimonial:** roubo e variações (exceto latrocínio) + extorsão + sequestro. RFV (Roubos e Furtos de Veículos) monitorados separadamente.
- **VCM — Violência Contra a Mulher:** feminicídio, tentativa de feminicídio, estupro, lesão corporal e ameaça com vítimas mulheres.
- **Efetividade do Sistema Prisional:** vagas construídas no sistema prisional.
- **Efetividade da Ressocialização:** percentual de presos em atividade laboral ou educacional.

> ⚠ Latrocínio = MVI (não CVP). Envolve morte; por isso integra as mortes violentas.

## Indicadores de processo (protocolos)
- **Ocupação Territorial (PMPE):** lançamento de efetivo; abordagens (celular, mandados, veículos).
- **Procedimento Investigativo (PCPE):** Taxa de Conclusão de Inquéritos — MVI, Tent. MVI, Feminicídio, Tent. Feminicídio.
- **Prisões e Apreensões (PMPE e PCPE):** mandados, flagrante geral, flagrante de crimes selecionados, flagrante MVI, apreensão de armas de fogo.
- **Frequência da Apreensão de Armas de Fogo:** diária (extraída dos BOs da Polícia Civil).

## Sistemática de análise
- **Cores gerenciais:** verde = alcance total | amarelo = alcance parcial | vermelho = descumprimento.
- **Análises de estratificação, classificação e tipificação:** localização, horários, tipologia, arma, motivação, perfil das vítimas.
- **Método de Diferença em Diferença:** compara a localidade (AIS/município/bairro) com ela mesma antes da ação E com outra semelhante (antes e depois).

> ⚠ Verde = BOM resultado; vermelho = MAU resultado. Atenção: lógica inversa à do semáforo de alerta.

## Técnicas de gestão do NGR
- **Gestão Estratégica:** construção, execução e comunicação da estratégia.
- **Gestão de Processos:** identificação, mapeamento e melhoria de rotinas.
- **Gestão de Dados:** processamento, documentação e transformação de dados em informações.
- **Gestão de Projetos:** gerenciamento de atividades não rotineiras com objetivo, tempo e escopo definidos.

## PDS — Prêmio de Defesa Social (Lei 16.171/2017)
- Premiação por resultados — destinada a policiais civis, militares e bombeiros militares da SDS e Casa Militar.
- **Base:** desempenho no processo de redução de MVI.
- Meta definida **trimestralmente** por portaria conjunta SEPLAG/SDS. Parâmetro: redução anual mínima de **12% do CVLI/100 mil hab**.
- Apuração divulgada por portaria da SEPLAG no mês subsequente ao fim do trimestre.

| Cat. | Valor | Critério |
|---|---|---|
| PDS 1 | R$ 1.200 | AIS com maior redução ABSOLUTA ou PERCENTUAL de MVI no Estado |
| PDS 2 | R$ 1.000 | AIS que atingiu meta trimestral OU com taxa ≤ 2,5 MVI/100 mil (trim.) |
| PDS 3 | R$ 700 | Unidades especializadas (corregedoria, inteligência) desde que o Estado reduza MVI |
| PDS 4 | R$ 400 | AIS que reduziu MVI em número absoluto no trimestre |
| PDS 5 | R$ 350 | Demais unidades da SDS desde que o Estado reduza MVI no trimestre |

> ⚠ PDS 1 exige a MAIOR redução — não basta atingir a meta. PDS 5 é o menor valor.

## GPPV — Gratificação Pacto pela Vida (Lei 16.170/2017)
- Premia a produção policial direta (metas intermediárias / eficiência).
- Pagamento condicionado ao alcance das metas do PDS.
- **Natureza jurídica:** premiação meritória — NÃO integra a remuneração.
- **GPPV-Armas:** apreensão de armas de fogo ilegais e explosivos das Forças Armadas. Valor: **R$ 700 a R$ 2.000** por arma (conforme classificação).
- **GPPV-Malhas da Lei:** cumprimento de mandado de prisão e busca e apreensão. Pontuação específica por categoria (SCC = 20 pts; tráfico = 8 pts). Conversão: **R$ 20/ponto/mês**. Dividida entre até 4 policiais.
- **GPPV-Repressão ao Crack:** apreensão de cocaína e derivados. Mínimo: 12 g para contabilizar. 1ª–50ª: R$ 1.000 (mín. 120 g); 51ª–100ª: R$ 500 (mín. 80 g); 101ª–150ª: R$ 250 (mín. 40 g).

> ⚠ GPPV-Malhas NÃO computa: pensão alimentícia, depositário infiel, renovação/conversão de custódia.

---

# Módulo 7 — Stakeholders e Monitoramento

## Principais stakeholders
- SEPLAG | Sec. de Projetos Especiais | Sec. de Administração | Sec. de Defesa Social e operativas
- Sec. de Assistência Social | Sec. de Administração Penitenciária | Sec. de Justiça e Direitos Humanos | Sec. da Mulher
- Sec. de Saúde | Sec. de Educação e Esportes | Sec. de Desenvolvimento Profissional | Sec. de Desenvolvimento Urbano
- MP, Poder Judiciário, Defensoria Pública | Municípios.
- Interagem sobretudo no **Comitê Estratégico** (reunião semanal).

## 4 níveis de reunião
- **Nível 1 — Estratégico:** toda segunda-feira | SEPLAG | Governadora + Vice + demais atores | pautas rotativas (indicadores, infraestrutura/contratos, avaliação geral, políticas públicas).
- **Nível 2 — Tático-Estratégico:** última quinta-feira do mês | SEPLAG | secretários + chefes de operativas.
- **Nível 3 — Tático-Operacional:** 1ª, 2ª e 3ª quartas-feiras | SDS | secretários executivos + chefes adjuntos + diretores + gestores de AIS.
- **Nível 4 — Operacional:** trimestralmente | nas AIS | gestores de AIS + gestores governamentais.

> ⚠ Top-down = desdobramento da estratégia. Bottom-up = monitoramento dos resultados.

## Papel da SEPLAG
- Garantir que indicadores confiáveis balizem a atividade de segurança pública.
- Assegurar o cumprimento de metas e a repercussão positiva sobre a vida da população.

## NGR-SDS — atividades
1. Recebimento e extração de dados (Infopol, planilhas PC/Bombeiros) → consolidados no QlikView e Argos.
2. Otimização da plataforma Argos.
3. Acompanhamento de indicadores de resultado (MVI, CVP) e de processo.
4. Articulação com órgãos governamentais e unidades operativas.
5. Estudos de otimização de recursos (efetivo, divisão territorial).
6. Planejamento, monitoramento e avaliação das ações do JPS.
7. Elaboração de planos de ação para gestores de AIS (PM e PC).

## Outros NGRs criados pelo JPS
- **NGR-PS:** indicadores de prevenção da criminalidade e sistema prisional.
- **NGR-JUS:** indicadores de MP e Judiciário — permite acompanhar o MVI do BO até o julgamento.

---

# Módulo 8 — Análise SWOT do JPS

## Forças (fatores internos positivos)
- Reuniões semanais lideradas diretamente pela Governadora com temas específicos.
- Comitê Estratégico multiatoral — reuniões deliberativas e soluções integradas.
- Valorização da Ressocialização como estratégia de redução da violência.
- Inserção do indicador de Violência Contra a Mulher (VCM) no rol dos indicadores principais.
- Acompanhamento junto ao Sistema de Justiça com reuniões semanais (MP, Judiciário, Defensoria).

## Fraquezas (fatores internos negativos)
- Indicadores de processo precisam de revisão para orientar de forma mais clara e consistente a ação das operativas.
- Dificuldade para adesão dos atores do sistema de justiça.

## Oportunidades e ameaças (fatores externos)
- **Oportunidade:** aprimoramento da articulação com a União, o Terceiro Setor e os municípios.
- **Ameaça 1:** alteração na política pública em razão de mudança de governo.
- **Ameaça 2:** sensibilidade à queda de arrecadação e diminuição de investimentos.

> ⚠ Forças e fraquezas = internos. Oportunidades e ameaças = externos. Não confundir quadrantes.`

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MATERIA } })
  if (!disc) throw new Error(`Disciplina ${MATERIA} não existe.`)

  await prisma.memento.upsert({
    where: { materia_modulo_titulo: { materia: MATERIA, modulo: "", titulo: TITULO } },
    update: { conteudoMd: MD, ordem: 0 },
    create: { materia: MATERIA, modulo: "", titulo: TITULO, conteudoMd: MD, ordem: 0 },
  })
  console.log(`✓ Memento único de ${MATERIA} salvo: "${TITULO}" (${MD.length} caracteres)`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
