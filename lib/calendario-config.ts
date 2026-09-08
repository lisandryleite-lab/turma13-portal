// ─────────────────────────────────────────────────────────────
//  Configuração do calendário acadêmico.
//
//  Tudo o que muda de instituição para instituição (ou de ano
//  para ano) vive aqui: nome, ano letivo, data da formatura,
//  cronômetro, tipos de evento e suas cores, níveis de escopo.
//  A página não conhece nenhum desses valores — só lê daqui.
// ─────────────────────────────────────────────────────────────

export type TipoEvento =
  | "prova" | "feriado" | "evento" | "recesso" | "reuniao" | "plantao" | "formatura"

export type DefinicaoTipo = {
  chave: TipoEvento
  rotulo: string
  /** singular, para o contador ("1 prova" / "3 provas") */
  singular: string
  /** cor de destaque — uma por tipo, contraste ≥ 4.5:1 sobre o fundo off-white */
  cor: string
}

export const TIPOS_EVENTO: DefinicaoTipo[] = [
  { chave: "prova",     rotulo: "Provas",     singular: "prova",     cor: "#8A5A00" },
  { chave: "feriado",   rotulo: "Feriados",   singular: "feriado",   cor: "#9A2622" },
  { chave: "evento",    rotulo: "Eventos",    singular: "evento",    cor: "#15607F" },
  { chave: "recesso",   rotulo: "Recessos",   singular: "recesso",   cor: "#585F6B" },
  { chave: "reuniao",   rotulo: "Reuniões",   singular: "reunião",   cor: "#6A3B96" },
  { chave: "plantao",   rotulo: "Plantão",    singular: "plantão",   cor: "#2D5733" },
  { chave: "formatura", rotulo: "Formatura",  singular: "formatura", cor: "#8A3C63" },
]

export const ORDEM_TIPOS: TipoEvento[] = TIPOS_EVENTO.map(t => t.chave)

export const COR_TIPO: Record<TipoEvento, string> =
  Object.fromEntries(TIPOS_EVENTO.map(t => [t.chave, t.cor])) as Record<TipoEvento, string>

export const DEF_TIPO: Record<TipoEvento, DefinicaoTipo> =
  Object.fromEntries(TIPOS_EVENTO.map(t => [t.chave, t])) as Record<TipoEvento, DefinicaoTipo>

export const CONFIG_CALENDARIO = {
  instituicao: "Academia de Polícia Militar do Paudalho",
  siglaInstituicao: "APMP",
  /** ano letivo coberto pelas abas de mês */
  anoLetivo: { rotulo: "2026 · CFO", inicio: "2026-02-01", fim: "2027-01-31" },
  formatura: {
    ativo: true,
    rotulo: "Baile das Espadas",
    /** data e hora locais da formatura */
    dataIso: "2027-01-23",
    hora: "19:00",
  },
} as const

// ── escopo: rede → unidade → segmento → turma ────────────────
// A agregação é hierárquica. Cada nível filtra o seguinte; um
// nível em "todas" não filtra nada.

export type NivelEscopo = "unidade" | "segmento" | "turma"

export const NIVEIS_ESCOPO: { chave: NivelEscopo; rotulo: string }[] = [
  { chave: "unidade",  rotulo: "Unidade" },
  { chave: "segmento", rotulo: "Segmento" },
  { chave: "turma",    rotulo: "Turma" },
]

export const REDE = "PMPE"

/** Hierarquia declarada — usada para montar os seletores de escopo. */
export const HIERARQUIA: { unidade: string; segmentos: { nome: string; turmas: string[] }[] }[] = [
  {
    unidade: "APMP",
    segmentos: [
      { nome: "CFO 2026", turmas: ["T13", "T14", "T15", "T16", "T17", "T18", "T19"] },
    ],
  },
]

export type Escopo = { unidade: string | null; segmento: string | null; turma: string | null }

export const ESCOPO_TOTAL: Escopo = { unidade: null, segmento: null, turma: null }
