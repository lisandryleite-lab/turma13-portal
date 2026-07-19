"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LanchesClient, type Pedido } from "./lanches-client"

type Aluno = { id: string; matricula: number; nomeGuerra: string; turma13: boolean }
type Pagamento = {
  id: string
  userId: string
  valor: number | null
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
  token: string
  tipo: string
  valor: number
  responsavel: string
  instrucoes: string | null
  driveFolderUrl: string | null
  prazo: string | Date | null
  ativa: boolean
  criadoPorId: string | null
  createdAt: string | Date
  pagamentos: Pagamento[]
}

const fmtMoeda = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
const fmtData = (d: string | Date | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "")

// Valor efetivo de um pagamento: o individual (cota de valor variável) sobrepõe o valor da cota.
const valorPag = (c: Cota, p: Pagamento) => (p.valor != null ? p.valor : c.valor)
// A cota tem valor por pessoa (algum pagamento com valor individual próprio)?
const temValorVariavel = (c: Cota) => c.pagamentos.some(p => p.valor != null)

function Metrica({ label, valor, bg = "#f4f7fc", border = "#e8edf6", labelColor = "#93a1ba", valorColor = "#1c2b45" }:
  { label: string; valor: string; bg?: string; border?: string; labelColor?: string; valorColor?: string }) {
  return (
    <div className="rounded-[10px] px-3 py-1.5" style={{ background: bg, border: `1px solid ${border}`, minWidth: 90 }}>
      <div className="text-[9.5px] font-bold uppercase tracking-wide" style={{ color: labelColor }}>{label}</div>
      <div className="text-[14px] font-extrabold mt-px" style={{ color: valorColor }}>{valor}</div>
    </div>
  )
}

export function FinanceiroClient({ cotas: inicial, alunos, lanches, isAdmin, podeCriar, minhaMatricula, minhaId }: { cotas: Cota[]; alunos: Aluno[]; lanches: Pedido[]; isAdmin: boolean; podeCriar: boolean; minhaMatricula: number; minhaId: string }) {
  const router = useRouter()
  const [cotas, setCotas] = useState(inicial)
  const [aba, setAba] = useState<"mensal" | "extra" | "lanche">("mensal")
  const [showForm, setShowForm] = useState(false)
  const [expandida, setExpandida] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [copiado, setCopiado] = useState<string | null>(null)
  const [busca, setBusca] = useState("")
  const [soFalta, setSoFalta] = useState<Record<string, boolean>>({})
  const [form, setForm] = useState({ titulo: "", valor: "", responsavel: "", instrucoes: "", drive: "", prazo: "" })
  const alunosT13 = alunos.filter(a => a.turma13)
  const [participantes, setParticipantes] = useState<Set<string>>(new Set(alunosT13.map(a => a.id)))
  const [addAluno, setAddAluno] = useState<Record<string, string>>({})
  const [obsCobranca, setObsCobranca] = useState<Record<string, string>>({}) // observação por cota p/ a mensagem
  const [driveEdit, setDriveEdit] = useState<Record<string, string>>({}) // edição do link do Drive por cota

  function linkPagamento(token: string) {
    return typeof window !== "undefined" ? `${window.location.origin}/pagar/${token}` : `/pagar/${token}`
  }
  async function copiar(texto: string, chave: string) {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(chave)
      setTimeout(() => setCopiado(c => (c === chave ? null : c)), 2000)
    } catch { /* clipboard indisponível */ }
  }
  const copiarLink = (token: string) => copiar(linkPagamento(token), token)
  function linkColetivoCota(c: Cota) {
    return typeof window !== "undefined" ? `${window.location.origin}/pagar/c/${c.token}` : `/pagar/c/${c.token}`
  }

  // mensagem de cobrança do GRUPO pronta p/ WhatsApp (link coletivo — cada um acha o próprio nome)
  function mensagemCobranca(c: Cota) {
    return [
      `*Cobrança — ${c.titulo}* (Turma 13)`,
      temValorVariavel(c) ? `Valor: individual (ache seu nome no link)` : `Valor: ${fmtMoeda(c.valor)}`,
      c.prazo ? `Prazo: ${fmtData(c.prazo)}` : "",
      c.responsavel ? `Pagar para: ${c.responsavel}` : "",
      c.instrucoes || "",
      (obsCobranca[c.id] || "").trim(),
      "",
      `Acesse, ache seu nome e confirme o pagamento: ${linkColetivoCota(c)}`,
    ].filter(l => l !== "").join("\n")
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
      body: JSON.stringify({ ...form, driveFolderUrl: form.drive, tipo: aba, participantes: [...participantes] }),
    })
    setSaving(false)
    setShowForm(false)
    setForm({ titulo: "", valor: "", responsavel: "", instrucoes: "", drive: "", prazo: "" })
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

  async function salvarDrive(c: Cota) {
    const url = (driveEdit[c.id] ?? c.driveFolderUrl ?? "").trim()
    await fetch("/api/financeiro/cotas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, driveFolderUrl: url }),
    })
    setCotas(prev => prev.map(x => x.id === c.id ? { ...x, driveFolderUrl: url || null } : x))
    setDriveEdit(prev => { const n = { ...prev }; delete n[c.id]; return n })
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

  // Gerir a cota (encerrar/excluir): gestor OU quem criou a cota.
  const podeGerir = (c: Cota) => isAdmin || c.criadoPorId === minhaId

  const cotasAtivas = cotas.filter(c => c.ativa && c.tipo === aba)
  const cotasEncerradas = cotas.filter(c => !c.ativa && c.tipo === aba)
  const minhasPendentes = cotas.filter(c => c.ativa && c.pagamentos.find(p => p.user.matricula === minhaMatricula && !p.pago))

  // resumo da aba atual (cotas) — pra dar a visão sem rolar
  let aReceber = 0, recebido = 0, totalPessoas = 0, pagosPessoas = 0
  for (const c of cotasAtivas) {
    for (const p of c.pagamentos) {
      totalPessoas++
      const v = valorPag(c, p)
      if (p.pago) { pagosPessoas++; recebido += v } else aReceber += v
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
        <div className="rounded-[16px] px-5 py-4 flex items-center gap-5 flex-wrap"
          style={{ background: "linear-gradient(120deg,#14294e 0%,#1b3a6b 100%)", boxShadow: "0 8px 22px rgba(20,41,78,.22)" }}>
          <div className="flex-1 min-w-[90px]">
            <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#9db0d1" }}>Recebido</div>
            <div className="text-[22px] font-extrabold mt-0.5" style={{ color: "#5fd39a" }}>{fmtMoeda(recebido)}</div>
          </div>
          <div style={{ width: 1, height: 34, background: "rgba(255,255,255,.12)" }} />
          <div className="flex-1 min-w-[90px]">
            <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#9db0d1" }}>A receber</div>
            <div className="text-[22px] font-extrabold mt-0.5" style={{ color: "#e6b23e" }}>{fmtMoeda(aReceber)}</div>
          </div>
          <div style={{ width: 1, height: 34, background: "rgba(255,255,255,.12)" }} />
          <div className="flex-1 min-w-[80px]">
            <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#9db0d1" }}>Pagaram</div>
            <div className="text-[22px] font-extrabold mt-0.5 text-white">{pagosPessoas}/{totalPessoas}</div>
          </div>
          <div className="flex-[1.4] min-w-[140px]">
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.14)" }}>
              <div className="h-full rounded-full" style={{ width: `${pctResumo}%`, background: "linear-gradient(90deg,#5fd39a,#37b37e)", transition: "width .4s" }} />
            </div>
            <div className="text-[11px] font-semibold mt-1.5 text-right" style={{ color: "#9db0d1" }}>{pctResumo}% arrecadado</div>
          </div>
        </div>
      )}

      {aba !== "lanche" && (
        <div className="flex items-center gap-3 flex-wrap">
          {podeCriar && (
            <button onClick={() => setShowForm(!showForm)}
              className="text-white px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: "var(--azul-profundo, #0B2D5E)" }}>
              {showForm ? "Cancelar" : `+ Nova cota ${aba === "extra" ? "extra" : "mensal"}`}
            </button>
          )}
          <div className="flex-1" />
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 min-w-[200px]">
            <span className="text-slate-400 text-sm">⌕</span>
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar cota…"
              className="outline-none text-sm w-full bg-transparent" />
          </div>
        </div>
      )}

      {aba !== "lanche" && podeCriar && showForm && (
            <form onSubmit={criarCota} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
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
              <input value={form.drive} onChange={e => setForm({ ...form, drive: e.target.value })}
                placeholder="📁 Link da pasta do Google Drive (comprovantes) — opcional" type="url"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />

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

      {aba !== "lanche" && cotasAtivas.length === 0 && <p className="text-slate-500 text-sm">Nenhuma cota {aba === "extra" ? "extra" : "mensal"} em aberto.</p>}

      {cotasAtivas.filter(c => c.titulo.toLowerCase().includes(busca.trim().toLowerCase())).map(c => {
        const meuPagamento = c.pagamentos.find(p => p.user.matricula === minhaMatricula)
        const pagos = c.pagamentos.filter(p => p.pago).length
        const total = c.pagamentos.length
        const pct = total > 0 ? Math.round((pagos / total) * 100) : 0
        const quitada = total > 0 && pagos === total
        const variavel = temValorVariavel(c)
        const vTotal = c.pagamentos.reduce((s, p) => s + valorPag(c, p), 0)
        const vArrecadado = c.pagamentos.reduce((s, p) => s + (p.pago ? valorPag(c, p) : 0), 0)
        const vFalta = vTotal - vArrecadado
        const aberta = expandida === c.id
        const soFaltaC = soFalta[c.id]
        const lista = soFaltaC ? c.pagamentos.filter(p => !p.pago) : c.pagamentos
        return (
          <div key={c.id} className="bg-white rounded-[14px] overflow-hidden" style={{ border: "1px solid #e4e9f2", boxShadow: "0 2px 8px rgba(20,41,78,.05)" }}>
            {/* Header recolhido */}
            <div onClick={() => setExpandida(aberta ? null : c.id)} className="flex items-center gap-4 px-4 py-3.5 cursor-pointer">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-extrabold truncate" style={{ color: "#14294e" }}>{c.titulo}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={quitada ? { background: "#eafaf1", color: "#1f9d63" } : { background: "#fdf0ec", color: "#d6553a" }}>
                    {quitada ? "quitada" : "em aberto"}
                  </span>
                </div>
                <div className="text-xs mt-0.5 truncate" style={{ color: "#8291ab" }}>
                  {c.responsavel && <>{c.responsavel} · </>}{pagos}/{total} pagaram · {fmtMoeda(vArrecadado)} de {fmtMoeda(vTotal)}
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mt-2" style={{ background: "#eef2f8", maxWidth: 340 }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: quitada ? "#1f9d63" : "#e6b23e", transition: "width .4s" }} />
                </div>
              </div>
              {/* Métricas */}
              <div className="hidden sm:flex gap-2 shrink-0 flex-wrap justify-end" style={{ maxWidth: 420 }}>
                <Metrica label="Individual" valor={variavel ? "vários" : fmtMoeda(c.valor)} />
                <Metrica label="Total" valor={fmtMoeda(vTotal)} />
                <Metrica label="Arrecadado" valor={fmtMoeda(vArrecadado)} bg="#eafaf1" border="#cdeedb" labelColor="#3a9d6d" valorColor="#1f9d63" />
                <Metrica label="Falta" valor={fmtMoeda(vFalta)} bg="#fdf0ec" border="#f6d5c9" labelColor="#c76b4e" valorColor="#d6553a" />
              </div>
              <span className="shrink-0 text-slate-400 transition-transform" style={{ transform: aberta ? "rotate(180deg)" : "none" }}>⌄</span>
            </div>

            {aberta && (
              <div className="px-4 pb-4 pt-3" style={{ borderTop: "1px solid #eef2f8" }}>
                {/* Métricas no mobile */}
                <div className="flex sm:hidden gap-2 flex-wrap mb-3">
                  <Metrica label="Individual" valor={variavel ? "vários" : fmtMoeda(c.valor)} />
                  <Metrica label="Total" valor={fmtMoeda(vTotal)} />
                  <Metrica label="Arrecadado" valor={fmtMoeda(vArrecadado)} bg="#eafaf1" border="#cdeedb" labelColor="#3a9d6d" valorColor="#1f9d63" />
                  <Metrica label="Falta" valor={fmtMoeda(vFalta)} bg="#fdf0ec" border="#f6d5c9" labelColor="#c76b4e" valorColor="#d6553a" />
                </div>

                {c.instrucoes && <p className="text-slate-500 text-xs mb-3 whitespace-pre-wrap">{c.instrucoes}</p>}

                {/* Linha de ações */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {isAdmin && (
                    <button onClick={() => copiar(mensagemCobranca(c), "msg:" + c.id)}
                      className="text-xs font-bold text-white px-3.5 py-2 rounded-[9px]" style={{ background: "#14294e" }}>
                      {copiado === "msg:" + c.id ? "✓ copiada" : "📋 Copiar cobrança do grupo"}
                    </button>
                  )}
                  {meuPagamento && !meuPagamento.pago && (
                    <button onClick={() => copiarLink(meuPagamento.token)}
                      className="text-xs font-bold px-3.5 py-2 rounded-[9px] bg-white" style={{ color: "#2c66c9", border: "1px solid #d3ddf0" }}>
                      {copiado === meuPagamento.token ? "✓ copiado" : "Copiar meu link"}
                    </button>
                  )}
                  {c.driveFolderUrl && (
                    <a href={c.driveFolderUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-bold px-3.5 py-2 rounded-[9px] no-underline" style={{ background: "#eafaf1", color: "#1f8a58", border: "1px solid #c7ead6" }}>
                      📁 Pasta de comprovantes
                    </a>
                  )}
                  <button onClick={() => setSoFalta(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                    className="text-xs font-bold px-3.5 py-2 rounded-[9px]"
                    style={soFaltaC ? { background: "#14294e", color: "#fff" } : { background: "#fff", color: "#8291ab", border: "1px solid #dde4ef" }}>
                    Só quem falta
                  </button>
                  {podeGerir(c) && (
                    <>
                      <div className="flex-1" />
                      <button onClick={() => encerrarCota(c)} className="text-xs font-semibold" style={{ color: "#8291ab" }}>Encerrar</button>
                      <button onClick={() => excluirCota(c.id)} className="text-xs font-semibold" style={{ color: "#d6553a" }}>Excluir</button>
                    </>
                  )}
                </div>

                {isAdmin && (
                  <input value={obsCobranca[c.id] || ""} onChange={e => setObsCobranca(prev => ({ ...prev, [c.id]: e.target.value }))}
                    placeholder="Observação p/ a mensagem de cobrança (opcional)"
                    className="w-full border rounded-lg px-2 py-1.5 text-xs mb-3" style={{ borderColor: "#dde4ef" }} />

                )}

                {podeGerir(c) && (
                  <div className="flex items-center gap-2 mb-3">
                    <input value={driveEdit[c.id] ?? c.driveFolderUrl ?? ""} onChange={e => setDriveEdit(prev => ({ ...prev, [c.id]: e.target.value }))}
                      placeholder="📁 Link da pasta do Google Drive (comprovantes)" type="url"
                      className="flex-1 border rounded-lg px-2 py-1.5 text-xs" style={{ borderColor: "#dde4ef" }} />
                    <button onClick={() => salvarDrive(c)}
                      className="text-xs font-bold text-white px-3 py-1.5 rounded-lg shrink-0" style={{ background: "#14294e" }}>
                      Salvar link
                    </button>
                  </div>
                )}

                {/* Grade densa de participantes */}
                <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
                  {lista.map(p => (
                    <div key={p.id} onClick={isAdmin ? () => togglePago(p) : undefined}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${isAdmin ? "cursor-pointer" : ""}`}
                      style={{ background: p.pago ? "#eafaf1" : "#f7f9fc", border: "1px solid " + (p.pago ? "#cdeedb" : "#eaeef5") }}>
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded text-[10px] shrink-0"
                        style={p.pago ? { background: "#1f9d63", color: "#fff" } : { background: "#fff", border: "1px solid #cdd6e5" }}>
                        {p.pago ? "✓" : ""}
                      </span>
                      <span className="text-[11px] font-bold shrink-0" style={{ color: "#9aa8bf", minWidth: 24 }}>{p.user.matricula}</span>
                      <span className="text-[12.5px] truncate flex-1" style={{ color: p.pago ? "#1f7d51" : "#3c4a63" }}>{p.user.nomeGuerra}</span>
                      {variavel && <span className="text-[11px] font-bold shrink-0" style={{ color: p.pago ? "#1f7d51" : "#6b7a94" }}>{fmtMoeda(valorPag(c, p))}</span>}
                      {!p.pago && p.declaradoPago && <span title={p.observacao || "declarou que pagou"} className="text-[11px] shrink-0" style={{ color: "#e6b23e" }}>●</span>}
                      {p.pago && c.driveFolderUrl && (
                        <a href={c.driveFolderUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                          title="ver comprovante no Drive" className="text-xs shrink-0" style={{ color: "#1f9d63" }}>📎</a>
                      )}
                      {isAdmin && (
                        <button onClick={e => { e.stopPropagation(); removerPagamento(p.id) }} title="Remover desta cota"
                          className="text-slate-300 hover:text-red-500 text-xs shrink-0">✕</button>
                      )}
                    </div>
                  ))}
                </div>
                {isAdmin && alunos.some(a => !c.pagamentos.find(p => p.userId === a.id)) && (
                  <div className="flex items-center gap-2 mt-3 pt-2" style={{ borderTop: "1px solid #eef2f8" }}>
                    <select value={addAluno[c.id] || ""} onChange={e => setAddAluno(prev => ({ ...prev, [c.id]: e.target.value }))}
                      className="border rounded-lg px-2 py-1 text-xs flex-1" style={{ borderColor: "#dde4ef" }}>
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

      {cotasEncerradas.filter(c => podeGerir(c)).length > 0 && (
        <details className="text-sm">
          <summary className="text-slate-500 cursor-pointer">Cotas encerradas ({cotasEncerradas.filter(c => podeGerir(c)).length})</summary>
          <div className="space-y-2 mt-2">
            {cotasEncerradas.filter(c => podeGerir(c)).map(c => (
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
