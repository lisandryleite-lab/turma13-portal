"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { calcularMGCSimples } from "@/lib/ranking"

// ── tipos ───────────────────────────────────────────────────────────────────────
type Disciplina = { id: string; sigla: string; nome: string; modulo: string; cargaTotal: number; cargaMinistrada: number; status: string }
type NotaItem   = { id: string; disciplina: string; avaliacao: string; nota: number; peso: number; ehAF: boolean; apto: boolean; data: string; observacao: string | null }
type AlunoRank  = { id: string; matricula: number; nomeGuerra: string; canga: string | null; mgc: number | null }
type MinhaEntrada = AlunoRank & { posicao: number }

interface Props {
  ranking: AlunoRank[]
  minhaEntrada: MinhaEntrada | null
  isAdmin: boolean
  userId: string
  disciplinas: Disciplina[]
  minhasNotas: NotaItem[]
  totalAlunos: number
}

// ── helpers ──────────────────────────────────────────────────────────────────────
const AZ  = "var(--azul-profundo)"
const AM  = "var(--azul-medio)"
const DOU = "var(--dourado)"

function medalha(i: number) {
  if (i === 0) return "🥇"
  if (i === 1) return "🥈"
  if (i === 2) return "🥉"
  return null
}

function corNota(nota: number | null, apto: boolean) {
  if (apto) return "#15803d"
  if (nota === null) return "#9aa3b8"
  if (nota >= 7) return "#15803d"
  if (nota >= 4) return "#b45309"
  return "#b91c1c"
}

function calcMD(notas: NotaItem[]): number | null {
  const provas = notas.filter(n => !n.ehAF && !n.apto)
  if (!provas.length) return null
  return provas.reduce((s, n) => s + n.nota, 0) / provas.length
}

// ── ABA MEU RANKING ─────────────────────────────────────────────────────────────
function AbaMeuRanking({ ranking, minhaEntrada, isAdmin, totalAlunos }: {
  ranking: AlunoRank[]; minhaEntrada: MinhaEntrada | null; isAdmin: boolean; totalAlunos: number
}) {
  if (!isAdmin) {
    // Aluno vê apenas seu próprio card
    return (
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {minhaEntrada ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Card principal */}
            <div style={{
              background: `linear-gradient(135deg, ${AZ} 0%, #1a3a6e 100%)`,
              borderRadius: 20, padding: "32px 28px", color: "#fff", textAlign: "center",
              boxShadow: "0 8px 32px rgba(11,45,94,0.28)",
            }}>
              <div style={{ fontSize: 48, marginBottom: 4 }}>
                {medalha(minhaEntrada.posicao - 1) ?? "🎖️"}
              </div>
              <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Sua posição
              </p>
              <p style={{ fontSize: 56, fontWeight: 800, fontFamily: "var(--serif)", lineHeight: 1 }}>
                {minhaEntrada.posicao}º
              </p>
              <p style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>
                de {totalAlunos} cadetes
              </p>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", marginTop: 24, paddingTop: 20 }}>
                <p style={{ fontSize: 12, opacity: 0.65, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>MGC</p>
                <p style={{ fontSize: 40, fontWeight: 800, fontFamily: "var(--serif)", color: "var(--dourado-claro, #f0d080)" }}>
                  {minhaEntrada.mgc !== null ? minhaEntrada.mgc.toFixed(3) : "—"}
                </p>
                <p style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>
                  MFIC × 6,5 + NFDC × 2,5 + TCC × 1 / 10
                </p>
              </div>
            </div>

            {/* Info adicional */}
            <div style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 14, padding: "18px 20px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#9aa3b8", textTransform: "uppercase",
                letterSpacing: "0.06em", marginBottom: 12 }}>Seus dados</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#6b7a99" }}>Mat.</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: AZ }}>{minhaEntrada.matricula}</span>
                </div>
                {minhaEntrada.canga && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: "#6b7a99" }}>Canga</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: AZ }}>{minhaEntrada.canga}</span>
                  </div>
                )}
              </div>
            </div>

            <p style={{ fontSize: 12, color: "#9aa3b8", textAlign: "center" }}>
              Posições dos demais cadetes são privadas · Atualizado em tempo real
            </p>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>📊</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: AZ }}>Nenhuma nota lançada ainda</p>
            <p style={{ fontSize: 13, color: "#9aa3b8", marginTop: 6 }}>
              Acesse a aba <strong>Minhas Notas</strong> para começar a lançar.
            </p>
          </div>
        )}
      </div>
    )
  }

  // Admin vê tabela completa
  return (
    <div>
      <div style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 14,
        overflow: "hidden", boxShadow: "0 1px 4px rgba(11,45,94,0.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: AZ, color: "#fff" }}>
              {["Pos.", "Nome de Guerra", "Mat.", "Canga", "MGC"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: h === "MGC" ? "right" : "left",
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranking.map((a, i) => {
              const med = medalha(i)
              return (
                <tr key={a.matricula} style={{ borderTop: "1px solid #edf0f7" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 700,
                    color: med ? undefined : AM, fontSize: med ? 16 : 13 }}>
                    {med ? `${med} ${i + 1}º` : `${i + 1}º`}
                  </td>
                  <td style={{ padding: "10px 14px", color: AZ, fontWeight: 500 }}>{a.nomeGuerra}</td>
                  <td style={{ padding: "10px 14px", color: "#6b7a99" }}>{a.matricula}</td>
                  <td style={{ padding: "10px 14px", color: "#6b7a99" }}>{a.canga || "—"}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "monospace",
                    fontWeight: 700, color: a.mgc !== null ? AZ : "#c5cde0" }}>
                    {a.mgc !== null ? a.mgc.toFixed(3) : "—"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11, color: "#9aa3b8", textAlign: "center", marginTop: 12 }}>
        NFDC = 10 padrão · MGC = (MFIC × 6,5 + NFDC × 2,5 + TCC × 1) / 10 · Decreto 57.694/2024
      </p>
    </div>
  )
}

// ── ABA MINHAS NOTAS ────────────────────────────────────────────────────────────
function AbaMinhasNotas({ disciplinas, minhasNotas: inicial, userId }: {
  disciplinas: Disciplina[]; minhasNotas: NotaItem[]; userId: string
}) {
  const router = useRouter()
  const [notas, setNotas] = useState(inicial)
  const [aberta, setAberta] = useState<string | null>(null)
  const [formSigla, setFormSigla] = useState<string | null>(null)
  const [form, setForm] = useState({ avaliacao: "", nota: "", ehAF: false, apto: false, data: new Date().toISOString().slice(0, 10), observacao: "" })
  const [salvando, setSalvando] = useState(false)

  const notasPorDisc = useMemo(() => {
    const m: Record<string, NotaItem[]> = {}
    for (const n of notas) {
      if (!m[n.disciplina]) m[n.disciplina] = []
      m[n.disciplina].push(n)
    }
    return m
  }, [notas])

  // MFIC e MGC em tempo real
  const mgcAtual = useMemo(() => calcularMGCSimples(notas), [notas])
  const mficAtual = useMemo(() => {
    const notasSemTCC = notas.filter(n => n.disciplina !== "TCC" && n.avaliacao !== "TCC")
    if (!notasSemTCC.length) return null
    const porDisc = new Map<string, typeof notas>()
    for (const n of notasSemTCC) {
      if (!porDisc.has(n.disciplina)) porDisc.set(n.disciplina, [])
      porDisc.get(n.disciplina)!.push(n)
    }
    const medias: number[] = []
    for (const [, vers] of porDisc) {
      if (vers.some(v => v.apto)) continue
      const md = calcMD(vers)
      if (md === null) continue
      const af = vers.find(v => v.ehAF)?.nota ?? null
      let mdFinal = md
      if (md < 7 && md >= 4 && af !== null) mdFinal = (md + af) / 2 >= 7 ? 7 : (md + af) / 2
      medias.push(mdFinal)
    }
    return medias.length ? medias.reduce((s, m) => s + m, 0) / medias.length : null
  }, [notas])

  async function lancar(sigla: string) {
    if (!form.avaliacao) return
    setSalvando(true)
    const res = await fetch("/api/notas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disciplina: sigla, avaliacao: form.avaliacao, nota: Number(form.nota), ehAF: form.ehAF, apto: form.apto, data: form.data, observacao: form.observacao || null }),
    })
    const nova = await res.json()
    setSalvando(false)
    setFormSigla(null)
    setForm({ avaliacao: "", nota: "", ehAF: false, apto: false, data: new Date().toISOString().slice(0, 10), observacao: "" })
    setNotas(prev => [{ ...nova, data: nova.data?.slice(0, 10) ?? form.data }, ...prev])
  }

  async function deletar(id: string) {
    if (!confirm("Excluir esta nota?")) return
    await fetch(`/api/notas/${id}`, { method: "DELETE" })
    setNotas(prev => prev.filter(n => n.id !== id))
  }

  const discComNotas = disciplinas.filter(d => (notasPorDisc[d.sigla]?.length ?? 0) > 0)
  const discSemNotas = disciplinas.filter(d => (notasPorDisc[d.sigla]?.length ?? 0) === 0 && d.status !== "Início")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Painel de médias */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[
          { label: "MFIC (parcial)", val: mficAtual !== null ? mficAtual.toFixed(3) : "—" },
          { label: "NFDC", val: "10,000" },
          { label: "MGC (parcial)", val: mgcAtual !== null ? mgcAtual.toFixed(3) : "—" },
        ].map(item => (
          <div key={item.label} style={{ background: "#fff", border: "1px solid #dde3ee",
            borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#9aa3b8", textTransform: "uppercase",
              letterSpacing: "0.06em", marginBottom: 4 }}>{item.label}</p>
            <p style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--serif)", color: AZ }}>{item.val}</p>
          </div>
        ))}
      </div>

      {/* Disciplinas com notas */}
      {discComNotas.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9aa3b8", textTransform: "uppercase",
            letterSpacing: "0.06em", marginBottom: 8 }}>Com notas lançadas</p>
          <div style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 14, overflow: "hidden" }}>
            {discComNotas.map((d, i) => {
              const ns = notasPorDisc[d.sigla] || []
              const md = calcMD(ns)
              const isAberta = aberta === d.sigla
              const temAF = ns.some(n => n.ehAF)
              const podeP2 = d.cargaTotal >= 40

              return (
                <div key={d.sigla} style={{ borderTop: i > 0 ? "1px solid #edf0f7" : undefined }}>
                  <button onClick={() => setAberta(isAberta ? null : d.sigla)} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: md !== null && md >= 7 ? "#dcfce7" : md !== null && md >= 4 ? "#fef3c7" : "#fee2e2",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: corNota(md, ns.some(n => n.apto)) }}>
                        {ns.some(n => n.apto) ? "✓" : md !== null ? md.toFixed(1) : "?"}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: AM, margin: 0 }}>{d.sigla}</p>
                      <p style={{ fontSize: 13, color: AZ, margin: 0 }}>{d.nome}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: 11, color: "#9aa3b8", margin: 0 }}>{podeP2 ? "P1+P2" : "P1"}{temAF ? "+AF" : ""}</p>
                      <p style={{ fontSize: 11, color: "#c5cde0", margin: 0 }}>{d.cargaTotal}h</p>
                    </div>
                    <span style={{ fontSize: 12, color: "#9aa3b8", transform: isAberta ? "rotate(180deg)" : "none", transition: "0.2s" }}>▾</span>
                  </button>

                  {isAberta && (
                    <div style={{ background: "#f8faff", borderTop: "1px solid #edf0f7", padding: "12px 16px 14px" }}>
                      {/* Lista de notas */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                        {ns.map(n => (
                          <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12,
                            background: "#fff", borderRadius: 6, padding: "6px 10px", border: "1px solid #edf0f7" }}>
                            <span style={{ fontWeight: 700, width: 32, color: AM, flexShrink: 0 }}>{n.avaliacao}</span>
                            <span style={{ fontWeight: 700, color: corNota(n.nota, n.apto) }}>
                              {n.apto ? "APTO" : n.nota.toFixed(1)}
                            </span>
                            {n.ehAF && <span style={{ fontSize: 10, background: "#fef3c7", color: "#92400e", borderRadius: 4, padding: "1px 5px" }}>AF</span>}
                            {n.observacao && <span style={{ color: "#6b7a99", fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.observacao}</span>}
                            <span style={{ color: "#9aa3b8", marginLeft: "auto", flexShrink: 0 }}>{n.data}</span>
                            <button onClick={() => deletar(n.id)} style={{ background: "none", border: "none",
                              cursor: "pointer", color: "#b91c1c", fontSize: 16, padding: "0 2px", lineHeight: 1 }}>×</button>
                          </div>
                        ))}
                      </div>

                      {/* Formulário */}
                      {formSigla === d.sigla ? (
                        <div style={{ background: "#fff", borderRadius: 8, padding: "12px",
                          border: `1.5px solid ${AM}`, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
                          <div>
                            <label style={{ fontSize: 11, color: "#6b7a99", display: "block", marginBottom: 2 }}>Avaliação *</label>
                            <input value={form.avaliacao} onChange={e => setForm(f => ({ ...f, avaliacao: e.target.value }))}
                              placeholder={podeP2 ? "P1, P2, AF…" : "P1, AF…"}
                              style={{ border: "1px solid #dde3ee", borderRadius: 6, padding: "5px 8px", fontSize: 13, width: 70 }} />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, color: "#6b7a99", display: "block", marginBottom: 2 }}>Nota (0–10)</label>
                            <input type="number" min={0} max={10} step={0.1} value={form.nota}
                              onChange={e => setForm(f => ({ ...f, nota: e.target.value }))} disabled={form.apto}
                              style={{ border: "1px solid #dde3ee", borderRadius: 6, padding: "5px 8px", fontSize: 13, width: 65, opacity: form.apto ? 0.4 : 1 }} />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, color: "#6b7a99", display: "block", marginBottom: 2 }}>Data</label>
                            <input type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                              style={{ border: "1px solid #dde3ee", borderRadius: 6, padding: "5px 8px", fontSize: 13 }} />
                          </div>
                          <div style={{ display: "flex", gap: 12, paddingBottom: 3 }}>
                            <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                              <input type="checkbox" checked={form.ehAF} onChange={e => setForm(f => ({ ...f, ehAF: e.target.checked }))} /> AF
                            </label>
                            <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                              <input type="checkbox" checked={form.apto} onChange={e => setForm(f => ({ ...f, apto: e.target.checked }))} /> Apto
                            </label>
                          </div>
                          <div>
                            <label style={{ fontSize: 11, color: "#6b7a99", display: "block", marginBottom: 2 }}>Obs.</label>
                            <input value={form.observacao} onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))}
                              style={{ border: "1px solid #dde3ee", borderRadius: 6, padding: "5px 8px", fontSize: 13, width: 120 }} />
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => lancar(d.sigla)} disabled={salvando || !form.avaliacao} style={{
                              background: AZ, color: "#fff", border: "none", borderRadius: 6,
                              padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                              opacity: !form.avaliacao ? 0.5 : 1,
                            }}>{salvando ? "..." : "Salvar"}</button>
                            <button onClick={() => setFormSigla(null)} style={{
                              background: "none", border: "none", fontSize: 12, color: "#9aa3b8", cursor: "pointer",
                            }}>Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setFormSigla(d.sigla); setForm({ avaliacao: "", nota: "", ehAF: false, apto: false, data: new Date().toISOString().slice(0, 10), observacao: "" }) }}
                          style={{ fontSize: 12, color: AM, background: "none", border: `1px solid ${AM}`,
                            borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>
                          + Lançar nota
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Disciplinas sem notas (em andamento/concluídas) */}
      {discSemNotas.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9aa3b8", textTransform: "uppercase",
            letterSpacing: "0.06em", marginBottom: 8 }}>Sem nota lançada</p>
          <div style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 14, overflow: "hidden" }}>
            {discSemNotas.map((d, i) => (
              <div key={d.sigla} style={{ borderTop: i > 0 ? "1px solid #edf0f7" : undefined,
                padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: AM, width: 52, flexShrink: 0 }}>{d.sigla}</span>
                <span style={{ fontSize: 13, color: AZ, flex: 1 }}>{d.nome}</span>
                <button onClick={() => { setAberta(d.sigla); setFormSigla(d.sigla); setForm({ avaliacao: "", nota: "", ehAF: false, apto: false, data: new Date().toISOString().slice(0, 10), observacao: "" }) }}
                  style={{ fontSize: 11, color: AM, background: "#f0f4ff", border: "none",
                    borderRadius: 6, padding: "4px 10px", cursor: "pointer", flexShrink: 0 }}>
                  + Nota
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── ABA SIMULAR ──────────────────────────────────────────────────────────────────
function AbaSimular({ disciplinas, minhasNotas }: { disciplinas: Disciplina[]; minhasNotas: NotaItem[] }) {
  // Inicializa simulação com as notas reais
  const [sim, setSim] = useState<Record<string, Record<string, string>>>(() => {
    const m: Record<string, Record<string, string>> = {}
    for (const n of minhasNotas) {
      if (!m[n.disciplina]) m[n.disciplina] = {}
      m[n.disciplina][n.avaliacao] = n.apto ? "apto" : String(n.nota)
    }
    return m
  })

  const mgcSim = useMemo(() => {
    const notasSim: Array<{ disciplina: string; avaliacao: string; nota: number; ehAF: boolean; apto: boolean; peso: number }> = []
    for (const [disc, avals] of Object.entries(sim)) {
      for (const [aval, val] of Object.entries(avals)) {
        if (val === "" || val === undefined) continue
        const apto = val === "apto"
        const nota = apto ? 10 : Number(val)
        if (!apto && isNaN(nota)) continue
        notasSim.push({ disciplina: disc, avaliacao: aval, nota, ehAF: aval === "AF", apto, peso: 1 })
      }
    }
    return calcularMGCSimples(notasSim)
  }, [sim])

  const discAtivas = disciplinas.filter(d => d.status !== "Início" || minhasNotas.some(n => n.disciplina === d.sigla))

  function setNota(disc: string, aval: string, val: string) {
    setSim(prev => ({ ...prev, [disc]: { ...prev[disc], [aval]: val } }))
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* MGC simulada */}
      <div style={{
        background: `linear-gradient(135deg, ${AZ}, #1a3a6e)`,
        borderRadius: 16, padding: "24px", textAlign: "center", color: "#fff",
      }}>
        <p style={{ fontSize: 12, opacity: 0.65, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
          MGC Simulada
        </p>
        <p style={{ fontSize: 48, fontWeight: 800, fontFamily: "var(--serif)",
          color: "var(--dourado-claro, #f0d080)", margin: 0 }}>
          {mgcSim !== null ? mgcSim.toFixed(3) : "—"}
        </p>
        <p style={{ fontSize: 11, opacity: 0.5, marginTop: 6 }}>Edite os campos abaixo para simular</p>
      </div>

      {/* Tabela de simulação */}
      <div style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #edf0f7",
          display: "grid", gridTemplateColumns: "1fr 70px 70px 70px",
          gap: 8, fontSize: 11, fontWeight: 700, color: "#9aa3b8", textTransform: "uppercase" }}>
          <span>Disciplina</span><span style={{ textAlign: "center" }}>P1</span>
          <span style={{ textAlign: "center" }}>P2</span><span style={{ textAlign: "center" }}>AF</span>
        </div>
        {discAtivas.map((d, i) => {
          const podeP2 = d.cargaTotal >= 40
          return (
            <div key={d.sigla} style={{ borderTop: i > 0 ? "1px solid #edf0f7" : undefined,
              padding: "8px 16px", display: "grid", gridTemplateColumns: "1fr 70px 70px 70px", gap: 8, alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: AM }}>{d.sigla}</span>
                <span style={{ fontSize: 12, color: "#6b7a99", marginLeft: 6 }}>{d.nome.slice(0, 30)}{d.nome.length > 30 ? "…" : ""}</span>
              </div>
              {(["P1", "P2", "AF"] as const).map(aval => (
                <input key={aval}
                  disabled={aval === "P2" && !podeP2}
                  type="number" min={0} max={10} step={0.1}
                  value={sim[d.sigla]?.[aval] ?? ""}
                  onChange={e => setNota(d.sigla, aval, e.target.value)}
                  placeholder={aval === "P2" && !podeP2 ? "—" : ""}
                  style={{
                    border: "1px solid #dde3ee", borderRadius: 6, padding: "4px 6px",
                    fontSize: 13, textAlign: "center", width: "100%",
                    opacity: aval === "P2" && !podeP2 ? 0.3 : 1,
                    background: aval === "P2" && !podeP2 ? "#f8faff" : "#fff",
                  }}
                />
              ))}
            </div>
          )
        })}
      </div>

      <p style={{ fontSize: 12, color: "#9aa3b8", textAlign: "center" }}>
        Simulação não salva dados. Acesse <strong>Minhas Notas</strong> para lançamento oficial.
      </p>
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────────
export function RankingClient({ ranking, minhaEntrada, isAdmin, userId, disciplinas, minhasNotas, totalAlunos }: Props) {
  const [aba, setAba] = useState<"ranking" | "notas" | "simular">("ranking")

  const ABAS = [
    { id: "ranking" as const, label: isAdmin ? "Ranking Completo" : "Meu Ranking" },
    { id: "notas"   as const, label: "Minhas Notas" },
    { id: "simular" as const, label: "Simular" },
  ]

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: AZ, fontFamily: "var(--serif)", margin: 0 }}>
          Ranking
        </h1>
        <p style={{ fontSize: 12, color: "#9aa3b8", marginTop: 4 }}>
          MGC = (MFIC × 6,5 + NFDC × 2,5 + TCC × 1) / 10 · Decreto 57.694/2024
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "2px solid #edf0f7" }}>
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

      {aba === "ranking" && <AbaMeuRanking ranking={ranking} minhaEntrada={minhaEntrada} isAdmin={isAdmin} totalAlunos={totalAlunos} />}
      {aba === "notas"   && <AbaMinhasNotas disciplinas={disciplinas} minhasNotas={minhasNotas} userId={userId} />}
      {aba === "simular" && <AbaSimular disciplinas={disciplinas} minhasNotas={minhasNotas} />}
    </div>
  )
}
