// Treino de Armamento e Munição — disponibilidade temporária.
// Fica no ar só até 17/07/2026 (fim do dia, horário de Brasília UTC-3);
// após isso o card some e o middleware bloqueia o acesso direto à URL.
// Módulo puro (sem deps) para ser edge-safe e reutilizável no middleware.

export const TREINO_ARMAMENTO_HREF = "/treino-armamento/index.html"
export const TREINO_ARMAMENTO_ATE = "17/07"
// Fim de 17/07/2026 em Brasília (UTC-3) = 18/07 00:00 -03:00 = 03:00Z.
export const TREINO_ARMAMENTO_CUTOFF = Date.parse("2026-07-18T03:00:00Z")

export function treinoArmamentoDisponivel(now: number = Date.now()): boolean {
  return now < TREINO_ARMAMENTO_CUTOFF
}
