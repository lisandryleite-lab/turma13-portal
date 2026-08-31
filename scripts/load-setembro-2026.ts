/**
 * Carrega as escalas de SETEMBRO/2026 e o QTS da semana corrente.
 *
 * Fontes (1ª CIA, 1º Ten Tenório — SEI):
 *   • MAPA DE EQUIPES DE PLANTÃO - ESCALA 7X1 · SETEMBRO/2026 (atualizada)
 *   • ESCALA DE PLANTÃO, AUXILIAR, ADJUNTO E SOBREAVISO - 7X1 · SETEMBRO/2026
 *   • ESCALA DE FUNÇÕES NAS FORMATURAS MATINAIS/GERAIS · SETEMBRO/2026
 *   • ESCALA 1ª COMPANHIA - FUNÇÕES NAS FORMATURAS GERAIS (guarda-bandeira)
 *   • Foto do QTS "SEMANA 33" (31/08 a 06/09/2026)
 *
 * Idempotente: pode rodar de novo sem duplicar.
 */
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import { MEMBROS_7X1, SEM_EQUIPE_PLANTAO } from "../lib/escalas"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

// ── 1. Grupo de plantão de cada aluno (User.grupoPlantao) ────────────────
// Agosto era 3X1 (ALPHA..DELTA); setembro voltou para a 7X1 (GOLF..NOVEMBER),
// então o campo que o dashboard mostra em "Seus Dados" está desatualizado.

// ── 2. Funções nas formaturas matinais ───────────────────────────────────
// Colunas do documento: MESTRE DE CERIMÔNIA | LEITOR DE BI | DISCURSO AO CFO |
// COMANDANTE DA 1ª CIA. Matrículas da 1ª CIA inteira, não só da Turma 13 — é a
// formatura da companhia, e o portal resolve o nome de quem estiver cadastrado.
// Sem entradas em 05,06,07,12,13,19,20,26,27 (fins de semana e 07/09).
const FUNCOES: Array<[string, number, number, number, number]> = [
  // [data, Mestre, Leitor, Discurso, Comandante]
  ["2026-09-01", 157, 38, 41, 48],
  ["2026-09-02", 128, 130, 141, 145],
  ["2026-09-03", 198, 202, 212, 20],
  ["2026-09-04", 203, 207, 217, 4],
  ["2026-09-08", 144, 147, 154, 170],
  ["2026-09-09", 56, 67, 60, 63],
  ["2026-09-10", 150, 153, 158, 161],
  ["2026-09-11", 26, 37, 58, 61],
  ["2026-09-14", 10, 18, 22, 55],
  ["2026-09-15", 111, 143, 159, 184],
  ["2026-09-16", 195, 200, 206, 9],
  ["2026-09-17", 59, 70, 78, 90],
  ["2026-09-18", 163, 173, 181, 190],
  ["2026-09-21", 214, 64, 84, 87],
  ["2026-09-22", 31, 76, 79, 92],
  ["2026-09-23", 191, 196, 197, 199],
  ["2026-09-24", 13, 21, 23, 24],
  ["2026-09-25", 102, 108, 116, 118],
  ["2026-09-28", 14, 40, 49, 50],
  ["2026-09-29", 73, 81, 88, 97],
  ["2026-09-30", 52, 71, 110, 115],
]

// ── 3. Guarda-bandeira do 1º Pelotão — 16/09 (quarta) ────────────────────
// Único dia do 1º Pelotão em setembro. Vai como Aviso porque
// FuncaoDestaqueDia tem @@unique([data, funcao]) e aqui são 8 "Guarda".
const GUARDA_DATA = "16/09/2026 (quarta-feira)"
const GUARDA: Array<[number, string, string]> = [
  [165, "KEVIN GOMES", "Pavilhão Nacional"],
  [114, "JOSIANE FARIAS", "Comandante da Guarda de Honra"],
  [71, "LEIMIG", "Bandeira de Pernambuco"],
  [76, "ARAÚJO JÚNIOR", "Bandeira da Confederação do Equador"],
  [94, "ANDRÉ CARDOSO", "Bandeira da APMP"],
  [57, "CLEYTON", "Porta-flâmula"],
  [23, "RODOLFO MOURA", "Guarda"],
  [37, "PABLO TORRES", "Guarda"],
  [41, "ALAN SILVA", "Guarda"],
  [45, "GABRIELE COSTA", "Guarda"],
  [60, "JOÃO NUNES", "Guarda"],
  [98, "JOSÉ MENEZES", "Guarda"],
  [105, "LUCAS EDUARDO", "Guarda"],
  [108, "LISANDRY", "Guarda"],
]

// ── 4. QTS da semana 31/08 a 06/09 ───────────────────────────────────────
// O documento oficial rotula esta semana como "SEMANA 33", mas a contagem do
// portal (DATA_INICIO = 12/01/2026) põe 31/08–06/09 na SEMANA 34 — a semana 33
// do portal é 24–30/08, que já está carregada. Gravado sob o número do PORTAL,
// senão o dashboard (que lê semanaAtual()) não acha a semana corrente.
const SEMANA_PORTAL = 34

const HORARIOS = [
  "07h00-07h50","08h00-08h50","08h50-09h40",
  "10h00-10h50","10h50-11h40",
  "13h40-14h30","14h30-15h20",
  "15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10",
]
const DIAS = ["Seg 31/08","Ter 01/09","Qua 02/09","Qui 03/09","Sex 04/09","Sáb 05/09","Dom 06/09"]

// Cada dia da foto tem DUAS subcolunas: a da ESQUERDA é a Turma 13, a da
// direita é a Turma 14 (as duas se revezam nas mesmas matérias).
// Siglas da foto → banco: INTSIP → INTSISP, EASPE → EASE.
// Quarta 10h-11h40 tinha POE RISCADO no documento (aula cancelada) → vazio.
//
// ATENÇÃO ao bloco da noite: nesta semana a última faixa é "18h20 às 19h10",
// ou seja UM tempo só (idx10). Não há aula às 17h30 — diferente da semana 33,
// cuja faixa era "17h30 às 19h10" (dois tempos, idx9 e idx10). Preencher os
// dois aqui inflava PE em 2h e AP em 1h.
const grade: Record<string, string[]> = {
  //              07h00  08h00     08h50       10h00   10h50    13h40  14h30   15h40 16h30   17h30 18h20
  "Seg 31/08": ["", "INTSISP","INTSISP", "POE","POE",   "EASE","EASE", "PE","PE",   "", "PE"],
  "Ter 01/09": ["", "PJM","PJM",         "PJM","PJM",   "AM","AM",     "AM","AM",   "", ""],
  "Qua 02/09": ["", "POE","POE",         "","",         "TCEM","TCEM", "GC","GC",   "", ""],
  "Qui 03/09": ["", "","",               "","",         "AP","AP",     "PE","PE",   "", "PE"],
  "Sex 04/09": ["", "EPCR","EPCR",       "TFM2","TFM2", "PE","PE",     "AP","AP",   "", "AP"],
  "Sáb 05/09": ["","","","","","","","","","",""],
  "Dom 06/09": ["","","","","","","","","","",""],
}

async function main() {
  // 1. grupoPlantao ------------------------------------------------------
  console.log("── 1. Grupo de plantão (3X1 → 7X1) ──")
  let mudou = 0
  for (const [grupo, membros] of Object.entries(MEMBROS_7X1)) {
    for (const { mat } of membros) {
      const u = await prisma.user.findUnique({ where: { matricula: mat }, select: { grupoPlantao: true } })
      if (!u) { console.log(`   ⚠ matrícula ${mat} não existe no banco`); continue }
      if (u.grupoPlantao !== grupo) {
        await prisma.user.update({ where: { matricula: mat }, data: { grupoPlantao: grupo } })
        console.log(`   ${String(mat).padStart(3)} ${String(u.grupoPlantao ?? "—").padEnd(8)} → ${grupo}`)
        mudou++
      }
    }
  }
  for (const mat of SEM_EQUIPE_PLANTAO) {
    const u = await prisma.user.findUnique({ where: { matricula: mat }, select: { grupoPlantao: true } })
    if (u?.grupoPlantao != null) {
      await prisma.user.update({ where: { matricula: mat }, data: { grupoPlantao: null } })
      console.log(`   ${String(mat).padStart(3)} ${u.grupoPlantao} → (sem equipe no mapa de setembro)`)
      mudou++
    }
  }
  console.log(`   ${mudou} alteração(ões)\n`)

  // 2. funções de destaque ----------------------------------------------
  console.log("── 2. Funções nas formaturas (setembro) ──")
  const PAPEIS = ["Mestre", "Leitor", "Discurso", "Comandante"] as const
  let criadas = 0, atualizadas = 0
  for (const [iso, ...mats] of FUNCOES) {
    const data = new Date(`${iso}T12:00:00.000Z`)
    for (let i = 0; i < PAPEIS.length; i++) {
      const funcao = PAPEIS[i]
      const matricula = mats[i]
      const existe = await prisma.funcaoDestaqueDia.findUnique({ where: { data_funcao: { data, funcao } } })
      await prisma.funcaoDestaqueDia.upsert({
        where: { data_funcao: { data, funcao } },
        update: { matricula },
        create: { data, funcao, matricula },
      })
      if (existe) atualizadas++; else criadas++
    }
  }
  console.log(`   ${criadas} criadas, ${atualizadas} atualizadas (${FUNCOES.length} datas × ${PAPEIS.length})\n`)

  // 3. guarda-bandeira ---------------------------------------------------
  console.log("── 3. Guarda-bandeira do 1º Pelotão ──")
  const destaques = GUARDA.filter(g => g[2] !== "Guarda")
  const guardas = GUARDA.filter(g => g[2] === "Guarda")
  const corpo = [
    `O 1º Pelotão (Turma 13) faz a guarda-bandeira da formatura geral em ${GUARDA_DATA}.`,
    "",
    ...destaques.map(([mat, nome, funcao]) => `• ${funcao}: ${mat} ${nome}`),
    "",
    `• Guarda: ${guardas.map(([mat, nome]) => `${mat} ${nome}`).join(", ")}`,
    "",
    "Fonte: ESCALA 1ª COMPANHIA — FUNÇÕES NAS FORMATURAS GERAIS, setembro/2026.",
  ].join("\n")

  const TITULO = "Guarda-bandeira — 16/09 (1º Pelotão)"
  const jaExiste = await prisma.aviso.findFirst({ where: { titulo: TITULO } })
  if (jaExiste) {
    await prisma.aviso.update({ where: { id: jaExiste.id }, data: { corpo, fixado: true, destaque: true } })
    console.log(`   aviso atualizado (${GUARDA.length} militares)\n`)
  } else {
    await prisma.aviso.create({ data: { titulo: TITULO, corpo, fixado: true, destaque: true } })
    console.log(`   aviso criado (${GUARDA.length} militares)\n`)
  }

  // 4. QTS ---------------------------------------------------------------
  console.log("── 4. QTS 31/08–06/09 ──")
  const siglas = new Set(Object.values(grade).flat().filter(Boolean))
  for (const s of siglas) {
    const d = await prisma.disciplina.findUnique({ where: { sigla: s } })
    if (!d) console.log(`   ⚠ sigla ${s} não existe em Disciplina`)
  }
  const dados = { dias: DIAS, horarios: HORARIOS, grade }
  await prisma.qTS.upsert({
    where: { semana: SEMANA_PORTAL },
    update: { dados },
    create: { semana: SEMANA_PORTAL, dados },
  })
  const tempos: Record<string, number> = {}
  for (const slots of Object.values(grade)) for (const s of slots) if (s) tempos[s] = (tempos[s] || 0) + 1
  console.log(`   QTS da semana ${SEMANA_PORTAL} salvo (rotulado "SEMANA 33" no documento oficial)`)
  console.log(`   Tempos: ${Object.entries(tempos).map(([k, v]) => `${k} ${v}h`).join(", ")}\n`)

  // 5. carga horária ------------------------------------------------------
  await atualizarCarga(tempos)
}

// ─────────────────────────────────────────────────────────────────────────
//  Carga horária desta semana — ESTIMATIVA, não o contador oficial
//
//  A foto do QTS não traz o contador `X/Y` por aula, que é a fonte da verdade
//  desde a semana 32. Os valores abaixo saíram de somar os tempos da grade à
//  carga que o portal já tinha, a pedido da turma (31/08/2026).
//
//  Três disciplinas passariam do total ao somar e ficaram TRAVADAS no teto:
//    INTSISP 30+2 → 30/30 · TCEM 40+2 → 40/40 · GC 30+2 → 30/30
//  Isso significa que há divergência real entre o portal e a grade — ou o
//  portal está adiantado nelas, ou aquelas aulas não foram dadas. Só o PDF com
//  o contador resolve. Quando ele chegar, regravar de forma ABSOLUTA.
//
//  Gravado como valor ABSOLUTO (`depois`), com `antes` como trava: se a carga
//  no banco não for mais a esperada, o script avisa e não mexe — assim rodar de
//  novo não soma duas vezes.
// ─────────────────────────────────────────────────────────────────────────
const CARGA: Record<string, { antes: number; depois: number }> = {
  INTSISP: { antes: 30, depois: 30 }, // travado no total (somaria 32/30)
  POE:     { antes: 22, depois: 26 },
  EASE:    { antes: 22, depois: 24 },
  PE:      { antes: 8,  depois: 16 },
  PJM:     { antes: 6,  depois: 10 },
  AM:      { antes: 48, depois: 52 },
  TCEM:    { antes: 40, depois: 40 }, // travado no total (somaria 42/40)
  GC:      { antes: 30, depois: 30 }, // travado no total (somaria 32/30)
  AP:      { antes: 40, depois: 45 },
  EPCR:    { antes: 6,  depois: 8 },
  TFM2:    { antes: 44, depois: 46 },
}

async function atualizarCarga(tempos: Record<string, number>) {
  console.log("── 5. Carga horária (estimada — sem o contador oficial) ──")
  let aplicadas = 0, jaOk = 0, puladas = 0

  for (const [sigla, { antes, depois }] of Object.entries(CARGA)) {
    const d = await prisma.disciplina.findUnique({ where: { sigla } })
    if (!d) { console.log(`   ⚠ ${sigla}: disciplina não existe — pulando`); puladas++; continue }

    if (d.cargaMinistrada === depois) { jaOk++; continue }
    if (d.cargaMinistrada !== antes) {
      console.log(`   ⚠ ${sigla}: banco está em ${d.cargaMinistrada}h, esperava ${antes}h — NÃO alterado`)
      puladas++
      continue
    }

    const status = depois >= d.cargaTotal ? "Concluída" : depois > 0 ? "Em andamento" : "Início"
    await prisma.disciplina.update({ where: { sigla }, data: { cargaMinistrada: depois, status } })
    const travado = antes + (tempos[sigla] ?? 0) > d.cargaTotal ? "  ← travado no total" : ""
    console.log(`   ${sigla.padEnd(8)} ${String(antes).padStart(2)}h +${tempos[sigla] ?? 0}h ⇒ ${String(depois).padStart(2)}/${d.cargaTotal}h ${status}${travado}`)
    aplicadas++
  }

  console.log(`   ${aplicadas} aplicada(s), ${jaOk} já corretas, ${puladas} pulada(s)`)

  const todas = await prisma.disciplina.findMany()
  const total = todas.reduce((s, d) => s + d.cargaTotal, 0)
  const dada = todas.reduce((s, d) => s + d.cargaMinistrada, 0)
  console.log(`\n   Progresso do curso: ${dada}h de ${total}h (${Math.round(dada / total * 100)}%)`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
