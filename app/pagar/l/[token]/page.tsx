import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ListaCobranca, type Pessoa } from "../../lista-cobranca"

export const dynamic = "force-dynamic"

const fmtMoeda = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
const fmtData = (d: Date | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "")

export default async function PagarLancheColetivo({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const pedido = await prisma.pedidoLanche.findUnique({
    where: { token },
    include: {
      itens: { select: { id: true, preco: true } },
      pedidos: {
        include: {
          user: { select: { nomeGuerra: true, matricula: true } },
          linhas: { select: { itemId: true, quantidade: true } },
        },
        orderBy: { user: { matricula: "asc" } },
      },
    },
  })
  if (!pedido) notFound()

  const preco = new Map(pedido.itens.map(i => [i.id, i.preco]))
  const pessoas: Pessoa[] = pedido.pedidos.map(pa => {
    const total = pa.linhas.reduce((s, l) => s + l.quantidade * (preco.get(l.itemId) ?? 0), 0)
    return {
      token: pa.token,
      nome: pa.user.nomeGuerra,
      matricula: pa.user.matricula,
      pago: pa.pago,
      declaradoPago: pa.declaradoPago,
      detalhe: fmtMoeda(total),
    }
  })

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "var(--creme, #F4F7FC)" }}>
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <p className="text-xs uppercase tracking-wide text-slate-400">Lanche coletivo · Turma 13</p>
        <h1 className="text-xl font-bold text-slate-900 mt-1">{pedido.titulo}</h1>
        {pedido.restaurante && <p className="text-slate-500 text-sm mt-1">{pedido.restaurante}</p>}
        {pedido.prazo && <p className="text-xs text-slate-400 mt-1">Prazo: {fmtData(pedido.prazo)}</p>}
        {pedido.responsavel && <p className="text-sm text-slate-600 mt-2">Pagar para: <span className="font-semibold">{pedido.responsavel}</span></p>}
        {pedido.instrucoes && (
          <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-500 mb-1">Como pagar</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{pedido.instrucoes}</p>
          </div>
        )}
        <ListaCobranca pessoas={pessoas} />
      </div>
    </div>
  )
}
