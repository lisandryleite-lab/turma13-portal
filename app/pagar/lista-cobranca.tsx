"use client"

import { useState } from "react"

export type Pessoa = {
  token: string
  nome: string
  matricula: number
  pago: boolean
  declaradoPago: boolean
  detalhe?: string // ex.: total do lanche
}

export function ListaCobranca({ pessoas }: { pessoas: Pessoa[] }) {
  const [busca, setBusca] = useState("")
  const [estado, setEstado] = useState<Record<string, "declarando" | "declarado">>({})

  async function declarar(token: string) {
    setEstado(s => ({ ...s, [token]: "declarando" }))
    try {
      const res = await fetch(`/api/pagar/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
      if (res.ok) setEstado(s => ({ ...s, [token]: "declarado" }))
      else setEstado(s => { const n = { ...s }; delete n[token]; return n })
    } catch {
      setEstado(s => { const n = { ...s }; delete n[token]; return n })
    }
  }

  const termo = busca.trim().toLowerCase()
  const filtradas = termo
    ? pessoas.filter(p => p.nome.toLowerCase().includes(termo) || String(p.matricula).includes(termo))
    : pessoas

  return (
    <div className="mt-4">
      <input
        value={busca}
        onChange={e => setBusca(e.target.value)}
        placeholder="🔎 Ache seu nome…"
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-2"
      />
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
        {filtradas.map(p => {
          const st = estado[p.token]
          const declarado = p.declaradoPago || st === "declarado"
          return (
            <div key={p.token} className="flex items-center gap-2 px-3 py-2 text-sm">
              <span className={p.pago ? "text-green-600" : "text-slate-400"}>{p.pago ? "✓" : "○"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-slate-700 truncate">{p.matricula} — {p.nome}</p>
                {p.detalhe && <p className="text-xs text-slate-400 truncate">{p.detalhe}</p>}
              </div>
              {p.pago ? (
                <span className="text-xs font-semibold text-green-600 shrink-0">pago</span>
              ) : declarado ? (
                <span className="text-xs font-semibold text-amber-600 shrink-0">aguardando confirmação</span>
              ) : (
                <button
                  onClick={() => declarar(p.token)}
                  disabled={st === "declarando"}
                  className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg shrink-0 disabled:opacity-50"
                  style={{ background: "var(--azul-profundo, #0B2D5E)" }}
                >
                  {st === "declarando" ? "…" : "Sou eu — já paguei"}
                </button>
              )}
            </div>
          )
        })}
        {filtradas.length === 0 && <p className="text-slate-400 text-sm px-3 py-4 text-center">Nenhum nome encontrado.</p>}
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-400">
        A confirmação final é feita pelo responsável após verificar o pagamento.
      </p>
    </div>
  )
}
