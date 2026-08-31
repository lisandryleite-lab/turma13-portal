import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, proibido, z, zSemana } from "@/lib/api"

export const GET = rotaApi(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const semana = Number(searchParams.get("semana") || 0)
  const all = searchParams.get("all") === "true"

  if (all) {
    const lista = await prisma.qTS.findMany({ orderBy: { semana: "desc" }, select: { semana: true, createdAt: true } })
    return NextResponse.json(lista)
  }

  const qts = semana
    ? await prisma.qTS.findUnique({ where: { semana } })
    : await prisma.qTS.findFirst({ orderBy: { semana: "desc" } })
  return NextResponse.json(qts)
})

const SalvarQts = z.object({
  semana: zSemana,
  dados: z.unknown(), // JSON livre, estruturado pelo frontend
  atualizacoesDisciplinas: z.array(z.object({
    sigla: z.string().trim().min(1),
    cargaMinistrada: z.coerce.number().int().min(0),
    status: z.string().trim().min(1).optional(),
  })).optional(),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const { semana, dados, atualizacoesDisciplinas } = await lerCorpo(req, SalvarQts)

  const qts = await prisma.qTS.upsert({
    where: { semana },
    update: { dados: dados as never },
    create: { semana, dados: dados as never },
  })

  // Atualiza progresso das disciplinas se fornecido. `updateMany` em vez de
  // `update` para sigla inexistente não virar exceção (antes: .catch(() => {})),
  // e tudo numa transação só em vez de um roundtrip por disciplina.
  if (atualizacoesDisciplinas && atualizacoesDisciplinas.length > 0) {
    await prisma.$transaction(atualizacoesDisciplinas.map(d =>
      prisma.disciplina.updateMany({
        where: { sigla: d.sigla },
        data: { cargaMinistrada: d.cargaMinistrada, ...(d.status !== undefined && { status: d.status }) },
      }),
    ))
  }

  return NextResponse.json(qts)
})

export const DELETE = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const { semana } = await lerCorpo(req, z.object({ semana: zSemana }))
  await prisma.qTS.delete({ where: { semana } })
  return NextResponse.json({ ok: true })
})
