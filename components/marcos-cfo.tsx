import { dataCurta, marcosComSituacao } from "@/lib/marcos-cfo"

// Linha do tempo minimalista dos marcos da reta final (página inicial), numa
// aba recolhida: a linha de resumo mostra o próximo evento e abre ao tocar.
// Server component (<details> nativo) — /inicio é force-dynamic, então a
// situação de cada marco é recalculada a cada acesso.
export function MarcosCFO() {
  const marcos = marcosComSituacao()
  const proximo = marcos.find(m => m.situacao === "agora" || m.situacao === "proximo")
  const resumo = !proximo ? "Todos os eventos concluídos"
    : proximo.situacao === "agora" ? `Agora: ${proximo.rotulo}`
    : `Próximo: ${proximo.rotulo}${proximo.data ? ` · ${dataCurta(proximo.data)}` : ""}${proximo.dias ? ` · em ${proximo.dias} ${proximo.dias === 1 ? "dia" : "dias"}` : ""}`

  return (
    <details className="marcos-cfo" style={{ width: "100%", padding: "0 18px", borderRadius: 16, background: "#fff",
      border: "1px solid rgba(181,147,63,0.45)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <summary style={{ listStyle: "none", cursor: "pointer", padding: "13px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--ink-60)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Demais eventos
          </span>
          <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "var(--olive)", marginTop: 2 }}>{resumo}</span>
        </span>
        <span className="marcos-cfo-seta" aria-hidden style={{ fontSize: 13, color: "var(--ink-60)", flexShrink: 0 }}>▾</span>
      </summary>
      <ol style={{ listStyle: "none", margin: "4px 0 0", padding: "0 0 6px" }}>
        {marcos.map((m, i) => {
          const feito = m.situacao === "feito"
          const destaque = m.situacao === "agora" || m.situacao === "proximo"
          const ultimo = i === marcos.length - 1
          const quando = m.data
            ? `${dataCurta(m.data)}${m.fim ? ` a ${dataCurta(m.fim)}` : ""}`
            : "a definir"
          return (
            <li key={m.id} style={{ display: "flex", gap: 12 }}>
              {/* trilho: marcador + linha até o próximo */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 18, flexShrink: 0 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 999, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  background: feito ? "var(--olive)" : destaque ? "var(--gold)" : "#fff",
                  border: feito || destaque ? "none" : "1.5px solid rgba(58,74,58,0.3)",
                }}>
                  {feito && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </span>
                {!ultimo && <span style={{ flex: 1, width: 1.5, minHeight: 14, background: feito ? "var(--olive)" : "rgba(58,74,58,0.18)" }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingBottom: ultimo ? 10 : 14, display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 14, lineHeight: 1.35, color: feito ? "var(--ink-60)" : "var(--ink)", fontWeight: destaque ? 700 : 500 }}>
                  {m.rotulo}
                  {destaque && m.dias !== null && (
                    <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--gold)" }}>
                      {m.situacao === "agora" ? "em andamento" : m.dias === 1 ? "amanhã" : `em ${m.dias} dias`}
                    </span>
                  )}
                </span>
                <span style={{ fontSize: 12.5, color: "var(--ink-60)", whiteSpace: "nowrap", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {quando}
                  {m.nota && m.data && <span style={{ display: "block", fontSize: 11 }}>{m.nota}</span>}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </details>
  )
}
