// Manifesto de PDFs "Pernambuco Imortal" por matéria.
// Matérias com MAIS DE UM PDF ficam separadas e rotuladas (Parte I, II…),
// para imprimir diferenciado. Matérias com 1 só PDF são detectadas
// automaticamente pelo arquivo /public/mementos/<SIGLA>.pdf.

export type PdfPart = { file: string; label: string }

// Mementos PRÓPRIOS (produzidos pela turma, no padrão) → aba "PDF Memento".
// Os demais PDFs são originais do "Pernambuco Imortal" → aba "PDF Pernambuco Imortal".
export const MEMENTO_PROPRIO = new Set<string>(["ACE", "LPMO"])

export const PDF_PARTS: Record<string, PdfPart[]> = {
  DADM: [
    { file: "DADM-1.pdf", label: "Parte I" },
    { file: "DADM-2.pdf", label: "Parte II" },
    { file: "DADM-3.pdf", label: "Parte III" },
    { file: "DADM-4.pdf", label: "★ Memento Resumido (AL CFO 108)" },
  ],
  IG: [
    { file: "IG-1.pdf", label: "Parte I" },
    { file: "IG-2.pdf", label: "Parte II" },
    { file: "IG-3.pdf", label: "Parte III" },
    { file: "IG-4.pdf", label: "★ Memento Resumido (AL CFO 108)" },
  ],
  GRAPP: [
    { file: "GRAPP.pdf", label: "Pernambuco Imortal" },
    { file: "GRAPP-2.pdf", label: "★ Memento Resumido (AL CFO 108)" },
  ],
  GPGA: [
    { file: "GPGA.pdf", label: "Pernambuco Imortal" },
    { file: "GPGA-2.pdf", label: "★ Memento Resumido (AL CFO 108)" },
  ],
  HPMPE: [
    { file: "HPMPE.pdf", label: "Pernambuco Imortal" },
    { file: "HPMPE-2.pdf", label: "★ Memento Resumido (AL CFO 108)" },
  ],
  ECRI: [
    { file: "ECRI.pdf", label: "Pernambuco Imortal" },
    { file: "ECRI-2.pdf", label: "★ Memento Resumido (AL CFO 108)" },
  ],
  PA: [
    { file: "PA.pdf", label: "Pernambuco Imortal" },
    { file: "PA-2.pdf", label: "★ Memento Resumido (AL CFO 108)" },
  ],
  FPC: [
    { file: "FPC.pdf", label: "Pernambuco Imortal" },
    { file: "FPC-2.pdf", label: "★ Memento Resumido (AL CFO 108)" },
  ],
  SSP: [
    { file: "SSP.pdf", label: "Pernambuco Imortal" },
    { file: "SSP-2.pdf", label: "★ Memento Resumido (AL CFO 108)" },
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
    { file: "PO-3.pdf", label: "★ Memento Resumido (AL CFO 108)" },
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
