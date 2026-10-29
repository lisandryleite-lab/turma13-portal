import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { RemuneracaoClient } from "./remuneracao-client"

export default async function RemuneracaoPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 40px" }}>
      <Link href="/batalhoes" style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>← Escolha de Batalhões</Link>
      <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.9rem", color: "var(--olive)", margin: "16px 0 4px" }}>Remuneração e carreira</h1>
      <p style={{ color: "var(--ink-60)", margin: "0 0 18px", fontSize: 14, lineHeight: 1.5 }}>
        Quanto ganham os aspirantes e tenentes das turmas anteriores, por função — e o que esperar para a nossa turma.
      </p>
      <RemuneracaoClient />
      <Link href="/batalhoes/carreira" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 16, padding: "12px 16px", borderRadius: 16, textDecoration: "none", color: "var(--ink)", background: "#fbf7ec", border: "1px solid rgba(181,147,63,0.3)" }}>
        <span style={{ fontSize: 13.5 }}><strong>Simulador de carreira:</strong> veja quando você chega a cada posto e como funcionam as promoções (antiguidade, merecimento, decenal, bravura…).</span>
        <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 18 }}>›</span>
      </Link>
      <footer style={{ marginTop: 40, fontSize: 13, color: "var(--ink-60)", textAlign: "center" }}>Desenvolvido por AL CFO PM 108 LISANDRY</footer>
    </main>
  )
}
