import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ehGestorFinanceiro } from "@/lib/financeiro"
import { rotaApi, lerCorpo, proibido, z, zId } from "@/lib/api"

// Admin gerencia o pedido coletivo (header + cardápio).

async function exigirGestor() {
  const session = await auth()
  if (!ehGestorFinanceiro(session)) throw proibido()
}

const zPrazo = z.string().nullish().refine(
  (s) => s == null || s === "" || !Number.isNaN(Date.parse(s)), "prazo inválido",
)

const CriarLanche = z.object({
  titulo: z.string().trim().min(1, "obrigatório"),
  restaurante: z.string().nullish(),
  responsavel: z.string().nullish(),
  instrucoes: z.string().nullish(),
  driveFolderUrl: z.string().nullish(),
  prazo: zPrazo,
  itens: z.array(z.object({
    nome: z.string().trim().min(1),
    preco: z.coerce.number().refine(Number.isFinite, "preço inválido"),
  })).min(1, "adicione ao menos um item ao cardápio"),
})

export const POST = rotaApi(async (req: NextRequest) => {
  await exigirGestor()

  const c = await lerCorpo(req, CriarLanche)
  const cardapio = c.itens.map((i, ordem) => ({ nome: i.nome, preco: i.preco, ordem }))

  const pedido = await prisma.pedidoLanche.create({
    data: {
      titulo: c.titulo,
      restaurante: c.restaurante || null,
      responsavel: c.responsavel || "",
      instrucoes: c.instrucoes || null,
      driveFolderUrl: c.driveFolderUrl || null,
      prazo: c.prazo ? new Date(c.prazo) : null,
      itens: { create: cardapio },
    },
  })
  return NextResponse.json(pedido)
})

const AtualizarLanche = z.object({
  id: zId,
  aberto: z.boolean().optional(),
  titulo: z.string().trim().min(1).optional(),
  restaurante: z.string().nullish(),
  responsavel: z.string().optional(),
  instrucoes: z.string().nullish(),
  driveFolderUrl: z.string().nullish(),
  prazo: zPrazo,
})

export const PATCH = rotaApi(async (req: NextRequest) => {
  await exigirGestor()

  const { id, ...c } = await lerCorpo(req, AtualizarLanche)
  const pedido = await prisma.pedidoLanche.update({
    where: { id },
    data: {
      ...(c.aberto !== undefined && { aberto: c.aberto }),
      ...(c.titulo !== undefined && { titulo: c.titulo }),
      ...(c.restaurante !== undefined && { restaurante: c.restaurante }),
      ...(c.responsavel !== undefined && { responsavel: c.responsavel }),
      ...(c.instrucoes !== undefined && { instrucoes: c.instrucoes }),
      ...(c.driveFolderUrl !== undefined && { driveFolderUrl: c.driveFolderUrl || null }),
      ...(c.prazo !== undefined && { prazo: c.prazo ? new Date(c.prazo) : null }),
    },
  })
  return NextResponse.json(pedido)
})

export const DELETE = rotaApi(async (req: NextRequest) => {
  await exigirGestor()

  const { id } = await lerCorpo(req, z.object({ id: zId }))
  await prisma.pedidoLanche.delete({ where: { id } })
  return NextResponse.json({ ok: true })
})

