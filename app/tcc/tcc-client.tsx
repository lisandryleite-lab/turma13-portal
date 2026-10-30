"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// ─── Contagem regressiva até o prazo ─────────────────────────────────────────

export function Contagem({ prazoIso }: { prazoIso: string }) {
  const prazo = new Date(prazoIso).getTime()
  const [agora, setAgora] = useState<number | null>(null)

  useEffect(() => {
    setAgora(Date.now())
    const t = setInterval(() => setAgora(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  if (agora === null) return <div style={{ height: 52 }} />

  const falta = prazo - agora
  if (falta <= 0) {
    return (
      <p style={{ margin: 0, fontWeight: 700, color: "var(--red)" }}>
        ⛔ Prazo encerrado. Envios fora do prazo: falar com a administração.
      </p>
    )
  }

  const s = Math.floor(falta / 1000)
  const partes = [
    { v: Math.floor(s / 86400), l: "dias" },
    { v: Math.floor((s % 86400) / 3600), l: "horas" },
    { v: Math.floor((s % 3600) / 60), l: "min" },
    { v: s % 60, l: "seg" },
  ]
  return (
    <div style={{ display: "flex", gap: 8 }} aria-label="Tempo restante">
      {partes.map((p) => (
        <div key={p.l} style={{ minWidth: 58, textAlign: "center", background: "var(--canvas)", border: "1px solid rgba(58,74,58,0.15)", borderRadius: 10, padding: "6px 4px" }}>
          <div style={{ fontFamily: "var(--serif-cfo)", fontSize: 22, fontWeight: 700, color: "var(--olive)", fontVariantNumeric: "tabular-nums" }}>
            {String(p.v).padStart(2, "0")}
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-60)" }}>{p.l}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Copiar o nome padronizado do arquivo ────────────────────────────────────

export function CopiarNome({ nome }: { nome: string }) {
  const [ok, setOk] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(nome)
          setOk(true)
          setTimeout(() => setOk(false), 1500)
        } catch {
          /* navegador sem permissão de área de transferência: o nome segue visível */
        }
      }}
      title="Copiar nome do arquivo"
      style={{
        display: "flex", alignItems: "center", gap: 6, maxWidth: "100%", textAlign: "left",
        background: "var(--canvas)", border: "1px dashed rgba(58,74,58,0.3)", borderRadius: 8,
        padding: "5px 8px", cursor: "pointer", fontFamily: "ui-monospace, Consolas, monospace",
        fontSize: 11.5, color: "var(--ink)", wordBreak: "break-all",
      }}
    >
      <span>{nome}</span>
      <span style={{ flexShrink: 0, fontFamily: "var(--sans)", fontSize: 11, color: "var(--olive)", fontWeight: 600 }}>
        {ok ? "copiado ✓" : "copiar"}
      </span>
    </button>
  )
}

// ─── Botão de status (a própria dupla marca) ─────────────────────────────────

export function MarcarEnvio({ dupla, enviado }: { dupla: number; enviado: boolean }) {
  const router = useRouter()
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState("")

  async function marcar() {
    setOcupado(true)
    setErro("")
    try {
      const res = await fetch("/api/tcc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dupla, acao: enviado ? "desfazer" : "enviado" }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setErro(j.error ?? "Não foi possível salvar.")
      } else {
        router.refresh()
      }
    } finally {
      setOcupado(false)
    }
  }

  return (
    <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
      <button
        type="button"
        disabled={ocupado}
        onClick={marcar}
        style={{
          fontSize: 12.5, fontWeight: 600, borderRadius: 8, padding: "6px 12px", cursor: ocupado ? "wait" : "pointer",
          border: enviado ? "1px solid rgba(58,74,58,0.3)" : "none",
          background: enviado ? "transparent" : "var(--olive)",
          color: enviado ? "var(--olive)" : "var(--canvas)",
          opacity: ocupado ? 0.6 : 1,
        }}
      >
        {enviado ? "Desfazer" : "✓ Marcar como enviado"}
      </button>
      {erro && <span style={{ fontSize: 12, color: "var(--red)" }}>⚠ {erro}</span>}
    </span>
  )
}
