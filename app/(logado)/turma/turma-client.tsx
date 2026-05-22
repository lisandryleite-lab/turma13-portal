"use client"

import { useState } from "react"

type Aluno = {
  matricula: number; nomeGuerra: string; nomeCompleto: string; email: string
  canga: string | null; cangaPar: number | null
  grupoPlantao: string | null; grupoFaxina: string | null; aniversario: string | null
  alojamento: string | null
}

function Secao({ titulo, children, defaultAberta = false }: { titulo: string; children: React.ReactNode; defaultAberta?: boolean }) {
  const [aberta, setAberta] = useState(defaultAberta)
  return (
    <section style={{ marginBottom: 16 }}>
      <button onClick={() => setAberta(!aberta)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--azul-claro)", border: "none", borderRadius: aberta ? "12px 12px 0 0" : 12,
        padding: "14px 20px", cursor: "pointer", textAlign: "left",
      }}>
        <span style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: 16, color: "var(--azul-profundo)" }}>{titulo}</span>
        <span style={{ fontSize: 18, color: "var(--azul-medio)", transform: aberta ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </button>
      {aberta && (
        <div style={{ border: "1.5px solid var(--azul-claro)", borderTop: "none", borderRadius: "0 0 12px 12px", background: "#fff" }}>
          {children}
        </div>
      )}
    </section>
  )
}

export function TurmaClient({ alunos, nomesPorMat, hierarquia, funcoesFixas, minhaMatricula }: {
  alunos: Aluno[]
  nomesPorMat: Record<number, string>
  hierarquia: { posto: string; nome: string; cargo: string }[]
  funcoesFixas: { funcao: string; membros: string }[]
  minhaMatricula: number
}) {
  const [alunoAberto, setAlunoAberto] = useState<number | null>(null)

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: 24, color: "var(--azul-profundo)", marginBottom: 24 }}>
        Turma 13
      </h1>

      {/* ── Alunos (expansível por aluno) ── */}
      <Secao titulo={`Alunos (${alunos.length})`} defaultAberta>
        <div style={{ padding: "8px 0" }}>
          {alunos.map(a => {
            const eu = a.matricula === minhaMatricula
            const aberto = alunoAberto === a.matricula
            const nomePar = a.cangaPar ? nomesPorMat[a.cangaPar] : null
            return (
              <div key={a.matricula}>
                <button onClick={() => setAlunoAberto(aberto ? null : a.matricula)} style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: eu ? "var(--azul-claro)" : "transparent",
                  border: "none", borderBottom: "1px solid var(--azul-claro)",
                  padding: "10px 20px", cursor: "pointer", textAlign: "left",
                  gap: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontFamily: "var(--sans)", fontSize: 12, fontWeight: 700,
                      color: eu ? "var(--azul-medio)" : "var(--cinza-texto)",
                      width: 36, flexShrink: 0,
                    }}>
                      {a.matricula}
                    </span>
                    <span style={{ fontWeight: eu ? 700 : 500, fontSize: 14, color: "var(--grafite)" }}>
                      {a.nomeGuerra}
                      {eu && <span style={{ marginLeft: 6, fontSize: 11, color: "var(--azul-medio)" }}>(você)</span>}
                    </span>
                  </div>
                  <span style={{ fontSize: 14, color: "var(--cinza-texto)", flexShrink: 0 }}>{aberto ? "▴" : "▾"}</span>
                </button>

                {aberto && (
                  <div style={{
                    background: eu ? "#f0f5ff" : "var(--creme)",
                    borderBottom: "1px solid var(--azul-claro)",
                    padding: "14px 20px 14px 68px",
                    fontSize: 13,
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "8px 20px" }}>
                      <div><span style={{ color: "var(--cinza-texto)" }}>Nome completo: </span><strong>{a.nomeCompleto}</strong></div>
                      <div><span style={{ color: "var(--cinza-texto)" }}>E-mail: </span><strong>{a.email}</strong></div>
                      {nomePar && <div><span style={{ color: "var(--cinza-texto)" }}>Par de canga: </span><strong>{nomePar}</strong></div>}
                      {a.alojamento && <div><span style={{ color: "var(--cinza-texto)" }}>Alojamento: </span><strong>{a.alojamento}</strong></div>}
                      {a.grupoPlantao && <div><span style={{ color: "var(--cinza-texto)" }}>Plantão: </span><strong>{a.grupoPlantao}</strong></div>}
                      {a.grupoFaxina && <div><span style={{ color: "var(--cinza-texto)" }}>Faxina: </span><strong>{a.grupoFaxina}</strong></div>}
                      {a.aniversario && <div><span style={{ color: "var(--cinza-texto)" }}>Aniversário: </span><strong>{a.aniversario}</strong></div>}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Secao>

      {/* ── Cadeia Hierárquica ── */}
      <Secao titulo="Cadeia Hierárquica APMP">
        <div>
          {hierarquia.map((h, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, padding: "10px 20px", fontSize: 13,
              borderBottom: i < hierarquia.length - 1 ? "1px solid var(--azul-claro)" : "none",
            }}>
              <span style={{ color: "var(--cinza-texto)", width: 110, flexShrink: 0, fontSize: 12 }}>{h.posto}</span>
              <span style={{ fontWeight: 600, color: "var(--grafite)", width: 130, flexShrink: 0 }}>{h.nome}</span>
              <span style={{ color: "var(--cinza-texto)" }}>{h.cargo}</span>
            </div>
          ))}
        </div>
      </Secao>

      {/* ── Funções Fixas ── */}
      <Secao titulo="Funções Fixas da Turma">
        <div>
          {funcoesFixas.map((f, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, padding: "10px 20px", fontSize: 13,
              borderBottom: i < funcoesFixas.length - 1 ? "1px solid var(--azul-claro)" : "none",
              flexWrap: "wrap",
            }}>
              <span style={{ color: "var(--cinza-texto)", width: 220, flexShrink: 0, fontSize: 12 }}>{f.funcao}</span>
              <span style={{ fontWeight: 500, color: "var(--grafite)" }}>{f.membros}</span>
            </div>
          ))}
        </div>
      </Secao>
    </div>
  )
}
