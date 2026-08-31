import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAcesso } from "@/lib/log"
import { rotaApi, lerCorpo, proibido, ErroHttp, z } from "@/lib/api"

// Só o envelope é validado aqui. A lista de flashcards continua tolerante de
// propósito: card ruim entra em `erros[]` e o resto do lote passa.
const ImportarMemento = z.object({
  materia: z.string().trim().min(1, "informe a matéria (sigla)").transform(s => s.toUpperCase()),
  modulo: z.string().nullish(),
  memento: z.object({
    titulo: z.string().trim().min(1),
    conteudoMd: z.string().min(1),
    ordem: z.coerce.number().optional(),
  }).nullish(),
  flashcards: z.array(z.object({
    frente: z.string().optional(),
    verso: z.string().optional(),
    ordem: z.coerce.number().optional(),
  })).optional(),
})

// Importa memento (Markdown) e/ou flashcards de uma matéria (Admin). Idempotente.
export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const body = await lerCorpo(req, ImportarMemento)
  const materia = body.materia
  const modulo = body.modulo != null ? String(body.modulo).trim() : ""

  const disc = await prisma.disciplina.findUnique({ where: { sigla: materia } })
  if (!disc) throw new ErroHttp(400, `Matéria "${materia}" não existe nas disciplinas.`)

  let mementoMsg = "", criadosCards = 0, atualizadosCards = 0
  const erros: string[] = []

  // Memento
  if (body.memento && body.memento.titulo && body.memento.conteudoMd) {
    const titulo = String(body.memento.titulo).trim()
    await prisma.memento.upsert({
      where: { materia_modulo_titulo: { materia, modulo, titulo } },
      update: { conteudoMd: String(body.memento.conteudoMd), ordem: Number(body.memento.ordem) || 0 },
      create: { materia, modulo, titulo, conteudoMd: String(body.memento.conteudoMd), ordem: Number(body.memento.ordem) || 0 },
    })
    mementoMsg = `memento "${titulo}" salvo`
  }

  // Flashcards
  const cards = body.flashcards ?? []
  for (const [i, c] of cards.entries()) {
    const frente = String(c.frente || "").trim()
    const verso = String(c.verso || "").trim()
    if (!frente || !verso) { erros.push(`Card ${i + 1}: frente/verso ausente.`); continue }
    const hash = createHash("sha1").update(`${materia}|${modulo}|${frente}`).digest("hex")
    try {
      const existe = await prisma.flashcard.findUnique({ where: { hash } })
      await prisma.flashcard.upsert({
        where: { hash },
        update: { verso, ordem: Number(c.ordem) || 0 },
        create: { materia, modulo, frente, verso, ordem: Number(c.ordem) || 0, hash },
      })
      if (existe) atualizadosCards++; else criadosCards++
    } catch (e) { erros.push(`Card ${i + 1}: ${e instanceof Error ? e.message : String(e)}`) }
  }

  await logAcesso(session.user, "mementos/import", `${materia}${modulo ? "/" + modulo : ""}: ${mementoMsg || "sem memento"}; cards +${criadosCards}/${atualizadosCards}`)
  return NextResponse.json({ materia, modulo, mementoMsg, criadosCards, atualizadosCards, erros })
})

// Remove mementos e flashcards de uma matéria (e opcionalmente de um módulo). Admin.
export const DELETE = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const sp = req.nextUrl.searchParams
  const materia = (sp.get("materia") || "").toUpperCase()
  if (!materia) throw new ErroHttp(400, "Informe a matéria.")

  const where: { materia: string; modulo?: string } = { materia }
  if (sp.has("modulo")) where.modulo = sp.get("modulo") || ""

  const [m, f] = await Promise.all([
    prisma.memento.deleteMany({ where }),
    prisma.flashcard.deleteMany({ where }),
  ])
  await logAcesso(session.user, "mementos/limpar", `removeu ${m.count} mementos e ${f.count} cards de ${materia}${sp.has("modulo") ? "/" + (sp.get("modulo") || "(sem módulo)") : ""}`)
  return NextResponse.json({ mementos: m.count, flashcards: f.count })
})
