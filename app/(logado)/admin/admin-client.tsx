"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Aluno = {
  id: string; matricula: number; nomeGuerra: string; nomeCompleto: string; email: string
  isAdmin: boolean; aniversario: string | null; canga: string | null
  grupoPlantao: string | null; grupoFaxina: string | null
}

const CAMPO_VAZIO = {
  matricula: "", nomeGuerra: "", nomeCompleto: "", email: "", password: "",
  aniversario: "", canga: "", grupoPlantao: "", grupoFaxina: "",
}

export function AdminClient({ alunos: inicial }: { alunos: Aluno[] }) {
  const router = useRouter()
  const [alunos, setAlunos] = useState(inicial)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(CAMPO_VAZIO)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  function abrirNovo() {
    setEditId(null)
    setForm(CAMPO_VAZIO)
    setShowForm(true)
  }

  function abrirEditar(a: Aluno) {
    setEditId(a.id)
    setForm({
      matricula: String(a.matricula), nomeGuerra: a.nomeGuerra, nomeCompleto: a.nomeCompleto,
      email: a.email, password: "", aniversario: a.aniversario || "", canga: a.canga || "",
      grupoPlantao: a.grupoPlantao || "",
      grupoFaxina: a.grupoFaxina || "",
    })
    setShowForm(true)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    if (editId) {
      await fetch(`/api/admin/alunos/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
    } else {
      await fetch("/api/admin/alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
    }
    setSaving(false)
    setShowForm(false)
    router.refresh()
  }

  async function excluir(id: string, nome: string) {
    if (!confirm(`Excluir ${nome}?`)) return
    await fetch(`/api/admin/alunos/${id}`, { method: "DELETE" })
    setAlunos((prev) => prev.filter((a) => a.id !== id))
  }

  const filtrados = alunos.filter((a) =>
    !search || a.nomeGuerra.toLowerCase().includes(search.toLowerCase()) ||
    String(a.matricula).includes(search)
  )

  return (
    <div className="space-y-6">
      <div className="flex gap-3 flex-wrap">
        <button onClick={abrirNovo} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">
          + Cadastrar Aluno
        </button>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por matrícula ou nome..."
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-64" />
      </div>

      {showForm && (
        <form onSubmit={salvar} className="bg-slate-800 text-white rounded-xl p-5 grid sm:grid-cols-2 gap-3">
          <h3 className="col-span-full font-semibold">{editId ? "Editar aluno" : "Novo aluno"}</h3>
          {[
            ["Matrícula", "matricula", "number"],
            ["Nome de Guerra", "nomeGuerra", "text"],
            ["Nome Completo", "nomeCompleto", "text"],
            ["E-mail", "email", "email"],
            ["Senha" + (editId ? " (deixe em branco p/ manter)" : ""), "password", "password"],
            ["Aniversário (DD/MM)", "aniversario", "text"],
            ["Canga (ALPHA/BRAVO/FEMININO)", "canga", "text"],
            ["Grupo Plantão", "grupoPlantao", "text"],
            ["Grupo Faxina", "grupoFaxina", "text"],
          ].map(([label, key, type]) => (
            <div key={key}>
              <label className="text-xs text-slate-400">{label}</label>
              <input type={type} value={(form as any)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="block w-full bg-slate-700 rounded px-3 py-2 text-sm mt-0.5"
                required={["matricula", "nomeGuerra", "nomeCompleto", "email"].includes(key)} />
            </div>
          ))}
          <div className="col-span-full flex gap-3">
            <button type="submit" disabled={saving}
              className="bg-yellow-500 text-black font-semibold px-4 py-2 rounded text-sm disabled:opacity-50">
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 text-sm hover:text-white">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-slate-500 text-xs uppercase border-b border-slate-200">
              <th className="px-4 py-3 text-left">Mat.</th>
              <th className="px-4 py-3 text-left">Nome de Guerra</th>
              <th className="px-4 py-3 text-left">Nome Completo</th>
              <th className="px-4 py-3 text-left">E-mail</th>
              <th className="px-4 py-3 text-left">Canga</th>
              <th className="px-4 py-3 text-left">Plantão</th>
              <th className="px-4 py-3 text-left">Faxina</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((a) => (
              <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500">{a.matricula}</td>
                <td className="px-4 py-3 font-medium">{a.nomeGuerra}</td>
                <td className="px-4 py-3 text-slate-600">{a.nomeCompleto}</td>
                <td className="px-4 py-3 text-slate-500">{a.email}</td>
                <td className="px-4 py-3 text-slate-500">{a.canga || "—"}</td>
                <td className="px-4 py-3 text-slate-500">{a.grupoPlantao || "—"}</td>
                <td className="px-4 py-3 text-slate-500">{a.grupoFaxina || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => abrirEditar(a)} className="text-blue-600 text-xs hover:underline">Editar</button>
                    {!a.isAdmin && <button onClick={() => excluir(a.id, a.nomeGuerra)} className="text-red-500 text-xs hover:underline">Excluir</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
