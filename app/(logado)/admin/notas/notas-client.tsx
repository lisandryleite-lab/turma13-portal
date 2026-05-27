"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type Aluno = { id: string; matricula: number; nomeGuerra: string }
type Disciplina = { sigla: string; nome: string }
type Nota = {
  id: string; disciplina: string; avaliacao: string; nota: number; peso: number
  ehAF: boolean; apto: boolean; data: string; observacao: string | null
  user: { nomeGuerra: string; matricula: number }
}

const FORM_VAZIO = { disciplina: "", avaliacao: "", nota: "", peso: "1", ehAF: false, apto: false, data: new Date().toISOString().slice(0,10), observacao: "" }

export function NotasAdminClient({ alunos, disciplinas }: { alunos: Aluno[]; disciplinas: Disciplina[] }) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState("")
  const [notas, setNotas] = useState<Nota[]>([])
  const [carregando, setCarregando] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(FORM_VAZIO)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState("")

  useEffect(() => {
    if (!selectedId) { setNotas([]); return }
    setCarregando(true)
    fetch(`/api/notas?userId=${selectedId}`)
      .then(r => r.json())
      .then(data => { setNotas(data); setCarregando(false) })
      .catch(() => setCarregando(false))
  }, [selectedId])

  function abrirNovo() {
    setEditId(null)
    setForm(FORM_VAZIO)
    setErro("")
    setShowForm(true)
  }

  function abrirEditar(n: Nota) {
    setEditId(n.id)
    setForm({
      disciplina: n.disciplina, avaliacao: n.avaliacao, nota: String(n.nota),
      peso: String(n.peso), ehAF: n.ehAF, apto: n.apto,
      data: n.data.slice(0,10), observacao: n.observacao || "",
    })
    setErro("")
    setShowForm(true)
  }

  async function salvar() {
    if (!selectedId) return
    if (!form.disciplina || !form.avaliacao || !form.data) { setErro("Disciplina, avaliação e data são obrigatórios."); return }
    const notaNum = form.apto ? 0 : Number(form.nota)
    if (!form.apto && (isNaN(notaNum) || notaNum < 0 || notaNum > 10)) { setErro("Nota deve estar entre 0 e 10."); return }

    setSaving(true)
    setErro("")

    if (editId) {
      const res = await fetch(`/api/notas/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disciplina: form.disciplina, avaliacao: form.avaliacao, nota: notaNum, peso: Number(form.peso) || 1, data: form.data, observacao: form.observacao || null }),
      })
      if (!res.ok) { const d = await res.json(); setErro(d.error || "Erro ao editar."); setSaving(false); return }
    } else {
      const res = await fetch("/api/notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: selectedId, disciplina: form.disciplina, avaliacao: form.avaliacao, nota: notaNum, peso: Number(form.peso) || 1, ehAF: form.ehAF, apto: form.apto, data: form.data, observacao: form.observacao || null }),
      })
      if (!res.ok) { const d = await res.json(); setErro(d.error || "Erro ao lançar."); setSaving(false); return }
    }

    setSaving(false)
    setShowForm(false)
    // Recarrega notas
    const r = await fetch(`/api/notas?userId=${selectedId}`)
    setNotas(await r.json())
    router.refresh()
  }

  async function deletar(id: string) {
    if (!confirm("Excluir esta nota? O histórico de auditoria será preservado.")) return
    await fetch(`/api/notas/${id}`, { method: "DELETE" })
    setNotas(prev => prev.filter(n => n.id !== id))
    router.refresh()
  }

  const alunoSelecionado = alunos.find(a => a.id === selectedId)

  return (
    <div>
      {/* Seletor de aluno */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", border: "1.5px solid var(--cinza-borda)", marginBottom: 24, display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--grafite)", display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Selecionar aluno
          </label>
          <select
            value={selectedId}
            onChange={e => { setSelectedId(e.target.value); setShowForm(false) }}
            style={{ width: "100%", border: "1.5px solid var(--cinza-borda)", borderRadius: 8, padding: "10px 14px", fontSize: 14, fontFamily: "var(--sans)" }}
          >
            <option value="">— Selecione —</option>
            {alunos.map(a => (
              <option key={a.id} value={a.id}>{a.matricula} — {a.nomeGuerra}</option>
            ))}
          </select>
        </div>
        {selectedId && (
          <button onClick={abrirNovo} style={{ background: "var(--azul-profundo)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + Nova nota
          </button>
        )}
      </div>

      {/* Formulário */}
      {showForm && (
        <div style={{ background: "var(--azul-claro)", borderRadius: 12, padding: "20px 24px", border: "1.5px solid var(--azul-medio)", marginBottom: 24 }}>
          <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: 16, color: "var(--azul-profundo)", marginBottom: 16 }}>
            {editId ? "Editar nota" : `Lançar nota — ${alunoSelecionado?.nomeGuerra}`}
          </h3>
          {erro && <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#B91C1C", marginBottom: 12 }}>{erro}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--grafite)", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Disciplina *</label>
              <select value={form.disciplina} onChange={e => setForm(f => ({ ...f, disciplina: e.target.value }))}
                style={{ width: "100%", border: "1.5px solid var(--cinza-borda)", borderRadius: 6, padding: "7px 10px", fontSize: 13 }}>
                <option value="">— Selecione —</option>
                {disciplinas.map(d => <option key={d.sigla} value={d.sigla}>{d.sigla} — {d.nome}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--grafite)", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Avaliação *</label>
              <input value={form.avaliacao} onChange={e => setForm(f => ({ ...f, avaliacao: e.target.value }))}
                placeholder="P1, P2, AF…"
                style={{ width: "100%", border: "1.5px solid var(--cinza-borda)", borderRadius: 6, padding: "7px 10px", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--grafite)", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Nota (0–10)</label>
              <input type="number" min={0} max={10} step={0.1} value={form.nota}
                onChange={e => setForm(f => ({ ...f, nota: e.target.value }))}
                disabled={form.apto}
                style={{ width: "100%", border: "1.5px solid var(--cinza-borda)", borderRadius: 6, padding: "7px 10px", fontSize: 13, boxSizing: "border-box", opacity: form.apto ? 0.4 : 1 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--grafite)", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Peso</label>
              <input type="number" min={0.1} max={5} step={0.1} value={form.peso}
                onChange={e => setForm(f => ({ ...f, peso: e.target.value }))}
                style={{ width: "100%", border: "1.5px solid var(--cinza-borda)", borderRadius: 6, padding: "7px 10px", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--grafite)", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Data *</label>
              <input type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                style={{ width: "100%", border: "1.5px solid var(--cinza-borda)", borderRadius: 6, padding: "7px 10px", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--grafite)", display: "block", marginBottom: 4, textTransform: "uppercase" }}>Observação</label>
              <input value={form.observacao} onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))}
                style={{ width: "100%", border: "1.5px solid var(--cinza-borda)", borderRadius: 6, padding: "7px 10px", fontSize: 13, boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 14, alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={form.ehAF} onChange={e => setForm(f => ({ ...f, ehAF: e.target.checked }))} />
              É Avaliação Final (AF)
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={form.apto} onChange={e => setForm(f => ({ ...f, apto: e.target.checked }))} />
              Conceito APTO (sem nota numérica)
            </label>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button onClick={salvar} disabled={saving}
              style={{ background: "var(--azul-profundo)", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Salvando…" : editId ? "Salvar edição" : "Lançar nota"}
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ background: "none", border: "none", fontSize: 13, color: "var(--cinza-texto)", cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabela de notas */}
      {selectedId && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid var(--cinza-borda)", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--cinza-borda)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--azul-profundo)" }}>
              {alunoSelecionado?.nomeGuerra} — {notas.length} nota{notas.length !== 1 ? "s" : ""}
            </span>
            {carregando && <span style={{ fontSize: 12, color: "var(--cinza-texto)" }}>Carregando…</span>}
          </div>

          {notas.length === 0 && !carregando ? (
            <p style={{ padding: "24px 20px", color: "var(--cinza-texto)", fontSize: 13 }}>Nenhuma nota lançada para este aluno.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--azul-claro)" }}>
                  {["Disciplina", "Avaliação", "Nota", "Peso", "Data", "Flags", ""].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, fontSize: 11, color: "var(--azul-profundo)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {notas.map((n, i) => (
                  <tr key={n.id} style={{ borderTop: "1px solid var(--cinza-borda)", background: i % 2 === 0 ? "#fff" : "var(--creme)" }}>
                    <td style={{ padding: "9px 14px", fontWeight: 600, color: "var(--azul-medio)" }}>{n.disciplina}</td>
                    <td style={{ padding: "9px 14px" }}>{n.avaliacao}</td>
                    <td style={{ padding: "9px 14px", fontWeight: 700, color: n.apto ? "#15803d" : n.nota >= 7 ? "#15803d" : n.nota >= 4 ? "var(--dourado)" : "#b91c1c" }}>
                      {n.apto ? "APTO" : n.nota.toFixed(1)}
                    </td>
                    <td style={{ padding: "9px 14px", color: "var(--cinza-texto)" }}>{n.peso}</td>
                    <td style={{ padding: "9px 14px", color: "var(--cinza-texto)" }}>{new Date(n.data).toLocaleDateString("pt-BR")}</td>
                    <td style={{ padding: "9px 14px" }}>
                      {n.ehAF && <span style={{ fontSize: 10, background: "#fef3c7", color: "#92400e", borderRadius: 4, padding: "2px 6px", marginRight: 4 }}>AF</span>}
                      {n.apto && <span style={{ fontSize: 10, background: "#dcfce7", color: "#15803d", borderRadius: 4, padding: "2px 6px" }}>APTO</span>}
                    </td>
                    <td style={{ padding: "9px 14px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => abrirEditar(n)} style={{ fontSize: 12, color: "var(--azul-medio)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Editar</button>
                        <button onClick={() => deletar(n.id)} style={{ fontSize: 12, color: "#b91c1c", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
