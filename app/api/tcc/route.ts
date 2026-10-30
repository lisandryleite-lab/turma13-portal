import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, naoAutorizado, proibido, naoEncontrado, ErroHttp, z } from "@/lib/api"
import { DUPLAS_TCC } from "@/lib/tcc"
import { garantirTabelaTcc } from "@/lib/tcc-db"

// Status do envio do TCC (página pública /tcc).
//   declarar / desfazer-declaracao → membro da dupla ou admin
//   confirmar / desfazer-confirmacao → só admin (conferiu a pasta do Drive)
const Acao = z.object({
  dupla: z.number().int().positive(),
  acao: z.enum(["declarar", "desfazer-declaracao", "confirmar", "desfazer-confirmacao"]),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session) throw naoAutorizado()

  const { dupla, acao } = await lerCorpo(req, Acao)
  const d = DUPLAS_TCC.find((x) => x.n === dupla)
  if (!d) throw naoEncontrado("Dupla")

  const { matricula, isAdmin } = session.user
  const ehMembro = d.alunos.some((a) => a.mat === matricula)
  if (!isAdmin && !ehMembro) throw proibido()
  if (!isAdmin && (acao === "confirmar" || acao === "desfazer-confirmacao")) throw proibido()

  await garantirTabelaTcc()
  const atual = await prisma.tccEnvio.findUnique({ where: { dupla } })
  if (!isAdmin && acao === "desfazer-declaracao" && atual?.confirmadoEm) {
    throw new ErroHttp(409, "O recebimento já foi confirmado. Fale com a administração.")
  }

  const agora = new Date()
  const dados =
    acao === "declarar" ? { declaradoEm: agora, declaradoPor: matricula }
    : acao === "desfazer-declaracao" ? { declaradoEm: null, declaradoPor: null }
    : acao === "confirmar" ? { confirmadoEm: agora, confirmadoPor: matricula }
    : { confirmadoEm: null, confirmadoPor: null }

  const r = await prisma.tccEnvio.upsert({
    where: { dupla },
    update: dados,
    create: { dupla, ...dados },
  })
  return NextResponse.json(r)
})
