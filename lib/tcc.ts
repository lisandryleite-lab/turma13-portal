// ─────────────────────────────────────────────────────────────
//  Envio do TCC — Turma 13 (1º Pelotão)
//
//  Página pública em /tcc. As duplas e o link da pasta ficam aqui (fonte
//  única); o status de cada dupla vem da tabela `TccEnvio`:
//    • membro da dupla (logado) declara "enviamos";
//    • admin confere a pasta do Drive e confirma o recebimento.
//  A página pública mostra só nome de guerra e matrícula.
// ─────────────────────────────────────────────────────────────

/** Prazo final: segunda, 02/11/2026, às 07h (horário de Recife, UTC−3). */
export const TCC_PRAZO = new Date("2026-11-02T07:00:00-03:00")

/** Link da pasta do Google Drive (ou formulário) onde as duplas enviam o arquivo. */
export const TCC_LINK_ENVIO = "https://drive.google.com/drive/folders/1UgAVCoSXHaDxKP3a_KrzCF24quJvluGK"

/** Nome padronizado da pasta que será encaminhada ao setor responsável. */
export const TCC_NOME_PASTA = "TCC_CFO2026_T13_1PEL"

/** Cada dupla envia DOIS arquivos com o mesmo nome: o PDF e o editável (Word). */
export const TCC_FORMATOS = ["pdf", "docx"] as const

export type AlunoTcc = { mat: number; nome: string }
export type DuplaTcc = { n: number; alunos: AlunoTcc[] }

/**
 * 16 trabalhos (15 duplas + 1 individual), na ordem do "Controle de Atividades
 * Externas – TCC – Turma 13": D01–D11 = Quadro 1 (com visita externa),
 * D12–D16 = Quadro 2 (sem visita). Cobre as 31 matrículas de MATRICULAS_ORDEM.
 * Nomes de guerra fixos aqui: a página pública e os nomes de arquivo não
 * dependem do banco.
 */
export const DUPLAS_TCC: DuplaTcc[] = [
  { n: 1, alunos: [{ mat: 41, nome: "ALAN SILVA" }, { mat: 98, nome: "JOSÉ MENEZES" }] },
  { n: 2, alunos: [{ mat: 7, nome: "ALDO SILVA" }, { mat: 37, nome: "PABLO TORRES" }] },
  { n: 3, alunos: [{ mat: 174, nome: "ALEXANDRE" }, { mat: 153, nome: "HUGO" }] },
  { n: 4, alunos: [{ mat: 26, nome: "ANDRÉ" }, { mat: 23, nome: "RODOLFO MOURA" }] },
  { n: 5, alunos: [{ mat: 57, nome: "CLEYTON" }, { mat: 60, nome: "JOÃO NUNES" }] },
  { n: 6, alunos: [{ mat: 81, nome: "FERNANDO ROCHA" }, { mat: 106, nome: "RAFAEL RIBEIRO" }] },
  { n: 7, alunos: [{ mat: 45, nome: "GABRIELE COSTA" }, { mat: 19, nome: "THAIS FIGUEIREDO" }] },
  { n: 8, alunos: [{ mat: 114, nome: "JOSIANE FARIAS" }, { mat: 131, nome: "JOSÉ INÁCIO" }] },
  { n: 9, alunos: [{ mat: 165, nome: "KEVIN GOMES" }, { mat: 167, nome: "GUSTAVO NETO" }] },
  { n: 10, alunos: [{ mat: 71, nome: "LEIMIG" }, { mat: 105, nome: "LUCAS EDUARDO" }] },
  { n: 11, alunos: [{ mat: 108, nome: "LISANDRY" }, { mat: 191, nome: "GOMES NASCIMENTO" }] },
  { n: 12, alunos: [{ mat: 94, nome: "ANDRÉ CARDOSO" }, { mat: 144, nome: "SAMUEL SANTOS" }] },
  { n: 13, alunos: [{ mat: 116, nome: "BERTIPALHA" }, { mat: 13, nome: "JONAS" }] },
  { n: 14, alunos: [{ mat: 65, nome: "KAUHANNI" }, { mat: 55, nome: "SHIRLAYNE" }] },
  { n: 15, alunos: [{ mat: 76, nome: "ARAÚJO JÚNIOR" }] }, // Ramiro — individual
  { n: 16, alunos: [{ mat: 143, nome: "VIDAL" }, { mat: 186, nome: "SAMUEL SILVA" }] },
]

export const codigoDupla = (n: number) => `D${String(n).padStart(2, "0")}`

/** Nome de guerra em maiúsculas, sem acentos, com "_" no lugar dos espaços. */
function nomeParaArquivo(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "_")
}

/** Ex.: TCC_T13_D11_108-191_LISANDRY-GOMES_NASCIMENTO (sem extensão) */
export function nomeArquivoTcc(dupla: DuplaTcc): string {
  const mats = dupla.alunos.map((a) => a.mat).join("-")
  const ns = dupla.alunos.map((a) => nomeParaArquivo(a.nome)).join("-")
  return `TCC_T13_${codigoDupla(dupla.n)}_${mats}_${ns}`
}
