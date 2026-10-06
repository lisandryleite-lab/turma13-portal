"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export type AlunoTropa = {
  matricula: number
  nomeGuerra: string
  nomeCompleto: string
  pelotao: number | null
  ativo: boolean
  turma13: boolean
  aniversario: string | null
  equipe: string | null
  email?: string
}

const PELOTOES = [1, 2, 3, 4, 5, 6, 7]
const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 11px", borderRadius: 8, border: "1px solid rgba(58,74,58,0.3)", background: "#fff", color: "var(--ink)", fontSize: 14 }
const cartao: React.CSSProperties = { background: "#fff", borderRadius: 14, border: "1px solid rgba(58,74,58,0.14)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }

export function TropaClient({ alunos, isAdmin, minhaMatricula }: { alunos: AlunoTropa[]; isAdmin: boolean; minhaMatricula: number }) {
  const router = useRouter()
  const [filtro, setFiltro] = useState<number | "todos" | "sem">(() => alunos.find(a => a.matricula === minhaMatricula)?.pelotao ?? "todos")
  const [busca, setBusca] = useState("")
  const [editando, setEditando] = useState<AlunoTropa | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")

  const contagem = useMemo(() => {
    const c = new Map<number | "sem", number>()
    for (const a of alunos) { const k = a.pelotao ?? "sem"; c.set(k, (c.get(k) ?? 0) + 1) }
    return c
  }, [alunos])

  const lista = useMemo(() => {
    const termo = semAcento(busca.trim())
    return alunos
      .filter(a => termo ? true : filtro === "todos" ? true : filtro === "sem" ? a.pelotao == null : a.pelotao === filtro)
      .filter(a => !termo || semAcento(`${a.matricula} ${a.nomeGuerra} ${a.nomeCompleto}`).includes(termo))
      .sort((a, b) => (a.pelotao ?? 99) - (b.pelotao ?? 99) || a.matricula - b.matricula)
  }, [alunos, filtro, busca])

  // agrupado por pelotão (quando "todos" ou busca)
  const grupos = useMemo(() => {
    const g = new Map<number | "sem", AlunoTropa[]>()
    for (const a of lista) { const k = a.pelotao ?? "sem"; (g.get(k) ?? g.set(k, []).get(k)!).push(a) }
    return [...g.entries()]
  }, [lista])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!editando) return
    setSalvando(true); setErro("")
    const res = await fetch("/api/tropa", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matricula: editando.matricula, nomeGuerra: editando.nomeGuerra, nomeCompleto: editando.nomeCompleto,
        pelotao: editando.pelotao, ativo: editando.ativo, aniversario: editando.aniversario,
      }),
    })
    setSalvando(false)
    if (!res.ok) { const j = await res.json().catch(() => ({})); return setErro(j.error || "Erro ao salvar.") }
    setEditando(null); router.refresh()
  }

  const ativos = alunos.filter(a => a.ativo).length

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 40px" }}>
      <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.6rem", color: "var(--olive)", margin: 0 }}>Controle de Tropa</h1>
      <p style={{ color: "var(--ink-60)", fontSize: 13.5, margin: "4px 0 16px" }}>
        1ª Companhia · <strong>{alunos.length}</strong> alunos cadastrados ({ativos} ativos) · Turma 13 = 1º Pelotão
      </p>

      {/* Efetivo por pelotão */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))", gap: 8, marginBottom: 16 }}>
        {(["todos", ...PELOTOES, ...(contagem.get("sem") ? ["sem" as const] : [])] as (number | "todos" | "sem")[]).map(p => {
          const on = filtro === p && !busca
          const n = p === "todos" ? alunos.length : contagem.get(p) ?? 0
          return (
            <button key={p} onClick={() => { setFiltro(p); setBusca("") }}
              style={{ ...cartao, padding: "10px 6px", cursor: "pointer", textAlign: "center",
                background: on ? "var(--olive)" : "#fff", color: on ? "var(--canvas)" : "var(--ink)", border: on ? "1px solid var(--olive)" : cartao.border }}>
              <span style={{ display: "block", fontSize: 20, fontWeight: 700, fontFamily: "var(--serif-cfo)" }}>{n}</span>
              <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, opacity: 0.8 }}>{p === "todos" ? "Toda a CIA" : p === "sem" ? "Sem pelotão" : `${p}º Pelotão`}</span>
            </button>
          )
        })}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="🔍 Buscar por nome ou matrícula (em toda a CIA)" style={{ ...inputStyle, flex: 1, minWidth: 220, fontSize: 15 }} />
        {isAdmin && (
          <Link href="/admin" style={{ padding: "9px 14px", borderRadius: 8, background: "var(--olive)", color: "var(--canvas)", textDecoration: "none", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap" }}>
            + Cadastrar aluno
          </Link>
        )}
      </div>

      {lista.length === 0 && <p style={{ color: "var(--ink-60)" }}>Ninguém encontrado.</p>}

      {grupos.map(([pel, membros]) => (
        <section key={pel} style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 12.5, fontWeight: 700, color: "var(--olive)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>
            {pel === "sem" ? "Sem pelotão" : `${pel}º Pelotão${pel === 1 ? " · Turma 13" : ""}`} <span style={{ color: "var(--ink-60)", fontWeight: 400 }}>({membros.length})</span>
          </h2>
          <div style={{ ...cartao, overflow: "hidden" }}>
            {membros.map((a, i) => (
              <div key={a.matricula} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderTop: i ? "1px solid var(--surface)" : "none",
                background: a.matricula === minhaMatricula ? "rgba(181,147,63,0.12)" : "transparent", opacity: a.ativo ? 1 : 0.55 }}>
                <span style={{ width: 40, flexShrink: 0, fontWeight: 700, color: "var(--gold)", fontSize: 14, textAlign: "right" }}>{a.matricula}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--ink)" }}>
                    {a.nomeGuerra}{a.matricula === minhaMatricula ? <span style={{ color: "var(--gold)", fontWeight: 600 }}> · você</span> : null}
                    {!a.ativo && <span style={{ marginLeft: 6, fontSize: 11, color: "var(--red)", fontWeight: 600 }}>inativo</span>}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-60)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.nomeCompleto}
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: "var(--ink-60)", marginTop: 2 }}>
                    {a.equipe && <span>🛡 {a.equipe}</span>}
                    {a.aniversario && <span>🎂 {a.aniversario}</span>}
                    {isAdmin && a.email && <span>✉ {a.email}</span>}
                  </div>
                </div>
                {isAdmin && (
                  <button onClick={() => { setEditando({ ...a }); setErro("") }}
                    style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--olive)", background: "#fff", color: "var(--olive)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    Editar
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Edição (admin) */}
      {editando && (
        <div onClick={() => setEditando(null)} style={{ position: "fixed", inset: 0, background: "rgba(43,42,39,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }}>
          <form onClick={e => e.stopPropagation()} onSubmit={salvar} style={{ ...cartao, width: "100%", maxWidth: 440, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 style={{ margin: 0, fontFamily: "var(--serif-cfo)", color: "var(--olive)", fontSize: "1.2rem" }}>Editar · Mat. {editando.matricula}</h3>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Nome de guerra
              <input style={{ ...inputStyle, marginTop: 4 }} value={editando.nomeGuerra} onChange={e => setEditando({ ...editando, nomeGuerra: e.target.value })} />
            </label>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Nome completo
              <input style={{ ...inputStyle, marginTop: 4 }} value={editando.nomeCompleto} onChange={e => setEditando({ ...editando, nomeCompleto: e.target.value })} />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Pelotão
                <select style={{ ...inputStyle, marginTop: 4 }} value={editando.pelotao ?? ""} onChange={e => setEditando({ ...editando, pelotao: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">— sem —</option>
                  {PELOTOES.map(p => <option key={p} value={p}>{p}º Pelotão</option>)}
                </select>
              </label>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Aniversário
                <input style={{ ...inputStyle, marginTop: 4 }} value={editando.aniversario ?? ""} placeholder="dd/mm" onChange={e => setEditando({ ...editando, aniversario: e.target.value || null })} />
              </label>
            </div>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5 }}>
              <input type="checkbox" checked={editando.ativo} onChange={e => setEditando({ ...editando, ativo: e.target.checked })} /> Aluno ativo (consta nas escalas)
            </label>
            {erro && <p style={{ margin: 0, color: "var(--red)", fontSize: 13 }}>✗ {erro}</p>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setEditando(null)} style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid rgba(58,74,58,0.3)", background: "#fff", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
              <button type="submit" disabled={salvando} style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", cursor: "pointer", fontWeight: 600 }}>
                {salvando ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
