"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

export type CardBatalhao = {
  sigla: string; slug: string; nome: string; sede: string; municipio: string
  opcao1: number; opcao2: number; comandante: string | null; fichaCompleta: number; mensagens: number
}

const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
const cartao: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid rgba(58,74,58,0.14)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }

export function BatalhoesClient({ cards, respondentes, totalAlunos, minha, planilhaOk, planilhaUrl }: {
  cards: CardBatalhao[]; respondentes: number; totalAlunos: number
  minha: { opcao1: string; opcao2: string | null } | null; planilhaOk: boolean; planilhaUrl: string
}) {
  const [busca, setBusca] = useState("")
  const [ordem, setOrdem] = useState<"procura" | "numero">("procura")
  const max = Math.max(1, ...cards.map(c => c.opcao1))

  const lista = useMemo(() => {
    const t = semAcento(busca.trim())
    const num = (s: string) => Number(s.match(/\d+/)?.[0] ?? 999)
    return cards
      .filter(c => !t || semAcento(`${c.sigla} ${c.nome} ${c.sede} ${c.municipio} ${c.comandante ?? ""}`).includes(t))
      .sort((a, b) => ordem === "procura" ? b.opcao1 - a.opcao1 || b.opcao2 - a.opcao2 : num(a.sigla) - num(b.sigla))
  }, [cards, busca, ordem])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Minha escolha + status do levantamento */}
      <section style={{ ...cartao, padding: 18, background: "linear-gradient(135deg, #3a4a3a 0%, #45573f 60%, #4f6347 100%)", color: "#fff", border: "none" }}>
        <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>Minha escolha</p>
        {minha ? (
          <p style={{ margin: "6px 0 0", fontSize: 15 }}>
            1ª opção <strong style={{ color: "#e0c979" }}>{minha.opcao1}</strong>
            {minha.opcao2 && <> · 2ª opção <strong style={{ color: "#e0c979" }}>{minha.opcao2}</strong></>}
          </p>
        ) : (
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "rgba(255,255,255,0.85)" }}>Você ainda não aparece no levantamento da DAG.</p>
        )}
        <p style={{ margin: "10px 0 0", fontSize: 12.5, color: "rgba(255,255,255,0.75)" }}>
          {planilhaOk
            ? <>{respondentes} de {totalAlunos} alunos responderam · atualizado a cada 5 minutos · <a href={planilhaUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#e0c979" }}>ver planilha da DAG ↗</a></>
            : "Não foi possível abrir a planilha da DAG agora — tente novamente em instantes."}
        </p>
      </section>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="🔍 Batalhão, bairro, município ou comandante"
          style={{ flex: 1, minWidth: 220, padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(58,74,58,0.3)", background: "#fff", color: "var(--ink)", fontSize: 15 }} />
        {(["procura", "numero"] as const).map(o => (
          <button key={o} onClick={() => setOrdem(o)}
            style={{ padding: "8px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600,
              background: ordem === o ? "var(--olive)" : "var(--surface)", color: ordem === o ? "var(--canvas)" : "var(--ink-60)" }}>
            {o === "procura" ? "Mais procurados" : "Por número"}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
        {lista.map(c => {
          const meu = minha?.opcao1 === c.sigla
          return (
            <Link key={c.slug} href={`/batalhoes/${c.slug}`}
              style={{ ...cartao, padding: 16, textDecoration: "none", color: "var(--ink)", display: "flex", flexDirection: "column", gap: 8,
                border: meu ? "1.5px solid var(--gold)" : cartao.border, background: meu ? "#fbf7ec" : "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: "var(--serif-cfo)", fontWeight: 700, fontSize: "1.35rem", color: "var(--olive)" }}>{c.sigla}</span>
                {meu && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)" }}>sua 1ª opção</span>}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{c.nome}</span>
              <span style={{ fontSize: 12.5, color: "var(--ink-60)" }}>📍 {c.sede}, {c.municipio}</span>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                  <span><strong style={{ fontSize: 16, color: "var(--olive)" }}>{c.opcao1}</strong> como 1ª opção</span>
                  <span style={{ color: "var(--ink-60)" }}>{c.opcao2} como 2ª</span>
                </div>
                <div style={{ height: 7, borderRadius: 99, background: "var(--surface)", overflow: "hidden" }}>
                  <div style={{ width: `${(c.opcao1 / max) * 100}%`, height: "100%", background: "var(--olive)", borderRadius: 99 }} />
                </div>
              </div>
              <span style={{ fontSize: 11.5, color: "var(--ink-60)" }}>
                {c.comandante ? `Cmt: ${c.comandante}` : "Ficha do batalhão em construção"}{c.mensagens > 0 ? ` · 💬 ${c.mensagens}` : ""}
              </span>
              <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 700 }}>Conheça o batalhão ›</span>
            </Link>
          )
        })}
      </div>
      {lista.length === 0 && <p style={{ color: "var(--ink-60)" }}>Nenhum batalhão encontrado.</p>}
    </div>
  )
}
