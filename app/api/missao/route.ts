import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const semana = Number(searchParams.get("semana") || 0)
  const missao = semana
    ? await prisma.missao.findUnique({ where: { semana } })
    : await prisma.missao.findFirst({ orderBy: { semana: "desc" } })
  return NextResponse.json(missao)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { semana, titulo, corpo } = await req.json()
  const missao = await prisma.missao.upsert({
    where: { semana: Number(semana) },
    update: { titulo, corpo },
    create: { semana: Number(semana), titulo, corpo },
  })
  return NextResponse.json(missao)
}
