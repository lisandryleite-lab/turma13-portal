import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Preferência de OPM do próprio aluno (1ª/2ª/3ª opção). Cada aluno só altera a sua.

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  const userId = session.user.id!

  const body = await req.json()
  const opcao1Id = String(body.opcao1Id || "")
  let opcao2Id: string | null = body.opcao2Id ? String(body.opcao2Id) : null
  let opcao3Id: string | null = body.opcao3Id ? String(body.opcao3Id) : null

  if (!opcao1Id) return NextResponse.json({ error: "Escolha ao menos a 1ª opção." }, { status: 400 })

  // Valida que os ids existem
  const ids = [opcao1Id, opcao2Id, opcao3Id].filter(Boolean) as string[]
  const opms = await prisma.oPM.findMany({ where: { id: { in: ids } } })
  if (!opms.find(o => o.id === opcao1Id))
    return NextResponse.json({ error: "OPM inválida." }, { status: 400 })

  const opcao1 = opms.find(o => o.id === opcao1Id)!
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
}
