import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = 38

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]

const DIAS = ["Seg 28/09","Ter 29/09","Qua 30/09","Qui 01/10","Sex 02/10","Sáb 03/10","Dom 04/10"]

// Transcrito do QTS mestre — Turma 13, semana de 28/09 a 04/10/2026.
// A folha vem no formato de DUAS SUB-COLUNAS POR DIA, o mesmo das semanas
// 29, 30 e 36: a da ESQUERDA é a Turma 13 e a da direita, a Turma 14
// (confirmado pelo Cmt antes desta carga). Só a da esquerda entra aqui.
// Cada faixa de horário da folha cobre dois tempos de 50 min, então a
// disciplina da faixa é repetida nos dois índices de HORARIOS:
//   07h00 às 08h00 → idx0 (vago a semana toda) · 08h00 às 09h40 → idx1,2 ·
//   10h00 às 11h40 → idx3,4 · 13h40 às 15h20 → idx5,6 ·
//   15h30 às 17h20 → idx7,8 · 18h20 às 19h10 → idx10 (tempo único).
// idx9 (17h30–18h20) não aparece na folha — fica vago, como nas semanas anteriores.
// Siglas da folha → banco: DPPPM → DPPM · TFM-II → TFM2. As demais são iguais:
//   EPCR · PJM · PE Planejamento Estratégico · TP Tiro Policial ·
//   QAGV Qualidade do Atendimento aos Grupos Vulneráveis · TPE Teoria e Prática
//   do Ensino · AE Abordagem a Edificações · TCC Trabalho de Conclusão de Curso.
// O TCC riscado na qua. 30/09 está na sub-coluna da direita (Turma 14) e,
// além de cancelado, não entraria na contagem da Turma 13.
// Sáb 03/10 e Dom 04/10 sem aula.
const grade: Record<string, string[]> = {
  "Seg 28/09": ["", "EPCR","EPCR", "PJM","PJM",   "DPPM","DPPM", "PE","PE",     "",""],
  "Ter 29/09": ["", "TP","TP",     "TP","TP",     "QAGV","QAGV", "QAGV","QAGV", "","QAGV"],
  "Qua 30/09": ["", "TPE","TPE",   "TPE","TPE",   "PJM","PJM",   "EPCR","EPCR", "",""],
  "Qui 01/10": ["", "AE","AE",     "TFM2","TFM2", "PE","PE",     "AE","AE",     "","AE"],
  "Sex 02/10": ["", "TCC","TCC",   "TCC","TCC",   "TP","TP",     "TP","TP",     "",""],
  "Sáb 03/10": ["","","","","","","","","","",""],
  "Dom 04/10": ["","","","","","","","","","",""],
}

async function main() {
  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({
    where: { semana: SEMANA },
    update: { dados },
    create: { semana: SEMANA, dados },
  })
  console.log(`✓ QTS da semana ${SEMANA} salvo (${DIAS.length} dias).`)

  // Contagem de horas por disciplina (1 slot = 1 hora), igual ao editor.
  const horas: Record<string, number> = {}
  for (const slots of Object.values(grade)) {
    for (const s of slots) if (s) horas[s] = (horas[s] || 0) + 1
  }

  // Esta folha NÃO traz o contador oficial ("TP 1/60"), que é o que a semana 35
  // e a 37 usaram como fonte de verdade. Sem ele, só resta somar os slots da
  // grade à carga atual — método que já inflou o portal no passado. Por isso a
  // soma é capada no total da disciplina, e o relatório abaixo mostra o antes e
  // o depois de cada uma, para conferência contra a próxima folha com contador.
  console.log("\n── Carga somada pela grade (sem contador nesta folha) ──")
  const capadas: string[] = []
  for (const [sigla, h] of Object.entries(horas)) {
    const disc = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!disc) { console.log(`  ⚠ disciplina ${sigla} não encontrada — pulando`); continue }
    const bruta = disc.cargaMinistrada + h
    const nova = Math.min(disc.cargaTotal, bruta)
    if (bruta > disc.cargaTotal) capadas.push(`${sigla} (${bruta} → ${nova})`)
    const status = nova >= disc.cargaTotal ? "Concluída" : nova > 0 ? "Em andamento" : disc.status
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: nova, status } })
    const marca = status === "Concluída" ? "✔" : "•"
    console.log(`  ${marca} ${sigla.padEnd(6)} ${String(disc.cargaMinistrada).padStart(2)}h +${h} → ${nova}/${disc.cargaTotal}h  ${status}`)
  }

  const todas = await prisma.disciplina.findMany()
  const total = todas.reduce((s, d) => s + d.cargaTotal, 0)
  const dada = todas.reduce((s, d) => s + d.cargaMinistrada, 0)
  const encerradas = todas.filter(d => d.cargaMinistrada >= d.cargaTotal && d.cargaTotal > 0).length
  console.log(`\n Total do curso: ${dada}h de ${total}h (${Math.round(dada / total * 100)}%) · ${encerradas}/${todas.length} encerradas`)
  if (capadas.length) {
    console.log(` ⚠ Capadas no total da disciplina: ${capadas.join(", ")}`)
    console.log(`   A folha previa mais horas do que restava — confira no próximo QTS com contador.`)
  }
  console.log(` ⚠ Sem contador nesta folha: a carga acima é SOMA da grade, não leitura oficial.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
