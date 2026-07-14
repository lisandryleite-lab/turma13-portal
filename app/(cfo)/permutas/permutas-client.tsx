"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { CORES_PLANTAO, GRUPOS_PLANTAO } from "@/lib/escalas"

const MESES_NOMES = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

type Me = { id: string; matricula: number; nomeGuerra: string; grupoPlantao: string | null } | null
type DiaCal = { data: string; diaSemana: string; tipo: "util" | "fds"; grupoPlantao: string }
type Mes = { ano: number; mes: number }
type Militar = { matricula: number; nome: string; grupoPlantao: string }
type Oferta = {
  id: string; userId: string; cedeData: string
  user: { matricula: number; nomeGuerra: string; grupoPlantao: string }
}
type Participante = {
  id: string; solicitacaoId: string; ordem: number; userId: string | null
  matricula: number; nome: string; grupoPlantao: string; cedeData: string
  status: string; respondidoEm: string | null
}
type Solicitacao = {
  id: string; criadoPorId: string; status: string
  seiNumero: string | null; seiObservacao: string | null
  createdAt: string; updatedAt: string
  participantes: Participante[]
}

const dOnly = (iso: string) => iso.slice(0, 10)
const fmtData = (iso: string) => {
  const [y, m, d] = dOnly(iso).split("-")
  return `${d}/${m}/${y}`
}
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const diaSemanaDe = (iso: string) => {
  const [y, m, d] = dOnly(iso).split("-").map(Number)
  return DIAS_SEMANA[new Date(y, m - 1, d).getDay()]
}

function IconSEI({ width = 44 }: { width?: number }) {
  return (
    <svg viewBox="0 0 80 60" fill="none" width={width} height={width * 0.75}>
      <text x="4" y="44" fontSize="38" fontWeight="900" fontFamily="Arial Black,sans-serif" fill="#0072CE">sei</text>
      <text x="63" y="44" fontSize="38" fontWeight="900" fontFamily="Arial Black,sans-serif" fill="#00A651">!</text>
    </svg>
  )
}

function LinkSEI({ numero }: { numero: string }) {
  return (
    <a
      href={`https://sei.pe.gov.br/sei/controlador.php?acao=procedimento_consultar&numero=${encodeURIComponent(numero)}`}
      target="_blank" rel="noopener noreferrer"
      style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        background: "#fff", border: "1.5px solid rgba(0,0,0,0.07)", borderRadius: 14,
        padding: "8px 14px", textDecoration: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
      }}
    >
      <IconSEI width={40} />
      <span style={{ color: "#0072CE", fontWeight: 800, fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        Abrir no SEI ↗
      </span>
    </a>
  )
}

function TagGrupo({ grupo }: { grupo: string }) {
  const cor = CORES_PLANTAO[grupo] || "#475569"
  return (
    <span style={{ background: cor + "18", color: cor, border: `1px solid ${cor}40`, borderRadius: 6, padding: "2px 9px", fontSize: 11, fontWeight: 700, letterSpacing: "0.02em" }}>
      {grupo}
    </span>
  )
}

function TagTipo({ tipo }: { tipo: "util" | "fds" }) {
  const fds = tipo === "fds"
  return (
    <span style={{ background: fds ? "#FBF0E4" : "#EAF0FB", color: fds ? "#B26A1B" : "#3A63B8", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
      {fds ? "FDS/feriado" : "Dia útil"}
    </span>
  )
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; cor: string; label: string }> = {
    pendente: { bg: "#FBF3DC", cor: "#B8860B", label: "Aguardando…" },
    aceito: { bg: "#EAF6EC", cor: "#3F8C4A", label: "Aceita" },
    aceita: { bg: "#EAF6EC", cor: "#3F8C4A", label: "Aceita · SEI aberto" },
    recusado: { bg: "#FBEAEA", cor: "#C23B3B", label: "Recusada" },
    recusada: { bg: "#FBEAEA", cor: "#C23B3B", label: "Recusada" },
    cancelada: { bg: "#F0F0F0", cor: "#666", label: "Cancelada" },
  }
  const s = map[status] || map.pendente
  return (
    <span style={{ background: s.bg, color: s.cor, borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
      {s.label}
    </span>
  )
}

export function PermutasClient({
  me, isAdmin, dias, meses, militares, ofertasIniciais, solicitacoesIniciais, minhasOfertasIniciais,
}: {
  me: Me
  isAdmin: boolean
  dias: DiaCal[]
  meses: Mes[]
  militares: Militar[]
  ofertasIniciais: Oferta[]
  solicitacoesIniciais: { enviadas: Solicitacao[]; recebidas: Solicitacao[] }
  minhasOfertasIniciais: string[]
}) {
  const [aba, setAba] = useState<"escala" | "disponiveis" | "solicitacoes">("escala")
  const [mesIdx, setMesIdx] = useState(0)
  const [ofertas, setOfertas] = useState(ofertasIniciais)
  const [solicitacoes, setSolicitacoes] = useState(solicitacoesIniciais)
  const [minhasOfertas, setMinhasOfertas] = useState<Set<string>>(new Set(minhasOfertasIniciais))
  const [publicandoData, setPublicandoData] = useState<string | null>(null)
  const [propostaPara, setPropostaPara] = useState<Oferta | null>(null)
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "util" | "fds">("todos")
  const [toast, setToast] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState<Solicitacao | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [filtroSolic, setFiltroSolic] = useState<"recebidas" | "enviadas">("recebidas")
  const [seiInputs, setSeiInputs] = useState<Record<string, string>>({})
  const [militaresLista, setMilitaresLista] = useState(militares)
  const [showAdminMilitares, setShowAdminMilitares] = useState(false)
  const [novoMilitar, setNovoMilitar] = useState({ matricula: "", nome: "", grupoPlantao: GRUPOS_PLANTAO[0] as string })
  const [salvandoMilitar, setSalvandoMilitar] = useState(false)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2400)
  }

  const hojeISO = dOnly(new Date().toISOString())

  function tipoDiaLocal(iso: string): "util" | "fds" {
    return dias.find((d) => d.data === dOnly(iso))?.tipo ?? "util"
  }

  // Hooks precisam vir antes de qualquer return condicional (regras dos Hooks).
  // Usam acesso opcional a `me`; se não houver grupo de plantão, o componente
  // retorna o aviso logo abaixo e esses memos simplesmente não são usados.
  const datasComprometidas = useMemo(() => {
    const set = new Set<string>()
    for (const s of [...solicitacoes.enviadas, ...solicitacoes.recebidas]) {
      if (s.status === "recusada" || s.status === "cancelada") continue
      for (const p of s.participantes) {
        if (p.matricula === me?.matricula && (p.status === "pendente" || p.status === "aceito")) {
          set.add(dOnly(p.cedeData))
        }
      }
    }
    return set
  }, [solicitacoes, me?.matricula])

  // Meus dias de plantão futuros, ainda livres (não amarrados a permuta)
  const meusDiasLivres = useMemo(
    () => dias.filter((d) => d.grupoPlantao === me?.grupoPlantao && d.data >= hojeISO && !datasComprometidas.has(d.data)),
    [dias, me?.grupoPlantao, hojeISO, datasComprometidas]
  )

  const ofertasVisiveis = useMemo(() => {
    return ofertas
      .filter((o) => o.user.grupoPlantao !== me?.grupoPlantao)
      .filter((o) => filtroTipo === "todos" || tipoDiaLocal(o.cedeData) === filtroTipo)
      .sort((a, b) => dOnly(a.cedeData).localeCompare(dOnly(b.cedeData)))
  }, [ofertas, me?.grupoPlantao, filtroTipo, dias])

  if (!me?.grupoPlantao) {
    return (
      <div style={{ maxWidth: 560, margin: "40px auto", textAlign: "center", padding: 24 }}>
        <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: 22, color: "var(--olive)", marginBottom: 12 }}>
          Permuta de Plantões
        </h1>
        <p style={{ color: "var(--cinza-texto)" }}>
          Seu cadastro não tem um grupo de plantão definido. Fale com o admin pra habilitar as permutas.
        </p>
        <Link href="/inicio" style={{ display: "inline-block", marginTop: 16, color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          ← Voltar ao início
        </Link>
      </div>
    )
  }

  const meuGrupo = me.grupoPlantao
  const meuMat = me.matricula
  const meId = me.id

  function statusParaData(iso: string): { status: string; contraparte: string } | null {
    for (const s of [...solicitacoes.enviadas, ...solicitacoes.recebidas]) {
      if (s.status === "recusada" || s.status === "cancelada") continue
      const meuLeg = s.participantes.find((p) => p.matricula === meuMat && dOnly(p.cedeData) === iso)
      if (meuLeg) {
        const outro = s.participantes.find((p) => p.matricula !== meuMat)
        return { status: s.status, contraparte: outro?.nome ?? "" }
      }
    }
    return null
  }

  // ── Marcar / desmarcar "quero trocar" ──────────────────────────
  async function toggleOferta(data: string) {
    const publicada = minhasOfertas.has(data)
    setPublicandoData(data)
    const res = await fetch("/api/permutas/ofertas", {
      method: publicada ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cedeData: data }),
    })
    setPublicandoData(null)
    if (!res.ok) {
      const e = await res.json().catch(() => ({}))
      showToast(e.error || "Erro ao atualizar o dia")
      return
    }
    setMinhasOfertas((prev) => {
      const n = new Set(prev)
      if (publicada) n.delete(data)
      else n.add(data)
      return n
    })
    showToast(publicada ? "Dia removido da troca" : "Dia marcado — já aparece pra turma")
  }

  function meusDiasParaDar(tipo: "util" | "fds") {
    return meusDiasLivres.filter((d) => d.tipo === tipo)
  }

  async function proporTroca(o: Oferta, meuDia: string) {
    setEnviando(true)
    const res = await fetch("/api/permutas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meuCedeData: meuDia,
        parceiro: { matricula: o.user.matricula, cedeData: dOnly(o.cedeData) },
      }),
    })
    setEnviando(false)
    if (!res.ok) {
      const e = await res.json().catch(() => ({}))
      showToast(e.error || "Erro ao propor a troca")
      return
    }
    const nova: Solicitacao = await res.json()
    setOfertas((prev) => prev.filter((x) => x.id !== o.id))
    setMinhasOfertas((prev) => {
      const n = new Set(prev)
      n.delete(meuDia)
      return n
    })
    setSolicitacoes((s) => ({ ...s, enviadas: [nova, ...s.enviadas] }))
    setPropostaPara(null)
    setModalAberto(nova)
  }

  // ── Solicitações ──────────────────────────────────────────────
  async function responder(sol: Solicitacao, acao: "aceitar" | "recusar") {
    const res = await fetch(`/api/permutas/${sol.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao }),
    })
    if (!res.ok) {
      const e = await res.json().catch(() => ({}))
      showToast(e.error || "Erro ao responder")
      return
    }
    const atualizada: Solicitacao = await res.json()
    setSolicitacoes((s) => ({
      enviadas: s.enviadas.map((x) => (x.id === atualizada.id ? atualizada : x)),
      recebidas: s.recebidas.map((x) => (x.id === atualizada.id ? atualizada : x)),
    }))
    showToast(acao === "aceitar" ? "Permuta aceita!" : "Permuta recusada")
  }

  async function salvarSei(sol: Solicitacao) {
    const numero = seiInputs[sol.id]
    if (!numero) return
    const res = await fetch(`/api/permutas/${sol.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seiNumero: numero }),
    })
    if (!res.ok) return
    const atualizada: Solicitacao = await res.json()
    setSolicitacoes((s) => ({
      enviadas: s.enviadas.map((x) => (x.id === atualizada.id ? { ...x, seiNumero: atualizada.seiNumero } : x)),
      recebidas: s.recebidas.map((x) => (x.id === atualizada.id ? { ...x, seiNumero: atualizada.seiNumero } : x)),
    }))
    showToast("Número do SEI salvo")
  }

  async function salvarMilitar() {
    const mat = Number(novoMilitar.matricula)
    if (!mat || !novoMilitar.nome.trim()) return
    setSalvandoMilitar(true)
    const res = await fetch("/api/permutas/militares", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricula: mat, nome: novoMilitar.nome.trim(), grupoPlantao: novoMilitar.grupoPlantao }),
    })
    setSalvandoMilitar(false)
    if (!res.ok) {
      const e = await res.json().catch(() => ({}))
      showToast(e.error || "Erro ao salvar militar")
      return
    }
    const salvo: Militar = await res.json()
    setMilitaresLista((prev) => [...prev.filter((m) => m.matricula !== salvo.matricula), salvo].sort((a, b) => a.matricula - b.matricula))
    setNovoMilitar({ matricula: "", nome: "", grupoPlantao: GRUPOS_PLANTAO[0] })
  }

  async function removerMilitar(matricula: number) {
    if (!confirm(`Remover a matrícula ${matricula} do cadastro de militares?`)) return
    await fetch("/api/permutas/militares", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricula }),
    })
    setMilitaresLista((prev) => prev.filter((m) => m.matricula !== matricula))
  }

  const listaSolic = filtroSolic === "recebidas" ? solicitacoes.recebidas : solicitacoes.enviadas
  const pendentesRecebidas = solicitacoes.recebidas.filter((s) => s.participantes.some((p) => p.matricula === meuMat && p.status === "pendente")).length

  // ── Calendário ──
  const mesAtualObj = meses[mesIdx]
  const diasDoMes = dias.filter((d) => {
    const [y, m] = d.data.split("-").map(Number)
    return y === mesAtualObj.ano && m === mesAtualObj.mes
  })
  const primeiroDiaSemana = diasDoMes.length ? new Date(mesAtualObj.ano, mesAtualObj.mes - 1, 1).getDay() : 0

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "20px 16px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <Link href="/inicio" style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>← Voltar</Link>
        <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: 22, color: "var(--olive)", margin: 0 }}>Permuta de Plantões</h1>
        <span style={{ width: 60 }} />
      </div>

      {/* Abas */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { id: "escala", label: "Minha escala" },
          { id: "disponiveis", label: "Dias disponíveis" },
          { id: "solicitacoes", label: `Solicitações${pendentesRecebidas > 0 ? ` (${pendentesRecebidas})` : ""}` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setAba(t.id as typeof aba)}
            style={{
              border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
              background: aba === t.id ? "var(--azul-profundo)" : "transparent",
              color: aba === t.id ? "#fff" : "var(--cinza-texto)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Minha escala ── */}
      {aba === "escala" && (
        <>
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid var(--cinza-borda)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 800, fontSize: 15, textTransform: "uppercase", color: "var(--azul-profundo)" }}>
                  PLANTÃO · {MESES_NOMES[mesAtualObj.mes]} {mesAtualObj.ano}
                </span>
                {mesIdx === 0 && (
                  <span style={{ background: "#EED9A8", color: "#7A5A12", fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "2px 10px" }}>MÊS ATUAL</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => setMesIdx((i) => Math.max(0, i - 1))} disabled={mesIdx === 0}
                  style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--cinza-borda)", background: "#fff", cursor: mesIdx === 0 ? "default" : "pointer", opacity: mesIdx === 0 ? 0.4 : 1 }}>‹</button>
                <span style={{ fontSize: 12, color: "var(--cinza-texto)" }}>{mesIdx + 1}/{meses.length}</span>
                <button onClick={() => setMesIdx((i) => Math.min(meses.length - 1, i + 1))} disabled={mesIdx === meses.length - 1}
                  style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--cinza-borda)", background: "#fff", cursor: mesIdx === meses.length - 1 ? "default" : "pointer", opacity: mesIdx === meses.length - 1 ? 0.4 : 1 }}>›</button>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--cinza-texto)", marginBottom: 14 }}>
              Seu grupo: <TagGrupo grupo={meuGrupo} /> — toque num dia seu pra marcar <strong>&quot;quero trocar&quot;</strong>. Ele fica visível pra turma na aba <strong>Dias disponíveis</strong>.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
              {DIAS_SEMANA.map((d) => (
                <div key={d} style={{ fontSize: 12, fontWeight: 700, color: "#8792A8", textAlign: "center" }}>{d}</div>
              ))}
              {Array.from({ length: primeiroDiaSemana }).map((_, i) => <div key={"pad" + i} />)}
              {diasDoMes.map((d) => {
                const isMeu = d.grupoPlantao === meuGrupo
                const isHoje = d.data === hojeISO
                const passado = d.data < hojeISO
                const lembrete = statusParaData(d.data)
                const comprometido = datasComprometidas.has(d.data)
                const publicada = minhasOfertas.has(d.data)
                const podeToggle = isMeu && !passado && !comprometido
                const diaNum = Number(d.data.split("-")[2])
                return (
                  <div
                    key={d.data}
                    onClick={() => { if (podeToggle && publicandoData !== d.data) toggleOferta(d.data) }}
                    style={{
                      borderRadius: 12, padding: "8px 6px", minHeight: 78,
                      border: `1.5px solid ${isHoje ? "var(--azul-profundo)" : publicada ? "#3F8C4A" : isMeu ? "#B9CCF0" : "var(--cinza-borda)"}`,
                      background: isHoje ? "var(--azul-profundo)" : publicada ? "#EAF6EC" : isMeu ? "#EFF4FE" : "#fff",
                      cursor: podeToggle ? "pointer" : "default",
                      opacity: passado && !isHoje ? 0.5 : 1,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13, color: isHoje ? "#fff" : "var(--azul-profundo)" }}>{diaNum}</div>
                    {isHoje && <div style={{ fontSize: 9, fontWeight: 800, color: "#FFB74D" }}>HOJE</div>}
                    <div style={{ marginTop: 3 }}><TagGrupo grupo={d.grupoPlantao} /></div>
                    {podeToggle && (
                      <div style={{ fontSize: 10.5, fontWeight: 800, marginTop: 4, color: publicada ? "#2E7D3A" : isHoje ? "#cfe0ff" : "#3568D4" }}>
                        {publicandoData === d.data ? "…" : publicada ? "Trocando ✓" : "Quero trocar"}
                      </div>
                    )}
                    {lembrete && (
                      <div style={{
                        fontSize: 10, fontWeight: 700, marginTop: 4, borderRadius: 6, padding: "2px 6px", display: "inline-block",
                        background: lembrete.status === "aceita" ? "#EAF6EC" : "#FBF3DC",
                        color: lembrete.status === "aceita" ? "#3F8C4A" : "#B8860B",
                      }}>
                        🔔 {lembrete.contraparte}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ background: "var(--azul-claro)", border: "1px solid var(--cinza-borda)", borderRadius: 14, padding: "14px 16px", fontSize: 13, color: "var(--azul-medio)", marginTop: 14 }}>
            <strong>Como funciona:</strong> marque o dia que você quer largar. Depois, na aba <strong>Dias disponíveis</strong>, veja os dias que a turma marcou e escolha um pra assumir — você dá um dos seus em troca.
            Regras: fim de semana só troca com fim de semana (feriado conta como fim de semana), dia útil só com dia útil, e as pessoas precisam ser de equipes diferentes. Cada troca aceita é formalizada depois via processo SEI.
          </div>

          {isAdmin && (
            <div style={{ marginTop: 14 }}>
              <button onClick={() => setShowAdminMilitares((v) => !v)}
                style={{ border: "1px solid var(--cinza-borda)", background: "#fff", color: "var(--azul-profundo)", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {showAdminMilitares ? "Ocultar" : "Gerenciar"} cadastro de militares ({militaresLista.length})
              </button>
              {showAdminMilitares && (
                <div style={{ background: "#fff", border: "1px solid var(--cinza-borda)", borderRadius: 12, padding: 16, marginTop: 10 }}>
                  <p style={{ fontSize: 12, color: "var(--cinza-texto)", marginBottom: 10 }}>
                    Lista das 8 equipes (Turma 13 + demais militares da 2ª CIA), usada para identificar as equipes nas trocas.
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    <input placeholder="Matrícula" value={novoMilitar.matricula} onChange={(e) => setNovoMilitar((v) => ({ ...v, matricula: e.target.value }))}
                      style={{ border: "1px solid var(--cinza-borda)", borderRadius: 8, padding: "6px 10px", fontSize: 13, width: 100 }} />
                    <input placeholder="Nome" value={novoMilitar.nome} onChange={(e) => setNovoMilitar((v) => ({ ...v, nome: e.target.value }))}
                      style={{ border: "1px solid var(--cinza-borda)", borderRadius: 8, padding: "6px 10px", fontSize: 13, flex: 1, minWidth: 160 }} />
                    <select value={novoMilitar.grupoPlantao} onChange={(e) => setNovoMilitar((v) => ({ ...v, grupoPlantao: e.target.value }))}
                      style={{ border: "1px solid var(--cinza-borda)", borderRadius: 8, padding: "6px 10px", fontSize: 13 }}>
                      {GRUPOS_PLANTAO.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <button disabled={salvandoMilitar} onClick={salvarMilitar}
                      style={{ border: "none", background: "var(--azul-profundo)", color: "#fff", borderRadius: 8, padding: "6px 16px", fontWeight: 700, cursor: "pointer" }}>
                      {salvandoMilitar ? "Salvando…" : "Adicionar/editar"}
                    </button>
                  </div>
                  <div style={{ maxHeight: 280, overflowY: "auto" }}>
                    {militaresLista.map((m) => (
                      <div key={m.matricula} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--cinza-borda)", fontSize: 13 }}>
                        <span>{m.matricula} — {m.nome} <TagGrupo grupo={m.grupoPlantao} /></span>
                        <button onClick={() => removerMilitar(m.matricula)} style={{ border: "none", background: "none", color: "#C23B3B", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Remover</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Dias disponíveis ── */}
      {aba === "disponiveis" && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid var(--cinza-borda)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <h3 style={{ fontWeight: 800, fontSize: 15, color: "var(--azul-profundo)", margin: 0 }}>Dias que a turma quer trocar</h3>
            <div style={{ display: "flex", gap: 6 }}>
              {([["todos", "Todos"], ["util", "Úteis"], ["fds", "FDS/feriado"]] as const).map(([v, label]) => (
                <button key={v} onClick={() => setFiltroTipo(v)}
                  style={{ border: filtroTipo === v ? "none" : "1px solid var(--cinza-borda)", background: filtroTipo === v ? "var(--azul-profundo)" : "#fff", color: filtroTipo === v ? "#fff" : "var(--cinza-texto)", borderRadius: 999, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {ofertasVisiveis.length === 0 ? (
            <div style={{ border: "2px dashed var(--cinza-borda)", borderRadius: 14, padding: 30, textAlign: "center", color: "var(--cinza-texto)", fontSize: 13 }}>
              Ninguém de outra equipe marcou dias pra trocar ainda.<br />Marque os seus em <strong>Minha escala</strong> pra abrir o jogo.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 460 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "#8792A8", fontSize: 12 }}>
                    <th style={{ padding: "8px 10px", fontWeight: 700 }}>Data</th>
                    <th style={{ padding: "8px 10px", fontWeight: 700 }}>Dia</th>
                    <th style={{ padding: "8px 10px", fontWeight: 700 }}>Militar</th>
                    <th style={{ padding: "8px 10px", fontWeight: 700 }}>Equipe</th>
                    <th style={{ padding: "8px 10px", fontWeight: 700 }}>Tipo</th>
                    <th style={{ padding: "8px 10px" }} />
                  </tr>
                </thead>
                <tbody>
                  {ofertasVisiveis.map((o) => {
                    const tipo = tipoDiaLocal(o.cedeData)
                    return (
                      <tr key={o.id} style={{ borderTop: "1px solid var(--cinza-borda)" }}>
                        <td style={{ padding: "10px", fontWeight: 700, color: "var(--azul-profundo)", whiteSpace: "nowrap" }}>{fmtData(o.cedeData)}</td>
                        <td style={{ padding: "10px", color: "var(--cinza-texto)" }}>{diaSemanaDe(o.cedeData)}</td>
                        <td style={{ padding: "10px" }}>{o.user.nomeGuerra}</td>
                        <td style={{ padding: "10px" }}><TagGrupo grupo={o.user.grupoPlantao} /></td>
                        <td style={{ padding: "10px" }}><TagTipo tipo={tipo} /></td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          <button onClick={() => setPropostaPara(o)}
                            style={{ border: "none", background: "var(--azul-profundo)", color: "#fff", borderRadius: 8, padding: "7px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                            Propor troca
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Solicitações ── */}
      {aba === "solicitacoes" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {(["recebidas", "enviadas"] as const).map((f) => (
              <button key={f} onClick={() => setFiltroSolic(f)}
                style={{ border: filtroSolic === f ? "none" : "1px solid var(--cinza-borda)", borderRadius: 999, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", background: filtroSolic === f ? "var(--azul-profundo)" : "#fff", color: filtroSolic === f ? "#fff" : "var(--cinza-texto)" }}>
                {f === "recebidas" ? "Recebidas" : "Enviadas"}
              </button>
            ))}
          </div>

          {listaSolic.length === 0 && <p style={{ color: "var(--cinza-texto)", fontSize: 13 }}>Nada por aqui ainda.</p>}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {listaSolic.map((s) => {
              const outros = s.participantes.filter((p) => p.matricula !== meuMat)
              const meuLeg = s.participantes.find((p) => p.matricula === meuMat)
              const souParticipante = !!meuLeg?.userId && meuLeg.userId === meId
              const podeResponder = filtroSolic === "recebidas" && meuLeg?.status === "pendente"
              return (
                <div key={s.id} style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid var(--cinza-borda)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      {outros.map((o) => (
                        <span key={o.id} style={{ fontWeight: 700, fontSize: 14 }}>{o.nome} <TagGrupo grupo={o.grupoPlantao} /></span>
                      ))}
                    </div>
                    <StatusPill status={s.status} />
                  </div>
                  <div style={{ background: "#F7F9FD", borderRadius: 10, padding: 12, fontSize: 13, marginTop: 10 }}>
                    {s.participantes.map((p, i) => (
                      <div key={p.id}>{p.matricula === meuMat ? "Você" : p.nome} assume {fmtData(s.participantes[(i + 1) % s.participantes.length].cedeData)} ({s.participantes[(i + 1) % s.participantes.length].matricula === meuMat ? "seu dia" : s.participantes[(i + 1) % s.participantes.length].nome})</div>
                    ))}
                  </div>

                  {s.seiNumero ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
                      <span style={{ background: "var(--azul-claro)", color: "var(--azul-medio)", borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>SEI Nº {s.seiNumero}</span>
                      <LinkSEI numero={s.seiNumero} />
                    </div>
                  ) : s.status === "aceita" && souParticipante && (
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <input placeholder="Número do processo SEI (opcional)" value={seiInputs[s.id] || ""} onChange={(e) => setSeiInputs((v) => ({ ...v, [s.id]: e.target.value }))}
                        style={{ border: "1px solid var(--cinza-borda)", borderRadius: 8, padding: "6px 10px", fontSize: 13, flex: 1 }} />
                      <button onClick={() => salvarSei(s)} style={{ border: "none", borderRadius: 8, padding: "6px 14px", background: "var(--azul-profundo)", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Salvar</button>
                    </div>
                  )}

                  {podeResponder && (
                    <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                      <button onClick={() => responder(s, "aceitar")} style={{ border: "none", background: "var(--azul-profundo)", color: "#fff", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer" }}>Aceitar</button>
                      <button onClick={() => responder(s, "recusar")} style={{ border: "1px solid #C23B3B", background: "#fff", color: "#C23B3B", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer" }}>Recusar</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Painel de proposta (escolher meu dia em troca) */}
      {propostaPara && (() => {
        const tipo = tipoDiaLocal(propostaPara.cedeData)
        const meusDias = meusDiasParaDar(tipo)
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,25,50,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }} onClick={() => setPropostaPara(null)}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, padding: 24, maxWidth: 440, width: "100%" }}>
              <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 6, color: "var(--azul-profundo)" }}>Propor troca</h3>
              <p style={{ fontSize: 13.5, color: "var(--cinza-texto)", marginBottom: 4 }}>
                Você assume <strong>{fmtData(propostaPara.cedeData)}</strong> ({diaSemanaDe(propostaPara.cedeData)}) de <strong>{propostaPara.user.nomeGuerra}</strong> <TagGrupo grupo={propostaPara.user.grupoPlantao} />.
              </p>
              <p style={{ fontSize: 13.5, marginBottom: 12, marginTop: 10, fontWeight: 700, color: "var(--azul-profundo)" }}>
                Qual dos seus dias ({tipo === "fds" ? "FDS/feriado" : "úteis"}) você dá em troca?
              </p>
              {meusDias.length === 0 ? (
                <p style={{ fontSize: 13, color: "#C23B3B", marginBottom: 14 }}>
                  Você não tem um dia {tipo === "fds" ? "de fim de semana/feriado" : "útil"} livre nesses 6 meses pra oferecer.
                </p>
              ) : (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {meusDias.map((d) => (
                    <button key={d.data} disabled={enviando} onClick={() => proporTroca(propostaPara, d.data)}
                      style={{ border: "1px solid #D6DEEC", background: "#F7F9FD", color: "var(--azul-profundo)", borderRadius: 999, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: enviando ? "default" : "pointer", opacity: enviando ? 0.6 : 1 }}>
                      {fmtData(d.data)} · {d.diaSemana}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => setPropostaPara(null)} style={{ border: "none", background: "none", color: "var(--cinza-texto)", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0 }}>Cancelar</button>
            </div>
          </div>
        )
      })()}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "var(--azul-profundo)", color: "#fff", padding: "10px 20px", borderRadius: 999, fontSize: 13, fontWeight: 700, boxShadow: "0 6px 20px rgba(20,40,80,0.3)", zIndex: 300 }}>
          {toast}
        </div>
      )}

      {/* Modal de confirmação */}
      {modalAberto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,25,50,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }} onClick={() => setModalAberto(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, padding: 28, maxWidth: 420, width: "100%", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, background: "#EAF6EC", color: "#3F8C4A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 14px" }}>✓</div>
            <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: "var(--azul-profundo)" }}>Troca proposta!</h3>
            <p style={{ fontSize: 13, color: "var(--cinza-texto)", marginBottom: 16 }}>
              A pessoa vai receber sua proposta e aceitar ou recusar. Quando aceitar, vocês formalizam o processo SEI e colam o número em &quot;Solicitações&quot;.
            </p>
            <button onClick={() => { setModalAberto(null); setAba("solicitacoes"); setFiltroSolic("enviadas") }}
              style={{ border: "none", background: "var(--azul-profundo)", color: "#fff", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>
              Ver minhas solicitações
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
