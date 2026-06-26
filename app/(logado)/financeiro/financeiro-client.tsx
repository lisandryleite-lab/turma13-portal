"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Pagamento = {
  id: string
  pago: boolean
  dataPagamento: string | Date | null
  observacao: string | null
  user: { matricula: number; nomeGuerra: string }
}
type Cota = {
  id: string
  titulo: string
  valor: number
  responsavel: string
  instrucoes: string | null
  prazo: string | Date | null
  ativa: boolean
  createdAt: string | Date
  pagamentos: Pagamento[]
}

const fmtMoeda = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
const fmtData = (d: string | Date | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "")

export function FinanceiroClient({ cotas: inicial, isAdmin, minhaMatricula }: { cotas: Cota[]; isAdmin: boolean; minhaMatricula: number }) {
  const router = useRouter()
  const [cotas, setCotas] = useState(inicial)
  const [showForm, setShowForm] = useState(false)
  const [expandida, setExpandida] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ titulo: "", valor: "", responsavel: "", instrucoes: "", prazo: "" })

  async function criarCota(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/financeiro/cotas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ titulo: "", valor: "", responsavel: "", instrucoes: "", prazo: "" })
    router.refresh()
  }

  async function excluirCota(id: string) {
    if (!confirm("Excluir esta cota e todos os pagamentos associados?")) return
    await fetch("/api/financeiro/cotas", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setCotas(prev => prev.filter(c => c.id !== id))
  }

  async function encerrarCota(c: Cota) {
    await fetch("/api/financeiro/cotas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, ativa: !c.ativa }),
    })
    setCotas(prev => prev.map(x => x.id === c.id ? { ...x, ativa: !x.ativa } : x))
  }

  async function togglePago(p: Pagamento) {
    const novoPago = !p.pago
    setCotas(prev => prev.map(c => ({
      ...c,
      pagamentos: c.pagamentos.map(x => x.id === p.id ? { ...x, pago: novoPago, dataPagamento: novoPago ? new Date().toISOString() : null } : x),
    })))
    await fetch("/api/financeiro/pagamentos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, pago: novoPago }),
    })
  }

  const cotasAtivas = cotas.filter(c => c.ativa)
  const cotasEncerradas = cotas.filter(c => !c.ativa)
  const minhasPendentes = cotasAtivas.filter(c => c.pagamentos.find(p => p.user.matricula === minhaMatricula && !p.pago))

  return (
    <div className="space-y-5">
      {minhasPendentes.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
          <p className="text-amber-800 text-sm font-semibold">
            ⚠ Você tem {minhasPendentes.length} pagamento(s) pendente(s): {minhasPendentes.map(c => c.titulo).join(", ")}
          </p>
        </div>
      )}

      {isAdmin && (
        <div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">
            {showForm ? "Cancelar" : "+ Nova Cota/Cobrança"}
          </button>
          {showForm && (
            <form onSubmit={criarCota} className="mt-4 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })}
                placeholder="Título (ex: Cota mensal do pelotão — Junho)"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
              <div className="flex gap-3">
                <input value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })}
                  placeholder="Valor (ex: 30.00)" type="number" step="0.01"
                  className="w-1/2 border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
                <input value={form.prazo} onChange={e => setForm({ ...form, prazo: e.target.value })}
                  type="date" className="w-1/2 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <input value={form.responsavel} onChange={e => setForm({ ...form, responsavel: e.target.value })}
                placeholder="Responsável por arrecadar (nome de guerra)"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              <textarea value={form.instrucoes} onChange={e => setForm({ ...form, instrucoes: e.target.value })}
                placeholder="Instruções de pagamento (ex: Pix para Margareth, depois anexar comprovante no formulário)"
                rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none" />
              <button type="submit" disabled={saving}
                className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                {saving ? "Salvando..." : "Criar cota"}
              </button>
            </form>
          )}
        </div>
      )}

      {cotasAtivas.length === 0 && <p className="text-slate-500 text-sm">Nenhuma cota em aberto.</p>}

      {cotasAtivas.map(c => {
        const meuPagamento = c.pagamentos.find(p => p.user.matricula === minhaMatricula)
        const pagos = c.pagamentos.filter(p => p.pago).length
        const total = c.pagamentos.length
        return (
          <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">{c.titulo}</h3>
                <p className="text-slate-600 text-sm mt-1">
                  <span className="font-semibold">{fmtMoeda(c.valor)}</span>
                  {c.responsavel && <> · Responsável: {c.responsavel}</>}
                  {c.prazo && <> · Prazo: {fmtData(c.prazo)}</>}
                </p>
                {c.instrucoes && <p className="text-slate-500 text-xs mt-1 whitespace-pre-wrap">{c.instrucoes}</p>}
                {!isAdmin && meuPagamento && (
                  <p className={`text-sm mt-2 font-semibold ${meuPagamento.pago ? "text-green-600" : "text-red-500"}`}>
                    {meuPagamento.pago ? `✓ Pago em ${fmtData(meuPagamento.dataPagamento)}` : "✗ Pendente"}
                  </p>
                )}
                {isAdmin && (
                  <p className="text-slate-400 text-xs mt-2">{pagos}/{total} alunos pagaram</p>
                )}
              </div>
              {isAdmin && (
                <div className="flex flex-col gap-1 items-end shrink-0">
                  <button onClick={() => setExpandida(expandida === c.id ? null : c.id)}
                    className="text-blue-500 hover:text-blue-700 text-xs">
                    {expandida === c.id ? "Ocultar lista" : "Ver/marcar pagamentos"}
                  </button>
                  <button onClick={() => encerrarCota(c)} className="text-slate-400 hover:text-slate-600 text-xs">
                    Encerrar
                  </button>
                  <button onClick={() => excluirCota(c.id)} className="text-red-400 hover:text-red-600 text-xs">
                    Excluir
                  </button>
                </div>
              )}
            </div>

            {isAdmin && expandida === c.id && (
              <div className="mt-4 border-t border-slate-100 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-1">
                {c.pagamentos.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                    <input type="checkbox" checked={p.pago} onChange={() => togglePago(p)} />
                    <span className={p.pago ? "text-green-700" : "text-slate-700"}>
                      {p.user.matricula} — {p.user.nomeGuerra}
                    </span>
                    {p.pago && p.dataPagamento && (
                      <span className="text-slate-400 text-xs">({fmtData(p.dataPagamento)})</span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {isAdmin && cotasEncerradas.length > 0 && (
        <details className="text-sm">
          <summary className="text-slate-500 cursor-pointer">Cotas encerradas ({cotasEncerradas.length})</summary>
          <div className="space-y-2 mt-2">
            {cotasEncerradas.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-slate-600">{c.titulo} — {fmtMoeda(c.valor)}</span>
                <div className="flex gap-2">
                  <button onClick={() => encerrarCota(c)} className="text-blue-500 hover:text-blue-700 text-xs">Reabrir</button>
                  <button onClick={() => excluirCota(c.id)} className="text-red-400 hover:text-red-600 text-xs">Excluir</button>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
