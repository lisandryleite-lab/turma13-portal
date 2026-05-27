"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AlterarSenhaPage() {
  const router = useRouter()
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro("")

    if (novaSenha !== confirmar) {
      setErro("As senhas não coincidem.")
      return
    }
    if (novaSenha.length < 6) {
      setErro("Nova senha deve ter mínimo 6 caracteres.")
      return
    }

    setLoading(true)
    const res = await fetch("/api/auth/alterar-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senhaAtual, novaSenha }),
    })
    setLoading(false)

    if (res.ok) {
      setSucesso(true)
    } else {
      const data = await res.json()
      setErro(data.error || "Erro ao alterar senha.")
    }
  }

  if (sucesso) {
    return (
      <div style={{ maxWidth: 480, margin: "60px auto", padding: "0 16px" }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: "40px 32px",
          border: "1.5px solid var(--cinza-borda)", boxShadow: "var(--shadow-md)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: "var(--serif)", color: "var(--azul-profundo)", marginBottom: 8 }}>
            Senha alterada!
          </h2>
          <p style={{ color: "var(--cinza-texto)", fontSize: 14, marginBottom: 24 }}>
            Na próxima vez que fizer login, use a nova senha.
          </p>
          <Link href="/dashboard" style={{
            display: "inline-block", background: "var(--azul-profundo)", color: "#fff",
            borderRadius: 8, padding: "10px 24px", textDecoration: "none",
            fontSize: 14, fontWeight: 600,
          }}>
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 480, margin: "60px auto", padding: "0 16px" }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "40px 32px",
        border: "1.5px solid var(--cinza-borda)", boxShadow: "var(--shadow-md)",
      }}>
        <h1 style={{
          fontFamily: "var(--serif)", fontWeight: 600, fontSize: 22,
          color: "var(--azul-profundo)", marginBottom: 6,
        }}>
          Alterar senha
        </h1>
        <p style={{ color: "var(--cinza-texto)", fontSize: 13, marginBottom: 28 }}>
          Digite sua senha atual e depois a nova senha desejada.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {erro && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FCA5A5",
              borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#B91C1C",
            }}>
              {erro}
            </div>
          )}

          {[
            { label: "Senha atual", value: senhaAtual, set: setSenhaAtual },
            { label: "Nova senha", value: novaSenha, set: setNovaSenha },
            { label: "Confirmar nova senha", value: confirmar, set: setConfirmar },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label style={{
                display: "block", fontSize: 12, fontWeight: 600,
                color: "var(--grafite)", marginBottom: 6,
                letterSpacing: "0.04em", textTransform: "uppercase",
              }}>
                {label}
              </label>
              <input
                type="password"
                value={value}
                onChange={(e) => set(e.target.value)}
                required
                style={{
                  width: "100%", border: "1.5px solid var(--cinza-borda)",
                  borderRadius: 8, padding: "10px 14px", fontSize: 14,
                  fontFamily: "var(--sans)", outline: "none", boxSizing: "border-box",
                  color: "var(--grafite)", background: "var(--creme)",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--azul-medio)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--cinza-borda)")}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#93a3b8" : "linear-gradient(135deg, var(--azul-profundo), var(--azul-medio))",
              color: "#fff", border: "none", borderRadius: 8, padding: "12px",
              fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
              marginTop: 4,
            }}
          >
            {loading ? "Salvando…" : "Salvar nova senha"}
          </button>

          <Link href="/dashboard" style={{
            textAlign: "center", fontSize: 13, color: "var(--cinza-texto)",
            textDecoration: "none",
          }}>
            ← Cancelar
          </Link>
        </form>
      </div>
    </div>
  )
}
