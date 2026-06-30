"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LanchesClient, type Pedido } from "./lanches-client"

type Aluno = { id: string; matricula: number; nomeGuerra: string; turma13: boolean }
type Pagamento = {
  id: string
  userId: string
  pago: boolean
  dataPagamento: string | Date | null
  declaradoPago: boolean
  dataDeclarado: string | Date | null
  token: string
  observacao: string | null
  user: { matricula: number; nomeGuerra: string }
}
type Cota = {
  id: string
  titulo: string
  tipo: string
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

export function FinanceiroClient({ cotas: inicial, alunos, lanches, isAdmin, minhaMatricula, minhaId }: { cotas: Cota[]; alunos: Aluno[]; lanches: Pedido[]; isAdmin: boolean; minhaMatricula: number; minhaId: string }) {
  const router = useRouter()
  const [cotas, setCotas] = useState(inicial)
  const [aba, setAba] = useState<"mensal" | "extra" | "lanche">("mensal")
  const [showForm, setShowForm] = useState(false)
  const [expandida, setExpandida] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [copiado, setCopiado] = useState<string | null>(null)
  const [form, setForm] = useState({ titulo: "", valor: "", responsavel: "", instrucoes: "", prazo: "" })
  const alunosT13 = alunos.filter(a => a.turma13)
  const [participantes, setParticipantes] = useState<Set<string>>(new Set(alunosT13.map(a => a.id)))
  const [addAluno, setAddAluno] = useState<Record<string, string>>({})

  function linkPagamento(token: string) {
    return typeof window !== "undefined" ? `${window.location.origin}/pagar/${token}` : `/pagar/${token}`
  }
  async function copiarLink(token: string) {
    try {
      await navigator.clipboard.writeText(linkPagamento(token))
      setCopiado(token)
      setTimeout(() => setCopiado(c => (c === token ? null : c)), 2000)
    } catch { /* clipboard indisponível */ }
  }

  function toggleParticipante(id: string) {
    setParticipantes(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function criarCota(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/financeiro/cotas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tipo: aba, participantes: [...participantes] }),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ titulo: "", valor: "", responsavel: "", instrucoes: "", prazo: "" })
    setParticipantes(new Set(alunosT13.map(a => a.id)))
    router.refresh()
  }

  async function adicionarAluno(cotaId: string) {
    const userId = addAluno[cotaId]
    if (!userId) return
    await fetch("/api/financeiro/pagamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cotaId, userId }),
    })
    setAddAluno(prev => ({ ...prev, [cotaId]: "" }))
    router.refresh()
  }

  async function removerPagamento(pagamentoId: string) {
    if (!confirm("Remover este aluno desta cota? (ele não vai mais aparecer como pendente/pago aqui)")) return
    await fetch("/api/financeiro/pagamentos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pagamentoId }),
    })
    setCotas(prev => prev.map(c => ({ ...c, pagamentos: c.pagamentos.filter(p => p.id !== pagamentoId) })))
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

  const cotasAtivas = cotas.filter(c => c.ativa && c.tipo === aba)
  const cotasEncerradas = cotas.filter(c => !c.ativa && c.tipo === aba)
  const minhasPendentes = cotas.filter(c => c.ativa && c.pagamentos.find(p => p.user.matricula === minhaMatricula && !p.pago))

  // resumo da aba atual (cotas) — pra dar a visão sem rolar
  let aReceber = 0, recebido = 0, totalPessoas = 0, pagosPessoas = 0
  for (const c of cotasAtivas) {
    for (const p of c.pagamentos) {
      totalPessoas++
      if (p.pago) { pagosPessoas++; recebido += c.valor } else aReceber += c.valor
    }
  }
  const pctResumo = totalPessoas ? Math.round((pagosPessoas / totalPessoas) * 100) : 0

  return (
    <div className="space-y-5">
      {isAdmin && (
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg w-fit"
          style={{ background: "var(--creme, #F4F7FC)", color: "var(--azul-profundo, #0B2D5E)", border: "1px solid var(--dourado, #B8924A)" }}>
          <span style={{ color: "var(--dourado, #B8924A)" }}>★</span> Modo gestão — ADM do Financeiro
        </div>
      )}

      {minhasPendentes.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
          <p className="text-amber-800 text-sm font-semibold">
            ⚠ Você tem {minhasPendentes.length} pagamento(s) pendente(s): {minhasPendentes.map(c => c.titulo).join(", ")}
          </p>
        </div>
      )}

      {/* Abas */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit flex-wrap">
        {([["mensal", "Cotas mensais"], ["extra", "Cotas extras"], ["lanche", "Lanches coletivos"]] as const).map(([val, label]) => (
          <button key={val} onClick={() => { setAba(val); setShowForm(false); setExpandida(null) }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${aba === val ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {aba === "lanche" && (
        <LanchesClient pedidos={lanches} isAdmin={isAdmin} minhaMatricula={minhaMatricula} minhaId={minhaId} />
      )}

      {/* Resumo da aba (cotas) */}
      {aba !== "lanche" && cotasAtivas.length > 0 && (
        <div className="rounded-xl p-4 text-white" style={{ background: "var(--azul-profundo, #0B2D5E)" }}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[11px] uppercase tracking-wide opacity-70">Recebido</p>
              <p className="text-lg font-bold">{fmtMoeda(recebido)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide opacity-70">A receber</p>
              <p className="text-lg font-bold" style={{ color: "var(--dourado, #B8924A)" }}>{fmtMoeda(aReceber)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide opacity-70">Pagaram</p>
              <p className="text-lg font-bold">{pagosPessoas}/{totalPessoas}</p>
            </div>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden mt-3">
            <div className="h-full rounded-full" style={{ width: `${pctResumo}%`, background: "var(--dourado, #B8924A)" }} />
          </div>
        </div>
      )}

      {aba !== "lanche" && isAdmin && (
        <div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">
            {showForm ? "Cancelar" : `+ Nova cota ${aba === "extra" ? "extra" : "mensal"}`}
          </button>
          {showForm && (
            <form onSubmit={criarCota} className="mt-4 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })}
                placeholder={aba === "extra" ? "Título (ex: Presente de formatura)" : "Título (ex: Cota mensal — Junho)"}
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
                placeholder="Instruções de pagamento (ex: Pix chave 000.000... para Margareth)"
                rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none" />

              <div className="border border-slate-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600">
                    Quem participa? ({participantes.size} selecionado{participantes.size === 1 ? "" : "s"})
                  </span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setParticipantes(new Set(alunosT13.map(a => a.id)))}
                      className="text-xs text-blue-500 hover:text-blue-700">Turma 13</button>
                    {aba === "extra" && (
                      <button type="button" onClick={() => setParticipantes(new Set(alunos.map(a => a.id)))}
                        className="text-xs text-blue-500 hover:text-blue-700">Todo o CFO</button>
                    )}
                    <button type="button" onClick={() => setParticipantes(new Set())}
                      className="text-xs text-slate-400 hover:text-slate-600">Limpar</button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-2">
                  {aba === "extra"
                    ? "Cota extra pode incluir todo o CFO. Marque quem entra nesta cobrança."
                    : "Cota mensal do pelotão — Turma 13 por padrão. Desmarque quem não entra."}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-48 overflow-y-auto">
                  {(aba === "extra" ? alunos : alunosT13).map(a => (
                    <label key={a.id} className="flex items-center gap-1.5 text-xs py-0.5 cursor-pointer">
                      <input type="checkbox" checked={participantes.has(a.id)} onChange={() => toggleParticipante(a.id)} />
                      <span>{a.matricula} — {a.nomeGuerra}{!a.turma13 && <span style={{ color: "var(--dourado)" }}> ·CFO</span>}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={saving}
                className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                {saving ? "Salvando..." : "Criar cota"}
              </button>
            </form>
          )}
        </div>
      )}

      {aba !== "lanche" && cotasAtivas.length === 0 && <p className="text-slate-500 text-sm">Nenhuma cota {aba === "extra" ? "extra" : "mensal"} em aberto.</p>}

      {cotasAtivas.map(c => {
        const meuPagamento = c.pagamentos.find(p => p.user.matricula === minhaMatricula)
        const pagos = c.pagamentos.filter(p => p.pago).length
        const total = c.pagamentos.length
        const pct = total > 0 ? Math.round((pagos / total) * 100) : 0
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

                {/* meu status + meu link de pagamento */}
                {meuPagamento && (
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className={`text-sm font-semibold ${meuPagamento.pago ? "text-green-600" : "text-red-500"}`}>
                      {meuPagamento.pago ? `✓ Pago em ${fmtData(meuPagamento.dataPagamento)}` : "✗ Pendente"}
                    </span>
                    {!meuPagamento.pago && (
                      <button onClick={() => copiarLink(meuPagamento.token)} className="text-xs text-blue-500 hover:text-blue-700">
                        {copiado === meuPagamento.token ? "✓ link copiado" : "copiar meu link de pagamento"}
                      </button>
                    )}
                  </div>
                )}

                {/* progresso visível a todos */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>{pagos}/{total} pagaram</span>
                    <button onClick={() => setExpandida(expandida === c.id ? null : c.id)}
                      className="text-blue-500 hover:text-blue-700">
                      {expandida === c.id ? "ocultar lista" : "ver quem pagou / falta"}
                    </button>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
              {isAdmin && (
                <div className="flex flex-col gap-1 items-end shrink-0">
                  <button onClick={() => encerrarCota(c)} className="text-slate-400 hover:text-slate-600 text-xs">Encerrar</button>
                  <button onClick={() => excluirCota(c.id)} className="text-red-400 hover:text-red-600 text-xs">Excluir</button>
                </div>
              )}
            </div>

            {expandida === c.id && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {c.pagamentos.map(p => (
                    <div key={p.id} className="flex items-center gap-2 text-sm py-1">
                      {isAdmin ? (
                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                          <input type="checkbox" checked={p.pago} onChange={() => togglePago(p)} />
                          <span className={p.pago ? "text-green-700" : "text-slate-700"}>
                            {p.user.matricula} — {p.user.nomeGuerra}
                          </span>
                          {p.pago && p.dataPagamento && (
                            <span className="text-slate-400 text-xs">({fmtData(p.dataPagamento)})</span>
                          )}
                          {!p.pago && p.declaradoPago && (
                            <span className="text-amber-600 text-xs" title={p.observacao || "declarou que pagou"}>● declarou pago</span>
                          )}
                        </label>
                      ) : (
                        <span className="flex items-center gap-2 flex-1">
                          <span className={p.pago ? "text-green-600" : "text-slate-400"}>{p.pago ? "✓" : "○"}</span>
                          <span className={p.pago ? "text-green-700" : "text-slate-600"}>
                            {p.user.matricula} — {p.user.nomeGuerra}
                          </span>
                          {!p.pago && p.declaradoPago && <span className="text-amber-500 text-xs">(declarou pago)</span>}
                        </span>
                      )}
                      {isAdmin && (
                        <>
                          {!p.pago && (
                            <button onClick={() => copiarLink(p.token)} title="Copiar link de pagamento deste aluno"
                              className="text-slate-300 hover:text-blue-500 text-xs shrink-0">
                              {copiado === p.token ? "✓" : "🔗"}
                            </button>
                          )}
                          <button onClick={() => removerPagamento(p.id)} title="Esta cota não se aplica a este aluno"
                            className="text-slate-300 hover:text-red-500 text-xs shrink-0">✕</button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                {isAdmin && alunos.some(a => !c.pagamentos.find(p => p.userId === a.id)) && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                    <select value={addAluno[c.id] || ""} onChange={e => setAddAluno(prev => ({ ...prev, [c.id]: e.target.value }))}
                      className="border border-slate-300 rounded-lg px-2 py-1 text-xs flex-1">
                      <option value="">+ Incluir aluno nesta cota...</option>
                      {alunos.filter(a => !c.pagamentos.find(p => p.userId === a.id)).map(a => (
                        <option key={a.id} value={a.id}>{a.matricula} — {a.nomeGuerra}</option>
                      ))}
                    </select>
                    <button onClick={() => adicionarAluno(c.id)} disabled={!addAluno[c.id]}
                      className="text-blue-500 hover:text-blue-700 text-xs disabled:opacity-40">Adicionar</button>
                  </div>
                )}
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
