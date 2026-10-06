// ─────────────────────────────────────────────────────────────
//  Escalas da 1ª Companhia — CFO 2026
//
//  Transcrito dos documentos da 1ª CIA / Corpo de Alunos, mês a mês.
//  Os PDFs originais ficam em /public/escalas/ e são a fonte de
//  verdade — se divergirem daqui, o PDF vence.
//
//  Fonte única das escalas da companhia: a página /escalas do portal
//  (todos os alunos) e a área da Turma 13 leem daqui.
//
//  Ao chegar um novo mês: acrescentar um bloco <MES>_2026 (mapa,
//  plantão, funções, guarda-bandeira, obs, docs) e registrá-lo em
//  MESES_ESCALA.
// ─────────────────────────────────────────────────────────────

export type Grupo = "GOLF" | "HOTEL" | "INDIA" | "JULIETT" | "KILO" | "LIMA" | "MIKE" | "NOVEMBER"

/** Ordem do ciclo diário da escala 7x1. */
export const ORDEM_GRUPOS: Grupo[] = ["GOLF", "HOTEL", "INDIA", "JULIETT", "KILO", "LIMA", "MIKE", "NOVEMBER"]

/** Rótulo de exibição — o documento grafa ÍNDIA com acento. */
export const ROTULO_GRUPO: Record<Grupo, string> = {
  GOLF: "GOLF", HOTEL: "HOTEL", INDIA: "ÍNDIA", JULIETT: "JULIETT",
  KILO: "KILO", LIMA: "LIMA", MIKE: "MIKE", NOVEMBER: "NOVEMBER",
}

export type MapaEquipes = Record<Grupo, [number, string][]>

// ═════════════════════════════════════════════════════════════
//  SETEMBRO / 2026
// ═════════════════════════════════════════════════════════════

// Fonte: "MAPA DE EQUIPES DE PLANTÃO - ESCALA 7X1 · SETEMBRO/2026".
const MAPA_SETEMBRO_2026: MapaEquipes = {
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
    [130, "IVALDO"], [141, "RAMONN"], [145, "FRANCISCO VIEIRA"], [150, "GERALDO"], [153, "HUGO"],
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

// ── Escala diária de plantão ─────────────────────────────────
// Horário 07h às 07h. `grupo: null` = dia sem plantão na escala.

export type DiaPlantao = {
  /** ISO, para ordenar e comparar com a data de hoje */
  data: string
  grupo: Grupo | null
  auxiliar: number | null
  adjunto: number | null
  sobreaviso: number[]
}

// Fonte: "ESCALA DE PLANTÃO, AUXILIAR, ADJUNTO E SOBREAVISO - ESCALA 7X1 · SETEMBRO/2026".
const PLANTAO_SETEMBRO_2026: DiaPlantao[] = [
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

const OBS_ADVENTISTA = "O AL CFO PM 105 LUCAS EDUARDO é adventista; portanto, seus plantões de sexta-feira devem ser remanejados para a quinta-feira, e os de sábado, para o domingo."

// ── Funções nas formaturas matinais/gerais ────────────────────

export type DiaFuncoes = {
  data: string
  mestreCerimonia: number
  leitorBI: number
  discurso: number
  comandante: number
}

// Fonte: "ESCALA DE FUNÇÕES NAS FORMATURAS MATINAIS/GERAIS · SETEMBRO/2026".
const FUNCOES_SETEMBRO_2026: DiaFuncoes[] = [
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

// ── Guarda-bandeira (funções nas formaturas gerais) ───────────

export type MembroGuarda = { mat: number; nome: string; funcao: string }
export type DiaGuarda = { data: string; pelotao: number; membros: MembroGuarda[] }

// Setembro: só o dia do 1º Pelotão foi transcrito na época (16/09).
const GUARDA_SETEMBRO_2026: DiaGuarda[] = [
  { data: "2026-09-16", pelotao: 1, membros: [
    { mat: 165, nome: "KEVIN GOMES", funcao: "Pavilhão Nacional" },
    { mat: 114, nome: "JOSIANE FARIAS", funcao: "Comandante da Guarda de Honra" },
    { mat: 71, nome: "LEIMIG", funcao: "Bandeira de Pernambuco" },
    { mat: 76, nome: "ARAÚJO JÚNIOR", funcao: "Bandeira da Confederação do Equador" },
    { mat: 94, nome: "ANDRÉ CARDOSO", funcao: "Bandeira da APMP" },
    { mat: 57, nome: "CLEYTON", funcao: "Porta-flâmula" },
    { mat: 23, nome: "RODOLFO MOURA", funcao: "Guarda" },
    { mat: 37, nome: "PABLO TORRES", funcao: "Guarda" },
    { mat: 41, nome: "ALAN SILVA", funcao: "Guarda" },
    { mat: 45, nome: "GABRIELE COSTA", funcao: "Guarda" },
    { mat: 60, nome: "JOÃO NUNES", funcao: "Guarda" },
    { mat: 98, nome: "JOSÉ MENEZES", funcao: "Guarda" },
    { mat: 105, nome: "LUCAS EDUARDO", funcao: "Guarda" },
    { mat: 108, nome: "LISANDRY", funcao: "Guarda" },
  ] },
]

// ── Documentos originais publicados ───────────────────────────

export type DocEscala = { titulo: string; descricao: string; arquivo: string }

const DOCS_SETEMBRO_2026: DocEscala[] = [
  { titulo: "Escala de plantão 7x1", descricao: "Plantão, auxiliar, adjunto e sobreaviso — 07h às 07h.", arquivo: "/escalas/setembro-2026-plantao-7x1.pdf" },
  { titulo: "Mapa de equipes", descricao: "Divisão das 8 equipes de plantão da 1ª Companhia.", arquivo: "/escalas/setembro-2026-mapa-equipes.pdf" },
  { titulo: "Funções de destaque", descricao: "Mestre de cerimônia, leitor de BI, discurso e comandante nas formaturas.", arquivo: "/escalas/setembro-2026-funcoes-destaque.pdf" },
  { titulo: "Guarda-Bandeira", descricao: "Funções nas formaturas gerais — 14 militares por formatura.", arquivo: "/escalas/setembro-2026-guarda-bandeira.pdf" },
]

// ═════════════════════════════════════════════════════════════
//  OUTUBRO / 2026
//  Fontes (Corpo de Alunos — CAP QOPM Arantes; guarda: 1º TEN Tenório):
//   • MAPA DE EQUIPES DE PLANTÃO - ESCALA 7X1 · OUTUBRO/2026 (atualizada)
//   • ESCALA DE PLANTÃO, AUXILIAR, ADJUNTO E SOBREAVISO · OUTUBRO/2026 - AJUSTADA
//   • ESCALA DE FUNÇÕES NAS FORMATURAS MATINAIS/GERAIS · OUTUBRO/2026 (atualizada)
//   • ESCALA 1ª COMPANHIA - FUNÇÕES NAS FORMATURAS GERAIS · OUTUBRO/2026
// ═════════════════════════════════════════════════════════════

// Mudanças em relação a setembro: 123 BEATRIZ passou de MIKE para GOLF; entraram
// 223 PACHÊCO (GOLF) e 216 BARBOSA JÚNIOR, 221 AMANDA ÂNGELO e 222 AFONSO DA CRUZ
// (MIKE); 199 BARROS e 219 BRENER não constam do mapa de outubro. A Turma 13
// segue com a mesma distribuição de setembro.
const MAPA_OUTUBRO_2026: MapaEquipes = {
  GOLF: [
    [1, "HELLTON FERNANDES"], [6, "CAMPOS"], [7, "ALDO SILVA"], [8, "JEFFERSON FRANCISCO"],
    [15, "TAYNÃ RAMALHO"], [16, "FLÁVIO CARVALHO"], [19, "THAIS FIGUEIREDO"], [27, "CLÁUDIA"],
    [32, "NAPOLEÃO"], [34, "RICARDO"], [39, "CAETANO"], [42, "JONILDO"], [43, "MATHEUS ROCHA"],
    [46, "FONTES"], [57, "CLEYTON"], [62, "IDEYVISON"], [80, "LUIZ OLIVEIRA"],
    [111, "ANDRÉ MARINHO"], [123, "BEATRIZ"], [143, "VIDAL"], [159, "HIGOR LIMA"],
    [184, "PAULO AZEVÊDO"], [191, "GOMES NASCIMENTO"], [196, "EDUARDA RODRIGUES"], [197, "ABREU"],
    [223, "PACHÊCO"],
  ],
  HOTEL: MAPA_SETEMBRO_2026.HOTEL,
  INDIA: MAPA_SETEMBRO_2026.INDIA,
  JULIETT: MAPA_SETEMBRO_2026.JULIETT,
  KILO: MAPA_SETEMBRO_2026.KILO,
  LIMA: MAPA_SETEMBRO_2026.LIMA,
  MIKE: [
    [5, "GEORGE"], [28, "BRANDÃO"], [29, "LYSIA"], [44, "DIOGO ARAÚJO"], [45, "GABRIELE COSTA"],
    [53, "PEDRO HENRIQUE"], [64, "EDUARDO"], [68, "AMAURI"], [73, "MILENE QUEIROZ"],
    [81, "FERNANDO ROCHA"], [84, "EDILSON JOSÉ"], [87, "BARRETO"], [88, "TACIANE"],
    [97, "ROBERTO CAVALCANTE"], [100, "KARLA ALBUQUERQUE"], [106, "RAFAEL RIBEIRO"],
    [117, "GUILHERME"], [127, "LOIOLA"], [149, "FELIPE FERREIRA"], [165, "KEVIN GOMES"],
    [176, "DIRLEYNNE ALVES"], [214, "DAMASCENA"], [220, "RATIS"], [221, "AMANDA ÂNGELO"],
    [222, "AFONSO DA CRUZ"], [216, "BARBOSA JÚNIOR"],
  ],
  NOVEMBER: MAPA_SETEMBRO_2026.NOVEMBER,
}

// Outubro NÃO segue o ciclo puro: 03, 04, 24 e 25/10 (fins de semana) ficaram
// sem plantão e 10/10 é JULIETT (o ciclo daria HOTEL). Por isso o grupo do dia
// vem desta tabela, não de conta.
// Ajustes de leitura: em 28/10 o sobreaviso "PABLO TORRES" veio sem número (= 37).
const PLANTAO_OUTUBRO_2026: DiaPlantao[] = [
  { data: "2026-10-01", grupo: "GOLF",     auxiliar: 80,  adjunto: 111, sobreaviso: [206, 200, 195, 170] },
  { data: "2026-10-02", grupo: "HOTEL",    auxiliar: 75,  adjunto: 77,  sobreaviso: [108, 133, 126, 124] },
  { data: "2026-10-03", grupo: null,       auxiliar: null, adjunto: null, sobreaviso: [] },
  { data: "2026-10-04", grupo: null,       auxiliar: null, adjunto: null, sobreaviso: [] },
  { data: "2026-10-05", grupo: "KILO",     auxiliar: 169, adjunto: 171, sobreaviso: [174, 167, 151, 146] },
  { data: "2026-10-06", grupo: "LIMA",     auxiliar: 160, adjunto: 162, sobreaviso: [222, 221, 220, 219] },
  { data: "2026-10-07", grupo: "MIKE",     auxiliar: 88,  adjunto: 97,  sobreaviso: [218, 164, 152, 142] },
  { data: "2026-10-08", grupo: "NOVEMBER", auxiliar: 92,  adjunto: 110, sobreaviso: [111, 80, 62, 57] },
  { data: "2026-10-09", grupo: "GOLF",     auxiliar: 123, adjunto: 143, sobreaviso: [181, 173, 163, 161] },
  { data: "2026-10-10", grupo: "JULIETT",  auxiliar: 96,  adjunto: 104, sobreaviso: [118, 116, 113, 107] },
  { data: "2026-10-11", grupo: "INDIA",    auxiliar: 122, adjunto: 124, sobreaviso: [158, 153, 150, 145] },
  { data: "2026-10-12", grupo: "JULIETT",  auxiliar: 121, adjunto: 128, sobreaviso: [171, 169, 132, 119] },
  { data: "2026-10-13", grupo: "KILO",     auxiliar: 177, adjunto: 179, sobreaviso: [162, 160, 134, 131] },
  { data: "2026-10-14", grupo: "LIMA",     auxiliar: 167, adjunto: 174, sobreaviso: [117, 97, 88, 87] },
  { data: "2026-10-15", grupo: "MIKE",     auxiliar: 100, adjunto: 106, sobreaviso: [139, 135, 110, 92] },
  { data: "2026-10-16", grupo: "NOVEMBER", auxiliar: 115, adjunto: 120, sobreaviso: [123, 46, 43, 42] },
  { data: "2026-10-17", grupo: "GOLF",     auxiliar: 159, adjunto: 184, sobreaviso: [112, 89, 83, 77] },
  { data: "2026-10-18", grupo: "HOTEL",    auxiliar: 105, adjunto: 109, sobreaviso: [122, 102, 90, 78] },
  { data: "2026-10-19", grupo: "INDIA",    auxiliar: 126, adjunto: 133, sobreaviso: [128, 121, 104, 96] },
  { data: "2026-10-20", grupo: "JULIETT",  auxiliar: 130, adjunto: 141, sobreaviso: [101, 98, 85, 65] },
  { data: "2026-10-21", grupo: "KILO",     auxiliar: 180, adjunto: 188, sobreaviso: [114, 103, 95, 93] },
  { data: "2026-10-22", grupo: "LIMA",     auxiliar: 175, adjunto: 186, sobreaviso: [106, 100, 84, 81] },
  { data: "2026-10-23", grupo: "MIKE",     auxiliar: 117, adjunto: 127, sobreaviso: [120, 115, 79, 76] },
  { data: "2026-10-24", grupo: null,       auxiliar: null, adjunto: null, sobreaviso: [] },
  { data: "2026-10-25", grupo: null,       auxiliar: null, adjunto: null, sobreaviso: [] },
  { data: "2026-10-26", grupo: "HOTEL",    auxiliar: 112, adjunto: 129, sobreaviso: [70, 67, 63, 60] },
  { data: "2026-10-27", grupo: "INDIA",    auxiliar: 136, adjunto: 137, sobreaviso: [141, 130, 94, 91] },
  { data: "2026-10-28", grupo: "JULIETT",  auxiliar: 145, adjunto: 150, sobreaviso: [61, 58, 37, 26] },
  { data: "2026-10-29", grupo: "KILO",     auxiliar: 193, adjunto: 198, sobreaviso: [69, 66, 49, 40] },
  { data: "2026-10-30", grupo: "LIMA",     auxiliar: 189, adjunto: 203, sobreaviso: [73, 68, 64, 53] },
  { data: "2026-10-31", grupo: "MIKE",     auxiliar: 149, adjunto: 165, sobreaviso: [71, 52, 55, 31] },
]

// Ajustes de leitura: em 02/10 o documento traz "15 FILLIPE PAIXÃO" — o 15 é TAYNÃ
// RAMALHO (que aparece em 09/10 sem número); FILLIPE PAIXÃO é o 35.
const FUNCOES_OUTUBRO_2026: DiaFuncoes[] = [
  { data: "2026-10-01", mestreCerimonia: 1,   leitorBI: 6,   discurso: 7,   comandante: 8 },
  { data: "2026-10-02", mestreCerimonia: 25,  leitorBI: 30,  discurso: 35,  comandante: 36 },
  { data: "2026-10-05", mestreCerimonia: 65,  leitorBI: 85,  discurso: 98,  comandante: 101 },
  { data: "2026-10-06", mestreCerimonia: 69,  leitorBI: 93,  discurso: 95,  comandante: 103 },
  { data: "2026-10-07", mestreCerimonia: 100, leitorBI: 106, discurso: 117, comandante: 127 },
  { data: "2026-10-08", mestreCerimonia: 120, leitorBI: 135, discurso: 139, comandante: 142 },
  { data: "2026-10-09", mestreCerimonia: 15,  leitorBI: 16,  discurso: 19,  comandante: 27 },
  { data: "2026-10-12", mestreCerimonia: 204, leitorBI: 208, discurso: 11,  comandante: 12 },
  { data: "2026-10-13", mestreCerimonia: 119, leitorBI: 132, discurso: 140, comandante: 155 },
  { data: "2026-10-14", mestreCerimonia: 114, leitorBI: 131, discurso: 134, comandante: 146 },
  { data: "2026-10-15", mestreCerimonia: 149, leitorBI: 165, discurso: 176, comandante: 214 },
  { data: "2026-10-16", mestreCerimonia: 152, leitorBI: 164, discurso: 168, comandante: 178 },
  { data: "2026-10-19", mestreCerimonia: 107, leitorBI: 113, discurso: 136, comandante: 137 },
  { data: "2026-10-20", mestreCerimonia: 33,  leitorBI: 72,  discurso: 82,  comandante: 86 },
  { data: "2026-10-21", mestreCerimonia: 166, leitorBI: 169, discurso: 171, comandante: 198 },
  { data: "2026-10-22", mestreCerimonia: 151, leitorBI: 160, discurso: 162, comandante: 189 },
  { data: "2026-10-23", mestreCerimonia: 216, leitorBI: 220, discurso: 221, comandante: 222 },
  { data: "2026-10-26", mestreCerimonia: 75,  leitorBI: 77,  discurso: 83,  comandante: 89 },
  { data: "2026-10-27", mestreCerimonia: 126, leitorBI: 133, discurso: 122, comandante: 124 },
  { data: "2026-10-28", mestreCerimonia: 91,  leitorBI: 94,  discurso: 96,  comandante: 104 },
  { data: "2026-10-29", mestreCerimonia: 179, leitorBI: 180, discurso: 188, comandante: 177 },
  { data: "2026-10-30", mestreCerimonia: 174, leitorBI: 175, discurso: 186, comandante: 167 },
]

const PN = "Pavilhão Nacional", CGH = "Comandante da Guarda de Honra", BPE = "Bandeira de Pernambuco"
const BCE = "Bandeira da Confederação do Equador", BAPMP = "Bandeira da APMP", PF = "Porta-flâmula", G = "Guarda"
const guarda = (data: string, pelotao: number, linhas: [number, string, string][]): DiaGuarda =>
  ({ data, pelotao, membros: linhas.map(([mat, nome, funcao]) => ({ mat, nome, funcao })) })

// Ajustes de leitura: em 21/10 o documento traz "06 GEORGE" (GEORGE é o 05 e é do
// 5º Pel; o 06 é CAMPOS, do 6º). Em 28/10, 186 SAMUEL SILVA aparece duas vezes
// (Bandeira da APMP e Guarda) — mantido como está no documento.
const GUARDA_OUTUBRO_2026: DiaGuarda[] = [
  guarda("2026-10-02", 6, [
    [18, "FERNANDA BISPO", PN], [52, "JAMILLE", CGH], [6, "CAMPOS", BPE], [176, "DIRLEYNNE ALVES", BCE],
    [162, "MARCONDES", BAPMP], [50, "ELDER FERREIRA", PF], [39, "CAETANO", G], [53, "PEDRO HENRIQUE", G],
    [69, "AUGUSTO", G], [89, "EWERTON FARIAS", G], [111, "ANDRÉ MARINHO", G], [135, "BELTRÃO", G],
    [142, "MAGALHÃES", G], [210, "ANDRÉ JÚNIOR", G],
  ]),
  guarda("2026-10-07", 1, [
    [165, "KEVIN GOMES", PN], [114, "JOSIANE FARIAS", CGH], [71, "LEIMIG", BPE], [76, "ARAÚJO JÚNIOR", BCE],
    [94, "ANDRÉ CARDOSO", BAPMP], [57, "CLEYTON", PF], [23, "RODOLFO MOURA", G], [37, "PABLO TORRES", G],
    [41, "ALAN SILVA", G], [45, "GABRIELE COSTA", G], [60, "JOÃO NUNES", G], [98, "JOSÉ MENEZES", G],
    [105, "LUCAS EDUARDO", G], [108, "LISANDRY", G],
  ]),
  guarda("2026-10-09", 2, [
    [101, "MATHEUS ALBUQUERQUE", PN], [145, "FRANCISCO VIEIRA", CGH], [62, "IDEYVISON", BPE], [56, "WESLEY BATISTA", BCE],
    [25, "CAROLINE QUEIROZ", BAPMP], [109, "LETÍCIA PINHEIRO", PF], [14, "WINNY", G], [20, "TIBÚRCIO", G],
    [28, "BRANDÃO", G], [30, "RODRIGUES", G], [73, "MILENE QUEIROZ", G], [83, "DIEGO SANTOS", G],
    [132, "CEZAR SANTOS", G], [171, "MAXWEL", G],
  ]),
  guarda("2026-10-14", 3, [
    [9, "VERAS", PN], [27, "CLÁUDIA", CGH], [122, "ANDREY", BPE], [200, "APOLLO", BCE],
    [202, "FERRAZ", BAPMP], [204, "AMANDA", PF], [1, "HELLTON FERNANDES", G], [15, "TAYNÃ RAMALHO", G],
    [21, "SAMPAIO", G], [31, "ROMÉRIO", G], [44, "DIOGO ARAÚJO", G], [66, "LUCAS MATEUS", G],
    [70, "LUCAS GABRIEL", G], [77, "FÁBIO", G],
  ]),
  guarda("2026-10-16", 4, [
    [129, "MARTINS", PN], [123, "BEATRIZ", CGH], [134, "SILVÂNIO SANTOS", BPE], [140, "RAIMUNDO", BCE],
    [147, "JANDERSON", BAPMP], [154, "TÂMARA LEMOS", PF], [159, "HIGOR LIMA", G], [160, "JONAS GOMES", G],
    [163, "ELIVELTON RODRIGUES", G], [177, "ROSÁRIO JÚNIOR", G], [179, "LEONARDO", G], [36, "MACÊDO JÚNIOR", G],
    [10, "ERICK", G], [32, "NAPOLEÃO", G],
  ]),
  guarda("2026-10-21", 5, [
    [110, "WESLEY HENRIQUE", PN], [161, "FELIPE GOMES", CGH], [38, "JOHN ALVES", BPE], [59, "ASSIS", BCE],
    [178, "GABRIEL SILVA", BAPMP], [68, "AMAURI", PF], [5, "GEORGE", G], [48, "LIMA", G],
    [97, "ROBERTO CAVALCANTE", G], [136, "RONIÉRISON BARROS", G], [138, "JANAÍNA", G], [184, "PAULO AZEVÊDO", G],
    [64, "EDUARDO", G], [190, "LARISSA ALCÂNTARA", G],
  ]),
  guarda("2026-10-23", 6, [
    [67, "BARBOSA", PN], [180, "DANTAS", CGH], [183, "LÉIA", BPE], [195, "JEFFERSON NUNES", BCE],
    [139, "GLEYDSON", BAPMP], [196, "EDUARDA", PF], [12, "MELO", G], [95, "ALEX SILVA", G],
    [100, "KARLA ALBUQUERQUE", G], [128, "MIGUEL", G], [151, "RAINY", G], [152, "LÉLIS", G],
    [158, "FELIPE OLIVEIRA", G], [189, "PAULO NASCIMENTO", G],
  ]),
  guarda("2026-10-28", 1, [
    [13, "JONAS", PN], [7, "ALDO SILVA", CGH], [19, "THAIS FIGUEIREDO", BPE], [174, "ALEXANDRE", BCE],
    [186, "SAMUEL SILVA", BAPMP], [167, "GUSTAVO NETO", PF], [191, "GOMES NASCIMENTO", G], [186, "SAMUEL SILVA", G],
    [153, "HUGO", G], [144, "SAMUEL SANTOS", G], [143, "VIDAL", G], [131, "JOSÉ INÁCIO", G],
    [106, "RAFAEL RIBEIRO", G], [208, "FABIANA", G],
  ]),
  guarda("2026-10-30", 2, [
    [119, "HEITOR", PN], [40, "ALMEIDA", CGH], [168, "MATHEUS SILVA", BPE], [8, "JEFFERSON FRANCISCO", BCE],
    [155, "VICTOR ALVES", BAPMP], [92, "MOACIR", PF], [35, "FILLIPE PAIXÃO", G], [115, "EDUARDO GONÇALVES", G],
    [117, "GUILHERME", G], [130, "IVALDO", G], [75, "JÚLIO CÉSAR", G], [199, "BARROS", G],
    [206, "CÉSAR", G], [207, "HOBERDAN", G],
  ]),
]

const DOCS_OUTUBRO_2026: DocEscala[] = [
  { titulo: "Escala de plantão 7x1", descricao: "Plantão, auxiliar, adjunto e sobreaviso — 07h às 07h (ajustada).", arquivo: "/escalas/outubro-2026-plantao-7x1.pdf" },
  { titulo: "Mapa de equipes", descricao: "Divisão das 8 equipes de plantão da 1ª Companhia.", arquivo: "/escalas/outubro-2026-mapa-equipes.pdf" },
  { titulo: "Funções de destaque", descricao: "Mestre de cerimônia, leitor de BI, discurso e comandante nas formaturas.", arquivo: "/escalas/outubro-2026-funcoes-destaque.pdf" },
  { titulo: "Guarda-Bandeira", descricao: "Funções nas formaturas gerais — 14 militares por formatura.", arquivo: "/escalas/outubro-2026-guarda-bandeira.pdf" },
]

// ═════════════════════════════════════════════════════════════
//  Meses publicados
// ═════════════════════════════════════════════════════════════

export type MesEscala = {
  chave: string
  rotulo: string
  /** primeiro e último dia do mês, ISO — delimita o período coberto */
  inicio: string
  fim: string
  mapa: MapaEquipes
  plantao: DiaPlantao[]
  funcoes: DiaFuncoes[]
  guarda: DiaGuarda[]
  obs: string[]
  docs: DocEscala[]
}

export const MESES_ESCALA: MesEscala[] = [
  {
    chave: "2026-09", rotulo: "Setembro / 2026", inicio: "2026-09-01", fim: "2026-09-30",
    mapa: MAPA_SETEMBRO_2026, plantao: PLANTAO_SETEMBRO_2026, funcoes: FUNCOES_SETEMBRO_2026,
    guarda: GUARDA_SETEMBRO_2026, obs: [OBS_ADVENTISTA], docs: DOCS_SETEMBRO_2026,
  },
  {
    chave: "2026-10", rotulo: "Outubro / 2026", inicio: "2026-10-01", fim: "2026-10-31",
    mapa: MAPA_OUTUBRO_2026, plantao: PLANTAO_OUTUBRO_2026, funcoes: FUNCOES_OUTUBRO_2026,
    guarda: GUARDA_OUTUBRO_2026, obs: [OBS_ADVENTISTA], docs: DOCS_OUTUBRO_2026,
  },
]

/** O mês que contém `hoje`, ou o mais recente publicado. */
export function mesVigente(hojeIso: string): MesEscala {
  return MESES_ESCALA.find(m => hojeIso >= m.inicio && hojeIso <= m.fim) ?? MESES_ESCALA[MESES_ESCALA.length - 1]
}

/** Mês publicado que contém a data (null se o mês ainda não foi publicado). */
export function mesDaData(iso: string): MesEscala | null {
  return MESES_ESCALA.find(m => iso >= m.inicio && iso <= m.fim) ?? null
}

// ── Dicionário matrícula → nome / equipe (mês mais recente vence) ──

const NOME_POR_MAT = new Map<number, string>()
for (const m of MESES_ESCALA) {
  for (const membros of Object.values(m.mapa)) for (const [mat, nome] of membros) NOME_POR_MAT.set(mat, nome)
  for (const g of m.guarda) for (const x of g.membros) if (!NOME_POR_MAT.has(x.mat)) NOME_POR_MAT.set(x.mat, x.nome)
}

/** Nome de guerra da matrícula nos documentos da CIA (null se não constar). */
export function nomeDaMatricula(mat: number): string | null {
  return NOME_POR_MAT.get(mat) ?? null
}

/** "108 LISANDRY" — ou só o número quando a matrícula não está nos documentos. */
export function rotuloMilitar(mat: number): string {
  const nome = NOME_POR_MAT.get(mat)
  return nome ? `${mat} ${nome}` : String(mat)
}

/** Equipe de plantão da matrícula no mapa do mês (padrão: mês vigente). */
export function grupoDaMatricula(mat: number, mes: MesEscala = MESES_ESCALA[MESES_ESCALA.length - 1]): Grupo | null {
  for (const [g, membros] of Object.entries(mes.mapa) as [Grupo, [number, string][]][]) {
    if (membros.some(([m]) => m === mat)) return g
  }
  return null
}

// ── Consultas por dia / por aluno ─────────────────────────────

export type EscalaDoDia = {
  data: string
  mes: MesEscala | null
  plantao: DiaPlantao | null
  /** efetivo da equipe de plantão (do mapa do mês) */
  equipe: [number, string][]
  funcoes: DiaFuncoes | null
  guarda: DiaGuarda | null
}

/** Tudo o que a escala da CIA marca para uma data ISO. */
export function escalaDoDia(iso: string): EscalaDoDia {
  const mes = mesDaData(iso)
  const plantao = mes?.plantao.find(p => p.data === iso) ?? null
  return {
    data: iso,
    mes,
    plantao,
    equipe: plantao?.grupo && mes ? mes.mapa[plantao.grupo] : [],
    funcoes: mes?.funcoes.find(f => f.data === iso) ?? null,
    guarda: mes?.guarda.find(g => g.data === iso) ?? null,
  }
}

export type CompromissoAluno = { data: string; tipo: "plantao" | "auxiliar" | "adjunto" | "sobreaviso" | "funcao" | "guarda"; descricao: string }

/** Todas as escalas de uma matrícula nos meses publicados, em ordem de data. */
export function compromissosDaMatricula(mat: number): CompromissoAluno[] {
  const out: CompromissoAluno[] = []
  for (const mes of MESES_ESCALA) {
    const grupo = grupoDaMatricula(mat, mes)
    for (const p of mes.plantao) {
      if (p.auxiliar === mat) out.push({ data: p.data, tipo: "auxiliar", descricao: "Auxiliar do Oficial de Dia" })
      else if (p.adjunto === mat) out.push({ data: p.data, tipo: "adjunto", descricao: "Adjunto ao Auxiliar do Oficial de Dia" })
      else if (grupo && p.grupo === grupo) out.push({ data: p.data, tipo: "plantao", descricao: `Plantão — equipe ${ROTULO_GRUPO[grupo]}` })
      if (p.sobreaviso.includes(mat)) out.push({ data: p.data, tipo: "sobreaviso", descricao: "Sobreaviso" })
    }
    for (const f of mes.funcoes) {
      for (const k of Object.keys(ROTULO_FUNCAO) as ChaveFuncao[]) {
        if (f[k] === mat) out.push({ data: f.data, tipo: "funcao", descricao: ROTULO_FUNCAO[k] })
      }
    }
    for (const g of mes.guarda) {
      const funcoes = [...new Set(g.membros.filter(x => x.mat === mat).map(x => x.funcao))]
      if (funcoes.length) out.push({ data: g.data, tipo: "guarda", descricao: `Guarda-Bandeira — ${funcoes.join(" / ")}` })
    }
  }
  return out.sort((a, b) => a.data.localeCompare(b.data))
}
