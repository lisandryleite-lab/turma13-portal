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
  imagem?: string          // caminho em /public — mockup mostrado no formulário
}

/** Tabela de medidas de referência, exibida como guia ao escolher o tamanho. */
export type GuiaTamanhos = {
  colunas: string[]                                  // ex.: ["Tam.", "Tórax", "Compr.", "Manga"]
  grupos: { nome: string; linhas: string[][] }[]     // um grupo por versão (masc/fem)
  nota?: string
}

/** Ficha técnica do produto, como veio do fornecedor. */
export type EspecificacoesProduto = {
  nome?: string
  itens: string[]
  composicao?: string
}

/** Condições comerciais acertadas com o fornecedor. */
export type CondicoesComerciais = {
  avista?: string
  parcelado?: string
  prazo?: string
}

/**
 * Contato direto do fornecedor. Rende um botão wa.me no formulário pra quem
 * tem dúvida de medida/prazo falar com ele sem passar pelo responsável.
 */
export type ContatoFornecedor = {
  nome: string
  whatsapp: string          // só dígitos, com DDI — é o formato que o wa.me aceita
  mensagemPadrao?: string
}

export type FormularioCota = {
  titulo?: string
  descricao?: string
  campos: CampoFormulario[]
  modelos: ModeloFormulario[]
  tamanhos: string[]
  versoes: string[]
  guiaTamanhos?: GuiaTamanhos
  especificacoes?: EspecificacoesProduto
  condicoes?: CondicoesComerciais
  fornecedor?: ContatoFornecedor
}

/** Link wa.me já com a mensagem padrão — undefined quando não há contato. */
export function linkFornecedor(c?: ContatoFornecedor) {
  if (!c?.whatsapp) return undefined
  const num = c.whatsapp.replace(/\D/g, "")
  const texto = c.mensagemPadrao ? `?text=${encodeURIComponent(c.mensagemPadrao)}` : ""
  return `https://wa.me/${num}${texto}`
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
    guiaTamanhos: f.guiaTamanhos,
    especificacoes: f.especificacoes,
    condicoes: f.condicoes,
    fornecedor: f.fornecedor,
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
    { id: "preto", nome: "Preto", descricao: "Base preta + camuflagem digital", cor: "#1a1a1a", imagem: "/camisa/preto.jpg" },
    { id: "coyote", nome: "Coyote", descricao: "Base coyote + camuflagem areia", cor: "#A8895E", imagem: "/camisa/coyote.jpg" },
  ],
  tamanhos: ["PP", "P", "M", "G", "GG", "EXG"],
  versoes: ["Masculina/Unissex", "Feminina"],
  // Grade completa enviada pelo fornecedor no WhatsApp em 20/07/2026 — substitui
  // a grade antiga da ficha, que vinha com M e GG em branco. Transcrita como veio:
  // P e M repetem a largura (47) e GG e EXG repetem a manga (74). Pode ser real,
  // pode ser erro de digitação dele — confirmar antes de fechar o pedido.
  guiaTamanhos: {
    colunas: ["Tam.", "Compr.", "Largura", "Manga", "Barra"],
    grupos: [
      {
        nome: "Grade do fornecedor (cm)",
        linhas: [
          ["PP", "60", "45", "62", "33"],
          ["P", "63", "47", "65", "36"],
          ["M", "66", "47", "68", "39"],
          ["G", "69", "50", "73", "41"],
          ["GG", "73", "52", "74", "44"],
          ["EXG", "75", "55", "74", "47"],
        ],
      },
    ],
    nota:
      "Grade única do fornecedor — ele não mandou medidas separadas por versão masculina/feminina. " +
      "O tamanho G é a referência dos pontos de medição (comprimento, largura, comprimento de manga e barra). " +
      "Na dúvida entre dois tamanhos, fale direto com o fornecedor pelo botão acima antes de fechar.",
  },
  especificacoes: {
    nome: "Camisa Híbrida Hiperion Multi Function",
    itens: [
      "Compressão: segunda pele, rashguard, running e aquática — ajusta ao corpo, posiciona a musculatura e reduz o tempo de recuperação.",
      "Tecido HeatGear®, com os benefícios da compressão HPN para uso o dia todo.",
      "Respiradores nas costas para ventilação estratégica (função chaminé).",
      "Entrada de fone de ouvido com corte a laser na frente, próximo à gola.",
      "FPS 50+ — protege a pele contra os raios solares.",
      "Elasticidade em 4 direções, absorve o suor e seca rápido.",
      "Tecnologia desodorante — impede a proliferação de bactérias que causam odor.",
    ],
    composicao: "90% poliéster + 10% lastol (fibra elástica)",
  },
  condicoes: {
    avista: "R$ 120,00 à vista",
    parcelado: "R$ 130,00 em 2x — 50% de entrada e 50% na entrega",
    prazo: "Depende da quantidade fechada — ex.: 30 camisas levam de 25 a 30 dias",
  },
  fornecedor: {
    nome: "Francisco Paulo Barreto",
    whatsapp: "5527997668285",
    mensagemPadrao:
      "Olá! Sou do 1º Pelotão (Aspirantes 2027) e tenho uma dúvida sobre a camisa do pelotão:",
  },
}
