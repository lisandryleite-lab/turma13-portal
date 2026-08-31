import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, proibido, z, zId, zMatricula } from "@/lib/api"

async function exigirAdmin() {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()
}

export const GET = rotaApi(async () => {
  const membros = await prisma.faxinaGrupoMembro.findMany({ orderBy: [{ grupo: "asc" }, { mat: "asc" }] })
  return NextResponse.json(membros)
})

const zGrupo = z.string().trim().min(1, "obrigatório")

const SalvarMembro = z.object({
  grupo: zGrupo,
  mat: zMatricula,
  nome: z.string().trim().min(1, "obrigatório"),
})

export const POST = rotaApi(async (req: NextRequest) => {
  await exigirAdmin()

  const { grupo, mat, nome } = await lerCorpo(req, SalvarMembro)
  const membro = await prisma.faxinaGrupoMembro.upsert({
    where: { grupo_mat: { grupo, mat } },
    update: { nome, grupo },
    create: { grupo, mat, nome },
  })
  return NextResponse.json(membro)
})

const MoverMembro = z.object({ id: zId, grupo: zGrupo })

export const PATCH = rotaApi(async (req: NextRequest) => {
  // Mover membro para outro grupo
  await exigirAdmin()

  const { id, grupo } = await lerCorpo(req, MoverMembro)
  const membro = await prisma.faxinaGrupoMembro.update({ where: { id }, data: { grupo } })
  return NextResponse.json(membro)
})

export const DELETE = rotaApi(async (req: NextRequest) => {
  await exigirAdmin()

  const { id } = await lerCorpo(req, z.object({ id: zId }))
  await prisma.faxinaGrupoMembro.delete({ where: { id } })
  return NextResponse.json({ ok: true })
})
