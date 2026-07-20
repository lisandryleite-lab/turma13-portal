"use client"

import { useState } from "react"
import Link from "next/link"

export type PessoaPedido = {
  token: string
  nome: string
  matricula: number
  respondeu: boolean
  detalhe?: string // resumo do que a pessoa pediu
}

export function ListaPedido({ pessoas }: { pessoas: PessoaPedido[] }) {
  const [busca, setBusca] = useState("")

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
        {filtradas.map(p => (
          <Link key={p.token} href={`/pedido/${p.token}`}
            className="flex items-center gap-2 px-3 py-2 text-sm no-underline hover:bg-slate-50">
            <span className={p.respondeu ? "text-green-600" : "text-slate-400"}>{p.respondeu ? "✓" : "○"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-slate-700 truncate">{p.matricula} — {p.nome}</p>
              {p.detalhe && <p className="text-xs text-slate-400 truncate">{p.detalhe}</p>}
            </div>
            <span className="text-xs font-semibold shrink-0" style={{ color: p.respondeu ? "#1f9d63" : "#2c66c9" }}>
              {p.respondeu ? "alterar" : "sou eu"}
            </span>
          </Link>
        ))}
        {filtradas.length === 0 && <p className="text-slate-400 text-sm px-3 py-4 text-center">Nenhum nome encontrado.</p>}
      </div>
    </div>
  )
}
