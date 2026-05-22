"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [matricula, setMatricula] = useState("")
  const [password, setPassword]   = useState("")
  const [error, setError]         = useState("")
  const [loading, setLoading]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await signIn("credentials", { matricula, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      setError("Matrícula ou senha incorretos.")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, var(--azul-profundo) 0%, #0F3D78 45%, var(--creme) 45%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
    }}>

      {/* Cabeçalho institucional */}
      <div style={{ textAlign: "center", marginBottom: 32, position: "relative", zIndex: 1 }}>
        <div style={{
          fontFamily: "var(--serif)",
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "var(--dourado-claro)",
          marginBottom: 10,
        }}>
          PMPE · APMP · Paudalho
        </div>
        <h1 style={{
          fontFamily: "var(--serif)",
          fontWeight: 500,
          fontSize: "clamp(22px, 5vw, 30px)",
          color: "#fff",
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
          margin: "0 0 6px",
        }}>
          Portal <em style={{ fontStyle: "italic", color: "var(--dourado-claro)" }}>Turma 13</em>
        </h1>
        <p style={{
          fontFamily: "var(--sans)",
          fontSize: 13,
          color: "rgba(255,255,255,0.65)",
          letterSpacing: "0.08em",
        }}>
          CFO 2026 · 1º Pelotão · 2ª CIA
        </p>

        {/* linha decorativa dourada */}
        <div style={{
          width: 48,
          height: 1,
          background: "linear-gradient(90deg, transparent, var(--dourado-claro), transparent)",
          margin: "14px auto 0",
          opacity: 0.6,
        }} />
      </div>

      {/* Card de login */}
      <div style={{
        background: "#fff",
        borderRadius: 16,
        padding: "36px 32px",
        width: "100%",
        maxWidth: 360,
        boxShadow: "var(--shadow-lg)",
        position: "relative",
        zIndex: 1,
      }}>
        <h2 style={{
          fontFamily: "var(--serif)",
          fontWeight: 600,
          fontSize: 18,
          color: "var(--azul-profundo)",
          marginBottom: 4,
        }}>
          Acesse sua conta
        </h2>
        <p style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--cinza-texto)", marginBottom: 24 }}>
          Use sua matrícula e senha pessoal
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              color: "#B91C1C",
              textAlign: "center",
            }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--grafite)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Matrícula
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value.replace(/\D/g, ""))}
              placeholder="Ex: 108"
              required
              autoFocus
              style={{
                width: "100%",
                border: "1.5px solid var(--cinza-borda)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 14,
                fontFamily: "var(--sans)",
                outline: "none",
                boxSizing: "border-box",
                color: "var(--grafite)",
                background: "var(--creme)",
                transition: "border-color 0.15s",
              }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--azul-medio)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--cinza-borda)"}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--grafite)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                border: "1.5px solid var(--cinza-borda)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 14,
                fontFamily: "var(--sans)",
                outline: "none",
                boxSizing: "border-box",
                color: "var(--grafite)",
                background: "var(--creme)",
                transition: "border-color 0.15s",
              }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--azul-medio)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--cinza-borda)"}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "#93a3b8" : "linear-gradient(135deg, var(--azul-profundo), var(--azul-medio))",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "var(--sans)",
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.03em",
              boxShadow: loading ? "none" : "var(--shadow-md)",
              transition: "opacity 0.15s",
              marginTop: 4,
            }}
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>

          <p style={{ textAlign: "center", marginTop: 4 }}>
            <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--cinza-texto)", textDecoration: "none" }}>
              Esqueci minha senha
            </Link>
          </p>
        </form>
      </div>

      {/* Rodapé */}
      <p style={{
        marginTop: 28,
        fontSize: 11,
        color: "rgba(255,255,255,0.35)",
        fontFamily: "var(--sans)",
        letterSpacing: "0.06em",
        position: "relative",
        zIndex: 1,
      }}>
        POLÍCIA MILITAR DO ESTADO DE PERNAMBUCO
      </p>
    </div>
  )
}
