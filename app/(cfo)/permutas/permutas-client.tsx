"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { CORES_PLANTAO, GRUPOS_PLANTAO } from "@/lib/escalas"

const MESES_NOMES = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

type Me = { id: string; matricula: number; nomeGuerra: string; grupoPlantao: string | null } | null
type DiaCal = { data: string; diaSemana: string; tipo: "util" | "fds"; grupoPlantao: string }
type Mes = { ano: number; mes: number }
type Militar = { matricula: number; nome: string; grupoPlantao: string }
type Oferta = {
  id: string; userId: string; cedeData: string; querData: string; status: string
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
type Parte = { matricula: number; nome: string; grupoPlantao: string; cedeData: string }

const dOnly = (iso: string) => iso.slice(0, 10)
const fmtData = (iso: string) => {
  const [y, m, d] = dOnly(iso).split("-")
  return `${d}/${m}/${y}`
}

// Logo "sei!" — mesmo estilo do card SEI em /links
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
        padding: "8px 14px", textDecoration: "none",
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)", transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)"
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.13)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)"
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
  const [aba, setAba] = useState<"escala" | "buscar" | "montar" | "solicitacoes">("escala")
  const [mesIdx, setMesIdx] = useState(0)
  const [ofertas, setOfertas] = useState(ofertasIniciais)
  const [solicitacoes, setSolicitacoes] = useState(solicitacoesIniciais)
  const [cedeSelecionada, setCedeSelecionada] = useState<string | null>(null)
  const [swipeIdx, setSwipeIdx] = useState(0)
  const [builder, setBuilder] = useState<{ parceiro: Parte | null; terceiro: Parte | null }>({ parceiro: null, terceiro: null })
  const [toast, setToast] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState<Solicitacao | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [filtroSolic, setFiltroSolic] = useState<"recebidas" | "enviadas">("recebidas")
  const [seiInputs, setSeiInputs] = useState<Record<string, string>>({})
  const [buscaMilitar, setBuscaMilitar] = useState("")
  const [adicionandoTerceiro, setAdicionandoTerceiro] = useState(false)
  const [querEscolhida, setQuerEscolhida] = useState("")
  const [ofertasPublicadas, setOfertasPublicadas] = useState<Record<string, boolean>>(
    Object.fromEntries(minhasOfertasIniciais.map((d) => [d, true]))
  )
  const [publicando, setPublicando] = useState(false)
  const [militaresLista, setMilitaresLista] = useState(militares)
  const [showAdminMilitares, setShowAdminMilitares] = useState(false)
  const [novoMilitar, setNovoMilitar] = useState({ matricula: "", nome: "", grupoPlantao: GRUPOS_PLANTAO[0] as string })
  const [salvandoMilitar, setSalvandoMilitar] = useState(false)

  const dragRef = useRef({ originX: 0, active: false })
  const [dragX, setDragX] = useState(0)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2200)
  }

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
  const meuNome = me.nomeGuerra
  const meuMat = me.matricula

  function tipoDiaLocal(iso: string): "util" | "fds" {
    return dias.find((d) => d.data === dOnly(iso))?.tipo ?? "util"
  }

  const datasComprometidas = useMemo(() => {
    const set = new Set<string>()
    for (const s of [...solicitacoes.enviadas, ...solicitacoes.recebidas]) {
      if (s.status === "recusada" || s.status === "cancelada") continue
      for (const p of s.participantes) {
        if (p.matricula === meuMat && (p.status === "pendente" || p.status === "aceito")) {
          set.add(dOnly(p.cedeData))
        }
      }
    }
    return set
  }, [solicitacoes, meuMat])

  const meusDiasDisponiveis = useMemo(
    () => dias.filter((d) => d.grupoPlantao === meuGrupo && !datasComprometidas.has(d.data)),
    [dias, meuGrupo, datasComprometidas]
  )

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

  // ── Buscar Permuta ──────────────────────────────────────────
  const candidatos = useMemo(() => {
    if (!cedeSelecionada) return []
    const meuTipo = tipoDiaLocal(cedeSelecionada)
    return ofertas.filter((o) => o.user.grupoPlantao !== meuGrupo && tipoDiaLocal(o.cedeData) === meuTipo)
  }, [ofertas, cedeSelecionada, meuGrupo, dias])

  const candidatoAtual = candidatos[swipeIdx] ?? null

  function propor(o: Oferta) {
    setBuilder({
      parceiro: { matricula: o.user.matricula, nome: o.user.nomeGuerra, grupoPlantao: o.user.grupoPlantao, cedeData: dOnly(o.cedeData) },
      terceiro: null,
    })
    showToast(`Proposta enviada a ${o.user.nomeGuerra}`)
    setAba("montar")
    setDragX(0)
  }
  function pular() {
    setSwipeIdx((i) => i + 1)
    setDragX(0)
  }

  async function publicarOferta() {
    if (!cedeSelecionada || !querEscolhida) return
    setPublicando(true)
    const res = await fetch("/api/permutas/ofertas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cedeData: cedeSelecionada, querData: querEscolhida }),
    })
    setPublicando(false)
    if (!res.ok) {
      const e = await res.json().catch(() => ({}))
      showToast(e.error || "Erro ao publicar oferta")
      return
    }
    setOfertasPublicadas((p) => ({ ...p, [cedeSelecionada]: true }))
    setSwipeIdx(0)
  }

  function onPointerDown(e: React.PointerEvent) {
    dragRef.current = { originX: e.clientX, active: true }
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current.active) return
    setDragX(e.clientX - dragRef.current.originX)
  }
  function onPointerUp() {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    if (dragX > 100 && candidatoAtual) propor(candidatoAtual)
    else if (dragX < -100) pular()
    else setDragX(0)
  }

  // ── Montar Permuta ──────────────────────────────────────────
  const militaresFiltrados = useMemo(() => {
    if (!buscaMilitar.trim()) return []
    const termo = buscaMilitar.trim().toLowerCase()
    const excluir = new Set([meuGrupo, builder.parceiro?.grupoPlantao].filter(Boolean) as string[])
    return militaresLista
      .filter((m) => m.matricula !== meuMat && !excluir.has(m.grupoPlantao))
      .filter((m) => m.nome.toLowerCase().includes(termo) || String(m.matricula).includes(termo))
      .slice(0, 8)
  }, [buscaMilitar, militaresLista, meuGrupo, builder.parceiro, meuMat])

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

  function datasValidasPara(grupo: string): DiaCal[] {
    if (!cedeSelecionada) return []
    const meuTipo = tipoDiaLocal(cedeSelecionada)
    const hojeISO = dOnly(new Date().toISOString())
    return dias.filter((d) => d.grupoPlantao === grupo && d.tipo === meuTipo && d.data >= hojeISO)
  }

  function escolherParceiro(m: Militar, data: string, comoTerceiro: boolean) {
    const parte: Parte = { matricula: m.matricula, nome: m.nome, grupoPlantao: m.grupoPlantao, cedeData: data }
    if (comoTerceiro) setBuilder((b) => ({ ...b, terceiro: parte }))
    else setBuilder((b) => ({ ...b, parceiro: parte }))
    setBuscaMilitar("")
    setAdicionandoTerceiro(false)
  }

  async function confirmarEnviarSEI() {
    if (!cedeSelecionada || !builder.parceiro) return
    setEnviando(true)
    const res = await fetch("/api/permutas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meuCedeData: cedeSelecionada,
        parceiro: { matricula: builder.parceiro.matricula, cedeData: builder.parceiro.cedeData },
        terceiro: builder.terceiro ? { matricula: builder.terceiro.matricula, cedeData: builder.terceiro.cedeData } : undefined,
      }),
    })
    setEnviando(false)
    if (!res.ok) {
      const e = await res.json().catch(() => ({}))
      showToast(e.error || "Erro ao enviar permuta")
      return
    }
    const nova: Solicitacao = await res.json()
    setOfertas((prev) =>
      prev.filter((o) => {
        const match = (p: Parte | null) => p && o.user.matricula === p.matricula && dOnly(o.cedeData) === p.cedeData
        return !match(builder.parceiro) && !match(builder.terceiro)
      })
    )
    setSolicitacoes((s) => ({ ...s, enviadas: [nova, ...s.enviadas] }))
    setModalAberto(nova)
    setBuilder({ parceiro: null, terceiro: null })
    setCedeSelecionada(null)
    setSwipeIdx(0)
  }

  // ── Solicitações ──────────────────────────────────────────
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

  const listaSolic = filtroSolic === "recebidas" ? solicitacoes.recebidas : solicitacoes.enviadas

  // ── Render ──────────────────────────────────────────────────
  const mesAtualObj = meses[mesIdx]
  const diasDoMes = dias.filter((d) => {
    const [y, m] = d.data.split("-").map(Number)
    return y === mesAtualObj.ano && m === mesAtualObj.mes
  })
  const primeiroDiaSemana = diasDoMes.length ? new Date(mesAtualObj.ano, mesAtualObj.mes - 1, 1).getDay() : 0
  const hojeISO = dOnly(new Date().toISOString())

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "20px 16px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <Link href="/inicio" style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          ← Voltar
        </Link>
        <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: 22, color: "var(--olive)", margin: 0 }}>
          Permuta de Plantões
        </h1>
        <span style={{ width: 60 }} />
      </div>
      {/* Abas */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { id: "escala", label: "Minha escala" },
          { id: "buscar", label: "Buscar permuta" },
          { id: "montar", label: "Montar permuta" },
          { id: "solicitacoes", label: `Solicitações${solicitacoes.recebidas.filter((s) => s.participantes.some((p) => p.matricula === meuMat && p.status === "pendente")).length > 0 ? ` (${solicitacoes.recebidas.filter((s) => s.participantes.some((p) => p.matricula === meuMat && p.status === "pendente")).length})` : ""}` },
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

      {/* ── Minha Escala ── */}
      {aba === "escala" && (
        <>
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid var(--cinza-borda)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 800, fontSize: 15, textTransform: "uppercase", color: "var(--azul-profundo)" }}>
                  PLANTÃO · {MESES_NOMES[mesAtualObj.mes]} {mesAtualObj.ano}
                </span>
                {mesIdx === 0 && (
                  <span style={{ background: "#EED9A8", color: "#7A5A12", fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "2px 10px" }}>
                    MÊS ATUAL
                  </span>
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
              Seu grupo: <TagGrupo grupo={meuGrupo} /> — os dias destacados são seus.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                <div key={d} style={{ fontSize: 12, fontWeight: 700, color: "#8792A8", textAlign: "center" }}>{d}</div>
              ))}
              {Array.from({ length: primeiroDiaSemana }).map((_, i) => <div key={"pad" + i} />)}
              {diasDoMes.map((d) => {
                const isMeu = d.grupoPlantao === meuGrupo
                const isHoje = d.data === hojeISO
                const lembrete = statusParaData(d.data)
                const diaNum = Number(d.data.split("-")[2])
                return (
                  <div
                    key={d.data}
                    onClick={() => {
                      if (!isMeu || datasComprometidas.has(d.data)) return
                      setCedeSelecionada(d.data)
                      setSwipeIdx(0)
                      setQuerEscolhida("")
                      setAba("buscar")
                    }}
                    style={{
                      borderRadius: 12, padding: "10px 8px", minHeight: 76,
                      border: `1.5px solid ${isHoje ? "var(--azul-profundo)" : isMeu ? "#B9CCF0" : "var(--cinza-borda)"}`,
                      background: isHoje ? "var(--azul-profundo)" : isMeu ? "#EFF4FE" : "#fff",
                      cursor: isMeu && !datasComprometidas.has(d.data) ? "pointer" : "default",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13, color: isHoje ? "#fff" : "var(--azul-profundo)" }}>{diaNum}</div>
                    {isHoje && <div style={{ fontSize: 9, fontWeight: 800, color: "#FFB74D" }}>HOJE</div>}
                    <div style={{ marginTop: 4 }}><TagGrupo grupo={d.grupoPlantao} /></div>
                    {isMeu && !datasComprometidas.has(d.data) && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: isHoje ? "#cfe0ff" : "#3568D4", marginTop: 4 }}>Trocar ⇄</div>
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
            <strong>Regras da permuta:</strong> fim de semana só troca com fim de semana (feriado conta como fim de semana);
            dia útil só com dia útil; as pessoas envolvidas precisam ser de equipes diferentes; e cada permuta aceita é
            registrada e formalizada depois via processo SEI. O sininho 🔔 no dia indica uma permuta em andamento pra aquela data
            (amarelo = aguardando resposta, verde = aceita).
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
                    Lista completa das 8 equipes (Turma 13 + demais militares da 2ª CIA) usada pra buscar parceiros de permuta.
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

      {/* ── Buscar Permuta ── */}
      {aba === "buscar" && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid var(--cinza-borda)", boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, color: "var(--azul-profundo)", marginBottom: 12 }}>Qual dia você quer trocar?</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {meusDiasDisponiveis.length === 0 && <p style={{ fontSize: 13, color: "var(--cinza-texto)" }}>Nenhum dia seu disponível pra troca nesses 6 meses.</p>}
            {meusDiasDisponiveis.map((d) => (
              <button key={d.data} onClick={() => { setCedeSelecionada(d.data); setSwipeIdx(0); setQuerEscolhida("") }}
                style={{
                  border: `1px solid ${cedeSelecionada === d.data ? "var(--azul-profundo)" : "#D6DEEC"}`,
                  background: cedeSelecionada === d.data ? "var(--azul-profundo)" : "#fff",
                  color: cedeSelecionada === d.data ? "#fff" : "var(--azul-profundo)",
                  borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}>
                {fmtData(d.data)}
              </button>
            ))}
          </div>

          {cedeSelecionada && !ofertasPublicadas[cedeSelecionada] && (
            <div style={{ background: "#F7F9FD", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 13, marginBottom: 10 }}>
                Antes de ver candidatos, diga que dia você prefere receber em troca de <strong>{fmtData(cedeSelecionada)}</strong>
                (isso publica sua oferta pra outros alunos te encontrarem também):
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <select value={querEscolhida} onChange={(e) => setQuerEscolhida(e.target.value)}
                  style={{ border: "1px solid var(--cinza-borda)", borderRadius: 8, padding: "8px 10px", fontSize: 13 }}>
                  <option value="">Selecione um dia…</option>
                  {dias.filter((d) => d.tipo === tipoDiaLocal(cedeSelecionada) && d.data !== cedeSelecionada && d.data >= hojeISO).map((d) => (
                    <option key={d.data} value={d.data}>{fmtData(d.data)} ({d.grupoPlantao})</option>
                  ))}
                </select>
                <button disabled={!querEscolhida || publicando} onClick={publicarOferta}
                  style={{ border: "none", background: "var(--azul-profundo)", color: "#fff", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: !querEscolhida || publicando ? "default" : "pointer", opacity: !querEscolhida || publicando ? 0.6 : 1 }}>
                  {publicando ? "Publicando…" : "Publicar oferta e ver candidatos"}
                </button>
              </div>
            </div>
          )}

          {cedeSelecionada && ofertasPublicadas[cedeSelecionada] && (
            candidatoAtual ? (
              <div style={{ position: "relative", height: 340 }}>
                <div
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  style={{
                    position: "absolute", inset: 0, background: "#fff", borderRadius: 18, border: "1px solid var(--cinza-borda)",
                    padding: 22, boxShadow: "0 10px 30px rgba(20,40,80,0.12)", touchAction: "none", cursor: "grab",
                    transform: `translateX(${dragX}px) rotate(${dragX / 12}deg)`,
                    transition: dragRef.current.active ? "none" : "transform .25s ease",
                  }}
                >
                  <TagGrupo grupo={candidatoAtual.user.grupoPlantao} />
                  <h4 style={{ fontWeight: 800, fontSize: 20, marginTop: 10, color: "var(--azul-profundo)" }}>{candidatoAtual.user.nomeGuerra}</h4>
                  <p style={{ fontSize: 13, color: "var(--cinza-texto)", marginBottom: 14 }}>Equipe {candidatoAtual.user.grupoPlantao}</p>
                  <div style={{ background: "#F7F9FD", borderRadius: 12, padding: 14, fontSize: 13 }}>
                    <p>Cede: <strong>{fmtData(candidatoAtual.cedeData)}</strong></p>
                    <p>Quer: <strong>{fmtData(candidatoAtual.querData)}</strong></p>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    {dOnly(candidatoAtual.querData) === cedeSelecionada ? (
                      <span style={{ background: "#EAF6EC", color: "#3F8C4A", borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>✓ Troca direta possível</span>
                    ) : (
                      <span style={{ background: "#FBF3DC", color: "#B8860B", borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>△ Dia diferente — pode virar permuta triangular</span>
                    )}
                  </div>
                  {dragX > 30 && <div style={{ position: "absolute", top: 20, right: 20, color: "#3F8C4A", fontWeight: 800, fontSize: 22, opacity: Math.min(dragX / 100, 1), transform: "rotate(12deg)" }}>PROPOR</div>}
                  {dragX < -30 && <div style={{ position: "absolute", top: 20, left: 20, color: "#D64545", fontWeight: 800, fontSize: 22, opacity: Math.min(-dragX / 100, 1), transform: "rotate(-12deg)" }}>PULAR</div>}
                </div>
              </div>
            ) : (
              <div style={{ border: "2px dashed var(--cinza-borda)", borderRadius: 14, padding: 30, textAlign: "center", color: "var(--cinza-texto)" }}>
                Sem mais candidatos por aqui
              </div>
            )
          )}

          {cedeSelecionada && ofertasPublicadas[cedeSelecionada] && candidatoAtual && (
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16 }}>
              <button onClick={pular} style={{ width: 58, height: 58, borderRadius: 999, background: "#fff", border: "2px solid #D64545", color: "#D64545", fontSize: 22, cursor: "pointer" }}>✕</button>
              <button onClick={() => propor(candidatoAtual)} style={{ width: 58, height: 58, borderRadius: 999, background: "var(--azul-profundo)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>⇄</button>
            </div>
          )}
        </div>
      )}

      {/* ── Montar Permuta ── */}
      {aba === "montar" && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid var(--cinza-borda)", boxShadow: "var(--shadow-sm)" }}>
          {!cedeSelecionada && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "var(--cinza-texto)", marginBottom: 8 }}>Escolha primeiro o dia que você quer ceder:</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {meusDiasDisponiveis.map((d) => (
                  <button key={d.data} onClick={() => setCedeSelecionada(d.data)}
                    style={{ border: "1px solid #D6DEEC", background: "#fff", color: "var(--azul-profundo)", borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    {fmtData(d.data)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {cedeSelecionada && !builder.parceiro && (
            <div style={{ padding: "16px 0" }}>
              <p style={{ fontSize: 13, color: "var(--cinza-texto)", marginBottom: 12 }}>
                Cedendo o dia <strong>{fmtData(cedeSelecionada)}</strong>. Vá em "Buscar permuta" pra casar com alguém, ou busque
                diretamente pelo nome/matrícula abaixo (inclui militares de fora da Turma 13):
              </p>
              <BuscaMilitar
                busca={buscaMilitar} setBusca={setBuscaMilitar}
                resultados={militaresFiltrados}
                datasValidasPara={datasValidasPara}
                onEscolher={(m, data) => escolherParceiro(m, data, false)}
              />
            </div>
          )}

          {cedeSelecionada && builder.parceiro && (
            <div>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 999, background: "var(--azul-profundo)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>1</div>
                <p style={{ fontSize: 14 }}>Você cede o dia <strong>{fmtData(cedeSelecionada)}</strong> para <strong>{builder.parceiro.nome}</strong>.</p>
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 999, background: CORES_PLANTAO[builder.parceiro.grupoPlantao], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>2</div>
                <p style={{ fontSize: 14 }}>
                  <strong>{builder.parceiro.nome}</strong> (equipe {builder.parceiro.grupoPlantao}) cede o dia <strong>{fmtData(builder.parceiro.cedeData)}</strong> para {builder.terceiro ? <strong>{builder.terceiro.nome}</strong> : "você"}.
                </p>
              </div>
              {builder.terceiro && (
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 999, background: CORES_PLANTAO[builder.terceiro.grupoPlantao], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>3</div>
                  <div>
                    <p style={{ fontSize: 14 }}>
                      <strong>{builder.terceiro.nome}</strong> (equipe {builder.terceiro.grupoPlantao}) cede o dia <strong>{fmtData(builder.terceiro.cedeData)}</strong> para você — fechando o ciclo triangular.
                    </p>
                    <button onClick={() => setBuilder((b) => ({ ...b, terceiro: null }))} style={{ border: "none", background: "none", color: "#C23B3B", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0, marginTop: 4 }}>Remover pessoa</button>
                  </div>
                </div>
              )}

              {!builder.terceiro && !adicionandoTerceiro && (
                <button onClick={() => setAdicionandoTerceiro(true)} style={{ border: "none", background: "none", color: "var(--azul-medio)", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 16 }}>
                  + Adicionar pessoa (permuta triangular)
                </button>
              )}
              {adicionandoTerceiro && (
                <div style={{ marginBottom: 16 }}>
                  <BuscaMilitar
                    busca={buscaMilitar} setBusca={setBuscaMilitar}
                    resultados={militaresFiltrados}
                    datasValidasPara={datasValidasPara}
                    onEscolher={(m, data) => escolherParceiro(m, data, true)}
                  />
                </div>
              )}

              <div style={{ background: "#F7F9FD", borderRadius: 12, padding: 14, fontSize: 13, marginBottom: 16 }}>
                <p>✓ Mesmo tipo de dia (útil/fim de semana) entre todos</p>
                <p>✓ Equipes diferentes</p>
                <p style={{ color: "#8792A8" }}>ℹ Será registrado internamente e formalizado via processo SEI ao confirmar.</p>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setBuilder({ parceiro: null, terceiro: null }); setCedeSelecionada(null) }}
                  style={{ border: "1px solid var(--cinza-borda)", background: "#fff", color: "var(--cinza-texto)", borderRadius: 10, padding: "10px 18px", fontWeight: 700, cursor: "pointer" }}>
                  Cancelar
                </button>
                <button disabled={enviando} onClick={confirmarEnviarSEI}
                  style={{ border: "none", background: "var(--azul-profundo)", color: "#fff", borderRadius: 10, padding: "10px 18px", fontWeight: 700, cursor: enviando ? "default" : "pointer", opacity: enviando ? 0.6 : 1 }}>
                  {enviando ? "Enviando…" : "Confirmar e enviar via SEI"}
                </button>
              </div>
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
              const souParticipante = !!meuLeg?.userId && meuLeg.userId === me.id
              const podeResponder = filtroSolic === "recebidas" && meuLeg?.status === "pendente"
              return (
                <div key={s.id} style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid var(--cinza-borda)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        {outros.map((o) => (
                          <span key={o.id} style={{ fontWeight: 700, fontSize: 14 }}>{o.nome} <TagGrupo grupo={o.grupoPlantao} /></span>
                        ))}
                      </div>
                    </div>
                    <StatusPill status={s.status} />
                  </div>
                  <div style={{ background: "#F7F9FD", borderRadius: 10, padding: 12, fontSize: 13, marginTop: 10 }}>
                    {s.participantes.map((p, i) => (
                      <div key={p.id}>{p.matricula === meuMat ? "Você" : p.nome} cede {fmtData(p.cedeData)} para {s.participantes[(i + 1) % s.participantes.length].matricula === meuMat ? "você" : s.participantes[(i + 1) % s.participantes.length].nome}</div>
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

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "var(--azul-profundo)", color: "#fff", padding: "10px 20px", borderRadius: 999, fontSize: 13, fontWeight: 700, boxShadow: "0 6px 20px rgba(20,40,80,0.3)", zIndex: 100 }}>
          {toast}
        </div>
      )}

      {/* Modal de confirmação */}
      {modalAberto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,25,50,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={() => setModalAberto(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, padding: 28, maxWidth: 420, width: "90%", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, background: "#EAF6EC", color: "#3F8C4A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 14px" }}>✓</div>
            <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: "var(--azul-profundo)" }}>Permuta enviada!</h3>
            <p style={{ fontSize: 13, color: "var(--cinza-texto)", marginBottom: 16 }}>
              Assim que todos aceitarem, você pode formalizar o processo SEI e colar o número dele em "Solicitações".
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

function BuscaMilitar({
  busca, setBusca, resultados, datasValidasPara, onEscolher,
}: {
  busca: string
  setBusca: (v: string) => void
  resultados: Militar[]
  datasValidasPara: (grupo: string) => DiaCal[]
  onEscolher: (m: Militar, data: string) => void
}) {
  const [selecionado, setSelecionado] = useState<Militar | null>(null)
  const datasValidas = selecionado ? datasValidasPara(selecionado.grupoPlantao) : []

  if (selecionado) {
    return (
      <div>
        <p style={{ fontSize: 13, marginBottom: 8 }}>
          <strong>{selecionado.nome}</strong> (equipe {selecionado.grupoPlantao}) — em que dia ele(a) cede?
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {datasValidas.length === 0 && <p style={{ fontSize: 12, color: "var(--cinza-texto)" }}>Nenhum dia compatível na janela de 6 meses.</p>}
          {datasValidas.map((d) => (
            <button key={d.data} onClick={() => onEscolher(selecionado, d.data)}
              style={{ border: "1px solid #D6DEEC", background: "#fff", borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {fmtData(d.data)}
            </button>
          ))}
        </div>
        <button onClick={() => setSelecionado(null)} style={{ border: "none", background: "none", color: "var(--cinza-texto)", fontSize: 12, cursor: "pointer", padding: 0 }}>← Escolher outra pessoa</button>
      </div>
    )
  }

  return (
    <div>
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome ou matrícula…"
        style={{ border: "1px solid var(--cinza-borda)", borderRadius: 8, padding: "8px 12px", fontSize: 13, width: "100%", maxWidth: 320 }}
      />
      {resultados.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          {resultados.map((m) => (
            <button key={m.matricula} onClick={() => setSelecionado(m)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--cinza-borda)", borderRadius: 8, padding: "8px 12px", background: "#fff", cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontSize: 13 }}>{m.nome} <span style={{ color: "var(--cinza-texto)" }}>· mat. {m.matricula}</span></span>
              <TagGrupo grupo={m.grupoPlantao} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
