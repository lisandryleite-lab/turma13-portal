"use client"

// Painel das escalas da 1ª CIA (plantão, funções nas formaturas e
// guarda-bandeira), lido de lib/escalas-cia. Usado na página /escalas-cia do
// portal e na aba Escalas da Turma 13.

import { useMemo, useState } from "react"
import {
  MESES_ESCALA, ROTULO_FUNCAO, ROTULO_GRUPO, compromissosDaMatricula, escalaDoDia, grupoDaMatricula,
  mesVigente, nomeDaMatricula, rotuloMilitar, type ChaveFuncao, type CompromissoAluno, type Grupo,
} from "@/lib/escalas-cia"

const COR_GRUPO: Record<Grupo, string> = {
  GOLF: "#15803D", HOTEL: "#B91C1C", INDIA: "#1D4ED8", JULIETT: "#B45309",
  KILO: "#7E22CE", LIMA: "#0F766E", MIKE: "#BE185D", NOVEMBER: "#4D7C0F",
}
const DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]
const ROTULO_TIPO: Record<CompromissoAluno["tipo"], string> = {
  plantao: "🛡 Plantão", auxiliar: "⭐ Auxiliar", adjunto: "⭐ Adjunto", sobreaviso: "📟 Sobreaviso",
  funcao: "🎖 Formatura", guarda: "🚩 Guarda-Bandeira",
}

const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
function diaSemana(iso: string) {
  const [a, m, d] = iso.split("-").map(Number)
  return DIAS_SEMANA[new Date(a, m - 1, d).getDay()]
}
const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`
function diasDoMes(inicio: string, fim: string): string[] {
  const out: string[] = []
  const [a, m] = inicio.split("-").map(Number)
  const ultimo = Number(fim.slice(8, 10))
  for (let d = 1; d <= ultimo; d++) out.push(`${a}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`)
  return out
}

const cartao: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid rgba(58,74,58,0.14)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: 18 }
const tituloSecao: React.CSSProperties = { fontSize: 11.5, fontWeight: 700, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }

function Pessoa({ mat, eu, destaque }: { mat: number; eu: boolean; destaque?: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: destaque ? "6px 12px" : "4px 10px", borderRadius: 999,
      fontSize: destaque ? 14 : 13, fontWeight: eu || destaque ? 700 : 500,
      background: eu ? "var(--gold)" : destaque ? "var(--surface)" : "#f6f4ec", color: eu ? "#fff" : "var(--ink)",
      border: eu ? "none" : "1px solid rgba(58,74,58,0.12)",
    }}>
      {rotuloMilitar(mat)}{eu ? " · você" : ""}
    </span>
  )
}

export function EscalaCiaPainel({ hojeIso, minhaMatricula }: { hojeIso: string; minhaMatricula: number }) {
  const mesAtual = mesVigente(hojeIso)
  const [mesChave, setMesChave] = useState(mesAtual.chave)
  const mes = MESES_ESCALA.find(m => m.chave === mesChave) ?? mesAtual
  const [sel, setSel] = useState(hojeIso >= mes.inicio && hojeIso <= mes.fim ? hojeIso : mes.inicio)
  const [verEquipe, setVerEquipe] = useState(false)
  const [busca, setBusca] = useState("")
  const [pessoa, setPessoa] = useState<number | null>(null)

  const meus = useMemo(() => compromissosDaMatricula(minhaMatricula), [minhaMatricula])
  const meusDias = new Set(meus.map(c => c.data))
  const proximos = meus.filter(c => c.data >= hojeIso)
  const minhaEquipe = grupoDaMatricula(minhaMatricula, mesAtual)

  const dia = escalaDoDia(sel)
  const p = dia.plantao

  // busca por nome ou matrícula entre todos os nomes dos documentos
  const candidatos = useMemo(() => {
    const termo = semAcento(busca.trim())
    if (termo.length < 2) return []
    const vistos = new Map<number, string>()
    for (const m of MESES_ESCALA) for (const membros of Object.values(m.mapa)) for (const [mat, nome] of membros) vistos.set(mat, nome)
    return [...vistos.entries()]
      .filter(([mat, nome]) => semAcento(`${mat} ${nome}`).includes(termo))
      .sort((a, b) => a[0] - b[0]).slice(0, 12)
  }, [busca])

  const trocarMes = (chave: string) => {
    const m = MESES_ESCALA.find(x => x.chave === chave)!
    setMesChave(chave); setVerEquipe(false)
    setSel(hojeIso >= m.inicio && hojeIso <= m.fim ? hojeIso : m.inicio)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Minhas escalas ── */}
      <section style={{ ...cartao, background: "linear-gradient(135deg, #3a4a3a 0%, #45573f 60%, #4f6347 100%)", color: "#fff", border: "none" }}>
        <p style={{ ...tituloSecao, color: "rgba(255,255,255,0.7)" }}>Minhas escalas</p>
        <p style={{ margin: "0 0 12px", fontSize: 14, color: "rgba(255,255,255,0.88)" }}>
          {nomeDaMatricula(minhaMatricula) ? <strong>{rotuloMilitar(minhaMatricula)}</strong> : <>Mat. {minhaMatricula}</>}
          {" · "}equipe {minhaEquipe ? <strong style={{ color: "#e0c979" }}>{ROTULO_GRUPO[minhaEquipe]}</strong> : "não consta no mapa do mês"}
        </p>
        {proximos.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13.5, color: "rgba(255,255,255,0.75)" }}>Nenhuma escala sua daqui pra frente nos meses publicados.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {proximos.slice(0, 6).map((c, i) => (
              <button key={i} onClick={() => { const m = MESES_ESCALA.find(x => c.data >= x.inicio && c.data <= x.fim); if (m && m.chave !== mesChave) setMesChave(m.chave); setSel(c.data) }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
                  background: c.data === hojeIso ? "rgba(224,201,121,0.25)" : "rgba(255,255,255,0.10)", color: "#fff" }}>
                <span style={{ width: 78, flexShrink: 0, whiteSpace: "nowrap", fontSize: 13, fontWeight: 700, color: "#e0c979" }}>
                  {c.data === hojeIso ? "HOJE" : `${diaSemana(c.data)} ${ddmm(c.data)}`}
                </span>
                <span style={{ fontSize: 13.5 }}>{c.descricao}</span>
              </button>
            ))}
            {proximos.length > 6 && <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.65)" }}>+ {proximos.length - 6} depois destas</p>}
          </div>
        )}
      </section>

      {/* ── Navegação pelos dias ── */}
      <section style={cartao}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--olive)" }}>{mes.rotulo}</h2>
          <div style={{ display: "flex", gap: 6 }}>
            {MESES_ESCALA.map(m => (
              <button key={m.chave} onClick={() => trocarMes(m.chave)}
                style={{ padding: "5px 11px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600,
                  background: m.chave === mesChave ? "var(--olive)" : "var(--surface)", color: m.chave === mesChave ? "var(--canvas)" : "var(--ink-60)" }}>
                {m.rotulo.split(" ")[0].slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, scrollSnapType: "x proximity" }}>
          {diasDoMes(mes.inicio, mes.fim).map(iso => {
            const ativo = iso === sel
            const ehHoje = iso === hojeIso
            const g = mes.plantao.find(x => x.data === iso)?.grupo ?? null
            return (
              <button key={iso} onClick={() => { setSel(iso); setVerEquipe(false) }}
                style={{ flexShrink: 0, width: 50, padding: "7px 0 6px", borderRadius: 12, cursor: "pointer", scrollSnapAlign: "center",
                  border: ehHoje && !ativo ? "1.5px solid var(--gold)" : "1px solid rgba(58,74,58,0.12)",
                  background: ativo ? "var(--olive)" : "#fff", color: ativo ? "var(--canvas)" : "var(--ink)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: 10.5, textTransform: "uppercase", opacity: 0.75 }}>{diaSemana(iso)}</span>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{iso.slice(8, 10)}</span>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: meusDias.has(iso) ? "var(--gold)" : g ? COR_GRUPO[g] : "transparent", opacity: meusDias.has(iso) ? 1 : 0.5 }} />
              </button>
            )
          })}
        </div>
        <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "var(--ink-60)" }}>● dourado = dia com escala sua · ● colorido = equipe de plantão</p>
      </section>

      {/* ── Detalhe do dia ── */}
      <section style={cartao}>
        <p style={{ ...tituloSecao, color: sel === hojeIso ? "var(--gold)" : "var(--ink-60)" }}>
          {sel === hojeIso ? "Hoje" : "Dia selecionado"} · {diaSemana(sel)} {ddmm(sel)}
        </p>

        {/* Plantão */}
        <h3 style={{ margin: "6px 0 10px", fontSize: 15, color: "var(--olive)" }}>Plantão <span style={{ fontWeight: 400, fontSize: 12.5, color: "var(--ink-60)" }}>07h às 07h</span></h3>
        {!dia.mes ? (
          <p style={{ margin: 0, fontSize: 14, color: "var(--ink-60)" }}>Escala deste mês ainda não publicada.</p>
        ) : !p?.grupo ? (
          <p style={{ margin: 0, fontSize: 14, color: "var(--ink-60)" }}>Sem plantão neste dia.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ padding: "6px 14px", borderRadius: 999, background: COR_GRUPO[p.grupo], color: "#fff", fontWeight: 800, letterSpacing: "0.04em", fontSize: 14 }}>
                {ROTULO_GRUPO[p.grupo]}
              </span>
              <button onClick={() => setVerEquipe(v => !v)} style={{ background: "none", border: "none", color: "var(--olive)", fontWeight: 600, fontSize: 13, cursor: "pointer", padding: 0 }}>
                {verEquipe ? "ocultar equipe" : `ver equipe (${dia.equipe.length})`} {verEquipe ? "▴" : "▾"}
              </button>
            </div>
            {verEquipe && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {dia.equipe.map(([mat]) => <Pessoa key={mat} mat={mat} eu={mat === minhaMatricula} />)}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              <div>
                <p style={tituloSecao}>Auxiliar do Oficial de Dia</p>
                {p.auxiliar ? <Pessoa mat={p.auxiliar} eu={p.auxiliar === minhaMatricula} destaque /> : "—"}
              </div>
              <div>
                <p style={tituloSecao}>Adjunto ao Auxiliar</p>
                {p.adjunto ? <Pessoa mat={p.adjunto} eu={p.adjunto === minhaMatricula} destaque /> : "—"}
              </div>
            </div>
            {p.sobreaviso.length > 0 && (
              <div>
                <p style={tituloSecao}>Sobreaviso</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {p.sobreaviso.map(mat => <Pessoa key={mat} mat={mat} eu={mat === minhaMatricula} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Funções */}
        <div style={{ borderTop: "1px solid var(--surface)", margin: "16px 0 12px" }} />
        <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "var(--olive)" }}>Funções na formatura</h3>
        {!dia.funcoes ? (
          <p style={{ margin: 0, fontSize: 14, color: "var(--ink-60)" }}>Sem funções escaladas neste dia.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {(Object.keys(ROTULO_FUNCAO) as ChaveFuncao[]).map(k => (
              <div key={k}>
                <p style={tituloSecao}>{ROTULO_FUNCAO[k]}</p>
                <Pessoa mat={dia.funcoes![k]} eu={dia.funcoes![k] === minhaMatricula} destaque />
              </div>
            ))}
          </div>
        )}

        {/* Guarda-bandeira */}
        {dia.guarda && (
          <>
            <div style={{ borderTop: "1px solid var(--surface)", margin: "16px 0 12px" }} />
            <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "var(--olive)" }}>🚩 Guarda-Bandeira <span style={{ fontWeight: 400, fontSize: 12.5, color: "var(--ink-60)" }}>{dia.guarda.pelotao}º Pelotão · formatura geral</span></h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {dia.guarda.membros.map((x, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "6px 10px", borderRadius: 8, fontSize: 13.5,
                  background: x.mat === minhaMatricula ? "rgba(181,147,63,0.18)" : i % 2 ? "transparent" : "#f8f6ef", fontWeight: x.mat === minhaMatricula ? 700 : 400 }}>
                  <span>{x.mat} {x.nome}{x.mat === minhaMatricula ? " · você" : ""}</span>
                  <span style={{ color: x.funcao === "Guarda" ? "var(--ink-60)" : "var(--olive)", fontWeight: x.funcao === "Guarda" ? 400 : 600, textAlign: "right" }}>{x.funcao}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── Procurar alguém ── */}
      <section style={cartao}>
        <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "var(--olive)" }}>Procurar escala de alguém</h3>
        <input value={busca} onChange={e => { setBusca(e.target.value); setPessoa(null) }} placeholder="🔍 Nome de guerra ou matrícula"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(58,74,58,0.3)", background: "#fff", color: "var(--ink)", fontSize: 15 }} />
        {candidatos.length > 0 && pessoa == null && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {candidatos.map(([mat]) => (
              <button key={mat} onClick={() => setPessoa(mat)} style={{ padding: "5px 11px", borderRadius: 999, border: "1px solid rgba(58,74,58,0.2)", background: "#fff", cursor: "pointer", fontSize: 13 }}>
                {rotuloMilitar(mat)}
              </button>
            ))}
          </div>
        )}
        {pessoa != null && (() => {
          const lista = compromissosDaMatricula(pessoa)
          const g = grupoDaMatricula(pessoa, mesAtual)
          return (
            <div style={{ marginTop: 12 }}>
              <p style={{ margin: "0 0 8px", fontSize: 14 }}>
                <strong>{rotuloMilitar(pessoa)}</strong> · equipe {g ? ROTULO_GRUPO[g] : "—"}
                <button onClick={() => setPessoa(null)} style={{ marginLeft: 8, background: "none", border: "none", color: "var(--olive)", cursor: "pointer", fontSize: 12.5 }}>trocar</button>
              </p>
              {lista.filter(c => c.tipo !== "plantao").length === 0 && <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-60)" }}>Sem funções individuais nos meses publicados (só os plantões da equipe).</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {lista.filter(c => c.tipo !== "plantao").map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, fontSize: 13.5, padding: "5px 8px", borderRadius: 8, background: c.data === hojeIso ? "rgba(181,147,63,0.16)" : "transparent", opacity: c.data < hojeIso ? 0.5 : 1 }}>
                    <span style={{ width: 70, flexShrink: 0, fontWeight: 700, color: "var(--olive)" }}>{diaSemana(c.data)} {ddmm(c.data)}</span>
                    <span>{ROTULO_TIPO[c.tipo]} · {c.descricao}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </section>

      {/* ── Documentos e observações ── */}
      <section style={cartao}>
        <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "var(--olive)" }}>Documentos originais · {mes.rotulo}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
          {mes.docs.map(d => (
            <a key={d.arquivo} href={d.arquivo} target="_blank" rel="noopener noreferrer"
              style={{ display: "block", padding: "10px 12px", borderRadius: 10, background: "var(--surface)", textDecoration: "none", color: "var(--ink)" }}>
              <strong style={{ fontSize: 13.5, color: "var(--olive)" }}>📄 {d.titulo}</strong>
              <span style={{ display: "block", fontSize: 12, color: "var(--ink-60)", marginTop: 2 }}>{d.descricao}</span>
            </a>
          ))}
        </div>
        {mes.obs.map((o, i) => (
          <p key={i} style={{ margin: "12px 0 0", fontSize: 12.5, color: "var(--ink-60)", lineHeight: 1.5 }}>Obs.: {o}</p>
        ))}
        <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "var(--ink-60)" }}>Transcrito dos documentos da 1ª CIA. Em caso de divergência, vale o PDF.</p>
      </section>
    </div>
  )
}
