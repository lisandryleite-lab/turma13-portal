import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { partesEmRecife } from "@/lib/utils"
import { rotaApi, lerCorpo, proibido, z, zData, zMatricula } from "@/lib/api"

// GET /api/plantao-mes?ano=2026&mes=5
export const GET = rotaApi(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  // Default = mês corrente em Recife; no servidor (UTC) viraria às 21h.
  const agora = partesEmRecife()
  const ano = Number(searchParams.get("ano") || agora.ano)
  const mes = Number(searchParams.get("mes") || agora.mes)

  const inicio = new Date(ano, mes - 1, 1)
  const fim    = new Date(ano, mes, 0, 23, 59, 59)

  const dias = await prisma.plantaoDia.findMany({
    where: { data: { gte: inicio, lte: fim } },
    orderBy: { data: "asc" },
  })
  return NextResponse.json(dias)
})

// POST /api/plantao-mes  { dias: [{data, grupoPlantao, adjuntoMat?}] }
const SalvarPlantoes = z.object({
  dias: z.array(z.object({
    data: zData,
    grupoPlantao: z.string().trim().min(1, "obrigatório"),
    adjuntoMat: zMatricula.nullish(),
  })),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const { dias } = await lerCorpo(req, SalvarPlantoes)

  // Uma transação em vez de N upserts em série — o mês inteiro eram ~30
  // roundtrips até o banco, um a um.
  await prisma.$transaction(dias.map(d => {
    const data = new Date(d.data)
    data.setUTCHours(12, 0, 0, 0)
    return prisma.plantaoDia.upsert({
      where: { data },
      update: { grupoPlantao: d.grupoPlantao, adjuntoMat: d.adjuntoMat ?? null },
      create: { data, grupoPlantao: d.grupoPlantao, adjuntoMat: d.adjuntoMat ?? null },
    })
  }))

  return NextResponse.json({ ok: true })
})
