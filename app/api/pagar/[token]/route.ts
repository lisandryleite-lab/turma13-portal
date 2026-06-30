import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Rota PÚBLICA (sem login) — pagamento por token único.
// GET: dados da cobrança. POST: aluno declara "já fiz o Pix".

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const pag = await prisma.pagamentoCota.findUnique({
    where: { token },
    include: {
      user: { select: { nomeGuerra: true, matricula: true } },
      cota: { select: { titulo: true, tipo: true, valor: true, responsavel: true, instrucoes: true, prazo: true, ativa: true } },
    },
  })
  if (!pag) return NextResponse.json({ error: "Link inválido" }, { status: 404 })

  return NextResponse.json({
    nomeGuerra: pag.user.nomeGuerra,
    matricula: pag.user.matricula,
    pago: pag.pago,
    declaradoPago: pag.declaradoPago,
    dataDeclarado: pag.dataDeclarado,
    cota: pag.cota,
  })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const pag = await prisma.pagamentoCota.findUnique({ where: { token }, include: { cota: { select: { ativa: true } } } })
  if (!pag) return NextResponse.json({ error: "Link inválido" }, { status: 404 })
  if (!pag.cota.ativa) return NextResponse.json({ error: "Cobrança encerrada" }, { status: 400 })
  if (pag.pago) return NextResponse.json({ ok: true, jaConfirmado: true })

  let observacao: string | undefined
  try {
    const body = await req.json()
    if (typeof body?.observacao === "string") observacao = body.observacao.slice(0, 280)
  } catch { /* sem corpo */ }

  await prisma.pagamentoCota.update({
    where: { token },
    data: { declaradoPago: true, dataDeclarado: new Date(), ...(observacao !== undefined && { observacao }) },
  })
  return NextResponse.json({ ok: true })
}
