import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "FPC"

type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const QS: Q[] = [
  // M1 — Conceito/filosofia
  { modulo: "1", tipo: "certo_errado", enunciado: "A Polícia Comunitária enfatiza a colaboração entre a polícia e a comunidade para prevenir crimes e desordens.", gabarito: "certo", explicacao: "Correto. É o núcleo do conceito (parceria preventiva)." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Para Trojanowicz (1994), a Polícia Comunitária é uma filosofia e estratégia organizacional.", gabarito: "certo", explicacao: "Correto. Fundada na parceria entre população e polícia." },
  { modulo: "1", tipo: "certo_errado", enunciado: "O Policiamento Comunitário é a filosofia organizacional, e a Polícia Comunitária é apenas a sua prática.", gabarito: "errado", explicacao: "Errado. É o inverso: Polícia Comunitária = filosofia; Policiamento Comunitário = prática." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A Polícia Comunitária é uma forma técnica e profissional de atuação perante a sociedade.", gabarito: "certo", explicacao: "Correto. Não é amadora nem 'perfumaria'." },
  { modulo: "1", tipo: "multipla", enunciado: "A obra de referência de Trojanowicz sobre o tema chama-se:", alternativas: A("Policiamento Comunitário: Como Começar", "Vigiar e Punir", "A Arte da Guerra", "O Príncipe", "Da Guerra"), gabarito: "A", explicacao: "Trojanowicz expôs os princípios em 'Policiamento Comunitário: Como Começar'." },
  { modulo: "1", tipo: "multipla", enunciado: "A premissa básica da Polícia Comunitária é que:", alternativas: A("polícia e comunidade devem trabalhar juntas para identificar e resolver problemas", "a polícia resolve sozinha os problemas de segurança", "a comunidade não deve participar do policiamento", "a repressão é o único caminho", "a tecnologia substitui o contato humano"), gabarito: "A", explicacao: "A parceria polícia-comunidade é o fundamento." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A Polícia Comunitária implementada como filosofia organizacional é indistinta a todos os órgãos da polícia.", gabarito: "certo", explicacao: "Correto. Como filosofia, alcança toda a instituição." },

  // M2 — 10 princípios
  { modulo: "2", tipo: "certo_errado", enunciado: "O primeiro princípio da Polícia Comunitária é 'Filosofia e Estratégia Organizacional', cuja base é a comunidade.", gabarito: "certo", explicacao: "Correto. A polícia busca junto à comunidade seus anseios." },
  { modulo: "2", tipo: "certo_errado", enunciado: "O princípio da 'Resolução Preventiva de Problemas' busca que o policial se antecipe à ocorrência, reduzindo chamadas ao COPOM.", gabarito: "certo", explicacao: "Correto. É o 4º princípio." },
  { modulo: "2", tipo: "certo_errado", enunciado: "O princípio da 'Mudança Interna' produz efeitos imediatos, em poucos meses.", gabarito: "errado", explicacao: "Errado. É uma transformação de longo prazo, projetada para 10 a 15 anos." },
  { modulo: "2", tipo: "certo_errado", enunciado: "O princípio 'Ajuda às pessoas com Necessidades Específicas' valoriza pessoas vulneráveis (jovens, idosos, minorias, deficientes).", gabarito: "certo", explicacao: "Correto. É um compromisso inalienável do policial comunitário." },
  { modulo: "2", tipo: "certo_errado", enunciado: "O princípio 'Extensão do Mandato Policial' faz de cada policial um 'chefe de polícia local', com autonomia e responsabilidade.", gabarito: "certo", explicacao: "Correto. Dentro de parâmetros rígidos de responsabilidade." },
  { modulo: "2", tipo: "multipla", enunciado: "Quantos são os princípios da Polícia Comunitária segundo Trojanowicz?", alternativas: A("Dez", "Cinco", "Quatro", "Sete", "Doze"), gabarito: "A", explicacao: "São dez princípios." },
  { modulo: "2", tipo: "multipla", enunciado: "O princípio que pressupõe um 'novo contrato' entre polícia e cidadãos, com rigor ético e legal, é:", alternativas: A("Ética, Legalidade, Responsabilidade e Confiança", "Construção do Futuro", "Criatividade e apoio básico", "Mudança interna", "Policiamento descentralizado"), gabarito: "A", explicacao: "É o 5º princípio." },
  { modulo: "2", tipo: "multipla", enunciado: "O princípio 'Policiamento Descentralizado e Personalizado' exige:", alternativas: A("um policial conhecido pela comunidade e conhecedor de suas realidades", "um policiamento centralizado e anônimo", "atuação exclusivamente por rádio", "rodízio constante de policiais", "ausência de contato com moradores"), gabarito: "A", explicacao: "É o 3º princípio: proximidade e conhecimento mútuo." },
  { modulo: "2", tipo: "multipla", enunciado: "O décimo princípio, 'Construção do Futuro', preconiza que a ordem:", alternativas: A("não deve ser imposta de fora para dentro, mas construída com a comunidade", "seja imposta pela cúpula da corporação", "dependa apenas da tecnologia", "seja responsabilidade exclusiva do Estado", "ignore as demandas locais"), gabarito: "A", explicacao: "A ordem deve ser construída com a participação da comunidade." },
  { modulo: "2", tipo: "certo_errado", enunciado: "O princípio 'Comprometimento da Organização com a concessão de poder à Comunidade' trata os cidadãos como plenos parceiros da polícia.", gabarito: "certo", explicacao: "Correto. É o 2º princípio." },

  // M3 — 4 estratégias
  { modulo: "3", tipo: "certo_errado", enunciado: "As quatro estratégias de policiamento são: combate profissional do crime, policiamento estratégico, orientado para o problema e polícia comunitária.", gabarito: "certo", explicacao: "Correto. São as quatro grandes estratégias dos últimos ~50 anos." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O combate profissional do crime e o policiamento estratégico têm como objetivo principal o controle do crime.", gabarito: "certo", explicacao: "Correto. Focam baixar as taxas de crime." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O policiamento orientado para o problema e a polícia comunitária enfatizam a manutenção da ordem e a redução do medo.", gabarito: "certo", explicacao: "Correto. Têm enfoque mais preventivo." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O modelo tradicional caracteriza-se por proximidade total com a comunidade e descentralização.", gabarito: "errado", explicacao: "Errado. O tradicional é centralizado, especializado e distante da comunidade." },
  { modulo: "3", tipo: "multipla", enunciado: "A estratégia dominante mundialmente a partir de 1950, ainda predominante no Brasil, é:", alternativas: A("o combate profissional do crime (policiamento tradicional)", "a polícia comunitária", "o policiamento orientado para o problema", "o policiamento estratégico", "o sistema Koban"), gabarito: "A", explicacao: "O combate profissional do crime orientou o policiamento desde 1950." },
  { modulo: "3", tipo: "multipla", enunciado: "No policiamento tradicional, as unidades são definidas principalmente:", alternativas: A("pela função (atividades especializadas), e não geograficamente", "pelo território de cada policial", "pela comunidade atendida", "por sorteio", "pela renda do bairro"), gabarito: "A", explicacao: "O tradicional valoriza a especialização funcional e a centralização." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A Polícia Comunitária defende um relacionamento mais estreito com a comunidade para controlar o crime e melhorar a qualidade de vida.", gabarito: "certo", explicacao: "Correto. Em oposição ao distanciamento do modelo tradicional." },

  // M4 — mitos
  { modulo: "4", tipo: "certo_errado", enunciado: "Policiamento Comunitário não é apenas relações públicas.", gabarito: "certo", explicacao: "Correto. A melhoria das relações é necessária, mas não é o objetivo principal." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Policiamento Comunitário é antitecnologia, exigindo que o policial atue desarmado.", gabarito: "errado", explicacao: "Errado. Usa tecnologia e armamento moderno; o policial 'desarmado' é mito." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Policiamento Comunitário não é condescendente com o crime.", gabarito: "certo", explicacao: "Correto. Os policiais fazem prisões e agem dentro da lei com energia." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Policiamento Comunitário é uma tática passageira, a ser testada e depois abandonada.", gabarito: "errado", explicacao: "Errado. NÃO é tática/programa passageiro, e sim um novo modo de prestar o serviço." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Policiamento Comunitário não é paternalista, não privilegiando ricos ou 'amigos da polícia'.", gabarito: "certo", explicacao: "Correto. Prioriza o coletivo e a justiça." },
  { modulo: "4", tipo: "multipla", enunciado: "Segundo Trojanowicz, o Policiamento Comunitário NÃO pode ser:", alternativas: A("um enfoque de cima para baixo", "iniciado pelo policial de serviço", "integrado a toda a organização", "uma referência para a comunidade", "orientado pela proximidade"), gabarito: "A", explicacao: "Não pode ser de cima para baixo; começa com o policial de serviço." },
  { modulo: "4", tipo: "multipla", enunciado: "A afirmação de que o Policiamento Comunitário 'não é uma fórmula mágica/panaceia' significa que:", alternativas: A("não é a solução única da insegurança; depende da reeducação da polícia e da sociedade", "resolve sozinho todos os crimes", "dispensa a participação da comunidade", "substitui a investigação criminal", "elimina a necessidade de leis"), gabarito: "A", explicacao: "Não é solução mágica; é processo de longo prazo com a sociedade." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Policiamento Comunitário é uma ação especializada e isolada dentro da instituição.", gabarito: "errado", explicacao: "Errado. NÃO é ação isolada; é estratégia de toda a organização." },

  // M5 — 6 grupos
  { modulo: "5", tipo: "certo_errado", enunciado: "A organização policial é um dos seis grandes grupos do policiamento comunitário.", gabarito: "certo", explicacao: "Correto. É o primeiro dos seis grupos." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Os veículos de comunicação (imprensa) integram os seis grandes grupos do policiamento comunitário.", gabarito: "certo", explicacao: "Correto. São o sexto grupo (formadores de opinião)." },
  { modulo: "5", tipo: "certo_errado", enunciado: "As instituições comunitárias (escolas, igrejas, associações) NÃO fazem parte dos grupos do policiamento comunitário.", gabarito: "errado", explicacao: "Errado. As instituições comunitárias são o 5º grupo." },
  { modulo: "5", tipo: "multipla", enunciado: "Os seis grandes grupos do policiamento comunitário incluem, entre outros:", alternativas: A("comunidade de negócios e autoridades constituídas", "Forças Armadas e Marinha", "STF e STJ", "Receita Federal e Banco Central", "ONU e OEA"), gabarito: "A", explicacao: "Os seis grupos: organização policial, comunidade, autoridades constituídas, comunidade de negócios, instituições comunitárias e imprensa." },
  { modulo: "5", tipo: "multipla", enunciado: "O sucesso do policiamento comunitário, considerando os seis grupos, depende sobretudo:", alternativas: A("da integração e parceria entre todos os grupos", "apenas da atuação policial", "somente da imprensa", "exclusivamente das autoridades", "do isolamento dos atores"), gabarito: "A", explicacao: "A integração entre os seis grupos é a chave." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A comunidade de negócios (comércio e empresas locais) é um dos atores do policiamento comunitário.", gabarito: "certo", explicacao: "Correto. É o 4º grupo." },

  // M6 — Koban / experiência
  { modulo: "6", tipo: "certo_errado", enunciado: "O Sistema Koban é de origem japonesa e foi adotado/adaptado pela PMESP.", gabarito: "certo", explicacao: "Correto. Postos fixos de base local; referência também na PMPE." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A Patrulha do Bairro, em Pernambuco, foi lançada em 1985, no governo de Roberto Magalhães.", gabarito: "certo", explicacao: "Correto. Usava 100 kombis na RMR, com 2 PMs por viatura." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Os policiais da Patrulha do Bairro ficaram conhecidos como 'Cosme e Damião'.", gabarito: "certo", explicacao: "Correto. Alusão aos santos, pela proximidade e ajuda à comunidade." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Os NUSEPs fracassaram, em parte, pela falta de autonomia dos policiais para resolver os problemas locais.", gabarito: "certo", explicacao: "Correto. A burocracia institucional minou a iniciativa." },
  { modulo: "6", tipo: "multipla", enunciado: "A Patrulha do Bairro (PE, 1985) distribuía pela Região Metropolitana:", alternativas: A("100 kombis, com 2 PMs por viatura", "50 motocicletas", "20 viaturas blindadas", "10 helicópteros", "5 lanchas"), gabarito: "A", explicacao: "Eram 100 kombis nos 14 municípios da RMR, com 2 PMs cada." },
  { modulo: "6", tipo: "multipla", enunciado: "A referência nacional citada na adoção de práticas de polícia comunitária no Brasil é a:", alternativas: A("PMMG (Polícia Militar de Minas Gerais)", "PMRJ", "PMSP exclusivamente", "Polícia Federal", "Guarda Nacional"), gabarito: "A", explicacao: "A PMMG é mencionada como referência; a PMPE adotou princípios semelhantes." },
  { modulo: "6", tipo: "certo_errado", enunciado: "As experiências de polícia comunitária no Brasil ganharam força com a redemocratização, nos anos 1980 e 1990.", gabarito: "certo", explicacao: "Correto. Influência de EUA/Europa e reforma das práticas policiais." },

  // M7 — marcos normativos
  { modulo: "7", tipo: "certo_errado", enunciado: "A Senasp (Secretaria Nacional de Segurança Pública) foi criada em 1997.", gabarito: "certo", explicacao: "Correto. Responsável por formular e implementar políticas de segurança." },
  { modulo: "7", tipo: "certo_errado", enunciado: "O primeiro Plano Nacional de Segurança Pública, na vigência da Senasp, foi editado em 2000, no governo FHC.", gabarito: "certo", explicacao: "Correto. Ênfase em cooperação federativa e modernização." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A SDS de Pernambuco foi criada pela Lei Complementar nº 49, de 31/01/2003.", gabarito: "certo", explicacao: "Correto. Integra as ações de defesa social do Estado." },
  { modulo: "7", tipo: "certo_errado", enunciado: "O Programa Nacional de Direitos Humanos (1996) não tinha qualquer relação com a polícia comunitária.", gabarito: "errado", explicacao: "Errado. Incluía metas que estabeleciam programas de polícia comunitária." },
  { modulo: "7", tipo: "multipla", enunciado: "São desafios persistentes da política de segurança pública no Brasil, citados na apostila:", alternativas: A("descontinuidade, falta de avaliação/monitoramento e complexidade do tema", "excesso de recursos e de pessoal", "ausência de criminalidade", "uniformidade total entre os estados", "inexistência de marcos legais"), gabarito: "A", explicacao: "São apontados a descontinuidade, a falta de avaliação e a complexidade." },
  { modulo: "7", tipo: "multipla", enunciado: "A criação da Senasp, em 1997, teve como foco inicial:", alternativas: A("a cooperação e a modernização do sistema de segurança pública", "a extinção das polícias militares", "a federalização de todas as polícias", "a privatização da segurança", "a criação das guardas municipais"), gabarito: "A", explicacao: "O foco era cooperação federativa e modernização." },
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
  console.log(`FPC complemento: ${c} criadas/${u} atualizadas. Total ${all.length} (~${(all.length/mods.size).toFixed(1)}/modulo).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
