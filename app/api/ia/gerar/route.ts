import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { genai, MODEL, IA_HABILITADA, parseJsonLoose } from "@/lib/ai"

export const runtime = "nodejs"
export const maxDuration = 120

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  if (!IA_HABILITADA) return NextResponse.json({ error: "IA não configurada (defina GEMINI_API_KEY)." }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const materia = (body.materia || "").toString().trim().toUpperCase()
  const modulo = (body.modulo || "").toString().trim()
  const quantidade = Math.max(1, Math.min(20, Number(body.quantidade) || 8))
  const tipos: string[] = Array.isArray(body.tipos) && body.tipos.length ? body.tipos : ["certo_errado", "multipla", "dissertativa"]
  if (!materia) return NextResponse.json({ error: "Informe a matéria (sigla)." }, { status: 400 })

  const disc = await prisma.disciplina.findUnique({ where: { sigla: materia } })
  if (!disc) return NextResponse.json({ error: `Disciplina ${materia} não existe.` }, { status: 400 })

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
  fonte = fonte.slice(0, 100000)

  const system =
    "Você é um elaborador de questões para o Curso de Formação de Oficiais da PMPE (concurso militar). " +
    "Gere questões FIÉIS ao conteúdo fornecido — não invente leis, números, datas ou autores fora do texto. " +
    "Estilo de banca, com pegadinhas plausíveis. " +
    "'certo_errado': afirmação a julgar (gabarito 'certo'/'errado') + explicação. " +
    "'multipla': 5 alternativas (A–E), gabarito = letra correta, explicação comentando. " +
    "'dissertativa': enunciado + modelo (estrutura, critérios objetivos, resposta-modelo). " +
    "Cubra temas variados. Português do Brasil.\n\n" +
    "Responda APENAS com um objeto JSON válido (sem markdown), no formato:\n" +
    "{ \"questoes\": [ { \"tipo\": \"certo_errado\"|\"multipla\"|\"dissertativa\", \"contexto\": string|null, " +
    "\"enunciado\": string, \"alternativas\": [{\"id\":\"A\",\"texto\":\"...\"}] (vazio se não for múltipla), " +
    "\"gabarito\": string (multipla:'A'..'E'; certo_errado:'certo'/'errado'; dissertativa:''), " +
    "\"explicacao\": string|null, \"modelo\": {\"estrutura\":string,\"criterios\":[string],\"resposta\":string}|null } ] }"

  const userMsg =
    `MATÉRIA: ${materia} — ${disc.nome}\n` + (modulo ? `MÓDULO: ${modulo}\n` : "") +
    `QUANTIDADE: ${quantidade} questões\nTIPOS PERMITIDOS: ${tipos.join(", ")}\n\nCONTEÚDO-FONTE:\n${fonte}`

  try {
    const r = await genai.models.generateContent({
      model: MODEL,
      contents: userMsg,
      config: { systemInstruction: system, responseMimeType: "application/json", temperature: 0.6, maxOutputTokens: 32000 },
    })
    const data = parseJsonLoose(r.text ?? "") as { questoes?: unknown[] }
    const pacote = { materia, modulo: modulo || "", questoes: data.questoes || [] }
    return NextResponse.json({ pacote, total: pacote.questoes.length })
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : "Erro na IA"
    return NextResponse.json({ error: m }, { status: 500 })
  }
}
