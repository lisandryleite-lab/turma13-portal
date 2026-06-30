import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ConfirmarPagamento } from "./confirmar"

export const dynamic = "force-dynamic"

const fmtMoeda = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
const fmtData = (d: Date | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "")

export default async function PagarPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const pag = await prisma.pagamentoCota.findUnique({
    where: { token },
    include: {
      user: { select: { nomeGuerra: true, matricula: true } },
      cota: true,
    },
  })
  if (!pag) notFound()

  const { cota } = pag

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "var(--creme, #F4F7FC)" }}>
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          {cota.tipo === "extra" ? "Cota extra" : "Cota mensal"} · Turma 13
        </p>
        <h1 className="text-xl font-bold text-slate-900 mt-1">{cota.titulo}</h1>
        <p className="text-slate-500 text-sm mt-1">
          {pag.user.matricula} — {pag.user.nomeGuerra}
        </p>

        <div className="my-5 text-center">
          <p className="text-3xl font-bold" style={{ color: "var(--azul-profundo, #0B2D5E)" }}>{fmtMoeda(cota.valor)}</p>
          {cota.prazo && <p className="text-xs text-slate-400 mt-1">Prazo: {fmtData(cota.prazo)}</p>}
        </div>

        {cota.responsavel && (
          <p className="text-sm text-slate-600">Pagar para: <span className="font-semibold">{cota.responsavel}</span></p>
        )}
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

        <p className="mt-6 text-center text-[11px] text-slate-400">
          A confirmação final é feita pelo responsável após verificar o pagamento.
        </p>
      </div>
    </div>
  )
}
