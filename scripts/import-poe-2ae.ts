// POE no banco de questões, organizado pelas duas AEs:
//   • 2ª AE (11/11/2026) — caps. 7 a 11 da apostila: módulos 2AE-1 … 2AE-7 e 2AE-SIM
//     (dados em scripts/data/poe-2ae-questoes.ts).
//   • 1ª AE — artefato "QUESTÕES — POE (1ª AV)" (10 temas + simulados A e B):
//     módulos 1AV-1 … 1AV-10, 1AV-SA e 1AV-SB (scripts/data/artefato-questoes-poe-1av.html).
// Os módulos antigos de POE (1–6 e SIM) ficam como estão.
//
// Uso: npx tsx scripts/import-poe-2ae.ts [--gravar]
// Sem --gravar só mostra o que faria. Idempotente (hash materia|modulo|enunciado);
// questões dos módulos 2AE-*/1AV-* que sumirem dos dados são apagadas.

import "dotenv/config"
import { readFileSync } from "fs"
import { createHash } from "crypto"
import vm from "vm"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import { TEMAS_POE_2AE, SIMULADO_POE_2AE, type VF, type MC, type DS } from "./data/poe-2ae-questoes"

neonConfig.webSocketConstructor = ws
const GRAVAR = process.argv.includes("--gravar")
const MAT = "POE"

type Linha = { modulo: string; tipo: string; contexto: string | null; enunciado: string; alternativas: { id: string; texto: string }[]; gabarito: string; explicacao: string | null; modelo: object | null; fonte: string }
const linhas: Linha[] = []
const limpo = (t: string) => t.replace(/([.;:])?\s*<\/li>/g, (_m, p?: string) => (p ? `${p} ` : "; ")).replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").replace(/;\s*$/, "").trim()

const vf = (modulo: string, fonte: string, [e, ok, x]: VF, contexto: string | null = null) =>
  linhas.push({ modulo, tipo: "certo_errado", contexto, enunciado: limpo(e), alternativas: [], gabarito: ok ? "certo" : "errado", explicacao: limpo(x), modelo: null, fonte })
const mc = (modulo: string, fonte: string, [e, alts, c, x]: MC) =>
  linhas.push({ modulo, tipo: "multipla", contexto: null, enunciado: limpo(e), alternativas: alts.map((t, i) => ({ id: "ABCDE"[i], texto: limpo(t) })), gabarito: "ABCDE"[c], explicacao: limpo(x), modelo: null, fonte })
const ds = (modulo: string, fonte: string, [e, espelho]: DS) => {
  const enunciado = limpo(e); const resposta = limpo(espelho)
  const linhasMin = enunciado.match(/\(mín\.[^)]*\)/)?.[0] ?? ""
  const criterios = resposta.split(/(?<=[.;])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9(])/).map(s => s.trim()).filter(s => s.length > 12)
  linhas.push({ modulo, tipo: "dissertativa", contexto: null, enunciado, alternativas: [], gabarito: "", explicacao: null,
    modelo: { estrutura: linhasMin ? `Resposta discursiva ${linhasMin}` : "Resposta discursiva", criterios, resposta }, fonte })
}

// ── 2ª AE: banco novo (caps. 7 a 11)
for (const t of TEMAS_POE_2AE) {
  t.vf.forEach(q => vf(t.modulo, t.fonte, q)); t.mc.forEach(q => mc(t.modulo, t.fonte, q)); t.ds.forEach(q => ds(t.modulo, t.fonte, q))
}
const fonteSim2 = "Simulado da 2ª AE de POE — caps. 7 a 11 (10,0 pontos · 100 min)"
SIMULADO_POE_2AE.vf.forEach(q => vf("2AE-SIM", fonteSim2, q))
SIMULADO_POE_2AE.mc.forEach(q => mc("2AE-SIM", fonteSim2, q))
SIMULADO_POE_2AE.ds.forEach(q => ds("2AE-SIM", fonteSim2, q))

// ── 1ª AE: artefato em HTML (só os literais CH e SIMS, avaliados num contexto vazio)
type CapArt = { t: string; vf: VF[]; mc: MC[]; d: DS[] }
type SimQ = { tp: "vf"; tit: string; it: [string, boolean | "X", string][] } | { tp: "mc"; tit: string; op: string[]; ok: number[] } | { tp: "d"; tit: string; esp: string; lin?: string }
const html = readFileSync("scripts/data/artefato-questoes-poe-1av.html", "utf8")
const literal = <T,>(nome: string): T => {
  const i = html.indexOf(`const ${nome}=`); const j = html.indexOf("\n", i)
  if (i < 0) throw new Error(`não achei ${nome} no artefato`)
  return vm.runInNewContext(`(${html.slice(i + nome.length + 7, j).replace(/;\s*$/, "")})`, {}) as T
}
const CH = literal<CapArt[]>("CH")
const SIMS = literal<Record<string, { nome: string; q: SimQ[] }>>("SIMS")
CH.forEach((c, i) => {
  const mod = `1AV-${i + 1}`; const fonte = `Questões POE (1ª AV) · ${c.t}`
  c.vf.forEach(q => vf(mod, fonte, q)); c.mc.forEach(q => mc(mod, fonte, q)); c.d.forEach(q => ds(mod, fonte, q))
})
for (const [k, s] of Object.entries(SIMS)) {
  const mod = `1AV-S${k.toUpperCase()}`; const fonte = `${s.nome} · 1ª AV de POE`
  for (const q of s.q) {
    if (q.tp === "vf") q.it.forEach(([e, ok, x]) => { if (ok !== "X") vf(mod, fonte, [e, ok, x], limpo(q.tit)) })
    else if (q.tp === "mc") mc(mod, fonte, [q.tit, q.op, q.ok[0], ""])
    else ds(mod, fonte, [`${q.tit}${q.lin ? ` (${q.lin})` : ""}`, q.esp])
  }
}

async function main() {
  const porModulo = linhas.reduce<Record<string, number>>((a, l) => (a[l.modulo] = (a[l.modulo] ?? 0) + 1, a), {})
  console.log(`${MAT}: ${linhas.length} questões`, porModulo)
  if (!GRAVAR) { console.log("  (teste — nada gravado; rode com --gravar)"); return }

  const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
  try {
    const hashes = linhas.map(l => createHash("sha1").update(`${MAT}|${l.modulo}|${l.enunciado}`).digest("hex"))
    const ja = new Set((await prisma.questao.findMany({ where: { hash: { in: hashes } }, select: { hash: true } })).map(q => q.hash))
    const obsoletas = await prisma.questao.findMany({
      where: { materia: MAT, OR: [{ modulo: { startsWith: "2AE-" } }, { modulo: { startsWith: "1AV-" } }], hash: { notIn: hashes } },
      select: { id: true },
    })
    if (obsoletas.length) await prisma.questao.deleteMany({ where: { id: { in: obsoletas.map(q => q.id) } } })
    let novas = 0
    for (const [i, l] of linhas.entries()) {
      const data = { materia: MAT, ...l, modelo: l.modelo ?? undefined }
      await prisma.questao.upsert({ where: { hash: hashes[i] }, update: data, create: { ...data, hash: hashes[i] } })
      if (!ja.has(hashes[i])) novas++
    }
    console.log(`  gravado: ${novas} novas, ${linhas.length - novas} atualizadas, ${obsoletas.length} removidas.`)
  } finally { await prisma.$disconnect() }
}
main()
