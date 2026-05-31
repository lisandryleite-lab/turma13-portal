import Link from "next/link"

const URL_AGENDAMENTO = "https://agendamento-apmp.vercel.app/"

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
      <p style={{ color: "var(--ink-60)", marginTop: 8, lineHeight: 1.5 }}>
        O agendamento de psicologia é feito no sistema da APMP.
      </p>
      <a
        href={URL_AGENDAMENTO}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          marginTop: 16,
          padding: "11px 18px",
          borderRadius: 8,
          background: "var(--olive)",
          color: "var(--canvas)",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Abrir agendamento ↗
      </a>
    </main>
  )
}
