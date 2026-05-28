"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Aluno = { matricula: number; nomeGuerra: string }
type Xerife = {
  id: string
  matricula: number
  nomeGuerra: string
  dataInicio: string | Date
  dataFim: string | Date | null
  atual: boolean
}

function fmt(d: string | Date | null) {
  if (!d) return ""
  return new Date(d).toISOString().slice(0, 10)
}

function fmtBR(d: string | Date | null) {
  if (!d) return ""
  return new Date(d).toLocaleDateString("pt-BR")
}

const AZ = "var(--azul-profundo)"
const DOU = "var(--dourado)"

export function XerifanciaAdmin({ alunos, xerifes: inicial }: { alunos: Aluno[]; xerifes: Xerife[] }) {
  const router = useRouter()
  const [xerifes, setXerifes] = useState(inicial)

  // ── Formulário de adição ──────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false)
  const [matricula, setMatricula] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [saving, setSaving] = useState(false)

  async function adicionar(e: React.FormEvent) {
    e.preventDefault()
    if (!matricula || !dataInicio) return
    setSaving(true)
    const aluno = alunos.find(a => a.matricula === Number(matricula))
    const res = await fetch("/api/xerife", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matricula: Number(matricula),
        nomeGuerra: aluno?.nomeGuerra || "",
        dataInicio,
        dataFim: dataFim || null,
      }),
    })
    const novo = await res.json()
    setSaving(false)
    setShowForm(false)
    setMatricula(""); setDataInicio(""); setDataFim("")
    setXerifes(prev => [novo, ...prev.map(x => dataFim ? x : { ...x, atual: false })])
    router.refresh()
  }

  // ── Linha em edição ───────────────────────────────────────────────────────────
  const [editId, setEditId] = useState<string | null>(null)
  const [editMat, setEditMat] = useState("")
  const [editIni, setEditIni] = useState("")
  const [editFim, setEditFim] = useState("")
  const [editAtual, setEditAtual] = useState(false)
  const [editSaving, setEditSaving] = useState(false)

  function abrirEdicao(x: Xerife) {
    setEditId(x.id)
    setEditMat(String(x.matricula))
    setEditIni(fmt(x.dataInicio))
    setEditFim(fmt(x.dataFim))
    setEditAtual(x.atual)
  }

  function cancelarEdicao() { setEditId(null) }

  async function salvarEdicao(id: string) {
    setEditSaving(true)
    const aluno = alunos.find(a => a.matricula === Number(editMat))
    const res = await fetch("/api/xerife", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        matricula: Number(editMat),
        nomeGuerra: aluno?.nomeGuerra || xerifes.find(x => x.id === id)?.nomeGuerra || "",
        dataInicio: editIni,
        dataFim: editFim || null,
        atual: editAtual,
      }),
    })
    const atualizado = await res.json()
    setEditSaving(false)
    setEditId(null)
    setXerifes(prev => prev.map(x => {
      if (editAtual && x.id !== id) return { ...x, atual: false }
      if (x.id === id) return atualizado
      return x
    }))
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este registro de xerifância?")) return
    await fetch("/api/xerife", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setXerifes(prev => prev.filter(x => x.id !== id))
  }

  const atual = xerifes.find(x => x.atual)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Card xerife atual */}
      {atual && (
        <div style={{
          background: "linear-gradient(135deg, #fffbf0, #fff8e1)",
          border: "1.5px solid #f0c060", borderRadius: 16, padding: "24px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>⭐</div>
          <p style={{ fontSize: 20, fontWeight: 700, color: AZ, margin: 0 }}>{atual.nomeGuerra}</p>
          <p style={{ fontSize: 13, color: "#6b7a99", margin: "4px 0 0" }}>Mat. {atual.matricula}</p>
          <p style={{ fontSize: 12, color: "#9aa3b8", marginTop: 4 }}>
            Desde {fmtBR(atual.dataInicio)}
          </p>
        </div>
      )}

      {/* Botão adicionar */}
      <div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: AZ, color: "#fff", border: "none", borderRadius: 8,
          padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>
          {showForm ? "Cancelar" : "+ Registrar xerife"}
        </button>

        {showForm && (
          <form onSubmit={adicionar} style={{
            marginTop: 12, background: "#1e3a5f", borderRadius: 12,
            padding: 20, display: "flex", flexDirection: "column", gap: 12,
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
              <div>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 4 }}>ALUNO</label>
                <select value={matricula} onChange={e => setMatricula(e.target.value)} required
                  style={{ background: "#2d4f7a", border: "none", borderRadius: 8, padding: "8px 10px",
                    fontSize: 13, color: "#fff", width: "100%" }}>
                  <option value="">Selecionar...</option>
                  {alunos.map(a => (
                    <option key={a.matricula} value={a.matricula}>{a.matricula} — {a.nomeGuerra}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 4 }}>INÍCIO</label>
                <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} required
                  style={{ background: "#2d4f7a", border: "none", borderRadius: 8, padding: "8px 10px",
                    fontSize: 13, color: "#fff", width: "100%" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 4 }}>FIM (opcional)</label>
                <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
                  style={{ background: "#2d4f7a", border: "none", borderRadius: 8, padding: "8px 10px",
                    fontSize: 13, color: "#fff", width: "100%" }} />
              </div>
              <button type="submit" disabled={saving} style={{
                background: DOU, color: "#fff", border: "none", borderRadius: 8,
                padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                opacity: saving ? 0.6 : 1, whiteSpace: "nowrap",
              }}>
                {saving ? "..." : "Registrar"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Histórico */}
      <div>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "#9aa3b8", textTransform: "uppercase",
          letterSpacing: "0.06em", marginBottom: 10 }}>Histórico</h2>

        <div style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 14,
          overflow: "hidden", boxShadow: "0 1px 4px rgba(11,45,94,0.06)" }}>
          {xerifes.length === 0 && (
            <p style={{ padding: 16, fontSize: 13, color: "#9aa3b8" }}>Nenhum registro.</p>
          )}
          {xerifes.map((x, i) => (
            <div key={x.id} style={{
              borderTop: i > 0 ? "1px solid #edf0f7" : undefined,
              background: x.atual ? "rgba(240,192,96,0.08)" : undefined,
            }}>
              {editId === x.id ? (
                // ── Linha em edição ──────────────────────────────────────────
                <div style={{ padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 160px", minWidth: 140 }}>
                    <label style={{ fontSize: 10, color: "#9aa3b8", display: "block", marginBottom: 3 }}>ALUNO</label>
                    <select value={editMat} onChange={e => setEditMat(e.target.value)}
                      style={{ border: "1px solid #dde3ee", borderRadius: 6, padding: "6px 8px", fontSize: 13, width: "100%" }}>
                      {alunos.map(a => (
                        <option key={a.matricula} value={a.matricula}>{a.matricula} — {a.nomeGuerra}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: "0 1 130px" }}>
                    <label style={{ fontSize: 10, color: "#9aa3b8", display: "block", marginBottom: 3 }}>INÍCIO</label>
                    <input type="date" value={editIni} onChange={e => setEditIni(e.target.value)}
                      style={{ border: "1px solid #dde3ee", borderRadius: 6, padding: "6px 8px", fontSize: 13, width: "100%" }} />
                  </div>
                  <div style={{ flex: "0 1 130px" }}>
                    <label style={{ fontSize: 10, color: "#9aa3b8", display: "block", marginBottom: 3 }}>FIM</label>
                    <input type="date" value={editFim} onChange={e => setEditFim(e.target.value)}
                      style={{ border: "1px solid #dde3ee", borderRadius: 6, padding: "6px 8px", fontSize: 13, width: "100%" }} />
                  </div>
                  <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", paddingBottom: 6 }}>
                    <input type="checkbox" checked={editAtual} onChange={e => setEditAtual(e.target.checked)} />
                    Atual
                  </label>
                  <div style={{ display: "flex", gap: 6, paddingBottom: 2 }}>
                    <button onClick={() => salvarEdicao(x.id)} disabled={editSaving} style={{
                      background: AZ, color: "#fff", border: "none", borderRadius: 6,
                      padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}>{editSaving ? "..." : "Salvar"}</button>
                    <button onClick={cancelarEdicao} style={{
                      background: "#f0f4ff", color: "#6b7a99", border: "none", borderRadius: 6,
                      padding: "6px 12px", fontSize: 12, cursor: "pointer",
                    }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                // ── Linha normal ──────────────────────────────────────────────
                <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: AZ, minWidth: 120 }}>{x.nomeGuerra}</span>
                  <span style={{ fontSize: 12, color: "#6b7a99" }}>Mat. {x.matricula}</span>
                  <span style={{ fontSize: 12, color: "#9aa3b8", marginLeft: "auto" }}>
                    {fmtBR(x.dataInicio)}{x.dataFim ? ` → ${fmtBR(x.dataFim)}` : ""}
                  </span>
                  {x.atual && (
                    <span style={{ fontSize: 11, background: "#f0c060", color: "#7a4f00",
                      padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>Atual</span>
                  )}
                  <button onClick={() => abrirEdicao(x)} style={{
                    background: "#f0f4ff", border: "none", borderRadius: 6,
                    padding: "4px 10px", fontSize: 11, color: "#1A52A8", cursor: "pointer",
                  }}>Editar</button>
                  <button onClick={() => excluir(x.id)} style={{
                    background: "none", border: "none", color: "#e53e3e",
                    fontSize: 12, cursor: "pointer", padding: "4px 6px",
                  }}>✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
