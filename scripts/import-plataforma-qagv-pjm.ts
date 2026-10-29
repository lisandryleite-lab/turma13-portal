/**
 * import-plataforma-qagv-pjm.ts — importa as questões das plataformas interativas
 * "Questões QAGV · CFO PM 2026" e "Questões PJM · CFO PM 2026" (artifacts do Claude,
 * cópias em scripts/data/plataforma-questoes-{qagv,pjm}.html) para a tabela Questao.
 *
 * Formato do HTML: B[] de blocos { t, vf:[[texto,bool,just]], mc:[[enun,[alts],idx,just]],
 * dc:[[enun,linhas,espelho]] } + SIM (simulado) e, no QAGV, SIM2 (Prova AE 2026 · T19).
 *
 * NÃO destrutivo para os bancos já existentes: os blocos entram como módulos novos
 * (QAGV 10–15, SIM2, AE-2026 · PJM 7–11, SIM2). Idempotente: upsert pelo hash
 * sha1(materia|modulo|enunciado) e, só dentro desses módulos, remove o que saiu da fonte.
 *
 * Rodar (dry-run):  DRY=1 npx tsx scripts/import-plataforma-qagv-pjm.ts
 * Rodar (real):     npx tsx scripts/import-plataforma-qagv-pjm.ts
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

const LETRAS = ["A", "B", "C", "D", "E"]

type VF = [string, boolean, string]
type MC = [string, string[], number, string]
type DC = [string, string, string]
type Bloco = { t: string; vf?: VF[]; mc?: MC[]; dc?: DC[] }
type SimQ =
  | { tipo: "vf"; enun: string; itens: VF[] }
  | { tipo: "mc"; enun: string; op: string[]; c: number; j: string }
  | { tipo: "dc"; enun: string; esp: string; min?: number; max?: number }
type Sim = { Q: SimQ[] }

type Fonte = {
  materia: string
  arquivo: string
  primeiroModulo: number               // bloco 1 vira este módulo
  rotulo: string                       // prefixo do campo `fonte`
  sims: { variavel: "SIM" | "SIM2"; modulo: string; fonte: string }[]
}

const FONTES: Fonte[] = [
  {
    materia: "QAGV", arquivo: "plataforma-questoes-qagv.html", primeiroModulo: 10,
    rotulo: "Plataforma QAGV · CFO PM 2026",
    sims: [
      { variavel: "SIM", modulo: "SIM2", fonte: "Plataforma QAGV · Simulado (10,0 pts · 100 min)" },
      { variavel: "SIM2", modulo: "AE-2026", fonte: "Prova AE de QAGV · CFO 2026 (T19) — aplicada em 15/09/2026, gabarito oficial" },
    ],
  },
  {
    materia: "PJM", arquivo: "plataforma-questoes-pjm.html", primeiroModulo: 7,
    rotulo: "Plataforma PJM (APFDM e IPD) · CFO PM 2026",
    sims: [{ variavel: "SIM", modulo: "SIM2", fonte: "Plataforma PJM · Simulado APFDM e IPD (10,0 pts · 100 min)" }],
  },
]

type Rec = {
  materia: string; modulo: string; tipo: string
  contexto: string | null; enunciado: string
  alternativas: { id: string; texto: string }[]; gabarito: string
  explicacao: string | null
  modelo: { estrutura: string; criterios: string[]; resposta: string } | null
  fonte: string; hash: string
}

// Os dados das plataformas são literais puros entre "var B=[];" e o bloco MOTOR.
function lerDados(arquivo: string): { B: Bloco[]; SIM?: Sim; SIM2?: Sim } {
  const html = readFileSync(new URL(`./data/${arquivo}`, import.meta.url), "utf8")
  const ini = html.indexOf("var B=[];")
  const fim = html.indexOf("/* ===================== MOTOR")
  if (ini < 0 || fim < 0) throw new Error(`${arquivo}: marcadores de dados não encontrados`)
  const src = html.slice(ini, fim)
  return new Function(`${src}; return { B: B, SIM: typeof SIM !== "undefined" ? SIM : undefined, SIM2: typeof SIM2 !== "undefined" ? SIM2 : undefined }`)()
}

function montar(f: Fonte): Rec[] {
  const { B, ...sims } = lerDados(f.arquivo)
  const recs: Rec[] = []
  const push = (r: Omit<Rec, "hash" | "materia">) => {
    const enunciado = r.enunciado.trim()
    if (!enunciado) return
    const hash = createHash("sha1").update(`${f.materia}|${r.modulo}|${enunciado}`).digest("hex")
    if (recs.some(x => x.hash === hash)) return
    recs.push({ ...r, materia: f.materia, enunciado, hash })
  }
  const ce = (modulo: string, [t, g, j]: VF, fonte: string, contexto: string | null = null) =>
    push({ modulo, tipo: "certo_errado", contexto, enunciado: t, alternativas: [], gabarito: g ? "certo" : "errado", explicacao: j?.trim() || null, modelo: null, fonte })
  const mc = (modulo: string, enun: string, alts: string[], c: number, j: string, fonte: string) =>
    push({ modulo, tipo: "multipla", contexto: null, enunciado: enun, alternativas: alts.map((texto, i) => ({ id: LETRAS[i], texto })), gabarito: LETRAS[c], explicacao: j?.trim() || null, modelo: null, fonte })
  const dc = (modulo: string, enun: string, linhas: string, esp: string, fonte: string) =>
    push({ modulo, tipo: "dissertativa", contexto: null, enunciado: enun, alternativas: [], gabarito: "", explicacao: null,
      modelo: { estrutura: linhas ? `Resposta de ${linhas}` : "", criterios: [], resposta: esp.trim() }, fonte })

  B.forEach((b, i) => {
    const modulo = String(f.primeiroModulo + i)
    const fonte = `${f.rotulo} · Bloco ${b.t}`
    for (const v of b.vf || []) ce(modulo, v, fonte)
    for (const [enun, alts, c, j] of b.mc || []) mc(modulo, enun, alts, c, j, fonte)
    for (const [enun, linhas, esp] of b.dc || []) dc(modulo, enun, linhas, esp, fonte)
  })
  for (const s of f.sims) {
    const sim = sims[s.variavel]
    if (!sim) throw new Error(`${f.arquivo}: ${s.variavel} não encontrado`)
    for (const q of sim.Q) {
      if (q.tipo === "vf") for (const it of q.itens) ce(s.modulo, it, s.fonte, q.enun)
      else if (q.tipo === "mc") mc(s.modulo, q.enun, q.op, q.c, q.j, s.fonte)
      else dc(s.modulo, q.enun, q.min && q.max ? `${q.min} a ${q.max} linhas` : "", q.esp, s.fonte)
    }
  }
  return recs
}

async function main() {
  for (const f of FONTES) {
    const recs = montar(f)
    const modulos = [...new Set(recs.map(r => r.modulo))]
    const porMod: Record<string, Record<string, number>> = {}
    for (const r of recs) { porMod[r.modulo] ??= {}; porMod[r.modulo][r.tipo] = (porMod[r.modulo][r.tipo] || 0) + 1 }
    console.log(`\n[${f.materia}] ${recs.length} questões da plataforma`)
    for (const m of modulos) console.log("  módulo", m, "=>", JSON.stringify(porMod[m]))

    if (!(await prisma.disciplina.findUnique({ where: { sigla: f.materia } }))) throw new Error(`Disciplina ${f.materia} não existe`)
    if (process.env.DRY) continue

    let criadas = 0, atualizadas = 0
    for (const { hash, ...d } of recs) {
      const data = { ...d, alternativas: d.alternativas, modelo: d.modelo ?? undefined }
      const existe = await prisma.questao.findUnique({ where: { hash }, select: { id: true } })
      if (existe) { await prisma.questao.update({ where: { hash }, data }); atualizadas++ }
      else { await prisma.questao.create({ data: { ...data, hash } }); criadas++ }
    }
    const obsoletas = await prisma.questao.deleteMany({
      where: { materia: f.materia, modulo: { in: modulos }, hash: { notIn: recs.map(r => r.hash) } },
    })
    const total = await prisma.questao.count({ where: { materia: f.materia } })
    console.log(`  ${criadas} criadas, ${atualizadas} atualizadas, ${obsoletas.count} obsoletas removidas · total ${f.materia}: ${total}`)
  }
  if (process.env.DRY) console.log("\n[DRY-RUN] Nada alterado.")
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
