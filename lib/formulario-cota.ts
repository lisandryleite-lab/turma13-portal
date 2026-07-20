// Formulário de levantamento acoplado a uma cota financeira.
//
// Serve pra cotas onde, antes de cobrar, é preciso saber o que cada aluno quer —
// caso típico: camisa do pelotão (quantidade por modelo/tamanho/versão).
// O JSON fica em CotaFinanceira.formulario e a resposta em PagamentoCota.respostas.

// ── Definição (CotaFinanceira.formulario) ─────────────────────────────────────
export type CampoFormulario = {
  id: string
  label: string
  tipo: "texto" | "select"
  opcoes?: string[]        // obrigatório quando tipo === "select"
  ajuda?: string
  obrigatorio?: boolean
}

export type ModeloFormulario = {
  id: string
  nome: string
  descricao?: string
  cor?: string             // hex p/ o chip do modelo na UI
}

export type FormularioCota = {
  titulo?: string
  descricao?: string
  campos: CampoFormulario[]
  modelos: ModeloFormulario[]
  tamanhos: string[]
  versoes: string[]
}

// ── Resposta (PagamentoCota.respostas) ────────────────────────────────────────
export type ItemPedido = {
  modelo: string           // ModeloFormulario.id
  versao: string
  tamanho: string
  quantidade: number
}

export type RespostaFormulario = {
  campos: Record<string, string>
  itens: ItemPedido[]
}

// ── Parsing tolerante (o campo é Json livre no banco) ─────────────────────────
export function parseFormulario(valor: unknown): FormularioCota | null {
  if (!valor || typeof valor !== "object") return null
  const f = valor as Partial<FormularioCota>
  if (!Array.isArray(f.modelos) || !Array.isArray(f.tamanhos) || !Array.isArray(f.versoes)) return null
  return {
    titulo: f.titulo,
    descricao: f.descricao,
    campos: Array.isArray(f.campos) ? f.campos : [],
    modelos: f.modelos,
    tamanhos: f.tamanhos,
    versoes: f.versoes,
  }
}

export function parseResposta(valor: unknown): RespostaFormulario {
  const vazia: RespostaFormulario = { campos: {}, itens: [] }
  if (!valor || typeof valor !== "object") return vazia
  const r = valor as Partial<RespostaFormulario>
  return {
    campos: r.campos && typeof r.campos === "object" ? r.campos : {},
    itens: Array.isArray(r.itens)
      ? r.itens
          .filter(i => i && typeof i === "object")
          .map(i => ({
            modelo: String(i.modelo ?? ""),
            versao: String(i.versao ?? ""),
            tamanho: String(i.tamanho ?? ""),
            quantidade: Number(i.quantidade) || 0,
          }))
          .filter(i => i.quantidade > 0)
      : [],
  }
}

export const totalPecas = (r: RespostaFormulario) => r.itens.reduce((s, i) => s + i.quantidade, 0)

/**
 * A cota está na fase de LEVANTAMENTO (só coleta de quantidade, ninguém paga)
 * enquanto tiver formulário e ainda não tiver instrução de pagamento.
 * Assim que o responsável preencher as instruções (Pix etc.), a mesma cota
 * vira cobrança normal — os links de /pagar voltam a valer sozinhos.
 */
export const emLevantamento = (formulario: unknown, instrucoes?: string | null) =>
  !!parseFormulario(formulario) && !(instrucoes ?? "").trim()

/** Consolidado por modelo × versão × tamanho — é o "levantamento" que vai pro fornecedor. */
export function consolidar(respostas: RespostaFormulario[]) {
  const mapa = new Map<string, ItemPedido>()
  for (const r of respostas) {
    for (const i of r.itens) {
      const chave = `${i.modelo}|${i.versao}|${i.tamanho}`
      const atual = mapa.get(chave)
      if (atual) atual.quantidade += i.quantidade
      else mapa.set(chave, { ...i })
    }
  }
  return [...mapa.values()].sort(
    (a, b) => a.modelo.localeCompare(b.modelo) || a.versao.localeCompare(b.versao) || a.tamanho.localeCompare(b.tamanho),
  )
}

// ── Formulário pronto: camisa do pelotão (ficha Carcará Sertão) ───────────────
export const TIPOS_SANGUINEOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export const FORMULARIO_CAMISA: FormularioCota = {
  titulo: "Camisa do Pelotão — 1º Pelotão · Aspirantes 2027",
  descricao:
    "Manga longa, sublimação total. Levantamento de quantidade — as instruções de pagamento vêm depois. " +
    "Você pode pedir mais de uma peça: adicione uma linha por modelo/tamanho.",
  campos: [
    { id: "tipoSanguineo", label: "Tipo sanguíneo", tipo: "select", opcoes: TIPOS_SANGUINEOS, obrigatorio: true },
    { id: "nomeCamisa", label: "Nome de guerra na camisa", tipo: "texto", ajuda: "Como deve sair estampado — ex.: ALMEIDA", obrigatorio: true },
    { id: "numero", label: "Número", tipo: "texto", ajuda: "Número que vai na manga — ex.: 37", obrigatorio: true },
  ],
  modelos: [
    { id: "preto", nome: "Preto", descricao: "Base preta + camuflagem digital", cor: "#1a1a1a" },
    { id: "coyote", nome: "Coyote", descricao: "Base coyote + camuflagem areia", cor: "#A8895E" },
  ],
  tamanhos: ["P", "M", "G", "GG", "XGG"],
  versoes: ["Masculina/Unissex", "Feminina"],
}
