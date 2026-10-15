/**
 * Ficha padrão do 20º BPM — Batalhão Coronel PM Olinto de Melo Viana (São Lourenço da Mata).
 * Regra: só entra informação com fonte; a fonte vai no próprio campo.
 * Conferido em 15/10/2026:
 *  - Comandante: relação de comandantes da PMPE (mar/2026) — TC Ilson de Oliveira Gonçalves
 *    (o BGSDS nº 046/2025 designara o TC Fabio Henrique Barbosa da Silva; vale o mais recente).
 *  - Subcomandante: BGSDS nº 046 (14/03/2025), Portaria nº 1570.
 *  - AIS 9: INCG nº 568/2023, art. 3º. 29º BPM criado em Camaragibe: Lei nº 18.892/2025.
 *  - Sede mantida em São Lourenço: Blog Dantas Barreto, 04/06/2025.
 *  - Distâncias: rota de carro OSRM/OpenStreetMap até o bairro Muribara (a Av. Um não está no mapa aberto), sem trânsito.
 */
import type { Ficha } from "./tipos"

export const SIGLA = "20º BPM"

const PMPE_20BPM = "https://www.pm.pe.gov.br/20bpm/"
const PMPE_UNIDADES = "https://www.pm.pe.gov.br/unidades-operacionais-2/"
const INCG_568 = "https://www.pm.pe.gov.br/incg568-2023-textoatualizado/"
const BGSDS_046 = "https://www.sds.pe.gov.br/images/media/1741962113_046%20BGSDS%20DE%2014MAR2025.pdf"
const LEI_18892 = "https://legis.alepe.pe.gov.br/texto.aspx?id=83619"
const SEDE_MANTIDA = "https://blogdantasbarreto.com.br/governadora-raquel-lyra-mantera-20-batalhao-da-pm-em-sao-lourenco-da-mata-e-criara-mais-cinco/"
const MALHAS = "https://camaragibeagora.com.br/malhas-da-lei-detem-dupla-por-suspeita-de-trafico-de-drogas-em-sao-lourenco-da-mata/"
const TATICO_JUN = "https://camaragibeagora.com.br/policiais-militares-do-tatico-lotados-no-20o-bpm-apreendem-mais-de-1-kg-de-drogas-e-municoes-em-camaragibe/"
const TATICO_MAI = "https://camaragibeagora.com.br/equipe-tatico-do-20o-bpm-apreende-mais-de-12-mil-porcoes-de-maconha-e-desarticula-ponto-de-trafico-na-vila-da-fabrica-em-camaragibe/"
const VIATURAS = "https://portaldeprefeitura.com.br/pernambuco/pernambuco-reforca-frota-das-policias-militar-e-civil/632086/"

export const FICHA: Ficha = {
  // 📍 Localização e contato
  endereco: "Av. Um, s/n – Muribara, São Lourenço da Mata-PE (PMPE).\nEm jun/2025 o Governo decidiu manter o batalhão em São Lourenço da Mata (Blog Dantas Barreto, 04/06/2025).",
  referenciaMapa: "20º BPM, Avenida Um, Muribara, São Lourenço da Mata - PE",
  telefone: "(81) 3181-3580 / 3181-3584 (PMPE). Também publicados: 3181-3581 / 3181-3582 / 3181-3583 (relação de comandantes da PMPE, mar/2026).",
  email: "20bpm@pm.pe.gov.br (PMPE)",
  distanciaBR: "Acesso pela BR-408 e pela PE-005 (Camaragibe); perto da Arena de Pernambuco (Cidade da Copa).",
  // 🎖️ Comando e efetivo
  comandante: "TC QOPM Ilson de Oliveira Gonçalves (relação de comandantes da PMPE, mar/2026).",
  subcomandante: "Maj QOPM Anacleto da Silva Melo — Portaria nº 1570 (BGSDS nº 046, de 14/03/2025), a contar de 06/03/2025.",
  cpm: "DIM — Diretoria Integrada Metropolitana · AIS 9 (INCG nº 568/2023).",
  estrutura: "Três companhias: 1ª CIA em São Lourenço da Mata, 2ª e 3ª CIA em Camaragibe (PMPE — página do 20º BPM).\nA Lei nº 18.892/2025 criou o 29º BPM, com sede em Camaragibe (DIM); a divisão de área segue o Plano de Articulação da PMPE.",
  efetivo: "Não divulgado.",
  // 🚓 Operação
  area: "São Lourenço da Mata e Camaragibe (PMPE — página do 20º BPM):\n1ª CIA (São Lourenço): Centro, Matriz da Luz, Bela Vista, Caiará, Capibaribe, Chã da Tábua, Ercina Lapenda, Muribara, Nova Tiúma, Parque Capibaribe, Penedo, Pixete, São João e São Paulo, Tiúma, Várzea Fria, Vila do Reinado e área rural (Lajes e Tapacurá).\n2ª CIA (Camaragibe): Centro, Alberto Maia, Santana, Timbi, Santa Mônica, Bairro Novo, Céu Azul, Bairro dos Estados, Borralho, Viana, Celeiro das Alegrias Futuras, João Paulo II, São João, São Paulo, Santa Tereza, Estação Nova, Bairro Novo do Carmelo, Areeiro e Alto Boa Vista.\n3ª CIA (Camaragibe): Aldeia, Tabatinga, Jardim Primavera, Vila da Fábrica, Vera Cruz, São Pedro, Vale das Pedreiras, Oitenta, São Paulo, Aldeia de Baixo, Nazaré e Vila da Inabi.",
  sobreArea: "Dois municípios a oeste do Recife: São Lourenço da Mata, com centro urbano, a Arena de Pernambuco e grande área rural (Tapacurá), e Camaragibe, com bairros populosos e a região de Aldeia, de sítios e condomínios.\nO batalhão tem equipe Tática, Malhas da Lei e núcleo de inteligência (ASI); em 2026 fez apreensões de drogas na Vila da Fábrica e em Camaragibe e recebeu viaturas novas para o patrulhamento.",
  // 🎯 Vagas — sem informação pública
  vagas: null,
  // 🏠 Onde morar
  morarPerto: "Parque Capibaribe e o Centro de São Lourenço ficam a poucos minutos da sede. Camaragibe e Aldeia são opções a ~15 min. Quem prefere Recife pode olhar a Várzea (~20 min).\nÉ o batalhão mais perto da APMP — bom para quem ainda vai ter compromisso na Academia.\nDistâncias pela rota de carro (OpenStreetMap) até o bairro Muribara; tempos sem trânsito.",
  bairros: [
    { nome: "Parque Capibaribe", km: "2,2 km", tempo: "carro ~4–8 min", obs: "Residencial; área da 1ª CIA." },
    { nome: "Centro (São Lourenço)", km: "2,4 km", tempo: "carro ~5–10 min", obs: "Comércio e serviços." },
    { nome: "Penedo", km: "4,2 km", tempo: "carro ~7–12 min", obs: "Residencial; área da 1ª CIA." },
    { nome: "Aldeia (Camaragibe)", km: "10,9 km", tempo: "carro ~15–25 min", obs: "Sítios e condomínios; clima mais ameno." },
    { nome: "Camaragibe (centro)", km: "11,7 km", tempo: "carro ~14–25 min", obs: "Metrô (Linha Centro) até o Recife." },
    { nome: "Várzea (Recife)", km: "15,5 km", tempo: "carro ~20–35 min", obs: "Fora da área; perto da UFPE." },
  ],
  dicas: "",
  operacoes: [
    { titulo: "Malhas da Lei detém dupla em São Lourenço", data: "22/09/2026", resumo: "Policiais do Malhas da Lei, com apoio da inteligência do 20º BPM, detiveram dois homens suspeitos de tráfico no Conjunto Guilherme Uchoa (Rosina Labanca).", foto: "https://camaragibeagora.com.br/wp-content/uploads/2026/09/InShot_20260922_230025781.jpg", fonte: "Portal Camaragibe Agora", url: MALHAS },
    { titulo: "Viaturas novas para o patrulhamento", data: "14/09/2026", resumo: "Na entrega de 149 viaturas do Governo, o 20º BPM (São Lourenço) está entre os batalhões contemplados para o patrulhamento ostensivo.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2026/09/whatsapp-image-2026-09-14-at-133912.jpeg", fonte: "Portal de Prefeitura", url: VIATURAS },
    { titulo: "Tático apreende mais de 1 kg de drogas", data: "03/06/2026", resumo: "Policiais do Tático do 20º BPM apreenderam mais de 1 kg de drogas e munições em Camaragibe.", foto: "https://camaragibeagora.com.br/wp-content/uploads/2026/06/IMG-20260603-WA0066.jpg", fonte: "Portal Camaragibe Agora", url: TATICO_JUN },
    { titulo: "1,2 mil porções de maconha na Vila da Fábrica", data: "05/05/2026", resumo: "A equipe Tática do 20º BPM apreendeu mais de 1,2 mil porções de maconha e desarticulou um ponto de tráfico em Camaragibe.", foto: "https://camaragibeagora.com.br/wp-content/uploads/2026/05/InShot_20260505_205529103.jpg", fonte: "Portal Camaragibe Agora", url: TATICO_MAI },
  ],
  links: [
    { rotulo: "Lei nº 18.892/2025 — cria o 29º BPM (Camaragibe)", url: LEI_18892, grupo: "Legislação para estudo" },
    { rotulo: "INCG nº 568/2023 — Regimento Interno da DIM", url: INCG_568, grupo: "Legislação para estudo" },
    { rotulo: "INCG nº 605/2023 — normas organizacionais da PMPE", url: "https://www.pm.pe.gov.br/incg605-2023-textoatualizado/", grupo: "Legislação para estudo" },
    { rotulo: "BGSDS nº 046/2025 — designação do subcomandante", url: BGSDS_046, grupo: "Legislação para estudo" },
    { rotulo: "20º BPM — página da PMPE", url: PMPE_20BPM },
    { rotulo: "DIM — PMPE", url: "https://www.pm.pe.gov.br/dim/" },
    { rotulo: "Ônibus — Rumo (Grande Recife)", url: "https://virtual.granderecife.pe.gov.br/rumo/" },
    { rotulo: "Temporada mensal — Airbnb Camaragibe", url: "https://www.airbnb.com.br/camaragibe-brazil/stays/monthly" },
  ],
  fontes: [
    { info: "Endereço, telefones, companhias e bairros", rotulo: "PMPE — página do 20º BPM", url: PMPE_20BPM },
    { info: "Bairros e telefones", rotulo: "PMPE — unidades operacionais", url: PMPE_UNIDADES },
    { info: "AIS 9", rotulo: "INCG nº 568/2023, art. 3º", url: INCG_568 },
    { info: "Comandante e telefones", rotulo: "Relação de comandantes da PMPE (mar/2026)" },
    { info: "Subcomandante", rotulo: "BGSDS nº 046, de 14/03/2025 — Portaria nº 1570", url: BGSDS_046 },
    { info: "Sede mantida em São Lourenço", rotulo: "Blog Dantas Barreto, 04/06/2025", url: SEDE_MANTIDA },
    { info: "29º BPM em Camaragibe", rotulo: "Lei nº 18.892/2025 — Alepe", url: LEI_18892 },
    { info: "Operações", rotulo: "Portal Camaragibe Agora e Portal de Prefeitura (ver Operações)" },
    { info: "Distâncias", rotulo: "Rotas de carro OSRM/OpenStreetMap, sem trânsito — calculadas em 15/10/2026" },
  ],
}
