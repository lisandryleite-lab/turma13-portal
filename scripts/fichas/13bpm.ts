/**
 * Ficha padrão do 13º BPM — Batalhão Coronel PM João Nunes (Recife).
 * Regra: só entra informação com fonte; a fonte vai no próprio campo.
 * Conferido em 15/10/2026:
 *  - Comandante: BGSDS nº 046 (14/03/2025), Portaria nº 1563; mantida na relação de comandantes da PMPE (mar/2026).
 *  - Subcomandante: BGSDS nº 046 (14/03/2025), Portaria nº 1564.
 *  - AIS 2 e bairros: INCG nº 568/2023, art. 3º, V.
 *  - Endereço: a página do 13º BPM traz Av. Agamenon Magalhães, 700 (Santo Amaro); o cadastro de
 *    unidades traz Rua Odorico Mendes, 700 (Campo Grande) — rua colada à Agamenon. Ficam as duas.
 *  - Distâncias: rota de carro OSRM/OpenStreetMap até a Rua Odorico Mendes, sem trânsito.
 */
import type { Ficha } from "./tipos"

export const SIGLA = "13º BPM"

const PMPE_13BPM = "https://www.pm.pe.gov.br/13bpm/"
const PMPE_UNIDADES = "https://www.pm.pe.gov.br/unidades-operacionais-2/"
const INCG_568 = "https://www.pm.pe.gov.br/incg568-2023-textoatualizado/"
const BGSDS_046 = "https://www.sds.pe.gov.br/images/media/1741962113_046%20BGSDS%20DE%2014MAR2025.pdf"
const DERBY = "https://portaldeprefeitura.com.br/cotidiano/recife-policiais-prendem-traficante-droga-praca-derby/601976/"
const AGUA_FRIA = "https://portaldeprefeitura.com.br/cotidiano/policia-apreende-big-bigs-de-maconha-e-suspeito-e-detido/598126/"
const DANIEL = "https://portaldeprefeitura.com.br/policia/no-recife-pms-participam-de-festa-de-aniversario-do-pequeno/591379/"

export const FICHA: Ficha = {
  // 📍 Localização e contato
  endereco: "Av. Agamenon Magalhães, 700 – Santo Amaro, Recife-PE (página do 13º BPM, PMPE).\nO cadastro de unidades da PMPE informa Rua Odorico Mendes, 700 – Campo Grande, rua junto à Agamenon.",
  referenciaMapa: "13º BPM, Rua Odorico Mendes, 700, Campo Grande, Recife - PE",
  telefone: "(81) 3183-5438 / 3183-5429 (página do 13º BPM, PMPE). Também publicados: 3183-5440 / 3183-5439 (unidades operacionais) e 3183-5426 / 5428 (relação de comandantes, mar/2026).",
  email: "13bpm@pm.pe.gov.br · secretaria: secretaria13bpm@gmail.com (PMPE)",
  distanciaBR: "A sede fica no eixo da Av. Agamenon Magalhães, principal corredor do Recife, com acesso rápido ao centro, a Olinda e à BR-101.",
  // 🎖️ Comando e efetivo
  comandante: "TC QOPM Carla Cristina de Oliveira — Portaria nº 1563 (BGSDS nº 046, de 14/03/2025), a contar de 06/03/2025; mantida na relação de comandantes da PMPE (mar/2026).",
  subcomandante: "Maj QOPM Gilson Monteiro da Silva — Portaria nº 1564 (BGSDS nº 046, de 14/03/2025), a contar de 06/03/2025.",
  cpm: "DIM — Diretoria Integrada Metropolitana · AIS 2 (INCG nº 568/2023).",
  estrutura: "Companhias territoriais 1ª, 2ª e 3ª CPM (PMPE — unidades operacionais).",
  efetivo: "Não divulgado.",
  // 🚓 Operação
  area: "Recife, faixa central-norte (PMPE — unidades operacionais):\n1ª CPM: Campo Grande, Torreão, Espinheiro, Aflitos, Derby, Graças, Rosarinho, Encruzilhada, Ponto de Parada e Hipódromo.\n2ª CPM: Cordeiro, Zumbi, Madalena, Torre e Iputinga.\n3ª CPM: Água Fria, Campina do Barreto, Arruda, Fundão, Cajueiro, Chão de Estrelas e Alto do Pascoal.\nO Regimento Interno da DIM (INCG nº 568/2023) lista os mesmos bairros, com Chão de Estrelas (Peixinhos/porção Recife).",
  sobreArea: "Faixa central-norte do Recife ao longo da Av. Agamenon Magalhães: bairros residenciais e de serviços (Graças, Espinheiro, Aflitos, Derby, Madalena, Torre) e áreas populosas (Água Fria, Arruda, Campo Grande, Campina do Barreto).\nO batalhão aparece em ações de Prática Operacional Supervisionada (POS), combate ao tráfico e policiamento comunitário.",
  // 🎯 Vagas — sem informação pública
  vagas: null,
  // 🏠 Onde morar
  morarPerto: "Campo Grande e Encruzilhada ficam colados à sede. Espinheiro, Graças, Aflitos e Rosarinho são bairros residenciais muito procurados, com prédios, comércio e serviços, a poucos minutos.\nDistâncias pela rota de carro (OpenStreetMap) até a Rua Odorico Mendes; tempos sem trânsito — a Agamenon congestiona bastante no pico.",
  bairros: [
    { nome: "Campo Grande", km: "1,1 km", tempo: "a pé ~14 min · carro ~3 min", obs: "Bairro vizinho da sede." },
    { nome: "Encruzilhada", km: "2,2 km", tempo: "carro ~4–8 min", obs: "Comércio forte e mercado público." },
    { nome: "Espinheiro", km: "3,3 km", tempo: "carro ~5–12 min", obs: "Residencial, muitos prédios." },
    { nome: "Rosarinho", km: "3,4 km", tempo: "carro ~5–12 min", obs: "Residencial, tranquilo." },
    { nome: "Aflitos", km: "3,7 km", tempo: "carro ~6–12 min", obs: "Residencial, perto do Derby." },
    { nome: "Graças", km: "3,8 km", tempo: "carro ~6–12 min", obs: "Residencial e de serviços; área da 1ª CPM." },
  ],
  dicas: "",
  operacoes: [
    { titulo: "Tráfico e arma na Praça do Derby — POS", data: "25/08/2025", resumo: "Durante ação de Prática Operacional Supervisionada (POS), policiais do 13º BPM prenderam um suspeito de tráfico e porte ilegal de arma na Praça do Derby.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2025/08/recife-policiais-prendem-traficante-droga-praca-derby.jpg", fonte: "Portal de Prefeitura", url: DERBY },
    { titulo: "Ponto de venda de drogas em Água Fria", data: "30/06/2025", resumo: "Após informação de venda de drogas na Rua da Vitória, o 13º BPM montou cerco e deteve o suspeito, que tentou fugir.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2025/07/policia-apreende-big-bigs-de-maconha-e-suspeito-e-detido.jpg", fonte: "Portal de Prefeitura (fotos: divulgação)", url: AGUA_FRIA },
    { titulo: "Aniversário do pequeno \"policial\" Daniel", data: "22/03/2025", resumo: "Em rondas no Parque das Graças, policiais do 13º BPM foram convidados por um menino de 3 anos para a festa de aniversário dele — policiamento comunitário.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2025/03/nao-mexer-rodolfo-2025-03-23t213914590.jpg", fonte: "Portal de Prefeitura (foto: PMPE)", url: DANIEL },
  ],
  links: [
    { rotulo: "INCG nº 568/2023 — Regimento Interno da DIM", url: INCG_568, grupo: "Legislação para estudo" },
    { rotulo: "INCG nº 605/2023 — normas organizacionais da PMPE", url: "https://www.pm.pe.gov.br/incg605-2023-textoatualizado/", grupo: "Legislação para estudo" },
    { rotulo: "BGSDS nº 046/2025 — designação do comando", url: BGSDS_046, grupo: "Legislação para estudo" },
    { rotulo: "Legislação da PMPE (portal)", url: "https://www.pm.pe.gov.br/decretos-pmpe-legis/", grupo: "Legislação para estudo" },
    { rotulo: "13º BPM — página da PMPE", url: PMPE_13BPM },
    { rotulo: "DIM — PMPE", url: "https://www.pm.pe.gov.br/dim/" },
    { rotulo: "Ônibus — Rumo (Grande Recife)", url: "https://virtual.granderecife.pe.gov.br/rumo/" },
    { rotulo: "Aluguéis — OLX Recife", url: "https://www.olx.com.br/imoveis/aluguel/apartamentos/estado-pe/grande-recife/recife" },
    { rotulo: "Temporada mensal — Airbnb Recife", url: "https://www.airbnb.com.br/recife-brazil/stays/monthly" },
  ],
  fontes: [
    { info: "Endereço, telefones e e-mail", rotulo: "PMPE — página do 13º BPM", url: PMPE_13BPM },
    { info: "Endereço alternativo, companhias e bairros", rotulo: "PMPE — unidades operacionais", url: PMPE_UNIDADES },
    { info: "AIS 2 e bairros do Regimento", rotulo: "INCG nº 568/2023, art. 3º, V", url: INCG_568 },
    { info: "Comandante e subcomandante", rotulo: "BGSDS nº 046, de 14/03/2025 — Portarias nº 1563 e 1564", url: BGSDS_046 },
    { info: "Comandante em 2026", rotulo: "Relação de comandantes da PMPE (mar/2026)" },
    { info: "Operações", rotulo: "Portal de Prefeitura (ver Operações)" },
    { info: "Distâncias", rotulo: "Rotas de carro OSRM/OpenStreetMap, sem trânsito — calculadas em 15/10/2026" },
  ],
}
