/**
 * Gera o cartaz (HTML para impressão em A4) com a escala de FAXINA da sala de
 * instrução e a escala de PLANTÃO só da Turma 13, a partir dos dados do portal.
 *
 * Uso: npx tsx scripts/gerar-cartaz-escalas.ts 2026-10 <saida.html>
 * Depois: chrome --headless=new --no-pdf-header-footer --print-to-pdf=<saida.pdf> file:///<saida.html>
 */
import { writeFileSync } from "fs"
import { COMPOSICAO_FAXINA, GRUPOS_FAXINA, MATRICULAS_ORDEM, grupoFaxinaPorData } from "../lib/escalas"
import { MESES_ESCALA, ROTULO_GRUPO, nomeDaMatricula, type Grupo } from "../lib/escalas-cia"

const [chave = "2026-10", saida = "cartaz-escalas.html"] = process.argv.slice(2)
const mes = MESES_ESCALA.find(m => m.chave === chave)
if (!mes) throw new Error(`Mês ${chave} não publicado em lib/escalas-cia.ts`)

const T13 = new Set<number>(MATRICULAS_ORDEM)
const DIAS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"]
const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`
const dia = (iso: string) => { const [a, m, d] = iso.split("-").map(Number); return new Date(a, m - 1, d) }
const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;")

const COR_FAXINA: Record<string, string> = { SEGUNDA: "#1D4ED8", "TERÇA": "#7C3AED", QUARTA: "#B45309", QUINTA: "#15803D", SEXTA: "#B91C1C" }
const COR_GRUPO: Record<Grupo, string> = {
  GOLF: "#15803D", HOTEL: "#B91C1C", INDIA: "#1D4ED8", JULIETT: "#B45309",
  KILO: "#7E22CE", LIMA: "#0F766E", MIKE: "#BE185D", NOVEMBER: "#4D7C0F",
  "1º PEL": "#15803D", "2º PEL": "#B91C1C", "3º PEL": "#1D4ED8", "4º PEL": "#B45309",
  "5º PEL": "#7E22CE", "6º PEL": "#0F766E", "7º PEL": "#BE185D",
}

// ── Faxina ─────────────────────────────────────────────────────────────
const cardsFaxina = GRUPOS_FAXINA.map(g => `
  <div class="fx" style="--c:${COR_FAXINA[g]}">
    <div class="fx-h">${g}</div>
    <ul>${COMPOSICAO_FAXINA[g].map(p => `<li><b>${p.mat}</b> ${esc(p.nome)}</li>`).join("")}</ul>
  </div>`).join("")

// próximos domingos a partir do início do mês (até 10)
const domingos: { iso: string; g: string | null }[] = []
{
  const d = dia(mes.inicio)
  while (d.getDay() !== 0) d.setDate(d.getDate() + 1)
  for (let i = 0; domingos.length < 10 && i < 30; i++) {
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    const g = grupoFaxinaPorData(new Date(d))
    if (g) domingos.push({ iso, g })
    d.setDate(d.getDate() + 7)
  }
}
const cardDomingo = `
  <div class="fx" style="--c:#2b2a27">
    <div class="fx-h">DOMINGO</div>
    <ul class="dom">${domingos.map(x => `<li><b>${ddmm(x.iso)}</b> <span class="tag" style="--c:${COR_FAXINA[x.g!]}">${x.g}</span></li>`).join("")}</ul>
  </div>`

// ── Plantão (só Turma 13) ──────────────────────────────────────────────
const equipes = (Object.keys(mes.mapa) as Grupo[])
  .map(g => ({ g, membros: (mes.mapa[g] ?? []).filter(([m]) => T13.has(m)), dias: mes.plantao.filter(p => p.grupo === g).map(p => p.data) }))
  .filter(e => e.membros.length > 0)
const cardsPlantao = equipes.map(e => `
  <div class="pl" style="--c:${COR_GRUPO[e.g]}">
    <div class="pl-h">${ROTULO_GRUPO[e.g]}</div>
    <div class="pl-dias">${e.dias.map(iso => `<span><small>${DIAS[dia(iso).getDay()]}</small>${iso.slice(8, 10)}</span>`).join("")}</div>
    <ul>${e.membros.map(([m, n]) => `<li><b>${m}</b> ${esc(n)}</li>`).join("")}</ul>
  </div>`).join("")

const semEquipe = MATRICULAS_ORDEM.filter(m => !equipes.some(e => e.membros.some(([x]) => x === m)))

// funções individuais da Turma 13 no mês (auxiliar, adjunto, sobreaviso)
const funcoes: { iso: string; txt: string }[] = []
for (const p of mes.plantao) {
  if (p.auxiliar && T13.has(p.auxiliar)) funcoes.push({ iso: p.data, txt: `<b>Auxiliar do Of. de Dia</b> — ${p.auxiliar} ${esc(nomeDaMatricula(p.auxiliar) ?? "")}` })
  if (p.adjunto && T13.has(p.adjunto)) funcoes.push({ iso: p.data, txt: `<b>Adjunto</b> — ${p.adjunto} ${esc(nomeDaMatricula(p.adjunto) ?? "")}` })
  const sob = p.sobreaviso.filter(m => T13.has(m))
  if (sob.length) funcoes.push({ iso: p.data, txt: `<b>Sobreaviso</b> — ${sob.map(m => `${m} ${esc(nomeDaMatricula(m) ?? "")}`).join(", ")}` })
}
const semPlantao = mes.plantao.filter(p => !p.grupo).map(p => ddmm(p.data))

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Cartaz de escalas — Turma 13</title>
<style>
  @page { size: A4 portrait; margin: 9mm 9mm 8mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; font-family: "Segoe UI", Arial, sans-serif; color: #2b2a27; font-size: 10.5px; }
  header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #3a4a3a; padding-bottom: 5px; margin-bottom: 7px; }
  header h1 { font-family: Georgia, serif; font-size: 21px; color: #3a4a3a; margin: 0; }
  header p { margin: 0; font-size: 10.5px; color: #6b6a65; text-align: right; }
  h2 { font-family: Georgia, serif; font-size: 15.5px; color: #fff; background: #3a4a3a; margin: 0 0 6px; padding: 5px 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: baseline; }
  h2 small { font-family: "Segoe UI", Arial, sans-serif; font-size: 10px; font-weight: 400; color: #e0c979; }
  .grid-fx { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 4px; }
  .fx { border: 2px solid var(--c); border-radius: 8px; overflow: hidden; break-inside: avoid; }
  .fx-h { background: var(--c); color: #fff; font-weight: 800; font-size: 15px; letter-spacing: .06em; padding: 4px 9px; }
  .fx ul { list-style: none; margin: 0; padding: 5px 9px 6px; }
  .fx li { font-size: 11.5px; padding: 1.5px 0; border-bottom: 1px dotted #ddd; }
  .fx li:last-child { border-bottom: none; }
  .fx li b { display: inline-block; min-width: 26px; color: var(--c); }
  .dom { columns: 2; column-gap: 8px; }
  .dom li { break-inside: avoid; display: flex; justify-content: space-between; align-items: center; }
  .dom li b { color: #2b2a27 !important; }
  .tag { background: var(--c); color: #fff; font-size: 8.5px; font-weight: 700; padding: 1px 5px; border-radius: 4px; }
  .obs { font-size: 9.5px; color: #6b6a65; margin: 0 0 9px; }
  .grid-pl { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .pl { border: 2px solid var(--c); border-radius: 8px; overflow: hidden; break-inside: avoid; }
  .pl-h { background: var(--c); color: #fff; font-weight: 800; font-size: 13.5px; letter-spacing: .05em; padding: 3px 8px; }
  .pl-dias { display: flex; flex-wrap: wrap; gap: 3px; padding: 5px 7px 2px; }
  .pl-dias span { border: 1.5px solid var(--c); color: var(--c); border-radius: 5px; font-weight: 800; font-size: 13px; min-width: 30px; text-align: center; line-height: 1.05; padding: 1px 2px 2px; }
  .pl-dias small { display: block; font-size: 7px; font-weight: 700; letter-spacing: .04em; opacity: .8; }
  .pl ul { list-style: none; margin: 0; padding: 3px 8px 5px; }
  .pl li { font-size: 10.5px; padding: 1px 0; }
  .pl li b { display: inline-block; min-width: 25px; color: var(--c); }
  .func { margin-top: 7px; border: 1.5px solid #b5933f; border-radius: 8px; padding: 5px 9px; background: #fbf7ec; }
  .func h3 { margin: 0 0 3px; font-size: 11px; color: #8a6d24; text-transform: uppercase; letter-spacing: .05em; }
  .func ul { list-style: none; margin: 0; padding: 0; columns: 2; column-gap: 14px; }
  .func li { font-size: 9.8px; padding: 1px 0; break-inside: avoid; }
  .func li span { display: inline-block; min-width: 62px; font-weight: 700; color: #3a4a3a; }
  footer { margin-top: 6px; font-size: 8.5px; color: #8a8984; display: flex; justify-content: space-between; }
</style></head><body>
<header>
  <div><h1>Escalas da Turma 13 · 1º Pelotão</h1></div>
  <p>CFO PM 2026 · ${esc(mes.rotulo)}<br>Consulte também o portal: portalcfo2026.com.br</p>
</header>

<h2>FAXINA DA SALA DE INSTRUÇÃO <small>uma equipe por dia · domingo em rodízio</small></h2>
<div class="grid-fx">${cardsFaxina}${cardDomingo}</div>
<p class="obs">Domingo com instrução: começa pela equipe SEGUNDA e segue a sequência (TERÇA, QUARTA, QUINTA, SEXTA). Sábado sem faxina.</p>

<h2>PLANTÃO — TURMA 13 <small>escala 7x1 · 07h às 07h · ${esc(mes.rotulo)}</small></h2>
<div class="grid-pl">${cardsPlantao}</div>
${semPlantao.length ? `<p class="obs" style="margin:5px 0 0">Sem plantão na escala: ${semPlantao.join(", ")}.${semEquipe.length ? ` Sem equipe no mapa: ${semEquipe.join(", ")}.` : ""}</p>` : ""}
${funcoes.length ? `<div class="func"><h3>Funções individuais da Turma 13 no mês</h3><ul>${funcoes.map(f => `<li><span>${DIAS[dia(f.iso).getDay()]} ${ddmm(f.iso)}</span>${f.txt}</li>`).join("")}</ul></div>` : ""}

<footer><span>Fonte: escalas da 1ª CIA / Corpo de Alunos — em caso de divergência, vale o documento oficial.</span><span>Desenvolvido por AL CFO PM 108 LISANDRY</span></footer>
</body></html>`

writeFileSync(saida, html)
console.log(`✓ ${saida} — ${equipes.length} equipes da Turma 13, ${funcoes.length} funções individuais, ${domingos.length} domingos`)
