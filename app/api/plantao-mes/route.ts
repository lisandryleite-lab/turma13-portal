import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { partesEmRecife } from "@/lib/utils"

// GET /api/plantao-mes?ano=2026&mes=5
export async function GET(req: NextRequest) {
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
}

// POST /api/plantao-mes  { dias: [{data, grupoPlantao, adjuntoMat?}] }
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin)
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { dias } = await req.json()
  if (!Array.isArray(dias)) return NextResponse.json({ error: "dias[] obrigatório" }, { status: 400 })

  for (const d of dias) {
    const data = new Date(d.data)
    data.setUTCHours(12, 0, 0, 0)
    await prisma.plantaoDia.upsert({
      where: { data },
      update: { grupoPlantao: d.grupoPlantao, adjuntoMat: d.adjuntoMat ?? null },
      create: { data, grupoPlantao: d.grupoPlantao, adjuntoMat: d.adjuntoMat ?? null },
    })
  }
  return NextResponse.json({ ok: true })
}
