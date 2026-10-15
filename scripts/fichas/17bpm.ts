/**
 * Ficha padrão do 17º BPM — Batalhão General Abreu e Lima (Paulista).
 * Regra: só entra informação com fonte; a fonte vai no próprio campo.
 * Conferido em 15/10/2026:
 *  - Comandante: BGSDS nº 046 (14/03/2025), Portaria nº 1566; mantido na relação de comandantes da PMPE (mar/2026).
 *  - Subcomandante: BGSDS nº 046 (14/03/2025), Portaria nº 1567.
 *  - AIS 8 e bairros: INCG nº 568/2023, art. 3º, VII; histórico e sede desde 2016: página do 17º BPM (PMPE).
 *  - Distâncias: rota de carro OSRM/OpenStreetMap até o bairro Aurora/Centro de Paulista
 *    (o número exato não está no mapa aberto), sem trânsito.
 */
import type { Ficha } from "./tipos"

export const SIGLA = "17º BPM"

const PMPE_17BPM = "https://www.pm.pe.gov.br/17bpm/"
const PMPE_UNIDADES = "https://www.pm.pe.gov.br/unidades-operacionais-2/"
const INCG_568 = "https://www.pm.pe.gov.br/incg568-2023-textoatualizado/"
const BGSDS_046 = "https://www.sds.pe.gov.br/images/media/1741962113_046%20BGSDS%20DE%2014MAR2025.pdf"
const DOUBLE_TAP = "https://www.cbnrecife.com/2026/08/28/operacao-da-pm-apreende-armas-e-drogas-em-area-de-mata-em-abreu-e-lima/"
const VIATURAS = "https://portaldeprefeitura.com.br/pernambuco/pernambuco-reforca-frota-das-policias-militar-e-civil/632086/"

export const FICHA: Ficha = {
  // 📍 Localização e contato
  endereco: "Rua Nova Mangueira, 05 – Aurora, Paulista-PE, CEP 53401-273 — desde jun/2016, em prédio cedido pela Prefeitura do Paulista, onde também funciona a Secretaria de Segurança Cidadã (PMPE).",
  referenciaMapa: "17º BPM, Rua Nova Mangueira, 05, Aurora, Paulista - PE",
  telefone: "(81) 3181-3600 / 3181-3603 (PMPE). Também publicado: 3181-3602 (relação de comandantes da PMPE, mar/2026).",
  email: "17bpm@pm.pe.gov.br (PMPE)",
  distanciaBR: "Até a APMP (Paudalho): ~46 km, ~47 min de carro sem trânsito.\nAté o Marco Zero (Recife): ~18 km, ~22 min sem trânsito.\nA área é cortada pela BR-101 Norte e pela PE-15, que liga Paulista a Olinda e ao Recife.",
  // 🎖️ Comando e efetivo
  comandante: "TC QOPM Carlos André Ferraz da Silva — Portaria nº 1566 (BGSDS nº 046, de 14/03/2025), a contar de 06/03/2025; mantido na relação de comandantes da PMPE (mar/2026).",
  subcomandante: "Maj QOPM Manasses Ferreira da Silva — Portaria nº 1567 (BGSDS nº 046, de 14/03/2025), a contar de 06/03/2025.",
  cpm: "DIM — Diretoria Integrada Metropolitana · AIS 8 (INCG nº 568/2023).",
  estrutura: "Três companhias: 1ª e 2ª CIA com sede em Paulista e 3ª CIA com sede em Abreu e Lima (PMPE).\nCriado em 1997 (Portaria do Comando Geral nº 089); desde 2019 os municípios de Igarassu, Itapissuma, Itamaracá e Araçoiaba passaram ao 26º BPM (PMPE).",
  efetivo: "Não divulgado.",
  // 🚓 Operação
  area: "Paulista e Abreu e Lima (PMPE — unidades operacionais):\n1ª CIA: Paulista Centro, Nobre, Alto do Bigode, Vila Torres Galvão, Sítio Fragoso, Jardim Paulista Baixo e Alto, Mirueira, Arthur Lundgren I e II, Paratibe, Jardim Velho e Jaguaribe.\n2ª CIA: Tururu, Conjunto Beira Mar, Janga, Maranguape I, II e III, Engenho Maranguape, Riacho do Prata I e II, Alameda Paulista, Jardim Maranguape, Nossa Senhora do Ó, Pau Amarelo, Maria Farinha, Nossa Senhora da Conceição, Loteamento Conceição, Jaguaruana, Poty, Conjunto Dom Helder e Conjunto Praia do Janga.\n3ª CIA (Abreu e Lima): Centro, Caetés I, II e III, Caetés Velho, Timbó, Fosfato, Matinha, Jardim Planalto, Alto São Miguel, Desterro e Alto da Bela Vista.",
  sobreArea: "Dois municípios do litoral norte: em Paulista, bairros residenciais e a orla (Janga, Pau Amarelo, Maria Farinha); em Abreu e Lima, centro urbano e conjuntos como Caetés.\nEm ago/2026 o batalhão fez a Operação \"Double Tap\" em área de mata em Caetés I, com apreensão de armas e drogas, e em set/2026 recebeu viaturas novas para o patrulhamento ostensivo.",
  // 🎯 Vagas — sem informação pública
  vagas: null,
  // 🏠 Onde morar
  morarPerto: "Centro de Paulista e Jardim Paulista ficam a poucos minutos da sede. Maranguape I é opção residencial próxima. Janga, Pau Amarelo e Rio Doce (Olinda) têm orla e mais apartamentos, a 10–15 min sem trânsito.\nDistâncias pela rota de carro (OpenStreetMap) até o bairro Aurora/Centro de Paulista; tempos sem trânsito — a PE-15 congestiona no pico.",
  bairros: [
    { nome: "Centro (Paulista)", km: "1,3 km", tempo: "a pé ~16 min · carro ~3 min", obs: "Comércio e serviços; área da 1ª CIA." },
    { nome: "Jardim Paulista", km: "2,2 km", tempo: "carro ~4–8 min", obs: "Residencial; área da 1ª CIA." },
    { nome: "Maranguape I", km: "4,9 km", tempo: "carro ~6–12 min", obs: "Residencial; área da 2ª CIA." },
    { nome: "Pau Amarelo", km: "9,1 km", tempo: "carro ~13–20 min", obs: "Orla; área da 2ª CIA." },
    { nome: "Rio Doce (Olinda)", km: "9,1 km", tempo: "carro ~11–20 min", obs: "Fora da área; comércio e terminal integrado." },
    { nome: "Janga", km: "9,8 km", tempo: "carro ~13–20 min", obs: "Orla, muitos prédios; área da 2ª CIA." },
  ],
  dicas: "",
  operacoes: [
    { titulo: "Operação \"Double Tap\" em Caetés I", data: "28/08/2026", resumo: "Policiais do 17º BPM apreenderam duas armas, crack e maconha em área de mata em Abreu e Lima; um homem foi preso e um adolescente apreendido após troca de tiros.", foto: "https://www.cbnrecife.com/wp-content/uploads/2026/08/Divulgacao-PMPE-3.jpg", fonte: "CBN Recife (foto: PMPE)", url: DOUBLE_TAP },
    { titulo: "Viaturas novas para o patrulhamento", data: "14/09/2026", resumo: "Na entrega de 149 viaturas do Governo, o 17º BPM (Paulista) está entre os batalhões contemplados para o patrulhamento ostensivo.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2026/09/whatsapp-image-2026-09-14-at-133912.jpeg", fonte: "Portal de Prefeitura", url: VIATURAS },
  ],
  links: [
    { rotulo: "INCG nº 568/2023 — Regimento Interno da DIM", url: INCG_568, grupo: "Legislação para estudo" },
    { rotulo: "INCG nº 605/2023 — normas organizacionais da PMPE", url: "https://www.pm.pe.gov.br/incg605-2023-textoatualizado/", grupo: "Legislação para estudo" },
    { rotulo: "BGSDS nº 046/2025 — designação do comando", url: BGSDS_046, grupo: "Legislação para estudo" },
    { rotulo: "Legislação da PMPE (portal)", url: "https://www.pm.pe.gov.br/decretos-pmpe-legis/", grupo: "Legislação para estudo" },
    { rotulo: "17º BPM — página e histórico (PMPE)", url: PMPE_17BPM },
    { rotulo: "DIM — PMPE", url: "https://www.pm.pe.gov.br/dim/" },
    { rotulo: "Ônibus — Rumo (Grande Recife)", url: "https://virtual.granderecife.pe.gov.br/rumo/" },
    { rotulo: "Aluguéis — OLX Paulista", url: "https://www.olx.com.br/imoveis/aluguel/apartamentos/estado-pe/grande-recife/grande-recife/paulista" },
    { rotulo: "Temporada mensal — Airbnb Paulista", url: "https://www.airbnb.com.br/paulista-brazil/stays/monthly" },
  ],
  fontes: [
    { info: "Endereço, telefones, histórico e companhias", rotulo: "PMPE — página do 17º BPM", url: PMPE_17BPM },
    { info: "Bairros por companhia", rotulo: "PMPE — unidades operacionais", url: PMPE_UNIDADES },
    { info: "AIS 8", rotulo: "INCG nº 568/2023, art. 3º, VII", url: INCG_568 },
    { info: "Comandante e subcomandante", rotulo: "BGSDS nº 046, de 14/03/2025 — Portarias nº 1566 e 1567", url: BGSDS_046 },
    { info: "Comandante em 2026", rotulo: "Relação de comandantes da PMPE (mar/2026)" },
    { info: "Operações", rotulo: "CBN Recife e Portal de Prefeitura (ver Operações)" },
    { info: "Distâncias", rotulo: "Rotas de carro OSRM/OpenStreetMap, sem trânsito — calculadas em 15/10/2026" },
  ],
}
