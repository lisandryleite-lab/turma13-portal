"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Aluno = { matricula: number; nomeGuerra: string }

export function XerifanciaAdmin({ alunos }: { alunos: Aluno[] }) {
  const router = useRouter()
  const [matricula, setMatricula] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [saving, setSaving] = useState(false)

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!matricula || !dataInicio) return
    setSaving(true)
    const aluno = alunos.find((a) => a.matricula === Number(matricula))
    await fetch("/api/xerife", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matricula: Number(matricula),
        nomeGuerra: aluno?.nomeGuerra || "",
        dataInicio,
        dataFim: dataFim || null,
        atual: !dataFim,
      }),
    })
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="bg-slate-800 text-white rounded-xl p-5">
      <h3 className="font-semibold mb-4">Registrar novo xerife</h3>
      <form onSubmit={salvar} className="grid sm:grid-cols-4 gap-3">
        <select value={matricula} onChange={(e) => setMatricula(e.target.value)}
          className="bg-slate-700 rounded-lg px-3 py-2 text-sm" required>
          <option value="">Selecionar aluno...</option>
          {alunos.map((a) => (
            <option key={a.matricula} value={a.matricula}>{a.matricula} — {a.nomeGuerra}</option>
          ))}
        </select>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Data início</label>
          <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)}
            className="w-full bg-slate-700 rounded-lg px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Data fim (opcional)</label>
          <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)}
            className="w-full bg-slate-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={saving}
          className="bg-yellow-500 text-black font-semibold rounded-lg px-4 py-2 text-sm hover:bg-yellow-400 disabled:opacity-50 self-end">
          {saving ? "Salvando..." : "Registrar"}
        </button>
      </form>
    </div>
  )
}
