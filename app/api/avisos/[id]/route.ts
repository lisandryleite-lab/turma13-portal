import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, proibido, z } from "@/lib/api"

async function exigirAdmin() {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()
}

// O corpo ia inteiro para o `update`; agora só estes campos passam.
const AtualizarAviso = z.object({
  titulo: z.string().trim().min(1).optional(),
  corpo: z.string().trim().min(1).optional(),
  fixado: z.boolean().optional(),
  destaque: z.boolean().optional(),
})

export const PUT = rotaApi(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  await exigirAdmin()
  const { id } = await params
  const data = await lerCorpo(req, AtualizarAviso)
  await prisma.aviso.update({ where: { id }, data })
  return NextResponse.json({ ok: true })
})

export const DELETE = rotaApi(async (_: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  await exigirAdmin()
  const { id } = await params
  await prisma.aviso.delete({ where: { id } })
  return NextResponse.json({ ok: true })
})
