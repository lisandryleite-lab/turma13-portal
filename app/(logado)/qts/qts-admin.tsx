"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { HORARIOS, diasDaSemana, gradeVazia, importarQtsColado, type QtsDados } from "@/lib/qts"

// ── Paleta ────────────────────────────────────────────────────────────────────
const CORES = [
  "#dbeafe","#dcfce7","#fef3c7","#fce7f3","#ede9fe","#ffedd5",
  "#cffafe","#d1fae5","#fee2e2","#e0e7ff","#fef9c3","#f0fdf4",
]
const CORES_TEXTO = [
  "#1e40af","#166534","#92400e","#9d174d","#5b21b6","#9a3412",
  "#164e63","#065f46","#991b1b","#3730a3","#713f12","#14532d",
]

function corDisc(sigla: string) {
  let h = 0
  for (const c of sigla) h = (h * 31 + c.charCodeAt(0)) % CORES.length
  return { bg: CORES[h], cor: CORES_TEXTO[h] }
}

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Disciplina = { id: string; sigla: string; nome: string; cargaTotal: number; cargaMinistrada: number; status: string; modulo: string }

// ── Componente principal ──────────────────────────────────────────────────────
export function QtsAdmin({
  semanaAtual, dadosExistentes, disciplinas, qtsList,
}: {
  semanaAtual: number
  dadosExistentes?: QtsDados
  disciplinas: Disciplina[]
  qtsList: { semana: number }[]
}) {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [semana, setSemana] = useState(semanaAtual)
  // Memoizado: a identidade do array alimenta o useMemo da pré-visualização
  const dias = useMemo(() => diasDaSemana(semana), [semana])

  // Inicializa grade: usa dados existentes (remapeando dias se necessário) ou vazia
  const [grade, setGrade] = useState<Record<string, string[]>>(() => {
    if (dadosExistentes?.grade && semana === semanaAtual) {
      // Re-mapeia pelos dias calculados (caso datas no BD sejam ligeiramente diferentes)
      const g = gradeVazia(dias)
      const diasBD = dadosExistentes.dias || []
      diasBD.forEach((diaBD, idx) => {
        const diaCal = dias[idx]
        if (diaCal && dadosExistentes.grade[diaBD]) {
          g[diaCal] = [...dadosExistentes.grade[diaBD]]
        }
      })
      return g
    }
    return gradeVazia(dias)
  })

  const [disciplinaAtiva, setDisciplinaAtiva] = useState("")
  const [pintando, setPintando] = useState(false)
  const [saving, setSaving] = useState(false)
  const [atualizarDisc, setAtualizarDisc] = useState(true)

  // ── Edição de horas por disciplina (override manual) ─────────────────────
  const [horasOverride, setHorasOverride] = useState<Record<string, number>>({})

  // ── Cálculos ──────────────────────────────────────────────────────────────
  const horasPorDisc = useCallback((): Record<string, number> => {
    const h: Record<string, number> = {}
    for (const slots of Object.values(grade)) {
      for (const slot of slots) {
        if (slot) h[slot] = (h[slot] || 0) + 1
      }
    }
    return h
  }, [grade])

  const discMap = useMemo(
    () => Object.fromEntries(disciplinas.map(d => [d.sigla, d])) as Record<string, Disciplina>,
    [disciplinas],
  )

  // Disciplinas que aparecem na grade atual
  const discNaGrade = Object.keys(horasPorDisc()).sort()

  // ── Importação por colagem da planilha mestre ─────────────────────────────
  const [showImport, setShowImport] = useState(false)
  const [colado, setColado] = useState("")
  const [colunasPorDia, setColunasPorDia] = useState<1 | 2>(2)
  const [coluna, setColuna] = useState<"esquerda" | "direita">("esquerda")

  const previa = useMemo(
    () => (colado.trim() ? importarQtsColado(colado, dias, { colunasPorDia, coluna }) : null),
    [colado, dias, colunasPorDia, coluna],
  )
  const siglasDesconhecidas = previa ? previa.siglas.filter(s => !discMap[s]) : []

  function aplicarImportacao() {
    if (!previa) return
    setGrade(previa.grade)
    setHorasOverride({})
    setColado("")
    setShowImport(false)
  }

  // ── Pintura de células ────────────────────────────────────────────────────
  function pintar(dia: string, i: number) {
    setGrade(prev => {
      const novo = { ...prev, [dia]: [...(prev[dia] || [])] }
      // Se clicou na disciplina ativa e a célula já tem ela → limpa
      if (novo[dia][i] === disciplinaAtiva && disciplinaAtiva) {
        novo[dia][i] = ""
      } else {
        novo[dia][i] = disciplinaAtiva
      }
      return novo
    })
  }

  function limparCelula(dia: string, i: number, e: React.MouseEvent) {
    e.preventDefault()
    setGrade(prev => ({ ...prev, [dia]: prev[dia].map((v, j) => j === i ? "" : v) }))
  }

  function preencherColuna(dia: string) {
    if (!disciplinaAtiva) return
    setGrade(prev => ({ ...prev, [dia]: prev[dia].map(v => v || disciplinaAtiva) }))
  }

  function limparColuna(dia: string) {
    if (!confirm(`Limpar todos os slots de ${dia}?`)) return
    setGrade(prev => ({ ...prev, [dia]: new Array(HORARIOS.length).fill("") }))
  }

  // ── Copiar de outra semana ────────────────────────────────────────────────
  async function copiarSemana(s: number) {
    if (!confirm(`Copiar a grade da semana ${s}? A grade atual será substituída.`)) return
    const res = await fetch(`/api/qts?semana=${s}`)
    const data = await res.json()
    if (!data?.grade) return
    const novaGrade = gradeVazia(dias)
    const diasAnt = diasDaSemana(s)
    diasAnt.forEach((diaAnt, idx) => {
      const diaNovo = dias[idx]
      if (diaNovo && data.grade[diaAnt]) {
        novaGrade[diaNovo] = [...data.grade[diaAnt]]
      }
    })
    setGrade(novaGrade)
  }

  // ── Troca de semana ───────────────────────────────────────────────────────
  function trocarSemana(s: number) {
    setSemana(s)
    const novosDias = diasDaSemana(s)
    if (s === semanaAtual && dadosExistentes?.grade) {
      const g = gradeVazia(novosDias)
      dadosExistentes.dias?.forEach((diaBD, idx) => {
        const diaCal = novosDias[idx]
        if (diaCal && dadosExistentes.grade[diaBD]) g[diaCal] = [...dadosExistentes.grade[diaBD]]
      })
      setGrade(g)
    } else {
      setGrade(gradeVazia(novosDias))
    }
    setHorasOverride({})
  }

  // ── Salvar ────────────────────────────────────────────────────────────────
  async function salvar() {
    setSaving(true)
    const dados: QtsDados = { dias, horarios: HORARIOS, grade }

    // Prepara atualizações de disciplinas
    const horas = horasPorDisc()
    const atualizacoesDisciplinas = atualizarDisc
      ? discNaGrade.map(sigla => {
          const disc = discMap[sigla]
          if (!disc) return null
          const horasEstaSemana = horas[sigla] || 0
          const novaCarga = Math.min(
            disc.cargaTotal,
            (horasOverride[sigla] !== undefined ? horasOverride[sigla] : disc.cargaMinistrada + horasEstaSemana)
          )
          const novoStatus = novaCarga >= disc.cargaTotal ? "Concluída"
            : novaCarga > 0 ? "Em andamento" : disc.status
          return { sigla, cargaMinistrada: novaCarga, status: novoStatus }
        }).filter(Boolean)
      : undefined

    await fetch("/api/qts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ semana, dados, atualizacoesDisciplinas }),
    })
    setSaving(false)
    router.refresh()
  }

  if (!show) {
    return (
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => setShow(true)} style={{
          background: "var(--azul-profundo)", color: "#fff", border: "none",
          borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>
          ✏️ Editor de QTS
        </button>
        {qtsList.length > 0 && (
          <select onChange={e => e.target.value && (setShow(true), trocarSemana(Number(e.target.value)))}
            defaultValue=""
            style={{ border: "1px solid #dde3ee", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--azul-profundo)" }}>
            <option value="">Ver outra semana...</option>
            {qtsList.map(q => <option key={q.semana} value={q.semana}>Semana {q.semana}</option>)}
          </select>
        )}
      </div>
    )
  }

  const horas = horasPorDisc()

  return (
    <div style={{ background: "#f8faff", border: "1.5px solid #c7d3f0", borderRadius: 16, padding: 24 }}>
      {/* Cabeçalho do editor */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--azul-profundo)", margin: 0 }}>Editor de QTS</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <label style={{ fontSize: 12, color: "#6b7a99" }}>Semana:</label>
            <input type="number" min={1} max={52} value={semana}
              onChange={e => trocarSemana(Number(e.target.value))}
              style={{ border: "1px solid #dde3ee", borderRadius: 6, padding: "5px 8px", fontSize: 14, fontWeight: 700, width: 60, textAlign: "center" }} />
          </div>
          <span style={{ fontSize: 12, color: "#9aa3b8" }}>{dias[0].slice(4)} – {dias[dias.length - 1].slice(4)}/2026</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setShowImport(v => !v)} style={{
            background: showImport ? "var(--azul-medio)" : "#fff", color: showImport ? "#fff" : "var(--azul-medio)",
            border: "1.5px solid var(--azul-medio)", borderRadius: 7, padding: "6px 14px",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>
            📋 Colar da planilha
          </button>
          {qtsList.length > 0 && (
            <select onChange={e => e.target.value && copiarSemana(Number(e.target.value))} defaultValue=""
              style={{ border: "1px solid #dde3ee", borderRadius: 7, padding: "6px 10px", fontSize: 12, color: "var(--azul-profundo)" }}>
              <option value="">Copiar de semana...</option>
              {qtsList.map(q => <option key={q.semana} value={q.semana}>Semana {q.semana}</option>)}
            </select>
          )}
          <button onClick={() => setShow(false)} style={{ background: "none", border: "1px solid #dde3ee", borderRadius: 7, padding: "6px 14px", fontSize: 12, cursor: "pointer", color: "#6b7a99" }}>Fechar</button>
        </div>
      </div>

      {/* Importação por colagem da planilha mestre do QTS */}
      {showImport && (
        <div style={{ background: "#fff", border: "1.5px solid var(--azul-medio)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--azul-profundo)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            📋 Importar da planilha
          </p>
          <p style={{ fontSize: 11.5, color: "#6b7a99", margin: "0 0 10px", lineHeight: 1.5 }}>
            Selecione as linhas da planilha mestre (uma por faixa de horário) e cole aqui.
            As siglas da planilha são convertidas para as do banco automaticamente
            (EASPE → EASE, DPPPM → DPPM, INTSIP → INTSISP) e cada faixa é expandida
            nos tempos que ela cobre. Linhas sem horário reconhecível são ignoradas.
          </p>

          <textarea
            value={colado}
            onChange={e => setColado(e.target.value)}
            rows={7}
            spellCheck={false}
            placeholder={"08h00 às 09h40\tPOE\tEASPE\tTFM2\tPOE\t…\n10h00 às 11h40\tEASPE\tPOE\tPOE\tTFM2\t…"}
            style={{
              width: "100%", border: "1px solid #dde3ee", borderRadius: 8, padding: "8px 10px",
              fontSize: 12, fontFamily: "monospace", color: "var(--azul-profundo)",
              resize: "vertical", whiteSpace: "pre", overflowX: "auto",
            }}
          />

          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginTop: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7a99" }}>
              Layout:
              <select value={colunasPorDia} onChange={e => setColunasPorDia(Number(e.target.value) as 1 | 2)}
                style={{ border: "1px solid #dde3ee", borderRadius: 6, padding: "4px 8px", fontSize: 12, color: "var(--azul-profundo)" }}>
                <option value={2}>2 colunas por dia (QTS mestre)</option>
                <option value={1}>1 coluna por dia</option>
              </select>
            </label>
            {colunasPorDia === 2 && (
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7a99" }}>
                Turma:
                <select value={coluna} onChange={e => setColuna(e.target.value as "esquerda" | "direita")}
                  style={{ border: "1px solid #dde3ee", borderRadius: 6, padding: "4px 8px", fontSize: 12, color: "var(--azul-profundo)" }}>
                  <option value="esquerda">Coluna da esquerda (Turma 13)</option>
                  <option value="direita">Coluna da direita</option>
                </select>
              </label>
            )}
          </div>

          {/* Pré-visualização */}
          {previa && (
            <div style={{ marginTop: 12, borderTop: "1px solid #edf0f7", paddingTop: 12 }}>
              {previa.linhas.length === 0 ? (
                <p style={{ fontSize: 12, color: "#b91c1c", margin: 0 }}>
                  Nenhuma faixa de horário reconhecida. Cada linha precisa conter algo como &quot;08h00 às 09h40&quot;.
                </p>
              ) : (
                <>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ borderCollapse: "collapse", fontSize: 11 }}>
                      <thead>
                        <tr>
                          <th style={{ padding: "4px 8px", textAlign: "left", color: "#6b7a99", fontWeight: 700 }}>Faixa</th>
                          {dias.map(d => (
                            <th key={d} style={{ padding: "4px 8px", color: "#6b7a99", fontWeight: 700, minWidth: 62 }}>{d}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previa.linhas.map(l => (
                          <tr key={l.faixa} style={{ borderTop: "1px solid #f0f4ff" }}>
                            <td style={{ padding: "4px 8px", fontFamily: "monospace", color: "#9aa3b8", whiteSpace: "nowrap" }}>
                              {l.faixa} <span style={{ color: "#c5cde0" }}>({l.slots.length}h)</span>
                            </td>
                            {l.valores.map((v, i) => (
                              <td key={dias[i]} style={{ padding: "3px 6px", textAlign: "center" }}>
                                {v ? (
                                  <span style={{ ...corDisc(v), borderRadius: 5, padding: "2px 7px", fontWeight: 700, fontSize: 10.5 }}>{v}</span>
                                ) : (
                                  <span style={{ color: "#e2e8f0" }}>—</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {siglasDesconhecidas.length > 0 && (
                    <p style={{ fontSize: 11.5, color: "#b45309", background: "#fef3c7", borderRadius: 7, padding: "6px 10px", margin: "10px 0 0" }}>
                      ⚠ Sem disciplina cadastrada: <strong>{siglasDesconhecidas.join(", ")}</strong>. A grade aceita
                      mesmo assim, mas o progresso dessas siglas não será atualizado ao salvar.
                    </p>
                  )}
                  <p style={{ fontSize: 11, color: "#9aa3b8", margin: "8px 0 0" }}>
                    Aulas riscadas na planilha chegam como texto normal — apague as células canceladas na grade depois de aplicar.
                  </p>

                  <button onClick={aplicarImportacao} style={{
                    marginTop: 10, background: "var(--azul-medio)", color: "#fff", border: "none",
                    borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  }}>
                    Aplicar à grade ({previa.linhas.length} faixas · {previa.siglas.length} disciplinas)
                  </button>
                  <span style={{ fontSize: 11, color: "#9aa3b8", marginLeft: 10 }}>substitui a grade atual</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Seletor de disciplina ativa */}
      <div style={{ marginBottom: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#6b7a99", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>Disciplina ativa:</p>
        <select value={disciplinaAtiva} onChange={e => setDisciplinaAtiva(e.target.value)}
          style={{ border: "1.5px solid var(--azul-medio)", borderRadius: 7, padding: "7px 12px", fontSize: 13, fontWeight: 600, color: "var(--azul-profundo)", minWidth: 220 }}>
          <option value="">— Apagar célula —</option>
          {disciplinas.map(d => (
            <option key={d.sigla} value={d.sigla}>{d.sigla} · {d.nome.slice(0, 36)}{d.nome.length > 36 ? "…" : ""}</option>
          ))}
        </select>
        {disciplinaAtiva && (
          <span style={{ ...corDisc(disciplinaAtiva), borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
            {disciplinaAtiva}
          </span>
        )}
        <p style={{ fontSize: 11, color: "#9aa3b8", margin: 0 }}>
          Clique nas células para preencher · Clique direito para apagar
        </p>
      </div>

      {/* Grade de edição */}
      <div style={{ overflowX: "auto", marginBottom: 20 }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12, minWidth: 700 }}>
          <thead>
            <tr>
              <th style={{ padding: "8px 10px", background: "var(--azul-profundo)", color: "#fff", fontWeight: 700, fontSize: 11, width: 110, textAlign: "left" }}>Horário</th>
              {dias.map(dia => (
                <th key={dia} style={{ padding: "8px 10px", background: "var(--azul-profundo)", color: "#fff", fontWeight: 700, fontSize: 11, textAlign: "center", minWidth: 110 }}>
                  <div>{dia}</div>
                  <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 4 }}>
                    <button onClick={() => preencherColuna(dia)} title="Preencher coluna" style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 3, padding: "1px 6px", fontSize: 10, color: "#fff", cursor: "pointer" }}>↓</button>
                    <button onClick={() => limparColuna(dia)} title="Limpar coluna" style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 3, padding: "1px 6px", fontSize: 10, color: "#fff", cursor: "pointer" }}>✕</button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORARIOS.map((hora, i) => {
              const isInterval = hora.startsWith("10h00") || hora.startsWith("13h40") || hora.startsWith("15h40")
              return (
                <tr key={hora} style={{ borderTop: isInterval ? "2px solid #c7d3f0" : "1px solid #e8ecf5" }}>
                  <td style={{ padding: "6px 10px", background: "#f0f4ff", color: "#6b7a99", fontFamily: "monospace", fontSize: 11, whiteSpace: "nowrap" }}>{hora}</td>
                  {dias.map(dia => {
                    const aula = grade[dia]?.[i] || ""
                    const cores = aula ? corDisc(aula) : null
                    const isAtiva = aula === disciplinaAtiva && disciplinaAtiva
                    return (
                      <td key={dia} style={{ padding: 3 }}>
                        <div
                          onClick={() => pintar(dia, i)}
                          onContextMenu={e => limparCelula(dia, i, e)}
                          onMouseEnter={() => pintando && disciplinaAtiva && setGrade(prev => ({ ...prev, [dia]: prev[dia].map((v, j) => j === i ? disciplinaAtiva : v) }))}
                          onMouseDown={() => setPintando(true)}
                          onMouseUp={() => setPintando(false)}
                          style={{
                            minHeight: 32, borderRadius: 6, padding: "4px 6px",
                            background: aula ? cores!.bg : "#fff",
                            border: isAtiva ? `2px solid ${cores!.cor}` : "1.5px solid #e8ecf5",
                            cursor: "pointer", textAlign: "center",
                            fontWeight: 700, fontSize: 11, color: aula ? cores!.cor : "#c5cde0",
                            transition: "all 0.1s",
                            userSelect: "none",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                          title={aula ? discMap[aula]?.nome || aula : "Clique para preencher"}
                        >
                          {aula || "—"}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Painel de atualização de progresso */}
      {discNaGrade.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--azul-profundo)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              📊 Atualização de progresso
            </p>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={atualizarDisc} onChange={e => setAtualizarDisc(e.target.checked)} />
              Atualizar ao salvar
            </label>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {discNaGrade.map(sigla => {
              const disc = discMap[sigla]
              if (!disc) return null
              const horasEsta = horas[sigla] || 0
              const novaAuto = Math.min(disc.cargaTotal, disc.cargaMinistrada + horasEsta)
              const novaFinal = horasOverride[sigla] !== undefined ? horasOverride[sigla] : novaAuto
              const pct = Math.round((novaFinal / disc.cargaTotal) * 100)
              const cores = corDisc(sigla)
              return (
                <div key={sigla} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ ...cores, borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700, width: 52, textAlign: "center", flexShrink: 0 }}>{sigla}</span>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: "#6b7a99" }}>{disc.nome.slice(0, 32)}{disc.nome.length > 32 ? "…" : ""}</span>
                      <span style={{ fontSize: 11, color: "#9aa3b8" }}>+{horasEsta}h esta semana</span>
                    </div>
                    <div style={{ height: 6, background: "#edf0f7", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(100, Math.round((disc.cargaMinistrada / disc.cargaTotal) * 100))}%`, background: "#c7d3f0", borderRadius: 99 }} />
                      <div style={{ height: "100%", marginTop: -6, width: `${Math.min(100, pct)}%`, background: cores.cor, borderRadius: 99, opacity: 0.7 }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: "#9aa3b8" }}>{disc.cargaMinistrada}h →</span>
                    <input type="number" min={0} max={disc.cargaTotal} value={novaFinal}
                      onChange={e => setHorasOverride(prev => ({ ...prev, [sigla]: Number(e.target.value) }))}
                      style={{ border: "1px solid #dde3ee", borderRadius: 5, padding: "3px 6px", fontSize: 12, fontWeight: 700, width: 50, textAlign: "center", color: cores.cor }} />
                    <span style={{ fontSize: 11, color: "#9aa3b8" }}>/{disc.cargaTotal}h</span>
                    <span style={{ fontSize: 10, background: pct >= 100 ? "#dcfce7" : "#edf0f7", color: pct >= 100 ? "#15803d" : "#6b7a99", borderRadius: 99, padding: "1px 6px" }}>{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: 11, color: "#9aa3b8", marginTop: 10, margin: "10px 0 0" }}>
            Ajuste as horas finais se necessário · Os valores são editáveis antes de salvar
          </p>
        </div>
      )}

      {/* Botão salvar */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={salvar} disabled={saving} style={{
          background: saving ? "#9aa3b8" : "var(--azul-profundo)", color: "#fff",
          border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14,
          fontWeight: 700, cursor: saving ? "default" : "pointer",
        }}>
          {saving ? "Salvando..." : `💾 Salvar QTS Semana ${semana}${atualizarDisc && discNaGrade.length > 0 ? " + Atualizar Disciplinas" : ""}`}
        </button>
        <button onClick={() => setGrade(gradeVazia(dias))}
          style={{ background: "none", border: "1px solid #fee2e2", borderRadius: 7, padding: "9px 14px", fontSize: 12, cursor: "pointer", color: "#b91c1c" }}>
          Limpar tudo
        </button>
      </div>
    </div>
  )
}
