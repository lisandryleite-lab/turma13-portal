/**
 * Ficha padrão do 1º BPM — Batalhão Duarte Coelho (Olinda).
 * Regra: só entra informação com fonte; a fonte vai no próprio campo.
 * Conferido em 15/10/2026:
 *  - Comandante: BGSDS nº 046 (14/03/2025), Portaria nº 1557; citado como cmt em 07/08/2026.
 *  - Subcomandante: BGSDS nº 218 (19/11/2024), Portaria nº 6764.
 *  - Endereço, telefones, e-mail e bairros por CPM: páginas da PMPE (1º BPM e unidades operacionais).
 *  - Operações: matérias que citam o 1º BPM nominalmente.
 *  - Distâncias: rota de carro OSRM/OpenStreetMap até a Av. Carlos de Lima Cavalcanti (Rio Doce), sem trânsito.
 * Fora da ficha por falta de fonte verificável: AIS, efetivo, vagas, alojamento/refeitório.
 */
import type { Ficha } from "./tipos"

export const SIGLA = "1º BPM"

const PMPE_1BPM = "https://www.pm.pe.gov.br/1bpm-2/"
const PMPE_UNIDADES = "https://www.pm.pe.gov.br/unidades-operacionais-2/"
const BGSDS_046 = "https://www.sds.pe.gov.br/images/media/1741962113_046%20BGSDS%20DE%2014MAR2025.pdf"
const BGSDS_218 = "https://www.sds.pe.gov.br/images/media/1732024781_218%20BGSDS%20DE%2019NOV2024.pdf"
const BREAK = "https://www.diariodepernambuco.com.br/vida-urbana/2026/08/11720593-acao-integrada-remove-barricadas-instaladas-por-grupos-criminosos-na-comunidade-v8-em-olinda.html"
const BREAK_2 = "https://portaldeprefeitura.com.br/cotidiano/operacao-break-remove-barricadas-v8-v9-olinda/629085/"
const FUZIL = "https://portaldeprefeitura.com.br/policia/policia-militar-apreende-fuzil-com-28-municoes-em-comunidade-de-olinda/633941/"
const METRALHADORA = "https://www.diariodepernambuco.com.br/vida-urbana/2026/09/11724908-pm-apreende-metralhadora-calibre-45-apos-troca-de-tiros-em-olinda.html"
const LOLO = "https://www.diariodepernambuco.com.br/vida-urbana/2026/02/11707621-pm-apreende-cerca-de-120-litros-de-lolo-dentro-de-um-barraco-em-olinda-no-grande-recife.html"
const INSTRUCAO = "https://olinda.pe.gov.br/noticias/guardas-femininas-de-olinda-participam-de-instrucao-de-defesa-pessoal-promovida-pela-pmpe"
const DOJO = "https://www.pm.pe.gov.br/blog/2020/09/11/1o-bpm-implementa-artes-marciais-no-dojo-da-unidade/"

export const FICHA: Ficha = {
  // 📍 Localização e contato
  endereco: "Av. Gov. Carlos de Lima Cavalcanti, 5075 – Rio Doce, Olinda-PE (PMPE).",
  referenciaMapa: "Avenida Governador Carlos de Lima Cavalcanti, 5075, Rio Doce, Olinda - PE",
  telefone: "(81) 3181-1720 / 3181-1723 (PMPE). Também publicados: 3181-1721 / 3181-1722 (relação de comandantes da PMPE, mar/2026).",
  email: "1bpm@pm.pe.gov.br (PMPE)",
  distanciaBR: "Até a APMP (Paudalho): ~56 km, ~50 min de carro sem trânsito.\nAté o Marco Zero (Recife): ~13 km, ~15 min sem trânsito.\nA sede fica na Av. Carlos de Lima Cavalcanti, corredor que liga Olinda a Paulista; o Terminal Integrado Rio Doce é a referência para quem vai de ônibus.",
  // 🎖️ Comando e efetivo
  comandante: "TC QOPM Lenildo de Freitas Paixão — Portaria nº 1557 (BGSDS nº 046, de 14/03/2025), a contar de 06/03/2025; citado como comandante na Operação Break (07/08/2026).",
  subcomandante: "Maj QOPM Ilson de Oliveira Gonçalves — Portaria nº 6764 (BGSDS nº 218, de 19/11/2024), a contar de 01/11/2024.",
  cpm: "DIM — Diretoria Integrada Metropolitana (PMPE).",
  estrutura: "Três companhias territoriais: 1ª, 2ª e 3ª CPM (PMPE — unidades operacionais).",
  efetivo: "Não divulgado.",
  // 🚓 Operação
  area: "Município de Olinda (PMPE — unidades operacionais):\n1ª CPM: Bairro Novo, Casa Caiada, Jardim Atlântico e Rio Doce.\n2ª CPM: Amaro Branco, Bonsucesso, Fragoso, Guadalupe, Bultrins, Ouro Preto, Santa Tereza, Salgadinho, Tabajara, Monte e zona rural de Olinda.\n3ª CPM: Águas Compridas, Alto da Bondade, Alto Sol Nascente, Caixa d'Água, Peixinhos, Passarinho, São Benedito, Sítio Novo, Sapucaia, Jardim Brasil, Vila Popular, Aguazinha e Alto da Conquista.",
  sobreArea: "Policiamento territorial em toda Olinda: orla e bairros residenciais (Bairro Novo, Casa Caiada, Rio Doce) e comunidades densas na divisa com Recife e Paulista (Peixinhos, Águas Compridas, Passarinho).\nEm 2026 o batalhão aparece em apreensões de armas (fuzil e metralhadoras em Peixinhos e Jardim Atlântico), combate ao tráfico e operações integradas, como a Operação Break, que retirou barricadas nas comunidades do V8 e V9. O Sítio Histórico tem policiamento turístico próprio (1ª Cia do BPTur).",
  // 🎯 Vagas — sem informação pública
  vagas: null,
  // 🏠 Onde morar
  morarPerto: "Comece por Rio Doce, Casa Caiada e Jardim Atlântico: ficam a poucos minutos da sede e têm comércio e serviços. Janga (Paulista) e Bairro Novo também são opções próximas.\nAntes de fechar, veja garagem, risco de alagamento na rua e o trajeto no horário do serviço.\nDistâncias pela rota de carro (OpenStreetMap) até a Av. Carlos de Lima Cavalcanti, em Rio Doce; tempos sem trânsito.",
  bairros: [
    { nome: "Rio Doce", km: "0,9 km", tempo: "a pé ~11 min · carro ~3 min", obs: "Bairro da sede; Terminal Integrado Rio Doce." },
    { nome: "Casa Caiada", km: "1,4 km", tempo: "carro ~3–6 min", obs: "Orla, comércio e serviços; boa oferta de apartamentos." },
    { nome: "Jardim Atlântico", km: "2,2 km", tempo: "carro ~5–8 min", obs: "Residencial, perto da orla." },
    { nome: "Bairro Novo", km: "3,6 km", tempo: "carro ~6–12 min", obs: "Orla e comércio; mais perto do Sítio Histórico." },
    { nome: "Janga (Paulista)", km: "5,1 km", tempo: "carro ~8–15 min", obs: "Já em Paulista, pela Av. Carlos de Lima Cavalcanti." },
    { nome: "Ouro Preto", km: "6,1 km", tempo: "carro ~10–18 min", obs: "Área da 2ª CPM; mais afastado da sede." },
  ],
  // 💡 Dicas
  dicas: "Antes de se apresentar, ligue para a unidade e pergunte local, horário, fardamento, escala e estacionamento.\nConheça a divisão das companhias (1ª, 2ª e 3ª CPM) — ajuda a entender as ocorrências e o rádio.\nO batalhão tem dojo para instrução física e defesa pessoal (PMPE, 2020; instrução de defesa pessoal em abr/2026).\nEm dia de prévias e no Carnaval, o trânsito para o Sítio Histórico fica bloqueado — planeje o deslocamento.",
  operacoes: [
    { titulo: "Fuzil apreendido em Peixinhos", data: "13/10/2026", resumo: "Em rondas na comunidade do Giriquiti, policiais do 1º BPM apreenderam um fuzil 5.56 e 28 munições deixados por suspeitos que fugiram pelo mangue.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2026/10/ellen-foto-nao-mexer-37.jpg", fonte: "Portal de Prefeitura (foto: PMPE)", url: FUZIL },
    { titulo: "Metralhadora .45 em Jardim Atlântico", data: "24/09/2026", resumo: "Após troca de tiros na comunidade Ilha do Rato, o 1º BPM apreendeu uma metralhadora .45, carregadores e munições abandonados por três suspeitos.", foto: "https://www.diariodepernambuco.com.br/_midias/jpg/2026/09/25/600x400/1_metralhadora_apreensao-964159.jpg", fonte: "Diario de Pernambuco (foto: PCPE)", url: METRALHADORA },
    { titulo: "Operação Break — barricadas no V8 e V9", data: "07/08/2026", resumo: "Ação integrada com ~100 agentes (1º BPM, GTA, CIPMoto, BPRp, CIPCães e outras unidades, Polícia Civil e Guarda de Olinda) retirou barricadas usadas pelo tráfico. Cmt do 1º BPM: TC Lenildo.", foto: "https://www.diariodepernambuco.com.br/_midias/jpg/2026/08/07/600x400/1_operacao_v8-934054.jpeg", fonte: "Diario de Pernambuco", url: BREAK },
    { titulo: "120 litros de loló em Salgadinho", data: "12/02/2026", resumo: "Após denúncia, equipe do 1º BPM deteve dois suspeitos e apreendeu cerca de 120 litros de loló armazenados em galões.", foto: "https://www.diariodepernambuco.com.br/_midias/jpg/2026/02/13/600x400/1_lolo-847333.jpg", fonte: "Diario de Pernambuco", url: LOLO },
    { titulo: "Instrução de defesa pessoal no 1º BPM", data: "09/04/2026", resumo: "O batalhão sediou instrução de técnicas de defesa pessoal para o efetivo feminino de várias forças, incluindo a Guarda Civil de Olinda.", foto: "https://olinda.pe.gov.br/storage/imports/2026/08/9aef58e1-b03f-4401-b50f-0ce3e0031e5d-whatsapp-image-2026-04-09-at-161722.jpeg", fonte: "Prefeitura de Olinda", url: INSTRUCAO },
    { titulo: "Dojo do 1º BPM", data: "11/09/2020", resumo: "A unidade implantou artes marciais no dojo do quartel, usado para instrução física e defesa pessoal.", foto: "https://www.pm.pe.gov.br/wp-content/uploads/2020/09/c7dbe403-48cb-42d3-8074-8be34e1fdf02.jpg", fonte: "PMPE", url: DOJO },
  ],
  links: [
    { rotulo: "BGSDS nº 046/2025 — designação do comandante", url: BGSDS_046, grupo: "Legislação para estudo" },
    { rotulo: "BGSDS nº 218/2024 — designação do subcomandante", url: BGSDS_218, grupo: "Legislação para estudo" },
    { rotulo: "INCG nº 605/2023 — normas organizacionais da PMPE", url: "https://www.pm.pe.gov.br/incg605-2023-textoatualizado/", grupo: "Legislação para estudo" },
    { rotulo: "Legislação da PMPE (portal)", url: "https://www.pm.pe.gov.br/decretos-pmpe-legis/", grupo: "Legislação para estudo" },
    { rotulo: "1º BPM — página da PMPE", url: PMPE_1BPM },
    { rotulo: "DIM — PMPE", url: "https://www.pm.pe.gov.br/dim/" },
    { rotulo: "Terminais de ônibus — Grande Recife", url: "https://www.granderecife.pe.gov.br/transporte/sistema-estrutural-integrado/terminais/" },
    { rotulo: "Ônibus — Rumo (Grande Recife)", url: "https://virtual.granderecife.pe.gov.br/rumo/" },
    { rotulo: "Aluguéis — OLX Olinda", url: "https://www.olx.com.br/imoveis/aluguel/apartamentos/estado-pe/grande-recife/grande-recife/olinda" },
    { rotulo: "Temporada mensal — Airbnb Olinda", url: "https://www.airbnb.com.br/olinda-brazil/stays/monthly" },
  ],
  fontes: [
    { info: "Endereço, telefones e e-mail", rotulo: "PMPE — página do 1º BPM", url: PMPE_1BPM },
    { info: "Companhias e bairros", rotulo: "PMPE — unidades operacionais", url: PMPE_UNIDADES },
    { info: "Comandante", rotulo: "BGSDS nº 046, de 14/03/2025 — Portaria nº 1557", url: BGSDS_046 },
    { info: "Comandante em 2026", rotulo: "Diario de Pernambuco — Operação Break, 07/08/2026", url: BREAK },
    { info: "Subcomandante", rotulo: "BGSDS nº 218, de 19/11/2024 — Portaria nº 6764", url: BGSDS_218 },
    { info: "Unidades na Operação Break", rotulo: "Portal de Prefeitura, 07/08/2026", url: BREAK_2 },
    { info: "Apreensões de 2026", rotulo: "Diario de Pernambuco e Portal de Prefeitura (ver Operações)" },
    { info: "Dojo e instrução", rotulo: "PMPE (2020) e Prefeitura de Olinda (abr/2026)", url: INSTRUCAO },
    { info: "Distâncias", rotulo: "Rotas de carro OSRM/OpenStreetMap, sem trânsito — calculadas em 15/10/2026" },
  ],
}
