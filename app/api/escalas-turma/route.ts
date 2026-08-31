import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, naoAutorizado, proibido, z, zData, zId } from "@/lib/api"

export const GET = rotaApi(async () => {
  const session = await auth()
  if (!session) throw naoAutorizado()

  const [faxinas, servicos] = await Promise.all([
    prisma.escalaTurmaFaxina.findMany({ orderBy: { data: "asc" } }),
    prisma.escalaTurmaServico.findMany({ orderBy: { data: "asc" } }),
  ])
  return NextResponse.json({ faxinas, servicos })
})

const CriarEscalaTurma = z.object({
  tipo: z.enum(["faxina", "servico"], { message: 'tipo deve ser "faxina" ou "servico"' }),
  data: zData,
  posicao: z.string().trim().min(1, "obrigatório"),
  userId: zId,
  canga: z.string().nullish(),
  observacao: z.string().nullish(),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const { tipo, data, ...campos } = await lerCorpo(req, CriarEscalaTurma)
  const dados = { ...campos, data: new Date(data) }

  // userId inexistente agora vira P2003 → 409 pelo rotaApi (a FK passou a
  // existir no banco); antes gravava linha órfã em silêncio.
  const r = tipo === "faxina"
    ? await prisma.escalaTurmaFaxina.create({ data: dados })
    : await prisma.escalaTurmaServico.create({ data: dados })

  return NextResponse.json(r)
})
