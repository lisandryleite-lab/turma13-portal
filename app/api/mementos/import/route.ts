import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Importa memento (Markdown) e/ou flashcards de uma matéria (Admin). Idempotente.
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 })

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }) }

  const materia = String(body.materia || "").trim().toUpperCase()
  const modulo = body.modulo != null ? String(body.modulo).trim() : ""
  if (!materia) return NextResponse.json({ error: "Informe a matéria (sigla)." }, { status: 400 })

  const disc = await prisma.disciplina.findUnique({ where: { sigla: materia } })
  if (!disc) return NextResponse.json({ error: `Matéria "${materia}" não existe nas disciplinas.` }, { status: 400 })

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
  const cards = Array.isArray(body.flashcards) ? body.flashcards : []
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
      existe ? atualizadosCards++ : criadosCards++
    } catch (e: any) { erros.push(`Card ${i + 1}: ${e?.message || e}`) }
  }

  return NextResponse.json({ materia, modulo, mementoMsg, criadosCards, atualizadosCards, erros })
}
