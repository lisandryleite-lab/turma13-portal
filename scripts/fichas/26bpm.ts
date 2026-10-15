/**
 * Ficha padrão do 26º BPM — Batalhão 1º Sgt PM José Mariano Pimentel Neto (Itapissuma).
 * Regra: só entra informação com fonte; a fonte vai no próprio campo.
 * Conferido em 15/10/2026:
 *  - Comandante: BGSDS nº 046 (14/03/2025), Portaria nº 1573; mantido na relação de comandantes da PMPE (mar/2026).
 *  - Subcomandante: o designado em mar/2025 (Portaria nº 1574) aparece em mar/2026 como comandante do 12º BPM — fica em branco.
 *  - AIS 8 (Araçoiaba, Igarassu, Itamaracá e Itapissuma): INCG nº 568/2023, art. 3º.
 *  - Sede própria inaugurada em 08/11/2019, ~300 PMs e 49 viaturas: Folha PE (Blog da Folha).
 *  - Distâncias: rota de carro OSRM/OpenStreetMap até a Rua Barão de Itapissuma (Grêmio), sem trânsito.
 */
import type { Ficha } from "./tipos"

export const SIGLA = "26º BPM"

const PMPE_26BPM = "https://www.pm.pe.gov.br/26bpm/"
const PMPE_UNIDADES = "https://www.pm.pe.gov.br/unidades-operacionais-2/"
const PMPE_17BPM = "https://www.pm.pe.gov.br/17bpm/"
const INCG_568 = "https://www.pm.pe.gov.br/incg568-2023-textoatualizado/"
const BGSDS_046 = "https://www.sds.pe.gov.br/images/media/1741962113_046%20BGSDS%20DE%2014MAR2025.pdf"
const LEI_18892 = "https://legis.alepe.pe.gov.br/texto.aspx?id=83619"
const INAUGURACAO = "https://www.folhape.com.br/colunistas/blogdafolha/governador-inaugura-sede-do-26o-batalhao-de-policia-militar-em-itapissuma/13158/"
const INAUGURACAO_2 = "https://folhametropolitana.com.br/governador-inaugura-26o-batalhao-da-policia-militar-em-itapissuma/"
const VIATURAS = "https://portaldeprefeitura.com.br/pernambuco/pernambuco-reforca-frota-das-policias-militar-e-civil/632086/"
const SEMANA_SANTA = "https://www.diariodepernambuco.com.br/noticia/vidaurbana/2025/04/policia-militar-tem-4-700-lancamentos-extras-na-semana-santa.html"

export const FICHA: Ficha = {
  // 📍 Localização e contato
  endereco: "Rua Barão de Itapissuma, s/n – Grêmio, Itapissuma-PE, CEP 53700-000 (PMPE; sede própria inaugurada em 08/11/2019 em parceria com a Prefeitura — Folha PE).",
  referenciaMapa: "26º BPM, Rua Barão de Itapissuma, Itapissuma - PE",
  telefone: "(81) 3181-1915 (unidades operacionais, PMPE). Também publicados: 3181-1749 / 3181-1750 (relação de comandantes da PMPE, mar/2026).",
  email: "26bpm@pm.pe.gov.br (PMPE)",
  distanciaBR: "Itapissuma fica na entrada da Ilha de Itamaracá, junto à BR-101 Norte; Igarassu fica a ~8 km.",
  // 🎖️ Comando e efetivo
  comandante: "TC QOPM Fábio Carneiro Pereira — Portaria nº 1573 (BGSDS nº 046, de 14/03/2025), a contar de 06/03/2025; mantido na relação de comandantes da PMPE (mar/2026).",
  subcomandante: "",
  cpm: "DIM — Diretoria Integrada Metropolitana · AIS 8, que divide com o 17º BPM (INCG nº 568/2023).",
  estrutura: "Três companhias: 1ª CPM em Itapissuma, 2ª CPM em Igarassu e Araçoiaba, 3ª CPM na Ilha de Itamaracá (PMPE — unidades operacionais).\nCriado a partir do Pacto pela Vida; funcionou no prédio do 17º BPM até ganhar sede própria em 2019 (Folha PE). Desde 2019 assumiu Igarassu, Itapissuma, Itamaracá e Araçoiaba, antes do 17º BPM (PMPE).",
  efetivo: "Cerca de 300 policiais e 49 viaturas (20 motos) na inauguração da sede, em nov/2019 (Folha PE).",
  // 🚓 Operação
  area: "Litoral norte (PMPE — unidades operacionais):\n1ª CPM (Itapissuma): Botafogo, Cajueiro, Centro, Cidade Criança, Cidade Industrial, Conceição, Engenho Ubu, Espinheiro, Grêmio, Mangabeira, Nova Itapissuma, Várzea, Veloz e zona rural.\n2ª CPM (Igarassu e Araçoiaba): Centro de Igarassu, Agamenon Magalhães, Alto do Céu, Beira Mar I e II, Bela Vista, Boa Sorte, Bonfim, Campina da Feira, Cohab, Cruz de Rebouças, Cuieiras, Encanto Igarassu, Inhamã, Jabacó, Monjope, Nova Cruz, Santa Luzia, Santa Rita, Saramandaia, Três Ladeiras, Umbura e zona rural; em Araçoiaba, Centro, Nova Araçoiaba, Quinze, Vila Canaã, Vila Itapipire e zona rural.\n3ª CPM (Itamaracá): Centro, Baixa Verde, Biquinha, Eldorado, Enseada dos Golfinhos, Forno da Cal, Forte Orange, Jaguaribe, Oiteiro, Pilar, Pontal da Ilha, Sossego, Quatro Cantos, Rio Âmbar, Roque Santeiro, Salinas, Vila Velha, Socorro e zona rural.",
  sobreArea: "Quatro municípios do litoral norte: a Ilha de Itamaracá, turística (Forte Orange, praias), Igarassu, cidade histórica e populosa, Itapissuma, na entrada da ilha, e Araçoiaba, mais rural.\nO batalhão atua em operações como a Semana Santa e recebeu viaturas novas para o patrulhamento em set/2026. A Lei nº 18.892/2025 criou o Batalhão de Policiamento Ambiental (BPA) com sede em Igarassu, dentro da área.",
  // 🎯 Vagas — sem informação pública
  vagas: null,
  // 🏠 Onde morar
  morarPerto: "Igarassu tem mais comércio e serviços, a ~10 min da sede. A Ilha de Itamaracá é opção de praia, a ~15 min. Abreu e Lima fica a ~17 min, já na área do 17º BPM, com mais oferta de imóveis.\nDistâncias pela rota de carro (OpenStreetMap) até a Rua Barão de Itapissuma (Grêmio); tempos sem trânsito — a BR-101 Norte congestiona no pico e no verão.",
  bairros: [
    { nome: "Igarassu (centro)", km: "8,4 km", tempo: "carro ~9–15 min", obs: "Cidade histórica; comércio e serviços." },
    { nome: "Ilha de Itamaracá", km: "11,6 km", tempo: "carro ~14–25 min", obs: "Praias; opção de temporada." },
    { nome: "Abreu e Lima", km: "15,9 km", tempo: "carro ~17–30 min", obs: "Fora da área (17º BPM); mais imóveis." },
    { nome: "Nova Cruz (Igarassu)", km: "17,4 km", tempo: "carro ~19–30 min", obs: "Distrito de Igarassu; área da 2ª CPM." },
  ],
  dicas: "",
  operacoes: [
    { titulo: "Réveillon 2026 — estreia dos aspirantes da T1", data: "31/12/2025", resumo: "A SDS montou 4.538 postos de trabalho e a PMPE contou, pela primeira vez, com os novos soldados e aspirantes do concurso estadual. Área reforçada pelo batalhão: Itamaracá e Itapissuma.", fonte: "BGSDS nº 239 (31/12/2025) — SDS", url: "https://www.sds.pe.gov.br/images/media/arquivos/Boletim_Geral/2025/12%20-%20Dezembro/1767211340_239%20BGSDS%20DE%2031DEZ2025.pdf" },
    { titulo: "Viaturas novas para o patrulhamento", data: "14/09/2026", resumo: "Na entrega de 149 viaturas do Governo, o 26º BPM (Itapissuma) está entre os batalhões contemplados para o patrulhamento ostensivo.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2026/09/whatsapp-image-2026-09-14-at-133912.jpeg", fonte: "Portal de Prefeitura", url: VIATURAS },
    { titulo: "Operação Semana Santa", data: "17/04/2025", resumo: "Policiais do 26º BPM (Itapissuma) entre os empregados nos 4.700 lançamentos extras da PMPE na Semana Santa.", foto: "https://midias.diariodepernambuco.com.br/static/app/noticia_127983242361/2025/04/17/974594/20250417215941812235o.jpg", fonte: "Diario de Pernambuco", url: SEMANA_SANTA },
    { titulo: "Inauguração da sede própria", data: "08/11/2019", resumo: "Sede própria em Itapissuma, construída em parceria com a Prefeitura, com cerca de 300 policiais e 49 viaturas (20 motos); antes o batalhão funcionava no prédio do 17º BPM.", foto: "https://folhametropolitana.com.br/site/wp-content/uploads/2019/12/Governador-inaugura-26%C2%BA-Batalh%C3%A3o-da-PM.jpg", fonte: "Folha PE (foto: Folha Metropolitana)", url: INAUGURACAO },
  ],
  links: [
    { rotulo: "Lei nº 18.892/2025 — cria o BPA em Igarassu", url: LEI_18892, grupo: "Legislação para estudo" },
    { rotulo: "INCG nº 568/2023 — Regimento Interno da DIM", url: INCG_568, grupo: "Legislação para estudo" },
    { rotulo: "INCG nº 605/2023 — normas organizacionais da PMPE", url: "https://www.pm.pe.gov.br/incg605-2023-textoatualizado/", grupo: "Legislação para estudo" },
    { rotulo: "BGSDS nº 046/2025 — designação do comandante", url: BGSDS_046, grupo: "Legislação para estudo" },
    { rotulo: "26º BPM — página da PMPE", url: PMPE_26BPM },
    { rotulo: "DIM — PMPE", url: "https://www.pm.pe.gov.br/dim/" },
    { rotulo: "Ônibus — Rumo (Grande Recife)", url: "https://virtual.granderecife.pe.gov.br/rumo/" },
    { rotulo: "Temporada — Airbnb Itamaracá", url: "https://www.airbnb.com.br/s/Ilha-de-Itamaraca--Pernambuco/homes" },
  ],
  fontes: [
    { info: "Endereço, telefone, companhias e bairros", rotulo: "PMPE — unidades operacionais", url: PMPE_UNIDADES },
    { info: "Página do batalhão", rotulo: "PMPE — 26º BPM", url: PMPE_26BPM },
    { info: "AIS 8", rotulo: "INCG nº 568/2023, art. 3º", url: INCG_568 },
    { info: "Comandante", rotulo: "BGSDS nº 046, de 14/03/2025 — Portaria nº 1573", url: BGSDS_046 },
    { info: "Comandante e telefones em 2026", rotulo: "Relação de comandantes da PMPE (mar/2026)" },
    { info: "Sede, efetivo e histórico", rotulo: "Folha PE — inauguração (08/11/2019)", url: INAUGURACAO },
    { info: "Inauguração (2ª fonte)", rotulo: "Folha Metropolitana, 2019", url: INAUGURACAO_2 },
    { info: "Municípios que vieram do 17º BPM", rotulo: "PMPE — histórico do 17º BPM", url: PMPE_17BPM },
    { info: "Distâncias", rotulo: "Rotas de carro OSRM/OpenStreetMap, sem trânsito — calculadas em 15/10/2026" },
  ],
}
