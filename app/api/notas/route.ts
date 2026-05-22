import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const userId = session.user.id!
  const isAdmin = session.user.isAdmin

  const notas = isAdmin
    ? await prisma.nota.findMany({ include: { user: { select: { nomeGuerra: true, matricula: true } } }, orderBy: { data: "desc" } })
    : await prisma.nota.findMany({ where: { userId }, orderBy: { data: "desc" } })

  return NextResponse.json(notas)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const userId = session.user.id!

  const body = await req.json()
  const { disciplina, avaliacao, nota, data, observacao, ehAF, apto } = body

  if (!disciplina || !avaliacao || !data)
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 })

  const notaNum = apto ? 0 : Number(nota)
  if (!apto && (isNaN(notaNum) || notaNum < 0 || notaNum > 10))
    return NextResponse.json({ error: "Nota deve ser entre 0 e 10" }, { status: 400 })

  const registro = await prisma.nota.create({
    data: { userId, disciplina, avaliacao, nota: notaNum, peso: 1, ehAF: !!ehAF, apto: !!apto, data: new Date(data), observacao: observacao || null },
  })

  await prisma.historicoNota.create({
    data: {
      notaId: registro.id,
      alteradoPorId: userId,
      tipo: "criacao",
      disciplina,
      avaliacao,
      valorNovo: String(notaNum),
      observacao: observacao || null,
    },
  })

  return NextResponse.json(registro)
}
