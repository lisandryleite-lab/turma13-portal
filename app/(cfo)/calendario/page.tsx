import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { semanaAtual } from "@/lib/utils"
import {
  CALENDARIO_PROVAS,
  CALENDARIO_ATUALIZADO_EM,
  MENSAGEM_SECAO_PROVAS,
  linkMemento,
} from "@/lib/calendario-provas"

export const dynamic = "force-dynamic"

export default async function CalendarioProvasPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const disciplinas = await prisma.disciplina.findMany({ select: { sigla: true, nome: true } })
  const nomeMap = new Map(disciplinas.map(d => [d.sigla, d.nome]))

  const semana = semanaAtual()

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px" }}>
      <Link href="/inicio" style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
        ← Voltar
      </Link>

      <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.9rem", color: "var(--olive)", marginTop: 16, marginBottom: 4 }}>
        Calendário de Provas
      </h1>
      <p style={{ fontSize: 13.5, color: "var(--ink-60)", margin: 0 }}>
        Planejamento de avaliações escritas · CFO 2026 (T13–T18) · atualizado em {CALENDARIO_ATUALIZADO_EM}
      </p>

      {/* Recado da Seção de Provas */}
      <section
        style={{
          marginTop: 22,
          padding: 18,
          borderRadius: 12,
          background: "var(--surface)",
          borderLeft: "4px solid var(--gold)",
        }}
      >
        <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--gold)", margin: "0 0 10px" }}>
          Recado da Seção de Provas
        </h2>
        {MENSAGEM_SECAO_PROVAS.map((p, i) => (
          <p key={i} style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink)", margin: i === 0 ? 0 : "10px 0 0" }}>
            {p}
          </p>
        ))}
      </section>

      <p style={{ fontSize: 13, color: "var(--ink-60)", marginTop: 18, marginBottom: 14 }}>
        Toque em <strong>Memento</strong> ao lado de cada matéria para abrir o material dela direto.
      </p>

      {/* Semanas */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {CALENDARIO_PROVAS.map(s => {
          const atual = s.semana === semana
          return (
            <section
              key={s.semana}
              style={{
                padding: 16,
                borderRadius: 12,
                background: "var(--surface)",
                border: atual ? "2px solid var(--olive)" : "1px solid transparent",
              }}
            >
              <header style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: s.provas.length || s.obs ? 12 : 0 }}>
                <span style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.1rem", fontWeight: 600, color: "var(--olive)" }}>
                  Semana {s.semana}
                </span>
                <span style={{ fontSize: 13.5, color: "var(--ink-60)" }}>
                  {s.inicio} a {s.fim}
                </span>
                {atual && (
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--canvas)", background: "var(--olive)", borderRadius: 999, padding: "2px 8px" }}>
                    Semana atual
                  </span>
                )}
              </header>

              {s.semAvaliacao && (
                <p style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink-60)", margin: 0 }}>
                  Sem avaliação teórica
                </p>
              )}

              {s.provas.map(p => (
                <div
                  key={p.sigla}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    padding: "10px 0",
                    borderTop: "1px solid var(--canvas)",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{p.sigla}</span>
                    {p.avaliacao && (
                      <span style={{ marginLeft: 8, fontSize: 11.5, fontWeight: 700, color: "var(--gold)" }}>{p.avaliacao}</span>
                    )}
                    <span style={{ display: "block", fontSize: 13, color: "var(--ink-60)" }}>
                      {nomeMap.get(p.sigla) || p.sigla}
                      {p.siglaPdf && ` · no calendário oficial: ${p.siglaPdf}`}
                    </span>
                  </div>
                  <Link
                    href={linkMemento(p.sigla)}
                    style={{
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 13px",
                      borderRadius: 999,
                      border: "1px solid var(--olive)",
                      color: "var(--olive)",
                      textDecoration: "none",
                      fontSize: 13.5,
                      fontWeight: 600,
                    }}
                  >
                    Memento →
                  </Link>
                </div>
              ))}

              {s.obs && (
                <p style={{ fontSize: 13, color: "var(--ink-60)", margin: "10px 0 0" }}>
                  <strong>Obs.:</strong> {s.obs}
                </p>
              )}
            </section>
          )
        })}
      </div>

      <p style={{ fontSize: 12.5, color: "var(--ink-60)", marginTop: 18 }}>
        Trata-se de uma previsão da Seção de Provas — sujeita a alteração. Confirmações são divulgadas no grupo.
      </p>

      <footer style={{ marginTop: 40, fontSize: 13, color: "var(--ink-60)", textAlign: "center" }}>
        Desenvolvido por AL CFO PM 108 LISANDRY
      </footer>
    </main>
  )
}
