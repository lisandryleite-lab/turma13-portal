import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Ranking CFO — notas AUTODECLARADAS por disciplina/avaliação. Cada aluno só as suas.
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const notas = await prisma.notaCFO.findMany({
    where: { userId: session.user.id! },
    orderBy: [{ disciplina: "asc" }, { avaliacao: "asc" }],
  })
  return NextResponse.json(notas)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const userId = session.user.id!

  const body = await req.json()
  const disciplina = String(body.disciplina || "").trim().toUpperCase()
  const avaliacao = String(body.avaliacao || "").trim().toUpperCase() || "P1"
  const valor = Number(body.valor)
  const ehAF = !!body.ehAF
  const apto = !!body.apto

  if (!disciplina) return NextResponse.json({ error: "Disciplina é obrigatória" }, { status: 400 })
  if (isNaN(valor) || valor < 0 || valor > 10)
    return NextResponse.json({ error: "Nota deve ser entre 0 e 10" }, { status: 400 })

  const existente = await prisma.notaCFO.findUnique({
    where: { userId_disciplina_avaliacao: { userId, disciplina, avaliacao } },
  })

  const registro = await prisma.notaCFO.upsert({
    where: { userId_disciplina_avaliacao: { userId, disciplina, avaliacao } },
    update: { valor, ehAF, apto },
    create: { userId, disciplina, avaliacao, valor, ehAF, apto, autodeclarada: true },
  })

  await prisma.historicoNotaCFO.create({
    data: {
      notaCfoId: registro.id,
      alteradoPorId: userId,
      tipo: existente ? "edicao" : "criacao",
      valorAnterior: existente ? String(existente.valor) : null,
      valorNovo: String(valor),
      disciplina,
      avaliacao,
    },
  })

  return NextResponse.json(registro)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const userId = session.user.id!
  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id ausente" }, { status: 400 })

  const nota = await prisma.notaCFO.findUnique({ where: { id } })
  if (!nota || nota.userId !== userId)
    return NextResponse.json({ error: "Não encontrada" }, { status: 404 })

  await prisma.notaCFO.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
