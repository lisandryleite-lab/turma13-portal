import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseFormulario, parseResposta } from "@/lib/formulario-cota"
import { rotaApi, lerCorpo, naoAutorizado, naoEncontrado, ErroHttp, z, zId } from "@/lib/api"

// Resposta do próprio aluno ao formulário de levantamento de uma cota.
// Cada um só grava o próprio pedido — o gestor consolida na tela do financeiro.
const EnviarPedido = z.object({
  cotaId: zId,
  respostas: z.unknown().optional(), // formato livre; `parseResposta` normaliza abaixo
})

export const POST = rotaApi(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) throw naoAutorizado()

  const { cotaId, respostas } = await lerCorpo(req, EnviarPedido)

  const cota = await prisma.cotaFinanceira.findUnique({
    where: { id: cotaId },
    select: { ativa: true, formulario: true },
  })
  if (!cota) throw naoEncontrado("Cota")
  if (!cota.ativa) throw new ErroHttp(400, "Cota encerrada")

  const form = parseFormulario(cota.formulario)
  if (!form) throw new ErroHttp(400, "Esta cota não tem formulário")

  // Normaliza e valida contra a definição do formulário — nada de valor livre
  // em modelo/versão/tamanho, senão o consolidado do fornecedor vira sopa.
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

  const faltando = form.campos.filter(c => c.obrigatorio && !campos[c.id]).map(c => c.label)
  if (itens.length > 0 && faltando.length > 0) {
    throw new ErroHttp(400, `Preencha: ${faltando.join(", ")}`)
  }

  const pagamento = await prisma.pagamentoCota.upsert({
    where: { cotaId_userId: { cotaId, userId: session.user.id } },
    update: { respostas: { campos, itens } },
    create: { cotaId, userId: session.user.id, respostas: { campos, itens } },
  })
  return NextResponse.json({ ok: true, respostas: pagamento.respostas })
})
