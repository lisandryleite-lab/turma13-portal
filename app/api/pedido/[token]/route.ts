import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseFormulario, parseResposta } from "@/lib/formulario-cota"

// Registro do pedido pelo link público (sem login) — o token do PagamentoCota
// já identifica a pessoa, igual ao fluxo de /pagar/[token].
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const { respostas } = await req.json().catch(() => ({ respostas: null }))

  const pag = await prisma.pagamentoCota.findUnique({
    where: { token },
    select: { id: true, cota: { select: { ativa: true, formulario: true } } },
  })
  if (!pag) return NextResponse.json({ error: "Link inválido" }, { status: 404 })
  if (!pag.cota.ativa) return NextResponse.json({ error: "Levantamento encerrado" }, { status: 400 })

  const form = parseFormulario(pag.cota.formulario)
  if (!form) return NextResponse.json({ error: "Esta cota não tem formulário" }, { status: 400 })

  // Mesma normalização do endpoint logado: só entra o que existe na definição.
  const resp = parseResposta(respostas)
  const idsModelos = new Set(form.modelos.map(m => m.id))
  const itens = resp.itens.filter(
    i => idsModelos.has(i.modelo) && form.versoes.includes(i.versao) && form.tamanhos.includes(i.tamanho),
  )
  const campos: Record<string, string> = {}
  for (const c of form.campos) {
    const v = (resp.campos[c.id] ?? "").toString().trim()
    if (c.tipo === "select" && v && !(c.opcoes || []).includes(v)) continue
    campos[c.id] = v
  }

  if (itens.length === 0) return NextResponse.json({ error: "Escolha pelo menos uma peça" }, { status: 400 })
  const faltando = form.campos.filter(c => c.obrigatorio && !campos[c.id]).map(c => c.label)
  if (faltando.length > 0) return NextResponse.json({ error: `Preencha: ${faltando.join(", ")}` }, { status: 400 })

  await prisma.pagamentoCota.update({ where: { id: pag.id }, data: { respostas: { campos, itens } } })
  return NextResponse.json({ ok: true })
}
