"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Aluno = { id: string; matricula: number; nomeGuerra: string; nomeCompleto: string; email: string; isAdmin: boolean; aniversario: string | null; canga: string | null; grupoPlantao: string | null; grupoFaxina: string | null }

const VAZIO = { matricula: "", nomeGuerra: "", nomeCompleto: "", email: "", password: "", aniversario: "", canga: "", grupoPlantao: "", grupoFaxina: "" }

export function AdminClient({ alunos: init }: { alunos: Aluno[] }) {
  const router = useRouter()
  const [alunos, setAlunos] = useState(init)
  const [show, setShow] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(VAZIO)
  const [busca, setBusca] = useState("")
  const [saving, setSaving] = useState(false)

  function f(k: string, v: string) { setForm((x) => ({ ...x, [k]: v })) }

  function abrirEditar(a: Aluno) {
    setEditId(a.id)
    setForm({ matricula: String(a.matricula), nomeGuerra: a.nomeGuerra, nomeCompleto: a.nomeCompleto, email: a.email, password: "", aniversario: a.aniversario || "", canga: a.canga || "", grupoPlantao: a.grupoPlantao || "", grupoFaxina: a.grupoFaxina || "" })
    setShow(true)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    if (editId) {
      await fetch(`/api/admin/alunos/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    } else {
      await fetch("/api/admin/alunos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    }
    setSaving(false)
    setShow(false)
    setEditId(null)
    setForm(VAZIO)
    router.refresh()
  }

  async function excluir(id: string, nome: string) {
    if (!confirm(`Excluir ${nome}?`)) return
    await fetch(`/api/admin/alunos/${id}`, { method: "DELETE" })
    setAlunos((a) => a.filter((x) => x.id !== id))
  }

  const filtrados = alunos.filter((a) => !busca || a.nomeGuerra.toLowerCase().includes(busca.toLowerCase()) || String(a.matricula).includes(busca))

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <button onClick={() => { setShow(!show); setEditId(null); setForm(VAZIO) }}
          className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
          {show && !editId ? "Cancelar" : "+ Cadastrar"}
        </button>
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por matrícula ou nome..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64" />
      </div>

      {show && (
        <form onSubmit={salvar} className="bg-white border border-gray-200 rounded-xl p-5 grid sm:grid-cols-2 gap-3">
          <h3 className="col-span-full font-semibold text-gray-800">{editId ? "Editar aluno" : "Novo aluno"}</h3>
          {([["Matrícula", "matricula", "text"], ["Nome de Guerra", "nomeGuerra", "text"], ["Nome Completo", "nomeCompleto", "text"], ["E-mail", "email", "email"], ["Senha" + (editId ? " (deixe em branco p/ manter)" : ""), "password", "password"], ["Aniversário (DD/MM)", "aniversario", "text"], ["Canga", "canga", "text"], ["Grupo Plantão", "grupoPlantao", "text"], ["Grupo Faxina", "grupoFaxina", "text"]] as [string,string,string][]).map(([label, key, type]) => (
            <div key={key}>
              <label className="text-xs text-gray-500 block mb-1">{label}</label>
              <input type={type} value={(form as any)[key]} onChange={(e) => f(key, key === "matricula" ? e.target.value.replace(/\D/g, "") : e.target.value)}
                inputMode={key === "matricula" ? "numeric" : undefined}
                className="block w-full border border-gray-300 rounded px-3 py-2 text-sm"
                required={["matricula", "nomeGuerra", "nomeCompleto", "email"].includes(key)} />
            </div>
          ))}
          <div className="col-span-full flex gap-2">
            <button type="submit" disabled={saving} className="bg-blue-900 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={() => { setShow(false); setEditId(null) }} className="text-gray-500 text-sm px-3 py-2">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
              <th className="px-4 py-3 text-left">Mat.</th>
              <th className="px-4 py-3 text-left">Nome de Guerra</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">E-mail</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Canga</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Plantão</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Faxina</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((a) => (
              <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{a.matricula}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{a.nomeGuerra}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{a.email}</td>
                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{a.canga || "—"}</td>
                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{a.grupoPlantao || "—"}</td>
                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{a.grupoFaxina || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3 justify-end">
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
