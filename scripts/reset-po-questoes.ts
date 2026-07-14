/**
 * reset-po-questoes.ts — RESET TOTAL das questões de PO (Procedimento em Ocorrências).
 *
 * Fonte: scripts/data/plataforma-questoes-po.html (arrays TEMAS[] + simQuesitos[]).
 * Ação DESTRUTIVA: apaga TODAS as questões materia="PO" (cascade nas Respostas dos alunos)
 * e reinsere a partir do arquivo — 8 temas (módulos 01–08) + simulado (módulo SIM-2AE).
 *
 * Rodar:  node_modules/.bin/tsx scripts/reset-po-questoes.ts
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

const MATERIA = "PO"
const LETRAS = ["A", "B", "C", "D", "E"]
const SIM_MOD = "SIM-2AE"
const SIM_FONTE = "Simulado 2ª AE PO — CFO 2025"

// ── Extração dos arrays literais do HTML (dados puros, sem chamadas de função) ──
function extractArray(src: string, marker: string, endMarker: string): any[] {
  const start = src.indexOf(marker)
  if (start < 0) throw new Error(`marcador não encontrado: ${marker}`)
  const from = src.indexOf("[", start)
  const endIdx = src.indexOf(endMarker, from)
  if (from < 0 || endIdx < 0) throw new Error(`limites não encontrados p/ ${marker}`)
  let text = src.slice(from, endIdx)
  text = text.slice(0, text.lastIndexOf("]") + 1) // apara o `;` e espaços após o `]` de fechamento
  return new Function(`return (${text})`)() as any[]
}

// ── Tipos de registro ──
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

const buildCE = (modulo: string, t: string, g: boolean, j: string, fonte: string, contexto?: string) =>
  push({ materia: MATERIA, modulo, tipo: "certo_errado", contexto: contexto ?? null, enunciado: t,
    alternativas: [], gabarito: g ? "certo" : "errado", explicacao: j?.trim() || null, modelo: null, fonte })

const buildMC = (modulo: string, enun: string, alts: string[], g: number, j: string, fonte: string, contexto?: string) =>
  push({ materia: MATERIA, modulo, tipo: "multipla", contexto: contexto ?? null, enunciado: enun,
    alternativas: alts.map((texto, i) => ({ id: LETRAS[i], texto })), gabarito: LETRAS[g],
    explicacao: j?.trim() || null, modelo: null, fonte })

const buildDisc = (modulo: string, enun: string, linhas: string, esp: [string, string][], fonte: string, contexto?: string) =>
  push({ materia: MATERIA, modulo, tipo: "dissertativa", contexto: contexto ?? null, enunciado: enun,
    alternativas: [], gabarito: "", explicacao: null,
    modelo: {
      estrutura: esp.map(e => e[0]).join(" → ") + (linhas ? ` (${linhas})` : ""),
      criterios: esp.map(([tit, txt]) => `${tit}: ${txt}`),
      resposta: esp.map(e => e[1]).join(" "),
    }, fonte })

async function main() {
  const html = readFileSync(new URL("./data/plataforma-questoes-po.html", import.meta.url), "utf8")
  const TEMAS = extractArray(html, "const TEMAS =", "const TEMAS_FUTUROS")
  const SIM = extractArray(html, "const simQuesitos =", "/* ═")

  // ── Temas 01–08 → módulos 01–08 ──
  for (const tema of TEMAS) {
    const modulo = String(tema.num)
    const fonte = String(tema.base || "")
    for (const v of tema.vf || []) buildCE(modulo, v.t, v.g, v.j, fonte)
    for (const m of tema.mc || []) buildMC(modulo, m.enun, m.alts, m.g, m.j, fonte)
    for (const d of tema.disc || []) buildDisc(modulo, d.enun, d.linhas, d.esp, fonte)
  }

  // ── Simulado → módulo SIM-2AE (vf-quesito vira N certo_errado com contexto=enunciado do quesito) ──
  for (const q of SIM) {
    if (q.tipo === "vf") for (const it of q.itens || []) buildCE(SIM_MOD, it.t, it.g, it.j, SIM_FONTE, q.enun)
    else if (q.tipo === "mc") buildMC(SIM_MOD, q.enun, q.alts, q.g, q.j, SIM_FONTE)
    else if (q.tipo === "disc") buildDisc(SIM_MOD, q.enun, q.linhas, q.esp, SIM_FONTE)
  }

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

  // ── RESET: apaga questões PO atuais (cascade apaga Respostas) ──
  const antes = await prisma.questao.count({ where: { materia: MATERIA } })
  const del = await prisma.questao.deleteMany({ where: { materia: MATERIA } })
  console.log(`\nApagadas ${del.count} questões PO antigas (de ${antes}).`)

  // ── Insere as novas ──
  const created = await prisma.questao.createMany({
    data: unicos.map(({ hash, ...d }) => ({ ...d, alternativas: d.alternativas as any, modelo: d.modelo as any, hash })),
    skipDuplicates: true,
  })
  const depois = await prisma.questao.count({ where: { materia: MATERIA } })
  console.log(`Inseridas ${created.count}. Total PO agora: ${depois}.`)
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
