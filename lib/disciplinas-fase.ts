// Situação de cada disciplina (concluída / em andamento / pendente) e a ordem em
// que terminou, pelo QTS da Turma 13. Usado no Ranking e nos Mementos.

export type Fase = "concluida" | "andamento" | "inicio"

export const FASES: readonly (readonly [Fase, string])[] = [
  ["concluida", "Concluídas"],
  ["andamento", "Em andamento"],
  ["inicio", "Pendentes"],
]

// Ordem do curso (seed) — desempata as disciplinas que terminaram antes de o
// QTS entrar no portal e por isso não têm última aula registrada.
const ORDEM_CURSO = [
  "SSP","TGA","GPGA","GPCL","GLOFP","FPC","PA","ACE","QAGV","DHAAPM","GC","SMQV","TFM1","TFM2",
  "GPSEI","TIC","CMSCM2","INTSISP","ECRI","OU1","OU2","IG","DPP1","DPP2","UDF","PS","APHT",
  "POE","EPCR","PE","GRAPP","TCEM","PJM","DADM","DPPM","LPMO","PO","EASE","HPMPE",
  "AP","AV","AE","PU","AM","TP","TDV","ABAA","MAP1","MAP2","MPC","TPE","TCC",
]

// QTS antigos grafavam com hífen
const ALIAS_QTS: Record<string, string> = { "TFM-II": "TFM2", "OU-II": "OU2" }

type DiscCarga = { sigla: string; status: string; cargaMinistrada: number; cargaTotal: number }
type QtsBruto = { semana: number; dados: unknown }

/** sigla → { fase, ordem }. `ordem` crescente = terminou (ou teve a última aula) antes. */
export function fasesDisciplinas(disciplinas: DiscCarga[], qtss: QtsBruto[]): Map<string, { fase: Fase; ordem: number }> {
  // Última aula de cada disciplina no QTS (semana + dia). Sem aula registrada
  // (semanas antes do QTS no portal) → ordem do curso, sempre antes das demais.
  const ultimaAula = new Map<string, number>()
  for (const q of qtss) {
    const d = q.dados as { dias?: string[]; grade?: Record<string, string[]> } | null
    if (!d?.grade) continue
    const dias = d.dias ?? Object.keys(d.grade)
    dias.forEach((dia, i) => {
      for (const bruta of d.grade?.[dia] ?? []) {
        const sigla = ALIAS_QTS[bruta] ?? bruta
        if (!sigla) continue
        const chave = q.semana * 10 + i
        if (chave > (ultimaAula.get(sigla) ?? 0)) ultimaAula.set(sigla, chave)
      }
    })
  }
  return new Map(disciplinas.map(d => {
    const fase: Fase = (d.cargaTotal > 0 ? d.cargaMinistrada >= d.cargaTotal : d.status === "Concluída") ? "concluida"
      : d.cargaMinistrada > 0 ? "andamento" : "inicio"
    return [d.sigla, { fase, ordem: ultimaAula.get(d.sigla) ?? (ORDEM_CURSO.indexOf(d.sigla) - 100) }]
  }))
}
