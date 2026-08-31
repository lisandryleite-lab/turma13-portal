import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { rotaApi, lerCorpo, proibido, z, zMatricula } from "@/lib/api"

async function exigirAdmin() {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()
  return session
}

// Antes o corpo era espalhado direto no `update` (`data: { ...rest }`), então
// qualquer coluna do User era gravável pela requisição — isAdmin e turma13
// inclusive. Aqui a lista é fechada: o que não estiver abaixo é ignorado.
const AtualizarAluno = z.object({
  matricula: zMatricula.optional(),
  nomeGuerra: z.string().trim().min(1).optional(),
  nomeCompleto: z.string().trim().min(1).optional(),
  email: z.string().trim().email("e-mail inválido").optional(),
  password: z.string().min(4, "mínimo 4 caracteres").optional().or(z.literal("")),
  aniversario: z.string().nullish(),
  canga: z.string().nullish(),
  cangaPar: z.union([zMatricula, z.literal(""), z.null()]).optional(),
  grupoPlantao: z.string().nullish(),
  grupoFaxina: z.string().nullish(),
  alojamento: z.string().nullish(),
  isAdmin: z.boolean().optional(),
  financeiroAdmin: z.boolean().optional(),
  turma: z.coerce.number().int().nullish(),
  turma13: z.boolean().optional(),
  ativo: z.boolean().optional(),
  nfdc: z.coerce.number().optional(),
})

export const PUT = rotaApi(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  await exigirAdmin()
  const { id } = await params
  const { password, cangaPar, ...rest } = await lerCorpo(req, AtualizarAluno)

  const data: Record<string, unknown> = { ...rest }
  if (cangaPar !== undefined) data.cangaPar = cangaPar === "" || cangaPar === null ? null : cangaPar
  if (password) data.password = await bcrypt.hash(password, 12)

  await prisma.user.update({ where: { id }, data })
  return NextResponse.json({ ok: true })
})

export const DELETE = rotaApi(async (_: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  await exigirAdmin()
  const { id } = await params
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
})
