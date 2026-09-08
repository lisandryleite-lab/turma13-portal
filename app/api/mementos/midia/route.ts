import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TIPOS_MIDIA, urlValida, type TipoMidia } from "@/lib/midia-embed"

const sel = { id: true, materia: true, tipo: true, titulo: true, url: true, ordem: true } as const

// GET ?materia= -> mídias (vídeo / áudio / mapa mental) da matéria
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const materia = (req.nextUrl.searchParams.get("materia") || "").trim().toUpperCase()
  const where = materia ? { materia } : {}
  const itens = await prisma.mementoMidia.findMany({
    where, select: sel,
    orderBy: [{ materia: "asc" }, { tipo: "asc" }, { ordem: "asc" }, { createdAt: "asc" }],
  })
  return NextResponse.json(itens)
}

// POST {materia, tipo, titulo, url} -> admin cadastra um link (Drive / YouTube)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 })

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }) }

  const materia = String(body.materia || "").trim().toUpperCase()
  const tipo = String(body.tipo || "").trim() as TipoMidia
  const titulo = String(body.titulo || "").trim()
  const url = String(body.url || "").trim()

  if (!materia) return NextResponse.json({ error: "Informe a matéria." }, { status: 400 })
  if (!TIPOS_MIDIA.includes(tipo)) return NextResponse.json({ error: "Tipo inválido (video, audio ou mapa)." }, { status: 400 })
  if (!titulo || titulo.length > 120) return NextResponse.json({ error: "Título obrigatório (máx. 120)." }, { status: 400 })
  if (!urlValida(url)) return NextResponse.json({ error: "Cole um link https:// válido (Drive ou YouTube)." }, { status: 400 })

  const disc = await prisma.disciplina.findUnique({ where: { sigla: materia }, select: { sigla: true } })
  if (!disc) return NextResponse.json({ error: `Matéria "${materia}" não existe nas disciplinas.` }, { status: 400 })

  const ultimo = await prisma.mementoMidia.findFirst({ where: { materia, tipo }, orderBy: { ordem: "desc" }, select: { ordem: true } })
  const item = await prisma.mementoMidia.create({
    data: { materia, tipo, titulo, url, ordem: (ultimo?.ordem ?? -1) + 1 },
    select: sel,
  })
  return NextResponse.json(item, { status: 201 })
}

// DELETE ?id= -> admin remove um link
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id ausente" }, { status: 400 })

  await prisma.mementoMidia.delete({ where: { id } }).catch(() => null)
  return NextResponse.json({ ok: true })
}
