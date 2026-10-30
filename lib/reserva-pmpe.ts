// Reserva remunerada dos oficiais da PMPE — regras do Estatuto (Lei nº 6.783/1974),
// com a redação da LC nº 460/2021. Previsão NÃO oficial: a contagem que vale é a da
// Diretoria de Pessoal, com as certidões averbadas.
//
//  • Ingresso a partir de 01/01/2022 (art. 89): reserva a pedido com proventos integrais
//    aos 35 anos de serviço, dos quais 30 de atividade de natureza militar em PE.
//  • Ingresso até 31/12/2021 sem o tempo completo nessa data (art. 89-A, transição):
//    I  — tempo que faltava em 01/01/2022 para 30 anos de serviço (homem) ou 25 (mulher),
//         com acréscimo de 17% sobre esse tempo faltante; e
//    II — atividade militar em PE de 25 anos + 4 meses por ano faltante (Anexo Único,
//         pela data em que se completam os 30/25 anos), limitado a 30 anos.
//    Quem ingressou até 31/12/2021 pode pedir junto a Promoção Requerida (art. 89-B / LC 470, art. 13).
//  • De ofício (art. 90): 67 anos de idade para oficiais; e, para quem ingressou a partir
//    de 2022, Ten-Cel com mais de 5 anos no posto ou Coronel com mais de 3, desde que com
//    35 anos de serviço (30 de atividade militar).
//  • Serviço anterior (INSS, serviço público, Forças Armadas) soma ao tempo de serviço
//    (arts. 74-AB, 121 e 122), mas não à atividade militar em PE.

export const ESTATUTO_URL = "https://legis.alepe.pe.gov.br/texto.aspx?id=1032&tipo=TEXTOATUALIZADO"
export const IDADE_LIMITE_OFICIAL = 67

export type Sexo = "M" | "F"
export type DadosPessoais = {
  nascimento: number     // ano
  sexo: Sexo
  ingresso: string       // "AAAA-MM" — inclusão na PMPE (como praça ou no CFO)
  averbado: number       // anos de serviço anterior averbável (INSS, serviço público, Forças Armadas)
}
export type Regra = "nova" | "transicao" | "adquirido"
export type Reserva = {
  regra: Regra
  integral: number       // mês absoluto (ano*12 + mês-1) em que completa o tempo para a reserva integral
  compulsoria: number    // mês absoluto em que completa 67 anos (só o ano é informado: janeiro)
  requerida: boolean     // ingressou até 31/12/2021
  servicoMeses: (mesAbs: number) => number
  detalhe: string[]
}

export const mesAbs = (ano: number, mes: number) => ano * 12 + (mes - 1)
export const deMesAbs = (t: number) => ({ ano: Math.floor(t / 12), mes: (t % 12) + 1 })
const anosMeses = (m: number) => {
  const a = Math.floor(m / 12), r = Math.round(m - a * 12)
  return r === 12 ? `${a + 1} anos` : r ? `${a} anos e ${r} ${r === 1 ? "mês" : "meses"}` : `${a} anos`
}
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
export const rotuloAbs = (t: number) => { const { ano, mes } = deMesAbs(Math.ceil(t)); return `${MESES[mes - 1]}/${ano}` }

// Anexo Único: atividade militar exigida pela data em que se completam os 30/25 anos de serviço
export function anexoUnico(anoQueCompleta: number): number {
  return Math.min(360, 300 + 4 * Math.max(0, anoQueCompleta - 2022))
}

export function calcularReserva(d: DadosPessoais): Reserva {
  const [ai, mi] = d.ingresso.split("-").map(Number)
  const ing = mesAbs(ai, mi || 1)
  const averb = Math.max(0, d.averbado) * 12
  const servicoMeses = (t: number) => Math.max(0, t - ing) + averb
  const compulsoria = mesAbs(d.nascimento + IDADE_LIMITE_OFICIAL, 1)
  const corte = mesAbs(2022, 1)
  const detalhe: string[] = []

  if (ing >= corte) {
    const integral = Math.max(ing + 420 - averb, ing + 360)
    detalhe.push("Ingresso a partir de 2022: regra nova (art. 89) — 35 anos de serviço, com pelo menos 30 de atividade militar em PE.")
    if (averb > 0) detalhe.push(`O serviço anterior (${anosMeses(averb)}) adianta os 35 anos, mas os 30 de atividade militar em PE continuam valendo${averb > 60 ? " — por isso só os primeiros 5 anos ajudam" : ""}.`)
    return { regra: "nova", integral, compulsoria, requerida: false, servicoMeses, detalhe }
  }

  const alvo = d.sexo === "M" ? 360 : 300
  const s0 = servicoMeses(corte)
  if (s0 >= alvo) {
    detalhe.push(`Em 31/12/2021 você já tinha ${anosMeses(s0)} de serviço: direito adquirido às regras anteriores (DL 667/1969, art. 24-F).`)
    return { regra: "adquirido", integral: corte, compulsoria, requerida: true, servicoMeses, detalhe }
  }
  const faltava = alvo - s0
  const reqI = corte + faltava * 1.17
  const completa = deMesAbs(Math.ceil(corte + faltava)).ano
  const anexo = anexoUnico(completa)
  const reqII = ing + anexo
  const integral = Math.max(reqI, reqII)
  detalhe.push(`Ingresso até 2021: regra de transição (art. 89-A). Em 01/01/2022 faltavam ${anosMeses(faltava)} para ${alvo / 12} anos de serviço; com o pedágio de 17%, são ${anosMeses(faltava * 1.17)} a cumprir (até ${rotuloAbs(reqI)}).`)
  detalhe.push(`Você completaria ${alvo / 12} anos de serviço em ${completa}: o Anexo Único exige ${anosMeses(anexo)} de atividade militar em PE (até ${rotuloAbs(reqII)}).`)
  detalhe.push(`Vale a data mais tardia: ${rotuloAbs(integral)}.`)
  return { regra: "transicao", integral, compulsoria, requerida: true, servicoMeses, detalhe }
}
