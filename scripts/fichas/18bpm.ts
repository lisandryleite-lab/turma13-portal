/**
 * Ficha padrão do 18º BPM — Batalhão Coronel Agenor Cavalcanti (Cabo de Santo Agostinho).
 * Regra: só entra informação com fonte; a fonte vai no próprio campo.
 * Conferido em 15/10/2026:
 *  - Comandante: relação de comandantes da PMPE (mar/2026). Subcomandante: não localizado em fonte pública.
 *  - Endereço: cadastro de unidades da PMPE (Rua Marechal Dantas Barreto, 205, Centro) + SDS (inauguração da
 *    nova sede na Rua Marechal Dantas Barreto; a anterior ficava na Cohab). A página do 18º BPM ainda traz a Cohab.
 *  - AIS 10 e bairros: INCG nº 568/2023, art. 3º, VIII.
 *  - Distâncias: rota de carro OSRM/OpenStreetMap até a Rua Marechal Dantas Barreto, sem trânsito.
 */
import type { Ficha } from "./tipos"

export const SIGLA = "18º BPM"

const PMPE_18BPM = "https://www.pm.pe.gov.br/18bpm/"
const PMPE_UNIDADES = "https://www.pm.pe.gov.br/unidades-operacionais-2/"
const INCG_568 = "https://www.pm.pe.gov.br/incg568-2023-textoatualizado/"
const NOVA_SEDE = "https://www.sds.pe.gov.br/noticias/11140-governador-inaugura-nova-sede-do-18-bpm-no-cabo-de-santo-agostinho"
const PORTO = "https://blogdomagno.com.br/tiroteio-leva-panico-a-banhistas-em-porto-de-galinhas-e-policia-confirma-tres-prisoes/"
const OP_VERAO = "https://portaldeprefeitura.com.br/pernambuco/sds-pernambuco-operacao-verao-reforco-policiamento-praias/631471/"
const VIATURAS = "https://portaldeprefeitura.com.br/pernambuco/pernambuco-reforca-frota-das-policias-militar-e-civil/632086/"
const SEMANA_SANTA = "https://www.diariodepernambuco.com.br/noticia/vidaurbana/2025/04/policia-militar-tem-4-700-lancamentos-extras-na-semana-santa.html"

export const FICHA: Ficha = {
  // 📍 Localização e contato
  endereco: "Rua Marechal Dantas Barreto, 205 – Centro, Cabo de Santo Agostinho-PE, CEP 54505-240 (PMPE — unidades operacionais; nova sede inaugurada pelo Governo — SDS).\nA sede anterior ficava na Vila da Cohab (SDS); a página antiga do batalhão ainda mostra esse endereço.",
  referenciaMapa: "18º BPM, Rua Marechal Dantas Barreto, 205, Centro, Cabo de Santo Agostinho - PE",
  telefone: "(81) 3181-3546 (unidades operacionais, PMPE). Também publicados: 3181-3540 / 3181-3541 / 3181-3542 / 3181-3543 (relação de comandantes da PMPE, mar/2026).",
  email: "18bpm@pm.pe.gov.br (PMPE)",
  distanciaBR: "Até a APMP (Paudalho): ~65 km, ~58 min de carro sem trânsito — um dos mais distantes da APMP.\nAté o Marco Zero (Recife): ~34 km, ~33 min sem trânsito.\nO Cabo é cortado pela BR-101 Sul; a PE-060 segue para Suape, Ipojuca e Porto de Galinhas.",
  // 🎖️ Comando e efetivo
  comandante: "TC QOPM Rubens Jorge Rocha Barreto Filho (relação de comandantes da PMPE, mar/2026).",
  subcomandante: "",
  cpm: "DIM — Diretoria Integrada Metropolitana · AIS 10 (INCG nº 568/2023).",
  estrutura: "Quatro companhias: 1ª e 2ª CIA no Cabo de Santo Agostinho, 3ª e 4ª CIA em Ipojuca (PMPE).\nA nova sede tem três alojamentos, área comum de descanso, estacionamento coberto para viaturas e salas para todas as seções (SDS).",
  efetivo: "430 policiais militares na inauguração da nova sede, com reforço de 36 soldados recém-formados (SDS).",
  // 🚓 Operação
  area: "Cabo de Santo Agostinho e Ipojuca (PMPE — página do 18º BPM):\n1ª CIA (Cabo): Charnequinha, Cabo Centro, Torrinha, Malaquias, Vila Cohab, São Francisco, Vila Social Contra Mocambo, Vila Santo Inácio, Gaibu, Suape, Rosário, Charneca, Pirapama, Alto Bela Vista, Cidade Garapu, Vila Claudete, Enseada dos Corais, Itapuama, Praia do Paiva, Calhetas, Vila de Nazaré, Engenho Massangana, Jussaral e Pista Preta.\n2ª CIA: Ponte dos Carvalhos, Pontezinha, Loteamento Nova Era, Vila Nova, João de Deus, Parque Morada Nova, Jardim Vertente, Alto do Sol, Alto do Pires, Largo do Miro, Porto do Barco, Loteamento Santo Antônio e Nossa Senhora do Bonfim.\n3ª CIA (Ipojuca): Centro do Ipojuca, Rurópolis, Camela e Engenho Guerra.\n4ª CIA (Ipojuca): Porto de Galinhas, Nossa Senhora do Ó, Salina, Serrambi, Maracaípe, Toquinho, Toco Grande, Pantanal, Muro Alto, Cupe, Pontal de Maracaípe e Engenho Saco.",
  sobreArea: "Área grande e variada: centro urbano do Cabo, Complexo Industrial Portuário de Suape, distritos rurais e o litoral sul turístico (Gaibu, Calhetas, Porto de Galinhas, Muro Alto, Maracaípe).\nNa temporada de verão, Porto de Galinhas e Ipojuca recebem reforço do 18º BPM e do BPTur (Operação Verão 2026/2027). Em 2026 o batalhão também atuou em ocorrência de tráfico na faixa de areia de Porto de Galinhas e recebeu viaturas novas para o patrulhamento.",
  // 🎯 Vagas — sem informação pública
  vagas: null,
  // 🏠 Onde morar
  morarPerto: "Centro do Cabo e Charneca ficam colados à sede. Cidade Garapu é opção residencial a ~6 km. Ponte dos Carvalhos fica no caminho do Recife. Quem prefere orla pode olhar Gaibu (mais longe) ou até Piedade, em Jaboatão (~23 km).\nDistâncias pela rota de carro (OpenStreetMap) até a Rua Marechal Dantas Barreto; tempos sem trânsito — a BR-101 Sul congestiona no pico.",
  bairros: [
    { nome: "Centro (Cabo)", km: "0,9 km", tempo: "a pé ~11 min · carro ~3 min", obs: "Bairro da sede; comércio e serviços." },
    { nome: "Charneca", km: "1,0 km", tempo: "a pé ~12 min · carro ~3 min", obs: "Vizinho da sede; área da 1ª CIA." },
    { nome: "Cidade Garapu", km: "5,9 km", tempo: "carro ~7–12 min", obs: "Loteamentos residenciais e comércio." },
    { nome: "Ponte dos Carvalhos", km: "9,3 km", tempo: "carro ~11–20 min", obs: "No caminho do Recife; área da 2ª CIA." },
    { nome: "Gaibu", km: "17,6 km", tempo: "carro ~18–25 min", obs: "Praia; opção de temporada." },
    { nome: "Piedade (Jaboatão)", km: "23,3 km", tempo: "carro ~21–40 min", obs: "Fora da área; muitos apartamentos, pela BR-101." },
  ],
  dicas: "",
  operacoes: [
    { titulo: "Réveillon 2026 — estreia dos aspirantes da T1", data: "31/12/2025", resumo: "A SDS montou 4.538 postos de trabalho e a PMPE contou, pela primeira vez, com os novos soldados e aspirantes do concurso estadual. Área reforçada pelo batalhão: Porto de Galinhas e Gaibu.", fonte: "BGSDS nº 239 (31/12/2025) — SDS", url: "https://www.sds.pe.gov.br/images/media/arquivos/Boletim_Geral/2025/12%20-%20Dezembro/1767211340_239%20BGSDS%20DE%2031DEZ2025.pdf" },
    { titulo: "Viaturas novas para o patrulhamento", data: "14/09/2026", resumo: "Na entrega de 149 viaturas do Governo, o 18º BPM (Cabo de Santo Agostinho) está entre os batalhões contemplados para o patrulhamento ostensivo.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2026/09/whatsapp-image-2026-09-14-at-133912.jpeg", fonte: "Portal de Prefeitura", url: VIATURAS },
    { titulo: "Operação Verão — reforço em Porto de Galinhas", data: "05/09/2026", resumo: "Porto de Galinhas e Ipojuca recebem reforço adicional do BPTur e do 18º BPM na temporada 2026/2027.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2026/09/operacao-verao-2026-em-pernambuco.jpg", fonte: "Portal de Prefeitura / SDS", url: OP_VERAO },
    { titulo: "Tráfico na praia de Porto de Galinhas", data: "abr/2026", resumo: "Após denúncias de tráfico no acesso à faixa de areia, o 18º BPM abordou quatro suspeitos; três foram presos após resistência e luta corporal (nota da PMPE).", foto: "https://blogdomagno.com.br/wp-content/uploads/2026/04/img_0049_36223660-36295073.webp", fonte: "Blog do Magno", url: PORTO },
    { titulo: "Nova sede do 18º BPM", data: "07/02", resumo: "Inauguração da sede na Rua Marechal Dantas Barreto, no Centro: três alojamentos, estacionamento coberto e 430 policiais, com 36 soldados recém-formados.", foto: "https://www.sds.pe.gov.br/images/imprensa/NOVA_SEDE_DO_18%C2%BA_BPM_07.02_3_Editada.JPG", fonte: "SDS", url: NOVA_SEDE },
  ],
  links: [
    { rotulo: "INCG nº 568/2023 — Regimento Interno da DIM", url: INCG_568, grupo: "Legislação para estudo" },
    { rotulo: "INCG nº 605/2023 — normas organizacionais da PMPE", url: "https://www.pm.pe.gov.br/incg605-2023-textoatualizado/", grupo: "Legislação para estudo" },
    { rotulo: "Legislação da PMPE (portal)", url: "https://www.pm.pe.gov.br/decretos-pmpe-legis/", grupo: "Legislação para estudo" },
    { rotulo: "18º BPM — página da PMPE", url: PMPE_18BPM },
    { rotulo: "DIM — PMPE", url: "https://www.pm.pe.gov.br/dim/" },
    { rotulo: "Ônibus — Rumo (Grande Recife)", url: "https://virtual.granderecife.pe.gov.br/rumo/" },
    { rotulo: "Aluguéis — OLX Cabo de Santo Agostinho", url: "https://www.olx.com.br/imoveis/aluguel/estado-pe/grande-recife/grande-recife/cabo-de-santo-agostinho" },
    { rotulo: "Temporada mensal — Airbnb Cabo de Santo Agostinho", url: "https://www.airbnb.com.br/cabo-de-santo-agostinho-brazil/stays/monthly" },
  ],
  fontes: [
    { info: "Endereço atual, telefone e bairros", rotulo: "PMPE — unidades operacionais", url: PMPE_UNIDADES },
    { info: "Companhias e bairros (detalhe)", rotulo: "PMPE — página do 18º BPM", url: PMPE_18BPM },
    { info: "Nova sede, estrutura e efetivo", rotulo: "SDS — Governo inaugura nova sede do 18º BPM", url: NOVA_SEDE },
    { info: "AIS 10", rotulo: "INCG nº 568/2023, art. 3º, VIII", url: INCG_568 },
    { info: "Comandante e telefones", rotulo: "Relação de comandantes da PMPE (mar/2026)" },
    { info: "Semana Santa 2025 (efetivo empregado)", rotulo: "Diario de Pernambuco, 17/04/2025", url: SEMANA_SANTA },
    { info: "Operações", rotulo: "Portal de Prefeitura, SDS e Blog do Magno (ver Operações)" },
    { info: "Distâncias", rotulo: "Rotas de carro OSRM/OpenStreetMap, sem trânsito — calculadas em 15/10/2026" },
  ],
}
