"use client"

// Rede de segurança do grupo logado: qualquer erro num server component
// (banco fora do ar, P2025 do Prisma) caía na tela genérica do Next, sem
// saída. Aqui o aluno tem um botão de tentar de novo sem perder a navegação.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "64px 16px", textAlign: "center" }}>
      <div aria-hidden style={{ fontSize: 40 }}>⚠️</div>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 700, fontSize: 22, color: "var(--azul-profundo)", margin: "12px 0 0" }}>
        Não deu para carregar esta página
      </h1>
      <p style={{ color: "#6b7a99", fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
        Pode ter sido uma instabilidade momentânea. Tente de novo — se insistir, avise o Lisandry.
      </p>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}>
        <button
          onClick={reset}
          style={{
            padding: "10px 18px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "var(--azul-profundo)", color: "#fff", fontWeight: 600, fontSize: 14,
          }}
        >
          Tentar de novo
        </button>
        <a
          href="/dashboard"
          style={{
            padding: "10px 18px", borderRadius: 8, textDecoration: "none",
            border: "1.5px solid #dde3ee", color: "var(--azul-profundo)", fontWeight: 600, fontSize: 14,
          }}
        >
          Voltar ao início
        </a>
      </div>

      {error.digest && (
        <p style={{ color: "#9aa3b8", fontSize: 11, marginTop: 20 }}>
          Código do erro: <code>{error.digest}</code>
        </p>
      )}
    </div>
  )
}
