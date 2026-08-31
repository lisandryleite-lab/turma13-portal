import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rotaApi, naoEncontrado, ErroHttp } from "@/lib/api"

// Rota PÚBLICA (sem login) — pagamento por token único.
// O token pode ser de uma cota (PagamentoCota) ou de um lanche (PedidoLancheAluno).
// GET: dados da cobrança. POST: declara "já fiz o Pix".

async function declarar(token: string, observacao?: string) {
  const cota = await prisma.pagamentoCota.findUnique({ where: { token }, include: { cota: { select: { ativa: true } } } })
  if (cota) {
    if (!cota.cota.ativa) throw new ErroHttp(400, "Cobrança encerrada")
    if (cota.pago) return { ok: true, jaConfirmado: true }
    await prisma.pagamentoCota.update({ where: { token }, data: { declaradoPago: true, dataDeclarado: new Date(), ...(observacao !== undefined && { observacao }) } })
    return { ok: true }
  }
  const lanche = await prisma.pedidoLancheAluno.findUnique({ where: { token }, include: { pedido: { select: { aberto: true } } } })
  if (lanche) {
    if (lanche.pago) return { ok: true, jaConfirmado: true }
    await prisma.pedidoLancheAluno.update({ where: { token }, data: { declaradoPago: true, dataDeclarado: new Date(), ...(observacao !== undefined && { observacao }) } })
    return { ok: true }
  }
  throw naoEncontrado("Link")
}

export const POST = rotaApi(async (req: NextRequest, { params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params
  // Corpo é opcional aqui (o botão "já paguei" pode vir sem observação), então
  // o try/catch fica em vez de `lerCorpo`.
  let observacao: string | undefined
  try {
    const body = await req.json()
    if (typeof body?.observacao === "string") observacao = body.observacao.slice(0, 280)
  } catch { /* sem corpo */ }

  return NextResponse.json(await declarar(token, observacao))
})
