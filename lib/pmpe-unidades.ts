// Unidades da PMPE com localização no mapa das AIS (lib/ais-mapa.ts).
// Endereços, telefones e missões: site oficial da PMPE — página "Unidades operacionais"
// (https://www.pm.pe.gov.br/unidades-operacionais-2/) e a página de cada unidade.
// Batalhões da escolha: endereços de lib/batalhoes-base.ts.
// x, y: coordenadas do mapa, a partir de geocodificação do endereço (OpenStreetMap)
// projetada com o mesmo ajuste dos municípios do IBGE; cada ponto foi conferido dentro do seu município.

export const FONTE_UNIDADES = "Site oficial da PMPE (pm.pe.gov.br) — Unidades operacionais e páginas das unidades"
const SITE = "https://www.pm.pe.gov.br"

export type TipoUnidade = "comando" | "especializada" | "batalhao"
export type UnidadeMapa = {
  id: string
  sigla: string
  nome: string
  tipo: TipoUnidade
  municipio: string
  endereco?: string
  telefone?: string
  missao?: string        // texto da página oficial da unidade (quando há)
  url?: string           // página oficial
  slug?: string          // ficha do portal (batalhões da escolha)
  x: number; y: number
}

export const TIPOS_UNIDADE: { id: TipoUnidade; rot: string; cor: string }[] = [
  { id: "batalhao", rot: "Batalhões da escolha", cor: "#3a4a3a" },
  { id: "especializada", rot: "Especializadas", cor: "#7a2e2e" },
  { id: "comando", rot: "Comando e diretorias", cor: "#b5933f" },
]

export const UNIDADES_MAPA: UnidadeMapa[] = [
  // ── Comando e diretorias ──
  { id: "qcg", sigla: "QCG", nome: "Quartel do Comando Geral", tipo: "comando", municipio: "Recife",
    endereco: "Rua Amaro Bezerra, 300, Derby, Recife", telefone: "(81) 3181-1173",
    missao: "Sede do Comando Geral da PMPE. Também abriga a DIM (Diretoria Integrada Metropolitana) e a DIRESP (Diretoria Integrada Especializada).",
    url: SITE, x: 982.81, y: 151.23 },
  { id: "dinter1", sigla: "DINTER 1", nome: "Diretoria Integrada do Interior 1", tipo: "comando", municipio: "Caruaru",
    endereco: "Av. Campina Grande, 251, Boa Vista, Caruaru", telefone: "(81) 3719-9129",
    missao: "Coordena os batalhões e companhias das AIS 11 a 18 (Zona da Mata e Agreste).", url: `${SITE}/dinter-1/`, x: 817.87, y: 176.74 },
  { id: "dinter2", sigla: "DINTER 2", nome: "Diretoria Integrada do Interior 2", tipo: "comando", municipio: "Serra Talhada",
    endereco: "Rua Cel. Cornélio Soares, 651, Centro, Serra Talhada", telefone: "(87) 3831-9237",
    missao: "Coordena os batalhões e companhias das AIS 19 a 26 (Sertão). Tem anexo em Petrolina.", url: `${SITE}/dinter-2/`, x: 467.1, y: 118.72 },
  { id: "dinter2-anexo", sigla: "DINTER 2 (anexo)", nome: "Anexo da Diretoria Integrada do Interior 2", tipo: "comando", municipio: "Petrolina",
    endereco: "Av. Cardoso de Sá, s/n, Vila Eduardo, Petrolina", telefone: "(87) 3866-6202", url: `${SITE}/dinter-2/`, x: 125, y: 327.29 },

  // ── Especializadas (DIRESP) ──
  { id: "bope", sigla: "BOPE", nome: "Batalhão de Operações Especiais", tipo: "especializada", municipio: "Recife",
    endereco: "Av. Recife, 7000, Jiquiá/Estância, Recife", telefone: "(81) 3181-1850",
    missao: "Tropa de valor estratégico e tático da PMPE: resgate de reféns, captura de criminosos fortemente armados e entrincheirados, escolta de autoridades e de presos de alta periculosidade.",
    url: `${SITE}/bope/`, x: 978.01, y: 156.07 },
  { id: "bpchoque", sigla: "BPChoque", nome: "Batalhão de Polícia de Choque (Batalhão Matias de Albuquerque)", tipo: "especializada", municipio: "Recife",
    endereco: "Rua Benfica, 198, Madalena, Recife", telefone: "(81) 3181-1920",
    missao: "Unidade de elite treinada para atuar em eventos com multidões: estádios, shows, presídios e operações especiais.",
    url: `${SITE}/bpchoque/`, x: 982.68, y: 151.92 },
  { id: "bprp", sigla: "BPRP", nome: "Batalhão de Polícia de Radiopatrulha", tipo: "especializada", municipio: "Recife",
    endereco: "Rua Dom Bosco, 1002, Boa Vista, Recife", telefone: "(81) 3181-1900",
    missao: "Recobrimento de todas as áreas da Região Metropolitana, em apoio às unidades de área, com foco nas AIS 6, 8 e 10.",
    url: `${SITE}/bprp/`, x: 983.67, y: 151.51 },
  { id: "rpmon", sigla: "RPMon", nome: "Regimento de Polícia Montada Dias Cardoso", tipo: "especializada", municipio: "Recife",
    endereco: "Av. Gal. San Martin, 1775, San Martin, Recife", telefone: "(81) 3181-1740",
    missao: "Policiamento montado em locais de difícil acesso, também à noite, e controle de distúrbios civis.",
    url: `${SITE}/rpmon/`, x: 979, y: 151.8 },
  { id: "bpgd", sigla: "BPGd", nome: "Batalhão de Polícia de Guarda Paulo Guerra", tipo: "especializada", municipio: "Recife",
    endereco: "Praça da República, s/n, Santo Antônio, Recife", telefone: "(81) 3181-1760",
    missao: "Segurança do Palácio do Campo das Princesas e segurança externa dos presídios da Região Metropolitana.",
    url: `${SITE}/bpgd/`, x: 986.29, y: 152.27 },
  { id: "bprv", sigla: "BPRv", nome: "Batalhão de Polícia Rodoviária", tipo: "especializada", municipio: "Recife",
    endereco: "Rua 15 de Março, s/n, San Martin, Recife", telefone: "(81) 3181-3620", url: `${SITE}/bprv/`, x: 978.25, y: 152.15 },
  { id: "bptran", sigla: "1º BPTran", nome: "Batalhão de Trânsito Felipe Camarão", tipo: "especializada", municipio: "Recife",
    endereco: "Rua Arsênio Calaça, 600, San Martin, Recife", telefone: "(81) 3181-3680", url: `${SITE}/bptran/`, x: 978.35, y: 152.59 },
  { id: "cipcaes", sigla: "CIPCães", nome: "Companhia Independente de Policiamento com Cães", tipo: "especializada", municipio: "Recife",
    endereco: "Av. Hidelbrando Vasconcelos, s/n, Dois Unidos, Recife", telefone: "(81) 3181-3640",
    missao: "Policiamento ostensivo com cães em ações de choque e no combate ao terrorismo e ao narcotráfico.",
    url: `${SITE}/cipcaes/`, x: 982.96, y: 142.57 },
  { id: "cipmoto", sigla: "CIPMoto", nome: "Companhia Independente de Policiamento com Motocicleta", tipo: "especializada", municipio: "Recife",
    endereco: "Travessa do Gaspar, 1600-B, São José, Recife", telefone: "(81) 3181-3674", url: `${SITE}/cipmoto/`, x: 983.38, y: 154.58 },
  { id: "ciatur", sigla: "CIATur", nome: "Companhia Independente de Apoio ao Turista", tipo: "especializada", municipio: "Olinda",
    endereco: "Praça do Carmo, 85, Carmo, Olinda", url: `${SITE}/ciatur/`, x: 990.96, y: 145.44 },
  { id: "cipoma", sigla: "CIPOMA", nome: "Companhia Independente de Policiamento do Meio Ambiente", tipo: "especializada", municipio: "Igarassu",
    endereco: "Rua do Cajá, s/n, Cruz de Rebouças, Igarassu", telefone: "(81) 3181-1700",
    missao: "Policiamento ostensivo para preservar o meio ambiente em todo o Estado e no arquipélago de Fernando de Noronha.",
    url: `${SITE}/cipoma/`, x: 982.54, y: 121.71 },
  { id: "bepi", sigla: "BEPI", nome: "Batalhão Especializado de Policiamento do Interior", tipo: "especializada", municipio: "Custódia",
    endereco: "Rua José Thomais, 800, Mandacaru, Custódia", telefone: "(87) 3848-3908", url: `${SITE}/bepi/`, x: 568.17, y: 137.63 },
  { id: "1biesp", sigla: "1º BIEsp", nome: "Batalhão Integrado Especializado Cel. Roberto de Carvalho Moura e Silva", tipo: "especializada", municipio: "Caruaru",
    endereco: "Rua Assunção, 38, Caiucá, Caruaru", telefone: "(81) 3719-9214",
    missao: "Policiamento especializado no combate à criminalidade com ROCAM, radiopatrulha, choque, cães e trânsito.",
    url: `${SITE}/1biesp/`, x: 816.49, y: 179.81 },
  { id: "2biesp", sigla: "2º BIEsp", nome: "Batalhão Integrado Especializado Major PM Optato Gueiros", tipo: "especializada", municipio: "Petrolina",
    endereco: "Av. Anízio Moura Leal, 27, Ceap, km 2, Petrolina", telefone: "(87) 3866-6210", url: `${SITE}/2biesp/`, x: 123.92, y: 323.82 },

  // ── Batalhões da escolha (fichas no portal) ──
  { id: "1bpm", sigla: "1º BPM", nome: "Batalhão Duarte Coelho", tipo: "batalhao", slug: "1bpm", municipio: "Olinda", x: 991.6, y: 139.3 },
  { id: "6bpm", sigla: "6º BPM", nome: "Batalhão Henrique Dias", tipo: "batalhao", slug: "6bpm", municipio: "Jaboatão dos Guararapes", x: 977.91, y: 167.86 },
  { id: "11bpm", sigla: "11º BPM", nome: "Batalhão 17 de Agosto", tipo: "batalhao", slug: "11bpm", municipio: "Recife", x: 977.83, y: 145.43 },
  { id: "12bpm", sigla: "12º BPM", nome: "Batalhão Arraial Novo do Bom Jesus", tipo: "batalhao", slug: "12bpm", municipio: "Recife", x: 973.76, y: 149.55 },
  { id: "13bpm", sigla: "13º BPM", nome: "Batalhão Cel. PM João Nunes", tipo: "batalhao", slug: "13bpm", municipio: "Recife", x: 986.14, y: 148.75 },
  { id: "16bpm", sigla: "16º BPM", nome: "Batalhão Frei Caneca", tipo: "batalhao", slug: "16bpm", municipio: "Recife", x: 986.57, y: 153.72 },
  { id: "17bpm", sigla: "17º BPM", nome: "Batalhão Gen. Abreu e Lima", tipo: "batalhao", slug: "17bpm", municipio: "Paulista", x: 985.38, y: 133.1 },
  { id: "18bpm", sigla: "18º BPM", nome: "Batalhão Cel. Agenor Cavalcanti", tipo: "batalhao", slug: "18bpm", municipio: "Cabo de Santo Agostinho", x: 959.84, y: 187.82 },
  { id: "19bpm", sigla: "19º BPM", nome: "Batalhão André Vidal de Negreiros", tipo: "batalhao", slug: "19bpm", municipio: "Recife", x: 984.49, y: 156.35 },
  { id: "20bpm", sigla: "20º BPM", nome: "Batalhão Cel. PM Olinto de Melo Viana", tipo: "batalhao", slug: "20bpm", municipio: "São Lourenço da Mata", x: 960.43, y: 141.92 },
  { id: "25bpm", sigla: "25º BPM", nome: "Batalhão Cel. PM Claudio Galdino da Silva", tipo: "batalhao", slug: "25bpm", municipio: "Jaboatão dos Guararapes", x: 964.49, y: 159.34 },
  { id: "26bpm", sigla: "26º BPM", nome: "Batalhão 1º Sgt PM José Mariano Pimentel Neto", tipo: "batalhao", slug: "26bpm", municipio: "Itapissuma", x: 984.19, y: 105.95 },
  { id: "bptur", sigla: "BPTur", nome: "Batalhão de Policiamento Turístico", tipo: "batalhao", slug: "bptur", municipio: "Olinda", x: 990.16, y: 145.76 },
]

// Zoom do Recife (onde se concentram as especializadas): [x, y, largura, altura]
export const RECORTE_RECIFE: [number, number, number, number] = [970, 138.5, 26, 22]
