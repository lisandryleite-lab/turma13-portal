import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { partesEmRecife } from "@/lib/utils"
import { rotaApi, lerCorpo, proibido, z, zId, zData, zMatricula } from "@/lib/api"

// GET /api/funcoes-destaque?ano=2026&mes=5
export const GET = rotaApi(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  // Default = mês corrente em Recife; no servidor (UTC) viraria às 21h.
  const agora = partesEmRecife()
  const ano = Number(searchParams.get("ano") || agora.ano)
  const mes = Number(searchParams.get("mes") || agora.mes)

  const inicio = new Date(ano, mes - 1, 1)
  const fim    = new Date(ano, mes, 0, 23, 59, 59)

  const funcoes = await prisma.funcaoDestaqueDia.findMany({
    where: { data: { gte: inicio, lte: fim } },
    orderBy: [{ data: "asc" }, { funcao: "asc" }],
  })
  return NextResponse.json(funcoes)
})

// POST /api/funcoes-destaque  { funcoes: [{data, funcao, matricula}] }
const SalvarFuncoes = z.object({
  funcoes: z.array(z.object({
    data: zData,
    funcao: z.string().trim().min(1, "obrigatório"),
    matricula: zMatricula,
  })),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const { funcoes } = await lerCorpo(req, SalvarFuncoes)

  // Uma transação em vez de N upserts em série: com o banco em outra máquina,
  // cada upsert do laço era um roundtrip próprio.
  await prisma.$transaction(funcoes.map(f => {
    const data = new Date(f.data)
    data.setUTCHours(12, 0, 0, 0)
    return prisma.funcaoDestaqueDia.upsert({
      where: { data_funcao: { data, funcao: f.funcao } },
      update: { matricula: f.matricula },
      create: { data, funcao: f.funcao, matricula: f.matricula },
    })
  }))

  return NextResponse.json({ ok: true })
})

// DELETE /api/funcoes-destaque  { id }
export const DELETE = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const { id } = await lerCorpo(req, z.object({ id: zId }))
  await prisma.funcaoDestaqueDia.delete({ where: { id } })
  return NextResponse.json({ ok: true })
})
