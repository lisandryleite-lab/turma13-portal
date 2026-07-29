// Manifesto de PDFs "Pernambuco Imortal" por matéria.
// Matérias com MAIS DE UM PDF ficam separadas e rotuladas (Parte I, II…),
// para imprimir diferenciado. Matérias com 1 só PDF são detectadas
// automaticamente pelo arquivo /public/mementos/<SIGLA>.pdf.

export type PdfPart = { file: string; label: string }

// Mementos PRÓPRIOS (produzidos pela turma, no padrão) → aba "PDF Memento".
// Os demais PDFs são originais do "Pernambuco Imortal" → aba "PDF Pernambuco Imortal".
export const MEMENTO_PROPRIO = new Set<string>(["ACE", "LPMO", "AP", "INTSISP"])

export const PDF_PARTS: Record<string, PdfPart[]> = {
  AP: [
    { file: "AP.pdf", label: "Memento" },
  ],
  APHT: [
    { file: "APHT.pdf", label: "Pernambuco Imortal" },
    { file: "APHT-2.pdf", label: "Memento" },
  ],
  GC: [
    { file: "GC.pdf", label: "Pernambuco Imortal" },
    { file: "GC-2.pdf", label: "Memento" },
  ],
  INTSISP: [
    { file: "INTSISP.pdf", label: "Memento" },
  ],
  AM: [
    { file: "AM.pdf", label: "Pernambuco Imortal" },
  ],
  DADM: [
    { file: "DADM-1.pdf", label: "Parte I" },
    { file: "DADM-2.pdf", label: "Parte II" },
    { file: "DADM-3.pdf", label: "Parte III" },
  ],
  IG: [
    { file: "IG-1.pdf", label: "Parte I" },
    { file: "IG-2.pdf", label: "Parte II" },
    { file: "IG-3.pdf", label: "Parte III" },
    { file: "IG-4.pdf", label: "Memento" },
  ],
  LPMO: [
    { file: "LPMO.pdf", label: "Assunto 1" },
    { file: "LPMO-2.pdf", label: "Assunto 2" },
  ],
  GRAPP: [
    { file: "GRAPP.pdf", label: "Pernambuco Imortal" },
  ],
  GPGA: [
    { file: "GPGA.pdf", label: "Pernambuco Imortal" },
  ],
  HPMPE: [
    { file: "HPMPE.pdf", label: "Pernambuco Imortal" },
  ],
  ECRI: [
    { file: "ECRI.pdf", label: "Pernambuco Imortal" },
  ],
  PA: [
    { file: "PA.pdf", label: "Pernambuco Imortal" },
  ],
  FPC: [
    { file: "FPC.pdf", label: "Pernambuco Imortal" },
  ],
  SSP: [
    { file: "SSP.pdf", label: "Pernambuco Imortal" },
  ],
  TIC: [
    { file: "TIC.pdf", label: "Pernambuco Imortal" },
  ],
  TGA: [
    { file: "TGA.pdf", label: "Pernambuco Imortal" },
  ],
  SMQV: [
    { file: "SMQV.pdf", label: "Pernambuco Imortal" },
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
    { file: "PO-3.pdf", label: "Memento — AL CFO PM 108 LISANDRY" },
  ],
  PJM: [
    { file: "PJM-1.pdf", label: "Parte I" },
    { file: "PJM-2.pdf", label: "Parte II" },
  ],
  POE: [
    { file: "POE-1.pdf", label: "Parte I" },
    { file: "POE-2.pdf", label: "Parte II" },
    { file: "POE-3.pdf", label: "Memento" },
  ],
  TCEM: [
    { file: "TCEM-1.pdf", label: "Parte I" },
    { file: "TCEM-2.pdf", label: "Parte II" },
    { file: "TCEM-3.pdf", label: "Memento Resumido" },
  ],
}
