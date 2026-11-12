// Marcos da reta final do CFO 2026, na ordem em que acontecem. Exibidos na
// página inicial (/inicio) como linha do tempo. Sem data publicada → `data`
// ausente ("a definir"); quando sair, é só preencher.
import { partesEmRecife } from "./utils"

export type MarcoLinha = {
  id: string
  rotulo: string
  /** ISO "YYYY-MM-DD" — início (ou dia único) */
  data?: string
  /** ISO — último dia, em eventos de vários dias */
  fim?: string
  /** complemento curto da data (ex.: "data possível") */
  nota?: string
}

export const MARCOS_LINHA: MarcoLinha[] = [
  { id: "provas", rotulo: "Fim das provas teóricas", data: "2026-11-11" },
  { id: "disciplinas", rotulo: "Fim das disciplinas" },
  { id: "ranking", rotulo: "Divulgação do ranking" },
  { id: "mapom", rotulo: "MAPOM", data: "2026-11-29", fim: "2026-12-04", nota: "data possível" },
  { id: "culto", rotulo: "Culto ecumênico e cerimônia militar", data: "2026-12-17" },
  { id: "formatura", rotulo: "Formatura e baile", data: "2027-01-23", nota: "baile" },
]

export type SituacaoMarco = "feito" | "agora" | "proximo" | "futuro"

/** Situação de cada marco hoje (fuso de Recife) e dias até o início. */
export function marcosComSituacao(agora: Date = new Date()) {
  const { ano, mes, dia } = partesEmRecife(agora)
  const hoje = `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
  const diasAte = (iso: string) => {
    const [a, m, d] = iso.split("-").map(Number)
    return Math.round((Date.UTC(a, m - 1, d) - Date.UTC(ano, mes - 1, dia)) / 86_400_000)
  }
  let proximoMarcado = false
  return MARCOS_LINHA.map(m => {
    let situacao: SituacaoMarco
    if (m.data && (m.fim ?? m.data) < hoje) situacao = "feito"
    else if (m.data && m.data <= hoje) situacao = "agora"
    else if (!proximoMarcado) situacao = "proximo"
    else situacao = "futuro"
    if (situacao === "agora" || situacao === "proximo") proximoMarcado = true
    return { ...m, situacao, dias: m.data ? diasAte(m.data) : null }
  })
}

/** "2026-11-29" → "29/11"; outro ano → "23/01/2027". */
export function dataCurta(iso: string): string {
  const [a, m, d] = iso.split("-")
  return a === "2026" ? `${d}/${m}` : `${d}/${m}/${a}`
}
