import "dotenv/config"
import { createHash } from "crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import { QS as QS_A } from "./q-ig-2a"
import { QS as QS_B } from "./q-ig-2b"
import { QS as QS_C } from "./q-ig-2c"

// Substitui o conjunto de questões de IG pelo novo (módulos 1–28 + as duas
// provas antigas de 2025). Os arquivos q-ig-2a/2b/2c são só dados; este runner
// faz o upsert e apaga o que sobrou do conjunto anterior — por isso a
// substituição acontece numa única passada.
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
const MAT = "IG"
const FONTE_PADRAO = "Apostila Instrução Geral CFO 2024 (APMP)"

const QS = [...(QS_A as any[]), ...(QS_B as any[]), ...(QS_C as any[])]
const hashDe = (q: any) => createHash("sha1").update(`${MAT}|${q.modulo}|${q.enunciado}`).digest("hex")

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: MAT } })
  if (!disc) throw new Error(`Disciplina ${MAT} não existe.`)

  // Colisão de hash = enunciado repetido no mesmo módulo: a segunda sobrescreveria
  // a primeira silenciosamente. Aborta para o autor corrigir.
  const vistos = new Map<string, any>()
  const dups: string[] = []
  for (const q of QS) {
    const h = hashDe(q)
    if (vistos.has(h)) dups.push(`mód. ${q.modulo}: "${q.enunciado.slice(0, 70)}…"`)
    else vistos.set(h, q)
  }
  if (dups.length) {
    console.error(`✗ ${dups.length} enunciado(s) duplicado(s) no mesmo módulo:`)
    dups.forEach(d => console.error("  " + d))
    throw new Error("Corrija os duplicados antes de importar.")
  }

  const semExplicacao = QS.filter(q => q.tipo !== "dissertativa" && !q.explicacao)
  const semModelo = QS.filter(q => q.tipo === "dissertativa" && !q.modelo?.resposta)
  if (semExplicacao.length || semModelo.length)
    throw new Error(`Faltando: ${semExplicacao.length} explicação(ões), ${semModelo.length} modelo(s) de dissertativa.`)

  let c = 0, u = 0
  for (const q of QS) {
    const hash = hashDe(q)
    const base: any = {
      materia: MAT, modulo: q.modulo, tipo: q.tipo, enunciado: q.enunciado, hash,
      contexto: q.contexto ?? null,
      fonte: q.fonte ?? FONTE_PADRAO,
    }
    if (q.tipo === "multipla") { base.alternativas = q.alternativas; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else if (q.tipo === "certo_errado") { base.alternativas = []; base.gabarito = q.gabarito; base.explicacao = q.explicacao }
    else { base.alternativas = []; base.gabarito = ""; base.modelo = q.modelo }
    const exists = await prisma.questao.findUnique({ where: { hash } })
    await prisma.questao.upsert({ where: { hash }, update: base, create: base })
    exists ? u++ : c++
  }

  // Substituição: remove o que não faz parte do novo conjunto.
  const del = await prisma.questao.deleteMany({ where: { materia: MAT, hash: { notIn: [...vistos.keys()] } } })

  const combos = await prisma.questao.groupBy({ by: ["modulo"], where: { materia: MAT }, _count: { _all: true } })
  const tot = combos.reduce((t, x) => t + x._count._all, 0)
  console.log(`IG: ${c} criadas, ${u} atualizadas, ${del.count} obsoletas removidas. Total ${tot}.`)
  console.log(combos
    .sort((a, b) => (Number(a.modulo) || 99) - (Number(b.modulo) || 99) || a.modulo.localeCompare(b.modulo))
    .map(x => `${x.modulo}=${x._count._all}`).join(" | "))
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
