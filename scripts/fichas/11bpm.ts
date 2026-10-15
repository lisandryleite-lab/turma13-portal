/**
 * Ficha padrão do 11º BPM — Batalhão 17 de Agosto (Apipucos, Recife).
 * Regra: só entra informação com fonte; a fonte vai no próprio campo.
 * Conferido em 15/10/2026:
 *  - Comandante: BGSDS nº 046 (14/03/2025), Portaria nº 1559; mantido na relação de comandantes da PMPE (mar/2026).
 *  - Subcomandante: BGSDS nº 046 (14/03/2025), Portaria nº 1560.
 *  - AIS 5 e bairros: INCG nº 568/2023, art. 3º, III.
 *  - Endereço, telefones, e-mail e bairros por CIA: páginas da PMPE (11º BPM e unidades operacionais).
 *  - Distâncias: rota de carro OSRM/OpenStreetMap até a Rua de Apipucos, sem trânsito.
 */
import type { Ficha } from "./tipos"

export const SIGLA = "11º BPM"

const PMPE_11BPM = "https://www.pm.pe.gov.br/11bpm/"
const PMPE_UNIDADES = "https://www.pm.pe.gov.br/unidades-operacionais-2/"
const INCG_568 = "https://www.pm.pe.gov.br/incg568-2023-textoatualizado/"
const BGSDS_046 = "https://www.sds.pe.gov.br/images/media/1741962113_046%20BGSDS%20DE%2014MAR2025.pdf"
const ZONA_NORTE = "https://portaldeprefeitura.com.br/pernambuco/policia-militar-operacao-zona-norte-recife-11-bpm/633423/"
const GUARDIAO = "https://portaldeprefeitura.com.br/cotidiano/recife-policia-prende-homem-trafico-e-apreende-crack-vasco-gama/599845/"

export const FICHA: Ficha = {
  // 📍 Localização e contato
  endereco: "Rua Apipucos, 15 – Apipucos, Recife-PE (PMPE).",
  referenciaMapa: "11º BPM, Rua Apipucos, 15, Apipucos, Recife - PE",
  telefone: "(81) 3183-5459 / 3183-5474 (página do 11º BPM, PMPE). Também publicado: 3183-5460 (unidades operacionais, PMPE).",
  email: "11bpm@pm.pe.gov.br (PMPE)",
  distanciaBR: "Até a APMP (Paudalho): ~35 km, ~35 min de carro sem trânsito.\nAté o Marco Zero (Recife): ~10 km, ~14 min sem trânsito.\nA sede fica na Zona Norte, perto do Açude de Apipucos e da Av. Dezessete de Agosto, com saída para a BR-101 e a BR-232.",
  // 🎖️ Comando e efetivo
  comandante: "TC QOPM Marcos Antonio Vasconcelos de Melo Junior — Portaria nº 1559 (BGSDS nº 046, de 14/03/2025), a contar de 06/03/2025; mantido na relação de comandantes da PMPE (mar/2026).",
  subcomandante: "Maj QOPM Wellington José de Araújo — Portaria nº 1560 (BGSDS nº 046, de 14/03/2025), a contar de 10/03/2025.",
  cpm: "DIM — Diretoria Integrada Metropolitana · AIS 5 (INCG nº 568/2023).",
  estrutura: "Quatro companhias: 1ª, 2ª, 3ª e 4ª CIA (PMPE — página do 11º BPM).",
  efetivo: "Não divulgado.",
  // 🚓 Operação
  area: "Zona Norte do Recife (PMPE — unidades operacionais):\n1ª CIA: Apipucos, Macaxeira, Nova Descoberta, Brejo de Beberibe, Brejo da Guabiraba, Córrego do Jenipapo, Dois Irmãos, Sítio dos Pintos, Guabiraba, Monteiro, Alto do Mandu, Pau Ferro, Bom Clima, Bola na Rede, Burity, Singapura e Vila Aritana.\n2ª CIA: Alto José do Pinho, Mangabeira, Morro da Conceição e Vasco da Gama.\n3ª CIA: Bomba do Hemetério, Alto Santa Terezinha, Alto José Bonifácio, Linha do Tiro, Dois Unidos, Passarinho, Beberibe e Porto da Madeira.\n4ª CIA: Jaqueira, Santana, Poço da Panela, Parnamirim, Casa Forte, Tamarineira e Casa Amarela.\nO Regimento Interno da DIM (INCG nº 568/2023) também cita Alto do Refúgio e Alto da Bela Vista, e Passarinho a partir do Terminal Complementar BR-101 Norte.",
  sobreArea: "Área bem diversa: bairros residenciais de alto padrão (Casa Forte, Jaqueira, Parnamirim) ao lado de morros e comunidades populosas (Alto José do Pinho, Morro da Conceição, Passarinho, Dois Unidos) e áreas de mata (Dois Irmãos, Guabiraba).\nEm out/2026 o batalhão coordenou patrulhamento com 65 policiais e 30 viaturas na Zona Norte, dentro das operações Top Five e Eleições.",
  // 🎯 Vagas — sem informação pública
  vagas: null,
  // 🏠 Onde morar
  morarPerto: "Apipucos e Monteiro ficam praticamente ao lado da sede. Casa Forte e Casa Amarela têm mais comércio e apartamentos, a poucos minutos. Parnamirim e Tamarineira são opções mais urbanas, um pouco mais longe.\nDistâncias pela rota de carro (OpenStreetMap) até a Rua de Apipucos; tempos sem trânsito.",
  bairros: [
    { nome: "Apipucos", km: "0,4 km", tempo: "a pé ~5 min", obs: "Bairro da sede, ao lado do Açude de Apipucos." },
    { nome: "Monteiro", km: "1,1 km", tempo: "a pé ~14 min · carro ~3 min", obs: "Vizinho; residencial." },
    { nome: "Casa Forte", km: "2,7 km", tempo: "carro ~5–10 min", obs: "Residencial, praças e comércio; área da 4ª CIA." },
    { nome: "Casa Amarela", km: "2,9 km", tempo: "carro ~5–10 min", obs: "Comércio forte, mercado e muitos serviços." },
    { nome: "Parnamirim", km: "4,5 km", tempo: "carro ~6–12 min", obs: "Residencial, perto da Estrada do Arraial." },
    { nome: "Tamarineira", km: "6,1 km", tempo: "carro ~8–15 min", obs: "Mais central; área da 4ª CIA." },
  ],
  dicas: "",
  operacoes: [
    { titulo: "Patrulhamento na Zona Norte — Top Five e Eleições", data: "02/10/2026", resumo: "O 11º BPM coordenou 65 policiais e 30 viaturas em Macaxeira, Dois Unidos, Morro da Conceição e outros bairros, com patrulhamento ostensivo.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2026/10/policiais-militares-de-pernambuco.jpg", fonte: "Portal de Prefeitura", url: ZONA_NORTE },
    { titulo: "Operação Guardião no Vasco da Gama", data: "23/07/2025", resumo: "Em apoio ao 11º BPM, a CIPMoto prendeu um homem por tráfico, com 107 invólucros e mais 225 g de maconha, crack, simulacros e balanças.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2025/07/recife-policia-prende-homem-trafico-e-apreende-crack-vasco-gama.jpg", fonte: "Portal de Prefeitura", url: GUARDIAO },
  ],
  links: [
    { rotulo: "INCG nº 568/2023 — Regimento Interno da DIM", url: INCG_568, grupo: "Legislação para estudo" },
    { rotulo: "INCG nº 605/2023 — normas organizacionais da PMPE", url: "https://www.pm.pe.gov.br/incg605-2023-textoatualizado/", grupo: "Legislação para estudo" },
    { rotulo: "BGSDS nº 046/2025 — designação do comando", url: BGSDS_046, grupo: "Legislação para estudo" },
    { rotulo: "Legislação da PMPE (portal)", url: "https://www.pm.pe.gov.br/decretos-pmpe-legis/", grupo: "Legislação para estudo" },
    { rotulo: "11º BPM — página da PMPE", url: PMPE_11BPM },
    { rotulo: "DIM — PMPE", url: "https://www.pm.pe.gov.br/dim/" },
    { rotulo: "Ônibus — Rumo (Grande Recife)", url: "https://virtual.granderecife.pe.gov.br/rumo/" },
    { rotulo: "Aluguéis — OLX Recife", url: "https://www.olx.com.br/imoveis/aluguel/apartamentos/estado-pe/grande-recife/recife" },
    { rotulo: "Temporada mensal — Airbnb Recife", url: "https://www.airbnb.com.br/recife-brazil/stays/monthly" },
  ],
  fontes: [
    { info: "Endereço, telefones, e-mail e companhias", rotulo: "PMPE — página do 11º BPM", url: PMPE_11BPM },
    { info: "Bairros e telefone", rotulo: "PMPE — unidades operacionais", url: PMPE_UNIDADES },
    { info: "AIS 5 e bairros do Regimento", rotulo: "INCG nº 568/2023, art. 3º, III", url: INCG_568 },
    { info: "Comandante e subcomandante", rotulo: "BGSDS nº 046, de 14/03/2025 — Portarias nº 1559 e 1560", url: BGSDS_046 },
    { info: "Comandante em 2026", rotulo: "Relação de comandantes da PMPE (mar/2026)" },
    { info: "Operações", rotulo: "Portal de Prefeitura (ver Operações)" },
    { info: "Distâncias", rotulo: "Rotas de carro OSRM/OpenStreetMap, sem trânsito — calculadas em 15/10/2026" },
  ],
}
