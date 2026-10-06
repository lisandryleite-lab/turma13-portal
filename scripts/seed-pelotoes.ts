/**
 * Preenche User.pelotao (1º a 7º pelotão da 1ª CIA) para o Controle de Tropa.
 *
 * Fontes, por ordem de prioridade:
 *   1. Folhas de alterações dos pelotões 1 a 6 (public/modelos/folha-alteracoes-N-pelotao.docx)
 *   2. Rótulo "/ NPEL" das escalas de outubro/2026 (plantão, funções de destaque)
 *   3. Pelotão da escala de guarda-bandeira de outubro/2026
 * Membros da Turma 13 (User.turma13) são sempre do 1º Pelotão.
 *
 * Só preenche quem está sem pelotão — não sobrescreve ajuste feito pelo admin
 * no Controle de Tropa. Use --forcar para regravar todos.
 */
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import { MESES_ESCALA } from "../lib/escalas-cia"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

// 1. Folhas de alterações (efetivo de cada pelotão)
const FOLHAS: Record<number, number[]> = {
  1: [7, 13, 19, 23, 26, 37, 41, 45, 55, 57, 60, 65, 71, 76, 81, 94, 98, 105, 106, 108, 114, 116, 131, 143, 144, 153, 165, 167, 174, 186, 191, 212],
  2: [8, 14, 20, 25, 28, 30, 35, 40, 42, 56, 62, 72, 73, 74, 75, 83, 92, 101, 109, 115, 117, 119, 130, 132, 145, 155, 168, 171, 175],
  3: [9, 15, 21, 27, 31, 44, 66, 70, 77, 85, 86, 90, 91, 102, 103, 107, 113, 118, 122, 126, 133, 137, 146, 149, 156, 170, 182, 185, 192],
  4: [4, 10, 16, 22, 32, 36, 43, 46, 49, 58, 61, 63, 78, 84, 88, 93, 104, 112, 120, 121, 123, 129, 134, 140, 147, 154, 159, 160, 163, 177, 179, 193],
  5: [5, 11, 17, 29, 33, 38, 51, 59, 64, 68, 80, 82, 96, 97, 110, 124, 127, 136, 138, 141, 150, 157, 161, 164, 169, 173, 178, 184, 187, 188, 190],
  6: [6, 12, 18, 24, 34, 39, 50, 52, 53, 67, 69, 79, 89, 95, 100, 111, 128, 135, 139, 142, 151, 152, 158, 162, 166, 176, 180, 181, 183, 189, 195, 196],
}

// 2. Rótulo "/ NPEL" das escalas de outubro que não constam das folhas
const ROTULO_ESCALA: Record<number, number> = {
  198: 3, 204: 3, 203: 7, 208: 7, 214: 7, 216: 7, 220: 7, 221: 7, 222: 7,
}

const forcar = process.argv.includes("--forcar")

async function main() {
  const pelotaoDe = new Map<number, number>()
  // 3. guarda-bandeira (menor prioridade — preenche primeiro, os demais sobrescrevem)
  for (const mes of MESES_ESCALA) for (const g of mes.guarda) for (const m of g.membros) pelotaoDe.set(m.mat, g.pelotao)
  pelotaoDe.set(210, 7) // ANDRÉ JÚNIOR consta como 7º na guarda do 6º Pel (02/10)
  for (const [mat, p] of Object.entries(ROTULO_ESCALA)) pelotaoDe.set(Number(mat), p)
  for (const [p, mats] of Object.entries(FOLHAS)) for (const mat of mats) pelotaoDe.set(mat, Number(p))

  const alunos = await prisma.user.findMany({ where: { matricula: { gt: 0 } }, select: { matricula: true, nomeGuerra: true, turma13: true, pelotao: true } })
  let gravados = 0
  const sem: string[] = []
  for (const a of alunos) {
    const p = a.turma13 ? 1 : pelotaoDe.get(a.matricula) ?? null
    if (p == null) { if (a.pelotao == null) sem.push(`${a.matricula} ${a.nomeGuerra}`); continue }
    if (a.pelotao === p || (a.pelotao != null && !forcar)) continue
    await prisma.user.update({ where: { matricula: a.matricula }, data: { pelotao: p } })
    gravados++
  }
  const porPel = await prisma.user.groupBy({ by: ["pelotao"], where: { matricula: { gt: 0 } }, _count: { _all: true }, orderBy: { pelotao: "asc" } })
  console.log(`✓ ${gravados} aluno(s) com pelotão gravado`)
  console.log(porPel.map(g => `  ${g.pelotao ?? "sem"}º: ${g._count._all}`).join("\n"))
  if (sem.length) console.log(`⚠ Sem pelotão identificado (ajustar no Controle de Tropa): ${sem.join(", ")}`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
