// Converte links "de compartilhar" (Google Drive / YouTube) em URLs embutíveis.
// Puro, sem dependências — pode ser usado no cliente.

export type TipoMidia = "video" | "audio" | "mapa"

export const TIPOS_MIDIA: TipoMidia[] = ["video", "audio", "mapa"]

export const MIDIA_INFO: Record<TipoMidia, { rotulo: string; icone: string; curto: string }> = {
  video: { rotulo: "Memento em vídeo", icone: "🎬", curto: "vídeo" },
  audio: { rotulo: "Memento em áudio", icone: "🎧", curto: "áudio" },
  mapa:  { rotulo: "Mapa mental",      icone: "🧠", curto: "mapa mental" },
}

// Pasta da turma no Drive com o material de estudo (mementos, vídeos, áudios…)
export const DRIVE_MEMENTOS_URL = "https://drive.google.com/drive/folders/1f6uAKOxgnEWQDNaAgslZLW_BG0RJG-ht"

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
