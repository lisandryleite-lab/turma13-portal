// Levantamento de interesse em OMEs para o aspirantado (DAG CFO 2026).
// Fonte: planilha de respostas do formulário da DAG, compartilhada por link.
// Lida ao vivo (cache de 5 min) — novas respostas aparecem sozinhas.
// O e-mail dos respondentes NUNCA sai daqui: só matrícula, QRA e as opções.
import "server-only"

const PLANILHA_CSV =
  "https://docs.google.com/spreadsheets/d/125gfCUMmfSb3VYOEEuTElfK3TY73QpCn5oEgvNxc_FQ/export?format=csv&gid=306481064"
export const PLANILHA_URL =
  "https://docs.google.com/spreadsheets/d/125gfCUMmfSb3VYOEEuTElfK3TY73QpCn5oEgvNxc_FQ/edit?gid=306481064"

export type RespostaOME = { mat: number; qra: string; opcao1: string; opcao2: string | null; respondidoEm: string }

function parseCsv(t: string): string[][] {
  const rows: string[][] = []
  let r: string[] = [], f = "", q = false
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (q) {
      if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++ } else q = false } else f += c
    } else if (c === '"') q = true
    else if (c === ",") { r.push(f); f = "" }
    else if (c === "\n") { r.push(f); rows.push(r); r = []; f = "" }
    else if (c !== "\r") f += c
  }
  if (f || r.length) { r.push(f); rows.push(r) }
  return rows
}

/** "11º BPM - Apipucos, Recife" → "11º BPM"; "BPTUR - Varadouro, Olinda" → "BPTur". */
export function siglaDoRotulo(rotulo: string): string | null {
  const m = rotulo.trim().match(/^(\d+)\s*º\s*BPM/i)
  if (m) return `${m[1]}º BPM`
  if (/^BPTUR/i.test(rotulo.trim())) return "BPTur"
  return null
}

function dataDe(s: string): number {
  const [d, h = "00:00:00"] = s.trim().split(" ")
  const [D, M, Y] = d.split("/")
  return Date.parse(`${Y}-${M}-${D}T${h}`) || 0
}

/** Respostas válidas, uma por matrícula (vale a mais recente). null se a planilha não abrir. */
export async function carregarLevantamento(): Promise<RespostaOME[] | null> {
  try {
    const res = await fetch(PLANILHA_CSV, { next: { revalidate: 300 } })
    if (!res.ok) return null
    const linhas = parseCsv((await res.text()).replace(/^﻿/, "")).slice(1)
    const porMat = new Map<number, RespostaOME & { t: number }>()
    for (const l of linhas) {
      if (l.length < 4) continue
      const mat = Number((l[2].trim().match(/^0*(\d+)/) ?? [])[1])
      const opcao1 = siglaDoRotulo(l[3] ?? "")
      if (!mat || !opcao1) continue
      const t = dataDe(l[0])
      const atual = porMat.get(mat)
      if (atual && atual.t >= t) continue
      porMat.set(mat, {
        mat, qra: l[2].trim().replace(/^0*\d+\s*/, "").toUpperCase(),
        opcao1, opcao2: siglaDoRotulo(l[4] ?? ""), respondidoEm: new Date(t).toISOString(), t,
      })
    }
    return [...porMat.values()].map(({ t: _t, ...r }) => r)
  } catch {
    return null
  }
}
