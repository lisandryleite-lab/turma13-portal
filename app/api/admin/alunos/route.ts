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

export const GET = rotaApi(async () => {
  await exigirAdmin()
  const alunos = await prisma.user.findMany({
    orderBy: { matricula: "asc" },
    select: {
      id: true, matricula: true, nomeGuerra: true, nomeCompleto: true,
      email: true, isAdmin: true, aniversario: true, canga: true,
      grupoPlantao: true, grupoFaxina: true,
    },
  })
  return NextResponse.json(alunos)
})

const CriarAluno = z.object({
  matricula: zMatricula,
  nomeGuerra: z.string().trim().min(1, "obrigatório"),
  nomeCompleto: z.string().trim().min(1, "obrigatório"),
  email: z.string().trim().email("e-mail inválido"),
  password: z.string().min(4, "mínimo 4 caracteres"),
  aniversario: z.string().nullish(),
  canga: z.string().nullish(),
  grupoPlantao: z.string().nullish(),
  grupoFaxina: z.string().nullish(),
})

export const POST = rotaApi(async (req: NextRequest) => {
  await exigirAdmin()
  const { password, ...dados } = await lerCorpo(req, CriarAluno)

  const hash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({ data: { ...dados, password: hash } })
  return NextResponse.json({ id: user.id })
})
