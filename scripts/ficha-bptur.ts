/**
 * Ficha padrão do BPTur (modelo para os demais batalhões).
 * Seções: localização · comando e efetivo · operação · vagas · onde morar · dicas
 * + links úteis e fontes. Sobrescreve a ficha do BPTur (rodar só para atualizar).
 *
 * Verificado em 15/10/2026:
 *  - Endereço: Prefeitura de Olinda (notícia do Carnaval 2026) lista o BPTur na
 *    Av. Sigismundo Gonçalves, 515, Varadouro.
 *  - Subcomandante: BGSDS nº 142 (07/08/2025), Portaria nº 4282.
 *  - Distâncias: rota de carro OSRM/OpenStreetMap até a Av. Sigismundo Gonçalves,
 *    sem trânsito; a pé estimado a ~5 km/h.
 */
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const FICHA = {
  // 📍 Localização e contato
  endereco: "Av. Sigismundo Gonçalves, 515 – Varadouro, Olinda-PE (endereço divulgado pela Prefeitura de Olinda em 2026).\nA lei de criação prevê a sede definitiva no Bairro do Recife (Recife Antigo) — confirme o local de apresentação antes do estágio.",
  referenciaMapa: "Avenida Sigismundo Gonçalves, 515, Varadouro, Olinda - PE",
  telefone: "(81) 3181-3700 / 3181-3702 / 3181-1700 — confirmar",
  email: "ciatur@pm.pe.gov.br (e-mail da antiga CIATur — confirmar)",
  distanciaBR: "Até a APMP (Paudalho): ~49 km, ~45 min de carro sem trânsito.\nAté o Marco Zero (Recife Antigo): ~7 km, ~10 min sem trânsito.\nAcesso pela Av. Sigismundo Gonçalves (liga Varadouro e Carmo), PE-15 e Av. Cruz Cabugá. Trânsito pesado no pico, nas prévias e no Carnaval, com ruas bloqueadas no Sítio Histórico.",
  // 🎖️ Comando e efetivo
  comandante: "TC QOPM Arthur Cezar Belo dos Santos — apontado como responsável pelo BPTur no Diário Oficial de 01/04/2026; confirmar se permanece.",
  subcomandante: "Maj QOPM George Anderson Gomes da Silva — designado pela Portaria nº 4282/2025 (BGSDS nº 142, de 07/08/2025).",
  cpm: "DIRESP — Diretoria Integrada Especializada",
  estrutura: "Comando, subcomando, Estado-Maior, Pelotão de Comando e Serviço e Companhias de Polícia Militar — a regulamentação prevê 1ª, 2ª e 3ª CPM (Decreto nº 59.069/2025).",
  efetivo: "Não divulgado.",
  // 🚓 Operação
  area: "Policiamento turístico especializado: Sítio Histórico de Olinda e Bairro do Recife (Recife Antigo), com reforço em outros polos turísticos e grandes eventos, conforme o planejamento da PMPE.",
  sobreArea: "Criado pela Lei nº 18.892/2025 no lugar da CIATur (Companhia Independente de Apoio ao Turista) e ativado pelo Decreto nº 59.069/2025.\nPoliciamento ostensivo a pé e motorizado em áreas de grande circulação, atendimento a turistas brasileiros e estrangeiros, proteção do patrimônio histórico e eventos de grande público — o ponto alto é o Carnaval de Olinda e do Recife.",
  // 🎯 Vagas — sem informação oficial ainda
  vagas: null,
  // 🏠 Onde morar
  morarPerto: "Para estágio curto, procure primeiro no Varadouro e no Carmo (dá para ir a pé). Bairro Novo e Casa Caiada têm mais apartamentos. Vale considerar quarto, apartamento mobiliado ou temporada.\nAntes de fechar, confirme o local de apresentação e teste o trajeto no horário do serviço.\nDistâncias pela rota de carro (OpenStreetMap) até a Av. Sigismundo Gonçalves, 515; tempos sem trânsito.",
  bairros: [
    { nome: "Varadouro", km: "0,2 km", tempo: "a pé ~3 min", obs: "Bairro do batalhão. Menos imóveis disponíveis." },
    { nome: "Carmo", km: "1,0 km", tempo: "a pé ~12 min · carro ~3 min", obs: "Vizinho; comércio, restaurantes e acesso ao Sítio Histórico." },
    { nome: "Amparo", km: "1,1 km", tempo: "a pé ~15 min · carro ~4 min", obs: "Cidade Alta: ladeiras, ruas estreitas, pouca vaga para carro e bloqueios em eventos." },
    { nome: "Bairro Novo", km: "3,2 km", tempo: "carro ~5–10 min", obs: "Mais imóveis residenciais; supermercados, farmácias e serviços." },
    { nome: "Casa Caiada", km: "4,9 km", tempo: "carro ~8–15 min", obs: "Residencial, boa infraestrutura; melhor para quem tem carro." },
  ],
  // 💡 Dicas
  dicas: "Confirme antes de se apresentar: local e horário, fardamento, escala e se há estacionamento, alimentação ou alojamento (não há confirmação oficial dessas facilidades).\nConheça os pontos de referência: Alto da Sé, Praça do Carmo e Quatro Cantos (Olinda); Marco Zero e Rua do Bom Jesus (Recife Antigo).\nNo Carnaval e nas prévias o Sítio Histórico fica com ruas fechadas — planeje o deslocamento.",
  links: [
    { rotulo: "PMPE", url: "https://www.pm.pe.gov.br/" },
    { rotulo: "Ônibus — Rumo (Grande Recife)", url: "https://virtual.granderecife.pe.gov.br/rumo/" },
    { rotulo: "Turismo de Olinda", url: "https://olinda.pe.gov.br/pagina/olinda-turismo" },
    { rotulo: "Turismo do Recife", url: "https://visit.recife.pe.gov.br/" },
    { rotulo: "Aluguéis — OLX Grande Recife", url: "https://www.olx.com.br/imoveis/aluguel/estado-pe/grande-recife" },
    { rotulo: "Temporada — Airbnb Olinda", url: "https://www.airbnb.com.br/s/Olinda--Pernambuco--Brasil/homes" },
  ],
  fontes: [
    { info: "Endereço (2026)", rotulo: "Prefeitura de Olinda — notícia do Carnaval 2026", url: "https://olinda.pe.gov.br/noticias/perdidos-e-achados-de-olinda-saiba-como-recuperar-o-que-perdeu-no-carnaval" },
    { info: "Comandante", rotulo: "Diário Oficial de Pernambuco, 01/04/2026 (sem link direto)" },
    { info: "Subcomandante", rotulo: "BGSDS nº 142, de 07/08/2025 — Portaria nº 4282", url: "https://www.sds.pe.gov.br/images/media/1754662866_142%20BGSDS%20DE%2007AGO2025.pdf" },
    { info: "Criação e estrutura", rotulo: "Lei nº 18.892/2025 e Decreto nº 59.069/2025 — legislação da PMPE", url: "https://www.pm.pe.gov.br/decretos-pmpe-legis/" },
    { info: "Telefones e e-mail", rotulo: "Relação de comandantes da PMPE (mar/2026) e página de unidades", url: "https://www.pm.pe.gov.br/unidades-operacionais-2/" },
    { info: "Distâncias", rotulo: "Rotas de carro OSRM/OpenStreetMap, sem trânsito — calculadas em 15/10/2026" },
    { info: "Transporte público", rotulo: "Grande Recife Consórcio de Transporte", url: "https://www.granderecife.pe.gov.br/" },
  ],
}

async function main() {
  const opm = await prisma.oPM.findUnique({ where: { sigla: "BPTur" } })
  if (!opm) throw new Error("OPM BPTur não encontrada")
  const dados = { ...FICHA, atualizadoPor: "Portal — pesquisa 15/10/2026" }
  await prisma.opmInfo.upsert({ where: { opmId: opm.id }, update: dados, create: { opmId: opm.id, ...dados } })
  console.log("Ficha do BPTur gravada.")
}
main().finally(() => prisma.$disconnect())
