import { NOTA_PARABENS } from "@/lib/acervo"

// Nota à turma pelo fim das provas teóricas. Server component: <details>
// nativo, recolhido numa linha (abre ao tocar), sem "use client".
export function NotaParabens({ aberta = false }: { aberta?: boolean }) {
  const n = NOTA_PARABENS
  return (
    <details open={aberta} style={{
      borderRadius: 16, padding: "12px 18px", marginBottom: 16, width: "100%",
      background: "linear-gradient(135deg, #1f3b1f 0%, #2e4a2e 100%)", color: "#f4ecd8",
      border: "1px solid var(--gold)", boxShadow: "0 6px 18px rgba(43, 42, 39, 0.12)",
    }}>
      <summary style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", listStyle: "none" }}>
        <span style={{ fontSize: 20 }}>🎖️</span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.05rem", color: "var(--gold)" }}>
            {n.titulo}
          </span>
          <span style={{ display: "block", fontSize: 12.5, opacity: 0.8 }}>{n.resumo}</span>
        </span>
      </summary>
      {n.paragrafos.map((p, i) => (
        <p key={i} style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.6 }}>{p}</p>
      ))}
      <p style={{ margin: "12px 0 0", fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.05rem", color: "var(--gold)" }}>{n.fecho}</p>
      <p style={{ margin: "6px 0 2px", fontSize: 12.5, opacity: 0.8 }}>— {n.assinatura}</p>
    </details>
  )
}
