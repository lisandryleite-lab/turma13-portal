import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { adminAtivo } from "@/lib/view"

// GET ?materia= -> comentários (gaivotas) da matéria, mais antigos primeiro
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const materia = (req.nextUrl.searchParams.get("materia") || "").trim().toUpperCase()
  if (!materia) return NextResponse.json({ error: "materia ausente" }, { status: 400 })

  const gaivotas = await prisma.gaivota.findMany({
    where: { materia },
    orderBy: { createdAt: "asc" },
    select: { id: true, matricula: true, nomeGuerra: true, texto: true, createdAt: true },
  })
  return NextResponse.json(gaivotas)
}

// POST {materia, texto} -> publica uma gaivota (qualquer aluno logado)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }) }

  const materia = String(body.materia || "").trim().toUpperCase()
  const texto = String(body.texto || "").trim()
  if (!materia) return NextResponse.json({ error: "Informe a matéria." }, { status: 400 })
  if (!texto) return NextResponse.json({ error: "Comentário vazio." }, { status: 400 })
  if (texto.length > 2000) return NextResponse.json({ error: "Comentário muito longo (máx. 2000)." }, { status: 400 })

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
}

// DELETE ?id= -> admin remove qualquer gaivota; autor pode remover a própria
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id ausente" }, { status: 400 })

  const g = await prisma.gaivota.findUnique({ where: { id }, select: { matricula: true } })
  if (!g) return NextResponse.json({ error: "Não encontrada" }, { status: 404 })

  const isAdmin = await adminAtivo(session.user.isAdmin)
  if (!isAdmin && g.matricula !== session.user.matricula) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 })
  }

  await prisma.gaivota.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
