"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { calcularComponentes, calcularProjecaoConsolidada, type Verificacao } from "@/lib/ranking"

type Nota = { id: string; disciplina: string; avaliacao: string; valor: number; ehAF: boolean; apto: boolean }
type Disc = { sigla: string; nome: string; status: string }
type Opm = { id: string; sigla: string; nome: string; especial: boolean }
type Pref = { opcao1Id: string; opcao2Id: string | null; opcao3Id: string | null }
type Agregado = { sigla: string; nome: string; especial: boolean; count: number }
type Aba = "lancar" | "ranking" | "simular" | "batalhoes"

const card: React.CSSProperties = { padding: 16, borderRadius: 12, background: "var(--surface)" }
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1px solid rgba(58,74,58,0.3)", background: "#fff", color: "var(--ink)", fontSize: 15,
}

function toVerif(notas: Nota[]): Verificacao[] {
  return notas.map(n => ({ disciplina: n.disciplina, avaliacao: n.avaliacao, nota: n.valor, peso: 1, ehAF: n.ehAF, apto: n.apto }))
}

export function RankingClient({
  notasIniciais, nfdc, disciplinas, turmaSize, mgcsOutros, nomeGuerra, opms, minhaPref, agregado1,
}: {
  notasIniciais: Nota[]; nfdc: number; disciplinas: Disc[]; turmaSize: number; mgcsOutros: number[]
  nomeGuerra: string; opms: Opm[]; minhaPref: Pref | null; agregado1: Agregado[]
}) {
  const router = useRouter()
  const [notas, setNotas] = useState<Nota[]>(notasIniciais)
  const [aba, setAba] = useState<Aba>("lancar")

  // form lançar
  const [disc, setDisc] = useState("")
  const [aval, setAval] = useState("P1")
  const [valor, setValor] = useState("")
  const [ehAF, setEhAF] = useState(false)
  const [apto, setApto] = useState(false)
  const [erro, setErro] = useState("")
  const [salvando, setSalvando] = useState(false)

  // batalhões
  const [op1, setOp1] = useState(minhaPref?.opcao1Id || "")
  const [op2, setOp2] = useState(minhaPref?.opcao2Id || "")
  const [op3, setOp3] = useState(minhaPref?.opcao3Id || "")
  const [salvandoPref, setSalvandoPref] = useState(false)
  const [prefMsg, setPrefMsg] = useState("")
  const op1Especial = !!op1 && !!opms.find(o => o.id === op1)?.especial

  const comp = calcularComponentes(toVerif(notas), nfdc)

  function projecao(mgc: number | null) {
    if (mgc == null) return null
    const t3Acima = mgcsOutros.filter(m => m > mgc).length
    const t3ComDados = mgcsOutros.length + 1
    return calcularProjecaoConsolidada(mgc, t3Acima, turmaSize, t3ComDados)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault(); setErro("")
    const v = Number(valor.replace(",", "."))
    if (!disc) return setErro("Escolha a disciplina.")
    if (isNaN(v) || v < 0 || v > 10) return setErro("Nota deve ser entre 0 e 10.")
    setSalvando(true)
    const res = await fetch("/api/notas-cfo", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disciplina: disc, avaliacao: aval || "P1", valor: v, ehAF, apto }),
    })
    setSalvando(false)
    if (!res.ok) { const j = await res.json().catch(() => ({})); return setErro(j.error || "Erro ao salvar.") }
    const nova: Nota = await res.json()
    setNotas(prev => {
      const i = prev.findIndex(n => n.disciplina === nova.disciplina && n.avaliacao === nova.avaliacao)
      if (i >= 0) { const c = [...prev]; c[i] = nova; return c }
      return [...prev, nova].sort((a, b) => a.disciplina.localeCompare(b.disciplina))
    })
    setValor(""); setEhAF(false); setApto(false)
    router.refresh()
  }

  async function excluir(id: string) {
    if (!confirm("Excluir esta nota?")) return
    const res = await fetch(`/api/notas-cfo?id=${id}`, { method: "DELETE" })
    if (res.ok) { setNotas(prev => prev.filter(n => n.id !== id)); router.refresh() }
  }

  async function salvarPref() {
    if (!op1) return setPrefMsg("Escolha ao menos a 1ª opção.")
    setSalvandoPref(true); setPrefMsg("")
    const res = await fetch("/api/preferencia-opm", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opcao1Id: op1, opcao2Id: op1Especial ? null : op2 || null, opcao3Id: op1Especial ? null : op3 || null }),
    })
    setSalvandoPref(false)
    if (!res.ok) { const j = await res.json().catch(() => ({})); return setPrefMsg(j.error || "Erro ao salvar.") }
    setPrefMsg("✓ Preferência salva."); router.refresh()
  }

  // agrupa por disciplina p/ exibir MD
  const grupos = new Map<string, Nota[]>()
  for (const n of notas) { if (!grupos.has(n.disciplina)) grupos.set(n.disciplina, []); grupos.get(n.disciplina)!.push(n) }
  const nomeDisc = (s: string) => disciplinas.find(d => d.sigla === s)?.nome || s
  function md(ns: Nota[]): number | null {
    const reg = ns.filter(n => !n.ehAF && !n.apto)
    if (reg.length === 0) return null
    return reg.reduce((s, n) => s + n.valor, 0) / reg.length
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
      <Link href="/inicio" style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>← Voltar</Link>
      <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.9rem", color: "var(--olive)", marginTop: 16, marginBottom: 4 }}>
        Ranking & Previsão
      </h1>
      <p style={{ color: "var(--ink-60)", margin: 0 }}>Olá, {nomeGuerra}</p>

      <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
        {([["lancar", "Lançar notas"], ["ranking", "Meu ranking"], ["simular", "Simular"], ["batalhoes", "Batalhões"]] as const).map(([t, rot]) => (
          <button key={t} onClick={() => setAba(t)}
            style={{ padding: "8px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
              background: aba === t ? "var(--olive)" : "var(--surface)", color: aba === t ? "var(--canvas)" : "var(--ink-60)" }}>
            {rot}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 20, padding: "12px 14px", borderRadius: 10, background: "#fbf3e3", border: "1px solid var(--gold)" }}>
        <span aria-hidden style={{ fontSize: 18 }}>⚠️</span>
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink)" }}>
          <strong>Simulação não-oficial.</strong> Notas informadas pelo próprio aluno. Cálculo pela fórmula do CFO
          (MGC = MFIC×6,5 + NFDC×2,5 + TCC×1, ÷10). Só você vê as suas notas.
        </p>
      </div>

      {aba === "lancar" && (
        <>
          <form onSubmit={salvar} style={{ marginTop: 20, padding: 16, borderRadius: 12, background: "var(--surface)", display: "grid", gridTemplateColumns: "1fr 90px 90px", gap: 12, alignItems: "end" }}>
            <label style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>Disciplina
              <select style={{ ...inputStyle, marginTop: 4 }} value={disc} onChange={e => setDisc(e.target.value)}>
                <option value="">— selecione —</option>
                {disciplinas.map(d => <option key={d.sigla} value={d.sigla}>{d.sigla} — {d.nome}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>Avaliação
              <input style={{ ...inputStyle, marginTop: 4 }} value={aval} onChange={e => setAval(e.target.value)} placeholder="P1" />
            </label>
            <label style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>Nota
              <input style={{ ...inputStyle, marginTop: 4 }} value={valor} onChange={e => setValor(e.target.value)} placeholder="0–10" inputMode="decimal" />
            </label>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 18, fontSize: 13.5, color: "var(--ink)" }}>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}><input type="checkbox" checked={ehAF} onChange={e => setEhAF(e.target.checked)} /> Avaliação Final (AF)</label>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}><input type="checkbox" checked={apto} onChange={e => setApto(e.target.checked)} /> Disciplina de conceito (APTO/INAPTO)</label>
            </div>
            <button type="submit" disabled={salvando} style={{ gridColumn: "1 / -1", padding: "11px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontSize: 15, fontWeight: 600, cursor: salvando ? "default" : "pointer" }}>
              {salvando ? "Salvando…" : "Salvar nota"}
            </button>
            {erro && <p style={{ gridColumn: "1 / -1", margin: 0, color: "var(--red)", fontSize: 13.5 }}>✗ {erro}</p>}
          </form>

          <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--olive)", marginTop: 24, marginBottom: 10 }}>Minhas notas</h2>
          {notas.length === 0 ? <p style={{ color: "var(--ink-60)" }}>Nenhuma nota lançada ainda.</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[...grupos.entries()].map(([d, ns]) => {
                const m = md(ns)
                return (
                  <div key={d} style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                      <strong style={{ color: "var(--olive)" }}>{d} <span style={{ fontWeight: 400, color: "var(--ink-60)", fontSize: 13 }}>{nomeDisc(d)}</span></strong>
                      <span style={{ fontSize: 13 }}>MD: <strong style={{ color: "var(--olive)" }}>{m != null ? m.toFixed(2) : "—"}</strong></span>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                      {ns.map(n => (
                        <li key={n.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                          <span style={{ flex: 1 }}>{n.avaliacao}{n.ehAF ? " (AF)" : ""}{n.apto ? " · conceito" : ""}</span>
                          <span style={{ fontWeight: 700, color: "var(--olive)" }}>{n.valor.toFixed(2)}</span>
                          <button onClick={() => excluir(n.id)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>excluir</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {aba === "ranking" && <Painel comp={comp} proj={projecao(comp.mgc)} turmaSize={turmaSize} comDados={mgcsOutros.length + (comp.mgc != null ? 1 : 0)} />}

      {aba === "simular" && <Simular notas={notas} nfdc={nfdc} projecao={projecao} turmaSize={turmaSize} />}

      {aba === "batalhoes" && (
        <div style={{ marginTop: 20 }}>
          <p style={{ color: "var(--ink-60)", fontSize: 14, marginBottom: 14, lineHeight: 1.5 }}>
            Escolha sua preferência de batalhão (DIM / RMR). 1ª obrigatória; 2ª e 3ª opcionais. O quadro de mais pedidos é <strong>anônimo</strong>.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[{ rot: "1ª opção", val: op1, set: setOp1, esp: true }, { rot: "2ª opção (opcional)", val: op2, set: setOp2, esp: false }, { rot: "3ª opção (opcional)", val: op3, set: setOp3, esp: false }].map((s, i) => (
              <label key={i} style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{s.rot}
                <select value={s.val} onChange={e => s.set(e.target.value)} disabled={i > 0 && op1Especial} style={{ ...inputStyle, marginTop: 4, opacity: i > 0 && op1Especial ? 0.5 : 1 }}>
                  <option value="">— selecione —</option>
                  {opms.filter(o => s.esp || !o.especial).map(o => <option key={o.id} value={o.id}>{o.sigla}{o.especial ? "" : ` — ${o.nome}`}</option>)}
                </select>
              </label>
            ))}
          </div>
          <button onClick={salvarPref} disabled={salvandoPref} style={{ marginTop: 14, padding: "11px 16px", borderRadius: 8, border: "none", background: "var(--olive)", color: "var(--canvas)", fontSize: 15, fontWeight: 600, cursor: salvandoPref ? "default" : "pointer" }}>
            {salvandoPref ? "Salvando…" : "Salvar preferência"}
          </button>
          {prefMsg && <p style={{ marginTop: 8, fontSize: 13.5, color: prefMsg.startsWith("✓") ? "var(--olive)" : "var(--red)" }}>{prefMsg}</p>}
          <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--olive)", marginTop: 28, marginBottom: 12 }}>
            Mais pedidos como 1ª opção <span style={{ fontSize: 13, fontWeight: 400, color: "var(--ink-60)" }}>(anônimo)</span>
          </h2>
          {(() => {
            const ord = [...agregado1].sort((a, b) => b.count - a.count); const max = Math.max(1, ...ord.map(a => a.count))
            return (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {ord.map(a => (
                  <li key={a.sigla} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 64, fontSize: 13, fontWeight: 600 }}>{a.sigla}</span>
                    <div style={{ flex: 1, height: 18, borderRadius: 6, background: "var(--surface)", overflow: "hidden" }}>
                      <div style={{ width: `${(a.count / max) * 100}%`, height: "100%", background: a.especial ? "var(--gold)" : "var(--olive)" }} />
                    </div>
                    <span style={{ width: 28, textAlign: "right", fontSize: 14, fontWeight: 700, color: "var(--olive)" }}>{a.count}</span>
                  </li>
                ))}
              </ul>
            )
          })()}
        </div>
      )}

      <footer style={{ marginTop: 40, fontSize: 13, color: "var(--ink-60)", textAlign: "center" }}>Desenvolvido por AL CFO PM 108 LISANDRY</footer>
    </main>
  )
}

function Painel({ comp, proj, turmaSize, comDados }: { comp: ReturnType<typeof calcularComponentes>; proj: ReturnType<typeof calcularProjecaoConsolidada> | null; turmaSize: number; comDados: number }) {
  if (comp.mgc == null || !proj) return <p style={{ color: "var(--ink-60)", marginTop: 20 }}>Lance suas notas para ver o ranking e a previsão.</p>
  const box = (label: string, v: string) => (
    <div style={{ padding: "12px 10px", borderRadius: 10, background: "var(--surface)", textAlign: "center" }}>
      <div style={{ fontSize: 12, color: "var(--ink-60)" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--olive)" }}>{v}</div>
    </div>
  )
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ padding: "20px 18px", borderRadius: 14, background: "var(--olive)", color: "var(--canvas)", textAlign: "center" }}>
        <div style={{ fontSize: 13, opacity: 0.85 }}>Sua MGC (autodeclarada)</div>
        <div style={{ fontFamily: "var(--serif-cfo)", fontSize: "2.2rem", fontWeight: 600 }}>{comp.mgc.toFixed(3)}</div>
        <div style={{ fontSize: 14, opacity: 0.9, marginTop: 6 }}>Posição provável: <strong>{proj.provavel}º</strong> de {turmaSize} (T3)</div>
        <div style={{ fontSize: 13, opacity: 0.8 }}>faixa entre {proj.melhor}º e {proj.conservador}º</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14 }}>
        {box("MFIC", comp.mfic != null ? comp.mfic.toFixed(3) : "—")}
        {box("NFDC", comp.nfdc.toFixed(0))}
        {box("TCC", comp.tcc != null ? comp.tcc.toFixed(2) : "—")}
      </div>
      <p style={{ marginTop: 14, fontSize: 13, color: "var(--ink-60)", lineHeight: 1.5 }}>
        Estimativa combinando os <strong>{comDados}</strong> alunos da T3 que já lançaram notas com a distribuição histórica (T1 + T2).
        Quanto mais alunos lançarem, mais precisa fica. Não é a nota oficial.
      </p>
    </div>
  )
}

function Simular({ notas, nfdc, projecao, turmaSize }: { notas: Nota[]; nfdc: number; projecao: (m: number | null) => any; turmaSize: number }) {
  const [clone, setClone] = useState<Nota[]>(() => notas.map(n => ({ ...n })))
  const comp = calcularComponentes(toVerif(clone), nfdc)
  const proj = projecao(comp.mgc)
  return (
    <div style={{ marginTop: 20 }}>
      <p style={{ color: "var(--ink-60)", fontSize: 14, marginBottom: 14, lineHeight: 1.5 }}>
        Ajuste suas notas <strong>hipoteticamente</strong> e veja a MGC e a faixa mudarem. É só pra você — <strong>não salva</strong> nada.
      </p>
      {clone.length === 0 ? <p style={{ color: "var(--ink-60)" }}>Lance notas primeiro na aba “Lançar notas”.</p> : (
        <>
          <div style={card}>
            {clone.map((n, idx) => (
              <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ flex: 1, fontSize: 14 }}>{n.disciplina} · {n.avaliacao}</span>
                <input value={String(n.valor)} inputMode="decimal" onChange={e => { const v = Number(e.target.value.replace(",", ".")); setClone(c => c.map((x, i) => i === idx ? { ...x, valor: isNaN(v) ? x.valor : v } : x)) }}
                  style={{ ...inputStyle, width: 80 }} />
              </div>
            ))}
          </div>
          {comp.mgc != null && proj && (
            <div style={{ marginTop: 14, padding: "20px 18px", borderRadius: 14, background: "var(--olive)", color: "var(--canvas)", textAlign: "center" }}>
              <div style={{ fontSize: 13, opacity: 0.85 }}>MGC simulada</div>
              <div style={{ fontFamily: "var(--serif-cfo)", fontSize: "2rem", fontWeight: 600 }}>{comp.mgc.toFixed(3)}</div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>Posição provável: {proj.provavel}º de {turmaSize} (faixa {proj.melhor}º–{proj.conservador}º)</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
