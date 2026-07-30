// Títulos dos módulos do banco de questões, por matéria.
// O campo `modulo` da tabela Questao guarda só o identificador ("1", "SIM",
// "AE1-2025"); o título fica aqui para situar o aluno na tela de /questoes.
// Módulo sem título cai no rótulo genérico ("Módulo 4").

export const TITULOS_MODULO: Record<string, Record<string, string>> = {
  IG: {
    "1": "Continência individual e sinais de respeito",
    "2": "Apresentação individual e continência da tropa",
    "3": "Culto à Bandeira e hasteamento",
    "4": "Bandeiras-insígnias e honras de recepção/despedida",
    "5": "Guarda-Bandeira",
    "6": "Compromisso e promoção ao primeiro posto",
    "7": "Solenidades e passagem de comando",
    "8": "Honras fúnebres e condecorações",
    "9": "Atribuições do Comandante de OME",
    "10": "Atribuições do Subcomandante de OME",
    "11": "Atribuições do Ajudante-Secretário",
    "12": "Atribuições do P1",
    "13": "Atribuições do P3",
    "14": "Atribuições do SEI (Ensino e Instrução)",
    "15": "Atribuições do P4",
    "16": "Do Boletim Interno (BI)",
    "17": "Trabalhos diários, instrução e faxinas",
    "18": "Do Adjunto de Comando",
    "19": "Manual Básico de Comunicação Social da PMPE",
    "20": "Do Expediente",
    "21": "Das Escalas de Serviço",
    "22": "Do Serviço Interno",
    "23": "Do Oficial de Dia (de Operações)",
    "24": "Do Adjunto ao Oficial de Dia (Graduado de Operações)",
    "25": "Do Serviço de Guarda do Quartel",
    "26": "Do Comandante da Guarda do Quartel",
    "27": "Do Plantão",
    "28": "Das Formaturas",
    "AE1-2025": "Prova antiga — 1ª AE de IG (11/07/2025)",
    "AE2-2025": "Prova antiga — 2ª AE de Instrução Geral (25/08/2025)",
  },
  APHT: {
    "1": "Histórico do APH-Tático, normas e legislações",
    "2": "Atendimento sob confronto armado (1ª fase)",
    "3": "M.A.R.C.H. — letra M (hemorragias)",
    "4": "M.A.R.C.H. — letras A e R (vias aéreas e respiração)",
    "5": "M.A.R.C.H. — letras C e H (choque e hipotermia)",
    "6": "Atendimento em evacuação tática (3ª fase)",
    SIM: "Simulado — formato da prova (10,0 pontos)",
  },
  GC: {
    "1": "Gestão de conflitos e de crises",
    "2": "Histórico da doutrina de gerenciamento de crises",
    "3": "Incidentes com reféns e modalidades de ocorrências",
    "4": "Incidentes estáticos e dinâmicos",
    "5": "Conceito de crise, características e binômio",
    "6": "Aspectos legais, objetivos e critérios de ação",
    "7": "Inteligência e fases do gerenciamento",
    "8": "Tipologia dos CEC, perímetros e posto de comando",
    "9": "Primeira intervenção em crises policiais",
    "10": "Alternativas táticas no gerenciamento estático",
    "11": "Nova ambiência: sistema dinâmico e agressor ativo",
    "12": "Decreto nº 33.782/2009 (GCRISES)",
    "13": "POP nº 0054 (agressor ativo em ataque massivo)",
    SIM: "Simulado — formato da prova (10,0 pontos)",
  },
  POE: {
    "1": "Conceitos básicos do policiamento ostensivo",
    "2": "Características do policiamento ostensivo",
    "3": "Princípios do policiamento ostensivo",
    "4": "Variáveis do policiamento ostensivo",
    "5": "Órgãos do sistema de segurança pública",
    "6": "Desdobramento da PMPE: DPO e diretorias territoriais",
    "7": "DIRESP, DASDH e programas institucionais",
    "8": "3ª EMG: Estado-Maior Geral e suas seções",
    "9": "Planejamento operacional na PMPE",
    "10": "Documentos de planejamento da PMPE",
    "11": "Ciclo PDCA",
    "12": "Juntos pela Segurança e Gestão por Resultados",
    SIM: "Simulado — formato da prova (10,0 pontos)",
  },
  AP: {
    "1": "Fundamentação legal da busca pessoal (CPP)",
    "2": "Fundada suspeita e Tribunais Superiores",
    "3": "Grupos vulneráveis",
    "4": "Conceito e finalidades da abordagem policial",
    "5": "Princípios da abordagem policial",
    "6": "Processos da abordagem: planejamento e execução",
    "7": "Posturas de segurança",
    "8": "Tipos de busca",
    "9": "Posições de busca pessoal",
    "10": "Sequência da abordagem a pessoas",
    "11": "Busca veicular e busca domiciliar",
    "12": "Técnicas de algemamento",
    "13": "Abordagem a veículos e motocicletas",
    "14": "Ponto de bloqueio, ônibus e veículos de carga",
    "15": "Abordagem à edificação",
    SIM: "Simulado — formato da prova (10,0 pontos)",
  },
  INTSISP: {
    "1": "Fundamentos históricos da inteligência no Brasil",
    "2": "Sistema Brasileiro de Inteligência (SISBIN / ABIN)",
    "3": "Sistema Estadual de Inteligência (SEINSP / CIIDS / SIPOM)",
    "4": "Fundamentos doutrinários e ética",
    "5": "Princípios e valores",
    "6": "Ramo Inteligência e classificações",
    "7": "Ciclo de Inteligência",
    "8": "Contrainteligência",
    "9": "Elemento de análise: dado × informação × conhecimento",
    "10": "Ciclo de análise, MPC e técnicas de apoio",
    "11": "POI e Inteligência × Investigação policial",
    SIM: "Simulado — formato da prova (10,0 pontos)",
  },
  GPGA: { SIM: "Simulado" },
  PO: { "SIM-2AE": "Simulado — 2ª AE" },
  TCEM: { "SIM-1VA": "Simulado — 1ª VA", APOSTILA: "Questões da apostila" },
  GRAPP: {
    "Simulado 1": "Simulado 1", "Simulado 2": "Simulado 2",
    "Simulado 3": "Simulado 3", "Simulado 4": "Simulado 4",
  },
}

/** Rótulo completo do módulo: "Módulo 3 — Culto à Bandeira". */
export function moduloLabel(materia: string, modulo: string): string {
  if (!modulo) return "Sem módulo"
  const titulo = TITULOS_MODULO[materia]?.[modulo]
  if (!/^\d+$/.test(modulo)) return titulo || modulo
  return titulo ? `Módulo ${Number(modulo)} — ${titulo}` : `Módulo ${Number(modulo)}`
}

/** Rótulo curto para as etiquetas de questão: "Mód. 3 — Culto à Bandeira". */
export function moduloLabelCurto(materia: string, modulo: string): string {
  if (!modulo) return ""
  const titulo = TITULOS_MODULO[materia]?.[modulo]
  if (!/^\d+$/.test(modulo)) return titulo || modulo
  return titulo ? `Mód. ${Number(modulo)} — ${titulo}` : `Mód. ${Number(modulo)}`
}
