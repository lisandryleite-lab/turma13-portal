// Manifesto de apostilas (PDFs originais do curso) por matéria.
// Matérias com MAIS DE UMA apostila ficam separadas e rotuladas; matérias
// com 1 só arquivo são detectadas automaticamente por /public/apostilas/<SIGLA>.pdf.

export type ApostilaPart = { file: string; label: string }

export const APOSTILA_PARTS: Record<string, ApostilaPart[]> = {
  AM: [
    { file: "AM-1.pdf", label: "Armamento e Munição" },
    { file: "AM-2.pdf", label: "Regras de Segurança" },
    { file: "AM-3.pdf", label: "Fundamentos do Tiro Policial" },
  ],
  DPPM: [
    { file: "DPPM-1.pdf", label: "Direito Penal Militar" },
    { file: "DPPM-2.pdf", label: "Direito Processual Penal Militar" },
  ],
}
