// Manifesto de PDFs "Pernambuco Imortal" por matéria.
// Matérias com MAIS DE UM PDF ficam separadas e rotuladas (Parte I, II…),
// para imprimir diferenciado. Matérias com 1 só PDF são detectadas
// automaticamente pelo arquivo /public/mementos/<SIGLA>.pdf.

export type PdfPart = { file: string; label: string }

export const PDF_PARTS: Record<string, PdfPart[]> = {
  DADM: [
    { file: "DADM-1.pdf", label: "Parte I" },
    { file: "DADM-2.pdf", label: "Parte II" },
    { file: "DADM-3.pdf", label: "Parte III" },
  ],
  IG: [
    { file: "IG-1.pdf", label: "Parte I" },
    { file: "IG-2.pdf", label: "Parte II" },
    { file: "IG-3.pdf", label: "Parte III" },
  ],
  DPPM: [
    { file: "DPPM-1.pdf", label: "Parte I" },
    { file: "DPPM-2.pdf", label: "Parte II" },
  ],
  EASE: [
    { file: "EASE-1.pdf", label: "Parte I" },
    { file: "EASE-2.pdf", label: "Parte II" },
  ],
  PO: [
    { file: "PO-1.pdf", label: "Parte I" },
    { file: "PO-2.pdf", label: "Parte II" },
  ],
  PJM: [
    { file: "PJM-1.pdf", label: "Parte I" },
    { file: "PJM-2.pdf", label: "Parte II" },
  ],
  POE: [
    { file: "POE-1.pdf", label: "Parte I" },
    { file: "POE-2.pdf", label: "Parte II" },
  ],
  TCEM: [
    { file: "TCEM-1.pdf", label: "Parte I" },
    { file: "TCEM-2.pdf", label: "Parte II" },
  ],
}
