import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Ranking CFO — notas AUTODECLARADAS. Cada aluno só vê e edita as PRÓPRIAS.
// Admin NÃO edita notas de aluno aqui (são simulação do próprio aluno).

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const notas = await prisma.notaCFO.findMany({
    where: { userId: session.user.id! },
    orderBy: [{ materia: "asc" }, { modulo: "asc" }],
  })
  return NextResponse.json(notas)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const userId = session.user.id!

  const body = await req.json()
  const materia = String(body.materia || "").trim()
  const modulo = body.modulo ? String(body.modulo).trim() : ""
  const valor = Number(body.valor)

  if (!materia) return NextResponse.json({ error: "Matéria é obrigatória" }, { status: 400 })
  if (isNaN(valor) || valor < 0 || valor > 10)
    return NextResponse.json({ error: "Nota deve ser entre 0 e 10" }, { status: 400 })

  // Já existe nota dessa matéria/módulo para o aluno? (edição) ou criação?
  const existente = await prisma.notaCFO.findUnique({
    where: { userId_materia_modulo: { userId, materia, modulo } },
  })

  const registro = await prisma.notaCFO.upsert({
    where: { userId_materia_modulo: { userId, materia, modulo } },
    update: { valor },
    create: { userId, materia, modulo, valor, autodeclarada: true },
  })

  await prisma.historicoNotaCFO.create({
    data: {
      notaCfoId: registro.id,
      alteradoPorId: userId,
      tipo: existente ? "edicao" : "criacao",
      valorAnterior: existente ? String(existente.valor) : null,
      valorNovo: String(valor),
      materia,
      modulo,
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

  // Só pode excluir a própria nota
  const nota = await prisma.notaCFO.findUnique({ where: { id } })
  if (!nota || nota.userId !== userId)
    return NextResponse.json({ error: "Não encontrada" }, { status: 404 })

  await prisma.notaCFO.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
