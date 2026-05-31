"use client"

import { useState } from "react"
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
        Modificar senha
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
    </main>
  )
}
