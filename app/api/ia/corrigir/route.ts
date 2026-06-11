import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { genai, MODEL, IA_HABILITADA, parseJsonLoose } from "@/lib/ai"

export const runtime = "nodejs"
export const maxDuration = 60

type Modelo = { estrutura?: string; criterios?: string[]; resposta?: string }

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  if (!IA_HABILITADA) return NextResponse.json({ error: "IA não configurada (defina GEMINI_API_KEY)." }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const resposta: string = (body.resposta || "").toString().trim()
  if (!resposta) return NextResponse.json({ error: "Resposta vazia." }, { status: 400 })
  if (resposta.length > 8000) return NextResponse.json({ error: "Resposta muito longa." }, { status: 400 })

  let enunciado: string = (body.enunciado || "").toString()
  let modelo: Modelo | null = body.modelo ?? null
  let materia = (body.materia || "").toString()

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
    "Avalie a resposta do aluno com justiça e rigor técnico, comparando-a com os critérios e o modelo fornecidos. " +
    "Atribua nota de 0 a 10 considerando: aderência aos critérios (peso maior), correção técnica/jurídica, clareza e completude. " +
    "Para CADA critério, diga se foi atendido e comente. Seja construtivo. Não invente fatos. Português do Brasil.\n\n" +
    "Responda APENAS com um objeto JSON válido (sem markdown), com EXATAMENTE estas chaves:\n" +
    "{ \"nota\": número 0-10, \"veredito\": \"excelente\"|\"boa\"|\"regular\"|\"insuficiente\", " +
    "\"resumo\": \"1-2 frases\", \"criterios\": [{\"criterio\": \"...\", \"atendido\": true|false, \"comentario\": \"...\"}], " +
    "\"pontosFortes\": [\"...\"], \"pontosAMelhorar\": [\"...\"] }"

  const userMsg =
    `MATÉRIA: ${materia || "—"}\n\nENUNCIADO:\n${enunciado}\n\n` +
    `ESTRUTURA ESPERADA: ${estruturaTxt}\n\nCRITÉRIOS DE CORREÇÃO:\n${criteriosTxt}\n\n` +
    `MODELO DE RESPOSTA (referência):\n${respModelo}\n\nRESPOSTA DO ALUNO (corrija esta):\n${resposta}`

  try {
    const r = await genai.models.generateContent({
      model: MODEL,
      contents: userMsg,
      config: { systemInstruction: system, responseMimeType: "application/json", temperature: 0.3, maxOutputTokens: 4000 },
    })
    const data = parseJsonLoose(r.text ?? "") as { nota?: number }
    if (typeof data.nota === "number") data.nota = Math.max(0, Math.min(10, data.nota))
    return NextResponse.json(data)
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : "Erro na IA"
    return NextResponse.json({ error: m }, { status: 500 })
  }
}
