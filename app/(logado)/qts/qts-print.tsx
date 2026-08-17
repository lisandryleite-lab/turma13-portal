"use client"

// ── Cartaz de acompanhamento da semana (impressão em página única) ────────────
// Gera o pôster em uma janela própria (window.open) e dispara a impressão.
// Isolar numa janela evita conflitos com o layout/sidebar da aplicação, que
// faziam a página de impressão sair em branco.

import type { QtsDados } from "@/lib/qts"

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

    // ── Acompanhamento do curso (2ª página, estilo cartaz) ──────────────────────
    const totalH = disciplinas.reduce((a, d) => a + d.cargaTotal, 0)
    const minH = disciplinas.reduce((a, d) => a + Math.min(d.cargaMinistrada, d.cargaTotal), 0)
    const restanteH = Math.max(0, totalH - minH)
    const pctCurso = totalH > 0 ? Math.round((minH / totalH) * 100) : 0
    const concluidas = disciplinas.filter(d => d.status === "Concluída" || d.cargaMinistrada >= d.cargaTotal)
    const emAndamento = disciplinas.filter(d => d.cargaMinistrada > 0 && d.cargaMinistrada < d.cargaTotal)
    const aIniciar = disciplinas.filter(d => d.cargaMinistrada <= 0 && d.status !== "Concluída")
    const semanasRestantes = Math.max(0, 52 - semana)

    const card = (valor: string, label: string, cor: string) =>
      `<div style="flex:1;min-width:120px;background:#fff;border:1px solid #dde3ee;border-radius:12px;padding:14px 12px;text-align:center">
        <div style="font-size:30px;font-weight:800;color:${cor};line-height:1">${valor}</div>
        <div style="font-size:11px;color:#6b7a99;margin-top:5px">${label}</div>
      </div>`

    const chip = (d: Disciplina) =>
      `<span style="display:inline-block;background:#dcfce7;color:#166534;border:1px solid #bbf7d0;border-radius:6px;padding:2px 8px;font-size:10.5px;font-weight:700;margin:2px">${esc(d.sigla)}</span>`

    const barra = (d: Disciplina) => {
      const p = d.cargaTotal > 0 ? Math.round((d.cargaMinistrada / d.cargaTotal) * 100) : 0
      return `<div style="display:flex;align-items:center;gap:8px;margin:3px 0">
        <span style="width:64px;font-size:10px;font-weight:700;color:#1A52A8">${esc(d.sigla)}</span>
        <div style="flex:1;height:8px;background:#edf0f7;border-radius:99px;overflow:hidden">
          <div style="height:100%;width:${p}%;background:#1A52A8;border-radius:99px"></div>
        </div>
        <span style="width:64px;text-align:right;font-size:9.5px;color:#6b7a99">${d.cargaMinistrada}/${d.cargaTotal}h</span>
      </div>`
    }

    const acompanhamento = `
      <div style="page-break-before:always"></div>
      <div style="text-align:center;margin-bottom:12px">
        <h1 style="font-weight:800;font-size:24px;color:#0B2D5E;margin:0">ACOMPANHAMENTO DO CURSO</h1>
        <p style="font-size:11px;color:#444;margin:3px 0 0">CFO PM 2026 · Turma 13 — situação na Semana ${semana}/52</p>
      </div>

      <div style="background:linear-gradient(135deg,#0B2D5E,#1A52A8);border-radius:16px;padding:18px 22px;color:#fff;display:flex;align-items:center;gap:24px;margin-bottom:14px">
        <div style="text-align:center">
          <div style="font-size:54px;font-weight:800;line-height:1">${pctCurso}%</div>
          <div style="font-size:11px;opacity:.85">do curso concluído</div>
        </div>
        <div style="flex:1">
          <div style="height:16px;background:rgba(255,255,255,0.25);border-radius:99px;overflow:hidden">
            <div style="height:100%;width:${pctCurso}%;background:#B8924A;border-radius:99px"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:6px;opacity:.9">
            <span>${minH}h ministradas</span>
            <span>faltam ${restanteH}h · ~${semanasRestantes} semanas</span>
            <span>${totalH}h totais</span>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-bottom:14px">
        ${card(`${concluidas.length}/${disciplinas.length}`, "Disciplinas concluídas", "#15803d")}
        ${card(String(emAndamento.length), "Em andamento", "#1A52A8")}
        ${card(String(aIniciar.length), "A iniciar", "#9aa3b8")}
        ${card(`${restanteH}h`, "Carga restante", "#B8924A")}
      </div>

      <div style="display:flex;gap:16px;align-items:flex-start">
        <div style="flex:1">
          <h2 style="font-size:13px;color:#15803d;margin:0 0 6px;border-bottom:2px solid #dcfce7;padding-bottom:3px">✓ Concluídas (${concluidas.length})</h2>
          <div>${concluidas.map(chip).join("") || '<span style="font-size:11px;color:#9aa3b8">Nenhuma ainda.</span>'}</div>
          ${aIniciar.length ? `<h2 style="font-size:13px;color:#6b7a99;margin:12px 0 6px;border-bottom:2px solid #edf0f7;padding-bottom:3px">A iniciar (${aIniciar.length})</h2>
          <div>${aIniciar.map(d => `<span style="display:inline-block;background:#f1f5f9;color:#64748b;border-radius:6px;padding:2px 8px;font-size:10.5px;font-weight:700;margin:2px">${esc(d.sigla)}</span>`).join("")}</div>` : ""}
        </div>
        <div style="flex:1">
          <h2 style="font-size:13px;color:#1A52A8;margin:0 0 6px;border-bottom:2px solid #e0e7ff;padding-bottom:3px">Em andamento (${emAndamento.length})</h2>
          ${emAndamento.map(barra).join("") || '<span style="font-size:11px;color:#9aa3b8">Nenhuma em andamento.</span>'}
        </div>
      </div>`

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
        ${acompanhamento}
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
