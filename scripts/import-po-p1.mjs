import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { PrismaClient } from "../lib/generated/prisma/client.ts"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

const envFile = readFileSync(new URL("../.env", import.meta.url), "utf8")
for (const line of envFile.split("\n")) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i)
  if (m) process.env[m[1]] ||= m[2].replace(/^["']|["']$/g, "")
}
neonConfig.webSocketConstructor = ws

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const pacote = JSON.parse(readFileSync(new URL("../../po_p1_import.json", import.meta.url), "utf8"))
const materia = String(pacote.materia).trim().toUpperCase()
const modulo = pacote.modulo != null ? String(pacote.modulo).trim() : ""

const disc = await prisma.disciplina.findUnique({ where: { sigla: materia } })
if (!disc) { console.error(`Materia "${materia}" nao existe nas disciplinas.`); process.exit(1) }

let criadas = 0, atualizadas = 0
const erros = []

for (const [i, q] of pacote.questoes.entries()) {
  const tipo = ["certo_errado", "dissertativa"].includes(q.tipo || "") ? q.tipo : "multipla"
  const enunciado = String(q.enunciado || "").trim()
  const gabarito = String(q.gabarito || "").trim()
  if (!enunciado) { erros.push(`Q${i + 1}: enunciado ausente`); continue }
  const alternativas = tipo === "multipla" ? (q.alternativas || []) : []
  if (tipo === "multipla" && alternativas.length < 2) { erros.push(`Q${i + 1}: <2 alternativas`); continue }
  if (tipo !== "dissertativa" && !gabarito) { erros.push(`Q${i + 1}: gabarito ausente`); continue }
  if (tipo === "dissertativa" && !q.modelo?.resposta) { erros.push(`Q${i + 1}: dissertativa sem modelo`); continue }

  const hash = createHash("sha1").update(`${materia}|${modulo}|${enunciado}`).digest("hex")
  const dados = {
    materia, modulo, tipo,
    contexto: q.contexto?.trim() || null,
    enunciado,
    alternativas,
    gabarito,
    explicacao: q.explicacao?.trim() || null,
    modelo: tipo === "dissertativa" ? q.modelo : undefined,
    fonte: q.fonte?.trim() || null,
  }
  const existe = await prisma.questao.findUnique({ where: { hash } })
  await prisma.questao.upsert({ where: { hash }, update: dados, create: { ...dados, hash } })
  existe ? atualizadas++ : criadas++
}

const total = await prisma.questao.count({ where: { materia } })
console.log(`OK ${materia}/${modulo}: +${criadas} novas, ${atualizadas} atualizadas. Total ${materia}: ${total}`)
if (erros.length) console.log("Erros:", erros)
await prisma.$disconnect()
