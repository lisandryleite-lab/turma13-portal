import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { hojeRecifeISO } from "@/lib/calendario-provas"
import { EscalaCiaPainel } from "@/components/escala-cia-painel"

// O "hoje" muda a cada dia — nunca servir de cache.
export const dynamic = "force-dynamic"

export default async function EscalasCiaPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 40px" }}>
      <Link href="/inicio" style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>← Voltar</Link>
      <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.9rem", color: "var(--olive)", margin: "16px 0 4px" }}>
        Escalas da 1ª CIA
      </h1>
      <p style={{ color: "var(--ink-60)", margin: "0 0 20px", fontSize: 14 }}>
        Plantão de hoje, funções do dia e guarda-bandeira — a título informativo.
      </p>
      <EscalaCiaPainel hojeIso={hojeRecifeISO()} minhaMatricula={session.user.matricula} />
      <footer style={{ marginTop: 40, fontSize: 13, color: "var(--ink-60)", textAlign: "center" }}>Desenvolvido por AL CFO PM 108 LISANDRY</footer>
    </main>
  )
}
