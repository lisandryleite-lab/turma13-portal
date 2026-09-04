"use client"

import { useState } from "react"
import Link from "next/link"
import {
  CALENDARIO_PROVAS,
  CALENDARIO_ATUALIZADO_EM,
  MENSAGEM_SECAO_PROVAS,
  linkMemento,
} from "@/lib/calendario-provas"
import { EVENTOS_CFO, dataPorExtenso, dataCurta, diasAte } from "@/lib/eventos-cfo"
import {
  MAPA_EQUIPES,
  ORDEM_GRUPOS,
  ROTULO_GRUPO,
  ROTULO_FUNCAO,
  rotuloMilitar,
  type Grupo,
  type MesEscala,
  type MinhaEscala,
  type ChaveFuncao,
} from "@/lib/escalas-cia"

type Aba = "provas" | "eventos" | "escalas"

const ABAS: [Aba, string][] = [
  ["provas", "Provas"],
  ["eventos", "Eventos"],
  ["escalas", "Escalas da CIA"],
]

const card: React.CSSProperties = { padding: 16, borderRadius: 12, background: "var(--surface)" }
const chip: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase",
  color: "var(--canvas)", background: "var(--olive)", borderRadius: 999, padding: "2px 8px",
}
const secTitulo: React.CSSProperties = {
  fontFamily: "var(--serif-cfo)", fontSize: "1.15rem", color: "var(--olive)", margin: "26px 0 12px",
}

export type DadosCalendario = {
  hojeIso: string
  semanaAtual: number
  nomeDisciplina: Record<string, string>
  minhaMatricula: number
  meuGrupo: Grupo | null
  minhasEscalas: MinhaEscala[]
  mes: MesEscala
}

export function CalendarioClient(d: DadosCalendario) {
  const [aba, setAba] = useState<Aba>("provas")

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
      <Link href="/inicio" style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
        ← Voltar
      </Link>

      <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.9rem", color: "var(--olive)", marginTop: 16, marginBottom: 4 }}>
        Calendário
      </h1>
      <p style={{ fontSize: 13.5, color: "var(--ink-60)", margin: 0 }}>
        Provas, eventos do curso e escalas da 1ª Companhia · CFO 2026
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "22px 0" }}>
        {ABAS.map(([t, rot]) => (
          <button
            key={t}
            onClick={() => setAba(t)}
            style={{
              padding: "8px 14px", borderRadius: 999, border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 600,
              background: aba === t ? "var(--olive)" : "var(--surface)",
              color: aba === t ? "var(--canvas)" : "var(--ink-60)",
            }}
          >
            {rot}
          </button>
        ))}
      </div>

      {aba === "provas" && <Provas semana={d.semanaAtual} nome={d.nomeDisciplina} />}
      {aba === "eventos" && <Eventos hojeIso={d.hojeIso} />}
      {aba === "escalas" && <Escalas {...d} />}

      <footer style={{ marginTop: 40, fontSize: 13, color: "var(--ink-60)", textAlign: "center" }}>
        Desenvolvido por AL CFO PM 108 LISANDRY
      </footer>
    </main>
  )
}

// ── Aba 1: provas ────────────────────────────────────────────

function Provas({ semana, nome }: { semana: number; nome: Record<string, string> }) {
  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--ink-60)", margin: "0 0 14px" }}>
        Planejamento de avaliações escritas · T13–T18 · atualizado em {CALENDARIO_ATUALIZADO_EM}
      </p>

      <section style={{ ...card, borderLeft: "4px solid var(--gold)" }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--gold)", margin: "0 0 10px" }}>
          Recado da Seção de Provas
        </h2>
        {MENSAGEM_SECAO_PROVAS.map((p, i) => (
          <p key={i} style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink)", margin: i === 0 ? 0 : "10px 0 0" }}>
            {p}
          </p>
        ))}
      </section>

      <p style={{ fontSize: 13, color: "var(--ink-60)", margin: "18px 0 14px" }}>
        Toque em <strong>Memento</strong> ao lado de cada matéria para abrir o material dela direto.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {CALENDARIO_PROVAS.map(s => {
          const atual = s.semana === semana
          return (
            <section key={s.semana} style={{ ...card, border: atual ? "2px solid var(--olive)" : "1px solid transparent" }}>
              <header style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                <span style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.1rem", fontWeight: 600, color: "var(--olive)" }}>
                  Semana {s.semana}
                </span>
                <span style={{ fontSize: 13.5, color: "var(--ink-60)" }}>{s.inicio} a {s.fim}</span>
                {atual && <span style={chip}>Semana atual</span>}
              </header>

              {s.semAvaliacao && (
                <p style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink-60)", margin: 0 }}>Sem avaliação teórica</p>
              )}

              {s.provas.map(p => (
                <div key={p.sigla} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "10px 0", borderTop: "1px solid var(--canvas)" }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{p.sigla}</span>
                    {p.avaliacao && <span style={{ marginLeft: 8, fontSize: 11.5, fontWeight: 700, color: "var(--gold)" }}>{p.avaliacao}</span>}
                    <span style={{ display: "block", fontSize: 13, color: "var(--ink-60)" }}>
                      {nome[p.sigla] || p.sigla}
                      {p.siglaPdf && ` · no calendário oficial: ${p.siglaPdf}`}
                    </span>
                  </div>
                  <Link href={linkMemento(p.sigla)} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 999, border: "1px solid var(--olive)", color: "var(--olive)", textDecoration: "none", fontSize: 13.5, fontWeight: 600 }}>
                    Memento →
                  </Link>
                </div>
              ))}

              {s.obs && (
                <p style={{ fontSize: 13, color: "var(--ink-60)", margin: "10px 0 0" }}>
                  <strong>Obs.:</strong> {s.obs}
                </p>
              )}
            </section>
          )
        })}
      </div>

      <p style={{ fontSize: 12.5, color: "var(--ink-60)", marginTop: 18 }}>
        Previsão da Seção de Provas — sujeita a alteração. Confirmações são divulgadas no grupo.
      </p>
    </div>
  )
}

// ── Aba 2: eventos ───────────────────────────────────────────

function Eventos({ hojeIso }: { hojeIso: string }) {
  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--ink-60)", margin: "0 0 14px" }}>
        Solenidades e comemorações do curso. Datas sem confirmação aparecem como previsão.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {EVENTOS_CFO.map(e => {
          const dias = diasAte(e.data, hojeIso)
          const passou = dias < 0
          return (
            <section
              key={e.data + e.titulo}
              style={{ ...card, opacity: passou ? 0.6 : 1, borderLeft: `4px solid ${e.confirmado ? "var(--gold)" : "var(--ink-60)"}` }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.25rem", color: "var(--olive)", margin: 0 }}>
                      {e.titulo}
                    </h2>
                    {e.chamada && (
                      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--gold)" }}>
                        {e.chamada}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 14.5, color: "var(--ink)", margin: "6px 0 0", textTransform: "capitalize" }}>
                    {dataPorExtenso(e.data)}
                  </p>
                  {e.horarios && (
                    <p style={{ fontSize: 14, color: "var(--ink)", margin: "4px 0 0" }}>
                      {e.horarios.map(h => `${h.rotulo} às ${h.hora}`).join(" · ")}
                    </p>
                  )}
                  {e.descricao && (
                    <p style={{ fontSize: 13, color: "var(--ink-60)", margin: "6px 0 0" }}>{e.descricao}</p>
                  )}
                  {!e.confirmado && (
                    <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--ink-60)", margin: "8px 0 0" }}>
                      Previsão
                    </p>
                  )}
                </div>

                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <span style={{ display: "block", fontFamily: "var(--serif-cfo)", fontSize: "1.6rem", fontWeight: 600, color: "var(--olive)", lineHeight: 1 }}>
                    {passou ? "—" : dias === 0 ? "hoje" : dias}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--ink-60)" }}>
                    {passou ? "realizado" : dias === 0 ? "" : dias === 1 ? "dia" : "dias"}
                  </span>
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

// ── Aba 3: escalas da companhia ──────────────────────────────

function Escalas({ hojeIso, minhaMatricula, meuGrupo, minhasEscalas, mes }: DadosCalendario) {
  const [grupoAberto, setGrupoAberto] = useState<Grupo | null>(meuGrupo)

  const hoje = mes.plantao.find(p => p.data === hojeIso)
  const proximos = minhasEscalas.filter(e => e.data >= hojeIso)

  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--ink-60)", margin: "0 0 14px" }}>
        1ª Companhia · {mes.rotulo} · escala 7x1, plantão de 07h às 07h
      </p>

      {/* o que é meu */}
      {meuGrupo ? (
        <section style={{ ...card, borderLeft: "4px solid var(--olive)" }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--olive)", margin: "0 0 10px" }}>
            Você · {rotuloMilitar(minhaMatricula)}
          </h2>
          <p style={{ fontSize: 14.5, color: "var(--ink)", margin: 0 }}>
            Grupo de plantão: <strong>{ROTULO_GRUPO[meuGrupo]}</strong>
          </p>
          {hoje && (
            <p style={{ fontSize: 14.5, color: "var(--ink)", margin: "8px 0 0" }}>
              Hoje é plantão do <strong>{ROTULO_GRUPO[hoje.grupo]}</strong>
              {hoje.grupo === meuGrupo ? " — é o seu grupo." : "."}
            </p>
          )}
          {proximos.length ? (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--ink-60)", margin: "0 0 6px" }}>
                Seus compromissos no mês
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--ink)" }}>
                {proximos.map((e, i) => (
                  <li key={i} style={{ padding: "2px 0" }}>
                    <strong>{dataCurta(e.data)}</strong> · {e.detalhe}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p style={{ fontSize: 13.5, color: "var(--ink-60)", margin: "10px 0 0" }}>
              Nada mais escalado para você até o fim de {mes.rotulo.toLowerCase()}.
            </p>
          )}
        </section>
      ) : (
        <section style={card}>
          <p style={{ fontSize: 14, color: "var(--ink-60)", margin: 0 }}>
            A matrícula {minhaMatricula} não consta no mapa de equipes de {mes.rotulo.toLowerCase()} — as escalas
            abaixo aparecem completas, sem destaque pessoal.
          </p>
        </section>
      )}

      {/* plantão diário */}
      <h2 style={secTitulo}>Escala de plantão</h2>
      <div style={{ overflowX: "auto", ...card, padding: 0 }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13.5, minWidth: 560 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--ink-60)" }}>
              <th style={th}>Data</th>
              <th style={th}>Plantão</th>
              <th style={th}>Auxiliar</th>
              <th style={th}>Adjunto</th>
              <th style={th}>Sobreaviso</th>
            </tr>
          </thead>
          <tbody>
            {mes.plantao.map(p => {
              const ehHoje = p.data === hojeIso
              const meu = meuGrupo === p.grupo
              return (
                <tr key={p.data} style={{ background: ehHoje ? "var(--canvas)" : undefined, fontWeight: ehHoje ? 700 : 400 }}>
                  <td style={td}>
                    {dataCurta(p.data)}
                    {ehHoje && <span style={{ ...chip, marginLeft: 6 }}>hoje</span>}
                  </td>
                  <td style={{ ...td, color: meu ? "var(--olive)" : undefined, fontWeight: meu ? 700 : undefined }}>
                    {ROTULO_GRUPO[p.grupo]}
                  </td>
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
        <p key={i} style={{ fontSize: 13, color: "var(--ink-60)", margin: "10px 0 0" }}>
          <strong>Obs.:</strong> {o}
        </p>
      ))}

      {/* funções de destaque */}
      <h2 style={secTitulo}>Funções nas formaturas</h2>
      <div style={{ overflowX: "auto", ...card, padding: 0 }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13.5, minWidth: 620 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--ink-60)" }}>
              <th style={th}>Data</th>
              {(Object.keys(ROTULO_FUNCAO) as ChaveFuncao[]).map(k => (
                <th key={k} style={th}>{ROTULO_FUNCAO[k]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mes.funcoes.map(f => (
              <tr key={f.data} style={{ background: f.data === hojeIso ? "var(--canvas)" : undefined }}>
                <td style={td}>{dataCurta(f.data)}</td>
                {(Object.keys(ROTULO_FUNCAO) as ChaveFuncao[]).map(k => (
                  <td key={k} style={{ ...td, fontWeight: f[k] === minhaMatricula ? 700 : 400, color: f[k] === minhaMatricula ? "var(--olive)" : undefined }}>
                    {rotuloMilitar(f[k])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* mapa de equipes */}
      <h2 style={secTitulo}>Mapa de equipes</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ORDEM_GRUPOS.map(g => {
          const membros = MAPA_EQUIPES[g]
          const aberto = grupoAberto === g
          return (
            <section key={g} style={{ ...card, padding: 0, overflow: "hidden" }}>
              <button
                onClick={() => setGrupoAberto(aberto ? null : g)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", font: "inherit" }}
              >
                <span style={{ fontWeight: 700, fontSize: 14.5, color: g === meuGrupo ? "var(--olive)" : "var(--ink)" }}>
                  {ROTULO_GRUPO[g]}
                  {g === meuGrupo && <span style={{ ...chip, marginLeft: 8 }}>seu grupo</span>}
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

      {/* documentos originais */}
      <h2 style={secTitulo}>Documentos originais</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {mes.docs.map(doc => (
          <a
            key={doc.arquivo}
            href={doc.arquivo}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, textDecoration: "none" }}
          >
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

const th: React.CSSProperties = { padding: "10px 12px", fontSize: 12, fontWeight: 700, letterSpacing: 0.3, textTransform: "uppercase", whiteSpace: "nowrap", borderBottom: "1px solid var(--canvas)" }
const td: React.CSSProperties = { padding: "9px 12px", borderTop: "1px solid var(--canvas)", verticalAlign: "top" }
