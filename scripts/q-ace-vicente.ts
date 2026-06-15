import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "ACE"
const MOD = "Exercícios — Ten Vicente"

type Alt = { id: string; texto: string }
type Q =
  | { tipo: "certo_errado"; contexto?: string; enunciado: string; gabarito: "certo" | "errado"; explicacao: string }
  | { tipo: "multipla"; contexto?: string; enunciado: string; alternativas: Alt[]; gabarito: string; explicacao: string }
const A = (...t: string[]): Alt[] => t.map((texto, i) => ({ id: "ABCDE"[i], texto }))

// Contextos (dados dos exercícios)
const C1 = `2º Ten Antônio (19º BPM – Boa Viagem), no planejamento de combate ao CVP, levantou os CVP por bairro:
Boa Viagem 419 · Imbiribeira 189 · Ibura 108 · Pina 91 · Cohab 81 · Ipsep 70 · Jordão 31 · Brasília Teimosa 7. TOTAL: 996.`

const C2 = `Ten Carneiro (CPO/DIM) estudou os MVI do 1º trimestre/2025, por AIS:
AIS1 22 · AIS2 29 · AIS3 24 · AIS4 37 · AIS5 47 · AIS6 75 · AIS7 24 · AIS8 64 · AIS9 24 · AIS10 44.
População (01/01/2025): AIS1 75.110 · AIS2 307.618 · AIS3 367.936 · AIS4 386.872 · AIS5 341.039 · AIS6 698.908 · AIS7 344.080 · AIS8 641.487 · AIS9 261.492 · AIS10 310.157.`

const C3 = `MVI no 1º trimestre/2024 na AIS 03, por bairro:
Boa Viagem 4 · Imbiribeira 6 · Ibura 10 · Pina 3 · Cohab 8 · Ipsep 3 · Jordão 1 · Brasília Teimosa 1.`

const C4 = `Série mensal (JAN–MAI):
MVI: 10, 12, 14, 10, 8.
Encaminhados à DP por tráfico: 20, 16, 12, 21, 18.`

const QS: Q[] = [
  // ── Exercício 1 — CVP por bairro ──
  { tipo: "multipla", contexto: C1, enunciado: "Qual bairro tem a maior incidência de CVP e quanto ele representa do total?", alternativas: A("Boa Viagem — 42,1%", "Imbiribeira — 19,0%", "Boa Viagem — 38,0%", "Ibura — 10,8%", "Boa Viagem — 52,0%"), gabarito: "A", explicacao: "Boa Viagem é a maior (419). 419 ÷ 996 × 100 = 42,1%." },
  { tipo: "multipla", contexto: C1, enunciado: "Qual o número mínimo de bairros de maior incidência que, somados, representam mais da metade dos CVP (mais de 498)?", alternativas: A("2 — Boa Viagem e Imbiribeira", "1 — Boa Viagem", "3 — Boa Viagem, Imbiribeira e Ibura", "4 bairros", "5 bairros"), gabarito: "A", explicacao: "Boa Viagem sozinha = 419 (< 498). Boa Viagem + Imbiribeira = 419 + 189 = 608 (> 498). Logo, 2 bairros." },
  { tipo: "multipla", contexto: C1, enunciado: "Quais bairros estão compreendidos até o 3º quartil (Q3) da distribuição de CVP dessa área?", alternativas: A("Boa Viagem, Imbiribeira e Ibura", "Apenas Boa Viagem", "Boa Viagem e Imbiribeira", "Todos os 8 bairros", "Boa Viagem, Imbiribeira, Ibura e Pina"), gabarito: "A", explicacao: "Até o 3º quartil concentram-se os bairros de maior incidência: Boa Viagem, Imbiribeira e Ibura." },

  // ── Exercício 2 — MVI por AIS (DIM) ──
  { tipo: "multipla", contexto: C2, enunciado: "Qual a taxa de MVI da AIS 5 (por 100 mil habitantes)?", alternativas: A("13,78", "4,7", "138", "1,38", "47"), gabarito: "A", explicacao: "Taxa = (vítimas ÷ população) × 100.000 = (47 ÷ 341.039) × 100.000 = 13,78." },
  { tipo: "multipla", contexto: C2, enunciado: "Qual AIS tem a maior incidência (absoluta) de MVI?", alternativas: A("AIS 6", "AIS 8", "AIS 5", "AIS 1", "AIS 10"), gabarito: "A", explicacao: "AIS 6 tem 75 MVI — o maior valor absoluto." },
  { tipo: "multipla", contexto: C2, enunciado: "Qual a amplitude de MVI entre as AIS?", alternativas: A("53", "75", "22", "44", "31"), gabarito: "A", explicacao: "Amplitude = maior − menor = 75 (AIS 6) − 22 (AIS 1) = 53." },
  { tipo: "multipla", contexto: C2, enunciado: "Qual a mediana de MVI das AIS?", alternativas: A("33", "29", "37", "35,5", "44"), gabarito: "A", explicacao: "Ordenando: 22,24,24,24,29,37,44,47,64,75 (10 valores). Mediana = média dos centrais (5º e 6º) = (29 + 37) ÷ 2 = 33." },
  { tipo: "multipla", contexto: C2, enunciado: "Qual a AIS mais violenta (maior taxa por 100 mil habitantes)?", alternativas: A("AIS 1", "AIS 6", "AIS 5", "AIS 8", "AIS 10"), gabarito: "A", explicacao: "Pela taxa, AIS 1 = (22 ÷ 75.110) × 100.000 ≈ 29,3 — a maior. Atenção: maior incidência absoluta (AIS 6) ≠ maior taxa (AIS 1)." },
  { tipo: "multipla", contexto: C2, enunciado: "Quantas vezes a AIS mais violenta é, em taxa, em relação à menos violenta?", alternativas: A("4,5 vezes", "3,4 vezes", "2,0 vezes", "6,8 vezes", "5,0 vezes"), gabarito: "A", explicacao: "Mais violenta AIS 1 (≈29,3) ÷ menos violenta AIS 3 (≈6,5) ≈ 4,5 vezes." },

  // ── Exercício 3 — Variância e desvio padrão ──
  { tipo: "multipla", contexto: C3, enunciado: "Qual o valor da variância dos MVI por bairro (amostral)?", alternativas: A("10,6", "3,3", "9,25", "74", "4,5"), gabarito: "A", explicacao: "Média = 36 ÷ 8 = 4,5. Soma dos quadrados dos desvios = 74. Variância amostral = 74 ÷ (8−1) = 10,6." },
  { tipo: "multipla", contexto: C3, enunciado: "Qual o valor do desvio padrão dos MVI por bairro?", alternativas: A("3,3", "10,6", "2,9", "4,5", "6,0"), gabarito: "A", explicacao: "Desvio padrão = √variância = √10,6 ≈ 3,3." },

  // ── Exercício 4 — Correlação ──
  { tipo: "multipla", contexto: C4, enunciado: "A associação linear entre MVI e pessoas encaminhadas por tráfico é:", alternativas: A("inversamente proporcional", "diretamente proporcional", "nula", "perfeita positiva", "exponencial"), gabarito: "A", explicacao: "Quando uma sobe a outra tende a cair → correlação negativa (inversamente proporcional)." },
  { tipo: "multipla", contexto: C4, enunciado: "Qual o grau (coeficiente) de associação linear entre as variáveis?", alternativas: A("−0,78", "+0,78", "−0,21", "+0,45", "−1,00"), gabarito: "A", explicacao: "r ≈ −0,78: correlação negativa forte (próxima de −1)." },
  { tipo: "certo_errado", contexto: C4, enunciado: "O maior número de pessoas encaminhadas à DP por tráfico ajuda na redução do MVI.", gabarito: "certo", explicacao: "Sim. A correlação negativa forte (r ≈ −0,78) indica que mais encaminhamentos acompanham menos MVI." },
]

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MAT } })
  if (!disc) throw new Error(`Disciplina ${MAT} não existe.`)
  let c = 0, u = 0
  for (const q of QS) {
    const hash = createHash("sha1").update(`${MAT}|${MOD}|${q.enunciado}`).digest("hex")
    const base: any = { materia: MAT, modulo: MOD, tipo: q.tipo, contexto: q.contexto ?? null, enunciado: q.enunciado, hash }
    if (q.tipo === "multipla") { base.alternativas = q.alternativas; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else { base.alternativas = []; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    const exists = await prisma.questao.findUnique({ where: { hash } })
    await prisma.questao.upsert({ where: { hash }, update: base, create: base })
    exists ? u++ : c++
  }
  const tq = await prisma.questao.count({ where: { materia: MAT, modulo: MOD } })
  console.log(`ACE/${MOD}: ${c} criadas, ${u} atualizadas (total no módulo: ${tq}).`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
