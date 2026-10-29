"use client"

import { useState } from "react"
import remuneracao from "@/lib/remuneracao-oficiais.json"
import { AIS_PE } from "@/lib/ais-pernambuco"
import {
  CADEIA_COMANDO, COMO_FUNCIONA, DIRETORIAS_OPERACIONAIS, DPO, EMG_ATRIBUICOES, ESCALOES, ESPECIALIZADAS, FONTE_ESTRUTURA, ORGAOS, SECOES_EMG,
  type Diretoria, type Especializada,
} from "@/lib/pmpe-estrutura"

type Aba = "especializadas" | "comando" | "diretorias" | "escaloes"
const ABAS: { id: Aba; rot: string }[] = [
  { id: "especializadas", rot: "Especializadas" },
  { id: "comando", rot: "Comando e EMG" },
  { id: "diretorias", rot: "Diretorias" },
  { id: "escaloes", rot: "Escalões e cargos" },
]
const TIPOS = [...new Set(ESPECIALIZADAS.map(e => e.tipo))]

const rotulo: React.CSSProperties = { fontSize: 10.5, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }
const bloco: React.CSSProperties = { padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(58,74,58,0.12)", background: "#fff" }
const pilula = (ativo: boolean): React.CSSProperties => ({
  padding: "5px 11px", borderRadius: 999, border: "1px solid rgba(58,74,58,0.18)", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
  background: ativo ? "var(--olive)" : "#fff", color: ativo ? "var(--canvas)" : "var(--ink-60)",
})
const th: React.CSSProperties = { padding: "7px 10px", textAlign: "left", fontSize: 11, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }
const td: React.CSSProperties = { padding: "8px 10px", borderTop: "1px solid var(--surface)", fontSize: 13, verticalAlign: "top" }

// Funções da T1 como aspirante (folha oficial) — mostra o "cargo real" de quem acabou de sair do CFO
type Turma = { rotulo: string; distribuicao: Record<string, number> }
const T1ASP = (remuneracao.turmas as Turma[]).find(t => t.rotulo === "T1 como aspirante")

function CartaoEspecializada({ e }: { e: Especializada }) {
  const ais = AIS_PE.find(a => a.id === e.ais)
  return (
    <div style={bloco}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
        <strong style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.1rem", color: "var(--olive)" }}>{e.sigla}</strong>
        <span style={{ fontSize: 11, color: "var(--ink-60)" }}>{e.subordinacao}</span>
      </div>
      <div style={{ fontSize: 12.5, color: "var(--ink-60)", marginTop: 1 }}>{e.nome}{e.denominacao ? ` · ${e.denominacao}` : ""}</div>
      <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.5 }}>{e.missao}</p>
      <div style={{ fontSize: 11.5, color: "var(--ink-60)", marginTop: 8, lineHeight: 1.5 }}>
        Sede: {e.sede}{e.sigla !== "GTA" && ais ? ` (${ais.rotulo})` : ""}{e.origem ? <><br />Origem: {e.origem}</> : null}
      </div>
    </div>
  )
}

function CartaoDiretoria({ d }: { d: Diretoria }) {
  return (
    <div style={bloco}>
      <strong style={{ color: "var(--olive)" }}>{d.sigla}</strong> <span style={{ fontSize: 12.5, color: "var(--ink-60)" }}>· {d.nome}</span>
      <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.5 }}>{d.desc}</p>
      {d.sede && <div style={{ fontSize: 11.5, color: "var(--ink-60)", marginTop: 4 }}>Sede: {d.sede}</div>}
      {d.itens && <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 12.5, lineHeight: 1.55 }}>{d.itens.map(i => <li key={i}>{i}</li>)}</ul>}
    </div>
  )
}

export function EstruturaPMPE() {
  const [aba, setAba] = useState<Aba>("especializadas")
  const [tipo, setTipo] = useState<string | null>(null)
  const lista = ESPECIALIZADAS.filter(e => !tipo || e.tipo === tipo)

  return (
    <div>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--ink-60)", lineHeight: 1.5 }}>
        A título de conhecimento: como a PMPE se organiza do Comando Geral ao grupo de policiamento, e o que faz cada unidade especializada.
      </p>
      <div role="tablist" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {ABAS.map(a => <button key={a.id} role="tab" aria-selected={aba === a.id} onClick={() => setAba(a.id)} style={pilula(aba === a.id)}>{a.rot}</button>)}
      </div>

      {aba === "especializadas" && <>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
          <button onClick={() => setTipo(null)} style={{ ...pilula(tipo == null), padding: "3px 9px", fontSize: 11.5 }}>Todas ({ESPECIALIZADAS.length})</button>
          {TIPOS.map(t => <button key={t} onClick={() => setTipo(t)} style={{ ...pilula(tipo === t), padding: "3px 9px", fontSize: 11.5 }}>{t}</button>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 10 }}>
          {lista.map(e => <CartaoEspecializada key={e.sigla} e={e} />)}
        </div>
      </>}

      {aba === "comando" && <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
          {CADEIA_COMANDO.map((c, i) => (
            <div key={c.cargo} style={{ ...bloco, background: i === 0 ? "var(--olive)" : "#fff", color: i === 0 ? "var(--canvas)" : "var(--ink)" }}>
              <strong>{c.cargo}</strong>
              <p style={{ margin: "4px 0 0", fontSize: 12.5, lineHeight: 1.5, opacity: i === 0 ? 0.9 : 1 }}>{c.desc}</p>
            </div>
          ))}
        </div>
        <div>
          <div style={rotulo}>Estado-Maior Geral — seções</div>
          <div style={{ overflowX: "auto", marginTop: 4 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
              <tbody>{SECOES_EMG.map(s => <tr key={s.secao}><td style={{ ...td, fontWeight: 600, whiteSpace: "nowrap" }}>{s.secao}</td><td style={td}>{s.encargo}</td></tr>)}</tbody>
            </table>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 12.5, lineHeight: 1.55 }}><strong>Atribuições do EMG:</strong> {EMG_ATRIBUICOES.join("; ")}.</p>
        </div>
        <div>
          <div style={rotulo}>Como a Corporação se divide</div>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 13, lineHeight: 1.55 }}>{ORGAOS.map(o => <li key={o.nome}><strong>{o.nome}:</strong> {o.desc}</li>)}</ul>
        </div>
      </div>}

      {aba === "diretorias" && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <CartaoDiretoria d={DPO} />
        <div style={{ fontSize: 12, color: "var(--ink-60)", textAlign: "center" }}>coordena ↓</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
          {DIRETORIAS_OPERACIONAIS.map(d => <CartaoDiretoria key={d.sigla} d={d} />)}
        </div>
      </div>}

      {aba === "escaloes" && <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
            <thead><tr><th style={th}>Espaço</th><th style={th}>Quem responde</th><th style={th}>Efetivo</th><th style={th}>Cargo</th></tr></thead>
            <tbody>{ESCALOES.map(e => (
              <tr key={e.espaco}><td style={{ ...td, fontWeight: 600 }}>{e.espaco}</td><td style={td}>{e.responsavel}</td><td style={{ ...td, whiteSpace: "nowrap" }}>{e.efetivo}</td><td style={td}>{e.cargo}</td></tr>
            ))}</tbody>
          </table>
        </div>
        {T1ASP && (
          <div style={{ ...bloco, background: "#fbf7ec", border: "1px solid rgba(181,147,63,0.3)", fontSize: 13, lineHeight: 1.5 }}>
            <strong>Na prática:</strong> faltam capitães e 1º tenentes, então o comando chega cedo. Quatro meses depois da formatura, a T1 estava assim (folha oficial):{" "}
            {Object.entries(T1ASP.distribuicao).map(([f, p], i) => <span key={f}>{i > 0 && " · "}{f} <strong>{p}%</strong></span>)}.
          </div>
        )}
        <div>
          <div style={rotulo}>Como funciona</div>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 13, lineHeight: 1.55 }}>{COMO_FUNCIONA.map(c => <li key={c}>{c}</li>)}</ul>
        </div>
      </div>}

      <p style={{ margin: "14px 0 0", fontSize: 11.5, color: "var(--ink-60)" }}>Fonte: {FONTE_ESTRUTURA}.</p>
    </div>
  )
}
