import { DATA_FIM_CFO, DATA_INICIO, diasParaFimCFO } from "@/lib/utils"

// Contagem regressiva para o término do CFO. Server component — a página que a usa
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
    </div>
  )
}
