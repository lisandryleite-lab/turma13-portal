import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, proibido, ErroHttp } from "@/lib/api"

export const DELETE = rotaApi(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const { id } = await params
  const tipo = new URL(req.url).searchParams.get("tipo")

  if (tipo === "faxina") await prisma.escalaTurmaFaxina.delete({ where: { id } })
  else if (tipo === "servico") await prisma.escalaTurmaServico.delete({ where: { id } })
  else throw new ErroHttp(400, 'Informe ?tipo=faxina ou ?tipo=servico')

  return NextResponse.json({ ok: true })
})
