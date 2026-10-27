// Áreas Integradas de Segurança (AIS) de Pernambuco — transcrição do "Mapa da Divisão
// Territorial das Áreas Integradas de Segurança de Pernambuco" (SDS, banner v4).
// Fontes do mapa: composição das AIS — Portaria GAB/SDS nº 1.197/2010 (Anexo I) e alterações;
// unidades — banner SDS/GACE; limites municipais — IBGE.
// Municípios de cada AIS: lidos do próprio mapa (cor do polígono municipal), ver lib/ais-mapa.ts.

export const FONTE_AIS = "Mapa da Divisão Territorial das AIS de Pernambuco — SDS/PE (Portaria GAB/SDS nº 1.197/2010, Anexo I, e alterações)"

// No mapa, as AIS 1 a 5 (Recife) aparecem como uma única mancha.
export type IdAIS = "1-5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26"
export type IdDiretoria = "DIM" | "DINTER 1" | "DINTER 2"
export type Regiao = "Grande Recife" | "Zona da Mata" | "Agreste" | "Sertão"

export type Diretoria = { id: IdDiretoria; nome: string; resumo: string; cor: string; especializadas: string[] }

export const DIRETORIAS: Diretoria[] = [
  {
    id: "DIM", nome: "Diretoria Integrada Metropolitana", resumo: "10 Áreas · 12 Batalhões", cor: "#1f8a4c",
    especializadas: [
      "SDS: GTA (Recife).",
      "PM: BOPE · BPChoque · BPRv · 1º BPTran · BPRP · RPMon · BPGd · CIPCães · CIPMoto · CIPOMA (sedes no Recife, AIS 1 a 5).",
      "PM: CIATur · CIPOMA (Fernando de Noronha).",
      "PC: DENARC · DEPATRI · DHPP · DPMUL · DPCA · DRACO · DPH (AIS 1 a 5); DEAM (Prazeres, Paulista e Cabo) · DENARC (Cabo) · DPH (Paulista, Olinda, S. Lourenço, Jaboatão, Cabo e Ipojuca) · 36ª DP (Fernando de Noronha).",
      "Bombeiros: Grupamento de Bombeiros de Fernando de Noronha.",
    ],
  },
  {
    id: "DINTER 1", nome: "Diretoria Integrada do Interior I", resumo: "8 Áreas · 8 Batalhões e 6 CIPM", cor: "#2457b5",
    especializadas: [
      "SDS: GTA (Caruaru).",
      "PM: 1º BIEsp · GTA (Caruaru).",
      "PC: DENARC e DEAM (Caruaru, Surubim, Goiana, Garanhuns e Vitória) · DPH (Goiana, Vitória, Palmares, Caruaru, Sta. Cruz e Garanhuns).",
    ],
  },
  {
    id: "DINTER 2", nome: "Diretoria Integrada do Interior II", resumo: "8 Áreas · 8 Batalhões e 5 CIPM", cor: "#b3262e",
    especializadas: [
      "SDS: GTA (Serra Talhada) · GTA (Petrolina).",
      "PM: 2º BIEsp (Petrolina) · BEPI (Custódia).",
      "PC: DEAM (Petrolina e Afogados da Ingazeira) · DENARC (Arcoverde, Serra Talhada, Ouricuri e Petrolina) · DPH (Arcoverde, Araripina e Petrolina).",
    ],
  },
]

// Uma linha da tabela "Áreas Integradas" do mapa.
export type AreaIntegrada = {
  numero: number
  civil: string        // Delegacia Seccional
  militar: string[]    // Batalhões / CIPM (sigla como no portal: "16º BPM")
  bombeiro: string
  cientifica?: string
}

export type AIS = {
  id: IdAIS
  rotulo: string       // "AIS 14"
  nome: string         // nome no mapa
  diretoria: IdDiretoria
  regiao: Regiao
  cor: string          // cor da área no mapa original
  areas: AreaIntegrada[]
}

export const AIS_PE: AIS[] = [
  {
    id: "1-5", rotulo: "AIS 1 a 5", nome: "Recife (Capital)", diretoria: "DIM", regiao: "Grande Recife", cor: "#f2c9cf",
    areas: [
      { numero: 1, civil: "1ª DESEC", militar: ["16º BPM", "CIATur"], bombeiro: "QCG/GBI-2ºSB/GBMAR-2ºSB", cientifica: "IML/APC · IITB · ICPAS" },
      { numero: 2, civil: "2ª DESEC", militar: ["13º BPM"], bombeiro: "—" },
      { numero: 3, civil: "3ª DESEC", militar: ["19º BPM"], bombeiro: "GBI/4ºSB-Aeroporto" },
      { numero: 4, civil: "4ª DESEC", militar: ["12º BPM"], bombeiro: "—" },
      { numero: 5, civil: "5ª DESEC", militar: ["11º BPM"], bombeiro: "—" },
    ],
  },
  { id: "6", rotulo: "AIS 6", nome: "Jaboatão dos Guararapes", diretoria: "DIM", regiao: "Grande Recife", cor: "#b7dfa8",
    areas: [{ numero: 6, civil: "6ª DESEC", militar: ["6º BPM", "25º BPM"], bombeiro: "GBI-1ºSB-Prazeres/GBMAR", cientifica: "IML-Jaboatão / IGFEC" }] },
  { id: "7", rotulo: "AIS 7", nome: "Olinda", diretoria: "DIM", regiao: "Grande Recife", cor: "#f5e4a3",
    areas: [{ numero: 7, civil: "7ª DESEC", militar: ["1º BPM", "CIATur"], bombeiro: "GBAPH-Olinda" }] },
  { id: "8", rotulo: "AIS 8", nome: "Paulista", diretoria: "DIM", regiao: "Grande Recife", cor: "#bcd8f2",
    areas: [{ numero: 8, civil: "8ª DESEC", militar: ["17º BPM", "26º BPM"], bombeiro: "GBS-Abreu e Lima/GBAPH-2ºSB-Igarassu", cientifica: "IML-Paulista" }] },
  { id: "9", rotulo: "AIS 9", nome: "São Lourenço da Mata", diretoria: "DIM", regiao: "Grande Recife", cor: "#e2c6e6",
    areas: [{ numero: 9, civil: "9ª DESEC", militar: ["20º BPM"], bombeiro: "GBAPH-3ºSB-São L. da Mata" }] },
  { id: "10", rotulo: "AIS 10", nome: "Cabo de Sto. Agostinho", diretoria: "DIM", regiao: "Grande Recife", cor: "#d9d0c4",
    areas: [{ numero: 10, civil: "10ª DESEC", militar: ["18º BPM"], bombeiro: "GBI-3ºSB-Ipojuca (Suape)" }] },

  { id: "11", rotulo: "AIS 11", nome: "Mata Norte", diretoria: "DINTER 1", regiao: "Zona da Mata", cor: "#ece79a",
    areas: [{ numero: 11, civil: "11ª DESEC", militar: ["2º BPM", "3ª CIPM"], bombeiro: "7ºGB-Carpina/2ºSB-Goiana", cientifica: "URPOC-Mata Norte" }] },
  { id: "12", rotulo: "AIS 12", nome: "Mata Sul", diretoria: "DINTER 1", regiao: "Zona da Mata", cor: "#e8c29d",
    areas: [{ numero: 12, civil: "12ª DESEC", militar: ["21º BPM", "5ª CIPM"], bombeiro: "1ºGB-Vitória de Sto. Antão/CAT/2ºSB-Gravatá" }] },
  { id: "13", rotulo: "AIS 13", nome: "Mata Sul", diretoria: "DINTER 1", regiao: "Zona da Mata", cor: "#a9d896",
    areas: [{ numero: 13, civil: "13ª DESEC", militar: ["10º BPM", "10ª CIPM"], bombeiro: "1ºGB-2ºSB-Palmares", cientifica: "URPOC-Mata Sul" }] },
  { id: "14", rotulo: "AIS 14", nome: "Caruaru", diretoria: "DINTER 1", regiao: "Agreste", cor: "#8fb3e8",
    areas: [{ numero: 14, civil: "14ª DESEC", militar: ["4º BPM"], bombeiro: "2ºGB-Caruaru/CAT/2ºSB-Bezerros/5ºSB-Bonito", cientifica: "URPOC-Agreste Central" }] },
  { id: "15", rotulo: "AIS 15", nome: "Belo Jardim", diretoria: "DINTER 1", regiao: "Agreste", cor: "#c3a2e3",
    areas: [{ numero: 15, civil: "15ª DESEC", militar: ["15º BPM", "8ª CIPM"], bombeiro: "2ºGB-3ºSB-Belo Jardim/4ºSB-Pesqueira" }] },
  { id: "16", rotulo: "AIS 16", nome: "Limoeiro", diretoria: "DINTER 1", regiao: "Agreste", cor: "#ee9da1",
    areas: [{ numero: 16, civil: "16ª DESEC", militar: ["22º BPM", "6ª CIPM"], bombeiro: "8ºGB-Surubim/CAT" }] },
  { id: "17", rotulo: "AIS 17", nome: "Santa Cruz do Capibaribe", diretoria: "DINTER 1", regiao: "Agreste", cor: "#efdcd3",
    areas: [{ numero: 17, civil: "17ª DESEC", militar: ["24º BPM"], bombeiro: "8ºGB-2ºSB-Sta. Cruz do Capibaribe/3ºSB-Toritama" }] },
  { id: "18", rotulo: "AIS 18", nome: "Garanhuns", diretoria: "DINTER 1", regiao: "Agreste", cor: "#e8cf7e",
    areas: [{ numero: 18, civil: "18ª DESEC", militar: ["9º BPM", "11ª CIPM"], bombeiro: "6ºGB-Garanhuns/CAT/2ºSB-Bom Conselho", cientifica: "URPOC-Agreste Meridional" }] },

  { id: "19", rotulo: "AIS 19", nome: "Arcoverde", diretoria: "DINTER 2", regiao: "Sertão", cor: "#cfe9f2",
    areas: [{ numero: 19, civil: "19ª DESEC", militar: ["3º BPM"], bombeiro: "9ºGB-Arcoverde/CAT", cientifica: "URPOC-Sertão do Moxotó" }] },
  { id: "20", rotulo: "AIS 20", nome: "Afogados da Ingazeira", diretoria: "DINTER 2", regiao: "Sertão", cor: "#9fd3c5",
    areas: [{ numero: 20, civil: "20ª DESEC", militar: ["23º BPM"], bombeiro: "3ºGB-2ºSB-Afogados da Ingazeira/3ºSB-S. J. do Egito", cientifica: "URPOC-Sertão do Pajeú" }] },
  { id: "21", rotulo: "AIS 21", nome: "Serra Talhada", diretoria: "DINTER 2", regiao: "Sertão", cor: "#cdb6ea",
    areas: [{ numero: 21, civil: "21ª DESEC", militar: ["14º BPM"], bombeiro: "3ºGB-Serra Talhada/CAT/4ºSB-S. J. do Belmonte" }] },
  { id: "22", rotulo: "AIS 22", nome: "Belém de São Francisco", diretoria: "DINTER 2", regiao: "Sertão", cor: "#f0a37c",
    areas: [{ numero: 22, civil: "22ª DESEC", militar: ["1ª CIPM", "4ª CIPM"], bombeiro: "11ºGB-Petrolândia/CAT" }] },
  { id: "23", rotulo: "AIS 23", nome: "Salgueiro", diretoria: "DINTER 2", regiao: "Sertão", cor: "#f3cb98",
    areas: [{ numero: 23, civil: "23ª DESEC", militar: ["8º BPM"], bombeiro: "5ºGB-Salgueiro/CAT", cientifica: "URPOC-Sertão Setentrional" }] },
  { id: "24", rotulo: "AIS 24", nome: "Ouricuri", diretoria: "DINTER 2", regiao: "Sertão", cor: "#f0a9b6",
    areas: [{ numero: 24, civil: "24ª DESEC", militar: ["7º BPM", "9ª CIPM"], bombeiro: "10ºGB-Araripina/2ºSB-Ouricuri/CAT", cientifica: "URPOC-Sertão do Araripe" }] },
  { id: "25", rotulo: "AIS 25", nome: "Santa Maria da Boa Vista", diretoria: "DINTER 2", regiao: "Sertão", cor: "#93c4e3",
    areas: [{ numero: 25, civil: "25ª DESEC", militar: ["2ª CIPM", "7ª CIPM"], bombeiro: "4ºGB-2ºSB-Sta. Maria da Boa Vista" }] },
  { id: "26", rotulo: "AIS 26", nome: "Petrolina", diretoria: "DINTER 2", regiao: "Sertão", cor: "#a3da92",
    areas: [{ numero: 26, civil: "26ª DESEC", militar: ["5º BPM"], bombeiro: "4ºGB-Petrolina/CAT", cientifica: "URPOC-Sertão do São Francisco" }] },
]

export const REGIOES: Regiao[] = ["Grande Recife", "Zona da Mata", "Agreste", "Sertão"]

// Unidades prisionais da SERES (numeração do mapa) e a AIS do município onde ficam.
export type UnidadePrisional = { n: number; nome: string; municipio: string; ais: IdAIS }
export const UNIDADES_PRISIONAIS: UnidadePrisional[] = [
  { n: 1, nome: "Colônia Penal Feminina de Abreu e Lima", municipio: "Abreu e Lima", ais: "8" },
  { n: 2, nome: "Centro de Observação Criminológica e Triagem Prof. Everardo Luna", municipio: "Abreu e Lima", ais: "8" },
  { n: 3, nome: "Centro de Reeducação da Polícia Militar", municipio: "Abreu e Lima", ais: "8" },
  { n: 4, nome: "Penitenciária Professor Barreto Campelo", municipio: "Ilha de Itamaracá", ais: "8" },
  { n: 5, nome: "Presídio Professor Aníbal Bruno", municipio: "Recife", ais: "1-5" },
  { n: 6, nome: "Penitenciária Agroindustrial São João", municipio: "Ilha de Itamaracá", ais: "8" },
  { n: 7, nome: "Hospital de Custódia e Tratamento Psiquiátrico", municipio: "Ilha de Itamaracá", ais: "8" },
  { n: 8, nome: "Colônia Penal Feminina do Recife / Bom Pastor", municipio: "Recife", ais: "1-5" },
  { n: 9, nome: "Presídio de Vitória de Santo Antão", municipio: "Vitória de Santo Antão", ais: "12" },
  { n: 10, nome: "Penitenciária Dr. Ênio Pessoa Guerra", municipio: "Limoeiro", ais: "16" },
  { n: 11, nome: "Presídio Rorenildo da Rocha Leão", municipio: "Palmares", ais: "13" },
  { n: 12, nome: "Centro de Ressocialização do Agreste", municipio: "Canhotinho", ais: "18" },
  { n: 13, nome: "Penitenciária Juiz Plácido de Souza", municipio: "Caruaru", ais: "14" },
  { n: 14, nome: "Colônia Penal Feminina de Buíque", municipio: "Buíque", ais: "19" },
  { n: 15, nome: "Presídio Advogado Brito Alves", municipio: "Arcoverde", ais: "19" },
  { n: 16, nome: "Presídio Desembargador Augusto Duque", municipio: "Pesqueira", ais: "15" },
  { n: 17, nome: "Presídio Regional de Salgueiro", municipio: "Salgueiro", ais: "23" },
  { n: 18, nome: "Penitenciária Dr. Edvaldo Gomes", municipio: "Petrolina", ais: "26" },
]

// Fernando de Noronha: Área Integrada de Segurança Especial (fora do mapa continental).
export const NORONHA = { nome: "Fernando de Noronha", resumo: "Área Integrada de Segurança Especial", unidades: "CIPOMA · CIATur · 36ª DP · GB Noronha" }

// Batalhões da escolha (lib/batalhoes-base.ts) que não aparecem pela sigla no mapa.
// O BPTur tem sede no Varadouro (Olinda, AIS 7); o mapa lista o policiamento turístico como CIATur (Áreas 1 e 7).
export const AIS_EXTRA: Record<string, IdAIS> = { "BPTur": "7" }

export const aisDoBatalhao = (sigla: string): IdAIS | null =>
  AIS_EXTRA[sigla] ?? AIS_PE.find(a => a.areas.some(r => r.militar.includes(sigla)))?.id ?? null
