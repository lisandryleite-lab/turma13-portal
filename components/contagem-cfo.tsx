import { DATA_FIM_CFO, DATA_FORMATURA, DATA_INICIO, diasParaFimCFO, diasParaFormatura } from "@/lib/utils"

// Contagem regressiva para o término do CFO e, logo abaixo, para a formatura. Server component — a página que a usa
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
  const diasFormatura = diasParaFormatura()
  const formatura = DATA_FORMATURA.toLocaleDateString("pt-BR", { timeZone: "UTC" })

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

      {/* Formatura — linha inteira abaixo da contagem do término */}
      <div style={{
        flexBasis: "100%", display: "flex", alignItems: "center", gap: 12,
        borderTop: "1px solid rgba(255,255,255,0.18)", paddingTop: 12,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={paleta.realce} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
          <path d="M22 10 12 5 2 10l10 5 10-5Z" />
          <path d="M6 12v5c3 2 9 2 12 0v-5" />
          <path d="M22 10v6" />
        </svg>
        <p style={{ fontSize: 13, margin: 0, color: "rgba(255,255,255,0.85)" }}>
          {diasFormatura === 0 ? <strong style={{ color: paleta.realce }}>Formatura é hoje!</strong> : <>
            <strong style={{ fontFamily: paleta.serif, fontSize: 20, color: paleta.realce }}>{diasFormatura}</strong>{" "}
            {diasFormatura === 1 ? "dia" : "dias"} para a <strong>formatura</strong> · {formatura}
          </>}
        </p>
      </div>
    </div>
  )
}
