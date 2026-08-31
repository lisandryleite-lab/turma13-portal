import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ehGestorFinanceiro } from "@/lib/financeiro"
import { rotaApi, lerCorpo, naoAutorizado, proibido, z, zId } from "@/lib/api"
import type { Session } from "next-auth"

const zValor = z.coerce.number().refine(Number.isFinite, "valor inválido")
const zPrazo = z.string().nullish().refine(
  (s) => s == null || s === "" || !Number.isNaN(Date.parse(s)), "prazo inválido",
)

const CriarCota = z.object({
  titulo: z.string().trim().min(1, "obrigatório"),
  tipo: z.string().nullish(),
  valor: zValor,
  responsavel: z.string().nullish(),
  instrucoes: z.string().nullish(),
  driveFolderUrl: z.string().nullish(),
  formulario: z.unknown().optional(),
  prazo: zPrazo,
  participantes: z.array(zId).optional(),
})

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()

  // Criar cota: gestor financeiro OU qualquer membro da Turma 13.
  let autorizado = ehGestorFinanceiro(session)
  if (!autorizado) {
    const eu = await prisma.user.findUnique({ where: { id: session.user.id }, select: { turma13: true } })
    autorizado = !!eu?.turma13
  }
  if (!autorizado) throw proibido()

  const c = await lerCorpo(req, CriarCota)

  // participantes: lista opcional de ids de User — se omitida, vale para todos os ativos da Turma 13
  const alunos = c.participantes && c.participantes.length > 0
    ? await prisma.user.findMany({ where: { id: { in: c.participantes } }, select: { id: true } })
    : await prisma.user.findMany({ where: { ativo: true, turma13: true }, select: { id: true } })

  const cota = await prisma.cotaFinanceira.create({
    data: {
      titulo: c.titulo,
      tipo: c.tipo === "extra" ? "extra" : "mensal",
      valor: c.valor,
      responsavel: c.responsavel || "",
      instrucoes: c.instrucoes || null,
      driveFolderUrl: c.driveFolderUrl || null,
      formulario: (c.formulario ?? undefined) as never,
      prazo: c.prazo ? new Date(c.prazo) : null,
      criadoPorId: session.user.id,
      pagamentos: { create: alunos.map(a => ({ userId: a.id })) },
    },
  })
  return NextResponse.json(cota)
})

// Pode gerir a cota (editar/encerrar/excluir): gestor OU quem a criou.
async function exigirGestaoDaCota(session: Session | null, id: string) {
  if (ehGestorFinanceiro(session)) return
  if (!session?.user) throw naoAutorizado()
  const cota = await prisma.cotaFinanceira.findUnique({ where: { id }, select: { criadoPorId: true } })
  if (!cota || cota.criadoPorId !== session.user.id) throw proibido()
}

const AtualizarCota = z.object({
  id: zId,
  titulo: z.string().trim().min(1).optional(),
  tipo: z.string().optional(),
  valor: zValor.optional(),
  responsavel: z.string().optional(),
  instrucoes: z.string().nullish(),
  driveFolderUrl: z.string().nullish(),
  prazo: zPrazo,
  ativa: z.boolean().optional(),
})

export const PATCH = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  const { id, ...c } = await lerCorpo(req, AtualizarCota)
  await exigirGestaoDaCota(session, id)

  const cota = await prisma.cotaFinanceira.update({
    where: { id },
    data: {
      ...(c.titulo !== undefined && { titulo: c.titulo }),
      ...(c.tipo !== undefined && { tipo: c.tipo === "extra" ? "extra" : "mensal" }),
      ...(c.valor !== undefined && { valor: c.valor }),
      ...(c.responsavel !== undefined && { responsavel: c.responsavel }),
      ...(c.instrucoes !== undefined && { instrucoes: c.instrucoes }),
      ...(c.driveFolderUrl !== undefined && { driveFolderUrl: c.driveFolderUrl || null }),
      ...(c.prazo !== undefined && { prazo: c.prazo ? new Date(c.prazo) : null }),
      ...(c.ativa !== undefined && { ativa: c.ativa }),
    },
  })
  return NextResponse.json(cota)
})

export const DELETE = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  const { id } = await lerCorpo(req, z.object({ id: zId }))
  await exigirGestaoDaCota(session, id)

  await prisma.cotaFinanceira.delete({ where: { id } })
  return NextResponse.json({ ok: true })
})
