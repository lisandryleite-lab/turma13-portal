import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, proibido, z } from "@/lib/api"

export const GET = rotaApi(async () => {
  const disciplinas = await prisma.disciplina.findMany({ orderBy: { sigla: "asc" } })
  return NextResponse.json(disciplinas)
})

const AtualizarDisciplina = z.object({
  sigla: z.string().trim().min(1, "obrigatório"),
  cargaMinistrada: z.coerce.number().int().min(0).optional(),
  status: z.string().trim().min(1).optional(),
})

export const PUT = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const { sigla, ...data } = await lerCorpo(req, AtualizarDisciplina)
  // Sigla inexistente vira P2025 → 404 pelo rotaApi (antes: 500 genérico).
  await prisma.disciplina.update({ where: { sigla }, data })
  return NextResponse.json({ ok: true })
})
