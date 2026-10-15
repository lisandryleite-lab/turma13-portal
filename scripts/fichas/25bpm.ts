/**
 * Ficha padrão do 25º BPM — Batalhão Cel PM Cláudio Galdino da Silva (Jaboatão dos Guararapes).
 * Regra: só entra informação com fonte; a fonte vai no próprio campo.
 * Conferido em 15/10/2026:
 *  - Comandante: BGSDS nº 046 (14/03/2025), Portaria nº 1571; mantido na relação de comandantes da PMPE (mar/2026).
 *  - Subcomandante: BGSDS nº 046 (14/03/2025), Portaria nº 1572.
 *  - AIS 6 (Moreno e Jaboatão velho): INCG nº 568/2023, art. 3º, XI.
 *  - Distâncias: rota de carro OSRM/OpenStreetMap até o Centro de Jaboatão (a rua não está no mapa aberto), sem trânsito.
 */
import type { Ficha } from "./tipos"

export const SIGLA = "25º BPM"

const PMPE_25BPM = "https://www.pm.pe.gov.br/25bpm/"
const PMPE_UNIDADES = "https://www.pm.pe.gov.br/unidades-operacionais-2/"
const INCG_568 = "https://www.pm.pe.gov.br/incg568-2023-textoatualizado/"
const BGSDS_046 = "https://www.sds.pe.gov.br/images/media/1741962113_046%20BGSDS%20DE%2014MAR2025.pdf"
const CAMERAS = "https://portaldeprefeitura.com.br/policia/policia-militar-apreende-17-cameras-instaladas-irregularmente-em/633922/"
const ALTO_CRISTO = "https://flaviojjardim.com.br/noticia/pm-prende-tres-suspeitos-por-trafico-e-apreende-cerca-de-2-kg-de-drogas-e-arma-em-jaboatao-06-10-2026-11-31"
const VIATURAS = "https://portaldeprefeitura.com.br/pernambuco/pernambuco-reforca-frota-das-policias-militar-e-civil/632086/"

export const FICHA: Ficha = {
  // 📍 Localização e contato
  endereco: "Rua Padre Cromácio Leão, s/n – Centro, Jaboatão dos Guararapes-PE (PMPE).",
  referenciaMapa: "25º BPM, Rua Padre Cromácio Leão, Centro, Jaboatão dos Guararapes - PE",
  telefone: "(81) 3181-1660 (unidades operacionais, PMPE). Também publicados: 3181-1650 / 3181-1662 / 3181-1663 (relação de comandantes da PMPE, mar/2026).",
  email: "25bpm@pm.pe.gov.br (PMPE)",
  distanciaBR: "Até a APMP (Paudalho): ~39 km, ~33 min de carro sem trânsito.\nAté o Marco Zero (Recife): ~20 km, ~25 min sem trânsito.\nA sede fica em Jaboatão Centro (Jaboatão velho), com acesso pela BR-232 e pela Estrada da Batalha; Moreno fica a ~9 km.",
  // 🎖️ Comando e efetivo
  comandante: "TC QOPM Ladstone Pereira da Silva — Portaria nº 1571 (BGSDS nº 046, de 14/03/2025), a contar de 06/03/2025; mantido na relação de comandantes da PMPE (mar/2026).",
  subcomandante: "Maj QOPM Clariça Mayanna dos Santos França — Portaria nº 1572 (BGSDS nº 046, de 14/03/2025), a contar de 06/03/2025.",
  cpm: "DIM — Diretoria Integrada Metropolitana · AIS 6, que divide com o 6º BPM (INCG nº 568/2023).",
  estrutura: "Três companhias territoriais: 1ª, 2ª e 3ª CPM (PMPE — unidades operacionais).",
  efetivo: "Não divulgado.",
  // 🚓 Operação
  area: "Jaboatão velho e Moreno (PMPE — unidades operacionais):\n1ª CPM (Jaboatão): Centro, Bulhões, Engenho Velho, Floriano, Manassu, Santo Aleixo, Vila Rica – Cohab I e II, Vista Alegre, Santana, Socorro, 13 de Maio, Padre Roma, Entre Rios, Vargem Fria, Malvina, Moenda de Bronze, Colônia dos Padres, Cascata e Mundo Novo.\n2ª CPM (Moreno e distrito de Bonança): Centro, Alto da Maternidade, N. Sra. da Conceição, N. Sra. de Fátima, Sesi Fernandes Vieira, Xingu, ABC, Cercado Grande, CSU, Cohab, Olaria, Tamboatá, João Paulo II, Bela Vista, Constantino Maranhão, Bonança e engenhos da zona rural.\n3ª CPM (Jaboatão): Cavaleiro, UR-06, UR-11, Curado I a V, Dois Carneiros, Zumbi do Pacheco e Sucupira.",
  sobreArea: "Parte oeste de Jaboatão (centro histórico, Cavaleiro, Curado) e o município de Moreno, com área urbana e muitos engenhos na zona rural.\nEm out/2026 o batalhão apreendeu câmeras clandestinas do crime organizado em Sucupira, Pacheco e Canaã e prendeu suspeitos de tráfico no Alto do Cristo (Cavaleiro); também recebeu viaturas novas para o patrulhamento.",
  // 🎯 Vagas — sem informação pública
  vagas: null,
  // 🏠 Onde morar
  morarPerto: "O Centro de Jaboatão é o bairro da sede. Socorro e Cavaleiro têm mais comércio e ficam a ~10 min sem trânsito. Moreno e Curado são outras opções da área. Prazeres e a orla de Jaboatão ficam mais longe (~20 min).\nDistâncias pela rota de carro (OpenStreetMap) até o Centro de Jaboatão; tempos sem trânsito.",
  bairros: [
    { nome: "Centro (Jaboatão)", km: "—", tempo: "—", obs: "Bairro da sede; centro histórico e comércio." },
    { nome: "Socorro", km: "5,7 km", tempo: "carro ~10–15 min", obs: "Residencial; área da 1ª CPM." },
    { nome: "Cavaleiro", km: "6,0 km", tempo: "carro ~10–15 min", obs: "Comércio forte; área da 3ª CPM." },
    { nome: "Curado", km: "9,2 km", tempo: "carro ~12–20 min", obs: "Conjuntos residenciais; perto da BR-232." },
    { nome: "Moreno", km: "9,3 km", tempo: "carro ~12–20 min", obs: "Município da 2ª CPM." },
    { nome: "Prazeres", km: "15,9 km", tempo: "carro ~20–35 min", obs: "Fora da área (6º BPM); comércio e metrô." },
  ],
  dicas: "",
  operacoes: [
    { titulo: "17 câmeras clandestinas apreendidas", data: "13/10/2026", resumo: "Ação do 25º BPM para desarticular pontos de monitoramento do crime organizado em Sucupira, Pacheco e Canaã; caso encaminhado à Polícia Civil.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2026/10/ellen-foto-nao-mexer-28_1.jpg", fonte: "Portal de Prefeitura", url: CAMERAS },
    { titulo: "Tráfico no Alto do Cristo, Cavaleiro", data: "05/10/2026", resumo: "Após informação da inteligência, policiais do 25º BPM fizeram cerco perto de área de mata e prenderam três suspeitos, com cerca de 2 kg de drogas e uma arma.", foto: "https://flaviojjardim.com.br/storage/images/2026/10/1791297134-pm-prende-tres-suspeitos-por-trafico-e-apreende-cerca-de-2-kg-de-drogas-e-arma-em-jaboatao-06-10-2026-11-31.jpg", fonte: "Blog Flávio Jardim", url: ALTO_CRISTO },
    { titulo: "Viaturas novas para o patrulhamento", data: "14/09/2026", resumo: "Na entrega de 149 viaturas do Governo, o 25º BPM (Jaboatão Velho) está entre os batalhões contemplados para o patrulhamento ostensivo.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2026/09/whatsapp-image-2026-09-14-at-133912.jpeg", fonte: "Portal de Prefeitura", url: VIATURAS },
  ],
  links: [
    { rotulo: "INCG nº 568/2023 — Regimento Interno da DIM", url: INCG_568, grupo: "Legislação para estudo" },
    { rotulo: "INCG nº 605/2023 — normas organizacionais da PMPE", url: "https://www.pm.pe.gov.br/incg605-2023-textoatualizado/", grupo: "Legislação para estudo" },
    { rotulo: "BGSDS nº 046/2025 — designação do comando", url: BGSDS_046, grupo: "Legislação para estudo" },
    { rotulo: "Legislação da PMPE (portal)", url: "https://www.pm.pe.gov.br/decretos-pmpe-legis/", grupo: "Legislação para estudo" },
    { rotulo: "DIM — PMPE", url: "https://www.pm.pe.gov.br/dim/" },
    { rotulo: "Ônibus — Rumo (Grande Recife)", url: "https://virtual.granderecife.pe.gov.br/rumo/" },
    { rotulo: "Aluguéis — OLX Jaboatão", url: "https://www.olx.com.br/imoveis/aluguel/apartamentos/estado-pe/grande-recife/grande-recife/jaboatao-dos-guararapes" },
    { rotulo: "Temporada mensal — Airbnb Jaboatão", url: "https://www.airbnb.com.br/jaboatao-dos-guararapes-brazil/stays/monthly" },
  ],
  fontes: [
    { info: "Endereço, telefone, companhias e bairros", rotulo: "PMPE — unidades operacionais", url: PMPE_UNIDADES },
    { info: "AIS 6 (Moreno e Jaboatão velho)", rotulo: "INCG nº 568/2023, art. 3º, XI", url: INCG_568 },
    { info: "Comandante e subcomandante", rotulo: "BGSDS nº 046, de 14/03/2025 — Portarias nº 1571 e 1572", url: BGSDS_046 },
    { info: "Comandante e telefones em 2026", rotulo: "Relação de comandantes da PMPE (mar/2026)" },
    { info: "Operações", rotulo: "Portal de Prefeitura e Blog Flávio Jardim (ver Operações)" },
    { info: "Distâncias", rotulo: "Rotas de carro OSRM/OpenStreetMap, sem trânsito — calculadas em 15/10/2026" },
  ],
}
