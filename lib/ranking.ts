import "server-only"

/**
 * Fórmula conforme Decreto 57.694/2024 — CFO PMPE
 *
 * MGC = (MFIC × 6,5 + NFDC × 2,5 + TCC × 1) / 10
 *
 * MFIC = média aritmética simples das MD (ou MDR) de todas as disciplinas
 *        (excluindo disciplinas com conceito APTO/INAPTO)
 * NFDC = nota disciplinar, inicia em 10 e varia por transgressões/méritos
 * TCC  = nota do Trabalho de Conclusão de Curso
 *
 * MD   = média aritmética simples de todas as verificações da disciplina
 * MDR  = quando MD estava entre 4,0 e 6,9 e aluno fez Avaliação Final →
 *        se (MD + AF) / 2 ≥ 7,0, MDR = 7,0 (teto fixo)
 */

export type Verificacao = {
  disciplina: string
  avaliacao: string   // nome da verificação: "P1", "P2", "AF", etc.
  nota: number        // 0–10
  peso: number        // sempre 1 (MD = média simples), campo mantido para compatibilidade
  ehAF?: boolean      // true se for Avaliação Final (usada no cálculo de MDR)
  apto?: boolean      // true se disciplina é APTO/INAPTO (excluída da MFIC)
}

export type ComponentesMGC = {
  mfic: number | null
  nfdc: number        // default 10, ajustado por transgressões/méritos
  tcc: number | null
}

/** Calcula MD de uma disciplina (média aritmética simples das verificações, excluindo AF) */
function calcularMD(verificacoes: Verificacao[]): number | null {
  const notas = verificacoes.filter((v) => !v.ehAF && !v.apto)
  if (notas.length === 0) return null
  return notas.reduce((s, v) => s + v.nota, 0) / notas.length
}

/** Calcula MDR: se MD entre 4,0 e 6,9 e há AF → (MD + AF) / 2 ≥ 7 → MDR = 7,0 */
function calcularMDR(md: number, af: number | null): number {
  if (af === null) return md
  const media = (md + af) / 2
  return media >= 7.0 ? 7.0 : media
}

/** Calcula MFIC: média aritmética das MD/MDR de todas as disciplinas (exceto APTO/INAPTO) */
export function calcularMFIC(verificacoesPorDisciplina: Map<string, Verificacao[]>): number | null {
  const medias: number[] = []

  for (const [, vers] of verificacoesPorDisciplina) {
    if (vers.some((v) => v.apto)) continue // exclui APTO/INAPTO

    const md = calcularMD(vers)
    if (md === null) continue

    const af = vers.find((v) => v.ehAF)?.nota ?? null

    let mdFinal: number
    if (md >= 7.0) {
      mdFinal = md
    } else if (md >= 4.0 && af !== null) {
      mdFinal = calcularMDR(md, af)
    } else {
      mdFinal = md // reprovado, mas ainda entra na MFIC
    }

    medias.push(mdFinal)
  }

  if (medias.length === 0) return null
  return medias.reduce((s, m) => s + m, 0) / medias.length
}

/** Calcula MGC final com precisão de 3 casas decimais */
export function calcularMGC({ mfic, nfdc, tcc }: ComponentesMGC): number | null {
  if (mfic === null) return null

  const tccVal = tcc ?? 0
  const mgc = (mfic * 6.5 + nfdc * 2.5 + tccVal * 1) / 10

  return Number(mgc.toFixed(3))
}

/**
 * Versão simplificada para o ranking enquanto o aluno lança notas:
 * Agrupa as verificações por disciplina e calcula MFIC + MGC.
 * NFDC = 10 (sem transgressões registradas ainda).
 * TCC = incluído se avaliacao === "TCC".
 */
export function calcularMGCSimples(notas: Verificacao[]): number | null {
  if (notas.length === 0) return null

  // Separa TCC
  const notaTCC = notas.find((n) => n.disciplina === "TCC" || n.avaliacao === "TCC")
  const notasSemTCC = notas.filter((n) => n.disciplina !== "TCC" && n.avaliacao !== "TCC")

  // Agrupa por disciplina
  const porDisc = new Map<string, Verificacao[]>()
  for (const n of notasSemTCC) {
    if (!porDisc.has(n.disciplina)) porDisc.set(n.disciplina, [])
    porDisc.get(n.disciplina)!.push(n)
  }

  const mfic = calcularMFIC(porDisc)
  const tcc = notaTCC?.nota ?? null

  return calcularMGC({ mfic, nfdc: 10, tcc })
}
