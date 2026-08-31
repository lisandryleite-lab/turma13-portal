import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, proibido, z, zId, zSemana } from "@/lib/api"

const comConclusoes = {
  conclusoes: { include: { user: { select: { id: true, nomeGuerra: true, matricula: true } } } },
}

export const GET = rotaApi(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const semana = Number(searchParams.get("semana") || 0)
  const missao = semana
    ? await prisma.missao.findUnique({ where: { semana }, include: comConclusoes })
    : await prisma.missao.findMany({ orderBy: { semana: "desc" }, include: comConclusoes })
  return NextResponse.json(missao)
})

const SalvarMissao = z.object({
  semana: zSemana,
  titulo: z.string().trim().min(1, "obrigatório"),
  corpo: z.string().trim().min(1, "obrigatório"),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const { semana, titulo, corpo } = await lerCorpo(req, SalvarMissao)
  const missao = await prisma.missao.upsert({
    where: { semana },
    update: { titulo, corpo },
    create: { semana, titulo, corpo },
  })
  return NextResponse.json(missao)
})

export const DELETE = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const { id } = await lerCorpo(req, z.object({ id: zId }))
  await prisma.missao.delete({ where: { id } })
  return NextResponse.json({ ok: true })
})
