// Simulador de carreira dos oficiais QOPM — previsão NÃO oficial.
// Regras: LC nº 470/2021 (promoções dos militares de PE); vagas: efetivo fixado pela
// LC nº 152/2009; quem está em cada posto hoje: folha de set/2026 (lib/remuneracao-oficiais.json).
// O motor anda mês a mês e acompanha cada oficial: saídas para a reserva abrem vagas,
// as vagas descem em cascata (art. 47, § 1º) e são preenchidas por antiguidade (na hora,
// art. 5º) ou por merecimento (só em 6 de março, art. 49), na proporção do art. 7º.

import remuneracao from "./remuneracao-oficiais.json"
import { calcularReserva, mesAbs, type DadosPessoais } from "./reserva-pmpe"

export const POSTOS = ["Aspirante", "2º Ten", "1º Ten", "Capitão", "Major", "Ten-Cel", "Coronel"] as const
export type Posto = (typeof POSTOS)[number]
// índices: 0 Asp · 1 2º Ten · 2 1º Ten · 3 Cap · 4 Maj · 5 TC · 6 Cel

// Anexo V (QOPM): tempo mínimo no posto, em meses, para concorrer ao posto seguinte
export const INTERSTICIO_MESES = [6, 60, 60, 48, 48, 36] as const
// Art. 7º: fração das vagas por merecimento ao subir PARA o posto (0 = só antiguidade)
const FRACAO_MERECIMENTO = [0, 0, 1 / 2, 1 / 2, 1 / 2, 2 / 3, 2 / 3]
// Art. 12: decenal — anos de oficial para chegar ao posto sem depender de vaga
const DECENAL_ANOS: Partial<Record<number, number>> = { 3: 10, 4: 20, 5: 30 }

type Efetivo = { posto: string; previsto: number; folha: number }
const EF = remuneracao.efetivo as Efetivo[]
const efetivo = (nome: string) => EF.find(e => e.posto === nome)!
const ORDEM_FOLHA = ["2º Tenente", "1º Tenente", "Capitão", "Major", "Tenente-Coronel", "Coronel"]
export const FIXADO = [0, ...ORDEM_FOLHA.map(n => efetivo(n).previsto)]
export const FOLHA = [0, ...ORDEM_FOLHA.map(n => efetivo(n).folha)]

// Turmas acompanhadas (datas dos boletins da SDS)
export const T1 = { nome: "T1", tamanho: 145, asp: "2025-11-29", segundoTen: "2026-06-03" }
export const T2 = { nome: "T2", tamanho: remuneracao.asp as number, asp: "2026-06-09" }

export type Perfil = "antiguidade" | "bom" | "destaque"
export type Parametros = {
  posicao: number            // sua classificação final no CFO (antiguidade na turma)
  tamanhoTurma: number
  formatura: string          // "AAAA-MM-DD" — nomeação como aspirante
  saidas: number             // multiplicador do ritmo de ida para a reserva (1 = base)
  reducaoArt26: boolean      // governador reduz o interstício à metade quando há mais claros que habilitados
  perfil: Perfil             // seu desempenho no merecimento
  atrasoCursos: number       // anos além do interstício até concluir CAO (p/ Major e TC) e CSP (p/ Coronel)
  aumentoEfetivo: number     // % a mais no efetivo fixado (nova lei)
  aspPrecisaVaga: boolean    // aspirante só vira 2º Ten se houver vaga de 2º Ten
  pessoal: DadosPessoais     // nascimento, sexo, ingresso na PMPE e serviço anterior (reserva)
  sairNaIntegral: boolean    // pede a reserva assim que tiver o tempo integral (senão, fica até os 67)
}

// Saída anual para a reserva (fração do posto). Estimativa do portal — não há série pública por posto.
export const SAIDA_BASE = [0, 0.01, 0.01, 0.02, 0.04, 0.09, 0.18]

export const CENARIOS: { id: string; nome: string; desc: string; p: Pick<Parametros, "saidas" | "reducaoArt26" | "aumentoEfetivo"> }[] = [
  { id: "conservador", nome: "Conservador", desc: "menos gente vai para a reserva e o interstício não é reduzido", p: { saidas: 0.6, reducaoArt26: false, aumentoEfetivo: 0 } },
  { id: "base", nome: "Base", desc: "ritmo médio de reserva, lei como está hoje", p: { saidas: 1, reducaoArt26: false, aumentoEfetivo: 0 } },
  { id: "otimista", nome: "Otimista", desc: "mais saídas e interstício reduzido à metade (art. 26) enquanto sobrar vaga", p: { saidas: 1.4, reducaoArt26: true, aumentoEfetivo: 0 } },
]

export const PADRAO: Parametros = {
  posicao: 1, tamanhoTurma: 100, formatura: "2026-12-15",
  saidas: 1, reducaoArt26: false, perfil: "antiguidade", atrasoCursos: 0, aumentoEfetivo: 0, aspPrecisaVaga: false,
  pessoal: { nascimento: 1995, sexo: "M", ingresso: "2026-01", averbado: 0 }, sairNaIntegral: true,
}

// Meses contados a partir de nov/2026 (mês 0)
const INICIO = { ano: 2026, mes: 11 }
const HORIZONTE = 12 * 42
const INICIO_ABS = mesAbs(INICIO.ano, INICIO.mes)
/** Mês absoluto (lib/reserva-pmpe) → índice da simulação. */
export const mesDoAbs = (t: number) => Math.ceil(t) - INICIO_ABS
export const mesDe = (iso: string) => { const [a, m, d] = iso.split("-").map(Number); return (a - INICIO.ano) * 12 + (m - INICIO.mes) + (d > 15 ? 1 : 0) }
export const dataDoMes = (i: number) => { const t = INICIO.ano * 12 + INICIO.mes - 1 + i; return { ano: Math.floor(t / 12), mes: (t % 12) + 1 } }
export const rotuloMes = (i: number) => { const { ano, mes } = dataDoMes(i); return `${["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"][mes - 1]}/${ano}` }

type Pessoa = {
  posto: number; desde: number; ordem: number   // ordem = antiguidade de entrada (menor = mais antigo)
  turma: "atual" | "T1" | "T2" | "T3"; aptoEm: number // atual: quando completa o interstício
  ingresso: number; voce?: boolean
}

export type Gargalo = "interstício" | "reduzido" | "vaga" | "curso" | "decenal" | "requerida"
export type SaidaReserva = {
  mes: number
  motivo: "integral" | "compulsoria" | "tc5"   // a pedido com tempo integral · 67 anos · Ten-Cel há 5 anos (art. 90, X)
  posto: number                               // posto em que sai (com a requerida, já o seguinte)
  quotas: number                              // anos de serviço computados, até 35 (proventos = quotas/35)
}
export type Etapa = { posto: number; mes: number | null; gargalo: Gargalo | null }
export type Resultado = {
  voce: Etapa[]                       // mês em que VOCÊ chega a cada posto (1..6)
  turma: { primeiro: number | null; ultimo: number | null }[] // por posto: primeiro e último da sua turma
  t1: (number | null)[]; t2: (number | null)[] // mês em que metade da T1/T2 chega a cada posto
  reserva: SaidaReserva | null       // quando e como você vai para a reserva antes de chegar a coronel
}

export function simular(p: Parametros): Resultado {
  const fix = FIXADO.map(v => Math.round(v * (1 + p.aumentoEfetivo / 100)))
  const pessoas: Pessoa[] = []
  let ordem = 0
  // Quem já está em cada posto (fora T1/T2): se ainda há claro e não foram promovidos, ainda não
  // completaram o interstício — supomos que completam espalhados ao longo do próximo interstício.
  for (let k = 6; k >= 1; k--) {
    const n = k === 1 ? FOLHA[1] - T1.tamanho : FOLHA[k]
    for (let i = 0; i < n; i++) {
      const apto = k === 6 ? 0 : Math.round(((i + 0.5) / n) * INTERSTICIO_MESES[k])
      pessoas.push({ posto: k, desde: apto - (k === 6 ? 0 : INTERSTICIO_MESES[k]), ordem: ordem++, turma: "atual", aptoEm: apto, ingresso: -600 })
    }
  }
  const t1Asp = mesDe(T1.asp), t1Ten = mesDe(T1.segundoTen)
  for (let i = 0; i < T1.tamanho; i++) pessoas.push({ posto: 1, desde: t1Ten, ordem: ordem++, turma: "T1", aptoEm: 0, ingresso: t1Asp })
  const t2Asp = mesDe(T2.asp)
  for (let i = 0; i < T2.tamanho; i++) pessoas.push({ posto: 0, desde: t2Asp, ordem: ordem++, turma: "T2", aptoEm: 0, ingresso: t2Asp })
  const t3Asp = mesDe(p.formatura)
  const n3 = Math.max(1, p.tamanhoTurma), pos = Math.min(Math.max(1, p.posicao), n3)
  for (let i = 1; i <= n3; i++) pessoas.push({ posto: -1, desde: t3Asp, ordem: ordem++, turma: "T3", aptoEm: 0, ingresso: t3Asp, voce: i === pos })

  const voce = pessoas.find(x => x.voce)!
  const chegada: Etapa[] = [1, 2, 3, 4, 5, 6].map(k => ({ posto: k, mes: null, gargalo: null }))
  const turma = [0, 1, 2, 3, 4, 5, 6].map(() => ({ primeiro: null as number | null, ultimo: null as number | null }))
  const contagem = { T1: Array(7).fill(0), T2: Array(7).fill(0), T3: Array(7).fill(0) }
  const meia = { t1: Array<number | null>(7).fill(null), t2: Array<number | null>(7).fill(null) }
  const saidaAcum = Array(7).fill(0)
  const abertasA = Array(7).fill(0), reservadasM = Array(7).fill(0), seq = Array(7).fill(0)
  const esperouVaga = Array(7).fill(false), esperouCurso = Array(7).fill(false)

  const cursoOk = (x: Pessoa, para: number, mes: number) =>
    x.turma === "atual" || !(para === 4 || para === 5 || para === 6) || mes - x.desde >= INTERSTICIO_MESES[x.posto] + p.atrasoCursos * 12
  const interOk = (x: Pessoa, mes: number, metade: boolean) =>
    x.turma === "atual" ? mes >= (metade ? x.aptoEm / 2 : x.aptoEm) : mes - x.desde >= (metade ? INTERSTICIO_MESES[x.posto] / 2 : INTERSTICIO_MESES[x.posto])
  const promover = (x: Pessoa, mes: number) => {
    x.posto++; x.desde = mes; x.aptoEm = 0
    if (x.turma === "T3") { const t = turma[x.posto]; if (t.primeiro == null) t.primeiro = mes; if (++contagem.T3[x.posto] === n3) t.ultimo = mes }
    if (x.turma === "T1" || x.turma === "T2") {
      const c = contagem[x.turma]; c[x.posto]++
      const m = x.turma === "T1" ? meia.t1 : meia.t2, tam = x.turma === "T1" ? T1.tamanho : T2.tamanho
      if (m[x.posto] == null && c[x.posto] >= tam / 2) m[x.posto] = mes
    }
    if (x.voce) chegada[x.posto - 1].mes = mes
  }
  const noPosto = (k: number) => pessoas.filter(x => x.posto === k)
  // Fila de antiguidade no posto: promovido antes = mais antigo; empate pela ordem de entrada
  const fila = (k: number) => noPosto(k).sort((a, b) => a.desde - b.desde || a.ordem - b.ordem)

  // Sua reserva (Estatuto, arts. 89, 89-A e 90): a pedido com o tempo integral, ou de ofício
  const res = calcularReserva(p.pessoal)
  const integral = mesDoAbs(res.integral), compulsoria = mesDoAbs(res.compulsoria)
  let reserva: SaidaReserva | null = null
  const sair = (mes: number, motivo: SaidaReserva["motivo"]) => {
    let posto = voce.posto
    // Promoção requerida (ingresso até 2021): sai no posto seguinte, sem vaga nem interstício
    if (res.requerida && motivo === "integral" && posto >= 0 && posto < 6) {
      chegada[posto].mes = mes; chegada[posto].gargalo = "requerida"; posto++
    }
    // Com o requisito integral cumprido (inclusive na transição), proventos integrais; senão, quotas
    const quotas = mes >= integral ? 35 : Math.min(35, Math.floor(res.servicoMeses(mes + INICIO_ABS) / 12))
    reserva = { mes, motivo, posto, quotas }
  }
  for (let mes = 0; mes < HORIZONTE && chegada[5].mes == null; mes++) {
    if (mes >= compulsoria) { sair(mes, "compulsoria"); break }
    if (p.sairNaIntegral && mes >= integral) { sair(mes, "integral"); break }
    if (res.regra === "nova" && voce.posto === 5 && mes - voce.desde > 60 && mes >= integral) { sair(mes, "tc5"); break }
    // Formatura da nossa turma
    if (mes === t3Asp) for (const x of pessoas) if (x.turma === "T3") { x.posto = 0; x.desde = mes }
    // Reserva: sai o mais antigo do posto; ninguém passa de 35 anos de serviço
    for (let k = 6; k >= 1; k--) {
      saidaAcum[k] += noPosto(k).length * SAIDA_BASE[k] * p.saidas / 12
      while (saidaAcum[k] >= 1) {
        saidaAcum[k]--
        const f = fila(k).filter(x => !x.voce)
        const sai = f.find(x => x.turma === "atual") ?? f[0]
        if (sai) sai.posto = 99
      }
      for (const x of noPosto(k)) if (!x.voce && mes - x.ingresso >= 35 * 12 && x.turma !== "atual") x.posto = 99
    }
    // Decenal (art. 12): independe de vaga
    for (const x of pessoas) if (x.turma !== "atual" && x.posto >= 2 && x.posto <= 4) {
      const alvo = x.posto + 1, anos = DECENAL_ANOS[alvo]
      if (anos && mes - x.ingresso >= anos * 12 && interOk(x, mes, false) && cursoOk(x, alvo, mes)) {
        if (x.posto !== 2) fix[x.posto]--
        fix[alvo]++
        // só conta como "decenal" se a decenal adiantou algo (já tinha o interstício e esperava vaga)
        if (x.voce && mes - x.desde > INTERSTICIO_MESES[x.posto] + (alvo >= 4 ? p.atrasoCursos * 12 : 0)) chegada[alvo - 1].gargalo = "decenal"
        promover(x, mes)
      }
    }
    // Vagas de cima para baixo, para a cascata acontecer no mesmo mês
    for (let alvo = 6; alvo >= 1; alvo--) {
      const de = alvo - 1
      const livres = fix[alvo] - noPosto(alvo).length - abertasA[alvo] - reservadasM[alvo]
      for (let i = 0; i < livres; i++) {
        const f = FRACAO_MERECIMENTO[alvo]
        seq[alvo]++
        // sequência contínua (art. 7º, § 4º): 1M:1A ou 2M:1A
        const merito = f === 0 ? false : f === 0.5 ? seq[alvo] % 2 === 1 : seq[alvo] % 3 !== 0
        if (merito) reservadasM[alvo]++; else abertasA[alvo]++
      }
      const candidatos = fila(de)
      const habilitadosNormais = candidatos.filter(x => interOk(x, mes, false) && cursoOk(x, alvo, mes)).length
      const metade = p.reducaoArt26 && abertasA[alvo] + reservadasM[alvo] > habilitadosNormais
      const habil = (x: Pessoa) => (de === 0 ? mes - x.desde >= INTERSTICIO_MESES[0] : interOk(x, mes, metade)) && cursoOk(x, alvo, mes)
      // aspirante: sem exigência de vaga se o usuário desligar a opção
      if (de === 0 && !p.aspPrecisaVaga) {
        for (const x of candidatos) if (habil(x)) promover(x, mes)
        continue
      }
      // Antiguidade: na hora, na ordem da fila
      for (const x of candidatos) {
        if (abertasA[alvo] <= 0) break
        if (!habil(x)) continue
        abertasA[alvo]--; promover(x, mes)
      }
      // Merecimento: só em 6 de março, entre os habilitados nos 40% mais antigos (art. 18, I)
      if (reservadasM[alvo] > 0 && dataDoMes(mes).mes === 3) {
        const restantes = fila(de)
        const limite = Math.ceil(0.4 * fix[de])
        const qam = restantes.filter((x, i) => i < limite && habil(x))
        const vc = qam.find(x => x.voce)
        let ordemM = qam
        if (vc && p.perfil !== "antiguidade") {
          const semVc = qam.filter(x => !x.voce)
          const lugar = p.perfil === "destaque" ? 0 : Math.floor(semVc.length / 2)
          ordemM = [...semVc.slice(0, lugar), vc, ...semVc.slice(lugar)]
        }
        for (const x of ordemM) { if (reservadasM[alvo] <= 0) break; reservadasM[alvo]--; promover(x, mes) }
      }
      // Diagnóstico do seu gargalo no posto atual
      if (voce.posto === de && chegada[alvo - 1].mes == null) {
        if (interOk(voce, mes, false) || (de === 0 && mes - voce.desde >= 6)) {
          if (!cursoOk(voce, alvo, mes)) esperouCurso[alvo] = true
          else esperouVaga[alvo] = true
        }
      }
    }
  }
  chegada.forEach((e, i) => {
    if (e.gargalo != null || e.mes == null) return
    const antes = i === 0 ? t3Asp : chegada[i - 1].mes!
    e.gargalo = e.mes - antes < INTERSTICIO_MESES[e.posto - 1] ? "reduzido"
      : esperouCurso[e.posto] ? "curso" : esperouVaga[e.posto] ? "vaga" : "interstício"
  })
  return { voce: chegada, turma: turma.slice(1), t1: meia.t1.slice(1), t2: meia.t2.slice(1), reserva }
}
