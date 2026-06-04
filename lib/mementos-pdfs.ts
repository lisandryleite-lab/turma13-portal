// Manifesto de PDFs "Pernambuco Imortal" por matéria.
// Matérias com MAIS DE UM PDF ficam separadas e rotuladas (Parte I, II…),
// para imprimir diferenciado. Matérias com 1 só PDF são detectadas
// automaticamente pelo arquivo /public/mementos/<SIGLA>.pdf.

export type PdfPart = { file: string; label: string }

export const PDF_PARTS: Record<string, PdfPart[]> = {
  DADM: [
    { file: "DADM-1.pdf", label: "Parte I" },
    { file: "DADM-2.pdf", label: "CD e CJ" },
    { file: "DADM-3.pdf", label: "SAD" },
  ],
  IG: [
    { file: "IG-1.pdf", label: "IG" },
    { file: "IG-2.pdf", label: "2ª Prova" },
    { file: "IG-3.pdf", label: "Guarda Bandeira" },
  ],
  DPPM: [
    { file: "DPPM-1.pdf", label: "Parte I — Resumo" },
    { file: "DPPM-2.pdf", label: "Parte II — 2ª Avaliação" },
  ],
  EASE: [
    { file: "EASE-1.pdf", label: "Parte I — Resumo" },
    { file: "EASE-2.pdf", label: "Parte II — Economia" },
  ],
  PO: [
    { file: "PO-1.pdf", label: "Parte I" },
    { file: "PO-2.pdf", label: "Parte II" },
  ],
  PJM: [
    { file: "PJM-1.pdf", label: "1ª Avaliação" },
    { file: "PJM-2.pdf", label: "2ª Avaliação" },
  ],
  POE: [
    { file: "POE-1.pdf", label: "Parte I" },
    { file: "POE-2.pdf", label: "Parte II" },
  ],
  TCEM: [
    { file: "TCEM-1.pdf", label: "Atualizado (29/10/2025)" },
    { file: "TCEM-2.pdf", label: "Parte II" },
  ],
}
