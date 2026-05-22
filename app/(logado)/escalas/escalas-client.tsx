"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { COMPOSICAO_FAXINA, MEMBROS_PLANTAO, GrupoFaxina, GrupoPlantao } from "@/lib/escalas"

const MESES = ["","Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
const FUNCOES_DESTAQUE = ["Mestre","Leitor","Discurso","Comandante"] as const

type ServicoSemana = { semana: number; p1: {mat:number;nome:string}|null; p3: {mat:number;nome:string}|null; p4: {mat:number;nome:string}|null }
type DiaCal = { data: string; diaSemana: string; tipo: "util"|"fds"; grupoFaxina: GrupoFaxina|null; grupoPlantao: GrupoPlantao }
type PlantaoDia = { id: string; data: string; grupoPlantao: string; adjuntoMat: number|null }
type FuncaoDia = { id: string; data: string; funcao: string; matricula: number }

const CORES_GRUPO: Record<string, string> = {
  G1:"#1D4ED8", G2:"#7C3AED", G3:"#B45309", G4:"#15803D",
  G5:"#B91C1C", G6:"#0369A1", G7:"#7E22CE", G8:"#92400E",
}

function TagGrupo({ grupo, small }: { grupo: string; small?: boolean }) {
  const cor = CORES_GRUPO[grupo] || "#475569"
  return (
    <span style={{
      background: cor + "18", color: cor, border: `1px solid ${cor}40`,
      borderRadius: 6, padding: small ? "1px 7px" : "2px 10px",
      fontSize: small ? 11 : 12, fontWeight: 600,
    }}>
      {grupo}
    </span>
  )
}

function CardServico({ label, pessoa, destaque }: { label: string; pessoa: {mat:number;nome:string}|null; destaque?: boolean }) {
  return (
    <div style={{
      background: destaque ? "var(--azul-profundo)" : "#fff",
      border: `1.5px solid ${destaque ? "var(--azul-profundo)" : "var(--cinza-borda)"}`,
      borderRadius: 12, padding: "16px", textAlign: "center",
      boxShadow: "var(--shadow-sm)",
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: destaque ? "rgba(255,255,255,0.7)" : "var(--cinza-texto)", marginBottom: 6 }}>{label}</p>
      {pessoa ? (
        <>
          <p style={{ fontWeight: 700, fontSize: 15, color: destaque ? "#fff" : "var(--azul-profundo)", fontFamily: "var(--serif)" }}>{pessoa.nome}</p>
          <p style={{ fontSize: 12, color: destaque ? "rgba(255,255,255,0.6)" : "var(--cinza-texto)", marginTop: 2 }}>Mat. {pessoa.mat}</p>
        </>
      ) : <p style={{ color: "var(--cinza-texto)", fontSize: 13 }}>—</p>}
    </div>
  )
}

export function EscalasClient({
  semana, ano, mes, isAdmin, minhaMatricula,
  servicoAtual, proximasSemanasServico,
  calendario, composicaoFaxina, membrosPlantao,
  plantaoDias, funcoesDias, nomesPorMat, alunos,
}: {
  semana: number; ano: number; mes: number; isAdmin: boolean; minhaMatricula: number
  servicoAtual: ServicoSemana
  proximasSemanasServico: ServicoSemana[]
  calendario: DiaCal[]
  composicaoFaxina: typeof COMPOSICAO_FAXINA
  membrosPlantao: typeof MEMBROS_PLANTAO
  plantaoDias: PlantaoDia[]
  funcoesDias: FuncaoDia[]
  nomesPorMat: Record<number, string>
  alunos: { matricula: number; nomeGuerra: string }[]
}) {
  const router = useRouter()
  const [aba, setAba] = useState<"servico"|"faxina"|"plantao"|"destaque">("servico")
  const [saving, setSaving] = useState(false)

  // Admin: plantão
  const [showPlantaoForm, setShowPlantaoForm] = useState(false)
  const [plantaoEntradas, setPlantaoEntradas] = useState<{data:string;adjuntoMat:string}[]>([{data:"",adjuntoMat:""}])

  // Admin: funções de destaque
  const [showFuncaoForm, setShowFuncaoForm] = useState(false)
  const [funcaoEntradas, setFuncaoEntradas] = useState<{data:string;funcao:string;matricula:string}[]>([{data:"",funcao:"Mestre",matricula:""}])

  async function salvarPlantao() {
    setSaving(true)
    const dias = plantaoEntradas
      .filter(e => e.data)
      .map(e => {
        const d = new Date(e.data + "T12:00:00")
        const GRUPOS = ["LIMA","GOLF","HOTEL","INDIA","JULIETT","KILO"]
        const idx = ((Math.floor((d.getTime() - new Date(2026,0,1).getTime()) / 86400000) % 6) + 6) % 6
        return { data: e.data + "T12:00:00", grupoPlantao: GRUPOS[idx], adjuntoMat: e.adjuntoMat ? Number(e.adjuntoMat) : null }
      })
    await fetch("/api/plantao-mes", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ dias }) })
    setSaving(false)
    setShowPlantaoForm(false)
    router.refresh()
  }

  async function salvarFuncoes() {
    setSaving(true)
    const funcoes = funcaoEntradas.filter(e => e.data && e.matricula)
      .map(e => ({ data: e.data + "T12:00:00", funcao: e.funcao, matricula: Number(e.matricula) }))
    await fetch("/api/funcoes-destaque", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ funcoes }) })
    setSaving(false)
    setShowFuncaoForm(false)
    router.refresh()
  }

  async function deletarFuncao(id: string) {
    await fetch("/api/funcoes-destaque", { method: "DELETE", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ id }) })
    router.refresh()
  }

  const isMinhaFaxina = (grupo: GrupoFaxina | null) =>
    grupo ? composicaoFaxina[grupo].some(p => p.mat === minhaMatricula) : false

  const plantaoMap = new Map(plantaoDias.map(p => [p.data.slice(0,10), p]))
  const funcoesPorData = new Map<string, FuncaoDia[]>()
  for (const f of funcoesDias) {
    const k = f.data.slice(0,10)
    if (!funcoesPorData.has(k)) funcoesPorData.set(k, [])
    funcoesPorData.get(k)!.push(f)
  }

  const euSouP1 = servicoAtual.p1?.mat === minhaMatricula
  const euSouP3 = servicoAtual.p3?.mat === minhaMatricula
  const euSouP4 = servicoAtual.p4?.mat === minhaMatricula

  const tabs = [
    { id: "servico", label: "Serviço P1/P3/P4" },
    { id: "faxina",  label: "Faxina" },
    { id: "plantao", label: "Plantão" },
    { id: "destaque",label: "Funções" },
  ] as const

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: 24, color: "var(--azul-profundo)" }}>
          Escalas
        </h1>
        <p style={{ color: "var(--cinza-texto)", fontSize: 13, marginTop: 4 }}>
          Semana {semana}/52 · {MESES[mes]} {ano}
        </p>
      </div>

      {/* Abas */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "2px solid var(--azul-claro)", paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setAba(t.id)} style={{
            padding: "8px 16px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
            borderRadius: "8px 8px 0 0",
            background: aba === t.id ? "var(--azul-profundo)" : "transparent",
            color: aba === t.id ? "#fff" : "var(--cinza-texto)",
            borderBottom: aba === t.id ? "2px solid var(--azul-profundo)" : "none",
            marginBottom: -2,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ABA SERVIÇO ── */}
      {aba === "servico" && (
        <div>
          {(euSouP1 || euSouP3 || euSouP4) && (
            <div style={{ background: "var(--dourado)", borderRadius: 10, padding: "10px 16px", marginBottom: 20, color: "#fff", fontSize: 13, fontWeight: 600 }}>
              ⭐ Você está de {euSouP1 ? "P1 — Pessoal" : euSouP3 ? "P3 — Operações" : "P4 — Logística"} nessa semana
            </div>
          )}

          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--azul-profundo)", marginBottom: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Semana {semana} — Atual
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 32 }}>
            <CardServico label="P1 — Pessoal" pessoa={servicoAtual.p1} destaque={euSouP1} />
            <CardServico label="P3 — Operações" pessoa={servicoAtual.p3} destaque={euSouP3} />
            <CardServico label="P4 — Logística" pessoa={servicoAtual.p4} destaque={euSouP4} />
          </div>

          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--azul-profundo)", marginBottom: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Próximas semanas
          </h2>
          <div style={{ background: "#fff", border: "1.5px solid var(--cinza-borda)", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--azul-claro)" }}>
                  <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "var(--azul-profundo)", fontSize: 12 }}>Semana</th>
                  <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "var(--azul-profundo)", fontSize: 12 }}>P1 — Pessoal</th>
                  <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "var(--azul-profundo)", fontSize: 12 }}>P3 — Operações</th>
                  <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "var(--azul-profundo)", fontSize: 12 }}>P4 — Logística</th>
                </tr>
              </thead>
              <tbody>
                {proximasSemanasServico.map((s, i) => {
                  const eu = s.p1?.mat===minhaMatricula||s.p3?.mat===minhaMatricula||s.p4?.mat===minhaMatricula
                  return (
                    <tr key={s.semana} style={{ borderTop: "1px solid var(--cinza-borda)", background: eu ? "var(--azul-claro)" : i===0?"var(--creme)":"#fff" }}>
                      <td style={{ padding: "10px 14px", fontWeight: i===0?700:400, color: "var(--azul-profundo)" }}>
                        {s.semana}/52{i===0?" (atual)":""}
                      </td>
                      <td style={{ padding: "10px 14px", fontWeight: s.p1?.mat===minhaMatricula?700:400 }}>{s.p1?.nome ?? "—"}</td>
                      <td style={{ padding: "10px 14px", fontWeight: s.p3?.mat===minhaMatricula?700:400 }}>{s.p3?.nome ?? "—"}</td>
                      <td style={{ padding: "10px 14px", fontWeight: s.p4?.mat===minhaMatricula?700:400 }}>{s.p4?.nome ?? "—"}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ABA FAXINA ── */}
      {aba === "faxina" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginBottom: 28 }}>
            {(Object.keys(composicaoFaxina) as GrupoFaxina[]).map(g => {
              const euSou = composicaoFaxina[g].some(p => p.mat === minhaMatricula)
              return (
                <div key={g} style={{
                  background: euSou ? "var(--azul-claro)" : "#fff",
                  border: `1.5px solid ${euSou ? "var(--azul-medio)" : "var(--cinza-borda)"}`,
                  borderRadius: 12, padding: 14,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <TagGrupo grupo={g} />
                    {euSou && <span style={{ fontSize: 11, color: "var(--azul-medio)", fontWeight: 600 }}>← você</span>}
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 12, color: "var(--grafite)" }}>
                    {composicaoFaxina[g].map(p => (
                      <li key={p.mat} style={{ padding: "2px 0", fontWeight: p.mat===minhaMatricula?700:400 }}>
                        {p.mat} {p.nome}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--azul-profundo)", marginBottom: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Calendário — {MESES[mes]}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, fontSize: 11, marginBottom: 8 }}>
            {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d => (
              <div key={d} style={{ textAlign: "center", fontWeight: 700, color: "var(--cinza-texto)", padding: 4 }}>{d}</div>
            ))}
          </div>
          {(() => {
            const primeiroDia = new Date(ano, mes - 1, 1).getDay()
            const cells: (DiaCal | null)[] = Array(primeiroDia).fill(null).concat(calendario as DiaCal[])
            while (cells.length % 7 !== 0) cells.push(null)
            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                {cells.map((dia, i) => {
                  if (!dia) return <div key={i} />
                  const d = new Date(dia.data)
                  const meuGrupo = isMinhaFaxina(dia.grupoFaxina)
                  return (
                    <div key={i} style={{
                      background: meuGrupo ? "var(--azul-claro)" : dia.tipo==="fds" ? "#F8FAFC" : "#fff",
                      border: `1.5px solid ${meuGrupo ? "var(--azul-medio)" : "var(--cinza-borda)"}`,
                      borderRadius: 8, padding: "6px 4px", textAlign: "center", minHeight: 56,
                    }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: dia.tipo==="fds"?"var(--cinza-texto)":"var(--grafite)", marginBottom: 3 }}>
                        {d.getDate()}
                      </p>
                      {dia.tipo === "util" && dia.grupoFaxina && <TagGrupo grupo={dia.grupoFaxina} small />}
                      {dia.tipo === "fds" && <span style={{ fontSize: 10, color: "var(--cinza-texto)" }}>FDS<br/>{dia.grupoPlantao}</span>}
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>
      )}

      {/* ── ABA PLANTÃO ── */}
      {aba === "plantao" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12, marginBottom: 28 }}>
            {(["LIMA","GOLF","HOTEL","INDIA","JULIETT","KILO"] as GrupoPlantao[]).map(g => {
              const membros = membrosPlantao[g] || []
              const temEu = membros.some(m => m.mat === minhaMatricula)
              return (
                <div key={g} style={{
                  background: temEu ? "var(--azul-claro)" : "#fff",
                  border: `1.5px solid ${temEu ? "var(--azul-medio)" : "var(--cinza-borda)"}`,
                  borderRadius: 12, padding: 14,
                }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "var(--azul-profundo)", marginBottom: 8 }}>
                    {g} {temEu && <span style={{ fontSize: 11, color: "var(--azul-medio)" }}>← você</span>}
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 12 }}>
                    {membros.map(m => (
                      <li key={m.mat} style={{ padding: "1px 0", fontWeight: m.mat===minhaMatricula?700:400 }}>
                        {m.mat} {m.nome}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--azul-profundo)", marginBottom: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Adjuntos da Turma 13 — {MESES[mes]}
          </h2>

          {plantaoDias.filter(p => p.adjuntoMat).length === 0 && (
            <p style={{ color: "var(--cinza-texto)", fontSize: 13, marginBottom: 16 }}>
              Nenhum dado inserido ainda para este mês.
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
            {plantaoDias.filter(p => p.adjuntoMat).map(p => {
              const d = new Date(p.data)
              const eu = p.adjuntoMat === minhaMatricula
              return (
                <div key={p.id} style={{
                  background: eu ? "var(--azul-claro)" : "#fff",
                  border: `1.5px solid ${eu ? "var(--azul-medio)" : "var(--cinza-borda)"}`,
                  borderRadius: 10, padding: "10px 16px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "var(--azul-profundo)" }}>
                      {d.toLocaleDateString("pt-BR", { weekday:"short", day:"2-digit", month:"short" })}
                    </span>
                    <span style={{ marginLeft: 12, fontSize: 12, color: "var(--cinza-texto)" }}>{p.grupoPlantao}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: eu?700:400 }}>
                    {nomesPorMat[p.adjuntoMat!] ?? `Mat.${p.adjuntoMat}`}
                    {eu && <span style={{ marginLeft: 6, fontSize: 11, color: "var(--azul-medio)" }}>← você</span>}
                  </div>
                </div>
              )
            })}
          </div>

          {isAdmin && (
            <div>
              <button onClick={() => setShowPlantaoForm(!showPlantaoForm)} style={{
                background: "var(--azul-profundo)", color: "#fff", border: "none",
                borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>
                {showPlantaoForm ? "Cancelar" : "Inserir adjuntos do mês"}
              </button>

              {showPlantaoForm && (
                <div style={{ marginTop: 16, background: "var(--azul-claro)", borderRadius: 12, padding: 20 }}>
                  <p style={{ fontSize: 12, color: "var(--cinza-texto)", marginBottom: 12 }}>
                    Informe as datas em que alunos da Turma 13 são adjuntos da 2ª CIA. O grupo de plantão é calculado automaticamente.
                  </p>
                  {plantaoEntradas.map((e, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                      <input type="date" value={e.data} onChange={ev => {
                        const n=[...plantaoEntradas]; n[i]={...n[i],data:ev.target.value}; setPlantaoEntradas(n)
                      }} style={{ border: "1px solid var(--cinza-borda)", borderRadius: 6, padding: "6px 10px", fontSize: 13 }} />
                      <select value={e.adjuntoMat} onChange={ev => {
                        const n=[...plantaoEntradas]; n[i]={...n[i],adjuntoMat:ev.target.value}; setPlantaoEntradas(n)
                      }} style={{ border: "1px solid var(--cinza-borda)", borderRadius: 6, padding: "6px 10px", fontSize: 13 }}>
                        <option value="">— Adjunto (turma 13) —</option>
                        {alunos.map(a => <option key={a.matricula} value={a.matricula}>{a.matricula} {a.nomeGuerra}</option>)}
                      </select>
                      {plantaoEntradas.length > 1 && (
                        <button onClick={() => setPlantaoEntradas(plantaoEntradas.filter((_,j)=>j!==i))}
                          style={{ background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>✕</button>
                      )}
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button onClick={() => setPlantaoEntradas([...plantaoEntradas,{data:"",adjuntoMat:""}])}
                      style={{ background: "#e0e7ff", color: "var(--azul-profundo)", border: "none", borderRadius: 6, padding: "7px 14px", fontSize: 12, cursor: "pointer" }}>
                      + Linha
                    </button>
                    <button onClick={salvarPlantao} disabled={saving}
                      style={{ background: "var(--dourado)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      {saving ? "Salvando…" : "Salvar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── ABA FUNÇÕES DE DESTAQUE ── */}
      {aba === "destaque" && (
        <div>
          {funcoesDias.length === 0 && (
            <p style={{ color: "var(--cinza-texto)", fontSize: 13, marginBottom: 16 }}>
              Nenhuma função de destaque registrada para este mês.
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
            {Array.from(funcoesPorData.entries()).map(([dataKey, funcs]) => {
              const d = new Date(dataKey + "T12:00:00")
              const euTenho = funcs.some(f => f.matricula === minhaMatricula)
              return (
                <div key={dataKey} style={{
                  background: euTenho ? "var(--azul-claro)" : "#fff",
                  border: `1.5px solid ${euTenho ? "var(--azul-medio)" : "var(--cinza-borda)"}`,
                  borderRadius: 12, padding: "12px 16px",
                }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "var(--azul-profundo)", marginBottom: 8 }}>
                    {d.toLocaleDateString("pt-BR", { weekday:"long", day:"2-digit", month:"long" })}
                    {euTenho && <span style={{ marginLeft: 8, fontSize: 11, color: "var(--azul-medio)", fontWeight: 600 }}>← você tem função</span>}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {funcs.map(f => (
                      <div key={f.id} style={{
                        background: f.matricula===minhaMatricula?"var(--azul-profundo)":"var(--creme)",
                        color: f.matricula===minhaMatricula?"#fff":"var(--grafite)",
                        borderRadius: 8, padding: "6px 12px", fontSize: 12,
                        display: "flex", alignItems: "center", gap: 8,
                      }}>
                        <span style={{ fontWeight: 600 }}>{f.funcao}</span>
                        <span>{nomesPorMat[f.matricula] ?? `Mat.${f.matricula}`}</span>
                        {isAdmin && (
                          <button onClick={() => deletarFuncao(f.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: f.matricula===minhaMatricula?"rgba(255,255,255,0.7)":"var(--cinza-texto)", fontSize: 13, padding: 0, lineHeight: 1 }}>×</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {isAdmin && (
            <div>
              <button onClick={() => setShowFuncaoForm(!showFuncaoForm)} style={{
                background: "var(--azul-profundo)", color: "#fff", border: "none",
                borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>
                {showFuncaoForm ? "Cancelar" : "Inserir funções do mês"}
              </button>

              {showFuncaoForm && (
                <div style={{ marginTop: 16, background: "var(--azul-claro)", borderRadius: 12, padding: 20 }}>
                  <p style={{ fontSize: 12, color: "var(--cinza-texto)", marginBottom: 12 }}>
                    Registre os dias em que alunos da Turma 13 têm funções de destaque (Mestre, Leitor, Discurso, Comandante).
                  </p>
                  {funcaoEntradas.map((e, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                      <input type="date" value={e.data} onChange={ev => {
                        const n=[...funcaoEntradas]; n[i]={...n[i],data:ev.target.value}; setFuncaoEntradas(n)
                      }} style={{ border: "1px solid var(--cinza-borda)", borderRadius: 6, padding: "6px 10px", fontSize: 13 }} />
                      <select value={e.funcao} onChange={ev => {
                        const n=[...funcaoEntradas]; n[i]={...n[i],funcao:ev.target.value}; setFuncaoEntradas(n)
                      }} style={{ border: "1px solid var(--cinza-borda)", borderRadius: 6, padding: "6px 10px", fontSize: 13 }}>
                        {FUNCOES_DESTAQUE.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <select value={e.matricula} onChange={ev => {
                        const n=[...funcaoEntradas]; n[i]={...n[i],matricula:ev.target.value}; setFuncaoEntradas(n)
                      }} style={{ border: "1px solid var(--cinza-borda)", borderRadius: 6, padding: "6px 10px", fontSize: 13 }}>
                        <option value="">— Aluno —</option>
                        {alunos.map(a => <option key={a.matricula} value={a.matricula}>{a.matricula} {a.nomeGuerra}</option>)}
                      </select>
                      {funcaoEntradas.length > 1 && (
                        <button onClick={() => setFuncaoEntradas(funcaoEntradas.filter((_,j)=>j!==i))}
                          style={{ background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>✕</button>
                      )}
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button onClick={() => setFuncaoEntradas([...funcaoEntradas,{data:"",funcao:"Mestre",matricula:""}])}
                      style={{ background: "#e0e7ff", color: "var(--azul-profundo)", border: "none", borderRadius: 6, padding: "7px 14px", fontSize: 12, cursor: "pointer" }}>
                      + Linha
                    </button>
                    <button onClick={salvarFuncoes} disabled={saving}
                      style={{ background: "var(--dourado)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      {saving ? "Salvando…" : "Salvar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
