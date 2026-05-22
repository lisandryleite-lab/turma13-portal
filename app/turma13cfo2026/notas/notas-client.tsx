"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Nota = { id: string; disciplina: string; avaliacao: string; nota: number; peso: number; ehAF: boolean; apto: boolean; data: Date; observacao: string | null }
type Disc = { sigla: string; nome: string }

const VAZIO = { disciplina: "", avaliacao: "", nota: "", ehAF: false, apto: false, data: "", observacao: "" }

export function NotasClient({ notas: init, disciplinas }: { notas: Nota[]; disciplinas: Disc[] }) {
  const router = useRouter()
  const [notas, setNotas] = useState(init)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(VAZIO)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState("")

  function abrirNovo() {
    setEditId(null)
    setForm(VAZIO)
    setErro("")
    setShowForm(true)
  }

  function abrirEditar(n: Nota) {
    setEditId(n.id)
    setForm({
      disciplina: n.disciplina,
      avaliacao: n.avaliacao,
      nota: String(n.nota),
      ehAF: n.ehAF,
      apto: n.apto,
      data: new Date(n.data).toISOString().split("T")[0],
      observacao: n.observacao || "",
    })
    setErro("")
    setShowForm(true)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    const notaNum = form.apto ? 0 : Number(form.nota.replace(",", "."))
    if (!form.apto && (isNaN(notaNum) || notaNum < 0 || notaNum > 10)) {
      setErro("Nota deve ser um número entre 0 e 10.")
      return
    }
    setSaving(true)
    const url = editId ? `/api/notas/${editId}` : "/api/notas"
    const method = editId ? "PUT" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, nota: notaNum }),
    })
    setSaving(false)
    if (!res.ok) {
      const d = await res.json()
      setErro(d.error || "Erro ao salvar")
      return
    }
    setShowForm(false)
    router.refresh()
  }

  async function excluir(id: string) {
    if (!confirm("Excluir esta nota?")) return
    await fetch(`/api/notas/${id}`, { method: "DELETE" })
    setNotas((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={abrirNovo} className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
          + Nova Nota
        </button>
        <p className="text-xs text-gray-400">
          Fórmula: MGC = (MFIC × 6,5 + NFDC × 2,5 + TCC × 1) / 10
        </p>
      </div>

      {showForm && (
        <form onSubmit={salvar} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-gray-800">{editId ? "Editar nota" : "Nova nota"}</h3>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Disciplina</label>
              <select value={form.disciplina} onChange={(e) => setForm((f) => ({ ...f, disciplina: e.target.value }))}
                className="w-full border border-gray-300 rounded px-2 py-2 text-sm" required>
                <option value="">Selecionar...</option>
                {disciplinas.map((d) => (
                  <option key={d.sigla} value={d.sigla}>{d.sigla} — {d.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Avaliação</label>
              <input value={form.avaliacao} onChange={(e) => setForm((f) => ({ ...f, avaliacao: e.target.value }))}
                className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                placeholder="Ex: P1, P2, AF, TCC" required />
            </div>

            {!form.apto && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">Nota (0–10)</label>
                <input value={form.nota} onChange={(e) => setForm((f) => ({ ...f, nota: e.target.value }))}
                  inputMode="decimal" className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                  placeholder="Ex: 8,5" required={!form.apto} />
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500 block mb-1">Data</label>
              <input type="date" value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                className="w-full border border-gray-300 rounded px-2 py-2 text-sm" required />
            </div>

            <div className="sm:col-span-2 flex gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.ehAF} onChange={(e) => setForm((f) => ({ ...f, ehAF: e.target.checked, apto: false }))} />
                <span>Avaliação Final (AF)</span>
                <span className="text-xs text-gray-400">— usada no cálculo de MDR</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.apto} onChange={(e) => setForm((f) => ({ ...f, apto: e.target.checked, ehAF: false, nota: "" }))} />
                <span>Disciplina APTO/INAPTO</span>
                <span className="text-xs text-gray-400">— não entra na MFIC</span>
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Observação</label>
              <input value={form.observacao} onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))}
                className="w-full border border-gray-300 rounded px-2 py-2 text-sm" placeholder="Opcional" />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving}
              className="bg-blue-900 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50">
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 text-sm px-3 py-2">Cancelar</button>
          </div>
        </form>
      )}

      {notas.length === 0 ? (
        <p className="text-gray-400 text-sm py-4">Nenhuma nota lançada ainda.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
                <th className="px-4 py-3 text-left">Disciplina</th>
                <th className="px-4 py-3 text-left">Avaliação</th>
                <th className="px-4 py-3 text-right">Nota</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Tipo</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Data</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {notas.map((n) => (
                <tr key={n.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{n.disciplina}</td>
                  <td className="px-4 py-3 text-gray-600">{n.avaliacao}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {n.apto ? <span className="text-xs text-gray-400">APTO</span> : n.nota.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {n.ehAF && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">AF</span>}
                    {n.apto && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">APTO</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                    {new Date(n.data).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => abrirEditar(n)} className="text-blue-600 text-xs hover:underline">Editar</button>
                      <button onClick={() => excluir(n.id)} className="text-red-500 text-xs hover:underline">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
