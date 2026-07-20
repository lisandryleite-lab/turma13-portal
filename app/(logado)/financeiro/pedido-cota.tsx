"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  consolidar, parseResposta, totalPecas,
  type FormularioCota, type ItemPedido, type RespostaFormulario,
} from "@/lib/formulario-cota"

type PagamentoComResposta = {
  id: string
  userId: string
  respostas?: unknown
  user: { matricula: number; nomeGuerra: string }
}

const linhaVazia = (form: FormularioCota): ItemPedido => ({
  modelo: form.modelos[0]?.id ?? "",
  versao: form.versoes[0] ?? "",
  tamanho: form.tamanhos[Math.floor(form.tamanhos.length / 2)] ?? "",
  quantidade: 1,
})

const inputCls = "border rounded-lg px-2 py-1.5 text-xs bg-white"

// ── Formulário do próprio aluno ───────────────────────────────────────────────
export function MeuPedido({ cotaId, form, respostaAtual, valorUnitario }: {
  cotaId: string
  form: FormularioCota
  respostaAtual: unknown
  valorUnitario: number
}) {
  const router = useRouter()
  const inicial = parseResposta(respostaAtual)
  const [campos, setCampos] = useState<Record<string, string>>(inicial.campos)
  const [itens, setItens] = useState<ItemPedido[]>(inicial.itens.length ? inicial.itens : [linhaVazia(form)])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const total = itens.reduce((s, i) => s + (i.quantidade || 0), 0)
  const jaRespondeu = inicial.itens.length > 0

  function atualizarItem(idx: number, patch: Partial<ItemPedido>) {
    setItens(prev => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  async function salvar() {
    setSaving(true)
    setMsg(null)
    const res = await fetch("/api/financeiro/pedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cotaId, respostas: { campos, itens } }),
    })
    setSaving(false)
    if (!res.ok) {
      const e = await res.json().catch(() => ({}))
      setMsg(e.error || "Não foi possível salvar.")
      return
    }
    setMsg("Pedido registrado ✓")
    router.refresh()
  }

  return (
    <div className="rounded-xl p-4 mb-3" style={{ background: "#f7f9fc", border: "1px solid #e2e8f4" }}>
      <div className="flex items-baseline gap-2 flex-wrap mb-1">
        <span className="text-[13px] font-extrabold" style={{ color: "#14294e" }}>
          {form.titulo || "Meu pedido"}
        </span>
        {jaRespondeu && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#eafaf1", color: "#1f9d63" }}>
            já respondido
          </span>
        )}
      </div>
      {form.descricao && <p className="text-[11.5px] mb-3" style={{ color: "#8291ab" }}>{form.descricao}</p>}

      {/* Campos gerais */}
      <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
        {form.campos.map(c => (
          <label key={c.id} className="flex flex-col gap-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: "#93a1ba" }}>
              {c.label}{c.obrigatorio && <span style={{ color: "#d6553a" }}> *</span>}
            </span>
            {c.tipo === "select" ? (
              <select value={campos[c.id] || ""} onChange={e => setCampos(p => ({ ...p, [c.id]: e.target.value }))}
                className={inputCls} style={{ borderColor: "#dde4ef" }}>
                <option value="">—</option>
                {(c.opcoes || []).map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input value={campos[c.id] || ""} onChange={e => setCampos(p => ({ ...p, [c.id]: e.target.value }))}
                placeholder={c.ajuda} className={inputCls} style={{ borderColor: "#dde4ef" }} />
            )}
          </label>
        ))}
      </div>

      {/* Linhas de peças */}
      <div className="space-y-2">
        {itens.map((it, idx) => (
          <div key={idx} className="flex gap-2 items-end flex-wrap">
            <label className="flex flex-col gap-1 flex-1 min-w-[140px]">
              <span className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: "#93a1ba" }}>Modelo / cor</span>
              <select value={it.modelo} onChange={e => atualizarItem(idx, { modelo: e.target.value })}
                className={inputCls} style={{ borderColor: "#dde4ef" }}>
                {form.modelos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 flex-1 min-w-[130px]">
              <span className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: "#93a1ba" }}>Versão</span>
              <select value={it.versao} onChange={e => atualizarItem(idx, { versao: e.target.value })}
                className={inputCls} style={{ borderColor: "#dde4ef" }}>
                {form.versoes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1" style={{ width: 88 }}>
              <span className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: "#93a1ba" }}>Tamanho</span>
              <select value={it.tamanho} onChange={e => atualizarItem(idx, { tamanho: e.target.value })}
                className={inputCls} style={{ borderColor: "#dde4ef" }}>
                {form.tamanhos.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1" style={{ width: 70 }}>
              <span className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: "#93a1ba" }}>Qtd.</span>
              <input type="number" min={0} max={20} value={it.quantidade}
                onChange={e => atualizarItem(idx, { quantidade: Number(e.target.value) })}
                className={inputCls} style={{ borderColor: "#dde4ef" }} />
            </label>
            {itens.length > 1 && (
              <button onClick={() => setItens(prev => prev.filter((_, i) => i !== idx))}
                title="Remover linha" className="text-slate-300 hover:text-red-500 text-sm pb-2">✕</button>
            )}
          </div>
        ))}
      </div>

      <button onClick={() => setItens(prev => [...prev, linhaVazia(form)])}
        className="text-[11px] font-semibold mt-2" style={{ color: "#2c66c9" }}>
        + Adicionar outra peça
      </button>

      <div className="flex items-center gap-3 flex-wrap mt-3 pt-3" style={{ borderTop: "1px solid #e6ebf4" }}>
        <button onClick={salvar} disabled={saving}
          className="text-xs font-bold text-white px-4 py-2 rounded-[9px] disabled:opacity-50"
          style={{ background: "#14294e" }}>
          {saving ? "Salvando…" : jaRespondeu ? "Atualizar meu pedido" : "Registrar meu pedido"}
        </button>
        <span className="text-[11.5px]" style={{ color: "#8291ab" }}>
          {total} peça{total === 1 ? "" : "s"} · estimado{" "}
          <strong style={{ color: "#14294e" }}>
            {(total * valorUnitario).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </strong>
        </span>
        {msg && <span className="text-[11.5px] font-semibold" style={{ color: msg.includes("✓") ? "#1f9d63" : "#d6553a" }}>{msg}</span>}
      </div>
    </div>
  )
}

// ── Consolidado do gestor ─────────────────────────────────────────────────────
export function ConsolidadoPedidos({ form, pagamentos, valorUnitario }: {
  form: FormularioCota
  pagamentos: PagamentoComResposta[]
  valorUnitario: number
}) {
  const [aberto, setAberto] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const respostas: { p: PagamentoComResposta; r: RespostaFormulario }[] = pagamentos
    .map(p => ({ p, r: parseResposta(p.respostas) }))
    .filter(x => x.r.itens.length > 0)

  const linhas = consolidar(respostas.map(x => x.r))
  const totalPecasGeral = linhas.reduce((s, l) => s + l.quantidade, 0)
  const nomeModelo = (id: string) => form.modelos.find(m => m.id === id)?.nome ?? id
  const semResposta = pagamentos.filter(p => parseResposta(p.respostas).itens.length === 0)

  function textoPedido() {
    const cab = ["*Levantamento — " + (form.titulo || "Pedido") + "*", ""]
    const consolidado = linhas.map(l => `${nomeModelo(l.modelo)} · ${l.versao} · ${l.tamanho} — ${l.quantidade}`)
    const porAluno = respostas.map(({ p, r }) => {
      const ident = form.campos.map(c => r.campos[c.id]).filter(Boolean).join(" · ")
      const pecas = r.itens.map(i => `${i.quantidade}x ${nomeModelo(i.modelo)} ${i.tamanho} ${i.versao}`).join(" + ")
      return `${p.user.matricula} ${p.user.nomeGuerra}${ident ? ` (${ident})` : ""}: ${pecas}`
    })
    return [...cab, ...consolidado, "", `TOTAL: ${totalPecasGeral} peças`, "", "*Por aluno*", ...porAluno].join("\n")
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(textoPedido())
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch { /* clipboard indisponível */ }
  }

  return (
    <div className="rounded-xl p-4 mb-3" style={{ background: "#fff", border: "1px solid #e2e8f4" }}>
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="text-[13px] font-extrabold" style={{ color: "#14294e" }}>📋 Levantamento</span>
        <span className="text-[11.5px]" style={{ color: "#8291ab" }}>
          {respostas.length}/{pagamentos.length} responderam · {totalPecasGeral} peça{totalPecasGeral === 1 ? "" : "s"} ·{" "}
          {(totalPecasGeral * valorUnitario).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>
        <div className="flex-1" />
        <button onClick={copiar} className="text-xs font-bold text-white px-3 py-1.5 rounded-[9px]" style={{ background: "#14294e" }}>
          {copiado ? "✓ copiado" : "Copiar pedido"}
        </button>
      </div>

      {linhas.length === 0 ? (
        <p className="text-[12px]" style={{ color: "#8291ab" }}>Ninguém respondeu ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="text-[12px] w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f4f7fc" }}>
                {["Modelo", "Versão", "Tamanho", "Qtd."].map(h => (
                  <th key={h} className="text-left font-bold px-2.5 py-1.5 text-[10.5px] uppercase tracking-wide"
                    style={{ color: "#93a1ba" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.map(l => (
                <tr key={`${l.modelo}|${l.versao}|${l.tamanho}`} style={{ borderTop: "1px solid #eef2f8" }}>
                  <td className="px-2.5 py-1.5 font-semibold" style={{ color: "#3c4a63" }}>{nomeModelo(l.modelo)}</td>
                  <td className="px-2.5 py-1.5" style={{ color: "#6b7a94" }}>{l.versao}</td>
                  <td className="px-2.5 py-1.5 font-bold" style={{ color: "#14294e" }}>{l.tamanho}</td>
                  <td className="px-2.5 py-1.5 font-extrabold" style={{ color: "#14294e" }}>{l.quantidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button onClick={() => setAberto(!aberto)} className="text-[11px] font-semibold mt-3" style={{ color: "#2c66c9" }}>
        {aberto ? "Ocultar" : "Ver"} respostas por aluno
      </button>

      {aberto && (
        <div className="mt-2 space-y-1">
          {respostas.map(({ p, r }) => (
            <div key={p.id} className="text-[11.5px] px-2.5 py-1.5 rounded-lg" style={{ background: "#f7f9fc" }}>
              <span className="font-bold" style={{ color: "#9aa8bf" }}>{p.user.matricula}</span>{" "}
              <span className="font-semibold" style={{ color: "#3c4a63" }}>{p.user.nomeGuerra}</span>
              <span style={{ color: "#8291ab" }}>
                {form.campos.map(c => r.campos[c.id]).filter(Boolean).length > 0 && (
                  <> · {form.campos.map(c => r.campos[c.id]).filter(Boolean).join(" · ")}</>
                )}
                {" — "}
                {r.itens.map(i => `${i.quantidade}x ${nomeModelo(i.modelo)} ${i.tamanho} ${i.versao}`).join(" + ")}
                {" "}({totalPecas(r)})
              </span>
            </div>
          ))}
          {semResposta.length > 0 && (
            <p className="text-[11px] pt-1.5" style={{ color: "#d6553a" }}>
              Faltam responder ({semResposta.length}): {semResposta.map(p => p.user.nomeGuerra).join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
