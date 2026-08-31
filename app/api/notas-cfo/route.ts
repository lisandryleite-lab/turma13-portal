import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, naoAutorizado, naoEncontrado, ErroHttp, z } from "@/lib/api"

// Ranking CFO — notas AUTODECLARADAS por disciplina/avaliação. Cada aluno só as suas.
export const GET = rotaApi(async () => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()
  const notas = await prisma.notaCFO.findMany({
    where: { userId: session.user.id! },
    orderBy: [{ disciplina: "asc" }, { avaliacao: "asc" }],
  })
  return NextResponse.json(notas)
})

const SalvarNotaCfo = z.object({
  disciplina: z.string().trim().min(1, "disciplina é obrigatória").transform(s => s.toUpperCase()),
  avaliacao: z.string().trim().transform(s => s.toUpperCase() || "P1").optional(),
  valor: z.coerce.number().min(0, "nota deve ser entre 0 e 10").max(10, "nota deve ser entre 0 e 10"),
  ehAF: z.boolean().optional(),
  apto: z.boolean().optional(),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()
  const userId = session.user.id!

  const body = await lerCorpo(req, SalvarNotaCfo)
  const disciplina = body.disciplina
  const avaliacao = body.avaliacao || "P1"
  const { valor } = body
  const ehAF = !!body.ehAF
  const apto = !!body.apto

  const chave = { userId_disciplina_avaliacao: { userId, disciplina, avaliacao } }
  const existente = await prisma.notaCFO.findUnique({ where: chave })

  // Nota e histórico juntos — senão dá para gravar a nota e perder o registro.
  const registro = await prisma.$transaction(async (tx) => {
    const r = await tx.notaCFO.upsert({
      where: chave,
      update: { valor, ehAF, apto },
      create: { userId, disciplina, avaliacao, valor, ehAF, apto, autodeclarada: true },
    })
    await tx.historicoNotaCFO.create({
      data: {
        notaCfoId: r.id,
        alteradoPorId: userId,
        tipo: existente ? "edicao" : "criacao",
        valorAnterior: existente ? String(existente.valor) : null,
        valorNovo: String(valor),
        disciplina,
        avaliacao,
      },
    })
    return r
  })

  return NextResponse.json(registro)
})

export const DELETE = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()
  const userId = session.user.id!
  const id = req.nextUrl.searchParams.get("id")
  if (!id) throw new ErroHttp(400, "id ausente")

  const nota = await prisma.notaCFO.findUnique({ where: { id } })
  if (!nota || nota.userId !== userId) throw naoEncontrado("Nota")

  await prisma.notaCFO.delete({ where: { id } })
  return NextResponse.json({ ok: true })
})
