import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.isAdmin) return null
  return session
}

export async function GET() {
  const s = await requireAdmin()
  if (!s) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  const alunos = await prisma.user.findMany({
    orderBy: { matricula: "asc" },
    select: {
      id: true, matricula: true, nomeGuerra: true, nomeCompleto: true,
      email: true, isAdmin: true, aniversario: true, canga: true,
      grupoPlantao: true, grupoFaxina: true,
    },
  })
  return NextResponse.json(alunos)
}

export async function POST(req: NextRequest) {
  const s = await requireAdmin()
  if (!s) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const body = await req.json()
  const { matricula, nomeGuerra, nomeCompleto, email, password, aniversario, canga, grupoPlantao, grupoFaxina } = body

  if (!matricula || !nomeGuerra || !nomeCompleto || !email || !password)
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 })

  const hash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { matricula: Number(matricula), nomeGuerra, nomeCompleto, email, password: hash, aniversario, canga, grupoPlantao, grupoFaxina },
  })
  return NextResponse.json({ id: user.id })
}
