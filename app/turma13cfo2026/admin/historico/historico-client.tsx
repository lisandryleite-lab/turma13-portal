"use client"

import { useState } from "react"

const TIPO_LABEL: Record<string, string> = { criacao: "Criação", edicao: "Edição", exclusao: "Exclusão" }
const TIPO_COR: Record<string, string> = { criacao: "text-green-700 bg-green-50", edicao: "text-blue-700 bg-blue-50", exclusao: "text-red-700 bg-red-50" }

export function HistoricoClient({ historico, alunos, disciplinas }: { historico: any[]; alunos: any[]; disciplinas: any[] }) {
  const [filtroAluno, setFiltroAluno] = useState("")
  const [filtroDisc, setFiltroDisc] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("")

  const filtrado = historico.filter((h) => {
    const mat = String(h.nota?.user?.matricula || "")
    if (filtroAluno && mat !== filtroAluno) return false
    if (filtroDisc && h.disciplina !== filtroDisc) return false
    if (filtroTipo && h.tipo !== filtroTipo) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <select value={filtroAluno} onChange={(e) => setFiltroAluno(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1.5 text-sm">
          <option value="">Todos os alunos</option>
          {alunos.map((a) => <option key={a.matricula} value={a.matricula}>{a.matricula} — {a.nomeGuerra}</option>)}
        </select>
        <select value={filtroDisc} onChange={(e) => setFiltroDisc(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1.5 text-sm">
          <option value="">Todas as disciplinas</option>
          {disciplinas.map((d) => <option key={d.sigla} value={d.sigla}>{d.sigla}</option>)}
        </select>
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1.5 text-sm">
          <option value="">Todos os tipos</option>
          <option value="criacao">Criação</option>
          <option value="edicao">Edição</option>
          <option value="exclusao">Exclusão</option>
        </select>
        <span className="text-xs text-gray-400 self-center">{filtrado.length} registros</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
              <th className="px-4 py-3 text-left">Data/Hora</th>
              <th className="px-4 py-3 text-left">Aluno</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Disciplina</th>
              <th className="px-4 py-3 text-left">Avaliação</th>
              <th className="px-4 py-3 text-left">Campo</th>
              <th className="px-4 py-3 text-left">Anterior</th>
              <th className="px-4 py-3 text-left">Novo</th>
              <th className="px-4 py-3 text-left">Por</th>
            </tr>
          </thead>
          <tbody>
            {filtrado.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-6 text-center text-gray-400 text-sm">Nenhum registro</td></tr>
            )}
            {filtrado.map((h) => (
              <tr key={h.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                  {new Date(h.createdAt).toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-gray-800">{h.nota?.user?.nomeGuerra || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${TIPO_COR[h.tipo] || ""}`}>
                    {TIPO_LABEL[h.tipo] || h.tipo}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{h.disciplina}</td>
                <td className="px-4 py-3 text-gray-600">{h.avaliacao}</td>
                <td className="px-4 py-3 text-gray-400">{h.campoAlterado || "—"}</td>
                <td className="px-4 py-3 text-gray-400">{h.valorAnterior || "—"}</td>
                <td className="px-4 py-3 text-gray-700">{h.valorNovo || "—"}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{h.alteradoPor?.nomeGuerra || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
