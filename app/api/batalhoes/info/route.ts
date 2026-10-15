import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, proibido, z } from "@/lib/api"

// Ficha padrão "Conheça o batalhão" — edição só pelo admin.
const campo = z.string().trim().max(3000).optional().transform(v => (v ? v : null))
const url = z.string().trim().max(500).refine(v => /^https:\/\//.test(v), "links devem começar com https://")
const curto = z.string().trim().max(300)
const SalvarFicha = z.object({
  sigla: z.string().trim().min(1),
  comandante: campo, subcomandante: campo, efetivo: campo, cpm: campo, estrutura: campo,
  endereco: campo, referenciaMapa: campo,
  streetView: z.string().trim().max(1000).optional().transform(v => (v ? v : null))
    .refine(v => v === null || /^https:\/\//.test(v), "o link do Street View deve começar com https://"), telefone: campo, email: campo,
  area: campo, sobreArea: campo, vagas: campo, morarPerto: campo, distanciaBR: campo, dicas: campo,
  linkGrupo: z.string().trim().max(500).optional().transform(v => (v ? v : null))
    .refine(v => v === null || /^https:\/\//.test(v), "o link do grupo deve começar com https://"),
  bairros: z.array(z.object({ nome: curto.min(1), km: curto, tempo: curto, obs: curto.optional() })).max(30),
  links: z.array(z.object({ rotulo: curto.min(1), url, grupo: curto.optional() })).max(40),
  operacoes: z.array(z.object({ titulo: curto.min(1), data: curto, resumo: z.string().trim().max(1000), foto: url.optional(), fonte: curto, url: url.optional() })).max(30),
  fontes: z.array(z.object({ info: curto.min(1), rotulo: curto, url: url.optional() })).max(40),
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
