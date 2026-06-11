import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { anthropic, MODEL, IA_HABILITADA } from "@/lib/claude"

export const runtime = "nodejs"
export const maxDuration = 120

const FORMAT = {
  type: "json_schema" as const,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      questoes: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            tipo: { type: "string", enum: ["certo_errado", "multipla", "dissertativa"] },
            contexto: { type: ["string", "null"], description: "caso prático opcional; null se não houver" },
            enunciado: { type: "string" },
            alternativas: {
              type: "array",
              description: "Apenas para múltipla escolha (A–E). Vazio nos demais tipos.",
              items: {
                type: "object",
                additionalProperties: false,
                properties: { id: { type: "string" }, texto: { type: "string" } },
                required: ["id", "texto"],
              },
            },
            gabarito: { type: "string", description: "multipla: 'A'..'E'; certo_errado: 'certo'/'errado'; dissertativa: ''" },
            explicacao: { type: ["string", "null"], description: "gabarito comentado / justificativa do erro" },
            modelo: {
              type: ["object", "null"],
              description: "Apenas dissertativa; null nos demais",
              additionalProperties: false,
              properties: {
                estrutura: { type: "string" },
                criterios: { type: "array", items: { type: "string" } },
                resposta: { type: "string" },
              },
              required: ["estrutura", "criterios", "resposta"],
            },
          },
          required: ["tipo", "contexto", "enunciado", "alternativas", "gabarito", "explicacao", "modelo"],
        },
      },
    },
    required: ["questoes"],
  },
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  if (!IA_HABILITADA) return NextResponse.json({ error: "IA não configurada (defina ANTHROPIC_API_KEY)." }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const materia = (body.materia || "").toString().trim().toUpperCase()
  const modulo = (body.modulo || "").toString().trim()
  const quantidade = Math.max(1, Math.min(25, Number(body.quantidade) || 8))
  const tipos: string[] = Array.isArray(body.tipos) && body.tipos.length ? body.tipos : ["certo_errado", "multipla", "dissertativa"]
  if (!materia) return NextResponse.json({ error: "Informe a matéria (sigla)." }, { status: 400 })

  const disc = await prisma.disciplina.findUnique({ where: { sigla: materia } })
  if (!disc) return NextResponse.json({ error: `Disciplina ${materia} não existe.` }, { status: 400 })

  // Fonte de conteúdo: texto colado OU mementos da matéria no banco
  let fonte = (body.texto || "").toString().trim()
  if (!fonte) {
    const mems = await prisma.memento.findMany({
      where: { materia, ...(modulo ? { modulo } : {}) },
      orderBy: [{ modulo: "asc" }, { ordem: "asc" }],
      select: { conteudoMd: true },
    })
    fonte = mems.map(m => m.conteudoMd).join("\n\n---\n\n")
  }
  if (!fonte) return NextResponse.json({ error: "Sem conteúdo: cole um texto ou cadastre o memento desta matéria." }, { status: 400 })
  fonte = fonte.slice(0, 120000)

  const system =
    "Você é um elaborador de questões para o Curso de Formação de Oficiais da PMPE (concurso militar). " +
    "Gere questões FIÉIS ao conteúdo fornecido — não invente leis, números, datas ou autores que não estejam no texto. " +
    "Estilo de banca: enunciados claros e objetivos, com pegadinhas plausíveis. " +
    "Para 'certo_errado': afirmação a julgar (gabarito 'certo'/'errado') + explicação justificando. " +
    "Para 'multipla': 5 alternativas (A–E) plausíveis, gabarito a letra correta, explicação comentando o gabarito. " +
    "Para 'dissertativa': enunciado + modelo com estrutura, critérios objetivos e uma resposta-modelo. " +
    "Cubra módulos/temas variados do conteúdo. Português do Brasil."

  const userMsg =
    `MATÉRIA: ${materia} — ${disc.nome}\n` +
    (modulo ? `MÓDULO: ${modulo}\n` : "") +
    `QUANTIDADE: ${quantidade} questões\n` +
    `TIPOS PERMITIDOS: ${tipos.join(", ")}\n\n` +
    `CONTEÚDO-FONTE:\n${fonte}`

  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "high", format: FORMAT },
      system,
      messages: [{ role: "user", content: userMsg }],
    })
    const texto = msg.content.find(b => b.type === "text")?.text ?? ""
    const data = JSON.parse(texto)
    // monta o pacote no formato do importador
    const pacote = { materia, modulo: modulo || "", questoes: data.questoes || [] }
    return NextResponse.json({ pacote, total: pacote.questoes.length })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : "Erro na IA"
    return NextResponse.json({ error: m }, { status: 500 })
  }
}
