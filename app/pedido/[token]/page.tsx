import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { parseFormulario, parseResposta } from "@/lib/formulario-cota"
import { FormularioPedido } from "@/components/formulario-pedido"

export const dynamic = "force-dynamic"

const fmtData = (d: Date | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "")

export default async function PedidoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const pag = await prisma.pagamentoCota.findUnique({
    where: { token },
    include: { user: { select: { nomeGuerra: true, matricula: true } }, cota: true },
  })
  if (!pag) notFound()

  const { cota } = pag
  const form = parseFormulario(cota.formulario)
  if (!form) notFound()

  const jaRespondeu = parseResposta(pag.respostas).itens.length > 0

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "var(--creme, #F4F7FC)" }}>
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <p className="text-xs uppercase tracking-wide text-slate-400">Levantamento · Turma 13</p>
        <h1 className="text-xl font-bold text-slate-900 mt-1">{cota.titulo}</h1>
        <p className="text-slate-500 text-sm mt-1">{pag.user.matricula} — {pag.user.nomeGuerra}</p>

        <div className="mt-4 mb-4 rounded-lg p-3" style={{ background: "#fff6e0", border: "1px solid #f0dcae" }}>
          <p className="text-[13px] font-semibold" style={{ color: "#8a6410" }}>
            Esta etapa é só levantamento de quantidade — não pague nada agora.
          </p>
          <p className="text-xs mt-1" style={{ color: "#a97c15" }}>
            As instruções de pagamento vêm depois, quando o total fechar com o fornecedor.
          </p>
        </div>

        {form.descricao && <p className="text-xs text-slate-500 mb-4">{form.descricao}</p>}
        {cota.prazo && <p className="text-xs text-slate-400 mb-3">Prazo para responder: {fmtData(cota.prazo)}</p>}
        {jaRespondeu && (
          <p className="text-xs font-semibold mb-3" style={{ color: "#1f9d63" }}>
            ✓ Você já respondeu — pode alterar abaixo se quiser.
          </p>
        )}

        {cota.ativa ? (
          <FormularioPedido
            form={form}
            respostaAtual={pag.respostas}
            valorUnitario={cota.valor}
            endpoint={`/api/pedido/${token}`}
            compacto
          />
        ) : (
          <p className="mt-5 text-center text-sm text-slate-500">Este levantamento já foi encerrado.</p>
        )}

        <p className="mt-6 text-center text-[11px] text-slate-400">
          Dúvidas: {cota.responsavel || "responsável pela cota"}.
        </p>
      </div>
    </div>
  )
}
