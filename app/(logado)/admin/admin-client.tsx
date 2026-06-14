"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

// ── tipos ────────────────────────────────────────────────────────────────────────
type Aluno = {
  id: string; matricula: number; nomeGuerra: string; nomeCompleto: string; email: string
  isAdmin: boolean; aniversario: string | null; canga: string | null
  grupoPlantao: string | null; grupoFaxina: string | null
}
type Disciplina = { id: string; sigla: string; nome: string; modulo: string; cargaTotal: number; cargaMinistrada: number; status: string }
type QTSItem    = { semana: number; dados: unknown; createdAt: string }
type MissaoItem = { id: string; semana: number; titulo: string; createdAt: string }
type AvisoItem  = { id: string; titulo: string; fixado: boolean; createdAt: string }
type XerifeItem = { id: string; nomeGuerra: string; matricula: number; dataInicio: string; dataFim: string | null; atual: boolean }
type Stats = { totalNotas: number; totalMissoesConcluidas: number; alunosAtivos: number }

interface Props {
  semanaAtual: number
  alunos: Aluno[]
  disciplinas: Disciplina[]
  qtsList: QTSItem[]
  missoes: MissaoItem[]
  avisos: AvisoItem[]
  xerifes: XerifeItem[]
  stats: Stats
}

// ── helpers ──────────────────────────────────────────────────────────────────────
const AZ  = "var(--azul-profundo)"
const AM  = "var(--azul-medio)"
const DOU = "var(--dourado)"

const HORARIOS = ["07h00-07h50","08h00-08h50","08h50-09h40","10h00-10h50","10h50-11h40","13h40-14h30","14h30-15h20","15h40-16h30","16h30-17h20","17h30-18h20","18h20-19h10"]
const DIAS_SEMANA = (dataInicio: string) => {
  const seg = new Date(dataInicio)
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(seg)
    d.setDate(seg.getDate() + i)
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const nomes = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]
    return `${nomes[d.getDay()]} ${dd}/${mm}`
  })
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 12, padding: "16px 20px" }}>
      <p style={{ fontSize: 24, marginBottom: 6 }}>{icon}</p>
      <p style={{ fontSize: 28, fontWeight: 800, color: AZ, fontFamily: "var(--serif)" }}>{value}</p>
      <p style={{ fontSize: 12, color: "#9aa3b8", marginTop: 2 }}>{label}</p>
    </div>
  )
}

// ── ABA ALUNOS ───────────────────────────────────────────────────────────────────
const CAMPO_VAZIO = { matricula:"", nomeGuerra:"", nomeCompleto:"", email:"", password:"", aniversario:"", canga:"", grupoPlantao:"", grupoFaxina:"" }

function AbaAlunos({ alunos: inicial }: { alunos: Aluno[] }) {
  const router = useRouter()
  const [alunos, setAlunos] = useState(inicial)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(CAMPO_VAZIO)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  function f(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  function abrirNovo() { setEditId(null); setForm(CAMPO_VAZIO); setShowForm(true) }
  function abrirEditar(a: Aluno) {
    setEditId(a.id)
    setForm({ matricula: String(a.matricula), nomeGuerra: a.nomeGuerra, nomeCompleto: a.nomeCompleto,
      email: a.email, password: "", aniversario: a.aniversario || "", canga: a.canga || "",
      grupoPlantao: a.grupoPlantao || "", grupoFaxina: a.grupoFaxina || "" })
    setShowForm(true)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    if (editId) {
      await fetch(`/api/admin/alunos/${editId}`, { method: "PUT", headers: { "Content-Type":"application/json" }, body: JSON.stringify(form) })
    } else {
      await fetch("/api/admin/alunos", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(form) })
    }
    setSaving(false); setShowForm(false); router.refresh()
  }

  async function excluir(id: string, nome: string) {
    if (!confirm(`Excluir ${nome}?`)) return
    await fetch(`/api/admin/alunos/${id}`, { method: "DELETE" })
    setAlunos(p => p.filter(a => a.id !== id))
  }

  const filtrados = alunos.filter(a => !search || a.nomeGuerra.toLowerCase().includes(search.toLowerCase()) || String(a.matricula).includes(search))
  const inp = (label: string, k: keyof typeof CAMPO_VAZIO, type="text", placeholder="") => (
    <div>
      <label style={{ fontSize: 11, color: "#6b7a99", display: "block", marginBottom: 3 }}>{label}</label>
      <input type={type} value={form[k]} onChange={e => f(k, e.target.value)} placeholder={placeholder}
        style={{ border: "1px solid #dde3ee", borderRadius: 7, padding: "7px 10px", fontSize: 13, width: "100%" }} />
    </div>
  )

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={abrirNovo} style={{ background: AZ, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Cadastrar Aluno
        </button>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou mat."
          style={{ border: "1px solid #dde3ee", borderRadius: 8, padding: "8px 14px", fontSize: 13, flex: 1, minWidth: 180 }} />
      </div>

      {showForm && (
        <form onSubmit={salvar} style={{ background: "#f8faff", border: "1px solid #dde3ee", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: AZ, marginBottom: 14 }}>{editId ? "Editar Aluno" : "Novo Aluno"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
            {inp("Matrícula *", "matricula", "number")}
            {inp("Nome de Guerra *", "nomeGuerra")}
            {inp("Nome Completo *", "nomeCompleto")}
            {inp("E-mail *", "email", "email")}
            {inp("Senha" + (editId ? " (deixe vazio p/ manter)" : " *"), "password", "password")}
            {inp("Aniversário (dd/mm)", "aniversario", "text", "08/02")}
            {inp("Canga (nome)", "canga")}
            {inp("Grupo Plantão", "grupoPlantao", "text", "MIKE")}
            {inp("Grupo Faxina", "grupoFaxina", "text", "G4")}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={saving} style={{ background: DOU, color: "#fff", border: "none", borderRadius: 7, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: "none", border: "1px solid #dde3ee", borderRadius: 7, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: AZ, color: "#fff" }}>
              {["Mat.", "Nome de Guerra", "E-mail", "Plantão", "Faxina", ""].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((a, i) => (
              <tr key={a.id} style={{ borderTop: "1px solid #edf0f7", background: a.isAdmin ? "rgba(184,146,74,0.06)" : undefined }}>
                <td style={{ padding: "9px 12px", color: AM, fontWeight: 700 }}>{a.matricula}</td>
                <td style={{ padding: "9px 12px", color: AZ, fontWeight: 500 }}>
                  {a.nomeGuerra}
                  {a.isAdmin && <span style={{ fontSize: 10, background: DOU, color: "#fff", borderRadius: 4, padding: "1px 6px", marginLeft: 6 }}>ADMIN</span>}
                </td>
                <td style={{ padding: "9px 12px", color: "#6b7a99", fontSize: 12 }}>{a.email}</td>
                <td style={{ padding: "9px 12px", color: "#6b7a99" }}>{a.grupoPlantao || "—"}</td>
                <td style={{ padding: "9px 12px", color: "#6b7a99" }}>{a.grupoFaxina || "—"}</td>
                <td style={{ padding: "9px 12px", display: "flex", gap: 8 }}>
                  <button onClick={() => abrirEditar(a)} style={{ fontSize: 11, color: AM, background: "#f0f4ff", border: "none", borderRadius: 5, padding: "3px 10px", cursor: "pointer" }}>Editar</button>
                  <button onClick={() => excluir(a.id, a.nomeGuerra)} style={{ fontSize: 11, color: "#e53e3e", background: "none", border: "none", cursor: "pointer" }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── ABA QTS ──────────────────────────────────────────────────────────────────────
function AbaQTS({ qtsList: inicial, semanaAtual }: { qtsList: QTSItem[]; semanaAtual: number }) {
  const router = useRouter()
  const [lista, setLista] = useState(inicial)
  const [showForm, setShowForm] = useState(false)
  const [semana, setSemana] = useState(String(semanaAtual))
  const [dataInicio, setDataInicio] = useState("")
  const [grade, setGrade] = useState<Record<string, string[]>>({})
  const [saving, setSaving] = useState(false)

  const dias = dataInicio ? DIAS_SEMANA(dataInicio + "T12:00:00") : ["Seg","Ter","Qua","Qui","Sex"]

  function setCell(dia: string, i: number, val: string) {
    setGrade(prev => {
      const novo = { ...prev, [dia]: [...(prev[dia] || Array(11).fill(""))] }
      novo[dia][i] = val
      return novo
    })
  }

  function iniciarForm() {
    setGrade({})
    const hoje = new Date()
    const dayOfWeek = hoje.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const seg = new Date(hoje)
    seg.setDate(hoje.getDate() + diff)
    setDataInicio(seg.toISOString().slice(0, 10))
    setShowForm(true)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const dados = { dias, horarios: HORARIOS, grade }
    const res = await fetch("/api/qts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ semana: Number(semana), dados }),
    })
    const novo = await res.json()
    setSaving(false)
    setShowForm(false)
    setLista(prev => {
      const sem = prev.filter(q => q.semana !== novo.semana)
      return [...sem, { semana: novo.semana, dados: novo.dados, createdAt: novo.createdAt }].sort((a, b) => a.semana - b.semana)
    })
    router.refresh()
  }

  async function deletar(s: number) {
    if (!confirm(`Excluir QTS da semana ${s}?`)) return
    await fetch("/api/qts", { method: "DELETE", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ semana: s }) })
    setLista(prev => prev.filter(q => q.semana !== s))
  }

  return (
    <div>
      <button onClick={iniciarForm} style={{ background: AZ, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 16 }}>
        + Nova Semana QTS
      </button>

      {showForm && (
        <form onSubmit={salvar} style={{ background: "#f8faff", border: "1px solid #dde3ee", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: AZ, marginBottom: 14 }}>Nova QTS</h3>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <div>
              <label style={{ fontSize: 11, color: "#6b7a99", display: "block", marginBottom: 3 }}>Semana *</label>
              <input type="number" min={1} max={52} value={semana} onChange={e => setSemana(e.target.value)} required
                style={{ border: "1px solid #dde3ee", borderRadius: 7, padding: "7px 10px", fontSize: 13, width: 80 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#6b7a99", display: "block", marginBottom: 3 }}>Segunda-feira da semana *</label>
              <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} required
                style={{ border: "1px solid #dde3ee", borderRadius: 7, padding: "7px 10px", fontSize: 13 }} />
            </div>
          </div>

          <p style={{ fontSize: 12, color: "#9aa3b8", marginBottom: 10 }}>
            Preencha as siglas das disciplinas em cada horário (deixe em branco para vazio):
          </p>

          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 12, minWidth: 600 }}>
              <thead>
                <tr style={{ background: AZ, color: "#fff" }}>
                  <th style={{ padding: "6px 10px", textAlign: "left", fontSize: 10, whiteSpace: "nowrap" }}>Horário</th>
                  {dias.map(d => <th key={d} style={{ padding: "6px 8px", fontSize: 10, minWidth: 80 }}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {HORARIOS.map((h, i) => (
                  <tr key={h} style={{ borderTop: "1px solid #edf0f7" }}>
                    <td style={{ padding: "4px 10px", fontWeight: 600, color: "#6b7a99", fontSize: 11, whiteSpace: "nowrap" }}>{h}</td>
                    {dias.map(dia => (
                      <td key={dia} style={{ padding: "3px 4px" }}>
                        <input
                          value={grade[dia]?.[i] ?? ""}
                          onChange={e => setCell(dia, i, e.target.value)}
                          placeholder="—"
                          style={{ border: "1px solid #dde3ee", borderRadius: 5, padding: "4px 6px", fontSize: 12, width: "100%", textAlign: "center" }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button type="submit" disabled={saving} style={{ background: DOU, color: "#fff", border: "none", borderRadius: 7, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {saving ? "Salvando..." : "Salvar QTS"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: "none", border: "1px solid #dde3ee", borderRadius: 7, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 12, overflow: "hidden" }}>
        {lista.length === 0 && <p style={{ padding: 16, fontSize: 13, color: "#9aa3b8" }}>Nenhuma QTS cadastrada.</p>}
        {lista.map((q, i) => (
          <div key={q.semana} style={{ borderTop: i > 0 ? "1px solid #edf0f7" : undefined,
            padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontWeight: 700, color: AZ, fontSize: 14 }}>Semana {q.semana}</span>
              <span style={{ fontSize: 12, color: "#9aa3b8", marginLeft: 12 }}>
                Cadastrada em {new Date(q.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <button onClick={() => deletar(q.semana)} style={{ fontSize: 12, color: "#e53e3e", background: "none", border: "none", cursor: "pointer" }}>
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── ABA DISCIPLINAS ──────────────────────────────────────────────────────────────
function AbaDisciplinas({ disciplinas: inicial }: { disciplinas: Disciplina[] }) {
  const router = useRouter()
  const [discs, setDiscs] = useState(inicial)
  const [editSigla, setEditSigla] = useState<string | null>(null)
  const [editVals, setEditVals] = useState({ cargaMinistrada: 0, status: "" })
  const [saving, setSaving] = useState(false)
  const [filtro, setFiltro] = useState<"todas"|"andamento"|"pendentes">("todas")

  async function salvar(sigla: string) {
    setSaving(true)
    await fetch("/api/disciplinas", {
      method: "PUT", headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ sigla, ...editVals }),
    })
    setSaving(false)
    setEditSigla(null)
    setDiscs(prev => prev.map(d => d.sigla === sigla ? { ...d, ...editVals } : d))
  }

  const lista = filtro === "andamento" ? discs.filter(d => d.status === "Em andamento")
    : filtro === "pendentes" ? discs.filter(d => d.status === "Início")
    : discs

  const corStatus = (s: string) => s === "Concluída" ? "#15803d" : s === "Em andamento" ? AM : "#94a3b8"

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {(["todas","andamento","pendentes"] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)} style={{
            padding: "6px 14px", border: "1.5px solid", borderRadius: 20, fontSize: 12, cursor: "pointer",
            borderColor: filtro === f ? AZ : "#dde3ee",
            background: filtro === f ? AZ : "#fff",
            color: filtro === f ? "#fff" : "#6b7a99", fontWeight: filtro === f ? 700 : 400,
          }}>
            {f === "todas" ? "Todas" : f === "andamento" ? "Em andamento" : "Pendentes"}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 12, overflow: "hidden" }}>
        {lista.map((d, i) => {
          const pct = d.cargaTotal > 0 ? Math.round((d.cargaMinistrada / d.cargaTotal) * 100) : 0
          const editando = editSigla === d.sigla
          return (
            <div key={d.sigla} style={{ borderTop: i > 0 ? "1px solid #edf0f7" : undefined, padding: "10px 16px" }}>
              {editando ? (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: AM, margin: "0 0 2px" }}>{d.sigla}</p>
                    <p style={{ fontSize: 13, color: AZ, margin: 0 }}>{d.nome}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: "#9aa3b8", display: "block", marginBottom: 2 }}>HORAS MINISTRADAS</label>
                    <input type="number" min={0} max={d.cargaTotal} value={editVals.cargaMinistrada}
                      onChange={e => setEditVals(v => ({ ...v, cargaMinistrada: Number(e.target.value) }))}
                      style={{ border: "1px solid #dde3ee", borderRadius: 6, padding: "5px 8px", fontSize: 13, width: 80 }} />
                    <span style={{ fontSize: 12, color: "#9aa3b8", marginLeft: 6 }}>/ {d.cargaTotal}h</span>
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: "#9aa3b8", display: "block", marginBottom: 2 }}>STATUS</label>
                    <select value={editVals.status} onChange={e => setEditVals(v => ({ ...v, status: e.target.value }))}
                      style={{ border: "1px solid #dde3ee", borderRadius: 6, padding: "5px 8px", fontSize: 13 }}>
                      <option>Início</option><option>Em andamento</option><option>Concluída</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => salvar(d.sigla)} disabled={saving} style={{ background: AZ, color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {saving ? "..." : "Salvar"}
                    </button>
                    <button onClick={() => setEditSigla(null)} style={{ background: "none", border: "none", fontSize: 12, color: "#9aa3b8", cursor: "pointer" }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: AM }}>{d.sigla}</span>
                      <span style={{ fontSize: 13, color: AZ }}>{d.nome}</span>
                      <span style={{ fontSize: 11, color: corStatus(d.status), fontWeight: 600, marginLeft: "auto" }}>{d.status}</span>
                    </div>
                    <div style={{ height: 4, background: "#edf0f7", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99,
                        background: pct >= 100 ? "#15803d" : pct > 0 ? AM : "#cbd5e1" }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: "#9aa3b8", flexShrink: 0 }}>{d.cargaMinistrada}h/{d.cargaTotal}h</span>
                  <button onClick={() => { setEditSigla(d.sigla); setEditVals({ cargaMinistrada: d.cargaMinistrada, status: d.status }) }}
                    style={{ fontSize: 11, color: AM, background: "#f0f4ff", border: "none", borderRadius: 5, padding: "3px 10px", cursor: "pointer", flexShrink: 0 }}>
                    Editar
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── ABA VISÃO GERAL ──────────────────────────────────────────────────────────────
function AbaGeral({ stats, missoes, avisos, xerifes, semanaAtual }: {
  stats: Stats; missoes: MissaoItem[]; avisos: AvisoItem[]; xerifes: XerifeItem[]; semanaAtual: number
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
        <StatCard label="Cadetes ativos" value={stats.alunosAtivos} icon="👥" />
        <StatCard label="Semana atual" value={`${semanaAtual}/52`} icon="📅" />
        <StatCard label="Notas lançadas" value={stats.totalNotas} icon="📝" />
        <StatCard label="Missões concluídas" value={stats.totalMissoesConcluidas} icon="✅" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 12, padding: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#9aa3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Últimas Missões
          </p>
          {missoes.slice(0, 5).map(m => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid #f5f7fb" }}>
              <span style={{ fontSize: 13, color: AZ }}>{m.titulo.slice(0, 32)}{m.titulo.length > 32 ? "…" : ""}</span>
              <span style={{ fontSize: 11, color: "#9aa3b8" }}>S{m.semana}</span>
            </div>
          ))}
          {missoes.length === 0 && <p style={{ fontSize: 13, color: "#9aa3b8" }}>Nenhuma missão.</p>}
        </div>

        <div style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 12, padding: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#9aa3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Últimos Avisos
          </p>
          {avisos.slice(0, 5).map(a => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid #f5f7fb", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: AZ }}>{a.titulo.slice(0, 32)}{a.titulo.length > 32 ? "…" : ""}</span>
              {a.fixado && <span style={{ fontSize: 10, color: "#b45309" }}>📌</span>}
            </div>
          ))}
          {avisos.length === 0 && <p style={{ fontSize: 13, color: "#9aa3b8" }}>Nenhum aviso.</p>}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 12, padding: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#9aa3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Xerifância Recente
        </p>
        {xerifes.map((x, i) => (
          <div key={x.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderTop: i > 0 ? "1px solid #f5f7fb" : undefined }}>
            <span style={{ fontSize: 13, fontWeight: x.atual ? 700 : 400, color: x.atual ? AZ : "#6b7a99" }}>{x.nomeGuerra}</span>
            <span style={{ fontSize: 12, color: "#9aa3b8" }}>Mat. {x.matricula}</span>
            {x.atual && <span style={{ fontSize: 11, background: "#f0c060", color: "#7a4f00", padding: "1px 8px", borderRadius: 99, fontWeight: 700, marginLeft: "auto" }}>Atual</span>}
            <span style={{ fontSize: 11, color: "#9aa3b8", marginLeft: x.atual ? 0 : "auto" }}>
              {new Date(x.dataInicio).toLocaleDateString("pt-BR")}
            </span>
          </div>
        ))}
      </div>

      <div style={{ background: "#f8faff", border: "1px solid #dde3ee", borderRadius: 12, padding: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#9aa3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Acesso Rápido
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { href: "/xerifancia", label: "Xerifância" },
            { href: "/comunicados", label: "Comunicados" },
            { href: "/qts", label: "QTS" },
            { href: "/escalas", label: "Escalas" },
            { href: "/avisos", label: "Avisos" },
          ].map(l => (
            <a key={l.href} href={l.href} style={{ background: AZ, color: "#fff", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────────
export function AdminClient({ semanaAtual, alunos, disciplinas, qtsList, missoes, avisos, xerifes, stats }: Props) {
  const [aba, setAba] = useState<"geral"|"alunos"|"qts"|"disciplinas">("geral")

  const ABAS = [
    { id: "geral"       as const, label: "Visão Geral" },
    { id: "alunos"      as const, label: "Alunos" },
    { id: "qts"         as const, label: "QTS" },
    { id: "disciplinas" as const, label: "Disciplinas" },
  ]

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: AZ, fontFamily: "var(--serif)", marginBottom: 24 }}>
        Painel de Administração
      </h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "2px solid #edf0f7" }}>
        {ABAS.map(a => (
          <button key={a.id} onClick={() => setAba(a.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "8px 18px", fontSize: 14, fontWeight: aba === a.id ? 700 : 400,
            color: aba === a.id ? AZ : "#9aa3b8",
            borderBottom: aba === a.id ? `2px solid ${DOU}` : "2px solid transparent",
            marginBottom: -2, transition: "all 0.15s",
          }}>{a.label}</button>
        ))}
      </div>

      {aba === "geral"       && <AbaGeral stats={stats} missoes={missoes} avisos={avisos} xerifes={xerifes} semanaAtual={semanaAtual} />}
      {aba === "alunos"      && <AbaAlunos alunos={alunos} />}
      {aba === "qts"         && <AbaQTS qtsList={qtsList} semanaAtual={semanaAtual} />}
      {aba === "disciplinas" && <AbaDisciplinas disciplinas={disciplinas} />}
    </div>
  )
}
