"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Aviso = { id: string; titulo: string; corpo: string; fixado: boolean; destaque: boolean; createdAt: Date }

export function AvisosClient({ avisos: init, isAdmin }: { avisos: Aviso[]; isAdmin: boolean }) {
  const router = useRouter()
  const [avisos, setAvisos] = useState(init)
  const [show, setShow] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [corpo, setCorpo] = useState("")
  const [fixado, setFixado] = useState(false)
  const [destaque, setDestaque] = useState(false)
  const [saving, setSaving] = useState(false)

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/avisos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, corpo, fixado, destaque }),
    })
    setSaving(false)
    setShow(false)
    setTitulo(""); setCorpo(""); setFixado(false); setDestaque(false)
    router.refresh()
  }

  async function excluir(id: string) {
    if (!confirm("Excluir aviso?")) return
    await fetch(`/api/avisos/${id}`, { method: "DELETE" })
    setAvisos((a) => a.filter((x) => x.id !== id))
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div>
          <button onClick={() => setShow(!show)} className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
            {show ? "Cancelar" : "+ Novo Aviso"}
          </button>
          {show && (
            <form onSubmit={criar} className="mt-4 bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm" required />
              <textarea value={corpo} onChange={(e) => setCorpo(e.target.value)} placeholder="Conteúdo"
                rows={4} className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none" required />
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={fixado} onChange={(e) => setFixado(e.target.checked)} />
                  Fixado
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={destaque} onChange={(e) => setDestaque(e.target.checked)} />
                  Destaque
                </label>
              </div>
              <button type="submit" disabled={saving}
                className="bg-blue-900 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50">
                {saving ? "Publicando..." : "Publicar"}
              </button>
            </form>
          )}
        </div>
      )}

      {avisos.length === 0 && <p className="text-gray-400 text-sm">Nenhum aviso.</p>}

      {avisos.map((a) => (
        <div key={a.id} className={`bg-white border rounded-xl p-5 ${a.destaque ? "border-amber-300 border-l-4 border-l-amber-400" : "border-gray-200"}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {a.destaque && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">Destaque</span>}
                {a.fixado && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">📌 Fixado</span>}
              </div>
              <h3 className="font-semibold text-gray-900">{a.titulo}</h3>
              <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{a.corpo}</p>
              <p className="text-gray-400 text-xs mt-2">{new Date(a.createdAt).toLocaleDateString("pt-BR")}</p>
            </div>
            {isAdmin && (
              <button onClick={() => excluir(a.id)} className="text-red-400 hover:text-red-600 text-xs shrink-0">Excluir</button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
