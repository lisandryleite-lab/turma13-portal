import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAcesso } from "@/lib/log"
import { rotaApi, lerCorpo, proibido, ErroHttp, z } from "@/lib/api"

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

// Só o envelope é validado. A lista de questões segue tolerante de propósito:
// questão ruim entra em `erros[]` e o resto do pacote passa.
const Pacote = z.object({
  materia: z.string().trim().min(1, "informe a matéria (sigla)"),
  modulo: z.union([z.string(), z.number(), z.null()]).optional(),
  questoes: z.array(z.unknown()).optional(),
})
const CorpoImport = z.union([Pacote, z.array(Pacote)])

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const body = await lerCorpo(req, CorpoImport)

  // Aceita um pacote único {materia,modulo,questoes} OU um array de pacotes.
  if (Array.isArray(body)) {
    const resultados: Array<{ materia?: string; modulo?: string; criadas: number; atualizadas: number }> = []
    let criadas = 0, atualizadas = 0
    const erros: string[] = []
    for (const [idx, pacote] of body.entries()) {
      const r = await importarPacote(pacote)
      if (r.error) { erros.push(`Pacote ${idx + 1}: ${r.error}`); continue }
      criadas += r.criadas; atualizadas += r.atualizadas
      if (r.erros?.length) erros.push(...r.erros.map(e => `Pacote ${idx + 1} (${r.materia}/${r.modulo}): ${e}`))
      resultados.push({ materia: r.materia, modulo: r.modulo, criadas: r.criadas, atualizadas: r.atualizadas })
    }
    await logAcesso(session.user, "questoes/import", `lote de ${body.length} pacotes: +${criadas} novas, ${atualizadas} atualizadas`)
    return NextResponse.json({ pacotes: resultados, criadas, atualizadas, erros })
  }

  const r = await importarPacote(body)
  if (r.error) throw new ErroHttp(400, r.error)
  await logAcesso(session.user, "questoes/import", `${r.materia}${r.modulo ? "/" + r.modulo : ""}: +${r.criadas} novas, ${r.atualizadas} atualizadas`)
  return NextResponse.json({ materia: r.materia, modulo: r.modulo, criadas: r.criadas, atualizadas: r.atualizadas, totalMateria: r.totalMateria, erros: r.erros })
})

type ImportResult = {
  error?: string
  materia?: string
  modulo?: string
  criadas: number
  atualizadas: number
  totalMateria?: number
  erros?: string[]
}

async function importarPacote(body: { materia: string; modulo?: string | number | null; questoes?: unknown[] }): Promise<ImportResult> {
  const materia = String(body?.materia || "").trim().toUpperCase()
  const modulo = body?.modulo != null ? String(body.modulo).trim() : ""
  const questoes = (Array.isArray(body?.questoes) ? body.questoes : []) as QIn[]

  if (!materia) return { error: "Informe a matéria (sigla).", criadas: 0, atualizadas: 0 }
  if (questoes.length === 0) return { error: "Nenhuma questão no pacote.", criadas: 0, atualizadas: 0 }

  // Valida que a matéria existe (entre as 52 disciplinas)
  const disc = await prisma.disciplina.findUnique({ where: { sigla: materia } })
  if (!disc) return { error: `Matéria "${materia}" não existe nas disciplinas.`, criadas: 0, atualizadas: 0 }

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
      if (existe) atualizadas++; else criadas++
    } catch (e) {
      erros.push(`Questão ${i + 1}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const total = await prisma.questao.count({ where: { materia } })
  return { materia, modulo, criadas, atualizadas, totalMateria: total, erros }
}

// Limpar questões de uma matéria (e opcionalmente de um módulo). Admin.
export const DELETE = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user?.isAdmin) throw proibido()

  const sp = req.nextUrl.searchParams
  const materia = (sp.get("materia") || "").toUpperCase()
  if (!materia) throw new ErroHttp(400, "Informe a matéria.")

  const where: { materia: string; modulo?: string } = { materia }
  if (sp.has("modulo")) where.modulo = sp.get("modulo") || ""

  const r = await prisma.questao.deleteMany({ where }) // respostas em cascata
  await logAcesso(session.user, "questoes/limpar", `removeu ${r.count} questões de ${materia}${sp.has("modulo") ? "/" + (sp.get("modulo") || "(sem módulo)") : ""}`)
  return NextResponse.json({ removidas: r.count })
})
