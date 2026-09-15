import Link from "next/link"

/**
 * Porta fechada do portal da Turma 13 — mostrada a quem está logado mas não é
 * do 1º Pelotão. Fica em um componente só porque as duas áreas T13
 * (app/(logado) e app/turma13cfo2026) precisam da mesma tela.
 */
export function AreaRestrita() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--canvas)", color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <div aria-hidden style={{ fontSize: 40 }}>🔒</div>
        <h1 style={{ fontFamily: "var(--serif-cfo)", color: "var(--olive)", fontSize: "1.5rem", marginTop: 12 }}>
          Área restrita
        </h1>
        <p style={{ color: "var(--ink-60)", marginTop: 8 }}>
          O portal da <strong>Turma 13</strong> é exclusivo dos alunos do 1º Pelotão.
        </p>
        <Link href="/inicio" style={{ display: "inline-block", marginTop: 20, padding: "10px 18px", borderRadius: 8, background: "var(--olive)", color: "var(--canvas)", textDecoration: "none", fontWeight: 600 }}>
          ← Voltar ao início
        </Link>
      </div>
    </div>
  )
}
