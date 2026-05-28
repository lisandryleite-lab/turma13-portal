"use client"

import { useEffect } from "react"
import Link from "next/link"

type DiaCal = {
  data: string
  diaSemana: string
  tipo: "util" | "fds"
  grupoFaxina: string | null
  grupoPlantao: string
}

interface Props {
  semana: number
  mes: number
  ano: number
  nomeMes: string
  semanasServico: { semana: number; p1: string; p3: string; p4: string }[]
  diasCalendario: DiaCal[]
  composicao: Record<string, { mat: number; nome: string }[]>
}

const CORES_GRUPO: Record<string, string> = {
  G1: "#1D4ED8", G2: "#7C3AED", G3: "#B45309", G4: "#15803D",
  G5: "#B91C1C", G6: "#0369A1", G7: "#7E22CE", G8: "#92400E",
}

const GRUPOS_FAXINA = ["G1","G2","G3","G4","G5","G6","G7","G8"]

export function PrintClient({ semana, mes, ano, nomeMes, semanasServico, diasCalendario, composicao }: Props) {
  useEffect(() => {
    // Pequeno delay para garantir que a página renderizou
    const t = setTimeout(() => window.print(), 600)
    return () => clearTimeout(t)
  }, [])

  // Monta grade do calendário
  const primeiroDia = new Date(ano, mes - 1, 1).getDay()
  const cells: (DiaCal | null)[] = [...Array(primeiroDia).fill(null), ...diasCalendario]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <>
      {/* Estilos de impressão */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .sidebar, nav, footer, header { display: none !important; }
          body { margin: 0; }
          .print-page { padding: 12mm 14mm !important; }
        }
        @page { size: A4; margin: 10mm; }
        body { font-family: Arial, sans-serif; }
      `}</style>

      {/* Botão voltar — some ao imprimir */}
      <div className="no-print" style={{
        position: "fixed", top: 12, right: 12, display: "flex", gap: 8, zIndex: 999,
      }}>
        <button onClick={() => window.print()} style={{
          background: "#0B2D5E", color: "#fff", border: "none", borderRadius: 8,
          padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>
          🖨️ Imprimir
        </button>
        <Link href="/escalas" style={{
          background: "#f0f4ff", color: "#0B2D5E", border: "1px solid #dde3ee",
          borderRadius: 8, padding: "8px 14px", fontSize: 13, textDecoration: "none",
        }}>
          ← Voltar
        </Link>
      </div>

      {/* Conteúdo imprimível */}
      <div className="print-page" style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px", color: "#0B2D5E" }}>

        {/* Cabeçalho */}
        <div style={{ textAlign: "center", marginBottom: 24, borderBottom: "2px solid #0B2D5E", paddingBottom: 12 }}>
          <p style={{ fontSize: 10, margin: 0, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#666" }}>
            Academia de Polícia Militar do Paudalho — CFO PM 2026
          </p>
          <h1 style={{ fontSize: 16, fontWeight: 800, margin: "6px 0 2px", color: "#0B2D5E" }}>
            Escala da Turma 13 — {nomeMes} {ano}
          </h1>
          <p style={{ fontSize: 11, margin: 0, color: "#888" }}>Semana {semana}/52</p>
        </div>

        {/* ── ESCALA DE SERVIÇO ── */}
        <h2 style={{ fontSize: 13, fontWeight: 800, color: "#0B2D5E", textTransform: "uppercase",
          letterSpacing: "0.08em", margin: "0 0 8px", paddingBottom: 4, borderBottom: "1px solid #ddd" }}>
          Escala de Serviço — P1 / P3 / P4
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginBottom: 20 }}>
          <thead>
            <tr style={{ background: "#0B2D5E", color: "#fff" }}>
              <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: 700 }}>Semana</th>
              <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: 700 }}>P1 — Pessoal</th>
              <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: 700 }}>P3 — Operações</th>
              <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: 700 }}>P4 — Logística</th>
            </tr>
          </thead>
          <tbody>
            {semanasServico.map((s, i) => (
              <tr key={s.semana} style={{
                background: s.semana === semana ? "#EFF6FF" : i % 2 === 0 ? "#fff" : "#f8faff",
                borderTop: "1px solid #e8ecf5",
                fontWeight: s.semana === semana ? 700 : 400,
              }}>
                <td style={{ padding: "6px 10px", color: s.semana === semana ? "#1e40af" : "#0B2D5E" }}>
                  {s.semana}{s.semana === semana ? " ◀ atual" : ""}
                </td>
                <td style={{ padding: "6px 10px" }}>{s.p1}</td>
                <td style={{ padding: "6px 10px" }}>{s.p3}</td>
                <td style={{ padding: "6px 10px" }}>{s.p4}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── CALENDÁRIO DE FAXINA ── */}
        <h2 style={{ fontSize: 13, fontWeight: 800, color: "#0B2D5E", textTransform: "uppercase",
          letterSpacing: "0.08em", margin: "0 0 8px", paddingBottom: 4, borderBottom: "1px solid #ddd" }}>
          Escala de Faxina — {nomeMes} {ano}
        </h2>

        {/* Grade do calendário */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginBottom: 16 }}>
          <thead>
            <tr>
              {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d => (
                <th key={d} style={{ padding: "5px 4px", textAlign: "center", fontWeight: 700,
                  color: d === "Dom" || d === "Sáb" ? "#999" : "#0B2D5E", fontSize: 11 }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.ceil(cells.length / 7) }, (_, semIdx) => (
              <tr key={semIdx}>
                {cells.slice(semIdx * 7, semIdx * 7 + 7).map((dia, j) => {
                  if (!dia) return <td key={j} style={{ padding: 3, height: 36 }} />
                  const d = new Date(dia.data)
                  const cor = dia.grupoFaxina ? CORES_GRUPO[dia.grupoFaxina] || "#475569" : null
                  const fds = dia.tipo === "fds"
                  return (
                    <td key={j} style={{
                      padding: 3, height: 40, textAlign: "center",
                      border: "1px solid #e8ecf5",
                      background: fds ? "#f8faff" : dia.grupoFaxina ? (cor! + "15") : "#fff",
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: fds ? "#aaa" : "#0B2D5E" }}>
                        {d.getDate()}
                      </div>
                      {!fds && dia.grupoFaxina && (
                        <div style={{
                          fontSize: 10, fontWeight: 800, color: cor!,
                          background: cor! + "25", borderRadius: 3, padding: "1px 4px", display: "inline-block",
                        }}>
                          {dia.grupoFaxina}
                        </div>
                      )}
                      {fds && (
                        <div style={{ fontSize: 9, color: "#bbb" }}>{dia.grupoPlantao}</div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── COMPOSIÇÃO DOS GRUPOS ── */}
        <h2 style={{ fontSize: 13, fontWeight: 800, color: "#0B2D5E", textTransform: "uppercase",
          letterSpacing: "0.08em", margin: "0 0 8px", paddingBottom: 4, borderBottom: "1px solid #ddd" }}>
          Composição dos Grupos de Faxina
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
          {GRUPOS_FAXINA.map(g => {
            const membros = composicao[g] || []
            const cor = CORES_GRUPO[g] || "#475569"
            return (
              <div key={g} style={{ border: `1.5px solid ${cor}40`, borderRadius: 6, padding: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 12, color: cor, marginBottom: 5 }}>{g}</div>
                {membros.map(m => (
                  <div key={m.mat} style={{ fontSize: 10, color: "#333", padding: "1px 0" }}>
                    {m.mat} {m.nome}
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* Rodapé */}
        <div style={{ borderTop: "1px solid #ddd", paddingTop: 8, textAlign: "center" }}>
          <p style={{ fontSize: 9, color: "#aaa", margin: 0 }}>
            Portal Turma 13 · CFO PM 2026 · Gerado em {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>
    </>
  )
}
