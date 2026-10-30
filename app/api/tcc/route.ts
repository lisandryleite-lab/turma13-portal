import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, naoAutorizado, proibido, naoEncontrado, z } from "@/lib/api"
import { DUPLAS_TCC } from "@/lib/tcc"
import { garantirTabelaTcc } from "@/lib/tcc-db"

// Status do envio do TCC (página pública /tcc): a própria dupla marca
// "enviado" ou desfaz. Admin pode corrigir qualquer dupla.
const Acao = z.object({
  dupla: z.number().int().positive(),
  acao: z.enum(["enviado", "desfazer"]),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session) throw naoAutorizado()

  const { dupla, acao } = await lerCorpo(req, Acao)
  const d = DUPLAS_TCC.find((x) => x.n === dupla)
  if (!d) throw naoEncontrado("Dupla")

  const { matricula, isAdmin } = session.user
  if (!isAdmin && !d.alunos.some((a) => a.mat === matricula)) throw proibido()

  await garantirTabelaTcc()
  const dados = acao === "enviado"
    ? { declaradoEm: new Date(), declaradoPor: matricula }
    : { declaradoEm: null, declaradoPor: null }

  const r = await prisma.tccEnvio.upsert({
    where: { dupla },
    update: dados,
    create: { dupla, ...dados },
  })
  return NextResponse.json(r)
})
