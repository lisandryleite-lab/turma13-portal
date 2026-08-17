import "dotenv/config"
import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { diasDaSemana, HORARIOS, importarQtsColado, type QtsDados } from "../lib/qts"
import { cartazHtml, type DisciplinaCartaz } from "../lib/qts-cartaz"

// ── Cartaz do QTS em PDF ──────────────────────────────────────────────────────
// Renderiza o MESMO HTML do botão "Imprimir cartaz" (lib/qts-cartaz.ts) num
// arquivo PDF, usando o Chromium headless.
//
//   npx tsx scripts/qts-cartaz-pdf.ts --semana 32
//   npx tsx scripts/qts-cartaz-pdf.ts --semana 32 --colado scripts/data/qts-semana32.txt
//
// Fonte da grade:
//   • com DATABASE_URL → lê o QTS e as Disciplinas do banco e monta as DUAS
//     páginas do cartaz (grade da semana + acompanhamento do curso);
//   • sem DATABASE_URL → exige --colado <arquivo> com o trecho da planilha e
//     monta SÓ a primeira página. O acompanhamento depende de cargaMinistrada
//     real; sem banco ele sairia com números errados, então é omitido.

function arg(nome: string): string | undefined {
  const i = process.argv.indexOf(`--${nome}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const SEMANA = Number(arg("semana") || 0)
if (!SEMANA || isNaN(SEMANA)) { console.error("Informe --semana <1-52>"); process.exit(1) }

const CHROMIUM = process.env.CHROMIUM_PATH
  || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

function gradeDoArquivo(caminho: string, dias: string[]) {
  const planilha = readFileSync(caminho, "utf8")
  // O arquivo usa "|" no lugar do TAB só para ficar legível no repositório.
  const colado = planilha.trim().split("\n")
    .map(l => l.split("|").map(c => c.trim()).join("\t")).join("\n")
  return importarQtsColado(colado, dias, { colunasPorDia: 2, coluna: "esquerda" })
}

async function doBanco(semana: number): Promise<{ dados: QtsDados; disciplinas: DisciplinaCartaz[] }> {
  const { PrismaClient } = await import("../lib/generated/prisma/client")
  const { PrismaNeon } = await import("@prisma/adapter-neon")
  const { neonConfig } = await import("@neondatabase/serverless")
  const ws = (await import("ws")).default
  neonConfig.webSocketConstructor = ws as never
  const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })
  try {
    const [qts, disciplinas] = await Promise.all([
      prisma.qTS.findUnique({ where: { semana } }),
      prisma.disciplina.findMany({ orderBy: [{ modulo: "asc" }, { sigla: "asc" }] }),
    ])
    if (!qts) throw new Error(`QTS da semana ${semana} não existe no banco.`)
    return { dados: qts.dados as QtsDados, disciplinas }
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  const dias = diasDaSemana(SEMANA)
  const colado = arg("colado")

  let dados: QtsDados
  let disciplinas: DisciplinaCartaz[]
  let acompanhamento: boolean

  if (process.env.DATABASE_URL && !colado) {
    ;({ dados, disciplinas } = await doBanco(SEMANA))
    acompanhamento = true
    console.log(`Grade e disciplinas lidas do banco (semana ${SEMANA}).`)
  } else {
    if (!colado) {
      console.error("Sem DATABASE_URL: informe --colado <arquivo> com o trecho da planilha.")
      process.exit(1)
    }
    const r = gradeDoArquivo(colado, dias)
    dados = { dias, horarios: HORARIOS, grade: r.grade }
    // Só os nomes entram na legenda; sem banco não há carga para o acompanhamento.
    disciplinas = r.siglas.map(sigla => ({ sigla, nome: NOMES[sigla] || "", cargaTotal: 0, cargaMinistrada: 0, status: "" }))
    acompanhamento = false
    console.log(`Grade lida de ${colado} — ${r.linhas.length} faixas, siglas: ${r.siglas.join(", ")}`)
    console.log("Sem DATABASE_URL: gerando só a página da grade (o acompanhamento exige carga real do banco).")
  }

  const html = cartazHtml({ dados, disciplinas, semana: SEMANA, acompanhamento })

  const dir = mkdtempSync(join(tmpdir(), "qts-cartaz-"))
  const htmlPath = join(dir, "cartaz.html")
  writeFileSync(htmlPath, html, "utf8")

  const saida = arg("saida") || join(process.cwd(), `qts-semana-${SEMANA}-cartaz.pdf`)
  execFileSync(CHROMIUM, [
    "--headless", "--disable-gpu", "--no-sandbox",
    "--no-pdf-header-footer",
    `--print-to-pdf=${saida}`,
    `file://${htmlPath}`,
  ], { stdio: "pipe" })

  console.log(`✓ PDF gerado: ${saida}`)
}

// Nomes das disciplinas para a legenda quando não há banco. Espelha prisma/seed.ts.
const NOMES: Record<string, string> = {
  AP: "Abordagem a Pessoas",
  DPPM: "Direito Penal e Processual Penal Militar",
  EASE: "Economia Aplicada ao Setor Público",
  GC: "Gerenciamento de Crises",
  PE: "Planejamento Estratégico",
  POE: "Planejamento Operacional e Especializado",
  TCEM: "Trabalho de Comando e Estado Maior",
  TFM2: "Treinamento Físico Militar II",
  TPE: "Teoria e Prática do Ensino",
}

main().catch(e => { console.error(e); process.exit(1) })
