// Skeleton do grupo logado. Sem isto, como toda página é `force-dynamic`, o
// clique na sidebar congelava a tela anterior por ~1s sem nenhum sinal de vida.
// Com o loading.tsx o Next troca a tela na hora e faz stream do conteúdo.
export default function Loading() {
  const bloco = (altura: number, largura: string) => (
    <div className="t13-skel" style={{ height: altura, width: largura, borderRadius: 8 }} />
  )

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }} aria-busy="true" aria-label="Carregando">
      <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 10 }}>
        {bloco(26, "45%")}
        {bloco(14, "28%")}
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
        <div style={{ gridColumn: "1/-1" }}>{bloco(96, "100%")}</div>
        {bloco(150, "100%")}
        {bloco(150, "100%")}
        <div style={{ gridColumn: "1/-1" }}>{bloco(120, "100%")}</div>
      </div>
    </div>
  )
}
