import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { adminAtivo } from "@/lib/view"
import { ORDEM_TIPOS } from "@/lib/calendario-config"

const sel = {
  id: true, inicio: true, fim: true, titulo: true, tipo: true,
  unidade: true, segmento: true, turma: true, turno: true, obs: true,
} as const

const ISO = /^\d{4}-\d{2}-\d{2}$/

// GET -> eventos cadastrados (qualquer aluno logado)
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const eventos = await prisma.eventoCalendario
    .findMany({ select: sel, orderBy: [{ inicio: "asc" }, { titulo: "asc" }] })
    .catch(() => [])          // tabela ainda não criada (antes do db:push)
  return NextResponse.json(eventos)
}

// POST {inicio, fim?, titulo, tipo, unidade?, segmento?, turma?, turno?, obs?} -> admin cadastra
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  if (!(await adminAtivo(session.user.isAdmin))) {
    return NextResponse.json({ error: "Apenas administradores." }, { status: 403 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }) }

  const texto = (v: unknown) => String(v ?? "").trim()
  const opcional = (v: unknown) => texto(v) || null

  const inicio = texto(body.inicio)
  const fim = texto(body.fim) || inicio
  const titulo = texto(body.titulo)
  const tipo = texto(body.tipo)

  if (!ISO.test(inicio)) return NextResponse.json({ error: "Data de início inválida." }, { status: 400 })
  if (!ISO.test(fim)) return NextResponse.json({ error: "Data de fim inválida." }, { status: 400 })
  if (fim < inicio) return NextResponse.json({ error: "O fim não pode ser antes do início." }, { status: 400 })
  if (!titulo || titulo.length > 140) return NextResponse.json({ error: "Título obrigatório (máx. 140)." }, { status: 400 })
  if (!(ORDEM_TIPOS as readonly string[]).includes(tipo)) {
    return NextResponse.json({ error: "Tipo inválido." }, { status: 400 })
  }

  const evento = await prisma.eventoCalendario.create({
    data: {
      inicio, fim, titulo, tipo,
      unidade: opcional(body.unidade), segmento: opcional(body.segmento),
      turma: opcional(body.turma), turno: opcional(body.turno), obs: opcional(body.obs),
      criadoPor: session.user.matricula,
    },
    select: sel,
  })
  return NextResponse.json(evento, { status: 201 })
}

// DELETE ?id= -> admin remove
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  if (!(await adminAtivo(session.user.isAdmin))) {
    return NextResponse.json({ error: "Apenas administradores." }, { status: 403 })
  }

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id ausente" }, { status: 400 })

  await prisma.eventoCalendario.delete({ where: { id } }).catch(() => null)
  return NextResponse.json({ ok: true })
}
