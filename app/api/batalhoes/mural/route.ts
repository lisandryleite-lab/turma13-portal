import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, proibido, z } from "@/lib/api"

// Mural da turma por batalhão: qualquer aluno logado publica; apaga a própria
// mensagem (o admin apaga qualquer uma).
const Publicar = z.object({
  sigla: z.string().trim().min(1),
  texto: z.string().trim().min(1, "mensagem vazia").max(1000, "máximo de 1000 caracteres"),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) throw proibido()
  const { sigla, texto } = await lerCorpo(req, Publicar)
  const opm = await prisma.oPM.findUnique({ where: { sigla } })
  if (!opm || opm.especial) return NextResponse.json({ error: "Batalhão não encontrado." }, { status: 404 })
  const msg = await prisma.opmMural.create({ data: { opmId: opm.id, userId: session.user.id, texto } })
  return NextResponse.json({ id: msg.id })
})

export const DELETE = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) throw proibido()
  const id = req.nextUrl.searchParams.get("id") ?? ""
  const msg = await prisma.opmMural.findUnique({ where: { id } })
  if (!msg) return NextResponse.json({ error: "Mensagem não encontrada." }, { status: 404 })
  if (msg.userId !== session.user.id && !session.user.isAdmin) throw proibido()
  await prisma.opmMural.delete({ where: { id } })
  return NextResponse.json({ ok: true })
})
