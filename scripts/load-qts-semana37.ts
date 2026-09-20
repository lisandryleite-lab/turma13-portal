import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 37

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 21/09","Ter 22/09","Qua 23/09","Qui 24/09","Sex 25/09","Sáb 26/09","Dom 27/09"]

// Transcrito do QTS mestre — Turma 13 (o quadro DE CIMA da folha; o de baixo é a
// Turma 14 e não entra aqui), semana de 21/09 a 25/09/2026. A planilha rotula
// "Semana 37" e a numeração do portal (semanaAtual() a partir de 12/01/2026)
// também dá 37.
// As 11 colunas da folha batem uma a uma com HORARIOS, sem o remapeamento que as
// semanas 29/30/36 precisaram: 07h00 → idx0 (vago a semana toda) · 08h00 e 08h50
// → idx1,2 · 10h00 e 10h50 → idx3,4 · 13h40 e 14h30 → idx5,6 · 15h40 e 16h30 →
// idx7,8 · 17h30 → idx9 · 18h20 → idx10.
// Siglas da folha → banco: EASPE → EASE · DPPPM → DPPM · TFM-II → TFM2. As demais
// são iguais: TP Tiro Policial · PJM Polícia Judiciária Militar · POE Planejamento
// Operacional e Especializado · AV Abordagem a Veículos · EPCR Elaboração de
// Projetos e Captação de Recursos.
// Sexta 25/09 inteira "À disp. do CA" (contadores 187 a 194, sem disciplina).
// Sáb 26/09 e Dom 27/09 sem aula.
const grade: Record<string, string[]> = {
  "Seg 21/09": ["", "TP","TP",     "PJM","PJM",   "TP","TP",     "POE","POE",   "",""],
  "Ter 22/09": ["", "TP","TP",     "TP","TP",     "AV","AV",     "AV","AV",     "AV","AV"],
  "Qua 23/09": ["", "EASE","EASE", "DPPM","DPPM", "EPCR","EPCR", "PJM","PJM",   "",""],
  "Qui 24/09": ["", "AV","AV",     "AV","AV",     "TFM2","TFM2", "TFM2","TFM2", "",""],
  "Sex 25/09": ["", "À disp. CA","À disp. CA", "À disp. CA","À disp. CA", "À disp. CA","À disp. CA", "À disp. CA","À disp. CA", "",""],
  "Sáb 26/09": ["","","","","","","","","","",""],
  "Dom 27/09": ["","","","","","","","","","",""],
}

// Contador oficial da própria folha ("TP 1/60" = 1ª das 60 horas de Tiro Policial),
// que é a fonte de verdade da carga — e não a soma dos slots, que já inflou o
// portal no passado. `antes` é a hora anterior à primeira aula da semana.
// Confere com onde as semanas anteriores pararam: TFM2 fechou a 35 em 50, levou 2
// na 36 e reabre aqui em 53; POE e EASE fecharam a 35 em 28 e reabrem em 29.
const CONTADOR_37: Record<string, { antes: number; depois: number }> = {
  TP:    { antes:  0, depois:  8 },  //  1/60 …  8/60  (seg 4 + ter 4) — estreia da disciplina
  PJM:   { antes: 16, depois: 20 },  // 17/40 … 20/40  (seg 2 + qua 2)
  POE:   { antes: 28, depois: 30 },  // 29/60 … 30/60  (seg 2)
  AV:    { antes: 10, depois: 20 },  // 11/50 … 20/50  (ter 6 + qui 4)
  EASE:  { antes: 28, depois: 30 },  // EASPE 29/30 … 30/30 (qua 2) — ENCERRA a disciplina
  DPPM:  { antes: 30, depois: 32 },  // DPPPM 31/60 … 32/60 (qua 2)
  EPCR:  { antes: 16, depois: 18 },  // 17/20 … 18/20  (qua 2)
  TFM2:  { antes: 52, depois: 56 },  // TFM-II 53/60 … 56/60 (qui 4)
}

// Dia da última aula de cada disciplina nesta semana — só para o relatório separar
// o que já aconteceu do que ainda é previsão na hora em que o script roda.
const ULTIMO_DIA: Record<string, string> = {
  POE: "2026-09-21",
  TP: "2026-09-22",
  PJM: "2026-09-23", EASE: "2026-09-23", DPPM: "2026-09-23", EPCR: "2026-09-23",
  AV: "2026-09-24", TFM2: "2026-09-24",
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

  console.log("\n── Carga ao fim da semana 37, pelo contador oficial ──")
  const inflada: string[] = []
  const previstas: string[] = []

  for (const [sigla, { antes, depois }] of Object.entries(CONTADOR_37)) {
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }

    // O contador nunca anda para trás: portal acima do `antes` era carga inflada.
    if (disc.cargaMinistrada > antes) inflada.push(`${sigla} +${disc.cargaMinistrada - antes}h`)

    const futura = ULTIMO_DIA[sigla] > hojeISO
    if (futura) previstas.push(sigla)

    const status = depois >= disc.cargaTotal ? "Concluída" : depois > 0 ? "Em andamento" : "Início"
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: depois, status } })

    const marca = status === "Concluída" ? "✔" : futura ? "»" : "•"
    const nota = futura ? `  (previsto — aula de ${ULTIMO_DIA[sigla].slice(8, 10)}/09)` : ""
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
  console.log(` ⚠ A sexta 25/09 é "À disp. do CA" — não entra em nenhuma disciplina.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
