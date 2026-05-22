"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
const HORARIOS = [
  "06:00–07:00", "07:00–08:00", "08:00–09:00", "09:00–10:00",
  "10:00–11:00", "11:00–12:00", "13:00–14:00", "14:00–15:00",
  "15:00–16:00", "16:00–17:00", "17:00–18:00",
]

type Grade = Record<string, string[]>

function gradeVazia(): Grade {
  const g: Grade = {}
  for (const d of DIAS) g[d] = new Array(HORARIOS.length).fill("")
  return g
}

export function QtsAdmin({ semanaAtual, dadosExistentes }: { semanaAtual: number; dadosExistentes?: any }) {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [semana, setSemana] = useState(String(semanaAtual))
  const [grade, setGrade] = useState<Grade>(dadosExistentes?.grade || gradeVazia())
  const [saving, setSaving] = useState(false)

  function setAula(dia: string, i: number, val: string) {
    setGrade((g) => ({ ...g, [dia]: g[dia].map((v, j) => (j === i ? val : v)) }))
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/qts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ semana: Number(semana), dados: { dias: DIAS, horarios: HORARIOS, grade } }),
    })
    setSaving(false)
    setShow(false)
    router.refresh()
  }

  return (
    <div>
      <button onClick={() => setShow(!show)}
        className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">
        {show ? "Cancelar" : "Admin: Editar QTS"}
      </button>
      {show && (
        <form onSubmit={salvar} className="mt-4 bg-slate-800 text-white rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm">Semana:</label>
            <input type="number" value={semana} onChange={(e) => setSemana(e.target.value)} min={1} max={52}
              className="bg-slate-700 rounded px-2 py-1 text-sm w-16" />
          </div>
          <div className="overflow-auto">
            <table className="text-xs min-w-max">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-slate-400">Horário</th>
                  {DIAS.map((d) => <th key={d} className="px-2 py-1 text-slate-300">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {HORARIOS.map((h, i) => (
                  <tr key={h}>
                    <td className="px-2 py-1 text-slate-400 whitespace-nowrap">{h}</td>
                    {DIAS.map((d) => (
                      <td key={d} className="px-1 py-1">
                        <input value={grade[d]?.[i] || ""}
                          onChange={(e) => setAula(d, i, e.target.value)}
                          className="bg-slate-700 rounded px-2 py-1 text-xs w-28"
                          placeholder="—" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="submit" disabled={saving}
            className="bg-yellow-500 text-black font-semibold px-4 py-2 rounded text-sm disabled:opacity-50">
            {saving ? "Salvando..." : "Salvar QTS"}
          </button>
        </form>
      )}
    </div>
  )
}
