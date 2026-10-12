import { DATA_FIM_CFO, DATA_INICIO, diasParaFimCFO, marcosPendentes } from "@/lib/utils"

// Contagem regressiva para o término do CFO e, logo abaixo, para MAPOM, formatura e baile. Server component — a página que a usa
// é `force-dynamic`, então o número é recalculado a cada carregamento.
//
// `tema`: o portal tem duas paletas — "azul" no grupo (logado) e "olive" no hub
// (cfo). O componente aparece nos dois, então precisa vestir a cor de cada um.
export function ContagemCFO({
  compacto = false, tema = "azul",
}: { compacto?: boolean; tema?: "azul" | "olive" }) {
  const dias = diasParaFimCFO()
  const semanas = Math.floor(dias / 7)
  const meses = Math.floor(dias / 30)

  const totalDias = Math.round((DATA_FIM_CFO.getTime() - Date.UTC(
    DATA_INICIO.getUTCFullYear(), DATA_INICIO.getUTCMonth(), DATA_INICIO.getUTCDate(),
  )) / 86_400_000)
  const percorrido = Math.min(100, Math.max(0, Math.round(((totalDias - dias) / totalDias) * 100)))

  const fim = DATA_FIM_CFO.toLocaleDateString("pt-BR", { timeZone: "UTC" })
  const marcos = marcosPendentes()
  const ddmmaa = (d: Date) => d.toLocaleDateString("pt-BR", { timeZone: "UTC" })

  const paleta = tema === "olive"
    ? { fundo: "linear-gradient(135deg, #3a4a3a 0%, #45573f 55%, #4f6347 100%)",
        realce: "#e0c979", sombra: "rgba(58,74,58,0.20)", serif: "var(--serif-cfo)" }
    : { fundo: "linear-gradient(135deg, var(--azul-profundo) 0%, #12407f 55%, #1d4f9a 100%)",
        realce: "var(--dourado-claro)", sombra: "rgba(11,45,94,0.18)", serif: "var(--serif)" }

  return (
    <div style={{
      gridColumn: compacto ? undefined : "1/-1",
      background: paleta.fundo,
      borderRadius: 14, padding: compacto ? "16px 18px" : "20px 24px",
      color: "#fff", boxShadow: `0 4px 16px ${paleta.sombra}`,
      display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexShrink: 0 }}>
        <span style={{
          fontFamily: paleta.serif, fontWeight: 700, fontSize: 44,
          color: paleta.realce, lineHeight: 1,
        }}>
          {dias}
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: paleta.realce }}>
          {dias === 1 ? "dia" : "dias"}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 190 }}>
        <p style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.1em", color: "rgba(255,255,255,0.65)", margin: 0,
        }}>
          Para o término do CFO
        </p>
        <p style={{ fontSize: 13, margin: "3px 0 9px", color: "rgba(255,255,255,0.85)" }}>
          {dias === 0 ? "É hoje." : <>Previsão: <strong>{fim}</strong> · ~{semanas} semanas{meses > 0 && ` · ~${meses} ${meses === 1 ? "mês" : "meses"}`}</>}
        </p>
        <div style={{ height: 7, background: "rgba(255,255,255,0.18)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${percorrido}%`, background: paleta.realce, borderRadius: 99 }} />
        </div>
        <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.6)", margin: "5px 0 0" }}>
          {percorrido}% do curso percorrido
        </p>
      </div>

      {/* Marcos (MAPOM, formatura, baile) — uma linha cada, abaixo do término */}
      {marcos.length > 0 && (
        <div style={{ flexBasis: "100%", borderTop: "1px solid rgba(255,255,255,0.18)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          {marcos.map(m => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={paleta.realce} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
                {m.id === "formatura" ? (<><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /><path d="M22 10v6" /></>)
                  : m.id === "baile" ? (<><path d="M8 22h8" /><path d="M12 11v11" /><path d="m19 3-7 8-7-8Z" /></>)
                  : (<><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" /><path d="M15 5.764v15" /><path d="M9 3.236v15" /></>)}
              </svg>
              <p style={{ fontSize: 13, margin: 0, color: "rgba(255,255,255,0.85)" }}>
                {m.emAndamento ? <><strong style={{ color: paleta.realce }}>{m.rotulo === "MAPOM" ? "MAPOM" : m.rotulo[0].toUpperCase() + m.rotulo.slice(1)} {m.fim ? "em andamento" : "é hoje!"}</strong>{m.nota ? ` · ${m.nota}` : ""}</> : <>
                  <strong style={{ fontFamily: paleta.serif, fontSize: 20, color: paleta.realce }}>{m.dias}</strong>{" "}
                  {m.dias === 1 ? "dia" : "dias"} para {m.id === "mapom" ? "o" : "a"} <strong>{m.rotulo}</strong> · {m.nota ?? ddmmaa(m.inicio)}
                </>}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
