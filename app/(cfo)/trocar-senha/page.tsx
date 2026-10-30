"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function AlterarSenhaCfoPage() {
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    if (novaSenha !== confirmar) return setErro("As senhas não coincidem.")
    if (novaSenha.length < 6) return setErro("A nova senha deve ter no mínimo 6 caracteres.")

    setLoading(true)
    const res = await fetch("/api/auth/alterar-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senhaAtual, novaSenha }),
    })
    setLoading(false)
    if (res.ok) setSucesso(true)
    else { const d = await res.json().catch(() => ({})); setErro(d.error || "Erro ao alterar senha.") }
  }

  const input: React.CSSProperties = {
    width: "100%", border: "1px solid rgba(58,74,58,0.3)", borderRadius: 8,
    padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box",
    color: "var(--ink)", background: "#fff",
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "32px 24px" }}>
      <Link href="/inicio" style={{ color: "var(--olive)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>← Voltar</Link>
      <h1 style={{ fontFamily: "var(--serif-cfo)", fontWeight: 600, fontSize: "1.75rem", color: "var(--olive)", marginTop: 16, marginBottom: 6 }}>
        Senha e e-mail
      </h1>

      {sucesso ? (
        <div style={{ marginTop: 16, padding: "20px 18px", borderRadius: 12, background: "#eef4ea", border: "1px solid var(--olive)", textAlign: "center" }}>
          <div style={{ fontSize: 36 }}>✅</div>
          <p style={{ color: "var(--ink)", marginTop: 8 }}>Senha alterada! Use a nova senha no próximo login.</p>
          <Link href="/inicio" style={{ display: "inline-block", marginTop: 14, padding: "10px 18px", borderRadius: 8, background: "var(--olive)", color: "var(--canvas)", textDecoration: "none", fontWeight: 600 }}>Voltar ao início</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ color: "var(--ink-60)", fontSize: 13.5, margin: 0 }}>
            A senha inicial é a sua matrícula. Informe a senha atual e escolha uma nova.
          </p>
          {erro && <div style={{ background: "#fbecec", border: "1px solid var(--red)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--red)" }}>✗ {erro}</div>}
          {[
            { label: "Senha atual", value: senhaAtual, set: setSenhaAtual },
            { label: "Nova senha", value: novaSenha, set: setNovaSenha },
            { label: "Confirmar nova senha", value: confirmar, set: setConfirmar },
          ].map(({ label, value, set }) => (
            <label key={label} style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
              {label}
              <input type="password" value={value} onChange={e => set(e.target.value)} required style={{ ...input, marginTop: 4 }} />
            </label>
          ))}
          <button type="submit" disabled={loading} style={{ padding: "12px", borderRadius: 8, border: "none", background: loading ? "#9a9a8e" : "var(--olive)", color: "var(--canvas)", fontSize: 15, fontWeight: 600, cursor: loading ? "default" : "pointer" }}>
            {loading ? "Salvando…" : "Salvar nova senha"}
          </button>
        </form>
      )}

      <EmailRecuperacao input={input} />
    </main>
  )
}

// E-mail para onde vai o link de "Esqueci minha senha". Quem entrou com e-mail
// provisório (sem caixa real) vê o cadastro aberto; quem já tem, só um resumo
// que abre ao clicar.
function EmailRecuperacao({ input }: { input: React.CSSProperties }) {
  const [info, setInfo] = useState<{ email: string | null; provisorio: boolean } | null>(null)
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [msg, setMsg] = useState("")
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    fetch("/api/auth/email").then(r => r.ok ? r.json() : null).then(setInfo).catch(() => setInfo(null))
  }, [])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setMsg(""); setSalvando(true)
    const res = await fetch("/api/auth/email", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senhaAtual: senha }),
    })
    const d = await res.json().catch(() => ({}))
    setSalvando(false)
    if (!res.ok) return setMsg("✗ " + (d.error || "Erro ao salvar."))
    setInfo({ email: d.email, provisorio: false }); setEmail(""); setSenha("")
    setMsg("✓ E-mail cadastrado. Enviamos uma confirmação para ele.")
  }

  if (!info) return null
  const semEmail = !info.email

  const form = (
    <form onSubmit={salvar} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
        {semEmail ? "Seu e-mail" : "Novo e-mail"}
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="voce@gmail.com" style={{ ...input, marginTop: 4 }} />
      </label>
      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
        Sua senha atual
        <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required autoComplete="current-password" style={{ ...input, marginTop: 4 }} />
      </label>
      <button type="submit" disabled={salvando} style={{ padding: "11px", borderRadius: 8, border: "none", background: salvando ? "#9a9a8e" : "var(--olive)", color: "var(--canvas)", fontSize: 14.5, fontWeight: 600, cursor: salvando ? "default" : "pointer" }}>
        {salvando ? "Salvando…" : "Cadastrar e-mail"}
      </button>
    </form>
  )
  const aviso = msg && <p style={{ margin: "10px 0 0", fontSize: 13, color: msg.startsWith("✓") ? "var(--olive)" : "var(--red)" }}>{msg}</p>

  return (
    <section style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid rgba(58,74,58,0.12)" }}>
      {semEmail ? (
        <div style={{ padding: "16px 16px", borderRadius: 12, background: "#fbf3e3", border: "1px solid var(--gold)" }}>
          <h2 style={{ fontFamily: "var(--serif-cfo)", fontSize: "1.15rem", color: "var(--olive)", margin: 0 }}>Cadastre seu e-mail</h2>
          <p style={{ fontSize: 13.5, color: "var(--ink-60)", margin: "6px 0 0" }}>
            Sua conta ainda não tem um e-mail de verdade. Sem ele, você não consegue recuperar a senha se esquecer.
          </p>
          {form}
          {aviso}
        </div>
      ) : (
        <details>
          <summary style={{ cursor: "pointer", fontSize: 14, fontWeight: 600, color: "var(--olive)" }}>
            E-mail de recuperação <span style={{ fontWeight: 400, color: "var(--ink-60)" }}>· {info.email}</span>
          </summary>
          {form}
          {aviso}
        </details>
      )}
    </section>
  )
}
