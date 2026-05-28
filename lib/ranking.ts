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
export function calcularMGCSimples(notas: Verificacao[], nfdc = 10): number | null {
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

  return calcularMGC({ mfic, nfdc, tcc })
}

// ── Bases Históricas ─────────────────────────────────────────────────────────────
// Notas em ordem decrescente (1º lugar = índice 0)

export const BASE_T1: number[] = [
  9.876, 9.844, 9.837, 9.833, 9.807, 9.798, 9.794, 9.792, 9.790, 9.769,
  9.766, 9.754, 9.753, 9.752, 9.741, 9.733, 9.729, 9.728, 9.728, 9.722,
  9.720, 9.720, 9.713, 9.710, 9.699, 9.699, 9.697, 9.696, 9.690, 9.690,
  9.689, 9.688, 9.687, 9.683, 9.673, 9.664, 9.664, 9.663, 9.662, 9.654,
  9.653, 9.649, 9.648, 9.647, 9.647, 9.643, 9.641, 9.640, 9.638, 9.637,
  9.634, 9.633, 9.629, 9.625, 9.619, 9.617, 9.614, 9.612, 9.597, 9.596,
  9.593, 9.593, 9.589, 9.589, 9.579, 9.575, 9.571, 9.557, 9.556, 9.556,
  9.545, 9.545, 9.544, 9.543, 9.535, 9.531, 9.528, 9.527, 9.527, 9.527,
  9.527, 9.523, 9.519, 9.517, 9.511, 9.507, 9.505, 9.503, 9.502, 9.499,
  9.497, 9.496, 9.494, 9.490, 9.489, 9.488, 9.487, 9.485, 9.484, 9.481,
  9.478, 9.474, 9.473, 9.472, 9.464, 9.461, 9.460, 9.458, 9.455, 9.453,
  9.438, 9.436, 9.432, 9.431, 9.430, 9.421, 9.417, 9.406, 9.405, 9.398,
  9.397, 9.395, 9.381, 9.380, 9.380, 9.371, 9.371, 9.354, 9.350, 9.328,
  9.328, 9.321, 9.310, 9.305, 9.304, 9.303, 9.300, 9.291, 9.262, 9.204,
  9.200, 9.199, 9.197, 9.144, 9.098, 8.867, 8.757, 8.645,
]

export const BASE_T2: number[] = [
  9.814, 9.804, 9.767, 9.765, 9.759, 9.753, 9.752, 9.738, 9.735, 9.732,
  9.722, 9.716, 9.713, 9.713, 9.706, 9.705, 9.690, 9.687, 9.687, 9.687,
  9.687, 9.683, 9.677, 9.677, 9.675, 9.674, 9.673, 9.671, 9.671, 9.671,
  9.670, 9.669, 9.664, 9.663, 9.658, 9.658, 9.652, 9.651, 9.650, 9.648,
  9.647, 9.645, 9.641, 9.640, 9.637, 9.631, 9.629, 9.627, 9.621, 9.621,
  9.621, 9.617, 9.615, 9.615, 9.612, 9.612, 9.612, 9.612, 9.609, 9.606,
  9.598, 9.595, 9.595, 9.593, 9.593, 9.592, 9.592, 9.590, 9.588, 9.586,
  9.583, 9.580, 9.579, 9.579, 9.576, 9.565, 9.562, 9.561, 9.560, 9.557,
  9.557, 9.557, 9.555, 9.553, 9.550, 9.545, 9.544, 9.542, 9.539, 9.537,
  9.536, 9.536, 9.536, 9.534, 9.530, 9.526, 9.526, 9.525, 9.524, 9.523,
  9.522, 9.521, 9.516, 9.514, 9.514, 9.514, 9.512, 9.507, 9.507, 9.502,
  9.501, 9.501, 9.500, 9.499, 9.498, 9.497, 9.495, 9.494, 9.491, 9.490,
  9.483, 9.481, 9.479, 9.477, 9.475, 9.475, 9.472, 9.461, 9.456, 9.451,
  9.446, 9.444, 9.442, 9.439, 9.438, 9.433, 9.432, 9.432, 9.427, 9.427,
  9.421, 9.419, 9.419, 9.414, 9.403, 9.403, 9.401, 9.400, 9.400, 9.400,
  9.399, 9.394, 9.388, 9.386, 9.383, 9.359, 9.351, 9.348, 9.343, 9.335,
  9.323, 9.318, 9.315, 9.300, 9.292, 9.264, 9.254, 9.235, 9.102, 9.069,
  9.043,
]

/** Posição histórica interpolada (1-based, fracionária) em uma base ordenada desc */
export function calcularPosicaoHistorica(mgc: number, base: number[]): number {
  if (base.length === 0) return 1
  if (mgc >= base[0]) return 1
  if (mgc <= base[base.length - 1]) return base.length + 1
  for (let i = 0; i < base.length - 1; i++) {
    if (mgc <= base[i] && mgc > base[i + 1]) {
      const frac = (base[i] - mgc) / (base[i] - base[i + 1])
      return (i + 1) + frac
    }
  }
  return base.length
}

/** Percentil: % de candidatos históricos com nota abaixo da MGC fornecida */
export function calcularPercentil(mgc: number, base: number[]): number {
  if (base.length === 0) return 0
  const pos = calcularPosicaoHistorica(mgc, base)
  return Math.max(0, Math.min(100, Math.round(((base.length - pos) / base.length) * 100)))
}

/**
 * Projeção consolidada da posição final dentro da T3.
 * Combina dados reais já lançados com distribuição histórica (T1+T2)
 * para estimar onde o aluno terminará.
 */
export function calcularProjecaoConsolidada(
  mgc: number,
  t3AcimaAtual: number,   // cadetes T3 com MGC acima do aluno (= posicao - 1)
  t3Total: number,         // total de cadetes na T3
  t3ComDados: number,      // quantos já têm MGC calculada
): { melhor: number; provavel: number; conservador: number } {
  if (t3Total === 0) return { melhor: 1, provavel: 1, conservador: 1 }

  const semDados = t3Total - t3ComDados

  // Fração histórica ponderada (média T1 + T2) que ficou ACIMA de mgc
  const posT1 = calcularPosicaoHistorica(mgc, BASE_T1)
  const posT2 = calcularPosicaoHistorica(mgc, BASE_T2)
  const fracHistAcima = ((posT1 - 1) / BASE_T1.length + (posT2 - 1) / BASE_T2.length) / 2

  // Peso dinâmico: quanto mais T3 com dados, menos depende do histórico
  const pesoHistorico = 1 - t3ComDados / t3Total
  const fracEfetiva = pesoHistorico > 0 ? fracHistAcima : 0

  const semDadosAcima = fracEfetiva * semDados
  const acimaTotal = t3AcimaAtual + semDadosAcima
  const provavel = Math.min(t3Total, Math.max(1, Math.round(acimaTotal) + 1))

  // Incerteza proporcional aos cadetes sem dados
  const margem = Math.max(1, Math.round(semDados * 0.3))

  return {
    melhor: Math.max(1, provavel - margem),
    provavel,
    conservador: Math.min(t3Total, provavel + margem),
  }
}

/** Extrai MFIC e TCC separadamente (para exibição detalhada) */
export function calcularComponentes(notas: Verificacao[], nfdc = 10) {
  const notaTCC = notas.find((n) => n.disciplina === "TCC" || n.avaliacao === "TCC")
  const notasSemTCC = notas.filter((n) => n.disciplina !== "TCC" && n.avaliacao !== "TCC")

  const porDisc = new Map<string, Verificacao[]>()
  for (const n of notasSemTCC) {
    if (!porDisc.has(n.disciplina)) porDisc.set(n.disciplina, [])
    porDisc.get(n.disciplina)!.push(n)
  }

  const mfic = calcularMFIC(porDisc)
  const tcc = notaTCC?.nota ?? null
  const mgc = calcularMGC({ mfic, nfdc, tcc })

  return { mfic, nfdc, tcc, mgc }
}
