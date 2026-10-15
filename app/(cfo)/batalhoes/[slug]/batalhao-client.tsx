"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CAMPOS_FICHA, FORMULARIO_DAG_URL, type ChaveFicha } from "@/lib/batalhoes-base"

type Pessoa = { mat: number; nome: string; pelotao: number | null; outra: string | null }
type Msg = { id: string; texto: string; criadoEm: string; mat: number; nome: string }

const cartao: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid rgba(58,74,58,0.14)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: 18 }
const titulo: React.CSSProperties = { margin: "0 0 12px", fontSize: 15, color: "var(--olive)" }
const rotuloCampo: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px" }
const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 11px", borderRadius: 8, border: "1px solid rgba(58,74,58,0.3)", background: "#fff", color: "var(--ink)", fontSize: 14, fontFamily: "inherit" }
const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

const GRUPOS = [
  { id: "comando", titulo: "Comando e efetivo" },
  { id: "contato", titulo: "Sede e contato" },
  { id: "area", titulo: "A área do batalhão" },
  { id: "morar", titulo: "Morar e se deslocar" },
] as const

function ListaPessoas({ pessoas, minhaMatricula, rotuloOutra }: { pessoas: Pessoa[]; minhaMatricula: number; rotuloOutra: string }) {
  const [busca, setBusca] = useState("")
  const lista = useMemo(() => {
    const t = semAcento(busca.trim())
    return pessoas.filter(p => !t || semAcento(`${p.mat} ${p.nome}`).includes(t)).sort((a, b) => a.mat - b.mat)
  }, [pessoas, busca])
  if (pessoas.length === 0) return <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-60)" }}>Ninguém por enquanto.</p>
  return (
    <>
      {pessoas.length > 8 && (
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="🔍 Buscar nome ou matrícula" style={{ ...inputStyle, marginBottom: 8 }} />
      )}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {lista.map((p, i) => (
          <div key={p.mat} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "6px 2px", borderTop: i ? "1px solid var(--surface)" : "none",
            fontWeight: p.mat === minhaMatricula ? 700 : 400, background: p.mat === minhaMatricula ? "rgba(181,147,63,0.12)" : "transparent", fontSize: 13.5 }}>
            <span><span style={{ color: "var(--gold)", fontWeight: 700, display: "inline-block", minWidth: 34 }}>{p.mat}</span>{p.nome}{p.mat === minhaMatricula ? " · você" : ""}</span>
            <span style={{ color: "var(--ink-60)", fontSize: 12, whiteSpace: "nowrap" }}>{p.pelotao ? `${p.pelotao}º Pel · ` : ""}{p.outra ? `${rotuloOutra} ${p.outra}` : ""}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export function BatalhaoClient({ sigla, isAdmin, minhaMatricula, planilhaOk, info, atualizadoEm, primeira, segunda, mural }: {
  sigla: string; isAdmin: boolean; minhaMatricula: number; planilhaOk: boolean
  info: Record<ChaveFicha, string>; atualizadoEm: string | null
  primeira: Pessoa[]; segunda: Pessoa[]; mural: Msg[]
}) {
  const router = useRouter()
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState(info)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")
  const [texto, setTexto] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [abaLista, setAbaLista] = useState<1 | 2>(1)

  async function salvarFicha(e: React.FormEvent) {
    e.preventDefault(); setSalvando(true); setErro("")
    const res = await fetch("/api/batalhoes/info", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sigla, ...form }) })
    setSalvando(false)
    if (!res.ok) { const j = await res.json().catch(() => ({})); return setErro(j.error || "Erro ao salvar.") }
    setEditando(false); router.refresh()
  }
  async function publicar(e: React.FormEvent) {
    e.preventDefault(); if (!texto.trim()) return
    setEnviando(true)
    const res = await fetch("/api/batalhoes/mural", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sigla, texto }) })
    setEnviando(false)
    if (res.ok) { setTexto(""); router.refresh() }
  }
  async function apagar(id: string) {
    if (!confirm("Apagar esta mensagem?")) return
    const res = await fetch(`/api/batalhoes/mural?id=${id}`, { method: "DELETE" })
    if (res.ok) router.refresh()
  }

  const vazio = CAMPOS_FICHA.every(c => !info[c.chave] || c.chave === "email")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Números */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        {[{ n: primeira.length, r: "querem como 1ª opção" }, { n: segunda.length, r: "como 2ª opção" }, { n: mural.length, r: "mensagens no mural" }].map(x => (
          <div key={x.r} style={{ ...cartao, padding: 14, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--serif-cfo)", fontSize: 28, fontWeight: 700, color: "var(--olive)" }}>{x.n}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-60)" }}>{x.r}</div>
          </div>
        ))}
      </div>

      {/* Ficha */}
      <section style={cartao}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <h2 style={{ ...titulo, margin: 0, fontFamily: "var(--serif-cfo)", fontSize: "1.2rem" }}>Conheça o batalhão</h2>
          {isAdmin && !editando && (
            <button onClick={() => setEditando(true)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--olive)", background: "#fff", color: "var(--olive)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Editar ficha</button>
          )}
        </div>

        {editando ? (
          <form onSubmit={salvarFicha} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {CAMPOS_FICHA.map(c => (
              <label key={c.chave} style={{ fontSize: 13, fontWeight: 600 }}>{c.rotulo}
                {"longo" in c && c.longo
                  ? <textarea rows={3} value={form[c.chave]} onChange={e => setForm({ ...form, [c.chave]: e.target.value })} style={{ ...inputStyle, marginTop: 4, resize: "vertical" }} />
                  : <input value={form[c.chave]} onChange={e => setForm({ ...form, [c.chave]: e.target.value })} style={{ ...inputStyle, marginTop: 4 }} />}
              </label>
            ))}
            {erro && <p style={{ margin: 0, color: "var(--red)", fontSize: 13 }}>✗ {erro}</p>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => { setEditando(false); setForm(info) }} style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid rgba(58,74,58,0.3)", background: "#fff", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
              <button type="submit" disabled={salvando} style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", cursor: "pointer", fontWeight: 600 }}>{salvando ? "Salvando…" : "Salvar ficha"}</button>
            </div>
          </form>
        ) : (
          <>
            {vazio && <p style={{ margin: "0 0 12px", fontSize: 13.5, color: "var(--ink-60)" }}>Ficha em construção — as informações do batalhão serão publicadas aqui.</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {GRUPOS.map(g => {
                const campos = CAMPOS_FICHA.filter(c => c.grupo === g.id && info[c.chave])
                if (campos.length === 0) return null
                return (
                  <div key={g.id}>
                    <h3 style={{ margin: "0 0 8px", fontSize: 13, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{g.titulo}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                      {campos.map(c => (
                        <div key={c.chave} style={{ gridColumn: "longo" in c && c.longo ? "1 / -1" : undefined }}>
                          <p style={rotuloCampo}>{c.rotulo}</p>
                          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{info[c.chave]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            {info.linkGrupo && (
              <a href={info.linkGrupo} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-block", marginTop: 14, padding: "9px 16px", borderRadius: 10, background: "#25D366", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
                Entrar no grupo dos interessados ↗
              </a>
            )}
            {atualizadoEm && <p style={{ margin: "12px 0 0", fontSize: 11.5, color: "var(--ink-60)" }}>Ficha atualizada em {new Date(atualizadoEm).toLocaleDateString("pt-BR")}.</p>}
          </>
        )}
      </section>

      {/* Quem escolheu — visualizador 1ª / 2ª opção */}
      <section style={cartao}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <h2 style={{ ...titulo, margin: 0, fontFamily: "var(--serif-cfo)", fontSize: "1.2rem" }}>Quem escolheu o {sigla}</h2>
          <div style={{ display: "flex", gap: 6 }}>
            {([[1, "1ª opção", primeira.length], [2, "2ª opção", segunda.length]] as const).map(([n, r, q]) => (
              <button key={n} onClick={() => setAbaLista(n)}
                style={{ padding: "7px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600,
                  background: abaLista === n ? "var(--olive)" : "var(--surface)", color: abaLista === n ? "var(--canvas)" : "var(--ink-60)" }}>
                {r} <span style={{ opacity: 0.75 }}>{q}</span>
              </button>
            ))}
          </div>
        </div>
        {abaLista === 1
          ? <ListaPessoas key="p1" pessoas={primeira} minhaMatricula={minhaMatricula} rotuloOutra="2ª:" />
          : <ListaPessoas key="p2" pessoas={segunda} minhaMatricula={minhaMatricula} rotuloOutra="1ª:" />}
        <a href={FORMULARIO_DAG_URL} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-block", marginTop: 14, fontSize: 13, fontWeight: 600, color: "var(--olive)" }}>
          Quer mudar sua escolha? Responda de novo o formulário da DAG ↗
        </a>
      </section>
      {!planilhaOk && <p style={{ margin: 0, fontSize: 12.5, color: "var(--red)" }}>Não foi possível abrir a planilha da DAG agora — as listas podem estar vazias.</p>}

      {/* Mural */}
      <section style={cartao}>
        <h2 style={titulo}>Mural da turma — {sigla}</h2>
        <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "var(--ink-60)" }}>Dicas sobre a área, onde morar, contatos e combinações entre os interessados.</p>
        <form onSubmit={publicar} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          <textarea rows={3} value={texto} maxLength={1000} onChange={e => setTexto(e.target.value)} placeholder="Escreva uma dica ou mensagem para quem quer este batalhão…" style={{ ...inputStyle, resize: "vertical" }} />
          <button type="submit" disabled={enviando || !texto.trim()} style={{ alignSelf: "flex-end", padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontWeight: 600, cursor: "pointer", opacity: texto.trim() ? 1 : 0.5 }}>
            {enviando ? "Publicando…" : "Publicar"}
          </button>
        </form>
        {mural.length === 0 ? <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-60)" }}>Nenhuma mensagem ainda — seja o primeiro.</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mural.map(m => (
              <div key={m.id} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--surface)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12, color: "var(--ink-60)", marginBottom: 4 }}>
                  <span><strong style={{ color: "var(--olive)" }}>{m.mat} {m.nome}</strong> · {new Date(m.criadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                  {(isAdmin || m.mat === minhaMatricula) && <button onClick={() => apagar(m.id)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>apagar</button>}
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.texto}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
