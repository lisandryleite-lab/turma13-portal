import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, proibido, z } from "@/lib/api"

export const GET = rotaApi(async () => {
  const avisos = await prisma.aviso.findMany({ orderBy: [{ fixado: "desc" }, { createdAt: "desc" }] })
  return NextResponse.json(avisos)
})

const CriarAviso = z.object({
  titulo: z.string().trim().min(1, "obrigatório"),
  corpo: z.string().trim().min(1, "obrigatório"),
  fixado: z.boolean().optional(),
  destaque: z.boolean().optional(),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const { titulo, corpo, fixado, destaque } = await lerCorpo(req, CriarAviso)
  const aviso = await prisma.aviso.create({ data: { titulo, corpo, fixado: !!fixado, destaque: !!destaque } })
  return NextResponse.json(aviso)
})
