import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, naoAutorizado, naoEncontrado, proibido, ErroHttp, z, zData } from "@/lib/api"

/** Carrega a nota e confere se o usuário pode mexer nela (dono ou admin). */
async function notaDoUsuario(id: string) {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()

  const existente = await prisma.nota.findUnique({ where: { id } })
  if (!existente) throw naoEncontrado("Nota")
  if (!session.user.isAdmin && existente.userId !== session.user.id) throw proibido()

  return { existente, userId: session.user.id! }
}

const AtualizarNota = z.object({
  disciplina: z.string().trim().min(1, "obrigatório"),
  avaliacao: z.string().trim().min(1, "obrigatório"),
  nota: z.coerce.number(),
  peso: z.coerce.number().optional(),
  data: zData,
  observacao: z.string().nullish(),
})

export const PUT = rotaApi(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const { existente, userId } = await notaDoUsuario(id)

  const { disciplina, avaliacao, nota, peso, data, observacao } = await lerCorpo(req, AtualizarNota)

  const notaNum = Number(nota)
  if (isNaN(notaNum) || notaNum < 0 || notaNum > 10)
    throw new ErroHttp(400, "Nota deve ser entre 0 e 10")

  const pesoNum = Number(peso) || 1

  const campos: Array<[string, string, string]> = []
  if (existente.nota !== notaNum) campos.push(["nota", String(existente.nota), String(notaNum)])
  if (existente.disciplina !== disciplina) campos.push(["disciplina", existente.disciplina, disciplina])
  if (existente.avaliacao !== avaliacao) campos.push(["avaliacao", existente.avaliacao, avaliacao])
  if (existente.peso !== pesoNum) campos.push(["peso", String(existente.peso), String(pesoNum)])

  // Update + histórico numa transação, e o histórico num createMany só — antes
  // era um insert por campo alterado, cada um com seu roundtrip.
  const atualizado = await prisma.$transaction(async (tx) => {
    const a = await tx.nota.update({
      where: { id },
      data: { disciplina, avaliacao, nota: notaNum, peso: pesoNum, data: new Date(data), observacao: observacao || null },
    })
    if (campos.length > 0) {
      await tx.historicoNota.createMany({
        data: campos.map(([campo, anterior, novo]) => ({
          notaId: id,
          alteradoPorId: userId,
          tipo: "edicao",
          campoAlterado: campo,
          valorAnterior: anterior,
          valorNovo: novo,
          disciplina: a.disciplina,
          avaliacao: a.avaliacao,
          observacao: observacao || null,
        })),
      })
    }
    return a
  })

  return NextResponse.json(atualizado)
})

export const DELETE = rotaApi(async (_: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const { existente, userId } = await notaDoUsuario(id)

  // O histórico tem cascade a partir da Nota, então gravar antes de apagar não
  // preserva nada — mantido o comportamento original (registra e apaga).
  await prisma.$transaction([
    prisma.historicoNota.create({
      data: {
        notaId: id,
        alteradoPorId: userId,
        tipo: "exclusao",
        valorAnterior: String(existente.nota),
        disciplina: existente.disciplina,
        avaliacao: existente.avaliacao,
      },
    }),
    prisma.nota.delete({ where: { id } }),
  ])

  return NextResponse.json({ ok: true })
})
