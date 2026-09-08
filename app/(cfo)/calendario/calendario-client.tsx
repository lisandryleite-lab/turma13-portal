"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  CONFIG_CALENDARIO, TIPOS_EVENTO, ORDEM_TIPOS, DEF_TIPO,
  HIERARQUIA, NIVEIS_ESCOPO, REDE,
  type Escopo, type TipoEvento,
} from "@/lib/calendario-config"
import {
  construirEventos, filtrar, contarPorTipo, proximos, cobreDia, normalizar,
  type EventoCalendario,
} from "@/lib/calendario-eventos"
import type { Grupo, MesEscala } from "@/lib/escalas-cia"
import {
  DIAS_CABECALHO, celulasDaGrade, curta, diaSemanaLongo, diasEntre, faixaCurta,
  mesesDoAnoLetivo, partes, semanasDoMes, somaDias,
  type Mes, type Semana,
} from "@/lib/calendario-datas"

// ── página ───────────────────────────────────────────────────

export type DadosCalendario = {
  hojeIso: string
  nomeDisciplina: Record<string, string>
  minhaMatricula: number
  meuGrupo: Grupo | null
  mes: MesEscala
  minhaTurma: string | null
}

export function CalendarioClient(props: DadosCalendario) {
  const { hojeIso, nomeDisciplina, minhaMatricula, meuGrupo, mes, minhaTurma } = props
  const router = useRouter()
  const params = useSearchParams()

  const meses = useMemo(() => mesesDoAnoLetivo(), [])
  const mesDeHoje = meses.find(m => hojeIso >= m.inicio && hojeIso <= m.fim) ?? meses[0]

  // ── estado, espelhado na URL ───────────────────────────────
  const mesSel = meses.find(m => m.chave === params.get("mes")) ?? mesDeHoje
  const semanas = semanasDoMes(mesSel)
  const semParam = Number(params.get("semana") ?? 0)
  const semanaSel = semanas.find(s => s.indice === semParam) ?? null
  const vista = params.get("vista") === "grade" ? "grade" : "lista"
  const tiposParam = params.get("tipos")
  const tiposOn = useMemo<Set<TipoEvento>>(() => {
    if (!tiposParam) return new Set(ORDEM_TIPOS)
    const s = new Set(tiposParam.split(".").filter(t => (ORDEM_TIPOS as string[]).includes(t)) as TipoEvento[])
    return s.size ? s : new Set(ORDEM_TIPOS)
  }, [tiposParam])
  const escopo: Escopo = {
    unidade: params.get("unidade") || null,
    segmento: params.get("segmento") || null,
    turma: params.get("turma") || null,
  }
  const busca = params.get("q") ?? ""

  const setParams = useCallback((mudancas: Record<string, string | null>) => {
    const p = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(mudancas)) {
      if (v === null || v === "") p.delete(k); else p.set(k, v)
    }
    const qs = p.toString()
    router.replace(qs ? `/calendario?${qs}` : "/calendario", { scroll: false })
  }, [params, router])

  // ── dados ──────────────────────────────────────────────────
  const todos = useMemo(
    () => construirEventos({ mes, matricula: minhaMatricula, meuGrupo, nomeDisciplina, minhaTurma }),
    [mes, minhaMatricula, meuGrupo, nomeDisciplina, minhaTurma],
  )

  const termo = normalizar(busca.trim())
  const de = semanaSel ? semanaSel.inicio : mesSel.inicio
  const ate = semanaSel ? semanaSel.fim : mesSel.fim

  /** escopo + busca, sem recorte de data nem de tipo — base dos contadores e dos próximos */
  const noEscopoESemFiltro = filtrar(todos, { escopo, termo })
  // Recortes da seleção atual. Derivados baratos (o mês/semana visível, nunca
  // o ano inteiro), memoizados pelo compilador do React.
  const naSelecao = noEscopoESemFiltro.filter(e => e.inicio <= ate && e.fim >= de)
  const contagens = contarPorTipo(naSelecao)
  const visiveis = naSelecao.filter(e => tiposOn.has(e.tipo))
  const proximosTres = proximos(noEscopoESemFiltro.filter(e => tiposOn.has(e.tipo)), hojeIso, 3)

  const alternaTipo = (t: TipoEvento) => {
    const s = new Set(tiposOn)
    if (s.has(t)) s.delete(t); else s.add(t)
    setParams({ tipos: s.size === 0 || s.size === ORDEM_TIPOS.length ? null : [...s].join(".") })
  }

  const segmentosDaUnidade = HIERARQUIA.find(h => h.unidade === escopo.unidade)?.segmentos
    ?? HIERARQUIA.flatMap(h => h.segmentos)
  const turmasDoSegmento = segmentosDaUnidade.find(s => s.nome === escopo.segmento)?.turmas
    ?? [...new Set(segmentosDaUnidade.flatMap(s => s.turmas))]

  return (
    <main style={S.main}>
      <Cabecalho escopo={escopo} />

      <SeletorEscopo
        escopo={escopo}
        segmentos={segmentosDaUnidade.map(s => s.nome)}
        turmas={turmasDoSegmento}
        onChange={(nivel, valor) => setParams(
          nivel === "unidade" ? { unidade: valor, segmento: null, turma: null }
          : nivel === "segmento" ? { segmento: valor, turma: null }
          : { turma: valor }
        )}
      />

      <Destaques eventos={proximosTres} hojeIso={hojeIso} />

      <nav style={S.abas} aria-label="Meses do ano letivo">
        {meses.map(m => {
          const ativo = m.chave === mesSel.chave
          return (
            <button key={m.chave} onClick={() => setParams({ mes: m.chave, semana: null })}
              aria-current={ativo ? "true" : undefined}
              style={{ ...S.aba, ...(ativo ? S.abaAtiva : null), ...(m.chave === mesDeHoje.chave && !ativo ? S.abaHoje : null) }}>
              {m.abrev}
            </button>
          )
        })}
      </nav>

      <div style={S.barraSub}>
        <div style={S.subAbas} role="group" aria-label="Semanas do mês">
          <button onClick={() => setParams({ semana: null })} aria-pressed={!semanaSel}
            style={{ ...S.subAba, ...(!semanaSel ? S.subAbaAtiva : null) }}>Mês todo</button>
          {semanas.map(s => {
            const ativo = semanaSel?.indice === s.indice
            return (
              <button key={s.indice} onClick={() => setParams({ semana: String(s.indice) })} aria-pressed={ativo}
                style={{ ...S.subAba, ...(ativo ? S.subAbaAtiva : null) }}>{s.rotulo}</button>
            )
          })}
        </div>
        <div style={S.grupoVista} role="group" aria-label="Visualização">
          {(["lista", "grade"] as const).map(v => (
            <button key={v} onClick={() => setParams({ vista: v === "lista" ? null : v })} aria-pressed={vista === v}
              style={{ ...S.botaoVista, ...(vista === v ? S.botaoVistaAtivo : null) }}>
              {v === "lista" ? "Lista" : "Grade"}
            </button>
          ))}
        </div>
      </div>

      <div style={S.linhaFiltros}>
        <div style={S.filtros} role="group" aria-label="Filtros por tipo">
          {TIPOS_EVENTO.map(t => {
            const on = tiposOn.has(t.chave)
            const n = contagens[t.chave] ?? 0
            return (
              <button key={t.chave} onClick={() => alternaTipo(t.chave)} aria-pressed={on}
                style={{
                  ...S.filtro,
                  borderColor: on ? t.cor : "rgba(26,25,23,0.18)",
                  color: on ? t.cor : "var(--cal-ink-60)",
                  background: on ? "#fff" : "transparent",
                }}>
                <span aria-hidden style={{ ...S.ponto, background: on ? t.cor : "rgba(26,25,23,0.25)" }} />
                {t.rotulo}
                <span style={S.contador}>{n}</span>
              </button>
            )
          })}
        </div>
        <input
          key={busca}
          defaultValue={busca}
          onBlur={e => setParams({ q: e.target.value.trim() || null })}
          onKeyDown={e => { if (e.key === "Enter") setParams({ q: e.currentTarget.value.trim() || null }) }}
          placeholder="Buscar no calendário"
          aria-label="Buscar no calendário"
          style={S.busca}
        />
      </div>

      {visiveis.length === 0 ? (
        <p style={S.vazio}>Nenhum evento nesta seleção. Ajuste a semana ou os filtros.</p>
      ) : vista === "lista" ? (
        <Timeline eventos={visiveis} de={de} ate={ate} hojeIso={hojeIso} />
      ) : (
        <Grade eventos={visiveis} mes={mesSel} semana={semanaSel} hojeIso={hojeIso} />
      )}

      <p style={S.rodape}>
        {CONFIG_CALENDARIO.instituicao} · ano letivo {CONFIG_CALENDARIO.anoLetivo.rotulo} ·
        {" "}{noEscopoESemFiltro.length} eventos no escopo, {visiveis.length} nesta seleção.
      </p>
    </main>
  )
}

// ── cabeçalho e cronômetro ───────────────────────────────────

function Cabecalho({ escopo }: { escopo: Escopo }) {
  const trilha = [REDE, escopo.unidade, escopo.segmento, escopo.turma].filter(Boolean).join(" · ")
  return (
    <header style={S.cabecalho}>
      <div>
        <p style={S.sobretitulo}>{trilha}</p>
        <h1 style={S.titulo}>Calendário</h1>
        <p style={S.subtitulo}>Ano letivo {CONFIG_CALENDARIO.anoLetivo.rotulo}</p>
      </div>
      {CONFIG_CALENDARIO.formatura.ativo && <Cronometro />}
    </header>
  )
}

function Cronometro() {
  const { dataIso, hora, rotulo } = CONFIG_CALENDARIO.formatura
  const alvo = useMemo(() => {
    const p = partes(dataIso); const [h, mi] = hora.split(":").map(Number)
    return new Date(p.ano, p.mes0, p.dia, h, mi, 0).getTime()
  }, [dataIso, hora])

  // começa nulo para o servidor e o cliente renderizarem o mesmo HTML
  const [restante, setRestante] = useState<number | null>(null)
  useEffect(() => {
    const tick = () => setRestante(Math.max(0, alvo - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [alvo])

  const seg = restante === null ? null : Math.floor(restante / 1000)
  const campos = seg === null ? null : [
    { v: Math.floor(seg / 86400), r: "dias" },
    { v: Math.floor(seg / 3600) % 24, r: "horas" },
    { v: Math.floor(seg / 60) % 60, r: "min" },
    { v: seg % 60, r: "seg" },
  ]

  return (
    <div style={S.cronometro}>
      <p style={S.cronoRotulo}>{rotulo} · {curta(dataIso)}/{partes(dataIso).ano} às {hora.replace(":", "h")}</p>
      <div style={S.cronoCampos} aria-live="off">
        {(campos ?? [{ v: 0, r: "dias" }, { v: 0, r: "horas" }, { v: 0, r: "min" }, { v: 0, r: "seg" }]).map(c => (
          <div key={c.r} style={S.cronoCampo}>
            <span style={{ ...S.cronoNumero, opacity: campos ? 1 : 0.35 }}>
              {campos ? String(c.v).padStart(2, "0") : "--"}
            </span>
            <span style={S.cronoUnidade}>{c.r}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── escopo ───────────────────────────────────────────────────

function SeletorEscopo({ escopo, segmentos, turmas, onChange }: {
  escopo: Escopo
  segmentos: string[]
  turmas: string[]
  onChange: (nivel: "unidade" | "segmento" | "turma", valor: string | null) => void
}) {
  const opcoes: Record<string, string[]> = {
    unidade: HIERARQUIA.map(h => h.unidade),
    segmento: segmentos,
    turma: turmas,
  }
  return (
    <div style={S.escopo}>
      <span style={S.escopoRotulo}>Escopo</span>
      {NIVEIS_ESCOPO.map(n => (
        <label key={n.chave} style={S.escopoCampo}>
          <span style={S.escopoLegenda}>{n.rotulo}</span>
          <select
            value={escopo[n.chave] ?? ""}
            onChange={e => onChange(n.chave, e.target.value || null)}
            style={S.select}
          >
            <option value="">Todas</option>
            {opcoes[n.chave].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      ))}
    </div>
  )
}

// ── próximos eventos ─────────────────────────────────────────

function Destaques({ eventos, hojeIso }: { eventos: EventoCalendario[]; hojeIso: string }) {
  if (eventos.length === 0) return null
  return (
    <section style={S.destaques} aria-label="Próximos eventos">
      <h2 style={S.tituloSecao}>Próximos eventos</h2>
      <div style={S.cards}>
        {eventos.map(e => {
          const dias = diasEntre(hojeIso, e.inicio)
          const quando = dias < 0 ? "em andamento"
            : dias === 0 ? "hoje"
            : dias === 1 ? "amanhã"
            : `em ${dias} dias`
          return (
            <article key={e.id} style={{ ...S.card, borderTopColor: DEF_TIPO[e.tipo].cor }}>
              <p style={S.cardMeta}>{DEF_TIPO[e.tipo].rotulo} · {quando}</p>
              <p style={S.cardTitulo}>{e.titulo}</p>
              <p style={S.cardData}>{faixaCurta(e.inicio, e.fim)}{e.obs ? ` · ${e.obs}` : ""}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

// ── lista (timeline) ─────────────────────────────────────────

function Timeline({ eventos, de, ate, hojeIso }: {
  eventos: EventoCalendario[]; de: string; ate: string; hojeIso: string
}) {
  // um grupo por dia do intervalo que tenha evento — faixas aparecem em todos os dias que cobrem
  const dias: { iso: string; itens: EventoCalendario[] }[] = []
  for (let d = de; d <= ate; d = somaDias(d, 1)) {
    const itens = eventos.filter(e => cobreDia(e, d))
    if (itens.length) dias.push({ iso: d, itens })
  }

  return (
    <ol style={S.timeline}>
      {dias.map(({ iso: dia, itens }) => {
        const hoje = dia === hojeIso
        return (
          <li key={dia} style={S.diaLinha}>
            <div style={S.diaCabecalho}>
              <span style={{ ...S.diaNumero, ...(hoje ? S.diaNumeroHoje : null) }}>{partes(dia).dia}</span>
              <span style={S.diaSemana}>
                {diaSemanaLongo(dia)}{hoje ? " · hoje" : ""}
              </span>
            </div>
            <div style={S.diaEventos}>
              {itens.map(e => {
                const continuacao = e.inicio < dia
                const cor = DEF_TIPO[e.tipo].cor
                const conteudo = (
                  <>
                    <span aria-hidden style={{ ...S.barraTipo, background: cor }} />
                    <span style={S.eventoCorpo}>
                      <span style={S.eventoTitulo}>{e.titulo}</span>
                      <span style={S.eventoMeta}>
                        {DEF_TIPO[e.tipo].rotulo}
                        {e.fim !== e.inicio ? ` · ${faixaCurta(e.inicio, e.fim)}${continuacao ? " · em curso" : ""}` : ""}
                        {e.turno ? ` · ${e.turno}` : ""}
                        {e.turma ? ` · ${e.turma}` : ""}
                        {e.obs ? ` · ${e.obs}` : ""}
                      </span>
                    </span>
                  </>
                )
                return e.href
                  ? <Link key={e.id} href={e.href} style={{ ...S.evento, ...S.eventoLink, opacity: continuacao ? 0.72 : 1 }}>{conteudo}</Link>
                  : <div key={e.id} style={{ ...S.evento, opacity: continuacao ? 0.72 : 1 }}>{conteudo}</div>
              })}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

// ── grade do mês ─────────────────────────────────────────────

function Grade({ eventos, mes, semana, hojeIso }: {
  eventos: EventoCalendario[]; mes: Mes; semana: Semana | null; hojeIso: string
}) {
  const celulas = celulasDaGrade(mes)

  return (
    <div style={S.gradeEnvolucro}>
      <div style={S.grade} role="grid" aria-label={`Grade de ${mes.rotulo}`}>
        {DIAS_CABECALHO.map(d => <div key={d} style={S.gradeCabecalho}>{d}</div>)}
        {celulas.map(dia => {
          const noMes = dia >= mes.inicio && dia <= mes.fim
          const naSemana = !semana || (dia >= semana.inicio && dia <= semana.fim)
          const hoje = dia === hojeIso
          const itens = eventos.filter(e => cobreDia(e, dia))
          return (
            <div key={dia} role="gridcell" style={{
              ...S.celula,
              background: hoje ? "#fff" : noMes ? "var(--cal-superficie)" : "transparent",
              opacity: !noMes ? 0.35 : naSemana ? 1 : 0.4,
              borderColor: hoje ? "var(--cal-ink)" : "rgba(26,25,23,0.10)",
            }}>
              <span style={{ ...S.celulaDia, fontWeight: hoje ? 700 : 500 }}>{partes(dia).dia}</span>
              <div style={S.celulaEventos}>
                {itens.slice(0, 4).map(e => (
                  <span key={e.id} title={`${e.titulo} — ${DEF_TIPO[e.tipo].rotulo}`} style={{
                    ...S.pilula,
                    borderLeftColor: DEF_TIPO[e.tipo].cor,
                    // faixas: sem cantos nas pontas internas, para lerem como um bloco contínuo
                    borderTopLeftRadius: e.inicio < dia ? 0 : 3,
                    borderBottomLeftRadius: e.inicio < dia ? 0 : 3,
                  }}>{e.titulo}</span>
                ))}
                {itens.length > 4 && <span style={S.maisEventos}>+{itens.length - 4}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── estilos ──────────────────────────────────────────────────
// Fundo off-white, tinta quase-preta, uma cor de destaque por tipo.
// Título em serifa editorial, corpo em sans neutra. Sem gradientes.

const S: Record<string, React.CSSProperties> = {
  main: {
    ["--cal-fundo" as string]: "#faf9f5",
    ["--cal-superficie" as string]: "#f2f0e9",
    ["--cal-ink" as string]: "#1a1917",
    ["--cal-ink-60" as string]: "rgba(26,25,23,0.62)",
    maxWidth: 1180, margin: "0 auto", padding: "28px 20px 56px",
    background: "var(--cal-fundo)", color: "var(--cal-ink)",
    fontFamily: "var(--sans, system-ui), sans-serif", fontSize: 15, lineHeight: 1.5,
  },

  cabecalho: { display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22 },
  sobretitulo: { margin: 0, fontSize: 13, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--cal-ink-60)" },
  titulo: { margin: "4px 0 2px", fontFamily: "var(--serif-cfo, Georgia), serif", fontSize: "2.4rem", lineHeight: 1.05, fontWeight: 600 },
  subtitulo: { margin: 0, fontSize: 14, color: "var(--cal-ink-60)" },

  cronometro: { minWidth: 260 },
  cronoRotulo: { margin: "0 0 6px", fontSize: 13, color: "var(--cal-ink-60)" },
  cronoCampos: { display: "flex", gap: 14 },
  cronoCampo: { display: "flex", flexDirection: "column", alignItems: "flex-start" },
  cronoNumero: { fontFamily: "var(--serif-cfo, Georgia), serif", fontSize: "1.9rem", lineHeight: 1, fontVariantNumeric: "tabular-nums" },
  cronoUnidade: { fontSize: 12, color: "var(--cal-ink-60)", marginTop: 2 },

  escopo: { display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end", padding: "12px 0 16px", borderTop: "1px solid rgba(26,25,23,0.12)" },
  escopoRotulo: { fontSize: 13, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--cal-ink-60)", alignSelf: "center" },
  escopoCampo: { display: "flex", flexDirection: "column", gap: 3 },
  escopoLegenda: { fontSize: 13, color: "var(--cal-ink-60)" },
  select: { padding: "7px 10px", fontSize: 14, color: "var(--cal-ink)", background: "#fff", border: "1px solid rgba(26,25,23,0.22)", borderRadius: 6, minWidth: 130 },

  destaques: { margin: "6px 0 26px" },
  tituloSecao: { margin: "0 0 10px", fontFamily: "var(--serif-cfo, Georgia), serif", fontSize: "1.15rem", fontWeight: 600 },
  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 },
  card: { background: "#fff", border: "1px solid rgba(26,25,23,0.10)", borderTop: "3px solid", borderRadius: 8, padding: "13px 15px 15px" },
  cardMeta: { margin: 0, fontSize: 13, color: "var(--cal-ink-60)" },
  cardTitulo: { margin: "5px 0 4px", fontFamily: "var(--serif-cfo, Georgia), serif", fontSize: "1.2rem", lineHeight: 1.2 },
  cardData: { margin: 0, fontSize: 13, color: "var(--cal-ink-60)" },

  abas: { display: "flex", gap: 4, flexWrap: "wrap", borderBottom: "1px solid rgba(26,25,23,0.14)", paddingBottom: 0, marginBottom: 14 },
  aba: { padding: "8px 13px", fontSize: 14, background: "none", border: "none", borderBottom: "2px solid transparent", color: "var(--cal-ink-60)", cursor: "pointer", textTransform: "lowercase" },
  abaAtiva: { color: "var(--cal-ink)", borderBottomColor: "var(--cal-ink)", fontWeight: 600 },
  abaHoje: { color: "var(--cal-ink)" },

  barraSub: { display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  subAbas: { display: "flex", gap: 6, flexWrap: "wrap" },
  subAba: { padding: "6px 12px", fontSize: 13.5, background: "transparent", color: "var(--cal-ink-60)", border: "1px solid rgba(26,25,23,0.16)", borderRadius: 999, cursor: "pointer" },
  subAbaAtiva: { background: "var(--cal-ink)", color: "var(--cal-fundo)", borderColor: "var(--cal-ink)" },

  grupoVista: { display: "flex", border: "1px solid rgba(26,25,23,0.22)", borderRadius: 6, overflow: "hidden" },
  botaoVista: { padding: "6px 14px", fontSize: 13.5, background: "transparent", color: "var(--cal-ink-60)", border: "none", cursor: "pointer" },
  botaoVistaAtivo: { background: "var(--cal-ink)", color: "var(--cal-fundo)" },

  linhaFiltros: { display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  filtros: { display: "flex", gap: 7, flexWrap: "wrap" },
  filtro: { display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px", fontSize: 13.5, border: "1px solid", borderRadius: 999, cursor: "pointer" },
  ponto: { width: 8, height: 8, borderRadius: "50%", display: "inline-block" },
  contador: { fontSize: 12.5, fontVariantNumeric: "tabular-nums", opacity: 0.75 },
  busca: { flex: "1 1 200px", maxWidth: 260, padding: "7px 11px", fontSize: 14, color: "var(--cal-ink)", background: "#fff", border: "1px solid rgba(26,25,23,0.22)", borderRadius: 6 },

  vazio: { padding: "40px 0", fontSize: 15, color: "var(--cal-ink-60)", textAlign: "center", borderTop: "1px solid rgba(26,25,23,0.12)" },

  timeline: { listStyle: "none", margin: 0, padding: 0, borderTop: "1px solid rgba(26,25,23,0.12)" },
  diaLinha: { display: "grid", gridTemplateColumns: "minmax(112px, 150px) 1fr", gap: 16, padding: "16px 0", borderBottom: "1px solid rgba(26,25,23,0.10)" },
  diaCabecalho: { display: "flex", flexDirection: "column" },
  diaNumero: { fontFamily: "var(--serif-cfo, Georgia), serif", fontSize: "2rem", lineHeight: 1, fontVariantNumeric: "tabular-nums" },
  diaNumeroHoje: { textDecoration: "underline", textUnderlineOffset: 5, textDecorationThickness: 2 },
  diaSemana: { fontSize: 13, color: "var(--cal-ink-60)", marginTop: 4 },
  diaEventos: { display: "flex", flexDirection: "column", gap: 8, minWidth: 0 },
  evento: { display: "flex", gap: 11, alignItems: "stretch", minWidth: 0 },
  eventoLink: { textDecoration: "none", color: "inherit" },
  barraTipo: { width: 3, borderRadius: 2, flexShrink: 0 },
  eventoCorpo: { display: "flex", flexDirection: "column", minWidth: 0 },
  eventoTitulo: { fontSize: 16, lineHeight: 1.3 },
  eventoMeta: { fontSize: 13, color: "var(--cal-ink-60)", marginTop: 2 },

  gradeEnvolucro: { overflowX: "auto" },
  grade: { display: "grid", gridTemplateColumns: "repeat(7, minmax(96px, 1fr))", gap: 4, minWidth: 700 },
  gradeCabecalho: { padding: "4px 6px 8px", fontSize: 13, color: "var(--cal-ink-60)", textAlign: "left" },
  celula: { minHeight: 96, padding: "6px 7px", border: "1px solid", borderRadius: 6, display: "flex", flexDirection: "column", gap: 5, overflow: "hidden" },
  celulaDia: { fontSize: 14, fontVariantNumeric: "tabular-nums" },
  celulaEventos: { display: "flex", flexDirection: "column", gap: 3, minWidth: 0 },
  pilula: { fontSize: 13, lineHeight: 1.25, padding: "2px 5px", background: "#fff", borderLeft: "3px solid", borderRadius: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  maisEventos: { fontSize: 12.5, color: "var(--cal-ink-60)" },

  rodape: { marginTop: 26, paddingTop: 14, borderTop: "1px solid rgba(26,25,23,0.12)", fontSize: 13, color: "var(--cal-ink-60)" },
}
