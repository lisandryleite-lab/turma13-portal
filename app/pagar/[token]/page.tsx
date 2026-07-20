import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { emLevantamento } from "@/lib/formulario-cota"
import { ConfirmarPagamento } from "./confirmar"

export const dynamic = "force-dynamic"

const fmtMoeda = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
const fmtData = (d: Date | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "")

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "var(--creme, #F4F7FC)" }}>
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6">{children}</div>
    </div>
  )
}

function Rodape() {
  return (
    <p className="mt-6 text-center text-[11px] text-slate-400">
      A confirmação final é feita pelo responsável após verificar o pagamento.
    </p>
  )
}

export default async function PagarPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const pag = await prisma.pagamentoCota.findUnique({
    where: { token },
    include: { user: { select: { nomeGuerra: true, matricula: true } }, cota: true },
  })

  if (pag) {
    const { cota } = pag
    // Ainda em levantamento: manda pro formulário do pedido, não pra cobrança.
    if (emLevantamento(cota.formulario, cota.instrucoes)) redirect(`/pedido/${token}`)
    return (
      <Card>
        <p className="text-xs uppercase tracking-wide text-slate-400">
          {cota.tipo === "extra" ? "Cota extra" : "Cota mensal"} · Turma 13
        </p>
        <h1 className="text-xl font-bold text-slate-900 mt-1">{cota.titulo}</h1>
        <p className="text-slate-500 text-sm mt-1">{pag.user.matricula} — {pag.user.nomeGuerra}</p>
        <div className="my-5 text-center">
          <p className="text-3xl font-bold" style={{ color: "var(--azul-profundo, #0B2D5E)" }}>{fmtMoeda(pag.valor ?? cota.valor)}</p>
          {cota.prazo && <p className="text-xs text-slate-400 mt-1">Prazo: {fmtData(cota.prazo)}</p>}
        </div>
        {cota.responsavel && <p className="text-sm text-slate-600">Pagar para: <span className="font-semibold">{cota.responsavel}</span></p>}
        {cota.instrucoes && (
          <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-500 mb-1">Como pagar</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{cota.instrucoes}</p>
          </div>
        )}
        {!cota.ativa ? (
          <p className="mt-5 text-center text-sm text-slate-500">Esta cobrança já foi encerrada.</p>
        ) : pag.pago ? (
          <p className="mt-5 text-center text-sm font-semibold text-green-600">✓ Pagamento confirmado em {fmtData(pag.dataPagamento)}</p>
        ) : (
          <ConfirmarPagamento token={token} jaDeclarado={pag.declaradoPago} />
        )}
        <Rodape />
      </Card>
    )
  }

  const lanche = await prisma.pedidoLancheAluno.findUnique({
    where: { token },
    include: {
      user: { select: { nomeGuerra: true, matricula: true } },
      pedido: { select: { titulo: true, restaurante: true, responsavel: true, instrucoes: true, prazo: true } },
      linhas: { include: { item: { select: { nome: true, preco: true } } } },
    },
  })

  if (lanche) {
    const { pedido } = lanche
    const total = lanche.linhas.reduce((s, l) => s + l.quantidade * l.item.preco, 0)
    return (
      <Card>
        <p className="text-xs uppercase tracking-wide text-slate-400">Lanche coletivo · Turma 13</p>
        <h1 className="text-xl font-bold text-slate-900 mt-1">{pedido.titulo}</h1>
        <p className="text-slate-500 text-sm mt-1">
          {lanche.user.matricula} — {lanche.user.nomeGuerra}{pedido.restaurante ? ` · ${pedido.restaurante}` : ""}
        </p>

        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
          {lanche.linhas.map((l, i) => (
            <div key={i} className="flex justify-between text-sm text-slate-700">
              <span>{l.quantidade}× {l.item.nome}</span>
              <span>{fmtMoeda(l.quantidade * l.item.preco)}</span>
            </div>
          ))}
        </div>

        <div className="my-5 text-center">
          <p className="text-3xl font-bold" style={{ color: "var(--azul-profundo, #0B2D5E)" }}>{fmtMoeda(total)}</p>
          {pedido.prazo && <p className="text-xs text-slate-400 mt-1">Prazo: {fmtData(pedido.prazo)}</p>}
        </div>

        {pedido.responsavel && <p className="text-sm text-slate-600">Pagar para: <span className="font-semibold">{pedido.responsavel}</span></p>}
        {pedido.instrucoes && (
          <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-500 mb-1">Como pagar</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{pedido.instrucoes}</p>
          </div>
        )}

        {lanche.pago ? (
          <p className="mt-5 text-center text-sm font-semibold text-green-600">✓ Pagamento confirmado em {fmtData(lanche.dataPagamento)}</p>
        ) : (
          <ConfirmarPagamento token={token} jaDeclarado={lanche.declaradoPago} />
        )}
        <Rodape />
      </Card>
    )
  }

  notFound()
}
