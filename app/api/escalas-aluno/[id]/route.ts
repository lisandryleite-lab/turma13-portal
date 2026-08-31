import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, naoAutorizado, naoEncontrado, proibido, z, zData } from "@/lib/api"

/** Carrega a escala e confere se o usuário pode mexer nela (dono ou admin). */
async function escalaDoUsuario(id: string) {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()

  const r = await prisma.escalaAluno.findUnique({ where: { id } })
  if (!r) throw naoEncontrado("Escala")
  if (!session.user.isAdmin && r.userId !== session.user.id) throw proibido()
  return r
}

export const DELETE = rotaApi(async (_: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  await escalaDoUsuario(id)

  await prisma.escalaAluno.delete({ where: { id } })
  return NextResponse.json({ ok: true })
})

// `userId` de propósito fora da lista: senão dava para repassar a escala a
// outro aluno pelo corpo da requisição.
const AtualizarEscalaAluno = z.object({
  tipo: z.string().trim().min(1).optional(),
  data: zData,
  nome: z.string().nullish(),
  horaInicio: z.string().nullish(),
  horaFim: z.string().nullish(),
  funcao: z.string().nullish(),
  local: z.string().nullish(),
  descricao: z.string().nullish(),
  observacao: z.string().nullish(),
})

export const PUT = rotaApi(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  await escalaDoUsuario(id)

  const { data, ...campos } = await lerCorpo(req, AtualizarEscalaAluno)
  const atualizado = await prisma.escalaAluno.update({
    where: { id },
    data: { ...campos, data: new Date(data) },
  })
  return NextResponse.json(atualizado)
})
