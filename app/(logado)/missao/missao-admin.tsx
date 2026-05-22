"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function MissaoAdmin({ semanaAtual }: { semanaAtual: number }) {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [semana, setSemana] = useState(String(semanaAtual))
  const [titulo, setTitulo] = useState("")
  const [corpo, setCorpo] = useState("")
  const [saving, setSaving] = useState(false)

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/missao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ semana: Number(semana), titulo, corpo }),
    })
    setSaving(false)
    setShow(false)
    router.refresh()
  }

  return (
    <div>
      <button onClick={() => setShow(!show)}
        className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">
        {show ? "Cancelar" : "+ Publicar missão"}
      </button>
      {show && (
        <form onSubmit={salvar} className="mt-4 bg-slate-800 text-white rounded-xl p-5 space-y-3">
          <div className="flex gap-3">
            <div>
              <label className="text-xs text-slate-400">Semana</label>
              <input type="number" min={1} max={52} value={semana} onChange={(e) => setSemana(e.target.value)}
                className="block bg-slate-700 rounded px-2 py-1.5 text-sm w-20 mt-0.5" required />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Título</label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)}
              className="block w-full bg-slate-700 rounded px-3 py-2 text-sm mt-0.5" required />
          </div>
          <div>
            <label className="text-xs text-slate-400">Missão</label>
            <textarea value={corpo} onChange={(e) => setCorpo(e.target.value)} rows={5}
              className="block w-full bg-slate-700 rounded px-3 py-2 text-sm mt-0.5 resize-none" required />
          </div>
          <button type="submit" disabled={saving}
            className="bg-yellow-500 text-black font-semibold px-4 py-2 rounded text-sm disabled:opacity-50">
            {saving ? "Salvando..." : "Publicar"}
          </button>
        </form>
      )}
    </div>
  )
}
