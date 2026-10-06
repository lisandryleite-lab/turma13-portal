import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 39

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 05/10","Ter 06/10","Qua 07/10","Qui 08/10","Sex 09/10","Sáb 10/10","Dom 11/10"]

// Transcrito do PDF "QTS SEMANA 39 (TURMA 13) PARA OS ALUNOS" — folha só da
// Turma 13, semana de 05/10 a 11/10/2026. A planilha diz "Semana 39" e
// semanaAtual() também dá 39.
// As 11 colunas da folha batem uma a uma com HORARIOS, como na semana 37.
// Siglas da folha → banco: TFM - II → TFM2. As demais são iguais:
//   AV · ABAA Ações Básicas de Apoio Aéreo (estreia) · POE · TCC · TP · PE · PJM ·
//   QAGV · AE.
// Provas marcadas na folha (qua 07/10): TFM-II prova 2/2 · PE prova única ·
// POE prova 1/2.
// ATENÇÃO: a folha põe QAGV (manhã) e AE (tarde) no DOMINGO 11/10, com o sábado
// vazio. Transcrito como está — confirmado na imagem renderizada do PDF.
const grade: Record<string, string[]> = {
  "Seg 05/10": ["", "AV","AV",     "AV","AV",     "TCC","TCC",   "TCC","TCC",   "",""],
  "Ter 06/10": ["", "ABAA","ABAA", "ABAA","ABAA", "TP","TP",     "TP","TP",     "",""],
  "Qua 07/10": ["", "TFM2","TFM2", "POE","POE",   "PE","PE",     "POE","POE",   "",""],
  "Qui 08/10": ["", "TCC","TCC",   "TCC","TCC",   "ABAA","ABAA", "ABAA","ABAA", "",""],
  "Sex 09/10": ["", "TP","TP",     "TP","TP",     "PJM","PJM",   "PJM","PJM",   "PJM","PJM"],
  "Sáb 10/10": ["","","","","","","","","","",""],
  "Dom 11/10": ["", "QAGV","QAGV", "QAGV","QAGV", "AE","AE",     "AE","AE",     "",""],
}

// Contador oficial da folha ("TP 21/60"), fonte de verdade da carga — gravado de
// forma ABSOLUTA, então rodar de novo não soma nada. `antes` é a hora anterior à
// primeira aula da semana. A semana 38 (sem contador, carga somada pela grade)
// deixou o portal com PJM e TFM2 +2h, PE −4h e AE −2h; isto corrige.
const CONTADOR_39: Record<string, { antes: number; depois: number }> = {
  AV:   { antes: 20, depois: 24 },  // 21/50 … 24/50  (seg 4)
  TCC:  { antes:  4, depois: 12 },  //  5/20 … 12/20  (seg 4 + qui 4)
  ABAA: { antes:  0, depois:  8 },  //  1/20 …  8/20  (ter 4 + qui 4) — estreia
  TP:   { antes: 16, depois: 24 },  // 17/60 … 24/60  (ter 4 + sex 4)
  TFM2: { antes: 58, depois: 60 },  // 59/60 … 60/60  (qua 2) — ENCERRA
  POE:  { antes: 30, depois: 34 },  // 31/60 … 34/60  (qua 4)
  PE:   { antes: 18, depois: 20 },  // 19/20 … 20/20  (qua 2) — ENCERRA
  PJM:  { antes: 22, depois: 28 },  // 23/40 … 28/40  (sex 6)
  QAGV: { antes:  6, depois: 10 },  //  7/20 … 10/20  (dom 4)
  AE:   { antes: 16, depois: 20 },  // 17/50 … 20/50  (dom 4)
}

const ULTIMO_DIA: Record<string, string> = {
  AV: "2026-10-05",
  TFM2: "2026-10-07", POE: "2026-10-07", PE: "2026-10-07",
  TCC: "2026-10-08", ABAA: "2026-10-08",
  TP: "2026-10-09", PJM: "2026-10-09",
  QAGV: "2026-10-11", AE: "2026-10-11",
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

  console.log("\n── Carga ao fim da semana 39, pelo contador oficial ──")
  const inflada: string[] = []
  const previstas: string[] = []

  for (const [sigla, { antes, depois }] of Object.entries(CONTADOR_39)) {
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
  console.log(` ⚠ QAGV e AE estão no DOMINGO 11/10 na folha — conferir com a coordenação.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
