// Treino de Armamento e Munição — disponibilidade temporária.
// Fica no ar só até 07/08/2026 (fim do dia, horário de Brasília UTC-3);
// após isso o card some e o middleware bloqueia o acesso direto à URL.
// Módulo puro (sem deps) para ser edge-safe e reutilizável no middleware.

export const TREINO_ARMAMENTO_HREF = "/treino-armamento/index.html"
export const TREINO_ARMAMENTO_ATE = "07/08"
// Fim de 07/08/2026 em Brasília (UTC-3) = 08/08 00:00 -03:00 = 03:00Z.
export const TREINO_ARMAMENTO_CUTOFF = Date.parse("2026-08-08T03:00:00Z")

export function treinoArmamentoDisponivel(now: number = Date.now()): boolean {
  return now < TREINO_ARMAMENTO_CUTOFF
}
