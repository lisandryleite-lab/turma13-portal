// Converte o `MD` curado de um import-*.ts em HTML padrao ACE (2 colunas A4) p/ render -> PDF.
// Uso: node build.mjs <SIGLA> <src.ts> <out.html> "<Titulo da capa>" "<Subtitulo>"
import { readFileSync, writeFileSync } from "node:fs"

const [sigla, src, out, titulo, subtitulo] = process.argv.slice(2)
if (!sigla || !src || !out || !titulo) {
  console.error("Uso: node build.mjs <SIGLA> <src.ts> <out.html> <Titulo> [Subtitulo]")
  process.exit(1)
}

const file = readFileSync(src, "utf8")
const m = file.match(/const MD = `([\s\S]*?)`\s*\n/)
if (!m) { console.error("MD nao encontrado em " + src); process.exit(1) }
const md = m[1]

const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
function inline(s) {
  let t = esc(s)
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  t = t.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>")
  t = t.replace(/🔑/g, "<b>CHAVE ▸</b>")
  return t
}

const cells = r => r.split("|").slice(1, -1).map(c => c.trim())
function tableHtml(rows) {
  const header = cells(rows[0])
  const body = rows.slice(2).map(cells)
  let h = "<table><tr>" + header.map(c => `<th>${inline(c)}</th>`).join("") + "</tr>"
  for (const r of body) h += "<tr>" + r.map(c => `<td>${inline(c)}</td>`).join("") + "</tr>"
  return h + "</table>"
}

function mdToHtml(md) {
  const lines = md.split("\n")
  let html = "", i = 0, inList = false, firstMod = true
  const closeList = () => { if (inList) { html += "</ul>"; inList = false } }
  while (i < lines.length) {
    const line = lines[i]
    if (/^>\s?/.test(line)) {
      closeList()
      const buf = []
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++ }
      const text = buf.join(" ").trim()
      const isKey = /^🔑/.test(text)
      const cls = isKey ? "mn" : "warn"
      html += `<div class="${cls}">${inline(text)}</div>`
      continue
    }
    if (/^#{1,6}\s/.test(line)) {
      closeList()
      const mm = line.match(/^(#+)\s+(.*)/)
      const level = mm[1].length
      if (level === 1) {
        html += (firstMod ? "" : "") + `<h2>${inline(mm[2]).toUpperCase()}</h2>`
        firstMod = false
      } else html += `<h3>${inline(mm[2])}</h3>`
      i++; continue
    }
    if (/^\|/.test(line)) {
      closeList()
      const rows = []
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++ }
      html += tableHtml(rows)
      continue
    }
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      if (!inList) { html += "<ul>"; inList = true }
      html += `<li>${inline(line.replace(/^\s*([-*]|\d+\.)\s+/, ""))}</li>`
      i++; continue
    }
    if (/^---+$/.test(line.trim())) { closeList(); i++; continue }
    if (line.trim() === "") { closeList(); i++; continue }
    closeList()
    html += `<p>${inline(line)}</p>`
    i++
  }
  closeList()
  return html
}

const body = mdToHtml(md)
const sub = subtitulo || "CFO PM 2026 · Revisão por módulos"
const tpl = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><title>Memento Resumido — ${sigla}</title>
<style>
  @page { size: A4; margin: 12mm 10mm 14mm 10mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: "Segoe UI","Helvetica Neue",Arial,sans-serif; font-size: 10.1px; line-height: 1.4; color: #1c1c1c; column-count: 2; column-gap: 16px; column-fill: auto; padding: 0 2px; }
  h1.capa { column-span: all; margin: 0 0 8px; padding: 10px 14px; background: #1A2A44; color: #fff; border-radius: 6px; font-size: 15px; letter-spacing: .3px; }
  h1.capa small { display: block; font-size: 9.3px; font-weight: 400; opacity: .85; margin-top: 3px; }
  h2 { background: #1A2A44; color: #fff; margin: 9px 0 5px; padding: 3px 7px; border-radius: 3px; font-size: 10.4px; break-after: avoid; -webkit-column-break-after: avoid; }
  h3 { color: #2C3E6B; font-size: 10.1px; margin: 7px 0 2px; border-bottom: 1.4px solid #2C3E6B; padding-bottom: 1px; break-after: avoid; -webkit-column-break-after: avoid; }
  p { margin: 3px 0; }
  ul { margin: 3px 0; padding-left: 14px; }
  li { margin: 1.5px 0; break-inside: avoid; }
  strong { color: #14213d; }
  em { color: #444; }
  mark { background: #fff2a8; padding: 0 2px; border-radius: 2px; }
  .warn { background: #fbeae7; border-left: 3px solid #B23020; color: #7d1f15; padding: 4px 7px; margin: 5px 0; border-radius: 3px; break-inside: avoid; }
  .warn strong { color: #B23020; }
  .mn { background: #eef4fb; border-left: 3px solid #2C6BB3; padding: 4px 7px; margin: 5px 0; border-radius: 3px; break-inside: avoid; }
  .mn b { color: #2C6BB3; }
  table { width: 100%; border-collapse: collapse; margin: 4px 0; font-size: 9.2px; break-inside: avoid; }
  th { background: #2C3E6B; color: #fff; padding: 2.5px 4px; text-align: left; }
  td { border: 0.6px solid #c9d2e0; padding: 2.5px 4px; vertical-align: top; }
  tr:nth-child(even) td { background: #f3f6fb; }
  footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 7.6px; color: #5a6678; text-align: center; border-top: 0.6px solid #c9d2e0; padding-top: 2px; }
  footer .ass { color: #1A2A44; font-weight: 600; }
</style></head><body>
<h1 class="capa">MEMENTO RESUMIDO — ${esc(titulo)}<small>${esc(sub)}</small></h1>
${body}
<footer>MEMENTO RESUMIDO — ${sigla} • CFO PM 2026 • Revisão por módulos &nbsp;·&nbsp; <span class="ass">AL CFO PM 108 LISANDRY</span></footer>
</body></html>`

writeFileSync(out, tpl, "utf8")
console.log(`OK ${sigla}: ${tpl.length} chars -> ${out}`)
