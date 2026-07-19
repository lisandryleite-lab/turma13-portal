/**
 * reset-tcem-questoes.ts — RESET TOTAL das questões de TCEM (Trabalho de Comando e Estado-Maior).
 *
 * Fonte: scripts/data/tcem-questoes-1va.json (banco por tema + questões da apostila + simulado).
 * Ação DESTRUTIVA: apaga TODAS as questões materia="TCEM" (cascade nas Respostas dos alunos)
 * e reinsere a partir do arquivo — módulos 02–06 (caps. 2 a 6), APOSTILA e SIM-1VA.
 *
 * Rodar:        node_modules/.bin/tsx scripts/reset-tcem-questoes.ts
 * Simulação:    DRY=1 node_modules/.bin/tsx scripts/reset-tcem-questoes.ts
 */
import "dotenv/config"
import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const MATERIA = "TCEM"
const LETRAS = ["A", "B", "C", "D", "E"]
const MOD_APOSTILA = "APOSTILA"
const MOD_SIM = "SIM-1VA"

// ── Formato do JSON de origem ──
type VF = { t: string; r: boolean; j: string }
type ME = { e: string; a: string[]; c: number; j: string }
type DISC = { e: string; esp: string; p?: number }
type Tema = { titulo: string; legal: string; vf: VF[]; me: ME[]; disc: DISC[] }
type Apost =
  | { tipo: "me"; fonte: string; e: string; a: string[]; c: number; j: string }
  | { tipo: "disc"; fonte: string; e: string; esp: string }
type Fonte = { banco: Record<string, Tema>; apostila: Apost[]; sim: { vf: VF[]; me: ME[]; disc: DISC[] } }

type Alt = { id: string; texto: string }
type Rec = {
  materia: string; modulo: string; tipo: string
  contexto: string | null; enunciado: string
  alternativas: Alt[]; gabarito: string
  explicacao: string | null
  modelo: { estrutura: string; criterios: string[]; resposta: string } | null
  fonte: string | null
  hash: string
}

const recs: Rec[] = []
const push = (r: Omit<Rec, "hash">) => {
  const enun = r.enunciado.trim()
  if (!enun) return
  const hash = createHash("sha1").update(`${r.materia}|${r.modulo}|${enun}`).digest("hex")
  recs.push({ ...r, enunciado: enun, hash })
}

const buildCE = (modulo: string, q: VF, fonte: string) =>
  push({ materia: MATERIA, modulo, tipo: "certo_errado", contexto: null, enunciado: q.t,
    alternativas: [], gabarito: q.r ? "certo" : "errado", explicacao: q.j?.trim() || null, modelo: null, fonte })

const buildMC = (modulo: string, q: { e: string; a: string[]; c: number; j: string }, fonte: string) =>
  push({ materia: MATERIA, modulo, tipo: "multipla", contexto: null, enunciado: q.e,
    alternativas: q.a.map((texto, i) => ({ id: LETRAS[i], texto })), gabarito: LETRAS[q.c],
    explicacao: q.j?.trim() || null, modelo: null, fonte })

const buildDisc = (modulo: string, q: DISC, fonte: string) =>
  push({ materia: MATERIA, modulo, tipo: "dissertativa", contexto: null, enunciado: q.e,
    alternativas: [], gabarito: "", explicacao: null,
    modelo: {
      estrutura: q.p ? `Discursiva do simulado — valor ${q.p.toFixed(1)} pts` : "Discursiva — responder conforme o espelho",
      criterios: q.esp.split(/(?=\((?:\d|[a-z])\))/).map(s => s.trim()).filter(Boolean),
      resposta: q.esp.trim(),
    }, fonte })

async function main() {
  const data = JSON.parse(
    readFileSync(new URL("./data/tcem-questoes-1va.json", import.meta.url), "utf8"),
  ) as Fonte

  // ── Banco por tema → módulos "02".."06" (capítulos da apostila) ──
  for (const [cap, tema] of Object.entries(data.banco)) {
    const modulo = cap.padStart(2, "0")
    const fonte = `Cap. ${cap} — ${tema.titulo} · ${tema.legal}`
    for (const v of tema.vf) buildCE(modulo, v, fonte)
    for (const m of tema.me) buildMC(modulo, m, fonte)
    for (const d of tema.disc) buildDisc(modulo, d, fonte)
  }

  // ── Questões originais da apostila/revisão → módulo APOSTILA ──
  for (const q of data.apostila) {
    if (q.tipo === "me") buildMC(MOD_APOSTILA, q, q.fonte)
    else buildDisc(MOD_APOSTILA, { e: q.e, esp: q.esp }, q.fonte)
  }

  // ── Simulado 1ª VA → módulo SIM-1VA ──
  const fonteSim = "Simulado 1ª VA TCEM — CFO PM 2026 (10,0 pts · 100 min)"
  for (const v of data.sim.vf) buildCE(MOD_SIM, v, fonteSim)
  for (const m of data.sim.me) buildMC(MOD_SIM, m, fonteSim)
  for (const d of data.sim.disc) buildDisc(MOD_SIM, d, fonteSim)

  // ── Dedupe por hash (mantém o primeiro) ──
  const seen = new Set<string>()
  const unicos = recs.filter(r => (seen.has(r.hash) ? false : (seen.add(r.hash), true)))

  const porMod: Record<string, Record<string, number>> = {}
  for (const r of unicos) { porMod[r.modulo] ??= {}; porMod[r.modulo][r.tipo] = (porMod[r.modulo][r.tipo] || 0) + 1 }
  console.log(`Registros a inserir: ${unicos.length} (duplicados por hash removidos: ${recs.length - unicos.length})`)
  for (const m of Object.keys(porMod).sort()) console.log("  módulo", m, "=>", JSON.stringify(porMod[m]))

  const disc = await prisma.disciplina.findUnique({ where: { sigla: MATERIA } })
  if (!disc) throw new Error(`Disciplina "${MATERIA}" não existe.`)

  if (process.env.DRY) {
    console.log("\n[DRY-RUN] Nada foi alterado no banco. Amostra de 3 registros:")
    console.log(JSON.stringify(unicos.slice(0, 3), null, 2))
    await prisma.$disconnect(); return
  }

  // ── RESET: apaga questões TCEM atuais (cascade apaga Respostas) ──
  const antes = await prisma.questao.count({ where: { materia: MATERIA } })
  const del = await prisma.questao.deleteMany({ where: { materia: MATERIA } })
  console.log(`\nApagadas ${del.count} questões TCEM antigas (de ${antes}).`)

  // ── Insere as novas ──
  const created = await prisma.questao.createMany({
    data: unicos.map(({ hash, ...d }) => ({ ...d, alternativas: d.alternativas as any, modelo: d.modelo as any, hash })),
    skipDuplicates: true,
  })
  const depois = await prisma.questao.count({ where: { materia: MATERIA } })
  console.log(`Inseridas ${created.count}. Total TCEM agora: ${depois}.`)
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
