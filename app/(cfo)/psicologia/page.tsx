import Link from "next/link"

export default function PsicologiaPage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
      <Link
        href="/inicio"
        style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}
      >
        ← Voltar
      </Link>
      <h1
        style={{
          fontFamily: "var(--serif-cfo)",
          fontWeight: 600,
          fontSize: "1.75rem",
          color: "var(--olive)",
          marginTop: 24,
        }}
      >
        Psicologia
      </h1>
      <p style={{ color: "var(--ink-60)", marginTop: 8 }}>Em construção.</p>
    </main>
  )
}
