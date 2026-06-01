import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { QtsAdmin } from "./qts-admin"
import { QtsPrint } from "./qts-print"
import { semanaAtual } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function QtsPage() {
  const session = await auth()
  const isAdmin = session?.user?.isAdmin
  const SEMANA_ATUAL = semanaAtual()

  const [qts, disciplinas, qtsList] = await Promise.all([
    prisma.qTS.findUnique({ where: { semana: SEMANA_ATUAL } }),
    prisma.disciplina.findMany({ orderBy: [{ modulo: "asc" }, { sigla: "asc" }] }),
    isAdmin ? prisma.qTS.findMany({ orderBy: { semana: "desc" }, select: { semana: true } }) : Promise.resolve([]),
  ])

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 700, fontSize: 24, color: "var(--azul-profundo)", margin: 0 }}>
            QTS — Semana {SEMANA_ATUAL}/52
          </h1>
          <p style={{ color: "#9aa3b8", fontSize: 13, marginTop: 4 }}>Quadro de Trabalho Semanal</p>
        </div>
        {qts && (
          <QtsPrint dados={qts.dados as QtsDados} disciplinas={disciplinas} semana={SEMANA_ATUAL} />
        )}
      </div>

      {/* Exibição atual */}
      {qts ? (
        <div style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 14, overflow: "auto", marginBottom: 24, boxShadow: "0 1px 4px rgba(11,45,94,0.06)" }}>
          <QtsDisplay dados={qts.dados as QtsDados} disciplinas={disciplinas} />
        </div>
      ) : (
        <div style={{ background: "#f8faff", border: "1.5px dashed #c7d3f0", borderRadius: 14, padding: "40px", textAlign: "center", marginBottom: 24 }}>
          <p style={{ color: "#9aa3b8", fontSize: 14 }}>QTS ainda não cadastrado para esta semana.</p>
          {isAdmin && <p style={{ color: "#c5cde0", fontSize: 12, marginTop: 4 }}>Use o editor abaixo para cadastrar.</p>}
        </div>
      )}

      {/* Admin: editor inteligente */}
      {isAdmin && (
        <QtsAdmin
          semanaAtual={SEMANA_ATUAL}
          dadosExistentes={qts?.dados as QtsDados | undefined}
          disciplinas={disciplinas}
          qtsList={qtsList}
        />
      )}
    </div>
  )
}

// ── Tipos ──────────────────────────────────────────────────────────────────────
type QtsDados = { dias: string[]; horarios: string[]; grade: Record<string, string[]> }
type Disciplina = { id: string; sigla: string; nome: string; cargaTotal: number; cargaMinistrada: number; status: string; modulo: string }

// ── Paleta de cores por disciplina ────────────────────────────────────────────
const CORES = [
  "#dbeafe","#dcfce7","#fef3c7","#fce7f3","#ede9fe","#ffedd5",
  "#cffafe","#d1fae5","#fee2e2","#e0e7ff","#fef9c3","#f0fdf4",
]
const CORES_TEXTO = [
  "#1e40af","#166534","#92400e","#9d174d","#5b21b6","#9a3412",
  "#164e63","#065f46","#991b1b","#3730a3","#713f12","#14532d",
]

function corDisciplina(sigla: string): { bg: string; cor: string } {
  let h = 0
  for (const c of sigla) h = (h * 31 + c.charCodeAt(0)) % CORES.length
  return { bg: CORES[h], cor: CORES_TEXTO[h] }
}

// ── Visualização do QTS ───────────────────────────────────────────────────────
function QtsDisplay({ dados, disciplinas }: { dados: QtsDados; disciplinas: Disciplina[] }) {
  if (!dados?.dias || !dados?.horarios || !dados?.grade) {
    return <p style={{ padding: 16, color: "#9aa3b8", fontSize: 13 }}>Formato inválido.</p>
  }

  const discMap = Object.fromEntries(disciplinas.map(d => [d.sigla, d]))

  // Conta horas por disciplina neste QTS
  const horas: Record<string, number> = {}
  for (const [, slots] of Object.entries(dados.grade)) {
    for (const slot of slots) {
      if (slot) horas[slot] = (horas[slot] || 0) + 1
    }
  }

  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 650 }}>
        <thead>
          <tr style={{ background: "var(--azul-profundo)", color: "#fff" }}>
            <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, width: 110 }}>Horário</th>
            {dados.dias.map(dia => (
              <th key={dia} style={{ padding: "10px 12px", textAlign: "center", fontSize: 11, fontWeight: 700 }}>{dia}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.horarios.map((hora, i) => {
            const isInterval = hora.startsWith("10h00") || hora.startsWith("13h40") || hora.startsWith("15h40")
            return (
              <tr key={hora} style={{ borderTop: isInterval ? "2px solid #dde3ee" : "1px solid #f0f4ff" }}>
                <td style={{ padding: "7px 12px", color: "#9aa3b8", fontFamily: "monospace", fontSize: 11, whiteSpace: "nowrap", background: "#fafbff" }}>{hora}</td>
                {dados.dias.map(dia => {
                  const aula = dados.grade[dia]?.[i] || ""
                  const cores = aula ? corDisciplina(aula) : null
                  const disc = discMap[aula]
                  return (
                    <td key={dia} style={{ padding: "6px 8px", textAlign: "center" }}>
                      {aula ? (
                        <div style={{ background: cores!.bg, color: cores!.cor, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700, cursor: "default" }}
                          title={disc ? `${disc.nome} · ${disc.cargaMinistrada + (horas[aula]||0)}h/${disc.cargaTotal}h` : aula}>
                          {aula}
                        </div>
                      ) : (
                        <span style={{ color: "#e2e8f0", fontSize: 10 }}>—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Legenda com horas */}
      {Object.keys(horas).length > 0 && (
        <div style={{ padding: "12px 16px", borderTop: "1px solid #edf0f7", display: "flex", flexWrap: "wrap", gap: 8 }}>
          {Object.entries(horas).map(([sigla, h]) => {
            const cores = corDisciplina(sigla)
            const disc = discMap[sigla]
            return (
              <span key={sigla} style={{ background: cores.bg, color: cores.cor, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}
                title={disc?.nome}>
                {sigla} · {h}h esta semana
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
