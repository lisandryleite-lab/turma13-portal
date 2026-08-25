/**
 * Gera o "BI DA SEMANA" da Turma 13 em HTML (A4 paisagem-livre, 1 página) a partir
 * dos dados vivos do banco. O PDF sai depois com Chrome headless:
 *
 *   npx tsx scripts/gerar-bi.ts 32
 *   powershell -File scripts/gerar-bi.ps1 -Semana 32
 *
 * Tudo que aparece no BI vem do banco ou dos cálculos de lib/escalas.ts — nada é
 * digitado à mão aqui, para o BI nunca divergir do portal.
 */
import "dotenv/config"
import { writeFileSync } from "node:fs"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import { DATA_INICIO, DATA_FIM_CFO, diasParaFimCFO } from "../lib/utils"
import {
  calcularServico, parseDataLocal, grupoPlantaoPorData, grupoFaxinaPorData, GRUPOS_FAXINA,
  MEMBROS_PLANTAO, GRUPOS_PLANTAO, CORES_PLANTAO,
} from "../lib/escalas"

neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SEMANA = Number(process.argv[2] || 0)
if (!SEMANA) { console.error("uso: npx tsx scripts/gerar-bi.ts <semana> [saida.html] [zoom]"); process.exit(1) }
const SAIDA = process.argv[3] || `BI SEMANA ${SEMANA}.html`
const ZOOM = Number(process.argv[4] || 0.82)

const MESES = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"]
const DIAS_ABREV = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]
const FUNCOES_LABEL: Record<string, string> = {
  AuxiliarOD: "Auxiliar do Oficial de Dia",
  AdjuntoOD: "Adjunto ao Aux. do Of. de Dia",
  Adjunto1: "Adjunto 1", Adjunto2: "Adjunto 2",
  Mestre: "Mestre de Cerimônia", Leitor: "Leitor de BI",
  Discurso: "Discurso ao CFO", Comandante: "Comandante da 1ª CIA",
}
// Ordem de exibição das funções — as de escala de dia primeiro, depois as de solenidade.
const FUNCOES_ORDEM = ["AuxiliarOD","AdjuntoOD","Adjunto1","Adjunto2","Mestre","Leitor","Comandante","Discurso"]

// Provas marcadas. O QTS marca prova com um emoji que não sobrevive à extração de
// texto, então a data vem daqui — avisada pela Divisão de Ensino/instrutor.
// Aparecem no BI quando caem até 21 dias depois do fim da semana do boletim.
const PROVAS: { data: string; disciplinas: string[]; obs?: string }[] = [
  { data: "2026-09-02", disciplinas: ["TCEM", "GC"] }, // Qua — avisado em 25/08/2026
]

const pad = (n: number) => String(n).padStart(2, "0")
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const ddmm = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`

// Datas gravadas no banco (FuncaoDestaqueDia, Xerife) são meia-noite UTC — em fuso
// negativo, ler com getDate()/getDay() volta um dia. Sempre pelos acessores UTC.
const ddmmUTC = (d: Date) => `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}`
const isoUTC = (d: Date) => d.toISOString().slice(0, 10)
const diaAbrevUTC = (d: Date) => DIAS_ABREV[d.getUTCDay()]

// DATA_INICIO vem de `new Date("2026-01-12")` — meia-noite UTC. Reconstrói em hora
// local para que a segunda-feira da semana não escorregue um dia.
function segundaDaSemana(semana: number): Date {
  const d = new Date(DATA_INICIO.getUTCFullYear(), DATA_INICIO.getUTCMonth(), DATA_INICIO.getUTCDate())
  d.setDate(d.getDate() + (semana - 1) * 7)
  return d
}

type QtsDados = { dias: string[]; horarios: string[]; grade: Record<string, string[]> }

async function main() {
  const hoje = new Date()
  const inicio = segundaDaSemana(SEMANA)
  const fim = new Date(inicio); fim.setDate(fim.getDate() + 6)
  const mesRef = inicio.getMonth() + 1
  const anoRef = inicio.getFullYear()

  const periodo = inicio.getMonth() === fim.getMonth()
    ? `${pad(inicio.getDate())} a ${pad(fim.getDate())} de ${MESES[inicio.getMonth()]} de ${anoRef}`
    : `${ddmm(inicio)} a ${ddmm(fim)} de ${anoRef}`

  const [qts, disciplinas, xerife, alunos, faxinaBD, funcoesMes] = await Promise.all([
    prisma.qTS.findUnique({ where: { semana: SEMANA } }),
    prisma.disciplina.findMany(),
    prisma.xerife.findFirst({ where: { atual: true } }),
    prisma.user.findMany({
      where: { isAdmin: false },
      select: { matricula: true, nomeGuerra: true, aniversario: true },
    }),
    prisma.faxinaGrupoMembro.findMany({ orderBy: [{ grupo: "asc" }, { mat: "asc" }] }),
    prisma.funcaoDestaqueDia.findMany({
      where: { data: { gte: new Date(anoRef, mesRef - 1, 1), lte: new Date(anoRef, mesRef, 0, 23, 59) } },
      orderBy: { data: "asc" },
    }),
  ])

  if (!qts) { console.error(`✗ QTS da semana ${SEMANA} não está cadastrado no banco.`); process.exit(1) }
  const dados = qts.dados as unknown as QtsDados

  const nomePorMat = new Map(alunos.map(a => [a.matricula, a.nomeGuerra]))
  const nome = (mat: number | null | undefined) => (mat ? nomePorMat.get(mat) ?? `Mat. ${mat}` : "—")

  // ── Progresso do curso ───────────────────────────────────────────────
  const totalCarga = disciplinas.reduce((s, d) => s + d.cargaTotal, 0)
  const totalDada = disciplinas.reduce((s, d) => s + d.cargaMinistrada, 0)
  const pct = Math.round((totalDada / totalCarga) * 100)
  const encerradas = disciplinas.filter(d => d.cargaMinistrada >= d.cargaTotal && d.cargaTotal > 0).length
  const restantes = totalCarga - totalDada
  const mediaSemana = totalDada / SEMANA
  const semanasRestantes = mediaSemana > 0 ? Math.ceil(restantes / mediaSemana) : 0
  const fimProjetado = new Date(fim); fimProjetado.setDate(fimProjetado.getDate() + semanasRestantes * 7)
  const termino = `${MESES[fimProjetado.getMonth()].slice(0, 3)}/${fimProjetado.getFullYear()}`

  // ── Horas por disciplina nesta semana (para a legenda) ───────────────
  const horasSemana: Record<string, number> = {}
  for (const slots of Object.values(dados.grade)) {
    for (const s of slots) if (s) horasSemana[s] = (horasSemana[s] || 0) + 1
  }
  const legenda = Object.entries(horasSemana).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))

  // ── Aniversariantes do mês ───────────────────────────────────────────
  const aniversariantes = alunos
    .filter(a => a.aniversario && Number(a.aniversario.split("/")[1]) === mesRef)
    .sort((a, b) => Number(a.aniversario!.split("/")[0]) - Number(b.aniversario!.split("/")[0]))

  // ── Serviço P1/P3/P4 — semana atual + 4 seguintes ────────────────────
  const servico = Array.from({ length: 5 }, (_, i) => {
    const s = SEMANA + i
    const { p1, p3, p4 } = calcularServico(s)
    return { semana: s, p1: nome(p1), p3: nome(p3), p4: nome(p4) }
  })

  // ── Agenda dos próximos dias ─────────────────────────────────────────
  // O calendário do mês inteiro gastava meia página com dias que já passaram.
  // Aqui só o que ainda vem: plantão (equipe do dia), faxina (grupo do dia) e a
  // contagem regressiva caindo dia a dia. Começa em HOJE — ou na segunda da
  // semana, se o BI for gerado adiantado.
  const DIAS_AGENDA = 14
  const agendaInicio = hoje > inicio
    ? new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
    : new Date(inicio)
  const agenda = Array.from({ length: DIAS_AGENDA }, (_, i) => {
    const d = new Date(agendaInicio); d.setDate(d.getDate() + i)
    return {
      data: d,
      diaSemana: DIAS_ABREV[d.getDay()],
      fds: d.getDay() === 0 || d.getDay() === 6,
      plantao: grupoPlantaoPorData(d),
      faxina: grupoFaxinaPorData(d),
      faltam: diasParaFimCFO(d),
      hoje: d.getTime() === new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime(),
    }
  })
  const agendaFim = agenda[agenda.length - 1].data

  // ── Grupos de faxina (banco, com fallback pela composição do lib) ────
  const gruposFaxina = GRUPOS_FAXINA.map(g => ({
    grupo: g,
    membros: faxinaBD.filter(m => m.grupo === g).map(m => ({ mat: m.mat, nome: m.nome })),
  })).filter(g => g.membros.length > 0)

  // ── Funções de destaque ──────────────────────────────────────────────
  const ordenaFuncao = (f: string) => {
    const i = FUNCOES_ORDEM.indexOf(f)
    return i === -1 ? FUNCOES_ORDEM.length : i
  }
  // Comparação por string ISO (YYYY-MM-DD) — evita qualquer aritmética de fuso.
  const isoInicio = `${inicio.getFullYear()}-${pad(inicio.getMonth() + 1)}-${pad(inicio.getDate())}`
  const isoFim = `${fim.getFullYear()}-${pad(fim.getMonth() + 1)}-${pad(fim.getDate())}`
  const daSemana = funcoesMes
    .filter(f => isoUTC(f.data) >= isoInicio && isoUTC(f.data) <= isoFim)
    .sort((a, b) => a.data.getTime() - b.data.getTime() || ordenaFuncao(a.funcao) - ordenaFuncao(b.funcao))
  const proximas = funcoesMes.filter(f => isoUTC(f.data) > isoFim)
  const proximasPorFuncao = FUNCOES_ORDEM
    .map(f => ({ funcao: f, itens: proximas.filter(p => p.funcao === f) }))
    .filter(g => g.itens.length > 0)

  // ─────────────────────────────────────────────────────────────────────
  //  HTML
  // ─────────────────────────────────────────────────────────────────────
  const NAVY = "#0B2D5E", GOLD = "#B8924A", BORDA = "#dde3ee"

  const secao = (titulo: string) => `
    <h2 style="font-family:'Arial Narrow',Arial,sans-serif;font-size:13px;font-weight:700;color:${NAVY};
      text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px;padding-bottom:4px;
      border-bottom:2px solid ${GOLD}">${esc(titulo)}</h2>`

  const cartao = (titulo: string, corpo: string) => `
    <div style="border:1px solid ${BORDA};border-radius:6px;padding:7px 9px;background:#fff">
      <p style="font-size:8.5px;font-weight:700;color:${GOLD};text-transform:uppercase;letter-spacing:.06em;margin:0 0 3px">${esc(titulo)}</p>
      ${corpo}
    </div>`

  // Grade do QTS
  const gradeHtml = `
    <table style="width:100%;border-collapse:collapse;font-size:8.5px">
      <thead>
        <tr style="background:${NAVY};color:#fff">
          <th style="padding:4px 6px;text-align:left;font-weight:700">Horário</th>
          ${dados.dias.map(d => `<th style="padding:4px 6px;font-weight:700">${esc(d)}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${dados.horarios.map((h, i) => `
          <tr style="background:${i % 2 ? "#f6f8fc" : "#fff"}">
            <td style="padding:3px 6px;border:1px solid ${BORDA};font-weight:700;color:${NAVY};white-space:nowrap">${esc(h)}</td>
            ${dados.dias.map(d => {
              const v = dados.grade[d]?.[i] || ""
              return `<td style="padding:3px 6px;border:1px solid ${BORDA};text-align:center;${v ? `font-weight:600;color:${NAVY}` : "color:#c3cad8"}">${v ? esc(v) : "—"}</td>`
            }).join("")}
          </tr>`).join("")}
      </tbody>
    </table>`

  const legendaHtml = `
    <p style="font-size:8px;color:#5b6577;margin:5px 0 0;line-height:1.7">
      ${/* precisa juntar com espaço: sem ele não há ponto de quebra entre os spans (todos nowrap) */""
      }${legenda.map(([s, h]) => `<span style="white-space:nowrap;margin-right:12px"><strong style="color:${NAVY}">${esc(s)}</strong> · ${h}h esta semana</span>`).join(" ")}
    </p>`

  // ── Provas à vista (até 21 dias depois do fim desta semana) ──────────
  const diasFim = diasParaFimCFO()
  const limiteProvas = new Date(fim); limiteProvas.setDate(limiteProvas.getDate() + 21)
  const provas = PROVAS
    .map(p => ({ ...p, quando: parseDataLocal(p.data) }))
    .filter(p => p.quando > fim && p.quando <= limiteProvas)
    .sort((a, b) => a.quando.getTime() - b.quando.getTime())

  const provasHtml = provas.length === 0 ? "" : `
    <div style="border:1.5px solid #b4562a;background:#fdf3ec;border-radius:8px;
      padding:9px 14px;margin-bottom:12px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <span style="font-size:9px;font-weight:700;color:#b4562a;text-transform:uppercase;letter-spacing:.1em;white-space:nowrap">
        ▲ Provas à vista
      </span>
      ${provas.map(p => {
        const emDias = Math.round((p.quando.getTime() - Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())) / 86_400_000)
        return `<span style="font-size:10.5px;color:#1e2937">
          <strong style="color:#b4562a">${DIAS_ABREV[p.quando.getDay()]} ${ddmm(p.quando)}</strong>
          — ${p.disciplinas.map(d => `<strong>${esc(d)}</strong>`).join(" e ")}
          <span style="color:#8a6a55">(em ${emDias} dia${emDias === 1 ? "" : "s"})</span>
          ${p.obs ? ` · ${esc(p.obs)}` : ""}
        </span>`
      }).join("")}
    </div>`

  const pill = (destaque: string, texto: string) => `
    <div style="flex:1;background:linear-gradient(135deg,${NAVY} 0%,#12407f 100%);border-radius:8px;
      padding:10px 14px;display:flex;align-items:center;gap:9px;color:#fff">
      <span style="font-family:'Arial Narrow',Arial,sans-serif;font-size:20px;font-weight:700;color:${GOLD};line-height:1">${destaque}</span>
      <span style="font-size:9px;line-height:1.3">${texto}</span>
    </div>`

  const servicoHtml = `
    <table style="width:100%;border-collapse:collapse;font-size:9px">
      <thead><tr style="border-bottom:1.5px solid ${BORDA}">
        <th style="padding:4px 6px;text-align:left;color:${NAVY}">Sem.</th>
        <th style="padding:4px 6px;text-align:left;color:${NAVY}">P1 — Pessoal</th>
        <th style="padding:4px 6px;text-align:left;color:${NAVY}">P3 — Operações</th>
        <th style="padding:4px 6px;text-align:left;color:${NAVY}">P4 — Logística</th>
      </tr></thead>
      <tbody>
        ${servico.map((s, i) => `
          <tr style="background:${s.semana === SEMANA ? "#eef4fd" : i % 2 ? "#fbfcfe" : "#fff"};
            border-bottom:1px solid ${BORDA};font-weight:${s.semana === SEMANA ? 700 : 400}">
            <td style="padding:4px 6px;color:${NAVY};font-weight:700">${s.semana}</td>
            <td style="padding:4px 6px">${esc(s.p1)}</td>
            <td style="padding:4px 6px">${esc(s.p3)}</td>
            <td style="padding:4px 6px">${esc(s.p4)}</td>
          </tr>`).join("")}
      </tbody>
    </table>`

  // Faixa fina, e SÓ quando há aniversariante — o bloco "Nenhum aniversariante"
  // ocupava um quarto da página sem dizer nada. Em setembro ela volta sozinha.
  const aniversariosHtml = aniversariantes.length === 0 ? "" : `
    <div style="border:1px solid ${GOLD}55;background:rgba(184,146,74,.07);border-radius:8px;
      padding:6px 14px;margin-bottom:12px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <span style="font-size:9px;font-weight:700;color:${GOLD};text-transform:uppercase;letter-spacing:.1em;white-space:nowrap">
        Aniversariantes — ${MESES[mesRef - 1]}
      </span>
      ${aniversariantes.map(a => `<span style="font-size:10px;white-space:nowrap">
        <strong style="color:${GOLD}">${esc(a.aniversario!)}</strong> ${esc(a.nomeGuerra)}
      </span>`).join(" ")}
    </div>`

  const agendaHtml = `
    <table style="width:100%;border-collapse:collapse;font-size:8.5px">
      <thead><tr style="border-bottom:1.5px solid ${BORDA};color:${NAVY}">
        <th style="padding:4px 5px;text-align:left">Data</th>
        <th style="padding:4px 5px;text-align:left">Dia</th>
        <th style="padding:4px 5px;text-align:left">Plantão</th>
        <th style="padding:4px 5px;text-align:left">Faxina</th>
        <th style="padding:4px 5px;text-align:right">Faltam</th>
      </tr></thead>
      <tbody>
        ${agenda.map((a, i) => `
          <tr style="background:${a.hoje ? "#fdf6e6" : a.fds ? "#f6f8fc" : i % 2 ? "#fbfcfe" : "#fff"};
            border-bottom:1px solid ${BORDA};${a.hoje ? `box-shadow:inset 2px 0 0 ${GOLD}` : ""}">
            <td style="padding:4px 5px;font-weight:700;color:${NAVY};white-space:nowrap">
              ${ddmm(a.data)}${a.hoje ? ` <span style="color:${GOLD};font-size:7.5px">hoje</span>` : ""}
            </td>
            <td style="padding:4px 5px;color:${a.fds ? "#8a93a5" : "#1e2937"}">${a.diaSemana}</td>
            <td style="padding:4px 5px;font-weight:700;color:${CORES_PLANTAO[a.plantao]}">${a.plantao}</td>
            <td style="padding:4px 5px;font-weight:${a.faxina ? 700 : 400};color:${a.faxina ? NAVY : "#c3cad8"}">${a.faxina ?? "—"}</td>
            <td style="padding:4px 5px;text-align:right;font-weight:700;color:${GOLD}">${a.faltam}</td>
          </tr>`).join("")}
      </tbody>
    </table>
    <p style="font-size:8px;color:#8a93a5;margin:5px 0 0">
      "Faltam" = dias até o término previsto do CFO (${DATA_FIM_CFO.toLocaleDateString("pt-BR", { timeZone: "UTC" })}).
    </p>`

  const gruposFaxinaHtml = `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
      ${gruposFaxina.map(g => cartao(g.grupo,
        `<p style="font-size:8px;line-height:1.55;margin:0">${g.membros.map(m =>
          `<strong style="color:${NAVY}">${m.mat}</strong> ${esc(m.nome)}`).join("<br>")}</p>`
      )).join("")}
    </div>`

  const plantaoHtml = `
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">
      ${GRUPOS_PLANTAO.map(g => `
        <div style="border:1px solid ${BORDA};border-left:3px solid ${CORES_PLANTAO[g]};border-radius:6px;padding:6px 9px;background:#fff">
          <p style="font-size:9px;font-weight:700;color:${CORES_PLANTAO[g]};margin:0 0 3px;letter-spacing:.04em">${g}</p>
          <p style="font-size:8px;line-height:1.55;margin:0">${MEMBROS_PLANTAO[g].map(m =>
            `<strong style="color:${NAVY}">${m.mat}</strong> ${esc(m.nome)}`).join("<br>")}</p>
        </div>`).join("")}
    </div>`

  const funcoesSemanaHtml = daSemana.length === 0
    ? `<p style="font-size:9.5px;color:#8a93a5;margin:0">Nenhuma função de destaque escalada nesta semana.</p>`
    : `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">
        ${daSemana.map(f => `
          <div style="border:1px solid ${GOLD}55;background:#fdfaf3;border-radius:6px;padding:6px 9px;
            display:flex;align-items:center;gap:8px">
            <div style="flex:1;min-width:0">
              <p style="font-size:8px;font-weight:700;color:${GOLD};text-transform:uppercase;letter-spacing:.05em;margin:0">${esc(FUNCOES_LABEL[f.funcao] ?? f.funcao)}</p>
              <p style="font-family:'Arial Narrow',Arial,sans-serif;font-size:12.5px;font-weight:700;color:${NAVY};margin:1px 0 0">${esc(nome(f.matricula))}</p>
            </div>
            <span style="font-size:9px;font-weight:700;color:${NAVY};white-space:nowrap">${diaAbrevUTC(f.data)} ${ddmmUTC(f.data)}</span>
          </div>`).join("")}
      </div>`

  const proximasHtml = proximasPorFuncao.length === 0 ? "" : `
    <p style="font-size:8.5px;font-weight:700;color:#8a93a5;text-transform:uppercase;letter-spacing:.06em;margin:9px 0 5px">
      Próximas datas — ${MESES[mesRef - 1]}
    </p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
      ${proximasPorFuncao.map(g => cartao(FUNCOES_LABEL[g.funcao] ?? g.funcao,
        `<p style="font-size:8px;line-height:1.6;margin:0">${g.itens.map(i =>
          `<strong style="color:${NAVY}">${diaAbrevUTC(i.data)} ${ddmmUTC(i.data)}</strong> ${esc(nome(i.matricula))}`).join("<br>")}</p>`
      )).join("")}
    </div>`


  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>BI da Semana ${SEMANA} — Turma 13</title>
<style>
  @page { size: A4 portrait; margin: 6mm; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; margin: 0; color: #1e2937; font-size: 9px; }
  h1,h2,h3 { margin: 0 }
  table { page-break-inside: avoid }
  /* O BI tem que caber em UMA página A4. A quantidade de conteúdo varia por semana
     (nº de funções escaladas, de aniversariantes), então o encolhimento fica num
     único botão: ZOOM. Se sobrar página, baixe; se sobrar espaço, suba. */
  #folha { zoom: ${ZOOM}; }
</style></head>
<body><div id="folha">

  <!-- Cabeçalho -->
  <div style="background:linear-gradient(135deg,${NAVY} 0%,#153f7d 55%,#1d4f9a 100%);
    border-radius:10px;padding:16px 22px;color:#fff;margin-bottom:10px">
    <p style="font-size:9px;font-weight:700;color:${GOLD};text-transform:uppercase;letter-spacing:.14em;margin:0">
      Academia de Polícia Militar do Paudalho · CFO PM 2026
    </p>
    <h1 style="font-family:'Arial Narrow',Arial,sans-serif;font-size:34px;font-weight:700;letter-spacing:.02em;margin:4px 0 2px">BI DA SEMANA</h1>
    <p style="font-size:12px;color:#cfe0f7;margin:0">Turma 13 · Semana ${SEMANA}/52 · ${periodo}</p>
  </div>

  <!-- Xerife -->
  <div style="border:1px solid ${GOLD}66;background:rgba(184,146,74,.09);border-radius:8px;
    padding:8px 16px;display:flex;align-items:center;gap:12px;margin-bottom:12px">
    <span style="font-size:9px;font-weight:700;color:${GOLD};text-transform:uppercase;letter-spacing:.1em;white-space:nowrap">★ Xerife da semana</span>
    <span style="font-family:'Arial Narrow',Arial,sans-serif;font-size:16px;font-weight:700;color:${NAVY}">${esc(xerife?.nomeGuerra ?? "—")}</span>
    <span style="margin-left:auto;font-size:9px;color:#7b8496">${xerife ? `Mat. ${xerife.matricula} · desde ${ddmmUTC(xerife.dataInicio)}/${xerife.dataInicio.getUTCFullYear()}` : ""}</span>
  </div>

  <!-- QTS -->
  <div style="margin-bottom:10px">
    ${secao("QTS semanal — grade horária e acompanhamento")}
    ${gradeHtml}
    ${legendaHtml}
  </div>

  ${provasHtml}

  <!-- Indicadores -->
  <div style="display:flex;gap:8px;margin-bottom:12px">
    ${pill(`${pct}%`, `${totalDada}h de ${totalCarga}h ministradas`)}
    ${pill(`${encerradas}/${disciplinas.length}`, "disciplinas encerradas")}
    ${pill(`${restantes}h`, `restantes · término ${termino}`)}
    ${pill(`${diasFim}`, `dias para o fim do CFO · ${DATA_FIM_CFO.toLocaleDateString("pt-BR", { timeZone: "UTC" })}`)}
  </div>

  ${aniversariosHtml}

  <!-- Agenda + Serviço -->
  <div style="display:grid;grid-template-columns:1fr 1.35fr;gap:16px;margin-bottom:12px">
    <div>${secao(`Agenda — ${ddmm(agendaInicio)} a ${ddmm(agendaFim)}`)}${agendaHtml}</div>
    <div>
      ${secao("Serviço — P1 / P3 / P4")}${servicoHtml}
      <div style="margin-top:12px">${secao("Grupos de faxina")}${gruposFaxinaHtml}</div>
    </div>
  </div>

  <!-- Plantão + Funções -->
  <div style="display:grid;grid-template-columns:1fr 1.35fr;gap:16px">
    <div>${secao("Plantão — equipes 3X1")}${plantaoHtml}</div>
    <div>${secao("Escala de serviço — funções")}
      <p style="font-size:8.5px;font-weight:700;color:${GOLD};text-transform:uppercase;letter-spacing:.06em;margin:0 0 5px">★ Desta semana · ${ddmm(inicio)} a ${ddmm(fim)}</p>
      ${funcoesSemanaHtml}
      ${proximasHtml}
    </div>
  </div>

  <p style="text-align:center;font-size:8px;color:#9aa3b4;margin-top:14px;padding-top:8px;border-top:1px solid ${BORDA}">
    Portal Turma 13 · CFO PM 2026 — Gerado em ${pad(hoje.getDate())}/${pad(hoje.getMonth() + 1)}/${hoje.getFullYear()}
  </p>

</div></body></html>`

  writeFileSync(SAIDA, html, "utf8")
  console.log(`✓ ${SAIDA}`)
  console.log(`  Semana ${SEMANA} · ${periodo}`)
  console.log(`  ${totalDada}h/${totalCarga}h (${pct}%) · ${encerradas}/${disciplinas.length} encerradas · ${restantes}h restantes · término ${termino}`)
  console.log(`  Xerife: ${xerife?.nomeGuerra ?? "—"} · ${daSemana.length} função(ões) na semana · ${aniversariantes.length} aniversariante(s)`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
