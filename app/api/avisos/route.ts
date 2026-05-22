import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const avisos = await prisma.aviso.findMany({ orderBy: [{ fixado: "desc" }, { createdAt: "desc" }] })
  return NextResponse.json(avisos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { titulo, corpo, fixado, destaque } = await req.json()
  const aviso = await prisma.aviso.create({ data: { titulo, corpo, fixado: !!fixado, destaque: !!destaque } })
  return NextResponse.json(aviso)
}
