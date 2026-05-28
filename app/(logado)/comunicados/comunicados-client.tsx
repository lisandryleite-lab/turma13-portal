"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

type Aviso = { id: string; titulo: string; corpo: string; fixado: boolean; createdAt: Date | string }

type Conclusao = { id: string; user: { id: string; nomeGuerra: string; matricula: number } }

type Missao = {
  id: string
  semana: number
  titulo: string
  corpo: string
  createdAt: Date | string
  conclusoes: Conclusao[]
}

type Aluno = { id: string; nomeGuerra: string; matricula: number }

interface Props {
  avisos: Aviso[]
  missoes: Missao[]
  alunos: Aluno[]
  isAdmin: boolean
  userId: string
  semanaAtual: number
}

// ── helpers visuais ─────────────────────────────────────────────────────────────
const AZ  = "var(--azul-profundo)"
const AM  = "var(--azul-medio)"
const DOU = "var(--dourado)"

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 14,
      boxShadow: "0 1px 4px rgba(11,45,94,0.06)", ...style }}>
      {children}
    </div>
  )
}

// ── ABA AVISOS ──────────────────────────────────────────────────────────────────
function AbaAvisos({ avisos: inicial, isAdmin }: { avisos: Aviso[]; isAdmin: boolean }) {
  const router = useRouter()
  const [avisos, setAvisos] = useState(inicial)
  const [form, setForm] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [corpo, setCorpo] = useState("")
  const [fixado, setFixado] = useState(false)
  const [saving, setSaving] = useState(false)

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/avisos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, corpo, fixado }),
    })
    setSaving(false)
    setForm(false)
    setTitulo(""); setCorpo(""); setFixado(false)
    router.refresh()
  }

  async function deletar(id: string) {
    if (!confirm("Excluir este aviso?")) return
    await fetch(`/api/avisos/${id}`, { method: "DELETE" })
    setAvisos(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div>
          <button onClick={() => setForm(!form)} style={{
            background: AZ, color: "#fff", border: "none", borderRadius: 8,
            padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            {form ? "Cancelar" : "+ Novo Aviso"}
          </button>
          {form && (
            <form onSubmit={criar} style={{ marginTop: 12 }}>
              <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título"
                  required style={{ border: "1px solid #dde3ee", borderRadius: 8, padding: "8px 12px", fontSize: 14 }} />
                <textarea value={corpo} onChange={e => setCorpo(e.target.value)} placeholder="Conteúdo"
                  rows={4} required style={{ border: "1px solid #dde3ee", borderRadius: 8, padding: "8px 12px",
                    fontSize: 14, resize: "none" }} />
                <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={fixado} onChange={e => setFixado(e.target.checked)} />
                  Fixar aviso
                </label>
                <button type="submit" disabled={saving} style={{
                  background: DOU, color: "#fff", border: "none", borderRadius: 8,
                  padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  alignSelf: "flex-start", opacity: saving ? 0.6 : 1,
                }}>
                  {saving ? "Publicando..." : "Publicar"}
                </button>
              </Card>
            </form>
          )}
        </div>
      )}

      {avisos.length === 0 && (
        <p style={{ color: "#9aa3b8", fontSize: 14 }}>Nenhum aviso publicado ainda.</p>
      )}

      {avisos.map(a => (
        <Card key={a.id} style={{
          borderColor: a.fixado ? "#f0c060" : "#dde3ee",
          background: a.fixado ? "#fffbf0" : "#fff",
        }}>
          <div style={{ padding: "18px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: AZ, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                {a.fixado && <span style={{ color: "#c08020", fontSize: 14 }}>📌</span>}
                {a.titulo}
              </h3>
              <p style={{ fontSize: 14, color: "#4a5568", marginTop: 6, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{a.corpo}</p>
              <p style={{ fontSize: 11, color: "#9aa3b8", marginTop: 8 }}>
                {new Date(a.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
            {isAdmin && (
              <button onClick={() => deletar(a.id)} style={{
                background: "none", border: "none", color: "#e53e3e", cursor: "pointer",
                fontSize: 12, padding: "2px 6px", flexShrink: 0,
              }}>Excluir</button>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}

// ── ABA MISSÃO ──────────────────────────────────────────────────────────────────
function AbaMissao({
  missoes: inicial, alunos, isAdmin, userId, semanaAtual,
}: { missoes: Missao[]; alunos: Aluno[]; isAdmin: boolean; userId: string; semanaAtual: number }) {
  const router = useRouter()
  const [missoes, setMissoes] = useState(inicial)
  const [form, setForm] = useState(false)
  const [semana, setSemana] = useState(String(semanaAtual))
  const [titulo, setTitulo] = useState("")
  const [corpo, setCorpo] = useState("")
  const [saving, setSaving] = useState(false)
  const [, startTransition] = useTransition()

  const atual = missoes[0]

  async function publicar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/missao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ semana: Number(semana), titulo, corpo }),
    })
    setSaving(false)
    setForm(false)
    setTitulo(""); setCorpo("")
    router.refresh()
  }

  async function excluirMissao(id: string) {
    if (!confirm("Excluir esta missão?")) return
    await fetch("/api/missao", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setMissoes(prev => prev.filter(m => m.id !== id))
  }

  async function toggleConcluir(missaoId: string) {
    const res = await fetch("/api/missao/concluir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ missaoId }),
    })
    const data = await res.json()
    startTransition(() => {
      setMissoes(prev => prev.map(m => {
        if (m.id !== missaoId) return m
        if (data.concluida) {
          const meAluno = alunos.find(a => a.id === userId)
          return { ...m, conclusoes: [...m.conclusoes, { id: "tmp", user: { id: userId, nomeGuerra: meAluno?.nomeGuerra ?? "Você", matricula: meAluno?.matricula ?? 0 } }] }
        } else {
          return { ...m, conclusoes: m.conclusoes.filter(c => c.user.id !== userId) }
        }
      }))
    })
  }

  function euConclui(m: Missao) { return m.conclusoes.some(c => c.user.id === userId) }
  function quemConcluiu(m: Missao) { return m.conclusoes.map(c => c.user) }
  function quemFalta(m: Missao) { return alunos.filter(a => !m.conclusoes.some(c => c.user.id === a.id)) }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {isAdmin && (
        <div>
          <button onClick={() => setForm(!form)} style={{
            background: AZ, color: "#fff", border: "none", borderRadius: 8,
            padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            {form ? "Cancelar" : "+ Publicar Missão"}
          </button>
          {form && (
            <form onSubmit={publicar} style={{ marginTop: 12 }}>
              <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                  <div>
                    <label style={{ fontSize: 11, color: AM, fontWeight: 600, display: "block", marginBottom: 4 }}>SEMANA</label>
                    <input type="number" min={1} max={52} value={semana} onChange={e => setSemana(e.target.value)}
                      required style={{ border: "1px solid #dde3ee", borderRadius: 8, padding: "8px 12px", fontSize: 14, width: 80 }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: AM, fontWeight: 600, display: "block", marginBottom: 4 }}>TÍTULO</label>
                  <input value={titulo} onChange={e => setTitulo(e.target.value)} required
                    style={{ border: "1px solid #dde3ee", borderRadius: 8, padding: "8px 12px", fontSize: 14, width: "100%" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: AM, fontWeight: 600, display: "block", marginBottom: 4 }}>MISSÃO</label>
                  <textarea value={corpo} onChange={e => setCorpo(e.target.value)} rows={5} required
                    style={{ border: "1px solid #dde3ee", borderRadius: 8, padding: "8px 12px",
                      fontSize: 14, width: "100%", resize: "none" }} />
                </div>
                <button type="submit" disabled={saving} style={{
                  background: DOU, color: "#fff", border: "none", borderRadius: 8,
                  padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  alignSelf: "flex-start", opacity: saving ? 0.6 : 1,
                }}>
                  {saving ? "Publicando..." : "Publicar"}
                </button>
              </Card>
            </form>
          )}
        </div>
      )}

      {!atual && (
        <p style={{ color: "#9aa3b8", fontSize: 14 }}>Nenhuma missão publicada ainda.</p>
      )}

      {/* Missão atual */}
      {atual && (
        <Card>
          <div style={{ padding: "20px 20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                background: AZ, color: "#fff", padding: "3px 10px", borderRadius: 99,
              }}>
                Semana {atual.semana}
              </span>
              {isAdmin && (
                <button onClick={() => excluirMissao(atual.id)} style={{
                  background: "none", border: "none", color: "#e53e3e",
                  fontSize: 12, cursor: "pointer", padding: "2px 6px",
                }}>Excluir</button>
              )}
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: AZ, margin: "10px 0 6px" }}>{atual.titulo}</h2>
            <p style={{ fontSize: 14, color: "#4a5568", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{atual.corpo}</p>
          </div>

          {/* Progresso */}
          <div style={{ margin: "16px 20px 0", padding: "14px 0", borderTop: "1px solid #edf0f7" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: AM }}>
                Conclusões: {quemConcluiu(atual).length}/{alunos.length}
              </span>
              <span style={{ fontSize: 12, color: "#9aa3b8" }}>
                {alunos.length - quemConcluiu(atual).length} faltando
              </span>
            </div>
            <div style={{ height: 6, background: "#edf0f7", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${alunos.length ? (quemConcluiu(atual).length / alunos.length) * 100 : 0}%`,
                background: "linear-gradient(90deg, #22c55e, #16a34a)",
                borderRadius: 99,
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>

          {/* Botão do aluno */}
          {!isAdmin && (
            <div style={{ padding: "12px 20px 20px" }}>
              <button onClick={() => toggleConcluir(atual.id)} style={{
                background: euConclui(atual) ? "#22c55e" : "#f0f4ff",
                color: euConclui(atual) ? "#fff" : AM,
                border: `1.5px solid ${euConclui(atual) ? "#16a34a" : "#c7d3f0"}`,
                borderRadius: 8, padding: "8px 18px", fontSize: 13,
                fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                {euConclui(atual) ? "✓ Concluída" : "Marcar como concluída"}
              </button>
            </div>
          )}

          {/* Listas de conclusão */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid #edf0f7" }}>
            <div style={{ padding: 16, borderRight: "1px solid #edf0f7" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", textTransform: "uppercase",
                letterSpacing: "0.06em", marginBottom: 10 }}>
                ✓ Concluíram ({quemConcluiu(atual).length})
              </p>
              {quemConcluiu(atual).length === 0
                ? <p style={{ fontSize: 12, color: "#9aa3b8" }}>Nenhum ainda</p>
                : quemConcluiu(atual).map(u => (
                  <p key={u.id} style={{ fontSize: 12, color: AZ, padding: "2px 0",
                    fontWeight: u.id === userId ? 700 : 400 }}>
                    {u.nomeGuerra}{u.id === userId ? " (você)" : ""}
                  </p>
                ))
              }
            </div>
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#e53e3e", textTransform: "uppercase",
                letterSpacing: "0.06em", marginBottom: 10 }}>
                ✗ Faltam ({quemFalta(atual).length})
              </p>
              {quemFalta(atual).length === 0
                ? <p style={{ fontSize: 12, color: "#22c55e" }}>Todos concluíram! 🎉</p>
                : quemFalta(atual).map(a => (
                  <p key={a.id} style={{ fontSize: 12, color: "#6b7a99", padding: "2px 0" }}>
                    {a.nomeGuerra}
                  </p>
                ))
              }
            </div>
          </div>
        </Card>
      )}

      {/* Histórico */}
      {missoes.length > 1 && (
        <div>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: "#9aa3b8", textTransform: "uppercase",
            letterSpacing: "0.06em", marginBottom: 12 }}>Histórico</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {missoes.slice(1).map(m => (
              <Card key={m.id}>
                <div style={{ padding: "14px 16px", display: "flex", alignItems: "center",
                  justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 11, color: "#9aa3b8" }}>Semana {m.semana}</span>
                    <p style={{ fontSize: 14, fontWeight: 600, color: AZ, margin: "2px 0" }}>{m.titulo}</p>
                    <p style={{ fontSize: 12, color: "#6b7a99" }}>
                      {quemConcluiu(m).length}/{alunos.length} concluíram
                    </p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => excluirMissao(m.id)} style={{
                      background: "none", border: "none", color: "#e53e3e",
                      fontSize: 12, cursor: "pointer", flexShrink: 0,
                    }}>Excluir</button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────────
export function ComunicadosClient({ avisos, missoes, alunos, isAdmin, userId, semanaAtual }: Props) {
  const [aba, setAba] = useState<"avisos" | "missao">("avisos")

  const ABAS = [
    { id: "avisos" as const, label: "Avisos" },
    { id: "missao" as const, label: "Missão" },
  ]

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: AZ,
        fontFamily: "var(--serif)", marginBottom: 6 }}>Comunicados</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24,
        borderBottom: "2px solid #edf0f7", paddingBottom: 0 }}>
        {ABAS.map(a => (
          <button key={a.id} onClick={() => setAba(a.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "8px 18px", fontSize: 14, fontWeight: aba === a.id ? 700 : 400,
            color: aba === a.id ? AZ : "#9aa3b8",
            borderBottom: aba === a.id ? `2px solid ${DOU}` : "2px solid transparent",
            marginBottom: -2, transition: "all 0.15s",
          }}>
            {a.label}
          </button>
        ))}
      </div>

      {aba === "avisos"
        ? <AbaAvisos avisos={avisos} isAdmin={isAdmin} />
        : <AbaMissao missoes={missoes} alunos={alunos} isAdmin={isAdmin} userId={userId} semanaAtual={semanaAtual} />
      }
    </div>
  )
}
