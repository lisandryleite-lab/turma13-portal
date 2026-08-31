// Skeleton do grupo CFO (mementos, questões, ranking, painel).
export default function Loading() {
  const bloco = (altura: number, largura: string) => (
    <div className="t13-skel" style={{ height: altura, width: largura, borderRadius: 8 }} />
  )

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 16px" }} aria-busy="true" aria-label="Carregando">
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {bloco(28, "40%")}
        {bloco(14, "60%")}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {bloco(72, "100%")}
        {bloco(72, "100%")}
        {bloco(72, "100%")}
        {bloco(72, "70%")}
      </div>
    </div>
  )
}
