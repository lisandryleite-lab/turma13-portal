// Previsão de posição por percentil — Fase 4 (CFO 2026).
// Cálculo em JS puro, sem bibliotecas. Compara a MÉDIA autodeclarada do aluno
// com a distribuição das notas finais históricas (T1 + T2) e estima uma FAIXA
// de posição na turma atual (T3). NUNCA retorna número cravado.

export type Previsao = {
  media: number
  medianaHistorica: number
  percentil: number // 0–100 (maior = melhor colocado)
  posicaoMin: number
  posicaoMax: number
  turmaSize: number
  qtdNotas: number
  confiavel: boolean // false quando poucas notas declaradas
}

export function calcularPrevisao(
  notasAluno: number[],
  historico: number[],
  turmaSize: number
): Previsao | null {
  if (notasAluno.length === 0 || historico.length === 0 || turmaSize < 1) return null

  const media = notasAluno.reduce((s, n) => s + n, 0) / notasAluno.length
  const ordenado = [...historico].sort((a, b) => a - b)
  const medianaHistorica = ordenado[Math.floor(ordenado.length / 2)]

  // percentil = % das notas históricas <= média do aluno
  const menoresOuIguais = ordenado.filter(v => v <= media).length
  const percentil = (menoresOuIguais / ordenado.length) * 100

  // posição central estimada (1 = melhor). percentil alto => posição baixa (boa)
  const posCentral = Math.round((1 - percentil / 100) * (turmaSize - 1)) + 1

  // margem de incerteza: base ~5% da turma + extra se poucas notas declaradas
  const base = Math.ceil(turmaSize * 0.05)
  const poucas = notasAluno.length < 5
  const margem = base + (poucas ? Math.ceil(turmaSize * 0.08) : 0)

  const posicaoMin = Math.max(1, posCentral - margem)
  const posicaoMax = Math.min(turmaSize, posCentral + margem)

  return {
    media,
    medianaHistorica,
    percentil,
    posicaoMin,
    posicaoMax,
    turmaSize,
    qtdNotas: notasAluno.length,
    confiavel: !poucas,
  }
}
