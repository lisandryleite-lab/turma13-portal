"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { calcularPrevisao } from "@/lib/previsao"

type Nota = { id: string; materia: string; modulo: string; valor: number }

export function RankingClient({
  notasIniciais,
  nomeGuerra,
  historico,
  turmaSize,
}: {
  notasIniciais: Nota[]
  nomeGuerra: string
  historico: number[]
  turmaSize: number
}) {
  const router = useRouter()
  const [notas, setNotas] = useState<Nota[]>(notasIniciais)
  const [aba, setAba] = useState<"lancar" | "previsao">("lancar")
  const [materia, setMateria] = useState("")
  const [modulo, setModulo] = useState("")
  const [valor, setValor] = useState("")
  const [erro, setErro] = useState("")
  const [salvando, setSalvando] = useState(false)

  const media =
    notas.length > 0
      ? (notas.reduce((s, n) => s + n.valor, 0) / notas.length).toFixed(3)
      : "—"

  const previsao = calcularPrevisao(notas.map(n => n.valor), historico, turmaSize)

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    const v = Number(valor.replace(",", "."))
    if (!materia.trim()) return setErro("Informe a matéria.")
    if (isNaN(v) || v < 0 || v > 10) return setErro("Nota deve ser entre 0 e 10.")

    setSalvando(true)
    const res = await fetch("/api/notas-cfo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materia: materia.trim(), modulo: modulo.trim() || null, valor: v }),
    })
    setSalvando(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      return setErro(j.error || "Erro ao salvar.")
    }
    const nova: Nota = await res.json()
    setNotas(prev => {
      const i = prev.findIndex(n => n.materia === nova.materia && n.modulo === nova.modulo)
      if (i >= 0) {
        const copia = [...prev]
        copia[i] = nova
        return copia
      }
      return [...prev, nova].sort((a, b) => a.materia.localeCompare(b.materia))
    })
    setMateria("")
    setModulo("")
    setValor("")
    router.refresh()
  }

  async function excluir(id: string) {
    if (!confirm("Excluir esta nota?")) return
    const res = await fetch(`/api/notas-cfo?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      setNotas(prev => prev.filter(n => n.id !== id))
      router.refresh()
    }
  }

  function editar(n: Nota) {
    setMateria(n.materia)
    setModulo(n.modulo || "")
    setValor(String(n.valor))
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(58,74,58,0.3)",
    background: "#fff",
    color: "var(--ink)",
    fontSize: 15,
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
      <Link href="/inicio" style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
        ← Voltar
      </Link>

      <h1
        style={{
          fontFamily: "var(--serif-cfo)",
          fontWeight: 600,
          fontSize: "1.9rem",
          color: "var(--olive)",
          marginTop: 16,
          marginBottom: 4,
        }}
      >
        Ranking & Previsão
      </h1>
      <p style={{ color: "var(--ink-60)", margin: 0 }}>Olá, {nomeGuerra}</p>

      {/* Abas */}
      <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
        {(["lancar", "previsao"] as const).map(t => (
          <button
            key={t}
            onClick={() => setAba(t)}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              background: aba === t ? "var(--olive)" : "var(--surface)",
              color: aba === t ? "var(--canvas)" : "var(--ink-60)",
            }}
          >
            {t === "lancar" ? "Lançar notas" : "Previsão"}
          </button>
        ))}
        <span style={{ padding: "8px 14px", borderRadius: 999, background: "var(--surface)", color: "var(--ink-60)", fontSize: 14 }}>
          Simular · em breve
        </span>
      </div>

      {/* Aviso fixo — simulação não-oficial (ícone + texto, nunca só cor) */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          marginTop: 20,
          padding: "12px 14px",
          borderRadius: 10,
          background: "#fbf3e3",
          border: "1px solid var(--gold)",
        }}
      >
        <span aria-hidden style={{ fontSize: 18, lineHeight: 1.3 }}>⚠️</span>
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink)" }}>
          <strong>Simulação não-oficial.</strong> As notas são informadas pelo próprio aluno e servem
          apenas para estimar sua posição. Só você vê as suas notas.
        </p>
      </div>

      {aba === "lancar" && (
      <>
      {/* Formulário de lançamento */}
      <form
        onSubmit={salvar}
        style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 12,
          background: "var(--surface)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 110px",
          gap: 12,
          alignItems: "end",
        }}
      >
        <label style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>
          Matéria
          <input style={{ ...inputStyle, marginTop: 4 }} value={materia} onChange={e => setMateria(e.target.value)} placeholder="Ex.: Direito Penal" />
        </label>
        <label style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>
          Módulo <span style={{ fontWeight: 400, color: "var(--ink-60)" }}>(opcional)</span>
          <input style={{ ...inputStyle, marginTop: 4 }} value={modulo} onChange={e => setModulo(e.target.value)} placeholder="Ex.: P1" />
        </label>
        <label style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>
          Nota
          <input style={{ ...inputStyle, marginTop: 4 }} value={valor} onChange={e => setValor(e.target.value)} placeholder="0–10" inputMode="decimal" />
        </label>
        <button
          type="submit"
          disabled={salvando}
          style={{
            gridColumn: "1 / -1",
            padding: "11px 16px",
            borderRadius: 8,
            border: "none",
            background: "var(--olive)",
            color: "var(--canvas)",
            fontSize: 15,
            fontWeight: 600,
            cursor: salvando ? "default" : "pointer",
          }}
        >
          {salvando ? "Salvando…" : "Salvar nota"}
        </button>
        {erro && (
          <p style={{ gridColumn: "1 / -1", margin: 0, color: "var(--red)", fontSize: 13.5 }}>✗ {erro}</p>
        )}
      </form>

      {/* Lista de notas próprias */}
      <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--olive)", margin: 0 }}>
          Minhas notas
        </h2>
        <span style={{ fontSize: 14, color: "var(--ink)" }}>
          Média autodeclarada: <strong>{media}</strong>
        </span>
      </div>

      {notas.length === 0 ? (
        <p style={{ color: "var(--ink-60)", marginTop: 12 }}>Nenhuma nota lançada ainda.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {notas.map(n => (
            <li
              key={n.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 10,
                background: "#fff",
                border: "1px solid rgba(58,74,58,0.15)",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: "var(--ink)" }}>{n.materia}</div>
                {n.modulo && <div style={{ fontSize: 13, color: "var(--ink-60)" }}>{n.modulo}</div>}
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: "var(--olive)", fontVariantNumeric: "tabular-nums" }}>
                {n.valor.toFixed(2)}
              </span>
              <button onClick={() => editar(n)} style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                Editar
              </button>
              <button onClick={() => excluir(n.id)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}
      </>
      )}

      {aba === "previsao" && (
        <div style={{ marginTop: 20 }}>
          {!previsao ? (
            <p style={{ color: "var(--ink-60)" }}>
              Lance suas notas na aba “Lançar notas” para ver sua previsão de posição.
            </p>
          ) : (
            <>
              {/* Faixa estimada — destaque */}
              <div
                style={{
                  padding: "20px 18px",
                  borderRadius: 14,
                  background: "var(--olive)",
                  color: "var(--canvas)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 13, opacity: 0.85 }}>Faixa provável de posição</div>
                <div style={{ fontFamily: "var(--serif-cfo)", fontSize: "2rem", fontWeight: 600, marginTop: 4 }}>
                  {previsao.posicaoMin}º – {previsao.posicaoMax}º
                </div>
                <div style={{ fontSize: 14, opacity: 0.85 }}>de {previsao.turmaSize} alunos da T3</div>
              </div>

              {/* Números de apoio */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14 }}>
                {[
                  { label: "Sua média", valor: previsao.media.toFixed(3) },
                  { label: "Mediana histórica", valor: previsao.medianaHistorica.toFixed(3) },
                  { label: "Percentil estimado", valor: Math.round(previsao.percentil) + "º" },
                ].map(b => (
                  <div key={b.label} style={{ padding: "12px 10px", borderRadius: 10, background: "var(--surface)", textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "var(--ink-60)" }}>{b.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--olive)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                      {b.valor}
                    </div>
                  </div>
                ))}
              </div>

              {!previsao.confiavel && (
                <p style={{ display: "flex", gap: 8, marginTop: 14, padding: "10px 12px", borderRadius: 10, background: "#fbf3e3", border: "1px solid var(--gold)", fontSize: 13.5, color: "var(--ink)" }}>
                  <span aria-hidden>ℹ️</span>
                  Você lançou poucas notas ({previsao.qtdNotas}). A faixa fica mais precisa conforme você adiciona mais matérias.
                </p>
              )}

              <p style={{ marginTop: 16, fontSize: 13, color: "var(--ink-60)", lineHeight: 1.5 }}>
                Estimativa baseada na distribuição das notas finais das turmas anteriores
                (T1 + T2, {historico.length} alunos). É uma <strong>aproximação</strong> a partir do
                histórico — não é previsão exata nem reflete a sua nota oficial.
              </p>
            </>
          )}
        </div>
      )}

      <footer style={{ marginTop: 40, fontSize: 13, color: "var(--ink-60)", textAlign: "center" }}>
        Desenvolvido por AL CFO PM 108 LISANDRY
      </footer>
    </main>
  )
}
