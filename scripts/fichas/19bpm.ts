/**
 * Ficha padrão do 19º BPM — Batalhão André Vidal de Negreiros (Pina, Recife).
 * Regra: só entra informação com fonte; a fonte vai no próprio campo.
 * Conferido em 15/10/2026:
 *  - Comandante: BGSDS nº 046 (14/03/2025), Portaria nº 1568; mantido na relação de comandantes da PMPE (mar/2026).
 *  - Subcomandante: o último designado (Portaria nº 6763/2024) aparece em mar/2026 como comandante do 16º BPM — fica em branco.
 *  - Endereço: unidades operacionais (Rua Manoel de Brito, 815) e relação de mar/2026 (Rua Manoel de Brito, Pina);
 *    a página do 19º BPM ainda traz Rua Francisco Barreto, Ipsep.
 *  - AIS 3 e bairros: INCG nº 568/2023, art. 3º.
 *  - Distâncias: rota de carro OSRM/OpenStreetMap até a Rua Manoel de Brito, sem trânsito.
 */
import type { Ficha } from "./tipos"

export const SIGLA = "19º BPM"

const PMPE_19BPM = "https://www.pm.pe.gov.br/19bpm/"
const PMPE_UNIDADES = "https://www.pm.pe.gov.br/unidades-operacionais-2/"
const INCG_568 = "https://www.pm.pe.gov.br/incg568-2023-textoatualizado/"
const BGSDS_046 = "https://www.sds.pe.gov.br/images/media/1741962113_046%20BGSDS%20DE%2014MAR2025.pdf"
const PONTO_CEGO = "https://www.diariodepernambuco.com.br/vida-urbana/2026/05/11715318-43-cameras-usadas-por-criminosos-para-monitorar-policia-e-rivais-sao-apreendidas-no-recife.html"
const BEBE = "https://www.diariodepernambuco.com.br/vida-urbana/2026/07/11719320-recem-nascida-e-salva-por-policiais-militares-apos-se-engasgar-em-boa-viagem.html"
const VIATURAS = "https://portaldeprefeitura.com.br/pernambuco/pernambuco-reforca-frota-das-policias-militar-e-civil/632086/"
const SEMANA_SANTA = "https://www.diariodepernambuco.com.br/noticia/vidaurbana/2025/04/policia-militar-tem-4-700-lancamentos-extras-na-semana-santa.html"

export const FICHA: Ficha = {
  // 📍 Localização e contato
  endereco: "Rua Manoel de Brito, 815 – Pina, Recife-PE (PMPE — unidades operacionais; relação de comandantes, mar/2026).\nA página antiga do batalhão ainda mostra Rua Francisco Barreto, s/n, Ipsep.",
  referenciaMapa: "19º BPM, Rua Manoel de Brito, 815, Pina, Recife - PE",
  telefone: "(81) 3181-3573 / 3181-3563 (PMPE). Também publicados: 3181-3561 / 3181-3562 (relação de comandantes da PMPE, mar/2026).",
  email: "19bpm@pm.pe.gov.br (PMPE)",
  distanciaBR: "Até a APMP (Paudalho): ~45 km, ~39 min de carro sem trânsito.\nAté o Marco Zero (Recife): ~5 km, ~6 min sem trânsito.\nA sede fica no Pina, entre Boa Viagem e o centro, com acesso pela Av. Antônio de Góes, Av. Herculano Bandeira e Via Mangue.",
  // 🎖️ Comando e efetivo
  comandante: "TC QOPM Davidson Michel Ramos da Cunha — Portaria nº 1568 (BGSDS nº 046, de 14/03/2025), a contar de 06/03/2025; mantido na relação de comandantes da PMPE (mar/2026).",
  subcomandante: "",
  cpm: "DIM — Diretoria Integrada Metropolitana · AIS 3 (INCG nº 568/2023).",
  estrutura: "Quatro companhias: 1ª, 2ª, 3ª e 4ª CIA (PMPE — página do 19º BPM).",
  efetivo: "Não divulgado.",
  // 🚓 Operação
  area: "Zona Sul do Recife (PMPE — página do 19º BPM):\n1ª CIA: Boa Viagem, Pina, Brasília Teimosa, Setúbal, Jardim Beira Rio e Jardim Boa Viagem.\n2ª CIA: Imbiribeira (Vila Pinheiros), Ipsep (Vila Mauricéia, Vila Sudene, Vila Lúcia), Ilha de Deus e Jardim Imbiribeira.\n3ª CIA: Jordão Alto, Jordão Baixo, Ibura Baixo (Vila Sesi) e Jardim Jordão.\n4ª CIA: URs I, II, III, IV, X e XII, Jardim Monte Verde, Lagoa Encantada, Zumbi do Pacheco Alto e Baixo, Três Carneiros (Alto e Baixo), Alto Dois Carneiros, Milagres, Pantanal e Candeeiro.\nNo Regimento Interno da DIM (INCG nº 568/2023): Boa Viagem, Brasília Teimosa, Cohab (UR), Imbiribeira, Ipsep, Ibura, Jordão, Mauricéia e Pina.",
  sobreArea: "Área de contrastes: orla de Boa Viagem e Pina, com prédios, comércio, shoppings e muito turista, e bairros populosos do Ibura, Jordão e Cohab (URs), na divisa com Jaboatão.\nEm 2026 o batalhão fez a Operação Ponto Cego III (câmeras clandestinas do tráfico no Ibura, Jordão, Cohab e Imbiribeira), apoiou ocorrências na orla e recebeu viaturas da Patrulha Maria da Penha.",
  // 🎯 Vagas — sem informação pública
  vagas: null,
  // 🏠 Onde morar
  morarPerto: "Brasília Teimosa, Imbiribeira e Pina ficam mais perto da sede. Boa Viagem tem a maior oferta de apartamentos e serviços, a ~10 min sem trânsito. Ipsep e Setúbal são opções residenciais um pouco mais longe.\nDistâncias pela rota de carro (OpenStreetMap) até a Rua Manoel de Brito; tempos sem trânsito — a Zona Sul congestiona muito no pico.",
  bairros: [
    { nome: "Brasília Teimosa", km: "2,5 km", tempo: "carro ~6–10 min", obs: "Orla; área da 1ª CIA." },
    { nome: "Imbiribeira", km: "4,4 km", tempo: "carro ~7–15 min", obs: "Perto do aeroporto e da Av. Mascarenhas de Morais." },
    { nome: "Pina", km: "4,9 km", tempo: "carro ~7–15 min", obs: "Bairro da sede; extenso — confira a rua no mapa." },
    { nome: "Boa Viagem", km: "6,4 km", tempo: "carro ~9–20 min", obs: "Orla; maior oferta de apartamentos e serviços." },
    { nome: "Ipsep", km: "7,5 km", tempo: "carro ~11–20 min", obs: "Residencial; área da 2ª CIA." },
    { nome: "Setúbal", km: "10,4 km", tempo: "carro ~14–25 min", obs: "Sul de Boa Viagem; residencial." },
  ],
  dicas: "",
  operacoes: [
    { titulo: "Viaturas da Patrulha Maria da Penha", data: "14/09/2026", resumo: "Na entrega de 149 viaturas do Governo, o 19º BPM (Pina) está entre os batalhões que recebem veículos dedicados à Patrulha Maria da Penha.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2026/09/whatsapp-image-2026-09-14-at-133912.jpeg", fonte: "Portal de Prefeitura", url: VIATURAS },
    { titulo: "Recém-nascida socorrida em Boa Viagem", data: "22/07/2026", resumo: "Após o primeiro atendimento por policiais do BPTur, equipes do 19º BPM levaram a bebê e os pais até a UPA da Imbiribeira; ela ficou fora de perigo.", foto: "https://www.diariodepernambuco.com.br/_midias/jpg/2026/07/22/600x400/1_lari__7_-925272.jpg", fonte: "Diario de Pernambuco", url: BEBE },
    { titulo: "Operação Ponto Cego III — 43 câmeras do crime", data: "29/05/2026", resumo: "Com a Neoenergia, o 19º BPM retirou 43 câmeras clandestinas usadas para vigiar a polícia na Cohab, Ibura, Jordão e Imbiribeira; três presos com pistola, revólver, munições e drogas.", foto: "https://www.diariodepernambuco.com.br/_midias/jpg/2026/05/29/600x400/1_whatsapp_image_2026_05_29_at_12_08_32-897255.jpeg", fonte: "Diario de Pernambuco", url: PONTO_CEGO },
  ],
  links: [
    { rotulo: "INCG nº 568/2023 — Regimento Interno da DIM", url: INCG_568, grupo: "Legislação para estudo" },
    { rotulo: "INCG nº 605/2023 — normas organizacionais da PMPE", url: "https://www.pm.pe.gov.br/incg605-2023-textoatualizado/", grupo: "Legislação para estudo" },
    { rotulo: "BGSDS nº 046/2025 — designação do comandante", url: BGSDS_046, grupo: "Legislação para estudo" },
    { rotulo: "Legislação da PMPE (portal)", url: "https://www.pm.pe.gov.br/decretos-pmpe-legis/", grupo: "Legislação para estudo" },
    { rotulo: "19º BPM — página da PMPE", url: PMPE_19BPM },
    { rotulo: "19º BPM no Instagram", url: "https://www.instagram.com/19bpm.pmpe/" },
    { rotulo: "DIM — PMPE", url: "https://www.pm.pe.gov.br/dim/" },
    { rotulo: "Ônibus — Rumo (Grande Recife)", url: "https://virtual.granderecife.pe.gov.br/rumo/" },
    { rotulo: "Aluguéis — OLX Recife", url: "https://www.olx.com.br/imoveis/aluguel/apartamentos/estado-pe/grande-recife/recife" },
    { rotulo: "Temporada mensal — Airbnb Recife", url: "https://www.airbnb.com.br/recife-brazil/stays/monthly" },
  ],
  fontes: [
    { info: "Endereço atual, telefones e bairros", rotulo: "PMPE — unidades operacionais", url: PMPE_UNIDADES },
    { info: "Companhias e bairros (detalhe)", rotulo: "PMPE — página do 19º BPM", url: PMPE_19BPM },
    { info: "AIS 3 e bairros do Regimento", rotulo: "INCG nº 568/2023, art. 3º", url: INCG_568 },
    { info: "Comandante", rotulo: "BGSDS nº 046, de 14/03/2025 — Portaria nº 1568", url: BGSDS_046 },
    { info: "Comandante e endereço em 2026", rotulo: "Relação de comandantes da PMPE (mar/2026)" },
    { info: "Semana Santa 2025 (efetivo empregado)", rotulo: "Diario de Pernambuco, 17/04/2025", url: SEMANA_SANTA },
    { info: "Operações", rotulo: "Diario de Pernambuco e Portal de Prefeitura (ver Operações)" },
    { info: "Distâncias", rotulo: "Rotas de carro OSRM/OpenStreetMap, sem trânsito — calculadas em 15/10/2026" },
  ],
}
