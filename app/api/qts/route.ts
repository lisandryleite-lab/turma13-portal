import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const semana = Number(searchParams.get("semana") || 0)
  const qts = semana
    ? await prisma.qTS.findUnique({ where: { semana } })
    : await prisma.qTS.findFirst({ orderBy: { semana: "desc" } })
  return NextResponse.json(qts)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { semana, dados } = await req.json()
  const qts = await prisma.qTS.upsert({
    where: { semana: Number(semana) },
    update: { dados },
    create: { semana: Number(semana), dados },
  })
  return NextResponse.json(qts)
}
