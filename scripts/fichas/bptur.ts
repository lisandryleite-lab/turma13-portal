/**
 * Ficha padrão do BPTur (modelo para os demais batalhões).
 * Seções: localização · comando e efetivo · operação (com fotos) · vagas ·
 * onde morar · dicas + links úteis, legislação para estudo e fontes.
 *
 * Regra: só entra informação com fonte; a fonte vai no próprio campo.
 * Conferido em 15/10/2026:
 *  - Lei nº 18.892/2025, art. 8º (Alepe): cria o BPTur, DIRESP, sede no Recife Antigo.
 *  - Endereço atual: Prefeitura de Olinda (Carnaval 2026) — Av. Sigismundo Gonçalves, 515.
 *  - Comandante: "tenente-coronel Cezar Belo, comandante do BPTur" — Operação Verão, 05/09/2026.
 *  - Subcomandante: BGSDS nº 142 (07/08/2025), Portaria nº 4282; citado em fev/2026.
 *  - Distâncias: rota de carro OSRM/OpenStreetMap, sem trânsito; a pé a ~5 km/h.
 */
import type { Ficha } from "./tipos"

export const SIGLA = "BPTur"

const LEI_18892 = "https://legis.alepe.pe.gov.br/texto.aspx?id=83619"
const OLINDA_2026 = "https://olinda.pe.gov.br/noticias/perdidos-e-achados-de-olinda-saiba-como-recuperar-o-que-perdeu-no-carnaval"
const OP_VERAO = "https://portaldeprefeitura.com.br/pernambuco/sds-pernambuco-operacao-verao-reforco-policiamento-praias/631471/"
const BGSDS_142 = "https://www.sds.pe.gov.br/images/media/1754662866_142%20BGSDS%20DE%2007AGO2025.pdf"
const SDS_TURISTAS = "https://portaldeprefeitura.com.br/bastidores-da-politica/pernambuco-tem-investimento-na-seguranca-dos-turistas-diz-sds/604592/"
const MEIA_NOITE = "https://portaldeprefeitura.com.br/regiao-metropolitana/olinda/homem-da-meia-noite-conheca-estrutura-percurso-do-desfile/615224/"
const VIATURAS = "https://portaldeprefeitura.com.br/pernambuco/pernambuco-investimento-seguranca-publica-fuzis-viaturas/633340/"
const NOVA_SEDE = "https://www.cbnrecife.com/2026/05/26/pernambuco-anuncia-pacote-de-r-200-milhoes-para-obras-em-seguranca-educacao-e-patrimonio-no-recife/"

export const FICHA: Ficha = {
  // 📍 Localização e contato
  endereco: "Av. Sigismundo Gonçalves, 515 – Varadouro, Olinda-PE (Prefeitura de Olinda, Carnaval 2026).\nSede definitiva prevista no Bairro do Recife (Recife Antigo) — Lei nº 18.892/2025, art. 8º. A obra da nova sede (R$ 8,7 milhões) foi anunciada pelo Governo em 26/05/2026.",
  referenciaMapa: "Avenida Sigismundo Gonçalves, 515, Varadouro, Olinda - PE",
  telefone: "(81) 3181-3700 / 3181-3702 / 3181-1700 (relação de comandantes da PMPE, mar/2026)",
  email: "ciatur@pm.pe.gov.br (página de unidades da PMPE)",
  distanciaBR: "Acesso pela Av. Sigismundo Gonçalves (liga Varadouro e Carmo), PE-15 e Av. Cruz Cabugá. Trânsito pesado no pico, nas prévias e no Carnaval, com ruas bloqueadas no Sítio Histórico.",
  // 🎖️ Comando e efetivo
  comandante: "TC PM Arthur Cezar Belo dos Santos — citado como comandante do BPTur na Operação Verão (SDS, 05/09/2026).",
  subcomandante: "Maj QOPM George Anderson Gomes da Silva — Portaria nº 4282/2025 (BGSDS nº 142, de 07/08/2025); citado como subcomandante em fev/2026.",
  cpm: "DIRESP — Diretoria Integrada Especializada (Lei nº 18.892/2025, art. 8º).",
  estrutura: "1ª Companhia: Sítio Histórico de Olinda (SDS, set/2025).",
  efetivo: "Não divulgado. Referência: ~600 policiais do BPTur no desfile do Homem da Meia-Noite 2026 (subcomandante, fev/2026). Frota: 13 SUVs novas destinadas ao batalhão em out/2026.",
  // 🚓 Operação
  area: "Policiamento turístico conforme o Plano de Articulação da PMPE (Lei nº 18.892/2025): Sítio Histórico de Olinda, Recife Antigo e Marco Zero, praias do litoral (18 praias mapeadas na Operação Verão 2026/2027, com reforço em Porto de Galinhas/Ipojuca) e festivais culturais pelo Estado.",
  sobreArea: "Rondas e policiamento ostensivo a pé ou motorizado, com encaminhamento de ocorrências envolvendo turistas à DPTUR ou à delegacia da área. Atua o ano todo nos pontos turísticos e eventos: prévias de Olinda, grandes shows no Marco Zero e festivais culturais (SDS, set/2025).\nO BPTur substituiu a CIATur (Companhia Independente de Apoio ao Turista), extinta pela mesma lei.",
  // 🎯 Vagas — sem informação pública
  vagas: null,
  // 🏠 Onde morar
  morarPerto: "Para estágio curto, procure primeiro no Varadouro e no Carmo (dá para ir a pé). Bairro Novo e Casa Caiada têm mais apartamentos. Vale considerar quarto, apartamento mobiliado ou temporada, e testar o trajeto no horário do serviço antes de fechar.\nDistâncias pela rota de carro (OpenStreetMap) até a Av. Sigismundo Gonçalves, 515; tempos sem trânsito.",
  bairros: [
    { nome: "Varadouro", km: "0,2 km", tempo: "a pé ~3 min", obs: "Bairro do batalhão. Menos imóveis disponíveis." },
    { nome: "Carmo", km: "1,0 km", tempo: "a pé ~12 min · carro ~3 min", obs: "Vizinho; comércio, restaurantes e acesso ao Sítio Histórico." },
    { nome: "Amparo", km: "1,1 km", tempo: "a pé ~15 min · carro ~4 min", obs: "Cidade Alta: ladeiras, ruas estreitas, pouca vaga para carro e bloqueios em eventos." },
    { nome: "Bairro Novo", km: "3,2 km", tempo: "carro ~5–10 min", obs: "Mais imóveis residenciais; supermercados, farmácias e serviços." },
    { nome: "Casa Caiada", km: "4,9 km", tempo: "carro ~8–15 min", obs: "Residencial, boa infraestrutura; melhor para quem tem carro." },
  ],
  // 💡 Dicas
  dicas: "Antes de se apresentar, ligue para a unidade e pergunte local, horário, fardamento, escala e estacionamento.\nConheça os pontos de referência: Alto da Sé, Praça do Carmo e Quatro Cantos (Olinda); Marco Zero e Rua do Bom Jesus (Recife Antigo).\nNo Carnaval e nas prévias o Sítio Histórico fica com ruas fechadas — planeje o deslocamento.\nNa temporada de verão (set/2026 a mar/2027) o batalhão reforça as praias do litoral Norte e Sul.",
  operacoes: [
    { titulo: "Operação Verão 2026/2027", data: "05/09/2026", resumo: "18 praias mapeadas com atenção especial durante a temporada; reforço do BPTur e do 18º BPM em Porto de Galinhas e Ipojuca. Vai até março de 2027.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2026/09/operacao-verao-2026-em-pernambuco.jpg", fonte: "Portal de Prefeitura / SDS", url: OP_VERAO },
    { titulo: "13 SUVs novas para o BPTur", data: "02/10/2026", resumo: "Entrega de viaturas e armamento pela SDS: 13 SUVs locadas foram destinadas ao BPTur, renovando a frota da unidade.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2026/10/novas-viaturas-em-pernambuco.jpg", fonte: "Portal de Prefeitura / SDS", url: VIATURAS },
    { titulo: "Homem da Meia-Noite — Carnaval 2026", data: "14/02/2026", resumo: "Cerca de 600 policiais do BPTur no desfile em Olinda, 40% a 45% a mais que em 2025 (~420), segundo o subcomandante.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2026/02/desfile-do-homem-da-meia-noite-em-olinda.jpg", fonte: "Portal de Prefeitura", url: MEIA_NOITE },
    { titulo: "Segurança do turista e 1ª Cia em Olinda", data: "29/09/2025", resumo: "SDS apresenta o BPTur: 1ª Companhia no Sítio Histórico de Olinda, policiamento a pé e motorizado e encaminhamento de ocorrências à DPTUR.", foto: "https://cdn.portaldeprefeitura.com.br/img/social/1200/1200/dn_arquivo/2025/09/pernambuco-tem-investimento-na-seguranca-dos-turistas-diz-sds.jpg", fonte: "Portal de Prefeitura / SDS", url: SDS_TURISTAS },
  ],
  links: [
    { rotulo: "Lei nº 18.892/2025 — cria o BPTur (art. 8º)", url: LEI_18892, grupo: "Legislação para estudo" },
    { rotulo: "Lei nº 11.771/2008 — Política Nacional de Turismo", url: "https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11771.htm", grupo: "Legislação para estudo" },
    { rotulo: "BGSDS nº 142/2025 — designação do comando", url: BGSDS_142, grupo: "Legislação para estudo" },
    { rotulo: "Legislação da PMPE (portal)", url: "https://www.pm.pe.gov.br/decretos-pmpe-legis/", grupo: "Legislação para estudo" },
    { rotulo: "PMPE", url: "https://www.pm.pe.gov.br/" },
    { rotulo: "Ônibus — Rumo (Grande Recife)", url: "https://virtual.granderecife.pe.gov.br/rumo/" },
    { rotulo: "Turismo de Olinda", url: "https://olinda.pe.gov.br/pagina/olinda-turismo" },
    { rotulo: "Turismo do Recife", url: "https://visit.recife.pe.gov.br/" },
    { rotulo: "Aluguéis — OLX Grande Recife", url: "https://www.olx.com.br/imoveis/aluguel/estado-pe/grande-recife" },
    { rotulo: "Temporada — Airbnb Olinda", url: "https://www.airbnb.com.br/s/Olinda--Pernambuco--Brasil/homes" },
  ],
  fontes: [
    { info: "Criação, subordinação e sede definitiva", rotulo: "Lei nº 18.892/2025, art. 8º — Alepe", url: LEI_18892 },
    { info: "Endereço atual", rotulo: "Prefeitura de Olinda — Carnaval 2026", url: OLINDA_2026 },
    { info: "Nova sede no Recife Antigo", rotulo: "CBN Recife, 26/05/2026", url: NOVA_SEDE },
    { info: "Comandante", rotulo: "Operação Verão 2026/2027 — SDS, 05/09/2026", url: OP_VERAO },
    { info: "Subcomandante", rotulo: "BGSDS nº 142, de 07/08/2025 — Portaria nº 4282", url: BGSDS_142 },
    { info: "1ª Cia e atribuições", rotulo: "SDS, 29/09/2025", url: SDS_TURISTAS },
    { info: "Efetivo no Homem da Meia-Noite", rotulo: "Portal de Prefeitura, 14/02/2026", url: MEIA_NOITE },
    { info: "Novas viaturas", rotulo: "Portal de Prefeitura / SDS, 02/10/2026", url: VIATURAS },
    { info: "Telefones", rotulo: "Relação de comandantes da PMPE (mar/2026)", url: "https://www.pm.pe.gov.br/unidades-operacionais-2/" },
    { info: "E-mail", rotulo: "Página de unidades da PMPE", url: "https://www.pm.pe.gov.br/unidades-operacionais-2/" },
    { info: "Distâncias", rotulo: "Rotas de carro OSRM/OpenStreetMap, sem trânsito — calculadas em 15/10/2026" },
  ],
}
