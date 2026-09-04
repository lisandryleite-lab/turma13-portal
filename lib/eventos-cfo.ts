// ─────────────────────────────────────────────────────────────
//  Eventos e solenidades do CFO 2026 — previsão.
//
//  Datas confirmadas pela coordenação/comissão de formatura são
//  marcadas com `confirmado: true`; as demais são previsão e
//  podem mudar. Atualizar aqui conforme forem confirmadas.
// ─────────────────────────────────────────────────────────────

export type EventoCFO = {
  /** ISO — data do evento */
  data: string
  titulo: string
  /** subtítulo curto, ex.: "Dia D / Hora H" */
  chamada?: string
  descricao?: string
  horarios?: { rotulo: string; hora: string }[]
  confirmado: boolean
}

export const EVENTOS_CFO: EventoCFO[] = [
  {
    data: "2026-09-26",
    titulo: "100 Dias",
    chamada: "Dia D / Hora H",
    descricao: "Comemoração dos 100 dias para a formatura.",
    horarios: [
      { rotulo: "Início", hora: "11h00" },
      { rotulo: "Retraimento", hora: "17h00" },
    ],
    confirmado: true,
  },
  {
    data: "2027-01-19",
    titulo: "Culto Ecumênico",
    descricao: "Previsão — data ainda não confirmada.",
    confirmado: false,
  },
  {
    data: "2027-01-23",
    titulo: "Baile das Espadas",
    descricao: "Baile de formatura do CFO 2026.",
    confirmado: false,
  },
]

const DIAS_SEMANA = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"]
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]

/** Converte "2026-09-26" em Date no fuso local (evita o off-by-one do parse UTC). */
export function dataLocal(iso: string): Date {
  const [a, m, d] = iso.split("-").map(Number)
  return new Date(a, m - 1, d)
}

/** "sábado, 26 de setembro de 2026" */
export function dataPorExtenso(iso: string): string {
  const d = dataLocal(iso)
  return `${DIAS_SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
}

/** "26/09" */
export function dataCurta(iso: string): string {
  const d = dataLocal(iso)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
}

/** Dias inteiros de hoje até a data (negativo = já passou). */
export function diasAte(iso: string, hojeIso: string): number {
  const ms = dataLocal(iso).getTime() - dataLocal(hojeIso).getTime()
  return Math.round(ms / 86_400_000)
}
