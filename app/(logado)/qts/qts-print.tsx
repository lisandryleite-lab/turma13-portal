"use client"

// ── Cartaz de acompanhamento da semana (impressão em página única) ────────────
// Gera o pôster em uma janela própria (window.open) e dispara a impressão.
// Isolar numa janela evita conflitos com o layout/sidebar da aplicação, que
// faziam a página de impressão sair em branco.
//
// A marcação do cartaz vive em `lib/qts-cartaz.ts`, compartilhada com o script
// `scripts/qts-cartaz-pdf.ts` — assim o PDF gerado no terminal sai idêntico ao
// que este botão imprime.

import type { QtsDados } from "@/lib/qts"
import { cartazHtml, type DisciplinaCartaz } from "@/lib/qts-cartaz"

export function QtsPrint({
  dados, disciplinas, semana,
}: {
  dados: QtsDados
  disciplinas: DisciplinaCartaz[]
  semana: number
}) {
  if (!dados?.dias || !dados?.horarios || !dados?.grade) return null

  function imprimir() {
    const html = cartazHtml({ dados, disciplinas, semana, autoPrint: true })

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
