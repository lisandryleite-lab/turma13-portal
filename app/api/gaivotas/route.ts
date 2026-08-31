import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { adminAtivo } from "@/lib/view"
import { rotaApi, lerCorpo, naoAutorizado, naoEncontrado, proibido, ErroHttp, z } from "@/lib/api"

// GET ?materia= -> comentários (gaivotas) da matéria, mais antigos primeiro
export const GET = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()

  const materia = (req.nextUrl.searchParams.get("materia") || "").trim().toUpperCase()
  if (!materia) throw new ErroHttp(400, "materia ausente")

  const gaivotas = await prisma.gaivota.findMany({
    where: { materia },
    orderBy: { createdAt: "asc" },
    select: { id: true, matricula: true, nomeGuerra: true, texto: true, createdAt: true },
  })
  return NextResponse.json(gaivotas)
})

// POST {materia, texto} -> publica uma gaivota (qualquer aluno logado)
const PublicarGaivota = z.object({
  materia: z.string().trim().min(1, "informe a matéria").transform(s => s.toUpperCase()),
  texto: z.string().trim().min(1, "comentário vazio").max(2000, "comentário muito longo (máx. 2000)"),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()

  const { materia, texto } = await lerCorpo(req, PublicarGaivota)

  const g = await prisma.gaivota.create({
    data: {
      materia,
      matricula: session.user.matricula,
      nomeGuerra: session.user.nomeGuerra,
      texto,
    },
    select: { id: true, matricula: true, nomeGuerra: true, texto: true, createdAt: true },
  })
  return NextResponse.json(g, { status: 201 })
})

// DELETE ?id= -> admin remove qualquer gaivota; autor pode remover a própria
export const DELETE = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()

  const id = req.nextUrl.searchParams.get("id")
  if (!id) throw new ErroHttp(400, "id ausente")

  const g = await prisma.gaivota.findUnique({ where: { id }, select: { matricula: true } })
  if (!g) throw naoEncontrado("Gaivota")

  const isAdmin = await adminAtivo(session.user.isAdmin)
  if (!isAdmin && g.matricula !== session.user.matricula) throw proibido()

  await prisma.gaivota.delete({ where: { id } })
  return NextResponse.json({ ok: true })
})
