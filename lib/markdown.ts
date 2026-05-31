// Renderizador Markdown leve (sem dependências) para os Mementos do CFO 2026.
// Suporta: # ## ### títulos, **negrito**, *itálico*, `código`, listas - / 1.,
// tabelas | a | b |, --- (hr), e caixas de destaque via blockquote:
//   > ⚠ ...  -> alerta (vermelho)
//   > 💡 ... ou > 🧠 ... -> mnemônico (roxo/dourado)
//   > 🔑 ... -> palavras-chave
//   > ...    -> citação normal
// Saída: HTML com classes .md-* (estilizadas em globals.css).

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function inline(s: string): string {
  let t = esc(s)
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  t = t.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>")
  return t
}

function tableHTML(rows: string[]): string {
  const cells = (line: string) =>
    line.replace(/^\||\|$/g, "").split("|").map(c => c.trim())
  const header = cells(rows[0])
  const body = rows.slice(2).map(cells)
  const th = header.map(h => `<th>${inline(h)}</th>`).join("")
  const trs = body
    .map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join("")}</tr>`)
    .join("")
  return `<table class="md-table"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`
}

function calloutClass(first: string): string {
  if (/^\s*⚠/.test(first)) return "md-alert"
  if (/^\s*(💡|🧠)/.test(first)) return "md-mnem"
  if (/^\s*🔑/.test(first)) return "md-chave"
  return "md-quote"
}

export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n")
  const out: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // linha em branco
    if (!line.trim()) { i++; continue }

    // hr
    if (/^---+\s*$/.test(line)) { out.push("<hr class='md-hr'/>"); i++; continue }

    // título
    const h = line.match(/^(#{1,4})\s+(.*)$/)
    if (h) { const lvl = Math.min(h[1].length + 1, 4); out.push(`<h${lvl} class="md-h${h[1].length}">${inline(h[2])}</h${lvl}>`); i++; continue }

    // tabela (linha | ... | seguida de separador ---)
    if (/^\|.*\|/.test(line) && i + 1 < lines.length && /^\|?[\s:|-]+\|/.test(lines[i + 1])) {
      const tbl: string[] = []
      while (i < lines.length && /^\|.*\|/.test(lines[i])) { tbl.push(lines[i]); i++ }
      out.push(tableHTML(tbl)); continue
    }

    // blockquote / callout
    if (/^>\s?/.test(line)) {
      const buf: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++ }
      const cls = calloutClass(buf[0])
      out.push(`<div class="md-callout ${cls}">${buf.map(b => inline(b)).join("<br/>")}</div>`)
      continue
    }

    // lista não-ordenada
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, "")); i++ }
      out.push(`<ul class="md-ul">${items.map(it => `<li>${inline(it)}</li>`).join("")}</ul>`)
      continue
    }

    // lista ordenada
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, "")); i++ }
      out.push(`<ol class="md-ol">${items.map(it => `<li>${inline(it)}</li>`).join("")}</ol>`)
      continue
    }

    // parágrafo (junta linhas até branco)
    const para: string[] = []
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|>\s?|\s*[-*]\s|\s*\d+\.\s|\|)/.test(lines[i]) && !/^---+\s*$/.test(lines[i])) {
      para.push(lines[i]); i++
    }
    out.push(`<p class="md-p">${inline(para.join(" "))}</p>`)
  }

  return out.join("\n")
}
