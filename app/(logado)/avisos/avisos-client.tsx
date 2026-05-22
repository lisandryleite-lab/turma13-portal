"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Aviso = { id: string; titulo: string; corpo: string; fixado: boolean; createdAt: Date }

export function AvisosClient({ avisos: inicial, isAdmin }: { avisos: Aviso[]; isAdmin: boolean }) {
  const router = useRouter()
  const [avisos, setAvisos] = useState(inicial)
  const [showForm, setShowForm] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [corpo, setCorpo] = useState("")
  const [fixado, setFixado] = useState(false)
  const [saving, setSaving] = useState(false)

  async function criarAviso(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/avisos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, corpo, fixado }),
    })
    setSaving(false)
    setShowForm(false)
    setTitulo("")
    setCorpo("")
    setFixado(false)
    router.refresh()
  }

  async function deletar(id: string) {
    if (!confirm("Excluir aviso?")) return
    await fetch(`/api/avisos/${id}`, { method: "DELETE" })
    setAvisos((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">
            {showForm ? "Cancelar" : "+ Novo Aviso"}
          </button>
          {showForm && (
            <form onSubmit={criarAviso} className="mt-4 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
              <textarea value={corpo} onChange={(e) => setCorpo(e.target.value)} placeholder="Conteúdo do aviso"
                rows={4} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none" required />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={fixado} onChange={(e) => setFixado(e.target.checked)} />
                Fixar aviso
              </label>
              <button type="submit" disabled={saving}
                className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                {saving ? "Salvando..." : "Publicar"}
              </button>
            </form>
          )}
        </div>
      )}

      {avisos.length === 0 && <p className="text-slate-500 text-sm">Nenhum aviso publicado ainda.</p>}

      {avisos.map((a) => (
        <div key={a.id} className={`bg-white border rounded-xl p-5 ${a.fixado ? "border-yellow-300 bg-yellow-50" : "border-slate-200"}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-800">
                {a.fixado && <span className="text-yellow-600 mr-1">📌</span>}
                {a.titulo}
              </h3>
              <p className="text-slate-600 text-sm mt-1 whitespace-pre-wrap">{a.corpo}</p>
              <p className="text-slate-400 text-xs mt-2">{new Date(a.createdAt).toLocaleDateString("pt-BR")}</p>
            </div>
            {isAdmin && (
              <button onClick={() => deletar(a.id)} className="text-red-400 hover:text-red-600 text-xs shrink-0">
                Excluir
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
