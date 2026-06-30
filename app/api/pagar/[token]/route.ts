import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Rota PÚBLICA (sem login) — pagamento por token único.
// O token pode ser de uma cota (PagamentoCota) ou de um lanche (PedidoLancheAluno).
// GET: dados da cobrança. POST: declara "já fiz o Pix".

async function declarar(token: string, observacao?: string) {
  const cota = await prisma.pagamentoCota.findUnique({ where: { token }, include: { cota: { select: { ativa: true } } } })
  if (cota) {
    if (!cota.cota.ativa) return { status: 400, body: { error: "Cobrança encerrada" } }
    if (cota.pago) return { status: 200, body: { ok: true, jaConfirmado: true } }
    await prisma.pagamentoCota.update({ where: { token }, data: { declaradoPago: true, dataDeclarado: new Date(), ...(observacao !== undefined && { observacao }) } })
    return { status: 200, body: { ok: true } }
  }
  const lanche = await prisma.pedidoLancheAluno.findUnique({ where: { token }, include: { pedido: { select: { aberto: true } } } })
  if (lanche) {
    if (lanche.pago) return { status: 200, body: { ok: true, jaConfirmado: true } }
    await prisma.pedidoLancheAluno.update({ where: { token }, data: { declaradoPago: true, dataDeclarado: new Date(), ...(observacao !== undefined && { observacao }) } })
    return { status: 200, body: { ok: true } }
  }
  return { status: 404, body: { error: "Link inválido" } }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  let observacao: string | undefined
  try {
    const body = await req.json()
    if (typeof body?.observacao === "string") observacao = body.observacao.slice(0, 280)
  } catch { /* sem corpo */ }
  const r = await declarar(token, observacao)
  return NextResponse.json(r.body, { status: r.status })
}
