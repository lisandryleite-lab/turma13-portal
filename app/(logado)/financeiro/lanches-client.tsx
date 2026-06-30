"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Aluno = { id: string; matricula: number; nomeGuerra: string }
type Item = { id: string; nome: string; preco: number; ordem: number }
type Linha = { itemId: string; quantidade: number }
type PedidoAluno = {
  id: string
  userId: string
  pago: boolean
  dataPagamento: string | Date | null
  declaradoPago: boolean
  token: string
  observacao: string | null
  user: { matricula: number; nomeGuerra: string }
  linhas: Linha[]
}
export type Pedido = {
  id: string
  titulo: string
  restaurante: string | null
  responsavel: string
  instrucoes: string | null
  prazo: string | Date | null
  aberto: boolean
  createdAt: string | Date
  itens: Item[]
  pedidos: PedidoAluno[]
}

const fmtMoeda = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
const fmtData = (d: string | Date | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "")

export function LanchesClient({ pedidos, isAdmin, minhaMatricula, minhaId }: { pedidos: Pedido[]; isAdmin: boolean; minhaMatricula: number; minhaId: string }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandida, setExpandida] = useState<string | null>(null)
  const [copiado, setCopiado] = useState<string | null>(null)

  // form de novo pedido
  const [form, setForm] = useState({ titulo: "", restaurante: "", responsavel: "", instrucoes: "", prazo: "" })
  const [cardapio, setCardapio] = useState<{ nome: string; preco: string }[]>([{ nome: "", preco: "" }])

  // pedido do aluno: { [pedidoId]: { [itemId]: quantidade } }
  const [meuPedido, setMeuPedido] = useState<Record<string, Record<string, number>>>({})

  function linkPagamento(token: string) {
    return typeof window !== "undefined" ? `${window.location.origin}/pagar/${token}` : `/pagar/${token}`
  }
  async function copiarLink(token: string) {
    try {
      await navigator.clipboard.writeText(linkPagamento(token))
      setCopiado(token); setTimeout(() => setCopiado(c => (c === token ? null : c)), 2000)
    } catch { /* indisponível */ }
  }

  function totalAluno(p: Pedido, pa: PedidoAluno) {
    const preco = new Map(p.itens.map(i => [i.id, i.preco]))
    return pa.linhas.reduce((s, l) => s + l.quantidade * (preco.get(l.itemId) ?? 0), 0)
  }

  async function criarPedido(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/financeiro/lanches", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, itens: cardapio.filter(i => i.nome && i.preco) }),
    })
    setSaving(false); setShowForm(false)
    setForm({ titulo: "", restaurante: "", responsavel: "", instrucoes: "", prazo: "" })
    setCardapio([{ nome: "", preco: "" }])
    router.refresh()
  }

  async function toggleAberto(p: Pedido) {
    await fetch("/api/financeiro/lanches", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, aberto: !p.aberto }),
    })
    router.refresh()
  }
  async function excluirPedido(id: string) {
    if (!confirm("Excluir este lanche e todos os pedidos?")) return
    await fetch("/api/financeiro/lanches", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  function setQtd(pedidoId: string, itemId: string, q: number) {
    setMeuPedido(prev => ({ ...prev, [pedidoId]: { ...prev[pedidoId], [itemId]: Math.max(0, q) } }))
  }

  async function salvarMeuPedido(p: Pedido) {
    const sel = meuPedido[p.id] || {}
    const itens = Object.entries(sel).filter(([, q]) => q > 0).map(([itemId, quantidade]) => ({ itemId, quantidade }))
    setSaving(true)
    await fetch("/api/financeiro/lanches/pedido", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pedidoId: p.id, itens }),
    })
    setSaving(false)
    router.refresh()
  }

  async function declararPago(token: string) {
    await fetch(`/api/pagar/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
    router.refresh()
  }

  async function confirmarPago(pa: PedidoAluno) {
    await fetch("/api/financeiro/lanches/pedido", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pa.id, pago: !pa.pago }),
    })
    router.refresh()
  }

  function meuPedidoExistente(p: Pedido): PedidoAluno | undefined {
    return p.pedidos.find(pa => pa.user.matricula === minhaMatricula)
  }

  // estado inicial do form de seleção do aluno = pedido já salvo
  function qtdAtual(p: Pedido, itemId: string): number {
    if (meuPedido[p.id]?.[itemId] !== undefined) return meuPedido[p.id][itemId]
    const meu = meuPedidoExistente(p)
    return meu?.linhas.find(l => l.itemId === itemId)?.quantidade ?? 0
  }
  function meuTotalForm(p: Pedido): number {
    return p.itens.reduce((s, i) => s + qtdAtual(p, i.id) * i.preco, 0)
  }

  const abertos = pedidos.filter(p => p.aberto)
  const encerrados = pedidos.filter(p => !p.aberto)

  return (
    <div className="space-y-5">
      {isAdmin && (
        <div>
          <button onClick={() => setShowForm(!showForm)} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">
            {showForm ? "Cancelar" : "+ Novo lanche coletivo"}
          </button>
          {showForm && (
            <form onSubmit={criarPedido} className="mt-4 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })}
                placeholder="Título (ex: Lanche da sexta)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
              <div className="flex gap-3">
                <input value={form.restaurante} onChange={e => setForm({ ...form, restaurante: e.target.value })}
                  placeholder="Restaurante" className="w-1/2 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                <input value={form.prazo} onChange={e => setForm({ ...form, prazo: e.target.value })}
                  type="date" className="w-1/2 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <input value={form.responsavel} onChange={e => setForm({ ...form, responsavel: e.target.value })}
                placeholder="Responsável (nome de guerra)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              <textarea value={form.instrucoes} onChange={e => setForm({ ...form, instrucoes: e.target.value })}
                placeholder="Instruções de pagamento (Pix etc.)" rows={2}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none" />

              <div className="border border-slate-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-600 mb-2">Cardápio</p>
                <div className="space-y-2">
                  {cardapio.map((it, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input value={it.nome} onChange={e => setCardapio(c => c.map((x, i) => i === idx ? { ...x, nome: e.target.value } : x))}
                        placeholder="Item (ex: X-Burguer)" className="flex-1 border border-slate-300 rounded-lg px-2 py-1.5 text-sm" />
                      <input value={it.preco} onChange={e => setCardapio(c => c.map((x, i) => i === idx ? { ...x, preco: e.target.value } : x))}
                        type="number" step="0.01" placeholder="Preço" className="w-24 border border-slate-300 rounded-lg px-2 py-1.5 text-sm" />
                      <button type="button" onClick={() => setCardapio(c => c.filter((_, i) => i !== idx))}
                        className="text-slate-300 hover:text-red-500 text-sm px-1">✕</button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setCardapio(c => [...c, { nome: "", preco: "" }])}
                  className="mt-2 text-xs text-blue-500 hover:text-blue-700">+ adicionar item</button>
              </div>

              <button type="submit" disabled={saving}
                className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                {saving ? "Salvando..." : "Criar lanche"}
              </button>
            </form>
          )}
        </div>
      )}

      {abertos.length === 0 && <p className="text-slate-500 text-sm">Nenhum lanche coletivo aberto.</p>}

      {abertos.map(p => {
        const meu = meuPedidoExistente(p)
        const totalArrecadar = p.pedidos.reduce((s, pa) => s + totalAluno(p, pa), 0)
        const pagos = p.pedidos.filter(pa => pa.pago).length
        // consolidado por item
        const consolidado = p.itens.map(i => ({
          nome: i.nome,
          qtd: p.pedidos.reduce((s, pa) => s + (pa.linhas.find(l => l.itemId === i.id)?.quantidade ?? 0), 0),
        })).filter(c => c.qtd > 0)

        return (
          <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">{p.titulo}</h3>
                <p className="text-slate-600 text-sm mt-1">
                  {p.restaurante && <>{p.restaurante} · </>}
                  {p.pedidos.length} pedido(s) · {fmtMoeda(totalArrecadar)}
                  {p.prazo && <> · Prazo: {fmtData(p.prazo)}</>}
                </p>
                {p.instrucoes && <p className="text-slate-500 text-xs mt-1 whitespace-pre-wrap">{p.instrucoes}</p>}
              </div>
              {isAdmin && (
                <div className="flex flex-col gap-1 items-end shrink-0">
                  <button onClick={() => toggleAberto(p)} className="text-slate-400 hover:text-slate-600 text-xs">Encerrar pedidos</button>
                  <button onClick={() => excluirPedido(p.id)} className="text-red-400 hover:text-red-600 text-xs">Excluir</button>
                </div>
              )}
            </div>

            {/* montar meu pedido */}
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold text-slate-600 mb-2">Meu pedido</p>
              <div className="space-y-1.5">
                {p.itens.map(i => (
                  <div key={i.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-slate-700">{i.nome} <span className="text-slate-400 text-xs">{fmtMoeda(i.preco)}</span></span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQtd(p.id, i.id, qtdAtual(p, i.id) - 1)}
                        className="w-6 h-6 rounded border border-slate-300 text-slate-600 leading-none">−</button>
                      <span className="w-5 text-center">{qtdAtual(p, i.id)}</span>
                      <button onClick={() => setQtd(p.id, i.id, qtdAtual(p, i.id) + 1)}
                        className="w-6 h-6 rounded border border-slate-300 text-slate-600 leading-none">+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-semibold text-slate-700">Total: {fmtMoeda(meuTotalForm(p))}</span>
                <button onClick={() => salvarMeuPedido(p)} disabled={saving}
                  className="bg-yellow-500 text-black px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50">
                  {meu ? "Atualizar pedido" : "Salvar pedido"}
                </button>
              </div>

              {meu && (
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                  <span className={`font-semibold ${meu.pago ? "text-green-600" : meu.declaradoPago ? "text-amber-600" : "text-red-500"}`}>
                    {meu.pago ? `✓ Pago em ${fmtData(meu.dataPagamento)}` : meu.declaradoPago ? "● Declarado — aguardando confirmação" : "✗ A pagar"}
                  </span>
                  {!meu.pago && !meu.declaradoPago && (
                    <button onClick={() => declararPago(meu.token)} className="text-xs text-blue-500 hover:text-blue-700">já paguei</button>
                  )}
                  {!meu.pago && (
                    <button onClick={() => copiarLink(meu.token)} className="text-xs text-blue-500 hover:text-blue-700">
                      {copiado === meu.token ? "✓ link copiado" : "copiar meu link"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* visão coletiva */}
            <div className="mt-3 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{pagos}/{p.pedidos.length} pagaram</span>
                <button onClick={() => setExpandida(expandida === p.id ? null : p.id)} className="text-blue-500 hover:text-blue-700">
                  {expandida === p.id ? "ocultar" : "ver pedido coletivo"}
                </button>
              </div>

              {expandida === p.id && (
                <div className="mt-3 space-y-3">
                  {consolidado.length > 0 && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Resumo p/ o restaurante</p>
                      {consolidado.map((c, i) => (
                        <div key={i} className="text-sm text-slate-700">{c.qtd}× {c.nome}</div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-1">
                    {p.pedidos.map(pa => (
                      <div key={pa.id} className="flex items-center gap-2 text-sm py-0.5">
                        <span className={pa.pago ? "text-green-600" : "text-slate-400"}>{pa.pago ? "✓" : "○"}</span>
                        <span className="flex-1 text-slate-700">
                          {pa.user.matricula} — {pa.user.nomeGuerra}
                          <span className="text-slate-400"> · {fmtMoeda(totalAluno(p, pa))}</span>
                          {!pa.pago && pa.declaradoPago && <span className="text-amber-500 text-xs"> (declarou pago)</span>}
                        </span>
                        {isAdmin && (
                          <>
                            {!pa.pago && (
                              <button onClick={() => copiarLink(pa.token)} title="Copiar link de pagamento"
                                className="text-slate-300 hover:text-blue-500 text-xs">{copiado === pa.token ? "✓" : "🔗"}</button>
                            )}
                            <button onClick={() => confirmarPago(pa)}
                              className={`text-xs ${pa.pago ? "text-slate-400 hover:text-slate-600" : "text-green-600 hover:text-green-700"}`}>
                              {pa.pago ? "desfazer" : "confirmar pago"}
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                    {p.pedidos.length === 0 && <p className="text-slate-400 text-sm">Ninguém pediu ainda.</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {encerrados.length > 0 && (
        <details className="text-sm">
          <summary className="text-slate-500 cursor-pointer">Lanches encerrados ({encerrados.length})</summary>
          <div className="space-y-2 mt-2">
            {encerrados.map(p => {
              const totalArrecadar = p.pedidos.reduce((s, pa) => s + totalAluno(p, pa), 0)
              return (
                <div key={p.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="text-slate-600">{p.titulo} — {fmtMoeda(totalArrecadar)} ({p.pedidos.length})</span>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => toggleAberto(p)} className="text-blue-500 hover:text-blue-700 text-xs">Reabrir</button>
                      <button onClick={() => excluirPedido(p.id)} className="text-red-400 hover:text-red-600 text-xs">Excluir</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </details>
      )}
    </div>
  )
}
