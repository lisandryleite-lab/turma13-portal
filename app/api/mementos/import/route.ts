import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAcesso } from "@/lib/log"
import { rotaApi, lerCorpo, proibido, ErroHttp, z } from "@/lib/api"

// Flashcards foram descontinuados: a tabela fica no banco, mas o portal não
// grava nem lê mais nada nela.
const ImportarMemento = z.object({
  materia: z.string().trim().min(1, "informe a matéria (sigla)").transform(s => s.toUpperCase()),
  modulo: z.string().nullish(),
  memento: z.object({
    titulo: z.string().trim().min(1),
    conteudoMd: z.string().min(1),
    ordem: z.coerce.number().optional(),
  }),
})

// Importa o memento (Markdown) de uma matéria (Admin). Idempotente.
export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const body = await lerCorpo(req, ImportarMemento)
  const materia = body.materia
  const modulo = body.modulo != null ? String(body.modulo).trim() : ""

  const disc = await prisma.disciplina.findUnique({ where: { sigla: materia } })
  if (!disc) throw new ErroHttp(400, `Matéria "${materia}" não existe nas disciplinas.`)

  const titulo = body.memento.titulo
  const ordem = Number(body.memento.ordem) || 0
  await prisma.memento.upsert({
    where: { materia_modulo_titulo: { materia, modulo, titulo } },
    update: { conteudoMd: body.memento.conteudoMd, ordem },
    create: { materia, modulo, titulo, conteudoMd: body.memento.conteudoMd, ordem },
  })
  const mementoMsg = `memento "${titulo}" salvo`

  await logAcesso(session.user, "mementos/import", `${materia}${modulo ? "/" + modulo : ""}: ${mementoMsg}`)
  return NextResponse.json({ materia, modulo, mementoMsg })
})

// Remove os mementos de uma matéria (e opcionalmente de um módulo). Admin.
export const DELETE = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const sp = req.nextUrl.searchParams
  const materia = (sp.get("materia") || "").toUpperCase()
  if (!materia) throw new ErroHttp(400, "Informe a matéria.")

  const where: { materia: string; modulo?: string } = { materia }
  if (sp.has("modulo")) where.modulo = sp.get("modulo") || ""

  const m = await prisma.memento.deleteMany({ where })
  await logAcesso(session.user, "mementos/limpar", `removeu ${m.count} mementos de ${materia}${sp.has("modulo") ? "/" + (sp.get("modulo") || "(sem módulo)") : ""}`)
  return NextResponse.json({ mementos: m.count })
})
