/**
 * Ficha padrão do 6º BPM — Batalhão Henrique Dias (Prazeres, Jaboatão dos Guararapes).
 * Regra: só entra informação com fonte; a fonte vai no próprio campo.
 * Conferido em 15/10/2026:
 *  - Comandante: relação de comandantes da PMPE (mar/2026).
 *  - Subcomandante: BGSDS nº 046 (14/03/2025), Portaria nº 1558.
 *  - AIS 6 e bairros do Regimento Interno: INCG nº 568/2023, art. 3º, II (texto atualizado).
 *  - Endereço, telefones, e-mails e bairros por CPM: páginas da PMPE (6º BPM e unidades operacionais).
 *  - Operações: matérias/notícias que citam o 6º BPM nominalmente.
 *  - Distâncias: rota de carro OSRM/OpenStreetMap até a Estrada da Batalha (trecho de Prazeres), sem trânsito.
 * Fora da ficha por falta de fonte com link: decreto de criação, apreensão do BG 062/2025,
 * requerimento da Alepe (mar/2025), efetivo, vagas, alojamento/refeitório.
 */
import type { Ficha } from "./tipos"

export const SIGLA = "6º BPM"

const PMPE_6BPM = "https://www.pm.pe.gov.br/6bpm/"
const PMPE_UNIDADES = "https://www.pm.pe.gov.br/unidades-operacionais-2/"
const INCG_568 = "https://www.pm.pe.gov.br/incg568-2023-textoatualizado/"
const BGSDS_046 = "https://www.sds.pe.gov.br/images/media/1741962113_046%20BGSDS%20DE%2014MAR2025.pdf"
const PIEDADE = "https://portaldeprefeitura.com.br/policia/jabotao-policia-militar-apreende-drogas-armas-e-municoes-com-dois/633226/"
const DETRAN = "https://www.diariodepernambuco.com.br/vida-urbana/2025/08/7797085-pm-e-detran-realiza-operacao-para-combater-rolezinhos-em-prazeres.html"
const PITOMBA = "https://www.pm.pe.gov.br/blog/2024/04/10/policia-militar-monta-esquema-de-seguranca-para-a-festa-da-pitomba/"
const ANIVERSARIO = "https://www.pm.pe.gov.br/blog/2022/03/04/6o-bpm-comemora-41-anos-de-existencia/"

export const FICHA: Ficha = {
  // 📍 Localização e contato
  endereco: "Estrada da Batalha, s/n – Prazeres, Jaboatão dos Guararapes-PE (PMPE).",
  referenciaMapa: "6º BPM, Estrada da Batalha, Prazeres, Jaboatão dos Guararapes - PE",
  telefone: "(81) 3181-1650 / 3181-1657 (página do 6º BPM, PMPE). Também publicados: 3183-5450 / 3183-5445 (unidades operacionais, PMPE) e 3183-5442 / 5443 / 5454 (relação de comandantes da PMPE, mar/2026).",
  email: "6bpm@pm.pe.gov.br · secretaria: sec.6bpm.pmpe@gmail.com (PMPE)",
  distanciaBR: "Até a APMP (Paudalho): ~47 km, ~45 min de carro sem trânsito.\nAté o Marco Zero (Recife): ~13 km, ~16 min sem trânsito.\nAcesso pela Estrada da Batalha, ligada a Prazeres, à BR-101 e à região do aeroporto e dos Montes Guararapes. De ônibus/metrô: TI Prazeres e estações Prazeres, Monte dos Guararapes e Cajueiro Seco (Linha Sul); a linha 118 (Prazeres/Boa Viagem) passa pela Estrada da Batalha (Grande Recife).",
  // 🎖️ Comando e efetivo
  comandante: "TC PM Carlos Fernando de Souza Santos (relação de comandantes da PMPE, mar/2026).",
  subcomandante: "Maj QOPM Wilson Carlos Silva Queiroz — Portaria nº 1558 (BGSDS nº 046, de 14/03/2025), a contar de 10/03/2025.",
  cpm: "DIM — Diretoria Integrada Metropolitana · AIS 6 (INCG nº 568/2023).",
  estrutura: "Quatro companhias territoriais: 1ª, 2ª, 3ª e 4ª CPM (PMPE — unidades operacionais). Batalhão com 41 anos em mar/2022 (PMPE), sede junto ao Parque Histórico dos Guararapes.",
  efetivo: "Não divulgado.",
  // 🚓 Operação
  area: "Jaboatão dos Guararapes, dividindo a AIS 6 com o 25º BPM (PMPE — unidades operacionais):\n1ª CPM: Candeias e Barra de Jangada.\n2ª CPM: Piedade, Jardim Prazeres e Sotave.\n3ª CPM: Cajueiro Seco e Prazeres.\n4ª CPM: Muribeca, Muribequinha, Marcos Freire, Jardim Jordão, Guararapes e Comporta.\nO Regimento Interno da DIM (INCG nº 568/2023) também lista Brigadeiro Ivo Borges, Catamarã, Córrego da Batalha, Córrego da Rosa, Curcurana, Dom Hélder, Jardim Piedade, Massaranduba, Porta Larga, Vila dos Palmares, Dois Carneiros, UR-6 e UR-11.",
  sobreArea: "Área variada: orla com prédios e comércio (Candeias, Piedade, Barra de Jangada), corredores metropolitanos e terminais em Prazeres e Cajueiro Seco, e bairros residenciais e conjuntos habitacionais em Muribeca e Marcos Freire.\nO batalhão atua em policiamento territorial, apreensões de armas e drogas, operações integradas com o Detran contra motos adulteradas e rachas, e no policiamento da Festa da Pitomba, no Parque dos Guararapes (a pé, motorizado e montado, com reforço da DIM e DIRESP).",
  // 🎯 Vagas — sem informação pública
  vagas: null,
  // 🏠 Onde morar
  morarPerto: "Prazeres e Guararapes ficam mais perto da sede e têm comércio, serviços, TI Prazeres e metrô. Piedade e Cajueiro Seco têm mais apartamentos e prédios com garagem; Candeias é opção de orla, um pouco mais longe.\nA Estrada da Batalha é extensa e o endereço não tem número — confira no mapa a entrada do quartel antes de escolher o imóvel, e veja drenagem da rua e trajeto no horário do serviço.\nDistâncias pela rota de carro (OpenStreetMap) até a Estrada da Batalha, trecho de Prazeres; tempos sem trânsito.",
  bairros: [
    { nome: "Prazeres", km: "1,1 km", tempo: "a pé ~14 min · carro ~3 min", obs: "Bairro da sede; comércio, TI Prazeres e estação do metrô." },
    { nome: "Guararapes", km: "2,3 km", tempo: "carro ~4–8 min", obs: "Residencial, perto do Parque dos Guararapes." },
    { nome: "Cajueiro Seco", km: "3,1 km", tempo: "carro ~5–10 min", obs: "Terminal integrado e estação da Linha Sul do metrô." },
    { nome: "Jardim Jordão", km: "3,2 km", tempo: "carro ~5–10 min", obs: "Residencial, área da 4ª CPM." },
    { nome: "Piedade", km: "3,3 km", tempo: "carro ~6–15 min", obs: "Orla; mais apartamentos e serviços." },
    { nome: "Candeias", km: "6,6 km", tempo: "carro ~10–20 min", obs: "Orla, área da 1ª CPM; mais afastado da sede." },
  ],
  dicas: "",
  operacoes: [
    { titulo: "Réveillon 2026 — estreia dos aspirantes da T1", data: "31/12/2025", resumo: "A SDS montou 4.538 postos de trabalho e a PMPE contou, pela primeira vez, com os novos soldados e aspirantes do concurso estadual. Área reforçada pelo batalhão: Jaboatão dos Guararapes, com o 25º BPM.", fonte: "BGSDS nº 239 (31/12/2025) — SDS", url: "https://www.sds.pe.gov.br/images/media/arquivos/Boletim_Geral/2025/12%20-%20Dezembro/1767211340_239%20BGSDS%20DE%2031DEZ2025.pdf" },
    { titulo: "Irmãos presos com armas e drogas em Piedade", data: "30/09/2026", resumo: "Policiais do 6º BPM prenderam dois irmãos suspeitos de tráfico, com duas armas, duas réplicas, 14 munições, três balanças e ~543 g de maconha.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2026/10/ellen-foto-nao-mexer-23.jpg", fonte: "Portal de Prefeitura (foto: PMPE)", url: PIEDADE },
    { titulo: "Operação com o Detran contra rachas e motos adulteradas", data: "16/08/2025", resumo: "6º BPM, Detran e inteligência da PMPE fiscalizaram motociclistas em Prazeres: motos com sinais adulterados e pessoas conduzidas por perturbação do sossego.", foto: "https://www.diariodepernambuco.com.br/_midias/jpg/2025/08/17/600x400/1_rolezinho_prazeres-718054.jpg", fonte: "Diario de Pernambuco (foto: 6º BPM)", url: DETRAN },
    { titulo: "Festa da Pitomba — Parque dos Guararapes", data: "09–14/04/2024", resumo: "Planejamento do 6º BPM com reforço da DIM e DIRESP: policiamento a pé, motorizado e montado e posto de comando fixo.", foto: "https://www.pm.pe.gov.br/wp-content/uploads/2024/04/IMG-20240410-WA0026.jpg", fonte: "PMPE (fotos: Sgt Elton Camilo)", url: PITOMBA },
    { titulo: "6º BPM completa 41 anos", data: "04/03/2022", resumo: "Solenidade nas instalações do batalhão, em Prazeres, pelo aniversário da unidade.", foto: "https://www.pm.pe.gov.br/wp-content/uploads/2022/03/WhatsApp-Image-2022-03-04-at-16.03.22-3.jpeg", fonte: "PMPE", url: ANIVERSARIO },
  ],
  links: [
    { rotulo: "INCG nº 568/2023 — Regimento Interno da DIM", url: INCG_568, grupo: "Legislação para estudo" },
    { rotulo: "INCG nº 605/2023 — normas organizacionais da PMPE", url: "https://www.pm.pe.gov.br/incg605-2023-textoatualizado/", grupo: "Legislação para estudo" },
    { rotulo: "BGSDS nº 046/2025 — designação do subcomandante", url: BGSDS_046, grupo: "Legislação para estudo" },
    { rotulo: "Legislação da PMPE (portal)", url: "https://www.pm.pe.gov.br/decretos-pmpe-legis/", grupo: "Legislação para estudo" },
    { rotulo: "6º BPM — página da PMPE", url: PMPE_6BPM },
    { rotulo: "DIM — PMPE", url: "https://www.pm.pe.gov.br/dim/" },
    { rotulo: "Terminais de ônibus — Grande Recife", url: "https://www.granderecife.pe.gov.br/transporte/sistema-estrutural-integrado/terminais/" },
    { rotulo: "Ônibus — Rumo (Grande Recife)", url: "https://virtual.granderecife.pe.gov.br/rumo/" },
    { rotulo: "Aluguéis — OLX Jaboatão", url: "https://www.olx.com.br/imoveis/aluguel/apartamentos/estado-pe/grande-recife/grande-recife/jaboatao-dos-guararapes" },
    { rotulo: "Aluguéis — ZAP Prazeres", url: "https://www.zapimoveis.com.br/aluguel/apartamentos/pe%2Bjaboatao-dos-guararapes%2B%2Bprazeres/" },
    { rotulo: "Temporada mensal — Airbnb Jaboatão", url: "https://www.airbnb.com.br/jaboatao-dos-guararapes-brazil/stays/monthly" },
  ],
  fontes: [
    { info: "Endereço, telefones e e-mail", rotulo: "PMPE — página do 6º BPM", url: PMPE_6BPM },
    { info: "Companhias, bairros e telefones", rotulo: "PMPE — unidades operacionais", url: PMPE_UNIDADES },
    { info: "AIS 6 e bairros do Regimento", rotulo: "INCG nº 568/2023, art. 3º, II", url: INCG_568 },
    { info: "Comandante e telefones", rotulo: "Relação de comandantes da PMPE (mar/2026)" },
    { info: "Subcomandante", rotulo: "BGSDS nº 046, de 14/03/2025 — Portaria nº 1558", url: BGSDS_046 },
    { info: "Idade do batalhão", rotulo: "PMPE — 6º BPM comemora 41 anos (04/03/2022)", url: ANIVERSARIO },
    { info: "Operações", rotulo: "Portal de Prefeitura, Diario de Pernambuco e PMPE (ver Operações)" },
    { info: "Linhas de ônibus", rotulo: "Grande Recife — terminais e Rumo", url: "https://www.granderecife.pe.gov.br/transporte/sistema-estrutural-integrado/terminais/" },
    { info: "Distâncias", rotulo: "Rotas de carro OSRM/OpenStreetMap, sem trânsito — calculadas em 15/10/2026" },
  ],
}
