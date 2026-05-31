import Link from "next/link"

export default function AjudaSenhaPage() {
  const passo: React.CSSProperties = { padding: "12px 14px", borderRadius: 10, background: "var(--surface)", marginBottom: 10, lineHeight: 1.5 }
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>
      <Link href="/inicio" style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>← Voltar</Link>
      <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.75rem", color: "var(--olive)", marginTop: 16, marginBottom: 16 }}>
        Como recuperar a senha
      </h1>

      <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.15rem", color: "var(--ink)", marginBottom: 8 }}>Senha inicial</h2>
      <p style={{ color: "var(--ink-60)", lineHeight: 1.5, marginBottom: 18 }}>
        A senha inicial de cada aluno é o <strong>número da matrícula</strong> (o número do CFO). Ex.: matrícula 108 → senha <code>108</code>.
      </p>

      <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.15rem", color: "var(--ink)", marginBottom: 8 }}>Esqueceu a senha?</h2>
      <div style={passo}><strong>1.</strong> Na tela de login, toque em <strong>“Esqueci minha senha”</strong>.</div>
      <div style={passo}><strong>2.</strong> Informe o <strong>e-mail cadastrado</strong> (o oficial da turma).</div>
      <div style={passo}><strong>3.</strong> Você receberá um <strong>link por e-mail</strong> para criar uma nova senha. Verifique a caixa de spam.</div>
      <div style={passo}><strong>4.</strong> Crie a nova senha e faça login normalmente.</div>

      <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: "#fbf3e3", border: "1px solid var(--gold)", fontSize: 14, lineHeight: 1.5 }}>
        Se o e-mail não chegar ou estiver desatualizado, fale com a administração (AL 108) para reset manual.
      </div>

      <p style={{ marginTop: 20 }}>
        <Link href="/forgot-password" style={{ color: "var(--olive)", fontWeight: 600 }}>Ir para “Esqueci minha senha” →</Link>
      </p>
    </main>
  )
}
