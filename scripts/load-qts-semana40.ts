import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 40

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 12/10","Ter 13/10","Qua 14/10","Qui 15/10","Sex 16/10","Sáb 17/10","Dom 18/10"]

// Transcrito do "HORÁRIO DE AULA SEMANAL - TURMA 13 · Semana 40" (12 a 18/10/2026),
// a folha ATUALIZADA só da Turma 13, com contador X/Y. Substitui a 1ª versão
// desta semana, tirada do QTS mestre de duas sub-colunas e sem contador.
// As 11 colunas da folha batem uma a uma com HORARIOS.
// Siglas da folha → banco: DPPPM → DPPM · UDFIT → UDF. PU = Patrulhamento Urbano.
// Quinta 15/10: PU às 08h00–09h40 e "À disp. do CA" às 10h00–11h40 (contadores
// 199 e 200, sem disciplina). Sexta 16/10: TP com a marca de prova 1/2.
// Sábado sem aula; DOMINGO 18/10 com instrução (TPE e PU) — pela escala de
// faxina, a equipe SEGUNDA cobre esse domingo.
const grade: Record<string, string[]> = {
  "Seg 12/10": ["", "AE","AE",     "AE","AE",     "DPPM","DPPM", "DPPM","DPPM", "DPPM","DPPM"],
  "Ter 13/10": ["", "AV","AV",     "AV","AV",     "TP","TP",     "TP","TP",     "TPE","TPE"],
  "Qua 14/10": ["", "POE","POE",   "POE","POE",   "UDF","UDF",   "UDF","UDF",   "UDF","UDF"],
  "Qui 15/10": ["", "PU","PU",     "À disp. CA","À disp. CA", "PJM","PJM", "PJM","PJM", "PJM","PJM"],
  "Sex 16/10": ["", "TP","TP",     "TP","TP",     "QAGV","QAGV", "QAGV","QAGV", "",""],
  "Sáb 17/10": ["","","","","","","","","","",""],
  "Dom 18/10": ["", "TPE","TPE",   "TPE","TPE",   "PU","PU",     "PU","PU",     "",""],
}

// Contador oficial da folha, gravado de forma ABSOLUTA (rodar de novo não soma).
// `antes` é a hora anterior à primeira aula da semana. Saltos em relação ao fim
// da semana 39: POE recomeça em 37 (a 39 terminou em 34) e UDF em 5 (sem aula
// registrada antes) — vale o contador desta folha.
const CONTADOR_40: Record<string, { antes: number; depois: number }> = {
  AE:   { antes: 20, depois: 24 },  // 21/50 … 24/50  (seg 4)
  DPPM: { antes: 34, depois: 40 },  // DPPPM 35/60 … 40/60 (seg 6)
  AV:   { antes: 24, depois: 28 },  // 25/50 … 28/50  (ter 4)
  TP:   { antes: 24, depois: 32 },  // 25/60 … 32/60  (ter 4 + sex 4)
  TPE:  { antes: 24, depois: 30 },  // 25/40 … 30/40  (ter 2 + dom 4)
  POE:  { antes: 36, depois: 40 },  // 37/60 … 40/60  (qua 4)
  UDF:  { antes:  4, depois: 10 },  // UDFIT 5/50 … 10/50 (qua 6)
  PU:   { antes:  0, depois:  6 },  //  1/40 …  6/40  (qui 2 + dom 4) — estreia
  PJM:  { antes: 28, depois: 34 },  // 29/40 … 34/40  (qui 6)
  QAGV: { antes: 10, depois: 14 },  // 11/20 … 14/20  (sex 4)
}

const ULTIMO_DIA: Record<string, string> = {
  AE: "2026-10-12", DPPM: "2026-10-12",
  AV: "2026-10-13",
  POE: "2026-10-14", UDF: "2026-10-14",
  PJM: "2026-10-15",
  TP: "2026-10-16", QAGV: "2026-10-16",
  TPE: "2026-10-18", PU: "2026-10-18",
}

async function main() {
  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({
    where: { semana: SEMANA },
    update: { dados },
    create: { semana: SEMANA, dados },
  })
  console.log(`✓ QTS da semana ${SEMANA} salvo (${DIAS.length} dias).`)

  const hoje = new Date()
  const hojeISO = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`

  console.log("\n── Carga ao fim da semana 40, pelo contador oficial ──")
  const inflada: string[] = []
  const previstas: string[] = []

  for (const [sigla, { antes, depois }] of Object.entries(CONTADOR_40)) {
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }

    // O contador nunca anda para trás: portal acima do `antes` era carga inflada.
    if (disc.cargaMinistrada > antes) inflada.push(`${sigla} +${disc.cargaMinistrada - antes}h`)

    const futura = ULTIMO_DIA[sigla] > hojeISO
    if (futura) previstas.push(sigla)

    const status = depois >= disc.cargaTotal ? "Concluída" : depois > 0 ? "Em andamento" : "Início"
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: depois, status } })

    const marca = status === "Concluída" ? "✔" : futura ? "»" : "•"
    const nota = futura ? `  (previsto — aula de ${ULTIMO_DIA[sigla].slice(8, 10)}/10)` : ""
    console.log(`  ${marca} ${sigla.padEnd(6)} ${String(disc.cargaMinistrada).padStart(2)}h → ${depois}/${disc.cargaTotal}h  ${status}${nota}`)
  }

  const todas = await prisma.disciplina.findMany()
  const total = todas.reduce((s, d) => s + d.cargaTotal, 0)
  const dada = todas.reduce((s, d) => s + d.cargaMinistrada, 0)
  const encerradas = todas.filter(d => d.cargaMinistrada >= d.cargaTotal && d.cargaTotal > 0).length
  console.log(`\n Total do curso: ${dada}h de ${total}h (${Math.round(dada / total * 100)}%) · ${encerradas}/${todas.length} encerradas`)
  if (inflada.length) console.log(` Estava inflado antes desta rodada: ${inflada.join(", ")}`)
  if (previstas.length) {
    console.log(` ⚠ Lançado como PREVISTO (aula ainda não dada): ${previstas.join(", ")}`)
    console.log(`   Rode de novo ao fim da semana — o contador é absoluto, repetir não soma nada.`)
  }
  console.log(` ⚠ Quinta 15/10 10h00–11h40 "À disp. do CA" — não entra em nenhuma disciplina.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
