import Link from "next/link"

// Abas da seção "Acompanhamento de aulas" da Turma 13: carga horária (/aulas)
// e limite de faltas de 25% (/faltas) ficam juntas sob o mesmo título.
export function AcompanhamentoTabs({ ativo }: { ativo: "aulas" | "faltas" }) {
  const abas = [
    { id: "aulas", href: "/aulas", label: "Aulas ministradas" },
    { id: "faltas", href: "/faltas", label: "Faltas (limite de 25%)" },
  ] as const
  return (
    <div className="no-print" style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 0" }}>
      <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.6rem", color: "var(--olive)", margin: "0 0 12px" }}>
        Acompanhamento de aulas
      </h1>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {abas.map(a => (
          <Link key={a.id} href={a.href}
            style={{ padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 600, textDecoration: "none",
              background: ativo === a.id ? "var(--olive)" : "var(--surface)", color: ativo === a.id ? "var(--canvas)" : "var(--ink-60)" }}>
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
