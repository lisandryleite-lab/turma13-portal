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
  | { modulo: string; tipo: "dissertativa"; enunciado: string; modelo: { estrutura: string; criterios: string[]; resposta: string } }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

const QS: Q[] = [
  { modulo: "1", tipo: "certo_errado", enunciado: "Segundo Trojanowicz (1994), a Polícia Comunitária é uma filosofia e estratégia organizacional baseada na parceria entre população e polícia para identificar e resolver problemas.", gabarito: "certo", explicacao: "Correto. É a definição de Trojanowicz: filosofia e estratégia organizacional fundada na parceria comunidade-polícia." },
  { modulo: "1", tipo: "certo_errado", enunciado: "Polícia Comunitária e Policiamento Comunitário são expressões sinônimas, sem qualquer distinção técnica.", gabarito: "errado", explicacao: "Errado. Polícia Comunitária é a FILOSOFIA organizacional; Policiamento Comunitário é a PRÁTICA (atividade) dessa filosofia." },
  { modulo: "1", tipo: "multipla", enunciado: "A distinção correta entre Polícia Comunitária e Policiamento Comunitário é:", alternativas: A("a primeira é a filosofia organizacional; o segundo é a sua prática/atividade", "a primeira é federal; o segundo, estadual", "a primeira é repressiva; o segundo, preventivo", "são exatamente a mesma coisa", "a primeira é teórica e o segundo é ilegal"), gabarito: "A", explicacao: "Polícia Comunitária = filosofia/estratégia organizacional; Policiamento Comunitário = prática dessa filosofia." },
  { modulo: "2", tipo: "certo_errado", enunciado: "Entre os dez princípios da Polícia Comunitária está a resolução preventiva de problemas a curto e a longo prazo, com o policial antecipando-se à ocorrência.", gabarito: "certo", explicacao: "Correto. É o 4º princípio de Trojanowicz; a antecipação reduz as chamadas ao COPOM." },
  { modulo: "2", tipo: "certo_errado", enunciado: "O princípio da 'mudança interna' produz resultados imediatos, em questão de poucos meses.", gabarito: "errado", explicacao: "Errado. A mudança interna é uma transformação de longo prazo, que se projeta para 10 a 15 anos." },
  { modulo: "2", tipo: "multipla", enunciado: "O princípio segundo o qual cada policial atua como um 'chefe de polícia local', com autonomia e responsabilidade, é o de:", alternativas: A("Extensão do Mandato Policial", "Policiamento Descentralizado e Personalizado", "Construção do Futuro", "Criatividade e apoio básico", "Mudança interna"), gabarito: "A", explicacao: "É o princípio da Extensão do Mandato Policial: o policial age como 'chefe de polícia local'." },
  { modulo: "3", tipo: "certo_errado", enunciado: "As estratégias 'combate profissional do crime' e 'policiamento estratégico' têm como objetivo principal o controle do crime.", gabarito: "certo", explicacao: "Correto. Ambas focam o controle do crime; já o policiamento orientado para o problema e a polícia comunitária enfatizam ordem e redução do medo." },
  { modulo: "3", tipo: "multipla", enunciado: "São as quatro grandes estratégias de policiamento dos últimos ~50 anos:", alternativas: A("combate profissional do crime, policiamento estratégico, orientado para o problema e polícia comunitária", "ostensivo, velado, montado e aéreo", "preventivo, repressivo, investigativo e judiciário", "federal, estadual, municipal e distrital", "a pé, motorizado, ciclístico e hidroviário"), gabarito: "A", explicacao: "São: combate profissional do crime (tradicional), policiamento estratégico, orientado para o problema e polícia comunitária." },
  { modulo: "3", tipo: "certo_errado", enunciado: "O policiamento tradicional caracteriza-se por unidades centralizadas e especializadas e por um certo distanciamento da comunidade.", gabarito: "certo", explicacao: "Correto. O 'combate profissional do crime' (tradicional) centraliza e especializa, mantendo distância da comunidade." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O Policiamento Comunitário é antitecnologia, pois o policial comunitário deve atuar desarmado e sem recursos modernos.", gabarito: "errado", explicacao: "Errado. O Policiamento Comunitário NÃO é antitecnologia; usa computadores, monitoramento e armamento moderno — o policial 'desarmado' é mito." },
  { modulo: "4", tipo: "certo_errado", enunciado: "O Policiamento Comunitário não é condescendente com o crime: os policiais comunitários fazem prisões e agem com energia, dentro da lei.", gabarito: "certo", explicacao: "Correto. É um dos pontos do 'o que NÃO é': não há tolerância com o crime." },
  { modulo: "4", tipo: "multipla", enunciado: "Assinale a afirmação CORRETA sobre o que NÃO é Policiamento Comunitário:", alternativas: A("não é apenas relações públicas, nem fórmula mágica, nem ação especializada isolada", "é uma tática passageira a ser abandonada depois", "é um enfoque de cima para baixo imposto pela cúpula", "é condescendente com criminosos", "é antitecnologia e paternalista"), gabarito: "A", explicacao: "O Policiamento Comunitário não é relações públicas, nem panaceia, nem ação isolada — é estratégia de toda a instituição." },
  { modulo: "5", tipo: "certo_errado", enunciado: "Os seis grandes grupos do policiamento comunitário incluem a organização policial, a comunidade, as autoridades constituídas, a comunidade de negócios, as instituições comunitárias e os veículos de comunicação.", gabarito: "certo", explicacao: "Correto. São os seis atores que devem atuar em parceria no policiamento comunitário." },
  { modulo: "5", tipo: "multipla", enunciado: "NÃO compõe os seis grandes grupos (atores) do policiamento comunitário:", alternativas: A("O Ministério Público Militar", "A organização policial", "A comunidade", "A comunidade de negócios", "Os veículos de comunicação"), gabarito: "A", explicacao: "Os seis grupos são: organização policial, comunidade, autoridades constituídas, comunidade de negócios, instituições comunitárias e veículos de comunicação. O MPM não consta nessa lista." },
  { modulo: "6", tipo: "certo_errado", enunciado: "O Sistema Koban tem origem japonesa e foi adotado/adaptado pela PMESP, sendo referência para a PMPE.", gabarito: "certo", explicacao: "Correto. O Koban (postos fixos de base local) é modelo japonês adaptado no Brasil." },
  { modulo: "6", tipo: "multipla", enunciado: "A 'Patrulha do Bairro', em Pernambuco, foi lançada em 1985 (governo Roberto Magalhães) e:", alternativas: A("distribuía 100 kombis pela RMR, com 2 PMs por viatura, conhecidos como 'Cosme e Damião'", "criou as Forças Especiais da PMPE", "extinguiu o policiamento ostensivo", "foi um programa federal do governo FHC", "substituiu a Polícia Civil na RMR"), gabarito: "A", explicacao: "A Patrulha do Bairro usava 100 kombis na RMR, com 2 PMs cada, apelidados de 'Cosme e Damião'." },
  { modulo: "7", tipo: "certo_errado", enunciado: "A Secretaria de Defesa Social (SDS) de Pernambuco foi criada pela Lei Complementar nº 49, de 31/01/2003.", gabarito: "certo", explicacao: "Correto. A SDS integra as ações de defesa social do Estado, criada pela LC 49/2003." },
  { modulo: "7", tipo: "multipla", enunciado: "Sobre os marcos da segurança pública no Brasil, é correto afirmar:", alternativas: A("a Senasp foi criada em 1997 e o 1º Plano Nacional de Segurança Pública é de 2000 (governo FHC)", "a Senasp foi criada em 2010 e nunca elaborou planos", "o Plano Nacional de Segurança Pública é de 1985", "a SDS-PE é anterior à Senasp", "não há marcos normativos de segurança pública no país"), gabarito: "A", explicacao: "Senasp (1997) e Plano Nacional de Segurança Pública (2000, gov. FHC) são marcos citados; a SDS-PE é de 2003." },
  { modulo: "2", tipo: "dissertativa", enunciado: "Disserte sobre a distinção entre Polícia Comunitária e Policiamento Comunitário e cite ao menos quatro dos dez princípios de Trojanowicz.", modelo: { estrutura: "Distinção filosofia × prática → princípios → conclusão.", criterios: ["Definir Polícia Comunitária como filosofia/estratégia organizacional", "Definir Policiamento Comunitário como a prática dessa filosofia", "Citar ao menos quatro dos dez princípios"], resposta: "A Polícia Comunitária é a filosofia e estratégia organizacional que orienta toda a instituição, fundada na parceria entre polícia e comunidade (Trojanowicz, 1994); o Policiamento Comunitário é a prática concreta dessa filosofia no patrulhamento personalizado. Entre os dez princípios destacam-se: filosofia e estratégia organizacional; concessão de poder à comunidade; policiamento descentralizado e personalizado; resolução preventiva de problemas a curto e longo prazo; ética, legalidade, responsabilidade e confiança; e a mudança interna, que se projeta para 10 a 15 anos." } },
  { modulo: "3", tipo: "dissertativa", enunciado: "Compare o modelo tradicional de policiamento (combate profissional do crime) com a Polícia Comunitária quanto a objetivos e relação com a comunidade.", modelo: { estrutura: "Tradicional → comunitária → contraste → conclusão.", criterios: ["Tradicional: foco no controle do crime, centralização, distanciamento", "Comunitária: ordem, redução do medo, prevenção e proximidade", "Apontar o contraste de objetivos e de relação com a comunidade"], resposta: "O modelo tradicional (combate profissional do crime), dominante desde 1950, tem como objetivo central o controle do crime, com unidades centralizadas e especializadas e certo distanciamento da comunidade — a polícia é vista como a especialista exclusiva. A Polícia Comunitária, por sua vez, enfatiza a manutenção da ordem, a redução do medo e a qualidade de vida, por meio de um relacionamento estreito e de parceria com a comunidade, com enfoque preventivo. Assim, enquanto o tradicional foca taxas de crime, a comunitária foca prevenção, ordem e confiança." } },
]

type Card = { modulo: string; frente: string; verso: string }
const CARDS: Card[] = [
  { modulo: "1", frente: "Polícia Comunitária × Policiamento Comunitário", verso: `• Polícia Comunitária: FILOSOFIA e estratégia organizacional (toda a instituição).\n• Policiamento Comunitário: a PRÁTICA/atividade dessa filosofia (patrulhamento personalizado).\n• Trojanowicz (1994): parceria polícia-comunidade para resolver problemas.` },
  { modulo: "2", frente: "10 Princípios de Trojanowicz (1-5)", verso: `1. Filosofia e Estratégia Organizacional; 2. Concessão de poder à comunidade; 3. Policiamento descentralizado e personalizado; 4. Resolução preventiva (curto e longo prazo); 5. Ética, legalidade, responsabilidade e confiança.` },
  { modulo: "2", frente: "10 Princípios de Trojanowicz (6-10)", verso: `6. Extensão do mandato policial (chefe de polícia local); 7. Ajuda a pessoas com necessidades específicas; 8. Criatividade e apoio básico; 9. Mudança interna (10–15 anos); 10. Construção do futuro (descentralizado, não imposto de fora).` },
  { modulo: "3", frente: "4 estratégias de policiamento", verso: `1. Combate profissional do crime (tradicional); 2. Policiamento estratégico; 3. Orientado para o problema; 4. Polícia comunitária.\n• 1 e 2 → controle do crime; 3 e 4 → ordem e redução do medo (preventivo).` },
  { modulo: "4", frente: "O que NÃO é Policiamento Comunitário", verso: `• Não é tática passageira, RP/QSA, antitecnologia, condescendente com o crime, espalhafatoso, paternalista, ação isolada, "perfumaria", de cima para baixo, nem fórmula mágica.` },
  { modulo: "5", frente: "6 grandes grupos (atores)", verso: `1. Organização policial; 2. Comunidade; 3. Autoridades constituídas/organismos governamentais; 4. Comunidade de negócios; 5. Instituições comunitárias; 6. Veículos de comunicação (imprensa).` },
  { modulo: "6", frente: "Koban, Patrulha do Bairro e NUSEPs", verso: `• Koban: modelo japonês (postos fixos), adotado pela PMESP, referência na PMPE.\n• Patrulha do Bairro (PE, 1985, gov. Roberto Magalhães): 100 kombis na RMR, 2 PMs, "Cosme e Damião".\n• NUSEPs perderam força por falta de autonomia; evoluíram p/ NSC e NISC.` },
  { modulo: "7", frente: "Marcos normativos", verso: `• Senasp: 1997. Plano Nacional de Segurança Pública: 2000 (gov. FHC).\n• Programa Nacional de Direitos Humanos (1996) incluiu metas de polícia comunitária.\n• SDS-PE: Lei Complementar nº 49, de 31/01/2003.` },
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
  let fc = 0
  for (const card of CARDS) {
    const hash = createHash("sha1").update(`${MAT}|${card.modulo}|${card.frente}`).digest("hex")
    await prisma.flashcard.upsert({ where: { hash }, update: { verso: card.verso, ordem: fc }, create: { materia: MAT, modulo: card.modulo, frente: card.frente, verso: card.verso, ordem: fc, hash } })
    fc++
  }
  const [tq, tc] = await Promise.all([prisma.questao.count({ where: { materia: MAT } }), prisma.flashcard.count({ where: { materia: MAT } })])
  console.log(`FPC: questoes ${c} criadas/${u} atualizadas (total ${tq}); flashcards ${fc} (total ${tc}).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
