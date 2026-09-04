"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { CALENDARIO_ATUALIZADO_EM, MENSAGEM_SECAO_PROVAS } from "@/lib/calendario-provas"
import {
  construirAgenda,
  cobreDia,
  normalizar,
  COR_TIPO,
  ROTULO_TIPO,
  type ItemAgenda,
  type TipoAgenda,
} from "@/lib/agenda-cfo"
import {
  MAPA_EQUIPES,
  ORDEM_GRUPOS,
  ROTULO_GRUPO,
  ROTULO_FUNCAO,
  rotuloMilitar,
  type Grupo,
  type MesEscala,
  type ChaveFuncao,
} from "@/lib/escalas-cia"

const DIAS_CABECALHO = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"]
const MESES_NOME = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]
const DIAS_LONGO = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"]
const TIPOS: TipoAgenda[] = ["prova", "evento", "plantao", "funcao"]

export type DadosCalendario = {
  hojeIso: string
  nomeDisciplina: Record<string, string>
  minhaMatricula: number
  meuGrupo: Grupo | null
  mes: MesEscala
}

// ── utilidades de data (tudo em ISO local, sem Date UTC) ─────

function iso(ano: number, mes0: number, dia: number) {
  return `${ano}-${String(mes0 + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
}
function partes(s: string) {
  const [a, m, d] = s.split("-").map(Number)
  return { ano: a, mes0: m - 1, dia: d }
}
/** 0 = segunda … 6 = domingo */
function diaSemanaSeg(s: string) {
  const { ano, mes0, dia } = partes(s)
  return (new Date(ano, mes0, dia).getDay() + 6) % 7
}
function diaSemanaLongo(s: string) {
  const { ano, mes0, dia } = partes(s)
  return DIAS_LONGO[new Date(ano, mes0, dia).getDay()]
}
function curta(s: string) {
  const { mes0, dia } = partes(s)
  return `${String(dia).padStart(2, "0")}/${String(mes0 + 1).padStart(2, "0")}`
}
function somaDias(s: string, n: number) {
  const { ano, mes0, dia } = partes(s)
  const d = new Date(ano, mes0, dia + n)
  return iso(d.getFullYear(), d.getMonth(), d.getDate())
}

export function CalendarioClient({ hojeIso, nomeDisciplina, minhaMatricula, meuGrupo, mes }: DadosCalendario) {
  const itens = useMemo(
    () => construirAgenda({ mes, matricula: minhaMatricula, meuGrupo, nomeDisciplina }),
    [mes, minhaMatricula, meuGrupo, nomeDisciplina],
  )

  const [busca, setBusca] = useState("")
  const [tiposOn, setTiposOn] = useState<Set<TipoAgenda>>(new Set(TIPOS))
  const [soMeu, setSoMeu] = useState(false)
  const [refIso, setRefIso] = useState(hojeIso) // mês mostrado na grade
  const [diaSel, setDiaSel] = useState<string | null>(null)
  const [verPassado, setVerPassado] = useState(false)
  const [verEscalas, setVerEscalas] = useState(false)

  const agendaRef = useRef<HTMLDivElement>(null)

  const termo = normalizar(busca.trim())
  const filtrados = useMemo(
    () => itens.filter(i =>
      tiposOn.has(i.tipo) &&
      (!soMeu || i.meu) &&
      (!termo || i.busca.includes(termo))
    ),
    [itens, tiposOn, soMeu, termo],
  )

  // agrupa por dia âncora, respeitando o filtro
  const porDiaCompleto = useMemo(() => {
    const m = new Map<string, ItemAgenda[]>()
    for (const i of filtrados) (m.get(i.data) ?? m.set(i.data, []).get(i.data)!).push(i)
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtrados])

  // por padrão a agenda começa em hoje; buscar revela tudo
  const mostrarTudo = verPassado || !!termo
  const porDia = useMemo(
    () => mostrarTudo
      ? porDiaCompleto
      : porDiaCompleto.filter(([, lista]) => lista.some(i => (i.fim ?? i.data) >= hojeIso)),
    [porDiaCompleto, mostrarTudo, hojeIso],
  )
  const qtdePassado = porDiaCompleto.length - porDia.length

  const alternaTipo = (t: TipoAgenda) => {
    const s = new Set(tiposOn)
    if (s.has(t)) s.delete(t); else s.add(t)
    setTiposOn(s.size ? s : new Set(TIPOS))
  }

  const irParaDia = (d: string) => {
    setDiaSel(d === diaSel ? null : d)
    if (d < hojeIso) setVerPassado(true) // o dia clicado precisa estar na lista
    requestAnimationFrame(() => {
      const alvo = document.getElementById(`dia-${d}`) ?? agendaRef.current
      alvo?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 24px" }}>
      <Link href="/inicio" style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
        ← Voltar
      </Link>

      <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
        <div>
          <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.9rem", color: "var(--olive)", margin: 0 }}>
            Calendário
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink-60)", margin: "2px 0 0" }}>
            Provas, eventos e escalas da 1ª CIA · CFO 2026
          </p>
        </div>
        <button
          onClick={() => setVerEscalas(v => !v)}
          style={{ ...botao, background: verEscalas ? "var(--olive)" : "var(--surface)", color: verEscalas ? "var(--canvas)" : "var(--ink-60)" }}
        >
          {verEscalas ? "← Agenda" : "Escalas completas"}
        </button>
      </header>

      {verEscalas ? (
        <Escalas mes={mes} minhaMatricula={minhaMatricula} meuGrupo={meuGrupo} hojeIso={hojeIso} />
      ) : (
        <>
          <Grade
            refIso={refIso}
            hojeIso={hojeIso}
            diaSel={diaSel}
            itens={filtrados}
            onMes={n => setRefIso(somaMes(refIso, n))}
            onHoje={() => { setRefIso(hojeIso); irParaDia(hojeIso) }}
            onDia={irParaDia}
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", margin: "16px 0 6px" }}>
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar matéria, nome, matrícula…"
              style={{
                flex: "1 1 220px", minWidth: 0, padding: "9px 13px", borderRadius: 999,
                border: "1px solid var(--surface)", background: "var(--surface)",
                color: "var(--ink)", fontSize: 14, outline: "none",
              }}
            />
            {busca && (
              <button onClick={() => setBusca("")} style={{ ...botao, background: "var(--surface)", color: "var(--ink-60)" }}>
                limpar
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {TIPOS.map(t => {
              const on = tiposOn.has(t)
              return (
                <button key={t} onClick={() => alternaTipo(t)} style={{ ...pill, opacity: on ? 1 : 0.45, borderColor: COR_TIPO[t], color: on ? "var(--canvas)" : COR_TIPO[t], background: on ? COR_TIPO[t] : "transparent" }}>
                  {ROTULO_TIPO[t]}
                </button>
              )
            })}
            <button
              onClick={() => setSoMeu(v => !v)}
              style={{ ...pill, borderColor: "var(--olive)", background: soMeu ? "var(--olive)" : "transparent", color: soMeu ? "var(--canvas)" : "var(--olive)" }}
            >
              ★ só o meu
            </button>
          </div>

          <div ref={agendaRef}>
            {!termo && (qtdePassado > 0 || verPassado) && (
              <button
                onClick={() => setVerPassado(v => !v)}
                style={{ ...botao, background: "transparent", color: "var(--ink-60)", padding: "4px 0", marginBottom: 10, textDecoration: "underline" }}
              >
                {verPassado ? "ocultar dias anteriores" : `mostrar ${qtdePassado} dia(s) anterior(es)`}
              </button>
            )}
            <Agenda porDia={porDia} hojeIso={hojeIso} diaSel={diaSel} temFiltro={!!termo || soMeu || tiposOn.size < TIPOS.length} />
          </div>

          <details style={{ ...cartao, marginTop: 20 }}>
            <summary style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--gold)", letterSpacing: 0.3, textTransform: "uppercase" }}>
              Recado da Seção de Provas · {CALENDARIO_ATUALIZADO_EM}
            </summary>
            {MENSAGEM_SECAO_PROVAS.map((p, i) => (
              <p key={i} style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink)", margin: "10px 0 0" }}>{p}</p>
            ))}
          </details>
        </>
      )}

      <footer style={{ marginTop: 36, fontSize: 13, color: "var(--ink-60)", textAlign: "center" }}>
        Desenvolvido por AL CFO PM 108 LISANDRY
      </footer>
    </main>
  )
}

function somaMes(refIso: string, n: number) {
  const { ano, mes0 } = partes(refIso)
  const d = new Date(ano, mes0 + n, 1)
  return iso(d.getFullYear(), d.getMonth(), 1)
}

// ── grade do mês ─────────────────────────────────────────────

function Grade({ refIso, hojeIso, diaSel, itens, onMes, onHoje, onDia }: {
  refIso: string; hojeIso: string; diaSel: string | null; itens: ItemAgenda[]
  onMes: (n: number) => void; onHoje: () => void; onDia: (d: string) => void
}) {
  const { ano, mes0 } = partes(refIso)
  const primeiro = iso(ano, mes0, 1)
  const ultimoDia = new Date(ano, mes0 + 1, 0).getDate()

  // a grade começa na segunda da semana do dia 1 e cobre semanas inteiras
  const inicioGrade = somaDias(primeiro, -diaSemanaSeg(primeiro))
  const semanas: string[][] = []
  for (let s = 0; s < 6; s++) {
    const linha = Array.from({ length: 7 }, (_, i) => somaDias(inicioGrade, s * 7 + i))
    semanas.push(linha)
    if (linha[6] >= iso(ano, mes0, ultimoDia)) break
  }

  return (
    <section style={{ ...cartao, padding: 14, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
        <span style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.15rem", color: "var(--olive)", textTransform: "capitalize" }}>
          {MESES_NOME[mes0]} {ano}
        </span>
        <span style={{ display: "flex", gap: 6 }}>
          <button onClick={() => onMes(-1)} aria-label="Mês anterior" style={navBtn}>‹</button>
          <button onClick={onHoje} style={{ ...navBtn, width: "auto", padding: "0 12px", fontSize: 13, fontWeight: 600 }}>hoje</button>
          <button onClick={() => onMes(1)} aria-label="Próximo mês" style={navBtn}>›</button>
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
        {DIAS_CABECALHO.map(d => (
          <span key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--ink-60)" }}>
            {d}
          </span>
        ))}
      </div>

      {semanas.map((semana, si) => {
        // faixa de provas: itens com intervalo que cobrem esta semana
        const faixas = itens.filter(i => i.fim && semana.some(d => cobreDia(i, d)))
        return (
          <div key={si} style={{ marginBottom: 4 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
              {semana.map(d => {
                const doMes = partes(d).mes0 === mes0
                const ehHoje = d === hojeIso
                const sel = d === diaSel
                const doDia = itens.filter(i => !i.fim && cobreDia(i, d))
                const tipos = [...new Set(doDia.map(i => i.tipo))]
                const temMeu = doDia.some(i => i.meu)
                return (
                  <button
                    key={d}
                    onClick={() => onDia(d)}
                    style={{
                      aspectRatio: "1 / 1", display: "flex", flexDirection: "column", alignItems: "center",
                      justifyContent: "center", gap: 3, border: ehHoje ? "2px solid var(--olive)" : "1px solid transparent",
                      borderRadius: 10, cursor: "pointer", font: "inherit",
                      background: sel ? "var(--olive)" : "transparent",
                      color: sel ? "var(--canvas)" : doMes ? "var(--ink)" : "var(--ink-60)",
                      opacity: doMes ? 1 : 0.4,
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: ehHoje || temMeu ? 700 : 500, lineHeight: 1 }}>
                      {partes(d).dia}
                    </span>
                    <span style={{ display: "flex", gap: 2, height: 5 }}>
                      {tipos.slice(0, 4).map(t => (
                        <span key={t} style={{ width: 5, height: 5, borderRadius: "50%", background: sel ? "var(--canvas)" : COR_TIPO[t] }} />
                      ))}
                    </span>
                  </button>
                )
              })}
            </div>
            {faixas.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, margin: "3px 2px 0" }}>
                {faixas.map(f => {
                  const neutro = !f.href // "Sem avaliação teórica" não linka para memento
                  return (
                    <span
                      key={f.id}
                      style={{
                        padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                        letterSpacing: 0.2,
                        color: neutro ? "var(--ink-60)" : COR_TIPO[f.tipo],
                        background: neutro ? "var(--canvas)" : `${COR_TIPO[f.tipo]}24`,
                      }}
                    >
                      {f.titulo}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10, fontSize: 11.5, color: "var(--ink-60)" }}>
        {TIPOS.map(t => (
          <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: COR_TIPO[t] }} />
            {ROTULO_TIPO[t]}
          </span>
        ))}
      </div>
    </section>
  )
}

// ── agenda ───────────────────────────────────────────────────

function Agenda({ porDia, hojeIso, diaSel, temFiltro }: {
  porDia: [string, ItemAgenda[]][]; hojeIso: string; diaSel: string | null; temFiltro: boolean
}) {
  if (!porDia.length) {
    return (
      <p style={{ ...cartao, fontSize: 14, color: "var(--ink-60)", margin: 0 }}>
        {temFiltro ? "Nada encontrado com esses filtros." : "Nada na agenda."}
      </p>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {porDia.map(([dia, lista]) => {
        const ehHoje = dia === hojeIso
        const sel = dia === diaSel
        return (
          <section key={dia} id={`dia-${dia}`} style={{ scrollMarginTop: 16 }}>
            <h2 style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", margin: "0 0 8px", fontSize: 13, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: sel || ehHoje ? "var(--olive)" : "var(--ink-60)" }}>
              {ehHoje && <span style={{ background: "var(--olive)", color: "var(--canvas)", borderRadius: 999, padding: "2px 8px" }}>hoje</span>}
              <span>{curta(dia)}</span>
              <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>{diaSemanaLongo(dia)}</span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {lista.map(i => (
                <article
                  key={i.id}
                  style={{
                    display: "flex", gap: 10, padding: "11px 14px", borderRadius: 10,
                    background: "var(--surface)", borderLeft: `3px solid ${COR_TIPO[i.tipo]}`,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>{i.titulo}</span>
                      {i.meu && (
                        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--canvas)", background: "var(--olive)", borderRadius: 999, padding: "2px 7px" }}>
                          seu
                        </span>
                      )}
                      {i.fim && (
                        <span style={{ fontSize: 11.5, color: "var(--ink-60)" }}>
                          semana de {curta(i.data)} a {curta(i.fim)}
                        </span>
                      )}
                    </div>
                    {i.destaque && (
                      <p style={{ margin: "3px 0 0", fontSize: 13, fontWeight: 600, color: "var(--olive)" }}>{i.destaque}</p>
                    )}
                    {i.sub && (
                      <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--ink-60)", lineHeight: 1.45 }}>{i.sub}</p>
                    )}
                  </div>
                  {i.href && (
                    <Link href={i.href} style={{ flexShrink: 0, alignSelf: "center", fontSize: 13, fontWeight: 600, color: "var(--olive)", textDecoration: "none", whiteSpace: "nowrap" }}>
                      Memento →
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

// ── escalas completas (tabelas de referência) ────────────────

function Escalas({ mes, minhaMatricula, meuGrupo, hojeIso }: {
  mes: MesEscala; minhaMatricula: number; meuGrupo: Grupo | null; hojeIso: string
}) {
  const [grupoAberto, setGrupoAberto] = useState<Grupo | null>(meuGrupo)
  const chaves = Object.keys(ROTULO_FUNCAO) as ChaveFuncao[]

  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ fontSize: 13, color: "var(--ink-60)", margin: "0 0 14px" }}>
        1ª Companhia · {mes.rotulo} · escala 7x1, plantão de 07h às 07h
      </p>

      <h2 style={secTitulo}>Escala de plantão</h2>
      <div style={{ ...cartao, padding: 0, overflowX: "auto" }}>
        <table style={tabela}>
          <thead>
            <tr>{["Data", "Plantão", "Auxiliar", "Adjunto", "Sobreaviso"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {mes.plantao.map(p => {
              const ehHoje = p.data === hojeIso
              const meu = meuGrupo === p.grupo
              return (
                <tr key={p.data} style={{ background: ehHoje ? "var(--canvas)" : undefined }}>
                  <td style={{ ...td, fontWeight: ehHoje ? 700 : 400 }}>{curta(p.data)}</td>
                  <td style={{ ...td, color: meu ? "var(--olive)" : undefined, fontWeight: meu ? 700 : 400 }}>{ROTULO_GRUPO[p.grupo]}</td>
                  <td style={td}>{rotuloMilitar(p.auxiliar)}</td>
                  <td style={td}>{rotuloMilitar(p.adjunto)}</td>
                  <td style={{ ...td, color: "var(--ink-60)" }}>{p.sobreaviso.map(rotuloMilitar).join(" · ")}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {mes.obs.map((o, i) => (
        <p key={i} style={{ fontSize: 13, color: "var(--ink-60)", margin: "10px 0 0" }}><strong>Obs.:</strong> {o}</p>
      ))}

      <h2 style={secTitulo}>Funções nas formaturas</h2>
      <div style={{ ...cartao, padding: 0, overflowX: "auto" }}>
        <table style={tabela}>
          <thead>
            <tr>
              <th style={th}>Data</th>
              {chaves.map(k => <th key={k} style={th}>{ROTULO_FUNCAO[k]}</th>)}
            </tr>
          </thead>
          <tbody>
            {mes.funcoes.map(f => (
              <tr key={f.data} style={{ background: f.data === hojeIso ? "var(--canvas)" : undefined }}>
                <td style={td}>{curta(f.data)}</td>
                {chaves.map(k => (
                  <td key={k} style={{ ...td, fontWeight: f[k] === minhaMatricula ? 700 : 400, color: f[k] === minhaMatricula ? "var(--olive)" : undefined }}>
                    {rotuloMilitar(f[k])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={secTitulo}>Mapa de equipes</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ORDEM_GRUPOS.map(g => {
          const membros = MAPA_EQUIPES[g]
          const aberto = grupoAberto === g
          return (
            <section key={g} style={{ ...cartao, padding: 0, overflow: "hidden" }}>
              <button
                onClick={() => setGrupoAberto(aberto ? null : g)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", font: "inherit" }}
              >
                <span style={{ fontWeight: 700, fontSize: 14.5, color: g === meuGrupo ? "var(--olive)" : "var(--ink)" }}>
                  {ROTULO_GRUPO[g]}
                  {g === meuGrupo && (
                    <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--canvas)", background: "var(--olive)", borderRadius: 999, padding: "2px 7px" }}>
                      seu grupo
                    </span>
                  )}
                </span>
                <span style={{ fontSize: 13, color: "var(--ink-60)" }}>{membros.length} · {aberto ? "−" : "+"}</span>
              </button>
              {aberto && (
                <ul style={{ margin: 0, padding: "0 16px 14px", listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "4px 12px" }}>
                  {membros.map(([mat, nome]) => (
                    <li key={mat} style={{ fontSize: 13.5, color: mat === minhaMatricula ? "var(--olive)" : "var(--ink)", fontWeight: mat === minhaMatricula ? 700 : 400 }}>
                      {mat} {nome}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>

      <h2 style={secTitulo}>Documentos originais</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {mes.docs.map(doc => (
          <a key={doc.arquivo} href={doc.arquivo} target="_blank" rel="noopener noreferrer"
             style={{ ...cartao, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, textDecoration: "none" }}>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>{doc.titulo}</span>
              <span style={{ display: "block", fontSize: 13, color: "var(--ink-60)" }}>{doc.descricao}</span>
            </span>
            <span style={{ flexShrink: 0, fontSize: 13.5, fontWeight: 600, color: "var(--olive)" }}>PDF →</span>
          </a>
        ))}
      </div>

      <p style={{ fontSize: 12.5, color: "var(--ink-60)", marginTop: 18 }}>
        Transcrito dos documentos assinados pelo Comandante da 1ª CIA. Em caso de divergência, vale o PDF original.
        A Guarda-Bandeira está apenas em PDF por ser nominal a cada formatura.
      </p>
    </div>
  )
}

// ── estilos compartilhados ───────────────────────────────────

const cartao: React.CSSProperties = { padding: 16, borderRadius: 12, background: "var(--surface)" }
const botao: React.CSSProperties = { padding: "8px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, font: "inherit" }
const pill: React.CSSProperties = { padding: "5px 12px", borderRadius: 999, border: "1px solid", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }
const navBtn: React.CSSProperties = { width: 30, height: 30, borderRadius: 8, border: "none", background: "var(--canvas)", color: "var(--olive)", cursor: "pointer", fontSize: 18, lineHeight: 1 }
const secTitulo: React.CSSProperties = { fontFamily: "var(--serif-cfo)", fontSize: "1.15rem", color: "var(--olive)", margin: "26px 0 12px" }
const tabela: React.CSSProperties = { borderCollapse: "collapse", width: "100%", fontSize: 13.5, minWidth: 560 }
const th: React.CSSProperties = { padding: "10px 12px", textAlign: "left", fontSize: 11.5, fontWeight: 700, letterSpacing: 0.3, textTransform: "uppercase", color: "var(--ink-60)", whiteSpace: "nowrap", borderBottom: "1px solid var(--canvas)" }
const td: React.CSSProperties = { padding: "9px 12px", borderTop: "1px solid var(--canvas)", verticalAlign: "top" }
