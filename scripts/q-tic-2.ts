import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "TIC"
type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))
const QS: Q[] = [
  // M1
  { modulo: "1", tipo: "multipla", enunciado: "Decisões de médio prazo, que traduzem a estratégia em ações setoriais, situam-se no nível:", alternativas: A("tático", "operacional", "estratégico", "institucional", "técnico"), gabarito: "A", explicacao: "O nível tático é o intermediário (gerencial)." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Na pirâmide DIKW, a informação é o dado organizado e contextualizado.", gabarito: "certo", explicacao: "Correto. Dado bruto → informação contextualizada." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A sabedoria, na pirâmide do conhecimento, está na base, abaixo do dado.", gabarito: "errado", explicacao: "Errado. A sabedoria está no TOPO; o dado é a base." },
  { modulo: "1", tipo: "multipla", enunciado: "A cultura organizacional é definida como:", alternativas: A("o conjunto de valores, crenças e comportamentos compartilhados", "o organograma da empresa", "a folha de pagamento", "o estoque de materiais", "a rede de computadores"), gabarito: "A", explicacao: "Cultura = valores/crenças/normas compartilhados (ativo intangível)." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Decisões estratégicas têm alta amplitude e impacto de longo prazo na organização.", gabarito: "certo", explicacao: "Correto. Próprias da alta administração." },
  // M2
  { modulo: "2", tipo: "certo_errado", enunciado: "A retroalimentação (feedback) é uma etapa do funcionamento de um sistema.", gabarito: "certo", explicacao: "Correto. Entrada → processamento → saída → retroalimentação." },
  { modulo: "2", tipo: "multipla", enunciado: "A TI corresponde, dentro do SI, ao:", alternativas: A("componente tecnológico (hardware, software, redes, BD)", "conjunto de pessoas apenas", "processos de negócio", "cultura organizacional", "organograma"), gabarito: "A", explicacao: "A TI é o suporte tecnológico do SI." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A qualidade e a confiabilidade das fontes de dados são irrelevantes para a tomada de decisão.", gabarito: "errado", explicacao: "Errado. São essenciais — dados ruins geram decisões ruins." },
  { modulo: "2", tipo: "multipla", enunciado: "Um Sistema de Informação é mais amplo que a TI porque inclui também:", alternativas: A("pessoas e processos", "apenas mais hardware", "somente redes", "apenas bancos de dados", "exclusivamente software"), gabarito: "A", explicacao: "SI = TI + pessoas + processos." },
  // M3
  { modulo: "3", tipo: "certo_errado", enunciado: "A GGTI é a Gerência Geral de Tecnologia da Informação da SDS/PE.", gabarito: "certo", explicacao: "Correto. Desenvolve e mantém os sistemas de defesa social." },
  { modulo: "3", tipo: "multipla", enunciado: "As POE, gerenciadas pelo CIODS, servem para:", alternativas: A("videomonitoramento em pontos elevados", "lançamento de diárias", "gestão de frota", "envio de e-mail", "controle de estoque"), gabarito: "A", explicacao: "Plataformas de Observação Elevada (monitoramento)." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O subsistema de informação criminal é coordenado, no âmbito da defesa social, pela Polícia Civil (INFOPOL).", gabarito: "certo", explicacao: "Correto. Integra os registros das delegacias." },
  // M4
  { modulo: "4", tipo: "certo_errado", enunciado: "O Polícia Ágil permite consultas integradas de dados em tempo real pelas forças de segurança.", gabarito: "certo", explicacao: "Correto. Plataforma da GGTI/SDS-PE." },
  { modulo: "4", tipo: "multipla", enunciado: "O sistema que gere as informações dos registros de ocorrências das delegacias da PCPE é o:", alternativas: A("INFOPOL", "SIGFROTA", "SEI", "Expresso", "GLPI"), gabarito: "A", explicacao: "INFOPOL — registros das delegacias da Polícia Civil." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Os dados do BOEPM são importados ao boletim na delegacia, dando celeridade ao registro.", gabarito: "certo", explicacao: "Correto. Integração com o INFOPOL." },
  { modulo: "4", tipo: "multipla", enunciado: "O SIAP é o sistema de administração:", alternativas: A("prisional", "de frota", "de pessoal", "de e-mail", "de trânsito"), gabarito: "A", explicacao: "Sistema Integrado de Administração Prisional." },
  { modulo: "4", tipo: "multipla", enunciado: "O CAD (Computer Aided Dispatch), usado no CIODS, destina-se a:", alternativas: A("despacho e gestão de ocorrências", "edição de fotos", "controle de combustível", "emissão de diárias", "backup de e-mails"), gabarito: "A", explicacao: "Despacho de ocorrências assistido por computador." },
  // M5
  { modulo: "5", tipo: "certo_errado", enunciado: "O reconhecimento facial apoia a identificação de foragidos e pessoas procuradas.", gabarito: "certo", explicacao: "Correto. Tecnologia emergente da SDS/PE." },
  { modulo: "5", tipo: "multipla", enunciado: "O padrão P25 refere-se a:", alternativas: A("rádio digital troncalizado", "câmera térmica", "drone", "satélite", "banco de dados"), gabarito: "A", explicacao: "P25 = padrão de rádio digital." },
  { modulo: "5", tipo: "certo_errado", enunciado: "O PM Conectado/E-COP permite consultas e registro pelo policial em campo, via dispositivo móvel.", gabarito: "certo", explicacao: "Correto. Leva os sistemas ao campo." },
  // M6
  { modulo: "6", tipo: "multipla", enunciado: "O sistema de processos e documentos eletrônicos é o:", alternativas: A("SEI", "SIGFROTA", "Polícia Ágil", "INFOPOL", "CIODS"), gabarito: "A", explicacao: "SEI = Sistema Eletrônico de Informações (apoio administrativo)." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O Expresso é o e-mail institucional do Estado.", gabarito: "certo", explicacao: "Correto. Sistema de apoio administrativo." },
  { modulo: "6", tipo: "multipla", enunciado: "O GLPI é usado para:", alternativas: A("abertura de chamados de TI (HelpDesk)", "gestão da frota", "videomonitoramento", "despacho de ocorrências", "reconhecimento facial"), gabarito: "A", explicacao: "GLPI = HelpDesk de TI." },
  // M7
  { modulo: "7", tipo: "multipla", enunciado: "O telefone foi inventado por:", alternativas: A("Alexander Graham Bell (1876)", "Samuel Morse (1837)", "Guglielmo Marconi (1895)", "Landell de Moura (1893)", "Cândido Rondon"), gabarito: "A", explicacao: "Bell, 1876 (Morse = telégrafo; Marconi = rádio)." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Cândido Rondon foi pioneiro na construção de linhas telegráficas no Brasil.", gabarito: "certo", explicacao: "Correto. Símbolo da integração nacional." },
  { modulo: "7", tipo: "multipla", enunciado: "No modo half-duplex, característico do rádio da PM:", alternativas: A("a comunicação é bidirecional, mas um sentido por vez (mesma frequência)", "ambos falam ao mesmo tempo", "só há um sentido (unidirecional)", "não há transmissão", "usam-se frequências distintas simultâneas"), gabarito: "A", explicacao: "Half-duplex: um de cada vez; se dois falam, há colisão." },
  { modulo: "7", tipo: "multipla", enunciado: "O rádio MÓVEL (instalado na viatura) tem potência aproximada de:", alternativas: A("30 watts", "5 watts", "1 watt", "100 watts", "500 watts"), gabarito: "A", explicacao: "Móvel ~30 W; portátil/HT ~5 W." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A repetidora opera com frequências invertidas (Tx/Rx) e amplia o alcance da comunicação.", gabarito: "certo", explicacao: "Correto. Recebe, amplifica e reenvia." },
  { modulo: "7", tipo: "multipla", enunciado: "No Código Q, 'QRV' significa:", alternativas: A("está preparado / estou à disposição", "interferência", "localização", "parar de transmitir", "quem chama"), gabarito: "A", explicacao: "QRV = preparado/à disposição." },
  { modulo: "7", tipo: "multipla", enunciado: "No Código Q, 'QRM' significa:", alternativas: A("interferência provocada por outra estação", "na escuta", "entendido", "aguarde", "horas"), gabarito: "A", explicacao: "QRM = interferência." },
  { modulo: "7", tipo: "multipla", enunciado: "A série QOA a QQZ do Código Q é reservada ao serviço:", alternativas: A("marítimo", "aeronáutico", "geral", "militar", "não distribuída"), gabarito: "A", explicacao: "QAA-QNZ aeronáutico; QOA-QQZ marítimo; QRA-QVZ gerais." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Os meios de transmissão físicos (guiados) utilizam cabos; os não físicos usam ondas de rádio (sem fio).", gabarito: "certo", explicacao: "Correto. Físico = cabo; não físico = sem fio." },
  { modulo: "7", tipo: "multipla", enunciado: "A palavra usada ao final de um texto soletrado pelo alfabeto fonético é:", alternativas: A("TERMINADO", "SEPARA", "CÂMBIO", "PRONTO", "ESCUTA"), gabarito: "A", explicacao: "'VOU SOLETRAR' (início), 'SEPARA' (entre palavras), 'TERMINADO' (fim)." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Em uma rede de rádio, deve-se transmitir imediatamente, mesmo sem autorização do órgão coordenador.", gabarito: "errado", explicacao: "Errado. Não se transmite sem autorização do coordenador (COPOM/CENTRAL); escute antes de transmitir." },
  { modulo: "7", tipo: "multipla", enunciado: "A telefonia celular é exemplo de comunicação:", alternativas: A("full-duplex", "half-duplex", "simplex", "unidirecional", "por repetidora apenas"), gabarito: "A", explicacao: "Full-duplex: transmite e recebe simultaneamente (frequências distintas)." },
  { modulo: "7", tipo: "multipla", enunciado: "O elemento de um sistema de comunicação que decodifica o sinal e recupera a informação é o:", alternativas: A("receptor (Rx)", "transmissor (Tx)", "meio de transmissão", "ruído", "canal"), gabarito: "A", explicacao: "O receptor resgata a informação e devolve o formato original." },
]
async function main() {
  let c = 0, u = 0
  for (const q of QS) {
    const hash = createHash("sha1").update(`${MAT}|${q.modulo}|${q.enunciado}`).digest("hex")
    const base: any = { materia: MAT, modulo: q.modulo, tipo: q.tipo, enunciado: q.enunciado, hash }
    if (q.tipo === "multipla") { base.alternativas = q.alternativas; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else { base.alternativas = []; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    const exists = await prisma.questao.findUnique({ where: { hash } })
    await prisma.questao.upsert({ where: { hash }, update: base, create: base })
    exists ? u++ : c++
  }
  const all = await prisma.questao.findMany({ where: { materia: MAT }, select: { modulo: true } })
  const mods = new Set(all.map(x => x.modulo))
  console.log(`TIC reforco: ${c} criadas/${u} atualizadas. Total ${all.length} (~${(all.length/mods.size).toFixed(1)}/mod).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
