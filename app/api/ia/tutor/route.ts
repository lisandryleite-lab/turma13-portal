import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { anthropic, MODEL, IA_HABILITADA } from "@/lib/claude"

export const runtime = "nodejs"
export const maxDuration = 60

type Msg = { role: "user" | "assistant"; content: string }

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return json({ error: "Não autorizado" }, 401)
  if (!IA_HABILITADA) return json({ error: "IA não configurada (defina ANTHROPIC_API_KEY)." }, 503)

  const body = await req.json().catch(() => ({}))
  const materia = (body.materia || "").toString().trim().toUpperCase()
  const incoming: Msg[] = Array.isArray(body.messages) ? body.messages : []
  const messages = incoming
    .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }))
    .slice(-16)
  if (!messages.length || messages[messages.length - 1].role !== "user") return json({ error: "Envie uma pergunta." }, 400)
  if (!materia) return json({ error: "Informe a matéria." }, 400)

  const disc = await prisma.disciplina.findUnique({ where: { sigla: materia }, select: { nome: true } })
  const mems = await prisma.memento.findMany({
    where: { materia },
    orderBy: [{ modulo: "asc" }, { ordem: "asc" }],
    select: { titulo: true, conteudoMd: true },
  })
  const contexto = mems.map(m => `## ${m.titulo}\n${m.conteudoMd}`).join("\n\n").slice(0, 120000)

  const system =
    `Você é um tutor da disciplina ${materia}${disc?.nome ? ` (${disc.nome})` : ""} do Curso de Formação de Oficiais da PMPE. ` +
    "Responda às dúvidas do aluno de forma didática, objetiva e correta, usando PRIORITARIAMENTE o memento da matéria fornecido abaixo como fonte. " +
    "Se a pergunta fugir do conteúdo do memento, responda com cautela e avise que pode não estar coberto pelo material da turma. " +
    "Não invente leis, artigos ou números. Use português do Brasil, frases curtas e, quando útil, listas. " +
    (contexto
      ? `\n\n=== MEMENTO DE ${materia} ===\n${contexto}`
      : "\n\n(Não há memento cadastrado desta matéria — avise o aluno e responda com conhecimento geral, com ressalva.)")

  try {
    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: 2000,
      system,
      messages,
    })
    const encoder = new TextEncoder()
    const rs = new ReadableStream<Uint8Array>({
      start(controller) {
        stream.on("text", t => controller.enqueue(encoder.encode(t)))
        stream.on("end", () => controller.close())
        stream.on("error", err => controller.error(err))
      },
      cancel() { stream.abort() },
    })
    return new Response(rs, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : "Erro na IA"
    return json({ error: m }, 500)
  }
}
