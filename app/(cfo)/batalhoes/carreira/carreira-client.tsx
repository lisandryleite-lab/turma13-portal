"use client"

import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { CENARIOS, FIXADO, FOLHA, PADRAO, POSTOS, T1, T2, dataDoMes, mesDe, rotuloMes, simular, type Gargalo, type Parametros, type Perfil } from "@/lib/carreira"
import { IDADE_LIMITE_OFICIAL, calcularReserva, type DadosPessoais } from "@/lib/reserva-pmpe"
import { Divisas, NOME_DIVISA } from "./divisas"

// Dados pessoais (nascimento, ingresso…) ficam só neste aparelho
const CHAVE_PESSOAL = "carreira-dados-pessoais"

const caixa: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid rgba(58,74,58,0.12)", padding: 18 }
const h2: React.CSSProperties = { fontFamily: "var(--serif-cfo)", fontSize: "1.2rem", color: "var(--olive)", margin: 0 }
const rotulo: React.CSSProperties = { fontSize: 10.5, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }
const pilula = (ativo: boolean): React.CSSProperties => ({
  padding: "6px 12px", borderRadius: 999, border: "1px solid rgba(58,74,58,0.18)", cursor: "pointer", fontSize: 12.5, fontWeight: 600, fontFamily: "inherit",
  background: ativo ? "var(--olive)" : "#fff", color: ativo ? "var(--canvas)" : "var(--ink-60)",
})
const campo: React.CSSProperties = { padding: "7px 10px", borderRadius: 10, border: "1px solid rgba(58,74,58,0.25)", background: "#fff", fontSize: 14, fontFamily: "inherit" }

const PERFIS: { id: Perfil; rot: string; desc: string }[] = [
  { id: "antiguidade", rot: "Só antiguidade", desc: "você sobe na ordem da fila" },
  { id: "bom", rot: "Bom no merecimento", desc: "passa à frente de metade dos habilitados em 6 de março" },
  { id: "destaque", rot: "Destaque", desc: "é o primeiro do Quadro de Acesso por Merecimento" },
]
const GARGALO: Record<Gargalo, { rot: string; cor: string; explica: string }> = {
  "interstício": { rot: "no tempo mínimo", cor: "#3a7a3a", explica: "subiu assim que completou o interstício — havia vaga" },
  reduzido: { rot: "interstício reduzido", cor: "#2457b5", explica: "subiu antes do tempo cheio, com o interstício reduzido à metade (art. 26)" },
  vaga: { rot: "esperou vaga", cor: "#b5933f", explica: "já tinha o tempo mínimo, mas os mais antigos ocupavam as vagas" },
  curso: { rot: "esperou curso", cor: "#7a2e2e", explica: "esperou concluir o CAO/CSP" },
  decenal: { rot: "pela decenal", cor: "#2457b5", explica: "a promoção decenal (10/20 anos de oficial) chegou antes da vaga" },
  requerida: { rot: "pela requerida", cor: "#7a2e2e", explica: "promoção requerida junto com o pedido de reserva — só para quem ingressou na PMPE até 31/12/2021 (LC 470, art. 13)" },
}
const MOTIVO = {
  integral: "a pedido, com o tempo integral",
  compulsoria: `de ofício, aos ${IDADE_LIMITE_OFICIAL} anos de idade`,
  tc5: "de ofício: Ten-Cel há mais de 5 anos com 35 de serviço (art. 90, X)",
}
const anos = (m: number) => { const a = m / 12; return a < 1 ? `${Math.round(m)} meses` : `${a.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} anos` }

export function CarreiraClient({ tamanhoTurma, posicaoSugerida }: { tamanhoTurma: number; posicaoSugerida: number | null }) {
  const inicial: Parametros = { ...PADRAO, tamanhoTurma, posicao: Math.min(posicaoSugerida ?? Math.ceil(tamanhoTurma / 2), tamanhoTurma) }
  const [p, setP] = useState<Parametros>(inicial)
  const [cenario, setCenario] = useState("base")
  const set = <K extends keyof Parametros>(k: K, v: Parametros[K]) => { setP(x => ({ ...x, [k]: v })); if (k === "saidas" || k === "reducaoArt26" || k === "aumentoEfetivo") setCenario("") }
  const setPes = <K extends keyof DadosPessoais>(k: K, v: DadosPessoais[K]) => setP(x => ({ ...x, pessoal: { ...x.pessoal, [k]: v } }))
  useEffect(() => {
    try {
      const s = localStorage.getItem(CHAVE_PESSOAL)
      if (s) { const d = JSON.parse(s); setP(x => ({ ...x, pessoal: { ...x.pessoal, ...d.pessoal }, sairNaIntegral: d.sairNaIntegral ?? x.sairNaIntegral })) }
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem(CHAVE_PESSOAL, JSON.stringify({ pessoal: p.pessoal, sairNaIntegral: p.sairNaIntegral })) } catch {}
  }, [p.pessoal, p.sairNaIntegral])
  const res = useMemo(() => calcularReserva(p.pessoal), [p.pessoal])
  const idade = new Date().getFullYear() - p.pessoal.nascimento
  const adiado = useDeferredValue(p)
  const r = useMemo(() => simular(adiado), [adiado])
  // Comparação: mesma posição e mesmos dados pessoais, cenário base e só antiguidade
  const base = useMemo(
    () => simular({ ...PADRAO, posicao: adiado.posicao, tamanhoTurma: adiado.tamanhoTurma, formatura: adiado.formatura, pessoal: adiado.pessoal, sairNaIntegral: adiado.sairNaIntegral }),
    [adiado.posicao, adiado.tamanhoTurma, adiado.formatura, adiado.pessoal, adiado.sairNaIntegral],
  )
  const neutro = (x: Parametros) => JSON.stringify({ ...x, posicao: 0, tamanhoTurma: 0, formatura: "", pessoal: null, sairNaIntegral: true })
  const ehBase = neutro(p) === neutro(PADRAO)
  const asp = mesDe(p.formatura)
  const pendente = adiado !== p

  // Linha do tempo (SVG)
  const A0 = 2026, A1 = 2062, X0 = 78, X1 = 708, LIN = 40, TOPO = 28
  const xDe = (mes: number) => { const { ano, mes: mm } = dataDoMes(mes); return X0 + ((ano + (mm - 1) / 12 - A0) / (A1 - A0)) * (X1 - X0) }
  const altura = TOPO + LIN * 6 + 22

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, opacity: pendente ? 0.85 : 1, transition: "opacity .15s" }}>
      {/* Variáveis */}
      <section style={caixa}>
        <h2 style={h2}>Suas variáveis</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginTop: 12 }}>
          <div>
            <div style={rotulo}>Sua classificação final no CFO</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <input type="number" min={1} max={p.tamanhoTurma} value={p.posicao} onChange={e => set("posicao", Math.max(1, Math.min(p.tamanhoTurma, Number(e.target.value) || 1)))} style={{ ...campo, width: 80 }} aria-label="Classificação" />
              <span style={{ fontSize: 13, color: "var(--ink-60)" }}>de</span>
              <input type="number" min={1} max={400} value={p.tamanhoTurma} onChange={e => { const n = Math.max(1, Number(e.target.value) || 1); setP(x => ({ ...x, tamanhoTurma: n, posicao: Math.min(x.posicao, n) })) }} style={{ ...campo, width: 80 }} aria-label="Tamanho da turma" />
            </div>
            <input type="range" min={1} max={p.tamanhoTurma} value={p.posicao} onChange={e => set("posicao", Number(e.target.value))} style={{ width: "100%", marginTop: 8, accentColor: "var(--olive)" }} aria-label="Classificação (deslizar)" />
            <div style={{ fontSize: 12, color: "var(--ink-60)" }}>
              {posicaoSugerida ? <>Pelo seu ranking: <button onClick={() => set("posicao", posicaoSugerida)} style={{ background: "none", border: "none", padding: 0, color: "var(--olive)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 12, textDecoration: "underline" }}>{posicaoSugerida}º</button> (posição provável)</> : "Lance suas notas no Ranking para sugerir sua posição."}
            </div>
          </div>
          <div>
            <div style={rotulo}>Cenário</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
              {CENARIOS.map(c => <button key={c.id} onClick={() => { setCenario(c.id); setP(x => ({ ...x, ...c.p })) }} style={pilula(cenario === c.id)}>{c.nome}</button>)}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-60)", marginTop: 6 }}>{CENARIOS.find(c => c.id === cenario)?.desc ?? "Personalizado"}</div>
          </div>
          <div>
            <div style={rotulo}>Seu desempenho no merecimento</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
              {PERFIS.map(x => <button key={x.id} onClick={() => set("perfil", x.id)} style={pilula(p.perfil === x.id)}>{x.rot}</button>)}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-60)", marginTop: 6 }}>{PERFIS.find(x => x.id === p.perfil)!.desc} (vale de 1º Ten para cima)</div>
          </div>
        </div>

        <details style={{ marginTop: 14 }}>
          <summary style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "var(--olive)" }}>
            Seus dados para a reserva{" "}
            <span style={{ fontWeight: 400, color: "var(--ink-60)" }}>
              · {idade} anos · ingresso em {p.pessoal.ingresso.split("-").reverse().join("/")} · {res.regra === "nova" ? "regra nova" : res.regra === "transicao" ? "transição + requerida" : "direito adquirido"}
            </span>
          </summary>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginTop: 12 }}>
            <label style={{ display: "block" }}>
              <span style={rotulo}>Ano em que nasceu</span>
              <select value={p.pessoal.nascimento} onChange={e => setPes("nascimento", Number(e.target.value))} style={{ ...campo, display: "block", marginTop: 6, width: 110 }}>
                {Array.from({ length: 2008 - 1960 + 1 }, (_, i) => 2008 - i).map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <span style={{ fontSize: 12, color: "var(--ink-60)" }}>Compulsória aos {IDADE_LIMITE_OFICIAL} anos: em {p.pessoal.nascimento + IDADE_LIMITE_OFICIAL}.</span>
            </label>
            <label style={{ display: "block" }}>
              <span style={rotulo}>Ingresso na PMPE</span>
              <input type="month" value={p.pessoal.ingresso} min="1985-01" max="2026-12" onChange={e => e.target.value && setPes("ingresso", e.target.value)} style={{ ...campo, display: "block", marginTop: 6 }} />
              <span style={{ fontSize: 12, color: "var(--ink-60)" }}>Ex-praça: a inclusão como soldado. Senão, a do CFO.</span>
            </label>
            <label style={{ display: "block" }}>
              <span style={rotulo}>Serviço anterior averbado: {p.pessoal.averbado} {p.pessoal.averbado === 1 ? "ano" : "anos"}</span>
              <input type="range" min={0} max={20} step={1} value={p.pessoal.averbado} onChange={e => setPes("averbado", Number(e.target.value))} style={{ width: "100%", accentColor: "var(--olive)" }} />
              <span style={{ fontSize: 12, color: "var(--ink-60)" }}>Tempo de contribuição antes da PMPE: INSS, serviço público ou Forças Armadas (art. 74-AB).</span>
            </label>
            <div>
              <div style={rotulo}>Sexo</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                {(["M", "F"] as const).map(s => <button key={s} onClick={() => setPes("sexo", s)} style={pilula(p.pessoal.sexo === s)}>{s === "M" ? "Masculino" : "Feminino"}</button>)}
              </div>
              <span style={{ fontSize: 12, color: "var(--ink-60)" }}>Só muda a regra de transição (30 ou 25 anos).</span>
            </div>
            <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={p.sairNaIntegral} onChange={e => set("sairNaIntegral", e.target.checked)} style={{ marginTop: 3, accentColor: "var(--olive)" }} />
              <span><strong>Peço a reserva assim que tiver o tempo integral</strong><br /><span style={{ color: "var(--ink-60)" }}>Desligado, a simulação segue até a compulsória por idade.</span></span>
            </label>
          </div>
          <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 12.5, lineHeight: 1.55 }}>
            {res.detalhe.map(d => <li key={d}>{d}</li>)}
            <li>{res.requerida
              ? <>Você ingressou até 31/12/2021: <strong>tem direito à promoção requerida</strong> ao pedir a reserva — sobe um posto, sem vaga nem interstício (não vale para quem já é coronel).</>
              : <>Ingresso a partir de 2022: <strong>sem promoção requerida</strong> — ela só vale para quem entrou na Corporação até 31/12/2021.</>}</li>
          </ul>
          <p style={{ margin: "8px 0 0", fontSize: 11.5, color: "var(--ink-60)" }}>Esses dados ficam só neste aparelho. A contagem oficial é a da Diretoria de Pessoal, com as certidões averbadas.</p>
        </details>

        <details style={{ marginTop: 10 }}>
          <summary style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "var(--olive)" }}>Mais variáveis</summary>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginTop: 12 }}>
            <label style={{ display: "block" }}>
              <span style={rotulo}>Ritmo de ida para a reserva: {p.saidas.toLocaleString("pt-BR")}×</span>
              <input type="range" min={0.4} max={2} step={0.1} value={p.saidas} onChange={e => set("saidas", Number(e.target.value))} style={{ width: "100%", accentColor: "var(--olive)" }} />
              <span style={{ fontSize: 12, color: "var(--ink-60)" }}>Mais saídas = mais vagas em cascata. 1× ≈ 18% dos coronéis e 9% dos tenentes-coronéis por ano.</span>
            </label>
            <label style={{ display: "block" }}>
              <span style={rotulo}>Atraso para concluir CAO / CSP: {p.atrasoCursos} {p.atrasoCursos === 1 ? "ano" : "anos"}</span>
              <input type="range" min={0} max={5} step={1} value={p.atrasoCursos} onChange={e => set("atrasoCursos", Number(e.target.value))} style={{ width: "100%", accentColor: "var(--olive)" }} />
              <span style={{ fontSize: 12, color: "var(--ink-60)" }}>Além do interstício. CAO é exigido para Major e Ten-Cel; CSP para Coronel.</span>
            </label>
            <label style={{ display: "block" }}>
              <span style={rotulo}>Aumento do efetivo fixado: +{p.aumentoEfetivo}%</span>
              <input type="range" min={0} max={40} step={5} value={p.aumentoEfetivo} onChange={e => set("aumentoEfetivo", Number(e.target.value))} style={{ width: "100%", accentColor: "var(--olive)" }} />
              <span style={{ fontSize: 12, color: "var(--ink-60)" }}>Se uma nova lei ampliar o quadro de oficiais (hoje, LC nº 152/2009).</span>
            </label>
            <label style={{ display: "block" }}>
              <span style={rotulo}>Data da formatura (nomeação como aspirante)</span>
              <input type="date" value={p.formatura} min="2026-11-01" max="2027-12-31" onChange={e => e.target.value && set("formatura", e.target.value)} style={{ ...campo, display: "block", marginTop: 6 }} />
            </label>
            <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={p.reducaoArt26} onChange={e => set("reducaoArt26", e.target.checked)} style={{ marginTop: 3, accentColor: "var(--olive)" }} />
              <span><strong>Interstício reduzido à metade (art. 26)</strong><br /><span style={{ color: "var(--ink-60)" }}>Ato do Governador quando há mais claros do que habilitados — hoje faltam capitães e 1º tenentes.</span></span>
            </label>
            <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={p.aspPrecisaVaga} onChange={e => set("aspPrecisaVaga", e.target.checked)} style={{ marginTop: 3, accentColor: "var(--olive)" }} />
              <span><strong>Aspirante só vira 2º Ten se houver vaga</strong><br /><span style={{ color: "var(--ink-60)" }}>Leitura estrita do efetivo fixado. A T1 foi promovida em 6 meses, por isso vem desligado.</span></span>
            </label>
          </div>
        </details>
      </section>

      {/* Resultado */}
      <section style={caixa}>
        <h2 style={h2}>Sua carreira prevista</h2>
        <p style={{ margin: "4px 0 12px", fontSize: 13, color: "var(--ink-60)" }}>
          {p.posicao}º de {p.tamanhoTurma} · aspirante em {rotuloMes(asp)}{!ehBase ? " · em cinza claro, o cenário base com a mesma classificação" : ""}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
          {r.voce.map((e, i) => {
            const g = e.gargalo ? GARGALO[e.gargalo] : null
            const b = base.voce[i].mes
            const dif = e.mes != null && b != null && !ehBase ? Math.round((e.mes - b) / 12 * 10) / 10 : 0
            return (
              <div key={e.posto} style={{ padding: "10px 12px", borderRadius: 12, background: "var(--surface)" }}>
                <div title={NOME_DIVISA[e.posto]} style={{ height: 20, marginBottom: 4 }}><Divisas posto={e.posto} /></div>
                <div style={rotulo}>{POSTOS[e.posto]}</div>
                {e.mes != null ? <>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "var(--olive)", marginTop: 2 }}>{rotuloMes(e.mes)}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-60)" }}>{anos(e.mes - asp)} de oficial</div>
                  {g && <div style={{ fontSize: 11, fontWeight: 700, color: g.cor, marginTop: 3 }}>● {g.rot}</div>}
                  {dif !== 0 && <div style={{ fontSize: 11, color: dif < 0 ? "#3a7a3a" : "var(--red)", marginTop: 2 }}>{dif < 0 ? "▼" : "▲"} {Math.abs(dif).toLocaleString("pt-BR")} ano{Math.abs(dif) >= 2 ? "s" : ""} vs. base</div>}
                </> : <div style={{ fontSize: 12.5, color: "var(--ink-60)", marginTop: 4, lineHeight: 1.35 }}>não chega antes da reserva</div>}
              </div>
            )
          })}
        </div>

        {/* Linha do tempo */}
        <div style={{ overflowX: "auto", margin: "16px -6px 0", padding: "0 6px" }}>
          <svg viewBox={`0 0 720 ${altura}`} style={{ display: "block", width: "100%", minWidth: 600, height: "auto" }} role="img" aria-label="Linha do tempo da carreira">
            {Array.from({ length: (A1 - A0) / 4 + 1 }, (_, i) => A0 + i * 4).map(a => {
              const x = X0 + ((a - A0) / (A1 - A0)) * (X1 - X0)
              return <g key={a}><line x1={x} x2={x} y1={TOPO - 6} y2={altura - 20} stroke="var(--surface)" /><text x={x} y={altura - 6} fontSize={11} textAnchor="middle" fill="var(--ink-60)">{a}</text></g>
            })}
            {r.voce.map((e, i) => {
              const y = TOPO + LIN * (5 - i) + LIN / 2
              const t = r.turma[i]
              const fim = t.ultimo ?? null
              const b = base.voce[i].mes
              return (
                <g key={e.posto}>
                  <text x={X0 - 10} y={y + 4} fontSize={12} textAnchor="end" fill="var(--ink)" fontWeight={600}>{POSTOS[e.posto]}</text>
                  <line x1={X0} x2={X1} y1={y} y2={y} stroke="rgba(58,74,58,0.12)" />
                  {t.primeiro != null && <rect x={xDe(t.primeiro)} y={y - 7} width={Math.max(3, (fim != null ? xDe(fim) : X1) - xDe(t.primeiro))} height={14} rx={7} fill="rgba(58,74,58,0.16)" />}
                  {r.t1[i] != null && <text x={xDe(r.t1[i]!)} y={y - 10} fontSize={9} textAnchor="middle" fill="var(--ink-60)">T1</text>}
                  {r.t2[i] != null && <text x={xDe(r.t2[i]!)} y={y - 10} fontSize={9} textAnchor="middle" fill="var(--ink-60)">T2</text>}
                  {!ehBase && b != null && <circle cx={xDe(b)} cy={y} r={5.5} fill="#fff" stroke="rgba(43,42,39,0.35)" strokeWidth={1.5} />}
                  {e.mes != null && <>
                    <circle cx={xDe(e.mes)} cy={y} r={6.5} fill="var(--gold)" stroke="#fff" strokeWidth={2} />
                    <text x={xDe(e.mes)} y={y + 20} fontSize={10.5} textAnchor="middle" fill="var(--ink)" fontWeight={700}>{dataDoMes(e.mes).ano}</text>
                  </>}
                </g>
              )
            })}
          </svg>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 11.5, color: "var(--ink-60)", marginTop: 6 }}>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 99, background: "var(--gold)", marginRight: 4, verticalAlign: -1 }} />você</span>
          <span><span style={{ display: "inline-block", width: 22, height: 8, borderRadius: 99, background: "rgba(58,74,58,0.16)", marginRight: 4 }} />sua turma, do 1º ao último a subir</span>
          <span>T1 / T2: quando metade da turma chega ao posto</span>
        </div>

        {/* Por quê */}
        <ul style={{ margin: "14px 0 0", paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
          {r.voce.filter(e => e.mes != null && e.gargalo).map(e => <li key={e.posto}><strong>{POSTOS[e.posto]}</strong>: {GARGALO[e.gargalo!].explica}.</li>)}
          {r.reserva != null && (
            <li>
              Reserva em <strong>{rotuloMes(r.reserva.mes)}</strong>, {MOTIVO[r.reserva.motivo]}, como <strong>{POSTOS[r.reserva.posto]}</strong>
              {r.reserva.quotas < 35 ? <> — proventos proporcionais: {r.reserva.quotas}/35 ({Math.round((r.reserva.quotas / 35) * 100)}%)</> : " — proventos integrais"}.
            </li>
          )}
        </ul>
      </section>

      {/* Premissas */}
      <section style={{ ...caixa, background: "#fbf7ec", border: "1px solid rgba(181,147,63,0.3)" }}>
        <h2 style={{ ...h2, fontSize: "1.05rem" }}>Como a simulação funciona</h2>
        <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 12.5, lineHeight: 1.6 }}>
          <li>Acompanha mês a mês cada oficial QOPM. Hoje: {[6, 5, 4, 3, 2, 1].map(k => `${FOLHA[k]} ${POSTOS[k]}`).join(" · ")} (folha de set/2026), contra um efetivo fixado de {[6, 5, 4, 3, 2, 1].map(k => `${FIXADO[k]}`).join(" · ")} (LC nº 152/2009).</li>
          <li>Na frente da nossa turma estão a T1 ({T1.tamanho}, 2º Ten desde jun/2026), a T2 ({T2.tamanho} aspirantes desde jun/2026) e os oficiais que já estão nos postos. Turmas depois da nossa não passam à nossa frente por antiguidade.</li>
          <li>Quem já está num posto com claros e não foi promovido ainda não tem o interstício; supomos que completa ao longo do próximo interstício.</li>
          <li>Vagas abrem com a ida para a reserva e descem em cascata. Antiguidade preenche na hora; merecimento só em 6 de março, entre os 40% mais antigos (1:1 até Major; 2:1 para Ten-Cel e Coronel). A decenal promove sem vaga com 10 e 20 anos de oficial.</li>
          <li>O ritmo de reserva por posto é uma estimativa do portal (não há série pública). Os outros oficiais seguem a ordem de antiguidade no merecimento; só o seu desempenho muda.</li>
          <li><strong>Previsão não oficial.</strong> Muda com novas leis, concursos, reduções de interstício e com a própria SDS.</li>
        </ul>
      </section>
    </div>
  )
}
