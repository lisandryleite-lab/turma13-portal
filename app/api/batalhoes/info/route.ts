import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, proibido, z } from "@/lib/api"

// Ficha "Conheça o batalhão" — edição só pelo admin.
const campo = z.string().trim().max(3000).optional().transform(v => (v ? v : null))
const SalvarFicha = z.object({
  sigla: z.string().trim().min(1),
  comandante: campo, subcomandante: campo, efetivo: campo, cpm: campo, sede: campo,
  endereco: campo, telefone: campo, email: campo, area: campo, sobreArea: campo,
  morarPerto: campo, distanciaBR: campo,
  linkGrupo: z.string().trim().max(500).optional().transform(v => (v ? v : null))
    .refine(v => v === null || /^https:\/\//.test(v), "o link do grupo deve começar com https://"),
})

export const PATCH = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()
  const { sigla, ...dados } = await lerCorpo(req, SalvarFicha)
  const opm = await prisma.oPM.findUnique({ where: { sigla } })
  if (!opm) return NextResponse.json({ error: "Batalhão não encontrado." }, { status: 404 })
  const info = await prisma.opmInfo.upsert({
    where: { opmId: opm.id },
    update: { ...dados, atualizadoPor: session.user.nomeGuerra },
    create: { opmId: opm.id, ...dados, atualizadoPor: session.user.nomeGuerra },
  })
  return NextResponse.json({ ok: true, atualizadoEm: info.atualizadoEm })
})
