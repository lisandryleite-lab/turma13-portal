// ─────────────────────────────────────────────────────────────
//  Agenda unificada do CFO — junta provas, eventos e escalas da
//  CIA numa única lista de itens, que alimenta a grade do mês e
//  a lista da página /calendario.
// ─────────────────────────────────────────────────────────────

import { CALENDARIO_PROVAS, linkMemento } from "./calendario-provas"
import { EVENTOS_CFO } from "./eventos-cfo"
import {
  ROTULO_GRUPO,
  ROTULO_FUNCAO,
  rotuloMilitar,
  type Grupo,
  type MesEscala,
  type ChaveFuncao,
} from "./escalas-cia"

export type TipoAgenda = "prova" | "evento" | "plantao" | "funcao"

export const ROTULO_TIPO: Record<TipoAgenda, string> = {
  prova: "Provas",
  evento: "Eventos",
  plantao: "Plantão",
  funcao: "Formatura",
}

/** Cores dos marcadores — derivadas da paleta do portal, distintas entre si. */
export const COR_TIPO: Record<TipoAgenda, string> = {
  prova: "#b5933f",   // dourado
  evento: "#7a2e2e",  // vinho
  plantao: "#3a4a3a", // verde militar
  funcao: "#5f6b7a",  // ardósia
}

export type ItemAgenda = {
  id: string
  tipo: TipoAgenda
  /** dia âncora (ISO). Para provas é a segunda-feira da semana. */
  data: string
  /** só para itens que ocupam uma faixa de dias (provas) */
  fim?: string
  titulo: string
  sub?: string
  /** linha extra destacada quando o item é do próprio aluno */
  destaque?: string
  href?: string
  meu: boolean
  /** texto normalizado usado pela busca */
  busca: string
}

/** minúsculas e sem acento, para a busca não depender de digitação exata. */
export function normalizar(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

export function construirAgenda(opts: {
  mes: MesEscala
  matricula: number
  meuGrupo: Grupo | null
  nomeDisciplina: Record<string, string>
}): ItemAgenda[] {
  const { mes, matricula, meuGrupo, nomeDisciplina } = opts
  const itens: ItemAgenda[] = []

  // provas — a semana inteira, porque o documento não fixa o dia
  for (const s of CALENDARIO_PROVAS) {
    if (s.semAvaliacao) {
      itens.push({
        id: `prova-sem-${s.semana}`,
        tipo: "prova",
        data: s.inicioIso,
        fim: s.fimIso,
        titulo: "Sem avaliação teórica",
        sub: s.obs,
        meu: false,
        busca: normalizar(`sem avaliacao teorica semana ${s.semana} ${s.obs ?? ""}`),
      })
      continue
    }
    for (const p of s.provas) {
      const nome = nomeDisciplina[p.sigla] || p.sigla
      itens.push({
        id: `prova-${s.semana}-${p.sigla}`,
        tipo: "prova",
        data: s.inicioIso,
        fim: s.fimIso,
        titulo: p.avaliacao ? `${p.sigla} · ${p.avaliacao}` : p.sigla,
        sub: nome,
        href: linkMemento(p.sigla),
        meu: false,
        busca: normalizar(`${p.sigla} ${p.siglaPdf ?? ""} ${p.avaliacao ?? ""} ${nome} prova semana ${s.semana}`),
      })
    }
  }

  // eventos do curso
  for (const e of EVENTOS_CFO) {
    const horas = e.horarios?.map(h => `${h.rotulo} ${h.hora}`).join(" · ")
    itens.push({
      id: `evento-${e.data}-${e.titulo}`,
      tipo: "evento",
      data: e.data,
      titulo: e.titulo,
      sub: [e.chamada, horas, e.confirmado ? null : "Previsão"].filter(Boolean).join(" · ") || undefined,
      meu: false,
      busca: normalizar(`${e.titulo} ${e.chamada ?? ""} ${e.descricao ?? ""} evento`),
    })
  }

  // plantão diário da CIA
  for (const d of mes.plantao) {
    const papeis: string[] = []
    if (d.auxiliar === matricula) papeis.push("Auxiliar do Oficial de Dia")
    if (d.adjunto === matricula) papeis.push("Adjunto ao Auxiliar")
    if (d.sobreaviso.includes(matricula)) papeis.push("Sobreaviso")
    const noGrupo = meuGrupo === d.grupo

    itens.push({
      id: `plantao-${d.data}`,
      tipo: "plantao",
      data: d.data,
      titulo: `Plantão ${ROTULO_GRUPO[d.grupo]}`,
      sub: `Auxiliar ${rotuloMilitar(d.auxiliar)} · Adjunto ${rotuloMilitar(d.adjunto)}`,
      destaque: papeis.length
        ? `Você: ${papeis.join(" e ")}`
        : noGrupo ? "Seu grupo está de plantão" : undefined,
      meu: noGrupo || papeis.length > 0,
      busca: normalizar(
        `plantao ${ROTULO_GRUPO[d.grupo]} ${rotuloMilitar(d.auxiliar)} ${rotuloMilitar(d.adjunto)} ` +
        d.sobreaviso.map(rotuloMilitar).join(" ")
      ),
    })
  }

  // funções nas formaturas
  for (const f of mes.funcoes) {
    const chaves = Object.keys(ROTULO_FUNCAO) as ChaveFuncao[]
    const meuPapel = chaves.find(k => f[k] === matricula)
    itens.push({
      id: `funcao-${f.data}`,
      tipo: "funcao",
      data: f.data,
      titulo: "Funções na formatura",
      sub: chaves.map(k => `${ROTULO_FUNCAO[k]}: ${rotuloMilitar(f[k])}`).join(" · "),
      destaque: meuPapel ? `Você: ${ROTULO_FUNCAO[meuPapel]}` : undefined,
      meu: !!meuPapel,
      busca: normalizar(
        "formatura funcoes " + chaves.map(k => `${ROTULO_FUNCAO[k]} ${rotuloMilitar(f[k])}`).join(" ")
      ),
    })
  }

  return itens.sort((a, b) => a.data.localeCompare(b.data) || a.tipo.localeCompare(b.tipo))
}

/** true se o item cobre o dia (itens de faixa cobrem o intervalo inteiro). */
export function cobreDia(item: ItemAgenda, iso: string): boolean {
  return item.fim ? iso >= item.data && iso <= item.fim : item.data === iso
}
