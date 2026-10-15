/**
 * Ficha padrão do 16º BPM — Batalhão Frei Caneca (São José, Recife).
 * Regra: só entra informação com fonte; a fonte vai no próprio campo.
 * Conferido em 15/10/2026:
 *  - Comandante: relação de comandantes da PMPE (mar/2026) — TC Rodrigo Jorge Grisi da Costa Vasconcelos
 *    (o BGSDS nº 046/2025 designara a TC Denize Manso de Oliveira em mar/2025; vale o mais recente).
 *  - Subcomandante: BGSDS nº 218 (19/11/2024), Portaria nº 6768.
 *  - AIS 1 e bairros: INCG nº 568/2023, art. 3º, VI.
 *  - Reforma da sede (R$ 14 mi): Portal de Prefeitura, 11/08/2026; requalificação do Complexo São José: CBN Recife, 26/05/2026.
 *  - Distâncias: rota de carro OSRM/OpenStreetMap até o Cais de Santa Rita, sem trânsito.
 */
import type { Ficha } from "./tipos"

export const SIGLA = "16º BPM"

const PMPE_16BPM = "https://www.pm.pe.gov.br/16bpm/"
const PMPE_UNIDADES = "https://www.pm.pe.gov.br/unidades-operacionais-2/"
const INCG_568 = "https://www.pm.pe.gov.br/incg568-2023-textoatualizado/"
const BGSDS_218 = "https://www.sds.pe.gov.br/images/media/1732024781_218%20BGSDS%20DE%2019NOV2024.pdf"
const REFORMA = "https://portaldeprefeitura.com.br/pernambuco/raquel-lyra-anuncia-investimento-de-r-14-milhoes-na-reforma-da-sede/629482/"
const COMPLEXO = "https://www.cbnrecife.com/2026/05/26/pernambuco-anuncia-pacote-de-r-200-milhoes-para-obras-em-seguranca-educacao-e-patrimonio-no-recife/"
const VIATURAS = "https://portaldeprefeitura.com.br/pernambuco/pernambuco-reforca-frota-das-policias-militar-e-civil/632086/"
const PAPAI_NOEL = "https://portaldeprefeitura.com.br/regiao-metropolitana/recife/policia-militar-lanca-operacao-papai-noel-no-centro-do-recife/583619/"
const SEMANA_SANTA = "https://www.diariodepernambuco.com.br/noticia/vidaurbana/2025/04/policia-militar-tem-4-700-lancamentos-extras-na-semana-santa.html"

export const FICHA: Ficha = {
  // 📍 Localização e contato
  endereco: "Cais de Santa Rita, s/n (antiga Rodoviária) – São José, Recife-PE (PMPE).\nO prédio está em reforma de R$ 14 milhões, com previsão de entrega em fevereiro (Portal de Prefeitura, 11/08/2026).",
  referenciaMapa: "16º BPM, Cais de Santa Rita, São José, Recife - PE",
  telefone: "(81) 3181-1791 / 3181-1783 (PMPE). Também publicado: 3181-1782 (relação de comandantes da PMPE, mar/2026).",
  email: "16bpm@pm.pe.gov.br (PMPE)",
  distanciaBR: "Até a APMP (Paudalho): ~46 km, ~39 min de carro sem trânsito.\nAté o Marco Zero (Recife Antigo): ~1,6 km, ~2 min sem trânsito.\nA sede fica no centro do Recife, junto ao Cais de Santa Rita, com acesso às pontes para o Recife Antigo, Boa Vista e Zona Sul.",
  // 🎖️ Comando e efetivo
  comandante: "TC QOPM Rodrigo Jorge Grisi da Costa Vasconcelos (relação de comandantes da PMPE, mar/2026).",
  subcomandante: "Maj QOPM Daniel Augusto da Silva — Portaria nº 6768 (BGSDS nº 218, de 19/11/2024), a contar de 01/11/2024.",
  cpm: "DIM — Diretoria Integrada Metropolitana · AIS 1 (INCG nº 568/2023).",
  estrutura: "Três companhias territoriais: 1ª, 2ª e 3ª CPM (PMPE — unidades operacionais). O prédio, antiga rodoviária, abriga o batalhão há cerca de 29 anos (Portal de Prefeitura, ago/2026).",
  efetivo: "Não divulgado.",
  // 🚓 Operação
  area: "Centro do Recife (PMPE — unidades operacionais):\n1ª CPM: Recife Antigo, Santo Antônio, São José e Cabanga.\n2ª CPM: Joana Bezerra, Coelhos, Ilha do Leite e Paissandu.\n3ª CPM: Boa Vista, Soledade e Santo Amaro.\nO Regimento Interno da DIM (INCG nº 568/2023) lista os mesmos bairros.",
  sobreArea: "Centro histórico e comercial do Recife: comércio popular de Santo Antônio e São José, polo médico da Ilha do Leite e Paissandu, Boa Vista e Santo Amaro, e comunidades como Coelhos e Joana Bezerra.\nO batalhão faz o policiamento reforçado de fim de ano no centro (Operação Papai Noel, com RPMon, CIPCães, BPTran, BPGd, posto de observação elevado e drones), atua na Semana Santa e recebeu viaturas da Patrulha Maria da Penha em set/2026.",
  // 🎯 Vagas — sem informação pública
  vagas: null,
  // 🏠 Onde morar
  morarPerto: "Ilha do Leite, Boa Vista, Santo Amaro e Soledade ficam a poucos minutos da sede e têm muitos prédios e serviços. Graças e Espinheiro são residenciais mais tranquilos, um pouco mais longe.\nNo centro, o deslocamento curto compensa: dá para ir de bicicleta ou ônibus em boa parte do trajeto.\nDistâncias pela rota de carro (OpenStreetMap) até o Cais de Santa Rita; tempos sem trânsito.",
  bairros: [
    { nome: "Ilha do Leite", km: "2,6 km", tempo: "carro ~4–10 min", obs: "Polo médico; prédios e serviços." },
    { nome: "Boa Vista", km: "3,0 km", tempo: "carro ~5–12 min", obs: "Centro, comércio, faculdades; área da 3ª CPM." },
    { nome: "Santo Amaro", km: "3,7 km", tempo: "carro ~6–12 min", obs: "Perto da Agamenon; área da 3ª CPM." },
    { nome: "Soledade", km: "3,8 km", tempo: "carro ~6–12 min", obs: "Residencial, junto à Boa Vista." },
    { nome: "Espinheiro", km: "5,0 km", tempo: "carro ~7–15 min", obs: "Residencial, muitos prédios." },
    { nome: "Graças", km: "5,9 km", tempo: "carro ~9–18 min", obs: "Residencial e de serviços." },
  ],
  dicas: "",
  operacoes: [
    { titulo: "Reforma da sede — R$ 14 milhões", data: "11/08/2026", resumo: "A governadora vistoriou a reforma do prédio (antiga rodoviária): novos alojamentos, banheiros, áreas comuns, salas administrativas e espaço para atividade física. Entrega prevista para fevereiro.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2026/08/whatsapp-image-2026-08-11-at-165600.jpeg", fonte: "Portal de Prefeitura", url: REFORMA },
    { titulo: "Viaturas da Patrulha Maria da Penha", data: "14/09/2026", resumo: "Na entrega de 149 viaturas do Governo, o 16º BPM (Santo Antônio) está entre os batalhões que recebem veículos dedicados à Patrulha Maria da Penha.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2026/09/whatsapp-image-2026-09-14-at-133912.jpeg", fonte: "Portal de Prefeitura", url: VIATURAS },
    { titulo: "Operação Semana Santa", data: "17/04/2025", resumo: "Policiais do 16º BPM (bairro de São José) entre os empregados nos 4.700 lançamentos extras da PMPE na Semana Santa.", foto: "https://midias.diariodepernambuco.com.br/static/app/noticia_127983242361/2025/04/17/974594/20250417215941812235o.jpg", fonte: "Diario de Pernambuco", url: SEMANA_SANTA },
    { titulo: "Operação Papai Noel no centro", data: "14/11/2024", resumo: "180 lançamentos diários até 31/12 em Santo Antônio, São José, Boa Vista, Coelhos, Santo Amaro e Recife Antigo, com efetivo do 16º BPM e de unidades especializadas.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2024/11/foto-dividida-2024-11-14t153015951.jpg", fonte: "Portal de Prefeitura", url: PAPAI_NOEL },
  ],
  links: [
    { rotulo: "INCG nº 568/2023 — Regimento Interno da DIM", url: INCG_568, grupo: "Legislação para estudo" },
    { rotulo: "INCG nº 605/2023 — normas organizacionais da PMPE", url: "https://www.pm.pe.gov.br/incg605-2023-textoatualizado/", grupo: "Legislação para estudo" },
    { rotulo: "BGSDS nº 218/2024 — designação do subcomandante", url: BGSDS_218, grupo: "Legislação para estudo" },
    { rotulo: "Legislação da PMPE (portal)", url: "https://www.pm.pe.gov.br/decretos-pmpe-legis/", grupo: "Legislação para estudo" },
    { rotulo: "16º BPM — página da PMPE", url: PMPE_16BPM },
    { rotulo: "DIM — PMPE", url: "https://www.pm.pe.gov.br/dim/" },
    { rotulo: "Ônibus — Rumo (Grande Recife)", url: "https://virtual.granderecife.pe.gov.br/rumo/" },
    { rotulo: "Aluguéis — OLX Recife", url: "https://www.olx.com.br/imoveis/aluguel/apartamentos/estado-pe/grande-recife/recife" },
    { rotulo: "Temporada mensal — Airbnb Recife", url: "https://www.airbnb.com.br/recife-brazil/stays/monthly" },
  ],
  fontes: [
    { info: "Endereço, telefones e e-mail", rotulo: "PMPE — página do 16º BPM", url: PMPE_16BPM },
    { info: "Companhias e bairros", rotulo: "PMPE — unidades operacionais", url: PMPE_UNIDADES },
    { info: "AIS 1 e bairros do Regimento", rotulo: "INCG nº 568/2023, art. 3º, VI", url: INCG_568 },
    { info: "Comandante", rotulo: "Relação de comandantes da PMPE (mar/2026)" },
    { info: "Subcomandante", rotulo: "BGSDS nº 218, de 19/11/2024 — Portaria nº 6768", url: BGSDS_218 },
    { info: "Reforma da sede", rotulo: "Portal de Prefeitura, 11/08/2026", url: REFORMA },
    { info: "Requalificação do Complexo São José (R$ 14,9 mi)", rotulo: "CBN Recife, 26/05/2026", url: COMPLEXO },
    { info: "Distâncias", rotulo: "Rotas de carro OSRM/OpenStreetMap, sem trânsito — calculadas em 15/10/2026" },
  ],
}
