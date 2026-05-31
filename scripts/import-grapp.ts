import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

const MATERIA = "GRAPP"

type Card = { modulo: string; frente: string; verso: string }

const CARDS: Card[] = [
  // ───────────── MÓDULO 1 — Políticas Públicas ─────────────
  { modulo: "1", frente: "Políticas Públicas — Conceito", verso:
`• Howlett, Ramesh e Perl (2013): "tudo o que um governo decide fazer ou deixar de fazer".
• Jenkins (1978): conjunto de decisões inter-relacionadas tomadas por ator/grupo de atores políticos, referentes à seleção de objetivos e meios para alcançá-los.
• Definição geral: conjunto de decisões, planos, metas e ações governamentais voltados à resolução de problemas de interesse público.` },

  { modulo: "1", frente: "Políticas Públicas — Classificação (Lowi, 1966)", verso:
`• DISTRIBUTIVAS: fácil desagregação; recursos a unidades atomizadas sem critérios universalistas; associadas a clientelismo; pouca oposição social. Ex.: doação de cadeiras de rodas.
• REDISTRIBUTIVAS: padrão soma-zero (um ganha, outro perde); redistribuem renda das camadas altas para beneficiários de baixa renda. Ex.: tributos, previdência.
• REGULATÓRIAS: prescrevem comportamentos com penalidades; ordens, proibições, decretos e portarias; incidem de forma diferente em cada segmento social.
⚠ As redistributivas exigem balanceamento complexo de interesses conflitantes.` },

  { modulo: "1", frente: "Atores Políticos (Políticas Públicas)", verso:
`• Estatais/públicos: provenientes do Governo; exercem funções públicas e controlam recursos — políticos e servidores públicos.
• Privados: provenientes da sociedade civil — sindicatos, empresários, grupos de pressão, centros de pesquisa, mídia.` },

  { modulo: "1", frente: "Ciclo de Políticas Públicas (4 fases)", verso:
`1. Formação de agenda: priorização dos problemas. Kingdon: probabilidade aumenta quando problema + propostas + receptividade política se alinham.
2. Formulação: criação de opções. Métodos: Racional (Simon), Incremental (Lindblom), Sondagem Mista (Etzioni).
3. Implementação: traduz decisões em ações. Top-down (centralizado, governo→sociedade) e bottom-up (descentralizado, sociedade→governo).
4. Avaliação: impacto, eficiência, eficácia, sustentabilidade. Positivista (quantitativa) e pós-positiva (qualitativa). Tipos: administrativa, judicial, política.
⚠ A avaliação deve ser feita em TODO o processo, não só ao final.` },

  // ───────────── MÓDULO 2 — Gestão por Resultados ─────────────
  { modulo: "2", frente: "GpR — Conceito Central", verso:
`• Abordagem gerencial focada na criação de valor — privado (lucro) ou público (bem-estar social).
• Coloca objetivos, metas e resultados como principais referências da organização.
• Não se esgota com execução do orçamento/cumprimento de normas; deve direcionar processos ao alcance dos objetivos.` },

  { modulo: "2", frente: "GpR — Conceitos Auxiliares", verso:
`• Objetivos: alvos a atingir em determinado período.
• Metas: objetivos quantificados (valor esperado de um indicador em dado tempo).
• Resultados: dimensão da eficácia, medida por indicadores.
• Acompanhamento: monitoramento dos indicadores + avaliação das ações.
• Indicadores: medida que informa sobre um fenômeno social.
• Responsabilização: atribuição de responsabilidades (cobrança e premiação).
⚠ Objetivo é qualitativo/orientativo; meta é quantificada com valor e tempo.` },

  { modulo: "2", frente: "GpR — Ferramentas (Serra, 2008)", verso:
`• (a) Instrumentos de gestão: técnicas e tecnologias para realizar a GpR.
• (b) Informação: "coração da GpR" — dados transformados por recortes de interesse; permite conhecer a realidade e confrontar expectativas.
• (c) Função gerencial: pessoas que organizam informações, responsabilização, recompensa e gestão do conhecimento.` },

  // ───────────── MÓDULO 3 — GpR na Adm. Pública ─────────────
  { modulo: "3", frente: "GpR Pública — Histórico", verso:
`• Até 1930: patrimonialismo e clientelismo.
• Anos 1930: racionalização com foco em burocracia e controle de processos (Taylorismo/Fordismo).
• 2ª metade séc. XX: modelo gerencial com foco em resultados; influência de Peter Drucker (Plano Diretor da Reforma do Estado, 1995).` },

  { modulo: "3", frente: "GpR Pública — Características", verso:
`• Desloca o valor privado (lucro) para valor público (bem-estar social).
• Mantém a legalidade (fazer apenas o previsto em lei).
• Exige prestação de contas sobre recursos públicos.
• Necessita licitação para compras e contratações.
• Beneficiários tratados como cidadãos, não clientes.
• Convive com imperativos burocráticos e cultura organizacional rígida.
⚠ A GpR pública NÃO elimina a burocracia — coexiste com os controles legais.` },

  { modulo: "3", frente: "Valor Público (Moore/Serra)", verso:
`• Politicamente desejável (legitimação democrática);
• De propriedade coletiva;
• Requer geração de mudanças sociais que modifiquem aspectos da sociedade.` },

  // ───────────── MÓDULO 4 — GpR em PE / NGR ─────────────
  { modulo: "4", frente: "GpR em PE — Histórico e Estrutura", verso:
`• 2007: início do Pacto Pela Vida (PPV) — 1ª experiência de GpR de escopo considerável gerida pela Adm. Pública.
• 2009: LC 141 — Modelo Integrado de Gestão do Poder Executivo de PE.
• 2013: Decreto 39.336 — Valor Público como objetivo dos Programas de Estado.
• Abrangência inicial: Educação, Saúde e Defesa Social.
• NGR: geridos por servidores da SEPLAG dentro das secretarias.` },

  { modulo: "4", frente: "LC 141/2009 — Deveres da SEPLAG", verso:
`• Estruturar planejamento, desenvolvimento e acompanhamento de ações.
• Coordenar a gestão estratégica do Governo e sistematizar os projetos estratégicos.
• Conciliar planejamento anual com monitoramento mensal e avaliação quadrimestral dos resultados.
• Definir parâmetros, conteúdos e cláusulas dos Pactos de Resultados.` },

  { modulo: "4", frente: "Decreto 39.336/2013", verso:
`• Valor Público: I – eficiência dos recursos; II – qualidade dos serviços; III – geração de bem-estar social.
• Indicador principal: Taxa de CVLI (Crimes Violentos Letais Intencionais).
• Requisitos do Pacto: meta mobilizadora (EFICÁCIA) + metas intermediárias (EFICIÊNCIA) + sistemática de monitoramento + protocolos meritocráticos.
⚠ A SEPLAG define os parâmetros dos Pactos; a implantação é das Secretarias Executoras.` },

  { modulo: "4", frente: "NGR — Papéis (Gerencial × Operacional × Técnico)", verso:
`• NGR/SEPLAG: função gerencial — produz dados, diagnósticos e análises; apoia o planejamento e monitora. NÃO implementa políticas.
• Gerências das Secretarias: gerenciam a criação de valor em si — coordenam ações que geram resultados.
• Técnicos: criam o valor público — policiais, delegados, bombeiros que executam as ações.
⚠ Não confundir: função gerencial ≠ gerência operacional ≠ execução técnica.` },

  { modulo: "4", frente: "NGR — Atribuições (Decreto 39.336/2013)", verso:
`• Desenvolver, com a Secretaria Executora, o modelo de monitoramento e avaliação dos resultados.
• Apoiar a Secretaria Executora no planejamento, monitoramento e avaliação das ações.
• Produzir dados, diagnósticos e análises sobre os resultados.
• Monitorar as metas de investimento do Plano Plurianual.` },

  // ───────────── MÓDULO 5 — JPS ─────────────
  { modulo: "5", frente: "JPS — Histórico", verso:
`• PPV (Pacto Pela Vida): política de segurança de PE (2007–2022); espinha dorsal = redução dos homicídios dolosos.
• PESP consolidado em 08/05/2007 (diagnóstico, linhas de ação, meta estruturante).
• 2000–2012: NE com aumento de renda per capita acima da média nacional, mas com alta das mortes violentas.
• JPS: política transversal atual — promover a paz, prevenir a violência e combater a desigualdade em todas as regiões.
• Plano Estadual 2023–2030: formulado em 2023 (workshops, oficinas, escuta popular); lançado em 27/11/2023.` },

  { modulo: "5", frente: "JPS — 5 Pilares (Plano 2023–2030)", verso:
`• (a) Prevenção da Violência e Redução da Desigualdade: violência doméstica e dependência química → cultura de paz.
• (b) Atuação Conjunta com Municípios e Instituições: recupera espaços públicos e oferta serviços em áreas dominadas pelo crime.
• (c) Enfrentamento ao Crime Organizado e Tráfico: poder público + sociedade civil; valoriza profissionais de segurança.
• (d) Articulação com o Sistema de Justiça: reduz impunidade, acelera processos, garante acesso à justiça.
• (e) Ampliação/Requalificação dos Sistemas Prisional e Socioeducativo: reintegração reduz reincidência.` },

  { modulo: "5", frente: "JPS — 6 Eixos Estratégicos", verso:
`• a) Prevenção à Violência (infância, juventude, drogas, grupos vulneráveis, VCM)
• b) Cidades Seguras e Articulação com Municípios (espaços públicos, iluminação, participação)
• c) Polícia e Defesa Social (crime organizado, valorização profissional, modernização)
• d) Articulação com o Sistema de Justiça (impunidade, celeridade, mediação)
• e) Administração dos Sistemas Prisional e Socioeducativo
• f) Ressocialização (reintegração de presos e adolescentes em medidas socioeducativas)` },

  { modulo: "5", frente: "JPS — 5 Diretrizes do Plano", verso:
`• Territorialidade: adaptar ações a cada território; identificar os prioritários.
• Transversalidade: segurança pública em várias áreas (educação, saúde, emprego...).
• Participação: envolvimento dos servidores da SDS e de diversas secretarias e atores.
• Integração/Liderança: colaboração entre atores; liderança estratégica e operacional.
• Resultados: busca por resultados efetivos e mensuráveis.` },

  { modulo: "5", frente: "JPS — AIS (Áreas Integradas de Segurança)", verso:
`• PE dividido em 26 AIS que integram PM e PC no mesmo território.
• Cada AIS: 1 BPM (ou CIPM) + 1 Delegacia Seccional.
• Na RMR e em algumas cidades, o Delegado de Homicídios também responde pela AIS.
• Total: 51 Organizações Militares Estaduais + 26 Delegacias Seccionais.` },

  { modulo: "5", frente: "JPS — 4 Diretorias Operacionais", verso:
`• DIM (Metropolitana): 10 AIS | 14 mun. | 2.767 km² | ~3,96 mi hab.
• DINTER 1 (Mata/Agreste): 8 AIS | 109 mun. | 28.449 km² | ~3,6 mi hab.
• DINTER 2 (Sertão): 8 AIS | 61 mun. | 63.299 km² | ~1,98 mi hab.
• DIRESP (Especializadas): sem área; atua por matéria (narcotráfico, trânsito, meio ambiente, turismo).
⚠ A DIRESP não tem área territorial — atuação temática, não geográfica.` },

  { modulo: "5", frente: "JPS — Normas Legais", verso:
`• Plano Estadual de Seg. Pública e Defesa Social 2023–2030: documento principal (escuta popular, oficinas, seminários); lançado em 27/11/2023.
• Lei nº 16.170, de 25/10/2017: GPPV (Gratificação Pacto pela Vida) — premia metas intermediárias/eficiência (armas, mandados, crack).
• Lei nº 16.171, de 26/10/2017: PDS (Prêmio de Defesa Social) — premia por resultados, conforme alcance da meta e lotação.
• LC 141/2009 (art. 20, §3º): cabe à SEPLAG definir parâmetros/cláusulas dos Pactos de Resultados.
• O JPS propôs alterações ao PPV; até a publicação, as leis citadas seguem vigentes.
⚠ A GPPV é premiação meritória — NÃO integra a remuneração; condicionada às metas do PDS.` },

  // ───────────── MÓDULO 6 — Indicadores e Bonificação ─────────────
  { modulo: "6", frente: "JPS — Tipos de Indicadores", verso:
`• Indicadores de Resultado: orientam ONDE o Estado pretende chegar.
• Indicadores de Processo: orientam as atividades operacionais (também chamados Protocolos).` },

  { modulo: "6", frente: "JPS — Indicadores de Resultado", verso:
`• MVI (Morte Violenta Intencional, principal): homicídios dolosos + lesão seguida de morte + latrocínios + excludentes de ilicitude. Contagem e taxa/100mil.
• CVP (Crime Violento Patrimonial): roubo e variações (exceto latrocínio) + extorsão + sequestro. RFV monitorados à parte.
• VCM (Violência Contra a Mulher): feminicídio, tentativa, estupro, lesão corporal e ameaça com vítimas mulheres.
• Efetividade do Sistema Prisional: vagas construídas.
• Efetividade da Ressocialização: % de presos em atividade laboral/educacional.
⚠ Latrocínio = MVI (não CVP) — envolve morte.` },

  { modulo: "6", frente: "JPS — Indicadores de Processo (Protocolos)", verso:
`• Ocupação Territorial (PMPE): lançamento de efetivo; abordagens (celular, mandados, veículos).
• Procedimento Investigativo (PCPE): Taxa de Conclusão de Inquéritos (MVI, Tent. MVI, Feminicídio, Tent.).
• Prisões e Apreensões (PMPE/PCPE): mandados, flagrantes (geral, selecionados, MVI), armas de fogo.
• Apreensão de Armas de Fogo: frequência diária (BOs da Polícia Civil).` },

  { modulo: "6", frente: "JPS — Sistemática de Análise", verso:
`• Cores gerenciais: verde = alcance total | amarelo = parcial | vermelho = descumprimento.
• Estratificação/classificação/tipificação: localização, horários, tipologia, arma, motivação, perfil das vítimas.
• Diferença em Diferença: compara a localidade (AIS/município/bairro) com ela mesma (antes/depois) e com outra semelhante.
⚠ Verde = bom resultado; vermelho = mau resultado (lógica inversa ao semáforo de alerta).` },

  { modulo: "6", frente: "Técnicas de Gestão do NGR", verso:
`• Gestão Estratégica: construção, execução e comunicação da estratégia.
• Gestão de Processos: identificação, mapeamento e melhoria de rotinas.
• Gestão de Dados: processamento, documentação e transformação de dados em informação.
• Gestão de Projetos: atividades não rotineiras com objetivo, tempo e escopo definidos.` },

  { modulo: "6", frente: "PDS — Prêmio de Defesa Social (Lei 16.171/2017)", verso:
`• Premiação por resultados — PC, PM e BM lotados na SDS/órgãos operativos e Casa Militar.
• Base: desempenho na redução de MVI.
• Meta trimestral por portaria conjunta SEPLAG/SDS (art. 8º). Parâmetro: redução anual mínima de 12% do CVLI/100mil hab.
• Apuração (art. 9º): portaria da SEPLAG no mês subsequente ao fim do trimestre.
• Quem apura o atingimento das metas é o NGR-SDS.` },

  { modulo: "6", frente: "PDS — 5 Categorias (Valores)", verso:
`• PDS 1 — R$ 1.200: AIS com maior redução ABSOLUTA ou PERCENTUAL de MVI do Estado.
• PDS 2 — R$ 1.000: AIS que atingiu a meta trim. OU taxa ≤ 2,5 MVI/100mil.
• PDS 3 — R$ 700: unidades especializadas (corregedoria, inteligência) se o Estado reduzir MVI.
• PDS 4 — R$ 400: AIS que reduziu MVI em número absoluto no trimestre.
• PDS 5 — R$ 350: demais unidades da SDS se o Estado reduzir MVI no trimestre.
⚠ PDS 1 exige a MAIOR redução (não basta atingir a meta); PDS 5 é o menor valor.` },

  { modulo: "6", frente: "GPPV — Gratificação Pacto pela Vida (Lei 16.170/2017)", verso:
`• Lei nº 16.170, de 25/10/2017. Premia a produção policial direta (metas intermediárias / eficiência) de Policiais Civis e Militares.
• Pagamento condicionado ao alcance das metas do PDS.
• Natureza jurídica: premiação meritória — NÃO integra, para qualquer efeito, a remuneração do servidor.` },

  { modulo: "6", frente: "GPPV — 3 Tipos", verso:
`• GPPV-Armas: armas de fogo ilegais e explosivos das Forças Armadas. R$ 700 a R$ 2.000/arma (conforme classificação).
• GPPV-Malhas da Lei: mandado de prisão e busca/apreensão. Pontos (SCC = 20; tráfico = 8). R$ 20/ponto/mês, dividido entre até 4 policiais.
• GPPV-Repressão ao Crack: cocaína/derivados. Mín. 12g. 1ª–50ª: R$ 1.000 (mín. 120g); 51ª–100ª: R$ 500 (mín. 80g); 101ª–150ª: R$ 250 (mín. 40g).
⚠ GPPV-Malhas não computa: pensão alimentícia, depositário infiel, renovação/conversão de custódia.` },

  // ───────────── MÓDULO 7 — Stakeholders / NGR-SDS ─────────────
  { modulo: "7", frente: "JPS — Principais Stakeholders", verso:
`• SEPLAG, Sec. de Projetos Especiais, Administração, Defesa Social e operativas.
• Assistência Social, Adm. Penitenciária, Justiça e Direitos Humanos, Mulher.
• Saúde, Educação e Esportes, Desenvolvimento Profissional, Desenvolvimento Urbano.
• MP, Poder Judiciário, Defensoria Pública; Municípios.
• Interagem sobretudo no Comitê Estratégico (reunião semanal).` },

  { modulo: "7", frente: "JPS — 4 Níveis de Reunião", verso:
`• Nível 1 (Estratégico): toda segunda | SEPLAG | Governadora + Vice + atores; pautas rotativas.
• Nível 2 (Tático-Estratégico): última quinta do mês | SEPLAG | secretários + chefes de operativas.
• Nível 3 (Tático-Operacional): 1ª, 2ª e 3ª quartas | SDS | secretários executivos + adjuntos + diretores + gestores de AIS.
• Nível 4 (Operacional): trimestral | nas AIS | gestores de AIS + gestores governamentais.
⚠ Top-down = desdobramento da estratégia; bottom-up = monitoramento dos resultados.` },

  { modulo: "7", frente: "SEPLAG — Papel no JPS", verso:
`• Garantir que indicadores confiáveis balizem a atividade de segurança pública.
• Assegurar o cumprimento de metas e a repercussão positiva sobre a vida da população.` },

  { modulo: "7", frente: "NGR-SDS — Atividades", verso:
`1. Recebimento e extração de dados (Infopol, planilhas PC/Bombeiros) → QlikView e Argos.
2. Otimização da plataforma Argos.
3. Acompanhamento de indicadores de resultado (MVI, CVP) e de processo.
4. Articulação com órgãos governamentais e unidades operativas.
5. Estudos de otimização de recursos (efetivo, divisão territorial).
6. Planejamento, monitoramento e avaliação das ações do JPS.
7. Elaboração de planos de ação para gestores de AIS (PM e PC).` },

  { modulo: "7", frente: "Outros NGRs criados pelo JPS", verso:
`• NGR-PS: indicadores de prevenção da criminalidade e sistema prisional.
• NGR-JUS: indicadores de MP e Judiciário — permite acompanhar o MVI do BO até o julgamento.` },

  // ───────────── MÓDULO 8 — SWOT ─────────────
  { modulo: "8", frente: "SWOT do JPS — Forças (internas +)", verso:
`• Reuniões semanais lideradas diretamente pela Governadora, com temas específicos.
• Comitê Estratégico multiatoral — deliberativo e com soluções integradas.
• Valorização da Ressocialização como estratégia de redução da violência.
• Inserção do indicador VCM no rol dos principais.
• Acompanhamento semanal junto ao Sistema de Justiça (MP, Judiciário, Defensoria).` },

  { modulo: "8", frente: "SWOT do JPS — Fraquezas (internas −)", verso:
`• Indicadores de processo precisam de revisão para orientar melhor a ação das operativas.
• Dificuldade para adesão dos atores do sistema de justiça.` },

  { modulo: "8", frente: "SWOT do JPS — Oportunidades e Ameaças (externas)", verso:
`• Oportunidade: aprimorar a articulação com a União, o Terceiro Setor e os municípios.
• Ameaça 1: alteração da política pública por mudança de governo.
• Ameaça 2: sensibilidade à queda de arrecadação e diminuição de investimentos.
⚠ Forças e fraquezas = internas; oportunidades e ameaças = externas. Não confundir quadrantes.` },
]

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MATERIA } })
  if (!disc) throw new Error(`Disciplina ${MATERIA} não existe.`)

  // Limpa apenas os flashcards (NÃO os mementos — o memento de GRAPP é legítimo).
  const del = await prisma.flashcard.deleteMany({ where: { materia: MATERIA } })
  console.log(`Flashcards GRAPP antigos removidos: ${del.count}`)

  let n = 0
  for (const c of CARDS) {
    const hash = createHash("sha1").update(`${MATERIA}|${c.modulo}|${c.frente}`).digest("hex")
    await prisma.flashcard.upsert({
      where: { hash },
      update: { verso: c.verso, ordem: n },
      create: { materia: MATERIA, modulo: c.modulo, frente: c.frente, verso: c.verso, ordem: n, hash },
    })
    n++
    console.log(`✓ [MÓD ${c.modulo}] ${c.frente}`)
  }
  console.log(`\n${n} flashcards de ${MATERIA} importados/atualizados.`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
