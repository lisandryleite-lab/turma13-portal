import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "TCEM"

type Alt = { id: string; texto: string }
type Q =
  | { modulo: string; tipo: "certo_errado"; enunciado: string; gabarito: "certo" | "errado"; explicacao: string }
  | { modulo: string; tipo: "multipla"; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string }
  | { modulo: string; tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string } }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const QS: Q[] = [
  // ── Módulo 1 — Comando, Chefia e Liderança ──
  { modulo: "1", tipo: "certo_errado", enunciado: "Comando é o exercício profissional de um cargo militar e reúne a autoridade legal do cargo, a administração e, desejavelmente, a liderança.", gabarito: "certo", explicacao: "Correto. Comando (chefia/direção) congrega autoridade legal, administração e liderança como ferramentas da ação de comandar." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Comando e liderança militar são sinônimos, de modo que todo comandante é necessariamente um líder.", gabarito: "errado", explicacao: "Errado. Comando é o exercício formal/legal do cargo; a liderança é um elemento informal (desejável) do comando — nem todo comandante exerce liderança." },
  { modulo: "1", tipo: "multipla", enunciado: "Segundo o Trabalho de Comando, são consideradas ferramentas para a ação de comandar:", alternativas: A("autoridade legal, administração e liderança", "hierarquia, disciplina e antiguidade", "patente, soldo e tempo de serviço", "ordem, contraordem e desordem", "planejamento, orçamento e logística"), gabarito: "A", explicacao: "A autoridade legal do cargo, a administração e a liderança são as ferramentas do comando." },

  // ── Módulo 2 — Liderança Militar ──
  { modulo: "2", tipo: "certo_errado", enunciado: "Na liderança direta o líder influencia diretamente os liderados; na liderança indireta a influência é exercida por meio de outros líderes a ele subordinados.", gabarito: "certo", explicacao: "Correto. São as duas formas de liderança militar, presentes em diferentes proporções nos níveis de comando." },
  { modulo: "2", tipo: "multipla", enunciado: "Os níveis de comando no âmbito da liderança militar são:", alternativas: A("pequenos escalões, organizacional e estratégico", "tático, operacional e logístico", "federal, estadual e municipal", "esquadra, companhia e batalhão apenas", "interno, externo e misto"), gabarito: "A", explicacao: "A liderança militar é exercida nos níveis de pequenos escalões, organizacional e estratégico." },
  { modulo: "2", tipo: "certo_errado", enunciado: "De nada adianta o líder possuir excepcionais competências se não tiver em sua personalidade os valores fundamentais do bom caráter e da Ética Militar.", gabarito: "certo", explicacao: "Correto. A apostila destaca que os valores e a Ética Militar são a base, sem a qual as competências não formam o líder." },

  // ── Módulo 3 — Estilos de Comando ──
  { modulo: "3", tipo: "multipla", enunciado: "O estilo de comando em que o comandante centraliza todas as decisões, fixa normas e não se utiliza do assessoramento dos subordinados é o:", alternativas: A("autocrático", "participativo", "delegativo", "liberal", "carismático"), gabarito: "A", explicacao: "No estilo autocrático o comandante decide sozinho; é adequado em situações de combate/emergência, mas desgasta vínculos se usado em excesso." },
  { modulo: "3", tipo: "certo_errado", enunciado: "No estilo de comando participativo, ao ouvir e aproveitar as sugestões do grupo, o comandante abre mão de sua autoridade e da decisão final.", gabarito: "errado", explicacao: "Errado. O estilo participativo NÃO exclui a autoridade do comandante — a decisão final continua sendo dele, após ouvir os pareceres." },
  { modulo: "3", tipo: "multipla", enunciado: "O estilo de comando delegativo é mais indicado quando:", alternativas: A("os assuntos são de natureza técnica e os assessores têm conhecimento igual ou superior ao do comandante", "é preciso ação imediata em combate, sem questionamento", "o comandante deseja centralizar todas as decisões", "não há subordinados disponíveis", "se quer eliminar a hierarquia"), gabarito: "A", explicacao: "No delegativo o comandante atribui a decisão a assessores especializados (assuntos técnicos), sem perder o controle da situação." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O comandante deve optar definitivamente por um único estilo de comando e mantê-lo em todas as situações.", gabarito: "errado", explicacao: "Errado. Não há estilo único e melhor: o comandante deve alternar os estilos conforme a situação e o perfil do grupo (visão contingencial)." },

  // ── Módulo 4 — Estrutura do Estado-Maior ──
  { modulo: "4", tipo: "certo_errado", enunciado: "O Estado-Maior é órgão de assessoramento, planejamento e coordenação que atua mediante diretrizes baixadas pelo comandante, preferencialmente por escrito.", gabarito: "certo", explicacao: "Correto. O EM assessora o comandante e atua conforme suas diretrizes, liberando-o dos detalhes pela descentralização." },
  { modulo: "4", tipo: "multipla", enunciado: "A estrutura orgânica do Estado-Maior da PMPE é definida pelo:", alternativas: A("Decreto nº 17.589/1994 (Regulamento Geral da PMPE)", "Decreto nº 88.777/1983 (R-200)", "Lei nº 11.328/1996", "Lei nº 11.817/2000 (CDMEPE)", "Lei nº 13.675/2018 (SUSP)"), gabarito: "A", explicacao: "O Decreto nº 17.589/1994 (Regulamento dos Órgãos de Assessoramento e Direção) estabelece a estrutura do EM (arts. 29 e 30)." },
  { modulo: "4", tipo: "certo_errado", enunciado: "Cabe ao Chefe do Estado-Maior manter-se informado das atividades em desenvolvimento, a fim de poder assumir o comando, se necessário, sem quebra da sequência lógica do planejamento e da execução.", gabarito: "certo", explicacao: "Correto. É uma das atribuições do Chefe do EM; o Subchefe o assessora e o substitui em impedimentos." },

  // ── Módulo 5 — Seções do EM (PM/1 a PM/8) ──
  { modulo: "5", tipo: "multipla", enunciado: "A Seção do Estado-Maior encarregada dos assuntos relativos a pessoal e legislação é a:", alternativas: A("PM/1", "PM/2", "PM/3", "PM/4", "PM/6"), gabarito: "A", explicacao: "A PM/1 trata de pessoal e legislação (efetivo, Q.O., movimentação, moral da tropa)." },
  { modulo: "5", tipo: "multipla", enunciado: "A 3ª Seção do Estado-Maior (PM/3) é encarregada do trato dos assuntos relativos a:", alternativas: A("ensino, instrução e operações", "informação e contrainformação", "apoio logístico", "orçamento e finanças", "doutrina institucional"), gabarito: "A", explicacao: "A PM/3 cuida de ensino, instrução e operações (inclui cerimonial e planejamento operacional). A PM/2 = inteligência; PM/4 = logística; PM/6 = orçamento; PM/8 = doutrina." },
  { modulo: "5", tipo: "certo_errado", enunciado: "A 8ª Seção do Estado-Maior (PM/8) é o setor responsável pela doutrina institucional da Corporação, formulando, revisando e disseminando a doutrina policial militar.", gabarito: "certo", explicacao: "Correto. A PM/8 cuida da doutrina; a PM/7, dos projetos estruturadores (Lei nº 15.186/2013)." },
  { modulo: "5", tipo: "multipla", enunciado: "Associe corretamente a Seção do EM ao seu encargo:", alternativas: A("PM/4 — apoio logístico (suprimento, transporte, manutenção)", "PM/4 — comunicação social e cerimonial", "PM/2 — orçamento e finanças", "PM/5 — informação e contrainformação", "PM/6 — pessoal e legislação"), gabarito: "A", explicacao: "PM/4 = logística; PM/5 = assuntos civis/comunicação social (ASCOM) e cerimonial; PM/2 = inteligência; PM/6 = orçamento; PM/1 = pessoal." },

  // ── Módulo 6 — Atividades do Estado-Maior ──
  { modulo: "6", tipo: "multipla", enunciado: "São as cinco atividades comuns a todos os oficiais de Estado-Maior (Decreto nº 17.589/1994, art. 30):", alternativas: A("produzir informações, realizar estudos de situação, apresentar propostas, elaborar planos e ordens e supervisionar a execução", "planejar, organizar, dirigir, coordenar e controlar", "prever, comandar, fiscalizar, punir e recompensar", "patrulhar, abordar, deter, escoltar e custodiar", "recrutar, formar, promover, transferir e reformar"), gabarito: "A", explicacao: "As 5 atividades do EM: informações → estudos de situação → propostas → planos e ordens → supervisão da execução." },
  { modulo: "6", tipo: "certo_errado", enunciado: "Ao apresentar propostas e sugestões, os oficiais do Estado-Maior assessoram o comandante, mas isso não transfere a eles a responsabilidade do comando.", gabarito: "certo", explicacao: "Correto. As propostas têm caráter de colaboração/assessoramento; a responsabilidade pela decisão é do comandante." },
  { modulo: "6", tipo: "certo_errado", enunciado: "No estudo de situação, o Estado-Maior fornece ao comandante a análise do problema, as conclusões e as linhas de ação possíveis para subsidiar a decisão.", gabarito: "certo", explicacao: "Correto. O estudo de situação levanta a análise, conclusões, linhas de ação possíveis e propostas de emprego dos meios." },

  // ── Módulo 7 — Organização Básica da PMPE ──
  { modulo: "7", tipo: "multipla", enunciado: "A Organização Básica da Polícia Militar de Pernambuco é disciplinada pela:", alternativas: A("Lei nº 11.328, de 11 de janeiro de 1996", "Lei nº 11.817, de 24 de julho de 2000", "Lei nº 13.675, de 11 de junho de 2018", "Lei nº 6.783, de 1974", "Lei nº 15.186, de 2013"), gabarito: "A", explicacao: "A Lei nº 11.328/1996 dispõe sobre a Organização Básica da PMPE." },
  { modulo: "7", tipo: "certo_errado", enunciado: "Conforme a Lei nº 11.328/1996, a PMPE, força auxiliar e reserva do Exército, organizada com base na hierarquia e na disciplina, destina-se ao exercício da polícia ostensiva e à preservação da ordem pública.", gabarito: "certo", explicacao: "Correto. Reproduz o art. 1º da Lei nº 11.328/1996, em consonância com o art. 144, §5º, da CF." },

  // ── Módulo 8 — Trabalho de Comando: plano, programa e projeto ──
  { modulo: "8", tipo: "multipla", enunciado: "Sobre plano, programa e projeto, é correto afirmar:", alternativas: A("o programa é um conjunto de projetos com o mesmo objetivo, geridos de forma coordenada", "o projeto é mais amplo que o programa", "o plano é uma ação específica com início e fim definidos", "os três termos são sinônimos sem qualquer diferença", "o projeto não possui prazo de término"), gabarito: "A", explicacao: "Programa = conjunto coordenado de projetos (amplo); plano = documento diretor; projeto = ação específica com início e fim definidos." },
  { modulo: "8", tipo: "certo_errado", enunciado: "O diagnóstico é ferramenta fundamental que identifica os problemas e as necessidades de uma comunidade ou região, servindo de base para elaborar planos, programas e projetos de segurança pública.", gabarito: "certo", explicacao: "Correto. O diagnóstico antecede o Trabalho de Comando, orientando estratégias, alocação de recursos e avaliação de eficácia." },
  { modulo: "8", tipo: "dissertativa", enunciado: "Diferencie os estilos de comando autocrático, participativo e delegativo, indicando uma situação adequada para cada um.", modelo: { estrutura: "Conceito de estilo de comando → autocrático → participativo → delegativo → conclusão (alternância).", criterios: ["Definir corretamente os três estilos", "Indicar situação adequada para cada um", "Concluir que não há estilo único e melhor (alternância conforme a situação)"], resposta: "Estilo de comando é a maneira como o comandante se porta para dar direção e estimular o grupo. No estilo autocrático o comandante centraliza as decisões e não usa o assessoramento — adequado em situações de combate/emergência, que exigem ação imediata sem questionamento. No participativo, o comandante ouve e aproveita as sugestões do grupo antes de decidir, gerando corresponsabilidade e coesão, mantendo, porém, a decisão final — adequado a grupos competentes e com iniciativa. No delegativo, atribui a decisão a assessores especializados, sendo indicado para assuntos técnicos e para a execução descentralizada nos níveis intermediário e superior. Conclui-se que não existe um estilo único e melhor: cabe ao comandante alternar os estilos conforme a situação e o perfil do grupo." } },
  { modulo: "6", tipo: "dissertativa", enunciado: "Enuncie as cinco atividades comuns aos oficiais de Estado-Maior e explique sucintamente cada uma.", modelo: { estrutura: "Introdução (papel do EM) → 5 atividades → conclusão.", criterios: ["Citar as 5 atividades na ordem", "Explicar cada uma sucintamente", "Relacionar com o assessoramento ao comandante"], resposta: "O Estado-Maior assessora o comandante por meio de cinco atividades comuns a todos os seus oficiais (Decreto nº 17.589/1994, art. 30): (1) produzir informações — coletar, consolidar e interpretar dados, entregando-os prontos ao comando; (2) realizar estudos de situação — analisar o problema e levantar as linhas de ação possíveis; (3) apresentar propostas e sugestões — assessorar a decisão, sem assumir a responsabilidade do comando; (4) elaborar planos e ordens — transformar as decisões e diretrizes do comandante em documentos de execução; e (5) supervisionar a execução dos planos e ordens — assegurar que sejam corretamente cumpridos, realimentando o comando com relatórios de situação." } },
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
  const tq = await prisma.questao.count({ where: { materia: MAT } })
  console.log(`TCEM: questoes ${c} criadas/${u} atualizadas (total ${tq}).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
