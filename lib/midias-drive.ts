// ─────────────────────────────────────────────────────────────
//  Mídias hospedadas no Google Drive (ou YouTube), declaradas em
//  código. Não pesam nada no repositório e funcionam sem depender
//  do banco — útil enquanto a tabela MementoMidia não foi criada.
//
//  Para publicar uma nova mídia:
//   1. suba o arquivo na pasta da matéria dentro de
//      "PORTAL CFO - MEMENTOS EM VIDEO E AUDIO", no Drive;
//   2. marque o arquivo como "Qualquer pessoa com o link";
//   3. cole o link aqui, sob a sigla da disciplina.
//
//  O admin também pode cadastrar links direto na tela da matéria
//  (esses vão para o banco, não para este arquivo).
// ─────────────────────────────────────────────────────────────

import type { TipoMidia } from "./midia-embed"

export type MidiaDrive = { tipo: TipoMidia; titulo: string; url: string }

/** Pasta raiz das mídias no Drive da turma. */
export const DRIVE_PASTA_MIDIAS =
  "https://drive.google.com/drive/folders/16nuuCOWL7Jb8rA4tbn7e4mDeD002QKEO"

export const MIDIAS_DRIVE: Record<string, MidiaDrive[]> = {
  INTSISP: [
    { tipo: "video", titulo: "Entendendo o SISBIN",
      url: "https://drive.google.com/file/d/1OdDji5YThu3bLFPySnWmEc3emI-Cr89S/view" },
    { tipo: "audio", titulo: "Como a inteligência policial realmente funciona",
      url: "https://drive.google.com/file/d/1Xh5h5JoMt7_ox-rkaTjb1q3Fp0DWsjjS/view" },
  ],
  AM: [
    { tipo: "video", titulo: "Armamentos e Balística",
      url: "https://drive.google.com/file/d/1tYpLkmNPMQvfBrgaWXCPqBVL31tLDMfq/view" },
  ],
  DPPM: [
    { tipo: "video", titulo: "O Direito Penal Militar",
      url: "https://drive.google.com/file/d/1iR7jrjbzYTKW0vTQxh3Im5SaFYO1N_2c/view" },
    { tipo: "audio", titulo: "O rigor da Justiça Militar brasileira",
      url: "https://drive.google.com/file/d/1V3J_63oVI_pVJGND2WjGvn0szsl8MPfM/view" },
  ],
  PJM: [
    { tipo: "video", titulo: "Como funciona o Inquérito Militar",
      url: "https://drive.google.com/file/d/1FSfsKRjLCc5h6G2xe4Xua8VSj0f3iA0W/view" },
    { tipo: "audio", titulo: "Como funciona o Inquérito Policial Militar",
      url: "https://drive.google.com/file/d/1YlpNizQpjq8wMrXqLjSbBgnZPQJAJuR8/view" },
  ],
  EPCR: [
    { tipo: "video", titulo: "Por dentro da 7ª EMG",
      url: "https://drive.google.com/file/d/1jaEhpnUhEIYzD8hjqsJZ1JkUHGRds8ne/view" },
    { tipo: "audio", titulo: "O cérebro financeiro da Polícia Militar",
      url: "https://drive.google.com/file/d/1_vxVL0mjQ3w5vchpA_I_1Z7oNGJtZjO_/view" },
  ],
  // Pendentes de gravação: POE, PE e EASE. Assim que os arquivos entrarem na
  // pasta da matéria no Drive, basta acrescentar a entrada aqui.
}
