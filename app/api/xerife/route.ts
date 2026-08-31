import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, proibido, z, zId, zData, zMatricula } from "@/lib/api"

async function exigirAdmin() {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()
}

export const GET = rotaApi(async () => {
  const xerifes = await prisma.xerife.findMany({ orderBy: { dataInicio: "desc" } })
  return NextResponse.json(xerifes)
})

const zDataFim = z.string().nullish().refine(
  (s) => s == null || s === "" || !Number.isNaN(Date.parse(s)), "data de fim inválida",
)

const CriarXerife = z.object({
  matricula: zMatricula,
  nomeGuerra: z.string().trim().min(1, "obrigatório"),
  dataInicio: zData,
  dataFim: zDataFim,
})

export const POST = rotaApi(async (req: NextRequest) => {
  await exigirAdmin()

  const b = await lerCorpo(req, CriarXerife)
  const virandoAtual = !b.dataFim

  // "Zerar o atual" e "criar o novo" precisam ser atômicos, senão uma falha no
  // meio deixa a turma sem nenhum xerife marcado como atual.
  const xerife = await prisma.$transaction(async (tx) => {
    if (virandoAtual) {
      await tx.xerife.updateMany({ where: { atual: true }, data: { atual: false } })
    }
    return tx.xerife.create({
      data: {
        matricula: b.matricula,
        nomeGuerra: b.nomeGuerra,
        dataInicio: new Date(b.dataInicio),
        dataFim: b.dataFim ? new Date(b.dataFim) : null,
        atual: virandoAtual,
      },
    })
  })
  return NextResponse.json(xerife)
})

const AtualizarXerife = CriarXerife.extend({
  id: zId,
  atual: z.boolean().optional(),
})

export const PATCH = rotaApi(async (req: NextRequest) => {
  await exigirAdmin()

  const b = await lerCorpo(req, AtualizarXerife)

  const xerife = await prisma.$transaction(async (tx) => {
    if (b.atual) {
      await tx.xerife.updateMany({ where: { atual: true, id: { not: b.id } }, data: { atual: false } })
    }
    return tx.xerife.update({
      where: { id: b.id },
      data: {
        matricula: b.matricula,
        nomeGuerra: b.nomeGuerra,
        dataInicio: new Date(b.dataInicio),
        dataFim: b.dataFim ? new Date(b.dataFim) : null,
        atual: !!b.atual,
      },
    })
  })
  return NextResponse.json(xerife)
})

export const DELETE = rotaApi(async (req: NextRequest) => {
  await exigirAdmin()

  const { id } = await lerCorpo(req, z.object({ id: zId }))
  await prisma.xerife.delete({ where: { id } })
  return NextResponse.json({ ok: true })
})
