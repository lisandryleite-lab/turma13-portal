import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rotaApi, lerCorpo, proibido, ErroHttp, z, zSemana } from "@/lib/api"

export const GET = rotaApi(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const semana = Number(searchParams.get("semana") || 0)

  const [servico, faxinas, plantoes] = await Promise.all([
    prisma.escalaServico.findUnique({ where: { semana } }),
    prisma.escalaFaxina.findMany({ where: { semana } }),
    prisma.escalaPlantao.findMany({ where: { semana } }),
  ])
  return NextResponse.json({ servico, faxinas, plantoes })
})

// `tipo` escolhe a tabela, e cada uma tem campos próprios. Antes o resto do
// corpo era espalhado direto no create/upsert — campo a mais ou a menos virava
// 500 do Prisma. Só a UI de "servico" está viva hoje; as outras duas ficam
// aceitas para não quebrar nenhum cliente antigo.
const zMat = z.coerce.number().int().nullish()
const SalvarEscala = z.discriminatedUnion("tipo", [
  z.object({
    tipo: z.literal("servico"),
    semana: zSemana,
    subXerife: zMat,
    p1: zMat,
    p3: zMat,
    p4: zMat,
  }),
  z.object({
    tipo: z.literal("faxina"),
    semana: zSemana,
    grupo: z.string().trim().min(1, "obrigatório"),
    local: z.string().trim().min(1, "obrigatório"),
  }),
  z.object({
    tipo: z.literal("plantao"),
    semana: zSemana,
    grupo: z.string().trim().min(1, "obrigatório"),
    // `tipo` já é o discriminador do corpo, então o tipo do plantão (a coluna
    // EscalaPlantao.tipo) vem noutro nome. Antes o campo se perdia na
    // desestruturação e o create quebrava — o ramo nunca funcionou.
    tipoPlantao: z.string().trim().min(1, "obrigatório"),
  }),
])

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const corpo = await lerCorpo(req, SalvarEscala)

  if (corpo.tipo === "servico") {
    const dados = {
      subXerife: corpo.subXerife ?? null,
      p1: corpo.p1 ?? null,
      p3: corpo.p3 ?? null,
      p4: corpo.p4 ?? null,
    }
    await prisma.escalaServico.upsert({
      where: { semana: corpo.semana },
      update: dados,
      create: { semana: corpo.semana, ...dados },
    })
  } else if (corpo.tipo === "faxina") {
    await prisma.escalaFaxina.create({
      data: { semana: corpo.semana, grupo: corpo.grupo, local: corpo.local },
    })
  } else {
    await prisma.escalaPlantao.create({
      data: { semana: corpo.semana, grupo: corpo.grupo, tipo: corpo.tipoPlantao },
    })
  }

  return NextResponse.json({ ok: true })
})

const ApagarEscala = z.object({
  tipo: z.string().trim().min(1, "obrigatório"),
  semana: zSemana,
})

export const DELETE = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const { tipo, semana } = await lerCorpo(req, ApagarEscala)
  if (tipo !== "servico") throw new ErroHttp(400, `Tipo "${tipo}" não pode ser apagado por aqui`)

  await prisma.escalaServico.deleteMany({ where: { semana } })
  return NextResponse.json({ ok: true })
})
