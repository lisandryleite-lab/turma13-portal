import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { anthropic, MODEL, IA_HABILITADA } from "@/lib/claude"

export const runtime = "nodejs"
export const maxDuration = 60

type Modelo = { estrutura?: string; criterios?: string[]; resposta?: string }

const FORMAT = {
  type: "json_schema" as const,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      nota: { type: "number", description: "Nota de 0 a 10 (pode ter 1 casa decimal)" },
      veredito: { type: "string", enum: ["excelente", "boa", "regular", "insuficiente"] },
      resumo: { type: "string", description: "1-2 frases resumindo a avaliação" },
      criterios: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            criterio: { type: "string" },
            atendido: { type: "boolean" },
            comentario: { type: "string" },
          },
          required: ["criterio", "atendido", "comentario"],
        },
      },
      pontosFortes: { type: "array", items: { type: "string" } },
      pontosAMelhorar: { type: "array", items: { type: "string" } },
    },
    required: ["nota", "veredito", "resumo", "criterios", "pontosFortes", "pontosAMelhorar"],
  },
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  if (!IA_HABILITADA) return NextResponse.json({ error: "IA não configurada (defina ANTHROPIC_API_KEY)." }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const resposta: string = (body.resposta || "").toString().trim()
  if (!resposta) return NextResponse.json({ error: "Resposta vazia." }, { status: 400 })
  if (resposta.length > 8000) return NextResponse.json({ error: "Resposta muito longa." }, { status: 400 })

  let enunciado: string = (body.enunciado || "").toString()
  let modelo: Modelo | null = body.modelo ?? null
  let materia = (body.materia || "").toString()

  // Preferir carregar do banco quando vier o id (garante enunciado/critérios fiéis)
  if (body.questaoId) {
    const q = await prisma.questao.findUnique({ where: { id: String(body.questaoId) } })
    if (!q) return NextResponse.json({ error: "Questão não encontrada." }, { status: 404 })
    if (q.tipo !== "dissertativa") return NextResponse.json({ error: "Só corrijo questões dissertativas." }, { status: 400 })
    enunciado = q.enunciado
    modelo = (q.modelo as Modelo | null) ?? null
    materia = q.materia
  }
  if (!enunciado) return NextResponse.json({ error: "Enunciado ausente." }, { status: 400 })

  const criteriosTxt = modelo?.criterios?.length ? modelo.criterios.map((c, i) => `${i + 1}. ${c}`).join("\n") : "(não informados)"
  const estruturaTxt = modelo?.estrutura || "(não informada)"
  const respModelo = modelo?.resposta || "(não informado)"

  const system =
    "Você é um examinador experiente do Curso de Formação de Oficiais da PMPE, corrigindo questões dissertativas. " +
    "Avalie a resposta do aluno com justiça e rigor técnico, comparando-a com os critérios e o modelo de resposta fornecidos. " +
    "Atribua nota de 0 a 10 considerando: aderência aos critérios (peso maior), correção técnica/jurídica, clareza e completude. " +
    "Para CADA critério informado, diga se foi atendido e comente. Seja construtivo: aponte o que está certo e o que falta. " +
    "Não invente fatos; baseie-se no modelo. Responda em português do Brasil."

  const userMsg =
    `MATÉRIA: ${materia || "—"}\n\n` +
    `ENUNCIADO:\n${enunciado}\n\n` +
    `ESTRUTURA ESPERADA: ${estruturaTxt}\n\n` +
    `CRITÉRIOS DE CORREÇÃO:\n${criteriosTxt}\n\n` +
    `MODELO DE RESPOSTA (referência):\n${respModelo}\n\n` +
    `RESPOSTA DO ALUNO (corrija esta):\n${resposta}`

  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      output_config: { effort: "high", format: FORMAT },
      system,
      messages: [{ role: "user", content: userMsg }],
    })
    const texto = msg.content.find(b => b.type === "text")?.text ?? ""
    const data = JSON.parse(texto)
    if (typeof data.nota === "number") data.nota = Math.max(0, Math.min(10, data.nota))
    return NextResponse.json(data)
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : "Erro na IA"
    return NextResponse.json({ error: m }, { status: 500 })
  }
}
