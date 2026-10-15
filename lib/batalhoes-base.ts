// Dados-base dos batalhões da RMR (usados enquanto a ficha "Conheça o batalhão"
// não for preenchida pelo admin no portal). Sede conforme o formulário da DAG.

// Formulário da DAG (levantamento de interesse em OMEs) — responder de novo
// com a mesma numérica substitui a escolha (vale a resposta mais recente).
export const FORMULARIO_DAG_URL = "https://docs.google.com/forms/d/e/1FAIpQLSe7i2R-Qw6ZLQ96CCR3eAVpVkpANDUi_o0kqczq63abhKSjMw/viewform"

export type BaseBatalhao = { sigla: string; slug: string; nome: string; sede: string; municipio: string; email?: string }

export const BATALHOES_BASE: BaseBatalhao[] = [
  { sigla: "1º BPM", slug: "1bpm", nome: "Batalhão Duarte Coelho", sede: "Rio Doce", municipio: "Olinda", email: "1bpm@pm.pe.gov.br" },
  { sigla: "6º BPM", slug: "6bpm", nome: "Batalhão Henrique Dias", sede: "Prazeres", municipio: "Jaboatão dos Guararapes", email: "6bpm@pm.pe.gov.br" },
  { sigla: "11º BPM", slug: "11bpm", nome: "Batalhão 17 de Agosto", sede: "Apipucos", municipio: "Recife", email: "11bpm@pm.pe.gov.br" },
  { sigla: "12º BPM", slug: "12bpm", nome: "Batalhão Arraial Novo do Bom Jesus", sede: "Várzea", municipio: "Recife", email: "12bpm@pm.pe.gov.br" },
  { sigla: "13º BPM", slug: "13bpm", nome: "Batalhão Cel. PM João Nunes", sede: "Santo Amaro", municipio: "Recife", email: "13bpm@pm.pe.gov.br" },
  { sigla: "16º BPM", slug: "16bpm", nome: "Batalhão Frei Caneca", sede: "São José", municipio: "Recife", email: "16bpm@pm.pe.gov.br" },
  { sigla: "17º BPM", slug: "17bpm", nome: "Batalhão Gen. Abreu e Lima", sede: "Aurora", municipio: "Paulista", email: "17bpm@pm.pe.gov.br" },
  { sigla: "18º BPM", slug: "18bpm", nome: "Batalhão Cel. Agenor Cavalcanti", sede: "Centro", municipio: "Cabo de Santo Agostinho", email: "18bpm@pm.pe.gov.br" },
  { sigla: "19º BPM", slug: "19bpm", nome: "Batalhão André Vidal de Negreiros", sede: "Pina", municipio: "Recife", email: "19bpm@pm.pe.gov.br" },
  { sigla: "20º BPM", slug: "20bpm", nome: "Batalhão Cel. PM Olinto de Melo Viana", sede: "Parque Capibaribe", municipio: "São Lourenço da Mata", email: "20bpm@pm.pe.gov.br" },
  { sigla: "25º BPM", slug: "25bpm", nome: "Batalhão Cel. PM Claudio Galdino da Silva", sede: "Centro", municipio: "Jaboatão dos Guararapes", email: "25bpm@pm.pe.gov.br" },
  { sigla: "26º BPM", slug: "26bpm", nome: "Batalhão 1º Sgt PM José Mariano Pimentel Neto", sede: "Centro", municipio: "Itapissuma", email: "26bpm@pm.pe.gov.br" },
  { sigla: "BPTur", slug: "bptur", nome: "Batalhão de Polícia de Turismo", sede: "Varadouro", municipio: "Olinda" },
]

// Endereço usado no link do Google Maps (o campo da ficha pode trazer observações).
const ENDERECO_MAPA: Record<string, string> = {
  "1bpm": "1º BPM, Av. Gov. Carlos de Lima Cavalcanti, 5075, Rio Doce, Olinda - PE",
  "6bpm": "6º BPM, Estrada da Batalha, Prazeres, Jaboatão dos Guararapes - PE",
  "11bpm": "11º BPM, Rua Apipucos, 15, Apipucos, Recife - PE",
  "12bpm": "12º BPM, Rua Dona Maria Lacerda, Várzea, Recife - PE",
  "13bpm": "13º BPM, Av. Agamenon Magalhães, 700, Santo Amaro, Recife - PE",
  "16bpm": "16º BPM, Cais de Santa Rita, São José, Recife - PE",
  "17bpm": "17º BPM, Av. Senador Salgado Filho, 500, Centro, Paulista - PE",
  "18bpm": "18º BPM, Rua 53, Vila da COHAB, Cabo de Santo Agostinho - PE",
  "19bpm": "19º BPM, Rua Manoel de Brito, Pina, Recife - PE",
  "20bpm": "20º BPM, Muribara, São Lourenço da Mata - PE",
  "25bpm": "25º BPM, Rua Padre Chromácio Leão, Centro, Jaboatão dos Guararapes - PE",
  "26bpm": "26º BPM, Rua Barão de Itapissuma, Itapissuma - PE",
  "bptur": "Batalhão de Polícia de Turismo, Praça do Carmo, 85, Carmo, Olinda - PE",
}
export const linkMapa = (b: BaseBatalhao) =>
  "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(ENDERECO_MAPA[b.slug] ?? `${b.sigla}, ${b.sede}, ${b.municipio} - PE`)

// Fora do levantamento (15/10/2026): desistentes (182, 17, 51), liminar revogada
// (74, 199) e o 7º pelotão inteiro (não termina no mesmo período da turma).
const MATRICULAS_FORA = new Set([182, 17, 51, 74, 199])
export const foraDoLevantamento = (mat: number, pelotao: number | null | undefined) =>
  MATRICULAS_FORA.has(mat) || pelotao === 7

export const baseDoSlug = (slug: string) => BATALHOES_BASE.find(b => b.slug === slug.toLowerCase()) ?? null
export const baseDaSigla = (sigla: string) => BATALHOES_BASE.find(b => b.sigla === sigla) ?? null

// Campos da ficha editável (OpmInfo), na ordem de exibição.
export const CAMPOS_FICHA = [
  { chave: "comandante", rotulo: "Comandante", grupo: "comando" },
  { chave: "subcomandante", rotulo: "Subcomandante", grupo: "comando" },
  { chave: "efetivo", rotulo: "Efetivo", grupo: "comando" },
  { chave: "cpm", rotulo: "Comando regional (CPM)", grupo: "comando" },
  { chave: "endereco", rotulo: "Endereço da sede", grupo: "contato" },
  { chave: "telefone", rotulo: "Telefone", grupo: "contato" },
  { chave: "email", rotulo: "E-mail", grupo: "contato" },
  { chave: "area", rotulo: "Área de atuação (municípios e bairros)", grupo: "area", longo: true },
  { chave: "sobreArea", rotulo: "O que saber sobre a área", grupo: "area", longo: true },
  { chave: "morarPerto", rotulo: "Onde morar perto (bairros, aluguel)", grupo: "morar", longo: true },
  { chave: "distanciaBR", rotulo: "Deslocamento (BR, APMP, Recife)", grupo: "morar", longo: true },
  { chave: "linkGrupo", rotulo: "Grupo de WhatsApp dos interessados", grupo: "grupo" },
] as const

export type ChaveFicha = (typeof CAMPOS_FICHA)[number]["chave"]
