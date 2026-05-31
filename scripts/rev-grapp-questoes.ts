import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// id -> nova explicação (justificativa substantiva, fundamentada na APOSTILA - GRAPP.pdf)
const EXPL: Record<string, string> = {
  // ── Módulo 1 ──
  cmptqd44q009t04kzg0ui5lnj: "Correto. Com a expansão da democracia, o Estado deixou de ter como função quase exclusiva a defesa externa e passou a atuar em diversas áreas (educação, saúde, transporte, meio ambiente) para promover o bem-estar — e o faz por meio das políticas públicas.",
  cmptqd4hu009v04kzbij01go6: "Correto. Nas políticas distributivas (Lowi, 1966), os recursos são aplicados a unidades atomizadas/específicas, sem critérios universalistas, gerando pouca oposição social.",
  cmptqd51i009y04kzlqq75f6t: "Correto. Lowi (1966) classifica as políticas públicas em três tipos — distributivas, regulatórias e redistributivas — conforme a relação entre os interesses dos atores e a arena política.",
  cmptqd5em00a004kzi9uhz97r: "Correto. A apostila adota o ciclo de políticas públicas em quatro fases: Formação da Agenda, Formulação, Implementação e Avaliação (não devendo ser visto como processo rígido/linear).",
  cmptqd5l600a104kzc53tp3bs: "Correto. Para Kingdon, a entrada de um tema na agenda torna-se mais provável quando se acoplam os três elementos: problema, propostas (soluções) e receptividade na esfera política.",
  cmptqd64s00a404kzearmgmow: "Correto. A abordagem positivista de avaliação é objetiva e quantitativa, baseada em metas sistemáticas e empíricas — em contraste com a pós-positiva, que vê a avaliação como inerentemente política e qualitativa.",
  cmptqd6bb00a504kz0xji48vg: "Correto. O policy learning (aprendizado político) surge justamente da necessidade de combinar características das abordagens positivista e pós-positiva na avaliação de políticas públicas.",
  cmptqd6of00a704kzxy6znv5r: "Correto. Howlett, Ramesh e Perl (2013) classificam a avaliação de políticas públicas em três categorias: administrativa, judicial e política.",
  // ── Módulo 2 ──
  cmptqd8bc00af04kz44tbm50k: "Correto. A GpR é uma abordagem gerencial centrada na criação de valor — privado (lucro) no setor empresarial ou público (bem-estar social) no Estado.",
  cmptqd8of00ah04kz7kjfw4vb: "Correto. Para Serra (2008), a informação é o 'coração da GpR': são os dados transformados conforme recortes de interesse, permitindo conhecer a realidade e confrontar expectativas.",
  cmptqd91h00aj04kz5b9gqfye: "Correto. Meta é o objetivo quantificado — define o valor esperado de um indicador em um prazo determinado (diferente do objetivo, que é qualitativo/orientativo).",
  cmptqd9em00al04kzqjhiaep5: "Correto. O acompanhamento, conceito auxiliar da GpR, abrange o monitoramento dos indicadores e a avaliação das ações planejadas para atingir os objetivos.",
  cmptqd9ro00an04kzpbvwvdpc: "Correto. A responsabilização é a atribuição de responsabilidades pelos resultados, incluindo tanto a cobrança quanto a premiação dos envolvidos.",
  cmptqda4r00ap04kz7zyjguwu: "Correto. Serra (2008) divide a GpR em três componentes: instrumentos de gestão, informação e função gerencial.",
  cmptqdahu00ar04kzyh6gvsfk: "Correto. A GpR é, ela própria, uma ferramenta de gestão, mas também se vale de outras ferramentas (instrumentos, sistemas e técnicas) para operar.",
  cmptqdauz00at04kzor41od5y: "Correto. A estrutura de acompanhamento da GpR apoia-se em indicadores, na responsabilização dos envolvidos com os resultados e na integração entre as diferentes áreas.",
  // ── Módulo 3 ──
  cmptqdf1e00bf04kz1trap07i: "Correto. A exigência de licitação para compras e contratações é especificidade da Administração Pública que distingue a aplicação da GpR no setor público frente ao privado.",
  cmptqdchu00b104kzh5satv2t: "Correto. Até os anos 1930, a Administração Pública brasileira era marcada pelo patrimonialismo e pelo clientelismo, inclusive em termos institucionais.",
  cmptqdcuy00b304kzsy4m71qt: "Correto. O modelo gerencial, com foco em resultados, ascendeu na 2ª metade do século XX e, no Brasil, é referenciado pelo Plano Diretor da Reforma do Estado (1995).",
  cmptqdd7z00b504kz6rds8vng: "Correto. Ao ser adaptada à Administração Pública, a GpR desloca o foco da criação de valor privado (lucro) para o valor público (bem-estar social).",
  cmptqddl200b704kz9kw6l4jn: "Correto. Diferentemente do setor privado, a Administração Pública submete-se ao princípio da legalidade: só pode fazer o que a lei autoriza — limite que convive com a GpR.",
  cmptqddy500b904kzxk7z7ssn: "Correto. O modelo gerencial caracteriza-se pelo controle a posteriori (de resultados/entregas), conferindo mais autonomia ao gerente, que é cobrado pelas entregas realizadas.",
  cmptqdeb800bb04kz7r5ikw15: "Correto. As estruturas de GpR (responsabilização, bonificação, indicadores e gestão de dados) precisam coexistir com os imperativos burocráticos e a cultura organizacional rígida do setor público.",
  cmptqdeob00bd04kzupyhy9yg: "Correto. A transição para o modelo gerencial integra um movimento global da Ciência Administrativa, fortalecido pelas contribuições de Peter Drucker sobre gestão para resultados.",
  // ── Módulo 4 ──
  cmptqdib500bw04kzpaqy98sd: "Correto. O Decreto 39.336/2013 prevê como requisitos do Pacto: meta mobilizadora (eficácia), metas intermediárias (eficiência), sistemática de monitoramento/avaliação e protocolos que priorizem a meritocracia.",
  cmptqdh1b00bp04kzsxkvylou: "Correto. A Lei Complementar nº 141, de 3 de setembro de 2009, dispõe sobre o Modelo Integrado de Gestão do Poder Executivo de Pernambuco.",
  cmptqdhee00br04kzqyhwurp3: "Correto. Pelo Decreto 39.336/2013, o Valor Público compreende: maior eficiência na aplicação dos recursos públicos, melhoria da qualidade dos serviços à sociedade e geração de bem-estar social.",
  cmptqdhrh00bt04kz0k6kqpyb: "Correto. Os Núcleos de Gestão por Resultados (NGR) instalados nas secretarias pernambucanas são geridos por servidores da SEPLAG.",
  cmptqdhy100bu04kzkg3lk8ft: "Correto. Os Pactos de GpR em Pernambuco envolvem a contratação de metas de resultado, com benefício pecuniário (bonificação) em caso de alcance.",
  cmptqdgo800bn04kztgfmw8da: "Correto. O Pacto Pela Vida (2007) foi a primeira experiência de GpR de escopo considerável em PE gerida pela própria Administração Pública.",
  cmptqdiob00by04kztybnc5gz: "Correto. Conforme o Decreto 39.336/2013, cabe ao NGR monitorar as metas de investimento da Secretaria Executora constantes no Plano Plurianual (PPA).",
  cmptqdj1e00c004kz9p6xt47z: "Correto. A meta mobilizadora associa-se à eficácia (resultado final), enquanto as metas intermediárias associam-se à eficiência (produção/processo).",
  // ── Módulo 5 ──
  cmptqdmuy00ck04kzqek0spn7: "Correto. A Lei nº 16.170/2017 institui a GPPV, que premia a produção policial direta: apreensão de armas (GPPV-Armas), cumprimento de mandados (Malhas da Lei) e repressão ao crack.",
  cmptqdnem00cn04kzwan5xado: "Correto. A regionalização por Áreas Integradas de Segurança (AIS) integra polícia militar e polícia civil no mesmo território, fortalecendo o planejamento e a estrutura de responsabilização.",
  cmptqdlej00cc04kzz3n145eb: "Correto. O Plano Estadual 2023-2030 foi construído com workshops, oficinas e mecanismos de escuta popular, e lançado em 27 de novembro de 2023.",
  cmptqdkuv00c904kzh73jz1zk: "Correto. O Pacto Pela Vida vigorou de 2007 a 2022, tendo como espinha dorsal a redução dos homicídios dolosos.",
  cmptqdl1g00ca04kzz3yinkmz: "Correto. O PESP, que originou o PPV, foi consolidado em documento de 8 de maio de 2007, com diagnóstico da criminalidade, características e linhas de ação.",
  cmptqdll300cd04kz79chctvi: "Correto. Entre 2000 e 2012, as mortes violentas cresceram no Nordeste apesar do aumento da renda per capita, pois as mudanças socioeconômicas não foram acompanhadas por estruturas de segurança adequadas.",
  cmptqdly600cf04kz7epf67uv: "Correto. O Plano JPS 2023-2030 estrutura-se em 5 pilares, 6 eixos estratégicos e diretrizes, com iniciativas alinhadas ao Plano Nacional de Segurança Pública e ao PPA 2024-2027.",
  cmptqdmbb00ch04kzm3345wz4: "Correto. PE foi dividido em 26 AIS; via de regra, cada AIS reúne um Batalhão de PM e uma Delegacia Seccional (somando 51 OMEs e 26 Delegacias Seccionais).",
  cmptqdmhu00ci04kz22a111d2: "Correto. As 26 AIS agrupam-se em quatro diretorias operacionais: DIM, DINTER 1, DINTER 2 e a DIRESP (especializada, sem base territorial).",
  cmptqdn1i00cl04kzjki0yp76: "Correto. A Lei nº 16.171/2017 institui o Prêmio de Defesa Social (PDS), premiando por resultados conforme o nível de alcance da meta e a lotação do servidor.",
  // ── Módulo 6 ──
  cmptqdp1r00cv04kzzseyh8w9: "Correto. O acompanhamento do JPS combina a análise frequente de indicadores de processo e de resultado com a apresentação desses dados em reuniões estratégicas, táticas e operacionais.",
  cmptqdpew00cx04kzxifw8o6r: "Correto. O MVI (principal indicador de resultado) soma homicídios dolosos, lesões corporais seguidas de morte, latrocínios e os excludentes de ilicitude.",
  cmptqdprz00cz04kzev82fd9a: "Correto. Os Roubos e Furtos de Veículos (RFV) são monitorados separadamente, dado o volume de ocorrências, a importância do bem e a existência de grupos criminosos especializados.",
  cmptqdq5000d104kzf5tzmve1: "Correto. 'Efetividade do Sistema Prisional' mede as vagas construídas no sistema prisional; 'Efetividade da Ressocialização' mede a quantidade/percentual de presos em atividade laboral ou educacional.",
  cmptqdqi400d304kz3l3dpqjn: "Correto. Os indicadores de processo (protocolos) são categorizados conforme a ação caiba à PMPE, à PCPE ou a ambas as operativas.",
  cmptqdqv900d504kzlosuqkxb: "Correto. As Taxas de Conclusão de Inquéritos (MVI, tentativa de MVI, feminicídio e tentativa de feminicídio) são indicadores de processo da Polícia Civil (PCPE), responsável pela investigação.",
  cmptqdr1t00d604kz1tlc8xdf: "Correto. O método Diferença em Diferença compara a localidade consigo mesma (antes e depois da ação) e também com outra localidade semelhante (antes e depois).",
  cmptqdr8c00d704kzgr4o4w93: "Correto. A apuração do atingimento das metas cabe ao NGR-SDS e é divulgada por portaria da SEPLAG no mês subsequente ao fim do trimestre (art. 9º da Lei 16.171/2017).",
  cmptqdrlc00d904kzdyda11sm: "Correto. O indicador 'Apreensão de Armas de Fogo' tem frequência diária, pois a informação é extraída dos Boletins de Ocorrência confeccionados pela Polícia Civil.",
  // ── Módulo 7 ──
  cmptqdvle00du04kzt5xrhfz7: "Correto. Entre as atividades do NGR-SDS está a elaboração e o assessoramento de planos de ação para gestores de Unidades Operativas (PM e PC), a partir de análises de MVI, CVP e protocolos operacionais.",
  cmptqdv8a00ds04kzxwuiu7jg: "Correto. Os Municípios figuram entre os stakeholders do JPS e participam das reuniões do Comitê Estratégico.",
  cmptqdt8a00dh04kzaw3ptyg1: "Correto. O JPS reúne partes interessadas dos três poderes, que atuam sobretudo na reunião semanal do Comitê Estratégico.",
  cmptqdtld00dj04kzf04lzmtt: "Correto. As reuniões de Nível 2 são de nível tático-estratégico, com a participação de secretários e chefes de operativas.",
  cmptqdtrx00dk04kz5jx7x6nw: "Correto. As reuniões de Nível 3 (tático-operacional) ocorrem na 1ª, 2ª e 3ª quartas-feiras do mês, com secretários executivos, chefes adjuntos, diretores e gestores de AIS.",
  cmptqdu5000dm04kz98t36fh9: "Correto. O NGR-SDS é composto por Gestores Governamentais, integra a SEPLAG e funciona como elo estratégico entre a SEPLAG e a Secretaria de Defesa Social.",
  cmptqdubk00dn04kzpfnndt7k: "Correto. Cabe à SEPLAG assegurar que indicadores confiáveis balizem a segurança pública e o cumprimento das metas, com repercussão positiva sobre a vida da população.",
  cmptqdui300do04kzun5smxhh: "Correto. O NGR-SDS utiliza o QlikView e o Argos para consolidar e disponibilizar os dados de segurança pública aos atores envolvidos.",
  cmptqduon00dp04kz8tz71aw2: "Correto. O JPS criou o NGR-PS (prevenção da criminalidade/sistema prisional) e o NGR-JUS (indicadores do MP e do Judiciário, acompanhando o MVI do BO ao julgamento).",
  cmptqdv1q00dr04kzvhim03xu: "Correto. O Infopol é o repositório dos Boletins de Ocorrência da Polícia Civil e uma das fontes de dados utilizadas pelo NGR-SDS.",
  // ── Módulo 8 (SWOT) ──
  cmptqdz8800ed04kzub259lca: "Correto. O acompanhamento junto ao Sistema de Justiça (reuniões semanais com Judiciário, MP e Defensoria sobre o MVI) é apontado como força do JPS na análise SWOT.",
  cmptqdzyg00eh04kzubozf4qw: "Correto. A SWOT é ferramenta de gestão estratégica que mapeia forças e fraquezas (fatores internos) e oportunidades e ameaças (fatores externos) da política.",
  cmptqdzlc00ef04kzckrrobko: "Correto. Na SWOT, as ameaças são fatores externos, que fogem ao controle direto da gestão da política de segurança.",
  cmptqdxet00e304kz2thwmfjq: "Correto. As reuniões semanais lideradas diretamente pela Governadora, com pautas específicas, são apontadas como força do JPS.",
  cmptqdxrv00e504kzyc8vq41e: "Correto. A valorização da Ressocialização como estratégia de redução da violência é listada como força do JPS.",
  cmptqdxyf00e604kzih9pmalc: "Correto. A necessidade de revisar os indicadores de processo, para que orientem melhor a ação das operativas, é classificada como fraqueza (fator interno).",
  cmptqdybi00e804kz92jkc972: "Correto. A possibilidade de alteração da política pública em razão de mudança de governo é identificada como ameaça (fator externo) ao JPS.",
  cmptqdyok00ea04kz8pbxfevc: "Correto. A dificuldade para adesão dos atores do sistema de justiça é apontada como fraqueza (fator interno) do JPS.",
  cmptqdz1p00ec04kzwwylnj1x: "Correto. A inserção do indicador de Violência Contra a Mulher (VCM) no rol dos principais indicadores monitorados é apontada como força do JPS.",
}

async function main() {
  let ok = 0, miss = 0
  for (const [id, explicacao] of Object.entries(EXPL)) {
    const r = await prisma.questao.updateMany({ where: { id, materia: "GRAPP" }, data: { explicacao } })
    if (r.count) ok++; else { miss++; console.log("não encontrada:", id) }
  }
  console.log(`\nGRAPP: ${ok} justificativas atualizadas, ${miss} não encontradas.`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
