import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, proibido, z, zMatricula } from "@/lib/api"

// Edição de cadastro pelo Controle de Tropa — só admin.
const EditarAluno = z.object({
  matricula: zMatricula,
  nomeGuerra: z.string().trim().min(1, "nome de guerra obrigatório").max(60),
  nomeCompleto: z.string().trim().min(1, "nome completo obrigatório").max(160),
  pelotao: z.number().int().min(1).max(7).nullable(),
  ativo: z.boolean(),
  aniversario: z.string().trim().regex(/^\d{2}\/\d{2}$/, "aniversário no formato dd/mm").nullable(),
})

export const PATCH = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const b = await lerCorpo(req, EditarAluno)
  const aluno = await prisma.user.update({
    where: { matricula: b.matricula },
    data: {
      nomeGuerra: b.nomeGuerra.toUpperCase(),
      nomeCompleto: b.nomeCompleto,
      pelotao: b.pelotao,
      ativo: b.ativo,
      aniversario: b.aniversario,
    },
    select: { matricula: true, nomeGuerra: true, pelotao: true, ativo: true },
  })
  return NextResponse.json(aluno)
})
