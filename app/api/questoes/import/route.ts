import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAcesso } from "@/lib/log"

// Importação em lote de questões (Admin). Idempotente: upsert por hash
// = sha1(materia|modulo|enunciado). Re-importar atualiza, não duplica.
// Preserva as respostas dos alunos (não deleta questões existentes).

type QIn = {
  tipo?: string
  contexto?: string
  enunciado?: string
  alternativas?: { id: string; texto: string }[]
  gabarito?: string
  explicacao?: string
  modelo?: { estrutura?: string; criterios?: string[]; resposta?: string }
  fonte?: string
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin)
    return NextResponse.json({ error: "Apenas administradores." }, { status: 403 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 })
  }

  const materia = String(body.materia || "").trim().toUpperCase()
  const modulo = body.modulo != null ? String(body.modulo).trim() : ""
  const questoes: QIn[] = Array.isArray(body.questoes) ? body.questoes : []

  if (!materia) return NextResponse.json({ error: "Informe a matéria (sigla)." }, { status: 400 })
  if (questoes.length === 0) return NextResponse.json({ error: "Nenhuma questão no pacote." }, { status: 400 })

  // Valida que a matéria existe (entre as 52 disciplinas)
  const disc = await prisma.disciplina.findUnique({ where: { sigla: materia } })
  if (!disc) return NextResponse.json({ error: `Matéria "${materia}" não existe nas disciplinas.` }, { status: 400 })

  let criadas = 0, atualizadas = 0
  const erros: string[] = []

  for (const [i, q] of questoes.entries()) {
    const tipo = ["certo_errado", "dissertativa"].includes(q.tipo || "") ? q.tipo! : "multipla"
    const enunciado = String(q.enunciado || "").trim()
    const gabarito = String(q.gabarito || "").trim()
    if (!enunciado) { erros.push(`Questão ${i + 1}: enunciado ausente.`); continue }

    const alternativas = tipo === "multipla" ? (q.alternativas || []) : []
    if (tipo === "multipla" && alternativas.length < 2) { erros.push(`Questão ${i + 1}: múltipla escolha precisa de ≥2 alternativas.`); continue }
    if (tipo !== "dissertativa" && !gabarito) { erros.push(`Questão ${i + 1}: gabarito ausente.`); continue }
    if (tipo === "dissertativa" && !q.modelo?.resposta) { erros.push(`Questão ${i + 1}: dissertativa sem modelo de resposta.`); continue }

    const hash = createHash("sha1").update(`${materia}|${modulo}|${enunciado}`).digest("hex")
    const dados = {
      materia, modulo, tipo,
      contexto: q.contexto?.trim() || null,
      enunciado,
      alternativas: alternativas as any,
      gabarito,
      explicacao: q.explicacao?.trim() || null,
      modelo: tipo === "dissertativa" ? (q.modelo as any) : undefined,
      fonte: q.fonte?.trim() || null,
    }
    try {
      const existe = await prisma.questao.findUnique({ where: { hash } })
      await prisma.questao.upsert({ where: { hash }, update: dados, create: { ...dados, hash } })
      existe ? atualizadas++ : criadas++
    } catch (e: any) {
      erros.push(`Questão ${i + 1}: ${e?.message || e}`)
    }
  }

  const total = await prisma.questao.count({ where: { materia } })
  await logAcesso(session.user as any, "questoes/import", `${materia}${modulo ? "/" + modulo : ""}: +${criadas} novas, ${atualizadas} atualizadas`)
  return NextResponse.json({ materia, modulo, criadas, atualizadas, totalMateria: total, erros })
}

// Limpar questões de uma matéria (e opcionalmente de um módulo). Admin.
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Apenas administradores." }, { status: 403 })

  const sp = req.nextUrl.searchParams
  const materia = (sp.get("materia") || "").toUpperCase()
  if (!materia) return NextResponse.json({ error: "Informe a matéria." }, { status: 400 })

  const where: { materia: string; modulo?: string } = { materia }
  if (sp.has("modulo")) where.modulo = sp.get("modulo") || ""

  const r = await prisma.questao.deleteMany({ where }) // respostas em cascata
  await logAcesso(session.user as any, "questoes/limpar", `removeu ${r.count} questões de ${materia}${sp.has("modulo") ? "/" + (sp.get("modulo") || "(sem módulo)") : ""}`)
  return NextResponse.json({ removidas: r.count })
}
