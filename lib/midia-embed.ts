// Converte links "de compartilhar" (Google Drive / YouTube) em URLs embutíveis.
// Puro, sem dependências — pode ser usado no cliente.
//
// Nov/2026: "Memento em vídeo" e "Memento em áudio" saíram do portal (não
// foram usados). Sobra só o mapa mental.

export type TipoMidia = "mapa"

export const TIPOS_MIDIA: TipoMidia[] = ["mapa"]

export const MIDIA_INFO: Record<TipoMidia, { rotulo: string; icone: string; curto: string }> = {
  mapa: { rotulo: "Mapa mental", icone: "🧠", curto: "mapa mental" },
}

export type Embed = { origem: "drive" | "youtube" | "outro"; src: string | null }

export function embedDe(url: string): Embed {
  const u = url.trim()
  // Google Drive: /file/d/<id>/..., open?id=<id>, uc?id=<id>
  const drive = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{10,})/)
  if (drive) return { origem: "drive", src: `https://drive.google.com/file/d/${drive[1]}/preview` }
  // Google Docs/Slides/Drawings (mapa mental feito no Google): /d/<id>/ → /preview
  const gdoc = u.match(/docs\.google\.com\/(document|presentation|drawings)\/d\/([\w-]{10,})/)
  if (gdoc) return { origem: "drive", src: `https://docs.google.com/${gdoc[1]}/d/${gdoc[2]}/preview` }
  // YouTube: watch?v=, youtu.be/, shorts/, embed/
  const yt = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) return { origem: "youtube", src: `https://www.youtube-nocookie.com/embed/${yt[1]}` }
  return { origem: "outro", src: null }
}

export function urlValida(url: string): boolean {
  try { const u = new URL(url); return u.protocol === "https:" } catch { return false }
}

// Arquivos locais em /public/midias/<SIGLA>/ — tipo pela extensão.
const EXT_TIPO: Record<string, TipoMidia> = {
  pdf: "mapa", png: "mapa", jpg: "mapa", jpeg: "mapa", webp: "mapa", svg: "mapa",
}
export function tipoPorExtensao(nome: string): TipoMidia | null {
  const ext = nome.toLowerCase().split(".").pop() || ""
  return EXT_TIPO[ext] ?? null
}
export function extensaoDe(url: string): string {
  return (url.split("?")[0].toLowerCase().split(".").pop() || "")
}
/** "Entendendo_o_SISBIN_comprimido.mp4" → "Entendendo o SISBIN" */
export function tituloDeArquivo(nome: string): string {
  return nome.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").replace(/\s*\(?comprimido\)?\s*$/i, "").trim()
}
/** Mídia servida pelo próprio portal (/public) — toca com <video>/<audio>/<object>, não com iframe. */
export function ehLocal(url: string): boolean {
  return url.startsWith("/")
}
