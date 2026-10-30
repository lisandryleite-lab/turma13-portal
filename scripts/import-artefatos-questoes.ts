// Importa para o banco de questões os artefatos "Questões <MATÉRIA>" (série CFO):
// cada tema vira o módulo T1, T2…; o simulado vira SIM2 — sem misturar com os
// bancos antigos da mesma matéria (módulos 1, 2… e SIM).
//
// Uso: npx tsx scripts/import-artefatos-questoes.ts <SIGLA> <arquivo.html> [--gravar]
// Sem --gravar só mostra o que faria. Idempotente (hash materia|modulo|enunciado).

import "dotenv/config"
import { readFileSync } from "fs"
import { createHash } from "crypto"
import vm from "vm"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

type VF = [string, boolean, string]
type MC = [string, string[], number, string]
type DS = [string, string] | [string, number, string]
type Tema = { t: string; s: string; vf: VF[]; mc: MC[]; ds: DS[] }
type Sim = { vf: [string, VF[]][]; mc: MC[]; ds: DS[] }

const [, , SIGLA, ARQ, flag] = process.argv
const GRAVAR = flag === "--gravar"
if (!SIGLA || !ARQ) { console.error("uso: <SIGLA> <arquivo.html> [--gravar]"); process.exit(1) }

// Só os literais de dados do artefato (BANK e SIM), avaliados num contexto vazio.
const html = readFileSync(ARQ, "utf8")
const trecho = (ini: string, fim: string) => {
  const i = html.indexOf(ini); const j = html.indexOf(fim, i)
  if (i < 0 || j < 0) throw new Error(`não achei ${ini}`)
  return html.slice(i + ini.length - 1, j + fim.length - 1) // sem o ";" final
}
const BANK = vm.runInNewContext(`(${trecho("const BANK=[", "\n];")})`, {}) as Tema[]
const SIM = vm.runInNewContext(`(${trecho("const SIM={", "\n]};")})`, {}) as Sim

// Mesmo embaralhamento fixo do artefato, para o gabarito não ficar sempre na A.
function prep(list: MC[], salt: number) {
  list.forEach((m, k) => {
    const n = m[1].length; const idx = [...Array(n).keys()]; let s = k * 7 + salt * 13 + 3
    for (let i = n - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]] }
    const nc = idx.indexOf(m[2]); m[1] = idx.map(i => m[1][i]); m[3] = m[3].replace(/^[A-E](?= )/, "ABCDE"[nc]); m[2] = nc
  })
}
BANK.forEach((c, ci) => prep(c.mc, ci + 1)); prep(SIM.mc, 99)

const limpo = (t: string) => t.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()
const semTema = (t: string) => t.replace(/^TEMA \d+ — /, "")

type Linha = { modulo: string; tipo: string; enunciado: string; alternativas: { id: string; texto: string }[]; gabarito: string; explicacao: string | null; modelo: object | null; fonte: string }
const linhas: Linha[] = []
const vf = (modulo: string, fonte: string, [e, ok, x]: VF) =>
  linhas.push({ modulo, tipo: "certo_errado", enunciado: limpo(e), alternativas: [], gabarito: ok ? "certo" : "errado", explicacao: limpo(x), modelo: null, fonte })
const mc = (modulo: string, fonte: string, [e, alts, c, x]: MC) =>
  linhas.push({ modulo, tipo: "multipla", enunciado: limpo(e), alternativas: alts.map((t, i) => ({ id: "ABCDE"[i], texto: limpo(t) })), gabarito: "ABCDE"[c], explicacao: limpo(x), modelo: null, fonte })
const ds = (modulo: string, fonte: string, d: DS) => {
  const e = limpo(d[0]); const esp = limpo(d.length === 3 ? d[2] : d[1]).replace(/^Espelho:\s*/, "")
  const resposta = esp.replace(/\s*Critério sugerido:.*$/, "")
  const linhasMin = e.match(/\(mín\.[^)]*\)/)?.[0] ?? ""
  const criterios = resposta.split(/(?<=[.;])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9(<])/).map(s => s.trim()).filter(s => s.length > 12)
  linhas.push({ modulo, tipo: "dissertativa", enunciado: e, alternativas: [], gabarito: "", explicacao: null,
    modelo: { estrutura: linhasMin ? `Resposta discursiva ${linhasMin}` : "Resposta discursiva", criterios, resposta }, fonte })
}

BANK.forEach((tema, i) => {
  const mod = `T${i + 1}`; const fonte = `${semTema(tema.t)} · ${limpo(tema.s)}`
  tema.vf.forEach(q => vf(mod, fonte, q)); tema.mc.forEach(q => mc(mod, fonte, q)); tema.ds.forEach(q => ds(mod, fonte, q))
})
const fonteSim = "Simulado no formato da prova (10,0 pontos · 100 min)"
SIM.vf.forEach(([, qs]) => qs.forEach(q => vf("SIM2", fonteSim, q)))
SIM.mc.forEach(q => mc("SIM2", fonteSim, q)); SIM.ds.forEach(q => ds("SIM2", fonteSim, q))

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: SIGLA } })
  if (!disc) throw new Error(`disciplina ${SIGLA} não existe`)
  const hashes = linhas.map(l => createHash("sha1").update(`${SIGLA}|${l.modulo}|${l.enunciado}`).digest("hex"))
  const ja = new Set((await prisma.questao.findMany({ where: { hash: { in: hashes } }, select: { hash: true } })).map(q => q.hash))
  const porTipo = linhas.reduce<Record<string, number>>((a, l) => (a[l.tipo] = (a[l.tipo] ?? 0) + 1, a), {})
  console.log(`${SIGLA} (${disc.nome}): ${linhas.length} questões em ${BANK.length} temas + SIM2`, porTipo, `· já no banco: ${ja.size}`)
  BANK.forEach((t, i) => console.log(`  T${i + 1}: ${semTema(t.t)}`))
  if (!GRAVAR) { console.log("  (teste — nada gravado; rode com --gravar)"); return }
  let novas = 0
  for (const [i, l] of linhas.entries()) {
    const data = { materia: SIGLA, ...l, alternativas: l.alternativas, modelo: l.modelo ?? undefined }
    await prisma.questao.upsert({ where: { hash: hashes[i] }, update: data, create: { ...data, hash: hashes[i] } })
    if (!ja.has(hashes[i])) novas++
  }
  console.log(`  gravado: ${novas} novas, ${linhas.length - novas} atualizadas.`)
}
main().finally(() => prisma.$disconnect())
