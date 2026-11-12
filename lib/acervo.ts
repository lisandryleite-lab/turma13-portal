// Fim das provas teóricas do CFO 2026 → Mementos e Questões viram "Acervo".
// Nada é apagado: o material de turmas anteriores segue disponível para
// consulta, só sai do primeiro plano. Em destaque fica a reta final
// (MAPOM, formatura, aspirantado).

/** Última prova teórica do curso: DPPM e POE, quarta 11/11/2026. */
export const ULTIMA_PROVA_TEORICA_ISO = "2026-11-11"

/** A partir deste dia (inclusive) o portal entra no modo Acervo. */
export const ACERVO_DESDE_ISO = "2026-11-12"

/** `hojeISO` no formato "YYYY-MM-DD" (fuso de Recife — ver hojeRecifeISO). */
export function acervoAtivo(hojeISO: string): boolean {
  return hojeISO >= ACERVO_DESDE_ISO
}

/** Selo exibido no material antigo. */
export const SELO_ACERVO = "Material de turmas anteriores — pode estar desatualizado; confira a legislação vigente"

/** Nota à turma pelo fim das provas teóricas. */
export const NOTA_PARABENS = {
  titulo: "Missão cumprida: fim das provas teóricas",
  resumo: "11/11/2026 · DPPM e POE fecharam as avaliações teóricas do CFO",
  paragrafos: [
    "Turma, com DPPM e POE na quarta, 11/11, encerramos oficialmente as avaliações teóricas do CFO 2026.",
    "Foram meses de estudo de madrugada, plantão emendado com prova, memento impresso, questão resolvida no intervalo e muita gaivota trocada. Cada um sabe o quanto custou chegar até aqui.",
    "Parabéns pelo esforço, pela disciplina e, principalmente, pela parceria. Ninguém chegou sozinho: quem dividiu resumo, tirou a dúvida do companheiro ou segurou a onda de alguém fez desta etapa uma conquista de todos.",
    "Agora é a reta final: MAPOM, formatura e aspirantado. O material de estudo fica guardado aqui como acervo, e o portal segue acompanhando a turma até a espada abater.",
  ],
  fecho: "Estamos juntos. Rumo ao aspirantado! 🎖️",
  assinatura: "AL CFO PM 108 LISANDRY",
}
