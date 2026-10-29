import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/lib/generated/prisma/client"
import { rotaApi, naoAutorizado } from "@/lib/api"

/** Fisher-Yates. `sort(() => Math.random() - 0.5)` não embaralha uniforme. */
function embaralhar<T>(itens: T[]): T[] {
  const a = [...itens]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Sem matéria escolhida, a busca percorre o banco inteiro: limita o lote.
const LIMITE_SEM_MATERIA = 300

/**
 * Filtros (estilo QConcursos), todos combináveis:
 *   materia  — sigla (opcional; vazio = todas as disciplinas)
 *   modulo   — assunto; pode repetir (?modulo=1&modulo=3). "" = sem módulo
 *   tipo     — certo_errado | multipla | dissertativa  (objetivas=1: tudo menos dissertativa)
 *   q        — texto no enunciado/contexto
 *   status   — nao_respondidas | respondidas | acertei | errei (pela última resposta do aluno)
 *   excluirRespondidas=1 — tira as que o aluno já respondeu (prevalece sobre `status`)
 *   count=1  — devolve só { total }
 */
async function filtro(sp: URLSearchParams, userId: string): Promise<Prisma.QuestaoWhereInput> {
  const where: Prisma.QuestaoWhereInput = {}
  const materia = (sp.get("materia") || "").toUpperCase()
  if (materia) where.materia = materia
  if (sp.has("modulo")) where.modulo = { in: sp.getAll("modulo") }
  if (sp.get("tipo")) where.tipo = sp.get("tipo")!
  else if (sp.get("objetivas") === "1") where.tipo = { not: "dissertativa" }   // simulado

  const q = (sp.get("q") || "").trim()
  if (q) where.OR = [
    { enunciado: { contains: q, mode: "insensitive" } },
    { contexto: { contains: q, mode: "insensitive" } },
  ]

  const status = sp.get("excluirRespondidas") === "1" ? "nao_respondidas" : sp.get("status") || ""
  if (status === "nao_respondidas") where.respostas = { none: { userId } }
  else if (status === "respondidas") where.respostas = { some: { userId } }
  else if (status === "acertei" || status === "errei") {
    // vale a resposta mais recente de cada questão
    const resps = await prisma.resposta.findMany({
      where: { userId, ...(materia ? { questao: { materia } } : {}) },
      select: { questaoId: true, acertou: true },
      orderBy: { data: "asc" },
    })
    const ultima = new Map(resps.map(r => [r.questaoId, r.acertou]))
    const querAcerto = status === "acertei"
    where.id = { in: [...ultima].filter(([, ok]) => ok === querAcerto).map(([id]) => id) }
  }
  return where
}

// Lista questões (para Resolver/Simulado) ou conta as que batem com os filtros.
export const GET = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()

  const sp = req.nextUrl.searchParams
  const where = await filtro(sp, session.user.id!)

  if (sp.get("count") === "1") return NextResponse.json({ total: await prisma.questao.count({ where }) })

  const shuffle = sp.get("shuffle") === "1"
  let limit = Number(sp.get("limit")) || 0
  if (!where.materia && (!limit || limit > LIMITE_SEM_MATERIA)) limit = LIMITE_SEM_MATERIA

  let questoes = await prisma.questao.findMany({
    where,
    orderBy: [{ materia: "asc" }, { modulo: "asc" }, { createdAt: "asc" }],
    ...(!shuffle && limit > 0 ? { take: limit } : {}),
  })
  if (shuffle) questoes = embaralhar(questoes)
  if (limit > 0) questoes = questoes.slice(0, limit)

  return NextResponse.json(questoes)
})
