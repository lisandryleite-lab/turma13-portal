// ─────────────────────────────────────────────────────────────
//  Modelo único de evento do calendário.
//
//  Todo o conteúdo da página /calendario sai desta lista — nunca
//  de markup. Cada fonte (provas, eventos do curso, plantão da
//  CIA, feriados, recessos, reuniões) é convertida para o mesmo
//  formato, o que permite filtrar e agregar em qualquer nível.
// ─────────────────────────────────────────────────────────────

import { CALENDARIO_PROVAS, linkMemento } from "./calendario-provas"
import { EVENTOS_CFO } from "./eventos-cfo"
import {
  ROTULO_GRUPO, ROTULO_FUNCAO, rotuloMilitar,
  type Grupo, type MesEscala, type ChaveFuncao,
} from "./escalas-cia"
import { REDE, type Escopo, type TipoEvento } from "./calendario-config"

export type EventoCalendario = {
  id: string
  /** ISO — primeiro dia (inclusive) */
  inicio: string
  /** ISO — último dia (inclusive). Igual a `inicio` em eventos de um dia. */
  fim: string
  titulo: string
  tipo: TipoEvento
  rede: string
  unidade: string | null
  segmento: string | null
  turma: string | null
  /** "manhã" | "tarde" | "noite" | "integral" */
  turno: string | null
  obs: string | null
  href?: string
  /** o evento envolve o próprio aluno (plantão, função na formatura) */
  meu: boolean
  /** texto normalizado para busca */
  busca: string
}

/** minúsculas e sem acento — a busca não depende de digitação exata. */
export function normalizar(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

// ── fontes declarativas ──────────────────────────────────────

/** Feriados nacionais com nome, no recorte do ano letivo. */
const FERIADOS: { data: string; nome: string }[] = [
  { data: "2026-02-16", nome: "Carnaval" },
  { data: "2026-02-17", nome: "Carnaval" },
  { data: "2026-03-06", nome: "Dia da Polícia Militar de Pernambuco" },
  { data: "2026-04-03", nome: "Sexta-feira Santa" },
  { data: "2026-04-21", nome: "Tiradentes" },
  { data: "2026-05-01", nome: "Dia do Trabalho" },
  { data: "2026-06-04", nome: "Corpus Christi" },
  { data: "2026-06-24", nome: "São João" },
  { data: "2026-07-16", nome: "Nossa Senhora do Carmo (Recife)" },
  { data: "2026-09-07", nome: "Independência do Brasil" },
  { data: "2026-10-12", nome: "Nossa Senhora Aparecida" },
  { data: "2026-11-02", nome: "Finados" },
  { data: "2026-11-15", nome: "Proclamação da República" },
  { data: "2026-11-20", nome: "Consciência Negra" },
  { data: "2026-12-25", nome: "Natal" },
  { data: "2027-01-01", nome: "Confraternização Universal" },
]

/** Recessos e períodos sem instrução — faixas de dias. */
const RECESSOS: { inicio: string; fim: string; nome: string; obs?: string }[] = [
  { inicio: "2026-12-21", fim: "2027-01-04", nome: "Recesso de fim de ano", obs: "Sem instrução; escala de plantão mantida." },
]

/** Reuniões de coordenação e conselho. */
const REUNIOES: { data: string; nome: string; turno?: string; obs?: string }[] = []

// ── conversão das fontes ─────────────────────────────────────

const UNIDADE = "APMP"
const SEGMENTO = "CFO 2026"

type Base = Pick<EventoCalendario, "rede" | "unidade" | "segmento" | "turma" | "turno" | "obs" | "meu">
const base = (over: Partial<Base> = {}): Base => ({
  rede: REDE, unidade: UNIDADE, segmento: SEGMENTO, turma: null,
  turno: null, obs: null, meu: false, ...over,
})

export function construirEventos(opts: {
  mes: MesEscala
  matricula: number
  meuGrupo: Grupo | null
  nomeDisciplina: Record<string, string>
  minhaTurma?: string | null
}): EventoCalendario[] {
  const { mes, matricula, meuGrupo, nomeDisciplina, minhaTurma = null } = opts
  const ev: EventoCalendario[] = []

  // provas — ocupam a semana inteira, porque o planejamento não fixa o dia
  for (const s of CALENDARIO_PROVAS) {
    if (s.semAvaliacao) continue
    for (const p of s.provas) {
      const nome = nomeDisciplina[p.sigla] || p.sigla
      ev.push({
        id: `prova-${s.semana}-${p.sigla}`,
        inicio: s.inicioIso, fim: s.fimIso,
        titulo: p.avaliacao ? `${p.sigla} — ${p.avaliacao.replace(/^(\d+)\s*AE$/i, "$1ª AE")}` : p.sigla,
        tipo: "prova",
        href: linkMemento(p.sigla),
        ...base({ obs: nome }),
        busca: normalizar(`${p.sigla} ${p.siglaPdf ?? ""} ${p.avaliacao ?? ""} ${nome} prova semana ${s.semana}`),
      })
    }
  }

  // eventos e solenidades do curso
  for (const e of EVENTOS_CFO) {
    const horas = e.horarios?.map(h => `${h.rotulo} ${h.hora}`).join(" · ")
    const marcas = [e.chamada, horas, e.confirmado ? null : "Previsão"].filter(Boolean).join(" · ")
    ev.push({
      id: `evento-${e.data}-${normalizar(e.titulo).replace(/\W+/g, "-")}`,
      inicio: e.data, fim: e.data,
      titulo: e.titulo,
      tipo: "evento",
      ...base({ obs: marcas || e.descricao || null }),
      busca: normalizar(`${e.titulo} ${e.chamada ?? ""} ${e.descricao ?? ""} evento`),
    })
  }

  // feriados
  for (const f of FERIADOS) {
    ev.push({
      id: `feriado-${f.data}`,
      inicio: f.data, fim: f.data,
      titulo: f.nome,
      tipo: "feriado",
      ...base({ segmento: null, obs: "Feriado" }),
      busca: normalizar(`${f.nome} feriado`),
    })
  }

  // recessos
  for (const r of RECESSOS) {
    ev.push({
      id: `recesso-${r.inicio}`,
      inicio: r.inicio, fim: r.fim,
      titulo: r.nome,
      tipo: "recesso",
      ...base({ obs: r.obs ?? null }),
      busca: normalizar(`${r.nome} recesso ${r.obs ?? ""}`),
    })
  }

  // reuniões
  for (const r of REUNIOES) {
    ev.push({
      id: `reuniao-${r.data}-${normalizar(r.nome).replace(/\W+/g, "-")}`,
      inicio: r.data, fim: r.data,
      titulo: r.nome,
      tipo: "reuniao",
      ...base({ turno: r.turno ?? null, obs: r.obs ?? null }),
      busca: normalizar(`${r.nome} reuniao ${r.obs ?? ""}`),
    })
  }

  // plantão diário da CIA
  for (const d of mes.plantao) {
    const papeis: string[] = []
    if (d.auxiliar === matricula) papeis.push("Auxiliar do Oficial de Dia")
    if (d.adjunto === matricula) papeis.push("Adjunto ao Auxiliar")
    if (d.sobreaviso.includes(matricula)) papeis.push("Sobreaviso")
    const noGrupo = meuGrupo === d.grupo
    ev.push({
      id: `plantao-${d.data}`,
      inicio: d.data, fim: d.data,
      titulo: `Plantão ${ROTULO_GRUPO[d.grupo]}`,
      tipo: "plantao",
      ...base({
        turma: minhaTurma, turno: "integral",
        obs: papeis.length ? `Você: ${papeis.join(" e ")}`
          : noGrupo ? "Seu grupo está de plantão"
          : `Auxiliar ${rotuloMilitar(d.auxiliar)} · Adjunto ${rotuloMilitar(d.adjunto)}`,
        meu: noGrupo || papeis.length > 0,
      }),
      busca: normalizar(
        `plantao ${ROTULO_GRUPO[d.grupo]} ${rotuloMilitar(d.auxiliar)} ${rotuloMilitar(d.adjunto)} ` +
        d.sobreaviso.map(rotuloMilitar).join(" ")),
    })
  }

  // funções nas formaturas
  for (const f of mes.funcoes) {
    const chaves = Object.keys(ROTULO_FUNCAO) as ChaveFuncao[]
    const meuPapel = chaves.find(k => f[k] === matricula)
    ev.push({
      id: `formatura-${f.data}`,
      inicio: f.data, fim: f.data,
      titulo: "Funções na formatura",
      tipo: "formatura",
      ...base({
        turma: minhaTurma,
        obs: meuPapel ? `Você: ${ROTULO_FUNCAO[meuPapel]}`
          : chaves.map(k => `${ROTULO_FUNCAO[k]}: ${rotuloMilitar(f[k])}`).join(" · "),
        meu: !!meuPapel,
      }),
      busca: normalizar("formatura funcoes " + chaves.map(k => `${ROTULO_FUNCAO[k]} ${rotuloMilitar(f[k])}`).join(" ")),
    })
  }

  return ev.sort((a, b) => a.inicio.localeCompare(b.inicio) || a.titulo.localeCompare(b.titulo))
}

// ── consulta e agregação ─────────────────────────────────────

/** true se o evento cobre o dia (faixas cobrem o intervalo inteiro). */
export function cobreDia(e: EventoCalendario, iso: string): boolean {
  return iso >= e.inicio && iso <= e.fim
}

/** true se o evento intersecta a faixa [de, ate]. */
export function naFaixa(e: EventoCalendario, de: string, ate: string): boolean {
  return e.inicio <= ate && e.fim >= de
}

/** Um evento sem valor no nível (null) é "de toda a rede" e passa em qualquer escopo. */
export function noEscopo(e: EventoCalendario, esc: Escopo): boolean {
  if (esc.unidade && e.unidade && e.unidade !== esc.unidade) return false
  if (esc.segmento && e.segmento && e.segmento !== esc.segmento) return false
  if (esc.turma && e.turma && e.turma !== esc.turma) return false
  return true
}

export function filtrar(eventos: EventoCalendario[], opts: {
  escopo?: Escopo
  tipos?: Set<TipoEvento>
  de?: string
  ate?: string
  termo?: string
  soMeu?: boolean
}): EventoCalendario[] {
  const { escopo, tipos, de, ate, termo, soMeu } = opts
  return eventos.filter(e =>
    (!escopo || noEscopo(e, escopo)) &&
    (!tipos || tipos.has(e.tipo)) &&
    (!de || !ate || naFaixa(e, de, ate)) &&
    (!soMeu || e.meu) &&
    (!termo || e.busca.includes(termo))
  )
}

/** Contagem por tipo dentro da seleção atual — alimenta os contadores dos filtros. */
export function contarPorTipo(eventos: EventoCalendario[]): Record<string, number> {
  const c: Record<string, number> = {}
  for (const e of eventos) c[e.tipo] = (c[e.tipo] ?? 0) + 1
  return c
}

/** Os `n` próximos eventos a partir de hoje (inclui os em andamento). */
export function proximos(eventos: EventoCalendario[], hojeIso: string, n: number): EventoCalendario[] {
  return eventos
    .filter(e => e.fim >= hojeIso)
    .sort((a, b) => a.inicio.localeCompare(b.inicio) || a.titulo.localeCompare(b.titulo))
    .slice(0, n)
}
