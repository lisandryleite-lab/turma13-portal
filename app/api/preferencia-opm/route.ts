import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, naoAutorizado, ErroHttp, z, zId } from "@/lib/api"

// Preferência de OPM do próprio aluno (1ª/2ª/3ª opção). Cada aluno só altera a sua.
const SalvarPreferencia = z.object({
  opcao1Id: zId,
  opcao2Id: z.string().nullish(),
  opcao3Id: z.string().nullish(),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()
  const userId = session.user.id!

  const body = await lerCorpo(req, SalvarPreferencia)
  const opcao1Id = body.opcao1Id
  let opcao2Id: string | null = body.opcao2Id || null
  let opcao3Id: string | null = body.opcao3Id || null

  // Valida que os ids existem
  const ids = [opcao1Id, opcao2Id, opcao3Id].filter(Boolean) as string[]
  const opms = await prisma.oPM.findMany({ where: { id: { in: ids } } })
  const opcao1 = opms.find(o => o.id === opcao1Id)
  if (!opcao1) throw new ErroHttp(400, "OPM inválida.")

  // Se 1ª opção é "não decidiu", zera as demais
  if (opcao1.especial) {
    opcao2Id = null
    opcao3Id = null
  }
  // Não permite repetir a mesma OPM
  if (opcao2Id && opcao2Id === opcao1Id) opcao2Id = null
  if (opcao3Id && (opcao3Id === opcao1Id || opcao3Id === opcao2Id)) opcao3Id = null

  const pref = await prisma.preferenciaOPM.upsert({
    where: { userId },
    update: { opcao1Id, opcao2Id, opcao3Id },
    create: { userId, opcao1Id, opcao2Id, opcao3Id },
  })

  return NextResponse.json(pref)
})
