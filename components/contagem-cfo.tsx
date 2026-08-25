import { DATA_FIM_CFO, DATA_INICIO, diasParaFimCFO } from "@/lib/utils"

// Contagem regressiva para o término do CFO. Server component — a página que a usa
// é `force-dynamic`, então o número é recalculado a cada carregamento.
export function ContagemCFO({ compacto = false }: { compacto?: boolean }) {
  const dias = diasParaFimCFO()
  const semanas = Math.floor(dias / 7)
  const meses = Math.floor(dias / 30)

  const totalDias = Math.round((DATA_FIM_CFO.getTime() - Date.UTC(
    DATA_INICIO.getUTCFullYear(), DATA_INICIO.getUTCMonth(), DATA_INICIO.getUTCDate(),
  )) / 86_400_000)
  const percorrido = Math.min(100, Math.max(0, Math.round(((totalDias - dias) / totalDias) * 100)))

  const fim = DATA_FIM_CFO.toLocaleDateString("pt-BR", { timeZone: "UTC" })

  return (
    <div style={{
      gridColumn: compacto ? undefined : "1/-1",
      background: "linear-gradient(135deg, var(--azul-profundo) 0%, #12407f 55%, #1d4f9a 100%)",
      borderRadius: 14, padding: compacto ? "16px 18px" : "20px 24px",
      color: "#fff", boxShadow: "0 4px 16px rgba(11,45,94,0.18)",
      display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexShrink: 0 }}>
        <span style={{
          fontFamily: "var(--serif)", fontWeight: 700, fontSize: 44,
          color: "var(--dourado-claro)", lineHeight: 1,
        }}>
          {dias}
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--dourado-claro)" }}>
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
        <p style={{ fontSize: 13, margin: "3px 0 9px", color: "#dbe7fa" }}>
          {dias === 0 ? "É hoje." : <>Previsão: <strong>{fim}</strong> · ~{semanas} semanas{meses > 0 && ` · ~${meses} ${meses === 1 ? "mês" : "meses"}`}</>}
        </p>
        <div style={{ height: 7, background: "rgba(255,255,255,0.18)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${percorrido}%`, background: "var(--dourado)", borderRadius: 99 }} />
        </div>
        <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.6)", margin: "5px 0 0" }}>
          {percorrido}% do curso percorrido
        </p>
      </div>
    </div>
  )
}
