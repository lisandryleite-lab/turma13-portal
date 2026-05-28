import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const semana = Number(searchParams.get("semana") || 0)
  const all = searchParams.get("all") === "true"

  if (all) {
    const lista = await prisma.qTS.findMany({ orderBy: { semana: "desc" }, select: { semana: true, createdAt: true } })
    return NextResponse.json(lista)
  }

  const qts = semana
    ? await prisma.qTS.findUnique({ where: { semana } })
    : await prisma.qTS.findFirst({ orderBy: { semana: "desc" } })
  return NextResponse.json(qts)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { semana, dados, atualizacoesDisciplinas } = await req.json()

  const qts = await prisma.qTS.upsert({
    where: { semana: Number(semana) },
    update: { dados },
    create: { semana: Number(semana), dados },
  })

  // Atualiza progresso das disciplinas se fornecido
  if (atualizacoesDisciplinas && Array.isArray(atualizacoesDisciplinas)) {
    for (const { sigla, cargaMinistrada, status } of atualizacoesDisciplinas) {
      await prisma.disciplina.update({
        where: { sigla },
        data: { cargaMinistrada: Number(cargaMinistrada), status },
      }).catch(() => {}) // ignora siglas não encontradas
    }
  }

  return NextResponse.json(qts)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { semana } = await req.json()
  await prisma.qTS.delete({ where: { semana: Number(semana) } })
  return NextResponse.json({ ok: true })
}
