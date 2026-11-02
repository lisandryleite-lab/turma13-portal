import "server-only"

// Lê o conteúdo das subpastas do TCC direto do Google Drive, sem chave de API:
// pastas compartilhadas como "qualquer pessoa com o link" têm uma visão
// embutida pública (embeddedfolderview) que lista os arquivos em HTML.
// É uma página não documentada do Google — serve a esta página temporária;
// se falhar, a dupla aparece como "sem leitura" em vez de quebrar a página.

export type ArquivoDrive = { nome: string; tipo: "pdf" | "editavel" | "outro" }

const EDITAVEL = /\.(docx?|odt|rtf)$/i
const MIME_EDITAVEL = /msword|wordprocessingml|opendocument\.text|rtf|google-apps\.document/

function decodificar(s: string) {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"").replace(/&#39;/g, "'")
}

/** Arquivos da pasta, ou `null` se o Drive não respondeu. Cache de 60 s. */
export async function lerPastaDrive(id: string): Promise<ArquivoDrive[] | null> {
  try {
    const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${id}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const html = await res.text()
    // Cada item: <div class="flip-entry" id="entry-…"> … <a href="…"> … flip-entry-title">NOME<
    return html.split('class="flip-entry"').slice(1).map((bloco) => {
      const nome = decodificar(bloco.match(/flip-entry-title">([^<]*)</)?.[1] ?? "").trim()
      const href = bloco.match(/href="([^"]*)"/)?.[1] ?? ""
      // O ícone traz o tipo real (…/type/application/pdf) — vale mesmo quando
      // o arquivo foi enviado sem extensão no nome.
      const mime = bloco.match(/\/type\/([^"]+)"/)?.[1] ?? ""
      const tipo: ArquivoDrive["tipo"] =
        /\.pdf$/i.test(nome) || mime === "application/pdf" ? "pdf"
        : EDITAVEL.test(nome) || MIME_EDITAVEL.test(mime) || href.includes("docs.google.com/document") ? "editavel"
        : "outro"
      return { nome, tipo }
    }).filter((a) => a.nome)
  } catch {
    return null
  }
}
