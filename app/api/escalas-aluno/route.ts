import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, naoAutorizado, z, zData } from "@/lib/api"

export const GET = rotaApi(async () => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()
  const userId = session.user.id!
  const isAdmin = session.user.isAdmin

  const escalas = isAdmin
    ? await prisma.escalaAluno.findMany({ include: { user: { select: { nomeGuerra: true, matricula: true } } }, orderBy: { data: "desc" } })
    : await prisma.escalaAluno.findMany({ where: { userId }, orderBy: { data: "desc" } })

  return NextResponse.json(escalas)
})

const CriarEscalaAluno = z.object({
  tipo: z.string().trim().min(1, "obrigatório"),
  data: zData,
  nome: z.string().nullish(),
  horaInicio: z.string().nullish(),
  horaFim: z.string().nullish(),
  funcao: z.string().nullish(),
  local: z.string().nullish(),
  descricao: z.string().nullish(),
  observacao: z.string().nullish(),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()
  const userId = session.user.id!

  const { data, ...campos } = await lerCorpo(req, CriarEscalaAluno)

  const r = await prisma.escalaAluno.create({
    data: { userId, ...campos, data: new Date(data) },
  })
  return NextResponse.json(r)
})
