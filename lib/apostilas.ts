// Manifesto de apostilas (PDFs originais do curso) por matéria.
// Matérias com MAIS DE UMA apostila ficam separadas e rotuladas; matérias
// com 1 só arquivo são detectadas automaticamente por /public/apostilas/<SIGLA>.pdf.

export type ApostilaPart = { file: string; label: string }

export const APOSTILA_PARTS: Record<string, ApostilaPart[]> = {
  AM: [
    { file: "AM-1.pdf", label: "Armamento e Munição" },
    { file: "AM-2.pdf", label: "Regras de Segurança" },
    { file: "AM-3.pdf", label: "Fundamentos do Tiro Policial" },
    { file: "AM-4.pdf", label: "Procedimentos do Tiro Policial" },
    { file: "AM-5.pdf", label: "Munição e Balística" },
    // Um armamento por apostila — decks do Maj PM Fragoso (ACIDES).
    { file: "AM-6.pdf", label: "Revólver e Pistola" },
    { file: "AM-7.pdf", label: "MT 40 FAMAE e SMT 40" },
    { file: "AM-8.pdf", label: "Fuzil FAL, PARA-FAL e SAR" },
    { file: "AM-9.pdf", label: "Espingarda Cal .12" },
  ],
  DPPM: [
    { file: "DPPM-1.pdf", label: "Direito Penal Militar" },
    { file: "DPPM-2.pdf", label: "Direito Processual Penal Militar" },
  ],
}
