import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, proibido, z } from "@/lib/api"

// Contribuições da turma por batalhão (moradia, dica, informação, dúvida):
// qualquer aluno logado publica; apaga a própria (o admin apaga qualquer uma).
const Publicar = z.object({
  sigla: z.string().trim().min(1),
  texto: z.string().trim().min(1, "mensagem vazia").max(1000, "máximo de 1000 caracteres"),
  tipo: z.enum(["moradia", "dica", "info", "duvida"]).default("dica"),
  bairro: z.string().trim().max(80).optional().transform(v => (v ? v : null)),
  valor: z.string().trim().max(60).optional().transform(v => (v ? v : null)),
  link: z.string().trim().max(500).optional().transform(v => (v ? v : null))
    .refine(v => v === null || /^https?:\/\//.test(v), "o link deve começar com http:// ou https://"),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.id) throw proibido()
  const { sigla, ...dados } = await lerCorpo(req, Publicar)
  const opm = await prisma.oPM.findUnique({ where: { sigla } })
  if (!opm || opm.especial) return NextResponse.json({ error: "Batalhão não encontrado." }, { status: 404 })
  const msg = await prisma.opmMural.create({ data: { opmId: opm.id, userId: session.user.id, ...dados } })
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
