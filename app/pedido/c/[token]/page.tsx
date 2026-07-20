import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { parseFormulario, parseResposta } from "@/lib/formulario-cota"
import { ListaPedido, type PessoaPedido } from "../../lista-pedido"

export const dynamic = "force-dynamic"

const fmtData = (d: Date | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "")

// Link coletivo do levantamento: cada um acha o próprio nome e cai no formulário.
export default async function PedidoColetivo({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const cota = await prisma.cotaFinanceira.findUnique({
    where: { token },
    include: {
      pagamentos: {
        include: { user: { select: { nomeGuerra: true, matricula: true } } },
        orderBy: { user: { matricula: "asc" } },
      },
    },
  })
  if (!cota) notFound()

  const form = parseFormulario(cota.formulario)
  if (!form) notFound()

  const nomeModelo = (id: string) => form.modelos.find(m => m.id === id)?.nome ?? id

  const pessoas: PessoaPedido[] = cota.pagamentos.map(p => {
    const r = parseResposta(p.respostas)
    return {
      token: p.token,
      nome: p.user.nomeGuerra,
      matricula: p.user.matricula,
      respondeu: r.itens.length > 0,
      detalhe: r.itens.length
        ? r.itens.map(i => `${i.quantidade}x ${nomeModelo(i.modelo)} ${i.tamanho}`).join(" + ")
        : undefined,
    }
  })

  const responderam = pessoas.filter(p => p.respondeu).length

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "var(--creme, #F4F7FC)" }}>
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <p className="text-xs uppercase tracking-wide text-slate-400">Levantamento · Turma 13</p>
        <h1 className="text-xl font-bold text-slate-900 mt-1">{cota.titulo}</h1>

        <div className="mt-4 rounded-lg p-3" style={{ background: "#fff6e0", border: "1px solid #f0dcae" }}>
          <p className="text-[13px] font-semibold" style={{ color: "#8a6410" }}>
            Só levantamento de quantidade — não pague nada agora.
          </p>
          <p className="text-xs mt-1" style={{ color: "#a97c15" }}>
            Ache seu nome, registre o que você quer. O pagamento vem em outra etapa.
          </p>
        </div>

        {form.descricao && <p className="text-xs text-slate-500 mt-3">{form.descricao}</p>}
        <p className="text-xs text-slate-400 mt-3">
          {responderam}/{pessoas.length} já responderam
          {cota.prazo && <> · prazo {fmtData(cota.prazo)}</>}
        </p>

        {cota.ativa ? (
          <ListaPedido pessoas={pessoas} />
        ) : (
          <p className="mt-5 text-center text-sm text-slate-500">Este levantamento já foi encerrado.</p>
        )}
      </div>
    </div>
  )
}
