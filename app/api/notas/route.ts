import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const userId = session.user.id!
  const isAdmin = session.user.isAdmin

  // Admin pode filtrar por ?userId=xxx
  const filterUserId = isAdmin ? (req.nextUrl.searchParams.get("userId") ?? undefined) : undefined

  const notas = await prisma.nota.findMany({
    where: filterUserId ? { userId: filterUserId } : isAdmin ? undefined : { userId },
    include: { user: { select: { nomeGuerra: true, matricula: true } } },
    orderBy: { data: "desc" },
  })

  return NextResponse.json(notas)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const sessionUserId = session.user.id!
  const isAdmin = session.user.isAdmin

  const body = await req.json()
  const { disciplina, avaliacao, nota, data, observacao, ehAF, apto, targetUserId } = body

  // Admin pode lançar nota para outro aluno
  const userId = (isAdmin && targetUserId) ? targetUserId : sessionUserId

  if (!disciplina || !avaliacao || !data)
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 })

  const notaNum = apto ? 0 : Number(nota)
  if (!apto && (isNaN(notaNum) || notaNum < 0 || notaNum > 10))
    return NextResponse.json({ error: "Nota deve ser entre 0 e 10" }, { status: 400 })

  const registro = await prisma.nota.create({
    data: {
      userId,
      disciplina,
      avaliacao,
      nota: notaNum,
      peso: Number(body.peso) || 1,
      ehAF: !!ehAF,
      apto: !!apto,
      data: new Date(data),
      observacao: observacao || null,
    },
  })

  await prisma.historicoNota.create({
    data: {
      notaId: registro.id,
      alteradoPorId: sessionUserId, // quem lançou (admin ou próprio aluno)
      tipo: "criacao",
      disciplina,
      avaliacao,
      valorNovo: String(notaNum),
      observacao: observacao || null,
    },
  })

  return NextResponse.json(registro)
}
