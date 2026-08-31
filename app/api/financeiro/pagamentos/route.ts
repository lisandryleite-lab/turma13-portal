import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ehGestorFinanceiro } from "@/lib/financeiro"
import { rotaApi, lerCorpo, proibido, z, zId } from "@/lib/api"

async function exigirGestor() {
  const session = await auth()
  if (!ehGestorFinanceiro(session)) throw proibido()
}

export const POST = rotaApi(async (req: NextRequest) => {
  await exigirGestor()

  const { cotaId, userId } = await lerCorpo(req, z.object({ cotaId: zId, userId: zId }))
  const pagamento = await prisma.pagamentoCota.upsert({
    where: { cotaId_userId: { cotaId, userId } },
    update: {},
    create: { cotaId, userId },
  })
  return NextResponse.json(pagamento)
})

export const DELETE = rotaApi(async (req: NextRequest) => {
  await exigirGestor()

  const { id } = await lerCorpo(req, z.object({ id: zId }))
  await prisma.pagamentoCota.delete({ where: { id } })
  return NextResponse.json({ ok: true })
})

const ConfirmarPagamento = z.object({
  id: zId,
  pago: z.boolean().optional(),
  observacao: z.string().nullish(),
})

export const PATCH = rotaApi(async (req: NextRequest) => {
  await exigirGestor()

  const { id, pago, observacao } = await lerCorpo(req, ConfirmarPagamento)
  const pagamento = await prisma.pagamentoCota.update({
    where: { id },
    data: {
      pago: Boolean(pago),
      dataPagamento: pago ? new Date() : null,
      ...(observacao !== undefined && { observacao }),
    },
  })
  return NextResponse.json(pagamento)
})
