// ─────────────────────────────────────────────────────────────
//  Datas do calendário — tudo em ISO local ("YYYY-MM-DD").
//  Nunca usar Date.toISOString(): ele converte para UTC e à noite
//  adianta o dia.
// ─────────────────────────────────────────────────────────────

import { CONFIG_CALENDARIO } from "./calendario-config"

export const MESES_NOME = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]
export const MESES_ABREV = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
export const DIAS_CABECALHO = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"]
export const DIAS_LONGO = ["domingo", "segunda-feira", "terça-feira", "quarta-feira",
  "quinta-feira", "sexta-feira", "sábado"]

export const iso = (ano: number, mes0: number, dia: number) =>
  `${ano}-${String(mes0 + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`

export const partes = (s: string) => {
  const [ano, mes, dia] = s.split("-").map(Number)
  return { ano, mes0: mes - 1, dia }
}

/** 0 = segunda … 6 = domingo */
export const diaSemanaSeg = (s: string) => {
  const p = partes(s)
  return (new Date(p.ano, p.mes0, p.dia).getDay() + 6) % 7
}

export const diaSemanaLongo = (s: string) => {
  const p = partes(s)
  return DIAS_LONGO[new Date(p.ano, p.mes0, p.dia).getDay()]
}

export const somaDias = (s: string, n: number) => {
  const p = partes(s)
  const d = new Date(p.ano, p.mes0, p.dia + n)
  return iso(d.getFullYear(), d.getMonth(), d.getDate())
}

/** "26/09" */
export const curta = (s: string) => {
  const p = partes(s)
  return `${String(p.dia).padStart(2, "0")}/${String(p.mes0 + 1).padStart(2, "0")}`
}

export const ultimoDia = (ano: number, mes0: number) => new Date(ano, mes0 + 1, 0).getDate()

/** Dias inteiros entre dois ISO (b - a). */
export const diasEntre = (a: string, b: string) => {
  const pa = partes(a), pb = partes(b)
  return Math.round(
    (new Date(pb.ano, pb.mes0, pb.dia).getTime() - new Date(pa.ano, pa.mes0, pa.dia).getTime()) / 86_400_000)
}

/** "14 a 20/09" · "28/09 a 04/10" · "26/09" */
export function faixaCurta(de: string, ate: string): string {
  if (de === ate) return curta(de)
  const a = partes(de), b = partes(ate)
  return a.ano === b.ano && a.mes0 === b.mes0
    ? `${String(a.dia).padStart(2, "0")} a ${curta(ate)}`
    : `${curta(de)} a ${curta(ate)}`
}

export type Mes = {
  chave: string
  ano: number
  mes0: number
  rotulo: string
  abrev: string
  inicio: string
  fim: string
}

/** Meses do ano letivo configurado, em ordem. */
export function mesesDoAnoLetivo(): Mes[] {
  const ini = partes(CONFIG_CALENDARIO.anoLetivo.inicio)
  const fim = partes(CONFIG_CALENDARIO.anoLetivo.fim)
  const out: Mes[] = []
  let ano = ini.ano, mes0 = ini.mes0
  while (ano < fim.ano || (ano === fim.ano && mes0 <= fim.mes0)) {
    out.push({
      chave: `${ano}-${String(mes0 + 1).padStart(2, "0")}`,
      ano, mes0,
      rotulo: `${MESES_NOME[mes0]} de ${ano}`,
      // o ano só aparece quando vira (jan/27), para a aba não ficar longa
      abrev: mes0 === 0 ? `${MESES_ABREV[mes0]} ${String(ano).slice(2)}` : MESES_ABREV[mes0],
      inicio: iso(ano, mes0, 1),
      fim: iso(ano, mes0, ultimoDia(ano, mes0)),
    })
    mes0++
    if (mes0 > 11) { mes0 = 0; ano++ }
  }
  return out
}

export type Semana = { indice: number; inicio: string; fim: string; rotulo: string }

/** Semanas (segunda a domingo) que tocam o mês, recortadas ao mês. */
export function semanasDoMes(mes: Mes): Semana[] {
  const out: Semana[] = []
  let cursor = somaDias(mes.inicio, -diaSemanaSeg(mes.inicio))
  let indice = 1
  while (cursor <= mes.fim) {
    const fimSemana = somaDias(cursor, 6)
    const inicio = cursor < mes.inicio ? mes.inicio : cursor
    const fim = fimSemana > mes.fim ? mes.fim : fimSemana
    out.push({ indice, inicio, fim, rotulo: `Semana ${faixaCurta(inicio, fim)}` })
    cursor = somaDias(cursor, 7)
    indice++
  }
  return out
}

/** Células da grade do mês: semanas inteiras (seg–dom) que cobrem o mês. */
export function celulasDaGrade(mes: Mes): string[] {
  const celulas: string[] = []
  let d = somaDias(mes.inicio, -diaSemanaSeg(mes.inicio))
  while (d <= mes.fim || celulas.length % 7 !== 0) {
    celulas.push(d)
    d = somaDias(d, 1)
  }
  return celulas
}
