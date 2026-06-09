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
  // M1
  { modulo: "1", tipo: "certo_errado", enunciado: "A Polícia Comunitária parte da premissa de uma parceria entre população e polícia.", gabarito: "certo", explicacao: "Correto. Ambas trabalham juntas para identificar e resolver problemas (Trojanowicz)." },
  { modulo: "1", tipo: "multipla", enunciado: "Como filosofia organizacional, a Polícia Comunitária é:", alternativas: A("indistinta a toda a instituição", "restrita a uma unidade especializada", "aplicável só à noite", "exclusiva da capital", "limitada a eventos"), gabarito: "A", explicacao: "Alcança toda a organização policial." },
  { modulo: "1", tipo: "certo_errado", enunciado: "A Polícia Comunitária é amadora e dispensa técnica e profissionalismo.", gabarito: "errado", explicacao: "Errado. É forma técnica e profissional de atuação." },
  { modulo: "1", tipo: "multipla", enunciado: "O Policiamento Comunitário, em relação à Polícia Comunitária, é:", alternativas: A("a prática/atividade da filosofia", "a filosofia organizacional", "um órgão específico", "uma lei federal", "um equipamento"), gabarito: "A", explicacao: "Polícia Comunitária = filosofia; Policiamento Comunitário = prática." },
  // M2
  { modulo: "2", tipo: "multipla", enunciado: "O princípio de buscar junto à comunidade seus anseios para traduzi-los em segurança é o de:", alternativas: A("Filosofia e Estratégia Organizacional", "Mudança Interna", "Construção do Futuro", "Criatividade", "Extensão do Mandato"), gabarito: "A", explicacao: "É o 1º princípio (base = comunidade)." },
  { modulo: "2", tipo: "certo_errado", enunciado: "O princípio da resolução preventiva de problemas tende a reduzir as chamadas ao COPOM.", gabarito: "certo", explicacao: "Correto. O policial antecipa-se à ocorrência." },
  { modulo: "2", tipo: "multipla", enunciado: "A 'concessão de poder à comunidade' significa tratar os cidadãos como:", alternativas: A("plenos parceiros da polícia", "meros espectadores", "suspeitos", "subordinados", "adversários"), gabarito: "A", explicacao: "2º princípio: cidadãos como parceiros plenos." },
  { modulo: "2", tipo: "certo_errado", enunciado: "A 'mudança interna' projeta-se para 10 a 15 anos, envolvendo toda a organização.", gabarito: "certo", explicacao: "Correto. Exige reciclagem de cursos e quadros." },
  { modulo: "2", tipo: "multipla", enunciado: "Tratar com prioridade jovens, idosos, minorias e deficientes corresponde ao princípio de:", alternativas: A("Ajuda às pessoas com Necessidades Específicas", "Mudança interna", "Criatividade e apoio básico", "Construção do futuro", "Filosofia organizacional"), gabarito: "A", explicacao: "7º princípio: valoriza os mais vulneráveis." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Confiar no discernimento e na experiência do policial da linha de frente é o princípio da criatividade e apoio básico.", gabarito: "certo", explicacao: "Correto. 8º princípio." },
  // M3
  { modulo: "3", tipo: "multipla", enunciado: "Entre as quatro estratégias, têm enfoque preventivo (ordem e redução do medo):", alternativas: A("policiamento orientado para o problema e polícia comunitária", "combate profissional do crime e estratégico", "todas igualmente", "nenhuma", "apenas o tradicional"), gabarito: "A", explicacao: "1 e 2 focam controle do crime; 3 e 4 focam ordem/medo (preventivo)." },
  { modulo: "3", tipo: "certo_errado", enunciado: "No modelo tradicional, a polícia é vista como a especialista exclusiva do policiamento, mantendo distância da comunidade.", gabarito: "certo", explicacao: "Correto. Distanciamento é marca do combate profissional do crime." },
  { modulo: "3", tipo: "multipla", enunciado: "A estratégia dominante mundialmente desde 1950 é:", alternativas: A("o combate profissional do crime (tradicional)", "a polícia comunitária", "o sistema Koban", "o policiamento orientado para o problema", "o policiamento estratégico"), gabarito: "A", explicacao: "O combate profissional do crime orienta a maioria das polícias." },
  { modulo: "3", tipo: "certo_errado", enunciado: "A Polícia Comunitária e o tradicional têm exatamente os mesmos objetivos e a mesma relação com a comunidade.", gabarito: "errado", explicacao: "Errado. Diferem em objetivos (crime × ordem/medo) e na relação (distante × próxima)." },
  // M4
  { modulo: "4", tipo: "certo_errado", enunciado: "O Policiamento Comunitário é uma fórmula mágica que resolve sozinho a insegurança.", gabarito: "errado", explicacao: "Errado. NÃO é panaceia; depende da reeducação da polícia e da sociedade." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O Policiamento Comunitário não é espalhafatoso, exigindo humildade do policial.", gabarito: "certo", explicacao: "Correto. Nada de ações para 'aparecer'." },
  { modulo: "4", tipo: "multipla", enunciado: "Afirmar que o Policiamento Comunitário 'não pode ser de cima para baixo' significa que:", alternativas: A("as iniciativas começam com o policial de serviço", "só a cúpula decide", "depende de lei federal", "exclui a comunidade", "ignora o policial de ponta"), gabarito: "A", explicacao: "Admite compartilhar poder com o subordinado de ponta." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O Policiamento Comunitário é uma ação especializada e isolada, restrita a um grupo dentro da PM.", gabarito: "errado", explicacao: "Errado. NÃO é ação isolada; é estratégia de toda a organização." },
  { modulo: "4", tipo: "multipla", enunciado: "Dizer que o Policiamento Comunitário 'não é apenas relações públicas' significa que:", alternativas: A("melhorar a imagem é necessário, mas não é o objetivo principal", "as relações públicas são proibidas", "a imprensa não participa", "não há contato com a comunidade", "basta o 'QSA'"), gabarito: "A", explicacao: "Exige seriedade, técnica e profissionalismo, além das relações." },
  // M5
  { modulo: "5", tipo: "multipla", enunciado: "As autoridades constituídas e organismos governamentais, entre os 6 grupos, referem-se a:", alternativas: A("prefeituras, secretarias e poderes públicos", "apenas a imprensa", "somente o comércio", "exclusivamente a PM", "apenas as escolas"), gabarito: "A", explicacao: "3º grupo: poder público e organismos governamentais." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A comunidade de negócios (comércio e empresas locais) é um dos seis grandes grupos.", gabarito: "certo", explicacao: "Correto. 4º grupo." },
  { modulo: "5", tipo: "multipla", enunciado: "Escolas, igrejas e associações de moradores compõem, entre os 6 grupos:", alternativas: A("as instituições comunitárias", "a organização policial", "a comunidade de negócios", "os veículos de comunicação", "as autoridades constituídas"), gabarito: "A", explicacao: "5º grupo: instituições comunitárias." },
  { modulo: "5", tipo: "certo_errado", enunciado: "O sucesso do policiamento comunitário depende da integração entre os seis grupos, e não só da polícia.", gabarito: "certo", explicacao: "Correto. É parceria multiatoral." },
  { modulo: "5", tipo: "multipla", enunciado: "A imprensa, no policiamento comunitário, atua como:", alternativas: A("veículo de comunicação / formadora de opinião", "órgão de polícia judiciária", "autoridade constituída", "instituição de ensino", "comunidade de negócios"), gabarito: "A", explicacao: "6º grupo: veículos de comunicação." },
  // M6
  { modulo: "6", tipo: "multipla", enunciado: "O Sistema Koban tem origem:", alternativas: A("japonesa (postos fixos de base local)", "norte-americana", "francesa", "alemã", "brasileira"), gabarito: "A", explicacao: "Koban é o modelo japonês, adaptado pela PMESP." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A Patrulha do Bairro foi lançada em Pernambuco em 1985, no governo de Roberto Magalhães.", gabarito: "certo", explicacao: "Correto. 100 kombis na RMR, 2 PMs por viatura ('Cosme e Damião')." },
  { modulo: "6", tipo: "multipla", enunciado: "A referência nacional na adoção de práticas de polícia comunitária citada é a:", alternativas: A("PMMG (Minas Gerais)", "PMRJ", "Polícia Federal", "Guarda Nacional", "Exército"), gabarito: "A", explicacao: "A PMMG é referência; a PMPE adotou princípios semelhantes." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Os NUSEPs perderam força, em parte, pela falta de autonomia dos policiais para resolver problemas locais.", gabarito: "certo", explicacao: "Correto. A burocracia institucional minou a iniciativa." },
  { modulo: "6", tipo: "certo_errado", enunciado: "A polícia comunitária no Brasil ganhou força com a redemocratização, nos anos 1980-90.", gabarito: "certo", explicacao: "Correto. Influência de EUA/Europa e reforma das práticas." },
  // M7
  { modulo: "7", tipo: "multipla", enunciado: "A Senasp foi criada em:", alternativas: A("1997", "1988", "2003", "2014", "2018"), gabarito: "A", explicacao: "Secretaria Nacional de Segurança Pública, 1997." },
  { modulo: "7", tipo: "certo_errado", enunciado: "O primeiro Plano Nacional de Segurança Pública na vigência da Senasp foi editado em 2000 (governo FHC).", gabarito: "certo", explicacao: "Correto. Ênfase em cooperação e modernização." },
  { modulo: "7", tipo: "multipla", enunciado: "A SDS de Pernambuco foi criada pela:", alternativas: A("Lei Complementar nº 49, de 31/01/2003", "Lei nº 473/1900", "Lei nº 13.675/2018", "EC 104/2019", "Lei nº 14.751/2023"), gabarito: "A", explicacao: "LC 49/2003 institui a SDS-PE." },
  { modulo: "7", tipo: "certo_errado", enunciado: "O Programa Nacional de Direitos Humanos (1996) incluiu metas de polícia comunitária.", gabarito: "certo", explicacao: "Correto. Estimulou programas de polícia comunitária." },
  { modulo: "7", tipo: "multipla", enunciado: "Entre os desafios persistentes da segurança pública citados está:", alternativas: A("a descontinuidade das políticas", "o excesso de avaliação", "a sobra de recursos", "a uniformidade nacional plena", "a ausência de criminalidade"), gabarito: "A", explicacao: "Descontinuidade, falta de avaliação e complexidade do tema." },
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
  console.log(`FPC reforco: ${c} criadas/${u} atualizadas. Total ${all.length} (~${(all.length/mods.size).toFixed(1)}/mod).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
