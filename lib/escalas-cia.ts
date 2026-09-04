// ─────────────────────────────────────────────────────────────
//  Escalas da 1ª Companhia — CFO 2026
//
//  Transcrito dos documentos assinados pelo Cmt da 1ª CIA
//  (1º TEN QOPM Pedro Henrique Tenório de Almeida Pessoa),
//  período SETEMBRO/2026. Os PDFs originais ficam em
//  /public/escalas/ e são a fonte de verdade — se divergirem
//  daqui, o PDF vence.
//
//  Ao chegar um novo mês: acrescentar um bloco MES_<MES>_<ANO>
//  e registrá-lo em MESES_ESCALA.
// ─────────────────────────────────────────────────────────────

export type Grupo = "GOLF" | "HOTEL" | "INDIA" | "JULIETT" | "KILO" | "LIMA" | "MIKE" | "NOVEMBER"

/** Ordem do ciclo diário da escala 7x1 (todos os dias, inclusive fim de semana). */
export const ORDEM_GRUPOS: Grupo[] = ["GOLF", "HOTEL", "INDIA", "JULIETT", "KILO", "LIMA", "MIKE", "NOVEMBER"]

/** Rótulo de exibição — o documento grafa ÍNDIA com acento. */
export const ROTULO_GRUPO: Record<Grupo, string> = {
  GOLF: "GOLF", HOTEL: "HOTEL", INDIA: "ÍNDIA", JULIETT: "JULIETT",
  KILO: "KILO", LIMA: "LIMA", MIKE: "MIKE", NOVEMBER: "NOVEMBER",
}

// ── Mapa de equipes de plantão (Setembro/2026) ────────────────
// Fonte: "MAPA DE EQUIPES DE PLANTÃO - ESCALA 7X1".
// Também serve de dicionário matrícula → nome de guerra para toda a CIA.

export const MAPA_EQUIPES: Record<Grupo, [number, string][]> = {
  GOLF: [
    [1, "HELLTON FERNANDES"], [6, "CAMPOS"], [7, "ALDO SILVA"], [8, "JEFFERSON FRANCISCO"],
    [15, "TAYNÃ RAMALHO"], [16, "FLÁVIO CARVALHO"], [19, "THAIS FIGUEIREDO"], [27, "CLÁUDIA"],
    [32, "NAPOLEÃO"], [34, "RICARDO"], [39, "CAETANO"], [42, "JONILDO"], [43, "MATHEUS ROCHA"],
    [46, "FONTES"], [57, "CLEYTON"], [62, "IDEYVISON"], [80, "LUIZ OLIVEIRA"],
    [111, "ANDRÉ MARINHO"], [143, "VIDAL"], [159, "HIGOR LIMA"], [184, "PAULO AZEVÊDO"],
    [191, "GOMES NASCIMENTO"], [196, "EDUARDA RODRIGUES"], [197, "ABREU"], [199, "BARROS"],
  ],
  HOTEL: [
    [9, "VERAS"], [13, "JONAS"], [21, "SAMPAIO"], [23, "RODOLFO MOURA"], [24, "MÓYSES"],
    [25, "CAROLINE QUEIROZ"], [30, "RODRIGUES"], [35, "FILLIPE PAIXÃO"], [36, "MACÊDO JÚNIOR"],
    [74, "DAVID"], [75, "JÚLIO CÉSAR"], [77, "FÁBIO"], [83, "DIEGO SANTOS"], [89, "EWERTON FARIAS"],
    [105, "LUCAS EDUARDO"], [109, "LETÍCIA PINHEIRO"], [112, "IVHINNY"], [129, "MARTINS"],
    [144, "SAMUEL SANTOS"], [147, "JANDERSON"], [154, "TÂMARA LEMOS"], [170, "RONALDO"],
    [195, "JEFFERSON NUNES"], [200, "APOLLO"], [206, "CÉSAR"],
  ],
  INDIA: [
    [38, "JOHN ALVES"], [41, "ALAN SILVA"], [48, "LIMA"], [56, "WESLEY BATISTA"], [59, "ASSIS"],
    [60, "JOÃO NUNES"], [63, "ALVES"], [67, "BARBOSA"], [70, "LUCAS GABRIEL"],
    [78, "FRANCISCO SOUZA"], [90, "NETTO"], [102, "LEITE JÚNIOR"], [107, "DIEGO LOPES"],
    [108, "LISANDRY"], [113, "ÁUREA AMORIM"], [116, "BERTIPALHA"], [118, "BRUNO SILVA"],
    [122, "ANDREY"], [124, "CECÍLIA"], [126, "LUCAS RIBEIRO"], [133, "ANDERSON SOARES"],
    [136, "RONIÉRISON BARROS"], [137, "PRISCYLA NEVES"], [138, "JANAÍNA"], [157, "CARLOS LIMA"],
  ],
  JULIETT: [
    [11, "KALYNNE GOMES"], [12, "MELO"], [33, "LUIZ VICENTE"], [72, "EDNALDO BEZERRA"],
    [82, "LEANDRO SILVA"], [86, "HOLANDA"], [91, "DANILO"], [94, "ANDRÉ CARDOSO"],
    [96, "PATRÍCIA CORREIA"], [104, "FURTUNATO NETO"], [121, "LUNA"], [128, "MIGUEL"],
    [130, "IVALDO"], [141, "RAMONN"], [145, "FRANSCISCO VIEIRA"], [150, "GERALDO"], [153, "HUGO"],
    [158, "FELIPE OLIVEIRA"], [161, "FELIPE GOMES"], [163, "ELIVELTON RODRIGUES"], [173, "HÉVILA"],
    [181, "PABLO MACIEL"], [190, "LARISSA ALCANTARA"], [204, "AMANDA"], [208, "FABIANA"],
  ],
  KILO: [
    [20, "TIBÚRCIO"], [26, "ANDRÉ"], [37, "PABLO TORRES"], [58, "JOHN FELIX"], [61, "TEREZA"],
    [65, "KAUHANNI"], [85, "FLÁVIA COSTA"], [98, "JOSÉ MENEZES"], [101, "MATHEUS ALBUQUERQUE"],
    [119, "HEITOR"], [132, "CEZAR SANTOS"], [140, "RAIMUNDO"], [155, "VICTOR ALVES"],
    [156, "SILVANO PEREIRA"], [166, "EVANGELISTA"], [169, "HYGO CESÁRIO"], [171, "MAXWEL"],
    [177, "ROSÁRIO JÚNIOR"], [179, "LEONARDO"], [180, "DANTAS"], [188, "ALBERTO"],
    [193, "MÁRCIO LEITE"], [198, "MARCELO"], [202, "FERRAZ"], [212, "CAMILA BUONORA"],
  ],
  LIMA: [
    [4, "ANA SILVA"], [14, "WINNY"], [40, "ALMEIDA"], [49, "MIRANDA"], [50, "ELDER FERREIRA"],
    [66, "LUCAS MATEUS"], [69, "AUGUSTO"], [93, "SALES"], [95, "ALEX SILVA"], [103, "MENDONÇA"],
    [114, "JOSIANE"], [131, "JOSÉ INÁCIO"], [134, "SILVÂNIO SANTOS"], [146, "ELÍSIO"],
    [151, "RAINY"], [160, "JONAS GOMES"], [162, "MARCONDES"], [167, "GUSTAVO NETO"],
    [174, "ALEXANDRE"], [175, "EMERSON LOPES"], [186, "SAMUEL SILVA"], [189, "PAULO NASCIMENTO"],
    [203, "J LUIZ"], [207, "HOBERDAN"], [217, "SALUSTIANO"],
  ],
  MIKE: [
    [5, "GEORGE"], [28, "BRANDÃO"], [29, "LYSIA"], [44, "DIOGO ARAÚJO"], [45, "GABRIELE COSTA"],
    [53, "PEDRO HENRIQUE"], [64, "EDUARDO"], [68, "AMAURI"], [73, "MILENE QUEIROZ"],
    [81, "FERNANDO ROCHA"], [84, "EDILSON JOSÉ"], [87, "BARRETO"], [88, "TACIANE"],
    [97, "ROBERTO CAVALCANTE"], [100, "KARLA ALBUQUERQUE"], [106, "RAFAEL RIBEIRO"],
    [117, "GUILHERME"], [123, "BEATRIZ"], [127, "LOIOLA"], [149, "FELIPE FERREIRA"],
    [165, "KEVIN GOMES"], [176, "DIRLEYNNE ALVES"], [214, "DAMASCENA"], [219, "BRENER"],
    [220, "RATIS"],
  ],
  NOVEMBER: [
    [10, "ERICK"], [18, "FERNANDA BISPO"], [22, "WILLIAN SANTOS"], [31, "ROMÉRIO"],
    [52, "JAMILLE"], [55, "SHIRLAYNE"], [71, "LEIMIG"], [76, "ARAÚJO JÚNIOR"],
    [79, "BRUNO HENRIQUE"], [92, "MOACIR"], [110, "WESLEY HENRIQUE"], [115, "EDUARDO GONÇALVES"],
    [120, "ADRIANO"], [135, "BELTRÃO"], [139, "GLEYDSON"], [142, "MAGALHÃES"], [152, "LÉLIS"],
    [164, "ROBSON MELO"], [168, "MATHEUS SILVA"], [178, "GABRIEL SILVA"], [183, "LÉIA"],
    [185, "VINÍCIUS KAIRÊ"], [187, "HEMERSON FILHO"], [192, "JOSÉ BARBOSA"], [210, "ANDRÉ JÚNIOR"],
    [218, "COELHO"],
  ],
}

const NOME_POR_MAT = new Map<number, string>()
const GRUPO_POR_MAT = new Map<number, Grupo>()
for (const [grupo, membros] of Object.entries(MAPA_EQUIPES) as [Grupo, [number, string][]][]) {
  for (const [mat, nome] of membros) {
    NOME_POR_MAT.set(mat, nome)
    GRUPO_POR_MAT.set(mat, grupo)
  }
}

/** Nome de guerra da matrícula no mapa da CIA (null se não constar). */
export function nomeDaMatricula(mat: number): string | null {
  return NOME_POR_MAT.get(mat) ?? null
}

/** Grupo de plantão da matrícula (null se não constar no mapa). */
export function grupoDaMatricula(mat: number): Grupo | null {
  return GRUPO_POR_MAT.get(mat) ?? null
}

/** "108 LISANDRY" — ou só o número quando a matrícula não está no mapa. */
export function rotuloMilitar(mat: number): string {
  const nome = NOME_POR_MAT.get(mat)
  return nome ? `${mat} ${nome}` : String(mat)
}

// ── Escala diária de plantão (Setembro/2026) ──────────────────
// Fonte: "ESCALA DE PLANTÃO, AUXILIAR, ADJUNTO E SOBREAVISO - ESCALA 7X1",
// horário 07h às 07h. Sobreaviso registrado por matrícula porque a coluna
// do PDF corta os nomes na margem da página.

export type DiaPlantao = {
  /** ISO, para ordenar e comparar com a data de hoje */
  data: string
  grupo: Grupo
  auxiliar: number
  adjunto: number
  sobreaviso: number[]
}

export const PLANTAO_SETEMBRO_2026: DiaPlantao[] = [
  { data: "2026-09-01", grupo: "INDIA",    auxiliar: 63,  adjunto: 67,  sobreaviso: [130, 128, 121, 104] },
  { data: "2026-09-02", grupo: "JULIETT",  auxiliar: 11,  adjunto: 12,  sobreaviso: [98, 85, 65, 61] },
  { data: "2026-09-03", grupo: "KILO",     auxiliar: 85,  adjunto: 98,  sobreaviso: [131, 114, 103, 95] },
  { data: "2026-09-04", grupo: "LIMA",     auxiliar: 93,  adjunto: 95,  sobreaviso: [84, 81, 73, 64] },
  { data: "2026-09-05", grupo: "MIKE",     auxiliar: 44,  adjunto: 53,  sobreaviso: [79, 76, 71, 52] },
  { data: "2026-09-06", grupo: "NOVEMBER", auxiliar: 18,  adjunto: 22,  sobreaviso: [32, 27, 19, 16] },
  { data: "2026-09-07", grupo: "GOLF",     auxiliar: 39,  adjunto: 42,  sobreaviso: [77, 75, 74, 36] },
  { data: "2026-09-08", grupo: "HOTEL",    auxiliar: 23,  adjunto: 24,  sobreaviso: [67, 63, 60, 59] },
  { data: "2026-09-09", grupo: "INDIA",    auxiliar: 70,  adjunto: 78,  sobreaviso: [96, 94, 91, 86] },
  { data: "2026-09-10", grupo: "JULIETT",  auxiliar: 33,  adjunto: 72,  sobreaviso: [58, 37, 26, 20] },
  { data: "2026-09-11", grupo: "KILO",     auxiliar: 101, adjunto: 119, sobreaviso: [93, 69, 66, 50] },
  { data: "2026-09-12", grupo: "LIMA",     auxiliar: 103, adjunto: 114, sobreaviso: [68, 53, 45, 44] },
  { data: "2026-09-13", grupo: "MIKE",     auxiliar: 64,  adjunto: 68,  sobreaviso: [55, 31, 22, 18] },
  { data: "2026-09-14", grupo: "NOVEMBER", auxiliar: 31,  adjunto: 55,  sobreaviso: [15, 8, 7, 6] },
  { data: "2026-09-15", grupo: "GOLF",     auxiliar: 43,  adjunto: 46,  sobreaviso: [35, 30, 25, 24] },
  { data: "2026-09-16", grupo: "HOTEL",    auxiliar: 25,  adjunto: 30,  sobreaviso: [56, 48, 41, 38] },
  { data: "2026-09-17", grupo: "INDIA",    auxiliar: 90,  adjunto: 102, sobreaviso: [82, 72, 33, 12] },
  { data: "2026-09-18", grupo: "JULIETT",  auxiliar: 82,  adjunto: 86,  sobreaviso: [212, 202, 198, 193] },
  { data: "2026-09-19", grupo: "KILO",     auxiliar: 132, adjunto: 140, sobreaviso: [49, 40, 14, 4] },
  { data: "2026-09-20", grupo: "LIMA",     auxiliar: 131, adjunto: 134, sobreaviso: [214, 29, 28, 5] },
  { data: "2026-09-21", grupo: "MIKE",     auxiliar: 73,  adjunto: 81,  sobreaviso: [210, 192, 187, 10] },
  { data: "2026-09-22", grupo: "NOVEMBER", auxiliar: 52,  adjunto: 71,  sobreaviso: [199, 197, 196, 1] },
  { data: "2026-09-23", grupo: "GOLF",     auxiliar: 57,  adjunto: 62,  sobreaviso: [23, 21, 13, 9] },
  { data: "2026-09-24", grupo: "HOTEL",    auxiliar: 35,  adjunto: 36,  sobreaviso: [157, 138, 137, 136] },
  { data: "2026-09-25", grupo: "INDIA",    auxiliar: 107, adjunto: 113, sobreaviso: [208, 204, 190, 11] },
  { data: "2026-09-26", grupo: "JULIETT",  auxiliar: 91,  adjunto: 94,  sobreaviso: [188, 180, 179, 177] },
  { data: "2026-09-27", grupo: "KILO",     auxiliar: 155, adjunto: 166, sobreaviso: [207, 189, 186, 175] },
  { data: "2026-09-28", grupo: "LIMA",     auxiliar: 146, adjunto: 151, sobreaviso: [176, 165, 149, 127] },
  { data: "2026-09-29", grupo: "MIKE",     auxiliar: 84,  adjunto: 87,  sobreaviso: [185, 183, 178, 168] },
  { data: "2026-09-30", grupo: "NOVEMBER", auxiliar: 76,  adjunto: 79,  sobreaviso: [191, 184, 159, 143] },
]

/** Observações que acompanham a escala de plantão do mês. */
export const OBS_PLANTAO_SETEMBRO_2026 = [
  "O AL CFO PM 105 LUCAS EDUARDO é adventista; portanto, seus plantões de sexta-feira devem ser remanejados para a quinta-feira, e os de sábado, para o domingo.",
]

// ── Funções nas formaturas matinais/gerais (Setembro/2026) ────
// Fonte: "ESCALA DE FUNÇÕES NAS FORMATURAS MATINAIS/GERAIS".

export type DiaFuncoes = {
  data: string
  mestreCerimonia: number
  leitorBI: number
  discurso: number
  comandante: number
}

export const FUNCOES_SETEMBRO_2026: DiaFuncoes[] = [
  { data: "2026-09-01", mestreCerimonia: 157, leitorBI: 38,  discurso: 41,  comandante: 48 },
  { data: "2026-09-02", mestreCerimonia: 128, leitorBI: 130, discurso: 141, comandante: 145 },
  { data: "2026-09-03", mestreCerimonia: 198, leitorBI: 202, discurso: 212, comandante: 20 },
  { data: "2026-09-04", mestreCerimonia: 203, leitorBI: 207, discurso: 217, comandante: 4 },
  { data: "2026-09-08", mestreCerimonia: 144, leitorBI: 147, discurso: 154, comandante: 170 },
  { data: "2026-09-09", mestreCerimonia: 56,  leitorBI: 67,  discurso: 60,  comandante: 63 },
  { data: "2026-09-10", mestreCerimonia: 150, leitorBI: 153, discurso: 158, comandante: 161 },
  { data: "2026-09-11", mestreCerimonia: 26,  leitorBI: 37,  discurso: 58,  comandante: 61 },
  { data: "2026-09-14", mestreCerimonia: 10,  leitorBI: 18,  discurso: 22,  comandante: 55 },
  { data: "2026-09-15", mestreCerimonia: 111, leitorBI: 143, discurso: 159, comandante: 184 },
  { data: "2026-09-16", mestreCerimonia: 195, leitorBI: 200, discurso: 206, comandante: 9 },
  { data: "2026-09-17", mestreCerimonia: 59,  leitorBI: 70,  discurso: 78,  comandante: 90 },
  { data: "2026-09-18", mestreCerimonia: 163, leitorBI: 173, discurso: 181, comandante: 190 },
  { data: "2026-09-21", mestreCerimonia: 214, leitorBI: 64,  discurso: 84,  comandante: 87 },
  { data: "2026-09-22", mestreCerimonia: 31,  leitorBI: 76,  discurso: 79,  comandante: 92 },
  { data: "2026-09-23", mestreCerimonia: 191, leitorBI: 196, discurso: 197, comandante: 199 },
  { data: "2026-09-24", mestreCerimonia: 13,  leitorBI: 21,  discurso: 23,  comandante: 24 },
  { data: "2026-09-25", mestreCerimonia: 102, leitorBI: 108, discurso: 116, comandante: 118 },
  { data: "2026-09-28", mestreCerimonia: 14,  leitorBI: 40,  discurso: 49,  comandante: 50 },
  { data: "2026-09-29", mestreCerimonia: 73,  leitorBI: 81,  discurso: 88,  comandante: 97 },
  { data: "2026-09-30", mestreCerimonia: 52,  leitorBI: 71,  discurso: 110, comandante: 115 },
]

export const ROTULO_FUNCAO = {
  mestreCerimonia: "Mestre de Cerimônia",
  leitorBI: "Leitor de BI",
  discurso: "Discurso ao CFO",
  comandante: "Comandante da 1ª CIA",
} as const

export type ChaveFuncao = keyof typeof ROTULO_FUNCAO

// ── Documentos originais publicados ───────────────────────────

export type DocEscala = { titulo: string; descricao: string; arquivo: string }

export const DOCS_SETEMBRO_2026: DocEscala[] = [
  {
    titulo: "Escala de plantão 7x1",
    descricao: "Plantão, auxiliar, adjunto e sobreaviso — 07h às 07h.",
    arquivo: "/escalas/setembro-2026-plantao-7x1.pdf",
  },
  {
    titulo: "Mapa de equipes",
    descricao: "Divisão das 8 equipes de plantão da 1ª Companhia.",
    arquivo: "/escalas/setembro-2026-mapa-equipes.pdf",
  },
  {
    titulo: "Funções de destaque",
    descricao: "Mestre de cerimônia, leitor de BI, discurso e comandante nas formaturas.",
    arquivo: "/escalas/setembro-2026-funcoes-destaque.pdf",
  },
  {
    titulo: "Guarda-Bandeira",
    descricao: "Funções nas formaturas gerais, dia a dia — 14 militares por formatura.",
    arquivo: "/escalas/setembro-2026-guarda-bandeira.pdf",
  },
]

// ── Mês publicado ────────────────────────────────────────────

export type MesEscala = {
  chave: string
  rotulo: string
  /** primeiro e último dia do mês, ISO — delimita o período coberto */
  inicio: string
  fim: string
  plantao: DiaPlantao[]
  funcoes: DiaFuncoes[]
  obs: string[]
  docs: DocEscala[]
}

export const MESES_ESCALA: MesEscala[] = [
  {
    chave: "2026-09",
    rotulo: "Setembro / 2026",
    inicio: "2026-09-01",
    fim: "2026-09-30",
    plantao: PLANTAO_SETEMBRO_2026,
    funcoes: FUNCOES_SETEMBRO_2026,
    obs: OBS_PLANTAO_SETEMBRO_2026,
    docs: DOCS_SETEMBRO_2026,
  },
]

/** O mês que contém `hoje`, ou o mais recente publicado. */
export function mesVigente(hojeIso: string): MesEscala {
  return MESES_ESCALA.find(m => hojeIso >= m.inicio && hojeIso <= m.fim) ?? MESES_ESCALA[MESES_ESCALA.length - 1]
}
