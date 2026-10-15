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
      <footer style={{ marginTop: 40, fontSize: 13, color: "var(--ink-60)", textAlign: "center" }}>Desenvolvido por AL CFO PM 108 LISANDRY</footer>
    </main>
  )
}
