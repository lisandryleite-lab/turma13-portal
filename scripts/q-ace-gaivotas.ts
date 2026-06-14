import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "ACE"
const MOD = "Gaivotas" // módulo focado nas dicas do professor (gaivotas)

type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string }
  | { modulo: string; tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string } }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

// Questões ancoradas nas GAIVOTAS sinalizadas pelo professor.
const QS: Q[] = [
  // ── História ──
  { modulo: MOD, tipo: "certo_errado", enunciado: "A análise criminal tem raízes na atividade de Inteligência, remontando às estratégias de batalhas chinesas (Sun Tzu).", gabarito: "certo", explicacao: "Correto. As origens estão na Inteligência militar — estratégias chinesas." },
  { modulo: MOD, tipo: "multipla", enunciado: "O magistrado inglês que organizou os 'Bow Street Runners', marcando os primeiros traços do uso estruturado da análise criminal, foi:", alternativas: A("Henry Fielding", "Robert Peel", "August Vollmer", "Orlando W. Wilson", "Sun Tzu"), gabarito: "A", explicacao: "Henry Fielding e seus 'Bow Street Runners' representam os rudimentos da análise criminal." },
  { modulo: MOD, tipo: "multipla", enunciado: "Considerado um marco na criação da polícia moderna (Polícia Metropolitana de Londres) e nos princípios do policiamento, destaca-se a figura de:", alternativas: A("Robert Peel", "Henry Fielding", "August Vollmer", "Orlando W. Wilson", "Cohen e Felson"), gabarito: "A", explicacao: "Robert Peel é associado à criação da polícia moderna e aos princípios do policiamento." },
  { modulo: MOD, tipo: "certo_errado", enunciado: "O conceito de Modus Operandi, ligado ao padrão de atuação do criminoso, remonta ao século XIX.", gabarito: "certo", explicacao: "Correto. O conceito de Modus Operandi situa-se no século XIX." },
  { modulo: MOD, tipo: "multipla", enunciado: "Conhecido como 'pai da polícia americana', responsável por inovações como o serviço de chamada de emergência e o uso do mapa de pinos, foi:", alternativas: A("August Vollmer", "Orlando W. Wilson", "Robert Peel", "Henry Fielding", "John Eck"), gabarito: "A", explicacao: "August Vollmer — pai da polícia americana; introduziu a chamada de emergência e o mapa de pinos." },
  { modulo: MOD, tipo: "multipla", enunciado: "O termo 'análise de crime' (análise criminal) surgiu formalmente com:", alternativas: A("Orlando W. Wilson", "August Vollmer", "Robert Peel", "Henry Fielding", "Sun Tzu"), gabarito: "A", explicacao: "O termo análise de crime surgiu formalmente com Orlando W. Wilson." },
  { modulo: MOD, tipo: "certo_errado", enunciado: "August Vollmer é reconhecido como o pai da polícia americana.", gabarito: "certo", explicacao: "Correto. Não confundir com Orlando W. Wilson, a quem se atribui o termo 'análise de crime'." },

  // ── Consolidação e era de ouro ──
  { modulo: MOD, tipo: "multipla", enunciado: "A consolidação da análise criminal nos EUA deu-se na década de:", alternativas: A("1960", "1950", "1970", "1980", "1990"), gabarito: "A", explicacao: "Consolidação = década de 60. (A 'era de ouro' é a década de 90.)" },
  { modulo: MOD, tipo: "multipla", enunciado: "A chamada 'era de ouro' da análise criminal corresponde à década de:", alternativas: A("1990", "1960", "1970", "1980", "2000"), gabarito: "A", explicacao: "Era de ouro = década de 90. (A consolidação ocorreu na década de 60.)" },
  { modulo: MOD, tipo: "certo_errado", enunciado: "A consolidação da análise criminal nos EUA ocorreu na década de 90, e a 'era de ouro' na década de 60.", gabarito: "errado", explicacao: "Errado. É o inverso: consolidação na década de 60 e era de ouro na década de 90." },

  // ── Fundamentos / nova perspectiva ──
  { modulo: MOD, tipo: "multipla", enunciado: "No policiamento orientado para a solução de problemas, o foco da atuação recai sobre:", alternativas: A("a causa do problema, em detrimento do evento", "o evento isolado, em detrimento da causa", "apenas a repressão imediata", "exclusivamente o número de prisões", "somente a fardada ostensiva"), gabarito: "A", explicacao: "O objetivo é atacar a causa do problema, e não apenas o evento (ocorrência) isolado." },
  { modulo: MOD, tipo: "multipla", enunciado: "Uma das principais problemáticas da análise criminal no Brasil apontada é:", alternativas: A("a ausência de cultura técnica", "o excesso de analistas qualificados", "a sobra de recursos tecnológicos", "a ausência de criminalidade", "o excesso de dados confiáveis"), gabarito: "A", explicacao: "A ausência de cultura técnica é a problemática destacada no Brasil." },
  { modulo: MOD, tipo: "certo_errado", enunciado: "Os dados de segurança pública servem para orientar a Administração, formar conhecimento e permitir que a sociedade conheça e demande providências.", gabarito: "certo", explicacao: "Correto. Os dados servem para orientar, formar e permitir." },
  { modulo: MOD, tipo: "certo_errado", enunciado: "A análise criminal é uma disciplina multidisciplinar, pois envolve conhecimentos de várias áreas.", gabarito: "certo", explicacao: "Correto. A análise criminal é multidisciplinar." },
  { modulo: MOD, tipo: "multipla", enunciado: "As duas grandes dimensões da análise criminal são:", alternativas: A("tática e estratégica", "operacional e logística", "reativa e passiva", "civil e militar", "interna e externa"), gabarito: "A", explicacao: "As duas dimensões são a tática e a estratégica." },
  { modulo: MOD, tipo: "certo_errado", enunciado: "Quanto mais preventiva (e menos reativa) for a atuação policial, mais eficiente ela tende a ser.", gabarito: "certo", explicacao: "Correto. Fazer análise criminal busca eficiência agindo na prevenção." },

  // ── Analista criminal ──
  { modulo: MOD, tipo: "multipla", enunciado: "Entre as qualidades esperadas de um bom analista criminal NÃO se inclui:", alternativas: A("ser meramente reativo, aguardando a demanda", "ser proativo", "ser pesquisador", "ser um bom avaliador", "ter olhar investigativo"), gabarito: "A", explicacao: "O bom analista é proativo (antecipa), pesquisador, bom avaliador e tem olhar investigativo — não é reativo." },
  { modulo: MOD, tipo: "dissertativa", enunciado: "Descreva as 4 etapas do trabalho do analista criminal.", modelo: { estrutura: "Apresentar as 4 etapas na ordem, explicando cada uma e a lógica de ciclo.", criterios: ["Sistematizar e analisar os dados", "Submeter/identificar os padrões", "Identificar formas de intervir", "Avaliar o impacto das intervenções"], resposta: "O trabalho do analista criminal segue quatro etapas encadeadas: (1) sistematizar e analisar os dados, organizando a informação bruta para torná-la utilizável; (2) submeter esses dados à análise para identificar os padrões criminais; (3) identificar as formas de intervir sobre os problemas detectados; e (4) avaliar o impacto das intervenções adotadas, realimentando o ciclo para corrigir e aprimorar as ações futuras." } },
  { modulo: MOD, tipo: "certo_errado", enunciado: "A avaliação do impacto das intervenções é a última das quatro etapas do trabalho do analista criminal.", gabarito: "certo", explicacao: "Correto. Sequência: sistematizar/analisar dados → submeter padrões → identificar formas de intervir → avaliar o impacto das intervenções." },
  { modulo: MOD, tipo: "multipla", enunciado: "A importância da focalização, na análise criminal, está em:", alternativas: A("olhar o crime de forma separada (focada)", "tratar todos os crimes de forma genérica e uniforme", "ignorar a localização dos delitos", "concentrar-se apenas no autor", "eliminar a análise estatística"), gabarito: "A", explicacao: "A focalização permite olhar o crime de forma separada/específica, direcionando a ação." },

  // ── Mapeamento e SIG ──
  { modulo: MOD, tipo: "dissertativa", enunciado: "Qual a diferença entre geoprocessamento e Sistema de Informações Geográficas (SIG)?", modelo: { estrutura: "Definir geoprocessamento → definir SIG → apontar a distinção.", criterios: ["Geoprocessamento como conjunto amplo de tecnologias para tratar informação espacial", "SIG como sistema específico de análise espacial que armazena geometrias + atributos", "Relação de gênero (geoprocessamento) e espécie/ferramenta (SIG)"], resposta: "Geoprocessamento é o conjunto amplo de tecnologias voltadas a coletar e tratar informações espaciais (cartografia, sensoriamento remoto, GPS, banco de dados etc.). O SIG (Sistema de Informações Geográficas) é uma ferramenta/sistema específico dentro do geoprocessamento, que processa dados gráficos e não-gráficos com ênfase na análise espacial, armazenando atributos descritivos junto com as geometrias. Em síntese: o geoprocessamento é o campo mais amplo; o SIG é o sistema que operacionaliza a análise espacial." } },
  { modulo: MOD, tipo: "multipla", enunciado: "As três gerações dos SIG, na ordem evolutiva, são:", alternativas: A("CAD Cartográfico → Banco de dados geográfico → Bibliotecas Geográficas Digitais", "Bibliotecas Digitais → SIG → CAD", "Banco de dados → CAD → Web", "Raster → Vetorial → Topológico", "Mapa de pinos → SIG → Power BI"), gabarito: "A", explicacao: "1ª CAD Cartográfico; 2ª Banco de dados geográfico (SIG's); 3ª Bibliotecas Geográficas Digitais." },
  { modulo: MOD, tipo: "certo_errado", enunciado: "O 'mapa de pinos' (alfinetes) é uma forma histórica de marcar a localização dos crimes no mapa.", gabarito: "certo", explicacao: "Correto. É técnica clássica de mapeamento, associada a August Vollmer." },

  // ── Teorias ──
  { modulo: MOD, tipo: "multipla", enunciado: "São teorias sociológicas do crime cobradas na disciplina, EXCETO:", alternativas: A("Teoria da pirâmide etária", "Teoria da escolha racional", "Teoria da atividade de rotina", "Teoria do padrão criminal", "Criminologia ambiental"), gabarito: "A", explicacao: "As teorias são: escolha racional, atividade de rotina e padrão criminal (sob a criminologia ambiental)." },

  // ── Ferramentas ──
  { modulo: MOD, tipo: "multipla", enunciado: "Sobre Excel e Calc, é correto afirmar que:", alternativas: A("são planilhas eletrônicas equivalentes — Excel é da Microsoft (pago) e o Calc é do pacote livre (LibreOffice/OpenOffice)", "Calc é um sistema de georreferenciamento", "Excel não permite tabela dinâmica", "Calc é exclusivo de homicídios", "ambos substituem o INFOPOL"), gabarito: "A", explicacao: "Excel (Microsoft) e Calc (suíte livre) são planilhas eletrônicas com funções semelhantes (cálculo, tabela dinâmica)." },
  { modulo: MOD, tipo: "multipla", enunciado: "A solução de BI da Microsoft usada na análise criminal (base do SACE) é o:", alternativas: A("Power BI", "QlikView", "INFOPOL", "Excel", "ArcGIS"), gabarito: "A", explicacao: "O Power BI é a ferramenta de BI da Microsoft; base do SACE (Sistema de Análise Criminal e Estatística)." },
  { modulo: MOD, tipo: "multipla", enunciado: "Ferramenta de BI utilizada nas reuniões do 'Juntos pela Segurança' para monitorar indicadores, com dashboards 'arrastar e soltar':", alternativas: A("QlikView", "Power BI", "INFOPOL", "Calc", "GPS"), gabarito: "A", explicacao: "QlikView ('Click Wil') — solução de BI usada no Juntos pela Segurança." },
  { modulo: MOD, tipo: "certo_errado", enunciado: "O Sistema INFOPOL é a principal base de coleta e análise de ocorrências policiais em Pernambuco.", gabarito: "certo", explicacao: "Correto. Administrado pela GGTI/SDS, com visão de ocorrências e visão de homicídio." },
]

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MAT } })
  if (!disc) throw new Error(`Disciplina ${MAT} não existe.`)
  let c = 0, u = 0
  for (const q of QS) {
    const hash = createHash("sha1").update(`${MAT}|${q.modulo}|${q.enunciado}`).digest("hex")
    const base: any = { materia: MAT, modulo: q.modulo, tipo: q.tipo, enunciado: q.enunciado, hash }
    if (q.tipo === "multipla") { base.alternativas = q.alternativas; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else if (q.tipo === "certo_errado") { base.alternativas = []; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else { base.alternativas = []; base.gabarito = ""; base.modelo = q.modelo }
    const exists = await prisma.questao.findUnique({ where: { hash } })
    await prisma.questao.upsert({ where: { hash }, update: base, create: base })
    exists ? u++ : c++
  }
  const tq = await prisma.questao.count({ where: { materia: MAT, modulo: MOD } })
  console.log(`ACE/Gaivotas: ${c} criadas, ${u} atualizadas (total no módulo ${MOD}: ${tq}).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
