import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 35

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 07/09","Ter 08/09","Qua 09/09","Qui 10/09","Sex 11/09","Sáb 12/09","Dom 13/09"]

// Fonte: QTS SEMANA 35 (07 a 13/09/2026), emitido em 07/09/2026 — tabela de cima
// da folha ("HORÁRIO DE AULA SEMANAL - TURMA 13"; a de baixo é a Turma 14).
// Segunda 07/09 sem aula (feriado da Independência).
// Siglas do QTS → banco: EASPE → EASE · "TFM - II" → TFM2.
// "À disp. do CA" = à disposição do Corpo de Alunos; não é disciplina e não conta carga.
const grade: Record<string, string[]> = {
  "Seg 07/09": ["","","","","","","","","","",""],
  "Ter 08/09": ["", "EPCR","EPCR", "EPCR","EPCR", "AP","AP",   "AP","AP",     "INTSISP","INTSISP"],
  "Qua 09/09": ["", "POE","POE",   "AM","AM",     "POE","POE", "AM","AM",     "À disp. CA","À disp. CA"],
  "Qui 10/09": ["", "TFM2","TFM2", "TFM2","TFM2", "EASE","EASE", "EASE","EASE", "",""],
  "Sex 11/09": ["", "EPCR","EPCR", "EPCR","EPCR", "TFM2","TFM2", "TFM2","TFM2", "",""],
  "Sáb 12/09": ["","","","","","","","","","",""],
  "Dom 13/09": ["","","","","","","","","","",""],
}

// Contador oficial da folha da semana 35: `antes` = primeiro X menos 1 (a carga real
// ao FIM da semana 34); `depois` = último X (a carga ao FIM da semana 35).
//
// O `antes` serve de auditoria — o contador do QTS nunca anda para trás, então
// disciplina em que o portal estivesse ACIMA do `antes` estava inflada. Na primeira
// passada (04/09/2026) as 7 estavam, resíduo dos carregadores antigos que somavam a
// grade da semana em vez de gravar o contador (ver CLAUDE.md).
//
// O `depois` é o que fica gravado. Lançado em 08/09/2026 a pedido, com a semana
// ainda em curso: segunda 07/09 foi feriado e terça 08/09 é hoje, então AP, INTSISP
// e os quatro primeiros tempos de EPCR já aconteceram; POE, AM, TFM2, EASE e o
// restante de EPCR são de quarta a sexta e entram como PREVISTOS. Se alguma dessas
// aula cair, o contador da próxima folha corrige — é para isso que ele serve.
const CONTADOR_35: Record<string, { antes: number; depois: number }> = {
  EPCR:    { antes:  8, depois: 16 },  // 9/20 … 16/20   (ter 4 + sex 4)
  AP:      { antes: 46, depois: 50 },  // 47/50 … 50/50  (ter 4) — encerra
  INTSISP: { antes: 26, depois: 28 },  // 27/30 … 28/30  (ter 2)
  POE:     { antes: 24, depois: 28 },  // 25/60 … 28/60  (qua 4)
  AM:      { antes: 52, depois: 56 },  // 53/60 … 56/60  (qua 4)
  TFM2:    { antes: 42, depois: 50 },  // TFM-II 43/60 … 50/60 (qui 4 + sex 4)
  EASE:    { antes: 24, depois: 28 },  // EASPE 25/30 … 28/30  (qui 4)
}

async function main() {
  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({
    where: { semana: SEMANA },
    update: { dados },
    create: { semana: SEMANA, dados },
  })
  console.log(`✓ QTS da semana ${SEMANA} salvo (${DIAS.length} dias).`)

  // Em que dia da semana 35 cada disciplina termina — só para o relatório dizer o
  // que já aconteceu e o que ainda é previsão na hora em que o script roda.
  const ULTIMO_DIA: Record<string, string> = {
    AP: "2026-09-08", INTSISP: "2026-09-08",
    POE: "2026-09-09", AM: "2026-09-09",
    EASE: "2026-09-10",
    EPCR: "2026-09-11", TFM2: "2026-09-11",
  }
  const hoje = new Date()
  const hojeISO = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`

  console.log("\n── Carga ao fim da semana 35, pelo contador oficial ──")
  const inflada: string[] = []
  const previstas: string[] = []

  for (const [sigla, { antes, depois }] of Object.entries(CONTADOR_35)) {
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }

    // Auditoria: o contador nunca anda para trás, então portal acima do `antes`
    // era carga inflada por soma da grade.
    if (disc.cargaMinistrada > antes) inflada.push(`${sigla} +${disc.cargaMinistrada - antes}h`)

    const futura = ULTIMO_DIA[sigla] > hojeISO
    if (futura) previstas.push(sigla)

    const status = depois >= disc.cargaTotal ? "Concluída" : depois > 0 ? "Em andamento" : "Início"
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: depois, status } })

    const marca = status === "Concluída" ? "✔" : futura ? "»" : "•"
    const nota = futura ? `  (previsto — aula de ${ULTIMO_DIA[sigla].slice(8, 10)}/09)` : ""
    console.log(`  ${marca} ${sigla.padEnd(8)} ${String(disc.cargaMinistrada).padStart(2)}h → ${depois}/${disc.cargaTotal}h  ${status}${nota}`)
  }

  const todas = await prisma.disciplina.findMany()
  const total = todas.reduce((s, d) => s + d.cargaTotal, 0)
  const dada = todas.reduce((s, d) => s + d.cargaMinistrada, 0)
  const encerradas = todas.filter(d => d.cargaMinistrada >= d.cargaTotal && d.cargaTotal > 0).length
  console.log(`\n Total do curso: ${dada}h de ${total}h (${Math.round(dada/total*100)}%) · ${encerradas}/${todas.length} encerradas`)
  if (inflada.length) console.log(` Estava inflado antes desta rodada: ${inflada.join(", ")}`)
  if (previstas.length) console.log(` ⚠ Lançado como PREVISTO (aula ainda não dada): ${previstas.join(", ")}`)
  console.log(` ⚠ PE, PJM, TPE, TCEM e GC entram na semana 34 mas não na 35 — sem contador
   nesta folha, ficam sem conferência até saírem num QTS.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
