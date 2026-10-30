// Busca do portal: ignora acentos e maiúsculas e aceita várias palavras em
// qualquer ordem ("pessoas gestao" acha "Gestão de Pessoas").

export const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

/** Palavras do termo, já sem acento. */
export const palavrasDe = (termo: string) => semAcento(termo).split(/\s+/).filter(Boolean)

/** true se todas as palavras do termo aparecem no texto (termo vazio casa com tudo). */
export function bate(texto: string, termo: string): boolean {
  const palavras = palavrasDe(termo)
  if (palavras.length === 0) return true
  const t = semAcento(texto)
  return palavras.every(p => t.includes(p))
}
