"use client"

import { useState } from "react"

export function ConfirmarPagamento({ token, jaDeclarado }: { token: string; jaDeclarado: boolean }) {
  const [declarado, setDeclarado] = useState(jaDeclarado)
  const [obs, setObs] = useState("")
  const [saving, setSaving] = useState(false)

  async function declarar() {
    setSaving(true)
    const res = await fetch(`/api/pagar/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ observacao: obs || undefined }),
    })
    setSaving(false)
    if (res.ok) setDeclarado(true)
  }

  if (declarado) {
    return (
      <div className="mt-5 bg-amber-50 border border-amber-300 rounded-lg p-4 text-center">
        <p className="text-amber-800 text-sm font-semibold">Recebemos sua confirmação 👍</p>
        <p className="text-amber-700 text-xs mt-1">O responsável vai validar o pagamento. Obrigado!</p>
      </div>
    )
  }

  return (
    <div className="mt-5 space-y-3">
      <input
        value={obs}
        onChange={e => setObs(e.target.value)}
        placeholder="Observação (opcional — ex: paguei pela esposa)"
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
      />
      <button
        onClick={declarar}
        disabled={saving}
        className="w-full text-white px-4 py-3 rounded-lg text-sm font-semibold disabled:opacity-50"
        style={{ background: "var(--azul-profundo, #0B2D5E)" }}
      >
        {saving ? "Enviando..." : "✓ Já fiz o pagamento"}
      </button>
    </div>
  )
}
