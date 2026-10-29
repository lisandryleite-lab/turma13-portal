// Estrutura da PMPE — comando, Estado-Maior Geral, diretorias, unidades especializadas,
// escalões e cargos. Fonte principal: Memento de Planejamento Operacional Especializado
// (POE, CFO PM 2026 — scripts/mementos-html/modelo-2026/POE.html), que resume a apostila
// e a Lei nº 15.186/2013; GTA e sedes no interior: mapa das AIS da SDS (lib/ais-pernambuco.ts).

import type { IdAIS } from "./ais-pernambuco"

export const FONTE_ESTRUTURA = "Memento de Planejamento Operacional Especializado (CFO PM 2026), Lei nº 15.186/2013 e mapa das AIS da SDS"

// ── Comando e Estado-Maior Geral ──
export const ORGAOS = [
  { nome: "Órgãos de direção", desc: "O Comando Geral: comandante geral, órgãos de direção geral (Estado-Maior), de direção setorial (diretorias), de apoio ao Comando Geral e de assessoramento." },
  { nome: "Órgãos de apoio", desc: "Atividades-meio que sustentam a tropa — por exemplo, DGA, DEIP e Diretoria de Finanças." },
  { nome: "Órgãos de execução", desc: "As unidades que fazem o policiamento: batalhões de área, companhias independentes e unidades especializadas." },
]

export const CADEIA_COMANDO = [
  { cargo: "Comandante Geral", desc: "Comanda a Corporação; preside a Comissão de Promoção de Oficiais. Assessorado pelo Estado-Maior Geral." },
  { cargo: "Subcomandante Geral", desc: "Substitui o Comandante Geral; a ele se subordina diretamente a DPO, que coordena todo o policiamento." },
  { cargo: "Chefe do Estado-Maior Geral", desc: "Dirige o EMG, principal órgão de assessoramento do Comandante Geral na política da Corporação." },
]

export const EMG_ATRIBUICOES = [
  "Produzir informações",
  "Realizar ações",
  "Apresentar propostas e sugestões",
  "Elaborar planos e ordens para aprovação do Comandante Geral",
  "Supervisionar, no âmbito de sua competência, a execução dos planos e ordens",
]

export const SECOES_EMG = [
  { secao: "1ª Seção (PM/1)", encargo: "Pessoal e legislação" },
  { secao: "2ª Seção (PM/2)", encargo: "Informação e contrainformação (inteligência)" },
  { secao: "3ª Seção (PM/3)", encargo: "Ensino, instrução e operações; cerimonial militar e concursos. Os cursos e estágios hoje ficam com a DEIP." },
  { secao: "4ª Seção (PM/4)", encargo: "Apoio logístico" },
  { secao: "5ª Seção (PM/5)", encargo: "Assuntos civis e comunicação social (ASCOM): imagem da instituição e divulgação das ações" },
  { secao: "6ª Seção (PM/6)", encargo: "Planejamento administrativo e orçamentário" },
  { secao: "7ª Seção (PM/7)", encargo: "Projetos estratégicos e captação de recursos extraorçamentários. Criada pela Lei nº 15.186/2013 no lugar do antigo NAMPP." },
]

// ── Diretorias operacionais ──
export type Diretoria = { sigla: string; nome: string; sede?: string; desc: string; itens?: string[] }
export const DPO: Diretoria = {
  sigla: "DPO", nome: "Diretoria de Planejamento Operacional",
  desc: "Diretamente subordinada ao Subcomando Geral. Coordena DIM, DIRESP, DINTER I, DINTER II e DASDH para garantir a ordem pública: distribui efetivo, diárias e cotas de PJES, ativa o CICCR e dá as diretrizes das grandes operações.",
  itens: [
    "CPO — Coordenação de Planejamento Operacional: diretrizes, ordens de serviço e monitoramento de viaturas",
    "CAA — Coordenação de Apoio Administrativo: efetivo, hipotecas para eventos, diárias e PJES",
    "CAE — Coordenação de Assuntos Especiais: assessoria jurídica e apoio a mandados (reintegrações de posse)",
    "CAD — Coordenação de Análise de Dados: estatística operacional",
  ],
}
export const DIRETORIAS_OPERACIONAIS: Diretoria[] = [
  { sigla: "DIM", nome: "Diretoria Integrada Metropolitana", sede: "Comando Geral (Derby, Recife)", desc: "Batalhões de área da Região Metropolitana: AIS 1 a 10." },
  { sigla: "DINTER I", nome: "Diretoria Integrada do Interior I", sede: "Caruaru", desc: "Agreste e Zona da Mata: 109 municípios nas AIS 11 a 18." },
  { sigla: "DINTER II", nome: "Diretoria Integrada do Interior II", sede: "Petrolina (subdiretoria em Serra Talhada)", desc: "Sertão: AIS 19 a 26. Surgiu do antigo CPS-II (Lei nº 13.458/2008)." },
  { sigla: "DIRESP", nome: "Diretoria Integrada Especializada", sede: "Comando Geral (Derby, Recife)", desc: "Coordena as unidades especializadas, que atuam sem área fixa e reforçam os batalhões de área." },
  {
    sigla: "DASDH", nome: "Diretoria de Articulação Social e Direitos Humanos", desc: "Programas de aproximação com a comunidade.",
    itens: ["Policiamento Comunitário", "Patrulha do Bairro", "Patrulha Escolar", "PROERD (resistência às drogas, em PE desde 2000)", "ASCRIAD (ECA)", "GT Racismo", "Patrulha Maria da Penha", "Banda de Música (1873)"],
  },
]

// ── Unidades especializadas ──
export type Especializada = {
  sigla: string; nome: string; denominacao?: string
  tipo: "Intervenção e operações especiais" | "Recobrimento e apoio" | "Trânsito" | "Guarda e turismo" | "Ambiental" | "Aérea"
  missao: string; origem?: string
  sede: string; ais: IdAIS; subordinacao: "DIRESP" | "SDS"
}
export const ESPECIALIZADAS: Especializada[] = [
  { sigla: "BOPE", nome: "Batalhão de Operações Policiais Especiais", tipo: "Intervenção e operações especiais", sede: "Recife", ais: "1-5", subordinacao: "DIRESP",
    missao: "Último recurso estratégico da Corporação, com doutrina de forças especiais: gerenciamento de crises (negociação, técnicas menos que letais, tiro de comprometimento e assalto tático) e ocorrências com bombas e explosivos. Ingresso pelo COPE; lema: Vitae Defensor.",
    origem: "CPEsp → 1ª CIOE (Decreto nº 14.147/1989) → BOPE (Lei nº 16.058/2017)" },
  { sigla: "BPChoque", nome: "Batalhão de Polícia de Choque", denominacao: "Matias de Albuquerque", tipo: "Intervenção e operações especiais", sede: "Recife", ais: "1-5", subordinacao: "DIRESP",
    missao: "Batalhão de intervenção: controle de distúrbios civis, reintegrações de posse, ações em presídios, manifestações com grave perturbação da ordem, estádios e grandes eventos.",
    origem: "Companhia de Choque (1980) → Batalhão (Decreto-Lei nº 7.870/1982)" },
  { sigla: "BEPI", nome: "Batalhão Especializado de Policiamento do Interior", tipo: "Intervenção e operações especiais", sede: "Custódia", ais: "19", subordinacao: "DIRESP",
    missao: "Combate ao narcotráfico e erradicação de plantios de maconha, grupos armados, sequestros e assaltos a bancos e carros-fortes no interior; escoltas e mandados; operações com a Polícia Federal.",
    origem: "PEAC (1997) → CIOSAC → BEPI (Lei nº 15.624/2015)" },
  { sigla: "BPRP", nome: "Batalhão de Polícia de Radiopatrulha", denominacao: "Gen Roberto Pessoa", tipo: "Recobrimento e apoio", sede: "Recife", ais: "1-5", subordinacao: "DIRESP",
    missao: "Recobre as AIS da RMR e combate o crime organizado: assaltos a bancos, tráfico e captura de foragidos, com o Núcleo de Inteligência.",
    origem: "Companhia de Vigilância de Radiopatrulha (1951) → Batalhão (Decreto nº 2.860/1970)" },
  { sigla: "RPMon", nome: "Regimento de Polícia Montada", denominacao: "Dias Cardoso", tipo: "Recobrimento e apoio", sede: "Recife", ais: "1-5", subordinacao: "DIRESP",
    missao: "Policiamento montado que recobre as unidades de área e, quando preciso, atua no controle de distúrbios civis.",
    origem: "Esquadrão (Lei nº 5.019/1964) → Regimento (Decreto nº 252/1970)" },
  { sigla: "CIPMoto", nome: "Companhia Independente de Policiamento com Motocicletas", tipo: "Recobrimento e apoio", sede: "Recife", ais: "1-5", subordinacao: "DIRESP",
    missao: "Combate à criminalidade de forma audaz, veloz e precisa: trios da ROCAM e Grupo Tático de Ações Rápidas (GTAR); forma motociclistas policiais.",
    origem: "ROCAM (1999) → CIPMoto (2004)" },
  { sigla: "CIPCães", nome: "Companhia Independente de Policiamento com Cães", tipo: "Recobrimento e apoio", sede: "Recife", ais: "1-5", subordinacao: "DIRESP",
    missao: "Cães no combate a homicídios, roubos e narcotráfico; apoio ao Choque em presídios e distúrbios; revistas antiterrorismo.",
    origem: "Criada em 1962; separada do BPChoque em 1997, a primeira do gênero entre as PMs do Brasil" },
  { sigla: "1º BIEsp", nome: "1º Batalhão Integrado Especializado", denominacao: "Cel PM Roberto Carvalho Moura e Silva", tipo: "Recobrimento e apoio", sede: "Caruaru", ais: "14", subordinacao: "DIRESP",
    missao: "Apoia os batalhões da DINTER I, com ênfase na AIS 14, com 4 companhias: trânsito, radiopatrulha, motopatrulha (ROCAM) e choque com cães.",
    origem: "Lei nº 16.014/2017" },
  { sigla: "2º BIEsp", nome: "2º Batalhão Integrado Especializado", denominacao: "Major PM Optato Gueiros", tipo: "Recobrimento e apoio", sede: "Petrolina", ais: "26", subordinacao: "DIRESP",
    missao: "Mesma fórmula do 1º BIEsp, no apoio à AIS 26 e ao Sertão do São Francisco.",
    origem: "Criado em 2017; inaugurado em 2018" },
  { sigla: "1º BPTran", nome: "1º Batalhão de Polícia de Trânsito", denominacao: "Felipe Camarão", tipo: "Trânsito", sede: "Recife", ais: "1-5", subordinacao: "DIRESP",
    missao: "Fiscalização e operação do trânsito urbano com o DETRAN-PE e os municípios; blitz e bloqueios também contra roubos e homicídios.",
    origem: "Decreto nº 15.951/1992" },
  { sigla: "BPRv", nome: "Batalhão de Polícia Rodoviária", denominacao: "Cel PM Manuel de Souza Neto", tipo: "Trânsito", sede: "Recife", ais: "1-5", subordinacao: "DIRESP",
    missao: "Policiamento ostensivo nas rodovias estaduais, com fiscalização em convênio com o DER-PE (art. 23 do CTB).",
    origem: "CPR (1964) → Batalhão (Decreto nº 10.324/1985)" },
  { sigla: "BPGd", nome: "Batalhão de Polícia de Guardas", denominacao: "Paulo Guerra", tipo: "Guarda e turismo", sede: "Recife", ais: "1-5", subordinacao: "DIRESP",
    missao: "Segurança externa dos palácios e prédios públicos e guarda de presídios do Grande Recife.",
    origem: "Reativado pela Portaria CG nº 658/1999" },
  { sigla: "BPTur / CIATur", nome: "Policiamento turístico", tipo: "Guarda e turismo", sede: "Olinda", ais: "7", subordinacao: "DIRESP",
    missao: "Segurança nas áreas turísticas e históricas (Sítio Histórico de Olinda, Recife Antigo, Porto de Galinhas), com policiais que falam outros idiomas; coordena o policiamento das prévias e do carnaval nesses bairros.",
    origem: "GEATur (2001) → CIATur (Lei nº 12.544/2004); hoje BPTur, com sede no Varadouro" },
  { sigla: "CIPOMA", nome: "Companhia Independente de Policiamento do Meio Ambiente", denominacao: "Ecólogo Vasconcelos Sobrinho", tipo: "Ambiental", sede: "Igarassu", ais: "8", subordinacao: "DIRESP",
    missao: "Policiamento ambiental: coibir a degradação, fiscalizar e fazer educação ambiental. Também atua em Fernando de Noronha.",
    origem: "Decreto nº 14.147/1989" },
  { sigla: "GTA", nome: "Grupamento Tático Aéreo", tipo: "Aérea", sede: "Recife, Caruaru, Serra Talhada e Petrolina", ais: "1-5", subordinacao: "SDS",
    missao: "Unidade aérea da Secretaria de Defesa Social, que apoia as forças do Sistema de Defesa Social. Tem bases no Recife, em Caruaru, em Serra Talhada e em Petrolina." },
]
// Bases do GTA fora do Recife (para marcar no mapa)
export const BASES_GTA: IdAIS[] = ["1-5", "14", "21", "26"]

export const especializadasDaAIS = (ais: IdAIS) =>
  ESPECIALIZADAS.filter(e => e.ais === ais || (e.sigla === "GTA" && BASES_GTA.includes(ais)))

// ── Escalões e cargos ──
export const ESCALOES = [
  { espaco: "Região", responsavel: "Diretoria (DIM, DINTER I, DINTER II)", efetivo: "—", cargo: "Diretor — coronel" },
  { espaco: "Área (AIS)", responsavel: "Batalhão (BPM) ou Regimento (RPMon)", efetivo: "300 a 1.000 PMs", cargo: "Comandante e subcomandante do batalhão — oficiais superiores" },
  { espaco: "Subárea", responsavel: "Companhia (CPM) ou Esquadrão", efetivo: "80 a 250", cargo: "Comandante de companhia — capitão (hoje, muitas vezes um tenente ou aspirante)" },
  { espaco: "Setor", responsavel: "Pelotão (Pel PM)", efetivo: "20 a 80", cargo: "Comandante de pelotão — tenente ou aspirante" },
  { espaco: "Subsetor", responsavel: "Grupo (Gp PM)", efetivo: "até 20", cargo: "Comandante de grupo — sargento" },
  { espaco: "Posto", responsavel: "Fração elementar (1 a 3 PMs) ou constituída (4 ou mais)", efetivo: "1 a 3", cargo: "Cabos e soldados, no cartão-programa" },
]

export const COMO_FUNCIONA = [
  "Batalhões de área (BPM) respondem pela ordem pública na sua AIS; cada companhia cuida de uma subárea e cada pelotão de um setor.",
  "Unidades especializadas não têm área fixa: recobrem e reforçam os batalhões de área em operações, eventos e crises.",
  "Companhias independentes (CIPM) têm o porte de uma companhia, mas respondem direto à diretoria, sem batalhão acima.",
  "Quem comanda tropa no terreno responde ao escalão imediatamente superior pela ordem pública na sua circunscrição.",
  "Em cada AIS, a PM trabalha integrada com a Polícia Civil (seccional), os Bombeiros e a Polícia Científica, com metas de redução de CVLI acompanhadas pela SDS.",
]
