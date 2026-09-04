// Mídias hospedadas no Google Drive (ou YouTube), declaradas em código.
// Vantagem: não pesa nada no repositório e funciona sem depender do banco —
// útil enquanto a tabela MementoMidia não foi criada (db:push).
//
// Para publicar: suba o arquivo na pasta do Drive da turma, marque
// "Qualquer pessoa com o link" e cole o link aqui. O admin também pode
// cadastrar links direto pela tela da matéria (esses vão para o banco).

import type { TipoMidia } from "./midia-embed"

export type MidiaDrive = { tipo: TipoMidia; titulo: string; url: string }

export const MIDIAS_DRIVE: Record<string, MidiaDrive[]> = {
  // INTSISP: [
  //   { tipo: "video", titulo: "Entendendo o SISBIN", url: "https://drive.google.com/file/d/<ID>/view" },
  //   { tipo: "audio", titulo: "Como a inteligência policial realmente funciona", url: "https://drive.google.com/file/d/<ID>/view" },
  // ],
}
