// Manifesto de apostilas (PDFs originais do curso) por matéria.
// Matérias com MAIS DE UMA apostila ficam separadas e rotuladas; matérias
// com 1 só arquivo são detectadas automaticamente por /public/apostilas/<SIGLA>.pdf.

export type ApostilaPart = { file: string; label: string }

export const APOSTILA_PARTS: Record<string, ApostilaPart[]> = {
  DPPM: [
    { file: "DPPM-1.pdf", label: "Direito Penal Militar" },
    { file: "DPPM-2.pdf", label: "Direito Processual Penal Militar" },
  ],
}
