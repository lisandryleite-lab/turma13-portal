// Insígnias de posto dos oficiais da PMPE, conforme o Manual de Uniformes
// (Suplemento Normativo G 1.0.00.0 068, de 26/10/2020, itens 12 a 19):
//  • simples: escudo prateado em losango de raios, coroa azul com 5 estrelas de prata,
//    círculo vermelho com estrela dourada;
//  • composta: resplendor dourado cruciforme, coroa azul com 5 estrelas de ouro,
//    círculo vermelho com estrela dourada;
//  • aspirante: estrela singela prateada, de cinco pontas.

const estrela = (cx: number, cy: number, r: number) => {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.42 : r
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(" ")
}
const raios = (n: number, r0: number, r1: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i * 2 * Math.PI) / n
    return `M${(12 + r0 * Math.cos(a)).toFixed(2)} ${(12 + r0 * Math.sin(a)).toFixed(2)}L${(12 + r1 * Math.cos(a)).toFixed(2)} ${(12 + r1 * Math.sin(a)).toFixed(2)}`
  }).join("")

function Insignia({ composta, size }: { composta: boolean; size: number }) {
  const metal = composta ? "#c9a227" : "#a9afb8", metalEsc = composta ? "#9a7a12" : "#7d838c"
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      {composta ? (
        <>
          <rect x={4} y={4} width={16} height={16} fill={metal} />
          <rect x={4} y={4} width={16} height={16} fill={metal} transform="rotate(45 12 12)" />
          <path d={raios(32, 7, 11)} stroke={metalEsc} strokeWidth={0.5} />
        </>
      ) : (
        <>
          <rect x={4.2} y={4.2} width={15.6} height={15.6} fill={metal} transform="rotate(45 12 12)" />
          <path d={raios(24, 7, 11)} stroke={metalEsc} strokeWidth={0.5} />
        </>
      )}
      <circle cx={12} cy={12} r={7.2} fill="#1d2f6f" stroke={metal} strokeWidth={0.8} />
      {[0, 1, 2, 3, 4].map(i => {
        const a = Math.PI / 2 + (i * 2 * Math.PI) / 5
        return <polygon key={i} points={estrela(12 + 6 * Math.cos(a), 12 + 6 * Math.sin(a), 0.9)} fill={composta ? "#e9c64b" : "#e6e8eb"} />
      })}
      <circle cx={12} cy={12} r={4.7} fill="#d8392b" />
      <polygon points={estrela(12, 12.3, 4)} fill="#f1c232" stroke="#b8860b" strokeWidth={0.3} />
    </svg>
  )
}

// índices como em lib/carreira (0 Asp … 6 Cel): [compostas, simples]
const COMPOSICAO: [number, number][] = [[0, 0], [0, 1], [0, 2], [0, 3], [1, 2], [2, 1], [3, 0]]
export const NOME_DIVISA = [
  "estrela singela", "uma insígnia simples", "duas insígnias simples", "três insígnias simples",
  "uma composta e duas simples", "duas compostas e uma simples", "três insígnias compostas",
]

export function Divisas({ posto, size = 18 }: { posto: number; size?: number }) {
  if (posto === 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label="Aspirante: estrela singela">
        <polygon points={estrela(12, 12.8, 10.5)} fill="#b9bec6" stroke="#7d838c" strokeWidth={0.8} />
      </svg>
    )
  }
  const [c, s] = COMPOSICAO[posto]
  return (
    <span role="img" aria-label={NOME_DIVISA[posto]} style={{ display: "inline-flex", gap: 1 }}>
      {Array.from({ length: c }, (_, i) => <Insignia key={`c${i}`} composta size={size} />)}
      {Array.from({ length: s }, (_, i) => <Insignia key={`s${i}`} composta={false} size={size} />)}
    </span>
  )
}
