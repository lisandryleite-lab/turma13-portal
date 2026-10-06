/**
 * Carrega as escalas de OUTUBRO/2026 no banco.
 *
 * Os dados ficam transcritos em lib/escalas-cia.ts (fonte única, lida pelas
 * páginas de escala); este script só espelha no banco o que o dashboard da
 * Turma 13 lê de FuncaoDestaqueDia (funções nas formaturas, auxiliar e
 * adjunto do oficial de dia) e confere o grupo de plantão dos alunos.
 *
 * Fontes (Corpo de Alunos / 1ª CIA — SEI):
 *   • MAPA DE EQUIPES DE PLANTÃO - ESCALA 7X1 · OUTUBRO/2026 (atualizada)
 *   • ESCALA DE PLANTÃO, AUXILIAR, ADJUNTO E SOBREAVISO · OUTUBRO/2026 - AJUSTADA
 *   • ESCALA DE FUNÇÕES NAS FORMATURAS MATINAIS/GERAIS · OUTUBRO/2026 (atualizada)
 *
 * Idempotente: pode rodar de novo sem duplicar.
 */
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import { MESES_ESCALA, grupoDaMatricula } from "../lib/escalas-cia"
import { MATRICULAS_ORDEM } from "../lib/escalas"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const MES = MESES_ESCALA.find(m => m.chave === "2026-10")!

async function upsertFuncao(iso: string, funcao: string, matricula: number) {
  const data = new Date(`${iso}T12:00:00.000Z`)
  const antes = await prisma.funcaoDestaqueDia.findUnique({ where: { data_funcao: { data, funcao } } })
  await prisma.funcaoDestaqueDia.upsert({
    where: { data_funcao: { data, funcao } },
    update: { matricula },
    create: { data, funcao, matricula },
  })
  return antes ? (antes.matricula === matricula ? "igual" : "atualizada") : "criada"
}

async function main() {
  // 1. grupo de plantão da Turma 13 (mapa de outubro) ----------------------
  console.log("── 1. Grupo de plantão (mapa de outubro) ──")
  let mudou = 0
  for (const mat of MATRICULAS_ORDEM) {
    const grupo = grupoDaMatricula(mat, MES)
    const u = await prisma.user.findUnique({ where: { matricula: mat }, select: { grupoPlantao: true } })
    if (!u) { console.log(`   ⚠ matrícula ${mat} não existe no banco`); continue }
    if (u.grupoPlantao !== grupo) {
      await prisma.user.update({ where: { matricula: mat }, data: { grupoPlantao: grupo } })
      console.log(`   ${String(mat).padStart(3)} ${String(u.grupoPlantao ?? "—").padEnd(8)} → ${grupo ?? "(sem equipe)"}`)
      mudou++
    }
  }
  console.log(`   ${mudou} alteração(ões)\n`)

  // 2. funções nas formaturas ---------------------------------------------
  console.log("── 2. Funções nas formaturas ──")
  const cont: Record<string, number> = { criada: 0, atualizada: 0, igual: 0 }
  for (const f of MES.funcoes) {
    for (const [funcao, mat] of [["Mestre", f.mestreCerimonia], ["Leitor", f.leitorBI], ["Discurso", f.discurso], ["Comandante", f.comandante]] as const) {
      cont[await upsertFuncao(f.data, funcao, mat)]++
    }
  }
  console.log(`   ${MES.funcoes.length} dias · ${cont.criada} criadas, ${cont.atualizada} atualizadas, ${cont.igual} iguais\n`)

  // 3. auxiliar e adjunto do oficial de dia -------------------------------
  console.log("── 3. Auxiliar e adjunto do oficial de dia ──")
  const cont2: Record<string, number> = { criada: 0, atualizada: 0, igual: 0 }
  for (const p of MES.plantao) {
    if (p.auxiliar) cont2[await upsertFuncao(p.data, "AuxiliarOD", p.auxiliar)]++
    if (p.adjunto) cont2[await upsertFuncao(p.data, "AdjuntoOD", p.adjunto)]++
  }
  console.log(`   ${cont2.criada} criadas, ${cont2.atualizada} atualizadas, ${cont2.igual} iguais`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
