/**
 * Ficha padrão do 12º BPM — Batalhão Arraial Novo do Bom Jesus (Várzea, Recife).
 * Regra: só entra informação com fonte; a fonte vai no próprio campo.
 * Conferido em 15/10/2026:
 *  - Comandante: relação de comandantes da PMPE (mar/2026) — TC Everaldo Vitor Alves Júnior
 *    (o BGSDS nº 046/2025 designara o TC Rubens Jorge Rocha Barreto Filho em mar/2025; vale o mais recente).
 *  - Subcomandante: BGSDS nº 046 (14/03/2025), Portaria nº 1562.
 *  - AIS 4 e bairros: INCG nº 568/2023, art. 3º, IV.
 *  - Endereço, telefones, e-mail e bairros por CPM: páginas da PMPE (12º BPM e unidades operacionais).
 *  - Distâncias: rota de carro OSRM/OpenStreetMap até a Rua Dona Maria Lacerda, sem trânsito.
 */
import type { Ficha } from "./tipos"

export const SIGLA = "12º BPM"

const PMPE_12BPM = "https://www.pm.pe.gov.br/12bpm/"
const PMPE_UNIDADES = "https://www.pm.pe.gov.br/unidades-operacionais-2/"
const INCG_568 = "https://www.pm.pe.gov.br/incg568-2023-textoatualizado/"
const BGSDS_046 = "https://www.sds.pe.gov.br/images/media/1741962113_046%20BGSDS%20DE%2014MAR2025.pdf"
const APOSTAS = "https://www.diariodepernambuco.com.br/vida-urbana/2026/06/11715951-homens-sao-presos-apos-assalto-a-casa-de-apostas-perseguicao-e-troca-de-tiros-no-recife.html"
const AREIAS = "https://portaldeprefeitura.com.br/cotidiano/pm-apreende-290-porcoes-maconha-areias-recife/631755/"

export const FICHA: Ficha = {
  // 📍 Localização e contato
  endereco: "Rua Dona Maria Lacerda, s/n – Várzea, Recife-PE (PMPE).",
  referenciaMapa: "12º BPM, Rua Dona Maria Lacerda, Várzea, Recife - PE",
  telefone: "(81) 3183-5392 / 3183-5395 (PMPE). Também publicados: 3183-5393 / 3183-5394 (relação de comandantes da PMPE, mar/2026).",
  email: "12bpm@pm.pe.gov.br (PMPE)",
  distanciaBR: "Até a APMP (Paudalho): ~33 km, ~33 min de carro sem trânsito — é um dos batalhões mais perto da APMP.\nAté o Marco Zero (Recife): ~15 km, ~17 min sem trânsito.\nA sede fica na Zona Oeste, com acesso pela Av. Caxangá e saída para a BR-232 e Camaragibe.",
  // 🎖️ Comando e efetivo
  comandante: "TC QOPM Everaldo Vitor Alves Júnior (relação de comandantes da PMPE, mar/2026).",
  subcomandante: "Maj QOPM Elton Máximo de Macedo — Portaria nº 1562 (BGSDS nº 046, de 14/03/2025), a contar de 06/03/2025.",
  cpm: "DIM — Diretoria Integrada Metropolitana · AIS 4 (INCG nº 568/2023).",
  estrutura: "Quatro companhias territoriais: 1ª, 2ª, 3ª e 4ª CPM (PMPE — unidades operacionais).",
  efetivo: "Não divulgado.",
  // 🚓 Operação
  area: "Zona Oeste do Recife (PMPE — unidades operacionais):\n1ª CPM: Torrões, Engenho do Meio, Cidade Universitária, Curado, Várzea, Caxangá e Iputinga.\n2ª CPM: Totó, Coqueiral, Tejipió, Sancho, Jardim São Paulo e Barro.\n3ª CPM: Bongi, Ilha do Retiro, Mangueira, Mustardinha, Prado e San Martin.\n4ª CPM: Afogados, Jiquiá, Estância, Areias e Caçote.\nNo Regimento Interno da DIM (INCG nº 568/2023), a Iputinga fica com o 13º BPM.",
  sobreArea: "Zona Oeste do Recife, com a Cidade Universitária (UFPE), a Ilha do Retiro e bairros populosos como Afogados, San Martin e Jardim São Paulo, na divisa com Jaboatão e Camaragibe.\nEm 2026 o batalhão aparece em ocorrências de assalto com perseguição e troca de tiros (Afogados) e em apreensões de drogas (Areias).",
  // 🎯 Vagas — sem informação pública
  vagas: null,
  // 🏠 Onde morar
  morarPerto: "Cidade Universitária, Caxangá, Iputinga e Engenho do Meio ficam a poucos minutos da sede e têm muito aluguel por causa da UFPE. Madalena é opção mais central, com mais comércio, porém mais longe.\nDistâncias pela rota de carro (OpenStreetMap) até a Rua Dona Maria Lacerda; tempos sem trânsito.",
  bairros: [
    { nome: "Cidade Universitária", km: "2,4 km", tempo: "carro ~4–8 min", obs: "UFPE; muita oferta de quartos e kitnets." },
    { nome: "Caxangá", km: "4,0 km", tempo: "carro ~6–12 min", obs: "Eixo da Av. Caxangá; ônibus para o centro." },
    { nome: "Iputinga", km: "4,0 km", tempo: "carro ~6–12 min", obs: "Residencial, comércio de bairro." },
    { nome: "Engenho do Meio", km: "4,5 km", tempo: "carro ~6–12 min", obs: "Residencial, perto da UFPE." },
    { nome: "Várzea", km: "4,5 km", tempo: "carro ~8–15 min", obs: "Bairro da sede; extenso — confira a rua no mapa." },
    { nome: "Madalena", km: "7,2 km", tempo: "carro ~11–20 min", obs: "Mais central; comércio e serviços." },
  ],
  dicas: "",
  operacoes: [
    { titulo: "290 porções de maconha em Areias", data: "08/09/2026", resumo: "Policiais do 12º BPM apreenderam 290 porções de maconha prontas para venda; os suspeitos fugiram para uma área de mata.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2026/09/ellen-foto-nao-mexer-39.jpg", fonte: "Portal de Prefeitura (foto: PMPE)", url: AREIAS },
    { titulo: "Assalto a casa de apostas em Afogados", data: "06/06/2026", resumo: "Em rondas, equipes do 12º BPM ouviram disparos, perseguiram os assaltantes e, após troca de tiros, prenderam dois suspeitos com pistola, revólver, munições e coletes.", foto: "https://www.diariodepernambuco.com.br/_midias/jpg/2026/06/07/600x400/1_whatsapp_image_2026_06_07_at_14_32_15-901611.jpeg", fonte: "Diario de Pernambuco", url: APOSTAS },
  ],
  links: [
    { rotulo: "INCG nº 568/2023 — Regimento Interno da DIM", url: INCG_568, grupo: "Legislação para estudo" },
    { rotulo: "INCG nº 605/2023 — normas organizacionais da PMPE", url: "https://www.pm.pe.gov.br/incg605-2023-textoatualizado/", grupo: "Legislação para estudo" },
    { rotulo: "BGSDS nº 046/2025 — designação do subcomandante", url: BGSDS_046, grupo: "Legislação para estudo" },
    { rotulo: "Legislação da PMPE (portal)", url: "https://www.pm.pe.gov.br/decretos-pmpe-legis/", grupo: "Legislação para estudo" },
    { rotulo: "12º BPM — página da PMPE", url: PMPE_12BPM },
    { rotulo: "DIM — PMPE", url: "https://www.pm.pe.gov.br/dim/" },
    { rotulo: "Ônibus — Rumo (Grande Recife)", url: "https://virtual.granderecife.pe.gov.br/rumo/" },
    { rotulo: "Aluguéis — OLX Recife", url: "https://www.olx.com.br/imoveis/aluguel/apartamentos/estado-pe/grande-recife/recife" },
    { rotulo: "Temporada mensal — Airbnb Recife", url: "https://www.airbnb.com.br/recife-brazil/stays/monthly" },
  ],
  fontes: [
    { info: "Endereço, telefones e e-mail", rotulo: "PMPE — página do 12º BPM", url: PMPE_12BPM },
    { info: "Companhias e bairros", rotulo: "PMPE — unidades operacionais", url: PMPE_UNIDADES },
    { info: "AIS 4 e bairros do Regimento", rotulo: "INCG nº 568/2023, art. 3º, IV", url: INCG_568 },
    { info: "Comandante", rotulo: "Relação de comandantes da PMPE (mar/2026)" },
    { info: "Subcomandante", rotulo: "BGSDS nº 046, de 14/03/2025 — Portaria nº 1562", url: BGSDS_046 },
    { info: "Operações", rotulo: "Portal de Prefeitura e Diario de Pernambuco (ver Operações)" },
    { info: "Distâncias", rotulo: "Rotas de carro OSRM/OpenStreetMap, sem trânsito — calculadas em 15/10/2026" },
  ],
}
