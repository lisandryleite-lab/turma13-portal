import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, naoAutorizado, ErroHttp, z, zId, zData } from "@/lib/api"

export const GET = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()
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
})

const CriarNota = z.object({
  disciplina: z.string().trim().min(1, "obrigatório"),
  avaliacao: z.string().trim().min(1, "obrigatório"),
  data: zData,
  nota: z.coerce.number().optional(),
  peso: z.coerce.number().optional(),
  observacao: z.string().nullish(),
  ehAF: z.boolean().optional(),
  apto: z.boolean().optional(),
  targetUserId: zId.optional(),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()
  const sessionUserId = session.user.id!
  const isAdmin = session.user.isAdmin

  const body = await lerCorpo(req, CriarNota)
  const { disciplina, avaliacao, observacao, ehAF, apto } = body

  // Admin pode lançar nota para outro aluno
  const userId = (isAdmin && body.targetUserId) ? body.targetUserId : sessionUserId

  const notaNum = apto ? 0 : Number(body.nota)
  if (!apto && (isNaN(notaNum) || notaNum < 0 || notaNum > 10))
    throw new ErroHttp(400, "Nota deve ser entre 0 e 10")

  // Nota e histórico na mesma transação: antes, se o segundo insert falhasse,
  // a nota ficava lançada sem registro de quem lançou.
  const [registro] = await prisma.$transaction(async (tx) => {
    const r = await tx.nota.create({
      data: {
        userId,
        disciplina,
        avaliacao,
        nota: notaNum,
        peso: Number(body.peso) || 1,
        ehAF: !!ehAF,
        apto: !!apto,
        data: new Date(body.data),
        observacao: observacao || null,
      },
    })
    await tx.historicoNota.create({
      data: {
        notaId: r.id,
        alteradoPorId: sessionUserId, // quem lançou (admin ou próprio aluno)
        tipo: "criacao",
        disciplina,
        avaliacao,
        valorNovo: String(notaNum),
        observacao: observacao || null,
      },
    })
    return [r]
  })

  return NextResponse.json(registro)
})
