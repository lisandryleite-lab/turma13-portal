/**
 * Gera o simulado (módulo "SIM") de uma disciplina em HTML, direto do banco do
 * portal — prova + gabarito comentado, pronto para imprimir em A4.
 *
 *   npx tsx scripts/gerar-simulado.ts GC [saida.html]
 *
 * Sem argumento de saída, grava "SIMULADO-<SIGLA>.html" no diretório atual.
 */
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import { writeFileSync } from "fs"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SIGLA = (process.argv[2] || "GC").toUpperCase()
const SAIDA = process.argv[3] || `SIMULADO-${SIGLA}.html`

type Alt = { id: string; texto: string }
type Modelo = { estrutura?: string; criterios?: string[]; resposta?: string }

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const p = (s: string) => esc(s).replace(/\n+/g, "<br>")

/** "(Valor: 0,20)" no fim do enunciado vira etiqueta separada. */
function separaValor(enunciado: string): { texto: string; valor: string | null } {
  const m = enunciado.match(/\s*\((Valor[^)]*)\)\s*$/i)
  if (!m) return { texto: enunciado.trim(), valor: null }
  return { texto: enunciado.slice(0, m.index).trim(), valor: m[1] }
}

/** "QUESTÃO 04 — ..." vira rótulo separado. */
function separaRotulo(texto: string): { rotulo: string | null; resto: string } {
  const m = texto.match(/^(QUEST[ÃA]O\s+\d+)\s*[—–-]\s*/i)
  if (!m) return { rotulo: null, resto: texto }
  return { rotulo: m[1].toUpperCase(), resto: texto.slice(m[0].length) }
}

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: SIGLA } })
  const qs = await prisma.questao.findMany({
    where: { materia: SIGLA, modulo: "SIM" },
    orderBy: { createdAt: "asc" },
  })
  if (qs.length === 0) {
    console.error(`Nenhuma questão no módulo SIM de ${SIGLA}.`)
    process.exit(1)
  }

  // Agrupa: certo/errado com o mesmo `contexto` formam um bloco (QUESTÃO 01 etc.)
  type Bloco = { contexto: string | null; itens: typeof qs }
  const blocos: Bloco[] = []
  for (const q of qs) {
    const ctx = q.contexto?.trim() || null
    const ultimo = blocos[blocos.length - 1]
    if (ctx && ultimo && ultimo.contexto === ctx) ultimo.itens.push(q)
    else blocos.push({ contexto: ctx, itens: [q] })
  }

  const totalPontos = qs.reduce((s, q) => {
    const m = q.enunciado.match(/Valor:\s*([\d,]+)/i)
    return s + (m ? parseFloat(m[1].replace(",", ".")) : 0)
  }, 0)

  const conta = { ce: 0, mc: 0, ds: 0 }
  for (const q of qs) {
    if (q.tipo === "certo_errado") conta.ce++
    else if (q.tipo === "multipla") conta.mc++
    else conta.ds++
  }

  // ── prova ──────────────────────────────────────────────────────────────
  let nItem = 0
  const prova = blocos.map((b) => {
    const cab = b.contexto ? separaRotulo(b.contexto) : { rotulo: null, resto: "" }
    const cabHtml = b.contexto
      ? `<div class="cab">${cab.rotulo ? `<span class="rot">${esc(cab.rotulo)}</span> ` : ""}${p(cab.resto)}</div>`
      : ""

    const itens = b.itens.map((q) => {
      const { texto, valor } = separaValor(q.enunciado)
      const r = separaRotulo(texto)
      const etiqueta = valor ? `<span class="val">${esc(valor)}</span>` : ""

      if (q.tipo === "certo_errado") {
        nItem++
        return `<div class="item">
          <span class="n">${nItem}</span>
          <div class="corpo"><p>${p(r.resto)} ${etiqueta}</p>
            <div class="ce"><label><span class="cx"></span> Certo</label><label><span class="cx"></span> Errado</label></div>
          </div></div>`
      }

      if (q.tipo === "multipla") {
        const alts = (q.alternativas as unknown as Alt[]) || []
        return `<div class="q">
          <p class="ent">${r.rotulo ? `<span class="rot">${esc(r.rotulo)}</span> ` : ""}${p(r.resto)} ${etiqueta}</p>
          <ol class="alts">${alts.map(a => `<li><b>${esc(a.id)})</b> ${p(a.texto)}</li>`).join("")}</ol>
        </div>`
      }

      const modelo = (q.modelo as Modelo | null) || null
      return `<div class="q">
        <p class="ent">${r.rotulo ? `<span class="rot">${esc(r.rotulo)}</span> ` : ""}${p(r.resto)} ${etiqueta}</p>
        ${modelo?.estrutura ? `<p class="dica">Estrutura esperada: ${p(modelo.estrutura)}</p>` : ""}
        <div class="linhas">${Array.from({ length: 12 }, () => "<span></span>").join("")}</div>
      </div>`
    }).join("")

    return `<section class="bloco">${cabHtml}${itens}</section>`
  }).join("")

  // ── gabarito ───────────────────────────────────────────────────────────
  let gItem = 0
  const gabarito = qs.map((q) => {
    const { texto } = separaValor(q.enunciado)
    const r = separaRotulo(texto)
    const modelo = (q.modelo as Modelo | null) || null

    if (q.tipo === "certo_errado") {
      gItem++
      const cor = q.gabarito.toLowerCase() === "certo" ? "ok" : "no"
      return `<div class="g">
        <p><span class="n">${gItem}</span> <span class="tag ${cor}">${esc(q.gabarito.toUpperCase())}</span> ${p(r.resto)}</p>
        ${q.explicacao ? `<p class="exp">${p(q.explicacao)}</p>` : ""}
      </div>`
    }

    if (q.tipo === "multipla") {
      return `<div class="g">
        <p>${r.rotulo ? `<span class="rot">${esc(r.rotulo)}</span> ` : ""}<span class="tag ok">${esc(q.gabarito.toUpperCase())}</span></p>
        ${q.explicacao ? `<p class="exp">${p(q.explicacao)}</p>` : ""}
      </div>`
    }

    return `<div class="g">
      <p>${r.rotulo ? `<span class="rot">${esc(r.rotulo)}</span> ` : ""}<span class="tag ds">DISSERTATIVA</span></p>
      ${modelo?.criterios?.length ? `<p class="exp"><b>Critérios de correção:</b></p><ol class="crit">${modelo.criterios.map(c => `<li>${p(c)}</li>`).join("")}</ol>` : ""}
      ${modelo?.resposta ? `<p class="exp"><b>Resposta-modelo:</b> ${p(modelo.resposta)}</p>` : ""}
    </div>`
  }).join("")

  const hoje = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Recife", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date())

  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>Simulado — ${esc(disc?.nome || SIGLA)}</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1c1c1a; background: #f4f4f0;
         font-size: 11.2pt; line-height: 1.5; margin: 0; padding: 24px 16px; }
  .folha { max-width: 800px; margin: 0 auto; background: #fff; padding: 34px 40px;
           box-shadow: 0 1px 6px rgba(0,0,0,.10); }
  header { text-align: center; border-bottom: 2px solid #2b3a2b; padding-bottom: 14px; margin-bottom: 22px; }
  header h1 { font-size: 15pt; margin: 0 0 2px; letter-spacing: .02em; }
  header h2 { font-size: 12.5pt; margin: 0 0 8px; color: #3a4a3a; font-weight: 600; }
  header .meta { font-size: 9.5pt; color: #6a6a62; font-family: system-ui, sans-serif; }
  .resumo { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 12px; font-family: system-ui, sans-serif; }
  .resumo span { font-size: 9pt; background: #eef1ee; border: 1px solid #d8ded8; border-radius: 999px; padding: 3px 11px; }
  .bloco { margin-bottom: 24px; }
  .cab { background: #eef1ee; border-left: 3px solid #3a4a3a; padding: 9px 13px; margin-bottom: 12px;
         font-size: 10.6pt; page-break-after: avoid; }
  .rot { font-family: system-ui, sans-serif; font-size: 9.5pt; font-weight: 700; color: #2b3a2b; letter-spacing: .03em; }
  .val { font-family: system-ui, sans-serif; font-size: 8.5pt; color: #7a7a70; white-space: nowrap; }
  .item { display: flex; gap: 10px; margin: 0 0 11px; page-break-inside: avoid; }
  .item .n, .g .n { flex: 0 0 auto; width: 21px; height: 21px; border-radius: 50%; background: #2b3a2b; color: #fff;
                    font-family: system-ui, sans-serif; font-size: 9pt; font-weight: 700;
                    display: inline-flex; align-items: center; justify-content: center; }
  .item .corpo { flex: 1; }
  .item p { margin: 0 0 5px; }
  .ce { display: flex; gap: 20px; font-family: system-ui, sans-serif; font-size: 9.5pt; color: #4a4a44; }
  .ce label { display: inline-flex; align-items: center; gap: 6px; }
  .cx { display: inline-block; width: 12px; height: 12px; border: 1.4px solid #6a6a62; border-radius: 2px; }
  .q { margin: 0 0 16px; page-break-inside: avoid; }
  .ent { margin: 0 0 7px; }
  .alts { list-style: none; margin: 0; padding: 0 0 0 6px; }
  .alts li { margin: 0 0 4px; padding-left: 4px; }
  .dica { font-size: 9.5pt; color: #6a6a62; font-style: italic; margin: 0 0 7px; }
  .linhas span { display: block; border-bottom: 1px solid #d5d5cc; height: 20px; }
  .gab { page-break-before: always; border-top: 2px solid #2b3a2b; margin-top: 30px; padding-top: 18px; }
  .gab h2 { font-size: 13pt; margin: 0 0 4px; }
  .gab .aviso { font-family: system-ui, sans-serif; font-size: 9pt; color: #7a7a70; margin: 0 0 18px; }
  .g { margin: 0 0 13px; padding-bottom: 11px; border-bottom: 1px solid #e8e8e0; page-break-inside: avoid; }
  .g p { margin: 0 0 5px; }
  .tag { font-family: system-ui, sans-serif; font-size: 8.5pt; font-weight: 700; border-radius: 3px;
         padding: 2px 7px; letter-spacing: .04em; }
  .tag.ok { background: #dcefdc; color: #1d5a1d; }
  .tag.no { background: #f5dcdc; color: #8a1d1d; }
  .tag.ds { background: #e4e8f4; color: #2a3a6a; }
  .exp { font-size: 10pt; color: #4a4a44; }
  .crit { font-size: 10pt; color: #4a4a44; margin: 4px 0 6px; padding-left: 20px; }
  footer { margin-top: 26px; padding-top: 12px; border-top: 1px solid #e0e0d8;
           font-family: system-ui, sans-serif; font-size: 8.5pt; color: #8a8a80; text-align: center; }
  @media print { body { background: #fff; padding: 0; } .folha { box-shadow: none; max-width: none; padding: 0; } }
</style></head>
<body><div class="folha">
<header>
  <h1>SIMULADO — ${esc(SIGLA)}</h1>
  <h2>${esc(disc?.nome || "")}</h2>
  <div class="meta">Curso de Formação de Oficiais · PMPE · Turma 13 — 2026</div>
  <div class="resumo">
    <span><b>${qs.length}</b> questões</span>
    <span>${conta.ce} certo/errado</span>
    <span>${conta.mc} múltipla escolha</span>
    <span>${conta.ds} discursivas</span>
    <span>Total <b>${totalPontos.toFixed(2).replace(".", ",")}</b> pts</span>
  </div>
</header>

${prova}

<div class="gab">
  <h2>Gabarito comentado</h2>
  <p class="aviso">Não consulte antes de responder.</p>
  ${gabarito}
</div>

<footer>Gerado do banco do Portal CFO 2026 (portalcfo2026.com.br) em ${hoje} · módulo SIM de ${esc(SIGLA)}</footer>
</div></body></html>`

  writeFileSync(SAIDA, html, "utf8")
  console.log(`✓ ${SAIDA}`)
  console.log(`  ${qs.length} questões · ${conta.ce} C/E, ${conta.mc} múltipla, ${conta.ds} discursivas · ${totalPontos.toFixed(2)} pts`)
  console.log(`  ${blocos.length} blocos`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
