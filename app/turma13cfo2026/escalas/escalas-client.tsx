"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type EscalaTurma = { id: string; data: Date; posicao: string; userId: string; canga: string | null; observacao: string | null }
type EscalaAluno = { id: string; tipo: string; nome: string | null; data: Date; horaInicio: string | null; horaFim: string | null; funcao: string | null; local: string | null; descricao: string | null; observacao: string | null }
type Aluno = { id: string; matricula: number; nomeGuerra: string; canga: string | null }

const TIPOS_ALUNO = ["Plantão", "Faxina de Alojamento", "Outro"]

function fmt(d: Date) { return new Date(d).toLocaleDateString("pt-BR") }

export function EscalasClient({ faxinas, servicos, minhasEscalas, isAdmin, alunos }:
  { faxinas: EscalaTurma[]; servicos: EscalaTurma[]; minhasEscalas: EscalaAluno[]; isAdmin: boolean; alunos: Aluno[] }) {
  const router = useRouter()
  const [showFaxina, setShowFaxina] = useState(false)
  const [showServico, setShowServico] = useState(false)
  const [showMinha, setShowMinha] = useState(false)
  const [formT, setFormT] = useState({ tipo: "faxina", data: "", posicao: "", userId: "", canga: "", observacao: "" })
  const [formA, setFormA] = useState({ tipo: "Plantão", nome: "", data: "", horaInicio: "", horaFim: "", funcao: "", local: "", descricao: "", observacao: "" })
  const [saving, setSaving] = useState(false)

  async function salvarTurma(tipo: "faxina" | "servico") {
    setSaving(true)
    const aluno = alunos.find((a) => a.id === formT.userId)
    await fetch("/api/escalas-turma", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formT, tipo, canga: aluno?.canga || formT.canga }),
    })
    setSaving(false)
    setShowFaxina(false)
    setShowServico(false)
    router.refresh()
  }

  async function excluirTurma(id: string, tipo: string) {
    if (!confirm("Excluir?")) return
    await fetch(`/api/escalas-turma/${id}?tipo=${tipo}`, { method: "DELETE" })
    router.refresh()
  }

  async function salvarMinha() {
    setSaving(true)
    await fetch("/api/escalas-aluno", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formA),
    })
    setSaving(false)
    setShowMinha(false)
    setFormA({ tipo: "Plantão", nome: "", data: "", horaInicio: "", horaFim: "", funcao: "", local: "", descricao: "", observacao: "" })
    router.refresh()
  }

  async function excluirMinha(id: string) {
    if (!confirm("Excluir?")) return
    await fetch(`/api/escalas-aluno/${id}`, { method: "DELETE" })
    router.refresh()
  }

  const FormTurma = ({ tipo }: { tipo: "faxina" | "servico" }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 mt-3">
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-500">Data</label>
          <input type="date" value={formT.data} onChange={(e) => setFormT((f) => ({ ...f, data: e.target.value }))}
            className="block w-full border border-gray-300 rounded px-2 py-1.5 text-sm mt-0.5" required />
        </div>
        <div>
          <label className="text-xs text-gray-500">Posição</label>
          <input value={formT.posicao} onChange={(e) => setFormT((f) => ({ ...f, posicao: e.target.value }))}
            placeholder="P1, P2..." className="block w-full border border-gray-300 rounded px-2 py-1.5 text-sm mt-0.5" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Aluno</label>
          <select value={formT.userId} onChange={(e) => setFormT((f) => ({ ...f, userId: e.target.value }))}
            className="block w-full border border-gray-300 rounded px-2 py-1.5 text-sm mt-0.5">
            <option value="">Selecionar...</option>
            {alunos.map((a) => <option key={a.id} value={a.id}>{a.matricula} — {a.nomeGuerra}</option>)}
          </select>
        </div>
        <div className="sm:col-span-3">
          <label className="text-xs text-gray-500">Observação</label>
          <input value={formT.observacao} onChange={(e) => setFormT((f) => ({ ...f, observacao: e.target.value }))}
            className="block w-full border border-gray-300 rounded px-2 py-1.5 text-sm mt-0.5" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => salvarTurma(tipo)} disabled={saving}
          className="bg-blue-900 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50">
          {saving ? "Salvando..." : "Salvar"}
        </button>
        <button onClick={() => { setShowFaxina(false); setShowServico(false) }} className="text-gray-500 text-sm">Cancelar</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-10">
      {/* Escala Faxina Turma */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Escala de Faxina da Turma 13</h2>
          {isAdmin && <button onClick={() => setShowFaxina(!showFaxina)} className="text-sm text-blue-700 hover:underline">+ Adicionar</button>}
        </div>
        {isAdmin && showFaxina && <FormTurma tipo="faxina" />}
        <EscalaTurmaTabela dados={faxinas} tipo="faxina" isAdmin={isAdmin} onExcluir={excluirTurma} alunos={alunos} />
      </section>

      {/* Escala Serviço Turma */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Escala de Serviço da Turma 13</h2>
          {isAdmin && <button onClick={() => setShowServico(!showServico)} className="text-sm text-blue-700 hover:underline">+ Adicionar</button>}
        </div>
        {isAdmin && showServico && <FormTurma tipo="servico" />}
        <EscalaTurmaTabela dados={servicos} tipo="servico" isAdmin={isAdmin} onExcluir={excluirTurma} alunos={alunos} />
      </section>

      {/* Minhas Escalas */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Minhas Escalas</h2>
          <button onClick={() => setShowMinha(!showMinha)} className="text-sm text-blue-700 hover:underline">+ Adicionar</button>
        </div>
        {showMinha && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 mt-3 mb-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Tipo</label>
                <select value={formA.tipo} onChange={(e) => setFormA((f) => ({ ...f, tipo: e.target.value }))}
                  className="block w-full border border-gray-300 rounded px-2 py-1.5 text-sm mt-0.5">
                  {TIPOS_ALUNO.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              {formA.tipo === "Outro" && (
                <div>
                  <label className="text-xs text-gray-500">Nome</label>
                  <input value={formA.nome} onChange={(e) => setFormA((f) => ({ ...f, nome: e.target.value }))}
                    className="block w-full border border-gray-300 rounded px-2 py-1.5 text-sm mt-0.5" placeholder="Nome da escala" />
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500">Data</label>
                <input type="date" value={formA.data} onChange={(e) => setFormA((f) => ({ ...f, data: e.target.value }))}
                  className="block w-full border border-gray-300 rounded px-2 py-1.5 text-sm mt-0.5" required />
              </div>
              {formA.tipo === "Plantão" && <>
                <div>
                  <label className="text-xs text-gray-500">Hora início</label>
                  <input type="time" value={formA.horaInicio} onChange={(e) => setFormA((f) => ({ ...f, horaInicio: e.target.value }))}
                    className="block w-full border border-gray-300 rounded px-2 py-1.5 text-sm mt-0.5" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Hora fim</label>
                  <input type="time" value={formA.horaFim} onChange={(e) => setFormA((f) => ({ ...f, horaFim: e.target.value }))}
                    className="block w-full border border-gray-300 rounded px-2 py-1.5 text-sm mt-0.5" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Local</label>
                  <input value={formA.local} onChange={(e) => setFormA((f) => ({ ...f, local: e.target.value }))}
                    className="block w-full border border-gray-300 rounded px-2 py-1.5 text-sm mt-0.5" />
                </div>
              </>}
              <div>
                <label className="text-xs text-gray-500">Função / Descrição</label>
                <input value={formA.funcao} onChange={(e) => setFormA((f) => ({ ...f, funcao: e.target.value }))}
                  className="block w-full border border-gray-300 rounded px-2 py-1.5 text-sm mt-0.5" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500">Observação</label>
                <input value={formA.observacao} onChange={(e) => setFormA((f) => ({ ...f, observacao: e.target.value }))}
                  className="block w-full border border-gray-300 rounded px-2 py-1.5 text-sm mt-0.5" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={salvarMinha} disabled={saving}
                className="bg-blue-900 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50">
                {saving ? "Salvando..." : "Salvar"}
              </button>
              <button onClick={() => setShowMinha(false)} className="text-gray-500 text-sm">Cancelar</button>
            </div>
          </div>
        )}
        {minhasEscalas.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma escala pessoal registrada.</p>
        ) : (
          <div className="space-y-2">
            {minhasEscalas.map((e) => (
              <div key={e.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-4">
                <div className="text-sm font-medium text-gray-700 w-28 shrink-0">{fmt(e.data)}</div>
                <div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{e.tipo}</span>
                  {e.funcao && <span className="ml-2 text-sm text-gray-600">{e.funcao}</span>}
                  {e.local && <span className="ml-2 text-xs text-gray-400">{e.local}</span>}
                  {e.horaInicio && <span className="ml-2 text-xs text-gray-400">{e.horaInicio}{e.horaFim ? ` – ${e.horaFim}` : ""}</span>}
                </div>
                <button onClick={() => excluirMinha(e.id)} className="ml-auto text-red-500 text-xs hover:underline">Excluir</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function EscalaTurmaTabela({ dados, tipo, isAdmin, onExcluir, alunos }:
  { dados: any[]; tipo: string; isAdmin: boolean; onExcluir: (id: string, tipo: string) => void; alunos: any[] }) {
  const nomeAluno = (userId: string) => {
    const a = alunos.find((x) => x.id === userId)
    return a ? a.nomeGuerra : userId
  }
  if (dados.length === 0) return <p className="text-gray-400 text-sm">Nenhuma entrada.</p>
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
            <th className="px-4 py-3 text-left">Data</th>
            <th className="px-4 py-3 text-left">Posição</th>
            <th className="px-4 py-3 text-left">Aluno</th>
            <th className="px-4 py-3 text-left hidden sm:table-cell">Canga</th>
            <th className="px-4 py-3 text-left hidden md:table-cell">Observação</th>
            {isAdmin && <th className="px-4 py-3"></th>}
          </tr>
        </thead>
        <tbody>
          {dados.map((d) => (
            <tr key={d.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-600">{new Date(d.data).toLocaleDateString("pt-BR")}</td>
              <td className="px-4 py-3 font-medium">{d.posicao}</td>
              <td className="px-4 py-3">{nomeAluno(d.userId)}</td>
              <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{d.canga || "—"}</td>
              <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{d.observacao || "—"}</td>
              {isAdmin && (
                <td className="px-4 py-3">
                  <button onClick={() => onExcluir(d.id, tipo)} className="text-red-500 text-xs hover:underline">Excluir</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
