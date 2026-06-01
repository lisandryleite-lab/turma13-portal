"use client"

// ── Cartaz de acompanhamento da semana (impressão em página única) ────────────
// Gera o pôster em uma janela própria (window.open) e dispara a impressão.
// Isolar numa janela evita conflitos com o layout/sidebar da aplicação, que
// faziam a página de impressão sair em branco.

type QtsDados = { dias: string[]; horarios: string[]; grade: Record<string, string[]> }
type Disciplina = { id: string; sigla: string; nome: string; cargaTotal: number; cargaMinistrada: number; status: string; modulo: string }

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

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export function QtsPrint({
  dados, disciplinas, semana,
}: {
  dados: QtsDados
  disciplinas: Disciplina[]
  semana: number
}) {
  if (!dados?.dias || !dados?.horarios || !dados?.grade) return null

  function imprimir() {
    const discMap = Object.fromEntries(disciplinas.map(d => [d.sigla, d]))

    const presentes = new Set<string>()
    for (const slots of Object.values(dados.grade)) for (const s of slots) if (s) presentes.add(s)
    const legenda = [...presentes].sort()

    const cabecalho = `
      <tr style="background:#0B2D5E;color:#fff">
        <th style="border:1px solid #0B2D5E;padding:6px 4px;width:11%;font-size:10px">Horário</th>
        ${dados.dias.map(d => `<th style="border:1px solid #0B2D5E;padding:6px 4px;font-size:11px">${esc(d)}</th>`).join("")}
      </tr>`

    const linhas = dados.horarios.map((hora, i) => {
      const isInterval = hora.startsWith("10h00") || hora.startsWith("13h40") || hora.startsWith("15h40")
      const celulas = dados.dias.map(dia => {
        const aula = dados.grade[dia]?.[i] || ""
        const c = aula ? corDisc(aula) : null
        const bg = c ? c.bg : "#fff"
        const cor = c ? c.cor : "#ccc"
        return `<td style="border:1px solid #c7d3f0;padding:5px 4px;text-align:center;font-weight:700;font-size:11px;background:${bg};color:${cor}">${esc(aula)}</td>`
      }).join("")
      return `<tr style="${isInterval ? "border-top:2px solid #0B2D5E" : ""}">
        <td style="border:1px solid #c7d3f0;padding:5px 4px;font-family:monospace;font-size:9px;color:#444;text-align:center;white-space:nowrap">${esc(hora)}</td>
        ${celulas}
      </tr>`
    }).join("")

    const legendaHtml = legenda.length
      ? `<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px;justify-content:center">
          ${legenda.map(sigla => {
            const c = corDisc(sigla)
            const nome = discMap[sigla]?.nome || ""
            return `<span style="display:inline-flex;align-items:center;gap:5px;font-size:9.5px;color:#222">
              <span style="background:${c.bg};color:${c.cor};border-radius:4px;padding:1px 6px;font-weight:700;font-size:9.5px">${esc(sigla)}</span>${esc(nome)}
            </span>`
          }).join("")}
        </div>`
      : ""

    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
      <title>QTS Semana ${semana}</title>
      <style>
        @page { size: A4 landscape; margin: 8mm; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 12px; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      </style></head>
      <body>
        <div style="text-align:center;margin-bottom:10px">
          <h1 style="font-weight:700;font-size:22px;color:#0B2D5E;margin:0">Acompanhamento da Semana — QTS ${semana}/52</h1>
          <p style="font-size:11px;color:#444;margin:2px 0 0">Portal CFO PM 2026 · Turma 13 — Quadro de Trabalho Semanal</p>
        </div>
        <table><thead>${cabecalho}</thead><tbody>${linhas}</tbody></table>
        ${legendaHtml}
        <script>window.onload = function(){ window.print(); };</script>
      </body></html>`

    const w = window.open("", "_blank")
    if (!w) { alert("Permita pop-ups para imprimir o cartaz."); return }
    w.document.open()
    w.document.write(html)
    w.document.close()
  }

  return (
    <button onClick={imprimir} style={{
      background: "var(--azul-profundo)", color: "#fff", border: "none",
      borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
    }}>
      🖨️ Imprimir cartaz
    </button>
  )
}
