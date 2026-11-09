// Reta final do CFO 2026 (nov–dez/2026): textos a decorar para a formatura e a
// relação de material do MAPOM. Exibido em /mementos, na seção "Reta final".

export type TextoDecorar = {
  id: string
  titulo: string
  autoria?: string
  video?: string
  /** estrofes; cada uma é uma lista de versos */
  estrofes: { rotulo?: string; versos: string[] }[]
}

export const TEXTOS_DECORAR: TextoDecorar[] = [
  {
    id: "compromisso",
    titulo: "Compromisso do Aspirante-a-Oficial",
    autoria: "Prestado perante a Bandeira Nacional, ao fim do CFO",
    estrofes: [{
      versos: [
        "Ao ser declarado Aspirante-a-Oficial da Polícia Militar,",
        "assumo o compromisso de cumprir rigorosamente as ordens das autoridades a que estiver subordinado",
        "e de me dedicar inteiramente ao serviço policial-militar,",
        "à manutenção da ordem pública e à segurança da comunidade,",
        "mesmo com o risco da própria vida.",
      ],
    }],
  },
  {
    id: "cancao-aspirante",
    titulo: "Canção do Aspirante da PMPE",
    autoria: "Letra e música do Maj QOPM Mat. 950690-0 Lucas de Lima Noberto",
    video: "https://www.youtube.com/watch?v=f4dJ3jpgMcE",
    estrofes: [
      { rotulo: "I", versos: [
        "Após dias de lutas e glórias",
        "Com vigor o caminho trilhei",
        "Já vislumbro o brilho celeste",
        "Da estrela que em breve terei",
      ] },
      { rotulo: "Refrão", versos: [
        "Quão sublime será o momento",
        "Da espada luzente abater",
        "Mediante o brado solene",
        "Aspirantes lutar e vencer",
      ] },
      { rotulo: "II", versos: [
        "Ao deixar esta Academia",
        "Mil lembranças comigo levarei",
        "Pois aqui nesta casa de ensino",
        "Fui forjado um infante da lei",
      ] },
      { rotulo: "III", versos: [
        "Ei-nos todos, unidos, formados",
        "Ostentando com garbo a missão",
        "Que este povo gentil nos outorga",
        "De lutar pela nossa nação",
      ] },
    ],
  },
  {
    id: "oracao-caatinga",
    titulo: "Oração do Guerreiro de Caatinga",
    autoria: "Exército Brasileiro",
    video: "https://www.youtube.com/watch?v=x5KX9ZoHWO4",
    estrofes: [{
      versos: [
        "Senhor!",
        "Vós que fostes sábio ao criar os rios e os mares",
        "Pareceis ter esquecido do nosso sertão",
        "Vós que destes aos homens a terra para dela tudo tirar",
        "Não nos destes a mesma sorte",
        "Porém hoje, ó Deus",
        "Vejo quão generoso fostes",
        "A nós guerreiros de Caatinga",
        "Deste-nos a resistência ao Sol",
        "A sapiência para da natureza tudo aproveitar",
        "A força de vontade para continuar a lutar",
        "E ante o inimigo jamais recuar",
        "Obrigado, Senhor Deus",
        "Porque criastes um ambiente",
        "Onde um ser humano comum não possa sobreviver",
        "Pois só os perseverantes",
        "E os fortes de espírito",
        "Aqui conseguem lutar",
        "Brasil!",
        "Caatinga!",
      ],
    }],
  },
]

// Relação de material do MAPOM (Manobras Acadêmicas Policiais Militares) — CFO PMPE 2026.
// Transcrita do PDF divulgado à turma (public/mapom/relacao-material-mapom-2026.pdf).
export const PDF_MATERIAL_MAPOM = "/mapom/relacao-material-mapom-2026.pdf"

export type ItemMapom = { n: string; item: string; detalhe?: string }

export const MATERIAL_MAPOM_INDIVIDUAL: ItemMapom[] = [
  { n: "1", item: "Fuzil Mosquefal", detalhe: "a cargo da APMP · com numeração 10x10" },
  { n: "2", item: "Mochila de combate (média ou grande)", detalhe: "a cargo da APMP · com numeração 10x10" },
  { n: "3", item: "Cinto de guarnição", detalhe: "preto · identificado" },
  { n: "4", item: "Coldre de perna para pistola", detalhe: "preto · identificado" },
  { n: "5", item: "Porta-carregador duplo de pistola", detalhe: "preto · identificado" },
  { n: "6", item: "Porta-cantil", detalhe: "preto · identificado" },
  { n: "7", item: "Cantil para água", detalhe: "preto · identificado" },
  { n: "8", item: "Bainha para facão 14 polegadas", detalhe: "preta · identificada" },
  { n: "9", item: "Facão (terçado) 14 polegadas", detalhe: "identificado" },
  { n: "10", item: "Uniforme de combate (calça, gandola e camisa interna)", detalhe: "a cargo da APMP · numeração 10x10 na gandola e na calça" },
  { n: "11", item: "Coturnos (par)", detalhe: "pretos · identificados" },
  { n: "12", item: "Cobertura tipo caçador", detalhe: "preta · numeração 10x10" },
  { n: "13", item: "Uniforme de TFM (calção e camisa)", detalhe: "a cargo da APMP · identificado" },
  { n: "14", item: "Uniforme de contato", detalhe: "calça jeans azul e camisa branca · identificado" },
  { n: "15", item: "Tênis (par)", detalhe: "preto · identificado" },
  { n: "16", item: "Sandálias (par)", detalhe: "pretas · identificadas" },
  { n: "17", item: "2 pares de meias", detalhe: "pretas · identificadas" },
  { n: "18", item: "Calção de compressão (short térmico)", detalhe: "preto · identificado" },
  { n: "19", item: "Manta EVA impermeabilizante 0,60 x 1,80 m", detalhe: "preta · numeração 10x10" },
  { n: "20", item: "Lona plástica (lona de cadáver) 2 x 2 m", detalhe: "preta · numeração 10x10" },
  { n: "21", item: "Copo para cantil", detalhe: "prata/cinza · numeração 10x10" },
  { n: "22", item: "Talher articulado", detalhe: "prata/cinza · identificado" },
  { n: "23", item: "Sacos de gelo P, M e G", detalhe: "transparentes · para acondicionar os kits na mochila" },
  { n: "24", item: "2 cialumes", detalhe: "verdes · orientação noturna" },
  { n: "25", item: "Esparadrapos enumerados 10x10", detalhe: "letras pretas em esparadrapo branco · para identificar os materiais" },
  { n: "26", item: "20 tiras de borracha (tamanhos diversos)", detalhe: "pretas · para aduchar os kits" },
  { n: "27", item: "Kit de higiene pessoal", detalhe: "pote preto identificado: escova e creme dental; aparelho e creme de barbear; fio dental; espelho e toalha pequenos; sabão de enxofre; papel higiênico ou lenço umedecido" },
  { n: "28", item: "Kit de limpeza de coturno e costura", detalhe: "pote preto identificado: graxa preta; escova; agulha, linha e botões" },
  { n: "29", item: "Kit de limpeza de armamento", detalhe: "pote preto identificado: flanela; óleo lubrificante; pincel; cordel para o cano; escova pequena; flanela laranja para as peças; lixa d'água 120 para o terçado; pedra de amolar" },
  { n: "30", item: "Kit de primeiros socorros", detalhe: "pote preto identificado: luvas de procedimento; esparadrapo; curativo band-aid; tesoura pequena; gaze; algodão; pinça; álcool em gel; atadura pequena" },
  { n: "31", item: "Kit de anotação", detalhe: "pote preto identificado: caderneta impermeável e caneta de retroprojetor" },
  { n: "32", item: "Kit de sobrevivência", detalhe: "pote preto identificado: lanterna pequena com pilhas; pederneira; isqueiro; pastilha de álcool; cialume" },
  { n: "33", item: "Kit diversos", detalhe: "pote preto identificado · a critério de cada aluno" },
  { n: "35", item: "Óculos de proteção", detalhe: "transparentes · identificados" },
]

export const MATERIAL_MAPOM_COLETIVO: ItemMapom[] = [
  { n: "C1", item: "Flâmula da CIA ou do pelotão", detalhe: "padrão APMP · para o fuzil do pelotão" },
  { n: "C2", item: "Bandeira do Brasil 80 x 110 cm", detalhe: "hasteamento diário" },
  { n: "C3", item: "Bandeira de Pernambuco 80 x 110 cm", detalhe: "hasteamento diário" },
  { n: "C4", item: "Bandeira da APMP 80 x 110 cm", detalhe: "hasteamento diário" },
]
