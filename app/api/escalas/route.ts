import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const semana = Number(searchParams.get("semana") || 0)

  const [servico, faxinas, plantoes] = await Promise.all([
    prisma.escalaServico.findUnique({ where: { semana } }),
    prisma.escalaFaxina.findMany({ where: { semana } }),
    prisma.escalaPlantao.findMany({ where: { semana } }),
  ])
  return NextResponse.json({ servico, faxinas, plantoes })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const body = await req.json()
  const { tipo, semana, ...data } = body

  if (tipo === "servico") {
    await prisma.escalaServico.upsert({
      where: { semana: Number(semana) },
      update: data,
      create: { semana: Number(semana), ...data },
    })
  } else if (tipo === "faxina") {
    await prisma.escalaFaxina.create({ data: { semana: Number(semana), ...data } })
  } else if (tipo === "plantao") {
    await prisma.escalaPlantao.create({ data: { semana: Number(semana), ...data } })
  }

  return NextResponse.json({ ok: true })
}
